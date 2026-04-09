import { CardPreviewPane } from "@/components/v2/cue-cards/CardPreviewPane";
import { CardControlsPane } from "@/components/v2/cue-cards/CardControlsPane";
import { CueCardDraft } from "@/components/v2/cue-cards/types";

type CardEditorCanvasProps = {
  draft: CueCardDraft;
  onChange: (nextDraft: CueCardDraft) => void;
  shareUrl: string;
  mobileShowPreview?: boolean;
  includeVisualCustomization?: boolean;
};

export function CardEditorCanvas({
  draft,
  onChange,
  shareUrl,
  mobileShowPreview = true,
  includeVisualCustomization = true,
}: CardEditorCanvasProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Card Editor Canvas</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className={mobileShowPreview ? "block" : "hidden lg:block"}>
          <CardPreviewPane draft={draft} />
        </div>
        <CardControlsPane
          draft={draft}
          onChange={onChange}
          shareUrl={shareUrl}
          includeVisualCustomization={includeVisualCustomization}
        />
      </div>
    </section>
  );
}
