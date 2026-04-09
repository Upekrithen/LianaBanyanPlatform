import { supabase } from '@/integrations/supabase/client';

/**
 * ONE LEVEL ONLY attribution chain for Cue Card shares.
 * If Person A sends to Person B, and B sends to C — A gets NOTHING from C.
 * Marks awards: signup +5, project_created +15, project_backed +2
 */

const MARKS_AWARDS: Record<string, number> = {
  signup: 5,
  project_created: 15,
  project_backed: 2,
};

export async function recordCueCardAttribution(
  userId: string,
  actionType: 'signup' | 'project_created' | 'project_backed'
) {
  const shortCode = sessionStorage.getItem('cue_card_source');
  if (!shortCode) return;

  const { data: share } = await supabase
    .from('cue_card_shares' as never)
    .select('id, creator_id')
    .eq('short_code', shortCode)
    .single() as { data: { id: string; creator_id: string } | null };

  if (!share) return;

  // ONE LEVEL: don't award if the user IS the creator
  if (share.creator_id === userId) return;

  const marks = MARKS_AWARDS[actionType] || 0;

  // Insert attribution (unique constraint prevents duplicates)
  await supabase
    .from('cue_card_attribution' as never)
    .insert({
      share_id: share.id,
      referred_user_id: userId,
      action_type: actionType,
      marks_awarded: marks,
    } as never);

  // Increment the counter on the share record
  const counterField = actionType === 'signup' ? 'signups' : 'projects_created';
  if (actionType !== 'project_backed') {
    const { data: current } = await supabase
      .from('cue_card_shares' as never)
      .select(counterField)
      .eq('id', share.id)
      .single() as { data: Record<string, number> | null };

    if (current) {
      await supabase
        .from('cue_card_shares' as never)
        .update({ [counterField]: (current[counterField] || 0) + 1 } as never)
        .eq('id', share.id);
    }
  }

  // Award Marks to the creator via shadow_marks_ledger
  if (marks > 0) {
    await supabase
      .from('shadow_marks_ledger' as never)
      .insert({
        user_id: share.creator_id,
        amount: marks,
        reason: `cue_card_${actionType}`,
        source_type: 'cue_card',
        source_id: share.id,
      } as never);
  }

  // Clear source after signup to prevent double-attribution
  if (actionType === 'signup') {
    // Keep it for project_created / project_backed attribution within this session
  }
}

export function clearCueCardSource() {
  sessionStorage.removeItem('cue_card_source');
}
