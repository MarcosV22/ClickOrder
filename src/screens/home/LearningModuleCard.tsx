import React from "react";
import type { ProtocolMetadata, ProtocolId } from "../protocolCatalog";

export interface LearningModuleCardProps {
  metadata: ProtocolMetadata;
  completedPractices: number;
  onStart: (id: ProtocolId) => void;
}

function BubbleMiniVisual() {
  return (
    <div
      role="img"
      aria-label="Demonstração visual do Bubble Sort: compara elementos vizinhos e troca se fora de ordem"
      className="w-full bg-[#081024]/90 border border-cyan-500/20 rounded-xl py-2.5 px-3 flex flex-col items-center justify-center gap-1.5"
    >
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {/* Antes: Par 8 e 3 fora de ordem */}
        <div className="flex items-center gap-1 p-1 rounded-md bg-cyan-950/40 border border-cyan-500/30">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-cyan-900/60 border border-cyan-400 text-cyan-200 font-bold text-xs sm:text-sm flex items-center justify-center font-mono">
            8
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-bold text-xs sm:text-sm flex items-center justify-center font-mono">
            3
          </div>
        </div>

        {/* Seta de transformação */}
        <svg
          className="w-4 h-4 text-cyan-400 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>

        {/* Depois: Par trocado e ordenado */}
        <div className="flex items-center gap-1 p-1 rounded-md bg-cyan-950/60 border border-cyan-400/50">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-cyan-500/20 border border-cyan-300 text-cyan-100 font-bold text-xs sm:text-sm flex items-center justify-center font-mono">
            3
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-cyan-500/20 border border-cyan-300 text-cyan-100 font-bold text-xs sm:text-sm flex items-center justify-center font-mono">
            8
          </div>
        </div>
      </div>

      <span
        className="text-[11px] font-mono text-cyan-300/80 font-medium tracking-tight"
        style={{ fontFamily: "'Space Mono', monospace" }}
      >
        Compare vizinhos.
      </span>
    </div>
  );
}

function SelectionMiniVisual() {
  return (
    <div
      role="img"
      aria-label="Demonstração visual do Selection Sort: percorre a lista, encontra o menor valor e posiciona no início"
      className="w-full bg-[#120b22]/90 border border-purple-500/20 rounded-xl py-2.5 px-3 flex flex-col items-center justify-center gap-1.5"
    >
      <div className="flex items-center justify-center gap-2 sm:gap-2.5">
        {/* Antes: 4, 1 (menor destacado), 7 */}
        <div className="flex items-center gap-1">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300/70 font-bold text-xs sm:text-sm flex items-center justify-center font-mono">
            4
          </div>
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded bg-purple-900/80 border-2 border-purple-400 text-purple-100 font-bold text-xs sm:text-sm flex items-center justify-center font-mono shadow-[0_0_8px_rgba(168,85,247,0.4)]">
            1
            <span className="absolute -top-1.5 -right-1 px-1 py-0.2 bg-purple-500 text-[8px] font-bold text-white rounded font-mono leading-none">
              min
            </span>
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300/70 font-bold text-xs sm:text-sm flex items-center justify-center font-mono">
            7
          </div>
        </div>

        {/* Seta de transformação */}
        <svg
          className="w-4 h-4 text-purple-400 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>

        {/* Depois: 1 colocado na primeira posição */}
        <div className="flex items-center gap-1">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-purple-500/30 border border-purple-300 text-purple-100 font-bold text-xs sm:text-sm flex items-center justify-center font-mono">
            1
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-purple-950/40 border border-purple-500/30 text-purple-300/80 font-bold text-xs sm:text-sm flex items-center justify-center font-mono">
            4
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-purple-950/40 border border-purple-500/30 text-purple-300/80 font-bold text-xs sm:text-sm flex items-center justify-center font-mono">
            7
          </div>
        </div>
      </div>

      <span
        className="text-[11px] font-mono text-purple-300/80 font-medium tracking-tight"
        style={{ fontFamily: "'Space Mono', monospace" }}
      >
        Encontre o menor.
      </span>
    </div>
  );
}

function InsertionMiniVisual() {
  return (
    <div
      role="img"
      aria-label="Demonstração visual do Insertion Sort: insere cada elemento na posição correta da parte ordenada"
      className="w-full bg-[#1b1208]/90 border border-amber-500/20 rounded-xl py-2.5 px-3 flex flex-col items-center justify-center gap-1.5"
    >
      <div className="flex items-center justify-center gap-2 sm:gap-2.5">
        {/* Antes: 2, 5 ordenados + 3 (chave a ser inserida) */}
        <div className="flex items-center gap-1">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-amber-950/50 border border-amber-500/40 text-amber-300/80 font-bold text-xs sm:text-sm flex items-center justify-center font-mono">
            2
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-amber-950/50 border border-amber-500/40 text-amber-300/80 font-bold text-xs sm:text-sm flex items-center justify-center font-mono">
            5
          </div>
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded bg-amber-900/80 border-2 border-amber-400 text-amber-100 font-bold text-xs sm:text-sm flex items-center justify-center font-mono shadow-[0_0_8px_rgba(245,158,11,0.4)]">
            3
            <span className="absolute -top-1.5 -right-1 px-1 py-0.2 bg-amber-500 text-[8px] font-bold text-slate-950 rounded font-mono leading-none">
              key
            </span>
          </div>
        </div>

        {/* Seta de transformação */}
        <svg
          className="w-4 h-4 text-amber-400 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>

        {/* Depois: 3 encaixado entre 2 e 5 */}
        <div className="flex items-center gap-1">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300/80 font-bold text-xs sm:text-sm flex items-center justify-center font-mono">
            2
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-amber-500/30 border border-amber-300 text-amber-100 font-bold text-xs sm:text-sm flex items-center justify-center font-mono">
            3
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300/80 font-bold text-xs sm:text-sm flex items-center justify-center font-mono">
            5
          </div>
        </div>
      </div>

      <span
        className="text-[11px] font-mono text-amber-300/80 font-medium tracking-tight"
        style={{ fontFamily: "'Space Mono', monospace" }}
      >
        Encaixe cada elemento.
      </span>
    </div>
  );
}

function formatMetaphor(metaphor: string): string {
  if (!metaphor) return "";
  const lower = metaphor.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export default function LearningModuleCard({
  metadata,
  completedPractices,
  onStart,
}: LearningModuleCardProps) {
  const isBubble = metadata.id === "bubble";
  const isSelection = metadata.id === "selection";
  const isInsertion = metadata.id === "insertion";

  // Card theme styling
  const cardBorder = isBubble
    ? "border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.1)]"
    : isSelection
      ? "border-purple-500/30 hover:border-purple-400/60 shadow-[0_0_20px_rgba(168,85,247,0.1)]"
      : "border-amber-500/30 hover:border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.1)]";

  const cardBg = isBubble
    ? "bg-[#0b142c]/90"
    : isSelection
      ? "bg-[#130d27]/90"
      : "bg-[#1a1207]/90";

  const titleColor = isBubble
    ? "text-cyan-300"
    : isSelection
      ? "text-purple-300"
      : "text-amber-300";

  const dotActiveBg = isBubble
    ? "bg-cyan-400"
    : isSelection
      ? "bg-purple-400"
      : "bg-amber-400";

  const ctaBtnStyle = isBubble
    ? "bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
    : isSelection
      ? "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.25)]"
      : "bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.25)]";

  const isStarted = completedPractices > 0;
  const ctaLabel = isStarted ? "CONTINUAR" : "COMEÇAR";

  return (
    <article
      className={`relative w-full rounded-2xl border ${cardBorder} ${cardBg} p-5 sm:p-6 flex flex-col justify-between gap-4 transition-all duration-200 hover:-translate-y-0.5 backdrop-blur-sm`}
    >
      {/* Top Section: Header & Metaphor */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <h3
            className={`text-lg sm:text-xl font-black tracking-wide ${titleColor}`}
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            {metadata.name}
          </h3>

          {/* Discrete Recommended Badge on Bubble Sort */}
          {isBubble && (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.2)]"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Recomendado
            </span>
          )}
        </div>

        {/* Metaphor */}
        <p
          className="text-xs text-slate-300 font-medium"
          style={{ fontFamily: "'Exo 2', sans-serif" }}
        >
          {formatMetaphor(metadata.metaphor)}
        </p>
      </div>

      {/* Mini Visual da Mecânica */}
      <div className="my-1">
        {isBubble && <BubbleMiniVisual />}
        {isSelection && <SelectionMiniVisual />}
        {isInsertion && <InsertionMiniVisual />}
      </div>

      {/* Bottom Section: Progress & CTA */}
      <div className="flex flex-col gap-3 pt-1">
        {/* Progress indicator with 3 dots */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span
            className="font-mono text-[11px]"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            {completedPractices} de 3 práticas
          </span>

          <div
            className="flex items-center gap-1.5"
            aria-label={`${completedPractices} de 3 práticas concluídas`}
          >
            {[0, 1, 2].map((idx) => {
              const isCompleted = idx < completedPractices;
              return (
                <span
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    isCompleted
                      ? dotActiveBg
                      : "bg-slate-700/60 border border-slate-600/40"
                  }`}
                  aria-hidden="true"
                />
              );
            })}
          </div>
        </div>

        {/* Single CTA Button */}
        <button
          type="button"
          onClick={() => onStart(metadata.id)}
          aria-label={`${ctaLabel === "COMEÇAR" ? "Começar" : "Continuar"} módulo ${metadata.name}`}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer ${ctaBtnStyle}`}
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          <span>{ctaLabel}</span>
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </article>
  );
}
