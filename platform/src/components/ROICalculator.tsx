import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { TrendingUp, DollarSign, Calendar, ShieldCheck } from "lucide-react";

export const ServiceValueCalculator = () => {
  const [pledgeAmount, setPledgeAmount] = useState(500);
  const [timeCommitment, setTimeCommitment] = useState(90);

  // Calculate participation/credit ratios based on time commitment
  const productLeadTime = 180; // Default product lead time
  const ratioFactor = Math.min(1.0, Math.max(0.0, timeCommitment / productLeadTime));
  const participationRatio = 0.1 + (ratioFactor * 0.8);
  const creditRatio = 0.9 - (ratioFactor * 0.8);

  // Calculate allocation breakdown
  const participationAmount = pledgeAmount * participationRatio;
  const creditAmount = pledgeAmount * creditRatio;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Service Allocation Calculator
          </CardTitle>
          <CardDescription>
            Adjust the sliders to see how your pledge is allocated between
            membership participation and product credits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pledge Amount */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Pledge Amount</Label>
              <span className="text-sm font-medium">${pledgeAmount}</span>
            </div>
            <Slider
              value={[pledgeAmount]}
              onValueChange={(value) => setPledgeAmount(value[0])}
              min={100}
              max={5000}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$100</span>
              <span>$5,000</span>
            </div>
          </div>

          {/* Time Commitment */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Service Commitment (Days)</Label>
              <span className="text-sm font-medium">{timeCommitment} days</span>
            </div>
            <Slider
              value={[timeCommitment]}
              onValueChange={(value) => setTimeCommitment(value[0])}
              min={30}
              max={180}
              step={30}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>30 days</span>
              <span>180 days</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Allocation Breakdown */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Allocation Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-muted-foreground">Total Pledge</span>
              <span className="font-bold">${pledgeAmount.toFixed(2)}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Participation Ratio</span>
                <span className="font-medium text-primary">{(participationRatio * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">&rarr; Membership Participation</span>
                <span className="font-medium">${participationAmount.toFixed(2)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Credit Ratio</span>
                <span className="font-medium text-secondary">{(creditRatio * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">&rarr; Product Credits</span>
                <span className="font-medium">${creditAmount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What You Get */}
        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-green-600 dark:text-green-400">
              <TrendingUp className="h-5 w-5" />
              What You Receive
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-muted-foreground">Your Pledge</span>
              <span className="font-medium">${pledgeAmount.toFixed(2)}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Cooperative Membership</span>
                <span className="font-bold text-green-600">${participationAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Product Credits</span>
                <span className="font-medium">${creditAmount.toFixed(2)}</span>
              </div>
            </div>
            <div className="pt-2 border-t space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm">Governance Level</span>
                <span className="font-bold">
                  {timeCommitment >= 150 ? 'Full' : timeCommitment >= 60 ? 'Standard' : 'Basic'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Service Access</span>
                <span className="font-bold">
                  {timeCommitment >= 150 ? 'All 16 Initiatives' : timeCommitment >= 60 ? 'Core Services' : 'Basic Access'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            &#8226; With a <strong>{timeCommitment}-day</strong> commitment, you allocate{' '}
            <strong>{(participationRatio * 100).toFixed(1)}%</strong> to cooperative participation and keep{' '}
            <strong>{(creditRatio * 100).toFixed(1)}%</strong> as product credits
          </p>
          <p>
            &#8226; Your <strong>${participationAmount.toFixed(2)}</strong> membership participation gives you
            governance voice and access to cooperative services
          </p>
          <p>
            &#8226; Your <strong>${creditAmount.toFixed(2)}</strong> in product credits can be used
            across the entire cooperative marketplace &mdash; they never expire
          </p>
          <div className="mt-4 p-3 bg-background rounded border flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Participation units are cooperative service access rights, not securities or financial instruments.
              Credits maintain 1:1 USD value. No expectation of profit. The platform operates at Cost+20%, locked forever.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Keep backward-compatible export
export const ROICalculator = ServiceValueCalculator;
