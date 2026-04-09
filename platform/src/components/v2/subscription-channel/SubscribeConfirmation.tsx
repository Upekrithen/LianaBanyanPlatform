import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscriptionCurrency } from "./types";

type SubscribeConfirmationProps = {
  selectedCurrency: SubscriptionCurrency;
  canSubscribe: boolean;
  onSubscribe: () => void;
  subscribed: boolean;
};

export function SubscribeConfirmation({
  selectedCurrency,
  canSubscribe,
  onSubscribe,
  subscribed,
}: SubscribeConfirmationProps) {
  return (
    <Card data-xray-id="subscription-channel-confirmation">
      <CardHeader>
        <CardTitle>Subscribe confirmation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Selected currency: <span className="font-medium text-foreground capitalize">{selectedCurrency}</span>
        </p>

        {subscribed ? (
          <div className="rounded-lg border border-emerald-300 bg-emerald-500/10 p-4 text-center">
            <p className="text-lg font-semibold">As You Wish</p>
            <p className="text-sm text-muted-foreground">Your subscription is active.</p>
          </div>
        ) : (
          <Button type="button" onClick={onSubscribe} disabled={!canSubscribe}>
            Subscribe Now
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
