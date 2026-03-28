import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";
import { useCreditWallet } from "@/hooks/useCreditWallet";
import { useNavigate } from "react-router-dom";

export function CreditWalletWidget() {
  const { data: wallet } = useCreditWallet();
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <Coins className="h-7 w-7 text-amber-500" />
          <div>
            <p className="text-sm text-muted-foreground">Credit Balance</p>
            <p className="text-xl font-bold tabular-nums">{wallet?.balance ?? 0} Credits</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate("/buy-credits")}>
          Buy More
        </Button>
      </CardContent>
    </Card>
  );
}
