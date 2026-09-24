import {
  CURRENT_SCHEMA_VERSION,
  DEFAULT_MAX_PHASES,
  SELECTION_MAX_PHASES,
} from "./constants";

/**
 * Módulos curriculares previstos pela arquitetura da plataforma educacional.
 */
export type ModuleId =
  | "bubble"
  | "selection"
  | "insertion"
  | "merge"
  | "quick"
  | "heap";

export const SUPPORTED_MODULE_IDS: readonly ModuleId[] = Object.freeze([
  "bubble",
  "selection",
  "insertion",
  "merge",
  "quick",
  "heap",
]);

/**
 * Registro factual da melhor execução de um conjunto de exercícios no Schema v4.
 * Baseado estritamente nas regras canônicas de pontuação e métricas de desempenho.
 */
export interface ExerciseRecordV4 {
  readonly completedAt: string; // ISO 8601
  readonly bestScore: number; // 0..100 clamped
  readonly bestScoreErrors: number; // >= 0
  readonly bestScoreHintsUsed: number; // >= 0
  readonly bestScoreElapsedTimeMs?: number; // >= 0 (descritivo, não desempata)
}

/**
 * Progresso persistente de um conjunto específico de exercícios (ExerciseSet).
 * Não persiste status de desbloqueio (desbloqueios são derivados deterministicamente).
 */
export interface ExerciseSetProgressV4 {
  readonly completed: boolean;
  readonly bestRecord?: ExerciseRecordV4;
}

/**
 * Progresso persistente de um módulo educacional completo no Schema v4.
 * O tutorial é uma flag de módulo; exercícios são indexados por exerciseSetId canônico.
 */
export interface ModuleProgressV4 {
  readonly completedTutorial: boolean;
  readonly exerciseSets: Record<string, ExerciseSetProgressV4>;
}

/**
 * Preferências locais globais compartilhadas entre todos os módulos.
 */
export interface GlobalPreferences {
  readonly soundEnabled: boolean;
  readonly reducedMotion: boolean;
  readonly highContrast: boolean;
}

export type PreferencesSaveData = GlobalPreferences;

/**
 * Schema canônico e versionado do salvamento local orientado a módulos (Schema v4).
 * Uma única fonte de verdade: `modules`. Sem aliases redundantes no top-level.
 */
export interface GameSaveSchemaV4 {
  readonly schemaVersion: 4;
  readonly lastUpdated: string;
  readonly preferences: GlobalPreferences;
  readonly modules: Partial<Record<ModuleId, ModuleProgressV4>>;
}

/**
 * Alias canônico para o schema corrente da aplicação.
 */
export type GameSaveSchema = GameSaveSchemaV4;

// ============================================================================
// Tipos de Retrocompatibilidade e Migração (v1 / v2 / v3)
// ============================================================================

export type SupportedProtocol = "bubble" | "selection";

export interface PhaseRecord {
  readonly completed: boolean;
  readonly completedAt: string;
  readonly bestScore?: number;
  readonly bestScoreErrors?: number;
  readonly bestScoreHintsUsed?: number;
  readonly bestScoreElapsedTimeMs?: number;
}

export interface PhaseScoreData {
  readonly score: number;
  readonly errors: number;
  readonly hintsUsed: number;
  readonly elapsedTimeMs?: number;
}

export interface ProtocolProgress {
  readonly unlockedPhases: number;
  readonly highestPhaseReached: number;
  readonly hasCompletedTutorial: boolean;
  readonly records: Record<number, PhaseRecord>;
}

export type CampaignSaveData = ProtocolProgress;

/**
 * Estrutura histórica do Schema v3 Multi-Protocolo (para migração e testes).
 */
export interface GameSaveSchemaV3 {
  readonly schemaVersion: 3;
  readonly lastUpdated: string;
  readonly protocols: {
    readonly bubble: ProtocolProgress;
    readonly selection: ProtocolProgress;
  };
  readonly preferences: PreferencesSaveData;
  readonly campaign?: ProtocolProgress;
  readonly records?: Record<number, PhaseRecord>;
}

/**
 * Contrato de armazenamento chave-valor (compatível com localStorage e mocks em memória).
 */
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}

/**
 * Resultado descritivo de gravação em storage.
 */
export interface SaveOperationResult {
  readonly success: boolean;
  readonly fallbackUsed: boolean;
  readonly error?: string;
}

// ============================================================================
// Funções Construtoras Padrão (Pure Creators)
// ============================================================================

/**
 * Cria o estado inicial padrão de um módulo no Schema v4.
 */
export function createDefaultModuleProgress(): ModuleProgressV4 {
  return Object.freeze({
    completedTutorial: false,
    exerciseSets: Object.freeze({}),
  });
}

/**
 * Retorna o progresso padrão inicial legado para um protocolo (v3).
 */
export function createDefaultProtocolProgress(
  maxPhases: number = DEFAULT_MAX_PHASES
): ProtocolProgress {
  return Object.freeze({
    unlockedPhases: Math.min(1, maxPhases),
    highestPhaseReached: Math.min(1, maxPhases),
    hasCompletedTutorial: false,
    records: Object.freeze({}),
  });
}

/**
 * Retorna o estado padrão canônico do Schema v4 para novas instalações limpas.
 * Inicializa apenas os módulos concebidos e ativos (bubble, selection, insertion).
 * Não gera registros vazios para módulos não liberados.
 */
export function createDefaultSaveData(
  _bubbleMaxPhases?: number,
  _selectionMaxPhases?: number
): GameSaveSchemaV4 {
  return Object.freeze({
    schemaVersion: 4 as const,
    lastUpdated: new Date().toISOString(),
    preferences: Object.freeze({
      soundEnabled: true,
      reducedMotion: false,
      highContrast: false,
    }),
    modules: Object.freeze({
      bubble: createDefaultModuleProgress(),
      selection: createDefaultModuleProgress(),
      insertion: createDefaultModuleProgress(),
      merge: createDefaultModuleProgress(),
    }),
  });
}

/**
 * Retorna estado padrão no formato histórico v3 (para uso em testes de migração).
 */
export function createDefaultSaveDataV3(
  bubbleMaxPhases: number = DEFAULT_MAX_PHASES,
  selectionMaxPhases: number = SELECTION_MAX_PHASES
): GameSaveSchemaV3 {
  const bubble = createDefaultProtocolProgress(bubbleMaxPhases);
  const selection = createDefaultProtocolProgress(selectionMaxPhases);

  return Object.freeze({
    schemaVersion: 3 as const,
    lastUpdated: new Date().toISOString(),
    protocols: Object.freeze({
      bubble,
      selection,
    }),
    preferences: Object.freeze({
      soundEnabled: true,
      reducedMotion: false,
      highContrast: false,
    }),
    campaign: bubble,
    records: bubble.records,
  });
}
