import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type CodexBindStatus = "verified" | "tampered" | "missing" | "pending" | "bound";

export interface CodexBindResult {
  codexId: string;
  status: CodexBindStatus;
  storedHmac?: string;
  computedHmac?: string;
  edition?: string;
  title?: string;
  chapters?: number;
  message?: string;
  ts: string;
}

async function fetchCodexBindStatus(codexId: string, contentPayload?: string): Promise<CodexBindResult> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const response = await supabase.functions.invoke("verify-codex-hmac", {
    body: {
      codex_id: codexId,
      content_payload: contentPayload,
    },
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  if (response.error) throw response.error;

  const data = response.data as {
    codex_id: string;
    status: CodexBindStatus;
    stored_hmac?: string;
    computed_hmac?: string;
    edition?: string;
    title?: string;
    chapters?: number;
    message?: string;
    ts: string;
  };

  return {
    codexId: data.codex_id,
    status: data.status,
    storedHmac: data.stored_hmac,
    computedHmac: data.computed_hmac,
    edition: data.edition,
    title: data.title,
    chapters: data.chapters,
    message: data.message,
    ts: data.ts,
  };
}

export function useCodexBindStatus(codexId: string, contentPayload?: string) {
  const { user } = useAuth();

  return useQuery<CodexBindResult>({
    queryKey: ["codex-bind-status", codexId, contentPayload ? "with-payload" : "no-payload"],
    queryFn: () => fetchCodexBindStatus(codexId, contentPayload),
    enabled: !!user && !!codexId,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
