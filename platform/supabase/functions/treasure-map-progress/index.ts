/**
 * TREASURE-MAP-PROGRESS — Save and retrieve treasure map progress
 * ================================================================
 * POST: save quiz answers and advance progress
 * GET:  retrieve user's progress across all maps
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
      const mapId = url.searchParams.get('map_id');

      const query = supabase
        .from('treasure_map_progress')
        .select('map_id, current_phase, score, completed_at, updated_at')
        .eq('user_id', user.id);

      if (mapId) query.eq('map_id', mapId);

      const { data: progress, error } = await query.order('updated_at', { ascending: false });
      if (error) throw error;

      return new Response(JSON.stringify({ success: true, progress }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const { action } = body;

      if (action === 'save_answer') {
        const { map_id, question_id, answer, is_correct } = body;
        if (!map_id || !question_id) {
          return new Response(JSON.stringify({ error: 'map_id and question_id required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { error } = await supabase
          .from('treasure_map_answers')
          .upsert({
            user_id: user.id,
            map_id,
            question_id,
            answer,
            is_correct: !!is_correct,
            answered_at: new Date().toISOString(),
          }, { onConflict: 'user_id,map_id,question_id' });

        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (action === 'advance_phase') {
        const { map_id, new_phase, score_delta } = body;
        if (!map_id || new_phase == null) {
          return new Response(JSON.stringify({ error: 'map_id and new_phase required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data: existing } = await supabase
          .from('treasure_map_progress')
          .select('id, score')
          .eq('user_id', user.id)
          .eq('map_id', map_id)
          .maybeSingle();

        if (existing) {
          const { error } = await supabase
            .from('treasure_map_progress')
            .update({
              current_phase: new_phase,
              score: (existing.score || 0) + (score_delta || 0),
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('treasure_map_progress')
            .insert({
              user_id: user.id,
              map_id,
              current_phase: new_phase,
              score: score_delta || 0,
            });
          if (error) throw error;
        }

        return new Response(JSON.stringify({ success: true, phase: new_phase }), {
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
