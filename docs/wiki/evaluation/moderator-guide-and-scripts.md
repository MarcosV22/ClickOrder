# Roteiro do Moderador, Teste de 5 Segundos, Think-Aloud, Pós-Tarefa e Transferência (`Itens A, C, D, E e G`)

> **Protocolo Mestre:** [`../bubble-v2-formative-evaluation.md`](../bubble-v2-formative-evaluation.md)  
> **Status Real:** **`PREPARADO — REVISADO EM UX-REDESIGN-R3-B.1`** *(Uso exclusivo após verificação ética institucional aplicável; zero sessões reais executadas até o momento).*  
> **Duração Planejada Realista:** **`45 a 60 minutos`** por participante (incluindo Tutorial Guiado V2 obrigatório nos 3 módulos e micro-pausas contra fadiga).

---

## ITEM A — Roteiro Operacional Completo do Moderador

### A.1. Preparação, Código Anônimo, Acessibilidade e Exposição Prévia (`5–7 min`)
1. Executar integralmente o **Checklist Técnico Pré-Sessão (`Item K`)** em [`consent-privacy-and-checklist.md`](./consent-privacy-and-checklist.md), garantindo que o comando atômico `localStorage.removeItem("sorting_station_save"); window.location.assign("/?uxTest=1");` tenha zerado tanto o `localStorage` quanto a memória React da aba.
2. Atribuir o próximo **código pseudonimizado** (`P01`, `P02`, ...), anotar o **estrato** (`A`: iniciante sem domínio de ordenação; `B`: estudante com programação; `C`: docente/monitor) e alocar a **ordem contrabalanceada (`O1` a `O6`)**:
   - **`O1`:** `Bubble → Selection → Insertion`
   - **`O2`:** `Bubble → Insertion → Selection`
   - **`O3`:** `Selection → Bubble → Insertion`
   - **`O4`:** `Selection → Insertion → Bubble`
   - **`O5`:** `Insertion → Bubble → Selection`
   - **`O6`:** `Insertion → Selection → Bubble`
3. Apresentar o **Texto Informativo e Roteiro de Consentimento (`Item I`)** e confirmar anuência explícita antes de iniciar qualquer anotação.
4. **Checagem Prévia de Acessibilidade Visual/Temporal (Obrigatória antes do 1º módulo):**
   - Perguntar de forma natural: *"O tamanho da letra e o conforto de leitura na tela estão bons para você, ou prefere ampliar o zoom, reduzir animações ou fazer a observação inicial sem contagem rápida de tempo?"*
   - Se o participante tiver baixa visão, dislexia, uso de leitor de tela ou desconforto com exposição rápida de 5 segundos, ativar imediatamente o **Modo de Primeira Exploração Sem Limite de Tempo (`Seção C.3`)** e marcar `accessibility_adaptation` na Ficha `B`.
5. **Registro Obrigatório de Exposição / Conhecimento Prévio por Algoritmo (`Sem explicar os algoritmos!`):**
   - Perguntar apenas o grau de contato anterior com cada nome (*"Antes de hoje, você já teve contato com Bubble Sort, Selection Sort ou Insertion Sort?"*) e marcar na Ficha `B` para cada um: `Nunca viu`, `Apenas ouviu falar / viu superficialmente` ou `Já estudou / implementou`.

### A.2. Fala de Acolhimento e Neutralidade
> *"Obrigado por participar. Estamos avaliando a clareza visual de uma plataforma educacional sobre algoritmos de ordenação chamada Sorting Station. Importante: **nós estamos avaliando a interface da plataforma, e não você**. Não há nota, não há pegadinha e o relógio não desconta pontos. Vamos passar por três módulos curtos — cerca de 10 a 12 minutos em cada um, com pausas entre eles — totalizando cerca de 45 a 60 minutos. Você pode pedir pausa ou encerrar a qualquer momento."*

### A.3. Regras Inegociáveis de Condução (Sem Improviso em Campo)
- **Caminho didático único e fixo para todos (`Cat. A`, `Cat. B` e `Cat. C`):** Em **todos** os três módulos, seguir estritamente:
  $$\text{1. Primeira Impressão (na Prática Básica, sem clicar)} \longrightarrow \text{2. Tutorial Guiado V2} \longrightarrow \text{3. Prática Básica Real (Think-Aloud)} \longrightarrow \text{4. Justificativa Verbal Pós-Prática} \longrightarrow \text{5. Micro-pausa e Próximo Algoritmo}$$
  É **proibido** improvisar em sala pulando o Tutorial Guiado V2 para uns participantes e aplicando-o para outros.
- **Não ensinar o algoritmo antes do Teste Inicial nem antecipar cliques:** deixar que o próprio Tutorial Guiado V2 apresente a mecânica após a coleta da primeira impressão, e durante a Prática Básica deixar o participante localizar sozinho perguntas, botões, `[ ? Dica ]` e `Aprofundamento técnico`.
- **Critério estrito de intervenção:** intervir **somente** em bloqueio total **> 60 segundos** ou incidente técnico, registrando obrigatoriamente na **Ficha de Incidentes e Intervenções (`Item H`)** o momento, o motivo, o conteúdo exato da ajuda e o impacto possível na interpretação dos dados daquele módulo.

### A.4. Passo a Passo Exato Repetido nos Módulos 1, 2 e 3 (`~10–13 min` por módulo + `1–2 min` de pausa)
1. **Abrir a tela inicial da Prática Básica apenas para Primeira Impressão (sem nenhum clique do participante):**
   - Na `HomeScreen` (`http://localhost:8443/?uxTest=1`), clicar em `[ COMEÇAR ]` no card do módulo da vez $\rightarrow$ na tela de Visão Geral clicar rapidamente em `[ Ir para práticas › ]` $\rightarrow$ no card `PRÁTICA BÁSICA` clicar em `[ INICIAR PRÁTICA → ]` (pedindo ao participante que olhe para a tela ao sinal combinado, sem tocar no mouse/teclado).
   - Anotar na Ficha `B` o vetor exibido nessa abertura (`five_sec_displayed_array`) e aplicar o **Teste de Cinco Segundos (`Item C`)** (ou a adaptação acessível `C.3`).
2. **Executar o Tutorial Guiado V2 Obrigatório (`~2,5–3,5 min`):**
   - Concluídas as três perguntas `C1–C3` **sem ter clicado em nenhuma opção da Prática Básica**, o moderador clica em **`[ ← Práticas ]`** no canto superior esquerdo (retornando ao `PracticeSelector` sem gravar conclusão e sem contaminar `bubbleUxSession`) e clica em **`[ Tutorial Guiado ]`**.
   - Pedir: *"Agora faça este tutorial guiado curto para conhecer como esta esteira funciona."*
   - Acompanhar em silêncio, anotando na Ficha `B` se o tutorial foi concluído (`[x] Sim`) e se houve qualquer dúvida/ajuda.
   - Ao clicar no botão final do Tutorial V2 (`"Começar a Prática Básica ▶"` / conclusão do tutorial), o sistema **abre automaticamente uma nova instância limpa da Prática Básica V2** com um **novo vetor procedural `n = 4`** e cronômetro zerado!
3. **Executar a Prática Básica Real em *Think-Aloud* (`~4–6 min`):**
   - Anotar imediatamente na Ficha `B` os **4 valores reais do vetor desta Prática Básica (`practice_initial_array`)** — atenção: eles serão diferentes dos 4 números vistos rapidamente na etapa 1 porque concluir o tutorial sorteia uma nova entrada procedural limpa!
   - Ler a instrução de **Think-Aloud (`Item D`)** e preencher a **Ficha de Observação (`Item B`)** até o participante concluir a ordenação e chegar automaticamente à tela oficial de resultado.
4. **Coletar `Fonte A` e Aplicar a Pergunta Verbal Pós-Prática (`~2 min`):**
   - Na tela de resultado (`BubbleResultScreenV2` ou `ResultScreen`):
     - Anotar os contadores objetivos da **Fonte A** visíveis na tela (no Bubble, abrir `Ver pontuação, tempo e detalhes da execução` após a fala inicial caso precise copiar `Tempo total`);
     - **Se o módulo for Bubble Sort:** rolar até `Instrumentação UX Local (?uxTest=1)` e clicar imediatamente em **`[ Baixar JSON ]`**, salvando como `<CodigoParticipante>-<Ordem>-bubble.json` (ex.: `P01-O3-bubble.json`);
     - **Se o módulo for Selection ou Insertion Sort:** conferir se a abertura manual de `Aprofundamento técnico`, o checkpoint pré-commit (Selection) e eventual clique em `VER EXECUÇÃO` (Replay) estão anotados na Ficha `B` (pois esses dois módulos não exportam JSON `?uxTest=1`);
   - Formular a **Pergunta Verbal Pós-Tarefa (`Item E.1`)** correspondente ao algoritmo e transcrever literalmente a resposta.
5. **Micro-pausa contra fadiga e transição para o próximo módulo (`1–2 min`):**
   - Oferecer breve descanso visual/água (*"Tudo bem até aqui? Quer respirar um instante antes do próximo?"*).
   - Retornar à `HomeScreen` (`‹ Voltar para a seleção de práticas` / `☰ SELETOR` $\rightarrow$ `← HUB PRINCIPAL`) para iniciar o próximo módulo da ordem `O1..O6`.
6. **Fechamento após o 3º módulo (`8–12 min`):**
   - Minimizar/ocultar a janela do navegador, oferecer 1 minuto de respiro e aplicar a **Tarefa de Transferência com o vetor inédito `[4, 1, 3, 2]` (`Item G`)**, seguida da **Escala Descritiva `E1–E5` e 2 perguntas breves (`Item E.2`)**.
   - Agradecer e executar imediatamente o **Checklist Pós-Sessão e Reset Atômico (`Item K.3`)**.

---

## ITEM C — Roteiro do Teste Inicial de Cinco Segundos (Assimetria Real + Acessibilidade)

> **Natureza Estrita do Instrumento:** Mede **primeira impressão perceptual e reconhecimento imediato de elementos visíveis**, antes do Tutorial Guiado V2 e sem explicação prévia. **Não é medida de aprendizagem, e dificuldades iniciais aqui não provam falha pedagógica do algoritmo.**

### C.1. Procedimento Padrão (Para participantes sem restrição visual/temporal)
1. Com a tela inicial da **Prática Básica** aberta e sem nenhum clique realizado, dizer:
   > *"Olhe para esta tela por cerca de cinco segundos, sem clicar ainda."*
2. Contar silenciosamente ~5 segundos (`1001..1005`) e ocultar/desviar o foco da tela (ou manter sem clicar, registrando de forma consistente), formulando exatamente as três perguntas neutras sobre **o que estava visível**:
   - **Pergunta C1:** *"O que você acha que precisa fazer aqui?"*
   - **Pergunta C2:** *"Onde você olhou primeiro?"*
   - **Pergunta C3:** *"O que acredita que os botões visíveis fazem?"*
3. Registrar as respostas **literalmente** na Ficha `B`, marcando também qual estado inicial esteve efetivamente na tela (`C.2`).

### C.2. Diferença Real entre as Telas Exibidas (PROIBIDO Fingir Equivalência ou Cobrar Botões Ocultos)
- **No BUBBLE SORT (`BubbleGameScreenV2` — Abre com Previsão):**
  - **Visível nos 5s:** 4 caixas na esteira (as duas primeiras destacadas como `vizinho`), o card **`Previsão Antes de Agir`** (*"Antes de agir: depois de comparar X e Y, qual valor ficará mais à direita?"*) com os **dois botões numéricos `[ X ]` e `[ Y ]`**, o botão `← Práticas` e a barra recolhida `Aprofundamento técnico`.
  - **OCULTO nos 5s:** Os botões `[1] TROCAR`, `[2] MANTER` e `[ ? Dica ]` **NÃO estão na tela ainda**! Portanto, **jamais esperar, induzir ou cobrar que o participante mencione "botão Trocar/Manter" ou "Dica" em `C3` no Bubble Sort**. Avaliar `C3` estritamente em relação aos botões de previsão `[X]` e `[Y]` efetivamente exibidos, e **não tratar `C3` do Bubble como equivalente direto a `C3` de Selection/Insertion**.
- **No SELECTION SORT (`SelectionGameScreenV2` — Abre diretamente com Decisão de Busca):**
  - **Visível nos 5s:** 4 caixas (`PRÓXIMA POSIÇÃO` + `menor atual` na 1ª; `observando` na 2ª), pergunta *"O número X é menor que o menor atual, Y?"*, botão **`[ ? Dica ]`**, botões primários **`[1] Sim, é o novo menor`** / **`[2] Não, manter o menor`** e `Aprofundamento técnico` recolhido.
- **No INSERTION SORT (`InsertionGameScreenV2` — Abre diretamente com Decisão Chave/Vaga):**
  - **Visível nos 5s:** `TRILHO AÉREO • CHAVE SUSPENSA` com a `CHAVE` elevada, `ESTEIRA` com 1ª caixa `OBSERVANDO` e 2ª posição como `VAGA`, pergunta *"O número X precisa deslizar para abrir espaço para a chave Y?"*, botões **`[1] Deslizar para a Direita`** / **`[2] Encaixar a Chave`**, link **`? Precisa de ajuda? Ver Dica`** e `Aprofundamento técnico` recolhido.

### C.3. Adaptação Razoável de Acessibilidade (`Modo de Primeira Exploração Sem Limite de Tempo`)
Para participantes com baixa visão, deficiência visual/uso de leitor de tela, dislexia, TDAH/diferenças de velocidade de leitura ou desconforto explícito com testes rápidos cronometrados:
1. **Substituir a janela rígida de 5 segundos** por exploração inicial livre sem relógio (com zoom ampliado, `prefers-reduced-motion` ativo no SO ou navegação por teclado/`aria-label` sem acionar os botões de decisão):
   > *"Explore esta tela inicial no seu próprio ritmo, sem clicar ainda nos botões de resposta. Quando tiver reconhecido o que aparece na tela, me avise."*
2. Formular as mesmas perguntas neutras adaptadas à modalidade sensorial:
   - **C1:** *"O que você acha que precisa fazer aqui?"*
   - **C2 (neutra quanto à modalidade):** *"Qual parte ou informação chamou sua atenção primeiro?"*
   - **C3:** *"O que acredita que os botões disponíveis agora fazem?"*
3. **Registro e Regra Analítica:** Marcar a adaptação aplicada em `accessibility_adaptation` (`Ficha B` e CSV), analisar essas respostas separadamente das exposições visuais de 5s e **jamais classificar o tempo maior de exploração ou a modalidade de acesso como dificuldade cognitiva**.

---

## ITEM D — Roteiro de Think-Aloud (Durante a Prática Básica Real Pós-Tutorial)

### D.1. Instrução Padronizada (Ler ao abrir a Prática Básica real, logo após concluir o Tutorial Guiado V2)
> *"Agora você está na Prática Básica com quatro números sorteados. Enquanto utiliza a plataforma até concluir a ordenação, diga o que está observando e por que escolheu cada ação. Vá no seu ritmo: o tempo não tira pontos."*

### D.2. Prompts Neutros Permitidos (Apenas após silêncio > 15–20s enquanto o participante clica)
- *"O que você está observando neste passo?"*
- *"Por que você escolheu essa opção?"*
- *"O que essa mensagem na tela indicou para você?"* *(após erro ou checkpoint silencioso)*

### D.3. Condutas Estritamente Proibidas ao Moderador
- ❌ Explicar a regra algorítmica ou lembrar verbalmente o que foi visto no tutorial;
- ❌ Apontar para `menor atual`, `VAGA`, `CHAVE`, `[ ? Dica ]` ou `Aprofundamento técnico`;
- ❌ Perguntar *"Tem certeza?"* antes ou depois de um clique;
- ❌ Cronometrar com relógio manual o primeiro clique em Selection/Insertion para tentar compará-lo ao `timeToFirstActionMs` eletrônico do Bubble.

---

## ITEM E — Perguntas de Compreensão Pós-Tarefa e Fechamento Perceptivo

### E.1. Pergunta Obrigatória de Compreensão Verbal (Imediatamente após cada Prática Básica)
Transcrever **palavra por palavra** na Ficha `B` para codificação posterior na **Rubrica `0–3` (`Item F`)**:
1. **Após BUBBLE SORT:** *"Por que você trocou ou manteve aqueles dois números?"*
2. **Após SELECTION SORT:** *"Por que o algoritmo não movimenta as caixas enquanto procura o menor?"*
3. **Após INSERTION SORT:** *"Qual é a diferença entre deslizar um número e trocar dois números de lugar?"*

*(Única sondagem neutra permitida caso a resposta seja telegráfica, como "para ordenar" ou "porque era maior", sem explicar o mecanismo: **"Pode contar passo a passo o que foi comparado e o que aconteceu com as caixas na esteira por causa disso?"** — sem sugerir conceitos).*

### E.2. Fechamento Descritivo Pós-Transferência (`~3–4 min`)
1. **Escala Descritiva Curta `E1–E5` (`1` a `5` — puramente descritiva, não psicométrica):**
   - **`E1` Clareza visual das esteiras e caixas:** `1` (Muito confusa) a `5` (Muito limpa e clara)
   - **`E2` Facilidade de identificar onde focar a cada passo:** `1` (Desorientado) a `5` (Foco claro)
   - **`E3` Compreensão do papel dos botões de decisão:** `1` (Tive que chutar) a `5` (Decisão clara)
   - **`E4` Densidade de informação na tela:** `1` (Poluída/excessiva) a `5` (Equilibrada)
   - **`E5` Percepção das diferenças entre os 3 algoritmos:** `1` (Pareceram iguais) a `5` (Diferenças nítidas)
2. **Perguntas Abertas Finais Breves:**
   - **PF-1:** *"Houve algum momento, texto ou rótulo nos três módulos em que você ficou em dúvida sobre o que estava acontecendo?"*
   - **PF-2:** *"Como foi a transição entre o tutorial curto e a prática básica? Você sentiu falta ou usou 'Dica' / 'Aprofundamento técnico'?"*

---

## ITEM G — Folha de Aplicação da Tarefa de Transferência Comparativa (`[4, 1, 3, 2]`)

### G.1. Material Apresentado ao Participante (Cartão impresso em fonte grande $\ge 24\text{pt}$ + leitura em voz alta quando útil/acessível)

```text
┌───────────────────────────────────────────────────────────┐
│                                                           │
│              VETOR INICIAL:   [  4,   1,   3,   2  ]      │
│                                                           │
│              Posições:           1ª   2ª   3ª   4ª        │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### G.2. Enunciado Padronizado (Sem usar o computador; permitir repetir ou reler o vetor quantas vezes o participante pedir)
> *"Agora, fora do computador, considere este vetor inédito `[4, 1, 3, 2]` para ordenar em ordem crescente. Pensando em cada um dos três algoritmos que você acabou de praticar (**Bubble Sort**, **Selection Sort** e **Insertion Sort**), responda às mesmas três perguntas:"*
>
> 1. **"O que cada algoritmo compararia primeiro?"**
> 2. **"Qual seria sua primeira movimentação física?"**
> 3. **"Por que essa movimentação acontece naquele momento?"**

*(Se o participante disser apenas o vetor resultante `[1, 4, 3, 2]` ou `[1, 2, 3, 4]`, aplicar sondagem neutra obrigatória: **"Antes de chegar a esse resultado, quais números foram comparados antes do primeiro movimento e em que momento exato cada algoritmo mexeu nas caixas pela primeira vez?"**).*

### G.3. Folha de Registro da Transferência (1 em branco por participante real)
- **Código do Participante:** `P___` | **Categoria:** `[ ] A  [ ] B  [ ] C` | **Ordem Executada:** `O__` | **Adaptação Acessível?** `[ ] Não [ ] Sim: ______`

1. **BUBBLE SORT sobre `[4, 1, 3, 2]`:**
   - *1ª comparação:* `___________________________________________________________________________`
   - *1ª movimentação física:* `___________________________________________________________________`
   - *Por que acontece naquele momento?* `_________________________________________________________`
2. **SELECTION SORT sobre `[4, 1, 3, 2]`:**
   - *1ª comparação (e se inspeciona outros elementos antes de mover):* `____________________________`
   - *1ª movimentação física:* `___________________________________________________________________`
   - *Por que acontece naquele momento?* `_________________________________________________________`
3. **INSERTION SORT sobre `[4, 1, 3, 2]`:**
   - *O que suspende/compara primeiro:* `__________________________________________________________`
   - *1ª movimentação física:* `___________________________________________________________________`
   - *Por que acontece naquele momento?* `_________________________________________________________`
