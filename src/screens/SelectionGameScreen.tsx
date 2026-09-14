import { useState, useRef, useEffect, useCallback } from "react";
import NumberedBox, { type BoxRole } from "../components/NumberedBox";
import StatsPanel from "../components/StatsPanel";
import InstructionPanel from "../components/InstructionPanel";
import PhaseHeader from "../components/PhaseHeader";
import GameButton from "../components/GameButton";
import {
  createSelectionSortState,
  executeSelectionInspection,
  commitSelectionPass,
  getExpectedSelectionInspection,
  getExpectedSelectionCommit,
  getSelectionSortedIndices,
  calculateSelectionSortProgress,
  calculateTotalExpectedSelectionComparisons,
  type SelectionSortState,
  type SelectionInspectionDecision,
  type SelectionStepRecord,
} from "../game/sorting/selection";
import {
  createPhaseSessionMetrics,
  recordHintUsed,
  calculateProtocolScore,
  type PhaseSessionMetrics,
} from "../game/session";
import type { SeedInput } from "../game/generation";

export interface SelectionPhaseCompleteData {
  protocol: "selection";
  phase: number;
  initialArray: readonly number[];
  finalArray: readonly number[];
  comparisons: number;
  swaps: number;
  errors: number;
  hintsUsed: number;
  score: number;
  elapsedTimeMs: number;
  history: readonly SelectionStepRecord[];
  seed?: SeedInput;
}

interface SelectionGameScreenProps {
  onComplete: (data: SelectionPhaseCompleteData) => void;
  initialArray: readonly number[];
  phase: number;
  totalPhases?: number;
  seed?: SeedInput;
  onResetPhase?: () => void;
}

export default function SelectionGameScreen({
  onComplete,
  initialArray,
  phase = 1,
  totalPhases = 3,
  seed,
  onResetPhase,
}: SelectionGameScreenProps) {
  // --------------------------------------------------------------------------
  // 1. Estado Canônico da Engine (Fonte Única de Verdade Algorítmica)
  // --------------------------------------------------------------------------
  const [gameState, setGameState] = useState<SelectionSortState>(() =>
    createSelectionSortState(initialArray)
  );

  // --------------------------------------------------------------------------
  // 2. Métricas de Sessão / Scaffolding Pedagógico (Desacopladas da Engine)
  // --------------------------------------------------------------------------
  const [sessionMetrics, setSessionMetrics] = useState<PhaseSessionMetrics>(() =>
    createPhaseSessionMetrics()
  );

  // --------------------------------------------------------------------------
  // 3. Estados Puramente Visuais e de Animação
  // --------------------------------------------------------------------------
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [animatingPair, setAnimatingPair] = useState<{
    target: number;
    min: number;
    distance: number;
  } | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);

  const initialExpected = getExpectedSelectionInspection(gameState);
  const [message, setMessage] = useState<{
    text: string;
    type: "info" | "warning" | "success" | "error";
  }>(() => ({
    text: initialExpected
      ? `Varredura iniciada. Compare a carga #${initialExpected.j + 1} (${initialExpected.scannerValue}) com o candidato mínimo #${initialExpected.minIndex + 1} (${initialExpected.currentMinValue}).`
      : "Iniciando ordenação por seleção.",
    type: "info",
  }));

  // Referências para temporizadores, guarda síncrona e medição de tempo monotônica
  const isActionLockedRef = useRef<boolean>(false);
  const completedCalledRef = useRef<boolean>(false);
  const animTimeoutRef = useRef<number | null>(null);
  const completeTimeoutRef = useRef<number | null>(null);
  const hintsUsedRef = useRef<number>(0);
  hintsUsedRef.current = sessionMetrics.hintsUsed;

  const getNow = () =>
    typeof performance !== "undefined" && typeof performance.now === "function"
      ? performance.now()
      : Date.now();
  const startTimeRef = useRef<number>(getNow());

  // Limpeza de timeouts ao desmontar
  useEffect(() => {
    return () => {
      if (animTimeoutRef.current) window.clearTimeout(animTimeoutRef.current);
      if (completeTimeoutRef.current)
        window.clearTimeout(completeTimeoutRef.current);
    };
  }, []);

  // --------------------------------------------------------------------------
  // 4. Dados Derivados Reativos da Engine
  // --------------------------------------------------------------------------
  const sortedIndices = getSelectionSortedIndices(gameState);
  const progressPercent = calculateSelectionSortProgress(gameState);
  const totalTheoreticalComparisons =
    calculateTotalExpectedSelectionComparisons(gameState.arrayLength);

  const totalPasses = Math.max(1, gameState.arrayLength - 1);
  const currentPassNumber = gameState.completed
    ? totalPasses
    : Math.min(totalPasses, gameState.i + 1);

  const boxSize = gameState.arrayLength >= 6 ? "md" : "lg";

  const currentTargetValue = gameState.currentValues[gameState.i];
  const currentMinValue = gameState.currentValues[gameState.minIndex];
  const currentScanValue =
    gameState.phase === "INSPECT"
      ? gameState.currentValues[gameState.j]
      : null;

  // --------------------------------------------------------------------------
  // 5. Finalização Segura da Fase
  // --------------------------------------------------------------------------
  const triggerCompletion = useCallback(
    (finalState: SelectionSortState) => {
      if (completedCalledRef.current) return;
      completedCalledRef.current = true;

      const endTime = getNow();
      const elapsedTimeMs = Math.max(
        0,
        Math.round(endTime - startTimeRef.current)
      );
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

  // --------------------------------------------------------------------------
  // 6. Decisão de Inspeção do Scanner (phase === "INSPECT")
  // --------------------------------------------------------------------------
  const handleInspectionDecision = (decision: SelectionInspectionDecision) => {
    if (isActionLockedRef.current || isAnimating || gameState.completed) return;
    if (gameState.phase !== "INSPECT") return;

    const result = executeSelectionInspection(gameState, decision);

    if (result.valid) {
      setGameState(result.state);
      setShowHint(false);

      if (result.state.phase === "COMMIT") {
        const canSwap = result.state.minIndex !== result.state.i;
        setMessage({
          text: canSwap
            ? `Varredura da passada ${result.state.i + 1} concluída! Menor carga #${result.state.minIndex + 1} (${result.state.currentValues[result.state.minIndex]}) identificada. Confirme a transferência para a posição alvo #${result.state.i + 1}.`
            : `Varredura da passada ${result.state.i + 1} concluída! A menor carga já ocupa a posição alvo #${result.state.i + 1}. Confirme a consolidação.`,
          type: "success",
        });
      } else if (decision === "SELECT_NEW_MIN") {
        const newMinVal = result.state.currentValues[result.state.minIndex];
        setMessage({
          text: `Novo candidato mínimo registrado: carga #${result.state.minIndex + 1} (valor ${newMinVal}).`,
          type: "success",
        });
      } else {
        const keepVal = result.state.currentValues[result.state.minIndex];
        setMessage({
          text: `Candidato mínimo preservado: carga #${result.state.minIndex + 1} (valor ${keepVal}).`,
          type: "success",
        });
      }
    } else {
      // Decisão incorreta: não avança o scanner, incrementa errors
      setGameState(result.state);
      const formativeMsg =
        result.expectedDecision === "SELECT_NEW_MIN"
          ? "A carga inspecionada é menor que o candidato atual. Atualize o mínimo."
          : "A carga inspecionada não é menor. Mantenha o candidato atual.";

      setMessage({
        text: formativeMsg,
        type: "warning",
      });
    }
  };

  // --------------------------------------------------------------------------
  // 7. Confirmação da Passada (phase === "COMMIT")
  // --------------------------------------------------------------------------
  const handleCommitPass = () => {
    if (isActionLockedRef.current || isAnimating || gameState.completed) return;
    if (gameState.phase !== "COMMIT") return;

    const targetIdx = gameState.i;
    const minIdx = gameState.minIndex;
    const shouldSwap = minIdx !== targetIdx;

    if (shouldSwap) {
      // Transferência com animação de deslocamento horizontal proporcional
      const distance = Math.abs(minIdx - targetIdx);
      isActionLockedRef.current = true;
      setIsAnimating(true);
      setAnimatingPair({ target: targetIdx, min: minIdx, distance });
      setShowHint(false);

      setMessage({
        text: `Transferindo menor carga #${minIdx + 1} para a posição alvo #${targetIdx + 1}...`,
        type: "info",
      });

      if (animTimeoutRef.current) window.clearTimeout(animTimeoutRef.current);
      animTimeoutRef.current = window.setTimeout(() => {
        const result = commitSelectionPass(gameState);
        setAnimatingPair(null);
        setGameState(result.state);
        setIsAnimating(false);

        if (result.state.completed) {
          isActionLockedRef.current = true;
          setMessage({
            text: "Protocolo Selection Sort concluído! Todas as cargas foram ordenadas com sucesso.",
            type: "success",
          });
          if (completeTimeoutRef.current)
            window.clearTimeout(completeTimeoutRef.current);
          completeTimeoutRef.current = window.setTimeout(() => {
            triggerCompletion(result.state);
          }, 1200);
        } else {
          isActionLockedRef.current = false;
          setMessage({
            text: `Posição #${targetIdx + 1} consolidada com selo OK! Iniciando varredura da passada ${result.state.i + 1}.`,
            type: "success",
          });
        }
      }, 600);
    } else {
      // Consolidação direta sem movimentação física de caixas
      const result = commitSelectionPass(gameState);
      setGameState(result.state);
      setShowHint(false);

      if (result.state.completed) {
        isActionLockedRef.current = true;
        setMessage({
          text: "A menor carga já ocupa a posição alvo. Protocolo Selection Sort concluído!",
          type: "success",
        });
        if (completeTimeoutRef.current)
          window.clearTimeout(completeTimeoutRef.current);
        completeTimeoutRef.current = window.setTimeout(() => {
          triggerCompletion(result.state);
        }, 1200);
      } else {
        setMessage({
          text: `A menor carga já ocupa a posição alvo. Posição #${targetIdx + 1} consolidada com selo OK!`,
          type: "success",
        });
      }
    }
  };

  // --------------------------------------------------------------------------
  // 8. Dica Pedagógica Contextual
  // --------------------------------------------------------------------------
  const handleToggleHint = () => {
    if (!showHint) {
      setSessionMetrics((prev) => recordHintUsed(prev));
    }
    setShowHint((prev) => !prev);
  };

  const getHintExplanation = (): string => {
    if (gameState.phase === "INSPECT") {
      const exp = getExpectedSelectionInspection(gameState);
      if (!exp) return "Analise a magnitude das cargas.";
      const isSmaller = exp.isNewMin;
      return `Comparação formal: A[${exp.j}] (${exp.scannerValue}) < A[${exp.minIndex}] (${exp.currentMinValue}). Como ${exp.scannerValue} ${
        isSmaller ? "<" : "≥"
      } ${exp.currentMinValue}, a carga inspecionada ${
        isSmaller
          ? "é MENOR que o candidato atual. Ação esperada: NOVO MÍNIMO."
          : "NÃO é menor que o candidato atual. Ação esperada: MANTER CANDIDATO."
      }`;
    }

    if (gameState.phase === "COMMIT") {
      const expCommit = getExpectedSelectionCommit(gameState);
      if (!expCommit) return "Confirme a passada.";
      return expCommit.shouldSwap
        ? `Varredura concluída. A menor carga encontrada (${expCommit.minValue}) está na posição #${expCommit.minIndex + 1}, enquanto a posição alvo é #${expCommit.i + 1} (${expCommit.targetValue}). Clique em TRANSFERIR MENOR CARGA.`
        : `Varredura concluída. A menor carga (${expCommit.minValue}) já se encontra na posição alvo #${expCommit.i + 1}. Clique em CONSOLIDAR POSIÇÃO sem permuta.`;
    }

    return "A esteira está totalmente consolidada.";
  };

  // --------------------------------------------------------------------------
  // 9. Reinício da Fase (Mantém exatamente o mesmo vetor e seed)
  // --------------------------------------------------------------------------
  const handleReset = () => {
    if (animTimeoutRef.current) window.clearTimeout(animTimeoutRef.current);
    if (completeTimeoutRef.current)
      window.clearTimeout(completeTimeoutRef.current);

    isActionLockedRef.current = false;
    completedCalledRef.current = false;
    setIsAnimating(false);
    setAnimatingPair(null);
    setShowHint(false);
    startTimeRef.current = getNow();

    const freshState = createSelectionSortState(initialArray);
    setGameState(freshState);
    setSessionMetrics(createPhaseSessionMetrics());

    const initialExp = getExpectedSelectionInspection(freshState);
    setMessage({
      text: initialExp
        ? `Fase reiniciada. Compare a carga #${initialExp.j + 1} (${initialExp.scannerValue}) com o candidato mínimo #${initialExp.minIndex + 1} (${initialExp.currentMinValue}).`
        : "Fase reiniciada.",
      type: "info",
    });

    onResetPhase?.();
  };

  // --------------------------------------------------------------------------
  // 10. Resolução Visual de Cada Caixa
  // --------------------------------------------------------------------------
  const getBoxRole = (idx: number): BoxRole => {
    if (sortedIndices.includes(idx)) {
      return "sorted";
    }

    const isTarget = idx === gameState.i;
    const isMin = idx === gameState.minIndex;
    const isScan = gameState.phase === "INSPECT" && idx === gameState.j;

    if (isTarget && isMin) return "target-min";
    if (isMin && isScan) return "scan-min";
    if (isTarget) return "target";
    if (isMin) return "min";
    if (isScan) return "scan";

    return "default";
  };

  const getBoxAnimation = (idx: number): "left" | "right" | null => {
    if (!animatingPair) return null;
    if (idx === animatingPair.target) return "right";
    if (idx === animatingPair.min) return "left";
    return null;
  };

  const getSwapDistance = (idx: number): number | undefined => {
    if (!animatingPair) return undefined;
    if (idx === animatingPair.target || idx === animatingPair.min) {
      return animatingPair.distance;
    }
    return undefined;
  };

  return (
    <div className="relative w-full h-full min-h-full overflow-y-auto bg-[#060b1a] bg-grid scanlines flex flex-col items-center justify-between py-4 px-2 sm:px-6">
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-cyan-500/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Header */}
      <PhaseHeader
        protocol="SELECTION"
        phase={phase}
        totalPhases={totalPhases}
      />

      <div className="relative z-10 flex flex-col items-center gap-4 max-w-4xl w-full my-auto py-2">
        {/* Subheader: pass & comparison info */}
        <div className="w-full flex flex-wrap items-center justify-between gap-2 px-2">
          <div className="flex items-center gap-2">
            <span
              className="text-xs px-2.5 py-1 rounded bg-purple-950/60 border border-purple-500/30 text-purple-300 tracking-wider font-bold"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              SELECTION SORT
            </span>
            <span
              className="text-xs text-white/50 font-mono"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              PASSADA {currentPassNumber} DE {totalPasses}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-white/50">
            <span>
              COMPARAÇÕES:{" "}
              <strong className="text-cyan-300">
                {gameState.comparisons}/{totalTheoreticalComparisons}
              </strong>
            </span>
            <span>•</span>
            <span>
              ERROS:{" "}
              <strong
                className={
                  gameState.errors > 0 ? "text-amber-400" : "text-white/70"
                }
              >
                {gameState.errors}
              </strong>
            </span>
            {sessionMetrics.hintsUsed > 0 && (
              <>
                <span>•</span>
                <span>
                  DICAS:{" "}
                  <strong className="text-cyan-400">
                    {sessionMetrics.hintsUsed}
                  </strong>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Textual Inspection / Commit Banner (Evitando depender apenas de cor) */}
        <div className="w-full rounded-lg bg-[#0a1638]/70 border border-purple-500/30 p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-md">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-white/40 uppercase">Alvo (i):</span>
              <span className="text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40">
                #{gameState.i + 1} ({currentTargetValue})
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-white/40 uppercase">Candidato Mín:</span>
              <span className="text-purple-300 font-bold bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/40">
                #{gameState.minIndex + 1} ({currentMinValue})
              </span>
            </div>

            {gameState.phase === "INSPECT" && currentScanValue !== null && (
              <div className="flex items-center gap-1.5">
                <span className="text-white/40 uppercase">Scanner (j):</span>
                <span className="text-cyan-300 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-400/40 animate-pulse">
                  #{gameState.j + 1} ({currentScanValue})
                </span>
              </div>
            )}
          </div>

          {/* Textual comparison formula */}
          <div className="text-xs font-bold text-right ml-auto">
            {gameState.phase === "INSPECT" && currentScanValue !== null ? (
              <span className="text-white/80">
                Comparação:{" "}
                <span className="text-cyan-300">
                  A[{gameState.j}] ({currentScanValue})
                </span>{" "}
                &lt;{" "}
                <span className="text-purple-300">
                  A[{gameState.minIndex}] ({currentMinValue})
                </span>
              </span>
            ) : gameState.phase === "COMMIT" ? (
              <span className="text-amber-300">
                {gameState.minIndex !== gameState.i
                  ? `Transferência: #${gameState.minIndex + 1} (${currentMinValue}) → #${gameState.i + 1} (${currentTargetValue})`
                  : `Consolidação: Posição #${gameState.i + 1} já contém o menor valor (${currentMinValue})`}
              </span>
            ) : (
              <span className="text-emerald-400">Vetor Consolidado</span>
            )}
          </div>
        </div>

        {/* Conveyor track (esteira linear sem wrapping, com scroll horizontal controlado) */}
        <div className="w-full py-6 px-4 rounded-xl conveyor-track bg-[#080f28]/90 flex flex-col items-center gap-4 overflow-hidden">
          <div className="w-full overflow-x-auto py-2">
            <div className="flex items-center justify-center gap-3 sm:gap-4 min-w-max mx-auto px-4">
              {gameState.currentValues.map((value, index) => (
                <NumberedBox
                  key={index}
                  value={value}
                  index={index}
                  role={getBoxRole(index)}
                  animating={getBoxAnimation(index)}
                  swapDistance={getSwapDistance(index)}
                  size={boxSize}
                  disabled={isAnimating}
                />
              ))}
            </div>
          </div>

          {/* Semantics role legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 border-t border-white/5 text-[10px] font-mono text-white/50 select-none">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500/30 border border-amber-500" />
              ALVO (i)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-purple-500/30 border border-purple-500" />
              MÍN (Candidato)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-cyan-500/30 border border-cyan-400" />
              SCAN (Sensor j)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500/30 border border-emerald-500" />
              OK (Consolidado)
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full flex items-center gap-3 px-2">
          <span
            className="text-[10px] text-white/30 font-mono uppercase tracking-wider"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Progresso:
          </span>
          <div className="flex-1 h-2 rounded-full bg-[#0d1635] border border-cyan-500/20 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span
            className="text-xs font-bold text-cyan-300 font-mono"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            {progressPercent}%
          </span>
        </div>

        {/* Instruction panel */}
        <div className="w-full">
          <InstructionPanel message={message.text} type={message.type} />
        </div>

        {/* Hint Callout (se ativado) */}
        {showHint && (
          <div className="w-full p-3.5 rounded-lg bg-cyan-950/50 border border-cyan-500/40 flex flex-col gap-1.5 animate-fade-in shadow-lg">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-mono font-bold">
              <span>💡 DICA PEDAGÓGICA (SELECTION SORT)</span>
            </div>
            <p
              className="text-xs text-cyan-200/95 leading-relaxed"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {getHintExplanation()}
            </p>
          </div>
        )}

        {/* Action Controls based on FSM Phase */}
        <div className="w-full flex flex-col items-center gap-3">
          {gameState.completed ? (
            <div className="flex flex-col items-center gap-2 w-full max-w-sm">
              <div className="text-center p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 w-full">
                <span className="text-emerald-400 text-sm font-bold block font-mono">
                  ✓ ORDENAÇÃO CONCLUÍDA!
                </span>
                <span className="text-[11px] text-white/60 font-mono">
                  Calculando métricas da fase...
                </span>
              </div>
            </div>
          ) : gameState.phase === "INSPECT" ? (
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="flex items-center justify-center gap-4 w-full max-w-md">
                <GameButton
                  onClick={() => handleInspectionDecision("SELECT_NEW_MIN")}
                  variant="primary"
                  size="md"
                  disabled={isAnimating}
                  className="flex-1 border-purple-500/50 text-purple-300 hover:border-purple-400 shadow-lg shadow-purple-950/40"
                >
                  ✦ &nbsp; NOVO MÍNIMO
                </GameButton>

                <GameButton
                  onClick={() => handleInspectionDecision("KEEP_MIN")}
                  variant="secondary"
                  size="md"
                  disabled={isAnimating}
                  className="flex-1"
                >
                  = &nbsp; MANTER CANDIDATO
                </GameButton>
              </div>

              <div className="flex items-center justify-between w-full max-w-md px-2">
                <button
                  onClick={handleToggleHint}
                  className="text-xs text-cyan-400/80 hover:text-cyan-300 transition-colors font-mono cursor-pointer flex items-center gap-1"
                >
                  <span>{showHint ? "▲ OCULTAR DICA" : "💡 PRECISA DE UMA DICA?"}</span>
                  {sessionMetrics.hintsUsed > 0 && (
                    <span className="text-white/30">({sessionMetrics.hintsUsed})</span>
                  )}
                </button>

                <button
                  onClick={handleReset}
                  className="text-xs text-white/30 hover:text-white/70 transition-colors font-mono cursor-pointer"
                >
                  ↺ REINICIAR FASE
                </button>
              </div>
            </div>
          ) : (
            // Phase: COMMIT (Ações de inspeção rigorosamente ocultas/desabilitadas)
            <div className="flex flex-col items-center gap-3 w-full max-w-md">
              <GameButton
                onClick={handleCommitPass}
                variant="primary"
                size="lg"
                disabled={isAnimating}
                className="w-full border-amber-500/60 text-amber-300 hover:border-amber-400 shadow-lg shadow-amber-950/40"
              >
                {gameState.minIndex !== gameState.i
                  ? "⇄ &nbsp; TRANSFERIR MENOR CARGA"
                  : "✓ &nbsp; CONSOLIDAR POSIÇÃO"}
              </GameButton>

              <div className="flex items-center justify-between w-full px-2">
                <button
                  onClick={handleToggleHint}
                  className="text-xs text-cyan-400/80 hover:text-cyan-300 transition-colors font-mono cursor-pointer flex items-center gap-1"
                >
                  <span>{showHint ? "▲ OCULTAR DICA" : "💡 EXPLICAR CONSOLIDAÇÃO"}</span>
                </button>

                <button
                  onClick={handleReset}
                  className="text-xs text-white/30 hover:text-white/70 transition-colors font-mono cursor-pointer"
                >
                  ↺ REINICIAR FASE
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom status & stats summary */}
      <div className="w-full flex items-center justify-between px-2 pt-2 border-t border-white/5">
        <StatsPanel
          comparisons={gameState.comparisons}
          swaps={gameState.swaps}
        />

        <div className="text-[10px] text-white/30 font-mono hidden sm:block text-right">
          <span>VARRE PRIMEIRO • TROCA NO FINAL DA PASSADA</span>
        </div>
      </div>
    </div>
  );
}
