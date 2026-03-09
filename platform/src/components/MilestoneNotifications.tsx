import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'milestone' | 'deadline' | 'conversion' | 'achievement';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  projectName?: string;
}

export function MilestoneNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadNotifications();
      
      // Subscribe to real-time updates
      const channel = supabase
        .channel('notifications')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'user_votes' },
          () => loadNotifications()
        )
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'eoi_vesting_schedules' },
          () => loadNotifications()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const notifications: Notification[] = [];

      // Check for EOI vesting completing soon
      const { data: vesting } = await supabase
        .from('eoi_vesting_schedules')
        .select('*, projects(name)')
        .eq('user_id', user.id)
        .eq('status', 'active');

      vesting?.forEach(schedule => {
        const daysRemaining = schedule.total_milestone_days - schedule.days_elapsed;
        if (daysRemaining <= 7 && daysRemaining > 0) {
          notifications.push({
            id: `vesting-${schedule.id}`,
            type: 'conversion',
            title: 'EOI Vesting Ending Soon',
            message: `Your ${schedule.projects?.name} EOI vesting completes in ${daysRemaining} days`,
            timestamp: new Date().toISOString(),
            read: false,
            projectName: schedule.projects?.name
          });
        }
      });

      // Check for recent milestones (new projects)
      const { data: recentProjects } = await supabase
        .from('projects')
        .select('id, name, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      recentProjects?.forEach(project => {
        notifications.push({
          id: `milestone-${project.id}`,
          type: 'milestone',
          title: 'New Project Launched',
          message: `${project.name} has launched on the platform`,
          timestamp: project.created_at || new Date().toISOString(),
          read: false,
          projectName: project.name
        });
      });

      // Sort by timestamp
      notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setNotifications(notifications.slice(0, 10));
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'milestone': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'deadline': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'conversion': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Loading updates...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <CardTitle>Notifications</CardTitle>
        </div>
        <CardDescription>Project milestones and important updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No new notifications</p>
          ) : (
            notifications.map((notif) => (
              <div key={notif.id} className="flex gap-3 p-2 rounded-lg hover:bg-accent">
                <div className="mt-1">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm">{notif.title}</p>
                    <Badge variant="outline" className="text-xs">
                      {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                  {notif.projectName && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {notif.projectName}
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}