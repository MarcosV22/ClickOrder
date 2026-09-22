/**
 * Pseudocódigo Canônico do Merge Sort (Intercalação Top-Down com Buffer Auxiliar).
 *
 * Módulo puro, sem dependências de UI ou DOM.
 */

import type { PseudocodeLine } from "../../replay/replayPseudocode";

export type MergePseudocodeLineId =
  | "PROCEDURE_MERGE"
  | "INIT_POINTERS"
  | "MERGE_LOOP"
  | "COMPARE_CONDITION"
  | "ELSE_BRANCH"
  | "DRAIN_REMAINDER"
  | "COPY_BACK";

export const MERGE_SORT_PSEUDOCODE: readonly PseudocodeLine<MergePseudocodeLineId>[] =
  Object.freeze([
    Object.freeze({
      id: "PROCEDURE_MERGE",
      lineNumber: 1,
      indent: 0,
      text: "intercalar(A, left, mid, right)",
    }),
    Object.freeze({
      id: "INIT_POINTERS",
      lineNumber: 2,
      indent: 1,
      text: "p1 ← left, p2 ← mid + 1, k ← 0",
    }),
    Object.freeze({
      id: "MERGE_LOOP",
      lineNumber: 3,
      indent: 1,
      text: "enquanto p1 ≤ mid e p2 ≤ right faça",
    }),
    Object.freeze({
      id: "COMPARE_CONDITION",
      lineNumber: 4,
      indent: 2,
      text: "se A[p1] ≤ A[p2] então Buffer[k++] ← A[p1++]",
    }),
    Object.freeze({
      id: "ELSE_BRANCH",
      lineNumber: 5,
      indent: 2,
      text: "senão Buffer[k++] ← A[p2++]",
    }),
    Object.freeze({
      id: "DRAIN_REMAINDER",
      lineNumber: 6,
      indent: 1,
      text: "drenar restante de p1 ou p2 para Buffer",
    }),
    Object.freeze({
      id: "COPY_BACK",
      lineNumber: 7,
      indent: 1,
      text: "copiar Buffer[0..len-1] para A[left..right]",
    }),
  ]);
