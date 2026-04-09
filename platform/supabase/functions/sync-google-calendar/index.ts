import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decryptToken } from "../_shared/googleCalendarCrypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type GoogleEvent = {
  id: string;
  summary?: string;
  htmlLink?: string;
  start?: { dateTime?: string; date?: string };
  attendees?: Array<{ email?: string }>;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } },
    );
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      return json(401, { error: "Unauthorized" });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: staff, error: staffError } = await supabase
      .from("staff_members")
      .select("user_id, role, google_calendar_refresh_token, google_calendar_token_iv, google_calendar_access_token, google_calendar_token_expires_at")
      .eq("user_id", user.id)
      .maybeSingle();
    if (staffError || !staff) {
      return json(400, { error: "Founder Google Calendar is not connected." });
    }

    let accessToken = String(staff.google_calendar_access_token ?? "");
    const expiresAtIso = staff.google_calendar_token_expires_at
      ? new Date(staff.google_calendar_token_expires_at).toISOString()
      : null;
    const expired = !expiresAtIso || new Date(expiresAtIso).getTime() < Date.now() + 60_000;
    if (expired) {
      const refreshCipher = String(staff.google_calendar_refresh_token ?? "");
      const refreshIv = String(staff.google_calendar_token_iv ?? "");
      if (!refreshCipher || !refreshIv) {
        return json(400, { error: "Refresh token is missing. Reconnect Google Calendar." });
      }
      const refreshToken = await decryptToken(refreshCipher, refreshIv);
      const refreshed = await refreshGoogleAccessToken(refreshToken);
      accessToken = refreshed.accessToken;
      await supabase
        .from("staff_members")
        .update({
          google_calendar_access_token: refreshed.accessToken,
          google_calendar_token_expires_at: refreshed.expiresAtIso,
        })
        .eq("user_id", user.id);
    }

    const now = new Date();
    const end = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const eventsUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(now.toISOString())}&timeMax=${encodeURIComponent(end.toISOString())}&maxResults=100`;
    const eventsResponse = await fetch(eventsUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!eventsResponse.ok) {
      const text = await eventsResponse.text();
      return json(500, { error: `Google Calendar fetch failed: ${text}` });
    }

    const eventsJson = await eventsResponse.json();
    const events = (eventsJson.items ?? []) as GoogleEvent[];

    const { data: contacts, error: contactsError } = await supabase
      .from("founder_contacts")
      .select("id, contact_email")
      .not("contact_email", "is", null);
    if (contactsError) throw contactsError;

    const contactsByEmail = new Map<string, { id: string }>();
    for (const row of (contacts ?? []) as Array<{ id: string; contact_email: string | null }>) {
      if (!row.contact_email) continue;
      contactsByEmail.set(row.contact_email.trim().toLowerCase(), { id: row.id });
    }

    let matched = 0;
    for (const event of events) {
      const startIso = event.start?.dateTime
        ?? (event.start?.date ? `${event.start.date}T09:00:00.000Z` : null);
      if (!startIso) continue;

      const attendeeEmails = (event.attendees ?? [])
        .map((att) => (att.email ?? "").trim().toLowerCase())
        .filter(Boolean);
      let matchedContactId: string | null = null;
      for (const attendeeEmail of attendeeEmails) {
        const hit = contactsByEmail.get(attendeeEmail);
        if (hit) {
          matchedContactId = hit.id;
          break;
        }
      }
      if (!matchedContactId) continue;

      await supabase
        .from("founder_contacts")
        .update({
          next_scheduled_at: startIso,
          google_calendar_event_id: event.id,
          next_action_summary: event.summary ?? null,
        })
        .eq("id", matchedContactId);
      matched += 1;
    }

    return json(200, {
      ok: true,
      scanned_events: events.length,
      matched_contacts: matched,
    });
  } catch (err) {
    return json(500, { error: err instanceof Error ? err.message : "Unknown error" });
  }
});

async function refreshGoogleAccessToken(refreshToken: string) {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials are missing.");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const jsonBody = await response.json();
  if (!response.ok || jsonBody.error) {
    throw new Error(`Unable to refresh Google token: ${jsonBody.error ?? response.statusText}`);
  }

  const expiresIn = Number(jsonBody.expires_in ?? 3600);
  return {
    accessToken: String(jsonBody.access_token ?? ""),
    expiresAtIso: new Date(Date.now() + expiresIn * 1000).toISOString(),
  };
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
