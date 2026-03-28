import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, Coins, ImageIcon } from "lucide-react";
import type { ContestEntry } from "@/hooks/useContests";
import { ContestVoteButton } from "./ContestVoteButton";

interface Props {
  entries: ContestEntry[];
  votingOpen: boolean;
  userVotedEntryIds: Set<string>;
}

export function ContestEntryGallery({ entries, votingOpen, userVotedEntryIds }: Props) {
  if (!entries.length) {
    return (
      <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
        <ImageIcon className="mx-auto mb-3 h-10 w-10 opacity-40" />
        No entries yet. Be the first to submit!
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => {
        const images = entry.project?.images ?? [];
        const thumb = images[0];

        return (
          <Card key={entry.id} className="overflow-hidden">
            {thumb ? (
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={thumb}
                  alt={entry.project?.title ?? "Entry"}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </div>
            ) : (
              <div className="aspect-[4/3] flex items-center justify-center bg-muted/50">
                <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
              </div>
            )}
            <CardContent className="space-y-3 p-4">
              <h3 className="font-semibold text-sm line-clamp-1">
                {entry.project?.title ?? "Untitled"}
              </h3>
              {entry.entry_statement && (
                <p className="text-xs text-muted-foreground line-clamp-2 italic">
                  "{entry.entry_statement}"
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" />
                  {entry.vote_count}
                </span>
                <span className="flex items-center gap-1">
                  <Coins className="h-3 w-3" />
                  {entry.pledge_total} pledged
                </span>
              </div>
              <ContestVoteButton
                contestId={entry.contest_id}
                entryId={entry.id}
                hasVoted={userVotedEntryIds.has(entry.id)}
                votingOpen={votingOpen}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
