import type { GameSaveSchema } from "../game/persistence/types";
import {
  PROTOCOL_CATALOG,
  getProtocolProgressSummary,
  getStationOverallProgress,
  type ProtocolId,
} from "./protocolCatalog";
import ProtocolCard from "./ProtocolCard";
import HomeHero from "./home/HomeHero";
import HomeHowItWorks from "./home/HomeHowItWorks";
import HomeContinueCard from "./home/HomeContinueCard";

export interface HomeScreenProps {
  saveData?: GameSaveSchema;
  onStartProtocol?: (id: ProtocolId) => void;
  onOpenTutorial?: (id: ProtocolId) => void;
  onOpenDemonstration?: (id: ProtocolId) => void;
  isChallengeUnlocked?: boolean;
  onStartChallenge?: () => void;
  // Props mantidas para retrocompatibilidade
  onStart?: () => void;
  onHowToPlay?: () => void;
  onStartSelection?: () => void;
}

function ConveyorBelt({ y, speed }: { y: number; speed: number }) {
  const boxes = [2, 7, 1, 9, 4, 6, 3, 8, 5];
  return (
    <div
      className="absolute w-full overflow-hidden pointer-events-none"
      style={{ top: `${y}%`, opacity: 0.08 }}
      aria-hidden="true"
    >
      <div className="conveyor-track h-12 flex items-center">
        <div
          className="flex gap-3 items-center"
          style={{
            animation: `scroll-belt ${speed}s linear infinite`,
          }}
        >
          {[...boxes, ...boxes, ...boxes].map((n, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-10 h-9 rounded flex items-center justify-center bg-[#0f1e4a]/60 border border-[#2a4a9e]/30"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              <span className="text-xs font-bold text-cyan-300/60">{n}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomeScreen({
  saveData,
  onStartProtocol,
  onOpenTutorial,
  onOpenDemonstration,
  isChallengeUnlocked,
  onStartChallenge,
  onStart,
  onHowToPlay,
  onStartSelection,
}: HomeScreenProps) {
  const overallProgress = getStationOverallProgress(saveData);

  const handleStartTraining = (id: ProtocolId) => {
    if (onStartProtocol) {
      onStartProtocol(id);
    } else if (id === "bubble" && onStart) {
      onStart();
    } else if (id === "selection" && onStartSelection) {
      onStartSelection();
    }
  };

  const handleOpenTutorial = (id: ProtocolId) => {
    if (onOpenTutorial) {
      onOpenTutorial(id);
    } else if (id === "bubble" && onHowToPlay) {
      onHowToPlay();
    }
  };

  const handleExploreHowItWorks = () => {
    const el = document.getElementById("como-funciona");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen overflow-y-auto overflow-x-hidden bg-[#060b1a] bg-grid scanlines flex flex-col items-center justify-start pt-6 sm:pt-10 pb-16 sm:pb-24 px-4 select-none">
      {/* Animated belt CSS */}
      <style>{`
        @keyframes scroll-belt {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>

      {/* Background conveyor belts with subtle ambient opacity */}
      <ConveyorBelt y={10} speed={18} />
      <ConveyorBelt y={48} speed={24} />
      <ConveyorBelt y={86} speed={15} />

      {/* Subtle vignette overlay */}
      <div className="absolute inset-0 bg-radial-[ellipse_at_center] from-transparent via-[#060b1a]/60 to-[#060b1a]/95 pointer-events-none" />

      {/* Soft ambient glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Hub Container */}
      <div className="relative z-10 flex flex-col items-center gap-8 sm:gap-12 max-w-6xl w-full px-2 sm:px-4">
        {/* Seção A: Hero & Apresentação Educacional */}
        <HomeHero
          onStartBubble={() => handleStartTraining("bubble")}
          onExploreHowItWorks={handleExploreHowItWorks}
        />

        {/* Seção B: Como Funciona o Sorting Station (3 Passos) */}
        <HomeHowItWorks />

        {/* Seção C: Retomada rápida de progresso (condicional) */}
        {overallProgress.hasAnyProgress && (
          <HomeContinueCard
            overallProgress={overallProgress}
            onResume={handleStartTraining}
          />
        )}

        {/* Seção D: Catálogo de Módulos / Escolha de Algoritmo */}
        <section
          className="flex flex-col items-center gap-5 w-full pt-2"
          aria-labelledby="modules-catalog-title"
        >
          {/* Section Heading */}
          <div className="text-center flex flex-col items-center gap-1.5">
            <span
              className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              MÓDULOS DISPONÍVEIS
            </span>
            <h2
              id="modules-catalog-title"
              className="text-2xl sm:text-3xl font-black text-white tracking-tight"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              Escolha um Algoritmo
            </h2>
            <p
              className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed"
              style={{ fontFamily: "'Exo 2', sans-serif" }}
            >
              Selecione um método para ver a demonstração, seguir o tutorial ou
              iniciar o treinamento interativo.
            </p>
          </div>

          {/* Protocols Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-x-6 gap-y-4 w-full mt-2">
            {PROTOCOL_CATALOG.map((metadata) => {
              const summary = getProtocolProgressSummary(metadata.id, saveData);
              return (
                <ProtocolCard
                  key={metadata.id}
                  metadata={metadata}
                  summary={{
                    ...summary,
                    isChallengeUnlocked:
                      metadata.id === "bubble"
                        ? (isChallengeUnlocked ?? summary.isChallengeUnlocked)
                        : undefined,
                  }}
                  onStartTraining={handleStartTraining}
                  onOpenTutorial={handleOpenTutorial}
                  onOpenDemonstration={onOpenDemonstration}
                  onStartChallenge={onStartChallenge}
                />
              );
            })}
          </div>
        </section>

        {/* Seção E: Rodapé Educacional & Telemetria Amigável */}
        <footer className="flex flex-col items-center gap-3 mt-6 pt-6 border-t border-white/10 w-full text-center">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-300">
            <span
              className="font-mono text-cyan-300 font-semibold tracking-wider"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              SORTING STATION
            </span>
            <span className="text-white/20 hidden sm:inline">•</span>
            <span className="font-sans text-slate-300">
              Plataforma Educacional Prática de Algoritmos de Ordenação
            </span>
            <span className="text-white/20 hidden sm:inline">•</span>
            <span
              className="font-mono text-emerald-400 font-semibold tracking-wider"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              100% LOCAL & INTERATIVO
            </span>
          </div>

          <p
            className="text-[11px] text-slate-400 max-w-xl leading-relaxed"
            style={{ fontFamily: "'Exo 2', sans-serif" }}
          >
            Projetado para ensino de Ciência da Computação com foco em
            compreensão de invariantes, raciocínio ativo e visualização sem
            fricção técnica.
          </p>
        </footer>
      </div>
    </div>
  );
}
