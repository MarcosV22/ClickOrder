import React from "react";
import type { GameSaveSchema } from "../game/persistence/types";
import {
  PROTOCOL_CATALOG,
  ACTIVE_LAUNCHER_MODULES,
  getProtocolProgressSummary,
  getStationOverallProgress,
  type ProtocolId,
} from "./protocolCatalog";
import HomeHeader from "./home/HomeHeader";
import HomeProcessStrip from "./home/HomeProcessStrip";
import LearningModuleCard from "./home/LearningModuleCard";

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
      style={{ top: `${y}%`, opacity: 0.06 }}
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

  const activeProtocols = PROTOCOL_CATALOG.filter((p) =>
    ACTIVE_LAUNCHER_MODULES.includes(p.id)
  );

  return (
    <div className="relative w-full h-full min-h-screen overflow-y-auto overflow-x-hidden bg-[#060b1a] bg-grid scanlines flex flex-col items-center justify-start pt-8 sm:pt-12 pb-16 sm:pb-20 px-4 select-none">
      {/* Animated belt CSS */}
      <style>{`
        @keyframes scroll-belt {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>

      {/* Background conveyor belts with subtle ambient opacity (0.06) */}
      <ConveyorBelt y={8} speed={20} />
      <ConveyorBelt y={50} speed={26} />
      <ConveyorBelt y={88} speed={18} />

      {/* Subtle vignette overlay */}
      <div className="absolute inset-0 bg-radial-[ellipse_at_center] from-transparent via-[#060b1a]/60 to-[#060b1a]/95 pointer-events-none" />

      {/* Soft ambient glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Hub Container */}
      <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8 max-w-5xl w-full px-2 sm:px-4">
        {/* 1. Header Compacto (Logo reduzido + 1 linha de subtítulo) */}
        <HomeHeader />

        {/* 2. Faixa Compacta: Como Funciona (3 Passos) */}
        <HomeProcessStrip />

        {/* 3. Retomada Rápida e Sutil de Progresso (apenas se houver progresso) */}
        {overallProgress.hasAnyProgress && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/70 border border-slate-700/60 text-xs text-slate-300 shadow-sm animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" aria-hidden="true" />
            <span className="truncate">
              Continue de onde parou:{" "}
              <strong className="text-white font-medium">
                {overallProgress.recommendedResumeName}
              </strong>{" "}
              • {overallProgress.recommendedResumePractice}
            </span>
            <button
              type="button"
              onClick={() => handleStartTraining(overallProgress.recommendedResumeId)}
              aria-label={`Continuar ${overallProgress.recommendedResumeName}`}
              className="text-cyan-400 hover:text-cyan-300 font-semibold underline decoration-cyan-400/40 text-xs ml-1 shrink-0 cursor-pointer"
            >
              Continuar →
            </button>
          </div>
        )}

        {/* 4. Grade de Módulos (Exatamente 3 Escolhas Claras) */}
        <main className="w-full">
          <h2 className="sr-only">Algoritmos de Ordenação Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 w-full">
            {activeProtocols.map((metadata) => {
              const summary = getProtocolProgressSummary(metadata.id, saveData);
              return (
                <LearningModuleCard
                  key={metadata.id}
                  metadata={metadata}
                  completedPractices={summary.completedPractices}
                  onStart={handleStartTraining}
                />
              );
            })}
          </div>
        </main>

        {/* 5. Rodapé Minimalista */}
        <footer className="mt-6 pt-4 border-t border-white/5 w-full flex flex-col items-center gap-1 text-center text-xs text-slate-400">
          <p
            className="font-mono text-slate-300 font-medium tracking-wide"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Sorting Station • Plataforma Educacional de Algoritmos
          </p>
          <p
            className="text-[11px] text-slate-400"
            style={{ fontFamily: "'Exo 2', sans-serif" }}
          >
            Aprenda ciência da computação de forma visual e interativa.
          </p>
        </footer>
      </div>
    </div>
  );
}
