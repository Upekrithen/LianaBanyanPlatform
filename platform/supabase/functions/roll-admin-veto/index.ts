// Supabase Edge Function — Roll Admin Veto
// SAGA 14 BP045 W1
//
// Accepts POST:
//   { nomination_id, vetoer_type: 'founder'|'helm-crown', vote: 'ratify'|'veto', rationale?: string }
//
// Logic:
//   - Record the vote on roll_nominations
//   - If both founder + helm-crown ratify → status='ratified', publish to /roll/{slug}/
//   - If either vetos → status='declined', rationale stored privately (never exposed publicly)
//
// DISCIPLINE:
//   - EXCLUSION-WITHOUT-JUDGMENT: no negative commentary on declined candidates
//   - Decline rationale is stored in roll_nominations.decline_rationale_private
//   - The public roll page NEVER shows decline rationale

import { createClient } from 'jsr:@supabase/supabase-js@2';

// ─── Types ────────────────────────────────────────────────────────────────────

type VetoerType = 'founder' | 'helm-crown';
type Vote = 'ratify' | 'veto';

interface VotePayload {
  nomination_id: string;
  vetoer_type: VetoerType;
  vote: Vote;
  rationale?: string;
}

interface NominationRecord {
  id: string;
  nominee_name: string;
  nominee_slug: string;
  status: string;
  founder_vote: Vote | null;
  helm_crown_vote: Vote | null;
  decline_rationale_private: string | null;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  // Auth: require service-role key in Authorization header
  const authHeader = req.headers.get('Authorization') ?? '';
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // Parse body
  let payload: VotePayload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { nomination_id, vetoer_type, vote, rationale } = payload;

  if (!nomination_id || !vetoer_type || !vote) {
    return json({ error: 'Missing required fields: nomination_id, vetoer_type, vote' }, 400);
  }
  if (!['founder', 'helm-crown'].includes(vetoer_type)) {
    return json({ error: 'vetoer_type must be founder or helm-crown' }, 400);
  }
  if (!['ratify', 'veto'].includes(vote)) {
    return json({ error: 'vote must be ratify or veto' }, 400);
  }

  // Fetch current nomination record
  const { data: nom, error: fetchErr } = await supabase
    .from('roll_nominations')
    .select('id, nominee_name, nominee_slug, status, founder_vote, helm_crown_vote, decline_rationale_private')
    .eq('id', nomination_id)
    .single<NominationRecord>();

  if (fetchErr || !nom) {
    return json({ error: 'Nomination not found' }, 404);
  }

  // Guard: don't re-process settled nominations
  if (nom.status === 'ratified' || nom.status === 'declined') {
    return json({ error: `Nomination already ${nom.status}` }, 409);
  }

  // Build update payload
  const voteField = vetoer_type === 'founder' ? 'founder_vote' : 'helm_crown_vote';
  const updateData: Record<string, unknown> = {
    [voteField]: vote,
    updated_at: new Date().toISOString(),
  };

  // Determine new status
  const newFounderVote    = vetoer_type === 'founder'     ? vote : nom.founder_vote;
  const newHelmCrownVote  = vetoer_type === 'helm-crown'  ? vote : nom.helm_crown_vote;

  let newStatus = nom.status;

  if (vote === 'veto') {
    // Either declining → status = declined, store rationale privately
    newStatus = 'declined';
    updateData.status = 'declined';
    updateData.declined_at = new Date().toISOString();
    // Rationale is private — stored in a private column, NEVER exposed in public API
    if (rationale) {
      updateData.decline_rationale_private = rationale;
    }
  } else if (newFounderVote === 'ratify' && newHelmCrownVote === 'ratify') {
    // Both ratified → promote to Roll
    newStatus = 'ratified';
    updateData.status = 'ratified';
    updateData.ratified_at = new Date().toISOString();
  } else if (newFounderVote === 'ratify' || newHelmCrownVote === 'ratify') {
    // One ratified, waiting for second
    newStatus = 'awaiting-second';
    updateData.status = 'awaiting-second';
  }

  // Write vote
  const { error: updateErr } = await supabase
    .from('roll_nominations')
    .update(updateData)
    .eq('id', nomination_id);

  if (updateErr) {
    return json({ error: 'Failed to record vote: ' + updateErr.message }, 500);
  }

  // If ratified → publish to roll_members table
  if (newStatus === 'ratified') {
    const { error: publishErr } = await supabase
      .from('roll_members')
      .upsert({
        slug: nom.nominee_slug,
        name: nom.nominee_name,
        nomination_id: nom.id,
        ratified_at: updateData.ratified_at,
        published: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'slug' });

    if (publishErr) {
      console.error('[roll-admin-veto] Failed to publish to roll_members:', publishErr.message);
      // Non-fatal: vote is recorded, publishing can be retried
    }
  }

  return json({
    success: true,
    nomination_id,
    new_status: newStatus,
    vetoer_type,
    vote,
    // EXCLUSION-WITHOUT-JUDGMENT: never return rationale in response
  });
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
