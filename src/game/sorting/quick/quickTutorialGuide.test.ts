import { describe, expect, it } from "vitest";
import {
  deriveQuickTutorialMilestone,
  executeQuickTutorialStep,
  getQuickTutorialStepInfo,
  initQuickTutorialState,
  isQuickTutorialCompleted,
  QUICK_TUTORIAL_INITIAL_ARRAY,
  QUICK_TUTORIAL_MILESTONES_ORDER,
} from "./quickTutorialGuide";

describe("quickTutorialGuide — Tutorial Guiado e Comprovação de Instabilidade", () => {
  it("inicia com o vetor canônico [4a, 4b, 1, 2, 3] e marco ROOT_COMPARE_4A", () => {
    const state = initQuickTutorialState();

    expect(state.values).toHaveLength(5);
    expect(state.values[0].value).toBe(4);
    expect(state.values[0].labelSuffix).toBe("a");
    expect(state.values[1].value).toBe(4);
    expect(state.values[1].labelSuffix).toBe("b");
    expect(state.values[2].value).toBe(1);
    expect(state.values[3].value).toBe(2);
    expect(state.values[4].value).toBe(3);

    const milestone = deriveQuickTutorialMilestone(state);
    expect(milestone).toBe("ROOT_COMPARE_4A");

    const info = getQuickTutorialStepInfo(state);
    expect(info.milestoneId).toBe("ROOT_COMPARE_4A");
    expect(info.expectedDecision).toBe("GREATER");
    expect(info.stepIndex).toBe(1);
    expect(info.totalSteps).toBe(QUICK_TUTORIAL_MILESTONES_ORDER.length);
  });

  it("rejeita decisão incorreta mantendo o marco atual, incrementando erros e fornecendo feedback", () => {
    const state = initQuickTutorialState();

    // No passo 1, o elemento 4a é maior que o pivô 3. Tentar LESS_OR_EQUAL deve falhar.
    const result = executeQuickTutorialStep(state, "LESS_OR_EQUAL");

    expect(result.valid).toBe(false);
    expect(result.state.errors).toBe(1);
    expect(result.message).toContain("Classificação incorreta");

    // O marco deve permanecer inalterado
    expect(deriveQuickTutorialMilestone(result.state)).toBe("ROOT_COMPARE_4A");
  });

  it("percorre todos os 9 passos até a conclusão, comprovando instabilidade e métricas exatas", () => {
    let state = initQuickTutorialState();

    // 1. ROOT_COMPARE_4A: 4a > 3 -> GREATER
    expect(deriveQuickTutorialMilestone(state)).toBe("ROOT_COMPARE_4A");
    let res = executeQuickTutorialStep(state, "GREATER");
    expect(res.valid).toBe(true);
    state = res.state;

    // 2. ROOT_COMPARE_4B: 4b > 3 -> GREATER
    expect(deriveQuickTutorialMilestone(state)).toBe("ROOT_COMPARE_4B");
    res = executeQuickTutorialStep(state, "GREATER");
    expect(res.valid).toBe(true);
    state = res.state;

    // 3. ROOT_COMPARE_1: 1 <= 3 -> LESS_OR_EQUAL (troca 4a com 1)
    expect(deriveQuickTutorialMilestone(state)).toBe("ROOT_COMPARE_1");
    res = executeQuickTutorialStep(state, "LESS_OR_EQUAL");
    expect(res.valid).toBe(true);
    state = res.state;
    // Vetor agora é [1, 4b, 4a, 2, 3]
    expect(state.values[0].value).toBe(1);
    expect(state.values[2].value).toBe(4);
    expect(state.values[2].labelSuffix).toBe("a");

    // 4. ROOT_COMPARE_2: 2 <= 3 -> LESS_OR_EQUAL (troca 4b com 2)
    expect(deriveQuickTutorialMilestone(state)).toBe("ROOT_COMPARE_2");
    res = executeQuickTutorialStep(state, "LESS_OR_EQUAL");
    expect(res.valid).toBe(true);
    state = res.state;
    // Vetor agora é [1, 2, 4a, 4b, 3]
    expect(state.values[1].value).toBe(2);
    expect(state.values[3].value).toBe(4);
    expect(state.values[3].labelSuffix).toBe("b");

    // 5. ROOT_PLACE_PIVOT: PLACE_PIVOT (troca 4a com 3)
    expect(deriveQuickTutorialMilestone(state)).toBe("ROOT_PLACE_PIVOT");
    res = executeQuickTutorialStep(state, "PLACE_PIVOT");
    expect(res.valid).toBe(true);
    state = res.state;
    // Vetor agora é [1, 2, 3, 4b, 4a]. Pivô 3 no índice 2 com selo OK
    expect(state.values[2].value).toBe(3);
    expect(state.sortedIndices).toContain(2);

    // 6. LEFT_COMPARE_1: no trecho [0..1], 1 <= 2 -> LESS_OR_EQUAL
    expect(deriveQuickTutorialMilestone(state)).toBe("LEFT_COMPARE_1");
    res = executeQuickTutorialStep(state, "LESS_OR_EQUAL");
    expect(res.valid).toBe(true);
    state = res.state;

    // 7. LEFT_PLACE_PIVOT: PLACE_PIVOT (pivô 2 fixado, unitário 1 consolidado)
    expect(deriveQuickTutorialMilestone(state)).toBe("LEFT_PLACE_PIVOT");
    res = executeQuickTutorialStep(state, "PLACE_PIVOT");
    expect(res.valid).toBe(true);
    state = res.state;
    expect(state.sortedIndices).toContain(0);
    expect(state.sortedIndices).toContain(1);

    // 8. RIGHT_COMPARE_4B_EQUAL_4A: no trecho [3..4], 4b <= 4a -> LESS_OR_EQUAL (confronto de igualdade!)
    expect(deriveQuickTutorialMilestone(state)).toBe("RIGHT_COMPARE_4B_EQUAL_4A");
    const step8Info = getQuickTutorialStepInfo(state);
    expect(step8Info.instabilityNotice).toBeDefined();
    res = executeQuickTutorialStep(state, "LESS_OR_EQUAL");
    expect(res.valid).toBe(true);
    state = res.state;

    // 9. RIGHT_PLACE_PIVOT: PLACE_PIVOT (pivô 4a fixado, unitário 4b consolidado)
    expect(deriveQuickTutorialMilestone(state)).toBe("RIGHT_PLACE_PIVOT");
    res = executeQuickTutorialStep(state, "PLACE_PIVOT");
    expect(res.valid).toBe(true);
    state = res.state;

    // Conclusão
    expect(isQuickTutorialCompleted(state)).toBe(true);
    expect(deriveQuickTutorialMilestone(state)).toBe("COMPLETED");

    // Validação estrita das métricas contratuais
    // 6 comparações, 3 trocas e 6 escritas no vetor
    expect(state.comparisons).toBe(6);
    expect(state.swaps).toBe(3);
    expect(state.writesInArray).toBe(6);
    expect(state.errors).toBe(0);

    // Validação estrita da inversão de ordem (instabilidade)
    // Original: 4a no índice 0, 4b no índice 1
    // Final: [1, 2, 3, 4b, 4a] -> 4b no índice 3, 4a no índice 4
    expect(state.values[0].value).toBe(1);
    expect(state.values[1].value).toBe(2);
    expect(state.values[2].value).toBe(3);
    expect(state.values[3].value).toBe(4);
    expect(state.values[3].labelSuffix).toBe("b");
    expect(state.values[4].value).toBe(4);
    expect(state.values[4].labelSuffix).toBe("a");

    const completedInfo = getQuickTutorialStepInfo(state);
    expect(completedInfo.milestoneId).toBe("COMPLETED");
    expect(completedInfo.title).toContain("TUTORIAL CONCLUÍDO");
    expect(completedInfo.instruction).toContain("4b ficou antes de 4a");
  });
});
