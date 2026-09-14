import { describe, expect, it } from "vitest";
import {
  createSelectionSortState,
  executeSelectionInspection,
  commitSelectionPass,
  executeSelectionStep,
} from "../sorting/selection/selectionSortEngine";
import {
  buildSelectionReplayFrames,
  getSelectionReplayFrame,
} from "./selectionReplayModel";

describe("SelectionReplayModel", () => {
  describe("Teste Canônico Obrigatório: [4, 1, 3]", () => {
    it("deve derivar fielmente a sequência canônica de 6 frames: INITIAL -> NOVO MÍNIMO -> MANTER -> COMMIT -> NOVO MÍNIMO -> COMMIT", () => {
      const initial = [4, 1, 3];
      let state = createSelectionSortState(initial);

      // Passo 1: Inspeção de j=1 (1) contra minIndex=0 (4) -> 1 < 4: NOVO MÍNIMO
      const r1 = executeSelectionInspection(state, "SELECT_NEW_MIN");
      expect(r1.valid).toBe(true);
      state = r1.state;

      // Passo 2: Inspeção de j=2 (3) contra minIndex=1 (1) -> 3 < 1: MANTER
      const r2 = executeSelectionInspection(state, "KEEP_MIN");
      expect(r2.valid).toBe(true);
      state = r2.state;

      // Passo 3: Commit da passada 0 -> minIndex (1) !== i (0) -> Troca: [1, 4, 3]
      const r3 = commitSelectionPass(state);
      expect(r3.valid).toBe(true);
      expect(r3.didSwap).toBe(true);
      state = r3.state;

      // Passo 4: Inspeção de j=2 (3) contra minIndex=1 (4) -> 3 < 4: NOVO MÍNIMO
      const r4 = executeSelectionInspection(state, "SELECT_NEW_MIN");
      expect(r4.valid).toBe(true);
      state = r4.state;

      // Passo 5: Commit da passada 1 -> minIndex (2) !== i (1) -> Troca: [1, 3, 4]
      const r5 = commitSelectionPass(state);
      expect(r5.valid).toBe(true);
      expect(r5.didSwap).toBe(true);
      state = r5.state;
      expect(state.completed).toBe(true);

      expect(state.history).toHaveLength(5);

      // Derivação pura do replay
      const frames = buildSelectionReplayFrames(initial, state.history);

      // Total de frames = history.length + 1 = 6
      expect(frames).toHaveLength(6);

      // Frame 0: INITIAL
      const f0 = frames[0];
      expect(f0.stepNumber).toBe(0);
      expect(f0.frameType).toBe("INITIAL");
      expect(f0.values).toEqual([4, 1, 3]);
      expect(f0.targetIndex).toBe(0);
      expect(f0.scanIndex).toBeNull();
      expect(f0.minIndex).toBe(0);
      expect(f0.sortedIndices).toEqual([]);
      expect(f0.actionLabel).toBe("ESTADO INICIAL");
      expect(f0.isNewMin).toBe(false);
      expect(f0.didSwap).toBe(false);

      // Frame 1: 1 < 4: NOVO MÍNIMO
      const f1 = frames[1];
      expect(f1.stepNumber).toBe(1);
      expect(f1.frameType).toBe("INSPECTION");
      expect(f1.values).toEqual([4, 1, 3]);
      expect(f1.targetIndex).toBe(0);
      expect(f1.scanIndex).toBe(1);
      expect(f1.scanValue).toBe(1);
      expect(f1.minIndexBefore).toBe(0);
      expect(f1.minIndex).toBe(1); // Atualizado para 1
      expect(f1.isNewMin).toBe(true);
      expect(f1.actionLabel).toBe("NOVO MÍNIMO");
      expect(f1.comparisonText).toBe("1 < 4");
      expect(f1.explanation).toContain("1 < 4");
      expect(f1.explanation).toContain("Novo candidato a mínimo");

      // Frame 2: 3 < 1: MANTER
      const f2 = frames[2];
      expect(f2.stepNumber).toBe(2);
      expect(f2.frameType).toBe("INSPECTION");
      expect(f2.values).toEqual([4, 1, 3]);
      expect(f2.targetIndex).toBe(0);
      expect(f2.scanIndex).toBe(2);
      expect(f2.scanValue).toBe(3);
      expect(f2.minIndexBefore).toBe(1);
      expect(f2.minIndex).toBe(1); // Mantido em 1
      expect(f2.isNewMin).toBe(false);
      expect(f2.actionLabel).toBe("MANTER CANDIDATO");
      expect(f2.comparisonText).toBe("3 < 1");
      expect(f2.explanation).toContain("3 ≥ 1");
      expect(f2.explanation).toContain("permanece na posição #2");

      // Frame 3: COMMIT: [1, 4, 3]
      const f3 = frames[3];
      expect(f3.stepNumber).toBe(3);
      expect(f3.frameType).toBe("COMMIT");
      expect(f3.values).toEqual([1, 4, 3]);
      expect(f3.targetIndex).toBe(0);
      expect(f3.scanIndex).toBeNull();
      expect(f3.minIndex).toBe(1);
      expect(f3.didSwap).toBe(true);
      expect(f3.sortedIndices).toEqual([0]);
      expect(f3.actionLabel).toBe("TRANSFERÊNCIA (SWAP)");
      expect(f3.explanation).toContain("Transferência de menor carga");

      // Frame 4: 3 < 4: NOVO MÍNIMO
      const f4 = frames[4];
      expect(f4.stepNumber).toBe(4);
      expect(f4.frameType).toBe("INSPECTION");
      expect(f4.values).toEqual([1, 4, 3]);
      expect(f4.targetIndex).toBe(1);
      expect(f4.scanIndex).toBe(2);
      expect(f4.scanValue).toBe(3);
      expect(f4.minValue).toBe(4);
      expect(f4.minIndexBefore).toBe(1);
      expect(f4.minIndex).toBe(2); // Atualizado para 2
      expect(f4.isNewMin).toBe(true);
      expect(f4.actionLabel).toBe("NOVO MÍNIMO");
      expect(f4.comparisonText).toBe("3 < 4");

      // Frame 5: COMMIT: [1, 3, 4]
      const f5 = frames[5];
      expect(f5.stepNumber).toBe(5);
      expect(f5.frameType).toBe("COMMIT");
      expect(f5.values).toEqual([1, 3, 4]);
      expect(f5.targetIndex).toBe(1);
      expect(f5.scanIndex).toBeNull();
      expect(f5.minIndex).toBe(2);
      expect(f5.didSwap).toBe(true);
      expect(f5.sortedIndices).toEqual([0, 1, 2]);
      expect(f5.actionLabel).toBe("TRANSFERÊNCIA (SWAP)");
      expect(f5.explanation).toContain("Transferência de menor carga");
    });
  });

  describe("Distinção no COMMIT: Troca Real vs Consolidação Sem Troca", () => {
    it("deve rotular corretamente como CONSOLIDAÇÃO DIRETA (SEM TROCA) quando minIndex === i", () => {
      const initial = [1, 2, 3];
      let state = createSelectionSortState(initial);

      while (!state.completed) {
        state = executeSelectionStep(state);
      }

      const frames = buildSelectionReplayFrames(initial, state.history);

      // Em [1, 2, 3], todos os commits ocorrem sem troca (1 já está em 0, 2 já está em 1)
      const commitFrames = frames.filter((f) => f.frameType === "COMMIT");
      expect(commitFrames.length).toBeGreaterThan(0);

      for (const commitFrame of commitFrames) {
        expect(commitFrame.didSwap).toBe(false);
        expect(commitFrame.actionLabel).toBe("CONSOLIDAÇÃO DIRETA (SEM TROCA)");
        expect(commitFrame.comparisonText).toContain("=");
        expect(commitFrame.explanation).toContain("Consolidação direta");
      }
    });

    it("deve rotular como TRANSFERÊNCIA (SWAP) quando minIndex !== i", () => {
      const initial = [3, 2, 1];
      let state = createSelectionSortState(initial);

      while (!state.completed) {
        state = executeSelectionStep(state);
      }

      const frames = buildSelectionReplayFrames(initial, state.history);
      const swapCommitFrames = frames.filter(
        (f) => f.frameType === "COMMIT" && f.didSwap
      );

      expect(swapCommitFrames.length).toBeGreaterThan(0);
      for (const f of swapCommitFrames) {
        expect(f.actionLabel).toBe("TRANSFERÊNCIA (SWAP)");
        expect(f.comparisonText).toContain("≠");
        expect(f.explanation).toContain("Transferência de menor carga");
      }
    });
  });

  describe("Ausência de Frames Fantasmas e Proporcionalidade Estrita", () => {
    it("deve gerar exatamente history.length + 1 frames para qualquer cenário sem passos artificiais", () => {
      const testCases = [
        [5, 2],
        [1, 2, 3],
        [4, 1, 3],
        [9, 7, 5, 3, 1],
        [2, 4, 6, 8],
      ];

      for (const arr of testCases) {
        let state = createSelectionSortState(arr);
        while (!state.completed) {
          state = executeSelectionStep(state);
        }

        const frames = buildSelectionReplayFrames(arr, state.history);
        expect(frames).toHaveLength(state.history.length + 1);

        // O primeiro frame é sempre INITIAL
        expect(frames[0].frameType).toBe("INITIAL");
        expect(frames[0].stepNumber).toBe(0);

        // Todos os frames subsequentes correspondem 1:1 com os registros do history
        for (let i = 0; i < state.history.length; i++) {
          const frame = frames[i + 1];
          const record = state.history[i];
          expect(frame.stepNumber).toBe(i + 1);
          expect(frame.frameType).toBe(record.type);
          expect(frame.totalSteps).toBe(state.history.length);
        }
      }
    });
  });

  describe("Imutabilidade e Congelamento (Object.freeze)", () => {
    it("deve congelar a lista de frames e todos os arrays internos de cada frame", () => {
      const initial = [4, 1, 3];
      let state = createSelectionSortState(initial);
      while (!state.completed) {
        state = executeSelectionStep(state);
      }

      const frames = buildSelectionReplayFrames(initial, state.history);
      expect(Object.isFrozen(frames)).toBe(true);

      for (const f of frames) {
        expect(Object.isFrozen(f)).toBe(true);
        expect(Object.isFrozen(f.values)).toBe(true);
        expect(Object.isFrozen(f.sortedIndices)).toBe(true);
      }
    });

    it("não deve mutar o array inicial nem o array de histórico original", () => {
      const initial = Object.freeze([4, 1, 3]);
      let state = createSelectionSortState(initial);
      while (!state.completed) {
        state = executeSelectionStep(state);
      }

      const historyClone = [...state.history];
      buildSelectionReplayFrames(initial, state.history);

      expect(initial).toEqual([4, 1, 3]);
      expect(state.history).toEqual(historyClone);
    });
  });

  describe("Determinismo e Pureza Funcional", () => {
    it("deve produzir quadros idênticos em múltiplas invocações puras", () => {
      const initial = [6, 2, 8, 4];
      let state = createSelectionSortState(initial);
      while (!state.completed) {
        state = executeSelectionStep(state);
      }

      const run1 = buildSelectionReplayFrames(initial, state.history);
      const run2 = buildSelectionReplayFrames(initial, state.history);

      expect(run1).toEqual(run2);
    });
  });

  describe("Casos de Borda e Navegação Segura", () => {
    it("deve tratar vetor unitário de forma segura", () => {
      const initial = [42];
      const frames = buildSelectionReplayFrames(initial, []);

      expect(frames).toHaveLength(1);
      expect(frames[0].frameType).toBe("INITIAL");
      expect(frames[0].values).toEqual([42]);
      expect(frames[0].sortedIndices).toEqual([0]);
    });

    it("getSelectionReplayFrame deve aplicar clamp seguro aos limites", () => {
      const initial = [5, 2];
      let state = createSelectionSortState(initial);
      while (!state.completed) {
        state = executeSelectionStep(state);
      }

      const frames = buildSelectionReplayFrames(initial, state.history);
      expect(getSelectionReplayFrame(frames, -5)).toBe(frames[0]);
      expect(getSelectionReplayFrame(frames, 999)).toBe(
        frames[frames.length - 1]
      );
      expect(getSelectionReplayFrame(frames, 1)).toBe(frames[1]);
    });
  });
});
