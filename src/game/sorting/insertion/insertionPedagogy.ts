/**
 * Camada pedagógica transversal do Módulo Insertion Sort.
 *
 * Fornece feedbacks imediatos, explicativos e não punitivos para decisões do operador,
 * bem como dicas contextuais para o modo prática e tutorial, sem violar a pureza da engine.
 */

import type {
  InsertionDecision,
  InsertionSortState,
  InsertionStepResult,
} from "./types";
import { getExpectedInsertionStep } from "./insertionSortEngine";

/**
 * Retorna mensagem formativa detalhada para a decisão tomada pelo estudante na esteira.
 */
export function getInsertionStepFeedback(
  result: InsertionStepResult,
  stateBefore: InsertionSortState,
  decision: InsertionDecision,
): string {
  if (result.valid) {
    if (decision === "SHIFT_RIGHT") {
      const movedVal = stateBefore.currentValues[stateBefore.j];
      const targetPos = (stateBefore.holeIndex ?? 0) + 1;
      const originPos = stateBefore.j + 1;
      return `Excelente! Carga ${movedVal} (posição #${originPos}) deslocada para a vaga #${targetPos}. A vaga agora está na posição #${originPos}.`;
    }

    // decision === "INSERT_KEY"
    const insertedPos = (stateBefore.holeIndex ?? 0) + 1;
    const keyVal = stateBefore.key;
    if (stateBefore.phase === "INSERT_READY") {
      return `Perfeito! Cabeceira da esteira alcançada. Chave ${keyVal} encaixada na vaga #${insertedPos}. Região ORD expandida!`;
    }
    const comparedVal = stateBefore.currentValues[stateBefore.j];
    return `Perfeito! Como ${comparedVal} ≤ ${keyVal}, a posição de encaixe foi confirmada. Chave ${keyVal} encaixada na vaga #${insertedPos}!`;
  }

  // Tratamento de erros pedagógicos
  if (result.isPedagogicalError) {
    const keyVal = stateBefore.key;
    const comparedVal =
      stateBefore.j >= 0 ? stateBefore.currentValues[stateBefore.j] : null;

    if (decision === "INSERT_KEY") {
      return `Atenção: A carga inspecionada #${stateBefore.j + 1} (valor ${comparedVal}) ainda é MAIOR que a chave (${keyVal}). Ela deve ser deslocada antes do encaixe.`;
    }

    if (decision === "SHIFT_RIGHT") {
      return `Atenção: A carga inspecionada #${stateBefore.j + 1} (valor ${comparedVal}) já é MENOR OU IGUAL à chave (${keyVal}). Ela não deve ser deslocada. Encaixe a chave na vaga aberta.`;
    }
  }

  return (
    result.errorReason ??
    "Esta ação não é permitida no estado atual da esteira."
  );
}

/**
 * Gera dica contextual sem executar a ação nem dar resposta direta que anule o raciocínio.
 */
export function getInsertionContextualHint(
  state: InsertionSortState,
): string {
  if (state.completed || state.phase === "COMPLETED") {
    return "Ordenação concluída. Todas as cargas foram posicionadas em ordem crescente na esteira.";
  }

  if (state.phase === "INSERT_READY") {
    const targetSlot = (state.holeIndex ?? 0) + 1;
    return `A varredura atingiu a cabeceira da esteira (j = -1). Não existem elementos anteriores menores. Encaixe a chave (${state.key}) na vaga aberta #${targetSlot}.`;
  }

  const currentJ = state.j;
  const comparedValue =
    currentJ >= 0 ? state.currentValues[currentJ] : null;
  const key = state.key;

  if (comparedValue === null || key === null) {
    return "Analise o estado da chave suspensa no trilho aéreo e a vaga aberta na esteira.";
  }

  const isGreaterThan = comparedValue > key;
  if (isGreaterThan) {
    return `Observe a relação: A[${currentJ}] (${comparedValue}) > CHAVE (${key}). Como o item na esteira é maior que a chave, ele deve abrir espaço movendo-se para a direita.`;
  } else {
    return `Observe a relação: A[${currentJ}] (${comparedValue}) ≤ CHAVE (${key}). A chave encontrou seu limite na partição ordenada e deve pousar na vaga atual.`;
  }
}
