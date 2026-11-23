import React from "react";
import type { InsertionSortState } from "../../game/sorting/insertion";

export interface InsertionTechnicalDetailsProps {
  gameState: InsertionSortState;
  onToggleOpen?: (open: boolean) => void;
}

export default function InsertionTechnicalDetails({
  gameState,
  onToggleOpen,
}: InsertionTechnicalDetailsProps) {
  const currentPass = Math.min(gameState.i, Math.max(1, gameState.arrayLength - 1));
  const totalPasses = Math.max(1, gameState.arrayLength - 1);
  const isCompare = gameState.phase === "COMPARE_AND_SHIFT";
  const isInsertReady = gameState.phase === "INSERT_READY";

  return (
    <details
      onToggle={(e) => onToggleOpen?.((e.currentTarget as HTMLDetailsElement).open)}
      className="w-full bg-[#0d1635]/60 border border-slate-700/60 rounded-xl p-3.5 text-xs font-mono text-slate-300 transition-all group"
    >
      <summary className="cursor-pointer select-none font-semibold text-slate-400 hover:text-amber-300 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Detalhes Técnicos Formais & Pseudocódigo (Nível 3)</span>
        </span>
        <span className="text-slate-500 group-open:rotate-180 transition-transform">
          ▼
        </span>
      </summary>

      <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Painel de Variáveis Formais */}
        <div className="bg-[#090d1f] p-3 rounded-lg border border-slate-800 space-y-1.5">
          <div className="text-amber-400 font-bold mb-2">Estado Interno da FSM</div>
          <div className="flex justify-between">
            <span className="text-slate-500">Estado da FSM:</span>
            <span className="text-amber-300 font-bold">{gameState.phase}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Passada externa (i):</span>
            <span className="text-cyan-300 font-bold">
              {gameState.i} (Passada {currentPass} de {totalPasses})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Chave suspensa (key):</span>
            <span className="text-amber-300 font-bold">
              {gameState.key !== null ? `${gameState.key}` : "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Índice da vaga física (holeIndex):</span>
            <span className="text-amber-400 font-bold">
              {gameState.holeIndex !== null ? `#${gameState.holeIndex + 1} (índice ${gameState.holeIndex})` : "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Ponteiro scanner regressivo (j):</span>
            <span className="text-cyan-300 font-bold">
              {isCompare
                ? `${gameState.j} (valor: ${gameState.currentValues[gameState.j]})`
                : isInsertReady
                  ? "-1 (cabeceira da esteira)"
                  : "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Limite ordenado (orderedBoundary):</span>
            <span className="text-emerald-400 font-bold">
              [0 .. {gameState.orderedBoundary}]
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Métricas acumuladas:</span>
            <span className="text-slate-300 font-bold">
              {gameState.comparisons} comp. / {gameState.shifts} desl. / {gameState.insertions} ins.{gameState.errors > 0 ? ` / ${gameState.errors} erro(s)` : ""}
            </span>
          </div>
        </div>

        {/* Pseudocódigo Canônico de 11 Linhas */}
        <div className="bg-[#090d1f] p-3 rounded-lg border border-slate-800 text-[11px] leading-relaxed">
          <div className="text-amber-400 font-bold mb-2">Pseudocódigo Canônico (11 linhas)</div>
          <ol className="list-decimal list-inside space-y-0.5 text-slate-400 font-mono">
            <li className={gameState.i >= 1 ? "text-cyan-300 font-bold" : ""}>
              para i de 1 até n - 1 faça
            </li>
            <li className={gameState.key !== null ? "text-amber-300 font-bold" : ""}>
              &nbsp;&nbsp;chave ← A[i]
            </li>
            <li className={gameState.holeIndex !== null ? "text-amber-300 font-bold" : ""}>
              &nbsp;&nbsp;vaga ← i
            </li>
            <li className={isCompare || isInsertReady ? "text-cyan-300 font-bold" : ""}>
              &nbsp;&nbsp;j ← i - 1
            </li>
            <li className={isCompare ? "text-cyan-200 font-bold bg-cyan-950/40 px-1 rounded" : ""}>
              &nbsp;&nbsp;enquanto j ≥ 0 e A[j] &gt; chave faça
            </li>
            <li className={isCompare ? "text-slate-300" : ""}>
              &nbsp;&nbsp;&nbsp;&nbsp;A[j + 1] ← A[j]
            </li>
            <li className={isCompare ? "text-slate-300" : ""}>
              &nbsp;&nbsp;&nbsp;&nbsp;vaga ← j
            </li>
            <li className={isCompare ? "text-slate-300" : ""}>
              &nbsp;&nbsp;&nbsp;&nbsp;j ← j - 1
            </li>
            <li className={isInsertReady ? "text-amber-200 font-bold bg-amber-950/40 px-1 rounded" : ""}>
              &nbsp;&nbsp;fim enquanto
            </li>
            <li className={isInsertReady ? "text-amber-300 font-bold" : ""}>
              &nbsp;&nbsp;A[vaga] ← chave
            </li>
            <li className={gameState.completed ? "text-emerald-400 font-bold" : ""}>
              fim para
            </li>
          </ol>
        </div>
      </div>
    </details>
  );
}
