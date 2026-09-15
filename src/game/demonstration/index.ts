/**
 * Ponto de entrada canônico da camada de Modo Demonstração Educacional.
 */

import { runBubbleDemonstration } from "./bubbleDemonstration";
import { runSelectionDemonstration } from "./selectionDemonstration";
import { runInsertionDemonstration } from "./insertionDemonstration";
import {
  CURATED_BUBBLE_DEMO_ARRAY,
  CURATED_SELECTION_DEMO_ARRAY,
  CURATED_INSERTION_DEMO_ARRAY,
} from "./curatedArrays";
import type {
  DemonstrationProtocol,
  DemonstrationExecution,
  BubbleDemonstrationExecution,
  SelectionDemonstrationExecution,
  InsertionDemonstrationExecution,
} from "./types";

export * from "./types";
export * from "./curatedArrays";
export * from "./bubbleDemonstration";
export * from "./selectionDemonstration";
export * from "./insertionDemonstration";

/**
 * Obtém a execução canônica pré-computada para o protocolo especificado.
 */
export function getDemonstrationExecution(
  protocol: "bubble",
): BubbleDemonstrationExecution;
export function getDemonstrationExecution(
  protocol: "selection",
): SelectionDemonstrationExecution;
export function getDemonstrationExecution(
  protocol: "insertion",
): InsertionDemonstrationExecution;
export function getDemonstrationExecution(
  protocol: DemonstrationProtocol,
): DemonstrationExecution;
export function getDemonstrationExecution(
  protocol: DemonstrationProtocol,
): DemonstrationExecution {
  if (protocol === "bubble") {
    return runBubbleDemonstration(CURATED_BUBBLE_DEMO_ARRAY);
  }
  if (protocol === "selection") {
    return runSelectionDemonstration(CURATED_SELECTION_DEMO_ARRAY);
  }
  if (protocol === "insertion") {
    return runInsertionDemonstration(CURATED_INSERTION_DEMO_ARRAY);
  }
  throw new Error(`Protocolo de demonstração não suportado: ${protocol}`);
}
