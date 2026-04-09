/**
 * CREW-MANAGE — Crew creation, member assignment, and status updates
 * ===================================================================
 * POST: create crew, assign members, update status
 * GET:  list user's crews and assignments
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
      const crewId = url.searchParams.get('crew_id');

      if (crewId) {
        const { data: crew, error } = await supabase
          .from('crews')
          .select('*, crew_members(*)')
          .eq('id', crewId)
          .single();

        if (error) throw error;
        return new Response(JSON.stringify({ success: true, crew }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: memberships, error } = await supabase
        .from('crew_members')
        .select('crew_id, role, status, crews(id, name, slug, status, created_at)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, crews: memberships }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const { action } = body;

      if (action === 'create') {
        const { name, slug, description, max_members } = body;
        if (!name) {
          return new Response(JSON.stringify({ error: 'name is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data: crew, error } = await supabase
          .from('crews')
          .insert({
            name,
            slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: description || null,
            max_members: max_members || 10,
            created_by: user.id,
            status: 'active',
          })
          .select('id')
          .single();

        if (error) throw error;

        await supabase.from('crew_members').insert({
          crew_id: crew.id,
          user_id: user.id,
          role: 'captain',
          status: 'active',
        });

        return new Response(JSON.stringify({ success: true, crew_id: crew.id }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (action === 'assign') {
        const { crew_id, target_user_id, role } = body;
        if (!crew_id || !target_user_id) {
          return new Response(JSON.stringify({ error: 'crew_id and target_user_id required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { error } = await supabase
          .from('crew_members')
          .upsert({
            crew_id,
            user_id: target_user_id,
            role: role || 'member',
            status: 'active',
          }, { onConflict: 'crew_id,user_id' });

        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (action === 'update_status') {
        const { crew_id, status } = body;
        if (!crew_id || !status) {
          return new Response(JSON.stringify({ error: 'crew_id and status required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { error } = await supabase
          .from('crews')
          .update({ status })
          .eq('id', crew_id);

        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
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
