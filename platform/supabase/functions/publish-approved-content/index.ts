/**
 * PUBLISH-APPROVED-CONTENT — Staff approval → Cephas publication
 * Called when Staff clicks "Approve & Publish" on LibrarianDashboardPage.
 * Reads approved helm_content_queue row, upserts into cephas_content_registry.
 *
 * Auth: Service role key (invoked from platform client)
 * Input: { helm_queue_id: string }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TYPE_TO_CATEGORY: Record<string, string> = {
  cephas_article: 'article',
  pudding_essay: 'article',
  academic_paper: 'academic_paper',
  press_material: 'article',
  media_post: 'article',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { helm_queue_id } = await req.json();
    if (!helm_queue_id) {
      return new Response(JSON.stringify({ error: 'helm_queue_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: queueItem, error: fetchErr } = await supabase
      .from('helm_content_queue')
      .select('*')
      .eq('id', helm_queue_id)
      .single();

    if (fetchErr || !queueItem) {
      return new Response(JSON.stringify({ error: 'Queue item not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const letterTypes = ['crown_letter', 'outreach_letter', 'partnership_letter', 'political_letter'];
    if (letterTypes.includes(queueItem.content_type)) {
      await supabase
        .from('helm_content_queue')
        .update({ status: 'ready_to_send' })
        .eq('id', helm_queue_id);

      return new Response(
        JSON.stringify({ success: true, action: 'marked_ready_to_send' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const corpsSource = queueItem.corps_source || {};
    let cephasCategory = TYPE_TO_CATEGORY[queueItem.content_type] || 'article';
    if (corpsSource.entry_type === 'fly_on_the_wall') cephasCategory = 'fly_on_the_wall';
    if (corpsSource.entry_type === 'under_the_hood') cephasCategory = 'under_the_hood';

    const { error: cephasErr } = await supabase
      .from('cephas_content_registry')
      .upsert({
        slug: queueItem.slug,
        title: queueItem.title,
        category: cephasCategory,
        content_markdown: queueItem.content_markdown,
        source_path: corpsSource.source_file || 'auto-ingested',
        style: 'clean_academic',
        creation_context: queueItem.creation_context,
        bishop_session: queueItem.bishop_session || corpsSource.session_id,
        knight_session: queueItem.knight_session,
        decision_log: queueItem.decision_log,
        technical_summary: queueItem.technical_summary,
        implementation_status: queueItem.implementation_status || 'planned',
      }, { onConflict: 'slug' });

    if (cephasErr) throw cephasErr;

    await supabase
      .from('helm_content_queue')
      .update({ status: 'published' })
      .eq('id', helm_queue_id);

    await supabase
      .from('content_pipeline')
      .update({ cephas_sync_status: 'synced' })
      .eq('slug', queueItem.slug);

    return new Response(
      JSON.stringify({ success: true, action: 'published_to_cephas', slug: queueItem.slug }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
