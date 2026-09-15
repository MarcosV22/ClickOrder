/**
 * Contratos de tipos para a Insertion Sort Engine do Sorting Station.
 *
 * Módulo puramente funcional, sem efeitos colaterais e sem dependências de React ou DOM.
 * Modela a FSM canônica do Insertion Sort por DESLOCAMENTOS com chave suspensa (trilho aéreo)
 * e vaga física aberta na esteira.
 */

/**
 * Decisões pedagógicas do operador na botoeira contextual:
 * - "SHIFT_RIGHT": desloca A[j] para a vaga à direita (A[j+1] <- A[j]) quando A[j] > chave;
 * - "INSERT_KEY": encaixa a chave suspensa na vaga atual quando A[j] <= chave ou cabeceira alcançada (j < 0).
 */
export type InsertionDecision = "SHIFT_RIGHT" | "INSERT_KEY";

/**
 * Fases da Máquina de Estados Finita (FSM) do Insertion Sort:
 * - "COMPARE_AND_SHIFT": o scanner avalia regressivamente A[j] > chave (j >= 0).
 *   Se verdadeiro, a ação correta é SHIFT_RIGHT. Se falso, a ação correta é INSERT_KEY.
 * - "INSERT_READY": a cabeceira da esteira foi alcançada (j < 0) e a vaga está no índice 0.
 *   A única ação válida é INSERT_KEY. Não há comparação de valores a registrar.
 * - "COMPLETED": todas as passadas externas foram finalizadas e o vetor está ordenado.
 */
export type InsertionPhase = "COMPARE_AND_SHIFT" | "INSERT_READY" | "COMPLETED";

/**
 * Status operacional da engine de Insertion Sort.
 */
export type InsertionStatus =
  | "IDLE"
  | "RUNNING"
  | "PASS_COMPLETED"
  | "COMPLETED";

/**
 * Registro factual imutável da elevação automática da chave (KEY_LIFT).
 * Ocorre automaticamente no início de cada passada externa i (1 .. n-1).
 */
export interface InsertionKeyLiftStepRecord {
  readonly type: "KEY_LIFT";
  readonly stepNumber: number;
  readonly i: number;
  readonly key: number;
  readonly keyOriginalIndex: number;
  readonly holeIndex: number;
  readonly orderedBoundary: number;
  readonly valuesSnapshot: readonly (number | null)[];
  readonly explanation: string;
}

/**
 * Registro factual imutável do deslocamento unitário de uma carga para a vaga (SHIFT).
 * Ocorre quando A[j] > key e o operador comanda SHIFT_RIGHT.
 */
export interface InsertionShiftStepRecord {
  readonly type: "SHIFT";
  readonly stepNumber: number;
  readonly i: number;
  readonly j: number;
  readonly comparedValue: number;
  readonly keyValue: number;
  readonly comparisonResult: true;
  readonly holeIndexBefore: number;
  readonly holeIndexAfter: number;
  readonly shiftedValue: number;
  readonly valuesSnapshot: readonly (number | null)[];
  readonly explanation: string;
}

/**
 * Registro factual imutável do encaixe da chave por condição do enquanto falsa (CONDITION_FALSE).
 * Ocorre quando j >= 0 e A[j] <= key, indicando que a chave encontrou sua posição ordenada.
 */
export interface InsertionInsertConditionFalseStepRecord {
  readonly type: "INSERT";
  readonly reason: "CONDITION_FALSE";
  readonly stepNumber: number;
  readonly i: number;
  readonly j: number;
  readonly comparedValue: number;
  readonly keyValue: number;
  readonly comparisonResult: false;
  readonly insertedIndex: number;
  readonly insertedValue: number;
  readonly valuesSnapshot: readonly (number | null)[];
  readonly orderedBoundary: number;
  readonly explanation: string;
}

/**
 * Registro factual imutável do encaixe da chave na cabeceira da esteira (HEAD_REACHED).
 * Ocorre quando j < 0 e a vaga está no índice 0. Não inventa comparação com A[-1].
 */
export interface InsertionInsertHeadReachedStepRecord {
  readonly type: "INSERT";
  readonly reason: "HEAD_REACHED";
  readonly stepNumber: number;
  readonly i: number;
  readonly j: -1;
  readonly comparedValue: null;
  readonly keyValue: number;
  readonly comparisonResult: null;
  readonly insertedIndex: number;
  readonly insertedValue: number;
  readonly valuesSnapshot: readonly (number | null)[];
  readonly orderedBoundary: number;
  readonly explanation: string;
}

/**
 * União discriminada dos registros de inserção da chave.
 */
export type InsertionInsertStepRecord =
  | InsertionInsertConditionFalseStepRecord
  | InsertionInsertHeadReachedStepRecord;

/**
 * União discriminada de todos os registros factuais de histórico do Insertion Sort.
 */
export type InsertionStepRecord =
  | InsertionKeyLiftStepRecord
  | InsertionShiftStepRecord
  | InsertionInsertStepRecord;

/**
 * Estado completo e imutável da Insertion Sort Engine.
 */
export interface InsertionSortState {
  readonly initialValues: readonly number[];
  readonly currentValues: readonly (number | null)[];
  readonly arrayLength: number;
  readonly i: number;                 // Passada externa atual (1 .. n-1)
  readonly j: number;                 // Posição de inspeção regressiva (i-1 .. -1)
  readonly key: number | null;        // Chave suspensa no trilho aéreo (null se não houver passada ativa)
  readonly holeIndex: number | null;  // Índice da vaga física na esteira (null se completed/não ativa)
  readonly phase: InsertionPhase;     // "COMPARE_AND_SHIFT" | "INSERT_READY" | "COMPLETED"
  readonly comparisons: number;       // Comparações relacionais reais entre A[j] e key
  readonly shifts: number;            // Movimentações de carga sobre a esteira (A[j+1] <- A[j])
  readonly insertions: number;        // Inserções da chave na vaga (n - 1 para n >= 2)
  readonly errors: number;            // Total de decisões incorretas do operador
  readonly orderedBoundary: number;   // Limite do subvetor ORD relativo A[0..orderedBoundary]
  readonly history: readonly InsertionStepRecord[];
  readonly completed: boolean;
  readonly status: InsertionStatus;
}

/**
 * Metadados da próxima ação esperada pelo algoritmo.
 */
export interface ExpectedInsertionStep {
  readonly phase: InsertionPhase;
  readonly i: number;
  readonly j: number;
  readonly key: number;
  readonly holeIndex: number;
  readonly expectedDecision: InsertionDecision;
  readonly comparedValue?: number;
  readonly comparisonResult?: boolean;
  readonly explanation: string;
}

/**
 * Tipificação do resultado da execução de um passo na engine:
 * - "SUCCESS": passo executado com sucesso e estado avançado;
 * - "PEDAGOGICAL_ERROR": o operador tomou uma decisão conceitual errada (errors incrementado, estado preservado);
 * - "INVALID_ACTION_FOR_PHASE": ação tecnicamente impossível para a fase (falha de integração/UI; errors NÃO incrementado).
 */
export type InsertionStepResultType =
  | "SUCCESS"
  | "PEDAGOGICAL_ERROR"
  | "INVALID_ACTION_FOR_PHASE";

/**
 * Resultado da execução de um passo pelo operador via executeInsertionStep.
 */
export interface InsertionStepResult {
  readonly state: InsertionSortState;
  readonly resultType: InsertionStepResultType;
  readonly valid: boolean;
  readonly isPedagogicalError: boolean;
  readonly expectedDecision?: InsertionDecision;
  readonly errorReason?: string;
}
