import React from "react";

export default function InsertionConceptSteps() {
  return (
    <div
      className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center"
      aria-label="Os 3 passos do Insertion Sort"
    >
      {/* Passo 1: PEGUE */}
      <div className="flex flex-col items-center gap-1.5 p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
        <span className="w-7 h-7 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs flex items-center justify-center">
          1
        </span>
        <span
          className="font-bold text-slate-100 text-sm tracking-wide"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          PEGUE
        </span>
        <p className="text-xs text-slate-400 leading-relaxed">
          Escolha o próximo número.
        </p>
      </div>

      {/* Passo 2: ABRA ESPAÇO */}
      <div className="flex flex-col items-center gap-1.5 p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
        <span className="w-7 h-7 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center">
          2
        </span>
        <span
          className="font-bold text-slate-100 text-sm tracking-wide"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          ABRA ESPAÇO
        </span>
        <p className="text-xs text-slate-400 leading-relaxed">
          Mova para a direita quem for maior.
        </p>
      </div>

      {/* Passo 3: ENCAIXE */}
      <div className="flex flex-col items-center gap-1.5 p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
        <span className="w-7 h-7 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-xs flex items-center justify-center">
          3
        </span>
        <span
          className="font-bold text-slate-100 text-sm tracking-wide"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          ENCAIXE
        </span>
        <p className="text-xs text-slate-400 leading-relaxed">
          Coloque a chave na vaga.
        </p>
      </div>
    </div>
  );
}
