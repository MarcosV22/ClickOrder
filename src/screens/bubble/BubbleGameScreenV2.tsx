import React, { useState, useEffect, useRef, useCallback } from "react";
import NumberedBox from "../../components/NumberedBox";
import {
  createBubbleSortState,
  executeUserStep,
  getExpectedComparison,
  getSortedIndices,
  calculateTotalExpectedComparisons,
} from "../../game/sorting/bubbleSortEngine";
import type { BubbleSortState, UserDecision } from "../../game/sorting/types";
import { calculateProtocolScore } from "../../game/session/protocolScore";
import type { PhaseCompleteData } from "../GameScreen";
import {
  type BubbleUxTestSession,
  isUxTestQueryParamActive,
  createUxTestSession,
} from "./bubbleUxTest";

export interface BubbleGameScreenV2Props {
  initialArray?: readonly number[];
  phase?: number;
  totalPhases?: number;
  practiceTitle?: string;
  onComplete: (data: PhaseCompleteData, uxTestSession?: BubbleUxTestSession) => void;
  onBackToSelector: () => void;
  isUxTestMode?: boolean;
  uxTestSession?: BubbleUxTestSession;
  onUxTestSessionUpdate?: (session: BubbleUxTestSession) => void;
}

const DEFAULT_ARRAY = [40, 20, 50, 10];

export default function BubbleGameScreenV2({
  initialArray = DEFAULT_ARRAY,
  phase = 1,
  totalPhases = 3,
  practiceTitle = "Prática Básica",
  onComplete,
  onBackToSelector,
  isUxTestMode,
  uxTestSession,
  onUxTestSessionUpdate,
}: BubbleGameScreenV2Props) {
  // 1. Estado da Engine (Fonte Única da Verdade Algorítmica)
  const [gameState, setGameState] = useState<BubbleSortState>(() =>
    createBubbleSortState(initialArray, { variant: "CANONICAL" })
  );

  // 2. Instrumentação de Teste de UX (em memória, sem persistência e sem telemetria de rede)
  const activeUxTestMode = isUxTestMode ?? isUxTestQueryParamActive();
  const [currentUxSession, setCurrentUxSession] = useState<BubbleUxTestSession | null>(() => {
    if (!activeUxTestMode) return null;
    const existing = uxTestSession || createUxTestSession();
    return {
      ...existing,
      practiceStartedAt: existing.practiceStartedAt || Date.now(),
    };
  });

  // 3. Estados Educacionais V2 (Desacoplados da Engine)
  const [hasPredicted, setHasPredicted] = useState(false);
  const [predictionFeedback, setPredictionFeedback] = useState<string | null>(null);
  const [predictionSelected, setPredictionSelected] = useState<number | null>(null);

  const [hasCompletedPassCheck, setHasCompletedPassCheck] = useState(false);
  const [passCheckSelected, setPassCheckSelected] = useState<number | null>(null);
  const [passCheckFeedback, setPassCheckFeedback] = useState<string | null>(null);

  const [isSwapping, setIsSwapping] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  // Timers and completion guard
  const startTimeRef = useRef<number>(
    typeof performance !== "undefined" && typeof performance.now === "function"
      ? performance.now()
      : Date.now()
  );
  const completionTriggeredRef = useRef(false);
  const isActionLockedRef = useRef(false);

  const expected = getExpectedComparison(gameState);
  const sortedIndices = getSortedIndices(gameState);
  const totalComparisons = calculateTotalExpectedComparisons(gameState.arrayLength);
  const currentStepNumber = gameState.comparisons + 1;

  // Detect completion
  const handleGameComplete = useCallback(
    (finalState: BubbleSortState) => {
      if (completionTriggeredRef.current) return;
      completionTriggeredRef.current = true;

      const now =
        typeof performance !== "undefined" && typeof performance.now === "function"
          ? performance.now()
          : Date.now();
      const elapsedTimeMs = Math.max(0, Math.round(now - startTimeRef.current));
      const score = calculateProtocolScore({
        errors: finalState.errors,
        hintsUsed,
      });

      const updatedUx = currentUxSession
        ? {
            ...currentUxSession,
            sessionCompletedAt: Date.now(),
          }
        : undefined;

      onComplete(
        {
          comparisons: finalState.comparisons,
          swaps: finalState.swaps,
          errors: finalState.errors,
          hintsUsed,
          finalArray: [...finalState.currentValues],
          initialArray: [...finalState.initialValues],
          history: finalState.history,
          score,
          elapsedTimeMs,
          variant: finalState.variant,
        },
        updatedUx
      );
    },
    [currentUxSession, hintsUsed, onComplete]
  );

  // Check if we should trigger pass checkpoint (at the end of pass 0)
  const isPass0Ended =
    (gameState.passIndex > 0 || gameState.completed) &&
    gameState.history.length > 0 &&
    !hasCompletedPassCheck;

  // Handle action (SWAP or KEEP)
  const handleDecision = useCallback(
    (decision: UserDecision) => {
      if (
        isActionLockedRef.current ||
        isSwapping ||
        gameState.completed ||
        !hasPredicted ||
        isPass0Ended
      ) {
        return;
      }

      if (!expected) return;

      const leftVal = expected.leftValue;
      const rightVal = expected.rightValue;
      const stepResult = executeUserStep(gameState, decision);

      // Atualiza telemetria de teste de UX (se ativa)
      if (activeUxTestMode) {
        setCurrentUxSession((prev) => {
          if (!prev) return prev;
          const isFirst = prev.firstActionAt === undefined;
          const nowTs = Date.now();
          const baseStart = prev.practiceStartedAt || nowTs;
          const updated: BubbleUxTestSession = {
            ...prev,
            firstActionAt: isFirst ? nowTs : prev.firstActionAt,
            timeToFirstActionMs: isFirst
              ? Math.max(0, Math.round(nowTs - baseStart))
              : prev.timeToFirstActionMs,
            firstActionCorrect: isFirst ? stepResult.valid : prev.firstActionCorrect,
            wrongActionsCount: !stepResult.valid ? prev.wrongActionsCount + 1 : prev.wrongActionsCount,
          };
          onUxTestSessionUpdate?.(updated);
          return updated;
        });
      }

      if (stepResult.valid) {
        // Correct action
        if (decision === "SWAP") {
          isActionLockedRef.current = true;
          setIsSwapping(true);
          setFeedback({
            type: "success",
            text: `Isso! ${leftVal} é maior que ${rightVal}, então ele vai para a direita.`,
          });

          setTimeout(() => {
            const nextState = stepResult.state;
            setGameState(nextState);
            setIsSwapping(false);
            isActionLockedRef.current = false;

            if (nextState.completed) {
              handleGameComplete(nextState);
            }
          }, 350);
        } else {
          // KEEP
          setFeedback({
            type: "success",
            text: `Correto! ${leftVal} já é menor ou igual a ${rightVal}, mantendo suas posições.`,
          });
          const nextState = stepResult.state;
          setGameState(nextState);

          if (nextState.completed) {
            handleGameComplete(nextState);
          }
        }
      } else {
        // Error
        setGameState(stepResult.state);
        const shouldSwap = expected.shouldSwap;
        if (shouldSwap) {
          setFeedback({
            type: "error",
            text: `Observe: ${leftVal} é maior que ${rightVal}. Em ordem crescente, o maior deve ficar à direita. Tente trocar!`,
          });
        } else {
          setFeedback({
            type: "error",
            text: `Observe: ${leftVal} é menor ou igual a ${rightVal}. Eles já estão em ordem relativa. Mantenha as posições!`,
          });
        }
      }
    },
    [
      activeUxTestMode,
      expected,
      gameState,
      handleGameComplete,
      hasPredicted,
      isPass0Ended,
      isSwapping,
      onUxTestSessionUpdate,
    ]
  );

  // Keyboard accessibility: 1 = SWAP, 2 = KEEP
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "1" || e.key === "t" || e.key === "T") {
        handleDecision("SWAP");
      } else if (e.key === "2" || e.key === "m" || e.key === "M") {
        handleDecision("KEEP");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDecision]);

  // Handle pre-action prediction
  const handlePredictionChoice = (chosenVal: number) => {
    if (!expected) return;
    setPredictionSelected(chosenVal);
    const larger = Math.max(expected.leftValue, expected.rightValue);
    const smaller = Math.min(expected.leftValue, expected.rightValue);
    const isCorrect = chosenVal === larger;

    if (activeUxTestMode) {
      setCurrentUxSession((prev) => {
        if (!prev) return prev;
        const updated: BubbleUxTestSession = {
          ...prev,
          predictionAnswered: true,
          predictionCorrect: isCorrect,
        };
        onUxTestSessionUpdate?.(updated);
        return updated;
      });
    }

    if (isCorrect) {
      setPredictionFeedback(
        `Excelente! Como ${larger} é maior que ${smaller}, ele deve avançar para a direita.`
      );
    } else {
      setPredictionFeedback(
        `Pense nisso: estamos ordenando do menor para o maior. O maior valor (${larger}) deve ficar à direita.`
      );
    }
  };

  const handleConfirmPrediction = () => {
    setHasPredicted(true);
    setPredictionFeedback(null);
  };

  // Handle post-pass micro-check
  const maxInitialVal = Math.max(...gameState.initialValues);
  const handlePassCheckChoice = (chosenVal: number) => {
    setPassCheckSelected(chosenVal);
    const isCorrect = chosenVal === maxInitialVal;

    if (activeUxTestMode) {
      setCurrentUxSession((prev) => {
        if (!prev) return prev;
        const updated: BubbleUxTestSession = {
          ...prev,
          passCheckpointAnswered: true,
          passCheckpointCorrect: isCorrect,
        };
        onUxTestSessionUpdate?.(updated);
        return updated;
      });
    }

    if (isCorrect) {
      setPassCheckFeedback(
        `Exatamente! O maior valor (${maxInitialVal}) foi avançando a cada comparação e chegou à última posição da esteira.`
      );
    } else {
      setPassCheckFeedback(
        `Observe o final da esteira: o maior número (${maxInitialVal}) flutuou até a última posição e agora está fixado.`
      );
    }
  };

  const handleConfirmPassCheck = () => {
    setHasCompletedPassCheck(true);
    setPassCheckFeedback(null);
    if (gameState.completed) {
      handleGameComplete(gameState);
    }
  };

  // Nível 2: Dica acessível na área de decisão
  const handleRequestHint = () => {
    if (!expected) return;
    setHintsUsed((prev) => prev + 1);

    if (activeUxTestMode) {
      setCurrentUxSession((prev) => {
        if (!prev) return prev;
        const updated: BubbleUxTestSession = {
          ...prev,
          hintRequestsCount: prev.hintRequestsCount + 1,
        };
        onUxTestSessionUpdate?.(updated);
        return updated;
      });
    }

    const actionName = expected.shouldSwap ? "TROCAR" : "MANTER";
    setFeedback({
      type: "info",
      text: `Dica pedagógica: Compare ${expected.leftValue} e ${expected.rightValue}. A ação correta é ${actionName}.`,
    });
  };

  // Nível 3: Alternar gaveta técnica sob demanda
  const handleToggleTechnicalDetails = () => {
    setShowTechnicalDetails((prev) => {
      const next = !prev;
      if (next && activeUxTestMode) {
        setCurrentUxSession((current) => {
          if (!current) return current;
          const updated: BubbleUxTestSession = {
            ...current,
            detailsOpenedCount: current.detailsOpenedCount + 1,
          };
          onUxTestSessionUpdate?.(updated);
          return updated;
        });
      }
      return next;
    });
  };

  return (
    <div className="w-full h-full min-h-screen overflow-y-auto overflow-x-hidden bg-[#0a0e1a] text-slate-100 flex flex-col items-center justify-start py-6 px-4 sm:px-6">
      <div className="w-full max-w-3xl flex flex-col items-center gap-6 my-auto">
        {/* Top Header - Zero score, zero timer, clean navigation */}
        <div className="w-full flex items-center justify-between border-b border-slate-800/80 pb-4">
          <button
            type="button"
            onClick={onBackToSelector}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer px-2 py-1 rounded"
            aria-label="Sair da prática e voltar para a seleção"
          >
            <span>‹</span>
            <span>Sair</span>
          </button>

          <div className="text-center">
            <span className="text-xs font-mono font-bold text-blue-400 tracking-wider uppercase block">
              Bubble Sort
            </span>
            <span className="text-sm font-semibold text-slate-200">
              {practiceTitle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
              Passo {Math.min(currentStepNumber, totalComparisons)} de {totalComparisons}
            </span>
          </div>
        </div>

        {/* Hero Stage - Conveyor Belt */}
        <div className="w-full bg-[#111827]/80 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col items-center gap-6 shadow-xl">
          <div className="w-full flex justify-between items-center px-1">
            <span className="text-xs font-mono text-slate-400">
              {gameState.completed
                ? "Vetor completamente ordenado"
                : `Passada ${gameState.passIndex + 1} • Comparando vizinhos`}
            </span>
            {sortedIndices.length > 0 && (
              <span className="text-xs font-mono text-emerald-400 font-medium">
                {sortedIndices.length} {sortedIndices.length === 1 ? "posição fixada" : "posições fixadas"} ✓
              </span>
            )}
          </div>

          {/* Boxes Track */}
          <div className="flex items-center justify-center gap-3 sm:gap-6 py-4 flex-wrap">
            {gameState.currentValues.map((val, idx) => {
              const isPair =
                !gameState.completed &&
                expected !== null &&
                (idx === expected.leftIndex || idx === expected.rightIndex);
              const isSorted = sortedIndices.includes(idx);

              return (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <NumberedBox
                    value={val}
                    index={idx}
                    role={isPair ? "pair" : isSorted ? "sorted" : "default"}
                    variant="learning"
                    showIndex={showTechnicalDetails}
                    animating={
                      isSwapping && isPair
                        ? idx === expected?.leftIndex
                          ? "left"
                          : "right"
                        : null
                    }
                  />
                  {isPair && (
                    <span className="text-xs font-mono font-bold text-blue-400 animate-fade-in">
                      vizinho
                    </span>
                  )}
                  {isSorted && (
                    <span className="text-xs font-mono font-semibold text-emerald-400">
                      ordenado
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Checkpoint: Pre-Action Prediction (Appears on first step) */}
          {!hasPredicted && expected && (
            <div className="w-full border-t border-slate-800 pt-6 flex flex-col items-center gap-4 text-center">
              <div className="w-full bg-blue-950/40 border border-blue-500/30 rounded-xl p-5 flex flex-col items-center gap-3">
                <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
                  Previsão Antes de Agir
                </span>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-lg">
                  Antes de agir: depois de comparar <strong>{expected.leftValue}</strong> e <strong>{expected.rightValue}</strong>, qual valor ficará mais à direita?
                </p>

                <div className="flex items-center gap-4 mt-2">
                  <button
                    type="button"
                    data-testid="prediction-left"
                    onClick={() => handlePredictionChoice(expected.leftValue)}
                    className={`px-6 py-2.5 rounded-xl font-mono font-bold text-base transition-all cursor-pointer ${
                      predictionSelected === expected.leftValue
                        ? "bg-blue-600 text-white ring-2 ring-blue-400"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                    }`}
                  >
                    {expected.leftValue}
                  </button>
                  <button
                    type="button"
                    data-testid="prediction-right"
                    onClick={() => handlePredictionChoice(expected.rightValue)}
                    className={`px-6 py-2.5 rounded-xl font-mono font-bold text-base transition-all cursor-pointer ${
                      predictionSelected === expected.rightValue
                        ? "bg-blue-600 text-white ring-2 ring-blue-400"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                    }`}
                  >
                    {expected.rightValue}
                  </button>
                </div>

                {predictionFeedback && (
                  <div className="mt-2 flex flex-col items-center gap-3">
                    <p className="text-xs sm:text-sm text-blue-200 bg-blue-900/40 px-4 py-2 rounded-lg border border-blue-500/20 max-w-md">
                      {predictionFeedback}
                    </p>
                    <button
                      type="button"
                      data-testid="prediction-confirm"
                      onClick={handleConfirmPrediction}
                      className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors cursor-pointer"
                    >
                      Continuar para a Ação ▶
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Checkpoint: Post-Pass Micro-Check (Appears once after pass 0) */}
          {hasPredicted && isPass0Ended && (
            <div className="w-full border-t border-slate-800 pt-6 flex flex-col items-center gap-4 text-center">
              <div className="w-full bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-5 flex flex-col items-center gap-3">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Verificação de Aprendizado
                </span>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-lg">
                  Depois desta 1ª passada completa, qual elemento já chegou à sua posição final definitiva?
                </p>

                {/* 3 options: max element and 2 others */}
                <div className="flex items-center gap-3 sm:gap-4 mt-2 flex-wrap justify-center">
                  {Array.from(new Set(gameState.initialValues))
                    .slice(0, 3)
                    .map((val) => (
                      <button
                        key={val}
                        type="button"
                        data-testid={`pass-check-${val}`}
                        onClick={() => handlePassCheckChoice(val)}
                        className={`px-5 py-2.5 rounded-xl font-mono font-bold text-base transition-all cursor-pointer ${
                          passCheckSelected === val
                            ? "bg-emerald-600 text-white ring-2 ring-emerald-400"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                </div>

                {passCheckFeedback && (
                  <div className="mt-2 flex flex-col items-center gap-3">
                    <p className="text-xs sm:text-sm text-emerald-200 bg-emerald-900/40 px-4 py-2 rounded-lg border border-emerald-500/20 max-w-md">
                      {passCheckFeedback}
                    </p>
                    <button
                      type="button"
                      data-testid="pass-check-confirm"
                      onClick={handleConfirmPassCheck}
                      className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors cursor-pointer"
                    >
                      Continuar Prática ▶
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Decision and Action Area (Visible when no checkpoints are blocking) */}
          {hasPredicted && !isPass0Ended && !gameState.completed && expected && (
            <div className="w-full border-t border-slate-800 pt-6 flex flex-col items-center gap-5 text-center">
              {/* Central Question + Nível 2: Dica Discreta */}
              <div className="w-full max-w-md flex items-center justify-between px-1">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Decisão do Algoritmo
                </span>
                <button
                  type="button"
                  data-testid="hint-button"
                  onClick={handleRequestHint}
                  className="text-xs text-blue-400 hover:text-blue-300 font-mono transition-colors cursor-pointer py-1 px-2.5 rounded-lg bg-blue-950/40 border border-blue-500/20 hover:border-blue-500/40 flex items-center gap-1"
                  aria-label="Pedir dica para esta decisão"
                >
                  <span>?</span>
                  <span>Dica</span>
                </button>
              </div>

              <p className="text-base sm:text-lg text-white font-medium -mt-2">
                Essas duas caixas estão na ordem certa?{" "}
                <span className="text-blue-300 font-mono font-bold">
                  [{expected.leftValue}] e [{expected.rightValue}]
                </span>
              </p>

              {/* Two Main Action Buttons of Equal Weight */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
                <button
                  type="button"
                  data-testid="action-swap"
                  onClick={() => handleDecision("SWAP")}
                  className="w-full sm:flex-1 py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-600/20 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 group"
                  aria-label="Trocar os dois elementos de posição. Tecla de atalho: 1"
                >
                  <span className="text-lg">⇄ TROCAR</span>
                  <span className="text-[11px] font-mono font-normal text-blue-200 opacity-80 group-hover:opacity-100">
                    Atalho: [1]
                  </span>
                </button>

                <button
                  type="button"
                  data-testid="action-keep"
                  onClick={() => handleDecision("KEEP")}
                  className="w-full sm:flex-1 py-4 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 text-slate-100 font-bold text-base transition-all cursor-pointer flex flex-col items-center justify-center gap-1 group"
                  aria-label="Manter a ordem dos elementos. Tecla de atalho: 2"
                >
                  <span className="text-lg">= MANTER</span>
                  <span className="text-[11px] font-mono font-normal text-slate-400 group-hover:opacity-100">
                    Atalho: [2]
                  </span>
                </button>
              </div>

              {/* Causal Feedback Banner */}
              {feedback && (
                <div
                  className={`w-full max-w-md p-3.5 rounded-xl border text-sm leading-relaxed animate-fade-in ${
                    feedback.type === "success"
                      ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
                      : feedback.type === "error"
                        ? "bg-amber-950/40 border-amber-500/30 text-amber-200"
                        : "bg-blue-950/40 border-blue-500/30 text-blue-200"
                  }`}
                >
                  <p>{feedback.text}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Nível 3: Gaveta Sob Demanda: Detalhes Técnicos Secundários */}
        <div className="w-full flex flex-col items-center gap-2">
          <button
            type="button"
            data-testid="drawer-toggle"
            onClick={handleToggleTechnicalDetails}
            className="text-xs text-slate-400 hover:text-slate-200 font-mono transition-colors cursor-pointer py-1 px-3 rounded-lg hover:bg-slate-900"
          >
            {showTechnicalDetails ? "▲ Ocultar detalhes" : "▼ Ver detalhes sob demanda"}
          </button>

          {showTechnicalDetails && (
            <div className="w-full bg-[#0d1527] border border-slate-800 rounded-xl p-5 flex flex-col gap-4 text-xs font-mono text-slate-300 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <span>Índices do Laço: passIndex (i) = {gameState.passIndex}, compIndex (j) = {gameState.comparisonIndex}</span>
                <span>Tamanho do Vetor (n) = {gameState.arrayLength}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-slate-400 uppercase font-semibold">Condição formal de troca:</span>
                <span className="text-slate-200">se A[j] &gt; A[j+1], então swap(A[j], A[j+1])</span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/80 pt-2">
                A prática básica pode ser concluída integralmente sem consultar estes detalhes técnicos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
