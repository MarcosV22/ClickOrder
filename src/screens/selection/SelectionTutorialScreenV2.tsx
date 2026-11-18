import React, { useState, useRef } from "react";
import {
  createSelectionSortState,
  executeSelectionInspection,
  commitSelectionPass,
  getSelectionSortedIndices,
  SELECTION_TUTORIAL_INITIAL_ARRAY,
  type SelectionInspectionDecision,
} from "../../game/sorting/selection";
import SelectionConveyorTrack from "./SelectionConveyorTrack";
import SelectionDecisionControls from "./SelectionDecisionControls";
import SelectionCommitCheckpoint from "./SelectionCommitCheckpoint";
import SelectionPredictionCard from "./SelectionPredictionCard";
import SelectionTechnicalDetails from "./SelectionTechnicalDetails";

export interface SelectionTutorialScreenV2Props {
  onComplete: () => void;
  onBack: () => void;
}

export default function SelectionTutorialScreenV2({
  onComplete,
  onBack,
}: SelectionTutorialScreenV2Props) {
  const [gameState, setGameState] = useState(() =>
    createSelectionSortState(SELECTION_TUTORIAL_INITIAL_ARRAY)
  );
  const [hasPredicted, setHasPredicted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatingPair, setAnimatingPair] = useState<{
    target: number;
    min: number;
  } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<{
    text: string;
    type: "success" | "warning" | "info";
  } | null>({
    text: "O objetivo do Selection Sort é encontrar o menor elemento e colocá-lo na posição correta. Durante a busca, as caixas NÃO se movem!",
    type: "info",
  });

  const isActionLockedRef = useRef(false);

  const sortedIndices = getSelectionSortedIndices(gameState);

  const handleDecision = (decision: SelectionInspectionDecision) => {
    if (isActionLockedRef.current || isAnimating || gameState.completed) return;
    if (gameState.phase !== "INSPECT") return;

    const scanVal = gameState.currentValues[gameState.j];
    const minVal = gameState.currentValues[gameState.minIndex];
    const isSmaller = scanVal < minVal;

    const result = executeSelectionInspection(gameState, decision);

    if (result.valid) {
      setGameState(result.state);
      setShowHint(false);

      if (decision === "SELECT_NEW_MIN") {
        setFeedback({
          text: `Correto! ${scanVal} é menor que ${minVal}. Atualizamos a lembrança do menor para ${scanVal}. As caixas permanecem no lugar!`,
          type: "success",
        });
      } else {
        setFeedback({
          text: `Muito bem! ${scanVal} não é menor que ${minVal}. Continuamos lembrando do ${minVal} como o menor. Nenhuma caixa se move!`,
          type: "success",
        });
      }
    } else {
      if (decision === "SELECT_NEW_MIN") {
        setFeedback({
          text: `Atenção: ${scanVal} não é menor que ${minVal}. O menor da partição continua sendo ${minVal}.`,
          type: "warning",
        });
      } else {
        setFeedback({
          text: `Atenção: ${scanVal} é menor que ${minVal}! Deveríamos atualizar o menor para ${scanVal}.`,
          type: "warning",
        });
      }
    }
  };

  const handleCommit = () => {
    if (isActionLockedRef.current || isAnimating || gameState.completed) return;
    if (gameState.phase !== "COMMIT") return;

    const targetIdx = gameState.i;
    const minIdx = gameState.minIndex;
    const minVal = gameState.currentValues[minIdx];
    const targetVal = gameState.currentValues[targetIdx];

    const result = commitSelectionPass(gameState);

    if (result.valid) {
      setShowHint(false);
      if (result.didSwap) {
        isActionLockedRef.current = true;
        setIsAnimating(true);
        setAnimatingPair({ target: targetIdx, min: minIdx });
        setFeedback({
          text: `Perfeito! O menor elemento (${minVal}) foi transferido para a ${targetIdx === 0 ? "primeira" : "próxima"} posição através de uma única troca com ${targetVal}!`,
          type: "success",
        });

        setTimeout(() => {
          setGameState(result.state);
          setAnimatingPair(null);
          setIsAnimating(false);
          isActionLockedRef.current = false;
        }, 500);
      } else {
        setGameState(result.state);
        setFeedback({
          text: `Excelente! O valor ${targetVal} já estava na posição correta e foi consolidado sem trocas.`,
          type: "success",
        });
      }
    } else {
      setFeedback({
        text: result.errorReason ?? "Ação inválida no momento.",
        type: "warning",
      });
    }
  };

  const handleReset = () => {
    setGameState(createSelectionSortState(SELECTION_TUTORIAL_INITIAL_ARRAY));
    setHasPredicted(false);
    setIsAnimating(false);
    setAnimatingPair(null);
    setShowHint(false);
    isActionLockedRef.current = false;
    setFeedback({
      text: "Tutorial reiniciado. Siga os passos e observe a separação entre busca e movimentação.",
      type: "info",
    });
  };

  return (
    <div className="min-h-screen bg-[#070b19] text-slate-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      {/* Barra de Navegação Superior */}
      <header className="w-full max-w-4xl flex items-center justify-between pb-4 border-b border-purple-500/20 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-purple-300 font-mono transition-colors cursor-pointer"
        >
          <span>←</span>
          <span>Voltar ao Overview</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 font-semibold">
            Selection Sort • Tutorial Guiado
          </span>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-slate-200 underline font-mono cursor-pointer"
          >
            Reiniciar
          </button>
        </div>
      </header>

      <main className="w-full max-w-4xl flex flex-col items-center gap-6">
        {/* Banner Pedagógico Visual-First */}
        <div className="w-full text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Modelo Mental Canônico:</span>
            <span className="font-bold">PROCURE ➔ LEMBRE O MENOR ➔ POSICIONE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Como Funciona o Selection Sort
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl mx-auto">
            O algoritmo percorre as caixas procurando quem é o menor. Enquanto procura, nenhuma caixa sai do lugar. Só no final da varredura o menor é transferido para a posição correta!
          </p>
        </div>

        {/* Desafio Inicial de Previsão (Passo 0) */}
        {!hasPredicted ? (
          <SelectionPredictionCard
            initialValues={SELECTION_TUTORIAL_INITIAL_ARRAY}
            onConfirm={() => {
              setHasPredicted(true);
              setFeedback({
                text: "O scanner começou! Observe o número observado e compare com o menor guardado na memória.",
                type: "info",
              });
            }}
          />
        ) : (
          <>
            {/* Esteira Visual com as Caixas */}
            <SelectionConveyorTrack
              gameState={gameState}
              sortedIndices={sortedIndices}
              animatingPair={animatingPair}
              isAnimating={isAnimating}
            />

            {/* Controles de Decisão (Estado INSPECT) */}
            {gameState.phase === "INSPECT" && !gameState.completed && (
              <SelectionDecisionControls
                gameState={gameState}
                onDecision={handleDecision}
                disabled={isAnimating}
                feedback={feedback}
                showHint={showHint}
                onToggleHint={() => setShowHint((prev) => !prev)}
              />
            )}

            {/* Confirmação e Checkpoint (Estado COMMIT) */}
            {gameState.phase === "COMMIT" && !gameState.completed && (
              <SelectionCommitCheckpoint
                gameState={gameState}
                onCommit={handleCommit}
                disabled={isAnimating}
                requireCheckpoint={gameState.i === 0}
                feedback={feedback}
              />
            )}

            {/* Tela de Conclusão / Vitória do Tutorial */}
            {gameState.completed && (
              <div className="w-full bg-[#0d1635]/95 border border-emerald-500/40 rounded-2xl p-6 sm:p-8 text-center flex flex-col items-center gap-5 shadow-2xl animate-fadeIn">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 text-2xl font-bold">
                  ✓
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">
                    Treinamento Concluído com Sucesso!
                  </h2>
                  <p className="text-sm text-slate-300 max-w-lg mx-auto">
                    Você completou todas as passadas do Selection Sort no lote <span className="font-mono text-emerald-300 font-bold">[1, 3, 4]</span>.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg text-left text-xs font-mono">
                  <div className="p-3 bg-[#080d22] border border-slate-800 rounded-xl">
                    <span className="text-purple-400 font-semibold block mb-1">1. Busca Estática</span>
                    <span className="text-slate-400">Caixas não se movem enquanto o scanner varre.</span>
                  </div>
                  <div className="p-3 bg-[#080d22] border border-slate-800 rounded-xl">
                    <span className="text-purple-400 font-semibold block mb-1">2. Memória Mínima</span>
                    <span className="text-slate-400">Guarda apenas o índice do menor encontrado.</span>
                  </div>
                  <div className="p-3 bg-[#080d22] border border-slate-800 rounded-xl">
                    <span className="text-purple-400 font-semibold block mb-1">3. Troca Pontual</span>
                    <span className="text-slate-400">No máximo 1 movimentação física por passada.</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full max-w-md">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="py-3 px-5 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold transition-all cursor-pointer text-sm"
                  >
                    Repetir Tutorial
                  </button>
                  <button
                    type="button"
                    onClick={onComplete}
                    className="flex-1 py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 shadow-lg shadow-purple-900/30 border border-purple-400/40 cursor-pointer transition-all text-sm"
                  >
                    Ir para a Prática Básica ➔
                  </button>
                </div>
              </div>
            )}

            {/* Gaveta de Detalhes Técnicos e Pseudocódigo (Nível 3 Retrátil) */}
            <SelectionTechnicalDetails gameState={gameState} />
          </>
        )}
      </main>
    </div>
  );
}
