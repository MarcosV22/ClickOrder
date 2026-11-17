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

describe("HomeScreen - Redesign UX-HOME-R2 (Visual Educational Launcher)", () => {
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

  it("renderiza o cabeçalho compacto com título e subtítulo direto em 1 linha", async () => {
    await renderScreen();

    const text = container.textContent || "";
    expect(text).toContain("SORTING STATION");
    expect(text).toContain("Aprenda algoritmos de ordenação visualmente.");

    // Não deve conter parágrafo institucional longo ou caixa redundante de callout
    expect(text).not.toContain("Plataforma Educacional • Aprendizado Ativo");
    expect(text).not.toContain("Primeira vez aqui?");
  });

  it("renderiza a faixa compacta de 3 passos pedagógicos (ESCOLHA, APRENDA, PRATIQUE)", async () => {
    await renderScreen();

    const text = container.textContent || "";
    expect(text).toContain("ESCOLHA");
    expect(text).toContain("um algoritmo");
    expect(text).toContain("APRENDA");
    expect(text).toContain("como funciona");
    expect(text).toContain("PRATIQUE");
    expect(text).toContain("passo a passo");
  });

  it("renderiza EXATAMENTE os 3 módulos canônicos (Bubble, Selection, Insertion) e NUNCA o Merge Sort", async () => {
    await renderScreen();

    const text = container.textContent || "";
    expect(text).toContain("BUBBLE SORT");
    expect(text).toContain("SELECTION SORT");
    expect(text).toContain("INSERTION SORT");

    // Merge Sort congelado e terminantemente ausente da Home
    expect(text).not.toContain("MERGE SORT");
    expect(text).not.toContain("QUICK SORT");
    expect(text).not.toContain("HEAP SORT");
  });

  it("exibe badge discreto 'Recomendado' apenas no Bubble Sort", async () => {
    await renderScreen();

    const articles = container.querySelectorAll("article");
    expect(articles.length).toBe(3);

    // Primeiro card: Bubble Sort
    expect(articles[0].textContent).toContain("BUBBLE SORT");
    expect(articles[0].textContent).toContain("Recomendado");

    // Segundo card: Selection Sort
    expect(articles[1].textContent).toContain("SELECTION SORT");
    expect(articles[1].textContent).not.toContain("Recomendado");

    // Terceiro card: Insertion Sort
    expect(articles[2].textContent).toContain("INSERTION SORT");
    expect(articles[2].textContent).not.toContain("Recomendado");
  });

  it("exibe as metáforas conceituais corretas em cada card", async () => {
    await renderScreen();

    const text = container.textContent || "";
    expect(text).toContain("Comparação de vizinhos");
    expect(text).toContain("Seleção do menor número");
    expect(text).toContain("Inserção na parte ordenada");
  });

  it("renderiza os mini visuais da mecânica com acessibilidade (aria-label)", async () => {
    await renderScreen();

    const bubbleVisual = container.querySelector(
      '[aria-label="Demonstração visual do Bubble Sort: compara elementos vizinhos e troca se fora de ordem"]'
    );
    expect(bubbleVisual).not.toBeNull();
    expect(bubbleVisual?.textContent).toContain("Compare vizinhos.");

    const selectionVisual = container.querySelector(
      '[aria-label="Demonstração visual do Selection Sort: percorre a lista, encontra o menor valor e posiciona no início"]'
    );
    expect(selectionVisual).not.toBeNull();
    expect(selectionVisual?.textContent).toContain("Encontre o menor.");

    const insertionVisual = container.querySelector(
      '[aria-label="Demonstração visual do Insertion Sort: insere cada elemento na posição correta da parte ordenada"]'
    );
    expect(insertionVisual).not.toBeNull();
    expect(insertionVisual?.textContent).toContain("Encaixe cada elemento.");
  });

  it("cada card possui exatamente 1 botão de CTA com rótulo COMEÇAR para novos usuários", async () => {
    await renderScreen();

    const articles = container.querySelectorAll("article");
    articles.forEach((article) => {
      const buttons = article.querySelectorAll("button");
      expect(buttons.length).toBe(1);
      expect(buttons[0].textContent).toContain("COMEÇAR");
      // Não deve ter botões concorrentes
      expect(article.textContent).not.toContain("Tutorial");
      expect(article.textContent).not.toContain("Demonstração");
      expect(article.textContent).not.toContain("Desafio");
    });
  });

  it("aciona onStartProtocol com o id correspondente ao clicar no botão do card", async () => {
    const onStartProtocol = vi.fn();
    await renderScreen({ onStartProtocol });

    const articles = container.querySelectorAll("article");

    // Clica no CTA do Bubble
    act(() => {
      articles[0].querySelector("button")?.click();
    });
    expect(onStartProtocol).toHaveBeenCalledWith("bubble");

    // Clica no CTA do Selection
    act(() => {
      articles[1].querySelector("button")?.click();
    });
    expect(onStartProtocol).toHaveBeenCalledWith("selection");

    // Clica no CTA do Insertion
    act(() => {
      articles[2].querySelector("button")?.click();
    });
    expect(onStartProtocol).toHaveBeenCalledWith("insertion");
  });

  it("não exibe faixa de retomada quando não há progresso salvo", async () => {
    await renderScreen();

    const text = container.textContent || "";
    expect(text).not.toContain("Sessão em andamento:");
  });

  it("exibe faixa sutil de retomada e muda CTA do card para CONTINUAR quando há progresso salvo", async () => {
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
    // Faixa sutil presente
    expect(text).toContain("Sessão em andamento:");
    expect(text).toContain("BUBBLE SORT");
    expect(text).toContain("Prática Intermediária");

    // Card do Bubble deve exibir "1 de 3 práticas" e botão "CONTINUAR"
    const articles = container.querySelectorAll("article");
    expect(articles[0].textContent).toContain("1 de 3 práticas");
    expect(articles[0].querySelector("button")?.textContent).toContain("CONTINUAR");

    // Os outros cards ainda devem estar em "0 de 3 práticas" e "COMEÇAR"
    expect(articles[1].textContent).toContain("0 de 3 práticas");
    expect(articles[1].querySelector("button")?.textContent).toContain("COMEÇAR");

    // Clicar no botão Continuar da faixa sutil retoma o protocolo sugerido
    const resumeBtn = Array.from(container.querySelectorAll("button")).find(
      (btn) => btn.textContent?.includes("Continuar →")
    );
    expect(resumeBtn).toBeDefined();
    act(() => {
      resumeBtn?.click();
    });
    expect(onStartProtocol).toHaveBeenCalledWith("bubble");
  });

  it("renderiza o rodapé minimalista", async () => {
    await renderScreen();

    const footer = container.querySelector("footer");
    expect(footer).not.toBeNull();
    expect(footer?.textContent).toContain("Sorting Station • Plataforma Educacional de Algoritmos");
    expect(footer?.textContent).toContain("Aprenda ciência da computação de forma visual e interativa.");
  });
});
