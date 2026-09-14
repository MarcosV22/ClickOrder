import {
  CURRENT_SCHEMA_VERSION,
  DEFAULT_MAX_PHASES,
  SELECTION_MAX_PHASES,
} from "./constants";

/**
 * Protocolos de ordenação oficialmente suportados pela estação logística.
 */
export type SupportedProtocol = "bubble" | "selection";

/**
 * Registro factual da conclusão de uma fase individual.
 * Armazena a conclusão factual e opcionalmente as métricas da rodada de melhor pontuação.
 */
export interface PhaseRecord {
  readonly completed: boolean;
  readonly completedAt: string;
  readonly bestScore?: number;
  readonly bestScoreErrors?: number;
  readonly bestScoreHintsUsed?: number;
  readonly bestScoreElapsedTimeMs?: number;
}

/**
 * Dados de desempenho de uma rodada para avaliação de recorde.
 */
export interface PhaseScoreData {
  readonly score: number;
  readonly errors: number;
  readonly hintsUsed: number;
  readonly elapsedTimeMs?: number;
}

/**
 * Progresso persistente factual por protocolo individual.
 * Separação estrita: as fases 1, 2 e 3 do Bubble não colidem com as fases 1, 2 e 3 do Selection.
 */
export interface ProtocolProgress {
  readonly unlockedPhases: number;
  readonly highestPhaseReached: number;
  readonly hasCompletedTutorial: boolean;
  readonly records: Record<number, PhaseRecord>;
}

/**
 * Alias de retrocompatibilidade para o formato legado de campanha.
 */
export type CampaignSaveData = ProtocolProgress;

/**
 * Preferências locais do operador da estação (globais entre todos os protocolos).
 */
export interface PreferencesSaveData {
  readonly soundEnabled: boolean;
  readonly reducedMotion: boolean;
  readonly highContrast: boolean;
}

/**
 * Schema canônico e versionado do salvamento local (v3 Multi-Protocolo).
 */
export interface GameSaveSchema {
  readonly schemaVersion: number;
  readonly lastUpdated: string;
  readonly protocols: {
    readonly bubble: ProtocolProgress;
    readonly selection: ProtocolProgress;
  };
  readonly preferences: PreferencesSaveData;
  /**
   * @deprecated Aliases de conveniência apontando para protocols.bubble para retrocompatibilidade
   */
  readonly campaign: ProtocolProgress;
  readonly records: Record<number, PhaseRecord>;
}

/**
 * Contrato mínimo abstrato de armazenamento chave-valor.
 * Permite isolamento completo de localStorage e injeção de adaptadores de teste em memória.
 */
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}

/**
 * Resultado descritivo de uma tentativa de gravação em storage.
 */
export interface SaveOperationResult {
  readonly success: boolean;
  readonly fallbackUsed: boolean;
  readonly error?: string;
}

/**
 * Retorna o progresso padrão inicial e imutável para um protocolo.
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
 * Retorna o estado de salvamento padrão, imutável e válido para novas instalações (Schema v3).
 */
export function createDefaultSaveData(
  bubbleMaxPhases: number = DEFAULT_MAX_PHASES,
  selectionMaxPhases: number = SELECTION_MAX_PHASES
): GameSaveSchema {
  const bubble = createDefaultProtocolProgress(bubbleMaxPhases);
  const selection = createDefaultProtocolProgress(selectionMaxPhases);

  return Object.freeze({
    schemaVersion: CURRENT_SCHEMA_VERSION,
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

