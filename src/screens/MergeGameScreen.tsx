import { useState, useEffect, useCallback, useRef, useId } from "react";
import NumberedBox from "../components/NumberedBox";
import GameButton from "../components/GameButton";
import InstructionPanel from "../components/InstructionPanel";
import {
  initMergeSortState,
  executeMergeStep,
  deriveMergeFramesFromHistory,
  formatMergeElementLabel,
  getMergeStepFeedback,
  getMergeContextualHint,
  MERGE_SORT_PSEUDOCODE,
  type MergePracticeLevel,
  type MergeElement,
  type MergeSortState,
  type MergeVisualStepFrame,
  type MergeDecision,
  type MergeStepRecord,
} from "../game/sorting/merge";
import {
  generateMergePracticeArray,
  assignMergeIdentities,
} from "../game/sorting/merge/mergeConstraints";
import {
  createPhaseSessionMetrics,
  recordHintUsed,
  calculateProtocolScore,
} from "../game/session";
import type { SeedInput } from "../game/generation";

export interface MergePracticeCompleteData {
  finalArray: readonly number[];
  initialArray: readonly number[];
  initialElements: readonly MergeElement[];
  history: readonly MergeStepRecord[];
  comparisons: number;
  writesInBuffer: number;
  writesInMain: number;
  totalWrites: number;
  errors: number;
  hintsUsed: number;
  score: number;
  elapsedTimeMs: number;
  level: MergePracticeLevel;
  practiceTitle: string;
}

export interface MergeGameScreenProps {
  initialArray?: readonly number[];
  level?: MergePracticeLevel;
  seed?: SeedInput;
  practiceTitle?: string;
  onComplete: (data: MergePracticeCompleteData) => void;
  onBackToSelector: () => void;
  onOpenSelector?: () => void;
}

export default function MergeGameScreen({
  initialArray: propInitialArray,
  level = "basic",
  seed,
  practiceTitle,
  onComplete,
  onBackToSelector,
}: MergeGameScreenProps) {
  const instructionId = useId();

  // 1. Inicialização factual dos elementos imutáveis
  const [initialElements] = useState<readonly MergeElement[]>(() => {
    if (propInitialArray && propInitialArray.length > 0) {
      return assignMergeIdentities(propInitialArray);
    }
    const generated = generateMergePracticeArray(level, seed);
    return generated.elements;
  });

  // 2. Estado da Engine pura e histórico
  const [engineState, setEngineState] = useState<MergeSortState>(() =>
    initMergeSortState(initialElements),
  );

  // 3. Quadro de exibição (desacoplado do estado da engine durante animações)
  const [displayedFrame, setDisplayedFrame] =
    useState<MergeVisualStepFrame | null>(() => {
      const initialEngine = initMergeSortState(initialElements);
      if (initialEngine.history.length > 0) {
        const frames = deriveMergeFramesFromHistory(
          initialElements,
          initialEngine.history,
        );
        return frames[frames.length - 1] ?? null;
      }
      return null;
    });

  // 4. Métricas de sessão e temporizador
  const [sessionMetrics, setSessionMetrics] = useState(
    createPhaseSessionMetrics,
  );
  const startTimeRef = useRef<number>(Date.now());
  const [elapsedTimeMs, setElapsedTimeMs] = useState<number>(0);
  const [activeHint, setActiveHint] = useState<string | null>(null);

  // 5. Feedback pedagógico contextual
  const [feedback, setFeedback] = useState<{
    type: "info" | "warning" | "success" | "error";
    message: string;
  }>({
    type: "info",
    message:
      "Junte os grupos em ordem: compare os números destacados e escolha o menor para a próxima posição do vetor auxiliar.",
  });

  // 6. Controle síncrono de animação e trava de decisão
  const [isActionLocked, setIsActionLocked] = useState<boolean>(false);
  const isActionLockedRef = useRef<boolean>(false);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const presentationIdRef = useRef<number>(0);

  // 7. Apresentação discreta de múltiplos quadros (acessibilidade / reduced motion)
  const [pendingFrames, setPendingFrames] = useState<
    readonly MergeVisualStepFrame[]
  >([]);
  const [pendingFrameIndex, setPendingFrameIndex] = useState<number>(0);
  const pendingFinalStateRef = useRef<MergeSortState | null>(null);

  // Atualização de tempo descritivo
  useEffect(() => {
    const timer = setInterval(() => {
      if (!engineState.completed) {
        setElapsedTimeMs(Date.now() - startTimeRef.current);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [engineState.completed]);

  // Limpeza de timers no desmonte
  useEffect(() => {
    return () => {
      presentationIdRef.current++;
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

  // Notificação de conclusão
  const handleComplete = useCallback(
    (finalState: MergeSortState) => {
      const finalArray = finalState.values.map((e) => e.value);
      const initialArray = initialElements.map((e) => e.value);
      const finalScore = calculateProtocolScore({
        errors: finalState.errors,
        hintsUsed: sessionMetrics.hintsUsed,
      });
      const finalElapsed = Date.now() - startTimeRef.current;

      onComplete({
        finalArray,
        initialArray,
        initialElements,
        history: finalState.history,
        comparisons: finalState.comparisons,
        writesInBuffer: finalState.writesInBuffer,
        writesInMain: finalState.writesInMain,
        totalWrites: finalState.totalWrites,
        errors: finalState.errors,
        hintsUsed: sessionMetrics.hintsUsed,
        score: finalScore,
        elapsedTimeMs: finalElapsed,
        level,
        practiceTitle:
          practiceTitle ??
          (level === "basic"
            ? "PRÁTICA BÁSICA"
            : level === "intermediate"
              ? "PRÁTICA INTERMEDIÁRIA"
              : "PRÁTICA AVANÇADA"),
      });
    },
    [initialElements, level, onComplete, practiceTitle, sessionMetrics.hintsUsed],
  );

  // Avanço manual discreto de quadro (para reduced motion e acessibilidade sem animações contínuas)
  const handleAdvancePendingFrame = useCallback(() => {
    if (pendingFrames.length === 0) return;
    const nextIdx = pendingFrameIndex + 1;
    if (nextIdx < pendingFrames.length) {
      setPendingFrameIndex(nextIdx);
      setDisplayedFrame(pendingFrames[nextIdx]);

      // Se este é o último quadro da sequência:
      if (nextIdx === pendingFrames.length - 1 && pendingFinalStateRef.current) {
        const finalState = pendingFinalStateRef.current;
        setEngineState(finalState);
        setIsActionLocked(false);
        isActionLockedRef.current = false;
        setPendingFrames([]);
        setPendingFrameIndex(0);
        pendingFinalStateRef.current = null;
      }
    }
  }, [pendingFrames, pendingFrameIndex]);

  // Execução de decisão com apresentação sequencial dos eventos
  const handleDecision = useCallback(
    (decision: MergeDecision) => {
      if (isActionLockedRef.current || engineState.completed) return;

      const stateBefore = engineState;
      const result = executeMergeStep(stateBefore, decision);

      if (!result.valid) {
        // Erro conceitual ou ação inválida
        setEngineState(result.state);
        const feedbackMsg = getMergeStepFeedback(result, stateBefore, decision);
        setFeedback({
          type: result.isPedagogicalError ? "error" : "warning",
          message: feedbackMsg,
        });
        return;
      }

      // Decisão válida!
      const currentPresId = ++presentationIdRef.current;
      const prevHistoryLen = stateBefore.history.length;
      const newHistory = result.state.history;
      const allFrames = deriveMergeFramesFromHistory(
        initialElements,
        newHistory,
      );
      const newFrames = allFrames.slice(prevHistoryLen);

      const feedbackMsg = getMergeStepFeedback(result, stateBefore, decision);
      setFeedback({
        type: "success",
        message: feedbackMsg,
      });

      const prefersReducedMotion =
        typeof window !== "undefined" &&
        Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);

      if (newFrames.length <= 1) {
        // Apresentação imediata quando há apenas 1 quadro
        const finalFrame = allFrames[allFrames.length - 1] ?? null;
        setDisplayedFrame(finalFrame);
        setEngineState(result.state);
        setIsActionLocked(false);
        isActionLockedRef.current = false;

        if (result.state.completed) {
          const tId = setTimeout(() => {
            if (presentationIdRef.current === currentPresId) {
              handleComplete(result.state);
            }
          }, 600);
          timersRef.current.push(tId);
        }
      } else if (prefersReducedMotion) {
        // Apresentação discreta sem timers contínuos: estudante observa divisão, MERGE_INIT, drenagem e retorno no seu próprio ritmo
        setIsActionLocked(true);
        isActionLockedRef.current = true;
        setDisplayedFrame(newFrames[0]);
        setPendingFrames(newFrames);
        setPendingFrameIndex(0);
        pendingFinalStateRef.current = result.state;
      } else {
        // Apresentação sequencial com bloqueio de decisões até o quadro final
        setIsActionLocked(true);
        isActionLockedRef.current = true;

        let frameIdx = 0;
        const animateNextFrame = () => {
          if (presentationIdRef.current !== currentPresId) return;

          if (frameIdx < newFrames.length) {
            setDisplayedFrame(newFrames[frameIdx]);
            frameIdx++;
            const tId = setTimeout(animateNextFrame, 220);
            timersRef.current.push(tId);
          } else {
            // Conclusão da apresentação
            setEngineState(result.state);
            setIsActionLocked(false);
            isActionLockedRef.current = false;

            if (result.state.completed) {
              const tId = setTimeout(() => {
                if (presentationIdRef.current === currentPresId) {
                  handleComplete(result.state);
                }
              }, 600);
              timersRef.current.push(tId);
            }
          }
        };

        animateNextFrame();
      }
    },
    [engineState, handleComplete, initialElements],
  );

  // Solicitação de dica pedagógica
  const handleRequestHint = useCallback(() => {
    if (engineState.completed) return;
    setSessionMetrics((prev) => recordHintUsed(prev));
    const hintText = getMergeContextualHint(engineState);
    setActiveHint(hintText);
    setFeedback({
      type: "info",
      message: `Dica pedagógica: ${hintText}`,
    });
  }, [engineState]);

  // Reinício idempotente da prática
  const handleRestart = useCallback(() => {
    presentationIdRef.current++;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    isActionLockedRef.current = false;
    setIsActionLocked(false);
    setPendingFrames([]);
    setPendingFrameIndex(0);
    pendingFinalStateRef.current = null;

    const freshEngine = initMergeSortState(initialElements);
    setEngineState(freshEngine);

    if (freshEngine.history.length > 0) {
      const frames = deriveMergeFramesFromHistory(
        initialElements,
        freshEngine.history,
      );
      setDisplayedFrame(frames[frames.length - 1] ?? null);
    } else {
      setDisplayedFrame(null);
    }

    setSessionMetrics(createPhaseSessionMetrics());
    startTimeRef.current = Date.now();
    setElapsedTimeMs(0);
    setActiveHint(null);
    setFeedback({
      type: "info",
      message:
        "Prática reiniciada com o mesmo lote. Siga o fluxo de intercalação.",
    });
  }, [initialElements]);

  // Atalhos de teclado locais com proteção contra ativações duplicadas e respeito a controles focados
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat) return;
      const target = event.target as HTMLElement | null;

      const elem =
        target && typeof (target as Element).closest === "function"
          ? (target as Element)
          : null;

      const isInteractive = Boolean(
        elem?.closest("button, a, input, textarea, select, [role='button']") ||
        (elem as HTMLElement)?.isContentEditable
      );

      // Se qualquer controle interativo (botões REINICIAR, VOLTAR, etc.) estiver focado,
      // preserva a ativação nativa de Enter e Espaço, impedindo captura global indevida.
      if (isInteractive) {
        if (event.key === " " || event.key === "Enter") {
          return;
        }
        if (
          elem?.tagName === "INPUT" ||
          elem?.tagName === "TEXTAREA" ||
          (elem as HTMLElement)?.isContentEditable
        ) {
          return;
        }
      }

      // Se houver quadros pendentes para avanço manual (reduced motion):
      if (pendingFrames.length > 0) {
        // Atalho '1' avança o quadro pendente; Espaço avança somente se nenhum controle estiver focado
        if (event.key === "1" || (!isInteractive && event.key === " ")) {
          event.preventDefault();
          handleAdvancePendingFrame();
        }
        return;
      }

      // Atalhos normais de triagem:
      if (event.key === "1") {
        event.preventDefault();
        handleDecision("DISPATCH_LEFT");
      } else if (event.key === "2") {
        event.preventDefault();
        handleDecision("DISPATCH_RIGHT");
      } else if (event.key === "3") {
        event.preventDefault();
        handleDecision("DRAIN_REMAINDER");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleAdvancePendingFrame, handleDecision, pendingFrames.length]);

  // Dados derivados do quadro atual em exibição (estritamente desacoplados do estado futuro da engine)
  const currentValues = displayedFrame?.values ?? engineState.values;
  const currentBuffer = displayedFrame?.buffer ?? engineState.buffer;
  const currentInterval =
    displayedFrame?.activeInterval ?? engineState.activeInterval;
  const currentPhase = displayedFrame?.phase ?? engineState.phase;
  const p1 = displayedFrame?.p1 ?? engineState.p1;
  const p2 = displayedFrame?.p2 ?? engineState.p2;
  const k = displayedFrame?.k ?? engineState.k;

  // A conclusão visual depende estritamente do quadro apresentado (OK global não antecipa a animação)
  const isVisualCompleted = displayedFrame
    ? displayedFrame.phase === "COMPLETED"
    : engineState.completed;
  const isCompleted = isVisualCompleted;

  // Métricas algorítmicas sincronizadas com o displayedFrame
  const displayedComparisons =
    displayedFrame?.cumulativeComparisons ?? engineState.comparisons;
  const displayedWritesInBuffer =
    displayedFrame?.cumulativeWritesInBuffer ?? engineState.writesInBuffer;
  const displayedWritesInMain =
    displayedFrame?.cumulativeWritesInMain ?? engineState.writesInMain;
  const displayedTotalWrites =
    displayedFrame?.cumulativeTotalWrites ?? engineState.totalWrites;

  // Identificação dos elementos sob os sensores
  const leftHead =
    currentInterval && p1 <= currentInterval.mid ? currentValues[p1] : null;
  const rightHead =
    currentInterval && p2 <= currentInterval.right ? currentValues[p2] : null;

  // Habilitação das ações
  const canDispatchLeft =
    !isActionLocked &&
    !isCompleted &&
    currentPhase === "COMPARE_HEADS" &&
    currentInterval !== null &&
    p1 <= currentInterval.mid;

  const canDispatchRight =
    !isActionLocked &&
    !isCompleted &&
    currentPhase === "COMPARE_HEADS" &&
    currentInterval !== null &&
    p2 <= currentInterval.right;

  const canDrain =
    !isActionLocked && !isCompleted && currentPhase === "DRAIN_READY";

  // Intervalos consolidados por COPY_BACK que já foram efetivamente apresentados até o quadro atual
  const presentedHistory = displayedFrame
    ? engineState.history.slice(0, displayedFrame.stepIndex + 1)
    : engineState.history;

  const presentedSortedIntervals = presentedHistory
    .filter((rec) => rec.type === "COPY_BACK")
    .map((rec) => ({ left: (rec as any).left, right: (rec as any).right }));

  // Helper para verificar se um índice do vetor principal está em intervalo já consolidado (ORD)
  const isIndexLocallyOrdered = (idx: number): boolean => {
    if (isCompleted) return false;
    for (const range of presentedSortedIntervals) {
      if (idx >= range.left && idx <= range.right) {
        // Se este intervalo for o ativo em curso e o elemento já desceu para o buffer, não exibe ORD
        if (
          currentInterval &&
          idx >= currentInterval.left &&
          idx <= currentInterval.right
        ) {
          if (idx <= currentInterval.mid && idx < p1) return false;
          if (idx > currentInterval.mid && idx < p2) return false;
        }
        return true;
      }
    }
    return false;
  };

  // Pontuação estimada atual (métrica pedagógica e formativa de sessão)
  const currentScore = calculateProtocolScore({
    errors: engineState.errors,
    hintsUsed: sessionMetrics.hintsUsed,
  });

  return (
    <div className="relative w-full h-full min-h-screen overflow-y-auto overflow-x-hidden bg-[#060b1a] bg-grid scanlines flex flex-col items-center justify-start py-6 px-4 sm:px-8 select-none">
      {/* Luzes de ambiência da estação ciano/azul */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-[550px] h-[280px] bg-blue-600/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[200px] bg-cyan-500/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-5 max-w-4xl w-full my-0">
        {/* Cabeçalho da Estação de Intercalação */}
        <header className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 panel-border bg-[#0a122c]/80 rounded-xl px-5 py-4">
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-0.5 rounded border border-blue-500/30 bg-blue-950/40 text-[10px] text-blue-300 font-mono tracking-widest uppercase"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                MÓDULO: MERGE SORT
              </span>
              <span
                className="px-2.5 py-0.5 rounded border border-white/10 bg-slate-900/60 text-[10px] text-white/50 font-mono tracking-widest uppercase"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                DIVISÃO E CONQUISTA
              </span>
            </div>
            <h1
              className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-400 to-sky-300 tracking-tight"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              {practiceTitle ??
                (level === "basic"
                  ? "PRÁTICA BÁSICA (n=4)"
                  : level === "intermediate"
                    ? "PRÁTICA INTERMEDIÁRIA (n=5)"
                    : "PRÁTICA AVANÇADA (n=6)")}
            </h1>
          </div>

          {/* Botões de Apoio */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            <GameButton
              variant="secondary"
              size="sm"
              onClick={handleRequestHint}
              disabled={isCompleted || isActionLocked}
              title="Solicitar dica pedagógica formativa (-5 pts)"
            >
              DICA {sessionMetrics.hintsUsed > 0 && `(${sessionMetrics.hintsUsed})`}
            </GameButton>
            <GameButton
              variant="secondary"
              size="sm"
              onClick={handleRestart}
              title="Reiniciar a prática com o mesmo lote"
            >
              REINICIAR
            </GameButton>
            <GameButton
              variant="ghost"
              size="sm"
              onClick={onBackToSelector}
              title="Retornar ao seletor de práticas"
            >
              VOLTAR
            </GameButton>
          </div>
        </header>

        {/* =========================================================================
            1. O QUE FAZER AGORA (Instrução do Passo e Dica Pedagógica)
           ========================================================================= */}
        <section aria-label="Instrução do Passo Atual" className="w-full flex flex-col gap-2">
          <InstructionPanel
            message={feedback.message}
            type={feedback.type}
          />

          {activeHint && (
            <div className="p-3.5 rounded-xl border border-cyan-500/40 bg-cyan-950/40 text-sm text-cyan-100 flex items-start gap-2.5 shadow-md">
              <span className="text-cyan-300 font-bold font-mono text-sm">💡 DICA:</span>
              <p className="flex-1 leading-relaxed" style={{ fontFamily: "'Exo 2', sans-serif" }}>
                {activeHint}
              </p>
            </div>
          )}
        </section>

        {/* =========================================================================
            2 e 3. ESTAÇÃO DE INTERCALAÇÃO (ÁREA ÚNICA DE DECISÃO E VETOR AUXILIAR)
           ========================================================================= */}
        {currentInterval && !isCompleted && (
          <section
            aria-label="Área de Decisão da Intercalação"
            className="w-full panel-border bg-[#0b1638]/90 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 border-2 border-cyan-500/30 shadow-xl"
          >
            {/* Metadados de apoio do subintervalo ativo */}
            <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-2 text-[11px] font-mono gap-2">
              <span className="font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                JUNTAR OS GRUPOS EM ORDEM • INTERCALAÇÃO ATIVA
              </span>
              <span className="text-slate-300 font-medium">
                Intervalo: [{currentInterval.left}..{currentInterval.right}] | Meio: mid={currentInterval.mid}
              </span>
            </div>

            {/* Instrução Pedagógica Direta e Regra de Desempate */}
            <div className="p-3.5 rounded-xl bg-[#070e24] border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left shadow-sm">
              <div className="flex flex-col gap-0.5">
                <p
                  className="text-xs sm:text-sm font-sans font-medium text-slate-100"
                  style={{ fontFamily: "'Exo 2', sans-serif" }}
                >
                  {currentPhase === "COMPARE_HEADS"
                    ? "Compare os números destacados. Escolha o menor para a próxima posição do vetor auxiliar."
                    : currentPhase === "DRAIN_READY"
                      ? `Só restam números no grupo da ${p1 <= currentInterval.mid ? "esquerda" : "direita"}. Copie-os para completar esta etapa.`
                      : "Sincronizando intercalação..."}
                </p>
                {currentPhase === "COMPARE_HEADS" && (
                  <p
                    className="text-[11px] text-cyan-300/90 font-sans"
                    style={{ fontFamily: "'Exo 2', sans-serif" }}
                  >
                    Números iguais? Escolha o da esquerda para manter a ordem original.
                  </p>
                )}
              </div>
              <div className="shrink-0 px-2.5 py-1 rounded bg-black/40 border border-white/10 text-xs font-mono font-semibold text-slate-200">
                Próxima posição: <span className="text-teal-300 font-bold">B[{k}]</span>
              </div>
            </div>

            {/* As duas filas dos grupos (Área Principal de Decisão) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Grupo da Esquerda */}
              <div
                className={`flex flex-col gap-2 p-3 rounded-xl border ${
                  p1 <= currentInterval.mid
                    ? "border-cyan-500/40 bg-cyan-950/20"
                    : "border-slate-700 bg-slate-900/30 opacity-60"
                }`}
              >
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="font-bold text-cyan-300">
                    GRUPO DA ESQUERDA (A[{currentInterval.left}..{currentInterval.mid}])
                  </span>
                  <span
                    className={
                      p1 <= currentInterval.mid
                        ? "text-cyan-300 font-semibold"
                        : "text-amber-300 font-semibold"
                    }
                  >
                    {p1 <= currentInterval.mid ? `Destaque: p1 = #${p1 + 1}` : "GRUPO FINALIZADO"}
                  </span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {currentValues
                    .slice(currentInterval.left, currentInterval.mid + 1)
                    .map((elem, offset) => {
                      const absoluteIdx = currentInterval.left + offset;
                      const isDispatched = absoluteIdx < p1;
                      const isHead =
                        absoluteIdx === p1 && currentPhase === "COMPARE_HEADS";

                      return (
                        <div
                          key={elem.id}
                          className={`flex flex-col items-center gap-1 transition-all ${
                            isDispatched
                              ? "opacity-30"
                              : isHead
                                ? "scale-105 rounded-xl ring-2 ring-cyan-400 bg-cyan-950/60 p-0.5"
                                : "p-0.5"
                          }`}
                        >
                          <NumberedBox
                            value={elem.value}
                            elementLabel={elem.label}
                            index={absoluteIdx}
                            role={isHead ? "pair" : "default"}
                            badge={
                              isHead
                                ? "DESTAQUE"
                                : isDispatched
                                  ? "COPIADO"
                                  : "FILA"
                            }
                            disabled={false}
                            size="sm"
                          />
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Grupo da Direita */}
              <div
                className={`flex flex-col gap-2 p-3 rounded-xl border ${
                  p2 <= currentInterval.right
                    ? "border-blue-500/40 bg-blue-950/20"
                    : "border-slate-700 bg-slate-900/30 opacity-60"
                }`}
              >
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="font-bold text-blue-300">
                    GRUPO DA DIREITA (A[{currentInterval.mid + 1}..{currentInterval.right}])
                  </span>
                  <span
                    className={
                      p2 <= currentInterval.right
                        ? "text-blue-300 font-semibold"
                        : "text-amber-300 font-semibold"
                    }
                  >
                    {p2 <= currentInterval.right ? `Destaque: p2 = #${p2 + 1}` : "GRUPO FINALIZADO"}
                  </span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {currentValues
                    .slice(currentInterval.mid + 1, currentInterval.right + 1)
                    .map((elem, offset) => {
                      const absoluteIdx = currentInterval.mid + 1 + offset;
                      const isDispatched = absoluteIdx < p2;
                      const isHead =
                        absoluteIdx === p2 && currentPhase === "COMPARE_HEADS";

                      return (
                        <div
                          key={elem.id}
                          className={`flex flex-col items-center gap-1 transition-all ${
                            isDispatched
                              ? "opacity-30"
                              : isHead
                                ? "scale-105 rounded-xl ring-2 ring-blue-400 bg-blue-950/60 p-0.5"
                                : "p-0.5"
                          }`}
                        >
                          <NumberedBox
                            value={elem.value}
                            elementLabel={elem.label}
                            index={absoluteIdx}
                            role={isHead ? "pair" : "default"}
                            badge={
                              isHead
                                ? "DESTAQUE"
                                : isDispatched
                                  ? "COPIADO"
                                  : "FILA"
                            }
                            disabled={false}
                            size="sm"
                          />
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Onde o número escolhido será colocado (Vetor Auxiliar) */}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <div className="flex justify-between items-center text-[11px] font-mono text-slate-300">
                <span className="uppercase tracking-wider font-bold text-teal-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400" />
                  VETOR AUXILIAR TEMPORÁRIO B[0..{currentInterval.right - currentInterval.left}]
                </span>
                <span className="font-semibold text-slate-200">
                  Próxima posição: k = {k}
                </span>
              </div>

              <div className="w-full overflow-x-auto py-2">
                <div className="flex items-center justify-center gap-3 min-w-max mx-auto px-2">
                  {currentBuffer.map((bufElem, slotIdx) => {
                    const isTarget = slotIdx === k && !isCompleted;
                    const isFilled = bufElem !== null;

                    return (
                      <div
                        key={slotIdx}
                        className="flex flex-col items-center gap-1"
                      >
                        <span
                          className="text-slate-300 font-mono font-semibold"
                          style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: "11px",
                          }}
                        >
                          B[{slotIdx}]
                        </span>

                        {isFilled ? (
                          <NumberedBox
                            value={bufElem.value}
                            elementLabel={bufElem.label}
                            index={slotIdx}
                            role="ordered"
                            badge="ORDEM"
                            disabled={false}
                            size="md"
                          />
                        ) : (
                          <div
                            className={`w-20 h-20 rounded-xl flex flex-col items-center justify-center border-2 border-dashed transition-all ${
                              isTarget
                                ? "border-teal-400 bg-teal-950/40 text-teal-200 shadow-md ring-1 ring-teal-400/50"
                                : "border-slate-700 bg-slate-900/40 text-slate-400"
                            }`}
                          >
                            <span className="text-[10px] font-mono tracking-wider font-bold text-center px-1">
                              {isTarget ? "Próxima posição" : "Vazio"}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="text-xs text-slate-300 font-mono text-center">
                * Ao completar o intervalo, todos os elementos são copiados de volta para o vetor principal com marcação ORD (ou OK na ordenação completa).
              </p>
            </div>
          </section>
        )}

        {/* =========================================================================
            4. OS BOTÕES DA DECISÃO (Ação Imediata e Acessível)
           ========================================================================= */}
        <footer
          aria-label="Ações de Decisão"
          className="w-full panel-border bg-[#070e26]/95 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 sticky bottom-4 z-20 shadow-2xl backdrop-blur-md"
        >
          {pendingFrames.length > 0 ? (
            <GameButton
              variant="primary"
              size="lg"
              onClick={handleAdvancePendingFrame}
              className="w-full sm:w-auto min-w-[280px] border-cyan-400 bg-cyan-950/70 text-cyan-200"
              title="Avançar para o próximo passo automático (Atalho: 1 ou Espaço)"
            >
              <div className="flex flex-col items-center">
                <span>PRÓXIMO PASSO AUTOMÁTICO</span>
                <span className="text-[10px] font-normal opacity-75">
                  Passo {pendingFrameIndex + 1} de {pendingFrames.length} (Atalho 1 ou Espaço)
                </span>
              </div>
            </GameButton>
          ) : isCompleted ? (
            <GameButton
              variant="primary"
              size="lg"
              onClick={() => handleComplete(engineState)}
              className="w-full sm:w-auto min-w-[240px] border-emerald-400 bg-emerald-950/70 text-emerald-200"
              title="Visualizar a tela de resultados da prática"
            >
              <div className="flex flex-col items-center">
                <span>VER RESULTADOS</span>
                <span className="text-[10px] font-normal opacity-75">
                  Ordenação Concluída com Sucesso!
                </span>
              </div>
            </GameButton>
          ) : (
            <>
              {/* Botão 1: Escolher Esquerda */}
              <GameButton
                variant="primary"
                size="lg"
                onClick={() => handleDecision("DISPATCH_LEFT")}
                disabled={!canDispatchLeft}
                className="w-full sm:w-auto min-w-[200px]"
                title="Escolher o elemento do grupo da esquerda (Atalho 1)"
              >
                <div className="flex flex-col items-center">
                  <span>1: ESCOLHER DA ESQUERDA</span>
                  <span className="text-[10px] font-normal opacity-75">
                    {leftHead ? `Elemento ${formatMergeElementLabel(leftHead)}` : "—"}
                  </span>
                </div>
              </GameButton>

              {/* Botão 2: Escolher Direita */}
              <GameButton
                variant="primary"
                size="lg"
                onClick={() => handleDecision("DISPATCH_RIGHT")}
                disabled={!canDispatchRight}
                className="w-full sm:w-auto min-w-[200px]"
                title="Escolher o elemento do grupo da direita (Atalho 2)"
              >
                <div className="flex flex-col items-center">
                  <span>2: ESCOLHER DA DIREITA</span>
                  <span className="text-[10px] font-normal opacity-75">
                    {rightHead
                      ? `Elemento ${formatMergeElementLabel(rightHead)}`
                      : "—"}
                  </span>
                </div>
              </GameButton>

              {/* Botão 3: Copiar Restantes */}
              <GameButton
                variant="primary"
                size="lg"
                onClick={() => handleDecision("DRAIN_REMAINDER")}
                disabled={!canDrain}
                className="w-full sm:w-auto min-w-[200px] border-emerald-500/50 hover:border-emerald-400"
                title="Copiar os elementos restantes sem comparações (Atalho 3)"
              >
                <div className="flex flex-col items-center">
                  <span>3: COPIAR OS RESTANTES</span>
                  <span className="text-[10px] font-normal opacity-75">
                    Cópia Direta
                  </span>
                </div>
              </GameButton>
            </>
          )}
        </footer>

        {/* =========================================================================
            5. CONTEXTO DO VETOR, PSEUDOCÓDIGO E MÉTRICAS
           ========================================================================= */}
        {/* Vetor Principal (Visão Geral e Legenda de Estados) */}
        <section
          aria-label="Vetor Principal"
          className="w-full panel-border bg-[#091129]/80 rounded-2xl px-4 py-4 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 px-1">
            <span className="uppercase tracking-wider flex items-center gap-2 font-bold text-cyan-200">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block animate-pulse" />
              VETOR PRINCIPAL (A[0..{initialElements.length - 1}])
            </span>
            {currentInterval ? (
              <span className="text-cyan-300 font-semibold">
                Subintervalo: [{currentInterval.left}..{currentInterval.right}] | Divisão: mid={currentInterval.mid}
              </span>
            ) : isCompleted ? (
              <span className="text-emerald-400 font-bold">
                ✓ TODOS OS NÚMEROS CONSOLIDADOS (STATUS OK)
              </span>
            ) : (
              <span>Aguardando partição</span>
            )}
          </div>

          {/* Vetor com overflow-x isolado */}
          <div className="w-full overflow-x-auto py-2">
            <div className="flex items-center justify-center gap-3 min-w-max mx-auto px-2">
              {currentValues.map((elem, idx) => {
                const inActiveRange =
                  currentInterval !== null &&
                  idx >= currentInterval.left &&
                  idx <= currentInterval.right;

                const isP1 =
                  inActiveRange &&
                  idx === p1 &&
                  p1 <= currentInterval.mid &&
                  currentPhase === "COMPARE_HEADS";
                const isP2 =
                  inActiveRange &&
                  idx === p2 &&
                  p2 <= currentInterval.right &&
                  currentPhase === "COMPARE_HEADS";
                const isDispatched =
                  inActiveRange &&
                  ((idx <= currentInterval.mid && idx < p1) ||
                    (idx > currentInterval.mid && idx < p2));

                const isLocallyOrdered = isIndexLocallyOrdered(idx);

                const role = isCompleted
                  ? "sorted"
                  : isP1 || isP2
                    ? "pair"
                    : isLocallyOrdered
                      ? "ordered"
                      : "default";

                const badge = isCompleted
                  ? "OK"
                  : isP1 || isP2
                    ? "DESTAQUE"
                    : isDispatched
                      ? "COPIADO"
                      : isLocallyOrdered
                        ? "ORD"
                        : inActiveRange
                          ? "LOTE"
                          : undefined;

                return (
                  <div
                    key={elem.id}
                    className={`transition-opacity duration-200 ${isDispatched ? "opacity-30" : "opacity-100"}`}
                  >
                    <NumberedBox
                      value={elem.value}
                      elementLabel={elem.label}
                      index={idx}
                      role={role}
                      badge={badge}
                      disabled={false}
                      size="md"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legenda explícita de distinção de estados */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 border-t border-white/10 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-400/40 text-emerald-300 font-mono font-bold text-[10px]">OK</span>
              <span>Posição final consolidada (vetor completo)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-teal-950/80 border border-teal-400/40 text-teal-300 font-mono font-bold text-[10px]">ORD</span>
              <span>Grupo ordenado localmente</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-400/40 text-amber-300 font-mono font-bold text-[10px]">FRENTE</span>
              <span>Número sendo comparado</span>
            </span>
          </div>
        </section>

        {/* Pseudocódigo e Métricas em grade */}
        <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pseudocódigo Canônico */}
          <div className="panel-border bg-[#080f28]/80 rounded-2xl p-4 flex flex-col gap-2">
            <span
              className="text-[11px] text-slate-300 tracking-wider uppercase font-mono font-bold"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              PSEUDOCÓDIGO — SUB-ROTINA DE INTERCALAÇÃO (RESUMO OPERACIONAL)
            </span>
            <div className="flex flex-col gap-0.5">
              {MERGE_SORT_PSEUDOCODE.map((item) => {
                const isActive =
                  (currentPhase === "COMPARE_HEADS" &&
                    (item.id === "MERGE_LOOP" ||
                      item.id === "COMPARE_CONDITION")) ||
                  (currentPhase === "DRAIN_READY" &&
                    item.id === "DRAIN_REMAINDER") ||
                  (currentPhase === "COPY_BACK_AUTOMATIC" &&
                    item.id === "COPY_BACK");

                return (
                  <div
                    key={item.id}
                    className={`px-2 py-0.5 rounded text-xs leading-relaxed transition-colors ${
                      isActive
                        ? "bg-blue-950/60 text-blue-200 font-bold border-l-2 border-blue-400"
                        : "text-slate-400"
                    }`}
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      paddingLeft: `${Math.max(8, item.indent * 12 + 8)}px`,
                    }}
                  >
                    {item.text}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Faixa de Telemetria / Métricas */}
          <div
            aria-label="Telemetria da Operação"
            className="panel-border bg-[#080f28]/80 rounded-2xl p-4 flex flex-col justify-between gap-3"
          >
            <span
              className="text-[11px] text-slate-300 tracking-wider uppercase font-mono font-bold"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              MÉTRICAS DA OPERAÇÃO
            </span>

            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center p-2 rounded-lg bg-[#0d1635]/80 border border-white/5">
                <span className="text-[10px] text-slate-300 uppercase font-mono font-semibold">
                  Comparações
                </span>
                <span
                  data-testid="comparisons-count"
                  className="text-lg font-bold text-cyan-300"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  {displayedComparisons}
                </span>
              </div>

              <div className="flex flex-col items-center p-2 rounded-lg bg-[#0d1635]/80 border border-white/5">
                <span className="text-[10px] text-slate-300 uppercase font-mono font-semibold">
                  Escritas Buffer
                </span>
                <span
                  data-testid="writes-in-buffer"
                  className="text-lg font-bold text-blue-300"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  {displayedWritesInBuffer}
                </span>
              </div>

              <div className="flex flex-col items-center p-2 rounded-lg bg-[#0d1635]/80 border border-white/5">
                <span className="text-[10px] text-slate-300 uppercase font-mono font-semibold">
                  Escritas Principal
                </span>
                <span
                  data-testid="writes-in-main"
                  className="text-lg font-bold text-cyan-200"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  {displayedWritesInMain}
                </span>
              </div>

              <div className="flex flex-col items-center p-2 rounded-lg bg-[#0d1635]/80 border border-white/5">
                <span className="text-[10px] text-slate-300 uppercase font-mono font-semibold">
                  Total Escritas
                </span>
                <span
                  className="text-lg font-bold text-sky-400"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  {displayedTotalWrites}
                </span>
              </div>

              <div className="flex flex-col items-center p-2 rounded-lg bg-[#0d1635]/80 border border-white/5">
                <span className="text-[10px] text-slate-300 uppercase font-mono font-semibold">
                  Decisões Incorretas
                </span>
                <span
                  className={`text-lg font-bold ${engineState.errors > 0 ? "text-amber-400" : "text-slate-300"}`}
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  {engineState.errors}
                </span>
              </div>

              <div className="flex flex-col items-center p-2 rounded-lg bg-[#0d1635]/80 border border-white/5">
                <span className="text-[10px] text-slate-300 uppercase font-mono font-semibold">
                  Pontuação
                </span>
                <span
                  className="text-lg font-bold text-emerald-400"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  {currentScore}
                </span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 font-mono text-center">
              Complexidade teórica: Θ(n log n) comparações • O(n) espaço auxiliar
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
