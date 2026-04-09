import { Button } from "@/components/ui/button";
import { MarketplaceResultCard } from "./MarketplaceResultCard";
import { ForRentCard } from "./ForRentCard";
import { UnifiedListing } from "./types";

type UnifiedResultsGridProps = {
  listings: UnifiedListing[];
  currentPage: number;
  pageCount: number;
  onPageChange: (nextPage: number) => void;
  loading?: boolean;
  tourTargetProps?: { "data-tour-target": string };
  forRentCategory?: string;
};

export function UnifiedResultsGrid({
  listings,
  currentPage,
  pageCount,
  onPageChange,
  loading = false,
  tourTargetProps,
  forRentCategory,
}: UnifiedResultsGridProps) {
  if (loading) {
    return (
      <section className="space-y-3" {...tourTargetProps}>
        <h2 className="text-lg font-semibold">Results</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-lg border bg-muted/30" />
          ))}
        </div>
      </section>
    );
  }

  if (listings.length === 0) {
    return (
      <section className="space-y-4" {...tourTargetProps}>
        <h2 className="text-lg font-semibold">Results</h2>
        <p className="rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground">
          No listings match this search and filter combination.
        </p>
        <ForRentCard category={forRentCategory} variant="banner" />
      </section>
    );
  }

  return (
    <section className="space-y-4" {...tourTargetProps}>
      <h2 className="text-lg font-semibold">Results</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {listings.map((listing) => (
          <MarketplaceResultCard key={`${listing.type}-${listing.id}`} listing={listing} />
        ))}
        {currentPage >= pageCount && (
          <ForRentCard category={forRentCategory} />
        )}
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {pageCount}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= pageCount}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </section>
  );
}
