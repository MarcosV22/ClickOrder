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
      "Bem-vindo à Estação de Intercalação! Observe a confluência dos ramais e despache a menor carga para o buffer.",
  });

  // 6. Controle síncrono de animação e trava de decisão
  const [isActionLocked, setIsActionLocked] = useState<boolean>(false);
  const isActionLockedRef = useRef<boolean>(false);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  // 7. Rastreamento dos intervalos consolidados com COPY_BACK
  const locallySortedIntervalsRef = useRef<{ left: number; right: number }[]>(
    [],
  );

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

      // Decisão válida! Registrar intervalos consolidados por cópia de retorno
      const prevHistoryLen = stateBefore.history.length;
      const newHistory = result.state.history;
      const allFrames = deriveMergeFramesFromHistory(
        initialElements,
        newHistory,
      );
      const newFrames = allFrames.slice(prevHistoryLen);

      for (let i = prevHistoryLen; i < newHistory.length; i++) {
        const rec = newHistory[i];
        if (rec.type === "COPY_BACK") {
          locallySortedIntervalsRef.current.push({
            left: rec.left,
            right: rec.right,
          });
        }
      }

      const feedbackMsg = getMergeStepFeedback(result, stateBefore, decision);
      setFeedback({
        type: "success",
        message: feedbackMsg,
      });

      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReducedMotion || newFrames.length <= 1) {
        // Apresentação imediata sem timers
        const finalFrame = allFrames[allFrames.length - 1] ?? null;
        setDisplayedFrame(finalFrame);
        setEngineState(result.state);
        setIsActionLocked(false);
        isActionLockedRef.current = false;

        if (result.state.completed) {
          handleComplete(result.state);
        }
      } else {
        // Apresentação sequencial com bloqueio de decisões até o quadro final
        setIsActionLocked(true);
        isActionLockedRef.current = true;

        let frameIdx = 0;
        const animateNextFrame = () => {
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
                handleComplete(result.state);
              }, 400);
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
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    isActionLockedRef.current = false;
    setIsActionLocked(false);
    locallySortedIntervalsRef.current = [];

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

  // Atalhos de teclado locais (1, 2, 3)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      const target = event.target as HTMLElement | null;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

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
  }, [handleDecision]);

  // Dados derivados do quadro atual em exibição
  const currentValues = displayedFrame?.values ?? engineState.values;
  const currentBuffer = displayedFrame?.buffer ?? engineState.buffer;
  const currentInterval =
    displayedFrame?.activeInterval ?? engineState.activeInterval;
  const currentPhase = displayedFrame?.phase ?? engineState.phase;
  const p1 = displayedFrame?.p1 ?? engineState.p1;
  const p2 = displayedFrame?.p2 ?? engineState.p2;
  const k = displayedFrame?.k ?? engineState.k;
  const isCompleted = engineState.completed || currentPhase === "COMPLETED";

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

  // Helper para verificar se um índice do vetor principal está em intervalo já consolidado (ORD)
  const isIndexLocallyOrdered = (idx: number): boolean => {
    if (isCompleted) return false;
    for (const range of locallySortedIntervalsRef.current) {
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

  // Pontuação estimada atual
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
              disabled={isActionLocked}
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

        {/* Faixa de Telemetria Contínua */}
        <section
          aria-label="Telemetria da Operação"
          className="w-full grid grid-cols-2 sm:grid-cols-6 gap-2 bg-[#080f28]/70 border border-white/5 rounded-xl p-3"
        >
          <div className="flex flex-col items-center">
            <span
              className="text-[9px] text-white/40 uppercase font-mono"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Comparações
            </span>
            <span
              className="text-lg font-bold text-cyan-300"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              {engineState.comparisons}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span
              className="text-[9px] text-white/40 uppercase font-mono"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Escritas Buffer
            </span>
            <span
              className="text-lg font-bold text-blue-300"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              {engineState.writesInBuffer}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span
              className="text-[9px] text-white/40 uppercase font-mono"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Escritas Principal
            </span>
            <span
              className="text-lg font-bold text-cyan-200"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              {engineState.writesInMain}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span
              className="text-[9px] text-white/40 uppercase font-mono"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Total Escritas
            </span>
            <span
              className="text-lg font-bold text-sky-400"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              {engineState.totalWrites}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span
              className="text-[9px] text-white/40 uppercase font-mono"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Decisões Incorretas
            </span>
            <span
              className={`text-lg font-bold ${engineState.errors > 0 ? "text-amber-400" : "text-white/60"}`}
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              {engineState.errors}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span
              className="text-[9px] text-white/40 uppercase font-mono"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Pontuação
            </span>
            <span
              className="text-lg font-bold text-emerald-400"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              {currentScore}
            </span>
          </div>
        </section>

        {/* Vetor Principal (Esteira Global) */}
        <section
          aria-label="Esteira Principal"
          className="w-full panel-border bg-[#091129]/80 rounded-xl px-4 py-4 flex flex-col gap-2"
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-white/40 px-1">
            <span className="uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block animate-pulse" />
              ESTEIRA PRINCIPAL (A[0..{initialElements.length - 1}])
            </span>
            {currentInterval ? (
              <span className="text-cyan-300">
                Intercalando Subintervalo: [{currentInterval.left}..
                {currentInterval.right}] | Corte: mid={currentInterval.mid}
              </span>
            ) : isCompleted ? (
              <span className="text-emerald-400 font-bold">
                ✓ TODAS AS CARGAS CONSOLIDADAS (STATUS OK)
              </span>
            ) : (
              <span>Aguardando partição</span>
            )}
          </div>

          {/* Esteira com overflow-x isolado */}
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
                  : isP1
                    ? "SENSOR E"
                    : isP2
                      ? "SENSOR D"
                      : isDispatched
                        ? "COLETADO"
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
        </section>

        {/* Estação de Intercalação: Ramais Convergentes + Sensor Óptico + Buffer Auxiliar */}
        {currentInterval && !isCompleted && (
          <section
            aria-label="Estação de Intercalação"
            className="w-full panel-border bg-[#0b1638]/90 rounded-xl p-5 flex flex-col gap-4 border-2 border-blue-500/20"
          >
            {/* Título da Confluência */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span
                className="text-xs font-mono font-bold tracking-widest text-blue-300 uppercase flex items-center gap-2"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                CONFLUÊNCIA DE RAMAIS (PÁTIO DE TRIAGEM)
              </span>
              <span
                className="text-[10px] text-white/40 font-mono"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                Subvetor E: A[{currentInterval.left}..{currentInterval.mid}] ⇄
                Subvetor D: A[{currentInterval.mid + 1}..{currentInterval.right}]
              </span>
            </div>

            {/* Janelas dos Dois Ramais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ramal Esquerdo */}
              <div
                className={`flex flex-col gap-2 p-3 rounded-lg border ${
                  p1 <= currentInterval.mid
                    ? "border-cyan-500/40 bg-cyan-950/20"
                    : "border-slate-700 bg-slate-900/30 opacity-60"
                }`}
              >
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="font-bold text-cyan-300">
                    RAMAL ESQUERDO (A[{currentInterval.left}..
                    {currentInterval.mid}])
                  </span>
                  <span
                    className={
                      p1 <= currentInterval.mid
                        ? "text-cyan-400 font-bold"
                        : "text-amber-400 font-bold"
                    }
                  >
                    {p1 <= currentInterval.mid
                      ? `Frente p1 = #${p1 + 1}`
                      : "RAMAL ESGOTADO"}
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
                          className={`flex flex-col items-center gap-1 ${
                            isDispatched
                              ? "opacity-30"
                              : isHead
                                ? "scale-105"
                                : ""
                          }`}
                        >
                          <NumberedBox
                            value={elem.value}
                            elementLabel={elem.label}
                            index={absoluteIdx}
                            role={isHead ? "pair" : "default"}
                            badge={
                              isHead
                                ? "FRENTE E"
                                : isDispatched
                                  ? "DESPACHADO"
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

              {/* Ramal Direito */}
              <div
                className={`flex flex-col gap-2 p-3 rounded-lg border ${
                  p2 <= currentInterval.right
                    ? "border-blue-500/40 bg-blue-950/20"
                    : "border-slate-700 bg-slate-900/30 opacity-60"
                }`}
              >
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="font-bold text-blue-300">
                    RAMAL DIREITO (A[{currentInterval.mid + 1}..
                    {currentInterval.right}])
                  </span>
                  <span
                    className={
                      p2 <= currentInterval.right
                        ? "text-blue-400 font-bold"
                        : "text-amber-400 font-bold"
                    }
                  >
                    {p2 <= currentInterval.right
                      ? `Frente p2 = #${p2 + 1}`
                      : "RAMAL ESGOTADO"}
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
                          className={`flex flex-col items-center gap-1 ${
                            isDispatched
                              ? "opacity-30"
                              : isHead
                                ? "scale-105"
                                : ""
                          }`}
                        >
                          <NumberedBox
                            value={elem.value}
                            elementLabel={elem.label}
                            index={absoluteIdx}
                            role={isHead ? "pair" : "default"}
                            badge={
                              isHead
                                ? "FRENTE D"
                                : isDispatched
                                  ? "DESPACHADO"
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

            {/* Painel do Sensor Óptico de Confluência */}
            <div className="p-3 rounded-lg bg-[#070d22] border border-cyan-500/20 flex flex-col items-center justify-center gap-1 text-center">
              {currentPhase === "COMPARE_HEADS" && leftHead && rightHead ? (
                <>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                    SENSORES ÓPTICOS EM CONFRONTO ATIVO
                  </span>
                  <div
                    className="flex items-center gap-4 text-sm font-bold text-white"
                    style={{ fontFamily: "'Orbitron', sans-serif" }}
                  >
                    <span className="text-cyan-300">
                      Ramal E [{formatMergeElementLabel(leftHead)}]
                    </span>
                    <span className="text-white/40 font-mono">vs</span>
                    <span className="text-blue-300">
                      Ramal D [{formatMergeElementLabel(rightHead)}]
                    </span>
                  </div>
                  <span className="text-[10px] text-white/50 font-mono">
                    Critério: Despachar o menor valor. Em empate (==), despachar
                    OBRIGATORIAMENTE o Ramal Esquerdo para estabilidade!
                  </span>
                </>
              ) : currentPhase === "DRAIN_READY" ? (
                <>
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">
                    DRENAGEM DIRETA DE CAUDA
                  </span>
                  <p className="text-xs text-white/80 font-mono">
                    Um dos ramais foi totalmente colhido. As cargas restantes
                    já são maiores que as despachadas e estão ordenadas entre si.
                  </p>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    Acione "Despachar Restante" (3) para transferi-las em lote
                    com 0 comparações.
                  </span>
                </>
              ) : (
                <span className="text-xs text-white/40 font-mono">
                  Processando eventos automáticos da estação...
                </span>
              )}
            </div>

            {/* Esteira Coletora Temporária (Buffer Auxiliar) */}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <div className="flex justify-between items-center text-[10px] font-mono text-white/40">
                <span className="uppercase tracking-widest text-blue-300">
                  ESTEIRA COLETORA AUXILIAR (BUFFER TEMPORÁRIO B[0..
                  {currentInterval.right - currentInterval.left}])
                </span>
                <span>
                  Alocação de Memória Auxiliar:{" "}
                  {currentInterval.right - currentInterval.left + 1} posições
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
                          className="text-white/30 font-mono"
                          style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: "10px",
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
                            className={`w-20 h-20 rounded-lg flex flex-col items-center justify-center border-2 border-dashed transition-all ${
                              isTarget
                                ? "border-cyan-400 bg-cyan-950/40 animate-pulse text-cyan-300"
                                : "border-slate-700 bg-slate-900/40 text-slate-600"
                            }`}
                          >
                            <span className="text-[9px] font-mono tracking-widest">
                              {isTarget ? "PRÓXIMO" : "VAGO"}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <span className="text-[10px] text-white/30 font-mono text-center">
                * Ao completar o preenchimento, o buffer será copiado de volta
                para A[{currentInterval.left}..{currentInterval.right}] com
                status ORD (ou OK na raiz).
              </span>
            </div>
          </section>
        )}

        {/* Painel de Pseudocódigo e Feedback */}
        <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Instruções e Feedback Pedagógico */}
          <div className="flex flex-col gap-3">
            <InstructionPanel
              message={feedback.message}
              type={feedback.type}
            />

            {activeHint && (
              <div className="p-3 rounded-lg border border-cyan-500/30 bg-cyan-950/30 text-[11px] font-mono text-cyan-200">
                <span className="font-bold text-cyan-300 block mb-0.5">
                  Dica de Triagem:
                </span>
                {activeHint}
              </div>
            )}
          </div>

          {/* Pseudocódigo Canônico */}
          <div className="panel-border bg-[#080f28]/80 rounded-xl p-4 flex flex-col gap-2">
            <span
              className="text-[10px] text-white/30 tracking-widest uppercase font-mono"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              PSEUDOCÓDIGO — INTERCALAÇÃO (CANÔNICO)
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
                    className={`px-2 py-0.5 rounded text-[10px] leading-relaxed transition-colors ${
                      isActive
                        ? "bg-blue-950/60 text-blue-300 font-bold border-l-2 border-blue-400"
                        : "text-white/40"
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
        </section>

        {/* Botoeira Inferior de Decisões do Estudante (Single Scroll Owner - Rolagem Acessível) */}
        <footer
          aria-label="Ações de Decisão"
          className="w-full panel-border bg-[#070e26]/95 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 sticky bottom-4 z-20 shadow-2xl backdrop-blur-md"
        >
          {/* Botão 1: Despachar Esquerda */}
          <GameButton
            variant="primary"
            size="lg"
            onClick={() => handleDecision("DISPATCH_LEFT")}
            disabled={!canDispatchLeft}
            className="w-full sm:w-auto min-w-[200px]"
            title="Despachar a carga do Ramal Esquerdo para a esteira coletora (Atalho 1)"
          >
            <div className="flex flex-col items-center">
              <span>1: DESPACHAR ESQUERDA</span>
              <span className="text-[10px] font-normal opacity-75">
                {leftHead ? `Carga ${formatMergeElementLabel(leftHead)}` : "—"}
              </span>
            </div>
          </GameButton>

          {/* Botão 2: Despachar Direita */}
          <GameButton
            variant="primary"
            size="lg"
            onClick={() => handleDecision("DISPATCH_RIGHT")}
            disabled={!canDispatchRight}
            className="w-full sm:w-auto min-w-[200px]"
            title="Despachar a carga do Ramal Direito para a esteira coletora (Atalho 2)"
          >
            <div className="flex flex-col items-center">
              <span>2: DESPACHAR DIREITA</span>
              <span className="text-[10px] font-normal opacity-75">
                {rightHead
                  ? `Carga ${formatMergeElementLabel(rightHead)}`
                  : "—"}
              </span>
            </div>
          </GameButton>

          {/* Botão 3: Despachar Restante */}
          <GameButton
            variant="primary"
            size="lg"
            onClick={() => handleDecision("DRAIN_REMAINDER")}
            disabled={!canDrain}
            className="w-full sm:w-auto min-w-[200px] border-emerald-500/50 hover:border-emerald-400"
            title="Drenar cauda remanescente em lote sem comparações (Atalho 3)"
          >
            <div className="flex flex-col items-center">
              <span>3: DESPACHAR RESTANTE</span>
              <span className="text-[10px] font-normal opacity-75">
                Drenagem Direta
              </span>
            </div>
          </GameButton>
        </footer>
      </div>
    </div>
  );
}
