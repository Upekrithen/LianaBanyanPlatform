import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { TrendingUp, Sparkles, DollarSign, Factory, Shield, ArrowRight, Users, Coins, Loader2 } from 'lucide-react';
import { InviteCreatorCard } from '@/components/cue-cards/InviteCreatorCard';
import { EnhancedProjectCard } from '@/components/EnhancedProjectCard';
import { PreorderFundedBadge } from '@/components/ui/PreorderFundedBadge';

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

  const { data: newProjects = [], isLoading: loadingNew } = useQuery({
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

  const { data: trendingProjects = [], isLoading: loadingTrending } = useQuery({
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

  const { data: fundedProjects = [], isLoading: loadingFunded } = useQuery({
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
        <div className="flex justify-center">
          <PreorderFundedBadge />
        </div>
        {/* Factory & Patent Ownership Banner */}
        <section className="grid md:grid-cols-2 gap-6">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/factory')}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Factory className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">The Factory</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Decentralized manufacturing pipeline. From idea to physical product.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline">3D Printing</Badge>
                    <Badge variant="outline">Injection Molding</Badge>
                    <Badge variant="outline">CNC</Badge>
                  </div>
                  <Button size="sm" className="gap-2">
                    Enter Factory <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-purple-500/10 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/sponsor')}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">Own the Patents</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    1,401 patent claims. Sponsor the platform and own a piece of the IP.
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div className="text-center p-2 rounded bg-background/50">
                      <p className="font-bold">60%</p>
                      <p className="text-muted-foreground">Platform</p>
                    </div>
                    <div className="text-center p-2 rounded bg-background/50">
                      <p className="font-bold">20%</p>
                      <p className="text-muted-foreground">Sponsors</p>
                    </div>
                    <div className="text-center p-2 rounded bg-background/50">
                      <p className="font-bold">20%</p>
                      <p className="text-muted-foreground">Founder</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="gap-2 border-purple-500/30 text-purple-600 hover:bg-purple-500/10">
                    Become a Sponsor <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="md:col-span-2">
            <InviteCreatorCard />
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <Users className="h-6 w-6 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Active Nodes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Factory className="h-6 w-6 mx-auto text-green-500 mb-1" />
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Products Made</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Coins className="h-6 w-6 mx-auto text-amber-500 mb-1" />
              <p className="text-2xl font-bold">83.3%</p>
              <p className="text-xs text-muted-foreground">Creator Keeps</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Shield className="h-6 w-6 mx-auto text-purple-500 mb-1" />
              <p className="text-2xl font-bold">1,401</p>
              <p className="text-xs text-muted-foreground">Patent Claims</p>
            </CardContent>
          </Card>
        </section>

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
          
          {loadingNew ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : newProjects.length > 0 ? (
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
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No new projects in this time range. Try a wider filter.</p>
              </CardContent>
            </Card>
          )}
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

          {loadingTrending ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : trendingProjects.length > 0 ? (
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
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No trending projects yet. Create one and get the first votes!</p>
              </CardContent>
            </Card>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">{t('marketplacePage.fundedProjects')}</h2>
            </div>
          </div>

          {loadingFunded ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : fundedProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {fundedProjects.map((project) => (
                <EnhancedProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <DollarSign className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No backed projects yet. Browse new projects and sponsor what inspires you.</p>
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </div>
  );
}