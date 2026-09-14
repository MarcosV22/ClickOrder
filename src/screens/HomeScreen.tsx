import GameButton from "../components/GameButton";

interface HomeScreenProps {
  onStart: () => void;
  onHowToPlay: () => void;
  isChallengeUnlocked?: boolean;
  onStartChallenge?: () => void;
  onStartSelection?: () => void;
}

function ConveyorBelt({ y, speed }: { y: number; speed: number }) {
  const boxes = [2, 7, 1, 9, 4, 6, 3, 8, 5];
  return (
    <div
      className="absolute w-full overflow-hidden"
      style={{ top: `${y}%`, opacity: 0.35 }}
    >
      {/* Track */}
      <div className="conveyor-track h-14 flex items-center">
        <div
          className="flex gap-3 items-center"
          style={{
            animation: `scroll-belt ${speed}s linear infinite`,
          }}
        >
          {[...boxes, ...boxes, ...boxes].map((n, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-11 h-10 rounded flex items-center justify-center bg-[#0f1e4a] border border-[#2a4a9e]/60"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              <span className="text-sm font-bold text-cyan-300/80">{n}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomeScreen({
  onStart,
  onHowToPlay,
  isChallengeUnlocked = false,
  onStartChallenge,
  onStartSelection,
}: HomeScreenProps) {
  return (
    <div className="relative w-full h-full min-h-full overflow-y-auto bg-[#060b1a] bg-grid scanlines flex flex-col items-center justify-start pt-8 sm:pt-12 pb-16 sm:pb-20 px-4">
      {/* Animated belt CSS */}
      <style>{`
        @keyframes scroll-belt {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>

      {/* Background conveyor belts */}
      <ConveyorBelt y={18} speed={14} />
      <ConveyorBelt y={60} speed={20} />
      <ConveyorBelt y={82} speed={11} />

      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-radial-[ellipse_at_center] from-transparent via-transparent to-[#060b1a]/90 pointer-events-none" />

      {/* Ambient glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Center card */}
      <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8 max-w-xl w-full px-4 sm:px-8">

        {/* Top badge */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/30">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span
            className="text-xs text-cyan-400/80 tracking-[0.3em] uppercase"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Central Logística v2.0
          </span>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1
            className="text-5xl sm:text-6xl font-black tracking-tighter text-white leading-none mb-2"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400"
              style={{ filter: "drop-shadow(0 0 20px rgba(0,245,255,0.3))" }}>
              SORTING
            </span>
            <br />
            <span className="text-white" style={{ textShadow: "0 0 40px rgba(139,92,246,0.4)" }}>
              STATION
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p
          className="text-center text-white/50 text-base tracking-wide"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          "Alguma coisa está fora de ordem..."
        </p>

        {/* Decorative divider */}
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-cyan-500/30" />
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-cyan-500/40" />
            ))}
          </div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-cyan-500/30" />
        </div>

        {/* Buttons */}
        <div className="flex flex-col items-center gap-3 w-full max-w-xs">
          <GameButton onClick={onStart} variant="primary" size="lg" className="w-full">
            ▶ &nbsp; INICIAR TURNO
          </GameButton>

          {isChallengeUnlocked && onStartChallenge && (
            <GameButton
              onClick={onStartChallenge}
              variant="primary"
              size="md"
              className="w-full border-amber-500/50 text-amber-300 hover:border-amber-400 shadow-lg shadow-amber-950/30"
            >
              ⚡ &nbsp; MODO DESAFIO (EARLY EXIT)
            </GameButton>
          )}

          {onStartSelection && (
            <GameButton
              onClick={onStartSelection}
              variant="secondary"
              size="md"
              className="w-full border-purple-500/50 text-purple-300 hover:border-purple-400 shadow-lg shadow-purple-950/30"
            >
              ◈ &nbsp; SELECTION SORT
            </GameButton>
          )}

          <GameButton onClick={onHowToPlay} variant="secondary" size="md" className="w-full">
            ? &nbsp; COMO JOGAR
          </GameButton>

          {!isChallengeUnlocked && (
            <div className="text-[10px] text-white/30 tracking-widest font-mono text-center mt-1">
              🔒 DESAFIO: COMPLETE O PROTOCOLO BUBBLE
            </div>
          )}
        </div>

        {/* Bottom status strip */}
        <div className="flex items-center justify-center gap-6 mt-2">
          {["BUBBLE SORT", "INSERTION SORT", "SELECTION SORT"].map((algo, i) => (
            <span
              key={algo}
              className={`text-[10px] tracking-widest ${
                i === 0
                  ? "text-cyan-400"
                  : i === 2
                    ? "text-purple-400"
                    : "text-white/20"
              }`}
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {i === 0 ? "◉" : i === 2 ? "◈" : "○"} {algo}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
