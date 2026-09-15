import { useState, useEffect, useMemo } from "react";
import NumberedBox from "../components/NumberedBox";
import GameButton from "../components/GameButton";
import BubbleSortPseudocodePanel from "../components/BubbleSortPseudocodePanel";
import { buildReplayFrames, getReplayFrame } from "../game/replay";
import type { BubbleSortVariant, StepRecord } from "../game/sorting/types";

interface ReplayScreenProps {
  initialArray: readonly number[];
  history: readonly StepRecord[];
  phase?: number;
  variant?: BubbleSortVariant;
  earlyExitTriggered?: boolean;
  mode?: "replay" | "demonstration";
  onBackToResult: () => void;
  onStartTraining?: () => void;
}

export default function ReplayScreen({
  initialArray,
  history,
  phase = 1,
  variant = "CANONICAL",
  earlyExitTriggered = false,
  mode = "replay",
  onBackToResult,
  onStartTraining,
}: ReplayScreenProps) {
  // Derivação pura e determinística de todos os quadros a partir do histórico real
  const frames = useMemo(
    () => buildReplayFrames(initialArray, history, { variant, earlyExitTriggered }),
    [initialArray, history, variant, earlyExitTriggered]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(mode === "demonstration");
  const [playbackSpeed, setPlaybackSpeed] = useState<0.5 | 1 | 2>(1);

  const currentFrame = getReplayFrame(frames, currentIndex);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === frames.length - 1;

  // Autoplay da reprodução
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = Math.round(1200 / playbackSpeed);
    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev < frames.length - 1) {
          return prev + 1;
        } else {
          setIsPlaying(false);
          return prev;
        }
      });
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [isPlaying, frames.length, playbackSpeed]);

  const handlePrevious = () => {
    setIsPlaying(false);
    if (!isFirst) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    setIsPlaying(false);
    if (!isLast) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleResetReplay = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (isLast) {
        // Se estiver no último quadro, reinicia do início e reproduz
        setCurrentIndex(0);
      }
      setIsPlaying(true);
    }
  };

  const boxSize = initialArray.length >= 6 ? "md" : "lg";
  const progressPercent = Math.round(
    (currentFrame.stepNumber / Math.max(1, currentFrame.totalSteps)) * 100
  );

  return (
    <div className="relative w-full h-full min-h-full overflow-y-auto bg-[#060b1a] bg-grid scanlines flex flex-col justify-start pt-4 sm:pt-6 pb-16 sm:pb-24 px-4 md:px-6 gap-4 sm:gap-6">
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between panel-border bg-[#080f28]/80 rounded-xl px-6 py-3 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <div className="flex flex-col">
            <span
              className="text-[10px] text-cyan-400 tracking-widest uppercase font-mono"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {mode === "demonstration"
                ? "MODO DEMONSTRAÇÃO // EXECUÇÃO CANÔNICA"
                : variant === "EARLY_EXIT"
                  ? "AUDITORIA TÉCNICA // MODO DESAFIO (EARLY EXIT)"
                  : "AUDITORIA TÉCNICA // MODO REPLAY"}
            </span>
            <span
              className="text-lg font-black text-white tracking-tight"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              {mode === "demonstration"
                ? "PROTOCOLO BUBBLE SORT"
                : variant === "EARLY_EXIT"
                  ? `CENÁRIO ${phase} — VARIANTE EARLY EXIT`
                  : `FASE ${phase} — PROTOCOLO BUBBLE`}
            </span>
          </div>
        </div>

        <GameButton
          onClick={onBackToResult}
          variant="secondary"
          size="sm"
          aria-label={mode === "demonstration" ? "Voltar da demonstração" : "Voltar ao resultado"}
        >
          {mode === "demonstration" ? "← VOLTAR" : "← VOLTAR AO RESULTADO"}
        </GameButton>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-start sm:justify-center gap-4 sm:gap-5 max-w-4xl w-full mx-auto my-0 py-2">
        {/* Step & Action Badge Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span
              className="text-sm font-bold text-white/50 tracking-wider px-3 py-1 rounded border border-white/10 bg-white/5"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              PASSO {currentFrame.stepNumber} / {currentFrame.totalSteps}
            </span>

            {currentFrame.action === "INITIAL" && (
              <span
                className="text-xs font-bold text-cyan-300 tracking-wider px-3 py-1 rounded border border-cyan-500/30 bg-cyan-950/40"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                ESTADO INICIAL
              </span>
            )}
            {currentFrame.action === "SWAP" && (
              <span
                className="text-xs font-bold text-purple-300 tracking-wider px-3 py-1 rounded border border-purple-500/30 bg-purple-950/40"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                ⇄ TROCA REALIZADA (SWAP)
              </span>
            )}
            {currentFrame.action === "KEEP" && (
              <span
                className="text-xs font-bold text-emerald-300 tracking-wider px-3 py-1 rounded border border-emerald-500/30 bg-emerald-950/40"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                = ORDEM MANTIDA (KEEP)
              </span>
            )}
            {currentFrame.earlyExitTriggered && (
              <span
                className="text-xs font-bold text-amber-300 tracking-wider px-3 py-1 rounded border border-amber-500/40 bg-amber-950/60 animate-pulse"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                ⚡ TÉRMINO ANTECIPADO (0 TROCAS)
              </span>
            )}
          </div>

          {currentFrame.action !== "INITIAL" && (
            <div
              className="flex items-center gap-4 text-xs text-white/60 mt-1"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              <span>
                Passada {currentFrame.passNumber}/{currentFrame.totalPasses}
              </span>
              <span>•</span>
              <span>
                Comparação {currentFrame.comparisonNumber}/{currentFrame.totalComparisonsInPass}
              </span>
              <span>•</span>
              <span className="text-white font-bold">
                {currentFrame.leftValue} {currentFrame.action === "SWAP" ? ">" : "≤"} {currentFrame.rightValue}
              </span>
            </div>
          )}
        </div>

        {/* Conveyor Belt Display */}
        <div className="w-full panel-border bg-[#080f28]/90 rounded-2xl p-6 flex flex-col items-center gap-4 shadow-2xl shadow-cyan-950/20">
          {/* Conveyor Visual Indicators */}
          <div className="w-full flex items-center justify-between text-[10px] text-white/30 tracking-widest px-2"
            style={{ fontFamily: "'Space Mono', monospace" }}>
            <span>◄ POSIÇÃO 1</span>
            <span className="text-cyan-400/50">ESTEIRA DE TRIAGEM AUTOMATIZADA</span>
            <span>POSIÇÃO {initialArray.length} ►</span>
          </div>

          {/* Boxes with controlled horizontal scrolling */}
          <div className="w-full overflow-x-auto py-1">
            <div className="flex items-center justify-center gap-2.5 sm:gap-4 min-w-max mx-auto px-2">
              {currentFrame.values.map((value, index) => {
                const isActive =
                  currentFrame.activeIndices !== null &&
                  (index === currentFrame.activeIndices[0] ||
                    index === currentFrame.activeIndices[1]);

                const isSorted = currentFrame.sortedIndices.includes(index);

                return (
                  <NumberedBox
                    key={index}
                    value={value}
                    index={index}
                    selected={isActive}
                    disabled={false}
                    sorted={isSorted}
                    onClick={() => {}}
                    size={boxSize}
                  />
                );
              })}
            </div>
          </div>

          {/* Factual Explanation Callout */}
          <div className="w-full bg-[#0d1635]/80 border border-white/10 rounded-xl px-4 py-2.5 text-center">
            <p
              className="text-xs text-white/80 leading-relaxed"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {currentFrame.explanation}
            </p>
          </div>
        </div>

        {/* Synchronized Pseudocode Panel (P1.4 / P1.8) */}
        <BubbleSortPseudocodePanel
          frame={currentFrame}
          variant={variant}
          className="w-full"
        />

        {/* Replay Timeline Progress Bar */}
        <div className="w-full max-w-xl flex flex-col gap-1.5">
          <div
            className="flex justify-between items-center text-[10px] text-white/40"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            <span>PROGRESSO DA EXECUÇÃO</span>
            <span className="text-cyan-400 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 panel-border bg-[#080f28]/90 rounded-xl px-4 sm:px-6 py-4 max-w-3xl w-full mx-auto shrink-0">
        <GameButton onClick={handleResetReplay} variant="secondary" size="sm" icon="↺">
          REINICIAR
        </GameButton>

        <GameButton
          onClick={handlePrevious}
          variant="secondary"
          size="md"
          disabled={isFirst}
          icon="←"
        >
          ANTERIOR
        </GameButton>

        <GameButton
          onClick={handleTogglePlay}
          variant={isPlaying ? "danger" : "primary"}
          size="md"
          icon={isPlaying ? "⏸" : "▶"}
        >
          {isPlaying ? "PAUSAR" : "REPRODUZIR"}
        </GameButton>

        <GameButton
          onClick={handleNext}
          variant="secondary"
          size="md"
          disabled={isLast}
          icon="→"
          iconPosition="right"
        >
          PRÓXIMO
        </GameButton>

        {/* Speed Selector (0.5x, 1x, 2x) */}
        <div
          className="flex items-center gap-1 bg-[#060b1a] border border-white/10 rounded-lg p-1"
          role="group"
          aria-label="Velocidade da reprodução"
        >
          {([0.5, 1, 2] as const).map((spd) => (
            <button
              key={spd}
              type="button"
              onClick={() => setPlaybackSpeed(spd)}
              className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
                playbackSpeed === spd
                  ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40"
                  : "text-white/40 hover:text-white"
              }`}
              style={{ fontFamily: "'Space Mono', monospace" }}
              aria-pressed={playbackSpeed === spd}
              aria-label={`Velocidade ${spd}x`}
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* Optional Demonstration Training CTA */}
        {mode === "demonstration" && onStartTraining && (
          <GameButton
            onClick={onStartTraining}
            variant="primary"
            size="md"
            icon="▶"
            className="border-cyan-400 bg-cyan-600/30 text-cyan-200 hover:bg-cyan-500/40"
          >
            INICIAR TREINAMENTO
          </GameButton>
        )}
      </div>
    </div>
  );
}
