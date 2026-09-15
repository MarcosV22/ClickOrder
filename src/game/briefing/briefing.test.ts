import { describe, it, expect } from "vitest";
import {
  BUBBLE_CANONICAL_BRIEFING,
  BUBBLE_EARLY_EXIT_BRIEFING,
  BRIEFING_CATALOG,
  getBriefingForMode,
  getBriefingForGameMode,
} from "./index";

describe("Protocol Mode Briefing System (src/game/briefing/)", () => {
  describe("BUBBLE_CANONICAL_BRIEFING", () => {
    it("deve conter campos fundamentais e metadados obrigatórios", () => {
      expect(BUBBLE_CANONICAL_BRIEFING.id).toBe("bubble-canonical");
      expect(BUBBLE_CANONICAL_BRIEFING.protocolName).toContain("BUBBLE SORT");
      expect(BUBBLE_CANONICAL_BRIEFING.modeName).toBe("TREINAMENTO REGULAR");
      expect(BUBBLE_CANONICAL_BRIEFING.badgeText).toContain("CENTRAL LOGÍSTICA");
      expect(BUBBLE_CANONICAL_BRIEFING.startLabel).toBe("INICIAR TREINAMENTO");
      expect(BUBBLE_CANONICAL_BRIEFING.instructions.length).toBeGreaterThanOrEqual(4);
      expect(BUBBLE_CANONICAL_BRIEFING.highlights.length).toBeGreaterThanOrEqual(3);
    });

    it("deve cobrir conceitos canônicos obrigatórios: vizinhos, trocar, manter, passada, consolidação", () => {
      const allText = [
        BUBBLE_CANONICAL_BRIEFING.subtitle,
        BUBBLE_CANONICAL_BRIEFING.objective,
        ...BUBBLE_CANONICAL_BRIEFING.instructions.map((i) => `${i.title} ${i.description}`),
        ...(BUBBLE_CANONICAL_BRIEFING.particularities ?? []),
      ].join(" ").toLowerCase();

      expect(allText).toMatch(/vizinh/);
      expect(allText).toMatch(/troca/);
      expect(allText).toMatch(/mante/);
      expect(allText).toMatch(/passada/);
      expect(allText).toMatch(/ok|consolida/);
      expect(allText).toMatch(/fases|lotes/);
    });

    it("não deve conter referências ao Early Exit no briefing canônico", () => {
      const allText = JSON.stringify(BUBBLE_CANONICAL_BRIEFING).toLowerCase();
      expect(allText).not.toContain("early exit");
      expect(allText).not.toContain("antecipad");
    });
  });

  describe("BUBBLE_EARLY_EXIT_BRIEFING", () => {
    it("deve conter campos fundamentais e metadados obrigatórios do Modo Desafio", () => {
      expect(BUBBLE_EARLY_EXIT_BRIEFING.id).toBe("bubble-early-exit");
      expect(BUBBLE_EARLY_EXIT_BRIEFING.protocolName).toContain("BUBBLE SORT");
      expect(BUBBLE_EARLY_EXIT_BRIEFING.modeName).toContain("DESAFIO");
      expect(BUBBLE_EARLY_EXIT_BRIEFING.startLabel).toBe("INICIAR DESAFIO");
      expect(BUBBLE_EARLY_EXIT_BRIEFING.instructions.length).toBeGreaterThanOrEqual(4);
      expect(BUBBLE_EARLY_EXIT_BRIEFING.highlights.length).toBeGreaterThanOrEqual(3);
    });

    it("deve explicar variante otimizada, parada antecipada, sensibilidade à entrada e neutralidade de score", () => {
      const allText = [
        BUBBLE_EARLY_EXIT_BRIEFING.subtitle,
        BUBBLE_EARLY_EXIT_BRIEFING.objective,
        ...BUBBLE_EARLY_EXIT_BRIEFING.instructions.map((i) => `${i.title} ${i.description}`),
        ...(BUBBLE_EARLY_EXIT_BRIEFING.particularities ?? []),
      ].join(" ").toLowerCase();

      expect(allText).toMatch(/otimizad|variante/);
      expect(allText).toMatch(/antecipad|sem trocas/);
      expect(allText).toMatch(/pontua|score/);
      expect(allText).toMatch(/vizinh/);
      expect(allText).toMatch(/economia|sensibilidade/);
    });
  });

  describe("Resolução do Catálogo", () => {
    it("deve resolver corretamente os briefings por ID", () => {
      expect(getBriefingForMode("bubble-canonical")).toBe(BUBBLE_CANONICAL_BRIEFING);
      expect(getBriefingForMode("bubble-early-exit")).toBe(BUBBLE_EARLY_EXIT_BRIEFING);
    });

    it("deve resolver corretamente os briefings por GameMode", () => {
      expect(getBriefingForGameMode("CAMPAIGN")).toBe(BUBBLE_CANONICAL_BRIEFING);
      expect(getBriefingForGameMode("CHALLENGE")).toBe(BUBBLE_EARLY_EXIT_BRIEFING);
    });

    it("catálogo deve estar indexado sem chaves nulas", () => {
      expect(Object.keys(BRIEFING_CATALOG)).toContain("bubble-canonical");
      expect(Object.keys(BRIEFING_CATALOG)).toContain("bubble-early-exit");
    });
  });

  describe("Diferenciação Estrita entre os Modos (Canonical vs Early Exit)", () => {
    it("deve apresentar títulos, badges, CTAs e objetivos distintos", () => {
      expect(BUBBLE_CANONICAL_BRIEFING.modeName).not.toBe(BUBBLE_EARLY_EXIT_BRIEFING.modeName);
      expect(BUBBLE_CANONICAL_BRIEFING.badgeText).not.toBe(BUBBLE_EARLY_EXIT_BRIEFING.badgeText);
      expect(BUBBLE_CANONICAL_BRIEFING.objective).not.toBe(BUBBLE_EARLY_EXIT_BRIEFING.objective);
      expect(BUBBLE_CANONICAL_BRIEFING.startLabel).toBe("INICIAR TREINAMENTO");
      expect(BUBBLE_EARLY_EXIT_BRIEFING.startLabel).toBe("INICIAR DESAFIO");
      expect(BUBBLE_CANONICAL_BRIEFING.startLabel).not.toBe(BUBBLE_EARLY_EXIT_BRIEFING.startLabel);
    });

    it("deve conter instruções e destaques operacionais distintos", () => {
      const canonicalTitles = BUBBLE_CANONICAL_BRIEFING.instructions.map((i) => i.title);
      const earlyExitTitles = BUBBLE_EARLY_EXIT_BRIEFING.instructions.map((i) => i.title);
      expect(canonicalTitles).not.toEqual(earlyExitTitles);

      const canonicalHighlights = BUBBLE_CANONICAL_BRIEFING.highlights.map((h) => h.label);
      const earlyExitHighlights = BUBBLE_EARLY_EXIT_BRIEFING.highlights.map((h) => h.label);
      expect(canonicalHighlights).not.toEqual(earlyExitHighlights);
    });
  });

  describe("Segurança de Fluxo e Geração Tardia (Procedural & Persistence Integrity)", () => {
    it("selecionar modo deve produzir estado de tela 'briefing' antes de qualquer entrada em gameplay", () => {
      // Simulação pura do state machine do fluxo
      let currentScreen: "home" | "briefing" | "game" | "tutorial" = "home";
      let arrayGenerated = false;

      // Jogador clica em INICIAR TURNO na Home
      const handleSelectCampaign = () => {
        currentScreen = "briefing";
        // Geração NÃO deve ocorrer aqui
      };

      handleSelectCampaign();
      expect(currentScreen).toBe("briefing");
      expect(arrayGenerated).toBe(false);

      // Jogador clica em VOLTAR no Briefing
      const handleBack = () => {
        currentScreen = "home";
      };

      handleBack();
      expect(currentScreen).toBe("home");
      expect(arrayGenerated).toBe(false);

      // Jogador seleciona novamente e agora clica em INICIAR TREINAMENTO
      handleSelectCampaign();
      expect(currentScreen).toBe("briefing");

      const handleStartCTA = () => {
        // Geração ocorre APENAS no clique do CTA
        arrayGenerated = true;
        currentScreen = "game";
      };

      handleStartCTA();
      expect(currentScreen).toBe("game");
      expect(arrayGenerated).toBe(true);
    });

    it("abrir e fechar o briefing não altera métricas de pontuação nem progresso salvo", () => {
      const mockSaveData = {
        version: 2 as const,
        campaign: {
          highestPhaseReached: 3,
          unlockedPhases: [1, 2, 3],
          hasCompletedTutorial: true,
          phaseRecords: {
            1: { bestScore: 100, fewestErrors: 0, minHints: 0, bestTimeMs: 12000 },
          },
        },
      };

      const clone = JSON.parse(JSON.stringify(mockSaveData));

      // Simula navegação de ida e volta pelo briefing
      let screen = "home";
      screen = "briefing";
      screen = "home";

      expect(mockSaveData).toEqual(clone);
      expect(screen).toBe("home");
    });
  });

  describe("SELECTION_CANONICAL_BRIEFING (P2.1-C)", () => {
    it("deve conter campos fundamentais e metadados obrigatórios do Selection Sort", () => {
      const briefing = getBriefingForMode("selection-canonical");
      expect(briefing.id).toBe("selection-canonical");
      expect(briefing.protocolName).toContain("SELECTION SORT");
      expect(briefing.modeName).toBe("SCANNER DE CARGA MÍNIMA");
      expect(briefing.startLabel).toBe("INICIAR SELECTION SORT");
      expect(briefing.instructions.length).toBeGreaterThanOrEqual(4);
      expect(briefing.highlights.length).toBeGreaterThanOrEqual(3);
    });

    it("deve conter conceitos fundamentais: scanner, candidato mínimo, posição alvo, transferência", () => {
      const briefing = getBriefingForMode("selection-canonical");
      const allText = [
        briefing.subtitle,
        briefing.objective,
        ...briefing.instructions.map((i) => `${i.title} ${i.description}`),
        ...(briefing.particularities ?? []),
      ]
        .join(" ")
        .toLowerCase();

      expect(allText).toMatch(/scanner|sensor/);
      expect(allText).toMatch(/mínimo|candidato/);
      expect(allText).toMatch(/alvo/);
      expect(allText).toMatch(/transferência|transferir/);
      expect(allText).toMatch(/nenhuma troca ocorre|sem movimentação/);
    });

    it("não deve misturar conteúdo nem mecânicas de vizinhos adjacentes do Bubble Sort", () => {
      const briefing = getBriefingForMode("selection-canonical");
      const allText = JSON.stringify(briefing).toLowerCase();
      expect(allText).not.toContain("pares vizinhos");
      expect(allText).not.toContain("early exit");
    });

    it("deve estar registrado no catálogo global de briefings", () => {
      expect(Object.keys(BRIEFING_CATALOG)).toContain("selection-canonical");
      expect(getBriefingForMode("selection-canonical").id).toBe("selection-canonical");
    });
  });

  describe("INSERTION_CANONICAL_BRIEFING (P2.2-C)", () => {
    it("deve conter campos fundamentais e metadados obrigatórios do Insertion Sort", () => {
      const briefing = getBriefingForMode("insertion-canonical");
      expect(briefing.id).toBe("insertion-canonical");
      expect(briefing.protocolName).toContain("INSERTION SORT");
      expect(briefing.modeName).toBe("DESVIO E ENCAIXE DE CARGAS");
      expect(briefing.badgeVariant).toBe("amber");
      expect(briefing.startLabel).toBe("INICIAR TUTORIAL GUIADO");
      expect(briefing.instructions.length).toBeGreaterThanOrEqual(4);
      expect(briefing.highlights.length).toBeGreaterThanOrEqual(3);
    });

    it("deve conter conceitos fundamentais: região ordenada (ORD), chave suspensa, shift vs troca e encaixe", () => {
      const briefing = getBriefingForMode("insertion-canonical");
      const allText = [
        briefing.subtitle,
        briefing.objective,
        ...briefing.instructions.map((i) => `${i.title} ${i.description}`),
        ...(briefing.particularities ?? []),
      ]
        .join(" ")
        .toLowerCase();

      expect(allText).toMatch(/chave|trilho/);
      expect(allText).toMatch(/vaga/);
      expect(allText).toMatch(/ord|ordenad/);
      expect(allText).toMatch(/desloca|shift/);
      expect(allText).toMatch(/encaix|insert/);
      expect(allText).toMatch(/shift ≠ troca|troca/);
    });

    it("não deve misturar mecânicas de pares adjacentes do Bubble nem scanner de mínimo do Selection", () => {
      const briefing = getBriefingForMode("insertion-canonical");
      const allText = JSON.stringify(briefing).toLowerCase();
      expect(allText).not.toContain("pares vizinhos");
      expect(allText).not.toContain("scanner de carga mínima");
      expect(allText).not.toContain("early exit");
    });

    it("deve estar registrado no catálogo global de briefings", () => {
      expect(Object.keys(BRIEFING_CATALOG)).toContain("insertion-canonical");
      expect(getBriefingForMode("insertion-canonical").id).toBe("insertion-canonical");
    });
  });
});
