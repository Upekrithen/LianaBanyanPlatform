import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/shells";
import { Hero } from "@/components/v2";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyAmount } from "@/components/CreditSymbol";
import {
  MapPin, Store, Star, Shield, Users, ArrowLeft, ArrowRight,
  ShoppingBag, Package, AlertCircle, Sparkles, Loader2, AlertTriangle
} from "lucide-react";
import { ForRentCard } from "@/components/v2/marketplace/ForRentCard";
import { PlatformRulesBadge } from "@/components/neighborhoods/PlatformRulesBadge";
import { scopeCustomCss } from "@/hooks/useContentShield";
import { toast } from "sonner";

const TEMPLATE_LABELS: Record<string, string> = {
  "main-street": "Main Street",
  "art-district": "Art District",
  "food-court": "Food Court",
  "tech-hub": "Tech Hub",
  "market-square": "Market Square",
};

const TEMPLATE_ACCENT: Record<string, string> = {
  "main-street": "border-t-amber-500",
  "art-district": "border-t-purple-500",
  "food-court": "border-t-orange-500",
  "tech-hub": "border-t-emerald-500",
  "market-square": "border-t-blue-500",
};

function RatingWidget({ neighborhoodId, userId }: { neighborhoodId: string; userId: string | undefined }) {
  const qc = useQueryClient();
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [showComment, setShowComment] = useState(false);

  const { data: existing } = useQuery({
    queryKey: ["my-neighborhood-rating", neighborhoodId, userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("neighborhood_ratings" as never)
        .select("rating, comment")
        .eq("neighborhood_id", neighborhoodId)
        .eq("user_id", userId!)
        .maybeSingle();
      return data as { rating: number; comment: string | null } | null;
    },
    enabled: !!userId,
  });

  const rateMutation = useMutation({
    mutationFn: async (rating: number) => {
      const { error } = await supabase
        .from("neighborhood_ratings" as never)
        .upsert({
          neighborhood_id: neighborhoodId,
          user_id: userId!,
          rating,
          comment: comment || null,
        } as never, { onConflict: "neighborhood_id,user_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Rating saved!");
      qc.invalidateQueries({ queryKey: ["my-neighborhood-rating", neighborhoodId] });
      qc.invalidateQueries({ queryKey: ["neighborhood-detail"] });
      setShowComment(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (!userId) return null;

  const currentRating = existing?.rating ?? 0;

  return (
    <Card>
      <CardContent className="py-4 space-y-2">
        <p className="text-sm font-medium">Rate this neighborhood</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => {
                if (n === currentRating && !showComment) {
                  setShowComment(true);
                  return;
                }
                rateMutation.mutate(n);
              }}
              className="p-0.5 transition-transform hover:scale-110"
              disabled={rateMutation.isPending}
            >
              <Star className={`w-6 h-6 transition-colors ${
                n <= (hover || currentRating)
                  ? "text-amber-500 fill-amber-500"
                  : "text-muted-foreground"
              }`} />
            </button>
          ))}
          {rateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
          {currentRating > 0 && <span className="text-xs text-muted-foreground ml-2">Your rating: {currentRating}/5</span>}
        </div>
        {(showComment || existing?.comment) && (
          <div className="flex gap-2 items-end">
            <Textarea
              value={comment || existing?.comment || ""}
              onChange={e => setComment(e.target.value)}
              placeholder="Optional comment..."
              rows={2}
              className="text-sm flex-1"
            />
            <Button size="sm" onClick={() => rateMutation.mutate(currentRating || 3)} disabled={rateMutation.isPending}>
              Save
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function NeighborhoodDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  const { data: neighborhood, isLoading: loadingHood } = useQuery({
    queryKey: ["neighborhood-detail", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("neighborhoods" as never)
        .select("*")
        .eq("slug", slug!)
        .single();
      if (error) throw error;
      return data as any;
    },
    enabled: !!slug,
  });

  const { data: storefronts = [] } = useQuery({
    queryKey: ["neighborhood-storefronts", neighborhood?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("neighborhood_storefronts" as never)
        .select("sort_order, storefront:storefront_id(id, name, slug, description, category, owner_name, is_open, status, tagline)")
        .eq("neighborhood_id", neighborhood.id)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((row: any) => ({ ...row.storefront, sort_order: row.sort_order }));
    },
    enabled: !!neighborhood?.id,
  });

  const { data: siblings = [] } = useQuery({
    queryKey: ["neighborhood-siblings", neighborhood?.city],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("neighborhoods" as never)
        .select("slug, name")
        .eq("city", neighborhood.city)
        .eq("status", "active")
        .neq("slug", slug!)
        .limit(5);
      if (error) throw error;
      return (data ?? []) as { slug: string; name: string }[];
    },
    enabled: !!neighborhood?.city,
  });

  if (loadingHood) {
    return (
      <AppShell pageTitle="Loading..." breadcrumbs="Neighborhoods">
        <div className="flex items-center justify-center py-24 text-muted-foreground animate-pulse">Loading neighborhood...</div>
      </AppShell>
    );
  }

  if (!neighborhood) {
    return (
      <AppShell pageTitle="Not Found" breadcrumbs="Neighborhoods">
        <div className="text-center py-24 space-y-4">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground" />
          <h2 className="text-xl font-semibold">Neighborhood not found</h2>
          <Link to="/neighborhoods" className="text-primary hover:underline">Browse all neighborhoods</Link>
        </div>
      </AppShell>
    );
  }

  const template = neighborhood.template ?? "main-street";
  const accent = TEMPLATE_ACCENT[template] ?? "";

  return (
    <AppShell
      xrayBase="neighborhood-detail"
      pageTitle={neighborhood.name}
      breadcrumbs={`Neighborhoods / ${neighborhood.city} / ${neighborhood.name}`}
      hero={
        <Hero
          variant="app"
          eyebrow={`${neighborhood.city}${neighborhood.state ? `, ${neighborhood.state}` : ""} — ${TEMPLATE_LABELS[template] ?? template}`}
          headline={neighborhood.name}
          body={neighborhood.description ?? "A local marketplace neighborhood on Liana Banyan."}
          primaryCTA={{ label: "Browse storefronts", href: "#storefronts" }}
          secondaryCTA={{ label: "All neighborhoods", href: "/neighborhoods" }}
        />
      }
    >
      <div className="space-y-6 pb-16">
        {/* Suspension banner */}
        {neighborhood.status === "suspended" && (
          <Card className="border-red-500/40 bg-red-500/5">
            <CardContent className="py-3 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-red-700">Neighborhood Suspended</p>
                <p className="text-red-600/80">Harper Guild score dropped below the 2.0 threshold. The owner must address quality issues to restore this neighborhood.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Welcome message */}
        {neighborhood.welcome_message && (
          <Card className="bg-muted/30">
            <CardContent className="py-4">
              <p className="text-sm italic text-muted-foreground">"{neighborhood.welcome_message}"</p>
            </CardContent>
          </Card>
        )}

        {/* Stats strip */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Badge variant="outline" className="gap-1">
            <MapPin className="w-3 h-3" /> {neighborhood.city}{neighborhood.state ? `, ${neighborhood.state}` : ""}
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Store className="w-3 h-3" /> {storefronts.length} storefronts
          </Badge>
          {neighborhood.harper_score > 0 && (
            <Badge variant="secondary" className="gap-1 text-emerald-600 bg-emerald-500/10">
              <Shield className="w-3 h-3" /> Harper {Number(neighborhood.harper_score).toFixed(1)}
            </Badge>
          )}
          {neighborhood.star_chamber_compliant && (
            <Badge variant="secondary" className="gap-1 text-blue-600 bg-blue-500/10">
              <Shield className="w-3 h-3" /> Star Chamber Compliant
            </Badge>
          )}
          <Badge variant="secondary" className="gap-1">
            <Users className="w-3 h-3" /> {neighborhood.visitor_count ?? 0} visitors
          </Badge>
          {neighborhood.rating_count > 0 && (
            <Badge variant="secondary" className="gap-1 text-amber-600 bg-amber-500/10">
              <Star className="w-3 h-3 fill-amber-500" /> {Number(neighborhood.rating_avg).toFixed(1)} ({neighborhood.rating_count})
            </Badge>
          )}
        </div>

        {/* Storefronts */}
        <div id="storefronts" className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Store className="w-5 h-5" /> Storefronts in {neighborhood.name}
          </h2>

          {storefronts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>No storefronts have been added to this neighborhood yet.</p>
                {neighborhood.owner_id === user?.id && (
                  <Link to="/neighborhoods/builder" className="text-primary hover:underline mt-2 inline-block">
                    Add storefronts in the builder
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {storefronts.map((sf: any) => (
                <Link key={sf.id} to={`/storefront/${sf.id}`} className="group">
                  <Card className={`h-full transition-colors group-hover:border-primary/40 border-t-4 ${accent}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base group-hover:text-primary transition-colors">{sf.name}</CardTitle>
                        <Badge variant={sf.is_open ? "default" : "secondary"}>
                          {sf.is_open ? "Open" : "Closed"}
                        </Badge>
                      </div>
                      <CardDescription>{sf.owner_name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {sf.description && <p className="text-sm text-muted-foreground line-clamp-2">{sf.description}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {sf.category?.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                        </Badge>
                        {sf.status === "pending_claim" && (
                          <Badge variant="outline" className="text-xs gap-1 text-amber-600">
                            <Sparkles className="w-3 h-3" /> Awaiting Creator
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Nearby neighborhoods portal */}
        {siblings.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ArrowRight className="w-5 h-5" /> More in {neighborhood.city}
            </h2>
            <div className="flex flex-wrap gap-2">
              {siblings.map(s => (
                <Link key={s.slug} to={`/neighborhoods/${s.slug}`}>
                  <Button variant="outline" size="sm" className="gap-1">
                    <MapPin className="w-3 h-3" /> {s.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Visitor rating */}
        <RatingWidget neighborhoodId={neighborhood.id} userId={user?.id} />

        {/* City link */}
        {neighborhood.city && (
          <Link
            to={`/cities/${neighborhood.city.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
            className="block"
          >
            <Card className="transition-colors hover:border-primary/40">
              <CardContent className="py-3 flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  See all neighborhoods in <span className="font-medium">{neighborhood.city}</span>
                </span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Scoped custom CSS (sandboxed) */}
        {neighborhood.custom_css && (
          <style dangerouslySetInnerHTML={{ __html: scopeCustomCss(neighborhood.custom_css) }} />
        )}

        <ForRentCard variant="inline" />

        {/* Immutable platform rules badge — cannot be hidden by custom CSS */}
        <PlatformRulesBadge />

        <div className="flex justify-center">
          <Link to="/neighborhoods" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> All neighborhoods
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
