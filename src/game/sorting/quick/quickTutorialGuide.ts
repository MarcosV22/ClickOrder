/**
 * Scaffolding pedagógico e controlador interativo do tutorial guiado de Quick Sort.
 * Utiliza exclusivamente a quickSortEngine real como fonte de verdade algorítmica.
 *
 * Vetor didático canônico fixo: [4a, 4b, 1, 2, 3]
 * Racional pedagógico:
 * 1. Partição Raiz [0..4] (Pivô = 3):
 *    - 4a > 3 -> GREATER (avanço sem troca);
 *    - 4b > 3 -> GREATER (avanço sem troca);
 *    - 1 <= 3 -> LESS_OR_EQUAL -> troca 4a com 1 -> [1, 4b, 4a, 2, 3];
 *    - 2 <= 3 -> LESS_OR_EQUAL -> troca 4b com 2 -> [1, 2, 4a, 4b, 3];
 *    - PLACE_PIVOT -> troca 4a com 3 -> [1, 2, 3, 4b, 4a]. Pivô 3 selado no índice 2 com OK DEFINITIVO.
 * 2. Subproblema Esquerdo [0..1] (Pivô = 2):
 *    - 1 <= 2 -> LESS_OR_EQUAL -> auto-troca omitida (i == j == 0);
 *    - PLACE_PIVOT -> auto-troca omitida (p == high == 1) -> 2 selado como DEFINITIVO.
 *    - Avanço automático consolida o caso base unitário [0..0] (1 selado).
 * 3. Subproblema Direito [3..4] (Pivô = 4a):
 *    - 4b <= 4a -> LESS_OR_EQUAL (confronto de igualdade 4 == 4!) -> auto-troca omitida;
 *    - PLACE_PIVOT -> auto-troca omitida -> 4a selado no índice 4.
 *    - Avanço automático consolida o caso base unitário [3..3] (4b selado).
 * 4. Conclusão:
 *    - Vetor final: [1, 2, 3, 4b, 4a]
 *    - As duplicatas 4a e 4b inverteram sua ordem relativa original, demonstrando
 *      pedagogicamente a instabilidade formal do Quick Sort.
 *    - Métricas: exatamente 6 comparações, 3 trocas, 6 escritas.
 */

import {
  createQuickElement,
  initQuickSortState,
  stepQuickSort,
} from "./quickSortEngine";
import { getQuickFeedback } from "./quickPedagogy";
import type {
  QuickDecision,
  QuickElement,
  QuickPhase,
  QuickSortState,
} from "./types";

/**
 * Vetor didático canônico imutável para o tutorial guiado do Quick Sort: [4a, 4b, 1, 2, 3]
 */
export const QUICK_TUTORIAL_INITIAL_ARRAY: readonly QuickElement[] = Object.freeze([
  createQuickElement(4, 0, "a", "tut"),
  createQuickElement(4, 1, "b", "tut"),
  createQuickElement(1, 2, undefined, "tut"),
  createQuickElement(2, 3, undefined, "tut"),
  createQuickElement(3, 4, undefined, "tut"),
]);

export type QuickTutorialMilestoneId =
  | "ROOT_COMPARE_4A"
  | "ROOT_COMPARE_4B"
  | "ROOT_COMPARE_1"
  | "ROOT_COMPARE_2"
  | "ROOT_PLACE_PIVOT"
  | "LEFT_COMPARE_1"
  | "LEFT_PLACE_PIVOT"
  | "RIGHT_COMPARE_4B_EQUAL_4A"
  | "RIGHT_PLACE_PIVOT"
  | "COMPLETED";

export const QUICK_TUTORIAL_MILESTONES_ORDER: readonly QuickTutorialMilestoneId[] =
  Object.freeze([
    "ROOT_COMPARE_4A",
    "ROOT_COMPARE_4B",
    "ROOT_COMPARE_1",
    "ROOT_COMPARE_2",
    "ROOT_PLACE_PIVOT",
    "LEFT_COMPARE_1",
    "LEFT_PLACE_PIVOT",
    "RIGHT_COMPARE_4B_EQUAL_4A",
    "RIGHT_PLACE_PIVOT",
  ]);

export interface QuickTutorialStepInfo {
  readonly phase: QuickPhase;
  readonly milestoneId: QuickTutorialMilestoneId;
  readonly stepIndex: number;
  readonly totalSteps: number;
  readonly title: string;
  readonly instruction: string;
  readonly hint: string;
  readonly expectedDecision: QuickDecision | null;
  readonly instabilityNotice?: string;
  readonly canLessOrEqual: boolean;
  readonly canGreater: boolean;
  readonly canPlacePivot: boolean;
}

/**
 * Deriva deterministicamente o marco atual do tutorial a partir do estado da engine.
 */
export function deriveQuickTutorialMilestone(
  state: QuickSortState,
): QuickTutorialMilestoneId {
  if (state.completed || state.phase === "COMPLETED") {
    return "COMPLETED";
  }

  const interval = state.activeInterval;
  if (!interval) {
    return "COMPLETED";
  }

  // Partição Raiz [0..4]
  if (interval.low === 0 && interval.high === 4) {
    if (state.phase === "INSPECT_ELEMENT") {
      if (state.j === 0) return "ROOT_COMPARE_4A";
      if (state.j === 1) return "ROOT_COMPARE_4B";
      if (state.j === 2) return "ROOT_COMPARE_1";
      if (state.j === 3) return "ROOT_COMPARE_2";
    }
    if (state.phase === "PARTITION_READY_FOR_PIVOT") {
      return "ROOT_PLACE_PIVOT";
    }
  }

  // Subpartição Esquerda [0..1]
  if (interval.low === 0 && interval.high === 1) {
    if (state.phase === "INSPECT_ELEMENT") {
      return "LEFT_COMPARE_1";
    }
    if (state.phase === "PARTITION_READY_FOR_PIVOT") {
      return "LEFT_PLACE_PIVOT";
    }
  }

  // Subpartição Direita [3..4]
  if (interval.low === 3 && interval.high === 4) {
    if (state.phase === "INSPECT_ELEMENT") {
      return "RIGHT_COMPARE_4B_EQUAL_4A";
    }
    if (state.phase === "PARTITION_READY_FOR_PIVOT") {
      return "RIGHT_PLACE_PIVOT";
    }
  }

  return "COMPLETED";
}

/**
 * Produz informações instrucionais e diagnósticas formatadas para o tutorial do Quick Sort.
 */
export function getQuickTutorialStepInfo(
  state: QuickSortState,
): QuickTutorialStepInfo {
  const milestoneId = deriveQuickTutorialMilestone(state);
  const totalSteps = QUICK_TUTORIAL_MILESTONES_ORDER.length;
  const milestoneIndex = QUICK_TUTORIAL_MILESTONES_ORDER.indexOf(milestoneId);
  const stepIndex = milestoneIndex >= 0 ? milestoneIndex + 1 : totalSteps;

  if (milestoneId === "COMPLETED") {
    return {
      phase: "COMPLETED",
      milestoneId: "COMPLETED",
      stepIndex: totalSteps,
      totalSteps,
      title: "TUTORIAL CONCLUÍDO • QUICK SORT E INSTABILIDADE COMPROVADA!",
      instruction:
        "Excelente trabalho! O vetor [4a, 4b, 1, 2, 3] foi totalmente ordenado em [1, 2, 3, 4b, 4a]. Observe que originalmente o elemento 4a vinha antes de 4b, mas ao final 4b ficou antes de 4a. A ordem relativa de chaves iguais foi invertida, comprovando que o Quick Sort não garante estabilidade.",
      hint: "O Quick Sort opera diretamente no vetor com alta velocidade e localidade de cache, mas não preserva a ordem relativa original de elementos iguais.",
      expectedDecision: null,
      instabilityNotice:
        "Ordem original: 4a antes de 4b. Ordem final: 4b antes de 4a. Instabilidade comprovada na prática!",
      canLessOrEqual: false,
      canGreater: false,
      canPlacePivot: false,
    };
  }

  switch (milestoneId) {
    case "ROOT_COMPARE_4A":
      return {
        phase: state.phase,
        milestoneId,
        stepIndex,
        totalSteps,
        title: "1. IDENTIFICAR O PIVÔ E CLASSIFICAR O PRIMEIRO NÚMERO",
        instruction:
          "O pivô é o número 3 no fim do vetor (índice 4). Analise o primeiro número (4a no índice 0): como 4a > 3, classifique-o como maior que o pivô.",
        hint: "Números estritamente maiores que o pivô permanecem na região dos maiores e o ponteiro avança sem realizar trocas.",
        expectedDecision: "GREATER",
        canLessOrEqual: true,
        canGreater: true,
        canPlacePivot: false,
      };

    case "ROOT_COMPARE_4B":
      return {
        phase: state.phase,
        milestoneId,
        stepIndex,
        totalSteps,
        title: "2. CLASSIFICAR O SEGUNDO NÚMERO (AVANÇO SEM TROCA)",
        instruction:
          "Analise o próximo número (4b no índice 1) em relação ao pivô 3: 4b é maior que 3. Classifique-o como maior que o pivô.",
        hint: "Novamente, como 4b > 3, não há necessidade de troca de posições no vetor.",
        expectedDecision: "GREATER",
        canLessOrEqual: true,
        canGreater: true,
        canPlacePivot: false,
      };

    case "ROOT_COMPARE_1":
      return {
        phase: state.phase,
        milestoneId,
        stepIndex,
        totalSteps,
        title: "3. CLASSIFICAR E OBSERVAR A PRIMEIRA TROCA FÍSICA",
        instruction:
          "Analise o número 1 no índice 2. Como 1 ≤ 3, classifique-o como Menor ou Igual. Uma troca física será executada para levar o 1 para a região esquerda!",
        hint: "Quando encontramos um número menor ou igual ao pivô, aumentamos a região dos menores e trocamos o elemento com a primeira vaga dos maiores.",
        expectedDecision: "LESS_OR_EQUAL",
        canLessOrEqual: true,
        canGreater: true,
        canPlacePivot: false,
      };

    case "ROOT_COMPARE_2":
      return {
        phase: state.phase,
        milestoneId,
        stepIndex,
        totalSteps,
        title: "4. CLASSIFICAR E OBSERVAR A SEGUNDA TROCA FÍSICA",
        instruction:
          "Analise o número 2 no índice 3. Como 2 ≤ 3, classifique-o como Menor ou Igual. O número 2 trocará com 4b, consolidando a região menor ou igual.",
        hint: "Com esta ação, todos os elementos antes do pivô terão sido comparados e separados.",
        expectedDecision: "LESS_OR_EQUAL",
        canLessOrEqual: true,
        canGreater: true,
        canPlacePivot: false,
      };

    case "ROOT_PLACE_PIVOT":
      return {
        phase: state.phase,
        milestoneId,
        stepIndex,
        totalSteps,
        title: "5. POSICIONAR O PIVÔ NA SUA POSIÇÃO DEFINITIVA",
        instruction:
          "Todos os números foram analisados! Coloque o pivô 3 na sua posição final definitiva entre as duas regiões.",
        hint: "O pivô troca com o primeiro número dos maiores (4a no índice 2) e recebe o selo OK DEFINITIVO.",
        expectedDecision: "PLACE_PIVOT",
        canLessOrEqual: false,
        canGreater: false,
        canPlacePivot: true,
      };

    case "LEFT_COMPARE_1":
      return {
        phase: state.phase,
        milestoneId,
        stepIndex,
        totalSteps,
        title: "6. CONTINUIDADE NO TRECHO ESQUERDO [0..1]",
        instruction:
          "O pivô 3 está consolidado no índice 2. Agora processamos o trecho esquerdo [0..1], onde o novo pivô é 2. Analise o número 1: 1 ≤ 2.",
        hint: "Como 1 ≤ 2 e ambos os ponteiros coincidem no índice 0, a auto-troca física é omitida sem escritas desnecessárias.",
        expectedDecision: "LESS_OR_EQUAL",
        canLessOrEqual: true,
        canGreater: true,
        canPlacePivot: false,
      };

    case "LEFT_PLACE_PIVOT":
      return {
        phase: state.phase,
        milestoneId,
        stepIndex,
        totalSteps,
        title: "7. POSICIONAR O PIVÔ NO TRECHO ESQUERDO",
        instruction:
          "Coloque o pivô 2 em sua posição final no trecho esquerdo. Ele já está no índice 1 e receberá o selo OK DEFINITIVO.",
        hint: "O trecho unitário restante [0..0] com o elemento 1 será consolidado automaticamente.",
        expectedDecision: "PLACE_PIVOT",
        canLessOrEqual: false,
        canGreater: false,
        canPlacePivot: true,
      };

    case "RIGHT_COMPARE_4B_EQUAL_4A":
      return {
        phase: state.phase,
        milestoneId,
        stepIndex,
        totalSteps,
        title: "8. CONFRONTO DE IGUALDADE E TESTE DE ESTABILIDADE",
        instruction:
          "No trecho direito [3..4], o pivô é 4a. O número em análise é 4b. Como ambos valem 4 (4b ≤ 4a), classifique como Menor ou Igual!",
        hint: "A comparação numérica avalia estritamente o valor (4 ≤ 4). Elementos de mesmo valor pertencem à região Menor ou Igual.",
        expectedDecision: "LESS_OR_EQUAL",
        instabilityNotice:
          "Atenção pedagógica: 4b está sendo classificado como menor ou igual a 4a. Observe a posição final de ambos!",
        canLessOrEqual: true,
        canGreater: true,
        canPlacePivot: false,
      };

    case "RIGHT_PLACE_PIVOT":
      return {
        phase: state.phase,
        milestoneId,
        stepIndex,
        totalSteps,
        title: "9. POSICIONAR O PIVÔ 4A E FINALIZAR A ORDENAÇÃO",
        instruction:
          "Coloque o pivô 4a em sua posição final (índice 4). Ele receberá o selo OK DEFINITIVO e a ordenação será concluída.",
        hint: "Ao fechar o pivô 4a, o elemento 4b no índice 3 é unitário e consolida automaticamente.",
        expectedDecision: "PLACE_PIVOT",
        canLessOrEqual: false,
        canGreater: false,
        canPlacePivot: true,
      };
  }
}

/**
 * Resultado da execução de uma ação no tutorial guiado do Quick Sort.
 */
export interface QuickTutorialStepResult {
  readonly valid: boolean;
  readonly state: QuickSortState;
  readonly message: string;
  readonly explanation: string;
}

/**
 * Inicializa o estado do tutorial guiado do Quick Sort com o vetor canônico fixo [4a, 4b, 1, 2, 3].
 */
export function initQuickTutorialState(): QuickSortState {
  return initQuickSortState(QUICK_TUTORIAL_INITIAL_ARRAY);
}

/**
 * Executa uma etapa interativa no tutorial guiado do Quick Sort.
 * Valida se a decisão tomada confere com a decisão esperada pelo scaffolding pedagógico.
 * Se a decisão for correta, avança a engine real.
 * Se for incorreta, retém o estado, incrementa erros e fornece feedback explicativo.
 */
export function executeQuickTutorialStep(
  state: QuickSortState,
  decision: QuickDecision,
): QuickTutorialStepResult {
  const stepInfo = getQuickTutorialStepInfo(state);

  if (stepInfo.milestoneId === "COMPLETED") {
    return Object.freeze({
      valid: false,
      state,
      message: "O tutorial já foi concluído com sucesso.",
      explanation: "Todos os elementos foram ordenados.",
    });
  }

  const expected = stepInfo.expectedDecision;
  if (decision !== expected) {
    // Aplica a decisão na engine para registrar o erro no estado
    const engineRes = stepQuickSort(state, decision);
    const feedback = getQuickFeedback(state, decision);

    return Object.freeze({
      valid: false,
      state: engineRes.state,
      message: feedback.message,
      explanation: feedback.explanation,
    });
  }

  // Decisão correta: avança a engine real
  const engineRes = stepQuickSort(state, decision);

  return Object.freeze({
    valid: true,
    state: engineRes.state,
    message: "Ação correta!",
    explanation: engineRes.message ?? "Ação processada com sucesso pela engine.",
  });
}

/**
 * Verifica se o tutorial guiado do Quick Sort foi completamente concluído.
 */
export function isQuickTutorialCompleted(state: QuickSortState): boolean {
  return state.completed || state.phase === "COMPLETED";
}
