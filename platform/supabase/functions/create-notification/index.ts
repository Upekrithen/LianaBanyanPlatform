import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VALID_TYPES = [
  'order_update', 'crew_call', 'star_chamber', 'arena_result',
  'map_complete', 'housing_update', 'bill_update', 'system', 'welcome',
] as const;

interface CreateNotificationBody {
  user_id: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') || '';
    const systemKey = Deno.env.get('LB_SYSTEM_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!authHeader.includes(systemKey) && systemKey) {
      const token = authHeader.replace('Bearer ', '');
      if (token !== systemKey) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const payload: CreateNotificationBody = await req.json();

    if (!payload.user_id || !payload.type || !payload.title) {
      return new Response(JSON.stringify({ error: 'user_id, type, and title are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!VALID_TYPES.includes(payload.type as typeof VALID_TYPES[number])) {
      return new Response(JSON.stringify({ error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: payload.user_id,
        type: payload.type,
        title: payload.title,
        body: payload.body || null,
        link: payload.link || null,
      })
      .select('id, created_at')
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ id: data.id, created_at: data.created_at }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
