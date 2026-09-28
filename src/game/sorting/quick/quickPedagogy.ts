/**
 * Camada pedagógica pura do Quick Sort.
 * Fornece feedbacks formativos, scaffolding progressivo de dicas em 3 níveis
 * e derivação rigorosa de estados visuais com precedência estrita.
 *
 * Módulo 100% puro, sem acoplamento a React, DOM ou temporizadores.
 */

import type {
  QuickDecision,
  QuickSortState,
  QuickVisualStepFrame,
} from "./types";

/**
 * Estrutura do feedback pedagógico após uma decisão do estudante.
 */
export interface QuickFeedbackInfo {
  readonly valid: boolean;
  readonly message: string;
  readonly explanation: string;
  readonly suggestedAction?: string;
}

/**
 * Gera feedback formativo imediato e contextualizado quando o estudante comete um erro
 * ou quando solicita validação de uma decisão.
 */
export function getQuickFeedback(
  state: QuickSortState,
  attemptedDecision: QuickDecision,
): QuickFeedbackInfo {
  if (state.completed || state.phase === "COMPLETED") {
    return Object.freeze({
      valid: false,
      message: "O vetor já está completamente ordenado.",
      explanation: "Todos os elementos receberam o selo DEFINITIVO. Nenhuma ação pendente.",
    });
  }

  const interval = state.activeInterval;
  if (!interval) {
    return Object.freeze({
      valid: false,
      message: "Nenhum intervalo ativo em processamento.",
      explanation: "Aguardando avanço de subproblemas da ordenação.",
    });
  }

  const pivot = state.values[interval.high];
  const current = state.values[state.j];

  // Fase 1: INSPECT_ELEMENT (classificar elemento atual contra o pivô)
  if (state.phase === "INSPECT_ELEMENT") {
    if (attemptedDecision === "PLACE_PIVOT") {
      return Object.freeze({
        valid: false,
        message: "Ainda há números para analisar neste trecho.",
        explanation: `O número ${current.value} (índice ${state.j}) precisa ser classificado em relação ao pivô ${pivot.value} antes de posicionar o pivô na posição final.`,
        suggestedAction: current.value <= pivot.value ? "LESS_OR_EQUAL" : "GREATER",
      });
    }

    if (attemptedDecision === "LESS_OR_EQUAL") {
      if (current.value <= pivot.value) {
        return Object.freeze({
          valid: true,
          message: "Classificação correta!",
          explanation: `O número ${current.value} é menor ou igual ao pivô ${pivot.value} (${current.value} ≤ ${pivot.value}).`,
        });
      }
      return Object.freeze({
        valid: false,
        message: "Classificação incorreta: o número é maior que o pivô.",
        explanation: `O número analisado (${current.value}) é estritamente maior que o pivô (${pivot.value}). Ele deve permanecer na região dos maiores.`,
        suggestedAction: "GREATER",
      });
    }

    if (attemptedDecision === "GREATER") {
      if (current.value > pivot.value) {
        return Object.freeze({
          valid: true,
          message: "Classificação correta!",
          explanation: `O número ${current.value} é estritamente maior que o pivô ${pivot.value} (${current.value} > ${pivot.value}).`,
        });
      }
      return Object.freeze({
        valid: false,
        message: "Classificação incorreta: o número é menor ou igual ao pivô.",
        explanation: `O número analisado (${current.value}) é menor ou igual ao pivô (${pivot.value}). Pela regra, valores iguais também pertencem à região menor ou igual (≤).`,
        suggestedAction: "LESS_OR_EQUAL",
      });
    }
  }

  // Fase 2: PARTITION_READY_FOR_PIVOT (colocar o pivô na posição final)
  if (state.phase === "PARTITION_READY_FOR_PIVOT") {
    if (attemptedDecision === "PLACE_PIVOT") {
      return Object.freeze({
        valid: true,
        message: "Posicionamento do pivô correto!",
        explanation: `Todos os elementos do trecho foram classificados. O pivô ${pivot.value} foi para a fronteira definitiva.`,
      });
    }
    return Object.freeze({
      valid: false,
      message: "A varredura deste trecho já terminou.",
      explanation: `Todos os elementos já foram separados entre menores/iguais e maiores. A única ação necessária agora é posicionar o pivô ${pivot.value}.`,
      suggestedAction: "PLACE_PIVOT",
    });
  }

  return Object.freeze({
    valid: false,
    message: "Ação inválida para o estado atual.",
    explanation: "Verifique a fase atual do algoritmo.",
  });
}

/**
 * Scaffolding progressivo de dicas em 3 níveis (Nível 1: Identificação, Nível 2: Relação Matemática, Nível 3: Ação Recomendada).
 * Nas práticas regulares, os níveis 1 e 2 não revelam a resposta antes da escolha do aluno.
 */
export function getQuickHint(
  state: QuickSortState,
  hintLevel: 1 | 2 | 3,
): string {
  if (state.completed || state.phase === "COMPLETED") {
    return "A ordenação foi concluída com sucesso. Todos os elementos estão em suas posições definitivas.";
  }

  const interval = state.activeInterval;
  if (!interval) {
    return "Aguarde a ativação do próximo trecho de ordenação.";
  }

  const pivot = state.values[interval.high];
  const current = state.values[state.j];

  if (state.phase === "INSPECT_ELEMENT") {
    switch (hintLevel) {
      case 1:
        return `Observe o pivô (${pivot.value}) fixado no fim do trecho e o número sob análise (${current.value}) no índice ${state.j}.`;
      case 2:
        return `Compare o valor em análise (${current.value}) com o valor do pivô (${pivot.value}): verifique se ${current.value} ≤ ${pivot.value} ou se ${current.value} > ${pivot.value}.`;
      case 3:
        if (current.value <= pivot.value) {
          return `Como ${current.value} ≤ ${pivot.value}, escolha a ação 'Menor ou Igual (≤ PIVÔ)'.`;
        }
        return `Como ${current.value} > ${pivot.value}, escolha a ação 'Maior (> PIVÔ)'.`;
    }
  }

  if (state.phase === "PARTITION_READY_FOR_PIVOT") {
    switch (hintLevel) {
      case 1:
        return "Todos os números do trecho foram analisados. O pivô está pronto para ser posicionado na fronteira.";
      case 2:
        return `O pivô (${pivot.value}) deve ser colocado imediatamente após a região dos menores ou iguais (no índice ${state.i + 1}).`;
      case 3:
        return "Clique em 'Posicionar Pivô' para colocá-lo na sua posição definitiva com o selo OK.";
    }
  }

  return "Acompanhe as instruções na tela para prosseguir.";
}

/**
 * Status visual unificado de um elemento para renderização na interface ou no Replay.
 */
export type QuickElementVisualStatus =
  | "DEFINITIVE" // Selo verde esmeralda OK DEFINITIVO
  | "OUTSIDE_INTERVAL" // Fora do intervalo ativo (atenuado)
  | "PIVOT" // Pivô ativo no intervalo
  | "COMPARING" // Elemento sob análise ativa no índice j
  | "LESS_OR_EQUAL_REGION" // Região de elementos <= pivô (low <= idx <= i)
  | "GREATER_REGION" // Região de elementos > pivô (i < idx < j)
  | "PENDING_IN_INTERVAL"; // Elementos no intervalo aguardando inspeção (j < idx < high)

/**
 * Deriva o status visual de um elemento com base nas regras de precedência formal:
 * 1. DEFINITIVE: Elemento já consolidado com selo OK (em sortedIndices).
 *    Mesmo se coincidir com índices anteriores, elementos consolidados mantêm destaque definitivo.
 * 2. OUTSIDE_INTERVAL: Elemento fora do intervalo ativo (não deve ser classificado por ponteiros).
 * 3. PIVOT: Elemento na posição do pivô do intervalo ativo.
 * 4. COMPARING: Elemento no índice j da inspeção ativa.
 * 5. LESS_OR_EQUAL_REGION: Elemento no trecho [low..i] do intervalo ativo.
 * 6. GREATER_REGION: Elemento no trecho [i+1..j-1] do intervalo ativo.
 * 7. PENDING_IN_INTERVAL: Elemento no trecho [j+1..high-1] do intervalo ativo.
 */
export function getQuickElementVisualStatus(
  index: number,
  stateOrFrame: QuickVisualStepFrame | QuickSortState,
): QuickElementVisualStatus {
  // Precedência 1: Selo DEFINITIVO prevalece sobre qualquer papel anterior
  if (stateOrFrame.sortedIndices.includes(index)) {
    return "DEFINITIVE";
  }

  const interval = stateOrFrame.activeInterval;
  // Precedência 2: Se não há intervalo ativo ou se o elemento está fora dele, está atenuado
  if (!interval || index < interval.low || index > interval.high) {
    return "OUTSIDE_INTERVAL";
  }

  // Precedência 3: Pivô do intervalo ativo
  if (index === interval.high) {
    return "PIVOT";
  }

  // Precedência 4: Elemento sob análise ativa
  if (index === stateOrFrame.j) {
    return "COMPARING";
  }

  // Precedência 5: Região dos menores ou iguais (low <= idx <= i)
  if (index >= interval.low && index <= stateOrFrame.i) {
    return "LESS_OR_EQUAL_REGION";
  }

  // Precedência 6: Região dos maiores (i < idx < j)
  if (index > stateOrFrame.i && index < stateOrFrame.j) {
    return "GREATER_REGION";
  }

  // Precedência 7: Pendente no intervalo ativo
  return "PENDING_IN_INTERVAL";
}
