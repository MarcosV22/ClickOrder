import { useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import TutorialScreen from "./screens/TutorialScreen";
import GameScreen from "./screens/GameScreen";
import ResultScreen from "./screens/ResultScreen";
import CampaignCompleteScreen from "./screens/CampaignCompleteScreen";
import ReplayScreen from "./screens/ReplayScreen";
import ProtocolModeBriefingScreen from "./screens/ProtocolModeBriefingScreen";
import SelectionTutorialScreen from "./screens/SelectionTutorialScreen";
import SelectionGameScreen, {
  type SelectionPhaseCompleteData,
} from "./screens/SelectionGameScreen";
import SelectionCampaignCompleteScreen from "./screens/SelectionCampaignCompleteScreen";
import { PhaseResult } from "./game/campaign/campaignSummary";
import {
  loadGameProgress,
  recordPhaseCompletion,
  recordTutorialCompletion,
  isChallengeModeUnlocked,
  getInitialSessionRoute,
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
import { getBriefingForMode, type BriefingModeId } from "./game/briefing";
import type { PhaseCompleteData } from "./screens/GameScreen";
import type { StepRecord } from "./game/sorting/types";

type Screen =
  | "home"
  | "tutorial"
  | "selection-tutorial"
  | "briefing"
  | "game"
  | "selection-game"
  | "result"
  | "replay"
  | "campaign-complete"
  | "selection-campaign-complete";

type GameMode = "CAMPAIGN" | "CHALLENGE" | "SELECTION";

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

export type GameResult = BubbleGameResult | SelectionGameResult;

export default function App() {
  const [saveData, setSaveData] = useState<GameSaveSchema>(() =>
    loadGameProgress(undefined, TOTAL_PHASES)
  );
  const [gameMode, setGameMode] = useState<GameMode>("CAMPAIGN");
  const [briefingModeId, setBriefingModeId] =
    useState<BriefingModeId>("bubble-canonical");
  const [challengeScenarioIndex, setChallengeScenarioIndex] = useState<number>(0);
  const [screen, setScreen] = useState<Screen>("home");
  const [briefingReturnScreen, setBriefingReturnScreen] =
    useState<"home" | "campaign-complete">("home");

  // Estado da Campanha Bubble Sort
  const [phase, setPhase] = useState<number>(1);
  const [campaignArray, setCampaignArray] = useState<readonly number[]>(() =>
    generateBubblePhaseArray(1).values
  );
  const [campaignSeed, setCampaignSeed] = useState<SeedInput>(() => "");
  const [phaseResults, setPhaseResults] = useState<PhaseResult[]>([]);

  // Estado da Campanha Selection Sort (Em memória na sessão, preservando Schema v2 intacto)
  const [hasCompletedSelectionTutorial, setHasCompletedSelectionTutorial] =
    useState<boolean>(false);
  const [selectionPhase, setSelectionPhase] = useState<number>(1);
  const [selectionArray, setSelectionArray] = useState<readonly number[]>(() =>
    generateSelectionPhaseArray(1).values
  );
  const [selectionSeed, setSelectionSeed] = useState<SeedInput>(() => "");
  const [selectionPhaseResults, setSelectionPhaseResults] = useState<PhaseResult[]>([]);

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
  // Conclusão de Fase do Selection Sort
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

    setScreen("result");
  };

  const handleTutorialUnderstood = () => {
    const updated = recordTutorialCompletion(
      saveData,
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
    setHasCompletedSelectionTutorial(true);
    const gen = generateSelectionPhaseArray(1);
    setSelectionArray(gen.values);
    setSelectionSeed(gen.seed);
    setSelectionPhase(1);
    setSelectionPhaseResults([]);
    setResult(null);
    setScreen("selection-game");
  };

  const handleNextPhase = () => {
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
    if (briefingModeId === "selection-canonical") {
      if (!hasCompletedSelectionTutorial) {
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
    setResult(null);
    setPhaseResults([]);
    setSelectionPhaseResults([]);
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
    result?.protocol === "selection"
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
          onStart={handleSelectCampaign}
          onHowToPlay={() => setScreen("tutorial")}
          isChallengeUnlocked={isChallengeUnlocked}
          onStartChallenge={() => handleSelectChallenge("home")}
          onStartSelection={handleSelectSelection}
        />
      )}
      {screen === "briefing" && (
        <ProtocolModeBriefingScreen
          briefing={getBriefingForMode(briefingModeId)}
          onStart={handleBriefingStart}
          onBack={() => setScreen(briefingReturnScreen)}
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
          errors={result.errors}
          hintsUsed={result.hintsUsed}
          score={result.score}
          elapsedTimeMs={result.elapsedTimeMs}
          phase={currentPhase}
          hasNextPhase={hasNextPhase}
          protocol={result.protocol}
          onNext={handleNextPhase}
          onRepeat={handleRepeat}
          onViewReplay={
            result.protocol === "bubble" ? () => setScreen("replay") : undefined
          }
          variant={result.protocol === "bubble" ? (result.variant ?? activeVariant) : undefined}
          earlyExitTriggered={result.protocol === "bubble" ? result.earlyExitTriggered : undefined}
          terminationPass={result.protocol === "bubble" ? result.terminationPass : undefined}
          canonicalComparisons={canonicalComparisons}
        />
      )}
      {screen === "replay" && result && result.protocol === "bubble" && (
        <ReplayScreen
          initialArray={result.initialArray}
          history={result.history}
          phase={currentPhase}
          variant={result.variant ?? activeVariant}
          earlyExitTriggered={result.earlyExitTriggered}
          onBackToResult={() => setScreen("result")}
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
    </div>
  );
}
