# Módulo 06 — Heap Sort

> **Documento canônico do módulo curricular:** Especificação integral do Módulo de Heap Sort da plataforma **Sorting Station**.  
> **Status de Implementação:** `FUTURO` (Marco P3; algoritmo de Árvore Quase Completa e Seleção Otimizada; engine, visualização de heap e afundamento em planejamento).  
> **Data de Atualização:** 15/09/2026 (Marco PLATFORM-R0)  
> **Dependências:** [`AGENTS.md`](../../../AGENTS.md), [`ADR 0018`](../../adr/0018-game-to-educational-platform-transition.md), [`modules/README.md`](./README.md), [`04-sorting-engine.md`](../04-sorting-engine.md), [`10-roadmap.md`](../10-roadmap.md).

---

## 1. Identificação do Módulo

- **Nome Canônico:** Heap Sort (Ordenação por Monte / Fila de Prioridades Implícita)
- **Identificador de Sistema (`moduleId`):** `heap`
- **Rótulo Diegético na Interface:** `PROTOCOLO: HEAP SORT // PIRÂMIDE LOGÍSTICA E EXTRAÇÃO DE PRIORIDADE`
- **Status Factual:** `FUTURO` (Marco P3 da Plataforma)
- **Classificação Curricular:** Algoritmo Avançado de Seleção com Estrutura de Dados em Árvore Implícita
- **Complexidade Temporal:**
  - **Melhor Caso:** $\Theta(n \log n)$ (ou $\Omega(n)$ com chaves todas idênticas)
  - **Caso Médio:** $\Theta(n \log n)$
  - **Pior Caso:** $\Theta(n \log n)$ (garantia analítica estrita sem pior caso quadrático)
- **Complexidade Espacial (Memória Auxiliar):** $O(1)$ (totalmente in-place sobre o vetor)
- **Estabilidade Formal:** Instável (as permutas verticais de afundamento e a extração da raiz não preservam a ordem relativa de chaves iguais)
- **Tema Visual e Acentos:** Dourado / Âmbar Cósmico (`#fbbf24` e `#d97706`), arquitetura piramidal de nós interconectados

---

## 2. Objetivos de Aprendizagem

Ao concluir o Módulo de Heap Sort, o estudante deverá ser capaz de:
1. **Lembrar:** Identificar a propriedade fundamental do max-heap ($A[pai] \ge \max(A[filho\_esq], A[filho\_dir])$) e o mapeamento aritmético implícito de índices de nós sobre o vetor ($2i + 1$ e $2i + 2$).
2. **Entender:** Explicar a divisão do algoritmo em duas fases distintas: Fase 1 (Construção do Heap em tempo linear $O(n)$) e Fase 2 (Extração sucessiva do máximo e afundamento em tempo $O(n \log n)$).
3. **Aplicar:** Executar o procedimento de afundamento (*sift-down* / *heapify*), comparando um nó pai com seus dois filhos e promovendo o maior filho quando a propriedade de heap for violada.
4. **Analisar:** Reconhecer por que o Heap Sort combina a complexidade garantida $O(n \log n)$ do Merge Sort com a ausência de memória auxiliar $O(1)$ do Selection Sort.
5. **Avaliar:** Identificar o impacto de padrões de acesso à memória não contíguos (*poor cache locality*) em arquiteturas reais modernas.

---

## 3. Modelo Mental e Metáfora Visual

- **A Central Logística:** A *"Torre de Empilhamento e Triagem Gravitacional"*. As cargas não ficam apenas em linha reta; elas se organizam simultaneamente em uma pirâmide hierárquica.
- **A Visualização Dupla Sincronizada:**
  - **Na Esteira Horizontal:** As caixas aparecem na sequência usual de índices $[0, 1, \dots, n-1]$.
  - **Na Pirâmide Superior:** A mesma carga projeta um holograma tridimensional como um nó de uma árvore binária quase completa conectada por cabos de energia aos seus nós filhos ($2i + 1$ e $2i + 2$).
- **O Topo da Pirâmide (Raiz / Índice 0):** A posição que sempre abriga a maior carga de todo o monte.
- **O Afundamento (*Sift-Down*):** Uma carga mais leve colocada no topo da pirâmide é pesada demais para sustentar cargas maiores abaixo dela; ela "afunda" trocando de lugar com a maior de suas filhas até que a estabilidade gravitacional seja restaurada.
- **A Extração e Armazenamento Definitivo:** O guindaste transfere a maior carga da raiz (índice 0) para o final da esteira (índice $n - 1 - i$), travando-a com o selo esmeralda `OK`. O monte diminui em 1 nó, e o processo se repete.

---

## 4. Operações Fundamentais e Invariantes

### 4.1. Mapeamento Aritmético de Nós
Para qualquer nó de índice $i$ ($0$-indexado):
- $\text{Pai}(i) = \lfloor (i - 1) / 2 \rfloor$ (para $i > 0$);
- $\text{FilhoEsquerdo}(i) = 2i + 1$;
- $\text{FilhoDireito}(i) = 2i + 2$.

### 4.2. Invariante do Max-Heap
Para todo nó $i$ tal que $2i + 1 < \text{tamanho\_heap}$:
$$A[i] \ge A[2i + 1] \quad \text{e} \quad (2i + 2 < \text{tamanho\_heap} \implies A[i] \ge A[2i + 2])$$

### 4.3. Invariante da Fase de Extração
No início da iteração $i$ da extração ($i$ descendo de $n-1$ até $1$):
- O subvetor $A[0 \dots i]$ obedece à propriedade de max-heap;
- O subvetor $A[i+1 \dots n-1]$ está estritamente ordenado e contém os $n - 1 - i$ maiores elementos do vetor original.

---

## 5. Mecânica Interativa Própria

- **Comutador de Visão (Esteira vs. Árvore):** O estudante pode alternar entre a esteira linear convencional e o diagrama em árvore, ou visualizar ambos em tela dividida sincronizada.
- **Botoeira de Afundamento (*Sift-Down*):** Ao inspecionar o nó pai com filhos que violam a propriedade:
  - `[ ⬈ PROMOVER FILHO ESQUERDO ]` (se filho esquerdo for o maior);
  - `[ ⬈ PROMOVER FILHO DIREITO ]` (se filho direito for o maior);
  - `[ ⚓ HEAP ESTÁVEL ]` (se o pai já for maior ou igual a ambos).
- **Ação de Extração da Raiz:** Botão `[ ⇄ TRANSFERIR RAIZ PARA O FIM ]` que permuta $A[0]$ com a última vaga ativa do heap e diminui a fronteira do monte.

---

## 6. Pseudocódigo Canônico (23 Instruções — `HEAP_SORT_PSEUDOCODE`)

```text
1.  procedimento heapSort(A)
2.    // Fase 1: Construção do Max-Heap
3.    para i de ⌊n / 2⌋ - 1 descendo até 0 faça
4.      afundar(A, n, i)
5.    fim para
6.
7.    // Fase 2: Extração Sucessiva
8.    para i de n - 1 descendo até 1 faça
9.      trocar A[0] e A[i]
10.     afundar(A, i, 0)
11.   fim para
12. fim procedimento
13.
14. procedimento afundar(A, tam, i)
15.   maior ← i
16.   esq ← 2 * i + 1; dir ← 2 * i + 2
17.   se esq < tam e A[esq] > A[maior] então maior ← esq fim se
18.   se dir < tam e A[dir] > A[maior] então maior ← dir fim se
19.   se maior ≠ i então
20.     trocar A[i] e A[maior]
21.     afundar(A, tam, maior)
22.   fim se
23. fim procedimento
```

---

## 7. Métricas Factuais Adequadas ao Algoritmo

- **Comparações de Nós ($C(n)$):** Contabiliza comparações entre filhos e entre o maior filho e o pai.
- **Permutas de Afundamento ($M(n)$):** Trocas verticais na árvore e trocas de extração de raiz.
- **Tamanho Corrente do Heap:** Capacidade ativa do monte decrementando de $n$ até $1$.
- **Decisões Incorretas (`errors`):** Promover o filho menor ou declarar estabilidade quando há violação.
- **Pontuação do Protocolo:**
  $$\text{score} = \max(0, 100 - (\text{errors} \times 10) - (\text{hintsUsed} \times 5))$$

---

## 8. Modo Demonstração

- **Propósito:** Visualizar a transformação da esteira desordenada em pirâmide e a cascata de extrações.
- **Vetor Curado Canônico:** `[4, 10, 3, 5, 1]` ($n=5$).
- **Etapas da Demonstração:**
  - Montagem do heap: afunda nós internos resultando no max-heap `[10, 5, 3, 4, 1]`.
  - Extração 1: troca raiz 10 com 1 $\rightarrow [1, 5, 3, 4 | 10]$; afunda 1 $\rightarrow [5, 4, 3, 1 | 10]$.
  - Extração 2: troca 5 com 1 $\rightarrow [1, 4, 3 | 5, 10]$; afunda 1 $\rightarrow [4, 1, 3 | 5, 10]$.
  - Extração 3: troca 4 com 3 $\rightarrow [3, 1 | 4, 5, 10]$; afunda 3 $\rightarrow [3, 1 | 4, 5, 10]$.
  - Extração 4: troca 3 com 1 $\rightarrow [1 | 3, 4, 5, 10]$. Conclusão: `[1, 3, 4, 5, 10]`.

---

## 9. Tutorial Guiado

- **Vetor de Scaffolding:** `[2, 8, 5]` ($n=3$).
- **Etapas:** O estudante constrói um heap simples de 3 elementos promovendo o 8 para a raiz (`[8, 2, 5]`), troca o 8 com o final e estabiliza o subvetor restante.

---

## 10. Tipos de Exercícios Suportados

| Tipo de Exercício | Suporte no Módulo | Planejamento de Implementação |
| :--- | :---: | :--- |
| **Introdução / Conceito** | `OBRIGATÓRIO` | Briefing de Max-Heap e Fila de Prioridades |
| **Demonstração** | `OBRIGATÓRIO` | Demonstração com árvore binária conectada (`[4, 10, 3, 5, 1]`) |
| **Tutorial Guiado** | `OBRIGATÓRIO` | Prática de afundamento assistido em heap pequeno |
| **Prática Básica** | `OBRIGATÓRIO` | Construção de heap e extração com $n=5$ |
| **Prática Progressiva** | `OBRIGATÓRIO` | Exercício com $n=7$ (árvore completa de 3 níveis cheios) |
| **Casos do Algoritmo** | `OBRIGATÓRIO` | Vetor já montado como heap, vetor inverso e chaves iguais |
| **Desafio** | `OPCIONAL` | Modo "Afundamento sob Pressão": tempo limitado por nível de árvore |
| **Prática Livre (Sandbox)**| `OPCIONAL` | Manipulação livre de heap com inserção e extração arbitrárias |

---

## 11. Casos Pedagógicos Curados Específicos

1. **Caso 1: Vetor Já Estruturado como Max-Heap (`[90, 80, 70, 60, 50, 40, 30]`)**  
   - Propósito: A Fase 1 de construção executa $0$ trocas; exercita diretamente a Fase 2 de extração sucessiva.
2. **Caso 2: Vetor Estritamente Crescente (Pior Caso de Montagem)**  
   - Propósito: Todas as folhas são maiores que os nós internos; exige o número máximo de afundamentos na Fase 1.
3. **Caso 3: Elementos Todos Iguais (`[50, 50, 50, 50]`)**  
   - Propósito: Demonstrar que nenhuma troca de afundamento é disparada e que a complexidade se reduz a $\Omega(n)$.
4. **Caso 4: Árvore Perfeitamente Balanceada ($n=7$)**  
   - Propósito: Visualização simétrica impecável de nós esquerdo e direito em todos os níveis.
5. **Caso 5: Instabilidade Algorítmica (`[10a, 10b, 5]`)**  
   - Propósito: Constatar que a extração da raiz transpõe a ordem relativa de chaves iguais.

---

## 12. Geração Procedural e Constraints do Módulo

- **Configuração:** `HEAP_MODULE_CONSTRAINTS`.
- **Tamanhos Curriculares:** Prioridade para $n=5$ e $n=7$ no início (árvores fáceis de visualizar sem sobrecarga cognitiva).
- **Constraints Obrigatórias:**
  - Garantir que o vetor inicial não seja um max-heap trivial nas práticas regulares.

---

## 13. Feedback Formativo e Tratamento de Erros

- **Promover Filho Menor:**
  - Alerta: *"Erro de Propriedade de Heap: Você promoveu o nó menor! Em um max-heap, quando o pai é violado, deve-se promover estritamente o MAIOR entre os dois filhos."*
- **Afundar Quando o Pai Já é Maior:**
  - Alerta: *"O nó pai já é maior ou igual a ambos os filhos. A propriedade de heap já está satisfeita nesta subárvore."*

---

## 14. Sistema de Dicas

- **Dica de Afundamento:**
  - *"Inspecione o nó A[i] e seus filhos A[2i+1] e A[2i+2]. O maior valor é X no filho Y. Clique em PROMOVER FILHO Y."*

---

## 15. Tela de Resultado e Reflexão

- **Apresentação:** Relatório pós-exercício destacando a garantia matemática de nunca exceder $O(n \log n)$ comparações, independentemente da entrada.

---

## 16. Replay e Inspeção Retrospectiva

- **Visualização Especial:** O Replay permite alternar entre o estado da esteira e o estado da árvore a cada passo de afundamento e extração.

---

## 17. Persistência e Progresso

- **Suporte Futuro no Schema v4:** Chaves `records["heap-basic"]`, `records["heap-intermediate"]`, etc.

---

## 18. Acessibilidade e Inclusão

- **Conexões Visuais Acessíveis:** As arestas da árvore possuem contraste reforçado e rótulos textuais de hierarquia (`PAI`, `ESQ`, `DIR`).

---

## 19. Riscos Pedagógicos e Armadilhas Conceituais

1. **Confundir Max-Heap com Vetor Totalmente Ordenado:** Supor que um max-heap já está ordenado da esquerda para a direita.  
   *Salvaguarda:* O aluno vê explicitamente que o filho direito pode ser menor que o filho esquerdo sem violar o heap, e que a ordenação só se completa após a Fase 2 de extração.
2. **Esquecer que a Árvore é Apenas um Mapeamento sobre o Vetor:** Imaginar que existem ponteiros reais de memória.  
   *Salvaguarda:* A tela sincronizada destaca a caixa no vetor correspondente ao nó da árvore em tempo real.

---

## 20. Relação Futura com o Laboratório Comparativo

- **Confronto com Quick Sort e Merge Sort:** O Heap Sort demonstrará imunidade absoluta contra os piores casos do Quick Sort, sem demandar o vetor auxiliar $O(n)$ do Merge Sort.
- **Métricas:** Número de comparações de nós e trocas de afundamento exibidos no painel comparativo.
