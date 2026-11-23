// @vitest-environment happy-dom
// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import BubbleModuleOverviewV2 from "./bubble/BubbleModuleOverviewV2";
import BubbleTutorialScreenV2 from "./bubble/BubbleTutorialScreenV2";
import BubbleGameScreenV2, {
  buildBubblePassCheckpointOptions,
} from "./bubble/BubbleGameScreenV2";
import BubbleResultScreenV2 from "./bubble/BubbleResultScreenV2";
import ResultScreen from "./ResultScreen";
import { createUxTestSession, type BubbleUxTestSession } from "./bubble/bubbleUxTest";
import { generateSortingArray, BUBBLE_BASIC_CONSTRAINTS } from "../game/generation";

describe("Bubble Sort V2 Pilot — End-to-End Educational & Visual Experience", () => {
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

  describe("A. BubbleModuleOverviewV2", () => {
    it("deve renderizar título, subtítulo conceitual e os 3 passos de como funciona", async () => {
      const onStartTutorial = vi.fn();
      const onStartPractice = vi.fn();
      const onBack = vi.fn();

      await act(async () => {
        root.render(
          <BubbleModuleOverviewV2
            onStartTutorial={onStartTutorial}
            onStartPractice={onStartPractice}
            onBack={onBack}
          />
        );
      });

      expect(container.textContent).toContain("BUBBLE SORT");
      expect(container.textContent).toContain("Compare vizinhos e coloque o menor primeiro.");
      expect(container.textContent).toContain("COMPARE");
      expect(container.textContent).toContain("DECIDA");
      expect(container.textContent).toContain("AVANCE");
      expect(container.textContent).toContain("[8, 3]");

      const tutorialBtn = Array.from(container.querySelectorAll("button")).find((b) =>
        b.textContent?.includes("COMEÇAR TUTORIAL")
      );
      expect(tutorialBtn).toBeTruthy();

      await act(async () => {
        tutorialBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      expect(onStartTutorial).toHaveBeenCalledTimes(1);

      const practiceBtn = Array.from(container.querySelectorAll("button")).find((b) =>
        b.textContent?.includes("Ir para práticas")
      );
      expect(practiceBtn).toBeTruthy();

      await act(async () => {
        practiceBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      expect(onStartPractice).toHaveBeenCalledTimes(1);

      const backBtn = Array.from(container.querySelectorAll("button")).find((b) =>
        b.textContent?.includes("Voltar ao Início")
      );
      expect(backBtn).toBeTruthy();

      await act(async () => {
        backBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      expect(onBack).toHaveBeenCalledTimes(1);
    });
  });

  describe("B. BubbleTutorialScreenV2", () => {
    it("deve iniciar com vetor [3, 1, 2], exigir checkpoint de predição e avançar pelos 3 passos interativos", async () => {
      const onComplete = vi.fn();
      const onBack = vi.fn();

      await act(async () => {
        root.render(<BubbleTutorialScreenV2 onComplete={onComplete} onBack={onBack} />);
      });

      // Passo 1 inicial
      expect(container.textContent).toContain("Passo 1 de 3");
      expect(container.textContent).toContain("Previsão antes de agir");
      expect(container.textContent).toContain("Depois de comparar 3 e 1, qual valor ficará mais à direita?");

      // Clica na opção de predição '3'
      const option3 = container.querySelector<HTMLButtonElement>('[data-testid="predict-3"]');
      expect(option3).toBeTruthy();

      await act(async () => {
        option3?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      expect(container.textContent).toContain("Excelente! Como 3 é maior que 1");

      // Clica no botão de ação de troca
      const swapBtn = container.querySelector<HTMLButtonElement>('[data-testid="tutorial-swap-1"]');
      expect(swapBtn).toBeTruthy();

      await act(async () => {
        swapBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      // Avança o timer de animação da troca
      act(() => {
        vi.advanceTimersByTime(400);
      });

      // Passo 2
      expect(container.textContent).toContain("Passo 2 de 3");
      expect(container.textContent).toContain("Agora comparamos 3 e 2");

      const swapBtn2 = container.querySelector<HTMLButtonElement>('[data-testid="tutorial-swap-2"]');
      expect(swapBtn2).toBeTruthy();

      await act(async () => {
        swapBtn2?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      act(() => {
        vi.advanceTimersByTime(400);
      });

      // Passo 3
      expect(container.textContent).toContain("Passo 3 de 3");
      expect(container.textContent).toContain("o número 3 já é o maior elemento");

      const keepBtn = container.querySelector<HTMLButtonElement>('[data-testid="tutorial-keep-3"]');
      expect(keepBtn).toBeTruthy();

      await act(async () => {
        keepBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Conclusão
      expect(container.textContent).toContain("Vetor Ordenado com Sucesso!");
      expect(container.textContent).toContain("Invariante Compreendido!");

      const finishBtn = container.querySelector<HTMLButtonElement>('[data-testid="tutorial-finish-btn"]');
      expect(finishBtn).toBeTruthy();

      await act(async () => {
        finishBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe("C. BubbleGameScreenV2 — Prática Ativa", () => {
    it("deve renderizar cabeçalho limpo sem placar nem cronômetro e exibir checkpoint de predição no primeiro passo", async () => {
      const onComplete = vi.fn();
      const onBackToSelector = vi.fn();

      await act(async () => {
        root.render(
          <BubbleGameScreenV2
            initialArray={[40, 20, 50, 10]}
            phase={1}
            totalPhases={3}
            practiceTitle="Prática Básica"
            onComplete={onComplete}
            onBackToSelector={onBackToSelector}
          />
        );
      });

      // Valida ausência de poluição no topo
      expect(container.textContent).toContain("Bubble Sort");
      expect(container.textContent).toContain("Prática Básica");
      expect(container.textContent).toContain("Passo 1 de 6");
      expect(container.textContent).not.toContain("PONTUAÇÃO");
      expect(container.textContent).not.toContain("/ 100");
      expect(container.textContent).not.toContain("00:00");

      // Checkpoint de predição antes de agir
      expect(container.textContent).toContain("Previsão Antes de Agir");
      expect(container.textContent).toContain("qual valor ficará mais à direita?");

      // Clica na opção correta de predição (40 vs 20 -> 40)
      const predictBtn = container.querySelector<HTMLButtonElement>('[data-testid="prediction-left"]');
      expect(predictBtn).toBeTruthy();

      await act(async () => {
        predictBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      expect(container.textContent).toContain("Excelente! Como 40 é maior que 20");

      // Confirma e entra na fase de ação
      const proceedBtn = container.querySelector<HTMLButtonElement>('[data-testid="prediction-confirm"]');
      expect(proceedBtn).toBeTruthy();

      await act(async () => {
        proceedBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      // Agora botões de ação estão visíveis com o mesmo peso neutro e pergunta semanticamente coerente
      const swapBtn = container.querySelector<HTMLButtonElement>('[data-testid="action-swap"]');
      const keepBtn = container.querySelector<HTMLButtonElement>('[data-testid="action-keep"]');
      expect(swapBtn?.textContent).toContain("TROCAR");
      expect(keepBtn?.textContent).toContain("MANTER");
      expect(swapBtn?.className).toBe(keepBtn?.className);
      expect(container.textContent).toContain(
        "O que devemos fazer com esses dois números vizinhos?"
      );
      expect(container.textContent).not.toContain(
        "Essas duas caixas estão na ordem certa?"
      );
    });

    it("ao errar a ação, deve fornecer feedback causal amigável sem avançar a posição do algoritmo", async () => {
      const onComplete = vi.fn();
      const onBackToSelector = vi.fn();

      await act(async () => {
        root.render(
          <BubbleGameScreenV2
            initialArray={[40, 20, 50, 10]}
            phase={1}
            totalPhases={3}
            onComplete={onComplete}
            onBackToSelector={onBackToSelector}
          />
        );
      });

      // Passa a predição
      const predictBtn = container.querySelector<HTMLButtonElement>('[data-testid="prediction-left"]');
      await act(async () => {
        predictBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      const proceedBtn = container.querySelector<HTMLButtonElement>('[data-testid="prediction-confirm"]');
      await act(async () => {
        proceedBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      // Par atual é [40, 20]. Ação correta é SWAP. O usuário escolhe MANTER (erro pedagógico).
      const keepBtn = container.querySelector<HTMLButtonElement>('[data-testid="action-keep"]');
      expect(keepBtn).toBeTruthy();
      await act(async () => {
        keepBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      // Feedback causal e amigável
      expect(container.textContent).toContain("Observe: 40 é maior que 20");
      expect(container.textContent).toContain("Tente trocar!");
      expect(container.textContent).toContain("Passo 1 de 6"); // Não avançou o passo da engine

      // Agora clica na ação correta (TROCAR)
      const swapBtn = container.querySelector<HTMLButtonElement>('[data-testid="action-swap"]');
      expect(swapBtn).toBeTruthy();
      await act(async () => {
        swapBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      expect(container.textContent).toContain("Isso! 40 é maior que 20, então ele vai para a direita.");

      act(() => {
        vi.advanceTimersByTime(400);
      });

      // Avançou para o Passo 2
      expect(container.textContent).toContain("Passo 2 de 6");
    });

    it("dica pedagógica (Nível 2) fica acessível na área de decisão e gaveta sob demanda contém apenas detalhes técnicos (Nível 3)", async () => {
      await act(async () => {
        root.render(
          <BubbleGameScreenV2
            initialArray={[40, 20, 50, 10]}
            onComplete={vi.fn()}
            onBackToSelector={vi.fn()}
          />
        );
      });

      // Passa a predição inicial para liberar a área de decisão
      const predictBtn = container.querySelector<HTMLButtonElement>('[data-testid="prediction-left"]');
      await act(async () => {
        predictBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      const proceedBtn = container.querySelector<HTMLButtonElement>('[data-testid="prediction-confirm"]');
      await act(async () => {
        proceedBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      // A gaveta técnica NÃO está aberta
      expect(container.textContent).not.toContain("passIndex (i)");

      // O botão de dica (Nível 2) já está acessível discretamente na área de decisão sem abrir a gaveta
      const hintBtn = container.querySelector<HTMLButtonElement>('[data-testid="hint-button"]');
      expect(hintBtn).toBeTruthy();

      await act(async () => {
        hintBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      // Feedback de dica orienta o raciocínio sem entregar qual botão pressionar (P-03)
      expect(container.textContent).toContain("Dica pedagógica: Compare 40 e 20");
      expect(container.textContent).toContain("ordem crescente");
      expect(container.textContent).not.toContain("A ação correta é");

      // Agora inspeciona a gaveta de detalhes técnicos (Nível 3)
      const drawerToggle = container.querySelector<HTMLButtonElement>('[data-testid="drawer-toggle"]');
      expect(drawerToggle).toBeTruthy();
      expect(drawerToggle?.textContent).toContain("Ver detalhes sob demanda");

      await act(async () => {
        drawerToggle?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      expect(container.textContent).toContain("passIndex (i)");
      expect(container.textContent).toContain("se A[j] > A[j+1]");
      expect(drawerToggle?.textContent).toContain("Ocultar detalhes");
    });

    it("P-01: checkpoint pós-1ª passada sempre inclui o maior elemento sem duplicatas, sem ordenação crescente e sem posição fixa", async () => {
      // 1. Maior no início, no meio, no final e com duplicatas / diferentes comprimentos
      const cases: readonly (readonly number[])[] = [
        [50, 20, 30, 10], // maior no início
        [20, 50, 10, 30], // maior no meio (idx 1)
        [20, 30, 50, 10], // maior no meio (idx 2)
        [30, 20, 10, 50], // maior no final (caso crítico da auditoria!)
        [40, 20, 40, 10], // duplicatas do maior
        [10, 10, 50, 10], // múltiplas duplicatas de distraidor
        [25, 25, 25, 25], // todos iguais
        [90, 10], // n = 2
        [10, 20, 30, 40, 50, 60], // n = 6 com maior no fim
      ];

      const observedPositions = new Set<number>();

      for (const arr of cases) {
        const opts = buildBubblePassCheckpointOptions(arr);
        const maxVal = Math.max(...arr);

        // Sempre inclui a resposta correta
        expect(opts).toContain(maxVal);
        // Sem alternativas duplicadas
        expect(new Set(opts).size).toBe(opts.length);
        // Quando há 3 alternativas, nunca está automaticamente em ordem estritamente crescente
        if (opts.length >= 3) {
          const isAscending = opts[0] < opts[1] && opts[1] < opts[2];
          expect(isAscending).toBe(false);
          observedPositions.add(opts.indexOf(maxVal));
        }
      }

      // Resposta correta não é fixada em uma única posição (aparece em 0, 1 e 2)
      expect(observedPositions.has(0)).toBe(true);
      expect(observedPositions.has(1)).toBe(true);
      expect(observedPositions.has(2)).toBe(true);

      // 2. Exaustivo sobre vetores válidos da Prática Básica (sementes procedurais reais)
      for (let seed = 1; seed <= 30; seed++) {
        const gen = generateSortingArray({
          length: 4,
          minValue: 1,
          maxValue: 99,
          allowDuplicates: false,
          seed,
          constraints: BUBBLE_BASIC_CONSTRAINTS,
        });
        const opts = buildBubblePassCheckpointOptions(gen.values);
        const maxVal = Math.max(...gen.values);
        expect(opts).toContain(maxVal);
        expect(new Set(opts).size).toBe(3);
      }

      // 3. Teste integrado no DOM para o caso crítico [30, 20, 10, 50] sem alterar score/engine
      const onComplete = vi.fn();
      await act(async () => {
        root.render(
          <BubbleGameScreenV2
            initialArray={[30, 20, 10, 50]}
            onComplete={onComplete}
            onBackToSelector={vi.fn()}
          />
        );
      });

      // Predição inicial
      await act(async () => {
        container
          .querySelector<HTMLButtonElement>('[data-testid="prediction-left"]')
          ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      await act(async () => {
        container
          .querySelector<HTMLButtonElement>('[data-testid="prediction-confirm"]')
          ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      // Passada 1 sobre [30, 20, 10, 50]:
      // Comp 1: 30 > 20 -> SWAP -> [20, 30, 10, 50]
      await act(async () => {
        container
          .querySelector<HTMLButtonElement>('[data-testid="action-swap"]')
          ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      act(() => {
        vi.advanceTimersByTime(400);
      });
      // Comp 2: 30 > 10 -> SWAP -> [20, 10, 30, 50]
      await act(async () => {
        container
          .querySelector<HTMLButtonElement>('[data-testid="action-swap"]')
          ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      act(() => {
        vi.advanceTimersByTime(400);
      });
      // Comp 3: 30 <= 50 -> KEEP -> fim da 1ª passada!
      await act(async () => {
        container
          .querySelector<HTMLButtonElement>('[data-testid="action-keep"]')
          ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      // Checkpoint pós-passada deve oferecer o botão pass-check-50!
      const correctOption = container.querySelector<HTMLButtonElement>(
        '[data-testid="pass-check-50"]'
      );
      expect(correctOption).toBeTruthy();

      await act(async () => {
        correctOption?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      expect(container.textContent).toContain("Exatamente! O maior valor (50)");
    });

    it("P-05: preserva estabilidade com elementos duplicados explicando que valores iguais mantêm posição", async () => {
      await act(async () => {
        root.render(
          <BubbleGameScreenV2
            initialArray={[20, 20, 10]}
            onComplete={vi.fn()}
            onBackToSelector={vi.fn()}
          />
        );
      });

      await act(async () => {
        container
          .querySelector<HTMLButtonElement>('[data-testid="prediction-left"]')
          ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      await act(async () => {
        container
          .querySelector<HTMLButtonElement>('[data-testid="prediction-confirm"]')
          ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      // Tentar trocar 20 com 20 deve ser erro explicando igualdade
      await act(async () => {
        container
          .querySelector<HTMLButtonElement>('[data-testid="action-swap"]')
          ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      expect(container.textContent).toContain("20 é igual a 20");

      // Manter 20 e 20 deve avançar preservando estabilidade
      await act(async () => {
        container
          .querySelector<HTMLButtonElement>('[data-testid="action-keep"]')
          ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      expect(container.textContent).toContain("elementos iguais mantêm suas posições originais");
    });
  });

  describe("D. BubbleResultScreenV2 & ResultScreen V2 Integration", () => {
    it("deve renderizar a tela de resultados V2 com descoberta, 3 métricas e micro-reflexão conceitual", async () => {
      const onNext = vi.fn();
      const onRepeat = vi.fn();
      const onViewReplay = vi.fn();

      await act(async () => {
        root.render(
          <BubbleResultScreenV2
            finalArray={[10, 20, 40, 50]}
            comparisons={6}
            swaps={3}
            errors={0}
            hintsUsed={0}
            score={100}
            canonicalComparisons={6}
            onNext={onNext}
            onRepeat={onRepeat}
            onViewReplay={onViewReplay}
          />
        );
      });

      expect(container.textContent).toContain("Vetor Ordenado com Sucesso!");
      expect(container.textContent).toContain("Descoberta Desta Prática");
      expect(container.textContent).toContain("O maior elemento foi avançando a cada comparação");
      expect(container.textContent).toContain("Referência desta variante: 6 comparações");
      expect(container.textContent).toContain("Movimentações efetuadas");
      expect(container.textContent).toContain("Execução sem erros");

      // Micro-reflexão
      expect(container.textContent).toContain("Micro-Reflexão de Compreensão");
      expect(container.textContent).toContain("Depois de uma passada completa do Bubble Sort, o que acontece com certeza?");

      // Clica na opção B (id: 1, correta)
      const optionB = Array.from(container.querySelectorAll("button")).find((b) =>
        b.textContent?.includes("O maior elemento não ordenado alcança sua posição final")
      );
      expect(optionB).toBeTruthy();

      await act(async () => {
        optionB?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      expect(container.textContent).toContain("Exato! A cada passada completa, o maior valor restante sobe como uma bolha");

      // Replay CTA
      const replayBtn = Array.from(container.querySelectorAll("button")).find((b) =>
        b.textContent?.includes("Rever Execução (Replay)")
      );
      expect(replayBtn).toBeTruthy();

      await act(async () => {
        replayBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      expect(onViewReplay).toHaveBeenCalledTimes(1);
    });

    it("ResultScreen renderiza BubbleResultScreenV2 quando protocol='bubble' sem contexto de caso nem early exit", async () => {
      await act(async () => {
        root.render(
          <ResultScreen
            finalArray={[1, 2, 3, 4]}
            comparisons={6}
            swaps={2}
            errors={0}
            hintsUsed={0}
            protocol="bubble"
            variant="CANONICAL"
            canonicalComparisons={6}
            onNext={vi.fn()}
            onRepeat={vi.fn()}
          />
        );
      });

      expect(container.textContent).toContain("Descoberta Desta Prática");
      expect(container.textContent).toContain("Referência desta variante: 6 comparações");
    });
  });

  describe("E. Instrumentação Local e Não-Invasiva de Teste de UX (?uxTest=1)", () => {
    it("em modo normal (isUxTestMode=false), o painel do pesquisador NUNCA é renderizado na tela de resultados", async () => {
      await act(async () => {
        root.render(
          <BubbleResultScreenV2
            finalArray={[10, 20, 40, 50]}
            comparisons={6}
            swaps={3}
            errors={0}
            hintsUsed={0}
            isUxTestMode={false}
            onNext={vi.fn()}
            onRepeat={vi.fn()}
          />
        );
      });

      const researcherPanel = container.querySelector('[data-testid="ux-test-panel"]');
      expect(researcherPanel).toBeNull();
      expect(container.textContent).not.toContain("Modo Teste de UX Ativo");
    });

    it("em modo de teste (isUxTestMode=true), rastreia eventos em memória e exibe painel do pesquisador com exportação JSON", async () => {
      let recordedSession: BubbleUxTestSession | undefined;
      const onUxTestUpdate = vi.fn((session: BubbleUxTestSession) => {
        recordedSession = session;
      });

      const initialSession = createUxTestSession();

      await act(async () => {
        root.render(
          <BubbleGameScreenV2
            initialArray={[40, 20, 50, 10]}
            isUxTestMode={true}
            uxTestSession={initialSession}
            onUxTestSessionUpdate={onUxTestUpdate}
            onComplete={vi.fn()}
            onBackToSelector={vi.fn()}
          />
        );
      });

      // 1. Responde a predição inicial
      const predictBtn = container.querySelector<HTMLButtonElement>('[data-testid="prediction-left"]');
      await act(async () => {
        predictBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      const proceedBtn = container.querySelector<HTMLButtonElement>('[data-testid="prediction-confirm"]');
      await act(async () => {
        proceedBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      // 2. Solicita dica
      const hintBtn = container.querySelector<HTMLButtonElement>('[data-testid="hint-button"]');
      await act(async () => {
        hintBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      // 3. Abre a gaveta técnica
      const drawerToggle = container.querySelector<HTMLButtonElement>('[data-testid="drawer-toggle"]');
      await act(async () => {
        drawerToggle?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      // 4. Executa a primeira ação (SWAP)
      const swapBtn = container.querySelector<HTMLButtonElement>('[data-testid="action-swap"]');
      await act(async () => {
        swapBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      expect(recordedSession).toBeDefined();
      expect(recordedSession?.predictionAnswered).toBe(true);
      expect(recordedSession?.predictionCorrect).toBe(true);
      expect(recordedSession?.hintRequestsCount).toBe(1);
      expect(recordedSession?.detailsOpenedCount).toBe(1);
      expect(recordedSession?.firstActionAt).toBeDefined();
      expect(recordedSession?.firstActionCorrect).toBe(true);
      expect(typeof recordedSession?.timeToFirstActionMs).toBe("number");

      // 5. Renderiza a tela de resultados com a sessão coletada
      await act(async () => {
        root.render(
          <BubbleResultScreenV2
            finalArray={[10, 20, 40, 50]}
            comparisons={6}
            swaps={3}
            errors={0}
            hintsUsed={1}
            isUxTestMode={true}
            uxTestSession={recordedSession}
            onNext={vi.fn()}
            onRepeat={vi.fn()}
          />
        );
      });

      const researcherPanel = container.querySelector('[data-testid="ux-test-panel"]');
      expect(researcherPanel).not.toBeNull();
      expect(container.textContent).toContain("Modo Teste de UX Ativo (?uxTest=1)");
      expect(container.textContent).toContain("Tempo 1ª Ação:");
      expect(container.textContent).toContain("1ª Ação Correta:");

      // Botões de exportação do pesquisador
      const exportBtn = container.querySelector('[data-testid="ux-export-btn"]');
      const copyBtn = container.querySelector('[data-testid="ux-copy-btn"]');
      expect(exportBtn).toBeTruthy();
      expect(copyBtn).toBeTruthy();
    });
  });
});
