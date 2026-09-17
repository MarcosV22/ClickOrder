/**
 * Pseudocódigo canônico formal do Insertion Sort por deslocamentos.
 *
 * Representação em 11 instruções estruturadas conforme a especificação pedagógica do projeto.
 */

export type InsertionPseudocodeLineId =
  | "PROCEDURE"
  | "OUTER_LOOP"
  | "LIFT_KEY"
  | "INIT_J"
  | "WHILE_CONDITION"
  | "SHIFT_RIGHT"
  | "DECREMENT_J"
  | "END_WHILE"
  | "INSERT_KEY"
  | "END_OUTER"
  | "END_PROCEDURE";

export interface InsertionPseudocodeLine {
  readonly id: InsertionPseudocodeLineId;
  readonly lineNumber: number;
  readonly indent: number;
  readonly text: string;
}

export const INSERTION_SORT_PSEUDOCODE: readonly InsertionPseudocodeLine[] =
  Object.freeze([
    Object.freeze({
      id: "PROCEDURE",
      lineNumber: 1,
      indent: 0,
      text: "procedimento insertionSort(A)",
    }),
    Object.freeze({
      id: "OUTER_LOOP",
      lineNumber: 2,
      indent: 1,
      text: "para i de 1 até n - 1 faça",
    }),
    Object.freeze({
      id: "LIFT_KEY",
      lineNumber: 3,
      indent: 2,
      text: "chave ← A[i]",
    }),
    Object.freeze({
      id: "INIT_J",
      lineNumber: 4,
      indent: 2,
      text: "j ← i - 1",
    }),
    Object.freeze({
      id: "WHILE_CONDITION",
      lineNumber: 5,
      indent: 2,
      text: "enquanto j ≥ 0 e A[j] > chave faça",
    }),
    Object.freeze({
      id: "SHIFT_RIGHT",
      lineNumber: 6,
      indent: 3,
      text: "A[j + 1] ← A[j]",
    }),
    Object.freeze({
      id: "DECREMENT_J",
      lineNumber: 7,
      indent: 3,
      text: "j ← j - 1",
    }),
    Object.freeze({
      id: "END_WHILE",
      lineNumber: 8,
      indent: 2,
      text: "fim enquanto",
    }),
    Object.freeze({
      id: "INSERT_KEY",
      lineNumber: 9,
      indent: 2,
      text: "A[j + 1] ← chave",
    }),
    Object.freeze({
      id: "END_OUTER",
      lineNumber: 10,
      indent: 1,
      text: "fim para",
    }),
    Object.freeze({
      id: "END_PROCEDURE",
      lineNumber: 11,
      indent: 0,
      text: "fim procedimento",
    }),
  ]);
