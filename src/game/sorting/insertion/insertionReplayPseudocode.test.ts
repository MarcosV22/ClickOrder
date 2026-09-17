import { describe, it, expect } from "vitest";
import {
  INSERTION_SORT_PSEUDOCODE,
  getInsertionPseudocodeHighlight,
} from "./insertionReplayPseudocode";
import { buildInsertionReplayFrames } from "./insertionReplayModel";
import { runInsertionDemonstration } from "../../demonstration/insertionDemonstration";

describe("Insertion Replay Pseudocode Synchronization (P2.2-E)", () => {
  describe("1. Catálogo do Pseudocódigo Canônico de 11 Instruções", () => {
    it("possui exatamente as 11 instruções estruturadas com seus IDs canônicos", () => {
      expect(INSERTION_SORT_PSEUDOCODE).toHaveLength(11);

      const expectedIds = [
        "PROCEDURE",
        "OUTER_LOOP",
        "LIFT_KEY",
        "INIT_J",
        "WHILE_CONDITION",
        "SHIFT_RIGHT",
        "DECREMENT_J",
        "END_WHILE",
        "INSERT_KEY",
        "END_OUTER",
        "END_PROCEDURE",
      ];

      const actualIds = INSERTION_SORT_PSEUDOCODE.map((line) => line.id);
      expect(actualIds).toEqual(expectedIds);

      // Verificação de numeração 1 a 11
      INSERTION_SORT_PSEUDOCODE.forEach((line, index) => {
        expect(line.lineNumber).toBe(index + 1);
        expect(typeof line.text).toBe("string");
        expect(line.text.length).toBeGreaterThan(0);
      });
    });
  });

  describe("2. Destaque Semântico e Mapeamento de Linhas por Tipo de Quadro", () => {
    const demo = runInsertionDemonstration();
    const frames = buildInsertionReplayFrames(demo.initialArray, demo.history);

    it("destaca PROCEDURE no quadro inicial INITIAL", () => {
      const initialFrame = frames[0];
      const highlight = getInsertionPseudocodeHighlight(initialFrame);

      expect(highlight.primaryLineId).toBe("PROCEDURE");
      expect(highlight.activeLineIds).toContain("PROCEDURE");
      expect(highlight.conditionLineId).toBeNull();
      expect(highlight.conditionResult).toBeNull();
      expect(highlight.concreteContext.i).toBeNull();
      expect(highlight.concreteContext.orderedBoundary).toBe(0);
    });

    it("destaca LIFT_KEY como linha principal nos quadros KEY_LIFT", () => {
      const liftFrame = frames.find((f) => f.frameType === "KEY_LIFT");
      expect(liftFrame).toBeDefined();

      if (liftFrame) {
        const highlight = getInsertionPseudocodeHighlight(liftFrame);
        expect(highlight.primaryLineId).toBe("LIFT_KEY");
        expect(highlight.activeLineIds).toContain("OUTER_LOOP");
        expect(highlight.activeLineIds).toContain("LIFT_KEY");
        expect(highlight.activeLineIds).toContain("INIT_J");
        expect(highlight.concreteContext.key).toBe(liftFrame.key);
        expect(highlight.concreteContext.holeIndex).toBe(liftFrame.holeIndex);
      }
    });

    it("destaca SHIFT_RIGHT como linha principal e WHILE_CONDITION como verdadeira nos quadros SHIFT", () => {
      const shiftFrame = frames.find((f) => f.frameType === "SHIFT");
      expect(shiftFrame).toBeDefined();

      if (shiftFrame) {
        const highlight = getInsertionPseudocodeHighlight(shiftFrame);
        expect(highlight.primaryLineId).toBe("SHIFT_RIGHT");
        expect(highlight.activeLineIds).toContain("WHILE_CONDITION");
        expect(highlight.activeLineIds).toContain("SHIFT_RIGHT");
        expect(highlight.activeLineIds).toContain("DECREMENT_J");
        expect(highlight.conditionLineId).toBe("WHILE_CONDITION");
        expect(highlight.conditionResult).toBe("TRUE");
        expect(highlight.concreteContext.comparedValue).toBe(shiftFrame.comparedValue);
        expect(highlight.concreteContext.key).toBe(shiftFrame.key);
      }
    });

    it("destaca INSERT_KEY como linha principal e WHILE_CONDITION como falsa nos quadros CONDITION_FALSE", () => {
      const condFalseFrame = frames.find(
        (f) => f.frameType === "INSERT" && f.insertReason === "CONDITION_FALSE"
      );
      expect(condFalseFrame).toBeDefined();

      if (condFalseFrame) {
        const highlight = getInsertionPseudocodeHighlight(condFalseFrame);
        expect(highlight.primaryLineId).toBe("INSERT_KEY");
        expect(highlight.conditionLineId).toBe("WHILE_CONDITION");
        expect(highlight.conditionResult).toBe("FALSE");
        expect(highlight.concreteContext.comparedValue).toBe(condFalseFrame.comparedValue);
      }
    });

    it("destaca INSERT_KEY como linha principal e condição HEAD_REACHED nos quadros HEAD_REACHED", () => {
      const headFrame = frames.find(
        (f) => f.frameType === "INSERT" && f.insertReason === "HEAD_REACHED"
      );
      expect(headFrame).toBeDefined();

      if (headFrame) {
        const highlight = getInsertionPseudocodeHighlight(headFrame);
        expect(highlight.primaryLineId).toBe("INSERT_KEY");
        expect(highlight.conditionLineId).toBe("WHILE_CONDITION");
        expect(highlight.conditionResult).toBe("HEAD_REACHED");
        expect(highlight.concreteContext.j).toBe(-1);
        expect(highlight.concreteContext.comparisonText).toBe("j < 0 • CABECEIRA ALCANÇADA");
      }
    });

    it("inclui encerramento do laço e do procedimento no último quadro completado", () => {
      const lastFrame = frames[frames.length - 1];
      expect(lastFrame.isCompleted).toBe(true);

      const highlight = getInsertionPseudocodeHighlight(lastFrame);
      expect(highlight.activeLineIds).toContain("END_OUTER");
      expect(highlight.activeLineIds).toContain("END_PROCEDURE");
    });
  });

  describe("3. Imutabilidade e Integridade dos Destaques", () => {
    it("todos os objetos de destaque e listas de identificadores são congelados", () => {
      const demo = runInsertionDemonstration();
      const frames = buildInsertionReplayFrames(demo.initialArray, demo.history);

      for (const frame of frames) {
        const highlight = getInsertionPseudocodeHighlight(frame);
        expect(Object.isFrozen(highlight)).toBe(true);
        expect(Object.isFrozen(highlight.activeLineIds)).toBe(true);
        expect(Object.isFrozen(highlight.concreteContext)).toBe(true);
      }
    });
  });
});
