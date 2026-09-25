import type { ProtocolMetadata, ProtocolProgressSummary } from "./protocolCatalog";
import GameButton from "../components/GameButton";

export interface ProtocolCardProps {
  readonly metadata: ProtocolMetadata;
  readonly summary: ProtocolProgressSummary;
  readonly onStartTraining: (id: ProtocolMetadata["id"]) => void;
  readonly onOpenTutorial: (id: ProtocolMetadata["id"]) => void;
  readonly onOpenDemonstration?: (id: ProtocolMetadata["id"]) => void;
  readonly onStartChallenge?: () => void;
}

export default function ProtocolCard({
  metadata,
  summary,
  onStartTraining,
  onOpenTutorial,
  onOpenDemonstration,
  onStartChallenge,
}: ProtocolCardProps) {
  const isAvailable = metadata.status === "available";

  return (
    <div
      className={`relative flex flex-col justify-between h-full rounded-2xl p-6 sm:p-7 backdrop-blur-md transition-all duration-300 border ${
        isAvailable
          ? `${metadata.theme.borderClass} ${metadata.theme.borderHoverClass} bg-[#0c1533]/80 hover:shadow-2xl`
          : "border-white/10 bg-[#080d20]/50 opacity-70"
      }`}
      style={{
        boxShadow: isAvailable ? `0 0 35px ${metadata.theme.accentGlow}` : "none",
      }}
    >
      {/* Ambient background glow inside card */}
      {isAvailable && (
        <div
          className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{
            backgroundColor:
              metadata.theme.primaryColor === "cyan"
                ? "#00f5ff"
                : metadata.theme.primaryColor === "amber"
                  ? "#f59e0b"
                  : metadata.theme.primaryColor === "blue"
                    ? "#3b82f6"
                    : "#8b5cf6",
          }}
        />
      )}

      {/* Top section: Badges & Headings */}
      <div className="flex flex-col gap-4 relative z-10 flex-1">
        {/* Status bar */}
        <div className="flex items-center justify-between gap-2">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-mono tracking-wider uppercase font-bold ${metadata.theme.badgeBgClass} ${metadata.theme.badgeTextClass}`}
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            {isAvailable ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                <span>{metadata.statusLabel}</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
                <span>{metadata.statusLabel}</span>
              </>
            )}
          </div>

          <span
            className="text-[11px] font-mono tracking-wider text-slate-300 font-semibold uppercase"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            {isAvailable ? `${metadata.totalPhases} PRÁTICAS` : "CURRICULAR"}
          </span>
        </div>

        {/* Title and Metaphor */}
        <div>
          <h2
            className={`text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${metadata.theme.titleGradientClass}`}
            style={{
              fontFamily: "'Orbitron', sans-serif",
              filter: isAvailable ? `drop-shadow(0 0 12px ${metadata.theme.accentGlow})` : "none",
            }}
          >
            {metadata.name}
          </h2>
          <p
            className="text-xs font-mono uppercase tracking-wider text-slate-300 mt-1 font-semibold"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            {metadata.metaphor}
          </p>
        </div>

        {/* Short pedagogical description */}
        <p
          className="text-sm sm:text-[15px] text-slate-200 leading-relaxed font-sans"
          style={{ fontFamily: "'Exo 2', sans-serif" }}
        >
          {metadata.shortDescription}
        </p>

        {/* Practice items */}
        <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
          <span
            className="text-[10px] uppercase font-mono tracking-widest text-slate-300 font-semibold"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            O QUE VOCÊ VAI PRATICAR
          </span>
          <div className="flex flex-wrap gap-1.5">
            {metadata.practiceItems.map((item) => (
              <span
                key={item}
                className={`px-2 py-0.5 rounded text-[11px] font-mono border font-medium ${metadata.theme.practiceBadgeClass}`}
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Training status / Telemetry */}
        <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
          <span
            className="text-[10px] uppercase font-mono tracking-widest text-slate-300 font-semibold"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            STATUS DE TREINAMENTO
          </span>

          {isAvailable ? (
            <div className="grid grid-cols-3 gap-2 bg-[#060b1a]/70 border border-white/10 rounded-lg p-2.5">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-slate-300 uppercase font-semibold">Práticas</span>
                <span
                  className="text-xs font-bold text-white font-mono mt-0.5"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  {summary.completedPhases} / {summary.totalPhases}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-slate-300 uppercase font-semibold">Tutorial</span>
                <span
                  className={`text-xs font-bold font-mono mt-0.5 ${
                    summary.hasCompletedTutorial ? "text-emerald-400" : "text-amber-400"
                  }`}
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  {summary.hasCompletedTutorial ? "CONCLUÍDO" : "PENDENTE"}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-slate-300 uppercase font-semibold">Melhor Score</span>
                <span
                  className="text-xs font-bold text-cyan-300 font-mono mt-0.5"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  {summary.bestScore !== undefined ? `${summary.bestScore}/100` : "—"}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-lg border border-dashed border-white/10 bg-black/20 text-center">
              <span
                className="text-[11px] font-mono text-slate-300 italic"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                Protocolo Curricular em Preparação (Marco P2.2)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom section: Actions strictly aligned across all cards */}
      <div className="flex flex-col gap-2.5 pt-5 mt-auto border-t border-white/10 relative z-10">
        {/* Primary CTA */}
        {isAvailable ? (
          <GameButton
            onClick={() => onStartTraining(metadata.id)}
            variant="primary"
            size="md"
            icon="▶"
            className="w-full font-bold"
          >
            INICIAR TREINAMENTO
          </GameButton>
        ) : (
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="w-full min-h-[44px] py-2.5 px-4 rounded-lg font-mono text-xs uppercase tracking-wider bg-white/5 border border-white/10 text-slate-400 cursor-not-allowed select-none font-bold inline-flex items-center justify-center gap-2"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            <span aria-hidden="true">○</span>
            <span>PROTOCOLO EM BREVE</span>
          </button>
        )}

        {/* Secondary CTAs with flexible wrapping to avoid squeezed labels */}
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          {/* Tutorial button */}
          <div className="flex-1 min-w-0">
            {isAvailable ? (
              <GameButton
                onClick={() => onOpenTutorial(metadata.id)}
                variant="secondary"
                size="sm"
                icon="?"
                className="w-full text-center px-2 font-bold"
              >
                TUTORIAL
              </GameButton>
            ) : (
              <button
                type="button"
                disabled
                aria-disabled="true"
                className="w-full min-h-[36px] py-1.5 px-2 rounded-lg font-mono text-[11px] uppercase tracking-wider bg-white/5 border border-white/5 text-slate-500 cursor-not-allowed select-none inline-flex items-center justify-center gap-2"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                <span aria-hidden="true">?</span>
                <span>TUTORIAL</span>
              </button>
            )}
          </div>

          {/* Demonstration button */}
          <div className="flex-1 min-w-0">
            {metadata.demonstrationStatus === "available" ? (
              <GameButton
                onClick={() => onOpenDemonstration?.(metadata.id)}
                variant="ghost"
                size="sm"
                icon="👁"
                className="w-full text-center px-2 font-bold text-white/90 hover:text-white"
                aria-label={`Ver modo demonstração do protocolo ${metadata.name}`}
              >
                {metadata.demonstrationLabel}
              </GameButton>
            ) : (
              <button
                type="button"
                disabled
                aria-disabled="true"
                title="Modo Demonstração em preparação"
                className="w-full min-h-[36px] py-1.5 px-2 rounded-lg font-mono text-[11px] uppercase tracking-wider bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed select-none inline-flex items-center justify-center gap-2"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                <span>{metadata.demonstrationLabel}</span>
              </button>
            )}
          </div>
        </div>

        {/* Optional Bubble-specific early exit / challenge mode */}
        {metadata.id === "bubble" && (
          <div className="pt-1">
            {summary.isChallengeUnlocked && onStartChallenge ? (
              <GameButton
                onClick={onStartChallenge}
                variant="primary"
                size="sm"
                icon="⚡"
                className="w-full border-amber-500/50 text-amber-300 hover:border-amber-400 shadow-md shadow-amber-950/20"
              >
                MODO DESAFIO (EARLY EXIT)
              </GameButton>
            ) : (
              <div
                className="w-full text-[10px] text-white/35 font-mono text-center py-1.5 px-2 rounded bg-black/30 border border-white/5"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                🔒 DESAFIO: Conclua as 3 práticas do Bubble
              </div>
            )}
          </div>
        )}

        {/* Selection slot placeholder to maintain strict vertical symmetry */}
        {metadata.id === "selection" && (
          <div className="pt-1">
            <div
              className="w-full text-[10px] text-purple-400/50 font-mono text-center py-1.5 px-2 rounded bg-purple-950/20 border border-purple-500/10"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              ◈ SELECTION SORT: FSM BIMODAL
            </div>
          </div>
        )}

        {/* Insertion badge slot to maintain strict vertical symmetry */}
        {metadata.id === "insertion" && (
          <div className="pt-1">
            <div
              className="w-full text-[10px] text-amber-400/60 font-mono text-center py-1.5 px-2 rounded bg-amber-950/20 border border-amber-500/15"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              ◈ INSERTION SORT: TRILHO PROGRESSIVO
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
