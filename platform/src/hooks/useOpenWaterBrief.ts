import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface OpenWaterBrief {
  brief_id: string;
  member_id: string;
  current_level: number;
  target_level: number;
  industry_pathway: string;
  industry_subtag: string | null;
  industry_freetext: string | null;
  growth_question: string;
  voucher_budget_credits: number;
  voucher_budget_marks: number;
  voucher_budget_joules: number;
  preferred_engagement_length_days: number | null;
  status: string;
  selected_patron_id: string | null;
  published_at: string;
  resolved_at: string | null;
}

export function useOpenWaterBriefs(filters?: {
  status?: string;
  level?: number;
  pathway?: string;
}) {
  const [briefs, setBriefs] = useState<OpenWaterBrief[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = supabase
      .from("open_water_briefs")
      .select("*")
      .order("published_at", { ascending: false });

    if (filters?.status) q = q.eq("status", filters.status);
    if (filters?.level !== undefined) {
      q = q.or(`current_level.eq.${filters.level},target_level.eq.${filters.level}`);
    }
    if (filters?.pathway) q = q.eq("industry_pathway", filters.pathway);

    q.then(({ data }) => {
      setBriefs((data as OpenWaterBrief[]) ?? []);
      setLoading(false);
    });
  }, [filters?.status, filters?.level, filters?.pathway]);

  return { briefs, loading };
}

export function useOpenWaterBrief(briefId: string | undefined) {
  const [brief, setBrief] = useState<OpenWaterBrief | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!briefId) return;
    supabase
      .from("open_water_briefs")
      .select("*")
      .eq("brief_id", briefId)
      .maybeSingle()
      .then(({ data }) => {
        setBrief(data as OpenWaterBrief | null);
        setLoading(false);
      });
  }, [briefId]);

  return { brief, loading };
}
