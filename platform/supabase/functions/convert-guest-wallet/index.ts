/**
 * convert-guest-wallet — K158 Edge Function
 *
 * When a guest with a guest_marks_wallets entry creates a $5 membership,
 * transfer their accumulated Marks to the new transaction_ledger and set
 * converted_to_member_id. Called from the membership verification flow.
 *
 * POST { member_id: uuid, email: string }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const { member_id, email } = body;

    if (!member_id || !email) {
      return new Response(
        JSON.stringify({ error: "member_id and email are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 1. Look up guest wallet by email
    const { data: wallet, error: walletErr } = await supabase
      .from("guest_marks_wallets")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .is("converted_to_member_id", null)
      .single();

    if (walletErr || !wallet) {
      return new Response(
        JSON.stringify({
          converted: false,
          reason: "no_wallet",
          message: "No unconverted guest wallet found for this email",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 2. Check if wallet has expired
    if (new Date(wallet.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({
          converted: false,
          reason: "expired",
          message: "Guest wallet expired before conversion",
          expired_at: wallet.expires_at,
          marks_lost: wallet.marks_balance,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 3. Check if there are Marks to transfer
    if (wallet.marks_balance <= 0) {
      // Still mark as converted even with 0 balance
      await supabase
        .from("guest_marks_wallets")
        .update({
          converted_to_member_id: member_id,
          conversion_date: new Date().toISOString(),
        })
        .eq("id", wallet.id);

      return new Response(
        JSON.stringify({
          converted: true,
          marks_transferred: 0,
          message: "Wallet converted (no Marks to transfer)",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 4. Write Marks to transaction_ledger
    const { error: ledgerErr } = await supabase
      .from("transaction_ledger")
      .insert({
        stripe_event_id: `guest_conversion_${wallet.id}_${Date.now()}`,
        ledger_category: "guest_conversion",
        amount_cents: wallet.marks_balance * 100,
        currency: "marks",
        payee_id: member_id,
        payer_id: null,
        is_patronage: false,
        status: "completed",
        description: `Guest wallet conversion: ${wallet.marks_balance} Marks transferred from guest wallet (${wallet.email})`,
        metadata: {
          guest_wallet_id: wallet.id,
          guest_email: wallet.email,
          original_marks: wallet.marks_balance,
          conversion_type: "guest_to_member",
        },
        webhook_source: "convert-guest-wallet",
      });

    if (ledgerErr) throw ledgerErr;

    // 5. Mark wallet as converted
    const { error: updateErr } = await supabase
      .from("guest_marks_wallets")
      .update({
        converted_to_member_id: member_id,
        conversion_date: new Date().toISOString(),
        marks_balance: 0,
      })
      .eq("id", wallet.id);

    if (updateErr) throw updateErr;

    // 6. Log the conversion
    await supabase.from("cron_job_log").insert({
      job_name: "convert-guest-wallet",
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
      status: "completed",
      records_processed: 1,
      details: {
        member_id,
        email: wallet.email,
        marks_transferred: wallet.marks_balance,
        wallet_id: wallet.id,
      },
    });

    return new Response(
      JSON.stringify({
        converted: true,
        marks_transferred: wallet.marks_balance,
        wallet_id: wallet.id,
        message: `Successfully transferred ${wallet.marks_balance} Marks to member account`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("convert-guest-wallet error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
