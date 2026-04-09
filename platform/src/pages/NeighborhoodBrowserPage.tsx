import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/shells";
import { Hero, ProofStripItem } from "@/components/v2";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Store, Star, Users, Shield, Plus, Search } from "lucide-react";

type NeighborhoodRow = {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string | null;
  region: string | null;
  owner_id: string | null;
  owner_type: string;
  template: string;
  description: string | null;
  harper_score: number;
  star_chamber_compliant: boolean;
  storefront_count: number;
  visitor_count: number;
  rating_avg: number;
  rating_count: number;
  status: string;
  created_at: string;
};

const PROOF_ITEMS: ProofStripItem[] = [
  "5 templates",
  "Harper Guild scored",
  "Cost+20% guaranteed",
  "Star Chamber compliant",
];

const TEMPLATE_LABELS: Record<string, string> = {
  "main-street": "Main Street",
  "art-district": "Art District",
  "food-court": "Food Court",
  "tech-hub": "Tech Hub",
  "market-square": "Market Square",
};

function HarperScoreBadge({ score }: { score: number }) {
  const color = score >= 4 ? "text-emerald-600 bg-emerald-500/10"
    : score >= 3 ? "text-amber-600 bg-amber-500/10"
    : score >= 1 ? "text-orange-600 bg-orange-500/10"
    : "text-muted-foreground bg-muted";
  return (
    <Badge variant="secondary" className={`gap-1 ${color}`}>
      <Shield className="w-3 h-3" />
      Harper {score.toFixed(1)}
    </Badge>
  );
}

export default function NeighborhoodBrowserPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState<string>("all");

  const { data: neighborhoods = [], isLoading } = useQuery({
    queryKey: ["neighborhoods-browse"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("neighborhoods" as never)
        .select("*")
        .eq("status", "active")
        .order("visitor_count", { ascending: false });
      if (error) throw error;
      return (data ?? []) as NeighborhoodRow[];
    },
  });

  const cities = useMemo(() => {
    const set = new Set(neighborhoods.map(n => n.city));
    return Array.from(set).sort();
  }, [neighborhoods]);

  const filtered = useMemo(() => {
    let rows = neighborhoods;
    if (cityFilter !== "all") {
      rows = rows.filter(n => n.city === cityFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(n =>
        n.name.toLowerCase().includes(q) ||
        n.city.toLowerCase().includes(q) ||
        (n.description ?? "").toLowerCase().includes(q)
      );
    }
    return rows;
  }, [neighborhoods, cityFilter, search]);

  return (
    <AppShell
      xrayBase="neighborhoods"
      pageTitle="Neighborhoods"
      breadcrumbs="Marketplace / Neighborhoods"
      hero={
        <Hero
          variant="app"
          eyebrow="Neighborhoods"
          headline="Your corner of the Galactic Empire."
          body="Browse local marketplace sections customized by members in your city. Every neighborhood follows the same rules — Cost+20%, Harper Guild quality, Star Chamber compliance — but each one looks and feels like its creator."
          primaryCTA={{ label: "Browse neighborhoods", href: "#neighborhood-grid" }}
          secondaryCTA={user ? { label: "Start a neighborhood", href: "/neighborhoods/builder" } : undefined}
          proofStrip={PROOF_ITEMS}
        />
      }
    >
      <div className="space-y-6 pb-16">
        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search neighborhoods..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cities</SelectItem>
              {cities.map(city => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        <div id="neighborhood-grid">
          {isLoading ? (
            <div className="text-muted-foreground animate-pulse py-12 text-center">Loading neighborhoods...</div>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center space-y-3">
                <MapPin className="w-10 h-10 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">
                  {neighborhoods.length === 0
                    ? "No neighborhoods have been created yet. Be the first!"
                    : "No neighborhoods match your search."}
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
              {filtered.map(n => (
                <Link key={n.id} to={`/neighborhoods/${n.slug}`} className="group">
                  <Card className="h-full transition-colors group-hover:border-primary/40">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-base group-hover:text-primary transition-colors">{n.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" /> {n.city}{n.state ? `, ${n.state}` : ""}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">{TEMPLATE_LABELS[n.template] ?? n.template}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {n.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{n.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <HarperScoreBadge score={n.harper_score} />
                        {n.star_chamber_compliant && (
                          <Badge variant="secondary" className="gap-1 text-blue-600 bg-blue-500/10">
                            <Shield className="w-3 h-3" /> Compliant
                          </Badge>
                        )}
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Store className="w-3 h-3" /> {n.storefront_count} storefronts
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-3 h-3" /> {n.visitor_count} visitors
                        </span>
                        {n.rating_count > 0 && (
                          <span className="flex items-center gap-1 text-amber-600">
                            <Star className="w-3 h-3 fill-amber-500" /> {n.rating_avg.toFixed(1)} ({n.rating_count})
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {user && neighborhoods.length > 0 && (
          <div className="flex justify-center pt-4">
            <Link to="/neighborhoods/builder">
              <Button className="gap-2"><Plus className="w-4 h-4" /> Start Your Own Neighborhood</Button>
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
