/**
 * Gerador de execução canônica do Selection Sort para o Modo Demonstração.
 *
 * Utiliza exclusivamente a SelectionSortEngine real como fonte de verdade matemática,
 * sem duplicação de regras ou sequências manuais em React.
 */

import {
  createSelectionSortState,
  getExpectedSelectionInspection,
  executeSelectionInspection,
  commitSelectionPass,
} from "../sorting/selection/selectionSortEngine";
import { CURATED_SELECTION_DEMO_ARRAY } from "./curatedArrays";
import type { SelectionDemonstrationExecution } from "./types";

/**
 * Executa de ponta a ponta uma demonstração autônoma e canônica do Selection Sort
 * sobre o vetor curado ou sobre um vetor fornecido.
 *
 * Alterna deterministicamente entre as fases INSPECT (tomando a decisão correta
 * entre SELECT_NEW_MIN e KEEP_MIN) e COMMIT (transferindo pontualmente o menor elemento).
 */
export function runSelectionDemonstration(
  customArray?: readonly number[],
): SelectionDemonstrationExecution {
  const initialArray = customArray ?? CURATED_SELECTION_DEMO_ARRAY;
  let state = createSelectionSortState(initialArray);

  // Proteção contra laço infinito
  const maxSafetySteps = 200;
  let stepsCount = 0;

  while (!state.completed && stepsCount < maxSafetySteps) {
    stepsCount++;

    if (state.phase === "INSPECT") {
      const expected = getExpectedSelectionInspection(state);
      if (!expected) break;

      const result = executeSelectionInspection(state, expected.expectedDecision);
      if (!result.valid) break;

      state = result.state;
    } else if (state.phase === "COMMIT") {
      const result = commitSelectionPass(state);
      if (!result.valid) break;

      state = result.state;
    } else {
      break;
    }
  }

  return Object.freeze({
    protocol: "selection",
    initialArray,
    finalValues: state.currentValues,
    history: state.history,
    comparisons: state.comparisons,
    swaps: state.swaps,
    totalPasses: Math.max(1, initialArray.length - 1),
    completed: state.completed,
  });
}
