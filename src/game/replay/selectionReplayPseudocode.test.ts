import { describe, expect, it } from "vitest";
import {
  createSelectionSortState,
  executeSelectionInspection,
  commitSelectionPass,
} from "../sorting/selection/selectionSortEngine";
import { buildSelectionReplayFrames } from "./selectionReplayModel";
import {
  SELECTION_SORT_PSEUDOCODE,
  getSelectionPseudocodeHighlight,
} from "./selectionReplayPseudocode";

describe("SelectionReplayPseudocode", () => {
  describe("Modelo Canônico de Pseudocódigo (13 instruções)", () => {
    it("deve conter exatamente 13 instruções canônicas ordenadas com identificadores semânticos corretos", () => {
      expect(SELECTION_SORT_PSEUDOCODE).toHaveLength(13);

      const expectedIds = [
        "PROCEDURE",
        "OUTER_LOOP",
        "INIT_MIN",
        "INNER_LOOP",
        "IF_CONDITION",
        "UPDATE_MIN",
        "END_IF",
        "END_INNER",
        "CHECK_SWAP",
        "SWAP_STATEMENT",
        "END_IF_SWAP",
        "END_OUTER",
        "END_PROCEDURE",
      ];

      SELECTION_SORT_PSEUDOCODE.forEach((line, idx) => {
        expect(line.lineNumber).toBe(idx + 1);
        expect(line.id).toBe(expectedIds[idx]);
        expect(typeof line.text).toBe("string");
        expect(line.text.length).toBeGreaterThan(0);
        expect(typeof line.indent).toBe("number");
        expect(Object.isFrozen(line)).toBe(true);
      });

      expect(Object.isFrozen(SELECTION_SORT_PSEUDOCODE)).toBe(true);
    });

    it("deve incluir as 5 instruções semânticas chave exigidas pelo protocolo", () => {
      const initMin = SELECTION_SORT_PSEUDOCODE.find(
        (l) => l.id === "INIT_MIN"
      );
      expect(initMin?.text).toBe("minIndex ← i");

      const ifCond = SELECTION_SORT_PSEUDOCODE.find(
        (l) => l.id === "IF_CONDITION"
      );
      expect(ifCond?.text).toBe("se A[j] < A[minIndex] então");

      const updateMin = SELECTION_SORT_PSEUDOCODE.find(
        (l) => l.id === "UPDATE_MIN"
      );
      expect(updateMin?.text).toBe("minIndex ← j");

      const checkSwap = SELECTION_SORT_PSEUDOCODE.find(
        (l) => l.id === "CHECK_SWAP"
      );
      expect(checkSwap?.text).toBe("se minIndex ≠ i então");

      const swapStmt = SELECTION_SORT_PSEUDOCODE.find(
        (l) => l.id === "SWAP_STATEMENT"
      );
      expect(swapStmt?.text).toBe("trocar A[i] e A[minIndex]");
    });
  });

  describe("Destaque Semântico e Contexto Concreto por Tipo de Frame", () => {
    it("Frame INITIAL deve destacar PROCEDURE e apresentar contexto inicial limpo", () => {
      const frames = buildSelectionReplayFrames([4, 1, 3], []);
      const highlight = getSelectionPseudocodeHighlight(frames[0]);

      expect(highlight.primaryLineId).toBe("PROCEDURE");
      expect(highlight.activeLineIds).toEqual(["PROCEDURE"]);
      expect(highlight.conditionLineId).toBeNull();
      expect(highlight.conditionResult).toBeNull();
      expect(highlight.swapExecuted).toBe(false);
      expect(highlight.concreteContext.comparisonText).toBe("—");
      expect(highlight.concreteContext.actionTakenText).toContain("Início");
      expect(Object.isFrozen(highlight)).toBe(true);
      expect(Object.isFrozen(highlight.concreteContext)).toBe(true);
    });

    it("Frame INSPECTION com NOVO MÍNIMO deve destacar UPDATE_MIN e avaliar IF_CONDITION como TRUE", () => {
      let state = createSelectionSortState([4, 1, 3]);
      state = executeSelectionInspection(state, "SELECT_NEW_MIN").state;

      const frames = buildSelectionReplayFrames([4, 1, 3], state.history);
      const frame1 = frames[1];
      const highlight = getSelectionPseudocodeHighlight(frame1);

      expect(highlight.primaryLineId).toBe("UPDATE_MIN");
      expect(highlight.activeLineIds).toContain("IF_CONDITION");
      expect(highlight.activeLineIds).toContain("UPDATE_MIN");
      expect(highlight.conditionLineId).toBe("IF_CONDITION");
      expect(highlight.conditionResult).toBe("TRUE");
      expect(highlight.swapExecuted).toBe(false);

      expect(highlight.concreteContext.i).toBe(0);
      expect(highlight.concreteContext.j).toBe(1);
      expect(highlight.concreteContext.scanValue).toBe(1);
      expect(highlight.concreteContext.minValue).toBe(4);
      expect(highlight.concreteContext.comparisonText).toBe("1 < 4 (A[1] < A[0])");
      expect(highlight.concreteContext.actionTakenText).toContain("NOVO MÍNIMO");
    });

    it("Frame INSPECTION mantendo candidato deve destacar IF_CONDITION como FALSE e não ativar UPDATE_MIN", () => {
      let state = createSelectionSortState([4, 1, 3]);
      state = executeSelectionInspection(state, "SELECT_NEW_MIN").state;
      state = executeSelectionInspection(state, "KEEP_MIN").state;

      const frames = buildSelectionReplayFrames([4, 1, 3], state.history);
      const frame2 = frames[2];
      const highlight = getSelectionPseudocodeHighlight(frame2);

      expect(highlight.primaryLineId).toBe("IF_CONDITION");
      expect(highlight.activeLineIds).toContain("IF_CONDITION");
      expect(highlight.activeLineIds).not.toContain("UPDATE_MIN");
      expect(highlight.conditionLineId).toBe("IF_CONDITION");
      expect(highlight.conditionResult).toBe("FALSE");
      expect(highlight.swapExecuted).toBe(false);

      expect(highlight.concreteContext.j).toBe(2);
      expect(highlight.concreteContext.scanValue).toBe(3);
      expect(highlight.concreteContext.minValue).toBe(1);
      expect(highlight.concreteContext.comparisonText).toBe("3 < 1 (A[2] < A[1])");
      expect(highlight.concreteContext.actionTakenText).toContain("MANTER CANDIDATO");
    });

    it("Frame COMMIT com permuta física deve destacar SWAP_STATEMENT, ativar CHECK_SWAP como TRUE e indicar swapExecuted: true", () => {
      let state = createSelectionSortState([4, 1, 3]);
      state = executeSelectionInspection(state, "SELECT_NEW_MIN").state;
      state = executeSelectionInspection(state, "KEEP_MIN").state;
      state = commitSelectionPass(state).state;

      const frames = buildSelectionReplayFrames([4, 1, 3], state.history);
      const frame3 = frames[3]; // Commit da passada 0
      const highlight = getSelectionPseudocodeHighlight(frame3);

      expect(highlight.primaryLineId).toBe("SWAP_STATEMENT");
      expect(highlight.activeLineIds).toContain("CHECK_SWAP");
      expect(highlight.activeLineIds).toContain("SWAP_STATEMENT");
      expect(highlight.conditionLineId).toBe("CHECK_SWAP");
      expect(highlight.conditionResult).toBe("TRUE");
      expect(highlight.swapExecuted).toBe(true);

      expect(highlight.concreteContext.i).toBe(0);
      expect(highlight.concreteContext.minIndex).toBe(1);
      expect(highlight.concreteContext.comparisonText).toContain("1 ≠ 0");
      expect(highlight.concreteContext.actionTakenText).toContain("TRANSFERÊNCIA");
    });

    it("Frame COMMIT sem troca deve destacar CHECK_SWAP como FALSE e não executar SWAP_STATEMENT", () => {
      let state = createSelectionSortState([1, 4, 3]); // 1 já é o menor na posição 0
      state = executeSelectionInspection(state, "KEEP_MIN").state;
      state = executeSelectionInspection(state, "KEEP_MIN").state;
      state = commitSelectionPass(state).state;

      const frames = buildSelectionReplayFrames([1, 4, 3], state.history);
      const frame3 = frames[3];
      const highlight = getSelectionPseudocodeHighlight(frame3);

      expect(highlight.primaryLineId).toBe("CHECK_SWAP");
      expect(highlight.activeLineIds).toContain("CHECK_SWAP");
      expect(highlight.activeLineIds).not.toContain("SWAP_STATEMENT");
      expect(highlight.conditionLineId).toBe("CHECK_SWAP");
      expect(highlight.conditionResult).toBe("FALSE");
      expect(highlight.swapExecuted).toBe(false);

      expect(highlight.concreteContext.comparisonText).toContain("=");
      expect(highlight.concreteContext.actionTakenText).toContain("CONSOLIDAÇÃO DIRETA");
    });
  });

  describe("Sincronização Completa com o Cenário Canônico [4, 1, 3]", () => {
    it("deve sincronizar com perfeição todos os 6 frames do cenário canônico", () => {
      let state = createSelectionSortState([4, 1, 3]);
      state = executeSelectionInspection(state, "SELECT_NEW_MIN").state;
      state = executeSelectionInspection(state, "KEEP_MIN").state;
      state = commitSelectionPass(state).state;
      state = executeSelectionInspection(state, "SELECT_NEW_MIN").state;
      state = commitSelectionPass(state).state;

      const frames = buildSelectionReplayFrames([4, 1, 3], state.history);
      expect(frames).toHaveLength(6);

      // Frame 0: INITIAL -> PROCEDURE
      const h0 = getSelectionPseudocodeHighlight(frames[0]);
      expect(h0.primaryLineId).toBe("PROCEDURE");

      // Frame 1: 1 < 4 -> UPDATE_MIN
      const h1 = getSelectionPseudocodeHighlight(frames[1]);
      expect(h1.primaryLineId).toBe("UPDATE_MIN");
      expect(h1.conditionResult).toBe("TRUE");
      expect(h1.activeLineIds).toContain("INIT_MIN"); // Primeira inspeção da passada inclui INIT_MIN

      // Frame 2: 3 < 1 -> IF_CONDITION (FALSE)
      const h2 = getSelectionPseudocodeHighlight(frames[2]);
      expect(h2.primaryLineId).toBe("IF_CONDITION");
      expect(h2.conditionResult).toBe("FALSE");

      // Frame 3: COMMIT: [1, 4, 3] -> SWAP_STATEMENT
      const h3 = getSelectionPseudocodeHighlight(frames[3]);
      expect(h3.primaryLineId).toBe("SWAP_STATEMENT");
      expect(h3.swapExecuted).toBe(true);

      // Frame 4: 3 < 4 -> UPDATE_MIN
      const h4 = getSelectionPseudocodeHighlight(frames[4]);
      expect(h4.primaryLineId).toBe("UPDATE_MIN");
      expect(h4.conditionResult).toBe("TRUE");
      expect(h4.activeLineIds).toContain("INIT_MIN"); // Primeira inspeção da passada 1

      // Frame 5: COMMIT: [1, 3, 4] -> SWAP_STATEMENT
      const h5 = getSelectionPseudocodeHighlight(frames[5]);
      expect(h5.primaryLineId).toBe("SWAP_STATEMENT");
      expect(h5.swapExecuted).toBe(true);
    });
  });

  describe("Replay QA Específico: Uso Estrito de minIndexBefore na Comparação Factual (P2.1-F)", () => {
    it("quando INSPECTION encontra novo mínimo em [4, 1, 3] com j=1, comparisonText usa minIndexBefore (0) e exibe 1 < 4, nunca 1 < 1", () => {
      let state = createSelectionSortState([4, 1, 3]);
      state = executeSelectionInspection(state, "SELECT_NEW_MIN").state;

      const frames = buildSelectionReplayFrames([4, 1, 3], state.history);
      const frame1 = frames[1];

      // Verificação no registro factual gravado da FSM
      const stepRecord = state.history[0];
      expect(stepRecord.type).toBe("INSPECTION");
      if (stepRecord.type === "INSPECTION") {
        expect(stepRecord.minIndexBefore).toBe(0);
        expect(stepRecord.minIndexAfter).toBe(1);
        expect(stepRecord.isNewMinFound).toBe(true);
      }

      // Verificação estrutural do frame de replay
      expect(frame1.frameType).toBe("INSPECTION");
      expect(frame1.targetIndex).toBe(0);
      expect(frame1.scanIndex).toBe(1);
      expect(frame1.minIndexBefore).toBe(0);
      expect(frame1.minIndex).toBe(1); // Candidato atualizado após a inspeção
      expect(frame1.scanValue).toBe(1);
      expect(frame1.minValue).toBe(4); // Factual de A[minIndexBefore]
      expect(frame1.comparisonText).toBe("1 < 4");
      expect(frame1.comparisonText).not.toBe("1 < 1");

      // Verificação do contexto no pseudocódigo sincronizado
      const highlight = getSelectionPseudocodeHighlight(frame1);
      expect(highlight.concreteContext.comparisonText).toBe("1 < 4 (A[1] < A[0])");
      expect(highlight.concreteContext.comparisonText).not.toContain("1 < 1");
      expect(highlight.concreteContext.minValue).toBe(4);
      expect(highlight.concreteContext.scanValue).toBe(1);
      expect(highlight.concreteContext.i).toBe(0);
      expect(highlight.concreteContext.j).toBe(1);
      expect(highlight.conditionResult).toBe("TRUE");
      expect(highlight.primaryLineId).toBe("UPDATE_MIN");
    });
  });
});

