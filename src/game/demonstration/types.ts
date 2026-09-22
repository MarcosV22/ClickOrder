/**
 * Tipos fundamentais para a camada de Modo Demonstração Educacional do Sorting Station.
 *
 * Módulo puramente conceitual e livre de efeitos colaterais.
 */

import type { StepRecord } from "../sorting/types";
import type { SelectionStepRecord } from "../sorting/selection/types";
import type { InsertionStepRecord } from "../sorting/insertion/types";
import type { MergeStepRecord } from "../sorting/merge/types";

export type DemonstrationProtocol = "bubble" | "selection" | "insertion" | "merge";

export interface BubbleDemonstrationExecution {
  readonly protocol: "bubble";
  readonly initialArray: readonly number[];
  readonly finalValues: readonly number[];
  readonly history: readonly StepRecord[];
  readonly comparisons: number;
  readonly swaps: number;
  readonly totalPasses: number;
  readonly completed: boolean;
}

export interface SelectionDemonstrationExecution {
  readonly protocol: "selection";
  readonly initialArray: readonly number[];
  readonly finalValues: readonly number[];
  readonly history: readonly SelectionStepRecord[];
  readonly comparisons: number;
  readonly swaps: number;
  readonly totalPasses: number;
  readonly completed: boolean;
}

export interface InsertionDemonstrationExecution {
  readonly protocol: "insertion";
  readonly initialArray: readonly number[];
  readonly finalValues: readonly number[];
  readonly history: readonly InsertionStepRecord[];
  readonly comparisons: number;
  readonly shifts: number;
  readonly insertions: number;
  readonly totalPasses: number;
  readonly completed: boolean;
}

export interface MergeDemonstrationExecution {
  readonly protocol: "merge";
  readonly initialArray: readonly number[];
  readonly finalValues: readonly number[];
  readonly history: readonly MergeStepRecord[];
  readonly comparisons: number;
  readonly writesInBuffer: number;
  readonly writesInMain: number;
  readonly totalWrites: number;
  readonly completed: boolean;
}

export type DemonstrationExecution =
  | BubbleDemonstrationExecution
  | SelectionDemonstrationExecution
  | InsertionDemonstrationExecution
  | MergeDemonstrationExecution;

