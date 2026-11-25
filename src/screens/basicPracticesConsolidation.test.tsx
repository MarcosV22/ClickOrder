// @vitest-environment happy-dom
// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import App from "../App";
import {
  STORAGE_KEY,
  createDefaultSaveData,
  saveGameProgress,
  loadGameProgress,
  recordExerciseCompletion,
  BUBBLE_EXERCISE_SETS,
  SELECTION_EXERCISE_SETS,
  INSERTION_EXERCISE_SETS,
} from "../game/persistence";
import {
  BUBBLE_SORT_PSEUDOCODE,
  SELECTION_SORT_PSEUDOCODE,
} from "../game/replay";
import { INSERTION_SORT_PSEUDOCODE } from "../game/sorting/insertion";
import {
  getExpectedComparison,
  createBubbleSortState,
  executeUserStep,
} from "../game/sorting";
import {
  createSelectionSortState,
  executeSelectionInspection,
} from "../game/sorting/selection";
import {
  createInsertionSortState,
  executeInsertionStep,
} from "../game/sorting/insertion";

function clickElement(el: Element | null | undefined) {
  expect(el).toBeTruthy();
  el!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
}

function findButtonByText(container: HTMLElement, text: string): HTMLButtonElement | undefined {
  return Array.from(container.querySelectorAll<HTMLButtonElement>("button")).find((btn) =>
    btn.textContent?.includes(text)
  );
}

describe("UX-PRACTICE-R3.2 — Consolidação de Navegação, Progressão, Scaffolding Fading e Fluxo Único", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    window.localStorage.clear();
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
    window.localStorage.clear();
  });

  async function openModuleSelectorFromHome(moduleLabel: "Bubble Sort" | "Selection Sort" | "Insertion Sort") {
    // Na HomeScreen, cada card possui aria-label explícito com o nome do algoritmo
    const startBtn = Array.from(container.querySelectorAll<HTMLButtonElement>("button")).find(
      (b) =>
        b.getAttribute("aria-label")?.toLowerCase().includes(moduleLabel.toLowerCase()) ||
        b.closest("article")?.textContent?.includes(moduleLabel)
    );
    expect(startBtn).toBeTruthy();
    await act(async () => {
      clickElement(startBtn);
    });

    // Overview V2 -> clicar em "Ir para práticas"
    const goToPracticesBtn = findButtonByText(container, "Ir para práticas");
    expect(goToPracticesBtn).toBeTruthy();
    await act(async () => {
      clickElement(goToPracticesBtn);
    });
  }

  async function clickPracticeCardAction(cardTitle: "PRÁTICA BÁSICA" | "PRÁTICA INTERMEDIÁRIA" | "PRÁTICA AVANÇADA") {
    const heading = Array.from(container.querySelectorAll("h2, h3")).find(
      (el) => el.textContent?.trim() === cardTitle
    );
    expect(heading).toBeTruthy();
    const cardContainer = heading?.closest(".rounded-xl, .rounded-2xl");
    const btn = cardContainer?.querySelector<HTMLButtonElement>("button:not(:disabled)");
    expect(btn).toBeTruthy();
    await act(async () => {
      clickElement(btn);
    });
  }

  describe("1. Roteamento das 9 Práticas Regulares (Home -> Overview -> PracticeSelector -> Básica V2 / Intermediária reduced / Avançada minimal)", () => {
    it("Bubble Sort: Básica usa BubbleGameScreenV2; Intermediária usa GameScreen (SUPORTE REDUZIDO); Avançada usa GameScreen (AUTONOMIA MÁXIMA)", async () => {
      let save = createDefaultSaveData();
      save = recordExerciseCompletion(save, "bubble", BUBBLE_EXERCISE_SETS.BASIC, {
        score: 100,
        errors: 0,
        hintsUsed: 0,
        elapsedTimeMs: 10000,
      });
      save = recordExerciseCompletion(save, "bubble", BUBBLE_EXERCISE_SETS.INTERMEDIATE, {
        score: 90,
        errors: 1,
        hintsUsed: 0,
        elapsedTimeMs: 15000,
      });
      saveGameProgress(save);

      await act(async () => {
        root.render(<App />);
      });

      await openModuleSelectorFromHome("Bubble Sort");
      expect(container.textContent).toContain("MÓDULO • BUBBLE SORT");

      // 1A. Home -> Bubble -> Basic V2
      await clickPracticeCardAction("PRÁTICA BÁSICA");
      expect(container.textContent).toContain("Previsão Antes de Agir");
      expect(container.querySelector('[data-testid="back-to-practices"]')?.textContent).toContain("Práticas");
      expect(container.textContent).not.toContain("SUPORTE REDUZIDO");

      // Retorno ao seletor do Bubble
      await act(async () => {
        clickElement(container.querySelector('[data-testid="back-to-practices"]'));
      });
      expect(container.textContent).toContain("MÓDULO • BUBBLE SORT");

      // 1B. Home -> Bubble -> Intermediate legado (SUPORTE REDUZIDO)
      await clickPracticeCardAction("PRÁTICA INTERMEDIÁRIA");
      expect(container.textContent).toContain("SUPORTE REDUZIDO");
      expect(container.textContent).toContain("Par sob Inspeção:");
      expect(container.textContent).not.toContain("Previsão Antes de Agir");

      // Retorno ao seletor do Bubble a partir da tela legada
      const backBtnInter = findButtonByText(container, "PRÁTICAS") ?? findButtonByText(container, "SELETOR");
      expect(backBtnInter).toBeTruthy();
      await act(async () => {
        clickElement(backBtnInter);
      });
      expect(container.textContent).toContain("MÓDULO • BUBBLE SORT");

      // 1C. Home -> Bubble -> Advanced legado (AUTONOMIA MÁXIMA)
      await clickPracticeCardAction("PRÁTICA AVANÇADA");
      expect(container.textContent).toContain("AUTONOMIA MÁXIMA");
      expect(container.textContent).toContain("Par sob Inspeção:");
      expect(container.textContent).not.toContain("Previsão Antes de Agir");
    });

    it("Selection Sort: Básica usa SelectionGameScreenV2; Intermediária usa SelectionGameScreen (SUPORTE REDUZIDO); Avançada usa SelectionGameScreen (AUTONOMIA MÁXIMA)", async () => {
      let save = createDefaultSaveData();
      save = recordExerciseCompletion(save, "selection", SELECTION_EXERCISE_SETS.BASIC, {
        score: 100,
        errors: 0,
        hintsUsed: 0,
        elapsedTimeMs: 12000,
      });
      save = recordExerciseCompletion(save, "selection", SELECTION_EXERCISE_SETS.INTERMEDIATE, {
        score: 95,
        errors: 0,
        hintsUsed: 1,
        elapsedTimeMs: 18000,
      });
      saveGameProgress(save);

      await act(async () => {
        root.render(<App />);
      });

      await openModuleSelectorFromHome("Selection Sort");
      expect(container.textContent).toContain("MÓDULO • SELECTION SORT");

      // 2A. Selection Basic V2
      await clickPracticeCardAction("PRÁTICA BÁSICA");
      expect(container.textContent).toContain("Selection Sort • PRÁTICA BÁSICA");
      expect(container.textContent).toContain("Decisão de Comparação");
      expect(container.querySelector('[data-testid="back-to-practices"]')?.textContent).toContain("Práticas");

      await act(async () => {
        clickElement(container.querySelector('[data-testid="back-to-practices"]'));
      });
      expect(container.textContent).toContain("MÓDULO • SELECTION SORT");

      // 2B. Selection Intermediate legado (SUPORTE REDUZIDO)
      await clickPracticeCardAction("PRÁTICA INTERMEDIÁRIA");
      expect(container.textContent).toContain("SUPORTE REDUZIDO");
      expect(container.textContent).toContain("Candidato Mín:");

      const backSelInter = findButtonByText(container, "PRÁTICAS") ?? findButtonByText(container, "SELETOR");
      await act(async () => {
        clickElement(backSelInter);
      });
      expect(container.textContent).toContain("MÓDULO • SELECTION SORT");

      // 2C. Selection Advanced legado (AUTONOMIA MÁXIMA)
      await clickPracticeCardAction("PRÁTICA AVANÇADA");
      expect(container.textContent).toContain("AUTONOMIA MÁXIMA");
      expect(container.textContent).toContain("Candidato Mín:");
    });

    it("Insertion Sort: Básica usa InsertionGameScreenV2; Intermediária usa InsertionGameScreen (SUPORTE REDUZIDO); Avançada usa InsertionGameScreen (AUTONOMIA MÁXIMA)", async () => {
      let save = createDefaultSaveData();
      save = recordExerciseCompletion(save, "insertion", INSERTION_EXERCISE_SETS.BASIC, {
        score: 100,
        errors: 0,
        hintsUsed: 0,
        elapsedTimeMs: 11000,
      });
      save = recordExerciseCompletion(save, "insertion", INSERTION_EXERCISE_SETS.INTERMEDIATE, {
        score: 90,
        errors: 1,
        hintsUsed: 0,
        elapsedTimeMs: 16000,
      });
      saveGameProgress(save);

      await act(async () => {
        root.render(<App />);
      });

      await openModuleSelectorFromHome("Insertion Sort");
      expect(container.textContent).toContain("MÓDULO • INSERTION SORT");

      // 3A. Insertion Basic V2 + retorno padronizado ao PracticeSelector (nunca à Home!)
      await clickPracticeCardAction("PRÁTICA BÁSICA");
      expect(container.textContent).toContain("Insertion Sort • PRÁTICA BÁSICA");
      expect(container.querySelector('[data-testid="back-to-practices"]')?.textContent).toContain("Práticas");
      expect(container.textContent).not.toContain("Voltar ao Hub");

      await act(async () => {
        clickElement(container.querySelector('[data-testid="back-to-practices"]'));
      });
      expect(container.textContent).toContain("MÓDULO • INSERTION SORT");

      // 3B. Insertion Intermediate legado (SUPORTE REDUZIDO)
      await clickPracticeCardAction("PRÁTICA INTERMEDIÁRIA");
      expect(container.textContent).toContain("SUPORTE REDUZIDO");
      expect(container.textContent).toContain("FRONTEIRA ORD:");

      const backInsInter = findButtonByText(container, "PRÁTICAS");
      expect(backInsInter).toBeTruthy();
      await act(async () => {
        clickElement(backInsInter);
      });
      expect(container.textContent).toContain("MÓDULO • INSERTION SORT");

      // 3C. Insertion Advanced legado (AUTONOMIA MÁXIMA)
      await clickPracticeCardAction("PRÁTICA AVANÇADA");
      expect(container.textContent).toContain("AUTONOMIA MÁXIMA");
      expect(container.textContent).toContain("FRONTEIRA ORD:");
    });
  });

  describe("2. Isolamento Curricular de Casos do Algoritmo, Modo Desafio (Early Exit) e Tutoriais", () => {
    it("Casos do Algoritmo (mesmo com phase=1) e Desafio Early Exit roteiam para as telas canônicas com seus perfis corretos, nunca para V2", async () => {
      let save = createDefaultSaveData();
      save = recordExerciseCompletion(save, "bubble", BUBBLE_EXERCISE_SETS.BASIC);
      save = recordExerciseCompletion(save, "bubble", BUBBLE_EXERCISE_SETS.INTERMEDIATE);
      save = recordExerciseCompletion(save, "bubble", BUBBLE_EXERCISE_SETS.ADVANCED);
      saveGameProgress(save);

      await act(async () => {
        root.render(<App />);
      });

      await openModuleSelectorFromHome("Bubble Sort");

      // Caso do Algoritmo: Bubble Quase Ordenado ([10, 30, 20, 40, 50])
      const exploreCaseBtn = findButtonByText(container, "EXPLORAR CASO");
      expect(exploreCaseBtn).toBeTruthy();
      await act(async () => {
        clickElement(exploreCaseBtn);
      });

      expect(container.textContent).toContain("SUPORTE REDUZIDO");
      expect(container.textContent).toContain("QUASE ORDENADO");
      expect(container.textContent).not.toContain("Previsão Antes de Agir");

      // Voltar ao seletor e abrir Modo Desafio (Early Exit)
      const backFromCase = findButtonByText(container, "PRÁTICAS") ?? findButtonByText(container, "SELETOR");
      await act(async () => {
        clickElement(backFromCase);
      });
      expect(container.textContent).toContain("DESAFIO DISPONÍVEL");

      const challengeBtn = findButtonByText(container, "INICIAR DESAFIO");
      expect(challengeBtn).toBeTruthy();
      await act(async () => {
        clickElement(challengeBtn);
      });

      // Briefing do Early Exit -> Iniciar
      const startBriefingBtn = Array.from(container.querySelectorAll<HTMLButtonElement>("button")).find(
        (b) => b.textContent?.includes("INICIAR") || b.textContent?.includes("COMEÇAR")
      );
      expect(startBriefingBtn).toBeTruthy();
      await act(async () => {
        clickElement(startBriefingBtn);
      });

      expect(container.textContent).toContain("AUTONOMIA MÁXIMA");
      expect(container.textContent).not.toContain("Previsão Antes de Agir");
    });

    it("Voltar durante Prática Básica sem concluir NÃO grava conclusão inexistente no Schema v4", async () => {
      saveGameProgress(createDefaultSaveData());

      await act(async () => {
        root.render(<App />);
      });

      await openModuleSelectorFromHome("Insertion Sort");
      await clickPracticeCardAction("PRÁTICA BÁSICA");

      // Clica em <- Práticas sem concluir
      await act(async () => {
        clickElement(container.querySelector('[data-testid="back-to-practices"]'));
      });

      expect(container.textContent).toContain("MÓDULO • INSERTION SORT");
      const persisted = loadGameProgress();
      expect(persisted.modules.insertion?.exerciseSets[INSERTION_EXERCISE_SETS.BASIC]?.completed).toBeFalsy();
      expect(window.localStorage.getItem(STORAGE_KEY)).toBeTruthy();
    });

    it("Concluir Tutorial do Insertion leva à Prática Básica V2 e o botão <- Práticas retorna ao PracticeSelector do Insertion", async () => {
      await act(async () => {
        root.render(<App />);
      });

      // Home -> Insertion Overview -> COMEÇAR TUTORIAL
      const insertionCardBtn = Array.from(container.querySelectorAll<HTMLButtonElement>("button")).find(
        (b) => b.getAttribute("aria-label")?.toLowerCase().includes("insertion sort")
      );
      await act(async () => {
        clickElement(insertionCardBtn);
      });
      const startTutBtn = findButtonByText(container, "COMEÇAR TUTORIAL");
      await act(async () => {
        clickElement(startTutBtn);
      });

      // Resolve o tutorial [4, 2, 3]
      await act(async () => {
        clickElement(container.querySelector('[data-testid="prediction-option-before"]'));
      });
      await act(async () => {
        clickElement(container.querySelector('[data-testid="confirm-prediction-button"]'));
      });
      await act(async () => {
        clickElement(container.querySelector('[data-testid="decision-shift-right"]'));
      });
      act(() => {
        vi.advanceTimersByTime(450);
      });
      await act(async () => {
        clickElement(container.querySelector('[data-testid="checkpoint-option-shift"]'));
      });
      await act(async () => {
        clickElement(container.querySelector('[data-testid="checkpoint-continue-button"]'));
      });
      await act(async () => {
        clickElement(container.querySelector('[data-testid="decision-insert-key"]'));
      });
      act(() => {
        vi.advanceTimersByTime(450);
      });
      await act(async () => {
        clickElement(container.querySelector('[data-testid="decision-shift-right"]'));
      });
      act(() => {
        vi.advanceTimersByTime(450);
      });
      await act(async () => {
        clickElement(container.querySelector('[data-testid="decision-insert-key"]'));
      });
      act(() => {
        vi.advanceTimersByTime(450);
      });

      const goBasicBtn = findButtonByText(container, "Ir para a Prática Básica");
      await act(async () => {
        clickElement(goBasicBtn);
      });

      // Chegou na Prática Básica V2 do Insertion
      expect(container.textContent).toContain("Insertion Sort • PRÁTICA BÁSICA");

      // Clicar em <- Práticas deve abrir PracticeSelector do Insertion (não Home!)
      await act(async () => {
        clickElement(container.querySelector('[data-testid="back-to-practices"]'));
      });
      expect(container.textContent).toContain("MÓDULO • INSERTION SORT");
    });
  });

  describe("3. Fluxo Único de Conclusão, ResultScreen Oficial, Replay, Progressão e Pseudocódigos Oficiais", () => {
    it("Bubble Basic V2: abre Aprofundamento técnico (9 linhas), conclui 1x -> Result -> Replay -> Próxima Prática abre Intermediária (SUPORTE REDUZIDO)", async () => {
      await act(async () => {
        root.render(<App />);
      });

      await openModuleSelectorFromHome("Bubble Sort");
      await clickPracticeCardAction("PRÁTICA BÁSICA");

      // Verifica Nível 3 fechado por padrão e 9 linhas de BUBBLE_SORT_PSEUDOCODE ao abrir
      const summary = container.querySelector('[data-testid="drawer-toggle"]');
      expect(summary?.textContent).toContain("Aprofundamento técnico");
      expect(container.querySelector('[data-testid="bubble-canonical-pseudocode"]')).toBeNull();

      await act(async () => {
        clickElement(summary);
      });
      const bubbleLines = Array.from(
        container.querySelectorAll('[data-testid="bubble-canonical-pseudocode"] [data-pseudocode-line]')
      );
      expect(bubbleLines.length).toBe(BUBBLE_SORT_PSEUDOCODE.length);
      expect(bubbleLines.length).toBe(9);
      expect(bubbleLines[0].textContent).toContain(BUBBLE_SORT_PSEUDOCODE[0].text);

      // Lê os valores reais das 4 caixas na esteira para resolver deterministicamente a prática procedural
      const initialValues = Array.from(
        container.querySelectorAll<HTMLButtonElement>('button[aria-label^="Caixa com número "]')
      ).map((b) => {
        const match = b.getAttribute("aria-label")?.match(/Caixa com número (\d+)/);
        return Number(match?.[1]);
      });
      expect(initialValues.length).toBe(4);

      // 1. Predição inicial
      await act(async () => {
        clickElement(container.querySelector('[data-testid="prediction-left"]'));
      });
      await act(async () => {
        clickElement(container.querySelector('[data-testid="prediction-confirm"]'));
      });

      // 2. Executa passos usando a própria engine pura para escolher a ação correta
      let sim = createBubbleSortState(initialValues);
      while (!sim.completed) {
        // Se o checkpoint pós-passada 1 abriu, confirma com maxVal
        const maxVal = Math.max(...initialValues);
        const passCheckBtn = container.querySelector(`[data-testid="pass-check-${maxVal}"]`);
        if (passCheckBtn) {
          await act(async () => {
            clickElement(passCheckBtn);
          });
          await act(async () => {
            clickElement(container.querySelector('[data-testid="pass-check-confirm"]'));
          });
        }

        const exp = getExpectedComparison(sim)!;
        const decision = exp.shouldSwap ? "SWAP" : "KEEP";
        sim = executeUserStep(sim, decision).state;

        await act(async () => {
          clickElement(
            container.querySelector(
              decision === "SWAP" ? '[data-testid="action-swap"]' : '[data-testid="action-keep"]'
            )
          );
        });
        if (decision === "SWAP") {
          act(() => {
            vi.advanceTimersByTime(400);
          });
        }
      }

      // Deve estar diretamente na tela de resultado oficial com PONTUAÇÃO DO PROTOCOLO, Replay e Próxima Prática
      expect(container.textContent).toContain("PONTUAÇÃO DO PROTOCOLO");
      expect(container.textContent).toContain("100");

      const persisted = loadGameProgress();
      expect(persisted.modules.bubble?.exerciseSets[BUBBLE_EXERCISE_SETS.BASIC]?.completed).toBe(true);
      expect(persisted.modules.bubble?.exerciseSets[BUBBLE_EXERCISE_SETS.BASIC]?.bestRecord?.bestScore).toBe(100);

      // Replay acessível
      const replayBtn = container.querySelector('[data-testid="result-replay-btn"]');
      expect(replayBtn).toBeTruthy();
      await act(async () => {
        clickElement(replayBtn);
      });
      expect(container.textContent).toContain("VOLTAR AO RESULTADO");
      await act(async () => {
        clickElement(findButtonByText(container, "VOLTAR AO RESULTADO"));
      });

      // Avançar para Próxima Prática deve abrir Bubble Intermediária com SUPORTE REDUZIDO (GameScreen, nunca V2!)
      await act(async () => {
        clickElement(container.querySelector('[data-testid="result-next-btn"]'));
      });
      expect(container.textContent).toContain("SUPORTE REDUZIDO");
      expect(container.textContent).not.toContain("Previsão Antes de Agir");
    });

    it("Selection Basic V2: Aprofundamento técnico (13 linhas), dica acessível e conclusão direta para ResultScreen canônica sem dupla confirmação", async () => {
      await act(async () => {
        root.render(<App />);
      });

      await openModuleSelectorFromHome("Selection Sort");
      await clickPracticeCardAction("PRÁTICA BÁSICA");

      // Verifica Nível 3: fechado por padrão e 13 linhas canônicas de SELECTION_SORT_PSEUDOCODE
      const detailsEl = container.querySelector("details") as HTMLDetailsElement;
      expect(detailsEl).toBeTruthy();
      expect(detailsEl.open).toBe(false);
      expect(detailsEl.querySelector("summary")?.textContent).toContain("Aprofundamento técnico");
      const selLines = detailsEl.querySelectorAll('[data-testid="selection-canonical-pseudocode"] [data-pseudocode-line]');
      expect(selLines.length).toBe(SELECTION_SORT_PSEUDOCODE.length);
      expect(selLines.length).toBe(13);

      // Solicita 1 dica (score esperado = 95)
      await act(async () => {
        clickElement(container.querySelector('[data-testid="toggle-hint-button"]'));
      });
      expect(container.querySelector('[data-testid="selection-hint-panel"]')?.textContent).toContain(
        "Orientação Pedagógica:"
      );

      // Extrai vetor inicial da esteira
      const initialValues = Array.from(
        container.querySelectorAll<HTMLButtonElement>('button[aria-label^="Caixa com número "]')
      ).map((b) => Number(b.getAttribute("aria-label")?.match(/Caixa com número (\d+)/)?.[1]));
      expect(initialValues.length).toBe(4);

      let sim = createSelectionSortState(initialValues);
      while (!sim.completed) {
        if (sim.phase === "INSPECT") {
          const isNewMin = sim.currentValues[sim.j] < sim.currentValues[sim.minIndex];
          const decision = isNewMin ? "SELECT_NEW_MIN" : "KEEP_MIN";
          sim = executeSelectionInspection(sim, decision).state;
          await act(async () => {
            clickElement(
              container.querySelector(
                isNewMin
                  ? '[data-testid="decision-select-new-min"]'
                  : '[data-testid="decision-keep-min"]'
              )
            );
          });
        } else {
          // COMMIT (passada 0 tem checkpoint apresentacional)
          const minVal = sim.currentValues[sim.minIndex];
          const cpBtn = container.querySelector(`[data-testid="checkpoint-option-${minVal}"]`);
          if (cpBtn) {
            await act(async () => {
              clickElement(cpBtn);
            });
          }
          const { commitSelectionPass } = await import("../game/sorting/selection");
          sim = commitSelectionPass(sim).state;
          await act(async () => {
            clickElement(container.querySelector('[data-testid="commit-button"]'));
          });
          act(() => {
            vi.advanceTimersByTime(600);
          });
        }
      }

      // Deve ter aberto diretamente a ResultScreen canônica (sem precisar clicar num segundo "Concluir Prática")!
      expect(container.textContent).toContain("PONTUAÇÃO DO PROTOCOLO");
      expect(container.textContent).toContain("95");
      expect(container.textContent).toContain("PSEUDOCÓDIGO — SELECTION SORT");
      expect(findButtonByText(container, "VER EXECUÇÃO")).toBeTruthy();

      const persisted = loadGameProgress();
      expect(persisted.modules.selection?.exerciseSets[SELECTION_EXERCISE_SETS.BASIC]?.completed).toBe(true);
      expect(persisted.modules.selection?.exerciseSets[SELECTION_EXERCISE_SETS.BASIC]?.bestRecord?.bestScore).toBe(95);
    });

    it("Insertion Basic V2: Aprofundamento técnico (11 linhas) e conclusão direta para ResultScreen canônica preservando desempate de recorde sem usar tempo", async () => {
      // Pré-grava um recorde de 90 pontos (1 erro, 0 dicas, 30000ms) para validar política de desempate
      let preSave = createDefaultSaveData();
      preSave = recordExerciseCompletion(preSave, "insertion", INSERTION_EXERCISE_SETS.BASIC, {
        score: 90,
        errors: 1,
        hintsUsed: 0,
        elapsedTimeMs: 30000,
      });
      saveGameProgress(preSave);

      await act(async () => {
        root.render(<App />);
      });

      await openModuleSelectorFromHome("Insertion Sort");
      await clickPracticeCardAction("PRÁTICA BÁSICA");

      // Verifica Nível 3: fechado por padrão e 11 linhas canônicas de INSERTION_SORT_PSEUDOCODE
      const detailsEl = container.querySelector("details") as HTMLDetailsElement;
      expect(detailsEl).toBeTruthy();
      expect(detailsEl.open).toBe(false);
      expect(detailsEl.querySelector("summary")?.textContent).toContain("Aprofundamento técnico");
      const insLines = detailsEl.querySelectorAll('[data-testid="insertion-canonical-pseudocode"] [data-pseudocode-line]');
      expect(insLines.length).toBe(INSERTION_SORT_PSEUDOCODE.length);
      expect(insLines.length).toBe(11);

      // Extrai os 4 valores iniciais: chave suspensa (index 1) + 3 caixas na esteira (indices 0, 2, 3)
      const allBoxBtns = Array.from(
        container.querySelectorAll<HTMLButtonElement>('[role="region"][aria-label*="Trilho"] button')
      );
      expect(allBoxBtns.length).toBe(4);
      const keyVal = Number(allBoxBtns[0].getAttribute("aria-label")?.match(/valor (\d+)/)?.[1]);
      const box0 = Number(allBoxBtns[1].getAttribute("aria-label")?.match(/valor (\d+)/)?.[1]);
      const box2 = Number(allBoxBtns[2].getAttribute("aria-label")?.match(/valor (\d+)/)?.[1]);
      const box3 = Number(allBoxBtns[3].getAttribute("aria-label")?.match(/valor (\d+)/)?.[1]);
      const initialValues = [box0, keyVal, box2, box3];

      // Comete 1 erro proposital para empatar score=90 e errors=1 com tempo menor (<30000ms)
      let sim = createInsertionSortState(initialValues);
      const firstCorrectShouldShift =
        sim.phase === "COMPARE_AND_SHIFT" && (sim.currentValues[sim.j] as number) > (sim.key as number);
      await act(async () => {
        clickElement(
          container.querySelector(
            firstCorrectShouldShift
              ? '[data-testid="decision-insert-key"]'
              : '[data-testid="decision-shift-right"]'
          )
        );
      });
      sim = executeInsertionStep(sim, firstCorrectShouldShift ? "INSERT_KEY" : "SHIFT_RIGHT").state;

      // Resolve o restante sem erros
      while (!sim.completed) {
        const shouldShift =
          sim.phase === "COMPARE_AND_SHIFT" && (sim.currentValues[sim.j] as number) > (sim.key as number);
        const decision = shouldShift ? "SHIFT_RIGHT" : "INSERT_KEY";
        sim = executeInsertionStep(sim, decision).state;
        await act(async () => {
          clickElement(
            container.querySelector(
              shouldShift
                ? '[data-testid="decision-shift-right"]'
                : '[data-testid="decision-insert-key"]'
            )
          );
        });
        act(() => {
          vi.advanceTimersByTime(400);
        });
      }

      // Deve abrir diretamente a ResultScreen canônica
      expect(container.textContent).toContain("PONTUAÇÃO DO PROTOCOLO");
      expect(container.textContent).toContain("90");
      expect(container.textContent).toContain("PSEUDOCÓDIGO — INSERTION SORT");

      // Política de recorde: score=90 e errors=1 empataram -> tempo menor NÃO substitui o recorde pré-existente (30000ms preservado!)
      const afterTieSave = loadGameProgress();
      expect(
        afterTieSave.modules.insertion?.exerciseSets[INSERTION_EXERCISE_SETS.BASIC]?.bestRecord
          ?.bestScoreElapsedTimeMs
      ).toBe(30000);
    });
  });
});
