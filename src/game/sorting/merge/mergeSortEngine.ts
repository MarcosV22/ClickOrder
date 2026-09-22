/**
 * Engine pedagógica pura de Merge Sort para o Sorting Station.
 *
 * Módulo puramente funcional, imutável e sem efeitos colaterais.
 * Implementa a variante canônica Merge Sort Top-Down com limites inclusivos,
 * travessia pós-ordem à esquerda, pilha explícita de tarefas e buffer auxiliar visível.
 *
 * Não utiliza nem depende de React, DOM, localStorage ou temporizadores.
 */

import { calculateProtocolScore } from "../../session/protocolScore";
import type {
  ExpectedMergeStep,
  MergeCopyBackStepRecord,
  MergeDecision,
  MergeDispatchStepRecord,
  MergeDivideStepRecord,
  MergeDrainStepRecord,
  MergeElement,
  MergeInitStepRecord,
  MergeInputItem,
  MergeIntervalContext,
  MergePhase,
  MergeSortState,
  MergeStepRecord,
  MergeStepResult,
  MergeTask,
  MergeVisualStepFrame,
  ReconstructMergeStateResult,
} from "./types";

/**
 * Cria uma carga de Merge Sort com identidade estável e imutável.
 */
export function createMergeElement(
  value: number,
  originalIndex: number,
  label?: string,
  idPrefix = "elem",
): MergeElement {
  return Object.freeze({
    id: `${idPrefix}-${originalIndex}-v${value}`,
    value,
    originalIndex,
    label: label ?? undefined,
  });
}

/**
 * Normaliza a entrada para uma lista imutável de MergeElements com identidades estáveis.
 */
export function normalizeMergeInput(
  rawInput: readonly MergeInputItem[],
): readonly MergeElement[] {
  return Object.freeze(
    rawInput.map((item, idx) => {
      if (typeof item === "number") {
        return createMergeElement(item, idx);
      }
      if ("id" in item && typeof item.id === "string") {
        const originalIndex =
          "originalIndex" in item && typeof item.originalIndex === "number"
            ? item.originalIndex
            : idx;
        return Object.freeze({
          id: item.id,
          value: item.value,
          originalIndex,
          label: item.label ?? undefined,
        });
      }
      return Object.freeze({
        id: item.id ?? `elem-${idx}-v${item.value}`,
        value: item.value,
        originalIndex: idx,
        label: item.label ?? undefined,
      });
    }),
  );
}

/**
 * Avança todos os passos automáticos da engine (divisões, inicializações e cópias de retorno)
 * de forma puramente funcional até atingir uma decisão interativa do estudante
 * ("COMPARE_HEADS" ou "DRAIN_READY") ou o estado terminal "COMPLETED".
 */
export function advanceAutomaticSteps(state: MergeSortState): MergeSortState {
  let current = state;

  while (!current.completed) {
    // 1. Se existe uma intercalação ativa no estado:
    if (current.activeInterval !== null) {
      const { left, mid, right } = current.activeInterval;
      const len = right - left + 1;

      // Se o buffer foi totalmente preenchido (k === len), executa a cópia de retorno automática:
      if (current.k === len) {
        const copiedElements = (current.buffer as readonly MergeElement[]).map(
          (elem, offset) => ({
            element: elem,
            targetIndex: left + offset,
          }),
        );

        const newValues = [...current.values];
        for (const item of copiedElements) {
          newValues[item.targetIndex] = item.element;
        }

        const isRoot = current.activeInterval.isRootMerge;
        const copyBackRecord: MergeCopyBackStepRecord = Object.freeze({
          type: "COPY_BACK",
          stepNumber: current.history.length + 1,
          left,
          right,
          copiedElements: Object.freeze(copiedElements),
          isRootMerge: isRoot,
          valuesSnapshot: Object.freeze(newValues),
          bufferSnapshot: current.buffer,
          explanation: isRoot
            ? `Intercalação raiz [${left}..${right}] finalizada! Elementos consolidados na esteira principal com status OK.`
            : `Intervalo [${left}..${right}] consolidado na esteira principal com marcação ORD (subvetor ordenado localmente).`,
        });

        const newWritesInMain = current.writesInMain + len;
        current = Object.freeze({
          ...current,
          values: Object.freeze(newValues),
          buffer: Object.freeze([]),
          activeInterval: null,
          p1: 0,
          p2: 0,
          k: 0,
          phase: "COPY_BACK_AUTOMATIC",
          writesInMain: newWritesInMain,
          totalWrites: current.writesInBuffer + newWritesInMain,
          history: Object.freeze([...current.history, copyBackRecord]),
        });
        // Continua o loop para verificar próximas tarefas pendentes na pilha.
        continue;
      }

      // Se ambos os ramais possuem cargas nas frentes:
      if (current.p1 <= mid && current.p2 <= right) {
        if (current.phase !== "COMPARE_HEADS") {
          current = Object.freeze({
            ...current,
            phase: "COMPARE_HEADS",
          });
        }
        // Estado interativo: aguarda ação do operador.
        break;
      }

      // Se um dos ramais se esgotou e o outro possui cauda remanescente:
      if (current.p1 <= mid || current.p2 <= right) {
        if (current.phase !== "DRAIN_READY") {
          current = Object.freeze({
            ...current,
            phase: "DRAIN_READY",
          });
        }
        // Estado interativo: aguarda ação DRAIN_REMAINDER do operador.
        break;
      }
    }

    // 2. Se não há intercalação ativa, verifica tarefas na pilha LIFO:
    if (current.tasks.length === 0) {
      // Pilha vazia e sem intercalação ativa => algoritmo concluído!
      current = Object.freeze({
        ...current,
        phase: "COMPLETED",
        completed: true,
      });
      break;
    }

    // Desempilha a tarefa do topo:
    const tasks = [...current.tasks];
    const topTask = tasks.pop()!;

    if (topTask.type === "DIVIDE") {
      const { left, right, depth } = topTask;

      // Caso base: subvetores de tamanho <= 1 estão trivialmente ordenados por axioma:
      if (left >= right) {
        current = Object.freeze({
          ...current,
          tasks: Object.freeze(tasks),
        });
        continue;
      }

      // Decomposição com corte em mid:
      const mid = left + Math.floor((right - left) / 2);
      const divideRecord: MergeDivideStepRecord = Object.freeze({
        type: "DIVIDE",
        stepNumber: current.history.length + 1,
        left,
        mid,
        right,
        depth,
        valuesSnapshot: current.values,
        explanation: `Divisão estrutural do intervalo [${left}..${right}] em ramo esquerdo [${left}..${mid}] e ramo direito [${mid + 1}..${right}].`,
      });

      // Empilha tarefas em ordem LIFO (o ramo esquerdo será desempilhado primeiro):
      const newTasks: MergeTask[] = [
        ...tasks,
        { type: "MERGE_INIT", left, mid, right, depth },
        { type: "DIVIDE", left: mid + 1, right, depth: depth + 1 },
        { type: "DIVIDE", left, right: mid, depth: depth + 1 },
      ];

      current = Object.freeze({
        ...current,
        tasks: Object.freeze(newTasks),
        phase: "DIVIDE_AUTOMATIC",
        history: Object.freeze([...current.history, divideRecord]),
      });
      continue;
    }

    if (topTask.type === "MERGE_INIT") {
      const { left, mid, right, depth } = topTask;
      const len = right - left + 1;
      const isRoot = left === 0 && right === current.values.length - 1;
      const initialBuffer: readonly (MergeElement | null)[] = Object.freeze(
        new Array(len).fill(null),
      );

      const activeInterval: MergeIntervalContext = Object.freeze({
        left,
        mid,
        right,
        depth,
        isRootMerge: isRoot,
      });

      const initRecord: MergeInitStepRecord = Object.freeze({
        type: "MERGE_INIT",
        stepNumber: current.history.length + 1,
        left,
        mid,
        right,
        depth,
        isRootMerge: isRoot,
        p1: left,
        p2: mid + 1,
        k: 0,
        bufferSnapshot: initialBuffer,
        valuesSnapshot: current.values,
        explanation: `Início da intercalação do intervalo [${left}..${right}] com corte em mid=${mid}. Esteira coletora auxiliar alocada com ${len} posições.`,
      });

      current = Object.freeze({
        ...current,
        tasks: Object.freeze(tasks),
        activeInterval,
        buffer: initialBuffer,
        p1: left,
        p2: mid + 1,
        k: 0,
        phase: "COMPARE_HEADS",
        history: Object.freeze([...current.history, initRecord]),
      });
      // Ambas as frentes possuem cargas: para o loop e aguarda decisão do estudante.
      break;
    }
  }

  return current;
}

/**
 * Inicializa o estado imutável da Merge Sort Engine.
 * Entradas vazias ou unitárias concluem imediatamente com zero comparações e zero escritas.
 */
export function initMergeSortState(
  rawInput: readonly MergeInputItem[],
): MergeSortState {
  const elements = normalizeMergeInput(rawInput);
  const n = elements.length;

  // Entradas vazias ou unitárias:
  if (n <= 1) {
    return Object.freeze({
      initialValues: elements,
      values: elements,
      buffer: Object.freeze([]),
      activeInterval: null,
      p1: 0,
      p2: 0,
      k: 0,
      phase: "COMPLETED",
      tasks: Object.freeze([]),
      comparisons: 0,
      writesInBuffer: 0,
      writesInMain: 0,
      totalWrites: 0,
      errors: 0,
      hintsUsed: 0,
      history: Object.freeze([]),
      completed: true,
    });
  }

  const initialTasks: readonly MergeTask[] = Object.freeze([
    { type: "DIVIDE", left: 0, right: n - 1, depth: 0 },
  ]);

  const rawState: MergeSortState = Object.freeze({
    initialValues: elements,
    values: elements,
    buffer: Object.freeze([]),
    activeInterval: null,
    p1: 0,
    p2: 0,
    k: 0,
    phase: "DIVIDE_AUTOMATIC",
    tasks: initialTasks,
    comparisons: 0,
    writesInBuffer: 0,
    writesInMain: 0,
    totalWrites: 0,
    errors: 0,
    hintsUsed: 0,
    history: Object.freeze([]),
    completed: false,
  });

  return advanceAutomaticSteps(rawState);
}

/**
 * Retorna os metadados da próxima ação algorítmica esperada da engine.
 */
export function getExpectedMergeStep(
  state: MergeSortState,
): ExpectedMergeStep | null {
  if (state.completed || state.activeInterval === null) {
    return null;
  }

  const { mid, right } = state.activeInterval;

  if (state.phase === "COMPARE_HEADS") {
    const leftElem = state.values[state.p1];
    const rightElem = state.values[state.p2];

    if (!leftElem || !rightElem) {
      return null;
    }

    // Regra canônica de estabilidade: se leftElem.value <= rightElem.value, prioriza esquerda!
    const expectedDecision: MergeDecision =
      leftElem.value <= rightElem.value ? "DISPATCH_LEFT" : "DISPATCH_RIGHT";

    const isTie = leftElem.value === rightElem.value;
    const explanation = isTie
      ? `Valores iguais (${leftElem.value}). A regra de estabilidade exige despachar o Ramal Esquerdo para manter a ordem relativa original.`
      : expectedDecision === "DISPATCH_LEFT"
        ? `Carga do Ramal Esquerdo (${leftElem.value}) é menor que a do Ramal Direito (${rightElem.value}). Despachar esquerda.`
        : `Carga do Ramal Direito (${rightElem.value}) é menor que a do Ramal Esquerdo (${leftElem.value}). Despachar direita.`;

    return Object.freeze({
      phase: "COMPARE_HEADS",
      expectedDecision,
      p1: state.p1,
      p2: state.p2,
      leftElement: leftElem,
      rightElement: rightElem,
      explanation,
    });
  }

  if (state.phase === "DRAIN_READY") {
    const leftExhausted = state.p1 > mid;
    const remainingSource = leftExhausted ? "Direito" : "Esquerdo";

    return Object.freeze({
      phase: "DRAIN_READY",
      expectedDecision: "DRAIN_REMAINDER",
      p1: state.p1,
      p2: state.p2,
      explanation: `Ramal ${leftExhausted ? "Esquerdo" : "Direito"} esgotado. Acione DESPACHAR RESTANTE para liberar as cargas remanescentes do Ramal ${remainingSource}.`,
    });
  }

  return null;
}

/**
 * Executa uma decisão do operador na Merge Sort Engine.
 *
 * Garante:
 * - Registro único de comparação ao despachar frentes válidas;
 * - Respostas erradas não avançam ponteiros, não adicionam comparações e não fazem escritas;
 * - Ações impossíveis para a fase atual são ignoradas sem penalidade;
 * - Drenagem não gera comparações algorítmicas;
 * - Avanço automático determinístico até o próximo estado interativo ou COMPLETED.
 */
export function executeMergeStep(
  state: MergeSortState,
  decision: MergeDecision,
): MergeStepResult {
  // 1. Proteção de estado concluído:
  if (state.completed || state.activeInterval === null) {
    return Object.freeze({
      state,
      resultType: "INVALID_ACTION_FOR_PHASE",
      valid: false,
      isPedagogicalError: false,
      errorReason: "A ordenação já está concluída.",
    });
  }

  const { mid, right } = state.activeInterval;

  // 2. Tratamento na fase COMPARE_HEADS:
  if (state.phase === "COMPARE_HEADS") {
    if (decision === "DRAIN_REMAINDER") {
      return Object.freeze({
        state,
        resultType: "INVALID_ACTION_FOR_PHASE",
        valid: false,
        isPedagogicalError: false,
        expectedDecision:
          state.values[state.p1].value <= state.values[state.p2].value
            ? "DISPATCH_LEFT"
            : "DISPATCH_RIGHT",
        errorReason:
          "Não é possível drenar enquanto ambos os ramais ainda possuem cargas sob os sensores ópticos.",
      });
    }

    const elemLeft = state.values[state.p1];
    const elemRight = state.values[state.p2];

    const isTie = elemLeft.value === elemRight.value;
    const expectedDecision: MergeDecision =
      elemLeft.value <= elemRight.value ? "DISPATCH_LEFT" : "DISPATCH_RIGHT";

    // Decisão incorreta pelo operador:
    if (decision !== expectedDecision) {
      const errorReason = isTie
        ? `Violação de Estabilidade: Ambas as cargas possuem o mesmo valor (${elemLeft.value}). O Merge Sort exige priorizar o Ramal Esquerdo para preservar a ordem relativa original dos itens.`
        : decision === "DISPATCH_LEFT"
          ? `Atenção na Confluência: A carga do Ramal Esquerdo (${elemLeft.value}) é maior que a do Ramal Direito (${elemRight.value}). O Merge Sort exige sempre colher a menor carga.`
          : `Atenção na Confluência: A carga do Ramal Direito (${elemRight.value}) é maior que a do Ramal Esquerdo (${elemLeft.value}). O Merge Sort exige sempre colher a menor carga.`;

      const newStateWithError = Object.freeze({
        ...state,
        errors: state.errors + 1,
      });

      return Object.freeze({
        state: newStateWithError,
        resultType: "PEDAGOGICAL_ERROR",
        valid: false,
        isPedagogicalError: true,
        expectedDecision,
        errorReason,
      });
    }

    // Decisão correta do operador:
    const chosenElement = decision === "DISPATCH_LEFT" ? elemLeft : elemRight;
    const newP1 = decision === "DISPATCH_LEFT" ? state.p1 + 1 : state.p1;
    const newP2 = decision === "DISPATCH_RIGHT" ? state.p2 + 1 : state.p2;
    const targetBufferIndex = state.k;

    const newBuffer = [...state.buffer];
    newBuffer[targetBufferIndex] = chosenElement;

    const dispatchRecord: MergeDispatchStepRecord = Object.freeze({
      type: "DISPATCH",
      stepNumber: state.history.length + 1,
      source: decision === "DISPATCH_LEFT" ? "LEFT" : "RIGHT",
      element: chosenElement,
      targetBufferIndex,
      p1: newP1,
      p2: newP2,
      k: state.k + 1,
      comparisonCounted: true,
      bufferSnapshot: Object.freeze(newBuffer),
      valuesSnapshot: state.values,
      explanation: isTie
        ? `Despachada carga ${chosenElement.value}${chosenElement.label ? ` (${chosenElement.label})` : ""} do Ramal Esquerdo por regra de estabilidade.`
        : `Despachada carga menor ${chosenElement.value}${chosenElement.label ? ` (${chosenElement.label})` : ""} do Ramal ${decision === "DISPATCH_LEFT" ? "Esquerdo" : "Direito"} para a esteira coletora.`,
    });

    const newWritesInBuffer = state.writesInBuffer + 1;
    const stateAfterDispatch: MergeSortState = Object.freeze({
      ...state,
      buffer: Object.freeze(newBuffer),
      p1: newP1,
      p2: newP2,
      k: state.k + 1,
      comparisons: state.comparisons + 1,
      writesInBuffer: newWritesInBuffer,
      totalWrites: newWritesInBuffer + state.writesInMain,
      history: Object.freeze([...state.history, dispatchRecord]),
    });

    const advancedState = advanceAutomaticSteps(stateAfterDispatch);
    return Object.freeze({
      state: advancedState,
      resultType: "SUCCESS",
      valid: true,
      isPedagogicalError: false,
    });
  }

  // 3. Tratamento na fase DRAIN_READY:
  if (state.phase === "DRAIN_READY") {
    if (decision !== "DRAIN_REMAINDER") {
      return Object.freeze({
        state,
        resultType: "INVALID_ACTION_FOR_PHASE",
        valid: false,
        isPedagogicalError: false,
        expectedDecision: "DRAIN_REMAINDER",
        errorReason:
          "Um dos ramais já está esgotado. Acione DESPACHAR RESTANTE para liberar as cargas remanescentes sem novas comparações.",
      });
    }

    const remainingSource: "LEFT" | "RIGHT" = state.p1 <= mid ? "LEFT" : "RIGHT";
    const drainedElements: { element: MergeElement; targetBufferIndex: number }[] = [];
    const newBuffer = [...state.buffer];

    let currentK = state.k;
    let newP1 = state.p1;
    let newP2 = state.p2;

    if (remainingSource === "LEFT") {
      while (newP1 <= mid) {
        const elem = state.values[newP1];
        newBuffer[currentK] = elem;
        drainedElements.push({ element: elem, targetBufferIndex: currentK });
        newP1++;
        currentK++;
      }
    } else {
      while (newP2 <= right) {
        const elem = state.values[newP2];
        newBuffer[currentK] = elem;
        drainedElements.push({ element: elem, targetBufferIndex: currentK });
        newP2++;
        currentK++;
      }
    }

    const drainRecord: MergeDrainStepRecord = Object.freeze({
      type: "DRAIN",
      stepNumber: state.history.length + 1,
      remainingSource,
      drainedElements: Object.freeze(drainedElements),
      p1: newP1,
      p2: newP2,
      k: currentK,
      bufferSnapshot: Object.freeze(newBuffer),
      valuesSnapshot: state.values,
      explanation: `Drenagem em lote de ${drainedElements.length} carga(s) remanescente(s) do Ramal ${remainingSource === "LEFT" ? "Esquerdo" : "Direito"} para a esteira coletora (custo: 0 comparações).`,
    });

    const newWritesInBuffer = state.writesInBuffer + drainedElements.length;
    const stateAfterDrain: MergeSortState = Object.freeze({
      ...state,
      buffer: Object.freeze(newBuffer),
      p1: newP1,
      p2: newP2,
      k: currentK,
      writesInBuffer: newWritesInBuffer,
      totalWrites: newWritesInBuffer + state.writesInMain,
      history: Object.freeze([...state.history, drainRecord]),
    });

    const advancedState = advanceAutomaticSteps(stateAfterDrain);
    return Object.freeze({
      state: advancedState,
      resultType: "SUCCESS",
      valid: true,
      isPedagogicalError: false,
    });
  }

  return Object.freeze({
    state,
    resultType: "INVALID_ACTION_FOR_PHASE",
    valid: false,
    isPedagogicalError: false,
    errorReason: "Fase operacional inválida para receber decisões.",
  });
}

/**
 * Solicita uma dica pedagógica para a engine, incrementando o contador de dicas.
 */
export function requestMergeHint(state: MergeSortState): {
  state: MergeSortState;
  hint: string;
} {
  const expected = getExpectedMergeStep(state);
  const hintText = expected?.explanation ?? "Acompanhe as esteiras convergentes para intercalar as cargas ordenadamente.";

  const nextState = Object.freeze({
    ...state,
    hintsUsed: state.hintsUsed + 1,
  });

  return {
    state: nextState,
    hint: hintText,
  };
}

/**
 * Retorna se o Merge Sort atingiu a ordenação global definitiva (vetor 100% OK).
 */
export function isMergeSortCompleted(state: MergeSortState): boolean {
  return state.completed;
}

/**
 * Calcula a Pontuação do Protocolo canônica para o estado da engine.
 */
export function getMergeSortScore(state: MergeSortState): number {
  return calculateProtocolScore({
    errors: state.errors,
    hintsUsed: state.hintsUsed,
  });
}

/**
 * Deriva a lista sequencial de quadros visuais a partir do histórico de passos.
 * Cada quadro reconstrói snapshot do vetor, buffer, intervalo ativo, fase,
 * ponteiros (p1, p2, k) e contadores cumulativos até aquele exato instante.
 */
export function deriveMergeFramesFromHistory(
  initialValues: readonly MergeElement[],
  history: readonly MergeStepRecord[],
): readonly MergeVisualStepFrame[] {
  const frames: MergeVisualStepFrame[] = [];
  let cumComparisons = 0;
  let cumWritesInBuffer = 0;
  let cumWritesInMain = 0;
  let activeContext: MergeIntervalContext | null = null;
  const totalLen = initialValues.length;

  for (let idx = 0; idx < history.length; idx++) {
    const step = history[idx];
    let phase: MergePhase = "DIVIDE_AUTOMATIC";
    let p1 = 0;
    let p2 = 0;
    let k = 0;
    let isRootMerge = false;

    switch (step.type) {
      case "DIVIDE": {
        phase = "DIVIDE_AUTOMATIC";
        isRootMerge = step.left === 0 && step.right === totalLen - 1;
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
        break;
      }
      case "DISPATCH": {
        if (step.comparisonCounted) {
          cumComparisons++;
        }
        cumWritesInBuffer++;
        p1 = step.p1;
        p2 = step.p2;
        k = step.k;
        isRootMerge = activeContext?.isRootMerge ?? false;
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
        isRootMerge = activeContext?.isRootMerge ?? false;
        phase = "COPY_BACK_AUTOMATIC";
        break;
      }
      case "COPY_BACK": {
        cumWritesInMain += step.copiedElements.length;
        isRootMerge = step.isRootMerge;
        phase = step.isRootMerge ? "COMPLETED" : "DIVIDE_AUTOMATIC";
        p1 = 0;
        p2 = 0;
        k = 0;
        activeContext = null;
        break;
      }
    }

    frames.push(
      Object.freeze({
        stepIndex: idx,
        stepNumber: step.stepNumber,
        type: step.type,
        phase,
        activeInterval: activeContext,
        p1,
        p2,
        k,
        values: step.valuesSnapshot,
        buffer: "bufferSnapshot" in step ? step.bufferSnapshot : Object.freeze([]),
        explanation: step.explanation,
        cumulativeComparisons: cumComparisons,
        cumulativeWritesInBuffer: cumWritesInBuffer,
        cumulativeWritesInMain: cumWritesInMain,
        cumulativeTotalWrites: cumWritesInBuffer + cumWritesInMain,
        isRootMerge,
      }),
    );
  }

  return Object.freeze(frames);
}

/**
 * Recupera um quadro visual reconstruído em um índice específico do histórico.
 */
export function reconstructMergeStepAt(
  initialValues: readonly MergeElement[],
  history: readonly MergeStepRecord[],
  stepIndex: number,
): MergeVisualStepFrame | null {
  if (stepIndex < 0 || stepIndex >= history.length) {
    return null;
  }
  const frames = deriveMergeFramesFromHistory(initialValues, history);
  return frames[stepIndex] ?? null;
}

/**
 * Reconstrução e auditoria factual do estado final e intermediário a partir
 * estritamente dos registros de histórico e da entrada inicial, sem reexecutar
 * decisões de ordenação da engine.
 */
export function reconstructMergeStateFromHistory(
  initialValues: readonly MergeElement[],
  history: readonly MergeStepRecord[],
): ReconstructMergeStateResult {
  let values = [...initialValues];
  let totalComparisons = 0;
  let totalBufferWrites = 0;
  let totalMainWrites = 0;
  let mergeInitCount = 0;
  let divideCount = 0;
  let copyBackCount = 0;

  for (const step of history) {
    switch (step.type) {
      case "DIVIDE":
        divideCount++;
        break;
      case "MERGE_INIT":
        mergeInitCount++;
        break;
      case "DISPATCH":
        if (step.comparisonCounted) {
          totalComparisons++;
        }
        totalBufferWrites++;
        break;
      case "DRAIN":
        totalBufferWrites += step.drainedElements.length;
        break;
      case "COPY_BACK":
        copyBackCount++;
        totalMainWrites += step.copiedElements.length;
        for (const item of step.copiedElements) {
          values[item.targetIndex] = item.element;
        }
        break;
    }
  }

  const frames = deriveMergeFramesFromHistory(initialValues, history);

  return {
    finalValues: Object.freeze(values),
    totalComparisons,
    totalBufferWrites,
    totalMainWrites,
    totalWrites: totalBufferWrites + totalMainWrites,
    mergeInitCount,
    divideCount,
    copyBackCount,
    frames,
  };
}

