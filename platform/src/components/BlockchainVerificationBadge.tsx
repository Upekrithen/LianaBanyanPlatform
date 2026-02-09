import { useState } from "react";
import { Shield, Check, X, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BlockchainVerificationBadgeProps {
  projectId: string;
  projectSku?: string;
  size?: "sm" | "md" | "lg";
  showButton?: boolean;
}

export function BlockchainVerificationBadge({
  projectId,
  projectSku,
  size = "md",
  showButton = false,
}: BlockchainVerificationBadgeProps) {
  const [verifying, setVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "unknown" | "valid" | "invalid" | "error"
  >("unknown");

  const verifyChain = async () => {
    try {
      setVerifying(true);
      setVerificationStatus("unknown");

      const { data, error } = await supabase.rpc("verify_module_chain", {
        _project_id: projectId,
      });

      if (error) throw error;

      const allValid = data?.every((r: any) => r.is_valid) ?? false;
      setVerificationStatus(allValid ? "valid" : "invalid");

      if (allValid) {
        toast.success("Blockchain verified successfully!");
      } else {
        toast.error("Blockchain verification failed - tampering detected!");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationStatus("error");
      toast.error("Failed to verify blockchain");
    } finally {
      setVerifying(false);
    }
  };

  const iconSize = size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-5 w-5";

  const getBadgeContent = () => {
    if (verifying) {
      return (
        <Badge variant="outline" className="gap-1">
          <Shield className={`${iconSize} animate-pulse`} />
          Verifying...
        </Badge>
      );
    }

    switch (verificationStatus) {
      case "valid":
        return (
          <Badge variant="default" className="gap-1 bg-green-600">
            <Check className={iconSize} />
            Blockchain Verified
          </Badge>
        );
      case "invalid":
        return (
          <Badge variant="destructive" className="gap-1">
            <X className={iconSize} />
            Tampering Detected
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className={iconSize} />
            Verification Error
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <Shield className={iconSize} />
            Unverified
          </Badge>
        );
    }
  };

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">{getBadgeContent()}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">
              {verificationStatus === "valid" &&
                "This project's IP ledger is cryptographically verified and tamper-proof."}
              {verificationStatus === "invalid" &&
                "Warning: The blockchain has been tampered with!"}
              {verificationStatus === "error" &&
                "An error occurred during verification."}
              {verificationStatus === "unknown" &&
                "Click verify to check blockchain integrity."}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {showButton && (
        <Button
          size="sm"
          variant="outline"
          onClick={verifyChain}
          disabled={verifying}
        >
          <Shield className="mr-2 h-4 w-4" />
          {verifying ? "Verifying..." : "Verify Now"}
        </Button>
      )}
    </div>
  );
}
