/**
 * PROJECTS SHOWCASE — Filterable Grid with Initiative & Category Filters
 * ======================================================================
 * Innovation #1549: Flagship Project Seeding (Session 8B)
 * Session 28: Added initiative filter bar, search, category toggle
 *
 * SEC-safe: No speculative-finance or ownership-claim language.
 * All transactions are Credits -> utility, not securities.
 */

import { useState, useMemo } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProjectPledgeProgress } from '@/components/ProjectPledgeProgress';
import { GlobalBreadcrumbs } from '@/components/GlobalBreadcrumbs';
import { SWEET_SIXTEEN } from '@/lib/daisyChainLink';
import {
  Loader2, Hexagon, ChefHat, Factory, Sparkles, ArrowRight,
  Users, TrendingUp, Heart, Shield, Package, LayoutDashboard,
  Search, X, Filter,
} from 'lucide-react';
import { PortalPageLayout } from '@/components/PortalPageLayout';

const CATEGORY_CONFIG: Record<string, { icon: any; label: string; color: string }> = {
  manufacturing: { icon: Factory, label: 'Manufacturing', color: 'text-amber-600' },
  food: { icon: ChefHat, label: 'Food & Community', color: 'text-green-600' },
  technology: { icon: Package, label: 'Technology', color: 'text-blue-600' },
  default: { icon: Hexagon, label: 'Project', color: 'text-primary' },
};

const LANDING_ROUTES: Record<string, string> = {
  "Let's Make Dinner": '/lets-make-dinner',
  'Coaster Medallion': '/coaster-medallion',
};

export default function Projects() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const initialInitiative = searchParams.get('initiative') || 'all';
  const [activeInitiative, setActiveInitiative] = useState(initialInitiative);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(true);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p) => {
      const matchesInit = activeInitiative === 'all' ||
        (p as any).initiative_slug === activeInitiative;
      const matchesSearch = !searchTerm ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        ((p as any).tagline || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesInit && matchesSearch;
    });
  }, [projects, activeInitiative, searchTerm]);

  const handleInitiativeFilter = (slug: string) => {
    setActiveInitiative(slug);
    if (slug === 'all') {
      searchParams.delete('initiative');
    } else {
      searchParams.set('initiative', slug);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const getCategoryConfig = (category?: string | null) =>
    CATEGORY_CONFIG[category || 'default'] || CATEGORY_CONFIG.default;

  const getProjectSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  return (
    <PortalPageLayout>
      <GlobalBreadcrumbs />

      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        {/* Hero */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="gap-1">
            <Heart className="w-3 h-3" />
            Back What Matters
          </Badge>
          <h1 className="text-4xl font-bold">Projects</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Back projects with Credits. Creators keep 83.3%. Every pledge
            moves production forward and earns you a Coaster Medallion.
          </p>
        </div>

        {/* Search + Filter Toggle */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            className="gap-1 shrink-0"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
            Initiatives
          </Button>
        </div>

        {/* Initiative Filter Bar */}
        {showFilters && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleInitiativeFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                activeInitiative === 'all'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted'
              }`}
            >
              All Projects
            </button>
            {SWEET_SIXTEEN.map((init) => (
              <button
                key={init.slug}
                onClick={() => handleInitiativeFilter(init.slug)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  activeInitiative === init.slug
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted'
                }`}
              >
                {init.emoji} {init.name}
              </button>
            ))}
          </div>
        )}

        {/* Active Filter Summary */}
        {(activeInitiative !== 'all' || searchTerm) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Showing {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}</span>
            {activeInitiative !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {SWEET_SIXTEEN.find(i => i.slug === activeInitiative)?.emoji}{' '}
                {SWEET_SIXTEEN.find(i => i.slug === activeInitiative)?.name}
                <button onClick={() => handleInitiativeFilter('all')}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {searchTerm && (
              <Badge variant="secondary" className="gap-1">
                &ldquo;{searchTerm}&rdquo;
                <button onClick={() => setSearchTerm('')}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Economics Banner */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-primary shrink-0 mt-1" />
              <div className="space-y-1">
                <h3 className="font-semibold">How Backing Works</h3>
                <p className="text-sm text-muted-foreground">
                  Pledge Credits to move projects through production levels.
                  More backers = lower unit costs for everyone. Creators keep
                  83.3% of every transaction. Cost+20% &mdash; no hidden fees, ever.
                  Credits are service tokens, not securities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Projects Grid */}
        {!isLoading && filteredProjects.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredProjects.map((project) => {
              const cat = getCategoryConfig((project as any).category);
              const CatIcon = cat.icon;
              const slug = getProjectSlug(project.name);
              const landingRoute = LANDING_ROUTES[project.name];
              const fundingGoal = (project as any).funding_goal || 0;
              const currentFunding = (project as any).current_funding || 0;
              const backerCount = (project as any).backer_count || 0;
              const tagline = (project as any).tagline;
              const medallionEligible = (project as any).medallion_eligible || false;
              const pct = fundingGoal > 0 ? Math.min(100, (currentFunding / fundingGoal) * 100) : 0;
              const initSlug = (project as any).initiative_slug;
              const initiative = initSlug ? SWEET_SIXTEEN.find(i => i.slug === initSlug) : null;

              return (
                <Card
                  key={project.id}
                  className="flex flex-col hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="gap-1">
                        <CatIcon className={`w-3 h-3 ${cat.color}`} />
                        {cat.label}
                      </Badge>
                      {initiative && (
                        <Badge
                          variant="outline"
                          className="gap-1 cursor-pointer hover:bg-primary/10"
                          onClick={() => handleInitiativeFilter(initiative.slug)}
                        >
                          {initiative.emoji} {initiative.name}
                        </Badge>
                      )}
                      {medallionEligible && (
                        <Badge variant="default" className="gap-1">
                          <Sparkles className="w-3 h-3" />
                          Medallion
                        </Badge>
                      )}
                    </div>

                    <CardTitle className="text-xl">
                      <Link
                        to={`/project/${slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {project.name}
                      </Link>
                    </CardTitle>

                    {tagline && (
                      <p className="text-sm font-semibold text-primary">
                        {tagline}
                      </p>
                    )}

                    <CardDescription className="line-clamp-3">
                      {project.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          <span className="font-semibold">
                            {currentFunding.toLocaleString()}
                          </span>
                          <span className="text-muted-foreground">
                            / {fundingGoal > 0 ? fundingGoal.toLocaleString() : '?'} Credits
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-3.5 h-3.5" />
                          <span>{backerCount} backers</span>
                        </div>
                      </div>
                      <Progress value={pct} className="h-2" />
                      <p className="text-xs text-muted-foreground text-right">
                        {pct.toFixed(1)}% funded
                      </p>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col gap-2">
                    <ProjectPledgeProgress
                      projectId={project.id}
                      projectName={project.name}
                      projectDescription={project.description || undefined}
                      projectTagline={tagline}
                      fundingGoal={fundingGoal}
                      currentFunding={currentFunding}
                      backerCount={backerCount}
                      medallionEligible={medallionEligible}
                      compact
                    />
                    <div className="flex gap-2 w-full">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 gap-1"
                        onClick={() => navigate(`/project/${slug}`)}
                      >
                        View Details
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                      {landingRoute && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 gap-1"
                          onClick={() => navigate(landingRoute)}
                        >
                          Landing Page
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty / No Results */}
        {!isLoading && filteredProjects.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center space-y-4">
              <Hexagon className="w-12 h-12 text-muted-foreground mx-auto" />
              <h2 className="text-xl font-semibold">
                {projects && projects.length > 0 ? 'No Matching Projects' : 'No Projects Yet'}
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {projects && projects.length > 0
                  ? 'Try adjusting your filters or search terms.'
                  : 'Projects will appear here once they\'re seeded into the platform. Check back soon \u2014 flagship projects are on the way.'}
              </p>
              {(activeInitiative !== 'all' || searchTerm) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { handleInitiativeFilter('all'); setSearchTerm(''); }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Back to Dashboard */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => navigate('/dashboard')}
          >
            <LayoutDashboard className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
      </main>
    </PortalPageLayout>
  );
}
