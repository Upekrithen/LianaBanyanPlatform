import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BENEFITS = [
  "Exclusive posts and creator notes",
  "Recurring updates from the channel",
  "Member-backed publishing inside the cooperative",
  "Cancel any time",
];

export function SubscriberBenefitsRail() {
  return (
    <Card data-xray-id="subscription-channel-benefits">
      <CardHeader>
        <CardTitle>Subscriber benefits</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {BENEFITS.map((benefit) => (
          <div key={benefit} className="rounded-lg border bg-muted/20 p-3 text-sm">
            {benefit}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
