# ADR 0022: Padronização Visual e Estrutural de Bubble Sort e Selection Sort como Módulos de Exercícios (PLATFORM-R1-B)

## Status

**Aceito** (17/09/2026 / PLATFORM-R1-B)

## Contexto

Com a homologação da Carta Educacional (ADR 0016), a transição arquitetural para plataforma de aprendizagem (ADR 0018) e a introdução da persistência modular orientada a exercícios no Schema v4 (ADR 0021), o módulo **Insertion Sort** foi concebido e implementado utilizando o vocabulário e o modelo canônico da plataforma:
- **Módulo de Ensino** em vez de "Protocolo/Modo Isolado";
- **Conjunto de Práticas Curriculares** (`basic`, `intermediate`, `advanced`) com tamanhos progressivos ($n=4, 5, 6$) em vez de "Fases da Campanha (Fase 1, 2, 3)";
- **Exercício Concluído** em vez de "Fase Concluída";
- **Conclusão de Conjunto de Práticas** (`PracticeSetCompleteScreen`) em vez de telas duplicadas de "Campanha Completa";
- **Seletor de Práticas** desacoplado em vez de progressão linear compulsória para usuários recorrentes.

No entanto, os módulos **Bubble Sort** e **Selection Sort** ainda carregavam forte herança vocabular e estrutural do projeto quando concebido como jogo:
1. Menções a "FASE 1/3", "FASE 2/3", "CAMPANHA";
2. Early Exit do Bubble Sort posicionado como se fosse uma "Fase 4" ou continuação direta da campanha regular;
3. Telas duplicadas de conclusão de campanha (`CampaignCompleteScreen` e `SelectionCampaignCompleteScreen`) com JSX redundante;
4. Usuários recorrentes eram forçados a refazer a Fase 1 ao reabrir um módulo, sem um seletor visual de exercícios;
5. Cabeçalhos e botões com linguagem heterogênea.

## Decisão de Arquitetura

1. **Adoção do Catálogo Curricular Transversal (`src/game/curriculum/`):**
   - Criação de tipos unificados (`PracticeLevel`, `PracticeStatus`, `PracticeDefinition`, `PracticeProgressState`);
   - Catálogo canônico imutável (`practiceCatalog.ts`) mapeando Bubble, Selection e Insertion diretamente aos identificadores Schema v4 (`bubble.practice.basic`, `selection.practice.intermediate`, etc.);
   - Derivação determinística de disponibilidade a partir do Schema v4: Básica sempre disponível; Intermediária desbloqueada após Básica; Avançada desbloqueada após Intermediária. Usuários recorrentes podem escolher livremente qualquer prática desbloqueada.

2. **Criação do Seletor Canônico de Práticas (`PracticeSelector.tsx`):**
   - Interface responsiva com 3 cards de práticas (Básica: 4 cargas, Intermediária: 5 cargas, Avançada: 6 cargas);
   - Badges de status: `DISPONÍVEL`, `BLOQUEADA`, `CONCLUÍDA`;
   - Telemetria de melhor pontuação, erros, dicas e tempo para práticas já concluídas;
   - Desacoplamento do Early Exit no Bubble Sort: apresentado como **CASO ESPECIAL: EARLY EXIT / MODO DESAFIO**, desbloqueado deterministicamente apenas quando todas as 3 práticas regulares forem concluídas;
   - Respeito estrito à *Scrollable Screen Rule* e *Single Scroll Owner* (PLATFORM-UI-H1).

3. **Padronização Visual das Telas de Exercício:**
   - `PhaseHeader.tsx`: Generalizado para aceitar `moduleTitle` e `practiceTitle`, com badges dinâmicos de pílula e botão para retornar ao Seletor de Práticas;
   - `GameScreen.tsx` e `SelectionGameScreen.tsx`: Cabeçalhos atualizados para `MÓDULO BUBBLE SORT — PRÁTICA X` e `MÓDULO SELECTION SORT — PRÁTICA X`, eliminando termos "Fase X/3";
   - Preservação estrita das mecânicas singulares: Bubble Sort mantém trocas adjacentes e propagação; Selection Sort mantém modelo bimodal `INSPECT`/`COMMIT`, ponteiro `minIndex`, scanner e transferências pontuais. Padronizar estrutura visual NÃO padronizou mecânica algorítmica.

4. **Normalização da Tela de Resultado (`ResultScreen.tsx`):**
   - Cabeçalho padronizado: `MÓDULO {NOME} — {PRÁTICA} CONCLUÍDA`;
   - Hero title unificado: `EXERCÍCIO CONCLUÍDO!`;
   - Inclusão do botão de ação `SELETOR DE PRÁTICAS` e discriminação de métricas próprias de cada algoritmo.

5. **Unificação da Conclusão de Conjunto de Práticas (`PracticeSetCompleteScreen.tsx`):**
   - Convergência de Bubble, Selection e Insertion para o mesmo componente consolidado com título `CONJUNTO DE PRÁTICAS CONCLUÍDO!`;
   - Agregação factual de comparações, movimentações (trocas, transferências ou deslocamentos), erros, dicas e tempo;
   - Sínteses conceituais pedagógicas específicas para cada algoritmo;
   - Manutenção de wrappers finos de retrocompatibilidade (`CampaignCompleteScreen.tsx` e `SelectionCampaignCompleteScreen.tsx`) que delegam diretamente para `PracticeSetCompleteScreen`.

6. **Gravação Canônica Única no Schema v4 e Papel Adaptador de `recordPhaseCompletion`:**
   - Em `App.tsx`, cada conclusão de prática é gravada **estritamente uma única vez** no modelo canônico Schema v4 através de `recordExerciseCompletion(saveData, moduleId, exerciseSetId, scoreData)`.
   - `recordPhaseCompletion` permanece exclusivamente na camada de persistência (`persistenceService.ts`) como um adaptador puro de compatibilidade para testes e consumidores legados, mapeando fases numéricas (1, 2, 3) para identificadores canônicos de exercício e delegando para `recordExerciseCompletion`.
   - Chamadas simultâneas redundantes em `App.tsx` foram eliminadas, garantindo uma única serialização no `localStorage`, gravação estrita em `modules[moduleId].exerciseSets[exerciseSetId]` e ausência total de estruturas legadas independentes no Schema v4.

## Consequências

- **Positivas:**
  - Coerência epistemológica integral entre todos os 3 módulos implementados (Bubble, Selection e Insertion);
  - Linguagem de "jogo com fases" eliminada da interface do usuário em favor do modelo educacional de "módulo e práticas";
  - Persistência única, canônica e limpa no Schema v4 sem dupla gravação;
  - Eliminação de redundâncias massivas de JSX em telas de conclusão;
  - Usuários recorrentes têm liberdade total de navegação via Seletor de Práticas;
  - Código desacoplado e extensível para os futuros módulos (Merge Sort, Quick Sort, Heap Sort);
  - Suíte de testes expandida para 29 arquivos e 411 testes unitários verdes (100% de aprovação), com 0 erros de compilação TypeScript e build limpo.

- **Neutras:**
  - Identificadores internos legados em algumas rotas do `App.tsx` (ex.: nomes de telas de string como `"campaign-complete"`) foram mantidos sob wrappers finos para evitar quebras pontuais de navegação.
