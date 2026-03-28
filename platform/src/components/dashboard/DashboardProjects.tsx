import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Users } from 'lucide-react';
import type { DashboardProject } from '@/hooks/useDashboard';

interface Props {
  projects: DashboardProject[];
}

const statusColor: Record<string, string> = {
  active: 'bg-green-500/10 text-green-700 border-green-200',
  draft: 'bg-slate-500/10 text-slate-600 border-slate-200',
  showcased: 'bg-amber-500/10 text-amber-700 border-amber-200',
  funded: 'bg-blue-500/10 text-blue-700 border-blue-200',
  completed: 'bg-purple-500/10 text-purple-700 border-purple-200',
};

export function DashboardProjects({ projects }: Props) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-5 w-5" />
            Your Projects
          </CardTitle>
          <Button size="sm" variant="outline" onClick={() => navigate('/cue-cards/campaigns')} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Create New</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {projects.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No projects yet</p>
            <p className="text-xs mt-1">Start a project from a Cue Card template</p>
          </div>
        ) : (
          projects.map((project) => (
            <button
              key={project.id}
              onClick={() => navigate(`/project/${project.slug}`)}
              className="w-full flex items-center justify-between rounded-lg border p-3 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{project.title}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {project.backer_count} backers
                  </span>
                  <span>•</span>
                  <span>${project.total_pledged.toFixed(0)} pledged</span>
                </div>
              </div>
              <Badge variant="outline" className={statusColor[project.status] || ''}>
                {project.status}
              </Badge>
            </button>
          ))
        )}
      </CardContent>
    </Card>
  );
}
