/**
 * Tela de Prática Interativa do Módulo Insertion Sort (Marco P2.2-D).
 *
 * Princípios inegociáveis:
 * 1. A engine pura (InsertionSortState) é a ÚNICA fonte de verdade algorítmica.
 * 2. Paradigma educacional de exercícios ("PRÁTICA BÁSICA", "PRÁTICA INTERMEDIÁRIA", "PRÁTICA AVANÇADA"),
 *    sem fases, campanhas ou vocabulário legado.
 * 3. Trilho aéreo suspenso para chave (key !== null) e esteira com NumberedBox e InsertionHoleSlot.
 * 4. Regra estrita de ORD: somente caixas ocupadas com index <= orderedBoundary recebem ORD.
 *    A vaga aberta (holeIndex) dentro da partição nunca recebe ORD.
 * 5. Scanner em j composto: "ORD • SCAN" se j <= orderedBoundary.
 * 6. Métricas factuais industriais: COMPARAÇÕES, DESLOCAMENTOS, INSERÇÕES, ERROS, DICAS. Zero trocas.
 * 7. Action locks síncronos e prevenção de cliques simultâneos.
 * 8. Reinicialização idempotente preservando exatamente o mesmo vetor e a mesma seed.
 */

import { useEffect, useRef, useState } from "react";
import GameButton from "../components/GameButton";
import InstructionPanel from "../components/InstructionPanel";
import NumberedBox, { type BoxRole } from "../components/NumberedBox";
import InsertionHoleSlot from "../components/InsertionHoleSlot";
import {
  calculateInsertionSortProgress,
  createInsertionSortState,
  executeInsertionStep,
  getInsertionContextualHint,
  getInsertionPracticeDefinition,
  getInsertionStepFeedback,
  type InsertionDecision,
  type InsertionPracticeDefinition,
  type InsertionPracticeLevel,
  type InsertionSortState,
  type InsertionStepRecord,
} from "../game/sorting/insertion";
import {
  calculateProtocolScore,
  createPhaseSessionMetrics,
  formatElapsedTime,
  recordHintUsed,
  type PhaseSessionMetrics,
} from "../game/session";
import type { SeedInput } from "../game/generation";

export interface InsertionPracticeCompleteData {
  protocol: "insertion";
  level: InsertionPracticeLevel;
  practiceDefinition: InsertionPracticeDefinition;
  initialArray: readonly number[];
  finalArray: readonly number[];
  comparisons: number;
  shifts: number;
  insertions: number;
  errors: number;
  hintsUsed: number;
  score: number;
  elapsedTimeMs: number;
  history: readonly InsertionStepRecord[];
  seed?: SeedInput;
}

interface InsertionGameScreenProps {
  level: InsertionPracticeLevel;
  initialArray: readonly number[];
  seed?: SeedInput;
  onComplete: (data: InsertionPracticeCompleteData) => void;
  onResetPractice?: () => void;
  onBackToHub?: () => void;
}

export default function InsertionGameScreen({
  level,
  initialArray,
  seed,
  onComplete,
  onResetPractice,
  onBackToHub,
}: InsertionGameScreenProps) {
  const practiceDefinition = getInsertionPracticeDefinition(level);

  // --------------------------------------------------------------------------
  // 1. Estado Puro da Engine (Única Fonte de Verdade)
  // --------------------------------------------------------------------------
  const [gameState, setGameState] = useState<InsertionSortState>(() =>
    createInsertionSortState(initialArray),
  );

  // --------------------------------------------------------------------------
  // 2. Métricas da Sessão Educacional (Scaffolding Desacoplado da Engine)
  // --------------------------------------------------------------------------
  const [sessionMetrics, setSessionMetrics] = useState<PhaseSessionMetrics>(() =>
    createPhaseSessionMetrics(),
  );

  // --------------------------------------------------------------------------
  // 3. Estados Visuais, Animações e Feedback
  // --------------------------------------------------------------------------
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [animatingShiftIndex, setAnimatingShiftIndex] = useState<number | null>(null);
  const [animatingInsert, setAnimatingInsert] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  const [message, setMessage] = useState<{
    text: string;
    type: "info" | "warning" | "success" | "error";
  }>(() => ({
    text: `Prática iniciada com ${initialArray.length} cargas. A primeira carga da esteira já define a partição ordenada. A chave suspensa no trilho aéreo aguarda seu comando.`,
    type: "info",
  }));

  // Guarda síncrona contra múltiplos cliques rápidos e refs de ciclo
  const isActionLockedRef = useRef<boolean>(false);
  const completedCalledRef = useRef<boolean>(false);
  const animTimeoutRef = useRef<number | null>(null);
  const completeTimeoutRef = useRef<number | null>(null);

  const getNow = () =>
    typeof performance !== "undefined" && typeof performance.now === "function"
      ? performance.now()
      : Date.now();
  const startTimeRef = useRef<number>(getNow());

  // Limpeza de timers ao desmontar
  useEffect(() => {
    return () => {
      if (animTimeoutRef.current) window.clearTimeout(animTimeoutRef.current);
      if (completeTimeoutRef.current) window.clearTimeout(completeTimeoutRef.current);
    };
  }, []);

  // --------------------------------------------------------------------------
  // 4. Derivações Reativas da Engine
  // --------------------------------------------------------------------------
  const progressPercent = calculateInsertionSortProgress(gameState);
  const isInsertReady = gameState.phase === "INSERT_READY";
  const isCompareAndShift = gameState.phase === "COMPARE_AND_SHIFT";
  const comparedValue =
    gameState.j >= 0 ? gameState.currentValues[gameState.j] : null;

  // --------------------------------------------------------------------------
  // 5. Execução de Decisões do Estudante
  // --------------------------------------------------------------------------
  const handleDecision = (decision: InsertionDecision) => {
    if (
      isActionLockedRef.current ||
      isAnimating ||
      gameState.completed ||
      completedCalledRef.current
    ) {
      return;
    }

    // Trava síncrona imediata
    isActionLockedRef.current = true;

    // A UI impede a chamada de SHIFT_RIGHT em INSERT_READY
    if (decision === "SHIFT_RIGHT" && isInsertReady) {
      isActionLockedRef.current = false;
      return;
    }

    const stateBefore = gameState;
    const result = executeInsertionStep(stateBefore, decision);

    if (!result.valid) {
      isActionLockedRef.current = false;
      setGameState(result.state);
      const feedback = getInsertionStepFeedback(result, stateBefore, decision);
      setMessage({ text: feedback, type: "error" });
      return;
    }

    // Ação válida: fecha a dica se estiver aberta
    setShowHint(false);

    if (decision === "SHIFT_RIGHT") {
      setIsAnimating(true);
      setAnimatingShiftIndex(stateBefore.j);

      animTimeoutRef.current = window.setTimeout(() => {
        setGameState(result.state);
        setIsAnimating(false);
        setAnimatingShiftIndex(null);

        const feedback = getInsertionStepFeedback(result, stateBefore, decision);
        setMessage({ text: feedback, type: "success" });
        isActionLockedRef.current = false;
      }, 220);
    } else {
      // decision === "INSERT_KEY"
      setIsAnimating(true);
      setAnimatingInsert(true);

      animTimeoutRef.current = window.setTimeout(() => {
        setGameState(result.state);
        setIsAnimating(false);
        setAnimatingInsert(false);

        const feedback = getInsertionStepFeedback(result, stateBefore, decision);
        setMessage({ text: feedback, type: "success" });
        isActionLockedRef.current = false;

        // Se o algoritmo foi concluído, aciona conclusão com atraso suave
        if (result.state.completed && !completedCalledRef.current) {
          completedCalledRef.current = true;
          completeTimeoutRef.current = window.setTimeout(() => {
            const elapsed = Math.round(getNow() - startTimeRef.current);
            const score = calculateProtocolScore({
              errors: result.state.errors,
              hintsUsed: sessionMetrics.hintsUsed,
            });
            onComplete({
              protocol: "insertion",
              level,
              practiceDefinition,
              initialArray,
              finalArray: result.state.currentValues.filter(
                (v): v is number => v !== null,
              ),
              comparisons: result.state.comparisons,
              shifts: result.state.shifts,
              insertions: result.state.insertions,
              errors: result.state.errors,
              hintsUsed: sessionMetrics.hintsUsed,
              score,
              elapsedTimeMs: elapsed,
              history: result.state.history,
              seed,
            });
          }, 600);
        }
      }, 220);
    }
  };

  // --------------------------------------------------------------------------
  // 6. Manipulação de Dica Contextual
  // --------------------------------------------------------------------------
  const handleToggleHint = () => {
    if (!showHint) {
      setSessionMetrics((prev) => recordHintUsed(prev));
    }
    setShowHint((prev) => !prev);
  };

  // --------------------------------------------------------------------------
  // 7. Reinício do Exercício (Preserva estritamente o mesmo vetor e a mesma seed)
  // --------------------------------------------------------------------------
  const handleReset = () => {
    if (animTimeoutRef.current) window.clearTimeout(animTimeoutRef.current);
    if (completeTimeoutRef.current) window.clearTimeout(completeTimeoutRef.current);

    isActionLockedRef.current = false;
    completedCalledRef.current = false;
    setIsAnimating(false);
    setAnimatingShiftIndex(null);
    setAnimatingInsert(false);
    setShowHint(false);

    setGameState(createInsertionSortState(initialArray));
    setSessionMetrics(createPhaseSessionMetrics());
    startTimeRef.current = getNow();

    setMessage({
      text: `Exercício reiniciado. O mesmo vetor inicial foi recarregado. Analise a chave suspensa e comande a ação adequada.`,
      type: "info",
    });

    if (onResetPractice) {
      onResetPractice();
    }
  };

  // --------------------------------------------------------------------------
  // 8. Resolução de Papel Semântico de cada Carga na Esteira
  // --------------------------------------------------------------------------
  const getBoxRoleForIndex = (index: number): BoxRole => {
    if (gameState.completed) {
      return "sorted";
    }

    // Se estiver na posição do scanner j
    if (index === gameState.j) {
      if (index <= gameState.orderedBoundary) {
        return "ordered-scan";
      }
      return "scan";
    }

    // Se estiver estritamente dentro da partição ordenada
    if (index <= gameState.orderedBoundary) {
      return "ordered";
    }

    return "default";
  };

  return (
    <div className="flex flex-col w-full h-full min-h-screen bg-[#060b1a] bg-grid scanlines text-white select-none">
      {/* 1. Header Canônico da Prática Curricular */}
      <header className="flex flex-wrap items-center justify-between gap-4 w-full px-6 py-3.5 bg-[#080f28]/90 border-b border-amber-500/20 shadow-md">
        {/* Identificação do Módulo */}
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse" />
          <span
            className="text-amber-300 text-sm font-bold tracking-widest uppercase"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            MÓDULO: INSERTION SORT
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/60 border border-amber-500/30 text-amber-300">
            {practiceDefinition.title}
          </span>
        </div>

        {/* Barra de Progresso Factual do Exercício */}
        <div className="flex items-center gap-3 flex-1 max-w-xs sm:max-w-md mx-auto">
          <span
            className="text-[10px] text-white/50 tracking-widest uppercase font-mono hidden md:inline"
          >
            PROGRESSO:
          </span>
          <div className="flex-1 h-2 rounded-full bg-slate-800/80 overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-cyan-400 transition-all duration-300 shadow-[0_0_6px_#f59e0b]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span
            className="text-xs font-bold text-amber-300 font-mono min-w-[36px] text-right"
          >
            {progressPercent}%
          </span>
        </div>

        {/* Controles de Navegação e Reinício */}
        <div className="flex items-center gap-2">
          <GameButton
            onClick={handleReset}
            variant="secondary"
            size="sm"
            icon="↺"
            className="text-xs"
          >
            REINICIAR
          </GameButton>
          {onBackToHub && (
            <GameButton
              onClick={onBackToHub}
              variant="ghost"
              size="sm"
              icon="⌂"
              className="text-xs text-white/60 hover:text-white"
            >
              HUB
            </GameButton>
          )}
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col items-center justify-start max-w-5xl w-full mx-auto p-4 sm:p-6 gap-6">
        {/* Painel Descritivo da Prática */}
        <section className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#0a1232]/80 border border-amber-500/20 shadow-lg">
          <div className="flex flex-col gap-1">
            <span
              className="text-xs font-bold text-amber-300 tracking-wider uppercase font-mono"
            >
              {practiceDefinition.title} • {practiceDefinition.size} CARGAS
            </span>
            <p className="text-xs text-white/70 font-mono">
              {practiceDefinition.pedagogicalObjective}
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0d1635] border border-white/10 font-mono text-xs">
            <span className="text-white/40">FRONTEIRA ORD:</span>
            <span className="text-emerald-400 font-bold">
              0 .. #{gameState.orderedBoundary + 1}
            </span>
          </div>
        </section>

        {/* 2. Área Visual Integrada: Trilho Aéreo + Esteira Operacional */}
        <section
          className="w-full flex flex-col items-center gap-5 p-6 rounded-2xl bg-[#080f28]/95 border border-cyan-500/20 shadow-2xl relative overflow-hidden"
          aria-label="Área Operacional do Trilho e Esteira"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-amber-500/10 blur-[80px] pointer-events-none" />

          {/* TRILHO AÉREO */}
          <div className="w-full flex flex-col items-center gap-2 pb-4 border-b border-dashed border-white/10">
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-amber-400/80 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>TRILHO AÉREO DE SUSPENSÃO</span>
            </div>

            <div className="h-24 flex items-center justify-center">
              {gameState.key !== null && !gameState.completed ? (
                <div
                  className={`flex flex-col items-center gap-1 transition-transform duration-200 ${
                    animatingInsert ? "translate-y-8 opacity-75 scale-95" : ""
                  }`}
                >
                  <NumberedBox
                    value={gameState.key}
                    index={-1}
                    role="key"
                    badge="CHAVE"
                    size="lg"
                  />
                  <span className="text-[9px] font-mono font-bold text-amber-400 tracking-wider animate-bounce">
                    ▼ CARGA ISOLADA
                  </span>
                </div>
              ) : (
                <div className="px-6 py-3 rounded-lg border border-dashed border-white/10 bg-white/[0.02] text-xs font-mono text-white/30 tracking-wider">
                  TRILHO AÉREO LIVRE
                </div>
              )}
            </div>
          </div>

          {/* ESTEIRA OPERACIONAL */}
          <div className="w-full flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-cyan-400/80 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>ESTEIRA OPERACIONAL DE CARGAS</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-2 min-h-[96px]">
              {gameState.currentValues.map((val, idx) => {
                if (val === null) {
                  return (
                    <InsertionHoleSlot
                      key={`hole-${idx}`}
                      index={idx}
                      size="lg"
                    />
                  );
                }

                const role = getBoxRoleForIndex(idx);
                const isShiftAnimating = animatingShiftIndex === idx;

                return (
                  <NumberedBox
                    key={`box-${idx}-${val}`}
                    value={val}
                    index={idx}
                    role={role}
                    size="lg"
                    animating={isShiftAnimating ? "right" : null}
                  />
                );
              })}
            </div>
          </div>

          {/* EXPRESSÃO FORMAL RELACIONAL / CONDIÇÃO */}
          <div className="w-full max-w-lg mt-2 p-3 rounded-lg bg-[#0d1635]/90 border border-white/10 flex flex-col items-center gap-1 font-mono text-center">
            <span className="text-[10px] text-white/40 tracking-widest uppercase">
              AVALIAÇÃO DO PASSO ATUAL
            </span>

            {gameState.completed ? (
              <span className="text-sm font-bold text-emerald-400">
                ✓ LOTE COMPLETAMENTE ORDENADO
              </span>
            ) : isInsertReady ? (
              <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
                <span className="px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-xs">
                  j = -1
                </span>
                <span>• CABECEIRA DA ESTEIRA ALCANÇADA</span>
              </div>
            ) : isCompareAndShift && comparedValue !== null && gameState.key !== null ? (
              <div className="flex items-center gap-2 text-sm font-bold text-cyan-200">
                <span>A[{gameState.j}] ({comparedValue}) &gt; CHAVE ({gameState.key}) ?</span>
              </div>
            ) : (
              <span className="text-xs text-white/60">
                Aguardando próxima instrução da esteira.
              </span>
            )}
          </div>

          {/* Legenda Canônica de Papéis Visuais */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-3 border-t border-white/5 text-[10px] font-mono text-white/50">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500/40 border border-amber-400" />
              CHAVE (Trilho)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded border border-dashed border-amber-400/80 bg-amber-950/40" />
              VAGA (Aberta)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500/30 border border-dashed border-emerald-400" />
              ORD (Partição)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-cyan-500/30 border border-cyan-400" />
              ORD • SCAN (j)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-slate-800 border border-white/20" />
              PKG (Não Processada)
            </span>
          </div>
        </section>

        {/* 3. Painel de Feedback Pedagógico Imediato */}
        <section className="w-full">
          <InstructionPanel message={message.text} type={message.type} />
        </section>

        {/* 4. Dica Pedagógica Contextual Expansível */}
        {showHint && (
          <section className="w-full p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 flex flex-col gap-1.5 animate-fade-in shadow-lg">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-mono font-bold">
              <span>? DICA CONTEXTUAL PEDAGÓGICA</span>
            </div>
            <p className="text-xs text-amber-100/90 leading-relaxed font-mono">
              {getInsertionContextualHint(gameState)}
            </p>
          </section>
        )}

        {/* 5. Ações Operacionais Permitidas (GameButton Canônico) */}
        <section className="w-full flex flex-col items-center gap-3">
          {!gameState.completed && (
            <div className="flex flex-col items-center gap-3 w-full max-w-md">
              <div className="flex items-center gap-3 w-full">
                {/* Botão DESLOCAR CARGA (Disabled durante INSERT_READY) */}
                <GameButton
                  onClick={() => handleDecision("SHIFT_RIGHT")}
                  variant="primary"
                  size="md"
                  disabled={
                    isInsertReady ||
                    isAnimating ||
                    isActionLockedRef.current
                  }
                  icon="➔"
                  className="flex-1 border-cyan-500/50 text-cyan-200 hover:border-cyan-400 shadow-lg shadow-cyan-950/40 disabled:opacity-40"
                >
                  DESLOCAR CARGA
                </GameButton>

                {/* Botão ENCAIXAR CHAVE */}
                <GameButton
                  onClick={() => handleDecision("INSERT_KEY")}
                  variant={isInsertReady ? "primary" : "secondary"}
                  size="md"
                  disabled={isAnimating || isActionLockedRef.current}
                  icon="⇣"
                  className="flex-1 border-amber-500/50 text-amber-200 hover:border-amber-400 shadow-lg shadow-amber-950/40"
                >
                  ENCAIXAR CHAVE
                </GameButton>
              </div>

              {/* Botão de Dica Tipográfico */}
              <div className="flex items-center gap-2 mt-1">
                <GameButton
                  onClick={handleToggleHint}
                  variant="ghost"
                  size="sm"
                  icon={showHint ? "▲" : "?"}
                  className="text-amber-400 hover:text-amber-300"
                >
                  {showHint ? "OCULTAR DICA" : "PRECISA DE UMA DICA?"}
                </GameButton>
                {sessionMetrics.hintsUsed > 0 && (
                  <span className="text-xs font-mono text-white/40">
                    ({sessionMetrics.hintsUsed})
                  </span>
                )}
              </div>
            </div>
          )}
        </section>

        {/* 6. Painel de Telemetria Factual (Zero Trocas) */}
        <section
          className="w-full flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2 border-t border-white/5"
          aria-label="Painel de Telemetria Factual"
        >
          <div className="flex flex-col items-center px-4 py-2.5 rounded-lg bg-[#0d1635]/80 border border-white/10 min-w-[100px]">
            <span
              className="text-[9px] tracking-widest text-white/40 uppercase mb-0.5"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Comparações
            </span>
            <span
              className="text-xl font-bold text-cyan-300 glow-cyan"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              {gameState.comparisons}
            </span>
          </div>

          <div className="flex flex-col items-center px-4 py-2.5 rounded-lg bg-[#0d1635]/80 border border-white/10 min-w-[100px]">
            <span
              className="text-[9px] tracking-widest text-white/40 uppercase mb-0.5"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Deslocamentos
            </span>
            <span
              className="text-xl font-bold text-purple-400 glow-purple"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              {gameState.shifts}
            </span>
          </div>

          <div className="flex flex-col items-center px-4 py-2.5 rounded-lg bg-[#0d1635]/80 border border-white/10 min-w-[100px]">
            <span
              className="text-[9px] tracking-widest text-white/40 uppercase mb-0.5"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Inserções
            </span>
            <span
              className="text-xl font-bold text-amber-300 shadow-amber-400/20"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              {gameState.insertions}
            </span>
          </div>

          <div className="flex flex-col items-center px-4 py-2.5 rounded-lg bg-[#0d1635]/80 border border-white/10 min-w-[100px]">
            <span
              className="text-[9px] tracking-widest text-white/40 uppercase mb-0.5"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Erros
            </span>
            <span
              className={`text-xl font-bold ${
                gameState.errors > 0 ? "text-red-400" : "text-white/40"
              }`}
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              {gameState.errors}
            </span>
          </div>

          <div className="flex flex-col items-center px-4 py-2.5 rounded-lg bg-[#0d1635]/80 border border-white/10 min-w-[100px]">
            <span
              className="text-[9px] tracking-widest text-white/40 uppercase mb-0.5"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Dicas
            </span>
            <span
              className={`text-xl font-bold ${
                sessionMetrics.hintsUsed > 0 ? "text-amber-400" : "text-white/40"
              }`}
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              {sessionMetrics.hintsUsed}
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}
