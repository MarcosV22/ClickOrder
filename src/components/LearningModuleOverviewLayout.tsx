import React from "react";

export interface LearningModuleOverviewLayoutProps {
  moduleNumber: number;
  moduleCategory: string;
  title: string;
  subtitle: string;
  accentColor: "blue" | "purple" | "amber";
  onBack: () => void;
  heroVisual: React.ReactNode;
  steps: React.ReactNode;
  ctaText?: string;
  ctaMicrocopy: string;
  onStartTutorial: () => void;
  onStartPractice?: () => void;
  practiceLinkText?: string;
  details: React.ReactNode;
}

const ACCENT_STYLES = {
  blue: {
    badge: "text-blue-400 bg-blue-950/60 border border-blue-500/30",
    subtitle: "text-blue-200/90",
    backFocus: "focus-visible:ring-blue-400",
    cta: "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-blue-600/25 focus-visible:ring-blue-300",
  },
  purple: {
    badge: "text-purple-400 bg-purple-950/60 border border-purple-500/30",
    subtitle: "text-purple-200/90",
    backFocus: "focus-visible:ring-purple-400",
    cta: "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/25 focus-visible:ring-purple-300",
  },
  amber: {
    badge: "text-amber-400 bg-amber-950/60 border border-amber-500/30",
    subtitle: "text-amber-200/90",
    backFocus: "focus-visible:ring-amber-400",
    cta: "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20 focus-visible:ring-amber-300",
  },
} as const;

export default function LearningModuleOverviewLayout({
  moduleNumber,
  moduleCategory,
  title,
  subtitle,
  accentColor,
  onBack,
  heroVisual,
  steps,
  ctaText = "COMEÇAR TUTORIAL ▶",
  ctaMicrocopy,
  onStartTutorial,
  onStartPractice,
  practiceLinkText = "Ir para práticas ›",
  details,
}: LearningModuleOverviewLayoutProps) {
  const styles = ACCENT_STYLES[accentColor];

  return (
    <div className="w-full h-full min-h-screen overflow-y-auto overflow-x-hidden bg-[#060b1a] text-slate-100 flex flex-col items-center justify-start py-6 px-4 sm:px-6">
      <div className="w-full max-w-2xl flex flex-col items-center gap-6 my-auto">
        {/* Barra superior de navegação */}
        <div className="w-full flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className={`flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer px-2 py-1 rounded focus:outline-none focus-visible:ring-2 ${styles.backFocus}`}
            aria-label="Voltar para a tela inicial"
          >
            <span aria-hidden="true">‹</span>
            <span>Voltar ao Início</span>
          </button>
          <span className={`text-xs font-mono font-medium ${styles.badge} px-3 py-1 rounded-full`}>
            Módulo {moduleNumber} • {moduleCategory}
          </span>
        </div>

        {/* Título Principal & Frase Central Intuitiva */}
        <div className="text-center flex flex-col items-center gap-2">
          <h1
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            {title}
          </h1>
          <p className={`text-lg sm:text-xl ${styles.subtitle} font-medium max-w-lg leading-relaxed text-center`}>
            {subtitle}
          </p>
        </div>

        {/* Exemplo Visual Hero Específico do Algoritmo */}
        {heroVisual}

        {/* Os 3 Passos Essenciais */}
        {steps}

        {/* Botoeira de Ação / CTA Principal e Rota Secundária */}
        <div className="w-full flex flex-col items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onStartTutorial}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl ${styles.cta} font-bold text-base shadow-lg transition-all cursor-pointer text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060b1a]`}
          >
            {ctaText}
          </button>
          <span className="text-xs text-slate-400">
            {ctaMicrocopy}
          </span>

          {onStartPractice && (
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
              <span>Já conhece o algoritmo?</span>
              <button
                type="button"
                onClick={onStartPractice}
                className="text-slate-300 hover:text-white underline underline-offset-4 transition-colors cursor-pointer font-medium"
              >
                {practiceLinkText}
              </button>
            </div>
          )}
        </div>

        {/* Detalhes Técnicos Sob Demanda (Fechado por Padrão) */}
        <div className="w-full pt-2 pb-4">
          {details}
        </div>
      </div>
    </div>
  );
}
