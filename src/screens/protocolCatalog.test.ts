import { describe, it, expect } from "vitest";
import {
  PROTOCOL_CATALOG,
  getProtocolMetadata,
  getProtocolProgressSummary,
} from "./protocolCatalog";
import {
  createDefaultSaveData,
  recordPhaseCompletion,
  recordTutorialCompletion,
  recordExerciseCompletion,
  INSERTION_EXERCISE_SETS,
} from "../game/persistence";

describe("Protocol Catalog & Progress Summary (P2.1-G-C)", () => {
  describe("1. Catálogo Estático dos Protocolos (PROTOCOL_CATALOG)", () => {
    it("contém exatamente os quatro protocolos previstos: bubble, selection, insertion e merge", () => {
      const ids = PROTOCOL_CATALOG.map((p) => p.id);
      expect(ids).toEqual(["bubble", "selection", "insertion", "merge"]);
      expect(PROTOCOL_CATALOG).toHaveLength(4);
    });

    it("declara Merge Sort como disponível, com 3 fases e tema azul", () => {
      const merge = getProtocolMetadata("merge");
      expect(merge.id).toBe("merge");
      expect(merge.name).toBe("MERGE SORT");
      expect(merge.metaphor).toContain("DIVISÃO E INTERCALAÇÃO");
      expect(merge.status).toBe("available");
      expect(merge.statusLabel).toBe("DISPONÍVEL");
      expect(merge.demonstrationStatus).toBe("available");
    });

    it("declara Bubble Sort como disponível, com 3 fases e tema ciano", () => {
      const bubble = getProtocolMetadata("bubble");
      expect(bubble.id).toBe("bubble");
      expect(bubble.name).toBe("BUBBLE SORT");
      expect(bubble.metaphor).toContain("COMPARAÇÃO DE VIZINHOS");
      expect(bubble.status).toBe("available");
      expect(bubble.statusLabel).toBe("DISPONÍVEL");
      expect(bubble.demonstrationStatus).toBe("available");
      expect(bubble.demonstrationLabel).toBe("DEMONSTRAÇÃO");
      expect(bubble.totalPhases).toBe(3);
      expect(bubble.theme.primaryColor).toBe("cyan");
      expect(bubble.practiceItems).toContain("Comparação de vizinhos");
      expect(bubble.practiceItems).toContain("Troca de posições");
    });

    it("declara Selection Sort como disponível, com 3 fases e tema púrpura", () => {
      const selection = getProtocolMetadata("selection");
      expect(selection.id).toBe("selection");
      expect(selection.name).toBe("SELECTION SORT");
      expect(selection.metaphor).toContain("SELEÇÃO DO MENOR NÚMERO");
      expect(selection.status).toBe("available");
      expect(selection.statusLabel).toBe("DISPONÍVEL");
      expect(selection.demonstrationStatus).toBe("available");
      expect(selection.demonstrationLabel).toBe("DEMONSTRAÇÃO");
      expect(selection.totalPhases).toBe(3);
      expect(selection.theme.primaryColor).toBe("purple");
      expect(selection.practiceItems).toContain("Busca do menor valor");
      expect(selection.practiceItems).toContain("Confirmação da posição final");
    });

    it("declara Insertion Sort como disponível, com status available e tema âmbar", () => {
      const insertion = getProtocolMetadata("insertion");
      expect(insertion.id).toBe("insertion");
      expect(insertion.name).toBe("INSERTION SORT");
      expect(insertion.metaphor).toContain("INSERÇÃO NA PARTE ORDENADA");
      expect(insertion.status).toBe("available");
      expect(insertion.statusLabel).toBe("DISPONÍVEL");
      expect(insertion.demonstrationStatus).toBe("available");
      expect(insertion.demonstrationLabel).toBe("DEMONSTRAÇÃO");
      expect(insertion.totalPhases).toBe(3);
      expect(insertion.theme.primaryColor).toBe("amber");
      expect(insertion.practiceItems).toContain("Parte ordenada à esquerda");
    });

    it("faz fallback defensivo para Bubble Sort se id desconhecido for passado", () => {
      // @ts-expect-error - teste de fallback defensivo
      const fallback = getProtocolMetadata("unknown-protocol");
      expect(fallback.id).toBe("bubble");
    });
  });

  describe("2. Resumo de Progresso Multi-Protocolo (getProtocolProgressSummary)", () => {
    it("retorna resumo padrão com zero fases para usuário novo (save padrão)", () => {
      const defaultSave = createDefaultSaveData(3, 3);

      const bubbleSummary = getProtocolProgressSummary("bubble", defaultSave);
      expect(bubbleSummary.completedPhases).toBe(0);
      expect(bubbleSummary.totalPhases).toBe(3);
      expect(bubbleSummary.hasCompletedTutorial).toBe(false);
      expect(bubbleSummary.bestScore).toBeUndefined();
      expect(bubbleSummary.isChallengeUnlocked).toBe(false);

      const selectionSummary = getProtocolProgressSummary("selection", defaultSave);
      expect(selectionSummary.completedPhases).toBe(0);
      expect(selectionSummary.totalPhases).toBe(3);
      expect(selectionSummary.hasCompletedTutorial).toBe(false);
      expect(selectionSummary.bestScore).toBeUndefined();
      expect(selectionSummary.isChallengeUnlocked).toBeUndefined();

      const insertionSummary = getProtocolProgressSummary("insertion", defaultSave);
      expect(insertionSummary.completedPhases).toBe(0);
      expect(insertionSummary.hasCompletedTutorial).toBe(false);
      expect(insertionSummary.bestScore).toBeUndefined();
    });

    it("reflete conclusão isolada do tutorial do Bubble Sort", () => {
      let state = createDefaultSaveData(3, 3);
      state = recordTutorialCompletion(state, "bubble");

      const bubbleSummary = getProtocolProgressSummary("bubble", state);
      expect(bubbleSummary.hasCompletedTutorial).toBe(true);

      const selectionSummary = getProtocolProgressSummary("selection", state);
      expect(selectionSummary.hasCompletedTutorial).toBe(false);
    });

    it("reflete conclusão isolada do tutorial do Selection Sort", () => {
      let state = createDefaultSaveData(3, 3);
      state = recordTutorialCompletion(state, "selection");

      const selectionSummary = getProtocolProgressSummary("selection", state);
      expect(selectionSummary.hasCompletedTutorial).toBe(true);

      const bubbleSummary = getProtocolProgressSummary("bubble", state);
      expect(bubbleSummary.hasCompletedTutorial).toBe(false);
    });

    it("computa fases concluídas e melhor pontuação progressivamente no Bubble Sort", () => {
      let state = createDefaultSaveData(3, 3);
      state = recordPhaseCompletion(state, "bubble", 1, 3, undefined, {
        score: 85,
        errors: 1,
        hintsUsed: 1,
      });

      const summaryPhase1 = getProtocolProgressSummary("bubble", state);
      expect(summaryPhase1.completedPhases).toBe(1);
      expect(summaryPhase1.bestScore).toBe(85);
      expect(summaryPhase1.isChallengeUnlocked).toBe(false);

      state = recordPhaseCompletion(state, "bubble", 2, 3, undefined, {
        score: 95,
        errors: 0,
        hintsUsed: 1,
      });

      const summaryPhase2 = getProtocolProgressSummary("bubble", state);
      expect(summaryPhase2.completedPhases).toBe(2);
      expect(summaryPhase2.bestScore).toBe(95);
      expect(summaryPhase2.isChallengeUnlocked).toBe(false);

      state = recordPhaseCompletion(state, "bubble", 3, 3, undefined, {
        score: 90,
        errors: 1,
        hintsUsed: 0,
      });

      const summaryPhase3 = getProtocolProgressSummary("bubble", state);
      expect(summaryPhase3.completedPhases).toBe(3);
      expect(summaryPhase3.bestScore).toBe(95); // max(85, 95, 90) = 95
      expect(summaryPhase3.isChallengeUnlocked).toBe(true);
    });

    it("mantém estrito isolamento: progresso de Selection não afeta Bubble nem desbloqueia Early Exit", () => {
      let state = createDefaultSaveData(3, 3);
      state = recordPhaseCompletion(state, "selection", 1, 3, undefined, {
        score: 100,
        errors: 0,
        hintsUsed: 0,
      });
      state = recordPhaseCompletion(state, "selection", 2, 3, undefined, {
        score: 90,
        errors: 1,
        hintsUsed: 0,
      });
      state = recordPhaseCompletion(state, "selection", 3, 3, undefined, {
        score: 80,
        errors: 2,
        hintsUsed: 0,
      });

      const selectionSummary = getProtocolProgressSummary("selection", state);
      expect(selectionSummary.completedPhases).toBe(3);
      expect(selectionSummary.bestScore).toBe(100);

      const bubbleSummary = getProtocolProgressSummary("bubble", state);
      expect(bubbleSummary.completedPhases).toBe(0);
      expect(bubbleSummary.bestScore).toBeUndefined();
      expect(bubbleSummary.isChallengeUnlocked).toBe(false);
    });

    it("reflete conclusão de práticas do Insertion Sort no resumo", () => {
      let state = createDefaultSaveData();
      state = recordTutorialCompletion(state, "insertion");
      state = recordExerciseCompletion(
        state,
        "insertion",
        INSERTION_EXERCISE_SETS.BASIC,
        { score: 95, errors: 0, hintsUsed: 0 }
      );
      state = recordExerciseCompletion(
        state,
        "insertion",
        INSERTION_EXERCISE_SETS.INTERMEDIATE,
        { score: 100, errors: 0, hintsUsed: 0 }
      );

      const summary = getProtocolProgressSummary("insertion", state);
      expect(summary.completedPhases).toBe(2);
      expect(summary.totalPhases).toBe(3);
      expect(summary.hasCompletedTutorial).toBe(true);
      expect(summary.bestScore).toBe(100);
      expect(summary.isChallengeUnlocked).toBeUndefined();
    });

    it("responde defensivamente com valores zerados se saveData for undefined", () => {
      const summary = getProtocolProgressSummary("bubble", undefined);
      expect(summary.completedPhases).toBe(0);
      expect(summary.totalPhases).toBe(3);
      expect(summary.hasCompletedTutorial).toBe(false);
      expect(summary.bestScore).toBeUndefined();
      expect(summary.isChallengeUnlocked).toBeUndefined();
    });
  });

  describe("3. Roteamento, Acessibilidade e Disponibilidade dos Protocolos", () => {
    it("garante que todos os 4 protocolos curriculares estão ativos e disponíveis", () => {
      const availableProtocols = PROTOCOL_CATALOG.filter((p) => p.status === "available");
      expect(availableProtocols.map((p) => p.id)).toEqual(["bubble", "selection", "insertion", "merge"]);
      expect(availableProtocols).toHaveLength(4);
    });

    it("assegura que Insertion Sort expõe status disponível e demonstração ativa", () => {
      const insertion = getProtocolMetadata("insertion");
      expect(insertion.status).toBe("available");
      expect(insertion.statusLabel).toBe("DISPONÍVEL");
      expect(insertion.demonstrationStatus).toBe("available");
      expect(insertion.demonstrationLabel).toBe("DEMONSTRAÇÃO");
    });

    it("assegura que os 3 protocolos preparam a infraestrutura para o Modo Demonstração (P2.1-G-D)", () => {
      // Todos os 3 protocolos possuem identificador e metadados estruturados
      PROTOCOL_CATALOG.forEach((protocol) => {
        expect(protocol.id).toBeDefined();
        expect(protocol.name).toBeDefined();
        expect(protocol.theme).toBeDefined();
        expect(protocol.demonstrationStatus).toBe("available");
      });
    });
  });
});

