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
  const isBubble = metadata.id === "bubble";

  return (
    <div
      className={`relative grid grid-rows-subgrid row-span-4 rounded-2xl p-5 sm:p-6 backdrop-blur-md transition-all duration-300 border ${
        isAvailable
          ? `${metadata.theme.borderClass} ${metadata.theme.borderHoverClass} bg-[#0c1533]/85 hover:shadow-2xl`
          : "border-white/10 bg-[#080d20]/50 opacity-70"
      }`}
      style={{
        boxShadow: isAvailable ? `0 0 30px ${metadata.theme.accentGlow}` : "none",
        gridRow: "span 4",
        display: "grid",
        gridTemplateRows: "subgrid",
      }}
    >
      {/* Ambient background glow inside card */}
      {isAvailable && (
        <div
          className="absolute -top-10 -right-10 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-20"
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

      {/* Região 1: Conteúdo (Badges, Recomendação, Título, Metáfora e Chips de Prática) */}
      <div className="flex flex-col gap-2.5 relative z-10">
        {/* Status bar & Recommended badge */}
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-mono tracking-wider uppercase font-bold ${metadata.theme.badgeBgClass} ${metadata.theme.badgeTextClass}`}
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

            {isBubble && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                <span>★</span>
                <span>RECOMENDADO</span>
              </span>
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
          <h3
            className={`text-2xl sm:text-2xl md:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${metadata.theme.titleGradientClass}`}
            style={{
              fontFamily: "'Orbitron', sans-serif",
              filter: isAvailable ? `drop-shadow(0 0 10px ${metadata.theme.accentGlow})` : "none",
            }}
          >
            {metadata.name}
          </h3>
          <p
            className="text-[11px] font-mono uppercase tracking-wider text-slate-300 mt-0.5 font-semibold"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            {metadata.metaphor}
          </p>
        </div>

        {/* Short pedagogical description */}
        <p
          className="text-xs sm:text-[13px] text-slate-200 leading-relaxed font-sans"
          style={{ fontFamily: "'Exo 2', sans-serif" }}
        >
          {metadata.shortDescription}
        </p>

        {/* Practice items chips */}
        {metadata.practiceItems && metadata.practiceItems.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {metadata.practiceItems.map((item, idx) => (
              <span
                key={idx}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Região 2: Progresso (Metadados e Telemetria em formato compacto) */}
      <div className="flex flex-col gap-2 pt-3 border-t border-white/10 relative z-10">
        <span
          className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-semibold"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          STATUS DE APRENDIZADO
        </span>

        {isAvailable ? (
          <div className="flex flex-col gap-1.5 bg-[#060b1a]/80 border border-white/10 rounded-xl p-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-slate-400">Práticas:</span>
              <span
                className="font-bold text-white font-mono"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {summary.completedPhases} de {summary.totalPhases} concluídas
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-slate-400">Tutorial:</span>
              <span
                className={`font-bold font-mono ${
                  summary.hasCompletedTutorial ? "text-emerald-400" : "text-amber-300"
                }`}
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {summary.hasCompletedTutorial ? "CONCLUÍDO" : "PENDENTE"}
              </span>
            </div>

            {summary.bestScore !== undefined && (
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400">Melhor nota:</span>
                <span
                  className="font-bold text-cyan-300 font-mono"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  {summary.bestScore} / 100
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-2.5 rounded-xl border border-dashed border-white/10 bg-black/20 text-center">
            <span
              className="text-xs font-mono text-slate-400 italic"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Módulo curricular em preparação
            </span>
          </div>
        )}
      </div>

      {/* Região 3: Ações Comuns (Hierarquia Clara: Primário Largo + Secundários em Grid de 2 Colunas) */}
      <div className="flex flex-col gap-2 pt-3 border-t border-white/10 relative z-10">
        {/* Primary CTA */}
        {isAvailable ? (
          <GameButton
            onClick={() => onStartTraining(metadata.id)}
            variant="primary"
            size="md"
            icon="▶"
            className="w-full font-bold justify-center"
            aria-label={`Iniciar treinamento do protocolo ${metadata.name}`}
          >
            INICIAR TREINAMENTO
          </GameButton>
        ) : (
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="w-full min-h-[44px] py-2 px-3 rounded-lg font-mono text-xs uppercase tracking-wider bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed select-none font-bold inline-flex items-center justify-center gap-2"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            <span aria-hidden="true">○</span>
            <span>PROTOCOLO EM BREVE</span>
          </button>
        )}

        {/* Secondary CTAs em grid de 2 colunas para manter hierarquia limpa */}
        <div className="grid grid-cols-2 gap-2 w-full">
          {/* Tutorial button */}
          <div>
            {isAvailable ? (
              <GameButton
                onClick={() => onOpenTutorial(metadata.id)}
                variant="secondary"
                size="sm"
                icon="?"
                className="w-full text-center justify-center font-bold px-2"
                aria-label={`Abrir tutorial do protocolo ${metadata.name}`}
              >
                TUTORIAL
              </GameButton>
            ) : (
              <button
                type="button"
                disabled
                aria-disabled="true"
                className="w-full min-h-[36px] py-1 px-2 rounded-lg font-mono text-[11px] uppercase tracking-wider bg-white/5 border border-white/5 text-slate-600 cursor-not-allowed select-none inline-flex items-center justify-center gap-1"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                <span aria-hidden="true">?</span>
                <span>TUTORIAL</span>
              </button>
            )}
          </div>

          {/* Demonstration button */}
          <div>
            {metadata.demonstrationStatus === "available" ? (
              <GameButton
                onClick={() => onOpenDemonstration?.(metadata.id)}
                variant="ghost"
                size="sm"
                icon="👁"
                className="w-full text-center justify-center font-bold px-2 text-white/90 hover:text-white"
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
                className="w-full min-h-[36px] py-1 px-2 rounded-lg font-mono text-[11px] uppercase tracking-wider bg-white/5 border border-white/10 text-slate-600 cursor-not-allowed select-none inline-flex items-center justify-center gap-1"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                <span>{metadata.demonstrationLabel}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Região 4: Atividade Extra (Exclusiva do Bubble, posicionada estritamente abaixo das ações comuns) */}
      <div className="relative z-10">
        {isBubble ? (
          <div className="pt-2 border-t border-white/5">
            {summary.isChallengeUnlocked && onStartChallenge ? (
              <GameButton
                onClick={onStartChallenge}
                variant="primary"
                size="sm"
                icon="⚡"
                className="w-full border-amber-500/50 text-amber-300 hover:border-amber-400 shadow-md shadow-amber-950/20 justify-center"
              >
                MODO DESAFIO (EARLY EXIT)
              </GameButton>
            ) : (
              <div
                className="w-full text-[11px] text-slate-400 font-mono text-center py-1.5 px-2 rounded bg-black/30 border border-white/5"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                🔒 DESAFIO: Conclua as 3 práticas do Bubble
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
