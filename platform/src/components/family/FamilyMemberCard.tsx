/**
 * FAMILY MEMBER CARD
 * ==================
 * Displays a family member with their symbol, nickname, and connection toggle.
 * Used in family detail pages for member management.
 */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { UserCircle, Link2, LinkIcon, Shield, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

interface FamilyMemberCardProps {
  member: {
    id: string;
    user_id: string | null;
    nickname: string;
    symbol: string;
    role: string;
    joined_at: string | null;
    is_active: boolean;
    email?: string;
  };
  familyId: string;
  currentMemberId: string;
  isConnected?: boolean;
  showConnectionToggle?: boolean;
}

export function FamilyMemberCard({
  member,
  familyId,
  currentMemberId,
  isConnected = true,
  showConnectionToggle = true,
}: FamilyMemberCardProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);

  const isSelf = member.id === currentMemberId;
  const isPending = !member.joined_at;

  const toggleConnection = useMutation({
    mutationFn: async (connected: boolean) => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/family-toggle-connection`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            familyId,
            targetMemberId: member.id,
            connected,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update connection');
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['family-members', familyId] });
      toast.success(data.message);
      setShowDisconnectDialog(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleToggle = () => {
    if (isConnected) {
      setShowDisconnectDialog(true);
    } else {
      toggleConnection.mutate(true);
    }
  };

  return (
    <>
      <div
        className={`
          relative rounded-xl p-4 transition-all
          ${isSelf
            ? 'bg-purple-500/10 border border-purple-500/30'
            : isConnected
              ? 'bg-white/5 border border-white/10 hover:border-white/20'
              : 'bg-red-500/5 border border-red-500/20 opacity-60'
          }
        `}
      >
        {/* Role Badge */}
        {member.role === 'founder' && (
          <div className="absolute top-2 right-2">
            <Tooltip>
              <TooltipTrigger>
                <Crown className="h-4 w-4 text-amber-400" />
              </TooltipTrigger>
              <TooltipContent>Founder</TooltipContent>
            </Tooltip>
          </div>
        )}

        <div className="flex items-center gap-4">
          {/* Symbol Avatar */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center text-2xl">
            {member.symbol || '👤'}
          </div>

          {/* Member Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">
                {member.nickname}
                {isSelf && <span className="text-xs text-muted-foreground ml-1">(you)</span>}
              </h3>
            </div>

            {isPending ? (
              <Badge variant="outline" className="mt-1 text-xs bg-amber-500/10 text-amber-400 border-amber-500/30">
                Pending Invite
              </Badge>
            ) : member.joined_at && (
              <p className="text-xs text-muted-foreground mt-1">
                Joined {new Date(member.joined_at).toLocaleDateString()}
              </p>
            )}

            {!isConnected && !isSelf && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <LinkIcon className="h-3 w-3" />
                Disconnected
              </p>
            )}
          </div>

          {/* Connection Toggle */}
          {showConnectionToggle && !isSelf && !isPending && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isConnected ? "ghost" : "outline"}
                  size="sm"
                  onClick={handleToggle}
                  disabled={toggleConnection.isPending}
                  className={isConnected ? "" : "border-emerald-500/50 text-emerald-400"}
                >
                  {isConnected ? (
                    <Link2 className="h-4 w-4" />
                  ) : (
                    <LinkIcon className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isConnected ? 'Disconnect (stop sharing with this member)' : 'Reconnect'}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Disconnect Confirmation Dialog */}
      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect from {member.nickname}?</AlertDialogTitle>
            <AlertDialogDescription>
              You will no longer share content with {member.nickname} and they won't see your shared content.
              This doesn't remove them from the family - just your individual connection.
              <br /><br />
              You can reconnect at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => toggleConnection.mutate(false)}
              className="bg-red-600 hover:bg-red-700"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
