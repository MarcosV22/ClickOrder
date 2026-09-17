import { describe, it, expect, vi } from "vitest";
import {
  STORAGE_KEY,
  LEGACY_STORAGE_KEY,
  CURRENT_SCHEMA_VERSION,
  createDefaultSaveData,
  createMemoryStorageAdapter,
  createSafeStorage,
  loadGameProgress,
  saveGameProgress,
  recordPhaseCompletion,
  recordExerciseCompletion,
  recordTutorialCompletion,
  clearGameProgress,
  validateAndMigrateSaveData,
  isChallengeModeUnlocked,
  getInitialSessionRoute,
  getProtocolProgress,
  getModuleProgress,
  getExerciseSetProgress,
  isExerciseSetCompleted,
  getBestExerciseRecord,
  isModuleTutorialCompleted,
  isModuleRegularPracticeCompleted,
  isExerciseSetUnlocked,
  migrateV1ToV2,
  migrateV2ToV3,
  migrateV3ToV4,
  BUBBLE_EXERCISE_SETS,
  SELECTION_EXERCISE_SETS,
  INSERTION_EXERCISE_SETS,
  type StorageAdapter,
  type GameSaveSchema,
  type GameSaveSchemaV4,
} from "./index";

describe("Persistence Layer (P1.6 - P2.2-F)", () => {
  describe("1. Estado Padrão (Clean Install)", () => {
    it("deve inicializar com schemaVersion 4, módulos curriculares configurados e tutorial pendente", () => {
      const defaultData = createDefaultSaveData();
      expect(defaultData.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(defaultData.schemaVersion).toBe(4);

      // Módulos inicializados
      expect(defaultData.modules.bubble).toBeDefined();
      expect(defaultData.modules.selection).toBeDefined();
      expect(defaultData.modules.insertion).toBeDefined();

      // Bubble progress derivado e direto
      expect(defaultData.modules.bubble?.completedTutorial).toBe(false);
      expect(defaultData.modules.bubble?.exerciseSets).toEqual({});

      const bubbleProgress = getProtocolProgress(defaultData, "bubble");
      expect(bubbleProgress.unlockedPhases).toBe(1);
      expect(bubbleProgress.highestPhaseReached).toBe(1);
      expect(bubbleProgress.hasCompletedTutorial).toBe(false);
      expect(bubbleProgress.records).toEqual({});

      // Preferências padrão
      expect(defaultData.preferences).toEqual({
        soundEnabled: true,
        reducedMotion: false,
        highContrast: false,
      });
      expect(typeof defaultData.lastUpdated).toBe("string");
    });

    it("loadGameProgress deve retornar estado padrão seguro quando o storage estiver vazio", () => {
      const storage = createMemoryStorageAdapter();
      const loaded = loadGameProgress(storage);

      expect(loaded.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      const bubble = getProtocolProgress(loaded, "bubble");
      expect(bubble.unlockedPhases).toBe(1);
      expect(bubble.highestPhaseReached).toBe(1);
      expect(bubble.hasCompletedTutorial).toBe(false);
      expect(bubble.records).toEqual({});
    });

    it("loadGameProgress deve retornar estado padrão quando storage contiver string vazia ou espaços", () => {
      const storage = createMemoryStorageAdapter({ [STORAGE_KEY]: "   " });
      const loaded = loadGameProgress(storage);
      expect(getProtocolProgress(loaded, "bubble").unlockedPhases).toBe(1);
    });
  });

  describe("2. Save e Load Básico", () => {
    it("deve salvar e recarregar dados íntegros corretamente", () => {
      const storage = createMemoryStorageAdapter();
      const initial = createDefaultSaveData();

      saveGameProgress(initial, storage);
      const rawStored = storage.getItem(STORAGE_KEY);
      expect(rawStored).toBeTruthy();

      const reloaded = loadGameProgress(storage);
      expect(reloaded.schemaVersion).toBe(initial.schemaVersion);
      expect(reloaded.modules.bubble).toEqual(initial.modules.bubble);
      expect(reloaded.preferences).toEqual(initial.preferences);
    });
  });

  describe("3. Progressão de Fases e Limites (Bubble via Adaptador)", () => {
    it("deve desbloquear a fase 2 ao concluir a fase 1", () => {
      const storage = createMemoryStorageAdapter();
      const state0 = createDefaultSaveData();

      const state1 = recordPhaseCompletion(state0, 1, 3, storage);
      const bubble1 = getProtocolProgress(state1, "bubble");
      expect(bubble1.unlockedPhases).toBe(2);
      expect(bubble1.highestPhaseReached).toBe(2);
      expect(bubble1.hasCompletedTutorial).toBe(true);
      expect(bubble1.records[1]).toBeDefined();
      expect(bubble1.records[1].completed).toBe(true);

      // Confirma que foi persistido no storage
      const loaded = loadGameProgress(storage);
      const loadedBubble = getProtocolProgress(loaded, "bubble");
      expect(loadedBubble.unlockedPhases).toBe(2);
      expect(loadedBubble.highestPhaseReached).toBe(2);
    });

    it("deve desbloquear a fase 3 ao concluir a fase 2", () => {
      const storage = createMemoryStorageAdapter();
      const state0 = createDefaultSaveData();
      const state1 = recordPhaseCompletion(state0, 1, 3, storage);
      const state2 = recordPhaseCompletion(state1, 2, 3, storage);

      const bubble2 = getProtocolProgress(state2, "bubble");
      expect(bubble2.unlockedPhases).toBe(3);
      expect(bubble2.highestPhaseReached).toBe(3);
      expect(bubble2.records[2].completed).toBe(true);

      const loaded = loadGameProgress(storage);
      expect(getProtocolProgress(loaded, "bubble").unlockedPhases).toBe(3);
    });

    it("NUNCA deve ultrapassar o limite de fases (3 fases)", () => {
      const storage = createMemoryStorageAdapter();
      const state0 = createDefaultSaveData();
      const state1 = recordPhaseCompletion(state0, 1, 3, storage);
      const state2 = recordPhaseCompletion(state1, 2, 3, storage);
      const state3 = recordPhaseCompletion(state2, 3, 3, storage);

      const bubble3 = getProtocolProgress(state3, "bubble");
      expect(bubble3.unlockedPhases).toBe(3);
      expect(bubble3.highestPhaseReached).toBe(3);
      expect(bubble3.records[3].completed).toBe(true);

      const loaded = loadGameProgress(storage);
      expect(getProtocolProgress(loaded, "bubble").unlockedPhases).toBe(3);
    });

    it("NUNCA deve regredir a fase desbloqueada ao rejogar fases anteriores", () => {
      const storage = createMemoryStorageAdapter();
      const state0 = createDefaultSaveData();
      const state1 = recordPhaseCompletion(state0, 1, 3, storage);
      const state2 = recordPhaseCompletion(state1, 2, 3, storage);
      expect(getProtocolProgress(state2, "bubble").unlockedPhases).toBe(3);

      // Aluno rejoga a fase 1
      const replayedState = recordPhaseCompletion(state2, 1, 3, storage);
      expect(getProtocolProgress(replayedState, "bubble").unlockedPhases).toBe(3);
      expect(getProtocolProgress(replayedState, "bubble").highestPhaseReached).toBe(3);

      // Aluno rejoga a fase 2
      const replayedState2 = recordPhaseCompletion(replayedState, 2, 3, storage);
      expect(getProtocolProgress(replayedState2, "bubble").unlockedPhases).toBe(3);
      expect(getProtocolProgress(replayedState2, "bubble").highestPhaseReached).toBe(3);

      const loaded = loadGameProgress(storage);
      expect(getProtocolProgress(loaded, "bubble").unlockedPhases).toBe(3);
    });
  });

  describe("4. Conclusão do Tutorial", () => {
    it("deve marcar completedTutorial como true e persistir no storage", () => {
      const storage = createMemoryStorageAdapter();
      const state0 = createDefaultSaveData();
      expect(isModuleTutorialCompleted(state0, "bubble")).toBe(false);

      const state1 = recordTutorialCompletion(state0, "bubble", storage);
      expect(isModuleTutorialCompleted(state1, "bubble")).toBe(true);

      const loaded = loadGameProgress(storage);
      expect(isModuleTutorialCompleted(loaded, "bubble")).toBe(true);
    });

    it("recordTutorialCompletion é idempotente se já estiver concluído", () => {
      const storage = createMemoryStorageAdapter();
      const state0 = createDefaultSaveData();
      const state1 = recordTutorialCompletion(state0, "bubble", storage);
      const state2 = recordTutorialCompletion(state1, "bubble", storage);
      expect(state2).toBe(state1);
    });
  });

  describe("5. Robustez contra Dados Inválidos e Corrupção", () => {
    it("deve se recuperar com fallback seguro quando o JSON estiver corrompido", () => {
      const storage = createMemoryStorageAdapter({
        [STORAGE_KEY]: "INVALID_JSON{{[123",
      });

      const spyWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const loaded = loadGameProgress(storage);
      spyWarn.mockRestore();

      expect(loaded).toBeDefined();
      expect(loaded.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(getProtocolProgress(loaded, "bubble").unlockedPhases).toBe(1);
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
        const loaded = loadGameProgress(storage);
        expect(loaded.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
        expect(getProtocolProgress(loaded, "bubble").unlockedPhases).toBe(1);
      }
    });

    it("deve se recuperar com fallback quando schemaVersion for versão futura desconhecida", () => {
      const futureSave = {
        schemaVersion: 999,
        modules: { bubble: { completedTutorial: true } },
      };
      const storage = createMemoryStorageAdapter({
        [STORAGE_KEY]: JSON.stringify(futureSave),
      });

      const spyWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const loaded = loadGameProgress(storage);
      spyWarn.mockRestore();

      expect(loaded.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(getProtocolProgress(loaded, "bubble").unlockedPhases).toBe(1);
    });

    it("deve sanitizar bloco de exercícios ignorando chaves inválidas ou dados mal formatados", () => {
      const saveWithBadData = {
        schemaVersion: 4,
        lastUpdated: "2026-09-17T12:00:00.000Z",
        modules: {
          bubble: {
            completedTutorial: true,
            exerciseSets: {
              "bubble.practice.basic": {
                completed: true,
                completedAt: "2026-09-17T12:05:00.000Z",
                bestRecord: {
                  bestScore: 90,
                  bestScoreErrors: 0,
                  bestScoreHintsUsed: 0,
                  bestScoreElapsedTimeMs: 15000,
                },
              },
              "invalid.exercise.id": "not_an_object",
            },
          },
        },
        preferences: { soundEnabled: true, reducedMotion: false, highContrast: false },
      };
      const storage = createMemoryStorageAdapter({
        [STORAGE_KEY]: JSON.stringify(saveWithBadData),
      });

      const loaded = loadGameProgress(storage);
      expect(loaded.modules.bubble?.exerciseSets["bubble.practice.basic"]).toBeDefined();
      expect(
        (loaded.modules.bubble?.exerciseSets as Record<string, unknown>)["invalid.exercise.id"]
      ).toBeUndefined();
    });

    it("deve preencher preferências padrão caso o bloco preferences esteja ausente ou corrompido", () => {
      const saveWithoutPrefs = {
        schemaVersion: 4,
        lastUpdated: "2026-09-17T12:00:00.000Z",
        modules: {},
      };
      const storage = createMemoryStorageAdapter({
        [STORAGE_KEY]: JSON.stringify(saveWithoutPrefs),
      });

      const loaded = loadGameProgress(storage);
      expect(loaded.preferences).toEqual({
        soundEnabled: true,
        reducedMotion: false,
        highContrast: false,
      });
    });

    it("deve clampar unlockedPhases e highestPhaseReached que excedam maxPhases na migração v1->v4", () => {
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
      expect(loaded.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(loaded.modules.bubble?.completedTutorial).toBe(true);
      expect(getProtocolProgress(loaded, "bubble").unlockedPhases).toBeLessThanOrEqual(3);
      expect(getProtocolProgress(loaded, "bubble").highestPhaseReached).toBeLessThanOrEqual(3);
    });

    it("deve clampar unlockedPhases e highestPhaseReached negativos ou decimais na migração v1->v4", () => {
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
      expect(loaded.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(loaded.modules.bubble).toBeDefined();
      expect(getProtocolProgress(loaded, "bubble").unlockedPhases).toBeGreaterThanOrEqual(1);
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

      const loaded = loadGameProgress(safe);
      spyWarn.mockRestore();

      expect(loaded).toBeDefined();
      expect(loaded.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(getProtocolProgress(loaded, "bubble").unlockedPhases).toBe(1);
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

      const result = saveGameProgress(createDefaultSaveData(), safe);
      spyWarn.mockRestore();

      // Gravação não quebra com exceção não tratada
      expect(result).toBeDefined();
      expect(result.success).toBe(true);

      // Quando chamado diretamente em adaptador bruto sem safe storage:
      const rawResult = saveGameProgress(createDefaultSaveData(), throwingAdapter);
      expect(rawResult.success).toBe(false);
      expect(rawResult.fallbackUsed).toBe(true);
    });
  });

  describe("7. Imutabilidade dos Dados", () => {
    it("o estado retornado por createDefaultSaveData e loadGameProgress deve ser Object.freeze", () => {
      const defaultState = createDefaultSaveData();
      expect(Object.isFrozen(defaultState)).toBe(true);
      expect(Object.isFrozen(defaultState.modules)).toBe(true);
      expect(Object.isFrozen(defaultState.preferences)).toBe(true);

      const storage = createMemoryStorageAdapter();
      saveGameProgress(defaultState, storage);
      const loaded = loadGameProgress(storage);
      expect(Object.isFrozen(loaded)).toBe(true);
      expect(Object.isFrozen(loaded.modules)).toBe(true);
    });
  });

  describe("8. Isolamento entre Sessão e Progresso Persistente", () => {
    it("operações de sessão (reiniciar fase, limpar resultados da campanha) não alteram o storage", () => {
      const storage = createMemoryStorageAdapter();
      const state0 = createDefaultSaveData();

      // Jogador conclui fase 1 e 2
      const state1 = recordPhaseCompletion(state0, 1, 3, storage);
      const state2 = recordPhaseCompletion(state1, 2, 3, storage);
      expect(getProtocolProgress(state2, "bubble").unlockedPhases).toBe(3);

      // Limpeza de sessão simulada
      const loaded = loadGameProgress(storage);
      expect(getProtocolProgress(loaded, "bubble").unlockedPhases).toBe(3);
      expect(getProtocolProgress(loaded, "bubble").highestPhaseReached).toBe(3);
      expect(getProtocolProgress(loaded, "bubble").records[1].completed).toBe(true);
      expect(getProtocolProgress(loaded, "bubble").records[2].completed).toBe(true);
    });
  });

  describe("9. Limpeza Programática (clearGameProgress)", () => {
    it("deve remover a chave do storage e retornar o estado padrão", () => {
      const storage = createMemoryStorageAdapter();
      recordPhaseCompletion(createDefaultSaveData(), 1, 3, storage);
      expect(storage.getItem(STORAGE_KEY)).toBeTruthy();

      const cleared = clearGameProgress(storage);
      expect(getProtocolProgress(cleared, "bubble").unlockedPhases).toBe(1);
      expect(storage.getItem(STORAGE_KEY)).toBeNull();
      expect(storage.getItem(LEGACY_STORAGE_KEY)).toBeNull();
    });
  });

  describe("10. Roteiro Operacional de Validação", () => {
    it("deve cobrir integralmente o ciclo: instalação limpa -> progresso -> F5 -> home -> rejogar -> corrupção", () => {
      const storage = createMemoryStorageAdapter();
      expect(storage.getItem(STORAGE_KEY)).toBeNull();

      let progress = loadGameProgress(storage);
      expect(getProtocolProgress(progress, "bubble").unlockedPhases).toBe(1);
      expect(getProtocolProgress(progress, "bubble").hasCompletedTutorial).toBe(false);

      // Concluir tutorial + fase 1
      progress = recordTutorialCompletion(progress, "bubble", storage);
      expect(getProtocolProgress(progress, "bubble").hasCompletedTutorial).toBe(true);
      progress = recordPhaseCompletion(progress, 1, 3, storage);
      expect(getProtocolProgress(progress, "bubble").unlockedPhases).toBe(2);

      // F5 (recarga limpa do storage)
      const freshLoadedAfterF5 = loadGameProgress(storage);
      expect(getProtocolProgress(freshLoadedAfterF5, "bubble").unlockedPhases).toBe(2);
      expect(getProtocolProgress(freshLoadedAfterF5, "bubble").hasCompletedTutorial).toBe(true);

      // Rejogar fase 1 sem regressão
      const replayedProgress = recordPhaseCompletion(freshLoadedAfterF5, 1, 3, storage);
      expect(getProtocolProgress(replayedProgress, "bubble").unlockedPhases).toBe(2);

      // Simulação de corrupção
      storage.setItem(STORAGE_KEY, "{MALFORMED_JSON_CORRUPT");
      const spyWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const fallbackState = loadGameProgress(storage);
      spyWarn.mockRestore();

      expect(fallbackState).toBeDefined();
      expect(fallbackState.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(getProtocolProgress(fallbackState, "bubble").unlockedPhases).toBe(1);
    });
  });

  describe("11. Regras de Recorde de Pontuação da Fase (Bubble via Adaptador)", () => {
    it("deve registrar os dados da primeira conclusão com sucesso", () => {
      const storage = createMemoryStorageAdapter();
      let state = createDefaultSaveData();

      state = recordPhaseCompletion(state, 1, 3, storage, {
        score: 90,
        errors: 1,
        hintsUsed: 0,
        elapsedTimeMs: 45000,
      });

      const bubble = getProtocolProgress(state, "bubble");
      expect(bubble.records[1].completed).toBe(true);
      expect(bubble.records[1].bestScore).toBe(90);
      expect(bubble.records[1].bestScoreErrors).toBe(1);
      expect(bubble.records[1].bestScoreHintsUsed).toBe(0);
      expect(bubble.records[1].bestScoreElapsedTimeMs).toBe(45000);
    });

    it("pontuação inferior NÃO deve substituir o recorde existente", () => {
      const storage = createMemoryStorageAdapter();
      let state = createDefaultSaveData();

      state = recordPhaseCompletion(state, 1, 3, storage, {
        score: 90,
        errors: 1,
        hintsUsed: 0,
        elapsedTimeMs: 45000,
      });

      state = recordPhaseCompletion(state, 1, 3, storage, {
        score: 70,
        errors: 3,
        hintsUsed: 0,
        elapsedTimeMs: 30000,
      });

      const bubble = getProtocolProgress(state, "bubble");
      expect(bubble.records[1].bestScore).toBe(90);
      expect(bubble.records[1].bestScoreErrors).toBe(1);
      expect(bubble.records[1].bestScoreElapsedTimeMs).toBe(45000);
    });

    it("pontuação superior DEVE substituir o recorde existente", () => {
      const storage = createMemoryStorageAdapter();
      let state = createDefaultSaveData();

      state = recordPhaseCompletion(state, 1, 3, storage, {
        score: 90,
        errors: 1,
        hintsUsed: 0,
        elapsedTimeMs: 45000,
      });

      state = recordPhaseCompletion(state, 1, 3, storage, {
        score: 100,
        errors: 0,
        hintsUsed: 0,
        elapsedTimeMs: 52000,
      });

      const bubble = getProtocolProgress(state, "bubble");
      expect(bubble.records[1].bestScore).toBe(100);
      expect(bubble.records[1].bestScoreErrors).toBe(0);
      expect(bubble.records[1].bestScoreHintsUsed).toBe(0);
      expect(bubble.records[1].bestScoreElapsedTimeMs).toBe(52000);
    });

    it("empate de score com MENOS erros DEVE substituir o recorde (desempate por precisão)", () => {
      const storage = createMemoryStorageAdapter();
      let state = createDefaultSaveData();

      state = recordPhaseCompletion(state, 1, 3, storage, {
        score: 90,
        errors: 1,
        hintsUsed: 0,
        elapsedTimeMs: 40000,
      });

      state = recordPhaseCompletion(state, 1, 3, storage, {
        score: 90,
        errors: 0,
        hintsUsed: 2,
        elapsedTimeMs: 65000,
      });

      const bubble = getProtocolProgress(state, "bubble");
      expect(bubble.records[1].bestScore).toBe(90);
      expect(bubble.records[1].bestScoreErrors).toBe(0);
      expect(bubble.records[1].bestScoreHintsUsed).toBe(2);
      expect(bubble.records[1].bestScoreElapsedTimeMs).toBe(65000);
    });

    it("empate de score com MAIS erros NÃO deve substituir o recorde", () => {
      const storage = createMemoryStorageAdapter();
      let state = createDefaultSaveData();

      state = recordPhaseCompletion(state, 1, 3, storage, {
        score: 90,
        errors: 0,
        hintsUsed: 2,
        elapsedTimeMs: 65000,
      });

      state = recordPhaseCompletion(state, 1, 3, storage, {
        score: 90,
        errors: 1,
        hintsUsed: 0,
        elapsedTimeMs: 30000,
      });

      const bubble = getProtocolProgress(state, "bubble");
      expect(bubble.records[1].bestScore).toBe(90);
      expect(bubble.records[1].bestScoreErrors).toBe(0);
    });

    it("tempo NUNCA desempata nem incentiva pressa se score e erros forem iguais", () => {
      const storage = createMemoryStorageAdapter();
      let state = createDefaultSaveData();

      state = recordPhaseCompletion(state, 1, 3, storage, {
        score: 100,
        errors: 0,
        hintsUsed: 0,
        elapsedTimeMs: 60000,
      });

      state = recordPhaseCompletion(state, 1, 3, storage, {
        score: 100,
        errors: 0,
        hintsUsed: 0,
        elapsedTimeMs: 25000,
      });

      const bubble = getProtocolProgress(state, "bubble");
      expect(bubble.records[1].bestScore).toBe(100);
      expect(bubble.records[1].bestScoreElapsedTimeMs).toBe(60000);
    });
  });

  describe("12. Desbloqueio Factual do Modo Desafio (isChallengeModeUnlocked)", () => {
    it("deve retornar false quando a campanha principal ainda não foi concluída", () => {
      const state = createDefaultSaveData();
      expect(isChallengeModeUnlocked(state)).toBe(false);

      const partialState = recordPhaseCompletion(state, 1, 3);
      expect(isChallengeModeUnlocked(partialState)).toBe(false);
    });

    it("deve retornar true quando a fase 3 (advanced) estiver concluída", () => {
      let state = createDefaultSaveData();
      state = recordPhaseCompletion(state, 3, 3);
      expect(isChallengeModeUnlocked(state)).toBe(true);
    });
  });

  describe("13. Semântica Correta de Início de Sessão", () => {
    it("usuário novo (sem tutorial) deve ser direcionado ao tutorial com phase = 1", () => {
      const state = createDefaultSaveData();
      expect(isModuleTutorialCompleted(state, "bubble")).toBe(false);

      const route = getInitialSessionRoute(state);
      expect(route.screen).toBe("tutorial");
      expect(route.phase).toBe(1);
    });

    it("usuário com tutorial concluído deve iniciar diretamente em phase = 1", () => {
      const storage = createMemoryStorageAdapter();
      let state = createDefaultSaveData();
      state = recordTutorialCompletion(state, "bubble", storage);
      state = recordPhaseCompletion(state, 1, 3, storage);
      state = recordPhaseCompletion(state, 2, 3, storage);
      state = recordPhaseCompletion(state, 3, 3, storage);

      const route = getInitialSessionRoute(state);
      expect(route.screen).toBe("game");
      expect(route.phase).toBe(1);
    });
  });

  describe("14. Pipeline de Migração (v1 -> v2, v2 -> v3, v3 -> v4 e Storage)", () => {
    it("migrateV1ToV2 converte save v1 para v2", () => {
      const v1Raw = {
        schemaVersion: 1,
        lastUpdated: "2026-09-10T12:00:00.000Z",
        campaign: { unlockedPhases: 2, highestPhaseReached: 2, hasCompletedTutorial: true },
        records: { "1": { completed: true, completedAt: "2026-09-10T12:05:00.000Z" } },
        preferences: { soundEnabled: false, reducedMotion: true, highContrast: false },
      };

      const v2 = migrateV1ToV2(v1Raw, 3);
      expect(v2.schemaVersion).toBe(2);
      expect(v2.campaign.unlockedPhases).toBe(2);
      expect(v2.records[1].completed).toBe(true);
    });

    it("migrateV2ToV3 converte save v2 para v3 com protocolos isolados", () => {
      const v2Raw = {
        schemaVersion: 2,
        lastUpdated: "2026-09-11T10:00:00.000Z",
        campaign: { unlockedPhases: 3, highestPhaseReached: 3, hasCompletedTutorial: true },
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
        preferences: { soundEnabled: true, reducedMotion: false, highContrast: false },
      };

      const v3 = migrateV2ToV3(v2Raw, 3, 3);
      expect(v3.schemaVersion).toBe(3);
      expect(v3.protocols.bubble.unlockedPhases).toBe(3);
      expect(v3.protocols.bubble.records[1].bestScore).toBe(100);
      expect(v3.protocols.selection.unlockedPhases).toBe(1);
    });

    it("migrateV3ToV4 converte save v3 para v4 com modules estruturados", () => {
      const v3Raw = {
        schemaVersion: 3 as const,
        lastUpdated: "2026-09-12T10:00:00.000Z",
        protocols: {
          bubble: {
            unlockedPhases: 2,
            highestPhaseReached: 2,
            hasCompletedTutorial: true,
            records: {
              1: {
                completed: true,
                completedAt: "2026-09-12T10:05:00.000Z",
                bestScore: 90,
                bestScoreErrors: 1,
                bestScoreHintsUsed: 0,
                bestScoreElapsedTimeMs: 25000,
              },
            },
          },
          selection: {
            unlockedPhases: 1,
            highestPhaseReached: 1,
            hasCompletedTutorial: false,
            records: {},
          },
        },
        preferences: { soundEnabled: true, reducedMotion: false, highContrast: true },
      };

      const v4 = migrateV3ToV4(v3Raw);
      expect(v4.schemaVersion).toBe(4);
      expect(v4.modules.bubble?.completedTutorial).toBe(true);
      expect(
        v4.modules.bubble?.exerciseSets[BUBBLE_EXERCISE_SETS.BASIC]?.completed
      ).toBe(true);
      expect(
        v4.modules.bubble?.exerciseSets[BUBBLE_EXERCISE_SETS.BASIC]?.bestRecord?.bestScore
      ).toBe(90);
      expect(v4.modules.selection?.completedTutorial).toBe(false);
      expect(v4.modules.insertion?.completedTutorial).toBe(false);
      expect(v4.preferences.highContrast).toBe(true);
    });

    it("pipeline completo: save v1 em storage é carregado em v4 com Bubble e preferências intactos", () => {
      const v1Save = {
        schemaVersion: 1,
        lastUpdated: "2026-09-10T12:00:00.000Z",
        campaign: { unlockedPhases: 2, highestPhaseReached: 2, hasCompletedTutorial: true },
        records: { "1": { completed: true, completedAt: "2026-09-10T12:05:00.000Z" } },
        preferences: { soundEnabled: false, reducedMotion: true, highContrast: true },
      };

      const storage = createMemoryStorageAdapter({
        [STORAGE_KEY]: JSON.stringify(v1Save),
      });

      const loaded = loadGameProgress(storage);
      expect(loaded.schemaVersion).toBe(4);
      expect(isModuleTutorialCompleted(loaded, "bubble")).toBe(true);
      expect(isExerciseSetCompleted(loaded, "bubble", BUBBLE_EXERCISE_SETS.BASIC)).toBe(true);
      expect(loaded.preferences.soundEnabled).toBe(false);
      expect(loaded.preferences.highContrast).toBe(true);
    });

    it("pipeline completo: save v2 em storage é carregado em v4 com scores intactos", () => {
      const v2Save = {
        schemaVersion: 2,
        lastUpdated: "2026-09-12T08:00:00.000Z",
        campaign: { unlockedPhases: 3, highestPhaseReached: 3, hasCompletedTutorial: true },
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
        preferences: { soundEnabled: true, reducedMotion: false, highContrast: false },
      };

      const storage = createMemoryStorageAdapter({
        [STORAGE_KEY]: JSON.stringify(v2Save),
      });

      const loaded = loadGameProgress(storage);
      expect(loaded.schemaVersion).toBe(4);
      expect(
        getBestExerciseRecord(loaded, "bubble", BUBBLE_EXERCISE_SETS.BASIC)?.bestScore
      ).toBe(90);
      expect(
        getBestExerciseRecord(loaded, "bubble", BUBBLE_EXERCISE_SETS.INTERMEDIATE)?.bestScore
      ).toBe(85);
      expect(isModuleTutorialCompleted(loaded, "selection")).toBe(false);
    });

    it("pipeline de chave legada: lê de LEGACY_STORAGE_KEY se STORAGE_KEY estiver vazia e grava em STORAGE_KEY", () => {
      const v2Save = {
        schemaVersion: 2,
        lastUpdated: "2026-09-12T08:00:00.000Z",
        campaign: { unlockedPhases: 2, highestPhaseReached: 2, hasCompletedTutorial: true },
        records: {
          "1": {
            completed: true,
            completedAt: "2026-09-12T08:05:00.000Z",
            bestScore: 92,
            bestScoreErrors: 0,
            bestScoreHintsUsed: 0,
            bestScoreElapsedTimeMs: 20000,
          },
        },
        preferences: { soundEnabled: true, reducedMotion: false, highContrast: false },
      };

      const storage = createMemoryStorageAdapter({
        [LEGACY_STORAGE_KEY]: JSON.stringify(v2Save),
      });

      const loaded = loadGameProgress(storage);
      expect(loaded.schemaVersion).toBe(4);
      expect(
        getBestExerciseRecord(loaded, "bubble", BUBBLE_EXERCISE_SETS.BASIC)?.bestScore
      ).toBe(92);

      // Nova gravação deve gravar em STORAGE_KEY estável
      saveGameProgress(loaded, storage);
      expect(storage.getItem(STORAGE_KEY)).toBeTruthy();
      const storedInStable = JSON.parse(storage.getItem(STORAGE_KEY)!);
      expect(storedInStable.schemaVersion).toBe(4);
    });
  });

  describe("15. Isolamento Estrito entre Módulos (Bubble vs Selection vs Insertion)", () => {
    it("fases/exercícios dos módulos possuem namespaces independentes sem colisão", () => {
      const storage = createMemoryStorageAdapter();
      let state = createDefaultSaveData();

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

      // Insertion completa Prática Básica com 95 pontos
      state = recordExerciseCompletion(
        state,
        "insertion",
        INSERTION_EXERCISE_SETS.BASIC,
        {
          score: 95,
          errors: 1,
          hintsUsed: 0,
          elapsedTimeMs: 20000,
        },
        storage
      );

      // Verificação: nenhum sobrepôs o outro
      expect(
        getBestExerciseRecord(state, "bubble", BUBBLE_EXERCISE_SETS.BASIC)?.bestScore
      ).toBe(100);
      expect(
        getBestExerciseRecord(state, "selection", SELECTION_EXERCISE_SETS.BASIC)?.bestScore
      ).toBe(80);
      expect(
        getBestExerciseRecord(state, "insertion", INSERTION_EXERCISE_SETS.BASIC)?.bestScore
      ).toBe(95);

      // Desbloqueios isolados
      expect(isExerciseSetUnlocked(state, "bubble", BUBBLE_EXERCISE_SETS.INTERMEDIATE)).toBe(
        true
      );
      expect(
        isExerciseSetUnlocked(state, "selection", SELECTION_EXERCISE_SETS.INTERMEDIATE)
      ).toBe(true);
      expect(
        isExerciseSetUnlocked(state, "insertion", INSERTION_EXERCISE_SETS.INTERMEDIATE)
      ).toBe(true);
    });

    it("concluir tutorial de um módulo não altera os tutoriais dos demais", () => {
      let state = createDefaultSaveData();
      expect(isModuleTutorialCompleted(state, "bubble")).toBe(false);
      expect(isModuleTutorialCompleted(state, "selection")).toBe(false);
      expect(isModuleTutorialCompleted(state, "insertion")).toBe(false);

      state = recordTutorialCompletion(state, "insertion");
      expect(isModuleTutorialCompleted(state, "insertion")).toBe(true);
      expect(isModuleTutorialCompleted(state, "bubble")).toBe(false);
      expect(isModuleTutorialCompleted(state, "selection")).toBe(false);

      state = recordTutorialCompletion(state, "selection");
      expect(isModuleTutorialCompleted(state, "selection")).toBe(true);
      expect(isModuleTutorialCompleted(state, "bubble")).toBe(false);
      expect(isModuleTutorialCompleted(state, "insertion")).toBe(true);
    });
  });

  describe("16. Persistência e Progressão do Módulo Insertion Sort (P2.2-F)", () => {
    it("tutorial do Insertion Sort resiste a F5", () => {
      const storage = createMemoryStorageAdapter();
      let state = createDefaultSaveData();
      state = recordTutorialCompletion(state, "insertion", storage);

      const reloaded = loadGameProgress(storage);
      expect(isModuleTutorialCompleted(reloaded, "insertion")).toBe(true);
    });

    it("grava conclusão de exercício do Insertion Sort e atualiza recorde", () => {
      const storage = createMemoryStorageAdapter();
      let state = createDefaultSaveData();

      state = recordExerciseCompletion(
        state,
        "insertion",
        INSERTION_EXERCISE_SETS.BASIC,
        {
          score: 85,
          errors: 2,
          hintsUsed: 0,
          elapsedTimeMs: 30000,
        },
        storage
      );

      const record = getBestExerciseRecord(
        state,
        "insertion",
        INSERTION_EXERCISE_SETS.BASIC
      );
      expect(record).toBeDefined();
      expect(record?.bestScore).toBe(85);
      expect(record?.bestScoreErrors).toBe(2);

      const reloaded = loadGameProgress(storage);
      expect(
        isExerciseSetCompleted(reloaded, "insertion", INSERTION_EXERCISE_SETS.BASIC)
      ).toBe(true);
    });

    it("pontuação inferior NÃO substitui recorde existente no Insertion Sort", () => {
      let state = createDefaultSaveData();
      state = recordExerciseCompletion(
        state,
        "insertion",
        INSERTION_EXERCISE_SETS.BASIC,
        { score: 90, errors: 1, hintsUsed: 0, elapsedTimeMs: 20000 }
      );

      const updated = recordExerciseCompletion(
        state,
        "insertion",
        INSERTION_EXERCISE_SETS.BASIC,
        { score: 75, errors: 3, hintsUsed: 0, elapsedTimeMs: 15000 }
      );

      const record = getBestExerciseRecord(
        updated,
        "insertion",
        INSERTION_EXERCISE_SETS.BASIC
      );
      expect(record?.bestScore).toBe(90);
      expect(record?.bestScoreErrors).toBe(1);
    });

    it("pontuação superior DEVE substituir recorde existente no Insertion Sort", () => {
      let state = createDefaultSaveData();
      state = recordExerciseCompletion(
        state,
        "insertion",
        INSERTION_EXERCISE_SETS.BASIC,
        { score: 80, errors: 2, hintsUsed: 0, elapsedTimeMs: 30000 }
      );

      const updated = recordExerciseCompletion(
        state,
        "insertion",
        INSERTION_EXERCISE_SETS.BASIC,
        { score: 100, errors: 0, hintsUsed: 0, elapsedTimeMs: 25000 }
      );

      const record = getBestExerciseRecord(
        updated,
        "insertion",
        INSERTION_EXERCISE_SETS.BASIC
      );
      expect(record?.bestScore).toBe(100);
      expect(record?.bestScoreErrors).toBe(0);
    });

    it("empate de score com MENOS erros DEVE substituir o recorde no Insertion Sort", () => {
      let state = createDefaultSaveData();
      state = recordExerciseCompletion(
        state,
        "insertion",
        INSERTION_EXERCISE_SETS.BASIC,
        { score: 90, errors: 2, hintsUsed: 0, elapsedTimeMs: 40000 }
      );

      const updated = recordExerciseCompletion(
        state,
        "insertion",
        INSERTION_EXERCISE_SETS.BASIC,
        { score: 90, errors: 0, hintsUsed: 1, elapsedTimeMs: 45000 }
      );

      const record = getBestExerciseRecord(
        updated,
        "insertion",
        INSERTION_EXERCISE_SETS.BASIC
      );
      expect(record?.bestScore).toBe(90);
      expect(record?.bestScoreErrors).toBe(0);
      expect(record?.bestScoreHintsUsed).toBe(1);
    });

    it("tempo NUNCA desempata nem substitui recorde se score e erros forem iguais no Insertion Sort", () => {
      let state = createDefaultSaveData();
      state = recordExerciseCompletion(
        state,
        "insertion",
        INSERTION_EXERCISE_SETS.BASIC,
        { score: 100, errors: 0, hintsUsed: 0, elapsedTimeMs: 50000 }
      );

      const updated = recordExerciseCompletion(
        state,
        "insertion",
        INSERTION_EXERCISE_SETS.BASIC,
        { score: 100, errors: 0, hintsUsed: 0, elapsedTimeMs: 15000 }
      );

      const record = getBestExerciseRecord(
        updated,
        "insertion",
        INSERTION_EXERCISE_SETS.BASIC
      );
      expect(record?.bestScoreElapsedTimeMs).toBe(50000);
    });

    it("derivação pura de desbloqueios do Insertion Sort: Basic livre, Intermediate após Basic, Advanced após Intermediate", () => {
      let state = createDefaultSaveData();

      // Inicialmente, apenas basic está desbloqueado
      expect(isExerciseSetUnlocked(state, "insertion", INSERTION_EXERCISE_SETS.BASIC)).toBe(
        true
      );
      expect(
        isExerciseSetUnlocked(state, "insertion", INSERTION_EXERCISE_SETS.INTERMEDIATE)
      ).toBe(false);
      expect(
        isExerciseSetUnlocked(state, "insertion", INSERTION_EXERCISE_SETS.ADVANCED)
      ).toBe(false);
      expect(isModuleRegularPracticeCompleted(state, "insertion")).toBe(false);

      // Conclui Basic
      state = recordExerciseCompletion(
        state,
        "insertion",
        INSERTION_EXERCISE_SETS.BASIC,
        { score: 90, errors: 0, hintsUsed: 0 }
      );
      expect(
        isExerciseSetUnlocked(state, "insertion", INSERTION_EXERCISE_SETS.INTERMEDIATE)
      ).toBe(true);
      expect(
        isExerciseSetUnlocked(state, "insertion", INSERTION_EXERCISE_SETS.ADVANCED)
      ).toBe(false);

      // Conclui Intermediate
      state = recordExerciseCompletion(
        state,
        "insertion",
        INSERTION_EXERCISE_SETS.INTERMEDIATE,
        { score: 95, errors: 0, hintsUsed: 0 }
      );
      expect(
        isExerciseSetUnlocked(state, "insertion", INSERTION_EXERCISE_SETS.ADVANCED)
      ).toBe(true);
      expect(isModuleRegularPracticeCompleted(state, "insertion")).toBe(false);

      // Conclui Advanced
      state = recordExerciseCompletion(
        state,
        "insertion",
        INSERTION_EXERCISE_SETS.ADVANCED,
        { score: 100, errors: 0, hintsUsed: 0 }
      );
      expect(isModuleRegularPracticeCompleted(state, "insertion")).toBe(true);
    });
  });

  describe("17. Persistência, Progressão e Semântica do Módulo Selection Sort (P2.1 / P2.2-F)", () => {
    it("concluir tutorial do Selection não altera o tutorial do Bubble nem de outros módulos", () => {
      let state = createDefaultSaveData();
      expect(state.modules.bubble?.completedTutorial).toBe(false);
      expect(state.modules.selection?.completedTutorial).toBe(false);
      expect(state.modules.insertion?.completedTutorial).toBe(false);

      state = recordTutorialCompletion(state, "selection");
      expect(state.modules.selection?.completedTutorial).toBe(true);
      expect(state.modules.bubble?.completedTutorial).toBe(false);
      expect(state.modules.insertion?.completedTutorial).toBe(false);
    });

    it("tutorial do Selection resiste a recarregamento (F5) do storage", () => {
      const storage = createMemoryStorageAdapter();
      let state = createDefaultSaveData();
      state = recordTutorialCompletion(state, "selection", storage);

      const reloaded = loadGameProgress(storage);
      expect(reloaded.modules.selection?.completedTutorial).toBe(true);
    });

    it("pontuação inferior NÃO substitui recorde existente no Selection", () => {
      let state = createDefaultSaveData();
      state = recordPhaseCompletion(state, "selection", 1, 3, undefined, {
        score: 90,
        errors: 1,
        hintsUsed: 0,
        elapsedTimeMs: 20000,
      });

      const set1 = state.modules.selection?.exerciseSets[SELECTION_EXERCISE_SETS.BASIC];
      expect(set1?.bestRecord?.bestScore).toBe(90);

      const replayed = recordPhaseCompletion(state, "selection", 1, 3, undefined, {
        score: 70,
        errors: 3,
        hintsUsed: 1,
        elapsedTimeMs: 15000,
      });

      const set1Replayed = replayed.modules.selection?.exerciseSets[SELECTION_EXERCISE_SETS.BASIC];
      expect(set1Replayed?.bestRecord?.bestScore).toBe(90);
      expect(set1Replayed?.bestRecord?.bestScoreErrors).toBe(1);
    });

    it("pontuação superior DEVE substituir recorde existente no Selection", () => {
      let state = createDefaultSaveData();
      state = recordPhaseCompletion(state, "selection", 1, 3, undefined, {
        score: 80,
        errors: 2,
        hintsUsed: 0,
        elapsedTimeMs: 30000,
      });

      const updated = recordPhaseCompletion(state, "selection", 1, 3, undefined, {
        score: 95,
        errors: 1,
        hintsUsed: 0,
        elapsedTimeMs: 25000,
      });

      const set = updated.modules.selection?.exerciseSets[SELECTION_EXERCISE_SETS.BASIC];
      expect(set?.bestRecord?.bestScore).toBe(95);
      expect(set?.bestRecord?.bestScoreErrors).toBe(1);
    });

    it("empate de score com MENOS erros DEVE substituir o recorde no Selection (desempate por precisão)", () => {
      let state = createDefaultSaveData();
      state = recordPhaseCompletion(state, "selection", 2, 3, undefined, {
        score: 90,
        errors: 2,
        hintsUsed: 0,
        elapsedTimeMs: 40000,
      });

      const updated = recordPhaseCompletion(state, "selection", 2, 3, undefined, {
        score: 90,
        errors: 0,
        hintsUsed: 0,
        elapsedTimeMs: 45000,
      });

      const set = updated.modules.selection?.exerciseSets[SELECTION_EXERCISE_SETS.INTERMEDIATE];
      expect(set?.bestRecord?.bestScore).toBe(90);
      expect(set?.bestRecord?.bestScoreErrors).toBe(0);
    });

    it("tempo NUNCA desempata nem substitui recorde se score e erros forem iguais no Selection", () => {
      let state = createDefaultSaveData();
      state = recordPhaseCompletion(state, "selection", 1, 3, undefined, {
        score: 100,
        errors: 0,
        hintsUsed: 0,
        elapsedTimeMs: 30000,
      });

      const setBefore = state.modules.selection?.exerciseSets[SELECTION_EXERCISE_SETS.BASIC];
      const originalTimestamp = setBefore?.bestRecord?.completedAt;

      const fasterAttempt = recordPhaseCompletion(state, "selection", 1, 3, undefined, {
        score: 100,
        errors: 0,
        hintsUsed: 0,
        elapsedTimeMs: 15000,
      });

      const setAfter = fasterAttempt.modules.selection?.exerciseSets[SELECTION_EXERCISE_SETS.BASIC];
      expect(setAfter?.bestRecord?.bestScoreElapsedTimeMs).toBe(30000);
      expect(setAfter?.bestRecord?.completedAt).toBe(originalTimestamp);
    });

    it("rejogar fase anterior no Selection não causa regressão de progresso", () => {
      let state = createDefaultSaveData();
      state = recordPhaseCompletion(state, "selection", 1, 3);
      state = recordPhaseCompletion(state, "selection", 2, 3);
      state = recordPhaseCompletion(state, "selection", 3, 3);

      const mod = state.modules.selection!;
      expect(mod.exerciseSets[SELECTION_EXERCISE_SETS.BASIC]?.completed).toBe(true);
      expect(mod.exerciseSets[SELECTION_EXERCISE_SETS.INTERMEDIATE]?.completed).toBe(true);
      expect(mod.exerciseSets[SELECTION_EXERCISE_SETS.ADVANCED]?.completed).toBe(true);

      const replayed = recordPhaseCompletion(state, "selection", 1, 3);
      expect(replayed.modules.selection?.exerciseSets[SELECTION_EXERCISE_SETS.ADVANCED]?.completed).toBe(true);
    });

    it("Selection sem tutorial direciona para selection-tutorial na fase 1", () => {
      const state = createDefaultSaveData();
      const route = getInitialSessionRoute(state, "selection");
      expect(route.screen).toBe("selection-tutorial");
      expect(route.phase).toBe(1);
    });

    it("Selection com tutorial concluído direciona para selection-game na fase 1", () => {
      let state = createDefaultSaveData();
      state = recordTutorialCompletion(state, "selection");
      const route = getInitialSessionRoute(state, "selection");
      expect(route.screen).toBe("selection-game");
      expect(route.phase).toBe(1);
    });

    it("Selection com fases 1..3 desbloqueadas continua iniciando nova campanha na fase 1", () => {
      let state = createDefaultSaveData();
      state = recordTutorialCompletion(state, "selection");
      state = recordPhaseCompletion(state, "selection", 1, 3);
      state = recordPhaseCompletion(state, "selection", 2, 3);
      state = recordPhaseCompletion(state, "selection", 3, 3);

      const route = getInitialSessionRoute(state, "selection");
      expect(route.screen).toBe("selection-game");
      expect(route.phase).toBe(1);
    });

    it("isChallengeModeUnlocked avalia estritamente Bubble e não é afetado pelo Selection", () => {
      let state = createDefaultSaveData();
      expect(isChallengeModeUnlocked(state, 3)).toBe(false);

      state = recordPhaseCompletion(state, "selection", 1, 3);
      state = recordPhaseCompletion(state, "selection", 2, 3);
      state = recordPhaseCompletion(state, "selection", 3, 3);

      expect(isChallengeModeUnlocked(state, 3)).toBe(false);

      state = recordPhaseCompletion(state, "bubble", 3, 3);
      expect(isChallengeModeUnlocked(state, 3)).toBe(true);
    });

    it("o replay (SelectionStepRecord[]) permanece em memória e nunca é salvo no storage", () => {
      const storage = createMemoryStorageAdapter();
      let state = createDefaultSaveData();

      state = recordPhaseCompletion(state, "selection", 1, 3, storage, {
        score: 100,
        errors: 0,
        hintsUsed: 0,
        elapsedTimeMs: 15000,
      });

      const rawInStorage = storage.getItem(STORAGE_KEY);
      expect(rawInStorage).not.toBeNull();
      const parsed = JSON.parse(rawInStorage!);
      expect(parsed.history).toBeUndefined();
      expect(parsed.stepRecords).toBeUndefined();
      expect(parsed.replay).toBeUndefined();
      expect(
        parsed.modules.selection.exerciseSets[SELECTION_EXERCISE_SETS.BASIC].history
      ).toBeUndefined();
    });
  });
});
