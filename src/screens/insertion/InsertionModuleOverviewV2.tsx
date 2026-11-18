import React from "react";
import LearningModuleOverviewLayout from "../../components/LearningModuleOverviewLayout";
import InsertionConceptVisual from "./InsertionConceptVisual";
import InsertionConceptSteps from "./InsertionConceptSteps";
import InsertionDetails from "./InsertionDetails";

export interface InsertionModuleOverviewV2Props {
  onStartTutorial: () => void;
  onStartPractice?: () => void;
  onOpenDemonstration?: () => void;
  onBack: () => void;
}

export default function InsertionModuleOverviewV2({
  onStartTutorial,
  onStartPractice,
  onOpenDemonstration,
  onBack,
}: InsertionModuleOverviewV2Props) {
  return (
    <LearningModuleOverviewLayout
      moduleNumber={3}
      moduleCategory="Ordenação por Inserção"
      title="INSERTION SORT"
      subtitle="Pegue um número e encaixe no lugar certo."
      accentColor="amber"
      onBack={onBack}
      heroVisual={<InsertionConceptVisual />}
      steps={<InsertionConceptSteps />}
      ctaText="COMEÇAR TUTORIAL ▶"
      ctaMicrocopy="Você vai praticar isso passo a passo."
      onStartTutorial={onStartTutorial}
      onStartPractice={onStartPractice}
      practiceLinkText="Ir para práticas ›"
      details={<InsertionDetails onOpenDemonstration={onOpenDemonstration} />}
    />
  );
}
