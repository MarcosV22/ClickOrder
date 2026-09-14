/**
 * Gerador de execução canônica do Bubble Sort para o Modo Demonstração.
 *
 * Utiliza exclusivamente a BubbleSortEngine real como fonte de verdade matemática,
 * sem duplicação de regras ou sequências manuais em React.
 */

import {
  createBubbleSortState,
  getExpectedComparison,
  executeUserStep,
} from "../sorting/bubbleSortEngine";
import { CURATED_BUBBLE_DEMO_ARRAY } from "./curatedArrays";
import type { BubbleDemonstrationExecution } from "./types";

/**
 * Executa de ponta a ponta uma demonstração autônoma e canônica do Bubble Sort
 * sobre o vetor curado ou sobre um vetor fornecido.
 *
 * Garante que apenas decisões corretas sejam tomadas a cada passo, gerando
 * um histórico factual idêntico ao produzido pela engine durante o gameplay real.
 */
export function runBubbleDemonstration(
  customArray?: readonly number[],
): BubbleDemonstrationExecution {
  const initialArray = customArray ?? CURATED_BUBBLE_DEMO_ARRAY;
  let state = createBubbleSortState(initialArray, { variant: "CANONICAL" });

  // Proteção contra laço infinito
  const maxSafetySteps = 200;
  let stepsCount = 0;

  while (!state.completed && stepsCount < maxSafetySteps) {
    stepsCount++;
    const expected = getExpectedComparison(state);
    if (!expected) break;

    const decision = expected.shouldSwap ? "SWAP" : "KEEP";
    const result = executeUserStep(state, decision);

    if (!result.valid) {
      break;
    }

    state = result.state;
  }

  return Object.freeze({
    protocol: "bubble",
    initialArray,
    finalValues: state.currentValues,
    history: state.history,
    comparisons: state.comparisons,
    swaps: state.swaps,
    totalPasses: Math.max(1, initialArray.length - 1),
    completed: state.completed,
  });
}
