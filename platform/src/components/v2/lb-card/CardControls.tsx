import { Bell, BellOff, Lock, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type CardControlsProps = {
  isFrozen: boolean;
  notificationsEnabled: boolean;
  onToggleFreeze: () => void;
  onToggleNotifications: (enabled: boolean) => void;
  onShowVirtualDetails: () => void;
};

export function CardControls({
  isFrozen,
  notificationsEnabled,
  onToggleFreeze,
  onToggleNotifications,
  onShowVirtualDetails,
}: CardControlsProps) {
  return (
    <Card data-xray-id="lb-card-controls">
      <CardHeader>
        <CardTitle>Card controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="font-medium">Freeze card</p>
            <p className="text-sm text-muted-foreground">Instantly block or restore spending.</p>
          </div>
          <Button type="button" variant="outline" onClick={onToggleFreeze}>
            <Lock className="mr-2 h-4 w-4" />
            {isFrozen ? "Unfreeze" : "Freeze"}
          </Button>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label htmlFor="lb-card-notifications" className="space-y-1">
            <span className="block font-medium">Transaction notifications</span>
            <span className="block text-sm font-normal text-muted-foreground">
              Alerts for pending and completed charges.
            </span>
          </Label>
          <div className="flex items-center gap-2">
            {notificationsEnabled ? (
              <Bell className="h-4 w-4 text-muted-foreground" />
            ) : (
              <BellOff className="h-4 w-4 text-muted-foreground" />
            )}
            <Switch
              id="lb-card-notifications"
              checked={notificationsEnabled}
              onCheckedChange={onToggleNotifications}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={onShowVirtualDetails}>
            View virtual details
          </Button>
          <Button type="button" variant="ghost" disabled>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Replace card (stub)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
