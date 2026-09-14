# ADR 0014: Replay Somente Leitura e Pseudocódigo Sincronizado do Selection Sort

- **Status:** Aceito
- **Data:** 2026-09-14
- **Autores:** Marcos Mendes / Antigravity AI
- **Decisores:** Mantenedores do Sorting Station

---

## 1. Contexto e Declaração do Problema

Após a implementação da campanha de 3 fases do Selection Sort em P2.1-D (ADR 0013), o estudante conclui cada fase na `ResultScreen` recebendo as métricas da execução. Para fechar o ciclo pedagógico de aprendizagem conceitual e algorítmica, o projeto demandava o **marco P2.1-E**: a auditoria retrospectiva da execução do Selection Sort através de um Replay dedicado e pseudocódigo formal sincronizado passo a passo.

Os desafios e restrições obrigatórias incluíam:
1. **Derivação Pura Sem Reexecução:** O replay deve derivar seus quadros exclusivamente de `initialArray` e `SelectionStepRecord[]`, sem reexecutar o algoritmo de ordenação nem alterar estados globais;
2. **Representação Fiel de Frames:** Tipificação estrita de quadros em `INITIAL`, `INSPECTION` e `COMMIT`, sem introdução de "frames fantasmas" (`frames.length === history.length + 1`);
3. **Semântica Visual na Esteira:** Durante `INSPECTION`, exibir explicitamente ALVO ($i$), SCAN ($j$), MÍN ($minIndex$), comparação concreta e manutenção ou atualização do candidato; durante `COMMIT`, distinguir claramente troca física real de consolidação direta sem troca ($minIndex = i$);
4. **Pseudocódigo Canônico Estruturado:** Exibir pseudocódigo formal do Selection Sort com destaque semântico preciso de: `INIT_MIN`, `IF_CONDITION`, `UPDATE_MIN`, `CHECK_SWAP` e `SWAP_STATEMENT`;
5. **Caráter Estritamente Somente-Leitura:** A entrada e saída do Replay não pode alterar score, erros, dicas, tempo ou estado de persistência/sessão;
6. **Preservação do Replay do Bubble Sort:** Retrocompatibilidade absoluta com o Replay e pseudocódigo de Bubble Sort já existentes;
7. **Padrão de Responsividade Desktop:** Aplicação rigorosa das diretrizes de container (`justify-start`, `min-h-full overflow-y-auto`, buffers de rodapé `pb-16 sm:pb-24`, esteira com rolagem horizontal controlada sem quebra de linhas).

---

## 2. Decisão Arquitetural

Decidiu-se:

### 2.1. Modelo Puro e Imutável (`src/game/replay/selectionReplayModel.ts`)
- A função pura `buildSelectionReplayFrames(initialArray, history)` processa os registros fáticos gravados durante a fase:
  - **Quadro 0 (`INITIAL`):** Configuração original do vetor antes de qualquer ação do scanner;
  - **Quadros 1 a N:** Mapeamento 1:1 direto de cada `SelectionStepRecord`, produzindo quadros do tipo `INSPECTION` (varredura com $1 < 4$, mantendo ou atualizando $minIndex$) ou `COMMIT` (término da passada com swap ou consolidação direta sem troca);
  - **Invariante de Não-Proliferação:** Ausência absoluta de frames sintéticos fantasmas (`frames.length === history.length + 1`);
  - **Imutabilidade Estrita:** Todos os arrays e objetos são congelados com `Object.freeze`.

### 2.2. Mapeamento de Pseudocódigo Canônico (`src/game/replay/selectionReplayPseudocode.ts`)
- Definição da tabela canônica `SELECTION_SORT_PSEUDOCODE` com 13 instruções estruturadas em português;
- Função determinística `getSelectionPseudocodeHighlight(frame)`:
  - `INITIAL`: Destaca a instrução de procedimento (`PROCEDURE`);
  - `INSPECTION` com novo mínimo: Destaca `UPDATE_MIN`, marca `IF_CONDITION` como `TRUE` e inclui `INIT_MIN` quando na primeira inspeção da passada;
  - `INSPECTION` mantendo candidato: Destaca `IF_CONDITION` como `FALSE` e não ativa `UPDATE_MIN`;
  - `COMMIT` com troca ($minIndex \neq i$): Destaca `SWAP_STATEMENT`, marca `CHECK_SWAP` como `TRUE` e sinaliza `swapExecuted: true`;
  - `COMMIT` sem troca ($minIndex = i$): Destaca `CHECK_SWAP` como `FALSE`, sem ativar `SWAP_STATEMENT`.
- Contexto concreto (`concreteContext`) que isola matematicamente os índices e valores de $i$, $j$, $minIndex$, condição formal avaliada e texto descritivo da instrução executada.

### 2.3. Componentes de UI Dedicados
- **`SelectionSortPseudocodePanel.tsx`:** Painel temático em tons de roxo/ciano com marcadores de linha, badges contextuais (`★ NOVO MÍNIMO`, `VERDADEIRO`, `FALSO`, `⇄ TRANSFERÊNCIA EXECUTADA`, `ELEMENTO NO DESTINO`) e caixa de inspeção com valores concretos;
- **`SelectionReplayScreen.tsx`:** Tela completa de auditoria do Selection Sort com:
  - Header institucional com botão `[ ← VOLTAR AO RESULTADO ]`;
  - Badges de passo e de ação com estados discriminados;
  - Esteira com `NumberedBox` usando os papéis semânticos já existentes (`target-min`, `scan-min`, `target`, `min`, `scan`, `sorted`, `default`);
  - Esteira com rolagem horizontal contida (`overflow-x-auto min-w-max mx-auto px-2`), prevenindo quebra vertical de caixas;
  - Callout de explicação factual;
  - Linha de progresso percentual e botoeira de reprodução (`↺ REINICIAR`, `← ANTERIOR`, `▶ REPRODUZIR / ⏸ PAUSAR`, `PRÓXIMO →`) com autoplay a 1200ms;
  - Layout defensivo desktop (`justify-start`, `min-h-full overflow-y-auto`, `pb-16 sm:pb-24`), garantindo zero CTAs cortados.

### 2.4. Integração na Máquina de Estados da Aplicação
- **`ResultScreen.tsx`:**
  - Habilitação do botão `▶ VER EXECUÇÃO` para fases de Selection Sort (remoção da trava `!isSelection`);
  - Exibição unificada do pseudocódigo do algoritmo correspondente na tela de resultado, mantendo o princípio pedagógico do Selection Sort.
- **`App.tsx`:**
  - Roteamento seguro: quando `screen === "replay"`, verifica `result.protocol === "selection"` e renderiza `<SelectionReplayScreen>` ou `<ReplayScreen>` (Bubble Sort);
  - Garantia de somente-leitura: `result` permanece intocado no estado do React; retornar do replay não afeta pontuação, erros, dicas, tempo decorrido ou progresso da campanha.

---

## 3. Consequências e Trade-offs

### 3.1. Consequências Positivas
- **Isolamento Total:** A reprodução do Selection Sort não interfere na lógica do Bubble Sort e vice-versa;
- **Determinismo e Testabilidade:** Módulos funcionais puros testados com cobertura para cenários canônicos (`[4, 1, 3]`), vetores já ordenados, vetores unitários e verificações de imutabilidade;
- **Experiência do Usuário Coesa:** A mesma facilidade de auditoria cinestésica introduzida no Bubble Sort agora está disponível para o Selection Sort com seus conceitos específicos (scanner, mínimo corrente, troca de longa distância no commit).

### 3.2. Riscos e Mitigações

| Risco Identificado | Severidade | Estratégia de Mitigação |
| :--- | :--- | :--- |
| **Mutação acidental de métricas da sessão** | Baixa | `SelectionReplayScreen` opera exclusivamente como leitor de dados e o retorno a `ResultScreen` é uma simples transição de estado da UI sem side-effects. |
| **Quebra de esteira em telas estreitas** | Baixa | Container interno com `min-w-max` dentro de envelope `overflow-x-auto`, impedindo quebra de linha dos blocos numerados. |
| **Divergência entre o passo fático e o pseudocódigo** | Baixa | Mapeamento formal determinístico validado pelo teste canônico de 6 quadros em `selectionReplayPseudocode.test.ts`. |

---

## 4. Conformidade com a Suíte de Testes

- O teste canônico obrigatório `[4, 1, 3]` foi implementado e validado em 6 quadros exatos (`INITIAL`, `1 < 4: NOVO MÍNIMO`, `3 < 1: MANTER`, `COMMIT: [1, 4, 3]`, `3 < 4: NOVO MÍNIMO`, `COMMIT: [1, 3, 4]`);
- Suíte completa de testes passou de 229 para 246 testes unitários 100% verdes, sem regressões.
