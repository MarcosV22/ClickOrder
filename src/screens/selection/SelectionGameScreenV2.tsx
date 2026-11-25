import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  createSelectionSortState,
  executeSelectionInspection,
  commitSelectionPass,
  getSelectionSortedIndices,
  calculateSelectionSortProgress,
  type SelectionSortState,
  type SelectionInspectionDecision,
} from "../../game/sorting/selection";
import { calculateProtocolScore } from "../../game/session";
import type { SeedInput } from "../../game/generation";
import type { SelectionPhaseCompleteData } from "../SelectionGameScreen";
import SelectionConveyorTrack from "./SelectionConveyorTrack";
import SelectionDecisionControls from "./SelectionDecisionControls";
import SelectionCommitCheckpoint from "./SelectionCommitCheckpoint";
import SelectionTechnicalDetails from "./SelectionTechnicalDetails";

export interface SelectionGameScreenV2Props {
  onComplete: (data: SelectionPhaseCompleteData) => void;
  initialArray?: readonly number[];
  phase?: number;
  totalPhases?: number;
  seed?: SeedInput;
  practiceTitle?: string;
  onBackToSelector?: () => void;
  onResetPhase?: () => void;
}

const DEFAULT_INITIAL_ARRAY = [4, 1, 3];

export default function SelectionGameScreenV2({
  onComplete,
  initialArray = DEFAULT_INITIAL_ARRAY,
  phase = 1,
  totalPhases = 3,
  seed = "",
  practiceTitle = "PRÁTICA BÁSICA",
  onBackToSelector,
  onResetPhase,
}: SelectionGameScreenV2Props) {
  const [gameState, setGameState] = useState<SelectionSortState>(() =>
    createSelectionSortState(initialArray)
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatingPair, setAnimatingPair] = useState<{
    target: number;
    min: number;
  } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [feedback, setFeedback] = useState<{
    text: string;
    type: "success" | "warning" | "info";
  } | null>(null);

  const startTimeRef = useRef<number>(Date.now());
  const hintsUsedRef = useRef<number>(0);
  const isActionLockedRef = useRef<boolean>(false);
  const completedCalledRef = useRef<boolean>(false);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current !== null) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  const sortedIndices = getSelectionSortedIndices(gameState);
  const progressPercent = calculateSelectionSortProgress(gameState);

  const triggerCompletion = useCallback(
    (finalState: SelectionSortState) => {
      if (completedCalledRef.current) return;
      completedCalledRef.current = true;

      const elapsedTimeMs = Math.max(0, Date.now() - startTimeRef.current);
      const score = calculateProtocolScore({
        errors: finalState.errors,
        hintsUsed: hintsUsedRef.current,
      });

      onComplete({
        protocol: "selection",
        phase,
        initialArray: [...finalState.initialValues],
        finalArray: [...finalState.currentValues],
        comparisons: finalState.comparisons,
        swaps: finalState.swaps,
        errors: finalState.errors,
        hintsUsed: hintsUsedRef.current,
        score,
        elapsedTimeMs,
        history: finalState.history,
        seed,
      });
    },
    [onComplete, phase, seed]
  );

  const handleInspectionDecision = (decision: SelectionInspectionDecision) => {
    if (isActionLockedRef.current || isAnimating || gameState.completed) return;
    if (gameState.phase !== "INSPECT") return;

    const scanVal = gameState.currentValues[gameState.j];
    const minVal = gameState.currentValues[gameState.minIndex];
    const result = executeSelectionInspection(gameState, decision);

    if (result.valid) {
      setGameState(result.state);
      setShowHint(false);

      if (decision === "SELECT_NEW_MIN") {
        setFeedback({
          text: `Correto! ${scanVal} é menor que ${minVal}. Marcador do menor atualizado para ${scanVal}. As caixas permanecem no lugar!`,
          type: "success",
        });
      } else {
        setFeedback({
          text: `Muito bem! ${scanVal} não é menor que ${minVal}. Menor mantido como ${minVal}. Nenhuma caixa se move!`,
          type: "success",
        });
      }
    } else {
      setGameState(result.state);
      if (decision === "SELECT_NEW_MIN") {
        setFeedback({
          text: `Atenção: ${scanVal} não é menor que ${minVal}. O menor continua sendo ${minVal}.`,
          type: "warning",
        });
      } else {
        setFeedback({
          text: `Atenção: ${scanVal} é menor que ${minVal}! Você deveria marcar ${scanVal} como novo menor.`,
          type: "warning",
        });
      }
    }
  };

  const handleCommitPass = () => {
    if (isActionLockedRef.current || isAnimating || gameState.completed) return;
    if (gameState.phase !== "COMMIT") return;

    const targetIdx = gameState.i;
    const minIdx = gameState.minIndex;
    const minVal = gameState.currentValues[minIdx];
    const targetVal = gameState.currentValues[targetIdx];

    const result = commitSelectionPass(gameState);

    if (result.valid) {
      setShowHint(false);
      if (result.didSwap) {
        isActionLockedRef.current = true;
        setIsAnimating(true);
        setAnimatingPair({ target: targetIdx, min: minIdx });
        setFeedback({
          text: `Excelente! Menor elemento (${minVal}) transferido para a ${targetIdx === 0 ? "primeira" : "próxima"} posição através de uma troca com ${targetVal}!`,
          type: "success",
        });

        animationTimeoutRef.current = setTimeout(() => {
          animationTimeoutRef.current = null;
          setGameState(result.state);
          setAnimatingPair(null);
          setIsAnimating(false);
          if (result.state.completed) {
            triggerCompletion(result.state);
          } else {
            isActionLockedRef.current = false;
          }
        }, 500);
      } else {
        setGameState(result.state);
        setFeedback({
          text: `Ótimo! O valor ${targetVal} já estava na posição correta e foi consolidado sem trocas.`,
          type: "success",
        });
        if (result.state.completed) {
          isActionLockedRef.current = true;
          animationTimeoutRef.current = setTimeout(() => {
            animationTimeoutRef.current = null;
            triggerCompletion(result.state);
          }, 350);
        }
      }
    } else {
      setFeedback({
        text: result.errorReason ?? "Ação inválida no momento.",
        type: "warning",
      });
    }
  };

  const handleToggleHint = () => {
    if (!showHint) {
      hintsUsedRef.current += 1;
      setHintsUsed(hintsUsedRef.current);
    }
    setShowHint((prev) => !prev);
  };

  const handleReset = () => {
    if (animationTimeoutRef.current !== null) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    if (onResetPhase) {
      onResetPhase();
    } else {
      setGameState(createSelectionSortState(initialArray));
      setIsAnimating(false);
      setAnimatingPair(null);
      setShowHint(false);
      isActionLockedRef.current = false;
      completedCalledRef.current = false;
      startTimeRef.current = Date.now();
      hintsUsedRef.current = 0;
      setHintsUsed(0);
      setFeedback(null);
    }
  };

  return (
    <div className="w-full min-h-screen overflow-x-clip bg-[#070b19] text-slate-100 flex flex-col items-center py-3 sm:py-4 pb-12 px-4 sm:px-6">
      {/* Top Header */}
      <header className="w-full max-w-4xl flex items-center justify-between pb-2.5 border-b border-purple-500/20 mb-3">
        <div className="flex items-center gap-3">
          {onBackToSelector && (
            <button
              type="button"
              data-testid="back-to-practices"
              onClick={onBackToSelector}
              aria-label="Voltar para a seleção de práticas"
              className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-400 hover:text-purple-300 font-mono transition-colors cursor-pointer px-1.5 py-1 rounded"
            >
              <span>←</span>
              <span>Práticas</span>
            </button>
          )}
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 font-semibold">
            Selection Sort • {practiceTitle}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-block text-xs font-mono text-slate-400">
            Passada{" "}
            <strong className="text-purple-300">
              {Math.min(gameState.i + 1, Math.max(1, gameState.arrayLength - 1))}
            </strong>{" "}
            de{" "}
            <strong className="text-slate-200">
              {Math.max(1, gameState.arrayLength - 1)}
            </strong>
          </span>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-slate-200 underline font-mono cursor-pointer"
          >
            Reiniciar
          </button>
        </div>
      </header>

      <main className="w-full max-w-4xl flex flex-col items-center gap-3.5">
        {/* Barra de Progresso Real */}
        <div className="w-full bg-slate-900/60 rounded-full h-1.5 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Esteira Visual com as Caixas */}
        <SelectionConveyorTrack
          gameState={gameState}
          sortedIndices={sortedIndices}
          animatingPair={animatingPair}
          isAnimating={isAnimating}
          showTechnicalDetails={showTechnicalDetails}
        />

        {/* Controles de Decisão (Estado INSPECT) */}
        {gameState.phase === "INSPECT" && !gameState.completed && (
          <SelectionDecisionControls
            gameState={gameState}
            onDecision={handleInspectionDecision}
            disabled={isAnimating}
            feedback={feedback}
            showHint={showHint}
            onToggleHint={handleToggleHint}
          />
        )}

        {/* Confirmação e Checkpoint (Estado COMMIT) */}
        {gameState.phase === "COMMIT" && !gameState.completed && (
          <SelectionCommitCheckpoint
            gameState={gameState}
            onCommit={handleCommitPass}
            disabled={isAnimating}
            requireCheckpoint={gameState.i === 0}
            feedback={feedback}
          />
        )}

        {/* Transição sutil sem exigir segunda confirmação (encaminha diretamente ao ResultScreen canônico) */}
        {gameState.completed && (
          <div
            role="status"
            aria-live="polite"
            className="w-full max-w-xl bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 text-center text-sm font-mono text-emerald-200"
          >
            ✓ Ordenação concluída! Carregando resultado oficial...
          </div>
        )}

        {/* Detalhes Técnicos em Nível 3 */}
        <SelectionTechnicalDetails
          gameState={gameState}
          onToggleOpen={setShowTechnicalDetails}
        />
      </main>
    </div>
  );
}
