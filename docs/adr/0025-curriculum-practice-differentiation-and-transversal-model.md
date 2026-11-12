# ADR 0025: Modelo Curricular Transversal e Diferenciação Procedural dos Três Módulos Centrais (LEARNING-R2-A)

## Status

**Aceito** (12/11/2026 / LEARNING-R2-A)

## Contexto

Com a consolidação da Carta Educacional (ADR 0016), a transição arquitetural para plataforma de aprendizagem (ADR 0018), a persistência modular no Schema v4 (ADR 0021) e a padronização dos módulos de exercícios (ADR 0022), o Sorting Station estruturou as atividades regulares em três níveis:
- **Prática Básica** ($n=4$)
- **Prática Intermediária** ($n=5$)
- **Prática Avançada** ($n=6$)

No entanto, a auditoria curricular realizada no marco **LEARNING-R1** constatou uma limitação pedagógica estrutural:
1. Os níveis eram diferenciados essencialmente pela escalada do tamanho do vetor ($n=4 \to 5 \to 6$);
2. Tamanho da entrada não equivale a complexidade conceitual, densidade decisória ou variedade de casos algorítmicos;
3. No Bubble Sort, vetores de tamanho 5 ou 6 podiam resolver-se prematuramente em uma única passada por mero acaso do gerador randômico;
4. No Selection Sort, a experiência de busca do menor elemento não garantia necessariamente alternância entre manter o candidato e eleger um novo mínimo;
5. No Insertion Sort, o aluno podia não vivenciar o contraste entre inserções imediatas (melhor caso local) e deslocamentos em cascata com parada condicional.

O marco **LEARNING-R2-A** estabelece o redesenho curricular dessas práticas regulares para os três módulos centrais (**Bubble Sort**, **Selection Sort** e **Insertion Sort**), transformando-as em experiências com propriedades matemáticas e cognitivas distintas.

## Decisão de Arquitetura

### 1. Enriquecimento do Modelo Curricular Transversal (`src/game/curriculum/`)

Evoluiu-se o catálogo curricular transversal (`types.ts` e `practiceCatalog.ts`) sem romper a independência da engine de ordenação e sem acoplar a UI a regras procedurais internas:
- **`learningFocus` (string):** Foco pedagógico explícito e sintetizado da prática;
- **`generatorProfile` (`"foundation" | "mixed-decisions" | "autonomous-complex"`):** Perfil curricular de geração procedural;
- **`supportProfile` (`"full" | "reduced" | "minimal"`):** Nível de suporte e andaime oferecido ao estudante;
- Todos os catálogos (Bubble, Selection, Insertion, Merge e Quick) foram enriquecidos com metadados padronizados.

### 2. Diferenciação Procedural Pura do Bubble Sort (`src/game/generation/`)

Implementou-se análise algorítmica funcional (`analyzeBubbleSort`) e restrições canônicas em `constraints.ts` e `arrayGenerator.ts`:
- **Básica ($n=4$):** Exige não apenas desordem inicial e decisões elementares, mas garantia de deslocamento perceptível de pelo menos um elemento por mais de uma posição (`hasBubbleMultiPositionDisplacement`);
- **Intermediária ($n=5$):** Exige trocas distribuídas em múltiplas passadas (`hasBubbleSwapsDistributedAcrossPasses`) e decisões equilibradas entre TROCAR e MANTER (`hasBubbleBalancedDecisions`: $\ge 2$ trocas e $\ge 2$ manutenções);
- **Avançada ($n=6$):** Exige densidade decisória rica (`hasBubbleAdvancedDecisions`: $\ge 2$ passadas com trocas, $\ge 3$ trocas totais e $\ge 3$ manutenções), proibindo resoluções prematuras em passada única;
- **Fallbacks Curados:** Padrões estáticos determinísticos dedicados para $n=4, 5, 6$ caso o limite de tentativas seja atingido.

### 3. Diferenciação Procedural Pura do Selection Sort (`src/game/sorting/selection/`)

Implementou-se análise algorítmica funcional (`analyzeSelectionSort`) em `selectionConstraints.ts`:
- **Básica ($n=4$):** Varredura canônica com menor elemento global fora do índice 0 e garantia de ao menos uma decisão `KEEP_MIN`;
- **Intermediária ($n=5$):** Exige ao menos uma passada com múltiplas atualizações do candidato (`hasMultipleMinUpdatesInAtLeastOnePass`) e decisões intercaladas de NOVO MÍNIMO e MANTER na mesma passada (`hasInterleavedKeepAndNewMin`);
- **Avançada ($n=6$):** Exige ao menos uma transferência não adjacente de média ou longa distância ($|\text{minIndex} - i| \ge 2$, `hasNonAdjacentCommitTransfer`) e alternância consistente de inspeções (`hasRichSelectionDecisions`: $\ge 3$ manutenções e $\ge 2$ atualizações);
- **Compatibilidade:** `getSelectionPhaseConstraints` mantém a assinatura numérica retrocompatível para testes legados, enquanto `getSelectionPracticeConstraints` atende ao seletor de práticas.

### 4. Diferenciação Procedural Pura do Insertion Sort (`src/game/sorting/insertion/`)

Implementou-se análise algorítmica funcional (`analyzeInsertionSort`) em `insertionConstraints.ts`:
- **Básica ($n=4$):** Deslocamentos moderados ($\le 2$ shifts por passada, `hasModerateShiftsInBasic`), com garantia de inserção direta imediata e deslocamento;
- **Intermediária ($n=5$):** Exige ao menos uma passada com múltiplos shifts em cascata, custos de passadas heterogêneos (`hasHeterogeneousPassCosts`) e parada condicional interna por elemento menor ou igual ($A[j] \le \text{key}$, `hasConditionFalseStopWithShift`);
- **Avançada ($n=6$):** Exige ao menos uma chegada de chave à cabeceira da esteira ($j < 0$, `hasHeadLandingInAtLeastOnePass`) e trajetórias heterogêneas com contagens diversas de deslocamentos (`hasDiverseShiftTrajectories`). Não proíbe artificialmente vetores reversos para permitir diversidade estrutural profunda.

### 5. Exibição Pedagógica no Seletor de Práticas (`PracticeSelector.tsx`)

O `PracticeSelector.tsx` foi atualizado para:
- Apresentar o **Foco de Aprendizagem** (`FOCO DE APRENDIZAGEM:`) em cada card;
- Apresentar badge com o perfil de suporte (`Suporte Completo`, `Suporte Reduzido`, `Autonomia Máxima`);
- Tratar o tamanho ($n=4, 5, 6$) como metadado secundário discreto (`{state.definition.size} ELEMENTOS`), preservando compatibilidade com testes de fluxo.

### 6. Preservação Estrita do Schema v4 de Persistência

- Nenhuma alteração foi introduzida no formato de dados gravados (`saveData.modules[m].exerciseSets[id]`);
- O Schema v4 permanece canônico e intacto, garantindo persistência sem perda de progresso para os usuários.

## Consequências

- **Positivas:**
  - Práticas regulares deixam de ser simples escaladas de tamanho e passam a ser pedagogicamente diferenciadas;
  - Decisões matemáticas garantem a ocorrência dos comportamentos típicos de cada algoritmo;
  - Zero loops infinitos nos geradores com 25+ seeds randômicas testadas por nível e módulo;
  - Cobertura de testes ampliada para 613 testes verdes em 46 arquivos (100% de aprovação no Vitest);
  - Compilação limpa em `tsc --noEmit` e build de produção Vite concluído em 512ms.

- **Neutras:**
  - As práticas continuam utilizando os tamanhos $n=4, 5, 6$ como suporte físico de capacidade cognitiva, mas com parâmetros qualitativos internos ricos.