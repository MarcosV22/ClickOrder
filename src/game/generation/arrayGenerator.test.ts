import { describe, it, expect } from "vitest";
import {
  generateSortingArray,
  generateBubblePhaseArray,
  generateBubblePracticeArray,
  getBubblePracticeConstraints,
  BUBBLE_BASIC_CONSTRAINTS,
  BUBBLE_INTERMEDIATE_CONSTRAINTS,
  BUBBLE_ADVANCED_CONSTRAINTS,
  BUBBLE_CAMPAIGN_PHASE_LENGTHS,
  ArrayGenerationError,
  isNotSorted,
  isNotReverseSorted,
  hasAtLeastOneSwapCandidate,
  hasAtLeastOneKeepCandidate,
  isAlreadySorted,
  isReverseSorted,
  hasNoDuplicates,
  hasDuplicates,
  BUBBLE_CAMPAIGN_CONSTRAINTS,
  createMulberry32,
  hashSeed,
  nextInt,
  generateRandomSeed,
} from "./index";

describe("Infraestrutura Global de Geração Procedural de Vetores (P1.9)", () => {
  // --------------------------------------------------------------------------
  // 1. PRNG e Funções de Hash de Seed
  // --------------------------------------------------------------------------
  describe("1. PRNG Mulberry32 e Sementes", () => {
    it("deve ser determinístico para a mesma semente numérica de 32 bits", () => {
      const prng1 = createMulberry32(123456);
      const prng2 = createMulberry32(123456);

      const seq1 = [prng1(), prng1(), prng1(), prng1()];
      const seq2 = [prng2(), prng2(), prng2(), prng2()];

      expect(seq1).toEqual(seq2);
    });

    it("deve suportar seed numérica com hashSeed determinístico", () => {
      expect(hashSeed(42)).toBe(42);
      expect(hashSeed(0)).toBe(0);
      expect(hashSeed(0xffffffff)).toBe(0xffffffff);
    });

    it("deve suportar seed textual com hash FNV-1a determinístico", () => {
      const h1 = hashSeed("aula-algoritmos-2026");
      const h2 = hashSeed("aula-algoritmos-2026");
      const hDiff = hashSeed("outra-turma-2026");

      expect(h1).toBe(h2);
      expect(typeof h1).toBe("number");
      expect(h1).not.toBe(hDiff);
    });

    it("deve gerar sementes aleatórias únicas com formato string sort-*", () => {
      const s1 = generateRandomSeed();
      const s2 = generateRandomSeed();
      expect(s1).toMatch(/^sort-/);
      expect(s2).toMatch(/^sort-/);
      expect(s1).not.toBe(s2);
    });

    it("deve respeitar os limites de nextInt", () => {
      const prng = createMulberry32(999);
      for (let i = 0; i < 50; i++) {
        const val = nextInt(prng, 10, 20);
        expect(val).toBeGreaterThanOrEqual(10);
        expect(val).toBeLessThanOrEqual(20);
      }
    });

    it("deve lançar erro se min > max em nextInt", () => {
      const prng = createMulberry32(1);
      expect(() => nextInt(prng, 10, 5)).toThrowError();
    });
  });

  // --------------------------------------------------------------------------
  // 2. Determinismo e Dispersão do Gerador Universal
  // --------------------------------------------------------------------------
  describe("2. Determinismo e Dispersão do Gerador", () => {
    it("mesma seed + mesma configuração => exatamente o mesmo vetor", () => {
      const res1 = generateSortingArray({
        length: 5,
        seed: "test-seed-xyz",
        minValue: 10,
        maxValue: 50,
      });

      const res2 = generateSortingArray({
        length: 5,
        seed: "test-seed-xyz",
        minValue: 10,
        maxValue: 50,
      });

      expect(res1.values).toEqual(res2.values);
      expect(res1.normalizedSeed).toBe(res2.normalizedSeed);
    });

    it("mesma seed numérica => exatamente o mesmo vetor", () => {
      const res1 = generateSortingArray({ length: 4, seed: 98765 });
      const res2 = generateSortingArray({ length: 4, seed: 98765 });
      expect(res1.values).toEqual(res2.values);
    });

    it("seeds diferentes produzem vetores distintos", () => {
      const resA = generateSortingArray({ length: 5, seed: "seed-alpha" });
      const resB = generateSortingArray({ length: 5, seed: "seed-beta" });
      expect(resA.values).not.toEqual(resB.values);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Parâmetros de Tamanho, Intervalo e Unicidade
  // --------------------------------------------------------------------------
  describe("3. Tamanho, Intervalo (Range) e Unicidade", () => {
    it("deve gerar o tamanho (length) exato solicitado", () => {
      const res3 = generateSortingArray({ length: 3, seed: "len-3" });
      const res7 = generateSortingArray({ length: 7, seed: "len-7" });
      expect(res3.values).toHaveLength(3);
      expect(res7.values).toHaveLength(7);
    });

    it("deve conter valores estritamente dentro do range configurado", () => {
      const res = generateSortingArray({
        length: 8,
        minValue: 20,
        maxValue: 35,
        seed: "range-check",
      });
      for (const v of res.values) {
        expect(v).toBeGreaterThanOrEqual(20);
        expect(v).toBeLessThanOrEqual(35);
      }
    });

    it("com allowDuplicates: false (default), todos os elementos devem ser únicos", () => {
      const res = generateSortingArray({
        length: 10,
        minValue: 1,
        maxValue: 99,
        seed: "unique-check",
      });
      const unique = new Set(res.values);
      expect(unique.size).toBe(10);
      expect(hasNoDuplicates(res.values)).toBe(true);
    });

    it("com allowDuplicates: true, suporta duplicados sem erro", () => {
      // Força repetição selecionando 10 elementos em um range de apenas 3 valores [1, 3]
      const res = generateSortingArray({
        length: 10,
        minValue: 1,
        maxValue: 3,
        allowDuplicates: true,
        seed: "dup-allowed",
      });
      expect(res.values).toHaveLength(10);
      expect(hasDuplicates(res.values)).toBe(true);
    });

    it("deve lançar ArrayGenerationError se unique for exigido e length > range", () => {
      expect(() =>
        generateSortingArray({
          length: 10,
          minValue: 1,
          maxValue: 5, // Apenas 5 valores únicos possíveis
          allowDuplicates: false,
        })
      ).toThrow(ArrayGenerationError);
    });

    it("deve lançar ArrayGenerationError para parâmetros inválidos", () => {
      expect(() => generateSortingArray({ length: 0 })).toThrow(ArrayGenerationError);
      expect(() => generateSortingArray({ length: -2 })).toThrow(ArrayGenerationError);
      expect(() => generateSortingArray({ length: 4, minValue: 50, maxValue: 10 })).toThrow(
        ArrayGenerationError
      );
      expect(() => generateSortingArray({ length: 4, maxAttempts: 0 })).toThrow(
        ArrayGenerationError
      );
    });
  });

  // --------------------------------------------------------------------------
  // 4. Imutabilidade
  // --------------------------------------------------------------------------
  describe("4. Imutabilidade dos Resultados", () => {
    it("GeneratedArrayResult.values deve ser congelado (Object.isFrozen)", () => {
      const res = generateSortingArray({ length: 4, seed: "freeze-test" });
      expect(Object.isFrozen(res.values)).toBe(true);
      expect(Object.isFrozen(res)).toBe(true);
      expect(Object.isFrozen(res.config)).toBe(true);

      // Tentativa de mutação deve falhar em runtime/strict
      expect(() => {
        // @ts-expect-error teste de tentativa de mutação
        res.values[0] = 999;
      }).toThrow();
    });
  });

  // --------------------------------------------------------------------------
  // 5. Constraints e Fallback Determinístico
  // --------------------------------------------------------------------------
  describe("5. Constraints, Fallback e Prevenção de Loops Infinitos", () => {
    it("deve respeitar restrições customizadas satisfeitas pelo PRNG", () => {
      const res = generateSortingArray({
        length: 4,
        seed: "not-sorted-seed",
        constraints: [isNotSorted],
      });
      expect(isNotSorted(res.values)).toBe(true);
    });

    it("deve disparar estratégia de fallback determinístico quando maxAttempts for baixo", () => {
      // Com maxAttempts = 1 e restrições rigorosas, o fallback determinístico é acionado
      const res = generateSortingArray({
        length: 4,
        seed: "fallback-trigger",
        constraints: BUBBLE_CAMPAIGN_CONSTRAINTS,
        maxAttempts: 1,
      });

      expect(res.values).toHaveLength(4);
      expect(isNotSorted(res.values)).toBe(true);
      expect(isNotReverseSorted(res.values)).toBe(true);
      expect(hasAtLeastOneSwapCandidate(res.values)).toBe(true);
      expect(hasAtLeastOneKeepCandidate(res.values)).toBe(true);
    });

    it("deve falhar explicitamente com ArrayGenerationError se as constraints forem matematicamente impossíveis", () => {
      // Impossível: vetor não pode ser simultaneamente ordenado e não-ordenado
      expect(() =>
        generateSortingArray({
          length: 4,
          seed: "impossible-constraints",
          constraints: [isAlreadySorted, isNotSorted],
          maxAttempts: 5,
        })
      ).toThrow(ArrayGenerationError);
    });

    it("nunca deve entrar em loop infinito mesmo com constraints rigorosas", () => {
      const start = Date.now();
      expect(() =>
        generateSortingArray({
          length: 5,
          seed: "anti-infinite-loop",
          constraints: [isAlreadySorted, isReverseSorted], // Impossível para 5 elementos distintos
          maxAttempts: 10,
        })
      ).toThrow(ArrayGenerationError);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(1000); // Executa em poucos milissegundos
    });
  });

  // --------------------------------------------------------------------------
  // 6. Predicados Matemáticos Puros (Sem dependência de Sorting Engines)
  // --------------------------------------------------------------------------
  describe("6. Predicados Matemáticos Canônicos de Constraints", () => {
    it("isNotSorted: identifica vetores ordenados e desordenados corretamente", () => {
      expect(isNotSorted([1, 2, 3, 4])).toBe(false); // ordenado => false
      expect(isNotSorted([1, 3, 2, 4])).toBe(true); // desordenado => true
      expect(isNotSorted([4, 3, 2, 1])).toBe(true); // invertido => true
    });

    it("isNotReverseSorted: identifica vetores invertidos e não-invertidos", () => {
      expect(isNotReverseSorted([4, 3, 2, 1])).toBe(false); // invertido => false
      expect(isNotReverseSorted([4, 2, 3, 1])).toBe(true); // não-totalmente invertido => true
      expect(isNotReverseSorted([1, 2, 3, 4])).toBe(true); // ordenado => true
    });

    it("hasAtLeastOneSwapCandidate: identifica necessidade de TROCAR", () => {
      expect(hasAtLeastOneSwapCandidate([1, 2, 3])).toBe(false); // ordenado, zero trocas
      expect(hasAtLeastOneSwapCandidate([2, 1, 3])).toBe(true); // 2 > 1 gera troca
    });

    it("hasAtLeastOneKeepCandidate: identifica necessidade de MANTER", () => {
      expect(hasAtLeastOneKeepCandidate([3, 2, 1])).toBe(false); // estritamente decrescente, zero MANTER
      expect(hasAtLeastOneKeepCandidate([3, 1, 2])).toBe(true); // 1 <= 2 gera MANTER
    });
  });

  // --------------------------------------------------------------------------
  // 7. Integração Pedagógica com a Campanha Bubble Sort
  // --------------------------------------------------------------------------
  describe("7. Integração com Fases da Campanha Bubble Sort", () => {
    it("Fase 1 deve ter exatamente 4 elementos", () => {
      const res = generateBubblePhaseArray(1, "phase-1-seed");
      expect(res.values).toHaveLength(4);
      expect(BUBBLE_CAMPAIGN_PHASE_LENGTHS[0]).toBe(4);
    });

    it("Fase 2 deve ter exatamente 5 elementos", () => {
      const res = generateBubblePhaseArray(2, "phase-2-seed");
      expect(res.values).toHaveLength(5);
      expect(BUBBLE_CAMPAIGN_PHASE_LENGTHS[1]).toBe(5);
    });

    it("Fase 3 deve ter exatamente 6 elementos", () => {
      const res = generateBubblePhaseArray(3, "phase-3-seed");
      expect(res.values).toHaveLength(6);
      expect(BUBBLE_CAMPAIGN_PHASE_LENGTHS[2]).toBe(6);
    });

    it("todas as 3 fases satisfazem rigorosamente as 4 restrições pedagógicas de Bubble", () => {
      for (const phase of [1, 2, 3]) {
        for (let i = 0; i < 10; i++) {
          const res = generateBubblePhaseArray(phase, `bubble-seed-${phase}-${i}`);
          const arr = res.values;

          // 1. Não previamente ordenado
          expect(isNotSorted(arr)).toBe(true);
          // 2. Não completamente invertido
          expect(isNotReverseSorted(arr)).toBe(true);
          // 3. Ao menos um SWAP
          expect(hasAtLeastOneSwapCandidate(arr)).toBe(true);
          // 4. Ao menos um KEEP
          expect(hasAtLeastOneKeepCandidate(arr)).toBe(true);
          // 5. Sem duplicados
          expect(hasNoDuplicates(arr)).toBe(true);
          // 6. Valores entre 1 e 99
          for (const val of arr) {
            expect(val).toBeGreaterThanOrEqual(1);
            expect(val).toBeLessThanOrEqual(99);
          }
        }
      }
    });

    it("ciclo de reinício: mesma seed e fase mantém exatamente o mesmo vetor", () => {
      const seed = "player-session-token-99";
      const initial = generateBubblePhaseArray(2, seed);
      // Simulação do botão "REPETIR PROTOCOLO"
      const restarted = generateBubblePhaseArray(2, seed);
      expect(restarted.values).toEqual(initial.values);
    });

    it("avanço de fase: nova fase recebe tamanho correspondente e nova entrada", () => {
      const seed = "player-session-token-99";
      const p1 = generateBubblePhaseArray(1, `${seed}-p1`);
      const p2 = generateBubblePhaseArray(2, `${seed}-p2`);
      const p3 = generateBubblePhaseArray(3, `${seed}-p3`);

      expect(p1.values).toHaveLength(4);
      expect(p2.values).toHaveLength(5);
      expect(p3.values).toHaveLength(6);
      expect(p1.values).not.toEqual(p2.values);
    });
  });

  // --------------------------------------------------------------------------
  // 8. Reutilização Multi-Algoritmo (Agnóstico a Engines)
  // --------------------------------------------------------------------------
  describe("8. Capacidade Multi-Algoritmo da Infraestrutura", () => {
    it("a mesma seed/configuração pode alimentar Selection, Insertion, Merge ou Quick Sort", () => {
      const sharedSeed = "academic-experiment-2026";
      const sharedConfig = { length: 6, minValue: 1, maxValue: 99, seed: sharedSeed };

      const vectorForBubble = generateSortingArray(sharedConfig);
      const vectorForSelection = generateSortingArray(sharedConfig);
      const vectorForInsertion = generateSortingArray(sharedConfig);

      // Todos os protocolos futuros recebem a entrada rigorosamente idêntica
      expect(vectorForBubble.values).toEqual(vectorForSelection.values);
      expect(vectorForSelection.values).toEqual(vectorForInsertion.values);
    });
  });

  // --------------------------------------------------------------------------
  // 9. Diferenciação Curricular Procedural do Bubble Sort (LEARNING-R2-A)
  // --------------------------------------------------------------------------
  describe("9. Diferenciação Curricular Procedural do Bubble Sort (LEARNING-R2-A)", () => {
    it("deve retornar conjuntos de restrições distintos para basic, intermediate e advanced", () => {
      const basic = getBubblePracticeConstraints("basic");
      const intermediate = getBubblePracticeConstraints("intermediate");
      const advanced = getBubblePracticeConstraints("advanced");

      expect(basic).toBe(BUBBLE_BASIC_CONSTRAINTS);
      expect(intermediate).toBe(BUBBLE_INTERMEDIATE_CONSTRAINTS);
      expect(advanced).toBe(BUBBLE_ADVANCED_CONSTRAINTS);

      expect(basic.map((c) => c.id)).toContain("bubble-multi-displacement");
      expect(intermediate.map((c) => c.id)).toContain("bubble-balanced-decisions");
      expect(advanced.map((c) => c.id)).toContain("bubble-advanced-decisions");
    });

    it("gera vetores para Prática Básica (n=4) satisfazendo todas as restrições em 25 seeds", () => {
      for (let i = 0; i < 25; i++) {
        const seed = `bubble-basic-eval-${i * 97 + 13}`;
        const res = generateBubblePracticeArray("basic", seed);
        expect(res.values).toHaveLength(4);
        expect(hasNoDuplicates(res.values)).toBe(true);

        for (const constraint of BUBBLE_BASIC_CONSTRAINTS) {
          expect(
            constraint.predicate(res.values),
            `Seed ${seed} falhou na constraint ${constraint.id}`
          ).toBe(true);
        }
      }
    });

    it("gera vetores para Prática Intermediária (n=5) satisfazendo todas as restrições em 25 seeds", () => {
      for (let i = 0; i < 25; i++) {
        const seed = `bubble-inter-eval-${i * 101 + 31}`;
        const res = generateBubblePracticeArray("intermediate", seed);
        expect(res.values).toHaveLength(5);
        expect(hasNoDuplicates(res.values)).toBe(true);

        for (const constraint of BUBBLE_INTERMEDIATE_CONSTRAINTS) {
          expect(
            constraint.predicate(res.values),
            `Seed ${seed} falhou na constraint ${constraint.id}`
          ).toBe(true);
        }
      }
    });

    it("gera vetores para Prática Avançada (n=6) satisfazendo todas as restrições em 25 seeds", () => {
      for (let i = 0; i < 25; i++) {
        const seed = `bubble-adv-eval-${i * 113 + 47}`;
        const res = generateBubblePracticeArray("advanced", seed);
        expect(res.values).toHaveLength(6);
        expect(hasNoDuplicates(res.values)).toBe(true);

        for (const constraint of BUBBLE_ADVANCED_CONSTRAINTS) {
          expect(
            constraint.predicate(res.values),
            `Seed ${seed} falhou na constraint ${constraint.id}`
          ).toBe(true);
        }
      }
    });

    it("garante determinismo estrito entre chamadas idênticas", () => {
      const runA = generateBubblePracticeArray("intermediate", "seed-determinism-xyz");
      const runB = generateBubblePracticeArray("intermediate", "seed-determinism-xyz");
      expect(runA.values).toEqual(runB.values);
    });
  });
});
