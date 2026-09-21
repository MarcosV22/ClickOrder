import { describe, expect, it } from "vitest";
import {
  MODULE_PRACTICE_CATALOG,
  getModulePractices,
  getPracticeDefinition,
  getNextPracticeLevel,
  getModulePracticeStates,
  isModuleAllPracticesCompleted,
} from "./practiceCatalog";
import {
  createDefaultSaveData,
  recordExerciseCompletion,
  BUBBLE_EXERCISE_SETS,
  SELECTION_EXERCISE_SETS,
  INSERTION_EXERCISE_SETS,
} from "../persistence";

describe("Curriculum Transversal Practice Catalog (PLATFORM-R1-B)", () => {
  describe("1. Integridade Estrutural dos Catálogos por Módulo", () => {
    it("possui exatamente 3 módulos canônicos: bubble, selection e insertion", () => {
      const moduleKeys = Object.keys(MODULE_PRACTICE_CATALOG);
      expect(moduleKeys).toEqual(["bubble", "selection", "insertion"]);
    });

    it("cada módulo contém exatamente 3 práticas (basic, intermediate, advanced)", () => {
      for (const moduleId of ["bubble", "selection", "insertion"] as const) {
        const practices = getModulePractices(moduleId);
        expect(practices).toHaveLength(3);
        expect(practices.map((p) => p.level)).toEqual([
          "basic",
          "intermediate",
          "advanced",
        ]);
        expect(practices.map((p) => p.size)).toEqual([4, 5, 6]);
      }
    });

    it("utiliza os identificadores canônicos do Schema v4", () => {
      const bubble = getModulePractices("bubble");
      expect(bubble[0].id).toBe(BUBBLE_EXERCISE_SETS.BASIC);
      expect(bubble[1].id).toBe(BUBBLE_EXERCISE_SETS.INTERMEDIATE);
      expect(bubble[2].id).toBe(BUBBLE_EXERCISE_SETS.ADVANCED);

      const selection = getModulePractices("selection");
      expect(selection[0].id).toBe(SELECTION_EXERCISE_SETS.BASIC);
      expect(selection[1].id).toBe(SELECTION_EXERCISE_SETS.INTERMEDIATE);
      expect(selection[2].id).toBe(SELECTION_EXERCISE_SETS.ADVANCED);

      const insertion = getModulePractices("insertion");
      expect(insertion[0].id).toBe(INSERTION_EXERCISE_SETS.BASIC);
      expect(insertion[1].id).toBe(INSERTION_EXERCISE_SETS.INTERMEDIATE);
      expect(insertion[2].id).toBe(INSERTION_EXERCISE_SETS.ADVANCED);
    });

    it("fornece títulos e objetivos pedagógicos não vazios para todas as práticas", () => {
      for (const moduleId of ["bubble", "selection", "insertion"] as const) {
        const practices = getModulePractices(moduleId);
        for (const p of practices) {
          expect(p.title).toMatch(/^PRÁTICA/);
          expect(p.description.length).toBeGreaterThan(15);
          expect(p.pedagogicalObjective.length).toBeGreaterThan(15);
        }
      }
    });
  });

  describe("2. Navegação Curricular e Resolução de Níveis", () => {
    it("computa progressão linear de níveis corretamente", () => {
      expect(getNextPracticeLevel("basic")).toBe("intermediate");
      expect(getNextPracticeLevel("intermediate")).toBe("advanced");
      expect(getNextPracticeLevel("advanced")).toBeNull();
    });

    it("recupera definição de prática por módulo e nível", () => {
      const bubbleInter = getPracticeDefinition("bubble", "intermediate");
      expect(bubbleInter.size).toBe(5);
      expect(bubbleInter.title).toBe("PRÁTICA INTERMEDIÁRIA");
      expect(bubbleInter.moduleId).toBe("bubble");

      const selectionAdv = getPracticeDefinition("selection", "advanced");
      expect(selectionAdv.size).toBe(6);
      expect(selectionAdv.title).toBe("PRÁTICA AVANÇADA");
      expect(selectionAdv.moduleId).toBe("selection");
    });
  });

  describe("3. Derivação de Estados de Prática (DISPONÍVEL, BLOQUEADA, CONCLUÍDA)", () => {
    it("para novo usuário: Básica está DISPONÍVEL, Intermediária e Avançada estão BLOQUEADAS", () => {
      const save = createDefaultSaveData();

      for (const moduleId of ["bubble", "selection", "insertion"] as const) {
        const states = getModulePracticeStates(save, moduleId);
        expect(states).toHaveLength(3);

        // Básica
        expect(states[0].status).toBe("available");
        expect(states[0].completed).toBe(false);

        // Intermediária
        expect(states[1].status).toBe("locked");
        expect(states[1].completed).toBe(false);

        // Avançada
        expect(states[2].status).toBe("locked");
        expect(states[2].completed).toBe(false);

        expect(isModuleAllPracticesCompleted(save, moduleId)).toBe(false);
      }
    });

    it("após concluir a Básica: Básica CONCLUÍDA, Intermediária DISPONÍVEL, Avançada BLOQUEADA", () => {
      let save = createDefaultSaveData();
      save = recordExerciseCompletion(
        save,
        "bubble",
        BUBBLE_EXERCISE_SETS.BASIC,
        { score: 90, errors: 1, hintsUsed: 0, elapsedTimeMs: 12000 }
      );

      const states = getModulePracticeStates(save, "bubble");
      expect(states[0].status).toBe("completed");
      expect(states[0].completed).toBe(true);
      expect(states[0].bestScore).toBe(90);
      expect(states[0].bestErrors).toBe(1);

      expect(states[1].status).toBe("available");
      expect(states[1].completed).toBe(false);

      expect(states[2].status).toBe("locked");
      expect(states[2].completed).toBe(false);

      expect(isModuleAllPracticesCompleted(save, "bubble")).toBe(false);
    });

    it("após concluir Básica e Intermediária: Avançada fica DISPONÍVEL", () => {
      let save = createDefaultSaveData();
      save = recordExerciseCompletion(
        save,
        "selection",
        SELECTION_EXERCISE_SETS.BASIC,
        { score: 100, errors: 0, hintsUsed: 0 }
      );
      save = recordExerciseCompletion(
        save,
        "selection",
        SELECTION_EXERCISE_SETS.INTERMEDIATE,
        { score: 95, errors: 1, hintsUsed: 0 }
      );

      const states = getModulePracticeStates(save, "selection");
      expect(states[0].status).toBe("completed");
      expect(states[1].status).toBe("completed");
      expect(states[2].status).toBe("available");
      expect(states[2].completed).toBe(false);

      expect(isModuleAllPracticesCompleted(save, "selection")).toBe(false);
    });

    it("quando todas as 3 práticas estão concluídas: todas CONCLUÍDA e isModuleAllPracticesCompleted é true", () => {
      let save = createDefaultSaveData();
      save = recordExerciseCompletion(
        save,
        "bubble",
        BUBBLE_EXERCISE_SETS.BASIC,
        { score: 100, errors: 0, hintsUsed: 0 }
      );
      save = recordExerciseCompletion(
        save,
        "bubble",
        BUBBLE_EXERCISE_SETS.INTERMEDIATE,
        { score: 100, errors: 0, hintsUsed: 0 }
      );
      save = recordExerciseCompletion(
        save,
        "bubble",
        BUBBLE_EXERCISE_SETS.ADVANCED,
        { score: 95, errors: 1, hintsUsed: 0 }
      );

      const states = getModulePracticeStates(save, "bubble");
      expect(states.every((s) => s.status === "completed")).toBe(true);
      expect(states.every((s) => s.completed)).toBe(true);
      expect(isModuleAllPracticesCompleted(save, "bubble")).toBe(true);
    });

    it("lida defensivamente com saveData nulo ou indefinido", () => {
      const states = getModulePracticeStates(undefined, "bubble");
      expect(states[0].status).toBe("available");
      expect(states[1].status).toBe("locked");
      expect(states[2].status).toBe("locked");
      expect(isModuleAllPracticesCompleted(undefined, "bubble")).toBe(false);
    });
  });
});
