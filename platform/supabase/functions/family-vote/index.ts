/**
 * FAMILY-VOTE — Cast a vote on a pending family invite
 * =====================================================
 * Votes on whether to approve a new family member.
 * Requires unanimous approval - any rejection rejects the invite.
 * 
 * POST body:
 *   - inviteId: UUID
 *   - vote: boolean (true = approve, false = reject)
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
    const { inviteId, vote } = body;

    if (!inviteId || vote === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: inviteId, vote' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the invite
    const { data: invite, error: inviteError } = await supabase
      .from('family_invites')
      .select('*, families(name, display_name)')
      .eq('id', inviteId)
      .single();

    if (inviteError || !invite) {
      return new Response(
        JSON.stringify({ error: 'Invite not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (invite.status !== 'pending') {
      return new Response(
        JSON.stringify({ error: `Invite has already been ${invite.status}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
      await supabase
        .from('family_invites')
        .update({ status: 'expired', resolved_at: new Date().toISOString() })
        .eq('id', inviteId);
      
      return new Response(
        JSON.stringify({ error: 'Invite has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if voter is a member of this family
    const { data: voterMember, error: voterError } = await supabase
      .from('family_members')
      .select('*')
      .eq('family_id', invite.family_id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (voterError || !voterMember) {
      return new Response(
        JSON.stringify({ error: 'You are not a member of this family' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already voted
    const { data: existingVote } = await supabase
      .from('family_invite_votes')
      .select('id')
      .eq('invite_id', inviteId)
      .eq('voter_id', user.id)
      .single();

    if (existingVote) {
      return new Response(
        JSON.stringify({ error: 'You have already voted on this invite' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cast the vote (trigger will handle approval/rejection logic)
    const { error: voteError } = await supabase
      .from('family_invite_votes')
      .insert({
        invite_id: inviteId,
        voter_id: user.id,
        vote: vote,
      });

    if (voteError) {
      console.error('Error casting vote:', voteError);
      return new Response(
        JSON.stringify({ error: 'Failed to cast vote', details: voteError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get updated invite status
    const { data: updatedInvite } = await supabase
      .from('family_invites')
      .select('status, votes_received, votes_needed')
      .eq('id', inviteId)
      .single();

    // If approved, create the member record
    if (updatedInvite?.status === 'approved') {
      // Check if invitee already has an account
      const { data: inviteeProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', invite.invitee_email)
        .single();

      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: invite.family_id,
          user_id: inviteeProfile?.id || null,
          email: invite.invitee_email,
          nickname: invite.invitee_name,
          symbol: '👤',
          role: 'member',
          invited_by: invite.invited_by,
          joined_at: inviteeProfile?.id ? new Date().toISOString() : null,
        });

      if (memberError) {
        console.error('Error creating member:', memberError);
      }

      // Send welcome email to invitee
      const resendKey = Deno.env.get('RESEND_API_KEY');
      if (resendKey) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Family Table <noreply@lianabanyan.com>',
              to: [invite.invitee_email],
              subject: `Welcome to ${invite.families?.name || 'the family'}!`,
              html: `
                <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px;">
                  <h2>🎉 You're In!</h2>
                  <p>The ${invite.families?.display_name || 'family'} has unanimously approved you as a member of <strong>${invite.families?.name || 'the family'}</strong>!</p>
                  <p>Log in to the Family Table to:</p>
                  <ul>
                    <li>See shared calendars and events</li>
                    <li>Create and share gift wishlists</li>
                    <li>Coordinate meals and shopping</li>
                    <li>Stay connected with your family</li>
                  </ul>
                  <p style="margin-top: 2rem;">Welcome to the family!</p>
                </div>
              `,
            }),
          });
        } catch (emailErr) {
          console.error('Email error:', emailErr);
        }
      }
    }

    console.log(`🗳️ ${voterMember.nickname} voted ${vote ? 'YES' : 'NO'} on invite for ${invite.invitee_name}`);

    return new Response(
      JSON.stringify({
        success: true,
        vote: vote,
        inviteStatus: updatedInvite?.status,
        votesReceived: updatedInvite?.votes_received,
        votesNeeded: updatedInvite?.votes_needed,
        message: vote
          ? (updatedInvite?.status === 'approved' 
              ? `${invite.invitee_name} has been approved and added to the family!`
              : `Vote recorded. ${updatedInvite?.votes_needed - (updatedInvite?.votes_received || 0)} more vote(s) needed.`)
          : `You rejected the invite. ${invite.invitee_name} will not be added.`,
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
