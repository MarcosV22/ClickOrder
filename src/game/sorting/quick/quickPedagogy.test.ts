import { describe, expect, it } from "vitest";
import {
  getQuickFeedback,
  getQuickHint,
  getQuickElementVisualStatus,
} from "./quickPedagogy";
import {
  initQuickSortState,
  stepQuickSort,
} from "./quickSortEngine";

describe("quickPedagogy — Feedback Formativo, Dicas e Status Visuais", () => {
  it("fornece feedback correto na fase INSPECT_ELEMENT para decisões válidas e inválidas", () => {
    // Array: [5, 2, 3] -> pivô = 3 (índice 2), j = 0 (elemento 5). 5 > 3.
    let state = initQuickSortState([5, 2, 3]);

    // Tentativa de PLACE_PIVOT antes do fim da partição
    const fbEarlyPivot = getQuickFeedback(state, "PLACE_PIVOT");
    expect(fbEarlyPivot.valid).toBe(false);
    expect(fbEarlyPivot.message).toContain("Ainda há números para analisar");
    expect(fbEarlyPivot.suggestedAction).toBe("GREATER");

    // Tentativa de LESS_OR_EQUAL quando elemento é maior (5 > 3)
    const fbWrongLess = getQuickFeedback(state, "LESS_OR_EQUAL");
    expect(fbWrongLess.valid).toBe(false);
    expect(fbWrongLess.message).toContain("Classificação incorreta: o número é maior");
    expect(fbWrongLess.suggestedAction).toBe("GREATER");

    // Decisão correta GREATER
    const fbCorrectGreater = getQuickFeedback(state, "GREATER");
    expect(fbCorrectGreater.valid).toBe(true);
    expect(fbCorrectGreater.message).toContain("Classificação correta!");

    // Avança para j = 1 (elemento 2 <= 3)
    const step1 = stepQuickSort(state, "GREATER");
    state = step1.state;
    expect(state.j).toBe(1);

    // Tentativa de GREATER quando elemento é menor (2 <= 3)
    const fbWrongGreater = getQuickFeedback(state, "GREATER");
    expect(fbWrongGreater.valid).toBe(false);
    expect(fbWrongGreater.message).toContain("Classificação incorreta: o número é menor ou igual");
    expect(fbWrongGreater.suggestedAction).toBe("LESS_OR_EQUAL");

    // Decisão correta LESS_OR_EQUAL
    const fbCorrectLess = getQuickFeedback(state, "LESS_OR_EQUAL");
    expect(fbCorrectLess.valid).toBe(true);
  });

  it("fornece feedback na fase PARTITION_READY_FOR_PIVOT", () => {
    // [5, 2, 3]
    let state = initQuickSortState([5, 2, 3]);
    state = stepQuickSort(state, "GREATER").state;
    state = stepQuickSort(state, "LESS_OR_EQUAL").state;
    expect(state.phase).toBe("PARTITION_READY_FOR_PIVOT");

    // Tentativa de ação de inspeção quando pivô está pronto
    const fbWrongAction = getQuickFeedback(state, "LESS_OR_EQUAL");
    expect(fbWrongAction.valid).toBe(false);
    expect(fbWrongAction.message).toContain("A varredura deste trecho já terminou");
    expect(fbWrongAction.suggestedAction).toBe("PLACE_PIVOT");

    // Decisão correta PLACE_PIVOT
    const fbCorrectPivot = getQuickFeedback(state, "PLACE_PIVOT");
    expect(fbCorrectPivot.valid).toBe(true);
  });

  it("oferece scaffolding de dicas em 3 níveis progressivos sem antecipar a resposta nos níveis 1 e 2", () => {
    // [10, 50, 30] -> j=0 (10), pivô=30
    const state = initQuickSortState([10, 50, 30]);

    const hint1 = getQuickHint(state, 1);
    expect(hint1).toContain("Observe o pivô (30)");
    expect(hint1).not.toContain("escolha a ação");

    const hint2 = getQuickHint(state, 2);
    expect(hint2).toContain("Compare o valor em análise (10) com o valor do pivô (30)");
    expect(hint2).not.toContain("escolha a ação");

    const hint3 = getQuickHint(state, 3);
    expect(hint3).toContain("escolha a ação 'Menor ou Igual (≤ PIVÔ)'");
  });

  it("deriva status visuais com precedência estrita", () => {
    // Array: [5, 2, 4, 1, 3]
    let state = initQuickSortState([5, 2, 4, 1, 3]);

    // No início: intervalo [0..4], pivô no índice 4, j no índice 0, i = -1
    expect(getQuickElementVisualStatus(4, state)).toBe("PIVOT");
    expect(getQuickElementVisualStatus(0, state)).toBe("COMPARING");
    expect(getQuickElementVisualStatus(1, state)).toBe("PENDING_IN_INTERVAL");
    expect(getQuickElementVisualStatus(2, state)).toBe("PENDING_IN_INTERVAL");
    expect(getQuickElementVisualStatus(3, state)).toBe("PENDING_IN_INTERVAL");

    // Passo 1: 5 > 3 -> GREATER (j=1, i=-1). Índice 0 está na região maior (i < 0 < 1)
    state = stepQuickSort(state, "GREATER").state;
    expect(getQuickElementVisualStatus(0, state)).toBe("GREATER_REGION");
    expect(getQuickElementVisualStatus(1, state)).toBe("COMPARING");

    // Passo 2: 2 <= 3 -> LESS_OR_EQUAL (troca 5 com 2 -> [2, 5, 4, 1, 3], i=0, j=2)
    state = stepQuickSort(state, "LESS_OR_EQUAL").state;
    expect(getQuickElementVisualStatus(0, state)).toBe("LESS_OR_EQUAL_REGION");
    expect(getQuickElementVisualStatus(1, state)).toBe("GREATER_REGION");
    expect(getQuickElementVisualStatus(2, state)).toBe("COMPARING");

    // Precedência de DEFINITIVE: quando um elemento é consolidado com selo OK
    const stateWithDefinitive = {
      ...state,
      sortedIndices: [0, 4],
    };
    // Índice 0 e índice 4 passam a ser DEFINITIVE mesmo que fossem pivô ou no intervalo
    expect(getQuickElementVisualStatus(0, stateWithDefinitive)).toBe("DEFINITIVE");
    expect(getQuickElementVisualStatus(4, stateWithDefinitive)).toBe("DEFINITIVE");

    // Precedência de OUTSIDE_INTERVAL: elemento fora do subintervalo ativo
    const subIntervalState = {
      ...state,
      activeInterval: { low: 2, high: 4 },
      sortedIndices: [],
    };
    expect(getQuickElementVisualStatus(0, subIntervalState)).toBe("OUTSIDE_INTERVAL");
    expect(getQuickElementVisualStatus(1, subIntervalState)).toBe("OUTSIDE_INTERVAL");
  });
});
