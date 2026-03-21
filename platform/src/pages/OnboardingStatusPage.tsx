/**
 * OnboardingStatusPage — Trickle onboarding: cohort status, Founding Status, testing goals
 * Route: /onboarding/status or similar (protected)
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Trophy, Target, Clock } from "lucide-react";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function OnboardingStatusPage() {
  const { user } = useAuth();

  const { data: membership } = useQuery({
    queryKey: ["cohort-membership", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("cohort_members")
        .select("*, onboarding_cohorts(*)")
        .eq("user_id", user.id)
        .order("joined_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: activeCohort } = useQuery({
    queryKey: ["onboarding-cohort-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("onboarding_cohorts")
        .select("*")
        .eq("status", "active")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (!user) {
    return (
      <PortalPageLayout>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Sign in to see your onboarding status.
          </CardContent>
        </Card>
      </PortalPageLayout>
    );
  }

  const cohort = membership?.onboarding_cohorts;
  const isFounding = Boolean(membership?.is_founding_status);
  const goalsCompleted = Number(membership?.testing_goals_completed ?? 0);
  const goalsTotal = Number(membership?.testing_goals_total ?? 0);
  const hasGoals = Boolean(membership?.has_testing_goals);
  const progress = goalsTotal > 0 ? (goalsCompleted / goalsTotal) * 100 : 0;

  return (
    <PortalPageLayout>
      <h1 className="text-2xl font-bold">Onboarding status</h1>

      {membership ? (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  You&apos;re in the first {cohort?.max_members ?? 50}!
                </span>
                {isFounding && (
                  <Badge className="bg-amber-500/20 text-amber-700">Founding Status</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Cohort #{cohort?.cohort_number ?? 1} · {cohort?.status ?? "active"}
              </p>
            </CardHeader>
          </Card>

          {hasGoals && (
            <Card>
              <CardHeader>
                <span className="font-semibold flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Testing goals (X-ray Goggles view)
                </span>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{goalsCompleted} / {goalsTotal} completed</span>
                </div>
                <Progress value={progress} className="h-2" />
              </CardContent>
            </Card>
          )}

                  </>
      ) : activeCohort ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium">You&apos;re signed up</p>
            <p className="text-sm text-muted-foreground">
              Active testing begins when the next cohort opens.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>You&apos;re not in an onboarding cohort yet.</p>
            <p className="text-sm mt-1">You&apos;ll see status here when you join a cohort.</p>
          </CardContent>
        </Card>
      )}
    </PortalPageLayout>
  );
}
