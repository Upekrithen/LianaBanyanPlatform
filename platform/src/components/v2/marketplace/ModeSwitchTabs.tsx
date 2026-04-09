import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarketplaceMode } from "./types";

type ModeSwitchTabsProps = {
  value: MarketplaceMode;
  onValueChange: (value: MarketplaceMode) => void;
};

const MODE_LABELS: Record<MarketplaceMode, string> = {
  all: "All",
  products: "Products",
  storefronts: "Storefronts",
  "crew-call": "Crew Call",
};

export function ModeSwitchTabs({ value, onValueChange }: ModeSwitchTabsProps) {
  return (
    <Tabs value={value} onValueChange={(next) => onValueChange(next as MarketplaceMode)}>
      <TabsList className="h-auto w-full justify-start gap-2 overflow-x-auto rounded-lg bg-muted/60 p-1">
        {Object.entries(MODE_LABELS).map(([mode, label]) => (
          <TabsTrigger key={mode} value={mode} className="min-w-[120px]">
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
