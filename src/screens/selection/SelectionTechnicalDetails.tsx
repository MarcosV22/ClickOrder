import React from "react";
import type { SelectionSortState } from "../../game/sorting/selection";

export interface SelectionTechnicalDetailsProps {
  gameState: SelectionSortState;
  onToggleOpen?: (open: boolean) => void;
}

export default function SelectionTechnicalDetails({
  gameState,
  onToggleOpen,
}: SelectionTechnicalDetailsProps) {
  const currentPass = Math.min(gameState.i + 1, Math.max(1, gameState.arrayLength - 1));
  const isInspect = gameState.phase === "INSPECT";
  const isCommit = gameState.phase === "COMMIT";

  return (
    <details
      onToggle={(e) => onToggleOpen?.((e.currentTarget as HTMLDetailsElement).open)}
      className="w-full bg-[#0d1635]/60 border border-slate-700/60 rounded-xl p-4 text-xs font-mono text-slate-300 transition-all group"
    >
      <summary className="cursor-pointer select-none font-semibold text-slate-400 hover:text-purple-300 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          <span>Detalhes Técnicos Formais & Pseudocódigo (Nível 3)</span>
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

        {/* Pseudocódigo Canônico */}
        <div className="bg-[#090d1f] p-3 rounded-lg border border-slate-800 text-[11px] leading-relaxed">
          <div className="text-purple-400 font-bold mb-2">Pseudocódigo Canônico</div>
          <div className={gameState.phase !== "COMPLETED" ? "text-slate-200" : "text-slate-600"}>
            <span className="text-slate-500">1:</span> para i ← 0 até n - 2 faça
          </div>
          <div className={isInspect || isCommit ? "text-purple-300 font-semibold" : "text-slate-600"}>
            <span className="text-slate-500">2:</span> &nbsp;&nbsp;minIndex ← i
          </div>
          <div className={isInspect ? "text-cyan-300 font-bold bg-cyan-950/40 px-1 rounded" : "text-slate-600"}>
            <span className="text-slate-500">3:</span> &nbsp;&nbsp;para j ← i + 1 até n - 1 faça
          </div>
          <div className={isInspect ? "text-cyan-300 font-bold bg-cyan-950/40 px-1 rounded" : "text-slate-600"}>
            <span className="text-slate-500">4:</span> &nbsp;&nbsp;&nbsp;&nbsp;se A[j] &lt; A[minIndex] então minIndex ← j
          </div>
          <div className={isCommit ? "text-amber-300 font-bold bg-amber-950/40 px-1 rounded" : "text-slate-600"}>
            <span className="text-slate-500">5:</span> &nbsp;&nbsp;se minIndex ≠ i então trocar(A[i], A[minIndex])
          </div>
        </div>
      </div>
    </details>
  );
}
