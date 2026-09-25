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

          {/* Merge Sort Dedicated Progressive Flow vs Standard Grid */}
          {briefing.id === "merge-canonical" ? (
            <>
              {/* Três Etapas Numeradas Progressivas */}
              <section aria-labelledby="briefing-instructions-title">
                <div className="flex items-center gap-2 mb-2.5 px-1">
                  <span className="text-cyan-400">◈</span>
                  <h2
                    id="briefing-instructions-title"
                    className="text-xs sm:text-sm font-mono font-bold tracking-wider text-slate-200 uppercase"
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    Como Funciona o Algoritmo (3 Etapas)
                  </h2>
                </div>
                <div className="flex flex-col gap-3">
                  {briefing.instructions.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0d1635]/85 border border-[#1e3570]/90 rounded-xl p-3.5 sm:p-4 flex items-start gap-3.5 hover:border-cyan-500/50 transition-colors shadow-sm"
                    >
                      <div
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-bold text-sm sm:text-base bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 flex-shrink-0 mt-0.5"
                        style={{ fontFamily: "'Space Mono', monospace" }}
                        aria-hidden="true"
                      >
                        {item.icon ?? idx + 1}
                      </div>
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

              {/* Exemplo Visual Pequeno e Coerente (Divisão vs Intercalação) */}
              <section
                className="bg-[#081026] border border-cyan-500/30 rounded-xl p-4 flex flex-col gap-3 shadow-md"
                aria-label="Exemplo visual de divisão e intercalação"
              >
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400">✦</span>
                  <span
                    className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300"
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    Exemplo Visual com [4, 1, 3, 2]
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  {/* Fase 1: Divisão */}
                  <div className="p-3 rounded-lg bg-black/40 border border-white/10 flex flex-col gap-2">
                    <span className="text-slate-300 font-bold uppercase text-[11px] tracking-wide">
                      1. Fase de Divisão (apenas separa)
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded">[4, 1, 3, 2]</span>
                      <span className="text-slate-400">→</span>
                      <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded">[4, 1]</span>
                      <span className="text-slate-400">+</span>
                      <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded">[3, 2]</span>
                      <span className="text-slate-400">→</span>
                      <span className="px-1.5 py-0.5 bg-cyan-950/40 border border-cyan-500/30 rounded text-cyan-300 font-bold">
                        [4] [1] [3] [2]
                      </span>
                    </div>
                    <span
                      className="text-[11px] text-slate-300 font-sans leading-relaxed"
                      style={{ fontFamily: "'Exo 2', sans-serif" }}
                    >
                      Dividir reparte os números até grupos de 1 elemento. Dividir ainda não coloca nada em ordem.
                    </span>
                  </div>

                  {/* Fase 2: Intercalação */}
                  <div className="p-3 rounded-lg bg-cyan-950/25 border border-cyan-500/30 flex flex-col gap-2">
                    <span className="text-cyan-300 font-bold uppercase text-[11px] tracking-wide">
                      2. Fase de Intercalação (junta em ordem)
                    </span>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 bg-black/40 border border-cyan-500/30 rounded text-cyan-200">
                          [4] + [1] → [1, 4]
                        </span>
                        <span className="text-slate-400">|</span>
                        <span className="px-2 py-0.5 bg-black/40 border border-cyan-500/30 rounded text-cyan-200">
                          [3] + [2] → [2, 3]
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 bg-black/50 border border-emerald-500/40 rounded text-emerald-300 font-bold">
                          [1, 4] + [2, 3] → [1, 2, 3, 4] ✓
                        </span>
                      </div>
                    </div>
                    <span
                      className="text-[11px] text-slate-200 font-sans leading-relaxed"
                      style={{ fontFamily: "'Exo 2', sans-serif" }}
                    >
                      Compara o menor de cada par, monta a sequência no vetor auxiliar e depois copia de volta.
                    </span>
                  </div>
                </div>
              </section>

              {/* Duas Regras Curtas Apresentadas Separadamente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#0b1739] border border-cyan-500/40 rounded-xl p-3.5 flex flex-col gap-1.5 shadow-md">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 text-sm font-bold">⚖️</span>
                    <span
                      className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wide"
                      style={{ fontFamily: "'Space Mono', monospace" }}
                    >
                      Números iguais?
                    </span>
                  </div>
                  <p
                    className="text-xs sm:text-[13px] text-slate-100 leading-relaxed font-sans"
                    style={{ fontFamily: "'Exo 2', sans-serif" }}
                  >
                    Escolha o da esquerda para manter a ordem original dos dados (regra mandatória de estabilidade).
                  </p>
                </div>

                <div className="bg-[#0b1739] border border-cyan-500/40 rounded-xl p-3.5 flex flex-col gap-1.5 shadow-md">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 text-sm font-bold">➡️</span>
                    <span
                      className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wide"
                      style={{ fontFamily: "'Space Mono', monospace" }}
                    >
                      Um grupo terminou?
                    </span>
                  </div>
                  <p
                    className="text-xs sm:text-[13px] text-slate-100 leading-relaxed font-sans"
                    style={{ fontFamily: "'Exo 2', sans-serif" }}
                  >
                    Copie os números restantes do outro grupo diretamente. Eles já estão em ordem.
                  </p>
                </div>
              </div>

              {/* Explicação do Vetor Auxiliar */}
              <div className="bg-[#07132e] border border-teal-500/35 rounded-xl p-3.5 flex items-start gap-3 shadow-md">
                <span className="text-teal-400 font-bold text-base mt-0.5">📦</span>
                <div className="flex flex-col gap-1">
                  <span
                    className="text-xs font-mono font-bold text-teal-300 uppercase tracking-wide"
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    Vetor auxiliar temporário
                  </span>
                  <p
                    className="text-xs sm:text-[13px] text-slate-100 leading-relaxed font-sans"
                    style={{ fontFamily: "'Exo 2', sans-serif" }}
                  >
                    Espaço temporário onde o resultado de cada intercalação é montado em ordem antes de ser copiado de volta para o vetor principal.
                  </p>
                </div>
              </div>

              {/* Seção Secundária: Entenda os Detalhes */}
              <details className="group bg-[#081026]/90 border border-white/10 rounded-xl p-3.5 sm:p-4 text-xs shadow-md">
                <summary className="cursor-pointer font-mono font-bold text-slate-200 flex items-center justify-between uppercase tracking-wider select-none hover:text-cyan-300 transition-colors">
                  <span className="flex items-center gap-2">
                    <span>🔍</span>
                    <span>Entenda os detalhes técnicos</span>
                  </span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform font-mono">▼</span>
                </summary>

                <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-3 font-sans text-slate-200 leading-relaxed text-xs sm:text-[13px]">
                  <div>
                    <span
                      className="font-bold text-white font-mono uppercase text-xs block mb-0.5"
                      style={{ fontFamily: "'Space Mono', monospace" }}
                    >
                      • Marcação ORD vs Conclusão OK
                    </span>
                    <span style={{ fontFamily: "'Exo 2', sans-serif" }}>
                      Subvetores parciais recebem a marcação <strong>ORD</strong> quando uma intercalação local é finalizada e copiada de volta. O selo definitivo <strong>OK</strong> surge apenas quando todo o vetor estiver completamente ordenado.
                    </span>
                  </div>

                  <div>
                    <span
                      className="font-bold text-white font-mono uppercase text-xs block mb-0.5"
                      style={{ fontFamily: "'Space Mono', monospace" }}
                    >
                      • Ponteiros de Leitura e Escrita (p1, p2, k)
                    </span>
                    <span style={{ fontFamily: "'Exo 2', sans-serif" }}>
                      Os ponteiros <code>p1</code> e <code>p2</code> indicam o próximo número disponível de cada grupo. O ponteiro <code>k</code> marca a próxima posição livre no vetor auxiliar temporário.
                    </span>
                  </div>

                  <div>
                    <span
                      className="font-bold text-white font-mono uppercase text-xs block mb-0.5"
                      style={{ fontFamily: "'Space Mono', monospace" }}
                    >
                      • Escritas no Vetor vs Comparações Lógicas
                    </span>
                    <span style={{ fontFamily: "'Exo 2', sans-serif" }}>
                      Cada número copiado para o vetor auxiliar e depois transferido de volta conta como escrita. O Merge Sort consome memória auxiliar proporcional a <strong>O(n)</strong> e realiza <strong>Θ(n log n)</strong> comparações em todos os casos.
                    </span>
                  </div>

                  {/* Highlights Strip inside Details */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full mt-2 pt-2 border-t border-white/10">
                    {briefing.highlights.map((item, idx) => {
                      const valColor =
                        highlightColorClasses[item.variant ?? "cyan"] ?? "text-white";
                      return (
                        <div
                          key={idx}
                          className="bg-[#0d1635]/90 border border-[#1e3570]/80 rounded-lg p-2 text-center flex flex-col justify-center"
                        >
                          <span
                            className="text-[10px] font-mono tracking-wider text-slate-300 uppercase font-semibold"
                            style={{ fontFamily: "'Space Mono', monospace" }}
                          >
                            {item.label}
                          </span>
                          <span
                            className={`text-xs font-mono font-bold mt-0.5 ${valColor}`}
                            style={{ fontFamily: "'Space Mono', monospace" }}
                          >
                            {item.value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </details>
            </>
          ) : (
            <>
              {/* Card 2: Instruções / Como Operar (Grid Padrão) */}
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
            </>
          )}
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
