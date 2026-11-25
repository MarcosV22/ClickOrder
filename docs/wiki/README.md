# Wiki do Sorting Station: Índice Canônico e Base de Conhecimento

> **Índice Mestre da Wiki:** Ponto de entrada canônico e mapa de navegação documental da plataforma **Sorting Station**.  
> **Status:** Ativo / Base de Verdade da Plataforma  
> **Data de Atualização:** 24/11/2026 (Marco UX-REDESIGN-R3-B: Avaliação Formativa Multi-Módulo Preparada)  
> **Governança:** [`AGENTS.md`](../../AGENTS.md), [`ADR 0018`](../adr/0018-game-to-educational-platform-transition.md), [`SUMMARY.md`](./SUMMARY.md).

---

## Comece por aqui

> Para qualquer agente ou desenvolvedor ingressando no projeto, leia primeiro [`SUMMARY.md`](./SUMMARY.md). Em seguida, consulte as páginas específicas relacionadas à sua tarefa. O arquivo [`AGENTS.md`](../../AGENTS.md) contém as regras obrigatórias e restrições inegociáveis do projeto.

---

## Para Agentes e Desenvolvedores (Mandatory Preflight)

- **Preflight Obrigatório:** Todo agente de IA, desenvolvedor, designer, testador ou pesquisador DEVE iniciar qualquer tarefa consultando a Wiki antes de tomar decisões ou modificar arquivos de código.
- **Ponto de Entrada Recomendado:** O arquivo [`docs/wiki/SUMMARY.md`](./SUMMARY.md) é o sumário operacional e mapa de navegação canônico do repositório.
- **Consulta Obrigatória a Páginas Detalhadas:** O `SUMMARY.md` funciona como índice e mapa, mas NÃO substitui a leitura atenta das páginas temáticas detalhadas correspondentes ao escopo da tarefa.
- **Hierarquia de Verdade e Código:** Em caso de divergência entre a Wiki e o código, o agente deve verificar o estado real implementado, agir com base nele e atualizar a documentação afetada.
- **Princípio Operacional Contínuo:**
  $$\text{LER A WIKI} \longrightarrow \text{ENTENDER O CONTEXTO} \longrightarrow \text{VERIFICAR O CÓDIGO} \longrightarrow \text{EXECUTAR} \longrightarrow \text{ATUALIZAR A WIKI}$$

---

## 1. Visão Canônica do Produto

O **Sorting Station** é uma **plataforma educacional interativa e gamificada para aprendizagem, prática e visualização de algoritmos de ordenação**. A identidade de **Central Logística Espacial/Industrial** permanece como metáfora visual e camada de gamificação (cargas numeradas, esteiras mecânicas, operadores de triagem, badges e pontuações de protocolo).

O objetivo pedagógico central é **ensinar algoritmos de ordenação por manipulação cinestésica direta governada por FSMs estritas**, superando a passividade de animações tradicionais e articulando:
1. **Ação do estudante** (tomada de decisão reflexiva `SWAP`/`KEEP` ou `INSPECT`/`COMMIT`);
2. **Representação visual concreta** (esteira de roletes com caixas animadas e papéis semânticos `BoxRole`);
3. **Ancoragem formal em pseudocódigo** (sincronização determinística linha a linha em tempo real).

### Stack Tecnológica Real e Confirmada
- **Ambiente de Execução:** Sandbox conteinerizada do **Figma Make** (Porta padrão `8443`, HMR dinâmico);
- **Toolchain:** Node.js 22 LTS, pnpm 10.34.3 (compatível com `npm` / `npx`), TypeScript 5.7 (Strict Mode);
- **Frontend Core:** React 19 (`react` e `react-dom` `^19.0.0`), Vite 8 (`vite` `^8.0.5`);
- **Estilização e Design:** Tailwind CSS v4 (`@tailwindcss/vite` e `tailwindcss` `^4.0.0`) com tokens `@theme inline`, sem arquivos legados de configuração;
- **Formatador:** `oxfmt` (baseado em Rust/Biome);
- **Testes Automatizados:** **Vitest** com **745 testes unitários e comportamentais automatizados** em 60 arquivos de teste (100% verde);
- **Persistência:** Single Page Application (SPA) client-side com armazenamento local desacoplado via **`localStorage` (Schema v4)** e fallback defensivo em memória.

---

## 2. Catálogo Geral de Documentos da Wiki

### 2.1. Arquitetura, Engenharia e Fundamentos
| Nº | Documento Canônico | Status Predominante | Resumo do Conteúdo |
| :---: | :--- | :---: | :--- |
| **00** | [`00-repository-inventory.md`](00-repository-inventory.md) | `IMPLEMENTADO` | Inventário técnico de todos os arquivos, stack, dependências, scripts e base de verdade. |
| **01** | [`01-product-vision.md`](01-product-vision.md) | `IMPLEMENTADO` | Redefinição da plataforma educacional, objetivos, princípios e reposicionamento de gamificação. |
| **02** | [`02-system-architecture.md`](02-system-architecture.md) | `IMPLEMENTADO` | Roteamento de telas, topologia em camadas, hub de módulos e desacoplamento. |
| **03** | [`03-frontend.md`](03-frontend.md) | `IMPLEMENTADO` | Manual do front-end, catálogo de componentes, props, convenções e regras de estilo. |
| **04** | [`04-sorting-engine.md`](04-sorting-engine.md) | `IMPLEMENTADO` | Arquitetura das engines puras, FSMs de Bubble e Selection Sort e catálogo de algoritmos. |
| **05** | [`05-ux-design-system.md`](05-ux-design-system.md) | `IMPLEMENTADO` | Design System sci-fi, tokens cromáticos, tipografia, efeitos e vocabulário UX. |
| **06** | [`06-development-environment.md`](06-development-environment.md) | `IMPLEMENTADO` | Guia operacional do Figma Make, porta 8443, HMR, scripts `.figma/make/*` e checklist de build. |
| **07** | [`07-backend-and-persistence.md`](07-backend-and-persistence.md) | `IMPLEMENTADO` | Persistência Schema v4 modular por `exerciseSets` e fallback defensivo em memória. |
| **08** | [`08-testing-and-quality.md`](08-testing-and-quality.md) | `IMPLEMENTADO` | Suíte Vitest (745 testes em 60 arquivos), pirâmide de qualidade e critérios de Definition of Done. |
| **09** | [`09-build-deploy.md`](09-build-deploy.md) | `IMPLEMENTADO` | Pipeline estático Vite, empacotamento `dist.tar.gz`, `FIGMA_PUBLIC_URL` e checklist pré-deploy. |
| **10** | [`10-roadmap.md`](10-roadmap.md) | `HISTÓRICO` / `CANÔNICO` | Histórico Legacy, ciclo UX-REDESIGN (R1 a R7) e Novo Roadmap Canônico da Plataforma. |
| **11** | [`11-architecture-decisions.md`](11-architecture-decisions.md) | `IMPLEMENTADO` | Governança de ADRs, índice formal de ADRs 0001 a 0029 e catálogo de candidatos. |
| **12** | [`12-pedagogy-and-academic-traceability.md`](12-pedagogy-and-academic-traceability.md) | `IMPLEMENTADO` | Rastreabilidade pedagógica, rigor científico, modo demonstração e inventário de seções do artigo. |
| **V2** | [`ux-redesign-v2.md`](ux-redesign-v2.md) | `ATIVO` | Redesenho integral da UX/UI V2: auditoria de poluição, hierarquia em 3 níveis, wireframes e aprendizagem ativa. |
| **AUD**| [`ux-practice-r3-comparative-audit.md`](ux-practice-r3-comparative-audit.md) | `ATIVO` | Auditoria comparativa visual, funcional e pedagógica das 3 Práticas Básicas V2 (`UX-PRACTICE-R3` a `R3.2`). |
| **EVA**| [`bubble-v2-formative-evaluation.md`](bubble-v2-formative-evaluation.md) | `PREPARADO` | Protocolo consolidado de avaliação formativa presencial (`UX-REDESIGN-R3-B` — Bubble, Selection e Insertion; não aplicado). |
| **KIT**| [`evaluation/README.md`](evaluation/README.md) | `PREPARADO` | Kit operacional `Itens A a K` (roteiros, fichas, rubrica `0–3`, transferência `[4, 1, 3, 2]`, ética, checklist e CSVs vazios). |
| **EXP**| [`learning-experience-expansion.md`](learning-experience-expansion.md) | `ATIVO` | Especificação dos marcos de diferenciação curricular e Casos do Algoritmo. |
| **LAB**| [`comparison-lab.md`](comparison-lab.md) | `BLOQUEADO (P3.4)` | Especificação técnica do Laboratório Comparativo (bloqueado até os 6 módulos estarem prontos). |
| **QA** | [`qa-gameplay-checklist.md`](qa-gameplay-checklist.md) | `IMPLEMENTADO` | Roteiro operacional e matriz de testes manuais/homologação de mecânicas e regressão. |

### 2.2. Módulos Curriculares Oficiais (`docs/wiki/modules/`)
| Módulo | Documento | Status Factual | Resumo e Ordem Curricular |
| :--- | :--- | :---: | :--- |
| **Padrão** | [`modules/README.md`](modules/README.md) | `ATIVO` | Module Standard de 20 seções, catálogo e taxonomia transversal de exercícios (A a H). |
| **01. Bubble Sort** | [`modules/bubble-sort.md`](modules/bubble-sort.md) | `IMPLEMENTADO` | Comparação e troca local adjacente, invariante de bolha, piloto do Redesign V2. |
| **02. Selection Sort** | [`modules/selection-sort.md`](modules/selection-sort.md) | `IMPLEMENTADO` | Varredura de mínimo global com scanner e permuta pontual por elevação no final da passada. |
| **03. Insertion Sort** | [`modules/insertion-sort.md`](modules/insertion-sort.md) | `IMPLEMENTADO` | Inserção ordenada em sublista mantida à esquerda com deslocamentos sucessivos (*shifts*). |
| **04. Merge Sort** | [`modules/merge-sort.md`](modules/merge-sort.md) | `CONGELADO (P3.1)` | Divisão e conquista recursiva com intercalação de sub-esteiras ordenadas. |
| **05. Quick Sort** | [`modules/quick-sort.md`](modules/quick-sort.md) | `CONGELADO (P3.2)` | Particionamento com pivô e recursão sobre sub-vetores independentes. |
| **06. Heap Sort** | [`modules/heap-sort.md`](modules/heap-sort.md) | `CONGELADO (P3.3)` | Estrutura de dados Max-Heap, afundamento (*sift-down*) e ordenação in-place. |

---

## 3. Repositório de Decisões Arquiteturais ([`docs/adr/`](../adr/))

- [`0001-bubble-sort-fsm-ui-integration.md`](../adr/0001-bubble-sort-fsm-ui-integration.md) (FSM Bubble Sort)
- [`0002-campaign-completion-memory-state.md`](../adr/0002-campaign-completion-memory-state.md) (Memória de Campanha)
- [`0003-session-metrics-engine-decoupling.md`](../adr/0003-session-metrics-engine-decoupling.md) (Telemetria Desacoplada)
- [`0004-execution-replay-state-derivation.md`](../adr/0004-execution-replay-state-derivation.md) (Replay Ponto-a-Ponto)
- [`0005-replay-synchronized-pseudocode.md`](../adr/0005-replay-synchronized-pseudocode.md) (Pseudocódigo Sincronizado)
- [`0006-decoupled-local-storage-persistence.md`](../adr/0006-decoupled-local-storage-persistence.md) (Persistência Schema v1)
- [`0007-protocol-score-and-descriptive-elapsed-time.md`](../adr/0007-protocol-score-and-descriptive-elapsed-time.md) (Pontuação do Protocolo)
- [`0008-bubble-sort-early-exit-variant.md`](../adr/0008-bubble-sort-early-exit-variant.md) (Early Exit Bubble)
- [`0009-global-procedural-array-generation.md`](../adr/0009-global-procedural-array-generation.md) (PRNG Mulberry32)
- [`0010-reusable-data-driven-mode-briefing.md`](../adr/0010-reusable-data-driven-mode-briefing.md) (Briefing Reutilizável)
- [`0011-selection-sort-engine-and-fsm.md`](../adr/0011-selection-sort-engine-and-fsm.md) (Engine Selection Sort)
- [`0012-selection-sort-pedagogical-layer-and-interactive-tutorial.md`](../adr/0012-selection-sort-pedagogical-layer-and-interactive-tutorial.md) (Tutorial Selection Sort)
- [`0013-selection-sort-gameplay-and-three-phase-campaign.md`](../adr/0013-selection-sort-gameplay-and-three-phase-campaign.md) (Gameplay Selection Sort)
- [`0014-selection-sort-replay-and-synchronized-pseudocode.md`](../adr/0014-selection-sort-replay-and-synchronized-pseudocode.md) (Replay Selection Sort)
- [`0015-multi-protocol-persistence-schema-v3.md`](../adr/0015-multi-protocol-persistence-schema-v3.md) (Persistência Schema v3)
- [`0016-educational-charter-and-cross-protocol-standardization.md`](../adr/0016-educational-charter-and-cross-protocol-standardization.md) (Charter Educacional)
- [`0017-canonical-demonstration-mode.md`](../adr/0017-canonical-demonstration-mode.md) (Modo Demonstração)
- [`0018-game-to-educational-platform-transition.md`](../adr/0018-game-to-educational-platform-transition.md) (Transição para Plataforma Educacional)
- [`0019-insertion-sort-pedagogical-layer-and-interactive-tutorial.md`](../adr/0019-insertion-sort-pedagogical-layer-and-interactive-tutorial.md) (Tutorial Insertion Sort)
- [`0020-insertion-sort-interactive-practice-system.md`](../adr/0020-insertion-sort-interactive-practice-system.md) (Gameplay Insertion Sort)
- [`0021-module-exercise-persistence-schema-v4.md`](../adr/0021-module-exercise-persistence-schema-v4.md) (Persistência Schema v4)
- [`0022-canonical-exercise-module-standardization.md`](../adr/0022-canonical-exercise-module-standardization.md) (Standard de Módulos)
- [`0023-merge-sort-pedagogical-mechanical-design.md`](../adr/0023-merge-sort-pedagogical-mechanical-design.md) (Design Merge Sort)
- [`0024-quick-sort-pedagogical-mechanical-design.md`](../adr/0024-quick-sort-pedagogical-mechanical-design.md) (Design Quick Sort)
- [`0025-curriculum-practice-differentiation-and-transversal-model.md`](../adr/0025-curriculum-practice-differentiation-and-transversal-model.md) (Diferenciação Curricular)
- [`0026-algorithm-case-architecture-and-activity-context.md`](../adr/0026-algorithm-case-architecture-and-activity-context.md) (Infraestrutura de Casos do Algoritmo)
- [`0027-educational-and-ui-experience-redesign-v2.md`](../adr/0027-educational-and-ui-experience-redesign-v2.md) (Redesenho Integral UX/UI V2)
- [`0028-home-redesign-ux-home-r1.md`](../adr/0028-home-redesign-ux-home-r1.md) (Redesign da Tela Inicial `UX-HOME-R1`)
- [`0029-visual-educational-launcher-ux-home-r2.md`](../adr/0029-visual-educational-launcher-ux-home-r2.md) (Launcher Educacional Visual `UX-HOME-R2`)
