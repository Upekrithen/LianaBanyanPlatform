import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdaptRadarChart } from './AdaptRadarChart';
import { ExternalLink } from 'lucide-react';

interface AdaptScoreCardProps {
  systemId: string;
  systemName: string;
  route?: string;
  scores: Record<string, number>;
  onClick?: () => void;
}

function getTierInfo(composite: number) {
  if (composite >= 90) return { label: 'Platinum', color: 'bg-gray-300 text-gray-800' };
  if (composite >= 75) return { label: 'Gold', color: 'bg-yellow-400 text-yellow-900' };
  if (composite >= 60) return { label: 'Silver', color: 'bg-gray-400 text-gray-900' };
  if (composite >= 40) return { label: 'Bronze', color: 'bg-orange-400 text-orange-900' };
  return { label: 'Red Flag', color: 'bg-red-600 text-white' };
}

function getComposite(scores: Record<string, number>): number {
  const vals = Object.values(scores);
  if (vals.length === 0) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function getTierScoreColor(composite: number): string {
  if (composite >= 90) return 'text-gray-500';
  if (composite >= 75) return 'text-yellow-600';
  if (composite >= 60) return 'text-gray-500';
  if (composite >= 40) return 'text-orange-600';
  return 'text-red-600';
}

const FRIENDLY_NAMES: Record<string, string> = {
  ghost_world: 'Ghost World',
  housing: 'Housing',
  congress_api: 'Congress API',
  front_door: 'Front Door',
  political_expedition: 'Political Expedition',
  lemon_lot: 'Lemon Lot',
  local_wheels: 'Local Wheels',
  rideshare_routes: 'Rideshare Routes',
  commerce_engine: 'Commerce Engine',
  star_chamber: 'Star Chamber',
  moneypenny: 'MoneyPenny',
  crew_calls: 'Crew Calls',
  calendar: 'Calendar',
  design_arena: 'Design Arena',
  emporium: 'Emporium',
  crew_tables: 'Crew Tables',
  beacon: 'Beacon',
  treasure_map: 'Treasure Map',
  notifications: 'Notifications',
};

export { FRIENDLY_NAMES };

export function AdaptScoreCard({ systemId, systemName, route, scores, onClick }: AdaptScoreCardProps) {
  const composite = getComposite(scores);
  const tier = getTierInfo(composite);
  const scoreColor = getTierScoreColor(composite);

  const radarScores = {
    effectiveness: scores.effectiveness ?? 0,
    adaptability: scores.adaptability ?? 0,
    durability: scores.durability ?? 0,
    alignment: scores.alignment ?? 0,
    participation: scores.participation ?? 0,
    transmission: scores.transmission ?? 0,
  };

  return (
    <Card
      className="cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-lg"
      onClick={onClick}
      data-xray-id={`adapt-card-${systemId}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm truncate">{systemName}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-2xl font-bold ${scoreColor}`}>
                {composite.toFixed(0)}
              </span>
              <Badge className={`${tier.color} text-xs`}>{tier.label}</Badge>
            </div>
            {route && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                {route}
              </p>
            )}
          </div>
          <div className="flex-shrink-0">
            <AdaptRadarChart scores={radarScores} size="sm" showLabels={false} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
