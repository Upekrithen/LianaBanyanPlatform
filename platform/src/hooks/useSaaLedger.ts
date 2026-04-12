import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SaaLedgerEntry {
  ledger_entry_id: string;
  recipient_user_id: string;
  source_type: string;
  source_reference_id: string | null;
  amount: number;
  cap_applicable: boolean;
  capped_and_reseeded: boolean;
  reseed_destination_user_ids: string[] | null;
  accrued_at: string;
}

export interface SaaCapTracking {
  tracking_id: string;
  user_id: string;
  cumulative_saa: number;
  cap_reached: boolean;
  cap_reached_at: string | null;
  overflow_cascaded: number;
  last_cascade_at: string | null;
}

export interface CascadeEvent {
  cascade_event_id: string;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  cascaded_at: string;
  source_ripple_id: string | null;
}

export function useSaaLedger() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<SaaLedgerEntry[]>([]);
  const [capTracking, setCapTracking] = useState<SaaCapTracking | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    if (!user) return;
    setLoading(true);

    Promise.all([
      supabase
        .from("saa_ledger")
        .select("*")
        .eq("recipient_user_id", user.id)
        .order("accrued_at", { ascending: false }),
      supabase
        .from("saa_cap_tracking")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]).then(([ledgerRes, capRes]) => {
      setEntries((ledgerRes.data as SaaLedgerEntry[]) ?? []);
      setCapTracking((capRes.data as SaaCapTracking) ?? null);
      setLoading(false);
    });
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  const totalSaa = entries.reduce((sum, e) => sum + Number(e.amount), 0);

  return { entries, capTracking, totalSaa, loading, reload };
}

export function useCascadeHistory() {
  const { user } = useAuth();
  const [outgoing, setOutgoing] = useState<CascadeEvent[]>([]);
  const [incoming, setIncoming] = useState<CascadeEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    Promise.all([
      supabase
        .from("ripple_cascade_ledger")
        .select("*")
        .eq("from_user_id", user.id)
        .order("cascaded_at", { ascending: false }),
      supabase
        .from("ripple_cascade_ledger")
        .select("*")
        .eq("to_user_id", user.id)
        .order("cascaded_at", { ascending: false }),
    ]).then(([outRes, inRes]) => {
      setOutgoing((outRes.data as CascadeEvent[]) ?? []);
      setIncoming((inRes.data as CascadeEvent[]) ?? []);
      setLoading(false);
    });
  }, [user]);

  return { outgoing, incoming, loading };
}
