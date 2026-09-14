/**
 * Modelo puro e imutável para derivação de quadros de Replay da Execução do Selection Sort.
 *
 * Consome estritamente o vetor inicial (`initialArray`) e o histórico gravado (`SelectionStepRecord[]`).
 * NÃO reexecuta o algoritmo nem produz efeitos colaterais.
 * Garante correspondência 1:1 com os passos reais, sem geração de frames fantasmas.
 */

import type {
  SelectionStepRecord,
  SelectionInspectionStepRecord,
  SelectionCommitStepRecord,
} from "../sorting/selection/types";

export type SelectionReplayFrameType = "INITIAL" | "INSPECTION" | "COMMIT";

/**
 * Representação imutável de um quadro individual da reprodução (replay)
 * da execução de uma fase do Selection Sort.
 */
export interface SelectionReplayFrame {
  /** Número sequencial do quadro (0 para estado inicial, 1..N para passos gravados) */
  readonly stepNumber: number;
  /** Total de micro-passos algorítmicos no histórico (history.length) */
  readonly totalSteps: number;
  /** Tipo discriminado do frame: INITIAL, INSPECTION ou COMMIT */
  readonly frameType: SelectionReplayFrameType;
  /** Número da passada 1-based (ou 0 para estado inicial) */
  readonly passNumber: number;
  /** Total de passadas teóricas do Selection Sort (max(1, n - 1)) */
  readonly totalPasses: number;
  /** Estado dos valores das caixas na esteira neste quadro */
  readonly values: readonly number[];
  /** Posição alvo i da passada (ou null para vetor <= 1 no estado inicial) */
  readonly targetIndex: number | null;
  /** Posição do scanner j (ou null se INITIAL ou COMMIT) */
  readonly scanIndex: number | null;
  /** Posição do candidato a menor elemento (minIndex) */
  readonly minIndex: number | null;
  /** Posição do candidato a menor elemento ANTES da inspeção atual (ou null se não for INSPECTION) */
  readonly minIndexBefore: number | null;
  /** Valor do elemento alvo A[i] (ou null se INITIAL e n <= 1) */
  readonly targetValue: number | null;
  /** Valor do elemento inspecionado A[j] (ou null se não for INSPECTION) */
  readonly scanValue: number | null;
  /** Valor do elemento mínimo A[minIndex] (ou null se INITIAL e n <= 1) */
  readonly minValue: number | null;
  /** Indica se a inspeção encontrou novo mínimo (apenas INSPECTION) */
  readonly isNewMin: boolean;
  /** Indica se houve permuta física na esteira (apenas COMMIT) */
  readonly didSwap: boolean;
  /** Índices definitivamente consolidados com selo OK neste quadro */
  readonly sortedIndices: readonly number[];
  /** Rótulo textual da ação para o badge de destaque */
  readonly actionLabel: string;
  /** Explicação descritiva factual do quadro */
  readonly explanation: string;
  /** Texto factual da comparação concreta realizada */
  readonly comparisonText: string;
}

/**
 * Deriva deterministicamente a lista de quadros de replay do Selection Sort
 * a partir do vetor inicial e do histórico factual de SelectionStepRecord.
 *
 * Não executa o algoritmo novamente.
 * Produz exatamente history.length + 1 quadros (Quadro 0: INITIAL + Quadros 1..N do history).
 */
export function buildSelectionReplayFrames(
  initialArray: readonly number[],
  history: readonly SelectionStepRecord[]
): readonly SelectionReplayFrame[] {
  const n = initialArray.length;
  const totalSteps = history.length;
  const totalPasses = Math.max(1, n - 1);

  // Quadro 0: Estado Inicial antes da primeira inspeção do scanner
  const initialSorted: number[] =
    n <= 1 ? Array.from({ length: n }, (_, i) => i) : [];

  const initialFrame: SelectionReplayFrame = Object.freeze({
    stepNumber: 0,
    totalSteps,
    frameType: "INITIAL",
    passNumber: 0,
    totalPasses,
    values: Object.freeze([...initialArray]),
    targetIndex: n > 1 ? 0 : null,
    scanIndex: null,
    minIndex: n > 1 ? 0 : null,
    minIndexBefore: null,
    targetValue: n > 1 ? initialArray[0] : null,
    scanValue: null,
    minValue: n > 1 ? initialArray[0] : null,
    isNewMin: false,
    didSwap: false,
    sortedIndices: Object.freeze(initialSorted),
    actionLabel: "ESTADO INICIAL",
    explanation:
      "Configuração inicial da carga na esteira antes da primeira inspeção do scanner.",
    comparisonText: "Nenhuma comparação realizada ainda",
  });

  const frames: SelectionReplayFrame[] = [initialFrame];

  // Quadros 1..N derivados estritamente dos SelectionStepRecords registrados
  for (let k = 0; k < totalSteps; k++) {
    const record = history[k];
    const stepNumber = k + 1;
    const passNumber = record.i + 1;

    if (record.type === "INSPECTION") {
      const inspRecord = record as SelectionInspectionStepRecord;
      const scannerVal = inspRecord.comparedValues.scannerValue;
      const minVal = inspRecord.comparedValues.currentMinValue;
      const isNew = inspRecord.isNewMinFound;

      const actionLabel = isNew ? "NOVO MÍNIMO" : "MANTER CANDIDATO";
      const comparisonText = `${scannerVal} < ${minVal}`;
      const explanation = isNew
        ? `${scannerVal} < ${minVal}: a carga #${inspRecord.j + 1} (${scannerVal}) é menor que o candidato atual (${minVal}). Novo candidato a mínimo definido na posição #${inspRecord.j + 1}.`
        : `${scannerVal} ≥ ${minVal}: a carga #${inspRecord.j + 1} (${scannerVal}) não é menor que o candidato atual (${minVal}). O candidato a mínimo permanece na posição #${inspRecord.minIndexBefore + 1}.`;

      const frame: SelectionReplayFrame = Object.freeze({
        stepNumber,
        totalSteps,
        frameType: "INSPECTION",
        passNumber,
        totalPasses,
        values: Object.freeze([...inspRecord.valuesSnapshot]),
        targetIndex: inspRecord.i,
        scanIndex: inspRecord.j,
        minIndex: inspRecord.minIndexAfter,
        minIndexBefore: inspRecord.minIndexBefore,
        targetValue: inspRecord.comparedValues.targetValue,
        scanValue: scannerVal,
        minValue: minVal,
        isNewMin: isNew,
        didSwap: false,
        sortedIndices: Object.freeze([...inspRecord.sortedIndices]),
        actionLabel,
        explanation,
        comparisonText,
      });

      frames.push(frame);
    } else {
      const commitRecord = record as SelectionCommitStepRecord;
      const didSwap = commitRecord.didSwap;
      const actionLabel = didSwap
        ? "TRANSFERÊNCIA (SWAP)"
        : "CONSOLIDAÇÃO DIRETA (SEM TROCA)";
      const comparisonText = didSwap
        ? `minIndex (${commitRecord.minIndex}) ≠ i (${commitRecord.i})`
        : `minIndex (${commitRecord.minIndex}) = i (${commitRecord.i})`;
      const explanation = didSwap
        ? `Transferência de menor carga: a menor carga (${commitRecord.minValueBefore}) na posição #${commitRecord.minIndex + 1} foi transferida para a posição definitiva #${commitRecord.i + 1} (${commitRecord.targetValueBefore}), recebendo o selo OK.`
        : `Consolidação direta: a menor carga (${commitRecord.minValueBefore}) já ocupava a posição definitiva #${commitRecord.i + 1}. Posição consolidada com o selo OK sem troca física.`;

      const frame: SelectionReplayFrame = Object.freeze({
        stepNumber,
        totalSteps,
        frameType: "COMMIT",
        passNumber,
        totalPasses,
        values: Object.freeze([...commitRecord.valuesAfter]),
        targetIndex: commitRecord.i,
        scanIndex: null,
        minIndex: commitRecord.minIndex,
        minIndexBefore: commitRecord.minIndex,
        targetValue: commitRecord.targetValueBefore,
        scanValue: null,
        minValue: commitRecord.minValueBefore,
        isNewMin: false,
        didSwap,
        sortedIndices: Object.freeze([...commitRecord.sortedIndices]),
        actionLabel,
        explanation,
        comparisonText,
      });

      frames.push(frame);
    }
  }

  return Object.freeze(frames);
}

/**
 * Retorna o quadro de replay de forma segura dentro dos limites válidos.
 */
export function getSelectionReplayFrame(
  frames: readonly SelectionReplayFrame[],
  index: number
): SelectionReplayFrame {
  if (frames.length === 0) {
    throw new Error("A lista de quadros de replay não pode ser vazia.");
  }
  const clampedIndex = Math.max(0, Math.min(frames.length - 1, index));
  return frames[clampedIndex];
}
