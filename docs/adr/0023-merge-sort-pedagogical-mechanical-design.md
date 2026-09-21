# ADR 0023 — Design Pedagógico e Mecânico do Módulo Merge Sort (P3.1-A)

> **Status:** `PROPOSTO` (Aguarda revisão e aprovação antes da implementação técnica)  
> **Data:** 21/09/2026 (Revisão 2 — Especificação Refinada)  
> **Autor:** Equipe de Engenharia e Design Pedagógico (Sorting Station)  
> **Decisões Relacionadas:** [`ADR 0018`](./0018-game-to-educational-platform-transition.md), [`ADR 0019`](./0019-insertion-sort-pedagogical-layer-and-interactive-tutorial.md), [`ADR 0020`](./0020-insertion-interactive-practice-system.md), [`ADR 0021`](./0021-module-exercise-persistence-schema-v4.md), [`ADR 0022`](./0022-canonical-exercise-module-standardization.md).  
> **Documentos Afetados:** [`docs/wiki/modules/merge-sort.md`](../wiki/modules/merge-sort.md), [`docs/wiki/04-sorting-engine.md`](../wiki/04-sorting-engine.md), [`docs/wiki/10-roadmap.md`](../wiki/10-roadmap.md).

---

## 1. Contexto e Motivação

O **Sorting Station** consolidou a implementação dos três algoritmos elementares de complexidade assintótica quadrática $\Theta(n^2)$: **Bubble Sort**, **Selection Sort** e **Insertion Sort**, todos padronizados sob a arquitetura do **Schema v4** e do **Module Standard** ([`ADR 0021`](./0021-module-exercise-persistence-schema-v4.md) e [`ADR 0022`](./0022-canonical-exercise-module-standardization.md)).

Com o início do **Marco P3**, a plataforma avança para sua primeira família de algoritmos assintoticamente ótimos de tempo log-linear $\Theta(n \log n)$, iniciando pelo **Merge Sort** (Módulo 04).

Diferente dos algoritmos elementares — cujas mecânicas baseiam-se em permutas locais contíguas (Bubble), varredura seletiva global com permuta pontual (Selection) ou elevação de chave com deslocamentos sucessivos (Insertion) —, o Merge Sort introduz o paradigma de **Divisão e Conquista** (*Divide and Conquer*), operando através de:
1. Decomposição do arranjo em subproblemas menores até atingir subvetores unitários ($n=1$);
2. Intercalação ordenada (*merge*) de dois subvetores adjacentes previamente ordenados;
3. Uso de memória auxiliar ($O(n)$ posições) para acolher o fluxo combinado de dados antes da reinserção na esteira principal;
4. Preservação da estabilidade algorítmica ($O(n \log n)$ estável).

O desafio central deste sub-marco (**P3.1-A**) consiste em definir um design pedagógico e cinestésico próprio para o Merge Sort que:
- Não adapte indevidamente as mecânicas de permuta (*swaps*) dos módulos anteriores;
- Destaque com clareza a separação entre a **divisão estrutural** (que não ordena elementos) e a **intercalação** (onde ocorre todo o ordenamento factual);
- Evite carga cognitiva ociosa ou burocrática (eliminando cliques vazios para divisões estruturais ou cópias triviais na prática);
- Garanta agência reflexiva plena do estudante nos momentos determinantes da intercalação (confronto entre frentes de ramais, desempate estável e esgotamento lateral);
- Diferencie os subvetores ordenados localmente (`ORD`) da fixação global definitiva (`OK`).

---

## 2. Decisão Arquitetural e Pedagógica Proposta

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

### 2.3. Buffer Auxiliar e Recorrência Exata de Escritas
- O espaço auxiliar do Merge Sort é de **$O(n)$ posições/células**, correspondendo à capacidade máxima da esteira coletora temporária.
- A métrica de **Escritas** ($W(n)$) computa estritamente:
  1. $1$ escrita no buffer auxiliar por elemento despachado da frente de um ramal;
  2. $1$ escrita no vetor principal por elemento copiado de volta do buffer para $A[left \dots right]$.
  - Em cada etapa de intercalação de um intervalo de comprimento $L$, ocorrem exatamente $L$ escritas no buffer e $L$ escritas no vetor principal, totalizando $2L$ escritas.
- **Recorrência Canônica de Escritas:**
  $$W(0) = 0, \quad W(1) = 0$$
  $$W(n) = W\left(\left\lceil \frac{n}{2} \right\rceil\right) + W\left(\left\lfloor \frac{n}{2} \right\rfloor\right) + 2n, \quad \text{para } n \ge 2$$
- **Valores Exatos por Tamanho:**
  - **$n = 4$:** $W(4) = W(2) + W(2) + 2(4) = 4 + 4 + 8 = \mathbf{16 \text{ escritas}}$ (8 no buffer, 8 no vetor principal);
  - **$n = 5$:** $W(5) = W(3) + W(2) + 2(5) = 10 + 4 + 10 = \mathbf{24 \text{ escritas}}$ (12 no buffer, 12 no vetor principal), onde $W(3) = W(2) + W(1) + 2(3) = 4 + 0 + 6 = 10$;
  - **$n = 6$:** $W(6) = W(3) + W(3) + 2(6) = 10 + 10 + 12 = \mathbf{32 \text{ escritas}}$ (16 no buffer, 16 no vetor principal).
- *Nota de Rigor:* A contagem de escritas é uma métrica de operações ($O(n \log n)$), e **não** deve ser confundida com a medida de espaço auxiliar ($O(n)$).

### 2.4. Identidade Estável por Elemento
Para acompanhar os elementos ao longo da execução e verificar a estabilidade de forma observável, cada carga possui uma identidade imutável:
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
- **Regra de Estabilidade no Desempate:** Se $E[p_1].value == D[p_2].value$, a decisão correta é **obrigatoriamente despachar o elemento do Ramal Esquerdo ($p_1$)**. Como $p_1$ possuía índice original menor que $p_2$, priorizar a esquerda preserva a ordem relativa original.

### 2.5. Divisão de Agência: Estudante vs Sistema nas Práticas
Nas práticas curriculares, o foco cognitivo reside na tomada de decisão reflexiva da intercalação:
1. **Divisão Estrutural Automática:** O sistema anima a abertura dos ramais e atualiza o contexto da árvore sem exigir cliques repetitivos para partições triviais;
2. **Escolha entre Frentes pelo Estudante:** Quando ambos os ramais possuem cargas sob os sensores ópticos ($p_1 \le mid$ e $p_2 \le right$), o estudante comanda ativamente `DESPACHAR ESQUERDA` ou `DESPACHAR DIREITA`;
3. **Drenagem Lateral pelo Estudante:** Ao esvaziar um ramal, o botão `DESPACHAR RESTANTE` fica habilitado para que o estudante libere a cauda remanescente, fixando o conceito de que o restante já está ordenado e não consome comparações;
4. **Cópia de Retorno Automática:** Ao completar o buffer, o sistema consolida as cargas no vetor principal $A[left \dots right]$ com marcação `ORD` (ou `OK` na raiz), gerando evento rastreável no histórico;
5. **No Tutorial e Demonstração:** Admitem-se pausas explicativas antes da divisão e do retorno para scaffolding pedagógico, sem computá-las como decisões algorítmicas avaliadas.

---

## 3. Contratos Técnicos Propostos para a Engine

### 3.1. Máquina de Estados Finita (FSM)
A engine pura e imutável opera sob estados perfeitamente delimitados:

| Estado da FSM | Categoria | Descrição | Ação Esperada / Transição |
| :--- | :---: | :--- | :--- |
| `DIVIDE_AUTOMATIC` | Automático | O nó corrente é decomposto. Se $left < right$, empilha tarefas; se $left \ge right$, caso base imediato. | Transição pura automática para a próxima tarefa da pilha. |
| `COMPARE_HEADS` | **Interativo** | Ambos os ramais possuem cargas nas frentes ($p_1 \le mid$ e $p_2 \le right$). | Estudante comanda `DISPATCH_LEFT` ou `DISPATCH_RIGHT`. |
| `DRAIN_READY` | **Interativo** | Um ramal esgotou-se ($p_1 > mid$ ou $p_2 > right$); restam elementos no outro ramal. | Estudante comanda `DRAIN_REMAINDER`. |
| `COPY_BACK_AUTOMATIC` | Automático | Buffer totalmente preenchido ($k = len$). Cópia de volta para $A[left \dots right]$ e badge `ORD`/`OK`. | Transição pura automática para a próxima tarefa da pilha. |
| `COMPLETED` | Terminal | Intercalação raiz finalizada; todo o vetor atinge status `OK`. | Fim da prática. |

### 3.2. Contabilidade Estrita de Comparações e Erros
- **Registro Único por Par de Frentes:** A comparação relacional entre $E[p_1]$ e $D[p_2]$ é contabilizada **uma única vez** por par de frentes ativas.
- **Escolha Incorreta:** Se o estudante escolhe o elemento de maior valor, ou escolhe a direita sob empate:
  - Incrementa `errors`;
  - Exibe feedback explicativo formativo;
  - **Não** avança ponteiros, **não** executa escritas e **não** adiciona comparações algorítmicas repetidas ao contador.
- **Ação Impossível:** Tentar acionar `DISPATCH_LEFT` quando o ramal esquerdo está vazio, ou tentar acionar `DRAIN_REMAINDER` quando ambos os ramais ainda possuem cargas. Essas ações são bloqueadas pela UI; caso enviadas diretamente à engine, são ignoradas com **zero penalidade** (`errors` inalterado).

### 3.3. Modelo de History e Snapshots POST-Event
Todos os eventos de histórico gravam o estado **POST-event** (imediatamente após a ação) com dados estruturados suficientes para que a UI e o Replay reconstruam qualquer quadro sem reexecutar o algoritmo:
```typescript
export type MergeStepRecord =
  | {
      readonly type: "DIVIDE";
      readonly left: number;
      readonly mid: number;
      readonly right: number;
      readonly depth: number;
      readonly valuesSnapshot: readonly MergeElement[];
    }
  | {
      readonly type: "DISPATCH";
      readonly source: "LEFT" | "RIGHT";
      readonly element: MergeElement;
      readonly targetBufferIndex: number;
      readonly p1: number;
      readonly p2: number;
      readonly k: number;
      readonly bufferSnapshot: readonly (MergeElement | null)[];
      readonly valuesSnapshot: readonly MergeElement[];
    }
  | {
      readonly type: "DRAIN";
      readonly remainingSource: "LEFT" | "RIGHT";
      readonly drainedElements: readonly {
        readonly element: MergeElement;
        readonly targetBufferIndex: number;
      }[];
      readonly bufferSnapshot: readonly (MergeElement | null)[];
      readonly valuesSnapshot: readonly MergeElement[];
    }
  | {
      readonly type: "COPY_BACK";
      readonly left: number;
      readonly right: number;
      readonly copiedElements: readonly {
        readonly element: MergeElement;
        readonly targetIndex: number;
      }[];
      readonly isRootMerge: boolean;
      readonly valuesSnapshot: readonly MergeElement[];
    };
```

### 3.4. Motor Puro e Pilha Explícita de Tarefas
Para garantir que a engine seja pura, serializável, pausável e imutável sem depender da pilha nativa de chamadas do JavaScript, o estado mantém uma pilha explícita de tarefas de recursão:
```typescript
export type MergeTask =
  | { readonly type: "DIVIDE"; readonly left: number; readonly right: number; readonly depth: number }
  | { readonly type: "MERGE_INIT"; readonly left: number; readonly mid: number; readonly right: number; readonly depth: number };
```
Ao processar `DIVIDE(left, right)` com $left < right$, empilham-se em ordem LIFO:
1. `MERGE_INIT(left, mid, right)`
2. `DIVIDE(mid + 1, right)`
3. `DIVIDE(left, mid)`
Ao desempilhar, `DIVIDE(left, mid)` é executado primeiro, garantindo a travessia pós-ordem à esquerda de forma puramente funcional.

---

## 4. Consequências e Benefícios da Proposta

- **Precisão Matemática:** A recorrência formal $W(n) = W(\lceil n/2 \rceil) + W(\lfloor n/2 \rfloor) + 2n$ reflete fielmente a contagem de transferências reais, diferenciando escritas de memória auxiliar.
- **Rastreabilidade Factual de Estabilidade:** O uso de `MergeElement` garante que o Replay e os testes unitários auditem formalmente a estabilidade com chaves idênticas.
- **Ergonomia e Clareza de FSM:** A divisão explícita entre transições automáticas (`DIVIDE_AUTOMATIC`, `COPY_BACK_AUTOMATIC`) e estados interativos (`COMPARE_HEADS`, `DRAIN_READY`) elimina ambiguidades de contagem e previne penalidades indevidas ao estudante.

---

## 5. Próximos Passos (Transição para P3.1-B)

Após a aprovação desta especificação refinada:
1. Sub-marco **P3.1-B**: Implementação funcional da engine em `src/game/sorting/merge/mergeSortEngine.ts`, tipos em `types.ts` e suíte completa de testes no Vitest (`mergeSortEngine.test.ts`);
2. Sub-marco **P3.1-C**: Camada pedagógica, constraints Mulberry32, briefing oficial, tutorial guiado e demonstração canônica;
3. Sub-marco **P3.1-D**: Estação de confluência visual e integração com o Seletor de Práticas;
4. Sub-marco **P3.1-E**: Replay retrospectivo e pseudocódigo sincronizado;
5. Sub-marco **P3.1-F**: Persistência Schema v4 (`merge.practice.*`) e homologação no Hub.
