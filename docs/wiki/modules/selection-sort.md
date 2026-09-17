# Módulo 02 — Selection Sort

> **Documento canônico do módulo curricular:** Especificação integral do Módulo de Selection Sort da plataforma **Sorting Station**.  
> **Status de Implementação:** `IMPLEMENTADO` (Adaptação conceitual de fases para exercícios; engine pura, FSM bimodal, demonstração, tutorial interativo, replay sincronizado e persistência v3 ativos).  
> **Data de Atualização:** 15/09/2026 (Marco PLATFORM-R0)  
> **Dependências:** [`AGENTS.md`](../../../AGENTS.md), [`ADR 0018`](../../adr/0018-game-to-educational-platform-transition.md), [`modules/README.md`](./README.md), [`04-sorting-engine.md`](../04-sorting-engine.md), [`ADR 0011`](../../adr/0011-selection-sort-engine-fsm.md) a [`ADR 0015`](../../adr/0015-multi-protocol-persistence-schema-v3.md).

---

## 1. Identificação do Módulo

- **Nome Canônico:** Selection Sort (Ordenação por Seleção do Mínimo)
- **Identificador de Sistema (`moduleId`):** `selection`
- **Rótulo Diegético na Interface:** `PROTOCOLO: SELECTION SORT // SCANNER DE CARGA MÍNIMA`
- **Status Factual:** `IMPLEMENTADO`
- **Classificação Curricular:** Algoritmo Elementar de Seleção com Minimização de Trocas
- **Complexidade Temporal:**
  - **Melhor Caso:** $\Theta(n^2)$ comparações, $0$ trocas (ou até $n-1$ confirmações sem troca)
  - **Caso Médio:** $\Theta(n^2)$ comparações, no máximo $n-1$ trocas físicas
  - **Pior Caso:** $\Theta(n^2)$ comparações, no máximo $n-1$ trocas físicas
- **Complexidade Espacial (Memória Auxiliar):** $O(1)$ (in-place)
- **Estabilidade Formal:** Instável na implementação canônica por troca (trocas de longa distância podem alterar a ordem relativa de elementos com chaves iguais)
- **Tema Visual e Acentos:** Roxo/Púrpura Neon (`#8b5cf6`), luz estroboscópica de scanner analítico

---

## 2. Objetivos de Aprendizagem

Ao concluir o Módulo de Selection Sort, o estudante deverá ser capaz de:
1. **Lembrar:** Identificar a divisão do vetor em duas regiões: partição já ordenada à esquerda ($[0 \dots i-1]$) e partição desordenada sob varredura ($[i \dots n-1]$).
2. **Entender:** Explicar a assimetria fundamental entre o custo de comparação ($n(n-1)/2$ avaliações inevitáveis) e o custo de movimentação (no máximo $n-1$ permutas físicas).
3. **Aplicar:** Operar o scanner na fase `INSPECT`, avaliando a desigualdade $A[j] < A[minIndex]$ e decidindo entre eleger novo candidato ou manter o candidato corrente.
4. **Analisar:** Diferenciar a fase de varredura (`INSPECT`) da fase de consolidação (`COMMIT`), compreendendo por que o commit só pode ser acionado após o término integral da passada.
5. **Avaliar:** Investigar a instabilidade algorítmica gerada por permutas de longa distância e contrastar a previsibilidade de trocas do Selection Sort com o comportamento altamente dependente de inversões do Bubble Sort.

---

## 3. Modelo Mental e Metáfora Visual

- **A Central Logística:** Um braço robótico com leitor óptico infravermelho de alta precisão. O terminal precisa despachar as cargas da menor para a maior em docas definitivas à esquerda.
- **A Posição Alvo ($i$):** A doca em aberto onde a menor carga da rodada deve ser encaixada.
- **O Candidato a Mínimo ($minIndex$):** Marcado com um prisma de retenção energética. Inicialmente, a própria carga da posição $i$ é considerada a menor candidata.
- **O Sensor de Varredura ($j$):** Um feixe óptico roxo que percorre todas as caixas à direita ($j = i+1 \dots n-1$). A cada carga encontrada, o sensor projeta no visor a comparação matemática $A[j] < A[minIndex]$.
- **A Transferência Única (Commit):** Concluída a varredura até a última caixa, o guindaste executa um único deslocamento aéreo, trocando a carga do $minIndex$ com a carga da doca $i$, selando aquela posição com a insígnia `OK`.

---

## 4. Operações Fundamentais e Invariantes

### 4.1. Invariante de Laço Formal
No início de cada passada externa $i$ ($0 \le i \le n - 2$):
- O subvetor $A[0 \dots i-1]$ está estritamente ordenado e contém os $i$ menores elementos do vetor original em suas posições definitivas.
- Para qualquer $p \in [0 \dots i-1]$ e qualquer $q \in [i \dots n-1]$, temos $A[p] \le A[q]$.

### 4.2. Invariante da Fase de Varredura (`INSPECT`)
Para qualquer elemento $k \in [i \dots j-1]$, temos $A[minIndex] \le A[k]$.  
A decisão a tomar ao inspecionar $j$ é:
- Se $A[j] < A[minIndex]$: `SELECT_NEW_MIN` (Atualiza $minIndex \leftarrow j$);
- Se $A[j] \ge A[minIndex]$: `KEEP_MIN` (Mantém $minIndex$).

### 4.3. Invariante da Fase de Consolidação (`COMMIT`)
Após $j = n-1$, $minIndex$ aponta para o menor elemento de todo o subvetor $[i \dots n-1]$:
- Se $minIndex \neq i$: permuta física única entre $A[i]$ e $A[minIndex]$ ($swaps += 1$);
- Se $minIndex = i$: consolidação direta sem movimentação ($swaps$ inalterado).
- $sortedBoundary$ avança para $i + 1$.

---

## 5. Mecânica Interativa Própria

- **FSM Bimodal Estrita:** O módulo separa imperativamente a interação em dois modos operacionais bloqueantes:
  - **Fase `INSPECT`:** O feixe aponta para a caixa $j$. A botoeira contextual disponibiliza exclusivamente:
    - `[ ✦ NOVO MÍNIMO ]` (quando $A[j] < A[minIndex]$);
    - `[ = MANTER CANDIDATO ]` (quando $A[j] \ge A[minIndex]$).
  - **Fase `COMMIT`:** Atingido o final da esteira, a interface bloqueia o avanço de varredura e libera exclusivamente:
    - `[ ⇄ TRANSFERIR MENOR CARGA ]` (se $minIndex \neq i$);
    - `[ ✓ CONSOLIDAR POSIÇÃO ]` (se $minIndex = i$).
- **Animação de Transferência de Longa Distância:** A permuta não se restringe a vizinhos. O sistema calcula o span real $|i - minIndex|$ e anima as caixas em arco com elevação tridimensional de $z$-index (`z-30`).
- **Trava de Ações Síncrona (`isActionLockedRef`):** Elimina qualquer possibilidade de cliques simultâneos corromperem a máquina de estados.

---

## 6. Pseudocódigo Canônico (13 Instruções — `SELECTION_SORT_PSEUDOCODE`)

```text
1.  procedimento selectionSort(A)
2.    para i de 0 até n - 2 faça
3.      minIndex ← i
4.      para j de i + 1 até n - 1 faça
5.        se A[j] < A[minIndex] então
6.          minIndex ← j
7.        fim se
8.      fim para
9.      se minIndex ≠ i então
10.       trocar A[i] e A[minIndex]
11.     fim se
12.   fim para
13. fim procedimento
```

---

## 7. Métricas Factuais Adequadas ao Algoritmo

- **Comparações Formais ($C(n)$):** Rigorosamente $\frac{n(n-1)}{2}$ em qualquer caso.
- **Transferências / Permutas ($M(n)$):** No máximo $n-1$ trocas por execução completa.
- **Decisões Incorretas (`errors`):** Falhas na identificação de menor valor em `INSPECT` ou erro na decisão de commit.
- **Dicas Solicitadas (`hintsUsed`):** Recomendações lógicas solicitadas durante a inspeção.
- **Pontuação do Protocolo:**
  $$\text{score} = \max(0, 100 - (\text{errors} \times 10) - (\text{hintsUsed} \times 5))$$
- **Destaque Pedagógico:** Relação explícita entre alto número de comparações e baixíssimo número de trocas físicas.

---

## 8. Modo Demonstração

- **Propósito:** Observação visual da varredura completa e da consolidação pontual antes da prática.
- **Vetor Curado Canônico:** `[4, 1, 3]` ($n=3$).
- **Passo a Passo da Demonstração:**
  - Passada 0: Doca alvo $i=0$ ($A[0]=4$). Inspeção $j=1$ ($A[1]=1 < 4 \rightarrow \text{NOVO MÍNIMO}$, $minIndex=1$). Inspeção $j=2$ ($A[2]=3 \ge 1 \rightarrow \text{MANTER CANDIDATO}$). Commit: transferência física entre $A[0]$ e $A[1] \rightarrow [1, 4, 3]$ (1 consolidado).
  - Passada 1: Doca alvo $i=1$ ($A[1]=4$). Inspeção $j=2$ ($A[2]=3 < 4 \rightarrow \text{NOVO MÍNIMO}$, $minIndex=2$). Commit: transferência física entre $A[1]$ e $A[2] \rightarrow [1, 3, 4]$ (3 e 4 consolidados).
- **Sem efeitos colaterais:** Execução autônoma que não altera recordes locais.

---

## 9. Tutorial Guiado

- **Tela Dedicada:** `SelectionTutorialScreen.tsx` / `selectionTutorialGuide.ts`.
- **Vetor de Scaffolding:** `[4, 1, 3]`.
- **Dinâmica Guiada:**
  - O estudante clica manualmente em `[ ✦ NOVO MÍNIMO ]` ao comparar $1 < 4$;
  - Em seguida, clica em `[ = MANTER CANDIDATO ]` ao comparar $3 \ge 1$;
  - Aciona `[ ⇄ TRANSFERIR MENOR CARGA ]` para presenciar o salto da carga até a doca $0$;
  - Repete para a segunda passada, consolidando o entendimento do ciclo `INSPECT` $\rightarrow$ `COMMIT`.

---

## 10. Tipos de Exercícios Suportados

| Tipo de Exercício | Suporte no Módulo | Implementação Concreta no Código |
| :--- | :---: | :--- |
| **Introdução / Conceito** | `OBRIGATÓRIO` | `ProtocolModeBriefingScreen.tsx` (`selection-canonical`) |
| **Demonstração** | `OBRIGATÓRIO` | `DemonstrationScreen.tsx` consumindo `selectionDemonstration.ts` (`[4, 1, 3]`) |
| **Tutorial Guiado** | `OBRIGATÓRIO` | `SelectionTutorialScreen.tsx` com engine real |
| **Prática Básica** | `OBRIGATÓRIO` | `SelectionGameScreen.tsx` (Fase 1: $n=4$ gerado proceduralmente) |
| **Prática Progressiva** | `OBRIGATÓRIO` | `SelectionGameScreen.tsx` (Fase 2: $n=5$, Fase 3: $n=6$) |
| **Casos do Algoritmo** | `OBRIGATÓRIO` | Exercícios curados de instabilidade e casos sem troca |
| **Desafio** | `OPCIONAL` | Modo com limite estrito de tempo de inspeção |
| **Prática Livre (Sandbox)**| `OPCIONAL` | Planejado para expansão futura da plataforma |

---

## 11. Casos Pedagógicos Curados Específicos

1. **Caso 1: Mínimo Distante / Permuta Longa (`[60, 20, 30, 40, 10]`)**  
   - Propósito: O menor elemento (10) está no índice 4. Exige varredura completa e transferência de máxima distância ($|0 - 4| = 4$).
2. **Caso 2: Múltiplas Mudanças de Mínimo na Mesma Passada (`[80, 50, 30, 15]`)**  
   - Propósito: Exercitar a atualização contínua do ponteiro de mínimo ($80 \rightarrow 50 \rightarrow 30 \rightarrow 15$).
3. **Caso 3: Passada Sem Troca ($minIndex = i$) (`[10, 40, 30, 50]`)**  
   - Propósito: O menor elemento da partição desordenada já ocupa a posição alvo. Demonstra a ação `[ CONSOLIDAR POSIÇÃO ]` sem custo de movimentação física ($swaps$ não incrementa).
4. **Caso 4: Vetor Totalmente Invertido (`[50, 40, 30, 20, 10]`)**  
   - Propósito: Evidenciar que mesmo no pior caso de inversões, o Selection Sort executa no máximo $n-1$ trocas físicas ($4$ trocas), contrastando drasticamente com o Bubble Sort.
5. **Caso 5: Elementos Duplicados e Instabilidade (`[5a, 3, 5b, 1]`)**  
   - Propósito: Demonstrar visualmente a instabilidade. Ao selecionar 1 e trocá-lo com $5a$, a ordem relativa original entre $5a$ e $5b$ é invertida para $[1, 3, 5b, 5a]$.

---

## 12. Geração Procedural e Constraints do Módulo

- **Módulo:** `selectionConstraints.ts` e `generateSelectionPhaseArray`.
- **Tamanhos Curriculares:**
  - Prática Básica (Fase 1): $n = 4$ elementos;
  - Prática Intermediária (Fase 2): $n = 5$ elementos;
  - Prática Avançada (Fase 3): $n = 6$ elementos.
- **Constraints Matemáticas Dedicadas:**
  - `isGlobalMinNotInFirstPosition`: impede vetores onde o menor elemento global já inicia na posição $0$ (o que tornaria a primeira passada trivial);
  - `hasAtLeastOneKeepMin`: assegura ao menos uma decisão `KEEP_MIN` em cada exercício para evitar que o aluno apenas clique em novo mínimo automaticamente;
  - `hasMultipleMinUpdatesInAtLeastOnePass`: favorece em práticas maiores ao menos uma passada com atualizações sucessivas do candidato.

---

## 13. Feedback Formativo e Tratamento de Erros

- **Erro em Decisão de Mínimo:**
  - Se o usuário selecionar `NOVO MÍNIMO` quando $A[j] \ge A[minIndex]$:
    *"Incorreto: Caixa X (valor A[j]) não é menor que o candidato atual Caixa Y (valor A[minIndex])."*
  - Se o usuário selecionar `MANTER CANDIDATO` quando $A[j] < A[minIndex]$:
    *"Incorreto: Caixa X (valor A[j]) é menor que o candidato atual Caixa Y (valor A[minIndex]). Deve ser eleita como novo mínimo."*
  - O ponteiro $j$ não avança e o contador `errors += 1` é registrado na engine.
- **Tentativa de Commit Prematuro:**
  - A interface impede o botão de commit até que $j$ atinja a última caixa do vetor.

---

## 14. Sistema de Dicas

- **Funcionamento:** O botão de dica exibe a fórmula relacional ativa destacando as duas caixas em análise:
  - *"Comparando A[j] com A[minIndex]: Como valor_j < valor_min, clique em NOVO MÍNIMO."*
  - *"Comparando A[j] com A[minIndex]: Como valor_j ≥ valor_min, clique em MANTER CANDIDATO."*
- Contabilizado em `sessionMetrics.hintsUsed`.

---

## 15. Tela de Resultado e Reflexão

- **Apresentação:** `ResultScreen.tsx` com tema âmbar/roxo e nota reflexiva:
  - *"No Selection Sort, a varredura percorre toda a sub-esteira não ordenada antes de consolidar uma única troca por passada. Observe a economia de movimentações físicas em comparação com o algoritmo de vizinhos."*
  - Apresentação da Pontuação do Protocolo e métricas factuais.

---

## 16. Replay e Inspeção Retrospectiva

- **Modelo:** `selectionReplayModel.ts` (`buildSelectionReplayFrames`).
- **Painel:** `SelectionSortPseudocodePanel.tsx` com 13 instruções.
- **Destaques Dinâmicos:**
  - Linha 5: `se A[j] < A[minIndex]` (ativa em todos os quadros de inspeção com avaliação VERDADEIRO/FALSO);
  - Linha 6: `minIndex ← j` (destaque ciano ativo quando há novo mínimo);
  - Linha 9: `se minIndex ≠ i` (ativa no início do commit);
  - Linha 10: `trocar A[i] e A[minIndex]` (destaque roxo pulsante durante transferência física).

---

## 17. Persistência e Progresso (Schema v4 - ADR 0021)

- **Schema Atual:** Schema v4 (`modules.selection` em `sorting_station_save`, com fallback de leitura da chave legada `sorting_station_v1_save`).
- **Namespace Isolado:** O progresso do Selection Sort reside em `modules.selection` de forma totalmente estanque em relação aos demais módulos.
- **Identificadores Canônicos de Exercícios:** `exerciseSets["selection.practice.basic"]`, `exerciseSets["selection.practice.intermediate"]` e `exerciseSets["selection.practice.advanced"]`.
- **Desbloqueios Derivados:** Prática básica sempre desbloqueada; intermediária liberada ao concluir básica; avançada liberada ao concluir intermediária.
- **Retrocompatibilidade:** Projeção sob demanda para componentes legados via `getProtocolProgress(saveData, "selection")`.

---

## 18. Acessibilidade e Inclusão

- **Semântica `BoxRole` Completa:** Cada caixa expressa seu estado funcional via papéis textuais (`target`, `min`, `scan`, `sorted`), legíveis por leitores de tela.
- **Navegação por Teclado:** Ações acionáveis via atalhos sem exigir mouse.
- **Modo Alto Contraste:** Bordas pontilhadas e preenchimentos diferenciados para distinguir o candidato mínimo da posição alvo.

---

## 19. Riscos Pedagógicos e Armadilhas Conceituais

1. **Trocar Imediatamente ao Encontrar um Menor:** O estudante tentar trocar a carga no primeiro momento em que encontra um valor menor que a posição $i$.  
   *Salvaguarda:* A separação física entre `INSPECT` e `COMMIT` impossibilita trocas prematuras.
2. **Achar que o Algoritmo Para se o Vetor Estiver Ordenado:** Supor que o Selection Sort detecta ordenação antecipada.  
   *Salvaguarda:* O número invariante de $\frac{n(n-1)}{2}$ comparações é evidenciado na telemetria.
3. **Ignorar a Instabilidade:** Assumir que todo algoritmo elementar preserva a ordem relativa de valores iguais.  
   *Salvaguarda:* Caso pedagógico específico com elementos duplicados identificados.

---

## 20. Relação Futura com o Laboratório Comparativo

- **Confronto Direto com Bubble Sort:** O Selection Sort demonstrará a mesma quantidade de comparações teóricas que a variante canônica do Bubble Sort, mas com volume substancialmente menor de permutas em praticamente todas as entradas aleatórias.
- **Métricas Compartilhadas:** Comparações $C(n)$ e verificações relacionais perfeitamente comparáveis; permutas assimetricamente inferiores.
