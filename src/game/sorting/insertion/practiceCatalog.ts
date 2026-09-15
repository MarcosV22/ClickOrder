/**
 * Catálogo e definições data-driven das atividades práticas do Módulo Insertion Sort.
 *
 * Estruturado sob o paradigma da nova plataforma educacional:
 * Atividades orientadas a exercícios conceituais, sem fases ou campanhas legadas.
 * Os IDs antecipam conceitualmente a estrutura do Schema v4 sem persistência prematura.
 */

import {
  INSERTION_BASIC_CONSTRAINTS,
  INSERTION_INTERMEDIATE_CONSTRAINTS,
  INSERTION_ADVANCED_CONSTRAINTS,
  INSERTION_PRACTICE_LENGTHS,
  type InsertionPracticeLevel,
} from "./insertionConstraints";
import type { ArrayConstraintDefinition } from "../../generation";

export type { InsertionPracticeLevel };

export type InsertionPracticeId =
  | "insertion.practice.basic"
  | "insertion.practice.intermediate"
  | "insertion.practice.advanced";

export interface InsertionPracticeDefinition {
  readonly id: InsertionPracticeId;
  readonly level: InsertionPracticeLevel;
  readonly title: string;
  readonly shortTitle: string;
  readonly description: string;
  readonly size: number;
  readonly constraints: readonly ArrayConstraintDefinition[];
  readonly pedagogicalObjective: string;
}

/**
 * Catálogo canônico data-driven das 3 práticas do Insertion Sort:
 */
export const INSERTION_PRACTICE_CATALOG: readonly InsertionPracticeDefinition[] =
  Object.freeze([
    {
      id: "insertion.practice.basic",
      level: "basic",
      title: "PRÁTICA BÁSICA",
      shortTitle: "BÁSICA",
      description:
        "Lote introdutório com 4 cargas. Consolidação da mecânica de deslocamentos simples e inserção direta.",
      size: INSERTION_PRACTICE_LENGTHS.basic,
      constraints: INSERTION_BASIC_CONSTRAINTS,
      pedagogicalObjective:
        "Identificar a condição A[j] > chave, comandar o deslocamento unitário para a vaga e confirmar o encaixe com parada imediata.",
    },
    {
      id: "insertion.practice.intermediate",
      level: "intermediate",
      title: "PRÁTICA INTERMEDIÁRIA",
      shortTitle: "INTERMEDIÁRIA",
      description:
        "Lote com 5 cargas. Prática de deslocamentos sucessivos em cadeia na região ordenada.",
      size: INSERTION_PRACTICE_LENGTHS.intermediate,
      constraints: INSERTION_INTERMEDIATE_CONSTRAINTS,
      pedagogicalObjective:
        "Operar múltiplos deslocamentos consecutivos para a direita abrindo espaço na esteira para a chave suspensa.",
    },
    {
      id: "insertion.practice.advanced",
      level: "advanced",
      title: "PRÁTICA AVANÇADA",
      shortTitle: "AVANÇADA",
      description:
        "Lote completo com 6 cargas. Domínio de cenários complexos com alta densidade de inversões e chegadas à cabeceira.",
      size: INSERTION_PRACTICE_LENGTHS.advanced,
      constraints: INSERTION_ADVANCED_CONSTRAINTS,
      pedagogicalObjective:
        "Completar o ciclo completo do algoritmo com varreduras longas, paradas condicionais e chegadas à cabeceira da esteira.",
    },
  ]);

/**
 * Recupera a definição da prática a partir do nível de exercício.
 */
export function getInsertionPracticeDefinition(
  level: InsertionPracticeLevel,
): InsertionPracticeDefinition {
  const found = INSERTION_PRACTICE_CATALOG.find((p) => p.level === level);
  if (!found) {
    return INSERTION_PRACTICE_CATALOG[0];
  }
  return found;
}

/**
 * Retorna o próximo nível de prática curricular ou null quando o conjunto estiver concluído.
 */
export function getNextInsertionPracticeLevel(
  currentLevel: InsertionPracticeLevel,
): InsertionPracticeLevel | null {
  if (currentLevel === "basic") return "intermediate";
  if (currentLevel === "intermediate") return "advanced";
  return null;
}
