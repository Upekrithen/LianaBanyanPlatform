import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const { channel, payload } = await req.json();

    let result: any;

    switch (channel) {
      case 'email': {
        const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'outreach',
            email: payload.recipientEmail,
            data: {
              recipientName: payload.recipientName,
              senderName: 'Liana Banyan Corporation',
              subject: payload.title,
              body: payload.content,
              ctaText: payload.ctaText || 'Learn More',
              ctaUrl: payload.ctaUrl || 'https://lianabanyan.com',
              cueCardType: payload.cueCardType || null,
            },
          }),
        });
        result = await emailRes.json();
        break;
      }

      case 'medium': {
        const mediumRes = await fetch(`${supabaseUrl}/functions/v1/medium-publish`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: payload.title,
            content: payload.content,
            tags: payload.tags || [],
            publishStatus: payload.publishStatus || 'draft',
          }),
        });
        result = await mediumRes.json();
        break;
      }

      case 'twitter':
      case 'linkedin':
      case 'facebook':
      case 'bluesky':
      case 'threads': {
        const { data, error } = await supabase
          .from('scheduled_posts')
          .insert({
            platform: channel,
            content: payload.content,
            title: payload.title,
            image_urls: payload.imageUrls || [],
            scheduled_for: payload.scheduledFor || new Date().toISOString(),
            status: 'pending',
          })
          .select()
          .single();
        if (error) throw error;
        result = data;
        break;
      }

      case 'cephas': {
        result = { status: 'flagged_for_deploy', note: 'Content will appear on next Hugo build + deploy' };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unsupported channel: ${channel}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    if (payload.outboundItemId) {
      const { data: dispatchRow } = await supabase
        .from('outbound_dispatch')
        .update({
          status: 'dispatched',
          dispatched_at: new Date().toISOString(),
        })
        .eq('id', payload.outboundItemId)
        .select('title, metadata, content_path')
        .single();

      if (dispatchRow?.metadata?.golden_key) {
        await supabase.from('treasure_keys').upsert({
          key_word: dispatchRow.metadata.golden_key,
          document_name: dispatchRow.title,
          document_path: dispatchRow.content_path || '',
          tier: dispatchRow.metadata.key_tier || 'fledgling',
          hiding_method: dispatchRow.metadata.key_method || 'natural',
          feathers: dispatchRow.metadata.feathers || 1,
          hint: `Hidden in "${dispatchRow.title}"`,
          is_active: true,
          source: 'dispatch',
          dispatch_id: payload.outboundItemId,
        }, { onConflict: 'key_word' });

        await supabase.from('outbound_dispatch')
          .update({ metadata: { ...dispatchRow.metadata, key_registered: true } })
          .eq('id', payload.outboundItemId);
      }
    }

    return new Response(
      JSON.stringify({ success: true, channel, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
