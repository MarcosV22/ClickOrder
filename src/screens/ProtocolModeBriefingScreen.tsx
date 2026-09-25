import GameButton from "../components/GameButton";
import type { ProtocolModeBriefing, BriefingBadgeVariant } from "../game/briefing";

interface ProtocolModeBriefingScreenProps {
  briefing: ProtocolModeBriefing;
  onStart: () => void;
  onBack: () => void;
  onOpenDemonstration?: () => void;
}

export default function ProtocolModeBriefingScreen({
  briefing,
  onStart,
  onBack,
  onOpenDemonstration,
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
      className="relative w-full h-full min-h-screen overflow-y-auto overflow-x-hidden bg-[#060b1a] bg-grid scanlines flex flex-col items-center justify-start pt-6 sm:pt-8 pb-16 sm:pb-24 px-4 sm:px-6 select-none"
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
        <div className="w-full flex flex-col gap-3 sm:gap-4">
          {/* Card 1: Objetivo */}
          <section
            className="bg-[#0d1635]/90 border border-[#2a4a9e]/60 rounded-xl p-4 sm:p-5 shadow-lg"
            aria-labelledby="briefing-objective-title"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={isAmber ? "text-amber-400" : "text-cyan-400"}>◈</span>
              <h2
                id="briefing-objective-title"
                className="text-xs sm:text-sm font-mono font-bold tracking-wider text-slate-200 uppercase"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                Objetivo do Módulo
              </h2>
            </div>
            <p
              className="text-sm sm:text-base text-slate-100 leading-relaxed font-normal"
              style={{ fontFamily: "'Exo 2', sans-serif" }}
            >
              {briefing.objective}
            </p>
          </section>

          {/* Card 2: Instruções / Como Operar (Grid 2x2) */}
          <section aria-labelledby="briefing-instructions-title">
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className={isAmber ? "text-amber-400" : "text-cyan-400"}>◈</span>
              <h2
                id="briefing-instructions-title"
                className="text-xs sm:text-sm font-mono font-bold tracking-wider text-slate-200 uppercase"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                Como Funciona o Algoritmo
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
              {briefing.instructions.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#0d1635]/80 border border-[#1e3570]/80 rounded-xl p-3.5 sm:p-4 flex items-start gap-3.5 hover:border-cyan-500/50 transition-colors shadow-sm"
                >
                  {item.icon && (
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-bold text-sm sm:text-base bg-[#111e47] border ${
                        isAmber
                          ? "border-amber-500/40 text-amber-300"
                          : "border-cyan-500/40 text-cyan-300"
                      } flex-shrink-0 mt-0.5`}
                      style={{ fontFamily: "'Space Mono', monospace" }}
                      aria-hidden="true"
                    >
                      {item.icon}
                    </div>
                  )}
                  <div className="flex flex-col flex-1 min-w-0">
                    <h3
                      className="text-sm sm:text-[15px] font-bold text-white font-mono tracking-wide"
                      style={{ fontFamily: "'Space Mono', monospace" }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="text-xs sm:text-[14px] text-slate-200 leading-relaxed mt-1"
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
              className={`rounded-xl p-3.5 sm:p-4 border ${
                isAmber
                  ? "bg-amber-950/30 border-amber-500/40 text-amber-100"
                  : "bg-cyan-950/30 border-cyan-500/40 text-cyan-100"
              }`}
              aria-labelledby="briefing-particularities-title"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={isAmber ? "text-amber-400 font-bold" : "text-cyan-400 font-bold"}>
                  {isAmber ? "⚡" : "ℹ"}
                </span>
                <h2
                  id="briefing-particularities-title"
                  className="text-xs sm:text-sm font-mono font-bold tracking-wider uppercase text-slate-200"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  Particularidades Deste Modo
                </h2>
              </div>
              <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-[14px] leading-relaxed pl-1 font-medium text-slate-200">
                {briefing.particularities.map((rule, idx) => (
                  <li key={idx} style={{ fontFamily: "'Exo 2', sans-serif" }}>
                    {rule}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Highlights Strip */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full">
            {briefing.highlights.map((item, idx) => {
              const valColor =
                highlightColorClasses[item.variant ?? "cyan"] ?? "text-white";
              return (
                <div
                  key={idx}
                  className="bg-[#0d1635]/90 border border-[#1e3570]/80 rounded-xl p-2.5 sm:p-3 text-center flex flex-col justify-center"
                >
                  <span
                    className="text-[10px] sm:text-[11px] font-mono tracking-wider text-slate-300 uppercase font-semibold"
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
        <footer className="flex flex-col-reverse sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-xl pt-2 pb-2">
          <GameButton
            onClick={onBack}
            variant="secondary"
            size="md"
            className="w-full sm:w-auto px-5"
            aria-label="Voltar para a tela anterior"
            icon="←"
          >
            VOLTAR
          </GameButton>

          {onOpenDemonstration && (
            <GameButton
              onClick={onOpenDemonstration}
              variant="ghost"
              size="md"
              className="w-full sm:w-auto px-5 border-cyan-500/40 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-950/30"
              aria-label="Ver demonstração do algoritmo"
              icon="👁"
            >
              VER DEMONSTRAÇÃO
            </GameButton>
          )}

          <GameButton
            onClick={onStart}
            variant={briefing.startVariant ?? "primary"}
            size="md"
            className={`w-full sm:flex-1 ${
              isAmber
                ? "border-amber-500/60 bg-amber-950/40 text-amber-300 hover:border-amber-400 hover:bg-amber-900/50 shadow-lg shadow-amber-950/30"
                : ""
            }`}
            aria-label={briefing.startLabel}
            icon="▶"
          >
            {briefing.startLabel}
          </GameButton>
        </footer>
      </div>
    </main>
  );
}
