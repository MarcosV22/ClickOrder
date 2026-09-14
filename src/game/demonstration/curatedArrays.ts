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
