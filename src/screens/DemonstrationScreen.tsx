/**
 * Tela do Modo Demonstração Educacional (P2.1-G-D).
 *
 * Apresenta uma execução canônica e perfeita gerada autonomamente pelas
 * engines reais (BubbleSortEngine ou SelectionSortEngine) sobre vetores curados fixos.
 *
 * É uma experiência observacional, volátil e livre de efeitos colaterais
 * de persistência, pontuação ou penalidades.
 */

import { useMemo } from "react";
import ReplayScreen from "./ReplayScreen";
import SelectionReplayScreen from "./SelectionReplayScreen";
import {
  getDemonstrationExecution,
  type DemonstrationProtocol,
} from "../game/demonstration";

export interface DemonstrationScreenProps {
  protocol: DemonstrationProtocol;
  onBack: () => void;
  onStartTraining?: () => void;
}

export default function DemonstrationScreen({
  protocol,
  onBack,
  onStartTraining,
}: DemonstrationScreenProps) {
  const execution = useMemo(
    () => getDemonstrationExecution(protocol),
    [protocol]
  );

  if (execution.protocol === "selection") {
    return (
      <SelectionReplayScreen
        initialArray={execution.initialArray}
        history={execution.history}
        mode="demonstration"
        onBackToResult={onBack}
        onStartTraining={onStartTraining}
      />
    );
  }

  return (
    <ReplayScreen
      initialArray={execution.initialArray}
      history={execution.history}
      mode="demonstration"
      onBackToResult={onBack}
      onStartTraining={onStartTraining}
    />
  );
}
