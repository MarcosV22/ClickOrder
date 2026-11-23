import React, { useEffect } from "react";
import type {
  InsertionSortState,
  InsertionDecision,
} from "../../game/sorting/insertion";

export interface InsertionDecisionControlsProps {
  gameState: InsertionSortState;
  onDecision: (decision: InsertionDecision) => void;
  onToggleHint?: () => void;
  showHint?: boolean;
  hintText?: string;
  disabled?: boolean;
  feedback?: {
    text: string;
    type: "success" | "warning" | "info";
  } | null;
}

export default function InsertionDecisionControls({
  gameState,
  onDecision,
  onToggleHint,
  showHint = false,
  hintText,
  disabled = false,
  feedback,
}: InsertionDecisionControlsProps) {
  const isCompare = gameState.phase === "COMPARE_AND_SHIFT";
  const isInsertReady = gameState.phase === "INSERT_READY";

  // Teclas de atalho 1 e 2 (e Enter para encaixe em INSERT_READY)
  useEffect(() => {
    if (disabled || gameState.completed) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (isCompare) {
        if (e.key === "1") {
          e.preventDefault();
          onDecision("SHIFT_RIGHT");
        } else if (e.key === "2") {
          e.preventDefault();
          onDecision("INSERT_KEY");
        }
      } else if (isInsertReady) {
        if (e.key === "1" || e.key === "Enter") {
          e.preventDefault();
          onDecision("INSERT_KEY");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [disabled, gameState.completed, isCompare, isInsertReady, onDecision]);

  if (gameState.completed) {
    return null;
  }

  const observedVal =
    isCompare && gameState.j >= 0 ? gameState.currentValues[gameState.j] : null;
  const keyVal = gameState.key;

  const defaultHint = isCompare
    ? "Compare o número observado com a chave. Se ele for maior, precisa abrir espaço deslizando para a direita."
    : "A cabeceira da esteira foi alcançada e todos os elementos maiores já abriram espaço. A chave agora pode ocupar a vaga.";

  const effectiveHint = hintText || defaultHint;

  return (
    <div className="w-full flex flex-col items-center gap-3 bg-[#0d1635]/85 border border-amber-500/20 rounded-2xl p-4 sm:p-5 shadow-xl">
      {/* Pergunta Central Dinâmica derivando do estado da engine */}
      <div className="text-center space-y-0.5">
        <span className="text-xs uppercase tracking-wider font-mono text-amber-400 font-semibold">
          {isCompare ? "Decisão de Deslocamento" : "Encaixe da Chave"}
        </span>

        {isCompare && observedVal !== null && keyVal !== null && (
          <h3 className="text-lg sm:text-xl font-bold text-slate-100">
            O número{" "}
            <span className="text-cyan-300 font-mono underline decoration-cyan-400/50 decoration-2 underline-offset-4">
              {observedVal}
            </span>{" "}
            precisa deslizar para abrir espaço para a chave{" "}
            <span className="text-amber-400 font-mono underline decoration-amber-400/50 decoration-2 underline-offset-4">
              {keyVal}
            </span>
            ?
          </h3>
        )}

        {isInsertReady && keyVal !== null && (
          <h3 className="text-lg sm:text-xl font-bold text-slate-100">
            A cabeceira da esteira foi alcançada. Deseja encaixar a chave{" "}
            <span className="text-amber-400 font-mono underline decoration-amber-400/50 decoration-2 underline-offset-4">
              {keyVal}
            </span>{" "}
            na vaga aberta?
          </h3>
        )}

        <p className="text-xs text-slate-400">
          {isCompare
            ? "Se o número for maior que a chave, ele desliza para a direita sem tocar na chave."
            : "Todos os elementos maiores já abriram espaço. A chave pode descer com segurança."}
        </p>
      </div>

      {/* Botoeira com ações derivadas do estado real da engine */}
      {isCompare ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-xl">
          {/* Opção 1: SHIFT_RIGHT */}
          <button
            type="button"
            data-testid="decision-shift-right"
            onClick={() => onDecision("SHIFT_RIGHT")}
            disabled={disabled}
            className="relative flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 active:bg-slate-700 text-slate-100 font-semibold border border-slate-600/60 shadow-lg hover:border-amber-400/60 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group text-sm sm:text-base"
            aria-label="Deslizar para a direita e abrir espaço (tecla 1)"
          >
            <kbd className="inline-flex items-center justify-center w-6 h-6 rounded bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-slate-300 group-hover:border-amber-400 group-hover:text-amber-300">
              1
            </kbd>
            <span>Deslizar para a direita</span>
          </button>

          {/* Opção 2: INSERT_KEY */}
          <button
            type="button"
            data-testid="decision-insert-key"
            onClick={() => onDecision("INSERT_KEY")}
            disabled={disabled}
            className="relative flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 active:bg-slate-700 text-slate-100 font-semibold border border-slate-600/60 shadow-lg hover:border-amber-400/60 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group text-sm sm:text-base"
            aria-label="Encaixar a chave na vaga atual (tecla 2)"
          >
            <kbd className="inline-flex items-center justify-center w-6 h-6 rounded bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-slate-300 group-hover:border-amber-400 group-hover:text-amber-300">
              2
            </kbd>
            <span>Encaixar a chave na vaga</span>
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md flex justify-center">
          <button
            type="button"
            data-testid="decision-insert-key"
            onClick={() => onDecision("INSERT_KEY")}
            disabled={disabled}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold border border-amber-300/40 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-base"
            aria-label="Encaixar a chave na vaga da cabeceira (tecla 1 ou Enter)"
          >
            <kbd className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-amber-950/40 border border-amber-700 text-xs font-mono font-bold text-amber-200">
              1 ou Enter
            </kbd>
            <span>Encaixar a chave na vaga</span>
          </button>
        </div>
      )}

      {/* Feedback Causal com Semântica Visual */}
      {feedback && (
        <div
          role="status"
          className={`w-full max-w-xl p-3 rounded-xl border text-sm flex items-start gap-3 animate-fadeIn ${
            feedback.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
              : feedback.type === "warning"
                ? "bg-amber-950/40 border-amber-500/40 text-amber-200"
                : "bg-cyan-950/40 border-cyan-500/40 text-cyan-200"
          }`}
        >
          <span className="text-base font-bold leading-none mt-0.5">
            {feedback.type === "success" ? "✓" : feedback.type === "warning" ? "!" : "i"}
          </span>
          <div className="flex-1 text-xs sm:text-sm leading-relaxed">{feedback.text}</div>
        </div>
      )}

      {/* Painel de Dica Opcional */}
      {onToggleHint && (
        <div className="w-full max-w-xl flex flex-col items-center gap-1.5">
          <button
            type="button"
            data-testid="toggle-hint-button"
            onClick={onToggleHint}
            className="text-xs text-slate-400 hover:text-amber-300 font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px] font-bold">
              ?
            </span>
            <span>{showHint ? "Ocultar Dica" : "Precisa de ajuda? Ver Dica"}</span>
          </button>

          {showHint && (
            <div
              role="note"
              className="w-full p-3 rounded-lg bg-slate-900/90 border border-slate-700 text-xs text-slate-300 leading-relaxed text-center animate-fadeIn"
            >
              <span className="font-bold text-amber-300">[Dica] </span>
              {effectiveHint}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
