<!--
SUPERSEDED · BP085 Truth-Always correction 2026-06-17
Reason: Bishop drift — assumed "Cloudflare Worker" based on Server: cloudflare header. That header is Supabase's platform CDN (Supabase runs behind Cloudflare); NOT a Founder-owned Cloudflare Worker. Founder does NOT use Cloudflare per Statutes §4 (DNS Squarespace · hosting Firebase).
Real root cause: relay.lianabanyan.com is registered as Supabase custom domain (state "2_initiated") but stuck at SSL pending_validation — missing TXT record at _acme-challenge.relay.lianabanyan.com.
Real fix yoke: KNIGHT_YOKE_RELAY_SUPABASE_ACTIVATE_BP085.md
DO NOT DISPATCH THIS YOKE.
-->

# KNIGHT YOKE — RELAY PRIMARY CLOUDFLARE WORKER FIX (BP085)

> THIS YOKE IS SUPERSEDED. See header block above.
> Historical record preserved. DO NOT DISPATCH.
