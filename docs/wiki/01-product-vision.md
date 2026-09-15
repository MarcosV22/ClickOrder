# 01 — Visão de Produto e Escopo da Plataforma

> **Documento canônico:** Visão oficial do produto, proposta pedagógica, princípios de design, delimitação curricular e governança do **Sorting Station**.  
> **Status:** Ativo / Base de Verdade da Plataforma  
> **Data de Atualização:** 15/09/2026 (Marco PLATFORM-R0)  
> **Dependências:** [`AGENTS.md`](../../AGENTS.md), [`ADR 0018`](../adr/0018-game-to-educational-platform-transition.md), [`modules/README.md`](./modules/README.md), [`10-roadmap.md`](./10-roadmap.md).

---

## 1. Visão Geral e Redefinição Oficial do Produto

O **Sorting Station** é oficialmente definido como:

> **"Plataforma educacional interativa e gamificada para aprendizagem, prática e visualização de algoritmos de ordenação."**

O produto **NÃO** é arquitetado primordialmente como um simples jogo de fases soltas. Sua missão central é constituir um ambiente didático de alta fidelidade para o ensino superior e técnico de Ciência da Computação, estruturado em torno de **Módulos Curriculares de Algoritmos**.

A identidade visual de **Central Logística Espacial/Industrial** permanece como a metáfora visual e a camada de gamificação do produto, transformando a manipulação abstrata de vetores matemáticos em uma experiência cinestésica tátil e imersiva:

$$\text{Ação do Estudante} \longrightarrow \text{Metáfora da Esteira} \longrightarrow \text{Engine do Algoritmo} \longrightarrow \text{Pseudocódigo Sincronizado} \longrightarrow \text{Feedback Formativo}$$

---

## 2. O Problema Educacional Abordado

O ensino de algoritmos de ordenação em cursos de graduação e tecnologia depara-se sistematicamente com desafios epistemológicos:

1. **Abstração Excessiva e Desconexão Tátil:** Estudantes novatos enfrentam barreiras cognitivas para traduzir laços aninhados (`for/while`), índices de ponteiros (`i`, `j`, `minIndex`) e operações de memória em transformações espaciais sobre os dados.
2. **Passividade dos Visualizadores Tradicionais:** Simuladores baseados em apertar "Play" e assistir a animações automáticas geram a chamada **ilusão de profundidade explanatória** (*illusion of explanatory depth*): o aluno assiste ao algoritmo rodando e crê que o domina, mas fracassa na hora de rastreá-lo ou reproduzir suas invariantes.
3. **Desconexão com a Sintaxe Formal:** Materiais expositivos costumam isolar a teoria assintótica e o pseudocódigo em slides estáticos, sem mostrar qual instrução específica está sendo executada a cada micro-passo.
4. **Ansiedade com Sintaxe de Programação:** Alunos iniciantes frequentemente desviam sua atenção cognitiva para resolver erros de compilação ou sintaxe de linguagens específicas, perdendo o foco na lógica relacional do algoritmo.

---

## 3. Proposta de Valor e Modelo Pedagógico da Plataforma

A proposta central do **Sorting Station** é a **aprendizagem ativa por manipulação direta com andaime cognitivo (*scaffolding*)**:

- **Agência com Validação Rigorosa:** O estudante assume o controle ativo das decisões operacionais (eleger pares, decidir se permuta ou mantém, identificar o menor elemento, suspender chaves ou particionar em torno de pivôs). A engine algorítmica valida a ação contra o modelo matemático formal.
- **Rastreamento Cognitivo em Camadas Sincronizadas:** A interface conecta em tempo real o objeto físico manipulado (caixa na esteira), a métrica descritiva (comparações e trocas), o pseudocódigo formal sincronizado e a justificativa formativa do passo.
- **Sem Atrito de Sintaxe:** O formato de manipulação direta via navegador elimina barreiras de digitação, concentrando o esforço mental na compreensão da lógica do algoritmo.
- **Modos Observacional e Prático Integrados:** A plataforma oferece tanto a observação autônoma da execução perfeita ([`Modo Demonstração`](./03-frontend.md)) quanto a prática assistida ([`Tutorial`](./modules/README.md)), a prática progressiva e a reflexão retrospectiva ([`Replay`](./03-frontend.md)).

> [!NOTE]
> **Ressalva Metodológica Obrigatória:** O repositório trata o ganho de aprendizagem como **hipótese pedagógica de design**. Em estrito respeito ao rigor acadêmico, não se registram alegações empíricas prévias sem a realização de ensaios formais com estudantes reais.

---

## 4. A Unidade Curricular Canônica: Módulo de Algoritmo

A plataforma abandona a terminologia de "níveis de jogo" como unidade primária e adota a arquitetura de **Módulos Curriculares**.  
O currículo do Sorting Station é congelado em **6 Módulos Oficiais**:
1. **Bubble Sort:** Trocas locais de pares vizinhos e flutuação gradual do maior. (`IMPLEMENTADO`)
2. **Selection Sort:** Scanner de menor carga da partição e permuta única de consolidação. (`IMPLEMENTADO`)
3. **Insertion Sort:** Trilho suspenso com chave elevada, deslocamento regressivo e encaixe na lacuna. (`PLANEJADO` — P2.2)
4. **Merge Sort:** Divisão em sub-esteiras paralelas e intercalação ordenada com dois ponteiros. (`FUTURO` — P3.1)
5. **Quick Sort:** Eleição de pivô luminoso e particionamento bilateral in-place. (`FUTURO` — P3.2)
6. **Heap Sort:** Pirâmide hierárquica (max-heap) e extração sucessiva da raiz. (`FUTURO` — P3.3)

---

## 5. Reposicionamento da Gamificação e Camada Narrativa

Para assegurar foco acadêmico e evitar ruído lúdico excessivo:

- **Gamificação Central (Preservada e Essencial):** A metáfora da esteira transportadora, as caixas tecnológicas iluminadas por neon, os controles táteis, as translações animadas e o cálculo da **Pontuação do Protocolo** constituem a camada de engajamento primária, mantendo o ambiente estimulante e cinestésico.
- **Camada Narrativa (Movida para Backlog Opcional de Gamificação):** Enredos diegéticos secundários (histórias de supervisores robóticos, ordens de serviço corporativas e diálogos de personagens) são formally dissociados da arquitetura curricular. Sua implementação é estritamente opcional e submetida à prioridade dos módulos educacionais e do laboratório comparativo.
- **Nomenclatura Diegética na UI:** Termos como *"Protocolo Bubble"* ou *"Terminal de Triagem"* são autorizados na interface do usuário (UI) para fins de imersão estilizada, mas a arquitetura interna e a documentação utilizam a terminologia canônica: **Plataforma, Módulo, Exercício e Caso**.

---

## 6. Diferenciação Fundamental: "Ordenar Números" vs. "Executar um Algoritmo"

| Critério | Quebra-Cabeça Comum de Ordenação | Plataforma Educacional Sorting Station |
| :--- | :--- | :--- |
| **Objetivo do Estudante** | Deixar os números em ordem crescente de forma livre. | Compreender e executar fielmente o procedimento formal daquele algoritmo específico. |
| **Ordem de Ações** | Livre, arbitrária ou intuitiva (trocar qualquer par que chamar a atenção). | Determinística e estruturada (governada pela FSM da engine, respeitando passada, ponteiros e invariantes). |
| **Consciência de Passadas** | O usuário não sabe em qual ciclo está nem quando uma vaga é final. | A interface exibe a passada atual e sela visualmente caixas consolidadas com a blindagem `OK`. |
| **Custo Computacional** | Trocas supérfluas são irrelevantes se o vetor ficar ordenado. | A plataforma evidencia o custo de cada comparação e troca, registrando telemetria descritiva. |
| **Valor Pedagógico** | Mínimo (apenas memorização de ordem numérica). | Alto (assimilação de invariantes de laço, complexidade assintótica e fluxo de controle). |

---

## 7. Princípios de Produto da Plataforma

Qualquer alteração, componente, tela ou módulo adicionado ao Sorting Station deve respeitar rigorosamente os **8 Princípios de Produto**:

1. **Ação Precede a Abstração:** O estudante deve manipular os elementos e vivenciar o comportamento físico antes de ser submetido à notação matemática formal.
2. **O Algoritmo Governa o Sistema, Não a Intuição Arbitrária:** A mecânica de interação deve espelhar fielmente a invariante de laço daquele algoritmo. Não são permitidos atalhos que descaracterizem o método.
3. **O Erro é Diagnóstico e Formativo, Nunca Punitivo:** Erros de ordenação interrompem o avanço com mensagens conceituais explicativas, permitindo a retificação imediata sem penalidades catastróficas.
4. **Feedback Explicativo em Vez de Validação Binária:** O sistema nunca se limita a dizer "Certo" ou "Errado"; ele expõe a regra lógica violada ou confirmada.
5. **Estética Sci-Fi como Facilitadora Cognitiva:** A ambientação industrial e a iluminação neon são projetadas para diferenciar estados operacionais com clareza e manter o engajamento sem sobrecarga visual.
6. **Manipulação Tátil Direta Sem Atrito de Sintaxe:** Toda a interação fundamental ocorre via clique/toque ou navegação por teclado acessível, eliminando barreiras de compilação.
7. **Cada Algoritmo Possui Mecânica Singular (Proibição de *Skins* Genéricas):** Novos algoritmos devem apresentar controles e metáforas adaptados à sua operação real (scanner para Selection, trilho suspenso para Insertion, confluência para Merge, farol para Quick, pirâmide para Heap).
8. **Honestidade Acadêmica e Rigor Metodológico:** A documentação e o código devem reportar estritamente o estado real do software e das avaliações pedagógicas, abstendo-se de alegar eficácia empírica não comprovada.
