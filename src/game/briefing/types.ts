/**
 * Contratos de tipos para o sistema de briefing de modos de jogo.
 * Infraestrutura global e reutilizável para Bubble, Selection, Insertion e futuros protocolos.
 */

export type BriefingBadgeVariant = "cyan" | "purple" | "amber" | "emerald";

export interface BriefingInstruction {
  readonly icon?: string;
  readonly title: string;
  readonly description: string;
}

export interface BriefingHighlight {
  readonly label: string;
  readonly value: string;
  readonly variant?: BriefingBadgeVariant;
}

export interface ProtocolModeBriefing {
  readonly id: string;
  readonly protocolName: string;
  readonly modeName: string;
  readonly badgeText: string;
  readonly badgeVariant?: BriefingBadgeVariant;
  readonly subtitle: string;
  readonly objective: string;
  readonly instructions: readonly BriefingInstruction[];
  readonly highlights: readonly BriefingHighlight[];
  readonly particularities?: readonly string[];
  readonly startLabel: string;
  readonly startVariant?: "primary" | "secondary" | "danger" | "ghost";
}

export type BriefingModeId =
  | "bubble-canonical"
  | "bubble-early-exit"
  | "selection-canonical"
  | "insertion-canonical"
  | "merge-canonical";
