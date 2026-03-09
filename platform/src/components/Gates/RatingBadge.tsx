import React, { useState } from "react";
import { useGate, RATING_LABELS, type RatingLevel } from "./GateContext";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Lock, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface RatingBadgeProps {
  rating: RatingLevel;
  className?: string;
}

const RATING_COLORS: Record<RatingLevel, string> = {
  ST: "bg-green-500/20 text-green-400 border-green-500/30",
  KG: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  JR: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  GA: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  TN: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  MT: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  AD: "bg-red-500/20 text-red-400 border-red-500/30",
  UV: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export function RatingBadge({ rating, className }: RatingBadgeProps) {
  const { getRatingLabel } = useGate();

  return (
    <Badge
      variant="outline"
      className={cn(RATING_COLORS[rating], className)}
    >
      {rating} - {getRatingLabel(rating)}
    </Badge>
  );
}

interface RatingGateProps {
  requiredRating: RatingLevel;
  children: React.ReactNode;
  onAccess?: () => void;
}

export function RatingGate({ requiredRating, children, onAccess }: RatingGateProps) {
  const { canAccessRating, userRating, createExceptionStamp, getRatingLabel } = useGate();
  const [showDialog, setShowDialog] = useState(false);
  const [passphrase, setPassphrase] = useState("");

  if (canAccessRating(requiredRating)) {
    return <>{children}</>;
  }

  const handleConfirm = () => {
    if (!passphrase.trim()) {
      toast.error("Please enter the passphrase");
      return;
    }

    createExceptionStamp(userRating.currentRating as RatingLevel, requiredRating);
    toast.success("Access granted. Exception stamp created.");
    setShowDialog(false);
    onAccess?.();
  };

  return (
    <>
      <div
        className="relative cursor-pointer"
        onClick={() => setShowDialog(true)}
      >
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <div className="text-center p-4">
            <Lock className="h-8 w-8 mx-auto mb-2 text-amber-500" />
            <p className="text-sm text-slate-300">
              This content requires {getRatingLabel(requiredRating)} rating
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Click to request access
            </p>
          </div>
        </div>
        <div className="opacity-20 pointer-events-none">{children}</div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-500" />
              Content Rating Escalation
            </DialogTitle>
            <DialogDescription>
              You're requesting access to higher-rated content
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-200">
                    Your rating: {getRatingLabel(userRating.currentRating as RatingLevel)}
                  </p>
                  <p className="text-amber-200/70 mt-1">
                    Content rating: {getRatingLabel(requiredRating)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 text-sm text-slate-300">
              <p className="font-medium mb-2">What will be recorded:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>That you chose to access this content</li>
                <li>Timestamp of your choice</li>
                <li>Rating levels involved</li>
              </ul>
              <p className="font-medium mt-3 mb-2">What will NOT be recorded:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Content you viewed</li>
                <li>Duration of your visit</li>
                <li>Any specific actions</li>
              </ul>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Enter passphrase to confirm your intent:
              </label>
              <Input
                type="text"
                placeholder="I understand"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 bg-amber-600 hover:bg-amber-500"
              >
                Confirm Access
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default RatingBadge;
