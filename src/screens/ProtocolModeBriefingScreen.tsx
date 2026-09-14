import GameButton from "../components/GameButton";
import type { ProtocolModeBriefing, BriefingBadgeVariant } from "../game/briefing";

interface ProtocolModeBriefingScreenProps {
  briefing: ProtocolModeBriefing;
  onStart: () => void;
  onBack: () => void;
}

export default function ProtocolModeBriefingScreen({
  briefing,
  onStart,
  onBack,
}: ProtocolModeBriefingScreenProps) {
  const isAmber = briefing.badgeVariant === "amber";

  const badgeColorClasses: Record<BriefingBadgeVariant, { dot: string; border: string; text: string }> = {
    cyan: {
      dot: "bg-cyan-400",
      border: "border-cyan-500/30 bg-cyan-950/40",
      text: "text-cyan-400",
    },
    amber: {
      dot: "bg-amber-400",
      border: "border-amber-500/30 bg-amber-950/40",
      text: "text-amber-400",
    },
    emerald: {
      dot: "bg-emerald-400",
      border: "border-emerald-500/30 bg-emerald-950/40",
      text: "text-emerald-400",
    },
    purple: {
      dot: "bg-purple-400",
      border: "border-purple-500/30 bg-purple-950/40",
      text: "text-purple-400",
    },
  };

  const currentBadgeStyle =
    badgeColorClasses[briefing.badgeVariant ?? "cyan"] ?? badgeColorClasses.cyan;

  const highlightColorClasses: Record<BriefingBadgeVariant, string> = {
    cyan: "text-cyan-300",
    amber: "text-amber-300",
    emerald: "text-emerald-400",
    purple: "text-purple-300",
  };

  return (
    <main
      className="relative w-full h-full min-h-full overflow-y-auto bg-[#060b1a] bg-grid scanlines flex flex-col items-center justify-start pt-6 sm:pt-8 pb-16 sm:pb-24 px-4 sm:px-6"
      aria-label={`Briefing do Modo: ${briefing.modeName}`}
    >
      {/* Background ambient glows */}
      {isAmber ? (
        <>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[280px] bg-amber-500/10 rounded-full blur-[110px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-[90px] pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[280px] bg-cyan-500/10 rounded-full blur-[110px] pointer-events-none" />
          <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-[90px] pointer-events-none" />
        </>
      )}

      <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-5 max-w-3xl w-full my-0">
        {/* Top Status Capsule */}
        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border ${currentBadgeStyle.border}`}
        >
          <div className={`w-2 h-2 rounded-full ${currentBadgeStyle.dot} animate-pulse`} />
          <span
            className={`text-[11px] ${currentBadgeStyle.text} tracking-[0.25em] uppercase font-bold`}
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            {briefing.badgeText}
          </span>
        </div>

        {/* Header Titles */}
        <header className="text-center flex flex-col items-center gap-1.5">
          <span
            className="text-xs sm:text-sm font-mono tracking-[0.25em] text-white/50 uppercase"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            {briefing.protocolName}
          </span>
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              textShadow: isAmber
                ? "0 0 35px rgba(245,158,11,0.3)"
                : "0 0 35px rgba(0,245,255,0.3)",
            }}
          >
            <span
              className={
                isAmber
                  ? "text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-purple-400"
                  : "text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400"
              }
            >
              {briefing.modeName}
            </span>
          </h1>
          <p
            className="text-xs sm:text-sm text-white/70 max-w-xl text-center leading-relaxed"
            style={{ fontFamily: "'Exo 2', sans-serif" }}
          >
            {briefing.subtitle}
          </p>
        </header>

        {/* Main Content Cards Container */}
        <div className="w-full flex flex-col gap-3 sm:gap-3.5">
          {/* Card 1: Objetivo */}
          <section
            className="bg-[#0d1635]/90 border border-[#2a4a9e]/60 rounded-xl p-3.5 sm:p-4 shadow-lg"
            aria-labelledby="briefing-objective-title"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className={isAmber ? "text-amber-400" : "text-cyan-400"}>◈</span>
              <h2
                id="briefing-objective-title"
                className="text-xs font-mono font-bold tracking-widest text-white/80 uppercase"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                Objetivo Operacional
              </h2>
            </div>
            <p
              className="text-xs sm:text-sm text-white/90 leading-relaxed"
              style={{ fontFamily: "'Exo 2', sans-serif" }}
            >
              {briefing.objective}
            </p>
          </section>

          {/* Card 2: Instruções / Como Operar (Grid 2x2) */}
          <section aria-labelledby="briefing-instructions-title">
            <div className="flex items-center gap-2 mb-1.5 px-1">
              <span className={isAmber ? "text-amber-400" : "text-cyan-400"}>◈</span>
              <h2
                id="briefing-instructions-title"
                className="text-xs font-mono font-bold tracking-widest text-white/80 uppercase"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                Procedimento na Esteira
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {briefing.instructions.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#0d1635]/70 border border-[#1e3570]/60 rounded-lg p-3 sm:p-3.5 flex items-start gap-3 hover:border-cyan-500/40 transition-colors"
                >
                  {item.icon && (
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center font-bold text-xs sm:text-sm bg-[#111e47] border ${
                        isAmber
                          ? "border-amber-500/30 text-amber-300"
                          : "border-cyan-500/30 text-cyan-300"
                      } flex-shrink-0`}
                      style={{ fontFamily: "'Space Mono', monospace" }}
                      aria-hidden="true"
                    >
                      {item.icon}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <h3
                      className="text-xs sm:text-sm font-bold text-white font-mono tracking-wide"
                      style={{ fontFamily: "'Space Mono', monospace" }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="text-[11px] sm:text-xs text-white/70 leading-relaxed mt-0.5"
                      style={{ fontFamily: "'Exo 2', sans-serif" }}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Card 3: Particularidades do Modo (se houver) */}
          {briefing.particularities && briefing.particularities.length > 0 && (
            <section
              className={`rounded-xl p-3 sm:p-3.5 border ${
                isAmber
                  ? "bg-amber-950/20 border-amber-500/30 text-amber-200/90"
                  : "bg-cyan-950/20 border-cyan-500/30 text-cyan-200/90"
              }`}
              aria-labelledby="briefing-particularities-title"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className={isAmber ? "text-amber-400 font-bold" : "text-cyan-400 font-bold"}>
                  {isAmber ? "⚡" : "ℹ"}
                </span>
                <h2
                  id="briefing-particularities-title"
                  className="text-xs font-mono font-bold tracking-widest uppercase text-white/80"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  Particularidades Deste Modo
                </h2>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] sm:text-xs leading-relaxed opacity-90 pl-1">
                {briefing.particularities.map((rule, idx) => (
                  <li key={idx} style={{ fontFamily: "'Exo 2', sans-serif" }}>
                    {rule}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Highlights Strip */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5 w-full">
            {briefing.highlights.map((item, idx) => {
              const valColor =
                highlightColorClasses[item.variant ?? "cyan"] ?? "text-white";
              return (
                <div
                  key={idx}
                  className="bg-[#0d1635]/80 border border-[#1e3570]/60 rounded-lg p-2 sm:p-2.5 text-center flex flex-col justify-center"
                >
                  <span
                    className="text-[9px] sm:text-[10px] font-mono tracking-widest text-white/50 uppercase"
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`text-xs sm:text-sm font-bold font-mono mt-0.5 ${valColor}`}
                    style={{ fontFamily: "'Orbitron', sans-serif" }}
                  >
                    {item.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <footer className="flex flex-col-reverse sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-md pt-2 pb-2">
          <GameButton
            onClick={onBack}
            variant="secondary"
            size="lg"
            className="w-full sm:w-1/2"
            aria-label="Voltar para a tela anterior"
          >
            ← &nbsp; VOLTAR
          </GameButton>

          <GameButton
            onClick={onStart}
            variant={briefing.startVariant ?? "primary"}
            size="lg"
            className={`w-full sm:w-1/2 ${
              isAmber
                ? "border-amber-500/50 text-amber-300 hover:border-amber-400 shadow-lg shadow-amber-950/30"
                : ""
            }`}
            aria-label={briefing.startLabel}
          >
            ▶ &nbsp; {briefing.startLabel}
          </GameButton>
        </footer>
      </div>
    </main>
  );
}
