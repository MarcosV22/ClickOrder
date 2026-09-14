import CampaignCompleteScreen, { type CampaignCompleteScreenProps } from "./CampaignCompleteScreen";

export type SelectionCampaignCompleteScreenProps = Omit<CampaignCompleteScreenProps, "protocol">;

export default function SelectionCampaignCompleteScreen(props: SelectionCampaignCompleteScreenProps) {
  return <CampaignCompleteScreen {...props} protocol="selection" />;
}
