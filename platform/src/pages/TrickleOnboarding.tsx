import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Droplets, Users, Trophy, Target, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

type CohortRow = {
  id: string;
  cohort_number: number;
  max_members: number;
  current_members: number | null;
  status: string | null;
  started_at: string | null;
};

type MembershipRow = {
  id: string;
  cohort_id: string;
  is_founding_status: boolean | null;
  has_testing_goals: boolean | null;
  testing_goals_completed: number | null;
  testing_goals_total: number | null;
  joined_at: string | null;
};

export default function TrickleOnboarding() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: activeCohort, isLoading: cohortLoading } = useQuery({
    queryKey: ["trickle-active-cohort"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("onboarding_cohorts" as never)
        .select("id, cohort_number, max_members, current_members, status, started_at")
        .eq("status", "active")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as CohortRow | null;
    },
  });

  const { data: membership, isLoading: memberLoading } = useQuery({
    queryKey: ["trickle-membership", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("cohort_members" as never)
        .select("id, cohort_id, is_founding_status, has_testing_goals, testing_goals_completed, testing_goals_total, joined_at")
        .eq("user_id", user.id)
        .order("joined_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as MembershipRow | null;
    },
    enabled: !!user,
  });

  const join = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in first");
      if (!activeCohort) throw new Error("No active cohort");
      const { error } = await supabase.from("cohort_members" as never).insert({
        cohort_id: activeCohort.id,
        user_id: user.id,
      } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Welcome to the cohort!");
      qc.invalidateQueries({ queryKey: ["trickle-membership"] });
      qc.invalidateQueries({ queryKey: ["trickle-active-cohort"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const isLoading = cohortLoading || memberLoading;
  const filled = activeCohort?.current_members ?? 0;
  const max = activeCohort?.max_members ?? 50;
  const spotsLeft = Math.max(0, max - filled);
  const pct = max > 0 ? (filled / max) * 100 : 0;
  const isFull = spotsLeft === 0;
  const isInCohort = !!membership;
  const isFounding = membership?.is_founding_status ?? false;
  const goalsCompleted = Number(membership?.testing_goals_completed ?? 0);
  const goalsTotal = Number(membership?.testing_goals_total ?? 0);
  const goalsPct = goalsTotal > 0 ? (goalsCompleted / goalsTotal) * 100 : 0;

  return (
    <PortalPageLayout
      title="Trickle Onboarding"
      subtitle="First 50 testers — controlled expansion"
      maxWidth="md"
      xrayId="trickle-onboarding"
    >
      <div className="space-y-6 pb-12">
        {isLoading ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">Loading…</CardContent></Card>
        ) : isInCohort ? (
          <>
            {/* Already in cohort */}
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                You're in! {membership.joined_at && <>Joined {new Date(membership.joined_at).toLocaleDateString()}</>}
              </p>
              {isFounding && <Badge className="ml-auto bg-amber-500/20 text-amber-400 border-amber-500/30">Founding Member</Badge>}
            </div>

            {/* Status cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardContent className="pt-5 pb-4 text-center space-y-2">
                  <Users className="w-8 h-8 mx-auto text-primary" />
                  <p className="text-2xl font-bold">{filled}/{max}</p>
                  <p className="text-xs text-muted-foreground">Cohort seats filled</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-5 pb-4 text-center space-y-2">
                  <Trophy className="w-8 h-8 mx-auto text-amber-400" />
                  <p className="text-2xl font-bold">{isFounding ? "Yes" : "No"}</p>
                  <p className="text-xs text-muted-foreground">Founding Status</p>
                </CardContent>
              </Card>
            </div>

            {/* Testing goals */}
            {membership.has_testing_goals && goalsTotal > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="w-5 h-5" /> Testing Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{goalsCompleted} of {goalsTotal} completed</span>
                    <span className="font-semibold">{Math.round(goalsPct)}%</span>
                  </div>
                  <Progress value={goalsPct} className="h-2" />
                  {goalsPct >= 100 && (
                    <p className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> All goals met!
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <>
            {/* Not in a cohort — pitch */}
            <Card className="bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/20">
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <Droplets className="w-14 h-14 mx-auto text-blue-400" />
                <h2 className="text-2xl font-bold">Be One of the First {max}</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Liana Banyan grows through controlled expansion. Each cohort is capped at {max} members
                  who test features, provide feedback, and earn <strong>Founding Status</strong> — a permanent
                  badge of honor that unlocks future benefits.
                </p>
              </CardContent>
            </Card>

            {/* Cohort capacity */}
            {activeCohort ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5" /> Cohort #{activeCohort.cohort_number}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{filled} of {max} spots filled</span>
                    <span className={`font-semibold ${isFull ? "text-red-500" : "text-emerald-500"}`}>
                      {isFull ? "Full" : `${spotsLeft} spots left`}
                    </span>
                  </div>
                  <Progress value={pct} className="h-3" />

                  {user ? (
                    isFull ? (
                      <div className="text-center space-y-2">
                        <Clock className="w-8 h-8 mx-auto text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">
                          This cohort is full. The next one opens when testing goals are met.
                        </p>
                      </div>
                    ) : (
                      <Button onClick={() => join.mutate()} disabled={join.isPending} className="w-full" size="lg">
                        {join.isPending ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Joining…</>
                        ) : (
                          "Request to Join"
                        )}
                      </Button>
                    )
                  ) : (
                    <p className="text-sm text-center text-muted-foreground">Sign in to join this cohort.</p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center space-y-3">
                  <Clock className="w-10 h-10 mx-auto text-muted-foreground/30" />
                  <h3 className="font-semibold">No Active Cohort</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    The next onboarding cohort hasn't opened yet. Check back soon — expansion
                    happens in waves as each cohort completes its testing milestones.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: Trophy, title: "Founding Status", desc: "Permanent badge, future perks" },
                { icon: Target, title: "Testing Goals", desc: "Shape the platform by testing" },
                { icon: Users, title: "Priority Access", desc: "First to every new feature" },
              ].map(({ icon: Icon, title, desc }) => (
                <Card key={title}>
                  <CardContent className="pt-5 pb-4 text-center space-y-1">
                    <Icon className="w-6 h-6 mx-auto text-primary" />
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </PortalPageLayout>
  );
}
