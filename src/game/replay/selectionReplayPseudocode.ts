/**
 * Mapeamento determinístico e sincronização de pseudocódigo para o Selection Sort.
 *
 * Módulo puramente funcional e imutável.
 * Fornece representação canônica formal em 13 instruções estruturadas
 * e derivação pura de destaque semântico (INIT_MIN, IF_CONDITION, UPDATE_MIN, CHECK_SWAP, SWAP_STATEMENT)
 * e contexto concreto a partir do SelectionReplayFrame.
 */

import type { SelectionReplayFrame } from "./selectionReplayModel";
import type { PseudocodeLine } from "./replayPseudocode";

export type SelectionPseudocodeLineId =
  | "PROCEDURE"
  | "OUTER_LOOP"
  | "INIT_MIN"
  | "INNER_LOOP"
  | "IF_CONDITION"
  | "UPDATE_MIN"
  | "END_IF"
  | "END_INNER"
  | "CHECK_SWAP"
  | "SWAP_STATEMENT"
  | "END_IF_SWAP"
  | "END_OUTER"
  | "END_PROCEDURE";

export type SelectionPseudocodeLine = PseudocodeLine<SelectionPseudocodeLineId>;

/**
 * Representação canônica e imutável do pseudocódigo do Selection Sort
 * conforme a especificação pedagógica do projeto.
 */
export const SELECTION_SORT_PSEUDOCODE: readonly SelectionPseudocodeLine[] = Object.freeze([
  Object.freeze({
    id: "PROCEDURE",
    lineNumber: 1,
    indent: 0,
    text: "procedimento selectionSort(A)",
  }),
  Object.freeze({
    id: "OUTER_LOOP",
    lineNumber: 2,
    indent: 1,
    text: "para i de 0 até n - 2 faça",
  }),
  Object.freeze({
    id: "INIT_MIN",
    lineNumber: 3,
    indent: 2,
    text: "minIndex ← i",
  }),
  Object.freeze({
    id: "INNER_LOOP",
    lineNumber: 4,
    indent: 2,
    text: "para j de i + 1 até n - 1 faça",
  }),
  Object.freeze({
    id: "IF_CONDITION",
    lineNumber: 5,
    indent: 3,
    text: "se A[j] < A[minIndex] então",
  }),
  Object.freeze({
    id: "UPDATE_MIN",
    lineNumber: 6,
    indent: 4,
    text: "minIndex ← j",
  }),
  Object.freeze({
    id: "END_IF",
    lineNumber: 7,
    indent: 3,
    text: "fim se",
  }),
  Object.freeze({
    id: "END_INNER",
    lineNumber: 8,
    indent: 2,
    text: "fim para",
  }),
  Object.freeze({
    id: "CHECK_SWAP",
    lineNumber: 9,
    indent: 2,
    text: "se minIndex ≠ i então",
  }),
  Object.freeze({
    id: "SWAP_STATEMENT",
    lineNumber: 10,
    indent: 3,
    text: "trocar A[i] e A[minIndex]",
  }),
  Object.freeze({
    id: "END_IF_SWAP",
    lineNumber: 11,
    indent: 2,
    text: "fim se",
  }),
  Object.freeze({
    id: "END_OUTER",
    lineNumber: 12,
    indent: 1,
    text: "fim para",
  }),
  Object.freeze({
    id: "END_PROCEDURE",
    lineNumber: 13,
    indent: 0,
    text: "fim procedimento",
  }),
]);

export interface SelectionPseudocodeConcreteContext {
  readonly i: number | null;
  readonly j: number | null;
  readonly minIndex: number | null;
  readonly minIndexBefore: number | null;
  readonly targetValue: number | null;
  readonly scanValue: number | null;
  readonly minValue: number | null;
  readonly comparisonText: string;
  readonly actionTakenText: string;
}

export interface SelectionPseudocodeHighlight {
  /** Linha com foco primário na execução */
  readonly primaryLineId: SelectionPseudocodeLineId;
  /** Conjunto de linhas no escopo de execução ativo */
  readonly activeLineIds: readonly SelectionPseudocodeLineId[];
  /** Linha da condição associada, se houver */
  readonly conditionLineId: SelectionPseudocodeLineId | null;
  /** Resultado booleano da avaliação da condição */
  readonly conditionResult: "TRUE" | "FALSE" | null;
  /** Indica se houve troca física executada */
  readonly swapExecuted: boolean;
  /** Contexto com valores numéricos concretos isolados */
  readonly concreteContext: SelectionPseudocodeConcreteContext;
}

/**
 * Deriva deterministicamente o destaque de pseudocódigo e o contexto concreto
 * para um dado quadro de replay do Selection Sort.
 */
export function getSelectionPseudocodeHighlight(
  frame: SelectionReplayFrame
): SelectionPseudocodeHighlight {
  if (frame.frameType === "INITIAL") {
    const concreteContext: SelectionPseudocodeConcreteContext = Object.freeze({
      i: frame.targetIndex,
      j: null,
      minIndex: frame.minIndex,
      minIndexBefore: null,
      targetValue: frame.targetValue,
      scanValue: null,
      minValue: frame.minValue,
      comparisonText: "—",
      actionTakenText:
        "Início do procedimento: carga inicial na esteira. Nenhuma instrução de comparação foi executada ainda.",
    });

    return Object.freeze({
      primaryLineId: "PROCEDURE",
      activeLineIds: Object.freeze(["PROCEDURE"] as SelectionPseudocodeLineId[]),
      conditionLineId: null,
      conditionResult: null,
      swapExecuted: false,
      concreteContext,
    });
  }

  if (frame.frameType === "INSPECTION") {
    const isNew = frame.isNewMin;
    const scannerVal = frame.scanValue ?? 0;
    const minVal = frame.minValue ?? 0;
    const jIdx = frame.scanIndex ?? 0;
    const iIdx = frame.targetIndex ?? 0;
    const minBefore = frame.minIndexBefore ?? iIdx;
    const isFirstInspectionInPass = jIdx === iIdx + 1;

    // Se é a primeira inspeção da passada, inclui INIT_MIN nas linhas ativas do escopo
    const activeLines: SelectionPseudocodeLineId[] = isFirstInspectionInPass
      ? ["OUTER_LOOP", "INIT_MIN", "INNER_LOOP", "IF_CONDITION"]
      : ["OUTER_LOOP", "INNER_LOOP", "IF_CONDITION"];

    if (isNew) {
      activeLines.push("UPDATE_MIN");
    }

    const concreteContext: SelectionPseudocodeConcreteContext = Object.freeze({
      i: iIdx,
      j: jIdx,
      minIndex: frame.minIndex,
      minIndexBefore: minBefore,
      targetValue: frame.targetValue,
      scanValue: scannerVal,
      minValue: minVal,
      comparisonText: `${scannerVal} < ${minVal} (A[${jIdx}] < A[${minBefore}])`,
      actionTakenText: isNew
        ? `NOVO MÍNIMO: minIndex atualizado de ${minBefore} para ${jIdx} (carga #${jIdx + 1} com valor ${scannerVal})`
        : `MANTER CANDIDATO: condição falsa, minIndex permanece ${minBefore} (carga #${minBefore + 1} com valor ${minVal})`,
    });

    return Object.freeze({
      primaryLineId: isNew ? "UPDATE_MIN" : "IF_CONDITION",
      activeLineIds: Object.freeze(activeLines),
      conditionLineId: "IF_CONDITION",
      conditionResult: isNew ? "TRUE" : "FALSE",
      swapExecuted: false,
      concreteContext,
    });
  }

  // COMMIT
  const didSwap = frame.didSwap;
  const iIdx = frame.targetIndex ?? 0;
  const minIdx = frame.minIndex ?? iIdx;
  const targetVal = frame.targetValue ?? 0;
  const minVal = frame.minValue ?? 0;

  const activeLines: SelectionPseudocodeLineId[] = didSwap
    ? ["OUTER_LOOP", "CHECK_SWAP", "SWAP_STATEMENT"]
    : ["OUTER_LOOP", "CHECK_SWAP"];

  const concreteContext: SelectionPseudocodeConcreteContext = Object.freeze({
    i: iIdx,
    j: null,
    minIndex: minIdx,
    minIndexBefore: minIdx,
    targetValue: targetVal,
    scanValue: null,
    minValue: minVal,
    comparisonText: `minIndex ≠ i (${minIdx} ${didSwap ? "≠" : "="} ${iIdx})`,
    actionTakenText: didSwap
      ? `TRANSFERÊNCIA: trocou A[${iIdx}] (${targetVal}) com A[${minIdx}] (${minVal}). Posição #${iIdx + 1} consolidada com selo OK.`
      : `CONSOLIDAÇÃO DIRETA: menor carga (${minVal}) já ocupava a posição A[${iIdx}]. Consolidada com selo OK sem troca.`,
  });

  return Object.freeze({
    primaryLineId: didSwap ? "SWAP_STATEMENT" : "CHECK_SWAP",
    activeLineIds: Object.freeze(activeLines),
    conditionLineId: "CHECK_SWAP",
    conditionResult: didSwap ? "TRUE" : "FALSE",
    swapExecuted: didSwap,
    concreteContext,
  });
}
