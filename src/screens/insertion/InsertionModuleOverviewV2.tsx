import React from "react";
import InsertionConceptVisual from "./InsertionConceptVisual";
import InsertionConceptSteps from "./InsertionConceptSteps";
import InsertionDetails from "./InsertionDetails";

export interface InsertionModuleOverviewV2Props {
  onStartTutorial: () => void;
  onStartPractice?: () => void;
  onOpenDemonstration?: () => void;
  onBack: () => void;
}

export default function InsertionModuleOverviewV2({
  onStartTutorial,
  onStartPractice,
  onOpenDemonstration,
  onBack,
}: InsertionModuleOverviewV2Props) {
  return (
    <div className="w-full h-full min-h-screen overflow-y-auto overflow-x-hidden bg-[#060b1a] text-slate-100 flex flex-col items-center justify-start py-6 px-4 sm:px-6">
      <div className="w-full max-w-2xl flex flex-col items-center gap-6 my-auto">
        {/* Barra superior de navegação */}
        <div className="w-full flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer px-2 py-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            aria-label="Voltar para a tela inicial"
          >
            <span aria-hidden="true">‹</span>
            <span>Voltar ao Início</span>
          </button>
          <span className="text-xs font-mono font-medium text-amber-400 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-full">
            Módulo 3 • Ordenação por Inserção
          </span>
        </div>

        {/* Título Principal & Frase Central Intuitiva */}
        <div className="text-center flex flex-col items-center gap-2">
          <h1
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            INSERTION SORT
          </h1>
          <p className="text-lg sm:text-xl text-amber-200/90 font-medium max-w-lg leading-relaxed text-center">
            Pegue um número e encaixe no lugar certo.
          </p>
        </div>

        {/* Grande Exemplo Visual Hero */}
        <InsertionConceptVisual />

        {/* Os 3 Passos Essenciais */}
        <InsertionConceptSteps />

        {/* Botoeira de Ação / CTA Principal */}
        <div className="w-full flex flex-col items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onStartTutorial}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-base shadow-lg shadow-amber-500/20 transition-all cursor-pointer text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060b1a]"
          >
            COMEÇAR TUTORIAL ▶
          </button>
          <span className="text-xs text-slate-400">
            Você vai praticar isso passo a passo.
          </span>

          {onStartPractice && (
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
              <span>Já conhece o algoritmo?</span>
              <button
                type="button"
                onClick={onStartPractice}
                className="text-slate-300 hover:text-white underline underline-offset-4 transition-colors cursor-pointer font-medium"
              >
                Ir para práticas ›
              </button>
            </div>
          )}
        </div>

        {/* Detalhes Sob Demanda (Fechado por Padrão) */}
        <div className="w-full pt-2 pb-4">
          <InsertionDetails onOpenDemonstration={onOpenDemonstration} />
        </div>
      </div>
    </div>
  );
}
