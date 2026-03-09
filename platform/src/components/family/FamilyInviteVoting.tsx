/**
 * FAMILY INVITE VOTING
 * ====================
 * Displays pending invites for a family with voting UI.
 * Requires unanimous approval - one rejection rejects the invite.
 */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus, Check, X, Clock, Users, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface FamilyInvite {
  id: string;
  family_id: string;
  invitee_email: string;
  invitee_name: string;
  invited_by: string;
  status: string;
  votes_needed: number;
  votes_received: number;
  message: string | null;
  created_at: string;
  expires_at: string;
  inviter?: {
    nickname: string;
    symbol: string;
  };
  myVote?: boolean | null;
}

interface FamilyInviteVotingProps {
  invites: FamilyInvite[];
  familyId: string;
  familyDisplayName: string;
}

export function FamilyInviteVoting({
  invites,
  familyId,
  familyDisplayName,
}: FamilyInviteVotingProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [rejectDialog, setRejectDialog] = useState<FamilyInvite | null>(null);

  const castVote = useMutation({
    mutationFn: async ({ inviteId, vote }: { inviteId: string; vote: boolean }) => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/family-vote`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inviteId, vote }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to cast vote');
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['family-invites', familyId] });
      queryClient.invalidateQueries({ queryKey: ['family-members', familyId] });
      toast.success(data.message);
      setRejectDialog(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const pendingInvites = invites.filter(i => i.status === 'pending');

  if (pendingInvites.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <UserPlus className="h-5 w-5 text-amber-400" />
        <h3 className="font-semibold">Pending Invitations</h3>
        <Badge variant="outline" className="ml-auto">
          {pendingInvites.length} awaiting votes
        </Badge>
      </div>

      {pendingInvites.map((invite) => {
        const votesRemaining = invite.votes_needed - invite.votes_received;
        const progressPercent = (invite.votes_received / invite.votes_needed) * 100;
        const hasVoted = invite.myVote !== null && invite.myVote !== undefined;
        const isExpired = new Date(invite.expires_at) < new Date();

        return (
          <Card key={invite.id} className="bg-amber-500/5 border-amber-500/20">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {invite.invitee_name}
                    {isExpired && (
                      <Badge variant="destructive" className="text-xs">
                        Expired
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Invited by {invite.inviter?.symbol} {invite.inviter?.nickname || 'a member'}
                    {' · '}
                    {formatDistanceToNow(new Date(invite.created_at), { addSuffix: true })}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Message */}
              {invite.message && (
                <div className="flex items-start gap-2 text-sm bg-white/5 rounded-lg p-3">
                  <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <p className="italic text-muted-foreground">"{invite.message}"</p>
                </div>
              )}

              {/* Voting Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Approval Progress
                  </span>
                  <span className="text-muted-foreground">
                    {invite.votes_received} / {invite.votes_needed} votes
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {votesRemaining} more {votesRemaining === 1 ? 'vote' : 'votes'} needed for unanimous approval
                </p>
              </div>

              {/* Your Vote Status */}
              {hasVoted && (
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400">You voted to approve</span>
                </div>
              )}
            </CardContent>

            <CardFooter className="gap-2">
              {!hasVoted && !isExpired ? (
                <>
                  <Button
                    onClick={() => castVote.mutate({ inviteId: invite.id, vote: true })}
                    disabled={castVote.isPending}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setRejectDialog(invite)}
                    disabled={castVote.isPending}
                    className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </>
              ) : isExpired ? (
                <p className="text-sm text-muted-foreground">
                  This invitation has expired
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Waiting for other {familyDisplayName.toLowerCase()} members to vote...
                </p>
              )}
            </CardFooter>
          </Card>
        );
      })}

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={!!rejectDialog} onOpenChange={() => setRejectDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject {rejectDialog?.invitee_name}?</AlertDialogTitle>
            <AlertDialogDescription>
              If you reject this invitation, {rejectDialog?.invitee_name} will not be added to the {familyDisplayName.toLowerCase()}.
              <br /><br />
              <strong>This is a final decision</strong> — the invitation cannot be reopened. 
              A new invitation would need to be sent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => rejectDialog && castVote.mutate({ inviteId: rejectDialog.id, vote: false })}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject Invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
