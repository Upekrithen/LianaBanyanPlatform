import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MarketplaceFilters } from "./types";

type FilterControlsProps = {
  filters: MarketplaceFilters;
  onChange: (next: MarketplaceFilters) => void;
};

function toggleString<T extends string>(items: T[], value: T): T[] {
  return items.includes(value) ? items.filter((item) => item !== value) : [...items, value];
}

export function FilterControls({ filters, onChange }: FilterControlsProps) {
  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tier 1</p>
        <div className="space-y-2">
          <Label className="text-sm">Listing type</Label>
          <div className="space-y-2">
            {(["product", "storefront", "service", "crew"] as const).map((type) => (
              <label key={type} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={filters.listingTypes.includes(type)}
                  onCheckedChange={() => onChange({ ...filters, listingTypes: toggleString(filters.listingTypes, type) })}
                />
                <span className="capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Storefront type</Label>
          <div className="space-y-2">
            {(["food", "crafts", "services", "digital"] as const).map((type) => (
              <label key={type} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={filters.storefrontTypes.includes(type)}
                  onCheckedChange={() =>
                    onChange({
                      ...filters,
                      storefrontTypes: toggleString(filters.storefrontTypes, type),
                    })
                  }
                />
                <span className="capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Price range (Credits)</Label>
          <Select value={filters.priceRange} onValueChange={(next) => onChange({ ...filters, priceRange: next as MarketplaceFilters["priceRange"] })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="0-100">0-100</SelectItem>
              <SelectItem value="101-500">101-500</SelectItem>
              <SelectItem value="501+">501+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Fulfillment</Label>
          <div className="space-y-2">
            {(["shipping", "pickup", "service", "digital"] as const).map((type) => (
              <label key={type} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={filters.fulfillment.includes(type)}
                  onCheckedChange={() => onChange({ ...filters, fulfillment: toggleString(filters.fulfillment, type) })}
                />
                <span className="capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Availability</Label>
          <Select value={filters.availability} onValueChange={(next) => onChange({ ...filters, availability: next as MarketplaceFilters["availability"] })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="unavailable">Unavailable</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tier 2</p>

        <div className="space-y-2">
          <Label className="text-sm">Rating / ADAPT</Label>
          <Select
            value={filters.adaptThreshold}
            onValueChange={(next) => onChange({ ...filters, adaptThreshold: next as MarketplaceFilters["adaptThreshold"] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="70+">70+</SelectItem>
              <SelectItem value="85+">85+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          {(
            [
              ["Newest", "newestOnly"],
              ["Featured", "featuredOnly"],
              ["Local", "localOnly"],
              ["External source", "externalOnly"],
              ["Production-linked", "productionLinkedOnly"],
            ] as const
          ).map(([label, key]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <Checkbox checked={filters[key]} onCheckedChange={() => onChange({ ...filters, [key]: !filters[key] })} />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
