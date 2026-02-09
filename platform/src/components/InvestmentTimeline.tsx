import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Vote, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface TimelineEvent {
  id: string;
  type: 'vote' | 'pledge' | 'conversion';
  date: string;
  projectName: string;
  productName?: string;
  amount?: number;
  description: string;
}

export function InvestmentTimeline() {
  const { user } = useAuth();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTimelineEvents();
    }
  }, [user]);

  const loadTimelineEvents = async () => {
    if (!user) return;

    try {
      const timelineEvents: TimelineEvent[] = [];

      // Load votes
      const { data: votes } = await supabase
        .from('user_votes')
        .select(`
          id,
          vote_amount,
          created_at,
          production_levels (
            products (
              name,
              projects (
                name
              )
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      votes?.forEach((vote: any) => {
        const projectName = vote.production_levels?.products?.projects?.name;
        const productName = vote.production_levels?.products?.name;
        if (projectName) {
          timelineEvents.push({
            id: `vote-${vote.id}`,
            type: 'vote',
            date: vote.created_at,
            projectName,
            productName,
            amount: vote.vote_amount,
            description: `Voted on ${productName || 'product'}`
          });
        }
      });

      // Load EOI vesting schedules
      const { data: vesting } = await supabase
        .from('eoi_vesting_schedules')
        .select('id, vesting_start_date, eoi_amount, total_vesting_days, projects(name)')
        .eq('user_id', user.id)
        .order('vesting_start_date', { ascending: false });

      vesting?.forEach(schedule => {
        timelineEvents.push({
          id: `vesting-${schedule.id}`,
          type: 'conversion',
          date: schedule.vesting_start_date,
          projectName: schedule.projects?.name || 'Unknown',
          amount: schedule.eoi_amount,
          description: `Started EOI vesting (${schedule.total_vesting_days} days)`
        });
      });

      // Sort by date
      timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setEvents(timelineEvents);
    } catch (error) {
      console.error('Error loading timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'vote': return <Vote className="h-4 w-4" />;
      case 'pledge': return <DollarSign className="h-4 w-4" />;
      case 'conversion': return <TrendingUp className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'vote': return 'bg-blue-500';
      case 'pledge': return 'bg-green-500';
      case 'conversion': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Investment Timeline</CardTitle>
          <CardDescription>Loading your activity history...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment Timeline</CardTitle>
        <CardDescription>Your recent activity across all projects</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet. Start by voting on projects!</p>
          ) : (
            events.slice(0, 10).map((event) => (
              <div key={event.id} className="flex gap-3">
                <div className={`mt-1 rounded-full p-2 ${getEventColor(event.type)}`}>
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{event.projectName}</p>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(event.date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                  {event.amount && (
                    <Badge variant="outline" className="mt-1">
                      {event.amount.toFixed(2)} {event.type === 'vote' ? 'votes' : 'credits'}
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