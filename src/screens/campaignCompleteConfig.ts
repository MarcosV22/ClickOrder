export type ProtocolCompleteType = "bubble" | "selection";

export interface ProtocolCompleteConfig {
  readonly protocol: ProtocolCompleteType;
  readonly ariaLabel: string;
  readonly topBadge: {
    readonly dotColor: string;
    readonly borderColor: string;
    readonly bgColor: string;
    readonly textColor: string;
    readonly text: string;
  };
  readonly hero: {
    readonly titleLine1: string;
    readonly gradientText: string;
    readonly textShadow: string;
    readonly gradientClasses: string;
    readonly description: string;
  };
  readonly ambientGlow: {
    readonly primary: string;
    readonly secondary: string;
    readonly tertiary: string;
  };
  readonly metricCards: {
    readonly phaseColor: string;
    readonly swapLabel: string;
    readonly swapColor: string;
  };
  readonly phaseCard: {
    readonly badgeBorder: string;
    readonly badgeBg: string;
    readonly badgeText: string;
    readonly vectorBorder: string;
    readonly vectorText: string;
  };
  readonly pedagogicalNote?: {
    readonly title: string;
    readonly description: string;
    readonly bgClasses: string;
    readonly borderClasses: string;
    readonly textClasses: string;
    readonly titleColor: string;
  };
  readonly restartButtonLabel: string;
  readonly restartButtonClass: string;
  readonly footerNote: string;
}

export const CAMPAIGN_COMPLETE_CONFIG: Record<ProtocolCompleteType, ProtocolCompleteConfig> = {
  bubble: {
    protocol: "bubble",
    ariaLabel: "Tela de Conclusão do Protocolo Bubble",
    topBadge: {
      dotColor: "bg-emerald-400",
      borderColor: "border-emerald-500/30",
      bgColor: "bg-emerald-950/40",
      textColor: "text-emerald-400",
      text: "CENTRAL LOGÍSTICA • PROTOCOLO BUBBLE",
    },
    hero: {
      titleLine1: "TREINAMENTO",
      gradientText: "CONCLUÍDO!",
      textShadow: "0 0 35px rgba(52,211,153,0.35)",
      gradientClasses: "from-emerald-300 via-cyan-400 to-purple-400",
      description:
        "Todas as cargas foram organizadas. O operador concluiu com sucesso todas as etapas do treinamento de ordenação por comparação adjacente.",
    },
    ambientGlow: {
      primary: "bg-emerald-500/10",
      secondary: "bg-cyan-500/10",
      tertiary: "bg-purple-600/10",
    },
    metricCards: {
      phaseColor: "text-emerald-400 glow-emerald",
      swapLabel: "Trocas Adjacentes",
      swapColor: "text-purple-400 glow-purple",
    },
    phaseCard: {
      badgeBorder: "border-emerald-500/30",
      badgeBg: "bg-emerald-950/40",
      badgeText: "text-emerald-400",
      vectorBorder: "border-emerald-500/40",
      vectorText: "text-emerald-300",
    },
    restartButtonLabel: "↺ \u00a0 REJOGAR PROTOCOLO",
    restartButtonClass: "min-w-[180px]",
    footerNote:
      "OPERAÇÃO HOMOLOGADA • BUBBLE SORT V2.0 • SETORES SELECTION E INSERTION EM DESENVOLVIMENTO",
  },
  selection: {
    protocol: "selection",
    ariaLabel: "Tela de Conclusão do Protocolo Selection Sort",
    topBadge: {
      dotColor: "bg-purple-400",
      borderColor: "border-purple-500/30",
      bgColor: "bg-purple-950/40",
      textColor: "text-purple-300",
      text: "CENTRAL LOGÍSTICA • PROTOCOLO SELECTION SORT",
    },
    hero: {
      titleLine1: "PROTOCOLO SELECTION SORT",
      gradientText: "CONCLUÍDO!",
      textShadow: "0 0 35px rgba(168,85,247,0.35)",
      gradientClasses: "from-purple-300 via-cyan-400 to-emerald-400",
      description:
        "Operação finalizada com sucesso nas 3 fases da esteira de triagem. O operador executou a busca por varredura seletiva e transferências pontuais por passada.",
    },
    ambientGlow: {
      primary: "bg-purple-600/10",
      secondary: "bg-cyan-500/10",
      tertiary: "bg-emerald-500/10",
    },
    metricCards: {
      phaseColor: "text-purple-300 glow-purple",
      swapLabel: "Trocas Totais",
      swapColor: "text-emerald-400 glow-emerald",
    },
    phaseCard: {
      badgeBorder: "border-purple-500/30",
      badgeBg: "bg-purple-950/40",
      badgeText: "text-purple-300",
      vectorBorder: "border-purple-500/40",
      vectorText: "text-purple-300",
    },
    pedagogicalNote: {
      title: "Princípio Fundamental do Selection Sort:",
      description:
        "Selection Sort realiza a varredura completa da partição não ordenada antes de efetuar no máximo uma troca por passada, consolidando progressivamente os menores elementos nas posições definitivas.",
      bgClasses: "bg-purple-950/30",
      borderClasses: "border-purple-500/20",
      textClasses: "text-purple-200/90",
      titleColor: "text-purple-300",
    },
    restartButtonLabel: "↺ \u00a0 REJOGAR SELECTION SORT",
    restartButtonClass:
      "min-w-[220px] border-purple-500/50 text-purple-300 hover:border-purple-400 shadow-lg shadow-purple-950/40",
    footerNote:
      "OPERAÇÃO HOMOLOGADA • SELECTION SORT V1.0 • SETORES BUBBLE E INSERTION INTEGRADOS",
  },
};

export function getCampaignCompleteConfig(
  protocol: ProtocolCompleteType = "bubble"
): ProtocolCompleteConfig {
  return CAMPAIGN_COMPLETE_CONFIG[protocol] ?? CAMPAIGN_COMPLETE_CONFIG.bubble;
}
