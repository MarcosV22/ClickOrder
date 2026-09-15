/**
 * Gerador de execução canônica do Insertion Sort para o Modo Demonstração.
 *
 * Utiliza exclusivamente a InsertionSortEngine real como fonte de verdade matemática,
 * sem duplicação de regras ou sequências manuais em React.
 */

import {
  createInsertionSortState,
  getExpectedInsertionStep,
  executeInsertionStep,
} from "../sorting/insertion/insertionSortEngine";
import { CURATED_INSERTION_DEMO_ARRAY } from "./curatedArrays";
import type { InsertionDemonstrationExecution } from "./types";

/**
 * Executa de ponta a ponta uma demonstração autônoma e canônica do Insertion Sort
 * sobre o vetor curado ou sobre um vetor fornecido.
 *
 * Executa passo a passo selecionando a decisão esperada em cada etapa
 * (SHIFT_RIGHT ou INSERT_KEY) até a estabilização completa (COMPLETED).
 */
export function runInsertionDemonstration(
  customArray?: readonly number[],
): InsertionDemonstrationExecution {
  const initialArray = customArray ?? CURATED_INSERTION_DEMO_ARRAY;
  let state = createInsertionSortState(initialArray);

  // Proteção contra laço infinito
  const maxSafetySteps = 200;
  let stepsCount = 0;

  while (!state.completed && stepsCount < maxSafetySteps) {
    stepsCount++;

    const expected = getExpectedInsertionStep(state);
    if (!expected) break;

    const result = executeInsertionStep(state, expected.expectedDecision);
    if (!result.valid) break;

    state = result.state;
  }

  return Object.freeze({
    protocol: "insertion",
    initialArray,
    finalValues: state.currentValues as readonly number[],
    history: state.history,
    comparisons: state.comparisons,
    shifts: state.shifts,
    insertions: state.insertions,
    totalPasses: Math.max(1, initialArray.length - 1),
    completed: state.completed,
  });
}
