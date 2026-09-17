/**
 * Modelo puro e imutável para derivação de quadros de Replay da Execução do Insertion Sort.
 *
 * Consome estritamente o vetor inicial (`initialArray`) e o histórico factual gravado (`InsertionStepRecord[]`).
 * NÃO reexecuta o algoritmo nem produz efeitos colaterais.
 * Garante correspondência estrita 1:1 com os passos reais registrados:
 *   frames.length === 1 + history.length
 * Sem frames fantasmas ou intermediários artificiais.
 */

import type {
  InsertionStepRecord,
  InsertionKeyLiftStepRecord,
  InsertionShiftStepRecord,
  InsertionInsertStepRecord,
} from "./types";
import type { InsertionPseudocodeLineId } from "./insertionPseudocode";

export type InsertionReplayFrameType = "INITIAL" | "KEY_LIFT" | "SHIFT" | "INSERT";

export type InsertionReplayInsertReason = "CONDITION_FALSE" | "HEAD_REACHED";

/**
 * Representação imutável de um quadro individual da reprodução (replay/demonstração)
 * do Insertion Sort.
 */
export interface InsertionReplayFrame {
  /** Número sequencial do quadro (0 para estado inicial, 1..N para passos gravados) */
  readonly stepNumber: number;
  /** Total de micro-passos algorítmicos no histórico (history.length) */
  readonly totalSteps: number;
  /** Tipo discriminado do frame: INITIAL, KEY_LIFT, SHIFT ou INSERT */
  readonly frameType: InsertionReplayFrameType;
  /** Número da passada externa i (1..totalPasses) ou 0 para estado inicial */
  readonly passNumber: number;
  /** Total de passadas teóricas do Insertion Sort (max(1, n - 1)) */
  readonly totalPasses: number;
  /** Estado dos valores das cargas na esteira neste quadro (null indica vaga física aberta) */
  readonly values: readonly (number | null)[];
  /** Índice da passada externa i (ou null no frame inicial) */
  readonly i: number | null;
  /** Índice de inspeção regressiva j (-1 se cabeceira alcançada, null no frame inicial) */
  readonly j: number | null;
  /** Carga-chave suspensa no trilho aéreo (null se no estado inicial ou após inserção) */
  readonly key: number | null;
  /** Índice da vaga física na esteira (null se no estado inicial ou após inserção) */
  readonly holeIndex: number | null;
  /** Limite do subvetor ordenado relativo ORD (A[0..orderedBoundary]) */
  readonly orderedBoundary: number;
  /** Indica se o quadro representa a estabilização final completa de todo o lote */
  readonly isCompleted: boolean;
  /** Motivo específico da inserção da chave (apenas frame INSERT) */
  readonly insertReason?: InsertionReplayInsertReason | null;
  /** Valor concreto inspecionado A[j] (ou null se INITIAL ou HEAD_REACHED) */
  readonly comparedValue: number | null;
  /** Valor da chave envolvida na operação */
  readonly keyValue: number | null;
  /** Resultado relacional da comparação A[j] > chave (true, false ou null se não aplicável) */
  readonly comparisonResult: boolean | null;
  /** Valor deslocado durante um SHIFT */
  readonly shiftedValue?: number | null;
  /** Índice de onde a vaga partiu antes do deslocamento */
  readonly holeIndexBefore?: number | null;
  /** Índice para onde a vaga foi após o deslocamento */
  readonly holeIndexAfter?: number | null;
  /** Posição onde a chave foi inserida */
  readonly insertedIndex?: number | null;
  /** Valor que foi inserido na esteira */
  readonly insertedValue?: number | null;
  /** Rótulo textual da ação para o badge de destaque */
  readonly actionLabel: string;
  /** Explicação factual e descritiva do quadro */
  readonly explanation: string;
  /** Expressão relacional factual concreta (ex.: "A[0] (6) > CHAVE (3) → VERDADEIRO" ou "j < 0 • CABECEIRA ALCANÇADA") */
  readonly comparisonText: string;
  /** Identificador semântico da instrução principal de pseudocódigo associada ao quadro */
  readonly semanticStep: InsertionPseudocodeLineId;
}

/**
 * Deriva deterministicamente a lista completa de quadros de replay do Insertion Sort
 * a partir do vetor inicial e do histórico gravado.
 *
 * Invariante inegociável:
 * frames.length === 1 + history.length
 */
export function buildInsertionReplayFrames(
  initialArray: readonly number[],
  history: readonly InsertionStepRecord[]
): readonly InsertionReplayFrame[] {
  const n = initialArray.length;
  const totalSteps = history.length;
  const totalPasses = Math.max(1, n - 1);

  // Quadro 0: Estado Inicial antes da primeira elevação de chave
  const initialBoundary = n > 0 ? 0 : -1;
  const isInitiallyCompleted = n <= 1;

  const initialFrame: InsertionReplayFrame = Object.freeze({
    stepNumber: 0,
    totalSteps,
    frameType: "INITIAL",
    passNumber: 0,
    totalPasses,
    values: Object.freeze([...initialArray]),
    i: null,
    j: null,
    key: null,
    holeIndex: null,
    orderedBoundary: initialBoundary,
    isCompleted: isInitiallyCompleted,
    insertReason: null,
    comparedValue: null,
    keyValue: null,
    comparisonResult: null,
    shiftedValue: null,
    holeIndexBefore: null,
    holeIndexAfter: null,
    insertedIndex: null,
    insertedValue: null,
    actionLabel: "ESTADO INICIAL",
    explanation:
      n <= 1
        ? "Vetor com tamanho reduzido já estabilizado."
        : "O primeiro elemento forma inicialmente uma região ordenada de tamanho 1 (ORD).",
    comparisonText: "Nenhuma comparação ativa",
    semanticStep: "PROCEDURE",
  });

  const frames: InsertionReplayFrame[] = [initialFrame];

  // Quadros 1..N derivados estritamente dos InsertionStepRecords registrados
  for (let k = 0; k < totalSteps; k++) {
    const record = history[k];
    const stepNumber = k + 1;
    const isLastRecord = k === totalSteps - 1;

    if (record.type === "KEY_LIFT") {
      const liftRecord = record as InsertionKeyLiftStepRecord;
      const passNumber = liftRecord.i;

      const frame: InsertionReplayFrame = Object.freeze({
        stepNumber,
        totalSteps,
        frameType: "KEY_LIFT",
        passNumber,
        totalPasses,
        values: Object.freeze([...liftRecord.valuesSnapshot]),
        i: liftRecord.i,
        j: liftRecord.i - 1,
        key: liftRecord.key,
        holeIndex: liftRecord.holeIndex,
        orderedBoundary: liftRecord.orderedBoundary,
        isCompleted: false,
        insertReason: null,
        comparedValue: null,
        keyValue: liftRecord.key,
        comparisonResult: null,
        shiftedValue: null,
        holeIndexBefore: null,
        holeIndexAfter: null,
        insertedIndex: null,
        insertedValue: null,
        actionLabel: "ELEVAÇÃO DA CHAVE",
        explanation: liftRecord.explanation,
        comparisonText: `Chave: ${liftRecord.key} • Vaga aberta no índice #${liftRecord.holeIndex + 1}`,
        semanticStep: "LIFT_KEY",
      });

      frames.push(frame);
    } else if (record.type === "SHIFT") {
      const shiftRecord = record as InsertionShiftStepRecord;
      const passNumber = shiftRecord.i;

      const frame: InsertionReplayFrame = Object.freeze({
        stepNumber,
        totalSteps,
        frameType: "SHIFT",
        passNumber,
        totalPasses,
        values: Object.freeze([...shiftRecord.valuesSnapshot]),
        i: shiftRecord.i,
        j: shiftRecord.j,
        key: shiftRecord.keyValue,
        holeIndex: shiftRecord.holeIndexAfter,
        orderedBoundary: shiftRecord.i - 1,
        isCompleted: false,
        insertReason: null,
        comparedValue: shiftRecord.comparedValue,
        keyValue: shiftRecord.keyValue,
        comparisonResult: true,
        shiftedValue: shiftRecord.shiftedValue,
        holeIndexBefore: shiftRecord.holeIndexBefore,
        holeIndexAfter: shiftRecord.holeIndexAfter,
        insertedIndex: null,
        insertedValue: null,
        actionLabel: "DESLOCAMENTO (SHIFT)",
        explanation: shiftRecord.explanation,
        comparisonText: `A[${shiftRecord.j}] (${shiftRecord.comparedValue}) > CHAVE (${shiftRecord.keyValue}) → VERDADEIRO`,
        semanticStep: "SHIFT_RIGHT",
      });

      frames.push(frame);
    } else {
      // record.type === "INSERT"
      const insertRecord = record as InsertionInsertStepRecord;
      const passNumber = insertRecord.i;
      const isAlgorithmComplete =
        isLastRecord && insertRecord.orderedBoundary === n - 1;

      if (insertRecord.reason === "CONDITION_FALSE") {
        const frame: InsertionReplayFrame = Object.freeze({
          stepNumber,
          totalSteps,
          frameType: "INSERT",
          passNumber,
          totalPasses,
          values: Object.freeze([...insertRecord.valuesSnapshot]),
          i: insertRecord.i,
          j: insertRecord.j,
          key: null,
          holeIndex: null,
          orderedBoundary: insertRecord.orderedBoundary,
          isCompleted: isAlgorithmComplete,
          insertReason: "CONDITION_FALSE",
          comparedValue: insertRecord.comparedValue,
          keyValue: insertRecord.keyValue,
          comparisonResult: false,
          shiftedValue: null,
          holeIndexBefore: null,
          holeIndexAfter: null,
          insertedIndex: insertRecord.insertedIndex,
          insertedValue: insertRecord.insertedValue,
          actionLabel: "ENCAIXE DA CHAVE",
          explanation: insertRecord.explanation,
          comparisonText: `A[${insertRecord.j}] (${insertRecord.comparedValue}) > CHAVE (${insertRecord.keyValue}) → FALSO`,
          semanticStep: "INSERT_KEY",
        });

        frames.push(frame);
      } else {
        // insertRecord.reason === "HEAD_REACHED"
        // Invariante: nunca exibir A[-1], nunca inventar comparação relacional com A[-1]
        const frame: InsertionReplayFrame = Object.freeze({
          stepNumber,
          totalSteps,
          frameType: "INSERT",
          passNumber,
          totalPasses,
          values: Object.freeze([...insertRecord.valuesSnapshot]),
          i: insertRecord.i,
          j: -1,
          key: null,
          holeIndex: null,
          orderedBoundary: insertRecord.orderedBoundary,
          isCompleted: isAlgorithmComplete,
          insertReason: "HEAD_REACHED",
          comparedValue: null,
          keyValue: insertRecord.keyValue,
          comparisonResult: null,
          shiftedValue: null,
          holeIndexBefore: null,
          holeIndexAfter: null,
          insertedIndex: insertRecord.insertedIndex,
          insertedValue: insertRecord.insertedValue,
          actionLabel: "ENCAIXE NA CABECEIRA",
          explanation: insertRecord.explanation,
          comparisonText: "j < 0 • CABECEIRA ALCANÇADA",
          semanticStep: "INSERT_KEY",
        });

        frames.push(frame);
      }
    }
  }

  return Object.freeze(frames);
}

/**
 * Acessor seguro para um quadro de replay do Insertion Sort, com clamping de limites.
 */
export function getInsertionReplayFrame(
  frames: readonly InsertionReplayFrame[],
  index: number
): InsertionReplayFrame {
  if (frames.length === 0) {
    throw new Error("A lista de quadros de replay do Insertion Sort está vazia.");
  }
  const safeIndex = Math.max(0, Math.min(index, frames.length - 1));
  return frames[safeIndex];
}
