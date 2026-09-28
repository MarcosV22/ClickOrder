/**
 * Gerador de execução canônica do Quick Sort para o Modo Demonstração.
 *
 * Utiliza exclusivamente a quickSortEngine real como fonte de verdade matemática,
 * sem duplicação de regras, sem UI e sem temporizadores.
 */

import {
  initQuickSortState,
  stepQuickSort,
} from "../sorting/quick/quickSortEngine";
import { CURATED_QUICK_DEMO_ARRAY } from "./curatedArrays";
import type { QuickDemonstrationExecution } from "./types";

/**
 * Executa de ponta a ponta uma demonstração autônoma e canônica do Quick Sort
 * sobre o vetor curado [5, 2, 4, 1, 3] ou sobre um vetor fornecido.
 *
 * Executa passo a passo selecionando a decisão correta em cada etapa interativa
 * (LESS_OR_EQUAL, GREATER, PLACE_PIVOT) preservando todos os eventos
 * automáticos (PARTITION_START, BASE_CASE_RESOLVED, SORT_COMPLETE) até o término (completed: true).
 */
export function runQuickDemonstration(
  customArray?: readonly number[],
): QuickDemonstrationExecution {
  const initialArray = customArray ?? CURATED_QUICK_DEMO_ARRAY;
  let state = initQuickSortState(initialArray);

  const maxSafetySteps = 200;
  let stepsCount = 0;

  while (!state.completed && stepsCount++ < maxSafetySteps) {
    if (state.phase === "INSPECT_ELEMENT") {
      const current = state.values[state.j];
      const pivot = state.values[state.activeInterval!.high];
      const decision = current.value <= pivot.value ? "LESS_OR_EQUAL" : "GREATER";
      const result = stepQuickSort(state, decision);
      state = result.state;
    } else if (state.phase === "PARTITION_READY_FOR_PIVOT") {
      const result = stepQuickSort(state, "PLACE_PIVOT");
      state = result.state;
    } else {
      break;
    }
  }

  const finalValues = state.values.map((elem) => elem.value);

  return Object.freeze({
    protocol: "quick",
    initialArray,
    finalValues: Object.freeze(finalValues),
    history: state.history,
    comparisons: state.comparisons,
    swaps: state.swaps,
    writesInArray: state.writesInArray,
    completed: state.completed,
  });
}
