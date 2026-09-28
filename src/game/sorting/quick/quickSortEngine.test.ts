import { describe, expect, it } from "vitest";
import {
  advanceAutomaticSteps,
  createQuickElement,
  initQuickSortState,
  normalizeQuickInput,
  reconstructQuickVisualFrame,
  stepQuickSort,
  swapInArray,
  QUICK_SORT_PSEUDOCODE_LINES,
} from "./quickSortEngine";
import type {
  QuickDecision,
  QuickElement,
  QuickSortState,
  QuickStepRecord,
} from "./types";

/**
 * Helper determinístico para resolver a ordenação executando estritamente a decisão correta.
 */
function solveQuickSort(initialState: QuickSortState): QuickSortState {
  let state = initialState;
  let safety = 0;

  while (!state.completed && safety < 1000) {
    safety++;
    if (state.phase === "INSPECT_ELEMENT") {
      const current = state.values[state.j];
      const pivot = state.values[state.activeInterval!.high];
      const decision: QuickDecision =
        current.value <= pivot.value ? "LESS_OR_EQUAL" : "GREATER";
      const result = stepQuickSort(state, decision);
      expect(result.success).toBe(true);
      state = result.state;
    } else if (state.phase === "PARTITION_READY_FOR_PIVOT") {
      const result = stepQuickSort(state, "PLACE_PIVOT");
      expect(result.success).toBe(true);
      state = result.state;
    } else {
      throw new Error(`Estado inesperado na resolução: ${state.phase}`);
    }
  }

  expect(safety).toBeLessThan(1000);
  return state;
}

describe("Quick Sort Pure Engine — Marco P3.2-B", () => {
  describe("1. Inicialização, Casos Base e Degenerados", () => {
    it("deve tratar vetor vazio com término imediato e métricas zeradas", () => {
      const state = initQuickSortState([]);
      expect(state.completed).toBe(true);
      expect(state.phase).toBe("COMPLETED");
      expect(state.values).toHaveLength(0);
      expect(state.comparisons).toBe(0);
      expect(state.swaps).toBe(0);
      expect(state.writesInArray).toBe(0);
      expect(state.errors).toBe(0);
      expect(state.sortedIndices).toHaveLength(0);
      expect(state.history).toHaveLength(1);
      expect(state.history[0].eventType).toBe("SORT_COMPLETE");
    });

    it("deve tratar vetor unitário como caso axiomático com zero comparações, trocas e escritas", () => {
      const state = initQuickSortState([42]);
      expect(state.completed).toBe(true);
      expect(state.phase).toBe("COMPLETED");
      expect(state.values).toHaveLength(1);
      expect(state.values[0].value).toBe(42);
      expect(state.comparisons).toBe(0);
      expect(state.swaps).toBe(0);
      expect(state.writesInArray).toBe(0);
      expect(state.errors).toBe(0);
      expect(state.sortedIndices).toEqual([0]);
      expect(state.history).toHaveLength(2);
      expect(state.history[0].eventType).toBe("BASE_CASE_RESOLVED");
      expect(state.history[1].eventType).toBe("SORT_COMPLETE");
    });

    it("deve inicializar vetor de tamanho 2 pausando na primeira inspeção interativa", () => {
      const state = initQuickSortState([9, 3]);
      expect(state.completed).toBe(false);
      expect(state.phase).toBe("INSPECT_ELEMENT");
      expect(state.activeInterval).toEqual({ low: 0, high: 1 });
      expect(state.i).toBe(-1);
      expect(state.j).toBe(0);
      expect(state.pivotIndex).toBe(1);
      expect(state.pivotElement?.value).toBe(3);
      expect(state.comparisons).toBe(0);
      expect(state.swaps).toBe(0);
      expect(state.writesInArray).toBe(0);
    });
  });

  describe("2. Casos Canônicos de Referência do Marco P3.2", () => {
    it("caso [5, 2, 4, 1, 3]: deve ordenar com exatamente 6 comparações, 5 trocas e 10 escritas", () => {
      const initial = initQuickSortState([5, 2, 4, 1, 3]);
      const finalState = solveQuickSort(initial);

      expect(finalState.completed).toBe(true);
      expect(finalState.values.map((el) => el.value)).toEqual([1, 2, 3, 4, 5]);
      expect(finalState.comparisons).toBe(6);
      expect(finalState.swaps).toBe(5);
      expect(finalState.writesInArray).toBe(10);
      expect(finalState.writesInArray).toBe(2 * finalState.swaps);
      expect(finalState.errors).toBe(0);
      expect(finalState.sortedIndices).toEqual([0, 1, 2, 3, 4]);
    });

    it("caso tutorial [4a, 4b, 1, 2, 3]: deve ordenar para [1, 2, 3, 4b, 4a] com 6 comparações, 3 trocas e 6 escritas, provando não-estabilidade", () => {
      const input = [
        { value: 4, label: "4a", id: "elem-0-v4a", originalIndex: 0 },
        { value: 4, label: "4b", id: "elem-1-v4b", originalIndex: 1 },
        { value: 1, label: "1", id: "elem-2-v1", originalIndex: 2 },
        { value: 2, label: "2", id: "elem-3-v2", originalIndex: 3 },
        { value: 3, label: "3", id: "elem-4-v3", originalIndex: 4 },
      ];
      const initial = initQuickSortState(input);
      const finalState = solveQuickSort(initial);

      expect(finalState.completed).toBe(true);
      expect(finalState.values.map((el) => el.value)).toEqual([1, 2, 3, 4, 4]);
      // Inversão comprovada: 4b termina antes de 4a:
      expect(finalState.values[3].label).toBe("4b");
      expect(finalState.values[3].originalIndex).toBe(1);
      expect(finalState.values[4].label).toBe("4a");
      expect(finalState.values[4].originalIndex).toBe(0);

      // Métricas factuais exatas da partição de Lomuto:
      expect(finalState.comparisons).toBe(6);
      expect(finalState.swaps).toBe(3);
      expect(finalState.writesInArray).toBe(6);
      expect(finalState.writesInArray).toBe(2 * finalState.swaps);
    });

    it("caso [4a, 1, 4b, 2, 3]: deve preservar a ordem das duplicatas [1, 2, 3, 4a, 4b], provando que instabilidade significa ausência de garantia e não inversão obrigatória", () => {
      const input = [
        { value: 4, label: "4a", id: "elem-0-v4a", originalIndex: 0 },
        { value: 1, label: "1", id: "elem-1-v1", originalIndex: 1 },
        { value: 4, label: "4b", id: "elem-2-v4b", originalIndex: 2 },
        { value: 2, label: "2", id: "elem-3-v2", originalIndex: 3 },
        { value: 3, label: "3", id: "elem-4-v3", originalIndex: 4 },
      ];
      const initial = initQuickSortState(input);
      const finalState = solveQuickSort(initial);

      expect(finalState.completed).toBe(true);
      expect(finalState.values.map((el) => el.value)).toEqual([1, 2, 3, 4, 4]);
      // 4a permaneceu antes de 4b:
      expect(finalState.values[3].label).toBe("4a");
      expect(finalState.values[3].originalIndex).toBe(0);
      expect(finalState.values[4].label).toBe("4b");
      expect(finalState.values[4].originalIndex).toBe(2);
    });

    it("caso crescente [1, 2, 3, 4, 5]: deve executar n(n-1)/2 = 10 comparações e ZERO trocas/escritas", () => {
      const initial = initQuickSortState([1, 2, 3, 4, 5]);
      const finalState = solveQuickSort(initial);

      expect(finalState.completed).toBe(true);
      expect(finalState.values.map((el) => el.value)).toEqual([1, 2, 3, 4, 5]);
      expect(finalState.comparisons).toBe(10);
      expect(finalState.swaps).toBe(0);
      expect(finalState.writesInArray).toBe(0);
    });

    it("caso todos iguais [7, 7, 7, 7]: deve executar 4*3/2 = 6 comparações e ZERO trocas/escritas", () => {
      const initial = initQuickSortState([7, 7, 7, 7]);
      const finalState = solveQuickSort(initial);

      expect(finalState.completed).toBe(true);
      expect(finalState.values.map((el) => el.value)).toEqual([7, 7, 7, 7]);
      expect(finalState.comparisons).toBe(6);
      expect(finalState.swaps).toBe(0);
      expect(finalState.writesInArray).toBe(0);
    });

    it("caso decrescente [5, 4, 3, 2, 1]: deve ordenar corretamente", () => {
      const initial = initQuickSortState([5, 4, 3, 2, 1]);
      const finalState = solveQuickSort(initial);

      expect(finalState.completed).toBe(true);
      expect(finalState.values.map((el) => el.value)).toEqual([1, 2, 3, 4, 5]);
      expect(finalState.writesInArray).toBe(2 * finalState.swaps);
    });
  });

  describe("3. Invariantes do Particionamento de Lomuto e Omissão de Auto-Trocas", () => {
    it("deve manter as invariantes das regiões <= P e > P a cada passo de inspeção", () => {
      let state = initQuickSortState([6, 2, 8, 4, 5]);
      let safety = 0;

      while (!state.completed && safety < 500) {
        safety++;
        if (state.phase === "INSPECT_ELEMENT" && state.activeInterval) {
          const { low, high } = state.activeInterval;
          const pivotVal = state.values[high].value;

          // Invariante 1: todos os elementos de low até i são <= pivotVal
          for (let k = low; k <= state.i; k++) {
            expect(state.values[k].value).toBeLessThanOrEqual(pivotVal);
          }
          // Invariante 2: todos os elementos de i+1 até j-1 são > pivotVal
          for (let k = state.i + 1; k < state.j; k++) {
            expect(state.values[k].value).toBeGreaterThan(pivotVal);
          }

          const current = state.values[state.j];
          const dec: QuickDecision =
            current.value <= pivotVal ? "LESS_OR_EQUAL" : "GREATER";
          const res = stepQuickSort(state, dec);
          expect(res.success).toBe(true);
          state = res.state;
        } else if (state.phase === "PARTITION_READY_FOR_PIVOT") {
          const res = stepQuickSort(state, "PLACE_PIVOT");
          expect(res.success).toBe(true);
          state = res.state;
        }
      }

      expect(state.completed).toBe(true);
    });

    it("deve omitir auto-troca quando newI === state.j na classificação", () => {
      // No vetor [2, 8, 5], 2 <= 5. i vai de -1 para 0. j é 0. newI = 0 === j.
      const initial = initQuickSortState([2, 8, 5]);
      expect(initial.phase).toBe("INSPECT_ELEMENT");
      expect(initial.i).toBe(-1);
      expect(initial.j).toBe(0);

      const res = stepQuickSort(initial, "LESS_OR_EQUAL");
      expect(res.success).toBe(true);
      // Ponteiro i avançou para 0:
      expect(res.state.i).toBe(0);
      expect(res.state.j).toBe(1);
      // Swaps e writesInArray NÃO devem ser incrementados:
      expect(res.state.swaps).toBe(0);
      expect(res.state.writesInArray).toBe(0);
      expect(res.state.history[res.state.history.length - 1].swapContext).toBeUndefined();
    });

    it("deve omitir auto-troca quando o pivô já está na posição final (i + 1 === high)", () => {
      // No vetor [1, 2, 3], após classificar 1 e 2, i = 1. high = 2.
      // i + 1 = 2 === high = 2. O pivô 3 já está no índice 2.
      let state = initQuickSortState([1, 2, 3]);
      state = stepQuickSort(state, "LESS_OR_EQUAL").state; // j = 0
      state = stepQuickSort(state, "LESS_OR_EQUAL").state; // j = 1
      expect(state.phase).toBe("PARTITION_READY_FOR_PIVOT");
      expect(state.i).toBe(1);
      expect(state.activeInterval?.high).toBe(2);

      const res = stepQuickSort(state, "PLACE_PIVOT");
      expect(res.success).toBe(true);
      // Nenhuma permuta física foi executada:
      expect(res.state.swaps).toBe(0);
      expect(res.state.writesInArray).toBe(0);
    });
  });

  describe("4. Processamento Left-First e Posições Definitivas", () => {
    it("deve processar o subintervalo esquerdo antes do direito", () => {
      // Vetor [4, 1, 5, 2, 3]: pivô 3.
      // Partição raiz divide em esquerdo [0..1] e direito [3..4].
      // O próximo intervalo ativado DEVE ser [0..1] (esquerdo).
      let state = initQuickSortState([4, 1, 5, 2, 3]);
      // Classifica 4 (> 3)
      state = stepQuickSort(state, "GREATER").state;
      // Classifica 1 (<= 3) -> troca com 4
      state = stepQuickSort(state, "LESS_OR_EQUAL").state;
      // Classifica 5 (> 3)
      state = stepQuickSort(state, "GREATER").state;
      // Classifica 2 (<= 3) -> troca com 4
      state = stepQuickSort(state, "LESS_OR_EQUAL").state;
      expect(state.phase).toBe("PARTITION_READY_FOR_PIVOT");

      // Posiciona pivô:
      state = stepQuickSort(state, "PLACE_PIVOT").state;

      // O próximo intervalo ativo deve ser o esquerdo [0..1]:
      expect(state.activeInterval).toEqual({ low: 0, high: 1 });
      // E o intervalo direito [3..4] deve estar guardado na pilha de pendentes:
      expect(state.pendingIntervals).toEqual([{ low: 3, high: 4 }]);
    });

    it("posições marcadas como definitivas nunca devem ser movimentadas posteriormente", () => {
      let state = initQuickSortState([5, 2, 4, 1, 3]);
      const elementsAtSortedPositions = new Map<number, string>();

      while (!state.completed) {
        if (state.phase === "INSPECT_ELEMENT") {
          const current = state.values[state.j];
          const pivot = state.values[state.activeInterval!.high];
          const decision: QuickDecision =
            current.value <= pivot.value ? "LESS_OR_EQUAL" : "GREATER";
          state = stepQuickSort(state, decision).state;
        } else if (state.phase === "PARTITION_READY_FOR_PIVOT") {
          state = stepQuickSort(state, "PLACE_PIVOT").state;
          // Registra os elementos nas posições definitivas conhecidas:
          for (const idx of state.sortedIndices) {
            if (!elementsAtSortedPositions.has(idx)) {
              elementsAtSortedPositions.set(idx, state.values[idx].id);
            } else {
              // Invariante: o elemento naquele índice consolidado NUNCA muda:
              expect(state.values[idx].id).toBe(
                elementsAtSortedPositions.get(idx),
              );
            }
          }
        }
      }

      // Ao fim, todos os índices definitivos conferem:
      for (const [idx, id] of elementsAtSortedPositions.entries()) {
        expect(state.values[idx].id).toBe(id);
      }
    });
  });

  describe("5. Tratamento de Erros, Ações Impossíveis e Proteção", () => {
    it("deve incrementar errors sem avançar ponteiros nem métricas em classificação errônea", () => {
      const initial = initQuickSortState([9, 2, 5]);
      // j = 0, elemento 9 contra pivô 5. Decisão correta é GREATER.
      expect(initial.phase).toBe("INSPECT_ELEMENT");
      expect(initial.j).toBe(0);
      expect(initial.errors).toBe(0);
      expect(initial.comparisons).toBe(0);

      // Estudante comete erro e clica LESS_OR_EQUAL:
      const result = stepQuickSort(initial, "LESS_OR_EQUAL");
      expect(result.success).toBe(false);
      expect(result.isError).toBe(true);
      expect(result.isActionImpossible).toBe(false);
      expect(result.message).toContain("MAIOR que o pivô 5");

      // Estado após erro:
      expect(result.state.errors).toBe(1);
      expect(result.state.comparisons).toBe(0);
      expect(result.state.swaps).toBe(0);
      expect(result.state.writesInArray).toBe(0);
      expect(result.state.j).toBe(0);
      expect(result.state.i).toBe(-1);

      // Repetindo o erro não deve inflacionar comparações:
      const result2 = stepQuickSort(result.state, "LESS_OR_EQUAL");
      expect(result2.state.errors).toBe(2);
      expect(result2.state.comparisons).toBe(0);

      // Agora acerta a decisão:
      const result3 = stepQuickSort(result2.state, "GREATER");
      expect(result3.success).toBe(true);
      expect(result3.state.comparisons).toBe(1);
      expect(result3.state.errors).toBe(2);
      expect(result3.state.j).toBe(1);
    });

    it("deve tratar PLACE_PIVOT durante INSPECT_ELEMENT como ação impossível sem penalidade", () => {
      const initial = initQuickSortState([5, 2, 4]);
      const res = stepQuickSort(initial, "PLACE_PIVOT");

      expect(res.success).toBe(false);
      expect(res.isActionImpossible).toBe(true);
      expect(res.isError).toBe(false);
      expect(res.state.errors).toBe(0);
      expect(res.state.comparisons).toBe(0);
    });

    it("deve tratar LESS_OR_EQUAL durante PARTITION_READY_FOR_PIVOT como ação impossível sem penalidade", () => {
      let state = initQuickSortState([1, 5]);
      // j = 0, elemento 1 contra pivô 5 (<=)
      state = stepQuickSort(state, "LESS_OR_EQUAL").state;
      expect(state.phase).toBe("PARTITION_READY_FOR_PIVOT");

      const res = stepQuickSort(state, "LESS_OR_EQUAL");
      expect(res.success).toBe(false);
      expect(res.isActionImpossible).toBe(true);
      expect(res.isError).toBe(false);
      expect(res.state.errors).toBe(0);
    });

    it("deve proteger estado COMPLETED contra qualquer ação subsequente", () => {
      const initial = initQuickSortState([1]);
      expect(initial.completed).toBe(true);

      const res1 = stepQuickSort(initial, "LESS_OR_EQUAL");
      expect(res1.isActionImpossible).toBe(true);
      const res2 = stepQuickSort(initial, "PLACE_PIVOT");
      expect(res2.isActionImpossible).toBe(true);
    });

    it("deve aceitar LESS_OR_EQUAL para elementos com identidades distintas mas mesmo valor", () => {
      const input = [
        { value: 5, label: "5a", id: "5a" },
        { value: 5, label: "5b", id: "5b" },
      ];
      const initial = initQuickSortState(input);
      // j = 0 (5a), pivô = 5b. 5a.value <= 5b.value (5 <= 5 é Verdadeiro).
      const res = stepQuickSort(initial, "LESS_OR_EQUAL");
      expect(res.success).toBe(true);
      expect(res.state.comparisons).toBe(1);
    });
  });

  describe("6. Imutabilidade e Reconstrução Factual do History", () => {
    it("deve garantir imutabilidade da entrada e snapshots", () => {
      const raw = [5, 2, 4, 1, 3];
      const state = initQuickSortState(raw);
      expect(Object.isFrozen(state)).toBe(true);
      expect(Object.isFrozen(state.values)).toBe(true);
      expect(Object.isFrozen(state.initialValues)).toBe(true);

      const next = stepQuickSort(state, "GREATER");
      expect(Object.isFrozen(next.state)).toBe(true);
      expect(state.comparisons).toBe(0);
      expect(next.state.comparisons).toBe(1);
    });

    it("deve registrar comparisonContext prévio imutável no history para reconstrução factual", () => {
      const initial = initQuickSortState([9, 2, 5]);
      // j = 0: 9 > 5
      const res = stepQuickSort(initial, "GREATER");
      const record = res.state.history[res.state.history.length - 1];

      expect(record.eventType).toBe("CLASSIFY_ELEMENT");
      expect(record.comparisonContext).toBeDefined();
      // O contexto prévio preserva os índices e valores originais da comparação:
      expect(record.comparisonContext?.elementIndex).toBe(0);
      expect(record.comparisonContext?.elementValue).toBe(9);
      expect(record.comparisonContext?.pivotIndex).toBe(2);
      expect(record.comparisonContext?.pivotValue).toBe(5);
      expect(record.comparisonContext?.expectedDecision).toBe("GREATER");

      // No estado pós-evento, j já avançou para 1:
      expect(record.j).toBe(1);
      // Mas o context preservou elementIndex = 0!
      expect(record.comparisonContext?.elementIndex).toBe(0);
    });

    it("reconstructQuickVisualFrame deve converter registros de history sem reexecução algorítmica", () => {
      const initial = initQuickSortState([5, 2, 4, 1, 3]);
      const solved = solveQuickSort(initial);

      expect(solved.history.length).toBeGreaterThan(5);
      for (const record of solved.history) {
        const frame = reconstructQuickVisualFrame(record);
        expect(frame.stepIndex).toBe(record.stepIndex);
        expect(frame.eventType).toBe(record.eventType);
        expect(frame.values).toEqual(record.valuesSnapshot);
        expect(frame.comparisons).toBe(record.comparisons);
        expect(frame.swaps).toBe(record.swaps);
      }
    });

    it("helper swapInArray deve retornar executed: false e mesma referência em auto-troca", () => {
      const elems = normalizeQuickInput([10, 20]);
      const resSame = swapInArray(elems, 0, 0);
      expect(resSame.executed).toBe(false);
      expect(resSame.newArray).toBe(elems);

      const resDiff = swapInArray(elems, 0, 1);
      expect(resDiff.executed).toBe(true);
      expect(resDiff.newArray[0].value).toBe(20);
      expect(resDiff.newArray[1].value).toBe(10);
      expect(resDiff.newArray).not.toBe(elems);
    });

    it("deve conter exatamente 27 linhas no pseudocódigo canônico", () => {
      expect(QUICK_SORT_PSEUDOCODE_LINES).toHaveLength(27);
      expect(QUICK_SORT_PSEUDOCODE_LINES[0]).toContain("procedimento quickSort");
      expect(QUICK_SORT_PSEUDOCODE_LINES[14]).toContain("se A[j].valor ≤ pivo.valor então");
      expect(QUICK_SORT_PSEUDOCODE_LINES[17]).toContain("trocar A[i] com A[j]");
      expect(QUICK_SORT_PSEUDOCODE_LINES[26]).toContain("fim procedimento");
    });
  });

  describe("7. Diversidade de Tamanhos (Pares e Ímpares) e Estruturas de Memória", () => {
    it.each([
      { name: "par n=4", input: [30, 10, 40, 20], expected: [10, 20, 30, 40] },
      { name: "ímpar n=5", input: [50, 20, 10, 40, 30], expected: [10, 20, 30, 40, 50] },
      { name: "par n=6", input: [6, 1, 5, 2, 4, 3], expected: [1, 2, 3, 4, 5, 6] },
      { name: "ímpar n=7", input: [7, 3, 5, 1, 6, 2, 4], expected: [1, 2, 3, 4, 5, 6, 7] },
      { name: "par n=8", input: [8, 4, 7, 1, 6, 3, 5, 2], expected: [1, 2, 3, 4, 5, 6, 7, 8] },
    ])("deve ordenar corretamente vetor de tamanho $name", ({ input, expected }) => {
      const initial = initQuickSortState(input);
      const solved = solveQuickSort(initial);
      expect(solved.completed).toBe(true);
      expect(solved.values.map((el) => el.value)).toEqual(expected);
      expect(solved.writesInArray).toBe(2 * solved.swaps);
    });

    it("deve demonstrar acúmulo efetivo de intervalos pendentes na pilha explícita quando partições geram ramos direitos não-vazios", () => {
      // Vetor construído de modo que a partição raiz divida gerando um ramo direito de tamanho >= 2,
      // e os ramos esquerdos sucessivos também gerem ramos direitos pendentes.
      // Exemplo n=7: [2, 1, 3, 5, 4, 6, 3] ou similar.
      // Vamos testar [3, 1, 2, 6, 5, 7, 4]:
      // high = 6 (valor 4). Menores: 3, 1, 2 (índices 0..2). Maiores: 6, 5, 7.
      // Pivô 4 vai para o índice 3.
      // Filho direito [4..6] (tamanho 3) é empilhado na pilha.
      // Filho esquerdo [0..2] (tamanho 3) é ativado.
      // No filho esquerdo [0..2], pivô 2 (índice 2). Menores: 1. Maiores: 3.
      // Pivô 2 vai para o índice 1.
      // Filho direito [2..2] (unitário) e esquerdo [0..0] (unitário).
      // Durante esse processo, o subintervalo [4..6] aguarda na pilha explícita!
      let state = initQuickSortState([3, 1, 2, 6, 5, 7, 4]);
      let maxPendingRecorded = 0;

      while (!state.completed) {
        if (state.pendingIntervals.length > maxPendingRecorded) {
          maxPendingRecorded = state.pendingIntervals.length;
        }
        if (state.phase === "INSPECT_ELEMENT") {
          const current = state.values[state.j];
          const pivot = state.values[state.activeInterval!.high];
          const decision: QuickDecision =
            current.value <= pivot.value ? "LESS_OR_EQUAL" : "GREATER";
          state = stepQuickSort(state, decision).state;
        } else if (state.phase === "PARTITION_READY_FOR_PIVOT") {
          state = stepQuickSort(state, "PLACE_PIVOT").state;
        }
      }

      expect(state.completed).toBe(true);
      // Confirma que a pilha acumulou intervalos pendentes enquanto processava o lado esquerdo:
      expect(maxPendingRecorded).toBeGreaterThanOrEqual(1);
    });

    it("na entrada já ordenada, a pilha explícita mantém no máximo 1 intervalo pendente", () => {
      let state = initQuickSortState([1, 2, 3, 4, 5]);

      while (!state.completed) {
        if (state.phase === "INSPECT_ELEMENT") {
          const current = state.values[state.j];
          const pivot = state.values[state.activeInterval!.high];
          const decision: QuickDecision =
            current.value <= pivot.value ? "LESS_OR_EQUAL" : "GREATER";
          state = stepQuickSort(state, decision).state;
        } else if (state.phase === "PARTITION_READY_FOR_PIVOT") {
          state = stepQuickSort(state, "PLACE_PIVOT").state;
        }
      }

      expect(state.completed).toBe(true);
      // Fato crucial verificado nos registros do histórico:
      // Como na entrada ordenada cada partição gera um filho direito vazio e um esquerdo [0..p-1],
      // a pilha explícita nunca acumula mais de 1 intervalo pendente no snapshot de PIVOT_POSITIONED,
      // apesar de o algoritmo executar o pior caso quadrático Theta(n^2)!
      const maxPendingInHistory = Math.max(
        ...state.history.map((r) => r.pendingIntervals.length),
      );
      expect(maxPendingInHistory).toBe(1);

      // Durante os estados interativos de inspeção, o único intervalo filho é imediatamente
      // ativado como activeInterval, deixando 0 pendentes na pilha:
      expect(state.pendingIntervals).toHaveLength(0);
    });
  });
});
