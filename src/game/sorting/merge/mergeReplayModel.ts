/**
 * Modelo puro e imutável para derivação de quadros de Replay da Execução do Merge Sort.
 *
 * Consome estritamente o vetor inicial (`initialValues: readonly MergeElement[]`)
 * e o histórico factual gravado (`history: readonly MergeStepRecord[]`).
 *
 * NÃO reexecuta a engine de ordenação, NÃO chama initMergeSortState, NÃO chama
 * executeMergeStep e NÃO executa simulações adicionais.
 *
 * Invariante inegociável da plataforma:
 *   frames.length === 1 + history.length
 * Onde o quadro 0 é o Estado Inicial pré-evento com métricas zeradas,
 * e os quadros 1..N correspondem aos eventos gravados no histórico.
 */

import type {
  MergeElement,
  MergeStepRecord,
  MergePhase,
  MergeIntervalContext,
} from "./types";

export type MergeReplayFrameType =
  | "INITIAL"
  | "DIVIDE"
  | "MERGE_INIT"
  | "DISPATCH"
  | "DRAIN"
  | "COPY_BACK";

export interface MergeSortedInterval {
  readonly left: number;
  readonly right: number;
  readonly isRoot: boolean;
}

/**
 * Representação imutável de um quadro individual da reprodução (replay/demonstração)
 * do Merge Sort.
 */
export interface MergeReplayFrame {
  /** Número sequencial do quadro (0 para estado inicial, 1..totalSteps para passos gravados) */
  readonly stepNumber: number;
  /** Total de micro-passos algorítmicos no histórico (history.length) */
  readonly totalSteps: number;
  /** Índice no histórico (-1 para INITIAL, 0..history.length - 1 para passos gravados) */
  readonly stepIndex: number;
  /** Tipo discriminado do frame */
  readonly frameType: MergeReplayFrameType;
  /** Fase conceitual da intercalação */
  readonly phase: MergePhase;
  /** Intervalo ativo [left..right] com corte mid e profundidade, ou null se estado inicial ou entre intercalações */
  readonly activeInterval: MergeIntervalContext | null;
  /** Ponteiro do ramal esquerdo (null no estado inicial ou quando não aplicável) */
  readonly p1: number | null;
  /** Ponteiro do ramal direito (null no estado inicial ou quando não aplicável) */
  readonly p2: number | null;
  /** Ponteiro de escrita no buffer (0..buffer.length) */
  readonly k: number;
  /** Estado dos elementos na esteira principal neste quadro */
  readonly values: readonly MergeElement[];
  /** Estado dos elementos no buffer auxiliar neste quadro */
  readonly buffer: readonly (MergeElement | null)[];
  /** Rótulo textual da ação para o badge de destaque */
  readonly actionLabel: string;
  /** Explicação factual e descritiva do quadro */
  readonly explanation: string;
  /** Contadores cumulativos estritamente até este quadro */
  readonly cumulativeComparisons: number;
  readonly cumulativeWritesInBuffer: number;
  readonly cumulativeWritesInMain: number;
  readonly cumulativeTotalWrites: number;
  /** Subintervalos que já concluíram COPY_BACK até este quadro */
  readonly sortedIntervals: readonly MergeSortedInterval[];
  /** Indica se o quadro representa a ordenação concluída da esteira raiz */
  readonly isCompleted: boolean;
  /** Indica se este quadro pertence à intercalação da raiz [0..n-1] */
  readonly isRootMerge: boolean;
  /** Carga despachada ou manipulada neste passo, se aplicável */
  readonly dispatchedElement?: MergeElement | null;
  /** Ramal de origem da carga despachada ("LEFT" | "RIGHT" | null) */
  readonly dispatchedSource?: "LEFT" | "RIGHT" | null;
  /** Se houve comparação algorítmica neste passo */
  readonly comparisonCounted?: boolean;
  /** Posições das frentes que produziram a comparação algorítmica deste quadro, se aplicável */
  readonly comparedP1?: number | null;
  readonly comparedP2?: number | null;
  readonly comparedLeftElement?: MergeElement | null;
  readonly comparedRightElement?: MergeElement | null;
}

/**
 * Deriva deterministicamente a lista completa de quadros de replay do Merge Sort
 * a partir do vetor inicial e do histórico factual gravado.
 *
 * Invariante inegociável:
 * frames.length === 1 + history.length
 */
export function buildMergeReplayFrames(
  initialValues: readonly MergeElement[],
  history: readonly MergeStepRecord[],
): readonly MergeReplayFrame[] {
  const totalSteps = history.length;
  const n = initialValues.length;

  // Quadro 0: Estado Inicial antes de qualquer operação
  const isInitiallyCompleted = n <= 1;
  const initialFrame: MergeReplayFrame = Object.freeze({
    stepNumber: 0,
    totalSteps,
    stepIndex: -1,
    frameType: "INITIAL",
    phase: "DIVIDE_AUTOMATIC",
    activeInterval: null,
    p1: null,
    p2: null,
    k: 0,
    values: Object.freeze([...initialValues]),
    buffer: Object.freeze([]),
    actionLabel: "ESTADO INICIAL",
    explanation:
      "Estado inicial: lote de cargas recebido pela central pronto para triagem por Merge Sort.",
    cumulativeComparisons: 0,
    cumulativeWritesInBuffer: 0,
    cumulativeWritesInMain: 0,
    cumulativeTotalWrites: 0,
    sortedIntervals: Object.freeze(
      isInitiallyCompleted && n > 0
        ? [{ left: 0, right: n - 1, isRoot: true }]
        : [],
    ),
    isCompleted: isInitiallyCompleted,
    isRootMerge: false,
    dispatchedElement: null,
    dispatchedSource: null,
    comparisonCounted: false,
  });

  const frames: MergeReplayFrame[] = [initialFrame];

  let cumComparisons = 0;
  let cumWritesInBuffer = 0;
  let cumWritesInMain = 0;
  let activeContext: MergeIntervalContext | null = null;
  const sortedIntervalsAccumulator: MergeSortedInterval[] = isInitiallyCompleted && n > 0
    ? [{ left: 0, right: n - 1, isRoot: true }]
    : [];

  for (let idx = 0; idx < history.length; idx++) {
    const step = history[idx];
    let phase: MergePhase = "DIVIDE_AUTOMATIC";
    let p1: number | null = null;
    let p2: number | null = null;
    let k = 0;
    let isRootMerge = false;
    let actionLabel = "";
    let dispatchedElement: MergeElement | null = null;
    let dispatchedSource: "LEFT" | "RIGHT" | null = null;
    let comparisonCounted = false;
    let comparedP1: number | null = null;
    let comparedP2: number | null = null;
    let comparedLeftElement: MergeElement | null = null;
    let comparedRightElement: MergeElement | null = null;

    switch (step.type) {
      case "DIVIDE": {
        phase = "DIVIDE_AUTOMATIC";
        isRootMerge = step.left === 0 && step.right === n - 1;
        activeContext = Object.freeze({
          left: step.left,
          mid: step.mid,
          right: step.right,
          depth: step.depth,
          isRootMerge,
        });
        p1 = step.left;
        p2 = step.mid + 1;
        k = 0;
        actionLabel = "DIVISÃO DE FLUXO";
        break;
      }

      case "MERGE_INIT": {
        phase = "COMPARE_HEADS";
        isRootMerge = step.isRootMerge;
        activeContext = Object.freeze({
          left: step.left,
          mid: step.mid,
          right: step.right,
          depth: step.depth,
          isRootMerge: step.isRootMerge,
        });
        p1 = step.p1;
        p2 = step.p2;
        k = step.k;
        actionLabel = "INICIALIZAÇÃO DA INTERCALAÇÃO";
        break;
      }

      case "DISPATCH": {
        if (step.comparisonCounted) {
          cumComparisons++;
          comparisonCounted = true;
        }
        cumWritesInBuffer++;
        p1 = step.p1;
        p2 = step.p2;
        k = step.k;
        dispatchedElement = step.element;
        dispatchedSource = step.source;
        isRootMerge = activeContext?.isRootMerge ?? false;
        actionLabel =
          step.source === "LEFT"
            ? "DESPACHO RAMAL ESQUERDO"
            : "DESPACHO RAMAL DIREITO";

        comparedP1 = step.source === "LEFT" ? step.p1 - 1 : step.p1;
        comparedP2 = step.source === "RIGHT" ? step.p2 - 1 : step.p2;
        comparedLeftElement =
          step.source === "LEFT"
            ? step.element
            : (step.valuesSnapshot[comparedP1] ?? null);
        comparedRightElement =
          step.source === "RIGHT"
            ? step.element
            : (step.valuesSnapshot[comparedP2] ?? null);

        if (activeContext) {
          const leftDone = p1 > activeContext.mid;
          const rightDone = p2 > activeContext.right;
          phase = leftDone || rightDone ? "DRAIN_READY" : "COMPARE_HEADS";
        } else {
          phase = "COMPARE_HEADS";
        }
        break;
      }

      case "DRAIN": {
        cumWritesInBuffer += step.drainedElements.length;
        p1 = step.p1;
        p2 = step.p2;
        k = step.k;
        dispatchedSource = step.remainingSource;
        isRootMerge = activeContext?.isRootMerge ?? false;
        phase = "COPY_BACK_AUTOMATIC";
        actionLabel = `DRENAGEM RESTANTE (${step.remainingSource === "LEFT" ? "ESQUERDO" : "DIREITO"})`;
        break;
      }

      case "COPY_BACK": {
        cumWritesInMain += step.copiedElements.length;
        isRootMerge = step.isRootMerge;
        phase = step.isRootMerge ? "COMPLETED" : "DIVIDE_AUTOMATIC";
        p1 = null;
        p2 = null;
        k = 0;
        actionLabel = step.isRootMerge
          ? "CÓPIA DE RETORNO FINAL (OK)"
          : "CÓPIA DE RETORNO (ORD)";

        sortedIntervalsAccumulator.push({
          left: step.left,
          right: step.right,
          isRoot: step.isRootMerge,
        });

        activeContext = null;
        break;
      }
    }

    const isCompleted = step.type === "COPY_BACK" && step.isRootMerge;

    frames.push(
      Object.freeze({
        stepNumber: idx + 1,
        totalSteps,
        stepIndex: idx,
        frameType: step.type,
        phase,
        activeInterval: activeContext,
        p1,
        p2,
        k,
        values: step.valuesSnapshot,
        buffer: "bufferSnapshot" in step ? step.bufferSnapshot : Object.freeze([]),
        actionLabel,
        explanation: step.explanation,
        cumulativeComparisons: cumComparisons,
        cumulativeWritesInBuffer: cumWritesInBuffer,
        cumulativeWritesInMain: cumWritesInMain,
        cumulativeTotalWrites: cumWritesInBuffer + cumWritesInMain,
        sortedIntervals: Object.freeze([...sortedIntervalsAccumulator]),
        isCompleted,
        isRootMerge,
        dispatchedElement,
        dispatchedSource,
        comparisonCounted,
        comparedP1,
        comparedP2,
        comparedLeftElement,
        comparedRightElement,
      }),
    );
  }

  return Object.freeze(frames);
}

/**
 * Recupera seguramente um quadro de replay pelo índice, protegendo limites.
 */
export function getMergeReplayFrame(
  frames: readonly MergeReplayFrame[],
  index: number,
): MergeReplayFrame {
  if (frames.length === 0) {
    throw new Error("A lista de quadros de replay não pode estar vazia.");
  }
  const safeIndex = Math.max(0, Math.min(index, frames.length - 1));
  return frames[safeIndex];
}
