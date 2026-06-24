/**
 * vote-empress · BP092
 * Empress Naming Campaign vote handler — member + ghost vote flows.
 *
 * Canon refs:
 *   - OQ-5 LOCKED: Binary 1 vote per member per proposal (UNIQUE constraint); marks = weight
 *   - OQ-1 default: GHOST_DAILY_ALLOWANCE=500 (pending Founder confirm)
 *   - Postgres-only syntax throughout
 *   - Ghost votes: no per-proposal UNIQUE; daily allowance cap applies
 *
 * Input payload: {
 *   proposal_id: string (UUID),
 *   ghost_session_id?: string | null,
 *   marks_amount?: number (default 1)
 * }
 *
 * Auth: Read Authorization header.
 *   Valid JWT → member vote flow.
 *   No/invalid JWT → ghost vote flow.
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const GHOST_DAILY_ALLOWANCE = parseInt(Deno.env.get("GHOST_DAILY_ALLOWANCE") ?? "500", 10);

const serviceClient = createClient(SUPABASE_URL, SERVICE_ROLE);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let body: { proposal_id?: string; ghost_session_id?: string; marks_amount?: number };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const proposalId = body.proposal_id;
  const marksAmount = Math.max(1, Math.floor(body.marks_amount ?? 1));

  if (!proposalId) return json({ error: "proposal_id_required" }, 400);

  /* Detect auth: valid JWT → member; else → ghost */
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (token && token !== ANON_KEY) {
    /* ── MEMBER VOTE FLOW ── */
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: authErr } = await userClient.auth.getUser();
    if (authErr || !userData?.user) return json({ error: "invalid_token" }, 401);

    const memberId = userData.user.id;

    /* Check for existing vote (application-level check before DB UNIQUE fires) */
    const { data: existingVote } = await serviceClient
      .from("empress_votes_real")
      .select("id")
      .eq("proposal_id", proposalId)
      .eq("member_id", memberId)
      .maybeSingle();

    if (existingVote) return json({ error: "already_voted" }, 409);

    /* Check marks balance — member_currency_balances where currency='marks' */
    const { data: balanceRow, error: balanceErr } = await serviceClient
      .from("member_currency_balances")
      .select("balance")
      .eq("member_id", memberId)
      .eq("currency", "marks")
      .maybeSingle();

    const balance = balanceRow?.balance ?? 0;
    if (balance < marksAmount) return json({ error: "insufficient_marks", balance }, 402);

    /* 5% per-project cap stub — full enforcement pending sibling SEG Q8 (BLOOD flag) */
    /* TODO: enforce 5% project ownership cap when project stake enforcement lands (Q8 5% rule) */

    /* INSERT vote */
    const { error: insertErr } = await serviceClient
      .from("empress_votes_real")
      .insert({ proposal_id: proposalId, member_id: memberId, marks_amount: marksAmount });

    if (insertErr) {
      if (insertErr.code === "23505") return json({ error: "already_voted" }, 409);
      console.error("[vote-empress] vote insert failed:", insertErr);
      return json({ error: "vote_insert_failed", detail: insertErr.message }, 500);
    }

    /* Increment real_votes on proposal */
    const { data: updatedProposal, error: propUpdateErr } = await serviceClient
      .from("empress_proposals")
      .update({ real_votes: serviceClient.rpc("coalesce_increment", { proposal_id: proposalId, amount: marksAmount }) })
      .eq("id", proposalId)
      .select("real_votes")
      .maybeSingle();

    /* Simpler approach: raw increment */
    await serviceClient.rpc("increment_empress_real_votes", { p_id: proposalId, p_amount: marksAmount })
      .catch(async () => {
        /* Fallback if RPC doesn't exist: read-then-write */
        const { data: p } = await serviceClient.from("empress_proposals").select("real_votes").eq("id", proposalId).single();
        if (p) await serviceClient.from("empress_proposals").update({ real_votes: (p.real_votes || 0) + marksAmount }).eq("id", proposalId);
      });

    /* Deduct marks from member (upsert into member_currency_balances) */
    await serviceClient
      .from("member_currency_balances")
      .upsert({ member_id: memberId, currency: "marks", balance: Math.max(0, balance - marksAmount) })
      .eq("member_id", memberId)
      .eq("currency", "marks");

    /* Fetch updated vote count */
    const { data: freshProposal } = await serviceClient
      .from("empress_proposals")
      .select("real_votes")
      .eq("id", proposalId)
      .maybeSingle();

    return json({
      success: true,
      vote_type: "real",
      new_real_votes: freshProposal?.real_votes ?? null,
    });

  } else {
    /* ── GHOST VOTE FLOW ── */
    const ghostSessionId = body.ghost_session_id;
    if (!ghostSessionId) return json({ error: "ghost_session_id_required" }, 400);

    /* Check daily ghost allowance */
    const { data: usageRows, error: usageErr } = await serviceClient
      .from("empress_votes_ghost")
      .select("ghost_marks_amount")
      .eq("ghost_session_id", ghostSessionId)
      .gte("created_at", new Date(Date.now() - 86400000).toISOString());

    if (usageErr) {
      console.error("[vote-empress] ghost allowance check failed:", usageErr);
      return json({ error: "allowance_check_failed" }, 500);
    }

    const used = (usageRows ?? []).reduce((sum, r) => sum + (r.ghost_marks_amount ?? 1), 0);
    if (used + marksAmount > GHOST_DAILY_ALLOWANCE) {
      return json({
        error: "ghost_limit_reached",
        used,
        allowance: GHOST_DAILY_ALLOWANCE,
        remaining: Math.max(0, GHOST_DAILY_ALLOWANCE - used),
      }, 429);
    }

    /* INSERT ghost vote */
    const evaporatesAt = new Date(Date.now() + 86400000).toISOString();
    const { error: ghostInsertErr } = await serviceClient
      .from("empress_votes_ghost")
      .insert({
        proposal_id: proposalId,
        ghost_session_id: ghostSessionId,
        ghost_marks_amount: marksAmount,
        evaporates_at: evaporatesAt,
      });

    if (ghostInsertErr) {
      console.error("[vote-empress] ghost insert failed:", ghostInsertErr);
      return json({ error: "ghost_insert_failed", detail: ghostInsertErr.message }, 500);
    }

    /* Increment ghost_votes on proposal */
    await serviceClient.rpc("increment_empress_ghost_votes", { p_id: proposalId, p_amount: marksAmount })
      .catch(async () => {
        const { data: p } = await serviceClient.from("empress_proposals").select("ghost_votes").eq("id", proposalId).single();
        if (p) await serviceClient.from("empress_proposals").update({ ghost_votes: (p.ghost_votes || 0) + marksAmount }).eq("id", proposalId);
      });

    const { data: freshProposal } = await serviceClient
      .from("empress_proposals")
      .select("ghost_votes")
      .eq("id", proposalId)
      .maybeSingle();

    return json({
      success: true,
      vote_type: "ghost",
      ghost_votes_remaining: Math.max(0, GHOST_DAILY_ALLOWANCE - used - marksAmount),
      new_ghost_votes: freshProposal?.ghost_votes ?? null,
    });
  }
});
