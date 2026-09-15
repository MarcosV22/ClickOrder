/**
 * Engine pedagógica pura de Insertion Sort para o Sorting Station.
 *
 * Módulo puramente funcional, imutável e sem efeitos colaterais.
 * Modela a FSM canônica do algoritmo por DESLOCAMENTOS com chave suspensa no trilho aéreo
 * e vaga física aberta na esteira:
 *
 * para i de 1 até n - 1
 *     chave <- A[i]
 *     j <- i - 1
 *     enquanto j >= 0 e A[j] > chave
 *         A[j + 1] <- A[j]
 *         j <- j - 1
 *     A[j + 1] <- chave
 *
 * Não utiliza nem depende de React, DOM ou localStorage.
 */

import type {
  ExpectedInsertionStep,
  InsertionDecision,
  InsertionKeyLiftStepRecord,
  InsertionPhase,
  InsertionSortState,
  InsertionStepRecord,
  InsertionStepResult,
  InsertionStepResultType,
} from "./types";

/**
 * Cria a representação imutável de índices consolidados no subvetor ORD.
 */
function createIndicesUpTo(boundary: number): readonly number[] {
  if (boundary < 0) return Object.freeze([]);
  const indices: number[] = [];
  for (let idx = 0; idx <= boundary; idx++) {
    indices.push(idx);
  }
  return Object.freeze(indices);
}

/**
 * Executa internamente o auto-lift determinístico para a passada i.
 * - Eleva A[i] para a chave suspensa;
 * - Abre a vaga física em currentValues[i] = null;
 * - Aponta j para i - 1;
 * - Registra KEY_LIFT no histórico.
 */
function performAutoLift(
  state: InsertionSortState,
  nextI: number,
): InsertionSortState {
  const keyValue = state.currentValues[nextI];
  if (keyValue === null || typeof keyValue !== "number") {
    throw new Error(
      `[InsertionEngine] Invariante violada: valor no índice ${nextI} não pode ser nulo para auto-lift.`,
    );
  }

  const newCurrentValues = [...state.currentValues];
  newCurrentValues[nextI] = null;

  const keyLiftRecord: InsertionKeyLiftStepRecord = {
    type: "KEY_LIFT",
    stepNumber: state.history.length + 1,
    i: nextI,
    key: keyValue,
    keyOriginalIndex: nextI,
    holeIndex: nextI,
    orderedBoundary: nextI - 1,
    valuesSnapshot: Object.freeze(newCurrentValues),
    explanation: `Passada ${nextI} iniciada. Carga A[${nextI}] (${keyValue}) elevada ao trilho aéreo; vaga aberta na esteira no índice ${nextI}.`,
  };

  return Object.freeze({
    ...state,
    i: nextI,
    j: nextI - 1,
    key: keyValue,
    holeIndex: nextI,
    currentValues: Object.freeze(newCurrentValues),
    phase: "COMPARE_AND_SHIFT",
    status: "RUNNING",
    orderedBoundary: nextI - 1,
    history: Object.freeze([...state.history, keyLiftRecord]),
  });
}

/**
 * Cria o estado inicial puro e imutável para uma sessão de Insertion Sort.
 * Para n >= 2, executa imediatamente o auto-lift da passada 1 (i = 1),
 * elevando A[1] ao trilho aéreo e apontando j para 0.
 *
 * Para n <= 1, transita imediatamente para COMPLETED.
 */
export function createInsertionSortState(
  initialValues: readonly number[],
): InsertionSortState {
  const safeInitial = Object.freeze([...initialValues]);
  const n = safeInitial.length;

  if (n <= 1) {
    return Object.freeze({
      initialValues: safeInitial,
      currentValues: safeInitial,
      arrayLength: n,
      i: n,
      j: -1,
      key: null,
      holeIndex: null,
      phase: "COMPLETED",
      comparisons: 0,
      shifts: 0,
      insertions: 0,
      errors: 0,
      orderedBoundary: n > 0 ? 0 : -1,
      history: Object.freeze([]),
      completed: true,
      status: "COMPLETED",
    });
  }

  // Estado base pré-lift
  const baseState: InsertionSortState = {
    initialValues: safeInitial,
    currentValues: safeInitial,
    arrayLength: n,
    i: 1,
    j: 0,
    key: null,
    holeIndex: null,
    phase: "COMPARE_AND_SHIFT",
    comparisons: 0,
    shifts: 0,
    insertions: 0,
    errors: 0,
    orderedBoundary: 0,
    history: Object.freeze([]),
    completed: false,
    status: "IDLE",
  };

  // Auto-lift determinístico para a passada i = 1
  return performAutoLift(baseState, 1);
}

/**
 * Retorna os metadados e a decisão esperada do passo algorítmico atual.
 * Retorna null se a sessão estiver concluída.
 */
export function getExpectedInsertionStep(
  state: InsertionSortState,
): ExpectedInsertionStep | null {
  if (state.completed || state.key === null || state.holeIndex === null) {
    return null;
  }

  if (state.phase === "INSERT_READY") {
    return {
      phase: "INSERT_READY",
      i: state.i,
      j: state.j,
      key: state.key,
      holeIndex: state.holeIndex,
      expectedDecision: "INSERT_KEY",
      explanation: `Cabeceira da esteira alcançada (j < 0). A chave suspensa (${state.key}) deve ser encaixada na vaga 0.`,
    };
  }

  // Phase: COMPARE_AND_SHIFT (j >= 0)
  const comparedValue = state.currentValues[state.j];
  if (comparedValue === null || typeof comparedValue !== "number") {
    throw new Error(
      `[InsertionEngine] Invariante violada: valor no índice j=${state.j} é nulo durante COMPARE_AND_SHIFT.`,
    );
  }

  const isShiftRequired = comparedValue > state.key;

  return {
    phase: "COMPARE_AND_SHIFT",
    i: state.i,
    j: state.j,
    key: state.key,
    holeIndex: state.holeIndex,
    expectedDecision: isShiftRequired ? "SHIFT_RIGHT" : "INSERT_KEY",
    comparedValue,
    comparisonResult: isShiftRequired,
    explanation: isShiftRequired
      ? `A carga em inspeção A[${state.j}] (${comparedValue}) é maior que a chave (${state.key}). Desloque-a para a direita para abrir espaço.`
      : `A carga em inspeção A[${state.j}] (${comparedValue}) é menor ou igual à chave (${state.key}). A condição do laço é falsa; encaixe a chave na vaga ${state.holeIndex}.`,
  };
}

/**
 * Executa uma decisão do operador na FSM do Insertion Sort.
 *
 * Diferencia rigorosamente:
 * 1. ERRO PEDAGÓGICO:
 *    - Usuário escolheu SHIFT_RIGHT quando A[j] <= key;
 *    - Usuário escolheu INSERT_KEY quando A[j] > key.
 *    -> errors += 1; estado algorítmico não avança.
 *
 * 2. AÇÃO IMPOSSÍVEL / FALHA DE INTEGRAÇÃO DE UI:
 *    - SHIFT_RIGHT chamado durante INSERT_READY (j < 0);
 *    - Qualquer ação chamada após COMPLETED.
 *    -> errors NÃO incrementa; estado não avança; retorno identifica a ação inválida.
 */
export function executeInsertionStep(
  state: InsertionSortState,
  decision: InsertionDecision,
): InsertionStepResult {
  // Caso 1: Sessão já concluída
  if (state.completed) {
    return {
      state,
      resultType: "INVALID_ACTION_FOR_PHASE",
      valid: false,
      isPedagogicalError: false,
      errorReason:
        "A ordenação já está concluída. Nenhuma ação adicional é permitida.",
    };
  }

  const expected = getExpectedInsertionStep(state);
  if (!expected) {
    return {
      state,
      resultType: "INVALID_ACTION_FOR_PHASE",
      valid: false,
      isPedagogicalError: false,
      errorReason: "Nenhum passo esperado no estado atual.",
    };
  }

  // Caso 2: Fase INSERT_READY (j < 0, vaga no índice 0)
  if (state.phase === "INSERT_READY") {
    if (decision === "SHIFT_RIGHT") {
      // Ação impossível para a fase (não há elementos à esquerda)
      return {
        state,
        resultType: "INVALID_ACTION_FOR_PHASE",
        valid: false,
        isPedagogicalError: false,
        expectedDecision: "INSERT_KEY",
        errorReason:
          "Ação inválida para a fase INSERT_READY. Início da esteira alcançado (j < 0); não há cargas para deslocar. A única ação válida é ENCAIXAR CHAVE.",
      };
    }

    // decision === "INSERT_KEY": encaixe válido na cabeceira
    const key = state.key!;
    const holeIndex = state.holeIndex!; // 0
    const newCurrentValues = [...state.currentValues];
    newCurrentValues[holeIndex] = key;

    const insertRecord: InsertionStepRecord = {
      type: "INSERT",
      reason: "HEAD_REACHED",
      stepNumber: state.history.length + 1,
      i: state.i,
      j: -1,
      comparedValue: null,
      keyValue: key,
      comparisonResult: null,
      insertedIndex: holeIndex,
      insertedValue: key,
      valuesSnapshot: Object.freeze(newCurrentValues),
      orderedBoundary: state.i,
      explanation: `Cabeceira da esteira alcançada. Chave (${key}) encaixada na vaga ${holeIndex}. Sub-esteira ordenada expandida para [0 .. ${state.i}].`,
    };

    const committedState: InsertionSortState = Object.freeze({
      ...state,
      currentValues: Object.freeze(newCurrentValues),
      key: null,
      holeIndex: null,
      insertions: state.insertions + 1,
      orderedBoundary: state.i,
      history: Object.freeze([...state.history, insertRecord]),
    });

    const nextI = state.i + 1;
    if (nextI < state.arrayLength) {
      // Passada concluída: auto-lift para a próxima passada
      const nextState = performAutoLift(committedState, nextI);
      return {
        state: nextState,
        resultType: "SUCCESS",
        valid: true,
        isPedagogicalError: false,
      };
    }

    // Todas as passadas concluídas
    const finalState: InsertionSortState = Object.freeze({
      ...committedState,
      phase: "COMPLETED",
      completed: true,
      status: "COMPLETED",
    });

    return {
      state: finalState,
      resultType: "SUCCESS",
      valid: true,
      isPedagogicalError: false,
    };
  }

  // Caso 3: Fase COMPARE_AND_SHIFT (j >= 0)
  const currentJ = state.j;
  const comparedValue = state.currentValues[currentJ] as number;
  const key = state.key!;
  const holeIndex = state.holeIndex!;
  const conditionTrue = comparedValue > key;

  if (decision === "SHIFT_RIGHT") {
    if (conditionTrue) {
      // Deslocamento correto: A[holeIndex] = A[j], A[j] = null
      const newCurrentValues = [...state.currentValues];
      newCurrentValues[holeIndex] = comparedValue;
      newCurrentValues[currentJ] = null;

      const newHoleIndex = currentJ;
      const nextJ = currentJ - 1;

      const shiftRecord: InsertionStepRecord = {
        type: "SHIFT",
        stepNumber: state.history.length + 1,
        i: state.i,
        j: currentJ,
        comparedValue,
        keyValue: key,
        comparisonResult: true,
        holeIndexBefore: holeIndex,
        holeIndexAfter: newHoleIndex,
        shiftedValue: comparedValue,
        valuesSnapshot: Object.freeze(newCurrentValues),
        explanation: `A[${currentJ}] (${comparedValue}) > chave (${key}): carga ${comparedValue} deslocada para a vaga ${holeIndex}. Vaga transferida para o índice ${newHoleIndex}.`,
      };

      const nextPhase: InsertionPhase =
        nextJ >= 0 ? "COMPARE_AND_SHIFT" : "INSERT_READY";

      const updatedState: InsertionSortState = Object.freeze({
        ...state,
        j: nextJ,
        holeIndex: newHoleIndex,
        currentValues: Object.freeze(newCurrentValues),
        comparisons: state.comparisons + 1,
        shifts: state.shifts + 1,
        phase: nextPhase,
        history: Object.freeze([...state.history, shiftRecord]),
      });

      return {
        state: updatedState,
        resultType: "SUCCESS",
        valid: true,
        isPedagogicalError: false,
      };
    }

    // ERRO PEDAGÓGICO: A[j] <= key, não deveria deslocar
    const errorState: InsertionSortState = Object.freeze({
      ...state,
      errors: state.errors + 1,
    });

    return {
      state: errorState,
      resultType: "PEDAGOGICAL_ERROR",
      valid: false,
      isPedagogicalError: true,
      expectedDecision: "INSERT_KEY",
      errorReason: `A carga em inspeção A[${currentJ}] (${comparedValue}) é menor ou igual à chave (${key}). Ela não deve ser deslocada! A vaga atual é a posição correta para encaixar a chave.`,
    };
  }

  // decision === "INSERT_KEY"
  if (!conditionTrue) {
    // Encaixe correto por condição do enquanto falsa (A[j] <= key)
    const newCurrentValues = [...state.currentValues];
    newCurrentValues[holeIndex] = key;

    const insertRecord: InsertionStepRecord = {
      type: "INSERT",
      reason: "CONDITION_FALSE",
      stepNumber: state.history.length + 1,
      i: state.i,
      j: currentJ,
      comparedValue,
      keyValue: key,
      comparisonResult: false,
      insertedIndex: holeIndex,
      insertedValue: key,
      valuesSnapshot: Object.freeze(newCurrentValues),
      orderedBoundary: state.i,
      explanation: `A[${currentJ}] (${comparedValue}) <= chave (${key}): condição de deslocamento falsa. Chave (${key}) encaixada na vaga ${holeIndex}. Sub-esteira ordenada expandida para [0 .. ${state.i}].`,
    };

    const committedState: InsertionSortState = Object.freeze({
      ...state,
      currentValues: Object.freeze(newCurrentValues),
      key: null,
      holeIndex: null,
      comparisons: state.comparisons + 1, // Avaliação relacional A[j] > key contabilizada
      insertions: state.insertions + 1,
      orderedBoundary: state.i,
      history: Object.freeze([...state.history, insertRecord]),
    });

    const nextI = state.i + 1;
    if (nextI < state.arrayLength) {
      // Passada concluída: auto-lift para a próxima passada
      const nextState = performAutoLift(committedState, nextI);
      return {
        state: nextState,
        resultType: "SUCCESS",
        valid: true,
        isPedagogicalError: false,
      };
    }

    // Todas as passadas concluídas
    const finalState: InsertionSortState = Object.freeze({
      ...committedState,
      phase: "COMPLETED",
      completed: true,
      status: "COMPLETED",
    });

    return {
      state: finalState,
      resultType: "SUCCESS",
      valid: true,
      isPedagogicalError: false,
    };
  }

  // ERRO PEDAGÓGICO: A[j] > key, inserção prematura
  const errorState: InsertionSortState = Object.freeze({
    ...state,
    errors: state.errors + 1,
  });

  return {
    state: errorState,
    resultType: "PEDAGOGICAL_ERROR",
    valid: false,
    isPedagogicalError: true,
    expectedDecision: "SHIFT_RIGHT",
    errorReason: `A carga em inspeção A[${currentJ}] (${comparedValue}) ainda é maior que a chave (${key}). Desloque-a para a direita antes de pousar a chave.`,
  };
}

/**
 * Retorna os índices consolidados no subvetor ordenado relativo (ORD) de 0 até orderedBoundary.
 */
export function getInsertionOrderedIndices(
  state: InsertionSortState,
): readonly number[] {
  return createIndicesUpTo(state.orderedBoundary);
}

/**
 * Verifica se a sessão do Insertion Sort está integralmente finalizada.
 */
export function isInsertionSortComplete(state: InsertionSortState): boolean {
  return state.completed;
}

/**
 * Retorna a porcentagem inteira de progresso da ordenação (0 a 100%).
 */
export function calculateInsertionSortProgress(
  state: InsertionSortState,
): number {
  if (state.completed || state.arrayLength <= 1) {
    return 100;
  }
  const totalPasses = state.arrayLength - 1;
  if (totalPasses <= 0) return 100;

  // Progresso ponderado pelas passadas concluídas e posição de j na passada atual
  const completedPasses = state.i - 1;
  const passWeight = 100 / totalPasses;
  const currentPassProgress =
    state.i > 0
      ? ((state.i - 1 - Math.max(-1, state.j)) / state.i) * passWeight
      : 0;

  const raw = completedPasses * passWeight + currentPassProgress;
  return Math.min(100, Math.max(0, Math.round(raw)));
}
