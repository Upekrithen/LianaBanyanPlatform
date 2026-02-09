import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { TrendingUp, Sparkles, DollarSign } from 'lucide-react';
import { EnhancedProjectCard } from '@/components/EnhancedProjectCard';

type TimeFilter = '24h' | '72h' | '1week';

interface Project {
  id: string;
  name: string;
  description: string;
  tagline?: string;
  created_at: string;
  project_images: { image_url: string }[];
  products: {
    production_levels: { current_votes: number }[];
  }[];
}

export default function Marketplace() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t } = useTranslation();
  const [newTimeFilter, setNewTimeFilter] = useState<TimeFilter>('1week');
  const [trendingTimeFilter, setTrendingTimeFilter] = useState<TimeFilter>('1week');

  const getTimeThreshold = (filter: TimeFilter) => {
    const now = new Date();
    const hours = filter === '24h' ? 24 : filter === '72h' ? 72 : 168;
    now.setHours(now.getHours() - hours);
    return now.toISOString();
  };

  const { data: newProjects = [] } = useQuery({
    queryKey: ['newProjects', newTimeFilter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_images(image_url),
          products(production_levels(current_votes))
        `)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as Project[];
    },
  });

  const { data: trendingProjects = [] } = useQuery({
    queryKey: ['trendingProjects', trendingTimeFilter],
    queryFn: async () => {
      const threshold = getTimeThreshold(trendingTimeFilter);
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_images(image_url),
          products(production_levels(current_votes))
        `)
        .gte('created_at', threshold)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      return (data as Project[])
        .map(project => ({
          ...project,
          totalVotes: project.products.reduce((sum, p) => 
            sum + p.production_levels.reduce((s, l) => s + (Number(l.current_votes) || 0), 0), 0
          )
        }))
        .sort((a, b) => b.totalVotes - a.totalVotes);
    },
  });

  const { data: fundedProjects = [] } = useQuery({
    queryKey: ['fundedProjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_images(image_url),
          products(production_levels(current_votes))
        `)
        .limit(10);
      
      if (error) throw error;
      
      return (data as Project[]).filter(project =>
        project.products.some(p =>
          p.production_levels.some(l => Number(l.current_votes) > 0)
        )
      );
    },
  });

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex flex-wrap gap-4 justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{t('marketplacePage.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('marketplacePage.subtitle')}</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              {t('nav.dashboard')}
            </Button>
            <Button variant="outline" onClick={signOut}>
              {t('nav.logout')}
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 space-y-12 max-w-full overflow-x-hidden">
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">{t('marketplacePage.newProjects')}</h2>
            </div>
            <Select value={newTimeFilter} onValueChange={(v) => setNewTimeFilter(v as TimeFilter)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">{t('marketplacePage.last24h')}</SelectItem>
                <SelectItem value="72h">{t('marketplacePage.last72h')}</SelectItem>
                <SelectItem value="1week">{t('marketplacePage.lastWeek')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Carousel className="w-full max-w-full" opts={{ align: "start" }}>
            <CarouselContent className="-ml-2 md:-ml-4">
              {newProjects.map((project) => (
                <CarouselItem key={project.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <EnhancedProjectCard project={project} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">{t('marketplacePage.trendingProjects')}</h2>
            </div>
            <Select value={trendingTimeFilter} onValueChange={(v) => setTrendingTimeFilter(v as TimeFilter)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">{t('marketplacePage.last24h')}</SelectItem>
                <SelectItem value="72h">{t('marketplacePage.last72h')}</SelectItem>
                <SelectItem value="1week">{t('marketplacePage.lastWeek')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Carousel className="w-full max-w-full" opts={{ align: "start" }}>
            <CarouselContent className="-ml-2 md:-ml-4">
              {trendingProjects.map((project) => (
                <CarouselItem key={project.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <EnhancedProjectCard project={project} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">{t('marketplacePage.fundedProjects')}</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {fundedProjects.map((project) => (
              <EnhancedProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}