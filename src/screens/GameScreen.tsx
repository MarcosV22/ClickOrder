import { useState, useCallback, useRef, useEffect } from "react";
import NumberedBox from "../components/NumberedBox";
import StatsPanel from "../components/StatsPanel";
import InstructionPanel from "../components/InstructionPanel";
import PhaseHeader from "../components/PhaseHeader";
import GameButton from "../components/GameButton";
import {
  createBubbleSortState,
  executeUserStep,
  getExpectedComparison,
  getSortedIndices,
  calculateBubbleSortProgress,
} from "../game/sorting";
import type { BubbleSortState, BubbleSortVariant, UserDecision, StepRecord } from "../game/sorting";
import {
  createPhaseSessionMetrics,
  recordHintUsed,
  calculateProtocolScore,
  type PhaseSessionMetrics,
} from "../game/session";

export interface PhaseCompleteData {
  comparisons: number;
  swaps: number;
  errors: number;
  hintsUsed: number;
  finalArray: readonly number[];
  initialArray: readonly number[];
  history: readonly StepRecord[];
  score: number;
  elapsedTimeMs: number;
  variant?: BubbleSortVariant;
  earlyExitTriggered?: boolean;
  terminationPass?: number;
}

interface GameScreenProps {
  onComplete: (data: PhaseCompleteData) => void;
  initialArray?: readonly number[];
  phase?: number;
  totalPhases?: number;
  variant?: BubbleSortVariant;
  modeTitle?: string;
}

const INITIAL_ARRAY = [5, 2, 4, 1];

export default function GameScreen({
  onComplete,
  initialArray = INITIAL_ARRAY,
  phase = 1,
  totalPhases = 3,
  variant = "CANONICAL",
  modeTitle,
}: GameScreenProps) {
  // --------------------------------------------------------------------------
  // 1. Estado Canônico da Engine (Fonte Única de Verdade Algorítmica)
  // --------------------------------------------------------------------------
  const [gameState, setGameState] = useState<BubbleSortState>(() =>
    createBubbleSortState(initialArray, { variant })
  );

  // --------------------------------------------------------------------------
  // 2. Métricas de Sessão / Scaffolding Pedagógico (Desacopladas da Engine)
  // --------------------------------------------------------------------------
  const [sessionMetrics, setSessionMetrics] = useState<PhaseSessionMetrics>(() =>
    createPhaseSessionMetrics()
  );

  // --------------------------------------------------------------------------
  // 3. Estados Puramente Visuais e de UI
  // --------------------------------------------------------------------------
  const [animatingPair, setAnimatingPair] = useState<{
    left: number;
    right: number;
  } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const initialExpected = getExpectedComparison(gameState);
  const [message, setMessage] = useState<{
    text: string;
    type: "info" | "warning" | "success" | "error";
  }>(() => ({
    text: initialExpected
      ? `Compare as caixas #${initialExpected.leftIndex + 1} e #${initialExpected.rightIndex + 1} (valores ${initialExpected.leftValue} e ${initialExpected.rightValue}). O que o algoritmo deve fazer?`
      : "Ordene as caixas em ordem crescente.",
    type: "info",
  }));

  // Referências para temporizadores, guarda de chamada única, métricas e medição de tempo da fase
  const animTimeoutRef = useRef<number | null>(null);
  const hintTimeoutRef = useRef<number | null>(null);
  const completeTimeoutRef = useRef<number | null>(null);
  const completedCalledRef = useRef<boolean>(false);
  const isActionLockedRef = useRef<boolean>(false);
  const hintsUsedRef = useRef<number>(0);
  hintsUsedRef.current = sessionMetrics.hintsUsed;

  // Medição de tempo monotônica (não punitiva e factual)
  const getNow = () =>
    typeof performance !== "undefined" && typeof performance.now === "function"
      ? performance.now()
      : Date.now();
  const startTimeRef = useRef<number>(getNow());

  // --------------------------------------------------------------------------
  // 3. Dados Derivados Reativos da Engine
  // --------------------------------------------------------------------------
  const expected = getExpectedComparison(gameState);
  const sortedIndices = getSortedIndices(gameState);
  const progressPercent = calculateBubbleSortProgress(gameState);

  const totalPasses = Math.max(1, gameState.arrayLength - 1);
  const currentPassNumber = gameState.completed
    ? totalPasses
    : Math.min(totalPasses, gameState.passIndex + 1);

  const totalComparisonsInPass = Math.max(
    1,
    gameState.arrayLength - 1 - (gameState.completed ? totalPasses - 1 : gameState.passIndex)
  );
  const currentComparisonNumber = gameState.completed
    ? totalComparisonsInPass
    : Math.min(totalComparisonsInPass, gameState.comparisonIndex + 1);

  const boxSize = gameState.arrayLength >= 6 ? "md" : "lg";

  // --------------------------------------------------------------------------
  // 4. Finalização Segura da Fase
  // --------------------------------------------------------------------------
  const triggerCompletion = useCallback(
    (finalState: BubbleSortState) => {
      if (completedCalledRef.current) return;
      completedCalledRef.current = true;

      const endTime = getNow();
      const elapsedTimeMs = Math.max(0, Math.round(endTime - startTimeRef.current));
      const score = calculateProtocolScore({
        errors: finalState.errors,
        hintsUsed: hintsUsedRef.current,
      });

      onComplete({
        comparisons: finalState.comparisons,
        swaps: finalState.swaps,
        errors: finalState.errors,
        hintsUsed: hintsUsedRef.current,
        finalArray: [...finalState.currentValues],
        initialArray: [...finalState.initialValues],
        history: finalState.history,
        score,
        elapsedTimeMs,
        variant: finalState.variant,
        earlyExitTriggered: finalState.earlyExitTriggered,
        terminationPass: finalState.terminationPass,
      });
    },
    [onComplete]
  );

  // Cleanup de timers no desmontar do componente
  useEffect(() => {
    return () => {
      if (animTimeoutRef.current) window.clearTimeout(animTimeoutRef.current);
      if (hintTimeoutRef.current) window.clearTimeout(hintTimeoutRef.current);
      if (completeTimeoutRef.current) window.clearTimeout(completeTimeoutRef.current);
    };
  }, []);

  // --------------------------------------------------------------------------
  // 5. Interação Pedagógica: TROCAR vs MANTER (SWAP vs KEEP)
  // --------------------------------------------------------------------------
  const handleDecision = (decision: UserDecision) => {
    if (isActionLockedRef.current || isAnimating || gameState.completed) return;
    const currentExpected = getExpectedComparison(gameState);
    if (!currentExpected) return;

    const result = executeUserStep(gameState, decision);

    if (decision === "SWAP") {
      if (result.valid) {
        // Trava síncrona imediata para evitar processamento de duplo-clique
        isActionLockedRef.current = true;
        const leftIdx = currentExpected.leftIndex;
        const rightIdx = currentExpected.rightIndex;

        setIsAnimating(true);
        setAnimatingPair({ left: leftIdx, right: rightIdx });
        setMessage({
          text: result.explanation,
          type: "success",
        });

        if (animTimeoutRef.current) window.clearTimeout(animTimeoutRef.current);
        animTimeoutRef.current = window.setTimeout(() => {
          setAnimatingPair(null);
          setGameState(result.state);
          setIsAnimating(false);

          if (result.state.completed) {
            isActionLockedRef.current = true;
            const completionText = result.state.earlyExitTriggered
              ? "Passada concluída sem trocas. O protocolo detectou que a esteira já está ordenada e encerrou a execução antecipadamente."
              : "Protocolo concluído! Todas as caixas foram ordenadas com sucesso.";
            setMessage({
              text: completionText,
              type: "success",
            });
            setIsAnimating(true);
            if (completeTimeoutRef.current) window.clearTimeout(completeTimeoutRef.current);
            completeTimeoutRef.current = window.setTimeout(() => {
              triggerCompletion(result.state);
            }, 1200);
          } else {
            isActionLockedRef.current = false;
            const nextExpected = getExpectedComparison(result.state);
            if (nextExpected) {
              setMessage({
                text: `Troca efetuada! Agora compare as caixas #${nextExpected.leftIndex + 1} e #${nextExpected.rightIndex + 1} (${nextExpected.leftValue} e ${nextExpected.rightValue}).`,
                type: "info",
              });
            }
          }
        }, 500);
      } else {
        // Troca inválida: elementos já estão em ordem relativa
        setGameState(result.state);
        setMessage({
          text: result.explanation,
          type: "error",
        });
      }
    } else {
      // Decisão KEEP (Manter)
      if (result.valid) {
        setGameState(result.state);

        if (result.state.completed) {
          isActionLockedRef.current = true;
          const completionText = result.state.earlyExitTriggered
            ? "Passada concluída sem trocas. O protocolo detectou que a esteira já está ordenada e encerrou a execução antecipadamente."
            : "Protocolo concluído! Todas as caixas foram ordenadas com sucesso.";
          setMessage({
            text: completionText,
            type: "success",
          });
          setIsAnimating(true);
          if (completeTimeoutRef.current) window.clearTimeout(completeTimeoutRef.current);
          completeTimeoutRef.current = window.setTimeout(() => {
            triggerCompletion(result.state);
          }, 1200);
        } else {
          const nextExpected = getExpectedComparison(result.state);
          if (nextExpected) {
            setMessage({
              text: `Ordem mantida! Agora compare as caixas #${nextExpected.leftIndex + 1} e #${nextExpected.rightIndex + 1} (${nextExpected.leftValue} e ${nextExpected.rightValue}).`,
              type: "info",
            });
          }
        }
      } else {
        // Manutenção inválida: elementos estão fora de ordem e precisam ser trocados
        setGameState(result.state);
        setMessage({
          text: result.explanation,
          type: "error",
        });
      }
    }
  };

  // --------------------------------------------------------------------------
  // 6. Sistema de Dica Pedagógica
  // --------------------------------------------------------------------------
  const handleHint = () => {
    if (isActionLockedRef.current || isAnimating || gameState.completed || showHint) {
      if (gameState.completed) {
        setMessage({
          text: "O vetor já está totalmente ordenado!",
          type: "success",
        });
      }
      return;
    }
    const currentExpected = getExpectedComparison(gameState);
    if (!currentExpected) return;

    setSessionMetrics((prev) => {
      const next = recordHintUsed(prev);
      hintsUsedRef.current = next.hintsUsed;
      return next;
    });

    setShowHint(true);
    const hintText = currentExpected.shouldSwap
      ? `DICA: Observe as caixas #${currentExpected.leftIndex + 1} (${currentExpected.leftValue}) e #${currentExpected.rightIndex + 1} (${currentExpected.rightValue}). Como ${currentExpected.leftValue} > ${currentExpected.rightValue}, o Bubble Sort exige a TROCA.`
      : `DICA: Observe as caixas #${currentExpected.leftIndex + 1} (${currentExpected.leftValue}) e #${currentExpected.rightIndex + 1} (${currentExpected.rightValue}). Como ${currentExpected.leftValue} ≤ ${currentExpected.rightValue}, a ordem já está correta. Escolha MANTER.`;

    setMessage({
      text: hintText,
      type: "warning",
    });

    if (hintTimeoutRef.current) window.clearTimeout(hintTimeoutRef.current);
    hintTimeoutRef.current = window.setTimeout(() => {
      setShowHint(false);
    }, 4000);
  };

  // --------------------------------------------------------------------------
  // 7. Reinício da Fase
  // --------------------------------------------------------------------------
  const handleReset = () => {
    if (animTimeoutRef.current) window.clearTimeout(animTimeoutRef.current);
    if (hintTimeoutRef.current) window.clearTimeout(hintTimeoutRef.current);
    if (completeTimeoutRef.current) window.clearTimeout(completeTimeoutRef.current);

    completedCalledRef.current = false;
    isActionLockedRef.current = false;
    startTimeRef.current = getNow();
    const fresh = createBubbleSortState(initialArray, { variant });
    setGameState(fresh);
    hintsUsedRef.current = 0;
    setSessionMetrics(createPhaseSessionMetrics());
    setIsAnimating(false);
    setAnimatingPair(null);
    setShowHint(false);

    const exp = getExpectedComparison(fresh);
    if (exp) {
      setMessage({
        text: `Reiniciado. Compare as caixas #${exp.leftIndex + 1} e #${exp.rightIndex + 1} (${exp.leftValue} e ${exp.rightValue}). O que o algoritmo deve fazer?`,
        type: "info",
      });
    } else {
      setMessage({
        text: "Ordene as caixas em ordem crescente.",
        type: "info",
      });
    }
  };

  // --------------------------------------------------------------------------
  // 8. Clique Informativo nas Caixas
  // --------------------------------------------------------------------------
  const handleBoxClick = (index: number) => {
    if (isAnimating || gameState.completed) return;
    const currentExpected = getExpectedComparison(gameState);
    if (!currentExpected) return;

    if (index === currentExpected.leftIndex || index === currentExpected.rightIndex) {
      setMessage({
        text: `Caixa #${index + 1} (valor ${gameState.currentValues[index]}) está ativa no par sob comparação. Escolha TROCAR ou MANTER abaixo.`,
        type: "info",
      });
    } else if (sortedIndices.includes(index)) {
      setMessage({
        text: `A caixa #${index + 1} (valor ${gameState.currentValues[index]}) já está consolidada em sua posição definitiva (OK).`,
        type: "info",
      });
    } else {
      setMessage({
        text: `Atenção: o Bubble Sort avalia pares adjacentes em ordem sequencial. O par atual é #${currentExpected.leftIndex + 1} e #${currentExpected.rightIndex + 1}.`,
        type: "warning",
      });
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#060b1a] bg-grid scanlines flex flex-col">
      {/* Header */}
      {/* Header */}
      <PhaseHeader
        protocol={variant === "EARLY_EXIT" ? "BUBBLE (DESAFIO)" : "BUBBLE"}
        phase={phase}
        totalPhases={totalPhases}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-start sm:justify-center gap-4 sm:gap-6 px-4 sm:px-6 py-4 pb-12 sm:pb-16 overflow-y-auto">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-64 bg-blue-600/4 rounded-full blur-[100px] pointer-events-none" />

        {/* Phase & Pass / Comparison info */}
        <div className="relative z-10 text-center flex flex-col items-center gap-1">
          {variant === "EARLY_EXIT" && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-amber-500/40 bg-amber-950/40 text-[10px] text-amber-300 font-mono tracking-widest uppercase">
              ⚡ VARIANTE OTIMIZADA — EARLY EXIT
            </div>
          )}
          <h2
            className="text-2xl font-bold text-white/90 tracking-wider"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            {variant === "EARLY_EXIT"
              ? (modeTitle ?? `MODO DESAFIO — CENÁRIO ${phase}`)
              : `PROTOCOLO BUBBLE — FASE ${phase}`}
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
            <span
              className="px-2.5 py-0.5 rounded border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs font-mono tracking-widest"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              PASSADA {currentPassNumber}/{totalPasses}
            </span>

            {!gameState.completed && expected ? (
              <span
                className="px-2.5 py-0.5 rounded border border-purple-500/30 bg-purple-950/40 text-purple-300 text-xs font-mono tracking-widest"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                COMPARAÇÃO {currentComparisonNumber}/{totalComparisonsInPass} (PAR #{expected.leftIndex + 1} E #{expected.rightIndex + 1})
              </span>
            ) : (
              <span
                className="px-2.5 py-0.5 rounded border border-emerald-500/30 bg-emerald-950/40 text-emerald-300 text-xs font-mono tracking-widest"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                CONCLUÍDO
              </span>
            )}
          </div>
        </div>

        {/* Conveyor + Boxes area */}
        <div className="relative z-10 w-full max-w-2xl">
          {/* Top rail */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent mb-2" />

          {/* Conveyor label */}
          <div className="flex justify-between mb-3 px-2">
            <span
              className="text-[9px] text-white/20 tracking-widest"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              ESTEIRA A-04
            </span>
            <span
              className="text-[9px] text-white/20 tracking-widest"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              CAPACIDADE: {gameState.arrayLength}/8 PKG
            </span>
          </div>

          {/* Boxes row with controlled horizontal scrolling */}
          <div className="conveyor-track py-6 px-3 sm:px-8 rounded-xl relative w-full overflow-x-auto">
            {/* Corner indicators */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-cyan-500/30 pointer-events-none" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-cyan-500/30 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-cyan-500/30 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-cyan-500/30 pointer-events-none" />

            <div className="flex items-center justify-center gap-2.5 sm:gap-4 md:gap-6 min-w-max mx-auto px-2">
              {gameState.currentValues.map((value, index) => {
                const isExpected =
                  !gameState.completed &&
                  expected !== null &&
                  (index === expected.leftIndex || index === expected.rightIndex);
                const isSorted = sortedIndices.includes(index);

                let animDir: "left" | "right" | null = null;
                if (animatingPair) {
                  if (index === animatingPair.left) animDir = "right";
                  else if (index === animatingPair.right) animDir = "left";
                }

                return (
                  <NumberedBox
                    key={`box-${index}`}
                    value={value}
                    index={index}
                    selected={isExpected}
                    disabled={isAnimating || gameState.completed}
                    sorted={isSorted}
                    onClick={handleBoxClick}
                    animating={animDir}
                    size={boxSize}
                  />
                );
              })}
            </div>
          </div>

          {/* Direction arrow */}
          <div className="flex items-center justify-end gap-1 mt-2 px-2">
            <span
              className="text-[9px] text-white/15"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              DESTINO →
            </span>
          </div>

          {/* Bottom rail */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent mt-2" />
        </div>

        {/* Decision Controls (TROCAR vs MANTER) */}
        <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
          {!gameState.completed && expected ? (
            <div className="flex items-center justify-center gap-4 w-full">
              <GameButton
                onClick={() => handleDecision("SWAP")}
                disabled={isAnimating || gameState.completed}
                variant="primary"
                size="md"
                className="min-w-[150px] shadow-[0_0_15px_rgba(0,245,255,0.25)]"
              >
                ⇄ TROCAR
              </GameButton>

              <GameButton
                onClick={() => handleDecision("KEEP")}
                disabled={isAnimating || gameState.completed}
                variant="secondary"
                size="md"
                className="min-w-[150px]"
              >
                = MANTER
              </GameButton>
            </div>
          ) : (
            <div className="h-10 flex items-center justify-center">
              <span
                className="text-xs text-emerald-400 font-mono tracking-widest uppercase flex items-center gap-2"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                ORDENAÇÃO DESTE TURNO CONCLUÍDA
              </span>
            </div>
          )}
        </div>

        {/* Instruction panel */}
        <div className="relative z-10 w-full max-w-2xl">
          <InstructionPanel message={message.text} type={message.type} />
        </div>

        {/* Bottom controls */}
        <div className="relative z-10 flex items-center justify-between w-full max-w-2xl">
          {/* Stats */}
          <StatsPanel comparisons={gameState.comparisons} swaps={gameState.swaps} />

          {/* Action buttons */}
          <div className="flex gap-3">
            <GameButton
              onClick={handleHint}
              variant="secondary"
              size="sm"
              disabled={showHint || isAnimating || gameState.completed}
            >
              ? DICA
            </GameButton>
            <GameButton
              onClick={handleReset}
              variant="danger"
              size="sm"
              disabled={isAnimating}
            >
              ↺ REINICIAR
            </GameButton>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative z-10 w-full max-w-2xl">
          <div className="flex justify-between mb-1">
            <span
              className="text-[9px] text-white/20 tracking-widest"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              PROGRESSO
            </span>
            <span
              className="text-[9px] text-cyan-400/60"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {progressPercent}%
            </span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                boxShadow: "0 0 8px rgba(0,245,255,0.4)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
