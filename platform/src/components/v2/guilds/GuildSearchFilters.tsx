import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

export type GuildFilters = {
  query: string;
  discipline: "all" | string;
  standing: "all" | "active" | "forming";
};

type GuildSearchFiltersProps = {
  filters: GuildFilters;
  disciplines: string[];
  onChange: (next: GuildFilters) => void;
};

export function GuildSearchFilters({ filters, disciplines, onChange }: GuildSearchFiltersProps) {
  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_180px]">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
          placeholder="Search guild name, charter, or focus"
          className="pl-10"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Discipline</Label>
        <Select value={filters.discipline} onValueChange={(value) => onChange({ ...filters, discipline: value })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All disciplines</SelectItem>
            {disciplines.map((discipline) => (
              <SelectItem key={discipline} value={discipline}>
                {discipline}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Standing</Label>
        <Select value={filters.standing} onValueChange={(value) => onChange({ ...filters, standing: value as GuildFilters["standing"] })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="forming">Forming</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
