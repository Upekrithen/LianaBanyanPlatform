import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PatronRegistration {
  patron_id: string;
  user_id: string;
  registered_levels: number[];
  industry_tags: string[];
  max_concurrent_engagements: Record<string, number>;
  current_concurrent_engagements: Record<string, number>;
  bio_summary: string | null;
  biography_source_reference: string | null;
  registered_at: string;
}

export function usePatronDirectory(filters?: {
  level?: number;
  tag?: string;
}) {
  const [patrons, setPatrons] = useState<PatronRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = supabase
      .from("patron_registrations")
      .select("*")
      .order("registered_at", { ascending: false });

    if (filters?.level !== undefined) {
      q = q.contains("registered_levels", [filters.level]);
    }
    if (filters?.tag) {
      q = q.contains("industry_tags", [filters.tag]);
    }

    q.then(({ data }) => {
      setPatrons((data as PatronRegistration[]) ?? []);
      setLoading(false);
    });
  }, [filters?.level, filters?.tag]);

  return { patrons, loading };
}

export function useMyPatronRegistration(userId: string | undefined) {
  const [registration, setRegistration] = useState<PatronRegistration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("patron_registrations")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        setRegistration(data as PatronRegistration | null);
        setLoading(false);
      });
  }, [userId]);

  return { registration, loading };
}
