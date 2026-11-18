import React, { useState } from "react";

export type InsertionVisualStep = 1 | 2 | 3;

interface InsertionConceptVisualProps {
  initialStep?: InsertionVisualStep;
}

export default function InsertionConceptVisual({
  initialStep = 1,
}: InsertionConceptVisualProps) {
  const [currentStep, setCurrentStep] = useState<InsertionVisualStep>(initialStep);

  const handleNext = () => {
    setCurrentStep((prev) => (prev === 3 ? 1 : ((prev + 1) as InsertionVisualStep)));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => (prev === 1 ? 3 : ((prev - 1) as InsertionVisualStep)));
  };

  return (
    <div
      role="img"
      aria-label="Demonstração do Insertion Sort: o número 3 é retirado da lista como chave. O número 5, por ser maior, desliza uma posição para a direita abrindo espaço. O número 3 é inserido na vaga entre 2 e 5, resultando em 2, 3, 5."
      className="w-full bg-[#0b1224] border border-slate-800 rounded-2xl p-5 sm:p-7 flex flex-col items-center gap-5 shadow-xl"
    >
      {/* Header com Stepper Tabs */}
      <div className="w-full flex items-center justify-between border-b border-slate-800/80 pb-3">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
          Exemplo com [2, 5, 3]
        </span>

        {/* Pill buttons para os 3 passos */}
        <div className="flex items-center gap-1.5 sm:gap-2" role="tablist" aria-label="Passos da demonstração">
          <button
            type="button"
            role="tab"
            aria-selected={currentStep === 1}
            onClick={() => setCurrentStep(1)}
            className={`px-2.5 py-1 rounded-full text-xs font-mono transition-colors cursor-pointer ${
              currentStep === 1
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold"
                : "text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800"
            }`}
          >
            1. PEGUE
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={currentStep === 2}
            onClick={() => setCurrentStep(2)}
            className={`px-2.5 py-1 rounded-full text-xs font-mono transition-colors cursor-pointer ${
              currentStep === 2
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                : "text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800"
            }`}
          >
            2. ABRA ESPAÇO
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
            3. ENCAIXE
          </button>
        </div>
      </div>

      {/* Visual Stage */}
      <div className="w-full flex flex-col items-center justify-center py-2 min-h-[170px]">
        {/* Nível Superior: Chave Suspensa (visível nos passos 1 e 2) */}
        <div className="w-full max-w-xs h-12 flex items-center justify-center relative mb-2">
          {currentStep === 1 && (
            <div className="flex flex-col items-center animate-fade-in transition-all">
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-950/80 border-2 border-amber-400 shadow-lg shadow-amber-950/60 text-amber-200 font-bold font-mono">
                <span className="text-xl" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  3
                </span>
                <span className="text-[10px] tracking-widest text-amber-300 uppercase">
                  CHAVE
                </span>
              </div>
              <span className="text-amber-400 text-xs leading-none mt-1 animate-bounce">⇣</span>
            </div>
          )}

          {currentStep === 2 && (
            <div className="flex flex-col items-center animate-fade-in transition-all">
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-950/80 border-2 border-amber-400 shadow-lg shadow-amber-950/60 text-amber-200 font-bold font-mono">
                <span className="text-xl" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  3
                </span>
                <span className="text-[10px] tracking-widest text-amber-300 uppercase">
                  CHAVE
                </span>
              </div>
              <span className="text-cyan-400 text-xs leading-none mt-1">⇣ vaga pronta</span>
            </div>
          )}

          {currentStep === 3 && (
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <span>Chave encaixada no local certo</span>
            </div>
          )}
        </div>

        {/* Esteira Principal de Caixas */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 p-3 rounded-xl bg-[#070c18] border border-slate-800/80 w-full max-w-sm">
          {/* Caixa 1: Valor 2 (sempre no índice 0) */}
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex flex-col items-center justify-center shadow-md transition-all ${
              currentStep === 3
                ? "bg-emerald-950/40 border border-emerald-500/40"
                : "bg-[#111827] border border-slate-700"
            }`}
          >
            <span
              className={`text-2xl sm:text-3xl font-bold ${
                currentStep === 3 ? "text-emerald-200" : "text-slate-200"
              }`}
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              2
            </span>
          </div>

          {/* Posição Central (Índice 1) */}
          {currentStep === 1 && (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex flex-col items-center justify-center shadow-md">
              <span
                className="text-2xl sm:text-3xl font-bold text-cyan-200"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                5
              </span>
            </div>
          )}

          {currentStep === 2 && (
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 border-dashed border-amber-400/60 bg-amber-950/20 flex flex-col items-center justify-center text-amber-300 font-mono shadow-inner"
              aria-label="Espaço vazio onde a chave poderá entrar"
            >
              <span className="text-xs font-bold tracking-wider">VAGA</span>
            </div>
          )}

          {currentStep === 3 && (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-emerald-950/60 border-2 border-emerald-400 flex flex-col items-center justify-center shadow-lg shadow-emerald-950/50">
              <span
                className="text-2xl sm:text-3xl font-bold text-emerald-200"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                3
              </span>
            </div>
          )}

          {/* Posição Direita (Índice 2) */}
          {currentStep === 1 && (
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 border-dashed border-amber-400/40 bg-amber-950/10 flex flex-col items-center justify-center text-amber-300/80 font-mono"
              aria-label="Espaço vazio deixado pelo 3"
            >
              <span className="text-xs font-bold tracking-wider">VAGA</span>
            </div>
          )}

          {currentStep === 2 && (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-cyan-950/60 border-2 border-cyan-400 flex flex-col items-center justify-center shadow-md">
              <span
                className="text-2xl sm:text-3xl font-bold text-cyan-200"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                5
              </span>
            </div>
          )}

          {currentStep === 3 && (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col items-center justify-center shadow-md">
              <span
                className="text-2xl sm:text-3xl font-bold text-emerald-200"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                5
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Mensagem e Explicação do Passo Atual */}
      <div className="w-full text-center flex flex-col items-center gap-1 min-h-[44px]">
        {currentStep === 1 && (
          <>
            <p className="text-sm font-semibold text-white">
              Vamos encaixar o 3.
            </p>
            <p className="text-xs text-slate-400 max-w-md">
              O número que estamos encaixando é chamado de chave. O espaço vazio é a vaga aberta.
            </p>
          </>
        )}

        {currentStep === 2 && (
          <>
            <p className="text-sm font-semibold text-cyan-200">
              5 é maior que 3, então ele desliza para a direita.
            </p>
            <p className="text-xs text-slate-400 max-w-md">
              O 5 apenas desliza. Ele não troca de lugar com o 3. A vaga move-se para a esquerda.
            </p>
          </>
        )}

        {currentStep === 3 && (
          <>
            <p className="text-sm font-semibold text-emerald-300">
              Agora o 3 cabe aqui.
            </p>
            <p className="text-xs text-slate-400 max-w-md">
              O 3 encaixa entre o 2 e o 5. O vetor fica organizado: [2, 3, 5].
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
          aria-label={currentStep === 3 ? "Rever demonstração desde o início" : "Próximo passo da demonstração"}
        >
          {currentStep === 3 ? "↻ Rever" : "Próximo ›"}
        </button>
      </div>
    </div>
  );
}
