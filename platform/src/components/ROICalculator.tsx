import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { TrendingUp, DollarSign, Calendar } from "lucide-react";

export const ROICalculator = () => {
  const [pledgeAmount, setPledgeAmount] = useState(500);
  const [timeCommitment, setTimeCommitment] = useState(90);
  const [initialValuation, setInitialValuation] = useState(10000);
  const [finalValuation, setFinalValuation] = useState(100000);

  // Calculate equity/cash ratios based on time commitment
  const productLeadTime = 180; // Default product lead time
  const ratioFactor = Math.min(1.0, Math.max(0.0, timeCommitment / productLeadTime));
  const equityRatio = 0.1 + (ratioFactor * 0.8);
  const cashRatio = 0.9 - (ratioFactor * 0.8);

  // Calculate investment breakdown
  const equityAmount = pledgeAmount * equityRatio;
  const cashAmount = pledgeAmount * cashRatio;

  // Calculate ownership percentage at initial valuation
  const ownershipPercent = (equityAmount / initialValuation) * 100;

  // Calculate final value
  const finalEquityValue = (ownershipPercent / 100) * finalValuation;
  const totalFinalValue = finalEquityValue + cashAmount;

  // Calculate ROI
  const roi = ((totalFinalValue - pledgeAmount) / pledgeAmount) * 100;
  const equityROI = ((finalEquityValue - equityAmount) / equityAmount) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Interactive ROI Calculator
          </CardTitle>
          <CardDescription>
            Adjust the sliders to see how different investment parameters affect your returns
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
              <Label>Time Commitment (Days)</Label>
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

          {/* Initial Valuation */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Initial Project Valuation</Label>
              <span className="text-sm font-medium">${initialValuation.toLocaleString()}</span>
            </div>
            <Slider
              value={[initialValuation]}
              onValueChange={(value) => setInitialValuation(value[0])}
              min={5000}
              max={100000}
              step={5000}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$5k</span>
              <span>$100k</span>
            </div>
          </div>

          {/* Final Valuation */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Projected Final Valuation</Label>
              <span className="text-sm font-medium">${finalValuation.toLocaleString()}</span>
            </div>
            <Slider
              value={[finalValuation]}
              onValueChange={(value) => setFinalValuation(value[0])}
              min={initialValuation}
              max={500000}
              step={10000}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>${(initialValuation / 1000).toFixed(0)}k</span>
              <span>$500k</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Investment Breakdown */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Investment Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-muted-foreground">Total Pledge</span>
              <span className="font-bold">${pledgeAmount.toFixed(2)}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Equity Ratio</span>
                <span className="font-medium text-primary">{(equityRatio * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">→ Equity Amount</span>
                <span className="font-medium">${equityAmount.toFixed(2)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Cash Ratio</span>
                <span className="font-medium text-secondary">{(cashRatio * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">→ Product Credits</span>
                <span className="font-medium">${cashAmount.toFixed(2)}</span>
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Ownership</span>
                <span className="font-bold text-primary">{ownershipPercent.toFixed(3)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Returns Projection */}
        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-green-600 dark:text-green-400">
              <TrendingUp className="h-5 w-5" />
              Returns Projection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-muted-foreground">Initial Investment</span>
              <span className="font-medium">${pledgeAmount.toFixed(2)}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Equity Value</span>
                <span className="font-bold text-green-600">${finalEquityValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Product Credits</span>
                <span className="font-medium">${cashAmount.toFixed(2)}</span>
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Value</span>
                <span className="font-bold text-lg text-green-600">
                  ${totalFinalValue.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="pt-2 border-t space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm">Overall ROI</span>
                <span className={`font-bold ${roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {roi > 0 ? '+' : ''}{roi.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Equity ROI</span>
                <span className={`font-bold ${equityROI > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {equityROI > 0 ? '+' : ''}{equityROI.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Multiplier</span>
                <span className="font-bold text-lg">
                  {(totalFinalValue / pledgeAmount).toFixed(2)}x
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
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            • With a <strong>{timeCommitment}-day</strong> commitment, you convert{' '}
            <strong>{(equityRatio * 100).toFixed(1)}%</strong> to equity and keep{' '}
            <strong>{(cashRatio * 100).toFixed(1)}%</strong> as product credits
          </p>
          <p>
            • Your <strong>${equityAmount.toFixed(2)}</strong> equity investment at{' '}
            <strong>${initialValuation.toLocaleString()}</strong> valuation gives you{' '}
            <strong>{ownershipPercent.toFixed(3)}%</strong> ownership
          </p>
          <p>
            • If the project grows to <strong>${finalValuation.toLocaleString()}</strong>,
            your equity alone is worth <strong>${finalEquityValue.toFixed(2)}</strong>
          </p>
          <p className="text-primary font-medium pt-2">
            💡 Tip: Longer time commitments and earlier investments (lower initial valuations) 
            yield significantly higher returns!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
