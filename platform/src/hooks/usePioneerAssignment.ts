import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const TIER_LABELS: Record<string, string> = {
  founders_circle: "Founders' Circle",
  trailblazer: "Trailblazer",
  pathfinder: "Pathfinder",
  early_adopter: "Early Adopter",
  standard: "Standard",
};

const TIER_COLORS: Record<string, string> = {
  founders_circle: "bg-amber-100 text-amber-800 border-amber-300",
  trailblazer: "bg-blue-100 text-blue-800 border-blue-300",
  pathfinder: "bg-green-100 text-green-800 border-green-300",
  early_adopter: "bg-gray-100 text-gray-800 border-gray-300",
  standard: "bg-slate-100 text-slate-700 border-slate-300",
};

export function usePioneerAssignment(role: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: existingPioneer, isLoading } = useQuery({
    queryKey: ["pioneer-status", role, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("pioneers" as never)
        .select("*")
        .eq("member_id", user.id)
        .eq("role", role)
        .maybeSingle();
      return data as { pioneer_number: number; tier: string } | null;
    },
    enabled: !!user,
  });

  const assignMutation = useMutation({
    mutationFn: async () => {
      if (!user || existingPioneer) return null;
      const { data, error } = await supabase.rpc("assign_pioneer", {
        p_member_id: user.id,
        p_role: role,
      });
      if (error) throw error;
      return data as { pioneer_number: number; tier: string } | null;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["pioneer-status", role] });
        const tierLabel = TIER_LABELS[data.tier] || data.tier;
        toast({
          title: `Welcome, Pioneer #${data.pioneer_number}!`,
          description: `You're in the ${tierLabel} tier for ${role.replace(/_/g, " ")}.`,
        });
      }
    },
  });

  return {
    pioneerNumber: existingPioneer?.pioneer_number ?? null,
    tier: existingPioneer?.tier ?? null,
    tierLabel: existingPioneer ? TIER_LABELS[existingPioneer.tier] : null,
    tierColor: existingPioneer ? TIER_COLORS[existingPioneer.tier] : null,
    isNewPioneer: !existingPioneer && !isLoading,
    isLoading,
    assignPioneer: assignMutation.mutateAsync,
    isAssigning: assignMutation.isPending,
  };
}
