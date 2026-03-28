import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Map } from 'lucide-react';
import type { DashboardTreasureMapProgress } from '@/hooks/useDashboard';

interface Props {
  progress: DashboardTreasureMapProgress | null;
}

export function DashboardTreasureMap({ progress }: Props) {
  const navigate = useNavigate();

  if (!progress) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Map className="h-5 w-5" />
            Your Treasure Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <Map className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No active treasure map</p>
            <Button size="sm" variant="outline" onClick={() => navigate('/treasure-maps')} className="mt-2">
              Browse Maps
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pct = progress.total_steps > 0
    ? Math.round((progress.completed_steps / progress.total_steps) * 100)
    : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Map className="h-5 w-5" />
          Your Treasure Map
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm font-medium">{progress.map_title}</p>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{progress.completed_steps}/{progress.total_steps} steps</span>
            <span>{pct}%</span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        {progress.next_step_title && (
          <p className="text-xs text-muted-foreground">
            Next: <span className="font-medium text-foreground">{progress.next_step_title}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
