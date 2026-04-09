import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UnifiedListing } from "./types";

type MarketplaceResultCardProps = {
  listing: UnifiedListing;
};

const TYPE_BADGE_LABEL: Record<UnifiedListing["type"], string> = {
  product: "Product",
  storefront: "Storefront",
  service: "Service",
  crew: "Crew Call",
};

const ACTION_LABEL: Record<UnifiedListing["type"], string> = {
  product: "View listing",
  storefront: "View storefront",
  service: "Request service",
  crew: "Claim role",
};

export function MarketplaceResultCard({ listing }: MarketplaceResultCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-3">
        <div className="aspect-[16/9] rounded-md bg-muted/50" />
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-base">{listing.name}</CardTitle>
          <Badge variant="secondary">{TYPE_BADGE_LABEL[listing.type]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="line-clamp-2 text-muted-foreground">{listing.description}</p>
        <p>
          <span className="text-muted-foreground">Who:</span> {listing.creator}
        </p>
        <p>
          <span className="text-muted-foreground">How fulfilled:</span> {listing.fulfillment}
        </p>
        <p>
          <span className="text-muted-foreground">Price:</span>{" "}
          {listing.priceCredits === null ? "Not listed" : `${listing.priceCredits.toLocaleString()} Credits`}
        </p>
        {listing.adaptScore !== null ? (
          <p>
            <span className="text-muted-foreground">ADAPT:</span> {listing.adaptScore}
          </p>
        ) : null}
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <a href={listing.href}>{ACTION_LABEL[listing.type]}</a>
        </Button>
      </CardFooter>
    </Card>
  );
}
