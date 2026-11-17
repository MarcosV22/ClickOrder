import GameButton from "../../components/GameButton";
import type { ProtocolId, StationOverallProgress } from "../protocolCatalog";

export interface HomeContinueCardProps {
  readonly overallProgress: StationOverallProgress;
  readonly onResume: (protocolId: ProtocolId) => void;
}

export default function HomeContinueCard({
  overallProgress,
  onResume,
}: HomeContinueCardProps) {
  if (!overallProgress.hasAnyProgress) {
    return null;
  }

  const completionPercent = Math.round(
    (overallProgress.totalCompletedPractices / overallProgress.totalPractices) * 100
  );

  return (
    <aside
      className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0b1633] via-[#0d1d44] to-[#0b1633] border border-cyan-500/30 shadow-lg shadow-cyan-950/20 max-w-5xl w-full"
      aria-label="Retomada de progresso"
    >
      {/* Progress Information */}
      <div className="flex flex-col gap-1.5 w-full md:w-auto text-left">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span
            className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-emerald-400"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            BEM-VINDO DE VOLTA • PROGRESSO SALVO
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <h3
            className="text-base sm:text-lg font-bold text-white tracking-tight"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            {overallProgress.totalCompletedPractices} de {overallProgress.totalPractices} práticas concluídas
          </h3>
          <span className="text-xs font-mono text-cyan-300 font-bold">
            ({completionPercent}%)
          </span>
        </div>

        <p
          className="text-xs sm:text-sm text-slate-300"
          style={{ fontFamily: "'Exo 2', sans-serif" }}
        >
          Próximo passo sugerido:{" "}
          <strong className="text-cyan-200 font-bold">
            {overallProgress.recommendedResumeName}
          </strong>{" "}
          <span className="text-slate-400 font-mono text-xs">
            ({overallProgress.recommendedResumePhase})
          </span>
        </p>

        {/* Progress mini bar */}
        <div className="w-full max-w-md h-1.5 bg-black/40 rounded-full overflow-hidden mt-1 border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(completionPercent, 4)}%` }}
          />
        </div>
      </div>

      {/* Action Button */}
      <div className="flex-shrink-0 w-full md:w-auto">
        <GameButton
          onClick={() => onResume(overallProgress.recommendedResumeId)}
          variant="primary"
          size="md"
          icon="▶"
          className="w-full md:w-auto font-bold tracking-wide px-5 py-2.5 text-xs sm:text-sm"
          aria-label={`Continuar treinamento no protocolo ${overallProgress.recommendedResumeName}`}
        >
          CONTINUAR TREINAMENTO
        </GameButton>
      </div>
    </aside>
  );
}
