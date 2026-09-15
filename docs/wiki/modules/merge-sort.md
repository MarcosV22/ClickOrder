# Módulo 04 — Merge Sort

> **Documento canônico do módulo curricular:** Especificação integral do Módulo de Merge Sort da plataforma **Sorting Station**.  
> **Status de Implementação:** `FUTURO` (Marco P3; algoritmo de Divisão e Conquista; engine, visualização de sub-esteiras e intercalação em planejamento arquitetural).  
> **Data de Atualização:** 15/09/2026 (Marco PLATFORM-R0)  
> **Dependências:** [`AGENTS.md`](../../../AGENTS.md), [`ADR 0018`](../../adr/0018-game-to-educational-platform-transition.md), [`modules/README.md`](./README.md), [`04-sorting-engine.md`](../04-sorting-engine.md), [`10-roadmap.md`](../10-roadmap.md).

---

## 1. Identificação do Módulo

- **Nome Canônico:** Merge Sort (Ordenação por Intercalação / Divisão e Conquista)
- **Identificador de Sistema (`moduleId`):** `merge`
- **Rótulo Diegético na Interface:** `PROTOCOLO: MERGE SORT // ESTEIRAS PARALELAS E INTERCALAÇÃO`
- **Status Factual:** `FUTURO` (Marco P3 da Plataforma)
- **Classificação Curricular:** Algoritmo Avançado de Divisão e Conquista Assintoticamente Ótimo
- **Complexidade Temporal:**
  - **Melhor Caso:** $\Theta(n \log n)$ comparações
  - **Caso Médio:** $\Theta(n \log n)$ comparações
  - **Pior Caso:** $\Theta(n \log n)$ comparações ($n \log_2 n - n + 1$)
- **Complexidade Espacial (Memória Auxiliar):** $O(n)$ (requer esteira/buffer temporário de intercalação)
- **Estabilidade Formal:** Estável (preserva a ordem relativa de elementos com chaves idênticas se o desempate na intercalação priorizar o subvetor esquerdo: $\le$)
- **Tema Visual e Acentos:** Azul Cobalto / Ciano Elétrico (`#2563eb` e `#38bdf8`), esteiras bifurcadas em níveis multinível

---

## 2. Objetivos de Aprendizagem

Ao concluir o Módulo de Merge Sort, o estudante deverá ser capaz de:
1. **Lembrar:** Identificar a estratégia clássica de Divisão e Conquista: dividir recursivamente até atingir o caso base unitário ($n=1$) e intercalar as metades ordenadas.
2. **Entender:** Explicar por que a complexidade do Merge Sort é estritamente $\Theta(n \log n)$ em todos os casos (árvore de recursão com altura $\lceil \log_2 n \rceil$ e trabalho linear de intercalação $O(n)$ por nível).
3. **Aplicar:** Operar o processo de intercalação com dois ponteiros ($p_1$ no subvetor esquerdo e $p_2$ no subvetor direito), escolhendo a menor carga para encaminhar à esteira de saída.
4. **Analisar:** Reconhecer o custo de memória auxiliar $O(n)$ e compreender por que o algoritmo necessita de uma estrutura temporária para consolidar a mesclagem.
5. **Avaliar:** Contrastar a estabilidade e a previsibilidade absoluta de desempenho do Merge Sort com algoritmos como Quick Sort e Heap Sort.

---

## 3. Modelo Mental e Metáfora Visual

- **A Central Logística:** Um pátio de triagem multinível automatizado com sistemas de bifurcação e confluência de esteiras.
- **A Fase de Divisão (*Split*):** A esteira principal divide seu fluxo em dois ramais paralelos (Ramal Superior / Esquerdo e Ramal Inferior / Direito) até que cada compartimento contenha apenas uma carga isolada (caso trivialmente ordenado).
- **A Esteira Auxiliar de Intercalação (*Merge Track*):** Uma esteira coletora limpa posicionada logo abaixo dos dois ramais convergentes.
- **Dois Sensores Ópticos ($p_1$ e $p_2$):** Um sensor monitora a cabeça do Ramal Esquerdo e outro monitora a cabeça do Ramal Direito.
- **O Despacho Ordenado:** O operador compara as duas cargas na ponta dos ramais e autoriza a menor a descer para a esteira coletora. Se acabarem as cargas de um ramal, o restante do outro ramal desce diretamente.
- **A Confluência no Nível Superior:** A esteira coletora ordenada substitui a partição correspondente no nível acima.

---

## 4. Operações Fundamentais e Invariantes

### 4.1. Caso Base da Recursão
Um subvetor com comprimento $n \le 1$ está trivialmente ordenado por definição; nenhuma operação de divisão ou intercalação é executada.

### 4.2. Invariante da Intercalação (*Merge Step*)
Dadas duas metades adjacentes $A[inicio \dots meio]$ e $A[meio+1 \dots fim]$ já ordenadas internamente:
- A cada passo da intercalação com ponteiros $p_1$ e $p_2$, o buffer de saída $B[inicio \dots k-1]$ contém os $k - inicio$ menores elementos da união dos dois subvetores, dispostos em ordem estritamente não decrescente.
- O próximo elemento inserido em $B[k]$ é $\min(A[p_1], A[p_2])$.

### 4.3. Regra Canônica de Estabilidade
Quando $A[p_1] = A[p_2]$, a decisão **deve obrigatoriamente despachar o elemento do subvetor esquerdo ($p_1$)**. Essa invariante impede que elementos equivalentes sofram transposição e garante a estabilidade formal.

---

## 5. Mecânica Interativa Própria

- **Visualização da Árvore de Divisão:** O estudante visualiza a representação esquemática das sub-esteiras geradas pela divisão binária.
- **Botoeira de Intercalação Guiada:** Durante a fase de mesclagem, o estudante controla os dois ponteiros com as ações:
  - `[ ⇙ DESPACHAR ESQUERDA ]` (seleciona $A[p_1]$);
  - `[ ⇘ DESPACHAR DIREITA ]` (seleciona $A[p_2]$);
  - `[ ⇊ DESPACHAR RESTANTE ]` (libera a cauda do subvetor que não se esgotou).
- **Feedback Cinestésico:** A carga selecionada desce suavemente para a esteira coletora enquanto a outra permanece em espera no seu ramal.

---

## 6. Pseudocódigo Canônico (18 Instruções — `MERGE_SORT_PSEUDOCODE`)

```text
1.  procedimento mergeSort(A, inicio, fim)
2.    se inicio < fim então
3.      meio ← ⌊(inicio + fim) / 2⌋
4.      mergeSort(A, inicio, meio)
5.      mergeSort(A, meio + 1, fim)
6.      intercalar(A, inicio, meio, fim)
7.    fim se
8.  fim procedimento
9.
10. procedimento intercalar(A, inicio, meio, fim)
11.   copiar A[inicio..meio] para E e A[meio+1..fim] para D
12.   p1 ← 0, p2 ← 0, k ← inicio
13.   enquanto p1 < tamanho(E) e p2 < tamanho(D) faça
14.     se E[p1] ≤ D[p2] então
15.       A[k] ← E[p1]; p1 ← p1 + 1
16.     senão
17.       A[k] ← D[p2]; p2 ← p2 + 1
18.     fim se; k ← k + 1
19.   fim enquanto
20.   copiar elementos restantes de E ou D para A
21. fim procedimento
```

---

## 7. Métricas Factuais Adequadas ao Algoritmo

- **Comparações de Intercalação ($C(n)$):** Contabiliza estritamente os confrontos entre cabeças de fila ($E[p_1] \le D[p_2]$).
- **Escritas em Memória / Transferências ($W(n)$):** Contabiliza cópias para o buffer temporário e transferências de volta para a esteira principal ($2n \lceil \log_2 n \rceil$).
- **Profundidade da Árvore de Chamadas:** Altura máxima da recursão ($\lceil \log_2 n \rceil$).
- **Decisões Incorretas (`errors`):** Tentar despachar o elemento maior da confluência.
- **Pontuação do Protocolo:**
  $$\text{score} = \max(0, 100 - (\text{errors} \times 10) - (\text{hintsUsed} \times 5))$$

---

## 8. Modo Demonstração

- **Propósito:** Demonstrar de ponta a ponta a separação em sub-esteiras e o processo ritmado de intercalação ordenada.
- **Vetor Curado Canônico:** `[7, 2, 5, 3]` ($n=4$).
- **Etapas da Demonstração:**
  - Divisão: `[7, 2]` e `[5, 3]`; subdivisão em `[7]`, `[2]`, `[5]`, `[3]`.
  - Intercalação Nível 1: mescla `[7]` e `[2]` resultando em `[2, 7]`; mescla `[5]` e `[3]` resultando em `[3, 5]`.
  - Intercalação Nível 2 (Final): confronta cabeças de `[2, 7]` e `[3, 5]`:
    - $2 \le 3 \rightarrow$ desce 2;
    - $7 > 3 \rightarrow$ desce 3;
    - $7 > 5 \rightarrow$ desce 5;
    - Ramal direito esgotado $\rightarrow$ desce 7;
    - Vetor final perfeitamente consolidado: `[2, 3, 5, 7]`.

---

## 9. Tutorial Guiado

- **Vetor de Scaffolding:** `[4, 1, 3, 2]`.
- **Foco Didático do Tutorial:** O tutorial pula a divisão e foca o aluno diretamente no desafio de intercalar duas esteiras já ordenadas (`[1, 4]` e `[2, 3]`), praticando o uso alternado dos botões de despacho e observando a estabilidade no desempate.

---

## 10. Tipos de Exercícios Suportados

| Tipo de Exercício | Suporte no Módulo | Planejamento de Implementação |
| :--- | :---: | :--- |
| **Introdução / Conceito** | `OBRIGATÓRIO` | Briefing de Divisão e Conquista |
| **Demonstração** | `OBRIGATÓRIO` | Demonstração animada com árvore de sub-esteiras (`[7, 2, 5, 3]`) |
| **Tutorial Guiado** | `OBRIGATÓRIO` | Prática de intercalação assistida com duas filas ordenadas |
| **Prática Básica** | `OBRIGATÓRIO` | Intercalação com $n=4$ |
| **Prática Progressiva** | `OBRIGATÓRIO` | Intercalação com $n=6$ e $n=8$ (árvore completa de 3 níveis) |
| **Casos do Algoritmo** | `OBRIGATÓRIO` | Casos curados de pior caso de comparações e elementos alternados |
| **Desafio** | `OPCIONAL` | Modo "Operador Concorrente": intercalação sob ritmo contínuo |
| **Prática Livre (Sandbox)**| `OPCIONAL` | Divisão e intercalação livre com tamanho customizável |

---

## 11. Casos Pedagógicos Curados Específicos

1. **Caso 1: Intercalação Perfeitamente Alternada (`[1, 3, 5]` e `[2, 4, 6]`)**  
   - Propósito: Pior caso de comparações para a etapa de intercalação ($2m - 1$ comparações, onde $m$ é o tamanho de cada metade). Os ponteiros alternam a cada passo ($1 \rightarrow 2 \rightarrow 3 \rightarrow 4 \rightarrow 5$).
2. **Caso 2: Subvetor Esquerdo Inteiramente Menor (`[1, 2, 3]` e `[7, 8, 9]`)**  
   - Propósito: Melhor caso de comparações. A esteira esquerda se esgota em $m$ passos, permitindo despejar o bloco direito sem nenhuma comparação adicional.
3. **Caso 3: Elementos Duplicados e Estabilidade (`[4a, 8]` e `[4b, 6]`)**  
   - Propósito: Provar que o critério $E[p_1] \le D[p_2]$ preserva $4a$ antes de $4b$ na esteira de saída.
4. **Caso 4: Vetor com Potência de 2 ($n=8$)**  
   - Propósito: Árvore perfeitamente balanceada com 3 níveis de profundidade exatos.
5. **Caso 5: Vetor com Tamanho Ímpar ($n=5$)**  
   - Propósito: Demonstrar divisão assimétrica ($\lfloor 5/2 \rfloor = 2$ e $3$) sem perda de consistência.

---

## 12. Geração Procedural e Constraints do Módulo

- **Configuração:** `MERGE_MODULE_CONSTRAINTS` via gerador universal.
- **Tamanhos Curriculares:** Potências de 2 favorecidas no início ($n=4, n=8$) para clareza visual da árvore, expandindo para ímpares ($n=5, n=7$).
- **Constraints Obrigatórias:**
  - Garantir que a confluência final contenha ao menos uma alternância entre sub-esteiras;
  - Intervalo de valores: $1 \dots 99$.

---

## 13. Feedback Formativo e Tratamento de Erros

- **Despachar Carga Maior na Confluência:**
  - Alerta: *"Erro de Intercalação: A carga A (valor X) é maior que a carga B (valor Y) no outro ramal! O Merge Sort deve sempre colher a menor carga disponível para manter a esteira de saída ordenada."*
- **Violação de Estabilidade no Empate:**
  - Alerta: *"Em caso de valores iguais, priorize sempre o ramal da esquerda para assegurar a estabilidade do algoritmo."*

---

## 14. Sistema de Dicas

- **Dica de Intercalação:** O sistema analisa $E[p_1]$ e $D[p_2]$ e instrui:
  - *"Compare os dois elementos à frente dos ramais. Como X < Y, clique em DESPACHAR ESQUERDA."*

---

## 15. Tela de Resultado e Reflexão

- **Apresentação:** Relatório analítico destacando a independência do número de comparações em relação à ordem inicial das entradas, comprovando a robustez do limite assintótico $O(n \log n)$.

---

## 16. Replay e Inspeção Retrospectiva

- **Visualização Especial:** O Replay exibe uma linha do tempo multinível, permitindo ao estudante navegar entre os passos de intercalação de cada ramo da árvore recursiva.

---

## 17. Persistência e Progresso

- **Suporte Futuro no Schema v4:** Registros sob o identificador `records["merge-basic"]`, `records["merge-intermediate"]`, etc.

---

## 18. Acessibilidade e Inclusão

- **Diferenciação Espacial e Textual:** Os ramais recebem identificadores textuais claros (`RAMAL ESQUERDO`, `RAMAL DIREITO`, `SAÍDA`) com cores contrastantes para operadores daltônicos.

---

## 19. Riscos Pedagógicos e Armadilhas Conceituais

1. **Achar que o Algoritmo "Ordena" Durante a Divisão:** Supor que as caixas se ordenam enquanto descem para os ramais.  
   *Salvaguarda:* A interface enfatiza que a divisão é puramente estrutural e que toda a ordenação ocorre durante a **intercalação** (*merge*).
2. **Esquecer a Memória Auxiliar:** Não perceber que as cargas precisam de uma esteira temporária.  
   *Salvaguarda:* A presença física visível da esteira coletora auxiliar.

---

## 20. Relação Futura com o Laboratório Comparativo

- **Confronto com Algoritmos Quadráticos:** O Merge Sort mostrará no laboratório uma redução dramática de comparações para $n \ge 16$ em relação a Bubble e Selection Sort.
- **Métrica Especial:** Consumo de memória auxiliar ($+n$ slots) explicitado graficamente no painel do laboratório.
