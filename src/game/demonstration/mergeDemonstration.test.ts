import { describe, it, expect } from "vitest";
import {
  CURATED_MERGE_DEMO_ARRAY,
  runMergeDemonstration,
  getDemonstrationExecution,
} from "./index";
import {
  deriveMergeFramesFromHistory,
  reconstructMergeStateFromHistory,
  reconstructMergeStepAt,
} from "../sorting/merge";

describe("Modo Demonstração Educacional — Merge Sort (P3.1-C)", () => {
  describe("Vetor Curado Fixo", () => {
    it("vetor curado do Merge Sort possui 4 elementos [7, 2, 5, 3] e está congelado", () => {
      expect(CURATED_MERGE_DEMO_ARRAY).toEqual([7, 2, 5, 3]);
      expect(Object.isFrozen(CURATED_MERGE_DEMO_ARRAY)).toBe(true);
    });
  });

  describe("Geração Canônica de Demonstração — Merge Sort", () => {
    it("executa o Merge Sort de forma autônoma até o estado completo", () => {
      const demo = runMergeDemonstration();

      expect(demo.protocol).toBe("merge");
      expect(demo.initialArray).toEqual([7, 2, 5, 3]);
      expect(demo.finalValues).toEqual([2, 3, 5, 7]);
      expect(demo.completed).toBe(true);

      // Verificação estrita das métricas teóricas canônicas
      expect(demo.comparisons).toBe(5);
      expect(demo.writesInBuffer).toBe(8);
      expect(demo.writesInMain).toBe(8);
      expect(demo.totalWrites).toBe(16);
    });

    it("ponto de entrada getDemonstrationExecution('merge') despacha para a execução canônica", () => {
      const demo = getDemonstrationExecution("merge");
      expect(demo.protocol).toBe("merge");
      expect(demo.initialArray).toEqual([7, 2, 5, 3]);
      expect(demo.finalValues).toEqual([2, 3, 5, 7]);
      expect(demo.completed).toBe(true);
    });

    it("histórico preserva todos os eventos automáticos e decisões interativas", () => {
      const demo = runMergeDemonstration();
      const history = demo.history;

      // Confere a presença de todos os tipos de eventos
      const divides = history.filter((s) => s.type === "DIVIDE");
      const inits = history.filter((s) => s.type === "MERGE_INIT");
      const dispatches = history.filter((s) => s.type === "DISPATCH");
      const drains = history.filter((s) => s.type === "DRAIN");
      const copyBacks = history.filter((s) => s.type === "COPY_BACK");

      expect(divides.length).toBe(3);   // [0..3], [0..1], [2..3]
      expect(inits.length).toBe(3);     // [0..1], [2..3], [0..3]
      expect(dispatches.length).toBe(5); // 1 na esq, 1 na dir, 3 na raiz
      expect(drains.length).toBe(3);     // 1 na esq, 1 na dir, 1 na raiz
      expect(copyBacks.length).toBe(3); // 2 locais ORD e 1 raiz OK

      // Total de eventos gravados no histórico (3+3+5+3+3 = 17)
      expect(history.length).toBe(17);
    });

    it("todas as etapas possuem explicações pedagógicas factuais em português", () => {
      const demo = runMergeDemonstration();

      for (const step of demo.history) {
        expect(typeof step.explanation).toBe("string");
        expect(step.explanation.length).toBeGreaterThan(10);
      }
    });
  });

  describe("Reconstrução de Quadros Visuais (Visual Frames) sem Reexecutar a Engine", () => {
    it("reconstructMergeStateFromHistory retorna métricas, valores finais e lista de quadros visuais", () => {
      const demo = runMergeDemonstration();
      const initialElements = demo.history[0].valuesSnapshot;
      const reconstructed = reconstructMergeStateFromHistory(
        initialElements,
        demo.history,
      );

      expect(reconstructed.finalValues.map((e) => e.value)).toEqual([2, 3, 5, 7]);
      expect(reconstructed.totalComparisons).toBe(5);
      expect(reconstructed.totalBufferWrites).toBe(8);
      expect(reconstructed.totalMainWrites).toBe(8);
      expect(reconstructed.totalWrites).toBe(16);
      expect(reconstructed.divideCount).toBe(3);
      expect(reconstructed.mergeInitCount).toBe(3);
      expect(reconstructed.copyBackCount).toBe(3);

      expect(reconstructed.frames).toHaveLength(demo.history.length);
    });

    it("cada quadro visual reconstrói intervalo, fase, ponteiros (p1, p2, k) e snapshots", () => {
      const demo = runMergeDemonstration();
      const initialElements = demo.history[0].valuesSnapshot;
      const frames = deriveMergeFramesFromHistory(initialElements, demo.history);

      expect(frames).toHaveLength(demo.history.length);

      // Quadro 0: DIVIDE [0..3]
      const frame0 = frames[0];
      expect(frame0.type).toBe("DIVIDE");
      expect(frame0.phase).toBe("DIVIDE_AUTOMATIC");
      expect(frame0.activeInterval).toBeDefined();
      expect(frame0.activeInterval?.left).toBe(0);
      expect(frame0.activeInterval?.right).toBe(3);

      // Quadro MERGE_INIT [0..1]
      const initFrame = frames.find((f) => f.type === "MERGE_INIT");
      expect(initFrame).toBeDefined();
      expect(initFrame?.phase).toBe("COMPARE_HEADS");
      expect(initFrame?.p1).toBe(0);
      expect(initFrame?.p2).toBe(1);
      expect(initFrame?.k).toBe(0);
      expect(initFrame?.buffer).toEqual([null, null]);

      // Quadro da Cópia de Retorno da Raiz
      const rootCopyBackFrame = frames.find(
        (f) => f.type === "COPY_BACK" && f.isRootMerge,
      );
      expect(rootCopyBackFrame).toBeDefined();
      expect(rootCopyBackFrame?.phase).toBe("COMPLETED");
      expect(rootCopyBackFrame?.cumulativeComparisons).toBe(5);
      expect(rootCopyBackFrame?.cumulativeTotalWrites).toBe(16);
    });

    it("reconstructMergeStepAt recupera qualquer passo arbitrário sem reexecutar a ordenação", () => {
      const demo = runMergeDemonstration();
      const initialElements = demo.history[0].valuesSnapshot;

      const frame5 = reconstructMergeStepAt(initialElements, demo.history, 5);
      expect(frame5).not.toBeNull();
      expect(frame5?.stepIndex).toBe(5);

      const invalidFrame = reconstructMergeStepAt(
        initialElements,
        demo.history,
        999,
      );
      expect(invalidFrame).toBeNull();
    });
  });
});
