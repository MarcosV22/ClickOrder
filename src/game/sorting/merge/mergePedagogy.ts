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
        return `Excelente! Ambas as cargas possuem valor ${leftElem.value}. Você priorizou corretamente a carga do Ramal Esquerdo (${formatMergeElementLabel(leftElem)}), preservando a estabilidade da ordenação!`;
      }
      return `Muito bem! Carga menor ${formatMergeElementLabel(leftElem)} do Ramal Esquerdo colhida para a esteira coletora.`;
    }

    if (decision === "DISPATCH_RIGHT") {
      const rightElem = stateBefore.values[stateBefore.p2];
      return `Muito bem! Carga menor ${formatMergeElementLabel(rightElem)} do Ramal Direito colhida para a esteira coletora.`;
    }

    if (decision === "DRAIN_REMAINDER") {
      const remainingBranch =
        stateBefore.activeInterval &&
        stateBefore.p1 <= stateBefore.activeInterval.mid
          ? "Esquerdo"
          : "Direito";
      return `Perfeito! O ramal oposto foi totalmente colhido. As cargas restantes do Ramal ${remainingBranch} foram drenadas diretamente para a esteira coletora sem necessidade de novas comparações!`;
    }
  }

  // Tratamento de erros conceituais pedagógicos:
  if (result.isPedagogicalError) {
    if (stateBefore.phase === "COMPARE_HEADS" && stateBefore.activeInterval) {
      const leftElem = stateBefore.values[stateBefore.p1];
      const rightElem = stateBefore.values[stateBefore.p2];
      const isTie = leftElem.value === rightElem.value;

      if (isTie) {
        return `Atenção à Regra de Estabilidade: Ambas as cargas possuem valor ${leftElem.value}. No Merge Sort, em caso de empate, é obrigatório colher a carga do Ramal Esquerdo (${formatMergeElementLabel(leftElem)}) para preservar a ordem relativa original.`;
      }

      if (decision === "DISPATCH_LEFT") {
        return `Atenção na Confluência: A carga do Ramal Esquerdo (${formatMergeElementLabel(leftElem)}) é MAIOR que a do Ramal Direito (${formatMergeElementLabel(rightElem)}). O Merge Sort exige sempre colher a menor carga para o buffer.`;
      }

      if (decision === "DISPATCH_RIGHT") {
        return `Atenção na Confluência: A carga do Ramal Direito (${formatMergeElementLabel(rightElem)}) é MAIOR que a do Ramal Esquerdo (${formatMergeElementLabel(leftElem)}). O Merge Sort exige sempre colher a menor carga para o buffer.`;
      }
    }
  }

  return (
    result.errorReason ??
    "Esta ação não é permitida no estado atual da confluência de esteiras."
  );
}

/**
 * Gera dica contextual sem executar a ação nem dar resposta direta que anule o raciocínio.
 */
export function getMergeContextualHint(state: MergeSortState): string {
  if (state.completed || state.phase === "COMPLETED") {
    return "Ordenação concluída! Todas as cargas foram consolidadas em ordem crescente na esteira principal com status OK.";
  }

  const expected = getExpectedMergeStep(state);
  if (!expected) {
    return "Acompanhe as esteiras convergentes para intercalar as cargas ordenadamente.";
  }

  if (state.phase === "DRAIN_READY") {
    return "Um dos ramais já foi totalmente colhido. Como o outro ramal já está ordenado, comande a Drenagem para transferir o restante sem novas comparações.";
  }

  if (state.phase === "COMPARE_HEADS" && expected.leftElement && expected.rightElement) {
    const leftVal = expected.leftElement.value;
    const rightVal = expected.rightElement.value;

    if (leftVal === rightVal) {
      return `Empate detectado (${leftVal} = ${rightVal})! Lembre-se da regra de estabilidade: quando os valores forem iguais, colha sempre a carga do Ramal Esquerdo.`;
    }

    if (leftVal < rightVal) {
      return `Compare as frentes: Ramal Esquerdo (${leftVal}) versus Ramal Direito (${rightVal}). Identifique a menor carga para despachar à esteira coletora.`;
    }

    return `Compare as frentes: Ramal Esquerdo (${leftVal}) versus Ramal Direito (${rightVal}). Identifique a menor carga para despachar à esteira coletora.`;
  }

  return expected.explanation;
}
