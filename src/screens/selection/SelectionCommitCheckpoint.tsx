import React, { useState } from "react";
import type { SelectionSortState } from "../../game/sorting/selection";

export interface SelectionCommitCheckpointProps {
  gameState: SelectionSortState;
  onCommit: () => void;
  disabled?: boolean;
  requireCheckpoint?: boolean;
  onCheckpointAnswered?: (isCorrect: boolean) => void;
  feedback?: {
    text: string;
    type: "success" | "warning" | "info";
  } | null;
}

export default function SelectionCommitCheckpoint({
  gameState,
  onCommit,
  disabled = false,
  requireCheckpoint = false,
  onCheckpointAnswered,
  feedback,
}: SelectionCommitCheckpointProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnsweredCorrectly, setHasAnsweredCorrectly] = useState(false);
  const [checkpointError, setCheckpointError] = useState<string | null>(null);

  if (gameState.phase !== "COMMIT" || gameState.completed) {
    return null;
  }

  const targetIdx = gameState.i;
  const minIdx = gameState.minIndex;
  const targetVal = gameState.currentValues[targetIdx];
  const minVal = gameState.currentValues[minIdx];
  const willSwap = targetIdx !== minIdx;

  // Opções para o checkpoint: valores dos elementos da partição não ordenada
  const candidateValues = Array.from(
    new Set(gameState.currentValues.slice(targetIdx))
  ).sort((a, b) => a - b);

  const handleSelectCheckpoint = (val: number) => {
    setSelectedAnswer(val);
    if (val === minVal) {
      setHasAnsweredCorrectly(true);
      setCheckpointError(null);
      onCheckpointAnswered?.(true);
    } else {
      setHasAnsweredCorrectly(false);
      setCheckpointError(
        `Observe a varredura: o menor valor guardado até o final foi ${minVal}, e não ${val}.`
      );
      onCheckpointAnswered?.(false);
    }
  };

  const showCheckpoint = requireCheckpoint && !hasAnsweredCorrectly;

  return (
    <div className="w-full flex flex-col items-center gap-4 bg-[#0d1635]/90 border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-xl animate-fadeIn">
      {/* Cabeçalho de Consolidação */}
      <div className="text-center space-y-1">
        <span className="text-xs uppercase tracking-wider font-mono text-amber-400 font-semibold flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Varredura Concluída • Hora de Posicionar</span>
        </span>
        <h3 className="text-lg sm:text-xl font-bold text-slate-100">
          {willSwap ? (
            <span>
              Transferir o menor encontrado (<span className="text-amber-300 font-mono">{minVal}</span>) para a {targetIdx === 0 ? "primeira" : "próxima"} posição
            </span>
          ) : (
            <span>
              O menor valor (<span className="text-emerald-400 font-mono">{targetVal}</span>) já está na posição correta!
            </span>
          )}
        </h3>
      </div>

      {/* Checkpoint Pedagógico Interativo (quando ativado) */}
      {showCheckpoint ? (
        <div className="w-full max-w-lg bg-amber-950/30 border border-amber-500/40 rounded-xl p-4 flex flex-col items-center gap-3">
          <p className="text-sm font-semibold text-amber-200 text-center">
            Qual número deve ir para a {targetIdx === 0 ? "primeira" : "próxima"} posição?
          </p>
          <div className="flex flex-wrap gap-2.5 justify-center">
            {candidateValues.map((val) => (
              <button
                key={val}
                type="button"
                data-testid={`checkpoint-option-${val}`}
                onClick={() => handleSelectCheckpoint(val)}
                className={`w-12 h-12 rounded-xl text-base font-bold font-mono transition-all cursor-pointer border ${
                  selectedAnswer === val
                    ? val === minVal
                      ? "bg-emerald-600 text-white border-emerald-400 shadow-lg scale-105"
                      : "bg-rose-600 text-white border-rose-400"
                    : "bg-slate-800 text-slate-200 border-slate-700 hover:border-amber-400 hover:bg-slate-700"
                }`}
              >
                {val}
              </button>
            ))}
          </div>

          {checkpointError && (
            <div className="text-xs text-rose-300 font-medium text-center">
              {checkpointError}
            </div>
          )}
        </div>
      ) : (
        /* Explicação Causal de Posicionamento e Botão de Commit */
        <div className="w-full max-w-xl flex flex-col items-center gap-4">
          <div className="text-xs sm:text-sm text-slate-300 text-center leading-relaxed bg-[#0a1026] p-3.5 rounded-xl border border-slate-800">
            {willSwap ? (
              <span>
                Durante o <span className="font-mono text-cyan-300">INSPECT</span> nenhuma caixa foi movida. Agora no <span className="font-mono text-amber-300 font-bold">COMMIT</span>, o menor elemento (<strong className="text-purple-300">{minVal}</strong>) será trocado com o elemento da posição a preencher (<strong className="text-slate-300">{targetVal}</strong>).
              </span>
            ) : (
              <span>
                O menor elemento da partição não ordenada já se encontra na posição correta. Ela será concluída sem nenhuma troca física!
              </span>
            )}
          </div>

          {feedback && (
            <div
              role="status"
              aria-live="polite"
              className={`w-full max-w-xl p-3.5 rounded-xl border text-sm font-medium flex items-start gap-3 transition-all ${
                feedback.type === "success"
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                  : feedback.type === "warning"
                  ? "bg-amber-950/40 border-amber-500/40 text-amber-200"
                  : "bg-blue-950/40 border-blue-500/40 text-blue-200"
              }`}
            >
              <span className="text-sm font-mono font-bold select-none px-1.5 py-0.5 rounded border">
                {feedback.type === "success"
                  ? "✓"
                  : feedback.type === "warning"
                  ? "!"
                  : "i"}
              </span>
              <div className="flex-1 leading-snug">{feedback.text}</div>
            </div>
          )}

          <button
            type="button"
            data-testid="commit-button"
            onClick={onCommit}
            disabled={disabled}
            className="w-full max-w-md py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-amber-600 to-purple-600 hover:from-amber-500 hover:to-purple-500 active:from-amber-700 active:to-purple-700 shadow-lg shadow-purple-900/30 border border-amber-400/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 text-sm sm:text-base group"
          >
            <span>
              {willSwap
                ? `Posicionar ${minVal} na ${targetIdx === 0 ? "primeira" : "próxima"} posição ➔`
                : `Confirmar ${targetVal} na posição correta ➔`}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
