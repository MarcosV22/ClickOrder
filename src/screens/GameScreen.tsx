import { useState, useCallback, useRef, useEffect } from "react";
import NumberedBox, { type BoxRole } from "../components/NumberedBox";
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
      <PhaseHeader
        protocol={variant === "EARLY_EXIT" ? "BUBBLE (DESAFIO)" : "BUBBLE"}
        phase={phase}
        totalPhases={totalPhases}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-start gap-4 sm:gap-6 px-4 sm:px-6 py-4 pb-16 sm:pb-24 overflow-y-auto">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-64 bg-blue-600/4 rounded-full blur-[100px] pointer-events-none" />

        {/* Phase & Pass info */}
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
        </div>

        {/* Subcabeçalho de Telemetria e Invariante de Laço */}
        <div className="relative z-10 w-full max-w-2xl flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <span
              className="text-xs px-2.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono tracking-wider uppercase"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              FASE {phase} DE {totalPhases}
            </span>
            <span
              className="text-xs px-2.5 py-0.5 rounded bg-purple-950/40 border border-purple-500/30 text-purple-300 font-mono tracking-wider uppercase"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              PASSADA {currentPassNumber} DE {totalPasses}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-white/50">
            <span>
              COMPARAÇÕES:{" "}
              <strong className="text-cyan-300">
                {gameState.comparisons}
              </strong>
            </span>
            <span>•</span>
            <span>
              TROCAS:{" "}
              <strong className="text-purple-300">{gameState.swaps}</strong>
            </span>
            <span>•</span>
            <span>
              ERROS:{" "}
              <strong
                className={gameState.errors > 0 ? "text-amber-400" : "text-white/70"}
              >
                {gameState.errors}
              </strong>
            </span>
            {sessionMetrics.hintsUsed > 0 && (
              <>
                <span>•</span>
                <span>
                  DICAS:{" "}
                  <strong className="text-cyan-400">{sessionMetrics.hintsUsed}</strong>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Banner Relacional Concreto (Inspeção da Condição Algorítmica) */}
        <div className="relative z-10 w-full max-w-2xl rounded-lg bg-[#0a1638]/70 border border-cyan-500/30 p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-md">
          <div className="flex flex-wrap items-center gap-4">
            {!gameState.completed && expected ? (
              <div className="flex items-center gap-1.5">
                <span className="text-white/40 uppercase">Par sob Inspeção:</span>
                <span className="text-cyan-300 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-400/40 animate-pulse">
                  #{expected.leftIndex + 1} ({expected.leftValue}) e #{expected.rightIndex + 1} ({expected.rightValue})
                </span>
              </div>
            ) : (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Vetor Consolidado
              </span>
            )}
          </div>

          {/* Textual comparison formula */}
          <div className="text-xs font-bold text-right ml-auto flex items-center gap-2">
            {!gameState.completed && expected ? (
              <>
                <span className="text-white/80">
                  Condição:{" "}
                  <span className="text-cyan-300">
                    A[{expected.leftIndex}] ({expected.leftValue})
                  </span>{" "}
                  &gt;{" "}
                  <span className="text-cyan-300">
                    A[{expected.rightIndex}] ({expected.rightValue})
                  </span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-wider font-bold ${
                    expected.leftValue > expected.rightValue
                      ? "bg-amber-950/60 text-amber-300 border border-amber-500/40"
                      : "bg-emerald-950/60 text-emerald-300 border border-emerald-500/40"
                  }`}
                >
                  {expected.leftValue > expected.rightValue ? "VERDADEIRO" : "FALSO"}
                </span>
              </>
            ) : (
              <span className="text-emerald-400">Todas as cargas em ordem</span>
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
                const boxRole: BoxRole = isExpected ? "pair" : isSorted ? "sorted" : "default";

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
                    role={boxRole}
                    disabled={isAnimating || gameState.completed}
                    onClick={handleBoxClick}
                    animating={animDir}
                    size={boxSize}
                  />
                );
              })}
            </div>
          </div>

          {/* Semantics role legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 border-t border-white/5 text-[10px] font-mono text-white/50 select-none">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-cyan-500/30 border border-cyan-400" />
              PAR (Vizinhos sob Inspeção)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500/30 border border-emerald-500" />
              OK (Consolidado)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-blue-950 border border-blue-500/30" />
              PKG (Aguardando)
            </span>
          </div>

          {/* Bottom rail */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent mt-2" />
        </div>

        {/* Progress bar */}
        <div className="relative z-10 w-full max-w-2xl flex items-center gap-3 px-2">
          <span
            className="text-[10px] text-white/30 font-mono uppercase tracking-wider"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Progresso:
          </span>
          <div className="flex-1 h-2 rounded-full bg-[#0d1635] border border-cyan-500/20 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-300 rounded-full"
              style={{
                width: `${progressPercent}%`,
                boxShadow: "0 0 8px rgba(0,245,255,0.4)",
              }}
            />
          </div>
          <span
            className="text-xs font-bold text-cyan-300 font-mono"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            {progressPercent}%
          </span>
        </div>

        {/* Instruction panel (ANTES da botoeira) */}
        <div className="relative z-10 w-full max-w-2xl">
          <InstructionPanel message={message.text} type={message.type} />
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
      </div>
    </div>
  );
}
