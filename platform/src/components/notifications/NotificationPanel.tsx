import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  ShoppingBag, Users, Scale, Trophy, Map, Home, Landmark,
  Info, PartyPopper, CheckCircle2,
} from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

const TYPE_CONFIG: Record<string, { icon: typeof Info; color: string }> = {
  order_update: { icon: ShoppingBag, color: 'text-green-500' },
  crew_call: { icon: Users, color: 'text-blue-500' },
  star_chamber: { icon: Scale, color: 'text-purple-500' },
  arena_result: { icon: Trophy, color: 'text-yellow-500' },
  map_complete: { icon: Map, color: 'text-teal-500' },
  housing_update: { icon: Home, color: 'text-orange-500' },
  bill_update: { icon: Landmark, color: 'text-red-500' },
  system: { icon: Info, color: 'text-gray-500' },
  welcome: { icon: PartyPopper, color: 'text-yellow-500' },
};

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

interface Props {
  onClose: () => void;
  onCountChange: (count: number) => void;
}

export function NotificationPanel({ onClose, onCountChange }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('notifications' as never)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20) as { data: Notification[] | null };
      setNotifications(data || []);
      setLoading(false);
    })();
  }, [user]);

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications' as never)
      .update({ read_at: new Date().toISOString() } as never)
      .eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    onCountChange(notifications.filter(n => !n.read_at && n.id !== id).length);
  };

  const markAllRead = async () => {
    if (!user) return;
    const unreadIds = notifications.filter(n => !n.read_at).map(n => n.id);
    if (unreadIds.length === 0) return;
    await supabase
      .from('notifications' as never)
      .update({ read_at: new Date().toISOString() } as never)
      .eq('user_id', user.id)
      .is('read_at', null);
    setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
    onCountChange(0);
  };

  const handleClick = async (n: Notification) => {
    if (!n.read_at) await markAsRead(n.id);
    if (n.link) {
      navigate(n.link);
      onClose();
    }
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-popover border rounded-lg shadow-lg z-50 overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold text-sm">Notifications</h3>
        <Button variant="ghost" size="sm" className="text-xs h-7" onClick={markAllRead}>
          Mark all read
        </Button>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto" />
            <p className="text-sm text-muted-foreground">You're all caught up!</p>
          </div>
        ) : (
          notifications.map(n => {
            const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
            const Icon = config.icon;
            return (
              <button
                key={n.id}
                className="w-full flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors text-left border-b last:border-b-0"
                onClick={() => handleClick(n)}
              >
                {!n.read_at && (
                  <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                )}
                {n.read_at && <span className="w-2 shrink-0" />}
                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${config.color}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.read_at ? 'font-semibold' : ''}`}>{n.title}</p>
                  {n.body && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.body}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">{relativeTime(n.created_at)}</p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
