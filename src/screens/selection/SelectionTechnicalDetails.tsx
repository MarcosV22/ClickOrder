import React from "react";
import type { SelectionSortState } from "../../game/sorting/selection";
import { SELECTION_SORT_PSEUDOCODE } from "../../game/replay";

export interface SelectionTechnicalDetailsProps {
  gameState: SelectionSortState;
  onToggleOpen?: (open: boolean) => void;
}

export default function SelectionTechnicalDetails({
  gameState,
  onToggleOpen,
}: SelectionTechnicalDetailsProps) {
  const isInspect = gameState.phase === "INSPECT";
  const isCommit = gameState.phase === "COMMIT";

  return (
    <details
      onToggle={(e) => onToggleOpen?.((e.currentTarget as HTMLDetailsElement).open)}
      className="w-full bg-[#0d1635]/60 border border-slate-700/60 rounded-xl p-3.5 text-xs font-mono text-slate-300 transition-all group"
    >
      <summary
        data-testid="drawer-toggle"
        className="cursor-pointer select-none font-semibold text-slate-400 hover:text-purple-300 flex items-center justify-between"
      >
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          <span>Aprofundamento técnico</span>
        </span>
        <span className="text-slate-500 group-open:rotate-180 transition-transform">
          ▼
        </span>
      </summary>

      <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Painel de Variáveis Formais */}
        <div className="bg-[#090d1f] p-3 rounded-lg border border-slate-800 space-y-1.5">
          <div className="text-purple-400 font-bold mb-2">Estado Interno da FSM</div>
          <div className="flex justify-between">
            <span className="text-slate-500">Estado da FSM:</span>
            <span className="text-amber-300 font-bold">{gameState.phase}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Posição a preencher (i):</span>
            <span className="text-cyan-300 font-bold">{gameState.i} (valor: {gameState.currentValues[gameState.i]})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Ponteiro scanner (j):</span>
            <span className="text-cyan-300 font-bold">
              {isInspect ? `${gameState.j} (valor: ${gameState.currentValues[gameState.j]})` : "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Candidato mínimo (minIndex):</span>
            <span className="text-purple-300 font-bold">
              {gameState.minIndex} (valor: {gameState.currentValues[gameState.minIndex]})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Métricas acumuladas:</span>
            <span className="text-slate-300 font-bold">
              {gameState.comparisons} comp. / {gameState.swaps} trocas
              {gameState.errors > 0 ? ` / ${gameState.errors} erro(s)` : ""}
            </span>
          </div>
        </div>

        {/* Pseudocódigo Canônico Oficial (13 instruções) */}
        <div className="bg-[#090d1f] p-3 rounded-lg border border-slate-800 text-[11px] leading-relaxed">
          <div className="text-purple-400 font-bold mb-2">
            Pseudocódigo Canônico ({SELECTION_SORT_PSEUDOCODE.length} linhas)
          </div>
          <div className="space-y-0.5" data-testid="selection-canonical-pseudocode">
            {SELECTION_SORT_PSEUDOCODE.map((line) => {
              const isHighlighted =
                (isInspect &&
                  (line.id === "INNER_LOOP" ||
                    line.id === "IF_CONDITION" ||
                    line.id === "UPDATE_MIN")) ||
                (isCommit &&
                  (line.id === "CHECK_SWAP" || line.id === "SWAP_STATEMENT"));
              return (
                <div
                  key={line.id}
                  data-pseudocode-line={line.lineNumber}
                  className={`px-1.5 py-0.5 rounded ${
                    isHighlighted
                      ? isCommit
                        ? "bg-amber-950/50 text-amber-200 font-bold"
                        : "bg-purple-950/50 text-purple-200 font-bold"
                      : "text-slate-400"
                  }`}
                  style={{ paddingLeft: `${line.indent * 12 + 6}px` }}
                >
                  <span className="text-slate-600 mr-1.5 select-none">
                    {line.lineNumber}:
                  </span>
                  <span>{line.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </details>
  );
}
