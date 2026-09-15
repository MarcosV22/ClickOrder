import { describe, it, expect } from "vitest";
import {
  INSERTION_TUTORIAL_INITIAL_ARRAY,
  getInsertionTutorialStepInfo,
  getInsertionStepFeedback,
} from "./insertionTutorialGuide";
import {
  createInsertionSortState,
  executeInsertionStep,
} from "./insertionSortEngine";

describe("Insertion Sort Tutorial Flow & Guide ([4, 2, 3])", () => {
  it("deve inicializar com o vetor fixo [4, 2, 3] e auto-lift da primeira chave (2)", () => {
    const state = createInsertionSortState(INSERTION_TUTORIAL_INITIAL_ARRAY);

    expect(state.initialValues).toEqual([4, 2, 3]);
    expect(state.currentValues).toEqual([4, null, 3]);
    expect(state.i).toBe(1);
    expect(state.j).toBe(0);
    expect(state.key).toBe(2);
    expect(state.holeIndex).toBe(1);
    expect(state.orderedBoundary).toBe(0);
    expect(state.phase).toBe("COMPARE_AND_SHIFT");
    expect(state.completed).toBe(false);

    const stepInfo = getInsertionTutorialStepInfo(state);
    expect(stepInfo.phase).toBe("COMPARE_AND_SHIFT");
    expect(stepInfo.passNumber).toBe(1);
    expect(stepInfo.totalPasses).toBe(2);
    expect(stepInfo.key).toBe(2);
    expect(stepInfo.holeIndex).toBe(1);
    expect(stepInfo.comparedValue).toBe(4);
    expect(stepInfo.canShift).toBe(true);
    expect(stepInfo.hint).toContain("4 > 2");
  });

  it("deve identificar e rejeitar erro pedagógico (tentar ENCAIXAR quando 4 > 2)", () => {
    const state = createInsertionSortState(INSERTION_TUTORIAL_INITIAL_ARRAY);

    // Na posição j=0, A[0] = 4 > chave 2.
    // Operador tenta equivocadamente ENCAIXAR CHAVE:
    const res = executeInsertionStep(state, "INSERT_KEY");

    expect(res.valid).toBe(false);
    expect(res.isPedagogicalError).toBe(true);
    expect(res.resultType).toBe("PEDAGOGICAL_ERROR");
    expect(res.state.errors).toBe(1);
    // Invariante de erro pedagógico: estado algorítmico preservado
    expect(res.state.j).toBe(0);
    expect(res.state.holeIndex).toBe(1);
    expect(res.state.currentValues).toEqual([4, null, 3]);

    const feedback = getInsertionStepFeedback(res, state, "INSERT_KEY");
    expect(feedback).toContain("MAIOR que a chave");
  });

  it("deve processar a sequência pedagógica canônica completa passo a passo até [2, 3, 4]", () => {
    let state = createInsertionSortState(INSERTION_TUTORIAL_INITIAL_ARRAY);

    // ==========================================
    // PASSADA 1: i=1, chave=2, vaga=1, j=0 (val 4)
    // ==========================================
    let step = getInsertionTutorialStepInfo(state);
    expect(step.canShift).toBe(true);
    expect(step.expected?.expectedDecision).toBe("SHIFT_RIGHT");

    // Ação 1.1: DESLOCAR CARGA 4 para a vaga 1
    const before1 = state;
    let res = executeInsertionStep(state, "SHIFT_RIGHT");
    expect(res.valid).toBe(true);
    state = res.state;

    // Vaga foi para 0, j passou para -1, fase mudou para INSERT_READY
    expect(state.holeIndex).toBe(0);
    expect(state.j).toBe(-1);
    expect(state.currentValues).toEqual([null, 4, 3]);
    expect(state.phase).toBe("INSERT_READY");

    const fb1 = getInsertionStepFeedback(res, before1, "SHIFT_RIGHT");
    expect(fb1).toContain("deslocada para a vaga #2");

    // Ação 1.2: ENCAIXAR CHAVE na cabeceira da esteira (j = -1)
    step = getInsertionTutorialStepInfo(state);
    expect(step.phase).toBe("INSERT_READY");
    expect(step.canShift).toBe(false);
    expect(step.canInsert).toBe(true);

    const before2 = state;
    res = executeInsertionStep(state, "INSERT_KEY");
    expect(res.valid).toBe(true);
    state = res.state;

    const fb2 = getInsertionStepFeedback(res, before2, "INSERT_KEY");
    expect(fb2).toContain("Cabeceira da esteira alcançada");

    // ==========================================
    // PASSADA 2: auto-lift para i=2, chave=3, vaga=2, j=1 (val 4)
    // ==========================================
    expect(state.i).toBe(2);
    expect(state.key).toBe(3);
    expect(state.holeIndex).toBe(2);
    expect(state.j).toBe(1);
    expect(state.orderedBoundary).toBe(1);
    expect(state.currentValues).toEqual([2, 4, null]);
    expect(state.phase).toBe("COMPARE_AND_SHIFT");

    // Ação 2.1: Inspeciona A[1] = 4 > chave 3 -> DESLOCAR CARGA
    step = getInsertionTutorialStepInfo(state);
    expect(step.comparedValue).toBe(4);
    expect(step.expected?.expectedDecision).toBe("SHIFT_RIGHT");

    const before3 = state;
    res = executeInsertionStep(state, "SHIFT_RIGHT");
    expect(res.valid).toBe(true);
    state = res.state;

    // 4 foi para a vaga 2, vaga foi para 1, j passou para 0 (val 2)
    expect(state.currentValues).toEqual([2, null, 4]);
    expect(state.holeIndex).toBe(1);
    expect(state.j).toBe(0);
    expect(state.phase).toBe("COMPARE_AND_SHIFT");

    // Ação 2.2: Inspeciona A[0] = 2 <= chave 3 -> ENCAIXAR CHAVE (condição falsa)
    step = getInsertionTutorialStepInfo(state);
    expect(step.comparedValue).toBe(2);
    expect(step.expected?.expectedDecision).toBe("INSERT_KEY");

    // Se tentar SHIFT quando 2 <= 3, deve dar erro pedagógico
    const wrongShift = executeInsertionStep(state, "SHIFT_RIGHT");
    expect(wrongShift.valid).toBe(false);
    expect(wrongShift.isPedagogicalError).toBe(true);
    const wrongFb = getInsertionStepFeedback(wrongShift, state, "SHIFT_RIGHT");
    expect(wrongFb).toContain("MENOR OU IGUAL à chave");

    // Ação correta: ENCAIXAR CHAVE na vaga 1
    const before4 = state;
    res = executeInsertionStep(state, "INSERT_KEY");
    expect(res.valid).toBe(true);
    state = res.state;

    const fb4 = getInsertionStepFeedback(res, before4, "INSERT_KEY");
    expect(fb4).toContain("Chave 3 encaixada na vaga #2");

    // ==========================================
    // CONCLUSÃO
    // ==========================================
    expect(state.completed).toBe(true);
    expect(state.phase).toBe("COMPLETED");
    expect(state.currentValues).toEqual([2, 3, 4]);
    expect(state.key).toBeNull();
    expect(state.holeIndex).toBeNull();
    expect(state.orderedBoundary).toBe(2);

    step = getInsertionTutorialStepInfo(state);
    expect(step.phase).toBe("COMPLETED");
    expect(step.title).toContain("ORDENAÇÃO CONCLUÍDA");
  });
});
