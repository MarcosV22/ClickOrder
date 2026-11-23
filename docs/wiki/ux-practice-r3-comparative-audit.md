# Auditoria Comparativa das Três Práticas Básicas V2 (`UX-PRACTICE-R3`)

> **Documento Canônico:** Auditoria diagnóstica comparativa (visual, funcional e pedagógica) das Práticas Básicas V2 dos módulos **Bubble Sort**, **Selection Sort** e **Insertion Sort** e rastreabilidade de resolução pós-`UX-PRACTICE-R3.1`.  
> **Status:** Ativo / Defeitos Críticos e Vieses (`P-01` a `P-07`, `P-09`) Corrigidos em `UX-PRACTICE-R3.1`  
> **Data:** 23/11/2026 (Marcos `UX-PRACTICE-R3` e `UX-PRACTICE-R3.1`)  
> **Governança:** [`AGENTS.md`](../../AGENTS.md), [`ADR 0027`](../adr/0027-educational-and-ui-experience-redesign-v2.md), [`ux-redesign-v2.md`](./ux-redesign-v2.md), [`05-ux-design-system.md`](./05-ux-design-system.md) e [`12-pedagogy-and-academic-traceability.md`](./12-pedagogy-and-academic-traceability.md).

---

## 1. Escopo, Natureza Diagnóstica e Baseline Factual

Esta auditoria avalia comparativamente o estado factual das três Práticas Básicas V2 implementadas até o marco `UX-PRACTICE-R2.1`:
- **Bubble Sort:** `src/screens/bubble/BubbleGameScreenV2.tsx` (e `BubbleResultScreenV2.tsx`);
- **Selection Sort:** `src/screens/selection/SelectionGameScreenV2.tsx`, `SelectionConveyorTrack.tsx`, `SelectionDecisionControls.tsx`, `SelectionCommitCheckpoint.tsx` e `SelectionTechnicalDetails.tsx`;
- **Insertion Sort:** `src/screens/insertion/InsertionGameScreenV2.tsx`, `InsertionConveyorTrack.tsx`, `InsertionDecisionControls.tsx`, `InsertionTechnicalDetails.tsx` e `src/components/InsertionHoleSlot.tsx`.

Em conformidade com as diretrizes do marco `UX-PRACTICE-R3`, esta entrega é **estritamente diagnóstica**: nenhuma recomendação foi auto-implementada no código-fonte, preservando engines, FSMs, pontuação, Schema v4 e práticas intermediárias/avançadas intocados. Nenhum defeito encontrado impediu fisicamente a conclusão da prática ou corrompeu a integridade algorítmica das engines puras.

### Baseline Real Verificado
- **Vitest (`pnpm run test:run`):** `59` arquivos de teste aprovados, `731` testes verdes (`0` falhas);
- **TypeScript (`pnpm exec tsc --noEmit`):** `0` erros de compilação;
- **Build de Produção (`pnpm run build`):** aprovado (`dist/` gerado sem erros).

---

## 2. Tabela Comparativa das Três Práticas Básicas (Referência `1366×768`)

| CRITÉRIO | BUBBLE (`BubbleGameScreenV2`) | SELECTION (`SelectionGameScreenV2`) | INSERTION (`InsertionGameScreenV2`) | DIAGNÓSTICO |
| :--- | :--- | :--- | :--- | :--- |
| **Cabeçalho e Navegação** | `‹ Sair` (vai ao `PracticeSelector`); título centralizado `BUBBLE SORT / Prática Básica`; sem botão `Reiniciar`. | `← Práticas` (vai ao `PracticeSelector`); badge `Selection Sort • PRÁTICA BÁSICA`; exibe métricas ao vivo e `Reiniciar`. | `← Voltar ao Hub` (vai direto à `HomeScreen`, pulando `PracticeSelector`!); badge `INSERTION SORT • PRÁTICA BÁSICA` + `Reiniciar`. | **MÉDIO:** Rótulos e destinos de retorno divergentes; Insertion pula o seletor do módulo. |
| **Indicador de Progresso** | Pílula `Passo X de 6` no topo + texto `Passada X • Comparando vizinhos` na esteira. Sem barra gráfica. | Barra horizontal fina (`h-2`, gradiente roxo-ciano) + texto `Passada X de 3` na esteira. | Card dedicado `Passada 1 de 3` + barra âmbar (`%`) **repetindo** `Passada 1 de 3` logo abaixo no subheader da esteira. | **MÉDIO:** Duplicação vertical no Insertion consome ~`75px` preciosos da viewport. |
| **Métricas na Camada Primária** | Ausentes na decisão (apenas `N posições fixadas ✓`). | **Exibe `Comparações: X • Trocas: Y • Erros: Z` no header (`sm:flex`)** durante a decisão. | Ausentes na decisão (removidas em `R2.1`; restritas ao Nível 3 e conclusão). | **MÉDIO:** Selection viola a política V2 de zero placar operacional concorrente no Nível 1. |
| **Hierarquia Tipográfica** | Valores em `Orbitron` (`text-3xl/4xl`); pergunta em sans (`text-base/lg`); metadados em `Space Mono`. | Valores em `Orbitron`; pergunta `h3` (`text-lg/xl`) com sublinhados ciano/roxo; subtítulo auxiliar. | Valores em `Orbitron`; pergunta `h3` (`text-lg/xl`) com sublinhados ciano/âmbar; subtítulo auxiliar. | **BAIXO:** Boa legibilidade; Bubble usa pergunta ligeiramente menor (`text-base sm:text-lg`) que Selection/Insertion (`text-lg sm:text-xl`). |
| **Posicionamento da Esteira** | Card único central (`max-w-3xl`, `my-auto`), engloba esteira + decisão. Caixas em `top: 244–256px`. | Card dedicado (`max-w-4xl`), separado do card de decisão. Caixas niveladas em `top: 232px`. | Card duplo (`max-w-4xl`): Trilho Aéreo (`top: 261px`) + Esteira (`top: 466px`), empurrando a decisão para `top: 668px+`. | **CRÍTICO (Insertion):** Em `1366×768`, a altura acumulada joga os botões de decisão do Insertion para fora da tela (`top: 777px`). |
| **Tamanho e Alinhamento das Caixas** | `w-28 h-28` (`112×112px`). **Desalinhamento vertical de `12px`**: caixas com rótulo `vizinho`/`ordenado` sobem `12px` em relação às neutras. | `w-28 h-28` (`112×112px`). Alinhamento horizontal exato graças a espaçadores fixos (`h-5` topo, `h-6` base). | `w-28 h-28` (`112×112px`) tanto na `CHAVE` quanto na esteira e `InsertionHoleSlot`. Alinhadas na base (`h-5`), mas ocupam 2 andares verticais. | **BAIXO (Bubble) / ALTO (Insertion):** Bubble tem salto de baseline de `12px`; Insertion precisa de compactação vertical em `lg`/`md` para caber em `768px`. |
| **Indicadores de Foco e Papéis** | Borda/anel azul (`role="pair"`) + texto inferior `vizinho` nas duas caixas comparadas. | Chip superior `próxima posição` ($i$); anel ciano + chip `observando` ($j$); chip roxo `menor atual` (`minIndex`, mas caixa fica com borda cinza neutra!). | Caixa âmbar no trilho com `CHAVE`; slot tracejado âmbar `VAGA`; caixa $j$ com borda ciano + chip `OBSERVANDO`; índices `#1..#4` visíveis. | **BAIXO/MÉDIO:** Em Selection, `variant="learning"` não estiliza a borda de `role="min"`/`"target"`; em Insertion, `#1..#4` é desnecessário no nível básico. |
| **Texto da Pergunta Principal** | *"Essas duas caixas estão na ordem certa? [80] e [71]"* | *"O número 74 é menor que o menor atual, 68?"* | *"O número 58 precisa deslizar para abrir espaço para a chave 25?"* (e pergunta dedicada em `INSERT_READY`). | **MÉDIO (Bubble):** Pergunta binária Sim/Não acoplada a botões de verbo (`[1] TROCAR` = Não, `[2] MANTER` = Sim) gera inversão semântica. |
| **Botões de Decisão** | **Assimétricos:** `[⇄ TROCAR]` em azul primário vibrante (`bg-blue-600 shadow-lg`) vs `[= MANTER]` em cinza neutro (`bg-slate-800`). | **Simétricos e neutros:** `[1] Sim, é o novo menor` e `[2] Não, manter o menor` ambos em `bg-slate-800/90`. No commit: botão único gradiente. | **Simétricos e neutros:** `[1] Deslizar para a direita` e `[2] Encaixar a chave na vaga` ambos em `bg-slate-800/90`. Em `INSERT_READY`: botão único âmbar. | **ALTO (Bubble):** Assimetria cromática forte induz viés visual pró-`TROCAR`, violando a regra de paridade de ação. |
| **Feedback de Erro e Acerto** | Banner causal abaixo dos botões (verde no acerto, âmbar no erro). Sem banner inicial de boas-vindas. | Banner causal com selo `[✓]`/`[!]`/`[i]` abaixo dos botões. Inicia com banner informativo azul. | Banner causal com ícone `✓`/`!`/`i` abaixo dos botões (**fora da dobra inicial em `1366×768`!**). | **ALTO (Insertion):** Em `1366×768`, errar pelo teclado (`1`/`2`) ou sem rolar exibe o banner de erro abaixo de `768px`, invisível sem scroll. |
| **Dicas (Nível 2)** | Botão `? Dica` acima da pergunta. **Entrega literalmente a resposta:** *"A ação correta é TROCAR."* | Botão `? Dica` abaixo do feedback. Dica reflexiva sem spoiler, mas **abre cortada abaixo de `768px`** em `1366×768`. | Link `? Precisa de ajuda? Ver Dica` na base (`top: 942px`, fora da tela em `1366×768`). Texto reflexivo adequado sem spoiler. | **ALTO (Bubble) / MÉDIO (Selection/Insertion):** Dica do Bubble entrega o gabarito mecânico; dicas de Selection/Insertion sofrem corte vertical em `768px`. |
| **Checkpoints Apresentacionais** | 2 na Prática Básica: Previsão inicial + Pós-Passada 1. **Bug crítico:** `.slice(0, 3)` omite a resposta correta se o máximo estiver no índice $\ge 3$! | 1 na Prática Básica (Pré-Commit da Passada 1): **Spoiler direto no título acima (`(minVal)`)** + opção correta sempre na 1ª posição esquerda (`.sort`) + vaza `INSPECT`/`COMMIT`. | **0 na Prática Básica** (checkpoints existem apenas no `InsertionTutorialScreenV2`, ausentes em `InsertionGameScreenV2`). | **CRÍTICO (Bubble) / ALTO (Selection) / BAIXO (Insertion):** Problemas graves nos checkpoints de Bubble e Selection; assimetria curricular no Insertion. |
| **Detalhes Técnicos (Nível 3)** | Botão customizado `"▼ Ver detalhes sob demanda"`: mostra `i, j, n` e 1 linha formal (sem pseudocódigo de 9 linhas); liga `showIndex` nas caixas. | `<details>` nativo com estado da FSM + pseudocódigo sincronizado (5 linhas resumidas, não as 13 de `SELECTION_SORT_PSEUDOCODE`); não liga `showIndex`. | `<details>` nativo com estado completo da FSM + métricas + pseudocódigo canônico de 11 linhas sincronizado. | **BAIXO/MÉDIO:** Três implementações distintas de Nível 3; Selection usa resumo de 5 linhas em vez das 13 canônicas e Bubble omite o bloco de pseudocódigo. |
| **Scroll, Espaços Vazios e Bordas** | `scrollHeight = 768px` em `1366×768` (cabe 100% na tela!), mas possui **2 containers `overflow-y: auto` aninhados** (`App.tsx` + `BubbleGameScreenV2`). | `scrollHeight = 863px` em `1366×768` (botões cabem em `551–605px`; apenas dica/Nível 3 ficam abaixo). Único scroll owner (`App.tsx`). | `scrollHeight = 1089px` em `1366×768` (`321px` além da altura da janela!). Botões, feedback, dica e Nível 3 fora do primeiro viewport. | **CRÍTICO (Insertion) / MÉDIO (Bubble):** Insertion exige scroll constante em telas `768px`; Bubble viola a regra de dono único do scroll vertical. |
| **Fluxo de Conclusão** | Transição direta e imediata para `BubbleResultScreenV2` (tela V2 limpa com micro-reflexão). | Exibe card intermediário na própria tela e, ao clicar em `Concluir Prática ➔`, abre `ResultScreen.tsx` **legada** (com scanlines, score e pseudocódigo estático). | Exibe card intermediário na própria tela (`top > 700px`) e, ao clicar, abre `ResultScreen.tsx` **legada** (duplo resumo consecutivo). | **MÉDIO:** Forte assimetria pós-prática entre Bubble (fluxo único V2) e Selection/Insertion (card V2 + `ResultScreen` legada). |

---

## 3. Verificação dos Modelos Mentais Algorítmicos

A inspeção do código e das telas renderizadas confirma que **os três módulos preservam mecânicas interativas genuinamente distintas e não homogeneizadas**:

1. **Bubble Sort (`COMPARE ➔ DECIDA ➔ AVANCE`):**
   - Foco estrito em pares adjacentes (`leftIndex`, `rightIndex`) com permuta local imediata (`SWAP` vs `KEEP`) e consolidação progressiva da extremidade direita (`sortedIndices`).
2. **Selection Sort (`PROCURE ➔ LEMBRE O MENOR ➔ POSICIONE`):**
   - Separação bimodal fiel entre varredura estática (`INSPECT`: nenhuma caixa se move na esteira, atualizando apenas `menor atual` vs `observando`) e posicionamento final (`COMMIT`: no máximo uma troca física por passada para a `próxima posição`). Não há menção indevida a "vaga".
3. **Insertion Sort (`PEGUE ➔ ABRA ESPAÇO ➔ ENCAIXE`):**
   - Elevação explícita da `CHAVE` em trilho aéreo superior, abertura de `VAGA` física transitória (`InsertionHoleSlot`), deslocamento unilateral para a direita (`SHIFT_RIGHT` sem tocar na chave suspensa) e descida vertical da chave (`INSERT_KEY`), respeitando `DESLOCAMENTO ≠ TROCA` e `ORD LOCAL ≠ OK DEFINITIVO`.

---

## 4. Teste de Clareza Cognitiva e Duplicações Visuais

| Pergunta de Clareza | Bubble Sort | Selection Sort | Insertion Sort |
| :--- | :--- | :--- | :--- |
| **1. Par ou elemento relevante é imediato?** | **Sim:** molduras azuis + `vizinho` destacam o par adjacente. | **Parcial:** o elemento `observando` tem anel ciano nítido, mas a caixa `menor atual` tem borda cinza idêntica às caixas inativas (diferenciada apenas pelo pequeno chip roxo inferior). | **Sim:** `CHAVE` âmbar suspensa, `VAGA` tracejada e `OBSERVANDO` com anel ciano formam tríade espacial inequívoca. |
| **2. Estado necessário para decidir está visível sem scroll (`1366×768`)?** | **Sim** (`100%` acima de `768px`). | **Sim** (esteira + pergunta + botões até `605px`). | **Não:** a esteira e a pergunta aparecem, mas **os botões de ação começam em `777px`** (fora da tela em `1366×768` e `1280×650`). |
| **3. Duplicações visuais residuais?** | Baixa (apenas repetição dos valores na frase `[80] e [71]`, útil como reforço). | Baixa na esteira; porém cabeçalho duplica métricas já existentes no Nível 3. | **Moderada:** (a) card `Passada 1 de 3` repete `Passada 1 de 3` do subheader da esteira; (b) subheader `Vaga física aberta: posição #2` repete visualmente o slot `VAGA` `#2`. |

---

## 5. Auditoria de Riscos de Clique Mecânico

Foram identificados **quatro vetores concretos de indução ao clique mecânico** (onde o estudante pode acertar ou avançar sem processar a relação algorítmica):

1. **Dica que entrega literalmente a resposta mecânica no Bubble Sort (`ALTO`):**
   - Em `BubbleGameScreenV2.tsx:351-355`, clicar em `? Dica` exibe:
     > *"Dica pedagógica: Compare 80 e 71. A ação correta é TROCAR."*
   - O estudante pode concluir toda a prática clicando em `? Dica` e apertando o botão nomeado, perdendo apenas `5` pontos por dica sem realizar nenhuma comparação mental.
2. **Spoiler textual direto + Posição constante no Checkpoint Pré-Commit do Selection Sort (`ALTO`):**
   - Em `SelectionCommitCheckpoint.tsx:71`, o título principal acima do checkpoint exibe em fonte grande:
     > *"Transferir o menor encontrado (**6**) para a primeira posição"*
     enquanto o card logo abaixo pergunta: *"Qual número deve ir para a primeira posição?"*.
   - Adicionalmente, em `SelectionCommitCheckpoint.tsx:39-41`, as opções são ordenadas em ordem crescente (`.sort((a, b) => a - b)`). Assim, **o menor valor é invariavelmente o primeiro botão à esquerda (`100%` das vezes)**.
3. **Viés cromático assimétrico no botão `⇄ TROCAR` do Bubble Sort (`ALTO`):**
   - Em `BubbleGameScreenV2.tsx:604 vs 617`, `⇄ TROCAR` usa `bg-blue-600 shadow-lg shadow-blue-600/20` (aparência de CTA primário recomendado), enquanto `= MANTER` usa `bg-slate-800 border-slate-700` (aparência de ação secundária/desabilitada), induzindo cliques impulsivos em `TROCAR` mesmo quando o par já está ordenado.
4. **Transição automática previsível em `COMMIT` (Selection) e `INSERT_READY` (Insertion) (`BAIXO — Inerente à FSM, mas requer atenção formativa`):**
   - Ao atingir o fim da varredura (`COMMIT` nas passadas $i \ge 1$ sem checkpoint) ou a cabeceira da esteira (`INSERT_READY`, $j < 0$), resta apenas um botão único de confirmação. Isso é fiel à determinicidade do algoritmo, mas em testes com usuários deve-se observar se o estudante compreende *por que* a busca parou ali.

---

## 6. Auditoria de Feedback Causal, Dicas, Score e Checkpoints

| Contrato Auditado | Bubble Sort | Selection Sort | Insertion Sort | Conformidade |
| :--- | :--- | :--- | :--- | :--- |
| **Erro incrementa `+1 errors` sem avançar estado** | Sim (`executeUserStep` retorna `valid: false`, estado posicional intacto, `errors + 1`). | Sim (`executeSelectionInspection` mantém `i, j, minIndex`, `errors + 1`). | Sim (`executeInsertionStep` mantém `i, j, holeIndex, key`, `errors + 1`). | **100% Conforme** |
| **Explicação causal no erro e no acerto** | Sim: cita valores concretos comparados e a regra de ordem crescente. | Sim: cita `scanVal` e `minVal` e reforça que nenhuma caixa se move na busca. | Sim: cita elemento observado e `key`, explicando abertura de espaço vs pouso na vaga. | **100% Conforme** |
| **Contabilização de `hintsUsed` e Score** | Incrementa `+1` a cada clique em `? Dica`; aplica `calculateProtocolScore`. | Incrementa `+1` ao expandir dica (`!showHint`). Reset local zera `hintsUsed`. | Incrementa `+1` ao expandir dica (`!showHint`). **Defeito MÉDIO:** `handleReset` (`InsertionGameScreenV2.tsx:164`) **não zera `hintsUsed` nem `hintsUsedRef.current`**, penalizando a tentativa reiniciada! | **Parcial (Bug de Reset no Insertion)** |
| **Isolamento de Checkpoints Apresentacionais** | Isolados da engine/score/Schema v4. **Defeito CRÍTICO:** `.slice(0, 3)` em `BubbleGameScreenV2.tsx:533-535` exclui `maxInitialVal` das opções quando o maior valor inicia no índice $\ge 3$ (ex.: `[30, 20, 10, 50]`), tornando impossível acertar a pergunta! | Isolado da engine/score/Schema v4 (porém com spoiler visual no cabeçalho acima e ordenação fixa das alternativas). | Não há checkpoints apresentacionais na Prática Básica (presentes apenas no Tutorial V2, onde são isolados da engine). | **Falha Crítica no Checkpoint Pós-Passada do Bubble** |

---

## 7. Auditoria de Semântica Visual (`OK` vs `ORD Local`)

- **Bubble Sort:** Os elementos no sufixo consolidado após cada passada completa recebem `role="sorted"` (verde esmeralda) e rótulo inferior `ordenado`. Matematicamente exato, pois no Bubble Sort o maior elemento de cada passada atinge sua posição final definitiva. *(Nota menor: em `NumberedBox` com `variant="learning"`, `badge` é suprimido quando `undefined`, portanto não há colisão entre badge interno `OK` e rótulo externo `ordenado`).*
- **Selection Sort:** Os elementos no prefixo $[0 \dots i-1]$ consolidados após `COMMIT` recebem `role="sorted"` (borda e fundo esmeralda suaves, sem chip redundante, acompanhados de `N posições ordenadas ✓` no subheader). Matematicamente exato.
- **Insertion Sort:** Rigorosamente alinhado ao marco `UX-PRACTICE-R2.1`: durante toda a ordenação ativa (`!gameState.completed`), **nenhuma caixa recebe cor verde/esmeralda, `ORD` ou `OK`** (`ORD LOCAL ≠ OK DEFINITIVO`). A `VAGA` permanece em âmbar tracejado. Somente quando `gameState.completed === true`, todas as caixas recebem `role="sorted"` com selo `OK`. **Zero uso inconsistente da cor verde de conclusão.**

---

## 8. Auditoria de Informação Técnica na Camada Principal e Análise de `#pos`

1. **Vazamentos Técnicos Encontrados no Nível 1:**
   - **Selection Sort (`SelectionCommitCheckpoint.tsx:119`):** Exibe termos internos da FSM em destaque monoespaçado na camada primária: *"Durante o `INSPECT` nenhuma caixa foi movida. Agora no `COMMIT`, o menor elemento..."*. Deve usar linguagem natural (*"Durante a varredura..."* / *"Agora no posicionamento..."*).
   - **Selection Sort (`SelectionGameScreenV2.tsx:228-238`):** Exibe contadores operacionais (`Comparações`, `Trocas`, `Erros`) no cabeçalho principal.
   - **Bubble Sort e Insertion Sort:** Livres de nomes de estados da FSM, complexidade assintótica ($\Theta$) e pseudocódigo permanente na camada primária.

2. **Inspeção Específica: A indicação `#pos` (`#1, #2, #3, #4`) no Insertion Sort é necessária para o aluno básico?**
   - **Diagnóstico: NÃO é necessária na visualização primária da Prática Básica e deve ser ocultada por padrão (ou vinculada à abertura do Nível 3, como no Bubble Sort).**
   - **Justificativa Pedagógica e Visual:**
     1. Para decidir entre *"Deslizar para a direita"* e *"Encaixar a chave na vaga"*, o estudante precisa apenas comparar o valor numérico da caixa `OBSERVANDO` com o valor da `CHAVE` suspensa e perceber a adjacência espacial da `VAGA` tracejada. O número ordinal da coluna (`#1..#4`) é irrelevante para a regra $A[j] > \text{chave}$;
     2. Quebra a padronização estabelecida em `05-ux-design-system.md` (§11.9), seguida por Bubble e Selection (`showIndex={false}` na Prática Básica);
     3. Gera conflito de base numérica quando o estudante abre a gaveta de Nível 3 (`InsertionTechnicalDetails.tsx`), onde os índices formais `i` e `j` são **base-0** (`0..3`, `j = -1`), enquanto os rótulos `#1..#4` na esteira e no feedback (`vaga #2`) são **base-1**;
     4. Remover a linha `#1..#4` e o texto redundante `Vaga física aberta: posição #2` economiza altura vertical e reduz ruído perceptual. *(Ressalva de acessibilidade: nas descrições invisíveis `aria-label` e `.sr-only` para leitores de tela, a menção à posição numérica continua recomendada por substituir a percepção espacial visual).*

---

## 9. Auditoria de Responsividade Multi-Viewport (`1280×650`, `1366×768`, `1600×900`, `1920×1080`)

Medições reais extraídas via **Chrome Headless (DevTools Protocol)** sobre o build de produção:

| Viewport | Módulo | `docScrollWidth` (Overflow X?) | Altura Total do Conteúdo (`scrollHeight`) | Esteira + Pergunta + Botões Visíveis Sem Scroll? | Problemas Reais Detectados no Viewport |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **`1280×650`** | **Bubble** | `1280px` (Não) | `669px` (inner) / `650px` (outer) | **Sim** (botões em `481–564px`; dica em `395–421px`). | **Duplo container `overflow-y: auto`** (`App.tsx` + `BubbleGameScreenV2`); `19px` de overflow no container interno. |
| **`1280×650`** | **Selection** | `1280px` (Não) | `863px` | **Sim para botões** (`551–605px`), **Não para Dica** (`706–732px`) e Feedback. | Banner de feedback fica no limite inferior (`620–675px`) e botão `? Dica` fica fora da dobra inicial. |
| **`1280×650`** | **Insertion** | `1280px` (Não) | `1089px` | **NÃO** (esteira vai até `644px`; pergunta e botões `777–831px` totalmente fora!). | Em `1280×650`, o aluno vê **apenas a esteira**; nem a pergunta nem os botões aparecem sem rolar `~220px`. |
| **`1366×768`** | **Bubble** | `1366px` (Não) | `768px` | **Sim (`100%` na tela)** — botões em `531–613px`, gaveta em `670–694px`. | Nenhum corte; excelente aproveitamento vertical. Mantém porém 2 containers `overflow-y: auto` potenciais se a gaveta abrir. |
| **`1366×768`** | **Selection** | `1366px` (Não) | `863px` | **Sim** — botões em `551–605px` e `? Dica` em `706–732px`. | Ao clicar em `? Dica`, o card explicativo expandido abre abaixo de `745px` e **fica cortado na borda inferior** sem auto-scroll. |
| **`1366×768`** | **Insertion** | `1366px` (Não) | `1089px` | **NÃO** — pergunta aparece na base (`695–755px`), mas **botões (`777–831px`), feedback (`847px+`) e dica (`942px`) ficam 100% fora da dobra!** | **Problema Crítico de Ergonomia:** na resolução canônica de notebooks escolares (`1366×768`), toda decisão visual exige scroll vertical ou uso de atalhos `1`/`2` às cegas (sem ver o banner de feedback/erro). |
| **`1600×900`** | **Bubble** | `1600px` (Não) | `900px` | **Sim (`100%` na tela)**. | Sem cortes. Bom equilíbrio de respiro (`my-auto`). |
| **`1600×900`** | **Selection** | `1600px` (Não) | `900px` | **Sim (`100%` na tela, incluindo Nível 3 fechado)**. | Sem cortes. |
| **`1600×900`** | **Insertion** | `1600px` (Não) | `1089px` | **Sim para botões** (`777–831px`), **Não para Dica** (`942–958px`). | Mesmo em `900px` de altura, o botão de dica e o card de conclusão ficam parcialmente abaixo da dobra. |
| **`1920×1080`** | **Bubble** | `1920px` (Não) | `1080px` | **Sim (`100%` na tela)**. | Centralizado verticalmente via `my-auto`. |
| **`1920×1080`** | **Selection** | `1920px` (Não) | `1080px` | **Sim (`100%` na tela)**. | Alinhado ao topo (`p-8`), espaço vazio inferior natural abaixo do Nível 3. |
| **`1920×1080`** | **Insertion** | `1920px` (Não) | `1089px` | **Sim** (botões `777–831px`, dica `942–958px`). | Leve scroll residual de `9px` apenas para a margem final da gaveta de Nível 3. |

---

## 10. Evidências Visuais Capturadas e Inspecionadas

Utilizando **Google Chrome Headless via CDP** sobre o build real da aplicação, foram geradas e **efetivamente inspecionadas** capturas PNG cobrindo todos os estados exigidos (`A` primeira decisão, `B` decisão correta, `C` erro, `D` uso de dica, `E` checkpoints / `INSERT_READY`, `F` conclusão) além das viewports críticas `1280×650` e `1366×768`:
- **Bubble Sort:** `bubble_E1_prediction.png`, `bubble_A_first_decision.png`, `bubble_D_hint.png`, `bubble_C_error.png`, `bubble_B_correct.png`, `bubble_E2_pass_checkpoint.png`, `bubble_F_completion.png`, `bubble_1280x650.png`;
- **Selection Sort:** `selection_A_first_decision.png`, `selection_D_hint.png`, `selection_C_error.png`, `selection_B_correct.png`, `selection_E1_commit_checkpoint_before.png`, `selection_E2_commit_after_checkpoint.png`, `selection_F_completion.png`, `selection_1280x650.png`;
- **Insertion Sort:** `insertion_A_first_decision.png`, `insertion_D_hint.png`, `insertion_C_error.png`, `insertion_B_correct.png`, `insertion_E_insert_ready.png`, `insertion_F_completion.png`, `insertion_1280x650.png` + capturas de página estendida (`insertion_tall_A_decision.png`, `insertion_tall_D_hint.png`, `insertion_tall_C_error.png`, `insertion_tall_F_completion.png`) para inspeção direta dos controles situados abaixo de `768px`.

---

## 11. Distinção Epistemológica sobre Aprendizagem (Níveis A, B e C)

Em estrita observância a [`12-pedagogy-and-academic-traceability.md`](./12-pedagogy-and-academic-traceability.md), esta auditoria separa rigorosamente três dimensões distintas:

- **Dimensão A — O código permite executar corretamente o algoritmo? (`AUDITADO E CONFIRMADO TECNICAMENTE`)**
  - **Sim.** As três engines puras (`bubbleSortEngine.ts`, `selectionSortEngine.ts`, `insertionSortEngine.ts`), as transições de FSM, o bloqueio de avanço em caso de erro, a contagem de métricas, o cálculo de `protocolScore` (exceto pelo reset local de dicas no Insertion) e a gravação no Schema v4 funcionam de forma determinística e comprovada por `731` testes automatizados.
- **Dimensão B — A interface torna o estado compreensível e livre de induções espúrias? (`PARCIALMENTE CONFIRMADO — COM PENDÊNCIAS DE HARDENING IDENTIFICADAS`)**
  - A gramática visual da esteira distingue claramente os três modelos mentais e respeita `ORD LOCAL ≠ OK DEFINITIVO`. Contudo, a auditoria revelou falhas concretas na Dimensão B que **precisam ser corrigidas antes de testes somativos**: corte vertical dos botões/feedbacks do Insertion em `1366×768`, bug `.slice(0, 3)` omitindo a resposta certa no checkpoint do Bubble, dica do Bubble entregando a ação correta, spoiler no título do checkpoint do Selection e assimetria cromática nos botões do Bubble.
- **Dimensão C — O estudante real demonstra compreensão conceitual? (`NÃO AUDITÁVEL POR CÓDIGO — EXIGE VALIDAÇÃO EMPÍRICA COM USUÁRIOS`)**
  - Passar em testes Vitest ou possuir layout limpo **não comprova aprendizagem humana**. Saber se estudantes reais constroem o modelo mental de flutuação adjacente (Bubble), varredura sem troca seguida de commit (Selection) e deslocamento unilateral em vaga física sem confundir com troca (Insertion) depende exclusivamente da execução do protocolo formativo presencial (`UX-REDESIGN-R3-B` expandido para os 3 módulos) com participantes humanos reais.

---

## 12. Matriz de Status de Resolução Pós-`UX-PRACTICE-R3.1` (`CORRIGIDO` / `PARCIAL` / `PENDENTE`)

| ID | Severidade | Módulo(s) | Status Atual | Problema Diagnosticado em `R3` | Resolução Verificada em `UX-PRACTICE-R3.1` / Pendência |
| :---: | :---: | :---: | :---: | :--- | :--- |
| **P-01** | **CRÍTICO** | **Bubble** | **`CORRIGIDO`** | `BubbleGameScreenV2.tsx`: `.slice(0, 3)` excluía `maxInitialVal` das alternativas quando o máximo iniciava no índice $\ge 3$ (ex.: `[30, 20, 10, 50]`). | Implementada `buildBubblePassCheckpointOptions`: inclui sempre `maxInitialVal`, sem duplicatas, sem ordenação crescente automática e com posição determinística variada (`0, 1, 2`). Testado em início/meio/fim/duplicatas e 30 sementes procedurais. |
| **P-02** | **CRÍTICO** | **Insertion** | **`CORRIGIDO`** | Em `1366×768` e `1280×650`, `scrollHeight = 1089px` deixava botões (`top: 777px`), feedback e dica fora da dobra inicial. | Eliminado card duplicado de passada, compactados paddings/gaps e aplicado dimensionamento responsivo à altura real (`size="md"` `80×80px` para `innerHeight < 860`, preservando `lg` `112×112px` em `1600×900` e `1920×1080`). Em `1366×768`: `scrollHeight = 768px` (zero scroll), botões em `top: 532–586px` (`100%` visíveis, inclusive em `1280×650`!). |
| **P-03** | **ALTO** | **Bubble** | **`CORRIGIDO`** | Dica entregava literalmente o botão (*"A ação correta é TROCAR"*). | Substituída por orientação reflexiva (*"Compare X e Y. Para ficar em ordem crescente, o menor valor deve estar à esquerda e o maior à direita."*), preservando `hintsUsed` e penalidade de `5` pontos. |
| **P-04** | **ALTO** | **Selection** | **`CORRIGIDO`** | `SelectionCommitCheckpoint.tsx` revelava `({minVal})` no título acima do checkpoint e usava `.sort((a,b)=>a-b)` fixando a resposta no 1º botão. | Título oculta `minVal` enquanto `showCheckpoint === true` (*"Qual número deve ir para a primeira/próxima posição?"*); `buildSelectionCheckpointOptions` preserva ordem não ordenada da esteira e rotaciona fatias já crescentes. |
| **P-05** | **ALTO** | **Bubble** | **`CORRIGIDO`** | Botão `⇄ TROCAR` tinha destaque azul vibrante contra `= MANTER` cinza, e pergunta Sim/Não invertia a ordem `[1] TROCAR / [2] MANTER`. | Botoeira padronizada no modelo neutro simétrico (`[1] TROCAR` / `[2] MANTER` em `bg-slate-800/90`, idênticos em altura, peso e borda), pergunta ajustada para *"O que devemos fazer com esses dois números vizinhos?"* e feedback explícito para estabilidade em duplicatas. |
| **P-06** | **MÉDIO** | **Selection** | **`CORRIGIDO`** | Vazamento de `INSPECT` / `COMMIT` no Nível 1 e métricas ao vivo no header. | Removidos `Comparações / Trocas / Erros` do header primário (mantidos em `<details>` Nível 3 e tela final) e substituídos `INSPECT`/`COMMIT` por `BUSCA` e `POSICIONAMENTO` no Nível 1. |
| **P-07** | **MÉDIO** | **Insertion** | **`CORRIGIDO`** | `handleReset` não zerava `hintsUsed`, `hintsUsedRef.current`, `startTimeRef` nem flags transitórias. | `handleReset` agora cancela timeouts pendentes e reinicia `hintsUsed(0)`, `hintsUsedRef.current = 0`, `startTimeRef`, `completedCalledRef`, `isActionLockedRef`, `showHint(false)` e `feedback(null)` sem tocar no progresso salvo. |
| **P-08** | **MÉDIO** | **Todos (`App.tsx`)** | **`PENDENTE`** | (a) Insertion retorna ao Hub em vez de `PracticeSelector`; (b) `BubbleGameScreenV2` intercepta também as fases Intermediária e Avançada (`App.tsx:1460`), anulando o *Scaffolding Fading* das fases 2/3; (c) duplo resumo final em Selection/Insertion. | Fora do escopo de `UX-PRACTICE-R3.1` (sem refatoração ampla de `App.tsx` ou Result/Replay). **A divergência de Scaffolding Fading no Bubble deverá ser obrigatoriamente sanada antes de expandir a avaliação para Intermediária/Avançada.** |
| **P-09** | **MÉDIO** | **Insertion** | **`CORRIGIDO`** | Exibição permanente de `#1..#4` na camada básica. | Ocultos por padrão (`showIndex={showTechnicalDetails}`, `false` inicial), preservados em `aria-label` e `.sr-only` para leitores de tela, e revelados sob demanda ao expandir o `<details>` de Nível 3. |
| **P-10** | **BAIXO** | **Bubble / Selection** | **`PARCIAL`** | (a) Salto de `12px` nas caixas do Bubble + duplo `overflow-y: auto`; (b) borda neutra em `min`/`target` no Selection; (c) corte da dica expandida em Selection `1366×768`; (d) assimetria de pseudocódigo nas gavetas Nível 3. | **Corrigidos (a) e (b):** baseline nivelado com `h-5` (`top: 254px` uniforme) e remoção do `overflow-y: auto` duplicado no Bubble; bordas roxa (`min`) e âmbar (`target`) adicionadas em `NumberedBox` (`variant="learning"`). **Pendentes (c) e (d):** reposicionamento da dica expandida no Selection e unificação dos blocos de pseudocódigo do Nível 3. |

### 12.1. Medições Reais de DOM Pós-`UX-PRACTICE-R3.1` (Chrome Headless CDP)

| Viewport | Módulo | `scrollHeight` Pós-`R3.1` | Coordenadas Reais dos Botões de Decisão | Ambos os Botões Visíveis Sem Scroll? |
| :---: | :--- | :---: | :---: | :---: |
| **`1366×768`** | **Bubble** | `768px` (dono único de scroll; todas as 4 caixas em `top: 254–366px`) | `top: 550px`, `bottom: 604px` (`280×54px`) | **Sim (`100%`)** |
| **`1366×768`** | **Selection** | `863px` (sem métricas no header; `min`/`target` diferenciados) | `top: 551px`, `bottom: 605px` (`280×54px`) | **Sim (`100%`)** |
| **`1366×768`** | **Insertion** | **`768px`** (reduzido de `1089px` $\rightarrow$ `768px`, **zero scroll**!) | **`top: 532px`, `bottom: 586px`** (`280×54px`; Dica em `598–614px`) | **Sim (`100%`, incluindo erro e dica!)** |
| **`1280×650`** | **Insertion** | **`711px`** (reduzido de `1089px` $\rightarrow$ `711px`) | **`top: 532px`, `bottom: 586px`** (`CHAVE` `155–235px`, `VAGA` `285–389px`, Pergunta `473–502px`) | **Sim (`100%` acima de `650px`!)** |
| **`1600×900` / `1920×1080`** | **Insertion** | `900px` / `1080px` (caixas `lg` `112×112px` preservadas em telas altas) | `top: 596px`, `bottom: 650px` | **Sim (`100%`)** |

---

## 13. Limitações Metodológicas desta Auditoria

1. **Ausência de Participantes Humanos Reais nesta Etapa:** Todas as conclusões sobre carga visual, clareza e risco de clique mecânico decorrem de inspeção heurística especializada, análise estática de código/DOM e renderização automatizada em navegador headless. Elas **não substituem** nem antecipam os achados da observação com estudantes e docentes.
2. **Renderização Estática vs. Percepção Dinâmica de Movimento:** As capturas PNG comprovam layout, contraste, alinhamento e cortes de viewport, mas a fluidez subjetiva das animações de `350ms–500ms` (*swap*, *commit* e *shift*) sob uso real contínuo deve ser avaliada presencialmente (inclusive em máquinas escolares de menor desempenho).
3. **Amostra Determinística de Sementes nas Capturas:** As capturas em navegador headless refletem sementes procedurais reais geradas em sessão limpa, enquanto casos de borda específicos (como `maxInitialVal` no índice `3` do Bubble Sort) foram comprovados analiticamente sobre os predicados formais de `constraints.ts`.

---

## 14. Roteiro Sugerido para Avaliação Formativa Comparativa dos 3 Módulos

> **Recomendação Prévia:** Executar primeiro um micro-hardening pontual (`UX-PRACTICE-R3.1`) corrigindo ao menos **P-01 a P-05** antes de ir a campo, para não desperdiçar sessões com usuários em defeitos já conhecidos (como botão fora da tela em `1366×768` no Insertion ou alternativa correta ausente no checkpoint do Bubble).

### 14.1. Desenho da Sessão (`30–40 min` por participante, `6 a 12` participantes — Categorias A, B e C)
1. **Ordem Contra-Balanceada (Latin Square):** Alternar a ordem dos 3 módulos entre os participantes (ou manter a trilha pedagógica natural `Bubble ➔ Selection ➔ Insertion` em metade da amostra e alternar Selection/Insertion na outra metade) para distinguir fadiga/aprendizado da ferramenta de dificuldades intrínsecas de cada algoritmo.
2. **Resolução Padronizada de Laboratório:** Conduzir ao menos metade das sessões em janela `1366×768` (com barra do navegador visível, área útil ~`1366×650–700`) para validar ergonomia real de notebooks estudantis.
3. **Protocolo por Módulo (Think-Aloud sem intervenção prévia):**
   - **Etapa 1 (Overview — Regra dos 5s):** *"O que este algoritmo faz de diferente?"*
   - **Etapa 2 (Tutorial + Prática Básica V2):** Observar tempo até a 1ª decisão, se o olhar alterna entre esteira e pergunta, reação ao primeiro erro voluntário/involuntário e uso espontâneo de dica.
   - **Etapa 3 (Pergunta Oral de Transferência Pós-Módulo — Sem olhar para o código):**
     - *Pós-Bubble:* *"Se houvesse 10 caixas, quem estaria garantidamente no lugar certo após a 1ª passada?"*
     - *Pós-Selection:* *"Por que as caixas não mudaram de lugar enquanto você respondia Sim/Não durante a busca?"*
     - *Pós-Insertion:* *"Quando um número deslizou para a direita, ele trocou de lugar com a chave? Os números à esquerda da vaga já estavam em suas posições finais definitivas até o fim do exercício?"*
4. **Pergunta Comparativa Final (Síntese dos 3 Modelos Mentais):**
   - Apresentar no papel ou tela o vetor `[4, 1, 3, 2]` e pedir ao estudante que descreva, com suas próprias palavras ou gestos, **qual seria o primeiro movimento físico de caixas** no Bubble Sort, no Selection Sort e no Insertion Sort.
   - **Critério Qualitativo de Sucesso Formativo:** O participante distingue verbalmente ou gestualmente (a) troca imediata de vizinhos (`4` e `1`), (b) varredura completa antes de trazer o `1` para o início, e (c) suspensão da chave (`1`), deslizamento unilateral do `4` para a direita e encaixe na vaga.
