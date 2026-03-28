/**
 * Treasure Map Guide — Step-by-step guide with tracked progression + knowledge quiz gate.
 * Route: /treasure-maps/:mapId
 */

import { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BeaconDropButton } from '@/components/BeaconDropButton';
import {
  ArrowLeft, CheckCircle, Map, Wrench, TrendingUp, Star, AlertTriangle, Sparkles,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TREASURE_MAP_GUIDES } from '@/data/treasureMapGuides';
import { TreasureMapKnowledgeQuiz } from '@/components/treasure-map/TreasureMapKnowledgeQuiz';

const PHASE_ORDER = ['scout', 'pitch', 'launch', 'expand'];

type ProgressRow = {
  id: string;
  user_id: string;
  map_id: string;
  current_phase: string;
  current_level: number;
  phase_data: Record<string, Record<string, boolean>>;
  quiz_score: number | null;
  quiz_attempts: number;
  started_at: string;
  last_activity_at: string;
  completed_at: string | null;
};

export default function TreasureMapGuide() {
  const { mapId } = useParams<{ mapId: string }>();
  const guide = mapId ? TREASURE_MAP_GUIDES[mapId] : null;
  const queryClient = useQueryClient();
  const [showQuiz, setShowQuiz] = useState(false);

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['treasure-map-progress', mapId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !mapId) return null;
      const { data } = await supabase
        .from('treasure_map_progress' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('map_id', mapId)
        .maybeSingle();
      return data as ProgressRow | null;
    },
  });

  const handleToggleStep = useCallback(async (phaseIdx: number, stepIdx: number) => {
    if (!progress || !mapId || !guide) return;
    const phaseName = PHASE_ORDER[phaseIdx] || guide.phases[phaseIdx]?.name.toLowerCase();
    const stepKey = String(stepIdx);
    const phaseData = { ...(progress.phase_data || {}) };
    const phaseSteps = { ...(phaseData[phaseName] || {}) };
    phaseSteps[stepKey] = !phaseSteps[stepKey];
    phaseData[phaseName] = phaseSteps;

    const totalStepsInPhase = guide.phases[phaseIdx]?.steps.length || 0;
    const completedInPhase = Object.values(phaseSteps).filter(Boolean).length;
    const phaseComplete = completedInPhase >= totalStepsInPhase;

    let newPhase = progress.current_phase;
    let newLevel = progress.current_level;
    if (phaseComplete && phaseIdx < PHASE_ORDER.length - 1) {
      const nextPhaseIdx = PHASE_ORDER.indexOf(progress.current_phase);
      if (phaseIdx >= nextPhaseIdx) {
        newPhase = PHASE_ORDER[phaseIdx + 1];
        newLevel = Math.min(phaseIdx + 2, 4);
        toast.success(`Phase complete! Welcome to ${newPhase.charAt(0).toUpperCase() + newPhase.slice(1)} phase.`);
      }
    }

    const allPhasesComplete = PHASE_ORDER.every((pn, pi) => {
      const steps = phaseData[pn] || {};
      const total = guide.phases[pi]?.steps.length || 0;
      return Object.values(steps).filter(Boolean).length >= total;
    });

    await supabase
      .from('treasure_map_progress' as any)
      .update({
        phase_data: phaseData,
        current_phase: newPhase,
        current_level: newLevel,
        last_activity_at: new Date().toISOString(),
        completed_at: allPhasesComplete ? new Date().toISOString() : null,
      } as any)
      .eq('id', progress.id);

    queryClient.invalidateQueries({ queryKey: ['treasure-map-progress', mapId] });
  }, [progress, mapId, guide, queryClient]);

  const handleQuizComplete = useCallback(async (score: number) => {
    if (!progress) return;
    const newAttempts = (progress.quiz_attempts || 0) + 1;
    const bestScore = Math.max(score, progress.quiz_score || 0);

    await supabase
      .from('treasure_map_progress' as any)
      .update({
        quiz_score: bestScore,
        quiz_attempts: newAttempts,
        last_activity_at: new Date().toISOString(),
      } as any)
      .eq('id', progress.id);

    queryClient.invalidateQueries({ queryKey: ['treasure-map-progress', mapId] });

    if (score >= 3) {
      toast.success('Quiz passed! You can advance to the next phase.');
    }
  }, [progress, mapId, queryClient]);

  const handleStartTracking = useCallback(async () => {
    if (!mapId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please sign in to track your progress.');
      return;
    }
    await supabase.from('treasure_map_progress' as any).upsert(
      { user_id: user.id, map_id: mapId, current_phase: 'scout', current_level: 1, phase_data: {} } as any,
      { onConflict: 'user_id,map_id' } as any,
    );
    queryClient.invalidateQueries({ queryKey: ['treasure-map-progress', mapId] });
    toast.success('Progress tracking started!');
  }, [mapId, queryClient]);

  const currentPhaseIdx = progress ? PHASE_ORDER.indexOf(progress.current_phase) : 0;
  const isStepChecked = (phaseIdx: number, stepIdx: number): boolean => {
    if (!progress?.phase_data) return false;
    const phaseName = PHASE_ORDER[phaseIdx];
    return !!progress.phase_data[phaseName]?.[String(stepIdx)];
  };

  const getPhaseCompletionCount = (phaseIdx: number): number => {
    if (!progress?.phase_data) return 0;
    const phaseName = PHASE_ORDER[phaseIdx];
    const steps = progress.phase_data[phaseName] || {};
    return Object.values(steps).filter(Boolean).length;
  };

  if (!guide) {
    return (
      <PortalPageLayout variant="stage" maxWidth="lg" xrayId="treasure-map-guide">
        <Link to="/treasure-maps" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> All Treasure Maps
        </Link>
        <div className="text-center py-16">
          <Map className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-xl font-bold">Map not found</p>
          <p className="text-muted-foreground mt-2">This treasure map doesn't exist.</p>
        </div>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout variant="stage" maxWidth="lg" xrayId="treasure-map-guide">
      <Link to="/treasure-maps" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> All Treasure Maps
      </Link>

      {/* Hero */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">{guide.title}</h1>
          <BeaconDropButton compact />
        </div>
        <p className="text-lg text-muted-foreground">{guide.subtitle}</p>
      </div>

      {/* Who this is for */}
      <Card className="bg-amber-950/20 border-amber-800/30 mb-6">
        <CardContent className="py-4 px-6">
          <p className="text-sm">
            <span className="font-semibold text-amber-400">Who this is for:</span>{' '}
            <span className="text-muted-foreground">{guide.whoThisIsFor}</span>
          </p>
        </CardContent>
      </Card>

      {/* What you need */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-500" /> What You Need
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {guide.whatYouNeed.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Economics */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-500" /> Economics
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {guide.economics.map((row, i) => (
            <Card key={i} className="bg-card/50 border-border">
              <CardContent className="py-3 px-4">
                <p className="text-xs text-muted-foreground">{row.label}</p>
                <p className="text-sm font-semibold mt-0.5">{row.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Start tracking CTA (if no progress yet) */}
      {!progressLoading && !progress && (
        <Card className="bg-amber-950/20 border-amber-800/30 mb-6">
          <CardContent className="py-4 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-amber-400">Track Your Progress</p>
              <p className="text-xs text-muted-foreground">Sign in to save checklist progress and unlock the knowledge quiz.</p>
            </div>
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white shrink-0" onClick={handleStartTracking}>
              <Sparkles className="w-4 h-4 mr-2" /> Start Tracking
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Progress summary bar */}
      {progress && (
        <Card className="bg-emerald-950/20 border-emerald-800/30 mb-6">
          <CardContent className="py-4 px-6">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <Badge className="bg-amber-600/20 text-amber-400 border-amber-500/30">
                Level {progress.current_level}
              </Badge>
              <span className="text-muted-foreground">
                Phase: <strong className="text-foreground capitalize">{progress.current_phase}</strong>
              </span>
              {progress.quiz_score != null && (
                <span className="text-muted-foreground">
                  Quiz best: <strong className="text-foreground">{progress.quiz_score}/5</strong>
                </span>
              )}
              {progress.completed_at && (
                <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-500/30">
                  <CheckCircle className="w-3 h-3 mr-1" /> Completed
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Phases with tracked checklists */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Map className="w-5 h-5 text-amber-500" /> The Path
        </h2>
        <Accordion
          type="multiple"
          defaultValue={progress ? [`phase-${Math.max(0, currentPhaseIdx)}`] : ['phase-0']}
        >
          {guide.phases.map((phase, pi) => {
            const completedSteps = getPhaseCompletionCount(pi);
            const totalSteps = phase.steps.length;
            const phaseIsDone = completedSteps >= totalSteps;
            const isCurrentPhase = pi === currentPhaseIdx;
            const isFuturePhase = pi > currentPhaseIdx && !!progress;

            return (
              <AccordionItem key={pi} value={`phase-${pi}`}>
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center gap-2">
                    {phaseIsDone && progress ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : (
                      <Badge
                        variant="outline"
                        className={`text-[10px] w-6 h-6 flex items-center justify-center rounded-full p-0 ${
                          isCurrentPhase ? 'border-amber-500 text-amber-400' : ''
                        }`}
                      >
                        {pi + 1}
                      </Badge>
                    )}
                    <span className={isFuturePhase ? 'text-muted-foreground' : ''}>
                      {phase.name}
                    </span>
                    {progress && (
                      <span className="text-xs text-muted-foreground ml-auto mr-2">
                        {completedSteps}/{totalSteps}
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pl-8">
                    {phase.steps.map((step, si) => {
                      const checked = isStepChecked(pi, si);
                      const toolMatch = step.detail.match(/Storefront Builder|Cue Card|Runner Dashboard|Design Arena|Emporium/i);
                      const toolRoute = toolMatch
                        ? guide.toolLinks.find(t => step.detail.toLowerCase().includes(t.name.toLowerCase()))?.route
                        : null;

                      return (
                        <div key={si} className="flex items-start gap-3">
                          {progress ? (
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() => handleToggleStep(pi, si)}
                              className="mt-0.5 shrink-0"
                            />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-2" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${checked ? 'line-through text-muted-foreground' : ''}`}>
                              {step.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">{step.detail}</p>
                            {toolRoute && (
                              <Link to={toolRoute} className="inline-flex items-center gap-1 text-xs text-amber-500 hover:underline mt-1">
                                <Wrench className="w-3 h-3" /> Open tool →
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Knowledge quiz gate at end of Scout phase */}
                    {pi === 0 && progress && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold text-amber-400">Ready to advance?</p>
                          {!showQuiz && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-amber-500/40 text-amber-400"
                              onClick={() => setShowQuiz(true)}
                            >
                              Take Knowledge Quiz
                            </Button>
                          )}
                        </div>
                        {showQuiz && (
                          <TreasureMapKnowledgeQuiz
                            mapId={mapId || 'general'}
                            currentAttempts={progress.quiz_attempts}
                            bestScore={progress.quiz_score ?? undefined}
                            onComplete={handleQuizComplete}
                          />
                        )}
                        {!showQuiz && progress.quiz_score != null && progress.quiz_score >= 3 && (
                          <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-500/30">
                            <CheckCircle className="w-3 h-3 mr-1" /> Quiz passed ({progress.quiz_score}/5)
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>

      {/* Level progression */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" /> Level Progression
        </h2>
        <div className="space-y-2">
          {guide.levelProgression.map((level, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-card/30 border border-border/50">
              <Badge className="bg-amber-600/20 text-amber-400 border-amber-500/30 text-[10px] w-8 h-8 flex items-center justify-center rounded-full p-0">
                L{i + 1}
              </Badge>
              <div>
                <p className="text-sm font-medium">{level.name}</p>
                <p className="text-xs text-muted-foreground">{level.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Allocation Authority */}
      <Card className="bg-emerald-950/20 border-emerald-800/30 mb-8">
        <CardContent className="py-4 px-6">
          <p className="text-sm font-semibold text-emerald-400 mb-1">Your Allocation Authority</p>
          <p className="text-xs text-muted-foreground">
            Every business you onboard generates Backed Marks — 3% of the platform's share becomes your governance influence.
            Your direct earnings (delivery fees, management fees) are separate and paid in real money.
            Backed Marks give you a voice in how the cooperative grows.
          </p>
        </CardContent>
      </Card>

      {/* Tool links */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-blue-500" /> Your Tools
        </h2>
        <div className="grid gap-2">
          {guide.toolLinks.map((tool, i) => (
            <Link key={i} to={tool.route}>
              <Card className="bg-card/50 border-border hover:border-amber-500/30 transition-colors cursor-pointer">
                <CardContent className="py-3 px-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{tool.name}</p>
                    <p className="text-xs text-muted-foreground">{tool.description}</p>
                  </div>
                  <span className="text-muted-foreground">→</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* SEC disclaimer */}
      <p className="text-[10px] text-muted-foreground/60 text-center">
        Earnings represent service compensation. Backed Marks represent cooperative governance authority, not investment returns.
        Actual results depend on effort, market conditions, and business participation. This is not an investment opportunity.
      </p>
    </PortalPageLayout>
  );
}
