# ADR 0026: Infraestrutura Curricular de Casos do Algoritmo e Separação de Contexto de Atividade (LEARNING-R3-A)

## Status

**Aceito** (12/11/2026 / LEARNING-R3-A)

## Contexto

Após a reestruturação curricular das práticas regulares com restrições procedurais diferenciadas (ADR 0025, LEARNING-R2-A) e desvanecimento de andaimes cognitivos (LEARNING-R2-B), o Sorting Station consolidou um ambiente sólido para aquisição de fluência operacional.

Entretanto, conforme diagnosticado no marco canônico **LEARNING-R1**, práticas regulares procedurais — mesmo ricas e controladas por rejeição matemática — têm caráter estocástico e visam exercitar decisões sob incerteza. Para o ensino superior de Ciência da Computação e fundamentação de artigos acadêmicos, é imprescindível contrastar essas práticas com **Casos do Algoritmo** (*Algorithm Cases*):
1. **Cenários Determinísticos Curados:** Entradas deliberadamente construídas para evidenciar propriedades assintóticas e mecânicas específicas (melhor caso, pior caso, quase ordenado, invariantes estritas);
2. **Reflexão Factual Pós-Execução:** Confrontar o que o estudante experimentou (número real de comparações, trocas, deslocamentos e inserções) com as propriedades teóricas esperadas;
3. **Ausência de Aleatoriedade:** Zero PRNG, sem geração randômica, sem botão de "Nova Entrada", com repetição determinística idêntica;
4. **Coexistência sem Degradação Arquitetural:** Necessidade de acomodar essa nova modalidade sem introduzir um Schema v5 prematuro, preservando a retrocompatibilidade com o Schema v4 (ADR 0021).

O marco **LEARNING-R3-A** introduz a infraestrutura transversal para Casos do Algoritmo e valida o modelo com **1 caso-piloto por módulo central** (Bubble Sort, Selection Sort e Insertion Sort).

---

## Decisão de Arquitetura

### 1. Modelo Canônico de Atividades e Contexto (`ActivityContext`)

Formalizou-se em `src/game/curriculum/types.ts` a segregação de contexto de execução:

```typescript
export type ActivityContext = 'practice' | 'case';
```

Criou-se a abstração pura `AlgorithmCaseDefinition`:
- `id`: Identificador canônico persistível (ex: `bubble.case.nearly-sorted`);
- `moduleId`: Módulo proprietário (`bubble`, `selection`, `insertion`);
- `title` e `description`: Títulos e enunciados orientados à observação científica;
- `learningObjective`: O que o estudante deve observar no caso;
- `initialArray`: Vetor numérico estático fixo e imutável;
- `expectedFacts`: Fatos algorítmicos esperados calculados sobre o caso (ex: comparações teóricas, trocas teóricas, complexidade assintótica $\Theta(n)$ ou $\Theta(n^2)$);
- `supportProfile`: Nível de suporte padronizado como `"reduced"` para casos (indicadores e contadores preservados, sem spoilers antecipados);
- `buildReflection(metrics)`: Função pura geradora da síntese reflexiva pós-execução baseada nas métricas reais da engine.

### 2. Auditoria e Desambiguação de Fontes Curriculares

A auditoria solicitada em LEARNING-R3-A verificou a existência de dois arquivos denominados `practiceCatalog.ts`:
1. `src/game/curriculum/practiceCatalog.ts`: Fonte da verdade transversal canônica para metadados de práticas de todos os módulos (`PracticeDefinition`, títulos, objetivos, suporte, generatorProfile).
2. `src/game/sorting/insertion/practiceCatalog.ts`: Módulo local de empacotamento de constraints de geração procedural do Insertion Sort (`getInsertionPracticeConstraintsBundle`).

**Decisão:** Manteve-se `src/game/curriculum/practiceCatalog.ts` e o novo `src/game/curriculum/caseCatalog.ts` como as únicas fontes canônicas de metadados curriculares transversais. O arquivo local do Insertion Sort foi documentado como gerador de constraints algorítmicas específicas da engine.

### 3. Implementação dos Três Casos-Piloto

Foram definidos e validados 3 casos canônicos em `src/game/curriculum/caseCatalog.ts` e registrados em `src/game/persistence/constants.ts`:

1. **Bubble Sort — Quase Ordenado (`bubble.case.nearly-sorted`):**
   - Entrada: `[10, 30, 20, 40, 50]` ($n=5$).
   - Fato Central: Apenas 1 par adjacente fora de ordem.
   - Métricas Reais da Engine: 10 comparações, exatamente 1 troca realizada.
   - Reflexão Pedagógica: Demonstra o contraste entre o esforço mínimo de reorganização física (1 troca) e a redundância das comparações em algoritmos de varredura completa.

2. **Selection Sort — Já Ordenado (`selection.case.already-sorted`):**
   - Entrada: `[10, 20, 30, 40, 50]` ($n=5$).
   - Fato Central: Vetor em ordem não decrescente.
   - Métricas Reais da Engine: 10 comparações, exatamente 0 trocas efetivas.
   - Reflexão Pedagógica: Evidencia a insensibilidade à entrada do Selection Sort, que executa invariavelmente $\frac{n(n-1)}{2}$ comparações mesmo quando nenhum swap é necessário.

3. **Insertion Sort — Quase Ordenado (`insertion.case.nearly-sorted`):**
   - Entrada: `[10, 20, 40, 30, 50]` ($n=5$).
   - Fato Central: Elemento isolado deslocado uma posição à frente.
   - Métricas Reais da Engine: 5 comparações, 1 deslocamento, 4 inserções diretas imediatas, 0 swaps.
   - Reflexão Pedagógica: Ilustra a sensibilidade adaptativa do Insertion Sort, que atinge complexidade próxima de $\Theta(n)$ em entradas quase ordenadas devido à interrupção imediata da busca interna.

### 4. Modelo de Desbloqueio Dinâmico e Persistência no Schema v4

- **Desbloqueio Derivado:** O acesso aos Casos do Algoritmo de um módulo é desbloqueado dinamicamente quando a prática básica (`<moduleId>.practice.basic`) for concluída pelo estudante com sucesso (`isModuleCasesUnlocked`). Nenhuma flag booleana redundante é adicionada ao estado persistido.
- **Armazenamento no Schema v4:** O progresso e as métricas de cada caso são salvos diretamente em `saveData.modules[moduleId].exerciseSets[caseId]` através de `recordExerciseCompletion`, mantendo a regra de retenção de melhor pontuação (maior score $\to$ menor número de erros $\to$ menor tempo decorrido). Não houve alteração no Schema de persistência.

### 5. Execução com Engines Reais e Zero PRNG

- Os casos reaproveitam integralmente as telas e engines de jogo oficiais: `GameScreen` (Bubble), `SelectionGameScreen` (Selection) e `InsertionGameScreen` (Insertion).
- Nenhum gerador aleatório é invocado na inicialização, repetição ou replay de um caso. O `initialArray` é sempre o vetor determinístico do catálogo.
- Na tela de jogo, as propriedades pedagógicas da prática exibem o título e o objetivo reflexivo do caso.

### 6. Especialização da UI (`PracticeSelector` e `ResultScreen`)

- **`PracticeSelector.tsx`:** Adicionou-se a seção `"EXPLORAR CASOS"`, renderizando cards de caso com visualização do vetor inicial fixo (`[10, 30, 20, 40, 50]`), objetivo conceitual, badge de perfil de suporte (`Suporte Reduzido`), status derivado (`BLOQUEADO`, `DISPONÍVEL`, `CONCLUÍDO`) e métricas salvas (melhor score, erros, tempo).
- **`ResultScreen.tsx`:** Quando `activityContext === 'case'`, a tela adapta-se pedagogicamente:
  - Cabeçalho indica `MÓDULO ... — CASO DO ALGORITMO`;
  - Exibe card de **Reflexão Pedagógica** factual gerada a partir das métricas reais da sessão;
  - CTAs contextualizados: `VER EXECUÇÃO`, `↺ REPETIR CASO` e `← VOLTAR AOS CASOS`;
  - Ações procedurais (`NOVA ENTRADA`, `PRÓXIMA PRÁTICA`) são estritamente ocultadas.

### 7. Ciclo de Vida do Replay Sem Perda de Contexto

O Replay preserva o vetor determinístico inicial e todo o histórico de transições da FSM. Ao clicar em `"Voltar ao Resultado"` a partir do Replay, o sistema retorna à `ResultScreen` com o mesmo `activityContext = 'case'` e a mesma reflexão calculada, sem reset de estado ou redirecionamento espúrio.

---

## Consequências

- **Positivas:**
  - Estabelece a infraestrutura necessária para suportar todos os 15 casos planejados no LEARNING-R1 de forma limpa e modular;
  - Permite aos estudantes contrastar a prática procedural com a análise empírica de cenários assintóticos clássicos;
  - Preserva 100% da integridade do Schema v4 e retrocompatibilidade com dados salvos existentes;
  - Cobertura de testes estendida para 650 testes em 50 arquivos (100% verdes);
  - Build de produção do Vite e compilação TypeScript executados sem avisos ou erros.

- **Limitações Deliberadas:**
  - Apenas 1 caso-piloto por módulo foi habilitado neste marco; os 12 casos adicionais serão introduzidos em marcos subsequentes;
  - Identidades visuais de duplicatas ($30a, 30b$) não foram implementadas, mantendo a engine operando puramente sobre números inteiros com igualdade matemática estrita.
