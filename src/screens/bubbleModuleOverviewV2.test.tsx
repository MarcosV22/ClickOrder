// @vitest-environment happy-dom
// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import BubbleModuleOverviewV2 from "./bubble/BubbleModuleOverviewV2";
import { BUBBLE_SORT_PSEUDOCODE } from "../game/replay/replayPseudocode";

describe("Bubble Sort Visual-First (UX-MODULE-R3) — Harmonized Module Introduction", () => {
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

  it("deve renderizar o título dominante BUBBLE SORT e a frase conceitual curta", async () => {
    const onStartTutorial = vi.fn();
    const onBack = vi.fn();

    await act(async () => {
      root.render(
        <BubbleModuleOverviewV2
          onStartTutorial={onStartTutorial}
          onBack={onBack}
        />
      );
    });

    const h1 = container.querySelector("h1");
    expect(h1).not.toBeNull();
    expect(h1?.textContent?.trim()).toBe("BUBBLE SORT");

    const text = container.textContent || "";
    expect(text).toContain("Compare vizinhos e coloque o menor primeiro.");
    expect(text).toContain("Módulo 1 • Ordenação por Comparação");
  });

  it("deve exibir o exemplo visual com [8, 3] e aria-label acessível", async () => {
    await act(async () => {
      root.render(
        <BubbleModuleOverviewV2
          onStartTutorial={vi.fn()}
          onBack={vi.fn()}
        />
      );
    });

    const heroVisual = container.querySelector('[role="img"]');
    expect(heroVisual).not.toBeNull();
    expect(heroVisual?.getAttribute("aria-label")).toBe(
      "Dois elementos vizinhos 8 e 3 são comparados. Como 8 é maior que 3, eles realizam uma troca bilateral, resultando em 3 e 8."
    );

    expect(heroVisual?.textContent).toContain("Exemplo com [8, 3]");
    expect(heroVisual?.textContent).toContain("VIZINHOS EM FOCO");
    expect(heroVisual?.textContent).toContain("Olhamos apenas duas caixas vizinhas.");
  });

  it("deve demonstrar no Passo 1 (COMPARE) o foco exclusivo em dois vizinhos [8, 3]", async () => {
    await act(async () => {
      root.render(
        <BubbleModuleOverviewV2
          onStartTutorial={vi.fn()}
          onBack={vi.fn()}
        />
      );
    });

    const heroVisual = container.querySelector('[role="img"]');
    expect(heroVisual?.textContent).toContain("Olhamos apenas duas caixas vizinhas.");

    const boxes = Array.from(heroVisual?.querySelectorAll('span[style*="Orbitron"]') || []);
    const boxTexts = boxes.map((b) => b.textContent?.trim());
    expect(boxTexts).toEqual(["8", "3"]);
  });

  it("deve demonstrar no Passo 2 (DECIDA) a comparação 8 > 3 e a indicação de troca necessária", async () => {
    await act(async () => {
      root.render(
        <BubbleModuleOverviewV2
          onStartTutorial={vi.fn()}
          onBack={vi.fn()}
        />
      );
    });

    const heroVisual = container.querySelector('[role="img"]');
    const step2Btn = Array.from(heroVisual?.querySelectorAll('[role="tab"]') || []).find((b) =>
      b.textContent?.includes("2. DECIDA")
    ) as HTMLButtonElement | undefined;
    expect(step2Btn).toBeTruthy();

    await act(async () => {
      step2Btn?.click();
    });

    expect(heroVisual?.textContent).toContain("8 > 3");
    expect(heroVisual?.textContent).toContain("PRECISAM TROCAR");
    expect(heroVisual?.textContent).toContain("8 é maior que 3: precisam trocar.");

    // Elementos ainda estão [8, 3] antes da execução da troca
    const boxes = Array.from(heroVisual?.querySelectorAll('span[style*="Orbitron"]') || []);
    const boxTexts = boxes.map((b) => b.textContent?.trim());
    expect(boxTexts).toEqual(["8", "3"]);
  });

  it("deve demonstrar no Passo 3 (AVANCE) a troca bilateral resultando em [3, 8]", async () => {
    await act(async () => {
      root.render(
        <BubbleModuleOverviewV2
          onStartTutorial={vi.fn()}
          onBack={vi.fn()}
        />
      );
    });

    const heroVisual = container.querySelector('[role="img"]');
    const step3Btn = Array.from(heroVisual?.querySelectorAll('[role="tab"]') || []).find((b) =>
      b.textContent?.includes("3. AVANCE")
    ) as HTMLButtonElement | undefined;
    expect(step3Btn).toBeTruthy();

    await act(async () => {
      step3Btn?.click();
    });

    expect(heroVisual?.textContent).toContain("TROCA REALIZADA");
    expect(heroVisual?.textContent).toContain("Troca feita: o maior avançou.");
    expect(heroVisual?.textContent).toContain("[3, 8]");

    // Agora os elementos estão invertidos: [3, 8]
    const boxes = Array.from(heroVisual?.querySelectorAll('span[style*="Orbitron"]') || []);
    const boxTexts = boxes.map((b) => b.textContent?.trim());
    expect(boxTexts).toEqual(["3", "8"]);
  });

  it("deve permitir navegação sequencial através dos botões Anterior e Próximo", async () => {
    await act(async () => {
      root.render(
        <BubbleModuleOverviewV2
          onStartTutorial={vi.fn()}
          onBack={vi.fn()}
        />
      );
    });

    const heroVisual = container.querySelector('[role="img"]');
    const nextBtn = Array.from(heroVisual?.querySelectorAll("button") || []).find((b) =>
      b.textContent?.includes("Próximo")
    );
    expect(nextBtn).toBeTruthy();

    // Avança para o Passo 2
    await act(async () => {
      nextBtn?.click();
    });
    expect(heroVisual?.textContent).toContain("Passo 2 de 3");

    // Avança para o Passo 3
    await act(async () => {
      nextBtn?.click();
    });
    expect(heroVisual?.textContent).toContain("Passo 3 de 3");

    // Botão muda para Rever
    const reverBtn = Array.from(heroVisual?.querySelectorAll("button") || []).find((b) =>
      b.textContent?.includes("Rever")
    );
    expect(reverBtn).toBeTruthy();

    // Clica em Anterior para voltar ao Passo 2
    const prevBtn = Array.from(heroVisual?.querySelectorAll("button") || []).find((b) =>
      b.textContent?.includes("Anterior")
    );
    await act(async () => {
      prevBtn?.click();
    });
    expect(heroVisual?.textContent).toContain("Passo 2 de 3");
  });

  it("deve exibir os 3 passos essenciais na seção inferior e a regra de comparação local", async () => {
    await act(async () => {
      root.render(
        <BubbleModuleOverviewV2
          onStartTutorial={vi.fn()}
          onBack={vi.fn()}
        />
      );
    });

    const stepsContainer = container.querySelector('[aria-label="Os 3 passos do Bubble Sort"]');
    expect(stepsContainer).not.toBeNull();

    expect(stepsContainer?.textContent).toContain("COMPARE");
    expect(stepsContainer?.textContent).toContain("Olhe duas caixas vizinhas.");

    expect(stepsContainer?.textContent).toContain("DECIDA");
    expect(stepsContainer?.textContent).toContain("Troque se a esquerda for maior.");

    expect(stepsContainer?.textContent).toContain("AVANCE");
    expect(stepsContainer?.textContent).toContain("Continue até organizar.");

    // Regra Visual Fundamental
    expect(container.textContent).toContain("COMPARAÇÃO LOCAL:");
    expect(container.textContent).toContain("Apenas vizinhos imediatos trocam de lugar diretamente.");
  });

  it("deve exibir um único CTA dominante e acionar onStartTutorial ao clicar", async () => {
    const onStartTutorial = vi.fn();
    await act(async () => {
      root.render(
        <BubbleModuleOverviewV2
          onStartTutorial={onStartTutorial}
          onBack={vi.fn()}
        />
      );
    });

    const ctaBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("COMEÇAR TUTORIAL ▶")
    );
    expect(ctaBtn).toBeTruthy();

    await act(async () => {
      ctaBtn?.click();
    });
    expect(onStartTutorial).toHaveBeenCalledTimes(1);

    expect(container.textContent).toContain("Você vai praticar a comparação de vizinhos passo a passo.");
  });

  it("deve acionar onStartPractice no link secundário da área de CTA e onOpenDemonstration dentro dos detalhes", async () => {
    const onStartPractice = vi.fn();
    const onOpenDemonstration = vi.fn();

    await act(async () => {
      root.render(
        <BubbleModuleOverviewV2
          onStartTutorial={vi.fn()}
          onStartPractice={onStartPractice}
          onOpenDemonstration={onOpenDemonstration}
          onBack={vi.fn()}
        />
      );
    });

    const practiceLink = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Ir para práticas ›")
    );
    expect(practiceLink).toBeTruthy();

    await act(async () => {
      practiceLink?.click();
    });
    expect(onStartPractice).toHaveBeenCalledTimes(1);

    const demoBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Ver Demonstração Livre ›")
    );
    expect(demoBtn).toBeTruthy();

    await act(async () => {
      demoBtn?.click();
    });
    expect(onOpenDemonstration).toHaveBeenCalledTimes(1);
  });

  it("deve manter a seção de detalhes técnicos fechada por padrão", async () => {
    await act(async () => {
      root.render(
        <BubbleModuleOverviewV2
          onStartTutorial={vi.fn()}
          onBack={vi.fn()}
        />
      );
    });

    const details = container.querySelector("details");
    expect(details).not.toBeNull();
    expect(details?.hasAttribute("open")).toBe(false);

    const summary = container.querySelector("summary");
    expect(summary?.textContent).toContain("Aprofundamento Técnico e Pseudocódigo");
  });

  it("deve exibir o pseudocódigo canônico de 9 linhas dentro dos detalhes técnicos", async () => {
    await act(async () => {
      root.render(
        <BubbleModuleOverviewV2
          onStartTutorial={vi.fn()}
          onBack={vi.fn()}
        />
      );
    });

    const pre = container.querySelector("pre");
    expect(pre).not.toBeNull();

    const pseudocodeText = pre?.textContent || "";
    expect(BUBBLE_SORT_PSEUDOCODE).toHaveLength(9);
    expect(pseudocodeText).toContain("procedimento bubbleSort(A)");
    expect(pseudocodeText).toContain("para i de 0 até n - 2 faça");
    expect(pseudocodeText).toContain("para j de 0 até n - 2 - i faça");
    expect(pseudocodeText).toContain("se A[j] > A[j + 1] então");
    expect(pseudocodeText).toContain("trocar A[j] e A[j + 1]");
    expect(pseudocodeText).toContain("fim procedimento");
  });

  it("deve exibir a análise correta de complexidade assintótica e estabilidade dentro dos detalhes", async () => {
    await act(async () => {
      root.render(
        <BubbleModuleOverviewV2
          onStartTutorial={vi.fn()}
          onBack={vi.fn()}
        />
      );
    });

    const detailsText = container.querySelector("details")?.textContent || "";
    expect(detailsText).toContain("Comparações (todos os casos):");
    expect(detailsText).toContain("Θ(n²)");
    expect(detailsText).toContain("n(n - 1) / 2");
    expect(detailsText).toContain("sem flag de parada prematura");
    expect(detailsText).toContain("0 trocas físicas no melhor caso");
    expect(detailsText).toContain("Estável");
  });

  it("NÃO deve exibir jargões técnicos formais na camada principal fora do accordion de detalhes", async () => {
    await act(async () => {
      root.render(
        <BubbleModuleOverviewV2
          onStartTutorial={vi.fn()}
          onBack={vi.fn()}
        />
      );
    });

    const clone = container.cloneNode(true) as HTMLDivElement;
    const detailsInClone = clone.querySelector("details");
    if (detailsInClone) {
      detailsInClone.remove();
    }
    const mainLayerText = clone.textContent || "";

    expect(mainLayerText).not.toContain("passIndex");
    expect(mainLayerText).not.toContain("comparisonIndex");
    expect(mainLayerText).not.toContain("n - 2 - i");
    expect(mainLayerText).not.toContain("Θ(n²)");
    expect(mainLayerText).not.toContain("procedimento bubbleSort");
    expect(mainLayerText).not.toContain("invariante");
  });
});
