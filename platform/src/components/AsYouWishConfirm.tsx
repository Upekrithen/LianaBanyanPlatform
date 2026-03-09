/**
 * AS YOU WISH — Universal Transaction Confirmation
 * ==================================================
 * Every transaction on the platform confirms with "As You Wish" by default.
 * It's the Founder's signature. Members can customize their confirmation
 * phrase if they want — but the default sets the tone.
 *
 * A transaction isn't a cold click. It's a human choosing to help.
 *
 * Usage:
 *   <AsYouWishConfirm
 *     title="Send Swoop"
 *     description="Donate a pizza to someone in need"
 *     details={[
 *       { label: "Amount", value: "$10.00" },
 *       { label: "Recipient", value: "Nashville Friday Pizza Call" },
 *     ]}
 *     onConfirm={() => handleSwoop()}
 *     onCancel={() => setOpen(false)}
 *   />
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles } from "lucide-react";

interface ConfirmDetail {
  label: string;
  value: string;
}

interface AsYouWishConfirmProps {
  open: boolean;
  title: string;
  description?: string;
  details?: ConfirmDetail[];
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  variant?: "default" | "caution" | "celebration";
}

const DEFAULT_PHRASE = "As You Wish";

/**
 * Hook to get the user's custom confirmation phrase
 */
export function useConfirmationPhrase(): string {
  const [phrase, setPhrase] = useState(DEFAULT_PHRASE);

  useEffect(() => {
    async function fetch() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_preferences")
        .select("confirmation_phrase")
        .eq("user_id", user.id)
        .single();

      if (data?.confirmation_phrase) {
        setPhrase(data.confirmation_phrase);
      }
    }
    fetch();
  }, []);

  return phrase;
}

/**
 * Update the user's custom confirmation phrase
 */
export async function updateConfirmationPhrase(phrase: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const finalPhrase = phrase.trim() || DEFAULT_PHRASE;

  const { error } = await supabase
    .from("user_preferences")
    .upsert(
      {
        user_id: user.id,
        confirmation_phrase: finalPhrase,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  return !error;
}

export function AsYouWishConfirm({
  open,
  title,
  description,
  details,
  onConfirm,
  onCancel,
  loading = false,
  variant = "default",
}: AsYouWishConfirmProps) {
  const phrase = useConfirmationPhrase();
  const [confirming, setConfirming] = useState(false);

  async function handleConfirm() {
    setConfirming(true);
    try {
      await onConfirm();
    } finally {
      setConfirming(false);
    }
  }

  const isLoading = loading || confirming;

  // Variant-specific styling
  const buttonVariant = variant === "caution"
    ? "destructive"
    : "default";

  const buttonClassName = variant === "celebration"
    ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-8 py-3 text-lg"
    : variant === "caution"
      ? "px-6 py-2"
      : "bg-primary hover:bg-primary/90 font-semibold px-6 py-2";

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {variant === "celebration" && <Sparkles className="w-5 h-5 text-amber-500" />}
            {title}
          </AlertDialogTitle>
          {description && (
            <AlertDialogDescription>
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        {/* Transaction details */}
        {details && details.length > 0 && (
          <div className="border rounded-lg p-3 space-y-2 bg-muted/30">
            {details.map((detail, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{detail.label}</span>
                <span className="font-medium">{detail.value}</span>
              </div>
            ))}
          </div>
        )}

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel disabled={isLoading}>
            Cancel
          </AlertDialogCancel>
          <Button
            variant={buttonVariant}
            className={buttonClassName}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⚙️</span>
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {phrase}
              </span>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default AsYouWishConfirm;
