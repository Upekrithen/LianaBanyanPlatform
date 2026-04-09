import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketplaceFilters } from "./types";
import { FilterControls } from "./FilterControls";

type FilterRailProps = {
  filters: MarketplaceFilters;
  onChange: (next: MarketplaceFilters) => void;
};

export function FilterRail({ filters, onChange }: FilterRailProps) {
  return (
    <Card className="hidden lg:block">
      <CardHeader>
        <CardTitle className="text-base">Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <FilterControls filters={filters} onChange={onChange} />
      </CardContent>
    </Card>
  );
}
