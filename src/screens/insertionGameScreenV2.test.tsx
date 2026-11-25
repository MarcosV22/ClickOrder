// @vitest-environment happy-dom
// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import InsertionGameScreenV2 from "./insertion/InsertionGameScreenV2";

describe("InsertionGameScreenV2 — Prática Básica Visual-First", () => {
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

  it("deve renderizar a esteira, trilho suspenso, progresso e pergunta central inicial", async () => {
    const onComplete = vi.fn();

    await act(async () => {
      root.render(
        <InsertionGameScreenV2
          onComplete={onComplete}
          initialArray={[3, 1, 2]}
          level="basic"
          practiceTitle="PRÁTICA BÁSICA"
        />
      );
    });

    expect(container.textContent).toContain("Insertion Sort • PRÁTICA BÁSICA");
    expect(container.textContent).toContain("Passada 1 de 2");

    // Redução de ruído: métricas operacionais removidas do cabeçalho de decisão primário
    const headerSection = container.querySelector("main > div:first-child");
    expect(headerSection?.textContent).not.toContain("Deslocamentos:");
    expect(headerSection?.textContent).not.toContain("Inserções:");
    expect(headerSection?.textContent).not.toContain("Comparações:");
    expect(headerSection?.textContent).not.toContain("Tentativas incorretas:");

    // Trilho e Esteira
    expect(container.textContent).toContain("TRILHO AÉREO DE SUSPENSÃO");
    expect(container.textContent).toContain("CHAVE SUSPENSA");
    expect(container.textContent).toContain("ESTEIRA DE TRIAGEM");
    expect(container.textContent).toContain("VAGA");
    expect(container.textContent).toContain("OBSERVANDO");

    // Pergunta central dinâmica: 3 precisa deslizar para abrir espaço para a chave 1?
    expect(container.textContent).toContain(
      "O número 3 precisa deslizar para abrir espaço para a chave 1?"
    );

    // Botões de decisão
    const shiftBtn = container.querySelector<HTMLButtonElement>(
      '[data-testid="decision-shift-right"]'
    );
    const insertBtn = container.querySelector<HTMLButtonElement>(
      '[data-testid="decision-insert-key"]'
    );
    expect(shiftBtn).toBeTruthy();
    expect(insertBtn).toBeTruthy();

    // Sem ORD na camada primária
    const badges = Array.from(container.querySelectorAll("span")).map(
      (s) => s.textContent
    );
    expect(badges).not.toContain("ORD");

    // Invariante: ORD NÃO É OK. Durante a execução, nenhum bloco deve ter role="sorted" (OK definitivo)
    const boxes = Array.from(
      container.querySelectorAll('[role="region"][aria-label*="Trilho"] button')
    );
    boxes.forEach((box) => {
      expect(box.getAttribute("aria-label")).not.toContain("em sua posição final ordenada");
    });

    // Sem emojis de sistema
    expect(container.textContent).not.toMatch(/[💡⚠️ℹ️🏁✨🎯🎉]/);
  });

  it("deve responder a atalhos de teclado 1 e 2 para tomar decisões", async () => {
    const onComplete = vi.fn();

    await act(async () => {
      root.render(
        <InsertionGameScreenV2
          onComplete={onComplete}
          initialArray={[3, 1, 2]}
        />
      );
    });

    // Tecla 1 dispara SHIFT_RIGHT
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "1" }));
    });

    expect(container.textContent).toContain(
      "O número 3 é maior que a chave 1 e deslizou para a direita abrindo espaço"
    );

    act(() => {
      vi.advanceTimersByTime(400);
    });

    // Agora em INSERT_READY na cabeceira da esteira
    expect(container.textContent).toContain("A cabeceira da esteira foi alcançada");

    // Tecla 1 ou Enter em INSERT_READY dispara INSERT_KEY
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "1" }));
    });

    expect(container.textContent).toContain("a chave 1 desceu e encaixou na vaga aberta");
  });

  it("deve tratar erro pedagógico incrementando erros sem avançar estado algorítmico", async () => {
    const onComplete = vi.fn();

    await act(async () => {
      root.render(
        <InsertionGameScreenV2
          onComplete={onComplete}
          initialArray={[3, 1, 2]}
        />
      );
    });

    // Tenta encaixar a chave 1 quando 3 > 1 (ação incorreta)
    const insertBtn = container.querySelector<HTMLButtonElement>(
      '[data-testid="decision-insert-key"]'
    );
    await act(async () => {
      insertBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Feedback causal de erro exibido
    expect(container.textContent).toContain(
      "Atenção: o número 3 ainda é maior que a chave 1"
    );

    // Tentativas incorretas registradas nos detalhes técnicos (Nível 3), sem poluir o cabeçalho de decisão
    const headerSection = container.querySelector("main > div:first-child");
    expect(headerSection?.textContent).not.toContain("Tentativas incorretas:");
    const techDetails = container.querySelector("details");
    expect(techDetails?.textContent).toContain("1 erro(s)");

    // A chave continua suspensa e o estado não avançou
    expect(container.textContent).toContain("CHAVE SUSPENSA");
  });

  it("deve permitir acionar dicas sem induzir a resposta diretamente", async () => {
    const onComplete = vi.fn();

    await act(async () => {
      root.render(
        <InsertionGameScreenV2
          onComplete={onComplete}
          initialArray={[3, 1, 2]}
        />
      );
    });

    const hintBtn = container.querySelector<HTMLButtonElement>(
      '[data-testid="toggle-hint-button"]'
    );
    expect(hintBtn).toBeTruthy();

    await act(async () => {
      hintBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.textContent).toContain(
      "Compare o número observado com a chave. Se ele for maior, precisa abrir espaço"
    );
    expect(container.textContent).not.toContain("Clique no botão 1");
  });

  it("deve conduzir a prática completa até a finalização correta das métricas e onComplete", async () => {
    const onComplete = vi.fn();

    await act(async () => {
      root.render(
        <InsertionGameScreenV2
          onComplete={onComplete}
          initialArray={[3, 1, 2]}
        />
      );
    });

    // Passo 1: 3 > 1 -> SHIFT_RIGHT
    await act(async () => {
      container
        .querySelector<HTMLButtonElement>('[data-testid="decision-shift-right"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });

    // Passo 2: Cabeceira -> INSERT_KEY
    await act(async () => {
      container
        .querySelector<HTMLButtonElement>('[data-testid="decision-insert-key"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });

    // Passo 3: Passada 2, chave 2, comparando 3: 3 > 2 -> SHIFT_RIGHT
    await act(async () => {
      container
        .querySelector<HTMLButtonElement>('[data-testid="decision-shift-right"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });

    // Passo 4: comparando 1: 1 <= 2 -> INSERT_KEY
    await act(async () => {
      container
        .querySelector<HTMLButtonElement>('[data-testid="decision-insert-key"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });

    // P-08D: Conclusão única direta sem exigir segundo clique em "Concluir Prática e Ver Resultados"
    const redundantCompleteBtn = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.includes("Concluir Prática")
    );
    expect(redundantCompleteBtn).toBeUndefined();

    expect(onComplete).toHaveBeenCalledTimes(1);
    const completeData = onComplete.mock.calls[0][0];
    expect(completeData.protocol).toBe("insertion");
    expect(completeData.level).toBe("basic");
    expect(completeData.finalArray).toEqual([1, 2, 3]);
    expect(completeData.errors).toBe(0);
    expect(completeData.score).toBe(100);
  });

  it("P-07: reiniciar limpa hintsUsed, erros, penalidades de score e estados transitórios para a nova tentativa", async () => {
    const onComplete = vi.fn();

    await act(async () => {
      root.render(
        <InsertionGameScreenV2
          onComplete={onComplete}
          initialArray={[3, 1, 2]}
        />
      );
    });

    // 1. Solicitar dica na tentativa inicial (hintsUsed = 1)
    const hintBtn = container.querySelector<HTMLButtonElement>(
      '[data-testid="toggle-hint-button"]'
    );
    await act(async () => {
      hintBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.textContent).toContain("[Dica]");

    // 2. Cometer erro na tentativa inicial (errors = 1)
    await act(async () => {
      container
        .querySelector<HTMLButtonElement>('[data-testid="decision-insert-key"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.querySelector("details")?.textContent).toContain("1 erro(s)");

    // 3. Reiniciar a tentativa pelo cabeçalho
    const restartBtn = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.trim() === "Reiniciar"
    );
    expect(restartBtn).toBeTruthy();
    await act(async () => {
      restartBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Dica visível, erros e feedback da tentativa anterior foram limpos
    expect(container.textContent).not.toContain("[Dica]");
    expect(container.querySelector("details")?.textContent).not.toContain("erro(s)");

    // 4. Concluir a nova tentativa sobre [3, 1, 2] sem pedir dica e sem errar
    // Passo 1: 3 > 1 -> SHIFT_RIGHT (confirma também SHIFT !== SWAP: chave 1 continua suspensa durante o shift)
    await act(async () => {
      container
        .querySelector<HTMLButtonElement>('[data-testid="decision-shift-right"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.textContent).toContain("A chave continua suspensa!");
    act(() => {
      vi.advanceTimersByTime(400);
    });

    // Passo 2: INSERT_KEY (chave 1)
    await act(async () => {
      container
        .querySelector<HTMLButtonElement>('[data-testid="decision-insert-key"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });

    // Passo 3: 3 > 2 -> SHIFT_RIGHT
    await act(async () => {
      container
        .querySelector<HTMLButtonElement>('[data-testid="decision-shift-right"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });

    // Passo 4: 1 <= 2 -> INSERT_KEY (chave 2)
    await act(async () => {
      container
        .querySelector<HTMLButtonElement>('[data-testid="decision-insert-key"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });

    // 5. Verificar disparo direto único de onComplete com score 100 e zero dicas/erros herdados
    expect(onComplete).toHaveBeenCalledTimes(1);
    const payload = onComplete.mock.calls[0][0];
    expect(payload.errors).toBe(0);
    expect(payload.hintsUsed).toBe(0);
    expect(payload.score).toBe(100);
    expect(payload.finalArray).toEqual([1, 2, 3]);
  });

  it("P-09: oculta índices visuais #1..#4 por padrão na esteira, preserva acessibilidade em aria-label/sr-only e exibe índices ao abrir Nível 3", async () => {
    await act(async () => {
      root.render(
        <InsertionGameScreenV2
          onComplete={vi.fn()}
          initialArray={[5, 2, 4, 1]}
        />
      );
    });

    const conveyorRegion = container.querySelector(
      '[role="region"][aria-label*="Trilho"]'
    );
    expect(conveyorRegion).toBeTruthy();

    // Conceitos essenciais permanecem visíveis
    expect(conveyorRegion?.textContent).toContain("CHAVE");
    expect(conveyorRegion?.textContent).toContain("VAGA");
    expect(conveyorRegion?.textContent).toContain("OBSERVANDO");

    // P-09: Índices visuais (#1, #2, #3, #4) ocultos por padrão na esteira
    const visibleSpans = Array.from(conveyorRegion!.querySelectorAll("span")).map((s) =>
      s.textContent?.trim()
    );
    expect(visibleSpans).not.toContain("#1");
    expect(visibleSpans).not.toContain("#2");
    expect(visibleSpans).not.toContain("#3");
    expect(visibleSpans).not.toContain("#4");

    // Informação equivalente preservada para leitores de tela (aria-label + sr-only)
    const holeStatus = conveyorRegion?.querySelector('[role="status"]');
    expect(holeStatus?.getAttribute("aria-label")).toContain("posição 2");
    const boxButtons = Array.from(conveyorRegion!.querySelectorAll("button"));
    expect(
      boxButtons.some((b) => b.getAttribute("aria-label")?.includes("Caixa #1"))
    ).toBe(true);
    expect(conveyorRegion?.querySelector(".sr-only")?.textContent).toContain(
      "Vaga física aberta na posição 2"
    );

    // Ao abrir a gaveta técnica de Nível 3 (<details>), os índices #1..#4 aparecem sob demanda
    const detailsEl = container.querySelector("details") as HTMLDetailsElement;
    expect(detailsEl).toBeTruthy();
    await act(async () => {
      detailsEl.open = true;
      detailsEl.dispatchEvent(new Event("toggle"));
    });

    const spansAfterOpen = Array.from(conveyorRegion!.querySelectorAll("span")).map(
      (s) => s.textContent?.trim()
    );
    expect(spansAfterOpen).toContain("#1");
    expect(spansAfterOpen).toContain("#2");
    expect(spansAfterOpen).toContain("#3");
    expect(spansAfterOpen).toContain("#4");
  });
});
