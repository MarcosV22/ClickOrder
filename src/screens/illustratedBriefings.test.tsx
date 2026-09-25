// @vitest-environment happy-dom
// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import ProtocolModeBriefingScreen from "./ProtocolModeBriefingScreen";
import ProtocolCard from "./ProtocolCard";
import {
  BUBBLE_CANONICAL_BRIEFING,
  SELECTION_CANONICAL_BRIEFING,
  INSERTION_CANONICAL_BRIEFING,
  MERGE_CANONICAL_BRIEFING,
} from "../game/briefing";
import { PROTOCOL_CATALOG } from "./protocolCatalog";

describe("Illustrated Briefings & ProtocolCard Layout", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  describe("ProtocolModeBriefingScreen - Illustrated Explanations", () => {
    it("deve renderizar a explicação ilustrada do Bubble Sort com exemplo visual e regras curtas", async () => {
      await act(async () => {
        root.render(
          <ProtocolModeBriefingScreen
            briefing={BUBBLE_CANONICAL_BRIEFING}
            onStart={vi.fn()}
            onBack={vi.fn()}
          />
        );
      });

      const text = container.textContent || "";
      expect(text).toContain("Como Funciona o Algoritmo");
      expect(text).toContain("Exemplo Visual da 1ª Passada com [5, 2, 4, 1]");
      expect(text).toContain("5 > 2 • TROCAR");
      expect(text).toContain("5 > 4 • TROCAR");
      expect(text).toContain("5 OK DEFINITIVO");
      expect(text).toContain("AVANÇO SEM TROCA");
      expect(text).toContain("Quando trocar?");
      expect(text).toContain("Quando manter?");
      expect(text).toContain("Flutuação e Selo OK");
      expect(text).toContain("Entenda os detalhes técnicos");
    });

    it("deve renderizar a explicação ilustrada do Selection Sort com varredura, troca única e caso de menor já no alvo", async () => {
      await act(async () => {
        root.render(
          <ProtocolModeBriefingScreen
            briefing={SELECTION_CANONICAL_BRIEFING}
            onStart={vi.fn()}
            onBack={vi.fn()}
          />
        );
      });

      const text = container.textContent || "";
      expect(text).toContain("Como Funciona o Algoritmo");
      expect(text).toContain("Exemplo Visual da 1ª Passada com [4, 1, 3, 2]");
      expect(text).toContain("SEM TROCAS NO VETOR");
      expect(text).toContain("CONSOLIDAÇÃO");
      expect(text).toContain("ZERO TROCAS");
      expect(text).toContain("Nenhuma troca na busca");
      expect(text).toContain("Troca única por passada");
      expect(text).toContain("Posição Alvo e Selo OK");
      expect(text).toContain("Entenda os detalhes técnicos");
    });

    it("deve renderizar a explicação ilustrada do Insertion Sort com chave, deslocamento e distinção ORD vs OK", async () => {
      await act(async () => {
        root.render(
          <ProtocolModeBriefingScreen
            briefing={INSERTION_CANONICAL_BRIEFING}
            onStart={vi.fn()}
            onBack={vi.fn()}
          />
        );
      });

      const text = container.textContent || "";
      expect(text).toContain("Como Funciona o Algoritmo");
      expect(text).toContain("Exemplo Visual de Inserção com [2, 5, 3, 1]");
      expect(text).toContain("5 > 3 • DESLOCAR");
      expect(text).toContain("2 ≤ 3 • INSERIR");
      expect(text).toContain("ORD LOCAL");
      expect(text).toContain("Deslocamento ≠ Troca");
      expect(text).toContain("ORD local vs Selo OK");
      expect(text).toContain("Número-Chave e Vaga Aberta");
      expect(text).toContain("Entenda os detalhes técnicos");
    });

    it("deve manter o padrão aprovado no Merge Sort com divisão, intercalação e vetor auxiliar", async () => {
      await act(async () => {
        root.render(
          <ProtocolModeBriefingScreen
            briefing={MERGE_CANONICAL_BRIEFING}
            onStart={vi.fn()}
            onBack={vi.fn()}
          />
        );
      });

      const text = container.textContent || "";
      expect(text).toContain("Como Funciona o Algoritmo");
      expect(text).toContain("Exemplo Visual com [4, 1, 3, 2]");
      expect(text).toContain("Fase de Divisão");
      expect(text).toContain("Fase de Intercalação");
      expect(text).toContain("Números iguais?");
      expect(text).toContain("Um grupo terminou?");
      expect(text).toContain("Vetor auxiliar temporário");
      expect(text).toContain("Entenda os detalhes técnicos");
    });
  });

  describe("ProtocolCard - Alinhamento Estrutural e Regiões", () => {
    it("deve renderizar as ações comuns (INICIAR, TUTORIAL, DEMONSTRAÇÃO) e isolar o desafio no Bubble abaixo delas", async () => {
      const bubbleMeta = PROTOCOL_CATALOG.find((m) => m.id === "bubble")!;
      await act(async () => {
        root.render(
          <ProtocolCard
            metadata={bubbleMeta}
            summary={{
              completedPhases: 1,
              totalPhases: 3,
              hasCompletedTutorial: true,
              bestScore: 92,
              isChallengeUnlocked: false,
            }}
            onStartTraining={vi.fn()}
            onOpenTutorial={vi.fn()}
            onOpenDemonstration={vi.fn()}
            onStartChallenge={vi.fn()}
          />
        );
      });

      const buttons = Array.from(container.querySelectorAll("button")).map(
        (b) => b.textContent?.trim()
      );
      expect(buttons.some((b) => b?.includes("INICIAR TREINAMENTO"))).toBe(true);
      expect(buttons.some((b) => b?.includes("TUTORIAL"))).toBe(true);
      expect(buttons.some((b) => b?.includes("DEMONSTRAÇÃO"))).toBe(true);

      const text = container.textContent || "";
      expect(text).toContain("DESAFIO: Conclua as 3 práticas do Bubble");

      const cardRoot = container.firstElementChild as HTMLElement;
      expect(cardRoot.className).not.toContain("justify-between");
    });

    it("não deve renderizar a região de desafio para módulos que não são o Bubble", async () => {
      const selectionMeta = PROTOCOL_CATALOG.find((m) => m.id === "selection")!;
      await act(async () => {
        root.render(
          <ProtocolCard
            metadata={selectionMeta}
            summary={{
              completedPhases: 0,
              totalPhases: 3,
              hasCompletedTutorial: false,
              bestScore: undefined,
            }}
            onStartTraining={vi.fn()}
            onOpenTutorial={vi.fn()}
            onOpenDemonstration={vi.fn()}
          />
        );
      });

      const text = container.textContent || "";
      expect(text).not.toContain("MODO DESAFIO");
      expect(text).not.toContain("DESAFIO: Conclua as 3 práticas");
    });
  });
});
