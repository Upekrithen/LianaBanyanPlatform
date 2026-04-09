import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CephasLibraryItem } from "./types";

type CephasContentPickerProps = {
  libraryItems: CephasLibraryItem[];
  selectedIds: string[];
  onToggleSelection: (item: CephasLibraryItem) => void;
  isLoading: boolean;
};

export function CephasContentPicker({
  libraryItems,
  selectedIds,
  onToggleSelection,
  isLoading,
}: CephasContentPickerProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  const categories = useMemo(() => {
    const values = new Set(libraryItems.map((item) => item.category).filter(Boolean));
    return ["all", ...Array.from(values).sort()];
  }, [libraryItems]);

  const filtered = useMemo(() => {
    return libraryItems
      .filter((item) => category === "all" || item.category === category)
      .filter((item) => {
        const haystack = `${item.title} ${item.slug}`.toLowerCase();
        return haystack.includes(search.toLowerCase());
      })
      .slice(0, 80);
  }, [category, libraryItems, search]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Cephas content picker</h2>
        <p className="text-sm text-muted-foreground">
          Search, filter, and select the source content for your learning path.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search Cephas titles and slugs"
            className="pl-9"
          />
        </div>
        <select
          className="rounded-md border bg-background px-3 py-2 text-sm"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          {categories.map((entry) => (
            <option key={entry} value={entry}>
              {entry === "all" ? "All categories" : entry}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Loading live Cephas library..." : `${filtered.length} results`}
            </p>
            <Badge variant="outline">{selectedIds.length} selected</Badge>
          </div>

          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {filtered.map((item) => {
              const selected = selectedIds.includes(item.id);
              return (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.category} · {item.slug}
                    </p>
                  </div>
                  <Button variant={selected ? "default" : "outline"} size="sm" onClick={() => onToggleSelection(item)}>
                    {selected ? "Selected" : "Select"}
                  </Button>
                </div>
              );
            })}
            {!isLoading && filtered.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No content matches the current filters.</p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
