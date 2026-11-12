import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import GameScreen from "./GameScreen";
import SelectionGameScreen from "./SelectionGameScreen";
import InsertionGameScreen from "./InsertionGameScreen";
import PracticeSelector from "./PracticeSelector";
import { createDefaultSaveData } from "../game/persistence";

describe("Scaffolding Fading and Support Differentiation across Central Modules (LEARNING-R2-B)", () => {
  describe("Bubble Sort (GameScreen)", () => {
    it("renderiza Suporte Completo na Prática Básica com expressão relacional e sem spoiler de V/F", () => {
      const html = renderToStaticMarkup(
        <GameScreen
          onComplete={vi.fn()}
          phase={1}
          totalPhases={3}
          initialArray={[5, 2, 4, 1]}
          practiceTitle="PRÁTICA BÁSICA"
          supportProfile="full"
        />
      );

      // Badge de suporte
      expect(html).toContain("SUPORTE COMPLETO");
      // Condição relacional exibida como pergunta orientadora
      expect(html).toContain("Condição:");
      expect(html).toContain("A[0]");
      expect(html).toContain("A[1]");
      // Não exibe spoiler antecipado de resposta (VERDADEIRO / FALSO)
      expect(html).not.toContain("VERDADEIRO");
      expect(html).not.toContain("FALSO");
      // Mantém ponteiros e par sob inspeção factuais
      expect(html).toContain("Par sob Inspeção:");
      expect(html).toContain("#1 (5) e #2 (2)");
      // Botão de dica presente
      expect(html).toContain("DICA");
    });

    it("renderiza Suporte Reduzido na Prática Intermediária sem fórmula relacional direta", () => {
      const html = renderToStaticMarkup(
        <GameScreen
          onComplete={vi.fn()}
          phase={2}
          totalPhases={3}
          initialArray={[4, 2, 5, 1, 3]}
          practiceTitle="PRÁTICA INTERMEDIÁRIA"
          supportProfile="reduced"
        />
      );

      expect(html).toContain("SUPORTE REDUZIDO");
      // Sem fórmula relacional explícita
      expect(html).not.toContain("Condição:");
      // Prompt instrutivo reduzido
      expect(html).toContain("Avalie se os vizinhos estão fora de ordem");
      // Par sob inspeção continua rigorosamente visível (dado factual)
      expect(html).toContain("Par sob Inspeção:");
      expect(html).toContain("DICA");
    });

    it("renderiza Autonomia Máxima na Prática Avançada sem ocultar estado algorítmico essencial", () => {
      const html = renderToStaticMarkup(
        <GameScreen
          onComplete={vi.fn()}
          phase={3}
          totalPhases={3}
          initialArray={[6, 3, 5, 2, 4, 1]}
          practiceTitle="PRÁTICA AVANÇADA"
          supportProfile="minimal"
        />
      );

      expect(html).toContain("AUTONOMIA MÁXIMA");
      expect(html).not.toContain("Condição:");
      expect(html).toContain("Avalie o par sob inspeção");
      // Pointers e métricas continuam íntegros
      expect(html).toContain("Par sob Inspeção:");
      expect(html).toContain("COMPARAÇÕES:");
      expect(html).toContain("TROCAS:");
      expect(html).toContain("ERROS:");
      expect(html).toContain("DICA");
    });
  });

  describe("Selection Sort (SelectionGameScreen)", () => {
    it("renderiza Suporte Completo na Prática Básica com expressão de comparação", () => {
      const html = renderToStaticMarkup(
        <SelectionGameScreen
          onComplete={vi.fn()}
          phase={1}
          totalPhases={3}
          initialArray={[4, 1, 3, 2]}
          practiceTitle="PRÁTICA BÁSICA"
          supportProfile="full"
        />
      );

      expect(html).toContain("SUPORTE COMPLETO");
      expect(html).toContain("Comparação:");
      expect(html).toContain("Alvo (i):");
      expect(html).toContain("Candidato Mín:");
      expect(html).toContain("Scanner (j):");
      expect(html).toContain("💡 PRECISA DE UMA DICA?");
    });

    it("renderiza Suporte Reduzido na Prática Intermediária sem fórmula relacional direta", () => {
      const html = renderToStaticMarkup(
        <SelectionGameScreen
          onComplete={vi.fn()}
          phase={2}
          totalPhases={3}
          initialArray={[5, 2, 4, 1, 3]}
          practiceTitle="PRÁTICA INTERMEDIÁRIA"
          supportProfile="reduced"
        />
      );

      expect(html).toContain("SUPORTE REDUZIDO");
      expect(html).not.toContain("Comparação:");
      expect(html).toContain("Inspecione se o scanner é menor que o candidato");
      // Dados factuais preservados
      expect(html).toContain("Alvo (i):");
      expect(html).toContain("Candidato Mín:");
      expect(html).toContain("Scanner (j):");
    });

    it("renderiza Autonomia Máxima na Prática Avançada preservando ponteiros e botoeiras", () => {
      const html = renderToStaticMarkup(
        <SelectionGameScreen
          onComplete={vi.fn()}
          phase={3}
          totalPhases={3}
          initialArray={[6, 3, 5, 2, 4, 1]}
          practiceTitle="PRÁTICA AVANÇADA"
          supportProfile="minimal"
        />
      );

      expect(html).toContain("AUTONOMIA MÁXIMA");
      expect(html).not.toContain("Comparação:");
      expect(html).toContain("Avalie o scanner vs candidato");
      // Factual pointers must never be removed
      expect(html).toContain("Alvo (i):");
      expect(html).toContain("Candidato Mín:");
      expect(html).toContain("Scanner (j):");
      expect(html).toContain("NOVO MÍNIMO");
      expect(html).toContain("MANTER CANDIDATO");
    });
  });

  describe("Insertion Sort (InsertionGameScreen)", () => {
    it("renderiza Suporte Completo no nível Básico com fórmula relacional A[j] > CHAVE", () => {
      const html = renderToStaticMarkup(
        <InsertionGameScreen
          level="basic"
          initialArray={[3, 1, 4, 2]}
          supportProfile="full"
          onComplete={vi.fn()}
        />
      );

      expect(html).toContain("SUPORTE COMPLETO");
      expect(html).toContain("A[0]");
      expect(html).toContain("CHAVE");
      // Papéis canônicos sempre presentes
      expect(html).toContain("CHAVE (Trilho)");
      expect(html).toContain("VAGA (Aberta)");
      expect(html).toContain("ORD (Partição)");
      expect(html).toContain("PRECISA DE UMA DICA?");
    });

    it("renderiza Suporte Reduzido no nível Intermediário com prompt interpretativo", () => {
      const html = renderToStaticMarkup(
        <InsertionGameScreen
          level="intermediate"
          initialArray={[4, 2, 5, 1, 3]}
          supportProfile="reduced"
          onComplete={vi.fn()}
        />
      );

      expect(html).toContain("SUPORTE REDUZIDO");
      expect(html).not.toContain("&gt; CHAVE");
      expect(html).toContain("Inspecione A[0]");
      // Trilho aéreo e vaga permanecem factualmente modelados
      expect(html).toContain("TRILHO AÉREO DE SUSPENSÃO");
      expect(html).toContain("FRONTEIRA ORD:");
      expect(html).toContain("PRECISA DE UMA DICA?");
    });

    it("renderiza Autonomia Máxima no nível Avançado preservando semântica e acessibilidade", () => {
      const html = renderToStaticMarkup(
        <InsertionGameScreen
          level="advanced"
          initialArray={[6, 3, 5, 2, 4, 1]}
          supportProfile="minimal"
          onComplete={vi.fn()}
        />
      );

      expect(html).toContain("AUTONOMIA MÁXIMA");
      expect(html).not.toContain("&gt; CHAVE");
      expect(html).toContain("Avalie o elemento sob inspeção em relação à chave");
      // Elementos de acessibilidade preservados
      expect(html).toContain('aria-label="Área Operacional do Trilho e Vetor"');
      expect(html).toContain("DESLOCAR NÚMERO");
      expect(html).toContain("ENCAIXAR CHAVE");
      expect(html).toContain("PRECISA DE UMA DICA?");
    });
  });

  describe("PracticeSelector badges and descriptions", () => {
    it("exibe badges e descrições do suporte nos 3 módulos centrais", () => {
      const save = createDefaultSaveData();

      const bubbleHtml = renderToStaticMarkup(
        <PracticeSelector
          moduleId="bubble"
          saveData={save}
          onSelectPractice={vi.fn()}
          onOpenTutorial={vi.fn()}
          onReturnHome={vi.fn()}
        />
      );
      expect(bubbleHtml).toContain("SUPORTE COMPLETO");
      expect(bubbleHtml).toContain("SUPORTE REDUZIDO");
      expect(bubbleHtml).toContain("AUTONOMIA MÁXIMA");

      const selectionHtml = renderToStaticMarkup(
        <PracticeSelector
          moduleId="selection"
          saveData={save}
          onSelectPractice={vi.fn()}
          onOpenTutorial={vi.fn()}
          onReturnHome={vi.fn()}
        />
      );
      expect(selectionHtml).toContain("SUPORTE COMPLETO");
      expect(selectionHtml).toContain("SUPORTE REDUZIDO");
      expect(selectionHtml).toContain("AUTONOMIA MÁXIMA");

      const insertionHtml = renderToStaticMarkup(
        <PracticeSelector
          moduleId="insertion"
          saveData={save}
          onSelectPractice={vi.fn()}
          onOpenTutorial={vi.fn()}
          onReturnHome={vi.fn()}
        />
      );
      expect(insertionHtml).toContain("SUPORTE COMPLETO");
      expect(insertionHtml).toContain("SUPORTE REDUZIDO");
      expect(insertionHtml).toContain("AUTONOMIA MÁXIMA");
    });
  });
});
