// Family Knock Tracker - Tiered Rewards System
// Tracks family member knocks with expiration
// Tiers: 3 = card only, 5 = card + saying + photos, 7 = full slideshow + surprise

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// Base expiration: 5 minutes, +1 minute per knock
const BASE_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes
const BONUS_PER_KNOCK_MS = 1 * 60 * 1000; // 1 minute per knock

// Family members who can knock
const FAMILY_MEMBERS = {
  diana: { card: 'La Luna', symbol: '🌙', image: 'La_Luna.png' },
  ben: { card: 'La Calavera', symbol: '💀', image: 'La_Calavera.png' },
  noah: { card: 'La Mano', symbol: '✋', image: 'La_Mano.png' },
  ama: { card: 'La Rosa', symbol: '🌹', image: 'La_Rosa.png' },
  isa: { card: 'La Chalupa', symbol: '⛵', image: 'La_Chalupa.png' },
  ylona: { card: 'El Árbol', symbol: '🌳', image: 'El_Arbol.png' },
  jonathan: { card: 'El Sol', symbol: '☀️', image: 'El_Sol.png' },
};

// Map card names to person
function getPersonFromCard(card: string): string | null {
  const c = card.toLowerCase().trim();
  if (['la luna', 'luna', 'diana'].includes(c)) return 'diana';
  if (['la calavera', 'calavera', 'ben'].includes(c)) return 'ben';
  if (['la mano', 'mano', 'noah'].includes(c)) return 'noah';
  if (['la rosa', 'rosa', 'ama'].includes(c)) return 'ama';
  if (['la chalupa', 'chalupa', 'isa'].includes(c)) return 'isa';
  if (['el árbol', 'el arbol', 'árbol', 'arbol', 'ylona'].includes(c)) return 'ylona';
  if (['el sol', 'sol', 'jonathan', 'jon', 'dad', 'papa'].includes(c)) return 'jonathan';
  return null;
}

// Calculate expiration time based on number of active knocks
function calculateExpiration(knockCount: number): number {
  return BASE_EXPIRATION_MS + (knockCount * BONUS_PER_KNOCK_MS);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();

    // GET - Check current knock status
    if (req.method === 'GET') {
      // Get all knocks for today
      const { data, error } = await supabase
        .from('family_knocks')
        .select('person, knocked_at, expires_at')
        .eq('hunt_date', '2026-02-14');

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching knocks:', error);
      }

      const allKnocks = data || [];
      
      // Filter to only active (non-expired) knocks
      const activeKnocks = allKnocks.filter((k: any) => {
        const expiresAt = new Date(k.expires_at);
        return expiresAt > now;
      });

      const knockedPersons = activeKnocks.map((k: any) => k.person);
      const knockCount = knockedPersons.length;
      
      // Calculate time remaining (use earliest expiration)
      let secondsRemaining = 0;
      if (activeKnocks.length > 0) {
        const earliestExpiry = Math.min(...activeKnocks.map((k: any) => new Date(k.expires_at).getTime()));
        secondsRemaining = Math.max(0, Math.floor((earliestExpiry - now.getTime()) / 1000));
      }

      // Determine tier
      let tier = 0;
      if (knockCount >= 7) tier = 3;
      else if (knockCount >= 5) tier = 2;
      else if (knockCount >= 3) tier = 1;

      // Build response with member data
      const knockedMembers = knockedPersons.map((p: string) => ({
        person: p,
        ...FAMILY_MEMBERS[p as keyof typeof FAMILY_MEMBERS],
      }));

      return new Response(
        JSON.stringify({
          knockCount,
          knockedPersons,
          knockedMembers,
          tier,
          secondsRemaining,
          requiredForTier1: 3,
          requiredForTier2: 5,
          requiredForTier3: 7,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST - Register a knock
    if (req.method === 'POST') {
      const { card, password } = await req.json();

      // Validate password is FENIX
      const pwd = (password || '').toLowerCase().trim();
      if (pwd !== 'fenix' && pwd !== 'fénix' && pwd !== 'phoenix') {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid password' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Validate card is a family member
      const person = getPersonFromCard(card || '');
      if (!person) {
        return new Response(
          JSON.stringify({ success: false, error: 'Unknown card' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Get current active knocks to calculate expiration
      const { data: currentKnocks } = await supabase
        .from('family_knocks')
        .select('person, knocked_at, expires_at')
        .eq('hunt_date', '2026-02-14');

      const activeKnocks = (currentKnocks || []).filter((k: any) => {
        const expiresAt = new Date(k.expires_at);
        return expiresAt > now;
      });

      // Calculate new expiration time (base + bonus for each active knock + this one)
      const newKnockCount = activeKnocks.length + 1;
      const expirationMs = calculateExpiration(newKnockCount);
      const expiresAt = new Date(now.getTime() + expirationMs);

      // Update all active knocks to extend their expiration by 1 minute
      for (const knock of activeKnocks) {
        const currentExpiry = new Date(knock.expires_at);
        const newExpiry = new Date(currentExpiry.getTime() + BONUS_PER_KNOCK_MS);
        await supabase
          .from('family_knocks')
          .update({ expires_at: newExpiry.toISOString() })
          .eq('hunt_date', '2026-02-14')
          .eq('person', knock.person);
      }

      // Check if this person already has an active knock
      const existingKnock = activeKnocks.find((k: any) => k.person === person);
      
      if (existingKnock) {
        // Refresh their knock
        await supabase
          .from('family_knocks')
          .update({ 
            knocked_at: now.toISOString(),
            expires_at: expiresAt.toISOString()
          })
          .eq('hunt_date', '2026-02-14')
          .eq('person', person);
      } else {
        // Check if they have an expired knock to update, or need to insert
        const { data: expiredKnock } = await supabase
          .from('family_knocks')
          .select('id')
          .eq('hunt_date', '2026-02-14')
          .eq('person', person)
          .single();

        if (expiredKnock) {
          await supabase
            .from('family_knocks')
            .update({ 
              knocked_at: now.toISOString(),
              expires_at: expiresAt.toISOString()
            })
            .eq('hunt_date', '2026-02-14')
            .eq('person', person);
        } else {
          await supabase
            .from('family_knocks')
            .insert({
              hunt_date: '2026-02-14',
              person,
              knocked_at: now.toISOString(),
              expires_at: expiresAt.toISOString(),
            });
        }
      }

      // Get updated status
      const { data: updatedKnocks } = await supabase
        .from('family_knocks')
        .select('person, knocked_at, expires_at')
        .eq('hunt_date', '2026-02-14');

      const newActiveKnocks = (updatedKnocks || []).filter((k: any) => {
        const expiry = new Date(k.expires_at);
        return expiry > now;
      });

      const knockedPersons = newActiveKnocks.map((k: any) => k.person);
      const knockCount = knockedPersons.length;

      // Calculate time remaining
      let secondsRemaining = 0;
      if (newActiveKnocks.length > 0) {
        const earliestExpiry = Math.min(...newActiveKnocks.map((k: any) => new Date(k.expires_at).getTime()));
        secondsRemaining = Math.max(0, Math.floor((earliestExpiry - now.getTime()) / 1000));
      }

      // Determine tier
      let tier = 0;
      if (knockCount >= 7) tier = 3;
      else if (knockCount >= 5) tier = 2;
      else if (knockCount >= 3) tier = 1;

      const knockedMembers = knockedPersons.map((p: string) => ({
        person: p,
        ...FAMILY_MEMBERS[p as keyof typeof FAMILY_MEMBERS],
      }));

      return new Response(
        JSON.stringify({
          success: true,
          person,
          knockCount,
          knockedPersons,
          knockedMembers,
          tier,
          secondsRemaining,
          requiredForTier1: 3,
          requiredForTier2: 5,
          requiredForTier3: 7,
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
