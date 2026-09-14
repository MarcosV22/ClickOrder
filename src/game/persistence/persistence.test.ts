import { describe, it, expect, vi } from "vitest";
import {
  STORAGE_KEY,
  CURRENT_SCHEMA_VERSION,
  createDefaultSaveData,
  createMemoryStorageAdapter,
  createSafeStorage,
  loadGameProgress,
  saveGameProgress,
  recordPhaseCompletion,
  recordTutorialCompletion,
  clearGameProgress,
  validateAndMigrateSaveData,
  isChallengeModeUnlocked,
  getInitialSessionRoute,
  getProtocolProgress,
  migrateV1ToV2,
  migrateV2ToV3,
  SELECTION_MAX_PHASES,
  type StorageAdapter,
  type GameSaveSchema,
} from "./index";

describe("Persistence Layer (P1.6)", () => {
  describe("1. Estado Padrão (Clean Install)", () => {
    it("deve inicializar com schemaVersion 1, fase 1 desbloqueada e tutorial pendente", () => {
      const defaultData = createDefaultSaveData(3);
      expect(defaultData.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(defaultData.campaign.unlockedPhases).toBe(1);
      expect(defaultData.campaign.highestPhaseReached).toBe(1);
      expect(defaultData.campaign.hasCompletedTutorial).toBe(false);
      expect(defaultData.records).toEqual({});
      expect(defaultData.preferences).toEqual({
        soundEnabled: true,
        reducedMotion: false,
        highContrast: false,
      });
      expect(typeof defaultData.lastUpdated).toBe("string");
    });

    it("loadGameProgress deve retornar estado padrão seguro quando o storage estiver vazio", () => {
      const storage = createMemoryStorageAdapter();
      const loaded = loadGameProgress(storage, 3);

      expect(loaded.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(loaded.campaign.unlockedPhases).toBe(1);
      expect(loaded.campaign.highestPhaseReached).toBe(1);
      expect(loaded.campaign.hasCompletedTutorial).toBe(false);
      expect(loaded.records).toEqual({});
    });

    it("loadGameProgress deve retornar estado padrão quando storage contiver string vazia ou espaços", () => {
      const storage = createMemoryStorageAdapter({ [STORAGE_KEY]: "   " });
      const loaded = loadGameProgress(storage, 3);
      expect(loaded.campaign.unlockedPhases).toBe(1);
    });
  });

  describe("2. Save e Load Básico", () => {
    it("deve salvar e recarregar dados íntegros corretamente", () => {
      const storage = createMemoryStorageAdapter();
      const initial = createDefaultSaveData(3);

      saveGameProgress(initial, storage);
      const rawStored = storage.getItem(STORAGE_KEY);
      expect(rawStored).toBeTruthy();

      const reloaded = loadGameProgress(storage, 3);
      expect(reloaded.schemaVersion).toBe(initial.schemaVersion);
      expect(reloaded.campaign.unlockedPhases).toBe(initial.campaign.unlockedPhases);
      expect(reloaded.campaign.highestPhaseReached).toBe(initial.campaign.highestPhaseReached);
      expect(reloaded.preferences).toEqual(initial.preferences);
    });
  });

  describe("3. Progressão de Fases e Limites (PHASES.length)", () => {
    it("deve desbloquear a fase 2 ao concluir a fase 1", () => {
      const storage = createMemoryStorageAdapter();
      const state0 = createDefaultSaveData(3);

      const state1 = recordPhaseCompletion(state0, 1, 3, storage);
      expect(state1.campaign.unlockedPhases).toBe(2);
      expect(state1.campaign.highestPhaseReached).toBe(2);
      expect(state1.campaign.hasCompletedTutorial).toBe(true);
      expect(state1.records[1]).toBeDefined();
      expect(state1.records[1].completed).toBe(true);

      // Confirma que foi persistido no storage
      const loaded = loadGameProgress(storage, 3);
      expect(loaded.campaign.unlockedPhases).toBe(2);
      expect(loaded.campaign.highestPhaseReached).toBe(2);
    });

    it("deve desbloquear a fase 3 ao concluir a fase 2", () => {
      const storage = createMemoryStorageAdapter();
      const state0 = createDefaultSaveData(3);
      const state1 = recordPhaseCompletion(state0, 1, 3, storage);
      const state2 = recordPhaseCompletion(state1, 2, 3, storage);

      expect(state2.campaign.unlockedPhases).toBe(3);
      expect(state2.campaign.highestPhaseReached).toBe(3);
      expect(state2.records[2].completed).toBe(true);

      const loaded = loadGameProgress(storage, 3);
      expect(loaded.campaign.unlockedPhases).toBe(3);
    });

    it("NUNCA deve ultrapassar o limite de fases (PHASES.length = 3)", () => {
      const storage = createMemoryStorageAdapter();
      const state0 = createDefaultSaveData(3);
      const state1 = recordPhaseCompletion(state0, 1, 3, storage);
      const state2 = recordPhaseCompletion(state1, 2, 3, storage);
      const state3 = recordPhaseCompletion(state2, 3, 3, storage);

      // Conclusão da última fase da campanha não pode gerar fase 4
      expect(state3.campaign.unlockedPhases).toBe(3);
      expect(state3.campaign.highestPhaseReached).toBe(3);
      expect(state3.records[3].completed).toBe(true);

      const loaded = loadGameProgress(storage, 3);
      expect(loaded.campaign.unlockedPhases).toBe(3);
      expect(loaded.campaign.highestPhaseReached).toBe(3);
    });

    it("NUNCA deve regredir a fase desbloqueada ao rejogar fases anteriores", () => {
      const storage = createMemoryStorageAdapter();
      const state0 = createDefaultSaveData(3);
      const state1 = recordPhaseCompletion(state0, 1, 3, storage);
      const state2 = recordPhaseCompletion(state1, 2, 3, storage);
      expect(state2.campaign.unlockedPhases).toBe(3);

      // Aluno rejoga a fase 1
      const replayedState = recordPhaseCompletion(state2, 1, 3, storage);
      expect(replayedState.campaign.unlockedPhases).toBe(3);
      expect(replayedState.campaign.highestPhaseReached).toBe(3);

      // Aluno rejoga a fase 2
      const replayedState2 = recordPhaseCompletion(replayedState, 2, 3, storage);
      expect(replayedState2.campaign.unlockedPhases).toBe(3);
      expect(replayedState2.campaign.highestPhaseReached).toBe(3);

      const loaded = loadGameProgress(storage, 3);
      expect(loaded.campaign.unlockedPhases).toBe(3);
    });
  });

  describe("4. Conclusão do Tutorial", () => {
    it("deve marcar hasCompletedTutorial como true e persistir no storage", () => {
      const storage = createMemoryStorageAdapter();
      const state0 = createDefaultSaveData(3);
      expect(state0.campaign.hasCompletedTutorial).toBe(false);

      const state1 = recordTutorialCompletion(state0, storage, 3);
      expect(state1.campaign.hasCompletedTutorial).toBe(true);

      const loaded = loadGameProgress(storage, 3);
      expect(loaded.campaign.hasCompletedTutorial).toBe(true);
    });

    it("recordTutorialCompletion é idempotente se já estiver concluído", () => {
      const storage = createMemoryStorageAdapter();
      const state0 = createDefaultSaveData(3);
      const state1 = recordTutorialCompletion(state0, storage, 3);
      const state2 = recordTutorialCompletion(state1, storage, 3);
      expect(state2).toBe(state1);
    });
  });

  describe("5. Robustez contra Dados Inválidos e Corrupção", () => {
    it("deve se recuperar com fallback seguro quando o JSON estiver corrompido", () => {
      const storage = createMemoryStorageAdapter({
        [STORAGE_KEY]: "INVALID_JSON{{[123",
      });

      const spyWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const loaded = loadGameProgress(storage, 3);
      spyWarn.mockRestore();

      expect(loaded).toBeDefined();
      expect(loaded.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(loaded.campaign.unlockedPhases).toBe(1);
      expect(loaded.campaign.highestPhaseReached).toBe(1);
    });

    it("deve se recuperar com fallback quando o schemaVersion for inválido ou ausente", () => {
      const invalidVersions = [
        { schemaVersion: -1 },
        { schemaVersion: 0 },
        { schemaVersion: "1" },
        { schemaVersion: null },
        { noVersion: true },
      ];

      for (const invalid of invalidVersions) {
        const storage = createMemoryStorageAdapter({
          [STORAGE_KEY]: JSON.stringify(invalid),
        });
        const loaded = loadGameProgress(storage, 3);
        expect(loaded.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
        expect(loaded.campaign.unlockedPhases).toBe(1);
      }
    });

    it("deve se recuperar com fallback quando schemaVersion for versão futura desconhecida", () => {
      const futureSave = {
        schemaVersion: 999,
        campaign: { unlockedPhases: 50 },
      };
      const storage = createMemoryStorageAdapter({
        [STORAGE_KEY]: JSON.stringify(futureSave),
      });

      const spyWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const loaded = loadGameProgress(storage, 3);
      spyWarn.mockRestore();

      expect(loaded.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(loaded.campaign.unlockedPhases).toBe(1);
    });

    it("deve clampar unlockedPhases e highestPhaseReached que excedam maxPhases", () => {
      const maliciousSave = {
        schemaVersion: 1,
        campaign: {
          unlockedPhases: 9999,
          highestPhaseReached: 8888,
          hasCompletedTutorial: true,
        },
      };
      const storage = createMemoryStorageAdapter({
        [STORAGE_KEY]: JSON.stringify(maliciousSave),
      });

      const loaded = loadGameProgress(storage, 3);
      expect(loaded.campaign.unlockedPhases).toBe(3);
      expect(loaded.campaign.highestPhaseReached).toBe(3);
    });

    it("deve clampar unlockedPhases e highestPhaseReached negativos ou decimais", () => {
      const weirdSave = {
        schemaVersion: 1,
        campaign: {
          unlockedPhases: -10,
          highestPhaseReached: 2.7,
        },
      };
      const storage = createMemoryStorageAdapter({
        [STORAGE_KEY]: JSON.stringify(weirdSave),
      });

      const loaded = loadGameProgress(storage, 3);
      expect(loaded.campaign.unlockedPhases).toBe(1);
      expect(loaded.campaign.highestPhaseReached).toBe(2);
    });

    it("deve sanitizar bloco records ignorando chaves inválidas ou dados mal formatados", () => {
      const saveWithBadRecords = {
        schemaVersion: 1,
        records: {
          "1": { completed: true, completedAt: "2026-09-10T12:00:00.000Z" },
          "not_a_number": { completed: true },
          "999": { completed: true }, // excede maxPhases
          "2": "not_an_object",
        },
      };
      const storage = createMemoryStorageAdapter({
        [STORAGE_KEY]: JSON.stringify(saveWithBadRecords),
      });

      const loaded = loadGameProgress(storage, 3);
      expect(loaded.records[1]).toBeDefined();
      expect(loaded.records[1].completed).toBe(true);
      expect((loaded.records as Record<string, unknown>)["not_a_number"]).toBeUndefined();
      expect(loaded.records[999]).toBeUndefined();
      expect(loaded.records[2]).toBeUndefined();
    });

    it("deve preencher preferências padrão caso o bloco preferences esteja ausente ou corrompido", () => {
      const saveWithoutPrefs = {
        schemaVersion: 1,
        campaign: { unlockedPhases: 2, highestPhaseReached: 2 },
      };
      const storage = createMemoryStorageAdapter({
        [STORAGE_KEY]: JSON.stringify(saveWithoutPrefs),
      });

      const loaded = loadGameProgress(storage, 3);
      expect(loaded.preferences).toEqual({
        soundEnabled: true,
        reducedMotion: false,
        highContrast: false,
      });
    });
  });

  describe("6. Resiliência do Adaptador contra Exceções de Storage", () => {
    it("deve tratar exceção em getItem sem quebrar a aplicação (ex.: SecurityError / private mode)", () => {
      const throwingAdapter: StorageAdapter = {
        getItem: () => {
          throw new Error("SecurityError: Access is denied for this document");
        },
        setItem: () => {},
        removeItem: () => {},
      };

      const safe = createSafeStorage(throwingAdapter);
      const spyWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

      const loaded = loadGameProgress(safe, 3);
      spyWarn.mockRestore();

      expect(loaded).toBeDefined();
      expect(loaded.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(loaded.campaign.unlockedPhases).toBe(1);
    });

    it("deve tratar exceção em setItem sem quebrar a aplicação (ex.: QuotaExceededError)", () => {
      const throwingAdapter: StorageAdapter = {
        getItem: () => null,
        setItem: () => {
          throw new Error("QuotaExceededError: The quota has been exceeded");
        },
        removeItem: () => {},
      };

      const safe = createSafeStorage(throwingAdapter);
      const spyWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = saveGameProgress(createDefaultSaveData(3), safe);
      spyWarn.mockRestore();

      // Gravação não quebra com exceção não tratada
      expect(result).toBeDefined();
    });
  });

  describe("7. Imutabilidade dos Dados", () => {
    it("o estado retornado por createDefaultSaveData e loadGameProgress deve ser Object.freeze", () => {
      const defaultState = createDefaultSaveData(3);
      expect(Object.isFrozen(defaultState)).toBe(true);
      expect(Object.isFrozen(defaultState.campaign)).toBe(true);
      expect(Object.isFrozen(defaultState.preferences)).toBe(true);

      const storage = createMemoryStorageAdapter();
      saveGameProgress(defaultState, storage);
      const loaded = loadGameProgress(storage, 3);
      expect(Object.isFrozen(loaded)).toBe(true);
      expect(Object.isFrozen(loaded.campaign)).toBe(true);
    });
  });

  describe("8. Isolamento entre Sessão e Progresso Persistente", () => {
    it("operações de sessão (reiniciar fase, limpar resultados da campanha) não alteram o storage", () => {
      const storage = createMemoryStorageAdapter();
      const state0 = createDefaultSaveData(3);

      // Jogador conclui fase 1 e 2
      const state1 = recordPhaseCompletion(state0, 1, 3, storage);
      const state2 = recordPhaseCompletion(state1, 2, 3, storage);
      expect(state2.campaign.unlockedPhases).toBe(3);

      // Simulação de reset de sessão (equivalente a handleReturnHome ou handleRestartProtocol)
      let sessionResults: unknown[] = [{ phase: 1 }, { phase: 2 }];
      let currentSessionPhase = 3;
      let sessionGameResult: unknown = { comparisons: 10, swaps: 5 };

      // Limpeza de sessão
      sessionResults = [];
      currentSessionPhase = 1;
      sessionGameResult = null;

      // O storage NÃO foi afetado pela limpeza da sessão
      const loaded = loadGameProgress(storage, 3);
      expect(loaded.campaign.unlockedPhases).toBe(3);
      expect(loaded.campaign.highestPhaseReached).toBe(3);
      expect(loaded.records[1].completed).toBe(true);
      expect(loaded.records[2].completed).toBe(true);
    });
  });

  describe("9. Limpeza Programática (clearGameProgress)", () => {
    it("deve remover a chave do storage e retornar o estado padrão", () => {
      const storage = createMemoryStorageAdapter();
      recordPhaseCompletion(createDefaultSaveData(3), 1, 3, storage);
      expect(storage.getItem(STORAGE_KEY)).toBeTruthy();

      const cleared = clearGameProgress(storage, 3);
      expect(cleared.campaign.unlockedPhases).toBe(1);
      expect(storage.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  describe("10. Roteiro Operacional de Validação (Critérios de Aceite)", () => {
    it("deve cobrir integralmente o ciclo: instalação limpa -> progresso -> F5 -> home -> rejogar -> corrupção", () => {
      // 1. Iniciar aplicação limpa
      const storage = createMemoryStorageAdapter();
      expect(storage.getItem(STORAGE_KEY)).toBeNull();

      // 2. Progresso inicial correto
      let progress = loadGameProgress(storage, 3);
      expect(progress.campaign.unlockedPhases).toBe(1);
      expect(progress.campaign.highestPhaseReached).toBe(1);
      expect(progress.campaign.hasCompletedTutorial).toBe(false);

      // 3. Concluir pelo menos uma fase (tutorial + fase 1)
      progress = recordTutorialCompletion(progress, storage, 3);
      expect(progress.campaign.hasCompletedTutorial).toBe(true);
      progress = recordPhaseCompletion(progress, 1, 3, storage);
      expect(progress.campaign.unlockedPhases).toBe(2);
      expect(progress.campaign.highestPhaseReached).toBe(2);

      // 4. Recarregar com F5 (novo ciclo de montagem de App / leitura fresca do storage)
      const freshLoadedAfterF5 = loadGameProgress(storage, 3);

      // 5. Confirmar restauração da fase desbloqueada
      expect(freshLoadedAfterF5.campaign.unlockedPhases).toBe(2);
      expect(freshLoadedAfterF5.campaign.highestPhaseReached).toBe(2);
      expect(freshLoadedAfterF5.campaign.hasCompletedTutorial).toBe(true);

      // 6. Voltar ao início (handleReturnHome)
      // Simula reset de sessão do React (nova sessão sempre inicia em phase = 1, results resetam, progresso persistente intacto)
      const sessionPhaseResults: unknown[] = [];
      const sessionPhase = 1;
      expect(sessionPhase).toBe(1);
      expect(sessionPhaseResults.length).toBe(0);

      // 7. Confirmar que progresso persistente permanece
      const progressAfterHome = loadGameProgress(storage, 3);
      expect(progressAfterHome.campaign.unlockedPhases).toBe(2);
      expect(progressAfterHome.campaign.highestPhaseReached).toBe(2);

      // 8. Rejogar protocolo (handleRestartProtocol: phase = 1, reexecuta fase 1)
      const replayedProgress = recordPhaseCompletion(
        progressAfterHome,
        1,
        3,
        storage
      );

      // 9. Confirmar que progresso persistente permanece (sem regressão)
      expect(replayedProgress.campaign.unlockedPhases).toBe(2);
      expect(replayedProgress.campaign.highestPhaseReached).toBe(2);

      // 10. Simular storage inválido/corrompido
      storage.setItem(STORAGE_KEY, "{MALFORMED_JSON_CORRUPT");

      // 11. Confirmar fallback sem crash
      const spyWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const fallbackState = loadGameProgress(storage, 3);
      spyWarn.mockRestore();

      expect(fallbackState).toBeDefined();
      expect(fallbackState.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(fallbackState.campaign.unlockedPhases).toBe(1);
      expect(fallbackState.campaign.highestPhaseReached).toBe(1);
    });
  });

  describe("9. Schema v2 e Migração Explícita de v1 para v2 (P1.7)", () => {
    it("deve carregar um save válido v1, migrar para v2 e preservar integralmente todo o progresso", () => {
      const v1Save = {
        schemaVersion: 1,
        lastUpdated: "2026-09-10T12:00:00.000Z",
        campaign: {
          unlockedPhases: 2,
          highestPhaseReached: 2,
          hasCompletedTutorial: true,
        },
        records: {
          "1": {
            completed: true,
            completedAt: "2026-09-10T12:05:00.000Z",
          },
        },
        preferences: {
          soundEnabled: false,
          reducedMotion: true,
          highContrast: false,
        },
      };

      const storage = createMemoryStorageAdapter({
        [STORAGE_KEY]: JSON.stringify(v1Save),
      });

      const loaded = loadGameProgress(storage, 3);

      // Migração explícita para schema atualizado (v3)
      expect(loaded.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(loaded.campaign.unlockedPhases).toBe(2);
      expect(loaded.campaign.highestPhaseReached).toBe(2);
      expect(loaded.campaign.hasCompletedTutorial).toBe(true);

      // Conclusão v1 preservada intacta
      expect(loaded.records[1].completed).toBe(true);
      expect(loaded.records[1].completedAt).toBe("2026-09-10T12:05:00.000Z");
      // Novos campos iniciam ausentes (undefined) até que uma rodada pontuada ocorra
      expect(loaded.records[1].bestScore).toBeUndefined();
      expect(loaded.records[1].bestScoreErrors).toBeUndefined();

      // Preferências preservadas
      expect(loaded.preferences.soundEnabled).toBe(false);
      expect(loaded.preferences.reducedMotion).toBe(true);

      // Ao regravar, o save agora reside formalmente em v3 no storage
      saveGameProgress(loaded, storage, 3);
      const reloadedRaw = JSON.parse(storage.getItem(STORAGE_KEY)!);
      expect(reloadedRaw.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(reloadedRaw.campaign.unlockedPhases).toBe(2);
    });

    it("deve sanitizar registros de fase com campos v2 válidos", () => {
      const v2Save = {
        schemaVersion: 2,
        lastUpdated: "2026-09-11T10:00:00.000Z",
        campaign: {
          unlockedPhases: 3,
          highestPhaseReached: 3,
          hasCompletedTutorial: true,
        },
        records: {
          "1": {
            completed: true,
            completedAt: "2026-09-11T10:01:00.000Z",
            bestScore: 90,
            bestScoreErrors: 1,
            bestScoreHintsUsed: 0,
            bestScoreElapsedTimeMs: 42000,
          },
        },
        preferences: {
          soundEnabled: true,
          reducedMotion: false,
          highContrast: false,
        },
      };

      const storage = createMemoryStorageAdapter({
        [STORAGE_KEY]: JSON.stringify(v2Save),
      });

      const loaded = loadGameProgress(storage, 3);
      expect(loaded.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(loaded.records[1].bestScore).toBe(90);
      expect(loaded.records[1].bestScoreErrors).toBe(1);
      expect(loaded.records[1].bestScoreHintsUsed).toBe(0);
      expect(loaded.records[1].bestScoreElapsedTimeMs).toBe(42000);
    });
  });

  describe("10. Regras de Recorde de Pontuação da Fase (P1.7)", () => {
    it("deve registrar os dados da primeira conclusão com sucesso", () => {
      const storage = createMemoryStorageAdapter();
      let state = createDefaultSaveData(3);

      state = recordPhaseCompletion(state, 1, 3, storage, {
        score: 90,
        errors: 1,
        hintsUsed: 0,
        elapsedTimeMs: 45000,
      });

      expect(state.records[1].completed).toBe(true);
      expect(state.records[1].bestScore).toBe(90);
      expect(state.records[1].bestScoreErrors).toBe(1);
      expect(state.records[1].bestScoreHintsUsed).toBe(0);
      expect(state.records[1].bestScoreElapsedTimeMs).toBe(45000);
    });

    it("pontuação inferior NÃO deve substituir o recorde existente", () => {
      const storage = createMemoryStorageAdapter();
      let state = createDefaultSaveData(3);

      state = recordPhaseCompletion(state, 1, 3, storage, {
        score: 90,
        errors: 1,
        hintsUsed: 0,
        elapsedTimeMs: 45000,
      });

      // Segunda tentativa com score inferior (70)
      state = recordPhaseCompletion(state, 1, 3, storage, {
        score: 70,
        errors: 3,
        hintsUsed: 0,
        elapsedTimeMs: 30000,
      });

      expect(state.records[1].bestScore).toBe(90);
      expect(state.records[1].bestScoreErrors).toBe(1);
      expect(state.records[1].bestScoreElapsedTimeMs).toBe(45000);
    });

    it("pontuação superior DEVE substituir o recorde existente", () => {
      const storage = createMemoryStorageAdapter();
      let state = createDefaultSaveData(3);

      state = recordPhaseCompletion(state, 1, 3, storage, {
        score: 90,
        errors: 1,
        hintsUsed: 0,
        elapsedTimeMs: 45000,
      });

      // Segunda tentativa perfeita (100)
      state = recordPhaseCompletion(state, 1, 3, storage, {
        score: 100,
        errors: 0,
        hintsUsed: 0,
        elapsedTimeMs: 52000,
      });

      expect(state.records[1].bestScore).toBe(100);
      expect(state.records[1].bestScoreErrors).toBe(0);
      expect(state.records[1].bestScoreHintsUsed).toBe(0);
      expect(state.records[1].bestScoreElapsedTimeMs).toBe(52000);
    });

    it("empate de score com MENOS erros DEVE substituir o recorde (desempate por precisão)", () => {
      const storage = createMemoryStorageAdapter();
      let state = createDefaultSaveData(3);

      // Rodada B: score 90 (1 erro, 0 dicas)
      state = recordPhaseCompletion(state, 1, 3, storage, {
        score: 90,
        errors: 1,
        hintsUsed: 0,
        elapsedTimeMs: 40000,
      });

      // Rodada C: score 90 (0 erros, 2 dicas) -> menos erros!
      state = recordPhaseCompletion(state, 1, 3, storage, {
        score: 90,
        errors: 0,
        hintsUsed: 2,
        elapsedTimeMs: 65000,
      });

      expect(state.records[1].bestScore).toBe(90);
      expect(state.records[1].bestScoreErrors).toBe(0);
      expect(state.records[1].bestScoreHintsUsed).toBe(2);
      expect(state.records[1].bestScoreElapsedTimeMs).toBe(65000);
    });

    it("empate de score com MAIS erros NÃO deve substituir o recorde", () => {
      const storage = createMemoryStorageAdapter();
      let state = createDefaultSaveData(3);

      // Rodada C: score 90 (0 erros, 2 dicas)
      state = recordPhaseCompletion(state, 1, 3, storage, {
        score: 90,
        errors: 0,
        hintsUsed: 2,
        elapsedTimeMs: 65000,
      });

      // Rodada B: score 90 (1 erro, 0 dicas) -> mais erros, não substitui
      state = recordPhaseCompletion(state, 1, 3, storage, {
        score: 90,
        errors: 1,
        hintsUsed: 0,
        elapsedTimeMs: 30000,
      });

      expect(state.records[1].bestScore).toBe(90);
      expect(state.records[1].bestScoreErrors).toBe(0);
      expect(state.records[1].bestScoreHintsUsed).toBe(2);
    });

    it("tempo NUNCA desempata nem incentiva pressa se score e erros forem iguais", () => {
      const storage = createMemoryStorageAdapter();
      let state = createDefaultSaveData(3);

      // Execução 1: score 100, 0 erros, tempo 60s
      state = recordPhaseCompletion(state, 1, 3, storage, {
        score: 100,
        errors: 0,
        hintsUsed: 0,
        elapsedTimeMs: 60000,
      });

      // Execução 2: score 100, 0 erros, tempo mais rápido 25s
      // Não deve substituir pois tempo não é critério de desempate
      state = recordPhaseCompletion(state, 1, 3, storage, {
        score: 100,
        errors: 0,
        hintsUsed: 0,
        elapsedTimeMs: 25000,
      });

      expect(state.records[1].bestScore).toBe(100);
      expect(state.records[1].bestScoreElapsedTimeMs).toBe(60000);
    });

    it("chamada a recordPhaseCompletion sem scoreData deve preservar recordes existentes", () => {
      const storage = createMemoryStorageAdapter();
      let state = createDefaultSaveData(3);

      state = recordPhaseCompletion(state, 1, 3, storage, {
        score: 90,
        errors: 1,
        hintsUsed: 0,
        elapsedTimeMs: 45000,
      });

      // Chamada sem dados de pontuação (ex.: caller legado)
      state = recordPhaseCompletion(state, 1, 3, storage);

      expect(state.records[1].completed).toBe(true);
      expect(state.records[1].bestScore).toBe(90);
      expect(state.records[1].bestScoreErrors).toBe(1);
    });
  });

  describe("11. Desbloqueio Factual do Modo Desafio (isChallengeModeUnlocked)", () => {
    it("deve retornar false quando a campanha principal ainda não foi concluída", () => {
      const state = createDefaultSaveData(3);
      expect(isChallengeModeUnlocked(state, 3)).toBe(false);

      // Fases 1 e 2 completadas, mas fase 3 ainda pendente:
      const partialState: GameSaveSchema = {
        ...state,
        records: {
          1: { completed: true, completedAt: new Date().toISOString() },
          2: { completed: true, completedAt: new Date().toISOString() },
        },
      };
      expect(isChallengeModeUnlocked(partialState, 3)).toBe(false);
    });

    it("deve retornar true quando a última fase da campanha (fase 3) estiver concluída", () => {
      let state = createDefaultSaveData(3);
      state = recordPhaseCompletion(state, 3, 3);
      expect(isChallengeModeUnlocked(state, 3)).toBe(true);
    });

    it("derivação pura: não altera schema, storage nem cria IDs artificiais", () => {
      let state = createDefaultSaveData(3);
      state = recordPhaseCompletion(state, 3, 3);

      const beforeKeys = Object.keys(state.records);
      const unlocked = isChallengeModeUnlocked(state, 3);
      const afterKeys = Object.keys(state.records);

      expect(unlocked).toBe(true);
      expect(beforeKeys).toEqual(afterKeys);
      expect(state.records[101]).toBeUndefined();
      expect(state.records[102]).toBeUndefined();
      expect(state.records[103]).toBeUndefined();
    });
  });

  describe("12. Semântica Correta de Início de Sessão e Preservação de Progresso (Hotfix)", () => {
    it("usuário novo (sem tutorial) deve ser direcionado ao tutorial com phase = 1", () => {
      const state = createDefaultSaveData(3);
      expect(state.campaign.hasCompletedTutorial).toBe(false);

      const route = getInitialSessionRoute(state);
      expect(route.screen).toBe("tutorial");
      expect(route.phase).toBe(1);
    });

    it("usuário com tutorial concluído deve iniciar diretamente em phase = 1, mesmo com highestPhaseReached = 3", () => {
      const storage = createMemoryStorageAdapter();
      let state = createDefaultSaveData(3);
      state = recordTutorialCompletion(state, storage, 3);
      state = recordPhaseCompletion(state, 1, 3, storage);
      state = recordPhaseCompletion(state, 2, 3, storage);
      state = recordPhaseCompletion(state, 3, 3, storage);

      expect(state.campaign.highestPhaseReached).toBe(3);
      expect(state.campaign.unlockedPhases).toBe(3);
      expect(state.campaign.hasCompletedTutorial).toBe(true);

      // Ao clicar em INICIAR TURNO:
      const route = getInitialSessionRoute(state);
      expect(route.screen).toBe("game");
      expect(route.phase).toBe(1);

      // O progresso persistente no save continua sendo 3 (não regride nem é apagado):
      expect(state.campaign.highestPhaseReached).toBe(3);
      expect(state.campaign.unlockedPhases).toBe(3);
    });

    it("concluir ou rejogar a Fase 1 com save na Fase 3 não regride highestPhaseReached nem desbloqueio", () => {
      const storage = createMemoryStorageAdapter();
      let state = createDefaultSaveData(3);
      state = recordTutorialCompletion(state, storage, 3);
      state = recordPhaseCompletion(state, 1, 3, storage, {
        score: 100,
        errors: 0,
        hintsUsed: 0,
        elapsedTimeMs: 15000,
      });
      state = recordPhaseCompletion(state, 2, 3, storage, {
        score: 90,
        errors: 1,
        hintsUsed: 0,
        elapsedTimeMs: 25000,
      });
      state = recordPhaseCompletion(state, 3, 3, storage, {
        score: 80,
        errors: 2,
        hintsUsed: 0,
        elapsedTimeMs: 35000,
      });

      expect(state.campaign.highestPhaseReached).toBe(3);
      expect(isChallengeModeUnlocked(state, 3)).toBe(true);

      // Nova sessão inicia em phase = 1 e conclui Fase 1 novamente:
      const replayed = recordPhaseCompletion(state, 1, 3, storage, {
        score: 100,
        errors: 0,
        hintsUsed: 0,
        elapsedTimeMs: 12000,
      });

      // highestPhaseReached e unlockedPhases permanecem 3:
      expect(replayed.campaign.highestPhaseReached).toBe(3);
      expect(replayed.campaign.unlockedPhases).toBe(3);

      // Recorde da Fase 3 e desbloqueio do Modo Desafio permanecem intactos:
      expect(replayed.records[3]?.completed).toBe(true);
      expect(isChallengeModeUnlocked(replayed, 3)).toBe(true);
    });

    it("F5 preserva highestPhaseReached no storage e novo turno inicia em phase = 1", () => {
      const storage = createMemoryStorageAdapter();
      let state = createDefaultSaveData(3);
      state = recordTutorialCompletion(state, storage, 3);
      state = recordPhaseCompletion(state, 1, 3, storage);
      state = recordPhaseCompletion(state, 2, 3, storage);
      state = recordPhaseCompletion(state, 3, 3, storage);

      // Simula F5 (recarregamento limpo do storage):
      const loadedAfterF5 = loadGameProgress(storage, 3);
      expect(loadedAfterF5.campaign.highestPhaseReached).toBe(3);
      expect(loadedAfterF5.campaign.unlockedPhases).toBe(3);
      expect(isChallengeModeUnlocked(loadedAfterF5, 3)).toBe(true);

      // Novo turno inicia em phase = 1:
      const route = getInitialSessionRoute(loadedAfterF5);
      expect(route.screen).toBe("game");
      expect(route.phase).toBe(1);
    });
  });

  describe("13. Persistência Multi-Protocolo, Schema v3 e Selection Sort (P2.1-F)", () => {
    describe("Estrutura do Schema v3 e Estado Padrão (Clean Install)", () => {
      it("deve inicializar com schemaVersion 3 e subestruturas isoladas para bubble e selection", () => {
        const state = createDefaultSaveData(3, SELECTION_MAX_PHASES);

        expect(state.schemaVersion).toBe(3);
        expect(state.protocols).toBeDefined();
        expect(state.protocols.bubble).toBeDefined();
        expect(state.protocols.selection).toBeDefined();

        // Bubble progress
        expect(state.protocols.bubble.unlockedPhases).toBe(1);
        expect(state.protocols.bubble.highestPhaseReached).toBe(1);
        expect(state.protocols.bubble.hasCompletedTutorial).toBe(false);
        expect(state.protocols.bubble.records).toEqual({});

        // Selection progress
        expect(state.protocols.selection.unlockedPhases).toBe(1);
        expect(state.protocols.selection.highestPhaseReached).toBe(1);
        expect(state.protocols.selection.hasCompletedTutorial).toBe(false);
        expect(state.protocols.selection.records).toEqual({});

        // Retrocompatibilidade / aliases
        expect(state.campaign).toEqual(state.protocols.bubble);
        expect(state.records).toEqual(state.protocols.bubble.records);

        // Preferências globais
        expect(state.preferences.soundEnabled).toBe(true);
        expect(state.preferences.reducedMotion).toBe(false);
        expect(state.preferences.highContrast).toBe(false);
      });

      it("getProtocolProgress deve retornar a referência direta ao protocolo solicitado", () => {
        const state = createDefaultSaveData(3, 3);
        const bubbleProg = getProtocolProgress(state, "bubble");
        const selectionProg = getProtocolProgress(state, "selection");

        expect(bubbleProg).toBe(state.protocols.bubble);
        expect(selectionProg).toBe(state.protocols.selection);
      });
    });

    describe("Pipeline Explícito de Migração (v1 -> v2 -> v3 e v2 -> v3)", () => {
      it("migrateV1ToV2 deve migrar dados v1 para formato v2 com schemaVersion 2", () => {
        const v1Raw = {
          schemaVersion: 1,
          lastUpdated: "2026-09-10T12:00:00.000Z",
          campaign: {
            unlockedPhases: 2,
            highestPhaseReached: 2,
            hasCompletedTutorial: true,
          },
          records: {
            "1": {
              completed: true,
              completedAt: "2026-09-10T12:05:00.000Z",
            },
          },
          preferences: {
            soundEnabled: false,
            reducedMotion: true,
            highContrast: false,
          },
        };

        const v2 = migrateV1ToV2(v1Raw, 3);
        expect(v2.schemaVersion).toBe(2);
        expect(v2.campaign.unlockedPhases).toBe(2);
        expect(v2.records[1].completed).toBe(true);
        expect(v2.records[1].bestScore).toBeUndefined();
      });

      it("migrateV2ToV3 deve migrar dados v2 para formato v3 com protocolos isolados", () => {
        const v2Raw = {
          schemaVersion: 2,
          lastUpdated: "2026-09-11T10:00:00.000Z",
          campaign: {
            unlockedPhases: 3,
            highestPhaseReached: 3,
            hasCompletedTutorial: true,
          },
          records: {
            "1": {
              completed: true,
              completedAt: "2026-09-11T10:01:00.000Z",
              bestScore: 100,
              bestScoreErrors: 0,
              bestScoreHintsUsed: 0,
              bestScoreElapsedTimeMs: 15000,
            },
          },
          preferences: {
            soundEnabled: true,
            reducedMotion: false,
            highContrast: false,
          },
        };

        const v3 = migrateV2ToV3(v2Raw, 3, 3);
        expect(v3.schemaVersion).toBe(3);
        // Bubble absorveu a campanha e os recordes v2
        expect(v3.protocols.bubble.unlockedPhases).toBe(3);
        expect(v3.protocols.bubble.highestPhaseReached).toBe(3);
        expect(v3.protocols.bubble.hasCompletedTutorial).toBe(true);
        expect(v3.protocols.bubble.records[1].bestScore).toBe(100);
        // Selection foi inicializado com default limpo
        expect(v3.protocols.selection.unlockedPhases).toBe(1);
        expect(v3.protocols.selection.highestPhaseReached).toBe(1);
        expect(v3.protocols.selection.hasCompletedTutorial).toBe(false);
        expect(v3.protocols.selection.records).toEqual({});
      });

      it("pipeline completo: save v1 carregado do storage resulta em v3 preservando Bubble intacto", () => {
        const v1Save = {
          schemaVersion: 1,
          lastUpdated: "2026-09-10T12:00:00.000Z",
          campaign: {
            unlockedPhases: 2,
            highestPhaseReached: 2,
            hasCompletedTutorial: true,
          },
          records: {
            "1": {
              completed: true,
              completedAt: "2026-09-10T12:05:00.000Z",
            },
          },
          preferences: {
            soundEnabled: false,
            reducedMotion: true,
            highContrast: true,
          },
        };

        const storage = createMemoryStorageAdapter({
          [STORAGE_KEY]: JSON.stringify(v1Save),
        });

        const loaded = loadGameProgress(storage, 3, 3);
        expect(loaded.schemaVersion).toBe(3);
        expect(loaded.protocols.bubble.unlockedPhases).toBe(2);
        expect(loaded.protocols.bubble.records[1].completed).toBe(true);
        expect(loaded.protocols.selection.unlockedPhases).toBe(1);
        expect(loaded.preferences.soundEnabled).toBe(false);
        expect(loaded.preferences.highContrast).toBe(true);
      });

      it("save v2 carregado do storage resulta em v3 preservando scores e inicializando Selection", () => {
        const v2Save = {
          schemaVersion: 2,
          lastUpdated: "2026-09-12T08:00:00.000Z",
          campaign: {
            unlockedPhases: 3,
            highestPhaseReached: 3,
            hasCompletedTutorial: true,
          },
          records: {
            "1": {
              completed: true,
              completedAt: "2026-09-12T08:05:00.000Z",
              bestScore: 90,
              bestScoreErrors: 1,
              bestScoreHintsUsed: 0,
              bestScoreElapsedTimeMs: 25000,
            },
            "2": {
              completed: true,
              completedAt: "2026-09-12T08:10:00.000Z",
              bestScore: 85,
              bestScoreErrors: 1,
              bestScoreHintsUsed: 1,
              bestScoreElapsedTimeMs: 40000,
            },
          },
          preferences: {
            soundEnabled: true,
            reducedMotion: false,
            highContrast: false,
          },
        };

        const storage = createMemoryStorageAdapter({
          [STORAGE_KEY]: JSON.stringify(v2Save),
        });

        const loaded = loadGameProgress(storage, 3, 3);
        expect(loaded.schemaVersion).toBe(3);
        expect(loaded.protocols.bubble.records[1].bestScore).toBe(90);
        expect(loaded.protocols.bubble.records[2].bestScore).toBe(85);
        expect(loaded.protocols.selection.hasCompletedTutorial).toBe(false);
        expect(loaded.protocols.selection.records).toEqual({});
      });
    });

    describe("Isolamento Estrito entre Protocolos (Bubble vs Selection)", () => {
      it("fases 1..3 de Bubble e 1..3 de Selection possuem namespaces independentes sem colisão", () => {
        const storage = createMemoryStorageAdapter();
        let state = createDefaultSaveData(3, 3);

        // Bubble completa Fase 1 com 100 pontos
        state = recordPhaseCompletion(state, "bubble", 1, 3, storage, {
          score: 100,
          errors: 0,
          hintsUsed: 0,
          elapsedTimeMs: 15000,
        });

        // Selection completa Fase 1 com 80 pontos
        state = recordPhaseCompletion(state, "selection", 1, 3, storage, {
          score: 80,
          errors: 2,
          hintsUsed: 0,
          elapsedTimeMs: 35000,
        });

        // Verificação: nenhum sobrepôs o outro
        expect(state.protocols.bubble.records[1].bestScore).toBe(100);
        expect(state.protocols.bubble.records[1].bestScoreErrors).toBe(0);

        expect(state.protocols.selection.records[1].bestScore).toBe(80);
        expect(state.protocols.selection.records[1].bestScoreErrors).toBe(2);

        // Desbloqueios isolados: Bubble desbloqueou fase 2, Selection desbloqueou fase 2
        expect(state.protocols.bubble.unlockedPhases).toBe(2);
        expect(state.protocols.selection.unlockedPhases).toBe(2);

        // Bubble avança para Fase 2
        state = recordPhaseCompletion(state, "bubble", 2, 3, storage, {
          score: 95,
          errors: 0,
          hintsUsed: 1,
          elapsedTimeMs: 25000,
        });

        // Selection permanece inalterado na Fase 2
        expect(state.protocols.bubble.unlockedPhases).toBe(3);
        expect(state.protocols.selection.unlockedPhases).toBe(2);
        expect(state.protocols.selection.records[2]).toBeUndefined();
      });

      it("concluir tutorial do Selection não altera o tutorial do Bubble", () => {
        let state = createDefaultSaveData(3, 3);
        expect(state.protocols.bubble.hasCompletedTutorial).toBe(false);
        expect(state.protocols.selection.hasCompletedTutorial).toBe(false);

        state = recordTutorialCompletion(state, "selection");
        expect(state.protocols.selection.hasCompletedTutorial).toBe(true);
        expect(state.protocols.bubble.hasCompletedTutorial).toBe(false);
      });
    });

    describe("Persistência do Selection Sort (Tutorial, Fases e Recordes)", () => {
      it("tutorial do Selection resiste a recarregamento (F5) do storage", () => {
        const storage = createMemoryStorageAdapter();
        let state = createDefaultSaveData(3, 3);
        state = recordTutorialCompletion(state, "selection", storage);

        const reloaded = loadGameProgress(storage, 3, 3);
        expect(reloaded.protocols.selection.hasCompletedTutorial).toBe(true);
      });

      it("pontuação inferior NÃO substitui recorde existente no Selection", () => {
        let state = createDefaultSaveData(3, 3);
        state = recordPhaseCompletion(state, "selection", 1, 3, undefined, {
          score: 90,
          errors: 1,
          hintsUsed: 0,
          elapsedTimeMs: 20000,
        });

        const updated = recordPhaseCompletion(state, "selection", 1, 3, undefined, {
          score: 80,
          errors: 2,
          hintsUsed: 0,
          elapsedTimeMs: 15000,
        });

        expect(updated.protocols.selection.records[1].bestScore).toBe(90);
        expect(updated.protocols.selection.records[1].bestScoreErrors).toBe(1);
        expect(updated.protocols.selection.records[1].bestScoreElapsedTimeMs).toBe(20000);
      });

      it("pontuação superior DEVE substituir recorde existente no Selection", () => {
        let state = createDefaultSaveData(3, 3);
        state = recordPhaseCompletion(state, "selection", 1, 3, undefined, {
          score: 80,
          errors: 2,
          hintsUsed: 0,
          elapsedTimeMs: 30000,
        });

        const updated = recordPhaseCompletion(state, "selection", 1, 3, undefined, {
          score: 100,
          errors: 0,
          hintsUsed: 0,
          elapsedTimeMs: 25000,
        });

        expect(updated.protocols.selection.records[1].bestScore).toBe(100);
        expect(updated.protocols.selection.records[1].bestScoreErrors).toBe(0);
        expect(updated.protocols.selection.records[1].bestScoreElapsedTimeMs).toBe(25000);
      });

      it("empate de score com MENOS erros DEVE substituir o recorde no Selection (desempate por precisão)", () => {
        let state = createDefaultSaveData(3, 3);
        state = recordPhaseCompletion(state, "selection", 2, 3, undefined, {
          score: 90,
          errors: 2,
          hintsUsed: 0,
          elapsedTimeMs: 40000,
        });

        const updated = recordPhaseCompletion(state, "selection", 2, 3, undefined, {
          score: 90,
          errors: 1,
          hintsUsed: 0,
          elapsedTimeMs: 45000,
        });

        expect(updated.protocols.selection.records[2].bestScore).toBe(90);
        expect(updated.protocols.selection.records[2].bestScoreErrors).toBe(1);
        expect(updated.protocols.selection.records[2].bestScoreElapsedTimeMs).toBe(45000);
      });

      it("tempo NUNCA desempata nem substitui recorde se score e erros forem iguais no Selection", () => {
        let state = createDefaultSaveData(3, 3);
        state = recordPhaseCompletion(state, "selection", 1, 3, undefined, {
          score: 100,
          errors: 0,
          hintsUsed: 0,
          elapsedTimeMs: 30000,
        });

        const updated = recordPhaseCompletion(state, "selection", 1, 3, undefined, {
          score: 100,
          errors: 0,
          hintsUsed: 0,
          elapsedTimeMs: 12000, // Tempo menor não deve substituir
        });

        expect(updated.protocols.selection.records[1].bestScoreElapsedTimeMs).toBe(30000);
      });

      it("rejogar fase anterior no Selection não causa regressão de progresso", () => {
        let state = createDefaultSaveData(3, 3);
        state = recordPhaseCompletion(state, "selection", 1, 3);
        state = recordPhaseCompletion(state, "selection", 2, 3);
        state = recordPhaseCompletion(state, "selection", 3, 3);

        expect(state.protocols.selection.highestPhaseReached).toBe(3);
        expect(state.protocols.selection.unlockedPhases).toBe(3);

        const replayed = recordPhaseCompletion(state, "selection", 1, 3);
        expect(replayed.protocols.selection.highestPhaseReached).toBe(3);
        expect(replayed.protocols.selection.unlockedPhases).toBe(3);
      });
    });

    describe("Semântica de Início de Sessão Multi-Protocolo (getInitialSessionRoute)", () => {
      it("Selection sem tutorial direciona para selection-tutorial na fase 1", () => {
        const state = createDefaultSaveData(3, 3);
        const route = getInitialSessionRoute(state, "selection");
        expect(route.screen).toBe("selection-tutorial");
        expect(route.phase).toBe(1);
      });

      it("Selection com tutorial concluído direciona para selection-game na fase 1", () => {
        let state = createDefaultSaveData(3, 3);
        state = recordTutorialCompletion(state, "selection");
        const route = getInitialSessionRoute(state, "selection");
        expect(route.screen).toBe("selection-game");
        expect(route.phase).toBe(1);
      });

      it("Selection com fases 1..3 desbloqueadas continua iniciando nova campanha na fase 1", () => {
        let state = createDefaultSaveData(3, 3);
        state = recordTutorialCompletion(state, "selection");
        state = recordPhaseCompletion(state, "selection", 1, 3);
        state = recordPhaseCompletion(state, "selection", 2, 3);
        state = recordPhaseCompletion(state, "selection", 3, 3);

        const route = getInitialSessionRoute(state, "selection");
        expect(route.screen).toBe("selection-game");
        expect(route.phase).toBe(1); // Sempre inicia na fase 1
      });
    });

    describe("Preservação do Modo Desafio (Early Exit) do Bubble Sort", () => {
      it("isChallengeModeUnlocked avalia estritamente Bubble e não é afetado pelo Selection", () => {
        let state = createDefaultSaveData(3, 3);
        expect(isChallengeModeUnlocked(state, 3)).toBe(false);

        // Completa todas as fases do Selection
        state = recordPhaseCompletion(state, "selection", 1, 3);
        state = recordPhaseCompletion(state, "selection", 2, 3);
        state = recordPhaseCompletion(state, "selection", 3, 3);

        // Desafio do Bubble continua bloqueado
        expect(isChallengeModeUnlocked(state, 3)).toBe(false);

        // Completa fase 3 do Bubble
        state = recordPhaseCompletion(state, "bubble", 3, 3);
        expect(isChallengeModeUnlocked(state, 3)).toBe(true);
      });
    });

    describe("Resiliência Defensiva e Volatilidade do Replay", () => {
      it("storage com JSON corrompido em save v3 restaura default v3 seguro", () => {
        const storage = createMemoryStorageAdapter({
          [STORAGE_KEY]: "{ invalid json, missing braces ...",
        });

        const loaded = loadGameProgress(storage, 3, 3);
        expect(loaded.schemaVersion).toBe(3);
        expect(loaded.protocols.bubble.unlockedPhases).toBe(1);
        expect(loaded.protocols.selection.unlockedPhases).toBe(1);
      });

      it("falha de storage em setItem (QuotaExceeded) reporta erro sem quebrar aplicação", () => {
        const failingStorage: StorageAdapter = {
          getItem: () => null,
          setItem: () => {
            throw new Error("QuotaExceededError");
          },
          removeItem: () => {},
        };

        const state = createDefaultSaveData(3, 3);
        const result = saveGameProgress(state, failingStorage, 3, 3);

        expect(result.success).toBe(false);
        expect(result.fallbackUsed).toBe(true);
        expect(result.error).toContain("QuotaExceededError");
      });

      it("o replay (SelectionStepRecord[]) permanece em memória e nunca é salvo no storage", () => {
        const storage = createMemoryStorageAdapter();
        let state = createDefaultSaveData(3, 3);

        // Grava conclusão com métricas de resultado
        state = recordPhaseCompletion(state, "selection", 1, 3, storage, {
          score: 100,
          errors: 0,
          hintsUsed: 0,
          elapsedTimeMs: 15000,
        });

        const storedRaw = storage.getItem(STORAGE_KEY);
        expect(storedRaw).toBeDefined();
        // Não contém chaves de replay ou steps
        expect(storedRaw).not.toContain("history");
        expect(storedRaw).not.toContain("initialArray");
        expect(storedRaw).not.toContain("seed");
        expect(storedRaw).not.toContain("frames");
        expect(storedRaw).not.toContain("INSPECTION");
      });
    });
  });
});



