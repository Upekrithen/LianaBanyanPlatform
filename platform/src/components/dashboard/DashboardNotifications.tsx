import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronRight } from 'lucide-react';
import type { DashboardNotification } from '@/hooks/useDashboard';

interface Props {
  notifications: DashboardNotification[];
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function DashboardNotifications({ notifications }: Props) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-5 w-5" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {notifications.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.slice(0, 5).map((n) => (
            <button
              key={n.id}
              onClick={() => n.link && navigate(n.link)}
              className={`w-full flex items-center gap-3 rounded-lg p-2.5 text-left transition-colors ${
                n.read_at ? 'hover:bg-muted/50' : 'bg-primary/5 hover:bg-primary/10'
              }`}
            >
              <div className={`w-2 h-2 rounded-full shrink-0 ${n.read_at ? 'bg-transparent' : 'bg-primary'}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm truncate">{n.title}</p>
                <p className="text-xs text-muted-foreground">{timeAgo(n.created_at)}</p>
              </div>
              {n.link && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
            </button>
          ))
        )}
      </CardContent>
    </Card>
  );
}
