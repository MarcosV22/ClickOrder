# Ficha de Observação por Módulo, Ficha de Incidentes e Simulação de Dry-Run (`Itens B e H`)

> **Protocolo Mestre:** [`../bubble-v2-formative-evaluation.md`](../bubble-v2-formative-evaluation.md)  
> **Status Real:** **`PREPARADO — REVISADO EM UX-REDESIGN-R3-B.1`** *(Formulários oficiais em branco para uso presencial futuro — zero participantes reais avaliados).*  
> **Regras Inegociáveis:** (1) Manter separadas **Fonte A (Sistema)**, **Fonte B (Observação)** e **Fonte C (Relato)**; (2) Registrar **ambos** os vetores (`5s` e `Prática Básica pós-Tutorial`); (3) **Não comparar tempos obtidos por métodos distintos**.

---

## ITEM B — Ficha de Observação Estruturada (1 conjunto em branco por participante real)

### Cabeçalho da Sessão, Acessibilidade e Exposição Prévia (Sem Dados Pessoais)
- **Código do Participante:** `P___` &nbsp;|&nbsp; **Data:** `___/___/202_` &nbsp;|&nbsp; **Duração Real Total:** `____ min`
- **Estrato:** `[ ] A (Iniciante sem domínio de ordenação)   [ ] B (Estudante com programação)   [ ] C (Docente/Monitor)`
- **Ordem Atribuída (`O1..O6`):** `[ ] O1 (B-S-I)  [ ] O2 (B-I-S)  [ ] O3 (S-B-I)  [ ] O4 (S-I-B)  [ ] O5 (I-B-S)  [ ] O6 (I-S-B)`
- **Viewport / Ambiente:** `[ ] 1366×768 (100%)   [ ] Outra: _________` &nbsp;|&nbsp; **Áudio Consentido?** `[ ] Sim  [ ] Não`
- **Adaptação de Acessibilidade Aplicada (`Seção C.3`):**
  `[ ] Nenhuma (padrão 5s visual)   [ ] Exploração inicial sem limite de tempo   [ ] Zoom ampliado / Movimento reduzido   [ ] Leitor de tela / Leitura oral assistida`
- **Exposição / Conhecimento Prévio Autodeclarado (Coletar ANTES do 1º módulo, sem explicar os algoritmos):**
  - **Bubble Sort:** `[ ] Nunca viu   [ ] Viu superficialmente / ouviu falar   [ ] Já estudou ou programou`
  - **Selection Sort:** `[ ] Nunca viu   [ ] Viu superficialmente / ouviu falar   [ ] Já estudou ou programou`
  - **Insertion Sort:** `[ ] Nunca viu   [ ] Viu superficialmente / ouviu falar   [ ] Já estudou ou programou`

---

### B.1. Bloco de Observação — BUBBLE SORT (`Posição na ordem: [ ] 1º  [ ] 2º  [ ] 3º`)

#### 1. Fonte C (Primeira Impressão — Antes do Tutorial Guiado V2)
- **Estado Efetivamente Exibido na Abertura (`BubbleGameScreenV2`):**
  `[x] Esteira 4 caixas (2 primeiras = "vizinho") + Card "Previsão Antes de Agir" com botões numéricos [ ___ ] e [ ___ ]` *(Botões `TROCAR`, `MANTER` e `? Dica` ocultos neste momento — NÃO cobrar!)*
- **Vetor exibido nesta abertura de 5s (`five_sec_displayed_array`):** `[ ____, ____, ____, ____ ]`
- **Modalidade aplicada:** `[ ] 5s padrão   [ ] Exploração sem tempo (acessibilidade)`
- **C1 ("O que acha que precisa fazer aqui?"):** `___________________________________________________________`
- **C2 ("Onde olhou / o que notou primeiro?"):** `____________________________________________________________`
- **C3 ("O que acredita que os botões visíveis fazem?"):** `___________________________________________________`

#### 2. Tutorial Guiado V2 Obrigatório (`[ ← Práticas ] → [ Tutorial Guiado ]` sobre `[3, 1, 2]`)
- **Concluído integralmente antes da Prática Básica?** `[ ] Sim` *(obrigatório pelo protocolo `R3-B.1`)*
- **Observações rápidas / eventual dúvida ou ajuda no Tutorial:** `_____________________________________________`

#### 3. Fonte B — Observação Direta durante a Prática Básica Real Pós-Tutorial (`n = 4`)
- **Vetor REAL sorteado ao entrar na Prática Básica pós-Tutorial (`practice_initial_array`):** `[ ____, ____, ____, ____ ]`
- **Identificação das Tarefas Essenciais (`Seção 7`):**
  - Identificou os **dois vizinhos comparados** (`vizinho`)? `[ ] Sim, imediato  [ ] Com hesitação  [ ] Não`
  - Compreendeu quando **trocar vs. manter** (`[1] TROCAR` / `[2] MANTER`)? `[ ] Sim  [ ] Parcial  [ ] Não`
  - Percebeu a **consequência** (troca adjacente + fixação `ordenado` à direita)? `[ ] Sim  [ ] Parcial  [ ] Não`
- **Comportamentos e Red Flags Observados:**
  - `[ ]` Hesitação prolongada (> 10s) ao surgir `[1] TROCAR / [2] MANTER` após a previsão inicial
  - `[ ]` Clique mecânico alternando botões sem comparar os valores
  - `[ ]` Tentou clicar diretamente nas caixas da esteira esperando que trocassem
  - `[ ]` Confusão com mecânica de módulo visto anteriormente (*carry-over*: `_________________________`)
  - `[ ]` Autocorreção antes de confirmar `"Continuar"` na Previsão ou no Checkpoint Pós-Passada *(anotar aqui pois `?uxTest=1` grava apenas a última opção clicada: `_________________________`)*
  - `[ ]` Leu o feedback causal após erro e recuperou-se no passo seguinte
  - `[ ]` Usou `[ ? Dica ]` &nbsp;|&nbsp; `[ ]` Abriu `Aprofundamento técnico` (motivo aparente: `_________________`)
  - `[ ]` Houve intervenção/pausa extra? *(Se SIM, preencher **Item H** — ID `#____`)*
- **Notas cronológicas de campo (`Fonte B`):**
  `____________________________________________________________________________________________________`

#### 4. Fonte C (Durante e Pós-Prática) — Verbalizações e Compreensão Oral
- **Citações espontâneas relevantes do Think-Aloud:**
  `____________________________________________________________________________________________________`
- **Resposta literal à Pergunta Pós-Bubble (*"Por que você trocou ou manteve aqueles dois números?"*):**
  `____________________________________________________________________________________________________`
  `____________________________________________________________________________________________________`
- **Codificação Pós-Sessão (`Item F` — preencher SOMENTE na análise, cego à `Fonte A`):**
  `Avaliador 1: [ ] 0 [ ] 1 [ ] 2 [ ] 3` | `Avaliador 2: [ ] 0 [ ] 1 [ ] 2 [ ] 3` | `Consenso Final: [ ] 0 [ ] 1 [ ] 2 [ ] 3` | `Caso ambíguo? [ ] Não [ ] Sim`

#### 5. Fonte A — Dados Objetivos do Sistema (`BubbleResultScreenV2` + Painel `?uxTest=1`)
- **Na Tela:** Score Protocolo: `____/100` | Comp.: `___` | Trocas (`swaps`): `___` | Erros: `___` | Dicas: `___` | Tempo total: `_______` | Concluiu? `[ ] Sim [ ] Não`
- **No Painel `?uxTest=1`:** JSON exportado (`<Pxx>-<Ox>-bubble.json`)? `[ ] Sim` | `timeToFirstActionMs`: `_______ ms` *(nota: inclui leitura/confirmação do card Previsão Antes de Agir; NÃO comparável a Selection/Insertion)* | 1ª Ação OK: `[ ] S [ ] N` | Predição OK: `[ ] S [ ] N` | Pós-Passada OK: `[ ] S [ ] N` | Gaveta: `___x` | Micro-Reflexão OK: `[ ] S [ ] N` | Replay: `[ ] S [ ] N`

---

### B.2. Bloco de Observação — SELECTION SORT (`Posição na ordem: [ ] 1º  [ ] 2º  [ ] 3º`)

#### 1. Fonte C (Primeira Impressão — Antes do Tutorial Guiado V2)
- **Estado Efetivamente Exibido na Abertura (`SelectionGameScreenV2`):**
  `[x] Esteira 4 caixas ("PRÓXIMA POSIÇÃO" + "menor atual" na 1ª; "observando" na 2ª) + Card "BUSCA" com "[ ? Dica ]" e botões "[1] Sim, é o novo menor" / "[2] Não, manter o menor"`
- **Vetor exibido nesta abertura de 5s (`five_sec_displayed_array`):** `[ ____, ____, ____, ____ ]`
- **Modalidade aplicada:** `[ ] 5s padrão   [ ] Exploração sem tempo (acessibilidade)`
- **C1 ("O que acha que precisa fazer aqui?"):** `___________________________________________________________`
- **C2 ("Onde olhou / o que notou primeiro?"):** `____________________________________________________________`
- **C3 ("O que acredita que os botões visíveis fazem?"):** `___________________________________________________`

#### 2. Tutorial Guiado V2 Obrigatório (`[ ← Práticas ] → [ Tutorial Guiado ]` sobre `[4, 1, 3]`)
- **Concluído integralmente antes da Prática Básica?** `[ ] Sim` *(obrigatório pelo protocolo `R3-B.1`)*
- **Observações rápidas / eventual dúvida ou ajuda no Tutorial:** `_____________________________________________`

#### 3. Fonte B — Observação Direta durante a Prática Básica Real Pós-Tutorial (`n = 4`)
- **Vetor REAL sorteado ao entrar na Prática Básica pós-Tutorial (`practice_initial_array`):** `[ ____, ____, ____, ____ ]`
- **Identificação das Tarefas Essenciais (`Seção 7`):**
  - Identificou a **posição a preencher** (`PRÓXIMA POSIÇÃO`)? `[ ] Sim, imediato  [ ] Com hesitação  [ ] Não`
  - Identificou o **menor atual** guardado (`menor atual`)? `[ ] Sim, imediato  [ ] Com hesitação  [ ] Não`
  - Identificou o **número observado** pelo scanner (`observando`)? `[ ] Sim, imediato  [ ] Com hesitação  [ ] Não`
  - Compreendeu o **momento do posicionamento final** (troca única só ao fim da passada)? `[ ] Sim  [ ] Parcial  [ ] Não`
- **Eventos Manuais Não Cobertos por `?uxTest=1` (Registro Obrigatório na Fonte B):**
  - Checkpoint Pré-Commit da 1ª passada (*"Qual número deve ir para a primeira posição?"*): `[ ] Acertou de 1ª   [ ] Errou antes de acertar (clicou em: ____)`
  - Abriu `Aprofundamento técnico`? `[ ] Não  [ ] Sim (___x)` &nbsp;|&nbsp; Clicou em `VER EXECUÇÃO` (Replay) no resultado? `[ ] Não  [ ] Sim`
- **Comportamentos e Red Flags Observados:**
  - `[ ]` Estranhou que as caixas **não** se moveram ao clicar `[1] Sim, é o novo menor` (*carry-over* de Bubble)
  - `[ ]` Confundiu `menor atual` com `observando` ao interpretar a pergunta
  - `[ ]` Hesitação prolongada (> 10s) &nbsp;|&nbsp; `[ ]` Clique mecânico sem comparar os valores
  - `[ ]` Usou `[ ? Dica ]` &nbsp;|&nbsp; `[ ]` Leu o feedback causal após erro e recuperou-se autonomamente
  - `[ ]` Houve intervenção/pausa extra? *(Se SIM, preencher **Item H** — ID `#____`)*
- **Notas cronológicas de campo (`Fonte B`):**
  `____________________________________________________________________________________________________`

#### 4. Fonte C (Durante e Pós-Prática) — Verbalizações e Compreensão Oral
- **Citações espontâneas relevantes do Think-Aloud:**
  `____________________________________________________________________________________________________`
- **Resposta literal à Pergunta Pós-Selection (*"Por que o algoritmo não movimenta as caixas enquanto procura o menor?"*):**
  `____________________________________________________________________________________________________`
  `____________________________________________________________________________________________________`
- **Codificação Pós-Sessão (`Item F` — preencher SOMENTE na análise, cego à `Fonte A`):**
  `Avaliador 1: [ ] 0 [ ] 1 [ ] 2 [ ] 3` | `Avaliador 2: [ ] 0 [ ] 1 [ ] 2 [ ] 3` | `Consenso Final: [ ] 0 [ ] 1 [ ] 2 [ ] 3` | `Caso ambíguo? [ ] Não [ ] Sim`

#### 5. Fonte A — Dados Objetivos do Sistema (`ResultScreen` Oficial — *Sem JSON `?uxTest=1` no Selection*)
- Score Protocolo: `____/100` | Comp.: `___` | Transferências (`swaps`): `___` | Decisões Incorretas (`errors`): `___` | Dicas Utilizadas (`hintsUsed`): `___` | Tempo de Operação: `_______` | Concluiu? `[ ] Sim [ ] Não` *(Não registrar nem comparar tempo manual de 1ª ação com o Bubble).*

---

### B.3. Bloco de Observação — INSERTION SORT (`Posição na ordem: [ ] 1º  [ ] 2º  [ ] 3º`)

#### 1. Fonte C (Primeira Impressão — Antes do Tutorial Guiado V2)
- **Estado Efetivamente Exibido na Abertura (`InsertionGameScreenV2`):**
  `[x] Trilho Aéreo com 2º valor como "CHAVE" + Esteira com 1ª caixa "OBSERVANDO" e 2ª posição "VAGA" + botões "[1] Deslizar para a Direita" / "[2] Encaixar a Chave" + "? Precisa de ajuda? Ver Dica"`
- **Vetor exibido nesta abertura de 5s (`five_sec_displayed_array`, formato `[1º, chave 2º, 3º, 4º]`):** `[ ____, (chave: ____), ____, ____ ]`
- **Modalidade aplicada:** `[ ] 5s padrão   [ ] Exploração sem tempo (acessibilidade)`
- **C1 ("O que acha que precisa fazer aqui?"):** `___________________________________________________________`
- **C2 ("Onde olhou / o que notou primeiro?"):** `____________________________________________________________`
- **C3 ("O que acredita que os botões visíveis fazem?"):** `___________________________________________________`

#### 2. Tutorial Guiado V2 Obrigatório (`[ ← Práticas ] → [ Tutorial Guiado ]` sobre `[4, 2, 3]`)
- **Concluído integralmente antes da Prática Básica?** `[ ] Sim` *(obrigatório pelo protocolo `R3-B.1`)*
- **Observações rápidas / resposta ao checkpoint conceitual pós-1º deslocamento no Tutorial:** `___________________`

#### 3. Fonte B — Observação Direta durante a Prática Básica Real Pós-Tutorial (`n = 4`)
- **Vetor REAL sorteado na Prática Básica pós-Tutorial (`practice_initial_array`, formato `[1º, chave 2º, 3º, 4º]`):** `[ ____, (chave: ____), ____, ____ ]`
- **Identificação das Tarefas Essenciais (`Seção 7`):**
  - Identificou a **chave suspensa** (`CHAVE` no trilho aéreo)? `[ ] Sim, imediato  [ ] Com hesitação  [ ] Não`
  - Identificou a **vaga física** aberta na esteira (`VAGA`)? `[ ] Sim, imediato  [ ] Com hesitação  [ ] Não`
  - Identificou o **número observado** (`OBSERVANDO`)? `[ ] Sim, imediato  [ ] Com hesitação  [ ] Não`
  - Compreendeu o **motivo do deslocamento** (`[1] Deslizar para a Direita`)? `[ ] Sim  [ ] Parcial  [ ] Não`
  - Compreendeu o **momento do encaixe** (`[2] Encaixar a Chave` / cabeceira)? `[ ] Sim  [ ] Parcial  [ ] Não`
- **Eventos Manuais Não Cobertos por `?uxTest=1` (Registro Obrigatório na Fonte B):**
  - Abriu `Aprofundamento técnico` (revelando `#1..#4` e pseudocódigo)? `[ ] Não  [ ] Sim (___x)`
  - Clicou em `VER EXECUÇÃO` (Replay) na tela de resultado? `[ ] Não  [ ] Sim`
- **Comportamentos e Red Flags Observados:**
  - `[ ]` Verbalizou que o elemento deslocado "trocou de lugar" com a chave suspensa (confusão `SHIFT` vs `SWAP`)
  - `[ ]` Tentou encaixar a chave antes de abrir espaço para um elemento maior à esquerda
  - `[ ]` Assumiu que os elementos à esquerda da vaga nunca mais poderiam se mover (`ORD LOCAL` confundido com `OK`)
  - `[ ]` Hesitação prolongada (> 10s) &nbsp;|&nbsp; `[ ]` Usou `? Precisa de ajuda? Ver Dica`
  - `[ ]` Leu o feedback causal após erro e recuperou-se autonomamente
  - `[ ]` Houve intervenção/pausa extra? *(Se SIM, preencher **Item H** — ID `#____`)*
- **Notas cronológicas de campo (`Fonte B`):**
  `____________________________________________________________________________________________________`

#### 4. Fonte C (Durante e Pós-Prática) — Verbalizações e Compreensão Oral
- **Citações espontâneas relevantes do Think-Aloud:**
  `____________________________________________________________________________________________________`
- **Resposta literal à Pergunta Pós-Insertion (*"Qual é a diferença entre deslizar um número e trocar dois números de lugar?"*):**
  `____________________________________________________________________________________________________`
  `____________________________________________________________________________________________________`
- **Codificação Pós-Sessão (`Item F` — preencher SOMENTE na análise, cego à `Fonte A`):**
  `Avaliador 1: [ ] 0 [ ] 1 [ ] 2 [ ] 3` | `Avaliador 2: [ ] 0 [ ] 1 [ ] 2 [ ] 3` | `Consenso Final: [ ] 0 [ ] 1 [ ] 2 [ ] 3` | `Caso ambíguo? [ ] Não [ ] Sim`

#### 5. Fonte A — Dados Objetivos do Sistema (`ResultScreen` Oficial — *Sem JSON `?uxTest=1` no Insertion*)
- Score Protocolo: `____/100` | Comp.: `___` | Deslocamentos (`shifts`): `___` | Inserções (`insertions`): `___` | Decisões Incorretas (`errors`): `___` | Dicas Utilizadas (`hintsUsed`): `___` | Tempo de Operação: `_______` | Concluiu? `[ ] Sim [ ] Não`

---

## ITEM H — Ficha de Incidentes Técnicos, Fadiga, Adaptações e Intervenções do Pesquisador

> **Quando preencher:** Sempre que ocorrer (a) intervenção do moderador após bloqueio > 60s, (b) adaptação de acessibilidade relevante durante a sessão, (c) pausa extra por fadiga ou desistência parcial/total, ou (d) anomalia técnica/interrupção externa. Se nada disso ocorrer, marcar explicitamente `[ ] Zero intervenções ou incidentes nesta sessão`.

- **Código do Participante:** `P___` &nbsp;|&nbsp; `[ ] Zero intervenções ou incidentes nesta sessão`

| ID | Módulo / Etapa (`5s`, `Tutorial`, `Prática`, `Resultado`, `Transferência`) | Minuto / Passo Aproximado | Tipo (`Intervenção Pedagógica`, `Ajuda de Navegação`, `Adaptação Acessibilidade`, `Pausa/Fadiga`, `Incidente Técnico`) | Motivo Exato que Levou ao Registro | Conteúdo Literal da Ajuda ou Ação do Pesquisador | Impacto Possível na Interpretação dos Dados daquele Módulo |
| :---: | :--- | :---: | :--- | :--- | :--- | :--- |
| **#1** | | | | | | `[ ] Nenhum  [ ] Moderado (afeta autonomia de navegação)  [ ] Alto (sinalizar/isolar rubrica deste módulo)` |
| **#2** | | | | | | `[ ] Nenhum  [ ] Moderado  [ ] Alto` |
| **#3** | | | | | | `[ ] Nenhum  [ ] Moderado  [ ] Alto` |

---

## APÊNDICE DE TREINAMENTO — Simulação Operacional de *Dry-Run* (`EXEMPLO SINTÉTICO FICTÍCIO — NÃO É DADO REAL`)

> [!CAUTION]
> **AVISO EXPLÍCITO DE DADOS SINTÉTICOS DE SIMULAÇÃO (`UX-REDESIGN-R3-B.1 — SEÇÃO 11`):**  
> Os registros `SIM_DRYRUN_01` e `SIM_DRYRUN_02` abaixo são **100% FICTÍCIOS**, criados exclusivamente para validar operacionalmente o fluxo de telas, a limpeza de estado entre participantes, a exportação JSON do Bubble, a transcrição manual de Selection/Insertion e o preenchimento das fichas antes da ida a campo.  
> **É ESTRITAMENTE PROIBIDO copiar estes exemplos para `session-consolidation-template.csv` ou `transfer-and-incidents-template.csv` (que permanecem vazios, apenas com cabeçalho) ou citá-los como evidência empírica.**

### Simulação Operacional Verificada Passo a Passo contra o Código Real

1. **Verificação de Inicialização Limpa (`SIM_DRYRUN_01` — Exemplo Fictício: Cat. A, Ordem `O3: Selection → Bubble → Insertion`):**
   - Comando executado no Console antes da entrada: `localStorage.removeItem("sorting_station_save"); window.location.assign("/?uxTest=1");`
   - Resultado verificado no código (`App.tsx`): `saveData` volta ao estado inicial com `0/3` práticas nos três cards da `HomeScreen` (`[ COMEÇAR ]`) e `bubbleUxSession` inicia como `null`.
2. **Verificação do Módulo 1 no Dry-Run (`Selection Sort` — Transcrição Manual):**
   - `Home → Selection [COMEÇAR] → [Ir para práticas ›] → PRÁTICA BÁSICA [INICIAR PRÁTICA →]`: abre `SelectionGameScreenV2` diretamente na etapa `BUSCA`. Anotado exemplo fictício `five_sec_displayed_array = [64, 21, 83, 39]`; coletadas respostas `C1–C3` sobre os botões visíveis `[1] Sim / [2] Não`.
   - Clicado `[ ← Práticas ]` (nenhuma conclusão gravada) $\rightarrow$ `[ Tutorial Guiado ]` (`[4, 1, 3]`) $\rightarrow$ concluir tutorial chama `handleSelectionTutorialComplete()`, abrindo automaticamente nova `SelectionGameScreenV2` com novo vetor procedural fictício `practice_initial_array = [52, 17, 78, 34]`.
   - Ao concluir o último posicionamento, transição única (`350–500ms`) leva à `ResultScreen` canônica: transcritos para a Ficha `B.2` `PONTUAÇÃO DO PROTOCOLO: 90/100`, `Comparações: 6`, `Transferências: 2`, `Decisões Incorretas: 1`, `Dicas Utilizadas: 0`, `Tempo de Operação: 01m 42s`, além de `Checkpoint Pré-Commit: Acertou de 1ª` e `Aprofundamento técnico: Não` na `Fonte B`.
3. **Verificação do Módulo 2 no Dry-Run (`Bubble Sort` — Assimetria dos 5s + Exportação JSON `?uxTest=1`):**
   - Retorno `☰ SELETOR → ← HUB PRINCIPAL → Bubble [COMEÇAR] → [Ir para práticas ›] → PRÁTICA BÁSICA [INICIAR PRÁTICA →]`.
   - Confirmado: a tela exibe `Previsão Antes de Agir` com dois botões numéricos (ex. fictício `[ 71 ]` e `[ 24 ]` sobre `five_sec_displayed_array = [71, 24, 58, 13]`); `[1] TROCAR / [2] MANTER` estão ocultos e não são cobrados em `C3`.
   - Clicado `[ ← Práticas ]` sem clicar nos botões $\rightarrow$ `bubbleUxSession` permanece `null` $\rightarrow$ `[ Tutorial Guiado ]` (`[3, 1, 2]`) $\rightarrow$ `"Começar a Prática Básica ▶"` abre nova `BubbleGameScreenV2` limpa (`practice_initial_array = [45, 19, 63, 28]`), iniciando `practiceStartedAt` sem o tempo gasto na entrevista de 5 segundos.
   - Ao chegar em `BubbleResultScreenV2`, clicado em `[ Baixar JSON ]` no painel `Instrumentação UX Local (?uxTest=1)`. Estrutura exata verificada contra `exportUxTestSessionAsJson` (`bubbleUxTest.ts`):
     ```json
     {
       "__EXEMPLO_FICTICIO_DRY_RUN__": "NAO_USAR_COMO_DADO_REAL",
       "sessionId": "ux-1763990000000-k9x2m1",
       "sessionStartedAt": 1763990000000,
       "practiceStartedAt": 1763990000000,
       "firstActionAt": 1763990014200,
       "timeToFirstActionMs": 14200,
       "firstActionCorrect": true,
       "predictionAnswered": true,
       "predictionCorrect": true,
       "wrongActionsCount": 0,
       "hintRequestsCount": 1,
       "detailsOpenedCount": 0,
       "passCheckpointAnswered": true,
       "passCheckpointCorrect": true,
       "resultReachedAt": 1763990098500,
       "microReflectionAnswered": true,
       "microReflectionCorrect": true,
       "replayOpened": false,
       "sessionCompletedAt": 1763990095000
     }
     ```
4. **Verificação do Módulo 3 no Dry-Run (`Insertion Sort` — Registro de Chave Suspensa):**
   - `InsertionGameScreenV2` exibe `v0` na 1ª posição, `v1` suspenso como `CHAVE` sobre a `VAGA` na 2ª posição, `v2` na 3ª e `v3` na 4ª (ex. fictício pós-tutorial `[48, (chave: 16), 72, 31]` $\rightarrow$ registrado `practice_initial_array = "[48, 16, 72, 31]"`). Na `ResultScreen`, transcritos `Comparações: 5`, `Deslocamentos: 4`, `Inserções: 3`, `Decisões Incorretas: 0`, `Dicas Utilizadas: 0`.
5. **Verificação Crítica da Troca de Participantes (`SIM_DRYRUN_01 → SIM_DRYRUN_02`):**
   - Constatado no código (`App.tsx`) que se o moderador rodasse apenas `localStorage.removeItem("sorting_station_save")` **sem recarregar a aba**, o estado em memória React manteria `1/3` práticas concluídas na `HomeScreen`, `"Melhor pontuação anterior"` na `ResultScreen` e o `bubbleUxSession` antigo do participante anterior!
   - Executando o comando atômico padronizado no `Item K` (`localStorage.removeItem("sorting_station_save"); window.location.assign("/?uxTest=1");`), tanto o `localStorage` quanto todos os estados em memória React são completamente reinicializados para `SIM_DRYRUN_02`.
