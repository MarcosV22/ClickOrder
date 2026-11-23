import React, { useState } from "react";

export interface InsertionPredictionCardProps {
  onConfirm: () => void;
}

export default function InsertionPredictionCard({
  onConfirm,
}: InsertionPredictionCardProps) {
  const [selectedPrediction, setSelectedPrediction] = useState<"before" | "after" | null>(null);

  const handleSelect = (prediction: "before" | "after") => {
    setSelectedPrediction(prediction);
  };

  return (
    <div
      role="region"
      aria-label="Desafio inicial de predição do Insertion Sort"
      className="w-full max-w-xl bg-[#0d1635]/95 border border-amber-500/30 rounded-2xl p-6 sm:p-7 shadow-2xl flex flex-col items-center gap-5 text-center animate-fadeIn"
    >
      {/* Badge de cabeçalho */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold tracking-wider uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span>Predição Inicial • Observe antes de agir</span>
      </div>

      {/* Pergunta Pedagógica */}
      <div className="space-y-2">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-100">
          A chave <span className="text-amber-400 font-mono underline decoration-amber-400/50 decoration-2 underline-offset-4">2</span> deve ficar antes ou depois do <span className="text-cyan-300 font-mono underline decoration-cyan-400/50 decoration-2 underline-offset-4">4</span>?
        </h3>
        <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
          O primeiro lote de cargas é <code className="text-amber-300 font-mono bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/20">[4, 2, 3]</code>.
          A chave <strong className="text-amber-300">2</strong> acabou de subir para o trilho suspenso.
          Pense na ordem crescente final desejada.
        </p>
      </div>

      {/* Opções de Predição */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        <button
          type="button"
          data-testid="prediction-option-before"
          onClick={() => handleSelect("before")}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold border transition-all cursor-pointer ${
            selectedPrediction === "before"
              ? "bg-emerald-950/70 border-emerald-400 text-emerald-200 shadow-lg shadow-emerald-950/50"
              : "bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200 hover:border-amber-400/50"
          }`}
        >
          <span>Antes do 4</span>
        </button>

        <button
          type="button"
          data-testid="prediction-option-after"
          onClick={() => handleSelect("after")}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold border transition-all cursor-pointer ${
            selectedPrediction === "after"
              ? "bg-amber-950/70 border-amber-400 text-amber-200 shadow-lg shadow-amber-950/50"
              : "bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200 hover:border-amber-400/50"
          }`}
        >
          <span>Depois do 4</span>
        </button>
      </div>

      {/* Feedback Explicativo */}
      {selectedPrediction !== null && (
        <div
          role="status"
          className={`w-full p-4 rounded-xl border text-sm font-medium text-left flex items-start gap-3 animate-fadeIn ${
            selectedPrediction === "before"
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
              : "bg-amber-950/40 border-amber-500/40 text-amber-200"
          }`}
        >
          <span className="text-base leading-none mt-0.5">
            {selectedPrediction === "before" ? "✓" : "!"}
          </span>
          <div className="space-y-1">
            <p className="font-bold">
              {selectedPrediction === "before" ? "Excelente intuição!" : "Atenção à ordem crescente:"}
            </p>
            <p className="text-xs leading-relaxed opacity-90">
              {selectedPrediction === "before"
                ? "Como 2 é menor que 4, na ordem crescente o 2 precisa ficar antes do 4. Por isso o 4 precisará deslizar para a direita para abrir espaço!"
                : "Como 2 é menor que 4, o 2 precisa vir antes do 4. Para isso acontecer, o 4 terá que deslizar para a direita abrindo uma vaga."}
            </p>
          </div>
        </div>
      )}

      {/* Botão de confirmação para avançar à prática */}
      {selectedPrediction !== null && (
        <button
          type="button"
          data-testid="confirm-prediction-button"
          onClick={onConfirm}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold transition-all shadow-lg shadow-amber-500/20 cursor-pointer animate-fadeIn"
        >
          Iniciar Triagem Guiada →
        </button>
      )}
    </div>
  );
}
