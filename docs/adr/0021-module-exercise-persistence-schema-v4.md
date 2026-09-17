# ADR 0021: Persistência Orientada a Módulos e Exercícios (Schema v4), Migração v3->v4 e Ativação Pública do Insertion Sort

- **Status:** Aceito
- **Data:** 2026-09-17
- **Autores:** Marcos Mendes / Antigravity AI
- **Decisores:** Mantenedores da Plataforma Sorting Station
- **Consulta Obrigatória:** ADR 0006, ADR 0007, ADR 0015, ADR 0018, ADR 0019, ADR 0020, `AGENTS.md`

---

## 1. Contexto e Declaração do Problema

Com a transição arquitetural de jogo monolítico para plataforma educacional modular (ADR 0018) e a conclusão das camadas pedagógica, tutorial e de práticas do Insertion Sort (ADR 0019, ADR 0020), o modelo de persistência vigente — **Schema v3** (ADR 0015) — atingiu seu limite conceitual.

O Schema v3 apresentava as seguintes fricções:
1. **Acoplamento à Semântica de Fases:** Modelava o progresso como `campaign` e `phases` (números inteiros 1, 2, 3) atrelados a protocolos específicos, impedindo a representação natural de conjuntos de exercícios (`exerciseSets`), práticas guiadas e atividades curriculares;
2. **Tentação Anti-Pattern de Extensão Direta:** Adicionar um campo `protocols.insertion` ao Schema v3 perpetuaria o modelo obsoleto de "campanha com 3 fases lineares", colidindo com a arquitetura de práticas pedagógicas deliberadas do Insertion Sort;
3. **Chave de Storage Versionada e Instável:** A chave `sorting_station_v1_save` mantinha um número de versão em sua nomenclatura física, gerando acoplamento indevido;
4. **Duplicidade de Fontes de Verdade:** No Schema v3, os nós top-level `campaign` e `records` atuavam como aliases diretos de `protocols.bubble`, gerando risco contínuo de dessincronização;
5. **Necessidade de Ativação do Módulo:** O Insertion Sort permanecia marcado como `coming_soon` no Hub curricular (`PROTOCOL_CATALOG`), aguardando persistência resiliente, homologação dos recordes e suporte a recarregamento de página (F5).

---

## 2. Decisão Arquitetural

Decidiu-se:

### 2.1. Adoção do Schema v4 como Fonte Canônica Única
O schema formal evolui para a versão `4`, abandonando em sua raiz os conceitos estruturais de `protocol`, `campaign`, `phase`, `highestPhaseReached` e `unlockedPhases`. A única fonte de verdade passa a ser a coleção imutável `modules`:

```typescript
export interface GameSaveSchemaV4 {
  readonly schemaVersion: 4;
  readonly lastUpdated: string;
  readonly preferences: GlobalPreferences;
  readonly modules: Partial<Record<ModuleId, ModuleProgressV4>>;
}

export interface ModuleProgressV4 {
  readonly completedTutorial: boolean;
  readonly exerciseSets: Record<string, ExerciseSetProgressV4>;
}

export interface ExerciseSetProgressV4 {
  readonly completed: boolean;
  readonly completedAt?: string;
  readonly bestRecord?: ExerciseRecordV4;
}

export interface ExerciseRecordV4 {
  readonly bestScore: number;
  readonly bestScoreErrors: number;
  readonly bestScoreHintsUsed: number;
  readonly bestScoreElapsedTimeMs: number;
}
```

### 2.2. Identificadores Canônicos de Exercícios
Cada atividade curricular possui um identificador unívoco:
- **Bubble Sort:** `bubble.practice.basic`, `bubble.practice.intermediate`, `bubble.practice.advanced`, `bubble.challenge.early-exit`;
- **Selection Sort:** `selection.practice.basic`, `selection.practice.intermediate`, `selection.practice.advanced`;
- **Insertion Sort:** `insertion.practice.basic`, `insertion.practice.intermediate`, `insertion.practice.advanced`.

### 2.3. Derivação Determinística Pura de Desbloqueios
Desbloqueios de novos exercícios não são armazenados como booleanos redundantes no storage. Eles são derivados sob demanda como funções puras:
- A prática básica de qualquer módulo está sempre desbloqueada;
- A prática intermediária é desbloqueada se a prática básica estiver concluída;
- A prática avançada é desbloqueada se a prática intermediária estiver concluída;
- O Modo Desafio (Early Exit) do Bubble Sort é desbloqueado se e somente se `bubble.practice.advanced` estiver concluído (`isChallengeModeUnlocked(saveData)`).

### 2.4. Política Estrita de Atualização de Recordes
Em estrito alinhamento com a Carta Pedagógica (ADR 0016) e com a regra de avaliação de recordes:
1. **Maior pontuação (`score`)** sempre substitui uma pontuação menor;
2. **Empate de pontuação:** A tentativa com **menor número de erros (`errors`)** substitui o recorde anterior (desempate por precisão conceitual);
3. **Empate de pontuação e erros:** O tempo de execução **NUNCA** desempata nem incentiva pressa mecânica;
4. Tentativas incompletas ou interrompidas não substituem registros prévios.

### 2.5. Estabilização da Chave de Armazenamento
Define-se `STORAGE_KEY = "sorting_station_save"` como a chave estável e perene.
Para proteger o progresso existente dos estudantes, a camada de persistência implementa leitura com fallback automático a partir de `LEGACY_STORAGE_KEY = "sorting_station_v1_save"`. Qualquer gravação subsequente grava exclusivamente na chave canônica estável.

### 2.6. Pipeline de Migração Sequencial e Idempotente
O pipeline de validação suporta:
- $v1 \rightarrow v2 \rightarrow v3 \rightarrow v4$
- $v2 \rightarrow v3 \rightarrow v4$
- $v3 \rightarrow v4$
- $v4$ sanitização nativa direta com fallback para estado padrão em caso de corrupção.

Durante a migração de v3 para v4, fases 1, 2 e 3 de Bubble e Selection são mapeadas com preservação integral de timestamps, recordes e status de tutorial para os respectivos `exerciseSetIds`.

### 2.7. Adaptadores de Compatibilidade Deliberados
Para preservar a estabilidade das telas legadas de Bubble e Selection sem introduzir refactors precipitados fora de escopo:
- A função pura `getProtocolProgress(saveData, protocolId)` projeta sob demanda o formato `ProtocolProgress` (`unlockedPhases`, `highestPhaseReached`, `records`);
- `recordPhaseCompletion` traduz requisições de fase para os respectivos `exerciseSetIds` e persiste no Schema v4;
- **Não são criados aliases de compatibilidade dentro do objeto Schema v4**, garantindo uma única fonte de verdade.

### 2.8. Ativação Pública do Módulo Insertion Sort
Com a persistência homologada e a cobertura de testes concluída:
- Em `src/screens/protocolCatalog.ts`, o Insertion Sort é ativado de `coming_soon` para `available`;
- O Modo Demonstração é ativado de `coming_soon` para `available`;
- O tema visual do card passa a operar com paleta âmbar vibrante ativa (`border-amber-500/30`, glow âmbar, tipografia destacada);
- As rotas do Hub direcionam o estudante ao Briefing Canônico, Tutorial Interativo e Práticas Progressivas.

---

## 3. Consequências e Invariantes

1. **Extensibilidade Imediata:** Novos módulos futuros (Merge Sort, Quick Sort) podem ser adicionados ao Schema v4 sem qualquer alteração na raiz do schema ou impacto nos módulos existentes;
2. **Semântica Pedagógica Correta:** A persistência reflete a realidade educacional da plataforma (exercícios deliberados e maestria conceitual) em vez de metáforas restritivas de fases de videogame;
3. **Zero Poluição de Dados:** Nem seeds procedurais, nem históricos de execução (`history`), nem quadros de replay são persistidos em disco/storage; residem estritamente em memória volátil durante a sessão;
4. **Compatibilidade Transversal:** Estudantes com saves legados desde o marco P1.6 têm seu progresso automaticamente promovido para o Schema v4 sem qualquer perda de métricas ou conquistas.
