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
} from "../game/persistence";

describe("Protocol Catalog & Progress Summary (P2.1-G-C)", () => {
  describe("1. Catálogo Estático dos Protocolos (PROTOCOL_CATALOG)", () => {
    it("contém exatamente os três protocolos previstos: bubble, selection e insertion", () => {
      const ids = PROTOCOL_CATALOG.map((p) => p.id);
      expect(ids).toEqual(["bubble", "selection", "insertion"]);
      expect(PROTOCOL_CATALOG).toHaveLength(3);
    });

    it("declara Bubble Sort como disponível, com 3 fases e tema ciano", () => {
      const bubble = getProtocolMetadata("bubble");
      expect(bubble.id).toBe("bubble");
      expect(bubble.name).toBe("BUBBLE SORT");
      expect(bubble.metaphor).toContain("PARES VIZINHOS");
      expect(bubble.status).toBe("available");
      expect(bubble.statusLabel).toBe("DISPONÍVEL");
      expect(bubble.demonstrationStatus).toBe("available");
      expect(bubble.demonstrationLabel).toBe("DEMONSTRAÇÃO");
      expect(bubble.totalPhases).toBe(3);
      expect(bubble.theme.primaryColor).toBe("cyan");
      expect(bubble.practiceItems).toContain("Comparação de vizinhos");
      expect(bubble.practiceItems).toContain("Troca física adjacente");
    });

    it("declara Selection Sort como disponível, com 3 fases e tema púrpura", () => {
      const selection = getProtocolMetadata("selection");
      expect(selection.id).toBe("selection");
      expect(selection.name).toBe("SELECTION SORT");
      expect(selection.metaphor).toContain("SCANNER DE CARGA MÍNIMA");
      expect(selection.status).toBe("available");
      expect(selection.statusLabel).toBe("DISPONÍVEL");
      expect(selection.demonstrationStatus).toBe("available");
      expect(selection.demonstrationLabel).toBe("DEMONSTRAÇÃO");
      expect(selection.totalPhases).toBe(3);
      expect(selection.theme.primaryColor).toBe("purple");
      expect(selection.practiceItems).toContain("Varredura da esteira");
      expect(selection.practiceItems).toContain("Transferência pontual no commit");
    });

    it("declara Insertion Sort como EM BREVE, com status coming_soon e tema âmbar", () => {
      const insertion = getProtocolMetadata("insertion");
      expect(insertion.id).toBe("insertion");
      expect(insertion.name).toBe("INSERTION SORT");
      expect(insertion.metaphor).toContain("TRILHO DE INSERÇÃO");
      expect(insertion.status).toBe("coming_soon");
      expect(insertion.statusLabel).toBe("EM BREVE");
      expect(insertion.demonstrationStatus).toBe("coming_soon");
      expect(insertion.demonstrationLabel).toBe("DEMO (EM BREVE)");
      expect(insertion.totalPhases).toBe(3);
      expect(insertion.theme.primaryColor).toBe("amber");
      expect(insertion.practiceItems).toContain("Região ordenada provisória (ORD)");
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

    it("Insertion Sort sempre reporta zero fases e tutorial não concluído de modo seguro", () => {
      const state = createDefaultSaveData(3, 3);
      const summary = getProtocolProgressSummary("insertion", state);
      expect(summary.completedPhases).toBe(0);
      expect(summary.totalPhases).toBe(3);
      expect(summary.hasCompletedTutorial).toBe(false);
      expect(summary.bestScore).toBeUndefined();
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
    it("garante que apenas protocolos disponíveis possuem status operacional ativo", () => {
      const availableProtocols = PROTOCOL_CATALOG.filter((p) => p.status === "available");
      expect(availableProtocols.map((p) => p.id)).toEqual(["bubble", "selection"]);

      const pendingProtocols = PROTOCOL_CATALOG.filter((p) => p.status === "coming_soon");
      expect(pendingProtocols.map((p) => p.id)).toEqual(["insertion"]);
    });

    it("assegura que Insertion Sort não expõe rota ativa de treinamento ou tutorial", () => {
      const insertion = getProtocolMetadata("insertion");
      expect(insertion.status).toBe("coming_soon");
      expect(insertion.statusLabel).toBe("EM BREVE");
      // O algoritmo não está disponível para iniciar treinamento
      expect(insertion.status === "available").toBe(false);
    });

    it("assegura que os 3 protocolos preparam a infraestrutura para o Modo Demonstração (P2.1-G-D)", () => {
      // Todos os 3 protocolos possuem identificador e metadados estruturados
      PROTOCOL_CATALOG.forEach((protocol) => {
        expect(protocol.id).toBeDefined();
        expect(protocol.name).toBeDefined();
        expect(protocol.theme).toBeDefined();
      });
    });
  });
});

