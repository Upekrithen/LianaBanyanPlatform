import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SubstrateLedgerEntry {
  path: string;
  bushelId: string;
  label: string;
  cohortClass: string;
  ts: string;
  acl: {
    can_read_codex: boolean;
    can_read_bushel_reports: boolean;
    can_read_substrate_health: boolean;
    can_read_recovery_pane: boolean;
  };
}

export interface SubstrateLedgerResult {
  entries: SubstrateLedgerEntry[];
  cohortClass: string;
  entryCount: number;
}

async function fetchSubstrateLedger(): Promise<SubstrateLedgerResult> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const response = await supabase.functions.invoke("read-substrate-ledger", {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  if (response.error) throw response.error;

  const rawText: string = typeof response.data === "string"
    ? response.data
    : JSON.stringify(response.data);

  const lines = rawText
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as SubstrateLedgerEntry);

  const cohortClass = lines[0]?.cohortClass ?? "lone_wolf";

  return {
    entries: lines,
    cohortClass,
    entryCount: lines.length,
  };
}

export function useSubstrateLedger() {
  const { user } = useAuth();

  return useQuery<SubstrateLedgerResult>({
    queryKey: ["substrate-ledger", user?.id],
    queryFn: fetchSubstrateLedger,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
