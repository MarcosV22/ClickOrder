# 16. Charter Educacional, Padronização Transversal de Telas e Glossário Canônico do Sorting Station

- **Status:** Aprovado
- **Data:** 2026-09-14
- **Decisores:** Antigravity, Marcos Mendes
- **Contexto da Tarefa:** P2.1-G-A (Auditoria e Padronização Educacional do Sorting Station)
- **Documentos Relacionados:**
  - [`docs/wiki/12-pedagogy-and-academic-traceability.md`](../wiki/12-pedagogy-and-academic-traceability.md)
  - [`docs/wiki/05-ux-design-system.md`](../wiki/05-ux-design-system.md)
  - [`docs/wiki/03-frontend.md`](../wiki/03-frontend.md)
  - [`docs/wiki/10-roadmap.md`](../wiki/10-roadmap.md)
  - ADRs anteriores: [`0003`](./0003-session-metrics-engine-decoupling.md), [`0004`](./0004-execution-replay-state-derivation.md), [`0005`](./0005-replay-synchronized-pseudocode.md), [`0007`](./0007-protocol-score-and-descriptive-elapsed-time.md), [`0011`](./0011-selection-sort-engine-fsm.md), [`0014`](./0014-selection-sort-replay-and-synchronized-pseudocode.md), [`0015`](./0015-multi-protocol-persistence-schema-v3.md).

---

## 1. Contexto e Motivação

O **Sorting Station** foi concebido como um jogo educacional focado no ensino de algoritmos de ordenação por meio de manipulação cinestésica direta, visualização na esteira e conexão formal com pseudocódigo sincronizado.

Com a conclusão dos ciclos do **Bubble Sort** (P0 e P1) e do **Selection Sort** (P2.1), o sistema atingiu maturidade funcional completa em dois algoritmos fundamentais. No entanto, uma auditoria aprofundada nas telas atuais revelou assimetrias estruturais, visuais e terminológicas resultantes do desenvolvimento incremental:
1. **Assimetria na Home Screen:** O botão principal da Home iniciava o Bubble Sort implicitamente sob o rótulo "INICIAR TURNO", enquanto o Selection Sort e o Modo Desafio eram adicionados como botões soltos, sem um seletor simétrico de protocolos;
2. **Divergência entre Tutoriais:** O tutorial do Selection Sort evoluiu para uma interface refinada (com navegação superior, barra de status de FSM, dicas pedagógicas ativas e papéis semânticos de caixas `BoxRole`), enquanto o tutorial do Bubble permaneceu com estrutura visual antiga;
3. **Inconsistências de Layout no Gameplay:** A `SelectionGameScreen` possui banner textual de inspeção ($A[j] < A[\text{minIndex}]$) e barra contínua de progresso percentual ($0\%$ a $100\%$), ausentes na `GameScreen` do Bubble;
4. **Duplicação de Telas de Conclusão:** Telas separadas de homologação de campanha (`CampaignCompleteScreen` e `SelectionCampaignCompleteScreen`) com JSX e estrutura praticamente idênticos;
5. **Necessidade de Institucionalização do Modo Demonstração:** Demanda pedagógica por um modo de visualização autônoma ("Showroom") antes do início prático pelo aluno.

Antes de avançar para o **Milestone P2.2 (Insertion Sort)**, fez-se indispensável congelar as regras canônicas de design educacional, a metáfora do jogo, o glossário terminológico e a arquitetura padrão de telas.

---

## 2. Decisão Arquitetural e Pedagógica

Ficam estabelecidas como diretrizes canônicas e obrigatórias do projeto:

### 2.1. O Charter Educacional Oficial
> *"Sorting Station é um jogo educacional voltado ao ensino de algoritmos de ordenação, articulando visualização cinestésica, prática guiada, execução interativa e reflexão sobre o comportamento algorítmico."*

**Pilares Fundamentais:**
1. **Abstração Concreta e Metáfora Diegética Coerente:** A máquina é a estação logística; o vetor é a esteira de roletes; os elementos são cargas numeradas; a memória é a bancada operacional.
2. **Fidelidade Mecânica Estrita ao Algoritmo:** Cada algoritmo possui máquina de estados (FSM) própria baseada em suas operações fundamentais. Não há reaproveitamento superficial de mecânicas de um protocolo para outro.
3. **Estrutura Pedagógica Obrigatória em 6 Camadas por Protocolo:**
   $$\text{Briefing Conceitual} \longrightarrow \text{Demonstração Visual} \longrightarrow \text{Tutorial Guiado} \longrightarrow \text{Gameplay Interativo} \longrightarrow \text{Resultado Factual} \longrightarrow \text{Replay/Reflexão}$$
4. **Feedback Imediato, Formativo e Não Punitivo:** Erros de decisão não encerram a fase nem punem destrutivamente o jogador; fornecem explicações conceituais claras no momento da ação.
5. **Métricas Factuais e Ética de Avaliação (Pontuação do Protocolo):** A avaliação do desempenho tem como métrica oficial a **Pontuação do Protocolo** ($\text{score} = \max(0, 100 - 10 \times \text{erros} - 5 \times \text{dicas})$). O termo "Precisão do Operador" não deve ser usado como sinônimo do score, pois o uso de dicas (`hintsUsed`) também o reduz; `errors` permanece como a métrica factual de decisões incorretas. Comparações, trocas/transferências e tempo decorrido são dados descritivos da natureza assintótica do algoritmo, nunca penalidades ao estudante.
6. **Conexão Tríade Contínua:** Toda ação mecânica do operador é vinculada simultaneamente à transformação física na esteira e à instrução formal correspondente no pseudocódigo.

### 2.2. Congelamento da Metáfora Central
Fica formalmente restrito o vocabulário analógico ao domínio da **Central Logística Espacial/Industrial**:
- **Estação Logística:** Central de triagem;
- **Operador:** O estudante/jogador;
- **Carga / Caixa:** O elemento do vetor;
- **Esteira:** O arranjo sequencial de memória;
- **Protocolo:** O algoritmo de ordenação;
- **Passada:** A iteração do laço externo;
- **Inspeção / Varredura:** A iteração do laço interno;
- **Permuta / Troca (`SWAP`):** Definição transversal de troca física entre duas posições do vetor (adjacente no Bubble Sort, potencialmente de longa distância no Selection Sort; nunca definida genericamente como operação apenas entre vizinhos);
- **Consolidação Definitiva (`OK` / `FIXO`):** Fixação de posição definitivamente consolidada segundo a invariante do protocolo (ex.: após o borbulhamento no Bubble ou o commit no Selection);
- **Região Ordenada Provisória (`ORD`):** Pertence a uma sublista ordenada, mas ainda pode sofrer deslocamentos futuros (conceito que prepara formalmente o futuro Insertion Sort, onde elementos à esquerda estão ordenados entre si mas sujeitos a shifts regressivos).

É vedado o uso de analogias concorrentes (baralhos, livros em estantes, filas de banco ou pastas de escritório).

### 2.3. Padrão Unificado de Telas
Fica estabelecida a hierarquia conceitual obrigatória:
1. **Home Screen:** Hub de Protocolos com cartões simétricos para cada algoritmo, exibindo status de desbloqueio, progresso de fases e recorde;
2. **Briefing Screen:** Tela conceitual orientada a dados (`ProtocolModeBriefingScreen`) com 4 regras operacionais, 3 métricas de destaque e atalhos para Iniciar Turno ou Ver Demonstração;
3. **Tutorial Interativo:** Mini-treinamento com vetor curto ($n=3$), navegação superior com botão de retorno, barra de status de operação, sistema de dicas ativas com card expansível e botoeira contextual;
4. **Gameplay:** Tela com `PhaseHeader`, barra de status com contadores factuais, banner de expressão relacional factual (ex.: $A[j] < A[\text{minIndex}]$), esteira com papéis semânticos `BoxRole` e legenda de cores, barra de progresso visual $0\%$ a $100\%$, painel de feedback explicativo e botoeira contextual com bloqueio mútuo síncrono;
5. **Result Screen:** Vetor resultante consolidado com selos `OK`, cartão de Pontuação do Protocolo, métricas operacionais factuais, bloco canônico de pseudocódigo em português e botão de Replay;
6. **Replay / Modo Demonstração:** Visualização passo a passo derivada puramente do histórico de passos em memória, com barra temporal de reprodução, autoplay com auto-stop e sincronização com pseudocódigo e valores concretos;
7. **Campaign Complete:** Tela consolidada de encerramento da campanha com 5 cartões globais factuais.

### 2.4. Institucionalização do Modo Demonstração sem Duplicação de Código
Demonstração e Replay compartilham o mesmo pipeline de visualização derivado de `history`, mas possuem origem, navegação e finalidade pedagógica distintas: a **Demonstração** é a execução canônica pré-prática para observação inicial orientada pelo sistema, enquanto o **Replay** é a reflexão retrospectiva sobre a execução real do estudante. Ambos utilizam os mesmos componentes e telas de visualização (`ReplayScreen`, `SelectionReplayScreen`, `InsertionReplayScreen`) alimentados por suas respectivas fontes de quadros.

### 2.5. Glossário Canônico Controlado
Terminologia oficial congelada em [`docs/wiki/12-pedagogy-and-academic-traceability.md`](../wiki/12-pedagogy-and-academic-traceability.md) e [`docs/wiki/05-ux-design-system.md`](../wiki/05-ux-design-system.md) para unificar nomenclatura entre código-fonte, interface de usuário e documentação acadêmica.

---

## 3. Consequências e Plano de Ação

### Consequências Positivas:
- Elimina assimetrias visuais e de navegação entre o Bubble Sort e o Selection Sort;
- Estabelece um padrão claro, testável e reutilizável para o desenvolvimento do Insertion Sort (P2.2) e algoritmos subsequentes;
- Evita duplicação de componentes através do reuso da arquitetura de Replay para o Modo Demonstração;
- Fortalece a rastreabilidade pedagógica e a fundamentação metodológica para o artigo acadêmico do projeto.

### Plano Incremental de Refatoração (Sem refactors abruptos):
- **P2.1-G-A:** Auditoria, Charter Educacional, Padrão de Telas, Glossário e criação do ADR 0016 (Concluído);
- **P2.1-G-B:** Padronização visual dos componentes de Tutorial e Gameplay (incorporar barra de status e progresso no Bubble Sort e unificar telas de Campaign Complete);
- **P2.1-G-C:** Hub de Protocolos na Home Screen e atalhos simétricos;
- **P2.1-G-D:** Integração do Modo Demonstração reutilizando os componentes de Replay.
