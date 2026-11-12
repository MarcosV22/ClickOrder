/**
 * Predicados de restrições (constraints) para geração procedural de vetores.
 * Módulo puro, agnóstico a qualquer algoritmo ou motor de ordenação.
 */

import type {
  ArrayConstraint,
  ArrayConstraintDefinition,
  ConstraintResolvable,
} from "./types";

/**
 * Valida se o vetor NÃO está previamente ordenado em ordem não-decrescente.
 * Retorna true se houver ao menos uma inversão adjacente (arr[i] > arr[i+1]).
 */
export const isNotSorted: ArrayConstraint = (arr) => {
  if (arr.length <= 1) return true;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) return true;
  }
  return false;
};

/**
 * Valida se o vetor NÃO está completamente invertido (pior caso em ordem não-crescente).
 * Retorna true se houver ao menos um par adjacente em ordem relativa (arr[i] <= arr[i+1]).
 */
export const isNotReverseSorted: ArrayConstraint = (arr) => {
  if (arr.length <= 1) return true;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] <= arr[i + 1]) return true;
  }
  return false;
};

/**
 * Valida se o vetor possui ao menos um par adjacente invertido (arr[i] > arr[i+1])
 * que force a decisão pedagógica TROCAR (SWAP).
 */
export const hasAtLeastOneSwapCandidate: ArrayConstraint = (arr) => {
  if (arr.length < 2) return false;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) return true;
  }
  return false;
};

/**
 * Valida se o vetor possui ao menos um par adjacente já em ordem (arr[i] <= arr[i+1])
 * que force a decisão pedagógica MANTER (KEEP).
 */
export const hasAtLeastOneKeepCandidate: ArrayConstraint = (arr) => {
  if (arr.length < 2) return false;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] <= arr[i + 1]) return true;
  }
  return false;
};

/**
 * Valida se o vetor já está totalmente ordenado em ordem não-decrescente.
 * Útil para cenários de desafio Early Exit ou presets customizados.
 */
export const isAlreadySorted: ArrayConstraint = (arr) => {
  if (arr.length <= 1) return true;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) return false;
  }
  return true;
};

/**
 * Valida se o vetor está estritamente invertido (ordem decrescente completa).
 */
export const isReverseSorted: ArrayConstraint = (arr) => {
  if (arr.length <= 1) return true;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] < arr[i + 1]) return false;
  }
  return true;
};

/**
 * Valida que não há elementos duplicados no vetor.
 */
export const hasNoDuplicates: ArrayConstraint = (arr) => {
  return new Set(arr).size === arr.length;
};

/**
 * Valida que há ao menos um par de elementos duplicados no vetor.
 */
export const hasDuplicates: ArrayConstraint = (arr) => {
  return new Set(arr).size < arr.length;
};

/**
 * Normaliza qualquer restrição resolúvel para o formato com id, descrição e predicado.
 */
export function resolveConstraint(constraint: ConstraintResolvable): {
  id: string;
  description: string;
  predicate: ArrayConstraint;
} {
  if (typeof constraint === "function") {
    return {
      id: constraint.name || "anonymous-constraint",
      description: "Restrição procedural personalizada",
      predicate: constraint,
    };
  }
  return constraint;
}

/**
 * Conjunto canônico de restrições pedagógicas para as fases regulares da campanha Bubble Sort:
 * 1. Não previamente ordenado;
 * 2. Não completamente invertido;
 * 3. Possui ao menos uma decisão de SWAP (TROCAR);
 * 4. Possui ao menos uma decisão de KEEP (MANTER).
 *
 * Definido externamente ao gerador universal, sem importar a BubbleSortEngine.
 */
export const BUBBLE_CAMPAIGN_CONSTRAINTS: readonly ArrayConstraintDefinition[] = Object.freeze([
  {
    id: "not-sorted",
    description: "O vetor não deve estar previamente ordenado",
    predicate: isNotSorted,
  },
  {
    id: "not-reverse-sorted",
    description: "O vetor não deve estar completamente invertido (pior caso)",
    predicate: isNotReverseSorted,
  },
  {
    id: "has-swap",
    description: "O vetor deve conter ao menos um par adjacente invertido para a ação TROCAR (SWAP)",
    predicate: hasAtLeastOneSwapCandidate,
  },
  {
    id: "has-keep",
    description: "O vetor deve conter ao menos um par adjacente ordenado para a ação MANTER (KEEP)",
    predicate: hasAtLeastOneKeepCandidate,
  },
]);

/**
 * Análise analítica pura de execução do Bubble Sort sobre um vetor.
 * Módulo puramente funcional, sem efeitos colaterais e sem acoplamento com UI/Engine.
 */
export interface BubbleSortAnalysis {
  readonly totalSwaps: number;
  readonly totalKeeps: number;
  readonly passesWithSwaps: number;
  readonly maxDisplacement: number;
}

export function analyzeBubbleSort(arr: readonly number[]): BubbleSortAnalysis {
  const n = arr.length;
  if (n <= 1) {
    return {
      totalSwaps: 0,
      totalKeeps: 0,
      passesWithSwaps: 0,
      maxDisplacement: 0,
    };
  }

  const elements = arr.map((val, idx) => ({ val, origIdx: idx }));
  let totalSwaps = 0;
  let totalKeeps = 0;
  let passesWithSwaps = 0;

  for (let i = 0; i < n - 1; i++) {
    let swapsInPass = 0;
    for (let j = 0; j < n - 1 - i; j++) {
      if (elements[j].val > elements[j + 1].val) {
        swapsInPass++;
        totalSwaps++;
        const temp = elements[j];
        elements[j] = elements[j + 1];
        elements[j + 1] = temp;
      } else {
        totalKeeps++;
      }
    }
    if (swapsInPass > 0) {
      passesWithSwaps++;
    }
  }

  let maxDisplacement = 0;
  for (let finalIdx = 0; finalIdx < n; finalIdx++) {
    const disp = Math.abs(finalIdx - elements[finalIdx].origIdx);
    if (disp > maxDisplacement) {
      maxDisplacement = disp;
    }
  }

  return {
    totalSwaps,
    totalKeeps,
    passesWithSwaps,
    maxDisplacement,
  };
}

/**
 * Predicado puro: Valida se o vetor exige trocas distribuídas em mais de uma passada (passesWithSwaps >= 2).
 */
export const hasBubbleSwapsDistributedAcrossPasses: ArrayConstraint = (arr) => {
  return analyzeBubbleSort(arr).passesWithSwaps >= 2;
};

/**
 * Predicado puro: Valida se pelo menos um elemento se desloca por mais de uma posição (propagação perceptível).
 */
export const hasBubbleMultiPositionDisplacement: ArrayConstraint = (arr) => {
  return analyzeBubbleSort(arr).maxDisplacement >= 2;
};

/**
 * Predicado puro: Valida equilíbrio de trocas e manutenções intermediárias (totalSwaps >= 2 e totalKeeps >= 2).
 */
export const hasBubbleBalancedDecisions: ArrayConstraint = (arr) => {
  const res = analyzeBubbleSort(arr);
  return res.totalSwaps >= 2 && res.totalKeeps >= 2;
};

/**
 * Predicado puro: Valida densidade rica de trocas para prática avançada (passesWithSwaps >= 2, totalSwaps >= 3 e totalKeeps >= 3).
 */
export const hasBubbleAdvancedDecisions: ArrayConstraint = (arr) => {
  const res = analyzeBubbleSort(arr);
  return res.passesWithSwaps >= 2 && res.totalSwaps >= 3 && res.totalKeeps >= 3;
};

/**
 * Restrições curriculares diferenciadas para Prática Básica do Bubble Sort (n = 4):
 * - Não previamente ordenado;
 * - Não completamente invertido;
 * - Pelo menos uma decisão de TROCAR;
 * - Pelo menos uma decisão de MANTER;
 * - Propagação perceptível (deslocamento > 1 posição).
 */
export const BUBBLE_BASIC_CONSTRAINTS: readonly ArrayConstraintDefinition[] = Object.freeze([
  ...BUBBLE_CAMPAIGN_CONSTRAINTS,
  {
    id: "bubble-multi-displacement",
    description: "Ao menos um elemento deve percorrer mais de uma posição na esteira",
    predicate: hasBubbleMultiPositionDisplacement,
  },
]);

/**
 * Restrições curriculares diferenciadas para Prática Intermediária do Bubble Sort (n = 5).
 */
export const BUBBLE_INTERMEDIATE_CONSTRAINTS: readonly ArrayConstraintDefinition[] = Object.freeze([
  {
    id: "bubble-not-sorted",
    description: "O lote não deve estar previamente ordenado",
    predicate: isNotSorted,
  },
  {
    id: "bubble-not-reverse-sorted",
    description: "O lote não deve estar totalmente invertido (pior caso)",
    predicate: isNotReverseSorted,
  },
  {
    id: "bubble-swaps-distributed",
    description: "As trocas devem estar distribuídas em mais de uma passada",
    predicate: hasBubbleSwapsDistributedAcrossPasses,
  },
  {
    id: "bubble-multi-displacement",
    description: "Ao menos um elemento deve percorrer mais de uma posição na esteira",
    predicate: hasBubbleMultiPositionDisplacement,
  },
  {
    id: "bubble-balanced-decisions",
    description: "Deve haver equilíbrio de decisões de TROCA e MANUTENÇÃO",
    predicate: hasBubbleBalancedDecisions,
  },
]);

/**
 * Restrições curriculares diferenciadas para Prática Avançada do Bubble Sort (n = 6).
 */
export const BUBBLE_ADVANCED_CONSTRAINTS: readonly ArrayConstraintDefinition[] = Object.freeze([
  {
    id: "bubble-not-sorted",
    description: "O lote não deve estar previamente ordenado",
    predicate: isNotSorted,
  },
  {
    id: "bubble-not-reverse-sorted",
    description: "O lote não deve estar totalmente invertido (pior caso)",
    predicate: isNotReverseSorted,
  },
  {
    id: "bubble-swaps-distributed",
    description: "As trocas devem estar distribuídas em múltiplas passadas ativas",
    predicate: hasBubbleSwapsDistributedAcrossPasses,
  },
  {
    id: "bubble-multi-displacement",
    description: "Ao menos um elemento deve percorrer mais de uma posição na esteira",
    predicate: hasBubbleMultiPositionDisplacement,
  },
  {
    id: "bubble-advanced-decisions",
    description: "Densidade de trocas rica com alternância de decisões e passadas ativas",
    predicate: hasBubbleAdvancedDecisions,
  },
]);

/**
 * Retorna o conjunto de constraints pedagógicas para o nível/fase de Bubble Sort:
 */
export function getBubblePracticeConstraints(
  levelOrPhase: number | "basic" | "intermediate" | "advanced"
): readonly ArrayConstraintDefinition[] {
  const lvl =
    typeof levelOrPhase === "string"
      ? levelOrPhase
      : levelOrPhase <= 1
      ? "basic"
      : levelOrPhase === 2
      ? "intermediate"
      : "advanced";

  if (lvl === "basic") {
    return BUBBLE_BASIC_CONSTRAINTS;
  }
  if (lvl === "intermediate") {
    return BUBBLE_INTERMEDIATE_CONSTRAINTS;
  }
  return BUBBLE_ADVANCED_CONSTRAINTS;
}
