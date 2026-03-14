/**
 * Taste Ranger Dashboard — BandWagon SAA, tier, allocation budget, backings
 * SEC language: earned allocation authority, allocation budget (no investment/return)
 * data-xray-id: taste-ranger-dashboard
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Star, Target, TrendingUp, Users, Award } from "lucide-react";

const RANGER_TIER: Record<string, { label: string; icon: string }> = {
  scout: { label: "Scout", icon: "🔍" },
  ranger: { label: "Ranger", icon: "🎯" },
  curator: { label: "Curator", icon: "📋" },
  tastemaker: { label: "TasteMaker", icon: "✨" },
  patron: { label: "Patron", icon: "🏛️" },
  luminary: { label: "Luminary", icon: "🌟" },
};

const SAA_THRESHOLDS = [0, 50, 200, 500, 1500, 5000];
const TIER_ORDER = ["scout", "ranger", "curator", "tastemaker", "patron", "luminary"];

function getNextTierProgress(saaScore: number): { nextTier: string; current: number; required: number; pct: number } {
  for (let i = TIER_ORDER.length - 1; i >= 0; i--) {
    if (saaScore >= SAA_THRESHOLDS[i]) {
      const nextIdx = i + 1;
      if (nextIdx >= TIER_ORDER.length) {
        return { nextTier: "Luminary (max)", current: saaScore, required: SAA_THRESHOLDS[5], pct: 100 };
      }
      const required = SAA_THRESHOLDS[nextIdx];
      const range = required - SAA_THRESHOLDS[i];
      const progress = saaScore - SAA_THRESHOLDS[i];
      return {
        nextTier: RANGER_TIER[TIER_ORDER[nextIdx]]?.label ?? TIER_ORDER[nextIdx],
        current: saaScore,
        required,
        pct: Math.min(100, Math.round((progress / range) * 100)),
      };
    }
  }
  return { nextTier: "Ranger", current: saaScore, required: 50, pct: Math.min(100, Math.round((saaScore / 50) * 100)) };
}

export function TasteRangerDashboard() {
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["taste-ranger-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("taste_ranger_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data as {
        id: string;
        user_id: string;
        ranger_tier: string;
        saa_score: number;
        total_backings: number;
        successful_backings: number;
        trust_score: number | null;
        allocation_budget: number;
        created_at: string;
        updated_at: string;
      } | null;
    },
    enabled: !!user,
  });

  const { data: backings } = useQuery({
    queryKey: ["project-backings", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("project_backings")
        .select("*")
        .eq("backer_id", user.id)
        .in("status", ["active", "succeeded"])
        .order("backed_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <Card data-xray-id="taste-ranger-dashboard">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Taste Ranger
          </CardTitle>
          <CardDescription>Sign in to see your Service Allocation Authority and backing activity.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card data-xray-id="taste-ranger-dashboard">
        <CardContent className="py-8 text-center text-muted-foreground">Loading…</CardContent>
      </Card>
    );
  }

  const tierInfo = RANGER_TIER[profile?.ranger_tier ?? "scout"] ?? { label: "Scout", icon: "🔍" };
  const saa = Number(profile?.saa_score ?? 0);
  const progress = getNextTierProgress(saa);
  const total = profile?.total_backings ?? 0;
  const success = profile?.successful_backings ?? 0;
  const successRate = total > 0 ? Math.round((success / total) * 100) : 0;
  const trust = profile?.trust_score != null ? Math.round(Number(profile.trust_score) * 100) : 0;
  const budget = Number(profile?.allocation_budget ?? 0);

  return (
    <div className="space-y-6" data-xray-id="taste-ranger-dashboard">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Taste Ranger
          </CardTitle>
          <CardDescription>Earned allocation authority from identifying and sponsoring high-quality projects.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-base">
              {tierInfo.icon} {tierInfo.label}
            </Badge>
            <span className="text-sm text-muted-foreground">SAA: {saa.toFixed(0)}</span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Progress to {progress.nextTier}</p>
            <Progress value={progress.pct} className="h-2" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Allocation budget</p>
                <p className="font-medium">{budget.toFixed(0)} Backed Marks</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Success rate</p>
                <p className="font-medium">{successRate}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Trust score</p>
                <p className="font-medium">{trust}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Backings</p>
                <p className="font-medium">{success} / {total} successful</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {backings && backings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent backings</CardTitle>
            <CardDescription>Projects you've sponsored (active or succeeded).</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {backings.map((b: { id: string; project_type: string; amount_backed: number; status: string; backer_sequence?: number }) => (
                <li key={b.id} className="flex justify-between">
                  <span>{b.project_type} {b.backer_sequence != null ? `#${b.backer_sequence}` : ""}</span>
                  <span>{Number(b.amount_backed).toFixed(0)} · {b.status}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
