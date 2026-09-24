import { describe, it, expect } from "vitest";
import {
  MERGE_SORT_CANONICAL_PSEUDOCODE,
  getMergePseudocodeHighlight,
} from "./mergeReplayPseudocode";
import { buildMergeReplayFrames } from "./mergeReplayModel";
import {
  initMergeSortState,
  executeMergeStep,
} from "./mergeSortEngine";
import { assignMergeIdentities } from "./mergeConstraints";

describe("Merge Sort Canonical Pseudocode & Synchronized Mapping (P3.1-E)", () => {
  it("contém exatamente 30 linhas canônicas estruturadas conforme ADR 0023", () => {
    expect(MERGE_SORT_CANONICAL_PSEUDOCODE).toHaveLength(30);

    for (let i = 0; i < 30; i++) {
      expect(MERGE_SORT_CANONICAL_PSEUDOCODE[i].lineNumber).toBe(i + 1);
      expect(MERGE_SORT_CANONICAL_PSEUDOCODE[i].id).toBeDefined();
    }

    // Conferência de linhas estruturais chaves
    expect(MERGE_SORT_CANONICAL_PSEUDOCODE[0].code).toBe(
      "procedimento mergeSort(A, inicio, fim)",
    );
    expect(MERGE_SORT_CANONICAL_PSEUDOCODE[2].code).toBe(
      "    meio ← ⌊(inicio + fim) / 2⌋",
    );
    expect(MERGE_SORT_CANONICAL_PSEUDOCODE[9].code).toBe(
      "procedimento intercalar(A, inicio, meio, fim)",
    );
    expect(MERGE_SORT_CANONICAL_PSEUDOCODE[10].code).toContain(
      "Buffer ← alocar buffer de tamanho",
    );
    expect(MERGE_SORT_CANONICAL_PSEUDOCODE[13].code).toContain(
      "se A[p1].value ≤ A[p2].value então",
    );
    expect(MERGE_SORT_CANONICAL_PSEUDOCODE[14].code).toContain("Buffer[k] ← A[p1]");
    expect(MERGE_SORT_CANONICAL_PSEUDOCODE[16].code).toContain("Buffer[k] ← A[p2]");
    expect(MERGE_SORT_CANONICAL_PSEUDOCODE[21].code).toContain("Buffer[k] ← A[p1]");
    expect(MERGE_SORT_CANONICAL_PSEUDOCODE[24].code).toContain("Buffer[k] ← A[p2]");
    expect(MERGE_SORT_CANONICAL_PSEUDOCODE[27].code).toContain(
      "A[inicio + idx] ← Buffer[idx]",
    );
    expect(MERGE_SORT_CANONICAL_PSEUDOCODE[29].code).toBe("fim procedimento");
  });

  function createSampleFrames() {
    const initialElements = assignMergeIdentities([3, 1]);
    let state = initMergeSortState(initialElements);

    // Passo 1: COMPARE_HEADS (3 e 1) -> 1 é menor, despacho direito
    const step1 = executeMergeStep(state, "DISPATCH_RIGHT");
    state = step1.state;

    // Passo 2: DRAIN_READY -> Ramal Esquerdo restante
    const step2 = executeMergeStep(state, "DRAIN_REMAINDER");
    state = step2.state;

    return buildMergeReplayFrames(initialElements, state.history);
  }

  it("mapeia o Estado Inicial (Frame 0) para o início do procedimento mergeSort", () => {
    const frames = createSampleFrames();
    const highlight = getMergePseudocodeHighlight(frames[0]);

    expect(highlight.primaryLineNumber).toBe(1);
    expect(highlight.activeLineNumbers).toContain(1);
    expect(highlight.activeLineNumbers).toContain(2);
    expect(highlight.conditionResult).toBeNull();
    expect(highlight.concreteContext.comparisonText).toBe("—");
  });

  it("mapeia evento DIVIDE para cálculo do meio e recursão", () => {
    const frames = createSampleFrames();
    const divideFrame = frames.find((f) => f.frameType === "DIVIDE");
    expect(divideFrame).toBeDefined();

    const highlight = getMergePseudocodeHighlight(divideFrame!);
    expect(highlight.primaryLineNumber).toBe(3);
    expect(highlight.activeLineNumbers).toEqual([2, 3, 4, 5, 6]);
    expect(highlight.concreteContext.meio).toBe(0);
  });

  it("mapeia evento MERGE_INIT para alocação do buffer e inicialização de ponteiros", () => {
    const frames = createSampleFrames();
    const initFrame = frames.find((f) => f.frameType === "MERGE_INIT");
    expect(initFrame).toBeDefined();

    const highlight = getMergePseudocodeHighlight(initFrame!);
    expect(highlight.primaryLineNumber).toBe(11);
    expect(highlight.activeLineNumbers).toEqual([10, 11, 12, 13]);
    expect(highlight.concreteContext.p1).toBe(0);
    expect(highlight.concreteContext.p2).toBe(1);
  });

  it("mapeia DISPATCH RIGHT para a linha 17 com condição falsa na comparação", () => {
    const frames = createSampleFrames();
    const dispatchRight = frames.find(
      (f) => f.frameType === "DISPATCH" && f.dispatchedSource === "RIGHT",
    );
    expect(dispatchRight).toBeDefined();

    const highlight = getMergePseudocodeHighlight(dispatchRight!);
    expect(highlight.primaryLineNumber).toBe(17);
    expect(highlight.activeLineNumbers).toEqual([13, 14, 16, 17, 19]);
    expect(highlight.conditionResult).toBe("RIGHT_SMALLER");
  });

  it("mapeia DRAIN para o laço de drenagem correspondente", () => {
    const frames = createSampleFrames();
    const drainFrame = frames.find((f) => f.frameType === "DRAIN");
    expect(drainFrame).toBeDefined();

    const highlight = getMergePseudocodeHighlight(drainFrame!);
    // Neste caso esquerdo foi drenado
    expect(highlight.primaryLineNumber).toBe(22);
    expect(highlight.activeLineNumbers).toEqual([21, 22, 23]);
    expect(highlight.conditionResult).toBe("DRAIN_LEFT");
  });

  it("mapeia COPY_BACK para o laço de cópia de retorno para o vetor principal", () => {
    const frames = createSampleFrames();
    const copyBackFrame = frames.find((f) => f.frameType === "COPY_BACK");
    expect(copyBackFrame).toBeDefined();

    const highlight = getMergePseudocodeHighlight(copyBackFrame!);
    expect(highlight.primaryLineNumber).toBe(28);
    expect(highlight.activeLineNumbers).toContain(27);
    expect(highlight.activeLineNumbers).toContain(28);
    expect(highlight.activeLineNumbers).toContain(29);
    expect(highlight.activeLineNumbers).toContain(30);
  });
});
