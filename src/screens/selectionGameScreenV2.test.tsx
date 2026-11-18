// @vitest-environment happy-dom
// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import SelectionGameScreenV2 from "./selection/SelectionGameScreenV2";

describe("SelectionGameScreenV2 — Prática Básica Visual-First", () => {
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

  it("deve renderizar a esteira, cabeçalho e pergunta central inicial", async () => {
    const onComplete = vi.fn();

    await act(async () => {
      root.render(
        <SelectionGameScreenV2
          onComplete={onComplete}
          initialArray={[4, 1, 3]}
          phase={1}
          practiceTitle="PRÁTICA BÁSICA"
        />
      );
    });

    expect(container.textContent).toContain("Selection Sort • PRÁTICA BÁSICA");
    expect(container.textContent).toContain("Comparações:");
    expect(container.textContent).toContain("Trocas:");
    expect(container.textContent).toContain("O número 1 é menor que o menor atual, 4?");
    expect(container.textContent).toContain("Sim, é o novo menor");
    expect(container.textContent).toContain("Não, manter o menor");
  });

  it("deve tratar decisões incorretas incrementando erros e exibindo feedback causal sem mover caixas", async () => {
    const onComplete = vi.fn();

    await act(async () => {
      root.render(
        <SelectionGameScreenV2
          onComplete={onComplete}
          initialArray={[4, 1, 3]}
          phase={1}
        />
      );
    });

    // Errar de propósito: 1 < 4, mas usuário escolhe "Não, manter o menor"
    const naoBtn = container.querySelector<HTMLButtonElement>(
      '[data-testid="decision-keep-min"]'
    );
    expect(naoBtn).toBeTruthy();

    await act(async () => {
      naoBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Deve registrar erro
    expect(container.textContent).toContain("Erros: 1");
    expect(container.textContent).toContain("Atenção: 1 é menor que 4!");

    // O scanner continua no mesmo lugar (não avança)
    expect(container.textContent).toContain("O número 1 é menor que o menor atual, 4?");
  });

  it("deve suportar teclas de atalho 1 e 2 para tomar decisões", async () => {
    const onComplete = vi.fn();

    await act(async () => {
      root.render(
        <SelectionGameScreenV2
          onComplete={onComplete}
          initialArray={[4, 1, 3]}
          phase={1}
        />
      );
    });

    // Pressionar tecla "1" (Sim, é o novo menor)
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "1" }));
    });

    expect(container.textContent).toContain("Correto! 1 é menor que 4");
    // Agora o scanner avança para j=2 (valor 3), minIndex é 1 (valor 1)
    expect(container.textContent).toContain("O número 3 é menor que o menor atual, 1?");

    // Pressionar tecla "2" (Não, manter o menor)
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "2" }));
    });

    // Concluiu a varredura da passada 1 -> Transição para COMMIT
    expect(container.textContent).toContain("Varredura Concluída • Hora de Posicionar");
  });

  it("deve computar métricas completas e invocar onComplete ao concluir a prática", async () => {
    const onComplete = vi.fn();

    await act(async () => {
      root.render(
        <SelectionGameScreenV2
          onComplete={onComplete}
          initialArray={[4, 1, 3]}
          phase={1}
        />
      );
    });

    // Abrir dica pedagógica para validar registro de dicas usadas
    const hintBtn = container.querySelector<HTMLButtonElement>(
      '[data-testid="toggle-hint-button"]'
    );
    expect(hintBtn).toBeTruthy();
    await act(async () => {
      hintBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.textContent).toContain("Orientação Pedagógica:");

    // Passada 1 - Inspeção 1: Sim (1 < 4)
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "1" }));
    });

    // Passada 1 - Inspeção 2: Não (3 não < 1)
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "2" }));
    });

    // Passada 1 - Checkpoint Pré-Commit: responder 1
    const checkpointBtn = container.querySelector<HTMLButtonElement>(
      '[data-testid="checkpoint-option-1"]'
    );
    expect(checkpointBtn).toBeTruthy();
    await act(async () => {
      checkpointBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Passada 1 - Commit
    const commitBtn1 = container.querySelector<HTMLButtonElement>(
      '[data-testid="commit-button"]'
    );
    expect(commitBtn1).toBeTruthy();
    await act(async () => {
      commitBtn1?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    // Passada 2 - Inspeção: Sim (3 < 4)
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "1" }));
    });

    // Passada 2 - Commit
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

    // Tela de conclusão
    expect(container.textContent).toContain("Prática Concluída com Sucesso!");
    expect(container.textContent).toContain("Dicas Usadas");

    const finishBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Concluir Prática")
    );
    expect(finishBtn).toBeTruthy();

    await act(async () => {
      finishBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
    const payload = onComplete.mock.calls[0][0];
    expect(payload.protocol).toBe("selection");
    expect(payload.phase).toBe(1);
    expect(payload.finalArray).toEqual([1, 3, 4]);
    expect(payload.comparisons).toBe(3);
    expect(payload.swaps).toBe(2);
    expect(payload.hintsUsed).toBe(1);
    expect(payload.score).toBeGreaterThan(0);
  });

  it("não deve conter o termo 'vaga' ou emojis de sistema na UI da prática básica", async () => {
    const onComplete = vi.fn();

    await act(async () => {
      root.render(
        <SelectionGameScreenV2
          onComplete={onComplete}
          initialArray={[4, 1, 3]}
          phase={1}
        />
      );
    });

    // Verifica esteira inicial
    expect(container.textContent).not.toMatch(/\bvagas?\b/i);
    expect(container.textContent).not.toMatch(/[\uD83C-\uDBFF\uDC00-\uDFFF]/);
    expect(container.textContent).toContain("próxima posição");
    expect(container.textContent).toContain("menor atual");
    expect(container.textContent).toContain("Dica");
  });
});
