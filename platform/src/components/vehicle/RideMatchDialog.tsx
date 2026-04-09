import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { type VehicleRoute } from "./RouteCard";

type RideMatchDialogProps = {
  route: VehicleRoute | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: RideMatchPayload) => Promise<void> | void;
  isPending?: boolean;
};

export type RideMatchPayload = {
  routeId: string;
  pickupAddress: string;
  daysRequested: string[];
  note: string;
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function RideMatchDialog({ route, open, onOpenChange, onSubmit, isPending }: RideMatchDialogProps) {
  const [pickupAddress, setPickupAddress] = useState("");
  const [daysRequested, setDaysRequested] = useState<string[]>([]);
  const [note, setNote] = useState("");

  const toggleDay = (day: string) => {
    setDaysRequested((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };

  const handleSubmit = async () => {
    if (!route) return;
    await onSubmit({ routeId: route.id, pickupAddress: pickupAddress.trim(), daysRequested, note: note.trim() });
    setPickupAddress("");
    setDaysRequested([]);
    setNote("");
  };

  if (!route) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" data-xray-id="ride-match-dialog">
        <DialogHeader>
          <DialogTitle>Request to Join Route</DialogTitle>
          <DialogDescription>
            {route.originCity} → {route.destinationCity}
            {route.departureTime && ` · Departs ${route.departureTime.slice(0, 5)}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pickup">Pickup address</Label>
            <Input
              id="pickup"
              placeholder="Where should the driver pick you up?"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Days you need a ride</Label>
            <div className="flex flex-wrap gap-1">
              {DAYS.map((day) => {
                const available = route.daysAvailable.length === 0 || route.daysAvailable.includes(day);
                return (
                  <Badge
                    key={day}
                    variant={daysRequested.includes(day) ? "default" : "outline"}
                    className={available ? "cursor-pointer" : "cursor-not-allowed opacity-40"}
                    onClick={() => available && toggleDay(day)}
                  >
                    {day.slice(0, 3)}
                  </Badge>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note to driver (optional)</Label>
            <Textarea
              id="note"
              rows={2}
              placeholder="Anything the driver should know..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {route.costPerRide != null && (
            <div className="rounded-md border bg-muted/30 p-3 text-sm">
              <p className="font-medium">{route.costPerRide.toFixed(2)} credits per ride</p>
              <p className="text-xs text-muted-foreground mt-1">
                Cooperative framing: contributions cover fuel and Cost+20% platform margin.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Sending..." : "Send request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
