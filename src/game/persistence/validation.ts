import {
  CURRENT_SCHEMA_VERSION,
  DEFAULT_MAX_PHASES,
  SELECTION_MAX_PHASES,
  BUBBLE_EXERCISE_SETS,
  SELECTION_EXERCISE_SETS,
} from "./constants";
import {
  type GameSaveSchemaV4,
  type GameSaveSchemaV3,
  type PhaseRecord,
  type PreferencesSaveData,
  type ProtocolProgress,
  type ModuleId,
  type ModuleProgressV4,
  type ExerciseSetProgressV4,
  type ExerciseRecordV4,
  SUPPORTED_MODULE_IDS,
  createDefaultModuleProgress,
  createDefaultProtocolProgress,
  createDefaultSaveData,
} from "./types";

export function isRecordObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseClampedInt(
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

export function parseBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function parseIsoTimestamp(value: unknown): string {
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return value;
    }
  }
  return new Date().toISOString();
}

/**
 * Sanitiza defensivamente um conjunto de registros de fase legado (v1/v2/v3).
 */
export function sanitizePhaseRecords(
  rawRecords: unknown,
  maxPhases: number = DEFAULT_MAX_PHASES
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
 * Sanitiza o bloco de progresso de um protocolo individual legado (v3).
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
 */
export function migrateV2ToV3(
  raw: Record<string, unknown> | SchemaV2Data,
  bubbleMaxPhases: number = DEFAULT_MAX_PHASES,
  selectionMaxPhases: number = SELECTION_MAX_PHASES
): GameSaveSchemaV3 {
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
    schemaVersion: 3 as const,
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

function mapLegacyRecordToExerciseSet(
  record?: PhaseRecord
): ExerciseSetProgressV4 | undefined {
  if (!record || !record.completed) {
    return undefined;
  }

  let bestRecord: ExerciseRecordV4 | undefined = undefined;
  if (typeof record.bestScore === "number" && Number.isFinite(record.bestScore)) {
    bestRecord = Object.freeze({
      completedAt: parseIsoTimestamp(record.completedAt),
      bestScore: Math.min(Math.max(Math.floor(record.bestScore), 0), 100),
      bestScoreErrors:
        typeof record.bestScoreErrors === "number" &&
        Number.isFinite(record.bestScoreErrors)
          ? Math.max(0, Math.floor(record.bestScoreErrors))
          : 0,
      bestScoreHintsUsed:
        typeof record.bestScoreHintsUsed === "number" &&
        Number.isFinite(record.bestScoreHintsUsed)
          ? Math.max(0, Math.floor(record.bestScoreHintsUsed))
          : 0,
      bestScoreElapsedTimeMs:
        typeof record.bestScoreElapsedTimeMs === "number" &&
        Number.isFinite(record.bestScoreElapsedTimeMs)
          ? Math.max(0, Math.floor(record.bestScoreElapsedTimeMs))
          : undefined,
    });
  }

  return Object.freeze({
    completed: true,
    ...(bestRecord ? { bestRecord } : {}),
  });
}

/**
 * Migração explícita e isolada: Schema v3 -> Schema v4 Orientado a Módulos.
 *
 * Mapeamentos canônicos:
 * - Bubble Sort:
 *   - protocols.bubble.records[1] -> bubble.practice.basic
 *   - protocols.bubble.records[2] -> bubble.practice.intermediate
 *   - protocols.bubble.records[3] -> bubble.practice.advanced
 *   - protocols.bubble.records[4] -> bubble.challenge.early-exit
 *   - protocols.bubble.hasCompletedTutorial -> modules.bubble.completedTutorial
 * - Selection Sort:
 *   - protocols.selection.records[1] -> selection.practice.basic
 *   - protocols.selection.records[2] -> selection.practice.intermediate
 *   - protocols.selection.records[3] -> selection.practice.advanced
 *   - protocols.selection.hasCompletedTutorial -> modules.selection.completedTutorial
 * - Insertion Sort:
 *   - Inicializado limpo com completedTutorial: false e exerciseSets: {}
 * - Preferências:
 *   - Preservadas integralmente sem perdas.
 */
export function migrateV3ToV4(
  raw: Record<string, unknown> | GameSaveSchemaV3
): GameSaveSchemaV4 {
  const protocolsObj = isRecordObject(raw.protocols) ? raw.protocols : {};

  // Sanitiza Bubble legado
  const bubbleRaw = protocolsObj.bubble;
  const bubbleProgress = sanitizeProtocolProgress(bubbleRaw, DEFAULT_MAX_PHASES);

  const bubbleExerciseSets: Record<string, ExerciseSetProgressV4> = {};
  const bubbleBasic = mapLegacyRecordToExerciseSet(bubbleProgress.records[1]);
  if (bubbleBasic) bubbleExerciseSets[BUBBLE_EXERCISE_SETS.BASIC] = bubbleBasic;

  const bubbleInter = mapLegacyRecordToExerciseSet(bubbleProgress.records[2]);
  if (bubbleInter) bubbleExerciseSets[BUBBLE_EXERCISE_SETS.INTERMEDIATE] = bubbleInter;

  const bubbleAdv = mapLegacyRecordToExerciseSet(bubbleProgress.records[3]);
  if (bubbleAdv) bubbleExerciseSets[BUBBLE_EXERCISE_SETS.ADVANCED] = bubbleAdv;

  // Se houver registro legado de early-exit (armazenado em chave 4 em versões anteriores)
  const bubbleEarly = mapLegacyRecordToExerciseSet(bubbleProgress.records[4]);
  if (bubbleEarly) bubbleExerciseSets[BUBBLE_EXERCISE_SETS.CHALLENGE_EARLY_EXIT] = bubbleEarly;

  const bubbleModule: ModuleProgressV4 = Object.freeze({
    completedTutorial: bubbleProgress.hasCompletedTutorial,
    exerciseSets: Object.freeze(bubbleExerciseSets),
  });

  // Sanitiza Selection legado
  const selectionRaw = protocolsObj.selection;
  const selectionProgress = sanitizeProtocolProgress(selectionRaw, SELECTION_MAX_PHASES);

  const selectionExerciseSets: Record<string, ExerciseSetProgressV4> = {};
  const selBasic = mapLegacyRecordToExerciseSet(selectionProgress.records[1]);
  if (selBasic) selectionExerciseSets[SELECTION_EXERCISE_SETS.BASIC] = selBasic;

  const selInter = mapLegacyRecordToExerciseSet(selectionProgress.records[2]);
  if (selInter) selectionExerciseSets[SELECTION_EXERCISE_SETS.INTERMEDIATE] = selInter;

  const selAdv = mapLegacyRecordToExerciseSet(selectionProgress.records[3]);
  if (selAdv) selectionExerciseSets[SELECTION_EXERCISE_SETS.ADVANCED] = selAdv;

  const selectionModule: ModuleProgressV4 = Object.freeze({
    completedTutorial: selectionProgress.hasCompletedTutorial,
    exerciseSets: Object.freeze(selectionExerciseSets),
  });

  // Insertion inicializa limpo
  const insertionModule: ModuleProgressV4 = createDefaultModuleProgress();

  // Preferências
  const rawPreferences = isRecordObject(raw.preferences) ? raw.preferences : {};
  const preferences = Object.freeze({
    soundEnabled: parseBoolean(rawPreferences.soundEnabled, true),
    reducedMotion: parseBoolean(rawPreferences.reducedMotion, false),
    highContrast: parseBoolean(rawPreferences.highContrast, false),
  });

  const lastUpdated = parseIsoTimestamp(raw.lastUpdated);

  return Object.freeze({
    schemaVersion: 4 as const,
    lastUpdated,
    preferences,
    modules: Object.freeze({
      bubble: bubbleModule,
      selection: selectionModule,
      insertion: insertionModule,
    }),
  });
}

/**
 * Sanitiza defensivamente um estado nativo do Schema v4.
 * Valida tipos, limites e integridade sem suposições cegas.
 */
export function sanitizeSaveDataV4(raw: Record<string, unknown>): GameSaveSchemaV4 {
  const rawPreferences = isRecordObject(raw.preferences) ? raw.preferences : {};
  const preferences = Object.freeze({
    soundEnabled: parseBoolean(rawPreferences.soundEnabled, true),
    reducedMotion: parseBoolean(rawPreferences.reducedMotion, false),
    highContrast: parseBoolean(rawPreferences.highContrast, false),
  });

  const lastUpdated = parseIsoTimestamp(raw.lastUpdated);
  const rawModules = isRecordObject(raw.modules) ? raw.modules : {};

  const modules: Partial<Record<ModuleId, ModuleProgressV4>> = {};

  for (const modId of SUPPORTED_MODULE_IDS) {
    const rawMod = rawModules[modId];
    if (!isRecordObject(rawMod)) {
      // Cria estado limpo para os módulos ativos principais
      if (modId === "bubble" || modId === "selection" || modId === "insertion") {
        modules[modId] = createDefaultModuleProgress();
      }
      continue;
    }

    const completedTutorial = parseBoolean(rawMod.completedTutorial, false);
    const exerciseSets: Record<string, ExerciseSetProgressV4> = {};

    if (isRecordObject(rawMod.exerciseSets)) {
      for (const [exerciseId, rawSet] of Object.entries(rawMod.exerciseSets)) {
        if (!isRecordObject(rawSet)) continue;

        const completed = parseBoolean(rawSet.completed, false);
        let bestRecord: ExerciseRecordV4 | undefined = undefined;

        if (isRecordObject(rawSet.bestRecord)) {
          const br = rawSet.bestRecord;
          const hasScore = typeof br.bestScore === "number" && Number.isFinite(br.bestScore);
          if (hasScore) {
            const clampedScore = Math.min(Math.max(Math.floor(br.bestScore as number), 0), 100);
            const bestScoreErrors =
              typeof br.bestScoreErrors === "number" && Number.isFinite(br.bestScoreErrors)
                ? Math.max(0, Math.floor(br.bestScoreErrors))
                : 0;
            const bestScoreHintsUsed =
              typeof br.bestScoreHintsUsed === "number" && Number.isFinite(br.bestScoreHintsUsed)
                ? Math.max(0, Math.floor(br.bestScoreHintsUsed))
                : 0;
            const bestScoreElapsedTimeMs =
              typeof br.bestScoreElapsedTimeMs === "number" && Number.isFinite(br.bestScoreElapsedTimeMs)
                ? Math.max(0, Math.floor(br.bestScoreElapsedTimeMs))
                : undefined;

            bestRecord = Object.freeze({
              completedAt: parseIsoTimestamp(br.completedAt),
              bestScore: clampedScore,
              bestScoreErrors,
              bestScoreHintsUsed,
              ...(bestScoreElapsedTimeMs !== undefined ? { bestScoreElapsedTimeMs } : {}),
            });
          }
        }

        exerciseSets[exerciseId] = Object.freeze({
          completed,
          ...(bestRecord ? { bestRecord } : {}),
        });
      }
    }

    modules[modId] = Object.freeze({
      completedTutorial,
      exerciseSets: Object.freeze(exerciseSets),
    });
  }

  return Object.freeze({
    schemaVersion: 4 as const,
    lastUpdated,
    preferences,
    modules: Object.freeze(modules),
  });
}

/**
 * Validação defensiva pura e pipeline completo de migração:
 * v1 -> v2 -> v3 -> v4
 * v2 -> v3 -> v4
 * v3 -> v4
 * v4 -> sanitização nativa.
 * Descarte seguro de dados corrompidos ou schemas desconhecidos com fallback para clean install.
 */
export function validateAndMigrateSaveData(
  raw: unknown,
  bubbleMaxPhases: number = DEFAULT_MAX_PHASES,
  selectionMaxPhases: number = SELECTION_MAX_PHASES
): GameSaveSchemaV4 {
  if (!isRecordObject(raw)) {
    return createDefaultSaveData();
  }

  // Validação estrita de schemaVersion
  const version = typeof raw.schemaVersion === "number" ? raw.schemaVersion : null;
  if (version === null || version < 1) {
    return createDefaultSaveData();
  }

  // Se versão futura superior à atual: fallback seguro
  if (version > CURRENT_SCHEMA_VERSION) {
    console.warn(
      `[Persistence] Schema v${version} superior ao suportado (v${CURRENT_SCHEMA_VERSION}); redefinindo padrão.`
    );
    return createDefaultSaveData();
  }

  // Pipeline explícito:
  // Se for v1: v1 -> v2 -> v3 -> v4
  if (version === 1) {
    const v2Raw = migrateV1ToV2(raw, bubbleMaxPhases);
    const v3Raw = migrateV2ToV3(v2Raw, bubbleMaxPhases, selectionMaxPhases);
    return migrateV3ToV4(v3Raw);
  }

  // Se for v2: v2 -> v3 -> v4
  if (version === 2) {
    const v3Raw = migrateV2ToV3(raw, bubbleMaxPhases, selectionMaxPhases);
    return migrateV3ToV4(v3Raw);
  }

  // Se for v3: v3 -> v4
  if (version === 3) {
    return migrateV3ToV4(raw);
  }

  // Schema v4 nativo
  return sanitizeSaveDataV4(raw);
}
