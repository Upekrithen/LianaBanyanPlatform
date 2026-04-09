/**
 * GleanersCorner — /gleaners-corner on .org
 * Shows the 3.3% charitable fund accumulation and deployment.
 */
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Wheat, TrendingUp, Target, MapPin,
  ArrowRight, Loader2
} from "lucide-react";

const INITIATIVE_TARGETS = [
  { slug: "lmd", label: "Let's Make Dinner", color: "bg-amber-500" },
  { slug: "lgg", label: "Let's Get Groceries", color: "bg-emerald-500" },
  { slug: "lgs", label: "Let's Go Shopping", color: "bg-violet-500" },
  { slug: "mission-one", label: "Mission ONE General", color: "bg-rose-500" },
];

export default function GleanersCorner() {
  const { data, isLoading } = useQuery({
    queryKey: ["gleaners-corner"],
    queryFn: async () => {
      const { data: earmarks } = await supabase
        .from("earmarked_credits" as never)
        .select("amount_cents, target_type, target_label, status") as {
          data: { amount_cents: number; target_type: string; target_label: string; status: string }[] | null;
        };

      const rows = earmarks || [];
      const totalEarmarked = rows.reduce((s, r) => s + r.amount_cents, 0);
      const deployed = rows.filter((r) => r.status === "deployed").reduce((s, r) => s + r.amount_cents, 0);
      const active = rows.filter((r) => r.status === "active").reduce((s, r) => s + r.amount_cents, 0);

      const byTarget = rows.reduce<Record<string, number>>((acc, r) => {
        acc[r.target_label] = (acc[r.target_label] || 0) + r.amount_cents;
        return acc;
      }, {});

      return { totalEarmarked, deployed, active, byTarget, count: rows.length };
    },
    staleTime: 30_000,
  });

  const fmt = (cents: number) => `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-8 max-w-4xl mx-auto" data-xray-id="gleaners-corner-page">
      <div data-xray-id="gleaners-corner-hero">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Wheat className="w-7 h-7 text-amber-400" />
          Gleaner's Corner
        </h1>
        <p className="text-muted-foreground mt-1">
          3.3% of every transaction flows into Gleaner's Corner — the network's charitable fund.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-amber-400" />
                <p className="text-3xl font-bold">{fmt(data?.totalEarmarked || 0)}</p>
                <p className="text-xs text-muted-foreground">Total Earmarked</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Target className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
                <p className="text-3xl font-bold">{fmt(data?.active || 0)}</p>
                <p className="text-xs text-muted-foreground">Active (Awaiting Deploy)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="w-6 h-6 mx-auto mb-2 text-violet-400" />
                <p className="text-3xl font-bold">{fmt(data?.deployed || 0)}</p>
                <p className="text-xs text-muted-foreground">Deployed to Nodes</p>
              </CardContent>
            </Card>
          </div>

          {/* How 3.3% Works */}
          <Card className="bg-zinc-900 border-zinc-800" data-xray-id="gleaners-corner-explanation">
            <CardHeader>
              <CardTitle className="text-base text-zinc-100">How Gleaner's Corner Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-zinc-200">
              <p>
                Every paid transaction on the platform automatically allocates 3.3% to Gleaner's Corner.
                This isn't a fee on top — it's built into the platform's Cost+20% margin. The creator
                still keeps 83.3%.
              </p>
              <p>
                Funds accumulate until members earmark them to specific initiatives and areas.
                Once earmarked, credits are deployed to local storefronts and restaurants to cover
                Mission ONE meals and other charitable programs.
              </p>
            </CardContent>
          </Card>

          {/* Fund by Initiative */}
          <Card data-xray-id="gleaners-corner-fund-distribution">
            <CardHeader>
              <CardTitle className="text-base">Fund Distribution by Initiative</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {INITIATIVE_TARGETS.map((init) => {
                const amount = data?.byTarget[init.label] || 0;
                const total = data?.totalEarmarked || 1;
                const pct = total > 0 ? (amount / total) * 100 : 0;
                return (
                  <div key={init.slug} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{init.label}</span>
                      <span className="text-muted-foreground">{fmt(amount)} ({pct.toFixed(0)}%)</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                );
              })}
              {data?.count === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No earmarked credits yet. Be the first to direct your credits.
                </p>
              )}
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center">
            <Link to="/subscribe">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white">
                <Target className="w-4 h-4 mr-2" />
                Earmark Your Credits
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
