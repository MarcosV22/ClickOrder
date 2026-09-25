// @vitest-environment happy-dom
// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import App from "../App";
import MergeTutorialScreen from "./MergeTutorialScreen";
import PracticeSetCompleteScreen from "./PracticeSetCompleteScreen";
import {
  createDefaultSaveData,
  recordExerciseCompletion,
  recordTutorialCompletion,
  isExerciseSetCompleted,
  isModuleRegularPracticeCompleted,
  isModuleTutorialCompleted,
  MERGE_EXERCISE_SETS,
  STORAGE_KEY,
  type GameSaveSchemaV4,
} from "../game/persistence";

describe("Merge Sort Full Integration & Lifecycle Flow (P3.1-F)", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    localStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const mount = (element: React.ReactElement) => {
    act(() => {
      root.render(element);
    });
    return container;
  };

  // --------------------------------------------------------------------------
  // 1. Hub -> ProtocolCard -> Briefing
  // --------------------------------------------------------------------------
  describe("1. Hub e Acesso Inicial", () => {
    it("apresenta o card do Merge Sort com status disponível e aciona briefing ao clicar em Iniciar Treinamento", () => {
      mount(<App initialScreen="home" />);

      expect(container.textContent).toContain("MERGE SORT");
      expect(container.textContent).toContain("DIVISÃO E INTERCALAÇÃO");

      // Localiza o botão "INICIAR TREINAMENTO" dentro do card do Merge Sort
      const startButtons = Array.from(container.querySelectorAll("button")).filter((btn) =>
        btn.textContent?.includes("INICIAR TREINAMENTO")
      );
      // O quarto botão de Iniciar Treinamento corresponde ao Merge Sort (Bubble, Selection, Insertion, Merge)
      const mergeStartBtn = startButtons[3] ?? startButtons[startButtons.length - 1];
      expect(mergeStartBtn).toBeDefined();

      act(() => {
        mergeStartBtn.click();
      });

      // Deve estar na tela de Briefing do Merge Sort
      expect(container.textContent).toContain("PROTOCOLO: MERGE SORT");
      expect(container.textContent).toContain("DIVISÃO E INTERCALAÇÃO");
    });
  });

  // --------------------------------------------------------------------------
  // 2. Tutorial Semantics: Abandono vs Conclusão Factual
  // --------------------------------------------------------------------------
  describe("2. Semântica Factual do Tutorial", () => {
    it("não marca tutorial como concluído ao abandonar ou reiniciar", () => {
      const onComplete = vi.fn();
      const onBack = vi.fn();

      mount(<MergeTutorialScreen onComplete={onComplete} onBack={onBack} />);

      expect(container.textContent).toContain("TUTORIAL GUIADO • MERGE SORT");
      expect(container.textContent).toContain("VETOR AUXILIAR TEMPORÁRIO B");

      // Clicar em reiniciar não chama onComplete
      const restartBtn = Array.from(container.querySelectorAll("button")).find((btn) =>
        btn.textContent?.includes("REINICIAR")
      );
      expect(restartBtn).toBeDefined();
      act(() => {
        restartBtn?.click();
      });
      expect(onComplete).not.toHaveBeenCalled();

      // Clicar em voltar chama onBack mas não conclui
      const backBtn = Array.from(container.querySelectorAll("button")).find((btn) =>
        btn.textContent?.includes("VOLTAR")
      );
      expect(backBtn).toBeDefined();
      act(() => {
        backBtn?.click();
      });
      expect(onBack).toHaveBeenCalled();
      expect(onComplete).not.toHaveBeenCalled();
    });

    it("grava completedTutorial somente no evento factual de conclusão de ponta a ponta", () => {
      let state = createDefaultSaveData();
      expect(isModuleTutorialCompleted(state, "merge")).toBe(false);

      // Simula conclusão factual do tutorial
      state = recordTutorialCompletion(state, "merge", undefined, 3);
      expect(isModuleTutorialCompleted(state, "merge")).toBe(true);
      expect(state.modules.merge?.completedTutorial).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Modo Demonstração Sem Alteração de Progresso ou Scores
  // --------------------------------------------------------------------------
  describe("3. Modo Demonstração Observacional", () => {
    it("acessa a demonstração do Merge Sort sem alterar save, pontuação ou records", () => {
      const initialSave = createDefaultSaveData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSave));

      mount(<App initialScreen="demonstration" initialDemonstrationProtocol="merge" />);

      expect(container.textContent).toContain("MODO DEMONSTRAÇÃO // EXECUÇÃO CANÔNICA");
      expect(container.textContent).toContain("PROTOCOLO MERGE SORT");

      // Verifica que o save permanece exatamente igual ao inicial
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(stored.modules.merge.completedTutorial).toBe(false);
      expect(stored.modules.merge.exerciseSets).toEqual({});
    });
  });

  // --------------------------------------------------------------------------
  // 4. Conclusão Canônica com Save Schema v4 e Transição de Desbloqueio
  // --------------------------------------------------------------------------
  describe("4. Gravação Única Canônica e Desbloqueio Sequencial", () => {
    it("concluir a Prática Básica grava no save e desbloqueia a Intermediária", () => {
      let state = createDefaultSaveData();

      state = recordExerciseCompletion(
        state,
        "merge",
        MERGE_EXERCISE_SETS.BASIC,
        { score: 95, errors: 0, hintsUsed: 0, elapsedTimeMs: 14000 }
      );

      expect(isExerciseSetCompleted(state, "merge", MERGE_EXERCISE_SETS.BASIC)).toBe(true);
      expect(state.modules.merge?.exerciseSets[MERGE_EXERCISE_SETS.BASIC]?.completed).toBe(true);
      expect(state.modules.merge?.exerciseSets[MERGE_EXERCISE_SETS.BASIC]?.bestRecord?.bestScore).toBe(95);

      // Intermediária desbloqueada, Avançada bloqueada
      expect(state.modules.merge?.exerciseSets[MERGE_EXERCISE_SETS.INTERMEDIATE]?.completed).toBeUndefined();
    });
  });

  // --------------------------------------------------------------------------
  // 5. Conclusão entre Sessões (Cross-Session 3/3)
  // --------------------------------------------------------------------------
  describe("5. Conclusão entre Sessões (Cross-Session 3/3)", () => {
    it("computa conclusão curricular 3/3 quando Básica e Intermediária já estavam salvas e apenas Avançada é feita nesta sessão", () => {
      // Cria estado salvo simulando sessão anterior com Básica e Intermediária completadas
      let preExistingSave = createDefaultSaveData();
      preExistingSave = recordExerciseCompletion(
        preExistingSave,
        "merge",
        MERGE_EXERCISE_SETS.BASIC,
        { score: 100, errors: 0, hintsUsed: 0, elapsedTimeMs: 10000 }
      );
      preExistingSave = recordExerciseCompletion(
        preExistingSave,
        "merge",
        MERGE_EXERCISE_SETS.INTERMEDIATE,
        { score: 90, errors: 1, hintsUsed: 0, elapsedTimeMs: 18000 }
      );

      // Agora registra somente a prática Avançada nesta sessão
      const updatedSave = recordExerciseCompletion(
        preExistingSave,
        "merge",
        MERGE_EXERCISE_SETS.ADVANCED,
        { score: 85, errors: 2, hintsUsed: 1, elapsedTimeMs: 24000 }
      );

      // O módulo agora atinge 3/3 curricular
      expect(isModuleRegularPracticeCompleted(updatedSave, "merge")).toBe(true);

      // Renderiza a tela de conclusão com apenas 1 resultado factual da sessão atual
      const sessionOnlyResult = [
        {
          level: "advanced" as const,
          practiceTitle: "Prática Avançada: Tamanho 6",
          score: 85,
          errors: 2,
          comparisons: 9,
          writesInBuffer: 16,
          writesInMain: 16,
          elapsedTimeMs: 24000,
        },
      ];

      mount(
        <PracticeSetCompleteScreen
          moduleId="merge"
          saveData={updatedSave}
          practiceResults={sessionOnlyResult}
          onRepeatPractices={vi.fn()}
          onOpenSelector={vi.fn()}
          onReturnHome={vi.fn()}
        />
      );

      // A tela deve refletir a síntese do Merge Sort
      expect(container.textContent).toContain("MÓDULO EDUCACIONAL • MERGE SORT • CURRÍCULO 3/3 CONCLUÍDO");
      expect(container.textContent).toContain("divisão e intercalação");
      expect(container.textContent).toContain("Síntese Conceitual do Merge Sort");

      // Deve mostrar as métricas factuais da sessão (sem inventar métricas das práticas passadas)
      expect(container.textContent).toContain("16"); // Buffer
      expect(container.textContent).toContain("16"); // Vetor
      expect(container.textContent).toContain("3/3"); // Conclusão curricular completa
      expect(container.textContent).toContain("1 / 3"); // Práticas da sessão atual
      expect(container.textContent).toContain("Salvo");
    });
  });

  // --------------------------------------------------------------------------
  // 6. Ação de Repetir Práticas
  // --------------------------------------------------------------------------
  describe("6. Repetição de Práticas", () => {
    it("REPETIR PRÁTICAS reinicia o fluxo a partir da Prática Básica", () => {
      const onRepeatPractices = vi.fn();
      const onOpenSelector = vi.fn();
      const onReturnHome = vi.fn();

      const save = createDefaultSaveData();

      mount(
        <PracticeSetCompleteScreen
          moduleId="merge"
          saveData={save}
          practiceResults={[]}
          onRepeatPractices={onRepeatPractices}
          onOpenSelector={onOpenSelector}
          onReturnHome={onReturnHome}
        />
      );

      const repeatBtn = Array.from(container.querySelectorAll("button")).find((btn) =>
        btn.textContent?.includes("REPETIR PRÁTICAS")
      );
      expect(repeatBtn).toBeDefined();

      act(() => {
        repeatBtn?.click();
      });

      expect(onRepeatPractices).toHaveBeenCalled();
    });
  });
});
