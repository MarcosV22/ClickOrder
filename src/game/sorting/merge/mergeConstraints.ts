/**
 * Restrições procedurais e configurações de geração específicas do Merge Sort.
 * Reutiliza integralmente o gerador determinístico compartilhado de src/game/generation/.
 * Não cria PRNG próprio nem instância de seed global específica.
 */

import {
  generateSortingArray,
  isNotSorted,
  isNotReverseSorted,
  hasNoDuplicates,
  hasDuplicates,
  DEFAULT_MIN_VALUE,
  DEFAULT_MAX_VALUE,
  DEFAULT_MAX_ATTEMPTS,
  type ArrayConstraint,
  type ArrayConstraintDefinition,
  type GeneratedArrayResult,
  type SeedInput,
} from "../../generation";
import type { MergeElement } from "./types";

/**
 * Níveis curriculares de prática do Merge Sort na plataforma educacional:
 * - "basic": Prática Básica (n = 4)
 * - "intermediate": Prática Intermediária (n = 5, divisão assimétrica 3 + 2)
 * - "advanced": Prática Avançada (n = 6, com duplicatas e confronto real de empate)
 */
export type MergePracticeLevel = "basic" | "intermediate" | "advanced";

/**
 * Mapeamento canônico dos tamanhos de lote por nível de prática:
 */
export const MERGE_PRACTICE_LENGTHS: Readonly<Record<MergePracticeLevel, number>> =
  Object.freeze({
    basic: 4,
    intermediate: 5,
    advanced: 6,
  });

/**
 * Predicado matemático puro:
 * Simula as comparações do Merge Sort Top-Down sobre o vetor e valida se
 * haverá ao menos um confronto real entre elementos com valores iguais (empate)
 * na confluência de dois subvetores ordenados.
 */
export const hasMergeConfrontationOfEqualValues: ArrayConstraint = (arr) => {
  if (arr.length < 2) return false;
  let hasTie = false;

  function mergeSim(sub: number[]): number[] {
    if (sub.length <= 1) return sub;
    // Divisão inclusiva mid = left + floor((right - left)/2), correspondendo a ceil(sub.length / 2)
    const mid = Math.ceil(sub.length / 2);
    const left = mergeSim(sub.slice(0, mid));
    const right = mergeSim(sub.slice(mid));

    const result: number[] = [];
    let i = 0;
    let j = 0;

    while (i < left.length && j < right.length) {
      if (left[i] === right[j]) {
        hasTie = true;
      }
      if (left[i] <= right[j]) {
        result.push(left[i++]);
      } else {
        result.push(right[j++]);
      }
    }
    while (i < left.length) result.push(left[i++]);
    while (j < right.length) result.push(right[j++]);
    return result;
  }

  mergeSim([...arr]);
  return hasTie;
};

/**
 * Restrições para Prática Básica (n = 4):
 * - Não previamente ordenado;
 * - Não totalmente invertido (evita pior caso no nível introdutório);
 * - Sem elementos duplicados (foco inicial na mecânica de divisão e dois ponteiros).
 */
export const MERGE_BASIC_CONSTRAINTS: readonly ArrayConstraintDefinition[] =
  Object.freeze([
    {
      id: "merge-not-sorted",
      description: "O lote não deve estar previamente ordenado",
      predicate: isNotSorted,
    },
    {
      id: "merge-not-reverse-sorted",
      description: "O lote não deve estar totalmente invertido no nível básico",
      predicate: isNotReverseSorted,
    },
    {
      id: "merge-no-duplicates",
      description: "O lote introdutório não deve conter elementos duplicados",
      predicate: hasNoDuplicates,
    },
  ]);

/**
 * Restrições para Prática Intermediária (n = 5):
 * - n = 5 (divisão estrutural em 3 elementos à esquerda e 2 à direita);
 * - Não previamente ordenado;
 * - Sem elementos duplicados (consolidação da divisão ímpar assimétrica).
 */
export const MERGE_INTERMEDIATE_CONSTRAINTS: readonly ArrayConstraintDefinition[] =
  Object.freeze([
    {
      id: "merge-not-sorted",
      description: "O lote não deve estar previamente ordenado",
      predicate: isNotSorted,
    },
    {
      id: "merge-no-duplicates",
      description: "O lote intermediário não deve conter elementos duplicados",
      predicate: hasNoDuplicates,
    },
  ]);

/**
 * Restrições para Prática Avançada (n = 6):
 * - n = 6;
 * - Não previamente ordenado;
 * - Presença obrigatória de elementos com valores iguais (hasDuplicates);
 * - Confronto real mandatório entre elementos iguais durante uma intercalação (hasMergeConfrontationOfEqualValues).
 */
export const MERGE_ADVANCED_CONSTRAINTS: readonly ArrayConstraintDefinition[] =
  Object.freeze([
    {
      id: "merge-not-sorted",
      description: "O lote não deve estar previamente ordenado",
      predicate: isNotSorted,
    },
    {
      id: "merge-has-duplicates",
      description: "O lote avançado deve conter elementos duplicados",
      predicate: hasDuplicates,
    },
    {
      id: "merge-has-equal-confrontation",
      description:
        "O lote avançado deve exigir ao menos um desempate estável com valores iguais na confluência",
      predicate: hasMergeConfrontationOfEqualValues,
    },
  ]);

/**
 * Retorna as restrições canônicas configuradas para o nível de prática de Merge Sort.
 */
export function getMergePracticeConstraints(
  level: MergePracticeLevel,
): readonly ArrayConstraintDefinition[] {
  if (level === "basic") {
    return MERGE_BASIC_CONSTRAINTS;
  }
  if (level === "intermediate") {
    return MERGE_INTERMEDIATE_CONSTRAINTS;
  }
  return MERGE_ADVANCED_CONSTRAINTS;
}

/**
 * Converte um vetor numérico em MergeElements com identidades estáveis e rótulos didáticos.
 * Caso haja valores duplicados, atribui sufixos alfabéticos estáveis ("a", "b", "c")
 * com base na ordem de aparição original para facilitar a inspeção da estabilidade pelo aluno.
 */
export function assignMergeIdentities(
  values: readonly number[],
  idPrefix = "elem",
): readonly MergeElement[] {
  const counts = new Map<number, number>();
  for (const v of values) {
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }

  const seen = new Map<number, number>();

  return Object.freeze(
    values.map((value, originalIndex) => {
      const total = counts.get(value) ?? 1;
      let label: string | undefined = undefined;

      if (total > 1) {
        const order = seen.get(value) ?? 0;
        seen.set(value, order + 1);
        const letter = String.fromCharCode(97 + order); // 'a', 'b', 'c', ...
        label = letter;
      }

      return Object.freeze({
        id: `${idPrefix}-${originalIndex}-v${value}`,
        value,
        originalIndex,
        label,
      });
    }),
  );
}

/**
 * Resultado completo da geração procedural de uma prática de Merge Sort.
 */
export interface GeneratedMergePracticeResult {
  readonly result: GeneratedArrayResult;
  readonly elements: readonly MergeElement[];
}

/**
 * Gera deterministicamente um lote procedural para o Merge Sort via gerador universal.
 *
 * Configurações pedagógicas:
 * - basic: length = 4, range 1..99, sem duplicatas;
 * - intermediate: length = 5, range 1..99, divisão 3+2, sem duplicatas;
 * - advanced: length = 6, range 10..30 (favorece colisões ricas), allowDuplicates: true,
 *   garante ao menos um confronto real de valores iguais durante a confluência.
 */
export function generateMergePracticeArray(
  level: MergePracticeLevel,
  seed?: SeedInput,
): GeneratedMergePracticeResult {
  const length = MERGE_PRACTICE_LENGTHS[level] ?? 4;
  const constraints = getMergePracticeConstraints(level);

  // Na prática avançada, utiliza range controlado (10..30) com allowDuplicates para garantir
  // alta probabilidade de colisão e desempate em tempo linear sem falhas de amostragem.
  const isAdvanced = level === "advanced";
  const minValue = isAdvanced ? 10 : DEFAULT_MIN_VALUE;
  const maxValue = isAdvanced ? 30 : DEFAULT_MAX_VALUE;
  const allowDuplicates = isAdvanced;
  const maxAttempts = isAdvanced ? 100 : DEFAULT_MAX_ATTEMPTS;

  const result = generateSortingArray({
    length,
    minValue,
    maxValue,
    allowDuplicates,
    seed,
    constraints,
    maxAttempts,
  });

  const elements = assignMergeIdentities(result.values);

  return Object.freeze({
    result,
    elements,
  });
}
