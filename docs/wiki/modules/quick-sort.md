# Módulo 05 — Quick Sort

> **Documento canônico do módulo curricular:** Especificação integral do Módulo de Quick Sort da plataforma **Sorting Station**.  
> **Status de Implementação:** `CAMADA PEDAGÓGICA, TUTORIAL E DEMONSTRAÇÃO CONCLUÍDOS (Marcos P3.2-B e P3.2-C Concluídos)` (Types, Engine, Constraints Procedurais, Catálogo Curricular, Feedback/Dicas, Tutorial Guiado com Instabilidade, Demonstração Autônoma Canônica e Briefing Ilustrado implementados. Pendente: Marco P3.2-D — Telas de Prática Interativa, Replay e Ativação no Hub).  
> **Data de Atualização:** 28/09/2026 (Marcos P3.2-B e P3.2-C)  
> **Dependências:** [`AGENTS.md`](../../../AGENTS.md), [`ADR 0018`](../../adr/0018-game-to-educational-platform-transition.md), [`ADR 0022`](../../adr/0022-canonical-exercise-module-standardization.md), [`ADR 0024`](../../adr/0024-quick-sort-pedagogical-mechanical-design.md), [`modules/README.md`](./README.md), [`04-sorting-engine.md`](../04-sorting-engine.md), [`10-roadmap.md`](../10-roadmap.md).

---

## 1. Identificação do Módulo

- **Nome Canônico:** Quick Sort (Ordenação Rápida por Particionamento de Pivô)
- **Identificador de Sistema (`moduleId`):** `quick`
- **Rótulo Diegético na Interface:** `PROTOCOLO: QUICK SORT // PARTITION & PIVOT CONTROL`
- **Status Factual:** `CAMADA PEDAGÓGICA E CONTROLADORES ENTREGUES (Marco P3.2-C Concluído; UI pendente em P3.2-D)`
- **Classificação Curricular:** Algoritmo Avançado de Divisão e Conquista In-Place
- **Variante Canônica Inicial:** Particionamento de Lomuto com pivô fixo no último índice do intervalo ativo ($A[high]$)
- **Complexidade Temporal:**
  - **Melhor Caso (Partições Perfeitamente Balanceadas):** $\Omega(n \log n)$
  - **Caso Médio:** $\Theta(n \log n)$
  - **Pior Caso (Partições Sucessivas Desbalanceadas):** $\Theta(n^2)$
- **Complexidade Espacial e Estruturas de Memória:**
  - **Espaço Temporário da Partição:** $O(1)$ variáveis escalares in-place (opera diretamente sobre o vetor principal, sem alocar vetor auxiliar);
  - **Pilha Explícita de Intervalos Pendentes:** Estrutura auxiliar de controle LIFO (`pendingIntervals`). Diferencia-se: (1) ocupação transitória no snapshot pós-pivô (`PIVOT_POSITIONED`), onde ambos os filhos não-vazios (inclusive unitários, como os dois unitários gerados em `[1, 3, 2]`) são empilhados; (2) consumo imediato durante o avanço automático que desempilha e resolve casos unitários com `BASE_CASE_RESOLVED`; (3) estado durante inspeção interativa ativa, onde o intervalo ativo está desempilhado (mantendo no máximo 1 pendente na entrada ordenada). O limite assintótico geral permanece estritamente $O(n)$ no pior caso de controle, sem adoção de cotas fechadas não demonstradas formalmente;
  - **Snapshots de Histórico da Plataforma:** $O(m \cdot n)$ referências de ponteiros em memória ($m$ eventos algorítmicos pós-ação retendo cópias rasas de tamanho $n$; $m \in \Theta(n \log n)$ caso médio, $m \in \Theta(n^2)$ pior caso). Tentativas pedagógicas incorretas não criam eventos algorítmicos no histórico.
- **Estabilidade Formal:** **Instável** (o algoritmo não oferece garantia formal de preservação da ordem relativa de chaves idênticas).
- **Tema Visual e Acentos:** Laranja Vibrante e Âmbar (`#f97316` e `#f59e0b`), com destaque visual do pivô e isolamento da partição ativa.

---

## 2. Objetivos de Aprendizagem (Taxonomia de Bloom Revisada)

Ao concluir o Módulo de Quick Sort, o estudante deverá ser capaz de:

1. **Lembrar:**
   - Identificar o elemento **pivô** como valor de referência de uma partição;
   - Recordar o critério relacional de classificação ($A[j].valor \le P.valor$) no particionamento de Lomuto;
   - Reconhecer que o Quick Sort organiza os elementos diretamente sobre o vetor principal, sem alocar um vetor auxiliar.
2. **Entender:**
   - Explicar por que o particionamento de Lomuto delimita regiões contíguas durante a varredura da esquerda para a direita;
   - Compreender por que, imediatamente após o término da partição, **o pivô atinge sua posição final definitiva no vetor** ($p = i + 1$), recebendo o selo `OK DEFINITIVO` e não necessitando de nenhuma movimentação futura;
   - Diferenciar uma **região particionada** (onde os elementos estão à esquerda ou à direita do pivô) de uma **região já internamente ordenada** (uma região particionada ainda não está necessariamente ordenada internamente, embora possa coincidentemente estar).
3. **Aplicar:**
   - Classificar cada elemento analisado contra o pivô como menor/igual ou maior;
   - Compreender quando uma permuta física efetiva ocorre entre índices distintos ($i \neq j$) e quando uma operação com o mesmo índice ($i == j$) é omitida sem escrita;
   - Executar a confirmação pedagógica de posicionamento do pivô na fronteira entre as regiões.
4. **Analisar:**
   - Constatar a instabilidade do algoritmo acompanhando a inversão da ordem relativa de duplicatas ($4a, 4b$);
   - Compreender que **instabilidade significa ausência de garantia de preservação da ordem relativa**, de modo que nem toda execução com duplicatas necessariamente inverte suas posições;
   - Diagnosticar o pior caso quadrático $\Theta(n^2)$ em entradas que geram partições sucessivas desbalanceadas (como vetores ordenados ou inversos com pivô na extremidade).
5. **Avaliar:**
   - Comparar o comportamento do Quick Sort com o Merge Sort no que tange ao uso de memória auxiliar e estabilidade;
   - Discutir as vantagens práticas de localidade espacial de cache do Quick Sort.

---

## 3. Modelo Mental e Apresentação Visual

A metáfora visual apoia a compreensão do algoritmo com linguagem direta e acessível:

- **A Esteira Principal:** Todos os elementos permanecem na mesma esteira, que é organizada diretamente no próprio vetor.
- **O Pivô Destacado:** O último número do intervalo ativo é destacado com uma moldura de destaque e o rótulo textual `PIVÔ`. Seu valor serve de régua de comparação fixa para a partição atual.
- **As Regiões Durante a Varredura:** Durante a caminhada da esquerda para a direita, o trecho ativo apresenta:
  1. *Região de Menores ou Iguais:* Índices $low \dots i$, com rótulo sutil `≤ PIVÔ` (ainda não necessariamente ordenada internamente);
  2. *Região de Maiores:* Índices $i+1 \dots j-1$, com rótulo sutil `> PIVÔ` (ainda não necessariamente ordenada internamente);
  3. *Elemento em Análise:* A posição $j$, em comparação direta contra o pivô;
  4. *Elementos Pendentes:* Posições $j+1 \dots high-1$, aguardando análise;
  5. *Pivô:* Posição fixa $high$.
- **Colocação do Pivô na Posição Final:** Ao inspecionar todos os elementos, o estudante confirma o posicionamento do pivô. O pivô troca de lugar com o primeiro elemento da região dos maiores ($i+1$). Naquele instante, acende-se o selo verde esmeralda `OK DEFINITIVO`: o pivô atingiu sua posição permanente no vetor ordenado.
- **Processamento dos Subproblemas:** O sistema isola então o trecho à esquerda e, posteriormente, o trecho à direita, repetindo o particionamento até que todos os números recebam o selo `OK DEFINITIVO`.

---

## 4. Operações Fundamentais e Invariantes

### 4.1. Limites de Intervalos e Convenção Inclusiva
Todo subproblema ativo atua sobre um intervalo $[low, high]$ fechado e contíguo no vetor $A$, com $0 \le low \le high \le n - 1$.

### 4.2. Invariante de Laço do Particionamento de Lomuto
Com pivô fixo $P = A[high]$, ponteiro de fronteira $i$ (inicia em $low - 1$) e cursor $j$ (itera de $low$ até $high - 1$):
$$\begin{aligned}
\forall k \in [low \dots i], &\quad A[k].valor \le P.valor \quad \text{(Região } \le P\text{, ainda não necessariamente ordenada)} \\
\forall k \in [i+1 \dots j-1], &\quad A[k].valor > P.valor \quad \text{(Região } > P\text{, ainda não necessariamente ordenada)} \\
k = j, &\quad A[j] \quad \text{(Elemento em comparação contra } P\text{)} \\
\forall k \in [j+1 \dots high-1], &\quad A[k] \quad \text{(Elementos ainda não analisados)} \\
k = high, &\quad A[high] = P \quad \text{(Pivô fixo na extremidade)}
\end{aligned}$$

### 4.3. Invariante de Consolidação do Pivô
Ao terminar a varredura ($j = high$), posiciona-se o pivô em $p = i + 1$:
- Se $i + 1 \neq high$, permuta-se $A[i+1]$ com $A[high]$;
- Se $i + 1 == high$, a auto-troca é omitida (zero trocas e zero escritas);
- O elemento $A[p]$ torna-se definitivamente consolidado (`OK DEFINITIVO`).

### 4.4. Casos Base
- **Intervalo Unitário ($low == high$):** Um elemento isolado já está ordenado por definição axiomática. Recebe o selo `OK DEFINITIVO` automaticamente sem comparações, trocas ou escritas;
- **Intervalo Vazio ($low > high$):** Descartado sem operações.

---

## 5. Mecânica Interativa Própria

### 5.1. Ações do Estudante
1. **Durante a Varredura (Estado `INSPECT_ELEMENT`):**
   - `[ 1 ] Menor ou igual ao pivô`:
     - O aluno afirma que $A[j].valor \le P.valor$. A engine valida. Se correta:
       - $i \leftarrow i + 1$;
       - Se $i \neq j$: troca $A[i]$ com $A[j]$ (`swaps += 1`, `writesInArray += 2`);
       - Se $i == j$: avança a fronteira sem troca física nem escrita;
       - $j \leftarrow j + 1$.
   - `[ 2 ] Maior que o pivô`:
     - O aluno afirma que $A[j].valor > P.valor$. A engine valida. Se correta:
       - O elemento permanece na região dos maiores e $j \leftarrow j + 1$.
2. **Fechamento da Partição (Estado `PARTITION_READY_FOR_PIVOT`):**
   - `[ 3 ] Colocar o pivô na posição final`:
     - Confirmação pedagógica da conclusão da varredura. Não gera erro caso acionada como ação única disponível;
     - Se $i + 1 \neq high$: troca $A[i+1]$ com $A[high]$ (`swaps += 1`, `writesInArray += 2`);
     - Se $i + 1 == high$: omissão de auto-troca (0 trocas, 0 escritas);
     - Sela o pivô em $p = i + 1$ com `OK DEFINITIVO`.

### 5.2. Operações Automáticas da Plataforma
- Destaque do pivô $A[high]$;
- Esmaecimento dos elementos fora do intervalo ativo $[low \dots high]$;
- Desempilhamento de tarefas pendentes e tratamento imediato de intervalos unitários ($low == high$);
- Manutenção da pilha de subproblemas pendentes.

---

## 6. Pseudocódigo Canônico (27 Instruções — `QUICK_SORT_PSEUDOCODE`)

O pseudocódigo canônico compara explicitamente os valores numéricos e omite auto-trocas, em coerência estrita com a contabilidade de métricas da plataforma:

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

## 7. Métricas Factuais Adequadas ao Algoritmo

1. **Comparações de Dados ($C(n)$):**
   - Contabiliza exatamente uma comparação relacional no momento da classificação correta;
   - Erros pedagógicos não acrescentam comparações;
   - Casos base unitários geram 0 comparações.
2. **Trocas entre Índices Distintos ($M(n)$):**
   - Contabilizadas somente quando os dois índices permutados são diferentes ($pos_1 \neq pos_2$);
   - Trocas entre elementos de mesmo valor mas posições distintas contam como troca;
   - Operações com o mesmo índice ($pos_1 == pos_2$) são omitidas e não incrementam `swaps`.
3. **Escritas no Vetor ($W(n)$):**
   - Cada troca efetivamente executada entre índices distintos realiza exatamente **2 escritas** no vetor principal;
   - Auto-trocas e erros geram 0 escritas;
   - O algoritmo realiza 0 escritas em memória auxiliar de dados.
4. **Erros Pedagógicos (`errors`):**
   - Decisões incorretas de classificação. O estado é retido e nenhuma métrica algorítmica avança;
   - Escolhas impossíveis para o estado atual não penalizam.
5. **Pontuação do Protocolo:**
   $$\text{score} = \max(0, 100 - (\text{errors} \times 10) - (\text{hintsUsed} \times 5))$$

---

## 8. Modo Demonstração Canônica

- **Propósito:** Apresentação autônoma, correta e fluida da partição de Lomuto com a consolidação definitiva do pivô.
- **Vetor Canônico Curado:** `[5, 2, 4, 1, 3]` ($n=5$).
- **Roteiro e Métricas:**
  - Partição raiz $[0 \dots 4]$ com pivô 3: classifica 5 (maior), 2 (troca com 5 no índice 0), 4 (maior), 1 (troca com 5 no índice 1). Troca final do pivô 3 com 4 no índice 2. Pivô 3 consolidado com `OK DEFINITIVO`.
  - Subpartição esquerda $[0 \dots 1]$ (`[2, 1]`): pivô 1, troca com 2. Pivô 1 consolidado em 0. Posição 1 (`[2]`) consolidada como caso unitário.
  - Subpartição direita $[3 \dots 4]$ (`[5, 4]`): pivô 4, troca com 5. Pivô 4 consolidado em 3. Posição 4 (`[5]`) consolidada como caso unitário.
  - **Métricas Totais Conferidas:** **6 comparações**, **5 trocas entre índices distintos**, **10 escritas no vetor**.

---

## 9. Tutorial Guiado (com Inversão de Duplicatas)

- **Propósito:** Scaffolding cognitivo passo a passo demonstrando a formação das regiões, a classificação por valor e a evidência concreta da instabilidade formal.
- **Vetor Didático Curado:** `[4a, 4b, 1, 2, 3]` ($n=5$, pivô inicial $P = 3$).

### Rastreamento Completo do Tutorial:

1. **Partição Raiz $[0 \dots 4]$, Pivô $P = 3$ ($A[4]$), $i = -1$:**
   - $j=0$ ($A[0]=4a$): $4a.valor \le 3$ (Falso). Aluno escolhe `Maior que o pivô`. $i = -1, j \leftarrow 1$. (1 comp, 0 trocas, 0 escritas).
   - $j=1$ ($A[1]=4b$): $4b.valor \le 3$ (Falso). Aluno escolhe `Maior que o pivô`. $i = -1, j \leftarrow 2$. (2 comp, 0 trocas, 0 escritas).
   - $j=2$ ($A[2]=1$): $1.valor \le 3$ (Verdadeiro). Aluno escolhe `Menor ou igual ao pivô`. $i \leftarrow 0$. Como $0 \neq 2$, troca física $A[0]$ ($4a$) com $A[2]$ ($1$). Vetor: `[1, 4b, 4a, 2, 3]`. $j \leftarrow 3$. (3 comp, 1 troca, 2 escritas).
   - $j=3$ ($A[3]=2$): $2.valor \le 3$ (Verdadeiro). Aluno escolhe `Menor ou igual ao pivô`. $i \leftarrow 1$. Como $1 \neq 3$, troca física $A[1]$ ($4b$) com $A[3]$ ($2$). Vetor: `[1, 2, 4a, 4b, 3]`. $j \leftarrow 4 = high$. (4 comp, 2 trocas, 4 escritas).
   - Fim da varredura: Aluno confirma `Colocar o pivô na posição final`. Como $i + 1 = 2 \neq 4$, troca física entre $A[2]$ ($4a$) e $A[4]$ ($3$).
     - **Vetor pós-partição raiz:** `[1, 2, 3 (OK), 4b, 4a]`.
     - Pivô 3 consolidado definitivamente no índice 2 com `OK DEFINITIVO`.
     - Note que as duplicatas já assumiram a ordem `4b` (índice 3) e `4a` (índice 4).
     - Subintervalos empilhados: direito $[3 \dots 4]$ e esquerdo $[0 \dots 1]$ (topo).
2. **Subpartição Esquerda $[0 \dots 1]$ (`[1, 2]`), Pivô $P = 2$ ($A[1]$), $i = -1$:**
   - $j=0$ ($A[0]=1$): $1.valor \le 2$ (Verdadeiro). Aluno escolhe `Menor ou igual ao pivô`. $i \leftarrow 0$. Como $i = j = 0$, omissão de auto-troca. $j \leftarrow 1 = high$. (5 comp, 2 trocas, 4 escritas).
   - Fim da varredura: Confirmação de posicionamento. Como $i + 1 = 1 == high$, omissão de auto-troca. Pivô 2 consolidado com `OK DEFINITIVO` no índice 1.
   - Posição 0 (`[1]`): caso base unitário consolidado com `OK DEFINITIVO` automaticamente (0 comp, 0 trocas).
3. **Subpartição Direita $[3 \dots 4]$ (`[4b, 4a]`), Pivô $P = 4a$ ($A[4]$), $i = 2$:**
   - $j=3$ ($A[3]=4b$):
     - A comparação relacional avalia **exclusivamente** o valor numérico (`value`): $4b.valor \le 4a.valor \implies 4 \le 4$ (Verdadeiro). A identidade ($4b$ vs $4a$) permite ao estudante acompanhar a inversão.
     - Aluno escolhe `Menor ou igual ao pivô`. $i \leftarrow 3$. Como $i = j = 3$, omissão de auto-troca. $j \leftarrow 4 = high$. (6 comp, 2 trocas, 4 escritas).
   - Fim da varredura: Confirmação de posicionamento. Como $i + 1 = 4 == high$, omissão de auto-troca. Pivô $4a$ consolidado com `OK DEFINITIVO` no índice 4.
   - Posição 3 (`[4b]`): caso base unitário consolidado com `OK DEFINITIVO` automaticamente.

### Totais e Demonstração da Instabilidade:
- **Vetor Final:** `[1, 2, 3, 4b, 4a]`;
- **Comparações:** **6** ($4 + 1 + 1$);
- **Trocas entre Índices Distintos:** **3** (todas na partição raiz: $0 \leftrightarrow 2$, $1 \leftrightarrow 3$, $2 \leftrightarrow 4$);
- **Escritas no Vetor:** **6** ($3 \times 2$);
- **Inversão das Duplicatas:** O elemento $4b$ (posição inicial 1) terminou antes do elemento $4a$ (posição inicial 0). A ordem relativa original foi invertida, provando concretamente que o algoritmo não é estável.
- **Conceito Chave:** O estudante aprende que **instabilidade significa ausência de garantia**, e não obrigatoriedade de inversão em todos os casos.

---

## 10. Tipos de Exercícios Suportados no Módulo

| Tipo de Exercício | Status | Detalhamento |
| :--- | :---: | :--- |
| **1. Introdução / Conceito** | `OBRIGATÓRIO` | Briefing ilustrado em 3 etapas com detalhes secundários |
| **2. Demonstração** | `OBRIGATÓRIO` | Demonstração com pivô luminoso (`[5, 2, 4, 1, 3]`) |
| **3. Tutorial Guiado** | `OBRIGATÓRIO` | Tutorial com duplicatas e inversão de ordem (`[4a, 4b, 1, 2, 3]`) |
| **4. Prática Básica** | `OBRIGATÓRIO` | Execução completa curta ($n=4$), com foco na partição raiz e continuidade nos subproblemas |
| **5. Prática Intermediária** | `OBRIGATÓRIO` | Execução com $n=5$ elementos e subproblemas encadeados |
| **6. Prática Avançada** | `OBRIGATÓRIO` | Execução com $n=6$ elementos e 1 par de duplicatas identificadas ($a, b$) |
| **7. Casos do Algoritmo** | `OBRIGATÓRIO` | Pior caso (ordenado/inverso), caso balanceado e duplicatas |
| **8. Desafio / Sandbox** | `OPCIONAL` | Modo "Escolha do Melhor Pivô" (planejado para fase posterior) |

---

## 11. Casos Pedagógicos Curados Específicos

1. **Caso 1: Vetor Já Ordenado (`[1, 2, 3, 4, 5]`)**  
   - Pior caso clássico com pivô fixo no fim. O pivô é sempre o maior número de cada partição, gerando partições de tamanho $n-1$ e $0$, com profundidade $n$ e $10$ comparações.
2. **Caso 2: Vetor Inversamente Ordenado (`[5, 4, 3, 2, 1]`)**  
   - Pior caso reverso. Na partição raiz, o pivô 1 é o menor elemento, gerando partição desbalanceada inicial de $0$ e $n-1$ elementos. As permutas subsequentes reorganizam os elementos mantendo o desbalanceamento que leva a $\Theta(n^2)$.
3. **Caso 3: Partição Balanceada (`[2, 5, 1, 4, 3]`)**  
   - O pivô 3 divide exatamente em duas partes de 2 elementos, gerando árvore com profundidade mínima $\lceil \log_2 n \rceil$.
4. **Caso 4: Elementos com Duplicatas Múltiplas (`[3, 3, 1, 3, 2]`)**  
   - Demonstra a aglutinação de chaves iguais ao pivô na região esquerda pelo predicado $\le$.
5. **Caso 5: Instabilidade Algorítmica Visível (`[4a, 4b, 1, 2, 3]`)**  
   - Observação direta da inversão de posições relativas entre $4a$ e $4b$.

---

## 12. Geração Procedural e Constraints do Módulo

Implementação em `quickConstraints.ts` consumindo o PRNG determinístico universal Mulberry32:

- **Faixa Numérica de Valores:** $1 \dots 99$;
- **Tamanhos Curriculares Canônicos:**
  - Prática Básica: $n = 4$;
  - Prática Intermediária: $n = 5$;
  - Prática Avançada: $n = 6$.
- **Predicado de Rejeição de Vetores Triviais:**
  - Rejeitar vetores que venham previamente ordenados por sorteio (para práticas regulares);
  - Garantir que a primeira partição contenha ao menos um elemento menor e um elemento maior que o pivô em práticas normais;
  - Proibir duplicatas nas práticas básicas e intermediárias; na prática avançada, admitir exatamente 1 par de duplicatas identificadas ($a, b$).

---

## 13. Feedback Formativo e Tratamento de Erros

- **Classificação Incorreta (Menor quando é Maior):**  
  `"O número {valor} é MAIOR que o pivô {pivo}. Ele deve permanecer na região dos maiores."`
- **Classificação Incorreta (Maior quando é Menor ou Igual):**  
  `"O número {valor} é MENOR OU IGUAL ao pivô {pivo}. Ele deve ir para a região da esquerda."`
- **Tentativa Fora de Hora:**  
  Ações impossíveis não penalizam e não avançam o estado.

---

## 14. Sistema de Dicas

Scaffolding cognitivo estruturado em 3 níveis contextuais via `hintsUsed`:
- **Nível 1 (Identificação):** Destaca o pivô atual e o elemento em inspeção: *"Compare o número {valor} com a referência do pivô {pivo}."*
- **Nível 2 (Relação Matemática):** Explica a relação: *"Como {valor} {≤ / >} {pivo}, este elemento pertence à região dos {menores ou iguais / maiores}."*
- **Nível 3 (Ação Recomendada):** Indica o comando: *"Selecione '{Menor ou igual ao pivô / Maior que o pivô}'."*

---

## 15. Tela de Resultado e Reflexão

- Pontuação do Protocolo com base em erros e dicas;
- Relatório de métricas: comparações, trocas entre índices distintos e escritas no vetor;
- Reflexão metacognitiva sobre o balanceamento das partições geradas.

---

## 16. Replay e Inspeção Retrospectiva

- Modelo funcional imutável com $1 + N$ quadros derivados do histórico;
- Quadro 0 inicial com o vetor bruto, métricas zeradas e intervalo raiz;
- Cada quadro preserva o snapshot pós-evento e o contexto anterior da comparação que o produziu;
- Navegação temporal com controles acessíveis e pseudocódigo sincronizado de 27 linhas.

---

## 17. Persistência e Progresso (Schema v4)

Persistência compatível com o Schema v4 sob `saveData.modules["quick"]`:
```typescript
saveData.modules["quick"] = {
  completedTutorial: false,
  exerciseSets: {
    "quick.practice.basic": {
      completed: true,
      bestRecord: {
        score: 100,
        comparisons: 5,
        swaps: 2,
        elapsedSeconds: 22,
        completedAt: "2026-09-28T14:00:00Z"
      }
    },
    "quick.practice.intermediate": { completed: false },
    "quick.practice.advanced": { completed: false }
  }
};
```

---

## 18. Acessibilidade e Inclusão

- Conformidade com contraste WCAG AAA;
- Rótulos textuais explícitos para regiões e selos (`PIVÔ`, `≤ PIVÔ`, `> PIVÔ`, `OK DEFINITIVO`), garantindo independência de cor;
- Navegação completa por teclado (`1`, `2`, `3`);
- Suporte a `prefers-reduced-motion` com transições discretas.

---

## 19. Riscos Pedagógicos e Armadilhas Conceituais

| Concepção Errônea Frequente | Risco Pedagógico | Salvaguarda Interativa Implementada |
| :--- | :--- | :--- |
| **Achar que "particionar" é o mesmo que "ordenar"** | Aluno acreditar que os elementos na região dos menores já estão em ordem mútua definitiva. | Rótulos explícitos `REGIÃO ≤ PIVÔ (NÃO ORDENADA)` vs o selo esmeralda `OK DEFINITIVO` exclusivo do pivô consolidado. |
| **Achar que o Quick Sort é sempre $\Theta(n \log n)$** | Ignorar o pior caso quadrático em sistemas reais. | Caso Pedagógico 1 e tela de reflexão exibindo o contraste entre a árvore desbalanceada e a árvore equilibrada. |
| **Acreditar que o algoritmo é estável** | Utilizar o Quick Sort esperando preservação de ordem secundária em registros com chaves iguais. | Tutorial guiado demonstrando a inversão de posições relativas entre $4a$ e $4b$, acompanhado da explicação formal de que instabilidade significa ausência de garantia. |
| **Confundir a mecânica de Lomuto com Hoare** | Esperar ponteiros convergentes de ambos os extremos. | Briefing visual ilustrado demonstrando varredura linear estrita da esquerda para a direita. |

---

## 20. Relação Futura com o Laboratório Comparativo

No futuro **Laboratório Comparativo (Marco P3.4)**:
- Confronto direto com Merge Sort, Heap Sort e algoritmos elementares;
- Comparação de tempo real comprovando a eficiência de cache do Quick Sort in-place em entradas aleatórias;
- Demonstração empírica da degradação no teste "Vetor Já Ordenado", contrastando com o Merge Sort estável.

---

## 21. Implementação da Engine Pura (Marco P3.2-B Concluído)

A engine canônica do Quick Sort foi implementada de forma puramente funcional, imutável e determinística no diretório [`src/game/sorting/quick/`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/src/game/sorting/quick/):

### 21.1. Estrutura de Arquivos
- [`src/game/sorting/quick/types.ts`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/src/game/sorting/quick/types.ts): Definição estrita de tipos para cargas (`QuickElement`), decisões pedagógicas (`QuickDecision`), FSM (`QuickPhase`), contextos (`QuickComparisonContext`, `QuickSwapContext`), registros imutáveis de passos (`QuickStepRecord`), estado global (`QuickSortState`) e frames de reconstrução (`QuickVisualStepFrame`);
- [`src/game/sorting/quick/quickSortEngine.ts`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/src/game/sorting/quick/quickSortEngine.ts): Implementação pura com:
  - `initQuickSortState`: Inicialização imutável tratando casos vazios ($n=0$) e unitários ($n=1$) com métricas zeradas;
  - `advanceAutomaticSteps`: Avanço automático puramente funcional que consome partições vazias e resolve casos unitários de forma axiomática, parando na próxima decisão interativa do estudante ou em `COMPLETED`;
  - `stepQuickSort`: FSM de transição que valida a decisão pedagógica (`LESS_OR_EQUAL`, `GREATER`, `PLACE_PIVOT`), contabiliza 1 comparação por acerto conceitual, incrementa erros sem avanço de cursores, omite auto-trocas quando $i == j$ ou $p == high$, calcula `writesInArray = 2 * swaps` e registra snapshots pós-evento com preservação do contexto anterior da comparação;
  - `swapInArray`: Helper puro de permuta imutável com garantia contratual de omissão de auto-troca;
  - `reconstructQuickVisualFrame`: Helper puro para reconstrução de estados visuais e frames temporais a partir do histórico, sem reexecução algorítmica;
  - `QUICK_SORT_PSEUDOCODE_LINES`: 27 linhas canônicas congeladas em runtime;
- [`src/game/sorting/quick/index.ts`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/src/game/sorting/quick/index.ts): Ponto de entrada exportando types e funções da engine;
- [`src/game/sorting/quick/quickSortEngine.test.ts`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/src/game/sorting/quick/quickSortEngine.test.ts): Suíte exaustiva com 31 testes unitários cobrindo casos base, referências do marco (`[5, 2, 4, 1, 3]`, `[4a, 4b, 1, 2, 3]`, `[4a, 1, 4b, 2, 3]`), invariantes de 4 regiões, omissão de auto-trocas, tratamento formativo de erros, ações impossíveis, imutabilidade, reconstrução factual e limites da pilha de memória.

---

## 22. Camada Pedagógica, Tutorial Guiado e Demonstração (Marco P3.2-C Concluído)

No marco **P3.2-C**, foram implementados todos os dados, funções puras e controladores necessários para alimentar as experiências didáticas do Quick Sort, reutilizando estritamente a infraestrutura compartilhada da plataforma sem redesenhar a engine nem duplicar lógica de ordenação:

### 22.1. Geração Procedural e Constraints Pedagógicas (`quickConstraints.ts`)
- **Nível Básico (`basic`):** $n = 4$, valores em $1..99$, sem duplicatas, garantindo execução completa curta e partição inicial que não seja nula em nenhum dos lados;
- **Nível Intermediário (`intermediate`):** $n = 5$, valores em $1..99$, sem duplicatas, partição balanceada ($1 \le \text{menores} \le 3$) e continuidade entre partições filhas;
- **Nível Avançado (`advanced`):** $n = 6$, exatamente um par duplicado com identidades `'a'` e `'b'` e confronto real de igualdade contra o pivô ($A[j].value === P.value$), verificado diretamente pela engine canônica sem simulação paralela;
- **Rotulagem Estável de Identidades:** `assignQuickIdentities` atribui sufixos diegéticos `'a'` e `'b'` aos elementos duplicados de forma imutável e estável;
- **Garantia de Determinismo e Fallbacks:** Mesma seed + mesma configuração = mesmo vetor; limite estrito compartilhado de tentativas (`maxAttempts: 50` para básica/intermediária, `100` para avançada); arrays de fallback canônicos pré-auditados que satisfazem rigorosamente todas as constraints:
  - Básico: `[42, 18, 77, 35]`
  - Intermediário: `[50, 20, 80, 10, 40]`
  - Avançado: `[24, 12, 50, 12, 38, 30]`

### 22.2. Catálogo Curricular das Práticas (`practiceCatalog.ts`)
- Registrado no catálogo transversal `MODULE_PRACTICE_CATALOG.quick` e alinhado ao Schema v4 de persistência (`QUICK_EXERCISE_SETS` com 3 práticas e `QUICK_TOTAL_PRACTICES = 3`);
- Títulos e descrições pedagógicas com linguagem clara e acessível, sem jargões industriais de chão de fábrica:
  - Prática 1: "Primeira Partição e Pivô" (n=4)
  - Prática 2: "Partições Consecutivas" (n=5)
  - Prática 3: "Duplicatas e Instabilidade" (n=6)

### 22.3. Feedback Formativo, Scaffolding e Precedência Visual (`quickPedagogy.ts`)
- **Feedback Imediato (`getQuickFeedback`):** Retorna diagnósticos conceituais precisos sem jargões para classificações errôneas (`LESS_OR_EQUAL` vs `GREATER`), tentativas prematuras de posicionar o pivô ou ações após conclusão;
- **Scaffolding de Dicas em 3 Níveis (`getQuickHint`):**
  - Nível 1: Identificação visual do elemento ativo e do pivô atual;
  - Nível 2: Relação matemática entre os valores sem antecipar a resposta;
  - Nível 3: Recomendação direta da ação esperada;
- **Contrato Estrito de Precedência Visual (`getQuickElementVisualStatus`):**
  1. `DEFINITIVE` (Selo verde esmeralda OK DEFINITIVO para elementos consolidados);
  2. `OUTSIDE_INTERVAL` (Elemento fora da partição ativa — atenuado visualmente, sem classificação por ponteiros);
  3. `PIVOT` (Elemento $high$ no intervalo ativo — destaque âmbar/laranja);
  4. `COMPARING` (Elemento $j$ em confronto ativo contra o pivô — ciano);
  5. `LESS_OR_EQUAL_REGION` ($low \le idx \le i$ — azul sutil, ainda não ordenado internamente);
  6. `GREATER_REGION` ($i < idx < j$ — âmbar sutil, ainda não ordenado internamente);
  7. `PENDING_IN_INTERVAL` ($j < idx < high$ — neutro dentro do intervalo).

### 22.4. Tutorial Guiado e Comprovação de Instabilidade (`quickTutorialGuide.ts`)
- Vetor canônico fixo: `[4a, 4b, 1, 2, 3]`;
- Executado integralmente pela engine real com 9 marcos pedagógicos ordenados:
  1. `ROOT_COMPARE_4A`: Comparar $4a > 3$ (`GREATER`);
  2. `ROOT_COMPARE_4B`: Comparar $4b > 3$ (`GREATER`);
  3. `ROOT_COMPARE_1`: Comparar $1 \le 3$ (`LESS_OR_EQUAL`), troca física de $4a$ com $1$;
  4. `ROOT_COMPARE_2`: Comparar $2 \le 3$ (`LESS_OR_EQUAL`), troca física de $4b$ com $2$;
  5. `ROOT_PLACE_PIVOT`: Posicionar o pivô 3 na fronteira ($p=2$), troca de $4a$ com $3$;
  6. `LEFT_COMPARE_1`: No intervalo esquerdo $[0..1]$, comparar $1 \le 2$ (`LESS_OR_EQUAL`);
  7. `LEFT_PLACE_PIVOT`: Posicionar pivô 2 ($p=1$), selo OK definitivo em 2 e em 1;
  8. `RIGHT_COMPARE_4B_EQUAL_4A`: No intervalo direito $[3..4]$, comparar $4b \le 4a$ (`LESS_OR_EQUAL`) — confronto direto de igualdade;
  9. `RIGHT_PLACE_PIVOT`: Posicionar pivô $4a$ ($p=4$), selo OK definitivo em $4a$ e em $4b$;
- **Comprovação Factual:** O vetor final resulta em `[1, 2, 3, 4b, 4a]`, com $4b$ precedendo $4a$ no resultado final (ordem relativa original invertida). Métricas exatas: 6 comparações, 3 trocas, 6 escritas no vetor;
- Resiliência: Decisões incorretas retêm o marco e o estado da engine, incrementando erros e exibindo feedback formativo.

### 22.5. Modo de Demonstração Canônica (`quickDemonstration.ts`)
- Vetor canônico fixo: `[5, 2, 4, 1, 3]`;
- Execução autônoma pura via API pública da engine (`stepQuickSort`), parando com `completed: true`;
- Métricas contratuais auditadas: 6 comparações, 5 trocas entre índices distintos, 10 escritas no vetor;
- Vetor final ordenado: `[1, 2, 3, 4, 5]`;
- Histórico completo preservado contendo eventos de início de partição (`PARTITION_START`), classificação (`CLASSIFY_ELEMENT`), posicionamento de pivô (`PIVOT_POSITIONED`), resolução de casos base (`BASE_CASE_RESOLVED`) e término (`SORT_COMPLETE`), permitindo reconstrução temporal de qualquer frame via `reconstructQuickVisualFrame`.

### 22.6. Briefing Ilustrado e Integração UI (`quickBriefing.ts` e `ProtocolModeBriefingScreen.tsx`)
- Definido em `QUICK_CANONICAL_BRIEFING` e registrado em `BRIEFING_CATALOG["quick-canonical"]`;
- Renderizado em `ProtocolModeBriefingScreen.tsx` no padrão visual aprovado pelo usuário:
  - **3 Passos Canônicos:** (1) Identifique o pivô; (2) Compare cada número com o pivô; (3) Coloque o pivô na posição final e continue nos outros trechos;
  - **Exemplo Visual Exato em HTML/CSS:** Apresenta a partição local de `[5, 2, 4, 1, 3]` com pivô 3, distinção das regiões `[2, 1] ≤ 3` e `[5, 4] > 3`, selo OK definitivo do pivô posicionado e continuidade recursiva até `[1, 2, 3, 4, 5]`;
  - **Cards Curtos de Regras:** Pivô no Fim, Números Iguais (região $\le$), Selo OK Definitivo e Atenção à Instabilidade;
  - **Seção Secundária Recolhível (`<details>`):** Explicação da complexidade $\Theta(n \log n)$ caso médio vs $\Theta(n^2)$ pior caso, pilha explícita LIFO e invariantes de partição.


