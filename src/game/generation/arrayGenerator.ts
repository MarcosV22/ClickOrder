/**
 * Motor central determinístico de geração procedural de vetores.
 * Módulo puramente funcional, sem efeitos colaterais e desacoplado de qualquer engine de ordenação.
 */

import {
  ArrayGenerationError,
  type ArrayConstraint,
  type ArrayGenerationConfig,
  type GeneratedArrayResult,
  type ResolvedGenerationConfig,
  type SeedInput,
} from "./types";
import {
  createMulberry32,
  generateRandomSeed,
  hashSeed,
  nextInt,
} from "./prng";
import {
  resolveConstraint,
  BUBBLE_CAMPAIGN_CONSTRAINTS,
} from "./constraints";

export const DEFAULT_MIN_VALUE = 1;
export const DEFAULT_MAX_VALUE = 99;
export const DEFAULT_ALLOW_DUPLICATES = false;
export const DEFAULT_MAX_ATTEMPTS = 50;

/** Tamanhos de vetores para as fases regulares da campanha Bubble Sort (F1: 4, F2: 5, F3: 6) */
export const BUBBLE_CAMPAIGN_PHASE_LENGTHS = Object.freeze([4, 5, 6] as const);

/**
 * Amostra um vetor de tamanho `length` respeitando o range e a política de duplicados.
 *
 * Para `allowDuplicates: false` com range <= 1000, utiliza Fisher-Yates parcial em pool
 * para garantir complexidade linear previsível, sem rejeições randômicas e terminação estrita.
 */
function sampleCandidateArray(
  prng: () => number,
  length: number,
  minValue: number,
  maxValue: number,
  allowDuplicates: boolean
): number[] {
  if (allowDuplicates) {
    const arr = new Array<number>(length);
    for (let i = 0; i < length; i++) {
      arr[i] = nextInt(prng, minValue, maxValue);
    }
    return arr;
  }

  const rangeSize = maxValue - minValue + 1;
  if (rangeSize <= 1000) {
    const pool = new Array<number>(rangeSize);
    for (let i = 0; i < rangeSize; i++) {
      pool[i] = minValue + i;
    }
    for (let i = 0; i < length; i++) {
      const j = nextInt(prng, i, rangeSize - 1);
      const temp = pool[i];
      pool[i] = pool[j];
      pool[j] = temp;
    }
    return pool.slice(0, length);
  }

  // Fallback seguro de amostragem para ranges gigantescos
  const chosen = new Set<number>();
  const result: number[] = [];
  while (result.length < length) {
    const val = nextInt(prng, minValue, maxValue);
    if (!chosen.has(val)) {
      chosen.add(val);
      result.push(val);
    }
  }
  return result;
}

/**
 * Valida o candidato contra uma lista normalizada de constraints.
 */
function validateCandidate(
  candidate: readonly number[],
  constraints: readonly { id: string; predicate: ArrayConstraint }[]
): { valid: boolean; failedIds: string[] } {
  const failedIds: string[] = [];
  for (const c of constraints) {
    if (!c.predicate(candidate)) {
      failedIds.push(c.id);
    }
  }
  return {
    valid: failedIds.length === 0,
    failedIds,
  };
}

/**
 * Estratégia de fallback genérico determinístico quando o loop de amostragem atinge maxAttempts.
 *
 * NÃO utiliza vetores históricos de Bubble Sort (como [5,2,4,1]).
 * Constrói permutações sistemáticas a partir de valores uniformemente distribuídos no range
 * e valida rigorosamente contra todas as constraints configuradas.
 */
export function attemptDeterministicFallback(
  length: number,
  minValue: number,
  maxValue: number,
  allowDuplicates: boolean,
  constraints: readonly { id: string; predicate: ArrayConstraint }[],
  prng: () => number
): { found: true; values: number[] } | { found: false; lastFailedIds: string[] } {
  const rangeSize = maxValue - minValue + 1;
  const step = Math.max(1, Math.floor(rangeSize / (length + 1)));
  const baseValues: number[] = [];
  for (let i = 0; i < length; i++) {
    baseValues.push(minValue + (i + 1) * step);
  }

  const patterns: number[][] = [];

  // Padrão 1: Alternado / Zig-zag ([v1, v0, v3, v2, ...])
  if (length >= 2) {
    const p1 = [...baseValues];
    for (let i = 0; i < length - 1; i += 2) {
      const tmp = p1[i];
      p1[i] = p1[i + 1];
      p1[i + 1] = tmp;
    }
    patterns.push(p1);
  }

  // Padrão 2: Rotacionado à esquerda ([v1, v2, ..., vn, v0])
  if (length >= 2) {
    patterns.push([...baseValues.slice(1), baseValues[0]]);
  }

  // Padrão 3: Rotacionado à direita ([vn-1, v0, v1, ...])
  if (length >= 2) {
    patterns.push([baseValues[length - 1], ...baseValues.slice(0, length - 1)]);
  }

  // Padrão 4: Inversão dos extremos ([vn-1, v1, v2, ..., v0])
  if (length >= 2) {
    const p4 = [...baseValues];
    const tmp = p4[0];
    p4[0] = p4[length - 1];
    p4[length - 1] = tmp;
    patterns.push(p4);
  }

  // Padrão 5: Troca no meio ([v0, ..., vm, vm-1, ...])
  if (length >= 4) {
    const p5 = [...baseValues];
    const mid = Math.floor(length / 2);
    const tmp = p5[mid - 1];
    p5[mid - 1] = p5[mid];
    p5[mid] = tmp;
    patterns.push(p5);
  }

  // Padrões com duplicatas determinísticas quando allowDuplicates for permitido
  if (allowDuplicates && length >= 3) {
    // Padrão Dup 1: Duplicata cruzada entre primeira e segunda metade
    // (garante desordem, repetição e confronto em divisões de subproblemas)
    const pDupCross = [...baseValues];
    const half = Math.floor(length / 2);
    pDupCross[half] = pDupCross[0];
    const tmp0 = pDupCross[0];
    pDupCross[0] = pDupCross[1];
    pDupCross[1] = tmp0;
    if (length >= 6) {
      const tmpLast = pDupCross[length - 1];
      pDupCross[length - 1] = pDupCross[length - 2];
      pDupCross[length - 2] = tmpLast;
    }
    patterns.push(pDupCross);

    // Padrão Dup 2: Duplicata no extremo e transposição interna
    const pDupEdge = [...baseValues];
    pDupEdge[pDupEdge.length - 1] = pDupEdge[0];
    const tmpEdge = pDupEdge[0];
    pDupEdge[0] = pDupEdge[1];
    pDupEdge[1] = tmpEdge;
    patterns.push(pDupEdge);
  }

  // Padrão 6 a 15: Amostras adicionais com novas derivações pseudoaleatórias controladas
  for (let attempt = 0; attempt < 10; attempt++) {
    patterns.push(sampleCandidateArray(prng, length, minValue, maxValue, allowDuplicates));
  }

  let lastFailedIds: string[] = [];
  for (const pat of patterns) {
    const check = validateCandidate(pat, constraints);
    if (check.valid) {
      return { found: true, values: pat };
    }
    lastFailedIds = check.failedIds;
  }

  return { found: false, lastFailedIds };
}

/**
 * Gera um vetor determinístico respeitando parâmetros de tamanho, intervalo, unicidade e constraints.
 *
 * Garantias:
 * - Mesma seed + mesma configuração => exatamente o mesmo vetor (100% determinístico);
 * - Retorna array imutável (Object.freeze);
 * - Se as restrições forem matematicamente impossíveis, falha de forma explícita com ArrayGenerationError;
 * - Nunca entra em loop infinito.
 */
export function generateSortingArray(
  config: ArrayGenerationConfig
): GeneratedArrayResult {
  const length = config.length;
  if (!Number.isInteger(length) || length < 1) {
    throw new ArrayGenerationError(
      "length deve ser um número inteiro maior ou igual a 1",
      { length }
    );
  }

  const minValue = config.minValue ?? DEFAULT_MIN_VALUE;
  const maxValue = config.maxValue ?? DEFAULT_MAX_VALUE;
  if (!Number.isInteger(minValue) || !Number.isInteger(maxValue)) {
    throw new ArrayGenerationError(
      "minValue e maxValue devem ser inteiros válidos",
      { minValue, maxValue }
    );
  }

  if (minValue > maxValue) {
    throw new ArrayGenerationError(
      `minValue (${minValue}) não pode ser maior que maxValue (${maxValue})`,
      { minValue, maxValue }
    );
  }

  const allowDuplicates = config.allowDuplicates ?? DEFAULT_ALLOW_DUPLICATES;
  const availableValues = maxValue - minValue + 1;
  if (!allowDuplicates && length > availableValues) {
    throw new ArrayGenerationError(
      `Não é possível gerar um vetor de tamanho ${length} com valores únicos no intervalo [${minValue}, ${maxValue}]. O intervalo contém apenas ${availableValues} valores possíveis.`,
      { length, minValue, maxValue, allowDuplicates }
    );
  }

  const maxAttempts = config.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
    throw new ArrayGenerationError(
      "maxAttempts deve ser um inteiro maior ou igual a 1",
      { attempts: maxAttempts }
    );
  }

  const rawSeed: SeedInput =
    config.seed !== undefined && config.seed !== null && config.seed !== ""
      ? config.seed
      : generateRandomSeed();

  const normalizedSeed = hashSeed(rawSeed);
  const prng = createMulberry32(normalizedSeed);

  const rawConstraints = config.constraints ?? [];
  const resolvedConstraints = rawConstraints.map(resolveConstraint);

  const resolvedConfig: ResolvedGenerationConfig = Object.freeze({
    length,
    minValue,
    maxValue,
    allowDuplicates,
    seed: rawSeed,
    normalizedSeed,
    maxAttempts,
    constraintsCount: resolvedConstraints.length,
  });

  let attempts = 0;
  let lastFailedConstraints: string[] = [];

  // Loop de amostragem por PRNG
  while (attempts < maxAttempts) {
    attempts++;
    const candidate = sampleCandidateArray(
      prng,
      length,
      minValue,
      maxValue,
      allowDuplicates
    );
    const check = validateCandidate(candidate, resolvedConstraints);
    if (check.valid) {
      return Object.freeze({
        values: Object.freeze(candidate),
        seed: rawSeed,
        normalizedSeed,
        attempts,
        isFallback: false,
        config: resolvedConfig,
      });
    }
    lastFailedConstraints = check.failedIds;
  }

  // Tentativa de fallback sistemático determinístico
  const fallbackResult = attemptDeterministicFallback(
    length,
    minValue,
    maxValue,
    allowDuplicates,
    resolvedConstraints,
    prng
  );

  if (fallbackResult.found) {
    return Object.freeze({
      values: Object.freeze(fallbackResult.values),
      seed: rawSeed,
      normalizedSeed,
      attempts: attempts + 1,
      isFallback: true,
      config: resolvedConfig,
    });
  }

  // Falha explícita se as restrições forem impossíveis ou contraditórias
  const uniqueViolations = Array.from(
    new Set([...lastFailedConstraints, ...fallbackResult.lastFailedIds])
  );
  throw new ArrayGenerationError(
    `Não foi possível gerar um vetor que satisfaça todas as constraints configuradas após ${maxAttempts} tentativas e estratégia de fallback. Restrições violadas: [${uniqueViolations.join(", ")}].`,
    {
      length,
      minValue,
      maxValue,
      allowDuplicates,
      attempts,
      violatedConstraints: uniqueViolations,
    }
  );
}

/**
 * Função utilitária pura para gerar vetores da campanha normal de Bubble Sort.
 * Fases 1, 2 e 3 geram vetores de tamanho 4, 5 e 6 respectivamente no range 1..99 sem duplicados,
 * garantindo satisfação das restrições BUBBLE_CAMPAIGN_CONSTRAINTS.
 */
export function generateBubblePhaseArray(
  phase: number,
  seed?: SeedInput
): GeneratedArrayResult {
  const index =
    Math.max(1, Math.min(phase, BUBBLE_CAMPAIGN_PHASE_LENGTHS.length)) - 1;
  const length = BUBBLE_CAMPAIGN_PHASE_LENGTHS[index];
  return generateSortingArray({
    length,
    minValue: DEFAULT_MIN_VALUE,
    maxValue: DEFAULT_MAX_VALUE,
    allowDuplicates: false,
    seed,
    constraints: BUBBLE_CAMPAIGN_CONSTRAINTS,
    maxAttempts: DEFAULT_MAX_ATTEMPTS,
  });
}
