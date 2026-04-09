import { DesignEntry } from "./types";
import { DesignCard } from "./DesignCard";

type DesignGalleryProps = {
  entries: DesignEntry[];
  maxCredits: number;
  onVote: (participantId: string, credits: number) => Promise<void> | void;
  onViewDesigner: (entry: DesignEntry) => void;
};

export function DesignGallery({ entries, maxCredits, onVote, onViewDesigner }: DesignGalleryProps) {
  return (
    <section className="space-y-3" data-xray-id="design-democracy-gallery">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Active round gallery</h2>
        <p className="text-xs text-muted-foreground">Relative framing only: Leading / Strong contender / Needs votes</p>
      </div>
      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
          No active entries yet. Submit a design to seed the next voting round.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {entries.map((entry) => (
            <DesignCard key={entry.id} entry={entry} maxCredits={maxCredits} onVote={onVote} onViewDesigner={onViewDesigner} />
          ))}
        </div>
      )}
    </section>
  );
}
