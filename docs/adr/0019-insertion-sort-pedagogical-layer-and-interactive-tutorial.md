# ADR 0019: Camada Pedagógica, Constraints Procedurais, Briefing, Tutorial Interativo e Driver de Demonstração do Insertion Sort

- **Status:** Aceito
- **Data:** 2026-09-15
- **Autores:** Marcos Mendes / Antigravity AI
- **Decisores:** Mantenedores do Sorting Station

---

## 1. Contexto e Declaração do Problema

Com a conclusão da `InsertionSortEngine` pura e de sua FSM determinística em P2.2-B, o domínio do Insertion Sort ("Desvio e Encaixe de Cargas") foi fundamentado formalmente com base no modelo canônico de **deslocamentos unilaterais** (*shifts*), refutando categoricamente implementações impróprias baseadas em permutas (*swaps*).

Antes de iniciar a campanha interativa procedural (P2.2-D) e a reconstrução visual de Replay com pseudocódigo sincronizado (P2.2-E), o projeto demandava a implementação rigorosa da **camada pedagógica preparatória** (Marco P2.2-C), abordando:

1. **Constraints procedurais puras:** predicados matemáticos para geração determinística de vetores ricos pedagogicamente (tamanhos 4, 5 e 6, exigindo deslocamentos simples, inserções diretas e deslocamentos múltiplos);
2. **Briefing educacional oficial:** configurado no catálogo data-driven existente sem duplicação de layouts JSX, reforçando as invariantes centrais (*SHIFT ≠ TROCA*, *ORD ≠ POSIÇÃO DEFINITIVA*);
3. **Tutorial interativo guiado:** conduzido pela engine real sobre o vetor fixo canônico `[4, 2, 3]`, com representação visual límpida da vaga aberta (`InsertionHoleSlot`) e da chave elevada ao trilho aéreo (`NumberedBox` com role `"key"`), com botoeira canônica (`GameButton`);
4. **Driver puro de demonstração canônica:** execução autônoma sobre o vetor curado representativo `[6, 3, 5, 2, 7]`, englobando deslocamento simples, parada por condição falsa, múltiplos deslocamentos, chegada à cabeceira da esteira e passada sem deslocamento (inserção direta imediata).

---

## 2. Decisão Arquitetural

Decidiu-se:

### 2.1. Constraints Procedurais Puras (`insertionConstraints.ts`)
- A camada de geração universal (`src/game/generation/`) permaneceu agnóstica e intocada;
- As restrições pedagógicas de Insertion Sort foram implementadas em `src/game/sorting/insertion/insertionConstraints.ts` através de predicados puros aplicados sobre simulação matemática:
  - `hasAtLeastOneShift`: assegura que o vetor não é trivialmente já ordenado e demanda ao menos um deslocamento;
  - `hasAtLeastOneDirectInsert`: assegura que há ao menos uma passada onde a chave já é maior ou igual ao elemento inspecionado ($A[j] \le \text{chave}$), evidenciando a parada imediata da busca sequencial ($0$ shifts);
  - `hasInsertionWithMultipleShifts`: assegura que há ao menos uma passada em que múltiplos elementos adjacentes são deslocados sucessivamente para a direita;
- Função determinística `generateInsertionPhaseArray(phase, seed)` para fases 1 ($n=4$), 2 ($n=5$) e 3 ($n=6$) no intervalo 1..99 sem elementos duplicados.

### 2.2. Briefing Educacional Data-Driven (`INSERTION_CANONICAL_BRIEFING`)
- Adicionada a chave `"insertion-canonical"` a `BriefingModeId` e ao catálogo `BRIEFING_CATALOG` em `src/game/briefing/`;
- Reutilização sem duplicação do componente `ProtocolModeBriefingScreen`;
- Estruturação em 4 tópicos educacionais obrigatórios:
  - *O QUE VOCÊ VAI APRENDER*: subvetor ordenado relativo `ORD`, chave suspensa e varredura regressiva;
  - *O QUE VOCÊ VAI PRATICAR*: avaliar $A[j] > \text{chave}$, deslocar cargas maiores e encaixar na vaga;
  - *COMO FUNCIONA O CICLO*: elevação automática, busca regressiva, deslocamentos e encaixe;
  - *AVISOS VITAIS*: `SHIFT ≠ SWAP` e `ORD ≠ DEFINITIVO`;
- CTA configurado com `startLabel: "INICIAR TUTORIAL GUIADO"`.

### 2.3. Componente de Vaga e Papel Semântico de Chave
- Criado o componente visual `src/components/InsertionHoleSlot.tsx`:
  - Representa a lacuna física deixada pela chave e movida pelos shifts;
  - **Invariante visual inviolável:** a vaga **NUNCA** recebe badge `ORD` nem o role `ordered`. Não passa `null` nem valores fictícios (como 0) para `NumberedBox`;
  - Renderiza badge `VAGA`, padrão tracejado industrial e tamanho idêntico aos slots (`NumberedBox`);
- Estendido `BoxRole` em `src/components/NumberedBox.tsx` com o papel `"key"`:
  - Badge visual explícito: `CHAVE`;
  - Estilização em âmbar brilhante industrial com pulso suave, destacando a chave no trilho aéreo suspenso.

### 2.4. Scaffolding Pedagógico e Tutorial Interativo (`InsertionTutorialScreen.tsx`)
- Vetor canônico fixo: `[4, 2, 3]`;
- Fluxo de execução conduzido 100% pelo estado da `InsertionSortEngine`:
  - **Passada 1 ($i=1$):** Chave 2 elevada. $A[0] = 4 > 2 \rightarrow$ `SHIFT_RIGHT`. Vaga move-se para 0, $j = -1$. Cabeceira da esteira atingida (`INSERT_READY`) $\rightarrow$ `INSERT_KEY` (razão `HEAD_REACHED`). Esteira estabiliza em `[2, 4, 3]`, região `ORD` cobre índices 0 e 1;
  - **Passada 2 ($i=2$):** Chave 3 elevada. $A[1] = 4 > 3 \rightarrow$ `SHIFT_RIGHT`. Vaga move-se para 1, $j = 0$. $A[0] = 2 \le 3 \rightarrow$ `INSERT_KEY` (razão `CONDITION_FALSE`). Esteira estabiliza em `[2, 3, 4]`, ordenação completa!
- Botoeira ergonômica com `GameButton`: `[ ➔ DESLOCAR CARGA ]` e `[ ⇣ ENCAIXAR CHAVE ]`;
- Durante a fase `INSERT_READY`, o botão `DESLOCAR CARGA` é desabilitado, impedindo violações de domínio;
- Erros pedagógicos (tentativa de encaixar quando a carga é maior, ou deslocar quando a carga é menor/igual) não avançam o estado da esteira e geram feedback formativo imediato explicativo;
- Finalização limpa e retorno seguro ao Hub, sem alterar Schema v3 de persistência nem gravar em chaves inexistentes.

### 2.5. Driver Puro de Demonstração Canônica (`insertionDemonstration.ts`)
- Vetor fixo curado: `[6, 3, 5, 2, 7]`;
- Execução determinística pura via engine real:
  - Passada 1 ($i=1$, chave 3): shift simples de 6 $\rightarrow$ `HEAD_REACHED`;
  - Passada 2 ($i=2$, chave 5): shift de 6 $\rightarrow$ parada por `CONDITION_FALSE` diante de 3;
  - Passada 3 ($i=3$, chave 2): múltiplos shifts sucessivos (6, 5, 3) $\rightarrow$ `HEAD_REACHED`;
  - Passada 4 ($i=4$, chave 7): zero shifts (parada imediata por 6 $\le$ 7) $\rightarrow$ `CONDITION_FALSE`;
- Desacoplamento de UI: a tela visual integrada com pseudocódigo sincronizado fica reservada para P2.2-E, compartilhando a infraestrutura de Replay.

---

## 3. Consequências

### Positivas
- **Fidelidade Algorítmica e Mecânica:** A distinção física entre o trilho aéreo e a esteira elimina de vez a confusão entre shifts e swaps;
- **Integridade Visual:** A vaga aberta possui componente dedicado (`InsertionHoleSlot`), sem quebras de layout e sem renderização indevida de badges de ordenação em slots vazios;
- **Scaffolding Formativo:** O tutorial guiado conduz o estudante por todos os ramos da FSM (cabeceira e condição falsa);
- **Cobertura Integral de Testes:** 344 testes verdes (100% das suítes de constraints, briefings, tutorial e demonstração aprovadas).
- **Sem Riscos de Regressão:** Zero impacto na persistência v3 existente e compilação de produção (build Vite) limpa.

### Próximos Passos
- **Marco P2.2-D:** Prática procedural, 3 fases do Insertion Sort (`InsertionGameScreen`), telemetria e integração com a pontuação do protocolo.
- **Marco P2.2-E:** Replay retrospectivo, modelo de quadros, painel de pseudocódigo sincronizado e conexão visual da Demonstração.
- **Marco P2.2-F:** Persistência Schema v4 / expansão multi-protocolo.
