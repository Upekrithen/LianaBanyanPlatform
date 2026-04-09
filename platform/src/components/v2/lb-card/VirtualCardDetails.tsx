import { useEffect } from "react";
import { EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VirtualCardSnapshot } from "./types";

type VirtualCardDetailsProps = {
  details: VirtualCardSnapshot;
  isVisible: boolean;
  onHide: () => void;
  autoHideMs?: number;
};

export function VirtualCardDetails({
  details,
  isVisible,
  onHide,
  autoHideMs = 15000,
}: VirtualCardDetailsProps) {
  useEffect(() => {
    if (!isVisible) return;
    const timer = window.setTimeout(onHide, autoHideMs);
    return () => window.clearTimeout(timer);
  }, [isVisible, autoHideMs, onHide]);

  if (!isVisible) return null;

  return (
    <Card data-xray-id="lb-card-virtual-details">
      <CardHeader>
        <CardTitle className="text-base">Virtual card details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-md border bg-muted/20 p-3 font-mono text-sm">
          <p>PAN: {details.pan}</p>
          <p>CVV: {details.cvv}</p>
          <p>EXP: {details.expiry}</p>
        </div>
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>For safety, details auto-hide after {Math.floor(autoHideMs / 1000)} seconds.</span>
          <Button type="button" size="sm" variant="ghost" onClick={onHide}>
            <EyeOff className="mr-2 h-4 w-4" />
            Hide now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
