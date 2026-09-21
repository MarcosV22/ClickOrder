/**
 * Seletor Canônico de Práticas Curriculares (PLATFORM-R1-B).
 *
 * Princípios de Design & Arquitetura:
 * 1. Interface comum reutilizável para Bubble, Selection e Insertion.
 * 2. Exibe os 3 níveis regulares: Básica (n=4), Intermediária (n=5) e Avançada (n=6).
 * 3. Estados factuais de cada prática: DISPONÍVEL, BLOQUEADA ou CONCLUÍDA.
 * 4. Desbloqueio derivado deterministicamente do Schema v4 de persistência.
 * 5. Caso especial: no Bubble Sort, exibe o Modo Desafio (Early Exit) desacoplado
 *    da sequência regular, liberado estritamente após a conclusão das 3 práticas.
 * 6. Respeita a Scrollable Screen Rule (Single Scroll Owner, sem overflow oculto na viewport).
 */

import GameButton from "../components/GameButton";
import type { GameSaveSchema, ModuleId } from "../game/persistence/types";
import { isChallengeModeUnlocked } from "../game/persistence/persistenceService";
import {
  getModulePracticeStates,
  type PracticeLevel,
  type PracticeProgressState,
} from "../game/curriculum";
import { formatElapsedTime } from "../game/session";

export interface PracticeSelectorProps {
  readonly moduleId: ModuleId;
  readonly saveData: GameSaveSchema | undefined;
  readonly onSelectPractice: (level: PracticeLevel) => void;
  readonly onOpenTutorial: () => void;
  readonly onOpenDemonstration?: () => void;
  readonly onReturnHome: () => void;
  readonly onStartChallenge?: () => void;
}

interface ModuleThemeConfig {
  readonly name: string;
  readonly subtitle: string;
  readonly primaryColor: string;
  readonly badgeBorder: string;
  readonly badgeBg: string;
  readonly badgeText: string;
  readonly glowColor: string;
  readonly titleGradient: string;
  readonly cardBorderHover: string;
}

const MODULE_THEMES: Partial<Record<ModuleId, ModuleThemeConfig>> = {
  bubble: {
    name: "BUBBLE SORT",
    subtitle: "ORDENAÇÃO POR COMPARAÇÃO ADJACENTE",
    primaryColor: "cyan",
    badgeBorder: "border-cyan-500/30",
    badgeBg: "bg-cyan-950/40",
    badgeText: "text-cyan-300",
    glowColor: "rgba(0,245,255,0.15)",
    titleGradient: "from-cyan-300 via-blue-400 to-purple-400",
    cardBorderHover: "hover:border-cyan-400/50",
  },
  selection: {
    name: "SELECTION SORT",
    subtitle: "VARREDURA E TRANSFERÊNCIA PONTUAL",
    primaryColor: "purple",
    badgeBorder: "border-purple-500/30",
    badgeBg: "bg-purple-950/40",
    badgeText: "text-purple-300",
    glowColor: "rgba(168,85,247,0.15)",
    titleGradient: "from-purple-300 via-cyan-400 to-emerald-400",
    cardBorderHover: "hover:border-purple-400/50",
  },
  insertion: {
    name: "INSERTION SORT",
    subtitle: "TRILHO DE SUSPENSÃO E DESLOCAMENTO",
    primaryColor: "amber",
    badgeBorder: "border-amber-500/30",
    badgeBg: "bg-amber-950/40",
    badgeText: "text-amber-300",
    glowColor: "rgba(245,158,11,0.15)",
    titleGradient: "from-amber-300 via-cyan-400 to-emerald-400",
    cardBorderHover: "hover:border-amber-400/50",
  },
};

export default function PracticeSelector({
  moduleId,
  saveData,
  onSelectPractice,
  onOpenTutorial,
  onOpenDemonstration,
  onReturnHome,
  onStartChallenge,
}: PracticeSelectorProps) {
  const theme = MODULE_THEMES[moduleId] ?? MODULE_THEMES.bubble!;
  const practiceStates = getModulePracticeStates(saveData, moduleId);
  const challengeUnlocked =
    moduleId === "bubble"
      ? isChallengeModeUnlocked(saveData as any)
      : false;

  const totalCompleted = practiceStates.filter((p) => p.completed).length;

  return (
    <main
      className="relative w-full h-full min-h-screen overflow-y-auto overflow-x-hidden bg-[#060b1a] bg-grid scanlines flex flex-col items-center justify-start pt-6 sm:pt-8 pb-16 sm:pb-24 px-4 sm:px-8 select-none"
      aria-label={`Seletor de Práticas do Módulo ${theme.name}`}
    >
      {/* Glow effects de fundo */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full blur-[130px] pointer-events-none"
        style={{ backgroundColor: theme.glowColor }}
      />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-500/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8 max-w-5xl w-full my-0">
        {/* Barra superior de navegação e atalhos rápidos */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
          <GameButton
            onClick={onReturnHome}
            variant="ghost"
            size="sm"
            icon="⌂"
            className="text-white/70 hover:text-white"
          >
            HUB PRINCIPAL
          </GameButton>

          {/* Badge central do módulo */}
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[11px] font-mono tracking-widest uppercase font-bold ${theme.badgeBorder} ${theme.badgeBg} ${theme.badgeText}`}
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            <span>MÓDULO • {theme.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <GameButton
              onClick={onOpenTutorial}
              variant="secondary"
              size="sm"
              icon="?"
            >
              TUTORIAL
            </GameButton>
            {onOpenDemonstration && (
              <GameButton
                onClick={onOpenDemonstration}
                variant="secondary"
                size="sm"
                icon="▶"
              >
                DEMONSTRAÇÃO
              </GameButton>
            )}
          </div>
        </div>

        {/* Hero Title & Diretiva clara */}
        <header className="text-center flex flex-col items-center gap-2">
          <h1
            className={`text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${theme.titleGradient} tracking-tight`}
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            ESCOLHA UMA PRÁTICA
          </h1>
          <p
            className="text-xs sm:text-sm text-white/70 max-w-xl text-center leading-relaxed font-mono"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            {theme.subtitle} • {totalCompleted} DE 3 PRÁTICAS CONCLUÍDAS
          </p>
        </header>

        {/* Grid dos 3 Cards de Prática */}
        <section
          className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 w-full"
          aria-label="Lista de Práticas Curriculares"
        >
          {practiceStates.map((state: PracticeProgressState) => {
            const isCompleted = state.status === "completed";
            const isAvailable = state.status === "available";
            const isLocked = state.status === "locked";

            return (
              <div
                key={state.definition.id}
                className={`relative flex flex-col justify-between rounded-xl p-5 sm:p-6 backdrop-blur-md transition-all duration-300 border ${
                  isCompleted
                    ? "border-emerald-500/40 bg-[#09152b]/90 shadow-lg shadow-emerald-950/20"
                    : isAvailable
                      ? `border-white/20 bg-[#0c1533]/90 shadow-xl ${theme.cardBorderHover}`
                      : "border-white/10 bg-[#080d20]/50 opacity-60"
                }`}
              >
                {/* Cabeçalho do Card */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    {/* Status badge */}
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-emerald-500/40 bg-emerald-950/60 text-emerald-300 text-[10px] font-mono font-bold tracking-wider uppercase">
                        ✓ CONCLUÍDA
                      </span>
                    ) : isAvailable ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-cyan-500/40 bg-cyan-950/60 text-cyan-300 text-[10px] font-mono font-bold tracking-wider uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        DISPONÍVEL
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-white/10 bg-white/5 text-white/40 text-[10px] font-mono tracking-wider uppercase">
                        BLOQUEADA
                      </span>
                    )}

                    <span
                      className="text-xs font-mono font-bold text-white/60 uppercase"
                      style={{ fontFamily: "'Space Mono', monospace" }}
                    >
                      {state.definition.size} CARGAS
                    </span>
                  </div>

                  <div>
                    <h2
                      className="text-lg sm:text-xl font-bold text-white tracking-wide"
                      style={{ fontFamily: "'Orbitron', sans-serif" }}
                    >
                      {state.definition.title}
                    </h2>
                    <p
                      className="text-xs text-white/60 mt-1 leading-relaxed"
                      style={{ fontFamily: "'Exo 2', sans-serif" }}
                    >
                      {state.definition.description}
                    </p>
                  </div>

                  {/* Objetivo Pedagógico */}
                  <div className="pt-2 border-t border-white/5">
                    <span
                      className="text-[9px] uppercase font-mono tracking-widest text-white/40 block mb-1"
                      style={{ fontFamily: "'Space Mono', monospace" }}
                    >
                      OBJETIVO DA PRÁTICA:
                    </span>
                    <p
                      className="text-[11px] text-white/70 leading-relaxed font-mono"
                      style={{ fontFamily: "'Space Mono', monospace" }}
                    >
                      {state.definition.pedagogicalObjective}
                    </p>
                  </div>

                  {/* Telemetria se já concluída */}
                  {isCompleted && (
                    <div className="mt-2 p-2.5 rounded-lg bg-[#060b1a]/80 border border-emerald-500/20 flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-white/50 uppercase">Melhor Score:</span>
                        <span className="font-bold text-emerald-300">
                          {state.bestScore !== undefined ? `${state.bestScore} PTS` : "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-white/50 uppercase">Erros / Dicas:</span>
                        <span className="text-white/70">
                          {state.bestErrors ?? 0} err • {state.bestHints ?? 0} dic
                        </span>
                      </div>
                      {state.bestTimeMs !== undefined && (
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-white/50 uppercase">Tempo:</span>
                          <span className="text-white/70">
                            {formatElapsedTime(state.bestTimeMs)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Ação do Card */}
                <div className="mt-5 pt-3 border-t border-white/10">
                  {isCompleted ? (
                    <GameButton
                      onClick={() => onSelectPractice(state.definition.level)}
                      variant="secondary"
                      size="md"
                      icon="↺"
                      className="w-full justify-center"
                    >
                      REPETIR PRÁTICA
                    </GameButton>
                  ) : isAvailable ? (
                    <GameButton
                      onClick={() => onSelectPractice(state.definition.level)}
                      variant="primary"
                      size="md"
                      icon="→"
                      iconPosition="right"
                      className="w-full justify-center"
                    >
                      INICIAR PRÁTICA
                    </GameButton>
                  ) : (
                    <GameButton
                      variant="ghost"
                      size="md"
                      disabled
                      className="w-full justify-center opacity-50 cursor-not-allowed text-xs text-white/40"
                    >
                      BLOQUEADA
                    </GameButton>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {/* Seção Especial: Modo Desafio Early Exit (Exclusivo Bubble Sort) */}
        {moduleId === "bubble" && (
          <section
            className={`w-full rounded-2xl p-5 sm:p-6 backdrop-blur-md border transition-all duration-300 ${
              challengeUnlocked
                ? "border-amber-500/40 bg-[#161208]/80 shadow-2xl shadow-amber-950/30"
                : "border-white/10 bg-[#080d20]/40 opacity-70"
            }`}
            aria-label="Caso Especial: Modo Desafio Early Exit"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col gap-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold tracking-widest uppercase ${
                      challengeUnlocked
                        ? "border-amber-500/40 bg-amber-950/60 text-amber-300"
                        : "border-white/10 bg-white/5 text-white/40"
                    }`}
                  >
                    {challengeUnlocked ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        DESAFIO DISPONÍVEL
                      </>
                    ) : (
                      "DESAFIO BLOQUEADO"
                    )}
                  </span>
                  <span className="text-[10px] font-mono text-white/40 uppercase">
                    CASO ESPECIAL CURRICULAR
                  </span>
                </div>

                <h2
                  className="text-xl sm:text-2xl font-bold text-white tracking-wide"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  EARLY EXIT — TÉRMINO ANTECIPADO
                </h2>
                <p
                  className="text-xs text-white/70 leading-relaxed font-mono"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  3 cenários curados para exercitar a detecção heurística de vetores já ordenados ou quase ordenados, economizando passadas com a flag de troca.
                </p>
                {!challengeUnlocked && (
                  <p className="text-[11px] text-amber-300/80 font-mono mt-1">
                    🔒 Conclua as 3 práticas regulares (Básica, Intermediária e Avançada) para desbloquear este modo especial.
                  </p>
                )}
              </div>

              <div className="flex-shrink-0 flex items-center">
                {challengeUnlocked && onStartChallenge ? (
                  <GameButton
                    onClick={onStartChallenge}
                    variant="primary"
                    size="md"
                    icon="⚡"
                    className="w-full md:w-auto"
                  >
                    INICIAR DESAFIO
                  </GameButton>
                ) : (
                  <GameButton
                    variant="ghost"
                    size="md"
                    disabled
                    className="w-full md:w-auto opacity-50 cursor-not-allowed text-xs text-white/40"
                  >
                    BLOQUEADO
                  </GameButton>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
