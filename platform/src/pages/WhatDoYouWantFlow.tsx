import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useStartFlow, type StartFlowState } from '@/hooks/useCraftTreasureMaps';

const INTENT_OPTIONS = [
  { value: 'sell' as const, icon: '🛍️', label: 'SELL something I make' },
  { value: 'buy' as const, icon: '🛒', label: 'BUY something unique' },
  { value: 'support' as const, icon: '🤝', label: 'SUPPORT a creator' },
  { value: 'manufacture' as const, icon: '🏭', label: 'MANUFACTURE for others' },
  { value: 'cold-start' as const, icon: '🧊', label: 'COLD START — $0 to Captain' },
  { value: 'idea' as const, icon: '💡', label: "I have an idea but don't know where to start" },
];

const CRAFT_OPTIONS = [
  { value: 'terrain' as const, icon: '🏔️', label: 'Terrain / Miniatures' },
  { value: 'leather' as const, icon: '🧵', label: 'Leather Goods' },
  { value: 'kitchen' as const, icon: '🍳', label: 'Kitchen / Food' },
  { value: 'jewelry' as const, icon: '💎', label: 'Jewelry' },
  { value: 'board_games' as const, icon: '🎲', label: 'Board Games / Tabletop' },
  { value: 'woodworking' as const, icon: '🪵', label: 'Woodworking' },
  { value: 'digital' as const, icon: '💻', label: 'Digital (STLs, SVGs, Templates)' },
  { value: 'other' as const, icon: '✨', label: 'Something else' },
];

const READINESS_OPTIONS = [
  { value: 'idea' as const, icon: '💭', label: 'Just an idea' },
  { value: 'prototype' as const, icon: '🔨', label: 'I have a prototype' },
  { value: 'selling' as const, icon: '📦', label: "I'm already selling somewhere" },
  { value: 'scale' as const, icon: '🚀', label: 'I want to scale up' },
];

const READINESS_MESSAGES: Record<string, string> = {
  idea: "Starting from scratch? Perfect. We'll walk you through every step.",
  prototype: "You've got something to show? Great — start at Step 2.",
  selling: "Already selling? We'll fast-track you to Step 3.",
  scale: "Ready to grow? Jump to Step 4 — community and scaling.",
};

const CRAFT_LABELS: Record<string, string> = {
  terrain: 'Terrain Maker',
  leather: 'Leather Crafter',
  kitchen: 'Kitchen Creator',
  jewelry: 'Jewelry Maker',
  board_games: 'Board Game Designer',
  woodworking: 'Woodworker',
  digital: 'Digital Creator',
  other: 'Creator',
};

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
};

export default function WhatDoYouWantFlow() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getRoute, getStartStep, CRAFT_TO_SLUG } = useStartFlow();
  const [direction, setDirection] = useState(1);
  const [state, setState] = useState<StartFlowState>({
    step: 1,
    intent: null,
    craftType: null,
    readiness: null,
  });

  const handleIntent = useCallback((intent: StartFlowState['intent']) => {
    if (!intent) return;
    if (intent === 'cold-start') {
      navigate('/start/cold-start');
      return;
    }
    if (intent !== 'sell') {
      const route = getRoute({ ...state, intent, step: 'result' });
      navigate(route);
      return;
    }
    setDirection(1);
    setState(prev => ({ ...prev, intent, step: 2 }));
  }, [getRoute, navigate, state]);

  const handleCraft = useCallback((craftType: StartFlowState['craftType']) => {
    setDirection(1);
    setState(prev => ({ ...prev, craftType, step: 3 }));
  }, []);

  const handleReadiness = useCallback((readiness: StartFlowState['readiness']) => {
    setDirection(1);
    setState(prev => ({ ...prev, readiness, step: 'result' }));
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setState(prev => {
      if (prev.step === 'result') return { ...prev, step: 3, readiness: null };
      if (prev.step === 3) return { ...prev, step: 2, craftType: null };
      if (prev.step === 2) return { ...prev, step: 1, intent: null };
      return prev;
    });
  }, []);

  const handleGoToMap = useCallback(() => {
    const slug = state.craftType ? CRAFT_TO_SLUG[state.craftType] : null;
    if (slug) {
      const startStep = state.readiness ? getStartStep(state.readiness) : 1;
      navigate(`/treasure-map/${slug}?startAt=${startStep}`);
    } else {
      navigate('/cue-cards/campaigns');
    }
  }, [state, CRAFT_TO_SLUG, getStartStep, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {state.step !== 1 && state.step !== 'result' && (
          <Button variant="ghost" size="sm" onClick={goBack} className="mb-4 text-muted-foreground">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          {state.step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <Card className="border-0 shadow-xl">
                <CardContent className="p-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">What do you want to do?</h1>
                  <div className="space-y-3">
                    {INTENT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => handleIntent(opt.value)}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-amber-400 hover:bg-amber-50 transition-all text-left group"
                      >
                        <span className="text-2xl">{opt.icon}</span>
                        <span className="text-base font-medium text-gray-800 group-hover:text-amber-900">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {state.step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <Card className="border-0 shadow-xl">
                <CardContent className="p-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">What do you make?</h1>
                  <div className="space-y-3">
                    {CRAFT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => handleCraft(opt.value)}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-emerald-400 hover:bg-emerald-50 transition-all text-left group"
                      >
                        <span className="text-2xl">{opt.icon}</span>
                        <span className="text-base font-medium text-gray-800 group-hover:text-emerald-900">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {state.step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <Card className="border-0 shadow-xl">
                <CardContent className="p-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">How far along are you?</h1>
                  <div className="space-y-3">
                    {READINESS_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => handleReadiness(opt.value)}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
                      >
                        <span className="text-2xl">{opt.icon}</span>
                        <span className="text-base font-medium text-gray-800 group-hover:text-blue-900">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {state.step === 'result' && (
            <motion.div
              key="result"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <Card className="border-0 shadow-xl">
                <CardContent className="p-8 text-center">
                  <Sparkles className="h-10 w-10 text-amber-500 mx-auto mb-4" />
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Here's your Treasure Map!</h1>
                  <p className="text-lg font-semibold text-emerald-700 mb-1">
                    {state.craftType ? `${CRAFT_LABELS[state.craftType]}'s Treasure Map` : 'Your Path'}
                  </p>
                  {state.readiness && (
                    <p className="text-sm text-gray-600 mb-6">
                      {READINESS_MESSAGES[state.readiness]}
                    </p>
                  )}
                  <div className="flex flex-col gap-3">
                    <Button size="lg" onClick={handleGoToMap} className="bg-amber-600 hover:bg-amber-700 text-white">
                      View Your Map &rarr;
                    </Button>
                    <Button variant="ghost" size="sm" onClick={goBack}>
                      Go back
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-xs text-gray-400 mt-6">
          No account required to browse. Sign up free when you're ready.
        </p>
      </div>
    </div>
  );
}
