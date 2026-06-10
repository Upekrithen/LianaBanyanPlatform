/**
 * promotion-attribution-vesting-check — BP079 Wave B.6
 * ========================================================
 * Daily cron job to unlock vested Red Carpet promotion attributions.
 *
 * Finds promotion_attributions where:
 *   - vesting_unlock_at <= NOW()
 *   - claimed_at IS NULL
 *
 * For each unlocked row, credits the introducer's wallet and marks claimed_at.
 *
 * CANONICAL RULE: canon_three_currency_no_fiat_substitution_bp078
 *   - Attributions use currency_class (credits/marks/joules), NEVER fiat amounts.
 *   - Introducers earn credits for bringing new members, not cash.
 *
 * Deploy: supabase functions deploy promotion-attribution-vesting-check
 * Schedule: cron(0 2 * * *)  (daily at 2am UTC)
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const log = (msg: string) => console.log(`[PromotionVesting] ${msg}`);

Deno.serve(async (_req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const now = new Date();

  const results = {
    checked_at: now.toISOString(),
    vested_count: 0,
    errors: [] as string[],
  };

  // Find all promotion_attributions where vesting has completed
  const { data: unvestedRows, error: queryErr } = await client
    .from("promotion_attributions")
    .select("*")
    .lte("vesting_unlock_at", now.toISOString())
    .is("claimed_at", null);

  if (queryErr) {
    results.errors.push(`query error: ${queryErr.message}`);
    log(`Query error: ${queryErr.message}`);
    return new Response(JSON.stringify(results, null, 2), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }

  if (!unvestedRows || unvestedRows.length === 0) {
    log("No vested attributions to process");
    return new Response(JSON.stringify(results, null, 2), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  }

  log(`Found ${unvestedRows.length} vested attributions to process`);

  for (const attribution of unvestedRows) {
    try {
      // Mark as claimed
      const { error: claimErr } = await client
        .from("promotion_attributions")
        .update({ claimed_at: now.toISOString() })
        .eq("id", attribution.id);

      if (claimErr) {
        results.errors.push(`claim error for ${attribution.id}: ${claimErr.message}`);
        log(`Error claiming ${attribution.id}: ${claimErr.message}`);
        continue;
      }

      // Credit the wallet — upsert to credit_wallets
      const creditAmount = attribution.attributed_amount_cents || 0;

      const { error: walletErr } = await client.rpc("upsert_credit_wallet_balance", {
        p_user_id: attribution.introducer_user_id,
        p_amount: creditAmount,
      });

      if (walletErr) {
        // Fallback: manual upsert if RPC doesn't exist
        const { data: existingWallet, error: fetchErr } = await client
          .from("credit_wallets")
          .select("*")
          .eq("user_id", attribution.introducer_user_id)
          .single();

        if (fetchErr && fetchErr.code !== "PGRST116") {
          results.errors.push(`wallet fetch error for ${attribution.id}: ${fetchErr.message}`);
          log(`Wallet fetch error ${attribution.id}: ${fetchErr.message}`);
          continue;
        }

        if (existingWallet) {
          // Update existing wallet
          const { error: updateErr } = await client
            .from("credit_wallets")
            .update({
              balance: existingWallet.balance + creditAmount,
              lifetime_earned: existingWallet.lifetime_earned + creditAmount,
              updated_at: now.toISOString(),
            })
            .eq("user_id", attribution.introducer_user_id);

          if (updateErr) {
            results.errors.push(`wallet update error for ${attribution.id}: ${updateErr.message}`);
            log(`Wallet update error ${attribution.id}: ${updateErr.message}`);
            continue;
          }
        } else {
          // Create new wallet
          const { error: insertErr } = await client.from("credit_wallets").insert({
            user_id: attribution.introducer_user_id,
            balance: creditAmount,
            lifetime_earned: creditAmount,
            lifetime_purchased: 0,
            lifetime_spent: 0,
          });

          if (insertErr) {
            results.errors.push(`wallet insert error for ${attribution.id}: ${insertErr.message}`);
            log(`Wallet insert error ${attribution.id}: ${insertErr.message}`);
            continue;
          }
        }
      }

      // Create notification
      await client.from("notifications").insert({
        user_id: attribution.introducer_user_id,
        type: "promotion_vested",
        title: "Red Carpet Credits Vested",
        message: `You've earned ${creditAmount} ${attribution.currency_class} from your Red Carpet introduction!`,
        link: "/red-carpet/my-credits",
      });

      results.vested_count++;
      log(`Vested ${attribution.currency_class} ${creditAmount} for user ${attribution.introducer_user_id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.errors.push(`process error for ${attribution.id}: ${msg}`);
      log(`Processing error for ${attribution.id}: ${msg}`);
    }
  }

  log(`Completed: ${results.vested_count} attributions vested, ${results.errors.length} errors`);

  return new Response(JSON.stringify(results, null, 2), {
    headers: { "Content-Type": "application/json" },
    status: results.errors.length > 0 ? 207 : 200,
  });
});
