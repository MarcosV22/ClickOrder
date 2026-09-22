/**
 * Catálogo e definições data-driven das atividades práticas do Módulo Merge Sort.
 *
 * Estruturado sob o paradigma da nova plataforma educacional:
 * Atividades orientadas a exercícios conceituais, sem fases ou campanhas legadas.
 * Os IDs antecipam conceitualmente a estrutura do Schema v4 ("merge.practice.*").
 */

import {
  MERGE_BASIC_CONSTRAINTS,
  MERGE_INTERMEDIATE_CONSTRAINTS,
  MERGE_ADVANCED_CONSTRAINTS,
  MERGE_PRACTICE_LENGTHS,
  type MergePracticeLevel,
} from "./mergeConstraints";
import type { ArrayConstraintDefinition } from "../../generation";

export type { MergePracticeLevel };

export type MergePracticeId =
  | "merge.practice.basic"
  | "merge.practice.intermediate"
  | "merge.practice.advanced";

export interface MergePracticeDefinition {
  readonly id: MergePracticeId;
  readonly level: MergePracticeLevel;
  readonly title: string;
  readonly shortTitle: string;
  readonly description: string;
  readonly size: number;
  readonly constraints: readonly ArrayConstraintDefinition[];
  readonly pedagogicalObjective: string;
}

/**
 * Catálogo canônico data-driven das 3 práticas do Merge Sort:
 */
export const MERGE_PRACTICE_CATALOG: readonly MergePracticeDefinition[] =
  Object.freeze([
    {
      id: "merge.practice.basic",
      level: "basic",
      title: "PRÁTICA BÁSICA",
      shortTitle: "BÁSICA",
      description:
        "Lote introdutório com 4 cargas. Consolidação da mecânica de dois ponteiros, intercalação e drenagem de ramal.",
      size: MERGE_PRACTICE_LENGTHS.basic,
      constraints: MERGE_BASIC_CONSTRAINTS,
      pedagogicalObjective:
        "Comparar frentes de ramais, colher o menor elemento para o buffer auxiliar e drenar a cauda restante quando um ramal esgotar.",
    },
    {
      id: "merge.practice.intermediate",
      level: "intermediate",
      title: "PRÁTICA INTERMEDIÁRIA",
      shortTitle: "INTERMEDIÁRIA",
      description:
        "Lote com 5 cargas. Compreensão da divisão assimétrica em subproblemas de 3 e 2 elementos.",
      size: MERGE_PRACTICE_LENGTHS.intermediate,
      constraints: MERGE_INTERMEDIATE_CONSTRAINTS,
      pedagogicalObjective:
        "Acompanhar a divisão estrutural de tamanho ímpar (3 à esquerda e 2 à direita) e coordenar as intercalações locais e raiz.",
    },
    {
      id: "merge.practice.advanced",
      level: "advanced",
      title: "PRÁTICA AVANÇADA",
      shortTitle: "AVANÇADA",
      description:
        "Lote completo com 6 cargas contendo elementos duplicados. Fixação obrigatória da regra de estabilidade sob empates.",
      size: MERGE_PRACTICE_LENGTHS.advanced,
      constraints: MERGE_ADVANCED_CONSTRAINTS,
      pedagogicalObjective:
        "Identificar confrontos com valores iguais na confluência e aplicar a regra de desempate no Ramal Esquerdo para preservar a estabilidade original.",
    },
  ]);

/**
 * Recupera a definição da prática a partir do nível de exercício.
 */
export function getMergePracticeDefinition(
  level: MergePracticeLevel,
): MergePracticeDefinition {
  const found = MERGE_PRACTICE_CATALOG.find((p) => p.level === level);
  if (!found) {
    return MERGE_PRACTICE_CATALOG[0];
  }
  return found;
}

/**
 * Retorna o próximo nível de prática curricular ou null quando o conjunto estiver concluído.
 */
export function getNextMergePracticeLevel(
  currentLevel: MergePracticeLevel,
): MergePracticeLevel | null {
  if (currentLevel === "basic") return "intermediate";
  if (currentLevel === "intermediate") return "advanced";
  return null;
}
