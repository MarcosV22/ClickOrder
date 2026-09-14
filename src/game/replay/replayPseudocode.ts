import type { ReplayFrame } from "./replayModel";
import type { BubbleSortVariant } from "../sorting/types";

export type CanonicalPseudocodeLineId =
  | "PROCEDURE"
  | "OUTER_LOOP"
  | "INNER_LOOP"
  | "IF_CONDITION"
  | "SWAP_STATEMENT"
  | "END_IF"
  | "END_INNER"
  | "END_OUTER"
  | "END_PROCEDURE";

export type EarlyExitPseudocodeLineId =
  | "PROCEDURE"
  | "OUTER_LOOP"
  | "RESET_SWAPPED"
  | "INNER_LOOP"
  | "IF_CONDITION"
  | "SWAP_STATEMENT"
  | "SET_SWAPPED"
  | "END_IF"
  | "END_INNER"
  | "CHECK_EARLY_EXIT"
  | "BREAK_STATEMENT"
  | "END_IF_EXIT"
  | "END_OUTER"
  | "END_PROCEDURE";

export type PseudocodeLineId =
  | CanonicalPseudocodeLineId
  | "RESET_SWAPPED"
  | "SET_SWAPPED"
  | "CHECK_EARLY_EXIT"
  | "BREAK_STATEMENT"
  | "END_IF_EXIT";

export interface PseudocodeLine<T extends string = PseudocodeLineId> {
  readonly id: T;
  readonly lineNumber: number;
  readonly indent: number;
  readonly text: string;
}

/**
 * Representação canônica e imutável do pseudocódigo do Bubble Sort Otimizado (Early Exit).
 */
export const BUBBLE_SORT_EARLY_EXIT_PSEUDOCODE: readonly PseudocodeLine[] = Object.freeze([
  Object.freeze({
    id: "PROCEDURE",
    lineNumber: 1,
    indent: 0,
    text: "procedimento bubbleSortOtimizado(A)",
  }),
  Object.freeze({
    id: "OUTER_LOOP",
    lineNumber: 2,
    indent: 1,
    text: "para i de 0 até n - 2 faça",
  }),
  Object.freeze({
    id: "RESET_SWAPPED",
    lineNumber: 3,
    indent: 2,
    text: "trocou ← falso",
  }),
  Object.freeze({
    id: "INNER_LOOP",
    lineNumber: 4,
    indent: 2,
    text: "para j de 0 até n - 2 - i faça",
  }),
  Object.freeze({
    id: "IF_CONDITION",
    lineNumber: 5,
    indent: 3,
    text: "se A[j] > A[j + 1] então",
  }),
  Object.freeze({
    id: "SWAP_STATEMENT",
    lineNumber: 6,
    indent: 4,
    text: "trocar A[j] e A[j + 1]",
  }),
  Object.freeze({
    id: "SET_SWAPPED",
    lineNumber: 7,
    indent: 4,
    text: "trocou ← verdadeiro",
  }),
  Object.freeze({
    id: "END_IF",
    lineNumber: 8,
    indent: 3,
    text: "fim se",
  }),
  Object.freeze({
    id: "END_INNER",
    lineNumber: 9,
    indent: 2,
    text: "fim para",
  }),
  Object.freeze({
    id: "CHECK_EARLY_EXIT",
    lineNumber: 10,
    indent: 2,
    text: "se não trocou então",
  }),
  Object.freeze({
    id: "BREAK_STATEMENT",
    lineNumber: 11,
    indent: 3,
    text: "interromper",
  }),
  Object.freeze({
    id: "END_IF_EXIT",
    lineNumber: 12,
    indent: 2,
    text: "fim se",
  }),
  Object.freeze({
    id: "END_OUTER",
    lineNumber: 13,
    indent: 1,
    text: "fim para",
  }),
  Object.freeze({
    id: "END_PROCEDURE",
    lineNumber: 14,
    indent: 0,
    text: "fim procedimento",
  }),
]);

/**
 * Representação canônica e imutável do pseudocódigo do Bubble Sort
 * conforme a especificação pedagógica do projeto.
 */
export const BUBBLE_SORT_PSEUDOCODE: readonly PseudocodeLine[] = Object.freeze([
  Object.freeze({
    id: "PROCEDURE",
    lineNumber: 1,
    indent: 0,
    text: "procedimento bubbleSort(A)",
  }),
  Object.freeze({
    id: "OUTER_LOOP",
    lineNumber: 2,
    indent: 1,
    text: "para i de 0 até n - 2 faça",
  }),
  Object.freeze({
    id: "INNER_LOOP",
    lineNumber: 3,
    indent: 2,
    text: "para j de 0 até n - 2 - i faça",
  }),
  Object.freeze({
    id: "IF_CONDITION",
    lineNumber: 4,
    indent: 3,
    text: "se A[j] > A[j + 1] então",
  }),
  Object.freeze({
    id: "SWAP_STATEMENT",
    lineNumber: 5,
    indent: 4,
    text: "trocar A[j] e A[j + 1]",
  }),
  Object.freeze({
    id: "END_IF",
    lineNumber: 6,
    indent: 3,
    text: "fim se",
  }),
  Object.freeze({
    id: "END_INNER",
    lineNumber: 7,
    indent: 2,
    text: "fim para",
  }),
  Object.freeze({
    id: "END_OUTER",
    lineNumber: 8,
    indent: 1,
    text: "fim para",
  }),
  Object.freeze({
    id: "END_PROCEDURE",
    lineNumber: 9,
    indent: 0,
    text: "fim procedimento",
  }),
]);

export interface PseudocodeConcreteContext {
  readonly i: number | null;
  readonly j: number | null;
  readonly leftIndex: number | null;
  readonly rightIndex: number | null;
  readonly leftValue: number | null;
  readonly rightValue: number | null;
  readonly comparisonText: string | null;
  readonly conditionStatusText: string;
  readonly actionTakenText: string;
}

export interface PseudocodeHighlight {
  /** Linha com foco primário da instrução no frame atual */
  readonly primaryLineId: PseudocodeLineId;
  /** Conjunto de linhas associadas ativas no frame */
  readonly activeLineIds: readonly PseudocodeLineId[];
  /** Linha da condição avaliada (se houver) */
  readonly conditionLineId: PseudocodeLineId | null;
  /** Resultado booleano da avaliação da condição */
  readonly conditionResult: "TRUE" | "FALSE" | null;
  /** Indica se a instrução de troca foi acionada */
  readonly swapExecuted: boolean;
  /** Contexto factual com valores concretos do frame */
  readonly concreteContext: PseudocodeConcreteContext;
}

/**
 * Função pura e determinística que mapeia um ReplayFrame para a instrução
 * correspondente no pseudocódigo, sem reexecutar o algoritmo de ordenação.
 */
export function getPseudocodeHighlight(
  frame: ReplayFrame,
  variantOverride?: BubbleSortVariant
): PseudocodeHighlight {
  const variant = variantOverride ?? frame.variant ?? "CANONICAL";
  const isEarlyExitVariant = variant === "EARLY_EXIT";

  if (frame.action === "INITIAL") {
    const concreteContext: PseudocodeConcreteContext = Object.freeze({
      i: null,
      j: null,
      leftIndex: null,
      rightIndex: null,
      leftValue: null,
      rightValue: null,
      comparisonText: null,
      conditionStatusText: "Nenhuma comparação realizada ainda.",
      actionTakenText: isEarlyExitVariant
        ? "Carga inicial na esteira. Flag 'trocou' inicializada para a 1ª passada."
        : "Carga inicial na esteira. Aguardando primeira iteração.",
    });

    const activeLineIds: readonly PseudocodeLineId[] = Object.freeze(
      isEarlyExitVariant ? ["PROCEDURE", "RESET_SWAPPED"] : ["PROCEDURE"]
    );

    return Object.freeze({
      primaryLineId: "PROCEDURE",
      activeLineIds,
      conditionLineId: null,
      conditionResult: null,
      swapExecuted: false,
      concreteContext,
    });
  }

  // passNumber é 1-based no ReplayFrame, logo i = passNumber - 1
  const i = Math.max(0, frame.passNumber - 1);
  const leftIndex = frame.activeIndices ? frame.activeIndices[0] : null;
  const rightIndex = frame.activeIndices ? frame.activeIndices[1] : null;
  const j = leftIndex;
  const leftValue = frame.leftValue;
  const rightValue = frame.rightValue;
  const comparisonText =
    leftValue !== null && rightValue !== null
      ? `${leftValue} > ${rightValue}`
      : null;

  // Caso especial: Early Exit disparado no encerramento deste frame
  if (isEarlyExitVariant && frame.earlyExitTriggered) {
    const concreteContext: PseudocodeConcreteContext = Object.freeze({
      i,
      j,
      leftIndex,
      rightIndex,
      leftValue,
      rightValue,
      comparisonText,
      conditionStatusText: "não trocou = VERDADEIRO (0 permutas nesta passada)",
      actionTakenText:
        "Condição 'se não trocou' satisfeita: esteira já estabilizada. Interrompendo execução antecipadamente.",
    });

    const activeLineIds: readonly PseudocodeLineId[] = Object.freeze([
      "CHECK_EARLY_EXIT",
      "BREAK_STATEMENT",
    ]);

    return Object.freeze({
      primaryLineId: "BREAK_STATEMENT",
      activeLineIds,
      conditionLineId: "CHECK_EARLY_EXIT",
      conditionResult: "TRUE",
      swapExecuted: false,
      concreteContext,
    });
  }

  if (frame.action === "KEEP") {
    const concreteContext: PseudocodeConcreteContext = Object.freeze({
      i,
      j,
      leftIndex,
      rightIndex,
      leftValue,
      rightValue,
      comparisonText,
      conditionStatusText: `${comparisonText} → FALSO (${leftValue} ≤ ${rightValue})`,
      actionTakenText: "Condição falsa: bloco de troca ignorado, posições mantidas.",
    });

    const activeLineIds: readonly PseudocodeLineId[] = Object.freeze([
      "IF_CONDITION",
    ]);

    return Object.freeze({
      primaryLineId: "IF_CONDITION",
      activeLineIds,
      conditionLineId: "IF_CONDITION",
      conditionResult: "FALSE",
      swapExecuted: false,
      concreteContext,
    });
  }

  // frame.action === "SWAP"
  const concreteContext: PseudocodeConcreteContext = Object.freeze({
    i,
    j,
    leftIndex,
    rightIndex,
    leftValue,
    rightValue,
    comparisonText,
    conditionStatusText: `${comparisonText} → VERDADEIRO`,
    actionTakenText:
      leftIndex !== null && rightIndex !== null
        ? `trocar A[${leftIndex}] e A[${rightIndex}]`
        : "trocar A[j] e A[j + 1]",
  });

  const activeLineIds: readonly PseudocodeLineId[] = Object.freeze(
    isEarlyExitVariant
      ? ["IF_CONDITION", "SWAP_STATEMENT", "SET_SWAPPED"]
      : ["IF_CONDITION", "SWAP_STATEMENT"]
  );

  return Object.freeze({
    primaryLineId: "SWAP_STATEMENT",
    activeLineIds,
    conditionLineId: "IF_CONDITION",
    conditionResult: "TRUE",
    swapExecuted: true,
    concreteContext,
  });
}
