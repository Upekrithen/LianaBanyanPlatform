/**
 * INGEST-CORPS-CONTENT — Pipeline Bridge endpoint
 * Receives batch from SP-10 Pipeline Bridge.
 * Routes entries to content_pipeline, helm_content_queue, or tour_notes_submitted.
 * ALL content enters at draft/seed — nothing auto-publishes.
 *
 * Auth: Service role key (Bearer token from SP-10 Python script)
 * Input: { entries: Array<CorpsEntry> }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CorpsEntry {
  type: string;
  slug: string;
  title: string;
  content_markdown?: string | null;
  content_type: string;
  category: string;
  section_librarian?: number | null;
  session_id: string;
  agent: string;
  source_file_path?: string;
  creation_context?: string;
  bishop_session?: string | null;
  knight_session?: string | null;
  decision_log?: string[];
  technical_summary?: string;
  implementation_status?: string;
  innovation_ids?: string[];
  system_components?: string[];
  timestamp: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { entries } = await req.json() as { entries: CorpsEntry[] };
    if (!entries?.length) {
      return new Response(JSON.stringify({ error: 'entries array required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const entry of entries) {
      try {
        const corpsSource = {
          sp: 'SP-10',
          session_id: entry.session_id,
          agent: entry.agent,
          source_file: entry.source_file_path,
          bridged_at: entry.timestamp,
          entry_type: entry.type,
        };

        if (entry.type === 'fly_on_the_wall' || entry.type === 'under_the_hood') {
          const { error: pipeErr } = await supabase
            .from('content_pipeline')
            .upsert({
              slug: entry.slug,
              title: entry.title,
              seed_content: entry.content_markdown,
              current_stage: 'seed',
              status: 'draft',
              category: entry.category,
              corps_source: corpsSource,
              section_librarian: entry.section_librarian,
            }, { onConflict: 'slug' });
          if (pipeErr) errors.push(`content_pipeline/${entry.slug}: ${pipeErr.message}`);

          const { error: helmErr } = await supabase
            .from('helm_content_queue')
            .upsert({
              slug: entry.slug,
              title: entry.title,
              content_type: entry.content_type,
              content_markdown: entry.content_markdown,
              status: 'draft',
              auto_ingested: true,
              corps_source: corpsSource,
              section_librarian: entry.section_librarian,
              creation_context: entry.creation_context,
              bishop_session: entry.bishop_session,
              knight_session: entry.knight_session,
              decision_log: entry.decision_log,
              technical_summary: entry.technical_summary,
              implementation_status: entry.implementation_status,
            }, { onConflict: 'slug' });
          if (helmErr) errors.push(`helm_content_queue/${entry.slug}: ${helmErr.message}`);
          else inserted++;

        } else if (entry.type === 'classified_content') {
          const { error: pipeErr } = await supabase
            .from('content_pipeline')
            .upsert({
              slug: entry.slug,
              title: entry.title,
              seed_content: entry.content_markdown,
              current_stage: 'seed',
              status: 'draft',
              category: entry.category,
              corps_source: corpsSource,
              section_librarian: entry.section_librarian,
            }, { onConflict: 'slug' });
          if (pipeErr) errors.push(`content_pipeline/${entry.slug}: ${pipeErr.message}`);
          else inserted++;

        } else if (entry.type === 'dropzone_arrival') {
          const { error: helmErr } = await supabase
            .from('helm_content_queue')
            .upsert({
              slug: entry.slug,
              title: entry.title,
              content_type: entry.content_type,
              content_markdown: entry.content_markdown,
              status: 'draft',
              auto_ingested: true,
              corps_source: corpsSource,
              section_librarian: entry.section_librarian,
              creation_context: entry.creation_context,
            }, { onConflict: 'slug' });
          if (helmErr) errors.push(`helm_content_queue/${entry.slug}: ${helmErr.message}`);
          else inserted++;

        } else {
          skipped++;
        }
      } catch (entryErr: unknown) {
        const msg = entryErr instanceof Error ? entryErr.message : String(entryErr);
        errors.push(`${entry.slug}: ${msg}`);
      }
    }

    return new Response(
      JSON.stringify({ inserted, updated, skipped, errors }),
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
