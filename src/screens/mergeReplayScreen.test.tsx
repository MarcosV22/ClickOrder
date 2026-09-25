// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import MergeReplayScreen from "./MergeReplayScreen";
import ResultScreen from "./ResultScreen";
import {
  initMergeSortState,
  executeMergeStep,
  assignMergeIdentities,
} from "../game/sorting/merge";
import type { MergeElement, MergeStepRecord } from "../game/sorting/merge/types";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe("Merge Sort Retrospective Replay & Synchronized Pseudocode (P3.1-E)", () => {
  let rootContainer: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    vi.useRealTimers();
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount();
      });
      root = null;
    }
    if (rootContainer) {
      rootContainer.remove();
      rootContainer = null;
    }
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  function mount(element: React.ReactElement): HTMLDivElement {
    rootContainer = document.createElement("div");
    document.body.appendChild(rootContainer);
    root = createRoot(rootContainer);
    act(() => {
      root?.render(element);
    });
    return rootContainer;
  }

  function createCompletedRun(rawValues: number[]) {
    const initialElements = assignMergeIdentities(rawValues);
    let state = initMergeSortState(initialElements);

    while (!state.completed && state.activeInterval !== null) {
      if (state.phase === "COMPARE_HEADS") {
        const leftVal = state.values[state.p1].value;
        const rightVal = state.values[state.p2].value;
        const decision = leftVal <= rightVal ? "DISPATCH_LEFT" : "DISPATCH_RIGHT";
        const res = executeMergeStep(state, decision);
        state = res.state;
      } else if (state.phase === "DRAIN_READY") {
        const res = executeMergeStep(state, "DRAIN_REMAINDER");
        state = res.state;
      }
    }

    return {
      initialElements,
      history: state.history,
      finalValues: state.values,
    };
  }

  it("renderiza o replay a partir do histórico factual com quadro 0 (Estado Inicial) zerado", () => {
    const { initialElements, history } = createCompletedRun([4, 1, 3, 2]);
    const container = mount(
      <MergeReplayScreen
        initialElements={initialElements}
        history={history}
        practiceTitle="PRÁTICA BÁSICA"
        onBackToResult={vi.fn()}
      />,
    );

    // Título e indicador do modo replay
    expect(container.textContent).toContain("MODO REPLAY // REVISÃO DA TENTATIVA");
    expect(container.textContent).toContain("PRÁTICA BÁSICA");
    expect(container.textContent).toContain("ESTADO INICIAL");
    expect(container.textContent).toContain("PASSO 0 /");

    // Métricas zeradas no quadro inicial
    expect(container.textContent).toContain("COMPARAÇÕES: 0");
    expect(container.textContent).toContain("TOTAL ESCRITAS: 0");

    // Pseudocódigo sincronizado presente
    expect(container.textContent).toContain("PSEUDOCÓDIGO CANÔNICO — MERGE SORT (30 LINHAS)");
    expect(container.textContent).toContain("procedimento mergeSort(A, inicio, fim)");
  });

  it("permite navegação temporal passo a passo (PRÓXIMO, ANTERIOR, INÍCIO, FIM)", () => {
    const { initialElements, history } = createCompletedRun([3, 1]);
    const container = mount(
      <MergeReplayScreen
        initialElements={initialElements}
        history={history}
        practiceTitle="PRÁTICA TESTE"
        onBackToResult={vi.fn()}
      />,
    );

    const nextBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("PRÓXIMO"),
    );
    const prevBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("ANTERIOR"),
    );
    const firstBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("INÍCIO"),
    );
    const lastBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("FIM"),
    );

    expect(nextBtn).toBeDefined();
    expect(prevBtn).toBeDefined();
    expect(firstBtn).toBeDefined();
    expect(lastBtn).toBeDefined();

    // No quadro 0, ANTERIOR está desabilitado
    expect(prevBtn?.hasAttribute("disabled")).toBe(true);

    // Avança para o passo 1
    act(() => {
      nextBtn?.click();
    });
    expect(container.textContent).toContain("PASSO 1 /");
    expect(prevBtn?.hasAttribute("disabled")).toBe(false);

    // Pula para o último quadro
    act(() => {
      lastBtn?.click();
    });
    expect(container.textContent).toContain(`PASSO ${history.length} / ${history.length}`);
    expect(container.textContent).toContain("ORDENAÇÃO CONCLUÍDA (OK)");
    expect(nextBtn?.hasAttribute("disabled")).toBe(true);

    // Retrocede um quadro
    act(() => {
      prevBtn?.click();
    });
    expect(container.textContent).toContain(`PASSO ${history.length - 1} / ${history.length}`);

    // Pula para o início
    act(() => {
      firstBtn?.click();
    });
    expect(container.textContent).toContain("PASSO 0 /");
    expect(container.textContent).toContain("ESTADO INICIAL");
  });

  it("remove badges e intervalos ordenados (ORD/OK) retroativamente ao voltar no tempo", () => {
    const { initialElements, history } = createCompletedRun([4, 2, 1, 3]);
    const container = mount(
      <MergeReplayScreen
        initialElements={initialElements}
        history={history}
        onBackToResult={vi.fn()}
      />,
    );

    const prevBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("ANTERIOR"),
    );
    const lastBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("FIM"),
    );

    // No último quadro, a ordenação está completa (OK)
    act(() => {
      lastBtn?.click();
    });
    expect(container.textContent).toContain("ORDENAÇÃO CONCLUÍDA (OK)");

    // Retrocede até o quadro 0
    act(() => {
      const firstBtn = Array.from(container.querySelectorAll("button")).find((b) =>
        b.textContent?.includes("INÍCIO"),
      );
      firstBtn?.click();
    });

    // Quadro 0 não possui badges de ordenação concluída nem intervalos ORD
    expect(container.textContent).not.toContain("ORDENAÇÃO CONCLUÍDA (OK)");
    expect(container.textContent).toContain("ESTADO INICIAL");
  });

  it("destaca as linhas de pseudocódigo sincronizadas e avaliações lógicas em cada fase", () => {
    const { initialElements, history } = createCompletedRun([3, 1]);
    const container = mount(
      <MergeReplayScreen
        initialElements={initialElements}
        history={history}
        onBackToResult={vi.fn()}
      />,
    );

    const nextBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("PRÓXIMO"),
    );

    // Avança passo a passo verificando presença de linhas do pseudocódigo
    expect(container.textContent).toContain("procedimento mergeSort(A, inicio, fim)");
    expect(container.textContent).toContain("procedimento intercalar(A, inicio, meio, fim)");
    expect(container.textContent).toContain("Buffer[k] ← A[p1]");
    expect(container.textContent).toContain("Buffer[k] ← A[p2]");

    // Avança até o despacho de p2
    act(() => {
      nextBtn?.click(); // DIVIDE
    });
    act(() => {
      nextBtn?.click(); // MERGE_INIT
    });
    act(() => {
      nextBtn?.click(); // DISPATCH (p2)
    });

    expect(container.textContent).toContain("FALSO (1 < 3)");
    expect(container.textContent).toContain("DESPACHO RAMAL DIREITO");
  });

  it("gerencia reprodução automática, velocidade e interrupção ao fim da fita", () => {
    vi.useFakeTimers();
    const { initialElements, history } = createCompletedRun([3, 1]);
    const container = mount(
      <MergeReplayScreen
        initialElements={initialElements}
        history={history}
        onBackToResult={vi.fn()}
      />,
    );

    const playBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("REPRODUZIR"),
    );
    expect(playBtn).toBeDefined();

    // Inicia reprodução
    act(() => {
      playBtn?.click();
    });
    expect(container.textContent).toContain("PAUSAR");

    // Avança o tempo e verifica transição de passos
    act(() => {
      vi.advanceTimersByTime(1400);
    });
    expect(container.textContent).toContain("PASSO 1 /");

    // Avança até o fim de todos os passos
    act(() => {
      vi.advanceTimersByTime(1400 * history.length);
    });
    expect(container.textContent).toContain(`PASSO ${history.length} / ${history.length}`);
    // Ao atingir o fim, o botão volta para REPRODUZIR (pausado automaticamente)
    expect(container.textContent).toContain("REPRODUZIR");
  });

  it("preserva ativação nativa de botões focados e ignora atalhos de espaço quando focado em controle", () => {
    const { initialElements, history } = createCompletedRun([3, 1]);
    const onBackMock = vi.fn();
    const container = mount(
      <MergeReplayScreen
        initialElements={initialElements}
        history={history}
        onBackToResult={onBackMock}
      />,
    );

    const backBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("VOLTAR AO RESULTADO"),
    );
    expect(backBtn).toBeDefined();

    // Foca no botão VOLTAR AO RESULTADO
    backBtn?.focus();

    // Dispara tecla Espaço com o botão focado
    const spaceEvent = new KeyboardEvent("keydown", {
      key: " ",
      bubbles: true,
      cancelable: true,
    });
    backBtn?.dispatchEvent(spaceEvent);

    // O listener global do replay não deve ter iniciado reprodução acidental
    expect(container.textContent).toContain("REPRODUZIR");
  });

  it("permite navegação por teclado (ArrowLeft, ArrowRight, Home, End) quando a tela está livre", () => {
    const { initialElements, history } = createCompletedRun([3, 1]);
    const container = mount(
      <MergeReplayScreen
        initialElements={initialElements}
        history={history}
        onBackToResult={vi.fn()}
      />,
    );

    // Desfoca qualquer controle
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // ArrowRight -> Avança
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "ArrowRight",
          bubbles: true,
          cancelable: true,
        }),
      );
    });
    expect(container.textContent).toContain("PASSO 1 /");

    // End -> Último
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "End",
          bubbles: true,
          cancelable: true,
        }),
      );
    });
    expect(container.textContent).toContain(`PASSO ${history.length} / ${history.length}`);

    // Home -> Primeiro
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Home",
          bubbles: true,
          cancelable: true,
        }),
      );
    });
    expect(container.textContent).toContain("PASSO 0 /");
  });

  it("habilita botão VER EXECUÇÃO em ResultScreen para Merge Sort e transiciona para o replay", () => {
    const onViewReplayMock = vi.fn();
    const container = mount(
      <ResultScreen
        finalArray={[1, 2, 3, 4]}
        swaps={0}
        comparisons={5}
        writesInBuffer={4}
        writesInMain={4}
        totalWrites={8}
        errors={0}
        hintsUsed={0}
        score={100}
        elapsedTimeMs={5000}
        phase={1}
        hasNextPhase={false}
        protocol="merge"
        onNext={vi.fn()}
        onRepeat={vi.fn()}
        onOpenSelector={vi.fn()}
        onViewReplay={onViewReplayMock}
      />
    );

    const viewReplayBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("VER EXECUÇÃO"),
    );
    expect(viewReplayBtn).toBeDefined();

    act(() => {
      viewReplayBtn?.click();
    });
    expect(onViewReplayMock).toHaveBeenCalledTimes(1);
  });
});
