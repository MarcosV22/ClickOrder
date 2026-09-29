import { useState, useEffect, useCallback, useRef, useId } from "react";
import NumberedBox, { type BoxRole } from "../components/NumberedBox";
import GameButton from "../components/GameButton";
import InstructionPanel from "../components/InstructionPanel";
import {
  initQuickSortState,
  stepQuickSort,
  reconstructQuickVisualFrame,
  QUICK_SORT_PSEUDOCODE_LINES,
} from "../game/sorting/quick/quickSortEngine";
import {
  getQuickFeedback,
  getQuickHint,
  getQuickElementVisualStatus,
  type QuickElementVisualStatus,
} from "../game/sorting/quick/quickPedagogy";
import {
  generateQuickPracticeArray,
  assignQuickIdentities,
  type QuickPracticeLevel,
} from "../game/sorting/quick/quickConstraints";
import type {
  QuickElement,
  QuickSortState,
  QuickVisualStepFrame,
  QuickDecision,
  QuickStepRecord,
} from "../game/sorting/quick/types";
import {
  createPhaseSessionMetrics,
  recordHintUsed,
  calculateProtocolScore,
  formatElapsedTime,
} from "../game/session";
import type { SeedInput } from "../game/generation";

export interface QuickPracticeCompleteData {
  readonly finalArray: readonly number[];
  readonly initialArray: readonly number[];
  readonly initialElements: readonly QuickElement[];
  readonly history: readonly QuickStepRecord[];
  readonly comparisons: number;
  readonly swaps: number;
  readonly writesInArray: number;
  readonly errors: number;
  readonly hintsUsed: number;
  readonly score: number;
  readonly elapsedTimeMs: number;
  readonly level: QuickPracticeLevel;
  readonly practiceTitle: string;
}

export interface QuickGameScreenProps {
  readonly initialArray?: readonly number[];
  readonly level?: QuickPracticeLevel;
  readonly seed?: SeedInput;
  readonly practiceTitle?: string;
  readonly onComplete: (data: QuickPracticeCompleteData) => void;
  readonly onBackToSelector: () => void;
  readonly onOpenSelector?: () => void;
}

export default function QuickGameScreen({
  initialArray: propInitialArray,
  level = "basic",
  seed,
  practiceTitle,
  onComplete,
  onBackToSelector,
}: QuickGameScreenProps) {
  const instructionId = useId();

  // 1. Inicialização factual dos elementos imutáveis com identidades estáveis
  const [initialElements] = useState<readonly QuickElement[]>(() => {
    if (propInitialArray && propInitialArray.length > 0) {
      return assignQuickIdentities(propInitialArray);
    }
    const generated = generateQuickPracticeArray(level, seed);
    return generated.elements;
  });

  // 2. Estado da Engine pura (autoridade algorítmica exclusiva)
  const [engineState, setEngineState] = useState<QuickSortState>(() =>
    initQuickSortState(initialElements),
  );

  // 3. Quadro visual de apresentação (desacoplado do estado da engine durante animações)
  const [displayedFrame, setDisplayedFrame] =
    useState<QuickVisualStepFrame | null>(() => {
      const initialEngine = initQuickSortState(initialElements);
      if (initialEngine.history.length > 0) {
        return reconstructQuickVisualFrame(
          initialEngine.history[initialEngine.history.length - 1],
        );
      }
      return null;
    });

  // 4. Métricas de sessão e temporizador descritivo
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
      "Particione o vetor em torno do pivô: compare o número destacado e classifique-o como 'Menor ou igual' ou 'Maior que o pivô'.",
  });

  // 6. Controle síncrono de animação e trava estrita de decisão
  const [isActionLocked, setIsActionLocked] = useState<boolean>(false);
  const isActionLockedRef = useRef<boolean>(false);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const presentationIdRef = useRef<number>(0);

  // 7. Apresentação discreta de múltiplos quadros (acessibilidade / reduced motion)
  const [pendingFrames, setPendingFrames] = useState<
    readonly QuickVisualStepFrame[]
  >([]);
  const [pendingFrameIndex, setPendingFrameIndex] = useState<number>(0);
  const pendingFinalStateRef = useRef<QuickSortState | null>(null);

  // Atualização periódica do tempo decorrido descritivo
  useEffect(() => {
    const timer = setInterval(() => {
      if (!engineState.completed) {
        setElapsedTimeMs(Date.now() - startTimeRef.current);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [engineState.completed]);

  // Limpeza de timers no desmonte do componente
  useEffect(() => {
    return () => {
      presentationIdRef.current++;
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

  // Disparo de conclusão ao finalizar apresentação do último quadro
  const handleComplete = useCallback(
    (finalState: QuickSortState) => {
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
        swaps: finalState.swaps,
        writesInArray: finalState.writesInArray,
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

  // Avanço manual discreto de quadro (prefers-reduced-motion)
  const handleAdvancePendingFrame = useCallback(() => {
    if (pendingFrames.length === 0) return;
    const nextIdx = pendingFrameIndex + 1;
    if (nextIdx < pendingFrames.length) {
      setPendingFrameIndex(nextIdx);
      setDisplayedFrame(pendingFrames[nextIdx]);

      // Se atingiu o último quadro da sequência:
      if (nextIdx === pendingFrames.length - 1 && pendingFinalStateRef.current) {
        const finalState = pendingFinalStateRef.current;
        setEngineState(finalState);
        setIsActionLocked(false);
        isActionLockedRef.current = false;
        setPendingFrames([]);
        setPendingFrameIndex(0);
        pendingFinalStateRef.current = null;

        if (finalState.completed) {
          const currentPresId = presentationIdRef.current;
          const tId = setTimeout(() => {
            if (presentationIdRef.current === currentPresId) {
              handleComplete(finalState);
            }
          }, 600);
          timersRef.current.push(tId);
        }
      }
    }
  }, [handleComplete, pendingFrames, pendingFrameIndex]);

  // Execução de decisão com apresentação sequencial dos eventos
  const handleDecision = useCallback(
    (decision: QuickDecision) => {
      if (isActionLockedRef.current || engineState.completed) return;

      const stateBefore = engineState;
      const result = stepQuickSort(stateBefore, decision);

      if (!result.success) {
        // Erro conceitual ou ação inválida
        setEngineState(result.state);
        const feedbackInfo = getQuickFeedback(stateBefore, decision);
        setFeedback({
          type: result.isError ? "error" : "warning",
          message: feedbackInfo.message + (feedbackInfo.explanation ? ` ${feedbackInfo.explanation}` : ""),
        });
        return;
      }

      // Decisão válida!
      const currentPresId = ++presentationIdRef.current;
      const prevHistoryLen = stateBefore.history.length;
      const newHistory = result.state.history;
      const newRecords = newHistory.slice(prevHistoryLen);
      const newFrames = newRecords.map(reconstructQuickVisualFrame);

      const feedbackInfo = getQuickFeedback(stateBefore, decision);
      setFeedback({
        type: "success",
        message: feedbackInfo.message || "Decisão correta! Acompanhe o avanço do particionamento.",
      });

      const prefersReducedMotion =
        typeof window !== "undefined" &&
        Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);

      if (newFrames.length <= 1) {
        // Apresentação imediata quando há 1 ou nenhum novo quadro intermediário
        const finalFrame =
          newFrames[newFrames.length - 1] ??
          reconstructQuickVisualFrame(newHistory[newHistory.length - 1]);
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
        // Apresentação discreta com avanço manual
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
            const tId = setTimeout(animateNextFrame, 240);
            timersRef.current.push(tId);
          } else {
            // Fim da animação da sequência
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
    [engineState, handleComplete],
  );

  // Solicitação de dica pedagógica em 3 níveis progressivos
  const handleRequestHint = useCallback(() => {
    if (engineState.completed) return;
    setSessionMetrics((prev) => recordHintUsed(prev));
    const hintLevel = Math.min(3, (sessionMetrics.hintsUsed % 3) + 1) as
      | 1
      | 2
      | 3;
    const hintText = getQuickHint(engineState, hintLevel);
    setActiveHint(hintText);
    setFeedback({
      type: "info",
      message: `Dica pedagógica (Nível ${hintLevel}): ${hintText}`,
    });
  }, [engineState, sessionMetrics.hintsUsed]);

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

    const freshEngine = initQuickSortState(initialElements);
    setEngineState(freshEngine);

    if (freshEngine.history.length > 0) {
      setDisplayedFrame(
        reconstructQuickVisualFrame(
          freshEngine.history[freshEngine.history.length - 1],
        ),
      );
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
        "Prática reiniciada com o mesmo lote. Siga a classificação em torno do pivô.",
    });
  }, [initialElements]);

  // Atalhos de teclado locais com proteção rigorosa contra conflitos de foco e repetição
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
          (elem as HTMLElement)?.isContentEditable,
      );

      // Se qualquer controle interativo estiver focado, preserva o Enter e Espaço nativos
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

      // Se houver quadros pendentes para avanço manual (reduced motion)
      if (pendingFrames.length > 0) {
        if (event.key === "1" || (!isInteractive && event.key === " ")) {
          event.preventDefault();
          handleAdvancePendingFrame();
        }
        return;
      }

      if (isActionLockedRef.current || engineState.completed) {
        return;
      }

      if (event.key === "1") {
        event.preventDefault();
        if (engineState.phase === "INSPECT_ELEMENT") {
          handleDecision("LESS_OR_EQUAL");
        }
      } else if (event.key === "2") {
        event.preventDefault();
        if (engineState.phase === "INSPECT_ELEMENT") {
          handleDecision("GREATER");
        }
      } else if (event.key === "3") {
        event.preventDefault();
        if (engineState.phase === "PARTITION_READY_FOR_PIVOT") {
          handleDecision("PLACE_PIVOT");
        }
      } else if (event.key === "Escape") {
        event.preventDefault();
        onBackToSelector();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    engineState.completed,
    engineState.phase,
    handleAdvancePendingFrame,
    handleDecision,
    onBackToSelector,
    pendingFrames.length,
  ]);

  // Derivação do estado visual a partir do frame exibido
  const currentElements: readonly QuickElement[] =
    displayedFrame?.values ?? engineState.values;
  const currentSortedIndices: readonly number[] =
    displayedFrame?.sortedIndices ?? engineState.sortedIndices;
  const currentInterval =
    displayedFrame?.activeInterval ?? engineState.activeInterval;
  const currentI = displayedFrame ? displayedFrame.i : engineState.i;
  const currentJ = displayedFrame ? displayedFrame.j : engineState.j;
  const currentPivotIndex = displayedFrame
    ? displayedFrame.pivotIndex
    : engineState.pivotIndex;
  const currentPivotElement = displayedFrame
    ? displayedFrame.pivotElement
    : engineState.pivotElement;

  const displayedComparisons =
    displayedFrame?.comparisons ?? engineState.comparisons;
  const displayedSwaps = displayedFrame?.swaps ?? engineState.swaps;
  const displayedWrites =
    displayedFrame?.writesInArray ?? engineState.writesInArray;
  const displayedErrors = engineState.errors;
  const currentScore = calculateProtocolScore({
    errors: displayedErrors,
    hintsUsed: sessionMetrics.hintsUsed,
  });

  const isInspecting =
    !isActionLocked &&
    !engineState.completed &&
    engineState.phase === "INSPECT_ELEMENT";
  const isReadyForPivot =
    !isActionLocked &&
    !engineState.completed &&
    engineState.phase === "PARTITION_READY_FOR_PIVOT";

  // Mapeamento visual das 4 regiões de Lomuto para os limites textuais
  const low = currentInterval?.low ?? 0;
  const high = currentInterval?.high ?? currentElements.length - 1;
  const hasActiveInterval = currentInterval !== null && !engineState.completed;

  // Região 1: menores ou iguais [low .. i]
  const lessOrEqualEmpty = !hasActiveInterval || currentI === null || currentI < low;
  const lessOrEqualRange = lessOrEqualEmpty ? "vazia" : `[${low}..${currentI}]`;

  // Região 2: maiores que o pivô [i + 1 .. j - 1]
  const greaterStart = (currentI ?? low - 1) + 1;
  const greaterEnd = (currentJ ?? low) - 1;
  const greaterEmpty = !hasActiveInterval || greaterEnd < greaterStart;
  const greaterRange = greaterEmpty ? "vazia" : `[${greaterStart}..${greaterEnd}]`;

  // Região 3: em análise e pendentes [j .. high - 1]
  const pendingStart = (currentJ ?? low) + 1;
  const pendingEnd = high - 1;
  const pendingEmpty = !hasActiveInterval || pendingEnd < pendingStart;
  const pendingRange = pendingEmpty
    ? "nenhum restante"
    : `[${pendingStart}..${pendingEnd}]`;

  // Identificação do elemento sob análise atual
  const inspectingElement =
    hasActiveInterval && currentJ !== null && currentJ < currentElements.length
      ? currentElements[currentJ]
      : null;

  return (
    <div className="relative w-full h-full min-h-screen overflow-y-auto overflow-x-hidden bg-[#060b1a] bg-grid scanlines flex flex-col items-center justify-start pt-4 sm:pt-6 pb-16 sm:pb-24 px-3 sm:px-6 select-none">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-500/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-5 max-w-4xl w-full px-2 sm:px-4 my-0">
        {/* Barra superior de status e controles de navegação */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3 panel-border bg-[#0d1635]/70 rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2.5">
            <span
              className="px-2.5 py-1 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold tracking-widest uppercase"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {practiceTitle ??
                (level === "basic"
                  ? "PRÁTICA BÁSICA (n=4)"
                  : level === "intermediate"
                    ? "PRÁTICA INTERMEDIÁRIA (n=5)"
                    : "PRÁTICA AVANÇADA (n=6)")}
            </span>
            <span
              className="text-xs text-slate-300 font-mono hidden sm:inline"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Tempo: {formatElapsedTime(elapsedTimeMs)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <GameButton
              onClick={handleRequestHint}
              variant="secondary"
              size="sm"
              icon="💡"
              disabled={isActionLocked || engineState.completed}
            >
              DICA (-5)
            </GameButton>
            <GameButton
              onClick={handleRestart}
              variant="secondary"
              size="sm"
              icon="↺"
            >
              REINICIAR
            </GameButton>
            <GameButton
              onClick={onBackToSelector}
              variant="secondary"
              size="sm"
              icon="☰"
            >
              SELETOR
            </GameButton>
          </div>
        </div>

        {/* Banner de apresentação discreta com Reduced Motion */}
        {pendingFrames.length > 0 && (
          <div className="w-full panel-border bg-blue-950/40 border-blue-500/40 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5 text-center sm:text-left">
              <span className="text-xs font-bold text-blue-300 font-mono">
                MOVIMENTO REDUZIDO ATIVO
              </span>
              <span className="text-xs text-slate-200">
                Passo {pendingFrameIndex + 1} de {pendingFrames.length}:{" "}
                {displayedFrame?.explanation}
              </span>
            </div>
            <GameButton
              onClick={handleAdvancePendingFrame}
              variant="primary"
              size="sm"
              icon="▶"
            >
              AVANÇAR PASSO ({pendingFrameIndex + 1}/{pendingFrames.length}) [1]
            </GameButton>
          </div>
        )}

        {/* Painel de Instrução e Contexto de Comparação */}
        <div className="w-full space-y-3">
          <InstructionPanel
            message={feedback.message}
            type={feedback.type}
          />

          <div className="p-3 sm:p-4 rounded-xl border border-slate-700/60 bg-slate-900/60 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-amber-300">
                {engineState.completed
                  ? "ORDENAÇÃO CONCLUÍDA"
                  : isReadyForPivot
                    ? "FECHAMENTO DA PARTIÇÃO — POSICIONE O PIVÔ"
                    : "PARTICIONAMENTO — CLASSIFIQUE O NÚMERO"}
              </span>
            </div>
            <p
              id={instructionId}
              className="text-xs sm:text-sm text-slate-200 leading-relaxed"
              style={{ fontFamily: "'Exo 2', sans-serif" }}
            >
              {engineState.completed
                ? "Todos os subintervalos foram processados. O vetor está completamente ordenado em tempo in-place!"
                : isReadyForPivot
                  ? `Todos os elementos do trecho foram classificados. O pivô ${currentPivotElement?.value ?? ""} deve agora assumir a sua posição definitiva no índice ${(currentI ?? low - 1) + 1}.`
                  : inspectingElement && currentPivotElement
                    ? `Compare o número em análise (${inspectingElement.value}${inspectingElement.labelSuffix ? ` [${inspectingElement.labelSuffix}]` : ""}) com o pivô fixado (${currentPivotElement.value}${currentPivotElement.labelSuffix ? ` [${currentPivotElement.labelSuffix}]` : ""}).`
                    : "Acompanhe os ponteiros e classifique cada elemento em relação ao pivô."}
            </p>

            {/* Pílula de destaque da comparação atual */}
            {isInspecting && inspectingElement && currentPivotElement && (
              <div className="inline-flex flex-wrap items-center gap-2 py-1 px-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-xs font-mono">
                <span className="text-cyan-300 font-bold">
                  Elemento: {inspectingElement.value}
                  {inspectingElement.labelSuffix && (
                    <span className="ml-1 text-[10px] text-cyan-200 bg-cyan-950/80 px-1 py-0.2 rounded border border-cyan-400/40">
                      {inspectingElement.labelSuffix}
                    </span>
                  )}
                </span>
                <span className="text-slate-400 font-bold">vs</span>
                <span className="text-amber-300 font-bold">
                  Pivô: {currentPivotElement.value}
                  {currentPivotElement.labelSuffix && (
                    <span className="ml-1 text-[10px] text-amber-200 bg-amber-950/80 px-1 py-0.2 rounded border border-amber-400/40">
                      {currentPivotElement.labelSuffix}
                    </span>
                  )}
                </span>
                {inspectingElement.value === currentPivotElement.value && (
                  <span className="text-emerald-300 font-bold ml-1">
                    (Empate: valores iguais são classificados como ≤ pivô)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Vetor Principal Único */}
        <div className="w-full panel-border bg-[#080f28]/80 rounded-xl px-3 sm:px-6 py-5 flex flex-col items-center gap-4">
          {/* Cabeçalho do trecho ativo */}
          <div className="w-full flex items-center justify-between text-xs font-mono border-b border-white/10 pb-2">
            <span
              className="text-slate-400 tracking-wider uppercase"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              VETOR PRINCIPAL
            </span>
            <span
              className="text-amber-300 font-bold"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {hasActiveInterval
                ? `Trecho Ativo: [${low} .. ${high}] | Pivô fixado: índice ${high}`
                : engineState.completed
                  ? "Vetor Consolidado"
                  : "Processando subintervalos..."}
            </span>
          </div>

          {/* Elementos renderizados */}
          <div className="w-full overflow-x-auto py-2">
            <div className="flex items-center justify-center gap-2 sm:gap-3.5 min-w-max mx-auto px-2">
              {currentElements.map((elem, idx) => {
                const visualStatus: QuickElementVisualStatus =
                  getQuickElementVisualStatus(
                    idx,
                    displayedFrame ?? engineState,
                  );

                let boxRole: BoxRole = "default";
                let badge: string = "PKG";

                switch (visualStatus) {
                  case "DEFINITIVE":
                    boxRole = "sorted";
                    badge = "OK";
                    break;
                  case "PIVOT":
                    boxRole = "pivot";
                    badge = "PIVÔ";
                    break;
                  case "COMPARING":
                    boxRole = "scan";
                    badge = "ANALISANDO";
                    break;
                  case "LESS_OR_EQUAL_REGION":
                    boxRole = "quick-less";
                    badge = "≤ PIVÔ";
                    break;
                  case "GREATER_REGION":
                    boxRole = "quick-greater";
                    badge = "> PIVÔ";
                    break;
                  case "PENDING_IN_INTERVAL":
                    boxRole = "quick-pending";
                    badge = "PENDENTE";
                    break;
                  case "OUTSIDE_INTERVAL":
                  default:
                    boxRole = "outside";
                    badge = "EXTERNO";
                    break;
                }

                return (
                  <NumberedBox
                    key={elem.id}
                    value={elem.value}
                    index={idx}
                    elementLabel={elem.labelSuffix}
                    role={boxRole}
                    badge={badge}
                    disabled={isActionLocked || engineState.completed}
                    size="md"
                  />
                );
              })}
            </div>
          </div>

          {/* Resumo das 4 Regiões de Lomuto com limites textuais explícitos */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10 text-xs font-mono">
            <div className="flex flex-col p-2 rounded bg-blue-950/30 border border-blue-500/20">
              <span className="text-blue-300 font-bold">1. ≤ Pivô</span>
              <span className="text-slate-300 text-[11px]">
                {lessOrEqualRange}
              </span>
            </div>

            <div className="flex flex-col p-2 rounded bg-purple-950/30 border border-purple-500/20">
              <span className="text-purple-300 font-bold">2. &gt; Pivô</span>
              <span className="text-slate-300 text-[11px]">
                {greaterRange}
              </span>
            </div>

            <div className="flex flex-col p-2 rounded bg-cyan-950/30 border border-cyan-500/20">
              <span className="text-cyan-300 font-bold">3. Não analisados</span>
              <span className="text-slate-300 text-[11px]">
                {pendingRange}
              </span>
            </div>

            <div className="flex flex-col p-2 rounded bg-amber-950/30 border border-amber-500/20">
              <span className="text-amber-300 font-bold">4. Pivô</span>
              <span className="text-slate-300 text-[11px]">
                {hasActiveInterval && currentPivotElement
                  ? `[${high}] (${currentPivotElement.value}${currentPivotElement.labelSuffix ? currentPivotElement.labelSuffix : ""})`
                  : "consolidado"}
              </span>
            </div>
          </div>
        </div>

        {/* Controles de Ação Ergonômicos (Próximos do vetor e com foco visível) */}
        <div className="w-full flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-2">
          <GameButton
            onClick={() => handleDecision("LESS_OR_EQUAL")}
            variant={isInspecting ? "primary" : "secondary"}
            size="md"
            icon="≤"
            disabled={!isInspecting}
          >
            MENOR OU IGUAL AO PIVÔ [1]
          </GameButton>

          <GameButton
            onClick={() => handleDecision("GREATER")}
            variant={isInspecting ? "secondary" : "secondary"}
            size="md"
            icon=">"
            disabled={!isInspecting}
          >
            MAIOR QUE O PIVÔ [2]
          </GameButton>

          <GameButton
            onClick={() => handleDecision("PLACE_PIVOT")}
            variant={isReadyForPivot ? "primary" : "secondary"}
            size="md"
            icon="⤓"
            disabled={!isReadyForPivot}
          >
            COLOCAR O PIVÔ NA POSIÇÃO FINAL [3]
          </GameButton>
        </div>

        {/* Painéis de Apoio: Telemetria e Pseudocódigo Canônico */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Métricas e Telemetria */}
          <div className="panel-border bg-[#0d1635]/60 rounded-xl p-4 sm:p-5 flex flex-col gap-3">
            <span
              className="text-xs text-slate-300 font-bold tracking-widest uppercase font-mono"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              MÉTRICAS DA OPERAÇÃO
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="flex flex-col p-2.5 rounded-lg bg-[#080f28]/60 border border-white/5">
                <span className="text-[10px] text-slate-400 font-mono uppercase">
                  Comparações
                </span>
                <span
                  data-testid="quick-comparisons"
                  className="text-xl font-bold text-cyan-300"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  {displayedComparisons}
                </span>
              </div>

              <div className="flex flex-col p-2.5 rounded-lg bg-[#080f28]/60 border border-white/5">
                <span className="text-[10px] text-slate-400 font-mono uppercase">
                  Trocas
                </span>
                <span
                  data-testid="quick-swaps"
                  className="text-xl font-bold text-purple-300"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  {displayedSwaps}
                </span>
              </div>

              <div className="flex flex-col p-2.5 rounded-lg bg-[#080f28]/60 border border-white/5">
                <span className="text-[10px] text-slate-400 font-mono uppercase">
                  Escritas no Vetor
                </span>
                <span
                  data-testid="quick-writes"
                  className="text-xl font-bold text-amber-300"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  {displayedWrites}
                </span>
              </div>

              <div className="flex flex-col p-2.5 rounded-lg bg-[#080f28]/60 border border-white/5">
                <span className="text-[10px] text-slate-400 font-mono uppercase">
                  Decisões Incorretas
                </span>
                <span
                  data-testid="quick-errors"
                  className={`text-xl font-bold ${displayedErrors > 0 ? "text-amber-400" : "text-slate-400"}`}
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  {displayedErrors}
                </span>
              </div>

              <div className="flex flex-col p-2.5 rounded-lg bg-[#080f28]/60 border border-white/5">
                <span className="text-[10px] text-slate-400 font-mono uppercase">
                  Dicas Usadas
                </span>
                <span
                  className="text-xl font-bold text-cyan-400"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  {sessionMetrics.hintsUsed}
                </span>
              </div>

              <div className="flex flex-col p-2.5 rounded-lg bg-[#080f28]/60 border border-white/5">
                <span className="text-[10px] text-slate-400 font-mono uppercase">
                  Pontuação
                </span>
                <span
                  className="text-xl font-bold text-emerald-300"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  {currentScore}
                </span>
              </div>
            </div>

            <div className="mt-1 p-2 rounded bg-amber-950/20 border border-amber-500/20 text-[11px] text-slate-300 leading-normal">
              <span className="text-amber-300 font-bold block mb-0.5">
                Regra Pedagógica de Troca:
              </span>
              Quando um número é menor ou igual ao pivô, a fronteira avança (i ←
              i + 1). Se i for diferente de j, ocorre troca física (+1 troca, +2
              escritas); se i for igual a j, a troca é omitida (0 trocas, 0
              escritas).
            </div>
          </div>

          {/* Pseudocódigo Canônico de 27 Linhas */}
          <div className="panel-border bg-[#080f28]/80 rounded-xl p-4 sm:p-5 flex flex-col gap-2 max-h-[360px] overflow-y-auto">
            <span
              className="text-xs text-slate-300 font-bold tracking-widest uppercase font-mono sticky top-0 bg-[#080f28] py-1 border-b border-white/10"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              PSEUDOCÓDIGO — QUICK SORT (LOMUTO)
            </span>

            <div className="flex flex-col gap-0.5 font-mono text-[10px]">
              {QUICK_SORT_PSEUDOCODE_LINES.map((line, idx) => {
                const lineNum = idx + 1;
                const isCurrentLine =
                  displayedFrame?.pseudocodeLine === lineNum;
                const trimmed = line.trimStart();
                const leadingSpaces = line.length - trimmed.length;
                const paddingLeft = Math.max(6, leadingSpaces * 6 + 6);

                return (
                  <div
                    key={lineNum}
                    className={`px-1.5 py-0.5 rounded leading-tight flex items-baseline gap-2 ${
                      isCurrentLine
                        ? "bg-amber-500/20 text-amber-200 border-l-2 border-amber-400 font-bold"
                        : "text-white/40 hover:text-white/70"
                    }`}
                    style={{ paddingLeft: `${paddingLeft}px` }}
                  >
                    <span className="text-[9px] text-slate-400 w-4 select-none">
                      {lineNum}
                    </span>
                    <span>{trimmed || " "}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
