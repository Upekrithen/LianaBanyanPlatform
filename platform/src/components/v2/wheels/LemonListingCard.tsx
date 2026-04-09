import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LemonListing } from "./types";

type LemonListingCardProps = {
  listing: LemonListing;
  onSelect: (listing: LemonListing) => void;
};

export function LemonListingCard({ listing, onSelect }: LemonListingCardProps) {
  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => onSelect(listing)}
      data-xray-id="wheels-lemon-listing-card"
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">
            {listing.year} {listing.make} {listing.model}
          </CardTitle>
          <Badge variant="secondary">${listing.dailyRate}/day</Badge>
        </div>
        <CardDescription>{listing.location}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {listing.color ? <p className="text-muted-foreground">{listing.color}</p> : null}
        {listing.features.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {listing.features.slice(0, 4).map((feature) => (
              <Badge key={feature} variant="outline" className="text-[10px]">
                {feature}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
