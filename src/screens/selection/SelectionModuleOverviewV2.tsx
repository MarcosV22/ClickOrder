import React from "react";
import LearningModuleOverviewLayout from "../../components/LearningModuleOverviewLayout";
import SelectionConceptVisual from "./SelectionConceptVisual";
import SelectionConceptSteps from "./SelectionConceptSteps";
import SelectionDetails from "./SelectionDetails";

export interface SelectionModuleOverviewV2Props {
  onStartTutorial: () => void;
  onStartPractice?: () => void;
  onOpenDemonstration?: () => void;
  onBack: () => void;
}

export default function SelectionModuleOverviewV2({
  onStartTutorial,
  onStartPractice,
  onOpenDemonstration,
  onBack,
}: SelectionModuleOverviewV2Props) {
  return (
    <LearningModuleOverviewLayout
      moduleNumber={2}
      moduleCategory="Ordenação por Seleção"
      title="SELECTION SORT"
      subtitle="Encontre o menor e coloque-o na próxima posição."
      accentColor="purple"
      onBack={onBack}
      heroVisual={<SelectionConceptVisual />}
      steps={<SelectionConceptSteps />}
      ctaText="COMEÇAR TUTORIAL ▶"
      ctaMicrocopy="Você vai praticar a busca do menor passo a passo."
      onStartTutorial={onStartTutorial}
      onStartPractice={onStartPractice}
      practiceLinkText="Ir para práticas ›"
      details={<SelectionDetails onOpenDemonstration={onOpenDemonstration} />}
    />
  );
}
