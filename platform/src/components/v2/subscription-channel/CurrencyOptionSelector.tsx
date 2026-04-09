import { Coins, DollarSign, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscriptionCurrency } from "./types";

type CurrencyOptionSelectorProps = {
  value: SubscriptionCurrency;
  onChange: (currency: SubscriptionCurrency) => void;
};

const OPTIONS: Array<{ value: SubscriptionCurrency; label: string; icon: JSX.Element }> = [
  { value: "marks", label: "Marks", icon: <Coins className="h-4 w-4" /> },
  { value: "credits", label: "Credits", icon: <Coins className="h-4 w-4" /> },
  { value: "joules", label: "Joules", icon: <Zap className="h-4 w-4" /> },
  { value: "dollars", label: "Dollars", icon: <DollarSign className="h-4 w-4" /> },
];

export function CurrencyOptionSelector({ value, onChange }: CurrencyOptionSelectorProps) {
  return (
    <Card data-xray-id="subscription-channel-currency-selector">
      <CardHeader>
        <CardTitle>Choose subscription currency</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left ${
              value === option.value ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"
            }`}
          >
            {option.icon}
            <span className="font-medium">{option.label}</span>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
