import React from "react";

export default function BubbleConceptSteps() {
  return (
    <div className="w-full flex flex-col gap-3">
      {/* Faixa dos 3 Passos Simples */}
      <div
        className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center"
        aria-label="Os 3 passos do Bubble Sort"
      >
        {/* Passo 1: COMPARE */}
        <div className="flex flex-col items-center gap-1.5 p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
          <span className="w-7 h-7 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-300 font-mono font-bold text-xs flex items-center justify-center">
            1
          </span>
          <span
            className="font-bold text-slate-100 text-sm tracking-wide"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            COMPARE
          </span>
          <p className="text-xs text-slate-400 leading-relaxed">
            Olhe duas caixas vizinhas.
          </p>
        </div>

        {/* Passo 2: DECIDA */}
        <div className="flex flex-col items-center gap-1.5 p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
          <span className="w-7 h-7 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs flex items-center justify-center">
            2
          </span>
          <span
            className="font-bold text-slate-100 text-sm tracking-wide"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            DECIDA
          </span>
          <p className="text-xs text-slate-400 leading-relaxed">
            Troque se a esquerda for maior.
          </p>
        </div>

        {/* Passo 3: AVANCE */}
        <div className="flex flex-col items-center gap-1.5 p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
          <span className="w-7 h-7 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-xs flex items-center justify-center">
            3
          </span>
          <span
            className="font-bold text-slate-100 text-sm tracking-wide"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            AVANCE
          </span>
          <p className="text-xs text-slate-400 leading-relaxed">
            Continue até organizar.
          </p>
        </div>
      </div>

      {/* Regra Visual Fundamental */}
      <div className="w-full py-2 px-3.5 rounded-xl bg-blue-950/30 border border-blue-500/20 flex items-center justify-center gap-2 text-center text-xs text-blue-200/90 font-mono">
        <span className="font-bold text-blue-300">COMPARAÇÃO LOCAL:</span>
        <span className="text-slate-300">Apenas vizinhos imediatos trocam de lugar diretamente.</span>
      </div>
    </div>
  );
}
