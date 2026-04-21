/**
 * VAULT STATUS — Check unlock status for paired vault access
 * ===========================================================
 * Returns whether a person has unlocked their vault and if their
 * paired family members have also unlocked.
 *
 * GET /vault-status?person=diana
 * Returns: { unlocked: true, unlockedAt: "...", unlockedPersons: [...] }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const person = url.searchParams.get('person')?.toLowerCase().trim();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all unlocked vaults
    const { data: unlocks, error } = await supabase
      .from('vault_unlocks')
      .select('person, unlocked_at');

    if (error) {
      console.error('Error fetching unlocks:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch unlock status' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const unlockedPersons = (unlocks || []).map((u: any) => u.person);
    const unlockMap: Record<string, string> = {};
    (unlocks || []).forEach((u: any) => {
      unlockMap[u.person] = u.unlocked_at;
    });

    // If a specific person was requested
    if (person) {
      const isUnlocked = unlockedPersons.includes(person);
      const unlockedAt = unlockMap[person] || null;

      // Check if Jonathan (el sol) has unlocked - required for paired access
      const jonathanUnlocked = unlockedPersons.includes('jonathan');

      // For paired vault access: both the person AND jonathan must have unlocked
      const pairUnlocked = isUnlocked && jonathanUnlocked;

      return new Response(
        JSON.stringify({
          person,
          unlocked: isUnlocked,
          unlockedAt,
          jonathanUnlocked,
          pairUnlocked,
          unlockedPersons,
          totalUnlocked: unlockedPersons.length,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return all unlock statuses
    return new Response(
      JSON.stringify({
        unlockedPersons,
        unlockMap,
        totalUnlocked: unlockedPersons.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
