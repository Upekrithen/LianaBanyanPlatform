/**
 * handle-project-funding-webhook
 * K96 — 1/3 Funding Standard: Project Seeding Contributions
 * Spec: BISHOP_DROPZONE/ONE_THIRD_FUNDING_STANDARD_V2.md
 *
 * Dedicated Stripe webhook for project funding (separate from commerce).
 * Uses its own signing secret: STRIPE_PROJECT_FUNDING_WEBHOOK_SECRET
 *
 * On checkout.session.completed with metadata.type = 'project_funding':
 *   1. Calculate 1/3 / 1/3 / 1/3 split
 *   2. Apply LB's capped 20% from Third Third
 *   3. Create escrow for half of First Third
 *   4. Credit funder's assignable patronage (Second Third)
 *   5. Feed Seeding Pool (Third Third remainder)
 *   6. Write 4 ledger entries for Subchapter T
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { writeLedgerEntry } from "../_shared/ledgerWriter.ts";

const log = (msg: string) => console.log(`[ProjectFundingWebhook] ${msg}`);

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const webhookSecret = Deno.env.get("STRIPE_PROJECT_FUNDING_WEBHOOK_SECRET");
    if (!webhookSecret) {
      log("Missing STRIPE_PROJECT_FUNDING_WEBHOOK_SECRET");
      return new Response("Server config error", { status: 500 });
    }

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response("No signature", { status: 400 });
    }

    const body = await req.text();

    // ── HMAC Verification (matching handle-membership-webhook pattern) ──
    const parts = signature.split(",").reduce(
      (acc: Record<string, string>, part: string) => {
        const [k, v] = part.split("=");
        acc[k.trim()] = v;
        return acc;
      },
      {} as Record<string, string>
    );

    const timestamp = parts["t"];
    const expectedSig = parts["v1"];
    if (!timestamp || !expectedSig) {
      return new Response("Invalid signature format", { status: 400 });
    }

    const age = Math.floor(Date.now() / 1000) - parseInt(timestamp);
    if (Math.abs(age) > 300) {
      return new Response("Timestamp too old", { status: 400 });
    }

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(webhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signed = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(`${timestamp}.${body}`)
    );
    const computedSig = Array.from(new Uint8Array(signed))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (computedSig !== expectedSig) {
      log("Signature mismatch");
      return new Response("Invalid signature", { status: 400 });
    }

    // ── Parse Event ──
    const event = JSON.parse(body);
    log(`Event: ${event.type} (${event.id})`);

    if (event.type !== "checkout.session.completed") {
      log(`Ignoring event type: ${event.type}`);
      return jsonOk();
    }

    const session = event.data.object;
    const meta = (session.metadata || {}) as Record<string, string>;

    if (meta.type !== "project_funding") {
      log("Not a project_funding payment, skipping");
      return jsonOk();
    }

    const funderId = meta.funder_id;
    const projectId = meta.project_id;
    const totalCents = session.amount_total || 0; // Stripe amount_total is in cents

    if (!funderId || !projectId || !totalCents) {
      log(`Missing required metadata: funder=${funderId}, project=${projectId}, amount=${totalCents}`);
      return jsonOk();
    }

    log(`Processing: $${(totalCents / 100).toFixed(2)} from ${funderId} to project ${projectId}`);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // ── Step 1: Calculate the 1/3 split ──
    // floor(total/3) for first two thirds; remainder goes to third third
    const firstThird = Math.floor(totalCents / 3);
    const secondThird = Math.floor(totalCents / 3);
    const thirdThird = totalCents - firstThird - secondThird; // absorbs remainder penny

    // ── Step 2: Check project cap status ──
    const { data: costDecl } = await supabaseAdmin
      .from("project_cost_declarations")
      .select("*")
      .eq("project_id", projectId)
      .single();

    let lbCut = 0;
    let seedingAmount = thirdThird;
    let capReachedNow = false;

    if (costDecl) {
      if (costDecl.cap_reached) {
        // Cap already hit — LB takes $0, full third goes to seeding
        lbCut = 0;
        seedingAmount = thirdThird;
        log(`Cap already reached for project ${projectId} — full third to seeding`);
      } else {
        // LB takes 20% of TOTAL amount, from the Third Third, until cap hit
        const desiredLbCut = Math.floor(totalCents * 0.20);
        const capRemaining = costDecl.cap_amount_cents - costDecl.cumulative_lb_revenue_cents;
        lbCut = Math.min(desiredLbCut, capRemaining, thirdThird);
        seedingAmount = thirdThird - lbCut;

        // Check if we just hit the cap
        if (costDecl.cumulative_lb_revenue_cents + lbCut >= costDecl.cap_amount_cents) {
          capReachedNow = true;
          log(`Cap HIT for project ${projectId} at cumulative $${((costDecl.cumulative_lb_revenue_cents + lbCut) / 100).toFixed(2)}`);
        }
      }
    } else {
      // No cost declaration — default: LB takes 20% of total from third third
      lbCut = Math.min(Math.floor(totalCents * 0.20), thirdThird);
      seedingAmount = thirdThird - lbCut;
      log(`No cost declaration for project ${projectId} — using default 20% cut`);
    }

    // Escrow: half of first third held until work verified
    const escrowAmount = Math.floor(firstThird / 2);

    // ── Step 3: Insert project_seeding_contributions ──
    const { data: contribution, error: contribErr } = await supabaseAdmin
      .from("project_seeding_contributions")
      .insert({
        funder_id: funderId,
        project_id: projectId,
        stripe_session_id: session.id,
        stripe_event_id: event.id,
        total_amount_cents: totalCents,
        first_third_cents: firstThird,
        second_third_cents: secondThird,
        third_third_cents: thirdThird,
        lb_cut_cents: lbCut,
        seeding_amount_cents: seedingAmount,
        escrow_amount_cents: escrowAmount,
        cap_reached_at_time: costDecl?.cap_reached || capReachedNow,
      })
      .select("id")
      .single();

    if (contribErr) {
      // Likely idempotency conflict on stripe_event_id
      if (contribErr.code === "23505") {
        log(`Duplicate event ${event.id} — skipping`);
        return jsonOk();
      }
      throw contribErr;
    }

    const contributionId = contribution!.id;
    log(`Contribution ${contributionId} recorded`);

    // ── Step 4: Insert escrow record ──
    await supabaseAdmin.from("project_escrow_ledger").insert({
      contribution_id: contributionId,
      project_id: projectId,
      amount_cents: escrowAmount,
      status: "held",
    });
    log(`Escrow: ${escrowAmount} cents held`);

    // ── Step 5: Credit funder assignable patronage (Second Third) ──
    await supabaseAdmin.from("funder_assignable_credits").insert({
      funder_id: funderId,
      source_contribution_id: contributionId,
      amount_cents: secondThird,
      remaining_cents: secondThird,
    });
    log(`FAP: ${secondThird} cents credited to funder ${funderId}`);

    // ── Step 6: Feed seeding pool ──
    if (seedingAmount > 0) {
      await supabaseAdmin.from("seeding_pool").insert({
        source_contribution_id: contributionId,
        amount_cents: seedingAmount,
      });
      log(`Seeding pool: ${seedingAmount} cents added`);
    }

    // ── Step 7: Update cap tracking ──
    if (costDecl && lbCut > 0) {
      const newCumulative = costDecl.cumulative_lb_revenue_cents + lbCut;
      await supabaseAdmin
        .from("project_cost_declarations")
        .update({
          cumulative_lb_revenue_cents: newCumulative,
          cap_reached: capReachedNow || costDecl.cap_reached,
          cap_reached_date: capReachedNow ? new Date().toISOString() : costDecl.cap_reached_date,
          updated_at: new Date().toISOString(),
        })
        .eq("project_id", projectId);
      log(`Cap tracking: cumulative LB revenue now ${newCumulative} cents`);
    }

    // ── Step 8: Write 4 ledger entries for Subchapter T ──
    try {
      // First Third — Project Portion (patronage)
      await writeLedgerEntry({
        stripe_event_id: `${event.id}_project_funding`,
        stripe_session_id: session.id,
        ledger_category: "project_funding",
        amount_cents: firstThird,
        payer_id: funderId,
        project_id: projectId,
        is_patronage: true,
        patronage_type: "seeding",
        description: `1/3 Standard: First Third (project portion)`,
        metadata: { contribution_id: contributionId, escrow_cents: escrowAmount },
        webhook_source: "handle-project-funding-webhook",
      });

      // Second Third — Funder-Assignable Patronage Credit (patronage allocation)
      await writeLedgerEntry({
        stripe_event_id: `${event.id}_project_funder_credit`,
        ledger_category: "project_funder_credit",
        amount_cents: secondThird,
        payer_id: funderId,
        project_id: projectId,
        is_patronage: true,
        patronage_type: "seeding",
        description: `1/3 Standard: Second Third (funder-assignable)`,
        metadata: { contribution_id: contributionId },
        webhook_source: "handle-project-funding-webhook",
      });

      // Third Third — Seeding Pool portion (patronage)
      if (seedingAmount > 0) {
        await writeLedgerEntry({
          stripe_event_id: `${event.id}_project_seeding`,
          ledger_category: "project_seeding",
          amount_cents: seedingAmount,
          payer_id: funderId,
          project_id: projectId,
          is_patronage: true,
          patronage_type: "seeding",
          description: `1/3 Standard: Seeding Pool portion`,
          metadata: { contribution_id: contributionId },
          webhook_source: "handle-project-funding-webhook",
        });
      }

      // Third Third — LB Platform capped cut (non-patronage revenue)
      if (lbCut > 0) {
        await writeLedgerEntry({
          stripe_event_id: `${event.id}_project_platform_cap`,
          ledger_category: "project_platform_cap",
          amount_cents: lbCut,
          payer_id: funderId,
          project_id: projectId,
          is_patronage: false,
          description: `1/3 Standard: LB capped platform revenue`,
          metadata: {
            contribution_id: contributionId,
            cap_reached: capReachedNow,
            cumulative_after: costDecl ? costDecl.cumulative_lb_revenue_cents + lbCut : lbCut,
          },
          webhook_source: "handle-project-funding-webhook",
        });
      }

      log(`Ledger: 4 entries written for contribution ${contributionId}`);
    } catch (ledgerErr) {
      console.error("[ProjectFundingWebhook] Ledger write failed (non-fatal):", ledgerErr);
    }

    log(
      `COMPLETE: $${(totalCents / 100).toFixed(2)} → ` +
      `PP $${(firstThird / 100).toFixed(2)} (escrow $${(escrowAmount / 100).toFixed(2)}) | ` +
      `FAP $${(secondThird / 100).toFixed(2)} | ` +
      `LB $${(lbCut / 100).toFixed(2)} | ` +
      `Seed $${(seedingAmount / 100).toFixed(2)}`
    );

    return jsonOk();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log(`FATAL: ${msg}`);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

function jsonOk() {
  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
}
