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
import DemonstrationScreen from "./screens/DemonstrationScreen";
import InsertionReplayScreen from "./screens/InsertionReplayScreen";
import type { ProtocolId } from "./screens/protocolCatalog";
import type { DemonstrationProtocol } from "./game/demonstration";
import { PhaseResult } from "./game/campaign/campaignSummary";
import {
  loadGameProgress,
  recordPhaseCompletion,
  recordExerciseCompletion,
  recordTutorialCompletion,
  isChallengeModeUnlocked,
  isModuleTutorialCompleted,
  isExerciseSetCompleted,
  getInitialSessionRoute,
  INSERTION_EXERCISE_SETS,
  type GameSaveSchema,
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
import { getBriefingForMode, type BriefingModeId } from "./game/briefing";
import type { PhaseCompleteData } from "./screens/GameScreen";
import type { StepRecord } from "./game/sorting/types";

type Screen =
  | "home"
  | "tutorial"
  | "selection-tutorial"
  | "insertion-tutorial"
  | "briefing"
  | "game"
  | "selection-game"
  | "insertion-practice"
  | "result"
  | "replay"
  | "demonstration"
  | "campaign-complete"
  | "selection-campaign-complete"
  | "insertion-practice-complete";

type GameMode = "CAMPAIGN" | "CHALLENGE" | "SELECTION" | "INSERTION";

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

export type GameResult =
  | BubbleGameResult
  | SelectionGameResult
  | InsertionGameResult;


export default function App() {
  const [saveData, setSaveData] = useState<GameSaveSchema>(() =>
    loadGameProgress(undefined, TOTAL_PHASES, SELECTION_TOTAL_PHASES)
  );
  const [gameMode, setGameMode] = useState<GameMode>("CAMPAIGN");
  const [briefingModeId, setBriefingModeId] =
    useState<BriefingModeId>("bubble-canonical");
  const [challengeScenarioIndex, setChallengeScenarioIndex] = useState<number>(0);
  const [screen, setScreen] = useState<Screen>("home");
  const [briefingReturnScreen, setBriefingReturnScreen] =
    useState<"home" | "campaign-complete">("home");

  // Estado do Modo Demonstração Educacional (P2.1-G-D / P2.2-E)
  const [demonstrationProtocol, setDemonstrationProtocol] =
    useState<DemonstrationProtocol>("bubble");
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

  // Resultado unificado
  const [result, setResult] = useState<GameResult | null>(null);

  const isChallengeUnlocked = isChallengeModeUnlocked(saveData, TOTAL_PHASES);

  // --------------------------------------------------------------------------
  // Conclusão de Fase do Bubble Sort
  // --------------------------------------------------------------------------
  const handleComplete = (data: PhaseCompleteData) => {
    setResult({
      ...data,
      protocol: "bubble",
      seed: gameMode === "CAMPAIGN" ? campaignSeed : undefined,
    });

    if (gameMode === "CAMPAIGN") {
      setPhaseResults((prev) => {
        const filtered = prev.filter((r) => r.phase !== phase);
        return [...filtered, { phase, ...data }].sort(
          (a, b) => a.phase - b.phase
        );
      });

      const updated = recordPhaseCompletion(
        saveData,
        "bubble",
        phase,
        TOTAL_PHASES,
        undefined,
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

    setSelectionPhaseResults((prev) => {
      const filtered = prev.filter((r) => r.phase !== selectionPhase);
      return [
        ...filtered,
        {
          phase: selectionPhase,
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

    const updated = recordPhaseCompletion(
      saveData,
      "selection",
      selectionPhase,
      SELECTION_TOTAL_PHASES,
      undefined,
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
    const gen = generateBubblePhaseArray(1);
    setCampaignArray(gen.values);
    setCampaignSeed(gen.seed);
    setPhase(1);
    setResult(null);
    setPhaseResults([]);
    setScreen("game");
  };

  const handleSelectionTutorialComplete = () => {
    const updated = recordTutorialCompletion(
      saveData,
      "selection",
      undefined,
      SELECTION_TOTAL_PHASES
    );
    setSaveData(updated);
    const gen = generateSelectionPhaseArray(1);
    setSelectionArray(gen.values);
    setSelectionSeed(gen.seed);
    setSelectionPhase(1);
    setSelectionPhaseResults([]);
    setResult(null);
    setScreen("selection-game");
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

  const handleNextPhase = () => {
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
    // Mantém estritamente o MESMO vetor e a MESMA seed da rodada
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

  const handleBriefingStart = () => {
    if (briefingModeId === "insertion-canonical") {
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
      return;
    }

    if (briefingModeId === "selection-canonical") {
      if (!isModuleTutorialCompleted(saveData, "selection")) {
        setScreen("selection-tutorial");
      } else {
        const gen = generateSelectionPhaseArray(1);
        setSelectionArray(gen.values);
        setSelectionSeed(gen.seed);
        setSelectionPhase(1);
        setSelectionPhaseResults([]);
        setResult(null);
        setScreen("selection-game");
      }
      return;
    }

    if (gameMode === "CAMPAIGN") {
      // A geração procedural da seed e do lote só ocorre no momento do clique no CTA do briefing
      const gen = generateBubblePhaseArray(1);
      setCampaignArray(gen.values);
      setCampaignSeed(gen.seed);
      const route = getInitialSessionRoute(saveData);
      setPhase(route.phase);
      setPhaseResults([]);
      setResult(null);
      setScreen(route.screen);
    } else {
      setChallengeScenarioIndex(0);
      setResult(null);
      setScreen("game");
    }
  };

  const handleReturnHome = () => {
    setGameMode("CAMPAIGN");
    setBriefingModeId("bubble-canonical");
    setScreen("home");
    setPhase(1);
    setSelectionPhase(1);
    setInsertionLevel("basic");
    setResult(null);
    setPhaseResults([]);
    setSelectionPhaseResults([]);
    setInsertionPracticeResults([]);
  };

  const handleRestartProtocol = () => {
    setGameMode("CAMPAIGN");
    setBriefingModeId("bubble-canonical");
    setBriefingReturnScreen("campaign-complete");
    setScreen("briefing");
  };

  const handleRestartSelection = () => {
    const gen = generateSelectionPhaseArray(1);
    setSelectionArray(gen.values);
    setSelectionSeed(gen.seed);
    setSelectionPhase(1);
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
    result?.protocol === "insertion"
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
    <div className="w-full h-full overflow-hidden">
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
            }
          }}
          onOpenTutorial={(protocolId) => {
            if (protocolId === "bubble") {
              setScreen("tutorial");
            } else if (protocolId === "selection") {
              setScreen("selection-tutorial");
            } else if (protocolId === "insertion") {
              setScreen("insertion-tutorial");
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
        <ProtocolModeBriefingScreen
          briefing={getBriefingForMode(briefingModeId)}
          onStart={handleBriefingStart}
          onBack={() => setScreen(briefingReturnScreen)}
          onOpenDemonstration={() =>
            handleOpenDemonstration(
              briefingModeId === "insertion-canonical"
                ? "insertion"
                : briefingModeId === "selection-canonical"
                  ? "selection"
                  : "bubble",
              "briefing"
            )
          }
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
      {screen === "selection-game" && (
        <SelectionGameScreen
          key={`selection-phase-${selectionPhase}-${selectionSeed}`}
          initialArray={selectionArray}
          phase={selectionPhase}
          totalPhases={SELECTION_TOTAL_PHASES}
          seed={selectionSeed}
          onComplete={handleSelectionComplete}
        />
      )}
      {screen === "insertion-practice" && (
        <InsertionGameScreen
          key={`insertion-practice-${insertionLevel}-${insertionSeed}`}
          level={insertionLevel}
          initialArray={insertionArray}
          seed={insertionSeed}
          onComplete={handleInsertionComplete}
          onResetPractice={() => {}}
          onBackToHub={handleReturnHome}
        />
      )}
      {screen === "game" && (
        <GameScreen
          key={`${gameMode}-${currentPhase}-${gameMode === "CAMPAIGN" ? campaignSeed : ""}`}
          onComplete={handleComplete}
          initialArray={currentArray}
          phase={currentPhase}
          totalPhases={currentTotalPhases}
          variant={activeVariant}
          modeTitle={
            gameMode === "CHALLENGE"
              ? activeScenario.title
              : undefined
          }
        />
      )}
      {screen === "result" && result && (
        <ResultScreen
          finalArray={result.finalArray}
          comparisons={result.comparisons}
          swaps={result.swaps}
          shifts={result.protocol === "insertion" ? result.shifts : undefined}
          insertions={result.protocol === "insertion" ? result.insertions : undefined}
          practiceTitle={
            result.protocol === "insertion"
              ? result.practiceDefinition.title
              : undefined
          }
          errors={result.errors}
          hintsUsed={result.hintsUsed}
          score={result.score}
          elapsedTimeMs={result.elapsedTimeMs}
          phase={currentPhase}
          hasNextPhase={hasNextPhase}
          protocol={result.protocol}
          onNext={handleNextPhase}
          onRepeat={handleRepeat}
          onViewReplay={() => setScreen("replay")}
          variant={result.protocol === "bubble" ? (result.variant ?? activeVariant) : undefined}
          earlyExitTriggered={result.protocol === "bubble" ? result.earlyExitTriggered : undefined}
          terminationPass={result.protocol === "bubble" ? result.terminationPass : undefined}
          canonicalComparisons={canonicalComparisons}
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
            practiceTitle={result.practiceDefinition.title}
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
          onReturnHome={handleReturnHome}
          onRestartProtocol={handleRestartProtocol}
          onStartChallenge={isChallengeUnlocked ? () => handleSelectChallenge("campaign-complete") : undefined}
        />
      )}
      {screen === "selection-campaign-complete" && (
        <SelectionCampaignCompleteScreen
          results={selectionPhaseResults}
          totalPhases={SELECTION_TOTAL_PHASES}
          onReturnHome={handleReturnHome}
          onRestartProtocol={handleRestartSelection}
        />
      )}
      {screen === "insertion-practice-complete" && (
        <PracticeSetCompleteScreen
          practiceResults={insertionPracticeResults}
          onRepeatPractices={() => {
            setInsertionPracticeResults([]);
            handleStartInsertionPractice("basic");
          }}
          onReturnHome={handleReturnHome}
        />
      )}
    </div>
  );
}
