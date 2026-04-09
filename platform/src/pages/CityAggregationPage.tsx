import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/shells";
import { Hero, ProofStripItem } from "@/components/v2";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin, Store, Users, Shield, Star, Plus, Search,
  Building2, ArrowRight, TrendingUp, Globe
} from "lucide-react";

type CityStats = {
  city: string;
  state: string | null;
  region: string | null;
  active_neighborhoods: number;
  total_neighborhoods: number;
  total_storefronts: number;
  total_visitors: number;
  avg_harper_score: number;
  avg_rating: number;
  newest_neighborhood: string;
};

type NeighborhoodRow = {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string | null;
  template: string;
  description: string | null;
  harper_score: number;
  star_chamber_compliant: boolean;
  storefront_count: number;
  visitor_count: number;
  rating_avg: number;
  rating_count: number;
  status: string;
};

const TEMPLATE_LABELS: Record<string, string> = {
  "main-street": "Main Street",
  "art-district": "Art District",
  "food-court": "Food Court",
  "tech-hub": "Tech Hub",
  "market-square": "Market Square",
};

const TEMPLATE_COLORS: Record<string, string> = {
  "main-street": "bg-amber-500",
  "art-district": "bg-purple-500",
  "food-court": "bg-orange-500",
  "tech-hub": "bg-emerald-500",
  "market-square": "bg-blue-500",
};

const PROOF_ITEMS: ProofStripItem[] = [
  "Cost+20% guaranteed",
  "Harper Guild scored",
  "Star Chamber compliant",
  "83.3% to creators",
];

/* ─── City Directory (no :city param) ─── */
export function CityDirectoryPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const { data: cities = [], isLoading } = useQuery({
    queryKey: ["city-directory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("city_neighborhood_stats" as never)
        .select("*")
        .order("active_neighborhoods", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CityStats[];
    },
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return cities;
    const q = search.toLowerCase();
    return cities.filter(c =>
      c.city.toLowerCase().includes(q) ||
      (c.state ?? "").toLowerCase().includes(q) ||
      (c.region ?? "").toLowerCase().includes(q)
    );
  }, [cities, search]);

  return (
    <AppShell
      xrayBase="city-directory"
      pageTitle="Cities"
      breadcrumbs="Marketplace / Cities"
      hero={
        <Hero
          variant="app"
          eyebrow="Explore"
          headline="Cities on Liana Banyan"
          body="Every city with active neighborhoods is a local economic engine. Browse cities to discover storefronts, makers, and communities near you — or start a neighborhood in your own city."
          primaryCTA={{ label: "Browse cities", href: "#cities" }}
          secondaryCTA={user ? { label: "Start a neighborhood", href: "/neighborhoods/builder" } : undefined}
          proofStrip={PROOF_ITEMS}
        />
      }
    >
      <div className="space-y-6 pb-16">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search cities, states, or regions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div id="cities">
          {isLoading ? (
            <div className="text-muted-foreground animate-pulse py-12 text-center">Loading cities...</div>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center space-y-3">
                <Globe className="w-10 h-10 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">
                  {cities.length === 0 ? "No cities with neighborhoods yet. Be the first!" : "No cities match your search."}
                </p>
                {user && (
                  <Link to="/neighborhoods/builder">
                    <Button variant="outline" className="gap-2"><Plus className="w-4 h-4" /> Start a Neighborhood</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(city => (
                <CityCard key={`${city.city}-${city.state}`} city={city} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function CityCard({ city }: { city: CityStats }) {
  const slug = city.city.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <Link to={`/cities/${slug}`} className="group">
      <Card className="h-full transition-colors group-hover:border-primary/40">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base group-hover:text-primary transition-colors flex items-center gap-1.5">
                <Building2 className="w-4 h-4" /> {city.city}
              </CardTitle>
              <CardDescription>
                {city.state}{city.region ? ` · ${city.region}` : ""}
              </CardDescription>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <StatPill icon={MapPin} label="Neighborhoods" value={city.active_neighborhoods} />
            <StatPill icon={Store} label="Storefronts" value={city.total_storefronts} />
            <StatPill icon={Users} label="Visitors" value={city.total_visitors} />
            {city.avg_harper_score > 0 && (
              <StatPill icon={Shield} label="Avg Harper" value={Number(city.avg_harper_score).toFixed(1)} />
            )}
          </div>
          {city.avg_rating > 0 && (
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <Star className="w-3 h-3 fill-amber-500" /> {Number(city.avg_rating).toFixed(1)} avg rating
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function StatPill({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <Icon className="w-3 h-3 shrink-0" />
      <span className="font-medium text-foreground">{value}</span>
      <span className="text-xs truncate">{label}</span>
    </div>
  );
}


/* ─── City Detail (with :city param) ─── */
export default function CityAggregationPage() {
  const { city: citySlug } = useParams<{ city: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const cityName = (citySlug ?? "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  const { data: neighborhoods = [], isLoading } = useQuery({
    queryKey: ["city-neighborhoods", citySlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("neighborhoods" as never)
        .select("*")
        .eq("status", "active")
        .ilike("city", cityName)
        .order("visitor_count", { ascending: false });
      if (error) throw error;
      return (data ?? []) as NeighborhoodRow[];
    },
    enabled: !!citySlug,
  });

  const stats = useMemo(() => ({
    total: neighborhoods.length,
    storefronts: neighborhoods.reduce((a, n) => a + (n.storefront_count ?? 0), 0),
    visitors: neighborhoods.reduce((a, n) => a + (n.visitor_count ?? 0), 0),
    avgHarper: neighborhoods.length
      ? (neighborhoods.reduce((a, n) => a + Number(n.harper_score), 0) / neighborhoods.length)
      : 0,
  }), [neighborhoods]);

  const templateDist = useMemo(() => {
    const counts: Record<string, number> = {};
    neighborhoods.forEach(n => {
      const t = n.template ?? "main-street";
      counts[t] = (counts[t] ?? 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [neighborhoods]);

  return (
    <AppShell
      xrayBase="city-aggregation"
      pageTitle={cityName}
      breadcrumbs={`Cities / ${cityName}`}
      hero={
        <Hero
          variant="app"
          eyebrow="City"
          headline={cityName}
          body={`${stats.total} active neighborhood${stats.total !== 1 ? "s" : ""} with ${stats.storefronts} storefronts and ${stats.visitors} total visitors. Every neighborhood follows Cost+20% pricing and Harper Guild quality standards.`}
          primaryCTA={{ label: "Browse neighborhoods", href: "#map" }}
          secondaryCTA={user ? { label: "Start one here", href: "/neighborhoods/builder" } : undefined}
        />
      }
    >
      <div className="space-y-6 pb-16">
        {/* City stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: MapPin, label: "Neighborhoods", value: stats.total },
            { icon: Store, label: "Storefronts", value: stats.storefronts },
            { icon: Users, label: "Total Visitors", value: stats.visitors },
            { icon: Shield, label: "Avg Harper Score", value: stats.avgHarper > 0 ? stats.avgHarper.toFixed(1) : "—" },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="py-3 flex items-center gap-3">
                <div className="bg-primary/10 text-primary rounded-md p-2">
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Template distribution (mini visual map) */}
        {templateDist.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Neighborhood Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-1 h-6 rounded-full overflow-hidden">
                {templateDist.map(([tmpl, count]) => (
                  <div
                    key={tmpl}
                    className={`${TEMPLATE_COLORS[tmpl] ?? "bg-muted"} transition-all relative group`}
                    style={{ flex: count }}
                    title={`${TEMPLATE_LABELS[tmpl] ?? tmpl}: ${count}`}
                  >
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                {templateDist.map(([tmpl, count]) => (
                  <span key={tmpl} className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${TEMPLATE_COLORS[tmpl] ?? "bg-muted"}`} />
                    {TEMPLATE_LABELS[tmpl] ?? tmpl} ({count})
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Block-style neighborhood map */}
        <div id="map" className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5" /> Neighborhoods in {cityName}
          </h2>

          {isLoading ? (
            <div className="text-muted-foreground animate-pulse py-8 text-center">Loading neighborhoods...</div>
          ) : neighborhoods.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center space-y-3">
                <Building2 className="w-10 h-10 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">No active neighborhoods in {cityName} yet.</p>
                {user && (
                  <Link to="/neighborhoods/builder">
                    <Button className="gap-2"><Plus className="w-4 h-4" /> Be the first!</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            /* Street-grid visualization: rows of "blocks" */
            <div className="space-y-3">
              {/* Row pairs to emulate a street grid */}
              {chunk(neighborhoods, 3).map((row, ri) => (
                <div key={ri}>
                  {ri > 0 && (
                    <div className="flex items-center gap-2 py-1.5 text-xs text-muted-foreground">
                      <div className="flex-1 border-t border-dashed border-muted-foreground/30" />
                      <span>Street {ri + 1}</span>
                      <div className="flex-1 border-t border-dashed border-muted-foreground/30" />
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {row.map(n => (
                      <Link key={n.id} to={`/neighborhoods/${n.slug}`} className="group">
                        <Card className={`h-full transition-all group-hover:border-primary/40 group-hover:shadow-md border-t-4 ${
                          n.template ? `border-t-${templateColorName(n.template)}-500` : ""
                        }`}
                          style={{ borderTopColor: templateHex(n.template) }}
                        >
                          <CardHeader className="pb-1">
                            <CardTitle className="text-sm group-hover:text-primary transition-colors">{n.name}</CardTitle>
                            <CardDescription className="text-xs">
                              {TEMPLATE_LABELS[n.template] ?? n.template}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-1.5">
                            {n.description && <p className="text-xs text-muted-foreground line-clamp-2">{n.description}</p>}
                            <div className="flex flex-wrap items-center gap-1.5 text-xs">
                              <span className="flex items-center gap-0.5 text-muted-foreground">
                                <Store className="w-3 h-3" /> {n.storefront_count}
                              </span>
                              <span className="flex items-center gap-0.5 text-muted-foreground">
                                <Users className="w-3 h-3" /> {n.visitor_count}
                              </span>
                              {n.harper_score > 0 && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-0.5 text-emerald-600 bg-emerald-500/10">
                                  <Shield className="w-2.5 h-2.5" /> {Number(n.harper_score).toFixed(1)}
                                </Badge>
                              )}
                              {n.rating_count > 0 && (
                                <span className="flex items-center gap-0.5 text-amber-600">
                                  <Star className="w-3 h-3 fill-amber-500" /> {Number(n.rating_avg).toFixed(1)}
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        {user && neighborhoods.length > 0 && (
          <div className="flex justify-center pt-2">
            <Link to="/neighborhoods/builder">
              <Button className="gap-2"><Plus className="w-4 h-4" /> Start a Neighborhood in {cityName}</Button>
            </Link>
          </div>
        )}

        <div className="flex justify-center">
          <Link to="/cities" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            <Globe className="w-4 h-4" /> All cities
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

function templateColorName(template: string): string {
  const map: Record<string, string> = {
    "main-street": "amber", "art-district": "purple", "food-court": "orange",
    "tech-hub": "emerald", "market-square": "blue",
  };
  return map[template] ?? "gray";
}

function templateHex(template: string): string {
  const map: Record<string, string> = {
    "main-street": "#f59e0b", "art-district": "#a855f7", "food-court": "#f97316",
    "tech-hub": "#10b981", "market-square": "#3b82f6",
  };
  return map[template] ?? "#9ca3af";
}
