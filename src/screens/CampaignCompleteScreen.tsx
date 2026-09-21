/**
 * Wrapper de retrocompatibilidade para conclusão de conjunto de práticas (PLATFORM-R1-B).
 * Delega integralmente para PracticeSetCompleteScreen.
 */

import PracticeSetCompleteScreen from "./PracticeSetCompleteScreen";
import type { PhaseResult } from "../game/campaign/campaignSummary";
import type { ProtocolCompleteType } from "./campaignCompleteConfig";
import type { GameSaveSchema } from "../game/persistence/types";

export interface CampaignCompleteScreenProps {
  protocol?: ProtocolCompleteType;
  results: PhaseResult[];
  totalPhases?: number;
  saveData?: GameSaveSchema;
  onReturnHome: () => void;
  onRestartProtocol?: () => void;
  onStartChallenge?: () => void;
  onOpenSelector?: () => void;
}

export default function CampaignCompleteScreen({
  protocol = "bubble",
  results,
  totalPhases = 3,
  saveData,
  onReturnHome,
  onRestartProtocol,
  onStartChallenge,
  onOpenSelector,
}: CampaignCompleteScreenProps) {
  return (
    <PracticeSetCompleteScreen
      moduleId={protocol === "selection" ? "selection" : "bubble"}
      results={results}
      totalPhases={totalPhases}
      saveData={saveData}
      onReturnHome={onReturnHome}
      onRestartProtocol={onRestartProtocol}
      onStartChallenge={onStartChallenge}
      onOpenSelector={onOpenSelector}
      isChallengeUnlocked={Boolean(onStartChallenge)}
    />
  );
}
