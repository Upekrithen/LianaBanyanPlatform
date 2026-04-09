/**
 * BEACON-TRACK — Start/complete beacon runs, record node visits, query history
 * ==============================================================================
 * POST: start a run, visit a node, complete a run
 * GET:  user's beacon history and points
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
      const view = url.searchParams.get('view') || 'runs';

      if (view === 'points') {
        const { data, error } = await supabase
          .from('beacon_points')
          .select('points, source, earned_at')
          .eq('user_id', user.id)
          .order('earned_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        const total = (data || []).reduce((sum, r) => sum + (r.points || 0), 0);
        return new Response(JSON.stringify({ success: true, total_points: total, history: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: runs, error } = await supabase
        .from('beacon_runs')
        .select('id, beacon_slug, status, started_at, completed_at, elapsed_seconds, nodes_visited')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, runs }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const { action } = body;

      if (action === 'start') {
        const { beacon_slug, run_name } = body;
        if (!beacon_slug) {
          return new Response(JSON.stringify({ error: 'beacon_slug required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data, error } = await supabase
          .from('beacon_runs')
          .insert({
            user_id: user.id,
            beacon_slug,
            run_name: run_name || beacon_slug,
            status: 'active',
            started_at: new Date().toISOString(),
            nodes_visited: 0,
          })
          .select('id')
          .single();

        if (error) throw error;
        return new Response(JSON.stringify({ success: true, run_id: data.id }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (action === 'visit_node') {
        const { run_id, node_id, node_route } = body;
        if (!run_id || !node_id) {
          return new Response(JSON.stringify({ error: 'run_id and node_id required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        await supabase.from('beacon_run_progress').insert({
          run_id,
          user_id: user.id,
          node_id,
          node_route: node_route || null,
          visited_at: new Date().toISOString(),
        });

        await supabase.rpc('increment_beacon_nodes_visited', { p_run_id: run_id }).catch(() => {
          // fallback if RPC doesn't exist
        });

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (action === 'complete') {
        const { run_id, elapsed_seconds } = body;
        if (!run_id) {
          return new Response(JSON.stringify({ error: 'run_id required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { error } = await supabase
          .from('beacon_runs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            elapsed_seconds: elapsed_seconds || null,
          })
          .eq('id', run_id)
          .eq('user_id', user.id);

        if (error) throw error;

        await supabase.from('beacon_points').insert({
          user_id: user.id,
          points: 10,
          source: `beacon_run:${run_id}`,
          earned_at: new Date().toISOString(),
        });

        return new Response(JSON.stringify({ success: true, points_earned: 10 }), {
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
