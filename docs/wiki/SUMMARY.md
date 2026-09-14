# Sorting Station – Wiki Summary

> **Status da Documentação:** Ativo / Canônico  
> **Data da Última Revisão:** 08/09/2026  
> **Branch / Commit Revisado:** `main` (`a886d0a`)  
> 
> *Este documento é o ponto de entrada operacional da Wiki. Ele não substitui as páginas detalhadas.*

---

## 1. O Projeto em 30 Segundos

O **Sorting Station** é um jogo educacional point-and-click para navegadores web ambientado em uma central logística futurista de alta tecnologia. Caixas numeradas dispostas sobre esteiras transportadoras representam elementos discretos de vetores numéricos a serem ordenados.

O objetivo pedagógico central é ensinar algoritmos de ordenação através da execução visual e da manipulação cinestésica direta pelo jogador. Ao invés de apenas assistir passivamente a animações de ordenação, o estudante assume o papel de operador da estação, decidindo ativamente quais elementos comparar e quando executar trocas físicas.

O projeto foi originalmente prototipado no ambiente **Figma Make**, evoluindo para uma aplicação web com identidade visual sci-fi/retro-futurista, conectando ações motoras imediatas, feedback visual na esteira e alinhamento conceitual com pseudocódigo algorítmico.

---

## 2. Estado Atual

| Dimensão | Estado Real Implementado no Repositório |
| :--- | :--- |
| **Frontend** | React 19 (`^19.0.0`), TypeScript 5.7 strict, Vite 8 (`^8.2.2`), Tailwind CSS v4 inline (`@tailwindcss/vite`), Figma Make. |
| **Gameplay** | Bubble Sort didático sequencial estrito integrado à **Bubble Sort Engine pura** em `GameScreen.tsx` (**Milestones P0 e P1.1 a P1.10 concluídos**); botões de decisão pedagógica `[⇄ TROCAR]` e `[= MANTER]`, bloqueio de ações fora de sequência, animação simétrica de swap, fixação determinística (`OK`), cálculo de progresso real; esteira contínua com rolagem horizontal controlada sem quebra em viewports estreitos (`overflow-x-auto min-w-max`); 3 fases progressivas (vetores procedurais determinísticos de 4, 5 e 6 elementos via `src/game/generation/` / ADR 0009); telemetria factual descritiva de erros e dicas; eliminação da heurística arbitrária de eficiência (ADR 0003); **Replay da Execução somente-leitura** com navegação passo a passo, autoplay auto-stop e Quadro 0 inicial derivado deterministicamente de `history` (ADR 0004); **Pseudocódigo Sincronizado no Replay** com modelos canônico e de término antecipado (ADR 0005 e ADR 0008); **Homologação e UX Polish** transversal (P1.5); **Pontuação do Protocolo e Tempo Descritivo** (P1.7 / ADR 0007); **Modo Desafio / Variante Early Exit** (P1.8 / ADR 0008) com motor unificado; **Infraestrutura Global de Geração Procedural de Vetores** (P1.9 / ADR 0009); **Briefing dos Modos de Jogo** (P1.10 / ADR 0010); e **Campanha Jogável do Selection Sort de 3 Fases** (P2.1-D / ADR 0013) com tela dedicada (`SelectionGameScreen`), animação de longa distância com translação proporcional, feedback formativo não punitivo, FSM bimodal estrita, conclusão própria (`SelectionCampaignCompleteScreen`) e isolamento em memória sem mutação do Schema v2. |
| **Telas Existentes** | 10 telas ativas: `HomeScreen` (seleção de modo, briefing e tutorial), `ProtocolModeBriefingScreen` (briefing intermediário orientado a dados com objetivos, passos operacionais, particularidades, destaques de telemetria e geração tardia), `TutorialScreen` (interativa Bubble P1.1), `SelectionTutorialScreen` (interativa Selection P2.1-C sobre vetor [4, 1, 3]), `GameScreen` (Bubble com timer monotônico e suporte a `CANONICAL`/`EARLY_EXIT`), `SelectionGameScreen` (Selection Sort com 3 fases procedurais, scanner sem movimentação e commit com transferência de longa distância — P2.1-D), `ResultScreen` (com destaque da Pontuação do Protocolo, métricas de comparações evitadas no desafio, suporte a Selection e pseudocódigo contextual), `ReplayScreen` (reprodução passo a passo Bubble), `CampaignCompleteScreen` (homologação Bubble) e `SelectionCampaignCompleteScreen` (homologação Selection Sort — P2.1-D). |
| **Backend** | **Inexistente.** Não há servidor de aplicação, microserviços, GraphQL ou endpoints REST. |
| **Persistência** | **Implementada e Desacoplada (P1.6 e P1.7 / ADR 0006 e ADR 0007).** Armazenamento local via `localStorage` (chave canônica `sorting_station_v1_save`, **Schema v2**) gerenciado pelo módulo puro `src/game/persistence/`. Armazena recordes de fase (`bestScore`, `bestScoreErrors`, `bestScoreHintsUsed`, `bestScoreElapsedTimeMs`), com migração transparente retrocompatível de v1 para v2, desempate estritamente por menor número de erros e fallback gracioso em memória. O Modo Desafio e a Campanha de Selection Sort operam puramente em memória mantendo o Schema v2 intacto. Sementes e vetores gerados em P1.9 e P2.1-D permanecem voláteis em memória da sessão sem mutação de schema. |
| **Testes** | **Ativos para Engine, FSM, Campanha, Sessão, Pontuação, Replay, Pseudocódigo, Early Exit, Persistência, Geração Procedural, Briefings e Selection Sort.** Vitest (`vitest ^5.0.0`) instalado e operacional; **229 testes automatizados passando 100% verde** em 14 arquivos de teste: `bubbleSortEngine.test.ts` (39), `bubbleSortFsm.test.ts` (3), `campaignSummary.test.ts` (4), `sessionMetrics.test.ts` (5), `replayModel.test.ts` (11), `replayPseudocode.test.ts` (12), `protocolScore.test.ts` (11), `persistence.test.ts` (39), `arrayGenerator.test.ts` (31), `briefing.test.ts` (16), `selectionSortEngine.test.ts` (18), `selectionConstraints.test.ts` (16), `selectionTutorialGuide.test.ts` (3) e `selectionCampaign.test.ts` (19). Testes de interface React e E2E permanecem planejados. |
| **Outros Algoritmos** | Selection Sort possui **domínio puro, FSM bimodal, geração procedural (`selectionConstraints`), briefing canônico, tutorial interativo guiado e campanha jogável de 3 fases procedurais (P2.1-B, P2.1-C e P2.1-D / ADR 0011, ADR 0012 e ADR 0013)**. Replay Selection, pseudocódigo sincronizado e persistência Schema v3 permanecem pendentes (P2.1 segue em andamento). Insertion Sort, Merge Sort e Quick Sort são futuros. |

---

## 3. Prioridade Atual

Os marcos **P0** (fundação algorítmica da esteira de triagem do Bubble Sort e encerramento da campanha) e as etapas **P1.1 a P1.10** foram integralmente concluídos:
- **P0.1 a P0.8 Concluídos:** Motor algorítmico puro, testes Vitest, integração com `GameScreen`, bloqueio sequencial, fixação determinística, animação simétrica de troca, progresso analítico real e tela de encerramento da campanha (`CampaignCompleteScreen`);
- **P1.1 Concluído:** Tutorial passo a passo interativo sobre vetor `[3, 1, 2]`;
- **P1.2 Concluído:** Telemetria pedagógica local da sessão (`errors` canônicos da engine e `hintsUsed` da camada de sessão), relatório global em 5 cartões e eliminação definitiva da heurística de eficiência (ADR 0003);
- **P1.3 Concluído:** Replay visual da execução derivado puramente de `history: readonly StepRecord[]` (Quadro 0, SWAP/KEEP, autoplay com parada automática, navegação passo a passo e preservação de métricas em memória — ADR 0004);
- **P1.4 Concluído:** Pseudocódigo sincronizado com o replay (`BubbleSortPseudocodePanel`), derivação pura de destaque por frame (`getPseudocodeHighlight`), modelo canônico de 9 instruções, preservação do código genérico e valores concretos separados (ADR 0005);
- **P1.5 Concluído:** Homologação completa e UX Polish do módulo Bubble Sort: esteira contínua e sem quebras em mobile (`overflow-x-auto min-w-max`), acessibilidade por teclado/leitores de tela (`aria-label`, anéis `focus-visible`), `ResultScreen` alinhado com pseudocódigo canônico em português, redução de ruído cognitivo (remoção de tags `#` redundantes no replay) e validação da compatibilidade terminológica com a futura Narrative Layer;
- **P1.6 Concluído:** Persistência local desacoplada via `localStorage` com abstração `StorageAdapter`, schema versionado v1 (`sorting_station_v1_save`), validador defensivo sem dependências, fallback gracioso em memória contra JSON corrompido ou bloqueio de storage, restauração transparente do progresso e tutorial após recarga com F5 (ADR 0006);
- **P1.7 Concluído:** Pontuação do Protocolo canônica (`score = max(0, 100 - errors * 10 - hintsUsed * 5)`), tempo descritivo monotônico com peso zero no score (`elapsedTimeMs`), formatador puro, evolução para Schema v2 com migração retrocompatível transparente e regra de desempate por erros (tempo expressamente fora do desempate) — ADR 0007;
- **P1.8 Concluído:** Modo Desafio / Variante Bubble Sort Early Exit com motor unificado, terminação formal em passadas sem trocas, 3 cenários canônicos, comparação factual de passos evitados vs canônicos, pseudocódigo estendido sincronizado de 14 instruções, acesso na Home e Campaign Complete, Schema v2 preservado e 122 testes Vitest aprovados (ADR 0008);
- **P1.9 Concluído:** Infraestrutura Global de Geração Procedural de Vetores (`src/game/generation/`) com PRNG Mulberry32 determinístico, hash FNV-1a para sementes numéricas e textuais, amostragem Fisher-Yates sem colisões, imutabilidade (`Object.freeze`), preset desacoplado `BUBBLE_CAMPAIGN_CONSTRAINTS`, estratégia de fallback estruturado sem loops infinitos, falha explícita via `ArrayGenerationError` e integração direta na campanha regular (F1: 4, F2: 5, F3: 6 elementos), preservando arrays curados no tutorial e Modo Desafio (ADR 0009);
- **P1.10 Concluído:** Briefing dos Modos de Jogo (`ProtocolModeBriefingScreen` / ADR 0010) com arquitetura orientada a dados (`src/game/briefing/`), desacoplada de engines específicas, tela intermediária explicativa (objetivos, ações na esteira, particularidades teóricas e métricas), botão Voltar sem efeitos colaterais e disparo da geração procedural exclusivamente no clique do CTA de início;
- **P2.1-B Concluído (Núcleo Puro do Selection Sort):** Implementação da Selection Sort Engine pura e FSM bimodal (`INSPECT` e `COMMIT`) em `src/game/sorting/selection/` com invariantes estritas, imutabilidade total (`Object.freeze`), decisões `SELECT_NEW_MIN` / `KEEP_MIN`, confirmação procedimental `commitSelectionPass`, limites matemáticos formais ($n(n-1)/2$ comparações e no máximo $n-1$ trocas) e 18 testes Vitest 100% verdes (ADR 0011);
- **P2.1-C Concluído (Camada Pedagógica, Constraints, Briefing e Tutorial Interativo do Selection Sort):** Constraints procedurais desacopladas (`selectionConstraints.ts`) com predicados matemáticos puros para lotes de 4, 5 e 6 elementos no intervalo 1..99; briefing oficial `SELECTION_CANONICAL_BRIEFING` integrado ao catálogo sem duplicação de JSX; extensão semântica de `NumberedBox` (`ALVO`, `MÍN`, `SCAN`, `OK`); tutorial interativo guiado (`SelectionTutorialScreen.tsx`) com vetor canônico `[4, 1, 3]`, botões contextuais por fase da FSM (`INSPECT` vs `COMMIT`), feedback formativo não punitivo, animação de transferência exclusiva no commit, dicas pedagógicas contextuais e integração segura na Home sem links quebrados (ADR 0012);
- **P2.1-D Concluído (Gameplay e Campanha de 3 Fases do Selection Sort):** Tela própria `SelectionGameScreen.tsx` consumindo `SelectionSortEngine` imutável como única fonte de verdade; botoeira contextual com bloqueio mútuo e trava síncrona; comparação textual explícita ($A[j] < A[minIndex]$); feedback formativo não punitivo; transferência de longa distância com deslocamento horizontal proporcional e elevação vertical (`--swap-distance`); tela dedicada de conclusão `SelectionCampaignCompleteScreen.tsx`; união discriminada de resultados (`GameResult`); adaptação de `ResultScreen.tsx`; persistência puramente em memória da sessão sem alteração do Schema v2 do Bubble Sort; e 19 novos testes automatizados Vitest (totalizando 229 testes) — ADR 0013.

### Próximas Tarefas Mais Importantes
1. **Módulo Selection Sort: Replay e Pseudocódigo Sincronizado (P2.1-E):** Implementação de modelos puros de replay e sincronização de pseudocódigo de Selection Sort;
2. **Módulo Selection Sort: Persistência Multi-Protocolo Schema v3 (P2.1-F):** Migração e gravação de recordes de Selection Sort;
3. **Mapeamento Comparativo Multi-Algoritmo (P2.2):** Execução do mesmo vetor gerado por seed entre Bubble e Selection Sort.

---

## 4. Evolução Recente: Modo Replay, Pseudocódigo Sincronizado e Homologação UX

Com a conclusão dos marcos **P1.1 a P1.5**:
- O `TutorialScreen` transformou-se em uma experiência prática interativa guiada;
- A telemetria da sessão passou a ser **estritamente descritiva e factual**, respondendo *"O que aconteceu durante a sessão?"* sem notas arbitrárias;
- A contagem de decisões incorretas (`errors`) advém unicamente de `gameState.errors` na engine pura;
- A contagem de dicas (`hintsUsed`) é gerenciada de forma isolada e imutável em `src/game/session/sessionMetrics.ts` (ADR 0003);
- A fórmula arbitrária de "Eficiência (%)" foi totalmente removida de `ResultScreen.tsx`;
- A tela final `CampaignCompleteScreen` expõe 5 cartões factuais consolidados;
- O **Modo Replay (`ReplayScreen`)** viabiliza revisão retrospectiva completa passo a passo da fase concluída sem reexecutar o algoritmo e sem resetar métricas (ADR 0004);
- O **Pseudocódigo Sincronizado (`BubbleSortPseudocodePanel`)** conecta a ação da esteira à sintaxe algorítmica formal de forma determinística, destacando o fluxo de execução (`INITIAL`, `KEEP`, `SWAP`) sem reexecução redundante (ADR 0005);
- A **Homologação e UX Polish (P1.5)** eliminou quebras de layout nas esteiras em mobile, adicionou anéis de foco acessíveis, descrições para leitores de tela e unificou o pseudocódigo canônico em toda a aplicação.

> *Detalhamento completo e especificações:* consulte [03 — Frontend](./03-frontend.md), [04 — Sorting Engine](./04-sorting-engine.md), [ADR 0001](../../docs/adr/0001-bubble-sort-fsm-ui-integration.md), [ADR 0002](../../docs/adr/0002-campaign-completion-memory-state.md), [ADR 0003](../../docs/adr/0003-session-metrics-engine-decoupling.md), [ADR 0004](../../docs/adr/0004-execution-replay-state-derivation.md) e [ADR 0005](../../docs/adr/0005-replay-synchronized-pseudocode.md).

---

## 5. Arquitetura Rápida

```mermaid
flowchart TD
    Browser["Navegador Web (Cliente)"]
    
    subgraph FrontendCurrent["Frontend React (Implementado)"]
        ReactUI["Interface de Telas (App.tsx)<br/>Home | Briefing | Tutorial | Game | Result | Replay | Campaign"]
        BriefingScreen["ProtocolModeBriefingScreen.tsx<br/>Orientada a Dados (Objetivos, Instruções, Destaques)"]
        GameScreen["GameScreen.tsx<br/>Decisões TROCAR / MANTER & Animação 500ms"]
        ReplayScreen["ReplayScreen.tsx<br/>Auditoria Passo a Passo (Passo 0..N, Autoplay)"]
        PseudocodeUI["BubbleSortPseudocodePanel.tsx<br/>Pseudocódigo Sincronizado & Valores Concretos"]
    end
    
    subgraph EngineDomain["Camada de Domínio Puro (IMPLEMENTADA)"]
        BriefingDomain["Catálogo de Briefings (src/game/briefing/)<br/>ProtocolModeBriefing, getBriefingForGameMode"]
        SortingEngine["Sorting Engine Pura (src/game/sorting/)<br/>createBubbleSortState, executeUserStep, getExpectedComparison"]
        BubbleSort["BubbleSortState & FSM Canônica (n-1 passadas)"]
        ReplayModel["Modelo Puro de Replay (src/game/replay/)<br/>buildReplayFrames(initialArray, history)"]
        ReplayPseudocode["Mapeamento de Pseudocódigo (src/game/replay/)<br/>getPseudocodeHighlight(frame)"]
        GenerationEngine["Geração Procedural Global (src/game/generation/)<br/>Mulberry32, Fisher-Yates, Constraints & Fallback"]
    end
    
    subgraph FutureAlgorithms["Outros Algoritmos (Planejados - P2)"]
        OtherAlgorithms["Selection / Insertion (Futuro)"]
    end

    Browser --> ReactUI
    ReactUI --> BriefingScreen
    BriefingScreen -.->|Consome Contrato| BriefingDomain
    BriefingScreen ==>|CTA Iniciar| GenerationEngine
    GenerationEngine ==>|GeneratedArrayResult| ReactUI
    ReactUI --> GameScreen
    ReactUI --> ReplayScreen
    ReplayScreen --> PseudocodeUI
    GameScreen ==>|Fonte Única de Verdade (P0.3)| SortingEngine
    SortingEngine --> BubbleSort
    BubbleSort ==>|StepRecord History| ReplayModel
    ReplayModel ==>|ReplayFrame[]| ReplayScreen
    ReplayModel --> ReplayPseudocode
    ReplayPseudocode ==>|Highlight & Contexto| PseudocodeUI
    SortingEngine -.-> OtherAlgorithms
    GenerationEngine -.-> OtherAlgorithms
    BriefingDomain -.-> OtherAlgorithms
```

> **Aviso de Arquitetura:** A **integração da Sorting Engine com o GameScreen, ReplayScreen e BubbleSortPseudocodePanel** está concluída (**P0.1 a P1.4 implementados e validados**). O código-fonte visual consome a FSM, o modelo de replay e a sincronização pura de pseudocódigo como fontes canônicas de verdade.

---

## 6. Fonte de Verdade

Ao analisar ou modificar o projeto, siga rigorosamente a hierarquia de autoridade:

1. **Instrução explícita atual do usuário:** Define o objetivo, escopo e restrições da tarefa atual;
2. **`AGENTS.md`:** Define as regras inegociáveis de governança, restrições técnicas e workflow operacional;
3. **Código-fonte e arquivos de configuração atuais:** Representam a verdade factual e indiscutível sobre o que está efetivamente implementado;
4. **ADRs (`docs/adr/`) e páginas detalhadas da Wiki (`docs/wiki/`):** Representam as decisões arquiteturais aprovadas, visão de produto, especificações técnicas e planejamento;
5. **`docs/wiki/SUMMARY.md`:** Funciona como índice operacional e mapa de navegação rápida, mas **não substitui** a leitura da página detalhada correspondente.

> *Se código e documentação divergirem, o agente deve identificar e resolver ou registrar a divergência; nunca ignorá-la.*

---

## 7. Regra Obrigatória para Agentes

> [!IMPORTANT]
> **QUALQUER AGENTE QUE TRABALHAR NO SORTING STATION DEVE LER ESTE `SUMMARY.md` E AS PÁGINAS RELEVANTES DA WIKI ANTES DE ALTERAR CÓDIGO, DESIGN, DOCUMENTAÇÃO OU ARQUITETURA.**

Após qualquer mudança relevante de gameplay, comportamento, arquitetura, componentes, UX, dependências ou documentação acadêmica, o agente deve revisar e atualizar a Wiki e este `SUMMARY.md` antes de considerar a tarefa finalizada.

$$\text{WIKI} \longrightarrow \text{CONTEXTO} \longrightarrow \text{CÓDIGO} \longrightarrow \text{ALTERAÇÃO} \longrightarrow \text{DOCUMENTAÇÃO}$$

---

## 8. Roteador de Tarefas

Consulte este mapa para identificar imediatamente quais documentos ler antes de atuar em uma área específica:

| Quero trabalhar em... | Leia primeiro | Depois consulte |
| :--- | :--- | :--- |
| **Bubble Sort / gameplay** | [04 — Sorting Engine](./04-sorting-engine.md) | [02 — Arquitetura](./02-system-architecture.md) e [10 — Roadmap](./10-roadmap.md) |
| **Selection Sort** | [04 — Sorting Engine](./04-sorting-engine.md#5-expansão-para-outros-algoritmos) | [01 — Produto](./01-product-vision.md) e [10 — Roadmap](./10-roadmap.md) |
| **Insertion Sort** | [04 — Sorting Engine](./04-sorting-engine.md#5-expansão-para-outros-algoritmos) | [01 — Produto](./01-product-vision.md) e [10 — Roadmap](./10-roadmap.md) |
| **Novos algoritmos** | [10 — Roadmap](./10-roadmap.md#4-nível-p2--expansão-algorítmica-selection-e-insertion) | [11 — Decisões](./11-architecture-decisions.md) e [12 — Pedagogia](./12-pedagogy-and-academic-traceability.md) |
| **Componentes React** | [03 — Front-End](./03-frontend.md) | [05 — Design System](./05-ux-design-system.md) |
| **UI** | [03 — Front-End](./03-frontend.md) | [05 — Design System](./05-ux-design-system.md) e [08 — Qualidade](./08-testing-and-quality.md) |
| **UX / design system** | [05 — Design System](./05-ux-design-system.md) | [01 — Produto](./01-product-vision.md) e [03 — Front-End](./03-frontend.md) |
| **Figma Make** | [06 — Ambiente](./06-development-environment.md) | [09 — Build e Deploy](./09-build-deploy.md) e [AGENTS.md](../../AGENTS.md) |
| **Estado e navegação** | [02 — Arquitetura](./02-system-architecture.md) | [03 — Front-End](./03-frontend.md) |
| **Persistência local** | [07 — Backend e Persistência](./07-backend-and-persistence.md#2-persistência-local-planejada-localstorage) | [11 — Decisões](./11-architecture-decisions.md) |
| **Backend futuro** | [07 — Backend e Persistência](./07-backend-and-persistence.md#3-gatilhos-para-criar-backend) | [11 — Decisões](./11-architecture-decisions.md) |
| **Testes** | [08 — Qualidade e Testes](./08-testing-and-quality.md) | [04 — Sorting Engine](./04-sorting-engine.md) e [11 — Decisões](./11-architecture-decisions.md) |
| **Build / deploy** | [09 — Build e Deploy](./09-build-deploy.md) | [06 — Ambiente](./06-development-environment.md) |
| **Roadmap** | [10 — Roadmap](./10-roadmap.md) | [01 — Produto](./01-product-vision.md) e [04 — Sorting Engine](./04-sorting-engine.md) |
| **Artigo / pedagogia** | [12 — Pedagogia](./12-pedagogy-and-academic-traceability.md) | [01 — Produto](./01-product-vision.md) e [10 — Roadmap](./10-roadmap.md) |
| **ADR / documentação** | [11 — Decisões](./11-architecture-decisions.md) | [Template de ADR](../adr/TEMPLATE.md) e [README.md](./README.md) |

---

## 9. Arquivos Críticos

| Arquivo / Diretório | Responsabilidade e Sensibilidade Operacional |
| :--- | :--- |
| [`AGENTS.md`](../../AGENTS.md) | **Crítico:** Regras inegociáveis do projeto, governança Wiki-First e restrições de tooling. |
| [`docs/wiki/SUMMARY.md`](./SUMMARY.md) | **Crítico:** Ponto de entrada operacional obrigatório e mapa rápido de navegação para agentes. |
| [`docs/wiki/README.md`](./README.md) | **Crítico:** Índice mestre canônico da Wiki, trilhas de leitura e convenções de status. |
| [`src/App.tsx`](../../src/App.tsx) | **Crítico:** Roteador principal de telas (`useState`), definição das fases e controle do loop do jogo. |
| [`src/screens/GameScreen.tsx`](../../src/screens/GameScreen.tsx) | **Crítico:** Tela central de gameplay onde residem o estado da esteira e a lógica de ordenação atual. |
| [`src/index.css`](../../src/index.css) | **Crítico:** Entrypoint global do Tailwind v4 com `@theme inline`, fontes e animações CSS puras. |
| [`package.json`](../../package.json) | **Sensível:** Definição de dependências estritas e scripts de build/preview/format. |
| [`.mise.toml`](../../.mise.toml) | **Sensível:** Travamento de versões das ferramentas de runtime (Node 22 e pnpm 10.34.3). |
| [`vite.config.ts`](../../vite.config.ts) | **Altamente Sensível:** Porta fixa 8443, alias `@` e plugins customizados proprietários do Figma Make. |
| [`.figma/make/`](../../.figma/make) | **Intocável:** Scripts shell do container Figma Make (`dev`, `install`, `deploy`, `site.json`). Não modificar. |

---

## 10. Regras Técnicas Essenciais

As regras abaixo são confirmadas pelo código-fonte e pelas diretrizes de [`AGENTS.md`](../../AGENTS.md):

- **Runtime & Toolchain:** Node.js 22 LTS e pnpm 10.34.3 definidos em `.mise.toml` (compatível com `npm` / `npx`);
- **Frontend Framework:** React 19 (`react` e `react-dom` `^19.0.0`) com TypeScript 5.7 em modo estrito (`strict: true`);
- **Bundler & Dev Server:** Vite 8 (`vite` `^8.2.2`) executando na porta `8443` com `strictPort: true` no host `0.0.0.0`;
- **Tailwind CSS v4:** Utiliza `@tailwindcss/vite` e importação direta `@import 'tailwindcss';` em `src/index.css`;
- **Sem Arquivos Legados de Estilo:** **NÃO** crie `tailwind.config.js/ts` nem arquivos de configuração do PostCSS;
- **Exportação de Componentes:** Todo componente React deve ser exportado como **export default** (`export default ComponentName`);
- **Regras de Strings JSX:** Utilize aspas duplas para strings contendo apóstrofos (`"We're here"`) ou escape-os para não quebrar o parser;
- **Preservação do Figma Make:** Não remova nem simplifique os scripts em `.figma/make/*` e preserve os plugins customizados do Figma presentes em `vite.config.ts`.

---

## 11. Implementado Agora

Funcionalidades factuais e verificáveis em tempo de execução no repositório:

- **`HomeScreen`:** Tela inicial com estética retro-futurista de central logística, esteira decorativa em background e botão "Iniciar Operação";
- **`TutorialScreen`:** Demonstração automatizada e temporizada em 4 etapas guiadas da mecânica de comparação e troca do Bubble Sort;
- **`GameScreen`:** Esteira principal interativa com caixas numeradas, contadores de comparações/trocas, botão de dica, botão de reset e painel de instrução;
- **`ResultScreen`:** Relatório de desempenho pós-fase exibindo estatísticas, barra visual de eficiência calculada, pseudocódigo estático do Bubble Sort e botões de repetir ou avançar;
- **Componentes Reutilizáveis:** `NumberedBox`, `GameButton`, `InstructionPanel`, `PhaseHeader` e `StatsPanel`;
- **Bubble Sort Pure Domain Engine (`src/game/sorting/`):** Módulo desacoplado de React com tipos estritos e funções puras (`createBubbleSortState`, `getExpectedComparison`, `executeBubbleSortStep`, `executeUserStep`, `getSortedIndices`, `isIndexPermanentlySorted`, `calculateTotalExpectedComparisons`), executando a variante canônica de $n-1$ passadas com suporte a histórico completo e validação de passos;
- **Suíte de Testes Automatizados com Vitest (`src/game/sorting/bubbleSortEngine.test.ts`):** 28 testes unitários cobrindo 15 grupos rigorosos (inicialização, par esperado, passo a passo canônico, decisões SWAP/KEEP do jogador, invariantes de consolidação, passadas, histórico, imutabilidade e casos limítrofes `[]`, `[42]`, `[1, 2, 3]`, duplicados e negativos);
- **Mecânica de Jogo Atual (UI):** Seleção livre de qualquer par vizinho ($|i - j| = 1$) em `GameScreen.tsx`, validação de ordem, troca física com animação de $500\text{ms}$ e detecção de vetor 100% ordenado;
- **Fases Ativas:** 3 fases com vetores fixos: Fase 1 ($N=4$: `[5, 2, 4, 1]`), Fase 2 ($N=5$: `[6, 3, 8, 2, 5]`), Fase 3 ($N=6$: `[9, 1, 7, 4, 3, 6]`).

---

## 12. Planejado

Funcionalidades já desenhadas e especificadas na Wiki para desenvolvimento nas próximas etapas:

### P0 (Fundação Pedagógica Imediata)
- **P0.1 Concluído:** Camada de domínio pura do Bubble Sort implementada em `src/game/sorting/`;
- **P0.2 Concluído:** Testes automatizados da Bubble Sort Engine com Vitest (28 testes unitários, 15 grupos);
- **P0.3 (Pendente):** Rastreamento e exibição visual de passada atual e par esperado na esteira;
- **P0.4 (Pendente):** Mecânica de decisão explícita: "Trocar" vs. "Manter Ordem";
- **P0.5 (Pendente):** Bloqueio de ações fora de sequência e feedback explicativo formativo;
- **P0.6 (Pendente):** Travamento determinístico dos elementos consolidados no final da esteira (`sortedBoundary`);
- **P0.7 (Pendente):** Correção do bug de animação de swap bidirecional e tratamento do encerramento final da fase 3.

### P1 (Aperfeiçoamentos Pedagógicos e Persistência)
- Tutorial interativo orientado a ações práticas do jogador;
- Dica contextual baseada no estado exato do ponteiro do algoritmo;
- Replay retrospectivo com linha do tempo de operações;
- Pseudocódigo dinâmico com iluminação síncrona da linha em execução;
- Cálculo refinado de pontuação baseado em precisão algorítmica;
- Persistência local do progresso do operador via `localStorage`.

### P2 (Expansão Algorítmica)
- **Selection Sort:** Mecânica própria de "Scanner de Carga Mínima" com cursor de varredura global e troca única por passada;
- **Insertion Sort:** Mecânica própria de "Desvio e Encaixe" com elevação da caixa ao trilho superior e deslocamento da partição ordenada.

---

## 13. Futuro

Direções estratégicas e visões de longo prazo catalogadas na Wiki:

- **Algoritmos Avançados:** Merge Sort (divisão física da esteira em subestações paralelas), Quick Sort (esteira de particionamento com pivô laser) e Heap Sort (árvore logística vertical);
- **Recursos Comparativos:** Modo Duelo / Comparador simultâneo entre dois algoritmos executando sobre o mesmo vetor de entrada;
- **Visualização de Complexidade:** Painel gráfico dinâmico comparando curvas assintóticas $O(n^2)$ vs. $O(n \log n)$;
- **Backend Condicionado:** Servidor Node/Go introduzido apenas mediante requisitos reais formais (contas, sincronização em nuvem, ranking global);
- **Gestão de Turmas e Docentes:** Dashboard para professores acompanharem turmas, criarem desafios customizados e exportarem métricas de desempenho;
- **Pesquisa Acadêmica Empírica:** Coleta de telemetria anônima estrita (LGPD/GDPR) para sustentar artigos científicos com grupos de controle e testes pré/pós-intervenção.

---

## 14. Backend

> **Não existe backend atualmente.**

O Sorting Station é uma SPA estritamente client-side. Um servidor backend **só deve ser introduzido mediante requisito formal justificado**, tal como:
- Autenticação e contas de usuário;
- Sincronização de progresso entre múltiplos dispositivos;
- Ranking e tabelas de liderança competitivas globais;
- Gestão de salas de aula e relatórios para professores;
- Telemetria centralizada para estudos acadêmicos controlados.

Enquanto esses requisitos não existirem, **a persistência local via `localStorage` deve ser implementada antes de qualquer decisão de servidor**. A introdução de backend exigirá a aprovação de um ADR formal em `docs/adr/`.

---

## 15. Figma Make

> **Figma Make é utilizado como ferramenta de prototipação visual, experimentação de interface e apoio ao design. O código-fonte do repositório é a fonte oficial da implementação.**

- O ambiente do Figma Make provê um container com servidor de desenvolvimento na porta `8443` e visualização embutida;
- A infraestrutura técnica em `.figma/make/*` e os plugins Figma em `vite.config.ts` não devem ser removidos nem alterados;
- Quaisquer discrepâncias visuais devem ser resolvidas tomando o código TypeScript/React do repositório como verdade canônica.

---

## 16. Pedagogia e Artigo Acadêmico

As mecânicas do Sorting Station representam diretamente conceitos da ciência da computação:

| Mecânica de Jogo | Conceito Computacional Formal |
| :--- | :--- |
| **Caixas numeradas na esteira** | Elementos discretos de um vetor em memória ($A[0 \dots n-1]$). |
| **Clique de seleção / Comparação** | Custo operacional de decisão condicional ($C(n)$, teste $A[j] > A[j+1]$). |
| **Animação de Troca (Swap)** | Custo de escrita/movimentação física de dados em memória ($M(n)$). |
| **Passada completa na esteira** | Iteração completa do laço externo ($i = 0 \dots n-2$). |
| **Movimento sequencial (j, j+1)** | Varredura local estrita do laço interno. |
| **Caixa fixada / Selo LOCKED** | Invariante de laço: elemento garantidamente posicionado no final do vetor. |

### Regra Ética de Honestidade Científica
> **É estritamente proibido afirmar que o jogo "melhora a aprendizagem", "reduz a carga cognitiva" ou "é superior a métodos tradicionais" sem dados empíricos reais.**

Como ainda não foram realizados experimentos controlados com estudantes, qualquer texto acadêmico deve utilizar formulações honestas de intenção:
- *"busca auxiliar o modelo mental..."*
- *"foi desenvolvido com o objetivo de..."*
- *"espera-se que a interação direta favoreça..."*

---

## 17. Riscos Abertos

Principais dívidas técnicas e pedagógicas registradas na Wiki após a conclusão do Milestone P0 e ciclo P1:

1. **Ausência de Testes em Componentes React/UI:** A camada de domínio da Sorting Engine, Agregação de Campanha, Guia do Tutorial, Sessão, Replay, Pseudocódigo, Early Exit e Persistência possui 100% de cobertura unitária com Vitest (122 testes passando), mas os componentes visuais React e os fluxos de ponta a ponta ainda não possuem testes automatizados de renderização/E2E (*Documentado em [08 — Qualidade e Testes](./08-testing-and-quality.md)*);
2. **Camada Narrativa Completa Pendente:** Personagens e história detalhada da estação estão planejados para etapa futura após a base dos algoritmos.

> *Dívidas resolvidas em P0 e P1:* Bubble Sort estrito na UI (resolvido por FSM), bug de animação de swap (resolvido por `animatingPair`), progresso real (resolvido por `calculateBubbleSortProgress`), fixação formal de caixas (resolvido por `getSortedIndices` e `sortedBoundary`), encerramento da campanha sem loop (resolvido com `CampaignCompleteScreen` via ADR 0002), telemetria descritiva sem eficiência arbitrária (resolvido via ADR 0003), replay passo a passo sem reexecução (resolvido via ADR 0004), pseudocódigo sincronizado e unificado com o canônico em português (resolvido em P1.4 e P1.5 via ADR 0005), layout contínuo de esteira em mobile com acessibilidade por teclado/leitores de tela (resolvido em P1.5), persistência local desacoplada com restauração transparente pós-F5 (resolvido em P1.6 via ADR 0006), pontuação canônica transparente e tempo descritivo (resolvido em P1.7 via ADR 0007), e variante otimizada Bubble Sort com Early Exit / Modo Desafio (resolvido em P1.8 via ADR 0008).

---

## 18. Roadmap Rápido

```mermaid
timeline
    title Roadmap Evolutivo do Sorting Station
    section P0 : Imediato (CONCLUÍDO)
        Bubble Sort Pedagógico Real : FSM sequencial estrita (IMPLEMENTADO)
        Correção Animação Swap : Animação simétrica (IMPLEMENTADO)
        Encerramento Fase 3 : Homologação da Estação (IMPLEMENTADO - P0.8)
    section P1 : Curto Prazo (CONCLUÍDO)
        Tutorial Interativo : Mini-treinamento com vetor [3,1,2] (IMPLEMENTADO - P1.1)
        Telemetria Factual : Erros e dicas desacoplados (IMPLEMENTADO - P1.2)
        Modo Replay : Revisão passo a passo (IMPLEMENTADO - P1.3)
        Pseudocódigo Sincronizado : Destaque formal por frame (IMPLEMENTADO - P1.4)
        Homologação & UX Polish : Esteira contínua e acessibilidade (IMPLEMENTADO - P1.5)
        Persistência Local : Salvamento via localStorage (IMPLEMENTADO - P1.6)
        Pontuação & Tempo : Score canônico e tempo descritivo (IMPLEMENTADO - P1.7)
        Modo Desafio : Early Exit e comparação assintótica (IMPLEMENTADO - P1.8)
        Geração Procedural : Vetores determinísticos via PRNG (IMPLEMENTADO - P1.9)
        Briefing dos Modos : Telas orientadas a dados (IMPLEMENTADO - P1.10)
    section P2 : Médio Prazo
        Selection Sort : Mecânica de Scanner de Mínimo
        Insertion Sort : Mecânica de Desvio e Encaixe
    section P3 : Longo Prazo
        Algoritmos Avançados : Merge Sort, Quick Sort e Heap Sort
        Narrative Layer Completa : Diálogos de operadores e lore da estação
        Pesquisa Empírica : Telemetria acadêmica e validação de aprendizagem
```

> *Para o detalhamento das tarefas prioritárias e matriz completa de riscos:* consulte [10 — Roadmap](./10-roadmap.md).

---

## 19. Índice da Wiki

Catálogo com link relativo e recomendação de leitura para todos os documentos temáticos e operacionais:

- [00 — Inventário Factual do Repositório](./00-repository-inventory.md)  
  *Quando ler:* Antes de iniciar qualquer trabalho, para conhecer todos os arquivos reais, toolchain e dependências.
- [01 — Visão de Produto e Modelo Pedagógico](./01-product-vision.md)  
  *Quando ler:* Para entender o problema educacional, a metáfora da central logística e os princípios norteadores de design.
- [02 — Arquitetura do Sistema e Fluxo de Dados](./02-system-architecture.md)  
  *Quando ler:* Para compreender o chaveamento de telas em `App.tsx`, ciclo de vida do estado e a integração da engine.
- [03 — Manual de Engenharia Front-End](./03-frontend.md)  
  *Quando ler:* Ao criar ou modificar telas e componentes React, tipagens, props, animações e convenções de código.
- [04 — Motor de Ordenação e Máquina de Estados](./04-sorting-engine.md)  
  *Quando ler:* Antes de alterar a lógica de ordenação, para compreender a FSM de Bubble Sort e o plano para novos algoritmos.
- [05 — Sistema de Design, UX e Vocabulário](./05-ux-design-system.md)  
  *Quando ler:* Ao ajustar estilos visuais, tokens cromáticos, fontes (*Orbitron, Space Mono, Exo 2*) e componentes visuais.
- [06 — Ambiente de Desenvolvimento e Figma Make](./06-development-environment.md)  
  *Quando ler:* Para operar o ambiente conteinerizado do Figma Make, porta 8443, HMR e scripts em `.figma/make/*`.
- [07 — Backend, Persistência e Limites](./07-backend-and-persistence.md)  
  *Quando ler:* Ao trabalhar com persistência em `localStorage` ou avaliar a introdução de infraestrutura de servidor e LGPD.
- [08 — Testes, Qualidade e Definition of Done](./08-testing-and-quality.md)  
  *Quando ler:* Para consultar a pirâmide de testes com Vitest e os checklists de Definition of Done (DoD).
- [09 — Processo de Compilação, Build e Deploy](./09-build-deploy.md)  
  *Quando ler:* Ao preparar compilações de produção, validar bundles `dist/` e inspecionar scripts de deploy do Figma Make.
- [10 — Roadmap de Evolução Técnica e Pedagógica](./10-roadmap.md)  
  *Quando ler:* Para consultar prioridades estratégicas (P0 a P3), matriz de riscos e a sequência recomendada das próximas tarefas.
- [11 — Registro de Decisões Arquiteturais (ADRs)](./11-architecture-decisions.md)  
  *Quando ler:* Ao propor mudanças estruturais ou registrar uma nova decisão arquitetural no repositório.
- [12 — Pedagogia, Rastreabilidade e Rigor Científico](./12-pedagogy-and-academic-traceability.md)  
  *Quando ler:* Ao preparar materiais didáticos, redigir artigos acadêmicos ou alinhar mecânicas a conceitos teóricos.
- [QA — Checklist Operacional de Gameplay](./qa-gameplay-checklist.md)  
  *Quando ler:* Roteiro operacional para validar manualmente alterações de gameplay, animações e regressões de FSM.

---

## 20. Checklist Antes de uma Tarefa

Antes de iniciar qualquer modificação de código ou documentação, confirme:

- [ ] Li `AGENTS.md` e compreendi as regras do projeto.
- [ ] Li este `SUMMARY.md` para situar o contexto da tarefa.
- [ ] Li o `README.md` da Wiki.
- [ ] Li as páginas detalhadas da Wiki diretamente relacionadas à tarefa.
- [ ] Li os ADRs aplicáveis em `docs/adr/`, se existirem.
- [ ] Verifiquei o estado real implementado no código-fonte correspondente.
- [ ] Sei com precisão o que está efetivamente implementado no momento.
- [ ] Sei com precisão o que é apenas planejamento ou visão futura.
- [ ] Identifiquei arquivos e pastas sensíveis (`vite.config.ts`, `.figma/make/*`).
- [ ] Entendi quais regras técnicas e convenções de código se aplicam.

---

## 21. Checklist Depois de uma Tarefa

Antes de considerar qualquer alteração concluída e reportar ao usuário, confirme:

- [ ] A alteração atendeu estritamente à intenção solicitada pelo usuário.
- [ ] Build executado com sucesso (`npm run build`) sem quebrar a compilação.
- [ ] Verificação de tipos executada com sucesso (`npx tsc --noEmit`) sem erros TypeScript.
- [ ] Testes executados quando aplicável.
- [ ] Wiki revisada para avaliar o impacto da modificação realizada.
- [ ] Página técnica da Wiki afetada foi devidamente atualizada.
- [ ] `docs/wiki/SUMMARY.md` atualizado se o estado, arquitetura, prioridades ou riscos mudaram.
- [ ] ADR criado ou alterado em `docs/adr/` caso tenha havido decisão arquitetural relevante.
- [ ] Roadmap atualizado se o estado de alguma funcionalidade mudou.
- [ ] Nenhuma funcionalidade planejada ou futura foi documentada incorretamente como pronta.
