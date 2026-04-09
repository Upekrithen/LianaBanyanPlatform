import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Megaphone, Sparkles, Loader2, Newspaper, CreditCard, Store } from "lucide-react";
import { toast } from "sonner";

const PROMO_COST = 5;

type StorefrontOption = { id: string; name: string };
type PromotionRow = {
  id: string;
  storefront_id: string | null;
  promotion_date: string;
  credits_paid: number;
  status: string;
  created_at: string | null;
};

function statusBadgeClass(s: string) {
  if (s === "approved" || s === "active") return "border-emerald-500/40 text-emerald-500";
  if (s === "pending") return "border-amber-500/40 text-amber-500";
  if (s === "expired") return "border-muted-foreground/40 text-muted-foreground";
  return "";
}

export default function ShowcasePromotion() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [selectedStorefront, setSelectedStorefront] = useState("");
  const [promoDate, setPromoDate] = useState("");

  const { data: storefronts = [] } = useQuery({
    queryKey: ["my-storefronts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("storefronts")
        .select("id, name")
        .eq("user_id", user.id)
        .order("name");
      if (error) throw error;
      return (data ?? []) as StorefrontOption[];
    },
    enabled: !!user,
  });

  const { data: promotions = [], isLoading } = useQuery({
    queryKey: ["my-showcase-promos", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("showcase_promotions" as never)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as PromotionRow[];
    },
    enabled: !!user,
  });

  const submit = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in first");
      if (!selectedStorefront) throw new Error("Select a storefront");
      if (!promoDate) throw new Error("Pick a promotion date");
      const { error } = await supabase.from("showcase_promotions" as never).insert({
        user_id: user.id,
        storefront_id: selectedStorefront,
        promotion_date: promoDate,
        credits_paid: PROMO_COST,
        status: "pending",
      } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Promotion request submitted!");
      setSelectedStorefront("");
      setPromoDate("");
      qc.invalidateQueries({ queryKey: ["my-showcase-promos"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const storeName = (id: string | null) => storefronts.find((s) => s.id === id)?.name ?? "—";

  return (
    <PortalPageLayout
      title="Showcase Promotion"
      subtitle="Get your store featured on The Daily News"
      maxWidth="lg"
      xrayId="showcase-promotion"
    >
      <div className="space-y-8 pb-12">
        {/* How it works */}
        <Card className="bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/20">
          <CardContent className="pt-6 flex flex-col sm:flex-row gap-6 items-start">
            <Newspaper className="w-10 h-10 text-amber-400 shrink-0" />
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">How Daily News Promotions Work</h3>
              <p className="text-sm text-muted-foreground">
                Submit your storefront and pick a date. Approved promotions appear in the Daily News carousel
                as a sponsored slide visible to all members. Each promotion costs <strong>{PROMO_COST} Credits</strong> and
                runs for one day.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Megaphone className="w-5 h-5" /> Request a Promotion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {storefronts.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                <Store className="w-8 h-8 mx-auto mb-2 opacity-30" />
                You don't have a storefront yet. Create one first to request a promotion.
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Storefront</Label>
                    <Select value={selectedStorefront} onValueChange={setSelectedStorefront}>
                      <SelectTrigger><SelectValue placeholder="Select your store" /></SelectTrigger>
                      <SelectContent>
                        {storefronts.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="promo-date">Desired date</Label>
                    <Input
                      id="promo-date"
                      type="date"
                      value={promoDate}
                      onChange={(e) => setPromoDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 10)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
                  <span className="text-sm flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-400" /> Cost
                  </span>
                  <span className="font-semibold">{PROMO_COST} Credits</span>
                </div>

                <Button
                  onClick={() => submit.mutate()}
                  disabled={!selectedStorefront || !promoDate || submit.isPending}
                  className="w-full sm:w-auto"
                >
                  {submit.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…</>
                  ) : (
                    <><Sparkles className="mr-2 h-4 w-4" /> Submit Promotion Request</>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Promotion history */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">My Promotions</h2>
          {isLoading ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Loading…</CardContent></Card>
          ) : promotions.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-30" />
                No promotions yet. Submit your first request above.
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-4">Store</th>
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Credits</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {promotions.map((p) => (
                    <tr key={p.id} className="border-b border-border/60 last:border-0">
                      <td className="py-3 pr-4 font-medium">{storeName(p.storefront_id)}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{p.promotion_date}</td>
                      <td className="py-3 pr-4 tabular-nums">{p.credits_paid}</td>
                      <td className="py-3">
                        <Badge variant="outline" className={`capitalize ${statusBadgeClass(p.status)}`}>
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PortalPageLayout>
  );
}
