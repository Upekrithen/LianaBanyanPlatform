import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PioneerFilter } from "./types";

type PioneerFiltersBarProps = {
  filter: PioneerFilter;
  onFilterChange: (filter: PioneerFilter) => void;
  sortBy: "phase" | "name";
  onSortChange: (sortBy: "phase" | "name") => void;
};

const FILTERS: Array<{ key: PioneerFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "marketplace", label: "Marketplace" },
  { key: "hexisle", label: "HexIsle" },
  { key: "governance", label: "Governance" },
];

export function PioneerFiltersBar({ filter, onFilterChange, sortBy, onSortChange }: PioneerFiltersBarProps) {
  return (
    <section className="rounded-xl border p-3" data-xray-id="pioneers-filters-bar">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((item) => (
          <Badge
            key={item.key}
            variant={filter === item.key ? "default" : "outline"}
            className="cursor-pointer px-3 py-1"
            onClick={() => onFilterChange(item.key)}
          >
            {item.label}
          </Badge>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Sort</span>
          <Button size="sm" variant={sortBy === "phase" ? "default" : "outline"} onClick={() => onSortChange("phase")}>
            Joined phase
          </Button>
          <Button size="sm" variant={sortBy === "name" ? "default" : "outline"} onClick={() => onSortChange("name")}>
            Name
          </Button>
        </div>
      </div>
    </section>
  );
}
