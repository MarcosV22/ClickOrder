import { useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import TutorialScreen from "./screens/TutorialScreen";
import GameScreen from "./screens/GameScreen";
import ResultScreen from "./screens/ResultScreen";
import CampaignCompleteScreen from "./screens/CampaignCompleteScreen";
import ReplayScreen from "./screens/ReplayScreen";
import SelectionReplayScreen from "./screens/SelectionReplayScreen";
import ProtocolModeBriefingScreen from "./screens/ProtocolModeBriefingScreen";
import SelectionTutorialScreen from "./screens/SelectionTutorialScreen";
import InsertionTutorialScreen from "./screens/InsertionTutorialScreen";
import SelectionGameScreen, {
  type SelectionPhaseCompleteData,
} from "./screens/SelectionGameScreen";
import SelectionCampaignCompleteScreen from "./screens/SelectionCampaignCompleteScreen";
import InsertionGameScreen, {
  type InsertionPracticeCompleteData,
} from "./screens/InsertionGameScreen";
import PracticeSetCompleteScreen from "./screens/PracticeSetCompleteScreen";
import PracticeSelector from "./screens/PracticeSelector";
import DemonstrationScreen from "./screens/DemonstrationScreen";
import BubbleModuleOverviewV2 from "./screens/bubble/BubbleModuleOverviewV2";
import InsertionModuleOverviewV2 from "./screens/insertion/InsertionModuleOverviewV2";
import SelectionModuleOverviewV2 from "./screens/selection/SelectionModuleOverviewV2";
import SelectionGameScreenV2 from "./screens/selection/SelectionGameScreenV2";
import InsertionGameScreenV2 from "./screens/insertion/InsertionGameScreenV2";
import BubbleGameScreenV2 from "./screens/bubble/BubbleGameScreenV2";
import type { BubbleUxTestSession } from "./screens/bubble/bubbleUxTest";
import InsertionReplayScreen from "./screens/InsertionReplayScreen";
import MergeReplayScreen from "./screens/MergeReplayScreen";
import MergeTutorialScreen from "./screens/MergeTutorialScreen";
import MergeGameScreen, {
  type MergePracticeCompleteData,
} from "./screens/MergeGameScreen";
import QuickGameScreen, {
  type QuickPracticeCompleteData,
} from "./screens/QuickGameScreen";
import { generateMergePracticeArray } from "./game/sorting/merge/mergeConstraints";
import { generateQuickPracticeArray } from "./game/sorting/quick/quickConstraints";
import type { MergeElement, MergeStepRecord } from "./game/sorting/merge";
import type { QuickElement, QuickStepRecord } from "./game/sorting/quick/types";
import type { ProtocolId } from "./screens/protocolCatalog";
import type { DemonstrationProtocol } from "./game/demonstration";
import { PhaseResult } from "./game/campaign/campaignSummary";
import {
  loadGameProgress,
  recordExerciseCompletion,
  recordTutorialCompletion,
  isChallengeModeUnlocked,
  isModuleTutorialCompleted,
  isExerciseSetCompleted,
  getInitialSessionRoute,
  BUBBLE_EXERCISE_SETS,
  SELECTION_EXERCISE_SETS,
  INSERTION_EXERCISE_SETS,
  MERGE_EXERCISE_SETS,
  QUICK_EXERCISE_SETS,
  type GameSaveSchema,
  type ModuleId,
  type ModuleProgressV4,
} from "./game/persistence";
import {
  CHALLENGE_SCENARIOS,
  type BubbleSortVariant,
} from "./game/sorting";
import {
  generateBubblePhaseArray,
  BUBBLE_CAMPAIGN_PHASE_LENGTHS,
  type SeedInput,
} from "./game/generation";
import {
  generateSelectionPhaseArray,
  type SelectionStepRecord,
} from "./game/sorting/selection";
import {
  generateInsertionPracticeArray,
  getNextInsertionPracticeLevel,
  type InsertionPracticeDefinition,
  type InsertionPracticeLevel,
  type InsertionStepRecord,
} from "./game/sorting/insertion";
import {
  type PracticeLevel,
  type ActivityContext,
  type AlgorithmCaseDefinition,
} from "./game/curriculum";
import { getBriefingForMode, type BriefingModeId } from "./game/briefing";
import type { PhaseCompleteData } from "./screens/GameScreen";
import type { StepRecord } from "./game/sorting/types";

type Screen =
  | "home"
  | "tutorial"
  | "selection-tutorial"
  | "insertion-tutorial"
  | "merge-tutorial"
  | "briefing"
  | "practice-selector"
  | "game"
  | "selection-game"
  | "insertion-practice"
  | "merge-practice"
  | "quick-practice"
  | "result"
  | "replay"
  | "demonstration"
  | "campaign-complete"
  | "selection-campaign-complete"
  | "insertion-practice-complete"
  | "merge-practice-complete"
  | "quick-practice-complete";

type GameMode = "CAMPAIGN" | "CHALLENGE" | "SELECTION" | "INSERTION" | "MERGE" | "QUICK";

const TOTAL_PHASES = BUBBLE_CAMPAIGN_PHASE_LENGTHS.length;
const SELECTION_TOTAL_PHASES = 3;

export interface BaseGameResult {
  comparisons: number;
  swaps: number;
  errors: number;
  hintsUsed: number;
  finalArray: readonly number[];
  initialArray: readonly number[];
  score: number;
  elapsedTimeMs: number;
  seed?: SeedInput;
}

export interface BubbleGameResult extends BaseGameResult {
  protocol: "bubble";
  history: readonly StepRecord[];
  variant?: BubbleSortVariant;
  earlyExitTriggered?: boolean;
  terminationPass?: number;
}

export interface SelectionGameResult extends BaseGameResult {
  protocol: "selection";
  phase: number;
  history: readonly SelectionStepRecord[];
}

export interface InsertionGameResult extends BaseGameResult {
  protocol: "insertion";
  level: InsertionPracticeLevel;
  shifts: number;
  insertions: number;
  history: readonly InsertionStepRecord[];
  practiceDefinition: InsertionPracticeDefinition;
}

export interface MergeGameResult extends BaseGameResult {
  protocol: "merge";
  level: PracticeLevel;
  writesInBuffer: number;
  writesInMain: number;
  totalWrites: number;
  practiceTitle: string;
  initialElements: readonly MergeElement[];
  history: readonly MergeStepRecord[];
}

export interface QuickGameResult extends BaseGameResult {
  protocol: "quick";
  level: PracticeLevel;
  writesInArray: number;
  practiceTitle: string;
  initialElements: readonly QuickElement[];
  history: readonly QuickStepRecord[];
}

export type GameResult =
  | BubbleGameResult
  | SelectionGameResult
  | InsertionGameResult
  | MergeGameResult
  | QuickGameResult;

export interface AppProps {
  initialScreen?: Screen;
  initialModule?: ModuleId;
  initialLevel?: PracticeLevel;
  initialDemonstrationProtocol?: DemonstrationProtocol;
}

export default function App({
  initialScreen,
  initialModule,
  initialLevel,
  initialDemonstrationProtocol,
}: AppProps = {}) {
  const isDev = Boolean(import.meta.env?.DEV);
  const [saveData, setSaveData] = useState<GameSaveSchema>(() =>
    loadGameProgress(undefined, TOTAL_PHASES, SELECTION_TOTAL_PHASES)
  );
  const [gameMode, setGameMode] = useState<GameMode>("CAMPAIGN");
  const [briefingModeId, setBriefingModeId] =
    useState<BriefingModeId>(() => {
      if (initialModule === "merge") return "merge-canonical";
      if (initialModule === "selection") return "selection-canonical";
      if (initialModule === "insertion") return "insertion-canonical";
      if (initialModule === "bubble") return "bubble-canonical";
      if (isDev && typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const mod = params.get("module");
        if (mod === "bubble") return "bubble-canonical";
        if (mod === "bubble-early-exit") return "bubble-early-exit";
        if (mod === "selection") return "selection-canonical";
        if (mod === "insertion") return "insertion-canonical";
        if (mod === "merge") return "merge-canonical";
      }
      return "bubble-canonical";
    });
  const [challengeScenarioIndex, setChallengeScenarioIndex] = useState<number>(0);

  const [screen, setScreen] = useState<Screen>(() => {
    if (initialScreen) return initialScreen;
    if (isDev && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("screen") === "briefing") {
        return "briefing";
      }
      if (params.get("screen") === "result") {
        return "result";
      }
      if (params.get("screen") === "quick-practice") {
        return "quick-practice";
      }
      if (params.get("screen") === "merge-practice") {
        return "merge-practice";
      }
      if (params.get("module") === "quick") {
        return "practice-selector";
      }
      if (params.get("module") === "merge") {
        return "practice-selector";
      }
    }
    return "home";
  });
  const [briefingReturnScreen, setBriefingReturnScreen] =
    useState<"home" | "campaign-complete">("home");

  // Estado do Modo Demonstração Educacional (P2.1-G-D / P2.2-E)
  const [demonstrationProtocol, setDemonstrationProtocol] =
    useState<DemonstrationProtocol>(() => initialDemonstrationProtocol ?? "bubble");
  const [demonstrationReturnScreen, setDemonstrationReturnScreen] =
    useState<"home" | "briefing">("home");

  // Estado da Campanha Bubble Sort
  const [phase, setPhase] = useState<number>(1);
  const [campaignArray, setCampaignArray] = useState<readonly number[]>(() =>
    generateBubblePhaseArray(1).values
  );
  const [campaignSeed, setCampaignSeed] = useState<SeedInput>(() => "");
  const [phaseResults, setPhaseResults] = useState<PhaseResult[]>([]);

  // Estado da Campanha Selection Sort (Persistência multi-protocolo Schema v3)
  const [selectionPhase, setSelectionPhase] = useState<number>(1);
  const [selectionArray, setSelectionArray] = useState<readonly number[]>(() =>
    generateSelectionPhaseArray(1).values
  );
  const [selectionSeed, setSelectionSeed] = useState<SeedInput>(() => "");
  const [selectionPhaseResults, setSelectionPhaseResults] = useState<PhaseResult[]>([]);

  // Estado da Prática do Insertion Sort (Sessão pura em memória, Schema v3 intocado)
  const [insertionLevel, setInsertionLevel] =
    useState<InsertionPracticeLevel>("basic");
  const [insertionArray, setInsertionArray] = useState<readonly number[]>(() =>
    generateInsertionPracticeArray("basic").values
  );
  const [insertionSeed, setInsertionSeed] = useState<SeedInput>(() => "");
  const [insertionPracticeResults, setInsertionPracticeResults] = useState<
    InsertionPracticeCompleteData[]
  >([]);

  // Estado da Prática do Merge Sort (Sessão pura em memória P3.1-D)
  const [mergeLevel, setMergeLevel] = useState<PracticeLevel>(() => initialLevel ?? "basic");
  const [mergeArray, setMergeArray] = useState<readonly number[]>(() =>
    generateMergePracticeArray((initialLevel as any) ?? "basic").result.values
  );
  const [mergeSeed, setMergeSeed] = useState<SeedInput>(() => "");
  const [mergePracticeResults, setMergePracticeResults] = useState<
    MergePracticeCompleteData[]
  >([]);

  // Estado da Prática do Quick Sort (Sessão pura em memória P3.2-D)
  const [quickLevel, setQuickLevel] = useState<PracticeLevel>(() => {
    if (initialLevel) return initialLevel;
    if (isDev && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const lvl = params.get("level");
      if (lvl === "intermediate" || lvl === "advanced" || lvl === "basic") {
        return lvl;
      }
    }
    return "basic";
  });
  const [quickArray, setQuickArray] = useState<readonly number[]>(() => {
    let lvl: PracticeLevel = "basic";
    if (initialLevel) {
      lvl = initialLevel;
    } else if (isDev && typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("level");
      if (p === "intermediate" || p === "advanced" || p === "basic") {
        lvl = p;
      }
    }
    return generateQuickPracticeArray(lvl).result.values;
  });
  const [quickSeed, setQuickSeed] = useState<SeedInput>(() => "");
  const [quickPracticeResults, setQuickPracticeResults] = useState<
    QuickPracticeCompleteData[]
  >([]);
  const [quickSessionSave, setQuickSessionSave] = useState<ModuleProgressV4>({
    completedTutorial: false,
    exerciseSets: {},
  });

  // Resultado unificado
  const [result, setResult] = useState<GameResult | null>(() => {
    if (isDev && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("screen") === "result" && params.get("module") === "quick") {
        return {
          protocol: "quick",
          level: "basic",
          practiceTitle: "PRÁTICA BÁSICA",
          initialArray: [24, 67, 74, 21],
          finalArray: [21, 24, 67, 74],
          comparisons: 4,
          swaps: 2,
          writesInArray: 4,
          errors: 0,
          hintsUsed: 0,
          score: 100,
          elapsedTimeMs: 14200,
          history: [],
          initialElements: [],
        } as any;
      }
    }
    return null;
  });

  // Módulo ativo no Seletor de Práticas
  const [selectorModule, setSelectorModule] = useState<ModuleId>(() => {
    if (initialModule) return initialModule;
    if (isDev && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("module") === "quick") {
        return "quick";
      }
      if (params.get("module") === "merge") {
        return "merge";
      }
    }
    return "bubble";
  });

  // Contexto Curricular da Atividade Ativa (LEARNING-R3-A: Prática Regular vs Caso do Algoritmo)
  const [activeActivityContext, setActiveActivityContext] =
    useState<ActivityContext | null>(null);

  // Sessão efêmera em memória para Teste de UX (?uxTest=1)
  const [bubbleUxSession, setBubbleUxSession] = useState<BubbleUxTestSession | null>(null);

  const isChallengeUnlocked = isChallengeModeUnlocked(saveData, TOTAL_PHASES);

  const handleOpenPracticeSelector = (modId: ModuleId) => {
    setSelectorModule(modId);
    setScreen("practice-selector");
  };

  const handleStartMergePractice = (lvl: PracticeLevel = "basic") => {
    const gen = generateMergePracticeArray(lvl as any);
    setMergeArray(gen.result.values);
    setMergeSeed(gen.result.seed);
    setMergeLevel(lvl);
    setResult(null);
    setScreen("merge-practice");
  };

  const handleMergeComplete = (data: MergePracticeCompleteData) => {
    setResult({
      protocol: "merge",
      level: data.level,
      comparisons: data.comparisons,
      writesInBuffer: data.writesInBuffer,
      writesInMain: data.writesInMain,
      totalWrites: data.totalWrites,
      swaps: 0,
      errors: data.errors,
      hintsUsed: data.hintsUsed,
      finalArray: data.finalArray,
      initialArray: data.initialArray,
      initialElements: data.initialElements,
      history: data.history,
      score: data.score,
      elapsedTimeMs: data.elapsedTimeMs,
      practiceTitle: data.practiceTitle,
      seed: mergeSeed,
    });

    setMergePracticeResults((prev) => {
      const idx = prev.findIndex((p) => p.level === data.level);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = data;
        return copy;
      }
      return [...prev, data];
    });

    const exerciseSetId =
      data.level === "basic"
        ? MERGE_EXERCISE_SETS.BASIC
        : data.level === "intermediate"
          ? MERGE_EXERCISE_SETS.INTERMEDIATE
          : MERGE_EXERCISE_SETS.ADVANCED;

    const updated = recordExerciseCompletion(
      saveData,
      "merge",
      exerciseSetId,
      {
        score: data.score,
        errors: data.errors,
        hintsUsed: data.hintsUsed,
        elapsedTimeMs: data.elapsedTimeMs,
      }
    );
    setSaveData(updated);

    setScreen("result");
  };

  const handleStartQuickPractice = (lvl: PracticeLevel = "basic") => {
    const gen = generateQuickPracticeArray(lvl as any);
    setQuickArray(gen.result.values);
    setQuickSeed(gen.result.seed);
    setQuickLevel(lvl);
    setResult(null);
    setScreen("quick-practice");
  };

  const handleQuickComplete = (data: QuickPracticeCompleteData) => {
    setResult({
      protocol: "quick",
      level: data.level,
      comparisons: data.comparisons,
      swaps: data.swaps,
      writesInArray: data.writesInArray,
      errors: data.errors,
      hintsUsed: data.hintsUsed,
      finalArray: data.finalArray,
      initialArray: data.initialArray,
      initialElements: data.initialElements,
      history: data.history,
      score: data.score,
      elapsedTimeMs: data.elapsedTimeMs,
      practiceTitle: data.practiceTitle,
      seed: quickSeed,
    });

    setQuickPracticeResults((prev) => {
      const idx = prev.findIndex((p) => p.level === data.level);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = data;
        return copy;
      }
      return [...prev, data];
    });

    const exerciseSetId =
      data.level === "basic"
        ? QUICK_EXERCISE_SETS.BASIC
        : data.level === "intermediate"
          ? QUICK_EXERCISE_SETS.INTERMEDIATE
          : QUICK_EXERCISE_SETS.ADVANCED;

    // Atualização estritamente em memória de sessão (sem gravação de localStorage)
    setQuickSessionSave((prev) => {
      const prevSets = prev.exerciseSets;
      const prevRecord = prevSets[exerciseSetId]?.bestRecord;
      const bestScore = prevRecord
        ? Math.max(prevRecord.bestScore, data.score)
        : data.score;
      const minErrors = prevRecord
        ? Math.min(prevRecord.bestScoreErrors, data.errors)
        : data.errors;
      const minHints = prevRecord
        ? Math.min(prevRecord.bestScoreHintsUsed, data.hintsUsed)
        : data.hintsUsed;
      const bestTimeMs = prevRecord?.bestScoreElapsedTimeMs
        ? Math.min(prevRecord.bestScoreElapsedTimeMs, data.elapsedTimeMs)
        : data.elapsedTimeMs;

      return {
        ...prev,
        exerciseSets: {
          ...prevSets,
          [exerciseSetId]: {
            completed: true,
            bestRecord: {
              completedAt: new Date().toISOString(),
              bestScore,
              bestScoreErrors: minErrors,
              bestScoreHintsUsed: minHints,
              bestScoreElapsedTimeMs: bestTimeMs,
            },
          },
        },
      };
    });

    setScreen("result");
  };

  const handleSelectPracticeLevel = (level: PracticeLevel) => {
    setActiveActivityContext({
      type: "practice",
      moduleId: selectorModule,
      level,
      practiceTitle:
        level === "basic"
          ? "PRÁTICA BÁSICA"
          : level === "intermediate"
            ? "PRÁTICA INTERMEDIÁRIA"
            : "PRÁTICA AVANÇADA",
    });

    const phaseNumber = level === "basic" ? 1 : level === "intermediate" ? 2 : 3;

    if (selectorModule === "bubble") {
      setGameMode("CAMPAIGN");
      setPhase(phaseNumber);
      const gen = generateBubblePhaseArray(phaseNumber);
      setCampaignArray(gen.values);
      setCampaignSeed(gen.seed);
      setResult(null);
      setScreen("game");
    } else if (selectorModule === "selection") {
      setGameMode("SELECTION");
      setSelectionPhase(phaseNumber);
      const gen = generateSelectionPhaseArray(phaseNumber);
      setSelectionArray(gen.values);
      setSelectionSeed(gen.seed);
      setResult(null);
      setScreen("selection-game");
    } else if (selectorModule === "insertion") {
      setGameMode("INSERTION");
      handleStartInsertionPractice(level);
    } else if (selectorModule === "merge") {
      setGameMode("MERGE");
      handleStartMergePractice(level);
    } else if (selectorModule === "quick") {
      setGameMode("QUICK");
      handleStartQuickPractice(level);
    }
  };

  const handleSelectCase = (caseDef: AlgorithmCaseDefinition) => {
    setActiveActivityContext({
      type: "case",
      moduleId: caseDef.moduleId,
      caseId: caseDef.id,
      caseDefinition: caseDef,
    });

    if (caseDef.moduleId === "bubble") {
      setGameMode("CAMPAIGN");
      setPhase(1);
      setCampaignArray([...caseDef.initialArray]);
      setCampaignSeed("");
      setResult(null);
      setScreen("game");
    } else if (caseDef.moduleId === "selection") {
      setGameMode("SELECTION");
      setSelectionPhase(1);
      setSelectionArray([...caseDef.initialArray]);
      setSelectionSeed("");
      setResult(null);
      setScreen("selection-game");
    } else if (caseDef.moduleId === "insertion") {
      setGameMode("INSERTION");
      setInsertionArray([...caseDef.initialArray]);
      setInsertionSeed("");
      setInsertionLevel("intermediate");
      setResult(null);
      setScreen("insertion-practice");
    }
  };

  // --------------------------------------------------------------------------
  // Conclusão de Fase do Bubble Sort
  // --------------------------------------------------------------------------
  const handleComplete = (data: PhaseCompleteData, uxTestSession?: BubbleUxTestSession) => {
    if (uxTestSession) {
      setBubbleUxSession(uxTestSession);
    }
    setResult({
      ...data,
      protocol: "bubble",
      seed: gameMode === "CAMPAIGN" ? campaignSeed : undefined,
    });

    if (activeActivityContext?.type === "case") {
      const caseId = activeActivityContext.caseDefinition.id;
      const updated = recordExerciseCompletion(
        saveData,
        "bubble",
        caseId,
        {
          score: data.score,
          errors: data.errors,
          hintsUsed: data.hintsUsed,
          elapsedTimeMs: data.elapsedTimeMs,
        }
      );
      setSaveData(updated);
      setScreen("result");
      return;
    }

    if (gameMode === "CAMPAIGN") {
      setPhaseResults((prev) => {
        const filtered = prev.filter((r) => r.phase !== phase);
        const practiceTitle =
          phase === 1
            ? "PRÁTICA BÁSICA"
            : phase === 2
              ? "PRÁTICA INTERMEDIÁRIA"
              : "PRÁTICA AVANÇADA";
        return [...filtered, { phase, practiceTitle, ...data }].sort(
          (a, b) => a.phase - b.phase
        );
      });

      const exerciseSetId =
        phase === 1
          ? BUBBLE_EXERCISE_SETS.BASIC
          : phase === 2
            ? BUBBLE_EXERCISE_SETS.INTERMEDIATE
            : BUBBLE_EXERCISE_SETS.ADVANCED;

      const updated = recordExerciseCompletion(
        saveData,
        "bubble",
        exerciseSetId,
        {
          score: data.score,
          errors: data.errors,
          hintsUsed: data.hintsUsed,
          elapsedTimeMs: data.elapsedTimeMs,
        }
      );
      setSaveData(updated);
    }

    setScreen("result");
  };

  // --------------------------------------------------------------------------
  // Conclusão de Fase do Selection Sort (Persistência Multi-Protocolo P2.1-F)
  // --------------------------------------------------------------------------
  const handleSelectionComplete = (data: SelectionPhaseCompleteData) => {
    setResult({
      ...data,
      protocol: "selection",
      phase: selectionPhase,
      seed: selectionSeed,
    });

    if (activeActivityContext?.type === "case") {
      const caseId = activeActivityContext.caseDefinition.id;
      const updated = recordExerciseCompletion(
        saveData,
        "selection",
        caseId,
        {
          score: data.score,
          errors: data.errors,
          hintsUsed: data.hintsUsed,
          elapsedTimeMs: data.elapsedTimeMs,
        }
      );
      setSaveData(updated);
      setScreen("result");
      return;
    }

    setSelectionPhaseResults((prev) => {
      const filtered = prev.filter((r) => r.phase !== selectionPhase);
      const practiceTitle =
        selectionPhase === 1
          ? "PRÁTICA BÁSICA"
          : selectionPhase === 2
            ? "PRÁTICA INTERMEDIÁRIA"
            : "PRÁTICA AVANÇADA";
      return [
        ...filtered,
        {
          phase: selectionPhase,
          practiceTitle,
          comparisons: data.comparisons,
          swaps: data.swaps,
          errors: data.errors,
          hintsUsed: data.hintsUsed,
          finalArray: data.finalArray,
          score: data.score,
          elapsedTimeMs: data.elapsedTimeMs,
        },
      ].sort((a, b) => a.phase - b.phase);
    });

    const exerciseSetId =
      selectionPhase === 1
        ? SELECTION_EXERCISE_SETS.BASIC
        : selectionPhase === 2
          ? SELECTION_EXERCISE_SETS.INTERMEDIATE
          : SELECTION_EXERCISE_SETS.ADVANCED;

    const updated = recordExerciseCompletion(
      saveData,
      "selection",
      exerciseSetId,
      {
        score: data.score,
        errors: data.errors,
        hintsUsed: data.hintsUsed,
        elapsedTimeMs: data.elapsedTimeMs,
      }
    );
    setSaveData(updated);

    setScreen("result");
  };

  const handleTutorialUnderstood = () => {
    const updated = recordTutorialCompletion(
      saveData,
      "bubble",
      undefined,
      TOTAL_PHASES
    );
    setSaveData(updated);
    setSelectorModule("bubble");
    handleSelectPracticeLevel("basic");
  };

  const handleSelectionTutorialComplete = () => {
    const updated = recordTutorialCompletion(
      saveData,
      "selection",
      undefined,
      SELECTION_TOTAL_PHASES
    );
    setSaveData(updated);
    setSelectorModule("selection");
    handleSelectPracticeLevel("basic");
  };


  // --------------------------------------------------------------------------
  // Conclusão e Navegação de Práticas do Insertion Sort (Sessão Pura)
  // --------------------------------------------------------------------------
  const handleStartInsertionPractice = (lvl: InsertionPracticeLevel = "basic") => {
    const gen = generateInsertionPracticeArray(lvl);
    setInsertionArray(gen.values);
    setInsertionSeed(gen.seed);
    setInsertionLevel(lvl);
    setResult(null);
    setScreen("insertion-practice");
  };

  const handleSelectInsertion = () => {
    setGameMode("INSERTION");
    setBriefingModeId("insertion-canonical");
    setBriefingReturnScreen("home");
    setScreen("briefing");
  };

  const handleInsertionComplete = (data: InsertionPracticeCompleteData) => {
    setResult({
      protocol: "insertion",
      level: data.level,
      comparisons: data.comparisons,
      shifts: data.shifts,
      insertions: data.insertions,
      swaps: 0,
      errors: data.errors,
      hintsUsed: data.hintsUsed,
      finalArray: data.finalArray,
      initialArray: data.initialArray,
      score: data.score,
      elapsedTimeMs: data.elapsedTimeMs,
      history: data.history,
      practiceDefinition: data.practiceDefinition,
      seed: data.seed,
    });

    setInsertionPracticeResults((prev) => {
      const idx = prev.findIndex((p) => p.level === data.level);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = data;
        return copy;
      }
      return [...prev, data];
    });

    if (activeActivityContext?.type === "case") {
      const caseId = activeActivityContext.caseDefinition.id;
      const updated = recordExerciseCompletion(
        saveData,
        "insertion",
        caseId,
        {
          score: data.score,
          errors: data.errors,
          hintsUsed: data.hintsUsed,
          elapsedTimeMs: data.elapsedTimeMs,
        }
      );
      setSaveData(updated);
      setScreen("result");
      return;
    }

    const exerciseSetId =
      data.level === "basic"
        ? INSERTION_EXERCISE_SETS.BASIC
        : data.level === "intermediate"
          ? INSERTION_EXERCISE_SETS.INTERMEDIATE
          : INSERTION_EXERCISE_SETS.ADVANCED;

    const updated = recordExerciseCompletion(
      saveData,
      "insertion",
      exerciseSetId,
      {
        score: data.score,
        errors: data.errors,
        hintsUsed: data.hintsUsed,
        elapsedTimeMs: data.elapsedTimeMs,
      }
    );
    setSaveData(updated);

    setScreen("result");
  };

  const handleInsertionTutorialComplete = () => {
    const updated = recordTutorialCompletion(saveData, "insertion");
    setSaveData(updated);
    handleStartInsertionPractice("basic");
  };

  const handleMergeTutorialComplete = () => {
    const updated = recordTutorialCompletion(saveData, "merge", undefined, 3);
    setSaveData(updated);
    setSelectorModule("merge");
    handleStartMergePractice("basic");
  };

  const handleNextPhase = () => {
    // Fluxo Quick Sort
    if (result?.protocol === "quick") {
      const nextLevel: PracticeLevel | null =
        result.level === "basic"
          ? "intermediate"
          : result.level === "intermediate"
            ? "advanced"
            : null;

      if (nextLevel !== null) {
        handleStartQuickPractice(nextLevel);
      } else {
        setResult(null);
        handleOpenPracticeSelector("quick");
      }
      return;
    }

    // Fluxo Merge Sort
    if (result?.protocol === "merge") {
      const nextLevel: PracticeLevel | null =
        result.level === "basic"
          ? "intermediate"
          : result.level === "intermediate"
            ? "advanced"
            : null;

      if (nextLevel !== null) {
        handleStartMergePractice(nextLevel);
      } else {
        setResult(null);
        setScreen("merge-practice-complete");
      }
      return;
    }

    // Fluxo Insertion Sort
    if (result?.protocol === "insertion") {
      const nextLevel = getNextInsertionPracticeLevel(result.level);
      if (nextLevel !== null) {
        const gen = generateInsertionPracticeArray(nextLevel);
        setInsertionArray(gen.values);
        setInsertionSeed(gen.seed);
        setInsertionLevel(nextLevel);
        setResult(null);
        setScreen("insertion-practice");
      } else {
        setResult(null);
        setScreen("insertion-practice-complete");
      }
      return;
    }

    // Fluxo Selection Sort
    if (result?.protocol === "selection") {
      if (selectionPhase < SELECTION_TOTAL_PHASES) {
        const nextPhase = selectionPhase + 1;
        const gen = generateSelectionPhaseArray(nextPhase);
        setSelectionArray(gen.values);
        setSelectionSeed(gen.seed);
        setSelectionPhase(nextPhase);
        setResult(null);
        setScreen("selection-game");
      } else {
        setResult(null);
        setScreen("selection-campaign-complete");
      }
      return;
    }

    // Fluxo Challenge
    if (gameMode === "CHALLENGE") {
      if (challengeScenarioIndex < CHALLENGE_SCENARIOS.length - 1) {
        setChallengeScenarioIndex((prev) => prev + 1);
        setResult(null);
        setScreen("game");
      } else {
        setResult(null);
        setScreen("home");
      }
      return;
    }

    // Fluxo Bubble Campaign
    if (phase < TOTAL_PHASES) {
      const nextPhase = phase + 1;
      const gen = generateBubblePhaseArray(nextPhase);
      setCampaignArray(gen.values);
      setCampaignSeed(gen.seed);
      setPhase(nextPhase);
      setResult(null);
      setScreen("game");
    } else {
      setResult(null);
      setScreen("campaign-complete");
    }
  };

  const handleRepeat = () => {
    if (activeActivityContext?.type === "case") {
      const caseDef = activeActivityContext.caseDefinition;
      if (caseDef.moduleId === "bubble") {
        setCampaignArray([...caseDef.initialArray]);
        setCampaignSeed("");
        setResult(null);
        setScreen("game");
        return;
      }
      if (caseDef.moduleId === "selection") {
        setSelectionArray([...caseDef.initialArray]);
        setSelectionSeed("");
        setResult(null);
        setScreen("selection-game");
        return;
      }
      if (caseDef.moduleId === "insertion") {
        setInsertionArray([...caseDef.initialArray]);
        setInsertionSeed("");
        setResult(null);
        setScreen("insertion-practice");
        return;
      }
    }

    // Mantém estritamente o MESMO vetor e a MESMA seed da rodada
    if (result?.protocol === "quick") {
      setResult(null);
      setScreen("quick-practice");
      return;
    }

    if (result?.protocol === "merge") {
      setResult(null);
      setScreen("merge-practice");
      return;
    }

    if (result?.protocol === "insertion") {
      setResult(null);
      setScreen("insertion-practice");
      return;
    }

    if (result?.protocol === "selection") {
      setResult(null);
      setScreen("selection-game");
      return;
    }

    setResult(null);
    setScreen("game");
  };

  const handleSelectCampaign = () => {
    setGameMode("CAMPAIGN");
    setBriefingModeId("bubble-canonical");
    setBriefingReturnScreen("home");
    setScreen("briefing");
  };

  const handleSelectChallenge = (source: "home" | "campaign-complete" = "home") => {
    setGameMode("CHALLENGE");
    setBriefingModeId("bubble-early-exit");
    setChallengeScenarioIndex(0);
    setBriefingReturnScreen(source);
    setScreen("briefing");
  };

  const handleSelectSelection = () => {
    setGameMode("SELECTION");
    setBriefingModeId("selection-canonical");
    setBriefingReturnScreen("home");
    setScreen("briefing");
  };

  const handleSelectMerge = () => {
    setGameMode("MERGE");
    setBriefingModeId("merge-canonical");
    setBriefingReturnScreen("home");
    setScreen("briefing");
  };

  const handleBriefingStart = () => {
    if (briefingModeId === "merge-canonical") {
      if (!isModuleTutorialCompleted(saveData, "merge")) {
        setScreen("merge-tutorial");
      } else {
        handleOpenPracticeSelector("merge");
      }
      return;
    }

    if (briefingModeId === "insertion-canonical") {
      if (!isModuleTutorialCompleted(saveData, "insertion")) {
        setScreen("insertion-tutorial");
      } else {
        handleOpenPracticeSelector("insertion");
      }
      return;
    }

    if (briefingModeId === "selection-canonical") {
      if (!isModuleTutorialCompleted(saveData, "selection")) {
        setScreen("selection-tutorial");
      } else {
        handleOpenPracticeSelector("selection");
      }
      return;
    }

    if (gameMode === "CAMPAIGN") {
      if (!isModuleTutorialCompleted(saveData, "bubble")) {
        setScreen("tutorial");
      } else {
        handleOpenPracticeSelector("bubble");
      }
      return;
    }

    setChallengeScenarioIndex(0);
    setResult(null);
    setScreen("game");
  };

  const handleReturnHome = () => {
    setActiveActivityContext(null);
    setGameMode("CAMPAIGN");
    setBriefingModeId("bubble-canonical");
    setScreen("home");
    setPhase(1);
    setSelectionPhase(1);
    setInsertionLevel("basic");
    setMergeLevel("basic");
    setResult(null);
    setPhaseResults([]);
    setSelectionPhaseResults([]);
    setInsertionPracticeResults([]);
    setMergePracticeResults([]);
  };

  const handleRestartProtocol = () => {
    setPhase(1);
    const gen = generateBubblePhaseArray(1);
    setCampaignArray(gen.values);
    setCampaignSeed(gen.seed);
    setPhaseResults([]);
    setResult(null);
    setScreen("game");
  };

  const handleRestartSelection = () => {
    setSelectionPhase(1);
    const gen = generateSelectionPhaseArray(1);
    setSelectionArray(gen.values);
    setSelectionSeed(gen.seed);
    setSelectionPhaseResults([]);
    setResult(null);
    setScreen("selection-game");
  };

  const handleOpenDemonstration = (
    protocolId: ProtocolId,
    origin: "home" | "briefing"
  ) => {
    setDemonstrationProtocol(protocolId);
    setDemonstrationReturnScreen(origin);
    setScreen("demonstration");
  };

  const handleDemonstrationBack = () => {
    setScreen(demonstrationReturnScreen);
  };

  const handleDemonstrationStartTraining = () => {
    if (demonstrationProtocol === "bubble") {
      handleSelectCampaign();
    } else if (demonstrationProtocol === "selection") {
      handleSelectSelection();
    } else if (demonstrationProtocol === "insertion") {
      if (!isModuleTutorialCompleted(saveData, "insertion")) {
        setScreen("insertion-tutorial");
      } else {
        const startLevel = !isExerciseSetCompleted(
          saveData,
          "insertion",
          INSERTION_EXERCISE_SETS.BASIC
        )
          ? "basic"
          : !isExerciseSetCompleted(
              saveData,
              "insertion",
              INSERTION_EXERCISE_SETS.INTERMEDIATE
            )
            ? "intermediate"
            : "advanced";
        handleStartInsertionPractice(startLevel);
      }
    } else if (demonstrationProtocol === "merge") {
      if (!isModuleTutorialCompleted(saveData, "merge")) {
        setScreen("merge-tutorial");
      } else {
        const startLevel: PracticeLevel = !isExerciseSetCompleted(
          saveData,
          "merge",
          MERGE_EXERCISE_SETS.BASIC
        )
          ? "basic"
          : !isExerciseSetCompleted(
              saveData,
              "merge",
              MERGE_EXERCISE_SETS.INTERMEDIATE
            )
            ? "intermediate"
            : "advanced";
        handleStartMergePractice(startLevel);
      }
    }
  };

  const activeScenario = CHALLENGE_SCENARIOS[challengeScenarioIndex];
  const currentArray =
    gameMode === "CHALLENGE"
      ? [...activeScenario.array]
      : campaignArray;
  const currentPhase =
    result?.protocol === "selection"
      ? selectionPhase
      : gameMode === "CHALLENGE"
        ? challengeScenarioIndex + 1
        : phase;
  const currentTotalPhases =
    result?.protocol === "selection"
      ? SELECTION_TOTAL_PHASES
      : gameMode === "CHALLENGE"
        ? CHALLENGE_SCENARIOS.length
        : TOTAL_PHASES;
  const hasNextPhase =
    result?.protocol === "quick"
      ? result.level !== "advanced"
      : result?.protocol === "merge"
        ? result.level !== "advanced"
        : result?.protocol === "insertion"
          ? getNextInsertionPracticeLevel(result.level) !== null
          : result?.protocol === "selection"
            ? selectionPhase < SELECTION_TOTAL_PHASES
            : gameMode === "CHALLENGE"
              ? challengeScenarioIndex < CHALLENGE_SCENARIOS.length - 1
              : phase < TOTAL_PHASES;
  const canonicalComparisons =
    (currentArray.length * (currentArray.length - 1)) / 2;
  const activeVariant: BubbleSortVariant =
    gameMode === "CHALLENGE" ? "EARLY_EXIT" : "CANONICAL";

  return (
    <div className="w-full h-full min-h-screen overflow-x-hidden">
      {screen === "home" && (
        <HomeScreen
          saveData={saveData}
          onStartProtocol={(protocolId) => {
            if (protocolId === "bubble") {
              handleSelectCampaign();
            } else if (protocolId === "selection") {
              handleSelectSelection();
            } else if (protocolId === "insertion") {
              handleSelectInsertion();
            } else if (protocolId === "merge") {
              handleSelectMerge();
            }
          }}
          onOpenTutorial={(protocolId) => {
            if (protocolId === "bubble") {
              setScreen("tutorial");
            } else if (protocolId === "selection") {
              setScreen("selection-tutorial");
            } else if (protocolId === "insertion") {
              setScreen("insertion-tutorial");
            } else if (protocolId === "merge") {
              setScreen("merge-tutorial");
            }
          }}
          onOpenDemonstration={(protocolId) =>
            handleOpenDemonstration(protocolId, "home")
          }
          isChallengeUnlocked={isChallengeUnlocked}
          onStartChallenge={() => handleSelectChallenge("home")}
          onStart={handleSelectCampaign}
          onHowToPlay={() => setScreen("tutorial")}
          onStartSelection={handleSelectSelection}
        />
      )}
      {screen === "briefing" && (
        briefingModeId === "bubble-canonical" ? (
          <BubbleModuleOverviewV2
            onStartTutorial={() => setScreen("tutorial")}
            onStartPractice={() => handleOpenPracticeSelector("bubble")}
            onOpenDemonstration={() =>
              handleOpenDemonstration("bubble", "briefing")
            }
            onBack={() => setScreen(briefingReturnScreen)}
          />
        ) : briefingModeId === "insertion-canonical" ? (
          <InsertionModuleOverviewV2
            onStartTutorial={() => setScreen("insertion-tutorial")}
            onStartPractice={() => handleOpenPracticeSelector("insertion")}
            onOpenDemonstration={() =>
              handleOpenDemonstration("insertion", "briefing")
            }
            onBack={() => setScreen(briefingReturnScreen)}
          />
        ) : briefingModeId === "selection-canonical" ? (
          <SelectionModuleOverviewV2
            onStartTutorial={() => setScreen("selection-tutorial")}
            onStartPractice={() => handleOpenPracticeSelector("selection")}
            onOpenDemonstration={() =>
              handleOpenDemonstration("selection", "briefing")
            }
            onBack={() => setScreen(briefingReturnScreen)}
          />
        ) : (
          <ProtocolModeBriefingScreen
            briefing={getBriefingForMode(briefingModeId)}
            onStart={handleBriefingStart}
            onBack={() => setScreen(briefingReturnScreen)}
            onOpenDemonstration={() =>
              handleOpenDemonstration(
                briefingModeId === "merge-canonical" ? "merge" : "bubble",
                "briefing"
              )
            }
          />
        )
      )}
      {screen === "practice-selector" && (
        <PracticeSelector
          moduleId={selectorModule}
          saveData={
            selectorModule === "quick"
              ? ({
                  ...saveData,
                  modules: {
                    ...saveData.modules,
                    quick: quickSessionSave,
                  },
                } as GameSaveSchema)
              : saveData
          }
          onSelectPractice={handleSelectPracticeLevel}
          onSelectCase={handleSelectCase}
          onOpenTutorial={() => {
            if (selectorModule === "bubble") setScreen("tutorial");
            else if (selectorModule === "selection") setScreen("selection-tutorial");
            else if (selectorModule === "insertion") setScreen("insertion-tutorial");
            else if (selectorModule === "merge") setScreen("merge-tutorial");
          }}
          onOpenDemonstration={() =>
            handleOpenDemonstration(selectorModule as ProtocolId, "home")
          }
          onReturnHome={handleReturnHome}
          onStartChallenge={
            selectorModule === "bubble" ? () => handleSelectChallenge("home") : undefined
          }
        />
      )}
      {screen === "quick-practice" && (
        <QuickGameScreen
          key={`quick-practice-${quickLevel}-${quickSeed}`}
          level={quickLevel as any}
          initialArray={quickArray.length > 0 ? quickArray : undefined}
          seed={quickSeed}
          onComplete={handleQuickComplete}
          onBackToSelector={() => handleOpenPracticeSelector("quick")}
        />
      )}
      {screen === "tutorial" && (
        <TutorialScreen
          onUnderstood={handleTutorialUnderstood}
          onBack={() => setScreen("home")}
        />
      )}
      {screen === "selection-tutorial" && (
        <SelectionTutorialScreen
          onComplete={handleSelectionTutorialComplete}
          onBack={() => setScreen("home")}
        />
      )}
      {screen === "insertion-tutorial" && (
        <InsertionTutorialScreen
          onComplete={handleInsertionTutorialComplete}
          onBack={() => setScreen("home")}
        />
      )}
      {screen === "merge-tutorial" && (
        <MergeTutorialScreen
          onComplete={handleMergeTutorialComplete}
          onBack={() => setScreen("home")}
        />
      )}
      {screen === "selection-game" &&
        (activeActivityContext?.type !== "case" && selectionPhase === 1 ? (
          <SelectionGameScreenV2
            key={`selection-v2-phase-${selectionPhase}-${selectionSeed}`}
            initialArray={selectionArray}
            phase={selectionPhase}
            totalPhases={SELECTION_TOTAL_PHASES}
            seed={selectionSeed}
            practiceTitle="PRÁTICA BÁSICA"
            onBackToSelector={() => handleOpenPracticeSelector("selection")}
            onComplete={handleSelectionComplete}
          />
        ) : (
          <SelectionGameScreen
            key={`selection-${activeActivityContext?.type === "case" ? activeActivityContext.caseDefinition.id : `phase-${selectionPhase}-${selectionSeed}`}`}
            initialArray={selectionArray}
            phase={selectionPhase}
            totalPhases={SELECTION_TOTAL_PHASES}
            seed={selectionSeed}
            practiceTitle={
              activeActivityContext?.type === "case"
                ? activeActivityContext.caseDefinition.shortTitle
                : selectionPhase === 1
                  ? "PRÁTICA BÁSICA"
                  : selectionPhase === 2
                    ? "PRÁTICA INTERMEDIÁRIA"
                    : "PRÁTICA AVANÇADA"
            }
            supportProfile={
              activeActivityContext?.type === "case"
                ? "reduced"
                : selectionPhase === 1
                  ? "full"
                  : selectionPhase === 2
                    ? "reduced"
                    : "minimal"
            }
            onBackToSelector={() => handleOpenPracticeSelector("selection")}
            onComplete={handleSelectionComplete}
          />
        ))}
      {screen === "insertion-practice" &&
        (activeActivityContext?.type !== "case" && insertionLevel === "basic" ? (
          <InsertionGameScreenV2
            key={`insertion-v2-practice-${insertionLevel}-${insertionSeed}`}
            level={insertionLevel}
            initialArray={insertionArray}
            seed={insertionSeed}
            practiceTitle="PRÁTICA BÁSICA"
            onBackToHub={handleReturnHome}
            onComplete={handleInsertionComplete}
          />
        ) : (
          <InsertionGameScreen
            key={`insertion-${activeActivityContext?.type === "case" ? activeActivityContext.caseDefinition.id : `practice-${insertionLevel}-${insertionSeed}`}`}
            level={insertionLevel}
            initialArray={insertionArray}
            seed={insertionSeed}
            practiceTitle={
              activeActivityContext?.type === "case"
                ? activeActivityContext.caseDefinition.shortTitle
                : undefined
            }
            practiceObjective={
              activeActivityContext?.type === "case"
                ? activeActivityContext.caseDefinition.learningObjective
                : undefined
            }
            supportProfile={
              activeActivityContext?.type === "case"
                ? "reduced"
                : insertionLevel === "basic"
                  ? "full"
                  : insertionLevel === "intermediate"
                    ? "reduced"
                    : "minimal"
            }
            onComplete={handleInsertionComplete}
            onResetPractice={() => {}}
            onBackToHub={handleReturnHome}
          />
        ))}
      {screen === "merge-practice" && (
        <MergeGameScreen
          key={`merge-practice-${mergeLevel}-${mergeSeed}`}
          level={mergeLevel as any}
          initialArray={mergeArray}
          seed={mergeSeed}
          onComplete={handleMergeComplete}
          onBackToSelector={() => handleOpenPracticeSelector("merge")}
        />
      )}
      {screen === "game" && (
        gameMode === "CAMPAIGN" && activeActivityContext?.type !== "case" ? (
          <BubbleGameScreenV2
            key={`bubble-v2-phase-${phase}-${campaignSeed}`}
            initialArray={currentArray}
            phase={currentPhase}
            totalPhases={currentTotalPhases}
            practiceTitle={
              currentPhase === 1
                ? "Prática Básica"
                : currentPhase === 2
                  ? "Prática Intermediária"
                  : "Prática Avançada"
            }
            onComplete={handleComplete}
            onBackToSelector={() => handleOpenPracticeSelector("bubble")}
            uxTestSession={bubbleUxSession || undefined}
            onUxTestSessionUpdate={setBubbleUxSession}
          />
        ) : (
          <GameScreen
            key={`game-${activeActivityContext?.type === "case" ? activeActivityContext.caseDefinition.id : `${gameMode}-${currentPhase}-${gameMode === "CAMPAIGN" ? campaignSeed : ""}`}`}
            onComplete={handleComplete}
            initialArray={currentArray}
            phase={currentPhase}
            totalPhases={currentTotalPhases}
            variant={activeVariant}
            modeTitle={
              gameMode === "CHALLENGE"
                ? activeScenario.title
                : activeActivityContext?.type === "case"
                  ? activeActivityContext.caseDefinition.title
                  : undefined
            }
            practiceTitle={
              activeActivityContext?.type === "case"
                ? activeActivityContext.caseDefinition.shortTitle
                : gameMode === "CAMPAIGN"
                  ? currentPhase === 1
                    ? "PRÁTICA BÁSICA"
                    : currentPhase === 2
                      ? "PRÁTICA INTERMEDIÁRIA"
                      : "PRÁTICA AVANÇADA"
                  : undefined
            }
            supportProfile={
              activeActivityContext?.type === "case"
                ? "reduced"
                : gameMode === "CAMPAIGN"
                  ? currentPhase === 1
                    ? "full"
                    : currentPhase === 2
                      ? "reduced"
                      : "minimal"
                  : "minimal"
            }
            onBackToSelector={() => handleOpenPracticeSelector("bubble")}
          />
        )
      )}
      {screen === "result" && result && (
        <ResultScreen
          finalArray={result.finalArray}
          comparisons={result.comparisons}
          swaps={result.swaps}
          shifts={result.protocol === "insertion" ? result.shifts : undefined}
          insertions={result.protocol === "insertion" ? result.insertions : undefined}
          writesInBuffer={result.protocol === "merge" ? result.writesInBuffer : undefined}
          writesInMain={result.protocol === "merge" ? result.writesInMain : undefined}
          totalWrites={result.protocol === "merge" ? result.totalWrites : undefined}
          writesInArray={result.protocol === "quick" ? result.writesInArray : undefined}
          activityContext={activeActivityContext ?? undefined}
          caseDefinition={
            activeActivityContext?.type === "case"
              ? activeActivityContext.caseDefinition
              : undefined
          }
          caseReflection={
            activeActivityContext?.type === "case"
              ? activeActivityContext.caseDefinition.buildReflection({
                  comparisons: result.comparisons,
                  swaps: result.swaps,
                  shifts: result.protocol === "insertion" ? result.shifts : undefined,
                  insertions: result.protocol === "insertion" ? result.insertions : undefined,
                })
              : undefined
          }
          practiceTitle={
            activeActivityContext?.type === "case"
              ? activeActivityContext.caseDefinition.title
              : result.protocol === "quick"
                ? result.practiceTitle
                : result.protocol === "merge"
                ? result.practiceTitle
                : result.protocol === "insertion"
                  ? result.practiceDefinition.title
                  : result.protocol === "selection"
                    ? selectionPhase === 1
                      ? "PRÁTICA BÁSICA"
                      : selectionPhase === 2
                        ? "PRÁTICA INTERMEDIÁRIA"
                        : "PRÁTICA AVANÇADA"
                    : phase === 1
                      ? "PRÁTICA BÁSICA"
                      : phase === 2
                        ? "PRÁTICA INTERMEDIÁRIA"
                        : "PRÁTICA AVANÇADA"
          }
          errors={result.errors}
          hintsUsed={result.hintsUsed}
          score={result.score}
          elapsedTimeMs={result.elapsedTimeMs}
          phase={
            result.protocol === "quick"
              ? result.level === "basic"
                ? 1
                : result.level === "intermediate"
                  ? 2
                  : 3
              : currentPhase
          }
          hasNextPhase={hasNextPhase}
          protocol={result.protocol}
          onNext={handleNextPhase}
          onRepeat={handleRepeat}
          onOpenSelector={() =>
            handleOpenPracticeSelector(result.protocol as ModuleId)
          }
          onViewReplay={
            result.protocol === "quick"
              ? undefined
              : () => setScreen("replay")
          }
          variant={result.protocol === "bubble" ? (result.variant ?? activeVariant) : undefined}
          earlyExitTriggered={result.protocol === "bubble" ? result.earlyExitTriggered : undefined}
          terminationPass={result.protocol === "bubble" ? result.terminationPass : undefined}
          canonicalComparisons={canonicalComparisons}
          uxTestSession={bubbleUxSession || undefined}
          onUxTestSessionUpdate={setBubbleUxSession}
        />
      )}
      {screen === "replay" && result && (
        result.protocol === "selection" ? (
          <SelectionReplayScreen
            initialArray={result.initialArray}
            history={result.history}
            phase={currentPhase}
            onBackToResult={() => setScreen("result")}
          />
        ) : result.protocol === "bubble" ? (
          <ReplayScreen
            initialArray={result.initialArray}
            history={result.history}
            phase={currentPhase}
            variant={result.variant ?? activeVariant}
            earlyExitTriggered={result.earlyExitTriggered}
            onBackToResult={() => setScreen("result")}
          />
        ) : result.protocol === "insertion" ? (
          <InsertionReplayScreen
            initialArray={result.initialArray}
            history={result.history}
            practiceTitle={
              activeActivityContext?.type === "case"
                ? activeActivityContext.caseDefinition.title
                : result.practiceDefinition.title
            }
            onBackToResult={() => setScreen("result")}
          />
        ) : result.protocol === "merge" ? (
          <MergeReplayScreen
            initialElements={result.initialElements}
            history={result.history}
            practiceTitle={result.practiceTitle}
            onBackToResult={() => setScreen("result")}
          />
        ) : null
      )}
      {screen === "demonstration" && (
        <DemonstrationScreen
          protocol={demonstrationProtocol}
          onBack={handleDemonstrationBack}
          onStartTraining={handleDemonstrationStartTraining}
        />
      )}
      {screen === "campaign-complete" && (
        <CampaignCompleteScreen
          results={phaseResults}
          totalPhases={TOTAL_PHASES}
          saveData={saveData}
          onReturnHome={handleReturnHome}
          onRestartProtocol={handleRestartProtocol}
          onOpenSelector={() => handleOpenPracticeSelector("bubble")}
          onStartChallenge={isChallengeUnlocked ? () => handleSelectChallenge("campaign-complete") : undefined}
        />
      )}
      {screen === "selection-campaign-complete" && (
        <SelectionCampaignCompleteScreen
          results={selectionPhaseResults}
          totalPhases={SELECTION_TOTAL_PHASES}
          saveData={saveData}
          onReturnHome={handleReturnHome}
          onRestartProtocol={handleRestartSelection}
          onOpenSelector={() => handleOpenPracticeSelector("selection")}
        />
      )}
      {screen === "insertion-practice-complete" && (
        <PracticeSetCompleteScreen
          moduleId="insertion"
          saveData={saveData}
          practiceResults={insertionPracticeResults}
          onRepeatPractices={() => {
            setInsertionPracticeResults([]);
            handleStartInsertionPractice("basic");
          }}
          onOpenSelector={() => handleOpenPracticeSelector("insertion")}
          onReturnHome={handleReturnHome}
        />
      )}
      {screen === "merge-practice-complete" && (
        <PracticeSetCompleteScreen
          moduleId="merge"
          saveData={saveData}
          practiceResults={mergePracticeResults}
          onRepeatPractices={() => {
            setMergePracticeResults([]);
            handleStartMergePractice("basic");
          }}
          onOpenSelector={() => handleOpenPracticeSelector("merge")}
          onReturnHome={handleReturnHome}
        />
      )}
    </div>
  );
}
