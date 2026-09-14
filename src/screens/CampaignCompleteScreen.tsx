import GameButton from "../components/GameButton";
import { PhaseResult, calculateCampaignSummary } from "../game/campaign/campaignSummary";
import { formatElapsedTime } from "../game/session";

interface CampaignCompleteScreenProps {
  results: PhaseResult[];
  totalPhases: number;
  onReturnHome: () => void;
  onRestartProtocol?: () => void;
  onStartChallenge?: () => void;
}

export default function CampaignCompleteScreen({
  results,
  totalPhases,
  onReturnHome,
  onRestartProtocol,
  onStartChallenge,
}: CampaignCompleteScreenProps) {
  const summary = calculateCampaignSummary(results, totalPhases);

  return (
    <main
      className="relative w-full h-full min-h-full overflow-y-auto bg-[#060b1a] bg-grid scanlines flex flex-col items-center justify-start pt-6 sm:pt-8 pb-16 sm:pb-24 px-4 sm:px-8"
      aria-label="Tela de Conclusão do Protocolo Bubble"
    >
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[300px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-5 sm:gap-6 max-w-4xl w-full my-0">
        {/* Top status badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span
            className="text-[11px] text-emerald-400 tracking-[0.25em] uppercase font-bold"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            CENTRAL LOGÍSTICA • PROTOCOLO BUBBLE
          </span>
        </div>

        {/* Hero Title and Narrative */}
        <header className="text-center flex flex-col items-center gap-2">
          <h1
            className="text-4xl sm:text-5xl font-black text-white tracking-tight"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              textShadow: "0 0 35px rgba(52,211,153,0.35)",
            }}
          >
            TREINAMENTO
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-400 to-purple-400">
              CONCLUÍDO!
            </span>
          </h1>
          <p
            className="text-sm sm:text-base text-white/70 max-w-xl text-center leading-relaxed"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Todas as cargas foram organizadas. O operador concluiu com sucesso todas as etapas
            do treinamento de ordenação por comparação adjacente.
          </p>
        </header>

        {/* Global Metrics Summary Banner */}
        <section
          className="w-full panel-border bg-[#080f28]/90 rounded-xl p-5 sm:p-6"
          aria-label="Resumo Geral da Campanha"
        >
          <div className="text-[10px] text-white/40 tracking-widest uppercase mb-4 text-center"
            style={{ fontFamily: "'Space Mono', monospace" }}>
            MÉTRICAS FACTUAIS GLOBAIS
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#0d1635]/80 border border-emerald-500/20">
              <span
                className="text-[9px] tracking-widest text-white/50 uppercase mb-1 text-center"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                Fases Concluídas
              </span>
              <span
                className="text-2xl sm:text-3xl font-black text-emerald-400 glow-emerald"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                {summary.completedPhases} / {summary.totalPhases}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#0d1635]/80 border border-cyan-500/20">
              <span
                className="text-[9px] tracking-widest text-white/50 uppercase mb-1 text-center"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                Comparações Totais
              </span>
              <span
                className="text-2xl sm:text-3xl font-black text-cyan-300 glow-cyan"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                {summary.totalComparisons}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#0d1635]/80 border border-purple-500/20">
              <span
                className="text-[9px] tracking-widest text-white/50 uppercase mb-1 text-center"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                Trocas Totais
              </span>
              <span
                className="text-2xl sm:text-3xl font-black text-purple-400 glow-purple"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                {summary.totalSwaps}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#0d1635]/80 border border-amber-500/20">
              <span
                className="text-[9px] tracking-widest text-white/50 uppercase mb-1 text-center"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                Decisões Incorretas
              </span>
              <span
                className="text-2xl sm:text-3xl font-black text-amber-400"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                {summary.totalErrors}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center p-3 rounded-lg bg-[#0d1635]/80 border border-cyan-500/20">
              <span
                className="text-[9px] tracking-widest text-white/50 uppercase mb-1 text-center"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                Dicas Utilizadas
              </span>
              <span
                className="text-2xl sm:text-3xl font-black text-cyan-400"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                {summary.totalHintsUsed}
              </span>
            </div>
          </div>
        </section>

        {/* Phase-by-Phase Breakdown */}
        <section className="w-full flex flex-col gap-3" aria-label="Desempenho por Fase">
          <div
            className="text-[10px] text-white/40 tracking-widest uppercase"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            RELATÓRIO POR ETAPA DO PROTOCOLO
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {results.map((res) => (
              <div
                key={res.phase}
                className="panel-border bg-[#0d1635]/70 rounded-xl p-4 flex flex-col justify-between gap-3 border border-white/5"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-bold text-white tracking-wider"
                    style={{ fontFamily: "'Orbitron', sans-serif" }}
                  >
                    FASE {res.phase}
                  </span>
                  <span
                    className="text-[10px] text-emerald-400 border border-emerald-500/30 bg-emerald-950/40 px-2 py-0.5 rounded font-mono"
                  >
                    ✓ CONCLUÍDA
                  </span>
                </div>

                <div className="flex flex-col gap-1 text-xs font-mono">
                  {res.score !== undefined && (
                    <div className="flex justify-between text-cyan-300 font-bold pb-1 mb-1 border-b border-white/10">
                      <span className="text-[10px] uppercase tracking-wider">Pontuação do Protocolo:</span>
                      <span className="text-xs">{res.score} / 100</span>
                    </div>
                  )}
                  {res.elapsedTimeMs !== undefined && (
                    <div className="flex justify-between text-white/60">
                      <span>Tempo de Operação:</span>
                      <span className="text-emerald-300 font-bold">
                        {formatElapsedTime(res.elapsedTimeMs)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-white/60">
                    <span>Comparações:</span>
                    <span className="text-cyan-300 font-bold">{res.comparisons}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Trocas:</span>
                    <span className="text-purple-400 font-bold">{res.swaps}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Decisões Incorretas:</span>
                    <span className="text-amber-400 font-bold">{res.errors}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Dicas Utilizadas:</span>
                    <span className="text-cyan-400 font-bold">{res.hintsUsed}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-1">
                  <span className="text-[9px] text-white/30 uppercase font-mono">Vetor Final:</span>
                  <div className="flex gap-1.5">
                    {res.finalArray.map((num, idx) => (
                      <span
                        key={idx}
                        className="w-5 h-5 rounded bg-[#060b1a] border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center justify-center font-mono"
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 w-full pt-2 pb-2">
          {onStartChallenge && (
            <GameButton
              onClick={onStartChallenge}
              variant="primary"
              size="lg"
              className="min-w-[240px] border-amber-500/50 text-amber-300 hover:border-amber-400 shadow-lg shadow-amber-950/40"
            >
              ⚡ &nbsp; EXPERIMENTAR MODO DESAFIO: EARLY EXIT →
            </GameButton>
          )}

          <GameButton onClick={onReturnHome} variant="secondary" size="lg" className="min-w-[180px]">
            ⌂ &nbsp; VOLTAR AO INÍCIO
          </GameButton>

          {onRestartProtocol && (
            <GameButton
              onClick={onRestartProtocol}
              variant="secondary"
              size="md"
              className="min-w-[180px]"
            >
              ↺ &nbsp; REJOGAR PROTOCOLO
            </GameButton>
          )}
        </div>

        {/* Bottom status note */}
        <div className="flex items-center justify-center gap-4 text-[10px] text-white/30 tracking-widest font-mono text-center">
          <span>OPERAÇÃO HOMOLOGADA</span>
          <span>•</span>
          <span>BUBBLE SORT V2.0</span>
          <span>•</span>
          <span>SETORES SELECTION E INSERTION EM DESENVOLVIMENTO</span>
        </div>
      </div>
    </main>
  );
}
