import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, DollarSign, Package, Star } from 'lucide-react';

interface Props {
  projectCount: number;
  totalEarnings: number;
  ordersFulfilled: number;
  ordersTotal: number;
  reputationScore: number;
}

export function DashboardStatCards({ projectCount, totalEarnings, ordersFulfilled, ordersTotal, reputationScore }: Props) {
  const stats = [
    {
      label: 'Projects',
      value: projectCount,
      icon: Briefcase,
      color: 'text-blue-600',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Earnings',
      value: `$${totalEarnings.toFixed(0)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Orders',
      value: ordersTotal > 0 ? `${ordersFulfilled}/${ordersTotal}` : '0',
      icon: Package,
      color: 'text-orange-600',
      bg: 'bg-orange-500/10',
    },
    {
      label: 'Reputation',
      value: reputationScore,
      icon: Star,
      color: 'text-amber-600',
      bg: 'bg-amber-500/10',
      prefix: '⭐',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                <p className="text-lg font-bold tabular-nums">
                  {stat.prefix && <span className="mr-0.5">{stat.prefix}</span>}
                  {stat.value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
