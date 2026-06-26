import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const VALID_TIERS = ["SSPL_PLEDGE", "APACHE_ENDORSEMENT", "SANDERS_FORK_TIER2"];

// Map version to canonical GitHub Release download URL
function getDownloadUrl(version: string): string {
  return `https://github.com/liana-banyan/mnemosyne/releases/download/v${version}/MnemosyneC-Setup-${version}.exe`;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://mnemosynec.org",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ ok: false, error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  let body: { license_tier?: string; version?: string; sha256_expected?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ ok: false, error: "Invalid JSON body" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { license_tier, version } = body;

  if (!license_tier || !VALID_TIERS.includes(license_tier)) {
    return new Response(
      JSON.stringify({ ok: false, error: `license_tier must be one of: ${VALID_TIERS.join(", ")}` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!version) {
    return new Response(
      JSON.stringify({ ok: false, error: "version is required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const ip_address = req.headers.get("x-forwarded-for") ?? req.headers.get("cf-connecting-ip") ?? null;
  const user_agent = req.headers.get("user-agent") ?? null;
  const download_url = getDownloadUrl(version);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  const supabase = createClient(supabaseUrl, serviceKey);

  const { error } = await supabase.from("license_selections").insert({
    license_tier,
    version_downloaded: version,
    ip_address,
    user_agent,
    sha256_verified: body.sha256_expected ?? null,
  });

  if (error) {
    console.error("Insert error:", error.message);
    // Non-fatal -- still return the download URL so user is not blocked
    return new Response(
      JSON.stringify({ ok: true, download_url, sha256: null, warning: "License record failed to persist -- " + error.message }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ ok: true, download_url, sha256: null }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
