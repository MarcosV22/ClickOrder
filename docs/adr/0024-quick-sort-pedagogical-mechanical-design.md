# ADR 0024 — Design Pedagógico e Mecânico do Módulo Quick Sort (P3.2-A)

- **Status:** Aceito (Design Pedagógico e Mecânico) / Engine Pura (P3.2-B) e Camada Pedagógica, Tutorial e Demonstração (P3.2-C) Implementadas
- **Data:** 2026-09-28
- **Autores:** Equipe de Engenharia e Design Pedagógico (Sorting Station)
- **Decisores:** Mantenedores da Plataforma Sorting Station
- **Decisões Relacionadas:** [`ADR 0018`](./0018-game-to-educational-platform-transition.md), [`ADR 0021`](./0021-module-exercise-persistence-schema-v4.md), [`ADR 0022`](./0022-canonical-exercise-module-standardization.md), [`ADR 0023`](./0023-merge-sort-pedagogical-mechanical-design.md).
- **Documentos Afetados:** [`docs/wiki/modules/quick-sort.md`](../wiki/modules/quick-sort.md), [`docs/wiki/04-sorting-engine.md`](../wiki/04-sorting-engine.md), [`docs/wiki/10-roadmap.md`](../wiki/10-roadmap.md), [`docs/wiki/SUMMARY.md`](../wiki/SUMMARY.md).

---

## 1. Contexto e Declaração do Problema

Com a conclusão dos três algoritmos elementares quadráticos $\Theta(n^2)$ e do primeiro algoritmo log-linear $\Theta(n \log n)$ com buffer auxiliar (**Merge Sort**), a plataforma **Sorting Station** avança para o **Marco P3.2**: o algoritmo **Quick Sort**.

O Quick Sort é um pilar da formação em Ciência da Computação:
1. Opera sob o paradigma de **Divisão e Conquista**, com a particularidade pedagógica de que o trabalho de ordenação é realizado na fase de **Particionamento**, dispensando etapa de intercalação posterior;
2. É um algoritmo **in-place** sobre o vetor principal, sem exigir vetor auxiliar de dados;
3. É **formalmente instável**, o que exige clareza didática para que o estudante compreenda que a ordem relativa de chaves iguais não é garantida;
4. Apresenta sensibilidade à escolha do pivô e à distribuição dos dados de entrada.

O objetivo do sub-marco **P3.2-A** é formalizar as diretrizes pedagógicas, mecânicas e técnicas do módulo antes da codificação da engine (P3.2-B):
- Variante canônica de particionamento e política de pivô;
- Definição sem ambiguidades dos limites de intervalos, significado dos ponteiros, condição de classificação e ordem de processamento;
- Delimitação da agência do estudante versus automações da plataforma;
- Contratos de métricas de execução (comparações, trocas entre índices distintos e escritas no vetor);
- Estruturação do histórico (`history`) com snapshots pós-evento e contexto da comparação para Replay determinístico.

---

## 2. Decisão Arquitetural e Pedagógica

### 2.1. Variante Canônica: Particionamento de Lomuto com Pivô Final (`A[high]`)

Adota-se como variante canônica o **Particionamento de Lomuto**, utilizando o último elemento do intervalo ativo ($A[high]$) como elemento pivô.

#### Justificativa Pedagógica em Relação ao Esquema de Hoare:
- **Clareza Didática:** Em Lomuto, ambos os ponteiros de varredura ($i$ e $j$) avançam unidirecionalmente da esquerda para a direita. O estudante avalia uma caixa por vez contra o pivô estático no final do trecho;
- **Consolidação Definitiva do Pivô:** Ao término da varredura, o pivô $A[high]$ é colocado na fronteira ($i+1$) e atinge sua **posição final definitiva** ($p = i+1$), recebendo o selo esmeralda `OK DEFINITIVO`. No esquema de Hoare, o índice de separação retornado apenas delimita os dois subintervalos, sem garantir que o pivô esteja ordenado ou que resida no índice de corte, o que geraria confusão conceitual em estudantes iniciantes;
- **Regiões Visuais Contíguas:** Lomuto delimita regiões contíguas que se expandem progressivamente: a região dos menores ou iguais à esquerda e a região dos maiores no centro. Hoare, por sua vez, realiza trocas entre extremidades sem manter essa continuidade direta de zonas.

### 2.2. Política de Escolha do Pivô e Sensibilidade de Desempenho

- **Política Canônica:** Pivô fixo no último índice da partição ativa ($P = A[high]$). O sistema identifica e destaca automaticamente o pivô.
- **Comportamento em Entradas Específicas:**
  - **Vetor já ordenado:** O pivô no final é sempre o maior elemento de cada partição, gerando divisões desiguais de tamanho $n-1$ e $0$. A profundidade de recursão atinge $n$, executando $\frac{n(n-1)}{2}$ comparações — pior caso $\Theta(n^2)$;
  - **Vetor inversamente ordenado:** Na partição raiz, o pivô no final é o menor elemento, gerando partição desbalanceada inicial de $0$ e $n-1$ elementos. As permutas subsequentes alteram a disposição dos elementos nas partições seguintes, mantendo o desbalanceamento acentuado que leva a $\Theta(n^2)$;
  - **Valores duplicados:** Sob o predicado $A[j].valor \le P.valor$, valores iguais ao pivô são classificados como menores ou iguais e agrupados à esquerda.

### 2.3. Limites de Intervalos e Invariante de 4 Regiões

- Limites indexados como $[low, high]$ **fechados e inclusivos** ($0 \le low \le high \le n - 1$).
- **Invariante Formal de Lomuto:** Para o cursor $j \in [low \dots high - 1]$ e fronteira de menores $i \in [low - 1 \dots high - 1]$:
  1. $\forall k \in [low \dots i], A[k].valor \le P.valor$ (Região de menores ou iguais — **ainda não necessariamente ordenada internamente**);
  2. $\forall k \in [i + 1 \dots j - 1], A[k].valor > P.valor$ (Região de maiores — **ainda não necessariamente ordenada internamente**);
  3. $k = j$: elemento em teste $A[j]$;
  4. $\forall k \in [j + 1 \dots high - 1]$: elementos ainda não inspecionados;
  5. $k = high$: pivô fixo $P = A[high]$.

### 2.4. Condição de Comparação e Não-Estabilidade Formal

- **Critério Relacional:** $A[j].valor \le P.valor$. A comparação algorítmica avalia **estritamente o valor numérico** (`value`).
- **Conceito de Instabilidade:** Instabilidade significa **ausência de garantia de preservação da ordem relativa** entre chaves iguais. Nem toda entrada com duplicatas resultará na inversão de suas posições relativas, mas a ausência de garantia classifica formalmente o algoritmo como instável.
- **Identidade Estável:** Cada elemento possui identidade única (`id`, `originalIndex`, `label`), permitindo rastrear visualmente se chaves de mesmo valor preservaram ou inverteram sua ordem relativa após as permutas de longo alcance.

### 2.5. Posicionamento do Pivô e Ordem de Processamento

1. **Fechamento da Partição:** Ao término de $j = high - 1$, o pivô é posicionado na fronteira $i + 1$.
   - Se $i + 1 \neq high$, executa-se a troca entre $A[i + 1]$ e $A[high]$;
   - Se $i + 1 == high$, o pivô já está na posição correta (operação sobre o mesmo índice: zero trocas e zero escritas);
   - O elemento em $p = i + 1$ recebe o selo **`OK DEFINITIVO`** e não é mais movido.
2. **Pilha Explícita de Intervalos (LIFO):**
   - Para adotar a travessia direta e intuitiva para o estudante (processar a esquerda antes da direita):
     1. Empilha-se primeiro a partição direita: $[p + 1 \dots high]$ (se $p + 1 \le high$);
     2. Empilha-se a partição esquerda: $[low \dots p - 1]$ (se $low \le p - 1$).
   - O subintervalo esquerdo fica no topo da pilha LIFO e será processado a seguir.
3. **Casos Base:**
   - **Intervalo Unitário ($low == high$):** O elemento já está ordenado por definição axiomática. Recebe o selo `OK DEFINITIVO` automaticamente sem comparações, trocas ou escritas;
   - **Intervalo Vazio ($low > high$):** Descartado sem operações.

---

## 3. Mecânica do Estudante e Divisão de Agência

### 3.1. Operações Automáticas
- Identificação e destaque visual do pivô $A[high]$;
- Delimitação física do trecho ativo $[low \dots high]$ e esmaecimento dos elementos externos;
- Desempilhamento do próximo intervalo e consolidação imediata de casos unitários ($low == high$);
- Avanço do cursor de varredura $j$.

### 3.2. Ações do Estudante
1. **Classificação durante a Varredura (Estado `INSPECT_ELEMENT`):**
   - `[ 1 ] Menor ou igual ao pivô`:
     - O aluno afirma que $A[j].valor \le P.valor$. A engine valida. Se correta:
       - $i \leftarrow i + 1$;
       - Se $i \neq j$: permuta física entre $A[i]$ e $A[j]$ (`swaps += 1`, `writesInArray += 2`);
       - Se $i == j$: avanço da fronteira sem troca física e sem escrita;
       - $j \leftarrow j + 1$.
   - `[ 2 ] Maior que o pivô`:
     - O aluno afirma que $A[j].valor > P.valor$. A engine valida. Se correta:
       - O elemento permanece na região dos maiores e o cursor avança $j \leftarrow j + 1$.
2. **Fechamento da Partição (Estado `PARTITION_READY_FOR_PIVOT`):**
   - `[ 3 ] Colocar o pivô na posição final`:
     - Confirmação pedagógica do aluno. Não é tratada como comparação relacional nem decisão punível por erro quando for a única ação disponível.
     - Se $i + 1 \neq high$: troca física entre $A[i+1]$ e $A[high]$ (`swaps += 1`, `writesInArray += 2`);
     - Se $i + 1 == high$: omissão de auto-troca (0 trocas, 0 escritas);
     - Sela a posição $p = i+1$ com `OK DEFINITIVO`.

### 3.3. Tratamento Formativo de Erros
- Decisões incorretas retêm o estado intacto (`errors += 1`, sem avanço de $j$, sem trocas e sem escritas);
- Exibição de alerta pedagógico direto e contextual;
- Escolhas impossíveis para o estado atual não penalizam e não incrementam métricas.

---

## 4. Contratos de Memória e Métricas

### 4.1. Diferenciação Estrita de Memória

1. **Espaço Temporário da Partição:**
   - Custo **$O(1)$**: opera estritamente in-place sobre o vetor principal.
   - Utiliza apenas variáveis escalares para índices ($low, high, i, j, p$) e referência transitória em variável local durante a permuta física. Não aloca vetor auxiliar de dados.

2. **Pilha Explícita de Intervalos Pendentes (`pendingIntervals`):**
   - Estrutura auxiliar de controle LIFO para gerenciar subproblemas pendentes.
   - **Distinção Fundamental entre Árvore Recursiva e Pilha Explícita:**
     - A profundidade da árvore conceitual de recursão **não é** uma medida automática do tamanho da pilha de intervalos pendentes.
     - *Exemplo comprovado na Entrada Já Ordenada:* Na entrada crescente `[1, 2, 3, 4, 5]`, a profundidade da recursão é $\Theta(n)$ e o número de comparações é $\frac{n(n-1)}{2}$ ($\Theta(n^2)$). No entanto, como cada partição gera um filho direito vazio (descartado) e apenas um filho esquerdo $[0 \dots p-1]$, a pilha explícita mantém **no máximo 1 intervalo pendente** no momento do snapshot, e **0 intervalos pendentes** durante a inspeção interativa (pois o único filho é imediatamente ativado como `activeInterval`).
     - *Cenário que Acumula Intervalos Pendentes:* A ocupação da pilha varia conforme a fase da execução:
       1. *Ocupação transitória no snapshot `PIVOT_POSITIONED`:* Imediatamente após posicionar o pivô, ambos os subintervalos (filho direito e filho esquerdo) são empilhados caso sejam válidos ($low \le p-1$ e $p+1 \le high$). O caso $[1, 3, 2]$ ilustra isso concretamente: o pivô 2 posiciona-se no índice 1, gerando simultaneamente dois filhos unitários $[0 \dots 0]$ e $[2 \dots 2]$. Naquele snapshot pós-pivô, a pilha contém 2 intervalos pendentes (mesmo com $n=3$).
       2. *Consumo durante o avanço automático:* O laço puramente funcional de `advanceAutomaticSteps` desempilha sucessivamente o topo. Ao encontrar intervalos unitários ($low == high$), consolida-os diretamente com `BASE_CASE_RESOLVED` sem requerer agência do aluno, reduzindo a pilha a cada caso base resolvido.
       3. *Estado durante a inspeção interativa ativa:* Quando a partição seguinte inicia (`INSPECT_ELEMENT`), o intervalo ativo já foi extraído da pilha (`activeInterval`), restando na pilha apenas os subproblemas de níveis superiores ou irmãos direitos aguardando sua vez.
     - *Limite Assintótico Geral:* O acúmulo de intervalos pendentes cresce com bifurcações repetidas que deixam ramos pendentes enquanto o ramo esquerdo aprofunda, respeitando a cota assintótica estrita de **$O(n)$** de memória de controle no pior caso, sem dependência de cotas fechadas não demonstradas formalmente.

3. **Armazenamento Adicional do Histórico (`history`):**
   - Histórico imutável de eventos (`QuickStepRecord[]`) retido pela plataforma para Replay retrospectivo, auditoria e telemetria.
   - **Tamanho Físico dos Snapshots:** Cada snapshot armazena uma cópia rasa do array de referências aos elementos (`valuesSnapshot: readonly QuickElement[]`, com $n$ referências de ponteiros).
   - Com $m$ eventos na execução, o consumo de referências em memória é de **$O(m \cdot n)$ referências** ($m \in \Theta(n \log n)$ caso médio, $m \in \Theta(n^2)$ pior caso). Os objetos `QuickElement` permanecem imutáveis e compartilhados por referência.
   - **Separação entre Eventos Algorítmicos e Tentativas Pedagógicas:** Os registros do histórico gravam estritamente eventos da ordenação algorítmica (`PARTITION_START`, `CLASSIFY_ELEMENT`, `PIVOT_POSITIONED`, `BASE_CASE_RESOLVED`, `SORT_COMPLETE`). Decisões incorretas do estudante (erros conceituais) incrementam o contador `errors` no estado sem criar registros inflacionados de passos algorítmicos no histórico.

### 4.2. Convenção das Métricas Computacionais
- **Comparações de Dados ($C(n)$):** Contabiliza exatamente uma comparação relacional no momento da classificação correta. Erros não acrescentam comparações. Casos unitários geram 0 comparações;
- **Trocas entre Índices Distintos ($M(n)$):** Contabiliza permutas onde os dois índices são diferentes ($pos_1 \neq pos_2$). Troca entre índices diferentes conta mesmo quando os valores dos elementos forem iguais. Operação com o mesmo índice ($pos_1 == pos_2$) não faz escrita nem incrementa `swaps`;
- **Escritas no Vetor ($W(n)$):** Cada troca efetivamente executada entre índices distintos realiza exatamente **2 escritas** no vetor principal. Auto-trocas e erros geram 0 escritas;
- **Erros Pedagógicos (`errors`):** Decisões incorretas de classificação;
- **Pontuação do Protocolo:**
  $$\text{score} = \max(0, 100 - (\text{errors} \times 10) - (\text{hintsUsed} \times 5))$$

---

## 5. Arquitetura do Histórico para Replay Determinístico

Cada evento do histórico conterá metadados completos pós-evento e o contexto prévio da comparação:

```typescript
export interface QuickElement {
  readonly id: string;
  readonly value: number;
  readonly originalIndex: number;
  readonly label?: string;
}

export interface QuickIntervalContext {
  readonly low: number;
  readonly high: number;
}

export interface QuickComparisonContext {
  readonly elementIndex: number;
  readonly elementValue: number;
  readonly elementLabel?: string;
  readonly pivotIndex: number;
  readonly pivotValue: number;
  readonly pivotLabel?: string;
  readonly expectedDecision: 'LESS_OR_EQUAL' | 'GREATER';
}

export interface QuickStepRecord {
  readonly stepIndex: number;
  readonly eventType: QuickEventType;
  readonly pseudocodeLine: number;
  
  // Snapshots pós-evento:
  readonly valuesSnapshot: readonly QuickElement[];
  readonly sortedIndices: readonly number[];
  readonly activeInterval: QuickIntervalContext | null;
  readonly pendingIntervals: readonly QuickIntervalContext[];
  
  // Estado dos ponteiros:
  readonly i: number;
  readonly j: number;
  readonly pivotIndex: number | null;
  readonly pivotElement: QuickElement | null;
  
  // Contexto anterior da comparação (sem depender dos ponteiros já avançados):
  readonly comparisonContext?: QuickComparisonContext;
  
  // Métricas acumuladas:
  readonly comparisons: number;
  readonly swaps: number;
  readonly writesInArray: number;
  readonly errors: number;
}
```

---

## 6. Pseudocódigo Canônico (27 Linhas — `QUICK_SORT_PSEUDOCODE`)

```text
1.  procedimento quickSort(A, inicio, fim)
2.    se inicio < fim então
3.      p ← particionar(A, inicio, fim)
4.      quickSort(A, inicio, p - 1)
5.      quickSort(A, p + 1, fim)
6.    senão se inicio = fim então
7.      marcar A[inicio] como DEFINITIVO
8.    fim se
9.  fim procedimento
10.
11. procedimento particionar(A, inicio, fim)
12.   pivo ← A[fim]
13.   i ← inicio - 1
14.   para j de inicio até fim - 1 faça
15.     se A[j].valor ≤ pivo.valor então
16.       i ← i + 1
17.       se i ≠ j então
18.         trocar A[i] com A[j]
19.       fim se
20.     fim se
21.   fim para
22.   se i + 1 ≠ fim então
23.     trocar A[i + 1] com A[fim]
24.   fim se
25.   marcar A[i + 1] como DEFINITIVO
26.   retornar i + 1
27. fim procedimento
```

---

## 7. Rastreamento do Tutorial com Duplicatas (`[4a, 4b, 1, 2, 3]`)

- **Vetor Inicial:** `[4a, 4b, 1, 2, 3]` ($n=5$). Duplicatas $4a$ no índice 0 e $4b$ no índice 1.

### 1. Partição Raiz $[0 \dots 4]$, Pivô $P = 3$ ($A[4]$), $i = -1$
- $j=0$ ($A[0]=4a$): $4a.valor \le 3 \implies 4 \le 3$ (Falso). Classifica como maior que o pivô. $i = -1, j \leftarrow 1$. (1 comp, 0 swaps, 0 escritas).
- $j=1$ ($A[1]=4b$): $4b.valor \le 3 \implies 4 \le 3$ (Falso). Classifica como maior que o pivô. $i = -1, j \leftarrow 2$. (2 comp, 0 swaps, 0 escritas).
- $j=2$ ($A[2]=1$): $1.valor \le 3 \implies 1 \le 3$ (Verdadeiro). Classifica como $\le$ pivô. $i \leftarrow 0$. Como $i \neq j$ ($0 \neq 2$), troca $A[0]$ ($4a$) com $A[2]$ ($1$). Vetor: `[1, 4b, 4a, 2, 3]`. $j \leftarrow 3$. (3 comp, 1 swap, 2 escritas).
- $j=3$ ($A[3]=2$): $2.valor \le 3 \implies 2 \le 3$ (Verdadeiro). Classifica como $\le$ pivô. $i \leftarrow 1$. Como $i \neq j$ ($1 \neq 3$), troca $A[1]$ ($4b$) com $A[3]$ ($2$). Vetor: `[1, 2, 4a, 4b, 3]`. $j \leftarrow 4 = high$. (4 comp, 2 swaps, 4 escritas).
- Fim da varredura: Ação `Colocar o pivô na posição final`. Como $i + 1 = 2 \neq 4$, troca $A[2]$ ($4a$) com $A[4]$ ($3$).
  - **Vetor pós-partição raiz:** `[1, 2, 3 (OK), 4b, 4a]`.
  - Pivô 3 consolidado no índice $p = 2$ com `OK DEFINITIVO`.
  - Métricas acumuladas: 4 comparações, 3 trocas entre índices distintos, 6 escritas no vetor.
  - Empilha subintervalo direito $[3 \dots 4]$ e esquerdo $[0 \dots 1]$ (topo).

### 2. Subpartição Esquerda $[0 \dots 1]$ (`[1, 2]`), Pivô $P = 2$ ($A[1]$), $i = -1$
- $j=0$ ($A[0]=1$): $1.valor \le 2 \implies 1 \le 2$ (Verdadeiro). Classifica como $\le$ pivô. $i \leftarrow 0$. Como $i = j = 0$, omissão de auto-troca. $j \leftarrow 1 = high$. (5 comp, 3 swaps, 6 escritas).
- Fim da varredura: Ação `Colocar o pivô na posição final`. Como $i + 1 = 1 == high$, omissão de auto-troca. Pivô 2 consolidado no índice 1 com `OK DEFINITIVO`.
- Subintervalo $[0 \dots 0]$ (`[1]`): caso unitário consolidado com `OK DEFINITIVO` automaticamente (0 comp, 0 swaps).

### 3. Subpartição Direita $[3 \dots 4]$ (`[4b, 4a]`), Pivô $P = 4a$ ($A[4]$), $i = 2$
- $j=3$ ($A[3]=4b$):
  - Comparação relacional avalia exclusivamente `value`: $4b.valor \le 4a.valor \implies 4 \le 4$ (Verdadeiro).
  - Classifica como $\le$ pivô. $i \leftarrow 3$. Como $i = j = 3$, omissão de auto-troca. $j \leftarrow 4 = high$. (6 comp, 3 swaps, 6 escritas).
- Fim da varredura: Ação `Colocar o pivô na posição final`. Como $i + 1 = 4 == high$, omissão de auto-troca. Pivô $4a$ consolidado no índice 4 com `OK DEFINITIVO`.
- Subintervalo $[3 \dots 3]$ (`[4b]`): caso unitário consolidado com `OK DEFINITIVO` automaticamente.

### 4. Resultado Final e Evidência de Instabilidade
- **Vetor Final:** `[1, 2, 3, 4b, 4a]`.
- **Métricas Finais:** **6 comparações**, **3 trocas entre índices distintos**, **6 escritas no vetor**.
- **Observação da Instabilidade:** O elemento $4b$ (posição inicial 1) finalizou antes do elemento $4a$ (posição inicial 0). A ordem relativa das chaves iguais foi invertida, evidenciando de forma concreta que o Quick Sort não garante estabilidade.

---

## 8. Links e Referências

- **Código-fonte Afetado:** Futuro `src/game/sorting/quick/` (Marco P3.2-B)
- **Documentos da Wiki Relacionados:** [`docs/wiki/modules/quick-sort.md`](../wiki/modules/quick-sort.md), [`docs/wiki/04-sorting-engine.md`](../wiki/04-sorting-engine.md), [`docs/wiki/10-roadmap.md`](../wiki/10-roadmap.md)
- **ADRs Anteriores:** [`ADR 0022`](./0022-canonical-exercise-module-standardization.md), [`ADR 0023`](./0023-merge-sort-pedagogical-mechanical-design.md)
