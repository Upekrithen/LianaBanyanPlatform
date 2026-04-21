/**
 * FAMILY-INVITE — Invite a new member to the family
 * ==================================================
 * Creates an invitation that requires unanimous approval from all current members.
 * Sends notification email to existing members to vote.
 *
 * POST body:
 *   - familyId: UUID
 *   - inviteeEmail: string
 *   - inviteeName: string
 *   - message: string (optional - why you're inviting them)
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
    const { familyId, inviteeEmail, inviteeName, message } = body;

    if (!familyId || !inviteeEmail || !inviteeName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: familyId, inviteeEmail, inviteeName' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if inviter is a member of this family
    const { data: inviterMember, error: inviterError } = await supabase
      .from('family_members')
      .select('*')
      .eq('family_id', familyId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (inviterError || !inviterMember) {
      return new Response(
        JSON.stringify({ error: 'You are not a member of this family' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if invitee is already a member
    const { data: existingMember } = await supabase
      .from('family_members')
      .select('id')
      .eq('family_id', familyId)
      .eq('email', inviteeEmail.toLowerCase())
      .single();

    if (existingMember) {
      return new Response(
        JSON.stringify({ error: 'This person is already a member of the family' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for pending invite
    const { data: pendingInvite } = await supabase
      .from('family_invites')
      .select('id')
      .eq('family_id', familyId)
      .eq('invitee_email', inviteeEmail.toLowerCase())
      .eq('status', 'pending')
      .single();

    if (pendingInvite) {
      return new Response(
        JSON.stringify({ error: 'There is already a pending invite for this person' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Count active members (votes needed for unanimous approval)
    const { count: memberCount } = await supabase
      .from('family_members')
      .select('*', { count: 'exact', head: true })
      .eq('family_id', familyId)
      .eq('is_active', true);

    const votesNeeded = memberCount || 1;

    // Create the invite
    const { data: invite, error: inviteError } = await supabase
      .from('family_invites')
      .insert({
        family_id: familyId,
        invitee_email: inviteeEmail.toLowerCase(),
        invitee_name: inviteeName,
        invited_by: user.id,
        message,
        votes_needed: votesNeeded,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      })
      .select()
      .single();

    if (inviteError) {
      console.error('Error creating invite:', inviteError);
      return new Response(
        JSON.stringify({ error: 'Failed to create invite', details: inviteError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Auto-approve from inviter
    const { error: voteError } = await supabase
      .from('family_invite_votes')
      .insert({
        invite_id: invite.id,
        voter_id: user.id,
        vote: true,
      });

    if (voteError) {
      console.error('Error auto-approving:', voteError);
    }

    // Get family details for notification
    const { data: family } = await supabase
      .from('families')
      .select('name, display_name')
      .eq('id', familyId)
      .single();

    // Send email notifications to other members (using Resend)
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (resendKey) {
      const { data: otherMembers } = await supabase
        .from('family_members')
        .select('user_id, nickname')
        .eq('family_id', familyId)
        .eq('is_active', true)
        .neq('user_id', user.id);

      // Get emails for other members
      if (otherMembers && otherMembers.length > 0) {
        for (const member of otherMembers) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', member.user_id)
            .single();

          if (profile?.email) {
            try {
              await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${resendKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  from: 'Family Table <noreply@lianabanyan.com>',
                  to: [profile.email],
                  subject: `${inviterMember.nickname} wants to add ${inviteeName} to ${family?.name || 'the family'}`,
                  html: `
                    <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px;">
                      <h2>New Family Member Nomination</h2>
                      <p>${inviterMember.nickname} wants to add <strong>${inviteeName}</strong> to ${family?.name || 'the family'}.</p>
                      ${message ? `<p><em>"${message}"</em></p>` : ''}
                      <p>This requires <strong>unanimous approval</strong> from all family members.</p>
                      <p>Please log in to cast your vote.</p>
                      <p style="margin-top: 2rem; color: #666;">— The Family Table</p>
                    </div>
                  `,
                }),
              });
            } catch (emailErr) {
              console.error('Email error:', emailErr);
            }
          }
        }
      }
    }

    console.log(`📨 ${inviterMember.nickname} invited ${inviteeName} to family ${familyId}`);

    return new Response(
      JSON.stringify({
        success: true,
        invite,
        votesNeeded,
        message: votesNeeded === 1
          ? `${inviteeName} has been added to the family!`
          : `Invitation sent! Waiting for ${votesNeeded - 1} more vote(s) for unanimous approval.`,
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
