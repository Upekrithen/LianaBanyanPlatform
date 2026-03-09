/**
 * INVITE MEMBER DIALOG
 * ====================
 * Dialog for inviting a new member to a family.
 * Creates an invitation that requires unanimous approval.
 */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus, Mail, MessageSquare, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  familyId: string;
  familyName: string;
  familyDisplayName: string;
  memberCount: number;
}

export function InviteMemberDialog({
  open,
  onOpenChange,
  familyId,
  familyName,
  familyDisplayName,
  memberCount,
}: InviteMemberDialogProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const [inviteeEmail, setInviteeEmail] = useState("");
  const [inviteeName, setInviteeName] = useState("");
  const [message, setMessage] = useState("");

  const inviteMember = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/family-invite`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            familyId,
            inviteeEmail,
            inviteeName,
            message: message || undefined,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send invitation');
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['family-invites', familyId] });
      toast.success(data.message);
      onOpenChange(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setInviteeEmail("");
    setInviteeName("");
    setMessage("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteeEmail.trim() || !inviteeName.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    inviteMember.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite to {familyName}
          </DialogTitle>
          <DialogDescription>
            Invite someone to join your {familyDisplayName.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Unanimous Approval Notice */}
          {memberCount > 1 && (
            <Alert className="bg-amber-500/10 border-amber-500/30">
              <Info className="h-4 w-4 text-amber-400" />
              <AlertDescription className="text-sm text-amber-200">
                This invitation requires <strong>unanimous approval</strong> from all {memberCount} current members.
                {' '}Everyone will be notified to vote.
              </AlertDescription>
            </Alert>
          )}

          {/* Invitee Name */}
          <div className="space-y-2">
            <Label htmlFor="inviteeName">
              Their Name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="inviteeName"
              placeholder="What do you call them?"
              value={inviteeName}
              onChange={(e) => setInviteeName(e.target.value)}
              required
            />
          </div>

          {/* Invitee Email */}
          <div className="space-y-2">
            <Label htmlFor="inviteeEmail">
              <Mail className="h-4 w-4 inline mr-1" />
              Their Email <span className="text-red-400">*</span>
            </Label>
            <Input
              id="inviteeEmail"
              type="email"
              placeholder="email@example.com"
              value={inviteeEmail}
              onChange={(e) => setInviteeEmail(e.target.value)}
              required
            />
          </div>

          {/* Optional Message */}
          <div className="space-y-2">
            <Label htmlFor="message">
              <MessageSquare className="h-4 w-4 inline mr-1" />
              Message to {familyDisplayName} (optional)
            </Label>
            <Textarea
              id="message"
              placeholder={`Tell other ${familyDisplayName.toLowerCase()} members why you're inviting them...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This message will be shown to other members when they vote on the invitation
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={inviteMember.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {inviteMember.isPending ? (
                <>Sending...</>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
