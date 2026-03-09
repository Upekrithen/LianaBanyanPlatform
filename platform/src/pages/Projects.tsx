/**
 * PROJECTS SHOWCASE — Backable Projects with Funding Progress
 * =============================================================
 * Innovation #1549: Flagship Project Seeding (Session 8B)
 *
 * Full project showcase page with:
 * - Featured projects hero section
 * - Funding progress bars with backer counts
 * - "Back This Project" buttons (pledging with Credits)
 * - Category filtering
 * - Medallion eligibility badges
 * - Links to project detail pages and initiative landing pages
 *
 * SEC-safe: No investment, equity, or returns language.
 * All transactions are Credits → utility, not securities.
 */

import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProjectPledgeProgress } from '@/components/ProjectPledgeProgress';
import { GlobalBreadcrumbs } from '@/components/GlobalBreadcrumbs';
import {
  Loader2, Hexagon, ChefHat, Factory, Sparkles, ArrowRight,
  Users, TrendingUp, Heart, Shield, Package, LayoutDashboard,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════
// CATEGORY CONFIG
// ═══════════════════════════════════════════════════════════════════

const CATEGORY_CONFIG: Record<string, { icon: any; label: string; color: string }> = {
  manufacturing: { icon: Factory, label: 'Manufacturing', color: 'text-amber-600' },
  food: { icon: ChefHat, label: 'Food & Community', color: 'text-green-600' },
  technology: { icon: Package, label: 'Technology', color: 'text-blue-600' },
  default: { icon: Hexagon, label: 'Project', color: 'text-primary' },
};

// ═══════════════════════════════════════════════════════════════════
// LANDING PAGE ROUTES — Projects with dedicated landing pages
// ═══════════════════════════════════════════════════════════════════

const LANDING_ROUTES: Record<string, string> = {
  "Let's Make Dinner": '/lets-make-dinner',
  'Coaster Medallion': '/coaster-medallion',
};

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function Projects() {
  const navigate = useNavigate();
  const { user } = useAuth();

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

  const getCategoryConfig = (category?: string | null) =>
    CATEGORY_CONFIG[category || 'default'] || CATEGORY_CONFIG.default;

  const getProjectSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  return (
    <div className="min-h-screen bg-background">
      <GlobalBreadcrumbs />

      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
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
                  83.3% of every transaction. Cost+20% — no hidden fees, ever.
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
        {!isLoading && projects && projects.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {projects.map((project) => {
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

              return (
                <Card
                  key={project.id}
                  className="flex flex-col hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="space-y-2">
                    {/* Category + Medallion badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="gap-1">
                        <CatIcon className={`w-3 h-3 ${cat.color}`} />
                        {cat.label}
                      </Badge>
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
                    {/* Funding Progress */}
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
                    {/* Pledge Button */}
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

                    {/* Links */}
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

        {/* Empty State */}
        {!isLoading && (!projects || projects.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center space-y-4">
              <Hexagon className="w-12 h-12 text-muted-foreground mx-auto" />
              <h2 className="text-xl font-semibold">No Projects Yet</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Projects will appear here once they're seeded into the platform.
                Check back soon — flagship projects are on the way.
              </p>
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
    </div>
  );
}
