import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { LemonListing } from "./types";

type ListingDetailSlideOverProps = {
  listing: LemonListing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestRental: (listing: LemonListing) => Promise<void> | void;
};

export function ListingDetailSlideOver({ listing, open, onOpenChange, onRequestRental }: ListingDetailSlideOverProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl" data-xray-id="wheels-listing-detail-slideover">
        <SheetHeader>
          <SheetTitle>
            {listing ? `${listing.year} ${listing.make} ${listing.model}` : "Listing details"}
          </SheetTitle>
          <SheetDescription>Details stay in context here without full-page navigation.</SheetDescription>
        </SheetHeader>
        {listing ? (
          <div className="mt-4 space-y-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">${listing.dailyRate}/day</Badge>
              <span className="text-muted-foreground">{listing.location}</span>
            </div>
            {listing.description ? <p>{listing.description}</p> : <p className="text-muted-foreground">No description provided.</p>}
            <div className="flex flex-wrap gap-1">
              {listing.features.length > 0 ? (
                listing.features.map((feature) => (
                  <Badge key={feature} variant="outline">
                    {feature}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">No features listed.</span>
              )}
            </div>
            <Button className="w-full" onClick={() => onRequestRental(listing)}>
              Request rental
            </Button>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
