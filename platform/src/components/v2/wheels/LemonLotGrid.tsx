import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LemonListing } from "./types";
import { LemonListingCard } from "./LemonListingCard";

type LemonLotGridProps = {
  listings: LemonListing[];
  onSelectListing: (listing: LemonListing) => void;
};

export function LemonLotGrid({ listings, onSelectListing }: LemonLotGridProps) {
  const [cityFilter, setCityFilter] = useState("");
  const [maxDailyRate, setMaxDailyRate] = useState("");

  const filtered = useMemo(() => {
    return listings.filter((listing) => {
      const matchesCity = cityFilter ? listing.location.toLowerCase().includes(cityFilter.toLowerCase()) : true;
      const matchesRate = maxDailyRate ? listing.dailyRate <= Number(maxDailyRate || 0) : true;
      return matchesCity && matchesRate;
    });
  }, [listings, cityFilter, maxDailyRate]);

  return (
    <Card data-xray-id="wheels-lemon-lot-grid">
      <CardHeader>
        <CardTitle>Lemon Lot Grid</CardTitle>
        <CardDescription>Browse by location and rate, then open listing details in a slide-over.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input placeholder="Filter by city or state" value={cityFilter} onChange={(event) => setCityFilter(event.target.value)} />
          <Input
            type="number"
            min={0}
            placeholder="Max daily rate"
            value={maxDailyRate}
            onChange={(event) => setMaxDailyRate(event.target.value)}
          />
        </div>
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No listings match your filter yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((listing) => (
              <LemonListingCard key={listing.id} listing={listing} onSelect={onSelectListing} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
