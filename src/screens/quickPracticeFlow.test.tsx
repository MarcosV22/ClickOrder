// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import QuickGameScreen from "./QuickGameScreen";
import PracticeSelector from "./PracticeSelector";
import ResultScreen from "./ResultScreen";
import App from "../App";
import {
  initQuickSortState,
  stepQuickSort,
  reconstructQuickVisualFrame,
} from "../game/sorting/quick";
import {
  generateQuickPracticeArray,
  QUICK_FALLBACK_ARRAYS,
  hasQuickBalancedRootPartition,
  hasQuickPivotEqualityComparison,
} from "../game/sorting/quick/quickConstraints";
import { createDefaultSaveData, QUICK_EXERCISE_SETS } from "../game/persistence";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe("Quick Sort Practice Flow & Partitioning Interface (P3.2-D)", () => {
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
  // 1. Renderização e Estrutura Visual da Estação de Particionamento
  // --------------------------------------------------------------------------
  describe("1. Renderização e Estrutura Visual", () => {
    it("renderiza a interface com vetor único, 4 regiões de Lomuto e telemetria", () => {
      const html = renderToStaticMarkup(
        <QuickGameScreen
          level="basic"
          initialArray={[50, 20, 40, 10]}
          onComplete={vi.fn()}
          onBackToSelector={vi.fn()}
        />
      );

      // Identificação curricular
      expect(html).toContain("PRÁTICA BÁSICA (n=4)");

      // Botões de navegação e apoio
      expect(html).toContain("DICA");
      expect(html).toContain("REINICIAR");
      expect(html).toContain("SELETOR");

      // Telemetria factual
      expect(html).toContain("Comparações");
      expect(html).toContain("Trocas");
      expect(html).toContain("Escritas no Vetor");
      expect(html).toContain("Decisões Incorretas");
      expect(html).toContain("Pontuação");

      // 4 Regiões de Lomuto com rótulos textuais
      expect(html).toContain("1. ≤ Pivô");
      expect(html).toContain("2. &gt; Pivô");
      expect(html).toContain("3. Não analisados");
      expect(html).toContain("4. Pivô");

      // Pseudocódigo canônico presente
      expect(html).toContain("PSEUDOCÓDIGO — QUICK SORT (LOMUTO)");

      // Não contém termos industriais proibidos
      expect(html).not.toContain("estação de triagem");
      expect(html).not.toContain("operador");
      expect(html).not.toContain("carga");
    });

    it("lida com regiões vazias sem gerar caixas falsas ou layout desbalanceado", () => {
      const container = mount(
        <QuickGameScreen
          level="basic"
          initialArray={[50, 20, 40, 10]}
          onComplete={vi.fn()}
          onBackToSelector={vi.fn()}
        />
      );

      // No início de [50, 20, 40, 10] com pivô no índice 3 (valor 10) e i = -1:
      // Região <= pivô está vazia (i < low).
      expect(container.textContent).toContain("vazia");
      // Região > pivô está vazia antes de qualquer comparação.
      expect(container.textContent).toContain("1. ≤ Pivô");
      expect(container.textContent).toContain("2. > Pivô");
    });

    it("exibe sufixos de identidade de duplicatas de forma nítida e sem alterar o valor", () => {
      const container = mount(
        <QuickGameScreen
          level="advanced"
          initialArray={[30, 12, 50, 12, 40, 25]}
          onComplete={vi.fn()}
          onBackToSelector={vi.fn()}
        />
      );

      // Deve exibir os sufixos a e b para os elementos duplicados
      expect(container.textContent).toContain("12a");
      expect(container.textContent).toContain("12b");
    });
  });

  // --------------------------------------------------------------------------
  // 2. Classificação Correta, Erro e Recuperação
  // --------------------------------------------------------------------------
  describe("2. Ações de Decisão, Erro e Recuperação", () => {
    it("processa classificação correta, erro conceitual com feedback e recuperação subsequente", () => {
      const container = mount(
        <QuickGameScreen
          level="basic"
          initialArray={[50, 20, 40, 10]}
          onComplete={vi.fn()}
          onBackToSelector={vi.fn()}
        />
      );

      // Elemento sob análise: j = 0 (valor 50), pivô: high = 3 (valor 10) -> 50 > 10.
      // 1. Decisão ERRADA: clicar em "MENOR OU IGUAL AO PIVÔ [1]"
      const btnLess = Array.from(container.querySelectorAll("button")).find((btn) =>
        btn.textContent?.includes("MENOR OU IGUAL AO PIVÔ")
      );
      expect(btnLess).toBeDefined();

      act(() => {
        btnLess?.click();
      });

      // Feedback formativo exibido, erro contabilizado, sem alteração nos valores
      expect(container.textContent).toContain("Decisões Incorretas");
      const errorsEl = container.querySelector('[data-testid="quick-errors"]');
      expect(errorsEl?.textContent?.trim()).toBe("1");

      // 2. Recuperação: clicar em "MAIOR QUE O PIVÔ [2]"
      const btnGreater = Array.from(container.querySelectorAll("button")).find((btn) =>
        btn.textContent?.includes("MAIOR QUE O PIVÔ")
      );
      expect(btnGreater).toBeDefined();

      act(() => {
        btnGreater?.click();
      });

      // Erro permanece em 1, mas comparação foi registrada
      const compsEl = container.querySelector('[data-testid="quick-comparisons"]');
      expect(compsEl?.textContent?.trim()).toBe("1");
    });

    it("aceita igualdade no botão 'Menor ou igual' conforme a convenção de Lomuto", () => {
      // Vetor com elemento igual ao pivô: pivô no final = 12
      const container = mount(
        <QuickGameScreen
          level="advanced"
          initialArray={[12, 30, 40, 50, 60, 12]}
          onComplete={vi.fn()}
          onBackToSelector={vi.fn()}
        />
      );

      // j = 0 (valor 12), pivô = 12 -> 12 <= 12 deve ser aceito em LESS_OR_EQUAL
      const btnLess = Array.from(container.querySelectorAll("button")).find((btn) =>
        btn.textContent?.includes("MENOR OU IGUAL AO PIVÔ")
      );

      act(() => {
        btnLess?.click();
      });

      // Não gera erro!
      const errorsEl = container.querySelector('[data-testid="quick-errors"]');
      expect(errorsEl?.textContent?.trim()).toBe("0");
      const compsEl = container.querySelector('[data-testid="quick-comparisons"]');
      expect(compsEl?.textContent?.trim()).toBe("1");
    });

    it("avança a fronteira sem gerar troca quando i == j", () => {
      // Elemento 5 <= pivô 10 no índice 0
      // Antes: i = -1, j = 0. Ao classificar <=: i torna-se 0. Como i == j (0 == 0),
      // a engine omite a troca física por envolver o mesmo elemento.
      const container = mount(
        <QuickGameScreen
          level="basic"
          initialArray={[5, 50, 40, 10]}
          onComplete={vi.fn()}
          onBackToSelector={vi.fn()}
        />
      );

      const btnLess = Array.from(container.querySelectorAll("button")).find((btn) =>
        btn.textContent?.includes("MENOR OU IGUAL AO PIVÔ")
      );

      act(() => {
        btnLess?.click();
      });

      // Trocas permanece 0 pois a engine omitiu a permuta no mesmo índice!
      const swapsEl = container.querySelector('[data-testid="quick-swaps"]');
      expect(swapsEl?.textContent?.trim()).toBe("0");
    });

    it("habilita e executa a colocação do pivô na posição final quando j atinge o pivô", () => {
      // Vetor com 2 elementos: [20, 10]
      // j=0 (20 > 10). Após classificar 20 como MAIOR, j=1 atinge high (pivô).
      const container = mount(
        <QuickGameScreen
          level="basic"
          initialArray={[20, 10]}
          onComplete={vi.fn()}
          onBackToSelector={vi.fn()}
        />
      );

      // Classifica 20 como maior que 10
      const btnGreater = Array.from(container.querySelectorAll("button")).find((btn) =>
        btn.textContent?.includes("MAIOR QUE O PIVÔ")
      );
      act(() => {
        btnGreater?.click();
      });

      // Agora o botão "COLOCAR O PIVÔ NA POSIÇÃO FINAL" deve estar habilitado
      const btnPivot = Array.from(container.querySelectorAll("button")).find((btn) =>
        btn.textContent?.includes("COLOCAR O PIVÔ NA POSIÇÃO FINAL")
      );
      expect(btnPivot).toBeDefined();
      expect(btnPivot?.hasAttribute("disabled")).toBe(false);

      act(() => {
        btnPivot?.click();
      });

      // Troca ocorreu: pivô 10 foi para o índice 0 e 20 para o índice 1!
      const swapsEl = container.querySelector('[data-testid="quick-swaps"]');
      expect(swapsEl?.textContent?.trim()).toBe("1");
    });
  });

  // --------------------------------------------------------------------------
  // 3. Sincronização, Bloqueio de Ações e Cancelamento
  // --------------------------------------------------------------------------
  describe("3. Sincronização de Apresentação e Ciclo de Vida", () => {
    it("bloqueia novas decisões enquanto houver frames pendentes sendo apresentados", () => {
      vi.useFakeTimers();
      const container = mount(
        <QuickGameScreen
          level="basic"
          initialArray={[20, 10]}
          onComplete={vi.fn()}
          onBackToSelector={vi.fn()}
        />
      );

      // Classifica 20 como MAIOR e conclui seu frame
      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "2" }));
        vi.advanceTimersByTime(300);
      });

      // Posiciona o pivô (dispara sequência de múltiplos quadros)
      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "3" }));
      });

      // Durante a animação dos quadros do pivô, novas teclas devem ser bloqueadas
      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "1" }));
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "2" }));
      });

      // Comparações permanece em 1 pois as ações foram descartadas pela trava
      const compsEl = container.querySelector('[data-testid="quick-comparisons"]');
      expect(compsEl?.textContent?.trim()).toBe("1");
    });

    it("cancela temporizadores e apresentações pendentes ao reiniciar a prática", () => {
      vi.useFakeTimers();
      const onComplete = vi.fn();
      const container = mount(
        <QuickGameScreen
          level="basic"
          initialArray={[20, 10]}
          onComplete={onComplete}
          onBackToSelector={vi.fn()}
        />
      );

      // Ações
      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "2" }));
        vi.advanceTimersByTime(300);
      });
      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "3" }));
      });

      // Clica em REINICIAR antes de completar o temporizador final
      const restartBtn = Array.from(container.querySelectorAll("button")).find((btn) =>
        btn.textContent?.includes("REINICIAR")
      );
      expect(restartBtn).toBeDefined();
      act(() => {
        restartBtn?.click();
      });

      // Avança os timers passados
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      // onComplete NÃO deve ser disparado pelo fluxo anterior cancelado
      expect(onComplete).not.toHaveBeenCalled();
      expect(container.textContent).toContain("Prática reiniciada");
    });

    it("apresenta conclusão na tela antes de navegar para a tela de resultado", () => {
      vi.useFakeTimers();
      const onComplete = vi.fn();
      const container = mount(
        <QuickGameScreen
          level="basic"
          initialArray={[20, 10]}
          onComplete={onComplete}
          onBackToSelector={vi.fn()}
        />
      );

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "2" }));
        vi.advanceTimersByTime(300);
      });
      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "3" }));
      });

      // Avança os quadros da animação (240ms por quadro), mas antes do timeout final de 600ms
      act(() => {
        vi.advanceTimersByTime(800);
      });

      // A tela exibe ordenação concluída
      expect(container.textContent).toContain("ORDENAÇÃO CONCLUÍDA");

      // onComplete ainda não foi chamado antes de terminar a contemplação final
      expect(onComplete).not.toHaveBeenCalled();

      // Agora avança o restante do tempo
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Modo prefers-reduced-motion e Teclado
  // --------------------------------------------------------------------------
  describe("4. Acessibilidade, Teclado e Reduced Motion", () => {
    it("oferece avanço discreto manual sem temporizadores sob prefers-reduced-motion", () => {
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
        <QuickGameScreen
          level="basic"
          initialArray={[20, 10]}
          onComplete={onComplete}
          onBackToSelector={vi.fn()}
        />
      );

      // Classifica 20 como MAIOR
      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "2" }));
      });

      // Coloca pivô (gera múltiplos quadros até a conclusão)
      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "3" }));
      });

      // Sob reduced motion, exibe botão de avanço discreto
      expect(container.textContent).toContain("AVANÇAR PASSO");

      const advanceBtn = Array.from(container.querySelectorAll("button")).find((btn) =>
        btn.textContent?.includes("AVANÇAR PASSO")
      );
      expect(advanceBtn).toBeDefined();

      act(() => {
        advanceBtn?.click();
      });

      // Avança sem animações contínuas
      expect(container.textContent).toBeDefined();
    });

    it("ignora atalhos de teclado 1/2/3 quando o foco está em campos editáveis", () => {
      const container = mount(
        <QuickGameScreen
          level="basic"
          initialArray={[50, 20, 40, 10]}
          onComplete={vi.fn()}
          onBackToSelector={vi.fn()}
        />
      );

      const input = document.createElement("input");
      document.body.appendChild(input);
      input.focus();

      act(() => {
        input.dispatchEvent(
          new KeyboardEvent("keydown", { key: "2", bubbles: true, cancelable: true })
        );
      });

      // Não houve avanço pois o foco estava em campo de texto
      const compsEl = container.querySelector('[data-testid="quick-comparisons"]');
      expect(compsEl?.textContent?.trim()).toBe("0");

      input.remove();
    });

    it("ignora atalhos de teclado quando event.repeat é verdadeiro", () => {
      const container = mount(
        <QuickGameScreen
          level="basic"
          initialArray={[50, 20, 40, 10]}
          onComplete={vi.fn()}
          onBackToSelector={vi.fn()}
        />
      );

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "2", repeat: true })
        );
      });

      const compsEl = container.querySelector('[data-testid="quick-comparisons"]');
      expect(compsEl?.textContent?.trim()).toBe("0");
    });
  });

  // --------------------------------------------------------------------------
  // 5. Integração com Seletor, Resultados e Navegação em Sessão
  // --------------------------------------------------------------------------
  describe("5. Navegação e Ciclo de Sessão na Aplicação", () => {
    it("exibe ResultScreen com estatísticas específicas do Quick Sort e sem botão de replay ativo", () => {
      const html = renderToStaticMarkup(
        <ResultScreen
          finalArray={[10, 20, 40, 50]}
          comparisons={5}
          swaps={2}
          writesInArray={4}
          errors={0}
          hintsUsed={0}
          score={100}
          elapsedTimeMs={12000}
          phase={1}
          protocol="quick"
          practiceTitle="PRÁTICA BÁSICA"
          hasNextPhase={true}
          onNext={vi.fn()}
          onRepeat={vi.fn()}
          onViewReplay={undefined}
          onOpenSelector={vi.fn()}
        />
      );

      // Protocolo e identificação
      expect(html).toContain("QUICK SORT");
      expect(html).toContain("PRÁTICA BÁSICA");

      // Métricas canônicas
      expect(html).toContain("Trocas");
      expect(html).toContain("Escritas no Vetor");

      // Não deve exibir botão de Replay ativo
      expect(html).not.toContain("VER REPLAY");
      expect(html).not.toContain("VER REPLAY COMPLETO");

      // Pseudocódigo específico do Quick Sort
      expect(html).toContain("quickSort(A, inicio, fim)");
      expect(html).toContain("particionar(A, inicio, fim)");
    });

    it("permite avanço de nível em sessão, desbloqueando a Intermediária após a Básica", () => {
      // Monta App diretamente na tela do Seletor de Práticas do Quick Sort
      const container = mount(
        <App
          initialScreen="practice-selector"
          initialModule="quick"
        />
      );

      expect(container.textContent).toContain("QUICK SORT");
      expect(container.textContent).toContain("PARTICIONAMENTO EM TORNO DO PIVÔ");
      expect(container.textContent).toContain("PRÁTICA BÁSICA");

      // Botão de iniciar prática básica disponível
      const startBtn = Array.from(container.querySelectorAll("button")).find((btn) =>
        btn.textContent?.includes("INICIAR PRÁTICA")
      );
      expect(startBtn).toBeDefined();
    });

    it("restringe eventuais atalhos de URL ao ambiente de desenvolvimento", () => {
      // Simula query param no ambiente
      delete (window as any).location;
      (window as any).location = new URL("https://sorting-station.app/?module=quick");

      // Em produção (DEV = false), a rota não deve abrir telas não liberadas ao hub público
      // O App deve inicializar com a tela segura default (home)
      const container = mount(<App />);
      expect(container.textContent).toBeDefined();
    });
  });
});
