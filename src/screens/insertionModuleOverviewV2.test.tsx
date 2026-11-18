// @vitest-environment happy-dom
// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import InsertionModuleOverviewV2 from "./insertion/InsertionModuleOverviewV2";

describe("Insertion Sort Visual-First (UX-MODULE-R1) — Module Introduction Redesign", () => {
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

  it("deve renderizar o título dominante INSERTION SORT e a frase conceitual curta", async () => {
    const onStartTutorial = vi.fn();
    const onBack = vi.fn();

    await act(async () => {
      root.render(
        <InsertionModuleOverviewV2
          onStartTutorial={onStartTutorial}
          onBack={onBack}
        />
      );
    });

    const h1 = container.querySelector("h1");
    expect(h1).not.toBeNull();
    expect(h1?.textContent?.trim()).toBe("INSERTION SORT");

    const phrase = container.textContent || "";
    expect(phrase).toContain("Pegue um número e encaixe no lugar certo.");
    expect(phrase).toContain("Módulo 3 • Ordenação por Inserção");
  });

  it("deve exibir o exemplo visual com [2, 5, 3] e permitir navegar pelos passos até [2, 3, 5]", async () => {
    await act(async () => {
      root.render(
        <InsertionModuleOverviewV2
          onStartTutorial={vi.fn()}
          onBack={vi.fn()}
        />
      );
    });

    // Passo 1 inicial: visual hero deve ter aria-label acessível e caixas iniciais
    const heroVisual = container.querySelector('[role="img"]');
    expect(heroVisual).not.toBeNull();
    expect(heroVisual?.getAttribute("aria-label")).toContain(
      "Demonstração do Insertion Sort: o número 3 é retirado da lista como chave."
    );

    expect(heroVisual?.textContent).toContain("Exemplo com [2, 5, 3]");
    expect(heroVisual?.textContent).toContain("CHAVE");
    expect(heroVisual?.textContent).toContain("Vamos encaixar o 3.");
    expect(heroVisual?.textContent).toContain("VAGA");

    // Avança para o Passo 2: ABRA ESPAÇO
    const nextBtn = Array.from(heroVisual?.querySelectorAll("button") || []).find((b) =>
      b.textContent?.includes("Próximo")
    );
    expect(nextBtn).toBeTruthy();

    await act(async () => {
      nextBtn?.click();
    });

    expect(heroVisual?.textContent).toContain("5 é maior que 3, então ele desliza para a direita.");
    expect(heroVisual?.textContent).toContain("O 5 apenas desliza. Ele não troca de lugar com o 3.");

    // Avança para o Passo 3: ENCAIXE
    await act(async () => {
      nextBtn?.click();
    });

    expect(heroVisual?.textContent).toContain("Agora o 3 cabe aqui.");
    expect(heroVisual?.textContent).toContain("O vetor fica organizado: [2, 3, 5].");
    expect(heroVisual?.textContent).toContain("Chave encaixada no local certo");
    // Não deve exibir badge textual 'OK' no Hero
    expect(heroVisual?.textContent).not.toContain("OK");

    // No passo 3, o botão vira "↻ Rever"
    const reverBtn = Array.from(heroVisual?.querySelectorAll("button") || []).find((b) =>
      b.textContent?.includes("Rever")
    );
    expect(reverBtn).toBeTruthy();

    await act(async () => {
      reverBtn?.click();
    });

    // Volta ao passo 1
    expect(heroVisual?.textContent).toContain("Vamos encaixar o 3.");
  });

  it("deve renderizar os 3 passos: PEGUE, ABRA ESPAÇO e ENCAIXE", async () => {
    await act(async () => {
      root.render(
        <InsertionModuleOverviewV2
          onStartTutorial={vi.fn()}
          onBack={vi.fn()}
        />
      );
    });

    const stepsContainer = container.querySelector('[aria-label="Os 3 passos do Insertion Sort"]');
    expect(stepsContainer).not.toBeNull();

    const text = stepsContainer?.textContent || "";
    expect(text).toContain("PEGUE");
    expect(text).toContain("Escolha o próximo número.");
    expect(text).toContain("ABRA ESPAÇO");
    expect(text).toContain("Mova para a direita quem for maior.");
    expect(text).toContain("ENCAIXE");
    expect(text).toContain("Coloque a chave na vaga.");
  });

  it("deve acionar onStartTutorial ao clicar no CTA principal COMEÇAR TUTORIAL", async () => {
    const onStartTutorial = vi.fn();

    await act(async () => {
      root.render(
        <InsertionModuleOverviewV2
          onStartTutorial={onStartTutorial}
          onBack={vi.fn()}
        />
      );
    });

    const cta = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("COMEÇAR TUTORIAL")
    );
    expect(cta).toBeTruthy();

    await act(async () => {
      cta?.click();
    });

    expect(onStartTutorial).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain("Você vai praticar isso passo a passo.");
  });

  it("deve acionar onStartPractice no link secundário da área de CTA e onOpenDemonstration dentro dos detalhes", async () => {
    const onStartPractice = vi.fn();
    const onOpenDemonstration = vi.fn();

    await act(async () => {
      root.render(
        <InsertionModuleOverviewV2
          onStartTutorial={vi.fn()}
          onStartPractice={onStartPractice}
          onOpenDemonstration={onOpenDemonstration}
          onBack={vi.fn()}
        />
      );
    });

    // Caminho secundário único na área de CTA
    const practiceBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Ir para práticas")
    );
    expect(practiceBtn).toBeTruthy();

    await act(async () => {
      practiceBtn?.click();
    });
    expect(onStartPractice).toHaveBeenCalledTimes(1);

    // Demonstração disponível de forma subordinada dentro dos detalhes
    const details = container.querySelector("details");
    expect(details).not.toBeNull();
    const demoBtn = Array.from(details?.querySelectorAll("button") || []).find((b) =>
      b.textContent?.includes("Ver Demonstração Livre")
    );
    expect(demoBtn).toBeTruthy();

    await act(async () => {
      demoBtn?.click();
    });
    expect(onOpenDemonstration).toHaveBeenCalledTimes(1);
  });

  it("deve acionar onBack ao clicar em Voltar ao Início", async () => {
    const onBack = vi.fn();

    await act(async () => {
      root.render(
        <InsertionModuleOverviewV2
          onStartTutorial={vi.fn()}
          onBack={onBack}
        />
      );
    });

    const backBtn = container.querySelector('[aria-label="Voltar para a tela inicial"]');
    expect(backBtn).not.toBeNull();

    await act(async () => {
      (backBtn as HTMLButtonElement).click();
    });

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("deve manter a seção de detalhes técnicos fechada por padrão", async () => {
    await act(async () => {
      root.render(
        <InsertionModuleOverviewV2
          onStartTutorial={vi.fn()}
          onBack={vi.fn()}
        />
      );
    });

    const details = container.querySelector("details");
    expect(details).not.toBeNull();
    expect(details?.open).toBe(false);

    const summary = container.querySelector("summary");
    expect(summary?.textContent).toContain("Ver mais detalhes técnicos");
  });

  it("NÃO deve exibir 'ORD' na camada principal fora do accordion de detalhes", async () => {
    await act(async () => {
      root.render(
        <InsertionModuleOverviewV2
          onStartTutorial={vi.fn()}
          onBack={vi.fn()}
        />
      );
    });

    // Inspeciona todo o texto fora da tag details
    const clone = container.cloneNode(true) as HTMLElement;
    clone.querySelector("details")?.remove();

    const visibleMainText = clone.textContent || "";
    expect(visibleMainText).not.toMatch(/\bORD\b/);
    expect(visibleMainText).not.toContain("ORD LOCAL");
    expect(visibleMainText).not.toContain("2 ORD");
    expect(visibleMainText).not.toContain("3 ORD");
    expect(visibleMainText).not.toContain("5 ORD");
  });

  it("NÃO deve exibir pseudocódigo ou complexidade assintótica na camada principal visível por padrão", async () => {
    await act(async () => {
      root.render(
        <InsertionModuleOverviewV2
          onStartTutorial={vi.fn()}
          onBack={vi.fn()}
        />
      );
    });

    const clone = container.cloneNode(true) as HTMLElement;
    clone.querySelector("details")?.remove();

    const visibleMainText = clone.textContent || "";
    expect(visibleMainText).not.toContain("enquanto j >= 0");
    expect(visibleMainText).not.toContain("Θ(n²)");
    expect(visibleMainText).not.toContain("O(1)");
    expect(visibleMainText).not.toContain("Melhor Caso");
  });

  it("NÃO deve conter cabeçalhos de cards legados ('OBJETIVO DO MÓDULO', 'O QUE VOCÊ VAI APRENDER', etc.)", async () => {
    await act(async () => {
      root.render(
        <InsertionModuleOverviewV2
          onStartTutorial={vi.fn()}
          onBack={vi.fn()}
        />
      );
    });

    const fullText = container.textContent || "";
    expect(fullText).not.toContain("OBJETIVO DO MÓDULO");
    expect(fullText).not.toContain("O QUE VOCÊ VAI APRENDER");
    expect(fullText).not.toContain("O QUE VOCÊ VAI PRATICAR");
    expect(fullText).not.toContain("COMO FUNCIONA O CICLO");
    expect(fullText).not.toContain("AVISOS IMPORTANTES");
    expect(fullText).not.toContain("DESVIO E ENCAIXE DE CARGAS");
  });

  it("NÃO deve conter emojis de sistema (📌, 📖, 🔑, 🔍, etc.)", async () => {
    await act(async () => {
      root.render(
        <InsertionModuleOverviewV2
          onStartTutorial={vi.fn()}
          onBack={vi.fn()}
        />
      );
    });

    const fullText = container.textContent || "";
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    expect(emojiRegex.test(fullText)).toBe(false);
  });

  it("deve disponibilizar conteúdo formal completo quando o accordion for aberto sob demanda", async () => {
    await act(async () => {
      root.render(
        <InsertionModuleOverviewV2
          onStartTutorial={vi.fn()}
          onBack={vi.fn()}
        />
      );
    });

    const details = container.querySelector("details");
    expect(details).not.toBeNull();

    // O conteúdo formal está presente no DOM dentro do details
    const detailsText = details?.textContent || "";
    expect(detailsText).toContain("Definição Formal do Algoritmo");
    expect(detailsText).toContain("Chave e Vaga Aberta");
    expect(detailsText).toContain("Deslocamento (Shift) vs Troca (Swap)");
    expect(detailsText).toContain("Região Ordenada Local (ORD) vs Posição Definitiva (OK)");
    expect(detailsText).toContain("O conceito foi adiado para esta seção de aprofundamento para reduzir a carga conceitual inicial da introdução.");
    expect(detailsText).toContain("Pseudocódigo Canônico (11 linhas)");
    expect(detailsText).toContain("procedimento insertionSort(A)");
    expect(detailsText).toContain("enquanto j ≥ 0 e A[j] > chave faça");
    expect(detailsText).toContain("fim procedimento");
    expect(detailsText).toContain("Complexidade Assintótica");
    expect(detailsText).toContain("Melhor Caso (já ordenado): Θ(n)");
    expect(detailsText).toContain("Caso Médio: Θ(n²)");
    expect(detailsText).toContain("Pior Caso (ordem inversa): Θ(n²)");
    expect(detailsText).toContain("Espaço Auxiliar: Θ(1) / O(1)");
  });

  it("deve apresentar no máximo um caminho secundário na área de CTA principal", async () => {
    await act(async () => {
      root.render(
        <InsertionModuleOverviewV2
          onStartTutorial={vi.fn()}
          onStartPractice={vi.fn()}
          onOpenDemonstration={vi.fn()}
          onBack={vi.fn()}
        />
      );
    });

    // Inspeciona botões fora da tag details e do cabeçalho/stepper
    const clone = container.cloneNode(true) as HTMLElement;
    clone.querySelector("details")?.remove();

    // Localiza botões dentro da área de CTA
    const ctaButton = Array.from(clone.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("COMEÇAR TUTORIAL")
    );
    expect(ctaButton).toBeTruthy();

    const secondaryButtons = Array.from(clone.querySelectorAll("button")).filter(
      (b) => b.textContent?.includes("Ir para práticas")
    );
    expect(secondaryButtons.length).toBe(1);

    // Demonstração NÃO deve aparecer na área primária
    const demoButtonInPrimary = Array.from(clone.querySelectorAll("button")).filter(
      (b) => b.textContent?.includes("Ver demonstração") || b.textContent?.includes("Demonstração Livre")
    );
    expect(demoButtonInPrimary.length).toBe(0);
  });
});
