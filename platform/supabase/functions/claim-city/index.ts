// claim-city — M23 · BP096
// Canon pearl: canon_dev_recruitment_funnel_social_letter_fork_bounty_ip_ledger_attribute_loop_bp092
// Self-select city claim per BP085 Guild Chapters canon. First-come-first-served.
// Returns claim_id or "already claimed" error with existing claimant info (anonymized).
//
// Truth-Always:
//   - Depends on a city_claims table. If not in M22/M22-EXTENDED, this function surfaces a 503 flag.
//     Expected columns: id, member_id, city_slug, city_name, country_code, claimed_at, status.
//   - city_slug: URL-safe lowercase string (e.g., 'new-york', 'london', 'nairobi').
//   - UNIQUE constraint on city_slug enforced at DB level (first-come-first-served).
//   - One claim per member enforced here (one city per member at claim time).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Dynamic CORS origin allowlist — regex-validated, echoed back (BP096 CORS fix)
const ALLOWED_ORIGIN_PATTERNS: RegExp[] = [
  /^https:\/\/mnemosynec\.(org|ai)$/,
  /^http:\/\/localhost:1313$/,
  /^https:\/\/mnemosyne-lianabanyan--[a-z0-9-]+\.web\.app$/,
];

function resolveAllowOrigin(origin: string): string {
  if (ALLOWED_ORIGIN_PATTERNS.some((re) => re.test(origin))) return origin;
  return "https://mnemosynec.org";
}

const corsBaseHeaders = {
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

function corsResponse(req: Request, body: unknown, status = 200): Response {
  const origin = req.headers.get("origin") ?? "";
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsBaseHeaders, "Access-Control-Allow-Origin": resolveAllowOrigin(origin), "Content-Type": "application/json" },
  });
}

function slugify(str: string): string {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

serve(async (req: Request) => {
  const origin = req.headers.get("origin") ?? "";

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: { ...corsBaseHeaders, "Access-Control-Allow-Origin": resolveAllowOrigin(origin) } });
  }
  if (req.method !== "POST") {
    return corsResponse(req, { ok: false, error: "Method not allowed" }, 405);
  }

  let body: {
    member_id?: string;
    city_name?: string; // "New York", "London", "Nairobi"
    country_code?: string; // ISO 3166-1 alpha-2
  };
  try {
    body = await req.json();
  } catch {
    return corsResponse(req, { ok: false, error: "Invalid JSON body" }, 400);
  }

  const { member_id, city_name, country_code } = body;
  if (!member_id) return corsResponse(req, { ok: false, error: "member_id is required" }, 400);
  if (!city_name || city_name.trim().length < 2) return corsResponse(req, { ok: false, error: "city_name is required (min 2 chars)" }, 400);
  if (!country_code || country_code.length !== 2) return corsResponse(req, { ok: false, error: "country_code is required (ISO 3166-1 alpha-2, e.g. 'US')" }, 400);

  const city_slug = slugify(`${city_name}-${country_code}`);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, serviceKey);

  // Truth-Always: probe for table existence
  const { error: probeError } = await supabase.from("city_claims").select("id").limit(1);
  if (probeError && (probeError.message.includes("does not exist") || probeError.message.includes("relation"))) {
    return corsResponse(req, {
      ok: false,
      error: "city_claims table not found. Requires M23 helper migration.",
      truth_always_flag: "city_claims TABLE MISSING — add to 20260627000002 migration",
    }, 503);
  }

  // Check if city already claimed
  const { data: existingCity } = await supabase
    .from("city_claims")
    .select("id, status")
    .eq("city_slug", city_slug)
    .maybeSingle();

  if (existingCity && existingCity.status === "active") {
    return corsResponse(req, { ok: false, error: "City already claimed", city_slug, already_claimed: true }, 409);
  }

  // Check if member already has a city claim
  const { data: memberClaim } = await supabase
    .from("city_claims")
    .select("id, city_slug, city_name")
    .eq("member_id", member_id)
    .eq("status", "active")
    .maybeSingle();

  if (memberClaim) {
    return corsResponse(req, {
      ok: false,
      error: `Member already holds a city claim: ${memberClaim.city_name} (${memberClaim.city_slug})`,
      existing_claim_id: memberClaim.id,
    }, 409);
  }

  const claimId = crypto.randomUUID();
  const { data, error } = await supabase
    .from("city_claims")
    .insert({
      id: claimId,
      member_id,
      city_name: city_name.trim(),
      city_slug,
      country_code: country_code.toUpperCase(),
      status: "active",
      claimed_at: new Date().toISOString(),
    })
    .select("id, city_slug, city_name, claimed_at")
    .single();

  if (error) {
    // Handle race condition: duplicate slug inserted concurrently
    if (error.message.includes("unique") || error.message.includes("duplicate")) {
      return corsResponse(req, { ok: false, error: "City just claimed by another member (race condition)", city_slug, already_claimed: true }, 409);
    }
    console.error("claim-city insert error:", error.message);
    return corsResponse(req, { ok: false, error: "Failed to claim city: " + error.message }, 500);
  }

  return corsResponse(req, {
    ok: true,
    claim_id: data.id,
    city_slug: data.city_slug,
    city_name: data.city_name,
    claimed_at: data.claimed_at,
  });
});
