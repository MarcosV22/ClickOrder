/**
 * Camada pedagógica transversal do Módulo Merge Sort.
 *
 * Fornece feedbacks imediatos, formativos e não punitivos para decisões do operador,
 * bem como dicas contextuais para o modo prática e tutorial, sem violar a pureza da engine.
 */

import type {
  MergeDecision,
  MergeElement,
  MergeSortState,
  MergeStepResult,
} from "./types";
import { getExpectedMergeStep } from "./mergeSortEngine";

/**
 * Formata um elemento com seu valor e rótulo didático (ex.: "4a", "1", "3").
 */
export function formatMergeElementLabel(element: MergeElement): string {
  if (element.label) {
    return `${element.value}${element.label}`;
  }
  return `${element.value}`;
}

/**
 * Retorna mensagem formativa detalhada para a decisão tomada pelo estudante na confluência.
 */
export function getMergeStepFeedback(
  result: MergeStepResult,
  stateBefore: MergeSortState,
  decision: MergeDecision,
): string {
  if (result.valid) {
    if (decision === "DISPATCH_LEFT") {
      const leftElem = stateBefore.values[stateBefore.p1];
      const rightElem =
        stateBefore.activeInterval &&
        stateBefore.p2 <= stateBefore.activeInterval.right
          ? stateBefore.values[stateBefore.p2]
          : null;
      const isTie = rightElem !== null && leftElem.value === rightElem.value;

      if (isTie) {
        return `Excelente! Os dois números têm valor ${leftElem.value}. Você escolheu o elemento da esquerda (${formatMergeElementLabel(leftElem)}), mantendo a estabilidade da ordenação!`;
      }
      return `Correto! O menor número (${formatMergeElementLabel(leftElem)}) foi copiado do grupo da esquerda para o vetor auxiliar.`;
    }

    if (decision === "DISPATCH_RIGHT") {
      const rightElem = stateBefore.values[stateBefore.p2];
      return `Correto! O menor número (${formatMergeElementLabel(rightElem)}) foi copiado do grupo da direita para o vetor auxiliar.`;
    }

    if (decision === "DRAIN_REMAINDER") {
      const remainingBranch =
        stateBefore.activeInterval &&
        stateBefore.p1 <= stateBefore.activeInterval.mid
          ? "esquerda"
          : "direita";
      return `Perfeito! O outro grupo terminou. Os números restantes do grupo da ${remainingBranch} foram copiados para o vetor auxiliar sem necessidade de novas comparações, pois já estão ordenados!`;
    }
  }

  // Tratamento de erros conceituais pedagógicos:
  if (result.isPedagogicalError) {
    if (stateBefore.phase === "COMPARE_HEADS" && stateBefore.activeInterval) {
      const leftElem = stateBefore.values[stateBefore.p1];
      const rightElem = stateBefore.values[stateBefore.p2];
      const isTie = leftElem.value === rightElem.value;

      if (isTie) {
        return `Atenção à Estabilidade: ambos os números têm valor ${leftElem.value}. No Merge Sort, em caso de empate, escolha sempre o número do grupo da esquerda (${formatMergeElementLabel(leftElem)}) para manter a ordem original.`;
      }

      if (decision === "DISPATCH_LEFT") {
        return `Atenção: o número da esquerda (${formatMergeElementLabel(leftElem)}) é MAIOR que o da direita (${formatMergeElementLabel(rightElem)}). Escolha sempre o menor número para a próxima posição do vetor auxiliar.`;
      }

      if (decision === "DISPATCH_RIGHT") {
        return `Atenção: o número da direita (${formatMergeElementLabel(rightElem)}) é MAIOR que o da esquerda (${formatMergeElementLabel(leftElem)}). Escolha sempre o menor número para a próxima posição do vetor auxiliar.`;
      }
    }
  }

  return (
    result.errorReason ??
    "Esta ação não é permitida no estado atual da intercalação."
  );
}

/**
 * Gera dica contextual sem executar a ação nem dar resposta direta que anule o raciocínio.
 */
export function getMergeContextualHint(state: MergeSortState): string {
  if (state.completed || state.phase === "COMPLETED") {
    return "Ordenação concluída! Todos os números foram organizados em ordem crescente no vetor principal com status OK.";
  }

  const expected = getExpectedMergeStep(state);
  if (!expected) {
    return "Acompanhe a intercalação para juntar os grupos em ordem.";
  }

  if (state.phase === "DRAIN_READY") {
    return "Um dos grupos terminou. Copie os números restantes do outro grupo diretamente para o vetor auxiliar: não são necessárias novas comparações porque aquele grupo já está ordenado.";
  }

  if (state.phase === "COMPARE_HEADS" && expected.leftElement && expected.rightElement) {
    return "Compare os dois números destacados: escolha o menor para a próxima posição do vetor auxiliar. Se os dois forem iguais, escolha o da esquerda (estabilidade).";
  }

  return expected.explanation;
}
