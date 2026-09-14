# 17. Modo Demonstração Educacional Canônico Baseado em Execução Autônoma de Engines Reais

- **Status:** Aprovado
- **Data:** 2026-09-14
- **Decisores:** Antigravity, Marcos Mendes
- **Contexto da Tarefa:** P2.1-G-D (Institucionalização do Modo Demonstração Educacional)
- **Documentos Relacionados:**
  - [`docs/wiki/12-pedagogy-and-academic-traceability.md`](../wiki/12-pedagogy-and-academic-traceability.md)
  - [`docs/wiki/03-frontend.md`](../wiki/03-frontend.md)
  - [`docs/wiki/05-ux-design-system.md`](../wiki/05-ux-design-system.md)
  - [`docs/wiki/10-roadmap.md`](../wiki/10-roadmap.md)
  - ADRs anteriores: [`0004`](./0004-execution-replay-state-derivation.md), [`0005`](./0005-replay-synchronized-pseudocode.md), [`0011`](./0011-selection-sort-engine-fsm.md), [`0014`](./0014-selection-sort-replay-and-synchronized-pseudocode.md), [`0015`](./0015-multi-protocol-persistence-schema-v3.md), [`0016`](./0016-educational-charter-and-cross-protocol-standardization.md).

---

## 1. Contexto e Motivação

O **Charter Educacional** consolidado no ADR 0016 estabelece uma estrutura pedagógica obrigatória de 6 camadas para cada protocolo:
$$\text{Briefing Conceitual} \longrightarrow \text{Demonstração Visual} \longrightarrow \text{Tutorial Guiado} \longrightarrow \text{Gameplay Interativo} \longrightarrow \text{Resultado Factual} \longrightarrow \text{Replay/Reflexão}$$

Embora as fases interativas (Tutorial, Gameplay, Resultado e Replay) já estivessem implementadas para Bubble Sort e Selection Sort, faltava a camada de **Modo Demonstração Educacional**: uma experiência observacional onde o estudante pode ver uma execução canônica, perfeita e explicada antes de executar o protocolo manualmente.

Algumas abordagens inadequadas poderiam comprometer a integridade do sistema:
1. Gravação de vídeos pré-renderizados ou animações manuais estáticas (perderiam a sincronização de pseudocódigo, o suporte a resoluções responsivas e aumentariam drasticamente o bundle);
2. Duplicação de lógica dos algoritmos em componentes React ou geradores ad-hoc;
3. Confusão entre Demonstração e Replay (tratar ambos como a mesma tela ou registrar execuções canônicas como se fossem saves do aluno no `localStorage`).

Fez-se necessário formalizar uma arquitetura limpa, pura e reutilizável para o Modo Demonstração.

---

## 2. Decisão Arquitetural e Pedagógica

### 2.1. Distinção Conceitual Rigorosa: Demonstração vs. Replay

Fica formalizada a separação inegociável entre os dois modos:
- **MODO DEMONSTRAÇÃO:** Execução canônica, correta e perfeita preparada autonomamente pelo sistema a partir de um vetor curado fixo. Objetivo: **Observação passiva e aprendizado inicial** da dinâmica do protocolo. É 100% volátil, não possui pontuação, erros ou dicas, e não altera o `localStorage` nem o Schema v3 de persistência.
- **MODO REPLAY:** Reconstrução factual e estrita da execução histórica previamente realizada pelo próprio jogador durante uma fase da campanha. Objetivo: **Reflexão pós-ação**, autoavaliação de erros e consolidação de aprendizado.

### 2.2. Camada Pura de Demonstração (`src/game/demonstration/`)

A geração da demonstração canônica é puramente funcional e utiliza as **ENGINES REAIS** do jogo:
- `bubbleDemonstration.ts`: Instancia `createBubbleSortState([5, 2, 4, 1])`, obtém a decisão teórica correta via `getExpectedComparison(state)` e avança iterativamente com `executeUserStep(state, expectedDecision)` até `state.completed === true`.
- `selectionDemonstration.ts`: Instancia `createSelectionSortState([4, 1, 3])`, obtém a decisão de inspeção via `getExpectedSelectionInspection(state)` e executa `executeSelectionInspection`, além de disparar `commitSelectionPass` quando a varredura termina, até `state.completed === true`.
- `index.ts`: Fornece o helper unificado `getDemonstrationExecution(protocol)`.

É terminantemente vedado criar demonstrações por arrays estáticos de frames manuais (`frame1 = ...`) ou reimplementar os algoritmos em paralelo.

### 2.3. Vetores Curados Fixos

Os vetores de demonstração são congelados (`Object.freeze`) e pedagogicamente projetados:
- **Bubble Sort:** `[5, 2, 4, 1]` — 4 elementos que exercitam tanto permutações consecutivas (`SWAP`) quanto manutenções de ordem (`KEEP`), múltiplos ciclos externos e consolidação progressiva no final da esteira.
- **Selection Sort:** `[4, 1, 3]` — 3 elementos que demonstram claramente a eleição do candidato inicial, atualização de mínimo (`SELECT_NEW_MIN`), manutenção de candidato (`KEEP_MIN`), varredura completa e transferência pontual no commit.

### 2.4. Apresentação e Reutilização de Infraestrutura

O componente `DemonstrationScreen` orquestra a visualização delegando a renderização para `ReplayScreen` ou `SelectionReplayScreen` operando sob a prop `mode="demonstration"`:
1. **Cabeçalho:** Exibe badge de modo de sistema `MODO DEMONSTRAÇÃO // EXECUÇÃO CANÔNICA`, título `PROTOCOLO [NOME] / DEMONSTRAÇÃO` e botão contextual `← VOLTAR`;
2. **Pseudocódigo Sincronizado:** Reutiliza `getPseudocodeHighlight` e `getSelectionPseudocodeHighlight`, destacando em tempo real a linha ativa e o contexto factual da comparação;
3. **Controles de Autoplay:** Botões `↺ REINICIAR`, `← ANTERIOR`, `▶ / ⏸ REPRODUZIR/PAUSAR`, `PRÓXIMO →` e seletor de velocidades em tempo real (`0.5x`, `1x`, `2x`);
4. **Call to Action de Treinamento:** Botão `▶ INICIAR TREINAMENTO` disponível ao final da demonstração para transição fluida ao gameplay/tutorial.

### 2.5. Navegação Bidirecional com Contexto de Origem

O ponto de entrada para o Modo Demonstração é duplo:
- **Origem Home:** Ao clicar em `[ 👁 DEMONSTRAÇÃO ]` no card do protocolo, navega para a demo e, ao clicar em `← VOLTAR`, retorna diretamente para a Home;
- **Origem Briefing:** Ao clicar em `[ 👁 VER DEMONSTRAÇÃO ]` no rodapé do briefing, navega para a demo e, ao clicar em `← VOLTAR`, retorna para o mesmo briefing de origem, mantendo o estado do modal.

---

## 3. Consequências e Trade-offs

### Benefícios:
1. **Zero Duplicação de Regras de Negócio:** As engines oficiais continuam sendo a única fonte da verdade para o comportamento dos algoritmos;
2. **Isolamento de Efeitos Colaterais:** Demonstrações não gravam no storage nem poluem o histórico de pontuações do jogador;
3. **Alto Valor Didático:** Permite ao aluno internalizar o fluxo de execução antes de ser submetido a tomadas de decisão sob avaliação de pontuação;
4. **Totalmente Testável:** Cobertura de testes unitários garante determinismo, 100% de precisão teórica e correspondência 1:1 de frames.

---

## 4. Checklist de Verificação

- [x] Vetores curados congelados `[5, 2, 4, 1]` (Bubble) e `[4, 1, 3]` (Selection);
- [x] Geração autônoma usando `BubbleSortEngine` e `SelectionSortEngine`;
- [x] Helper unificado `getDemonstrationExecution(protocol)`;
- [x] Interface `DemonstrationScreen` conectada ao catálogo e ao `App.tsx`;
- [x] Controles de velocidade `0.5x`, `1x`, `2x` em ambos os visores;
- [x] Botões `DEMONSTRAÇÃO` ativos na Home para Bubble e Selection, e desabilitado para Insertion (`coming_soon`);
- [x] Ação secundária `VER DEMONSTRAÇÃO` nos briefings canônicos de Bubble e Selection;
- [x] Navegação bidirecional preservando contexto de origem (Home ou Briefing);
- [x] Todos os 303 testes unitários passam sem regressões.
