/**
 * STEWARD DASHBOARD — Tier, stats, active pledges, Pizza Oven indicator
 * For users who ARE stewards: full dashboard. For users who are NOT: redirect or apply CTA.
 * Route: /steward (protected)
 * SEC: operational surplus, service value; no investment/return.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, Flame, TrendingUp, Coins, CheckCircle, XCircle, Pizza } from "lucide-react";
import { toast } from "sonner";

const TIER_LABELS: Record<string, string> = {
  apprentice: "Apprentice",
  journeyman: "Journeyman",
  master_steward: "Master Steward",
  grand_steward: "Grand Steward",
};

const STATUS_LABELS: Record<string, string> = {
  held: "Held",
  released: "Released",
  absorbed: "Absorbed",
  partial_release: "Partial release",
};

export default function StewardDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["steward-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("steward_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: tierLimits } = useQuery({
    queryKey: ["steward-tier-limits"],
    queryFn: async () => {
      const keys = [
        "steward_apprentice_max_projects",
        "steward_journeyman_max_projects",
        "steward_master_max_projects",
        "steward_grand_max_projects",
        "steward_apprentice_max_pledge",
        "steward_journeyman_max_pledge",
        "steward_master_max_pledge",
        "steward_grand_max_pledge",
      ];
      const { data } = await supabase
        .from("dna_lock")
        .select("parameter_key, parameter_value")
        .in("parameter_key", keys);
      const map: Record<string, number> = {};
      data?.forEach((r: { parameter_key: string; parameter_value: string }) => {
        map[r.parameter_key] = parseInt(r.parameter_value || "0", 10);
      });
      return map;
    },
  });

  const { data: pledges } = useQuery({
    queryKey: ["steward-pledges", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("pledged_marks_escrow")
        .select("*")
        .eq("pledger_id", user.id)
        .order("pledged_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!profile,
  });

  if (!user) {
    return (
      <div className="container max-w-2xl mx-auto p-6 text-center">
        <Card>
          <CardContent className="py-8">
            <p className="text-muted-foreground mb-4">Sign in to view the Steward Dashboard.</p>
            <Button asChild><Link to="/auth">Sign in</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-6 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container max-w-2xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Become a Steward
            </CardTitle>
            <CardDescription>
              Manage campaigns. Pledge your Marks. The oven&apos;s already hot — cook more pizzas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You don&apos;t have a Steward profile yet. Apply to join as an Apprentice and start managing projects.
            </p>
            <Button asChild>
              <Link to="/steward/apply">Apply to become a Steward</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activePledges = pledges?.filter((p) => p.status === "held") || [];
  const completedPledges = pledges?.filter((p) => p.status !== "held") || [];
  const totalHeld = activePledges.reduce((s, p) => s + Number(p.amount_pledged || 0), 0);
  const tierKey = profile.steward_tier === "master_steward" ? "master" : profile.steward_tier === "grand_steward" ? "grand" : profile.steward_tier;
  const maxPledgeKey = `steward_${tierKey}_max_pledge`;
  const maxProjectsKey = `steward_${tierKey}_max_projects`;
  const concurrentLimit = tierLimits?.[maxProjectsKey] ?? profile.concurrent_limit ?? 1;
  const maxPledgePerProject = tierLimits?.[maxPledgeKey] ?? Number(profile.max_pledge_limit) ?? 500;
  const availableCapacity = Math.max(0, maxPledgePerProject - totalHeld);
  const pizzaOvenActive = activePledges.length >= 2;

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6" data-xray-id="steward-dashboard">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            Steward Dashboard
          </h1>
          <p className="text-muted-foreground">Manage projects. Pledge Marks. Earn operational surplus.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-base">
            {TIER_LABELS[profile.steward_tier] ?? profile.steward_tier}
          </Badge>
          {pizzaOvenActive && (
            <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/40 gap-1">
              <Pizza className="w-3 h-3" />
              Pizza Oven
            </Badge>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Projects managed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.total_projects_managed ?? 0}</div>
            <p className="text-xs text-muted-foreground">Successful: {profile.successful_projects ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Trust score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((profile.trust_score ?? 0) * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Concurrent limit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{concurrentLimit}</div>
            <p className="text-xs text-muted-foreground">Active: {activePledges.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pledge capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableCapacity.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Marks available</p>
          </CardContent>
        </Card>
      </div>

      {/* Total pledged / earned */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <Coins className="w-8 h-8 text-amber-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total pledged (all time)</p>
              <p className="text-xl font-bold">{Number(profile.total_pledged ?? 0).toFixed(0)} Marks</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Operational surplus earned</p>
              <p className="text-xl font-bold">{Number(profile.total_earned ?? 0).toFixed(0)} Marks</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active pledges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Active pledged escrows</CardTitle>
          <CardDescription>Projects you are currently backing with Pledged Marks</CardDescription>
        </CardHeader>
        <CardContent>
          {activePledges.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No active pledges. Use the Pledge flow on a project to pledge Marks.</p>
          ) : (
            <ul className="space-y-3">
              {activePledges.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                >
                  <div>
                    <p className="font-medium">Project {p.project_type} — {p.project_id.slice(0, 8)}…</p>
                    <p className="text-sm text-muted-foreground">
                      {Number(p.amount_pledged).toFixed(0)} Marks · {STATUS_LABELS[p.status] ?? p.status}
                    </p>
                  </div>
                  <Badge variant="outline">{STATUS_LABELS[p.status] ?? p.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Historical completed */}
      {completedPledges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completed pledges</CardTitle>
            <CardDescription>Outcome and surplus earned</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {completedPledges.slice(0, 10).map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                  <span>
                    {p.project_type} — {p.status}
                    {Number(p.surplus_share || 0) > 0 && (
                      <span className="text-green-600 ml-2">+{Number(p.surplus_share).toFixed(0)} surplus</span>
                    )}
                  </span>
                  {p.status === "released" ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
