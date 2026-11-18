import React from "react";
import SelectionTutorialScreenV2, {
  type SelectionTutorialScreenV2Props,
} from "./selection/SelectionTutorialScreenV2";

export type SelectionTutorialScreenProps = SelectionTutorialScreenV2Props;

export default function SelectionTutorialScreen(props: SelectionTutorialScreenProps) {
  return <SelectionTutorialScreenV2 {...props} />;
}
