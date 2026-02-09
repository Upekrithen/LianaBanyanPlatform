import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function Projects() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t } = useTranslation();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              ← {t('projectsPage.back')}
            </Button>
            <h1 className="text-2xl font-bold">{t('projectsPage.title')}</h1>
          </div>
          <Button variant="outline" onClick={signOut}>
            {t('projectsPage.signOut')}
          </Button>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle>
                    <Link 
                      to={`/project/${project.name.toLowerCase()}`}
                      className="hover:text-primary transition-colors"
                    >
                      {project.name}
                    </Link>
                  </CardTitle>
                  {project.tagline && (
                    <p className="text-sm font-semibold text-primary mt-1">{project.tagline}</p>
                  )}
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {t('projectsPage.viewProject')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('projectsPage.noProjects')}</p>
          </div>
        )}
      </main>
    </div>
  );
}
