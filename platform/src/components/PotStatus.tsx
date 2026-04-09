import { cn } from "@/lib/utils";
import { getSpiceMeta, type SpiceType } from "@/lib/spiceRack";

type SlotStatus = "open" | "filled" | "owner";

export type PotSlot = {
  id: string;
  spice: SpiceType;
  status: SlotStatus;
};

type PotStatusProps = {
  slots: PotSlot[];
  className?: string;
  compact?: boolean;
};

export function PotStatus({ slots, className, compact = false }: PotStatusProps) {
  if (!slots.length) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        No spice slots yet.
      </div>
    );
  }

  const diameter = compact ? "w-44 h-44" : "w-56 h-56";
  const iconSize = compact ? "text-lg" : "text-xl";

  return (
    <div className={cn("relative", diameter, className)}>
      <div className="absolute inset-0 rounded-full border border-dashed border-border/70" />
      {slots.map((slot, index) => {
        const angle = (2 * Math.PI * index) / Math.max(slots.length, 1);
        const radiusPercent = 42;
        const x = 50 + radiusPercent * Math.cos(angle - Math.PI / 2);
        const y = 50 + radiusPercent * Math.sin(angle - Math.PI / 2);
        const meta = getSpiceMeta(slot.spice);
        const filled = slot.status === "filled" || slot.status === "owner";
        const owner = slot.status === "owner";

        return (
          <div
            key={slot.id}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border transition-colors",
              compact ? "w-8 h-8" : "w-10 h-10",
              "grid place-items-center",
              filled
                ? "bg-primary/15 border-primary/40"
                : "bg-muted/30 border-muted-foreground/30 grayscale",
            )}
            style={{ left: `${x}%`, top: `${y}%` }}
            title={meta ? `${meta.displayName} (${slot.status})` : slot.spice}
          >
            <span className={cn(iconSize, owner && "drop-shadow-[0_0_6px_rgba(59,130,246,0.7)]")}>
              {meta?.emoji ?? "•"}
            </span>
          </div>
        );
      })}

      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-2xl font-semibold">
            {slots.filter((slot) => slot.status !== "open").length}/{slots.length}
          </div>
          <div className="text-xs text-muted-foreground">filled</div>
        </div>
      </div>
    </div>
  );
}
