/**
 * GhostEmailCapture.tsx
 *
 * Dialog that captures ghost user emails when they want to share cue cards.
 * - Explains that their shares may earn rewards
 * - Stores email with tracking token
 * - Returns personalized QR URL for their shares
 *
 * Rewards are applied when they eventually sign up as members.
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Gift,
  Share2,
  Sparkles,
  Check,
  ArrowRight,
  Users,
  Coins
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GhostEmailCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onEmailCaptured: (trackingToken: string, qrUrl: string) => void;
  templateId?: string;
}

export function GhostEmailCapture({
  isOpen,
  onClose,
  onEmailCaptured,
  templateId,
}: GhostEmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingToken, setExistingToken] = useState<string | null>(null);

  // Check localStorage for existing ghost token
  useEffect(() => {
    const stored = localStorage.getItem("ghost_tracking_token");
    if (stored) {
      setExistingToken(stored);
    }
  }, []);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async () => {
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if this email already has a tracking record
      const { data: existing } = await supabase
        .from("ghost_share_tracking")
        .select("tracking_token")
        .eq("email", email)
        .eq("status", "active")
        .single();

      let trackingToken: string;

      if (existing) {
        // Use existing token
        trackingToken = existing.tracking_token;

        // Increment share count
        await supabase.rpc("increment_ghost_share", { p_token: trackingToken });
      } else {
        // Create new tracking record
        const { data: newRecord, error } = await supabase
          .from("ghost_share_tracking")
          .insert({
            email,
            template_id: templateId || null,
            share_type: "cue_card",
          })
          .select("tracking_token")
          .single();

        if (error) throw error;
        trackingToken = newRecord.tracking_token;
      }

      // Store in localStorage for future shares
      localStorage.setItem("ghost_tracking_token", trackingToken);
      localStorage.setItem("ghost_email", email);

      // Generate the QR URL with their tracking token
      const qrUrl = `https://lianabanyan.com/RedCarpet?ghost=${trackingToken}`;

      toast.success("You're all set! Your activity may earn rewards.", {
        description: "Sign up anytime to claim your accumulated credits.",
      });

      onEmailCaptured(trackingToken, qrUrl);
      onClose();
    } catch (error) {
      console.error("Error capturing ghost email:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseExisting = () => {
    if (existingToken) {
      const qrUrl = `https://lianabanyan.com/RedCarpet?ghost=${existingToken}`;
      onEmailCaptured(existingToken, qrUrl);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Earn Rewards for Sharing
          </DialogTitle>
          <DialogDescription>
            Enter your email to track your shares. When you sign up later,
            your rewards will be waiting!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Benefits callout */}
          <div className="bg-gradient-to-r from-primary/10 to-amber-500/10 rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium text-foreground">
              What you may earn:
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-primary" />
                <span>+5 Credits per share</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-500" />
                <span>+50 Credits per signup</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>+10 Marks per referral</span>
              </div>
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-purple-500" />
                <span>Bonus multipliers</span>
              </div>
            </div>
          </div>

          {/* Email input */}
          <div className="space-y-2">
            <Label htmlFor="ghost-email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Your Email
            </Label>
            <Input
              id="ghost-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <p className="text-xs text-muted-foreground">
              We'll only use this to apply your rewards when you sign up.
              No spam, ever.
            </p>
          </div>

          {/* Existing token option */}
          {existingToken && (
            <div className="border rounded-lg p-3 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">You've shared before!</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUseExisting}
                  className="gap-1"
                >
                  Use same email
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Standard LB QR note */}
          <div className="text-xs text-muted-foreground border-t pt-3">
            <p>
              <strong>Note:</strong> Your shares will use your personal tracking link.
              When someone scans your QR code and signs up, you earn rewards!
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose}>
            Skip for now
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !email}
            className="gap-2"
          >
            {isSubmitting ? (
              "Setting up..."
            ) : (
              <>
                Start Earning
                <Sparkles className="w-4 h-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook to manage ghost sharing state
 */
export function useGhostSharing() {
  const [ghostToken, setGhostToken] = useState<string | null>(null);
  const [ghostEmail, setGhostEmail] = useState<string | null>(null);
  const [showEmailCapture, setShowEmailCapture] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    const token = localStorage.getItem("ghost_tracking_token");
    const email = localStorage.getItem("ghost_email");
    if (token) setGhostToken(token);
    if (email) setGhostEmail(email);
  }, []);

  const getGhostQrUrl = (): string => {
    if (ghostToken) {
      return `https://lianabanyan.com/RedCarpet?ghost=${ghostToken}`;
    }
    // Fallback to standard LB QR code
    return "https://lianabanyan.com/RedCarpet?ref=ghost";
  };

  const promptForEmail = () => {
    if (!ghostToken) {
      setShowEmailCapture(true);
    }
  };

  const handleEmailCaptured = (token: string, _qrUrl: string) => {
    setGhostToken(token);
    setShowEmailCapture(false);
  };

  return {
    ghostToken,
    ghostEmail,
    ghostQrUrl: getGhostQrUrl(),
    hasGhostToken: !!ghostToken,
    showEmailCapture,
    setShowEmailCapture,
    promptForEmail,
    handleEmailCaptured,
  };
}
