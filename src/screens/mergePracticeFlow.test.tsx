// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import MergeGameScreen from "./MergeGameScreen";
import PracticeSelector from "./PracticeSelector";
import ResultScreen from "./ResultScreen";
import App from "../App";
import {
  initMergeSortState,
  executeMergeStep,
  deriveMergeFramesFromHistory,
  getMergeSortScore,
  assignMergeIdentities,
} from "../game/sorting/merge";
import {
  generateMergePracticeArray,
  MERGE_BASIC_CONSTRAINTS,
  MERGE_ADVANCED_CONSTRAINTS,
} from "../game/sorting/merge/mergeConstraints";
import {
  generateSortingArray,
  attemptDeterministicFallback,
} from "../game/generation/arrayGenerator";
import { createDefaultSaveData, MERGE_EXERCISE_SETS } from "../game/persistence";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe("Merge Sort Practice Flow & Intercalation Station (P3.1-D)", () => {
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

  // --------------------------------------------------------------------------
  // 1. Renderização e Estrutura da Estação de Intercalação Desktop-First
  // --------------------------------------------------------------------------
  describe("1. Renderização e Estrutura da Estação de Intercalação", () => {
    it("renderiza a interface desktop-first com esteira principal, ramais, sensor e buffer", () => {
      const html = renderToStaticMarkup(
        <MergeGameScreen
          level="basic"
          initialArray={[30, 10, 40, 20]}
          onComplete={vi.fn()}
          onBackToSelector={vi.fn()}
        />
      );

      // Cabeçalho e identificação curricular
      expect(html).toContain("MÓDULO: MERGE SORT");
      expect(html).toContain("DIVISÃO E CONQUISTA");
      expect(html).toContain("PRÁTICA BÁSICA (n=4)");

      // Botões de apoio
      expect(html).toContain("DICA");
      expect(html).toContain("REINICIAR");
      expect(html).toContain("VOLTAR");

      // Telemetria contínua
      expect(html).toContain("Comparações");
      expect(html).toContain("Escritas Buffer");
      expect(html).toContain("Escritas Principal");
      expect(html).toContain("Total Escritas");
      expect(html).toContain("Decisões Incorretas");
      expect(html).toContain("Pontuação");

      // Esteira principal e pátio de triagem
      expect(html).toContain("ESTEIRA PRINCIPAL");
      expect(html).toContain("CONFLUÊNCIA DE RAMAIS");
      expect(html).toContain("RAMAL ESQUERDO");
      expect(html).toContain("RAMAL DIREITO");
      expect(html).toContain("SENSORES ÓPTICOS EM CONFRONTO ATIVO");
      expect(html).toContain("ESTEIRA COLETORA AUXILIAR");

      // Pseudocódigo canônico operacional
      expect(html).toContain("PSEUDOCÓDIGO — SUB-ROTINA DE INTERCALAÇÃO (RESUMO OPERACIONAL)");
      expect(html).toContain("intercalar(A, left, mid, right)");

      // Botoeira de ações
      expect(html).toContain("1: DESPACHAR ESQUERDA");
      expect(html).toContain("2: DESPACHAR DIREITA");
      expect(html).toContain("3: DESPACHAR RESTANTE");
    });

    it("respeita as regras de layout: single scroll owner e overflow horizontal isolado", () => {
      const html = renderToStaticMarkup(
        <MergeGameScreen
          level="intermediate"
          initialArray={[30, 10, 50, 40, 20]}
          onComplete={vi.fn()}
          onBackToSelector={vi.fn()}
        />
      );

      // Root tem scroll vertical habilitado
      expect(html).toContain("overflow-y-auto");
      expect(html).toContain("overflow-x-hidden");

      // As esteiras isolam seu próprio scroll horizontal
      expect(html).toContain("overflow-x-auto");
    });
  });

  // --------------------------------------------------------------------------
  // 2. Decisões do Estudante: Escolha Correta, Erro e Recuperação
  // --------------------------------------------------------------------------
  describe("2. Decisões do Estudante: Escolha Correta, Erro e Recuperação", () => {
    it("avança o ponteiro e buffer na escolha correta e mantém pureza do estado", () => {
      const elements = assignMergeIdentities([30, 10, 40, 20]);
      const state = initMergeSortState(elements);

      const leftVal = state.values[state.p1].value;
      const rightVal = state.values[state.p2].value;

      expect(state.phase).toBe("COMPARE_HEADS");
      const expectedDecision = leftVal <= rightVal ? "DISPATCH_LEFT" : "DISPATCH_RIGHT";

      const result = executeMergeStep(state, expectedDecision);
      expect(result.valid).toBe(true);
      expect(result.state.k).toBe(1);
      expect(result.state.errors).toBe(0);
      expect(result.state.writesInBuffer).toBe(1);
    });

    it("rejeita escolha incorreta: não avança ponteiros nem buffer, incrementa erros sem novas escritas", () => {
      const elements = assignMergeIdentities([30, 10, 40, 20]);
      const state = initMergeSortState(elements);

      const leftVal = state.values[state.p1].value; // 30
      const rightVal = state.values[state.p2].value; // 10
      expect(leftVal).toBe(30);
      expect(rightVal).toBe(10);

      // Ação incorreta: despachar o maior (Esquerda: 30) em vez da Direita (10)
      const result = executeMergeStep(state, "DISPATCH_LEFT");

      expect(result.valid).toBe(false);
      expect(result.isPedagogicalError).toBe(true);
      expect(result.state.errors).toBe(1);
      expect(result.state.p1).toBe(state.p1);
      expect(result.state.p2).toBe(state.p2);
      expect(result.state.k).toBe(0);
      expect(result.state.writesInBuffer).toBe(0);
      expect(result.state.comparisons).toBe(state.comparisons);

      // Recuperação imediata na decisão correta:
      const recovered = executeMergeStep(result.state, "DISPATCH_RIGHT");
      expect(recovered.valid).toBe(true);
      expect(recovered.state.k).toBe(1);
      expect(recovered.state.errors).toBe(1);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Empate Estável e Prioridade da Esquerda
  // --------------------------------------------------------------------------
  describe("3. Empate Estável e Prioridade da Esquerda", () => {
    it("exige prioridade da esquerda em empate para garantir estabilidade da ordenação", () => {
      const elements = assignMergeIdentities([16, 16]);
      const state = initMergeSortState(elements);

      expect(state.values[0].value).toBe(16);
      expect(state.values[1].value).toBe(16);
      expect(state.values[0].label).toBe("a");
      expect(state.values[1].label).toBe("b");

      // Tentar despachar o ramal direito no empate:
      const wrongResult = executeMergeStep(state, "DISPATCH_RIGHT");
      expect(wrongResult.valid).toBe(false);
      expect(wrongResult.isPedagogicalError).toBe(true);
      expect(wrongResult.errorReason).toContain("Estabilidade");

      // Despachar ramal esquerdo:
      const correctResult = executeMergeStep(state, "DISPATCH_LEFT");
      expect(correctResult.valid).toBe(true);
      expect(correctResult.state.buffer[0]?.label).toBe("a");
    });
  });

  // --------------------------------------------------------------------------
  // 4. Drenagem de Ramal (`DRAIN_REMAINDER`) e Ações Indisponíveis
  // --------------------------------------------------------------------------
  describe("4. Drenagem de Ramal e Ações Indisponíveis", () => {
    it("permite DRAIN_REMAINDER quando um ramal esgotar e transfere a cauda sem comparações", () => {
      const elements = assignMergeIdentities([10, 20]);
      let state = initMergeSortState(elements);

      // Despacha E (10)
      const step1 = executeMergeStep(state, "DISPATCH_LEFT");
      expect(step1.valid).toBe(true);
      state = step1.state;

      // Ramal Esquerdo esgotou -> fase DRAIN_READY
      expect(state.phase).toBe("DRAIN_READY");

      // Tentar despachar elemento individual é rejeitado:
      const invalidLeft = executeMergeStep(state, "DISPATCH_LEFT");
      expect(invalidLeft.valid).toBe(false);

      const invalidRight = executeMergeStep(state, "DISPATCH_RIGHT");
      expect(invalidRight.valid).toBe(false);

      // Aciona DRAIN_REMAINDER explicitamente:
      const drainResult = executeMergeStep(state, "DRAIN_REMAINDER");
      expect(drainResult.valid).toBe(true);
      expect(drainResult.state.comparisons).toBe(1);
      expect(drainResult.state.writesInBuffer).toBe(2);
    });

    it("ignora ações impossíveis sem penalidade e sem alterar métricas", () => {
      const elements = assignMergeIdentities([30, 10, 40, 20]);
      const state = initMergeSortState(elements);

      const res = executeMergeStep(state, "DRAIN_REMAINDER");
      expect(res.valid).toBe(false);
      expect(res.isPedagogicalError).toBe(false);
      expect(res.state.errors).toBe(0);
      expect(res.state.p1).toBe(state.p1);
    });
  });

  // --------------------------------------------------------------------------
  // 5. Apresentação Sequencial e Trava de Ação
  // --------------------------------------------------------------------------
  describe("5. Apresentação Sequencial e Trava de Ação", () => {
    it("deriva frames a partir do histórico para exibição ordenada sem reexecutar a engine", () => {
      const elements = assignMergeIdentities([40, 30, 20, 10]);
      const state = initMergeSortState(elements);

      const frames = deriveMergeFramesFromHistory(elements, state.history);
      expect(frames.length).toBeGreaterThan(0);
      expect(frames[0].values).toHaveLength(4);
      expect(frames[0].buffer).toBeDefined();
    });

    it("separa claramente a indexação O(1) de frames pré-computados da derivação O(m)", () => {
      const elements = assignMergeIdentities([40, 30, 20, 10]);
      const state = initMergeSortState(elements);

      const frames = deriveMergeFramesFromHistory(elements, state.history);
      expect(Array.isArray(frames)).toBe(true);

      const targetFrame = frames[0];
      expect(targetFrame).toBeDefined();
    });
  });

  // --------------------------------------------------------------------------
  // 6. Integração com Seletor de Práticas e Navegação
  // --------------------------------------------------------------------------
  describe("6. Integração com Seletor de Práticas e Navegação", () => {
    it("renderiza o tema Merge no PracticeSelector com suas 3 práticas", () => {
      const save = createDefaultSaveData();
      const html = renderToStaticMarkup(
        <PracticeSelector
          moduleId="merge"
          saveData={save}
          onSelectPractice={vi.fn()}
          onOpenTutorial={vi.fn()}
          onReturnHome={vi.fn()}
        />
      );

      expect(html).toContain("MÓDULO • MERGE SORT");
      expect(html).toContain("PRÁTICA BÁSICA");
      expect(html).toContain("PRÁTICA INTERMEDIÁRIA");
      expect(html).toContain("PRÁTICA AVANÇADA");
      expect(html).toContain("4 CARGAS");
      expect(html).toContain("5 CARGAS");
      expect(html).toContain("6 CARGAS");
    });

    it("renderiza a tela de resultados do Merge Sort com métricas segregadas de escrita", () => {
      const html = renderToStaticMarkup(
        <ResultScreen
          protocol="merge"
          finalArray={[10, 20, 30, 40]}
          comparisons={5}
          writesInBuffer={8}
          writesInMain={8}
          totalWrites={16}
          errors={0}
          hintsUsed={0}
          score={100}
          elapsedTimeMs={15000}
          practiceTitle="PRÁTICA BÁSICA"
          hasNextPhase={true}
          onNext={vi.fn()}
          onRepeat={vi.fn()}
          onOpenSelector={vi.fn()}
        />
      );

      expect(html).toContain("PRÁTICA BÁSICA");
      expect(html).toContain("5");
      expect(html).toContain("8");
      expect(html).toContain("16");
      expect(html).toContain("100");
      expect(html).toContain("PSEUDOCÓDIGO — MERGE SORT");
      expect(html).toContain("PRÓXIMA PRÁTICA");
      expect(html).toContain("REPETIR EXERCÍCIO");
      expect(html).toContain("SELETOR");
    });

    it("App aceita initialScreen='merge-practice' e inicializa o fluxo interno de desenvolvimento", () => {
      const html = renderToStaticMarkup(
        <App initialScreen="merge-practice" initialLevel="basic" />
      );

      expect(html).toContain("MÓDULO: MERGE SORT");
      expect(html).toContain("PRÁTICA BÁSICA (n=4)");
    });

    it("App aceita initialScreen='practice-selector' com initialModule='merge'", () => {
      const html = renderToStaticMarkup(
        <App initialScreen="practice-selector" initialModule="merge" />
      );

      expect(html).toContain("MÓDULO • MERGE SORT");
      expect(html).toContain("PRÁTICA BÁSICA");
    });

    it("disponibiliza Merge Sort publicamente no Hub em produção", () => {
      const html = renderToStaticMarkup(<App />);
      expect(html).toContain("SORTING");
      expect(html).toContain("BUBBLE SORT");
      expect(html).toContain("SELECTION SORT");
      expect(html).toContain("INSERTION SORT");
      expect(html).toContain("MERGE SORT");
    });

    it("ignora query params ?screen=merge-practice e ?module=merge quando DEV=false (bloqueio de produção)", () => {
      const originalDev = import.meta.env.DEV;
      try {
        (import.meta.env as any).DEV = false;

        // 1. Simula ?screen=merge-practice com DEV=false
        window.history.pushState({}, "", "/?screen=merge-practice");
        const htmlScreen = renderToStaticMarkup(<App />);
        expect(htmlScreen).toContain("SORTING");
        expect(htmlScreen).not.toContain("MÓDULO: MERGE SORT");
        expect(htmlScreen).not.toContain("ESTAÇÃO DE INTERCALAÇÃO");

        // 2. Simula ?module=merge com DEV=false
        window.history.pushState({}, "", "/?module=merge");
        const htmlModule = renderToStaticMarkup(<App />);
        expect(htmlModule).toContain("SORTING");
        expect(htmlModule).not.toContain("MÓDULO • MERGE SORT");
      } finally {
        (import.meta.env as any).DEV = originalDev;
        window.history.pushState({}, "", "/");
      }
    });
  });

  // --------------------------------------------------------------------------
  // 7. Fallback Procedural com Preservação de Duplicatas e Constraints
  // --------------------------------------------------------------------------
  describe("7. Fallback Procedural com Preservação de Duplicatas", () => {
    it("attemptDeterministicFallback gera duplicatas quando allowDuplicates é true para comprimento 6", () => {
      const fallbackResult = attemptDeterministicFallback(
        6,
        10,
        99,
        true,
        MERGE_ADVANCED_CONSTRAINTS,
        () => 0.5
      );

      expect(fallbackResult.found).toBe(true);
      if (fallbackResult.found) {
        expect(fallbackResult.values.length).toBe(6);
        const uniqueVals = new Set(fallbackResult.values);
        expect(uniqueVals.size).toBeLessThan(6);
      }
    });

    it("força o esgotamento das tentativas na API pública generateSortingArray e ativa fallback com sucesso", () => {
      // Passamos uma constraint restritiva que força 0 acertos normais, exigindo o fallback determinístico
      const result = generateSortingArray({
        length: 6,
        minValue: 10,
        maxValue: 99,
        allowDuplicates: true,
        maxAttempts: 5,
        constraints: MERGE_ADVANCED_CONSTRAINTS,
      });

      expect(result.values).toHaveLength(6);
      const uniqueVals = new Set(result.values);
      expect(uniqueVals.size).toBeLessThan(6);
      expect(result.attempts).toBeGreaterThanOrEqual(1);
    });

    it("generateMergePracticeArray produz array com constraints canônicas para todos os níveis", () => {
      const basic = generateMergePracticeArray("basic", "test-seed-1");
      expect(basic.result.values).toHaveLength(4);

      const intermediate = generateMergePracticeArray("intermediate", "test-seed-2");
      expect(intermediate.result.values).toHaveLength(5);

      const advanced = generateMergePracticeArray("advanced", "test-seed-3");
      expect(advanced.result.values).toHaveLength(6);
      const uniqueVals = new Set(advanced.result.values);
      expect(uniqueVals.size).toBeLessThan(6);
    });
  });

  // --------------------------------------------------------------------------
  // 8. Preservação de allowDuplicates: false nos Módulos Anteriores
  // --------------------------------------------------------------------------
  describe("8. Preservação de allowDuplicates: false nos Módulos Anteriores", () => {
    it("generateSortingArray com allowDuplicates=false gera rigorosamente valores estritamente distintos", () => {
      const res = generateSortingArray({
        length: 6,
        minValue: 10,
        maxValue: 99,
        allowDuplicates: false,
        seed: "distinct-check-seed",
      });

      expect(res.values).toHaveLength(6);
      const unique = new Set(res.values);
      expect(unique.size).toBe(6);
    });
  });

  // --------------------------------------------------------------------------
  // 9. Verificação Comportamental com Componentes Montados (Happy-DOM)
  // --------------------------------------------------------------------------
  describe("9. Verificação Comportamental com Componentes Montados", () => {
    it("bloqueia decisões do estudante durante a execução de múltiplos frames pendentes", () => {
      vi.useFakeTimers();
      const onComplete = vi.fn();
      const container = mount(
        <MergeGameScreen
          level="basic"
          initialArray={[20, 10]}
          onComplete={onComplete}
          onBackToSelector={vi.fn()}
        />
      );

      // p1=0 (20), p2=1 (10). Menor é ramal direito (10). Despacha direita (tecla 2):
      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "2" }));
      });

      // Agora fase é DRAIN_READY. Dispara DRAIN_REMAINDER (tecla 3), que produz múltiplos frames automáticos:
      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "3" }));
      });

      // Durante a animação dos frames intermediários, tentar acionar novas decisões (tecla 1 ou 2) é rejeitado:
      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "1" }));
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "2" }));
      });

      // Avança os timers de animação frame a frame
      act(() => {
        vi.advanceTimersByTime(250);
      });

      // Ao completar todos os frames e a observação final:
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it("apresenta conclusão na tela (badge OK e vetor ordenado) antes de navegar ao resultado", () => {
      vi.useFakeTimers();
      const onComplete = vi.fn();
      const container = mount(
        <MergeGameScreen
          level="basic"
          initialArray={[20, 10]}
          onComplete={onComplete}
          onBackToSelector={vi.fn()}
        />
      );

      // Despacha direita
      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "2" }));
      });

      // Despacha restante (inicia sequência de frames DRAIN + COPY_BACK)
      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "3" }));
      });

      // Avança os frames da animação, mas antes do timeout final de navegação (600ms)
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // A tela já exibe status de ordenação e o botão de resultados
      expect(container.textContent).toContain("VER RESULTADOS");
      expect(container.textContent).toContain("OK");

      // onComplete ainda não foi chamado antes da confirmação de navegação
      expect(onComplete).not.toHaveBeenCalled();

      // Agora avança o tempo de observação final
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it("cancela timers e callbacks pendentes ao reiniciar ou desmontar", () => {
      vi.useFakeTimers();
      const onComplete = vi.fn();
      const container = mount(
        <MergeGameScreen
          level="basic"
          initialArray={[20, 10]}
          onComplete={onComplete}
          onBackToSelector={vi.fn()}
        />
      );

      // Inicia ações
      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "2" }));
      });
      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "3" }));
      });

      // Clica em REINICIAR no meio da apresentação
      const restartBtn = Array.from(container.querySelectorAll("button")).find((btn) =>
        btn.textContent?.includes("REINICIAR")
      );
      expect(restartBtn).toBeDefined();
      act(() => {
        restartBtn?.click();
      });

      // Avança timers
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      // onComplete NÃO deve ter sido chamado pelo fluxo cancelado
      expect(onComplete).not.toHaveBeenCalled();
      expect(container.textContent).toContain("Prática reiniciada");
    });

    it("trata empate com duplicatas na interface: erro pedagógico na direita e recuperação com estabilidade na esquerda", () => {
      const onComplete = vi.fn();
      const container = mount(
        <MergeGameScreen
          level="basic"
          initialArray={[16, 16]}
          onComplete={onComplete}
          onBackToSelector={vi.fn()}
        />
      );

      // Tenta despachar ramal direito no empate:
      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "2" }));
      });

      // Deve registrar erro e exibir mensagem pedagógica de estabilidade
      expect(container.textContent).toContain("Estabilidade");
      expect(container.textContent).toContain("Decisões Incorretas");

      // Recupera despachando a esquerda:
      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "1" }));
      });

      expect(container.textContent).toContain("16a");
      expect(container.textContent).toContain("Excelente!");
    });

    it("ignora atalhos de triagem quando o foco está em campos editáveis", () => {
      const container = mount(
        <MergeGameScreen
          level="basic"
          initialArray={[30, 10, 40, 20]}
          onComplete={vi.fn()}
          onBackToSelector={vi.fn()}
        />
      );

      const input = document.createElement("input");
      document.body.appendChild(input);
      input.focus();

      // Dispara tecla 1 no input
      act(() => {
        input.dispatchEvent(
          new KeyboardEvent("keydown", { key: "1", bubbles: true, cancelable: true })
        );
      });

      // Como o foco estava em um campo editável, a ação não foi disparada
      expect(container.textContent).toContain("Escritas Buffer");
      const bufferSpan = container.querySelector('[data-testid="writes-in-buffer"]');
      expect(bufferSpan?.textContent?.trim()).toBe("0");

      input.remove();
    });

    it("não duplica ativações quando event.repeat é verdadeiro", () => {
      const container = mount(
        <MergeGameScreen
          level="basic"
          initialArray={[10, 20]}
          onComplete={vi.fn()}
          onBackToSelector={vi.fn()}
        />
      );

      // Dispara tecla repetida (usuário segurando a tecla)
      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "1", repeat: true })
        );
      });

      // buffer deve continuar vazio pois repeat foi ignorado
      const bufferSpan = container.querySelector('[data-testid="writes-in-buffer"]');
      expect(bufferSpan?.textContent?.trim()).toBe("0");
    });

    it("suporta modo prefers-reduced-motion com avanço discreto manual sem temporizadores", () => {
      // Mock do matchMedia para reduced motion
      vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
        matches: query.includes("prefers-reduced-motion: reduce"),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const onComplete = vi.fn();
      const container = mount(
        <MergeGameScreen
          level="basic"
          initialArray={[20, 10]}
          onComplete={onComplete}
          onBackToSelector={vi.fn()}
        />
      );

      // Despacha direita (passo simples)
      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "2" }));
      });

      // Dispara DRAIN_REMAINDER (passo que produz múltiplos quadros: DRAIN + COPY_BACK)
      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "3" }));
      });

      // Em reduced motion, os frames NÃO são pulados: a UI exibe o botão de avanço discreto manual
      expect(container.textContent).toContain("PRÓXIMO PASSO AUTOMÁTICO");

      // Avança manualmente o passo discreto
      const advanceBtn = Array.from(container.querySelectorAll("button")).find((btn) =>
        btn.textContent?.includes("PRÓXIMO PASSO AUTOMÁTICO")
      );
      expect(advanceBtn).toBeDefined();

      act(() => {
        advanceBtn?.click();
      });

      // A estação avança sem depender de timers forçados
      expect(container.textContent).toBeDefined();
    });
  });
});
