import React, { useState } from "react";

export type BubbleVisualStep = 1 | 2 | 3;

interface BubbleConceptVisualProps {
  initialStep?: BubbleVisualStep;
}

export default function BubbleConceptVisual({
  initialStep = 1,
}: BubbleConceptVisualProps) {
  const [currentStep, setCurrentStep] = useState<BubbleVisualStep>(initialStep);

  const handleNext = () => {
    setCurrentStep((prev) => (prev === 3 ? 1 : ((prev + 1) as BubbleVisualStep)));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => (prev === 1 ? 3 : ((prev - 1) as BubbleVisualStep)));
  };

  return (
    <div
      role="img"
      aria-label="Dois elementos vizinhos 8 e 3 são comparados. Como 8 é maior que 3, eles realizam uma troca bilateral, resultando em 3 e 8."
      className="w-full bg-[#0b1224] border border-slate-800 rounded-2xl p-5 sm:p-7 flex flex-col items-center gap-5 shadow-xl"
    >
      {/* Header com Stepper Tabs */}
      <div className="w-full flex items-center justify-between border-b border-slate-800/80 pb-3">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
          Exemplo com [8, 3]
        </span>

        {/* Pill buttons para os 3 passos */}
        <div
          className="flex items-center gap-1.5 sm:gap-2"
          role="tablist"
          aria-label="Passos da demonstração"
        >
          <button
            type="button"
            role="tab"
            aria-selected={currentStep === 1}
            onClick={() => setCurrentStep(1)}
            className={`px-2.5 py-1 rounded-full text-xs font-mono transition-colors cursor-pointer ${
              currentStep === 1
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold"
                : "text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800"
            }`}
          >
            1. COMPARE
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={currentStep === 2}
            onClick={() => setCurrentStep(2)}
            className={`px-2.5 py-1 rounded-full text-xs font-mono transition-colors cursor-pointer ${
              currentStep === 2
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold"
                : "text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800"
            }`}
          >
            2. DECIDA
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={currentStep === 3}
            onClick={() => setCurrentStep(3)}
            className={`px-2.5 py-1 rounded-full text-xs font-mono transition-colors cursor-pointer ${
              currentStep === 3
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
                : "text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800"
            }`}
          >
            3. AVANCE
          </button>
        </div>
      </div>

      {/* Visual Stage */}
      <div className="w-full flex flex-col items-center justify-center py-2 min-h-[170px]">
        {/* Nível Superior: Indicadores contextuais */}
        <div className="w-full max-w-sm h-12 flex items-center justify-center relative mb-2">
          {currentStep === 1 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-300 text-xs font-mono animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block animate-pulse" />
              <span>VIZINHOS EM FOCO</span>
            </div>
          )}

          {currentStep === 2 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-mono font-bold animate-fade-in">
              <span>8 &gt; 3</span>
              <span className="text-amber-400">⚡</span>
              <span>PRECISAM TROCAR</span>
            </div>
          )}

          {currentStep === 3 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <span>TROCA REALIZADA</span>
            </div>
          )}
        </div>

        {/* Esteira Principal com os dois elementos */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 p-4 rounded-xl bg-[#070c18] border border-slate-800/80 w-full max-w-sm">
          {/* Caixa da Esquerda */}
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex flex-col items-center justify-center shadow-md transition-all ${
              currentStep === 1
                ? "bg-blue-950/40 border-2 border-blue-400 shadow-blue-500/20"
                : currentStep === 2
                  ? "bg-amber-950/40 border-2 border-amber-400 shadow-amber-500/20"
                  : "bg-emerald-950/40 border-2 border-emerald-500/40 shadow-emerald-500/20"
            }`}
          >
            <span
              className={`text-2xl sm:text-3xl font-bold ${
                currentStep === 1
                  ? "text-blue-200"
                  : currentStep === 2
                    ? "text-amber-200"
                    : "text-emerald-200"
              }`}
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              {currentStep === 3 ? 3 : 8}
            </span>
            <span className="text-[10px] font-mono text-slate-400 mt-0.5">
              pos 0
            </span>
          </div>

          {/* Símbolo de Interação / Movimento entre os dois */}
          <div className="flex flex-col items-center justify-center font-mono">
            {currentStep === 1 && (
              <span className="text-blue-400 text-xl font-bold tracking-widest">
                ↔
              </span>
            )}
            {currentStep === 2 && (
              <div className="flex flex-col items-center">
                <span className="text-amber-400 text-2xl font-bold animate-pulse">
                  ⇄
                </span>
                <span className="text-[9px] text-amber-300 font-bold uppercase tracking-wider">
                  trocar
                </span>
              </div>
            )}
            {currentStep === 3 && (
              <span className="text-emerald-400 text-xl font-bold">
                ✓
              </span>
            )}
          </div>

          {/* Caixa da Direita */}
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex flex-col items-center justify-center shadow-md transition-all ${
              currentStep === 1
                ? "bg-blue-950/40 border-2 border-blue-400 shadow-blue-500/20"
                : currentStep === 2
                  ? "bg-amber-950/40 border-2 border-amber-400 shadow-amber-500/20"
                  : "bg-emerald-950/50 border-2 border-emerald-400 shadow-emerald-500/25"
            }`}
          >
            <span
              className={`text-2xl sm:text-3xl font-bold ${
                currentStep === 1
                  ? "text-blue-200"
                  : currentStep === 2
                    ? "text-amber-200"
                    : "text-emerald-100"
              }`}
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              {currentStep === 3 ? 8 : 3}
            </span>
            <span className="text-[10px] font-mono text-slate-400 mt-0.5">
              pos 1
            </span>
          </div>
        </div>
      </div>

      {/* Mensagem e Explicação do Passo Atual */}
      <div className="w-full text-center flex flex-col items-center gap-1 min-h-[44px]">
        {currentStep === 1 && (
          <>
            <p className="text-sm font-semibold text-white">
              Olhamos apenas duas caixas vizinhas.
            </p>
            <p className="text-xs text-slate-400 max-w-md">
              O Bubble Sort compara pares lado a lado ao longo da fila.
            </p>
          </>
        )}

        {currentStep === 2 && (
          <>
            <p className="text-sm font-semibold text-amber-200">
              8 é maior que 3: precisam trocar.
            </p>
            <p className="text-xs text-slate-400 max-w-md">
              Como o número da esquerda é maior, os dois vizinhos trocam de posição.
            </p>
          </>
        )}

        {currentStep === 3 && (
          <>
            <p className="text-sm font-semibold text-emerald-300">
              Troca feita: o maior avançou.
            </p>
            <p className="text-xs text-slate-400 max-w-md">
              O 3 veio para a esquerda e o 8 seguiu para a direita: [3, 8].
            </p>
          </>
        )}
      </div>

      {/* Controles de Navegação do Stepper */}
      <div className="w-full flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs font-mono">
        <button
          type="button"
          onClick={handlePrev}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
          aria-label="Passo anterior da demonstração"
        >
          ‹ Anterior
        </button>

        <span className="text-slate-400 font-medium">
          Passo {currentStep} de 3
        </span>

        <button
          type="button"
          onClick={handleNext}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
          aria-label={
            currentStep === 3
              ? "Rever demonstração desde o início"
              : "Próximo passo da demonstração"
          }
        >
          {currentStep === 3 ? "↻ Rever" : "Próximo ›"}
        </button>
      </div>
    </div>
  );
}
