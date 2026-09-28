/**
 * Vetores curados fixos para o Modo Demonstração Educacional.
 *
 * Princípio pedagógico:
 * Os vetores de demonstração são determinísticos e deliberadamente projetados
 * para expor o estudante aos conceitos essenciais do algoritmo antes da prática.
 */

/**
 * Vetor curado para a demonstração do Bubble Sort.
 *
 * Características pedagógicas obrigatórias:
 * - n = 4 elementos ([5, 2, 4, 1]);
 * - Múltiplas permutas (SWAP);
 * - Pelo menos uma manutenção deliberada de ordem relativa (KEEP) na passada 1 (2 <= 4);
 * - 3 passadas completas com consolidação progressiva dos maiores elementos à direita.
 */
export const CURATED_BUBBLE_DEMO_ARRAY: readonly number[] = Object.freeze([
  5, 2, 4, 1,
]);

/**
 * Vetor curado para a demonstração do Selection Sort.
 *
 * Características pedagógicas obrigatórias:
 * - n = 3 elementos ([4, 1, 3]);
 * - Candidato a mínimo inicial (A[0] = 4);
 * - Identificação e marcação de novo mínimo (A[1] = 1 < A[0] = 4 -> SELECT_NEW_MIN);
 * - Manutenção de candidato existente (A[2] = 3 >= A[1] = 1 -> KEEP_MIN);
 * - Transição explícita para fase COMMIT de fechamento da varredura;
 * - Transferência/permuta pontual para a posição definitiva com consolidação à esquerda.
 */
export const CURATED_SELECTION_DEMO_ARRAY: readonly number[] = Object.freeze([
  4, 1, 3,
]);

/**
 * Vetor curado para a demonstração canônica do Insertion Sort.
 *
 * Características pedagógicas obrigatórias (n = 5 elementos: [6, 3, 5, 2, 7]):
 * - Passada i=1 (chave 3): 6 > 3 -> shift simples -> HEAD_REACHED (j = -1);
 * - Passada i=2 (chave 5): 6 > 5 -> shift -> 3 <= 5 -> CONDITION_FALSE;
 * - Passada i=3 (chave 2): 6, 5, 3 > 2 -> múltiplos shifts sucessivos -> HEAD_REACHED;
 * - Passada i=4 (chave 7): 6 <= 7 -> parada imediata sem deslocamentos (zero shifts).
 *
 * Abrange: shift simples, parada por condição falsa, múltiplos shifts,
 * chegada à cabeceira da esteira e passada com inserção direta.
 */
export const CURATED_INSERTION_DEMO_ARRAY: readonly number[] = Object.freeze([
  6, 3, 5, 2, 7,
]);

/**
 * Vetor curado para a demonstração canônica do Merge Sort.
 *
 * Características pedagógicas obrigatórias (n = 4 elementos: [7, 2, 5, 3]):
 * - Decomposição binária estrita: [7, 2] e [5, 3];
 * - Primeira intercalação [0..1]: 7 vs 2 -> despacha 2, drena 7 -> consolidação ORD [2, 7];
 * - Segunda intercalação [2..3]: 5 vs 3 -> despacha 3, drena 5 -> consolidação ORD [3, 5];
 * - Intercalação raiz [0..3]: confluência entre [2, 7] e [3, 5]:
 *   1. 2 vs 3 -> despacha 2 (buffer[0]);
 *   2. 7 vs 3 -> despacha 3 (buffer[1]);
 *   3. 7 vs 5 -> despacha 5 (buffer[2]);
 *   4. esgotamento do ramal direito -> drena 7 (buffer[3]);
 *   5. cópia de retorno para a esteira principal -> [2, 3, 5, 7] com selo OK.
 * - Total de métricas: exatamente 5 comparações e 16 escritas (8 no buffer, 8 no vetor principal), 0 erros, 0 dicas.
 */
export const CURATED_MERGE_DEMO_ARRAY: readonly number[] = Object.freeze([
  7, 2, 5, 3,
]);

/**
 * Vetor curado para a demonstração canônica do Quick Sort.
 *
 * Características pedagógicas obrigatórias (n = 5 elementos: [5, 2, 4, 1, 3]):
 * - Partição raiz [0..4] (pivô = 3):
 *   1. 5 > 3 -> avanço sem troca;
 *   2. 2 <= 3 -> troca 5 com 2 -> [2, 5, 4, 1, 3];
 *   3. 4 > 3 -> avanço sem troca;
 *   4. 1 <= 3 -> troca 5 com 1 -> [2, 1, 4, 5, 3];
 *   5. fecha pivô 3 -> troca 4 com 3 -> [2, 1, 3, 5, 4]. Pivô 3 selado no índice 2 com OK DEFINITIVO.
 * - Subpartição esquerda [0..1] (pivô = 1):
 *   6. 2 > 1 -> avanço sem troca;
 *   7. fecha pivô 1 -> troca 2 com 1 -> [1, 2, 3, 5, 4]. Pivô 1 selado no índice 0; unitário 2 selado no índice 1.
 * - Subpartição direita [3..4] (pivô = 4):
 *   8. 5 > 4 -> avanço sem troca;
 *   9. fecha pivô 4 -> troca 5 com 4 -> [1, 2, 3, 4, 5]. Pivô 4 selado no índice 3; unitário 5 selado no índice 4.
 * - Resultado final: [1, 2, 3, 4, 5]
 * - Total de métricas: exatamente 6 comparações, 5 trocas físicas e 10 escritas no vetor.
 */
export const CURATED_QUICK_DEMO_ARRAY: readonly number[] = Object.freeze([
  5, 2, 4, 1, 3,
]);


