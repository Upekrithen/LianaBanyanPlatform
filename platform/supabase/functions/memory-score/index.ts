/**
 * MEMORY SCORE — Store and retrieve memory game scores
 * =====================================================
 * POST: Store a new game score
 * GET: Retrieve leaderboard for a vault
 * 
 * POST body: { player: "diana", vaultOwner: "diana", score: 850, moves: 12 }
 * GET: /memory-score?vault=diana
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // GET - Retrieve leaderboard
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const vaultOwner = url.searchParams.get('vault')?.toLowerCase().trim();

      if (!vaultOwner) {
        return new Response(
          JSON.stringify({ error: 'Missing vault parameter' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Get high score for this vault
      const { data: highScore, error: highError } = await supabase
        .from('memory_game_scores')
        .select('*')
        .eq('vault_owner', vaultOwner)
        .eq('is_high_score', true)
        .order('score', { ascending: false })
        .limit(1)
        .single();

      // Get total attempts that weren't high scores (failed attempts to seize throne)
      const { count: failedAttempts } = await supabase
        .from('memory_game_scores')
        .select('*', { count: 'exact', head: true })
        .eq('vault_owner', vaultOwner)
        .eq('is_high_score', false);

      // Get recent scores
      const { data: recentScores, error: recentError } = await supabase
        .from('memory_game_scores')
        .select('player, score, attempts, played_at, is_high_score')
        .eq('vault_owner', vaultOwner)
        .order('played_at', { ascending: false })
        .limit(10);

      return new Response(
        JSON.stringify({
          vaultOwner,
          highScore: highScore || null,
          failedAttempts: failedAttempts || 0,
          recentScores: recentScores || [],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST - Store a new score
    if (req.method === 'POST') {
      const { player, vaultOwner, score, moves } = await req.json();

      if (!player || !vaultOwner || score === undefined) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: player, vaultOwner, score' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      const playerKey = player.toLowerCase().trim();
      const vaultKey = vaultOwner.toLowerCase().trim();

      // Check current high score for this vault
      const { data: currentHigh } = await supabase
        .from('memory_game_scores')
        .select('score, id')
        .eq('vault_owner', vaultKey)
        .eq('is_high_score', true)
        .single();

      const isNewHighScore = !currentHigh || score > currentHigh.score;

      // If this is a new high score, mark the old one as not high score
      if (isNewHighScore && currentHigh) {
        await supabase
          .from('memory_game_scores')
          .update({ is_high_score: false })
          .eq('id', currentHigh.id);
      }

      // Insert the new score
      const { data: newScore, error: insertError } = await supabase
        .from('memory_game_scores')
        .insert({
          player: playerKey,
          vault_owner: vaultKey,
          score,
          attempts: moves || 0,
          is_high_score: isNewHighScore,
          played_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting score:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to save score' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      // Get updated failed attempts count
      const { count: failedAttempts } = await supabase
        .from('memory_game_scores')
        .select('*', { count: 'exact', head: true })
        .eq('vault_owner', vaultKey)
        .eq('is_high_score', false);

      return new Response(
        JSON.stringify({
          success: true,
          isNewHighScore,
          score: newScore,
          failedAttempts: failedAttempts || 0,
          message: isNewHighScore 
            ? '👑 New high score! You have seized the throne!'
            : `Your attempt has been recorded. ${failedAttempts} unsuccessful attempts to seize the throne.`,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders });

  } catch (err) {
    console.error('Error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
