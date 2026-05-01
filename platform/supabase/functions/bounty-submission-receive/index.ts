/**
 * bounty-submission-receive — KN088 / BP009
 * ============================================================
 * Receives a community member's Bounty submission, creates the
 * bounty_submissions row, and immediately invokes the Furnace
 * gear-tooth-fit verification pipeline.
 *
 * Request body:
 *   bounty_slug       string   — canonical slug
 *   bounty_db_id      UUID     — optional; resolved from slug if omitted
 *   submitter_id      UUID
 *   title             string
 *   description       string   — Furnace will score this against requirements
 *   evidence_url      string?
 *   hardware_platform string?
 *
 * Response:
 *   { success, submission_id, status, furnace_score? }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const db = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const {
      bounty_slug,
      bounty_db_id,
      submitter_id,
      title,
      description,
      evidence_url = null,
      hardware_platform = null,
    } = body;

    if (!submitter_id || !title || !description) {
      return new Response(
        JSON.stringify({ success: false, error: 'submitter_id, title, and description required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Resolve bounty_id from slug if not provided
    let resolvedBountyId = bounty_db_id;
    if (!resolvedBountyId && bounty_slug) {
      const { data: bountyRow } = await db
        .from('bounties')
        .select('id, status')
        .eq('slug', bounty_slug)
        .single();
      if (!bountyRow) {
        return new Response(
          JSON.stringify({ success: false, error: `Bounty not found: ${bounty_slug}` }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (bountyRow.status === 'closed' || bountyRow.status === 'awarded') {
        return new Response(
          JSON.stringify({ success: false, error: 'This Bounty is no longer accepting submissions' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      resolvedBountyId = bountyRow.id;
    }

    if (!resolvedBountyId) {
      return new Response(
        JSON.stringify({ success: false, error: 'bounty_slug or bounty_db_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create submission row (status: pending → will be advanced to furnace_verifying)
    const { data: submission, error: insertErr } = await db
      .from('bounty_submissions')
      .insert({
        bounty_id: resolvedBountyId,
        submitter_id,
        title,
        description,
        evidence_url,
        hardware_platform,
        status: 'pending',
      })
      .select('id')
      .single();

    if (insertErr || !submission) {
      console.error('[bounty-submission-receive] insert error:', insertErr);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to record submission' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Advance to furnace_verifying immediately
    await db
      .from('bounty_submissions')
      .update({ status: 'furnace_verifying', updated_at: new Date().toISOString() })
      .eq('id', submission.id);

    // Kick off Furnace verification asynchronously (fire-and-forget via internal invoke)
    // bounty-furnace-verify will update status + furnace_score when complete
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (supabaseAnonKey) {
      fetch(`${supabaseUrl}/functions/v1/bounty-furnace-verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'x-client-info': 'bounty-submission-receive/1.0',
        },
        body: JSON.stringify({
          submission_id: submission.id,
          bounty_slug,
          description,
          evidence_url,
          hardware_platform,
        }),
      }).catch((err) => console.warn('[bounty-submission-receive] furnace invoke warning:', err));
    }

    console.log(`[bounty-submission-receive] Submission ${submission.id} created for bounty ${bounty_slug}`);

    return new Response(
      JSON.stringify({
        success: true,
        submission_id: submission.id,
        status: 'furnace_verifying',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[bounty-submission-receive] error:', err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
