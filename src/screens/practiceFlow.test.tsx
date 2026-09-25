import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import PracticeSelector from "./PracticeSelector";
import PracticeSetCompleteScreen from "./PracticeSetCompleteScreen";
import {
  createDefaultSaveData,
  recordExerciseCompletion,
  recordTutorialCompletion,
  BUBBLE_EXERCISE_SETS,
  SELECTION_EXERCISE_SETS,
  INSERTION_EXERCISE_SETS,
} from "../game/persistence";

describe("Practice Flow & Presentation Integration (PLATFORM-R1-B)", () => {
  describe("PracticeSelector", () => {
    it("renderiza os 3 níveis curriculares canônicos para Bubble Sort", () => {
      const save = createDefaultSaveData();
      const html = renderToStaticMarkup(
        <PracticeSelector
          moduleId="bubble"
          saveData={save}
          onSelectPractice={vi.fn()}
          onOpenTutorial={vi.fn()}
          onReturnHome={vi.fn()}
        />
      );

      expect(html).toContain("MÓDULO • BUBBLE SORT");
      expect(html).toContain("PRÁTICA BÁSICA");
      expect(html).toContain("PRÁTICA INTERMEDIÁRIA");
      expect(html).toContain("PRÁTICA AVANÇADA");
      expect(html).toContain("DISPONÍVEL");
      expect(html).toContain("BLOQUEADA");
      expect(html).toContain("EARLY EXIT — TÉRMINO ANTECIPADO");
      expect(html).toContain("Conclua as 3 práticas regulares");
    });

    it("renderiza os 3 níveis curriculares canônicos para Selection Sort sem menção a fases legadas", () => {
      const save = createDefaultSaveData();
      const html = renderToStaticMarkup(
        <PracticeSelector
          moduleId="selection"
          saveData={save}
          onSelectPractice={vi.fn()}
          onOpenTutorial={vi.fn()}
          onReturnHome={vi.fn()}
        />
      );

      expect(html).toContain("MÓDULO • SELECTION SORT");
      expect(html).toContain("PRÁTICA BÁSICA");
      expect(html).toContain("PRÁTICA INTERMEDIÁRIA");
      expect(html).toContain("PRÁTICA AVANÇADA");
      expect(html).toContain("4 ELEMENTOS");
      expect(html).toContain("5 ELEMENTOS");
      expect(html).toContain("6 ELEMENTOS");
      // Não exibe Early Exit no Selection
      expect(html).not.toContain("EARLY EXIT");
    });

    it("desbloqueia Prática Intermediária e Avançada sequencialmente com base no Schema v4", () => {
      let save = createDefaultSaveData();
      save = recordExerciseCompletion(save, "bubble", BUBBLE_EXERCISE_SETS.BASIC, {
        score: 95,
        errors: 0,
        hintsUsed: 1,
        elapsedTimeMs: 12000,
      });

      const html = renderToStaticMarkup(
        <PracticeSelector
          moduleId="bubble"
          saveData={save}
          onSelectPractice={vi.fn()}
          onOpenTutorial={vi.fn()}
          onReturnHome={vi.fn()}
        />
      );

      // Básica concluída, Intermediária disponível, Avançada bloqueada
      expect(html).toContain("CONCLUÍDA");
      expect(html).toContain("95 PTS");
    });

    it("desbloqueia o card de Early Exit para Bubble quando todas as práticas forem concluídas", () => {
      let save = createDefaultSaveData();
      save = recordExerciseCompletion(save, "bubble", BUBBLE_EXERCISE_SETS.BASIC);
      save = recordExerciseCompletion(save, "bubble", BUBBLE_EXERCISE_SETS.INTERMEDIATE);
      save = recordExerciseCompletion(save, "bubble", BUBBLE_EXERCISE_SETS.ADVANCED);

      const onStartChallenge = vi.fn();
      const html = renderToStaticMarkup(
        <PracticeSelector
          moduleId="bubble"
          saveData={save}
          onSelectPractice={vi.fn()}
          onOpenTutorial={vi.fn()}
          onReturnHome={vi.fn()}
          onStartChallenge={onStartChallenge}
        />
      );

      expect(html).toContain("DESAFIO DISPONÍVEL");
      expect(html).toContain("INICIAR DESAFIO");
      expect(html).not.toContain("Conclua as 3 práticas regulares");
    });
  });

  describe("PracticeSetCompleteScreen", () => {
    it("renderiza a conclusão unificada com métricas do Bubble Sort", () => {
      const results = [
        {
          level: "basic",
          practiceTitle: "PRÁTICA BÁSICA",
          comparisons: 6,
          swaps: 3,
          errors: 0,
          hintsUsed: 0,
          score: 100,
          finalArray: [1, 2, 3, 4],
        },
        {
          level: "intermediate",
          practiceTitle: "PRÁTICA INTERMEDIÁRIA",
          comparisons: 10,
          swaps: 4,
          errors: 1,
          hintsUsed: 0,
          score: 90,
          finalArray: [1, 2, 3, 4, 5],
        },
        {
          level: "advanced",
          practiceTitle: "PRÁTICA AVANÇADA",
          comparisons: 15,
          swaps: 6,
          errors: 0,
          hintsUsed: 1,
          score: 95,
          finalArray: [1, 2, 3, 4, 5, 6],
        },
      ];

      const html = renderToStaticMarkup(
        <PracticeSetCompleteScreen
          moduleId="bubble"
          practiceResults={results}
          onRepeatPractices={vi.fn()}
          onReturnHome={vi.fn()}
          onOpenSelector={vi.fn()}
          isChallengeUnlocked={true}
          onStartChallenge={vi.fn()}
        />
      );

      expect(html).toContain("CONJUNTO DE PRÁTICAS");
      expect(html).toContain("CONCLUÍDO!");
      expect(html).toContain("BUBBLE SORT");
      expect(html).toContain("Trocas de Posição");
      expect(html).toContain("31"); // 6 + 10 + 15 comparações
      expect(html).toContain("13"); // 3 + 4 + 6 trocas
      expect(html).toContain("95"); // média (100 + 90 + 95) / 3 = 95
      expect(html).toContain("SELETOR DE PRÁTICAS");
      expect(html).toContain("MODO DESAFIO: EARLY EXIT");
    });

    it("renderiza a conclusão unificada com métricas do Selection Sort", () => {
      const results = [
        {
          level: "basic",
          practiceTitle: "PRÁTICA BÁSICA",
          comparisons: 6,
          swaps: 2,
          errors: 0,
          hintsUsed: 0,
          score: 100,
          finalArray: [1, 2, 3, 4],
        },
      ];

      const html = renderToStaticMarkup(
        <PracticeSetCompleteScreen
          moduleId="selection"
          practiceResults={results}
          onRepeatPractices={vi.fn()}
          onReturnHome={vi.fn()}
          onOpenSelector={vi.fn()}
        />
      );

      expect(html).toContain("SELECTION SORT");
      expect(html).toContain("Trocas (Transferências)");
      expect(html).toContain("SELETOR DE PRÁTICAS");
      expect(html).not.toContain("EARLY EXIT");
    });

    it("renderiza a conclusão unificada com métricas do Insertion Sort", () => {
      const results = [
        {
          level: "basic",
          practiceTitle: "PRÁTICA BÁSICA",
          comparisons: 5,
          shifts: 4,
          insertions: 3,
          errors: 0,
          hintsUsed: 0,
          score: 100,
          finalArray: [1, 2, 3, 4],
        },
      ];

      const html = renderToStaticMarkup(
        <PracticeSetCompleteScreen
          moduleId="insertion"
          practiceResults={results}
          onRepeatPractices={vi.fn()}
          onReturnHome={vi.fn()}
          onOpenSelector={vi.fn()}
        />
      );

      expect(html).toContain("INSERTION SORT");
      expect(html).toContain("Deslocamentos");
      expect(html).toContain("Inserções");
      expect(html).toContain("SELETOR DE PRÁTICAS");
    });

    it("cenário entre sessões: conclui Advanced com Basic e Intermediate já salvas, diferenciando currículo acumulado (3/3) das tentativas da sessão (1/3) sem fabricar métricas", () => {
      // 1. Save v4 com Basic e Intermediate concluídas em sessões anteriores
      let save = createDefaultSaveData();
      save = recordExerciseCompletion(save, "bubble", BUBBLE_EXERCISE_SETS.BASIC, {
        score: 100,
        errors: 0,
        hintsUsed: 0,
        elapsedTimeMs: 15000,
      });
      save = recordExerciseCompletion(save, "bubble", BUBBLE_EXERCISE_SETS.INTERMEDIATE, {
        score: 90,
        errors: 1,
        hintsUsed: 0,
        elapsedTimeMs: 25000,
      });

      // 2. Aplicação recarregada: estado React de resultados da sessão é vazio ([])
      // Usuário seleciona e conclui Advanced (Fase 3):
      const advancedSessionResult = {
        phase: 3,
        level: "advanced" as const,
        practiceTitle: "PRÁTICA AVANÇADA",
        comparisons: 15,
        swaps: 6,
        errors: 0,
        hintsUsed: 1,
        score: 95,
        elapsedTimeMs: 30000,
        finalArray: [1, 2, 3, 4, 5, 6],
      };

      // Grava a conclusão no save v4
      save = recordExerciseCompletion(save, "bubble", BUBBLE_EXERCISE_SETS.ADVANCED, {
        score: advancedSessionResult.score,
        errors: advancedSessionResult.errors,
        hintsUsed: advancedSessionResult.hintsUsed,
        elapsedTimeMs: advancedSessionResult.elapsedTimeMs,
      });

      // Confirma que o progresso persistido atinge 3/3
      expect(save.modules.bubble?.exerciseSets[BUBBLE_EXERCISE_SETS.BASIC]?.completed).toBe(true);
      expect(save.modules.bubble?.exerciseSets[BUBBLE_EXERCISE_SETS.INTERMEDIATE]?.completed).toBe(true);
      expect(save.modules.bubble?.exerciseSets[BUBBLE_EXERCISE_SETS.ADVANCED]?.completed).toBe(true);

      // 3. Renderiza a tela de conclusão contendo apenas a prática da sessão ativa (1 elemento)
      const sessionResults = [advancedSessionResult];
      const html = renderToStaticMarkup(
        <PracticeSetCompleteScreen
          moduleId="bubble"
          saveData={save}
          practiceResults={sessionResults}
          onRepeatPractices={vi.fn()}
          onReturnHome={vi.fn()}
          onOpenSelector={vi.fn()}
          isChallengeUnlocked={true}
        />
      );

      // A conclusão do conjunto não depende de 3 resultados presentes na sessão
      expect(html).toContain("CONJUNTO DE PRÁTICAS");
      expect(html).toContain("CONCLUÍDO!");

      // Diferenciação entre currículo acumulado (3/3) e práticas da sessão ativa (1/3)
      expect(html).toContain("MÓDULO EDUCACIONAL • BUBBLE SORT • CURRÍCULO 3/3 CONCLUÍDO");
      expect(html).toContain("Práticas (Sessão)");
      expect(html).toContain("1 / 3");
      expect(html).toContain("Módulo: 3/3 Salvo");
      expect(html).toContain("Soma consolidada da(s) 1 prática(s) concluída(s) nesta sessão");
      expect(html).toContain("progresso curricular acumulado (3/3 no módulo) está preservado sem necessidade de repetir práticas anteriores");

      // Não fabrica métricas de Basic ou Intermediate e não substitui por bestRecord
      expect(html).toContain("PRÁTICA AVANÇADA");
      expect(html).not.toContain("PRÁTICA BÁSICA");
      expect(html).not.toContain("PRÁTICA INTERMEDIÁRIA");
      // As métricas agregadas refletem estritamente a sessão (15 comp, 6 swaps, score 95)
      expect(html).toContain("15"); // comparações
      expect(html).toContain("6"); // trocas
      expect(html).toContain("95"); // score
    });
  });
});
