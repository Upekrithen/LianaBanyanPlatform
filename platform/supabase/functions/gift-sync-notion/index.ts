/**
 * GIFT-SYNC-NOTION — Sync gift list with a Notion database
 * =========================================================
 * Imports items from a Notion database into a gift list.
 * Supports bidirectional sync - claims can be written back to Notion.
 * 
 * POST body:
 *   - listId: UUID (the gift list to sync)
 *   - notionDatabaseId: string (Notion database ID)
 *   - direction: string ('import', 'export', 'both')
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface NotionPage {
  id: string;
  properties: {
    Name?: { title: Array<{ plain_text: string }> };
    Title?: { title: Array<{ plain_text: string }> };
    Description?: { rich_text: Array<{ plain_text: string }> };
    URL?: { url: string };
    Link?: { url: string };
    Price?: { number: number };
    Priority?: { select: { name: string } };
    Claimed?: { checkbox: boolean };
  };
}

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

    const notionApiKey = Deno.env.get('NOTION_API_KEY');
    if (!notionApiKey) {
      return new Response(
        JSON.stringify({ error: 'Notion integration not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
    const { listId, notionDatabaseId, direction } = body;

    if (!listId || !notionDatabaseId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: listId, notionDatabaseId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the gift list and verify ownership
    const { data: giftList, error: listError } = await supabase
      .from('family_gift_lists')
      .select('*, family_members!inner(user_id)')
      .eq('id', listId)
      .single();

    if (listError || !giftList) {
      return new Response(
        JSON.stringify({ error: 'Gift list not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is the owner
    if (giftList.family_members?.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Only the list owner can sync with Notion' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let importedCount = 0;
    let exportedCount = 0;

    // IMPORT: Fetch from Notion
    if (direction === 'import' || direction === 'both') {
      try {
        const notionResponse = await fetch(
          `https://api.notion.com/v1/databases/${notionDatabaseId}/query`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${notionApiKey}`,
              'Notion-Version': '2022-06-28',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ page_size: 100 }),
          }
        );

        if (!notionResponse.ok) {
          const error = await notionResponse.text();
          console.error('Notion API error:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch from Notion', details: error }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const notionData = await notionResponse.json();
        const pages: NotionPage[] = notionData.results || [];

        for (const page of pages) {
          // Extract item data from Notion properties
          const name = page.properties.Name?.title?.[0]?.plain_text ||
                       page.properties.Title?.title?.[0]?.plain_text ||
                       'Unnamed Item';
          
          const description = page.properties.Description?.rich_text?.[0]?.plain_text || null;
          const url = page.properties.URL?.url || page.properties.Link?.url || null;
          const price = page.properties.Price?.number || null;
          const priorityName = page.properties.Priority?.select?.name || 'Medium';
          const priority = priorityName === 'High' ? 1 : priorityName === 'Low' ? 3 : 2;

          // Check if item already exists (by notion_block_id)
          const { data: existingItem } = await supabase
            .from('gift_list_items')
            .select('id')
            .eq('list_id', listId)
            .eq('notion_block_id', page.id)
            .single();

          if (existingItem) {
            // Update existing item
            await supabase
              .from('gift_list_items')
              .update({
                name,
                description,
                url,
                price_estimate: price,
                priority,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existingItem.id);
          } else {
            // Insert new item
            await supabase
              .from('gift_list_items')
              .insert({
                list_id: listId,
                name,
                description,
                url,
                price_estimate: price,
                priority,
                notion_block_id: page.id,
              });
            importedCount++;
          }
        }
      } catch (notionErr) {
        console.error('Notion sync error:', notionErr);
      }
    }

    // EXPORT: Push claims back to Notion
    if (direction === 'export' || direction === 'both') {
      try {
        // Get all claimed items with notion_block_id
        const { data: claimedItems } = await supabase
          .from('gift_list_items')
          .select('notion_block_id, claimed_by, purchased')
          .eq('list_id', listId)
          .not('notion_block_id', 'is', null)
          .not('claimed_by', 'is', null);

        for (const item of claimedItems || []) {
          if (item.notion_block_id) {
            try {
              await fetch(
                `https://api.notion.com/v1/pages/${item.notion_block_id}`,
                {
                  method: 'PATCH',
                  headers: {
                    'Authorization': `Bearer ${notionApiKey}`,
                    'Notion-Version': '2022-06-28',
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    properties: {
                      Claimed: { checkbox: true },
                    },
                  }),
                }
              );
              exportedCount++;
            } catch (updateErr) {
              console.error('Error updating Notion page:', updateErr);
            }
          }
        }
      } catch (exportErr) {
        console.error('Export error:', exportErr);
      }
    }

    // Update last synced timestamp
    await supabase
      .from('family_gift_lists')
      .update({
        notion_database_id: notionDatabaseId,
        last_synced_at: new Date().toISOString(),
      })
      .eq('id', listId);

    console.log(`📚 Notion sync: ${importedCount} imported, ${exportedCount} exported`);

    return new Response(
      JSON.stringify({
        success: true,
        imported: importedCount,
        exported: exportedCount,
        message: `Synced with Notion: ${importedCount} items imported, ${exportedCount} claims exported.`,
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
