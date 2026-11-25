# Rubrica Analítica de Compreensão `0–3`: Critérios, Casos Ambíguos e Concordância entre Avaliadores (`Item F`)

> **Protocolo Mestre:** [`../bubble-v2-formative-evaluation.md`](../bubble-v2-formative-evaluation.md)  
> **Status Real:** **`PREPARADO — REVISADO EM UX-REDESIGN-R3-B.1`** *(Instrumento de codificação pronto para uso pós-coleta; **zero participantes reais avaliados ou codificados** até a presente data).*  
> **Fonte Codificada:** Exclusivamente **`Fonte C` (Relato Verbal Literal do Participante)** nas perguntas pós-prática (`Item E.1`) e na Tarefa de Transferência sobre `[4, 1, 3, 2]` (`Item G`).

---

## 1. Regras Metodológicas Inegociáveis de Codificação (`Revisão R3-B.1`)

> [!IMPORTANT]
> **SALVAGUARDAS METODOLÓGICAS DA RUBRICA `0–3`:**
> 1. **Proibição de Conversão no Score do Jogo:** Esta rubrica `0–3` é um instrumento analítico externo ao produto. Jamais é convertida na `PONTUAÇÃO DO PROTOCOLO` (`0..100`) nem altera engines, FSMs ou `Schema v4`.
> 2. **Cegamento frente à `Fonte A` (`Fonte A ↛ Fonte C`):** Durante a codificação da fala literal, o avaliador **deve ocultar as colunas de métricas do sistema** (`sys_protocol_score`, `sys_errors`, `sys_hints_used`, `timeToFirstActionMs`). Acertar todos os cliques não confere nota `2` ou `3` sem justificativa verbal; inversamente, ter errado cliques na prática não impede nota `3` se a explicação verbal final articular corretamente o mecanismo.
> 3. **Distinção entre Conhecimento Prévio e Aprendizagem (`Seção 4`):** Uma nota `3` indica **justificativa verbal situada consistente com o modelo mental do algoritmo**, mas **não autoriza concluir ganho causal de aprendizagem** — na análise descritiva, as notas `0–3` devem ser apresentadas cruzadas com o grau de familiaridade prévia autodeclarado (`prior_familiarity_algo`).
> 4. **Linguagem Natural Plenamente Aceita:** Participantes iniciantes (`Cat. A`) **não** precisam usar termos formais (`índice`, `invariante`, `subvetor`, `shift`, `commit`) para receber nota `3`. Expressões cotidianas equivalentes que descrevam de modo observável a comparação, a ação e a consequência física/estrutural recebem pontuação integral.
> 5. **Fronteira Crítica entre `Nível 1` (Descrever Ação) e `Níveis 2–3` (Justificar Mecanismo):**
>    - **Explicar apenas a ação (`Nível 1`):** O participante relata *o que fez na interface* ou *o que viu se mexer* (*"cliquei no botão 1"*, *"troquei porque estava errado"*, *"a caixa subiu e outra andou"*), **sem enunciar a regra relacional/algorítmica** que governa a decisão;
>    - **Justificar parcialmente o mecanismo (`Nível 2`):** O participante explicita **quais grandezas foram comparadas e por que a ação era necessária**, mas omite uma parte estrutural decisiva do modelo mental daquele algoritmo;
>    - **Justificar integralmente o mecanismo (`Nível 3`):** O participante articula os **três componentes observáveis** da âncora do algoritmo: **(i) quem é comparado**, **(ii) qual ação ocorre e sob qual condição**, e **(iii) qual consequência física/estrutural diferencia aquele algoritmo**.

---

## 2. Matriz Geral dos Quatro Níveis (`0` a `3`)

| Nível | Rótulo Analítico | Critério Observável na Transcrição Literal (`Fonte C`) |
| :---: | :--- | :--- |
| **`0`** | **Ausente ou Incompatível** | Declara não saber/ter chutado, inverte a relação de ordem crescente ou atribui ao algoritmo uma mecânica incompatível (ex.: afirmar que o Selection Sort troca vizinhos a cada comparação). |
| **`1`** | **Descrição Superficial da Ação (Sem Mecanismo)** | Descreve apenas o gesto motor/visual (*"apertei trocar"*, *"fui clicando Sim e Não"*, *"a caixa deslizou"*), sem justificar a relação de grandeza entre os elementos nem o motivo algorítmico. |
| **`2`** | **Comparação e Ação Corretas, com Omissão Estrutural** | Explica corretamente **a comparação entre os valores** e **o motivo imediato da ação**, mas omite a propriedade estrutural distintiva do mecanismo (propagação adjacente no Bubble; espera até o fim da busca para troca única no Selection; chave suspensa + vaga física no deslocamento unilateral do Insertion). |
| **`3`** | **Justificativa Completa do Mecanismo** | Explica com precisão observável **comparação + ação condicional + consequência estrutural na esteira**, distinguindo o modelo mental próprio do algoritmo (em linguagem natural ou técnica). |

---

## 3. Âncoras Específicas e Exemplos de Linguagem Natural por Algoritmo

> **Nota:** Os enunciados abaixo são **âncoras hipotéticas de calibração** para orientar os avaliadores, e não falas empíricas coletadas.

### 3.1. Bubble Sort — *"Por que você trocou ou manteve aqueles dois números?"*
- **Checklist dos 3 componentes observáveis para Nota `3`:**
  - `[C1-B]` Restrição local ao **par de vizinhos lado a lado** destacados;
  - `[C2-B]` Regra condicional correta: **trocar** se o da esquerda for maior que o da direita; **manter** se já for menor ou igual;
  - `[C3-B]` Consequência estrutural: o maior valor vai sendo **levado/empurrado para a direita** até ficar fixo no fim da passada.

| Nota | Critério Observável | Exemplo Hipotético de Calibração (Linguagem Natural Aceita) |
| :---: | :--- | :--- |
| **`0`** | Regra invertida, aleatória ou incompatível. | *"Fui clicando em trocar quando o primeiro número era menor."* / *"Não sei, fui tentando até passar."* |
| **`1`** | Relata apenas a ação sem explicitar a relação maior/menor entre os números. | *"Troquei porque estava bagunçado e mantive quando achei que já estava no lugar."* |
| **`2`** | Cumpre `[C2-B]` (compara os dois valores corretamente), mas omite `[C1-B]` e/ou `[C3-B]`. | *"Quando o número da esquerda era maior que o outro eu troquei; quando era menor, mantive."* |
| **`3`** | Cumpre `[C1-B] + [C2-B] + [C3-B]` (ainda que sem termos técnicos). | *"Olhei sempre os dois vizinhos um do lado do outro: quando o da esquerda era maior que o da direita, troquei os dois de lugar para o número maior ir caminhando até travar lá na ponta direita; quando já era menor, deixei como estava."* |

---

### 3.2. Selection Sort — *"Por que o algoritmo não movimenta as caixas enquanto procura o menor?"*
- **Checklist dos 3 componentes observáveis para Nota `3`:**
  - `[C1-S]` Separação entre **procurar/olhar** e **mover** (`PROCURAR ≠ MOVER`), guardando provisoriamente quem é o `menor atual`;
  - `[C2-S]` Justificativa causal: ainda faltam caixas à frente na parte não ordenada e **pode aparecer um número ainda menor** antes do fim da fila;
  - `[C3-S]` Consequência estrutural: realiza **uma única troca/posicionamento físico no final da passada** direto na `próxima posição`.

| Nota | Critério Observável | Exemplo Hipotético de Calibração (Linguagem Natural Aceita) |
| :---: | :--- | :--- |
| **`0`** | Não reconhece a busca estática ou atribui trocas passo a passo. | *"Acho que ele não moveu porque já estava ordenado."* / *"Não percebi."* |
| **`1`** | Descreve apenas a restrição dos botões na tela, sem explicar o porquê lógico. | *"Porque nessa hora só aparecia botão de Sim ou Não e não tinha botão de mover."* |
| **`2`** | Cumpre `[C2-S]` (precisa olhar até o fim pois pode haver outro menor), mas omite `[C1-S]` (guardar `menor atual`) ou `[C3-S]` (troca única final na posição-alvo). | *"Porque ele precisa conferir todos os números até o último antes de mexer, senão podia ter um menor lá no fim."* |
| **`3`** | Cumpre `[C1-S] + [C2-S] + [C3-S]` em linguagem natural ou técnica. | *"Porque enquanto procura ele só vai marcando quem ganha como menor até ali, já que pode achar alguém ainda menor mais pra frente; desse jeito ele evita mexer à toa e faz uma troca só no final, levando o menor direto para a próxima posição."* |

---

### 3.3. Insertion Sort — *"Qual é a diferença entre deslizar um número e trocar dois números de lugar?"*
- **Checklist dos 3 componentes observáveis para Nota `3`:**
  - `[C1-I]` Contraste cinético direto: na **troca**, dois números mudam de lugar um pelo outro simultaneamente; no **deslizar**, **apenas um número maior anda uma casa para a direita**;
  - `[C2-I]` Papel da **`CHAVE` suspensa** e da **`VAGA` física** vazia aberta na esteira;
  - `[C3-I]` Consequência estrutural: cada deslizamento **faz a vaga recuar para a esquerda** (abrindo espaço) até que não haja mais elemento maior à esquerda e a **chave encaixe na vaga**.

| Nota | Critério Observável | Exemplo Hipotético de Calibração (Linguagem Natural Aceita) |
| :---: | :--- | :--- |
| **`0`** | Trata deslizar e trocar como idênticos ou descreve regra contraditória. | *"Não vi diferença, nos dois casos os dois números trocam de posição."* |
| **`1`** | Menciona detalhe visual superficial sem distinguir permuta bilateral de deslocamento unilateral. | *"Nesse aqui uma caixa subia pra parte de cima e nos outros ficava tudo embaixo."* |
| **`2`** | Cumpre `[C1-I]` (um número só anda para a direita vs. dois permutam), mas omite `[C2-I]` e/ou `[C3-I]` (como a chave suspensa cria a vaga e quando ela encaixa). | *"Trocar inverte dois números entre si; deslizar empurra só o número maior uma posição para a direita."* |
| **`3`** | Cumpre `[C1-I] + [C2-I] + [C3-I]` em linguagem natural ou técnica. | *"Na troca dois números mudam um pro lugar do outro na hora; aqui o número da vez fica suspenso lá em cima como chave deixando um espaço vazio, então cada número maior à esquerda só escorrega uma casa pra direita ocupando a vaga, até sobrar o espaço certo pra chave descer e encaixar."* |

---

## 4. Rubrica `0–3` para a Tarefa de Transferência sobre `[4, 1, 3, 2]` (`Item G`)

> **Lembrete Crítico:** Sobre `[4, 1, 3, 2]`, os três algoritmos geram `[1, 4, 3, 2]` após a 1ª troca do Bubble, o 1º commit do Selection e o encaixe da 1ª chave do Insertion. **Jamais pontuar pelo vetor resultante**; pontuar estritamente pelas três respostas processuais:
> - **Bubble:** compara vizinhos `4` e `1` $\rightarrow$ **troca imediata `4 ↔ 1`** antes de olhar `3` e `2`, porque $4 > 1$;
> - **Selection:** guarda `4`, compara `1` com `4` (novo menor `1`), **continua inspecionando `3` com `1` e `2` com `1` sem mover nada** $\rightarrow$ **troca única `4 ↔ 1` somente no fim da varredura**;
> - **Insertion:** **suspende a chave `1`** abrindo vaga na 2ª posição, compara `4` com a chave `1` ($4 > 1$) $\rightarrow$ **desliza `4` unilateralmente para a direita na vaga** e em seguida **encaixa a chave `1`** na 1ª posição.
> - **Pontuação `0–3`:** `0` = nenhum algoritmo explicado corretamente (ou cita apenas o vetor final); `1` = explica corretamente apenas `1` algoritmo; `2` = diferencia corretamente `2` dos `3` algoritmos; `3` = diferencia corretamente os **`3` algoritmos** em comparação inicial, primeira movimentação física e momento/motivo.

---

## 5. Procedimento Formal para Casos Ambíguos e Registro de Discordâncias entre Avaliadores (`Revisão R3-B.1`)

### 5.1. Protocolo com Dois ou Mais Avaliadores (Configuração Recomendada para Publicação)
1. **Preparação Cega da Planilha de Codificação:** Exportar apenas `participant_code`, `algorithm` (ou bloco de transferência) e a **transcrição literal exata** (`verb_post_task_literal_answer`), omitindo estrato `A/B/C`, pontuação do jogo, erros e dicas.
2. **Passada 1 — Codificação Independente:**
   - O Avaliador 1 preenche `rubric_coder1_raw_0_3` e o Avaliador 2 preenche `rubric_coder2_raw_0_3` de forma totalmente independente, verificando os itens do checklist (`[C1]`, `[C2]`, `[C3]`).
   - **Regra Inegociável:** As notas brutas `coder1_raw` e `coder2_raw` **jamais são apagadas** após a discussão — elas permanecem salvas no CSV para reporte transparente do percentual de concordância exata pré-consenso (e número total de divergências).
3. **Passada 2 — Revisão Estruturada de Discordâncias e Casos Ambíguos:**
   - Sempre que `coder1_raw != coder2_raw` ou quando qualquer avaliador marcar `rubric_ambiguous_case = true`:
     - Confrontar literalmente o trecho da fala com os três itens observáveis `[C1]`, `[C2]` e `[C3]` daquele algoritmo;
     - **Regra de Evidência Explícita (Anti-Inferência Generosa):** Se um componente (por exemplo, `[C3-S]` — troca única ao final da passada) estiver apenas *implícito* na opinião de um avaliador, mas não tiver formulação verbal identificável no texto transcrito, prevalece **a nota inferior** (`2` em vez de `3`);
     - Se persistir empate interpretativo entre dois avaliadores, acionar um **3º avaliador árbitro** (ou registrar a nota conservadora menor caso a equipe tenha apenas 2 pesquisadores);
     - Preencher obrigatoriamente `rubric_final_consensus_0_3` e documentar em `rubric_disagreement_notes` qual componente (`[C1]`, `[C2]` ou `[C3]`) motivou a divergência e o critério usado na decisão final.

### 5.2. Protocolo Caso Haja Apenas Um Único Avaliador Disponível
1. Realizar **dupla codificação intra-avaliador** com intervalo mínimo de `48 horas` entre a 1ª leitura (`rubric_coder1_raw_0_3`, mantendo `rubric_coder2_raw_0_3 = NA`) e a 2ª releitura cega;
2. Marcar explicitamente `rubric_ambiguous_case = true` em toda resposta fronteiriça, justificar a presença/ausência de `[C1]`, `[C2]` e `[C3]` em `rubric_disagreement_notes` e reportar essa condição como limitação metodológica explícita do estudo (ausência de dupla codificação independente).

---

## 6. Simulação de Execução da Rubrica e Reconciliação (`EXEMPLO FICTÍCIO DE DRY-RUN — NÃO É DADO REAL`)

> [!CAUTION]
> **SIMULAÇÃO METODOLÓGICA FICTÍCIA (`UX-REDESIGN-R3-B.1 — SEÇÃO 11`):**  
> Os dois exemplos abaixo são **totalmente fictícios**, criados apenas para testar operacionalmente o checklist `[C1/C2/C3]` e o fluxo de reconciliação entre avaliadores antes da coleta. **Não constam nos CSVs oficiais e não representam participantes reais.**

| Caso Fictício de Dry-Run | Algoritmo | Fala Fictícia Simulada | Nota Bruta Avaliador 1 | Nota Bruta Avaliador 2 | Caso Ambíguo? | Consenso Final e Registro em `rubric_disagreement_notes` |
| :--- | :---: | :--- | :---: | :---: | :---: | :--- |
| **`SIM_DRYRUN_A`** *(Iniciante em linguagem natural)* | **Insertion Sort** | *"Trocar muda dois blocos um pelo outro; ali o número subiu pra cima deixando um buraco, aí o maior escorregou pro buraco na direita e depois o de cima desceu no espaço que abriu."* | **`3`** | **`3`** | `false` | **Consenso `3`:** Concordância imediata. Embora use *"buraco"* e *"número de cima"* em vez de `vaga` e `chave`, satisfaz explicitamente `[C1-I]` + `[C2-I]` + `[C3-I]`. |
| **`SIM_DRYRUN_B`** *(Fronteira `2` vs `3`)* | **Selection Sort** | *"Porque enquanto ele está olhando a fila ainda pode ter um número menor mais pra frente, então ele só guarda quem é o menor por enquanto."* | **`3`** | **`2`** | `true` | **Consenso `2` (Regra Conservadora):** Fala cumpre `[C1-S]` (guardar menor provisório) e `[C2-S]` (pode haver menor adiante), mas **omite explicitamente `[C3-S]`** (que ocorre uma única troca física no fim da passada na próxima posição). Registrada divergência `3 vs 2 -> 2`. |
