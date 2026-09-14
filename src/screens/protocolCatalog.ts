import type { GameSaveSchema } from "../game/persistence/types";
import { isChallengeModeUnlocked } from "../game/persistence/persistenceService";

export type ProtocolId = "bubble" | "selection" | "insertion";

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
    readonly primaryColor: "cyan" | "purple" | "amber";
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
    status: "coming_soon",
    statusLabel: "EM BREVE",
    demonstrationStatus: "coming_soon",
    demonstrationLabel: "DEMO (EM BREVE)",
    totalPhases: 3,
    theme: {
      primaryColor: "amber",
      accentGlow: "rgba(245, 158, 11, 0.08)",
      borderClass: "border-white/10",
      borderHoverClass: "border-white/10",
      badgeBgClass: "bg-zinc-900/60 border-zinc-700/50",
      badgeTextClass: "text-amber-400/90",
      titleGradientClass: "from-white/60 via-zinc-400 to-white/40",
      practiceBadgeClass: "bg-zinc-900/40 border-zinc-800 text-zinc-400",
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

/**
 * Calcula o resumo factual de progresso pedagógico para exibição no card da Home.
 * Não altera dados no storage e opera como função pura.
 */
export function getProtocolProgressSummary(
  protocolId: ProtocolId,
  saveData?: GameSaveSchema
): ProtocolProgressSummary {
  if (!saveData || protocolId === "insertion") {
    return {
      completedPhases: 0,
      totalPhases: 3,
      hasCompletedTutorial: false,
    };
  }

  const progress = saveData.protocols[protocolId];
  if (!progress) {
    return {
      completedPhases: 0,
      totalPhases: 3,
      hasCompletedTutorial: false,
    };
  }

  const completedRecords = Object.values(progress.records).filter(
    (r) => r && r.completed
  );
  const completedPhases = completedRecords.length;

  const validScores = completedRecords
    .map((r) => r.bestScore)
    .filter((s): s is number => typeof s === "number");

  const bestScore = validScores.length > 0 ? Math.max(...validScores) : undefined;

  const isChallengeUnlocked =
    protocolId === "bubble" ? isChallengeModeUnlocked(saveData, 3) : undefined;

  return {
    completedPhases,
    totalPhases: 3,
    hasCompletedTutorial: progress.hasCompletedTutorial,
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
