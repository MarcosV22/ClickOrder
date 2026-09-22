/**
 * Gerador de execução canônica do Merge Sort para o Modo Demonstração.
 *
 * Utiliza exclusivamente a mergeSortEngine real como fonte de verdade matemática,
 * sem duplicação de regras, sem UI e sem temporizadores.
 */

import {
  initMergeSortState,
  getExpectedMergeStep,
  executeMergeStep,
  isMergeSortCompleted,
} from "../sorting/merge/mergeSortEngine";
import { CURATED_MERGE_DEMO_ARRAY } from "./curatedArrays";
import type { MergeDemonstrationExecution } from "./types";

/**
 * Executa de ponta a ponta uma demonstração autônoma e canônica do Merge Sort
 * sobre o vetor curado [7, 2, 5, 3] ou sobre um vetor fornecido.
 *
 * Executa passo a passo selecionando a decisão esperada em cada etapa interativa
 * (DISPATCH_LEFT, DISPATCH_RIGHT, DRAIN_REMAINDER) preservando todos os eventos
 * automáticos (DIVIDE, MERGE_INIT, COPY_BACK) até o término (COMPLETED).
 */
export function runMergeDemonstration(
  customArray?: readonly number[],
): MergeDemonstrationExecution {
  const initialArray = customArray ?? CURATED_MERGE_DEMO_ARRAY;
  let state = initMergeSortState(initialArray);

  // Proteção contra laço infinito
  const maxSafetySteps = 200;
  let stepsCount = 0;

  while (!isMergeSortCompleted(state) && stepsCount < maxSafetySteps) {
    stepsCount++;

    const expected = getExpectedMergeStep(state);
    if (!expected) break;

    const result = executeMergeStep(state, expected.expectedDecision);
    if (!result.valid) break;

    state = result.state;
  }

  const finalValues = state.values.map((elem) => elem.value);

  return Object.freeze({
    protocol: "merge",
    initialArray,
    finalValues: Object.freeze(finalValues),
    history: state.history,
    comparisons: state.comparisons,
    writesInBuffer: state.writesInBuffer,
    writesInMain: state.writesInMain,
    totalWrites: state.totalWrites,
    completed: state.completed,
  });
}
