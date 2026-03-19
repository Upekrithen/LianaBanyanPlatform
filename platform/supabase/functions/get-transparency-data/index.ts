const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const SANTA_TIERS = ['spark', 'kindle', 'flame', 'blaze', 'inferno', 'full_sponsor'];

async function stripeGet(path: string, key: string) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    headers: { "Authorization": `Basic ${btoa(key + ":")}` },
  });
  return res.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";

    const [balance, sessions, payments] = await Promise.all([
      stripeGet("/balance", stripeKey),
      stripeGet("/checkout/sessions?limit=100&expand[]=data.line_items", stripeKey),
      stripeGet("/payment_intents?limit=100", stripeKey),
    ]);

    const santaSessions = (sessions.data || []).filter(
      (s: any) => s.status === 'complete' && (
        SANTA_TIERS.includes(s.metadata?.tier) ||
        s.metadata?.initiative === 'santa' ||
        (s.line_items?.data?.[0]?.description || '').toLowerCase().includes('santa')
      )
    );

    const santaPayments = (payments.data || []).filter(
      (p: any) => p.status === 'succeeded' && (
        SANTA_TIERS.includes(p.metadata?.tier) ||
        p.metadata?.initiative === 'santa'
      )
    );

    const sessionPaymentIntents = new Set(santaSessions.map((s: any) => s.payment_intent));
    const uniquePayments = santaPayments.filter((p: any) => !sessionPaymentIntents.has(p.id));

    const sessionTotal = santaSessions.reduce((sum: number, s: any) => sum + (s.amount_total || 0), 0) / 100;
    const paymentTotal = uniquePayments.reduce((sum: number, p: any) => sum + p.amount, 0) / 100;

    const donorEmails = new Set([
      ...santaSessions.map((s: any) => s.customer_email || s.customer || s.id),
      ...uniquePayments.map((p: any) => p.receipt_email || p.customer || p.id),
    ]);

    const giftsPerTier: Record<string, number> = { spark: 1, kindle: 2, flame: 5, blaze: 10, inferno: 20, full_sponsor: 1 };
    const votesPerTier: Record<string, number> = { spark: 5, kindle: 10, flame: 25, blaze: 50, inferno: 100, full_sponsor: 350 };

    const countByTier = (items: any[], perTier: Record<string, number>) =>
      items.reduce((sum: number, item: any) => {
        const tier = item.metadata?.tier || 'spark';
        const qty = parseInt(item.metadata?.quantity || '1');
        return sum + (perTier[tier] || 1) * qty;
      }, 0);

    const recentTransactions = santaSessions.slice(0, 20).map((s: any) => ({
      id: s.id,
      date: new Date(s.created * 1000).toISOString().split('T')[0],
      type: 'donation',
      amount: (s.amount_total || 0) / 100,
      tier: s.metadata?.tier || 'spark',
      description: `$${(s.amount_total || 0) / 100} Santa - ${(s.metadata?.tier || 'SPARK').toUpperCase()}`,
      donorName: s.customer_details?.name || 'Anonymous Santa',
    }));

    const availableBalance = (balance.available || []).reduce((sum: number, b: any) => sum + b.amount, 0) / 100;
    const pendingBalance = (balance.pending || []).reduce((sum: number, b: any) => sum + b.amount, 0) / 100;

    return new Response(JSON.stringify({
      lastUpdated: new Date().toISOString(),
      stripe: {
        availableBalance, pendingBalance,
        totalBalance: availableBalance + pendingBalance,
        totalReceived: sessionTotal + paymentTotal,
        totalDonors: donorEmails.size,
        totalGiftsFunded: countByTier(santaSessions, giftsPerTier) + countByTier(uniquePayments, giftsPerTier),
        totalVotes: countByTier(santaSessions, votesPerTier) + countByTier(uniquePayments, votesPerTier),
        recentTransactions,
      },
      debug: {
        sessionsFound: sessions.data?.length || 0,
        santaSessionsFound: santaSessions.length,
        paymentsFound: payments.data?.length || 0,
        santaPaymentsFound: santaPayments.length,
      },
      mercury: null,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Transparency data error:", error);
    return new Response(
      JSON.stringify({ error: error.message, stripe: null }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
