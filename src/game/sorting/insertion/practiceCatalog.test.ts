import { describe, expect, it } from "vitest";
import {
  INSERTION_PRACTICE_CATALOG,
  getInsertionPracticeDefinition,
  getNextInsertionPracticeLevel,
} from "./practiceCatalog";

describe("Insertion Sort - Practice Catalog (P2.2-D)", () => {
  it("contém exatamente as 3 práticas canônicas do módulo", () => {
    expect(INSERTION_PRACTICE_CATALOG).toHaveLength(3);
    expect(INSERTION_PRACTICE_CATALOG.map((p) => p.level)).toEqual([
      "basic",
      "intermediate",
      "advanced",
    ]);
  });

  it("utiliza os IDs canônicos que antecipam o Schema v4", () => {
    expect(INSERTION_PRACTICE_CATALOG.map((p) => p.id)).toEqual([
      "insertion.practice.basic",
      "insertion.practice.intermediate",
      "insertion.practice.advanced",
    ]);
  });

  it("associa os tamanhos de lote corretos (4, 5, 6)", () => {
    expect(getInsertionPracticeDefinition("basic").size).toBe(4);
    expect(getInsertionPracticeDefinition("intermediate").size).toBe(5);
    expect(getInsertionPracticeDefinition("advanced").size).toBe(6);
  });

  it("contém títulos e objetivos pedagógicos não vazios", () => {
    for (const practice of INSERTION_PRACTICE_CATALOG) {
      expect(practice.title).toMatch(/^PRÁTICA/);
      expect(practice.description.length).toBeGreaterThan(10);
      expect(practice.pedagogicalObjective.length).toBeGreaterThan(10);
      expect(practice.constraints.length).toBeGreaterThan(0);
    }
  });

  it("computa a progressão curricular de níveis corretamente", () => {
    expect(getNextInsertionPracticeLevel("basic")).toBe("intermediate");
    expect(getNextInsertionPracticeLevel("intermediate")).toBe("advanced");
    expect(getNextInsertionPracticeLevel("advanced")).toBeNull();
  });
});
