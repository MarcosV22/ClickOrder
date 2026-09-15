import { useMemo } from "react";
import type { ReplayFrame } from "../game/replay/replayModel";
import type { BubbleSortVariant } from "../game/sorting/types";
import {
  BUBBLE_SORT_PSEUDOCODE,
  BUBBLE_SORT_EARLY_EXIT_PSEUDOCODE,
  getPseudocodeHighlight,
} from "../game/replay/replayPseudocode";

export interface BubbleSortPseudocodePanelProps {
  frame: ReplayFrame;
  variant?: BubbleSortVariant;
  className?: string;
}

export default function BubbleSortPseudocodePanel({
  frame,
  variant: propVariant,
  className = "",
}: BubbleSortPseudocodePanelProps) {
  const activeVariant = propVariant ?? frame.variant ?? "CANONICAL";
  const isEarlyExit = activeVariant === "EARLY_EXIT";

  // Derivação pura e imutável do mapeamento de pseudocódigo a partir do frame e da variante
  const highlight = useMemo(
    () => getPseudocodeHighlight(frame, activeVariant),
    [frame, activeVariant]
  );
  const ctx = highlight.concreteContext;
  const pseudocodeLines = isEarlyExit
    ? BUBBLE_SORT_EARLY_EXIT_PSEUDOCODE
    : BUBBLE_SORT_PSEUDOCODE;

  return (
    <div
      className={`panel-border bg-[#070e24]/90 rounded-xl p-4 flex flex-col gap-3 font-mono text-xs shadow-lg shadow-cyan-950/20 border border-white/10 ${className}`}
      style={{ fontFamily: "'Space Mono', monospace" }}
    >
      {/* Panel Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span
            className="text-[11px] font-bold text-cyan-300 tracking-wider uppercase"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            {isEarlyExit
              ? "PSEUDOCÓDIGO — EARLY EXIT"
              : "PSEUDOCÓDIGO SINCRONIZADO"}
          </span>
        </div>

        <div className="text-[10px] text-white/50 tracking-widest uppercase">
          {frame.action === "INITIAL" ? (
            <span className="text-cyan-400/80">INÍCIO DO ALGORITMO</span>
          ) : (
            <span className="text-white/70 inline-flex items-center gap-2">
              <span>i = {ctx.i ?? 0}</span>
              <span className="text-white/30" aria-hidden="true">|</span>
              <span>j = {ctx.j ?? 0}</span>
            </span>
          )}
        </div>
      </div>

      {/* Synchronized Pseudocode Block */}
      <div className="bg-[#030614]/90 rounded-lg p-3 border border-white/10 space-y-0.5 overflow-x-auto select-none">
        {pseudocodeLines.map((line) => {
          const isPrimary = line.id === highlight.primaryLineId;
          const isActive = highlight.activeLineIds.includes(line.id);

          let rowStyle = "text-white/30 hover:text-white/50";
          let badge = null;

          if (isPrimary) {
            if (line.id === "BREAK_STATEMENT") {
              rowStyle =
                "bg-emerald-950/50 text-emerald-200 border-l-2 border-emerald-400 font-bold px-1.5 py-0.5 rounded-r shadow-sm shadow-emerald-500/30";
            } else if (highlight.swapExecuted) {
              rowStyle =
                "bg-purple-950/40 text-purple-200 border-l-2 border-purple-400 font-bold px-1.5 py-0.5 rounded-r shadow-sm shadow-purple-500/20";
            } else if (highlight.conditionResult === "FALSE") {
              rowStyle =
                "bg-cyan-950/40 text-cyan-200 border-l-2 border-cyan-400 font-bold px-1.5 py-0.5 rounded-r shadow-sm shadow-cyan-500/20";
            } else {
              rowStyle =
                "bg-white/5 text-cyan-300 border-l-2 border-cyan-400 font-bold px-1.5 py-0.5 rounded-r";
            }
          } else if (isActive) {
            rowStyle =
              "bg-cyan-950/20 text-cyan-300/90 border-l-2 border-cyan-500/30 px-1.5 py-0.5 rounded-r";
          }

          if (line.id === "IF_CONDITION" && highlight.conditionResult !== null) {
            if (highlight.conditionResult === "TRUE") {
              badge = (
                <span className="ml-2 text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold tracking-wider">
                  VERDADEIRO
                </span>
              );
            } else {
              badge = (
                <span className="ml-2 text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold tracking-wider">
                  FALSO
                </span>
              );
            }
          }

          if (line.id === "CHECK_EARLY_EXIT" && highlight.conditionLineId === "CHECK_EARLY_EXIT") {
            badge = (
              <span className="ml-2 text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold tracking-wider">
                0 TROCAS (VERDADEIRO)
              </span>
            );
          }

          if (line.id === "BREAK_STATEMENT" && isPrimary) {
            badge = (
              <span className="ml-2 text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 font-bold tracking-wider animate-pulse">
                ⚡ TÉRMINO ANTECIPADO
              </span>
            );
          }

          if (line.id === "SWAP_STATEMENT" && highlight.swapExecuted) {
            badge = (
              <span className="ml-2 text-[9px] px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-300 border border-purple-400/50 font-bold tracking-wider animate-pulse">
                ⇄ EXECUTADO
              </span>
            );
          }

          return (
            <div
              key={line.id}
              className={`flex items-center text-[11px] leading-tight transition-colors duration-150 ${rowStyle}`}
            >
              <span className="w-5 text-right mr-3 text-[10px] text-white/20 font-mono select-none">
                {line.lineNumber}
              </span>
              <span
                style={{
                  paddingLeft: `${line.indent * 14}px`,
                }}
                className="whitespace-pre"
              >
                {line.text}
              </span>
              {badge}
            </div>
          );
        })}
      </div>

      {/* Concrete Values Contextualization (Separated from Generic Code) */}
      <div className="bg-[#0b1430]/80 border border-white/10 rounded-lg p-2.5 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[9px] text-white/40 tracking-wider">
          <span className="text-cyan-400/90 font-bold uppercase">
            CONTEXTO CONCRETO DO FRAME
          </span>
          <span>VALORES OBSERVADOS</span>
        </div>

        {frame.action === "INITIAL" ? (
          <div className="text-[11px] text-white/60 py-0.5">
            Configuração inicial da carga na esteira. Nenhuma comparação formal foi executada ainda.
          </div>
        ) : (
          <div className="flex flex-col gap-1 text-[11px]">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/80">
              <span>
                <strong className="text-cyan-300">A[{ctx.j}]</strong> (#{(ctx.leftIndex ?? 0) + 1}) ={" "}
                <span className="text-white font-bold">{ctx.leftValue}</span>
              </span>
              <span className="text-white/30">•</span>
              <span>
                <strong className="text-cyan-300">A[{(ctx.j ?? 0) + 1}]</strong> (#{(ctx.rightIndex ?? 0) + 1}) ={" "}
                <span className="text-white font-bold">{ctx.rightValue}</span>
              </span>
              <span className="text-white/30">•</span>
              <span>
                Condição:{" "}
                <span className="font-bold text-white">{ctx.comparisonText}</span>
                {" → "}
                {highlight.conditionResult === "TRUE" ? (
                  <span className="text-emerald-400 font-bold">VERDADEIRO</span>
                ) : (
                  <span className="text-amber-400 font-bold">FALSO</span>
                )}
              </span>
            </div>

            <div className="text-[10px] text-white/50 pt-0.5 border-t border-white/5">
              Instrução:{" "}
              <span className={highlight.swapExecuted ? "text-purple-300 font-semibold" : "text-emerald-300"}>
                {ctx.actionTakenText}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
