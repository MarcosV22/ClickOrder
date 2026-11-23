// @vitest-environment happy-dom
// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import SelectionGameScreenV2 from "./selection/SelectionGameScreenV2";
import { buildSelectionCheckpointOptions } from "./selection/SelectionCommitCheckpoint";

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
    expect(container.textContent).toContain("Passada 1 de 2");
    expect(container.textContent).toContain("O número 1 é menor que o menor atual, 4?");
    expect(container.textContent).toContain("Sim, é o novo menor");
    expect(container.textContent).toContain("Não, manter o menor");

    // P-06: cabeçalho primário não exibe métricas concorrentes ao vivo
    const header = container.querySelector("header");
    expect(header?.textContent).not.toContain("Comparações:");
    expect(header?.textContent).not.toContain("Trocas:");
    expect(header?.textContent).not.toContain("Erros:");
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

    // Deve registrar erro nos detalhes técnicos (Nível 3) sem poluir o cabeçalho de Nível 1
    const header = container.querySelector("header");
    expect(header?.textContent).not.toContain("Erros:");
    const details = container.querySelector("details");
    expect(details?.textContent).toContain("1 erro(s)");
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

  it("P-04 e P-06: checkpoint pré-commit não exibe spoiler do menor valor, não ordena opções para fixar posição e Nível 1 não expõe INSPECT/COMMIT", async () => {
    // 1. Geração determinística sem ordenação crescente automática e sem posição fixa
    const optMid = buildSelectionCheckpointOptions([68, 74, 6, 26], 0);
    expect(optMid).toEqual([68, 74, 6, 26]); // 6 na posição 2 (não ordenado)

    const optEnd = buildSelectionCheckpointOptions([40, 30, 20, 10], 0);
    expect(optEnd).toEqual([40, 30, 20, 10]); // 10 na posição 3

    const optAsc = buildSelectionCheckpointOptions([10, 20, 30, 40], 0);
    expect(optAsc).toContain(10);
    expect(optAsc[0]).not.toBe(10); // rotacionado para não denunciar a 1ª posição em fatia ordenada
    expect(optAsc[0] < optAsc[1] && optAsc[1] < optAsc[2] && optAsc[2] < optAsc[3]).toBe(false);

    const optDup = buildSelectionCheckpointOptions([30, 10, 30, 20], 0);
    expect(optDup).toEqual([30, 10, 20]); // distintos e válidos

    // 2. Renderização real do checkpoint sobre [68, 74, 6, 26]
    const onComplete = vi.fn();
    await act(async () => {
      root.render(
        <SelectionGameScreenV2
          onComplete={onComplete}
          initialArray={[68, 74, 6, 26]}
          phase={1}
        />
      );
    });

    // Passada 1: j=1 (74 >= 68 -> 2), j=2 (6 < 68 -> 1), j=3 (26 >= 6 -> 2)
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "2" }));
    });
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "1" }));
    });
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "2" }));
    });

    // Agora estamos no Checkpoint Pré-Commit da Passada 1
    expect(container.textContent).toContain("Qual número deve ir para a primeira posição?");
    // P-04: NÃO pode revelar "Transferir o menor encontrado (6)" enquanto o checkpoint estiver aberto!
    expect(container.textContent).not.toContain("Transferir o menor encontrado");

    // Ordem dos botões no DOM deve ser [68, 74, 6, 26] (6 não está na 1ª posição!)
    const optionBtns = Array.from(
      container.querySelectorAll<HTMLButtonElement>('[data-testid^="checkpoint-option-"]')
    );
    expect(optionBtns.map((b) => Number(b.textContent))).toEqual([68, 74, 6, 26]);

    // Errar no checkpoint apresentacional NÃO altera errors da engine
    await act(async () => {
      optionBtns[0]?.dispatchEvent(new MouseEvent("click", { bubbles: true })); // clica 68
    });
    const detailsBefore = container.querySelector("details");
    expect(detailsBefore?.textContent).not.toContain("erro(s)");

    // Acertar clicando em 6 libera o botão de posicionamento
    await act(async () => {
      optionBtns[2]?.dispatchEvent(new MouseEvent("click", { bubbles: true })); // clica 6
    });

    // P-06: Nível 1 (fora de <details>) usa BUSCA e POSICIONAMENTO, sem termos internos INSPECT/COMMIT
    const mainWithoutDetails = Array.from(container.querySelectorAll("main > *:not(details)"))
      .map((el) => el.textContent)
      .join(" ");
    expect(mainWithoutDetails).toContain("BUSCA");
    expect(mainWithoutDetails).toContain("POSICIONAMENTO");
    expect(mainWithoutDetails).not.toContain("INSPECT");
    expect(mainWithoutDetails).not.toContain("COMMIT");
  });
});
