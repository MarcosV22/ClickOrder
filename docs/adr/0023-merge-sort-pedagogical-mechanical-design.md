# ADR 0023 — Design Pedagógico e Mecânico do Módulo Merge Sort (P3.1-A / P3.1-B / P3.1-C / P3.1-D)

> **Status:** `ACEITO` (Design pedagógico aprovado em P3.1-A; Engine pura em P3.1-B; Camada pedagógica em P3.1-C; Estação de Intercalação e Seletor homologados em P3.1-D)  
> **Data:** 22/09/2026 (Marco P3.1-D)  
> **Autor:** Equipe de Engenharia e Design Pedagógico (Sorting Station)  
> **Decisões Relacionadas:** [`ADR 0018`](./0018-game-to-educational-platform-transition.md), [`ADR 0019`](./0019-insertion-sort-pedagogical-layer-and-interactive-tutorial.md), [`ADR 0020`](./0020-insertion-interactive-practice-system.md), [`ADR 0021`](./0021-module-exercise-persistence-schema-v4.md), [`ADR 0022`](./0022-canonical-exercise-module-standardization.md).  
> **Documentos Afetados:** [`docs/wiki/modules/merge-sort.md`](../wiki/modules/merge-sort.md), [`docs/wiki/04-sorting-engine.md`](../wiki/04-sorting-engine.md), [`docs/wiki/08-testing-and-quality.md`](../wiki/08-testing-and-quality.md), [`docs/wiki/10-roadmap.md`](../wiki/10-roadmap.md).

---

## 1. Contexto e Motivação

O **Sorting Station** consolidou a implementação dos três algoritmos elementares de complexidade assintótica quadrática $\Theta(n^2)$: **Bubble Sort**, **Selection Sort** e **Insertion Sort**, todos padronizados sob a arquitetura do **Schema v4** e do **Module Standard** ([`ADR 0021`](./0021-module-exercise-persistence-schema-v4.md) e [`ADR 0022`](./0022-canonical-exercise-module-standardization.md)).

Com o início do **Marco P3**, a plataforma avança para sua primeira família de algoritmos assintoticamente ótimos de tempo log-linear $\Theta(n \log n)$, iniciando pelo **Merge Sort** (Módulo 04).

Diferente dos algoritmos elementares — cujas mecânicas baseiam-se em permutas locais contíguas (Bubble), varredura seletiva global com permuta pontual (Selection) ou elevação de chave com deslocamentos sucessivos (Insertion) —, o Merge Sort introduz o paradigma de **Divisão e Conquista** (*Divide and Conquer*), operando através de:
1. Decomposição do arranjo em subproblemas menores até atingir subvetores unitários ($n=1$);
2. Intercalação ordenada (*merge*) de dois subvetores adjacentes previamente ordenados;
3. Uso de memória auxiliar ($O(n)$ posições) para acolher o fluxo combinado de dados antes da reinserção na esteira principal;
4. Preservação da estabilidade algorítmica ($O(n \log n)$ estável).

O desafio central dos sub-marcos **P3.1-A**, **P3.1-B** e **P3.1-C** consistiu em:
- Definir um design pedagógico e cinestésico próprio para o Merge Sort;
- Destaque com clareza da separação entre a **divisão estrutural** (que não ordena elementos) e a **intercalação** (onde ocorre todo o ordenamento factual);
- Eliminar carga cognitiva ociosa (divisão e cópia de retorno automáticas nas práticas);
- Garantir agência reflexiva plena do estudante nos momentos determinantes da intercalação (confronto entre frentes de ramais, desempate estável e esgotamento lateral);
- Entregar uma engine funcionalmente pura, serializável, imutável e desacoplada de UI/timers;
- Implementar a camada pedagógica canônica: gerador procedural com restrições pedagógicas, catálogo de práticas, tutorial guiado com desempate reflexivo, demonstração autônoma canônica e briefing oficial sem vazamento de FSM.

---

## 2. Decisão Arquitetural e Pedagógica

### 2.1. Variante Canônica do Algoritmo e Justificativa Didática
Fica estabelecida a variante **Merge Sort Top-Down Recursivo Clássico**, com processamento pós-ordem à esquerda (*left-first post-order traversal*):
1. $\text{mergeSort}(left, mid)$ — Ramo Esquerdo;
2. $\text{mergeSort}(mid + 1, right)$ — Ramo Direito;
3. $\text{intercalar}(left, mid, right)$ — Intercalação das duas metades ordenadas.

**Justificativa Didática Específica do Projeto:**  
A variante Top-Down com travessia pós-ordem à esquerda foi selecionada por alinhar-se perfeitamente aos objetivos pedagógicos da plataforma: ela expõe visualmente a decomposição de problemas em subproblemas idênticos, reforça o raciocínio recursivo estruturado e conecta-se diretamente à metáfora física das esteiras industriais que se bifurcam hierarquicamente e confluem em estações de triagem. A abordagem Bottom-Up (iterativa com blocos em potências de 2), embora evite pilha recursiva em linguagens de baixo nível, oculta a intuição visual de ramificação e torna a árvore de divisão menos evidente para iniciantes.

### 2.2. Convenção de Limites de Intervalos e Ramais como Janelas
- Os limites dos intervalos são expressos como $[left, right]$ **fechados e inclusivos** ($0 \le left \le right \le n - 1$).
- Ponto médio truncado:
  $$mid = \left\lfloor \frac{left + right}{2} \right\rfloor = left + \left\lfloor \frac{right - left}{2} \right\rfloor$$
- **Ramais como Intervalos do Vetor Principal:** Os ramais de confluência não realizam cópias prévias ocultas dos dados. O Ramal Esquerdo é a janela direta sobre $A[left \dots mid]$ e o Ramal Direito é a janela direta sobre $A[mid + 1 \dots right]$.
- **Divisão em Tamanhos Ímpares:** Para um intervalo de comprimento $n$, o ramo esquerdo recebe $\lceil n/2 \rceil$ elementos e o direito recebe $\lfloor n/2 \rfloor$ elementos. Exemplo para $n=5$ em $[0 \dots 4]$:
  $mid = \lfloor (0+4)/2 \rfloor = 2 \implies \text{Esquerda: } [0 \dots 2] \text{ (3 elementos)}; \text{ Direita: } [3 \dots 4] \text{ (2 elementos)}$.
- **Caso Base:** Quando $left \ge right$ (tamanho do intervalo $\le 1$), o subvetor está trivialmente ordenado por definição axiomática, não gerando chamadas de intercalação nem comparações de dados.

### 2.3. Buffer Auxiliar vs Memória do Histórico de Snapshots
Fica expressamente diferenciado na documentação e arquitetura:
1. **Espaço Auxiliar do Algoritmo:** Estritamente **$O(n)$ posições/células físicas**, correspondendo à capacidade máxima da esteira coletora temporária alocada em cada intercalação para acolher até $n$ elementos antes da cópia de retorno para a esteira principal. O buffer auxiliar é descartado e reciclado entre sucessivas intercalações.
2. **Memória de Infraestrutura Educacional (Snapshots do Histórico):**
   - O histórico de execução grava $m \in O(n \log n)$ eventos imutáveis (`MergeStepRecord[]`), emitidos a cada passo da FSM.
   - Cada evento retém uma cópia rasa (*shallow copy*) `valuesSnapshot: readonly MergeElement[]` de comprimento $n$.
   - Consequentemente, a retenção de referências em memória da sessão escala como $O(m \cdot n) = O(n^2 \log n)$ referências de ponteiros durante a execução da atividade.
   - Os elementos subjacentes (`MergeElement`) são **estritamente imutáveis e compartilhados por referência** entre todos os snapshots (zero clonagem profunda de objetos de carga).
   - Para os tamanhos curriculares do módulo ($n \in [4, 6]$), o histórico gera apenas entre 12 e 30 eventos, representando meras dezenas de referências em memória (~50 a 180 ponteiros), custo desprezível em JavaScript moderno que prescinde de redesenho ou desnormalização complexa.
   - Essa retenção de referências permite que o **Replay Retrospectivo** e a **Auditoria de Fatos** percorram ou saltem para qualquer passo arbitrário no tempo em $O(1)$ sem reexecutar uma única decisão algorítmica da engine (`reconstructMergeStepAt`).

### 2.4. Recorrência Exata de Escritas
A métrica de **Escritas** ($W(n)$) computa estritamente:
1. $1$ escrita no buffer auxiliar por elemento despachado da frente de um ramal ou drenado da cauda remanescente;
2. $1$ escrita no vetor principal por elemento copiado de volta do buffer para $A[left \dots right]$.
- Em cada etapa de intercalação de um intervalo de comprimento $L$, ocorrem exatamente $L$ escritas no buffer e $L$ escritas no vetor principal, totalizando $2L$ escritas.
- **Recorrência Canônica de Escritas:**
  $$W(0) = 0, \quad W(1) = 0$$
  $$W(n) = W\left(\left\lceil \frac{n}{2} \right\rceil\right) + W\left(\left\lfloor \frac{n}{2} \right\rfloor\right) + 2n, \quad \text{para } n \ge 2$$
- **Valores Exatos por Tamanho:**
  - **$n = 4$:** $W(4) = W(2) + W(2) + 2(4) = 4 + 4 + 8 = \mathbf{16 \text{ escritas}}$ (8 no buffer, 8 no vetor principal);
  - **$n = 5$:** $W(5) = W(3) + W(2) + 2(5) = 10 + 4 + 10 = \mathbf{24 \text{ escritas}}$ (12 no buffer, 12 no vetor principal), onde $W(3) = W(2) + W(1) + 2(3) = 4 + 0 + 6 = 10$;
  - **$n = 6$:** $W(6) = W(3) + W(3) + 2(6) = 10 + 10 + 12 = \mathbf{32 \text{ escritas}}$ (16 no buffer, 16 no vetor principal).
- *Distinção Obrigatória:* A contagem de escritas é uma métrica de operações computacionais ($O(n \log n)$) e **não** mede espaço auxiliar ($O(n)$).

### 2.5. Identidade Estável por Elemento
Cada carga possui identidade imutável:
```typescript
export interface MergeElement {
  readonly id: string;            // Identificador único persistente (ex.: "elem-0-v3")
  readonly value: number;         // Valor numérico de ordenação (1..99)
  readonly originalIndex: number; // Posição de origem no vetor bruto (0..n-1)
  readonly label?: string;        // Rótulo diegético visual (ex.: "3a", "3b")
}
```
- A comparação algorítmica avalia **exclusivamente** `element.value`.
- A identidade (`id`, `originalIndex`, `label`) permanece inalterada em todas as transferências.
- **Regra de Estabilidade no Desempate:** Se $E[p_1].value == D[p_2].value$, a decisão correta é **obrigatoriamente despachar o elemento do Ramal Esquerdo ($p_1$)**. Priorizar a esquerda preserva a ordem relativa original.

### 2.6. Divisão de Agência nas Práticas
1. **Divisão Estrutural Automática:** O sistema anima a abertura dos ramais e calcula limites $mid$;
2. **Escolha entre Frentes pelo Estudante:** Quando ambos os ramais possuem cargas sob os sensores ($p_1 \le mid$ e $p_2 \le right$), o estudante comanda `DISPATCH_LEFT` ou `DISPATCH_RIGHT`;
3. **Drenagem Lateral pelo Estudante:** Ao esvaziar um ramal, o estudante aciona `DRAIN_REMAINDER` para liberar a cauda remanescente, fixando que ela já está ordenada e consome 0 comparações;
4. **Cópia de Retorno Automática:** Ao completar o buffer, as cargas retornam para $A[left \dots right]$ com marcação `ORD` (ou `OK` na raiz);
5. **No Tutorial e Demonstração:** Admitem-se pausas explicativas antes da divisão e do retorno para scaffolding pedagógico, sem computá-las como decisões algorítmicas avaliadas.

---

## 3. Contratos Técnicos Implementados na Engine (`P3.1-B`)

### 3.1. Máquina de Estados Finita (FSM)
A engine opera sob estados perfeitamente delimitados:

| Estado da FSM | Categoria | Descrição | Ação Esperada / Transição |
| :--- | :---: | :--- | :--- |
| `DIVIDE_AUTOMATIC` | Automático | O nó corrente é decomposto. Se $left < right$, empilha tarefas; se $left \ge right$, caso base imediato. | Transição pura automática. |
| `COMPARE_HEADS` | **Interativo** | Ambos os ramais possuem cargas nas frentes ($p_1 \le mid$ e $p_2 \le right$). | Estudante comanda `DISPATCH_LEFT` ou `DISPATCH_RIGHT`. |
| `DRAIN_READY` | **Interativo** | Um ramal esgotou-se ($p_1 > mid$ ou $p_2 > right$); restam elementos no outro ramal. | Estudante comanda `DRAIN_REMAINDER`. |
| `COPY_BACK_AUTOMATIC` | Automático | Buffer totalmente preenchido ($k = len$). Cópia de volta para $A[left \dots right]$ e badge `ORD`/`OK`. | Transição pura automática. |
| `COMPLETED` | Terminal | Intercalação raiz finalizada; todo o vetor atinge status `OK`. | Fim da prática. |

### 3.2. Contabilidade Estrita de Comparações e Erros
- **Registro Único por Par de Frentes:** A comparação relacional entre $E[p_1]$ e $D[p_2]$ é contabilizada **uma única vez** por par de frentes ativas.
- **Escolha Incorreta:** Se o estudante escolhe o elemento de maior valor, ou escolhe a direita sob empate:
  - Incrementa `errors` (+1);
  - Exibe feedback explicativo formativo;
  - **Não** avança ponteiros, **não** executa escritas e **não** adiciona comparações algorítmicas repetidas ao contador.
- **Ação Impossível:** Ações inviáveis para a fase corrente (ex.: tentar `DRAIN_REMAINDER` em `COMPARE_HEADS` ou `DISPATCH` em `DRAIN_READY`) são ignoradas com **zero penalidade** (`errors` inalterado).

### 3.3. Modelo de History com Registro Explícito de Inicialização (`MERGE_INIT`)
Todos os eventos gravam o estado **POST-event** com snapshots imutáveis:
```typescript
export type MergeStepRecord =
  | MergeDivideStepRecord      // type: "DIVIDE", left, mid, right, depth, valuesSnapshot
  | MergeInitStepRecord        // type: "MERGE_INIT", left, mid, right, depth, p1, p2, k: 0, bufferSnapshot, valuesSnapshot
  | MergeDispatchStepRecord    // type: "DISPATCH", source, element, targetBufferIndex, p1, p2, k, comparisonCounted, bufferSnapshot, valuesSnapshot
  | MergeDrainStepRecord       // type: "DRAIN", remainingSource, drainedElements, p1, p2, k, bufferSnapshot, valuesSnapshot
  | MergeCopyBackStepRecord;   // type: "COPY_BACK", left, right, copiedElements, isRootMerge, valuesSnapshot, bufferSnapshot
```

### 3.4. Motor Puro e Pilha Explícita de Tarefas
```typescript
export type MergeTask =
  | { readonly type: "DIVIDE"; readonly left: number; readonly right: number; readonly depth: number }
  | { readonly type: "MERGE_INIT"; readonly left: number; readonly mid: number; readonly right: number; readonly depth: number };
```
Ao processar `DIVIDE(left, right)` com $left < right$, empilham-se em ordem LIFO:
1. `MERGE_INIT(left, mid, right)`
2. `DIVIDE(mid + 1, right)`
3. `DIVIDE(left, mid)`
Ao desempilhar, `DIVIDE(left, mid)` é executado primeiro, garantindo a travessia pós-ordem à esquerda sem recursão imperativa de runtime.

### 3.5. Pseudocódigo Canônico Refinado (30 Linhas — `MERGE_SORT_PSEUDOCODE`)
```text
 1. procedimento mergeSort(A, inicio, fim)
 2.   se inicio < fim então
 3.     meio ← ⌊(inicio + fim) / 2⌋
 4.     mergeSort(A, inicio, meio)
 5.     mergeSort(A, meio + 1, fim)
 6.     intercalar(A, inicio, meio, fim)
 7.   fim se
 8. fim procedimento
 9. 
10. procedimento intercalar(A, inicio, meio, fim)
11.   Buffer ← alocar buffer de tamanho (fim - inicio + 1)
12.   p1 ← inicio, p2 ← meio + 1, k ← 0
13.   enquanto p1 ≤ meio e p2 ≤ fim faça
14.     se A[p1].value ≤ A[p2].value então
15.       Buffer[k] ← A[p1]; p1 ← p1 + 1
16.     senão
17.       Buffer[k] ← A[p2]; p2 ← p2 + 1
18.     fim se
19.     k ← k + 1
20.   fim enquanto
21.   enquanto p1 ≤ meio faça
22.     Buffer[k] ← A[p1]; p1 ← p1 + 1; k ← k + 1
23.   fim enquanto
24.   enquanto p2 ≤ fim faça
25.     Buffer[k] ← A[p2]; p2 ← p2 + 1; k ← k + 1
26.   fim enquanto
27.   para idx de 0 até (fim - inicio) faça
28.     A[inicio + idx] ← Buffer[idx]
29.   fim para
30. fim procedimento
```

#### Mapeamento com a FSM da Engine:
- `DIVIDE_AUTOMATIC`: Linhas 2–5 (`se inicio < fim`, cálculo de `meio` e recursão);
- `MERGE_INIT`: Linhas 11–12 (alocação do buffer e inicialização de ponteiros $p_1, p_2, k=0$);
- `COMPARE_HEADS`: Linhas 13–14 (`enquanto...`, confronto relacional `A[p1].value ≤ A[p2].value`);
- `DISPATCH_LEFT`: Linha 15 (`Buffer[k] ← A[p1]; p1 ← p1 + 1; k ← k + 1`);
- `DISPATCH_RIGHT`: Linha 17 (`Buffer[k] ← A[p2]; p2 ← p2 + 1; k ← k + 1`);
- `DRAIN_READY`: Linhas 21–26 (drenagem dos remanescentes com $k \leftarrow k + 1$);
- `COPY_BACK_AUTOMATIC`: Linhas 27–29 (cópia de retorno de todos os elementos para a esteira principal).

---

## 4. Estado da Implementação (Distinção entre Design e Entregável)

| Componente | Status Factual | Sub-marco | Evidência de Homologação |
| :--- | :---: | :---: | :--- |
| **Design Pedagógico e Mecânico** | `APROVADO` | P3.1-A | ADR 0023 e `docs/wiki/modules/merge-sort.md` |
| **Engine Funcional Pura** | `IMPLEMENTADO` | P3.1-B | `src/game/sorting/merge/mergeSortEngine.ts` |
| **Contratos de Tipos e History** | `IMPLEMENTADO` | P3.1-B | `src/game/sorting/merge/types.ts` |
| **Suíte de Testes Unitários da Engine** | `HOMOLOGADO` | P3.1-B | `src/game/sorting/merge/mergeSortEngine.test.ts` (22/22 testes verdes) |
| **Camada Pedagógica e Constraints** | `HOMOLOGADO` | P3.1-C | `src/game/sorting/merge/mergeConstraints.ts`, `mergePedagogy.ts`, `practiceCatalog.ts` (14 testes verdes) |
| **Tutorial Guiado [4a, 1, 3, 4b]** | `HOMOLOGADO` | P3.1-C | `src/game/sorting/merge/mergeTutorialGuide.ts` (5 testes verdes) |
| **Demonstração Canônica [7, 2, 5, 3]** | `HOMOLOGADO` | P3.1-C | `src/game/demonstration/mergeDemonstration.ts` (8 testes verdes) |
| **Briefing Oficial (merge-canonical)** | `HOMOLOGADO` | P3.1-C | `src/game/briefing/briefingCatalog.ts` (4 testes verdes) |
| **Reconstrução de Visual Frames** | `HOMOLOGADO` | P3.1-C | `deriveMergeFramesFromHistory` e `reconstructMergeStepAt` em `mergeSortEngine.ts` |
| **Estação de Intercalação (UI)**| `HOMOLOGADO` | P3.1-D | `src/screens/MergeGameScreen.tsx` desktop-first, confluência de ramais, buffer auxiliar, botoeira com `GameButton` (1/2/3), trava de ação, reduced motion |
| **Seletor de Práticas e Resultados** | `HOMOLOGADO` | P3.1-D | `PracticeSelector.tsx` (tema merge), `ResultScreen.tsx` com telemetria segregada e roteamento no `App.tsx` |
| **Suíte de Testes do Fluxo Merge** | `HOMOLOGADO` | P3.1-D | `src/screens/mergePracticeFlow.test.tsx` (15 testes comportamentais verdes; 68 no módulo total) |
| **Replay Retrospectivo** | `PENDENTE` | P3.1-E | Aguardando sub-marco P3.1-E |
| **Persistência Schema v4 (`merge.*`)** | `PENDENTE` | P3.1-F | Aguardando sub-marco P3.1-F |

---

## 5. Próximos Passos (Transição para P3.1-E)

Com a aprovação e homologação técnica de P3.1-A, P3.1-B, P3.1-C e P3.1-D (481 testes verdes em 35 arquivos de teste):
1. Sub-marco **P3.1-E** (`PRÓXIMO SUB-MARCO`): Replay retrospectivo e pseudocódigo sincronizado de 30 linhas com depurador temporal passo a passo e derivação pura a partir de `deriveMergeFramesFromHistory`;
2. Sub-marco **P3.1-F**: Persistência Schema v4 (`merge.practice.*`), registro no Hub de Protocolos e ativação pública do Módulo 04.
