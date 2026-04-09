import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type RequestBody = {
  label?: string;
  expires_days?: number;
  max_uses?: number;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const body = (await req.json().catch(() => ({}))) as RequestBody;

    const authHeader = req.headers.get("Authorization");
    const userId = await getUserIdFromHeader(supabase, authHeader);
    if (!userId) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const isStaff = await isStaffUser(supabase, userId);
    if (!isStaff) {
      return jsonResponse({ error: "Staff access required" }, 403);
    }

    const expiresDays = normalizeOptionalInt(body.expires_days);
    const maxUses = normalizeOptionalInt(body.max_uses);
    const expiresAt = typeof expiresDays === "number"
      ? new Date(Date.now() + (expiresDays * 24 * 60 * 60 * 1000)).toISOString()
      : null;

    const { data, error } = await supabase
      .from("viewing_schedule_tokens")
      .insert({
        label: body.label?.trim() || null,
        created_by: userId,
        expires_at: expiresAt,
        max_uses: maxUses,
      })
      .select("id, token, label, expires_at, max_uses, use_count, is_active, created_at")
      .single();

    if (error) throw new Error(`Failed creating token: ${error.message}`);

    const baseUrl = (Deno.env.get("PUBLIC_SITE_URL") ?? "https://lianabanyan.com").replace(/\/+$/, "");
    const url = `${baseUrl}/viewing-schedule?t=${data.token}`;

    return jsonResponse({
      success: true,
      token: data.token,
      url,
      token_row: data,
    });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500,
    );
  }
});

async function getUserIdFromHeader(
  supabase: ReturnType<typeof createClient>,
  authHeader: string | null,
): Promise<string | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const jwt = authHeader.slice("Bearer ".length).trim();
  if (!jwt) return null;

  const { data, error } = await supabase.auth.getUser(jwt);
  if (error) return null;
  return data.user?.id ?? null;
}

async function isStaffUser(supabase: ReturnType<typeof createClient>, userId: string): Promise<boolean> {
  const [crown, guild] = await Promise.all([
    supabase
      .from("crown_positions")
      .select("id")
      .eq("holder_user_id", userId)
      .limit(1),
    supabase
      .from("guilds")
      .select("id")
      .eq("guild_master_id", userId)
      .limit(1),
  ]);

  return Boolean((crown.data?.length ?? 0) > 0 || (guild.data?.length ?? 0) > 0);
}

function normalizeOptionalInt(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  const intValue = Math.floor(parsed);
  return intValue > 0 ? intValue : null;
}

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
