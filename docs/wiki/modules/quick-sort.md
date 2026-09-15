# Módulo 05 — Quick Sort

> **Documento canônico do módulo curricular:** Especificação integral do Módulo de Quick Sort da plataforma **Sorting Station**.  
> **Status de Implementação:** `FUTURO` (Marco P3; algoritmo de Particionamento Recursivo; engine, estratégias de pivô e visualização bilateral em planejamento).  
> **Data de Atualização:** 15/09/2026 (Marco PLATFORM-R0)  
> **Dependências:** [`AGENTS.md`](../../../AGENTS.md), [`ADR 0018`](../../adr/0018-game-to-educational-platform-transition.md), [`modules/README.md`](./README.md), [`04-sorting-engine.md`](../04-sorting-engine.md), [`10-roadmap.md`](../10-roadmap.md).

---

## 1. Identificação do Módulo

- **Nome Canônico:** Quick Sort (Ordenação Rápida por Particionamento de Pivô)
- **Identificador de Sistema (`moduleId`):** `quick`
- **Rótulo Diegético na Interface:** `PROTOCOLO: QUICK SORT // ELEIÇÃO DE PIVÔ E PARTICIONAMENTO BILATERAL`
- **Status Factual:** `FUTURO` (Marco P3 da Plataforma)
- **Classificação Curricular:** Algoritmo Avançado de Divisão e Conquista In-Place
- **Complexidade Temporal:**
  - **Melhor Caso (Partições Balanceadas):** $\Omega(n \log n)$
  - **Caso Médio:** $\Theta(n \log n)$
  - **Pior Caso (Partições Extremamente Desbalanceadas):** $\Theta(n^2)$ (ex.: vetor ordenado com pivô na ponta)
- **Complexidade Espacial (Memória Auxiliar):** $O(\log n)$ média (pilha de recursão), $O(n)$ pior caso
- **Estabilidade Formal:** Instável (as trocas de particionamento entre elementos distantes não garantem a preservação da ordem relativa de chaves iguais)
- **Tema Visual e Acentos:** Laranja / Vermelho Neon (`#f97316` e `#ef4444`), feixes cruzados de triagem rápida

---

## 2. Objetivos de Aprendizagem

Ao concluir o Módulo de Quick Sort, o estudante deverá ser capaz de:
1. **Lembrar:** Identificar a seleção do elemento pivô (*pivot*) e o objetivo do particionamento: reorganizar o vetor de modo que todos os elementos menores que o pivô fiquem à esquerda e todos os maiores à direita.
2. **Entender:** Explicar por que, após a etapa de particionamento, o pivô atinge **imediatamente sua posição definitiva no vetor** ($p$), dispensando qualquer movimentação futura.
3. **Aplicar:** Executar o esquema de particionamento (Lomuto ou Hoare), controlando os índices de varredura e decidindo quando permutar elementos com a fronteira dos menores.
4. **Analisar:** Diagnosticar as causas da degeneração do Quick Sort para $O(n^2)$ e avaliar estratégias mitigatórias (escolha de pivô mediano-de-três ou pivô aleatório).
5. **Avaliar:** Comparar o desempenho prático de cache e ausência de vetor auxiliar no Quick Sort com o Merge Sort e Heap Sort.

---

## 3. Modelo Mental e Metáfora Visual

- **A Central Logística:** Um entroncamento ferroviário com agulhas de desvio rápido de alta velocidade.
- **A Carga Pivô (*Beacon*):** Uma carga é destacada com um farol de pulso vermelho-alaranjado (`PIVÔ`). O valor dessa carga serve de referência absoluta para todos os desvios da rodada.
- **A Esteira de Particionamento:** As cargas são inspecionadas uma a uma contra o valor do farol pivô:
  - Cargas com peso inferior ao pivô são direcionadas para o lado esquerdo da esteira (Baia dos Menores);
  - Cargas com peso superior ou igual permanecem ou são empurradas para o lado direito (Baia dos Maiores).
- **O Commit do Pivô:** Ao final da varredura, o pivô desce para a lacuna exata entre as duas baias. Uma trava blindada esmeralda `OK` se fecha sobre ele: aquela é sua posição final no vetor ordenado definitivo.
- **A Recursão Subsequente:** O mesmo procedimento se repete de forma independente na baia da esquerda e na baia da direita.

---

## 4. Operações Fundamentais e Invariantes

### 4.1. Invariante do Particionamento de Lomuto
Com pivô $P = A[fim]$ e ponteiros $i$ (fronteira dos menores) e $j$ (leitor corrente):
- Para qualquer índice $k$ no intervalo $[inicio \dots i]$, temos $A[k] \le P$.
- Para qualquer índice $k$ no intervalo $[i+1 \dots j-1]$, temos $A[k] > P$.
- O elemento $A[fim]$ contém o pivô $P$.

### 4.2. Invariante de Consolidação do Pivô
Ao terminar $j = fim - 1$, permuta-se $A[i+1]$ com $A[fim]$:
- O pivô ocupa agora o índice $p = i+1$;
- Todos os elementos em $A[inicio \dots p-1]$ são menores ou iguais ao pivô;
- Todos os elementos em $A[p+1 \dots fim]$ são estritamente maiores que o pivô.

---

## 5. Mecânica Interativa Própria

- **Seleção de Estratégia de Pivô:** O estudante pode escolher o método de eleição do pivô (Primeiro Elemento, Último Elemento, Mediana de Três ou Aleatório).
- **Varredura com Particionamento Tátil:** O estudante avança o ponteiro $j$ avaliando a carga contra o pivô fixo:
  - `[ ⇦ ENVIAR PARA BAIXA MENOR ]` (dispara permuta com a posição $i+1$ e avança fronteira $i$);
  - `[ ⇨ MANTER NA BAIXA MAIOR ]` (apenas avança $j$).
- **Ação de Selamento do Pivô:** Botão `[ ⚓ FIXAR PIVÔ NA FRONTEIRA ]` que realiza a troca final e sela o pivô definitivamente com a insígnia `LOCKED`.

---

## 6. Pseudocódigo Canônico (18 Instruções — `QUICK_SORT_PSEUDOCODE`)

```text
1.  procedimento quickSort(A, inicio, fim)
2.    se inicio < fim então
3.      p ← particionar(A, inicio, fim)
4.      quickSort(A, inicio, p - 1)
5.      quickSort(A, p + 1, fim)
6.    fim se
7.  fim procedimento
8.
9.  procedimento particionar(A, inicio, fim)
10.   pivo ← A[fim]
11.   i ← inicio - 1
12.   para j de inicio até fim - 1 faça
13.     se A[j] ≤ pivo então
14.       i ← i + 1
15.       trocar A[i] e A[j]
16.     fim se
17.   fim para
18.   trocar A[i + 1] e A[fim]
19.   retornar i + 1
20. fim procedimento
```

---

## 7. Métricas Factuais Adequadas ao Algoritmo

- **Comparações Formais contra o Pivô ($C(n)$):** Contabiliza os testes relacionais $A[j] \le \text{pivo}$.
- **Permutas de Particionamento ($M(n)$):** Contabiliza as trocas entre $A[i]$ e $A[j]$ e a troca de commit do pivô.
- **Profundidade Máxima de Recursão:** Altura da pilha de execução ($\log_2 n$ no caso balanceado, $n$ no pior caso degenerado).
- **Decisões Incorretas (`errors`):** Falha na classificação do elemento em relação ao pivô.
- **Pontuação do Protocolo:**
  $$\text{score} = \max(0, 100 - (\text{errors} \times 10) - (\text{hintsUsed} \times 5))$$

---

## 8. Modo Demonstração

- **Propósito:** Visualização fluida do isolamento do pivô e das trocas que segregam menores e maiores.
- **Vetor Curado Canônico:** `[6, 2, 8, 4, 5]` ($n=5$, pivô final = 5).
- **Roteiro da Demonstração:**
  - Pivô eleito: $5$ no final.
  - Compara 6 com 5 ($6 > 5 \rightarrow$ mantém na baia maior).
  - Compara 2 com 5 ($2 \le 5 \rightarrow$ troca 2 com 6 $\rightarrow [2, 6, 8, 4, 5]$).
  - Compara 8 com 5 ($8 > 5 \rightarrow$ mantém).
  - Compara 4 com 5 ($4 \le 5 \rightarrow$ troca 4 com 6 $\rightarrow [2, 4, 8, 6, 5]$).
  - Commit do pivô: troca 5 com 8 $\rightarrow [2, 4, 5, 6, 8]$. Pivô 5 está definitivamente ordenado no índice 2.
  - Recursões subsequentes nas metades `[2, 4]` e `[6, 8]`.

---

## 9. Tutorial Guiado

- **Vetor de Scaffolding:** `[3, 5, 1, 2, 4]` ($n=5$, pivô = 4).
- **Etapas:** O tutorial guia o estudante através de cada comparação com o pivô 4, ensinando o momento de acionar o avanço do ponteiro de menores e a troca final do pivô.

---

## 10. Tipos de Exercícios Suportados

| Tipo de Exercício | Suporte no Módulo | Planejamento de Implementação |
| :--- | :---: | :--- |
| **Introdução / Conceito** | `OBRIGATÓRIO` | Briefing de Particionamento e Pivô |
| **Demonstração** | `OBRIGATÓRIO` | Demonstração com pivô luminoso (`[6, 2, 8, 4, 5]`) |
| **Tutorial Guiado** | `OBRIGATÓRIO` | Particionamento guiado passo a passo |
| **Prática Básica** | `OBRIGATÓRIO` | Particionamento com $n=5$ |
| **Prática Progressiva** | `OBRIGATÓRIO` | Partições sucessivas com $n=6$ e $n=8$ |
| **Casos do Algoritmo** | `OBRIGATÓRIO` | Pior caso (degeneração $O(n^2)$), caso balanceado e duplicados |
| **Desafio** | `OPCIONAL` | Modo "Escolha o Melhor Pivô": o aluno seleciona o pivô ótimo |
| **Prática Livre (Sandbox)**| `OPCIONAL` | Particionamento com qualquer entrada e pivô configurável |

---

## 11. Casos Pedagógicos Curados Específicos

1. **Caso 1: Vetor Já Ordenado com Pivô no Fim (`[10, 20, 30, 40, 50]`)**  
   - Propósito: Demonstrar o pior caso clássico ($O(n^2)$). O pivô 50 gera partições desiguais ($n-1$ elementos e $0$ elementos), demonstrando que vetores ordenados são problemáticos para pivôs ingênuos.
2. **Caso 2: Particionamento Perfeitamente Balanceado (`[30, 10, 50, 20, 40]`)**  
   - Propósito: Com pivô 30, divide exatamente em duas metades com 2 elementos cada, gerando o caso ótimo $O(n \log n)$.
3. **Caso 3: Elementos Todos Iguais (`[40, 40, 40, 40]`)**  
   - Propósito: Estudar o comportamento do algoritmo diante de duplicados e como o particionamento trata empates.
4. **Caso 4: Elementos Invertidos com Pivô Central**  
   - Propósito: Demonstrar a robustez da estratégia mediana-de-três contra vetores decrescentes.
5. **Caso 5: Instabilidade Algorítmica (`[3, 5a, 5b, 2]`)**  
   - Propósito: Constatar visualmente a quebra da ordem relativa entre $5a$ e $5b$ após as permutas de particionamento.

---

## 12. Geração Procedural e Constraints do Módulo

- **Configuração:** `QUICK_MODULE_CONSTRAINTS`.
- **Regras:**
  - Garantir que o pivô não divida o vetor em uma partição vazia nas práticas regulares;
  - Intervalo de valores: $1 \dots 99$.

---

## 13. Feedback Formativo e Tratamento de Erros

- **Classificação Invertida em Relação ao Pivô:**
  - Alerta: *"Erro de Particionamento: A carga A[j] (valor X) é maior que o pivô (valor P)! Ela não deve ser transferida para a baia dos menores."*
- **Tentativa de Commit com Cargas Pendentes:**
  - Alerta: *"Você ainda não inspecionou todas as cargas da partição. O pivô só pode ser fixado após a varredura completa."*

---

## 14. Sistema de Dicas

- **Dica de Particionamento:**
  - *"Compare o elemento A[j] com o pivô P. Como A[j] ≤ P, avance o ponteiro de menores e efetue a troca."*

---

## 15. Tela de Resultado e Reflexão

- **Apresentação:** Relatório pós-exercício contrastando o número real de partições executadas com a altura da árvore de chamadas.

---

## 16. Replay e Inspeção Retrospectiva

- **Visualização:** Rastreia o pivô em cada etapa, com cores distintas para os limites da partição ativa e identificação clara das chamadas recursivas.

---

## 17. Persistência e Progresso

- **Suporte Futuro no Schema v4:** Chaves `records["quick-basic"]`, `records["quick-intermediate"]`, etc.

---

## 18. Acessibilidade e Inclusão

- **Destaque do Pivô:** Borda pulsante com ícone fixo de âncora `[ ⚓ PIVÔ ]` e leitura textual dedicada.
- **Diferenciação de Baias:** Padrões táteis de esteira para a baia de menores (linhas diagonais) e maiores (linhas pontilhadas).

---

## 19. Riscos Pedagógicos e Armadilhas Conceituais

1. **Achar que o Pivô é Comparado com Outro Pivô:** Confusão sobre quem compara com quem.  
   *Salvaguarda:* O pivô fica imóvel no final da esteira enquanto os elementos correntes são trazidos ao seu confronto.
2. **Supor que o Quick Sort é Sempre Rápido:** Ignorar a degeneração para $O(n^2)$.  
   *Salvaguarda:* Caso pedagógico 1 explora explicitamente a degeneração com gráfico de complexidade.

---

## 20. Relação Futura com o Laboratório Comparativo

- **Benchmark Prático:** O Quick Sort demonstrará a menor constante oculta e o menor tempo de execução real na maioria das entradas não patológicas, mas sofrerá picos no pior caso selecionado intencionalmente no benchmark.
