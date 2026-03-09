/**
 * FAMILY-TOGGLE-CONNECTION — Toggle relationship with another family member
 * ==========================================================================
 * Allows a member to disconnect from a specific family member without leaving.
 * The disconnected member won't see your shared content (photos, gifts) and
 * you won't see theirs, but everyone else is unaffected.
 * 
 * POST body:
 *   - familyId: UUID
 *   - targetMemberId: UUID (the member to toggle connection with)
 *   - connected: boolean (true = connect, false = disconnect)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { familyId, targetMemberId, connected } = body;

    if (!familyId || !targetMemberId || connected === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: familyId, targetMemberId, connected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the requesting user's member record
    const { data: fromMember, error: fromError } = await supabase
      .from('family_members')
      .select('*')
      .eq('family_id', familyId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (fromError || !fromMember) {
      return new Response(
        JSON.stringify({ error: 'You are not a member of this family' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the target member
    const { data: toMember, error: toError } = await supabase
      .from('family_members')
      .select('*')
      .eq('id', targetMemberId)
      .eq('family_id', familyId)
      .eq('is_active', true)
      .single();

    if (toError || !toMember) {
      return new Response(
        JSON.stringify({ error: 'Target member not found in this family' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Can't toggle connection with yourself
    if (fromMember.id === toMember.id) {
      return new Response(
        JSON.stringify({ error: 'Cannot toggle connection with yourself' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for existing relationship record
    const { data: existingRelation } = await supabase
      .from('member_relationships')
      .select('*')
      .eq('family_id', familyId)
      .eq('from_member', fromMember.id)
      .eq('to_member', toMember.id)
      .single();

    if (existingRelation) {
      // Update existing relationship
      const { error: updateError } = await supabase
        .from('member_relationships')
        .update({
          is_connected: connected,
          disconnected_at: connected ? null : new Date().toISOString(),
          reconnected_at: connected ? new Date().toISOString() : null,
        })
        .eq('id', existingRelation.id);

      if (updateError) {
        console.error('Error updating relationship:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update relationship' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // Create new relationship record
      const { error: insertError } = await supabase
        .from('member_relationships')
        .insert({
          family_id: familyId,
          from_member: fromMember.id,
          to_member: toMember.id,
          is_connected: connected,
          disconnected_at: connected ? null : new Date().toISOString(),
        });

      if (insertError) {
        console.error('Error creating relationship:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to create relationship' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log(`🔗 ${fromMember.nickname} ${connected ? 'connected to' : 'disconnected from'} ${toMember.nickname}`);

    return new Response(
      JSON.stringify({
        success: true,
        fromMember: fromMember.nickname,
        toMember: toMember.nickname,
        connected,
        message: connected
          ? `You are now connected with ${toMember.nickname}. You will see each other's shared content.`
          : `You have disconnected from ${toMember.nickname}. Your shared content will be hidden from each other.`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
