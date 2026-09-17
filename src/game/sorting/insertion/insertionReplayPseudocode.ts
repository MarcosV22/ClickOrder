/**
 * Mapeamento determinístico e sincronização de pseudocódigo para o Insertion Sort.
 *
 * Módulo puramente funcional e imutável.
 * Fornece mapeamento de linhas canônicas (11 instruções) e derivação pura de
 * destaque semântico (LIFT_KEY, WHILE_CONDITION, SHIFT_RIGHT, INSERT_KEY)
 * e contexto concreto a partir do InsertionReplayFrame.
 */

import type { InsertionReplayFrame } from "./insertionReplayModel";
import {
  INSERTION_SORT_PSEUDOCODE,
  type InsertionPseudocodeLineId,
  type InsertionPseudocodeLine,
} from "./insertionPseudocode";

export {
  INSERTION_SORT_PSEUDOCODE,
  type InsertionPseudocodeLineId,
  type InsertionPseudocodeLine,
};

export interface InsertionPseudocodeConcreteContext {
  readonly i: number | null;
  readonly j: number | null;
  readonly key: number | null;
  readonly holeIndex: number | null;
  readonly orderedBoundary: number;
  readonly comparedValue: number | null;
  readonly comparisonText: string;
  readonly actionTakenText: string;
}

export interface InsertionPseudocodeHighlight {
  /** Linha com foco primário na execução */
  readonly primaryLineId: InsertionPseudocodeLineId;
  /** Conjunto de linhas no escopo de execução ativo */
  readonly activeLineIds: readonly InsertionPseudocodeLineId[];
  /** Linha da condição associada, se houver */
  readonly conditionLineId: InsertionPseudocodeLineId | null;
  /** Resultado booleano da avaliação da condição do laço enquanto */
  readonly conditionResult: "TRUE" | "FALSE" | "HEAD_REACHED" | null;
  /** Contexto com valores numéricos concretos isolados */
  readonly concreteContext: InsertionPseudocodeConcreteContext;
}

/**
 * Deriva deterministicamente o destaque de pseudocódigo e o contexto concreto
 * para um dado quadro de replay do Insertion Sort.
 */
export function getInsertionPseudocodeHighlight(
  frame: InsertionReplayFrame
): InsertionPseudocodeHighlight {
  if (frame.frameType === "INITIAL") {
    const concreteContext: InsertionPseudocodeConcreteContext = Object.freeze({
      i: frame.i,
      j: null,
      key: null,
      holeIndex: null,
      orderedBoundary: frame.orderedBoundary,
      comparedValue: null,
      comparisonText: "—",
      actionTakenText:
        "Início do procedimento: carga inicial na esteira. O primeiro elemento estabelece a partição ordenada ORD de tamanho 1.",
    });

    return Object.freeze({
      primaryLineId: "PROCEDURE",
      activeLineIds: Object.freeze<InsertionPseudocodeLineId[]>([
        "PROCEDURE",
      ]),
      conditionLineId: null,
      conditionResult: null,
      concreteContext,
    });
  }

  if (frame.frameType === "KEY_LIFT") {
    const concreteContext: InsertionPseudocodeConcreteContext = Object.freeze({
      i: frame.i,
      j: frame.j,
      key: frame.key,
      holeIndex: frame.holeIndex,
      orderedBoundary: frame.orderedBoundary,
      comparedValue: null,
      comparisonText: "—",
      actionTakenText: `Passada i=${frame.i}: carga ${frame.key} elevada ao trilho aéreo como chave. Vaga aberta no índice #${(frame.holeIndex ?? 0) + 1} e j inicializado em ${frame.j}.`,
    });

    return Object.freeze({
      primaryLineId: "LIFT_KEY",
      activeLineIds: Object.freeze<InsertionPseudocodeLineId[]>([
        "OUTER_LOOP",
        "LIFT_KEY",
        "INIT_J",
      ]),
      conditionLineId: null,
      conditionResult: null,
      concreteContext,
    });
  }

  if (frame.frameType === "SHIFT") {
    const concreteContext: InsertionPseudocodeConcreteContext = Object.freeze({
      i: frame.i,
      j: frame.j,
      key: frame.key,
      holeIndex: frame.holeIndex,
      orderedBoundary: frame.orderedBoundary,
      comparedValue: frame.comparedValue,
      comparisonText: frame.comparisonText,
      actionTakenText: `A[${frame.j}] (${frame.comparedValue}) > chave (${frame.key}): carga deslizada para a direita (posição #${(frame.holeIndexBefore ?? 0) + 1}) e j decrementado.`,
    });

    return Object.freeze({
      primaryLineId: "SHIFT_RIGHT",
      activeLineIds: Object.freeze<InsertionPseudocodeLineId[]>([
        "WHILE_CONDITION",
        "SHIFT_RIGHT",
        "DECREMENT_J",
      ]),
      conditionLineId: "WHILE_CONDITION",
      conditionResult: "TRUE",
      concreteContext,
    });
  }

  // frame.frameType === "INSERT"
  if (frame.insertReason === "CONDITION_FALSE") {
    const concreteContext: InsertionPseudocodeConcreteContext = Object.freeze({
      i: frame.i,
      j: frame.j,
      key: frame.insertedValue ?? frame.keyValue ?? null,
      holeIndex: null,
      orderedBoundary: frame.orderedBoundary,
      comparedValue: frame.comparedValue,
      comparisonText: frame.comparisonText,
      actionTakenText: `A[${frame.j}] (${frame.comparedValue}) ≤ chave (${frame.keyValue}): condição do laço falsa. Chave inserida na vaga #${(frame.insertedIndex ?? 0) + 1}.`,
    });

    const activeLineIds: InsertionPseudocodeLineId[] = [
      "WHILE_CONDITION",
      "INSERT_KEY",
      ...(frame.isCompleted ? (["END_OUTER", "END_PROCEDURE"] as const) : []),
    ];

    return Object.freeze({
      primaryLineId: "INSERT_KEY",
      activeLineIds: Object.freeze(activeLineIds),
      conditionLineId: "WHILE_CONDITION",
      conditionResult: "FALSE",
      concreteContext,
    });
  }

  // frame.insertReason === "HEAD_REACHED"
  const concreteContext: InsertionPseudocodeConcreteContext = Object.freeze({
    i: frame.i,
    j: -1,
    key: frame.insertedValue ?? frame.keyValue ?? null,
    holeIndex: null,
    orderedBoundary: frame.orderedBoundary,
    comparedValue: null,
    comparisonText: "j < 0 • CABECEIRA ALCANÇADA",
    actionTakenText: `j = -1: cabeceira da esteira alcançada. Chave ${frame.insertedValue ?? frame.keyValue} inserida na primeira vaga (#1).`,
  });

  const activeLineIds: InsertionPseudocodeLineId[] = [
    "WHILE_CONDITION",
    "INSERT_KEY",
    ...(frame.isCompleted ? (["END_OUTER", "END_PROCEDURE"] as const) : []),
  ];

  return Object.freeze({
    primaryLineId: "INSERT_KEY",
    activeLineIds: Object.freeze(activeLineIds),
    conditionLineId: "WHILE_CONDITION",
    conditionResult: "HEAD_REACHED",
    concreteContext,
  });
}
