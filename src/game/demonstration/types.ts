/**
 * Tipos fundamentais para a camada de Modo Demonstração Educacional do Sorting Station.
 *
 * Módulo puramente conceitual e livre de efeitos colaterais.
 */

import type { StepRecord } from "../sorting/types";
import type { SelectionStepRecord } from "../sorting/selection/types";

export type DemonstrationProtocol = "bubble" | "selection";

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

export type DemonstrationExecution =
  | BubbleDemonstrationExecution
  | SelectionDemonstrationExecution;
