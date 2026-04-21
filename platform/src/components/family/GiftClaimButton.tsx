/**
 * GIFT CLAIM BUTTON
 * =================
 * Button for claiming/unclaiming gift items.
 * Shows different states based on claim status.
 * Claims are hidden from the list owner!
 */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Check, Gift, ShoppingBag, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface GiftClaimButtonProps {
  itemId: string;
  itemName: string;
  listId: string;
  claimedByMe: boolean;
  claimedByOther: boolean;
  purchased: boolean;
  onClaimChange?: () => void;
}

export function GiftClaimButton({
  itemId,
  itemName,
  listId,
  claimedByMe,
  claimedByOther,
  purchased,
  onClaimChange,
}: GiftClaimButtonProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

  const claimItem = useMutation({
    mutationFn: async (action: 'claim' | 'unclaim' | 'purchase') => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gift-claim`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ itemId, action }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update claim');
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['gift-list-items', listId] });
      queryClient.invalidateQueries({ queryKey: ['family-gift-lists'] });
      toast.success(data.message);
      setShowPurchaseDialog(false);
      if (onClaimChange) onClaimChange();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Already purchased
  if (purchased) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="bg-blue-500/10 text-blue-400 border-blue-500/30"
      >
        <ShoppingBag className="h-4 w-4 mr-1" />
        Purchased
      </Button>
    );
  }

  // Claimed by someone else
  if (claimedByOther) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="bg-amber-500/10 text-amber-400 border-amber-500/30"
      >
        <Check className="h-4 w-4 mr-1" />
        Someone Claimed
      </Button>
    );
  }

  // I claimed it - show options
  if (claimedByMe) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={claimItem.isPending}
              className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
            >
              {claimItem.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  You Claimed
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setShowPurchaseDialog(true)}
              className="text-blue-400"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Mark as Purchased
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => claimItem.mutate('unclaim')}
              className="text-red-400"
            >
              <X className="h-4 w-4 mr-2" />
              Release Claim
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Purchase Confirmation */}
        <AlertDialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mark as Purchased?</AlertDialogTitle>
              <AlertDialogDescription>
                Confirm that you have purchased "<strong>{itemName}</strong>".
                <br /><br />
                This will let other family members know the item has been bought
                (but the recipient won't see this — it's a secret!).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => claimItem.mutate('purchase')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Yes, I Bought It
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Not claimed - can claim
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => claimItem.mutate('claim')}
      disabled={claimItem.isPending}
      className="hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30"
    >
      {claimItem.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Gift className="h-4 w-4 mr-1" />
          I'll Get This
        </>
      )}
    </Button>
  );
}
