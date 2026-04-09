/**
 * HOUSING-MANAGE — CRUD for housing contributions and property queries
 * ====================================================================
 * POST: create/update a housing contribution
 * GET:  list properties with occupancy status
 * Auth: authenticated users only
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const propertyId = url.searchParams.get('property_id');

      if (propertyId) {
        const { data: property, error } = await supabase
          .from('housing_properties')
          .select('*, housing_occupancy(*), housing_contributions(count)')
          .eq('id', propertyId)
          .single();

        if (error) throw error;
        return new Response(JSON.stringify({ success: true, property }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: properties, error } = await supabase
        .from('housing_properties')
        .select('id, name, location, status, capacity, housing_occupancy(count)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, properties }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const { action } = body;

      if (action === 'contribute') {
        const { property_id, amount, note } = body;
        if (!property_id || !amount) {
          return new Response(JSON.stringify({ error: 'property_id and amount required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data, error } = await supabase
          .from('housing_contributions')
          .insert({
            property_id,
            user_id: user.id,
            amount: Number(amount),
            note: note || null,
          })
          .select('id')
          .single();

        if (error) throw error;
        return new Response(JSON.stringify({ success: true, contribution_id: data.id }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
