import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Ghost,
  AlertTriangle,
  Shield,
  Sparkles,
  Ban,
  Clock,
  Lock,
  Scale,
} from "lucide-react";

const CURRENT_TERMS_VERSION = 1;

interface GhostCreditTermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccepted?: () => void;
  forceShow?: boolean;
}

export function GhostCreditTermsModal({
  open,
  onOpenChange,
  onAccepted,
  forceShow = false,
}: GhostCreditTermsModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [accepted, setAccepted] = useState(false);

  const acceptTerms = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("profiles")
        .update({
          ghost_credit_terms_accepted_at: new Date().toISOString(),
          ghost_credit_terms_version: CURRENT_TERMS_VERSION,
        })
        .eq("id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Ghost Credit terms accepted!", {
        description: "You now have access to 200 Ghost Credits",
      });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      onAccepted?.();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Failed to accept terms: ${error.message}`);
    },
  });

  const handleAccept = () => {
    if (!accepted) {
      toast.error("Please check the box to confirm you understand the terms");
      return;
    }
    acceptTerms.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={forceShow ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Ghost className="w-6 h-6 text-purple-500" />
            Ghost Credits — Terms of Service
          </DialogTitle>
          <DialogDescription>
            Please read and accept these terms to receive your initial 200 Ghost Credits
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-6">
            {/* Key Points Summary */}
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-amber-800">Important Notice</p>
                    <p className="text-sm text-amber-700">
                      Ghost Credits are NOT money. They have NO cash value and CANNOT be converted to cash, ever.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 1: Definition */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Badge variant="outline">1</Badge>
                Definition
              </h3>
              <p className="text-sm text-muted-foreground pl-8">
                Ghost Credits are non-monetary digital tokens for platform interaction and practice mode.
                They exist solely within the Liana Banyan platform ecosystem.
              </p>
            </div>

            {/* Section 2: No Cash Value */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Badge variant="outline">2</Badge>
                <Ban className="w-4 h-4 text-red-500" />
                No Cash Value
              </h3>
              <p className="text-sm text-muted-foreground pl-8">
                Ghost Credits have <strong>no cash value</strong>, cannot be redeemed for cash,
                and cannot be sold, traded, or transferred for monetary value.
                <span className="text-red-600 font-medium"> By corporate mandate, no Ghost Credit conversion. At all. Ever.</span>
              </p>
            </div>

            {/* Section 3: Purpose */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Badge variant="outline">3</Badge>
                <Sparkles className="w-4 h-4 text-purple-500" />
                Purpose
              </h3>
              <div className="text-sm text-muted-foreground pl-8 space-y-1">
                <p>Ghost Credits enable:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Practice mode interactions in Ghost World</li>
                  <li>Non-financial reputation building</li>
                  <li>Platform exploration without commitment</li>
                  <li>"Make It Real" checkout preview (no monetary value until converted to Joule purchase at checkout)</li>
                </ul>
              </div>
            </div>

            {/* Section 4: Expiration */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Badge variant="outline">4</Badge>
                <Clock className="w-4 h-4 text-orange-500" />
                Expiration
              </h3>
              <p className="text-sm text-muted-foreground pl-8">
                Ghost Credits may expire if unused. Weekly top-off does not accumulate beyond
                maximum hold (500 credits). Use them or lose them — they're for practice, not hoarding.
              </p>
            </div>

            {/* Section 5: Non-Transferable */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Badge variant="outline">5</Badge>
                <Lock className="w-4 h-4 text-blue-500" />
                Non-Transferable
              </h3>
              <p className="text-sm text-muted-foreground pl-8">
                Ghost Credits are bound to your account and cannot be transferred, inherited, or assigned.
                They are personal to your journey on the platform.
              </p>
            </div>

            {/* Section 6: Platform Discretion */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Badge variant="outline">6</Badge>
                <Scale className="w-4 h-4 text-gray-500" />
                Platform Discretion
              </h3>
              <p className="text-sm text-muted-foreground pl-8">
                Liana Banyan reserves the right to modify, suspend, or terminate the Ghost Credit
                system at any time. We will provide reasonable notice of significant changes.
              </p>
            </div>

            {/* Final Acknowledgment */}
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-purple-800">Acknowledgment</p>
                    <p className="text-sm text-purple-700">
                      BY USING GHOST CREDITS, YOU ACKNOWLEDGE THEY ARE NOT MONEY,
                      HAVE NO MONETARY VALUE, AND CANNOT BE CONVERTED TO CASH.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Acceptance Checkbox */}
        <div className="flex items-start space-x-3 pt-4 border-t">
          <Checkbox
            id="accept-terms"
            checked={accepted}
            onCheckedChange={(checked) => setAccepted(checked === true)}
          />
          <label
            htmlFor="accept-terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            I understand and accept these terms. I acknowledge that Ghost Credits are not money
            and have no cash value.
          </label>
        </div>

        {/* Accept Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleAccept}
          disabled={!accepted || acceptTerms.isPending}
        >
          {acceptTerms.isPending ? (
            "Accepting..."
          ) : (
            <>
              <Ghost className="w-4 h-4 mr-2" />
              Accept and Receive 200 Ghost Credits
            </>
          )}
        </Button>

        {/* Version Info */}
        <p className="text-xs text-center text-muted-foreground">
          Terms Version {CURRENT_TERMS_VERSION} • Last Updated February 2026
        </p>
      </DialogContent>
    </Dialog>
  );
}

export function useGhostCreditTermsStatus() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["ghost-credit-terms", user?.id],
    queryFn: async () => {
      if (!user) return { accepted: false, needsReaccept: false };

      const { data, error } = await supabase
        .from("profiles")
        .select("ghost_credit_terms_accepted_at, ghost_credit_terms_version")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      const accepted = !!data?.ghost_credit_terms_accepted_at;
      const needsReaccept = accepted && (data?.ghost_credit_terms_version || 0) < CURRENT_TERMS_VERSION;

      return { accepted, needsReaccept };
    },
    enabled: !!user,
  });
}

export default GhostCreditTermsModal;
