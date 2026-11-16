# ADR 0027: Redesenho Integral da Experiência Educacional e da Interface (UX/UI V2)

- **Status:** Aceito
- **Data:** 2026-11-16
- **Autores:** Equipe de Design Educacional e Arquitetura de Software do Sorting Station
- **Decisores:** Mantenedores Técnicos e Pedagógicos do Projeto

---

## 1. Contexto e Declaração do Problema

Durante a evolução dos marcos `PLATFORM-R0` a `LEARNING-R3-A`, o Sorting Station consolidou uma infraestrutura robusta: engines puras imutáveis, persistência determinística no Schema v4, 650 testes automatizados com 100% de aprovação no Vitest, e um currículo transversal com 6 módulos previstos.

Contudo, testes informais e formativos de usabilidade conduzidos com alunos e professores revelaram um diagnóstico crítico e convergente:
1. **Sobrecarga e Confusão Visual:** A plataforma apresenta volume excessivo de informações concorrentes na mesma tela (múltiplas métricas, badges semânticos, cabeçalhos redundantes, carrosséis de texto longo, pseudocódigo simultâneo e efeitos de iluminação/scanlines);
2. **Desorientação Focal:** É difícil para o estudante identificar em menos de 2 segundos "onde olhar" e "qual decisão tomar";
3. **Mecanização sem Compreensão:** A interface atual permite que o usuário aprenda a "clicar corretamente" nas botoeiras contextuais sem absorver o modelo mental do algoritmo (ilusão de competência operacional);
4. **Curva de Aprendizagem Dupla:** O usuário precisa primeiro "aprender a usar o Sorting Station" (decifrar dezenas de convenções de terminal, papéis de índice $i, j, \text{minIndex}$, badges e telemetrias) antes de conseguir focar no algoritmo de ordenação propriamente dito.

Diante disso, a prioridade do projeto mudou formalmente: antes de expandir novos módulos log-lineares (Merge, Quick, Heap) ou novos Casos do Algoritmo, a **experiência educacional e a interface visual precisam ser redesenhadas integralmente**.

---

## 2. Decisão Arquitetural e de Design

Decide-se:

1. **Congelamento Temporário de Expansão de Conteúdo:**
   - Merge Sort, Quick Sort, Heap Sort, Laboratório Comparativo e a expansão de novos Casos do Algoritmo ficam temporariamente **CONGELADOS**.
   - O foco exclusivo do projeto concentra-se nos três módulos centrais: **Bubble Sort**, **Selection Sort** e **Insertion Sort**.

2. **Princípio Canônico Fundamental:**
   - Adotar o axioma de **"Clareza Infantil sem Infantilização"**: a interface deve ser inteligível de imediato para qualquer novato alfabetizado sem recorrer a caricaturas, preservando o rigor conceitual mas fazendo a interface "desaparecer cognitivamente" para que o algoritmo fique em evidência absoluta.

3. **Regra de Ouro da Interface:**
   - Toda tela deve possuir **UMA AÇÃO PRINCIPAL** perceptível.
   - Em gameplay: **UM FOCO VISUAL PRINCIPAL** (a esteira com caixas grandes), **UMA PERGUNTA DIRETA**, e **DUAS (ou poucas) AÇÕES POSSÍVEIS**.
   - Regra dos 2 Segundos: o estudante deve bater o olho e saber exatamente onde focar.

4. **Hierarquia de Informação em 3 Níveis:**
   - **Nível 1 (Essencial - Sempre Visível):** Vetor/caixas, elementos ativos sob inspeção, pergunta focal do passo, botões de ação e barra de progresso simples.
   - **Nível 2 (Apoio - Sob Demanda/Contextual):** Dica contextual, explicação reflexiva e regra em linguagem natural.
   - **Nível 3 (Detalhes - Sob Demanda/Pós-Sessão):** Telemetria analítica ($C(n)$, $M(n)$, tempo descritivo), pseudocódigo formal e pontuação do protocolo. Nível 3 não concorre visualmente durante a prática ativa.

5. **Novo Ciclo de Aprendizagem Ativa:**
   - Superar o ciclo binário "sistema pergunta $\rightarrow$ aluno clica $\rightarrow$ próximo".
   - Estabelecer o modelo:
     $$\text{OBSERVAR} \longrightarrow \text{PREVER} \longrightarrow \text{AGIR} \longrightarrow \text{INTERPRETAR O RESULTADO}$$
   - Introduzir previsões leves e micro-checks de compreensão pontuais em momentos pedagogicamente relevantes, avaliados de forma determinística sem IA generativa.

6. **Feedback Causal e Formativo:**
   - Feedback em erros e acertos focado na relação de causalidade matemática em frases curtas (ex.: *"30 é maior que 20. Por isso, eles precisam trocar."*), sem penalização, sem zerar estado e com oportunidade de tentar novamente.

7. **Design System V2 Simplificado:**
   - Reduzir efeitos de distração visual (scanlines pesadas, grids agressivos, múltiplos blobs fluorescentes, scanlines estáticas).
   - Paleta cromática estritamente funcional (Ciano = Ativo/Foco, Verde = Consolidado/Correto, Âmbar = Chave/Atenção, Vermelho = Erro pós-ação, Cinza = Neutro).
   - Aumento substantivo de caixas (`NumberedBox`), tipografia e alvos de toque/clique.

8. **Estratégia de Piloto Gradual:**
   - O redesign será validado ponta a ponta primeiro no **Bubble Sort** no marco `UX-REDESIGN-R2`. Somente após validação qualitativa com usuários reais será propagado para Selection Sort (`R4`) e Insertion Sort (`R5`).

9. **Execução do Piloto Bubble Sort V2 (`UX-REDESIGN-R2`):**
   - O piloto foi integralmente implementado nas telas dedicadas `src/screens/bubble/`:
     - Visão geral do módulo: `BubbleModuleOverviewV2.tsx`;
     - Tutorial interativo com predição: `BubbleTutorialScreenV2.tsx`;
     - Prática ativa com botões simétricos, checkpoint pré-ação e micro-checagem pós-passada: `BubbleGameScreenV2.tsx`;
     - Resultado com reflexão conceitual: `BubbleResultScreenV2.tsx`;
   - A engine `bubbleSortEngine.ts` e a persistência Schema v4 permaneceram $100\%$ intocadas, confirmando o desacoplamento estrito entre a lógica do algoritmo e a camada de experiência educacional ativa.

10. **Hardening do Bubble V2 e Instrumentação para Validação Formativa (`UX-REDESIGN-R3-A`):**
   - Refinamento da hierarquia de informação: o botão de dica `[ ? Dica ]` foi realocado para o Nível 2 (cabeçalho da área de decisão), enquanto a gaveta inferior retrátil foi reservada estritamente para o Nível 3 (`"▼ Ver detalhes sob demanda"`: $i, j, n$, condição formal e pseudocódigo);
   - Instrumentação local e não-invasiva ativada exclusivamente via `?uxTest=1`: rastreia em memória métricas factuais da sessão sem dependência de rede, sem PII e sem alteração do Schema v4;
   - Formalização do protocolo canônico de pesquisa em [`docs/wiki/bubble-v2-formative-evaluation.md`](../wiki/bubble-v2-formative-evaluation.md).

---

## 3. Alternativas Consideradas

- **Alternativa A: Continuar a expansão linear do roadmap (Quick Sort, Casos e Heap Sort) e apenas refatorar CSS pontualmente.**  
  *Por que foi descartada:* Adicionar mais algoritmos e casos sobre uma fundação visual sobrecarregada aumentaria o débito cognitivo da plataforma, afastando estudantes e professores e comprometendo a futura pesquisa acadêmica.
- **Alternativa B: Reescrever completamente o backend/persistência e criar um sistema de IA generativa para tutoria conversacional.**  
  *Por que foi descartada:* Viola o princípio da simplicidade e introduz não-determinismo, latência e custos de infraestrutura desnecessários. A clareza visual e mecânica estrita governada por FSMs puras é suficiente para guiar a aprendizagem.
- **Alternativa C: Transformar o Sorting Station em um jogo casual estilizado com personagens e linguagem infantilizada.**  
  *Por que foi descartada:* O produto destina-se primordialmente ao ensino técnico e superior de Ciência da Computação. O princípio "Clareza infantil sem infantilização" rejeita qualquer simplificação caricata do rigor conceitual.

---

## 4. Consequências e Trade-offs

### 4.1. Consequências Positivas (Ganhos)
- Eliminação do atrito cognitivo inicial: estudantes e professores compreendem o objetivo de cada tela em menos de 2 segundos;
- Redução radical de cliques automáticos impensados via checkpoints leves de previsão e reflexão causal;
- Coerência visual estrita e alívio de ruído gráfico em todas as estações de trabalho;
- Preservação da integridade da infraestrutura: engines puras, gerador Mulberry32 e Schema v4 permanecem 100% reutilizáveis sem quebras.

### 4.2. Consequências Negativas ou Custos (Trade-offs)
- Abertura de um novo ciclo de marcos prioritários (`UX-REDESIGN-R1` a `R7`), postergando temporariamente a entrega de Merge/Quick/Heap e do Laboratório Comparativo;
- Necessidade de atualizar documentação de telas, design system e especificações de interface na Wiki.

---

## 5. Riscos e Mitigações

| Risco Identificado | Severidade | Estratégia de Mitigação |
| :--- | :--- | :--- |
| **Quebra de testes existentes por alteração de texto/seletores** | Média | O marco R1 é puramente de especificação e design. O marco R2 alterará telas com refatoração cuidadosa dos testes comportamentais sem tocar nas engines puras. |
| **Perda da identidade visual diegética da Central Logística** | Média | A metáfora da Central Logística é preservada em elementos essenciais (caixas, esteira, scanner), removendo apenas excessos que competiam com a legibilidade. |
| **Supressão excessiva de pseudocódigo prejudicar formalismo** | Baixa | Pseudocódigo é mantido central no Modo Demonstração e Replay, e fica acessível sob demanda via botão ou gaveta durante a prática ativa. |
| **Alegações empíricas prematuras** | Alta | A documentação mantém redação estritamente não-presuntiva ("busca apoiar", "fornece oportunidade de observar"). |

---

## 6. Links e Referências

- **Documento Canônico de Especificação:** [`docs/wiki/ux-redesign-v2.md`](../wiki/ux-redesign-v2.md)
- **Design System Relacionado:** [`docs/wiki/05-ux-design-system.md`](../wiki/05-ux-design-system.md)
- **Roadmap da Plataforma:** [`docs/wiki/10-roadmap.md`](../wiki/10-roadmap.md)
- **ADRs Anteriores:** [`ADR 0018`](./0018-game-to-educational-platform-transition.md), [`ADR 0022`](./0022-canonical-exercise-module-standardization.md), [`ADR 0025`](./0025-curriculum-practice-differentiation-and-transversal-model.md), [`ADR 0026`](./0026-algorithm-case-architecture-and-activity-context.md).
