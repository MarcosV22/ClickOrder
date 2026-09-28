/**
 * Briefing canônico institucional para o módulo do Quick Sort.
 * Segue estritamente as diretrizes pedagógicas aprovadas:
 * 1. Identifique o pivô;
 * 2. Compare cada número com o pivô;
 * 3. Coloque o pivô na posição final e continue nos outros trechos.
 *
 * Utiliza linguagem clara, direta e livre de jargões operacionais industriais.
 */

import type { ProtocolModeBriefing } from "./types";

export const QUICK_CANONICAL_BRIEFING: ProtocolModeBriefing = {
  id: "quick-canonical",
  protocolName: "PROTOCOLO: QUICK SORT",
  modeName: "PARTICIONAMENTO DE PIVÔ",
  badgeText: "PLATAFORMA EDUCACIONAL • MÓDULO 05",
  badgeVariant: "amber",
  subtitle: "Organize o vetor separando números em relação a um pivô de referência.",
  objective:
    "Particionar o vetor reorganizando números menores/iguais e maiores que o pivô, fixando o pivô em sua posição definitiva e repetindo nos subintervalos restantes.",
  instructions: [
    {
      icon: "1",
      title: "Identifique o pivô",
      description:
        "O pivô é o número de referência para a comparação. Nesta variante, ele é escolhido automaticamente no fim do trecho ativo.",
    },
    {
      icon: "2",
      title: "Compare cada número com o pivô",
      description:
        "Percorra os números do trecho: se o número for menor ou igual ao pivô, ele vai para a região esquerda (trocando de posição se necessário). Se for maior, permanece na direita sem troca. Números com valor igual pertencem à região menor ou igual.",
    },
    {
      icon: "3",
      title: "Coloque o pivô na posição final e continue",
      description:
        "Terminada a varredura, coloque o pivô entre as duas regiões. O pivô recebe o selo OK definitivo e não será mais movimentado. Depois, aplique o mesmo processo aos trechos restantes à esquerda e à direita.",
    },
  ],
  highlights: [
    {
      label: "MÉTODO",
      value: "Particionamento (Lomuto)",
      variant: "amber",
    },
    {
      label: "CASO MÉDIO",
      value: "Rápido Θ(n log n)",
      variant: "cyan",
    },
    {
      label: "ESPAÇO TEMPORÁRIO",
      value: "O(1) In-Place",
      variant: "emerald",
    },
  ],
  particularities: [
    "O pivô é o número de referência usado para dividir o trecho em duas regiões.",
    "Nesta variante canônica, o pivô é sempre o último elemento do trecho em análise.",
    "Números com valores iguais ao pivô pertencem obrigatoriamente à região menor ou igual (≤).",
    "As regiões formadas à esquerda e à direita ainda não estão necessariamente ordenadas internamente.",
    "Assim que o pivô é colocado na fronteira definitiva, ele recebe o selo OK definitivo e nunca mais é movimentado.",
    "Esta variante não garante preservar a ordem relativa original de elementos iguais (algoritmo instável).",
  ],
  startLabel: "INICIAR TUTORIAL GUIADO",
  startVariant: "primary",
};
