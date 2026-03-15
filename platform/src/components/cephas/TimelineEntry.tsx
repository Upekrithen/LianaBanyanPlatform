/**
 * Pudding-style chronological decision/revision display (Session 19).
 */
import { ReactNode } from "react";

interface TimelineEntryProps {
  date?: string;
  label: string;
  children?: ReactNode;
}

export function TimelineEntry({ date, label, children }: TimelineEntryProps) {
  return (
    <div className="cephas-timeline-entry flex gap-4 py-2">
      {date && <span className="text-sm text-muted-foreground shrink-0 w-24">{date}</span>}
      <div>
        <span className="font-medium">{label}</span>
        {children && <div className="text-sm text-muted-foreground mt-1">{children}</div>}
      </div>
    </div>
  );
}
