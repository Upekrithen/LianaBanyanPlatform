import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Ghost, Store, Map, Search, ArrowRight } from "lucide-react";

type MallEntry = {
  id: string;
  building_slot: number;
  building_size: string | null;
  island_name: string;
  island_category: string | null;
  store_name: string;
  store_slug: string | null;
};

export default function GhostWorldMall() {
  const [search, setSearch] = useState("");

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["ghost-world-mall"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ghost_world_buildings" as never)
        .select("id, building_slot, building_size, ghost_world_islands(name, category), storefronts(name, slug)")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return ((data ?? []) as any[]).map((row): MallEntry => ({
        id: row.id,
        building_slot: row.building_slot,
        building_size: row.building_size,
        island_name: row.ghost_world_islands?.name ?? "Unknown Island",
        island_category: row.ghost_world_islands?.category ?? null,
        store_name: row.storefronts?.name ?? "Unnamed Store",
        store_slug: row.storefronts?.slug ?? null,
      }));
    },
  });

  const filtered = search.trim()
    ? entries.filter(
        (e) =>
          e.store_name.toLowerCase().includes(search.toLowerCase()) ||
          e.island_name.toLowerCase().includes(search.toLowerCase()) ||
          (e.island_category ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : entries;

  const categories = [...new Set(entries.map((e) => e.island_category).filter(Boolean))] as string[];

  return (
    <PortalPageLayout
      title="Ghost World Mall"
      subtitle="Browse storefronts placed across Ghost World islands"
      maxWidth="xl"
      xrayId="ghost-world-mall"
    >
      <div className="space-y-6 pb-12">
        {/* Search */}
        {entries.length > 0 && (
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search stores or islands…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}

        {/* Category chips */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={search === "" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSearch("")}
            >
              All
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={search === cat ? "default" : "outline"}
                className="cursor-pointer capitalize"
                onClick={() => setSearch(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">Loading storefronts…</CardContent></Card>
        ) : filtered.length === 0 && entries.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center space-y-4">
              <Ghost className="w-14 h-14 mx-auto text-muted-foreground/30" />
              <h3 className="text-lg font-semibold">The Mall is Empty… For Now</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                No storefronts have been placed on Ghost World islands yet.
                Explore the hex map to claim a spot for your store.
              </p>
              <Link to="/ghost-world">
                <Button variant="outline" className="gap-2">
                  <Map className="w-4 h-4" /> Explore Ghost World
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-muted-foreground">
              No matches for "{search}". Try a different search.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((e) => (
              <Card key={e.id} className="group hover:border-primary/40 transition-colors">
                <CardContent className="pt-5 pb-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold flex items-center gap-2">
                        <Store className="w-4 h-4 text-primary shrink-0" />
                        {e.store_name}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Map className="w-3 h-3" /> {e.island_name} &middot; Slot {e.building_slot}
                      </p>
                    </div>
                    {e.island_category && (
                      <Badge variant="secondary" className="text-[10px] capitalize">{e.island_category}</Badge>
                    )}
                  </div>
                  {e.store_slug ? (
                    <Link
                      to={`/store/${e.store_slug}`}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Visit store <ArrowRight className="w-3 h-3" />
                    </Link>
                  ) : (
                    <span className="text-xs text-muted-foreground/50">No storefront link</span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Link to hex map */}
        {entries.length > 0 && (
          <div className="text-center pt-4">
            <Link to="/ghost-world">
              <Button variant="ghost" className="gap-2 text-muted-foreground">
                <Map className="w-4 h-4" /> View the Hex Map
              </Button>
            </Link>
          </div>
        )}
      </div>
    </PortalPageLayout>
  );
}
