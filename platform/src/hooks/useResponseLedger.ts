/**
 * useResponseLedger — data hook for Crown letter response tracking.
 * K409 / B097 — Pitfall 3 response playbook wiring.
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type EventKind = "letter_dispatched" | "response_received" | "followup_sent";
export type ResponseType =
  | "yes" | "curious" | "no_thanks" | "needs_clarification"
  | "delegation" | "meeting_scheduled" | "other";

export interface ResponseLogEntry {
  id: string;
  logged_by: string;
  recipient_name: string;
  event_kind: EventKind;
  response_type: ResponseType | null;
  summary: string;
  event_at: string;
  created_at: string;
}

export interface LetterStatus {
  recipient_name: string;
  dispatched_at: string | null;
  response_received_at: string | null;
  response_type: ResponseType | null;
  response_summary: string | null;
  followup_sent_at: string | null;
  followup_summary: string | null;
  hours_since_dispatch: number | null;
  hours_since_response: number | null;
  needs_followup: boolean;
  overdue_response: boolean;
}

const OPENING_GAMBIT_RECIPIENTS = [
  "Melinda French Gates", "Craig Newmark", "Erik Brynjolfsson", "Nathan Schneider",
  "Trebor Scholz", "Cory Doctorow", "Daron Acemoglu", "Yochai Benkler", "Julian Posada",
  "Antonio Casilli", "Paola Ricaurte Quijano", "Netsaalem Gebrie", "Shoshana Zuboff",
  "Kate Raworth", "Mariana Mazzucato", "Juliet Schor", "Arun Sundararajan",
  "Douglas Rushkoff", "Howard Marks", "Seth Godin", "Li Jin",
  "Anand Giridharadas", "Esther Perel",
  "Kara Swisher", "Ezra Klein", "Nilay Patel", "Hank Green", "Paris Marx",
  "Ed Zitron", "Brian Merchant", "Molly White", "Tim Ingham", "Kiko Martinez",
  "Ai-jen Poo", "Majora Carter", "Simon Sinek",
  "Taylor Swift", "Dolly Parton", "Jimmy Kimmel", "Pitbull", "Ziwe Fumudoh", "Bambu Lab",
] as const;

export { OPENING_GAMBIT_RECIPIENTS };

export function useResponseLedger() {
  const [entries, setEntries] = useState<ResponseLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("crown_letter_response_log")
      .select("*")
      .order("event_at", { ascending: true });
    setEntries((data as ResponseLogEntry[] | null) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const logEvent = useCallback(async (params: {
    recipient_name: string;
    event_kind: EventKind;
    response_type?: ResponseType;
    summary?: string;
    received_at?: string;
  }) => {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL || "https://ruuxzilgmuwddcofqecc.supabase.co"}/functions/v1/log-letter-response`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(params),
      },
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to log event");
    await load();
    return data;
  }, [load]);

  const getLetterStatuses = useCallback((): LetterStatus[] => {
    const now = Date.now();
    return OPENING_GAMBIT_RECIPIENTS.map((name) => {
      const mine = entries.filter((e) => e.recipient_name === name);
      const dispatch = mine.find((e) => e.event_kind === "letter_dispatched");
      const response = mine.find((e) => e.event_kind === "response_received");
      const followup = mine.find((e) => e.event_kind === "followup_sent");

      const dispatchTime = dispatch ? new Date(dispatch.event_at).getTime() : null;
      const responseTime = response ? new Date(response.event_at).getTime() : null;

      const hoursSinceDispatch = dispatchTime ? (now - dispatchTime) / 3_600_000 : null;
      const hoursSinceResponse = responseTime ? (now - responseTime) / 3_600_000 : null;

      return {
        recipient_name: name,
        dispatched_at: dispatch?.event_at ?? null,
        response_received_at: response?.event_at ?? null,
        response_type: (response?.response_type as ResponseType) ?? null,
        response_summary: response?.summary ?? null,
        followup_sent_at: followup?.event_at ?? null,
        followup_summary: followup?.summary ?? null,
        hours_since_dispatch: hoursSinceDispatch ? Math.round(hoursSinceDispatch * 10) / 10 : null,
        hours_since_response: hoursSinceResponse ? Math.round(hoursSinceResponse * 10) / 10 : null,
        needs_followup: !!response && !followup && (hoursSinceResponse ?? 0) > 48,
        overdue_response: !!dispatch && !response && (hoursSinceDispatch ?? 0) > 168,
      };
    });
  }, [entries]);

  return { entries, loading, logEvent, getLetterStatuses, reload: load };
}
