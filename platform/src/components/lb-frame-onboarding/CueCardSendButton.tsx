/**
 * CueCardSendButton — One-button "Send Cue Card + Join + Earn" for LB Frame viral onboarding
 * KN087 / BP009 Crown-Jewel-class viral growth primitive.
 *
 * BRIDLE v11 compliance:
 *   Rule 1: Integrates with EXISTING creator_referrals + six-tier system. Does NOT reinvent.
 *   Rule 2: No fiat cashout ever. Marks/Credits closed-loop economy.
 *   Rule 3: NOT MLM. Sender earns ONLY for direct referrals. No downstream cut.
 *   Rule 4: Anti-farming — rewards vest ONLY when recipient's LB Frame Handshake completes.
 *   Rule 5: License-aware — recipient picks AGPL (community) or Apache (big-guy) door.
 *   Rule 6: Kallistra framing — "make more WITH us, not instead of you."
 *
 * State machine progression (PENDING_RECIPIENT_DOWNLOAD → … → REWARDS_VESTED)
 * is driven server-side by the cue-card-vesting-trigger edge function.
 *
 * data-xray-id: cue-card-send-button
 */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Send, Zap, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { RecipientPicker, type RecipientPickerValue } from "./RecipientPicker";
import { LicenseChoiceCard, type LicenseDoor } from "./LicenseChoiceCard";
import { KallistraFramingCard } from "./KallistraFramingCard";
import { TierProgressBadge } from "./TierProgressBadge";

interface CueCardSendResult {
  referralId: string;
  tierName: string;
  marksPerRef: number;
}

export function CueCardSendButton() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [licenseDoor, setLicenseDoor] = useState<LicenseDoor>("AGPL");
  const [recipient, setRecipient] = useState<RecipientPickerValue>({
    recipientEmail: "",
    platform: "email",
    personalMessage: "",
  });
  const [sent, setSent] = useState<CueCardSendResult | null>(null);

  const sendMutation = useMutation<CueCardSendResult, Error>({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to send a Cue Card");
      const email = recipient.recipientEmail.trim();
      if (!email) throw new Error("Enter a recipient email or handle");

      const { data, error } = await supabase.functions.invoke("cue-card-send", {
        body: {
          sender_id: user.id,
          recipient_email: email,
          platform: recipient.platform,
          personal_message: recipient.personalMessage.trim() || null,
          license_door: licenseDoor,
        },
      });

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error ?? "Send failed");

      return {
        referralId: data.referral_id,
        tierName: data.tier_name,
        marksPerRef: data.marks_per_ref,
      };
    },
    onSuccess: (result) => {
      setSent(result);
      queryClient.invalidateQueries({ queryKey: ["referral-vested-count", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["creator-referrals-global-count"] });
    },
    onError: (e) => toast.error(e.message),
  });

  function handleOpen() {
    if (!user) {
      toast.info("Sign in to send a Cue Card and earn Marks");
      return;
    }
    setSent(null);
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    setRecipient({ recipientEmail: "", platform: "email", personalMessage: "" });
    setSent(null);
  }

  return (
    <>
      <Button
        onClick={handleOpen}
        className="gap-2"
        data-xray-id="cue-card-send-button"
      >
        <Zap className="w-4 h-4" />
        Send Cue Card + Earn Marks
      </Button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              {sent ? "Cue Card Sent!" : "Send an LB Frame Cue Card"}
            </DialogTitle>
            <DialogDescription>
              {sent
                ? "Your recipient will receive an LB Frame download + your Cue Card. Marks vest when they complete the Handshake."
                : "One button. They install LB Frame. You earn Marks when their Handshake completes."}
            </DialogDescription>
          </DialogHeader>

          {sent ? (
            <div className="space-y-4 pt-2">
              <div className="flex flex-col items-center gap-3 py-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                <div className="text-center space-y-1">
                  <p className="font-semibold">Cue Card dispatched</p>
                  <p className="text-sm text-muted-foreground">
                    Your referral is pending recipient download. You are in the{" "}
                    <strong>{sent.tierName}</strong> tier ({sent.marksPerRef} Marks per vested referral).
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Marks vest automatically when your recipient completes their LB Frame Handshake.
                    No action required on your part.
                  </p>
                </div>
              </div>
              <TierProgressBadge />
              <Button className="w-full" variant="outline" onClick={handleClose}>
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-5 pt-2">
              <TierProgressBadge />
              <KallistraFramingCard />
              <RecipientPicker value={recipient} onChange={setRecipient} />
              <LicenseChoiceCard value={licenseDoor} onChange={setLicenseDoor} />
              <Button
                className="w-full gap-2"
                onClick={() => sendMutation.mutate()}
                disabled={sendMutation.isPending || !recipient.recipientEmail.trim()}
              >
                <Send className="w-4 h-4" />
                {sendMutation.isPending ? "Sending Cue Card…" : "Send Cue Card"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Marks are a closed-loop service allocation — no fiat cashout, ever.{" "}
                Participation in the LB cooperative economy only.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
