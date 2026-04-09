import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HousingPropertyListing, HousingPriorityTier } from "./types";
import { WaterWheelBreakdown } from "./WaterWheelBreakdown";

type PropertyListingCardProps = {
  property: HousingPropertyListing;
  tier: HousingPriorityTier;
};

function formatCurrency(value: number | null) {
  if (!value) return "n/a";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export function PropertyListingCard({ property, tier }: PropertyListingCardProps) {
  return (
    <Card data-xray-id="housing-property-listing-card">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{property.title}</CardTitle>
            <CardDescription>
              {property.city}
              {property.state ? `, ${property.state}` : ""}
            </CardDescription>
          </div>
          <Badge variant="outline" className="capitalize">
            {property.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground md:grid-cols-3">
          <p>Type: <span className="font-medium text-foreground capitalize">{property.propertyType}</span></p>
          <p>Acquisition: <span className="font-medium text-foreground">{formatCurrency(property.acquisitionCost)}</span></p>
          <p>Monthly surplus: <span className="font-medium text-foreground">{formatCurrency((property.monthlyRevenue ?? 0) - (property.monthlyExpenses ?? 0))}</span></p>
        </div>
        <WaterWheelBreakdown {...property.waterwheel} />
        <div className="rounded-md border bg-muted/20 px-3 py-2 text-xs">
          <p className="text-muted-foreground">
            Your current tier: <span className="font-medium text-foreground">{tier.tierLabel}</span> - next rung in{" "}
            <span className="font-medium text-foreground">{tier.pointsToNextTier.toFixed(1)} points</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
