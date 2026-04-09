/**
 * BountyPaymentToggle — K150 Universal Credits-for-Marks Payment Rail
 * Reusable toggle for any bounty type. Three payment paths:
 *   - Marks (standard)
 *   - Credits (closed-loop, priority bump)
 *   - Fiat to worker's LB Card (C+20 split)
 *
 * SEC-safe: Credits never cash out. Fiat is contractor payment. Not securities.
 */

import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, CreditCard, DollarSign, Zap, ShieldCheck } from "lucide-react";

export type PaymentMethod = "marks" | "credits" | "fiat";

interface BountyPaymentToggleProps {
  priceMarks: number;
  onPaymentChange: (method: PaymentMethod) => void;
  onOwnershipChange?: (transfer: boolean) => void;
  showFiatOption?: boolean;
  creditBalance?: number;
  sponsorContext?: {
    projectId?: string;
    ambassadorChainId?: string;
    captainTier?: string;
  };
  compact?: boolean;
}

const CREATOR_KEEPS = 0.833;

export function BountyPaymentToggle({
  priceMarks,
  onPaymentChange,
  onOwnershipChange,
  showFiatOption = true,
  creditBalance = 0,
  sponsorContext,
  compact = false,
}: BountyPaymentToggleProps) {
  const [method, setMethod] = useState<PaymentMethod>("marks");
  const [transferOwnership, setTransferOwnership] = useState(false);

  const fiatAmount = priceMarks;
  const workerGets = Math.round(fiatAmount * CREATOR_KEEPS * 100) / 100;
  const platformGets = Math.round((fiatAmount - workerGets) * 100) / 100;
  const hasEnoughCredits = creditBalance >= priceMarks;

  const handleMethodChange = (value: string) => {
    const m = value as PaymentMethod;
    setMethod(m);
    onPaymentChange(m);
  };

  const handleOwnershipToggle = (checked: boolean) => {
    setTransferOwnership(checked);
    onOwnershipChange?.(checked);
  };

  if (compact) {
    return (
      <div className="space-y-2" data-xray-id="bounty-payment-toggle-compact">
        <RadioGroup value={method} onValueChange={handleMethodChange} className="flex gap-3">
          <div className="flex items-center gap-1.5">
            <RadioGroupItem value="marks" id="pay-marks" />
            <Label htmlFor="pay-marks" className="text-sm flex items-center gap-1 cursor-pointer">
              <Coins className="w-3.5 h-3.5" /> {priceMarks} Marks
            </Label>
          </div>
          <div className="flex items-center gap-1.5">
            <RadioGroupItem value="credits" id="pay-credits" />
            <Label htmlFor="pay-credits" className="text-sm flex items-center gap-1 cursor-pointer">
              <CreditCard className="w-3.5 h-3.5" /> {priceMarks} Credits
              {!hasEnoughCredits && <span className="text-destructive text-xs">(need more)</span>}
            </Label>
          </div>
          {showFiatOption && (
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="fiat" id="pay-fiat" />
              <Label htmlFor="pay-fiat" className="text-sm flex items-center gap-1 cursor-pointer">
                <DollarSign className="w-3.5 h-3.5" /> ${fiatAmount}
              </Label>
            </div>
          )}
        </RadioGroup>
      </div>
    );
  }

  return (
    <Card data-xray-id="bounty-payment-toggle">
      <CardContent className="pt-4 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <span className="font-semibold text-sm">Payment Method</span>
          {method === "credits" && (
            <Badge variant="secondary" className="gap-1 text-xs">
              <Zap className="w-3 h-3" /> Priority
            </Badge>
          )}
        </div>

        <RadioGroup value={method} onValueChange={handleMethodChange} className="space-y-3">
          {/* Marks */}
          <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="marks" id="pay-marks-full" className="mt-0.5" />
            <Label htmlFor="pay-marks-full" className="cursor-pointer flex-1">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-500" />
                <span className="font-medium">Pay in Marks</span>
                <span className="text-sm text-muted-foreground">— standard</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {priceMarks} Marks — standard Marks-for-Marks exchange
              </p>
            </Label>
          </div>

          {/* Credits */}
          <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="credits" id="pay-credits-full" className="mt-0.5" />
            <Label htmlFor="pay-credits-full" className="cursor-pointer flex-1">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Pay in Credits</span>
                <Badge variant="outline" className="text-xs">queue priority</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {priceMarks} Credits — closed-loop, worker receives Credits
              </p>
              {creditBalance > 0 && (
                <p className={`text-xs mt-1 ${hasEnoughCredits ? "text-green-600" : "text-destructive"}`}>
                  Balance: {creditBalance} Credits {!hasEnoughCredits && `(need ${priceMarks - creditBalance} more)`}
                </p>
              )}
            </Label>
          </div>

          {/* Fiat */}
          {showFiatOption && (
            <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="fiat" id="pay-fiat-full" className="mt-0.5" />
              <Label htmlFor="pay-fiat-full" className="cursor-pointer flex-1">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="font-medium">Pay ${fiatAmount} to LB Card</span>
                  <span className="text-xs text-muted-foreground">C+20</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Worker gets ${workerGets} (83.3%) · Platform ${platformGets}
                </p>
              </Label>
            </div>
          )}
        </RadioGroup>

        {/* Ownership transfer */}
        {sponsorContext?.projectId && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Checkbox
              id="ownership-transfer"
              checked={transferOwnership}
              onCheckedChange={(c) => handleOwnershipToggle(c === true)}
            />
            <Label htmlFor="ownership-transfer" className="text-sm cursor-pointer">
              Transfer deliverable ownership to my project
            </Label>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
