import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

export type CrewFilters = {
  radius: "any" | "5" | "10" | "25";
  availability: "any" | "available" | "booked";
  adaptMin: "0" | "60" | "75" | "85";
  sort: "recommended" | "adapt" | "availability";
};

type SecondaryFilterRowProps = {
  filters: CrewFilters;
  onChange: (next: CrewFilters) => void;
};

function FilterFields({ filters, onChange }: SecondaryFilterRowProps) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Location radius</Label>
        <Select value={filters.radius} onValueChange={(value) => onChange({ ...filters, radius: value as CrewFilters["radius"] })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any radius</SelectItem>
            <SelectItem value="5">Within 5 mi</SelectItem>
            <SelectItem value="10">Within 10 mi</SelectItem>
            <SelectItem value="25">Within 25 mi</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Availability</Label>
        <Select
          value={filters.availability}
          onValueChange={(value) => onChange({ ...filters, availability: value as CrewFilters["availability"] })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="booked">Booked</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">ADAPT score</Label>
        <Select value={filters.adaptMin} onValueChange={(value) => onChange({ ...filters, adaptMin: value as CrewFilters["adaptMin"] })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Any ADAPT</SelectItem>
            <SelectItem value="60">60+</SelectItem>
            <SelectItem value="75">75+</SelectItem>
            <SelectItem value="85">85+</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Sort</Label>
        <Select value={filters.sort} onValueChange={(value) => onChange({ ...filters, sort: value as CrewFilters["sort"] })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="recommended">Recommended</SelectItem>
            <SelectItem value="adapt">Highest ADAPT</SelectItem>
            <SelectItem value="availability">Availability first</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function SecondaryFilterRow({ filters, onChange }: SecondaryFilterRowProps) {
  return (
    <section className="space-y-3">
      <div className="hidden md:block">
        <FilterFields filters={filters} onChange={onChange} />
      </div>
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button type="button" variant="outline" className="w-full justify-start gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="space-y-4">
            <SheetHeader>
              <SheetTitle>Crew filters</SheetTitle>
            </SheetHeader>
            <FilterFields filters={filters} onChange={onChange} />
          </SheetContent>
        </Sheet>
      </div>
    </section>
  );
}
