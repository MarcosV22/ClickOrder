import { useState, useEffect, useMemo } from "react";
import NumberedBox, { type BoxRole } from "../components/NumberedBox";
import InsertionHoleSlot from "../components/InsertionHoleSlot";
import GameButton from "../components/GameButton";
import InsertionSortPseudocodePanel from "../components/InsertionSortPseudocodePanel";
import {
  buildInsertionReplayFrames,
  getInsertionReplayFrame,
} from "../game/sorting/insertion/insertionReplayModel";
import type { InsertionStepRecord } from "../game/sorting/insertion/types";

export interface InsertionReplayScreenProps {
  initialArray: readonly number[];
  history: readonly InsertionStepRecord[];
  practiceTitle?: string;
  mode?: "replay" | "demonstration";
  onBackToResult: () => void;
  onStartTraining?: () => void;
}

export default function InsertionReplayScreen({
  initialArray,
  history,
  practiceTitle,
  mode = "replay",
  onBackToResult,
  onStartTraining,
}: InsertionReplayScreenProps) {
  // Derivação pura e imutável de todos os quadros a partir do histórico real
  const frames = useMemo(
    () => buildInsertionReplayFrames(initialArray, history),
    [initialArray, history]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(mode === "demonstration");
  const [playbackSpeed, setPlaybackSpeed] = useState<0.5 | 1 | 2>(1);

  const currentFrame = getInsertionReplayFrame(frames, currentIndex);
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

  // Resolução semântica do papel visual de cada carga na esteira no quadro atual
  const getBoxRole = (idx: number): BoxRole => {
    if (currentFrame.isCompleted) {
      return "sorted";
    }

    // Se estiver na posição do scanner j
    if (idx === currentFrame.j) {
      if (idx <= currentFrame.orderedBoundary) {
        return "ordered-scan";
      }
      return "scan";
    }

    // Se estiver estritamente dentro da partição ordenada relativa
    if (idx <= currentFrame.orderedBoundary) {
      return "ordered";
    }

    return "default";
  };

  return (
    <div className="relative w-full h-full min-h-full overflow-y-auto bg-[#060b1a] bg-grid scanlines flex flex-col justify-start pt-4 sm:pt-6 pb-16 sm:pb-24 px-4 md:px-6 gap-4 sm:gap-6">
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-500/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between panel-border bg-[#080f28]/80 rounded-xl px-6 py-3 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <div className="flex flex-col">
            <span
              className="text-[10px] text-amber-400 tracking-widest uppercase font-mono"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {mode === "demonstration"
                ? "MODO DEMONSTRAÇÃO // EXECUÇÃO CANÔNICA"
                : "AUDITORIA TÉCNICA // MODO REPLAY"}
            </span>
            <span
              className="text-lg font-black text-white tracking-tight"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              {mode === "demonstration"
                ? "PROTOCOLO INSERTION SORT"
                : (practiceTitle ?? "PRÁTICA — PROTOCOLO INSERTION")}
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
              className="text-sm font-bold text-white/50 tracking-wider px-3 py-1 rounded border border-white/10 bg-white/5 font-mono"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              PASSO {currentFrame.stepNumber} / {currentFrame.totalSteps}
            </span>

            {currentFrame.frameType === "INITIAL" && (
              <span
                className="text-xs font-bold text-amber-300 tracking-wider px-3 py-1 rounded border border-amber-500/30 bg-amber-950/40 font-mono"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                ESTADO INICIAL
              </span>
            )}
            {currentFrame.frameType === "KEY_LIFT" && (
              <span
                className="text-xs font-bold text-amber-300 tracking-wider px-3 py-1 rounded border border-amber-500/40 bg-amber-950/50 animate-pulse font-mono"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {currentFrame.actionLabel}
              </span>
            )}
            {currentFrame.frameType === "SHIFT" && (
              <span
                className="text-xs font-bold tracking-wider px-3 py-1 rounded border border-purple-500/40 bg-purple-950/50 text-purple-200 font-mono"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {currentFrame.actionLabel}
              </span>
            )}
            {currentFrame.frameType === "INSERT" && (
              <span
                className="text-xs font-bold tracking-wider px-3 py-1 rounded border border-emerald-500/40 bg-emerald-950/50 text-emerald-300 font-mono"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {currentFrame.actionLabel}
              </span>
            )}
          </div>

          {/* Subheader com dados da passada e comparação concreta */}
          {currentFrame.frameType !== "INITIAL" && (
            <div
              className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-white/60 mt-1 font-mono"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              <span>
                Passada {currentFrame.passNumber}/{currentFrame.totalPasses}
              </span>
              <span>•</span>
              <span>
                <strong className="text-amber-400">CHAVE</strong>: {currentFrame.key ?? currentFrame.insertedValue ?? "—"}
              </span>
              <span>•</span>
              <span>
                <strong className="text-amber-300/80">VAGA</strong>: {currentFrame.holeIndex !== null ? `#${currentFrame.holeIndex + 1}` : "—"}
              </span>
              <span>•</span>
              <span>
                <strong className="text-emerald-400">ORD</strong>: 0 .. #{currentFrame.orderedBoundary + 1}
              </span>
              <span>•</span>
              <span className="text-white font-bold">
                {currentFrame.comparisonText}
              </span>
            </div>
          )}
        </div>

        {/* Visual Conveyor + Overhead Rail Display */}
        <div className="w-full panel-border bg-[#080f28]/90 rounded-2xl p-6 flex flex-col items-center gap-4 shadow-2xl shadow-amber-950/20 relative overflow-hidden">
          {/* Ambient Rail Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-amber-500/10 blur-[80px] pointer-events-none" />

          {/* TRILHO AÉREO */}
          <div className="w-full flex flex-col items-center gap-2 pb-3 border-b border-dashed border-white/10">
            <div
              className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-amber-400/80 uppercase"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>TRILHO AÉREO DE SUSPENSÃO</span>
            </div>

            <div className="h-24 flex items-center justify-center">
              {currentFrame.key !== null ? (
                <div className="flex flex-col items-center gap-1">
                  <NumberedBox
                    value={currentFrame.key}
                    index={-1}
                    role="key"
                    badge="CHAVE"
                    size={boxSize}
                  />
                  <span className="text-[9px] font-mono font-bold text-amber-400 tracking-wider animate-bounce">
                    ▼ CARGA ISOLADA
                  </span>
                </div>
              ) : (
                <div
                  className="px-6 py-3 rounded-lg border border-dashed border-white/10 bg-white/[0.02] text-xs font-mono text-white/30 tracking-wider"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  TRILHO AÉREO LIVRE
                </div>
              )}
            </div>
          </div>

          {/* ESTEIRA OPERACIONAL */}
          <div className="w-full flex flex-col items-center gap-3">
            <div
              className="w-full flex items-center justify-between text-[10px] text-white/30 tracking-widest px-2 font-mono"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              <span>◄ POSIÇÃO 1</span>
              <span className="text-amber-400/50">
                ESTEIRA DE TRIAGEM // PROTOCOLO INSERTION
              </span>
              <span>POSIÇÃO {initialArray.length} ►</span>
            </div>

            {/* Boxes with horizontal layout */}
            <div className="w-full overflow-x-auto py-1">
              <div className="flex items-center justify-center gap-2.5 sm:gap-4 min-w-max mx-auto px-2">
                {currentFrame.values.map((val, index) => {
                  if (val === null) {
                    return (
                      <InsertionHoleSlot
                        key={`hole-${index}`}
                        index={index}
                        size={boxSize}
                      />
                    );
                  }

                  const role = getBoxRole(index);

                  return (
                    <NumberedBox
                      key={`box-${index}-${val}`}
                      value={val}
                      index={index}
                      role={role}
                      disabled={false}
                      onClick={() => {}}
                      size={boxSize}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Legenda Canônica de Papéis Visuais */}
          <div
            className="flex flex-wrap items-center justify-center gap-4 pt-2 border-t border-white/5 text-[10px] font-mono text-white/50"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500/40 border border-amber-400" />
              CHAVE (Trilho)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded border border-dashed border-amber-400/80 bg-amber-950/40" />
              VAGA (Aberta)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500/30 border border-dashed border-emerald-400" />
              ORD (Partição)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-cyan-500/30 border border-cyan-400" />
              ORD • SCAN (j)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-slate-800 border border-white/20" />
              PKG (Não Processada)
            </span>
          </div>

          {/* Factual Explanation Callout */}
          <div className="w-full bg-[#0d1635]/80 border border-white/10 rounded-xl px-4 py-2.5 text-center">
            <p
              className="text-xs text-white/80 leading-relaxed font-mono"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {currentFrame.explanation}
            </p>
          </div>
        </div>

        {/* Synchronized Pseudocode Panel (P2.2-E) */}
        <InsertionSortPseudocodePanel
          frame={currentFrame}
          className="w-full"
        />

        {/* Replay Timeline Progress Bar */}
        <div className="w-full max-w-xl flex flex-col gap-1.5">
          <div
            className="flex justify-between items-center text-[10px] text-white/40 font-mono"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            <span>PROGRESSO DA EXECUÇÃO</span>
            <span className="text-amber-400 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-purple-500 to-emerald-500 transition-all duration-300"
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
                  ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40"
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
            className="border-amber-400 bg-amber-600/30 text-amber-200 hover:bg-amber-500/40"
          >
            INICIAR TREINAMENTO
          </GameButton>
        )}
      </div>
    </div>
  );
}

// Alias de convenção para uso explícito da tela de visualização
export { InsertionReplayScreen as InsertionVisualizationScreen };
