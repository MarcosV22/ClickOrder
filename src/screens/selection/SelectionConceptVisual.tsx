import React, { useState } from "react";

export type SelectionVisualStep = 1 | 2 | 3;

interface SelectionConceptVisualProps {
  initialStep?: SelectionVisualStep;
}

export default function SelectionConceptVisual({
  initialStep = 1,
}: SelectionConceptVisualProps) {
  const [currentStep, setCurrentStep] = useState<SelectionVisualStep>(initialStep);
  const [step2SubIndex, setStep2SubIndex] = useState<1 | 2>(1);

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      setStep2SubIndex(1);
    } else if (currentStep === 2) {
      if (step2SubIndex === 1) {
        setStep2SubIndex(2);
      } else {
        setCurrentStep(3);
      }
    } else {
      setCurrentStep(1);
      setStep2SubIndex(1);
    }
  };

  const handlePrev = () => {
    if (currentStep === 3) {
      setCurrentStep(2);
      setStep2SubIndex(2);
    } else if (currentStep === 2) {
      if (step2SubIndex === 2) {
        setStep2SubIndex(1);
      } else {
        setCurrentStep(1);
      }
    } else {
      setCurrentStep(3);
    }
  };

  return (
    <div
      role="img"
      aria-label="O scanner percorre 4, 1 e 3 sem mover os elementos. O número 1 é identificado como o menor e, somente após a busca, é colocado na primeira posição."
      className="w-full bg-[#0b1224] border border-slate-800 rounded-2xl p-5 sm:p-7 flex flex-col items-center gap-5 shadow-xl"
    >
      {/* Header com Stepper Tabs */}
      <div className="w-full flex items-center justify-between border-b border-slate-800/80 pb-3">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
          Exemplo com [4, 1, 3]
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
            onClick={() => {
              setCurrentStep(1);
              setStep2SubIndex(1);
            }}
            className={`px-2.5 py-1 rounded-full text-xs font-mono transition-colors cursor-pointer ${
              currentStep === 1
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold"
                : "text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800"
            }`}
          >
            1. PROCURE
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
            2. LEMBRE O MENOR
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
            3. POSICIONE
          </button>
        </div>
      </div>

      {/* Visual Stage */}
      <div className="w-full flex flex-col items-center justify-center py-2 min-h-[170px]">
        {/* Nível Superior: Indicadores (Próxima Posição, Marcador e Menor) */}
        <div className="w-full max-w-sm grid grid-cols-3 gap-3 sm:gap-4 mb-2">
          {/* Coluna 0 (Índice 0) */}
          <div className="flex flex-col items-center justify-end h-12 gap-1">
            <span
              className="text-[9px] sm:text-[10px] font-mono tracking-wider text-purple-300 bg-purple-950/80 border border-purple-500/40 px-2 py-0.5 rounded-full text-center whitespace-nowrap"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              PRÓXIMA POSIÇÃO
            </span>

            {currentStep === 1 && (
              <span
                className="text-[10px] font-mono font-bold tracking-widest text-amber-300 bg-amber-950/90 border border-amber-500/50 px-2 py-0.5 rounded-full shadow-sm animate-fade-in"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                MENOR
              </span>
            )}

            {currentStep === 3 && (
              <span
                className="text-[10px] font-mono font-bold tracking-wider text-emerald-300 bg-emerald-950/90 border border-emerald-500/50 px-2 py-0.5 rounded-full shadow-sm animate-fade-in"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                POSICIONADO
              </span>
            )}
          </div>

          {/* Coluna 1 (Índice 1) */}
          <div className="flex flex-col items-center justify-end h-12 gap-1">
            {currentStep === 2 && step2SubIndex === 1 && (
              <span
                className="text-[9px] sm:text-[10px] font-mono tracking-wider text-purple-300 bg-purple-900/80 border border-purple-400/50 px-2 py-0.5 rounded-full flex items-center gap-1 animate-fade-in"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                <span>MARCADOR</span>
                <span aria-hidden="true">⇣</span>
              </span>
            )}
            {currentStep === 2 && (
              <span
                className="text-[10px] font-mono font-bold tracking-widest text-amber-300 bg-amber-950/90 border border-amber-500/50 px-2 py-0.5 rounded-full shadow-sm animate-fade-in"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                MENOR
              </span>
            )}
          </div>

          {/* Coluna 2 (Índice 2) */}
          <div className="flex flex-col items-center justify-end h-12 gap-1">
            {currentStep === 2 && step2SubIndex === 2 && (
              <span
                className="text-[9px] sm:text-[10px] font-mono tracking-wider text-purple-300 bg-purple-900/80 border border-purple-400/50 px-2 py-0.5 rounded-full flex items-center gap-1 animate-fade-in"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                <span>MARCADOR</span>
                <span aria-hidden="true">⇣</span>
              </span>
            )}
          </div>
        </div>

        {/* Nível Central: As Caixas sobre a Esteira */}
        <div className="w-full max-w-sm grid grid-cols-3 gap-3 sm:gap-4 items-center justify-items-center">
          {/* Caixa do Índice 0 */}
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl flex items-center justify-center font-bold text-2xl sm:text-3xl transition-all duration-300 ${
              currentStep === 1
                ? "bg-amber-950/40 border-2 border-amber-400/80 text-amber-200 ring-2 ring-amber-500/30 shadow-lg shadow-amber-950/40"
                : currentStep === 2
                  ? "bg-slate-900/90 border-2 border-slate-700 text-slate-300"
                  : "bg-emerald-950/40 border-2 border-emerald-500/80 text-emerald-200 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-950/40"
            }`}
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            {currentStep === 3 ? 1 : 4}
          </div>

          {/* Caixa do Índice 1 */}
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl flex items-center justify-center font-bold text-2xl sm:text-3xl transition-all duration-300 ${
              currentStep === 2 && step2SubIndex === 1
                ? "bg-amber-950/50 border-2 border-amber-400 text-amber-200 ring-2 ring-purple-500/50 shadow-lg shadow-amber-950/40"
                : currentStep === 2
                  ? "bg-amber-950/40 border-2 border-amber-400/80 text-amber-200 ring-1 ring-amber-500/30"
                  : "bg-slate-900/90 border-2 border-slate-700 text-slate-300"
            }`}
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            {currentStep === 3 ? 4 : 1}
          </div>

          {/* Caixa do Índice 2 */}
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl flex items-center justify-center font-bold text-2xl sm:text-3xl transition-all duration-300 ${
              currentStep === 2 && step2SubIndex === 2
                ? "bg-purple-950/40 border-2 border-purple-400 text-purple-200 ring-2 ring-purple-500/40 shadow-lg shadow-purple-950/40"
                : "bg-slate-900/90 border-2 border-slate-700 text-slate-300"
            }`}
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            3
          </div>
        </div>

        {/* Sub-navegação contextual dentro da busca (Passo 2) */}
        {currentStep === 2 && (
          <div className="flex items-center gap-2 mt-3 text-xs font-mono">
            <span className="text-slate-400 text-[11px]">Varredura:</span>
            <button
              type="button"
              onClick={() => setStep2SubIndex(1)}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                step2SubIndex === 1
                  ? "bg-purple-500/30 border border-purple-400 text-purple-200 font-bold"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              Olhando o 1
            </button>
            <button
              type="button"
              onClick={() => setStep2SubIndex(2)}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                step2SubIndex === 2
                  ? "bg-purple-500/30 border border-purple-400 text-purple-200 font-bold"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              Olhando o 3
            </button>
          </div>
        )}

        {/* Explicação Narrativa do Passo Corrente */}
        <div className="mt-4 px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 w-full max-w-md text-center">
          {currentStep === 1 && (
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Começamos procurando o menor número. O primeiro elemento (<strong>4</strong>) é considerado o menor encontrado até agora.
            </p>
          )}

          {currentStep === 2 && step2SubIndex === 1 && (
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              O marcador olha o <strong>1</strong>. Como 1 é menor que 4, guardamos o <strong>1</strong> como o novo menor.
            </p>
          )}

          {currentStep === 2 && step2SubIndex === 2 && (
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              O marcador olha o <strong>3</strong>. Como 3 é maior que 1, o menor continua sendo o <strong>1</strong>.
            </p>
          )}

          {currentStep === 3 && (
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              A varredura terminou! Agora colocamos o menor (<strong>1</strong>) na próxima posição: <code>[1, 4, 3]</code>.
            </p>
          )}
        </div>

        {/* Nota da Regra Visual Fundamental */}
        <div className="mt-2 text-[11px] sm:text-xs text-purple-300/90 font-mono text-center flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          <span>Durante a busca, nenhuma caixa sai do lugar.</span>
        </div>
      </div>

      {/* Controles de Navegação Anterior / Próximo */}
      <div className="w-full flex items-center justify-between pt-2 border-t border-slate-800/80">
        <button
          type="button"
          onClick={handlePrev}
          className="text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2.5 py-1 rounded border border-slate-800 bg-slate-900/50 hover:bg-slate-800/50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-purple-400"
        >
          ‹ Anterior
        </button>

        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => {
                setCurrentStep(step as SelectionVisualStep);
                if (step === 2) setStep2SubIndex(1);
              }}
              aria-label={`Ir para o passo ${step}`}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                currentStep === step
                  ? "w-5 bg-purple-400"
                  : "bg-slate-700 hover:bg-slate-600"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="text-xs font-mono text-purple-300 hover:text-purple-100 flex items-center gap-1 px-2.5 py-1 rounded border border-purple-500/30 bg-purple-950/40 hover:bg-purple-900/40 transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-purple-400"
        >
          Próximo ›
        </button>
      </div>
    </div>
  );
}
