# 0020. Sistema de Práticas Interativas do Módulo Insertion Sort e Transição para Arquitetura de Exercícios

* **Status:** Aceito
* **Data:** 15/09/2026
* **Autor:** Antigravity AI
* **Contexto de Engenharia:** Marco P2.2-D — Implementação da Prática Interativa do Módulo Insertion Sort

---

## 1. Contexto e Motivação

O marco **PLATFORM-R0** e o [ADR 0018](./0018-game-to-educational-platform-transition.md) estabeleceram a transição conceitual do *Sorting Station* de um jogo isolado com fases para uma **plataforma educacional curricular**. O Insertion Sort é o primeiro algoritmo desenvolvido integralmente sob essa nova visão orientada a exercícios.

No modelo legado (Bubble Sort e Selection Sort), os algoritmos utilizavam terminologia de "Campanha" e "Fases 1, 2 e 3". Para o Insertion Sort, era mandatória a ruptura com essa nomenclatura:
1. Banimento absoluto de "fase" e "campanha" na interface e APIs do novo módulo;
2. Adoção da taxonomia curricular de práticas: **Prática Básica** ($n=4$), **Prática Intermediária** ($n=5$) e **Prática Avançada** ($n=6$);
3. Catálogo desacoplado de exercícios baseado em identificadores tipados (`insertion.practice.basic`, `insertion.practice.intermediate`, `insertion.practice.advanced`);
4. Mecânica interativa singular com trilho aéreo suspenso para a chave, modelo de vaga única na esteira (`InsertionHoleSlot`), invariant de ordenação parcial estrita (`ORD`), papel semântico composto (`ORD • SCAN`) e telemetria descritiva (comparações, deslocamentos e inserções — proibição de "trocas").

---

## 2. Decisões Arquiteturais

### 2.1. Nomenclatura Formal e Catálogo de Práticas (`practiceCatalog.ts`)
- Definida a união discriminada `InsertionPracticeLevel = "basic" | "intermediate" | "advanced"`.
- As constantes de dimensão foram padronizadas em `INSERTION_PRACTICE_LENGTHS = { basic: 4, intermediate: 5, advanced: 6 }`.
- O catálogo de práticas `INSERTION_PRACTICE_CATALOG` centraliza metadados didáticos (título, descrição, tamanho e restrições) sem dependência de números mágicos na camada de apresentação.
- O gerador procedural foi renomeado para `generateInsertionPracticeArray(level, seed)`.

### 2.2. Interface de Prática (`InsertionGameScreen.tsx`) e Fonte Única da Verdade
- A engine pura (`insertionSortEngine.ts`) é a fonte exclusiva da verdade para todo o estado algorítmico (`currentValues`, `key`, `holeIndex`, `orderedBoundary`, `j`, `phase`, `completed`).
- **Trilho Aéreo Suspenso:** A chave permanece suspensa acima da esteira quando `key !== null`, identificada visualmente por halo âmbar e badge `CHAVE`.
- **Modelo de Vaga Única:** A posição da vaga na esteira é renderizada através de `InsertionHoleSlot.tsx`. A caixa `NumberedBox` nunca recebe valor nulo.
- **Invariante `ORD` e Papel `ordered-scan`:**
  - Somente caixas preenchidas com índice $\le \text{orderedBoundary}$ recebem o badge `ORD`. A vaga nunca recebe `ORD`, mesmo estando à esquerda da fronteira.
  - Quando o scanner $j$ examina uma carga pertencente à sub-esteira ordenada, `NumberedBox` recebe o papel semântico `"ordered-scan"`, combinando fundo verde translúcido e borda ciano pulsante com o badge textual `ORD • SCAN`.
- **Expressão Relacional Formal:** O painel interrogativo apresenta a condição exata:
  - Em `COMPARE_AND_SHIFT`: `$A[j]\ (X) > \text{CHAVE}\ (K)\ ?$`, sem antecipar a resposta;
  - Em `INSERT_READY`: `$j < 0 \bullet \text{CABECEIRA ALCANÇADA}$`.
- **Botoeira Canônica e Action Locks:**
  - Botoeira via `GameButton.tsx`: `[ ➔ DESLOCAR CARGA ]` (desabilitado em `INSERT_READY`) e `[ ⇣ ENCAIXAR CHAVE ]`.
  - Banimento do emoji `💡` em favor do símbolo tipográfico `?` no botão de dicas.
  - Bloqueio síncrono de interações via `isActionLockedRef` durante transições e animações cinestésicas.

### 2.3. Telemetria e Desacoplamento de Métricas
- Eliminação total da métrica "Trocas" no contexto do Insertion Sort. As grandezas factuais exibidas são estritamente: Comparações, Deslocamentos (*shifts*), Inserções (*insertions*), Erros Pedagógicos e Dicas Utilizadas.
- O tempo decorrido é puramente descritivo, possuindo peso zero na avaliação.
- A pontuação do protocolo é avaliada transversalmente por:
  $$\text{score} = \max(0, 100 - (\text{errors} \times 10) - (\text{hintsUsed} \times 5))$$

### 2.4. Tela de Resultado e Conclusão de Conjunto de Práticas
- `ResultScreen.tsx` foi estendida para suportar `protocol="insertion"`:
  - Título hero: `EXERCÍCIO CONCLUÍDO!`;
  - Exibição de Deslocamentos e Inserções com paleta temática âmbar/púrpura;
  - Pseudocódigo formal canônico de 11 linhas com iluminação das linhas ativas;
  - Reflexão pedagógica formal sobre a adaptabilidade do algoritmo e o deslocamento seletivo de cargas.
- Implementado o componente `PracticeSetCompleteScreen.tsx` para encerramento do conjunto regular de práticas (`basic` $\rightarrow$ `intermediate` $\rightarrow$ `advanced`), consolidando estatísticas agregadas e exibindo os 3 vetores ordenados finais.

### 2.5. Persistência e Volatilidade
- Conforme planejado para o marco P2.2-D, o progresso do Insertion Sort permanece estritamente em memória de sessão.
- O Schema v3 no `localStorage` permanece 100% inalterado até o marco P2.2-F.
- No catálogo da Home (`HomeScreen`), o cartão do Insertion Sort permanece marcado como `coming_soon` / `EM IMPLEMENTAÇÃO`.

---

## 3. Consequências e Resultados

* **Positivas:**
  1. Consolidação da plataforma orientada a exercícios sem poluição de termos legados ("fase"/"campanha");
  2. Experiência de manipulação direta fidedigna ao modelo mental formal do algoritmo (chave suspensa + vaga deslizante);
  3. Total ausência de ambiguidades entre permuta (*swap*) e deslocamento (*shift*);
  4. Suíte de testes automatizados expandida para **368 testes verdes (100% de sucesso)**, sem quebra de regressão nos protocolos Bubble e Selection.

* **Negativas / Riscos Mitigados:**
  - Telas legadas de Bubble e Selection continuam utilizando wrappers de campanha para manter retrocompatibilidade estrita sem quebras.
