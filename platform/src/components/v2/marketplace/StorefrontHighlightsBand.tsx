import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, Package, Sparkles, ArrowRight } from "lucide-react";
import { ForRentCard } from "./ForRentCard";

type StorefrontHighlight = {
  id: string;
  name: string;
  owner: string;
  category: string;
  status?: string | null;
  tagline?: string | null;
  production_linked?: boolean | null;
};

type StorefrontHighlightsBandProps = {
  highlights: StorefrontHighlight[];
};

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  active: { label: "Open", variant: "default" },
  demonstration: { label: "Demo", variant: "secondary" },
  pending_claim: { label: "Awaiting Creator", variant: "outline" },
};

export function StorefrontHighlightsBand({ highlights }: StorefrontHighlightsBandProps) {
  if (highlights.length === 0) {
    return (
      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Store className="w-5 h-5" />
          Storefront Highlights
        </h2>
        <ForRentCard variant="banner" />
      </section>
    );
  }

  const highlightCategory = highlights[0]?.category ?? undefined;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Store className="w-5 h-5" />
          Storefront Highlights
        </h2>
        <Link to="/main-square" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          View all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {highlights.map((item) => {
          const statusMeta = STATUS_BADGE[item.status ?? "active"] ?? STATUS_BADGE.active;
          return (
            <Link key={item.id} to={`/storefront/${item.id}`} className="group">
              <Card className="h-full transition-colors group-hover:border-primary/40">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base group-hover:text-primary transition-colors">
                      {item.name}
                    </CardTitle>
                    <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    {item.category?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  <p>by {item.owner}</p>
                  {item.tagline && <p className="italic text-xs">"{item.tagline}"</p>}
                  <div className="flex items-center gap-2 pt-1">
                    {item.production_linked && (
                      <Badge variant="secondary" className="text-xs gap-1"><Package className="w-3 h-3" />Production</Badge>
                    )}
                    {item.status === "pending_claim" && (
                      <Badge variant="outline" className="text-xs gap-1 text-amber-600"><Sparkles className="w-3 h-3" />Claim it</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
      <ForRentCard category={highlightCategory} variant="inline" />
    </section>
  );
}
