# ADR 0015: Persistência Multi-Protocolo (Schema v3) e Conclusão do Selection Sort

- **Status:** Aceito
- **Data:** 2026-09-14
- **Autores:** Marcos Mendes / Antigravity AI
- **Decisores:** Mantenedores do Sorting Station

---

## 1. Contexto e Declaração do Problema

Com a conclusão das etapas pedagógica (P2.1-C), de gameplay (P2.1-D) e de replay sincronizado (P2.1-E) do Selection Sort, restava a consolidação da persistência de longo prazo (marco **P2.1-F**).

A persistência do jogo (definida originalmente no ADR 0006 e evoluída para Schema v2 no ADR 0007) possuía as seguintes limitações estruturais:
1. **Centrada Implicitamente no Bubble Sort:** Os nós de topo `campaign` e `records` assumiam exclusivamente o ciclo de fases do Bubble Sort;
2. **Risco de Poluição com IDs Artificiais:** Abordagens ingênuas poderiam introduzir IDs sintéticos ou mágicos (ex.: 101, 201) para representar fases de novos algoritmos, violando a clareza conceitual de que cada protocolo possui suas próprias Fases 1, 2 e 3;
3. **Necessidade de Persistência do Selection Sort:** O Selection Sort necessita persistir de forma durável:
   - Status de conclusão do tutorial interativo (`hasCompletedTutorial`), dispensando sua repetição após recarregamento (F5);
   - Desbloqueio progressivo de fases (Fases 1 a 3) e maior fase histórica alcançada;
   - Recordes factuais por fase (`bestScore`, `bestScoreErrors`, `bestScoreHintsUsed`, `bestScoreElapsedTimeMs`), atualizados estritamente pela regra canônica de precisão;
4. **Isolamento de Progresso e Segurança de Migração:** Saves legados (v1 e v2) presentes nos navegadores dos alunos jamais devem ser corrompidos ou descartados; a migração deve ser determinística, testável e sem perda de dados;
5. **Volatilidade do Replay:** Quadros de replay (`SelectionStepRecord[]`, `frames`, `initialArray`, `seed`) são recursos pesados de auditoria retrospectiva da sessão e devem residir exclusivamente na memória volátil (RAM), nunca inflando o `localStorage`.

---

## 2. Decisão Arquitetural

Decidiu-se:

### 2.1. Estrutura do Schema v3 (`src/game/persistence/types.ts`)
Evoluir o schema formal de persistência para a versão `3`:

```typescript
export interface ProtocolProgress {
  readonly unlockedPhases: number;
  readonly highestPhaseReached: number;
  readonly hasCompletedTutorial: boolean;
  readonly records: Record<number, PhaseRecord>;
}

export interface GameSaveSchema {
  readonly schemaVersion: number; // 3
  readonly lastUpdated: string;
  readonly protocols: {
    readonly bubble: ProtocolProgress;
    readonly selection: ProtocolProgress;
  };
  readonly preferences: PreferencesSaveData;

  // Aliases de retrocompatibilidade
  readonly campaign: ProtocolProgress;
  readonly records: Record<number, PhaseRecord>;
}
```

- Cada protocolo opera sob seu próprio namespace limpo (`protocols.bubble`, `protocols.selection`), permitindo que a Fase 1 do Selection coexista com a Fase 1 do Bubble sem qualquer colisão;
- `campaign` e `records` são preservados como aliases em nível de schema para garantir retrocompatibilidade absoluta com componentes legados que ainda leiam essas propriedades.

### 2.2. Pipeline Explícito de Migração (`src/game/persistence/validation.ts`)
Adotar um pipeline modular e desacoplado de migração:
- **v1 $\rightarrow$ v2:** Converte conclusões de fase simples para o formato v2 (com campos de recorde opcionais);
- **v2 $\rightarrow$ v3:**
  - Mapeia integralmente o progresso e recordes do Bubble para `protocols.bubble`;
  - Inicializa `protocols.selection` com o estado padrão limpo (`unlockedPhases: 1`, `highestPhaseReached: 1`, `hasCompletedTutorial: false`, `records: {}`);
  - Preserva integralmente preferências e timestamps;
- **v1 $\rightarrow$ v2 $\rightarrow$ v3:** Saves legados v1 transitam deterministicamente por ambas as etapas;
- **v3 Nativo:** Validação defensiva direta dos blocos de protocolo.

### 2.3. Regra Canônica de Recordes
Conforme estabelecido no ADR 0007, a atualização de recordes no Selection Sort obedece estritamente ao critério de precisão cognitiva e qualidade de ordenação:
- Novo recorde se `newScore > bestScore`; OU
- Novo recorde se `newScore === bestScore` E `newErrors < bestScoreErrors`;
- O tempo decorrido (`elapsedTimeMs`) é factual e descritivo; **tempo NUNCA desempata nem incentiva pressa**.

### 2.4. Semântica de Início de Sessão
- `highestPhaseReached` e `unlockedPhases` indicam o avanço histórico do operador;
- Clicar em "INICIAR TURNO" na Home ou no Briefing sempre inicia a rodada ativa na **Fase 1** (com novos vetores procedurais);
- `getInitialSessionRoute(saveData, protocol)` direciona para o tutorial específico do protocolo se `hasCompletedTutorial === false`, ou diretamente para a Fase 1 se o tutorial já tiver sido concluído.

### 2.5. Integração na Camada de Aplicação (`src/App.tsx`)
- `saveData` gerencia o estado global de persistência usando `loadGameProgress` e `saveGameProgress`;
- Conclusão do tutorial de Selection chama `recordTutorialCompletion(saveData, "selection")`, persistindo o status no storage;
- Conclusão de fases de Selection chama `recordPhaseCompletion(saveData, "selection", phase, maxPhases, storage, scoreData)`;
- Histórico de replay (`history`) é mantido estritamente no estado em memória (`result`) da sessão e descartado ao recarregar (F5).

---

## 3. Consequências

### Positivas
- **Extensibilidade Multi-Protocolo:** Novos algoritmos de ordenação futuros (ex.: Insertion Sort, Quick Sort) podem ser adicionados ao nó `protocols` sem quebrar schemas existentes;
- **Isolamento de Progresso:** Alunos podem alternar livremente entre campanhas de Bubble Sort e Selection Sort sem risco de interferência cruzada em fases ou pontuações;
- **Proteção do Storage:** O `localStorage` permanece com tamanho mínimo (menos de 2 KB), pois o histórico detalhado de passos do replay continua estritamente em memória volátil;
- **Zero Regressão:** Todos os 246 testes anteriores continuam 100% íntegros, e a suíte agora conta com 268 testes automatizados cobrindo migrações, isolamento e resiliência;
- **Conclusão Formal do Marco P2.1:** O Selection Sort atinge 100% de cobertura nos pilares de engine, restrições, tutorial interativo, campanha de 3 fases, replay sincronizado e persistência.

### Negativas / Trade-offs
- A migração de saves legados v1/v2 para v3 requer a execução transparente do pipeline no momento da leitura, gerando a reescrita do storage em formato v3 na primeira mutação persistente.

---

## 4. Conformidade e Validação

- 268 testes automatizados aprovados no Vitest (`pnpm run test:run`);
- Verificação de tipos TypeScript sem falhas (`pnpm exec tsc --noEmit`);
- Build de produção verificado com sucesso pelo Vite (`pnpm run build`).
