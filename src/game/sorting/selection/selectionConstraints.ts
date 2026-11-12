/**
 * Restrições procedurais e configurações de geração específicas do Selection Sort.
 * Reutiliza integralmente a infraestrutura de src/game/generation/.
 * A camada generation/ permanece pura e agnóstica (zero imports de engines).
 */

import {
  generateSortingArray,
  isNotSorted,
  isNotReverseSorted,
  DEFAULT_MIN_VALUE,
  DEFAULT_MAX_VALUE,
  DEFAULT_MAX_ATTEMPTS,
  type ArrayConstraint,
  type ArrayConstraintDefinition,
  type GeneratedArrayResult,
  type SeedInput,
} from "../../generation";

/**
 * Tamanhos canônicos dos lotes de carga para as 3 fases regulares da futura campanha de Selection Sort:
 * - Fase 1: 4 cargas
 * - Fase 2: 5 cargas
 * - Fase 3: 6 cargas
 */
export const SELECTION_CAMPAIGN_PHASE_LENGTHS = [4, 5, 6] as const;

/**
 * Predicado matemático puro:
 * Valida que o menor elemento global do vetor NÃO está localizado inicialmente no índice 0.
 * Isso garante pedagogicamente que a primeira passada terá trabalho ativo de busca e transferência.
 */
export const isGlobalMinNotInFirstPosition: ArrayConstraint = (arr) => {
  if (arr.length <= 1) return false;
  const minVal = Math.min(...arr);
  return arr[0] !== minVal;
};

/**
 * Predicado matemático puro:
 * Simula a varredura do Selection Sort sobre uma cópia local do vetor e valida
 * se haverá pelo menos uma inspeção com decisão MANTER CANDIDATO (KEEP_MIN),
 * isto é, onde arr[j] >= arr[currentMinSoFar].
 */
export const hasAtLeastOneKeepMin: ArrayConstraint = (arr) => {
  if (arr.length < 2) return false;
  const a = [...arr];
  for (let i = 0; i < a.length - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < a.length; j++) {
      if (a[j] < a[minIdx]) {
        minIdx = j;
      } else {
        // Encontrou ao menos uma situação onde o elemento inspecionado não é menor que o candidato
        return true;
      }
    }
    if (minIdx !== i) {
      const temp = a[i];
      a[i] = a[minIdx];
      a[minIdx] = temp;
    }
  }
  return false;
};

/**
 * Predicado matemático puro:
 * Valida se existe ao menos uma passada onde o candidato a mínimo é atualizado
 * duas ou mais vezes (múltiplas atualizações de minIndex na mesma varredura).
 * Recomendado para enriquecer o aprendizado pedagógico nas fases maiores (fases 2 e 3).
 */
export const hasMultipleMinUpdatesInAtLeastOnePass: ArrayConstraint = (arr) => {
  if (arr.length < 4) return false;
  const a = [...arr];
  for (let i = 0; i < a.length - 1; i++) {
    let minIdx = i;
    let updatesInPass = 0;
    for (let j = i + 1; j < a.length; j++) {
      if (a[j] < a[minIdx]) {
        minIdx = j;
        updatesInPass++;
      }
    }
    if (updatesInPass >= 2) {
      return true;
    }
    if (minIdx !== i) {
      const temp = a[i];
      a[i] = a[minIdx];
      a[minIdx] = temp;
    }
  }
  return false;
};

/**
 * Análise analítica pura de execução do Selection Sort sobre um vetor.
 * Módulo puramente funcional, sem efeitos colaterais e sem acoplamento com UI/Engine.
 */
export interface SelectionSortAnalysis {
  readonly totalNewMin: number;
  readonly totalKeepMin: number;
  readonly passesWithMultipleUpdates: number;
  readonly hasNonAdjacentTransfer: boolean;
  readonly hasInterleavedKeepAndNewMin: boolean;
}

export function analyzeSelectionSort(arr: readonly number[]): SelectionSortAnalysis {
  const a = [...arr];
  const n = a.length;
  let totalNewMin = 0;
  let totalKeepMin = 0;
  let passesWithMultipleUpdates = 0;
  let hasNonAdjacentTransfer = false;
  let hasInterleavedKeepAndNewMin = false;

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    let updatesInPass = 0;
    let keepsInPass = 0;

    for (let j = i + 1; j < n; j++) {
      if (a[j] < a[minIdx]) {
        minIdx = j;
        updatesInPass++;
        totalNewMin++;
      } else {
        keepsInPass++;
        totalKeepMin++;
      }
    }

    if (updatesInPass >= 2) {
      passesWithMultipleUpdates++;
    }

    if (updatesInPass >= 1 && keepsInPass >= 1) {
      hasInterleavedKeepAndNewMin = true;
    }

    if (Math.abs(minIdx - i) >= 2) {
      hasNonAdjacentTransfer = true;
    }

    if (minIdx !== i) {
      const temp = a[i];
      a[i] = a[minIdx];
      a[minIdx] = temp;
    }
  }

  return {
    totalNewMin,
    totalKeepMin,
    passesWithMultipleUpdates,
    hasNonAdjacentTransfer,
    hasInterleavedKeepAndNewMin,
  };
}

/**
 * Predicado puro: Valida se em ao menos uma passada há intercalação de decisões
 * (ocorrência de ao menos um NOVO MÍNIMO e ao menos um MANTER CANDIDATO na mesma passada).
 */
export const hasInterleavedKeepAndNewMin: ArrayConstraint = (arr) => {
  return analyzeSelectionSort(arr).hasInterleavedKeepAndNewMin;
};

/**
 * Predicado puro: Valida se ocorre ao menos uma transferência de elemento não adjacente (|minIndex - i| >= 2).
 */
export const hasNonAdjacentCommitTransfer: ArrayConstraint = (arr) => {
  return analyzeSelectionSort(arr).hasNonAdjacentTransfer;
};

/**
 * Predicado puro: Valida riqueza decisória na varredura longa (totalKeepMin >= 3 e totalNewMin >= 2).
 */
export const hasRichSelectionDecisions: ArrayConstraint = (arr) => {
  const res = analyzeSelectionSort(arr);
  return res.totalKeepMin >= 3 && res.totalNewMin >= 2;
};

/**
 * Restrições procedurais fundamentais para Selection Sort:
 * 1. Não previamente ordenado;
 * 2. Não completamente invertido;
 * 3. Mínimo global fora do índice 0;
 * 4. Pelo menos uma decisão de MANTER CANDIDATO (KEEP_MIN).
 */
export const SELECTION_BASE_CONSTRAINTS: readonly ArrayConstraintDefinition[] = Object.freeze([
  {
    id: "selection-not-sorted",
    description: "O vetor não deve estar previamente ordenado",
    predicate: isNotSorted,
  },
  {
    id: "selection-not-reverse-sorted",
    description: "O vetor não deve estar totalmente invertido",
    predicate: isNotReverseSorted,
  },
  {
    id: "selection-min-not-at-zero",
    description: "O menor elemento não deve iniciar na primeira posição (índice 0)",
    predicate: isGlobalMinNotInFirstPosition,
  },
  {
    id: "selection-has-keep-min",
    description: "O vetor deve propiciar ao menos uma decisão MANTER CANDIDATO (KEEP_MIN)",
    predicate: hasAtLeastOneKeepMin,
  },
]);

/**
 * Restrições para Prática Básica de Selection Sort (n = 4):
 */
export const SELECTION_BASIC_CONSTRAINTS = SELECTION_BASE_CONSTRAINTS;

/**
 * Restrições para Prática Intermediária de Selection Sort (n = 5):
 */
export const SELECTION_INTERMEDIATE_CONSTRAINTS: readonly ArrayConstraintDefinition[] = Object.freeze([
  ...SELECTION_BASE_CONSTRAINTS,
  {
    id: "selection-multiple-min-updates",
    description:
      "O vetor deve favorecer ao menos uma passada com múltiplas atualizações do candidato mínimo",
    predicate: hasMultipleMinUpdatesInAtLeastOnePass,
  },
  {
    id: "selection-interleaved-decisions",
    description:
      "O vetor deve propiciar decisões intercaladas de NOVO MÍNIMO e MANTER na mesma passada",
    predicate: hasInterleavedKeepAndNewMin,
  },
]);

/**
 * Restrições para Prática Avançada de Selection Sort (n = 6):
 */
export const SELECTION_ADVANCED_CONSTRAINTS: readonly ArrayConstraintDefinition[] = Object.freeze([
  {
    id: "selection-not-sorted",
    description: "O vetor não deve estar previamente ordenado",
    predicate: isNotSorted,
  },
  {
    id: "selection-not-reverse-sorted",
    description: "O vetor não deve estar totalmente invertido",
    predicate: isNotReverseSorted,
  },
  {
    id: "selection-multiple-min-updates",
    description:
      "O vetor deve favorecer ao menos uma passada com múltiplas atualizações do candidato mínimo",
    predicate: hasMultipleMinUpdatesInAtLeastOnePass,
  },
  {
    id: "selection-non-adjacent-transfer",
    description:
      "O vetor deve exigir ao menos uma transferência não adjacente de média ou longa distância",
    predicate: hasNonAdjacentCommitTransfer,
  },
  {
    id: "selection-rich-decisions",
    description:
      "O vetor deve propiciar alternância consistente entre inspeções de manutenção e atualização",
    predicate: hasRichSelectionDecisions,
  },
]);

/**
 * Níveis curriculares de prática do Selection Sort na plataforma educacional:
 */
export type SelectionPracticeLevel = "basic" | "intermediate" | "advanced";

/**
 * Retorna as constraints pedagógicas para a prática de Selection Sort.
 */
export function getSelectionPracticeConstraints(
  level: SelectionPracticeLevel
): readonly ArrayConstraintDefinition[] {
  if (level === "basic") {
    return SELECTION_BASIC_CONSTRAINTS;
  }
  if (level === "intermediate") {
    return SELECTION_INTERMEDIATE_CONSTRAINTS;
  }
  return SELECTION_ADVANCED_CONSTRAINTS;
}

/**
 * Retorna as constraints apropriadas para a fase informada (1, 2 ou 3) ou nível de prática.
 * Mantém retrocompatibilidade estrita com a assinatura e contagem de constraints original para fases numéricas (1=4, 2=5, 3=5).
 */
export function getSelectionPhaseConstraints(
  phaseOrLevel: number | SelectionPracticeLevel
): readonly ArrayConstraintDefinition[] {
  if (typeof phaseOrLevel === "string") {
    return getSelectionPracticeConstraints(phaseOrLevel);
  }

  if (phaseOrLevel <= 1) {
    return SELECTION_BASE_CONSTRAINTS;
  }

  return Object.freeze([
    ...SELECTION_BASE_CONSTRAINTS,
    {
      id: "selection-multiple-min-updates",
      description:
        "O vetor deve favorecer ao menos uma passada com múltiplas atualizações do candidato mínimo",
      predicate: hasMultipleMinUpdatesInAtLeastOnePass,
    },
  ]);
}

/**
 * Gera deterministicamente um vetor procedural para as atividades práticas do Selection Sort.
 * - basic: length = 4
 * - intermediate: length = 5
 * - advanced: length = 6
 */
export function generateSelectionPracticeArray(
  level: SelectionPracticeLevel,
  seed?: SeedInput
): GeneratedArrayResult {
  const length = level === "basic" ? 4 : level === "intermediate" ? 5 : 6;
  const constraints = getSelectionPracticeConstraints(level);

  return generateSortingArray({
    length,
    minValue: DEFAULT_MIN_VALUE,
    maxValue: DEFAULT_MAX_VALUE,
    allowDuplicates: false,
    seed,
    constraints,
    maxAttempts: DEFAULT_MAX_ATTEMPTS,
  });
}

/**
 * Gera deterministicamente um vetor procedural para as fases/práticas de Selection Sort.
 * Mantém retrocompatibilidade total com chamadas legadas numéricas (1, 2, 3).
 */
export function generateSelectionPhaseArray(
  phase: number | SelectionPracticeLevel,
  seed?: SeedInput
): GeneratedArrayResult {
  const level: SelectionPracticeLevel =
    typeof phase === "string"
      ? phase
      : phase <= 1
      ? "basic"
      : phase === 2
      ? "intermediate"
      : "advanced";

  return generateSelectionPracticeArray(level, seed);
}
