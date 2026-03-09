/**
 * FAMILY-CREATE — Create a new family group
 * ==========================================
 * Creates a family (or Crew, Troupe, etc.) and adds the creator as founder.
 * 
 * POST body:
 *   - name: string (e.g., "The Vigil Family")
 *   - displayName: string (what members call it: "Family", "Crew", "Troupe")
 *   - founderNickname: string (creator's name within the family)
 *   - founderSymbol: string (emoji like "☀️")
 *   - settings: object (optional settings like timezone)
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
    // Get auth token from request
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

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { name, displayName, founderNickname, founderSymbol, settings } = body;

    if (!name || !founderNickname) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, founderNickname' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create the family
    const { data: family, error: familyError } = await supabase
      .from('families')
      .insert({
        name,
        display_name: displayName || 'Family',
        created_by: user.id,
        settings: settings || {},
      })
      .select()
      .single();

    if (familyError) {
      console.error('Error creating family:', familyError);
      return new Response(
        JSON.stringify({ error: 'Failed to create family', details: familyError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Add creator as founder
    const { data: member, error: memberError } = await supabase
      .from('family_members')
      .insert({
        family_id: family.id,
        user_id: user.id,
        nickname: founderNickname,
        symbol: founderSymbol || '👤',
        role: 'founder',
        joined_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (memberError) {
      console.error('Error creating founder member:', memberError);
      // Rollback family creation
      await supabase.from('families').delete().eq('id', family.id);
      return new Response(
        JSON.stringify({ error: 'Failed to add founder', details: memberError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🏠 Family "${name}" created by ${founderNickname}`);

    return new Response(
      JSON.stringify({
        success: true,
        family,
        member,
        message: `${displayName || 'Family'} "${name}" created successfully!`,
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
