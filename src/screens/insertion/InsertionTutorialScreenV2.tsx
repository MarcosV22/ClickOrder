import React, { useState, useRef } from "react";
import {
  createInsertionSortState,
  executeInsertionStep,
  INSERTION_TUTORIAL_INITIAL_ARRAY,
  type InsertionDecision,
  type InsertionSortState,
} from "../../game/sorting/insertion";
import InsertionConveyorTrack from "./InsertionConveyorTrack";
import InsertionDecisionControls from "./InsertionDecisionControls";
import InsertionPredictionCard from "./InsertionPredictionCard";
import InsertionConceptualCheckpoint from "./InsertionConceptualCheckpoint";
import InsertionTechnicalDetails from "./InsertionTechnicalDetails";

export interface InsertionTutorialScreenV2Props {
  onComplete: () => void;
  onBack: () => void;
}

export default function InsertionTutorialScreenV2({
  onComplete,
  onBack,
}: InsertionTutorialScreenV2Props) {
  const [gameState, setGameState] = useState<InsertionSortState>(() =>
    createInsertionSortState(INSERTION_TUTORIAL_INITIAL_ARRAY)
  );
  const [hasPredicted, setHasPredicted] = useState(false);
  const [showConceptualCheckpoint, setShowConceptualCheckpoint] = useState(false);
  const [hasShownConceptualCheckpoint, setHasShownConceptualCheckpoint] = useState(false);
  const [animatingShiftIndex, setAnimatingShiftIndex] = useState<number | null>(null);
  const [animatingInsert, setAnimatingInsert] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<{
    text: string;
    type: "success" | "warning" | "info";
  } | null>({
    text: "O lote [4, 2, 3] entrou na esteira. A chave 2 subiu automaticamente ao trilho aéreo, abrindo uma vaga física. Compare o elemento observado com a chave.",
    type: "info",
  });

  const isActionLockedRef = useRef(false);

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
          text: `Correto! ${shiftedVal} é maior que a chave ${beforeState.key}. O ${shiftedVal} desliza para a direita abrindo espaço. A chave continua suspensa!`,
          type: "success",
        });

        setTimeout(() => {
          setGameState(result.state);
          setAnimatingShiftIndex(null);
          isActionLockedRef.current = false;

          // Exibe o checkpoint conceitual único após o primeiro shift do tutorial
          if (!hasShownConceptualCheckpoint) {
            setShowConceptualCheckpoint(true);
            setHasShownConceptualCheckpoint(true);
          }
        }, 400);
      } else {
        // decision === "INSERT_KEY"
        const key = beforeState.key;
        const targetHole = (beforeState.holeIndex ?? 0) + 1;

        isActionLockedRef.current = true;
        setAnimatingInsert(true);
        setFeedback({
          text: `Excelente! Não precisamos abrir mais espaço; a chave ${key} desce do trilho aéreo e encaixa na vaga #${targetHole}.`,
          type: "success",
        });

        setTimeout(() => {
          setGameState(result.state);
          setAnimatingInsert(false);
          isActionLockedRef.current = false;
        }, 400);
      }
    } else {
      // Erro pedagógico: estado não avança, errors += 1
      setGameState(result.state);

      if (decision === "INSERT_KEY") {
        const compared = beforeState.currentValues[beforeState.j];
        setFeedback({
          text: `Atenção: o número ${compared} ainda é maior que a chave ${beforeState.key}! Ele precisa deslizar para abrir espaço antes de encaixarmos a chave.`,
          type: "warning",
        });
      } else {
        const compared = beforeState.currentValues[beforeState.j];
        setFeedback({
          text: `Atenção: o número ${compared} não é maior que a chave ${beforeState.key}. Não precisamos movê-lo; a vaga atual já é a posição correta para a chave!`,
          type: "warning",
        });
      }
    }
  };

  const handleReset = () => {
    setGameState(createInsertionSortState(INSERTION_TUTORIAL_INITIAL_ARRAY));
    setHasPredicted(false);
    setShowConceptualCheckpoint(false);
    setHasShownConceptualCheckpoint(false);
    setAnimatingShiftIndex(null);
    setAnimatingInsert(false);
    setShowHint(false);
    isActionLockedRef.current = false;
    setFeedback({
      text: "Tutorial reiniciado. A chave 2 está no trilho suspenso. Compare o elemento observado com a chave.",
      type: "info",
    });
  };

  return (
    <div className="min-h-screen bg-[#070b19] text-slate-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      {/* Barra de Navegação Superior */}
      <header className="w-full max-w-4xl flex items-center justify-between pb-4 border-b border-amber-500/20 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-amber-300 font-mono transition-colors cursor-pointer"
        >
          <span>←</span>
          <span>Voltar ao Menu</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 font-mono text-amber-300 font-bold uppercase tracking-wider">
            Insertion Sort • Tutorial Guiado
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

      {/* Conteúdo Principal */}
      <main className="w-full max-w-4xl flex flex-col items-center gap-6">
        {/* Banner do Modelo Mental Canônico */}
        <div className="text-center space-y-1 mb-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Ciclo de Inserção com Chave e Vaga Física
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-mono">
            OBSERVE A CHAVE ➔ COMPARE PARA TRÁS ➔ ABRA ESPAÇO ➔ ENCAIXE
          </p>
        </div>

        {/* 1. Predição Inicial: apresentada antes da primeira tomada de decisão */}
        {!hasPredicted ? (
          <InsertionPredictionCard onConfirm={() => setHasPredicted(true)} />
        ) : showConceptualCheckpoint ? (
          /* 2. Checkpoint Conceitual: apresentado uma única vez após o primeiro shift */
          <InsertionConceptualCheckpoint
            onDismiss={() => setShowConceptualCheckpoint(false)}
          />
        ) : (
          /* 3. Área Operacional Interativa Normal */
          <>
            <InsertionConveyorTrack
              gameState={gameState}
              animatingShiftIndex={animatingShiftIndex}
              animatingInsert={animatingInsert}
            />

            {!gameState.completed ? (
              <InsertionDecisionControls
                gameState={gameState}
                onDecision={handleDecision}
                disabled={animatingShiftIndex !== null || animatingInsert}
                feedback={feedback}
                showHint={showHint}
                onToggleHint={() => setShowHint((prev) => !prev)}
              />
            ) : (
              /* Card de Conclusão do Tutorial */
              <div
                role="region"
                aria-label="Conclusão do Tutorial"
                className="w-full max-w-xl bg-[#0d1635]/95 border border-emerald-500/40 rounded-2xl p-6 sm:p-7 shadow-2xl flex flex-col items-center gap-5 text-center animate-fadeIn"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300 text-2xl font-bold">
                  ✓
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    Tutorial Concluído com Sucesso!
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                    Você dominou o modelo mental do Insertion Sort: a chave fica suspensa no trilho aéreo,
                    os elementos maiores deslizam para abrir espaço e a chave desce para ocupar a vaga exata.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full justify-center pt-2">
                  <button
                    type="button"
                    onClick={onComplete}
                    className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    Ir para a Prática Básica →
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition-all cursor-pointer"
                  >
                    Repetir Tutorial
                  </button>
                </div>
              </div>
            )}

            {/* Painel Técnico Retrátil (Nível 3) */}
            <InsertionTechnicalDetails gameState={gameState} />
          </>
        )}
      </main>
    </div>
  );
}
