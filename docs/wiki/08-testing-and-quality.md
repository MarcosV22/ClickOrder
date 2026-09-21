# 08 — Testes, Qualidade de Software e Definition of Done

> **Documento canônico:** Diagnóstico da cobertura atual, estratégia de garantia da qualidade (QA), matriz de casos de teste pedagógicos e critérios de Definition of Done do **Sorting Station**.  
> **Status:** Ativo / Base de Verdade da Wiki  
> **Data:** 08/09/2026  
> **Dependências:** [`AGENTS.md`](../../AGENTS.md), [`CLAUDE.md`](../../CLAUDE.md), [`package.json`](../../package.json), [`00-repository-inventory.md`](./00-repository-inventory.md), [`02-system-architecture.md`](./02-system-architecture.md), [`04-sorting-engine.md`](./04-sorting-engine.md).

---

## 1. Estado Real dos Testes Automatizados Atuais

Com as conclusões dos marcos **P0**, **P1**, **P2.1**, **P2.1-G** e **P2.2 (Insertion Sort e Schema v4)**, a infraestrutura de testes automatizados do projeto cobre 100% da lógica pura de domínio, FSMs de ordenação (Bubble, Selection e Insertion Sort), tutoriais, conjuntos de prática progressiva, agregação de resultados, geração procedural Mulberry32, briefing, telemetria de sessão, replay da execução, pseudocódigo sincronizado, modo demonstração e persistência Schema v4:

- **Framework de Testes Implementado:** **Vitest** (`vitest ^5.0.0`) instalado como dependência de desenvolvimento canônica via `pnpm add -D vitest`.
- **Arquivos de Teste Ativos (29 arquivos, 413 testes automatizados aprovados 100% verde):**
  1. `src/game/sorting/selection/selectionSortEngine.test.ts` (18 testes)
  2. `src/game/sorting/insertion/insertionSortEngine.test.ts` (18 testes)
  3. `src/game/replay/selectionReplayPseudocode.test.ts` (9 testes)
  4. `src/game/sorting/insertion/insertionReplayModel.test.ts` (13 testes)
  5. `src/game/briefing/briefing.test.ts` (20 testes)
  6. `src/screens/protocolCatalog.test.ts` (15 testes)
  7. `src/game/curriculum/practiceCatalog.test.ts` (11 testes - Catálogo Curricular Transversal)
  8. `src/screens/practiceFlow.test.tsx` (8 testes - Integração de Seletor, Conclusão de Práticas e Cenário Cross-Sessão)
  9. `src/game/generation/arrayGenerator.test.ts` (31 testes)
  10. `src/game/persistence/persistence.test.ts` (64 testes - Schema v4, Gravação Única e Integridade Factual de Tutorial)
  11. `src/game/sorting/bubbleSortEngine.test.ts` (39 testes)
  12. `src/game/replay/replayModel.test.ts` (11 testes)
  13. `src/game/sorting/selection/selectionCampaign.test.ts` (19 testes)
  14. `src/game/demonstration/demonstration.test.ts` (24 testes)
  15. `src/game/replay/replayPseudocode.test.ts` (12 testes)
  16. `src/game/sorting/selection/selectionConstraints.test.ts` (16 testes)
  17. `src/game/replay/selectionReplayModel.test.ts` (9 testes)
  18. `src/game/sorting/insertion/insertionReplayPseudocode.test.ts` (8 testes)
  19. `src/game/sorting/selection/selectionTutorialGuide.test.ts` (3 testes)
  20. `src/game/sorting/insertion/insertionPracticeGameplay.test.ts` (13 testes)
  21. `src/game/sorting/insertion/insertionConstraints.test.ts` (10 testes)
  22. `src/game/sorting/insertion/insertionTutorialGuide.test.ts` (3 testes)
  23. `src/game/session/protocolScore.test.ts` (11 testes)
  24. `src/game/sorting/insertion/practiceCatalog.test.ts` (5 testes)
  25. `src/game/tutorial/tutorialGuide.test.ts` (5 testes)
  26. `src/game/campaign/campaignSummary.test.ts` (4 testes)
  27. `src/game/sorting/insertion/insertionPedagogy.test.ts` (6 testes)
  28. `src/screens/campaignCompleteConfig.test.ts` (3 testes)
  29. `src/game/session/sessionMetrics.test.ts` (5 testes)
- **Scripts de Teste Canônicos em [`package.json`](../../package.json):**
  - `pnpm run test:run`: Execução única headless da suíte completa;
  - `pnpm test`: Modo watch interativo de desenvolvimento.

---

## 2. Estratégia de Qualidade Proposta

A Pirâmide de Qualidade do Sorting Station possui seus dois primeiros níveis totalmente consolidados:

```mermaid
graph TD
    subgraph Piramide_Qualidade ["Pirâmide de Garantia da Qualidade"]
        N1["Nível 1: Checagem Estática & Tipagem\n(tsc, vite build, oxfmt) [ATIVO HOJE]"]
        N2["Nível 2: Testes Unitários de Domínio & Persistência\n(Vitest: 413 testes em 29 arquivos) [ATIVO HOJE]"]
        N3["Nível 3: Testes de Integração de FSM & Telas\n(Transições de estado, callbacks, fluxos) [ATIVO HOJE]"]
        N4["Nível 4: Acessibilidade, Responsividade & E2E\n(Teclado, reduced-motion, telas) [PLANEJADO / HOMOLOGAÇÃO MANUAL PENDENTE]"]

        N1 --> N2
        N2 --> N3
        N3 --> N4
    end
```

> [!NOTE]
> **Tooling de Teste Ativo:**  
> O **Vitest** é o executor oficial de testes do projeto, com **413 testes automatizados 100% verdes** distribuídos em 29 arquivos de teste. A homologação visual interativa renderizada em browser real (viewports 1366x768, 1600x900, 1920x1080 e <700px) permanece como pendência manual declarada.

---

## 3. Matriz de Casos de Teste Essenciais da Engine de Ordenação `[PLANEJADO]`

Quando a engine de ordenação for desacoplada em TypeScript puro ([`04-sorting-engine.md`](./04-sorting-engine.md)), os seguintes cenários de teste unitário devem ser implementados obrigatoriamente:

### 3.1. Casos Limítrofes e Configurações de Vetor
1. **Vetor Inversamente Ordenado (Pior Caso):**  
   - Vetor: `[5, 4, 3, 2, 1]`.  
   - Critério: Deve exigir o número máximo teórico de comparações $\frac{n(n-1)}{2} = 10$ e exatamente $10$ trocas.
2. **Vetor Já Ordenado (Melhor Caso):**  
   - Vetor: `[1, 2, 3, 4, 5]`.  
   - Critério: Todas as comparações da primeira passada devem resultar em `KEEP` ($A[j] \le A[j+1]$); na variante com *early exit*, a fase deve se encerrar após $n-1 = 4$ comparações e 0 trocas.
3. **Vetor com Elementos Duplicados:**  
   - Vetor: `[4, 2, 4, 1]`.  
   - Critério: Ao comparar $4$ com $4$, a decisão correta mandatória é **MANTER (`KEEP`)**, garantindo a estabilidade matemática do algoritmo ($A[j] \le A[j+1]$).
4. **Tamanhos Mínimos:**  
   - Vetor com 2 elementos: `[2, 1]` (exige 1 comparação e 1 troca) e `[1, 2]` (exige 1 comparação e 0 trocas).
   - Vetor com 1 elemento: `[7]` (detectado como trivialmente ordenado sem comparações).

### 3.2. Testes da Máquina de Estados Finita (FSM)
1. **Seleção de Par Esperado:**  
   - Tentar selecionar o par $[j, j+1]$ no estado `AWAITING_PAIR_SELECTION` transita para `AWAITING_DECISION`.
   - Tentar selecionar um par arbitrário fora da sequência incrementa o contador `errors`, preserva o estado e emite aviso explicativo.
2. **Decisão de Troca (*Swap Decision*):**  
   - Submeter ação de troca quando $A[j] > A[j+1]$ é validado com sucesso, permuta os valores no array de trabalho e incrementa `swaps`.
   - Submeter ação de troca quando $A[j] \le A[j+1]$ é rejeitado como erro pedagógico, incrementa `errors` e não altera o vetor.
3. **Decisão de Manutenção (*Keep Decision*):**  
   - Submeter ação de manter quando $A[j] \le A[j+1]$ é validado com sucesso e não altera o vetor.
   - Submeter ação de manter quando $A[j] > A[j+1]$ é rejeitado como erro pedagógico, explicando a violação da passada.
4. **Avanço de Ponteiros e Fim de Passada:**  
   - Quando $j < n - 2 - i$, o ponteiro $j$ avança para $j + 1$.
   - Quando $j = n - 2 - i$, a passada é finalizada, $i$ incrementa para $i + 1$, $j$ é resetado para $0$ e o elemento na posição $n - 1 - i$ é marcado como `LOCKED` no `sortedBoundary`.
5. **Comportamento de Dica e Reset:**  
   - Disparar `requestHint()` incrementa `hintsUsed` e retorna o par exato da vez com a ação esperada.
   - Disparar `resetPhase()` restaura o vetor para `initialArray` e reinicia todos os ponteiros e contadores.

---

## 4. Testes de Integração e Fluxo do Front-End `[PLANEJADO]`

### 4.1. Fluxo de Transição entre Telas
Verificar se o chaveamento de `screen` em [`src/App.tsx`](../../src/App.tsx) mantém a integridade do ciclo:
- `HomeScreen` $\xrightarrow{\text{onStart}}$ `TutorialScreen` $\xrightarrow{\text{onUnderstood}}$ `GameScreen` $\xrightarrow{\text{onComplete}}$ `ResultScreen`.
- `ResultScreen` $\xrightarrow{\text{onRepeat}}$ recarrega a mesma fase com resultado limpo.
- `ResultScreen` $\xrightarrow{\text{onNext}}$ incrementa a fase de 1 para 2, e de 2 para 3, com instâncias limpas via `key={'game-phase-${phase}'}`.

### 4.2. Responsividade e Quebra de Layout
- Validar se a esteira transportadora em `GameScreen.tsx` não transborda lateralmente em viewports móveis ($375\text{px}$, $768\text{px}$) ou se ativa barra de rolagem horizontal segura (`overflow-x-auto`).
- Validar se o layout permanece estável em resoluções de desktop ($1024\text{px}$, $1440\text{px}$, $1920\text{px}$).

### 4.3. Sensibilidade a Movimento (`prefers-reduced-motion`)
- Testar se ao emular `@media (prefers-reduced-motion: reduce)`, as animações `@keyframes conveyor` (esteira) e `@keyframes swap-*` (deslocamento vertical/horizontal) são desativadas ou simplificadas para transições instantâneas de opacidade.

### 4.4. Acessibilidade de Teclado e Foco (a11y)
- Testar se todas as ações operacionais da esteira podem ser completadas utilizando **exclusivamente o teclado** (`Tab`, `Shift+Tab`, `Enter` e `Space`), sem dependência de cliques com ponteiro do mouse.
- Garantir que o indicador de foco nativo (`focus-visible`) seja perfeitamente distinguível contra o fundo escuro `#060b1a`.

### 4.5. Prevenção de Regressões Visuais Críticas
- Prevenir a recorrência do defeito visual onde `setSelected(null)` executava antes do `setTimeout`, aplicando `"left"` a ambas as caixas na troca.
- Verificar a renderização correta de todas as webfonts (`Orbitron`, `Space Mono`, `Exo 2`) sem transições bruscas de texto não estilizado (FOUT).

---

## 5. Checklists de Definition of Done (DoD)

Para assegurar que qualquer nova contribuição mantenha a estabilidade técnica e pedagógica do repositório, os seguintes checklists devem ser rigorosamente atendidos antes da conclusão de qualquer tarefa:

---

### DoD 1 — Mudança de UI (Componentes, CSS, Estilos)
- [ ] O componente segue o padrão obrigatório de **`export default`** ([`AGENTS.md`](../../AGENTS.md)).
- [ ] Todas as tags JSX estão explicitamente fechadas e chaves balanceadas ([`AGENTS.md`](../../AGENTS.md)).
- [ ] Strings literais contendo apóstrofos utilizam aspas duplas (ex.: `"Don't"`) ([`AGENTS.md`](../../AGENTS.md)).
- [ ] O componente não introduziu arquivos `tailwind.config.*` ou `postcss.config.*`.
- [ ] A estilização respeita os tokens `@theme inline` e a tipografia estabelecida em [`05-ux-design-system.md`](./05-ux-design-system.md).
- [ ] Elementos clicáveis possuem suporte a teclado (`tabIndex={0}`, `role="button"` ou tag `<button>`).
- [ ] Não há quebra de layout em resoluções de desktop ($\ge 1024\text{px}$) e visualização de iframe no Figma Make.
- [ ] `npm run build` compila sem erros (código de saída 0).
- [ ] `npx tsc --noEmit` passa com 0 erros de tipagem.

---

### DoD 2 — Mudança de Engine (Lógica de Ordenação, FSM, Regras)
- [ ] A lógica de ordenação está desacoplada de efeitos visuais imperativos do React.
- [ ] A máquina de estados impede a seleção de pares arbitrários fora da sequência determinística do algoritmo.
- [ ] Ações incorretas geram feedback explicativo em vez de apenas validação binária.
- [ ] A fixação de elementos definitivamente ordenados (`sortedBoundary`) é computada formalmente a partir das passadas concluídas, e não por heurísticas superficiais.
- [ ] O cálculo de métricas (`comparisons`, `swaps`, `errors`, `hintsUsed`) é determinístico e auditável.
- [ ] A invariante de laço do algoritmo é estritamente preservada em todos os passos.
- [ ] `npm run build` compila sem erros.
- [ ] `npx tsc --noEmit` passa com 0 erros de tipagem.

---

### DoD 3 — Nova Fase
- [ ] O vetor da nova fase foi testado matematicamente quanto ao número mínimo e máximo de comparações e trocas.
- [ ] A quantidade de elementos não provoca estouro lateral (*horizontal overflow*) no contêiner da esteira (usar `size="sm"` se $n \ge 8$).
- [ ] O vetor possui valor didático claro (demonstra uma propriedade relevante: reversão, quase ordenado ou duplicatas).
- [ ] A matriz `PHASES` em `src/App.tsx` e as constantes de total de fases foram sincronizadas.
- [ ] A tela de resultado calcula corretamente a barra de eficiência para as grandezas da nova fase.
- [ ] `npm run build` e `npx tsc --noEmit` validados com sucesso.

---

### DoD 4 — Novo Algoritmo (Selection Sort, Insertion Sort, etc.)
- [ ] O algoritmo possui **mecânica interativa dedicada**, sem copiar a esteira de permutas locais do Bubble Sort ([`04-sorting-engine.md`](./04-sorting-engine.md)).
- [ ] Foi implementada uma estratégia desacoplada compatível com a interface `SortingStrategy`.
- [ ] O bloco de pseudocódigo correspondente foi redigido e sincronizado com os passos do novo protocolo.
- [ ] Foram definidos os estados visuais específicos (ex.: scanner de mínimo no Selection Sort; pacote elevado no Insertion Sort).
- [ ] O tutorial explicativo correspondente foi elaborado antes da liberação do gameplay.
- [ ] Foi criado ou atualizado um ADR formal documentando a integração do novo algoritmo.
- [ ] `npm run build` e `npx tsc --noEmit` validados com sucesso.
