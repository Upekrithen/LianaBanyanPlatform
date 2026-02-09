import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CreditPurchaseModal } from "./CreditPurchaseModal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Coins } from "lucide-react";
import { toast } from "sonner";

interface RequireCreditsProps {
  requiredCredits: number;
  actionName: string;
  onSuccess: () => void | Promise<void>;
  children: (props: { onClick: () => void; disabled: boolean }) => React.ReactNode;
}

export const RequireCredits = ({ 
  requiredCredits, 
  actionName, 
  onSuccess, 
  children 
}: RequireCreditsProps) => {
  const [currentCredits, setCurrentCredits] = useState<number>(0);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showInsufficientAlert, setShowInsufficientAlert] = useState(false);

  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_credits")
        .select("total_credits, used_credits")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      const available = (data?.total_credits || 0) - (data?.used_credits || 0);
      setCurrentCredits(available);
    } catch (error) {
      console.error("Error loading credits:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = async () => {
    if (currentCredits < requiredCredits) {
      setShowInsufficientAlert(true);
      setShowPurchaseModal(true);
      return;
    }

    try {
      await onSuccess();
      await loadCredits(); // Refresh credits after action
    } catch (error) {
      console.error("Error executing action:", error);
      toast.error("Failed to complete action");
    }
  };

  const handlePurchaseComplete = async () => {
    await loadCredits();
    toast.success("Credits added! You can now proceed.");
    setShowInsufficientAlert(false);
    
    // Auto-complete the action if we now have enough credits
    if (currentCredits >= requiredCredits) {
      setTimeout(() => handleClick(), 1000);
    }
  };

  return (
    <>
      {showInsufficientAlert && (
        <Alert className="mb-4 border-yellow-500/50 bg-yellow-500/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              You need {requiredCredits} credits for {actionName}. You have {currentCredits} credits.
            </span>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowPurchaseModal(true)}
              className="ml-2"
            >
              <Coins className="h-4 w-4 mr-2" />
              Buy Credits
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {children({ 
        onClick: handleClick, 
        disabled: isLoading 
      })}

      <CreditPurchaseModal
        open={showPurchaseModal}
        onOpenChange={setShowPurchaseModal}
        onPurchaseComplete={handlePurchaseComplete}
      />
    </>
  );
};
