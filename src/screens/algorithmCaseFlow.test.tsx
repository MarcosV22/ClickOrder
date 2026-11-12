/**
 * Testes de Integração e Apresentação do Fluxo de "Casos do Algoritmo" (Marco LEARNING-R3-A).
 *
 * Cobertura:
 * 1. Renderização da seção "EXPLORAR CASOS" no PracticeSelector para os 3 módulos centrais.
 * 2. Regra de desbloqueio determinística: bloqueado por padrão, desbloqueia com <moduleId>.practice.basic.
 * 3. Exibição do preview do vetor fixo (zero PRNG) e do objetivo de aprendizagem.
 * 4. Transição para estado CONCLUÍDO com melhor recorde a partir do Schema v4.
 * 5. Apresentação da ResultScreen em contexto de Caso (badge, título, objetivo, reflexão factual e CTAs contextualizados).
 * 6. Ausência de CTAs de avanço sequencial ("PRÓXIMA PRÁTICA" / "CONCLUIR CONJUNTO") no modo Caso.
 * 7. Preservação do vetor fixo determinístico no Replay e no Repeat.
 */

import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import PracticeSelector from "./PracticeSelector";
import ResultScreen from "./ResultScreen";
import {
  BUBBLE_CASE_NEARLY_SORTED,
  SELECTION_CASE_ALREADY_SORTED,
  INSERTION_CASE_NEARLY_SORTED,
  getCaseDefinition,
} from "../game/curriculum/caseCatalog";
import {
  createDefaultSaveData,
  recordExerciseCompletion,
  BUBBLE_EXERCISE_SETS,
  SELECTION_EXERCISE_SETS,
  INSERTION_EXERCISE_SETS,
  BUBBLE_CASES,
  SELECTION_CASES,
  INSERTION_CASES,
} from "../game/persistence";

describe("Algorithm Case Flow Integration (LEARNING-R3-A)", () => {
  describe("PracticeSelector — Seção EXPLORAR CASOS", () => {
    it("renderiza a seção de casos com estado BLOQUEADO quando a prática básica não está concluída", () => {
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

      expect(html).toContain("EXPLORAR CASOS");
      expect(html).toContain("QUASE ORDENADO");
      expect(html).toContain("[10, 30, 20, 40, 50]");
      expect(html).toContain("BLOQUEADO");
      expect(html).toContain("Disponível após concluir a Prática Básica deste módulo.");
    });

    it("desbloqueia o caso-piloto do Bubble Sort quando a Prática Básica for concluída", () => {
      let save = createDefaultSaveData();
      save = recordExerciseCompletion(save, "bubble", BUBBLE_EXERCISE_SETS.BASIC, {
        score: 100,
        errors: 0,
        hintsUsed: 0,
        elapsedTimeMs: 15000,
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

      expect(html).toContain("EXPLORAR CASOS");
      expect(html).toContain("DISPONÍVEL");
      expect(html).toContain("EXPLORAR CASO");
      expect(html).not.toContain("Disponível após concluir a Prática Básica deste módulo.");
    });

    it("desbloqueia o caso-piloto do Selection Sort (JÁ ORDENADO) quando a Básica for concluída", () => {
      let save = createDefaultSaveData();
      save = recordExerciseCompletion(save, "selection", SELECTION_EXERCISE_SETS.BASIC, {
        score: 100,
        errors: 0,
        hintsUsed: 0,
        elapsedTimeMs: 18000,
      });

      const html = renderToStaticMarkup(
        <PracticeSelector
          moduleId="selection"
          saveData={save}
          onSelectPractice={vi.fn()}
          onOpenTutorial={vi.fn()}
          onReturnHome={vi.fn()}
        />
      );

      expect(html).toContain("EXPLORAR CASOS");
      expect(html).toContain("JÁ ORDENADO");
      expect(html).toContain("[10, 20, 30, 40, 50]");
      expect(html).toContain("DISPONÍVEL");
      expect(html).toContain("EXPLORAR CASO");
    });

    it("desbloqueia o caso-piloto do Insertion Sort (QUASE ORDENADO) quando a Básica for concluída", () => {
      let save = createDefaultSaveData();
      save = recordExerciseCompletion(save, "insertion", INSERTION_EXERCISE_SETS.BASIC, {
        score: 100,
        errors: 0,
        hintsUsed: 0,
        elapsedTimeMs: 20000,
      });

      const html = renderToStaticMarkup(
        <PracticeSelector
          moduleId="insertion"
          saveData={save}
          onSelectPractice={vi.fn()}
          onOpenTutorial={vi.fn()}
          onReturnHome={vi.fn()}
        />
      );

      expect(html).toContain("EXPLORAR CASOS");
      expect(html).toContain("QUASE ORDENADO");
      expect(html).toContain("[10, 20, 40, 30, 50]");
      expect(html).toContain("DISPONÍVEL");
      expect(html).toContain("EXPLORAR CASO");
    });

    it("exibe estado CONCLUÍDO e melhor recorde no card do caso quando completado no Schema v4", () => {
      let save = createDefaultSaveData();
      save = recordExerciseCompletion(save, "bubble", BUBBLE_EXERCISE_SETS.BASIC);
      save = recordExerciseCompletion(save, "bubble", BUBBLE_CASES.NEARLY_SORTED, {
        score: 90,
        errors: 1,
        hintsUsed: 0,
        elapsedTimeMs: 14500,
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

      expect(html).toContain("✓ CONCLUÍDO");
      expect(html).toContain("90 PTS");
      expect(html).toContain("1 err • 0 dic");
      expect(html).toContain("REPETIR CASO");
    });
  });

  describe("ResultScreen — Apresentação em Contexto de Caso do Algoritmo", () => {
    it("renderiza cabeçalho, objetivo e reflexão factual no caso Bubble Sort Quase Ordenado", () => {
      const caseDef = BUBBLE_CASE_NEARLY_SORTED;
      const reflection = caseDef.buildReflection({ comparisons: 10, swaps: 1 });

      const onRepeat = vi.fn();
      const onOpenSelector = vi.fn();
      const onViewReplay = vi.fn();

      const html = renderToStaticMarkup(
        <ResultScreen
          finalArray={[10, 20, 30, 40, 50]}
          comparisons={10}
          swaps={1}
          errors={0}
          hintsUsed={0}
          score={100}
          elapsedTimeMs={12000}
          protocol="bubble"
          caseDefinition={caseDef}
          caseReflection={reflection}
          activityContext={{
            type: "case",
            moduleId: "bubble",
            caseId: caseDef.id,
            caseDefinition: caseDef,
          }}
          onNext={vi.fn()}
          onRepeat={onRepeat}
          onOpenSelector={onOpenSelector}
          onViewReplay={onViewReplay}
        />
      );

      // Badge e Título específicos de Caso
      expect(html).toContain("MÓDULO BUBBLE — CASO DO ALGORITMO");
      expect(html).toContain("BUBBLE SORT — QUASE ORDENADO");
      expect(html).toContain("EXERCÍCIO");
      expect(html).toContain("CONCLUÍDO!");

      // Painel de Reflexão Pedagógica
      expect(html).toContain("REFLEXÃO PEDAGÓGICA DO CASO");
      expect(html).toContain("OBJETIVO DE APRENDIZAGEM:");
      expect(html).toContain(caseDef.learningObjective);
      expect(html).toContain("ANÁLISE FACTUAL DA EXECUÇÃO:");
      expect(html).toContain("precisava de apenas 1 troca"); // reflexão pura
      expect(html).toContain("10 comparações previstas");

      // Botões de ação contextuais
      expect(html).toContain("VER EXECUÇÃO");
      expect(html).toContain("REPETIR CASO");
      expect(html).toContain("VOLTAR AOS CASOS");

      // Ausência estrita de botões sequenciais de prática regular
      expect(html).not.toContain("PRÓXIMA PRÁTICA");
      expect(html).not.toContain("CONCLUIR CONJUNTO");
      expect(html).not.toContain("PRÓXIMO CENÁRIO");
      expect(html).not.toContain("CONCLUIR DESAFIOS");
    });

    it("renderiza cabeçalho, objetivo e reflexão factual no caso Selection Sort Já Ordenado", () => {
      const caseDef = SELECTION_CASE_ALREADY_SORTED;
      const reflection = caseDef.buildReflection({ comparisons: 10, swaps: 0 });

      const html = renderToStaticMarkup(
        <ResultScreen
          finalArray={[10, 20, 30, 40, 50]}
          comparisons={10}
          swaps={0}
          errors={0}
          hintsUsed={0}
          score={100}
          elapsedTimeMs={15000}
          protocol="selection"
          caseDefinition={caseDef}
          caseReflection={reflection}
          activityContext={{
            type: "case",
            moduleId: "selection",
            caseId: caseDef.id,
            caseDefinition: caseDef,
          }}
          onNext={vi.fn()}
          onRepeat={vi.fn()}
          onOpenSelector={vi.fn()}
          onViewReplay={vi.fn()}
        />
      );

      expect(html).toContain("MÓDULO SELECTION — CASO DO ALGORITMO");
      expect(html).toContain("SELECTION SORT — JÁ ORDENADO");
      expect(html).toContain("REFLEXÃO PEDAGÓGICA DO CASO");
      expect(html).toContain(caseDef.learningObjective);
      expect(html).toContain("totalizando 10 comparações e 0 trocas");
      expect(html).toContain("VOLTAR AOS CASOS");
      expect(html).not.toContain("PRÓXIMA PRÁTICA");
    });

    it("renderiza cabeçalho, objetivo e reflexão factual no caso Insertion Sort Quase Ordenado", () => {
      const caseDef = INSERTION_CASE_NEARLY_SORTED;
      const reflection = caseDef.buildReflection({
        comparisons: 5,
        shifts: 1,
        insertions: 4,
        swaps: 0,
      });

      const html = renderToStaticMarkup(
        <ResultScreen
          finalArray={[10, 20, 30, 40, 50]}
          comparisons={5}
          shifts={1}
          insertions={4}
          errors={0}
          hintsUsed={0}
          score={100}
          elapsedTimeMs={11000}
          protocol="insertion"
          caseDefinition={caseDef}
          caseReflection={reflection}
          activityContext={{
            type: "case",
            moduleId: "insertion",
            caseId: caseDef.id,
            caseDefinition: caseDef,
          }}
          onNext={vi.fn()}
          onRepeat={vi.fn()}
          onOpenSelector={vi.fn()}
          onViewReplay={vi.fn()}
        />
      );

      expect(html).toContain("MÓDULO INSERTION — CASO DO ALGORITMO");
      expect(html).toContain("INSERTION SORT — QUASE ORDENADO");
      expect(html).toContain("REFLEXÃO PEDAGÓGICA DO CASO");
      expect(html).toContain(caseDef.learningObjective);
      expect(html).toContain("apenas 1 deslocamento foi necessário em 5 comparações totais");
      expect(html).toContain("VOLTAR AOS CASOS");
      expect(html).not.toContain("PRÓXIMA PRÁTICA");
    });
  });

  describe("Isolamento e Determinismo do Modelo de Casos", () => {
    it("garante que os 3 casos piloto possuem arrays fixos imutáveis com tamanho 5", () => {
      expect(BUBBLE_CASE_NEARLY_SORTED.initialArray).toEqual([10, 30, 20, 40, 50]);
      expect(SELECTION_CASE_ALREADY_SORTED.initialArray).toEqual([10, 20, 30, 40, 50]);
      expect(INSERTION_CASE_NEARLY_SORTED.initialArray).toEqual([10, 20, 40, 30, 50]);

      expect(Object.isFrozen(BUBBLE_CASE_NEARLY_SORTED.initialArray)).toBe(true);
      expect(Object.isFrozen(SELECTION_CASE_ALREADY_SORTED.initialArray)).toBe(true);
      expect(Object.isFrozen(INSERTION_CASE_NEARLY_SORTED.initialArray)).toBe(true);
    });

    it("resgata definição de caso por ID canônico de forma determinística", () => {
      expect(getCaseDefinition(BUBBLE_CASES.NEARLY_SORTED)).toBe(BUBBLE_CASE_NEARLY_SORTED);
      expect(getCaseDefinition(SELECTION_CASES.ALREADY_SORTED)).toBe(SELECTION_CASE_ALREADY_SORTED);
      expect(getCaseDefinition(INSERTION_CASES.NEARLY_SORTED)).toBe(INSERTION_CASE_NEARLY_SORTED);
      expect(getCaseDefinition("unknown.case")).toBeUndefined();
    });
  });
});
