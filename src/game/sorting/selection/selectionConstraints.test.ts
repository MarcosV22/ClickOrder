import { describe, it, expect } from "vitest";
import {
  isGlobalMinNotInFirstPosition,
  hasAtLeastOneKeepMin,
  hasMultipleMinUpdatesInAtLeastOnePass,
  hasInterleavedKeepAndNewMin,
  hasNonAdjacentCommitTransfer,
  hasRichSelectionDecisions,
  SELECTION_CAMPAIGN_PHASE_LENGTHS,
  SELECTION_BASE_CONSTRAINTS,
  SELECTION_BASIC_CONSTRAINTS,
  SELECTION_INTERMEDIATE_CONSTRAINTS,
  SELECTION_ADVANCED_CONSTRAINTS,
  getSelectionPhaseConstraints,
  getSelectionPracticeConstraints,
  generateSelectionPhaseArray,
  generateSelectionPracticeArray,
} from "./selectionConstraints";
import { isNotSorted, isNotReverseSorted } from "../../generation";

describe("Selection Sort Constraints & Procedural Generation", () => {
  describe("Predicado isGlobalMinNotInFirstPosition", () => {
    it("deve retornar false quando o menor valor está no índice 0", () => {
      expect(isGlobalMinNotInFirstPosition([1, 4, 3, 2])).toBe(false);
      expect(isGlobalMinNotInFirstPosition([10, 20, 30])).toBe(false);
    });

    it("deve retornar true quando o menor valor está fora do índice 0", () => {
      expect(isGlobalMinNotInFirstPosition([4, 1, 3])).toBe(true);
      expect(isGlobalMinNotInFirstPosition([50, 20, 10, 80])).toBe(true);
      expect(isGlobalMinNotInFirstPosition([9, 8, 7, 2])).toBe(true);
    });

    it("deve tratar vetores unitários ou vazios com false", () => {
      expect(isGlobalMinNotInFirstPosition([])).toBe(false);
      expect(isGlobalMinNotInFirstPosition([42])).toBe(false);
    });
  });

  describe("Predicado hasAtLeastOneKeepMin", () => {
    it("deve retornar true quando há ao menos uma decisão KEEP_MIN", () => {
      // No vetor [4, 1, 3]:
      // Passada 0: minIndex=0 (val 4). j=1 (val 1): 1 < 4 (NOVO MÍNIMO -> minIndex=1).
      //            j=2 (val 3): 3 < 1 é falso -> KEEP_MIN!
      expect(hasAtLeastOneKeepMin([4, 1, 3])).toBe(true);
    });

    it("deve retornar false quando todas as comparações geram novo mínimo (estritamente decrescente)", () => {
      // [3, 2, 1]:
      // Passada 0: minIndex=0 (3). j=1: 2 < 3 (min=1). j=2: 1 < 2 (min=2). Swap -> [1, 2, 3]
      // Passada 1: i=1 (2). j=2: 3 < 2 é falso -> KEEP_MIN!
      // Para não ter nenhum KEEP_MIN em absoluto, precisaria que em todas as passadas j < minIndex ocorresse.
      // Em [2, 1], passada 0: j=1: 1 < 2 -> novo mínimo. Termina. Sem KEEP_MIN!
      expect(hasAtLeastOneKeepMin([2, 1])).toBe(false);
    });

    it("deve tratar vetores curtos", () => {
      expect(hasAtLeastOneKeepMin([])).toBe(false);
      expect(hasAtLeastOneKeepMin([10])).toBe(false);
    });
  });

  describe("Predicado hasMultipleMinUpdatesInAtLeastOnePass", () => {
    it("deve detectar passada com múltiplas atualizações", () => {
      // [10, 8, 5, 20]:
      // Passada 0: i=0 (10).
      // j=1 (8): 8 < 10 -> update 1 (min=1)
      // j=2 (5): 5 < 8 -> update 2 (min=2)
      // updatesInPass = 2 -> true!
      expect(hasMultipleMinUpdatesInAtLeastOnePass([10, 8, 5, 20])).toBe(true);
    });

    it("deve retornar false quando nenhuma passada tem 2 ou mais atualizações", () => {
      // [4, 1, 3]: tamanho < 4
      expect(hasMultipleMinUpdatesInAtLeastOnePass([4, 1, 3])).toBe(false);
      // [5, 10, 20, 30]:
      // i=0 (5): todos maiores -> 0 updates
      expect(hasMultipleMinUpdatesInAtLeastOnePass([5, 10, 20, 30])).toBe(false);
    });
  });

  describe("Configuração de Fases e Constraints", () => {
    it("deve ter comprimentos canônicos de 4, 5 e 6 para as fases 1, 2 e 3", () => {
      expect(SELECTION_CAMPAIGN_PHASE_LENGTHS).toEqual([4, 5, 6]);
    });

    it("deve retornar constraints base para Fase 1", () => {
      const c1 = getSelectionPhaseConstraints(1);
      expect(c1.length).toBe(4);
      expect(c1.map((c) => c.id)).toContain("selection-not-sorted");
      expect(c1.map((c) => c.id)).toContain("selection-not-reverse-sorted");
      expect(c1.map((c) => c.id)).toContain("selection-min-not-at-zero");
      expect(c1.map((c) => c.id)).toContain("selection-has-keep-min");
    });

    it("deve adicionar restrição de múltiplas atualizações para Fases 2 e 3", () => {
      const c2 = getSelectionPhaseConstraints(2);
      expect(c2.length).toBe(5);
      expect(c2.map((c) => c.id)).toContain("selection-multiple-min-updates");

      const c3 = getSelectionPhaseConstraints(3);
      expect(c3.length).toBe(5);
    });
  });

  describe("Geração Procedural de Vetores com generateSelectionPhaseArray", () => {
    it("deve gerar vetor de tamanho 4 para a Fase 1 satisfazendo todas as constraints", () => {
      const res = generateSelectionPhaseArray(1, 12345);
      expect(res.values.length).toBe(4);
      expect(new Set(res.values).size).toBe(4); // Sem duplicados
      expect(isNotSorted(res.values)).toBe(true);
      expect(isNotReverseSorted(res.values)).toBe(true);
      expect(isGlobalMinNotInFirstPosition(res.values)).toBe(true);
      expect(hasAtLeastOneKeepMin(res.values)).toBe(true);
      res.values.forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(1);
        expect(v).toBeLessThanOrEqual(99);
      });
    });

    it("deve gerar vetor de tamanho 5 para a Fase 2 satisfazendo todas as constraints", () => {
      const res = generateSelectionPhaseArray(2, "selection-seed-fase-2");
      expect(res.values.length).toBe(5);
      expect(new Set(res.values).size).toBe(5);
      expect(isNotSorted(res.values)).toBe(true);
      expect(isNotReverseSorted(res.values)).toBe(true);
      expect(isGlobalMinNotInFirstPosition(res.values)).toBe(true);
      expect(hasAtLeastOneKeepMin(res.values)).toBe(true);
    });

    it("deve gerar vetor de tamanho 6 para a Fase 3 satisfazendo todas as constraints", () => {
      const res = generateSelectionPhaseArray(3, 99999);
      expect(res.values.length).toBe(6);
      expect(new Set(res.values).size).toBe(6);
      expect(isNotSorted(res.values)).toBe(true);
      expect(isNotReverseSorted(res.values)).toBe(true);
      expect(isGlobalMinNotInFirstPosition(res.values)).toBe(true);
      expect(hasAtLeastOneKeepMin(res.values)).toBe(true);
    });

    it("deve garantir determinismo estrito: mesma seed e mesma fase geram exatamente os mesmos valores", () => {
      const run1 = generateSelectionPhaseArray(1, "deterministic-selection-seed");
      const run2 = generateSelectionPhaseArray(1, "deterministic-selection-seed");
      expect(run1.values).toEqual(run2.values);
    });

    it("deve clampar fases menores que 1 e maiores que 3 com segurança", () => {
      const resZero = generateSelectionPhaseArray(0, 42);
      expect(resZero.values.length).toBe(4); // Clamp para Fase 1

      const resTen = generateSelectionPhaseArray(10, 42);
      expect(resTen.values.length).toBe(6); // Clamp para Fase 3
    });
  });

  describe("Diferenciação Curricular Procedural do Selection Sort (LEARNING-R2-A)", () => {
    it("retorna constraints diferenciadas para basic, intermediate e advanced", () => {
      const basic = getSelectionPracticeConstraints("basic");
      const intermediate = getSelectionPracticeConstraints("intermediate");
      const advanced = getSelectionPracticeConstraints("advanced");

      expect(basic).toBe(SELECTION_BASIC_CONSTRAINTS);
      expect(intermediate).toBe(SELECTION_INTERMEDIATE_CONSTRAINTS);
      expect(advanced).toBe(SELECTION_ADVANCED_CONSTRAINTS);

      expect(intermediate.map((c) => c.id)).toContain("selection-interleaved-decisions");
      expect(advanced.map((c) => c.id)).toContain("selection-non-adjacent-transfer");
      expect(advanced.map((c) => c.id)).toContain("selection-rich-decisions");
    });

    it("gera vetores para Prática Básica (n=4) satisfazendo todas as restrições em 25 seeds", () => {
      for (let i = 0; i < 25; i++) {
        const seed = `sel-basic-test-${i * 37 + 7}`;
        const res = generateSelectionPracticeArray("basic", seed);
        expect(res.values).toHaveLength(4);
        for (const c of SELECTION_BASIC_CONSTRAINTS) {
          expect(c.predicate(res.values), `Seed ${seed} falhou em ${c.id}`).toBe(true);
        }
      }
    });

    it("gera vetores para Prática Intermediária (n=5) satisfazendo todas as restrições em 25 seeds", () => {
      for (let i = 0; i < 25; i++) {
        const seed = `sel-inter-test-${i * 41 + 19}`;
        const res = generateSelectionPracticeArray("intermediate", seed);
        expect(res.values).toHaveLength(5);
        for (const c of SELECTION_INTERMEDIATE_CONSTRAINTS) {
          expect(c.predicate(res.values), `Seed ${seed} falhou em ${c.id}`).toBe(true);
        }
      }
    });

    it("gera vetores para Prática Avançada (n=6) satisfazendo todas as restrições em 25 seeds", () => {
      for (let i = 0; i < 25; i++) {
        const seed = `sel-adv-test-${i * 43 + 29}`;
        const res = generateSelectionPracticeArray("advanced", seed);
        expect(res.values).toHaveLength(6);
        for (const c of SELECTION_ADVANCED_CONSTRAINTS) {
          expect(c.predicate(res.values), `Seed ${seed} falhou em ${c.id}`).toBe(true);
        }
      }
    });
  });
});
