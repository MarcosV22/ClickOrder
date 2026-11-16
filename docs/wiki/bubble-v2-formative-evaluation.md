# Protocolo de Validação Formativa com Usuários: Bubble Sort V2

> **Documento Canônico:** Protocolo observacional, roteiro de teste presencial de usabilidade, critérios de observação, entrevista qualitativa e modelo de registro empírico para o piloto do **Bubble Sort V2**.  
> **Status:** Ativo / Aguardando Execução de Testes com Usuários Reais  
> **Data:** 16/11/2026 (Marco UX-REDESIGN-R3-A)  
> **Governança:** [`AGENTS.md`](../../AGENTS.md), [`ADR 0027`](../adr/0027-educational-and-ui-experience-redesign-v2.md), [`ux-redesign-v2.md`](./ux-redesign-v2.md) e [`12-pedagogy-and-academic-traceability.md`](./12-pedagogy-and-academic-traceability.md).

---

## 1. Natureza Metodológica e Enquadramento

> [!IMPORTANT]
> **CLASSIFICAÇÃO METODOLÓGICA:**  
> Este documento especifica um **protocolo de avaliação formativa e qualitativa de usabilidade e compreensão**, projetado para rodadas presenciais ou remotas assistidas de teste com estudantes e professores.  
> Ele **NÃO** constitui um ensaio clínico controlado nem um estudo psicométrico formal com amostra probabilística. Seu propósito é **identificar fricções cognitivas, gargalos visuais, ruído residual de interface e evidências de compreensão factual** para alimentar o refinamento pré-propagação (`UX-REDESIGN-R3-B`).

Em estrito cumprimento a [`12-pedagogy-and-academic-traceability.md`](./12-pedagogy-and-academic-traceability.md), o protocolo adota **linguagem acadêmica não-presuntiva**: o sistema oferece andaimes para apoiar a compreensão, mas a eficácia real depende da observação dos comportamentos reais dos estudantes.

---

## 2. Perfil dos Participantes e Amostragem Formativa

Para a rodada formativa do piloto, recomenda-se uma amostra de conveniência de **6 a 12 participantes**, distribuídos em três categorias formativas:

| Categoria | Perfil do Participante | Objetivo Formativo da Observação |
| :--- | :--- | :--- |
| **Categoria A: Novatos Absolutos** | Estudantes de ensino médio ou superior sem experiência prévia com programação ou algoritmos de ordenação. | Testar a premissa de *"Clareza Infantil sem Infantilização"*: o estudante consegue entender o que está acontecendo sem treinamento prévio sobre a ferramenta? |
| **Categoria B: Estudantes em Formação** | Alunos de períodos iniciais de Computação / TI / Engenharia que já tiveram introdução teórica a algoritmos mas relatam dificuldade conceitual. | Avaliar se o ciclo *Observar $\rightarrow$ Prever $\rightarrow$ Agir $\rightarrow$ Compreender* reduz cliques mecânicos e apoia a construção do modelo mental da invariante. |
| **Categoria C: Educadores e Monitores** | Professores e monitores de disciplinas de Algoritmos e Estruturas de Dados. | Avaliar adequação pedagógica, precisão terminológica, dosagem do scaffolding e clareza do feedback formativo. |

---

## 3. Instruções para o Pesquisador / Observador

O observador deve atuar como facilitador neutro, evitando induzir o comportamento do participante:

1. **Regra de Não-Intervenção Prévia:**
   - **NÃO** explicar previamente como o Bubble Sort funciona;
   - **NÃO** explicar previamente o que cada botão faz ou onde clicar;
   - **NÃO** alertar sobre teclas de atalho antes do uso.
2. **Briefing Inicial Padronizado:**
   > *"Nós estamos desenvolvendo uma plataforma para ajudar na compreensão de algoritmos. Não estamos avaliando você nem sua inteligência; estamos avaliando a clareza da nossa interface. Fique completamente à vontade para explorar a tela e fazer o que achar que deve ser feito. Pedimos apenas que, na medida do possível, você fale em voz alta o que está pensando, onde está olhando e o que espera que aconteça (protocolo Think-Aloud)."*
3. **Critério de Intervenção de Resgate:**
   - Intervir **apenas se o participante permanecer paralisado por mais de 60 segundos** sem saber como interagir;
   - Ao intervir, registrar explicitamente no caderno de campo: *"Bloqueio observado no passo X — intervenção mínima necessária: [descrição]"*.
4. **Ativação da Instrumentação Local:**
   - Adicionar o parâmetro `?uxTest=1` na URL da aplicação (`http://localhost:8443/?uxTest=1`) para ativar a coleta local em memória de telemetria de sessão sem interferir visualmente no teste.

---

## 4. Roteiro de Observação Estruturada por Fases

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           ROTEIRO DE TESTE                              │
├────────────────────┬────────────────────┬───────────────────────────────┤
│ FASE 1:            │ FASE 2:            │ FASE 3:                       │
│ Teste de 5 Segundos│ Prática e Decisão  │ Micro-Reflexão e Entrevista   │
│ (Atenção Focal)    │ (Tempo 1ª Ação)    │ (Compreensão Factual)         │
└────────────────────┴────────────────────┴───────────────────────────────┘
```

### 4.1. Fase 1: Teste dos 5 Segundos (Visão Geral e Entrada)
- **Apresentação:** O participante acessa a tela de Visão Geral do Bubble Sort (`BubbleModuleOverviewV2`).
- **Observação (primeiros 5 segundos):**
  - O participante lê o subtítulo (*"Compare vizinhos e leve os maiores para o final"*)?
  - Para onde o olhar converge primeiro?
  - A ação esperada para iniciar fica evidente?
- **Pergunta Imediata:** *"Em poucas palavras, do que se trata esta tela e o que você acha que vai fazer?"*

### 4.2. Fase 2: Observação da Prática Básica (`BubbleGameScreenV2`)
O participante inicia a Prática Básica ($n=4$: `[40, 20, 50, 10]`).

1. **Previsão Antes de Agir (Checkpoint Pré-Ação):**
   - O participante compreende a pergunta: *"Depois de comparar 40 e 20, qual valor ficará mais à direita?"*
   - O participante responde com autonomia ou hesita?
   - Qual opção é escolhida?
2. **Primeira Ação Factual:**
   - **Métrica Registrada:** `timeToFirstActionMs` (tempo em milissegundos decorrido entre a liberação da botoeira e o primeiro clique em `TROCAR` ou `MANTER`).
   - A primeira ação foi correta (`TROCAR`)?
   - O participante leu a pergunta central (*"Essas duas caixas estão na ordem certa?"*) ou clicou por impulso?
3. **Uso da Dica (Nível 2):**
   - O participante percebeu o botão discreto `[ ? Dica ]` na área de decisão?
   - O participante solicitou dica antes ou após um erro?
   - A dica fornecida clarificou a ação esperada?
4. **Comportamento diante de Erro:**
   - Se o participante clicou incorretamente, ele leu o banner de feedback causal?
   - A explicação causal foi suficiente para que ele corrigisse a ação no segundo clique?
   - O participante tentou clicar repetidamente no mesmo botão ou parou para pensar?
5. **Checagem Pós-Passada (Invariante):**
   - Ao concluir a passada 0, como o participante reagiu à pergunta: *"Depois desta 1ª passada, qual elemento já chegou à sua posição final definitiva?"*
   - Ele identificou visualmente o elemento fixado em verde no final da esteira ($50$)?
6. **Autonomia em Relação aos Detalhes Técnicos (Nível 3):**
   - O participante concluiu a prática sem abrir a gaveta de detalhes técnicos?
   - Se abriu a gaveta, em que momento e com qual motivação?

### 4.3. Fase 3: Tela de Resultados (`BubbleResultScreenV2`) e Micro-Reflexão
1. **Percepção do Banner de Descoberta:**
   - O participante leu o resumo conceitual da descoberta?
2. **Micro-Reflexão Conceitual:**
   - O participante respondeu à pergunta com três alternativas?
   - A resposta inicial foi correta?
   - A leitura do feedback conceitual gerou reação observável de concordância?
3. **Exportação da Telemetria Local:**
   - O pesquisador copia ou baixa o JSON gerado no painel discreto `[🔬 Modo Teste de UX Ativo]` ao final da sessão.

---

## 5. Roteiro de Entrevista Qualitativa Pós-Uso (Questões A a G)

Imediatamente após a conclusão da prática e da tela de resultados, conduzir a seguinte entrevista semiestruturada breve:

- **Questão A:** *"Em que momento você percebeu o que o algoritmo estava tentando fazer com as caixas?"*
- **Questão B:** *"O que significavam os botões TROCAR e MANTER para você? Fizeram sentido intuitivo?"*
- **Questão C:** *"Você sentiu que a tela tinha informação demais, na medida certa ou sentiu falta de algo?"*
- **Questão D:** *"O botão de dica foi fácil de achar quando necessário, ou passou despercebido?"*
- **Questão E:** *"Você precisou abrir a opção de 'Ver detalhes' no rodapé? O que esperava encontrar ali?"*
- **Questão F:** *"Se você tivesse que explicar para um colega em uma frase como o Bubble Sort funciona com base no que você fez agora, o que você diria?"*
- **Questão G:** *"Houve algum momento em que você se sentiu perdido ou sem saber o que fazer?"*

---

## 6. Escala Descritiva Curta de Percepção (1 a 5 Formativa)

> [!NOTE]
> Esta escala é puramente descritiva e orientativa para triangulação com as notas de campo, e **não** constitui validação psicométrica de construto.

Solicitar ao participante que classifique de 1 a 5 cada item:

| Item | Enunciado | Âncora 1 | Âncora 5 |
| :---: | :--- | :--- | :--- |
| **E1** | Clareza visual da esteira e das caixas | Muito confusa / Não sabia o que olhar | Muito limpa / Foco imediato no par ativo |
| **E2** | Facilidade de saber onde olhar a cada passo | Fiquei desorientado na maior parte do tempo | Olhar natural e imediato para a pergunta |
| **E3** | Compreensão do que fazer a cada momento | Tive que chutar botões para avançar | Ficou óbvia a decisão necessária |
| **E4** | Sobrecarga de informação na tela | Muitas informações competindo por atenção | Quantidade repousante e adequada |
| **E5** | Sensação de aprendizagem ativa | Apenas cliquei nos botões | Compreendi o motivo de cada movimentação |

---

## 7. Checklist de Sinais de Falha Heurística (Red Flags)

Durante a sessão, o observador deve marcar se algum destes sinais críticos de falha foi observado:

- [ ] **Automatismo Cego:** O estudante clica alternadamente em `TROCAR` e `MANTER` sem olhar para os números das caixas.
- [ ] **Hesitação Excessiva (> 10s):** O estudante paralisa com a esteira ativa sem conseguir identificar onde está a pergunta ou a ação.
- [ ] **Confusão de Paridade:** O estudante expressa dúvida sobre quais caixas estão sendo comparadas no momento.
- [ ] **Dependência da Gaveta Técnica:** O estudante novato tenta abrir a gaveta de detalhes técnicos procurando instrução sobre como jogar.
- [ ] **Incompreensão da Invariante:** O estudante conclui a prática mas acredita que o menor elemento foi para o final da esteira.
- [ ] **Invisibilidade da Dica:** O estudante erra repetidamente a mesma comparação sem notar que há um botão `[ ? Dica ]` logo acima da pergunta.
- [ ] **Frustração com o Feedback:** O estudante relata que a mensagem de erro é críptica ou não explica o motivo da regra.

---

## 8. Tabela Padronizada de Registro de Observação

Modelo de planilha de campo para preenchimento durante as sessões:

| ID | Cat. | $t_{\text{1ª ação}}$ (ms) | 1ª Ação OK? | Predição OK? | Invariante OK? | Dicas | Erros | Gaveta Aberta? | Reflexão OK? | Escala (E1-E5) | Notas de Campo e Citações Verbais |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| *P01* | *Ex.* | *3200* | *Sim* | *Sim* | *Sim* | *0* | *1* | *Não* | *Sim* | *5, 4, 5, 5, 4* | *"Ficou claro que o 50 estava subindo."* |

---

## 9. Resultados Empíricos Futuros (Aguardando Rodada de Testes Presenciais)

> [!NOTE]
> **SEÇÃO EM ABERTO:**  
> Esta seção permanece estritamente desprovida de dados fictícios ou simulações estatísticas sintéticas.  
> O registro de evidências reais, transcrições de falas, médias descritivas e conclusões empíricas será redigido exclusivamente após a condução das sessões reais com estudantes e professores no marco **`UX-REDESIGN-R3-B`**.
