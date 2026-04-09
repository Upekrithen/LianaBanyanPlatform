import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/shells";
import { Hero } from "@/components/v2";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CurrencyAmount } from "@/components/CreditSymbol";
import { ArrowLeft, Store, Package, Clock, ShoppingCart, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { ForRentCard } from "@/components/v2/marketplace/ForRentCard";
import { CheckoutButton } from "@/components/storefront/CheckoutButton";
import { SubscriptionWidget } from "@/components/storefront/SubscriptionWidget";
import { CrewCallBand } from "@/components/storefront/CrewCallBand";
import { BusinessCardPreview } from "@/components/storefront/BusinessCardPreview";

type StorefrontRow = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  tagline: string | null;
  category: string;
  owner_name: string;
  is_open: boolean;
  status: string | null;
  production_linked: boolean | null;
  member_since: string | null;
  xp_score: number | null;
  logo_url: string | null;
  business_location: string | null;
  created_at: string;
};

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  cost_basis: number | null;
  currency_type: string;
  is_featured: boolean;
  order_count: number | null;
  order_threshold: number | null;
  threshold_deadline: string | null;
  production_status: string | null;
  image_url: string | null;
  sku: string | null;
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  accepting_orders: { label: "Accepting Orders", color: "bg-emerald-500/10 text-emerald-700" },
  threshold_met: { label: "Threshold Met — Producing Soon", color: "bg-blue-500/10 text-blue-700" },
  in_production: { label: "In Production", color: "bg-amber-500/10 text-amber-700" },
  shipped: { label: "Shipped", color: "bg-purple-500/10 text-purple-700" },
  completed: { label: "Completed", color: "bg-green-500/10 text-green-700" },
};

function ThresholdProgress({ product }: { product: ProductRow }) {
  if (!product.order_threshold) return null;

  const count = product.order_count ?? 0;
  const pct = Math.min(100, Math.round((count / product.order_threshold) * 100));
  const remaining = Math.max(0, product.order_threshold - count);

  const deadlineStr = product.threshold_deadline
    ? new Date(product.threshold_deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null;

  return (
    <div className="space-y-1.5 mt-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{count} of {product.order_threshold} orders</span>
        {deadlineStr && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Batch closes {deadlineStr}</span>}
      </div>
      <Progress value={pct} className="h-2" />
      {remaining > 0 && (
        <p className="text-xs text-muted-foreground">
          {remaining} more order{remaining !== 1 ? "s" : ""} to unlock batch pricing
        </p>
      )}
    </div>
  );
}

function CostBreakdown({ price, costBasis }: { price: number; costBasis: number | null }) {
  if (!costBasis || price <= 0) return null;
  const platformMargin = price - costBasis;
  const creatorKeeps = price * 0.833;

  return (
    <div className="text-xs text-muted-foreground space-y-0.5 mt-2 p-2 bg-muted/30 rounded-md">
      <div className="flex justify-between"><span>Cost basis:</span><span>{costBasis.toFixed(2)} credits</span></div>
      <div className="flex justify-between"><span>Platform margin (Cost+20%):</span><span>{platformMargin.toFixed(2)} credits</span></div>
      <div className="flex justify-between font-medium text-foreground"><span>Creator keeps (83.3%):</span><span>{creatorKeeps.toFixed(2)} credits</span></div>
    </div>
  );
}

export default function StorefrontDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const storefrontQuery = useQuery({
    queryKey: ["storefront-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("storefronts")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as unknown as StorefrontRow;
    },
    enabled: !!id,
  });

  const productsQuery = useQuery({
    queryKey: ["storefront-products", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("storefront_products")
        .select("*")
        .eq("storefront_id", id!)
        .order("is_featured", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ProductRow[];
    },
    enabled: !!id,
  });

  const subscriptionTiersQuery = useQuery({
    queryKey: ["storefront-subscriptions", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_tiers" as never)
        .select("id, name, price, service_frequency, service_description")
        .eq("storefront_id", id!) as { data: any[] | null; error: any };
      if (error) return [];
      return (data ?? []).map((t: any) => ({
        id: t.id,
        name: t.name,
        price: Number(t.price),
        frequency: t.service_frequency ?? "monthly",
        description: t.service_description,
      }));
    },
    enabled: !!id,
  });

  const crewRolesQuery = useQuery({
    queryKey: ["storefront-crew-roles", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_call_roles" as never)
        .select("id, role_name, description, hourly_rate, schedule_description, claimed_by")
        .eq("storefront_id", id!) as { data: any[] | null; error: any };
      if (error) return [];
      return data ?? [];
    },
    enabled: !!id,
  });

  const storefront = storefrontQuery.data;
  const products = productsQuery.data ?? [];
  const subscriptionTiers = subscriptionTiersQuery.data ?? [];
  const crewRoles = crewRolesQuery.data ?? [];
  const featured = useMemo(() => products.filter(p => p.is_featured), [products]);
  const other = useMemo(() => products.filter(p => !p.is_featured), [products]);
  const isPendingClaim = storefront?.status === "pending_claim";
  const isDemonstration = storefront?.status === "demonstration";
  const isServiceStorefront = storefront?.category?.includes("service");

  if (storefrontQuery.isLoading) {
    return (
      <AppShell pageTitle="Loading..." breadcrumbs="Marketplace / Storefront">
        <div className="flex items-center justify-center py-24 text-muted-foreground animate-pulse">
          Loading storefront...
        </div>
      </AppShell>
    );
  }

  if (!storefront) {
    return (
      <AppShell pageTitle="Not Found" breadcrumbs="Marketplace / Storefront">
        <div className="text-center py-24 space-y-4">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground" />
          <h2 className="text-xl font-semibold">Storefront not found</h2>
          <Link to="/marketplace" className="text-primary hover:underline">Back to Marketplace</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      xrayBase="storefront-detail"
      pageTitle={storefront.name}
      breadcrumbs={`Marketplace / ${storefront.name}`}
      hero={
        <Hero
          variant="app"
          eyebrow={storefront.category?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) ?? "Storefront"}
          headline={storefront.name}
          body={storefront.description ?? ""}
          primaryCTA={isPendingClaim
            ? { label: "Claim This Storefront", href: `/RedCarpet/${storefront.slug ?? storefront.id}` }
            : { label: "Browse Products", href: "#products" }
          }
          secondaryCTA={{ label: "Back to Marketplace", href: "/marketplace" }}
        />
      }
    >
      <div className="space-y-6 pb-16">
        {/* Status banners */}
        {isPendingClaim && (
          <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="py-4 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">This storefront is waiting for its creator</p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  We built this storefront for {storefront.owner_name}. If that's you, claim it to customize your products, pricing, and brand.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {isDemonstration && (
          <Card className="border-blue-300 bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="py-4 flex items-center gap-3">
              <Store className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200">Demonstration Storefront</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  This storefront demonstrates how an established business integrates with Liana Banyan's Cost+20% model.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Storefront info strip */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <Badge variant="outline">{storefront.is_open ? "Open" : "Closed"}</Badge>
          {storefront.tagline && <span className="italic">"{storefront.tagline}"</span>}
          {storefront.business_location && <span>📍 {storefront.business_location}</span>}
          {storefront.member_since && <span>Member since {new Date(storefront.member_since).getFullYear()}</span>}
          {storefront.production_linked && <Badge variant="secondary" className="gap-1"><Package className="w-3 h-3" />Production Linked</Badge>}
        </div>

        {/* Products */}
        <div id="products" className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Package className="w-5 h-5" />
            Products ({products.length})
          </h2>

          {products.length === 0 ? (
            <div className="space-y-4">
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  {isPendingClaim
                    ? "Products will appear once the creator claims this storefront."
                    : "No products listed yet."}
                </CardContent>
              </Card>
              <ForRentCard category={storefront.category} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...featured, ...other].map((product) => {
                const statusMeta = STATUS_LABELS[product.production_status ?? "accepting_orders"] ?? STATUS_LABELS.accepting_orders;
                const isPlaceholder = product.price === 0 && isPendingClaim;

                return (
                  <Card key={product.id} className={product.is_featured ? "border-primary/30" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-base">{product.name}</CardTitle>
                          {product.description && (
                            <CardDescription className="mt-1">{product.description}</CardDescription>
                          )}
                        </div>
                        {product.is_featured && <Badge className="shrink-0">Featured</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {!isPlaceholder && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold">
                              <CurrencyAmount amount={product.price} />
                            </span>
                            <Badge variant="secondary" className={statusMeta.color}>{statusMeta.label}</Badge>
                          </div>
                          <CostBreakdown price={product.price} costBasis={product.cost_basis} />
                          <ThresholdProgress product={product} />
                        </>
                      )}
                      {isPlaceholder && (
                        <p className="text-sm text-muted-foreground italic">Awaiting creator setup</p>
                      )}
                    </CardContent>
                    {!isPlaceholder && (
                      <CardFooter>
                        <CheckoutButton
                          storefrontId={storefront.id}
                          productId={product.id}
                          productName={product.name}
                          price={product.price}
                          costBasis={product.cost_basis}
                          isService={isServiceStorefront}
                          disabled={isPendingClaim || product.production_status === "completed"}
                          onOrderComplete={() => productsQuery.refetch()}
                        />
                      </CardFooter>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Subscription tiers (for service storefronts) */}
        {subscriptionTiers.length > 0 && storefront && (
          <SubscriptionWidget
            storefrontId={storefront.id}
            storefrontName={storefront.name}
            tiers={subscriptionTiers}
          />
        )}

        {/* Crew Call hiring */}
        {crewRoles.length > 0 && storefront && (
          <CrewCallBand
            storefrontName={storefront.name}
            roles={crewRoles}
          />
        )}

        {/* Business card generator (visible to storefront owner) */}
        {storefront && user && (
          <BusinessCardPreview
            storefrontId={storefront.id}
            storefrontName={storefront.name}
            storefrontSlug={storefront.slug}
            ownerName={storefront.owner_name}
            category={storefront.category}
            tagline={storefront.tagline}
            location={storefront.business_location}
          />
        )}

        {/* Cost+20% explainer */}
        <Card className="bg-muted/30">
          <CardContent className="py-4">
            <h3 className="font-medium flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              How Cost+20% Works
            </h3>
            <p className="text-sm text-muted-foreground">
              Every product on Liana Banyan shows its full cost breakdown. The creator sets their cost basis.
              The platform adds exactly 20% — no more. On every sale, the creator keeps 83.3%.
              Harper Auditors can verify any listing's costs at any time.
            </p>
          </CardContent>
        </Card>

        <ForRentCard category={storefront.category} variant="banner" />

        <div className="flex justify-center">
          <Link to="/marketplace" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Marketplace
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
