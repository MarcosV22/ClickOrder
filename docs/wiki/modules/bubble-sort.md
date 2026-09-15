# Módulo 01 — Bubble Sort

> **Documento canônico do módulo curricular:** Especificação integral do Módulo de Bubble Sort da plataforma **Sorting Station**.  
> **Status de Implementação:** `IMPLEMENTADO` (Adaptação conceitual de fases para exercícios; engine pura, FSM, demonstração, replay, persistência v3 e cenários de desafio ativos).  
> **Data de Atualização:** 15/09/2026 (Marco PLATFORM-R0)  
> **Dependências:** [`AGENTS.md`](../../../AGENTS.md), [`ADR 0018`](../../adr/0018-game-to-educational-platform-transition.md), [`modules/README.md`](./README.md), [`04-sorting-engine.md`](../04-sorting-engine.md).

---

## 1. Identificação do Módulo

- **Nome Canônico:** Bubble Sort (Ordenação por Flutuação em Pares Adjacentes)
- **Identificador de Sistema (`moduleId`):** `bubble`
- **Rótulo Diegético na Interface:** `PROTOCOLO: BUBBLE SORT // ESTEIRA DE COMPARAÇÃO`
- **Status Factual:** `IMPLEMENTADO`
- **Classificação Curricular:** Algoritmo Elementar de Trocas Adjacentes
- **Complexidade Temporal:**
  - **Melhor Caso (Canônico):** $\Theta(n^2)$ comparações, $0$ trocas
  - **Melhor Caso (Variante Otimizada Early Exit):** $\Omega(n)$ comparações, $0$ trocas
  - **Caso Médio:** $\Theta(n^2)$ comparações, $\Theta(n^2)$ trocas
  - **Pior Caso:** $\Theta(n^2)$ comparações, $\frac{n(n-1)}{2}$ trocas (vetor estritamente decrescente)
- **Complexidade Espacial (Memória Auxiliar):** $O(1)$ (in-place)
- **Estabilidade Formal:** Estável (preserva a ordem relativa de elementos com chaves idênticas ao adotar estritamente $A[j] > A[j+1]$ como condição de troca)
- **Tema Visual e Acentos:** Ciano Neon (`#00f5ff`), brilho ciano suave, atmosfera de esteira de alta voltagem

---

## 2. Objetivos de Aprendizagem

Ao concluir o Módulo de Bubble Sort, o estudante deverá ser capaz de:
1. **Lembrar:** Identificar a operação microscópica de comparação estritamente local entre pares adjacentes ($A[j]$ e $A[j+1]$).
2. **Entender:** Explicar a invariante de laço segundo a qual, ao término da passada $i$, o maior elemento da sublista não ordenada atinge sua posição definitiva no final do vetor ($n - 1 - i$).
3. **Aplicar:** Executar corretamente decisões relacionais determinísticas (`TROCAR` vs. `MANTER`) sobre qualquer permutação de elementos sem recorrer à visão global prévia.
4. **Analisar:** Diferenciar a variante canônica de $n-1$ passadas fixas da variante otimizada com término antecipado (*Early Exit*) por ausência de permutas.
5. **Avaliar:** Constatar empiricamente a ineficiência do algoritmo diante de vetores invertidos ou do fenômeno de "elementos tartaruga" (valores baixos posicionados no final do vetor que avançam apenas uma casa por passada).

---

## 3. Modelo Mental e Metáfora Visual

- **A Central Logística:** O módulo representa uma linha de montagem com esteira de roletes energizados. Cargas pesadas e leves viajam sobre a esteira e precisam ser organizadas em ordem crescente de peso.
- **Janela de Inspeção Flutuante:** Dois sensores luminosos ciano iluminam exclusivamente as cargas nos índices $j$ e $j+1$. O operador não pode "olhar adiante" ou saltar posições; ele só tem visibilidade e poder de ação dentro dessa janela contígua.
- **A Flutuação ("Bolha"):** Elementos de maior valor empurram cargas menores para trás através de trocas sucessivas, flutuando como bolhas de ar na água até colidirem com o final da esteira ou com cargas já fixadas.
- **O Selo Definitivo (`LOCKED` / `OK`):** Ao final de cada varredura, a extremidade direita do subvetor recebe uma blindagem esmeralda (`sortedBoundary`), evidenciando visualmente que aquela vaga nunca mais precisará ser inspecionada.

---

## 4. Operações Fundamentais e Invariantes

### 4.1. Invariante de Laço Formal
Para qualquer passada $i$ ($0 \le i \le n - 2$):
- A sub-sequência $A[n - 1 - i \dots n - 1]$ está totalmente ordenada e contém os $i$ maiores elementos do vetor original.
- Para qualquer índice $k$ ($0 \le k < n - 1 - i$), temos $A[k] \le A[n - 1 - i]$.

### 4.2. Condição Relacional de Decisão
- Se $A[j] > A[j+1]$: a invariante de monotonicidade é violada localmente $\longrightarrow$ Ação obrigatória: `SWAP` (Trocar).
- Se $A[j] \le A[j+1]$: a ordem relativa local já é não decrescente $\longrightarrow$ Ação obrigatória: `KEEP` (Manter).

### 4.3. Regras de Parada
- **Variante Canônica:** Encerra-se após exatamente $n-1$ passadas completas, totalizando $\frac{n(n-1)}{2}$ comparações.
- **Variante Early Exit:** Encerra-se se uma passada completa ocorrer com $\text{swapsInCurrentPass} = 0$.

---

## 5. Mecânica Interativa Própria

- **Seleção Forçada do Par:** O usuário clica na primeira caixa do par mandatório $[j, j+1]$ e na segunda caixa vizinha. A FSM bloqueia seleções não contíguas ou fora da passada ativa.
- **Botoeira Contextual Bimodal:** Uma vez que o par mandatório está selecionado, o painel libera os botões de comando:
  - `[ ⇄ TROCAR ]` (Ação física de permuta);
  - `[ = MANTER ]` (Confirmação formal de que o par já está ordenado).
- **Animação Parabólica Simétrica:** Ao acionar `TROCAR`, a caixa esquerda executa translação para a direita (`animate-swap-right`) e a direita translada para a esquerda (`animate-swap-left`) durante $500\text{ms}$.
- **Trava de Segurança Síncrona:** Enquanto as caixas deslizam, todas as ações de interface permanecem congeladas (`isAnimating = true`), impedindo condições de corrida.

---

## 6. Pseudocódigo Canônico

### 6.1. Variante Canônica (9 Instruções — `BUBBLE_SORT_PSEUDOCODE`)
```text
1.  procedimento bubbleSort(A)
2.    para i de 0 até n - 2 faça
3.      para j de 0 até n - 2 - i faça
4.        se A[j] > A[j + 1] então
5.          trocar A[j] e A[j + 1]
6.        fim se
7.      fim para
8.    fim para
9.  fim procedimento
```

### 6.2. Variante com Early Exit (14 Instruções — `BUBBLE_SORT_EARLY_EXIT_PSEUDOCODE`)
```text
1.  procedimento bubbleSortEarlyExit(A)
2.    para i de 0 até n - 2 faça
3.      houveTroca ← falso
4.      para j de 0 até n - 2 - i faça
5.        se A[j] > A[j + 1] então
6.          trocar A[j] e A[j + 1]
7.          houveTroca ← verdadeiro
8.        fim se
9.      fim para
10.     se não houveTroca então
11.       interromper laço
12.     fim se
13.   fim para
14. fim procedimento
```

---

## 7. Métricas Factuais Adequadas ao Algoritmo

- **Comparações Formais ($C(n)$):** Contabiliza cada avaliação do par $[j, j+1]$.
- **Permutas Físicas ($M(n)$):** Contabiliza estritamente as trocas de memória efetuadas ($A[j] > A[j+1]$).
- **Decisões Incorretas (`errors`):** Decisões divergentes da expectativa teórica (tentar `KEEP` quando era `SWAP` ou vice-versa).
- **Dicas Solicitadas (`hintsUsed`):** Auxílios cognitivos requisitados.
- **Pontuação do Protocolo:**
  $$\text{score} = \max(0, 100 - (\text{errors} \times 10) - (\text{hintsUsed} \times 5))$$
- **Tempo de Operação:** Monotônico, puramente descritivo, peso zero na pontuação.

---

## 8. Modo Demonstração

- **Propósito:** Aprendizado observacional passivo antes da interação prática.
- **Vetor Curado Canônico:** `[5, 2, 4, 1]` ($n=4$).
- **Propriedades Pedagógicas do Vetor:**
  - Passada 1: troca $5 > 2 \rightarrow [2, 5, 4, 1]$; troca $5 > 4 \rightarrow [2, 4, 5, 1]$; troca $5 > 1 \rightarrow [2, 4, 1, 5]$ (fixa 5 no índice 3).
  - Passada 2: manutenção deliberada de ordem $2 \le 4 \rightarrow \text{KEEP}$; troca $4 > 1 \rightarrow [2, 1, 4, 5]$ (fixa 4 no índice 2).
  - Passada 3: troca $2 > 1 \rightarrow [1, 2, 4, 5]$ (fixa 2 no índice 1 e conclui 1 no índice 0).
- **Execução:** Autônoma, sem pontuação, sem erros, com autoplay ajustável (`0.5x`, `1x`, `2x`) e destaque de pseudocódigo em tempo real.

---

## 9. Tutorial Guiado

- **Tela Dedicada:** `TutorialScreen.tsx` / `tutorialGuide.ts`.
- **Vetor de Scaffolding:** `[3, 1, 2]` ($n=3$).
- **Etapas Guiadas:**
  1. Identificação do primeiro par $[3, 1]$ com instrução explícita de troca ($3 > 1$).
  2. Execução assistida da permuta resultando em $[1, 3, 2]$.
  3. Comparação assistida de $[3, 2]$ com instrução de troca ($3 > 2$).
  4. Fixação do 3 no final e início da segunda passada sobre $[1, 2]$.
  5. Decisão de manter a ordem ($1 \le 2$) e consolidação total do vetor $[1, 2, 3]$.

---

## 10. Tipos de Exercícios Suportados

| Tipo de Exercício | Suporte no Módulo | Implementação Concreta no Código |
| :--- | :---: | :--- |
| **Introdução / Conceito** | `OBRIGATÓRIO` | `ProtocolModeBriefingScreen.tsx` (`bubble-canonical`, `bubble-early-exit`) |
| **Demonstração** | `OBRIGATÓRIO` | `DemonstrationScreen.tsx` consumindo `bubbleDemonstration.ts` (`[5, 2, 4, 1]`) |
| **Tutorial Guiado** | `OBRIGATÓRIO` | `TutorialScreen.tsx` sobre `[3, 1, 2]` |
| **Prática Básica** | `OBRIGATÓRIO` | `GameScreen.tsx` (Fase 1: $n=4$ gerado proceduralmente) |
| **Prática Progressiva** | `OBRIGATÓRIO` | `GameScreen.tsx` (Fase 2: $n=5$, Fase 3: $n=6$ com sementes procedurais) |
| **Casos do Algoritmo** | `OBRIGATÓRIO` | Modo Desafio (`CHALLENGE_SCENARIOS`: ordenado, quase ordenado, pior caso) |
| **Desafio** | `OPCIONAL` | Modo Early Exit com telemetria de operações evitadas |
| **Prática Livre (Sandbox)**| `OPCIONAL` | Planejado para expansão futura da plataforma |

---

## 11. Casos Pedagógicos Curados Específicos

1. **Caso 1: Vetor Já Ordenado (`[12, 25, 47, 63, 88]`)**  
   - Propósito: Ilustrar a ausência total de trocas ($0$ trocas) e a economia de 60% das operações na variante Early Exit (4 comparações vs. 10 no canônico).
2. **Caso 2: Quase Ordenado (`[15, 8, 23, 42, 60]`)**  
   - Propósito: Uma única troca inicial na Passada 1 seguida por estabilização na Passada 2 (7 comparações com término precoce).
3. **Caso 3: Elemento Tartaruga / Pior Caso (`[30, 45, 60, 75, 10]`)**  
   - Propósito: O menor elemento (10) inicia na última posição. Evidencia que valores baixos no final avançam apenas 1 posição por passada, exigindo todas as 10 comparações e anulando os ganhos da heurística.
4. **Caso 4: Elementos Duplicados (`[4, 2, 4, 1]`)**  
   - Propósito: Exercitar a estabilidade formal do algoritmo ($4 \le 4 \rightarrow \text{KEEP}$).
5. **Caso 5: Vetor Estritamente Invertido (`[50, 40, 30, 20]`)**  
   - Propósito: Pior caso analítico absoluto com todas as comparações resultando em permutas ($6$ trocas para $n=4$).

---

## 12. Geração Procedural e Constraints do Módulo

- **Gerador:** `generateSortingArray` (PRNG Mulberry32) configurado com `BUBBLE_CAMPAIGN_CONSTRAINTS`.
- **Tamanhos Curriculares:**
  - Prática Básica (Fase 1): $n = 4$ elementos;
  - Prática Intermediária (Fase 2): $n = 5$ elementos;
  - Prática Avançada (Fase 3): $n = 6$ elementos.
- **Constraints Matemáticas Obrigatórias:**
  - `isNotSorted`: impede vetores já ordenados de surgirem na prática regular;
  - `isNotStrictlyReversed`: impede vetores estritamente decrescentes em práticas iniciais;
  - `hasAtLeastOneSwap`: garante ao menos uma ação `SWAP`;
  - `hasAtLeastOneKeep`: garante ao menos uma ação `KEEP` para exercitar discernimento decisório;
  - Intervalo de valores: $1 \dots 99$ sem números negativos;
  - Sem elementos repetidos por padrão (`allowDuplicates: false`).

---

## 13. Feedback Formativo e Tratamento de Erros

- **Filosofia:** O erro não reinicia a fase e não desvia os ponteiros do algoritmo. Ele interrompe o avanço até que o estudante compreenda a relação relacional.
- **Tentativa de KEEP quando $A[j] > A[j+1]$:**
  - Alerta: *"Caixa X é maior que Caixa Y! No protocolo Bubble, cargas maiores devem ser permutadas para a direita."*
  - Incremento factual: `errors += 1`.
- **Tentativa de SWAP quando $A[j] \le A[j+1]$:**
  - Alerta: *"Caixa X já é menor ou igual à Caixa Y! Não há necessidade de troca."*
  - Incremento factual: `errors += 1`.
- **Tentativa de Seleção Não Adjacente:**
  - Alerta educativo: *"O Bubble Sort opera estritamente sobre elementos vizinhos contíguos."*

---

## 14. Sistema de Dicas

- **Comportamento:** Ao clicar em `[ ? DICA ]`, o sistema inspeciona o par ativo $[j, j+1]$ e expressa didaticamente a regra:
  - *"Observe os valores X e Y. Como X > Y, a ação requerida é TROCAR."*
  - *"Observe os valores X e Y. Como X ≤ Y, a ordem já está correta: selecione MANTER."*
- **Telemetria:** O uso de dica é registrado em `sessionMetrics.hintsUsed`, impactando levemente a Pontuação do Protocolo ($-5$ pontos por dica) sem bloquear o avanço.

---

## 15. Tela de Resultado e Reflexão

- **Apresentação:** `ResultScreen.tsx` exibindo:
  - Pontuação do Protocolo com feedback avaliativo;
  - Telemetria comparativa: Comparações realizadas vs. Trocas efetuadas;
  - Erros e dicas utilizados;
  - Pseudocódigo com resumo pedagógico;
  - Botão de acesso ao Replay retrospectivo (`[ ▶ VER EXECUÇÃO ]`);
  - Navegação para repetição com mesmo vetor ou avanço para novo exercício procedural.

---

## 16. Replay e Inspeção Retrospectiva

- **Modelo Puro:** `buildReplayFrames(initialArray, history)`.
- **Invariante:** Gera $1 + \text{history.length}$ quadros sem reexecutar o algoritmo.
- **Quadro 0:** Exibe o vetor inicial antes de qualquer operação.
- **Sincronização:** Cada passo destaca a linha exata no painel `BubbleSortPseudocodePanel` (instrução 4 para teste relacional e instrução 5 para permuta), acompanhado da contextualização factual (ex.: $5 > 2 \rightarrow \text{VERDADEIRO}$).

---

## 17. Persistência e Progresso

- **Schema Atual:** Schema v3 (`protocols.bubble` em `sorting_station_v1_save`).
- **Dados Persistidos:** `unlockedPhases`, `highestPhaseReached`, `hasCompletedTutorial`, `records[phase]` (com `completed`, `bestScore`, `bestScoreErrors`, `bestScoreHintsUsed`, `bestScoreElapsedTimeMs`).
- **Migração Futura (Schema v4):** O módulo `bubble` exportará seus registros sob chaves modulares `records["bubble-basic"]`, `records["bubble-intermediate"]`, `records["bubble-advanced"]`, e `records["bubble-challenge-X"]`.

---

## 18. Acessibilidade e Inclusão

- **Navegação:** Suporte a seleção por teclado (`Tab`, `Space`, `Enter`).
- **Independência de Cor:** As caixas sob comparação recebem contornos animados, ícones indicadores e etiquetas semânticas, não dependendo exclusivamente de iluminação ciano.
- **Redução de Movimento:** Respeito à flag `reducedMotion`, substituindo a animação parabólica de 500ms por transição opaca instantânea.

---

## 19. Riscos Pedagógicos e Armadilhas Conceituais

1. **Ilusão da "Ordenação Mágica":** O estudante achar que pode trocar qualquer par desordenado que enxergar na tela.  
   *Salvaguarda:* FSM estrita que força o avanço sequencial do par $[j, j+1]$.
2. **Confusão entre Comparações e Trocas:** Supor que se não houve troca, não houve trabalho computacional.  
   *Salvaguarda:* Contador de comparações que incrementa mesmo em ações `KEEP`.
3. **Crença de que o Algoritmo "Sabe" Quando Terminou:** Achar que a variante canônica para assim que o vetor estiver ordenado.  
   *Salvaguarda:* Execução rigorosa de todas as passadas canônicas no modo padrão, contrastada formalmente com o Modo Early Exit.

---

## 20. Relação Futura com o Laboratório Comparativo

- **Paridade:** No Laboratório Comparativo, o Bubble Sort consumirá a mesma semente PRNG que os outros algoritmos selecionados.
- **Métricas Exportáveis:** $C(n)$ comparações, $M(n)$ trocas locais, quadros de execução.
- **Comportamento Previsto:** Superará o Selection Sort em trocas no melhor caso ($0$ trocas no Early Exit), mas será superado pelo Selection Sort em número de trocas no caso médio e pior caso, e amplamente superado em comparações pelos algoritmos $O(n \log n)$.
