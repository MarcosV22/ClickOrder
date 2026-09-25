/**
 * Tela Canônica de Conclusão do Conjunto de Práticas Curriculares (PLATFORM-R1-B).
 *
 * Princípios de Design & Arquitetura:
 * 1. Abstração canônica unificada para Bubble Sort, Selection Sort e Insertion Sort.
 * 2. Elimina vocabulário de "campanha" e "fases", consolidando o modelo:
 *    Módulo Curricular -> Conjunto de Práticas -> Práticas (Básica, Intermediária, Avançada).
 * 3. Apresenta métricas factuais transversais e específicas de cada algoritmo:
 *    - Comparações Totais;
 *    - Movimentações (Trocas Adjacentes para Bubble, Transferências para Selection, Deslocamentos/Inserções para Insertion);
 *    - Erros, Dicas, Tempo Total e Média de Pontuação.
 * 4. Exibe os vetores finais consolidados com NumberedBox (role="sorted").
 * 5. Bloco de síntese pedagógica discriminado por algoritmo.
 * 6. Suporte ao Caso Especial: no Bubble Sort, se o Modo Desafio estiver desbloqueado,
 *    apresenta destaque com CTA direto para Early Exit.
 * 7. Respeita a Scrollable Screen Rule (PLATFORM-UI-H1) com Single Scroll Owner.
 */

import GameButton from "../components/GameButton";
import NumberedBox from "../components/NumberedBox";
import type { ModuleId, GameSaveSchema } from "../game/persistence/types";
import { getModulePracticeStates } from "../game/curriculum/practiceCatalog";
import { formatElapsedTime } from "../game/session";

export interface UnifiedPracticeResult {
  readonly level?: "basic" | "intermediate" | "advanced";
  readonly phase?: number;
  readonly practiceTitle?: string;
  readonly comparisons: number;
  readonly swaps?: number;
  readonly shifts?: number;
  readonly insertions?: number;
  readonly errors: number;
  readonly hintsUsed: number;
  readonly score: number;
  readonly elapsedTimeMs?: number;
  readonly finalArray: readonly number[];
  readonly initialArray?: readonly number[];
  readonly practiceDefinition?: {
    readonly title: string;
    readonly description?: string;
    readonly size?: number;
  };
}

export interface PracticeSetCompleteScreenProps {
  readonly moduleId?: ModuleId;
  readonly practiceResults?: readonly UnifiedPracticeResult[] | readonly any[];
  readonly results?: readonly any[]; // retrocompatibilidade com CampaignCompleteScreen
  readonly totalPhases?: number; // retrocompatibilidade
  readonly saveData?: GameSaveSchema;
  readonly onRepeatPractices?: () => void;
  readonly onRestartProtocol?: () => void; // retrocompatibilidade
  readonly onReturnHome: () => void;
  readonly onOpenSelector?: () => void;
  readonly onStartChallenge?: () => void;
  readonly isChallengeUnlocked?: boolean;
}

interface ModuleCompleteTheme {
  readonly name: string;
  readonly subtitle: string;
  readonly primaryColor: string;
  readonly badgeBorder: string;
  readonly badgeBg: string;
  readonly badgeText: string;
  readonly glowClasses: string;
  readonly titleGradient: string;
  readonly cardBorder: string;
  readonly movementLabel: string;
  readonly pedagogicalTitle: string;
  readonly pedagogicalText: string;
}

const COMPLETE_THEMES: Partial<Record<ModuleId, ModuleCompleteTheme>> = {
  bubble: {
    name: "BUBBLE SORT",
    subtitle:
      "Você dominou a mecânica canônica por comparações de vizinhos: análise de elementos contíguos, propagação do maior número para a extremidade direita e consolidação progressiva com selo OK.",
    primaryColor: "cyan",
    badgeBorder: "border-cyan-500/30",
    badgeBg: "bg-cyan-950/40",
    badgeText: "text-cyan-300",
    glowClasses: "bg-cyan-500/10",
    titleGradient: "from-cyan-300 via-blue-400 to-purple-400",
    cardBorder: "border-cyan-500/20",
    movementLabel: "Trocas de Posição",
    pedagogicalTitle: "Síntese Conceitual do Bubble Sort",
    pedagogicalText:
      "O Bubble Sort opera através de comparações locais entre pares contíguos. A cada passada, o maior número flutua para a direita até atingir sua posição definitiva. As posições consolidadas formam uma partição ordenada que reduz o número de comparações das passadas seguintes.",
  },
  selection: {
    name: "SELECTION SORT",
    subtitle:
      "Você dominou a mecânica canônica por varredura seletiva: busca do menor elemento não ordenado e realização de no máximo uma troca por passada.",
    primaryColor: "purple",
    badgeBorder: "border-purple-500/30",
    badgeBg: "bg-purple-950/40",
    badgeText: "text-purple-300",
    glowClasses: "bg-purple-500/10",
    titleGradient: "from-purple-300 via-cyan-400 to-emerald-400",
    cardBorder: "border-purple-500/20",
    movementLabel: "Trocas (Transferências)",
    pedagogicalTitle: "Síntese Conceitual do Selection Sort",
    pedagogicalText:
      "O Selection Sort divide o vetor entre uma parte ordenada à esquerda e uma não ordenada à direita. Ele percorre todos os números restantes buscando o menor elemento e realiza no máximo UMA troca por passada, consolidando a posição definitiva com o selo OK.",
  },
  insertion: {
    name: "INSERTION SORT",
    subtitle:
      "Você dominou a mecânica canônica por deslocamento: seleção da chave destacada, comparações regressivas na parte ordenada e inserção direta na vaga aberta.",
    primaryColor: "amber",
    badgeBorder: "border-amber-500/30",
    badgeBg: "bg-amber-950/40",
    badgeText: "text-amber-300",
    glowClasses: "bg-amber-500/10",
    titleGradient: "from-amber-300 via-cyan-400 to-emerald-400",
    cardBorder: "border-amber-500/20",
    movementLabel: "Deslocamentos",
    pedagogicalTitle: "Síntese Conceitual do Insertion Sort",
    pedagogicalText:
      "O Insertion Sort constrói a região ordenada progressivamente. Elementos maiores deslizam para a direita apenas enquanto forem maiores que a chave destacada, tornando o algoritmo especialmente adaptativo e eficiente para sequências quase ordenadas: O(n) no melhor caso.",
  },
  merge: {
    name: "MERGE SORT",
    subtitle:
      "Você dominou a mecânica canônica por divisão e intercalação: combinação ordenada com dois ponteiros, vetor auxiliar visível e garantia estrita de estabilidade.",
    primaryColor: "blue",
    badgeBorder: "border-blue-500/30",
    badgeBg: "bg-blue-950/40",
    badgeText: "text-blue-300",
    glowClasses: "bg-blue-500/10",
    titleGradient: "from-blue-300 via-cyan-400 to-sky-300",
    cardBorder: "border-blue-500/20",
    movementLabel: "Escritas no Vetor Auxiliar",
    pedagogicalTitle: "Síntese Conceitual do Merge Sort",
    pedagogicalText:
      "O Merge Sort divide recursivamente o vetor até subproblemas unitários e junta-os de forma ordenada utilizando um vetor auxiliar temporário O(n). Ao comparar as frentes dos grupos esquerdo e direito, a decisão em empate (≤) escolhe invariavelmente o elemento da esquerda, preservando a estabilidade algorítmica antes da cópia de retorno ao vetor principal.",
  },
};

function resolvePracticeTitle(item: any, fallbackIdx: number): string {
  if (item?.practiceDefinition?.title) return item.practiceDefinition.title;
  if (item?.practiceTitle) return item.practiceTitle;
  if (item?.level === "basic") return "PRÁTICA BÁSICA";
  if (item?.level === "intermediate") return "PRÁTICA INTERMEDIÁRIA";
  if (item?.level === "advanced") return "PRÁTICA AVANÇADA";
  if (item?.phase === 1) return "PRÁTICA BÁSICA";
  if (item?.phase === 2) return "PRÁTICA INTERMEDIÁRIA";
  if (item?.phase === 3) return "PRÁTICA AVANÇADA";
  return fallbackIdx === 0
    ? "PRÁTICA BÁSICA"
    : fallbackIdx === 1
      ? "PRÁTICA INTERMEDIÁRIA"
      : "PRÁTICA AVANÇADA";
}

export default function PracticeSetCompleteScreen({
  moduleId = "insertion",
  practiceResults,
  results,
  saveData,
  onRepeatPractices,
  onRestartProtocol,
  onReturnHome,
  onOpenSelector,
  onStartChallenge,
  isChallengeUnlocked = false,
}: PracticeSetCompleteScreenProps) {
  const theme = COMPLETE_THEMES[moduleId] ?? COMPLETE_THEMES.insertion!;
  const rawList: readonly any[] = practiceResults ?? results ?? [];
  const curricularStates = saveData ? getModulePracticeStates(saveData, moduleId) : [];
  const curricularCompletedCount = curricularStates.length > 0
    ? curricularStates.filter((s) => s.status === "completed").length
    : 3;
  const isCurriculumFullyCompleted = curricularCompletedCount === 3;

  const totalComparisons = rawList.reduce((acc, r) => acc + (r.comparisons ?? 0), 0);
  const totalSwaps = rawList.reduce((acc, r) => acc + (r.swaps ?? 0), 0);
  const totalShifts = rawList.reduce((acc, r) => acc + (r.shifts ?? 0), 0);
  const totalInsertions = rawList.reduce((acc, r) => acc + (r.insertions ?? 0), 0);
  const totalWritesInBuffer = rawList.reduce((acc, r) => acc + (r.writesInBuffer ?? 0), 0);
  const totalWritesInMain = rawList.reduce((acc, r) => acc + (r.writesInMain ?? 0), 0);
  const totalErrors = rawList.reduce((acc, r) => acc + (r.errors ?? 0), 0);
  const totalHints = rawList.reduce((acc, r) => acc + (r.hintsUsed ?? 0), 0);
  const totalTimeMs = rawList.reduce((acc, r) => acc + (r.elapsedTimeMs ?? 0), 0);
  const avgScore =
    rawList.length > 0
      ? Math.round(rawList.reduce((acc, r) => acc + (r.score ?? 0), 0) / rawList.length)
      : 100;

  const handleRepeat = onRepeatPractices ?? onRestartProtocol ?? onReturnHome;

  return (
    <main
      className="relative w-full h-full min-h-screen overflow-y-auto overflow-x-hidden bg-[#060b1a] bg-grid scanlines flex flex-col items-center justify-start pt-6 sm:pt-8 pb-16 sm:pb-24 px-4 sm:px-8 text-white select-none"
      aria-label={`Tela de Conclusão do Conjunto de Práticas do ${theme.name}`}
    >
      {/* Glow effects de fundo */}
      <div
        className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[300px] ${theme.glowClasses} rounded-full blur-[120px] pointer-events-none`}
      />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-4xl w-full my-0">
        {/* Top status badge */}
        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border ${theme.badgeBorder} ${theme.badgeBg}`}
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span
            className={`text-[11px] ${theme.badgeText} tracking-[0.25em] uppercase font-bold`}
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            MÓDULO EDUCACIONAL • {theme.name}
            {isCurriculumFullyCompleted ? " • CURRÍCULO 3/3 CONCLUÍDO" : ""}
          </span>
        </div>

        {/* Hero Title */}
        <header className="text-center flex flex-col items-center gap-2">
          <h1
            className="text-4xl sm:text-5xl font-black text-white tracking-tight"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              textShadow: "0 0 35px rgba(52,211,153,0.35)",
            }}
          >
            CONJUNTO DE PRÁTICAS
            <br />
            <span
              className={`text-transparent bg-clip-text bg-gradient-to-r ${theme.titleGradient}`}
            >
              CONCLUÍDO!
            </span>
          </h1>
          <p
            className="text-sm sm:text-base text-white/70 max-w-xl text-center leading-relaxed"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            {theme.subtitle}
          </p>
        </header>

        {/* Resumo Global das Métricas */}
        <section
          className="w-full panel-border bg-[#080f28]/90 rounded-xl p-5 sm:p-6"
          aria-label="Resumo Global de Métricas"
        >
          <div className="text-[10px] text-white/40 tracking-widest uppercase mb-1 text-center font-mono">
            CONSOLIDAÇÃO FACTUAL DAS PRÁTICAS (ÚLTIMAS TENTATIVAS DA SESSÃO)
          </div>
          <p className="text-[11px] text-white/50 text-center font-mono mb-4 max-w-xl mx-auto leading-relaxed">
            {rawList.length < 3
              ? `Soma consolidada da(s) ${rawList.length} prática(s) concluída(s) nesta sessão. Seu progresso curricular acumulado (${curricularCompletedCount}/3 no módulo) está preservado sem necessidade de repetir práticas anteriores.`
              : "Soma consolidada das 3 práticas concluídas na sessão ativa. Cada card abaixo preserva o registro individual factual da respectiva prática (tempo puramente descritivo)."}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Práticas */}
            <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#0d1635]/80 border border-white/10">
              <span className="text-[9px] tracking-widest text-white/50 uppercase mb-1 font-mono text-center">
                Práticas (Sessão)
              </span>
              <span
                className="text-2xl font-black text-emerald-400"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                {rawList.length} / 3
              </span>
              <span className="text-[9px] text-white/40 font-mono mt-0.5 text-center">
                {isCurriculumFullyCompleted ? "Módulo: 3/3 Salvo" : `Módulo: ${curricularCompletedCount}/3 Salvo`}
              </span>
            </div>

            {/* Comparações */}
            <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#0d1635]/80 border border-cyan-500/20">
              <span className="text-[9px] tracking-widest text-white/50 uppercase mb-1 font-mono text-center">
                Comparações
              </span>
              <span
                className="text-2xl font-black text-cyan-300 glow-cyan"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                {totalComparisons}
              </span>
            </div>

            {/* Movimentações: Trocas para Bubble/Selection, Deslocamentos para Insertion, Escritas para Merge */}
            {moduleId === "merge" ? (
              <>
                <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#0d1635]/80 border border-amber-500/20">
                  <span className="text-[9px] tracking-widest text-white/50 uppercase mb-1 font-mono text-center">
                    No Buffer
                  </span>
                  <span
                    className="text-2xl font-black text-amber-300"
                    style={{ fontFamily: "'Orbitron', sans-serif" }}
                  >
                    {totalWritesInBuffer}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#0d1635]/80 border border-teal-500/20">
                  <span className="text-[9px] tracking-widest text-white/50 uppercase mb-1 font-mono text-center">
                    No Vetor
                  </span>
                  <span
                    className="text-2xl font-black text-teal-400"
                    style={{ fontFamily: "'Orbitron', sans-serif" }}
                  >
                    {totalWritesInMain}
                  </span>
                </div>
              </>
            ) : moduleId === "insertion" ? (
              <>
                <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#0d1635]/80 border border-purple-500/20">
                  <span className="text-[9px] tracking-widest text-white/50 uppercase mb-1 font-mono text-center">
                    Deslocamentos
                  </span>
                  <span
                    className="text-2xl font-black text-purple-400 glow-purple"
                    style={{ fontFamily: "'Orbitron', sans-serif" }}
                  >
                    {totalShifts}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#0d1635]/80 border border-amber-500/20">
                  <span className="text-[9px] tracking-widest text-white/50 uppercase mb-1 font-mono text-center">
                    Inserções
                  </span>
                  <span
                    className="text-2xl font-black text-amber-300"
                    style={{ fontFamily: "'Orbitron', sans-serif" }}
                  >
                    {totalInsertions}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#0d1635]/80 border border-purple-500/20">
                <span className="text-[9px] tracking-widest text-white/50 uppercase mb-1 font-mono text-center">
                  {theme.movementLabel}
                </span>
                <span
                  className="text-2xl font-black text-purple-400 glow-purple"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  {totalSwaps}
                </span>
              </div>
            )}

            {/* Erros */}
            <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#0d1635]/80 border border-white/10">
              <span className="text-xs tracking-wider text-slate-300 uppercase mb-1 font-mono text-center font-bold">
                Erros
              </span>
              <span
                className={`text-2xl font-black ${
                  totalErrors > 0 ? "text-red-400" : "text-slate-400"
                }`}
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                {totalErrors}
              </span>
            </div>

            {/* Tempo se disponível, senão Dicas */}
            <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#0d1635]/80 border border-white/10">
              <span className="text-xs tracking-wider text-slate-300 uppercase mb-1 font-mono text-center font-bold">
                {totalTimeMs > 0 ? "Tempo (Total)" : "Dicas"}
              </span>
              <span
                className="text-xl sm:text-2xl font-black text-white/90"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                {totalTimeMs > 0 ? formatElapsedTime(totalTimeMs) : totalHints}
              </span>
            </div>

            {/* Média de Pontuação */}
            <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#0d1635]/80 border border-emerald-500/20">
              <span className="text-xs tracking-wider text-slate-300 uppercase mb-1 font-mono text-center font-bold">
                Pontuação Média
              </span>
              <span
                className="text-2xl font-black text-emerald-400 glow-emerald"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                {avgScore}
              </span>
            </div>
          </div>
        </section>

        {/* Detalhamento de cada Prática Realizada */}
        {rawList.length > 0 && (
          <section className="w-full flex flex-col gap-4" aria-label="Práticas Concluídas">
            <div className="text-xs text-slate-300 font-bold tracking-wider uppercase text-center font-mono">
              VETORES CONSOLIDADOS POR NÍVEL
            </div>

            <div
              className={
                rawList.length === 1
                  ? "max-w-md mx-auto w-full"
                  : rawList.length === 2
                    ? "grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto w-full"
                    : "grid grid-cols-1 md:grid-cols-3 gap-4 w-full"
              }
            >
              {rawList.map((item, idx) => {
                const practiceTitle = resolvePracticeTitle(item, idx);
                const finalArray: readonly number[] = item.finalArray ?? [];

                return (
                  <div
                    key={`practice-result-${idx}`}
                    className={`flex flex-col gap-3 p-4 rounded-xl bg-[#080f28]/90 border ${theme.cardBorder} shadow-md`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span
                        className={`text-xs font-bold ${theme.badgeText} font-mono uppercase`}
                      >
                        {practiceTitle}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-500/30">
                        SCORE: {item.score ?? 100}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 py-2">
                      {finalArray.map((val: number, boxIdx: number) => (
                        <NumberedBox
                          key={`box-${idx}-${boxIdx}`}
                          value={val}
                          index={boxIdx}
                          role="sorted"
                          size="sm"
                        />
                      ))}
                    </div>

                    <div
                      className={`grid ${
                        moduleId === "insertion" || moduleId === "merge" ? "grid-cols-4" : "grid-cols-3"
                      } gap-1 pt-2 border-t border-white/5 text-[10px] font-mono text-white/60 text-center`}
                    >
                      <div>
                        <span className="block text-white/30 text-[9px]">COMP.</span>
                        <span className="text-cyan-300 font-bold">{item.comparisons ?? 0}</span>
                      </div>
                      {moduleId === "merge" ? (
                        <>
                          <div>
                            <span className="block text-white/30 text-[9px]">BUFFER</span>
                            <span className="text-amber-300 font-bold">{item.writesInBuffer ?? 0}</span>
                          </div>
                          <div>
                            <span className="block text-white/30 text-[9px]">VETOR</span>
                            <span className="text-teal-400 font-bold">{item.writesInMain ?? 0}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <span className="block text-white/30 text-[9px]">
                              {moduleId === "insertion"
                                ? "DESLOC."
                                : moduleId === "selection"
                                  ? "TRANSF."
                                  : "TROCAS"}
                            </span>
                            <span className="text-purple-400 font-bold">
                              {moduleId === "insertion" ? (item.shifts ?? 0) : (item.swaps ?? 0)}
                            </span>
                          </div>
                          {moduleId === "insertion" && (
                            <div>
                              <span className="block text-white/30 text-[9px]">INSERÇÕES</span>
                              <span className="text-amber-300 font-bold">{item.insertions ?? 0}</span>
                            </div>
                          )}
                        </>
                      )}
                      <div>
                        <span className="block text-white/30 text-[9px]">ERROS</span>
                        <span
                          className={
                            item.errors > 0
                              ? "text-red-400 font-bold"
                              : "text-white/40"
                          }
                        >
                          {item.errors ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Síntese Pedagógica */}
        <section
          className={`w-full p-4 rounded-xl ${theme.badgeBg} border ${theme.badgeBorder} flex flex-col gap-2`}
        >
          <span className={`text-xs font-bold ${theme.badgeText} font-mono uppercase tracking-wider`}>
            {theme.pedagogicalTitle}
          </span>
          <p className="text-xs sm:text-sm text-slate-100 leading-relaxed" style={{ fontFamily: "'Exo 2', sans-serif" }}>
            {theme.pedagogicalText}
          </p>
        </section>

        {/* Destaque Caso Especial: Early Exit para Bubble Sort */}
        {moduleId === "bubble" && (isChallengeUnlocked || onStartChallenge) && (
          <section
            className="w-full p-5 rounded-xl bg-amber-950/30 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4"
            aria-label="Desbloqueio do Caso Especial Early Exit"
          >
            <div className="flex flex-col gap-1 text-left">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-amber-300 font-bold tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                CASO ESPECIAL DESBLOQUEADO
              </div>
              <h3
                className="text-lg font-bold text-white tracking-wide"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                MODO DESAFIO: EARLY EXIT
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed" style={{ fontFamily: "'Exo 2', sans-serif" }}>
                Com o conjunto regular concluído, experimente a variante otimizada capaz de interromper o laço quando nenhuma troca ocorrer.
              </p>
            </div>

            {onStartChallenge && (
              <GameButton
                onClick={onStartChallenge}
                variant="primary"
                size="md"
                icon="⚡"
                className="shrink-0 whitespace-nowrap"
              >
                INICIAR DESAFIO
              </GameButton>
            )}
          </section>
        )}

        {/* Ações Finais */}
        <div className="flex flex-wrap items-center justify-center gap-4 w-full pt-4">
          <GameButton
            onClick={handleRepeat}
            variant="secondary"
            size="md"
            icon="↺"
            className="min-w-[180px]"
          >
            REPETIR PRÁTICAS
          </GameButton>

          {onOpenSelector && (
            <GameButton
              onClick={onOpenSelector}
              variant="secondary"
              size="md"
              icon="☰"
              className="min-w-[180px]"
            >
              SELETOR DE PRÁTICAS
            </GameButton>
          )}

          <GameButton
            onClick={onReturnHome}
            variant="primary"
            size="md"
            icon="⌂"
            className="min-w-[180px]"
          >
            VOLTAR AO HUB
          </GameButton>
        </div>

        {/* Rodapé Descritivo */}
        <footer className="text-center pt-2">
          <span className="text-[10px] text-white/30 tracking-widest font-mono uppercase">
            ESTAÇÃO DE CLASSIFICAÇÃO • MÓDULO {theme.name} (PRÁTICAS REGULARES CONCLUÍDAS)
          </span>
        </footer>
      </div>
    </main>
  );
}
