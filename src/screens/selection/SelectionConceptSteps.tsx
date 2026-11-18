import React from "react";

export default function SelectionConceptSteps() {
  return (
    <div className="w-full flex flex-col gap-3">
      {/* Faixa dos 3 Passos Simples */}
      <div
        className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center"
        aria-label="Os 3 passos do Selection Sort"
      >
        {/* Passo 1: PROCURE */}
        <div className="flex flex-col items-center gap-1.5 p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
          <span className="w-7 h-7 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 font-mono font-bold text-xs flex items-center justify-center">
            1
          </span>
          <span
            className="font-bold text-slate-100 text-sm tracking-wide"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            PROCURE
          </span>
          <p className="text-xs text-slate-400 leading-relaxed">
            Olhe todos os números restantes.
          </p>
        </div>

        {/* Passo 2: LEMBRE O MENOR */}
        <div className="flex flex-col items-center gap-1.5 p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
          <span className="w-7 h-7 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs flex items-center justify-center">
            2
          </span>
          <span
            className="font-bold text-slate-100 text-sm tracking-wide"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            LEMBRE O MENOR
          </span>
          <p className="text-xs text-slate-400 leading-relaxed">
            Guarde o menor que encontrou.
          </p>
        </div>

        {/* Passo 3: POSICIONE */}
        <div className="flex flex-col items-center gap-1.5 p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
          <span className="w-7 h-7 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-xs flex items-center justify-center">
            3
          </span>
          <span
            className="font-bold text-slate-100 text-sm tracking-wide"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            POSICIONE
          </span>
          <p className="text-xs text-slate-400 leading-relaxed">
            Coloque-o na próxima posição.
          </p>
        </div>
      </div>

      {/* Regra Visual Fundamental: PROCURAR ≠ MOVER */}
      <div className="w-full py-2 px-3.5 rounded-xl bg-purple-950/30 border border-purple-500/20 flex items-center justify-center gap-2 text-center text-xs text-purple-200/90 font-mono">
        <span className="font-bold text-purple-300">PROCURAR ≠ MOVER:</span>
        <span className="text-slate-300">Durante a busca, nada troca de lugar.</span>
      </div>
    </div>
  );
}
