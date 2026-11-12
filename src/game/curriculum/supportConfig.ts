/**
 * Configuração Canônica Transversal de Suporte e Scaffolding Fading.
 *
 * Princípios pedagógicos (Marco LEARNING-R2-B):
 * 1. O suporte curricular varia entre:
 *    - "full": BÁSICA — Modelo mental consolidado, expressão relacional concreta, instruções conceituais.
 *    - "reduced": INTERMEDIÁRIA — O estudante interpreta o estado, instruções redundantes são removidas.
 *    - "minimal": AVANÇADA — Autonomia analítica máxima, sem instruções ou fórmulas antecipatórias.
 * 2. Scaffolding fading NÃO esconde dados factuais necessários para operar o algoritmo
 *    (vetor, caixas, ponteiros semânticos, estados da FSM, botões de ação e métricas permanecem sempre visíveis).
 * 3. O feedback após erros NÃO sobre fading (continua formativo e detalhado em todos os níveis).
 * 4. Dicas sob demanda continuam disponíveis em todos os níveis de suporte.
 */

import type { PracticeSupportProfile } from "./types";

export interface PracticeSupportConfig {
  readonly profile: PracticeSupportProfile;
  /** Rótulo em caixa alta para cabeçalhos e painéis */
  readonly label: string;
  /** Rótulo curto amigável para selos e badges */
  readonly badgeLabel: string;
  /** Explicação pedagógica concisa para o seletor de práticas */
  readonly description: string;
  /** Aviso discreto de transição para o topo do gameplay */
  readonly transitionNotice: string;
  /** Se exibe instruções antecipatórias/conceituais antes da ação do estudante */
  readonly showInstructionalPrompt: boolean;
  /** Se exibe fórmula relacional concreta entre elementos sob inspeção */
  readonly showRelationalExpression: boolean;
  /** Se exibe orientação explícita sobre a decisão a tomar */
  readonly showDecisionGuidance: boolean;
  /** Intensidade do realce visual nos alvos ativos sem comprometer acessibilidade */
  readonly highlightIntensity: "strong" | "standard" | "subtle";
  /** Disponibilidade do botão de dica sob demanda (invariante: sempre true) */
  readonly hintAvailable: boolean;
}

export const PRACTICE_SUPPORT_CONFIGS: Readonly<
  Record<PracticeSupportProfile, PracticeSupportConfig>
> = Object.freeze({
  full: Object.freeze({
    profile: "full",
    label: "SUPORTE COMPLETO",
    badgeLabel: "SUPORTE COMPLETO",
    description: "Mais orientações durante a execução.",
    transitionNotice:
      "Suporte completo ativo: orientações conceituais e relações concretas exibidas.",
    showInstructionalPrompt: true,
    showRelationalExpression: true,
    showDecisionGuidance: true,
    highlightIntensity: "strong",
    hintAvailable: true,
  }),
  reduced: Object.freeze({
    profile: "reduced",
    label: "SUPORTE REDUZIDO",
    badgeLabel: "SUPORTE REDUZIDO",
    description: "Menos pistas, mesma informação algorítmica.",
    transitionNotice:
      "Suporte reduzido: instruções antecipadas removidas; observe o estado ativo da esteira.",
    showInstructionalPrompt: false,
    showRelationalExpression: false,
    showDecisionGuidance: false,
    highlightIntensity: "standard",
    hintAvailable: true,
  }),
  minimal: Object.freeze({
    profile: "minimal",
    label: "AUTONOMIA MÁXIMA",
    badgeLabel: "AUTONOMIA MÁXIMA",
    description: "Você interpreta o estado e decide sem orientações antecipadas.",
    transitionNotice:
      "Autonomia máxima: indicadores essenciais preservados; interprete o algoritmo sem pistas.",
    showInstructionalPrompt: false,
    showRelationalExpression: false,
    showDecisionGuidance: false,
    highlightIntensity: "subtle",
    hintAvailable: true,
  }),
});

/**
 * Retorna a configuração determinística de scaffolding para o perfil informado.
 */
export function getPracticeSupportConfig(
  profile: PracticeSupportProfile = "full"
): PracticeSupportConfig {
  return PRACTICE_SUPPORT_CONFIGS[profile] ?? PRACTICE_SUPPORT_CONFIGS.full;
}

/**
 * Classes utilitárias Tailwind padronizadas para estilização de badges de suporte.
 */
export function getSupportProfileColorClasses(profile: PracticeSupportProfile): string {
  switch (profile) {
    case "full":
      return "border-emerald-500/40 bg-emerald-950/60 text-emerald-300";
    case "reduced":
      return "border-amber-500/40 bg-amber-950/60 text-amber-300";
    case "minimal":
      return "border-indigo-500/40 bg-indigo-950/60 text-indigo-300";
    default:
      return "border-white/20 bg-white/10 text-slate-300";
  }
}
