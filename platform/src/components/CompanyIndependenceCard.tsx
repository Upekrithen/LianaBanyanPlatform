import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, TrendingUp, Award, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CompanyIndependenceCardProps {
  projectId: string;
}

export function CompanyIndependenceCard({ projectId }: CompanyIndependenceCardProps) {
  const { data: project } = useQuery({
    queryKey: ['project-independence', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('company_status, became_independent_at, independence_participation_bonus, can_use_external_services')
        .eq('id', projectId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: milestones } = useQuery({
    queryKey: ['company-milestones', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_milestones')
        .select('*')
        .eq('project_id', projectId)
        .order('achieved_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (!project) return null;

  const isIndependent = project.company_status === 'independent';
  const statusConfig = {
    lb_project: {
      label: 'LB Project',
      color: 'bg-blue-500',
      icon: Building2,
    },
    transitioning: {
      label: 'Transitioning',
      color: 'bg-yellow-500',
      icon: TrendingUp,
    },
    independent: {
      label: 'Independent Company',
      color: 'bg-green-500',
      icon: Award,
    },
  };

  const config = statusConfig[project.company_status as keyof typeof statusConfig] || statusConfig.lb_project;
  const Icon = config.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <CardTitle>Company Status</CardTitle>
          </div>
          <Badge className={config.color}>{config.label}</Badge>
        </div>
        <CardDescription>
          {isIndependent
            ? 'This project has evolved into an independent company'
            : 'Project operating within LB ecosystem'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isIndependent && (
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Independence Benefits</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>
                  Participation Bonus: <strong>+{project.independence_participation_bonus}%</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ExternalLink className="h-4 w-4 text-blue-500" />
                <span>
                  External Services:{' '}
                  {project.can_use_external_services ? (
                    <Badge variant="outline" className="text-green-600">
                      Allowed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-600">
                      Restricted
                    </Badge>
                  )}
                </span>
              </div>
              {project.became_independent_at && (
                <div className="text-xs text-muted-foreground">
                  Independent since{' '}
                  {formatDistanceToNow(new Date(project.became_independent_at), { addSuffix: true })}
                </div>
              )}
            </div>
          </div>
        )}

        {milestones && milestones.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent Milestones</h4>
            <div className="space-y-2">
              {milestones.slice(0, 3).map((milestone) => (
                <div key={milestone.id} className="flex items-start gap-2 p-2 bg-muted/30 rounded text-sm">
                  <Award className="h-4 w-4 mt-0.5 text-amber-500" />
                  <div className="flex-1">
                    <div className="font-medium">{milestone.milestone_type}</div>
                    {milestone.milestone_description && (
                      <div className="text-xs text-muted-foreground">{milestone.milestone_description}</div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(milestone.achieved_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isIndependent && (
          <div className="text-sm text-muted-foreground">
            <p>Path to independence includes:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
              <li>Reach funding goals</li>
              <li>Demonstrate operational stability</li>
              <li>Build strong team and governance</li>
              <li>Maintain LB values and standards</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
