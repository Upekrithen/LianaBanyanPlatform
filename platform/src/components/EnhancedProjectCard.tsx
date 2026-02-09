import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Eye, TrendingUp, CheckCircle } from "lucide-react";

interface EnhancedProjectCardProps {
  project: any;
}

export function EnhancedProjectCard({ project }: EnhancedProjectCardProps) {
  // Fetch voting status
  const { data: votingStatus } = useQuery({
    queryKey: ['project-voting-status', project.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('production_levels')
        .select('*, products!inner(project_id)')
        .eq('products.project_id', project.id)
        .order('level_number', { ascending: true });

      if (error) throw error;

      const totalLevels = data.length;
      const fundedLevels = data.filter(l => l.current_votes >= l.votes_needed).length;
      const currentLevel = data.find(l => l.current_votes < l.votes_needed) || data[data.length - 1];
      
      return {
        totalLevels,
        fundedLevels,
        progressPercentage: totalLevels > 0 ? (fundedLevels / totalLevels) * 100 : 0,
        currentLevel,
        isFullyFunded: fundedLevels === totalLevels && totalLevels > 0,
      };
    },
  });

  // Check for landing pages
  const { data: landingPages } = useQuery({
    queryKey: ['project-landing-pages', project.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_landing_pages')
        .select('id, segment_name, segment_slug, is_default')
        .eq('project_id', project.id)
        .eq('is_active', true)
        .order('is_default', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const defaultLanding = landingPages?.find(lp => lp.is_default) || landingPages?.[0];

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{project.name}</CardTitle>
            <CardDescription className="line-clamp-2">
              {project.description || project.tagline}
            </CardDescription>
          </div>
          {project.company_status && (
            <Badge variant="secondary" className="ml-2">
              {project.company_status === 'lb_project' ? 'LB Project' : 'Independent'}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Voting Progress */}
        {votingStatus && votingStatus.totalLevels > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="font-medium">Funding Progress</span>
              </div>
              <span className="text-muted-foreground">
                {votingStatus.fundedLevels} / {votingStatus.totalLevels}
              </span>
            </div>
            <Progress value={votingStatus.progressPercentage} className="h-2" />
            {votingStatus.isFullyFunded ? (
              <div className="flex items-center gap-2 text-sm text-primary">
                <CheckCircle className="h-4 w-4" />
                <span className="font-semibold">Fully Funded!</span>
              </div>
            ) : votingStatus.currentLevel && (
              <p className="text-xs text-muted-foreground">
                Current: {votingStatus.currentLevel.current_votes} / {votingStatus.currentLevel.votes_needed} votes
                {votingStatus.currentLevel.level_name && ` for ${votingStatus.currentLevel.level_name}`}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {defaultLanding && (
            <Button asChild variant="default" size="sm" className="flex-1">
              <Link to={`/project-landing/${project.id}/${defaultLanding.segment_slug}`}>
                <Eye className="mr-2 h-4 w-4" />
                Learn More
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link to={`/project/${project.project_sku || project.id}`}>
              View Details
            </Link>
          </Button>
        </div>

        {/* Additional Landing Pages */}
        {landingPages && landingPages.length > 1 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">Also for:</p>
            <div className="flex flex-wrap gap-1">
              {landingPages.filter(lp => !lp.is_default).map(lp => (
                <Button
                  key={lp.id}
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                >
                  <Link to={`/project-landing/${project.id}/${lp.segment_slug}`}>
                    {lp.segment_name}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}