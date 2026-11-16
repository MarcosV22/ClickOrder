/**
 * bubbleUxTest.ts
 *
 * Instrumentação local, estritamente em memória e não invasiva para
 * observação formativa de testes de usabilidade do Bubble Sort V2.
 *
 * Diretrizes éticas e de privacidade:
 * - Ativo SOMENTE sob query param `?uxTest=1` ou flag explícita.
 * - Zero telemetria remota, zero analytics de terceiros, zero chamadas de rede.
 * - Zero PII (sem nome, email, IP, machine ID). ID de sessão efêmero local.
 * - Zero persistência no Schema v4 / localStorage.
 * - Métricas puramente factuais (distinguindo estritamente tempos factuais de alegações psicológicas).
 */

export interface BubbleUxTestSession {
  sessionId: string;
  sessionStartedAt: number;
  overviewStartedAt?: number;
  tutorialStartedAt?: number;
  practiceStartedAt?: number;
  firstActionAt?: number;
  timeToFirstActionMs?: number;
  firstActionCorrect?: boolean;
  predictionAnswered?: boolean;
  predictionCorrect?: boolean;
  wrongActionsCount: number;
  hintRequestsCount: number;
  detailsOpenedCount: number;
  passCheckpointAnswered?: boolean;
  passCheckpointCorrect?: boolean;
  resultReachedAt?: number;
  microReflectionAnswered?: boolean;
  microReflectionCorrect?: boolean;
  replayOpened?: boolean;
  sessionCompletedAt?: number;
}

export function isUxTestQueryParamActive(): boolean {
  if (typeof window === "undefined" || !window.location || !window.location.search) {
    return false;
  }
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("uxTest") === "1";
  } catch {
    return false;
  }
}

export function createUxTestSession(): BubbleUxTestSession {
  const now = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return {
    sessionId: `ux-${now}-${randomSuffix}`,
    sessionStartedAt: now,
    wrongActionsCount: 0,
    hintRequestsCount: 0,
    detailsOpenedCount: 0,
  };
}

export function exportUxTestSessionAsJson(session: BubbleUxTestSession): string {
  return JSON.stringify(session, null, 2);
}
