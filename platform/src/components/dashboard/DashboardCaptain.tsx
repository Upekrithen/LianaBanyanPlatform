import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Anchor, BarChart3 } from 'lucide-react';
import type { CaptainSummary } from '@/hooks/useDashboard';

interface Props {
  captain: CaptainSummary;
}

const levelLabel: Record<string, string> = {
  captain_10: 'Captain of 10',
  captain_50: 'Captain of 50',
  captain_100: 'Captain of 100',
  captain_1000: 'Captain of 1000',
};

export function DashboardCaptain({ captain }: Props) {
  const navigate = useNavigate();
  const ratePercent = Math.round((captain.fulfillment_rate || 0) * 100);

  return (
    <Card className="border-amber-200/50 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Anchor className="h-5 w-5 text-amber-600" />
          Captain Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Level</p>
            <p className="font-semibold">{levelLabel[captain.level] || captain.level}</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-xs text-muted-foreground">Orders</p>
            <p className="font-semibold tabular-nums">{captain.orders_fulfilled}/{captain.orders_managed}</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-xs text-muted-foreground">Rate</p>
            <p className="font-semibold tabular-nums flex items-center gap-1">
              <BarChart3 className="h-3.5 w-3.5 text-green-600" />
              {ratePercent}%
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button size="sm" variant="outline" onClick={() => navigate('/captain')} className="flex-1">
            Manage Orders
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate('/reputation/' + captain.level)} className="flex-1">
            View Reputation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
