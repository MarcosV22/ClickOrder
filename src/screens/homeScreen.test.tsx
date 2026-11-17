// @vitest-environment happy-dom
// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import HomeScreen from "./HomeScreen";
import { createDefaultSaveData } from "../game/persistence/types";
import { recordExerciseCompletion } from "../game/persistence/persistenceService";
import { BUBBLE_EXERCISE_SETS } from "../game/persistence/constants";

describe("HomeScreen - Redesign UX-HOME-R1", () => {
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

  const renderScreen = async (props = {}) => {
    await act(async () => {
      root.render(<HomeScreen {...props} />);
    });
  };

  it("renderiza a Seção A (Hero) com título, proposta de valor, recomendação e CTA primário", async () => {
    const onStartProtocol = vi.fn();
    await renderScreen({ onStartProtocol });

    const text = container.textContent || "";
    expect(text).toContain("SORTING STATION");
    expect(text).toContain("Aprenda algoritmos de ordenação na prática, passo a passo.");
    expect(text).toContain("Plataforma Educacional • Aprendizado Ativo");
    expect(text).toContain("Recomendamos começar pelo");
    expect(text).toContain("Bubble Sort");

    // Localiza botão Começar pelo Bubble Sort
    const startBubbleBtn = Array.from(container.querySelectorAll("button")).find(
      (btn) => btn.textContent?.includes("COMEÇAR PELO BUBBLE SORT")
    );
    expect(startBubbleBtn).toBeDefined();

    act(() => {
      startBubbleBtn?.click();
    });
    expect(onStartProtocol).toHaveBeenCalledWith("bubble");
  });

  it("renderiza a Seção B (Como Funciona) com os 3 passos pedagógicos", async () => {
    await renderScreen();

    const text = container.textContent || "";
    expect(text).toContain("Como Funciona o Sorting Station");
    expect(text).toContain("PASSO 01");
    expect(text).toContain("Escolha o Método");
    expect(text).toContain("PASSO 02");
    expect(text).toContain("Entenda a Lógica");
    expect(text).toContain("PASSO 03");
    expect(text).toContain("Pratique na Esteira");
  });

  it("não exibe o card de retomada (HomeContinueCard) para novos usuários sem progresso", async () => {
    await renderScreen();

    const text = container.textContent || "";
    expect(text).not.toContain("BEM-VINDO DE VOLTA • PROGRESSO SALVO");
    expect(text).not.toContain("CONTINUAR TREINAMENTO");
  });

  it("exibe o card de retomada (HomeContinueCard) quando há progresso salvo e permite retomar", async () => {
    const onStartProtocol = vi.fn();
    const defaultSave = createDefaultSaveData(3, 3);
    const saveWithProgress = recordExerciseCompletion(
      defaultSave,
      "bubble",
      BUBBLE_EXERCISE_SETS.BASIC,
      { score: 90, errors: 0, hintsUsed: 0 }
    );

    await renderScreen({ saveData: saveWithProgress, onStartProtocol });

    const text = container.textContent || "";
    expect(text).toContain("BEM-VINDO DE VOLTA • PROGRESSO SALVO");
    expect(text).toContain("1 de 12 práticas concluídas");
    expect(text).toContain("Próximo passo sugerido: BUBBLE SORT");

    const continueBtn = Array.from(container.querySelectorAll("button")).find(
      (btn) => btn.textContent?.includes("CONTINUAR TREINAMENTO")
    );
    expect(continueBtn).toBeDefined();

    act(() => {
      continueBtn?.click();
    });
    expect(onStartProtocol).toHaveBeenCalledWith("bubble");
  });

  it("renderiza os 4 módulos de algoritmo com chip RECOMENDADO no Bubble e chips de prática", async () => {
    await renderScreen();

    const text = container.textContent || "";
    expect(text).toContain("BUBBLE SORT");
    expect(text).toContain("SELECTION SORT");
    expect(text).toContain("INSERTION SORT");
    expect(text).toContain("MERGE SORT");

    // Badge recomendado no Bubble
    expect(text).toContain("RECOMENDADO");

    // Chips de prática
    expect(text).toContain("Comparação de vizinhos");
    expect(text).toContain("Busca do menor valor");
    expect(text).toContain("Número em análise (chave)");
    expect(text).toContain("Vetor auxiliar temporário");
  });

  it("dispara os callbacks corretos ao clicar nos botões dos cards", async () => {
    const onStartProtocol = vi.fn();
    const onOpenTutorial = vi.fn();
    const onOpenDemonstration = vi.fn();

    await renderScreen({
      onStartProtocol,
      onOpenTutorial,
      onOpenDemonstration,
    });

    // Iniciar Treinamento no Bubble (primeiro card)
    const startButtons = Array.from(container.querySelectorAll("button")).filter(
      (btn) => btn.textContent?.includes("INICIAR TREINAMENTO")
    );
    expect(startButtons.length).toBe(4);

    act(() => {
      startButtons[0].click(); // Bubble
    });
    expect(onStartProtocol).toHaveBeenCalledWith("bubble");

    act(() => {
      startButtons[1].click(); // Selection
    });
    expect(onStartProtocol).toHaveBeenCalledWith("selection");

    // Tutorial no Bubble
    const tutorialButtons = Array.from(container.querySelectorAll("button")).filter(
      (btn) => btn.textContent?.includes("TUTORIAL")
    );
    expect(tutorialButtons.length).toBe(4);

    act(() => {
      tutorialButtons[0].click();
    });
    expect(onOpenTutorial).toHaveBeenCalledWith("bubble");

    // Demonstração no Bubble
    const demoButtons = Array.from(container.querySelectorAll("button")).filter(
      (btn) => btn.textContent?.includes("DEMONSTRAÇÃO")
    );
    expect(demoButtons.length).toBe(4);

    act(() => {
      demoButtons[0].click();
    });
    expect(onOpenDemonstration).toHaveBeenCalledWith("bubble");
  });

  it("renderiza o rodapé educacional com status de execução local", async () => {
    await renderScreen();

    const text = container.textContent || "";
    expect(text).toContain("100% LOCAL & INTERATIVO");
    expect(text).toContain("Plataforma Educacional Prática de Algoritmos de Ordenação");
  });
});
