// @vitest-environment happy-dom
// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import InsertionTutorialScreenV2 from "./insertion/InsertionTutorialScreenV2";
import InsertionTutorialScreen from "./InsertionTutorialScreen";

describe("InsertionTutorialScreenV2 — Redesign Visual-First do Tutorial Guiado", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("deve renderizar o desafio inicial de predição para o vetor canônico [4, 2, 3]", async () => {
    const onComplete = vi.fn();
    const onBack = vi.fn();

    await act(async () => {
      root.render(
        <InsertionTutorialScreen onComplete={onComplete} onBack={onBack} />
      );
    });

    expect(container.textContent).toContain("Insertion Sort • Tutorial Guiado");
    expect(container.textContent).toContain(
      "OBSERVE A CHAVE ➔ COMPARE PARA TRÁS ➔ ABRA ESPAÇO ➔ ENCAIXE"
    );
    expect(container.textContent).toContain("A chave 2 deve ficar antes ou depois do 4?");

    // Verifica opções de predição
    const beforeBtn = container.querySelector<HTMLButtonElement>(
      '[data-testid="prediction-option-before"]'
    );
    const afterBtn = container.querySelector<HTMLButtonElement>(
      '[data-testid="prediction-option-after"]'
    );
    expect(beforeBtn).toBeTruthy();
    expect(afterBtn).toBeTruthy();

    // Seleciona "Antes do 4"
    await act(async () => {
      beforeBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.textContent).toContain("Excelente intuição!");

    const confirmBtn = container.querySelector<HTMLButtonElement>(
      '[data-testid="confirm-prediction-button"]'
    );
    expect(confirmBtn).toBeTruthy();

    await act(async () => {
      confirmBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Entra na esteira e verifica suspensão da chave e presença da vaga
    expect(container.textContent).toContain("TRILHO AÉREO DE SUSPENSÃO");
    expect(container.textContent).toContain("CHAVE SUSPENSA");
    expect(container.textContent).toContain("ESTEIRA DE TRIAGEM");
    expect(container.textContent).toContain("VAGA");
    expect(container.textContent).toContain("OBSERVANDO");
  });

  it("deve manter botões neutros, sem emoji de sistema e sem ORD na camada primária", async () => {
    const onComplete = vi.fn();
    const onBack = vi.fn();

    await act(async () => {
      root.render(
        <InsertionTutorialScreenV2 onComplete={onComplete} onBack={onBack} />
      );
    });

    // Confirma predição
    const beforeBtn = container.querySelector<HTMLButtonElement>(
      '[data-testid="prediction-option-before"]'
    );
    await act(async () => {
      beforeBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    const confirmBtn = container.querySelector<HTMLButtonElement>(
      '[data-testid="confirm-prediction-button"]'
    );
    await act(async () => {
      confirmBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Verifica ausência de emoji de sistema no DOM principal
    const rawText = container.textContent || "";
    expect(rawText).not.toMatch(/[💡⚠️ℹ️🏁✨🎯🎉]/);

    // Verifica ausência de "ORD" como badge primário
    const badges = Array.from(container.querySelectorAll("span")).map(
      (s) => s.textContent
    );
    expect(badges).not.toContain("ORD");

    // Verifica botões de decisão
    const shiftBtn = container.querySelector<HTMLButtonElement>(
      '[data-testid="decision-shift-right"]'
    );
    const insertBtn = container.querySelector<HTMLButtonElement>(
      '[data-testid="decision-insert-key"]'
    );
    expect(shiftBtn).toBeTruthy();
    expect(insertBtn).toBeTruthy();

    // Ambos devem ter classes neutras de fundo slate/slate-800, sem verde/vermelho antecipado
    expect(shiftBtn?.className).toContain("bg-slate-800");
    expect(insertBtn?.className).toContain("bg-slate-800");
  });

  it("deve tratar erro pedagógico sem avançar estado algorítmico e com feedback causal", async () => {
    const onComplete = vi.fn();
    const onBack = vi.fn();

    await act(async () => {
      root.render(
        <InsertionTutorialScreenV2 onComplete={onComplete} onBack={onBack} />
      );
    });

    // Confirma predição
    await act(async () => {
      container
        .querySelector<HTMLButtonElement>('[data-testid="prediction-option-before"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await act(async () => {
      container
        .querySelector<HTMLButtonElement>('[data-testid="confirm-prediction-button"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Tentativa errada: clicar em Encaixar quando 4 > 2 precisa abrir espaço
    const insertBtn = container.querySelector<HTMLButtonElement>(
      '[data-testid="decision-insert-key"]'
    );
    await act(async () => {
      insertBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Feedback causal de erro exibido
    expect(container.textContent).toContain("Atenção: o número 4 ainda é maior que a chave 2");

    // Chave permanece suspensa e vaga continua na posição original (preservada para leitores de tela)
    expect(container.textContent).toContain("CHAVE SUSPENSA");
    expect(container.textContent).toContain("Vaga física aberta na posição 2");
  });

  it("deve executar SHIFT_RIGHT mantendo a chave suspensa e apresentando o checkpoint conceitual", async () => {
    const onComplete = vi.fn();
    const onBack = vi.fn();

    await act(async () => {
      root.render(
        <InsertionTutorialScreenV2 onComplete={onComplete} onBack={onBack} />
      );
    });

    // Pula predição
    await act(async () => {
      container
        .querySelector<HTMLButtonElement>('[data-testid="prediction-option-before"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await act(async () => {
      container
        .querySelector<HTMLButtonElement>('[data-testid="confirm-prediction-button"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Executa SHIFT_RIGHT correto
    const shiftBtn = container.querySelector<HTMLButtonElement>(
      '[data-testid="decision-shift-right"]'
    );
    await act(async () => {
      shiftBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Avança timer de animação
    act(() => {
      vi.advanceTimersByTime(450);
    });

    // Verifica que o Checkpoint Conceitual único apareceu
    expect(container.textContent).toContain("Reflexão Conceitual • Deslocamento vs Troca");
    expect(container.textContent).toContain("O que acabou de acontecer com a carga 4?");

    const shiftOptionBtn = container.querySelector<HTMLButtonElement>(
      '[data-testid="checkpoint-option-shift"]'
    );
    expect(shiftOptionBtn).toBeTruthy();

    await act(async () => {
      shiftOptionBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.textContent).toContain(
      "Exato! Deslocamento NÃO é troca (SHIFT ≠ SWAP)"
    );

    // Clica em continuar para voltar à esteira
    const continueBtn = container.querySelector<HTMLButtonElement>(
      '[data-testid="checkpoint-continue-button"]'
    );
    await act(async () => {
      continueBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Agora estamos em INSERT_READY na cabeceira da esteira
    expect(container.textContent).toContain(
      "A cabeceira da esteira foi alcançada"
    );
  });

  it("deve conduzir todo o fluxo do tutorial até a conclusão e acionar onComplete", async () => {
    const onComplete = vi.fn();
    const onBack = vi.fn();

    await act(async () => {
      root.render(
        <InsertionTutorialScreenV2 onComplete={onComplete} onBack={onBack} />
      );
    });

    // 1. Predição
    await act(async () => {
      container
        .querySelector<HTMLButtonElement>('[data-testid="prediction-option-before"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await act(async () => {
      container
        .querySelector<HTMLButtonElement>('[data-testid="confirm-prediction-button"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // 2. Passo 1: 4 > 2 -> SHIFT_RIGHT
    await act(async () => {
      container
        .querySelector<HTMLButtonElement>('[data-testid="decision-shift-right"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    act(() => {
      vi.advanceTimersByTime(450);
    });

    // 3. Checkpoint conceitual
    await act(async () => {
      container
        .querySelector<HTMLButtonElement>('[data-testid="checkpoint-option-shift"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await act(async () => {
      container
        .querySelector<HTMLButtonElement>('[data-testid="checkpoint-continue-button"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // 4. Cabeceira alcançada -> INSERT_KEY da chave 2
    await act(async () => {
      container
        .querySelector<HTMLButtonElement>('[data-testid="decision-insert-key"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    act(() => {
      vi.advanceTimersByTime(450);
    });

    // 5. Passada 2 (chave 3 suspensa, inspecionando 4): 4 > 3 -> SHIFT_RIGHT
    expect(container.textContent).toContain("4 precisa deslizar para abrir espaço para a chave 3");
    await act(async () => {
      container
        .querySelector<HTMLButtonElement>('[data-testid="decision-shift-right"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    act(() => {
      vi.advanceTimersByTime(450);
    });

    // 6. Inspecionando 2: 2 <= 3 -> INSERT_KEY da chave 3
    expect(container.textContent).toContain("2 precisa deslizar para abrir espaço para a chave 3");
    await act(async () => {
      container
        .querySelector<HTMLButtonElement>('[data-testid="decision-insert-key"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    act(() => {
      vi.advanceTimersByTime(450);
    });

    // 7. Tutorial Concluído!
    expect(container.textContent).toContain("Tutorial Concluído com Sucesso!");

    // Clica para ir para a prática básica
    const finishBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Ir para a Prática Básica")
    );
    expect(finishBtn).toBeTruthy();

    await act(async () => {
      finishBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
