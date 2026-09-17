/**
 * Tela de Conclusão do Conjunto de Práticas Regulares do Módulo Insertion Sort.
 *
 * Concebida para o modelo da Sorting Station como Plataforma Educacional:
 * - Apresenta a consolidação das práticas: Básica (n=4), Intermediária (n=5) e Avançada (n=6);
 * - Elimina vocabulário de "campanha" e "fases";
 * - Consolida telemetria factual: Comparações, Deslocamentos, Inserções, Erros, Dicas e Pontuação;
 * - Exibe vetores finais consolidados com NumberedBox (role="sorted");
 * - Botões canônicos padronizados: Repetir Práticas e Voltar ao Hub.
 */

import GameButton from "../components/GameButton";
import NumberedBox from "../components/NumberedBox";
import { formatElapsedTime } from "../game/session";
import type { InsertionPracticeCompleteData } from "./InsertionGameScreen";

export interface PracticeSetCompleteScreenProps {
  practiceResults: readonly InsertionPracticeCompleteData[];
  onRepeatPractices: () => void;
  onReturnHome: () => void;
}

export default function PracticeSetCompleteScreen({
  practiceResults,
  onRepeatPractices,
  onReturnHome,
}: PracticeSetCompleteScreenProps) {
  const totalComparisons = practiceResults.reduce((acc, r) => acc + r.comparisons, 0);
  const totalShifts = practiceResults.reduce((acc, r) => acc + r.shifts, 0);
  const totalInsertions = practiceResults.reduce((acc, r) => acc + r.insertions, 0);
  const totalErrors = practiceResults.reduce((acc, r) => acc + r.errors, 0);
  const totalHints = practiceResults.reduce((acc, r) => acc + r.hintsUsed, 0);
  const totalTimeMs = practiceResults.reduce((acc, r) => acc + r.elapsedTimeMs, 0);
  const avgScore =
    practiceResults.length > 0
      ? Math.round(
          practiceResults.reduce((acc, r) => acc + r.score, 0) /
            practiceResults.length,
        )
      : 100;

  return (
    <main
      className="relative w-full h-full min-h-screen overflow-y-auto overflow-x-hidden bg-[#060b1a] bg-grid scanlines flex flex-col items-center justify-start pt-6 sm:pt-8 pb-16 sm:pb-24 px-4 sm:px-8 text-white select-none"
      aria-label="Tela de Conclusão do Conjunto de Práticas do Insertion Sort"
    >
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[300px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-4xl w-full my-0">
        {/* Top status badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-950/40">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span
            className="text-[11px] text-amber-300 tracking-[0.25em] uppercase font-bold"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            MÓDULO EDUCACIONAL • INSERTION SORT
          </span>
        </div>

        {/* Hero Title */}
        <header className="text-center flex flex-col items-center gap-2">
          <h1
            className="text-4xl sm:text-5xl font-black text-white tracking-tight"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              textShadow: "0 0 35px rgba(245,158,11,0.35)",
            }}
          >
            CONJUNTO DE PRÁTICAS
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-cyan-400 to-emerald-400">
              CONCLUÍDO!
            </span>
          </h1>
          <p
            className="text-sm sm:text-base text-white/70 max-w-xl text-center leading-relaxed"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Você dominou a mecânica canônica por deslocamento: elevação da chave ao trilho aéreo, comparações regressivas na partição ordenada e encaixe direto na vaga.
          </p>
        </header>

        {/* Resumo Global das Métricas */}
        <section
          className="w-full panel-border bg-[#080f28]/90 rounded-xl p-5 sm:p-6"
          aria-label="Resumo Global de Métricas"
        >
          <div
            className="text-[10px] text-white/40 tracking-widest uppercase mb-4 text-center font-mono"
          >
            CONSOLIDAÇÃO FACTUAL DAS PRÁTICAS
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#0d1635]/80 border border-amber-500/20">
              <span className="text-[9px] tracking-widest text-white/50 uppercase mb-1 font-mono text-center">
                Práticas
              </span>
              <span
                className="text-2xl font-black text-amber-300"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                {practiceResults.length} / 3
              </span>
            </div>

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

            <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#0d1635]/80 border border-white/10">
              <span className="text-[9px] tracking-widest text-white/50 uppercase mb-1 font-mono text-center">
                Erros
              </span>
              <span
                className={`text-2xl font-black ${
                  totalErrors > 0 ? "text-red-400" : "text-white/40"
                }`}
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                {totalErrors}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#0d1635]/80 border border-emerald-500/20">
              <span className="text-[9px] tracking-widest text-white/50 uppercase mb-1 font-mono text-center">
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
        <section className="w-full flex flex-col gap-4" aria-label="Práticas Concluídas">
          <div className="text-[10px] text-white/40 tracking-widest uppercase text-center font-mono">
            VETORES CONSOLIDADOS POR NÍVEL
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {practiceResults.map((result) => (
              <div
                key={result.level}
                className="flex flex-col gap-3 p-4 rounded-xl bg-[#080f28]/90 border border-amber-500/20 shadow-md"
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-xs font-bold text-amber-300 font-mono uppercase">
                    {result.practiceDefinition.title}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-500/30">
                    SCORE: {result.score}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 py-2">
                  {result.finalArray.map((val, idx) => (
                    <NumberedBox
                      key={`box-${result.level}-${idx}`}
                      value={val}
                      index={idx}
                      role="sorted"
                      size="sm"
                    />
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-1 pt-2 border-t border-white/5 text-[10px] font-mono text-white/60 text-center">
                  <div>
                    <span className="block text-white/30 text-[9px]">COMP.</span>
                    <span className="text-cyan-300 font-bold">{result.comparisons}</span>
                  </div>
                  <div>
                    <span className="block text-white/30 text-[9px]">DESLOC.</span>
                    <span className="text-purple-400 font-bold">{result.shifts}</span>
                  </div>
                  <div>
                    <span className="block text-white/30 text-[9px]">INSERÇÕES</span>
                    <span className="text-amber-300 font-bold">{result.insertions}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Síntese Pedagógica */}
        <section className="w-full p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex flex-col gap-2">
          <span className="text-xs font-bold text-amber-300 font-mono uppercase">
            Síntese Conceitual do Insertion Sort
          </span>
          <p className="text-xs text-white/80 font-mono leading-relaxed">
            Ao contrário do Bubble Sort (comparações adjacentes em lote) e do Selection Sort (varredura completa para achar o menor elemento), o Insertion Sort constrói a partição ordenada progressivamente. Cargas maiores são deslocadas para a direita somente enquanto forem maiores que a chave, tornando o algoritmo especialmente eficiente para sequências quase ordenadas: O(n) no melhor caso.
          </p>
        </section>

        {/* Ações Finais */}
        <div className="flex flex-wrap items-center justify-center gap-4 w-full pt-4">
          <GameButton
            onClick={onRepeatPractices}
            variant="secondary"
            size="md"
            icon="↺"
            className="min-w-[200px]"
          >
            REPETIR PRÁTICAS
          </GameButton>

          <GameButton
            onClick={onReturnHome}
            variant="primary"
            size="md"
            icon="⌂"
            className="min-w-[200px]"
          >
            VOLTAR AO HUB
          </GameButton>
        </div>

        {/* Rodapé Descritivo */}
        <footer className="text-center pt-2">
          <span className="text-[10px] text-white/30 tracking-widest font-mono uppercase">
            ESTAÇÃO DE CLASSIFICAÇÃO • MÓDULO INSERTION SORT (PRÁTICAS REGULARES HOMOLOGADAS)
          </span>
        </footer>
      </div>
    </main>
  );
}
