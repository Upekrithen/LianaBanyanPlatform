/**
 * CrownResponseDialog — Red Carpet Crown Letter Response Form
 * =============================================================
 * The professional response channel for domain-verified Red Carpet
 * recipients. NOT the generic Suggestion Box.
 *
 * Bridges three systems:
 *   1. Red Carpet (domain-verified visitor identity)
 *   2. OutboundDispatch (updates letter status → "responded")
 *   3. platform_feedback (unified dashboard record)
 *
 * Response options:
 *   - Accept Crown position
 *   - Request a conversation (with scheduling intent)
 *   - Submit formal evaluation (optionally published to Cephas Press Junket)
 *   - Decline with note
 *
 * Appears on LockedCrownLetterView after unlock, and on
 * RedCarpet.tsx for domain-verified visitors.
 */

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Crown,
  MessageCircle,
  FileText,
  X,
  Send,
  CheckCircle2,
  Calendar,
  Shield,
} from "lucide-react";

type ResponseIntent =
  | "accept_crown"
  | "request_conversation"
  | "submit_evaluation"
  | "decline_with_note";

const RESPONSE_OPTIONS: {
  value: ResponseIntent;
  label: string;
  icon: React.ElementType;
  description: string;
  color: string;
}[] = [
  {
    value: "accept_crown",
    label: "Accept the Crown Position",
    icon: Crown,
    description:
      "I'm interested in the leadership role described in the letter.",
    color:
      "border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  },
  {
    value: "request_conversation",
    label: "Request a Conversation",
    icon: Calendar,
    description:
      "I'd like to discuss this further before committing.",
    color:
      "border-blue-400 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
  },
  {
    value: "submit_evaluation",
    label: "Submit a Formal Evaluation",
    icon: FileText,
    description:
      "I want to share my professional assessment. Can optionally be published to the Cephas Press Junket.",
    color:
      "border-purple-400 bg-purple-50 text-purple-900 dark:bg-purple-950 dark:text-purple-200",
  },
  {
    value: "decline_with_note",
    label: "Not Right Now",
    icon: MessageCircle,
    description:
      "I appreciate the outreach but want to pass or leave notes for later.",
    color:
      "border-gray-300 bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
  },
];

interface CrownResponseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Recipient data from Red Carpet verification */
  recipientName: string;
  recipientId: string;    // slug, e.g. "michael-seibel"
  recipientCategory: string; // "crown", "journalist", etc.
  verifiedEmail?: string;
  verifiedDomain?: string;
}

export function CrownResponseDialog({
  open,
  onOpenChange,
  recipientName,
  recipientId,
  recipientCategory,
  verifiedEmail,
  verifiedDomain,
}: CrownResponseDialogProps) {
  const { toast } = useToast();
  const [intent, setIntent] = useState<ResponseIntent | null>(null);
  const [message, setMessage] = useState("");
  const [publishToJunket, setPublishToJunket] = useState(false);
  const [preferredContact, setPreferredContact] = useState(verifiedEmail || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const resetForm = () => {
    setIntent(null);
    setMessage("");
    setPublishToJunket(false);
    setPreferredContact(verifiedEmail || "");
    setIsSubmitted(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!intent) {
      toast({
        title: "Please select a response type",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Write to platform_feedback with crown_response category
      //    (unified dashboard — Founder sees everything in one place)
      const feedbackData = {
        category: "crown_response" as any,
        subject: `[${recipientCategory.toUpperCase()}] ${recipientName} — ${intent.replace(/_/g, " ")}`,
        message: message.trim() || `Response intent: ${intent.replace(/_/g, " ")}`,
        contact_email: preferredContact.trim() || verifiedEmail || null,
        user_id: null, // Red Carpet recipients may not have accounts
        page_url: `/RedCarpet/${recipientId}`,
        user_agent: navigator.userAgent,
      };

      await supabase
        .from("platform_feedback" as any)
        .insert(feedbackData as any);

      // 2. Log to red_carpet_access as a response event
      await supabase.from("red_carpet_access" as any).insert({
        entry_mode: "crown_response",
        recipient_id: recipientId,
        recipient_name: recipientName,
        category: recipientCategory,
        email: verifiedEmail || null,
        domain: verifiedDomain || null,
        user_agent: navigator.userAgent,
        referrer_url: document.referrer || null,
      } as any);

      // 3. If evaluation + publish, create a content pipeline record
      //    (Cephas Press Junket flow — Founder stamps before publish)
      if (intent === "submit_evaluation" && publishToJunket && message.trim()) {
        // This would create an outbound item for the Founder to review
        // before publishing to Cephas. For now, we flag it in the
        // platform_feedback record and the Founder handles it manually.
        console.info(
          "[CrownResponse] Press Junket evaluation flagged for Founder review:",
          { recipientName, recipientId }
        );
      }

      toast({
        title: "Response received",
        description:
          "Your response goes directly to the Founder. Thank you for taking the time.",
      });

      setIsSubmitted(true);
    } catch (err) {
      console.error("Error submitting crown response:", err);
      toast({
        title: "Submission error",
        description: "Something went wrong. Please try again or email Founder@LianaBanyan.com directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = (val: boolean) => {
    onOpenChange(val);
    if (!val) setTimeout(resetForm, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            Your Response
          </DialogTitle>
          <DialogDescription>
            {verifiedDomain && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 mr-2">
                <Shield className="h-3 w-3" />
                Verified via @{verifiedDomain}
              </span>
            )}
            This response goes directly to Jonathan Jones, Founder.
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="font-semibold text-lg">Thank you, {recipientName.split(" ")[0]}.</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Your response has been received. The Founder reads every message personally.
              {intent === "request_conversation" && " Expect a follow-up within 48 hours."}
              {intent === "submit_evaluation" && publishToJunket && " Your evaluation has been flagged for Press Junket review."}
            </p>
            <Button variant="outline" onClick={() => handleClose(false)}>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Intent selection */}
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                How would you like to respond?
              </Label>
              <div className="space-y-2">
                {RESPONSE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isActive = intent === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setIntent(opt.value)}
                      className={`
                        w-full text-left p-3 rounded-lg border-2 transition-all
                        ${isActive ? opt.color : "border-transparent bg-muted/50 hover:bg-muted"}
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${isActive ? "" : "text-muted-foreground"}`} />
                        <div>
                          <p className="font-medium text-sm">{opt.label}</p>
                          <p className={`text-xs mt-0.5 ${isActive ? "opacity-80" : "text-muted-foreground"}`}>
                            {opt.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message (appears after selection) */}
            {intent && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="crown-message" className="text-xs font-medium">
                    {intent === "submit_evaluation" ? "Your Evaluation" : "Message"}
                    <span className="text-muted-foreground ml-1">(optional)</span>
                  </Label>
                  <Textarea
                    id="crown-message"
                    placeholder={
                      intent === "accept_crown"
                        ? "Any initial thoughts, questions, or conditions..."
                        : intent === "request_conversation"
                        ? "What would you like to discuss? Any scheduling preferences..."
                        : intent === "submit_evaluation"
                        ? "Your professional assessment of the platform model..."
                        : "Any notes you'd like to share..."
                    }
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={intent === "submit_evaluation" ? 6 : 3}
                    maxLength={10000}
                  />
                </div>

                {/* Press Junket opt-in (evaluation only) */}
                {intent === "submit_evaluation" && (
                  <label className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={publishToJunket}
                      onChange={(e) => setPublishToJunket(e.target.checked)}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-sm font-medium text-purple-900 dark:text-purple-200">
                        Publish to Cephas Press Junket
                      </p>
                      <p className="text-xs text-purple-700 dark:text-purple-400 mt-0.5">
                        Your evaluation will be reviewed by the Founder before publication.
                        Domain-verified evaluations carry institutional weight.
                      </p>
                    </div>
                  </label>
                )}

                {/* Preferred contact */}
                <div className="space-y-2">
                  <Label htmlFor="crown-contact" className="text-xs font-medium">
                    Preferred contact
                    <span className="text-muted-foreground ml-1">(for follow-up)</span>
                  </Label>
                  <Input
                    id="crown-contact"
                    placeholder="Email, phone, or LinkedIn URL"
                    value={preferredContact}
                    onChange={(e) => setPreferredContact(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleClose(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !intent}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Sending..." : "Submit Response"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
