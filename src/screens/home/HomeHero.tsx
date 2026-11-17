import GameButton from "../../components/GameButton";

export interface HomeHeroProps {
  readonly onStartBubble: () => void;
  readonly onExploreHowItWorks?: () => void;
}

export default function HomeHero({
  onStartBubble,
  onExploreHowItWorks,
}: HomeHeroProps) {
  return (
    <header className="flex flex-col items-center text-center gap-5 sm:gap-6 max-w-3xl w-full pt-2">
      {/* Top educational badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 backdrop-blur-sm shadow-sm">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span
          className="text-[11px] sm:text-xs text-cyan-300 font-bold uppercase tracking-widest"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          Plataforma Educacional • Aprendizado Ativo
        </span>
      </div>

      {/* Main Title */}
      <div className="flex flex-col items-center">
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-none"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          <span
            className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400"
            style={{ filter: "drop-shadow(0 0 25px rgba(0,245,255,0.3))" }}
          >
            SORTING
          </span>{" "}
          <span
            className="text-white"
            style={{ textShadow: "0 0 35px rgba(129,140,248,0.3)" }}
          >
            STATION
          </span>
        </h1>

        <p
          className="text-base sm:text-lg md:text-xl text-slate-100 font-semibold text-center mt-3 max-w-2xl leading-snug"
          style={{ fontFamily: "'Exo 2', sans-serif" }}
        >
          Aprenda algoritmos de ordenação na prática, passo a passo.
        </p>
      </div>

      {/* Human, friendly value proposition */}
      <p
        className="text-xs sm:text-sm text-slate-300 text-center max-w-xl leading-relaxed"
        style={{ fontFamily: "'Exo 2', sans-serif" }}
      >
        Entenda como funcionam os algoritmos observando, comparando e organizando
        elementos em uma esteira interativa. Sem decorar código: aprenda a lógica
        visualmente com feedback a cada decisão.
      </p>

      {/* Guided recommendation callout */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#0c1635]/80 border border-cyan-500/30 text-xs text-cyan-200 shadow-md">
        <span className="text-cyan-400 text-sm sm:text-base flex-shrink-0" aria-hidden="true">
          💡
        </span>
        <span className="text-left sm:text-center leading-relaxed">
          Primeira vez aqui? Recomendamos começar pelo{" "}
          <strong className="text-white font-bold underline decoration-cyan-400/60 underline-offset-2">
            Bubble Sort
          </strong>{" "}
          com o tutorial interativo.
        </span>
      </div>

      {/* Hero CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto pt-1">
        <GameButton
          onClick={onStartBubble}
          variant="primary"
          size="lg"
          icon="▶"
          className="w-full sm:w-auto font-bold tracking-wide shadow-xl shadow-cyan-950/40 text-xs sm:text-sm px-6 py-3"
          aria-label="Começar pelo Bubble Sort"
        >
          COMEÇAR PELO BUBBLE SORT
        </GameButton>

        {onExploreHowItWorks && (
          <button
            type="button"
            onClick={onExploreHowItWorks}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-lg border border-slate-700/80 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-all text-xs font-mono font-bold tracking-wider inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            <span>COMO FUNCIONA</span>
            <span className="text-cyan-400 font-bold" aria-hidden="true">
              ↓
            </span>
          </button>
        )}
      </div>
    </header>
  );
}
