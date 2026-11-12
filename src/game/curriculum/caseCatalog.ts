/**
 * Catálogo Canônico Transversal de Casos do Algoritmo (LEARNING-R3-A).
 *
 * Princípios de arquitetura:
 * 1. O catálogo de casos é agnóstico à engine de ordenação (zero imports de motor ou UI).
 * 2. Utiliza os IDs canônicos padronizados do Schema v4 (ADR 0021 e LEARNING-R3-A).
 * 3. Entrada fixa determinística (zero PRNG): vetores curados imutáveis.
 * 4. Desbloqueio derivado da conclusão da Prática Básica (<moduleId>.practice.basic).
 * 5. Reflexão pós-execução gerada por função pura (buildReflection) a partir das métricas reais.
 */

import type { GameSaveSchema, ModuleId } from "../persistence/types";
import {
  BUBBLE_CASES,
  SELECTION_CASES,
  INSERTION_CASES,
} from "../persistence/constants";
import type {
  AlgorithmCaseDefinition,
  AlgorithmCaseMetrics,
  CaseProgressState,
  CaseStatus,
} from "./types";

export const BUBBLE_CASE_NEARLY_SORTED: AlgorithmCaseDefinition = Object.freeze({
  id: BUBBLE_CASES.NEARLY_SORTED,
  moduleId: "bubble",
  title: "BUBBLE SORT — QUASE ORDENADO",
  shortTitle: "QUASE ORDENADO",
  description:
    "Apenas uma inversão local [30, 20]. Observe que a variante canônica ainda realiza 10 comparações por não possuir mecanismo de parada antecipada.",
  learningObjective:
    "Observar que, mesmo precisando de apenas 1 troca para ordenar, a variante canônica percorre todas as 10 comparações previstas por não possuir mecanismo de parada antecipada.",
  initialArray: Object.freeze([10, 30, 20, 40, 50]),
  expectedFacts: Object.freeze({
    comparisons: 10,
    swaps: 1,
  }),
  buildReflection: (metrics: AlgorithmCaseMetrics) =>
    `O vetor precisava de apenas ${metrics.swaps} troca, mas a versão canônica ainda percorreu todas as ${metrics.comparisons} comparações previstas. A disposição dos dados reduziu as trocas, mas não o número de comparações desta variante, demonstrando por que otimizações como parada antecipada são necessárias.`,
});

export const SELECTION_CASE_ALREADY_SORTED: AlgorithmCaseDefinition = Object.freeze({
  id: SELECTION_CASES.ALREADY_SORTED,
  moduleId: "selection",
  title: "SELECTION SORT — JÁ ORDENADO",
  shortTitle: "JÁ ORDENADO",
  description:
    "Vetor em ordem estrita não decrescente. O scanner percorre invariavelmente toda a partição não ordenada, realizando 10 comparações e 0 trocas.",
  learningObjective:
    "Constatar que o Selection Sort executa exatamente o mesmo número de comparações em qualquer disposição inicial dos elementos, mesmo quando nenhuma troca física é necessária.",
  initialArray: Object.freeze([10, 20, 30, 40, 50]),
  expectedFacts: Object.freeze({
    comparisons: 10,
    swaps: 0,
  }),
  buildReflection: (metrics: AlgorithmCaseMetrics) =>
    `Mesmo com o vetor já ordenado, o scanner percorreu toda a região restante em cada passada, totalizando ${metrics.comparisons} comparações e ${metrics.swaps} trocas. O Selection Sort não acelera quando a entrada já está ordenada, pois a busca pelo menor elemento inspeciona invariavelmente todas as posições da partição não ordenada.`,
});

export const INSERTION_CASE_NEARLY_SORTED: AlgorithmCaseDefinition = Object.freeze({
  id: INSERTION_CASES.NEARLY_SORTED,
  moduleId: "insertion",
  title: "INSERTION SORT — QUASE ORDENADO",
  shortTitle: "QUASE ORDENADO",
  description:
    "Apenas a chave 30 fora de posição. A parada condicional do laço interno reduz drasticamente as comparações e exige apenas 1 deslocamento.",
  learningObjective:
    "Observar a sensibilidade do Insertion Sort à pré-ordenação: poucas inversões resultam em paradas antecipadas no laço interno e drástica redução de comparações e deslocamentos.",
  initialArray: Object.freeze([10, 20, 40, 30, 50]),
  expectedFacts: Object.freeze({
    comparisons: 5,
    shifts: 1,
    insertions: 4,
    swaps: 0,
  }),
  buildReflection: (metrics: AlgorithmCaseMetrics) => {
    const shifts = metrics.shifts ?? 1;
    return `Como o vetor já estava quase ordenado, apenas ${shifts} deslocamento foi necessário em ${metrics.comparisons} comparações totais. O Insertion Sort aproveita a ordem existente na partição esquerda para interromper as comparações assim que encontra um elemento menor ou igual, economizando operações.`;
  },
});

export const BUBBLE_CASE_CATALOG: readonly AlgorithmCaseDefinition[] = Object.freeze([
  BUBBLE_CASE_NEARLY_SORTED,
]);

export const SELECTION_CASE_CATALOG: readonly AlgorithmCaseDefinition[] = Object.freeze([
  SELECTION_CASE_ALREADY_SORTED,
]);

export const INSERTION_CASE_CATALOG: readonly AlgorithmCaseDefinition[] = Object.freeze([
  INSERTION_CASE_NEARLY_SORTED,
]);

export const MODULE_CASE_CATALOG: Partial<Record<ModuleId, readonly AlgorithmCaseDefinition[]>> = Object.freeze({
  bubble: BUBBLE_CASE_CATALOG,
  selection: SELECTION_CASE_CATALOG,
  insertion: INSERTION_CASE_CATALOG,
});

export const ALGORITHM_CASES: readonly AlgorithmCaseDefinition[] = Object.freeze([
  ...BUBBLE_CASE_CATALOG,
  ...SELECTION_CASE_CATALOG,
  ...INSERTION_CASE_CATALOG,
]);

/**
 * Retorna os casos do algoritmo de um módulo curricular.
 */
export function getModuleCases(moduleId: ModuleId): readonly AlgorithmCaseDefinition[] {
  return MODULE_CASE_CATALOG[moduleId] ?? Object.freeze([]);
}

/**
 * Retorna a definição de um caso pelo ID canônico.
 */
export function getCaseDefinition(caseId: string): AlgorithmCaseDefinition | undefined {
  return ALGORITHM_CASES.find((c) => c.id === caseId);
}

/**
 * Verifica se a área de Casos do Algoritmo está desbloqueada para o módulo.
 * Regra determinística: desbloqueia assim que a Prática Básica (<moduleId>.practice.basic) estiver concluída.
 */
export function isModuleCasesUnlocked(
  saveData: GameSaveSchema | undefined,
  moduleId: ModuleId
): boolean {
  const basicExerciseSetId = `${moduleId}.practice.basic`;
  return Boolean(saveData?.modules?.[moduleId]?.exerciseSets?.[basicExerciseSetId]?.completed);
}

/**
 * Deriva os estados factuais dos casos de um módulo (DISPONÍVEL, BLOQUEADO, CONCLUÍDO),
 * incluindo telemetria de melhor recorde a partir do Schema v4 de persistência.
 */
export function getModuleCaseStates(
  saveData: GameSaveSchema | undefined,
  moduleId: ModuleId
): readonly CaseProgressState[] {
  const cases = getModuleCases(moduleId);
  const moduleProgress = saveData?.modules?.[moduleId];
  const exerciseSets = moduleProgress?.exerciseSets ?? {};
  const isUnlocked = isModuleCasesUnlocked(saveData, moduleId);

  return cases.map((caseDef) => {
    const setProgress = exerciseSets[caseDef.id];
    const completed = Boolean(setProgress?.completed);

    let status: CaseStatus;
    if (completed) {
      status = "completed";
    } else if (isUnlocked) {
      status = "available";
    } else {
      status = "locked";
    }

    const bestRecord = setProgress?.bestRecord;

    return Object.freeze({
      definition: caseDef,
      status,
      completed,
      bestScore: bestRecord?.bestScore,
      bestErrors: bestRecord?.bestScoreErrors,
      bestHints: bestRecord?.bestScoreHintsUsed,
      bestTimeMs: bestRecord?.bestScoreElapsedTimeMs,
    });
  });
}
