import { describe, expect, it } from "vitest";
import {
  runQuickDemonstration,
  CURATED_QUICK_DEMO_ARRAY,
  getDemonstrationExecution,
} from "../../demonstration";
import { reconstructQuickVisualFrame } from "./quickSortEngine";

describe("quickDemonstration — Execução Autônoma e Validação Canônica", () => {
  it("executa demonstração canônica sobre o vetor [5, 2, 4, 1, 3] com métricas e ordenação exatas", () => {
    const demo = runQuickDemonstration();

    expect(demo.protocol).toBe("quick");
    expect(demo.initialArray).toEqual([5, 2, 4, 1, 3]);
    expect(demo.finalValues).toEqual([1, 2, 3, 4, 5]);
    expect(demo.completed).toBe(true);

    // Contrato estrito de métricas: 6 comparações, 5 trocas, 10 escritas no vetor
    expect(demo.comparisons).toBe(6);
    expect(demo.swaps).toBe(5);
    expect(demo.writesInArray).toBe(10);

    // Validação da história completa de eventos (sem fabricação de estados)
    expect(demo.history.length).toBeGreaterThan(0);
    const eventTypes = demo.history.map((record) => record.eventType);

    expect(eventTypes).toContain("PARTITION_START");
    expect(eventTypes).toContain("CLASSIFY_ELEMENT");
    expect(eventTypes).toContain("PIVOT_POSITIONED");
    expect(eventTypes).toContain("BASE_CASE_RESOLVED");
    expect(eventTypes).toContain("SORT_COMPLETE");
  });

  it("permite reconstruir frames visuais a partir de qualquer registro histórico sem reexecutar o algoritmo", () => {
    const demo = runQuickDemonstration();
    expect(demo.history.length).toBeGreaterThan(5);

    // Reconstrução do frame no meio da execução
    const midRecord = demo.history[4];
    const frame = reconstructQuickVisualFrame(midRecord);

    expect(frame.stepIndex).toBe(midRecord.stepIndex);
    expect(frame.values).toHaveLength(5);
    expect(frame.comparisons).toBe(midRecord.comparisons);
    expect(frame.swaps).toBe(midRecord.swaps);
    expect(frame.writesInArray).toBe(midRecord.writesInArray);
  });

  it("está integrado ao despachante universal getDemonstrationExecution('quick')", () => {
    const demo = getDemonstrationExecution("quick");

    expect(demo.protocol).toBe("quick");
    expect(demo.finalValues).toEqual([1, 2, 3, 4, 5]);
    expect(demo.completed).toBe(true);
    expect(demo.comparisons).toBe(6);
    expect(demo.swaps).toBe(5);
  });
});
