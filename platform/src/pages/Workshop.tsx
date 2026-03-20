import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Folder, Briefcase as BriefcaseIcon } from "lucide-react";
import { WorkstationCard } from "@/components/WorkstationCard";
import { Link } from "react-router-dom";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function Workshop() {
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Fetch user's projects (owned or member of)
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['workshop-projects', user?.id],
    queryFn: async () => {
      // Get owned projects
      const { data: ownedProjects, error: ownedError } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', user?.id);

      if (ownedError) throw ownedError;

      // Get projects where user is a member
      const { data: memberProjects, error: memberError } = await supabase
        .from('project_member_contracts')
        .select('project_id, projects(*)')
        .eq('member_id', user?.id)
        .eq('status', 'active');

      if (memberError) throw memberError;

      const allProjects = [
        ...(ownedProjects || []),
        ...(memberProjects?.map(m => m.projects).filter(Boolean) || [])
      ];

      // Remove duplicates
      const uniqueProjects = Array.from(
        new Map(allProjects.map(p => [p.id, p])).values()
      );

      return uniqueProjects;
    },
    enabled: !!user,
  });

  // Fetch workstations for selected project
  const { data: workstations, isLoading: workstationsLoading } = useQuery({
    queryKey: ['workstations', selectedProject],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workstations')
        .select('*')
        .eq('project_id', selectedProject)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedProject,
  });

  if (projectsLoading) {
    return (
      <PortalPageLayout maxWidth="xl" xrayId="workshop">
        <div className="text-center">Loading your workshop...</div>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout maxWidth="xl" xrayId="workshop">
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workshop</h1>
          <p className="text-muted-foreground">Your project workstations and campaign production center</p>
        </div>
        <Link to="/briefcase">
          <Button variant="outline">
            <BriefcaseIcon className="mr-2 h-4 w-4" />
            My Briefcase
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Campaign Productions</TabsTrigger>
          <TabsTrigger value="project">By Project</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Active Workstations</CardTitle>
              <CardDescription>View all your active campaign productions across all projects</CardDescription>
            </CardHeader>
            <CardContent>
              {projects?.map(project => (
                <div key={project.id} className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">{project.name}</h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* We'll fetch workstations for each project here */}
                    <WorkstationCard
                      projectId={project.id}
                      showAll={true}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="project" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects?.map(project => (
              <Card
                key={project.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => setSelectedProject(project.id)}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Folder className="h-5 w-5" />
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                  </div>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {selectedProject && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Workstations</CardTitle>
                    <CardDescription>Campaign productions and task groups for this project</CardDescription>
                  </div>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    New Workstation
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {workstationsLoading ? (
                  <div className="text-center py-8">Loading workstations...</div>
                ) : workstations && workstations.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {workstations.map(workstation => (
                      <Link key={workstation.id} to={`/campaign-production/${workstation.id}`}>
                        <Card className="hover:border-primary transition-colors cursor-pointer">
                          <CardHeader>
                            <CardTitle className="text-lg">{workstation.workstation_name}</CardTitle>
                            <CardDescription>{workstation.description}</CardDescription>
                          </CardHeader>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No workstations yet. Create one to get started!
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </PortalPageLayout>
  );
}
