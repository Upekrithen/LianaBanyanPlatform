import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Palette } from 'lucide-react';
import type { DashboardCueCard } from '@/hooks/useDashboard';

interface Props {
  cueCards: DashboardCueCard[];
}

export function DashboardCueCards({ cueCards }: Props) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Palette className="h-5 w-5" />
          Your Cue Cards
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {cueCards.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <Palette className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No active cue cards</p>
          </div>
        ) : (
          cueCards.map((card) => (
            <button
              key={card.id}
              onClick={() => navigate(`/cue-cards/campaigns/${card.slug}`)}
              className="w-full flex items-center gap-3 rounded-lg border p-3 text-left hover:bg-muted/50 transition-colors"
            >
              <span className="text-xl shrink-0">{card.icon || '🎨'}</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{card.title}</p>
                <p className="text-xs text-muted-foreground">{card.craft_type}</p>
              </div>
            </button>
          ))
        )}
      </CardContent>
    </Card>
  );
}
