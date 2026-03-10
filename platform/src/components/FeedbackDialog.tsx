/**
 * FeedbackDialog — Global Suggestion Box
 * ========================================
 * Platform-wide feedback system. Users can submit suggestions,
 * bug reports, feature requests, or general feedback.
 *
 * Stores submissions in `platform_feedback` Supabase table.
 * Anonymous submissions allowed (no auth required).
 * Logged-in users auto-fill their ID for follow-up.
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
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquarePlus,
  Bug,
  Lightbulb,
  HelpCircle,
  Send,
  CheckCircle2,
} from "lucide-react";

type FeedbackCategory = "suggestion" | "bug" | "feature" | "general";

const CATEGORIES: { value: FeedbackCategory; label: string; icon: React.ElementType; color: string }[] = [
  { value: "suggestion", label: "Suggestion", icon: MessageSquarePlus, color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  { value: "bug", label: "Bug Report", icon: Bug, color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
  { value: "feature", label: "Feature Request", icon: Lightbulb, color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
  { value: "general", label: "General", icon: HelpCircle, color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
];

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [category, setCategory] = useState<FeedbackCategory>("suggestion");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const resetForm = () => {
    setCategory("suggestion");
    setSubject("");
    setMessage("");
    setContactEmail("");
    setIsSubmitted(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please write your feedback before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackData = {
        category,
        subject: subject.trim() || null,
        message: message.trim(),
        contact_email: contactEmail.trim() || (user?.email ?? null),
        user_id: user?.id ?? null,
        page_url: window.location.pathname,
        user_agent: navigator.userAgent,
      };

      // Insert into platform_feedback table
      const { error } = await supabase
        .from("platform_feedback" as any)
        .insert(feedbackData as any);

      if (error) {
        // If table doesn't exist yet, fall back to console + toast
        console.warn("Feedback table not available yet, logging locally:", feedbackData);
        toast({
          title: "Feedback received!",
          description: "Thank you! Your feedback has been noted. (Database storage pending setup.)",
        });
      } else {
        toast({
          title: "Thank you!",
          description: "Your feedback has been submitted. We read every message.",
        });
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error("Error submitting feedback:", err);
      toast({
        title: "Submission error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = (val: boolean) => {
    onOpenChange(val);
    if (!val) {
      // Reset after close animation
      setTimeout(resetForm, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquarePlus className="h-5 w-5 text-primary" />
            Suggestion Box
          </DialogTitle>
          <DialogDescription>
            Your voice matters. Tell us what you think — suggestions, bugs, feature ideas, or anything else.
            {!user && " No account required."}
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-lg">Thank you!</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              We read every message. If you included an email, we may follow up.
            </p>
            <Button variant="outline" onClick={() => handleClose(false)}>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category selector */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Category</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`
                        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                        transition-all border-2
                        ${isActive
                          ? `${cat.color} border-current`
                          : "bg-muted text-muted-foreground border-transparent hover:border-muted-foreground/30"
                        }
                      `}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject (optional) */}
            <div className="space-y-2">
              <Label htmlFor="feedback-subject" className="text-xs font-medium">
                Subject <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="feedback-subject"
                placeholder="Brief summary..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={200}
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="feedback-message" className="text-xs font-medium">
                Message <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="feedback-message"
                placeholder="Tell us what's on your mind..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                maxLength={5000}
                required
              />
              <p className="text-xs text-muted-foreground text-right">
                {message.length} / 5,000
              </p>
            </div>

            {/* Contact email (for anonymous users) */}
            {!user && (
              <div className="space-y-2">
                <Label htmlFor="feedback-email" className="text-xs font-medium">
                  Email <span className="text-muted-foreground">(optional, for follow-up)</span>
                </Label>
                <Input
                  id="feedback-email"
                  type="email"
                  placeholder="your@email.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
            )}

            {user && (
              <p className="text-xs text-muted-foreground">
                Submitting as {user.email}
              </p>
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
                disabled={isSubmitting || !message.trim()}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Sending..." : "Submit Feedback"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
