/**
 * Suíte de testes unitários para a Insertion Sort Engine pura do Sorting Station.
 *
 * Valida rigorosamente:
 * 1. Inicialização, auto-lift determinístico e casos de borda (vazio, unitário);
 * 2. Invariantes de vaga única (null), chave suspensa e conservação de massa (n);
 * 3. FSM canônica por deslocamentos (COMPARE_AND_SHIFT, INSERT_READY, COMPLETED);
 * 4. Exemplo canônico [4, 2, 3] e métricas esperadas;
 * 5. Casos assintóticos (já ordenado, invertido, quase ordenado);
 * 6. Suporte a duplicados, preservação estrita de estabilidade (A[j] > key), negativos e zeros;
 * 7. Distinção entre ERRO PEDAGÓGICO (errors += 1) e AÇÃO INVÁLIDA DE FASE (errors inalterado);
 * 8. Histórico discriminado completo (KEY_LIFT, SHIFT, INSERT por CONDITION_FALSE e HEAD_REACHED);
 * 9. Ausência absoluta de comparação fictícia com A[-1];
 * 10. Imutabilidade e determinismo funcional.
 */

import { describe, expect, it } from "vitest";
import {
  calculateInsertionSortProgress,
  createInsertionSortState,
  executeInsertionStep,
  getExpectedInsertionStep,
  getInsertionOrderedIndices,
  isInsertionSortComplete,
} from "./insertionSortEngine";
import type {
  InsertionInsertConditionFalseStepRecord,
  InsertionInsertHeadReachedStepRecord,
  InsertionKeyLiftStepRecord,
  InsertionShiftStepRecord,
  InsertionSortState,
} from "./types";

describe("Insertion Sort Engine - Pure Domain & FSM", () => {
  describe("1. Inicialização e Casos de Borda", () => {
    it("vetor vazio inicializa imediatamente como COMPLETED sem erros", () => {
      const state = createInsertionSortState([]);

      expect(state.completed).toBe(true);
      expect(state.phase).toBe("COMPLETED");
      expect(state.status).toBe("COMPLETED");
      expect(state.arrayLength).toBe(0);
      expect(state.currentValues).toEqual([]);
      expect(state.key).toBeNull();
      expect(state.holeIndex).toBeNull();
      expect(state.comparisons).toBe(0);
      expect(state.shifts).toBe(0);
      expect(state.insertions).toBe(0);
      expect(state.errors).toBe(0);
      expect(state.orderedBoundary).toBe(-1);
      expect(state.history).toHaveLength(0);
      expect(getInsertionOrderedIndices(state)).toEqual([]);
      expect(isInsertionSortComplete(state)).toBe(true);
      expect(calculateInsertionSortProgress(state)).toBe(100);
      expect(getExpectedInsertionStep(state)).toBeNull();
    });

    it("vetor unitário inicializa imediatamente como COMPLETED", () => {
      const state = createInsertionSortState([42]);

      expect(state.completed).toBe(true);
      expect(state.phase).toBe("COMPLETED");
      expect(state.arrayLength).toBe(1);
      expect(state.currentValues).toEqual([42]);
      expect(state.key).toBeNull();
      expect(state.holeIndex).toBeNull();
      expect(state.comparisons).toBe(0);
      expect(state.shifts).toBe(0);
      expect(state.insertions).toBe(0);
      expect(state.errors).toBe(0);
      expect(state.orderedBoundary).toBe(0);
      expect(state.history).toHaveLength(0);
      expect(getInsertionOrderedIndices(state)).toEqual([0]);
      expect(isInsertionSortComplete(state)).toBe(true);
      expect(calculateInsertionSortProgress(state)).toBe(100);
    });

    it("vetor n >= 2 executa auto-lift determinístico na passada 1 (i = 1)", () => {
      const input = [5, 2, 8];
      const state = createInsertionSortState(input);

      expect(state.completed).toBe(false);
      expect(state.phase).toBe("COMPARE_AND_SHIFT");
      expect(state.status).toBe("RUNNING");
      expect(state.arrayLength).toBe(3);
      expect(state.i).toBe(1);
      expect(state.j).toBe(0);
      expect(state.key).toBe(2);
      expect(state.holeIndex).toBe(1);
      expect(state.currentValues).toEqual([5, null, 8]);
      expect(state.orderedBoundary).toBe(0);
      expect(getInsertionOrderedIndices(state)).toEqual([0]);

      // Registro de KEY_LIFT no histórico
      expect(state.history).toHaveLength(1);
      const liftRecord = state.history[0] as InsertionKeyLiftStepRecord;
      expect(liftRecord.type).toBe("KEY_LIFT");
      expect(liftRecord.i).toBe(1);
      expect(liftRecord.key).toBe(2);
      expect(liftRecord.holeIndex).toBe(1);
      expect(liftRecord.orderedBoundary).toBe(0);
      expect(liftRecord.valuesSnapshot).toEqual([5, null, 8]);
    });
  });

  describe("2. Invariantes Fundamentais e Conservação de Massa", () => {
    it("conservação de elementos: não-nulos em currentValues + (key ? 1 : 0) === arrayLength", () => {
      let state = createInsertionSortState([4, 2, 3]);

      const verifyConservation = (s: InsertionSortState) => {
        const nonNullCount = s.currentValues.filter((v) => v !== null).length;
        const keyCount = s.key !== null ? 1 : 0;
        expect(nonNullCount + keyCount).toBe(s.arrayLength);

        if (s.key !== null) {
          const nullCount = s.currentValues.filter((v) => v === null).length;
          expect(nullCount).toBe(1);
          expect(s.holeIndex).not.toBeNull();
          expect(s.currentValues[s.holeIndex!]).toBeNull();
        } else {
          expect(s.currentValues.every((v) => v !== null)).toBe(true);
          expect(s.holeIndex).toBeNull();
        }
      };

      verifyConservation(state);

      // Passo 1: SHIFT_RIGHT
      let res = executeInsertionStep(state, "SHIFT_RIGHT");
      state = res.state;
      verifyConservation(state);

      // Passo 2: INSERT_KEY
      res = executeInsertionStep(state, "INSERT_KEY");
      state = res.state;
      verifyConservation(state);

      // Passo 3: SHIFT_RIGHT
      res = executeInsertionStep(state, "SHIFT_RIGHT");
      state = res.state;
      verifyConservation(state);

      // Passo 4: INSERT_KEY
      res = executeInsertionStep(state, "INSERT_KEY");
      state = res.state;
      verifyConservation(state);

      expect(state.completed).toBe(true);
      expect(state.currentValues).toEqual([2, 3, 4]);
    });

    it("initialValues nunca sofre mutação", () => {
      const original = [9, 1, 4];
      const state = createInsertionSortState(original);

      expect(state.initialValues).toEqual([9, 1, 4]);
      expect(Object.isFrozen(state.initialValues)).toBe(true);
      expect(Object.isFrozen(state.currentValues)).toBe(true);

      const res = executeInsertionStep(state, "SHIFT_RIGHT");
      expect(state.initialValues).toEqual([9, 1, 4]);
      expect(res.state.initialValues).toEqual([9, 1, 4]);
    });

    it("deslocamento (shift) não é permuta (swap): apenas uma caixa move-se para a vaga", () => {
      const state = createInsertionSortState([6, 2]);
      // state.currentValues = [6, null], key = 2, holeIndex = 1, j = 0

      const res = executeInsertionStep(state, "SHIFT_RIGHT");
      expect(res.valid).toBe(true);
      expect(res.state.currentValues).toEqual([null, 6]);
      expect(res.state.holeIndex).toBe(0);
      expect(res.state.key).toBe(2); // chave continua suspensa

      const shiftRecord = res.state.history[1] as InsertionShiftStepRecord;
      expect(shiftRecord.type).toBe("SHIFT");
      expect(shiftRecord.holeIndexBefore).toBe(1);
      expect(shiftRecord.holeIndexAfter).toBe(0);
      expect(shiftRecord.shiftedValue).toBe(6);
    });
  });

  describe("3. Exemplo Canônico [4, 2, 3] e Métricas Factuais", () => {
    it("executa com perfeição o roteiro [4, 2, 3] com metrics exatas", () => {
      let state = createInsertionSortState([4, 2, 3]);

      // Estado Inicial após auto-lift de i=1
      expect(state.currentValues).toEqual([4, null, 3]);
      expect(state.key).toBe(2);
      expect(state.holeIndex).toBe(1);
      expect(state.j).toBe(0);
      expect(state.phase).toBe("COMPARE_AND_SHIFT");

      let expected = getExpectedInsertionStep(state);
      expect(expected).not.toBeNull();
      expect(expected!.expectedDecision).toBe("SHIFT_RIGHT");
      expect(expected!.comparedValue).toBe(4);
      expect(expected!.comparisonResult).toBe(true);

      // Passo 1: SHIFT_RIGHT (4 > 2)
      let res = executeInsertionStep(state, "SHIFT_RIGHT");
      expect(res.valid).toBe(true);
      expect(res.resultType).toBe("SUCCESS");
      state = res.state;

      expect(state.currentValues).toEqual([null, 4, 3]);
      expect(state.holeIndex).toBe(0);
      expect(state.j).toBe(-1);
      expect(state.phase).toBe("INSERT_READY");
      expect(state.shifts).toBe(1);
      expect(state.comparisons).toBe(1);

      expected = getExpectedInsertionStep(state);
      expect(expected!.phase).toBe("INSERT_READY");
      expect(expected!.expectedDecision).toBe("INSERT_KEY");

      // Passo 2: INSERT_KEY na cabeceira (j < 0)
      res = executeInsertionStep(state, "INSERT_KEY");
      expect(res.valid).toBe(true);
      expect(res.resultType).toBe("SUCCESS");
      state = res.state;

      // Passada 1 concluída, auto-lift disparou para i=2!
      expect(state.i).toBe(2);
      expect(state.key).toBe(3);
      expect(state.holeIndex).toBe(2);
      expect(state.j).toBe(1);
      expect(state.currentValues).toEqual([2, 4, null]);
      expect(state.orderedBoundary).toBe(1);
      expect(state.insertions).toBe(1);
      expect(state.phase).toBe("COMPARE_AND_SHIFT");

      expected = getExpectedInsertionStep(state);
      expect(expected!.expectedDecision).toBe("SHIFT_RIGHT");
      expect(expected!.comparedValue).toBe(4);

      // Passo 3: SHIFT_RIGHT (4 > 3)
      res = executeInsertionStep(state, "SHIFT_RIGHT");
      expect(res.valid).toBe(true);
      state = res.state;

      expect(state.currentValues).toEqual([2, null, 4]);
      expect(state.holeIndex).toBe(1);
      expect(state.j).toBe(0);
      expect(state.phase).toBe("COMPARE_AND_SHIFT");
      expect(state.shifts).toBe(2);
      expect(state.comparisons).toBe(2);

      expected = getExpectedInsertionStep(state);
      expect(expected!.expectedDecision).toBe("INSERT_KEY");
      expect(expected!.comparedValue).toBe(2);
      expect(expected!.comparisonResult).toBe(false); // 2 <= 3

      // Passo 4: INSERT_KEY por condição falsa (2 <= 3)
      res = executeInsertionStep(state, "INSERT_KEY");
      expect(res.valid).toBe(true);
      state = res.state;

      // Conclusão da ordenação!
      expect(state.completed).toBe(true);
      expect(state.phase).toBe("COMPLETED");
      expect(state.status).toBe("COMPLETED");
      expect(state.currentValues).toEqual([2, 3, 4]);
      expect(state.key).toBeNull();
      expect(state.holeIndex).toBeNull();
      expect(state.orderedBoundary).toBe(2);
      expect(getInsertionOrderedIndices(state)).toEqual([0, 1, 2]);

      // Métricas Finais Exatas do Prompt
      expect(state.comparisons).toBe(3);
      expect(state.shifts).toBe(2);
      expect(state.insertions).toBe(2);
      expect(state.errors).toBe(0);
    });
  });

  describe("4. Casos Assintóticos e Complexidade", () => {
    it("melhor caso (já ordenado): 0 shifts, n - 1 comparisons e n - 1 insertions", () => {
      const input = [10, 20, 30, 40, 50];
      const n = input.length;
      let state = createInsertionSortState(input);

      // Em cada passada, A[j] <= key logo na primeira verificação -> INSERT_KEY imediato
      while (!state.completed) {
        const expected = getExpectedInsertionStep(state);
        expect(expected).not.toBeNull();
        expect(expected!.expectedDecision).toBe("INSERT_KEY");
        expect(expected!.comparisonResult).toBe(false);

        const res = executeInsertionStep(state, "INSERT_KEY");
        expect(res.valid).toBe(true);
        state = res.state;
      }

      expect(state.completed).toBe(true);
      expect(state.currentValues).toEqual([10, 20, 30, 40, 50]);
      expect(state.shifts).toBe(0);
      expect(state.comparisons).toBe(n - 1); // 4 comparações
      expect(state.insertions).toBe(n - 1); // 4 inserções
      expect(state.errors).toBe(0);
    });

    it("pior caso (invertido): n(n-1)/2 shifts e comparações, n - 1 insertions por HEAD_REACHED", () => {
      const input = [4, 3, 2, 1];
      const n = input.length;
      const expectedOperations = (n * (n - 1)) / 2; // 6
      let state = createInsertionSortState(input);

      while (!state.completed) {
        const expected = getExpectedInsertionStep(state);
        expect(expected).not.toBeNull();
        const res = executeInsertionStep(state, expected!.expectedDecision);
        expect(res.valid).toBe(true);
        state = res.state;
      }

      expect(state.completed).toBe(true);
      expect(state.currentValues).toEqual([1, 2, 3, 4]);
      expect(state.shifts).toBe(expectedOperations); // 6
      expect(state.comparisons).toBe(expectedOperations); // 6
      expect(state.insertions).toBe(n - 1); // 3

      // Todas as inserções no pior caso ocorrem por HEAD_REACHED (j = -1)
      const insertRecords = state.history.filter((r) => r.type === "INSERT");
      expect(insertRecords).toHaveLength(3);
      for (const rec of insertRecords) {
        expect(rec.reason).toBe("HEAD_REACHED");
      }
    });

    it("quase ordenado: realiza apenas os shifts estritamente necessários", () => {
      // [1, 3, 2, 4]: apenas a chave 2 precisa deslocar o 3
      let state = createInsertionSortState([1, 3, 2, 4]);

      while (!state.completed) {
        const expected = getExpectedInsertionStep(state);
        const res = executeInsertionStep(state, expected!.expectedDecision);
        state = res.state;
      }

      expect(state.currentValues).toEqual([1, 2, 3, 4]);
      expect(state.shifts).toBe(1); // apenas o 3 deslocou para a direita
      expect(state.insertions).toBe(3);
    });
  });

  describe("5. Suporte a Duplicados e Preservação Estrita de Estabilidade", () => {
    it("duplicados não são deslocados: A[j] === key avalia como falso e insere sem atravessar", () => {
      // Entrada com chaves repetidas
      let state = createInsertionSortState([3, 3]);

      expect(state.key).toBe(3);
      expect(state.j).toBe(0);
      expect(state.currentValues[0]).toBe(3);

      const expected = getExpectedInsertionStep(state);
      expect(expected!.expectedDecision).toBe("INSERT_KEY");
      expect(expected!.comparisonResult).toBe(false); // 3 > 3 é FALSO

      const res = executeInsertionStep(state, "INSERT_KEY");
      expect(res.valid).toBe(true);
      state = res.state;

      expect(state.completed).toBe(true);
      expect(state.currentValues).toEqual([3, 3]);
      expect(state.shifts).toBe(0); // Nenhum shift!
      expect(state.comparisons).toBe(1);
      expect(state.insertions).toBe(1);
    });

    it("vetor com múltiplos elementos repetidos e negativos é ordenado estavelmente", () => {
      let state = createInsertionSortState([0, -2, 5, -2, 0, 3]);

      while (!state.completed) {
        const expected = getExpectedInsertionStep(state);
        const res = executeInsertionStep(state, expected!.expectedDecision);
        state = res.state;
      }

      expect(state.completed).toBe(true);
      expect(state.currentValues).toEqual([-2, -2, 0, 0, 3, 5]);
      expect(state.errors).toBe(0);
    });
  });

  describe("6. Distinção Rigorosa entre Erro Pedagógico e Ação Inválida de Fase", () => {
    it("ERRO PEDAGÓGICO: tentar SHIFT_RIGHT quando A[j] <= key incrementa errors e preserva estado", () => {
      const state = createInsertionSortState([2, 5]); // i=1, key=5, j=0, A[0]=2 <= 5
      expect(state.j).toBe(0);

      const res = executeInsertionStep(state, "SHIFT_RIGHT");
      expect(res.valid).toBe(false);
      expect(res.resultType).toBe("PEDAGOGICAL_ERROR");
      expect(res.isPedagogicalError).toBe(true);
      expect(res.expectedDecision).toBe("INSERT_KEY");
      expect(res.errorReason).toContain("menor ou igual à chave");

      // Estado não avançou, errors incrementou
      expect(res.state.errors).toBe(1);
      expect(res.state.j).toBe(0);
      expect(res.state.holeIndex).toBe(1);
      expect(res.state.shifts).toBe(0);
      expect(res.state.comparisons).toBe(0);
      expect(res.state.currentValues).toEqual([2, null]);
    });

    it("ERRO PEDAGÓGICO: tentar INSERT_KEY quando A[j] > key (inserção prematura) incrementa errors", () => {
      const state = createInsertionSortState([7, 3]); // i=1, key=3, j=0, A[0]=7 > 3

      const res = executeInsertionStep(state, "INSERT_KEY");
      expect(res.valid).toBe(false);
      expect(res.resultType).toBe("PEDAGOGICAL_ERROR");
      expect(res.isPedagogicalError).toBe(true);
      expect(res.expectedDecision).toBe("SHIFT_RIGHT");
      expect(res.errorReason).toContain("ainda é maior que a chave");

      expect(res.state.errors).toBe(1);
      expect(res.state.j).toBe(0);
      expect(res.state.holeIndex).toBe(1);
      expect(res.state.shifts).toBe(0);
      expect(res.state.comparisons).toBe(0);
    });

    it("AÇÃO INVÁLIDA DE FASE: SHIFT_RIGHT durante INSERT_READY NÃO incrementa errors", () => {
      let state = createInsertionSortState([6, 2]);
      // Executa shift correto -> atinge INSERT_READY (j = -1)
      const shiftRes = executeInsertionStep(state, "SHIFT_RIGHT");
      state = shiftRes.state;
      expect(state.phase).toBe("INSERT_READY");
      expect(state.j).toBe(-1);
      expect(state.errors).toBe(0);

      // Chamada indevida da UI de SHIFT_RIGHT quando j < 0
      const invalidRes = executeInsertionStep(state, "SHIFT_RIGHT");
      expect(invalidRes.valid).toBe(false);
      expect(invalidRes.resultType).toBe("INVALID_ACTION_FOR_PHASE");
      expect(invalidRes.isPedagogicalError).toBe(false);
      expect(invalidRes.expectedDecision).toBe("INSERT_KEY");
      expect(invalidRes.errorReason).toContain("Ação inválida para a fase INSERT_READY");

      // Errors NÃO pode ser incrementado
      expect(invalidRes.state.errors).toBe(0);
      expect(invalidRes.state.j).toBe(-1);
      expect(invalidRes.state.holeIndex).toBe(0);
    });

    it("AÇÃO INVÁLIDA DE FASE: qualquer ação após COMPLETED NÃO incrementa errors", () => {
      const state = createInsertionSortState([10]);
      expect(state.completed).toBe(true);

      const res1 = executeInsertionStep(state, "SHIFT_RIGHT");
      expect(res1.valid).toBe(false);
      expect(res1.resultType).toBe("INVALID_ACTION_FOR_PHASE");
      expect(res1.state.errors).toBe(0);

      const res2 = executeInsertionStep(state, "INSERT_KEY");
      expect(res2.valid).toBe(false);
      expect(res2.resultType).toBe("INVALID_ACTION_FOR_PHASE");
      expect(res2.state.errors).toBe(0);
    });
  });

  describe("7. Auditoria do Histórico Imutável e Semântica de Replay", () => {
    it("registros discriminados KEY_LIFT, SHIFT e INSERT contém metadados completos sem A[-1]", () => {
      let state = createInsertionSortState([5, 1, 3]);

      // 1. KEY_LIFT gerado na passada 1
      expect(state.history).toHaveLength(1);
      const lift1 = state.history[0] as InsertionKeyLiftStepRecord;
      expect(lift1.type).toBe("KEY_LIFT");
      expect(lift1.i).toBe(1);
      expect(lift1.key).toBe(1);
      expect(lift1.holeIndex).toBe(1);
      expect(lift1.orderedBoundary).toBe(0);

      // 2. SHIFT de 5 para a vaga 1
      state = executeInsertionStep(state, "SHIFT_RIGHT").state;
      expect(state.history).toHaveLength(2);
      const shift1 = state.history[1] as InsertionShiftStepRecord;
      expect(shift1.type).toBe("SHIFT");
      expect(shift1.j).toBe(0);
      expect(shift1.comparedValue).toBe(5);
      expect(shift1.keyValue).toBe(1);
      expect(shift1.comparisonResult).toBe(true);
      expect(shift1.holeIndexBefore).toBe(1);
      expect(shift1.holeIndexAfter).toBe(0);

      // 3. INSERT na cabeceira (HEAD_REACHED)
      state = executeInsertionStep(state, "INSERT_KEY").state;
      // Note que a conclusão da passada 1 já dispara auto-lift para i=2!
      expect(state.history).toHaveLength(4);

      const insertHead = state.history[2] as InsertionInsertHeadReachedStepRecord;
      expect(insertHead.type).toBe("INSERT");
      expect(insertHead.reason).toBe("HEAD_REACHED");
      expect(insertHead.j).toBe(-1);
      expect(insertHead.comparedValue).toBeNull();
      expect(insertHead.comparisonResult).toBeNull(); // NUNCA inventa A[-1]
      expect(insertHead.insertedIndex).toBe(0);
      expect(insertHead.insertedValue).toBe(1);

      // 4. KEY_LIFT da passada 2
      const lift2 = state.history[3] as InsertionKeyLiftStepRecord;
      expect(lift2.type).toBe("KEY_LIFT");
      expect(lift2.i).toBe(2);
      expect(lift2.key).toBe(3);

      // 5. SHIFT de 5 para a vaga 2 (5 > 3)
      state = executeInsertionStep(state, "SHIFT_RIGHT").state;
      expect(state.history).toHaveLength(5);

      // 6. INSERT por CONDITION_FALSE (1 <= 3)
      state = executeInsertionStep(state, "INSERT_KEY").state;
      expect(state.completed).toBe(true);
      expect(state.history).toHaveLength(6);

      const insertCond = state.history[5] as InsertionInsertConditionFalseStepRecord;
      expect(insertCond.type).toBe("INSERT");
      expect(insertCond.reason).toBe("CONDITION_FALSE");
      expect(insertCond.j).toBe(0);
      expect(insertCond.comparedValue).toBe(1);
      expect(insertCond.keyValue).toBe(3);
      expect(insertCond.comparisonResult).toBe(false);
      expect(insertCond.insertedIndex).toBe(1);
      expect(insertCond.insertedValue).toBe(3);
    });
  });

  describe("8. orderedBoundary e Região ORD Relativa", () => {
    it("orderedBoundary expande-se ordenadamente a cada inserção concluída", () => {
      let state = createInsertionSortState([8, 6, 4]);
      expect(state.orderedBoundary).toBe(0);
      expect(getInsertionOrderedIndices(state)).toEqual([0]);

      // Passada 1: 8 shift -> insert 6 na vaga 0
      state = executeInsertionStep(state, "SHIFT_RIGHT").state;
      state = executeInsertionStep(state, "INSERT_KEY").state;

      // Passada 1 concluída, auto-lift disparou para passada 2
      // Durante passada 2, orderedBoundary reflete o prefixo já ordenado [0..1]
      expect(state.orderedBoundary).toBe(1);
      expect(getInsertionOrderedIndices(state)).toEqual([0, 1]);

      // Passada 2: 8 shift -> 6 shift -> insert 4 na vaga 0
      state = executeInsertionStep(state, "SHIFT_RIGHT").state;
      state = executeInsertionStep(state, "SHIFT_RIGHT").state;
      state = executeInsertionStep(state, "INSERT_KEY").state;

      expect(state.completed).toBe(true);
      expect(state.orderedBoundary).toBe(2);
      expect(getInsertionOrderedIndices(state)).toEqual([0, 1, 2]);
      expect(state.currentValues).toEqual([4, 6, 8]);
    });
  });
});
