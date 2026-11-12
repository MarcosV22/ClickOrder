/**
 * Catálogo Canônico Transversal de Práticas dos Módulos Curriculares.
 *
 * Princípios de arquitetura:
 * 1. O catálogo curricular é agnóstico à engine de ordenação (zero imports de motor ou UI).
 * 2. Utiliza os IDs canônicos padronizados do Schema v4 (ADR 0021).
 * 3. Assegura simetria estrutural (Básica: n=4, Intermediária: n=5, Avançada: n=6).
 * 4. Derivação de estados de prática (DISPONÍVEL, BLOQUEADA, CONCLUÍDA) é uma função pura.
 */

import type { GameSaveSchema, ModuleId } from "../persistence/types";
import {
  BUBBLE_EXERCISE_SETS,
  SELECTION_EXERCISE_SETS,
  INSERTION_EXERCISE_SETS,
  MERGE_EXERCISE_SETS,
  QUICK_EXERCISE_SETS,
} from "../persistence/constants";
import type {
  PracticeDefinition,
  PracticeLevel,
  PracticeProgressState,
  PracticeStatus,
} from "./types";

export const BUBBLE_PRACTICE_CATALOG: readonly PracticeDefinition[] = Object.freeze([
  {
    id: BUBBLE_EXERCISE_SETS.BASIC,
    moduleId: "bubble",
    level: "basic",
    title: "PRÁTICA BÁSICA",
    shortTitle: "BÁSICA",
    description:
      "Fundamentação de comparações adjacentes sobre 4 cargas. Exercite pares contíguos e o deslocamento progressivo da maior carga.",
    size: 4,
    learningFocus: "Comparações locais e propagação da maior carga",
    generatorProfile: "foundation",
    supportProfile: "full",
    pedagogicalObjective:
      "Identificar a condição relacional A[j] > A[j+1], aplicar trocas físicas e manter pares já em ordem até a consolidação da primeira extremidade.",
  },
  {
    id: BUBBLE_EXERCISE_SETS.INTERMEDIATE,
    moduleId: "bubble",
    level: "intermediate",
    title: "PRÁTICA INTERMEDIÁRIA",
    shortTitle: "INTERMEDIÁRIA",
    description:
      "Propagação multissetorial sobre 5 cargas com trocas distribuídas em múltiplas passadas e redução do laço interno.",
    size: 5,
    learningFocus: "Propagação multissetorial e redução do laço interno",
    generatorProfile: "mixed-decisions",
    supportProfile: "reduced",
    pedagogicalObjective:
      "Compreender a redução contínua do número de comparações a cada passada conforme a partição ordenada se expande.",
  },
  {
    id: BUBBLE_EXERCISE_SETS.ADVANCED,
    moduleId: "bubble",
    level: "advanced",
    title: "PRÁTICA AVANÇADA",
    shortTitle: "AVANÇADA",
    description:
      "Densidade rica de trocas e consolidação de múltiplas passadas sobre 6 cargas com autonomia analítica e desvanecimento de suporte.",
    size: 6,
    learningFocus: "Densidade de trocas e estabilização de passadas múltiplas",
    generatorProfile: "autonomous-complex",
    supportProfile: "minimal",
    pedagogicalObjective:
      "Executar todas as passadas do algoritmo canônico garantindo estabilidade e verificação da invariante de ordenação.",
  },
]);

export const SELECTION_PRACTICE_CATALOG: readonly PracticeDefinition[] = Object.freeze([
  {
    id: SELECTION_EXERCISE_SETS.BASIC,
    moduleId: "selection",
    level: "basic",
    title: "PRÁTICA BÁSICA",
    shortTitle: "BÁSICA",
    description:
      "Varredura seletiva sobre 4 cargas. Localize o menor item global fora da primeira posição e execute a transferência para a posição alvo.",
    size: 4,
    learningFocus: "Busca do mínimo global e desacoplamento varredura/commit",
    generatorProfile: "foundation",
    supportProfile: "full",
    pedagogicalObjective:
      "Operar a busca do mínimo na partição não ordenada e efetuar no máximo uma transferência pontual ao final da varredura.",
  },
  {
    id: SELECTION_EXERCISE_SETS.INTERMEDIATE,
    moduleId: "selection",
    level: "intermediate",
    title: "PRÁTICA INTERMEDIÁRIA",
    shortTitle: "INTERMEDIÁRIA",
    description:
      "Acompanhamento contínuo de mínimo fluido sobre 5 cargas com múltiplas atualizações dinâmicas de minIndex e consolidação progressiva.",
    size: 5,
    learningFocus: "Candidato a mínimo dinâmico e consolidação progressiva",
    generatorProfile: "mixed-decisions",
    supportProfile: "reduced",
    pedagogicalObjective:
      "Acompanhar as mudanças do ponteiro minIndex e consolidar elementos de forma ordenada da esquerda para a direita.",
  },
  {
    id: SELECTION_EXERCISE_SETS.ADVANCED,
    moduleId: "selection",
    level: "advanced",
    title: "PRÁTICA AVANÇADA",
    shortTitle: "AVANÇADA",
    description:
      "Varredura longa sobre 6 cargas com discriminação fina entre candidatos locais, transferências não-adjacentes e número mínimo de trocas físicas.",
    size: 6,
    learningFocus: "Varredura longa, discriminação fina e transferências variadas",
    generatorProfile: "autonomous-complex",
    supportProfile: "minimal",
    pedagogicalObjective:
      "Consolidar a invariante do Selection Sort: partição ordenada crescente à esquerda com exatamente n-1 transferências no máximo.",
  },
]);

export const INSERTION_PRACTICE_CATALOG: readonly PracticeDefinition[] = Object.freeze([
  {
    id: INSERTION_EXERCISE_SETS.BASIC,
    moduleId: "insertion",
    level: "basic",
    title: "PRÁTICA BÁSICA",
    shortTitle: "BÁSICA",
    description:
      "Mecânica da chave suspensa sobre 4 cargas. Elevação ao trilho, deslocamentos unitários controlados e inserção direta na vaga.",
    size: 4,
    learningFocus: "Elevação da chave, deslocamentos unitários e inserção direta",
    generatorProfile: "foundation",
    supportProfile: "full",
    pedagogicalObjective:
      "Identificar a condição A[j] > chave, comandar o deslocamento unitário para a vaga e confirmar o encaixe com parada imediata.",
  },
  {
    id: INSERTION_EXERCISE_SETS.INTERMEDIATE,
    moduleId: "insertion",
    level: "intermediate",
    title: "PRÁTICA INTERMEDIÁRIA",
    shortTitle: "INTERMEDIÁRIA",
    description:
      "Cadeia de deslocamentos sucessivos sobre 5 cargas com custos de passadas heterogêneos e parada por condição relacional.",
    size: 5,
    learningFocus: "Deslocamentos em cadeia e inserção condicional",
    generatorProfile: "mixed-decisions",
    supportProfile: "reduced",
    pedagogicalObjective:
      "Operar múltiplos deslocamentos consecutivos para a direita abrindo espaço na esteira para a chave suspensa.",
  },
  {
    id: INSERTION_EXERCISE_SETS.ADVANCED,
    moduleId: "insertion",
    level: "advanced",
    title: "PRÁTICA AVANÇADA",
    shortTitle: "AVANÇADA",
    description:
      "Trajetórias heterogêneas completas sobre 6 cargas com inserções diretas, múltiplos deslocamentos e chegada à cabeceira da esteira.",
    size: 6,
    learningFocus: "Trajetórias heterogêneas e parada por limite de esteira",
    generatorProfile: "autonomous-complex",
    supportProfile: "minimal",
    pedagogicalObjective:
      "Completar o ciclo completo do algoritmo com varreduras longas, paradas condicionais e chegadas à cabeceira da esteira.",
  },
]);

export const MERGE_PRACTICE_CATALOG: readonly PracticeDefinition[] = Object.freeze([
  {
    id: MERGE_EXERCISE_SETS.BASIC,
    moduleId: "merge",
    level: "basic",
    title: "PRÁTICA BÁSICA",
    shortTitle: "BÁSICA",
    description:
      "Lote introdutório com 4 cargas. Consolidação da mecânica de dois ponteiros, intercalação e drenagem de ramal.",
    size: 4,
    learningFocus: "Mecânica de dois ponteiros e intercalação de frentes",
    generatorProfile: "foundation",
    supportProfile: "full",
    pedagogicalObjective:
      "Comparar frentes de ramais, colher o menor elemento para o buffer auxiliar e drenar a cauda restante quando um ramal esgotar.",
  },
  {
    id: MERGE_EXERCISE_SETS.INTERMEDIATE,
    moduleId: "merge",
    level: "intermediate",
    title: "PRÁTICA INTERMEDIÁRIA",
    shortTitle: "INTERMEDIÁRIA",
    description:
      "Lote com 5 cargas. Compreensão da divisão assimétrica em subproblemas de 3 e 2 elementos.",
    size: 5,
    learningFocus: "Divisão assimétrica de subproblemas e intercalação recursiva",
    generatorProfile: "mixed-decisions",
    supportProfile: "reduced",
    pedagogicalObjective:
      "Acompanhar a divisão estrutural de tamanho ímpar (3 à esquerda e 2 à direita) e coordenar as intercalações locais e raiz.",
  },
  {
    id: MERGE_EXERCISE_SETS.ADVANCED,
    moduleId: "merge",
    level: "advanced",
    title: "PRÁTICA AVANÇADA",
    shortTitle: "AVANÇADA",
    description:
      "Lote completo com 6 cargas. Domínio de confluências com chaves duplicadas e desempate estável obrigatório na esquerda.",
    size: 6,
    learningFocus: "Desempate estável obrigatório sob chaves idênticas",
    generatorProfile: "autonomous-complex",
    supportProfile: "minimal",
    pedagogicalObjective:
      "Aplicar com rigor a regra de estabilidade canônica (<=): sob valores iguais na frente dos dois ramais, despachar invariavelmente a esquerda.",
  },
]);

export const QUICK_PRACTICE_CATALOG: readonly PracticeDefinition[] = Object.freeze([
  {
    id: QUICK_EXERCISE_SETS.BASIC,
    moduleId: "quick",
    level: "basic",
    title: "PRÁTICA BÁSICA",
    shortTitle: "BÁSICA",
    description:
      "Lote introdutório com 4 elementos sem duplicatas. Identifique o pivô e separe números menores/iguais e maiores.",
    size: 4,
    learningFocus: "Particionamento em torno do pivô e selamento definitivo",
    generatorProfile: "foundation",
    supportProfile: "full",
    pedagogicalObjective:
      "Compreender o papel do pivô, comparar cada número pela regra <=, observar trocas quando necessário e fixar o pivô na posição definitiva com selo OK.",
  },
  {
    id: QUICK_EXERCISE_SETS.INTERMEDIATE,
    moduleId: "quick",
    level: "intermediate",
    title: "PRÁTICA INTERMEDIÁRIA",
    shortTitle: "INTERMEDIÁRIA",
    description:
      "Lote com 5 elementos sem duplicatas. Exercite a continuidade da ordenação nos subintervalos restantes.",
    size: 5,
    learningFocus: "Recursão nos subintervalos e continuidade da partição",
    generatorProfile: "mixed-decisions",
    supportProfile: "reduced",
    pedagogicalObjective:
      "Manter o fluxo de particionamento após a partição inicial, aplicando o algoritmo aos trechos restantes até que todos os números recebam o selo OK definitivo.",
  },
  {
    id: QUICK_EXERCISE_SETS.ADVANCED,
    moduleId: "quick",
    level: "advanced",
    title: "PRÁTICA AVANÇADA",
    shortTitle: "AVANÇADA",
    description:
      "Lote completo com 6 elementos contendo exatamente um par de chaves idênticas. Confronto obrigatório de igualdade contra o pivô.",
    size: 6,
    learningFocus: "Confronto de duplicatas e constatação de instabilidade",
    generatorProfile: "autonomous-complex",
    supportProfile: "minimal",
    pedagogicalObjective:
      "Confrontar elementos com valor idêntico ao pivô pela regra <= e acompanhar se a ordem relativa das duplicatas se mantém ou se inverte, constatando que o Quick Sort não garante estabilidade.",
  },
]);

export const MODULE_PRACTICE_CATALOG: Partial<Record<ModuleId, readonly PracticeDefinition[]>> = Object.freeze({
  bubble: BUBBLE_PRACTICE_CATALOG,
  selection: SELECTION_PRACTICE_CATALOG,
  insertion: INSERTION_PRACTICE_CATALOG,
  merge: MERGE_PRACTICE_CATALOG,
  quick: QUICK_PRACTICE_CATALOG,
});

/**
 * Retorna as 3 definições de práticas de um módulo curricular.
 */
export function getModulePractices(moduleId: ModuleId): readonly PracticeDefinition[] {
  return MODULE_PRACTICE_CATALOG[moduleId] ?? BUBBLE_PRACTICE_CATALOG;
}

/**
 * Retorna a definição de uma prática por módulo e nível.
 */
export function getPracticeDefinition(
  moduleId: ModuleId,
  level: PracticeLevel
): PracticeDefinition {
  const practices = getModulePractices(moduleId);
  const found = practices.find((p) => p.level === level);
  return found ?? practices[0];
}

/**
 * Retorna o próximo nível curricular na sequência: basic -> intermediate -> advanced -> null.
 */
export function getNextPracticeLevel(level: PracticeLevel): PracticeLevel | null {
  switch (level) {
    case "basic":
      return "intermediate";
    case "intermediate":
      return "advanced";
    case "advanced":
      return null;
  }
}

/**
 * Deriva os estados factuais das práticas de um módulo para o usuário (DISPONÍVEL, BLOQUEADA, CONCLUÍDA),
 * incluindo telemetria de melhor recorde a partir do Schema v4 de persistência.
 *
 * Regras canônicas:
 * - Básica: sempre desbloqueada (DISPONÍVEL ou CONCLUÍDA se já finalizada);
 * - Intermediária: desbloqueada após Básica concluída;
 * - Avançada: desbloqueada após Intermediária concluída.
 */
export function getModulePracticeStates(
  saveData: GameSaveSchema | undefined,
  moduleId: ModuleId
): readonly PracticeProgressState[] {
  const practices = getModulePractices(moduleId);
  const moduleProgress = saveData?.modules?.[moduleId];
  const exerciseSets = moduleProgress?.exerciseSets ?? {};

  let previousCompleted = true; // Básica sempre tem pré-requisito satisfeito

  return practices.map((practice) => {
    const setProgress = exerciseSets[practice.id];
    const completed = Boolean(setProgress?.completed);

    let status: PracticeStatus;
    if (completed) {
      status = "completed";
    } else if (previousCompleted) {
      status = "available";
    } else {
      status = "locked";
    }

    // Para a próxima prática da sequência, atualizamos o requisito
    previousCompleted = completed;

    const bestRecord = setProgress?.bestRecord;

    return Object.freeze({
      definition: practice,
      status,
      completed,
      bestScore: bestRecord?.bestScore,
      bestErrors: bestRecord?.bestScoreErrors,
      bestHints: bestRecord?.bestScoreHintsUsed,
      bestTimeMs: bestRecord?.bestScoreElapsedTimeMs,
    });
  });
}

/**
 * Valida se todas as 3 práticas regulares do módulo estão concluídas.
 */
export function isModuleAllPracticesCompleted(
  saveData: GameSaveSchema | undefined,
  moduleId: ModuleId
): boolean {
  const states = getModulePracticeStates(saveData, moduleId);
  return states.every((s) => s.completed);
}
