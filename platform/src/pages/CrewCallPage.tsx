/**
 * Crew Call — "We Need You To Do What You're Already Good At"
 * Route: /crew-call (protected). Grid of manufacturing process modules, claim Primary/Secondary/Backup.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench } from "lucide-react";
import { ProcessModuleCard } from "@/components/manufacturing/ProcessModuleCard";
import { InviteCreatorCard } from "@/components/cue-cards/InviteCreatorCard";
import { toast } from "sonner";

const MAX_PRIMARY = 3;
const MAX_SECONDARY = 5;

export default function CrewCallPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: modules, isLoading } = useQuery({
    queryKey: ["manufacturing-process-modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("manufacturing_process_modules")
        .select("*")
        .eq("is_active", true)
        .order("process_name");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: assignments } = useQuery({
    queryKey: ["crew-call-assignments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_call_assignments")
        .select("process_module_id, user_id, role_level")
        .eq("status", "active");
      if (error) throw error;
      return data || [];
    },
  });

  const userIds = [...new Set((assignments || []).map((a: { user_id: string }) => a.user_id))];
  const { data: profileNames } = useQuery({
    queryKey: ["crew-profiles", userIds],
    queryFn: async () => {
      if (userIds.length === 0) return {};
      const { data } = await supabase.from("profiles").select("user_id, display_name, full_name").in("user_id", userIds);
      const map: Record<string, string> = {};
      (data || []).forEach((p: { user_id: string; display_name?: string; full_name?: string }) => {
        map[p.user_id] = p.display_name || p.full_name || "Crew";
      });
      return map;
    },
    enabled: userIds.length > 0,
  });

  const { data: pioneers } = useQuery({
    queryKey: ["process-pioneer-ledger"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("process_pioneer_ledger")
        .select("process_module_id");
      if (error) throw error;
      return new Set((data || []).map((p: { process_module_id: string }) => p.process_module_id));
    },
  });

  const claimMutation = useMutation({
    mutationFn: async ({
      processModuleId,
      roleLevel,
      isPioneer,
    }: { processModuleId: string; roleLevel: string; isPioneer: boolean }) => {
      if (!user) throw new Error("Sign in required");
      const { error } = await supabase.from("crew_call_assignments").upsert({
        user_id: user.id,
        process_module_id: processModuleId,
        role_level: roleLevel,
        is_process_pioneer: isPioneer,
        status: "active",
      }, { onConflict: "user_id,process_module_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("You're on the crew.");
      queryClient.invalidateQueries({ queryKey: ["crew-call-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["process-pioneer-ledger"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to claim"),
  });

  const rosterByProcess: Record<string, { role: string; name: string }[]> = {};
  const countsByProcess: Record<string, { primary: number; secondary: number; backup: number }> = {};

  modules?.forEach((m: { id: string }) => {
    countsByProcess[m.id] = { primary: 0, secondary: 0, backup: 0 };
    rosterByProcess[m.id] = [];
  });

  assignments?.forEach((a: { process_module_id: string; role_level: string; user_id: string }) => {
    const c = countsByProcess[a.process_module_id];
    if (c) {
      if (a.role_level === "primary") c.primary++;
      else if (a.role_level === "secondary") c.secondary++;
      else c.backup++;
    }
    const name = profileNames?.[a.user_id] ?? "Crew";
    rosterByProcess[a.process_module_id] = rosterByProcess[a.process_module_id] || [];
    rosterByProcess[a.process_module_id].push({ role: a.role_level, name });
  });

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Sign in to join the crew.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-xray-id="crew-call-page">
      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold">Crew Call</h1>
          <p className="text-xl text-muted-foreground mt-2">
            We need you to do what you&apos;re already good at.
          </p>
        </header>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader><div className="h-6 bg-muted rounded" /></CardHeader>
                <CardContent><div className="h-20 bg-muted rounded" /></CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {modules?.map((mod: {
              id: string;
              process_name: string;
              process_type: string;
              description?: string;
              equipment_needed?: string[];
              skill_level: string;
            }) => {
              const counts = countsByProcess[mod.id] ?? { primary: 0, secondary: 0, backup: 0 };
              const primaryOpen = counts.primary < MAX_PRIMARY;
              const secondaryOpen = counts.secondary < MAX_SECONDARY;
              const isFirstPrimary = counts.primary === 0;
              return (
                <ProcessModuleCard
                  key={mod.id}
                  id={mod.id}
                  process_name={mod.process_name}
                  process_type={mod.process_type}
                  description={mod.description}
                  equipment_needed={mod.equipment_needed}
                  skill_level={mod.skill_level}
                  primaryCount={counts.primary}
                  secondaryCount={counts.secondary}
                  backupCount={counts.backup}
                  maxPrimary={MAX_PRIMARY}
                  maxSecondary={MAX_SECONDARY}
                  hasPioneer={pioneers?.has(mod.id) ?? false}
                  crewNames={rosterByProcess[mod.id] || []}
                  canClaim={!!user}
                  onClaimPrimary={primaryOpen ? () => claimMutation.mutate({
                    processModuleId: mod.id,
                    roleLevel: "primary",
                    isPioneer: isFirstPrimary,
                  }) : undefined}
                  onClaimSecondary={secondaryOpen ? () => claimMutation.mutate({
                    processModuleId: mod.id,
                    roleLevel: "secondary",
                    isPioneer: false,
                  }) : undefined}
                  onClaimBackup={() => claimMutation.mutate({
                    processModuleId: mod.id,
                    roleLevel: "backup",
                    isPioneer: false,
                  })}
                />
              );
            })}
          </div>
        )}

        <section className="pt-8 border-t">
          <p className="text-sm text-muted-foreground mb-4">
            Know a maker with these skills? Send them a Cue Card.
          </p>
          <InviteCreatorCard />
        </section>
      </div>
    </div>
  );
}
