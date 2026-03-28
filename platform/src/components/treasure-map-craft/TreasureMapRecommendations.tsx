import { DollarSign, Clock, TrendingUp, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CraftTreasureMap } from '@/hooks/useCraftTreasureMaps';

interface Props {
  map: CraftTreasureMap;
}

export function TreasureMapRecommendations({ map }: Props) {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-amber-600" />
          Your Economics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {(map.startup_cost_low != null || map.startup_cost_high != null) && (
          <div className="flex items-start gap-3">
            <DollarSign className="h-4 w-4 mt-0.5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Est. Startup</p>
              <p className="text-sm font-semibold text-gray-900">
                ${map.startup_cost_low?.toLocaleString() ?? '?'} – ${map.startup_cost_high?.toLocaleString() ?? '?'}
              </p>
            </div>
          </div>
        )}

        {map.first_sale_timeline && (
          <div className="flex items-start gap-3">
            <Clock className="h-4 w-4 mt-0.5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Time to First Sale</p>
              <p className="text-sm font-semibold text-gray-900">{map.first_sale_timeline}</p>
            </div>
          </div>
        )}

        {(map.projected_monthly_low != null || map.projected_monthly_high != null) && (
          <div className="flex items-start gap-3">
            <TrendingUp className="h-4 w-4 mt-0.5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Projected Monthly</p>
              <p className="text-sm font-semibold text-gray-900">
                ${map.projected_monthly_low?.toLocaleString() ?? '?'} – ${map.projected_monthly_high?.toLocaleString() ?? '?'}
              </p>
              <p className="text-[11px] text-gray-400 italic">Results may vary based on effort and market</p>
            </div>
          </div>
        )}

        {map.recommended_products && (map.recommended_products as { title: string; slug: string }[]).length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Recommended</p>
            {(map.recommended_products as { title: string; slug: string }[]).map((p, i) => (
              <a
                key={i}
                href={p.slug}
                className="block text-sm text-amber-700 hover:text-amber-900 hover:underline py-0.5"
              >
                {p.title}
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
