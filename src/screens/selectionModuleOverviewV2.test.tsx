// @vitest-environment happy-dom
// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import SelectionModuleOverviewV2 from "./selection/SelectionModuleOverviewV2";
import { SELECTION_SORT_PSEUDOCODE } from "../game/replay/selectionReplayPseudocode";

describe("Selection Sort Visual-First (UX-MODULE-R2) — Module Introduction Redesign", () => {
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

  it("deve renderizar o título dominante SELECTION SORT e a frase conceitual curta", async () => {
    const onStartTutorial = vi.fn();
    const onBack = vi.fn();

    await act(async () => {
      root.render(
        <SelectionModuleOverviewV2
          onStartTutorial={onStartTutorial}
          onBack={onBack}
        />
      );
    });

    const h1 = container.querySelector("h1");
    expect(h1).not.toBeNull();
    expect(h1?.textContent?.trim()).toBe("SELECTION SORT");

    const text = container.textContent || "";
    expect(text).toContain("Encontre o menor e coloque-o na próxima posição.");
    expect(text).toContain("Módulo 2 • Ordenação por Seleção");
  });

  it("deve exibir o exemplo visual com [4, 1, 3] e aria-label acessível", async () => {
    await act(async () => {
      root.render(
        <SelectionModuleOverviewV2
          onStartTutorial={vi.fn()}
          onBack={vi.fn()}
        />
      );
    });

    const heroVisual = container.querySelector('[role="img"]');
    expect(heroVisual).not.toBeNull();
    expect(heroVisual?.getAttribute("aria-label")).toBe(
      "O scanner percorre 4, 1 e 3 sem mover os elementos. O número 1 é identificado como o menor e, somente após a busca, é colocado na primeira posição."
    );

    expect(heroVisual?.textContent).toContain("Exemplo com [4, 1, 3]");
    expect(heroVisual?.textContent).toContain("PRÓXIMA POSIÇÃO");
    expect(heroVisual?.textContent).toContain("MENOR");
    expect(heroVisual?.textContent).toContain("Começamos procurando o menor número.");
  });

  it("deve demonstrar no Passo 1 (PROCURE) a identificação inicial do menor sem movimentação", async () => {
    await act(async () => {
      root.render(
        <SelectionModuleOverviewV2
          onStartTutorial={vi.fn()}
          onBack={vi.fn()}
        />
      );
    });

    const heroVisual = container.querySelector('[role="img"]');
    expect(heroVisual?.textContent).toContain("Começamos procurando o menor número.");
    expect(heroVisual?.textContent).toContain("O primeiro elemento (4) é considerado o menor encontrado até agora.");

    // No Passo 1, as caixas são 4, 1 e 3
    const boxes = Array.from(heroVisual?.querySelectorAll(".font-bold.text-2xl, .font-bold.text-3xl") || []);
    const boxTexts = boxes.map((b) => b.textContent?.trim());
    expect(boxTexts).toEqual(["4", "1", "3"]);
  });

  it("deve demonstrar no Passo 2 (LEMBRE O MENOR) que o marcador percorre o vetor mantendo as caixas absolutamente paradas", async () => {
    await act(async () => {
      root.render(
        <SelectionModuleOverviewV2
          onStartTutorial={vi.fn()}
          onBack={vi.fn()}
        />
      );
    });

    const heroVisual = container.querySelector('[role="img"]');
    const step2Btn = Array.from(heroVisual?.querySelectorAll('[role="tab"]') || []).find((b) =>
      b.textContent?.includes("2. LEMBRE O MENOR")
    ) as HTMLButtonElement | undefined;
    expect(step2Btn).toBeTruthy();

    await act(async () => {
      step2Btn?.click();
    });

    // Sub-passo 1: olhando o 1
    expect(heroVisual?.textContent).toContain("O marcador olha o 1");
    expect(heroVisual?.textContent).toContain("guardamos o 1 como o novo menor");

    // As caixas continuam exatamente [4, 1, 3]!
    let boxes = Array.from(heroVisual?.querySelectorAll(".font-bold.text-2xl, .font-bold.text-3xl") || []);
    let boxTexts = boxes.map((b) => b.textContent?.trim());
    expect(boxTexts).toEqual(["4", "1", "3"]);

    // Alterna para olhar o 3
    const look3Btn = Array.from(heroVisual?.querySelectorAll("button") || []).find((b) =>
      b.textContent?.includes("Olhando o 3")
    );
    expect(look3Btn).toBeTruthy();

    await act(async () => {
      look3Btn?.click();
    });

    expect(heroVisual?.textContent).toContain("O marcador olha o 3");
    expect(heroVisual?.textContent).toContain("o menor continua sendo o 1");

    // As caixas ainda permanecem rigorosamente [4, 1, 3]
    boxes = Array.from(heroVisual?.querySelectorAll(".font-bold.text-2xl, .font-bold.text-3xl") || []);
    boxTexts = boxes.map((b) => b.textContent?.trim());
    expect(boxTexts).toEqual(["4", "1", "3"]);

    // Nota da regra visual no Hero
    expect(heroVisual?.textContent).toContain("Durante a busca, nenhuma caixa sai do lugar.");
  });

  it("deve demonstrar no Passo 3 (POSICIONE) que o menor (1) é posicionado na primeira doca produzindo [1, 4, 3]", async () => {
    await act(async () => {
      root.render(
        <SelectionModuleOverviewV2
          onStartTutorial={vi.fn()}
          onBack={vi.fn()}
        />
      );
    });

    const heroVisual = container.querySelector('[role="img"]');
    const step3Btn = Array.from(heroVisual?.querySelectorAll('[role="tab"]') || []).find((b) =>
      b.textContent?.includes("3. POSICIONE")
    ) as HTMLButtonElement | undefined;
    expect(step3Btn).toBeTruthy();

    await act(async () => {
      step3Btn?.click();
    });

    expect(heroVisual?.textContent).toContain("A varredura terminou!");
    expect(heroVisual?.textContent).toContain("Agora colocamos o menor (1) na próxima posição");
    expect(heroVisual?.textContent).toContain("POSICIONADO");

    // Vetor agora é [1, 4, 3]
    const boxes = Array.from(heroVisual?.querySelectorAll(".font-bold.text-2xl, .font-bold.text-3xl") || []);
    const boxTexts = boxes.map((b) => b.textContent?.trim());
    expect(boxTexts).toEqual(["1", "4", "3"]);
  });

  it("deve exibir a faixa dos 3 passos essenciais e o banner PROCURAR ≠ MOVER", async () => {
    await act(async () => {
      root.render(
        <SelectionModuleOverviewV2
          onStartTutorial={vi.fn()}
          onBack={vi.fn()}
        />
      );
    });

    const text = container.textContent || "";
    expect(text).toContain("PROCURE");
    expect(text).toContain("Olhe todos os números restantes.");
    expect(text).toContain("LEMBRE O MENOR");
    expect(text).toContain("Guarde o menor que encontrou.");
    expect(text).toContain("POSICIONE");
    expect(text).toContain("Coloque-o na próxima posição.");

    expect(text).toContain("PROCURAR ≠ MOVER:");
    expect(text).toContain("Durante a busca, nada troca de lugar.");
  });

  it("NÃO deve expor terminologia formal (i, j, minIndex, INSPECT, COMMIT) na camada primária visível", async () => {
    await act(async () => {
      root.render(
        <SelectionModuleOverviewV2
          onStartTutorial={vi.fn()}
          onBack={vi.fn()}
        />
      );
    });

    // Pega o conteúdo antes do details
    const details = container.querySelector("details");
    expect(details).not.toBeNull();

    // Clona o container e remove o details para inspecionar somente a camada primária
    const clone = container.cloneNode(true) as HTMLDivElement;
    clone.querySelector("details")?.remove();
    const primaryText = clone.textContent || "";

    expect(primaryText).not.toContain("minIndex");
    expect(primaryText).not.toContain("INSPECT");
    expect(primaryText).not.toContain("COMMIT");
    expect(primaryText).not.toContain("FSM");
    expect(primaryText).not.toContain("Θ(n²)");
    expect(primaryText).not.toContain("swap");
  });

  it("deve manter o accordion de detalhes técnicos fechado por padrão", async () => {
    await act(async () => {
      root.render(
        <SelectionModuleOverviewV2
          onStartTutorial={vi.fn()}
          onBack={vi.fn()}
        />
      );
    });

    const details = container.querySelector("details");
    expect(details).not.toBeNull();
    expect(details?.hasAttribute("open")).toBe(false);
  });

  it("deve conter pseudocódigo canônico de 13 linhas da fonte única da verdade dentro de detalhes", async () => {
    await act(async () => {
      root.render(
        <SelectionModuleOverviewV2
          onStartTutorial={vi.fn()}
          onBack={vi.fn()}
        />
      );
    });

    const details = container.querySelector("details");
    const pre = details?.querySelector("pre");
    expect(pre).not.toBeNull();

    const preText = pre?.textContent || "";
    // Valida que possui exatamente as 13 instruções
    expect(SELECTION_SORT_PSEUDOCODE.length).toBe(13);

    for (const line of SELECTION_SORT_PSEUDOCODE) {
      expect(preText).toContain(line.text);
    }

    expect(preText).toContain("1: procedimento selectionSort(A)");
    expect(preText).toContain("13: fim procedimento");
  });

  it("deve conter a complexidade assintótica exata e FSM formal dentro de detalhes", async () => {
    await act(async () => {
      root.render(
        <SelectionModuleOverviewV2
          onStartTutorial={vi.fn()}
          onBack={vi.fn()}
        />
      );
    });

    const detailsText = container.querySelector("details")?.textContent || "";
    expect(detailsText).toContain("Θ(n²) comparações");
    expect(detailsText).toContain("máximo n - 1 trocas físicas");
    expect(detailsText).toContain("Θ(1) / O(1)");
    expect(detailsText).toContain("Fase INSPECT");
    expect(detailsText).toContain("Fase COMMIT");
    expect(detailsText).toContain("Diferença Crítica: Selection Sort vs Bubble Sort");
    expect(detailsText).toContain("Instável na implementação canônica");
  });

  it("deve renderizar o CTA principal COMEÇAR TUTORIAL com rota secundária única", async () => {
    const onStartTutorial = vi.fn();
    const onStartPractice = vi.fn();

    await act(async () => {
      root.render(
        <SelectionModuleOverviewV2
          onStartTutorial={onStartTutorial}
          onStartPractice={onStartPractice}
          onBack={vi.fn()}
        />
      );
    });

    // CTA principal
    const mainBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("COMEÇAR TUTORIAL")
    );
    expect(mainBtn).toBeTruthy();
    expect(container.textContent).toContain("Você vai praticar a busca do menor passo a passo.");

    await act(async () => {
      mainBtn?.click();
    });
    expect(onStartTutorial).toHaveBeenCalledTimes(1);

    // Link secundário único
    const secondaryLink = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Ir para práticas")
    );
    expect(secondaryLink).toBeTruthy();
    expect(container.textContent).toContain("Já conhece o algoritmo?");

    await act(async () => {
      secondaryLink?.click();
    });
    expect(onStartPractice).toHaveBeenCalledTimes(1);
  });

  it("deve renderizar o link de demonstração livre subordinado dentro de detalhes técnicos", async () => {
    const onOpenDemonstration = vi.fn();

    await act(async () => {
      root.render(
        <SelectionModuleOverviewV2
          onStartTutorial={vi.fn()}
          onOpenDemonstration={onOpenDemonstration}
          onBack={vi.fn()}
        />
      );
    });

    const details = container.querySelector("details");
    const demoBtn = Array.from(details?.querySelectorAll("button") || []).find((b) =>
      b.textContent?.includes("Ver Demonstração Livre")
    );
    expect(demoBtn).toBeTruthy();

    await act(async () => {
      demoBtn?.click();
    });
    expect(onOpenDemonstration).toHaveBeenCalledTimes(1);
  });

  it("deve acionar o callback onBack ao clicar no botão voltar", async () => {
    const onBack = vi.fn();

    await act(async () => {
      root.render(
        <SelectionModuleOverviewV2
          onStartTutorial={vi.fn()}
          onBack={onBack}
        />
      );
    });

    const backBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Voltar ao Início")
    );
    expect(backBtn).toBeTruthy();

    await act(async () => {
      backBtn?.click();
    });
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
