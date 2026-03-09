import React, { useState } from "react";
import { useLogbook } from "./LogbookContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Download, Feather, Crown } from "lucide-react";

interface HalfLifeWarningProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previousItemCount: number;
  remainingItemCount: number;
}

export function HalfLifeWarning({
  open,
  onOpenChange,
  previousItemCount,
  remainingItemCount,
}: HalfLifeWarningProps) {
  const { exportLogbook } = useLogbook();

  const handleExport = () => {
    const markdown = exportLogbook();
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logbook-${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Feather className="h-5 w-5 text-amber-500" />
            Welcome Back, Traveler
          </DialogTitle>
          <DialogDescription>
            Your logbook has faded while you were away.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="text-amber-200">
                  Half your notes have been lost to time...
                </p>
                <div className="mt-2 text-sm text-amber-200/70">
                  <p>Previous items: {previousItemCount}</p>
                  <p>Remaining items: {remainingItemCount}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Continue as Guest
            </Button>

            <Button
              onClick={handleExport}
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Export What Remains
            </Button>

            <Button className="w-full bg-amber-600 hover:bg-amber-500">
              <Crown className="h-4 w-4 mr-2" />
              Become a Member - $5/year
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            "Members never lose their logbooks."
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useHalfLifeCheck() {
  const [showWarning, setShowWarning] = useState(false);
  const [counts, setCounts] = useState({ previous: 0, remaining: 0 });

  const checkHalfLife = (previousCount: number, currentCount: number) => {
    if (currentCount < previousCount) {
      setCounts({ previous: previousCount, remaining: currentCount });
      setShowWarning(true);
    }
  };

  return {
    showWarning,
    setShowWarning,
    counts,
    checkHalfLife,
  };
}

export default HalfLifeWarning;
