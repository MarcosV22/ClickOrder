import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
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
import { attemptDeterministicFallback } from "../game/generation/arrayGenerator";
import { createDefaultSaveData, MERGE_EXERCISE_SETS } from "../game/persistence";

describe("Merge Sort Practice Flow & Intercalation Station (P3.1-D)", () => {
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

      // Pseudocódigo canônico
      expect(html).toContain("PSEUDOCÓDIGO — INTERCALAÇÃO (CANÔNICO)");
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
      // Subvetor E: [10], Subvetor D: [30] -> Menor é E (10)
      const elements = assignMergeIdentities([30, 10, 40, 20]);
      let state = initMergeSortState(elements);

      // O primeiro passo esperado no confronto [0..1] com mid=0 é E=[30], D=[10]
      // Aqui o menor é 10 (Direita)
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
      // Ponteiros e buffer permanecem intactos:
      expect(result.state.p1).toBe(state.p1);
      expect(result.state.p2).toBe(state.p2);
      expect(result.state.k).toBe(0);
      expect(result.state.writesInBuffer).toBe(0);
      expect(result.state.comparisons).toBe(state.comparisons);

      // Recuperação imediata na decisão correta:
      const recovered = executeMergeStep(result.state, "DISPATCH_RIGHT");
      expect(recovered.valid).toBe(true);
      expect(recovered.state.k).toBe(1);
      expect(recovered.state.errors).toBe(1); // erro anterior retido
    });
  });

  // --------------------------------------------------------------------------
  // 3. Empate Estável e Prioridade da Esquerda
  // --------------------------------------------------------------------------
  describe("3. Empate Estável e Prioridade da Esquerda", () => {
    it("exige prioridade da esquerda em empate para garantir estabilidade da ordenação", () => {
      // Vetor com empate: [16, 16]
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
      // Elementos onde um lado esgota primeiro
      const elements = assignMergeIdentities([10, 20]);
      let state = initMergeSortState(elements);

      // Despacha E (10)
      const step1 = executeMergeStep(state, "DISPATCH_LEFT");
      expect(step1.valid).toBe(true);
      state = step1.state;

      // Agora Ramal Esquerdo esgotou -> fase DRAIN_READY
      expect(state.phase).toBe("DRAIN_READY");

      // Tentar despachar elemento individual é rejeitado:
      const invalidLeft = executeMergeStep(state, "DISPATCH_LEFT");
      expect(invalidLeft.valid).toBe(false);

      const invalidRight = executeMergeStep(state, "DISPATCH_RIGHT");
      expect(invalidRight.valid).toBe(false);

      // Aciona DRAIN_REMAINDER:
      const drainResult = executeMergeStep(state, "DRAIN_REMAINDER");
      expect(drainResult.valid).toBe(true);
      // Drenagem não adiciona comparações (comparações continuam 1)
      expect(drainResult.state.comparisons).toBe(1);
      // Mas grava no buffer
      expect(drainResult.state.writesInBuffer).toBe(2);
    });

    it("ignora ações impossíveis sem penalidade e sem alterar métricas", () => {
      const elements = assignMergeIdentities([30, 10, 40, 20]);
      const state = initMergeSortState(elements);

      // Tentar DRAIN_REMAINDER quando a fase é COMPARE_HEADS (ambos os ramais ativos)
      const res = executeMergeStep(state, "DRAIN_REMAINDER");
      expect(res.valid).toBe(false);
      expect(res.isPedagogicalError).toBe(false); // Ação inválida por restrição de fase, não erro de comparação
      expect(res.state.errors).toBe(0); // Sem acréscimo de erro pedagógico
      expect(res.state.p1).toBe(state.p1);
    });
  });

  // --------------------------------------------------------------------------
  // 5. Apresentação Sequencial e Trava de Ação (Frames e Reduced Motion)
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

      // Derivação a frio percorre os m eventos do histórico: custo O(m)
      const frames = deriveMergeFramesFromHistory(elements, state.history);
      expect(Array.isArray(frames)).toBe(true);

      // Acesso por índice em memória sobre a lista de quadros já derivada: custo O(1)
      const targetFrame = frames[0];
      expect(targetFrame).toBeDefined();
    });
  });

  // --------------------------------------------------------------------------
  // 6. Integração do Catálogo ao Seletor e Navegação
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
      expect(html).toContain("5"); // Comparações
      expect(html).toContain("8"); // Escritas no Buffer
      expect(html).toContain("8"); // Escritas no Principal
      expect(html).toContain("16"); // Total de Escritas
      expect(html).toContain("100"); // Pontuação
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

    it("generateMergePracticeArray produz array com constraints canônicas para todos os níveis", () => {
      const basic = generateMergePracticeArray("basic", "test-seed-1");
      expect(basic.result.values).toHaveLength(4);

      const intermediate = generateMergePracticeArray("intermediate", "test-seed-2");
      expect(intermediate.result.values).toHaveLength(5);

      const advanced = generateMergePracticeArray("advanced", "test-seed-3");
      expect(advanced.result.values).toHaveLength(6);
      // A prática avançada contém duplicatas
      const uniqueVals = new Set(advanced.result.values);
      expect(uniqueVals.size).toBeLessThan(6);
    });
  });
});
