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

  if (execution.protocol === "bubble") {
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6">
      <div className="p-6 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-center max-w-md">
        <h2 className="text-lg font-bold text-amber-400 mb-2">
          Demonstração Visual em Preparação
        </h2>
        <p className="text-xs font-mono text-white/70 mb-4">
          O driver de demonstração do Insertion Sort está ativo ({execution.history.length} passos computados). A interface com pseudocódigo integrado será ativada no módulo P2.2-E.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg text-xs font-mono text-amber-200 cursor-pointer"
        >
          VOLTAR
        </button>
      </div>
    </div>
  );
}
