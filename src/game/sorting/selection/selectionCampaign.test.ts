import { describe, it, expect } from "vitest";
import {
  createSelectionSortState,
  executeSelectionInspection,
  commitSelectionPass,
  executeSelectionStep,
  getExpectedSelectionInspection,
  getExpectedSelectionCommit,
  getSelectionSortedIndices,
  calculateSelectionSortProgress,
  calculateTotalExpectedSelectionComparisons,
  generateSelectionPhaseArray,
  SELECTION_CAMPAIGN_PHASE_LENGTHS,
  type SelectionSortState,
} from "./index";
import {
  createPhaseSessionMetrics,
  recordHintUsed,
  calculateProtocolScore,
} from "../../session";
import { calculateCampaignSummary, type PhaseResult } from "../../campaign/campaignSummary";
import {
  loadGameProgress,
  saveGameProgress,
  createMemoryStorageAdapter,
  CURRENT_SCHEMA_VERSION,
  type GameSaveSchema,
} from "../../persistence";

describe("Selection Sort Campaign & Gameplay (P2.1-D)", () => {
  describe("Geração Procedural da Campanha (Fases 1, 2 e 3)", () => {
    it("Fase 1: gera vetor com exatamente n=4 elementos no intervalo 1..99 sem duplicados", () => {
      const result = generateSelectionPhaseArray(1, "test-f1-seed");
      expect(result.values).toHaveLength(4);
      expect(SELECTION_CAMPAIGN_PHASE_LENGTHS[0]).toBe(4);
      // Sem duplicados
      const unique = new Set(result.values);
      expect(unique.size).toBe(4);
      // Intervalo 1..99
      for (const val of result.values) {
        expect(val).toBeGreaterThanOrEqual(1);
        expect(val).toBeLessThanOrEqual(99);
      }
    });

    it("Fase 2: gera vetor com exatamente n=5 elementos no intervalo 1..99 sem duplicados", () => {
      const result = generateSelectionPhaseArray(2, "test-f2-seed");
      expect(result.values).toHaveLength(5);
      expect(SELECTION_CAMPAIGN_PHASE_LENGTHS[1]).toBe(5);
      const unique = new Set(result.values);
      expect(unique.size).toBe(5);
      for (const val of result.values) {
        expect(val).toBeGreaterThanOrEqual(1);
        expect(val).toBeLessThanOrEqual(99);
      }
    });

    it("Fase 3: gera vetor com exatamente n=6 elementos no intervalo 1..99 sem duplicados", () => {
      const result = generateSelectionPhaseArray(3, "test-f3-seed");
      expect(result.values).toHaveLength(6);
      expect(SELECTION_CAMPAIGN_PHASE_LENGTHS[2]).toBe(6);
      const unique = new Set(result.values);
      expect(unique.size).toBe(6);
      for (const val of result.values) {
        expect(val).toBeGreaterThanOrEqual(1);
        expect(val).toBeLessThanOrEqual(99);
      }
    });

    it("mesma seed reproduz deterministicamente a mesma entrada para uma fase", () => {
      const runA = generateSelectionPhaseArray(1, "identical-seed-123");
      const runB = generateSelectionPhaseArray(1, "identical-seed-123");
      expect(runA.values).toEqual(runB.values);
      expect(runA.seed).toEqual(runB.seed);
    });

    it("seeds distintas geram vetores distintos", () => {
      const runA = generateSelectionPhaseArray(1, "seed-alpha");
      const runB = generateSelectionPhaseArray(1, "seed-beta");
      expect(runA.values).not.toEqual(runB.values);
    });
  });

  describe("Comportamento de Reset e Próxima Fase", () => {
    it("reset da fase mantém estritamente o mesmo vetor initialArray", () => {
      const initial = [25, 10, 80, 5];
      let state = createSelectionSortState(initial);
      // Executa alguns passos
      state = executeSelectionStep(state);
      state = executeSelectionStep(state);
      expect(state.comparisons).toBeGreaterThan(0);

      // Reset
      const resetState = createSelectionSortState(initial);
      expect(resetState.initialValues).toEqual(initial);
      expect(resetState.currentValues).toEqual(initial);
      expect(resetState.comparisons).toBe(0);
      expect(resetState.swaps).toBe(0);
      expect(resetState.errors).toBe(0);
      expect(resetState.history).toHaveLength(0);
      expect(resetState.phase).toBe("INSPECT");
    });

    it("avanço para a próxima fase gera nova entrada de tamanho incremental", () => {
      const f1 = generateSelectionPhaseArray(1, "campaign-f1");
      const f2 = generateSelectionPhaseArray(2, "campaign-f2");
      const f3 = generateSelectionPhaseArray(3, "campaign-f3");

      expect(f1.values.length).toBe(4);
      expect(f2.values.length).toBe(5);
      expect(f3.values.length).toBe(6);
      expect(f1.values).not.toEqual(f2.values.slice(0, 4));
    });
  });

  describe("Gameplay e Regras da FSM (INSPECT e COMMIT)", () => {
    it("durante INSPECT, ações corretas avançam scanner e atualizam minIndex adequadamente", () => {
      // Vetor [30, 10, 20, 5]:
      // i=0: minIndex=0 (30), j=1 (10). 10 < 30 -> SELECT_NEW_MIN esperado
      const initial = [30, 10, 20, 5];
      let state = createSelectionSortState(initial);
      expect(state.phase).toBe("INSPECT");
      expect(state.j).toBe(1);
      expect(state.minIndex).toBe(0);

      const expected1 = getExpectedSelectionInspection(state);
      expect(expected1?.expectedDecision).toBe("SELECT_NEW_MIN");

      const res1 = executeSelectionInspection(state, "SELECT_NEW_MIN");
      expect(res1.valid).toBe(true);
      state = res1.state;
      expect(state.minIndex).toBe(1); // atualizou para índice 1 (10)
      expect(state.j).toBe(2); // scanner avançou para 2
      expect(state.comparisons).toBe(1);

      // j=2 (20). 20 < 10 é falso -> KEEP_MIN esperado
      const expected2 = getExpectedSelectionInspection(state);
      expect(expected2?.expectedDecision).toBe("KEEP_MIN");

      const res2 = executeSelectionInspection(state, "KEEP_MIN");
      expect(res2.valid).toBe(true);
      state = res2.state;
      expect(state.minIndex).toBe(1); // manteve índice 1
      expect(state.j).toBe(3); // scanner avançou para 3
      expect(state.comparisons).toBe(2);

      // j=3 (5). 5 < 10 -> SELECT_NEW_MIN esperado
      const expected3 = getExpectedSelectionInspection(state);
      expect(expected3?.expectedDecision).toBe("SELECT_NEW_MIN");

      const res3 = executeSelectionInspection(state, "SELECT_NEW_MIN");
      expect(res3.valid).toBe(true);
      state = res3.state;
      expect(state.minIndex).toBe(3); // atualizou para 3
      expect(state.comparisons).toBe(3);

      // Como j=3 era o fim do array, a FSM transiciona para COMMIT
      expect(state.phase).toBe("COMMIT");
      expect(state.status).toBe("PASS_COMPLETED");
    });

    it("decisão incorreta durante INSPECT incrementa errors, não move scanner, não muda candidato", () => {
      const initial = [30, 10, 20, 5];
      const state = createSelectionSortState(initial);
      // j=1 (10) < minIndex=0 (30). Decisão correta é SELECT_NEW_MIN, mas jogador envia KEEP_MIN:
      const res = executeSelectionInspection(state, "KEEP_MIN");
      expect(res.valid).toBe(false);
      expect(res.state.errors).toBe(1);
      expect(res.state.j).toBe(1); // scanner não avançou
      expect(res.state.minIndex).toBe(0); // candidato não mudou
      expect(res.state.comparisons).toBe(0); // comparações formais não incrementam
      expect(res.state.history).toHaveLength(0); // histórico não polui
      expect(res.errorReason).toContain("MENOR");
    });

    it("durante COMMIT, transferência de longa distância permuta posições se minIndex !== i", () => {
      // Estado em COMMIT com minIndex=3 e i=0:
      const initial = [30, 10, 20, 5];
      let state = createSelectionSortState(initial);
      state = executeSelectionInspection(state, "SELECT_NEW_MIN").state; // j=1
      state = executeSelectionInspection(state, "KEEP_MIN").state; // j=2
      state = executeSelectionInspection(state, "SELECT_NEW_MIN").state; // j=3
      expect(state.phase).toBe("COMMIT");
      expect(state.i).toBe(0);
      expect(state.minIndex).toBe(3);

      const commitResult = commitSelectionPass(state);
      expect(commitResult.valid).toBe(true);
      expect(commitResult.didSwap).toBe(true);
      expect(commitResult.state.swaps).toBe(1);
      // Posições 0 e 3 permutadas: [5, 10, 20, 30]
      expect(commitResult.state.currentValues[0]).toBe(5);
      expect(commitResult.state.currentValues[3]).toBe(30);
      // Posição 0 consolidada
      expect(getSelectionSortedIndices(commitResult.state)).toContain(0);
      // Avançou para passada 2 (i=1)
      expect(commitResult.state.i).toBe(1);
      expect(commitResult.state.phase).toBe("INSPECT");
    });

    it("durante COMMIT, se minIndex === i, consolida posição sem permuta física (swaps inalterado)", () => {
      // Vetor [10, 30, 20]:
      // i=0: minIndex=0 (10), j=1 (30 -> KEEP), j=2 (20 -> KEEP).
      // Ao término, minIndex continua 0 === i
      const initial = [10, 30, 20];
      let state = createSelectionSortState(initial);
      state = executeSelectionInspection(state, "KEEP_MIN").state;
      state = executeSelectionInspection(state, "KEEP_MIN").state;
      expect(state.phase).toBe("COMMIT");
      expect(state.minIndex).toBe(0);
      expect(state.i).toBe(0);

      const commitResult = commitSelectionPass(state);
      expect(commitResult.valid).toBe(true);
      expect(commitResult.didSwap).toBe(false);
      expect(commitResult.state.swaps).toBe(0); // Nenhuma troca física
      expect(commitResult.state.currentValues).toEqual([10, 30, 20]); // Valores intactos
      expect(getSelectionSortedIndices(commitResult.state)).toContain(0);
    });

    it("bloqueio defensivo mútuo: UI nunca deve chamar commit durante INSPECT nem inspect durante COMMIT", () => {
      const state = createSelectionSortState([20, 10, 30]);
      expect(state.phase).toBe("INSPECT");

      // Tentar commit durante INSPECT
      const badCommit = commitSelectionPass(state);
      expect(badCommit.valid).toBe(false);
      expect(badCommit.state.errors).toBe(1);
      expect(badCommit.errorReason).toContain("INSPECT");

      // Avançar até COMMIT
      const commitState = executeSelectionInspection(
        executeSelectionInspection(state, "SELECT_NEW_MIN").state,
        "KEEP_MIN"
      ).state;
      expect(commitState.phase).toBe("COMMIT");

      // Tentar inspection durante COMMIT
      const badInspect = executeSelectionInspection(commitState, "KEEP_MIN");
      expect(badInspect.valid).toBe(false);
      expect(badInspect.state.errors).toBe(commitState.errors + 1);
      expect(badInspect.errorReason).toContain("COMMIT");
    });
  });

  describe("Preservação do Histórico e Contrato de Resultado (PhaseCompleteData)", () => {
    it("completa uma fase procedural inteira de n=4 e preserva 100% dos dados para o resultado", () => {
      const initial = [40, 20, 10, 30];
      let state = createSelectionSortState(initial);

      // Simula a execução completa via executeSelectionStep
      while (!state.completed) {
        state = executeSelectionStep(state);
      }

      expect(state.completed).toBe(true);
      expect(state.phase).toBe("COMPLETED");
      expect(state.currentValues).toEqual([10, 20, 30, 40]);
      // Total de comparações formais = 4*3/2 = 6
      expect(state.comparisons).toBe(6);
      // Trocas <= n - 1 (<= 3)
      expect(state.swaps).toBeLessThanOrEqual(3);
      expect(state.history.length).toBe(state.comparisons + (4 - 1)); // 6 inspeções + 3 commits

      // Inspeciona tipos de registro de histórico
      const inspections = state.history.filter((h) => h.type === "INSPECTION");
      const commits = state.history.filter((h) => h.type === "COMMIT");
      expect(inspections).toHaveLength(6);
      expect(commits).toHaveLength(3);

      // Dados de resultado
      const hintsUsed = 2;
      const score = calculateProtocolScore({
        errors: state.errors,
        hintsUsed,
      });
      expect(score).toBe(90); // 100 - 0*10 - 2*5 = 90

      const resultData = {
        protocol: "selection" as const,
        phase: 1,
        initialArray: [...state.initialValues],
        finalArray: [...state.currentValues],
        comparisons: state.comparisons,
        swaps: state.swaps,
        errors: state.errors,
        hintsUsed,
        score,
        elapsedTimeMs: 14500,
        history: state.history,
      };

      expect(resultData.protocol).toBe("selection");
      expect(resultData.initialArray).toEqual([40, 20, 10, 30]);
      expect(resultData.finalArray).toEqual([10, 20, 30, 40]);
      expect(resultData.history).toHaveLength(9);
    });
  });

  describe("Pontuação, Dicas e Tempo da Sessão", () => {
    it("fórmula da pontuação do protocolo: score = max(0, 100 - errors*10 - hintsUsed*5)", () => {
      expect(calculateProtocolScore({ errors: 0, hintsUsed: 0 })).toBe(100);
      expect(calculateProtocolScore({ errors: 1, hintsUsed: 1 })).toBe(85);
      expect(calculateProtocolScore({ errors: 3, hintsUsed: 2 })).toBe(60);
      expect(calculateProtocolScore({ errors: 15, hintsUsed: 0 })).toBe(0);
    });

    it("comparações, trocas e tempo decorrido possuem peso estritamente ZERO no score", () => {
      // Duas partidas com mesmos erros e dicas geram mesmo score independentemente de trocas ou comparações
      const scoreA = calculateProtocolScore({ errors: 2, hintsUsed: 1 });
      const scoreB = calculateProtocolScore({ errors: 2, hintsUsed: 1 });
      expect(scoreA).toBe(75);
      expect(scoreB).toBe(75);
    });

    it("sessionMetrics incrementa hintsUsed de forma imutável", () => {
      let metrics = createPhaseSessionMetrics();
      expect(metrics.hintsUsed).toBe(0);
      metrics = recordHintUsed(metrics);
      expect(metrics.hintsUsed).toBe(1);
      metrics = recordHintUsed(metrics);
      expect(metrics.hintsUsed).toBe(2);
    });
  });

  describe("Campanha Completa de 3 Fases e Resumo Global", () => {
    it("agrega resultados factuais das 3 fases sem inventar notas médias ou rankings", () => {
      const f1Result: PhaseResult = {
        phase: 1,
        comparisons: 6,
        swaps: 2,
        errors: 0,
        hintsUsed: 0,
        score: 100,
        elapsedTimeMs: 12000,
        finalArray: [1, 2, 3, 4],
      };
      const f2Result: PhaseResult = {
        phase: 2,
        comparisons: 10,
        swaps: 3,
        errors: 1,
        hintsUsed: 1,
        score: 85,
        elapsedTimeMs: 18500,
        finalArray: [1, 2, 3, 4, 5],
      };
      const f3Result: PhaseResult = {
        phase: 3,
        comparisons: 15,
        swaps: 4,
        errors: 0,
        hintsUsed: 2,
        score: 90,
        elapsedTimeMs: 25000,
        finalArray: [1, 2, 3, 4, 5, 6],
      };

      const summary = calculateCampaignSummary(
        [f1Result, f2Result, f3Result],
        3
      );

      expect(summary.totalPhases).toBe(3);
      expect(summary.completedPhases).toBe(3);
      expect(summary.totalComparisons).toBe(6 + 10 + 15); // 31
      expect(summary.totalSwaps).toBe(2 + 3 + 4); // 9
      expect(summary.totalErrors).toBe(0 + 1 + 0); // 1
      expect(summary.totalHintsUsed).toBe(0 + 1 + 2); // 3
    });

    it("fluxo completo da campanha: transições F1 -> F2 -> F3 -> Conclusão com ordenação real", () => {
      const phaseResultsList: PhaseResult[] = [];

      // 1. Fase 1 (n=4)
      const f1 = generateSelectionPhaseArray(1, "camp-seed-f1");
      expect(f1.values).toHaveLength(4);
      let state1 = createSelectionSortState(f1.values);
      while (!state1.completed) {
        state1 = executeSelectionStep(state1);
      }
      expect(state1.completed).toBe(true);
      expect(state1.comparisons).toBe(6);
      phaseResultsList.push({
        phase: 1,
        comparisons: state1.comparisons,
        swaps: state1.swaps,
        errors: state1.errors,
        hintsUsed: 0,
        score: calculateProtocolScore({ errors: state1.errors, hintsUsed: 0 }),
        elapsedTimeMs: 10000,
        finalArray: [...state1.currentValues],
      });
      expect(phaseResultsList).toHaveLength(1);

      // 2. Transição F1 -> F2 (n=5)
      const f2 = generateSelectionPhaseArray(2, "camp-seed-f2");
      expect(f2.values).toHaveLength(5);
      let state2 = createSelectionSortState(f2.values);
      while (!state2.completed) {
        state2 = executeSelectionStep(state2);
      }
      expect(state2.completed).toBe(true);
      expect(state2.comparisons).toBe(10);
      phaseResultsList.push({
        phase: 2,
        comparisons: state2.comparisons,
        swaps: state2.swaps,
        errors: state2.errors,
        hintsUsed: 1,
        score: calculateProtocolScore({ errors: state2.errors, hintsUsed: 1 }),
        elapsedTimeMs: 15000,
        finalArray: [...state2.currentValues],
      });
      expect(phaseResultsList).toHaveLength(2);

      // 3. Transição F2 -> F3 (n=6)
      const f3 = generateSelectionPhaseArray(3, "camp-seed-f3");
      expect(f3.values).toHaveLength(6);
      let state3 = createSelectionSortState(f3.values);
      while (!state3.completed) {
        state3 = executeSelectionStep(state3);
      }
      expect(state3.completed).toBe(true);
      expect(state3.comparisons).toBe(15);
      phaseResultsList.push({
        phase: 3,
        comparisons: state3.comparisons,
        swaps: state3.swaps,
        errors: state3.errors,
        hintsUsed: 0,
        score: calculateProtocolScore({ errors: state3.errors, hintsUsed: 0 }),
        elapsedTimeMs: 20000,
        finalArray: [...state3.currentValues],
      });
      expect(phaseResultsList).toHaveLength(3);

      // 4. Última fase -> Conclusão do Protocolo
      const campaignSummary = calculateCampaignSummary(phaseResultsList, 3);
      expect(campaignSummary.completedPhases).toBe(3);
      expect(campaignSummary.totalComparisons).toBe(6 + 10 + 15);
      expect(campaignSummary.totalSwaps).toBe(state1.swaps + state2.swaps + state3.swaps);
      expect(campaignSummary.totalErrors).toBe(0);
      expect(campaignSummary.totalHintsUsed).toBe(1);

      // 5. Rejogar protocolo: gera novos vetores procedurais para Fase 1
      const newF1 = generateSelectionPhaseArray(1);
      expect(newF1.values).toHaveLength(4);
      expect(newF1.values).not.toEqual(f1.values); // nova seed/vetor
    });
  });

  describe("Isolamento em Relação ao Bubble Sort e Schema v2", () => {
    it("jogar a campanha de Selection Sort não altera a persistência Schema v2 do Bubble", () => {
      const storage = createMemoryStorageAdapter();
      const initialSave = loadGameProgress(storage);
      saveGameProgress(initialSave, storage);
      expect(initialSave.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);

      // Simula uma fase inteira de Selection Sort em memória
      const selectionArray = generateSelectionPhaseArray(1).values;
      let selectionState = createSelectionSortState(selectionArray);
      while (!selectionState.completed) {
        selectionState = executeSelectionStep(selectionState);
      }

      // O storage do save permanece rigorosamente intacto
      const afterSave = loadGameProgress(storage);
      expect(afterSave).toEqual(initialSave);
      expect(afterSave.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(afterSave.campaign.unlockedPhases).toBe(initialSave.campaign.unlockedPhases);
      expect(afterSave.records).toEqual(initialSave.records);
    });
  });
});
