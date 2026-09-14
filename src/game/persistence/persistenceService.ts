import {
  STORAGE_KEY,
  DEFAULT_MAX_PHASES,
  SELECTION_MAX_PHASES,
  CURRENT_SCHEMA_VERSION,
} from "./constants";
import { createSafeStorage } from "./storageAdapter";
import type {
  GameSaveSchema,
  PhaseRecord,
  PhaseScoreData,
  ProtocolProgress,
  SaveOperationResult,
  StorageAdapter,
  SupportedProtocol,
} from "./types";
import { createDefaultSaveData } from "./types";
import { validateAndMigrateSaveData } from "./validation";

function isStorageAdapter(obj: unknown): obj is StorageAdapter {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "getItem" in obj &&
    typeof (obj as StorageAdapter).getItem === "function"
  );
}

/**
 * Carrega e valida o progresso persistente a partir do storage.
 * Retorna estado padrão seguro e resiliente em caso de ausência, corrupção ou exceções.
 */
export function loadGameProgress(
  storage?: StorageAdapter,
  bubbleMaxPhases: number = DEFAULT_MAX_PHASES,
  selectionMaxPhases: number = SELECTION_MAX_PHASES
): GameSaveSchema {
  const safeStorage = storage ?? createSafeStorage();

  try {
    const raw = safeStorage.getItem(STORAGE_KEY);
    if (!raw || typeof raw !== "string" || raw.trim().length === 0) {
      return createDefaultSaveData(bubbleMaxPhases, selectionMaxPhases);
    }

    const parsed: unknown = JSON.parse(raw);
    return validateAndMigrateSaveData(
      parsed,
      bubbleMaxPhases,
      selectionMaxPhases
    );
  } catch (err) {
    console.warn(
      "[Persistence] Falha ao processar dados de save do storage:",
      err instanceof Error ? err.message : String(err)
    );
    return createDefaultSaveData(bubbleMaxPhases, selectionMaxPhases);
  }
}

/**
 * Grava o progresso do jogador de forma segura e encapsulada.
 */
export function saveGameProgress(
  data: GameSaveSchema,
  storage?: StorageAdapter,
  bubbleMaxPhases: number = DEFAULT_MAX_PHASES,
  selectionMaxPhases: number = SELECTION_MAX_PHASES
): SaveOperationResult {
  const safeStorage = storage ?? createSafeStorage();

  try {
    const validated = validateAndMigrateSaveData(
      data,
      bubbleMaxPhases,
      selectionMaxPhases
    );
    const serialized = JSON.stringify(validated);
    safeStorage.setItem(STORAGE_KEY, serialized);
    return { success: true, fallbackUsed: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("[Persistence] Erro ao gravar dados de save:", message);
    return { success: false, fallbackUsed: true, error: message };
  }
}

/**
 * Atualiza o progresso persistente após a conclusão com sucesso de uma fase para o protocolo especificado.
 * Suporta assinatura explícita multi-protocolo e assinatura legada (Bubble implícito).
 * Garante que:
 * 1. O progresso de cada protocolo seja estritamente isolado (Bubble não colide com Selection);
 * 2. O desbloqueio nunca ultrapasse maxPhases do protocolo correspondente;
 * 3. O progresso nunca sofra regressão ao rejogar fases anteriores;
 * 4. Recordes de pontuação sejam atualizados sob a regra canônica (ADR 0007 / ADR 0015):
 *    - newScore > bestScore; OU
 *    - newScore === bestScore E newErrors < bestScoreErrors;
 *    - Tempo NUNCA desempata nem incentiva pressa;
 * 5. O salvamento em storage seja executado imediatamente.
 */
export function recordPhaseCompletion(
  current: GameSaveSchema,
  protocol: SupportedProtocol,
  completedPhase: number,
  maxPhases?: number,
  storage?: StorageAdapter,
  scoreData?: PhaseScoreData
): GameSaveSchema;
export function recordPhaseCompletion(
  current: GameSaveSchema,
  completedPhase: number,
  maxPhases?: number,
  storage?: StorageAdapter,
  scoreData?: PhaseScoreData
): GameSaveSchema;
export function recordPhaseCompletion(
  current: GameSaveSchema,
  protocolOrPhase: SupportedProtocol | number,
  completedPhaseOrMax?: number,
  maxPhasesOrStorage?: number | StorageAdapter,
  storageOrScoreData?: StorageAdapter | PhaseScoreData,
  scoreDataParam?: PhaseScoreData
): GameSaveSchema {
  let protocol: SupportedProtocol = "bubble";
  let completedPhase: number;
  let maxPhases: number = DEFAULT_MAX_PHASES;
  let storage: StorageAdapter | undefined = undefined;
  let scoreData: PhaseScoreData | undefined = undefined;

  if (typeof protocolOrPhase === "string") {
    protocol = protocolOrPhase;
    completedPhase = completedPhaseOrMax as number;
    if (typeof maxPhasesOrStorage === "number") {
      maxPhases = maxPhasesOrStorage;
      if (isStorageAdapter(storageOrScoreData)) {
        storage = storageOrScoreData;
        scoreData = scoreDataParam;
      } else if (
        storageOrScoreData &&
        typeof storageOrScoreData === "object" &&
        "score" in storageOrScoreData
      ) {
        scoreData = storageOrScoreData as PhaseScoreData;
      } else {
        scoreData = scoreDataParam;
      }
    } else if (isStorageAdapter(maxPhasesOrStorage)) {
      storage = maxPhasesOrStorage;
      if (
        storageOrScoreData &&
        typeof storageOrScoreData === "object" &&
        "score" in storageOrScoreData
      ) {
        scoreData = storageOrScoreData as PhaseScoreData;
      }
    } else if (
      maxPhasesOrStorage &&
      typeof maxPhasesOrStorage === "object" &&
      "score" in maxPhasesOrStorage
    ) {
      scoreData = maxPhasesOrStorage as PhaseScoreData;
    }
  } else {
    protocol = "bubble";
    completedPhase = protocolOrPhase;
    maxPhases =
      typeof completedPhaseOrMax === "number"
        ? completedPhaseOrMax
        : DEFAULT_MAX_PHASES;
    storage = isStorageAdapter(maxPhasesOrStorage)
      ? maxPhasesOrStorage
      : undefined;
    scoreData = !isStorageAdapter(storageOrScoreData)
      ? storageOrScoreData
      : undefined;
  }

  const currentProtocol = current.protocols[protocol];

  // Próxima fase elegível para desbloqueio
  const nextTarget = completedPhase < maxPhases ? completedPhase + 1 : maxPhases;
  const nextUnlocked = Math.min(
    maxPhases,
    Math.max(currentProtocol.unlockedPhases, nextTarget)
  );
  const nextHighest = Math.min(
    maxPhases,
    Math.max(currentProtocol.highestPhaseReached, nextUnlocked)
  );

  const existing = currentProtocol.records[completedPhase];
  let bestScore = existing?.bestScore;
  let bestScoreErrors = existing?.bestScoreErrors;
  let bestScoreHintsUsed = existing?.bestScoreHintsUsed;
  let bestScoreElapsedTimeMs = existing?.bestScoreElapsedTimeMs;

  if (scoreData) {
    const isFirstScore = bestScore === undefined;
    const isHigherScore = bestScore !== undefined && scoreData.score > bestScore;
    const isTieWithFewerErrors =
      bestScore !== undefined &&
      scoreData.score === bestScore &&
      scoreData.errors < (bestScoreErrors ?? Infinity);

    if (isFirstScore || isHigherScore || isTieWithFewerErrors) {
      bestScore = scoreData.score;
      bestScoreErrors = scoreData.errors;
      bestScoreHintsUsed = scoreData.hintsUsed;
      bestScoreElapsedTimeMs = scoreData.elapsedTimeMs;
    }
  }

  const updatedRecord: PhaseRecord = Object.freeze({
    completed: true,
    completedAt: new Date().toISOString(),
    ...(bestScore !== undefined ? { bestScore } : {}),
    ...(bestScoreErrors !== undefined ? { bestScoreErrors } : {}),
    ...(bestScoreHintsUsed !== undefined ? { bestScoreHintsUsed } : {}),
    ...(bestScoreElapsedTimeMs !== undefined ? { bestScoreElapsedTimeMs } : {}),
  });

  const updatedRecords = Object.freeze({
    ...currentProtocol.records,
    [completedPhase]: updatedRecord,
  });

  const updatedProtocol: ProtocolProgress = Object.freeze({
    unlockedPhases: nextUnlocked,
    highestPhaseReached: nextHighest,
    hasCompletedTutorial: true,
    records: updatedRecords,
  });

  const updatedProtocols = Object.freeze({
    ...current.protocols,
    [protocol]: updatedProtocol,
  });

  const updatedBubble = updatedProtocols.bubble;

  const updatedState: GameSaveSchema = Object.freeze({
    schemaVersion: CURRENT_SCHEMA_VERSION,
    lastUpdated: new Date().toISOString(),
    protocols: updatedProtocols,
    preferences: current.preferences,
    campaign: updatedBubble,
    records: updatedBubble.records,
  });

  saveGameProgress(updatedState, storage);
  return updatedState;
}

/**
 * Registra a conclusão do tutorial para o protocolo especificado.
 * Suporta assinatura multi-protocolo e assinatura legada.
 */
export function recordTutorialCompletion(
  current: GameSaveSchema,
  protocol: SupportedProtocol,
  storage?: StorageAdapter,
  maxPhases?: number
): GameSaveSchema;
export function recordTutorialCompletion(
  current: GameSaveSchema,
  storage?: StorageAdapter,
  maxPhases?: number
): GameSaveSchema;
export function recordTutorialCompletion(
  current: GameSaveSchema,
  protocolOrStorage?: SupportedProtocol | StorageAdapter,
  storageOrMax?: StorageAdapter | number,
  maxPhasesParam?: number
): GameSaveSchema {
  let protocol: SupportedProtocol = "bubble";
  let storage: StorageAdapter | undefined = undefined;

  if (typeof protocolOrStorage === "string") {
    protocol = protocolOrStorage;
    storage = isStorageAdapter(storageOrMax) ? storageOrMax : undefined;
  } else {
    protocol = "bubble";
    storage = isStorageAdapter(protocolOrStorage) ? protocolOrStorage : undefined;
  }

  if (current.protocols[protocol].hasCompletedTutorial) {
    return current;
  }

  const updatedProtocol: ProtocolProgress = Object.freeze({
    ...current.protocols[protocol],
    hasCompletedTutorial: true,
  });

  const updatedProtocols = Object.freeze({
    ...current.protocols,
    [protocol]: updatedProtocol,
  });

  const updatedBubble = updatedProtocols.bubble;

  const updatedState: GameSaveSchema = Object.freeze({
    schemaVersion: CURRENT_SCHEMA_VERSION,
    lastUpdated: new Date().toISOString(),
    protocols: updatedProtocols,
    preferences: current.preferences,
    campaign: updatedBubble,
    records: updatedBubble.records,
  });

  saveGameProgress(updatedState, storage);
  return updatedState;
}

/**
 * Retorna o progresso persistente de um protocolo individual.
 */
export function getProtocolProgress(
  saveData: GameSaveSchema,
  protocol: SupportedProtocol
): ProtocolProgress {
  return saveData.protocols[protocol];
}

/**
 * Remove os dados persistidos do storage e retorna o estado padrão.
 * Operação puramente de manutenção/testes.
 */
export function clearGameProgress(
  storage?: StorageAdapter,
  bubbleMaxPhases: number = DEFAULT_MAX_PHASES,
  selectionMaxPhases: number = SELECTION_MAX_PHASES
): GameSaveSchema {
  const safeStorage = storage ?? createSafeStorage();
  try {
    if (typeof safeStorage.removeItem === "function") {
      safeStorage.removeItem(STORAGE_KEY);
    }
  } catch (err) {
    console.warn("[Persistence] Falha ao limpar storage:", err);
  }
  return createDefaultSaveData(bubbleMaxPhases, selectionMaxPhases);
}

/**
 * Determina se o Modo Desafio (Variante Bubble Sort Early Exit) está desbloqueado
 * com base estritamente no progresso factual da campanha principal do Bubble Sort.
 * Não altera nem cria nenhum dado adicional no storage.
 */
export function isChallengeModeUnlocked(
  saveData: GameSaveSchema,
  maxPhases: number = DEFAULT_MAX_PHASES
): boolean {
  return Boolean(saveData.protocols.bubble.records[maxPhases]?.completed);
}

/**
 * Determina a tela inicial e a fase ao clicar em 'INICIAR TURNO' na Home ou no Briefing.
 *
 * Semântica estrita:
 * - highestPhaseReached e unlockedPhases representam PROGRESSO e DESBLOQUEIO da campanha histórica;
 * - A fase ativa da sessão representa a rodada atual de jogo e SEMPRE inicia em 1;
 * - Se o operador ainda não concluiu o tutorial do protocolo, ele é direcionado primeiro à tela de tutorial;
 * - Se o tutorial já foi concluído, ele é direcionado diretamente à esteira da Fase 1.
 */
export function getInitialSessionRoute(
  saveData: GameSaveSchema,
  protocol: SupportedProtocol = "bubble"
): {
  screen: "tutorial" | "game" | "selection-tutorial" | "selection-game";
  phase: number;
} {
  const protocolProgress = saveData.protocols[protocol];
  const hasTutorial = protocolProgress?.hasCompletedTutorial ?? false;

  if (protocol === "selection") {
    return {
      screen: hasTutorial ? "selection-game" : "selection-tutorial",
      phase: 1,
    };
  }

  return {
    screen: hasTutorial ? "game" : "tutorial",
    phase: 1,
  };
}


