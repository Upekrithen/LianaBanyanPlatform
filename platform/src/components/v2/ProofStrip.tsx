import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ProofStripItem = string | { icon?: ReactNode; label: string };

type ProofStripProps = {
  items: ProofStripItem[];
  className?: string;
};

export function ProofStrip({ items, className }: ProofStripProps) {
  const visibleItems = items.slice(0, 5);

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <div className="flex min-w-max items-center gap-2 pb-1">
        {visibleItems.map((item, index) => {
          const label = typeof item === "string" ? item : item.label;
          const icon = typeof item === "string" ? null : item.icon;
          return (
            <span
              key={`${label}-${index}`}
              className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground"
            >
              {icon ? <span className="text-foreground">{icon}</span> : null}
              <span className="whitespace-nowrap">{label}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
