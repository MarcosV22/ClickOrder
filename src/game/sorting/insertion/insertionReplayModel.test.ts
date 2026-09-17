import { describe, it, expect } from "vitest";
import {
  buildInsertionReplayFrames,
  getInsertionReplayFrame,
} from "./insertionReplayModel";
import { runInsertionDemonstration } from "../../demonstration/insertionDemonstration";
import { CURATED_INSERTION_DEMO_ARRAY } from "../../demonstration/curatedArrays";
import type {
  InsertionKeyLiftStepRecord,
  InsertionShiftStepRecord,
  InsertionInsertConditionFalseStepRecord,
  InsertionInsertHeadReachedStepRecord,
} from "./types";

describe("Insertion Replay Model (P2.2-E)", () => {
  describe("1. Invariante Estrutural e Contagem de Quadros", () => {
    it("garante frames.length === 1 + history.length sobre a demonstração canônica", () => {
      const demo = runInsertionDemonstration();
      const frames = buildInsertionReplayFrames(demo.initialArray, demo.history);

      expect(frames.length).toBe(1 + demo.history.length);
      expect(frames[0].frameType).toBe("INITIAL");
      expect(frames[0].stepNumber).toBe(0);
      expect(frames[frames.length - 1].stepNumber).toBe(demo.history.length);
    });

    it("não gera frames fantasmas de comparação, init_j ou decrement_j intermediários", () => {
      const demo = runInsertionDemonstration([4, 2, 3]);
      const frames = buildInsertionReplayFrames([4, 2, 3], demo.history);

      expect(frames.length).toBe(1 + demo.history.length);
      const frameTypes = frames.map((f) => f.frameType);
      // Apenas INITIAL, KEY_LIFT, SHIFT e INSERT são permitidos
      for (const t of frameTypes) {
        expect(["INITIAL", "KEY_LIFT", "SHIFT", "INSERT"]).toContain(t);
      }
    });
  });

  describe("2. Quadro 0: INITIAL", () => {
    it("configura o estado inicial sem vaga aberta, sem chave suspensa e com ORD no primeiro elemento", () => {
      const initial = [6, 3, 5, 2, 7];
      const frames = buildInsertionReplayFrames(initial, []);
      const frame0 = frames[0];

      expect(frame0.stepNumber).toBe(0);
      expect(frame0.frameType).toBe("INITIAL");
      expect(frame0.values).toEqual([6, 3, 5, 2, 7]);
      expect(frame0.holeIndex).toBeNull();
      expect(frame0.key).toBeNull();
      expect(frame0.orderedBoundary).toBe(0); // Primeiro elemento forma região ordenada ORD
      expect(frame0.isCompleted).toBe(false);
      expect(frame0.comparedValue).toBeNull();
      expect(frame0.keyValue).toBeNull();
      expect(frame0.comparisonResult).toBeNull();
      expect(frame0.comparisonText).toBe("Nenhuma comparação ativa");
      expect(frame0.actionLabel).toBe("ESTADO INICIAL");
      expect(frame0.semanticStep).toBe("PROCEDURE");
    });
  });

  describe("3. Quadros KEY_LIFT", () => {
    it("representa a elevação da chave ao trilho e a abertura da vaga física na esteira", () => {
      const initial = [5, 2];
      const record: InsertionKeyLiftStepRecord = {
        type: "KEY_LIFT",
        stepNumber: 1,
        i: 1,
        key: 2,
        keyOriginalIndex: 1,
        holeIndex: 1,
        orderedBoundary: 0,
        valuesSnapshot: [5, null],
        explanation: "A carga 2 foi retirada da esteira...",
      };

      const frames = buildInsertionReplayFrames(initial, [record]);
      const frame = frames[1];

      expect(frame.frameType).toBe("KEY_LIFT");
      expect(frame.passNumber).toBe(1);
      expect(frame.i).toBe(1);
      expect(frame.j).toBe(0); // j = i - 1
      expect(frame.key).toBe(2);
      expect(frame.holeIndex).toBe(1);
      expect(frame.values).toEqual([5, null]);
      expect(frame.orderedBoundary).toBe(0);
      expect(frame.isCompleted).toBe(false);
      expect(frame.actionLabel).toBe("ELEVAÇÃO DA CHAVE");
      expect(frame.semanticStep).toBe("LIFT_KEY");
      expect(frame.comparisonText).toContain("Chave: 2");
    });
  });

  describe("4. Quadros SHIFT", () => {
    it("representa o deslocamento da carga maior para a direita e a translação da vaga", () => {
      const initial = [5, 2];
      const record: InsertionShiftStepRecord = {
        type: "SHIFT",
        stepNumber: 2,
        i: 1,
        j: 0,
        comparedValue: 5,
        keyValue: 2,
        comparisonResult: true,
        holeIndexBefore: 1,
        holeIndexAfter: 0,
        shiftedValue: 5,
        valuesSnapshot: [null, 5],
        explanation: "Carga 5 maior que chave 2...",
      };

      const frames = buildInsertionReplayFrames(initial, [record]);
      const frame = frames[1];

      expect(frame.frameType).toBe("SHIFT");
      expect(frame.i).toBe(1);
      expect(frame.j).toBe(0);
      expect(frame.key).toBe(2);
      expect(frame.holeIndex).toBe(0);
      expect(frame.holeIndexBefore).toBe(1);
      expect(frame.holeIndexAfter).toBe(0);
      expect(frame.shiftedValue).toBe(5);
      expect(frame.comparedValue).toBe(5);
      expect(frame.comparisonResult).toBe(true);
      expect(frame.values).toEqual([null, 5]);
      expect(frame.actionLabel).toBe("DESLOCAMENTO (SHIFT)");
      expect(frame.semanticStep).toBe("SHIFT_RIGHT");
      expect(frame.comparisonText).toBe("A[0] (5) > CHAVE (2) → VERDADEIRO");
    });
  });

  describe("5. Quadros INSERT", () => {
    it("representa parada por CONDITION_FALSE: j >= 0 e A[j] <= chave", () => {
      const initial = [3, 5, 2];
      const record: InsertionInsertConditionFalseStepRecord = {
        type: "INSERT",
        reason: "CONDITION_FALSE",
        stepNumber: 2,
        i: 1,
        j: 0,
        comparedValue: 3,
        keyValue: 5,
        comparisonResult: false,
        insertedIndex: 1,
        insertedValue: 5,
        valuesSnapshot: [3, 5, 2],
        orderedBoundary: 1,
        explanation: "Carga 3 <= chave 5...",
      };

      const frames = buildInsertionReplayFrames(initial, [record]);
      const frame = frames[1];

      expect(frame.frameType).toBe("INSERT");
      expect(frame.insertReason).toBe("CONDITION_FALSE");
      expect(frame.key).toBeNull(); // Chave desceu do trilho
      expect(frame.holeIndex).toBeNull(); // Vaga preenchida
      expect(frame.j).toBe(0);
      expect(frame.comparedValue).toBe(3);
      expect(frame.comparisonResult).toBe(false);
      expect(frame.insertedIndex).toBe(1);
      expect(frame.insertedValue).toBe(5);
      expect(frame.orderedBoundary).toBe(1);
      expect(frame.values).toEqual([3, 5, 2]);
      expect(frame.actionLabel).toBe("ENCAIXE DA CHAVE");
      expect(frame.semanticStep).toBe("INSERT_KEY");
      expect(frame.comparisonText).toBe("A[0] (3) > CHAVE (5) → FALSO");
    });

    it("representa parada por HEAD_REACHED: j < 0 e vaga no índice 0, sem exibir A[-1]", () => {
      const initial = [5, 2];
      const record: InsertionInsertHeadReachedStepRecord = {
        type: "INSERT",
        reason: "HEAD_REACHED",
        stepNumber: 3,
        i: 1,
        j: -1,
        comparedValue: null,
        keyValue: 2,
        comparisonResult: null,
        insertedIndex: 0,
        insertedValue: 2,
        valuesSnapshot: [2, 5],
        orderedBoundary: 1,
        explanation: "Cabeceira alcançada...",
      };

      const frames = buildInsertionReplayFrames(initial, [record]);
      const frame = frames[1];

      expect(frame.frameType).toBe("INSERT");
      expect(frame.insertReason).toBe("HEAD_REACHED");
      expect(frame.j).toBe(-1);
      expect(frame.comparedValue).toBeNull();
      expect(frame.comparisonResult).toBeNull();
      expect(frame.key).toBeNull();
      expect(frame.holeIndex).toBeNull();
      expect(frame.insertedIndex).toBe(0);
      expect(frame.insertedValue).toBe(2);
      expect(frame.actionLabel).toBe("ENCAIXE NA CABECEIRA");
      expect(frame.semanticStep).toBe("INSERT_KEY");
      expect(frame.comparisonText).toBe("j < 0 • CABECEIRA ALCANÇADA");
      // Invariante inegociável: nunca exibir A[-1]
      expect(frame.comparisonText).not.toContain("A[-1]");
      expect(frame.comparisonText).not.toContain("[-1]");
    });
  });

  describe("6. Consolidação e Conclusão do Algoritmo", () => {
    it("marca isCompleted === true exclusivamente no último frame do algoritmo completo", () => {
      const demo = runInsertionDemonstration();
      const frames = buildInsertionReplayFrames(demo.initialArray, demo.history);

      // Todos os quadros intermediários possuem isCompleted === false
      for (let i = 0; i < frames.length - 1; i++) {
        expect(frames[i].isCompleted).toBe(false);
      }

      // Último quadro reflete estabilização total
      const lastFrame = frames[frames.length - 1];
      expect(lastFrame.isCompleted).toBe(true);
      expect(lastFrame.values).toEqual([2, 3, 5, 6, 7]);
      expect(lastFrame.orderedBoundary).toBe(demo.initialArray.length - 1);
    });
  });

  describe("7. Casos de Borda", () => {
    it("trata vetor vazio [] de forma segura", () => {
      const frames = buildInsertionReplayFrames([], []);
      expect(frames).toHaveLength(1);
      expect(frames[0].frameType).toBe("INITIAL");
      expect(frames[0].isCompleted).toBe(true);
      expect(frames[0].orderedBoundary).toBe(-1);
    });

    it("trata vetor unitário [42] de forma segura", () => {
      const frames = buildInsertionReplayFrames([42], []);
      expect(frames).toHaveLength(1);
      expect(frames[0].frameType).toBe("INITIAL");
      expect(frames[0].isCompleted).toBe(true);
      expect(frames[0].orderedBoundary).toBe(0);
      expect(frames[0].values).toEqual([42]);
    });
  });

  describe("8. Determinismo e Imutabilidade", () => {
    it("é 100% determinístico e congela todas as instâncias e subvetores", () => {
      const demo = runInsertionDemonstration();
      const frames1 = buildInsertionReplayFrames(demo.initialArray, demo.history);
      const frames2 = buildInsertionReplayFrames(demo.initialArray, demo.history);

      expect(frames1).toEqual(frames2);
      expect(Object.isFrozen(frames1)).toBe(true);
      for (const frame of frames1) {
        expect(Object.isFrozen(frame)).toBe(true);
        expect(Object.isFrozen(frame.values)).toBe(true);
      }
    });
  });

  describe("9. Acessor Seguro getInsertionReplayFrame", () => {
    it("acessa e clampa índices válidos e fora do intervalo", () => {
      const demo = runInsertionDemonstration();
      const frames = buildInsertionReplayFrames(demo.initialArray, demo.history);

      expect(getInsertionReplayFrame(frames, 0)).toBe(frames[0]);
      expect(getInsertionReplayFrame(frames, 2)).toBe(frames[2]);
      expect(getInsertionReplayFrame(frames, -10)).toBe(frames[0]);
      expect(getInsertionReplayFrame(frames, 9999)).toBe(frames[frames.length - 1]);
    });

    it("lança erro se a lista de quadros estiver vazia", () => {
      expect(() => getInsertionReplayFrame([], 0)).toThrowError(
        /lista de quadros de replay do Insertion Sort está vazia/i
      );
    });
  });
});
