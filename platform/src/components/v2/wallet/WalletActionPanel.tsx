import { ArrowLeftRight, Clock3, Download, SendHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WalletCurrency } from "./types";

type WalletActionPanelProps = {
  selectedCurrency: WalletCurrency;
};

const ACTIONS = [
  {
    id: "transfer",
    label: "Open transfer tools",
    icon: ArrowLeftRight,
    route: "/wallet/transfer-tools",
  },
  {
    id: "send",
    label: "Send",
    icon: SendHorizontal,
    route: "/wallet/send",
  },
  {
    id: "receive",
    label: "Receive",
    icon: Download,
    route: "/wallet/receive",
  },
  {
    id: "history",
    label: "Review activity",
    icon: Clock3,
    route: "/wallet/history",
  },
] as const;

export function WalletActionPanel({ selectedCurrency }: WalletActionPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Wallet actions</CardTitle>
        <p className="text-xs text-muted-foreground">
          Working with <span className="font-semibold capitalize">{selectedCurrency}</span>.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          const href = `${action.route}?currency=${selectedCurrency}`;
          return (
            <Button key={action.id} variant="outline" className="w-full justify-start gap-2" asChild>
              <a href={href}>
                <Icon className="h-4 w-4" />
                {action.label}
              </a>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
