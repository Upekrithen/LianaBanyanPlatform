/**
 * FUNDING TRACKER — Live progress bar with transparent cost breakdown
 * ===================================================================
 * Shows current funding vs target with a breakdown of where money goes.
 * Will connect to Supabase `founding_runs` table when migrations land.
 */

import { Progress } from "@/components/ui/progress";
import { DollarSign, Users, Package, Truck, Heart } from "lucide-react";

interface FundingTrackerProps {
  currentAmount: number;
  targetAmount: number;
  backerCount: number;
  breakdown: {
    materials: number;
    production: number;
    shipping: number;
    platform: number;
  };
}

export function FundingTracker({
  currentAmount,
  targetAmount,
  backerCount,
  breakdown,
}: FundingTrackerProps) {
  const percent = Math.min((currentAmount / targetAmount) * 100, 100);
  const funded = currentAmount >= targetAmount;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold">
              ${currentAmount.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              of ${targetAmount.toLocaleString()} target
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-500">
              {percent.toFixed(0)}%
            </p>
            <p className="text-sm text-muted-foreground">
              {backerCount} pioneer{backerCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Progress
          value={percent}
          className={`h-4 ${funded ? "[&>div]:bg-green-500" : ""}`}
        />
        {funded && (
          <p className="text-center text-green-500 font-semibold text-sm">
            Fully funded — production begins!
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <CostItem
          icon={Package}
          label="Materials"
          percent={breakdown.materials}
          color="text-blue-500"
        />
        <CostItem
          icon={Users}
          label="Production"
          percent={breakdown.production}
          color="text-amber-500"
        />
        <CostItem
          icon={Truck}
          label="Shipping"
          percent={breakdown.shipping}
          color="text-purple-500"
        />
        <CostItem
          icon={Heart}
          label="Platform 20%"
          percent={breakdown.platform}
          color="text-green-500"
          subtitle="Funds 16 initiatives"
        />
      </div>
    </div>
  );
}

function CostItem({
  icon: Icon,
  label,
  percent,
  color,
  subtitle,
}: {
  icon: typeof DollarSign;
  label: string;
  percent: number;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center p-3 bg-card border rounded-lg">
      <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
      <p className="text-lg font-bold">{percent}%</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {subtitle && (
        <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}
