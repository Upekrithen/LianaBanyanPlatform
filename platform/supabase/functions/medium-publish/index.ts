import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const token = Deno.env.get('MEDIUM_INTEGRATION_TOKEN');
  if (!token) {
    return new Response(
      JSON.stringify({ error: 'Medium not configured. Set MEDIUM_INTEGRATION_TOKEN in Supabase secrets.' }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { title, content, tags, publishStatus } = await req.json();

    const meRes = await fetch('https://api.medium.com/v1/me', {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const me = await meRes.json();
    const userId = me.data.id;

    const postRes = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        contentFormat: 'markdown',
        content,
        tags: tags?.slice(0, 5) || [],
        publishStatus: publishStatus || 'draft',
        canonicalUrl: null,
      }),
    });

    const post = await postRes.json();
    return new Response(
      JSON.stringify(post),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
