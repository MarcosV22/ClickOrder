/**
 * Engine pedagógica pura de Quick Sort para o Sorting Station.
 *
 * Módulo puramente funcional, imutável e sem efeitos colaterais.
 * Implementa a variante canônica de Particionamento de Lomuto com pivô fixo no último
 * elemento do intervalo (A[high]), limites inclusivos, pilha explícita LIFO com processamento
 * esquerdo antes do direito (left-first), e rastreabilidade determinística.
 *
 * Não utiliza nem depende de React, DOM, localStorage ou temporizadores.
 */

import type {
  QuickComparisonContext,
  QuickDecision,
  QuickElement,
  QuickEventType,
  QuickInputItem,
  QuickIntervalContext,
  QuickSortState,
  QuickStepRecord,
  QuickStepResult,
  QuickSwapContext,
  QuickVisualStepFrame,
} from "./types";

/**
 * Pseudocódigo canônico de 27 linhas do Quick Sort (Lomuto).
 */
export const QUICK_SORT_PSEUDOCODE_LINES: readonly string[] = Object.freeze([
  "procedimento quickSort(A, inicio, fim)",                         // Linha 1
  "  se inicio < fim então",                                        // Linha 2
  "    p ← particionar(A, inicio, fim)",                           // Linha 3
  "    quickSort(A, inicio, p - 1)",                                // Linha 4
  "    quickSort(A, p + 1, fim)",                                   // Linha 5
  "  senão se inicio = fim então",                                  // Linha 6
  "    marcar A[inicio] como DEFINITIVO",                           // Linha 7
  "  fim se",                                                       // Linha 8
  "fim procedimento",                                               // Linha 9
  "",                                                               // Linha 10
  "procedimento particionar(A, inicio, fim)",                      // Linha 11
  "  pivo ← A[fim]",                                                // Linha 12
  "  i ← inicio - 1",                                               // Linha 13
  "  para j de inicio até fim - 1 faça",                            // Linha 14
  "    se A[j].valor ≤ pivo.valor então",                           // Linha 15
  "      i ← i + 1",                                                // Linha 16
  "      se i ≠ j então",                                           // Linha 17
  "        trocar A[i] com A[j]",                                   // Linha 18
  "      fim se",                                                   // Linha 19
  "    fim se",                                                     // Linha 20
  "  fim para",                                                     // Linha 21
  "  se i + 1 ≠ fim então",                                         // Linha 22
  "    trocar A[i + 1] com A[fim]",                                 // Linha 23
  "  fim se",                                                       // Linha 24
  "  marcar A[i + 1] como DEFINITIVO",                              // Linha 25
  "  retornar i + 1",                                               // Linha 26
  "fim procedimento",                                               // Linha 27
]);

/**
 * Cria uma carga de Quick Sort com identidade estável e imutável.
 */
export function createQuickElement(
  value: number,
  originalIndex: number,
  label?: string,
  idPrefix = "elem",
): QuickElement {
  const labelSuffixStr = label ? `-${label}` : "";
  return Object.freeze({
    id: `${idPrefix}-${originalIndex}-v${value}${labelSuffixStr}`,
    value,
    originalIndex,
    label: label ?? undefined,
    labelSuffix: label ?? undefined,
  });
}

/**
 * Normaliza a entrada para uma lista imutável de QuickElement com identidades estáveis.
 */
export function normalizeQuickInput(
  rawInput: readonly QuickInputItem[],
): readonly QuickElement[] {
  return Object.freeze(
    rawInput.map((item, idx) => {
      if (typeof item === "number") {
        return createQuickElement(item, idx);
      }
      if ("id" in item && typeof item.id === "string") {
        const originalIndex =
          "originalIndex" in item && typeof item.originalIndex === "number"
            ? item.originalIndex
            : idx;
        const labelSuffix =
          "labelSuffix" in item && typeof item.labelSuffix === "string"
            ? item.labelSuffix
            : item.label ?? undefined;
        return Object.freeze({
          id: item.id,
          value: item.value,
          originalIndex,
          label: item.label ?? undefined,
          labelSuffix,
        });
      }
      const labelSuffix =
        "labelSuffix" in item && typeof (item as any).labelSuffix === "string"
          ? (item as any).labelSuffix
          : item.label ?? undefined;
      return Object.freeze({
        id: item.id ?? `elem-${idx}-v${item.value}`,
        value: item.value,
        originalIndex: item.originalIndex ?? idx,
        label: item.label ?? undefined,
        labelSuffix,
      });
    }),
  );
}

/**
 * Helper puro de permuta entre duas posições em um vetor imutável.
 * Se idx1 === idx2, a operação é uma auto-troca omitida e retorna o mesmo array com executed = false.
 */
export function swapInArray(
  array: readonly QuickElement[],
  idx1: number,
  idx2: number,
): { readonly newArray: readonly QuickElement[]; readonly executed: boolean } {
  if (idx1 === idx2) {
    return { newArray: array, executed: false };
  }
  const copy = [...array];
  const temp = copy[idx1];
  copy[idx1] = copy[idx2];
  copy[idx2] = temp;
  return { newArray: Object.freeze(copy), executed: true };
}

/**
 * Helper para criar um registro de passo factual pós-evento.
 */
function createStepRecord(params: {
  readonly stepIndex: number;
  readonly eventType: QuickEventType;
  readonly pseudocodeLine: number;
  readonly explanation: string;
  readonly valuesSnapshot: readonly QuickElement[];
  readonly sortedIndices: readonly number[];
  readonly activeInterval: QuickIntervalContext | null;
  readonly pendingIntervals: readonly QuickIntervalContext[];
  readonly i: number;
  readonly j: number;
  readonly pivotIndex: number | null;
  readonly pivotElement: QuickElement | null;
  readonly comparisonContext?: QuickComparisonContext;
  readonly swapContext?: QuickSwapContext;
  readonly comparisons: number;
  readonly swaps: number;
  readonly writesInArray: number;
  readonly errors: number;
}): QuickStepRecord {
  return Object.freeze({
    stepIndex: params.stepIndex,
    eventType: params.eventType,
    pseudocodeLine: params.pseudocodeLine,
    explanation: params.explanation,
    valuesSnapshot: Object.freeze([...params.valuesSnapshot]),
    sortedIndices: Object.freeze([...params.sortedIndices]),
    activeInterval: params.activeInterval
      ? Object.freeze({ ...params.activeInterval })
      : null,
    pendingIntervals: Object.freeze(
      params.pendingIntervals.map((interval) =>
        Object.freeze({ ...interval }),
      ),
    ),
    i: params.i,
    j: params.j,
    pivotIndex: params.pivotIndex,
    pivotElement: params.pivotElement,
    comparisonContext: params.comparisonContext
      ? Object.freeze({ ...params.comparisonContext })
      : undefined,
    swapContext: params.swapContext
      ? Object.freeze({ ...params.swapContext })
      : undefined,
    comparisons: params.comparisons,
    swaps: params.swaps,
    writesInArray: params.writesInArray,
    errors: params.errors,
  });
}

/**
 * Avança todos os passos automáticos da engine (desempilhamento, descarte de vazios
 * e consolidação axiomática de casos unitários) de forma puramente funcional,
 * parando na próxima decisão interativa do estudante ("INSPECT_ELEMENT",
 * "PARTITION_READY_FOR_PIVOT") ou no estado terminal "COMPLETED".
 */
export function advanceAutomaticSteps(state: QuickSortState): QuickSortState {
  let current = state;

  while (!current.completed) {
    // 1. Se não há partição ativa no momento:
    if (current.activeInterval === null) {
      if (current.pendingIntervals.length === 0) {
        // Pilha vazia e nenhum intervalo ativo: ordenação 100% concluída!
        const completeRecord = createStepRecord({
          stepIndex: current.history.length,
          eventType: "SORT_COMPLETE",
          pseudocodeLine: 27,
          explanation: "Todos os subintervalos foram processados. O vetor está completamente ordenado.",
          valuesSnapshot: current.values,
          sortedIndices: current.sortedIndices,
          activeInterval: null,
          pendingIntervals: [],
          i: current.i,
          j: current.j,
          pivotIndex: null,
          pivotElement: null,
          comparisons: current.comparisons,
          swaps: current.swaps,
          writesInArray: current.writesInArray,
          errors: current.errors,
        });

        return Object.freeze({
          ...current,
          phase: "COMPLETED",
          completed: true,
          activeInterval: null,
          pendingIntervals: Object.freeze([]),
          pivotIndex: null,
          pivotElement: null,
          history: Object.freeze([...current.history, completeRecord]),
        });
      }

      // Desempilha o próximo intervalo pendente (topo da pilha LIFO):
      const [nextInterval, ...remainingPending] = current.pendingIntervals;

      // Caso A: Intervalo vazio (low > high) -> descarta sem registrar métricas:
      if (nextInterval.low > nextInterval.high) {
        current = Object.freeze({
          ...current,
          pendingIntervals: Object.freeze(remainingPending),
        });
        continue;
      }

      // Caso B: Intervalo unitário (low === high) -> consolidado automaticamente sem comparações ou trocas:
      if (nextInterval.low === nextInterval.high) {
        const unitIdx = nextInterval.low;
        const newSortedIndices = current.sortedIndices.includes(unitIdx)
          ? current.sortedIndices
          : Object.freeze(
              [...current.sortedIndices, unitIdx].sort((a, b) => a - b),
            );

        const unitRecord = createStepRecord({
          stepIndex: current.history.length,
          eventType: "BASE_CASE_RESOLVED",
          pseudocodeLine: 7,
          explanation: `O intervalo [${unitIdx}..${unitIdx}] contém apenas 1 elemento (${current.values[unitIdx].value}). Está ordenado por definição axiomática.`,
          valuesSnapshot: current.values,
          sortedIndices: newSortedIndices,
          activeInterval: Object.freeze({ low: unitIdx, high: unitIdx }),
          pendingIntervals: remainingPending,
          i: unitIdx - 1,
          j: unitIdx,
          pivotIndex: unitIdx,
          pivotElement: current.values[unitIdx],
          comparisons: current.comparisons,
          swaps: current.swaps,
          writesInArray: current.writesInArray,
          errors: current.errors,
        });

        current = Object.freeze({
          ...current,
          sortedIndices: newSortedIndices,
          pendingIntervals: Object.freeze(remainingPending),
          history: Object.freeze([...current.history, unitRecord]),
        });
        continue;
      }

      // Caso C: Novo intervalo de partição válido (low < high):
      const low = nextInterval.low;
      const high = nextInterval.high;
      const pivotElement = current.values[high];
      const i = low - 1;
      const j = low;
      const activeInterval = Object.freeze({ low, high });

      const startRecord = createStepRecord({
        stepIndex: current.history.length,
        eventType: "PARTITION_START",
        pseudocodeLine: 12,
        explanation: `Início do particionamento no intervalo [${low}..${high}]. O pivô selecionado é ${pivotElement.value} no índice ${high}.`,
        valuesSnapshot: current.values,
        sortedIndices: current.sortedIndices,
        activeInterval,
        pendingIntervals: remainingPending,
        i,
        j,
        pivotIndex: high,
        pivotElement,
        comparisons: current.comparisons,
        swaps: current.swaps,
        writesInArray: current.writesInArray,
        errors: current.errors,
      });

      return Object.freeze({
        ...current,
        phase: "INSPECT_ELEMENT",
        activeInterval,
        pendingIntervals: Object.freeze(remainingPending),
        i,
        j,
        pivotIndex: high,
        pivotElement,
        history: Object.freeze([...current.history, startRecord]),
      });
    }

    // 2. Se já existe uma partição ativa aguardando ação interativa:
    if (
      current.phase === "INSPECT_ELEMENT" ||
      current.phase === "PARTITION_READY_FOR_PIVOT"
    ) {
      return current;
    }

    break;
  }

  return current;
}

/**
 * Inicializa a QuickSortState de forma puramente funcional a partir de itens de entrada.
 * Trata entradas vazias e unitárias sem comparações, trocas ou escritas.
 */
export function initQuickSortState(
  rawInput: readonly QuickInputItem[],
): QuickSortState {
  const initialValues = normalizeQuickInput(rawInput);
  const n = initialValues.length;

  // Caso 1: Vetor vazio (n === 0):
  if (n === 0) {
    const emptyRecord = createStepRecord({
      stepIndex: 0,
      eventType: "SORT_COMPLETE",
      pseudocodeLine: 27,
      explanation: "Vetor vazio. Ordenação concluída com 0 operações.",
      valuesSnapshot: initialValues,
      sortedIndices: [],
      activeInterval: null,
      pendingIntervals: [],
      i: -1,
      j: 0,
      pivotIndex: null,
      pivotElement: null,
      comparisons: 0,
      swaps: 0,
      writesInArray: 0,
      errors: 0,
    });

    return Object.freeze({
      initialValues,
      values: initialValues,
      phase: "COMPLETED",
      activeInterval: null,
      pendingIntervals: Object.freeze([]),
      i: -1,
      j: 0,
      pivotIndex: null,
      pivotElement: null,
      sortedIndices: Object.freeze([]),
      comparisons: 0,
      swaps: 0,
      writesInArray: 0,
      errors: 0,
      hintsUsed: 0,
      completed: true,
      history: Object.freeze([emptyRecord]),
    });
  }

  // Caso 2: Vetor unitário (n === 1):
  if (n === 1) {
    const sortedIndices = Object.freeze([0]);
    const unitRecord = createStepRecord({
      stepIndex: 0,
      eventType: "BASE_CASE_RESOLVED",
      pseudocodeLine: 7,
      explanation: `O vetor possui apenas 1 elemento (${initialValues[0].value}). Está ordenado por definição axiomática.`,
      valuesSnapshot: initialValues,
      sortedIndices,
      activeInterval: Object.freeze({ low: 0, high: 0 }),
      pendingIntervals: [],
      i: -1,
      j: 0,
      pivotIndex: 0,
      pivotElement: initialValues[0],
      comparisons: 0,
      swaps: 0,
      writesInArray: 0,
      errors: 0,
    });

    const completeRecord = createStepRecord({
      stepIndex: 1,
      eventType: "SORT_COMPLETE",
      pseudocodeLine: 27,
      explanation: "Ordenação concluída com sucesso com 0 operações.",
      valuesSnapshot: initialValues,
      sortedIndices,
      activeInterval: null,
      pendingIntervals: [],
      i: -1,
      j: 0,
      pivotIndex: null,
      pivotElement: null,
      comparisons: 0,
      swaps: 0,
      writesInArray: 0,
      errors: 0,
    });

    return Object.freeze({
      initialValues,
      values: initialValues,
      phase: "COMPLETED",
      activeInterval: null,
      pendingIntervals: Object.freeze([]),
      i: -1,
      j: 0,
      pivotIndex: null,
      pivotElement: null,
      sortedIndices,
      comparisons: 0,
      swaps: 0,
      writesInArray: 0,
      errors: 0,
      hintsUsed: 0,
      completed: true,
      history: Object.freeze([unitRecord, completeRecord]),
    });
  }

  // Caso 3: Vetor regular com n >= 2:
  const baseInitialState: QuickSortState = Object.freeze({
    initialValues,
    values: initialValues,
    phase: "IDLE",
    activeInterval: null,
    pendingIntervals: Object.freeze([{ low: 0, high: n - 1 }]),
    i: -1,
    j: 0,
    pivotIndex: null,
    pivotElement: null,
    sortedIndices: Object.freeze([]),
    comparisons: 0,
    swaps: 0,
    writesInArray: 0,
    errors: 0,
    hintsUsed: 0,
    completed: false,
    history: Object.freeze([]),
  });

  return advanceAutomaticSteps(baseInitialState);
}

/**
 * Aplica uma decisão pedagógica do estudante à engine de Quick Sort de forma puramente funcional.
 */
export function stepQuickSort(
  state: QuickSortState,
  decision: QuickDecision,
): QuickStepResult {
  // 1. Guarda contra operações em estado concluído:
  if (state.completed) {
    return Object.freeze({
      state,
      success: false,
      isActionImpossible: true,
      isError: false,
      message: "A ordenação já está concluída.",
    });
  }

  // 2. Guarda contra ações impossíveis para a fase atual:
  if (state.phase === "INSPECT_ELEMENT" && decision === "PLACE_PIVOT") {
    return Object.freeze({
      state,
      success: false,
      isActionImpossible: true,
      isError: false,
      message: "Ainda há elementos a classificar antes de posicionar o pivô.",
    });
  }

  if (
    state.phase === "PARTITION_READY_FOR_PIVOT" &&
    (decision === "LESS_OR_EQUAL" || decision === "GREATER")
  ) {
    return Object.freeze({
      state,
      success: false,
      isActionImpossible: true,
      isError: false,
      message: "Todos os elementos do intervalo já foram classificados. Posicione o pivô na posição final.",
    });
  }

  // 3. Fase INSPECT_ELEMENT: classificação de A[j] contra o pivô A[high]
  if (state.phase === "INSPECT_ELEMENT") {
    if (!state.activeInterval) {
      return Object.freeze({
        state,
        success: false,
        isActionImpossible: true,
        isError: false,
        message: "Nenhum intervalo de partição ativo.",
      });
    }

    const currentElem = state.values[state.j];
    const pivotElem = state.values[state.activeInterval.high];

    // Condição matemática relacional estrita: A[j].value <= P.value
    const isLessOrEqual = currentElem.value <= pivotElem.value;
    const expectedDecision: QuickDecision = isLessOrEqual
      ? "LESS_OR_EQUAL"
      : "GREATER";

    // Validação da decisão do estudante:
    if (decision !== expectedDecision) {
      // Decisão incorreta: erro pedagógico conceitual.
      // O estado retém os ponteiros intactos, não avança j e não incrementa métricas algorítmicas.
      const updatedState = Object.freeze({
        ...state,
        errors: state.errors + 1,
      });

      const feedback = isLessOrEqual
        ? `O número ${currentElem.value} é MENOR OU IGUAL ao pivô ${pivotElem.value}. Ele deve ir para a região dos menores ou iguais.`
        : `O número ${currentElem.value} é MAIOR que o pivô ${pivotElem.value}. Ele deve permanecer na região dos maiores.`;

      return Object.freeze({
        state: updatedState,
        success: false,
        isActionImpossible: false,
        isError: true,
        message: feedback,
      });
    }

    // Decisão correta!
    // Incrementa exatamente 1 comparação relacional:
    const newComparisons = state.comparisons + 1;

    // Preserva o contexto anterior da comparação no momento exato da decisão:
    const comparisonContext: QuickComparisonContext = Object.freeze({
      elementIndex: state.j,
      elementValue: currentElem.value,
      elementLabel: currentElem.label,
      elementId: currentElem.id,
      pivotIndex: state.activeInterval.high,
      pivotValue: pivotElem.value,
      pivotLabel: pivotElem.label,
      pivotId: pivotElem.id,
      expectedDecision,
    });

    let newI = state.i;
    let newValues = state.values;
    let newSwaps = state.swaps;
    let newWritesInArray = state.writesInArray;
    let swapContext: QuickSwapContext | undefined = undefined;
    let pseudocodeLine = 14; // para j de inicio até fim - 1 faça

    if (decision === "LESS_OR_EQUAL") {
      newI = state.i + 1;

      // Executa permuta se newI !== state.j:
      const swapRes = swapInArray(state.values, newI, state.j);
      newValues = swapRes.newArray;

      if (swapRes.executed) {
        // Troca física entre índices distintos:
        newSwaps = state.swaps + 1;
        newWritesInArray = state.writesInArray + 2;
        swapContext = Object.freeze({
          fromIndex: state.j,
          toIndex: newI,
          fromElement: currentElem,
          toElement: state.values[newI],
        });
        pseudocodeLine = 18; // trocar A[i] com A[j]
      } else {
        // Auto-troca omitida (newI === state.j): 0 trocas e 0 escritas:
        pseudocodeLine = 16; // i ← i + 1
      }
    }

    const newJ = state.j + 1;
    const nextPhase =
      newJ < state.activeInterval.high
        ? "INSPECT_ELEMENT"
        : "PARTITION_READY_FOR_PIVOT";

    const explanation =
      decision === "LESS_OR_EQUAL"
        ? swapContext
          ? `O número ${currentElem.value} (índice ${state.j}) é menor ou igual ao pivô ${pivotElem.value}. Permutou com ${swapContext.toElement.value} (índice ${newI}).`
          : `O número ${currentElem.value} (índice ${state.j}) é menor ou igual ao pivô ${pivotElem.value}. A fronteira de menores avançou para ${newI}.`
        : `O número ${currentElem.value} (índice ${state.j}) é maior que o pivô ${pivotElem.value}. Permanece na região dos maiores.`;

    const stepRecord = createStepRecord({
      stepIndex: state.history.length,
      eventType: "CLASSIFY_ELEMENT",
      pseudocodeLine,
      explanation,
      valuesSnapshot: newValues,
      sortedIndices: state.sortedIndices,
      activeInterval: state.activeInterval,
      pendingIntervals: state.pendingIntervals,
      i: newI,
      j: newJ,
      pivotIndex: state.activeInterval.high,
      pivotElement: state.values[state.activeInterval.high],
      comparisonContext,
      swapContext,
      comparisons: newComparisons,
      swaps: newSwaps,
      writesInArray: newWritesInArray,
      errors: state.errors,
    });

    const updatedState: QuickSortState = Object.freeze({
      ...state,
      values: newValues,
      phase: nextPhase,
      i: newI,
      j: newJ,
      comparisons: newComparisons,
      swaps: newSwaps,
      writesInArray: newWritesInArray,
      history: Object.freeze([...state.history, stepRecord]),
    });

    return Object.freeze({
      state: updatedState,
      success: true,
      isActionImpossible: false,
      isError: false,
      message: explanation,
    });
  }

  // 4. Fase PARTITION_READY_FOR_PIVOT: colocar o pivô na posição final
  if (
    state.phase === "PARTITION_READY_FOR_PIVOT" &&
    decision === "PLACE_PIVOT"
  ) {
    if (!state.activeInterval) {
      return Object.freeze({
        state,
        success: false,
        isActionImpossible: true,
        isError: false,
        message: "Nenhum intervalo de partição ativo.",
      });
    }

    const { low, high } = state.activeInterval;
    const pivotFinalPos = state.i + 1;

    // Executa a permuta física entre o pivô (no índice high) e a fronteira (pivotFinalPos):
    const swapRes = swapInArray(state.values, pivotFinalPos, high);
    const newValues = swapRes.newArray;

    let newSwaps = state.swaps;
    let newWritesInArray = state.writesInArray;
    let swapContext: QuickSwapContext | undefined = undefined;
    let pseudocodeLine = 25; // marcar A[i + 1] como DEFINITIVO

    if (swapRes.executed) {
      // Troca física entre índices distintos:
      newSwaps = state.swaps + 1;
      newWritesInArray = state.writesInArray + 2;
      swapContext = Object.freeze({
        fromIndex: high,
        toIndex: pivotFinalPos,
        fromElement: state.values[high],
        toElement: state.values[pivotFinalPos],
      });
      pseudocodeLine = 23; // trocar A[i + 1] com A[fim]
    }

    // O pivô recebe o selo OK DEFINITIVO na sua posição final:
    const newSortedIndices = Object.freeze(
      Array.from(new Set([...state.sortedIndices, pivotFinalPos])).sort(
        (a, b) => a - b,
      ),
    );

    // Pilha LIFO explícita com processamento esquerdo antes do direito (left-first):
    // Empilha primeiro o subintervalo direito (se não vazio):
    const nextPending: QuickIntervalContext[] = [...state.pendingIntervals];
    if (pivotFinalPos + 1 <= high) {
      nextPending.unshift(
        Object.freeze({ low: pivotFinalPos + 1, high }),
      );
    }
    // Empilha em seguida o subintervalo esquerdo (se não vazio):
    if (low <= pivotFinalPos - 1) {
      nextPending.unshift(
        Object.freeze({ low, high: pivotFinalPos - 1 }),
      );
    }

    const pivotElem = newValues[pivotFinalPos];
    const explanation = swapRes.executed
      ? `O pivô ${pivotElem.value} foi colocado na posição final ${pivotFinalPos} (trocou com ${swapContext!.toElement.value}) e recebeu o selo DEFINITIVO.`
      : `O pivô ${pivotElem.value} já se encontrava na posição final ${pivotFinalPos} e recebeu o selo DEFINITIVO.`;

    const stepRecord = createStepRecord({
      stepIndex: state.history.length,
      eventType: "PIVOT_POSITIONED",
      pseudocodeLine,
      explanation,
      valuesSnapshot: newValues,
      sortedIndices: newSortedIndices,
      activeInterval: state.activeInterval,
      pendingIntervals: nextPending,
      i: state.i,
      j: state.j,
      pivotIndex: pivotFinalPos,
      pivotElement: pivotElem,
      swapContext,
      comparisons: state.comparisons,
      swaps: newSwaps,
      writesInArray: newWritesInArray,
      errors: state.errors,
    });

    // Estado imediatamente após a consolidação do pivô:
    const statePostPivot: QuickSortState = Object.freeze({
      ...state,
      values: newValues,
      activeInterval: null,
      pendingIntervals: Object.freeze(nextPending),
      sortedIndices: newSortedIndices,
      pivotIndex: pivotFinalPos,
      pivotElement: pivotElem,
      swaps: newSwaps,
      writesInArray: newWritesInArray,
      history: Object.freeze([...state.history, stepRecord]),
    });

    // Avança automaticamente para o próximo subproblema (ou COMPLETED):
    const finalState = advanceAutomaticSteps(statePostPivot);

    return Object.freeze({
      state: finalState,
      success: true,
      isActionImpossible: false,
      isError: false,
      message: explanation,
    });
  }

  return Object.freeze({
    state,
    success: false,
    isActionImpossible: true,
    isError: false,
    message: "Ação não reconhecida para o estado atual.",
  });
}

/**
 * Reconstrói um quadro visual imutável a partir de um registro de histórico
 * sem necessitar reexecutar a ordenação.
 */
export function reconstructQuickVisualFrame(
  record: QuickStepRecord,
): QuickVisualStepFrame {
  return Object.freeze({
    stepIndex: record.stepIndex,
    eventType: record.eventType,
    pseudocodeLine: record.pseudocodeLine,
    explanation: record.explanation,
    values: record.valuesSnapshot,
    sortedIndices: record.sortedIndices,
    activeInterval: record.activeInterval,
    pendingIntervals: record.pendingIntervals,
    i: record.i,
    j: record.j,
    pivotIndex: record.pivotIndex,
    pivotElement: record.pivotElement,
    comparisonContext: record.comparisonContext,
    swapContext: record.swapContext,
    comparisons: record.comparisons,
    swaps: record.swaps,
    writesInArray: record.writesInArray,
    errors: record.errors,
  });
}
