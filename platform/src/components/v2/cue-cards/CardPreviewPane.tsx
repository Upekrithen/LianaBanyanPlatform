import { CueCardDraft } from "@/components/v2/cue-cards/types";
import { cn } from "@/lib/utils";

const FONT_CLASS: Record<CueCardDraft["fontStyle"], string> = {
  clean: "font-sans",
  serif: "font-serif",
  strong: "font-semibold tracking-wide",
};

type CardPreviewPaneProps = {
  draft: CueCardDraft;
};

export function CardPreviewPane({ draft }: CardPreviewPaneProps) {
  return (
    <div className="rounded-xl border bg-card/50 p-4">
      <p className="mb-3 text-xs text-muted-foreground">Live Preview</p>
      <article
        className={cn("rounded-xl border bg-background p-5 shadow-sm", FONT_CLASS[draft.fontStyle])}
        style={{ borderColor: draft.accentColor }}
      >
        {draft.imageUrl ? (
          <div className="mb-4 overflow-hidden rounded-md border">
            <img src={draft.imageUrl} alt="Card visual" className="h-32 w-full object-cover" />
          </div>
        ) : null}
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Cue Card</p>
        <h3 className="mt-2 text-xl font-bold">{draft.headline || "Card headline"}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{draft.body || "Card body copy appears here."}</p>
        <div className="mt-4">
          <span className="inline-flex rounded-md px-3 py-1 text-sm text-white" style={{ backgroundColor: draft.accentColor }}>
            {draft.cta || "Open"}
          </span>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">{draft.contactInfo || "Contact details go here."}</p>
      </article>
    </div>
  );
}
