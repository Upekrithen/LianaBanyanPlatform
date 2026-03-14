/**
 * BandWagon summary card for member dashboard.
 * No profile: invite to become Taste Ranger. Has profile: compact stat + link.
 * SEC language: Earn Service Allocation Authority; no investment/return.
 * data-xray-id: bandwagon-dashboard-card
 */

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Star } from "lucide-react";

const TIER_LABEL: Record<string, string> = {
  scout: "Scout",
  ranger: "Ranger",
  curator: "Curator",
  tastemaker: "TasteMaker",
  patron: "Patron",
  luminary: "Luminary",
};

export function BandWagonDashboardCard() {
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["taste-ranger-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("taste_ranger_profiles")
        .select("ranger_tier, saa_score, allocation_budget")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: backingsCount } = useQuery({
    queryKey: ["project-backings-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from("project_backings")
        .select("*", { count: "exact", head: true })
        .eq("backer_id", user.id)
        .in("status", ["active", "succeeded"]);
      if (error) return 0;
      return count ?? 0;
    },
    enabled: !!user && !!profile,
  });

  if (!user || isLoading) return null;

  if (!profile) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-green-500/5 to-emerald-500/10" data-xray-id="bandwagon-dashboard-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            Become a Taste Ranger
          </CardTitle>
          <CardDescription>
            Back projects you believe in. Earn Service Allocation Authority.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button size="sm" asChild>
            <Link to="/guilds/hub?tab=bandwagon">Get Started</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20" data-xray-id="bandwagon-dashboard-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Star className="h-4 w-4" />
          BandWagon
        </CardTitle>
        <CardDescription className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary">{TIER_LABEL[profile.ranger_tier] ?? profile.ranger_tier}</Badge>
          <span>SAA: {Number(profile.saa_score).toFixed(0)}</span>
          <span>·</span>
          <span>{(backingsCount ?? 0)} backings</span>
          <span>·</span>
          <span>{Number(profile.allocation_budget).toFixed(0)} Backed Marks</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" size="sm" asChild>
          <Link to="/guilds/hub?tab=bandwagon">View Dashboard</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
