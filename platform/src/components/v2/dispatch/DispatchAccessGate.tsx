import { ReactNode, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMembershipStatus } from "@/hooks/useMembershipStatus";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { getBatteryDispatchAccessStatus } from "@/lib/batteryDispatchAccess";

type DispatchAccessGateProps = {
  children: ReactNode;
  guildScoped: boolean;
  guildId: string;
};

type GateState = {
  isChecking: boolean;
  canAccess: boolean;
  reasons: string[];
};

export function DispatchAccessGate({ children, guildScoped, guildId }: DispatchAccessGateProps) {
  const { user } = useAuth();
  const { isAdmin, isProjectOwner } = useUserRole();
  const membership = useMembershipStatus();
  const [gateState, setGateState] = useState<GateState>({
    isChecking: true,
    canAccess: false,
    reasons: [],
  });

  const roleState = useMemo(
    () => ({
      isCreator: isProjectOwner,
      isCaptain: false,
      isAdmin,
    }),
    [isProjectOwner, isAdmin],
  );

  useEffect(() => {
    if (!user || membership.isLoading) return;
    let mounted = true;

    const runGate = async () => {
      const reasons: string[] = [];

      const accessStatus = await getBatteryDispatchAccessStatus(user.id).catch(() => null);
      const isCaptain = Boolean(accessStatus?.activeSources.includes("captain"));
      const hasEligibleRole = roleState.isCreator || roleState.isAdmin || isCaptain;

      if (!hasEligibleRole) {
        reasons.push("Role requirement not met.");
      }

      const hasActiveMembership = membership.status === "active" || membership.status === "lifetime";
      if (!hasActiveMembership) {
        reasons.push("Active membership required.");
      }

      if (guildScoped && guildId) {
        const { data } = await supabase
          .from("guild_memberships" as any)
          .select("id")
          .eq("member_id", user.id)
          .eq("guild_id", guildId)
          .eq("is_active", true)
          .limit(1);
        if (!data || data.length === 0) {
          reasons.push("Guild membership required for guild-scoped dispatch.");
        }
      }

      if (!mounted) return;
      setGateState({
        isChecking: false,
        canAccess: reasons.length === 0,
        reasons,
      });
    };

    runGate();

    return () => {
      mounted = false;
    };
  }, [guildScoped, guildId, membership.isLoading, membership.status, roleState.isAdmin, roleState.isCreator, user]);

  if (!user) {
    return (
      <section className="rounded-lg border bg-card/40 p-4">
        <p className="text-sm text-muted-foreground">Sign in to access dispatch composition.</p>
      </section>
    );
  }

  if (gateState.isChecking) {
    return (
      <section className="rounded-lg border bg-card/40 p-4">
        <p className="text-sm text-muted-foreground">Checking dispatch access...</p>
      </section>
    );
  }

  if (!gateState.canAccess) {
    return (
      <section className="rounded-lg border bg-card/40 p-4">
        <p className="text-sm font-medium">Members with active creator status can compose dispatches here.</p>
        {gateState.reasons.length > 0 ? (
          <p className="mt-1 text-xs text-muted-foreground">{gateState.reasons.join(" ")}</p>
        ) : null}
      </section>
    );
  }

  return <>{children}</>;
}
