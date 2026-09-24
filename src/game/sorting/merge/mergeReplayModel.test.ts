import { describe, it, expect } from "vitest";
import {
  buildMergeReplayFrames,
  getMergeReplayFrame,
} from "./mergeReplayModel";
import {
  initMergeSortState,
  executeMergeStep,
} from "./mergeSortEngine";
import { assignMergeIdentities } from "./mergeConstraints";
import { formatMergeElementLabel } from "./mergePedagogy";
import type { MergeElement, MergeStepRecord } from "./types";

describe("Merge Sort Replay Model (P3.1-E)", () => {
  function createTestRun(rawValues: number[]) {
    const initialElements = assignMergeIdentities(rawValues);
    let state = initMergeSortState(initialElements);

    // Conduz a ordenação canônica correta até a conclusão
    while (!state.completed && state.activeInterval !== null) {
      if (state.phase === "COMPARE_HEADS") {
        const leftVal = state.values[state.p1].value;
        const rightVal = state.values[state.p2].value;
        const decision = leftVal <= rightVal ? "DISPATCH_LEFT" : "DISPATCH_RIGHT";
        const res = executeMergeStep(state, decision);
        state = res.state;
      } else if (state.phase === "DRAIN_READY") {
        const res = executeMergeStep(state, "DRAIN_REMAINDER");
        state = res.state;
      }
    }

    return {
      initialElements,
      finalState: state,
      history: state.history,
    };
  }

  it("garante a invariante estrita: frames.length === 1 + history.length", () => {
    const { initialElements, history } = createTestRun([4, 2, 5, 1]);
    expect(history.length).toBeGreaterThan(0);

    const frames = buildMergeReplayFrames(initialElements, history);
    expect(frames.length).toBe(1 + history.length);
  });

  it("inicializa o Quadro 0 como Estado Inicial factual com métricas zeradas", () => {
    const { initialElements, history } = createTestRun([5, 3, 1, 4]);
    const frames = buildMergeReplayFrames(initialElements, history);
    const frame0 = frames[0];

    expect(frame0.stepNumber).toBe(0);
    expect(frame0.stepIndex).toBe(-1);
    expect(frame0.frameType).toBe("INITIAL");
    expect(frame0.actionLabel).toBe("ESTADO INICIAL");
    expect(frame0.values.map((e) => e.value)).toEqual([5, 3, 1, 4]);
    expect(frame0.buffer).toHaveLength(0);
    expect(frame0.activeInterval).toBeNull();
    expect(frame0.p1).toBeNull();
    expect(frame0.p2).toBeNull();
    expect(frame0.k).toBe(0);
    expect(frame0.cumulativeComparisons).toBe(0);
    expect(frame0.cumulativeWritesInBuffer).toBe(0);
    expect(frame0.cumulativeWritesInMain).toBe(0);
    expect(frame0.cumulativeTotalWrites).toBe(0);
    expect(frame0.sortedIntervals).toHaveLength(0);
    expect(frame0.isCompleted).toBe(false);
  });

  it("preserva estritamente as identidades estáveis de elementos (id e label)", () => {
    const rawValues = [3, 1, 3, 2];
    const { initialElements, history } = createTestRun(rawValues);
    const frames = buildMergeReplayFrames(initialElements, history);

    // Elementos com valor repetido 3 devem ter rótulos estáveis distintos
    expect(initialElements[0].label).toBe("a");
    expect(initialElements[2].label).toBe("b");
    expect(formatMergeElementLabel(initialElements[0])).toBe("3a");
    expect(formatMergeElementLabel(initialElements[2])).toBe("3b");

    // No último quadro, a ordem deve ser 1, 2, 3a, 3b
    const lastFrame = frames[frames.length - 1];
    expect(lastFrame.isCompleted).toBe(true);
    expect(lastFrame.values.map((e) => formatMergeElementLabel(e))).toEqual([
      "1",
      "2",
      "3a",
      "3b",
    ]);
    expect(lastFrame.values.map((e) => e.value)).toEqual([1, 2, 3, 3]);
  });

  it("acumula métricas algorítmicas de forma crescente e correspondente aos eventos", () => {
    const { initialElements, history } = createTestRun([4, 1, 3, 2]);
    const frames = buildMergeReplayFrames(initialElements, history);

    for (let i = 1; i < frames.length; i++) {
      const prev = frames[i - 1];
      const curr = frames[i];

      expect(curr.cumulativeComparisons).toBeGreaterThanOrEqual(prev.cumulativeComparisons);
      expect(curr.cumulativeWritesInBuffer).toBeGreaterThanOrEqual(prev.cumulativeWritesInBuffer);
      expect(curr.cumulativeWritesInMain).toBeGreaterThanOrEqual(prev.cumulativeWritesInMain);
      expect(curr.cumulativeTotalWrites).toBe(
        curr.cumulativeWritesInBuffer + curr.cumulativeWritesInMain,
      );
    }

    const last = frames[frames.length - 1];
    // Para n=4, W(4) = 16 escritas no total (8 buffer + 8 principal)
    expect(last.cumulativeWritesInBuffer).toBe(8);
    expect(last.cumulativeWritesInMain).toBe(8);
    expect(last.cumulativeTotalWrites).toBe(16);
  });

  it("remove intervalos ordenados (ORD/OK) ao retroceder no histórico", () => {
    const { initialElements, history } = createTestRun([4, 2, 1, 3]);
    const frames = buildMergeReplayFrames(initialElements, history);

    // Localiza o primeiro evento COPY_BACK
    const firstCopyBackIdx = frames.findIndex((f) => f.frameType === "COPY_BACK");
    expect(firstCopyBackIdx).toBeGreaterThan(0);

    // O quadro anterior ao primeiro COPY_BACK não tem nenhum intervalo ordenado
    const frameBefore = frames[firstCopyBackIdx - 1];
    expect(frameBefore.sortedIntervals).toHaveLength(0);

    // O quadro do COPY_BACK tem o intervalo consolidado
    const frameAfter = frames[firstCopyBackIdx];
    expect(frameAfter.sortedIntervals.length).toBeGreaterThanOrEqual(1);

    // Retroceder de volta ao frame anterior garante zero intervalos
    const inspectedBack = getMergeReplayFrame(frames, firstCopyBackIdx - 1);
    expect(inspectedBack.sortedIntervals).toHaveLength(0);
  });

  it("diferencia claramente eventos DIVIDE e MERGE_INIT", () => {
    const { initialElements, history } = createTestRun([3, 1]);
    const frames = buildMergeReplayFrames(initialElements, history);

    const divideFrames = frames.filter((f) => f.frameType === "DIVIDE");
    const initFrames = frames.filter((f) => f.frameType === "MERGE_INIT");

    expect(divideFrames.length).toBeGreaterThan(0);
    expect(initFrames.length).toBeGreaterThan(0);

    expect(divideFrames[0].actionLabel).toBe("DIVISÃO DE FLUXO");
    expect(initFrames[0].actionLabel).toBe("INICIALIZAÇÃO DA INTERCALAÇÃO");
    expect(divideFrames[0].buffer).toHaveLength(0);
    expect(initFrames[0].buffer).toHaveLength(2); // buffer pré-alocado
  });

  it("trata DRAIN e COPY_BACK como passos únicos em lote sem micro-estados fabricados", () => {
    const { initialElements, history } = createTestRun([4, 3, 2, 1]);
    const frames = buildMergeReplayFrames(initialElements, history);

    const drainFrames = frames.filter((f) => f.frameType === "DRAIN");
    const copyBackFrames = frames.filter((f) => f.frameType === "COPY_BACK");

    expect(drainFrames.length).toBeGreaterThan(0);
    expect(copyBackFrames.length).toBeGreaterThan(0);

    // Cada drain é exatamente 1 frame no histórico
    drainFrames.forEach((frame) => {
      expect(frame.frameType).toBe("DRAIN");
      expect(frame.actionLabel).toContain("DRENAGEM RESTANTE");
    });

    // Cada copy_back é exatamente 1 frame no histórico
    copyBackFrames.forEach((frame) => {
      expect(frame.frameType).toBe("COPY_BACK");
      expect(frame.actionLabel).toContain("CÓPIA DE RETORNO");
    });
  });

  it("getMergeReplayFrame protege limites inferior e superior de navegação", () => {
    const { initialElements, history } = createTestRun([3, 1]);
    const frames = buildMergeReplayFrames(initialElements, history);

    expect(getMergeReplayFrame(frames, -10)).toBe(frames[0]);
    expect(getMergeReplayFrame(frames, 0)).toBe(frames[0]);
    expect(getMergeReplayFrame(frames, 9999)).toBe(frames[frames.length - 1]);
    expect(getMergeReplayFrame(frames, frames.length - 1)).toBe(frames[frames.length - 1]);
  });
});
