import React from "react";
import LearningModuleOverviewLayout from "../../components/LearningModuleOverviewLayout";
import BubbleConceptVisual from "./BubbleConceptVisual";
import BubbleConceptSteps from "./BubbleConceptSteps";
import BubbleDetails from "./BubbleDetails";

export interface BubbleModuleOverviewV2Props {
  onStartTutorial: () => void;
  onStartPractice?: () => void;
  onOpenDemonstration?: () => void;
  onBack: () => void;
}

export default function BubbleModuleOverviewV2({
  onStartTutorial,
  onStartPractice,
  onOpenDemonstration,
  onBack,
}: BubbleModuleOverviewV2Props) {
  return (
    <LearningModuleOverviewLayout
      moduleNumber={1}
      moduleCategory="Ordenação por Comparação"
      title="BUBBLE SORT"
      subtitle="Compare vizinhos e coloque o menor primeiro."
      accentColor="blue"
      onBack={onBack}
      heroVisual={<BubbleConceptVisual />}
      steps={<BubbleConceptSteps />}
      ctaText="COMEÇAR TUTORIAL ▶"
      ctaMicrocopy="Você vai praticar a comparação de vizinhos passo a passo."
      onStartTutorial={onStartTutorial}
      onStartPractice={onStartPractice}
      practiceLinkText="Ir para práticas ›"
      details={<BubbleDetails onOpenDemonstration={onOpenDemonstration} />}
    />
  );
}
