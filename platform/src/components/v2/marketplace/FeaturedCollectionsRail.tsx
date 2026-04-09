import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketplaceMode } from "./types";

type FeaturedCollectionsRailProps = {
  onSelectMode: (mode: MarketplaceMode) => void;
};

const COLLECTIONS: Array<{ title: string; description: string; mode: MarketplaceMode }> = [
  {
    title: "Fresh and local food runs",
    description: "Explore food storefronts and pickup-ready products.",
    mode: "products",
  },
  {
    title: "Craft and build collections",
    description: "Discover maker storefronts and production-linked outputs.",
    mode: "storefronts",
  },
  {
    title: "Service and Crew Call board",
    description: "Find service providers and active crew opportunities.",
    mode: "crew-call",
  },
];

export function FeaturedCollectionsRail({ onSelectMode }: FeaturedCollectionsRailProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Featured collections</h2>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {COLLECTIONS.map((collection) => (
          <Card key={collection.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{collection.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{collection.description}</p>
              <Button variant="outline" size="sm" onClick={() => onSelectMode(collection.mode)}>
                Open collection
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
