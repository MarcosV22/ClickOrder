import React, { useState } from "react";

export interface SelectionPredictionCardProps {
  initialValues: readonly number[];
  onConfirm: () => void;
}

export default function SelectionPredictionCard({
  initialValues,
  onConfirm,
}: SelectionPredictionCardProps) {
  const [selectedVal, setSelectedVal] = useState<number | null>(null);

  const options = Array.from(new Set(initialValues));

  return (
    <div className="w-full bg-[#0d1635]/95 border border-purple-500/40 rounded-2xl p-6 sm:p-7 shadow-2xl flex flex-col items-center gap-5 text-center animate-fadeIn">
      <div className="space-y-1.5">
        <span className="text-xs uppercase tracking-wider font-mono text-purple-400 font-semibold px-2.5 py-1 rounded bg-purple-950/60 border border-purple-500/30">
          Desafio Inicial • Previsão Rápida
        </span>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-100 mt-2">
          Qual é o menor elemento de todo o vetor?
        </h3>
        <p className="text-sm text-slate-300 max-w-lg">
          Olhe para o lote inicial. Nossos olhos conseguem ver todos de uma vez, mas o algoritmo precisará varrer um por um!
        </p>
      </div>

      <div className="flex gap-4 justify-center my-2">
        {options.map((val) => (
          <button
            key={val}
            type="button"
            data-testid={`prediction-option-${val}`}
            onClick={() => setSelectedVal(val)}
            className={`w-14 h-14 rounded-2xl text-xl font-bold font-mono transition-all cursor-pointer border flex items-center justify-center ${
              selectedVal === val
                ? "bg-purple-600 text-white border-purple-300 shadow-lg shadow-purple-900/50 scale-110 ring-2 ring-purple-400"
                : "bg-slate-800/90 text-slate-200 border-slate-700 hover:border-purple-400 hover:bg-slate-750"
            }`}
          >
            {val}
          </button>
        ))}
      </div>

      {selectedVal !== null ? (
        <div className="space-y-4 max-w-md w-full animate-fadeIn">
          <div className="p-3.5 bg-purple-950/40 border border-purple-500/30 rounded-xl text-xs sm:text-sm text-purple-200 leading-relaxed text-left">
            {selectedVal === 1 ? (
              <span>
                <strong>Excelente intuição!</strong> O menor valor de fato é o <strong>1</strong>. Agora vamos ver o scanner varrer caixa por caixa para o computador descobrir isso sozinho.
              </span>
            ) : (
              <span>
                <strong>Boa tentativa!</strong> Você selecionou o <strong>{selectedVal}</strong>. Vamos acompanhar o scanner passo a passo e ver qual valor realmente é o menor de todos.
              </span>
            )}
          </div>

          <button
            type="button"
            data-testid="confirm-prediction-button"
            onClick={onConfirm}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 active:from-purple-700 active:to-cyan-700 shadow-lg shadow-purple-900/40 border border-purple-400/40 cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            <span>COMEÇAR A BUSCA PASSO A PASSO ➔</span>
          </button>
        </div>
      ) : (
        <p className="text-xs text-slate-500 font-mono">
          Clique no número que você considera o menor
        </p>
      )}
    </div>
  );
}
