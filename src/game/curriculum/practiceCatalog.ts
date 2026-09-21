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
      "Lote introdutório com 4 cargas. Exercite comparações entre pares contíguos e o deslocamento progressivo da maior carga.",
    size: 4,
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
      "Lote com 5 cargas. Observe a retração do laço interno à medida que as maiores cargas se estabilizam à direita.",
    size: 5,
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
      "Lote completo com 6 cargas. Domine o ciclo total de ordenação por comparações adjacentes e consolidação final.",
    size: 6,
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
      "Lote introdutório com 4 cargas. Execute a varredura seletiva para localizar o menor item e transferi-lo para a posição alvo.",
    size: 4,
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
      "Lote com 5 cargas. Pratique o acompanhamento contínuo e a atualização dinâmica do candidato mínimo ao longo da esteira.",
    size: 5,
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
      "Lote completo com 6 cargas. Domine a varredura longa com garantia do número mínimo de trocas físicas.",
    size: 6,
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
      "Lote introdutório com 4 cargas. Elevação da chave ao trilho aéreo, comparações regressivas e inserção direta na vaga.",
    size: 4,
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
      "Lote com 5 cargas. Prática de deslocamentos sucessivos em cadeia na região ordenada da esteira.",
    size: 5,
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
      "Lote completo com 6 cargas. Domínio de cenários complexos com alta densidade de inversões e chegadas à cabeceira.",
    size: 6,
    pedagogicalObjective:
      "Completar o ciclo completo do algoritmo com varreduras longas, paradas condicionais e chegadas à cabeceira da esteira.",
  },
]);

export const MODULE_PRACTICE_CATALOG: Partial<Record<ModuleId, readonly PracticeDefinition[]>> = Object.freeze({
  bubble: BUBBLE_PRACTICE_CATALOG,
  selection: SELECTION_PRACTICE_CATALOG,
  insertion: INSERTION_PRACTICE_CATALOG,
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
