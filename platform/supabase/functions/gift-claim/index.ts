/**
 * GIFT-CLAIM — Claim, unclaim, or mark as purchased a gift item
 * ==============================================================
 * Allows family members to claim items from other members' wishlists.
 * Claims are hidden from the list owner!
 *
 * POST body:
 *   - itemId: UUID
 *   - action: string ('claim', 'unclaim', 'purchase')
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
    const { itemId, action } = body;

    if (!itemId || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: itemId, action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['claim', 'unclaim', 'purchase'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Must be: claim, unclaim, or purchase' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the item and its list
    const { data: item, error: itemError } = await supabase
      .from('gift_list_items')
      .select('*, family_gift_lists(family_id, owner_id)')
      .eq('id', itemId)
      .single();

    if (itemError || !item) {
      return new Response(
        JSON.stringify({ error: 'Item not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const familyId = item.family_gift_lists?.family_id;
    const ownerId = item.family_gift_lists?.owner_id;

    // Get the user's member record
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

    // Cannot claim your own items
    if (member.id === ownerId) {
      return new Response(
        JSON.stringify({ error: 'You cannot claim items from your own wishlist' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result: any;

    switch (action) {
      case 'claim':
        result = await supabase.rpc('claim_gift_item', {
          p_item_id: itemId,
          p_member_id: member.id,
        });
        break;

      case 'unclaim':
        result = await supabase.rpc('unclaim_gift_item', {
          p_item_id: itemId,
          p_member_id: member.id,
        });
        break;

      case 'purchase':
        result = await supabase.rpc('mark_gift_purchased', {
          p_item_id: itemId,
          p_member_id: member.id,
        });
        break;
    }

    if (result.error) {
      console.error('RPC error:', result.error);
      return new Response(
        JSON.stringify({ error: 'Operation failed', details: result.error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rpcResult = result.data;

    if (!rpcResult?.success) {
      return new Response(
        JSON.stringify({ error: rpcResult?.error || 'Operation failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🎁 ${member.nickname} ${action}ed item: ${item.name}`);

    return new Response(
      JSON.stringify({
        success: true,
        action,
        itemId,
        itemName: item.name,
        message: rpcResult.message,
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
