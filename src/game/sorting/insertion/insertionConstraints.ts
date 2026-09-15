/**
 * Restrições procedurais e configurações de geração específicas do Insertion Sort.
 * Reutiliza integralmente a infraestrutura de src/game/generation/.
 * Não cria PRNG próprio nem importa a engine (predicados puros sobre o vetor).
 */

import {
  generateSortingArray,
  isNotSorted,
  isNotReverseSorted,
  DEFAULT_MIN_VALUE,
  DEFAULT_MAX_VALUE,
  DEFAULT_MAX_ATTEMPTS,
  type ArrayConstraint,
  type ArrayConstraintDefinition,
  type GeneratedArrayResult,
  type SeedInput,
} from "../../generation";

/**
 * Níveis curriculares de prática do Insertion Sort na plataforma educacional:
 * - "basic": Prática Básica (n = 4)
 * - "intermediate": Prática Intermediária (n = 5)
 * - "advanced": Prática Avançada (n = 6)
 */
export type InsertionPracticeLevel = "basic" | "intermediate" | "advanced";

/**
 * Mapeamento canônico dos tamanhos de lote por nível de prática:
 */
export const INSERTION_PRACTICE_LENGTHS: Readonly<Record<InsertionPracticeLevel, number>> =
  Object.freeze({
    basic: 4,
    intermediate: 5,
    advanced: 6,
  });

/**
 * Predicado matemático puro:
 * Valida se a execução do Insertion Sort sobre o vetor exigirá ao menos um deslocamento (shift).
 * Em um vetor, haverá pelo menos um shift se e somente se houver ao menos um par de inversão
 * onde um elemento anterior for maior que o posterior.
 */
export const hasAtLeastOneShift: ArrayConstraint = (arr) => {
  if (arr.length < 2) return false;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i - 1] > arr[i]) {
      return true;
    }
  }
  return false;
};

/**
 * Predicado matemático puro:
 * Valida se haverá ao menos uma passada externa i onde a chave é inserida diretamente
 * sem nenhum deslocamento (zero shifts), isto é, onde arr[i - 1] <= arr[i].
 */
export const hasAtLeastOneDirectInsert: ArrayConstraint = (arr) => {
  if (arr.length < 2) return false;
  const a = [...arr];
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    // Se a[j] <= key logo no início da passada, ocorre inserção direta com zero shifts
    if (j >= 0 && a[j] <= key) {
      return true;
    }
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = key;
  }
  return false;
};

/**
 * Predicado matemático puro:
 * Valida se em ao menos uma passada externa i a chave desencadeia múltiplos deslocamentos (2 ou mais shifts).
 */
export const hasInsertionWithMultipleShifts: ArrayConstraint = (arr) => {
  if (arr.length < 3) return false;
  const a = [...arr];
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    let shiftsInPass = 0;
    while (j >= 0 && a[j] > key) {
      shiftsInPass++;
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = key;
    if (shiftsInPass >= 2) {
      return true;
    }
  }
  return false;
};

/**
 * Restrições para Prática Básica (Fase 1, n = 4):
 * - Não previamente ordenado;
 * - Pelo menos um shift;
 * - Pelo menos uma inserção direta (zero shifts);
 * - Evitar vetor totalmente invertido no nível introdutório.
 */
export const INSERTION_BASIC_CONSTRAINTS: readonly ArrayConstraintDefinition[] =
  Object.freeze([
    {
      id: "insertion-not-sorted",
      description: "O lote não deve estar previamente ordenado",
      predicate: isNotSorted,
    },
    {
      id: "insertion-has-shift",
      description: "O lote deve exigir ao menos um deslocamento (shift)",
      predicate: hasAtLeastOneShift,
    },
    {
      id: "insertion-has-direct-insert",
      description:
        "O lote deve propiciar ao menos uma inserção direta sem deslocamentos",
      predicate: hasAtLeastOneDirectInsert,
    },
    {
      id: "insertion-not-reverse-sorted",
      description:
        "O lote não deve estar totalmente invertido no nível básico",
      predicate: isNotReverseSorted,
    },
  ]);

/**
 * Restrições para Prática Intermediária (Fase 2, n = 5):
 * - Não previamente ordenado;
 * - Pelo menos um shift;
 * - Pelo menos uma inserção direta;
 * - Pelo menos uma passada com múltiplos shifts.
 */
export const INSERTION_INTERMEDIATE_CONSTRAINTS: readonly ArrayConstraintDefinition[] =
  Object.freeze([
    {
      id: "insertion-not-sorted",
      description: "O lote não deve estar previamente ordenado",
      predicate: isNotSorted,
    },
    {
      id: "insertion-has-shift",
      description: "O lote deve exigir ao menos um deslocamento (shift)",
      predicate: hasAtLeastOneShift,
    },
    {
      id: "insertion-has-direct-insert",
      description:
        "O lote deve propiciar ao menos uma inserção direta sem deslocamentos",
      predicate: hasAtLeastOneDirectInsert,
    },
    {
      id: "insertion-multiple-shifts",
      description:
        "O lote deve exigir ao menos uma passada com múltiplos deslocamentos",
      predicate: hasInsertionWithMultipleShifts,
    },
  ]);

/**
 * Restrições para Prática Avançada (Fase 3, n = 6):
 * - Não previamente ordenado;
 * - Pelo menos um shift;
 * - Pelo menos uma passada com múltiplos shifts;
 * - Maior diversidade: não exclui vetor reverso apenas por dificuldade.
 */
export const INSERTION_ADVANCED_CONSTRAINTS: readonly ArrayConstraintDefinition[] =
  Object.freeze([
    {
      id: "insertion-not-sorted",
      description: "O lote não deve estar previamente ordenado",
      predicate: isNotSorted,
    },
    {
      id: "insertion-has-shift",
      description: "O lote deve exigir ao menos um deslocamento (shift)",
      predicate: hasAtLeastOneShift,
    },
    {
      id: "insertion-multiple-shifts",
      description:
        "O lote deve exigir ao menos uma passada com múltiplos deslocamentos",
      predicate: hasInsertionWithMultipleShifts,
    },
  ]);

/**
 * Retorna o conjunto de constraints apropriado para o nível de prática:
 * - "basic": Prática Básica (n = 4)
 * - "intermediate": Prática Intermediária (n = 5)
 * - "advanced": Prática Avançada (n = 6)
 */
export function getInsertionPracticeConstraints(
  level: InsertionPracticeLevel,
): readonly ArrayConstraintDefinition[] {
  if (level === "basic") {
    return INSERTION_BASIC_CONSTRAINTS;
  }
  if (level === "intermediate") {
    return INSERTION_INTERMEDIATE_CONSTRAINTS;
  }
  return INSERTION_ADVANCED_CONSTRAINTS;
}

/**
 * Gera deterministicamente um vetor procedural para as atividades práticas do Insertion Sort.
 * - basic: length = 4
 * - intermediate: length = 5
 * - advanced: length = 6
 * - range: 1..99
 * - allowDuplicates: false
 *
 * Utiliza o gerador universal generateSortingArray de src/game/generation/.
 */
export function generateInsertionPracticeArray(
  level: InsertionPracticeLevel,
  seed?: SeedInput,
): GeneratedArrayResult {
  const length = INSERTION_PRACTICE_LENGTHS[level] ?? 4;
  const constraints = getInsertionPracticeConstraints(level);

  return generateSortingArray({
    length,
    minValue: DEFAULT_MIN_VALUE,
    maxValue: DEFAULT_MAX_VALUE,
    allowDuplicates: false,
    seed,
    constraints,
    maxAttempts: DEFAULT_MAX_ATTEMPTS,
  });
}
