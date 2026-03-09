import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PieChart, TrendingUp, Users } from 'lucide-react';

interface ProjectParticipation {
  projectId: string;
  projectName: string;
  totalVotes: number;
  projectTotalVotes: number;
  participationPercentage: number;
  memberCount: number;
  yourRank: number;
}

export function ParticipationBreakdownCard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectParticipation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadParticipationBreakdown();

      // Subscribe to real-time updates
      const channel = supabase
        .channel('participation-updates')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'user_votes' },
          () => loadParticipationBreakdown()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const loadParticipationBreakdown = async () => {
    if (!user) return;

    try {
      // Get user's votes with production levels and products
      const { data: userVotes } = await supabase
        .from('user_votes')
        .select(`
          vote_amount,
          user_id,
          production_levels (
            product_id,
            products (
              name,
              project_id,
              projects (
                name
              )
            )
          )
        `)
        .eq('user_id', user.id);

      // Get all votes for all products
      const { data: allVotes } = await supabase
        .from('user_votes')
        .select(`
          vote_amount,
          user_id,
          production_levels (
            product_id,
            products (
              project_id
            )
          )
        `);

      if (!userVotes || !allVotes) return;

      // Calculate participation per project
      const projectMap = new Map<string, ProjectParticipation>();
      const projectVoters = new Map<string, Set<string>>();
      const projectUserVotes = new Map<string, Map<string, number>>();

      // Process user votes
      userVotes.forEach((vote: any) => {
        const projectId = vote.production_levels?.products?.project_id;
        const projectName = vote.production_levels?.products?.projects?.name;

        if (!projectId) return;

        if (!projectMap.has(projectId)) {
          projectMap.set(projectId, {
            projectId,
            projectName: projectName || 'Unknown Project',
            totalVotes: 0,
            projectTotalVotes: 0,
            participationPercentage: 0,
            memberCount: 0,
            yourRank: 0
          });
        }

        const project = projectMap.get(projectId)!;
        project.totalVotes += vote.vote_amount || 0;
      });

      // Process all votes to calculate totals and member counts
      allVotes.forEach((vote: any) => {
        const projectId = vote.production_levels?.products?.project_id;

        if (!projectId) return;

        const project = projectMap.get(projectId);
        if (project) {
          project.projectTotalVotes += vote.vote_amount || 0;
        }

        if (!projectVoters.has(projectId)) {
          projectVoters.set(projectId, new Set());
        }
        projectVoters.get(projectId)!.add(vote.user_id);

        // Track votes per user per project for ranking
        if (!projectUserVotes.has(projectId)) {
          projectUserVotes.set(projectId, new Map());
        }
        const userVoteMap = projectUserVotes.get(projectId)!;
        userVoteMap.set(vote.user_id, (userVoteMap.get(vote.user_id) || 0) + (vote.vote_amount || 0));
      });

      // Calculate participation percentages and ranks
      projectMap.forEach((project, projectId) => {
        if (project.projectTotalVotes > 0) {
          project.participationPercentage = (project.totalVotes / project.projectTotalVotes) * 100;
        }
        project.memberCount = projectVoters.get(projectId)?.size || 0;

        // Calculate rank
        const userVoteMap = projectUserVotes.get(projectId);
        if (userVoteMap) {
          const sortedUsers = Array.from(userVoteMap.entries()).sort((a, b) => b[1] - a[1]);
          project.yourRank = sortedUsers.findIndex(([userId]) => userId === user.id) + 1;
        }
      });

      setProjects(Array.from(projectMap.values()).sort((a, b) => b.participationPercentage - a.participationPercentage));
    } catch (error) {
      console.error('Error loading participation breakdown:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Participation Breakdown</CardTitle>
          <CardDescription>Loading your project participation...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          <CardTitle>Participation Breakdown</CardTitle>
        </div>
        <CardDescription>Your service allocation in each project</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No project participation yet. Vote on projects to contribute!
            </p>
          ) : (
            projects.map((project) => (
              <div key={project.projectId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{project.projectName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {project.memberCount} members
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Rank #{project.yourRank}
                      </span>
                    </div>
                  </div>
                  <Badge variant={project.participationPercentage >= 5 ? "default" : "secondary"}>
                    {project.participationPercentage.toFixed(2)}%
                  </Badge>
                </div>
                <Progress value={Math.min(project.participationPercentage, 100)} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{project.totalVotes.toFixed(2)} votes</span>
                  <span>{project.projectTotalVotes.toFixed(2)} total votes</span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
