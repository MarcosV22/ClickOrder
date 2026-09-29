/**
 * Restrições procedurais e configurações de geração específicas do Quick Sort.
 * Reutiliza integralmente o gerador determinístico compartilhado de src/game/generation/.
 * Não cria PRNG próprio nem instância de seed global específica.
 */

import {
  generateSortingArray,
  ArrayGenerationError,
  isNotSorted,
  isNotReverseSorted,
  hasNoDuplicates,
  DEFAULT_MIN_VALUE,
  DEFAULT_MAX_VALUE,
  DEFAULT_MAX_ATTEMPTS,
  type ArrayConstraint,
  type ArrayConstraintDefinition,
  type GeneratedArrayResult,
  type SeedInput,
} from "../../generation";
import { initQuickSortState, stepQuickSort } from "./quickSortEngine";
import type { QuickDecision, QuickElement } from "./types";

/**
 * Níveis curriculares de prática do Quick Sort na plataforma educacional:
 * - "basic": Prática Básica (n = 4, sem duplicatas, execução completa curta)
 * - "intermediate": Prática Intermediária (n = 5, sem duplicatas, continuidade entre partições)
 * - "advanced": Prática Avançada (n = 6, exatamente um par duplicado com identidades distintas)
 */
export type QuickPracticeLevel = "basic" | "intermediate" | "advanced";

/**
 * Mapeamento canônico dos tamanhos de lote por nível de prática:
 */
export const QUICK_PRACTICE_LENGTHS: Readonly<Record<QuickPracticeLevel, number>> =
  Object.freeze({
    basic: 4,
    intermediate: 5,
    advanced: 6,
  });

/**
 * Predicado matemático puro:
 * Valida se a partição raiz possui partição balanceada mínima no nível básico
 * (ao menos um elemento menor ou igual ao pivô e ao menos um maior que o pivô).
 */
export const hasQuickBalancedRootPartition: ArrayConstraint = (arr) => {
  if (arr.length < 3) return false;
  const pivot = arr[arr.length - 1];
  let lessOrEqualCount = 0;
  let greaterCount = 0;
  for (let idx = 0; idx < arr.length - 1; idx++) {
    if (arr[idx] <= pivot) {
      lessOrEqualCount++;
    } else {
      greaterCount++;
    }
  }
  return lessOrEqualCount >= 1 && greaterCount >= 1;
};

/**
 * Predicado matemático puro:
 * Valida se após a partição raiz há continuidade entre partições,
 * isto é, ao menos um dos subproblemas gerados tem tamanho >= 2.
 */
export const hasQuickPartitionContinuity: ArrayConstraint = (arr) => {
  if (arr.length < 4) return false;
  const pivot = arr[arr.length - 1];
  let lessOrEqualCount = 0;
  for (let idx = 0; idx < arr.length - 1; idx++) {
    if (arr[idx] <= pivot) {
      lessOrEqualCount++;
    }
  }
  const leftSize = lessOrEqualCount;
  const rightSize = arr.length - 1 - lessOrEqualCount;
  return leftSize >= 2 || rightSize >= 2;
};

/**
 * Predicado de duplicatas estritas para o nível avançado:
 * Exige exatamente um par duplicado com chaves idênticas (dois elementos com o mesmo valor)
 * e todos os demais elementos estritamente únicos.
 */
export const hasExactlyOneDuplicatePair: ArrayConstraint = (arr) => {
  const counts = new Map<number, number>();
  for (const v of arr) {
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  let pairCount = 0;
  for (const count of counts.values()) {
    if (count === 2) {
      pairCount++;
    } else if (count > 2) {
      return false;
    }
  }
  return pairCount === 1;
};

/**
 * Predicado avaliado através da engine real de Quick Sort:
 * Simula a ordenação do vetor pela API pública e valida se ocorre ao menos uma
 * comparação efetiva de igualdade contra o pivô (current.value === pivot.value).
 * Reutiliza a engine canônica, evitando duplicação de regras.
 */
export const hasQuickPivotEqualityComparison: ArrayConstraint = (arr) => {
  if (arr.length < 2) return false;
  let state = initQuickSortState([...arr]);
  let hasEquality = false;
  const maxSafetySteps = 150;
  let steps = 0;

  while (!state.completed && steps++ < maxSafetySteps) {
    if (state.phase === "INSPECT_ELEMENT") {
      const current = state.values[state.j];
      const pivot = state.values[state.activeInterval!.high];
      if (current.value === pivot.value) {
        hasEquality = true;
      }
      const decision: QuickDecision =
        current.value <= pivot.value ? "LESS_OR_EQUAL" : "GREATER";
      const result = stepQuickSort(state, decision);
      state = result.state;
    } else if (state.phase === "PARTITION_READY_FOR_PIVOT") {
      const result = stepQuickSort(state, "PLACE_PIVOT");
      state = result.state;
    } else {
      break;
    }
  }

  return hasEquality;
};

/**
 * Predicado complementar avaliado via engine real:
 * Verifica se o par duplicado (rotulado como 'a' e 'b') inverteu sua ordem relativa
 * ao término da execução sob a variante Lomuto.
 */
export const hasQuickDuplicatesInversion: ArrayConstraint = (arr) => {
  if (arr.length < 2) return false;
  const elements = assignQuickIdentities(arr);
  let state = initQuickSortState(elements);
  const maxSafetySteps = 150;
  let steps = 0;

  while (!state.completed && steps++ < maxSafetySteps) {
    if (state.phase === "INSPECT_ELEMENT") {
      const current = state.values[state.j];
      const pivot = state.values[state.activeInterval!.high];
      const decision: QuickDecision =
        current.value <= pivot.value ? "LESS_OR_EQUAL" : "GREATER";
      const result = stepQuickSort(state, decision);
      state = result.state;
    } else if (state.phase === "PARTITION_READY_FOR_PIVOT") {
      const result = stepQuickSort(state, "PLACE_PIVOT");
      state = result.state;
    } else {
      break;
    }
  }

  const dupes = state.values.filter(
    (elem) => elem.label === "a" || elem.label === "b",
  );
  if (dupes.length === 2) {
    return dupes[0].label === "b" && dupes[1].label === "a";
  }
  return false;
};

/**
 * Restrições canônicas para a Prática Básica (n = 4):
 * - Não previamente ordenado;
 * - Não totalmente invertido;
 * - Sem elementos duplicados;
 * - Partição raiz balanceada (ao menos 1 elemento de cada lado).
 */
export const QUICK_BASIC_CONSTRAINTS: readonly ArrayConstraintDefinition[] =
  Object.freeze([
    {
      id: "quick-not-sorted",
      description: "O lote não deve estar previamente ordenado",
      predicate: isNotSorted,
    },
    {
      id: "quick-not-reverse-sorted",
      description: "O lote não deve estar totalmente invertido no nível básico",
      predicate: isNotReverseSorted,
    },
    {
      id: "quick-no-duplicates",
      description: "O lote introdutório não deve conter elementos duplicados",
      predicate: hasNoDuplicates,
    },
    {
      id: "quick-balanced-root",
      description:
        "A partição raiz deve conter ao menos um elemento <= pivô e um > pivô",
      predicate: hasQuickBalancedRootPartition,
    },
  ]);

/**
 * Restrições canônicas para a Prática Intermediária (n = 5):
 * - n = 5;
 * - Não previamente ordenado;
 * - Sem elementos duplicados;
 * - Continuidade entre partições (ao menos um subproblema com tamanho >= 2).
 */
export const QUICK_INTERMEDIATE_CONSTRAINTS: readonly ArrayConstraintDefinition[] =
  Object.freeze([
    {
      id: "quick-not-sorted",
      description: "O lote não deve estar previamente ordenado",
      predicate: isNotSorted,
    },
    {
      id: "quick-no-duplicates",
      description: "O lote intermediário não deve conter elementos duplicados",
      predicate: hasNoDuplicates,
    },
    {
      id: "quick-partition-continuity",
      description:
        "A partição raiz deve produzir continuidade com ao menos um subproblema >= 2",
      predicate: hasQuickPartitionContinuity,
    },
  ]);

/**
 * Restrições canônicas para a Prática Avançada (n = 6):
 * - n = 6;
 * - Não previamente ordenado;
 * - Exatamente um par com valores iguais (identidades distintas 'a' e 'b');
 * - Confronto real mandatório de igualdade contra o pivô (current.value === pivot.value).
 */
export const QUICK_ADVANCED_CONSTRAINTS: readonly ArrayConstraintDefinition[] =
  Object.freeze([
    {
      id: "quick-not-sorted",
      description: "O lote não deve estar previamente ordenado",
      predicate: isNotSorted,
    },
    {
      id: "quick-one-duplicate-pair",
      description: "O lote avançado deve conter exatamente um par de chaves idênticas",
      predicate: hasExactlyOneDuplicatePair,
    },
    {
      id: "quick-pivot-equality-comparison",
      description:
        "A execução deve conter ao menos uma comparação efetiva de valor idêntico contra o pivô",
      predicate: hasQuickPivotEqualityComparison,
    },
  ]);

/**
 * Retorna as restrições canônicas configuradas para o nível de prática de Quick Sort.
 */
export function getQuickPracticeConstraints(
  level: QuickPracticeLevel,
): readonly ArrayConstraintDefinition[] {
  if (level === "basic") {
    return QUICK_BASIC_CONSTRAINTS;
  }
  if (level === "intermediate") {
    return QUICK_INTERMEDIATE_CONSTRAINTS;
  }
  return QUICK_ADVANCED_CONSTRAINTS;
}

/**
 * Vetores determinísticos canônicos de fallback caso o laço de amostragem
 * atinja o limite máximo de tentativas.
 * Todos os fallbacks foram verificados formalmente contra todas as restrições de cada nível.
 */
export const QUICK_FALLBACK_ARRAYS: Readonly<
  Record<QuickPracticeLevel, readonly number[]>
> = Object.freeze({
  basic: Object.freeze([42, 18, 77, 35]),
  intermediate: Object.freeze([50, 20, 80, 10, 40]),
  advanced: Object.freeze([24, 12, 50, 12, 38, 30]),
});

/**
 * Converte um vetor numérico em QuickElement[] com identidades estáveis e rótulos didáticos.
 * Caso haja valores duplicados, atribui sufixos alfabéticos estáveis ("a", "b", "c")
 * com base na ordem de aparição original para facilitar a inspeção da instabilidade pelo aluno.
 */
export function assignQuickIdentities(
  values: readonly number[],
  idPrefix = "elem",
): readonly QuickElement[] {
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
        label = String.fromCharCode(97 + order); // 'a', 'b', 'c', ...
      }

      return Object.freeze({
        id: `${idPrefix}-${originalIndex}-v${value}${label ? `-${label}` : ""}`,
        value,
        originalIndex,
        label,
        labelSuffix: label,
      });
    }),
  );
}

/**
 * Resultado completo da geração procedural de uma prática de Quick Sort.
 */
export interface GeneratedQuickPracticeResult {
  readonly result: GeneratedArrayResult;
  readonly elements: readonly QuickElement[];
}

/**
 * Gera deterministicamente um lote procedural para o Quick Sort via gerador universal.
 *
 * Configurações pedagógicas:
 * - basic: length = 4, range 1..99, sem duplicatas, partição balanceada;
 * - intermediate: length = 5, range 1..99, sem duplicatas, continuidade de partição;
 * - advanced: length = 6, range 10..40, allowDuplicates: true,
 *   exige exatamente um par duplicado e confronto efetivo de igualdade contra o pivô.
 */
export function generateQuickPracticeArray(
  level: QuickPracticeLevel,
  seed?: SeedInput,
): GeneratedQuickPracticeResult {
  const length = QUICK_PRACTICE_LENGTHS[level] ?? 4;
  const constraints = getQuickPracticeConstraints(level);

  const isAdvanced = level === "advanced";
  const minValue = isAdvanced ? 10 : DEFAULT_MIN_VALUE;
  const maxValue = isAdvanced ? 40 : DEFAULT_MAX_VALUE;
  const allowDuplicates = isAdvanced;
  const maxAttempts = isAdvanced ? 120 : DEFAULT_MAX_ATTEMPTS;

  let result: GeneratedArrayResult;
  try {
    result = generateSortingArray({
      length,
      minValue,
      maxValue,
      allowDuplicates,
      seed,
      constraints,
      maxAttempts,
    });
  } catch (err) {
    if (err instanceof ArrayGenerationError) {
      const fallbackValues = QUICK_FALLBACK_ARRAYS[level];
      const normSeed = typeof seed === "number" ? seed : 0;
      result = {
        values: [...fallbackValues],
        seed: seed ?? 0,
        normalizedSeed: normSeed,
        attempts: maxAttempts,
        isFallback: true,
        config: {
          length,
          minValue,
          maxValue,
          allowDuplicates,
          seed: seed ?? 0,
          normalizedSeed: normSeed,
          maxAttempts,
          constraintsCount: constraints.length,
        },
      };
    } else {
      throw err;
    }
  }

  // Se a geração por amostragem recorrer a fallback que não satisfaça rigorosamente
  // as constraints específicas do Quick Sort, aplica o fallback curado e auditado do nível.
  if (result.isFallback) {
    let allValid = true;
    for (const c of constraints) {
      if (!c.predicate(result.values)) {
        allValid = false;
        break;
      }
    }
    if (!allValid) {
      const fallbackValues = QUICK_FALLBACK_ARRAYS[level];
      result = {
        ...result,
        values: [...fallbackValues],
        isFallback: true,
      };
    }
  }

  const elements = assignQuickIdentities(result.values);

  return Object.freeze({
    result,
    elements,
  });
}
