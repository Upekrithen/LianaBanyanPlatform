// BP073 Wave 3 · Scope 16 · wan-epoch
// ============================================================
// Returns the current cooperative epoch (days since 2026-01-01)
// and related epoch metadata. Useful for clients that need a
// server-authoritative epoch value for address derivation.
//
// Scopes covered:
//  16  - wan-epoch endpoint (server-side epoch management)
//
// GET /functions/v1/wan-epoch
// Response: { epoch, epochDate, nextEpochAt, epochOrigin }
//
// EMPIRICAL STATUS (BP073-W3):
//   WORKS: returns deterministic epoch from server clock
//   WORKS: no auth required (epoch is public information)
//
// Authored: 2026-06-03 · Knight BP073-W3

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }

  const EPOCH_ORIGIN = new Date("2026-01-01T00:00:00Z").getTime();
  const now = Date.now();
  const epoch = Math.floor((now - EPOCH_ORIGIN) / (24 * 60 * 60 * 1000));
  const epochStart = EPOCH_ORIGIN + epoch * 24 * 60 * 60 * 1000;
  const nextEpochAt = new Date(epochStart + 24 * 60 * 60 * 1000).toISOString();
  const epochDate = new Date(epochStart).toISOString().slice(0, 10);

  return json({
    epoch,
    epochDate,
    nextEpochAt,
    epochOrigin: "2026-01-01T00:00:00Z",
    serverTime: new Date(now).toISOString(),
  });
});
