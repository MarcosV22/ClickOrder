import { describe, it, expect } from "vitest";
import {
  hasMergeConfrontationOfEqualValues,
  assignMergeIdentities,
  generateMergePracticeArray,
  getMergePracticeConstraints,
  MERGE_PRACTICE_LENGTHS,
} from "./mergeConstraints";
import {
  getMergePracticeDefinition,
  getNextMergePracticeLevel,
  MERGE_PRACTICE_CATALOG,
} from "./practiceCatalog";

describe("Merge Sort — Constraints Procedurais e Catálogo (P3.1-C)", () => {
  describe("Predicado Matemático Puro: hasMergeConfrontationOfEqualValues", () => {
    it("detecta corretamente empate na intercalação raiz para [4, 1, 3, 4]", () => {
      // Subvetor esquerdo [4, 1] -> [1, 4]; Subvetor direito [3, 4] -> [3, 4].
      // Na raiz: 1 vs 3 -> 1; 4 vs 3 -> 3; 4 vs 4 -> EMPATE detectado!
      expect(hasMergeConfrontationOfEqualValues([4, 1, 3, 4])).toBe(true);
    });

    it("detecta empate em subvetores locais [4, 4, 1, 2]", () => {
      expect(hasMergeConfrontationOfEqualValues([4, 4, 1, 2])).toBe(true);
    });

    it("retorna false para vetores sem valores duplicados", () => {
      expect(hasMergeConfrontationOfEqualValues([5, 2, 4, 1])).toBe(false);
      expect(hasMergeConfrontationOfEqualValues([1, 2, 3, 4, 5, 6])).toBe(false);
    });

    it("retorna false para vetores com menos de 2 elementos", () => {
      expect(hasMergeConfrontationOfEqualValues([42])).toBe(false);
      expect(hasMergeConfrontationOfEqualValues([])).toBe(false);
    });
  });

  describe("Atribuição Estável de Identidades e Rótulos (assignMergeIdentities)", () => {
    it("atribui sufixos alfabéticos estáveis ('a', 'b') para duplicatas em [4, 1, 3, 4]", () => {
      const elements = assignMergeIdentities([4, 1, 3, 4]);

      expect(elements).toHaveLength(4);
      expect(elements[0]).toEqual({
        id: "elem-0-v4",
        value: 4,
        originalIndex: 0,
        label: "a",
      });
      expect(elements[1]).toEqual({
        id: "elem-1-v1",
        value: 1,
        originalIndex: 1,
        label: undefined,
      });
      expect(elements[2]).toEqual({
        id: "elem-2-v3",
        value: 3,
        originalIndex: 2,
        label: undefined,
      });
      expect(elements[3]).toEqual({
        id: "elem-3-v4",
        value: 4,
        originalIndex: 3,
        label: "b",
      });
    });

    it("preserva ordenação matemática puramente por value", () => {
      const elements = assignMergeIdentities([4, 1, 3, 4]);
      // Comparação direta por valor
      expect(elements[0].value <= elements[3].value).toBe(true);
      expect(elements[0].value === elements[3].value).toBe(true);
      expect(elements[1].value < elements[0].value).toBe(true);
    });
  });

  describe("Geração Procedural Determinística por Nível", () => {
    it("Prática Básica (n = 4): tamanho 4, sem duplicatas e não ordenada", () => {
      const gen = generateMergePracticeArray("basic", "seed-basic-1");

      expect(gen.elements).toHaveLength(4);
      expect(MERGE_PRACTICE_LENGTHS.basic).toBe(4);

      const values = gen.elements.map((e) => e.value);
      // Sem duplicatas
      expect(new Set(values).size).toBe(4);
      // Não previamente ordenado
      let isSorted = true;
      for (let i = 0; i < values.length - 1; i++) {
        if (values[i] > values[i + 1]) isSorted = false;
      }
      expect(isSorted).toBe(false);
    });

    it("Prática Intermediária (n = 5): tamanho 5, sem duplicatas (divisão assimétrica 3+2)", () => {
      const gen = generateMergePracticeArray("intermediate", "seed-inter-1");

      expect(gen.elements).toHaveLength(5);
      expect(MERGE_PRACTICE_LENGTHS.intermediate).toBe(5);

      const values = gen.elements.map((e) => e.value);
      expect(new Set(values).size).toBe(5);

      // Divisão 3+2: subvetor esquerdo [0..2] e direito [3..4]
      const leftPart = values.slice(0, 3);
      const rightPart = values.slice(3);
      expect(leftPart).toHaveLength(3);
      expect(rightPart).toHaveLength(2);
    });

    it("Prática Avançada (n = 6): tamanho 6, com duplicatas e confronto real mandatório", () => {
      const gen = generateMergePracticeArray("advanced", "seed-adv-42");

      expect(gen.elements).toHaveLength(6);
      expect(MERGE_PRACTICE_LENGTHS.advanced).toBe(6);

      const values = gen.elements.map((e) => e.value);
      // Possui duplicatas
      expect(new Set(values).size).toBeLessThan(6);
      // Possui confronto real garantido na confluência
      expect(hasMergeConfrontationOfEqualValues(values)).toBe(true);

      // Ao menos dois elementos devem possuir rótulos alfabéticos estáveis
      const labeled = gen.elements.filter((e) => e.label !== undefined);
      expect(labeled.length).toBeGreaterThanOrEqual(2);
    });

    it("Garante determinismo estrito: mesma seed + mesma prática = mesmo vetor", () => {
      const seed = "determ-seed-99";
      const gen1 = generateMergePracticeArray("advanced", seed);
      const gen2 = generateMergePracticeArray("advanced", seed);

      expect(gen1.result.values).toEqual(gen2.result.values);
      expect(gen1.elements).toEqual(gen2.elements);
    });

    it("Robustez multi-seed na prática avançada: 30 seeds aleatórias satisfazem constraints sem falhas", () => {
      for (let s = 1; s <= 30; s++) {
        const gen = generateMergePracticeArray("advanced", `stress-seed-${s}`);
        const values = gen.elements.map((e) => e.value);

        expect(values).toHaveLength(6);
        expect(new Set(values).size).toBeLessThan(6);
        expect(hasMergeConfrontationOfEqualValues(values)).toBe(true);
      }
    });
  });

  describe("Catálogo Curricular Data-Driven (practiceCatalog)", () => {
    it("contém exatamente 3 práticas canônicas no catálogo", () => {
      expect(MERGE_PRACTICE_CATALOG).toHaveLength(3);
      expect(MERGE_PRACTICE_CATALOG.map((p) => p.level)).toEqual([
        "basic",
        "intermediate",
        "advanced",
      ]);
    });

    it("recupera a definição correta por nível", () => {
      const basicDef = getMergePracticeDefinition("basic");
      expect(basicDef.id).toBe("merge.practice.basic");
      expect(basicDef.size).toBe(4);

      const interDef = getMergePracticeDefinition("intermediate");
      expect(interDef.id).toBe("merge.practice.intermediate");
      expect(interDef.size).toBe(5);

      const advDef = getMergePracticeDefinition("advanced");
      expect(advDef.id).toBe("merge.practice.advanced");
      expect(advDef.size).toBe(6);
    });

    it("navega sequencialmente pelos níveis curriculares", () => {
      expect(getNextMergePracticeLevel("basic")).toBe("intermediate");
      expect(getNextMergePracticeLevel("intermediate")).toBe("advanced");
      expect(getNextMergePracticeLevel("advanced")).toBeNull();
    });
  });
});
