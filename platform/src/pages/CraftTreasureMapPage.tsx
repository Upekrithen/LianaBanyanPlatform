import { useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { MapPin, ArrowLeft, Shield, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCraftTreasureMap, useCraftTreasureMapProgress } from '@/hooks/useCraftTreasureMaps';
import { useAuth } from '@/contexts/AuthContext';
import { TreasureMapStepCard } from '@/components/treasure-map-craft/TreasureMapStep';
import { TreasureMapProgressBar } from '@/components/treasure-map-craft/TreasureMapProgressBar';
import { TreasureMapRecommendations } from '@/components/treasure-map-craft/TreasureMapRecommendations';
import { PortalPageLayout } from '@/components/PortalPageLayout';

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-100 text-emerald-800',
  intermediate: 'bg-amber-100 text-amber-800',
  advanced: 'bg-red-100 text-red-800',
};

export default function CraftTreasureMapPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const startAtParam = searchParams.get('startAt');
  const { user } = useAuth();
  const { map, progress, isLoading } = useCraftTreasureMap(slug);
  const { toggleStep } = useCraftTreasureMapProgress();

  const completedSteps: number[] = useMemo(() => {
    if (!progress) return [];
    return (progress.completed_steps || []) as number[];
  }, [progress]);

  const suggestedStartStep = startAtParam ? parseInt(startAtParam, 10) : 1;
  const currentStep = progress ? progress.current_step : suggestedStartStep;

  const steps = useMemo(() => {
    if (!map) return [];
    const raw = (typeof map.steps === 'string' ? JSON.parse(map.steps) : map.steps) as { order: number; title: string; description: string; link: string; time_estimate: string; cost_estimate: string }[];
    return raw.sort((a, b) => a.order - b.order);
  }, [map]);

  if (isLoading) {
    return (
      <PortalPageLayout title="Loading..." maxWidth="xl">
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading your Treasure Map...</div>
        </div>
      </PortalPageLayout>
    );
  }

  if (!map) {
    return (
      <PortalPageLayout title="Not Found" maxWidth="xl">
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
          <p className="text-gray-500">This Treasure Map doesn't exist yet.</p>
          <Link to="/start">
            <Button>Find Your Path</Button>
          </Link>
        </div>
      </PortalPageLayout>
    );
  }

  const handleToggle = (stepOrder: number) => {
    if (!user || !map) return;
    const isCompleted = completedSteps.includes(stepOrder);
    toggleStep.mutate({ mapId: map.id, stepOrder, completed: !isCompleted });
  };

  return (
    <PortalPageLayout title={map.title} maxWidth="xl" backButton>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <span className="text-4xl">{map.icon}</span>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900">{map.title}</h1>
              <p className="text-base text-gray-600 italic mt-1">"{map.tagline}"</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className={DIFFICULTY_COLORS[map.difficulty] || ''}>
                  <Shield className="h-3 w-3 mr-1" />
                  {map.difficulty.charAt(0).toUpperCase() + map.difficulty.slice(1)}
                </Badge>
                {map.time_commitment && (
                  <Badge variant="outline" className="text-gray-600">
                    <Clock className="h-3 w-3 mr-1" /> {map.time_commitment}
                  </Badge>
                )}
                {map.first_sale_timeline && (
                  <Badge variant="outline" className="text-gray-600">
                    <TrendingUp className="h-3 w-3 mr-1" /> First sale: {map.first_sale_timeline}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <TreasureMapProgressBar totalSteps={steps.length} completedCount={completedSteps.length} />

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step) => {
              const isCompleted = completedSteps.includes(step.order);
              const isCurrent = step.order === currentStep && !isCompleted;
              const isLocked = step.order > currentStep && !isCompleted;

              return (
                <TreasureMapStepCard
                  key={step.order}
                  step={step}
                  isCompleted={isCompleted}
                  isCurrent={isCurrent}
                  isLocked={isLocked}
                  isAuthenticated={!!user}
                  onToggle={() => handleToggle(step.order)}
                />
              );
            })}
          </div>

          {!user && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center">
              <p className="text-sm text-amber-800 mb-2">Sign in to track your progress and save completed steps.</p>
              <Link to="/auth">
                <Button size="sm" variant="outline" className="border-amber-400 text-amber-800 hover:bg-amber-100">
                  Sign In / Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <TreasureMapRecommendations map={map} />

          <div className="rounded-xl bg-gray-50 border p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-600" />
              Quick Links
            </h3>
            <Link to="/start" className="block text-sm text-amber-700 hover:text-amber-900 hover:underline">
              &larr; Back to "What Do You Want to Do?"
            </Link>
            <Link to="/cue-cards/campaigns" className="block text-sm text-amber-700 hover:text-amber-900 hover:underline">
              Browse Cue Card Campaigns
            </Link>
            <Link to="/projects" className="block text-sm text-amber-700 hover:text-amber-900 hover:underline">
              Browse Turn-Key Projects
            </Link>
            <Link to="/marketplace" className="block text-sm text-amber-700 hover:text-amber-900 hover:underline">
              Visit the Marketplace
            </Link>
          </div>
        </div>
      </div>
    </PortalPageLayout>
  );
}
