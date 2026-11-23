import React, { useState } from "react";

export interface InsertionConceptualCheckpointProps {
  onDismiss: () => void;
}

export default function InsertionConceptualCheckpoint({
  onDismiss,
}: InsertionConceptualCheckpointProps) {
  const [selectedOption, setSelectedOption] = useState<"shift" | "swap" | null>(null);

  const handleSelect = (option: "shift" | "swap") => {
    setSelectedOption(option);
  };

  return (
    <div
      role="region"
      aria-label="Reflexão conceitual sobre deslocamento versus troca"
      className="w-full max-w-xl bg-[#0d1635]/95 border border-cyan-500/30 rounded-2xl p-6 sm:p-7 shadow-2xl flex flex-col items-center gap-5 text-center animate-fadeIn"
    >
      {/* Badge de cabeçalho */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold tracking-wider uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span>Reflexão Conceitual • Deslocamento vs Troca</span>
      </div>

      {/* Pergunta Pedagógica */}
      <div className="space-y-2">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-100">
          O que acabou de acontecer com a carga <span className="text-cyan-300 font-mono underline decoration-cyan-400/50 decoration-2 underline-offset-4">4</span>?
        </h3>
        <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
          Repare na esteira e no trilho aéreo antes de responder.
        </p>
      </div>

      {/* Opções */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        <button
          type="button"
          data-testid="checkpoint-option-shift"
          onClick={() => handleSelect("shift")}
          className={`flex items-center justify-center p-3.5 rounded-xl font-semibold border transition-all cursor-pointer text-sm leading-snug ${
            selectedOption === "shift"
              ? "bg-emerald-950/70 border-emerald-400 text-emerald-200 shadow-lg shadow-emerald-950/50"
              : "bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200 hover:border-cyan-400/50"
          }`}
        >
          <span>Deslizou para a direita para abrir espaço</span>
        </button>

        <button
          type="button"
          data-testid="checkpoint-option-swap"
          onClick={() => handleSelect("swap")}
          className={`flex items-center justify-center p-3.5 rounded-xl font-semibold border transition-all cursor-pointer text-sm leading-snug ${
            selectedOption === "swap"
              ? "bg-amber-950/70 border-amber-400 text-amber-200 shadow-lg shadow-amber-950/50"
              : "bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200 hover:border-cyan-400/50"
          }`}
        >
          <span>Trocou diretamente de lugar com a chave</span>
        </button>
      </div>

      {/* Feedback Explicativo */}
      {selectedOption !== null && (
        <div
          role="status"
          className={`w-full p-4 rounded-xl border text-sm font-medium text-left flex items-start gap-3 animate-fadeIn ${
            selectedOption === "shift"
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
              : "bg-amber-950/40 border-amber-500/40 text-amber-200"
          }`}
        >
          <span className="text-base leading-none mt-0.5">
            {selectedOption === "shift" ? "✓" : "!"}
          </span>
          <div className="space-y-1">
            <p className="font-bold">
              {selectedOption === "shift"
                ? "Exato! Deslocamento NÃO é troca (SHIFT ≠ SWAP):"
                : "Atenção: não houve troca bilateral:"}
            </p>
            <p className="text-xs leading-relaxed opacity-90">
              {selectedOption === "shift"
                ? "A chave 2 permaneceu no trilho aéreo! A carga 4 apenas deslizou uma posição para a direita na esteira, movendo a vaga física para a esquerda."
                : "A chave 2 não desceu nem trocou de posição com o 4. O 4 apenas deslizou para a vaga disponível, abrindo espaço na primeira posição."}
            </p>
          </div>
        </div>
      )}

      {/* Botão de continuação */}
      {selectedOption !== null && (
        <button
          type="button"
          data-testid="checkpoint-continue-button"
          onClick={onDismiss}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-slate-950 font-bold transition-all shadow-lg shadow-cyan-500/20 cursor-pointer animate-fadeIn"
        >
          Continuar Operação →
        </button>
      )}
    </div>
  );
}
