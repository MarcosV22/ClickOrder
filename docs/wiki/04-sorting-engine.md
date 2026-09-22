# 04 — Motores de Ordenação: Arquitetura de Domínio e FSMs

> **Documento canônico:** Especificação técnica e formal da arquitetura de motores de ordenação (sorting engines), máquinas de estados finitos (FSM), catálogo de algoritmos e governança funcional do **Sorting Station**.  
> **Status:** Ativo / Base de Verdade da Plataforma  
> **Data de Atualização:** 15/09/2026 (Marco PLATFORM-R0)  
> **Dependências:** [`AGENTS.md`](../../AGENTS.md), [`ADR 0018`](../adr/0018-game-to-educational-platform-transition.md), [`modules/README.md`](./modules/README.md), [`02-system-architecture.md`](./02-system-architecture.md).

---

## 1. Filosofia e Princípios Arquiteturais das Engines

No **Sorting Station**, a lógica matemática dos algoritmos de ordenação é completamente isolada do ciclo de vida do React, de componentes visuais, de timers e do DOM:

1. **Pureza e Imutabilidade:** Toda engine reside em `src/game/sorting/` e opera através de funções puras que recebem um estado imutável (`readonly`) e retornam um novo estado congelado (`Object.freeze`).
2. **Determinismo FSM Estrito:** O avanço da simulação é governado por uma Máquina de Estados Finita (FSM). Não há operações livres, atalhos arbitrários ou permutas fora de ordem.
3. **Consumo Multi-Camada:** A mesma engine pura alimenta quatro subsistemas independentes da plataforma:
   - A tela de **Prática Interativa** (`GameScreen.tsx` / `SelectionGameScreen.tsx`);
   - O **Modo Demonstração Canônico** (`src/game/demonstration/`, [`ADR 0017`](../adr/0017-canonical-demonstration-mode.md));
   - O **Modo Replay Retrospectivo** (`src/game/replay/`, [`ADR 0004`](../adr/0004-execution-replay-state-derivation.md));
   - O futuro **Laboratório Comparativo** (`comparison-lab.md`).
4. **Isolamento de Efeitos Colaterais:** Erros conceituais (`errors`) pertencem ao estado interno da engine por representarem violações da invariante matemática, enquanto dicas (`hintsUsed`) e tempo decorrido pertencem à telemetria de sessão (`sessionMetrics.ts`), sem alterar os ponteiros da ordenação.

---

## 2. Catálogo Factual das Engines Curriculares

A plataforma divide seus motores de ordenação em 6 módulos curriculares canônicos:

| Algoritmo | Localização no Repositório | Modelo de Estados | Status Factual | Especificação Detalhada |
| :--- | :--- | :--- | :---: | :--- |
| **01. Bubble Sort** | `src/game/sorting/bubbleSortEngine.ts` | FSM sequencial estrita de pares adjacentes $[j, j+1]$ e passada externa $i$ | `IMPLEMENTADO` | [`modules/bubble-sort.md`](./modules/bubble-sort.md) |
| **02. Selection Sort** | `src/game/sorting/selection/selectionSortEngine.ts` | FSM bimodal estrita `INSPECT` (scanner) e `COMMIT` (transferência) | `IMPLEMENTADO` | [`modules/selection-sort.md`](./modules/selection-sort.md) |
| **03. Insertion Sort** | `src/game/sorting/insertion/insertionSortEngine.ts` | FSM de deslocamentos (`COMPARE_AND_SHIFT`, `INSERT_READY`, `COMPLETED`) com vaga física | `IMPLEMENTADO` | [`modules/insertion-sort.md`](./modules/insertion-sort.md) |
| **04. Merge Sort** | `src/game/sorting/merge/` | FSM Top-Down pós-ordem com pilha explícita, dois ponteiros de confluência e buffer auxiliar | `ESTAÇÃO E SELETOR IMPLEMENTADOS (P3.1-D)` | [`modules/merge-sort.md`](./modules/merge-sort.md) |
| **05. Quick Sort** | `src/game/sorting/quick/` (Futuro P3.2) | FSM de seleção de pivô e particionamento bilateral Lomuto/Hoare | `FUTURO` | [`modules/quick-sort.md`](./modules/quick-sort.md) |
| **06. Heap Sort** | `src/game/sorting/heap/` (Futuro P3.3) | FSM de construção de max-heap, afundamento (*sift-down*) e extração da raiz | `FUTURO` | [`modules/heap-sort.md`](./modules/heap-sort.md) |

---

## 3. A Engine de Bubble Sort (`src/game/sorting/bubbleSortEngine.ts`)

### 3.1. Estrutura de Estado Imutável
```typescript
export interface BubbleSortState {
  readonly values: readonly number[];
  readonly passIndex: number;         // Índice i (0 .. n-2)
  readonly comparisonIndex: number;   // Índice j (0 .. n-2-i)
  readonly completed: boolean;
  readonly sortedBoundary: number;    // Limite direito consolidado (n-1-i)
  readonly errors: number;            // Violações da invariante registradas
  readonly history: readonly StepRecord[];
}
```

### 3.2. Funções Puras Principais
- `createBubbleSortState(values)`: Instancia sessão imutável;
- `getExpectedComparison(state)`: Retorna o par mandatório $[j, j+1]$ e a decisão teórica esperada (`shouldSwap = A[j] > A[j+1]`);
- `executeUserStep(state, decision)`: Valida a decisão do estudante (`SWAP` vs `KEEP`). Se correta, avança ponteiros e gera histórico; se incorreta, incrementa `errors` sem mover a esteira;
- `calculateBubbleSortProgress(state)`: Retorna o progresso real exato de $0$ a $100\%$ baseado na progressão aritmética $\frac{n(n-1)}{2}$.

---

## 4. A Engine de Selection Sort (`src/game/sorting/selection/selectionSortEngine.ts`)

### 4.1. Estrutura de Estado Bimodal
```typescript
export interface SelectionSortState {
  readonly values: readonly number[];
  readonly targetIndex: number;       // Posição alvo i (0 .. n-2)
  readonly minIndex: number;          // Índice do menor valor encontrado até o momento
  readonly scanIndex: number;         // Ponteiro de varredura j (i+1 .. n-1)
  readonly phaseMode: 'INSPECT' | 'COMMIT';
  readonly completed: boolean;
  readonly sortedBoundary: number;    // Limite esquerdo consolidado (0 .. i)
  readonly errors: number;
  readonly history: readonly SelectionStepRecord[];
}
```

### 4.2. Funções Puras Principais
- `createSelectionSortState(values)`: Instancia sessão com `phaseMode = 'INSPECT'`;
- `executeSelectionInspection(state, decision)`: Valida se a identificação de menor valor (`SELECT_NEW_MIN` vs `KEEP_MIN`) confere com $A[scanIndex] < A[minIndex]$. Ao atingir o final do array, transita automaticamente para `phaseMode = 'COMMIT'`;
- `commitSelectionPass(state)`: Executa a permuta física única entre $targetIndex$ e $minIndex$ (se diferentes) e consolida a vaga alvo com badge `OK`.

---

## 5. A Engine de Insertion Sort (`src/game/sorting/insertion/insertionSortEngine.ts`)

Implementada no marco **P2.2-B**, modela a ordenação por deslocamentos sucessivos (*shifts*) e encaixe pontual de chave (*insert*) com conservação estrita de massa e sem permutas bilaterais (*swaps*):

### 5.1. Estrutura de Estado Imutável
```typescript
export interface InsertionSortState {
  readonly initialValues: readonly number[];
  readonly currentValues: readonly (number | null)[]; // null representa a vaga física
  readonly arrayLength: number;
  readonly i: number;                 // Passada externa atual (1 .. n-1)
  readonly j: number;                 // Posição de inspeção regressiva (i-1 .. -1)
  readonly key: number | null;        // Chave suspensa no trilho aéreo
  readonly holeIndex: number | null;  // Índice da vaga física na esteira
  readonly phase: InsertionPhase;     // "COMPARE_AND_SHIFT" | "INSERT_READY" | "COMPLETED"
  readonly comparisons: number;       // Comparações relacionais reais entre A[j] e key
  readonly shifts: number;            // Movimentações de carga sobre a esteira (A[j+1] <- A[j])
  readonly insertions: number;        // Inserções da chave na vaga (n - 1 para n >= 2)
  readonly errors: number;            // Total de decisões incorretas do operador
  readonly orderedBoundary: number;   // Limite do subvetor ORD relativo A[0..orderedBoundary]
  readonly history: readonly InsertionStepRecord[];
  readonly completed: boolean;
  readonly status: InsertionStatus;
}
```

### 5.2. Funções Puras Principais
- `createInsertionSortState(initialValues)`: Instancia a sessão imutável. Para $n \ge 2$, dispara automaticamente o *auto-lift* determinístico da chave $A[1]$ para o trilho aéreo, abrindo a vaga no índice 1 e apontando $j$ para 0;
- `getExpectedInsertionStep(state)`: Retorna os metadados contextuais da ação esperada (`SHIFT_RIGHT` vs `INSERT_KEY`), a comparação relacional $A[j] > \text{key}$ e a explicação pedagógica;
- `executeInsertionStep(state, decision)`: Executa a decisão do operador diferenciando rigorosamente **erros pedagógicos** (`errors += 1`, estado retido) de **ações inválidas por fase/integração** (`errors` inalterado);
- `getInsertionOrderedIndices(state)`: Retorna os índices `[0 .. orderedBoundary]` que compõem o subvetor ordenado relativo `ORD`;
- `isInsertionSortComplete(state)`: Indica se todas as passadas externas foram finalizadas;
- `calculateInsertionSortProgress(state)`: Calcula a porcentagem real de progresso (0 a 100%).

---

## 6. A Engine de Merge Sort (`src/game/sorting/merge/`)

### 6.1. Estrutura de Estado Imutável
```typescript
export interface MergeSortState {
  readonly initialValues: readonly MergeElement[];
  readonly values: readonly MergeElement[];
  readonly buffer: readonly (MergeElement | null)[];
  readonly activeInterval: MergeIntervalContext | null;
  readonly p1: number;
  readonly p2: number;
  readonly k: number;
  readonly phase: MergePhase;
  readonly tasks: readonly MergeTask[];
  readonly comparisons: number;
  readonly writesInBuffer: number;
  readonly writesInMain: number;
  readonly totalWrites: number;
  readonly errors: number;
  readonly hintsUsed: number;
  readonly history: readonly MergeStepRecord[];
  readonly completed: boolean;
}
```

### 6.2. Funções Puras Principais
- `initMergeSortState(rawInput)`: Instancia o estado imutável com identidades persistentes (`MergeElement`). Trata entradas vazias ou unitárias como concluídas imediatamente com zero comparações e zero escritas. Para $n \ge 2$, dispara `advanceAutomaticSteps` até a primeira decisão interativa (`COMPARE_HEADS`);
- `getExpectedMergeStep(state)`: Retorna os metadados contextuais da ação esperada (`DISPATCH_LEFT` vs `DISPATCH_RIGHT` em `COMPARE_HEADS`, ou `DRAIN_REMAINDER` em `DRAIN_READY`) e aplica formalmente a regra de desempate estável na esquerda;
- `executeMergeStep(state, decision)`: Executa a decisão do estudante diferenciando rigorosamente **erros conceituais** (`errors += 1`, estado retido, zero avanço ou escrita) de **ações inválidas por fase** (`errors` inalterado). Após uma ação correta, avança deterministicamente pelos passos automáticos até o próximo estado interativo ou `COMPLETED`;
- `deriveMergeFramesFromHistory(initialValues, history)`: Transforma a lista de eventos brutos de histórico em uma sequência canônica de `MergeVisualStepFrame` para consumo pelo Replay e pela UI. Essa derivação percorre sequencialmente os $m$ eventos do histórico ($m \in O(n \log n)$), possuindo complexidade temporal $O(m)$ e gerando a lista de quadros em memória;
- **Acesso a quadros preparados vs. Derivação a frio:** A indexação direta sobre a lista de quadros pré-computados (`frames[stepIndex]`) é uma operação $O(1)$ imediata em tempo. Já a função utilitária avulsa `reconstructMergeStepAt(initialValues, history, stepIndex)` executa `deriveMergeFramesFromHistory` internamente a frio quando chamada isoladamente (custo $O(m)$), não devendo ser invocada repetidamente em laços sem reaproveitar a lista derivada;
- `reconstructMergeStateFromHistory(initialValues, history)`: Helper puro de reconstrução e auditoria factual que reproduz o vetor final, contadores e lista completa de quadros visuais sem reexecutar decisões de ordenação da engine;
- `getMergeSortScore(state)`: Calcula a Pontuação do Protocolo canônica baseada em erros e dicas consumidas.

### 6.3. Memória do Histórico e Snapshots
- **Espaço Auxiliar Algorítmico:** Estritamente $O(n)$ células físicas na esteira coletora temporária alocada em cada ciclo de intercalação.
- **Armazenamento de Snapshots na Sessão:** O histórico grava $m \in O(n \log n)$ eventos imutáveis (`MergeStepRecord[]`), cada qual retendo uma cópia rasa do array `valuesSnapshot` ($n$ referências) e, durante a intercalação ativa, `bufferSnapshot` (até $n$ referências). Como todas as instâncias de `MergeElement` são imutáveis e compartilhadas por ponteiro (zero clonagem profunda de dados), o heap retém estritamente ponteiros aos elementos existentes. Contabilizando vetores principais e buffers:
  - $n=4$ ($m \approx 12\text{--}16$ eventos): $\approx 100\text{--}130$ referências a elementos;
  - $n=5$ ($m \approx 18\text{--}22$ eventos): $\approx 180\text{--}240$ referências a elementos;
  - $n=6$ ($m \approx 24\text{--}28$ eventos): $\approx 280\text{--}340$ referências a elementos.
  Esse total de referências rasas ocupa menos de 2 KB de memória heap, garantindo performance instantânea e estabilidade de coleta de lixo, dispensando recalculo algorítmico ou redesenhos desnecessários do histórico.

---

## 7. Requisitos de Conformidade para Novas Engines (Module Standard)

Qualquer nova engine algorítmica a ser implementada na plataforma deve obedecer aos seguintes critérios:
1. **Zero Acoplamento com React:** Arquivos localizados em `src/game/sorting/<algoritmo>/` contendo exclusivamente TypeScript puro sem JSX ou hooks;
2. **Histórico Auditável (`history`):** Cada operação atômica deve produzir um registro discriminado com metadados suficientes para reconstrução determinística de quadros de replay;
3. **Invariantes Explícitas:** Funções públicas que retornam explicitamente elementos já consolidados e expectativas do passo corrente;
4. **Cobertura de Testes com Vitest:** Mínimo de 15 cenários de teste unitário, incluindo vetores vazios, unitários, ordenados, decrescentes e com valores duplicados.
