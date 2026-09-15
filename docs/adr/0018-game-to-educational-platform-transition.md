# 18. Transição Arquitetural e Conceitual: De Jogo Isolado a Plataforma Educacional de Algoritmos

- **Status:** Aceito
- **Data:** 2026-09-15
- **Decisores:** Antigravity, Marcos Mendes
- **Contexto da Tarefa:** PLATFORM-R0 (Reestruturação Completa da Wiki e Padronização dos Módulos)
- **Documentos Relacionados:**
  - [`AGENTS.md`](../../AGENTS.md)
  - [`docs/wiki/SUMMARY.md`](../wiki/SUMMARY.md)
  - [`docs/wiki/README.md`](../wiki/README.md)
  - [`docs/wiki/01-product-vision.md`](../wiki/01-product-vision.md)
  - [`docs/wiki/02-system-architecture.md`](../wiki/02-system-architecture.md)
  - [`docs/wiki/07-backend-and-persistence.md`](../wiki/07-backend-and-persistence.md)
  - [`docs/wiki/10-roadmap.md`](../wiki/10-roadmap.md)
  - [`docs/wiki/11-architecture-decisions.md`](../wiki/11-architecture-decisions.md)
  - [`docs/wiki/12-pedagogy-and-academic-traceability.md`](../wiki/12-pedagogy-and-academic-traceability.md)
  - [`docs/wiki/comparison-lab.md`](../wiki/comparison-lab.md)
  - [`docs/wiki/modules/README.md`](../wiki/modules/README.md)
  - ADRs anteriores correlatos: [`0001`](./0001-bubble-sort-fsm-ui-integration.md), [`0002`](./0002-campaign-completion-memory-state.md), [`0006`](./0006-decoupled-local-storage-persistence.md), [`0007`](./0007-protocol-score-and-descriptive-elapsed-time.md), [`0011`](./0011-selection-sort-engine-fsm.md), [`0015`](./0015-multi-protocol-persistence-schema-v3.md), [`0016`](./0016-educational-charter-and-cross-protocol-standardization.md), [`0017`](./0017-canonical-demonstration-mode.md).

---

## 1. Contexto e Declaração do Problema

O projeto **Sorting Station** nasceu concebido como um jogo web interativo *point-and-click* com ambientação de central logística espacial, onde o jogador organizava pacotes numerados através de fases progressivas de campanha (Fases 1, 2 e 3). Ao longo dos marcos de desenvolvimento (P0, P1, P2.1 e P2.1-G), o projeto amadureceu substancialmente:
1. Implementou engines puras, desacopladas e matematicamente rigorosas para **Bubble Sort** e **Selection Sort**;
2. Institucionalizou componentes transversais de telemetria descritiva, persistência local versionada (Schema v3), replay retrospectivo com pseudocódigo sincronizado e geração procedural determinística (PRNG Mulberry32);
3. Estabeleceu um **Charter Educacional** formal (ADR 0016) e implementou o **Modo Demonstração Canônico** (ADR 0017).

Contudo, a documentação, o modelo mental de produto e certas abstrações arquiteturais continuavam aprisionados na metáfora de "jogo de puzzle com fases de campanha". Essa abordagem causava atritos severos:
- A unidade central de navegação e persistência ainda era tratada como uma "fase de jogo", e não como um objetivo pedagógico de aprendizagem;
- A narrativa diegética ("Turnos", "Níveis") competia com os objetivos educacionais de cursos de graduação em Ciência da Computação;
- O acréscimo de novos algoritmos e cenários específicos (ex.: elementos ordenados, quase ordenados, elementos tartaruga) era artificialmente comprimido em "fases 1, 2 e 3", impedindo a introdução de exercícios conceituais, tutoriais guiados, desafios e experimentos livres;
- O futuro recurso de comparação analítica não encontrava espaço natural em uma arquitetura de "fases lineares".

Fez-se indispensável uma **redefinição arquitetural e documental transversal**: transformar o Sorting Station oficialmente em uma **Plataforma Educacional Interativa e Gamificada de Algoritmos de Ordenação**.

---

## 2. Decisão Arquitetural

### 2.1. Redefinição Oficial do Produto
O Sorting Station é oficialmente redefinido como:
> **"Plataforma educacional interativa e gamificada para aprendizagem, prática e visualização de algoritmos de ordenação."**

A identidade de **Central Logística Espacial/Industrial** permanece como metáfora visual e camada de gamificação/engajamento. O produto **NÃO** é mais arquitetado ou documentado primordialmente como um jogo de fases, mas sim como um ambiente de ensino superior e técnico de algoritmos.

### 2.2. A Unidade Curricular Canônica: MÓDULO DE ALGORITMO
A unidade canônica de software e documentação deixa de ser a "fase" ou a "campanha" e passa a ser o **Módulo de Algoritmo**.  
O currículo do Sorting Station é formalmente congelado em **6 Módulos Oficiais**:
1. **Bubble Sort** (Status: `IMPLEMENTADO` — adaptação conceitual fases $\rightarrow$ exercícios);
2. **Selection Sort** (Status: `IMPLEMENTADO` — adaptação conceitual fases $\rightarrow$ exercícios);
3. **Insertion Sort** (Status: `PLANEJADO` — P2.2);
4. **Merge Sort** (Status: `FUTURO` — P3);
5. **Quick Sort** (Status: `FUTURO` — P3);
6. **Heap Sort** (Status: `FUTURO` — P3).

### 2.3. Nomenclatura Canônica Padronizada
Fica estabelecido o glossário arquitetural controlado:
- **Plataforma:** O sistema global Sorting Station.
- **Módulo:** Unidade curricular dedicada a um algoritmo específico de ordenação.
- **Exercício:** Unidade atômica de interação prática e pedagógica dentro de um módulo.
- **Caso:** Cenário ou configuração específica de vetor de entrada (ex.: ordenado, inverso, repetidos).
- **Prática:** Atividade interativa de resolução de problemas guiada por invariantes do algoritmo.
- **Demonstração:** Visualização autônoma da execução canônica ideal com pseudocódigo.
- **Tutorial:** Instrução passo a passo guiada com validação formativa imediata.
- **Replay:** Auditoria retrospectiva pós-prática da execução do próprio usuário.
- **Gamificação:** Camada motivacional cinestésica (esteiras, cargas, telemetria descritiva, pontuação).
- *Nota sobre "Protocolo":* O termo "Protocolo" pode ser mantido na interface do usuário (UI) como terminologia diegética estilizada da Central Logística, mas em toda a documentação, arquitetura, design de dados e modelagem de software, a unidade oficial é **MÓDULO**.

### 2.4. Taxonomia Transversal de Exercícios
Cada módulo de algoritmo deve estruturar suas atividades sob uma taxonomia transversal padronizada:
1. `Introdução / Conceito`: Apresentação teórica, objetivos e invariantes.
2. `Demonstração`: Observação autônoma do algoritmo operando em vetor curado.
3. `Tutorial Guiado`: Passo a passo interativo com feedback explicativo imediato.
4. `Prática Básica`: Exercício fundamental com vetor curto e auxílio de interface.
5. `Prática Progressiva`: Exercícios com escalonamento de tamanho e complexidade.
6. `Casos do Algoritmo`: Exercícios dedicados a propriedades específicas (melhor/pior caso, estabilidade).
7. `Desafio`: Prática avaliativa com restrições operacionais ou heurísticas (ex.: Early Exit).
8. `Prática Livre (Sandbox)`: Exploração autônoma com parâmetros definidos pelo estudante.

### 2.5. Migração Conceitual das Fases Existentes (Sem Quebra de Código)
Para preservar o funcionamento integral do código atual e os 303 testes unitários aprovados, **nenhum arquivo de código TypeScript/React é renomeado ou quebrado nesta etapa**. A migração opera como um mapeamento semântico conceitual:
- **Fase 1** $\longrightarrow$ **Prática Básica** ($n=4$);
- **Fase 2** $\longrightarrow$ **Prática Intermediária** ($n=5$);
- **Fase 3** $\longrightarrow$ **Prática Avançada** ($n=6$).

### 2.6. Reposicionamento da Gamificação e Narrativa
A camada narrativa (historietas de operadores e ordens de serviço) é formally desacoplada do núcleo pedagógico e movida para a categoria de **Backlog de Gamificação Opcional**. A gamificação central consiste estritamente em:
- Manipulação tátil/cinestésica dos elementos no vetor;
- Feedback sensorial das esteiras e translações físicas de caixas;
- Pontuação do Protocolo transparente e não punitiva ($\max(0, 100 - \text{erros} \times 10 - \text{dicas} \times 5)$);
- Métricas factuais assintóticas descritivas com peso estritamente zero no score.

### 2.7. Laboratório Comparativo de Algoritmos (`docs/wiki/comparison-lab.md`)
Institucionaliza-se a especificação conceitual do **Laboratório Comparativo**:
- **Status:** `BLOQUEADO ATÉ CONCLUSÃO DOS 6 MÓDULOS`;
- Permite comparar simultaneamente de 2 a 6 algoritmos sobre a mesma entrada gerada por semente única (garantia de paridade por PRNG Mulberry32);
- Segregação rigorosa de métricas: métricas universais comparáveis ($C(n)$, vetor final, complexidade teórica) vs. métricas específicas de movimentação ($M(n)$ de troca no Bubble/Selection, deslocamentos/shifts no Insertion, escritas auxiliares no Merge);
- Dois modos operacionais: **Comparação Visual** (execução sincronizada passo a passo) e **Benchmark Analítico** (execução rápida com gráficos comparativos de complexidade).

### 2.8. Persistência Futura: Especificação Conceitual do Schema v4
Registra-se o diagnóstico de obsolescência do Schema v3 (ADR 0015):
- O Schema v3 possui chave estática `protocols: { bubble, selection }` e records indexados por fase numérica (`Record<number, PhaseRecord>`), impedindo a adição modular de novos algoritmos e novos tipos de exercícios sem quebra de tipo;
- Projeta-se conceitualmente o **Schema v4** com formato genérico desacoplado baseado em `moduleId` e `exerciseId`, cuja implementação de código ocorrerá em etapa oportuna com migração transparente retrocompatível ($v3 \rightarrow v4$).

---

## 3. Impacto sobre ADRs Anteriores

1. **ADR 0001 (Bubble Sort FSM):** Preservado integralmente. As regras da FSM pura aplicam-se à engine do Módulo Bubble Sort.
2. **ADR 0002 (Campaign Complete Memory State):** Atualizado conceitualmente. O relatório de encerramento passa a ser interpretado como "Conclusão do Conjunto de Práticas do Módulo".
3. **ADR 0006 e ADR 0015 (Persistência v1 a v3):** Mantidos como base factual ativa do código. O ADR 0015 é anotado com o diagnóstico de que será sucedido pelo Schema v4 no futuro.
4. **ADR 0007 (Score e Tempo):** Preservado integralmente como a política ética de pontuação da plataforma.
5. **ADR 0010 (Briefing):** Preservado. A tela de briefing atua como portal de entrada preparatório do Módulo.
6. **ADR 0016 (Charter Educacional):** Ampliado e reforçado por este ADR. O Sorting Station consolida-se formalmente como uma plataforma educacional completa.
7. **ADR 0017 (Modo Demonstração):** Preservado integralmente como artefato obrigatório de cada módulo.

---

## 4. Consequências e Trade-offs

### Consequências Positivas:
- **Alinhamento Epistemológico:** O projeto fala a língua da pedagogia de Ciência da Computação e do ensino superior de algoritmos.
- **Escalabilidade Curricular:** Permite adicionar novos tipos de exercícios, casos de teste e algoritmos avançados sem quebrar a metáfora ou a arquitetura.
- **Rigor Documental:** Elimina contradições entre páginas da Wiki e reflete honestamente o estado do código.
- **Preservação de Código:** Zero quebra de código atual; todas as engines e os 303 testes permanecem 100% íntegros e verdes.

### Trade-offs:
- Exige disciplina contínua dos agentes e mantenedores para utilizar a taxonomia canônica (Módulo / Exercício / Caso) em vez do jargão legado (Jogo / Fase / Fase de Campanha).

---

## 5. Links e Referências
- **Documento da Wiki:** [`docs/wiki/modules/README.md`](../wiki/modules/README.md)
- **Especificação do Laboratório:** [`docs/wiki/comparison-lab.md`](../wiki/comparison-lab.md)
- **Roadmap da Plataforma:** [`docs/wiki/10-roadmap.md`](../wiki/10-roadmap.md)
- **Persistência Conceitual v4:** [`docs/wiki/07-backend-and-persistence.md`](../wiki/07-backend-and-persistence.md)
