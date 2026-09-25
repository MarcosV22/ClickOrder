import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import NumberedBox, { type BoxRole } from "../components/NumberedBox";
import GameButton from "../components/GameButton";
import MergeSortPseudocodePanel from "../components/MergeSortPseudocodePanel";
import {
  buildMergeReplayFrames,
  getMergeReplayFrame,
  type MergeReplayFrame,
} from "../game/sorting/merge/mergeReplayModel";
import { formatMergeElementLabel } from "../game/sorting/merge/mergePedagogy";
import { normalizeMergeInput } from "../game/sorting/merge/mergeSortEngine";
import type { MergeElement, MergeStepRecord } from "../game/sorting/merge/types";

export interface MergeReplayScreenProps {
  initialElements?: readonly MergeElement[];
  initialArray?: readonly number[];
  history: readonly MergeStepRecord[];
  practiceTitle?: string;
  mode?: "replay" | "demonstration";
  onBackToResult: () => void;
  onStartTraining?: () => void;
}

export default function MergeReplayScreen({
  initialElements,
  initialArray,
  history,
  practiceTitle,
  mode = "replay",
  onBackToResult,
  onStartTraining,
}: MergeReplayScreenProps) {
  // Resolução dos elementos iniciais: suporta tanto initialElements estruturados quanto initialArray numérico
  const resolvedElements = useMemo(() => {
    if (initialElements && initialElements.length > 0) return initialElements;
    if (initialArray && initialArray.length > 0) return normalizeMergeInput(initialArray);
    return Object.freeze([]);
  }, [initialElements, initialArray]);

  // Derivação pura e imutável de todos os quadros a partir da entrada inicial e do histórico factual
  const frames = useMemo(
    () => buildMergeReplayFrames(resolvedElements, history),
    [resolvedElements, history],
  );

  // Detecção de preferência por redução de movimento do sistema operacional
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(() =>
    mode === "demonstration" && !prefersReducedMotion,
  );
  const [playbackSpeed, setPlaybackSpeed] = useState<0.5 | 1 | 2>(1);

  const currentFrame = getMergeReplayFrame(frames, currentIndex);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === frames.length - 1;

  // Autoplay da reprodução com cancelamento estrito de callbacks e timers obsoletos
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = Math.round(1400 / playbackSpeed);
    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev < frames.length - 1) {
          return prev + 1;
        } else {
          // Chegou ao último frame: encerra a reprodução automaticamente
          setIsPlaying(false);
          return prev;
        }
      });
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [isPlaying, frames.length, playbackSpeed]);

  const handlePrevious = useCallback(() => {
    setIsPlaying(false);
    if (!isFirst) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [isFirst]);

  const handleNext = useCallback(() => {
    setIsPlaying(false);
    if (!isLast) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [isLast]);

  const handleFirst = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(0);
  }, []);

  const handleLast = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(frames.length - 1);
  }, [frames.length]);

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (isLast) {
        // Se estiver no último quadro, reinicia do início e reproduz
        setCurrentIndex(0);
      }
      setIsPlaying(true);
    }
  }, [isPlaying, isLast]);

  // Teclado local: atalhos com respeito estrito a controles focados e campos editáveis
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat) return;
      const target = event.target as HTMLElement | null;

      const elem =
        target && typeof (target as Element).closest === "function"
          ? (target as Element)
          : null;

      const isInteractive = Boolean(
        elem?.closest("button, a, input, textarea, select, [role='button']") ||
        (elem as HTMLElement)?.isContentEditable,
      );

      // Se qualquer controle interativo estiver focado, preserva sua ativação nativa
      if (isInteractive) {
        if (event.key === " " || event.key === "Enter") {
          return;
        }
        if (
          elem?.tagName === "INPUT" ||
          elem?.tagName === "TEXTAREA" ||
          (elem as HTMLElement)?.isContentEditable
        ) {
          return;
        }
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handlePrevious();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        handleNext();
      } else if (event.key === "Home") {
        event.preventDefault();
        handleFirst();
      } else if (event.key === "End") {
        event.preventDefault();
        handleLast();
      } else if (event.key === " " && !isInteractive) {
        event.preventDefault();
        handleTogglePlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFirst, handleLast, handleNext, handlePrevious, handleTogglePlay]);

  const progressPercent = Math.round(
    (currentFrame.stepNumber / Math.max(1, currentFrame.totalSteps)) * 100,
  );

  // Resolução semântica do papel visual e badge de cada carga no vetor principal
  const getBoxState = (idx: number): { role: BoxRole; badge?: string } => {
    if (currentFrame.isCompleted) {
      return { role: "sorted", badge: "OK" };
    }

    // Se este índice pertence a algum intervalo já consolidado no histórico até este frame
    const inSortedInterval = currentFrame.sortedIntervals.some(
      (interval) => idx >= interval.left && idx <= interval.right,
    );
    if (inSortedInterval) {
      return { role: "ordered", badge: "ORD" };
    }

    // Se estiver sob o sensor do Ramal Esquerdo ou Direito
    if (idx === currentFrame.p1 || idx === currentFrame.p2) {
      return {
        role: "pair",
        badge: idx === currentFrame.p1 ? "E" : "D",
      };
    }

    // Se estiver dentro do intervalo em intercalação ativa
    if (
      currentFrame.activeInterval &&
      idx >= currentFrame.activeInterval.left &&
      idx <= currentFrame.activeInterval.right
    ) {
      return { role: "scan" };
    }

    return { role: "default" };
  };

  const bufferLength = currentFrame.activeInterval
    ? currentFrame.activeInterval.right - currentFrame.activeInterval.left + 1
    : currentFrame.buffer.length;

  return (
    <div className="relative w-full h-full min-h-screen overflow-y-auto overflow-x-hidden bg-[#060b1a] bg-grid scanlines flex flex-col justify-start pt-4 sm:pt-6 pb-16 sm:pb-24 px-4 md:px-6 gap-4 sm:gap-6 select-none">
      {/* Luzes de ambiência */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[750px] h-[350px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-sky-500/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between panel-border bg-[#080f28]/80 rounded-xl px-6 py-3 shrink-0 gap-3">
        <div className="flex items-center gap-4">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
          <div className="flex flex-col">
            <span
              className="text-[10px] text-teal-400 tracking-widest uppercase font-mono"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {mode === "demonstration"
                ? "MODO DEMONSTRAÇÃO // EXECUÇÃO CANÔNICA"
                : "MODO REPLAY // REVISÃO DA TENTATIVA"}
            </span>
            <span
              className="text-lg font-black text-white tracking-tight"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              {mode === "demonstration"
                ? "PROTOCOLO MERGE SORT"
                : (practiceTitle ?? "PRÁTICA — PROTOCOLO MERGE SORT")}
            </span>
          </div>
        </div>

        <GameButton
          onClick={onBackToResult}
          variant="secondary"
          size="sm"
          aria-label={
            mode === "demonstration"
              ? "Voltar da demonstração"
              : "Voltar à tela de resultado"
          }
        >
          {mode === "demonstration" ? "← VOLTAR" : "← VOLTAR AO RESULTADO"}
        </GameButton>
      </div>

      {/* Área Central de Conteúdo */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-start gap-4 sm:gap-5 max-w-5xl w-full mx-auto my-0 py-2">
        {/* Cabeçalho de Passos e Badges Semânticos */}
        <div className="flex flex-col items-center gap-2 text-center w-full">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span
              className="text-sm font-bold text-slate-200 tracking-wider px-3 py-1 rounded border border-white/20 bg-white/5 font-mono"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              PASSO {currentFrame.stepNumber} / {currentFrame.totalSteps}
            </span>

            <span
              className={`text-xs font-bold tracking-wider px-3 py-1 rounded border font-mono ${
                currentFrame.frameType === "INITIAL"
                  ? "border-teal-500/30 bg-teal-950/40 text-teal-300"
                  : currentFrame.frameType === "DIVIDE"
                    ? "border-cyan-500/30 bg-cyan-950/40 text-cyan-200"
                    : currentFrame.frameType === "MERGE_INIT"
                      ? "border-purple-500/30 bg-purple-950/40 text-purple-200"
                      : currentFrame.frameType === "DISPATCH"
                        ? currentFrame.dispatchedSource === "LEFT"
                          ? "border-teal-500/40 bg-teal-950/50 text-teal-200"
                          : "border-sky-500/40 bg-sky-950/50 text-sky-200"
                        : currentFrame.frameType === "DRAIN"
                          ? "border-indigo-500/40 bg-indigo-950/50 text-indigo-200"
                          : "border-amber-500/40 bg-amber-950/50 text-amber-200"
              }`}
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {currentFrame.actionLabel}
            </span>

            {currentFrame.isCompleted && (
              <span className="text-xs font-bold tracking-wider px-3 py-1 rounded border border-emerald-500/40 bg-emerald-950/50 text-emerald-300 font-mono animate-pulse">
                ✓ ORDENAÇÃO CONCLUÍDA (OK)
              </span>
            )}
          </div>

          {/* Telemetria de Métricas Algorítmicas do Frame */}
          <div
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-200 mt-1 font-mono bg-[#030614]/70 px-4 py-2 rounded-lg border border-white/10 font-semibold"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            <span>
              <strong className="text-teal-400">COMPARAÇÕES:</strong>{" "}
              {currentFrame.cumulativeComparisons}
            </span>
            <span className="text-white/30" aria-hidden="true">|</span>
            <span>
              <strong className="text-amber-400">ESCRITAS NO BUFFER:</strong>{" "}
              {currentFrame.cumulativeWritesInBuffer}
            </span>
            <span className="text-white/30" aria-hidden="true">|</span>
            <span>
              <strong className="text-sky-400">ESCRITAS NO PRINCIPAL:</strong>{" "}
              {currentFrame.cumulativeWritesInMain}
            </span>
            <span className="text-white/30" aria-hidden="true">|</span>
            <span>
              <strong className="text-purple-300">TOTAL ESCRITAS:</strong>{" "}
              {currentFrame.cumulativeTotalWrites}
            </span>
          </div>
        </div>

        {/* Estação Visual: Esteira Principal e Buffer Auxiliar */}
        <div className="w-full panel-border bg-[#080f28]/90 rounded-2xl p-6 flex flex-col items-center gap-6 shadow-2xl shadow-teal-950/20 relative overflow-hidden">
          {/* Subheader da Intercalação de Grupos */}
          {currentFrame.activeInterval && (
            <div className="w-full flex flex-wrap items-center justify-between pb-3 border-b border-white/10 text-xs font-mono text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                <span className="text-teal-300 font-bold uppercase">
                  INTERCALAÇÃO ATIVA: [{currentFrame.activeInterval.left}..
                  {currentFrame.activeInterval.right}]
                </span>
                <span>(meio = {currentFrame.activeInterval.mid})</span>
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <span className="text-teal-300 font-semibold">
                  Grupo E: [{currentFrame.activeInterval.left}..
                  {currentFrame.activeInterval.mid}]
                </span>
                <span className="text-sky-300 font-semibold">
                  Grupo D: [{currentFrame.activeInterval.mid + 1}..
                  {currentFrame.activeInterval.right}]
                </span>
              </div>
            </div>
          )}

          {/* VETOR PRINCIPAL */}
          <div className="w-full flex flex-col items-center gap-2">
            <div
              className="flex items-center gap-2 text-xs font-mono tracking-wider text-teal-300 uppercase font-bold"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span>VETOR PRINCIPAL A[0..{currentFrame.values.length - 1}]</span>
            </div>

            <div className="flex flex-wrap items-end justify-center gap-3 sm:gap-4 py-2">
              {currentFrame.values.map((element, idx) => {
                const boxState = getBoxState(idx);
                const isP1 = idx === currentFrame.p1;
                const isP2 = idx === currentFrame.p2;

                return (
                  <div key={element.id} className="flex flex-col items-center gap-1.5">
                    {/* Indicador de Frente de Leitura */}
                    <div className="h-4 flex items-center justify-center text-[10px] font-mono font-bold">
                      {isP1 && (
                        <span className="text-teal-300 animate-pulse">▼ p1 (E)</span>
                      )}
                      {isP2 && (
                        <span className="text-sky-300 animate-pulse">▼ p2 (D)</span>
                      )}
                    </div>

                    <NumberedBox
                      value={element.value}
                      elementLabel={element.label}
                      index={idx}
                      role={boxState.role}
                      badge={boxState.badge}
                      size="md"
                    />

                    {/* Índice da posição no vetor */}
                    <span className="text-xs font-mono text-slate-300 font-bold">
                      #{idx}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* VETOR AUXILIAR TEMPORÁRIO (ESTEIRA COLETORA) */}
          {(currentFrame.activeInterval || currentFrame.buffer.length > 0) && (
            <div className="w-full flex flex-col items-center gap-2 pt-4 border-t border-dashed border-white/10">
              <div
                className="flex items-center gap-2 text-xs font-mono tracking-wider text-amber-300 uppercase font-bold"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>VETOR AUXILIAR TEMPORÁRIO B</span>
              </div>

              <div className="flex flex-wrap items-end justify-center gap-3 py-2">
                {Array.from({ length: Math.max(bufferLength, currentFrame.buffer.length) }).map(
                  (_, kIdx) => {
                    const buffered = currentFrame.buffer[kIdx];
                    const isNextWriteSlot = kIdx === currentFrame.k;

                    return (
                      <div key={kIdx} className="flex flex-col items-center gap-1">
                        <div className="h-4 flex items-center justify-center text-[9px] font-mono">
                          {isNextWriteSlot && (
                            <span className="text-amber-300 font-bold">▼ k ({kIdx})</span>
                          )}
                        </div>

                        {buffered ? (
                          <NumberedBox
                            value={buffered.value}
                            elementLabel={buffered.label}
                            index={kIdx}
                            role="ordered"
                            badge={`B[${kIdx}]`}
                            size="sm"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg border border-dashed border-white/20 bg-white/5 flex items-center justify-center text-slate-400 text-xs font-mono font-bold">
                            {kIdx}
                          </div>
                        )}

                        <span className="text-xs font-mono text-slate-300 font-semibold">
                          B[{kIdx}]
                        </span>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          )}

          {/* Painel Descritivo do Quadro */}
          <div
            tabIndex={0}
            role="region"
            aria-label="Explicação pedagógica do quadro atual"
            className="w-full panel-border bg-[#030614]/80 rounded-xl p-3.5 border border-white/10 focus:outline-none focus:ring-1 focus:ring-teal-400/50"
          >
            <p
              className="text-xs sm:text-sm text-slate-100 leading-relaxed"
              style={{ fontFamily: "'Exo 2', sans-serif" }}
            >
              {currentFrame.explanation}
            </p>
          </div>
        </div>

        {/* Painel Sincronizado de Pseudocódigo Canônico de 30 Linhas */}
        <MergeSortPseudocodePanel frame={currentFrame} className="w-full" />

        {/* Linha do Tempo e Barra de Progresso */}
        <div className="w-full max-w-xl flex flex-col gap-1.5">
          <div
            className="flex justify-between items-center text-xs text-slate-300 font-semibold font-mono"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            <span>PROGRESSO DA EXECUÇÃO</span>
            <span className="text-teal-400 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 via-sky-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Botoeira Inferior de Controles de Reprodução */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 panel-border bg-[#080f28]/90 rounded-xl px-4 sm:px-6 py-4 max-w-3xl w-full mx-auto shrink-0">
        <GameButton
          onClick={handleFirst}
          variant="secondary"
          size="sm"
          icon="|◀"
          aria-label="Primeiro quadro (Estado Inicial)"
        >
          INÍCIO
        </GameButton>

        <GameButton
          onClick={handlePrevious}
          variant="secondary"
          size="md"
          disabled={isFirst}
          icon="←"
          aria-label="Quadro anterior"
        >
          ANTERIOR
        </GameButton>

        <GameButton
          onClick={handleTogglePlay}
          variant={isPlaying ? "danger" : "primary"}
          size="md"
          icon={isPlaying ? "⏸" : "▶"}
          aria-label={isPlaying ? "Pausar reprodução" : "Iniciar reprodução"}
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
          aria-label="Próximo quadro"
        >
          PRÓXIMO
        </GameButton>

        <GameButton
          onClick={handleLast}
          variant="secondary"
          size="sm"
          icon="▶|"
          iconPosition="right"
          aria-label="Último quadro (Conclusão)"
        >
          FIM
        </GameButton>

        {/* Seletor de Velocidade (0.5x, 1x, 2x) */}
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
                  ? "bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40"
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

        {/* CTA Opcional do Modo Demonstração */}
        {mode === "demonstration" && onStartTraining && (
          <GameButton
            onClick={onStartTraining}
            variant="primary"
            size="md"
            icon="▶"
            className="border-teal-400 bg-teal-600/30 text-teal-200 hover:bg-teal-500/40"
          >
            INICIAR TREINAMENTO
          </GameButton>
        )}
      </div>
    </div>
  );
}
