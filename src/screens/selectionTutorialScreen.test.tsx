// @vitest-environment happy-dom
// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import SelectionTutorialScreenV2 from "./selection/SelectionTutorialScreenV2";
import SelectionTutorialScreen from "./SelectionTutorialScreen";

describe("SelectionTutorialScreenV2 — Redesign Visual-First do Tutorial Guiado", () => {
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

  it("deve renderizar o desafio inicial de previsão e permitir iniciar a busca", async () => {
    const onComplete = vi.fn();
    const onBack = vi.fn();

    await act(async () => {
      root.render(
        <SelectionTutorialScreen onComplete={onComplete} onBack={onBack} />
      );
    });

    expect(container.textContent).toContain("Selection Sort • Tutorial Guiado");
    expect(container.textContent).toContain("PROCURE ➔ LEMBRE O MENOR ➔ POSICIONE");
    expect(container.textContent).toContain("Qual é o menor elemento de todo o vetor?");

    // Clicar na opção "1" do card de previsão
    const option1Btn = container.querySelector<HTMLButtonElement>(
      '[data-testid="prediction-option-1"]'
    );
    expect(option1Btn).toBeTruthy();

    await act(async () => {
      option1Btn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.textContent).toContain("Excelente intuição!");

    const startBtn = container.querySelector<HTMLButtonElement>(
      '[data-testid="confirm-prediction-button"]'
    );
    expect(startBtn).toBeTruthy();

    await act(async () => {
      startBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Agora deve estar na esteira com a pergunta dinâmica
    expect(container.textContent).toContain("O número 1 é menor que o menor atual, 4?");
    expect(container.textContent).toContain("Sim, é o novo menor");
    expect(container.textContent).toContain("Não, manter o menor");
  });

  it("deve manter caixas estáticas durante INSPECT e fornecer feedback causal para decisões", async () => {
    const onComplete = vi.fn();
    const onBack = vi.fn();

    await act(async () => {
      root.render(
        <SelectionTutorialScreenV2 onComplete={onComplete} onBack={onBack} />
      );
    });

    // Avançar previsão
    const option1 = container.querySelector<HTMLButtonElement>(
      '[data-testid="prediction-option-1"]'
    );
    await act(async () => {
      option1?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    const startBtn = container.querySelector<HTMLButtonElement>(
      '[data-testid="confirm-prediction-button"]'
    );
    await act(async () => {
      startBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Testar dica pedagógica
    const hintToggleBtn = container.querySelector<HTMLButtonElement>(
      '[data-testid="toggle-hint-button"]'
    );
    expect(hintToggleBtn).toBeTruthy();
    await act(async () => {
      hintToggleBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.textContent).toContain("Orientação Pedagógica:");

    // Decisão 1: O 1 é menor que o menor atual, 4? -> SIM (SELECT_NEW_MIN)
    const simBtn = container.querySelector<HTMLButtonElement>(
      '[data-testid="decision-select-new-min"]'
    );
    expect(simBtn).toBeTruthy();

    await act(async () => {
      simBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Feedback causal imediato
    expect(container.textContent).toContain("Correto! 1 é menor que 4");
    expect(container.textContent).toContain("As caixas permanecem no lugar!");

    // Segunda decisão da passada 1: scanner está no índice 2 (valor 3).
    // Menor atual é 1. Pergunta: O 3 é menor que 1?
    expect(container.textContent).toContain("O número 3 é menor que o menor atual, 1?");

    const naoBtn = container.querySelector<HTMLButtonElement>(
      '[data-testid="decision-keep-min"]'
    );
    expect(naoBtn).toBeTruthy();

    await act(async () => {
      naoBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Fim da varredura da passada 1 -> Estado COMMIT com Checkpoint Pedagógico
    expect(container.textContent).toContain("Varredura Concluída • Hora de Posicionar");
    expect(container.textContent).toContain("Qual número deve ir para a primeira posição?");
  });

  it("deve validar checkpoint pré-commit e animar movimentação apenas no COMMIT", async () => {
    const onComplete = vi.fn();
    const onBack = vi.fn();

    await act(async () => {
      root.render(
        <SelectionTutorialScreenV2 onComplete={onComplete} onBack={onBack} />
      );
    });

    // Previsão
    const option1 = container.querySelector<HTMLButtonElement>(
      '[data-testid="prediction-option-1"]'
    );
    await act(async () => {
      option1?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    const startBtn = container.querySelector<HTMLButtonElement>(
      '[data-testid="confirm-prediction-button"]'
    );
    await act(async () => {
      startBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Decisão 1: SIM
    const simBtn1 = container.querySelector<HTMLButtonElement>(
      '[data-testid="decision-select-new-min"]'
    );
    await act(async () => {
      simBtn1?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Decisão 2: NÃO
    const naoBtn1 = container.querySelector<HTMLButtonElement>(
      '[data-testid="decision-keep-min"]'
    );
    await act(async () => {
      naoBtn1?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Checkpoint: escolher resposta errada primeiro para testar feedback formativo
    const wrongCheckpointBtn = container.querySelector<HTMLButtonElement>(
      '[data-testid="checkpoint-option-4"]'
    );
    expect(wrongCheckpointBtn).toBeTruthy();
    await act(async () => {
      wrongCheckpointBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.textContent).toContain("o menor valor guardado até o final foi 1");

    // Escolher resposta correta no checkpoint
    const correctCheckpointBtn = container.querySelector<HTMLButtonElement>(
      '[data-testid="checkpoint-option-1"]'
    );
    expect(correctCheckpointBtn).toBeTruthy();
    await act(async () => {
      correctCheckpointBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Agora o botão de commit deve estar visível
    const commitBtn = container.querySelector<HTMLButtonElement>(
      '[data-testid="commit-button"]'
    );
    expect(commitBtn).toBeTruthy();

    await act(async () => {
      commitBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Animação disparada
    expect(container.textContent).toContain("Perfeito! O menor elemento (1) foi transferido");

    // Avançar timer da animação de troca
    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    // Agora deve estar na passada 2: A = [1, 4, 3], ordenado: [0]
    expect(container.textContent).toContain("1 posição ordenada");
    expect(container.textContent).toContain("O número 3 é menor que o menor atual, 4?");

    // Decisão passada 2: 3 < 4 -> SIM
    const simBtn2 = container.querySelector<HTMLButtonElement>(
      '[data-testid="decision-select-new-min"]'
    );
    await act(async () => {
      simBtn2?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Commit da passada 2 (não exige checkpoint pois i === 1)
    const commitBtn2 = container.querySelector<HTMLButtonElement>(
      '[data-testid="commit-button"]'
    );
    expect(commitBtn2).toBeTruthy();

    await act(async () => {
      commitBtn2?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    // Conclusão total do tutorial!
    expect(container.textContent).toContain("Treinamento Concluído com Sucesso!");
    expect(container.textContent).toContain("[1, 3, 4]");

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
