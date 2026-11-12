import { describe, expect, it } from "vitest";
import {
  BUBBLE_CASE_NEARLY_SORTED,
  SELECTION_CASE_ALREADY_SORTED,
  INSERTION_CASE_NEARLY_SORTED,
  getModuleCases,
  getCaseDefinition,
  isModuleCasesUnlocked,
  getModuleCaseStates,
} from "./caseCatalog";
import {
  createDefaultSaveData,
  recordExerciseCompletion,
  BUBBLE_EXERCISE_SETS,
  SELECTION_EXERCISE_SETS,
  INSERTION_EXERCISE_SETS,
} from "../persistence";
import {
  createBubbleSortState,
  executeBubbleSortStep,
  isBubbleSortComplete,
} from "../sorting/bubbleSortEngine";
import {
  createSelectionSortState,
  executeSelectionInspection,
  commitSelectionPass,
} from "../sorting/selection/selectionSortEngine";
import {
  createInsertionSortState,
  getExpectedInsertionStep,
  executeInsertionStep,
  isInsertionSortComplete,
} from "../sorting/insertion/insertionSortEngine";

describe("Curriculum Transversal Case Catalog (LEARNING-R3-A)", () => {
  describe("1. Integridade dos Casos-Piloto Obrigatórios", () => {
    it("Bubble Sort Pilot: bubble.case.nearly-sorted possui vetor [10, 30, 20, 40, 50]", () => {
      expect(BUBBLE_CASE_NEARLY_SORTED.id).toBe("bubble.case.nearly-sorted");
      expect(BUBBLE_CASE_NEARLY_SORTED.moduleId).toBe("bubble");
      expect(BUBBLE_CASE_NEARLY_SORTED.initialArray).toEqual([10, 30, 20, 40, 50]);
      expect(BUBBLE_CASE_NEARLY_SORTED.expectedFacts.comparisons).toBe(10);
      expect(BUBBLE_CASE_NEARLY_SORTED.expectedFacts.swaps).toBe(1);

      const reflection = BUBBLE_CASE_NEARLY_SORTED.buildReflection({
        comparisons: 10,
        swaps: 1,
      });
      expect(reflection).toContain("1 troca");
      expect(reflection).toContain("10 comparações");
    });

    it("Selection Sort Pilot: selection.case.already-sorted possui vetor [10, 20, 30, 40, 50]", () => {
      expect(SELECTION_CASE_ALREADY_SORTED.id).toBe("selection.case.already-sorted");
      expect(SELECTION_CASE_ALREADY_SORTED.moduleId).toBe("selection");
      expect(SELECTION_CASE_ALREADY_SORTED.initialArray).toEqual([10, 20, 30, 40, 50]);
      expect(SELECTION_CASE_ALREADY_SORTED.expectedFacts.comparisons).toBe(10);
      expect(SELECTION_CASE_ALREADY_SORTED.expectedFacts.swaps).toBe(0);

      const reflection = SELECTION_CASE_ALREADY_SORTED.buildReflection({
        comparisons: 10,
        swaps: 0,
      });
      expect(reflection).toContain("10 comparações");
      expect(reflection).toContain("0 trocas");
    });

    it("Insertion Sort Pilot: insertion.case.nearly-sorted possui vetor [10, 20, 40, 30, 50]", () => {
      expect(INSERTION_CASE_NEARLY_SORTED.id).toBe("insertion.case.nearly-sorted");
      expect(INSERTION_CASE_NEARLY_SORTED.moduleId).toBe("insertion");
      expect(INSERTION_CASE_NEARLY_SORTED.initialArray).toEqual([10, 20, 40, 30, 50]);
      expect(INSERTION_CASE_NEARLY_SORTED.expectedFacts.comparisons).toBe(5);
      expect(INSERTION_CASE_NEARLY_SORTED.expectedFacts.shifts).toBe(1);
      expect(INSERTION_CASE_NEARLY_SORTED.expectedFacts.insertions).toBe(4);
      expect(INSERTION_CASE_NEARLY_SORTED.expectedFacts.swaps).toBe(0);

      const reflection = INSERTION_CASE_NEARLY_SORTED.buildReflection({
        comparisons: 5,
        swaps: 0,
        shifts: 1,
        insertions: 4,
      });
      expect(reflection).toContain("1 deslocamento");
      expect(reflection).toContain("5 comparações");
    });

    it("getModuleCases retorna exatamente 1 caso piloto por módulo concebido", () => {
      expect(getModuleCases("bubble")).toHaveLength(1);
      expect(getModuleCases("selection")).toHaveLength(1);
      expect(getModuleCases("insertion")).toHaveLength(1);
      expect(getModuleCases("merge")).toHaveLength(0);
      expect(getModuleCases("quick")).toHaveLength(0);
    });

    it("getCaseDefinition recupera casos pelo ID canônico", () => {
      expect(getCaseDefinition("bubble.case.nearly-sorted")).toBe(BUBBLE_CASE_NEARLY_SORTED);
      expect(getCaseDefinition("selection.case.already-sorted")).toBe(SELECTION_CASE_ALREADY_SORTED);
      expect(getCaseDefinition("insertion.case.nearly-sorted")).toBe(INSERTION_CASE_NEARLY_SORTED);
      expect(getCaseDefinition("invalid.id")).toBeUndefined();
    });
  });

  describe("2. Regra Determinística de Desbloqueio e Persistência", () => {
    it("casos iniciam bloqueados quando a Prática Básica não foi concluída", () => {
      const save = createDefaultSaveData();
      expect(isModuleCasesUnlocked(save, "bubble")).toBe(false);
      expect(isModuleCasesUnlocked(save, "selection")).toBe(false);
      expect(isModuleCasesUnlocked(save, "insertion")).toBe(false);

      const bubbleStates = getModuleCaseStates(save, "bubble");
      expect(bubbleStates[0].status).toBe("locked");
      expect(bubbleStates[0].completed).toBe(false);
    });

    it("casos tornam-se disponíveis assim que a Prática Básica correspondente é concluída", () => {
      let save = createDefaultSaveData();
      save = recordExerciseCompletion(save, "bubble", BUBBLE_EXERCISE_SETS.BASIC, {
        score: 95,
        errors: 0,
        hintsUsed: 1,
        elapsedTimeMs: 12000,
      });

      expect(isModuleCasesUnlocked(save, "bubble")).toBe(true);
      expect(isModuleCasesUnlocked(save, "selection")).toBe(false);

      const bubbleStates = getModuleCaseStates(save, "bubble");
      expect(bubbleStates[0].status).toBe("available");
      expect(bubbleStates[0].completed).toBe(false);
    });

    it("casos tornam-se concluídos e preservam telemetria quando registrados no Schema v4", () => {
      let save = createDefaultSaveData();
      save = recordExerciseCompletion(save, "bubble", BUBBLE_EXERCISE_SETS.BASIC, {
        score: 100,
        errors: 0,
        hintsUsed: 0,
      });
      save = recordExerciseCompletion(save, "bubble", "bubble.case.nearly-sorted", {
        score: 90,
        errors: 1,
        hintsUsed: 0,
        elapsedTimeMs: 18500,
      });

      const bubbleStates = getModuleCaseStates(save, "bubble");
      expect(bubbleStates[0].status).toBe("completed");
      expect(bubbleStates[0].completed).toBe(true);
      expect(bubbleStates[0].bestScore).toBe(90);
      expect(bubbleStates[0].bestErrors).toBe(1);
      expect(bubbleStates[0].bestTimeMs).toBe(18500);
    });
  });

  describe("3. Fatos Métricos Validados com Engines Canônicas Reais", () => {
    it("Bubble Sort Canônico sobre [10, 30, 20, 40, 50] produz exatamente 10 comparações e 1 troca", () => {
      let state = createBubbleSortState(BUBBLE_CASE_NEARLY_SORTED.initialArray, {
        variant: "CANONICAL",
      });

      while (!isBubbleSortComplete(state)) {
        state = executeBubbleSortStep(state);
      }

      expect(state.comparisons).toBe(10);
      expect(state.swaps).toBe(1);
      expect(state.currentValues).toEqual([10, 20, 30, 40, 50]);
    });

    it("Selection Sort sobre [10, 20, 30, 40, 50] produz exatamente 10 comparações e 0 trocas", () => {
      let state = createSelectionSortState(SELECTION_CASE_ALREADY_SORTED.initialArray);
      let comparisons = 0;
      let swaps = 0;

      while (!state.completed) {
        if (state.phase === "INSPECT") {
          comparisons++;
          const result = executeSelectionInspection(state, "KEEP_MIN");
          expect(result.valid).toBe(true);
          state = result.state;
        } else if (state.phase === "COMMIT") {
          const result = commitSelectionPass(state);
          expect(result.valid).toBe(true);
          if (result.didSwap) {
            swaps++;
          }
          state = result.state;
        }
      }

      expect(comparisons).toBe(10);
      expect(swaps).toBe(0);
      expect(state.currentValues).toEqual([10, 20, 30, 40, 50]);
    });

    it("Insertion Sort sobre [10, 20, 40, 30, 50] produz exatamente 5 comparações, 1 deslocamento e 4 inserções", () => {
      let state = createInsertionSortState(INSERTION_CASE_NEARLY_SORTED.initialArray);
      let comparisons = 0;
      let shifts = 0;
      let insertions = 0;

      while (!isInsertionSortComplete(state)) {
        const expected = getExpectedInsertionStep(state);
        expect(expected).not.toBeNull();
        if (expected) {
          if (expected.phase === "COMPARE_AND_SHIFT") {
            comparisons++;
            if (expected.expectedDecision === "SHIFT_RIGHT") {
              shifts++;
            }
          }
          if (expected.expectedDecision === "INSERT_KEY") {
            insertions++;
          }
          const result = executeInsertionStep(state, expected.expectedDecision);
          expect(result.valid).toBe(true);
          state = result.state;
        }
      }

      expect(comparisons).toBe(5);
      expect(shifts).toBe(1);
      expect(insertions).toBe(4);
      expect(state.currentValues).toEqual([10, 20, 30, 40, 50]);
    });
  });
});
