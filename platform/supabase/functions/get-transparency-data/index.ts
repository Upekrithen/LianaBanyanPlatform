import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

// Valid Santa tier IDs
const SANTA_TIERS = ['spark', 'kindle', 'flame', 'blaze', 'inferno', 'full_sponsor'];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get Stripe balance
    const balance = await stripe.balance.retrieve();
    
    // Get recent successful checkout sessions (more reliable than payment intents)
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      expand: ['data.line_items'],
    });

    // Also get payment intents as backup
    const payments = await stripe.paymentIntents.list({
      limit: 100,
    });

    // Filter to successful Santa payments (by tier in metadata OR product name containing "Santa")
    const santaSessions = sessions.data.filter(
      (s) => s.status === 'complete' && (
        SANTA_TIERS.includes(s.metadata?.tier) ||
        s.metadata?.initiative === 'santa' ||
        (s.line_items?.data?.[0]?.description || '').toLowerCase().includes('santa')
      )
    );

    // Also check payment intents
    const santaPayments = payments.data.filter(
      (p) => p.status === 'succeeded' && (
        SANTA_TIERS.includes(p.metadata?.tier) ||
        p.metadata?.initiative === 'santa'
      )
    );

    // Combine and dedupe (prefer sessions data)
    const sessionPaymentIntents = new Set(santaSessions.map(s => s.payment_intent));
    const uniquePayments = santaPayments.filter(p => !sessionPaymentIntents.has(p.id));

    // Calculate totals from sessions
    const sessionTotal = santaSessions.reduce((sum, s) => sum + (s.amount_total || 0), 0) / 100;
    const paymentTotal = uniquePayments.reduce((sum, p) => sum + p.amount, 0) / 100;
    const totalReceived = sessionTotal + paymentTotal;

    // Count unique donors
    const donorEmails = new Set([
      ...santaSessions.map(s => s.customer_email || s.customer || s.id),
      ...uniquePayments.map(p => p.receipt_email || p.customer || p.id)
    ]);
    const totalDonors = donorEmails.size;

    // Calculate gifts funded
    const giftsPerTier: Record<string, number> = {
      'spark': 1, 'kindle': 2, 'flame': 5, 'blaze': 10, 'inferno': 20, 'full_sponsor': 1
    };
    
    const totalGiftsFunded = santaSessions.reduce((sum, s) => {
      const tier = s.metadata?.tier || 'spark';
      const quantity = parseInt(s.metadata?.quantity || '1');
      return sum + (giftsPerTier[tier] || 1) * quantity;
    }, 0) + uniquePayments.reduce((sum, p) => {
      const tier = p.metadata?.tier || 'spark';
      const quantity = parseInt(p.metadata?.quantity || '1');
      return sum + (giftsPerTier[tier] || 1) * quantity;
    }, 0);

    // Calculate votes
    const votesPerTier: Record<string, number> = {
      'spark': 5, 'kindle': 10, 'flame': 25, 'blaze': 50, 'inferno': 100, 'full_sponsor': 350
    };
    
    const totalVotes = santaSessions.reduce((sum, s) => {
      const tier = s.metadata?.tier || 'spark';
      const quantity = parseInt(s.metadata?.quantity || '1');
      return sum + (votesPerTier[tier] || 5) * quantity;
    }, 0) + uniquePayments.reduce((sum, p) => {
      const tier = p.metadata?.tier || 'spark';
      const quantity = parseInt(p.metadata?.quantity || '1');
      return sum + (votesPerTier[tier] || 5) * quantity;
    }, 0);

    // Get recent transactions for the log (from sessions)
    const recentTransactions = santaSessions.slice(0, 20).map((s) => ({
      id: s.id,
      date: new Date(s.created * 1000).toISOString().split('T')[0],
      type: 'donation',
      amount: (s.amount_total || 0) / 100,
      tier: s.metadata?.tier || 'spark',
      description: `$${(s.amount_total || 0) / 100} Santa - ${(s.metadata?.tier || 'SPARK').toUpperCase()}`,
      donorName: s.custom_fields?.find((f: any) => f.key === 'donor_name')?.text?.value || 
                 s.customer_details?.name || 
                 'Anonymous Santa',
    }));

    // Stripe balance breakdown
    const availableBalance = balance.available.reduce((sum, b) => sum + b.amount, 0) / 100;
    const pendingBalance = balance.pending.reduce((sum, b) => sum + b.amount, 0) / 100;

    const response = {
      lastUpdated: new Date().toISOString(),
      stripe: {
        availableBalance,
        pendingBalance,
        totalBalance: availableBalance + pendingBalance,
        totalReceived,
        totalDonors,
        totalGiftsFunded,
        totalVotes,
        recentTransactions,
      },
      // Debug info
      debug: {
        sessionsFound: sessions.data.length,
        santaSessionsFound: santaSessions.length,
        paymentsFound: payments.data.length,
        santaPaymentsFound: santaPayments.length,
      },
      mercury: null,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Transparency data error:", error);
    return new Response(
      JSON.stringify({ error: error.message, stripe: null }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
