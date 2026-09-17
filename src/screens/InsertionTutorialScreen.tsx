import { useState, useEffect, useRef } from "react";
import GameButton from "../components/GameButton";
import NumberedBox, { type BoxRole } from "../components/NumberedBox";
import InsertionHoleSlot from "../components/InsertionHoleSlot";
import InstructionPanel from "../components/InstructionPanel";
import {
  createInsertionSortState,
  executeInsertionStep,
  INSERTION_TUTORIAL_INITIAL_ARRAY,
  getInsertionTutorialStepInfo,
  getInsertionStepFeedback,
  type InsertionDecision,
} from "../game/sorting/insertion";

interface InsertionTutorialScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function InsertionTutorialScreen({
  onComplete,
  onBack,
}: InsertionTutorialScreenProps) {
  const [gameState, setGameState] = useState(() =>
    createInsertionSortState(INSERTION_TUTORIAL_INITIAL_ARRAY),
  );
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [message, setMessage] = useState<{
    text: string;
    type: "info" | "warning" | "success" | "error";
  }>({
    text: "O lote de cargas [4, 2, 3] entrou na esteira. A primeira chave (valor 2) subiu automaticamente ao trilho aéreo, abrindo uma vaga física na posição #2. Compare a carga sob inspeção com a chave suspensa.",
    type: "info",
  });

  const stepInfo = getInsertionTutorialStepInfo(gameState);

  const handleDecision = (decision: InsertionDecision) => {
    if (gameState.completed) return;

    const beforeState = gameState;
    const result = executeInsertionStep(gameState, decision);
    const feedback = getInsertionStepFeedback(result, beforeState, decision);

    if (result.valid) {
      setGameState(result.state);
      setMessage({ text: feedback, type: "success" });
      setShowHint(false);
    } else if (result.isPedagogicalError) {
      setGameState(result.state); // Preserva o estado com contador de erros incrementado
      setMessage({ text: feedback, type: "warning" });
    } else {
      setMessage({ text: feedback, type: "error" });
    }
  };

  const handleToggleHint = () => {
    if (!showHint) {
      setHintsUsed((h) => h + 1);
    }
    setShowHint((prev) => !prev);
  };

  const handleReset = () => {
    setGameState(createInsertionSortState(INSERTION_TUTORIAL_INITIAL_ARRAY));
    setShowHint(false);
    setMessage({
      text: "Tutorial reiniciado. A chave (valor 2) está suspensa no trilho aéreo. Observe a carga sob inspeção.",
      type: "info",
    });
  };

  // Determinação rigorosa de papel visual
  const getBoxRole = (idx: number): BoxRole => {
    if (gameState.completed) {
      return "sorted";
    }

    if (gameState.phase === "COMPARE_AND_SHIFT" && idx === gameState.j) {
      return "scan";
    }

    if (idx <= gameState.orderedBoundary) {
      return "ordered";
    }

    return "default";
  };

  const completionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameState.completed) {
      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      completionRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "nearest",
      });
    }
  }, [gameState.completed]);

  return (
    <div className="relative w-full h-full min-h-screen overflow-y-auto overflow-x-hidden bg-[#060b1a] bg-grid scanlines text-white flex flex-col items-center justify-start p-4 sm:p-6 md:p-8 pb-16 sm:pb-24 select-none">
      {/* Ambient glow matching amber insertion theme */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-500/5 rounded-full blur-[90px] pointer-events-none" />
      {/* Top Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <GameButton
            onClick={onBack}
            variant="ghost"
            size="sm"
            icon="←"
            className="text-white/60 hover:text-white"
          >
            VOLTAR
          </GameButton>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded">
                TUTORIAL INTERATIVO
              </span>
              <span className="text-xs font-mono text-white/40">
                INSERTION SORT
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-white mt-0.5">
              Desvio e Encaixe de Cargas
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <GameButton
            onClick={handleReset}
            variant="secondary"
            size="sm"
            icon="↺"
            className="text-white/70"
          >
            REINICIAR
          </GameButton>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-4xl flex flex-col items-center gap-6">
        {/* Status & Diagnostic Header */}
        <section className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="text-white/50">PROGRESSO:</span>
            <span className="font-bold text-amber-300">
              {gameState.completed
                ? "ESTABILIZADO"
                : `PASSADA ${stepInfo.passNumber} DE ${stepInfo.totalPasses}`}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-white/40">ERROS:</span>
              <span
                className={`font-bold ${
                  gameState.errors > 0 ? "text-amber-400" : "text-emerald-400"
                }`}
              >
                {gameState.errors}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-white/40">SHIFTS:</span>
              <span className="font-bold text-cyan-400">{gameState.shifts}</span>
            </div>
          </div>
        </section>

        {/* Workspace: Trilho Aéreo + Esteira */}
        <section className="w-full flex flex-col items-center gap-6 p-6 rounded-2xl bg-[#080f28]/95 border border-amber-500/20 shadow-2xl relative overflow-hidden">
          {/* 1. Trilho Aéreo (Overhead Rail) */}
          <div className="w-full flex flex-col items-center gap-2 pb-4 border-b border-dashed border-white/10">
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-amber-300/80 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>TRILHO AÉREO • CHAVE SUSPENSA</span>
            </div>

            <div className="h-32 flex items-center justify-center">
              {gameState.key !== null ? (
                <div className="flex flex-col items-center gap-1.5 animate-bounce-subtle">
                  <NumberedBox
                    value={gameState.key}
                    index={gameState.holeIndex ?? 0}
                    role="key"
                    size="lg"
                  />
                  <span className="text-[10px] font-mono text-amber-400 tracking-wider">
                    CHAVE ELEVADA (VALOR {gameState.key})
                  </span>
                </div>
              ) : (
                <div className="px-6 py-4 rounded-xl border border-dashed border-white/10 bg-white/5 text-xs font-mono text-white/30 text-center">
                  NENHUMA CHAVE SUSPENSA • ESTEIRA ESTABILIZADA
                </div>
              )}
            </div>
          </div>

          {/* 2. Esteira de Cargas (Conveyor Belt) */}
          <div className="w-full flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-white/50 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>ESTEIRA DE CARGAS • PARTIÇÃO OPERACIONAL</span>
            </div>

            <div className="flex items-center justify-center gap-4 sm:gap-6 py-4 px-6 rounded-xl bg-black/40 border border-white/5 w-full min-h-[140px] overflow-x-auto">
              {Array.from({ length: gameState.arrayLength }, (_, idx) => {
                const val = gameState.currentValues[idx];

                if (idx === gameState.holeIndex || val === null) {
                  return (
                    <InsertionHoleSlot
                      key={`hole-${idx}`}
                      index={idx}
                      size="lg"
                    />
                  );
                }

                return (
                  <NumberedBox
                    key={`box-${idx}`}
                    value={val}
                    index={idx}
                    role={getBoxRole(idx)}
                    size="lg"
                  />
                );
              })}
            </div>
          </div>

          {/* 3. Legenda Canônica de Papéis */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-3 border-t border-white/5 text-[10px] font-mono text-white/50">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500/40 border border-amber-400" />
              CHAVE (Suspensa)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded border border-dashed border-amber-400/80 bg-amber-950/40" />
              VAGA (Aberta)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-cyan-500/30 border border-cyan-400" />
              SCAN (Inspecionada A[j])
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500/30 border border-dashed border-emerald-400" />
              ORD (Ordenada Relativa)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-slate-800 border border-white/20" />
              PKG (Não Processada)
            </span>
          </div>
        </section>

        {/* Feedback / Instructions Panel */}
        <section className="w-full">
          <InstructionPanel message={message.text} type={message.type} />
        </section>

        {/* Dica Pedagógica Expansível */}
        {showHint && (
          <section className="w-full p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 flex flex-col gap-1.5 animate-fade-in">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-mono font-bold">
              <span>? DICA PEDAGÓGICA</span>
            </div>
            <p className="text-xs text-amber-100/90 leading-relaxed font-mono">
              {stepInfo.hint}
            </p>
          </section>
        )}

        {/* Action Controls */}
        <section className="w-full flex flex-col items-center gap-3">
          {gameState.completed ? (
            <div
              ref={completionRef}
              className="flex flex-col items-center gap-4 w-full max-w-md animate-fade-in"
            >
              <div className="text-center p-4 sm:p-5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 w-full shadow-xl">
                <span className="text-emerald-400 text-base sm:text-lg font-bold block mb-1">
                  ✓ TUTORIAL CONCLUÍDO COM SUCESSO!
                </span>
                <p className="text-xs text-white/80 font-mono leading-relaxed mb-2.5">
                  Você dominou o ciclo canônico do Insertion Sort:
                </p>
                <ul className="text-left text-xs font-mono text-emerald-200/90 space-y-1 list-disc list-inside">
                  <li>Elevação automática da chave (auto-lift) ao trilho aéreo;</li>
                  <li>Deslocamentos sucessivos para abrir espaço (SHIFT ≠ SWAP);</li>
                  <li>Encaixe preciso da chave na vaga (ORD relativo expandido).</li>
                </ul>
              </div>

              <GameButton
                onClick={onComplete}
                variant="primary"
                size="md"
                icon="✓"
                className="w-full shadow-lg shadow-emerald-950/40"
              >
                CONCLUIR TUTORIAL
              </GameButton>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 w-full max-w-md">
              <div className="flex items-center gap-3 w-full">
                <GameButton
                  onClick={() => handleDecision("SHIFT_RIGHT")}
                  variant="primary"
                  size="md"
                  disabled={!stepInfo.canShift}
                  icon="➔"
                  className="flex-1 border-cyan-500/50 text-cyan-200 hover:border-cyan-400 shadow-lg shadow-cyan-950/40"
                >
                  DESLOCAR CARGA
                </GameButton>

                <GameButton
                  onClick={() => handleDecision("INSERT_KEY")}
                  variant={stepInfo.canShift ? "secondary" : "primary"}
                  size="md"
                  disabled={!stepInfo.canInsert}
                  icon="⇣"
                  className="flex-1 border-amber-500/50 text-amber-200 hover:border-amber-400 shadow-lg shadow-amber-950/40"
                >
                  ENCAIXAR CHAVE
                </GameButton>
              </div>

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
                {hintsUsed > 0 && (
                  <span className="text-xs font-mono text-white/40">
                    ({hintsUsed})
                  </span>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
