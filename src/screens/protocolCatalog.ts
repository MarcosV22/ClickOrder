import type { GameSaveSchema } from "../game/persistence/types";
import {
  isChallengeModeUnlocked,
  getModuleProgress,
  isModuleTutorialCompleted,
  isExerciseSetCompleted,
} from "../game/persistence/persistenceService";
import {
  BUBBLE_EXERCISE_SETS,
  SELECTION_EXERCISE_SETS,
  INSERTION_EXERCISE_SETS,
  MERGE_EXERCISE_SETS,
} from "../game/persistence/constants";

export type ProtocolId = "bubble" | "selection" | "insertion" | "merge";

export type ProtocolStatus = "available" | "coming_soon";

export interface ProtocolMetadata {
  readonly id: ProtocolId;
  readonly name: string;
  readonly metaphor: string;
  readonly shortDescription: string;
  readonly practiceItems: readonly string[];
  readonly status: ProtocolStatus;
  readonly statusLabel: string;
  readonly demonstrationStatus: "available" | "coming_soon";
  readonly demonstrationLabel: string;
  readonly totalPhases: number;
  readonly theme: {
    readonly primaryColor: "cyan" | "purple" | "amber" | "blue";
    readonly accentGlow: string;
    readonly borderClass: string;
    readonly borderHoverClass: string;
    readonly badgeBgClass: string;
    readonly badgeTextClass: string;
    readonly titleGradientClass: string;
    readonly practiceBadgeClass: string;
  };
}

export const PROTOCOL_CATALOG: readonly ProtocolMetadata[] = Object.freeze([
  {
    id: "bubble",
    name: "BUBBLE SORT",
    metaphor: "PARES VIZINHOS / ESTEIRA DE COMPARAÇÃO",
    shortDescription:
      "Compare cargas vizinhas e execute trocas sucessivas até consolidar a esteira.",
    practiceItems: Object.freeze([
      "Comparação de vizinhos",
      "Troca física adjacente",
      "Passadas sucessivas",
    ]),
    status: "available",
    statusLabel: "DISPONÍVEL",
    demonstrationStatus: "available",
    demonstrationLabel: "DEMONSTRAÇÃO",
    totalPhases: 3,
    theme: {
      primaryColor: "cyan",
      accentGlow: "rgba(0, 245, 255, 0.15)",
      borderClass: "border-cyan-500/30",
      borderHoverClass: "hover:border-cyan-400/60",
      badgeBgClass: "bg-cyan-950/40 border-cyan-500/30",
      badgeTextClass: "text-cyan-400",
      titleGradientClass: "from-cyan-300 via-blue-400 to-cyan-400",
      practiceBadgeClass: "bg-cyan-950/30 border-cyan-500/20 text-cyan-300/90",
    },
  },
  {
    id: "selection",
    name: "SELECTION SORT",
    metaphor: "SCANNER DE CARGA MÍNIMA",
    shortDescription:
      "Varra a região não ordenada, identifique a menor carga e transfira-a para a posição alvo.",
    practiceItems: Object.freeze([
      "Varredura da esteira",
      "Candidato a menor carga",
      "Transferência pontual no commit",
    ]),
    status: "available",
    statusLabel: "DISPONÍVEL",
    demonstrationStatus: "available",
    demonstrationLabel: "DEMONSTRAÇÃO",
    totalPhases: 3,
    theme: {
      primaryColor: "purple",
      accentGlow: "rgba(139, 92, 246, 0.15)",
      borderClass: "border-purple-500/30",
      borderHoverClass: "hover:border-purple-400/60",
      badgeBgClass: "bg-purple-950/40 border-purple-500/30",
      badgeTextClass: "text-purple-400",
      titleGradientClass: "from-purple-300 via-pink-400 to-purple-400",
      practiceBadgeClass: "bg-purple-950/30 border-purple-500/20 text-purple-300/90",
    },
  },
  {
    id: "insertion",
    name: "INSERTION SORT",
    metaphor: "TRILHO DE INSERÇÃO",
    shortDescription:
      "Construa progressivamente uma região ordenada inserindo cada nova carga na posição correta.",
    practiceItems: Object.freeze([
      "Região ordenada provisória (ORD)",
      "Carga-chave sob inspeção",
      "Deslocamento e inserção",
    ]),
    status: "available",
    statusLabel: "DISPONÍVEL",
    demonstrationStatus: "available",
    demonstrationLabel: "DEMONSTRAÇÃO",
    totalPhases: 3,
    theme: {
      primaryColor: "amber",
      accentGlow: "rgba(245, 158, 11, 0.15)",
      borderClass: "border-amber-500/30",
      borderHoverClass: "hover:border-amber-400/60",
      badgeBgClass: "bg-amber-950/40 border-amber-500/30",
      badgeTextClass: "text-amber-400",
      titleGradientClass: "from-amber-300 via-orange-400 to-amber-400",
      practiceBadgeClass: "bg-amber-950/30 border-amber-500/20 text-amber-300/90",
    },
  },
  {
    id: "merge",
    name: "MERGE SORT",
    metaphor: "DIVISÃO E CONFLUÊNCIA DE RAMAIS",
    shortDescription:
      "Divida o lote em subvetores e recombine com dois ponteiros alimentando a esteira coletora.",
    practiceItems: Object.freeze([
      "Intercalação com dois ponteiros",
      "Esteira coletora (buffer O(n))",
      "Desempate com estabilidade (≤)",
    ]),
    status: "available",
    statusLabel: "DISPONÍVEL",
    demonstrationStatus: "available",
    demonstrationLabel: "DEMONSTRAÇÃO",
    totalPhases: 3,
    theme: {
      primaryColor: "blue",
      accentGlow: "rgba(59, 130, 246, 0.15)",
      borderClass: "border-blue-500/30",
      borderHoverClass: "hover:border-blue-400/60",
      badgeBgClass: "bg-blue-950/40 border-blue-500/30",
      badgeTextClass: "text-blue-400",
      titleGradientClass: "from-blue-300 via-cyan-400 to-sky-300",
      practiceBadgeClass: "bg-blue-950/30 border-blue-500/20 text-blue-300/90",
    },
  },
]);

export interface ProtocolProgressSummary {
  readonly completedPhases: number;
  readonly totalPhases: number;
  readonly hasCompletedTutorial: boolean;
  readonly bestScore?: number;
  readonly isChallengeUnlocked?: boolean;
}

const MODULE_REGULAR_EXERCISES: Record<ProtocolId, readonly string[]> = Object.freeze({
  bubble: [
    BUBBLE_EXERCISE_SETS.BASIC,
    BUBBLE_EXERCISE_SETS.INTERMEDIATE,
    BUBBLE_EXERCISE_SETS.ADVANCED,
  ],
  selection: [
    SELECTION_EXERCISE_SETS.BASIC,
    SELECTION_EXERCISE_SETS.INTERMEDIATE,
    SELECTION_EXERCISE_SETS.ADVANCED,
  ],
  insertion: [
    INSERTION_EXERCISE_SETS.BASIC,
    INSERTION_EXERCISE_SETS.INTERMEDIATE,
    INSERTION_EXERCISE_SETS.ADVANCED,
  ],
  merge: [
    MERGE_EXERCISE_SETS.BASIC,
    MERGE_EXERCISE_SETS.INTERMEDIATE,
    MERGE_EXERCISE_SETS.ADVANCED,
  ],
});

/**
 * Calcula o resumo factual de progresso pedagógico para exibição no card da Home.
 * Suporta uniformemente todos os módulos sob o Schema v4.
 * Opera como função pura sem efeitos colaterais.
 */
export function getProtocolProgressSummary(
  protocolId: ProtocolId,
  saveData?: GameSaveSchema
): ProtocolProgressSummary {
  if (!saveData) {
    return {
      completedPhases: 0,
      totalPhases: 3,
      hasCompletedTutorial: false,
    };
  }

  const exercises = MODULE_REGULAR_EXERCISES[protocolId] ?? [];
  let completedPhases = 0;
  for (const exId of exercises) {
    if (isExerciseSetCompleted(saveData, protocolId, exId)) {
      completedPhases += 1;
    }
  }

  const moduleProgress = getModuleProgress(saveData, protocolId);
  const validScores: number[] = [];
  for (const setProgress of Object.values(moduleProgress.exerciseSets)) {
    if (setProgress?.completed && setProgress.bestRecord?.bestScore !== undefined) {
      validScores.push(setProgress.bestRecord.bestScore);
    }
  }

  const bestScore = validScores.length > 0 ? Math.max(...validScores) : undefined;
  const hasCompletedTutorial = isModuleTutorialCompleted(saveData, protocolId);

  const isChallengeUnlocked =
    protocolId === "bubble" ? isChallengeModeUnlocked(saveData) : undefined;

  return {
    completedPhases,
    totalPhases: 3,
    hasCompletedTutorial,
    bestScore,
    isChallengeUnlocked,
  };
}

export function getProtocolMetadata(id: ProtocolId): ProtocolMetadata {
  const found = PROTOCOL_CATALOG.find((p) => p.id === id);
  if (!found) {
    return PROTOCOL_CATALOG[0];
  }
  return found;
}
