import { describe, expect, it, vi } from "vitest";
import { ArrayGenerationError } from "../../generation";
import * as arrayGenModule from "../../generation/arrayGenerator";
import {
  generateQuickPracticeArray,
  hasQuickBalancedRootPartition,
  hasQuickPartitionContinuity,
  hasExactlyOneDuplicatePair,
  hasQuickPivotEqualityComparison,
  hasQuickDuplicatesInversion,
  assignQuickIdentities,
  QUICK_FALLBACK_ARRAYS,
} from "./quickConstraints";
import { initQuickSortState, stepQuickSort } from "./quickSortEngine";

describe("quickConstraints — Geração Procedural e Validação Pedagógica", () => {
  it("gera arrays do nível básico (n=4) sem duplicatas e com determinismo estrito", () => {
    const seed = "basic-test-seed-123";
    const res1 = generateQuickPracticeArray("basic", seed);
    const res2 = generateQuickPracticeArray("basic", seed);

    expect(res1.result.values).toHaveLength(4);
    expect(res1.result.values).toEqual(res2.result.values);
    expect(res1.elements).toHaveLength(4);

    // Sem duplicatas
    const uniqueValues = new Set(res1.result.values);
    expect(uniqueValues.size).toBe(4);

    // Identidades e originalIndex consistentes
    res1.elements.forEach((elem, idx) => {
      expect(elem.value).toBe(res1.result.values[idx]);
      expect(elem.originalIndex).toBe(idx);
    });
  });

  it("gera arrays do nível intermediário (n=5) sem duplicatas e com partição balanceada", () => {
    const seed = "intermediate-test-seed-456";
    const res = generateQuickPracticeArray("intermediate", seed);

    expect(res.result.values).toHaveLength(5);
    const uniqueValues = new Set(res.result.values);
    expect(uniqueValues.size).toBe(5);

    expect(hasQuickBalancedRootPartition(res.result.values)).toBe(true);
    expect(hasQuickPartitionContinuity(res.result.values)).toBe(true);
  });

  it("gera arrays do nível avançado (n=6) com exatamente um par duplicado e confronto de igualdade", () => {
    const seed = "advanced-test-seed-789";
    const res = generateQuickPracticeArray("advanced", seed);

    expect(res.result.values).toHaveLength(6);
    expect(hasExactlyOneDuplicatePair(res.result.values)).toBe(true);

    // Verifica que a engine real executa ao menos uma comparação de igualdade com o pivô
    expect(hasQuickPivotEqualityComparison(res.result.values)).toBe(true);

    // Verifica que as duplicatas recebem sufixos de identificação 'a' e 'b'
    const dups = res.elements.filter((e) => e.labelSuffix !== undefined);
    expect(dups).toHaveLength(2);
    expect(dups[0].labelSuffix).toBe("a");
    expect(dups[1].labelSuffix).toBe("b");
    expect(dups[0].value).toBe(dups[1].value);
  });

  it("garante que os arrays de fallback curados satisfazem rigorosamente suas constraints", () => {
    const basicFallback = QUICK_FALLBACK_ARRAYS.basic;
    expect(basicFallback).toHaveLength(4);
    expect(new Set(basicFallback).size).toBe(4);

    const interFallback = QUICK_FALLBACK_ARRAYS.intermediate;
    expect(interFallback).toHaveLength(5);
    expect(new Set(interFallback).size).toBe(5);
    expect(hasQuickBalancedRootPartition(interFallback)).toBe(true);

    const advFallback = QUICK_FALLBACK_ARRAYS.advanced;
    expect(advFallback).toHaveLength(6);
    expect(hasExactlyOneDuplicatePair(advFallback)).toBe(true);
    expect(hasQuickPivotEqualityComparison(advFallback)).toBe(true);
  });

  it("força o esgotamento de tentativas no gerador procedural e valida rigorosamente todas as constraints do fallback (especialmente a comparação real de igualdade na Avançada)", () => {
    // 1. Simula esgotamento de tentativas disparando ArrayGenerationError através do gerador compartilhado
    const spyAdv = vi.spyOn(arrayGenModule, "generateSortingArray").mockImplementationOnce(() => {
      throw new ArrayGenerationError("Esgotamento forçado para teste de fallback", { attempts: 120 });
    });

    const advExhausted = generateQuickPracticeArray("advanced", "exhaust-seed-1");
    expect(advExhausted.result.isFallback).toBe(true);
    expect(advExhausted.result.values).toEqual(QUICK_FALLBACK_ARRAYS.advanced);
    expect(advExhausted.result.values).toHaveLength(6);
    expect(hasExactlyOneDuplicatePair(advExhausted.result.values)).toBe(true);
    // Validação crucial: confronto real de igualdade contra o pivô na partição
    expect(hasQuickPivotEqualityComparison(advExhausted.result.values)).toBe(true);
    expect(advExhausted.elements).toHaveLength(6);
    const dups = advExhausted.elements.filter((e) => e.labelSuffix !== undefined);
    expect(dups).toHaveLength(2);
    expect(dups[0].labelSuffix).toBe("a");
    expect(dups[1].labelSuffix).toBe("b");

    spyAdv.mockRestore();

    // 2. Testa também para Básica e Intermediária sob esgotamento forçado
    const spyBasic = vi.spyOn(arrayGenModule, "generateSortingArray").mockImplementationOnce(() => {
      throw new ArrayGenerationError("Esgotamento básico", { attempts: 60 });
    });
    const basicExhausted = generateQuickPracticeArray("basic", "exhaust-basic");
    expect(basicExhausted.result.isFallback).toBe(true);
    expect(basicExhausted.result.values).toEqual(QUICK_FALLBACK_ARRAYS.basic);
    expect(new Set(basicExhausted.result.values).size).toBe(4);
    spyBasic.mockRestore();

    const spyInter = vi.spyOn(arrayGenModule, "generateSortingArray").mockImplementationOnce(() => {
      throw new ArrayGenerationError("Esgotamento intermediário", { attempts: 60 });
    });
    const interExhausted = generateQuickPracticeArray("intermediate", "exhaust-inter");
    expect(interExhausted.result.isFallback).toBe(true);
    expect(interExhausted.result.values).toEqual(QUICK_FALLBACK_ARRAYS.intermediate);
    expect(new Set(interExhausted.result.values).size).toBe(5);
    expect(hasQuickBalancedRootPartition(interExhausted.result.values)).toBe(true);
    spyInter.mockRestore();
  });
});
