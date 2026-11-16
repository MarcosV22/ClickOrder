import React, { useState, useRef } from "react";
import NumberedBox from "../../components/NumberedBox";

export interface BubbleTutorialScreenV2Props {
  onComplete: () => void;
  onBack: () => void;
}

type TutorialStep = 1 | 2 | 3 | 4;

export default function BubbleTutorialScreenV2({
  onComplete,
  onBack,
}: BubbleTutorialScreenV2Props) {
  const [step, setStep] = useState<TutorialStep>(1);
  const [array, setArray] = useState<number[]>([3, 1, 2]);
  const [isSwapping, setIsSwapping] = useState(false);
  const [predictionAnswered, setPredictionAnswered] = useState(false);
  const [predictionFeedback, setPredictionFeedback] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const isTransitioningRef = useRef(false);

  const handlePredict = (chosenValue: number) => {
    setPredictionAnswered(true);
    if (chosenValue === 3) {
      setPredictionFeedback("Excelente! Como 3 é maior que 1, ele deve avançar para a direita.");
    } else {
      setPredictionFeedback("Observe com atenção: estamos organizando do menor para o maior. O número 3 (maior) deve ficar à direita.");
    }
  };

  const handleSwapStep1 = () => {
    if (isTransitioningRef.current || isSwapping) return;
    isTransitioningRef.current = true;
    setIsSwapping(true);
    setActionFeedback("Isso! 3 e 1 trocaram de posição.");

    setTimeout(() => {
      setArray([1, 3, 2]);
      setIsSwapping(false);
      isTransitioningRef.current = false;
      setStep(2);
      setActionFeedback(null);
    }, 350);
  };

  const handleSwapStep2 = () => {
    if (isTransitioningRef.current || isSwapping) return;
    isTransitioningRef.current = true;
    setIsSwapping(true);
    setActionFeedback("Perfeito! 3 é maior que 2 e trocou de posição.");

    setTimeout(() => {
      setArray([1, 2, 3]);
      setIsSwapping(false);
      isTransitioningRef.current = false;
      setStep(3);
      setActionFeedback(null);
    }, 350);
  };

  const handleKeepStep3 = () => {
    if (isTransitioningRef.current) return;
    setActionFeedback("Muito bem! 1 é menor que 2, então nada precisou ser trocado.");
    setTimeout(() => {
      setStep(4);
    }, 400);
  };

  const handleReset = () => {
    setStep(1);
    setArray([3, 1, 2]);
    setIsSwapping(false);
    setPredictionAnswered(false);
    setPredictionFeedback(null);
    setActionFeedback(null);
    isTransitioningRef.current = false;
  };

  return (
    <div className="w-full h-full min-h-screen overflow-y-auto overflow-x-hidden bg-[#0a0e1a] text-slate-100 flex flex-col items-center justify-start py-8 px-4 sm:px-6">
      <div className="w-full max-w-2xl flex flex-col items-center gap-8 my-auto">
        {/* Top Header */}
        <div className="w-full flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer px-2 py-1 rounded"
            aria-label="Voltar para a tela anterior"
          >
            <span>‹</span>
            <span>Voltar</span>
          </button>

          <span className="text-xs font-mono text-blue-400 bg-blue-950/60 border border-blue-500/30 px-3 py-1 rounded-full">
            {step < 4 ? `Passo ${step} de 3` : "Concluído"}
          </span>

          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer px-2 py-1"
          >
            ↺ Reiniciar
          </button>
        </div>

        {/* Title */}
        <div className="text-center flex flex-col items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {step === 1 && "Passo 1: Compare o primeiro par"}
            {step === 2 && "Passo 2: Compare o próximo par"}
            {step === 3 && "Passo 3: Segunda passada"}
            {step === 4 && "Vetor Ordenado com Sucesso!"}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-lg">
            {step === 1 && "O Bubble Sort sempre compara dois vizinhos por vez, da esquerda para a direita."}
            {step === 2 && "O número 3 continua sendo comparado com o próximo vizinho da esteira."}
            {step === 3 && "O número 3 já está no lugar final. Agora recomeçamos com os vizinhos restantes."}
            {step === 4 && "Você completou o ciclo de comparações do Bubble Sort."}
          </p>
        </div>

        {/* Conveyor Belt Stage */}
        <div className="w-full bg-[#111827]/80 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col items-center gap-6 shadow-xl">
          <div className="flex items-center justify-center gap-4 sm:gap-6 py-4">
            {array.map((val, idx) => {
              // Role logic for tutorial
              let isPair = false;
              let isSorted = false;

              if (step === 1) {
                isPair = idx === 0 || idx === 1;
              } else if (step === 2) {
                isPair = idx === 1 || idx === 2;
              } else if (step === 3) {
                isPair = idx === 0 || idx === 1;
                isSorted = idx === 2; // 3 is sorted
              } else if (step === 4) {
                isSorted = true;
              }

              return (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  <NumberedBox
                    value={val}
                    index={idx}
                    role={isPair ? "pair" : isSorted ? "sorted" : "default"}
                    variant="learning"
                    showIndex={false}
                    animating={isSwapping && isPair ? (idx === 0 || (step === 2 && idx === 1) ? "left" : "right") : null}
                  />
                  {isPair && (
                    <span className="text-[11px] font-mono text-blue-400 font-semibold">
                      vizinho
                    </span>
                  )}
                  {isSorted && (
                    <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                      fixado ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Prompt / Decision area */}
          {step === 1 && (
            <div className="w-full border-t border-slate-800 pt-6 flex flex-col items-center gap-4">
              {!predictionAnswered ? (
                /* Step 1: Pre-Action Prediction */
                <div className="w-full bg-blue-950/30 border border-blue-500/30 rounded-xl p-5 flex flex-col items-center gap-3 text-center">
                  <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
                    Previsão antes de agir
                  </span>
                  <p className="text-sm text-slate-200">
                    Depois de comparar <strong>3</strong> e <strong>1</strong>, qual valor ficará mais à direita?
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <button
                      type="button"
                      data-testid="predict-3"
                      onClick={() => handlePredict(3)}
                      className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-base transition-colors cursor-pointer"
                    >
                      3
                    </button>
                    <button
                      type="button"
                      data-testid="predict-1"
                      onClick={() => handlePredict(1)}
                      className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-base transition-colors cursor-pointer"
                    >
                      1
                    </button>
                  </div>
                </div>
              ) : (
                /* Step 1: Action phase */
                <div className="w-full flex flex-col items-center gap-4 text-center">
                  {predictionFeedback && (
                    <p className="text-xs sm:text-sm text-blue-300 font-medium bg-blue-950/40 px-4 py-2 rounded-lg border border-blue-500/20 max-w-md">
                      {predictionFeedback}
                    </p>
                  )}
                  <p className="text-sm sm:text-base text-slate-200">
                    Como <strong>3 &gt; 1</strong>, eles estão fora de ordem. Realize a troca:
                  </p>
                  <button
                    type="button"
                    data-testid="tutorial-swap-1"
                    onClick={handleSwapStep1}
                    className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
                  >
                    ⇄ Trocar
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="w-full border-t border-slate-800 pt-6 flex flex-col items-center gap-4 text-center">
              <p className="text-sm sm:text-base text-slate-200">
                Agora comparamos <strong>3</strong> e <strong>2</strong>. Como <strong>3 &gt; 2</strong>, o que devemos fazer?
              </p>
              <button
                type="button"
                data-testid="tutorial-swap-2"
                onClick={handleSwapStep2}
                className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
              >
                ⇄ Trocar
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="w-full border-t border-slate-800 pt-6 flex flex-col items-center gap-4 text-center">
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 max-w-md">
                Observe: o número <strong>3</strong> já é o maior elemento e chegou ao final da esteira.
              </div>
              <p className="text-sm sm:text-base text-slate-200">
                Agora compare os vizinhos <strong>1</strong> e <strong>2</strong>. Eles já estão na ordem certa?
              </p>
              <button
                type="button"
                data-testid="tutorial-keep-3"
                onClick={handleKeepStep3}
                className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
              >
                = Manter Posição
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="w-full border-t border-slate-800 pt-6 flex flex-col items-center gap-5 text-center">
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-sm text-emerald-200 max-w-md flex flex-col gap-2">
                <span className="font-bold text-base">Invariante Compreendido!</span>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  A cada passada pelo vetor, o maior elemento não ordenado avança até o seu lugar definitivo.
                </p>
              </div>

              <button
                type="button"
                data-testid="tutorial-finish-btn"
                onClick={onComplete}
                className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
              >
                Começar a Prática Básica ▶
              </button>
            </div>
          )}

          {actionFeedback && (
            <p className="text-xs text-slate-300 font-mono italic animate-fade-in">
              {actionFeedback}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
