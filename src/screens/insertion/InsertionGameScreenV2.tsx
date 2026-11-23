import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  calculateInsertionSortProgress,
  createInsertionSortState,
  executeInsertionStep,
  getInsertionPracticeDefinition,
  type InsertionDecision,
  type InsertionPracticeLevel,
  type InsertionSortState,
} from "../../game/sorting/insertion";
import { calculateProtocolScore } from "../../game/session";
import type { SeedInput } from "../../game/generation";
import type { InsertionPracticeCompleteData } from "../InsertionGameScreen";
import InsertionConveyorTrack from "./InsertionConveyorTrack";
import InsertionDecisionControls from "./InsertionDecisionControls";
import InsertionTechnicalDetails from "./InsertionTechnicalDetails";

export interface InsertionGameScreenV2Props {
  onComplete: (data: InsertionPracticeCompleteData) => void;
  initialArray?: readonly number[];
  level?: InsertionPracticeLevel;
  seed?: SeedInput;
  practiceTitle?: string;
  onBackToHub?: () => void;
  onResetPractice?: () => void;
}

const DEFAULT_BASIC_ARRAY = [5, 2, 4, 1];

export default function InsertionGameScreenV2({
  onComplete,
  initialArray = DEFAULT_BASIC_ARRAY,
  level = "basic",
  seed = "",
  practiceTitle = "PRÁTICA BÁSICA",
  onBackToHub,
  onResetPractice,
}: InsertionGameScreenV2Props) {
  const [gameState, setGameState] = useState<InsertionSortState>(() =>
    createInsertionSortState(initialArray)
  );
  const [animatingShiftIndex, setAnimatingShiftIndex] = useState<number | null>(null);
  const [animatingInsert, setAnimatingInsert] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [isCompactViewport, setIsCompactViewport] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.innerHeight < 860 : false
  );
  const [feedback, setFeedback] = useState<{
    text: string;
    type: "success" | "warning" | "info";
  } | null>(null);

  const startTimeRef = useRef<number>(Date.now());
  const hintsUsedRef = useRef<number>(0);
  const isActionLockedRef = useRef<boolean>(false);
  const completedCalledRef = useRef<boolean>(false);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setIsCompactViewport(window.innerHeight < 860);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current !== null) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  const practiceDefinition = getInsertionPracticeDefinition(level);
  const progressPercent = calculateInsertionSortProgress(gameState);

  const triggerCompletion = useCallback(
    (finalState: InsertionSortState) => {
      if (completedCalledRef.current) return;
      completedCalledRef.current = true;

      const elapsedTimeMs = Math.max(0, Date.now() - startTimeRef.current);
      const score = calculateProtocolScore({
        errors: finalState.errors,
        hintsUsed: hintsUsedRef.current,
      });

      onComplete({
        protocol: "insertion",
        level,
        practiceDefinition,
        initialArray: [...finalState.initialValues],
        finalArray: finalState.currentValues.filter((v): v is number => v !== null),
        comparisons: finalState.comparisons,
        shifts: finalState.shifts,
        insertions: finalState.insertions,
        errors: finalState.errors,
        hintsUsed: hintsUsedRef.current,
        score,
        elapsedTimeMs,
        history: finalState.history,
        seed,
      });
    },
    [level, onComplete, practiceDefinition, seed]
  );

  const handleDecision = (decision: InsertionDecision) => {
    if (isActionLockedRef.current || gameState.completed) return;

    const beforeState = gameState;
    const result = executeInsertionStep(gameState, decision);

    if (result.valid) {
      setShowHint(false);

      if (decision === "SHIFT_RIGHT") {
        const shiftedVal = beforeState.currentValues[beforeState.j];
        const shiftIdx = beforeState.j;

        isActionLockedRef.current = true;
        setAnimatingShiftIndex(shiftIdx);
        setFeedback({
          text: `Correto! O número ${shiftedVal} é maior que a chave ${beforeState.key} e deslizou para a direita abrindo espaço. A chave continua suspensa!`,
          type: "success",
        });

        animationTimeoutRef.current = setTimeout(() => {
          animationTimeoutRef.current = null;
          setGameState(result.state);
          setAnimatingShiftIndex(null);
          isActionLockedRef.current = false;
        }, 350);
      } else {
        // decision === "INSERT_KEY"
        const key = beforeState.key;

        isActionLockedRef.current = true;
        setAnimatingInsert(true);
        setFeedback({
          text: `Perfeito! Não precisamos abrir mais espaço; a chave ${key} desceu e encaixou na vaga aberta.`,
          type: "success",
        });

        animationTimeoutRef.current = setTimeout(() => {
          animationTimeoutRef.current = null;
          setGameState(result.state);
          setAnimatingInsert(false);
          isActionLockedRef.current = false;
        }, 350);
      }
    } else {
      // Erro pedagógico: estado não avança, errors += 1
      setGameState(result.state);

      if (decision === "INSERT_KEY") {
        const compared = beforeState.currentValues[beforeState.j];
        setFeedback({
          text: `Atenção: o número ${compared} ainda é maior que a chave ${beforeState.key}! Desloque-o para abrir espaço antes de pousar a chave.`,
          type: "warning",
        });
      } else {
        const compared = beforeState.currentValues[beforeState.j];
        setFeedback({
          text: `Atenção: o número ${compared} não é maior que a chave ${beforeState.key}. A chave já pode ser encaixada na vaga atual!`,
          type: "warning",
        });
      }
    }
  };

  const handleToggleHint = () => {
    if (!showHint) {
      hintsUsedRef.current += 1;
      setHintsUsed((prev) => prev + 1);
    }
    setShowHint((prev) => !prev);
  };

  const handleReset = () => {
    if (animationTimeoutRef.current !== null) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    setGameState(createInsertionSortState(initialArray));
    setAnimatingShiftIndex(null);
    setAnimatingInsert(false);
    setShowHint(false);
    setHintsUsed(0);
    hintsUsedRef.current = 0;
    startTimeRef.current = Date.now();
    completedCalledRef.current = false;
    isActionLockedRef.current = false;
    setFeedback(null);
    onResetPractice?.();
  };

  const boxSize = isCompactViewport ? "md" : "lg";

  return (
    <div className="min-h-screen bg-[#070b19] text-slate-100 flex flex-col items-center py-3 sm:py-4 px-4 sm:px-6 pb-12">
      {/* Barra de Navegação Superior */}
      <header className="w-full max-w-4xl flex items-center justify-between pb-2.5 border-b border-amber-500/20 mb-3">
        <button
          type="button"
          onClick={onBackToHub}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-amber-300 font-mono transition-colors cursor-pointer"
        >
          <span>←</span>
          <span>Voltar ao Hub</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 font-mono text-amber-300 font-bold uppercase tracking-wider">
            Insertion Sort • {practiceTitle}
          </span>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-slate-200 font-mono underline cursor-pointer"
          >
            Reiniciar
          </button>
        </div>
      </header>

      {/* Conteúdo Principal Compactado para 1366x768 */}
      <main className="w-full max-w-4xl flex flex-col items-center gap-3.5">
        {/* Barra de Progresso Sutil Integrada (sem duplicar card de Passada) */}
        <div
          className="w-full bg-slate-900/60 rounded-full h-1.5 overflow-hidden border border-slate-800"
          aria-label={`Progresso da prática: ${progressPercent}%`}
        >
          <div
            className="h-full bg-amber-400 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Área Operacional da Esteira e Trilho Aéreo */}
        <InsertionConveyorTrack
          gameState={gameState}
          animatingShiftIndex={animatingShiftIndex}
          animatingInsert={animatingInsert}
          showIndex={showTechnicalDetails}
          boxSize={boxSize}
          progressPercent={progressPercent}
        />

        {/* Botoeira Contextual com Ações Derivadas da Engine */}
        {!gameState.completed ? (
          <InsertionDecisionControls
            gameState={gameState}
            onDecision={handleDecision}
            disabled={animatingShiftIndex !== null || animatingInsert}
            feedback={feedback}
            showHint={showHint}
            onToggleHint={handleToggleHint}
          />
        ) : (
          /* Card de Conclusão da Prática */
          <div
            role="region"
            aria-label="Conclusão da Prática Básica"
            className="w-full max-w-xl bg-[#0d1635]/95 border border-emerald-500/40 rounded-2xl p-6 sm:p-7 shadow-2xl flex flex-col items-center gap-5 text-center animate-fadeIn"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300 text-2xl font-bold">
              ✓
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Prática Básica Concluída!
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                Todas as cargas foram devidamente comparadas e inseridas em suas posições corretas.
              </p>
            </div>

            {/* Resumo Factual das Métricas */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#090d1f] p-3 rounded-xl border border-slate-800 text-xs font-mono">
              <div className="flex flex-col items-center">
                <span className="text-slate-500">Comparações</span>
                <span className="text-cyan-300 font-bold text-sm">{gameState.comparisons}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-slate-500">Deslocamentos</span>
                <span className="text-cyan-300 font-bold text-sm">{gameState.shifts}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-slate-500">Inserções</span>
                <span className="text-amber-300 font-bold text-sm">{gameState.insertions}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-slate-500">Pontuação</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {calculateProtocolScore({ errors: gameState.errors, hintsUsed })}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center pt-2">
              <button
                type="button"
                onClick={() => triggerCompletion(gameState)}
                className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                Concluir Prática e Ver Resultados →
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition-all cursor-pointer"
              >
                Repetir Prática
              </button>
            </div>
          </div>
        )}

        {/* Detalhes Técnicos Opcionais (Nível 3) */}
        <InsertionTechnicalDetails
          gameState={gameState}
          onToggleOpen={setShowTechnicalDetails}
        />
      </main>
    </div>
  );
}
