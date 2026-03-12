/**
 * BUILD JOURNAL — Production updates feed
 * ========================================
 * Reverse-chronological log of production milestones.
 * Will connect to Supabase `founding_run_updates` table when migrations land.
 */

import { CalendarDays, Image as ImageIcon } from "lucide-react";

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  body: string;
  imageUrl?: string;
}

interface BuildJournalProps {
  entries: JournalEntry[];
}

export function BuildJournal({ entries }: BuildJournalProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p className="font-medium">Build Journal</p>
        <p className="text-sm">
          Production updates will appear here once funding completes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
        {entries.map((entry, i) => (
          <div key={entry.id} className="relative pl-10 pb-8 last:pb-0">
            <div
              className={`absolute left-2.5 w-3 h-3 rounded-full border-2 ${
                i === 0
                  ? "bg-green-500 border-green-500"
                  : "bg-background border-border"
              }`}
            />
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <time className="text-xs text-muted-foreground font-mono">
                  {entry.date}
                </time>
              </div>
              <h4 className="font-semibold">{entry.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {entry.body}
              </p>
              {entry.imageUrl && (
                <div className="mt-2 rounded-lg overflow-hidden border bg-muted">
                  <img
                    src={entry.imageUrl}
                    alt={entry.title}
                    className="w-full max-h-64 object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
