import type { ModuleId } from "../persistence/types";

export type PracticeLevel = "basic" | "intermediate" | "advanced";

export type PracticeStatus = "available" | "locked" | "completed";

/**
 * Perfil do gerador procedural da prática curricular:
 * - "foundation": Lote curto com propriedades fundamentais controladas e decisões imediatas.
 * - "mixed-decisions": Lote intermediário com decisões mistas, propagação e trajetórias encadeadas.
 * - "autonomous-complex": Lote completo com desafios de discriminação, densidade rica e autonomia analítica.
 */
export type PracticeGeneratorProfile =
  | "foundation"
  | "mixed-decisions"
  | "autonomous-complex";

/**
 * Nível de suporte e scaffolding cognitivo oferecido ao operador:
 * - "full": Destaque de elementos, dicas relacionais completas e feedback detalhado.
 * - "reduced": Fading parcial de pistas visuais, exigindo observação autônoma do operador.
 * - "minimal": Autonomia máxima do operador com feedback reflexivo sob demanda.
 */
export type PracticeSupportProfile = "full" | "reduced" | "minimal";

export interface PracticeDefinition {
  readonly id: string;
  readonly moduleId: ModuleId;
  readonly level: PracticeLevel;
  readonly title: string;
  readonly shortTitle: string;
  readonly description: string;
  readonly size: number;
  readonly pedagogicalObjective: string;
  readonly learningFocus: string;
  readonly generatorProfile: PracticeGeneratorProfile;
  readonly supportProfile: PracticeSupportProfile;
}

export interface PracticeProgressState {
  readonly definition: PracticeDefinition;
  readonly status: PracticeStatus;
  readonly completed: boolean;
  readonly bestScore?: number;
  readonly bestErrors?: number;
  readonly bestHints?: number;
  readonly bestTimeMs?: number;
}

/**
 * Fatos métricos esperados na execução canônica determinística de um Caso do Algoritmo.
 */
export interface AlgorithmCaseExpectedFacts {
  readonly comparisons: number;
  readonly swaps?: number;
  readonly shifts?: number;
  readonly insertions?: number;
}

/**
 * Métricas reais extraídas da sessão de execução do estudante.
 */
export interface AlgorithmCaseMetrics {
  readonly comparisons: number;
  readonly swaps: number;
  readonly shifts?: number;
  readonly insertions?: number;
}

/**
 * Definição canônica transversal de um Caso do Algoritmo (LEARNING-R3-A).
 */
export interface AlgorithmCaseDefinition {
  readonly id: string;
  readonly moduleId: ModuleId;
  readonly title: string;
  readonly shortTitle: string;
  readonly description: string;
  readonly learningObjective: string;
  readonly initialArray: readonly number[];
  readonly expectedFacts: AlgorithmCaseExpectedFacts;
  readonly buildReflection: (metrics: AlgorithmCaseMetrics) => string;
}

export type CaseStatus = "available" | "locked" | "completed";

export interface CaseProgressState {
  readonly definition: AlgorithmCaseDefinition;
  readonly status: CaseStatus;
  readonly completed: boolean;
  readonly bestScore?: number;
  readonly bestErrors?: number;
  readonly bestHints?: number;
  readonly bestTimeMs?: number;
}

/**
 * Contexto unificado de atividade em execução na plataforma:
 * - "practice": Prática regular curricular (Básica, Intermediária, Avançada);
 * - "case": Caso do Algoritmo com entrada determinística e reflexão factual.
 */
export type ActivityContext =
  | {
      readonly type: "practice";
      readonly moduleId: ModuleId;
      readonly level: PracticeLevel;
      readonly practiceTitle: string;
    }
  | {
      readonly type: "case";
      readonly moduleId: ModuleId;
      readonly caseId: string;
      readonly caseDefinition: AlgorithmCaseDefinition;
    };
