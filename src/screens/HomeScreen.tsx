import type { GameSaveSchema } from "../game/persistence/types";
import {
  PROTOCOL_CATALOG,
  getProtocolProgressSummary,
  type ProtocolId,
} from "./protocolCatalog";
import ProtocolCard from "./ProtocolCard";

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
      style={{ top: `${y}%`, opacity: 0.22 }}
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
              className="flex-shrink-0 w-10 h-9 rounded flex items-center justify-center bg-[#0f1e4a] border border-[#2a4a9e]/50"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              <span className="text-xs font-bold text-cyan-300/70">{n}</span>
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

  return (
    <div className="relative w-full h-full min-h-screen overflow-y-auto overflow-x-hidden bg-[#060b1a] bg-grid scanlines flex flex-col items-center justify-start pt-6 sm:pt-10 pb-16 sm:pb-24 px-4 select-none">
      {/* Animated belt CSS */}
      <style>{`
        @keyframes scroll-belt {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>

      {/* Background conveyor belts */}
      <ConveyorBelt y={10} speed={16} />
      <ConveyorBelt y={45} speed={22} />
      <ConveyorBelt y={85} speed={13} />

      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-radial-[ellipse_at_center] from-transparent via-[#060b1a]/60 to-[#060b1a]/95 pointer-events-none" />

      {/* Ambient glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Main Hub Container */}
      <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8 max-w-6xl w-full px-2 sm:px-4">
        {/* Top badge */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/40">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span
            className="text-xs text-cyan-400/90 tracking-[0.25em] uppercase font-bold"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Central Logística v2.0
          </span>
        </div>

        {/* Title and Educational Subtitle */}
        <div className="text-center flex flex-col items-center">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-none mb-3"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            <span
              className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400"
              style={{ filter: "drop-shadow(0 0 25px rgba(0,245,255,0.35))" }}
            >
              SORTING
            </span>{" "}
            <span
              className="text-white"
              style={{ textShadow: "0 0 40px rgba(139,92,246,0.35)" }}
            >
              STATION
            </span>
          </h1>

          <p
            className="text-sm sm:text-base text-cyan-200/80 tracking-widest uppercase font-semibold text-center max-w-2xl"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Central de Treinamento de Algoritmos de Ordenação
          </p>

          {/* Directive / Instruction */}
          <div className="mt-4 flex items-center gap-3">
            <div className="w-8 sm:w-16 h-px bg-gradient-to-r from-transparent to-cyan-500/50" />
            <span
              className="text-xs sm:text-sm text-white/70 font-mono tracking-[0.2em] uppercase font-bold"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              ESCOLHA UM PROTOCOLO
            </span>
            <div className="w-8 sm:w-16 h-px bg-gradient-to-l from-transparent to-cyan-500/50" />
          </div>
        </div>

        {/* Protocols Grid (3 symmetric cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-2">
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

        {/* Platform footer telemetry */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-4 pt-6 border-t border-white/5 w-full text-center">
          <span
            className="text-[11px] font-mono text-white/40 tracking-wider uppercase"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            TERMINAL DE ENSINO INTERATIVO DE ALGORITMOS
          </span>
          <span className="text-white/20 hidden sm:inline">•</span>
          <span
            className="text-[11px] font-mono text-cyan-400/60 tracking-wider uppercase"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            METÁFORA FÍSICA CINÉTICA & SINCRONIZAÇÃO DE INVARIANTES
          </span>
        </div>
      </div>
    </div>
  );
}
