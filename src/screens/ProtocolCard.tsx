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
      className={`relative flex flex-col h-full rounded-2xl p-6 sm:p-7 backdrop-blur-md transition-all duration-300 border ${
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

      {/* Região 1: Conteúdo (Badges, Título, Metáfora e Descrição Pedagógica) */}
      <div className="flex flex-col gap-3 relative z-10 min-h-[148px]">
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
      </div>

      {/* Região 2: Progresso (Metadados e Telemetria em linhas empilhadas) */}
      <div className="flex flex-col gap-2 pt-3 border-t border-white/10 relative z-10">
        <span
          className="text-[10px] uppercase font-mono tracking-widest text-slate-300 font-semibold"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          STATUS DE APRENDIZADO
        </span>

        {isAvailable ? (
          <div className="flex flex-col gap-2 bg-[#060b1a]/80 border border-white/10 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-slate-300">Práticas:</span>
              <span
                className="font-bold text-white font-mono"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {summary.completedPhases} de {summary.totalPhases} concluídas
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-slate-300">Tutorial guiado:</span>
              <span
                className={`font-bold font-mono ${
                  summary.hasCompletedTutorial ? "text-emerald-400" : "text-amber-300"
                }`}
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {summary.hasCompletedTutorial ? "CONCLUÍDO" : "PENDENTE"}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-slate-300">Melhor pontuação:</span>
              <span
                className="font-bold text-cyan-300 font-mono"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {summary.bestScore !== undefined ? `${summary.bestScore} / 100` : "—"}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl border border-dashed border-white/10 bg-black/20 text-center">
            <span
              className="text-xs font-mono text-slate-300 italic"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Módulo curricular em preparação
            </span>
          </div>
        )}
      </div>

      {/* Região 3: Ações Comuns (Alinhadas estritamente entre todos os cards da mesma linha) */}
      <div className="flex flex-col gap-2.5 pt-4 mt-3 border-t border-white/10 relative z-10">
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

        {/* Secondary CTAs stacked to prevent narrow squeezed buttons */}
        <div className="flex flex-col gap-2 w-full">
          {/* Tutorial button */}
          <div className="w-full">
            {isAvailable ? (
              <GameButton
                onClick={() => onOpenTutorial(metadata.id)}
                variant="secondary"
                size="sm"
                icon="?"
                className="w-full text-center px-3 font-bold"
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
          <div className="w-full">
            {metadata.demonstrationStatus === "available" ? (
              <GameButton
                onClick={() => onOpenDemonstration?.(metadata.id)}
                variant="ghost"
                size="sm"
                icon="👁"
                className="w-full text-center px-3 font-bold text-white/90 hover:text-white"
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
      </div>

      {/* Região 4: Atividade Extra (Exclusiva do Bubble, posicionada estritamente abaixo das ações comuns) */}
      {metadata.id === "bubble" && (
        <div className="pt-2.5 mt-2 border-t border-white/5 relative z-10">
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
              className="w-full text-[11px] text-slate-400/60 font-mono text-center py-1.5 px-2 rounded bg-black/30 border border-white/5"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              🔒 DESAFIO: Conclua as 3 práticas do Bubble
            </div>
          )}
        </div>
      )}
    </div>
  );
}
