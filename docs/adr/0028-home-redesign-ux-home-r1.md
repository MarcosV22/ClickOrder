# ADR 0028: Redesign da Tela Inicial / Menu Principal (UX-HOME-R1)

## Status
Aceito e Implementado

## Data
17/11/2026

## Contexto
Após a implementação e validação técnica do piloto Bubble Sort V2 (ADR 0027), testes informais com estudantes e professores indicaram que a tela inicial da plataforma (`HomeScreen`) ainda gerava fricção cognitiva na entrada:
1. Parecia mais um "painel de controle técnico" ou dashboard industrial carregado do que uma plataforma educacional convidativa;
2. Concorriam múltiplos botões com mesmo peso visual, textos operacionais longos e elementos com excesso de brilho/ruído de fundo;
3. O usuário demorava para identificar a resposta para as três perguntas fundamentais:
   - *O que é isso?*
   - *O que eu faço primeiro?*
   - *Onde eu clico para começar?*

## Decisão de Arquitetura e UX
Redesenhar integralmente a `HomeScreen` e decompor sua estrutura em seções funcionais e escaneáveis:

1. **Seção A (Hero / Apresentação Educacional - `HomeHero.tsx`):**
   - Crachá educacional superior: `Plataforma Educacional • Aprendizado Ativo`;
   - Título principal limpo em degradê Orbitron (`SORTING STATION`);
   - Subtítulo direto: *"Aprenda algoritmos de ordenação na prática, passo a passo."*;
   - Proposta de valor humana em 1-2 linhas sobre aprendizado ativo na esteira;
   - Callout com orientação explícita para iniciantes: *"Primeira vez aqui? Recomendamos começar pelo Bubble Sort com o tutorial interativo."*;
   - CTA primário largo e evidente: `[ COMEÇAR PELO BUBBLE SORT ▶ ]`;
   - CTA secundário com rolagem suave: `[ COMO FUNCIONA ↓ ]`.

2. **Seção B (Como Funciona - `HomeHowItWorks.tsx`):**
   - Três passos ilustrados e numerados (`01. Escolha o Método`, `02. Entenda a Lógica`, `03. Pratique na Esteira`) ancorados por id `#como-funciona`.

3. **Seção C (Retomada Condicional de Progresso - `HomeContinueCard.tsx`):**
   - Renderizado apenas quando `overallProgress.hasAnyProgress === true`;
   - Calcula através de `getStationOverallProgress(saveData)` o total de práticas concluídas sobre o currículo (X de 12), porcentagem e recomendação contextual da próxima prática pendente;
   - Botão direto `[ CONTINUAR TREINAMENTO ▶ ]` (sem colidir com o contrato de busca de `INICIAR TREINAMENTO` nos testes dos cards).

4. **Seção D (Catálogo de Módulos - `ProtocolCard.tsx`):**
   - Mantém o alinhamento estrito via CSS Grid Subgrid (4 linhas) nos cards;
   - Destaca o Bubble Sort com o selo `★ RECOMENDADO`;
   - Apresenta chips compactos de tópicos práticos (`metadata.practiceItems`);
   - Bloco de progresso sintetizado (`Práticas: X de Y`, `Tutorial: CONCLUÍDO/PENDENTE`);
   - Hierarquia clara de botões: Primário largo full-width `INICIAR TREINAMENTO` + Grid de 2 colunas para botões secundários `TUTORIAL` e `DEMONSTRAÇÃO`;
   - Mantém slot inferior exclusivo para o Modo Desafio do Bubble Sort.

5. **Seção E (Rodapé Educacional):**
   - Síntese da missão acadêmica e indicação explícita de operação 100% local e interativa (sem necessidade de backend ou login).

6. **Atenuação Visual do Fundo:**
   - Redução da opacidade das esteiras decorativas de fundo de 0.22 para 0.08, diminuindo o ruído concorrente.

## Consequências
- **Positivas:**
  - Resposta imediata (< 5s) às três perguntas centrais de entrada;
  - Redução drástica da sobrecarga visual e cognitiva;
  - Navegação desktop-first aderente à Scrollable Screen Rule (`min-h-screen overflow-y-auto pb-16 sm:pb-24`);
  - $100\%$ de retrocompatibilidade com motores de teste e fluxos de integração existentes (todos os 668 testes verdes);
  - Desacoplamento limpo em subcomponentes reutilizáveis em `src/screens/home/`.
- **Negativas / Limitações:**
  - A validação pedagógica com alunos e professores deve ser reaplicada na próxima rodada formativa para coletar evidências empíricas de usabilidade na entrada da plataforma.
