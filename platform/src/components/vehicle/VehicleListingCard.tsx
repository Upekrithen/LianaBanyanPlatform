import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { VehicleCertBadge } from "./VehicleCertBadge";

export type VehicleListing = {
  id: string;
  year: number;
  make: string;
  model: string;
  color?: string | null;
  dailyRate: number;
  location: string;
  ownerId?: string | null;
  features: string[];
  description?: string | null;
  totalRentals?: number;
  certifiedByCrew?: boolean;
  photos?: string[];
};

type VehicleListingCardProps = {
  listing: VehicleListing;
};

function CreditBreakdown({ price }: { price: number }) {
  const costBasis = price / 1.2;
  const platformMargin = price - costBasis;
  const creatorKeeps = price * 0.833;

  return (
    <div className="text-xs text-muted-foreground space-y-0.5 mt-2 p-2 bg-muted/30 rounded-md">
      <div className="flex justify-between"><span>Cost basis:</span><span>{costBasis.toFixed(2)} credits</span></div>
      <div className="flex justify-between"><span>Platform margin (Cost+20%):</span><span>{platformMargin.toFixed(2)} credits</span></div>
      <div className="flex justify-between font-medium text-foreground"><span>Owner keeps (83.3%):</span><span>{creatorKeeps.toFixed(2)} credits</span></div>
    </div>
  );
}

export function VehicleListingCard({ listing }: VehicleListingCardProps) {
  return (
    <Link to={`/v2/lemon-lot/${listing.id}`} className="block">
      <Card className="cursor-pointer transition-shadow hover:shadow-md h-full" data-xray-id="vehicle-listing-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">
                {listing.year} {listing.make} {listing.model}
              </CardTitle>
            </div>
            {listing.certifiedByCrew && <VehicleCertBadge />}
          </div>
          <CardDescription className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {listing.location}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {listing.photos?.[0] ? (
            <div className="h-36 w-full overflow-hidden rounded-md bg-muted">
              <img src={listing.photos[0]} alt={`${listing.year} ${listing.make} ${listing.model}`} className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="flex h-36 w-full items-center justify-center rounded-md bg-muted">
              <Car className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}

          {listing.color && <p className="text-muted-foreground">{listing.color}</p>}

          <div className="flex items-center justify-between">
            <Badge variant="secondary">{listing.dailyRate.toFixed(2)} credits/day</Badge>
            {listing.totalRentals != null && listing.totalRentals > 0 && (
              <span className="text-xs text-muted-foreground">{listing.totalRentals} rental{listing.totalRentals === 1 ? "" : "s"}</span>
            )}
          </div>

          {listing.features.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {listing.features.slice(0, 4).map((f) => (
                <Badge key={f} variant="outline" className="text-[10px]">{f}</Badge>
              ))}
              {listing.features.length > 4 && (
                <Badge variant="outline" className="text-[10px]">+{listing.features.length - 4}</Badge>
              )}
            </div>
          )}

          <CreditBreakdown price={listing.dailyRate} />
        </CardContent>
      </Card>
    </Link>
  );
}
