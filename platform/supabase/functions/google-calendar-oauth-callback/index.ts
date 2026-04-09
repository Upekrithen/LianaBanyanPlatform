import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encryptToken } from "../_shared/googleCalendarCrypto.ts";

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    if (error) {
      return htmlError(`Google OAuth error: ${error}`);
    }
    if (!code || !state) {
      return htmlError("Missing OAuth code/state.");
    }

    let stateData: { userId: string; ts: number };
    try {
      stateData = JSON.parse(atob(state));
    } catch {
      return htmlError("Invalid OAuth state.");
    }

    const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
    const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!clientId || !clientSecret || !supabaseUrl || !serviceKey) {
      return htmlError("Server OAuth configuration is incomplete.");
    }

    const redirectUri = `${supabaseUrl}/functions/v1/google-calendar-oauth-callback`;
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const tokenJson = await tokenResponse.json();
    if (!tokenResponse.ok || tokenJson.error) {
      return htmlError(`Token exchange failed: ${tokenJson.error ?? tokenResponse.statusText}`);
    }

    const accessToken = String(tokenJson.access_token ?? "");
    const refreshToken = String(tokenJson.refresh_token ?? "");
    const expiresIn = Number(tokenJson.expires_in ?? 3600);
    if (!accessToken || !refreshToken) {
      return htmlError("Google token response missing access/refresh token.");
    }

    const encrypted = await encryptToken(refreshToken);
    const supabase = createClient(supabaseUrl, serviceKey);

    await supabase
      .from("staff_members")
      .upsert(
        {
          user_id: stateData.userId,
          role: "founder",
          google_calendar_refresh_token: encrypted.cipherText,
          google_calendar_token_iv: encrypted.ivBase64,
          google_calendar_access_token: accessToken,
          google_calendar_token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
        },
        { onConflict: "user_id" },
      );

    return htmlSuccess();
  } catch (err) {
    return htmlError(err instanceof Error ? err.message : "Unknown callback error");
  }
});

function htmlSuccess() {
  return new Response(
    `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:24px"><h2>Google Calendar Connected</h2><p>You can close this window.</p><script>if(window.opener){window.opener.dispatchEvent(new CustomEvent('google-calendar-oauth-complete'));}setTimeout(()=>window.close(),1200);</script></body></html>`,
    { headers: { "Content-Type": "text/html" } },
  );
}

function htmlError(message: string) {
  return new Response(
    `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:24px"><h2>Connection Failed</h2><p>${escapeHtml(message)}</p></body></html>`,
    { status: 400, headers: { "Content-Type": "text/html" } },
  );
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
