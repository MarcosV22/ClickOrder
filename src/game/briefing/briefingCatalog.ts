import type { ProtocolModeBriefing, BriefingModeId } from "./types";

/**
 * Briefing oficial para a campanha didática do Bubble Sort (Treinamento Regular).
 * Foco na invariante de laço, pares vizinhos, trocas estritas e passadas completas.
 */
export const BUBBLE_CANONICAL_BRIEFING: ProtocolModeBriefing = {
  id: "bubble-canonical",
  protocolName: "PROTOCOLO: BUBBLE SORT",
  modeName: "TREINAMENTO REGULAR",
  badgeText: "CENTRAL LOGÍSTICA • PROTOCOLO CANÔNICO",
  badgeVariant: "cyan",
  subtitle: "Comparação sequencial de pares de números vizinhos no vetor.",
  objective:
    "Organizar os números em ordem crescente executando todas as comparações canônicas de cada passada até a consolidação completa do vetor.",
  instructions: [
    {
      icon: "⇄",
      title: "Pares Vizinhos",
      description:
        "Analise dois números contíguos por vez, avançando da esquerda para a direita no vetor.",
    },
    {
      icon: "🔀",
      title: "Trocar (Esquerda > Direita)",
      description:
        "Se o número da esquerda for maior que o da direita, realize a troca de posições entre os elementos.",
    },
    {
      icon: "⏸",
      title: "Manter (Esquerda ≤ Direita)",
      description:
        "Se o número da esquerda já for menor ou igual ao da direita, confirme a manutenção das posições sem trocar.",
    },
    {
      icon: "✓",
      title: "Passadas e Consolidação",
      description:
        "Ao final de cada passada completa pelo vetor, o maior número restante estabiliza em sua posição definitiva com selo OK.",
    },
  ],
  highlights: [
    {
      label: "MÉTODO",
      value: "Canônico Didático",
      variant: "cyan",
    },
    {
      label: "COMPARAÇÕES",
      value: "n(n-1)/2 Formais",
      variant: "purple",
    },
    {
      label: "PROGRESSÃO",
      value: "3 Fases (4, 5 e 6 Elementos)",
      variant: "emerald",
    },
  ],
  particularities: [
    "O treinamento avança por 3 fases com vetores de tamanho crescente, executando todas as comparações canônicas para fixar o conceito da invariante de ordenação.",
    "Cada novo turno gera um novo conjunto de elementos por meio do gerador procedural.",
  ],
  startLabel: "INICIAR TREINAMENTO",
  startVariant: "primary",
};

/**
 * Briefing oficial para a variante Bubble Sort Early Exit (Modo Desafio).
 * Foco na otimização analítica: detecção de passada sem trocas e término antecipado.
 */
export const BUBBLE_EARLY_EXIT_BRIEFING: ProtocolModeBriefing = {
  id: "bubble-early-exit",
  protocolName: "PROTOCOLO: BUBBLE SORT",
  modeName: "MODO DESAFIO (EARLY EXIT)",
  badgeText: "CENTRAL LOGÍSTICA • VARIANTE OTIMIZADA",
  badgeVariant: "amber",
  subtitle: "Detecção de passada sem trocas e término antecipado do algoritmo.",
  objective:
    "Ordenar os números do vetor monitorando a ocorrência de trocas: se uma passada inteira for concluída sem nenhuma troca, o processo encerra antecipadamente.",
  instructions: [
    {
      icon: "⚡",
      title: "Variante Otimizada",
      description:
        "Continua comparando números vizinhos contíguos, monitorando se alguma troca foi necessária na passada.",
    },
    {
      icon: "⏹",
      title: "Parada Antecipada",
      description:
        "Se uma passada inteira for completada sem nenhuma troca, o algoritmo detecta que o vetor já está ordenado e encerra o turno.",
    },
    {
      icon: "⚖",
      title: "Sensibilidade à Entrada",
      description:
        "Vetores quase ordenados economizam comparações (melhor caso Ω(n)), enquanto inversões na cauda executam todas as passadas normais.",
    },
    {
      icon: "★",
      title: "Critério de Pontuação",
      description:
        "As comparações evitadas servem para análise de complexidade computacional e não alteram a pontuação da prática.",
    },
  ],
  highlights: [
    {
      label: "MÉTODO",
      value: "Early Exit Otimizado",
      variant: "amber",
    },
    {
      label: "MELHOR CASO",
      value: "Ω(n) Comparações",
      variant: "emerald",
    },
    {
      label: "CENÁRIOS",
      value: "3 Desafios Curados",
      variant: "purple",
    },
  ],
  particularities: [
    "Apenas encerra antecipadamente se a passada terminar com exatamente zero trocas.",
    "Comparações evitadas geram métricas de confronto factual contra o algoritmo canônico na tela de resultados.",
  ],
  startLabel: "INICIAR DESAFIO",
  startVariant: "primary",
};

/**
 * Briefing oficial para o protocolo Selection Sort ("Seleção do Menor Número").
 * Foco na separação conceitual entre varredura sem trocas e transferência única pontual.
 */
export const SELECTION_CANONICAL_BRIEFING: ProtocolModeBriefing = {
  id: "selection-canonical",
  protocolName: "PROTOCOLO: SELECTION SORT",
  modeName: "SCANNER DE CARGA MÍNIMA",
  badgeText: "CENTRAL LOGÍSTICA • NOVO PROTOCOLO",
  badgeVariant: "purple",
  subtitle: "Busca do menor número em cada passada e posicionamento no início da parte não ordenada.",
  objective:
    "Percorrer a parte não ordenada do vetor, identificar o menor elemento e colocá-lo na posição inicial da passada através de uma troca única.",
  instructions: [
    {
      icon: "🎯",
      title: "Posição Alvo",
      description:
        "Em cada passada, a posição inicial da parte não ordenada aguarda o menor número remanescente.",
    },
    {
      icon: "🔍",
      title: "Varredura do Menor Elemento",
      description:
        "O sensor de leitura percorre toda a região não ordenada comparando cada elemento com o menor valor encontrado até o momento.",
    },
    {
      icon: "✦",
      title: "Decisão do Candidato",
      description:
        "NOVO MÍNIMO atualiza o candidato se o número analisado for menor; MANTER CANDIDATO preserva o atual. Nenhuma troca ocorre durante a busca.",
    },
    {
      icon: "⇄",
      title: "Transferência e Selo OK",
      description:
        "Ao término da varredura, ocorre no máximo uma troca para posicionar o menor item e consolidar a posição com selo OK.",
    },
  ],
  highlights: [
    {
      label: "MÉTODO",
      value: "Seleção do Menor Elemento",
      variant: "purple",
    },
    {
      label: "COMPARAÇÕES",
      value: "n(n-1)/2 Formais",
      variant: "cyan",
    },
    {
      label: "TROCAS",
      value: "No Máximo n-1",
      variant: "emerald",
    },
  ],
  particularities: [
    "Durante toda a busca pelo menor valor, nenhuma troca de elementos ocorre no vetor.",
    "A transferência ocorre somente após a varredura completa da passada, consolidando a posição com o selo OK.",
  ],
  startLabel: "INICIAR SELECTION SORT",
  startVariant: "primary",
};

/**
 * Briefing oficial para o protocolo Insertion Sort ("Inserção na Parte Ordenada").
 * Foco na construção da parte ordenada à esquerda, elemento chave,
 * deslocamento regressivo e inserção na vaga aberta.
 */
export const INSERTION_CANONICAL_BRIEFING: ProtocolModeBriefing = {
  id: "insertion-canonical",
  protocolName: "MÓDULO: INSERTION SORT",
  modeName: "DESVIO E ENCAIXE DE CARGAS",
  badgeText: "PLATAFORMA EDUCACIONAL • MÓDULO 03",
  badgeVariant: "amber",
  subtitle:
    "Construção progressiva de uma parte ordenada inserindo cada número na posição correta.",
  objective:
    "Construir progressivamente uma região ordenada à esquerda (ORD): em cada passada, o elemento A[i] vira a chave destacada, elementos maiores deslizam para a direita abrindo vaga e a chave é inserida na posição exata.",
  instructions: [
    {
      icon: "📌",
      title: "O Que Você Vai Aprender",
      description:
        "Construção de uma parte ordenada passo a passo (ORD), seleção do número-chave, comparação regressiva e a diferença essencial: DESLOCAMENTO ≠ TROCA.",
    },
    {
      icon: "⚙",
      title: "O Que Você Vai Praticar",
      description:
        "Comparar o número em análise com a chave destacada, comandar DESLOCAR quando o número for maior e encaixar a chave na vaga correta.",
    },
    {
      icon: "🛤",
      title: "Como Funciona o Ciclo",
      description:
        "1. O próximo número vira CHAVE; 2. Uma VAGA é aberta no vetor; 3. Compara-se a chave com os elementos do grupo ORD da direita para a esquerda; 4. Elementos maiores deslizam para a direita; 5. A chave é inserida na vaga; 6. A região ORD expande.",
    },
    {
      icon: "⚠️",
      title: "Avisos Importantes",
      description:
        "DESLOCAMENTO ≠ TROCA: apenas um elemento desliza para a vaga aberta. ORD ≠ POSIÇÃO DEFINITIVA: elementos no grupo ordenado ainda podem deslizar para a direita em passadas futuras.",
    },
  ],
  highlights: [
    {
      label: "MÉTODO",
      value: "Deslocamento e Inserção",
      variant: "amber",
    },
    {
      label: "COMPARAÇÕES",
      value: "Adaptativo O(n + d)",
      variant: "cyan",
    },
    {
      label: "MEMÓRIA",
      value: "O(1) Elemento Chave",
      variant: "emerald",
    },
  ],
  particularities: [
    "A vaga no vetor é temporária: a chave só é inserida quando todos os elementos maiores tiverem sido deslocados.",
    "A região ORD representa ordenação relativa entre os elementos processados, não indicando posições fixas finais.",
  ],
  startLabel: "INICIAR TUTORIAL GUIADO",
  startVariant: "primary",
};

/**
 * Briefing oficial para o protocolo Merge Sort ("Divisão e Intercalação").
 * Foco pedagógico: decomposição recursiva, buffer auxiliar, estabilidade sob empate e distinção ORD vs OK.
 */
export const MERGE_CANONICAL_BRIEFING: ProtocolModeBriefing = {
  id: "merge-canonical",
  protocolName: "PROTOCOLO: MERGE SORT",
  modeName: "DIVISÃO E CONFLUÊNCIA",
  badgeText: "PLATAFORMA EDUCACIONAL • MÓDULO 04",
  badgeVariant: "cyan",
  subtitle: "Divisão em grupos menores e intercalação ordenada com dois ponteiros e vetor auxiliar.",
  objective:
    "Dividir o vetor em subproblemas unitários e recompor a ordem combinando os grupos ordenados com um vetor auxiliar temporário (buffer).",
  instructions: [
    {
      icon: "✂️",
      title: "Divisão Estrutural",
      description:
        "A divisão binária reparte o vetor sucessivamente até subvetores unitários. A divisão isolada não ordena nem altera os valores dos elementos.",
    },
    {
      icon: "🔀",
      title: "Confluência de Ramais",
      description:
        "A ordenação ocorre na intercalação: dois grupos já ordenados (ramais) alimentam o vetor temporário (buffer auxiliar).",
    },
    {
      icon: "👀",
      title: "Inspeção Exclusiva das Frentes",
      description:
        "Analise apenas os dois números situados na frente de cada ramal (dois ponteiros), escolhendo sempre o menor para a próxima posição do buffer.",
    },
    {
      icon: "⚖️",
      title: "Regra Mandatória de Estabilidade",
      description:
        "Em caso de empate (números com valores iguais), escolha sempre o item do Ramal Esquerdo para preservar a estabilidade e a ordem original dos dados.",
    },
    {
      icon: "🌊",
      title: "Drenagem da Cauda Restante",
      description:
        "Quando um dos grupos terminar, todos os números restantes do outro grupo são copiados diretamente para o buffer sem novas comparações, pois já estão ordenados.",
    },
    {
      icon: "🏷️",
      title: "Marcação ORD vs Selo OK",
      description:
        "Ao preencher o buffer, os números voltam ao vetor principal. Subvetores intermediários recebem marcação ORD (ordenação local); o selo definitivo OK surge apenas ao concluir todo o vetor.",
    },
    {
      icon: "✍️",
      title: "Escritas Físicas vs Comparações",
      description:
        "Escritas no vetor auxiliar (buffer) e cópias de retorno para o vetor principal são operações distintas da comparação de valores. O algoritmo requer buffer auxiliar temporário O(n).",
    },
  ],
  highlights: [
    {
      label: "MÉTODO",
      value: "Divisão e Confluência",
      variant: "cyan",
    },
    {
      label: "COMPARAÇÕES",
      value: "Ótimo Θ(n log n)",
      variant: "purple",
    },
    {
      label: "BUFFER AUXILIAR",
      value: "O(n) Espaço Temporário",
      variant: "emerald",
    },
  ],
  particularities: [
    "O vetor auxiliar (buffer) é temporário e reutilizado a cada ciclo de intercalação.",
    "Decisões incorretas paralisam a ação e explicam a invariante sem reiniciar o exercício.",
  ],
  startLabel: "INICIAR TUTORIAL GUIADO",
  startVariant: "primary",
};

export const BRIEFING_CATALOG: Record<BriefingModeId, ProtocolModeBriefing> = {
  "bubble-canonical": BUBBLE_CANONICAL_BRIEFING,
  "bubble-early-exit": BUBBLE_EARLY_EXIT_BRIEFING,
  "selection-canonical": SELECTION_CANONICAL_BRIEFING,
  "insertion-canonical": INSERTION_CANONICAL_BRIEFING,
  "merge-canonical": MERGE_CANONICAL_BRIEFING,
};

/**
 * Recupera o briefing configurado para um modo específico.
 */
export function getBriefingForMode(modeId: BriefingModeId): ProtocolModeBriefing {
  return BRIEFING_CATALOG[modeId] ?? BUBBLE_CANONICAL_BRIEFING;
}

/**
 * Mapeia o GameMode do App ("CAMPAIGN" | "CHALLENGE") para seu briefing correspondente.
 */
export function getBriefingForGameMode(mode: "CAMPAIGN" | "CHALLENGE"): ProtocolModeBriefing {
  return mode === "CHALLENGE" ? BUBBLE_EARLY_EXIT_BRIEFING : BUBBLE_CANONICAL_BRIEFING;
}
