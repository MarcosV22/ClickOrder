import { describe, expect, it } from "vitest";
import {
  createInsertionSortState,
  executeInsertionStep,
} from "./insertionSortEngine";
import {
  getInsertionContextualHint,
  getInsertionStepFeedback,
} from "./insertionPedagogy";

describe("Insertion Sort - Pedagogical Feedback & Hints (P2.2-D)", () => {
  it("fornece feedback claro e explicativo ao realizar SHIFT_RIGHT válido", () => {
    // [4, 2, 3]: i=1, key=2, vaga=1, j=0, A[0]=4 > 2
    const state = createInsertionSortState([4, 2, 3]);
    const result = executeInsertionStep(state, "SHIFT_RIGHT");
    const feedback = getInsertionStepFeedback(result, state, "SHIFT_RIGHT");

    expect(result.valid).toBe(true);
    expect(feedback).toContain("Carga 4");
    expect(feedback).toContain("deslocada para a vaga #2");
  });

  it("fornece feedback claro ao realizar INSERT_KEY com razão HEAD_REACHED", () => {
    const s0 = createInsertionSortState([4, 2, 3]);
    const s1 = executeInsertionStep(s0, "SHIFT_RIGHT").state; // j = -1, INSERT_READY
    const resInsert = executeInsertionStep(s1, "INSERT_KEY");
    const feedback = getInsertionStepFeedback(resInsert, s1, "INSERT_KEY");

    expect(resInsert.valid).toBe(true);
    expect(feedback).toContain("Cabeceira da esteira alcançada");
    expect(feedback).toContain("Chave 2 encaixada na vaga #1");
  });

  it("fornece feedback claro ao realizar INSERT_KEY com razão CONDITION_FALSE", () => {
    // Inicia [2, 4, 3]: i=1, key=4, j=0, A[0]=2 <= 4 -> INSERT_KEY
    const state = createInsertionSortState([2, 4, 3]);
    const result = executeInsertionStep(state, "INSERT_KEY");
    const feedback = getInsertionStepFeedback(result, state, "INSERT_KEY");

    expect(result.valid).toBe(true);
    expect(feedback).toContain("2 ≤ 4");
    expect(feedback).toContain("Chave 4 encaixada na vaga #2");
  });

  it("fornece feedback corretivo para erro pedagógico de inserção prematura", () => {
    // [4, 2, 3]: A[0]=4 > key=2 -> tentar INSERT_KEY é erro pedagógico
    const state = createInsertionSortState([4, 2, 3]);
    const result = executeInsertionStep(state, "INSERT_KEY");
    const feedback = getInsertionStepFeedback(result, state, "INSERT_KEY");

    expect(result.valid).toBe(false);
    expect(result.isPedagogicalError).toBe(true);
    expect(feedback).toContain("Atenção");
    expect(feedback).toContain("ainda é MAIOR que a chave");
    expect(feedback).toContain("Ela deve ser deslocada");
  });

  it("fornece feedback corretivo para erro pedagógico de deslocamento indevido", () => {
    // [2, 4, 3]: A[0]=2 <= key=4 -> tentar SHIFT_RIGHT é erro pedagógico
    const state = createInsertionSortState([2, 4, 3]);
    const result = executeInsertionStep(state, "SHIFT_RIGHT");
    const feedback = getInsertionStepFeedback(result, state, "SHIFT_RIGHT");

    expect(result.valid).toBe(false);
    expect(result.isPedagogicalError).toBe(true);
    expect(feedback).toContain("já é MENOR OU IGUAL à chave");
    expect(feedback).toContain("Ela não deve ser deslocada");
  });

  it("gera dicas contextuais sem anular o raciocínio do estudante", () => {
    const s0 = createInsertionSortState([4, 2, 3]);
    const hint0 = getInsertionContextualHint(s0);
    expect(hint0).toContain("A[0] (4) > CHAVE (2)");
    expect(hint0).toContain("deve abrir espaço movendo-se para a direita");

    const s1 = executeInsertionStep(s0, "SHIFT_RIGHT").state; // INSERT_READY
    const hint1 = getInsertionContextualHint(s1);
    expect(hint1).toContain("cabeceira da esteira");
    expect(hint1).toContain("Encaixe a chave (2)");
  });
});
