import { useMemo } from "react";
import type { InsertionReplayFrame } from "../game/sorting/insertion/insertionReplayModel";
import {
  INSERTION_SORT_PSEUDOCODE,
  getInsertionPseudocodeHighlight,
} from "../game/sorting/insertion/insertionReplayPseudocode";

export interface InsertionSortPseudocodePanelProps {
  frame: InsertionReplayFrame;
  className?: string;
}

export default function InsertionSortPseudocodePanel({
  frame,
  className = "",
}: InsertionSortPseudocodePanelProps) {
  // Derivação pura e imutável do mapeamento de pseudocódigo a partir do frame
  const highlight = useMemo(
    () => getInsertionPseudocodeHighlight(frame),
    [frame]
  );
  const ctx = highlight.concreteContext;

  return (
    <div
      className={`panel-border bg-[#070e24]/90 rounded-xl p-4 flex flex-col gap-3 font-mono text-xs shadow-lg shadow-amber-950/20 border border-white/10 ${className}`}
      style={{ fontFamily: "'Space Mono', monospace" }}
    >
      {/* Panel Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span
            className="text-[11px] font-bold text-amber-300 tracking-wider uppercase"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            PSEUDOCÓDIGO — INSERTION SORT
          </span>
        </div>

        <div className="text-[10px] text-white/50 tracking-widest uppercase">
          {frame.frameType === "INITIAL" ? (
            <span className="text-amber-400/80">INÍCIO DO ALGORITMO</span>
          ) : (
            <span className="text-white/70 inline-flex flex-wrap items-center gap-2">
              <span>i = {ctx.i ?? 1}</span>
              <span className="text-white/30" aria-hidden="true">|</span>
              <span>j = {ctx.j !== null ? ctx.j : "—"}</span>
              <span className="text-white/30" aria-hidden="true">|</span>
              <span>CHAVE = {ctx.key !== null ? ctx.key : "—"}</span>
              <span className="text-white/30" aria-hidden="true">|</span>
              <span>VAGA = {ctx.holeIndex !== null ? `#${ctx.holeIndex + 1}` : "—"}</span>
              <span className="text-white/30" aria-hidden="true">|</span>
              <span>ORD = 0..#{ctx.orderedBoundary + 1}</span>
            </span>
          )}
        </div>
      </div>

      {/* Synchronized Pseudocode Block */}
      <div className="bg-[#030614]/90 rounded-lg p-3 border border-white/10 space-y-0.5 overflow-x-auto select-none">
        {INSERTION_SORT_PSEUDOCODE.map((line) => {
          const isPrimary = line.id === highlight.primaryLineId;
          const isActive = highlight.activeLineIds.includes(line.id);

          let rowStyle = "text-white/30 hover:text-white/50";
          let badge = null;

          if (isPrimary) {
            if (line.id === "SHIFT_RIGHT") {
              rowStyle =
                "bg-purple-950/50 text-purple-200 border-l-2 border-purple-400 font-bold px-1.5 py-0.5 rounded-r shadow-sm shadow-purple-500/30";
            } else if (line.id === "LIFT_KEY") {
              rowStyle =
                "bg-amber-950/50 text-amber-200 border-l-2 border-amber-400 font-bold px-1.5 py-0.5 rounded-r shadow-sm shadow-amber-500/30";
            } else if (line.id === "INSERT_KEY") {
              rowStyle =
                "bg-emerald-950/50 text-emerald-200 border-l-2 border-emerald-400 font-bold px-1.5 py-0.5 rounded-r shadow-sm shadow-emerald-500/30";
            } else if (line.id === "WHILE_CONDITION") {
              rowStyle =
                "bg-cyan-950/40 text-cyan-200 border-l-2 border-cyan-400 font-bold px-1.5 py-0.5 rounded-r shadow-sm shadow-cyan-500/20";
            } else {
              rowStyle =
                "bg-white/5 text-amber-300 border-l-2 border-amber-400 font-bold px-1.5 py-0.5 rounded-r";
            }
          } else if (isActive) {
            rowStyle =
              "bg-amber-950/20 text-amber-300/80 border-l-2 border-amber-500/30 px-1.5 py-0.5 rounded-r";
          }

          // Badges semânticos
          if (line.id === "WHILE_CONDITION" && highlight.conditionLineId === "WHILE_CONDITION") {
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
            } else if (highlight.conditionResult === "HEAD_REACHED") {
              badge = (
                <span className="ml-2 text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold tracking-wider">
                  j &lt; 0 (CABECEIRA)
                </span>
              );
            }
          }

          if (line.id === "LIFT_KEY" && isPrimary) {
            badge = (
              <span className="ml-2 text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold tracking-wider animate-pulse">
                ▲ CHAVE ELEVADA
              </span>
            );
          }

          if (line.id === "SHIFT_RIGHT" && isPrimary) {
            badge = (
              <span className="ml-2 text-[9px] px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-300 border border-purple-400/50 font-bold tracking-wider animate-pulse">
                ➔ DESLOCAMENTO
              </span>
            );
          }

          if (line.id === "INSERT_KEY" && isPrimary) {
            badge = (
              <span className="ml-2 text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 font-bold tracking-wider animate-pulse">
                ⇣ ENCAIXE EXECUTADO
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
          <span className="text-amber-400/90 font-bold uppercase">
            CONTEXTO CONCRETO DO FRAME
          </span>
          <span>VALORES OBSERVADOS</span>
        </div>

        {frame.frameType === "INITIAL" ? (
          <div className="text-[11px] text-white/60 py-0.5">
            Configuração inicial da carga na esteira. O primeiro elemento estabelece a partição ordenada ORD de tamanho 1.
          </div>
        ) : (
          <div className="flex flex-col gap-1 text-[11px]">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/80">
              {ctx.i !== null && (
                <span>
                  <strong className="text-amber-300">PASSADA (i)</strong> ={" "}
                  <span className="text-white font-bold">{ctx.i}</span>
                </span>
              )}

              {ctx.j !== null && (
                <>
                  <span className="text-white/30">•</span>
                  <span>
                    <strong className="text-cyan-300">SCAN (j)</strong> ={" "}
                    <span className="text-white font-bold">{ctx.j}</span>
                  </span>
                </>
              )}

              {ctx.key !== null && (
                <>
                  <span className="text-white/30">•</span>
                  <span>
                    <strong className="text-amber-400">CHAVE</strong> ={" "}
                    <span className="text-white font-bold">{ctx.key}</span>
                  </span>
                </>
              )}

              {ctx.holeIndex !== null && (
                <>
                  <span className="text-white/30">•</span>
                  <span>
                    <strong className="text-amber-300/80">VAGA</strong> ={" "}
                    <span className="text-white font-bold">#{ctx.holeIndex + 1}</span>
                  </span>
                </>
              )}

              <span className="text-white/30">•</span>
              <span>
                <strong className="text-emerald-400">ORD</strong> ={" "}
                <span className="text-white font-bold">0..#{ctx.orderedBoundary + 1}</span>
              </span>

              <span className="text-white/30">•</span>
              <span>
                Condição:{" "}
                <span className="font-bold text-white">{ctx.comparisonText}</span>
              </span>
            </div>

            <div className="text-[10px] text-white/50 pt-0.5 border-t border-white/5">
              Instrução:{" "}
              <span className="text-amber-200">
                {ctx.actionTakenText}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
