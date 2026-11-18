import React, { useState, useRef, useCallback } from "react";
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
  const [feedback, setFeedback] = useState<{
    text: string;
    type: "success" | "warning" | "info";
  } | null>({
    text: "Varredura iniciada! Observe a carga observada e compare com o menor guardado.",
    type: "info",
  });

  const startTimeRef = useRef<number>(Date.now());
  const hintsUsedRef = useRef<number>(0);
  const isActionLockedRef = useRef<boolean>(false);
  const completedCalledRef = useRef<boolean>(false);

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

        setTimeout(() => {
          setGameState(result.state);
          setAnimatingPair(null);
          setIsAnimating(false);
          isActionLockedRef.current = false;
        }, 500);
      } else {
        setGameState(result.state);
        setFeedback({
          text: `Ótimo! O valor ${targetVal} já estava na posição correta e foi consolidado sem trocas.`,
          type: "success",
        });
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
      setFeedback({
        text: "Prática reiniciada. Compare e decida com calma a cada passo.",
        type: "info",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#070b19] text-slate-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <header className="w-full max-w-4xl flex items-center justify-between pb-4 border-b border-purple-500/20 mb-6">
        <div className="flex items-center gap-3">
          {onBackToSelector && (
            <button
              type="button"
              onClick={onBackToSelector}
              className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-400 hover:text-purple-300 font-mono transition-colors cursor-pointer"
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
          <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-slate-400">
            <span>Comparações: <strong className="text-slate-200">{gameState.comparisons}</strong></span>
            <span>•</span>
            <span>Trocas: <strong className="text-slate-200">{gameState.swaps}</strong></span>
            {gameState.errors > 0 && (
              <>
                <span>•</span>
                <span className="text-rose-400 font-semibold">Erros: {gameState.errors}</span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-slate-200 underline font-mono cursor-pointer"
          >
            Reiniciar
          </button>
        </div>
      </header>

      <main className="w-full max-w-4xl flex flex-col items-center gap-6">
        {/* Barra de Progresso Real */}
        <div className="w-full bg-slate-900/60 rounded-full h-2 overflow-hidden border border-slate-800">
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

        {/* Card de Conclusão da Prática */}
        {gameState.completed && (
          <div className="w-full bg-[#0d1635]/95 border border-emerald-500/40 rounded-2xl p-6 sm:p-8 text-center flex flex-col items-center gap-5 shadow-2xl animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 text-2xl font-bold">
              ✓
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white">
                Prática Concluída com Sucesso!
              </h2>
              <p className="text-sm text-slate-300">
                Você ordenou o lote com precisão aplicando o modelo mental do Selection Sort.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg text-center font-mono">
              <div className="p-3 bg-[#080d22] border border-slate-800 rounded-xl">
                <span className="text-xs text-slate-400 block">Comparações</span>
                <span className="text-lg font-bold text-cyan-300">{gameState.comparisons}</span>
              </div>
              <div className="p-3 bg-[#080d22] border border-slate-800 rounded-xl">
                <span className="text-xs text-slate-400 block">Trocas</span>
                <span className="text-lg font-bold text-purple-300">{gameState.swaps}</span>
              </div>
              <div className="p-3 bg-[#080d22] border border-slate-800 rounded-xl">
                <span className="text-xs text-slate-400 block">Erros</span>
                <span className={`text-lg font-bold ${gameState.errors > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                  {gameState.errors}
                </span>
              </div>
              <div className="p-3 bg-[#080d22] border border-slate-800 rounded-xl">
                <span className="text-xs text-slate-400 block">Dicas Usadas</span>
                <span className="text-lg font-bold text-slate-200">{hintsUsed}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full max-w-md">
              <button
                type="button"
                onClick={handleReset}
                className="py-3 px-5 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold transition-all cursor-pointer text-sm"
              >
                Tentar Novamente
              </button>
              <button
                type="button"
                onClick={() => triggerCompletion(gameState)}
                className="flex-1 py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 shadow-lg shadow-purple-900/30 border border-purple-400/40 cursor-pointer transition-all text-sm"
              >
                Concluir Prática ➔
              </button>
            </div>
          </div>
        )}

        {/* Detalhes Técnicos em Nível 3 */}
        <SelectionTechnicalDetails gameState={gameState} />
      </main>
    </div>
  );
}
