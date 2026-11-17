# ADR 0029: Redesign Radical da Home como Launcher Educacional Visual (UX-HOME-R2)

## Status
Aceito e Implementado

## Data
17/11/2026

## Contexto
Embora o marco UX-HOME-R1 tenha estruturado a tela inicial em seções mais organizadas, a inspeção visual e feedbacks continuavam apontando fricção cognitiva incompatível com o princípio fundamental do projeto: **Clareza Infantil sem Infantilização**.
Persistiam os seguintes problemas:
1. Texto institucional excessivo antes da primeira ação;
2. Seção "Como Funciona" com 3 cards grandes ocupando altura útil da tela;
3. Excesso de botões concorrentes dentro de cada card (`INICIAR TREINAMENTO`, `TUTORIAL`, `DEMONSTRAÇÃO`);
4. Pouca demonstração **visual** e imediata do que cada algoritmo realmente faz;
5. Aparência mista de landing page de marketing com dashboard analítico;
6. Inclusão prematura de módulos congelados (Merge Sort).

## Decisão de Arquitetura e UX
Reconstruir a tela inicial (`HomeScreen.tsx`) como um **Launcher Educacional Visual**, focado estritamente em responder em menos de 5 segundos:
- *Para que serve isso?* (Aprender algoritmos de ordenação visualmente);
- *Quais são as três opções?* (Bubble Sort, Selection Sort, Insertion Sort);
- *Qual delas devo abrir primeiro?* (Bubble Sort, marcado discretamente como `Recomendado`);
- *Onde clico?* (Um único botão de CTA por card: `COMEÇAR` ou `CONTINUAR`).

### 1. Header Compacto (`HomeHeader.tsx`)
- Logo tipográfico reduzido em 25–35% (`text-3xl sm:text-4xl md:text-5xl`);
- Subtítulo em linha única: *"Aprenda algoritmos de ordenação visualmente."*;
- Remoção total de parágrafos institucionais longos, callouts redundantes ("Primeira vez aqui?") e CTAs duplicados no cabeçalho.

### 2. Faixa Compacta de Processo (`HomeProcessStrip.tsx`)
- Substituição dos cards metodológicos grandes por uma faixa em cápsula horizontal (< 45px de altura);
- 3 passos simples com ícones SVG puros (sem emojis): `ESCOLHA um algoritmo` → `APRENDA como funciona` → `PRATIQUE passo a passo`.

### 3. Delimitação Estrita do Currículo Visível na Home
- Restrição aos 3 módulos centrais: **Bubble Sort**, **Selection Sort** e **Insertion Sort**;
- Total curricular visível de 9 práticas regulares (3 por módulo);
- **Merge Sort congelado e terminantemente ausente da Home** (sem cards "Em Breve" ou ruído visual adicional);
- Adaptação de `getStationOverallProgress` para computar o progresso global apenas sobre `ACTIVE_LAUNCHER_MODULES` (9 práticas e 3 tutoriais).

### 4. Cards Educacionais com Mini Visual da Mecânica (`LearningModuleCard.tsx`)
- Altura controlada (~280–360px), encaixando-se ergonomicamente em resoluções desktop padrão (1366×768, 1600×900, 1920×1080);
- **Mini visual da mecânica** com recipientes escuros, caixas numéricas estilizadas e acessibilidade (`role="img"`, `aria-label` completo):
  - **Bubble:** Comparação e troca de par vizinho `[ 8 ] [ 3 ] ➔ [ 3 ] [ 8 ]` + legenda *"Compare vizinhos."*;
  - **Selection:** Busca e destaque do menor valor `[ 4 ] [ 1 (min) ] [ 7 ] ➔ [ 1 ] [ 4 ] [ 7 ]` + legenda *"Encontre o menor."*;
  - **Insertion:** Encaixe da chave na seção ordenada `[ 2 ] [ 5 ] [ 3 (key) ] ➔ [ 2 ] [ 3 ] [ 5 ]` + legenda *"Encaixe cada elemento."*;
- **Progresso minimalista:** texto compacto (`X de 3 práticas`) e 3 pontos visuais (`● ● ○`);
- **CTA Único por Card:** exatamente 1 botão de ação primária:
  - `[ COMEÇAR ]` se 0 práticas concluídas;
  - `[ CONTINUAR ]` se houver prática concluída;
  - Ausência de botões secundários ruidosos (tutoriais, demonstrações e desafios são acionados dentro da visão geral do módulo).

### 5. Retomada de Progresso Não Invasiva
- Substituição do card grande anterior por uma faixa sutil de 1 linha: *"Sessão em andamento: [Módulo] (Prática) • Continuar →"*;
- Renderizada apenas quando houver progresso factual.

### 6. Atenuação de Fundo e Rodapé
- Opacidade das esteiras decorativas de fundo reduzida para 0.06;
- Rodapé minimalista com apenas duas linhas informativas.

## Consequências
- **Positivas:**
  - Cumprimento rigoroso da Regra dos 5 Segundos de cognição educacional;
  - Desaparecimento da sensação de "dashboard/landing page" e emergência de um launcher educacional limpo;
  - Diferença conceitual e mecânica entre os algoritmos imediatamente perceptível antes do clique;
  - Eliminação de escolhas concorrentes prematuras para o aluno;
  - Manutenção de 100% de cobertura e estabilidade técnica (52 arquivos de teste, 673 testes verdes, TypeScript sem erros, build Vite verde em ~550ms).
- **Negativas / Limitações:**
  - O acesso ao Merge Sort em ambiente de testes ou desenvolvimento passa a ser feito via inicialização controlada de props (`initialScreen="briefing"` / `initialModule="merge"`), preservando seu congelamento no produto voltado aos estudantes.
