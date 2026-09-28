/**
 * Contratos de tipos para a Quick Sort Engine do Sorting Station.
 *
 * Módulo puramente funcional, sem efeitos colaterais e sem dependências de React ou DOM.
 * Implementa a variante canônica de Particionamento de Lomuto com pivô fixo no último
 * elemento do intervalo (A[high]), limites inclusivos, pilha explícita LIFO (left-first)
 * e suporte a Replay determinístico.
 */

/**
 * Representação de um elemento com identidade estável e persistente.
 * A comparação relacional avalia EXCLUSIVAMENTE o campo `value`.
 * A identidade (`id`, `originalIndex`, `label`) é preservada em todas as permutas.
 */
export interface QuickElement {
  readonly id: string;            // Identificador único persistente (ex.: "elem-0-v4a", "q0")
  readonly value: number;         // Valor numérico de ordenação (1..99)
  readonly originalIndex: number; // Índice inicial no vetor de entrada (0..n-1)
  readonly label?: string;        // Rótulo diegético visual (ex.: "4a", "4b")
  readonly labelSuffix?: string;  // Sufixo diegético de duplicata (ex.: "a", "b")
}

/**
 * Item de entrada flexível para inicialização do vetor na engine.
 */
export type QuickInputItem =
  | number
  | { readonly value: number; readonly label?: string; readonly id?: string; readonly originalIndex?: number }
  | QuickElement;

/**
 * Decisões pedagógicas interativas do operador:
 * - "LESS_OR_EQUAL": classifica o elemento atual A[j] como menor ou igual ao pivô (A[j].value <= P.value);
 * - "GREATER": classifica o elemento atual A[j] como estritamente maior que o pivô (A[j].value > P.value);
 * - "PLACE_PIVOT": confirmação pedagógica para posicionar o pivô na fronteira (i + 1).
 */
export type QuickDecision =
  | "LESS_OR_EQUAL"
  | "GREATER"
  | "PLACE_PIVOT";

/**
 * Fases da Máquina de Estados Finita (FSM) do Quick Sort:
 * - "IDLE": antes da ativação da primeira partição;
 * - "INSPECT_ELEMENT": cursor j no intervalo [low .. high-1], aguardando classificação do estudante contra o pivô A[high];
 * - "PARTITION_READY_FOR_PIVOT": cursor j alcançou high, aguardando confirmação pedagógica para posicionar o pivô;
 * - "COMPLETED": ordenação finalizada, pilha de intervalos vazia e todos os elementos consolidados com selo definitivo.
 */
export type QuickPhase =
  | "IDLE"
  | "INSPECT_ELEMENT"
  | "PARTITION_READY_FOR_PIVOT"
  | "COMPLETED";

/**
 * Intervalo de partição contíguo inclusivo [low, high].
 */
export interface QuickIntervalContext {
  readonly low: number;
  readonly high: number;
}

/**
 * Tipos de eventos registrados no history pós-evento:
 * - "PARTITION_START": inicialização de um novo intervalo de partição [low, high];
 * - "CLASSIFY_ELEMENT": classificação correta de A[j] contra o pivô (com eventual permuta se i != j);
 * - "PIVOT_POSITIONED": consolidação do pivô na posição final p = i + 1 com selo OK definitivo;
 * - "BASE_CASE_RESOLVED": elemento unitário (low == high) consolidado com selo OK automaticamente;
 * - "SORT_COMPLETE": ordenação totalmente concluída com sucesso.
 */
export type QuickEventType =
  | "PARTITION_START"
  | "CLASSIFY_ELEMENT"
  | "PIVOT_POSITIONED"
  | "BASE_CASE_RESOLVED"
  | "SORT_COMPLETE";

/**
 * Contexto da comparação prévia que gerou o evento, preservando dados imutáveis
 * do elemento inspecionado e do pivô no exato momento da decisão (sem depender de ponteiros pós-avanço).
 */
export interface QuickComparisonContext {
  readonly elementIndex: number;
  readonly elementValue: number;
  readonly elementLabel?: string;
  readonly elementId: string;
  readonly pivotIndex: number;
  readonly pivotValue: number;
  readonly pivotLabel?: string;
  readonly pivotId: string;
  readonly expectedDecision: "LESS_OR_EQUAL" | "GREATER";
}

/**
 * Detalhes da permuta física caso tenha ocorrido entre índices distintos (i != j).
 */
export interface QuickSwapContext {
  readonly fromIndex: number;
  readonly toIndex: number;
  readonly fromElement: QuickElement;
  readonly toElement: QuickElement;
}

/**
 * Registro factual imutável de histórico pós-evento.
 */
export interface QuickStepRecord {
  readonly stepIndex: number;
  readonly eventType: QuickEventType;
  readonly pseudocodeLine: number;
  readonly explanation: string;

  // Snapshot pós-evento:
  readonly valuesSnapshot: readonly QuickElement[];
  readonly sortedIndices: readonly number[];
  readonly activeInterval: QuickIntervalContext | null;
  readonly pendingIntervals: readonly QuickIntervalContext[];

  // Ponteiros no estado pós-evento:
  readonly i: number;
  readonly j: number;
  readonly pivotIndex: number | null;
  readonly pivotElement: QuickElement | null;

  // Contextos analíticos específicos do evento:
  readonly comparisonContext?: QuickComparisonContext;
  readonly swapContext?: QuickSwapContext;

  // Métricas acumuladas pós-evento:
  readonly comparisons: number;
  readonly swaps: number;
  readonly writesInArray: number;
  readonly errors: number;
}

/**
 * Estado completo da engine do Quick Sort.
 */
export interface QuickSortState {
  readonly initialValues: readonly QuickElement[];
  readonly values: readonly QuickElement[];
  readonly phase: QuickPhase;
  readonly activeInterval: QuickIntervalContext | null;
  readonly pendingIntervals: readonly QuickIntervalContext[];
  readonly i: number;
  readonly j: number;
  readonly pivotIndex: number | null;
  readonly pivotElement: QuickElement | null;
  readonly sortedIndices: readonly number[];

  // Métricas computacionais e pedagógicas:
  readonly comparisons: number;
  readonly swaps: number;
  readonly writesInArray: number;
  readonly errors: number;
  readonly hintsUsed: number;
  readonly completed: boolean;

  // Histórico de passos factuais:
  readonly history: readonly QuickStepRecord[];
}

/**
 * Resultado da aplicação de uma ação do estudante na engine.
 */
export interface QuickStepResult {
  readonly state: QuickSortState;
  readonly success: boolean;
  readonly isActionImpossible: boolean;
  readonly isError: boolean;
  readonly message?: string;
}

/**
 * Quadro visual reconstruído a partir do histórico sem reexecução algorítmica.
 */
export interface QuickVisualStepFrame {
  readonly stepIndex: number;
  readonly eventType: QuickEventType;
  readonly pseudocodeLine: number;
  readonly explanation: string;
  readonly values: readonly QuickElement[];
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
}
