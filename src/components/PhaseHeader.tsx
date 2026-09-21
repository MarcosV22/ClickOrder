import GameButton from "./GameButton";

export interface PhaseHeaderProps {
  protocol?: string;
  moduleTitle?: string;
  practiceTitle?: string;
  practiceNumber?: number;
  totalPractices?: number;
  phase?: number;
  totalPhases?: number;
  onBackToSelector?: () => void;
}

export default function PhaseHeader({
  protocol,
  moduleTitle,
  practiceTitle,
  practiceNumber,
  totalPractices = 3,
  phase = 1,
  totalPhases = 3,
  onBackToSelector,
}: PhaseHeaderProps) {
  const currentStep = practiceNumber ?? phase;
  const totalSteps = totalPractices ?? totalPhases;
  const title = moduleTitle ?? protocol ?? "ORDENAÇÃO";

  return (
    <div className="flex items-center justify-between w-full px-4 sm:px-6 py-3 bg-[#080f28]/90 border-b border-cyan-500/10 select-none">
      {/* Left: module / protocol name */}
      <div className="flex items-center gap-2.5">
        <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f5ff]" />
        <span
          className="text-cyan-300 text-xs sm:text-sm font-bold tracking-widest uppercase"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          MÓDULO {title}
        </span>
      </div>

      {/* Center: practice indicator pills */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i + 1 < currentStep
                ? "w-5 sm:w-6 bg-cyan-400/60"
                : i + 1 === currentStep
                  ? "w-7 sm:w-8 bg-cyan-400 shadow-[0_0_6px_#00f5ff]"
                  : "w-5 sm:w-6 bg-white/10"
            }`}
          />
        ))}
        <span
          className="ml-2 text-[11px] sm:text-xs text-white/60 tracking-wider font-mono font-bold uppercase"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          {practiceTitle ?? `PRÁTICA ${currentStep}/${totalSteps}`}
        </span>
      </div>

      {/* Right: status and optional quick selector button */}
      <div className="flex items-center gap-3">
        {onBackToSelector && (
          <GameButton
            onClick={onBackToSelector}
            variant="ghost"
            size="sm"
            icon="☰"
            className="hidden sm:inline-flex text-[11px] text-white/60 hover:text-white"
          >
            SELETOR
          </GameButton>
        )}
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span
            className="text-[11px] text-emerald-400/80 tracking-widest hidden sm:inline"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            SISTEMA ATIVO
          </span>
        </div>
      </div>
    </div>
  );
}
