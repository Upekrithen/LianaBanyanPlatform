/**
 * GIFT-LIST-CREATE — Create a new gift wishlist
 * ==============================================
 * Creates a gift list for a family member. The owner can add items,
 * but cannot see who claims them.
 *
 * POST body:
 *   - familyId: UUID
 *   - title: string (e.g., "My Birthday 2026 Wishlist")
 *   - description: string (optional)
 *   - occasion: string ('birthday', 'holiday', 'anniversary', 'general', 'other')
 *   - occasionDate: string (ISO date - when gifts needed by)
 *   - visibility: string ('family' or 'specific_members')
 *   - notionSyncUrl: string (optional Notion database URL)
 *   - items: array (optional initial items)
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
    const { familyId, title, description, occasion, occasionDate, visibility, notionSyncUrl, items } = body;

    if (!familyId || !title) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: familyId, title' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the user's member record in this family
    const { data: member, error: memberError } = await supabase
      .from('family_members')
      .select('*')
      .eq('family_id', familyId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (memberError || !member) {
      return new Response(
        JSON.stringify({ error: 'You are not a member of this family' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create the gift list
    const { data: giftList, error: listError } = await supabase
      .from('family_gift_lists')
      .insert({
        family_id: familyId,
        owner_id: member.id,
        title,
        description,
        occasion: occasion || 'general',
        occasion_date: occasionDate || null,
        visibility: visibility || 'family',
        notion_sync_url: notionSyncUrl || null,
      })
      .select()
      .single();

    if (listError) {
      console.error('Error creating gift list:', listError);
      return new Response(
        JSON.stringify({ error: 'Failed to create gift list', details: listError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Add initial items if provided
    let createdItems: any[] = [];
    if (items && Array.isArray(items) && items.length > 0) {
      const itemsToInsert = items.map((item: any) => ({
        list_id: giftList.id,
        name: item.name,
        description: item.description || null,
        url: item.url || null,
        image_url: item.imageUrl || null,
        price_estimate: item.priceEstimate || null,
        priority: item.priority || 2,
        quantity_wanted: item.quantity || 1,
      }));

      const { data: insertedItems, error: itemsError } = await supabase
        .from('gift_list_items')
        .insert(itemsToInsert)
        .select();

      if (itemsError) {
        console.error('Error adding items:', itemsError);
      } else {
        createdItems = insertedItems || [];
      }
    }

    // If there's an occasion date, create a calendar event
    if (occasionDate) {
      try {
        await supabase.rpc('create_gift_occasion_event', { p_gift_list_id: giftList.id });
      } catch (calErr) {
        console.error('Error creating calendar event:', calErr);
      }
    }

    // Grant access to all family members (for 'family' visibility)
    if (visibility === 'family' || !visibility) {
      const { data: allMembers } = await supabase
        .from('family_members')
        .select('id')
        .eq('family_id', familyId)
        .eq('is_active', true)
        .neq('id', member.id); // Exclude owner

      if (allMembers && allMembers.length > 0) {
        const accessRecords = allMembers.map((m: any) => ({
          list_id: giftList.id,
          member_id: m.id,
          can_view: true,
          can_claim: true,
          granted_by: member.id,
        }));

        await supabase.from('gift_list_access').insert(accessRecords);
      }
    }

    console.log(`🎁 ${member.nickname} created gift list: "${title}"`);

    return new Response(
      JSON.stringify({
        success: true,
        giftList,
        items: createdItems,
        message: `Gift list "${title}" created successfully!`,
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
