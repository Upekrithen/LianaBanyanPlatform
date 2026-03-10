/**
 * FAMILY DETAIL PAGE
 * ==================
 * Shows a single family with members, invites, calendar, and gift lists.
 */

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import {
  Users, ArrowLeft, Calendar, Gift, UserPlus, Settings,
  Heart, Link2, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FamilyMemberCard } from "@/components/family/FamilyMemberCard";
import { FamilyInviteVoting } from "@/components/family/FamilyInviteVoting";
import { InviteMemberDialog } from "@/components/family/InviteMemberDialog";
import '@/styles/landing.css';

export default function FamilyDetailPage() {
  const navigate = useNavigate();
  const { familyId } = useParams<{ familyId: string }>();
  const { user, session } = useAuth();
  const { openOnboard } = useSeamlessOnboard();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("members");

  // Fetch family details
  const { data: family, isLoading: familyLoading } = useQuery({
    queryKey: ['family', familyId],
    queryFn: async () => {
      if (!familyId) return null;
      const { data, error } = await supabase
        .from('families')
        .select('*')
        .eq('id', familyId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!familyId && !!user,
  });

  // Fetch family members with relationships
  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['family-members', familyId],
    queryFn: async () => {
      if (!familyId || !user) return [];

      // Get all members
      const { data: memberData, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('family_id', familyId)
        .eq('is_active', true)
        .order('role', { ascending: true }) // founders first
        .order('joined_at', { ascending: true });

      if (error) throw error;

      // Get current user's member ID
      const currentMember = memberData?.find(m => m.user_id === user.id);
      
      // Get relationship statuses if we have a current member
      let relationshipMap: Record<string, boolean> = {};
      if (currentMember) {
        const { data: relationships } = await supabase
          .from('member_relationships')
          .select('to_member, is_connected')
          .eq('from_member', currentMember.id);

        relationships?.forEach(r => {
          relationshipMap[r.to_member] = r.is_connected;
        });
      }

      return {
        members: memberData || [],
        currentMember,
        relationships: relationshipMap,
      };
    },
    enabled: !!familyId && !!user,
  });

  // Fetch pending invites
  const { data: invites } = useQuery({
    queryKey: ['family-invites', familyId],
    queryFn: async () => {
      if (!familyId || !user) return [];

      const { data, error } = await supabase
        .from('family_invites')
        .select(`
          *,
          family_invite_votes (
            voter_id,
            vote
          )
        `)
        .eq('family_id', familyId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Add inviter info and current user's vote
      const invitesWithDetails = await Promise.all(
        (data || []).map(async (invite) => {
          // Get inviter member info
          const { data: inviterMember } = await supabase
            .from('family_members')
            .select('nickname, symbol')
            .eq('user_id', invite.invited_by)
            .eq('family_id', familyId)
            .single();

          // Check if current user has voted
          const myVote = invite.family_invite_votes?.find(
            (v: any) => v.voter_id === user.id
          )?.vote;

          return {
            ...invite,
            inviter: inviterMember,
            myVote,
          };
        })
      );

      return invitesWithDetails;
    },
    enabled: !!familyId && !!user,
  });

  const isLoading = familyLoading || membersLoading;
  const currentMember = members?.currentMember;
  const memberList = members?.members || [];
  const relationships = members?.relationships || {};

  if (!user) {
    return (
      <div className="landing-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center">
          <p style={{ marginBottom: '1rem' }}>Please sign in to view this family</p>
          <Button onClick={() => openOnboard({ reason: "view family details", actionLabel: "Join", membershipIncluded: true })}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="landing-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-pulse">Loading family...</div>
      </div>
    );
  }

  if (!family || !currentMember) {
    return (
      <div className="landing-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center">
          <p style={{ marginBottom: '1rem' }}>Family not found or you're not a member</p>
          <Button onClick={() => navigate('/family')}>Back to Families</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page" style={{ minHeight: '100vh' }}>
      {/* Brand Title */}
      <div className="landing-title">
        <span className="liana">Liana</span>
        <span className="banyan">Banyan</span>
      </div>

      {/* Back button */}
      <button 
        onClick={() => navigate('/family')}
        className="ghost-toggle"
        style={{ left: 20 }}
      >
        <ArrowLeft className="inline h-4 w-4 mr-1" />
        All Families
      </button>

      <div className="container" style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
        {/* Header */}
        <header className="landing-header" style={{ marginTop: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
            {currentMember.symbol || '👨‍👩‍👧‍👦'}
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {family.name}
          </h1>
          <p style={{ opacity: 0.8 }}>
            {memberList.length} {memberList.length === 1 ? 'member' : 'members'} · {family.display_name}
          </p>
        </header>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full grid-cols-3 bg-white/5">
            <TabsTrigger value="members" className="data-[state=active]:bg-purple-500/20">
              <Users className="h-4 w-4 mr-2" />
              Members
            </TabsTrigger>
            <TabsTrigger value="gifts" className="data-[state=active]:bg-purple-500/20">
              <Gift className="h-4 w-4 mr-2" />
              Gift Lists
            </TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-purple-500/20">
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </TabsTrigger>
          </TabsList>

          {/* MEMBERS TAB */}
          <TabsContent value="members" className="mt-6 space-y-6">
            {/* Pending Invites */}
            {invites && invites.length > 0 && (
              <div className="trunk-info">
                <FamilyInviteVoting
                  invites={invites}
                  familyId={familyId!}
                  familyDisplayName={family.display_name}
                />
              </div>
            )}

            {/* Members List */}
            <div className="trunk-info">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Heart className="h-5 w-5 text-purple-400" />
                  {family.display_name} Members
                </h2>
                <Button
                  onClick={() => setShowInviteDialog(true)}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Invite
                </Button>
              </div>

              <div className="space-y-3">
                {memberList.map((member) => (
                  <FamilyMemberCard
                    key={member.id}
                    member={member}
                    familyId={familyId!}
                    currentMemberId={currentMember.id}
                    isConnected={
                      member.id === currentMember.id 
                        ? true 
                        : relationships[member.id] !== false
                    }
                    showConnectionToggle={member.id !== currentMember.id}
                  />
                ))}
              </div>

              {/* Connection Info */}
              <div className="mt-4 p-3 rounded-lg bg-white/5 text-sm text-muted-foreground">
                <Link2 className="h-4 w-4 inline mr-2" />
                <strong>Connections:</strong> You can disconnect from individual members to stop 
                sharing content with them, without leaving the {family.display_name.toLowerCase()}.
              </div>
            </div>
          </TabsContent>

          {/* GIFT LISTS TAB */}
          <TabsContent value="gifts" className="mt-6">
            <div className="trunk-info text-center py-8">
              <Gift className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <h3 className="font-semibold mb-2">Gift Lists Coming Soon</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Create wishlists for birthdays and holidays. Family members can claim items — 
                but the recipient won't see who claimed what!
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate(`/family/${familyId}/gifts`)}
              >
                <Gift className="h-4 w-4 mr-2" />
                Go to Gift Lists
              </Button>
            </div>
          </TabsContent>

          {/* CALENDAR TAB */}
          <TabsContent value="calendar" className="mt-6">
            <div className="trunk-info text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <h3 className="font-semibold mb-2">Family Calendar</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Shared calendar with birthdays, holidays, and events. 
                Sync with Google Calendar for seamless integration.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate(`/family/${familyId}/calendar`)}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Go to Calendar
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Links */}
        <div className="trunk-info mt-6">
          <h3 className="font-semibold mb-3 text-center text-muted-foreground">Quick Actions</h3>
          <div className="flex justify-center gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={() => navigate('/initiatives/family-table')}
            >
              Meal Planning
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/initiatives/lets-go-shopping')}
            >
              Shopping
            </Button>
          </div>
        </div>

        {/* Footer */}
        <footer className="landing-footer">
          <p>© 2026 Liana Banyan Corporation</p>
        </footer>
      </div>

      {/* Invite Member Dialog */}
      <InviteMemberDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        familyId={familyId!}
        familyName={family.name}
        familyDisplayName={family.display_name}
        memberCount={memberList.length}
      />
    </div>
  );
}
