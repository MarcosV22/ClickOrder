import { describe, it, expect } from "vitest";
import {
  MERGE_TUTORIAL_INITIAL_ARRAY,
  MERGE_TUTORIAL_MILESTONES_ORDER,
  createMergeTutorialSession,
  executeMergeTutorialStep,
  getMergeTutorialStepInfo,
} from "./mergeTutorialGuide";
import { isMergeSortCompleted } from "./mergeSortEngine";

describe("Merge Sort — Tutorial Guiado (P3.1-C)", () => {
  it("vetor inicial do tutorial é [4a, 1, 3, 4b] com identidades estáveis", () => {
    expect(MERGE_TUTORIAL_INITIAL_ARRAY).toHaveLength(4);
    expect(MERGE_TUTORIAL_INITIAL_ARRAY[0].value).toBe(4);
    expect(MERGE_TUTORIAL_INITIAL_ARRAY[0].label).toBe("a");

    expect(MERGE_TUTORIAL_INITIAL_ARRAY[1].value).toBe(1);
    expect(MERGE_TUTORIAL_INITIAL_ARRAY[1].label).toBeUndefined();

    expect(MERGE_TUTORIAL_INITIAL_ARRAY[2].value).toBe(3);
    expect(MERGE_TUTORIAL_INITIAL_ARRAY[2].label).toBeUndefined();

    expect(MERGE_TUTORIAL_INITIAL_ARRAY[3].value).toBe(4);
    expect(MERGE_TUTORIAL_INITIAL_ARRAY[3].label).toBe("b");
  });

  it("sessão inicializa parada na primeira decisão da primeira intercalação local", () => {
    const session = createMergeTutorialSession();

    expect(session.completed).toBe(false);
    expect(session.engineState.phase).toBe("COMPARE_HEADS");
    expect(session.engineState.activeInterval).toEqual({
      left: 0,
      mid: 0,
      right: 1,
      depth: 1,
      isRootMerge: false,
    });

    const info = getMergeTutorialStepInfo(session.engineState);
    expect(info.milestoneId).toBe("FIRST_MERGE_COMPARE_4A_VS_1");
    expect(info.expected?.expectedDecision).toBe("DISPATCH_RIGHT");
  });

  it("percorre todas as etapas guiadas até a conclusão com exatamente 5 comparações e 16 escritas", () => {
    let session = createMergeTutorialSession();

    // Etapa 1: Intercalação local [0..1] -> 4a vs 1 -> despacha 1 (DIREITA)
    let step = executeMergeTutorialStep(session, "DISPATCH_RIGHT");
    expect(step.result.valid).toBe(true);
    expect(step.session.completedMilestones).toContain("FIRST_MERGE_COMPARE_4A_VS_1");
    session = step.session;

    // Etapa 2: Drenagem de 4a -> DRENAR
    step = executeMergeTutorialStep(session, "DRAIN_REMAINDER");
    expect(step.result.valid).toBe(true);
    expect(step.session.completedMilestones).toContain("FIRST_MERGE_DRAIN_4A");
    session = step.session;
    // Após drenagem e cópia automática, engine avança para a segunda intercalação [2..3]
    expect(session.engineState.activeInterval?.left).toBe(2);
    expect(session.engineState.activeInterval?.right).toBe(3);

    // Etapa 3: Intercalação local [2..3] -> 3 vs 4b -> despacha 3 (ESQUERDA)
    step = executeMergeTutorialStep(session, "DISPATCH_LEFT");
    expect(step.result.valid).toBe(true);
    expect(step.session.completedMilestones).toContain("SECOND_MERGE_COMPARE_3_VS_4B");
    session = step.session;

    // Etapa 4: Drenagem de 4b -> DRENAR
    step = executeMergeTutorialStep(session, "DRAIN_REMAINDER");
    expect(step.result.valid).toBe(true);
    expect(step.session.completedMilestones).toContain("SECOND_MERGE_DRAIN_4B");
    session = step.session;
    // Após cópia automática, engine avança para a Intercalação Raiz [0..3]
    expect(session.engineState.activeInterval?.left).toBe(0);
    expect(session.engineState.activeInterval?.right).toBe(3);
    expect(session.engineState.activeInterval?.isRootMerge).toBe(true);

    // Etapa 5: Raiz 1 vs 3 -> despacha 1 (ESQUERDA)
    let info = getMergeTutorialStepInfo(session.engineState);
    expect(info.milestoneId).toBe("ROOT_MERGE_COMPARE_1_VS_3");
    step = executeMergeTutorialStep(session, "DISPATCH_LEFT");
    expect(step.result.valid).toBe(true);
    expect(step.session.completedMilestones).toContain("ROOT_MERGE_COMPARE_1_VS_3");
    session = step.session;

    // Etapa 6: Raiz 4a vs 3 -> despacha 3 (DIREITA)
    info = getMergeTutorialStepInfo(session.engineState);
    expect(info.milestoneId).toBe("ROOT_MERGE_COMPARE_4A_VS_3");
    step = executeMergeTutorialStep(session, "DISPATCH_RIGHT");
    expect(step.result.valid).toBe(true);
    expect(step.session.completedMilestones).toContain("ROOT_MERGE_COMPARE_4A_VS_3");
    session = step.session;

    // Etapa 7: Raiz EMPATE 4a vs 4b -> Regra de Estabilidade -> despacha 4a (ESQUERDA)
    info = getMergeTutorialStepInfo(session.engineState);
    expect(info.milestoneId).toBe("ROOT_MERGE_TIE_4A_VS_4B");
    expect(info.stabilityNotice).toBeDefined();
    step = executeMergeTutorialStep(session, "DISPATCH_LEFT");
    expect(step.result.valid).toBe(true);
    expect(step.feedback).toContain("estabilidade");
    expect(step.session.completedMilestones).toContain("ROOT_MERGE_TIE_4A_VS_4B");
    session = step.session;

    // Etapa 8: Raiz Drenagem de 4b -> DRENAR
    info = getMergeTutorialStepInfo(session.engineState);
    expect(info.milestoneId).toBe("ROOT_MERGE_DRAIN_4B");
    step = executeMergeTutorialStep(session, "DRAIN_REMAINDER");
    expect(step.result.valid).toBe(true);
    expect(step.session.completedMilestones).toContain("ROOT_MERGE_DRAIN_4B");
    session = step.session;

    // Estado terminal do tutorial
    expect(session.completed).toBe(true);
    expect(isMergeSortCompleted(session.engineState)).toBe(true);
    expect(session.completedMilestones).toEqual(MERGE_TUTORIAL_MILESTONES_ORDER);

    // Verificação estrita das métricas canônicas
    expect(session.engineState.comparisons).toBe(5);
    expect(session.engineState.writesInBuffer).toBe(8);
    expect(session.engineState.writesInMain).toBe(8);
    expect(session.engineState.totalWrites).toBe(16);
    expect(session.engineState.errors).toBe(0);

    // Verificação da ordenação e estabilidade das identidades
    const finalValues = session.engineState.values;
    expect(finalValues.map((e) => e.value)).toEqual([1, 3, 4, 4]);
    expect(finalValues[2].label).toBe("a"); // 4a
    expect(finalValues[3].label).toBe("b"); // 4b
  });

  it("trata erro conceitual sob empate na raiz: violação de estabilidade preserva o passo", () => {
    let session = createMergeTutorialSession();

    // Avança até o momento do empate (passos 1 a 6)
    session = executeMergeTutorialStep(session, "DISPATCH_RIGHT").session; // 4a vs 1 -> 1
    session = executeMergeTutorialStep(session, "DRAIN_REMAINDER").session; // drena 4a
    session = executeMergeTutorialStep(session, "DISPATCH_LEFT").session;  // 3 vs 4b -> 3
    session = executeMergeTutorialStep(session, "DRAIN_REMAINDER").session; // drena 4b
    session = executeMergeTutorialStep(session, "DISPATCH_LEFT").session;  // 1 vs 3 -> 1
    session = executeMergeTutorialStep(session, "DISPATCH_RIGHT").session; // 4a vs 3 -> 3

    // Agora estamos no empate 4a vs 4b
    const tieInfo = getMergeTutorialStepInfo(session.engineState);
    expect(tieInfo.milestoneId).toBe("ROOT_MERGE_TIE_4A_VS_4B");

    // Estudante comete erro: comanda DISPATCH_RIGHT
    const errorStep = executeMergeTutorialStep(session, "DISPATCH_RIGHT");
    expect(errorStep.result.valid).toBe(false);
    expect(errorStep.result.isPedagogicalError).toBe(true);
    expect(errorStep.feedback).toContain("Estabilidade");
    expect(errorStep.session.engineState.errors).toBe(1);

    // O passo foi mantido: continua em ROOT_MERGE_TIE_4A_VS_4B
    const retryInfo = getMergeTutorialStepInfo(errorStep.session.engineState);
    expect(retryInfo.milestoneId).toBe("ROOT_MERGE_TIE_4A_VS_4B");

    // Estudante corrige: comanda DISPATCH_LEFT
    const correctStep = executeMergeTutorialStep(errorStep.session, "DISPATCH_LEFT");
    expect(correctStep.result.valid).toBe(true);
    expect(correctStep.session.engineState.errors).toBe(1); // erro permanece contabilizado
    expect(correctStep.session.completedMilestones).toContain("ROOT_MERGE_TIE_4A_VS_4B");
  });

  it("não conclui o tutorial se a engine ainda não finalizou ou se marcos foram ignorados", () => {
    const session = createMergeTutorialSession();
    expect(session.completed).toBe(false);

    // Passo único não conclui
    const step1 = executeMergeTutorialStep(session, "DISPATCH_RIGHT");
    expect(step1.session.completed).toBe(false);
  });
});
