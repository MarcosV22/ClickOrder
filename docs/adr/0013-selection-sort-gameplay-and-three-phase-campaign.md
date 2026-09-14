# ADR 0013: Selection Sort Gameplay, Animação de Longa Distância e Campanha de 3 Fases

- **Status:** Aceito
- **Data:** 2026-09-13
- **Autores:** Marcos Mendes / Antigravity AI
- **Decisores:** Mantenedores do Sorting Station

---

## 1. Contexto e Declaração do Problema

Após a implementação do núcleo puro da `SelectionSortEngine` em P2.1-B (ADR 0011) e da camada pedagógica/tutorial guiado em P2.1-C (ADR 0012), o projeto demandava a realização do **marco P2.1-D**: a campanha jogável completa do Selection Sort ("Scanner de Carga Mínima") em 3 fases procedurais progressivas (Fase 1 com 4 caixas, Fase 2 com 5 caixas e Fase 3 com 6 caixas).

Os desafios arquiteturais e pedagógicos centrais incluíam:
1. **Diferenciação Cinestésica Efetiva em Relação ao Bubble Sort:** Não bastava apenas alterar os nomes de botões; a esteira precisava demonstrar visualmente e fisicamente que no Selection Sort a varredura do scanner NÃO movimenta caixas e que a troca física só ocorre **ao final da passada** e pode atravessar longas distâncias na esteira;
2. **Isolamento de Componentes de Tela:** Evitar transformar o `GameScreen` do Bubble Sort em um monólito condicional complexo com flags multi-algoritmo;
3. **Contratos Limpos de Telemetria e Resultados:** Modelar união discriminada para os resultados das fases sem misturar os tipos de histórico (`SelectionStepRecord` vs `StepRecord` do Bubble Sort);
4. **Isolamento da Persistência de Longo Prazo:** Como a persistência multi-protocolo e o Schema v3 estão planejados para etapa futura, o progresso do Selection Sort na sessão deve operar estritamente em memória sem mutação indevida do Schema v2 do Bubble Sort no `localStorage`.

---

## 2. Decisão Arquitetural

Decidiu-se:

### 2.1. Criação de Tela Própria (`src/screens/SelectionGameScreen.tsx`)
- Implementar `SelectionGameScreen.tsx` como componente autônomo, consumindo a `SelectionSortEngine` imutável como única fonte de verdade algorítmica;
- Reutilizar componentes visuais compartilhados (`NumberedBox`, `GameButton`, `PhaseHeader`, `StatsPanel`, `InstructionPanel`);
- Durante a fase `INSPECT`:
  - A esteira exibe de forma textual e semântica a tríade: ALVO ($i$), MÍN ($minIndex$), SCAN ($j$) e OK (elementos consolidados);
  - Exibe banner de comparação textual explícita ($A[j] < A[minIndex]$), evitando dependência exclusiva de cor;
  - Oferece exclusivamente as ações `[ ✦ NOVO MÍNIMO ]` e `[ = MANTER CANDIDATO ]`;
  - Ações incorretas incrementam `state.errors`, mantêm o scanner parado e o candidato inalterado, e fornecem feedback formativo amigável sem mensagens punitivas;
  - A UI nunca despacha commit durante `INSPECT`.
- Durante a fase `COMMIT`:
  - Controles de inspeção são rigorosamente ocultados;
  - Se $minIndex \neq i$: exibe `[ ⇄ TRANSFERIR MENOR CARGA ]`;
  - Se $minIndex === i$: exibe `[ ✓ CONSOLIDAR POSIÇÃO ]` com feedback curto de que o menor elemento já ocupa o alvo;
  - A UI nunca despacha inspeção durante `COMMIT`.

### 2.2. Animação de Transferência de Longa Distância com Distância Variável
- Estender as animações `@keyframes swap-left` e `@keyframes swap-right` em `src/index.css` para aceitarem a variável CSS `--swap-distance`, com valor padrão 1 (preservando retrocompatibilidade total com as trocas adjacentes do Bubble Sort);
- No momento do commit com troca, calcular a distância horizontal $d = |minIndex - i|$ e passá-la para `NumberedBox`, produzindo elevação e translação suave da menor carga diretamente até a posição alvo da passada;
- Trava síncrona `isActionLockedRef` bloqueia quaisquer novos inputs durante o tempo de animação (600ms).

### 2.3. Conclusão da Campanha Dedicada (`SelectionCampaignCompleteScreen.tsx`)
- Criar tela de encerramento dedicada exibindo:
  - Título canônico: `PROTOCOLO SELECTION SORT CONCLUÍDO`;
  - Resumo das 3 fases: Comparações, Trocas, Erros, Dicas, Tempo e Pontuação;
  - CTAs: `[ ⌂ VOLTAR AO INÍCIO ]` e `[ ↺ REJOGAR SELECTION SORT ]` (que reinicia a Fase 1 com novos vetores procedurais);
  - Isenção de notas médias, estrelas, rankings ou comparações com Bubble Sort nesta fase.

### 2.4. Contratos de Tipos e União Discriminada
- Criar `SelectionPhaseCompleteData` com `protocol: "selection"` e histórico tipado estritamente como `readonly SelectionStepRecord[]`;
- Unificar em `App.tsx` através da união discriminada `GameResult = BubbleGameResult | SelectionGameResult`;
- Adaptar `ResultScreen.tsx` para reconhecer `protocol?: "bubble" | "selection"`, exibindo a nota pedagógica canônica do Selection Sort e suprimindo pseudocódigo ou botões de replay enquanto não implementados formalmente.

### 2.5. Geração Procedural e Persistência em Memória
- Consumir exclusivamente `generateSelectionPhaseArray(phase)` para as fases 1 (n=4), 2 (n=5) e 3 (n=6);
- Manter vetor e seed idênticos ao clicar em `REINICIAR FASE`;
- Gerar novo vetor e seed ao avançar para a próxima fase ou ao rejogar o protocolo;
- Manter o progresso do Selection Sort puramente em memória da sessão, garantindo que o `localStorage` do Schema v2 permaneça intacto.

---

## 3. Alternativas Consideradas

- **Alternativa A: Condicionais no `GameScreen` do Bubble Sort.**  
  *Por que foi descartada:* Poluiria um componente consolidado de 600 linhas com inúmeros ternários e flags, aumentando a dívida técnica e o risco de regressões no Bubble Sort.
- **Alternativa B: Reutilizar animação adjacente para Selection Sort.**  
  *Por que foi descartada:* Destruiria a compreensão do modelo mental do Selection Sort, que requer a percepção clara da busca global e do salto de longa distância.
- **Alternativa C: Criar já o Schema v3 com persistência no `localStorage`.**  
  *Por que foi descartada:* O escopo do marco P2.1-D focava especificamente em Gameplay e Campanha de 3 Fases; a expansão formal de persistência multi-protocolo será tratada em marco dedicado com estratégia de migração segura.

---

## 4. Consequências e Trade-offs

### 4.1. Consequências Positivas (Ganhos)
- **Fidelidade Pedagógica Total:** O estudante experimenta a dinâmica de "varre primeiro, troca depois" com animação proporcional;
- **Zero Regressões:** O Bubble Sort e o Schema v2 continuam 100% íntegros e com testes verdes;
- **Modularidade de UI:** Telas dedicadas e componentes limpos com responsabilidade única;
- **Acessibilidade Aprimorada:** `NumberedBox` agora comunica textualmente em `aria-label` o papel de cada carga (alvo, candidato, scanner, consolidada).

### 4.2. Custos e Limitações Restantes
- O progresso de Selection Sort é volátil em memória (um F5 reinicia a sessão de Selection na tela inicial);
- Replay visual e pseudocódigo sincronizado de Selection Sort ainda não estão implementados (planejados para marcos subsequentes de P2.1).

---

## 5. Links e Referências
- **Código-fonte Afetado:** [`src/screens/SelectionGameScreen.tsx`](../../src/screens/SelectionGameScreen.tsx), [`src/screens/SelectionCampaignCompleteScreen.tsx`](../../src/screens/SelectionCampaignCompleteScreen.tsx), [`src/screens/ResultScreen.tsx`](../../src/screens/ResultScreen.tsx), [`src/components/NumberedBox.tsx`](../../src/components/NumberedBox.tsx), [`src/App.tsx`](../../src/App.tsx), [`src/index.css`](../../src/index.css)
- **Documentos da Wiki Relacionados:** [`02-system-architecture.md`](../wiki/02-system-architecture.md), [`03-frontend.md`](../wiki/03-frontend.md), [`04-sorting-engine.md`](../wiki/04-sorting-engine.md), [`10-roadmap.md`](../wiki/10-roadmap.md)
- **ADRs Anteriores:** [ADR 0011](./0011-selection-sort-engine-and-fsm.md), [ADR 0012](./0012-selection-sort-pedagogical-layer-and-interactive-tutorial.md)
