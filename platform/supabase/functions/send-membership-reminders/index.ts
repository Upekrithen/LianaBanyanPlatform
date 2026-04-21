import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get users needing reminders (7 days before expiration)
    const { data: candidates, error: fetchError } = await supabase
      .rpc('get_membership_reminder_candidates');

    if (fetchError) throw fetchError;

    console.log(`Found ${candidates?.length || 0} users needing reminders`);

    let sentCount = 0;
    let errorCount = 0;

    for (const candidate of candidates || []) {
      try {
        const confirmUrl = `${req.headers.get('origin') || 'https://yourdomain.com'}/membership/confirm?token=${candidate.confirmation_token}`;

        // In production, you would send actual emails here
        // For now, we'll just log and mark as sent
        console.log(`Would send reminder to ${candidate.email}:`, {
          expires_at: candidate.expires_at,
          confirm_url: confirmUrl,
        });

        // Send actual email using Resend
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        if (resendApiKey) {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: 'membership@lianabanyan.org',
              to: candidate.email,
              subject: 'Your Liana Banyan membership expires in 7 days',
              html: `<p>Your Liana Banyan membership is expiring soon.</p><p>Click here to continue: <a href="${confirmUrl}">Extend Membership</a></p>`
            })
          });
          if (!res.ok) {
            throw new Error(`Resend API error: ${await res.text()}`);
          }
        } else {
          console.warn('RESEND_API_KEY not set, skipping actual email send');
        }

        // Mark reminder as sent
        await supabase.rpc('mark_reminder_sent', { _user_id: candidate.user_id });
        sentCount++;
      } catch (error) {
        console.error(`Error sending reminder to ${candidate.email}:`, error);
        errorCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        candidates: candidates?.length || 0,
        sent: sentCount,
        errors: errorCount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-membership-reminders:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
