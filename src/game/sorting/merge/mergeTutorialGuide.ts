/**
 * Scaffolding pedagógico e controlador interativo do tutorial guiado de Merge Sort.
 * Utiliza exclusivamente a mergeSortEngine como fonte de verdade algorítmica.
 *
 * Vetor canônico fixo: [4a, 1, 3, 4b]
 * Racional pedagógico:
 * - Subproblema Esquerdo [0..1]: intercalação entre [4a] e [1] -> despacha 1, drena 4a -> ORD [1, 4a];
 * - Subproblema Direito [2..3]: intercalação entre [3] e [4b] -> despacha 3, drena 4b -> ORD [3, 4b];
 * - Intercalação Raiz [0..3]: confluência entre [1, 4a] e [3, 4b]:
 *   1. 1 vs 3 -> despacha 1 (Ramal Esquerdo);
 *   2. 4a vs 3 -> despacha 3 (Ramal Direito);
 *   3. 4a vs 4b -> EMPATE (valores iguais 4 = 4). Regra de estabilidade exige Ramal Esquerdo (4a);
 *   4. Drenagem de 4b restante para a esteira coletora.
 * - Resultado final: [1, 3, 4a, 4b] com 5 comparações e 16 escritas (8 buffer, 8 principal).
 */

import {
  createMergeElement,
  executeMergeStep,
  getExpectedMergeStep,
  initMergeSortState,
  isMergeSortCompleted,
} from "./mergeSortEngine";
import { getMergeStepFeedback } from "./mergePedagogy";
import type {
  ExpectedMergeStep,
  MergeDecision,
  MergeElement,
  MergePhase,
  MergeSortState,
  MergeStepResult,
} from "./types";

/**
 * Vetor didático canônico imutável para o tutorial guiado do Merge Sort: [4a, 1, 3, 4b]
 */
export const MERGE_TUTORIAL_INITIAL_ARRAY: readonly MergeElement[] = Object.freeze([
  createMergeElement(4, 0, "a", "tut"),
  createMergeElement(1, 1, undefined, "tut"),
  createMergeElement(3, 2, undefined, "tut"),
  createMergeElement(4, 3, "b", "tut"),
]);

export type MergeTutorialMilestoneId =
  | "FIRST_MERGE_COMPARE_4A_VS_1"
  | "FIRST_MERGE_DRAIN_4A"
  | "SECOND_MERGE_COMPARE_3_VS_4B"
  | "SECOND_MERGE_DRAIN_4B"
  | "ROOT_MERGE_COMPARE_1_VS_3"
  | "ROOT_MERGE_COMPARE_4A_VS_3"
  | "ROOT_MERGE_TIE_4A_VS_4B"
  | "ROOT_MERGE_DRAIN_4B"
  | "COMPLETED";

export const MERGE_TUTORIAL_MILESTONES_ORDER: readonly MergeTutorialMilestoneId[] =
  Object.freeze([
    "FIRST_MERGE_COMPARE_4A_VS_1",
    "FIRST_MERGE_DRAIN_4A",
    "SECOND_MERGE_COMPARE_3_VS_4B",
    "SECOND_MERGE_DRAIN_4B",
    "ROOT_MERGE_COMPARE_1_VS_3",
    "ROOT_MERGE_COMPARE_4A_VS_3",
    "ROOT_MERGE_TIE_4A_VS_4B",
    "ROOT_MERGE_DRAIN_4B",
  ]);

export interface MergeTutorialStepInfo {
  readonly phase: MergePhase;
  readonly milestoneId: MergeTutorialMilestoneId;
  readonly stepIndex: number;
  readonly totalSteps: number;
  readonly title: string;
  readonly instruction: string;
  readonly hint: string;
  readonly stabilityNotice?: string;
  readonly canDispatchLeft: boolean;
  readonly canDispatchRight: boolean;
  readonly canDrain: boolean;
  readonly expected: ExpectedMergeStep | null;
}

/**
 * Deriva deterministicamente o marco atual do tutorial a partir do estado da engine.
 */
export function deriveTutorialMilestone(
  state: MergeSortState,
): MergeTutorialMilestoneId {
  if (state.completed || state.phase === "COMPLETED") {
    return "COMPLETED";
  }

  const interval = state.activeInterval;
  if (!interval) {
    return "COMPLETED";
  }

  // Primeira intercalação [0..1]
  if (interval.left === 0 && interval.right === 1) {
    return state.phase === "COMPARE_HEADS"
      ? "FIRST_MERGE_COMPARE_4A_VS_1"
      : "FIRST_MERGE_DRAIN_4A";
  }

  // Segunda intercalação [2..3]
  if (interval.left === 2 && interval.right === 3) {
    return state.phase === "COMPARE_HEADS"
      ? "SECOND_MERGE_COMPARE_3_VS_4B"
      : "SECOND_MERGE_DRAIN_4B";
  }

  // Intercalação Raiz [0..3]
  if (interval.left === 0 && interval.right === 3) {
    if (state.phase === "COMPARE_HEADS") {
      if (state.p1 === 0 && state.p2 === 2) {
        return "ROOT_MERGE_COMPARE_1_VS_3";
      }
      if (state.p1 === 1 && state.p2 === 2) {
        return "ROOT_MERGE_COMPARE_4A_VS_3";
      }
      if (state.p1 === 1 && state.p2 === 3) {
        return "ROOT_MERGE_TIE_4A_VS_4B";
      }
    }
    if (state.phase === "DRAIN_READY") {
      return "ROOT_MERGE_DRAIN_4B";
    }
  }

  return "COMPLETED";
}

/**
 * Produz informações instrucionais e diagnósticas formatadas para o tutorial do Merge Sort.
 */
export function getMergeTutorialStepInfo(
  state: MergeSortState,
): MergeTutorialStepInfo {
  const milestoneId = deriveTutorialMilestone(state);
  const totalSteps = MERGE_TUTORIAL_MILESTONES_ORDER.length;
  const milestoneIndex = MERGE_TUTORIAL_MILESTONES_ORDER.indexOf(milestoneId);
  const stepIndex = milestoneIndex >= 0 ? milestoneIndex + 1 : totalSteps;
  const expected = getExpectedMergeStep(state);

  if (milestoneId === "COMPLETED") {
    return {
      phase: "COMPLETED",
      milestoneId: "COMPLETED",
      stepIndex: totalSteps,
      totalSteps,
      title: "TUTORIAL CONCLUÍDO • ORDENAÇÃO ESTÁVEL COMPLETA!",
      instruction:
        "Excelente trabalho! O vetor [4a, 1, 3, 4b] foi totalmente ordenado em [1, 3, 4a, 4b]. O elemento 4a precedeu 4b rigorosamente, comprovando a estabilidade da ordenação com 5 comparações e 16 escritas.",
      hint: "O Merge Sort garante estabilidade e complexidade ótima O(n log n) em todos os cenários através do seu vetor auxiliar temporário.",
      canDispatchLeft: false,
      canDispatchRight: false,
      canDrain: false,
      expected: null,
    };
  }

  switch (milestoneId) {
    case "FIRST_MERGE_COMPARE_4A_VS_1":
      return {
        phase: "COMPARE_HEADS",
        milestoneId,
        stepIndex,
        totalSteps,
        title: `ETAPA ${stepIndex}/${totalSteps} • PRIMEIRA INTERCALAÇÃO`,
        instruction:
          "Os grupos de 1 elemento [4a] e [1] estão prontos para intercalação. Compare os dois números destacados: 4a versus 1. O menor número é 1. Escolha o elemento da direita.",
        hint: "O número 1 é menor que 4. Clique em ESCOLHER DA DIREITA para copiar o número 1 para o vetor auxiliar.",
        canDispatchLeft: true,
        canDispatchRight: true,
        canDrain: false,
        expected,
      };

    case "FIRST_MERGE_DRAIN_4A":
      return {
        phase: "DRAIN_READY",
        milestoneId,
        stepIndex,
        totalSteps,
        title: `ETAPA ${stepIndex}/${totalSteps} • COPIAR NÚMEROS RESTANTES`,
        instruction:
          "O grupo da direita terminou! O número 4a restante no grupo da esquerda é copiado diretamente para o vetor auxiliar sem necessidade de novas comparações.",
        hint: "Clique em COPIAR RESTANTES para levar o restante do grupo da esquerda ao vetor auxiliar. Ao preencher o intervalo, ele voltará ao vetor principal com marcação ORD (grupo ordenado).",
        canDispatchLeft: false,
        canDispatchRight: false,
        canDrain: true,
        expected,
      };

    case "SECOND_MERGE_COMPARE_3_VS_4B":
      return {
        phase: "COMPARE_HEADS",
        milestoneId,
        stepIndex,
        totalSteps,
        title: `ETAPA ${stepIndex}/${totalSteps} • SEGUNDA INTERCALAÇÃO`,
        instruction:
          "A metade direita foi decomposta em [3] e [4b]. Compare os números destacados: 3 versus 4b. O menor número é 3. Escolha o elemento da esquerda.",
        hint: "O número 3 é menor que 4. Clique em ESCOLHER DA ESQUERDA para copiar o número 3 para o vetor auxiliar.",
        canDispatchLeft: true,
        canDispatchRight: true,
        canDrain: false,
        expected,
      };

    case "SECOND_MERGE_DRAIN_4B":
      return {
        phase: "DRAIN_READY",
        milestoneId,
        stepIndex,
        totalSteps,
        title: `ETAPA ${stepIndex}/${totalSteps} • COPIAR NÚMEROS RESTANTES`,
        instruction:
          "O grupo da esquerda terminou! O número 4b restante no grupo da direita é copiado diretamente para o vetor auxiliar sem novas comparações.",
        hint: "Clique em COPIAR RESTANTES para copiar o número 4b. O intervalo consolidará no vetor principal com marcação ORD [3, 4b].",
        canDispatchLeft: false,
        canDispatchRight: false,
        canDrain: true,
        expected,
      };

    case "ROOT_MERGE_COMPARE_1_VS_3":
      return {
        phase: "COMPARE_HEADS",
        milestoneId,
        stepIndex,
        totalSteps,
        title: `ETAPA ${stepIndex}/${totalSteps} • INTERCALAÇÃO FINAL (1 vs 3)`,
        instruction:
          "Intercalação Final: Os dois grupos já ordenados [1, 4a] e [3, 4b] vão se juntar! Compare as frentes dos grupos: 1 versus 3. Escolha o menor número.",
        hint: "O número 1 do grupo da esquerda é menor que o número 3 do grupo da direita. Clique em ESCOLHER DA ESQUERDA.",
        canDispatchLeft: true,
        canDispatchRight: true,
        canDrain: false,
        expected,
      };

    case "ROOT_MERGE_COMPARE_4A_VS_3":
      return {
        phase: "COMPARE_HEADS",
        milestoneId,
        stepIndex,
        totalSteps,
        title: `ETAPA ${stepIndex}/${totalSteps} • INTERCALAÇÃO FINAL (4a vs 3)`,
        instruction:
          "A frente do grupo da esquerda avançou para 4a. Compare: 4a versus 3. O número 3 é menor! Escolha o elemento da direita.",
        hint: "O número 3 do grupo da direita é menor que 4a. Clique em ESCOLHER DA DIREITA.",
        canDispatchLeft: true,
        canDispatchRight: true,
        canDrain: false,
        expected,
      };

    case "ROOT_MERGE_TIE_4A_VS_4B":
      return {
        phase: "COMPARE_HEADS",
        milestoneId,
        stepIndex,
        totalSteps,
        title: `ETAPA ${stepIndex}/${totalSteps} • REGRA MANDATÓRIA DE ESTABILIDADE`,
        instruction:
          "EMPATE DETECTADO! Ambos os números possuem valor 4 (4a versus 4b). No Merge Sort, em caso de empate, você DEVE escolher o número do grupo da esquerda (4a) para preservar a ordem relativa original!",
        hint: "Em caso de empate (4a = 4b), clique em ESCOLHER DA ESQUERDA. Escolher a direita violaria a estabilidade do algoritmo.",
        stabilityNotice:
          "Estabilidade Algorítmica: Elementos com valores iguais devem manter sua ordem relativa inicial. Como 4a vinha antes de 4b no vetor original, 4a deve ser escolhido primeiro.",
        canDispatchLeft: true,
        canDispatchRight: true,
        canDrain: false,
        expected,
      };

    case "ROOT_MERGE_DRAIN_4B":
      return {
        phase: "DRAIN_READY",
        milestoneId,
        stepIndex,
        totalSteps,
        title: `ETAPA ${stepIndex}/${totalSteps} • COPIAR NÚMEROS RESTANTES DA RAIZ`,
        instruction:
          "O grupo da esquerda terminou! O número final 4b do grupo da direita é copiado diretamente para o vetor auxiliar sem nenhuma nova comparação.",
        hint: "Clique em COPIAR RESTANTES para finalizar a intercalação de todo o vetor.",
        canDispatchLeft: false,
        canDispatchRight: false,
        canDrain: true,
        expected,
      };
  }
}

/**
 * Estado imutável da sessão interativa do tutorial guiado.
 */
export interface MergeTutorialSession {
  readonly engineState: MergeSortState;
  readonly completedMilestones: readonly MergeTutorialMilestoneId[];
  readonly lastFeedback: string | null;
  readonly completed: boolean;
}

/**
 * Cria uma nova sessão do tutorial guiado do Merge Sort.
 */
export function createMergeTutorialSession(): MergeTutorialSession {
  const engineState = initMergeSortState(MERGE_TUTORIAL_INITIAL_ARRAY);
  return Object.freeze({
    engineState,
    completedMilestones: Object.freeze([]),
    lastFeedback: null,
    completed: false,
  });
}

/**
 * Executa uma ação do estudante na sessão guiada do tutorial através da engine real.
 * Se o aluno errar, o erro é contabilizado na engine, o passo é preservado e feedback é emitido.
 * A sessão só é considerada completa quando o motor finaliza E todos os marcos foram percorridos.
 */
export function executeMergeTutorialStep(
  session: MergeTutorialSession,
  decision: MergeDecision,
): {
  readonly session: MergeTutorialSession;
  readonly result: MergeStepResult;
  readonly feedback: string;
} {
  const currentMilestone = deriveTutorialMilestone(session.engineState);
  const result = executeMergeStep(session.engineState, decision);
  const feedback = getMergeStepFeedback(result, session.engineState, decision);

  if (!result.valid) {
    // Erro pedagógico ou ação impossível: preserva o passo e atualiza estado com erro
    const updatedSession: MergeTutorialSession = Object.freeze({
      ...session,
      engineState: result.state,
      lastFeedback: feedback,
      completed: false,
    });

    return {
      session: updatedSession,
      result,
      feedback,
    };
  }

  // Ação correta: adiciona marco percorrido se aplicável
  const nextMilestones = session.completedMilestones.includes(currentMilestone)
    ? session.completedMilestones
    : Object.freeze([...session.completedMilestones, currentMilestone]);

  const isAllMilestonesCompleted = MERGE_TUTORIAL_MILESTONES_ORDER.every((m) =>
    nextMilestones.includes(m),
  );

  const isDone = isMergeSortCompleted(result.state) && isAllMilestonesCompleted;

  const updatedSession: MergeTutorialSession = Object.freeze({
    engineState: result.state,
    completedMilestones: nextMilestones,
    lastFeedback: feedback,
    completed: isDone,
  });

  return {
    session: updatedSession,
    result,
    feedback,
  };
}
