export interface PhaseResult {
  phase: number;
  practiceTitle?: string;
  comparisons: number;
  swaps: number;
  errors: number;
  hintsUsed: number;
  finalArray: readonly number[];
  score?: number;
  elapsedTimeMs?: number;
}

export interface CampaignSummary {
  totalPhases: number;
  completedPhases: number;
  totalComparisons: number;
  totalSwaps: number;
  totalErrors: number;
  totalHintsUsed: number;
}

/**
 * Agrega métricas factuais das fases concluídas da campanha.
 * Não calcula métricas fictícias ou notas pedagógicas não validadas.
 */
export function calculateCampaignSummary(
  results: PhaseResult[],
  totalPhases: number
): CampaignSummary {
  const completedPhases = results.length;
  const totalComparisons = results.reduce((sum, r) => sum + r.comparisons, 0);
  const totalSwaps = results.reduce((sum, r) => sum + r.swaps, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);
  const totalHintsUsed = results.reduce((sum, r) => sum + r.hintsUsed, 0);

  return {
    totalPhases,
    completedPhases,
    totalComparisons,
    totalSwaps,
    totalErrors,
    totalHintsUsed,
  };
}
