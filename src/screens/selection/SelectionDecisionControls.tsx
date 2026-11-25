import React, { useEffect, useRef } from "react";
import type {
  SelectionSortState,
  SelectionInspectionDecision,
} from "../../game/sorting/selection";

export interface SelectionDecisionControlsProps {
  gameState: SelectionSortState;
  onDecision: (decision: SelectionInspectionDecision) => void;
  onToggleHint?: () => void;
  showHint?: boolean;
  hintText?: string;
  disabled?: boolean;
  feedback?: {
    text: string;
    type: "success" | "warning" | "info";
  } | null;
}

export default function SelectionDecisionControls({
  gameState,
  onDecision,
  onToggleHint,
  showHint = false,
  hintText,
  disabled = false,
  feedback,
}: SelectionDecisionControlsProps) {
  // Teclas de atalho 1 e 2
  useEffect(() => {
    if (disabled || gameState.phase !== "INSPECT" || gameState.completed) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar se estiver focando em input ou textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "1") {
        e.preventDefault();
        onDecision("SELECT_NEW_MIN");
      } else if (e.key === "2") {
        e.preventDefault();
        onDecision("KEEP_MIN");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [disabled, gameState.phase, gameState.completed, onDecision]);

  if (gameState.phase !== "INSPECT" || gameState.completed) {
    return null;
  }

  const scanVal = gameState.currentValues[gameState.j];
  const minVal = gameState.currentValues[gameState.minIndex];
  const hintCardRef = useRef<HTMLDivElement | null>(null);

  const handleExplicitHintClick = () => {
    const willOpen = !showHint;
    onToggleHint?.();
    if (willOpen) {
      requestAnimationFrame(() => {
        const el = hintCardRef.current;
        if (!el || typeof window === "undefined") return;
        const rect = el.getBoundingClientRect();
        if (rect.bottom > window.innerHeight - 8 && typeof el.scrollIntoView === "function") {
          const prefersReduced =
            typeof window.matchMedia === "function" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          el.scrollIntoView({
            behavior: prefersReduced ? "auto" : "smooth",
            block: "nearest",
          });
        }
      });
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-3 bg-[#0d1635]/80 border border-purple-500/30 rounded-2xl p-4 sm:p-5 shadow-xl">
      {/* Cabeçalho da Decisão + Dica Subordinada (Nível 2) */}
      <div className="w-full max-w-xl flex items-center justify-between px-1">
        <span className="text-xs uppercase tracking-wider font-mono text-purple-400 font-semibold">
          Decisão de Comparação
        </span>
        {onToggleHint && (
          <button
            type="button"
            data-testid="toggle-hint-button"
            onClick={handleExplicitHintClick}
            aria-expanded={showHint}
            className="text-xs text-purple-300 hover:text-purple-200 flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-purple-950/40 border border-purple-500/30 hover:border-purple-500/50 transition-all cursor-pointer font-mono"
            aria-label="Pedir dica pedagógica"
          >
            <span className="w-4 h-4 rounded-full bg-purple-900/60 border border-purple-400/40 flex items-center justify-center text-[10px] font-bold">
              ?
            </span>
            <span>{showHint ? "Ocultar dica" : "Dica"}</span>
          </button>
        )}
      </div>

      {/* Pergunta Central Dinâmica */}
      <div className="text-center space-y-1">
        <h3 className="text-lg sm:text-xl font-bold text-slate-100">
          O número <span className="text-cyan-300 font-mono underline decoration-cyan-400/50 decoration-2 underline-offset-4">{scanVal}</span> é menor que o menor atual, <span className="text-purple-300 font-mono underline decoration-purple-400/50 decoration-2 underline-offset-4">{minVal}</span>?
        </h3>
        <p className="text-xs text-slate-400">
          Lembre-se: as caixas permanecem estáticas. Você está apenas decidindo quem guardar na memória como o menor.
        </p>
      </div>

      {/* Dica Pedagógica em Nível 2 posicionada subordinadamente junto à pergunta e botoeira */}
      {showHint && (
        <div
          ref={hintCardRef}
          data-testid="selection-hint-panel"
          role="region"
          aria-label="Orientação pedagógica"
          className="p-3 w-full max-w-xl bg-purple-950/50 border border-purple-500/35 rounded-xl text-xs text-purple-100/95 leading-relaxed font-sans animate-fadeIn"
        >
          <strong className="text-purple-300 font-semibold block mb-0.5">
            Orientação Pedagógica:
          </strong>
          {hintText ??
            `Compare o número observado (${scanVal}) com o menor atual (${minVal}). Se o observado for menor, atualizamos a lembrança; se não for, mantemos o menor. Durante a busca, nada troca de lugar!`}
        </div>
      )}

      {/* Dois botões neutros e balanceados (sem spoiler de cores antes do clique) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-xl">
        <button
          type="button"
          data-testid="decision-select-new-min"
          onClick={() => onDecision("SELECT_NEW_MIN")}
          disabled={disabled}
          className="relative flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 active:bg-slate-700 text-slate-100 font-semibold border border-slate-600/60 shadow-lg hover:border-purple-400/60 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group text-sm sm:text-base"
          aria-label={`Sim, ${scanVal} é o novo menor (tecla 1)`}
        >
          <kbd className="inline-flex items-center justify-center w-6 h-6 rounded bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-slate-300 group-hover:border-purple-400 group-hover:text-purple-300">
            1
          </kbd>
          <span>Sim, é o novo menor</span>
        </button>

        <button
          type="button"
          data-testid="decision-keep-min"
          onClick={() => onDecision("KEEP_MIN")}
          disabled={disabled}
          className="relative flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 active:bg-slate-700 text-slate-100 font-semibold border border-slate-600/60 shadow-lg hover:border-purple-400/60 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group text-sm sm:text-base"
          aria-label={`Não, manter ${minVal} como menor (tecla 2)`}
        >
          <kbd className="inline-flex items-center justify-center w-6 h-6 rounded bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-slate-300 group-hover:border-purple-400 group-hover:text-purple-300">
            2
          </kbd>
          <span>Não, manter o menor</span>
        </button>
      </div>

      {/* Feedback Causal Imediato */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className={`w-full max-w-xl p-3 rounded-xl border text-sm font-medium flex items-start gap-3 transition-all ${
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
    </div>
  );
}
