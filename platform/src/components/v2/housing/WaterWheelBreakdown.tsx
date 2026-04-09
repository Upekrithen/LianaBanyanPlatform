import { Badge } from "@/components/ui/badge";

type WaterWheelBreakdownProps = {
  airbnbShare: number;
  tenantSubsidy: number;
  maintenanceFund: number;
  cooperativeFund: number;
  multiplierEffect: number | null;
};

function pct(value: number, total: number) {
  if (total <= 0) return 0;
  return (value / total) * 100;
}

export function WaterWheelBreakdown({
  airbnbShare,
  tenantSubsidy,
  maintenanceFund,
  cooperativeFund,
  multiplierEffect,
}: WaterWheelBreakdownProps) {
  const total = airbnbShare + tenantSubsidy + maintenanceFund + cooperativeFund;

  return (
    <div className="space-y-2 rounded-md border bg-muted/20 p-2.5" data-xray-id="housing-waterwheel-breakdown">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium">WaterWheel breakdown</p>
        {multiplierEffect ? <Badge variant="secondary">x{multiplierEffect.toFixed(2)}</Badge> : null}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-amber-400" style={{ width: `${pct(airbnbShare, total)}%` }} />
      </div>
      <div className="grid grid-cols-2 gap-1 text-[11px] text-muted-foreground">
        <p>AirBnB share: {pct(airbnbShare, total).toFixed(0)}%</p>
        <p>Tenant subsidy: {pct(tenantSubsidy, total).toFixed(0)}%</p>
        <p>Maintenance: {pct(maintenanceFund, total).toFixed(0)}%</p>
        <p>Coop fund: {pct(cooperativeFund, total).toFixed(0)}%</p>
      </div>
    </div>
  );
}
