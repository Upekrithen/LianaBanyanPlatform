import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AccessLevel = "private" | "semi_public" | "public";

type RequestBody = {
  token?: string;
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
    const token = body.token?.trim() || null;
    const accessLevel = await getAccessLevel(supabase);

    const authHeader = req.headers.get("Authorization");
    const userId = await getUserIdFromHeader(supabase, authHeader);
    const isStaff = userId ? await isStaffUser(supabase, userId) : false;
    const referrer = req.headers.get("referer");
    const userAgent = req.headers.get("user-agent");
    const viewerIpHash = await hashIp(req);

    if (accessLevel === "public") {
      const tokenRow = token ? await getTokenByValue(supabase, token) : null;
      if (tokenRow) {
        await incrementTokenUseCount(supabase, tokenRow.id, tokenRow.use_count);
      }
      await logView(supabase, {
        tokenId: tokenRow?.id ?? null,
        viewerIpHash,
        userAgent,
        referrer,
      });
      return jsonResponse({ allowed: true, access_level: accessLevel });
    }

    if (accessLevel === "private") {
      if (!isStaff) {
        return jsonResponse({
          allowed: false,
          access_level: accessLevel,
          reason: "staff_required",
        });
      }
      await logView(supabase, {
        tokenId: null,
        viewerIpHash,
        userAgent,
        referrer,
      });
      return jsonResponse({ allowed: true, access_level: accessLevel });
    }

    const tokenRow = token ? await getTokenByValue(supabase, token) : null;
    if (!tokenRow || !isTokenValid(tokenRow)) {
      return jsonResponse({
        allowed: false,
        access_level: accessLevel,
        reason: "token_required",
      });
    }

    await incrementTokenUseCount(supabase, tokenRow.id, tokenRow.use_count);
    await logView(supabase, {
      tokenId: tokenRow.id,
      viewerIpHash,
      userAgent,
      referrer,
    });

    return jsonResponse({
      allowed: true,
      access_level: accessLevel,
      token_label: tokenRow.label ?? null,
    });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500,
    );
  }
});

async function getAccessLevel(supabase: ReturnType<typeof createClient>): Promise<AccessLevel> {
  const { data, error } = await supabase
    .from("platform_feature_flags")
    .select("flag_value")
    .eq("flag_key", "viewing_schedule_access")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed loading access flag: ${error.message}`);
  }

  const value = String(data?.flag_value ?? "private");
  if (value === "public" || value === "semi_public") return value;
  return "private";
}

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

type TokenRow = {
  id: string;
  label: string | null;
  expires_at: string | null;
  max_uses: number | null;
  use_count: number;
  is_active: boolean;
};

async function getTokenByValue(
  supabase: ReturnType<typeof createClient>,
  token: string,
): Promise<TokenRow | null> {
  const { data, error } = await supabase
    .from("viewing_schedule_tokens")
    .select("id, label, expires_at, max_uses, use_count, is_active")
    .eq("token", token)
    .maybeSingle();

  if (error) throw new Error(`Failed loading token: ${error.message}`);
  return (data as TokenRow | null) ?? null;
}

function isTokenValid(token: TokenRow) {
  if (!token.is_active) return false;
  if (token.expires_at && new Date(token.expires_at).getTime() < Date.now()) return false;
  if (typeof token.max_uses === "number" && token.use_count >= token.max_uses) return false;
  return true;
}

async function incrementTokenUseCount(
  supabase: ReturnType<typeof createClient>,
  tokenId: string,
  currentCount: number,
) {
  const { error } = await supabase
    .from("viewing_schedule_tokens")
    .update({ use_count: currentCount + 1 })
    .eq("id", tokenId);

  if (error) throw new Error(`Failed incrementing token use count: ${error.message}`);
}

async function hashIp(req: Request) {
  const rawIp = (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
  const salt = Deno.env.get("VIEWING_ACCESS_IP_SALT") ?? "lb-viewing-access";
  const payload = new TextEncoder().encode(`${salt}:${rawIp}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", payload);
  const bytes = Array.from(new Uint8Array(hashBuffer));
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function logView(
  supabase: ReturnType<typeof createClient>,
  params: {
    tokenId: string | null;
    viewerIpHash: string;
    userAgent: string | null;
    referrer: string | null;
  },
) {
  const { error } = await supabase
    .from("viewing_schedule_views")
    .insert({
      token_id: params.tokenId,
      viewer_ip_hash: params.viewerIpHash,
      user_agent: params.userAgent,
      referrer: params.referrer,
    });

  if (error) throw new Error(`Failed logging view: ${error.message}`);
}

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
