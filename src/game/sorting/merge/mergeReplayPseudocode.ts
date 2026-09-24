/**
 * Mapeamento determinístico e sincronização de pseudocódigo canônico de 30 linhas
 * para o Replay e Demonstração do Merge Sort.
 *
 * Módulo puramente funcional e imutável.
 * Corresponde exatamente à especificação do ADR 0023 e docs/wiki/modules/merge-sort.md:
 * - Limites inclusivos [inicio..fim];
 * - Divisão esquerda antes da direita (meio = floor((inicio + fim) / 2));
 * - Caso-base implícito (se inicio < fim);
 * - Alocação explícita do buffer e inicialização de ponteiros (p1, p2, k);
 * - Comparação de valores com desempate estável em favor do ramal esquerdo (A[p1].value <= A[p2].value);
 * - Drenagem em lote com avanço de k;
 * - Cópia de retorno final de todos os elementos para o vetor principal.
 */

import type { MergeReplayFrame } from "./mergeReplayModel";

export interface MergeCanonicalPseudocodeLine {
  readonly lineNumber: number;
  readonly code: string;
  readonly indent: number;
  readonly section: "mergeSort" | "intercalar";
  readonly id: string;
}

/**
 * Pseudocódigo canônico completo de 30 linhas do Merge Sort (ADR 0023).
 */
export const MERGE_SORT_CANONICAL_PSEUDOCODE: readonly MergeCanonicalPseudocodeLine[] =
  Object.freeze([
    Object.freeze({
      lineNumber: 1,
      code: "procedimento mergeSort(A, inicio, fim)",
      indent: 0,
      section: "mergeSort",
      id: "PROC_MERGE_SORT",
    }),
    Object.freeze({
      lineNumber: 2,
      code: "  se inicio < fim então",
      indent: 1,
      section: "mergeSort",
      id: "IF_BASE_CASE",
    }),
    Object.freeze({
      lineNumber: 3,
      code: "    meio ← ⌊(inicio + fim) / 2⌋",
      indent: 2,
      section: "mergeSort",
      id: "CALC_MID",
    }),
    Object.freeze({
      lineNumber: 4,
      code: "    mergeSort(A, inicio, meio)",
      indent: 2,
      section: "mergeSort",
      id: "RECURSE_LEFT",
    }),
    Object.freeze({
      lineNumber: 5,
      code: "    mergeSort(A, meio + 1, fim)",
      indent: 2,
      section: "mergeSort",
      id: "RECURSE_RIGHT",
    }),
    Object.freeze({
      lineNumber: 6,
      code: "    intercalar(A, inicio, meio, fim)",
      indent: 2,
      section: "mergeSort",
      id: "CALL_INTERCALAR",
    }),
    Object.freeze({
      lineNumber: 7,
      code: "  fim se",
      indent: 1,
      section: "mergeSort",
      id: "END_IF_BASE",
    }),
    Object.freeze({
      lineNumber: 8,
      code: "fim procedimento",
      indent: 0,
      section: "mergeSort",
      id: "END_PROC_MERGE_SORT",
    }),
    Object.freeze({
      lineNumber: 9,
      code: "",
      indent: 0,
      section: "intercalar",
      id: "SEPARATOR",
    }),
    Object.freeze({
      lineNumber: 10,
      code: "procedimento intercalar(A, inicio, meio, fim)",
      indent: 0,
      section: "intercalar",
      id: "PROC_INTERCALAR",
    }),
    Object.freeze({
      lineNumber: 11,
      code: "  Buffer ← alocar buffer de tamanho (fim - inicio + 1)",
      indent: 1,
      section: "intercalar",
      id: "ALLOC_BUFFER",
    }),
    Object.freeze({
      lineNumber: 12,
      code: "  p1 ← inicio, p2 ← meio + 1, k ← 0",
      indent: 1,
      section: "intercalar",
      id: "INIT_POINTERS",
    }),
    Object.freeze({
      lineNumber: 13,
      code: "  enquanto p1 ≤ meio e p2 ≤ fim faça",
      indent: 1,
      section: "intercalar",
      id: "WHILE_BOTH_ACTIVE",
    }),
    Object.freeze({
      lineNumber: 14,
      code: "    se A[p1].value ≤ A[p2].value então",
      indent: 2,
      section: "intercalar",
      id: "COMPARE_VALUES",
    }),
    Object.freeze({
      lineNumber: 15,
      code: "      Buffer[k] ← A[p1]; p1 ← p1 + 1",
      indent: 3,
      section: "intercalar",
      id: "DISPATCH_LEFT",
    }),
    Object.freeze({
      lineNumber: 16,
      code: "    senão",
      indent: 2,
      section: "intercalar",
      id: "ELSE_BRANCH",
    }),
    Object.freeze({
      lineNumber: 17,
      code: "      Buffer[k] ← A[p2]; p2 ← p2 + 1",
      indent: 3,
      section: "intercalar",
      id: "DISPATCH_RIGHT",
    }),
    Object.freeze({
      lineNumber: 18,
      code: "    fim se",
      indent: 2,
      section: "intercalar",
      id: "END_IF_COMPARE",
    }),
    Object.freeze({
      lineNumber: 19,
      code: "    k ← k + 1",
      indent: 2,
      section: "intercalar",
      id: "ADVANCE_K",
    }),
    Object.freeze({
      lineNumber: 20,
      code: "  fim enquanto",
      indent: 1,
      section: "intercalar",
      id: "END_WHILE_BOTH",
    }),
    Object.freeze({
      lineNumber: 21,
      code: "  enquanto p1 ≤ meio faça",
      indent: 1,
      section: "intercalar",
      id: "WHILE_LEFT_DRAIN",
    }),
    Object.freeze({
      lineNumber: 22,
      code: "    Buffer[k] ← A[p1]; p1 ← p1 + 1; k ← k + 1",
      indent: 2,
      section: "intercalar",
      id: "DRAIN_LEFT",
    }),
    Object.freeze({
      lineNumber: 23,
      code: "  fim enquanto",
      indent: 1,
      section: "intercalar",
      id: "END_WHILE_LEFT",
    }),
    Object.freeze({
      lineNumber: 24,
      code: "  enquanto p2 ≤ fim faça",
      indent: 1,
      section: "intercalar",
      id: "WHILE_RIGHT_DRAIN",
    }),
    Object.freeze({
      lineNumber: 25,
      code: "    Buffer[k] ← A[p2]; p2 ← p2 + 1; k ← k + 1",
      indent: 2,
      section: "intercalar",
      id: "DRAIN_RIGHT",
    }),
    Object.freeze({
      lineNumber: 26,
      code: "  fim enquanto",
      indent: 1,
      section: "intercalar",
      id: "END_WHILE_RIGHT",
    }),
    Object.freeze({
      lineNumber: 27,
      code: "  para idx de 0 até (fim - inicio) faça",
      indent: 1,
      section: "intercalar",
      id: "FOR_COPY_BACK",
    }),
    Object.freeze({
      lineNumber: 28,
      code: "    A[inicio + idx] ← Buffer[idx]",
      indent: 2,
      section: "intercalar",
      id: "COPY_ELEMENT",
    }),
    Object.freeze({
      lineNumber: 29,
      code: "  fim para",
      indent: 1,
      section: "intercalar",
      id: "END_FOR_COPY_BACK",
    }),
    Object.freeze({
      lineNumber: 30,
      code: "fim procedimento",
      indent: 0,
      section: "intercalar",
      id: "END_PROC_INTERCALAR",
    }),
  ]);

export interface MergePseudocodeConcreteContext {
  readonly inicio: number | null;
  readonly meio: number | null;
  readonly fim: number | null;
  readonly p1: number | null;
  readonly p2: number | null;
  readonly k: number;
  readonly p1Value: number | null;
  readonly p2Value: number | null;
  readonly comparedP1?: number | null;
  readonly comparedP2?: number | null;
  readonly comparedP1Value?: number | null;
  readonly comparedP2Value?: number | null;
  readonly comparisonText: string;
  readonly actionTakenText: string;
}

export type MergeConditionEvaluation =
  | "LEFT_SMALLER_OR_EQUAL"
  | "RIGHT_SMALLER"
  | "DRAIN_LEFT"
  | "DRAIN_RIGHT"
  | null;

export interface MergePseudocodeHighlight {
  /** Linha com foco primário de execução no frame atual */
  readonly primaryLineNumber: number;
  /** Conjunto de linhas no escopo de execução ativo */
  readonly activeLineNumbers: readonly number[];
  /** Linha de condição associada, se houver */
  readonly conditionLineNumber: number | null;
  /** Resultado relacional da avaliação */
  readonly conditionResult: MergeConditionEvaluation;
  /** Contexto numérico factual e concreto deste instante */
  readonly concreteContext: MergePseudocodeConcreteContext;
}

/**
 * Deriva deterministicamente o destaque no pseudocódigo canônico de 30 linhas
 * e o contexto numérico concreto a partir do MergeReplayFrame.
 */
export function getMergePseudocodeHighlight(
  frame: MergeReplayFrame,
): MergePseudocodeHighlight {
  const interval = frame.activeInterval;
  const inicio = interval?.left ?? null;
  const meio = interval?.mid ?? null;
  const fim = interval?.right ?? null;

  const p1Value =
    frame.p1 !== null && frame.values[frame.p1] !== undefined
      ? frame.values[frame.p1].value
      : null;
  const p2Value =
    frame.p2 !== null && frame.values[frame.p2] !== undefined
      ? frame.values[frame.p2].value
      : null;

  if (frame.frameType === "INITIAL") {
    const concreteContext: MergePseudocodeConcreteContext = Object.freeze({
      inicio: 0,
      meio: null,
      fim: frame.values.length > 0 ? frame.values.length - 1 : 0,
      p1: null,
      p2: null,
      k: 0,
      p1Value: null,
      p2Value: null,
      comparisonText: "—",
      actionTakenText:
        "Início da rotina: lote recebido pela estação pronto para decomposição e ordenação recursiva.",
    });

    return Object.freeze({
      primaryLineNumber: 1,
      activeLineNumbers: Object.freeze([1, 2]),
      conditionLineNumber: null,
      conditionResult: null,
      concreteContext,
    });
  }

  if (frame.frameType === "DIVIDE") {
    const concreteContext: MergePseudocodeConcreteContext = Object.freeze({
      inicio,
      meio,
      fim,
      p1: frame.p1,
      p2: frame.p2,
      k: 0,
      p1Value,
      p2Value,
      comparisonText: `[${inicio}..${fim}] • meio = ⌊(${inicio}+${fim})/2⌋ = ${meio}`,
      actionTakenText: `Subdivisão recursiva do intervalo [${inicio}..${fim}] com ponto médio calculado em ${meio}.`,
    });

    return Object.freeze({
      primaryLineNumber: 3,
      activeLineNumbers: Object.freeze([2, 3, 4, 5, 6]),
      conditionLineNumber: 2,
      conditionResult: null,
      concreteContext,
    });
  }

  if (frame.frameType === "MERGE_INIT") {
    const bufferLen =
      inicio !== null && fim !== null ? fim - inicio + 1 : frame.buffer.length;
    const concreteContext: MergePseudocodeConcreteContext = Object.freeze({
      inicio,
      meio,
      fim,
      p1: frame.p1,
      p2: frame.p2,
      k: frame.k,
      p1Value,
      p2Value,
      comparisonText: `Buffer[${bufferLen}] alocado • p1=${frame.p1}, p2=${frame.p2}, k=0`,
      actionTakenText: `Inicialização da intercalação: buffer auxiliar alocado e sensores posicionados nas frentes dos ramais.`,
    });

    return Object.freeze({
      primaryLineNumber: 11,
      activeLineNumbers: Object.freeze([10, 11, 12, 13]),
      conditionLineNumber: null,
      conditionResult: null,
      concreteContext,
    });
  }

  if (frame.frameType === "DISPATCH") {
    const isLeft = frame.dispatchedSource === "LEFT";
    const primaryLineNumber = isLeft ? 15 : 17;
    const activeLineNumbers = isLeft
      ? Object.freeze([13, 14, 15, 19])
      : Object.freeze([13, 14, 16, 17, 19]);

    const compP1 =
      frame.comparedP1 !== undefined
        ? frame.comparedP1
        : isLeft
          ? (frame.p1 !== null ? frame.p1 - 1 : null)
          : frame.p1;
    const compP2 =
      frame.comparedP2 !== undefined
        ? frame.comparedP2
        : !isLeft
          ? (frame.p2 !== null ? frame.p2 - 1 : null)
          : frame.p2;

    const compP1Value =
      frame.comparedLeftElement !== undefined && frame.comparedLeftElement !== null
        ? frame.comparedLeftElement.value
        : compP1 !== null && frame.values[compP1] !== undefined
          ? frame.values[compP1].value
          : null;

    const compP2Value =
      frame.comparedRightElement !== undefined && frame.comparedRightElement !== null
        ? frame.comparedRightElement.value
        : compP2 !== null && frame.values[compP2] !== undefined
          ? frame.values[compP2].value
          : null;

    const compText = isLeft
      ? `A[p1=${compP1}] (${compP1Value}) ≤ A[p2=${compP2}] (${compP2Value}) → Despachado Ramal Esquerdo`
      : `A[p2=${compP2}] (${compP2Value}) < A[p1=${compP1}] (${compP1Value}) → Despachado Ramal Direito`;

    const concreteContext: MergePseudocodeConcreteContext = Object.freeze({
      inicio,
      meio,
      fim,
      p1: frame.p1,
      p2: frame.p2,
      k: frame.k,
      p1Value,
      p2Value,
      comparedP1: compP1,
      comparedP2: compP2,
      comparedP1Value: compP1Value,
      comparedP2Value: compP2Value,
      comparisonText: compText,
      actionTakenText: `Carga ${frame.dispatchedElement?.value} gravada em Buffer[${frame.k - 1}]. Ponteiro ${isLeft ? "p1" : "p2"} avançado.`,
    });

    return Object.freeze({
      primaryLineNumber,
      activeLineNumbers,
      conditionLineNumber: 14,
      conditionResult: isLeft ? "LEFT_SMALLER_OR_EQUAL" : "RIGHT_SMALLER",
      concreteContext,
    });
  }

  if (frame.frameType === "DRAIN") {
    const isLeft = frame.dispatchedSource === "LEFT";
    const primaryLineNumber = isLeft ? 22 : 25;
    const activeLineNumbers = isLeft
      ? Object.freeze([21, 22, 23])
      : Object.freeze([24, 25, 26]);

    const concreteContext: MergePseudocodeConcreteContext = Object.freeze({
      inicio,
      meio,
      fim,
      p1: frame.p1,
      p2: frame.p2,
      k: frame.k,
      p1Value,
      p2Value,
      comparisonText: isLeft
        ? "Ramal Direito esgotado • Drenagem contínua do Ramal Esquerdo"
        : "Ramal Esquerdo esgotado • Drenagem contínua do Ramal Direito",
      actionTakenText: `Drenagem em lote das cargas remanescentes do Ramal ${isLeft ? "Esquerdo" : "Direito"} para o buffer auxiliar.`,
    });

    return Object.freeze({
      primaryLineNumber,
      activeLineNumbers,
      conditionLineNumber: isLeft ? 21 : 24,
      conditionResult: isLeft ? "DRAIN_LEFT" : "DRAIN_RIGHT",
      concreteContext,
    });
  }

  // COPY_BACK
  const isRoot = frame.isRootMerge;
  const activeLineNumbers = isRoot
    ? Object.freeze([27, 28, 29, 30, 6, 7, 8])
    : Object.freeze([27, 28, 29, 30]);

  const concreteContext: MergePseudocodeConcreteContext = Object.freeze({
    inicio,
    meio,
    fim,
    p1: null,
    p2: null,
    k: 0,
    p1Value: null,
    p2Value: null,
    comparisonText: "Buffer consolidado → Cópia de retorno para esteira principal",
    actionTakenText: isRoot
      ? "Cópia de retorno da confluência raiz concluída. Todo o vetor de cargas está ordenado com estabilidade."
      : "Cópia de retorno do buffer auxiliar para o intervalo intercalado da esteira principal.",
  });

  return Object.freeze({
    primaryLineNumber: 28,
    activeLineNumbers,
    conditionLineNumber: 27,
    conditionResult: null,
    concreteContext,
  });
}
