import React from "react";
import InsertionTutorialScreenV2, {
  type InsertionTutorialScreenV2Props,
} from "./insertion/InsertionTutorialScreenV2";

export type InsertionTutorialScreenProps = InsertionTutorialScreenV2Props;

export default function InsertionTutorialScreen(props: InsertionTutorialScreenProps) {
  return <InsertionTutorialScreenV2 {...props} />;
}
