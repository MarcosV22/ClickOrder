/**
 * Contratos de tipos para a Merge Sort Engine do Sorting Station.
 *
 * Módulo puramente funcional, sem efeitos colaterais e sem dependências de React ou DOM.
 * Implementa a variante canônica Merge Sort Top-Down com limites inclusivos,
 * travessia pós-ordem à esquerda, pilha explícita de tarefas e buffer auxiliar visível.
 */

/**
 * Representação de uma carga com identidade estável e persistente.
 * A comparação algorítmica avalia EXCLUSIVAMENTE `value`.
 * A identidade (`id`, `originalIndex`, `label`) é preservada em todas as transferências.
 */
export interface MergeElement {
  readonly id: string;            // Identificador único persistente (ex.: "elem-0-v3", "e0")
  readonly value: number;         // Valor numérico de ordenação (1..99)
  readonly originalIndex: number; // Índice inicial no vetor de entrada (0..n-1)
  readonly label?: string;        // Rótulo diegético visual (ex.: "3a", "3b")
}

/**
 * Item de entrada flexível para inicialização do vetor na engine.
 */
export type MergeInputItem =
  | number
  | { readonly value: number; readonly label?: string; readonly id?: string }
  | MergeElement;

/**
 * Decisões pedagógicas interativas do operador:
 * - "DISPATCH_LEFT": despacha E[p1] para o buffer auxiliar;
 * - "DISPATCH_RIGHT": despacha D[p2] para o buffer auxiliar;
 * - "DRAIN_REMAINDER": despacha em lote os elementos restantes do ramal ativo quando o outro esgotou.
 */
export type MergeDecision =
  | "DISPATCH_LEFT"
  | "DISPATCH_RIGHT"
  | "DRAIN_REMAINDER";

/**
 * Fases da Máquina de Estados Finita (FSM) do Merge Sort:
 * - "DIVIDE_AUTOMATIC": nó da árvore em decomposição estrutural;
 * - "COMPARE_HEADS": ambas as frentes possuem cargas sob os sensores (ação interativa requerida);
 * - "DRAIN_READY": um dos ramais esgotou-se e o outro possui cauda remanescente (ação interativa requerida);
 * - "COPY_BACK_AUTOMATIC": buffer cheio, consolidação de volta para A[left..right];
 * - "COMPLETED": ordenação finalizada com sucesso (vetor 100% OK).
 */
export type MergePhase =
  | "DIVIDE_AUTOMATIC"
  | "COMPARE_HEADS"
  | "DRAIN_READY"
  | "COPY_BACK_AUTOMATIC"
  | "COMPLETED";

/**
 * Tarefas pendentes na pilha de recursão explícita (LIFO).
 */
export type MergeTask =
  | { readonly type: "DIVIDE"; readonly left: number; readonly right: number; readonly depth: number }
  | { readonly type: "MERGE_INIT"; readonly left: number; readonly mid: number; readonly right: number; readonly depth: number };

/**
 * Contexto da intercalação ativa corrente.
 */
export interface MergeIntervalContext {
  readonly left: number;
  readonly mid: number;
  readonly right: number;
  readonly depth: number;
  readonly isRootMerge: boolean;
}

/**
 * Registro de histórico: decomposição estrutural de um intervalo (DIVIDE).
 */
export interface MergeDivideStepRecord {
  readonly type: "DIVIDE";
  readonly stepNumber: number;
  readonly left: number;
  readonly mid: number;
  readonly right: number;
  readonly depth: number;
  readonly valuesSnapshot: readonly MergeElement[];
  readonly explanation: string;
}

/**
 * Registro de histórico: inicialização explícita de uma intercalação (MERGE_INIT).
 * Registra o intervalo, ponteiros iniciais e buffer vazio alocado.
 */
export interface MergeInitStepRecord {
  readonly type: "MERGE_INIT";
  readonly stepNumber: number;
  readonly left: number;
  readonly mid: number;
  readonly right: number;
  readonly depth: number;
  readonly isRootMerge: boolean;
  readonly p1: number;
  readonly p2: number;
  readonly k: 0;
  readonly bufferSnapshot: readonly (MergeElement | null)[];
  readonly valuesSnapshot: readonly MergeElement[];
  readonly explanation: string;
}

/**
 * Registro de histórico: despacho ordenado de uma frente para o buffer (DISPATCH).
 */
export interface MergeDispatchStepRecord {
  readonly type: "DISPATCH";
  readonly stepNumber: number;
  readonly source: "LEFT" | "RIGHT";
  readonly element: MergeElement;
  readonly targetBufferIndex: number;
  readonly p1: number;
  readonly p2: number;
  readonly k: number;
  readonly comparisonCounted: boolean;
  readonly bufferSnapshot: readonly (MergeElement | null)[];
  readonly valuesSnapshot: readonly MergeElement[];
  readonly explanation: string;
}

/**
 * Registro de histórico: transferência em lote da cauda remanescente (DRAIN).
 */
export interface MergeDrainStepRecord {
  readonly type: "DRAIN";
  readonly stepNumber: number;
  readonly remainingSource: "LEFT" | "RIGHT";
  readonly drainedElements: readonly {
    readonly element: MergeElement;
    readonly targetBufferIndex: number;
  }[];
  readonly p1: number;
  readonly p2: number;
  readonly k: number;
  readonly bufferSnapshot: readonly (MergeElement | null)[];
  readonly valuesSnapshot: readonly MergeElement[];
  readonly explanation: string;
}

/**
 * Registro de histórico: consolidação do buffer para o vetor principal (COPY_BACK).
 */
export interface MergeCopyBackStepRecord {
  readonly type: "COPY_BACK";
  readonly stepNumber: number;
  readonly left: number;
  readonly right: number;
  readonly copiedElements: readonly {
    readonly element: MergeElement;
    readonly targetIndex: number;
  }[];
  readonly isRootMerge: boolean;
  readonly valuesSnapshot: readonly MergeElement[];
  readonly bufferSnapshot: readonly (MergeElement | null)[];
  readonly explanation: string;
}

/**
 * União discriminada de todos os registros factuais de histórico do Merge Sort.
 */
export type MergeStepRecord =
  | MergeDivideStepRecord
  | MergeInitStepRecord
  | MergeDispatchStepRecord
  | MergeDrainStepRecord
  | MergeCopyBackStepRecord;

/**
 * Estado completo, puro e imutável da Merge Sort Engine.
 */
export interface MergeSortState {
  readonly initialValues: readonly MergeElement[];
  readonly values: readonly MergeElement[];
  readonly buffer: readonly (MergeElement | null)[];
  readonly activeInterval: MergeIntervalContext | null;
  readonly p1: number;
  readonly p2: number;
  readonly k: number;
  readonly phase: MergePhase;
  readonly tasks: readonly MergeTask[];
  readonly comparisons: number;
  readonly writesInBuffer: number;
  readonly writesInMain: number;
  readonly totalWrites: number;
  readonly errors: number;
  readonly hintsUsed: number;
  readonly history: readonly MergeStepRecord[];
  readonly completed: boolean;
}

/**
 * Metadados da próxima ação esperada pelo algoritmo.
 */
export interface ExpectedMergeStep {
  readonly phase: MergePhase;
  readonly expectedDecision: MergeDecision;
  readonly p1?: number;
  readonly p2?: number;
  readonly leftElement?: MergeElement;
  readonly rightElement?: MergeElement;
  readonly explanation: string;
}

/**
 * Tipificação do resultado da execução de um passo na engine:
 * - "SUCCESS": passo executado com sucesso e estado avançado;
 * - "PEDAGOGICAL_ERROR": operador cometeu erro conceitual (errors incrementado, estado preservado);
 * - "INVALID_ACTION_FOR_PHASE": ação tecnicamente impossível para a fase (errors NÃO incrementado).
 */
export type MergeStepResultType =
  | "SUCCESS"
  | "PEDAGOGICAL_ERROR"
  | "INVALID_ACTION_FOR_PHASE";

/**
 * Resultado da execução de um passo pelo operador via executeMergeStep.
 */
export interface MergeStepResult {
  readonly state: MergeSortState;
  readonly resultType: MergeStepResultType;
  readonly valid: boolean;
  readonly isPedagogicalError: boolean;
  readonly expectedDecision?: MergeDecision;
  readonly errorReason?: string;
}

/**
 * Quadro visual derivado de um passo de histórico para inspeção, replay e animação.
 * Reúne valores do vetor, buffer, intervalo ativo, fase, ponteiros e contadores cumulativos.
 */
export interface MergeVisualStepFrame {
  readonly stepIndex: number;
  readonly stepNumber: number;
  readonly type: MergeStepRecord["type"];
  readonly phase: MergePhase;
  readonly activeInterval: MergeIntervalContext | null;
  readonly p1: number;
  readonly p2: number;
  readonly k: number;
  readonly values: readonly MergeElement[];
  readonly buffer: readonly (MergeElement | null)[];
  readonly explanation: string;
  readonly cumulativeComparisons: number;
  readonly cumulativeWritesInBuffer: number;
  readonly cumulativeWritesInMain: number;
  readonly cumulativeTotalWrites: number;
  readonly isRootMerge: boolean;
}

/**
 * Resultado completo da reconstrução factual de histórico do Merge Sort.
 */
export interface ReconstructMergeStateResult {
  readonly finalValues: readonly MergeElement[];
  readonly totalComparisons: number;
  readonly totalBufferWrites: number;
  readonly totalMainWrites: number;
  readonly totalWrites: number;
  readonly mergeInitCount: number;
  readonly divideCount: number;
  readonly copyBackCount: number;
  readonly frames: readonly MergeVisualStepFrame[];
}

