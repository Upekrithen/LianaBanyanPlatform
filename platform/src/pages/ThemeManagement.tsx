import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeUploader } from '@/components/ThemeUploader';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { PortalPageLayout } from '@/components/PortalPageLayout';

interface Theme {
  id: string;
  theme_name: string;
  css_content: string;
  portal_type: string;
  is_default: boolean;
  preview_image_url?: string;
  created_at: string;
}

export default function ThemeManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [canManageThemes, setCanManageThemes] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    // Check if user is project owner or steward
    const { data: ownedProjects } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_id', user.id);

    const { data: stewardContracts } = await supabase
      .from('project_member_contracts')
      .select('project_id, projects(*)')
      .eq('member_id', user.id)
      .eq('status', 'active')
      .ilike('contract_title', 'steward');

    const stewardProjects = stewardContracts?.map(c => c.projects).filter(Boolean) || [];
    const allProjects = [...(ownedProjects || []), ...stewardProjects];

    setUserProjects(allProjects);
    setCanManageThemes(allProjects.length > 0);

    if (allProjects.length > 0) {
      setSelectedProject(allProjects[0].id);
      await loadThemes(allProjects[0].id);
    }

    setLoading(false);
  };

  const loadThemes = async (projectId: string) => {
    const { data, error } = await supabase
      .from('project_themes')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setThemes(data);
    }
  };

  const handleDeleteTheme = async (themeId: string) => {
    if (!confirm('Are you sure you want to delete this theme?')) return;

    const { error } = await supabase
      .from('project_themes')
      .delete()
      .eq('id', themeId);

    if (error) {
      toast.error('Failed to delete theme');
    } else {
      toast.success('Theme deleted');
      loadThemes(selectedProject);
    }
  };

  const handleSetDefault = async (themeId: string, portalType: string) => {
    // Unset other defaults for this portal
    await supabase
      .from('project_themes')
      .update({ is_default: false })
      .eq('project_id', selectedProject)
      .eq('portal_type', portalType);

    // Set new default
    const { error } = await supabase
      .from('project_themes')
      .update({ is_default: true })
      .eq('id', themeId);

    if (error) {
      toast.error('Failed to set default theme');
    } else {
      toast.success('Default theme updated');
      loadThemes(selectedProject);
    }
  };

  if (!user) {
    return (
      <PortalPageLayout>
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to manage themes</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!canManageThemes) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              Only project owners and stewards can manage themes
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const themesByPortal = {
    marketplace: themes.filter(t => t.portal_type === 'marketplace'),
    business: themes.filter(t => t.portal_type === 'business'),
    nonprofit: themes.filter(t => t.portal_type === 'nonprofit'),
    network: themes.filter(t => t.portal_type === 'network'),
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Theme Management</h1>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Project Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Select Project</CardTitle>
              <CardDescription>Choose which project to manage themes for</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {userProjects.map((project) => (
                  <Button
                    key={project.id}
                    variant={selectedProject === project.id ? 'default' : 'outline'}
                    onClick={() => {
                      setSelectedProject(project.id);
                      loadThemes(project.id);
                    }}
                  >
                    {project.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Portal Tabs */}
          <Tabs defaultValue="business" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="business">Business Portal</TabsTrigger>
              <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
              <TabsTrigger value="nonprofit">Non-Profit</TabsTrigger>
              <TabsTrigger value="network">Network</TabsTrigger>
            </TabsList>

            {(['business', 'marketplace', 'nonprofit', 'network'] as const).map((portal) => (
              <TabsContent key={portal} value={portal} className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>{portal.charAt(0).toUpperCase() + portal.slice(1)} Portal Themes</span>
                      <div className="flex gap-2">
                        <ThemeSwitcher projectId={selectedProject} portalType={portal} />
                        <ThemeUploader
                          projectId={selectedProject}
                          portalType={portal}
                          onThemeUploaded={() => loadThemes(selectedProject)}
                        />
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Manage visual themes for the {portal} portal. Design agencies can create custom presentations.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {themesByPortal[portal].map((theme) => (
                        <Card key={theme.id}>
                          <CardHeader className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">{theme.theme_name}</CardTitle>
                                <div className="flex gap-2 mt-2">
                                  {theme.is_default && (
                                    <Badge variant="default">Default</Badge>
                                  )}
                                  <Badge variant="outline">{portal}</Badge>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          {theme.preview_image_url && (
                            <div className="px-4">
                              <img
                                src={theme.preview_image_url}
                                alt={theme.theme_name}
                                className="w-full h-32 object-cover rounded-md"
                              />
                            </div>
                          )}
                          <CardContent className="p-4 flex gap-2">
                            {!theme.is_default && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSetDefault(theme.id, portal)}
                                className="flex-1"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Set Default
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteTheme(theme.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                      {themesByPortal[portal].length === 0 && (
                        <div className="col-span-full text-center py-8 text-muted-foreground">
                          No themes yet. Upload one to get started!
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </PortalPageLayout>
  );
}
