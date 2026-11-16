import React from "react";
import BubbleTutorialScreenV2 from "./bubble/BubbleTutorialScreenV2";

interface TutorialScreenProps {
  onUnderstood: () => void;
  onBack: () => void;
}

export default function TutorialScreen({ onUnderstood, onBack }: TutorialScreenProps) {
  return <BubbleTutorialScreenV2 onComplete={onUnderstood} onBack={onBack} />;
}
