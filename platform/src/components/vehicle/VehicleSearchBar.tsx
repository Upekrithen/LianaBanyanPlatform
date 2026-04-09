import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, SlidersHorizontal } from "lucide-react";

type VehicleSearchBarProps = {
  onSearch: (filters: VehicleSearchFilters) => void;
  placeholder?: string;
  showTypeFilter?: boolean;
};

export type VehicleSearchFilters = {
  city: string;
  distanceMiles: number;
  vehicleType: "all" | "rideshare" | "listing" | "fleet";
};

const DISTANCE_OPTIONS = [5, 10, 25, 50, 100];
const TYPE_OPTIONS: Array<{ value: VehicleSearchFilters["vehicleType"]; label: string }> = [
  { value: "all", label: "All" },
  { value: "rideshare", label: "Rideshare" },
  { value: "listing", label: "Buy/Sell" },
  { value: "fleet", label: "Local Fleet" },
];

export function VehicleSearchBar({ onSearch, placeholder = "City or ZIP...", showTypeFilter = true }: VehicleSearchBarProps) {
  const [city, setCity] = useState("");
  const [distance, setDistance] = useState(25);
  const [vehicleType, setVehicleType] = useState<VehicleSearchFilters["vehicleType"]>("all");

  const handleSubmit = () => {
    onSearch({ city: city.trim(), distanceMiles: distance, vehicleType });
  };

  return (
    <div className="space-y-3" data-xray-id="vehicle-search-bar">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={placeholder}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="flex gap-1">
            {DISTANCE_OPTIONS.map((d) => (
              <Badge
                key={d}
                variant={distance === d ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setDistance(d)}
              >
                {d}mi
              </Badge>
            ))}
          </div>
        </div>
        <Button onClick={handleSubmit} className="shrink-0">
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>

      {showTypeFilter && (
        <div className="flex flex-wrap gap-1">
          {TYPE_OPTIONS.map((opt) => (
            <Badge
              key={opt.value}
              variant={vehicleType === opt.value ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setVehicleType(opt.value)}
            >
              {opt.label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
