import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WheelsMode } from "./types";

type ModeCard = {
  mode: WheelsMode;
  title: string;
  subtitle: string;
};

const MODE_CARDS: ModeCard[] = [
  {
    mode: "local-wheels",
    title: "Local Wheels",
    subtitle: "Request rides and track earn-down ownership progress.",
  },
  {
    mode: "lemon-lot",
    title: "Lemon Lot",
    subtitle: "Browse or post member vehicle listings.",
  },
  {
    mode: "rideshare-routes",
    title: "Rideshare Routes",
    subtitle: "Match recurring routes and commuter plans.",
  },
];

type ThreeTabModeSelectorProps = {
  mode: WheelsMode;
  onModeChange: (mode: WheelsMode) => void;
};

export function ThreeTabModeSelector({ mode, onModeChange }: ThreeTabModeSelectorProps) {
  return (
    <section className="sticky top-2 z-20 rounded-xl border bg-background/95 p-2 backdrop-blur" data-xray-id="wheels-mode-selector">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        {MODE_CARDS.map((card) => (
          <Button
            key={card.mode}
            type="button"
            variant={mode === card.mode ? "default" : "outline"}
            className={cn("h-auto w-full justify-start px-4 py-4 text-left", mode === card.mode ? "shadow-sm" : "bg-background")}
            onClick={() => onModeChange(card.mode)}
          >
            <span className="space-y-1">
              <span className="block text-sm font-semibold">{card.title}</span>
              <span className="block text-xs opacity-90">{card.subtitle}</span>
            </span>
          </Button>
        ))}
      </div>
    </section>
  );
}
