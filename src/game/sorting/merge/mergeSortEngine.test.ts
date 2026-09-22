import { describe, expect, it } from "vitest";
import {
  advanceAutomaticSteps,
  createMergeElement,
  executeMergeStep,
  getExpectedMergeStep,
  getMergeSortScore,
  initMergeSortState,
  isMergeSortCompleted,
  normalizeMergeInput,
  reconstructMergeStateFromHistory,
  requestMergeHint,
} from "./mergeSortEngine";
import type {
  MergeDecision,
  MergeElement,
  MergeSortState,
} from "./types";

/**
 * Helper de resolução automática determinística para testes de conformidade.
 * Executa passo a passo estritamente a decisão esperada pela engine.
 */
function solveMergeSort(initialState: MergeSortState): MergeSortState {
  let state = initialState;
  let safety = 0;
  while (!state.completed && safety < 5000) {
    safety++;
    const expected = getExpectedMergeStep(state);
    if (!expected) {
      throw new Error(
        `[TestHelper] Invariante violada: estado não concluído sem expectedStep. Fase: ${state.phase}`,
      );
    }
    const result = executeMergeStep(state, expected.expectedDecision);
    if (!result.valid) {
      throw new Error(
        `[TestHelper] Decisão esperada rejeitada pela engine: ${result.errorReason}`,
      );
    }
    state = result.state;
  }
  if (safety >= 5000) {
    throw new Error("[TestHelper] Limite de segurança excedido em solveMergeSort.");
  }
  return state;
}

describe("Merge Sort Pure Engine (P3.1-B)", () => {
  describe("1. Inicialização, Casos Base e Degenerados", () => {
    it("deve tratar entrada vazia como concluída imediatamente com zero métricas", () => {
      const state = initMergeSortState([]);
      expect(state.completed).toBe(true);
      expect(state.phase).toBe("COMPLETED");
      expect(state.values).toHaveLength(0);
      expect(state.comparisons).toBe(0);
      expect(state.writesInBuffer).toBe(0);
      expect(state.writesInMain).toBe(0);
      expect(state.totalWrites).toBe(0);
      expect(state.errors).toBe(0);
      expect(state.history).toHaveLength(0);
      expect(getExpectedMergeStep(state)).toBeNull();
    });

    it("deve tratar entrada unitária como concluída imediatamente sem chamadas de intercalação", () => {
      const state = initMergeSortState([42]);
      expect(state.completed).toBe(true);
      expect(state.phase).toBe("COMPLETED");
      expect(state.values).toHaveLength(1);
      expect(state.values[0].value).toBe(42);
      expect(state.values[0].originalIndex).toBe(0);
      expect(state.comparisons).toBe(0);
      expect(state.writesInBuffer).toBe(0);
      expect(state.writesInMain).toBe(0);
      expect(state.totalWrites).toBe(0);
      expect(state.history).toHaveLength(0);
      expect(isMergeSortCompleted(state)).toBe(true);
    });

    it("deve normalizar entradas heterogêneas preservando rótulos e identidades", () => {
      const input = [
        10,
        { value: 20, label: "20a" },
        createMergeElement(30, 2, "30b", "custom"),
      ];
      const normalized = normalizeMergeInput(input);
      expect(normalized).toHaveLength(3);
      expect(normalized[0].value).toBe(10);
      expect(normalized[0].originalIndex).toBe(0);
      expect(normalized[1].value).toBe(20);
      expect(normalized[1].label).toBe("20a");
      expect(normalized[2].value).toBe(30);
      expect(normalized[2].id).toBe("custom-2-v30");
    });
  });

  describe("2. Exemplo Canônico Curado [3a, 1, 3b, 2] (n=4)", () => {
    it("deve ordenar com estabilidade, 5 comparações e 16 escritas totais (8 buffer + 8 main)", () => {
      const input = [
        { value: 3, label: "3a" },
        { value: 1, label: "1" },
        { value: 3, label: "3b" },
        { value: 2, label: "2" },
      ];

      let state = initMergeSortState(input);

      // Estado inicial após avanços automáticos de divisão:
      expect(state.completed).toBe(false);
      expect(state.phase).toBe("COMPARE_HEADS");
      expect(state.activeInterval).toEqual({
        left: 0,
        mid: 0,
        right: 1,
        depth: 1,
        isRootMerge: false,
      });

      // Passo 1: intercalar(0, 0, 1) - confronto 3a vs 1
      let expected = getExpectedMergeStep(state)!;
      expect(expected.expectedDecision).toBe("DISPATCH_RIGHT");
      let res = executeMergeStep(state, "DISPATCH_RIGHT");
      expect(res.valid).toBe(true);
      state = res.state;
      expect(state.phase).toBe("DRAIN_READY");

      // Passo 2: intercalar(0, 0, 1) - drenar restante (3a)
      expected = getExpectedMergeStep(state)!;
      expect(expected.expectedDecision).toBe("DRAIN_REMAINDER");
      res = executeMergeStep(state, "DRAIN_REMAINDER");
      expect(res.valid).toBe(true);
      state = res.state;

      // Após o retorno automático, a engine já avança para intercalar(2, 2, 3):
      expect(state.phase).toBe("COMPARE_HEADS");
      expect(state.activeInterval).toEqual({
        left: 2,
        mid: 2,
        right: 3,
        depth: 1,
        isRootMerge: false,
      });

      // Passo 3: intercalar(2, 2, 3) - confronto 3b vs 2
      expected = getExpectedMergeStep(state)!;
      expect(expected.expectedDecision).toBe("DISPATCH_RIGHT");
      res = executeMergeStep(state, "DISPATCH_RIGHT");
      state = res.state;
      expect(state.phase).toBe("DRAIN_READY");

      // Passo 4: intercalar(2, 2, 3) - drenar restante (3b)
      expected = getExpectedMergeStep(state)!;
      expect(expected.expectedDecision).toBe("DRAIN_REMAINDER");
      res = executeMergeStep(state, "DRAIN_REMAINDER");
      state = res.state;

      // Após o segundo retorno automático, a engine avança para a intercalação raiz intercalar(0, 1, 3):
      expect(state.phase).toBe("COMPARE_HEADS");
      expect(state.activeInterval).toEqual({
        left: 0,
        mid: 1,
        right: 3,
        depth: 0,
        isRootMerge: true,
      });

      // Passo 5: intercalar(0, 1, 3) - confronto 1 vs 2
      expected = getExpectedMergeStep(state)!;
      expect(expected.expectedDecision).toBe("DISPATCH_LEFT");
      res = executeMergeStep(state, "DISPATCH_LEFT");
      state = res.state;
      expect(state.phase).toBe("COMPARE_HEADS");

      // Passo 6: intercalar(0, 1, 3) - confronto 3a vs 2
      expected = getExpectedMergeStep(state)!;
      expect(expected.expectedDecision).toBe("DISPATCH_RIGHT");
      res = executeMergeStep(state, "DISPATCH_RIGHT");
      state = res.state;
      expect(state.phase).toBe("COMPARE_HEADS");

      // Passo 7: intercalar(0, 1, 3) - confronto 3a vs 3b (EMPATE CRÍTICO)
      expected = getExpectedMergeStep(state)!;
      expect(expected.expectedDecision).toBe("DISPATCH_LEFT");
      res = executeMergeStep(state, "DISPATCH_LEFT");
      state = res.state;
      expect(state.phase).toBe("DRAIN_READY");

      // Passo 8: intercalar(0, 1, 3) - drenar restante (3b)
      expected = getExpectedMergeStep(state)!;
      expect(expected.expectedDecision).toBe("DRAIN_REMAINDER");
      res = executeMergeStep(state, "DRAIN_REMAINDER");
      state = res.state;

      // Fim do algoritmo:
      expect(state.completed).toBe(true);
      expect(state.phase).toBe("COMPLETED");

      // Verificação das métricas canônicas:
      expect(state.comparisons).toBe(5);
      expect(state.writesInBuffer).toBe(8);
      expect(state.writesInMain).toBe(8);
      expect(state.totalWrites).toBe(16);
      expect(state.errors).toBe(0);

      // Verificação da ordenação dos valores:
      const values = state.values.map((el) => el.value);
      expect(values).toEqual([1, 2, 3, 3]);

      // Verificação formal da estabilidade: 3a (originalIndex: 0) antes de 3b (originalIndex: 2):
      const labels = state.values.map((el) => el.label);
      expect(labels).toEqual(["1", "2", "3a", "3b"]);
      expect(state.values[2].originalIndex).toBe(0);
      expect(state.values[3].originalIndex).toBe(2);
    });
  });

  describe("3. Recorrência Exata de Escritas (n=4, n=5, n=6)", () => {
    it("deve cumprir exatamente W(4) = 16 escritas (8 no buffer, 8 no vetor principal)", () => {
      const state = solveMergeSort(initMergeSortState([40, 10, 30, 20]));
      expect(state.completed).toBe(true);
      expect(state.writesInBuffer).toBe(8);
      expect(state.writesInMain).toBe(8);
      expect(state.totalWrites).toBe(16);
      expect(state.values.map((v) => v.value)).toEqual([10, 20, 30, 40]);
    });

    it("deve cumprir exatamente W(5) = 24 escritas (12 no buffer, 12 no vetor principal)", () => {
      const state = solveMergeSort(initMergeSortState([50, 20, 40, 10, 30]));
      expect(state.completed).toBe(true);
      expect(state.writesInBuffer).toBe(12);
      expect(state.writesInMain).toBe(12);
      expect(state.totalWrites).toBe(24);
      expect(state.values.map((v) => v.value)).toEqual([10, 20, 30, 40, 50]);
    });

    it("deve cumprir exatamente W(6) = 32 escritas (16 no buffer, 16 no vetor principal)", () => {
      const state = solveMergeSort(initMergeSortState([60, 10, 50, 20, 40, 30]));
      expect(state.completed).toBe(true);
      expect(state.writesInBuffer).toBe(16);
      expect(state.writesInMain).toBe(16);
      expect(state.totalWrites).toBe(32);
      expect(state.values.map((v) => v.value)).toEqual([10, 20, 30, 40, 50, 60]);
    });

    it("deve manter a invariante totalWrites === writesInBuffer + writesInMain em todos os passos", () => {
      let state = initMergeSortState([5, 4, 3, 2, 1]);
      while (!state.completed) {
        expect(state.totalWrites).toBe(state.writesInBuffer + state.writesInMain);
        const exp = getExpectedMergeStep(state)!;
        state = executeMergeStep(state, exp.expectedDecision).state;
      }
      expect(state.totalWrites).toBe(state.writesInBuffer + state.writesInMain);
      expect(state.writesInBuffer).toBe(state.writesInMain);
    });
  });

  describe("4. Divisão Assimétrica e Convenção de Limites Inclusivos", () => {
    it("deve particionar n=5 com 3 elementos à esquerda e 2 à direita", () => {
      const state = initMergeSortState([5, 2, 4, 1, 3]);
      // A primeira divisão de [0..4] com mid = 2:
      const firstDivide = state.history.find((step) => step.type === "DIVIDE");
      expect(firstDivide).toBeDefined();
      if (firstDivide && firstDivide.type === "DIVIDE") {
        expect(firstDivide.left).toBe(0);
        expect(firstDivide.mid).toBe(2);
        expect(firstDivide.right).toBe(4);
        // Comprimento esquerdo: 2 - 0 + 1 = 3
        expect(firstDivide.mid - firstDivide.left + 1).toBe(3);
        // Comprimento direito: 4 - 2 = 2
        expect(firstDivide.right - firstDivide.mid).toBe(2);
      }
    });

    it("deve registrar o evento explícito MERGE_INIT na inicialização de cada intercalação", () => {
      const finalState = solveMergeSort(initMergeSortState([4, 2, 3, 1]));
      const initEvents = finalState.history.filter((s) => s.type === "MERGE_INIT");
      // Para n=4 com 3 intercalações (duas de tamanho 2 e a raiz de tamanho 4):
      expect(initEvents).toHaveLength(3);

      const firstInit = initEvents[0];
      if (firstInit.type === "MERGE_INIT") {
        expect(firstInit.left).toBe(0);
        expect(firstInit.right).toBe(1);
        expect(firstInit.p1).toBe(0);
        expect(firstInit.p2).toBe(1);
        expect(firstInit.k).toBe(0);
        expect(firstInit.bufferSnapshot).toEqual([null, null]);
        expect(firstInit.isRootMerge).toBe(false);
      }

      const rootInit = initEvents[2];
      if (rootInit.type === "MERGE_INIT") {
        expect(rootInit.left).toBe(0);
        expect(rootInit.right).toBe(3);
        expect(rootInit.isRootMerge).toBe(true);
        expect(rootInit.bufferSnapshot).toEqual([null, null, null, null]);
      }
    });
  });

  describe("5. Drenagem Lateral e Comparações", () => {
    it("deve drenar o ramal esquerdo quando o direito se esgota primeiro sem somar comparações", () => {
      // Subvetores: [5, 6] e [1, 2]. 1 e 2 descem, restando 5 e 6 na esquerda.
      const state = initMergeSortState([5, 6, 1, 2]);
      // Intercala subvetor 1 [5, 6] já ordenado
      let cur = executeMergeStep(state, "DISPATCH_LEFT").state;
      cur = executeMergeStep(cur, "DRAIN_REMAINDER").state;
      // Intercala subvetor 2 [1, 2] já ordenado
      cur = executeMergeStep(cur, "DISPATCH_LEFT").state;
      cur = executeMergeStep(cur, "DRAIN_REMAINDER").state;

      // Raiz: E = [5, 6], D = [1, 2]
      expect(cur.phase).toBe("COMPARE_HEADS");
      const comparisonsBeforeRoot = cur.comparisons;

      // Confronto 5 vs 1 -> desce 1
      cur = executeMergeStep(cur, "DISPATCH_RIGHT").state;
      // Confronto 5 vs 2 -> desce 2
      cur = executeMergeStep(cur, "DISPATCH_RIGHT").state;

      // Direito esgotado -> DRAIN_READY para descer [5, 6] da esquerda
      expect(cur.phase).toBe("DRAIN_READY");
      const comparisonsBeforeDrain = cur.comparisons;
      expect(comparisonsBeforeDrain).toBe(comparisonsBeforeRoot + 2);

      // Executa drenagem do ramal esquerdo
      cur = executeMergeStep(cur, "DRAIN_REMAINDER").state;

      // Nenhuma comparação adicionada na drenagem:
      expect(cur.comparisons).toBe(comparisonsBeforeDrain);
      expect(cur.completed).toBe(true);
      expect(cur.values.map((v) => v.value)).toEqual([1, 2, 5, 6]);
    });

    it("deve drenar o ramal direito quando o esquerdo se esgota primeiro sem somar comparações", () => {
      // Subvetores: [1, 2] e [5, 6]. 1 e 2 descem, restando 5 e 6 na direita.
      const state = initMergeSortState([1, 2, 5, 6]);
      // Resolve subvetores:
      let cur = executeMergeStep(state, "DISPATCH_LEFT").state;
      cur = executeMergeStep(cur, "DRAIN_REMAINDER").state;
      cur = executeMergeStep(cur, "DISPATCH_LEFT").state;
      cur = executeMergeStep(cur, "DRAIN_REMAINDER").state;

      // Raiz: E = [1, 2], D = [5, 6]
      cur = executeMergeStep(cur, "DISPATCH_LEFT").state; // 1 vs 5 -> desce 1
      cur = executeMergeStep(cur, "DISPATCH_LEFT").state; // 2 vs 5 -> desce 2

      expect(cur.phase).toBe("DRAIN_READY");
      const comparisonsBeforeDrain = cur.comparisons;

      cur = executeMergeStep(cur, "DRAIN_REMAINDER").state;
      expect(cur.comparisons).toBe(comparisonsBeforeDrain);
      expect(cur.completed).toBe(true);
      expect(cur.values.map((v) => v.value)).toEqual([1, 2, 5, 6]);
    });
  });

  describe("6. Estabilidade Estrita sob Múltiplas Duplicatas", () => {
    it("deve preservar a ordem relativa original quando todos os elementos são iguais", () => {
      const input = [
        { value: 7, label: "7a" },
        { value: 7, label: "7b" },
        { value: 7, label: "7c" },
        { value: 7, label: "7d" },
      ];
      const state = solveMergeSort(initMergeSortState(input));
      expect(state.completed).toBe(true);
      expect(state.values.map((v) => v.label)).toEqual(["7a", "7b", "7c", "7d"]);
      expect(state.values.map((v) => v.originalIndex)).toEqual([0, 1, 2, 3]);
    });

    it("deve penalizar e bloquear a escolha do ramal direito sob empate", () => {
      const input = [
        { value: 4, label: "4a" },
        { value: 4, label: "4b" },
      ];
      const state = initMergeSortState(input);
      expect(state.phase).toBe("COMPARE_HEADS");

      // Estudante tenta despachar a direita (4b) violando a estabilidade:
      const res = executeMergeStep(state, "DISPATCH_RIGHT");
      expect(res.valid).toBe(false);
      expect(res.isPedagogicalError).toBe(true);
      expect(res.resultType).toBe("PEDAGOGICAL_ERROR");
      expect(res.expectedDecision).toBe("DISPATCH_LEFT");
      expect(res.errorReason).toContain("Violação de Estabilidade");

      // Estado permanece inalterado com erro incrementado:
      expect(res.state.errors).toBe(1);
      expect(res.state.comparisons).toBe(0);
      expect(res.state.writesInBuffer).toBe(0);
      expect(res.state.p1).toBe(0);
      expect(res.state.p2).toBe(1);
    });
  });

  describe("7. Erros Conceituais vs Ações Impossíveis", () => {
    it("deve penalizar escolha do elemento de maior valor e não avançar estado", () => {
      const state = initMergeSortState([90, 10]); // E=[90], D=[10]
      expect(state.phase).toBe("COMPARE_HEADS");

      // Operador escolhe incorretamente a esquerda (90 > 10):
      const res = executeMergeStep(state, "DISPATCH_LEFT");
      expect(res.valid).toBe(false);
      expect(res.isPedagogicalError).toBe(true);
      expect(res.resultType).toBe("PEDAGOGICAL_ERROR");
      expect(res.state.errors).toBe(1);
      expect(res.state.comparisons).toBe(0);
      expect(res.state.writesInBuffer).toBe(0);
      expect(res.errorReason).toContain("Atenção na Confluência");
    });

    it("deve permitir múltiplos erros consecutivos sem inflar métricas ao acertar", () => {
      let state = initMergeSortState([90, 10]);

      // Comete 3 erros consecutivos:
      state = executeMergeStep(state, "DISPATCH_LEFT").state;
      state = executeMergeStep(state, "DISPATCH_LEFT").state;
      state = executeMergeStep(state, "DISPATCH_LEFT").state;

      expect(state.errors).toBe(3);
      expect(state.comparisons).toBe(0);
      expect(state.writesInBuffer).toBe(0);

      // Agora acerta:
      const res = executeMergeStep(state, "DISPATCH_RIGHT");
      expect(res.valid).toBe(true);
      expect(res.state.errors).toBe(3);
      expect(res.state.comparisons).toBe(1);
      expect(res.state.writesInBuffer).toBe(1);
    });

    it("deve ignorar com zero penalidade ação impossível (DRAIN em COMPARE_HEADS)", () => {
      const state = initMergeSortState([10, 20]);
      expect(state.phase).toBe("COMPARE_HEADS");

      const res = executeMergeStep(state, "DRAIN_REMAINDER");
      expect(res.valid).toBe(false);
      expect(res.isPedagogicalError).toBe(false);
      expect(res.resultType).toBe("INVALID_ACTION_FOR_PHASE");
      expect(res.state.errors).toBe(0);
      expect(res.state.comparisons).toBe(0);
      expect(res.state.writesInBuffer).toBe(0);
    });

    it("deve ignorar com zero penalidade ação impossível (DISPATCH em DRAIN_READY)", () => {
      let state = initMergeSortState([20, 10]);
      // Despacha 10 da direita -> entra em DRAIN_READY
      state = executeMergeStep(state, "DISPATCH_RIGHT").state;
      expect(state.phase).toBe("DRAIN_READY");

      const res = executeMergeStep(state, "DISPATCH_LEFT");
      expect(res.valid).toBe(false);
      expect(res.isPedagogicalError).toBe(false);
      expect(res.resultType).toBe("INVALID_ACTION_FOR_PHASE");
      expect(res.state.errors).toBe(0);
    });

    it("deve proteger o estado quando completed for true rejeitando ações sem penalidade", () => {
      const state = solveMergeSort(initMergeSortState([2, 1]));
      expect(state.completed).toBe(true);

      const res = executeMergeStep(state, "DISPATCH_LEFT");
      expect(res.valid).toBe(false);
      expect(res.isPedagogicalError).toBe(false);
      expect(res.resultType).toBe("INVALID_ACTION_FOR_PHASE");
      expect(res.state.errors).toBe(0);
    });
  });

  describe("8. Imutabilidade e Reconstrução Factual a partir do History", () => {
    it("deve garantir imutabilidade estrita dos estados e não mutar o array inicial", () => {
      const rawInput = [4, 1, 3, 2];
      const frozenCopy = [...rawInput];
      const state1 = initMergeSortState(rawInput);

      expect(rawInput).toEqual(frozenCopy);
      expect(Object.isFrozen(state1)).toBe(true);
      expect(Object.isFrozen(state1.values)).toBe(true);
      expect(Object.isFrozen(state1.history)).toBe(true);

      const exp = getExpectedMergeStep(state1)!;
      const state2 = executeMergeStep(state1, exp.expectedDecision).state;

      expect(state1).not.toBe(state2);
      expect(state1.history.length).toBeLessThan(state2.history.length);
      expect(state1.history[0]).toBe(state2.history[0]); // Snapshots passados preservados
    });

    it("deve permitir reconstruir o estado visual final e métricas diretamente do history", () => {
      const raw = [50, 20, 40, 10, 30];
      const finalState = solveMergeSort(initMergeSortState(raw));

      const reconstructed = reconstructMergeStateFromHistory(
        finalState.initialValues,
        finalState.history,
      );

      // Verificação exata da reconstrução sem reexecutar a ordenação:
      expect(reconstructed.finalValues.map((v) => v.value)).toEqual([
        10, 20, 30, 40, 50,
      ]);
      expect(reconstructed.finalValues).toEqual(finalState.values);
      expect(reconstructed.totalComparisons).toBe(finalState.comparisons);
      expect(reconstructed.totalBufferWrites).toBe(finalState.writesInBuffer);
      expect(reconstructed.totalMainWrites).toBe(finalState.writesInMain);
      expect(reconstructed.totalWrites).toBe(finalState.totalWrites);
      expect(reconstructed.divideCount).toBeGreaterThan(0);
      expect(reconstructed.mergeInitCount).toBe(reconstructed.copyBackCount);
    });
  });

  describe("9. Sistema de Pontuação e Dicas", () => {
    it("deve calcular a pontuação canônica correta do protocolo", () => {
      let state = initMergeSortState([3, 1, 2]);
      expect(getMergeSortScore(state)).toBe(100);

      // Simula 1 erro:
      state = executeMergeStep(state, "DISPATCH_LEFT").state; // erro intencional (3 > 1)
      expect(getMergeSortScore(state)).toBe(90);

      // Solicita 1 dica (-5):
      const hintRes = requestMergeHint(state);
      expect(hintRes.hint).toBeDefined();
      expect(hintRes.state.hintsUsed).toBe(1);
      expect(getMergeSortScore(hintRes.state)).toBe(85);
    });
  });
});
