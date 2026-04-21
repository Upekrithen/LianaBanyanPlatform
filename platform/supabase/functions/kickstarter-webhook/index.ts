import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-kickstarter-signature',
};

// Kickstarter webhook secret for signature verification
const KICKSTARTER_WEBHOOK_SECRET = Deno.env.get('KICKSTARTER_WEBHOOK_SECRET');

async function verifyWebhookSignature(payload: string, signature: string): Promise<boolean> {
  if (!KICKSTARTER_WEBHOOK_SECRET) {
    console.error('KICKSTARTER_WEBHOOK_SECRET not configured');
    return false;
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(KICKSTARTER_WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  );

  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  console.log('Verifying signature:', {
    received: signature,
    expected: expectedSignature
  });

  return signature === expectedSignature;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const signature = req.headers.get('x-kickstarter-signature');
    const rawBody = await req.text();

    // Verify webhook signature
    if (!signature || !(await verifyWebhookSignature(rawBody, signature))) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const webhookData = JSON.parse(rawBody);
    console.log('Received Kickstarter webhook:', webhookData);

    // Handle different webhook events
    const eventType = webhookData.event_type;

    if (eventType === 'pledge.create' || eventType === 'pledge.update') {
      const pledge = webhookData.pledge;

      // Find or create user by email
      let userId = null;
      const backerEmail = pledge.backer?.email;

      if (backerEmail) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', backerEmail)
          .maybeSingle();

        userId = profile?.id || null;
      }

      // Find product by reward tier or project
      const { data: products } = await supabase
        .from('products')
        .select('id, project_id')
        .limit(1);

      const productId = products?.[0]?.id || null;

      // Store the pledge
      const { error: insertError } = await supabase
        .from('kickstarter_pledges')
        .upsert({
          kickstarter_pledge_id: pledge.id?.toString(),
          backer_email: backerEmail || 'unknown@kickstarter.com',
          pledge_amount: pledge.amount || 0,
          product_id: productId,
          user_id: userId,
          is_processed: false,
          synced_at: new Date().toISOString(),
        }, {
          onConflict: 'kickstarter_pledge_id'
        });

      if (insertError) {
        console.error('Error storing pledge:', insertError);
        throw insertError;
      }

      console.log('Kickstarter pledge stored successfully');
    }

    return new Response(
      JSON.stringify({ success: true, event_type: eventType }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
