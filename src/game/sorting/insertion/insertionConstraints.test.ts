/**
 * Suíte de testes unitários para as constraints procedurais do Insertion Sort.
 */

import { describe, expect, it } from "vitest";
import {
  generateInsertionPracticeArray,
  getInsertionPracticeConstraints,
  hasAtLeastOneDirectInsert,
  hasAtLeastOneShift,
  hasInsertionWithMultipleShifts,
  INSERTION_BASIC_CONSTRAINTS,
  INSERTION_PRACTICE_LENGTHS,
  INSERTION_INTERMEDIATE_CONSTRAINTS,
  INSERTION_ADVANCED_CONSTRAINTS,
  type InsertionPracticeLevel,
} from "./insertionConstraints";
import { isNotReverseSorted, isNotSorted } from "../../generation";

describe("Insertion Sort - Procedural Constraints (P2.2-D)", () => {
  describe("1. Predicados Matemáticos Puros", () => {
    it("hasAtLeastOneShift detecta inversão corretamente", () => {
      expect(hasAtLeastOneShift([])).toBe(false);
      expect(hasAtLeastOneShift([10])).toBe(false);
      expect(hasAtLeastOneShift([1, 2, 3, 4])).toBe(false);
      expect(hasAtLeastOneShift([1, 3, 2, 4])).toBe(true);
      expect(hasAtLeastOneShift([4, 3, 2, 1])).toBe(true);
    });

    it("hasAtLeastOneDirectInsert identifica se há ao menos uma passada sem shifts", () => {
      expect(hasAtLeastOneDirectInsert([])).toBe(false);
      expect(hasAtLeastOneDirectInsert([5])).toBe(false);
      // Vetor totalmente invertido: todas as passadas fazem shift até a cabeceira
      expect(hasAtLeastOneDirectInsert([4, 3, 2, 1])).toBe(false);
      // Vetor ordenado: todas as passadas inserem direto
      expect(hasAtLeastOneDirectInsert([1, 2, 3, 4])).toBe(true);
      // Vetor com ao menos uma inserção direta (ex: 2 > 1, mas 3 >= 2)
      expect(hasAtLeastOneDirectInsert([2, 1, 3])).toBe(true);
    });

    it("hasInsertionWithMultipleShifts identifica passada com 2 ou mais deslocamentos", () => {
      expect(hasInsertionWithMultipleShifts([1, 2])).toBe(false);
      // [1, 3, 2]: passada 1 (3 > 1) = 0 shifts; passada 2 (2 < 3, 2 > 1) = 1 shift
      expect(hasInsertionWithMultipleShifts([1, 3, 2])).toBe(false);
      // [4, 5, 1]: passada 2 com chave 1 desloca 5 e 4 (2 shifts)
      expect(hasInsertionWithMultipleShifts([4, 5, 1])).toBe(true);
      // [4, 3, 2, 1]: passada 2 (key 2) desloca 4 e 3 (2 shifts); passada 3 desloca 3 vezes
      expect(hasInsertionWithMultipleShifts([4, 3, 2, 1])).toBe(true);
    });
  });

  describe("2. Configuração de Constraints por Nível de Prática", () => {
    it("retorna as constraints canônicas distintas para os 3 níveis de prática", () => {
      const basic = getInsertionPracticeConstraints("basic");
      const intermediate = getInsertionPracticeConstraints("intermediate");
      const advanced = getInsertionPracticeConstraints("advanced");

      expect(basic).toBe(INSERTION_BASIC_CONSTRAINTS);
      expect(intermediate).toBe(INSERTION_INTERMEDIATE_CONSTRAINTS);
      expect(advanced).toBe(INSERTION_ADVANCED_CONSTRAINTS);

      // Nível básico inclui proibição de invertido
      expect(basic.some((c) => c.id === "insertion-not-reverse-sorted")).toBe(true);

      // Níveis intermediário e avançado exigem múltiplos shifts
      expect(
        intermediate.some((c) => c.id === "insertion-multiple-shifts"),
      ).toBe(true);
      expect(
        advanced.some((c) => c.id === "insertion-multiple-shifts"),
      ).toBe(true);

      // Nível avançado não proíbe artificialmente vetor reverso
      expect(advanced.some((c) => c.id === "insertion-not-reverse-sorted")).toBe(false);
    });
  });

  describe("3. Geração Procedural Determinística e Validação dos Lotes", () => {
    it("gera vetores com tamanhos curriculares corretos [4, 5, 6]", () => {
      const res1 = generateInsertionPracticeArray("basic", "test-seed-1");
      const res2 = generateInsertionPracticeArray("intermediate", "test-seed-2");
      const res3 = generateInsertionPracticeArray("advanced", "test-seed-3");

      expect(res1.values).toHaveLength(INSERTION_PRACTICE_LENGTHS.basic); // 4
      expect(res2.values).toHaveLength(INSERTION_PRACTICE_LENGTHS.intermediate); // 5
      expect(res3.values).toHaveLength(INSERTION_PRACTICE_LENGTHS.advanced); // 6
    });

    it("respeita determinismo estrito por seed", () => {
      const runA = generateInsertionPracticeArray("intermediate", "identical-seed");
      const runB = generateInsertionPracticeArray("intermediate", "identical-seed");
      const runC = generateInsertionPracticeArray("intermediate", "different-seed");

      expect(runA.values).toEqual(runB.values);
      expect(runA.seed).toBe(runB.seed);
      expect(runA.values).not.toEqual(runC.values);
    });

    it("respeita intervalo [1..99] e não produz duplicatas", () => {
      const levels: InsertionPracticeLevel[] = ["basic", "intermediate", "advanced"];
      for (const level of levels) {
        const res = generateInsertionPracticeArray(level, `range-seed-${level}`);
        expect(res.values.every((val) => val >= 1 && val <= 99)).toBe(true);
        const uniqueSet = new Set(res.values);
        expect(uniqueSet.size).toBe(res.values.length);
      }
    });

    it("lote gerado na prática básica satisfaz todas as restrições básicas", () => {
      const res = generateInsertionPracticeArray("basic", "phase-1-check");
      expect(res.isFallback).toBe(false);
      expect(isNotSorted(res.values)).toBe(true);
      expect(isNotReverseSorted(res.values)).toBe(true);
      expect(hasAtLeastOneShift(res.values)).toBe(true);
      expect(hasAtLeastOneDirectInsert(res.values)).toBe(true);
    });

    it("lote gerado na prática intermediária satisfaz todas as restrições intermediárias", () => {
      const res = generateInsertionPracticeArray("intermediate", "phase-2-check");
      expect(res.isFallback).toBe(false);
      expect(isNotSorted(res.values)).toBe(true);
      expect(hasAtLeastOneShift(res.values)).toBe(true);
      expect(hasAtLeastOneDirectInsert(res.values)).toBe(true);
      expect(hasInsertionWithMultipleShifts(res.values)).toBe(true);
    });

    it("lote gerado na prática avançada satisfaz todas as restrições avançadas", () => {
      const res = generateInsertionPracticeArray("advanced", "phase-3-check");
      expect(res.isFallback).toBe(false);
      expect(isNotSorted(res.values)).toBe(true);
      expect(hasAtLeastOneShift(res.values)).toBe(true);
      expect(hasInsertionWithMultipleShifts(res.values)).toBe(true);
    });
  });
});
