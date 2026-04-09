import { CueCardDraft } from "@/components/v2/cue-cards/types";
import { ContentPanel } from "@/components/v2/cue-cards/ContentPanel";
import { ShareStep } from "@/components/v2/cue-cards/ShareStep";
import { VisualCustomization } from "@/components/v2/cue-cards/VisualCustomization";
import { AttributionConfirmation } from "@/components/v2/cue-cards/AttributionConfirmation";

type CardControlsPaneProps = {
  draft: CueCardDraft;
  onChange: (nextDraft: CueCardDraft) => void;
  shareUrl: string;
  includeVisualCustomization?: boolean;
};

export function CardControlsPane({
  draft,
  onChange,
  shareUrl,
  includeVisualCustomization = true,
}: CardControlsPaneProps) {
  const readyToSend = draft.headline.trim().length > 0 && (draft.shareMethod === "link" || draft.recipientEmail.trim().length > 0);

  return (
    <div className="space-y-5 rounded-xl border bg-card/50 p-4">
      <ContentPanel draft={draft} onChange={onChange} />
      {includeVisualCustomization ? <VisualCustomization draft={draft} onChange={onChange} /> : null}
      <ShareStep draft={draft} onChange={onChange} shareUrl={shareUrl} />
      <AttributionConfirmation readyToSend={readyToSend} />
    </div>
  );
}
