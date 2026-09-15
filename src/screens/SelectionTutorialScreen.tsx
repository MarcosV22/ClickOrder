import { useState, useRef } from "react";
import GameButton from "../components/GameButton";
import NumberedBox, { type BoxRole } from "../components/NumberedBox";
import InstructionPanel from "../components/InstructionPanel";
import {
  createSelectionSortState,
  executeSelectionInspection,
  commitSelectionPass,
  getSelectionSortedIndices,
  SELECTION_TUTORIAL_INITIAL_ARRAY,
  getSelectionTutorialStepInfo,
  getSelectionInspectionFeedback,
  getSelectionCommitFeedback,
  type SelectionInspectionDecision,
} from "../game/sorting/selection";

interface SelectionTutorialScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function SelectionTutorialScreen({
  onComplete,
  onBack,
}: SelectionTutorialScreenProps) {
  const [gameState, setGameState] = useState(() =>
    createSelectionSortState(SELECTION_TUTORIAL_INITIAL_ARRAY)
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatingPair, setAnimatingPair] = useState<{
    target: number;
    min: number;
  } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [message, setMessage] = useState<{
    text: string;
    type: "info" | "warning" | "success" | "error";
  }>({
    text: "O scanner iniciou no índice #1 (valor 4). Observe a carga inspecionada #2 (valor 1) e decida se é um NOVO MÍNIMO ou se deve MANTER CANDIDATO.",
    type: "info",
  });

  const isActionLockedRef = useRef(false);

  const stepInfo = getSelectionTutorialStepInfo(gameState);
  const sortedIndices = getSelectionSortedIndices(gameState);

  const handleInspectionDecision = (decision: SelectionInspectionDecision) => {
    if (isActionLockedRef.current || isAnimating || gameState.completed) return;
    if (gameState.phase !== "INSPECT") return;

    const beforeState = gameState;
    const result = executeSelectionInspection(gameState, decision);
    const feedback = getSelectionInspectionFeedback(result, beforeState, decision);

    if (result.valid) {
      setGameState(result.state);
      setMessage({ text: feedback, type: "success" });
      setShowHint(false);
    } else {
      setMessage({
        text: feedback,
        type: "warning",
      });
    }
  };

  const handleCommitPass = () => {
    if (isActionLockedRef.current || isAnimating || gameState.completed) return;
    if (gameState.phase !== "COMMIT") return;

    const targetIdx = gameState.i;
    const minIdx = gameState.minIndex;
    const beforeState = gameState;
    const result = commitSelectionPass(gameState);
    const feedback = getSelectionCommitFeedback(result, beforeState);

    if (result.valid) {
      setShowHint(false);
      if (result.didSwap) {
        isActionLockedRef.current = true;
        setIsAnimating(true);
        setAnimatingPair({ target: targetIdx, min: minIdx });
        setMessage({ text: feedback, type: "success" });

        setTimeout(() => {
          setGameState(result.state);
          setAnimatingPair(null);
          setIsAnimating(false);
          isActionLockedRef.current = false;
        }, 500);
      } else {
        setGameState(result.state);
        setMessage({ text: feedback, type: "success" });
      }
    } else {
      setMessage({
        text: feedback,
        type: "warning",
      });
    }
  };

  const handleToggleHint = () => {
    if (!showHint) {
      setHintsUsed((h) => h + 1);
    }
    setShowHint((prev) => !prev);
  };

  const handleReset = () => {
    setGameState(createSelectionSortState(SELECTION_TUTORIAL_INITIAL_ARRAY));
    setIsAnimating(false);
    setAnimatingPair(null);
    setShowHint(false);
    isActionLockedRef.current = false;
    setMessage({
      text: "Treinamento reiniciado. Observe a carga inspecionada e compare com o candidato atual.",
      type: "info",
    });
  };

  // Determinação de role e animação por caixa
  const getBoxRole = (idx: number): BoxRole => {
    if (sortedIndices.includes(idx)) {
      return "sorted";
    }

    const isTarget = idx === gameState.i;
    const isMin = idx === gameState.minIndex;
    const isScan = gameState.phase === "INSPECT" && idx === gameState.j;

    if (isTarget && isMin) return "target-min";
    if (isMin && isScan) return "scan-min";
    if (isTarget) return "target";
    if (isMin) return "min";
    if (isScan) return "scan";

    return "default";
  };

  const getBoxAnimation = (idx: number): "left" | "right" | null => {
    if (!animatingPair) return null;
    if (idx === animatingPair.target) return "right";
    if (idx === animatingPair.min) return "left";
    return null;
  };

  return (
    <div className="relative w-full h-full min-h-full overflow-y-auto bg-[#060b1a] bg-grid scanlines flex flex-col items-center justify-start pt-4 sm:pt-6 pb-16 sm:pb-20 px-4">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-72 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-5 max-w-2xl w-full">
        {/* Top bar */}
        <div className="w-full flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            <span>◀</span>
            <span>VOLTAR</span>
          </button>

          <div className="flex items-center gap-2">
            <span
              className="text-xs px-2.5 py-1 rounded bg-purple-950/60 border border-purple-500/30 text-purple-300 tracking-wider"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              TUTORIAL INTERATIVO
            </span>
          </div>

          <button
            onClick={handleReset}
            className="text-xs text-white/30 hover:text-white/70 transition-colors cursor-pointer"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            ↺ REINICIAR
          </button>
        </div>

        {/* Protocol badge & title */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span
              className="text-[11px] text-purple-400 tracking-[0.25em] uppercase"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              SELECTION SORT • SCANNER DE CARGA MÍNIMA
            </span>
          </div>
          <h2
            className="text-2xl font-black text-white tracking-tight"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            {stepInfo.title}
          </h2>
        </div>

        {/* Phase / Scanner status bar */}
        <div className="w-full flex items-center justify-around py-2.5 px-4 rounded-lg bg-[#0a1638]/60 border border-purple-500/20 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-white/40">FASE FSM:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded ${
                gameState.phase === "INSPECT"
                  ? "bg-cyan-950/70 text-cyan-300 border border-cyan-500/30"
                  : gameState.phase === "COMMIT"
                    ? "bg-amber-950/70 text-amber-300 border border-amber-500/30"
                    : "bg-emerald-950/70 text-emerald-300 border border-emerald-500/30"
              }`}
            >
              {gameState.phase}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-white/40">CANDIDATO MÍN:</span>
            <span className="text-purple-300 font-bold">
              #{gameState.minIndex + 1} (val {gameState.currentValues[gameState.minIndex]})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-white/40">ERROS:</span>
            <span
              className={gameState.errors > 0 ? "text-yellow-400 font-bold" : "text-white/60"}
            >
              {gameState.errors}
            </span>
          </div>
        </div>

        {/* Conveyor track with boxes */}
        <div className="w-full py-4 sm:py-5 px-3 sm:px-4 rounded-xl bg-[#0a1638]/40 border border-[#2a4a9e]/30 flex flex-col items-center gap-3">
          <div className="flex items-center justify-center gap-4">
            {gameState.currentValues.map((val, idx) => (
              <NumberedBox
                key={idx}
                index={idx}
                value={val}
                role={getBoxRole(idx)}
                animating={getBoxAnimation(idx)}
                disabled={isAnimating}
              />
            ))}
          </div>

          {/* Legend of roles */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 border-t border-white/5 text-[10px] font-mono text-white/50">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500/30 border border-amber-500" />
              ALVO (i)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-purple-500/30 border border-purple-500" />
              MÍN (Candidato)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-cyan-500/30 border border-cyan-400" />
              SCAN (Sensor j)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500/30 border border-emerald-500" />
              OK (Consolidado)
            </span>
          </div>
        </div>

        {/* Instruction panel */}
        <div className="w-full">
          <InstructionPanel message={message.text} type={message.type} />
        </div>

        {/* Hint Box (if activated) */}
        {showHint && (
          <div className="w-full p-3.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 flex flex-col gap-1.5 animate-fade-in">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-mono font-bold">
              <span>💡 DICA PEDAGÓGICA</span>
            </div>
            <p
              className="text-xs text-cyan-200/90 leading-relaxed"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {stepInfo.hint}
            </p>
          </div>
        )}

        {/* Action Controls based on FSM Phase */}
        <div className="w-full flex flex-col items-center gap-3">
          {gameState.completed ? (
            <div className="flex flex-col items-center gap-3 w-full max-w-sm">
              <div className="text-center p-4 rounded-lg bg-emerald-950/40 border border-emerald-500/30 w-full">
                <span className="text-emerald-400 text-lg font-bold block mb-1">
                  ✓ TUTORIAL CONCLUÍDO!
                </span>
                <p className="text-xs text-white/70 font-mono">
                  Você dominou a mecânica do Selection Sort: varredura contínua sem movimentação e no máximo uma única transferência por passada!
                </p>
              </div>

              <GameButton
                onClick={onComplete}
                variant="primary"
                size="md"
                icon="✓"
                className="w-full"
              >
                CONCLUIR TUTORIAL
              </GameButton>
            </div>
          ) : gameState.phase === "INSPECT" ? (
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="flex items-center justify-center gap-3 sm:gap-4 w-full max-w-md">
                <GameButton
                  onClick={() => handleInspectionDecision("SELECT_NEW_MIN")}
                  variant="primary"
                  size="md"
                  disabled={isAnimating}
                  icon="✦"
                  className="flex-1 border-purple-500/50 text-purple-300 hover:border-purple-400 shadow-lg shadow-purple-950/40"
                >
                  NOVO MÍNIMO
                </GameButton>

                <GameButton
                  onClick={() => handleInspectionDecision("KEEP_MIN")}
                  variant="secondary"
                  size="md"
                  disabled={isAnimating}
                  icon="="
                  className="flex-1"
                >
                  MANTER CANDIDATO
                </GameButton>
              </div>

              <button
                type="button"
                onClick={handleToggleHint}
                className="text-xs text-cyan-400/80 hover:text-cyan-300 transition-colors font-mono cursor-pointer flex items-center gap-1.5 mt-1"
              >
                <span>{showHint ? "▲ OCULTAR DICA" : "💡 PRECISA DE UMA DICA?"}</span>
                {hintsUsed > 0 && <span className="text-white/30">({hintsUsed})</span>}
              </button>
            </div>
          ) : (
            // Phase: COMMIT
            <div className="flex flex-col items-center gap-3 w-full max-w-md">
              <GameButton
                onClick={handleCommitPass}
                variant="primary"
                size="md"
                disabled={isAnimating}
                icon={stepInfo.canSwapOnCommit ? "⇄" : "✓"}
                className={`w-full ${
                  stepInfo.canSwapOnCommit
                    ? "border-amber-500/60 bg-amber-950/30 text-amber-300 hover:border-amber-400 hover:bg-amber-900/40 shadow-lg shadow-amber-950/40"
                    : "border-emerald-500/60 bg-emerald-950/30 text-emerald-300 hover:border-emerald-400 hover:bg-emerald-900/40 shadow-lg shadow-emerald-950/40"
                }`}
              >
                {stepInfo.canSwapOnCommit
                  ? "TRANSFERIR MENOR CARGA"
                  : "CONSOLIDAR POSIÇÃO"}
              </GameButton>

              <button
                type="button"
                onClick={handleToggleHint}
                className="text-xs text-cyan-400/80 hover:text-cyan-300 transition-colors font-mono cursor-pointer flex items-center gap-1.5"
              >
                <span>{showHint ? "▲ OCULTAR DICA" : "💡 EXPLICAR CONSOLIDAÇÃO"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
