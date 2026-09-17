import { describe, it, expect } from "vitest";
import {
  CURATED_BUBBLE_DEMO_ARRAY,
  CURATED_SELECTION_DEMO_ARRAY,
  CURATED_INSERTION_DEMO_ARRAY,
  runBubbleDemonstration,
  runSelectionDemonstration,
  runInsertionDemonstration,
  getDemonstrationExecution,
} from "./index";

describe("Modo Demonstração Educacional (P2.1-G-D)", () => {
  describe("Vetores Curados Fixos", () => {
    it("vetor curado do Bubble Sort possui 4 elementos e está congelado", () => {
      expect(CURATED_BUBBLE_DEMO_ARRAY).toEqual([5, 2, 4, 1]);
      expect(Object.isFrozen(CURATED_BUBBLE_DEMO_ARRAY)).toBe(true);
    });

    it("vetor curado do Selection Sort possui 3 elementos e está congelado", () => {
      expect(CURATED_SELECTION_DEMO_ARRAY).toEqual([4, 1, 3]);
      expect(Object.isFrozen(CURATED_SELECTION_DEMO_ARRAY)).toBe(true);
    });
  });

  describe("Geração Canônica de Demonstração — Bubble Sort", () => {
    it("executa o Bubble Sort de forma autônoma até o estado completo", () => {
      const demo = runBubbleDemonstration();

      expect(demo.protocol).toBe("bubble");
      expect(demo.initialArray).toEqual([5, 2, 4, 1]);
      expect(demo.finalValues).toEqual([1, 2, 4, 5]);
      expect(demo.completed).toBe(true);
      expect(demo.comparisons).toBe(6); // n*(n-1)/2 = 6
      expect(demo.history.length).toBe(6);
      expect(demo.totalPasses).toBe(3);
    });

    it("contém obrigatoriamente ações de SWAP e KEEP para valor pedagógico", () => {
      const demo = runBubbleDemonstration();
      const swaps = demo.history.filter((s) => s.swapped);
      const keeps = demo.history.filter((s) => !s.swapped);

      expect(swaps.length).toBeGreaterThan(0);
      expect(keeps.length).toBeGreaterThan(0);

      // Na passada 1, índice 0: 2 <= 4 -> KEEP
      const keepStep = demo.history.find(
        (s) => s.passIndex === 1 && s.comparisonIndex === 0
      );
      expect(keepStep).toBeDefined();
      expect(keepStep?.swapped).toBe(false);
      expect(keepStep?.leftValue).toBe(2);
      expect(keepStep?.rightValue).toBe(4);
    });

    it("todas as etapas possuem explicações pedagógicas factuais", () => {
      const demo = runBubbleDemonstration();

      for (const step of demo.history) {
        expect(typeof step.explanation).toBe("string");
        expect(step.explanation.length).toBeGreaterThan(10);
      }
    });

    it("é 100% determinístico entre execuções sucessivas", () => {
      const run1 = runBubbleDemonstration();
      const run2 = runBubbleDemonstration();

      expect(run1.history).toEqual(run2.history);
      expect(run1.finalValues).toEqual(run2.finalValues);
    });
  });

  describe("Geração Canônica de Demonstração — Selection Sort", () => {
    it("executa o Selection Sort de forma autônoma até o estado completo", () => {
      const demo = runSelectionDemonstration();

      expect(demo.protocol).toBe("selection");
      expect(demo.initialArray).toEqual([4, 1, 3]);
      expect(demo.finalValues).toEqual([1, 3, 4]);
      expect(demo.completed).toBe(true);
      expect(demo.comparisons).toBe(3); // n*(n-1)/2 = 3 comparações
      expect(demo.totalPasses).toBe(2);
    });

    it("contém etapas de INSPECTION (SELECT_NEW_MIN e KEEP_MIN) e COMMIT", () => {
      const demo = runSelectionDemonstration();

      const inspections = demo.history.filter((s) => s.type === "INSPECTION");
      const commits = demo.history.filter((s) => s.type === "COMMIT");

      expect(inspections.length).toBe(3);
      expect(commits.length).toBe(2);

      // Inspeções devem demonstrar encontrar novo mínimo e manter candidato
      const newMins = inspections.filter(
        (s) => s.type === "INSPECTION" && s.executedDecision === "SELECT_NEW_MIN"
      );
      const keepMins = inspections.filter(
        (s) => s.type === "INSPECTION" && s.executedDecision === "KEEP_MIN"
      );

      expect(newMins.length).toBeGreaterThan(0);
      expect(keepMins.length).toBeGreaterThan(0);

      // Ambos os commits transferem cargas
      expect(commits.every((c) => c.type === "COMMIT" && c.didSwap)).toBe(true);
    });

    it("todas as etapas possuem explicações pedagógicas factuais", () => {
      const demo = runSelectionDemonstration();

      for (const step of demo.history) {
        expect(typeof step.explanation).toBe("string");
        expect(step.explanation.length).toBeGreaterThan(10);
      }
    });

    it("é 100% determinístico entre execuções sucessivas", () => {
      const run1 = runSelectionDemonstration();
      const run2 = runSelectionDemonstration();

      expect(run1.history).toEqual(run2.history);
      expect(run1.finalValues).toEqual(run2.finalValues);
    });
  });

  describe("Integração com Modelos Derivados de Replay", () => {
    it("deriva frames completos de Replay para a demonstração do Bubble Sort", async () => {
      const { buildReplayFrames } = await import("../replay/replayModel");
      const { getPseudocodeHighlight } = await import("../replay/replayPseudocode");
      const demo = runBubbleDemonstration();
      const frames = buildReplayFrames(demo.initialArray, demo.history);

      expect(frames.length).toBe(demo.history.length + 1); // Estado inicial + 6 passos = 7 frames
      expect(frames[0].action).toBe("INITIAL");
      expect(frames[0].values).toEqual([5, 2, 4, 1]);
      expect(frames[frames.length - 1].values).toEqual([1, 2, 4, 5]);

      // Verifica que todos os frames mapeiam para linhas válidas do pseudocódigo
      for (const frame of frames) {
        const highlight = getPseudocodeHighlight(frame);
        expect(highlight.primaryLineId).toBeDefined();
        expect(highlight.activeLineIds.length).toBeGreaterThan(0);
      }
    });

    it("deriva frames completos de Replay para a demonstração do Selection Sort", async () => {
      const { buildSelectionReplayFrames } = await import("../replay/selectionReplayModel");
      const { getSelectionPseudocodeHighlight } = await import("../replay/selectionReplayPseudocode");
      const demo = runSelectionDemonstration();
      const frames = buildSelectionReplayFrames(demo.initialArray, demo.history);

      expect(frames.length).toBe(demo.history.length + 1); // Estado inicial + 5 passos = 6 frames
      expect(frames[0].frameType).toBe("INITIAL");
      expect(frames[0].values).toEqual([4, 1, 3]);
      expect(frames[frames.length - 1].values).toEqual([1, 3, 4]);

      // Verifica que todos os frames mapeiam para linhas válidas do pseudocódigo
      for (const frame of frames) {
        const highlight = getSelectionPseudocodeHighlight(frame);
        expect(highlight.primaryLineId).toBeDefined();
        expect(highlight.activeLineIds.length).toBeGreaterThan(0);
      }
    });

    it("deriva frames completos de Replay para a demonstração do Insertion Sort", async () => {
      const { buildInsertionReplayFrames } = await import(
        "../sorting/insertion/insertionReplayModel"
      );
      const { getInsertionPseudocodeHighlight } = await import(
        "../sorting/insertion/insertionReplayPseudocode"
      );
      const demo = runInsertionDemonstration();
      const frames = buildInsertionReplayFrames(demo.initialArray, demo.history);

      expect(frames.length).toBe(demo.history.length + 1);
      expect(frames[0].frameType).toBe("INITIAL");
      expect(frames[0].values).toEqual([6, 3, 5, 2, 7]);
      expect(frames[frames.length - 1].values).toEqual([2, 3, 5, 6, 7]);
      expect(frames[frames.length - 1].isCompleted).toBe(true);

      // Verifica que todos os frames mapeiam para linhas válidas do pseudocódigo
      for (const frame of frames) {
        const highlight = getInsertionPseudocodeHighlight(frame);
        expect(highlight.primaryLineId).toBeDefined();
        expect(highlight.activeLineIds.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Garantias Transversais e Não-Mutabilidade", () => {
    it("execuções de demonstração não contêm campos de pontuação de jogo nem penalidades", () => {
      const bubbleDemo = runBubbleDemonstration();
      // @ts-expect-error verificação de ausência de campos de gameplay
      expect(bubbleDemo.score).toBeUndefined();
      // @ts-expect-error verificação de ausência de erros
      expect(bubbleDemo.errors).toBeUndefined();

      const selectionDemo = runSelectionDemonstration();
      // @ts-expect-error verificação de ausência de campos de gameplay
      expect(selectionDemo.score).toBeUndefined();
      // @ts-expect-error verificação de ausência de erros
      expect(selectionDemo.errors).toBeUndefined();

      const insertionDemo = runInsertionDemonstration();
      // @ts-expect-error verificação de ausência de campos de gameplay
      expect(insertionDemo.score).toBeUndefined();
      // @ts-expect-error verificação de ausência de erros
      expect(insertionDemo.errors).toBeUndefined();
    });

    it("execuções de demonstração são puras e não dependem nem alteram o storage", async () => {
      const { createDefaultSaveData } = await import("../persistence");
      const initialSave = createDefaultSaveData(3, 3);
      const snapshot = JSON.stringify(initialSave);

      runBubbleDemonstration();
      runSelectionDemonstration();
      runInsertionDemonstration();
      getDemonstrationExecution("bubble");
      getDemonstrationExecution("selection");
      getDemonstrationExecution("insertion");

      expect(JSON.stringify(initialSave)).toBe(snapshot);
    });
  });

  describe("Helper unificado getDemonstrationExecution", () => {
    it("retorna demonstração do Bubble Sort", () => {
      const demo = getDemonstrationExecution("bubble");
      expect(demo.protocol).toBe("bubble");
      expect(demo.completed).toBe(true);
    });

    it("retorna demonstração do Selection Sort", () => {
      const demo = getDemonstrationExecution("selection");
      expect(demo.protocol).toBe("selection");
      expect(demo.completed).toBe(true);
    });

    it("lança erro para protocolo não suportado", () => {
      expect(() =>
        // @ts-expect-error teste defensivo com protocolo inválido
        getDemonstrationExecution("unknown-protocol")
      ).toThrowError(/não suportado/i);
    });
  });

  describe("Geração Canônica de Demonstração — Insertion Sort (P2.2-C)", () => {
    it("vetor curado do Insertion Sort possui 5 elementos e está congelado", () => {
      expect(CURATED_INSERTION_DEMO_ARRAY).toEqual([6, 3, 5, 2, 7]);
      expect(Object.isFrozen(CURATED_INSERTION_DEMO_ARRAY)).toBe(true);
    });

    it("executa o Insertion Sort de forma autônoma até o estado completo", () => {
      const demo = runInsertionDemonstration();

      expect(demo.protocol).toBe("insertion");
      expect(demo.initialArray).toEqual([6, 3, 5, 2, 7]);
      expect(demo.finalValues).toEqual([2, 3, 5, 6, 7]);
      expect(demo.completed).toBe(true);
      expect(demo.totalPasses).toBe(4);
      expect(demo.insertions).toBe(4);
    });

    it("cobre todos os cenários pedagógicos canônicos: shifts simples e múltiplos, paradas por condição falsa e cabeceira, e passada sem deslocamento", () => {
      const demo = runInsertionDemonstration();

      const keyLifts = demo.history.filter((s) => s.type === "KEY_LIFT");
      const shifts = demo.history.filter((s) => s.type === "SHIFT");
      const inserts = demo.history.filter((s) => s.type === "INSERT");

      expect(keyLifts).toHaveLength(4);
      expect(inserts).toHaveLength(4);
      expect(shifts.length).toBeGreaterThanOrEqual(4);

      // Passada 1 (i=1, key=3): 6 > 3 -> 1 shift -> cabeceira (HEAD_REACHED)
      const insertPass1 = inserts.find((ins) => ins.i === 1);
      expect(insertPass1?.reason).toBe("HEAD_REACHED");
      expect(insertPass1?.insertedIndex).toBe(0);

      // Passada 2 (i=2, key=5): 6 > 5 -> 1 shift -> 3 <= 5 -> CONDITION_FALSE
      const insertPass2 = inserts.find((ins) => ins.i === 2);
      expect(insertPass2?.reason).toBe("CONDITION_FALSE");
      expect(insertPass2?.insertedIndex).toBe(1);

      // Passada 3 (i=3, key=2): 6, 5, 3 > 2 -> 3 shifts sucessivos -> HEAD_REACHED
      const shiftsPass3 = shifts.filter((s) => s.i === 3);
      expect(shiftsPass3.length).toBe(3); // Múltiplos shifts
      const insertPass3 = inserts.find((ins) => ins.i === 3);
      expect(insertPass3?.reason).toBe("HEAD_REACHED");
      expect(insertPass3?.insertedIndex).toBe(0);

      // Passada 4 (i=4, key=7): 6 <= 7 -> zero shifts -> CONDITION_FALSE
      const shiftsPass4 = shifts.filter((s) => s.i === 4);
      expect(shiftsPass4.length).toBe(0); // Passada sem deslocamento (inserção direta imediata)
      const insertPass4 = inserts.find((ins) => ins.i === 4);
      expect(insertPass4?.reason).toBe("CONDITION_FALSE");
      expect(insertPass4?.insertedIndex).toBe(4);
    });

    it("todas as etapas possuem explicações pedagógicas factuais", () => {
      const demo = runInsertionDemonstration();

      for (const step of demo.history) {
        expect(typeof step.explanation).toBe("string");
        expect(step.explanation.length).toBeGreaterThan(10);
      }
    });

    it("é 100% determinístico entre execuções sucessivas", () => {
      const run1 = runInsertionDemonstration();
      const run2 = runInsertionDemonstration();

      expect(run1.history).toEqual(run2.history);
      expect(run1.finalValues).toEqual(run2.finalValues);
      expect(run1.comparisons).toBe(run2.comparisons);
      expect(run1.shifts).toBe(run2.shifts);
    });

    it("getDemonstrationExecution unificado retorna demonstração do Insertion Sort", () => {
      const demo = getDemonstrationExecution("insertion");
      expect(demo.protocol).toBe("insertion");
      expect(demo.completed).toBe(true);
      expect(demo.finalValues).toEqual([2, 3, 5, 6, 7]);
    });
  });
});
