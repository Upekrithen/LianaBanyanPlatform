import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface RippleContribution {
  ripple_id: string;
  engagement_id: string;
  backer_user_id: string;
  ripple_type: "resources" | "reputation" | "network" | "skills";
  ripple_data: Record<string, unknown>;
  committed_at: string;
  status: "active" | "withdrawn" | "resolved";
}

export function useRipplesForEngagement(engagementId: string | undefined) {
  const [ripples, setRipples] = useState<RippleContribution[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    if (!engagementId) return;
    setLoading(true);
    supabase
      .from("ripple_contributions")
      .select("*")
      .eq("engagement_id", engagementId)
      .order("committed_at", { ascending: false })
      .then(({ data }) => {
        setRipples((data as RippleContribution[]) ?? []);
        setLoading(false);
      });
  }, [engagementId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { ripples, loading, reload };
}

export function useCommitRipple() {
  const { session } = useAuth();
  const [committing, setCommitting] = useState(false);

  async function commitRipple(
    engagementId: string,
    rippleType: RippleContribution["ripple_type"],
    rippleData: Record<string, unknown>
  ) {
    if (!session?.access_token) throw new Error("Not authenticated");
    setCommitting(true);
    try {
      const res = await supabase.functions.invoke("commit-ripple", {
        body: {
          engagement_id: engagementId,
          ripple_type: rippleType,
          ripple_data: rippleData,
        },
      });
      if (res.error) throw res.error;
      return res.data;
    } finally {
      setCommitting(false);
    }
  }

  return { commitRipple, committing };
}
