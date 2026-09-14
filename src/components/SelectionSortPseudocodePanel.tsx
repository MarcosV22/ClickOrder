import { useMemo } from "react";
import type { SelectionReplayFrame } from "../game/replay/selectionReplayModel";
import {
  SELECTION_SORT_PSEUDOCODE,
  getSelectionPseudocodeHighlight,
} from "../game/replay/selectionReplayPseudocode";

export interface SelectionSortPseudocodePanelProps {
  frame: SelectionReplayFrame;
  className?: string;
}

export default function SelectionSortPseudocodePanel({
  frame,
  className = "",
}: SelectionSortPseudocodePanelProps) {
  // Derivação pura e imutável do mapeamento de pseudocódigo a partir do frame
  const highlight = useMemo(
    () => getSelectionPseudocodeHighlight(frame),
    [frame]
  );
  const ctx = highlight.concreteContext;

  return (
    <div
      className={`panel-border bg-[#070e24]/90 rounded-xl p-4 flex flex-col gap-3 font-mono text-xs shadow-lg shadow-purple-950/20 border border-white/10 ${className}`}
      style={{ fontFamily: "'Space Mono', monospace" }}
    >
      {/* Panel Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span
            className="text-[11px] font-bold text-purple-300 tracking-wider uppercase"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            PSEUDOCÓDIGO — SELECTION SORT
          </span>
        </div>

        <div className="text-[10px] text-white/50 tracking-widest uppercase">
          {frame.frameType === "INITIAL" ? (
            <span className="text-purple-400/80">INÍCIO DO ALGORITMO</span>
          ) : (
            <span className="text-white/70">
              ALVO (i) = {ctx.i ?? 0} &nbsp;|&nbsp; SCAN (j) ={" "}
              {ctx.j !== null ? ctx.j : "—"} &nbsp;|&nbsp; MÍN ={" "}
              {ctx.minIndex ?? 0}
            </span>
          )}
        </div>
      </div>

      {/* Synchronized Pseudocode Block */}
      <div className="bg-[#030614]/90 rounded-lg p-3 border border-white/10 space-y-0.5 overflow-x-auto select-none">
        {SELECTION_SORT_PSEUDOCODE.map((line) => {
          const isPrimary = line.id === highlight.primaryLineId;
          const isActive = highlight.activeLineIds.includes(line.id);

          let rowStyle = "text-white/30 hover:text-white/50";
          let badge = null;

          if (isPrimary) {
            if (line.id === "SWAP_STATEMENT") {
              rowStyle =
                "bg-purple-950/50 text-purple-200 border-l-2 border-purple-400 font-bold px-1.5 py-0.5 rounded-r shadow-sm shadow-purple-500/30";
            } else if (line.id === "UPDATE_MIN") {
              rowStyle =
                "bg-cyan-950/50 text-cyan-200 border-l-2 border-cyan-400 font-bold px-1.5 py-0.5 rounded-r shadow-sm shadow-cyan-500/30";
            } else if (line.id === "CHECK_SWAP") {
              rowStyle =
                "bg-amber-950/40 text-amber-200 border-l-2 border-amber-400 font-bold px-1.5 py-0.5 rounded-r shadow-sm shadow-amber-500/20";
            } else if (line.id === "IF_CONDITION") {
              rowStyle =
                "bg-cyan-950/40 text-cyan-200 border-l-2 border-cyan-400 font-bold px-1.5 py-0.5 rounded-r shadow-sm shadow-cyan-500/20";
            } else {
              rowStyle =
                "bg-white/5 text-purple-300 border-l-2 border-purple-400 font-bold px-1.5 py-0.5 rounded-r";
            }
          } else if (isActive) {
            rowStyle =
              "bg-purple-950/20 text-purple-300/80 border-l-2 border-purple-500/30 px-1.5 py-0.5 rounded-r";
          }

          // Badges semânticos
          if (line.id === "IF_CONDITION" && highlight.conditionLineId === "IF_CONDITION") {
            if (highlight.conditionResult === "TRUE") {
              badge = (
                <span className="ml-2 text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold tracking-wider">
                  VERDADEIRO
                </span>
              );
            } else if (highlight.conditionResult === "FALSE") {
              badge = (
                <span className="ml-2 text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold tracking-wider">
                  FALSO
                </span>
              );
            }
          }

          if (line.id === "UPDATE_MIN" && isPrimary) {
            badge = (
              <span className="ml-2 text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold tracking-wider animate-pulse">
                ★ NOVO MÍNIMO
              </span>
            );
          }

          if (line.id === "CHECK_SWAP" && highlight.conditionLineId === "CHECK_SWAP") {
            if (highlight.conditionResult === "TRUE") {
              badge = (
                <span className="ml-2 text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold tracking-wider">
                  TROCA NECESSÁRIA (VERDADEIRO)
                </span>
              );
            } else {
              badge = (
                <span className="ml-2 text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold tracking-wider">
                  ELEMENTO NO DESTINO (FALSO)
                </span>
              );
            }
          }

          if (line.id === "SWAP_STATEMENT" && highlight.swapExecuted) {
            badge = (
              <span className="ml-2 text-[9px] px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-300 border border-purple-400/50 font-bold tracking-wider animate-pulse">
                ⇄ TRANSFERÊNCIA EXECUTADA
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

      {/* Concrete Values Contextualization */}
      <div className="bg-[#0b1430]/80 border border-white/10 rounded-lg p-2.5 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[9px] text-white/40 tracking-wider">
          <span className="text-purple-400/90 font-bold uppercase">
            CONTEXTO CONCRETO DO FRAME
          </span>
          <span>VALORES OBSERVADOS</span>
        </div>

        {frame.frameType === "INITIAL" ? (
          <div className="text-[11px] text-white/60 py-0.5">
            Configuração inicial da carga na esteira. Nenhuma comparação formal foi executada ainda.
          </div>
        ) : (
          <div className="flex flex-col gap-1 text-[11px]">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/80">
              <span>
                <strong className="text-amber-300">ALVO A[{ctx.i}]</strong> (#{(ctx.i ?? 0) + 1}) ={" "}
                <span className="text-white font-bold">{ctx.targetValue}</span>
              </span>

              {ctx.j !== null && (
                <>
                  <span className="text-white/30">•</span>
                  <span>
                    <strong className="text-cyan-300">SCAN A[{ctx.j}]</strong> (#{ctx.j + 1}) ={" "}
                    <span className="text-white font-bold">{ctx.scanValue}</span>
                  </span>
                </>
              )}

              <span className="text-white/30">•</span>
              <span>
                <strong className="text-purple-300">MÍN A[{ctx.minIndex}]</strong> (#{(ctx.minIndex ?? 0) + 1}) ={" "}
                <span className="text-white font-bold">{ctx.minValue}</span>
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
