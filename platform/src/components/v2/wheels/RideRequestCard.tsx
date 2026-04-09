import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LocalRideRequestDraft } from "./types";

type RideRequestCardProps = {
  onSubmit: (request: LocalRideRequestDraft) => Promise<void> | void;
};

export function RideRequestCard({ onSubmit }: RideRequestCardProps) {
  const [request, setRequest] = useState<LocalRideRequestDraft>({
    originCity: "",
    destinationCity: "",
    seatsNeeded: 1,
    departureTime: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <Card data-xray-id="wheels-ride-request-card">
      <CardHeader>
        <CardTitle>Ride Request</CardTitle>
        <CardDescription>Quick request flow for immediate ride needs.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            placeholder="Pickup city"
            value={request.originCity}
            onChange={(event) => setRequest((prev) => ({ ...prev, originCity: event.target.value }))}
          />
          <Input
            placeholder="Dropoff city"
            value={request.destinationCity}
            onChange={(event) => setRequest((prev) => ({ ...prev, destinationCity: event.target.value }))}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            type="number"
            min={1}
            max={6}
            value={request.seatsNeeded}
            onChange={(event) =>
              setRequest((prev) => ({ ...prev, seatsNeeded: Math.max(1, Math.min(6, Number(event.target.value || 1))) }))
            }
          />
          <Input
            type="time"
            value={request.departureTime}
            onChange={(event) => setRequest((prev) => ({ ...prev, departureTime: event.target.value }))}
          />
        </div>
        <Button
          className="w-full md:w-auto"
          disabled={isSubmitting || !request.originCity || !request.destinationCity || !request.departureTime}
          onClick={async () => {
            setIsSubmitting(true);
            try {
              await onSubmit(request);
              setRequest({ originCity: "", destinationCity: "", seatsNeeded: 1, departureTime: "" });
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          {isSubmitting ? "Submitting..." : "Request a ride"}
        </Button>
      </CardContent>
    </Card>
  );
}
