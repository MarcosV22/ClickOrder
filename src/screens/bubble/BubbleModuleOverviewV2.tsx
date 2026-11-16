import React from "react";
import NumberedBox from "../../components/NumberedBox";

export interface BubbleModuleOverviewV2Props {
  onStartTutorial: () => void;
  onStartPractice: () => void;
  onBack: () => void;
}

export default function BubbleModuleOverviewV2({
  onStartTutorial,
  onStartPractice,
  onBack,
}: BubbleModuleOverviewV2Props) {
  return (
    <div className="w-full h-full min-h-screen overflow-y-auto overflow-x-hidden bg-[#0a0e1a] text-slate-100 flex flex-col items-center justify-start py-8 px-4 sm:px-6">
      <div className="w-full max-w-2xl flex flex-col items-center gap-8 my-auto">
        {/* Top bar with back button */}
        <div className="w-full flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer px-2 py-1 rounded"
            aria-label="Voltar para a tela inicial"
          >
            <span>‹</span>
            <span>Voltar ao Início</span>
          </button>
          <span className="text-xs font-mono font-medium text-blue-400 bg-blue-950/60 border border-blue-500/30 px-3 py-1 rounded-full">
            Módulo 1 • Ordenação por Comparação
          </span>
        </div>

        {/* Hero Title & Intuition */}
        <div className="text-center flex flex-col items-center gap-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Bubble Sort
          </h1>
          <p className="text-lg sm:text-xl text-blue-200/90 font-medium max-w-lg leading-relaxed">
            Compare vizinhos e leve os maiores para o final.
          </p>
        </div>

        {/* Como Funciona Card */}
        <div className="w-full bg-[#111827]/80 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl">
          <h2 className="text-sm font-semibold tracking-wider text-slate-400 uppercase font-mono">
            Como funciona em 3 passos
          </h2>

          <div className="grid grid-cols-1 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-900/60 border border-blue-500/40 text-blue-300 flex items-center justify-center font-bold text-xs">
                1
              </span>
              <p className="text-slate-300 leading-relaxed">
                <strong className="text-white">Observe dois vizinhos:</strong> O algoritmo foca em apenas duas caixas lado a lado de cada vez.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-900/60 border border-blue-500/40 text-blue-300 flex items-center justify-center font-bold text-xs">
                2
              </span>
              <p className="text-slate-300 leading-relaxed">
                <strong className="text-white">Compare e decida:</strong> Se a caixa da esquerda for maior que a da direita, elas trocam de posição.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold text-xs">
                3
              </span>
              <p className="text-slate-300 leading-relaxed">
                <strong className="text-white">O maior avança:</strong> Ao final da esteira, o maior elemento estará garantido no seu lugar definitivo.
              </p>
            </div>
          </div>

          {/* Mini Visual Example */}
          <div className="mt-2 pt-6 border-t border-slate-800/80 flex flex-col items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">Exemplo de comparação de vizinhos:</span>
            <div className="flex items-center gap-3 sm:gap-6 py-2 px-4 rounded-xl bg-[#0b1120] border border-slate-800/80">
              {/* Pair before */}
              <div className="flex items-center gap-2">
                <NumberedBox value={30} index={0} variant="learning" size="sm" showIndex={false} />
                <NumberedBox value={12} index={1} variant="learning" size="sm" showIndex={false} />
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center text-xs text-blue-400 font-mono">
                <span>⇄</span>
                <span className="text-[10px] text-slate-400">30 &gt; 12</span>
              </div>

              {/* Pair after */}
              <div className="flex items-center gap-2">
                <NumberedBox value={12} index={0} variant="learning" size="sm" showIndex={false} />
                <NumberedBox value={30} index={1} variant="learning" size="sm" showIndex={false} role="sorted" />
              </div>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={onStartTutorial}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base shadow-lg shadow-blue-600/20 transition-all cursor-pointer text-center"
          >
            Aprender Bubble Sort (Tutorial) ▶
          </button>

          <button
            type="button"
            onClick={onStartPractice}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#1e293b] hover:bg-[#334155] text-slate-200 font-medium text-sm transition-all cursor-pointer text-center"
          >
            Já conhece? Ir para as práticas
          </button>
        </div>
      </div>
    </div>
  );
}
