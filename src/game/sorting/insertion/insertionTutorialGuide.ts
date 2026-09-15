/**
 * Scaffolding pedagógico e guia interativo do tutorial do Insertion Sort.
 * Utiliza exclusivamente a InsertionSortEngine como fonte de verdade algorítmica.
 */

import type {
  InsertionSortState,
  InsertionDecision,
  InsertionStepResult,
  ExpectedInsertionStep,
} from "./types";
import { getExpectedInsertionStep } from "./insertionSortEngine";

/**
 * Vetor canônico fixo para o tutorial do Insertion Sort: [4, 2, 3]
 *
 * Racional pedagógico:
 * - Passada 1 (i=1, chave 2, vaga 1):
 *   A[0] = 4 > chave 2 -> SHIFT_RIGHT (4 desloca para a vaga 1, vaga passa a 0, j=-1).
 *   j=-1 -> INSERT_READY -> INSERT_KEY (cabeceira da esteira, razão HEAD_REACHED).
 *   Esteira estabiliza em [2, 4, 3], região ORD relativa = [0..1].
 *
 * - Passada 2 (i=2, chave 3, vaga 2):
 *   A[1] = 4 > chave 3 -> SHIFT_RIGHT (4 desloca para a vaga 2, vaga passa a 1, j=0).
 *   A[0] = 2 <= chave 3 -> INSERT_KEY (condição falsa, razão CONDITION_FALSE).
 *   Esteira estabiliza em [2, 3, 4], região ORD relativa = [0..2].
 *
 * Abrange de forma concisa:
 * - Elevação automática da chave (auto-lift) ao trilho aéreo;
 * - Deslocamento para a direita (SHIFT ≠ SWAP);
 * - Encaixe na cabeceira da esteira (HEAD_REACHED);
 * - Encaixe por elemento menor ou igual (CONDITION_FALSE);
 * - Expansão progressiva da partição ordenada (ORD).
 */
export const INSERTION_TUTORIAL_INITIAL_ARRAY: readonly number[] = Object.freeze([
  4, 2, 3,
]);

export interface InsertionTutorialStepInfo {
  readonly phase: "COMPARE_AND_SHIFT" | "INSERT_READY" | "COMPLETED";
  readonly passNumber: number;
  readonly totalPasses: number;
  readonly key: number | null;
  readonly holeIndex: number | null;
  readonly j: number;
  readonly comparedValue: number | null;
  readonly title: string;
  readonly instruction: string;
  readonly hint: string;
  readonly canShift: boolean;
  readonly canInsert: boolean;
  readonly expected: ExpectedInsertionStep | null;
}

/**
 * Gera informações diagnósticas e pedagógicas contextualizadas a partir do estado atual da engine.
 */
export function getInsertionTutorialStepInfo(
  state: InsertionSortState,
): InsertionTutorialStepInfo {
  const n = state.arrayLength;
  const totalPasses = Math.max(1, n - 1);
  const passNumber = Math.min(state.i, totalPasses);

  if (state.completed || state.phase === "COMPLETED") {
    return {
      phase: "COMPLETED",
      passNumber: totalPasses,
      totalPasses,
      key: null,
      holeIndex: null,
      j: -1,
      comparedValue: null,
      title: "ORDENAÇÃO CONCLUÍDA!",
      instruction:
        "O lote de cargas [2, 3, 4] foi totalmente ordenado com sucesso. Todas as cargas foram acomodadas em suas posições relativas na esteira.",
      hint: "No Insertion Sort, a partição ordenada relativa (ORD) cresce de 1 elemento a cada passada, sem exigir transferências pontuais de busca global.",
      canShift: false,
      canInsert: false,
      expected: null,
    };
  }

  const expected = getExpectedInsertionStep(state);

  if (state.phase === "INSERT_READY") {
    return {
      phase: "INSERT_READY",
      passNumber,
      totalPasses,
      key: state.key,
      holeIndex: state.holeIndex,
      j: state.j,
      comparedValue: null,
      title: `PASSADA ${passNumber}/${totalPasses} • CABECEIRA DA ESTEIRA`,
      instruction: `A varredura alcançou o início da esteira (j = -1). Não há mais cargas à esquerda. A chave suspensa (${state.key}) deve ser encaixada na vaga aberta #1.`,
      hint: `A cabeceira foi atingida. Comande ENCAIXAR CHAVE para posicionar a carga ${state.key} na vaga #1.`,
      canShift: false,
      canInsert: true,
      expected,
    };
  }

  // Phase: COMPARE_AND_SHIFT
  const comparedValue =
    state.j >= 0 && state.currentValues[state.j] !== null
      ? (state.currentValues[state.j] as number)
      : null;

  const isShift = comparedValue !== null && state.key !== null && comparedValue > state.key;

  return {
    phase: "COMPARE_AND_SHIFT",
    passNumber,
    totalPasses,
    key: state.key,
    holeIndex: state.holeIndex,
    j: state.j,
    comparedValue,
    title: `PASSADA ${passNumber}/${totalPasses} • COMPARAÇÃO`,
    instruction: isShift
      ? `A carga inspecionada #${state.j + 1} (valor ${comparedValue}) é MAIOR que a chave suspensa (${state.key}). Desloque a carga para a direita para abrir espaço na esteira.`
      : `A carga inspecionada #${state.j + 1} (valor ${comparedValue}) é MENOR OU IGUAL à chave suspensa (${state.key}). A posição correta foi encontrada! Encaixe a chave na vaga aberta #${(state.holeIndex ?? 0) + 1}.`,
    hint: isShift
      ? `Comparação formal: A[${state.j}] > chave (${comparedValue} > ${state.key}). Verdadeiro: comande DESLOCAR CARGA para mover a carga para a vaga à direita.`
      : `Comparação formal: A[${state.j}] > chave (${comparedValue} > ${state.key}). Falso: a carga não deve se mover. Comande ENCAIXAR CHAVE.`,
    canShift: true,
    canInsert: true,
    expected,
  };
}

export { getInsertionStepFeedback } from "./insertionPedagogy";
