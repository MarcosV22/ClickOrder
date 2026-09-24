import { useMemo } from "react";
import type { MergeReplayFrame } from "../game/sorting/merge/mergeReplayModel";
import {
  MERGE_SORT_CANONICAL_PSEUDOCODE,
  getMergePseudocodeHighlight,
} from "../game/sorting/merge/mergeReplayPseudocode";

export interface MergeSortPseudocodePanelProps {
  frame: MergeReplayFrame;
  className?: string;
}

export default function MergeSortPseudocodePanel({
  frame,
  className = "",
}: MergeSortPseudocodePanelProps) {
  // Derivação pura e imutável do mapeamento de pseudocódigo a partir do frame
  const highlight = useMemo(
    () => getMergePseudocodeHighlight(frame),
    [frame],
  );
  const ctx = highlight.concreteContext;

  return (
    <div
      className={`panel-border bg-[#070e24]/90 rounded-xl p-4 flex flex-col gap-3 font-mono text-xs shadow-lg shadow-teal-950/20 border border-teal-500/20 ${className}`}
      style={{ fontFamily: "'Space Mono', monospace" }}
    >
      {/* Cabeçalho do Painel com Telemetria das Variáveis */}
      <div className="flex flex-wrap items-center justify-between pb-2 border-b border-white/10 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
          <span
            className="text-[11px] font-bold text-teal-300 tracking-wider uppercase"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            PSEUDOCÓDIGO CANÔNICO — MERGE SORT (30 LINHAS)
          </span>
        </div>

        <div className="text-[10px] text-white/50 tracking-widest uppercase">
          {frame.frameType === "INITIAL" ? (
            <span className="text-teal-400/80">INÍCIO DO ALGORITMO</span>
          ) : (
            <span className="text-white/70 inline-flex flex-wrap items-center gap-2">
              <span>
                INTERVALO = [
                {ctx.inicio !== null ? ctx.inicio : "—"}..
                {ctx.fim !== null ? ctx.fim : "—"}]
              </span>
              <span className="text-white/30" aria-hidden="true">|</span>
              <span>MEIO = {ctx.meio !== null ? ctx.meio : "—"}</span>
              <span className="text-white/30" aria-hidden="true">|</span>
              <span className="text-teal-300">
                p1 = {ctx.p1 !== null ? `${ctx.p1} (${ctx.p1Value ?? "—"})` : "—"}
              </span>
              <span className="text-white/30" aria-hidden="true">|</span>
              <span className="text-sky-300">
                p2 = {ctx.p2 !== null ? `${ctx.p2} (${ctx.p2Value ?? "—"})` : "—"}
              </span>
              <span className="text-white/30" aria-hidden="true">|</span>
              <span className="text-amber-300">k = {ctx.k}</span>
            </span>
          )}
        </div>
      </div>

      {/* Bloco de Código Sincronizado */}
      <div
        tabIndex={0}
        aria-label="Bloco de pseudocódigo canônico de 30 linhas sincronizado com o frame selecionado"
        className="bg-[#030614]/90 rounded-lg p-3 border border-white/10 space-y-0.5 overflow-x-auto max-h-[360px] overflow-y-auto select-none focus:outline-none focus:ring-1 focus:ring-teal-400/50"
      >
        {MERGE_SORT_CANONICAL_PSEUDOCODE.map((line) => {
          const isPrimary = line.lineNumber === highlight.primaryLineNumber;
          const isActive = highlight.activeLineNumbers.includes(line.lineNumber);

          let rowStyle = "text-white/30 hover:text-white/50";
          let badge = null;

          if (isPrimary) {
            if (line.lineNumber === 15) {
              // DISPATCH_LEFT
              rowStyle =
                "bg-teal-950/60 text-teal-200 border-l-2 border-teal-400 font-bold px-1.5 py-0.5 rounded-r shadow-sm shadow-teal-500/30";
            } else if (line.lineNumber === 17) {
              // DISPATCH_RIGHT
              rowStyle =
                "bg-sky-950/60 text-sky-200 border-l-2 border-sky-400 font-bold px-1.5 py-0.5 rounded-r shadow-sm shadow-sky-500/30";
            } else if (line.lineNumber === 22 || line.lineNumber === 25) {
              // DRAIN
              rowStyle =
                "bg-indigo-950/60 text-indigo-200 border-l-2 border-indigo-400 font-bold px-1.5 py-0.5 rounded-r shadow-sm shadow-indigo-500/30";
            } else if (line.lineNumber === 28) {
              // COPY_BACK
              rowStyle =
                "bg-amber-950/60 text-amber-200 border-l-2 border-amber-400 font-bold px-1.5 py-0.5 rounded-r shadow-sm shadow-amber-500/30";
            } else if (line.lineNumber === 11 || line.lineNumber === 12) {
              // MERGE_INIT
              rowStyle =
                "bg-purple-950/50 text-purple-200 border-l-2 border-purple-400 font-bold px-1.5 py-0.5 rounded-r shadow-sm shadow-purple-500/30";
            } else if (line.lineNumber === 3) {
              // DIVIDE
              rowStyle =
                "bg-cyan-950/50 text-cyan-200 border-l-2 border-cyan-400 font-bold px-1.5 py-0.5 rounded-r shadow-sm shadow-cyan-500/20";
            } else {
              rowStyle =
                "bg-white/10 text-teal-300 border-l-2 border-teal-400 font-bold px-1.5 py-0.5 rounded-r";
            }
          } else if (isActive) {
            rowStyle =
              "bg-teal-950/20 text-teal-300/80 border-l-2 border-teal-500/30 px-1.5 py-0.5 rounded-r";
          }

          // Badges semânticos de avaliação lógica
          if (line.lineNumber === 14 && highlight.conditionLineNumber === 14) {
            const leftVal =
              ctx.comparedP1Value !== undefined && ctx.comparedP1Value !== null
                ? ctx.comparedP1Value
                : (ctx.p1Value ?? "E");
            const rightVal =
              ctx.comparedP2Value !== undefined && ctx.comparedP2Value !== null
                ? ctx.comparedP2Value
                : (ctx.p2Value ?? "D");
            if (highlight.conditionResult === "LEFT_SMALLER_OR_EQUAL") {
              badge = (
                <span className="ml-2 text-[9px] px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold tracking-wider">
                  VERDADEIRO ({leftVal} ≤ {rightVal})
                </span>
              );
            } else if (highlight.conditionResult === "RIGHT_SMALLER") {
              badge = (
                <span className="ml-2 text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold tracking-wider">
                  FALSO ({rightVal} &lt; {leftVal})
                </span>
              );
            }
          }

          if (line.lineNumber === 21 && highlight.conditionResult === "DRAIN_LEFT") {
            badge = (
              <span className="ml-2 text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold tracking-wider">
                DRENAGEM RAMAL E (D ESGOTADO)
              </span>
            );
          }

          if (line.lineNumber === 24 && highlight.conditionResult === "DRAIN_RIGHT") {
            badge = (
              <span className="ml-2 text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold tracking-wider">
                DRENAGEM RAMAL D (E ESGOTADO)
              </span>
            );
          }

          if (line.lineNumber === 28 && isPrimary) {
            badge = (
              <span className="ml-2 text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold tracking-wider animate-pulse">
                {frame.isRootMerge ? "✓ CÓPIA FINAL (OK)" : "▲ CÓPIA RETORNO (ORD)"}
              </span>
            );
          }

          return (
            <div
              key={line.lineNumber}
              className={`flex items-baseline font-mono text-[11px] leading-relaxed transition-colors duration-150 ${rowStyle}`}
            >
              {/* Número da Linha */}
              <span className="w-6 shrink-0 text-[10px] text-white/30 text-right pr-2 select-none">
                {String(line.lineNumber).padStart(2, "0")}
              </span>

              {/* Código Indentado */}
              <span
                className="whitespace-pre flex-1"
                style={{ paddingLeft: `${line.indent * 12}px` }}
              >
                {line.code}
              </span>

              {/* Badge Contextual */}
              {badge}
            </div>
          );
        })}
      </div>

      {/* Rodapé Descritivo do Quadro */}
      <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-white/60 gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-teal-400 font-bold uppercase tracking-wider text-[10px]">
            OPERAÇÃO EM EXECUÇÃO:
          </span>
          <span className="text-white/80 font-medium">
            {ctx.actionTakenText}
          </span>
        </div>

        {ctx.comparisonText !== "—" && (
          <span className="text-[10px] px-2 py-0.5 rounded bg-teal-900/30 text-teal-300 border border-teal-500/30 font-semibold tracking-wide">
            {ctx.comparisonText}
          </span>
        )}
      </div>
    </div>
  );
}
