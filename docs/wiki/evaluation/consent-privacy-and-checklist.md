# Orientações de Consentimento, Privacidade, Acessibilidade e Checklist Técnico (`Itens I e K`)

> **Protocolo Mestre:** [`../bubble-v2-formative-evaluation.md`](../bubble-v2-formative-evaluation.md)  
> **Status Real:** **`PREPARADO — REVISADO EM UX-REDESIGN-R3-B.1`** *(Nenhuma aprovação ética é presumida, nenhum recrutamento foi iniciado e zero sessões reais foram realizadas).*

---

## ITEM I — Orientações de Consentimento, Ética, Acessibilidade e Privacidade

> [!WARNING]
> **CONDIÇÃO ÉTICA PRÉ-CAMPO OBRIGATÓRIA (SEM PRESUNÇÃO DE APROVAÇÃO):**  
> 1. **Não presumir aprovação ética ou conformidade legal automática:** Os modelos abaixo são instrumentos operacionais de pesquisa em IHC/Educação em Computação e **não substituem parecer jurídico nem aprovação ética institucional**.  
> 2. **Consulta institucional obrigatória antes do recrutamento:** Antes de convidar qualquer participante ou coletar qualquer dado real (especialmente visando publicação acadêmica), a equipe responsável **deve verificar formalmente junto à sua instituição** os requisitos éticos e regulatórios aplicáveis (ex.: diretrizes do Comitê de Ética em Pesquisa — Sistema CEP/CONEP — e modelo institucional de TCLE, quando exigível).  
> 3. **Vedação neste marco:** Nenhum recrutamento e nenhuma coleta com seres humanos ocorrem durante `UX-REDESIGN-R3-B.1`.

### I.1. Texto Informativo de Participação Revisado (`45 a 60 minutos` + Acessibilidade)

Texto em linguagem clara para apresentação ao convidado somente após cumpridas as exigências éticas institucionais:

> **Convite para Avaliação Formativa de Interface — Plataforma Educacional Sorting Station**
>
> 1. **Objetivo da atividade:**  
>    Avaliar a clareza visual das telas de tutorial e prática básica de três algoritmos de ordenação (*Bubble Sort*, *Selection Sort* e *Insertion Sort*) na plataforma *Sorting Station*, compreendendo como estudantes e docentes interpretam os estados visuais e explicam suas escolhas.
> 2. **O software está em avaliação, e não você:**  
>    Não estamos medindo conhecimento prévio nem atribuindo nota. Qualquer dúvida, hesitação ou erro durante o uso aponta oportunidades de melhoria na interface e não traz qualquer impacto acadêmico.
> 3. **Etapas e duração realista (`45 a 60 minutos`, com pausas):**  
>    A sessão presencial individual dura aproximadamente **45 a 60 minutos**, com pequenas pausas de descanso entre as três partes. Em cada um dos três módulos você fará: (a) uma rápida observação inicial da tela; (b) um tutorial guiado curto; (c) uma prática básica de 4 números dizendo em voz alta o que está observando; e (d) uma pergunta oral curta. Ao final, faremos um exercício breve em papel com 4 números (`[4, 1, 3, 2]`).
> 4. **Adaptações de conforto e acessibilidade:**  
>    Caso prefira ampliar o tamanho da tela, reduzir animações, usar leitura assistida ou realizar a observação inicial sem contagem rápida de tempo, avise o pesquisador a qualquer momento — o procedimento se adapta ao seu conforto.
> 5. **Participação voluntária e direito incondicional de pausa ou desistência:**  
>    Sua participação é **100% voluntária**. Você pode pedir pausas, deixar de responder a qualquer pergunta ou **encerrar e desistir da sessão a qualquer momento**, sem justificativa e sem qualquer prejuízo. Em caso de desistência na sessão, todas as anotações e arquivos temporários associados ao seu código serão descartados imediatamente.
> 6. **Privacidade, código anônimo e áudio opcional:**  
>    Não registramos nome, matrícula, e-mail, CPF, imagem ou tela identificada nas fichas nem nos arquivos do sistema — usamos apenas um código impessoal (`P01`, `P02`, ...). A aplicação roda localmente sem enviar dados pela internet. Caso você concorde separadamente, poderemos gravar apenas o áudio da voz para transcrever fielmente suas explicações; caso prefira não gravar áudio, a sessão ocorre normalmente apenas com registro escrito.

---

### I.2. Roteiro de Consentimento Pré-Sessão e Segregação de Identidade

1. **Apresentação e esclarecimento:** Entregar/ler o texto informativo (`I.1`), verificar se há dúvidas e consultar preferências de acessibilidade visual/temporal (`Item A.1`).
2. **Dupla confirmação independente antes de iniciar:**
   - **Participação voluntária na sessão (`45–60 min`):** `[ ] Sim, concorda voluntariamente` *(obrigatório para prosseguir)*;
   - **Gravação opcional apenas de voz para transcrição anônima:** `[ ] Sim, autoriza áudio   [ ] Não autoriza áudio (seguir apenas com notas escritas)`.
3. **Segregação documental estrita:** Se a norma institucional exigir TCLE assinado nominalmente, arquivá-lo em envelope/repositório administrativo isolado sob guarda exclusiva do pesquisador responsável, **sem jamais anotar o código `Pxx` no TCLE assinado**, evitando vínculo direto entre identidade civil e fichas/CSVs.

---

### I.3. Minimização de Dados e Guarda Restrita
- **Zero PII nas fichas, JSONs e CSVs:** Registrar exclusivamente `participant_code` (`P01..Pnn`), `stratum_category` (`A/B/C`), `prior_familiarity_algo`, `assigned_order` (`O1..O6`), `accessibility_adaptation` e os registros de `Fontes A, B e C`.
- **Armazenamento restrito:** Manter fichas digitalizadas, arquivos `<Pxx>-<Ox>-bubble.json` e planilhas `.csv` em diretório local/institucional de acesso exclusivo dos pesquisadores autorizados; suprimir qualquer menção acidental a nomes próprios em transcrições (`[nome omitido]`) e descartar áudios brutos conforme o protocolo ético institucional aprovado.

---

## ITEM K — Checklist Técnico e Operacional Revisado (`UX-REDESIGN-R3-B.1`)

### K.1. Pré-Sessão e Troca Limpa entre Participantes (`10–15 min` antes de cada sessão)

- [ ] **1. Servidor local ativo:** Plataforma rodando localmente (ex.: `http://localhost:8443`), sem editores de código ou documentos da pesquisa visíveis na tela.
- [ ] **2. Navegador padronizado e sem tradutor automático:** Chrome/Edge atualizado, tradução automática de páginas **desativada** e viewport de referência **`1366×768` com zoom `100%`** (salvo quando o participante solicitar zoom ampliado por acessibilidade, registrando na Ficha `B`).
- [ ] **3. RESET ATÔMICO OBRIGATÓRIO (`localStorage` + Memória React `bubbleUxSession`):**
  - Abrir o Console (`F12`) e executar **exatamente o comando combinado abaixo** (nunca executar `removeItem` sem recarregar a URL, pois `saveData` e `bubbleUxSession` permaneceriam vivos na memória React da sessão anterior!):
    ```js
    localStorage.removeItem("sorting_station_save"); window.location.assign("/?uxTest=1");
    ```
  - *(Alternativa equivalente: fechar **todas** as janelas anônimas anteriores e abrir uma nova janela anônima apontando diretamente para `http://localhost:8443/?uxTest=1`).*
  - Confirmar visualmente na `HomeScreen` que a URL termina em `/?uxTest=1` e que os três cards (**Bubble**, **Selection**, **Insertion**) exibem `0` práticas concluídas e botão `[ COMEÇAR ]`. Fechar o DevTools (`F12`).
- [ ] **4. Materiais físicos conferidos sobre a mesa:**
  - Código `Pxx` e ordem `O1..O6` atribuídos; Folha Informativa (`Item I.1`), Ficha `B` em branco (com campos para vetor dos `5s` e vetor pós-Tutorial), Ficha `H`, Ficha `G` + cartão impresso **`[ 4 ]  [ 1 ]  [ 3 ]  [ 2 ]`** virado para baixo, água disponível para as pausas e cronômetro silencioso.

---

### K.2. Verificações Durante cada Módulo (`5s → Tutorial V2 → Prática Básica → Resultado`)

- [ ] **1. Primeira Impressão na abertura da Prática Básica (sem cliques):**
  - Navegar `Card → [ Ir para práticas › ] → PRÁTICA BÁSICA: [ INICIAR PRÁTICA → ]`;
  - Anotar `five_sec_displayed_array`; aplicar 5s padrão (ou exploração sem tempo `C.3` se acessível); no **Bubble**, lembrar que estão visíveis apenas os botões numéricos de `Previsão Antes de Agir` (não cobrar `TROCAR`/`MANTER` ocultos).
- [ ] **2. Saída limpa para o Tutorial Guiado V2 Obrigatório:**
  - Sem clicar nas opções da prática, clicar em **`[ ← Práticas ]`** $\rightarrow$ **`[ Tutorial Guiado ]`**;
  - Aguardar conclusão integral do Tutorial V2; ao clicar no botão final do tutorial, a Prática Básica real abre automaticamente com um **novo vetor procedural `n = 4`** e relógio limpo.
- [ ] **3. Registro imediato do vetor real da Prática Básica (`practice_initial_array`):**
  - Anotar os 4 valores reais assim que a Prática Básica pós-tutorial abrir (no Insertion: `[1º na esteira, CHAVE suspensa, 3º na esteira, 4º na esteira]`).
  - **Não pressionar `F5`** durante o módulo Bubble Sort para não perder `bubbleUxSession` em memória.
- [ ] **4. Exportação e transcrição na Tela de Resultados:**
  - **Bubble (`BubbleResultScreenV2`):** copiar métricas da `Fonte A` + clicar imediatamente em **`[ Baixar JSON ]`** salvando como `<Pxx>-<Ox>-bubble.json` antes de sair da tela;
  - **Selection e Insertion (`ResultScreen`):** copiar métricas da `Fonte A` e confirmar marcação manual de `Aprofundamento técnico`, checkpoint pré-commit (Selection) e `Replay` na Ficha `B`;
  - Fazer a **Pergunta Verbal Pós-Prática (`Item E.1`)** e oferecer **micro-pausa de `1–2 min`** antes do próximo módulo.
- [ ] **5. Etapa de Transferência (`[4, 1, 3, 2]`):**
  - Minimizar o navegador antes de virar o cartão `[4, 1, 3, 2]`, lendo também em voz alta quando útil ao participante.

---

### K.3. Pós-Sessão (`5 min` imediatamente após a saída do participante)

- [ ] **1. Conferência de integridade documental:** Verificar legibilidade de todas as falas literais nas Fichas `B`, `G` e `H`, presença dos dois vetores (`5s` e `Prática`) em cada módulo e presença do arquivo `<Pxx>-<Ox>-bubble.json`.
- [ ] **2. Auditoria de zero PII:** Confirmar ausência de nomes próprios, matrículas ou e-mails nas folhas e nos nomes de arquivos.
- [ ] **3. Reset imediato para deixar a estação higienizada:** Executar `localStorage.removeItem("sorting_station_save"); window.location.assign("/?uxTest=1");`.
