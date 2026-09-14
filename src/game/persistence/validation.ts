import {
  CURRENT_SCHEMA_VERSION,
  DEFAULT_MAX_PHASES,
  SELECTION_MAX_PHASES,
} from "./constants";
import {
  type GameSaveSchema,
  type PhaseRecord,
  type PreferencesSaveData,
  type ProtocolProgress,
  createDefaultProtocolProgress,
  createDefaultSaveData,
} from "./types";

function isRecordObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseClampedInt(
  value: unknown,
  min: number,
  max: number,
  fallback: number
): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }
  const integer = Math.floor(value);
  return Math.min(Math.max(integer, min), max);
}

function parseBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function parseIsoTimestamp(value: unknown): string {
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return value;
    }
  }
  return new Date().toISOString();
}

/**
 * Sanitiza defensivamente um conjunto de registros de fase.
 */
export function sanitizePhaseRecords(
  rawRecords: unknown,
  maxPhases: number
): Record<number, PhaseRecord> {
  if (!isRecordObject(rawRecords)) {
    return Object.freeze({});
  }

  const sanitized: Record<number, PhaseRecord> = {};
  for (const [key, val] of Object.entries(rawRecords)) {
    const phaseIndex = Number(key);
    if (!Number.isInteger(phaseIndex) || phaseIndex < 1 || phaseIndex > maxPhases) {
      continue;
    }

    if (isRecordObject(val)) {
      const baseRecord = {
        completed: parseBoolean(val.completed, false),
        completedAt: parseIsoTimestamp(val.completedAt),
      };

      const hasValidBestScore =
        typeof val.bestScore === "number" && Number.isFinite(val.bestScore);
      if (hasValidBestScore) {
        const clampedScore = Math.min(
          Math.max(Math.floor(val.bestScore as number), 0),
          100
        );
        const bestScoreErrors =
          typeof val.bestScoreErrors === "number" &&
          Number.isFinite(val.bestScoreErrors)
            ? Math.max(0, Math.floor(val.bestScoreErrors))
            : 0;
        const bestScoreHintsUsed =
          typeof val.bestScoreHintsUsed === "number" &&
          Number.isFinite(val.bestScoreHintsUsed)
            ? Math.max(0, Math.floor(val.bestScoreHintsUsed))
            : 0;
        const bestScoreElapsedTimeMs =
          typeof val.bestScoreElapsedTimeMs === "number" &&
          Number.isFinite(val.bestScoreElapsedTimeMs)
            ? Math.max(0, Math.floor(val.bestScoreElapsedTimeMs))
            : undefined;

        sanitized[phaseIndex] = Object.freeze({
          ...baseRecord,
          bestScore: clampedScore,
          bestScoreErrors,
          bestScoreHintsUsed,
          ...(bestScoreElapsedTimeMs !== undefined
            ? { bestScoreElapsedTimeMs }
            : {}),
        });
      } else {
        sanitized[phaseIndex] = Object.freeze(baseRecord);
      }
    }
  }

  return Object.freeze(sanitized);
}

/**
 * Sanitiza o bloco de progresso de um protocolo individual.
 */
export function sanitizeProtocolProgress(
  raw: unknown,
  maxPhases: number = DEFAULT_MAX_PHASES
): ProtocolProgress {
  if (!isRecordObject(raw)) {
    return createDefaultProtocolProgress(maxPhases);
  }

  const unlockedPhases = parseClampedInt(raw.unlockedPhases, 1, maxPhases, 1);
  const highestPhaseReached = parseClampedInt(
    raw.highestPhaseReached,
    1,
    maxPhases,
    unlockedPhases
  );
  const hasCompletedTutorial = parseBoolean(
    raw.hasCompletedTutorial,
    unlockedPhases > 1
  );
  const records = sanitizePhaseRecords(raw.records, maxPhases);

  return Object.freeze({
    unlockedPhases,
    highestPhaseReached,
    hasCompletedTutorial,
    records,
  });
}

export interface SchemaV2Data {
  readonly [key: string]: unknown;
  readonly schemaVersion: 2;
  readonly lastUpdated: string;
  readonly campaign: {
    readonly unlockedPhases: number;
    readonly highestPhaseReached: number;
    readonly hasCompletedTutorial: boolean;
  };
  readonly records: Record<number, PhaseRecord>;
  readonly preferences: PreferencesSaveData;
}

/**
 * Migração explícita e isolada: Schema v1 -> Schema v2.
 * Preserva integralmente campanha, conclusões, preferências e timestamps.
 */
export function migrateV1ToV2(
  raw: Record<string, unknown>,
  maxPhases: number = DEFAULT_MAX_PHASES
): SchemaV2Data {
  const rawCampaign = isRecordObject(raw.campaign) ? raw.campaign : {};
  const unlockedPhases = parseClampedInt(rawCampaign.unlockedPhases, 1, maxPhases, 1);
  const highestPhaseReached = parseClampedInt(
    rawCampaign.highestPhaseReached,
    1,
    maxPhases,
    unlockedPhases
  );
  const hasCompletedTutorial = parseBoolean(
    rawCampaign.hasCompletedTutorial,
    unlockedPhases > 1
  );
  const records = sanitizePhaseRecords(raw.records, maxPhases);

  const rawPreferences = isRecordObject(raw.preferences) ? raw.preferences : {};
  const preferences = Object.freeze({
    soundEnabled: parseBoolean(rawPreferences.soundEnabled, true),
    reducedMotion: parseBoolean(rawPreferences.reducedMotion, false),
    highContrast: parseBoolean(rawPreferences.highContrast, false),
  });

  const lastUpdated = parseIsoTimestamp(raw.lastUpdated);

  return Object.freeze({
    schemaVersion: 2 as const,
    lastUpdated,
    campaign: Object.freeze({
      unlockedPhases,
      highestPhaseReached,
      hasCompletedTutorial,
    }),
    records,
    preferences,
  });
}

/**
 * Migração explícita e isolada: Schema v2 -> Schema v3 Multi-Protocolo.
 * Mapeia a campanha e recordes existentes para protocols.bubble.
 * Inicializa protocols.selection com o estado padrão limpo.
 */
export function migrateV2ToV3(
  raw: Record<string, unknown> | SchemaV2Data,
  bubbleMaxPhases: number = DEFAULT_MAX_PHASES,
  selectionMaxPhases: number = SELECTION_MAX_PHASES
): GameSaveSchema {
  const rawCampaign = isRecordObject(raw.campaign) ? raw.campaign : {};
  const bubbleUnlocked = parseClampedInt(
    rawCampaign.unlockedPhases,
    1,
    bubbleMaxPhases,
    1
  );
  const bubbleHighest = parseClampedInt(
    rawCampaign.highestPhaseReached,
    1,
    bubbleMaxPhases,
    bubbleUnlocked
  );
  const bubbleTutorial = parseBoolean(
    rawCampaign.hasCompletedTutorial,
    bubbleUnlocked > 1
  );
  const bubbleRecords = sanitizePhaseRecords(raw.records, bubbleMaxPhases);

  const bubbleProgress: ProtocolProgress = Object.freeze({
    unlockedPhases: bubbleUnlocked,
    highestPhaseReached: bubbleHighest,
    hasCompletedTutorial: bubbleTutorial,
    records: bubbleRecords,
  });

  const selectionProgress: ProtocolProgress =
    createDefaultProtocolProgress(selectionMaxPhases);

  const rawPreferences = isRecordObject(raw.preferences) ? raw.preferences : {};
  const preferences = Object.freeze({
    soundEnabled: parseBoolean(rawPreferences.soundEnabled, true),
    reducedMotion: parseBoolean(rawPreferences.reducedMotion, false),
    highContrast: parseBoolean(rawPreferences.highContrast, false),
  });

  const lastUpdated = parseIsoTimestamp(raw.lastUpdated);

  return Object.freeze({
    schemaVersion: 3,
    lastUpdated,
    protocols: Object.freeze({
      bubble: bubbleProgress,
      selection: selectionProgress,
    }),
    preferences,
    campaign: bubbleProgress,
    records: bubbleRecords,
  });
}

/**
 * Validação defensiva pura e sem suposições cegas de tipo para dados deserializados.
 * Descarte seguro de schemas desconhecidos, dados corrompidos ou tipos incompatíveis.
 * Realiza pipeline explícito de migração: v1 -> v2 -> v3 preservando integralmente o progresso.
 */
export function validateAndMigrateSaveData(
  raw: unknown,
  bubbleMaxPhases: number = DEFAULT_MAX_PHASES,
  selectionMaxPhases: number = SELECTION_MAX_PHASES
): GameSaveSchema {
  if (!isRecordObject(raw)) {
    return createDefaultSaveData(bubbleMaxPhases, selectionMaxPhases);
  }

  // Validação estrita do controle de versão do schema
  const version = typeof raw.schemaVersion === "number" ? raw.schemaVersion : null;
  if (version === null || version < 1) {
    return createDefaultSaveData(bubbleMaxPhases, selectionMaxPhases);
  }

  // Se for uma versão futura desconhecida pela versão atual do código:
  if (version > CURRENT_SCHEMA_VERSION) {
    console.warn(
      `[Persistence] Schema v${version} superior ao suportado (v${CURRENT_SCHEMA_VERSION}); redefinindo padrão.`
    );
    return createDefaultSaveData(bubbleMaxPhases, selectionMaxPhases);
  }

  // Pipeline explícito de migração:
  // Se for v1, executa v1 -> v2 -> v3
  if (version === 1) {
    const v2Raw = migrateV1ToV2(raw, bubbleMaxPhases);
    return migrateV2ToV3(v2Raw, bubbleMaxPhases, selectionMaxPhases);
  }

  // Se for v2, executa v2 -> v3
  if (version === 2) {
    return migrateV2ToV3(raw, bubbleMaxPhases, selectionMaxPhases);
  }

  // Schema v3 nativo: validação direta dos blocos de protocolo
  const protocolsObj = isRecordObject(raw.protocols) ? raw.protocols : null;
  let bubbleProgress: ProtocolProgress;
  let selectionProgress: ProtocolProgress;

  if (protocolsObj) {
    bubbleProgress = sanitizeProtocolProgress(
      protocolsObj.bubble,
      bubbleMaxPhases
    );
    selectionProgress = sanitizeProtocolProgress(
      protocolsObj.selection,
      selectionMaxPhases
    );
  } else {
    // Fallback de segurança: se raw.protocols estiver ausente, tenta converter campaign raiz
    const fallback = migrateV2ToV3(raw, bubbleMaxPhases, selectionMaxPhases);
    bubbleProgress = fallback.protocols.bubble;
    selectionProgress = fallback.protocols.selection;
  }

  const rawPreferences = isRecordObject(raw.preferences) ? raw.preferences : {};
  const preferences = Object.freeze({
    soundEnabled: parseBoolean(rawPreferences.soundEnabled, true),
    reducedMotion: parseBoolean(rawPreferences.reducedMotion, false),
    highContrast: parseBoolean(rawPreferences.highContrast, false),
  });

  const lastUpdated = parseIsoTimestamp(raw.lastUpdated);

  return Object.freeze({
    schemaVersion: CURRENT_SCHEMA_VERSION,
    lastUpdated,
    protocols: Object.freeze({
      bubble: bubbleProgress,
      selection: selectionProgress,
    }),
    preferences,
    campaign: bubbleProgress,
    records: bubbleProgress.records,
  });
}

