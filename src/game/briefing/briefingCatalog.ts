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
  subtitle: "Varredura sequencial comparando pares de cargas vizinhas na esteira da estação.",
  objective:
    "Organizar os lotes de cargas em ordem crescente executando todas as comparações canônicas de cada passada até a estabilização completa do vetor.",
  instructions: [
    {
      icon: "⇄",
      title: "Pares Vizinhos",
      description:
        "O operador inspeciona exclusivamente duas cargas contíguas por vez, avançando da esquerda para a direita na esteira.",
    },
    {
      icon: "🔀",
      title: "Trocar (Esquerda > Direita)",
      description:
        "Se a carga da esquerda tiver valor maior que a da direita, execute a permuta física entre as caixas.",
    },
    {
      icon: "⏸",
      title: "Manter (Esquerda ≤ Direita)",
      description:
        "Se a carga da esquerda já for menor ou igual à da direita, confirme a preservação das posições sem permutar.",
    },
    {
      icon: "✓",
      title: "Passadas e Consolidação",
      description:
        "Ao final de cada passada completa pela esteira, a maior carga restante estabiliza em sua posição definitiva com selo OK.",
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
      value: "3 Fases (4, 5 e 6 Cargas)",
      variant: "emerald",
    },
  ],
  particularities: [
    "A campanha regular executa todas as comparações teóricas do algoritmo para assegurar a fixação da invariante de laço.",
    "Cada novo turno iniciado gera um novo lote de cargas via gerador procedural determinístico.",
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
  subtitle: "Monitoramento analítico de permutas e término antecipado em passadas estáveis.",
  objective:
    "Ordenar o lote de cargas monitorando a ocorrência de trocas: se uma passada inteira for concluída sem nenhuma permuta, a esteira encerra antecipadamente.",
  instructions: [
    {
      icon: "⚡",
      title: "Variante Otimizada",
      description:
        "Continua operando com comparações entre vizinhos contíguos, monitorando se alguma troca foi necessária na passada.",
    },
    {
      icon: "⏹",
      title: "Parada Antecipada",
      description:
        "Se uma passada inteira for completada sem nenhuma troca, o protocolo detecta que o vetor já está ordenado e encerra o turno.",
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
        "As comparações evitadas servem para análise de complexidade computacional e não alteram a fórmula de pontuação do protocolo.",
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
 * Briefing oficial para o protocolo Selection Sort ("Scanner de Carga Mínima").
 * Foco na separação conceitual entre varredura sem trocas e transferência única pontual.
 */
export const SELECTION_CANONICAL_BRIEFING: ProtocolModeBriefing = {
  id: "selection-canonical",
  protocolName: "PROTOCOLO: SELECTION SORT",
  modeName: "SCANNER DE CARGA MÍNIMA",
  badgeText: "CENTRAL LOGÍSTICA • NOVO PROTOCOLO",
  badgeVariant: "purple",
  subtitle: "Varredura seletiva para identificação da menor carga e consolidação na posição alvo.",
  objective:
    "Escanear a partição não ordenada, registrar o menor elemento e transferi-lo em definitivo para a posição alvo da passada.",
  instructions: [
    {
      icon: "🎯",
      title: "Posição Alvo",
      description:
        "Em cada passada, a posição inicial da partição não ordenada aguarda a menor carga remanescente.",
    },
    {
      icon: "🔍",
      title: "Varredura do Scanner",
      description:
        "O sensor percorre toda a região não ordenada comparando cada caixa com o candidato mínimo atual.",
    },
    {
      icon: "✦",
      title: "Decisão do Candidato",
      description:
        "NOVO MÍNIMO atualiza o candidato se a carga for menor; MANTER CANDIDATO preserva o atual. Nenhuma troca ocorre na varredura.",
    },
    {
      icon: "⇄",
      title: "Transferência e Selo OK",
      description:
        "Ao término da varredura, ocorre no máximo uma transferência para posicionar o menor item e consolidar a posição com selo OK.",
    },
  ],
  highlights: [
    {
      label: "MÉTODO",
      value: "Scanner Seletivo",
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
    "Durante toda a varredura do scanner, nenhuma movimentação física de caixas ocorre na esteira.",
    "A transferência ocorre somente após a varredura completa, selando a posição alvo com o selo OK.",
  ],
  startLabel: "INICIAR SELECTION SORT",
  startVariant: "primary",
};

/**
 * Briefing oficial para o protocolo Insertion Sort ("Desvio e Encaixe de Cargas").
 * Foco na construção da partição ordenada relativa à esquerda, elevação de chave ao trilho aéreo,
 * deslocamento unilateral regressivo (SHIFT) e encaixe na vaga aberta (INSERT).
 */
export const INSERTION_CANONICAL_BRIEFING: ProtocolModeBriefing = {
  id: "insertion-canonical",
  protocolName: "MÓDULO: INSERTION SORT",
  modeName: "DESVIO E ENCAIXE DE CARGAS",
  badgeText: "PLATAFORMA EDUCACIONAL • MÓDULO 03",
  badgeVariant: "amber",
  subtitle:
    "Construção incremental de partição ordenada através de chave suspensa e deslocamento de cargas.",
  objective:
    "Construir progressivamente uma região ordenada à esquerda (ORD): em cada passada, a carga A[i] vira a chave suspensa no trilho aéreo, cargas maiores deslizam para a direita abrindo vaga e a chave é encaixada na posição exata.",
  instructions: [
    {
      icon: "📌",
      title: "O Que Você Vai Aprender",
      description:
        "Região ordenada incremental (ORD), elevação de chave ao trilho aéreo, inspeção regressiva (A[j] > chave), deslocamentos sucessivos e a distinção fundamental: SHIFT ≠ TROCA (SWAP).",
    },
    {
      icon: "⚙",
      title: "O Que Você Vai Praticar",
      description:
        "Observar A[j] e a chave suspensa, comandar DESLOCAR CARGA (shift) quando A[j] > chave, reconhecer a condição de parada (A[j] ≤ chave ou início da esteira) e ENCAIXAR CHAVE na vaga.",
    },
    {
      icon: "🛤",
      title: "Como Funciona o Ciclo",
      description:
        "1. A[i] vira CHAVE e sobe ao trilho aéreo; 2. Uma VAGA é aberta na esteira; 3. O scanner percorre a região ORD da direita para a esquerda; 4. Cargas maiores são deslocadas à direita; 5. A chave encaixa na vaga; 6. A região ORD expande.",
    },
    {
      icon: "⚠️",
      title: "Avisos Conceituais Vitais",
      description:
        "SHIFT ≠ TROCA: apenas uma caixa desliza para a vaga vazia. ORD ≠ POSIÇÃO DEFINITIVA: elementos na região ordenada podem deslizar novamente para a direita em passadas futuras.",
    },
  ],
  highlights: [
    {
      label: "MÉTODO",
      value: "Deslocamento e Encaixe",
      variant: "amber",
    },
    {
      label: "COMPARAÇÕES",
      value: "Adaptativo O(n + d)",
      variant: "cyan",
    },
    {
      label: "MEMÓRIA",
      value: "O(1) Trilho Suspenso",
      variant: "emerald",
    },
  ],
  particularities: [
    "A vaga na esteira é temporária e física: a chave só é encaixada quando todos os elementos maiores tiverem sido deslocados.",
    "A região ORD representa ordenação relativa entre os elementos processados, não indicando posições fixas finais.",
  ],
  startLabel: "INICIAR TUTORIAL GUIADO",
  startVariant: "primary",
};

/**
 * Briefing oficial para o protocolo Merge Sort ("Divisão e Confluência").
 * Foco pedagógico: decomposição recursiva, buffer auxiliar, estabilidade sob empate e distinção ORD vs OK.
 */
export const MERGE_CANONICAL_BRIEFING: ProtocolModeBriefing = {
  id: "merge-canonical",
  protocolName: "PROTOCOLO: MERGE SORT",
  modeName: "DIVISÃO E CONFLUÊNCIA",
  badgeText: "PLATAFORMA EDUCACIONAL • MÓDULO 04",
  badgeVariant: "cyan",
  subtitle: "Decomposição recursiva e intercalação ordenada com dois ponteiros e esteira coletora.",
  objective:
    "Dividir o lote sucessivamente até subproblemas unitários e recompor a esteira principal através da confluência ordenada de ramais alimentando a esteira coletora.",
  instructions: [
    {
      icon: "✂️",
      title: "Divisão Estrutural",
      description:
        "A partição binária divide o lote sucessivamente até subvetores unitários. A divisão isolada não ordena nem altera os valores das cargas.",
    },
    {
      icon: "🔀",
      title: "Confluência de Ramais",
      description:
        "A ordenação ocorre na intercalação: dois subvetores previamente ordenados alimentam a esteira coletora temporária (buffer auxiliar).",
    },
    {
      icon: "👀",
      title: "Inspeção Exclusiva das Frentes",
      description:
        "O operador inspeciona apenas as duas cargas situadas na frente de cada ramal (dois ponteiros), colhendo sempre a menor carga para o buffer.",
    },
    {
      icon: "⚖️",
      title: "Regra Mandatória de Estabilidade",
      description:
        "Em caso de empate (cargas com valores iguais), escolha sempre a carga do Ramal Esquerdo para preservar a estabilidade e a ordem relativa original dos itens.",
    },
    {
      icon: "🌊",
      title: "Drenagem da Cauda Restante",
      description:
        "Quando um ramal se esgota, todas as cargas do outro ramal já são maiores e são transferidas em lote para a esteira coletora sem novas comparações.",
    },
    {
      icon: "🏷️",
      title: "Marcação ORD vs Selo OK",
      description:
        "Ao preencher o buffer, as cargas voltam à esteira principal. Subvetores intermediários recebem marcação ORD (ordenação local); o selo definitivo OK surge apenas ao concluir a raiz.",
    },
    {
      icon: "✍️",
      title: "Escritas Físicas vs Comparações",
      description:
        "Escritas na esteira coletora (buffer) e cópias de retorno para a esteira principal são operações físicas distintas da comparação de valores. O algoritmo requer buffer auxiliar temporário O(n).",
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
      value: "O(n) Esteira Coletora",
      variant: "emerald",
    },
  ],
  particularities: [
    "A esteira coletora (buffer) é temporária e reutilizada a cada ciclo de intercalação.",
    "Decisões incorretas paralisam a esteira e explicam a invariante sem reiniciar a atividade.",
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
