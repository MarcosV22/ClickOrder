import {
  STORAGE_KEY,
  LEGACY_STORAGE_KEY,
  DEFAULT_MAX_PHASES,
  SELECTION_MAX_PHASES,
  CURRENT_SCHEMA_VERSION,
  BUBBLE_EXERCISE_SETS,
  SELECTION_EXERCISE_SETS,
  INSERTION_EXERCISE_SETS,
} from "./constants";
import { createSafeStorage } from "./storageAdapter";
import type {
  GameSaveSchemaV4,
  ExerciseRecordV4,
  ExerciseSetProgressV4,
  ModuleProgressV4,
  ModuleId,
  PhaseRecord,
  PhaseScoreData,
  ProtocolProgress,
  SaveOperationResult,
  StorageAdapter,
  SupportedProtocol,
} from "./types";
import { createDefaultModuleProgress, createDefaultSaveData } from "./types";
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
 * Suporta leitura da chave estável canônica com fallback automático para chave legada.
 * Retorna estado padrão seguro e resiliente no Schema v4 em caso de ausência ou corrupção.
 */
export function loadGameProgress(
  storage?: StorageAdapter,
  bubbleMaxPhases: number = DEFAULT_MAX_PHASES,
  selectionMaxPhases: number = SELECTION_MAX_PHASES
): GameSaveSchemaV4 {
  const safeStorage = storage ?? createSafeStorage();

  try {
    let raw = safeStorage.getItem(STORAGE_KEY);
    if (!raw || typeof raw !== "string" || raw.trim().length === 0) {
      // Fallback para chave legada (v1/v2/v3)
      raw = safeStorage.getItem(LEGACY_STORAGE_KEY);
    }

    if (!raw || typeof raw !== "string" || raw.trim().length === 0) {
      return createDefaultSaveData();
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
    return createDefaultSaveData();
  }
}

/**
 * Grava o progresso do jogador de forma segura e encapsulada na chave canônica estável.
 */
export function saveGameProgress(
  data: GameSaveSchemaV4,
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
 * Avaliador puro da Política Canônica de Recordes (ADR 0007 / ADR 0015 / ADR 0021):
 * 1. Maior score vence;
 * 2. Em caso de empate de score: MENOS erros vence;
 * 3. Tempo NUNCA desempata (permanece o recorde anterior se score e erros forem iguais);
 * 4. Deslocamentos, comparações, swaps ou inserções não desempatam.
 */
export function shouldUpdateRecord(
  current?: ExerciseRecordV4,
  newScoreData?: PhaseScoreData
): boolean {
  if (!newScoreData) {
    return false;
  }
  if (!current) {
    return true;
  }
  if (newScoreData.score > current.bestScore) {
    return true;
  }
  if (
    newScoreData.score === current.bestScore &&
    newScoreData.errors < current.bestScoreErrors
  ) {
    return true;
  }
  return false;
}

// ============================================================================
// API Canônica de Progresso Schema v4 (Pure Queries)
// ============================================================================

/**
 * Retorna o bloco de progresso de um módulo no Schema v4.
 */
export function getModuleProgress(
  saveData: GameSaveSchemaV4,
  moduleId: ModuleId
): ModuleProgressV4 {
  return saveData.modules[moduleId] ?? createDefaultModuleProgress();
}

/**
 * Retorna o progresso de um ExerciseSet específico.
 */
export function getExerciseSetProgress(
  saveData: GameSaveSchemaV4,
  moduleId: ModuleId,
  exerciseSetId: string
): ExerciseSetProgressV4 | undefined {
  return saveData.modules[moduleId]?.exerciseSets[exerciseSetId];
}

/**
 * Informa se um ExerciseSet específico foi concluído factualmente.
 */
export function isExerciseSetCompleted(
  saveData: GameSaveSchemaV4,
  moduleId: ModuleId,
  exerciseSetId: string
): boolean {
  return Boolean(saveData.modules[moduleId]?.exerciseSets[exerciseSetId]?.completed);
}

/**
 * Retorna o recorde de melhor execução de um ExerciseSet, se houver.
 */
export function getBestExerciseRecord(
  saveData: GameSaveSchemaV4,
  moduleId: ModuleId,
  exerciseSetId: string
): ExerciseRecordV4 | undefined {
  return saveData.modules[moduleId]?.exerciseSets[exerciseSetId]?.bestRecord;
}

/**
 * Informa se o tutorial do módulo já foi concluído.
 */
export function isModuleTutorialCompleted(
  saveData: GameSaveSchemaV4,
  moduleId: ModuleId | SupportedProtocol
): boolean {
  return Boolean(saveData.modules[moduleId as ModuleId]?.completedTutorial);
}

/**
 * Derivação pura de desbloqueio de um ExerciseSet.
 *
 * Regras:
 * - Insertion:
 *   - Basic: sempre desbloqueado;
 *   - Intermediate: desbloqueado se Basic completed;
 *   - Advanced: desbloqueado se Intermediate completed.
 * - Bubble:
 *   - Basic: sempre desbloqueado;
 *   - Intermediate: desbloqueado se Basic completed;
 *   - Advanced: desbloqueado se Intermediate completed;
 *   - Early Exit Challenge: desbloqueado se Advanced completed.
 * - Selection:
 *   - Basic: sempre desbloqueado;
 *   - Intermediate: desbloqueado se Basic completed;
 *   - Advanced: desbloqueado se Intermediate completed.
 */
export function isExerciseSetUnlocked(
  saveData: GameSaveSchemaV4,
  moduleId: ModuleId,
  exerciseSetId: string
): boolean {
  if (moduleId === "insertion") {
    if (exerciseSetId === INSERTION_EXERCISE_SETS.BASIC) return true;
    if (exerciseSetId === INSERTION_EXERCISE_SETS.INTERMEDIATE) {
      return isExerciseSetCompleted(saveData, "insertion", INSERTION_EXERCISE_SETS.BASIC);
    }
    if (exerciseSetId === INSERTION_EXERCISE_SETS.ADVANCED) {
      return isExerciseSetCompleted(saveData, "insertion", INSERTION_EXERCISE_SETS.INTERMEDIATE);
    }
    return false;
  }

  if (moduleId === "bubble") {
    if (exerciseSetId === BUBBLE_EXERCISE_SETS.BASIC) return true;
    if (exerciseSetId === BUBBLE_EXERCISE_SETS.INTERMEDIATE) {
      return isExerciseSetCompleted(saveData, "bubble", BUBBLE_EXERCISE_SETS.BASIC);
    }
    if (exerciseSetId === BUBBLE_EXERCISE_SETS.ADVANCED) {
      return isExerciseSetCompleted(saveData, "bubble", BUBBLE_EXERCISE_SETS.INTERMEDIATE);
    }
    if (exerciseSetId === BUBBLE_EXERCISE_SETS.CHALLENGE_EARLY_EXIT) {
      return isExerciseSetCompleted(saveData, "bubble", BUBBLE_EXERCISE_SETS.ADVANCED);
    }
    return false;
  }

  if (moduleId === "selection") {
    if (exerciseSetId === SELECTION_EXERCISE_SETS.BASIC) return true;
    if (exerciseSetId === SELECTION_EXERCISE_SETS.INTERMEDIATE) {
      return isExerciseSetCompleted(saveData, "selection", SELECTION_EXERCISE_SETS.BASIC);
    }
    if (exerciseSetId === SELECTION_EXERCISE_SETS.ADVANCED) {
      return isExerciseSetCompleted(saveData, "selection", SELECTION_EXERCISE_SETS.INTERMEDIATE);
    }
    return false;
  }

  return false;
}

/**
 * Informa se o conjunto regular de práticas curriculares do módulo está 100% concluído.
 */
export function isModuleRegularPracticeCompleted(
  saveData: GameSaveSchemaV4,
  moduleId: ModuleId
): boolean {
  if (moduleId === "insertion") {
    return (
      isExerciseSetCompleted(saveData, "insertion", INSERTION_EXERCISE_SETS.BASIC) &&
      isExerciseSetCompleted(saveData, "insertion", INSERTION_EXERCISE_SETS.INTERMEDIATE) &&
      isExerciseSetCompleted(saveData, "insertion", INSERTION_EXERCISE_SETS.ADVANCED)
    );
  }
  if (moduleId === "bubble") {
    return (
      isExerciseSetCompleted(saveData, "bubble", BUBBLE_EXERCISE_SETS.BASIC) &&
      isExerciseSetCompleted(saveData, "bubble", BUBBLE_EXERCISE_SETS.INTERMEDIATE) &&
      isExerciseSetCompleted(saveData, "bubble", BUBBLE_EXERCISE_SETS.ADVANCED)
    );
  }
  if (moduleId === "selection") {
    return (
      isExerciseSetCompleted(saveData, "selection", SELECTION_EXERCISE_SETS.BASIC) &&
      isExerciseSetCompleted(saveData, "selection", SELECTION_EXERCISE_SETS.INTERMEDIATE) &&
      isExerciseSetCompleted(saveData, "selection", SELECTION_EXERCISE_SETS.ADVANCED)
    );
  }
  return false;
}

/**
 * Determina se o Modo Desafio (Bubble Sort Early Exit) está desbloqueado.
 * Derivado estritamente da conclusão da Prática Avançada do Bubble Sort.
 */
export function isChallengeModeUnlocked(
  saveData: GameSaveSchemaV4,
  _maxPhases: number = DEFAULT_MAX_PHASES
): boolean {
  return isExerciseSetCompleted(saveData, "bubble", BUBBLE_EXERCISE_SETS.ADVANCED);
}

// ============================================================================
// Mutações Canônicas de Progresso Schema v4
// ============================================================================

/**
 * Registra a conclusão de um conjunto de exercícios no Schema v4.
 * Aplica a política canônica de recordes e persiste imediatamente.
 */
export function recordExerciseCompletion(
  current: GameSaveSchemaV4,
  moduleId: ModuleId,
  exerciseSetId: string,
  scoreData?: PhaseScoreData,
  storage?: StorageAdapter
): GameSaveSchemaV4 {
  const currentModule = getModuleProgress(current, moduleId);
  const existingSet = currentModule.exerciseSets[exerciseSetId];

  let bestRecord = existingSet?.bestRecord;
  if (shouldUpdateRecord(bestRecord, scoreData) && scoreData) {
    bestRecord = Object.freeze({
      completedAt: new Date().toISOString(),
      bestScore: Math.min(Math.max(Math.floor(scoreData.score), 0), 100),
      bestScoreErrors: Math.max(0, Math.floor(scoreData.errors)),
      bestScoreHintsUsed: Math.max(0, Math.floor(scoreData.hintsUsed)),
      ...(scoreData.elapsedTimeMs !== undefined
        ? { bestScoreElapsedTimeMs: Math.max(0, Math.floor(scoreData.elapsedTimeMs)) }
        : {}),
    });
  }

  const updatedSet: ExerciseSetProgressV4 = Object.freeze({
    completed: true,
    ...(bestRecord ? { bestRecord } : {}),
  });

  const updatedExerciseSets = Object.freeze({
    ...currentModule.exerciseSets,
    [exerciseSetId]: updatedSet,
  });

  const updatedModule: ModuleProgressV4 = Object.freeze({
    ...currentModule,
    completedTutorial: true,
    exerciseSets: updatedExerciseSets,
  });

  const updatedModules = Object.freeze({
    ...current.modules,
    [moduleId]: updatedModule,
  });

  const updatedState: GameSaveSchemaV4 = Object.freeze({
    schemaVersion: 4 as const,
    lastUpdated: new Date().toISOString(),
    preferences: current.preferences,
    modules: updatedModules,
  });

  saveGameProgress(updatedState, storage);
  return updatedState;
}

/**
 * Registra a conclusão do tutorial de um módulo no Schema v4.
 */
export function recordTutorialCompletion(
  current: GameSaveSchemaV4,
  moduleOrStorage?: ModuleId | SupportedProtocol | StorageAdapter,
  storageOrMax?: StorageAdapter | number,
  _maxPhasesParam?: number
): GameSaveSchemaV4 {
  let moduleId: ModuleId = "bubble";
  let storage: StorageAdapter | undefined = undefined;

  if (typeof moduleOrStorage === "string") {
    moduleId = moduleOrStorage as ModuleId;
    storage = isStorageAdapter(storageOrMax) ? storageOrMax : undefined;
  } else {
    moduleId = "bubble";
    storage = isStorageAdapter(moduleOrStorage) ? moduleOrStorage : undefined;
  }

  const currentModule = getModuleProgress(current, moduleId);
  if (currentModule.completedTutorial) {
    return current;
  }

  const updatedModule: ModuleProgressV4 = Object.freeze({
    ...currentModule,
    completedTutorial: true,
  });

  const updatedModules = Object.freeze({
    ...current.modules,
    [moduleId]: updatedModule,
  });

  const updatedState: GameSaveSchemaV4 = Object.freeze({
    schemaVersion: 4 as const,
    lastUpdated: new Date().toISOString(),
    preferences: current.preferences,
    modules: updatedModules,
  });

  saveGameProgress(updatedState, storage);
  return updatedState;
}

// ============================================================================
// Adaptadores de Retrocompatibilidade para Bubble e Selection
// ============================================================================

function mapPhaseToExerciseSetId(
  protocol: SupportedProtocol,
  phase: number
): string {
  if (protocol === "bubble") {
    if (phase === 1) return BUBBLE_EXERCISE_SETS.BASIC;
    if (phase === 2) return BUBBLE_EXERCISE_SETS.INTERMEDIATE;
    if (phase === 3) return BUBBLE_EXERCISE_SETS.ADVANCED;
    if (phase === 4) return BUBBLE_EXERCISE_SETS.CHALLENGE_EARLY_EXIT;
    return BUBBLE_EXERCISE_SETS.BASIC;
  }

  if (protocol === "selection") {
    if (phase === 1) return SELECTION_EXERCISE_SETS.BASIC;
    if (phase === 2) return SELECTION_EXERCISE_SETS.INTERMEDIATE;
    if (phase === 3) return SELECTION_EXERCISE_SETS.ADVANCED;
    return SELECTION_EXERCISE_SETS.BASIC;
  }

  return `${protocol}.practice.${phase}`;
}

/**
 * Adaptador de compatibilidade: converte fase legada (1..3) para ExerciseSetId e grava em v4.
 */
export function recordPhaseCompletion(
  current: GameSaveSchemaV4,
  protocol: SupportedProtocol,
  completedPhase: number,
  maxPhases?: number,
  storage?: StorageAdapter,
  scoreData?: PhaseScoreData
): GameSaveSchemaV4;
export function recordPhaseCompletion(
  current: GameSaveSchemaV4,
  completedPhase: number,
  maxPhases?: number,
  storage?: StorageAdapter,
  scoreData?: PhaseScoreData
): GameSaveSchemaV4;
export function recordPhaseCompletion(
  current: GameSaveSchemaV4,
  protocolOrPhase: SupportedProtocol | number,
  completedPhaseOrMax?: number,
  maxPhasesOrStorage?: number | StorageAdapter,
  storageOrScoreData?: StorageAdapter | PhaseScoreData,
  scoreDataParam?: PhaseScoreData
): GameSaveSchemaV4 {
  let protocol: SupportedProtocol = "bubble";
  let completedPhase: number;
  let storage: StorageAdapter | undefined = undefined;
  let scoreData: PhaseScoreData | undefined = undefined;

  if (typeof protocolOrPhase === "string") {
    protocol = protocolOrPhase;
    completedPhase = completedPhaseOrMax as number;
    if (typeof maxPhasesOrStorage === "number") {
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
    storage = isStorageAdapter(maxPhasesOrStorage)
      ? maxPhasesOrStorage
      : undefined;
    scoreData = !isStorageAdapter(storageOrScoreData)
      ? storageOrScoreData
      : undefined;
  }

  const exerciseSetId = mapPhaseToExerciseSetId(protocol, completedPhase);
  return recordExerciseCompletion(current, protocol, exerciseSetId, scoreData, storage);
}

/**
 * Retorna uma visão adaptada (ProtocolProgress) para o protocolo solicitado,
 * calculada dinamicamente a partir dos ExerciseSets do Schema v4.
 */
export function getProtocolProgress(
  saveData: GameSaveSchemaV4,
  protocol: SupportedProtocol
): ProtocolProgress {
  const mod = getModuleProgress(saveData, protocol);
  const sets = mod.exerciseSets;

  const basicId = protocol === "bubble" ? BUBBLE_EXERCISE_SETS.BASIC : SELECTION_EXERCISE_SETS.BASIC;
  const interId = protocol === "bubble" ? BUBBLE_EXERCISE_SETS.INTERMEDIATE : SELECTION_EXERCISE_SETS.INTERMEDIATE;
  const advId = protocol === "bubble" ? BUBBLE_EXERCISE_SETS.ADVANCED : SELECTION_EXERCISE_SETS.ADVANCED;

  const records: Record<number, PhaseRecord> = {};

  if (sets[basicId]?.completed) {
    const br = sets[basicId]?.bestRecord;
    records[1] = Object.freeze({
      completed: true,
      completedAt: br?.completedAt ?? new Date().toISOString(),
      ...(br?.bestScore !== undefined ? { bestScore: br.bestScore } : {}),
      ...(br?.bestScoreErrors !== undefined ? { bestScoreErrors: br.bestScoreErrors } : {}),
      ...(br?.bestScoreHintsUsed !== undefined ? { bestScoreHintsUsed: br.bestScoreHintsUsed } : {}),
      ...(br?.bestScoreElapsedTimeMs !== undefined ? { bestScoreElapsedTimeMs: br.bestScoreElapsedTimeMs } : {}),
    });
  }

  if (sets[interId]?.completed) {
    const br = sets[interId]?.bestRecord;
    records[2] = Object.freeze({
      completed: true,
      completedAt: br?.completedAt ?? new Date().toISOString(),
      ...(br?.bestScore !== undefined ? { bestScore: br.bestScore } : {}),
      ...(br?.bestScoreErrors !== undefined ? { bestScoreErrors: br.bestScoreErrors } : {}),
      ...(br?.bestScoreHintsUsed !== undefined ? { bestScoreHintsUsed: br.bestScoreHintsUsed } : {}),
      ...(br?.bestScoreElapsedTimeMs !== undefined ? { bestScoreElapsedTimeMs: br.bestScoreElapsedTimeMs } : {}),
    });
  }

  if (sets[advId]?.completed) {
    const br = sets[advId]?.bestRecord;
    records[3] = Object.freeze({
      completed: true,
      completedAt: br?.completedAt ?? new Date().toISOString(),
      ...(br?.bestScore !== undefined ? { bestScore: br.bestScore } : {}),
      ...(br?.bestScoreErrors !== undefined ? { bestScoreErrors: br.bestScoreErrors } : {}),
      ...(br?.bestScoreHintsUsed !== undefined ? { bestScoreHintsUsed: br.bestScoreHintsUsed } : {}),
      ...(br?.bestScoreElapsedTimeMs !== undefined ? { bestScoreElapsedTimeMs: br.bestScoreElapsedTimeMs } : {}),
    });
  }

  let unlockedPhases = 1;
  if (sets[basicId]?.completed) unlockedPhases = 2;
  if (sets[interId]?.completed) unlockedPhases = 3;

  return Object.freeze({
    unlockedPhases,
    highestPhaseReached: unlockedPhases,
    hasCompletedTutorial: mod.completedTutorial,
    records: Object.freeze(records),
  });
}

/**
 * Remove os dados persistidos do storage (tanto na chave estável quanto na legada).
 */
export function clearGameProgress(
  storage?: StorageAdapter,
  _bubbleMaxPhases: number = DEFAULT_MAX_PHASES,
  _selectionMaxPhases: number = SELECTION_MAX_PHASES
): GameSaveSchemaV4 {
  const safeStorage = storage ?? createSafeStorage();
  try {
    if (typeof safeStorage.removeItem === "function") {
      safeStorage.removeItem(STORAGE_KEY);
      safeStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  } catch (err) {
    console.warn("[Persistence] Falha ao limpar storage:", err);
  }
  return createDefaultSaveData();
}

/**
 * Determina a tela inicial e a fase ao clicar em 'INICIAR TURNO' na Home ou no Briefing.
 */
export function getInitialSessionRoute(
  saveData: GameSaveSchemaV4,
  protocol: SupportedProtocol = "bubble"
): {
  screen: "tutorial" | "game" | "selection-tutorial" | "selection-game";
  phase: number;
} {
  const hasTutorial = isModuleTutorialCompleted(saveData, protocol);

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
