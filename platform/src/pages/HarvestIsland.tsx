/**
 * HARVEST ISLAND — First Island in the HexIsle Journey
 *
 * "Get a job, start a business, or plant a seed."
 *
 * Each option includes a "Through the Looking Glass" practice mode.
 * The Mirror is your first portal — step through to practice before
 * committing real stakes. This is where you start building your Bridge.
 * 
 * Click the White Rabbit 🐰⏱️ to follow curated paths with Ghost Credits.
 * "The White Rabbit waits for no one" — rewards decay over time.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Briefcase, Store, Sprout, Ghost, X, 
  Sparkles, Map, ArrowRight, HelpCircle,
  Compass, Shield, Users, Lightbulb, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PortalPageLayout } from '@/components/PortalPageLayout';
type PathType = 'job' | 'business' | 'seed';

// Ghost World Practice Mirror Component
interface PracticeMirrorProps {
  isVisible: boolean;
  onClose: () => void;
  onEnterPractice: () => void;
  onStartGuidedPath: () => void;
  optionType: 'job' | 'business' | 'seed';
}

function PracticeMirror({ isVisible, onClose, onEnterPractice, onStartGuidedPath, optionType }: PracticeMirrorProps) {
  if (!isVisible) return null;

  const mirrorContent = {
    job: {
      title: "Practice Finding Work",
      description: "In the Ghost World, you can browse bounties, apply for positions, and see how the work system operates — all without real stakes.",
      features: ["Browse sample bounties", "Practice applications", "Learn the rating system", "No real credits at risk"],
      pathTitle: "The Bounty Hunter's Trail",
      pathSteps: 6,
      pathTime: "~20 min"
    },
    business: {
      title: "Practice Starting a Business",
      description: "Set up a practice Keep, configure your Cards, and learn how the marketplace works before committing real resources.",
      features: ["Create a practice Keep", "Configure sample Cards", "Test your pricing", "Simulate customer interactions"],
      pathTitle: "The Merchant's Journey",
      pathSteps: 7,
      pathTime: "~25 min"
    },
    seed: {
      title: "Practice Planting Seeds",
      description: "Start a practice project in the Ghost World. Watch how ideas evolve from Ember to Lightning without real commitment.",
      features: ["Submit practice ideas", "See the voting system", "Watch idea evolution", "Learn team formation"],
      pathTitle: "The Cultivator's Path",
      pathSteps: 6,
      pathTime: "~18 min"
    }
  };

  const content = mirrorContent[optionType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Card className="max-w-lg w-full bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 border-purple-500/50 shadow-[0_0_50px_rgba(139,92,246,0.3)]">
        <CardHeader className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 text-gray-400 hover:text-white"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Ghost className="h-8 w-8 text-purple-400" />
            </div>
            <div>
              <Badge className="bg-purple-500/30 text-purple-300 border-purple-500/50 mb-1">
                Through the Looking Glass
              </Badge>
              <CardTitle className="text-white">{content.title}</CardTitle>
            </div>
          </div>
          
          <CardDescription className="text-purple-200/80">
            {content.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* White Rabbit Guided Path Option */}
          <div 
            className="p-4 bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-lg border border-amber-500/40 cursor-pointer hover:border-amber-400/60 transition-all"
            onClick={onStartGuidedPath}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🐰</span>
                <span className="font-medium text-amber-200">Follow the White Rabbit</span>
                <Clock className="h-4 w-4 text-amber-400" />
              </div>
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/50">
                Recommended
              </Badge>
            </div>
            <p className="text-amber-300/80 text-sm mb-2">
              <strong>{content.pathTitle}</strong> — {content.pathSteps} steps, {content.pathTime}
            </p>
            <p className="text-amber-400/60 text-xs">
              Guided step-by-step with Ghost Credits. Earn real rewards at the end!
            </p>
          </div>

          {/* Practice Features */}
          <div className="grid grid-cols-2 gap-2">
            {content.features.map((feature, i) => (
              <div 
                key={i} 
                className="flex items-center gap-2 text-sm text-purple-200/70 bg-purple-500/10 rounded-lg p-2"
              >
                <Sparkles className="h-3 w-3 text-purple-400 flex-shrink-0" />
                {feature}
              </div>
            ))}
          </div>

          {/* The Mirror Quote */}
          <div className="p-4 bg-purple-900/30 rounded-lg border border-purple-500/30 text-center">
            <p className="text-purple-300 italic text-sm">
              "Through the Looking Glass you go — practice first, then watch it grow."
            </p>
            <p className="text-purple-400/60 text-xs mt-2">
              The White Rabbit waits for no one — claim your rewards promptly!
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
              onClick={onClose}
            >
              Continue to Real World
            </Button>
            <Button
              className="flex-1 bg-purple-600 hover:bg-purple-500 text-white"
              onClick={onEnterPractice}
            >
              <Ghost className="h-4 w-4 mr-2" />
              Free Exploration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main Harvest Island Component
export default function HarvestIsland() {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<'job' | 'business' | 'seed' | null>(null);
  const [showMirror, setShowMirror] = useState(false);
  const [showGuidedPath, setShowGuidedPath] = useState(false);
  const [guidedPathType, setGuidedPathType] = useState<PathType | null>(null);

  const handleOptionClick = (option: 'job' | 'business' | 'seed') => {
    setSelectedOption(option);
    setShowMirror(true);
  };

  const handleContinueReal = (option: 'job' | 'business' | 'seed') => {
    setShowMirror(false);
    switch (option) {
      case 'job':
        navigate('/opportunities');
        break;
      case 'business':
        navigate('/business-builder');
        break;
      case 'seed':
        navigate('/projects');
        break;
    }
  };

  const handleEnterPractice = () => {
    setShowMirror(false);
    navigate('/ghost-world', { state: { mode: selectedOption } });
  };

  // White Rabbit guided path handlers
  const handleStartGuidedPath = (pathType: PathType) => {
    setGuidedPathType(pathType);
    setShowGuidedPath(true);
    setShowMirror(false);
  };

  const handleGuidedPathComplete = (keptRewards: boolean) => {
    setShowGuidedPath(false);
    setGuidedPathType(null);
    // Could navigate somewhere or show a summary
    if (keptRewards) {
      navigate('/the-helm'); // Go to their Helm to see rewards
    }
  };

  const handleGuidedPathCancel = () => {
    setShowGuidedPath(false);
    setGuidedPathType(null);
  };

  // If showing guided path, render that instead
  if (showGuidedPath && guidedPathType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full bg-slate-900 border-amber-500/50">
          <CardHeader>
            <CardTitle className="text-amber-400">Guided Path</CardTitle>
            <CardDescription>Explore freely for now — the White Rabbit is preparing this path.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGuidedPathCancel} className="w-full">Return to Harvest Island</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const options = [
    {
      id: 'job' as const,
      title: 'Get a Job',
      subtitle: 'Find Work & Earn',
      description: 'Browse bounties, side quests, and opportunities. Apply your skills and earn Credits.',
      icon: Briefcase,
      color: 'green',
      bgGradient: 'from-green-600 to-emerald-700',
      borderColor: 'border-green-500/50',
      features: [
        { icon: Map, text: 'Browse Bounty Board' },
        { icon: Users, text: 'Join Project Teams' },
        { icon: Shield, text: 'Reputation Building' },
      ],
      cta: 'Find Opportunities'
    },
    {
      id: 'business' as const,
      title: 'Start a Business',
      subtitle: 'Your Keep Awaits',
      description: 'Set up your Keep on the island. Configure your Cards and serve customers.',
      icon: Store,
      color: 'blue',
      bgGradient: 'from-blue-600 to-indigo-700',
      borderColor: 'border-blue-500/50',
      features: [
        { icon: Store, text: 'Rent Your Keep' },
        { icon: Lightbulb, text: 'Configure Cards' },
        { icon: Compass, text: 'Local Marketplace' },
      ],
      cta: 'Build Your Keep'
    },
    {
      id: 'seed' as const,
      title: 'Plant a Seed',
      subtitle: 'Start a Project',
      description: 'Submit an idea to the Brainstorm. Watch it grow from Ember to Lightning.',
      icon: Sprout,
      color: 'amber',
      bgGradient: 'from-amber-600 to-orange-700',
      borderColor: 'border-amber-500/50',
      features: [
        { icon: Sparkles, text: 'Submit Ideas' },
        { icon: Users, text: 'Gather Support' },
        { icon: Lightbulb, text: 'Evolve to Project' },
      ],
      cta: 'Plant Your Seed'
    }
  ];

  return (
    <PortalPageLayout>
      {/* Atmospheric particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-green-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="border-b border-green-500/20 bg-black/30 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Sprout className="h-10 w-10 text-green-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Harvest Island</h1>
                <p className="text-green-300/80">
                  Where every journey begins — plant seeds, build, and grow
                </p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="border-green-500/50 text-green-300"
              onClick={() => navigate('/island-world-map')}
            >
              <Map className="h-4 w-4 mr-2" />
              World Map
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Welcome Message */}
        <div className="text-center mb-12">
          <Badge className="bg-green-500/20 text-green-300 border-green-500/50 mb-4">
            Island 1 of 7
          </Badge>
          <h2 className="text-4xl font-bold text-white mb-4">
            What brings you to Harvest Island?
          </h2>
          <p className="text-xl text-green-200/70 max-w-2xl mx-auto">
            Choose your path. Each leads to opportunity, and you can always explore the others later.
          </p>
        </div>

        {/* Three Options Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {options.map((option) => {
            const Icon = option.icon;
            
            return (
              <Card 
                key={option.id}
                className={cn(
                  "relative overflow-hidden cursor-pointer transition-all duration-300",
                  "hover:scale-105 hover:shadow-2xl",
                  "bg-gradient-to-br from-slate-900/90 to-slate-800/90",
                  option.borderColor,
                  "border-2"
                )}
                onClick={() => handleOptionClick(option.id)}
              >
                {/* Gradient header */}
                <div className={cn(
                  "h-32 bg-gradient-to-br flex items-center justify-center relative",
                  option.bgGradient
                )}>
                  <Icon className="h-16 w-16 text-white/90" />
                  
                  {/* White Rabbit Guided Path Indicator */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-amber-500/30 rounded-full border border-amber-400/50">
                    <span className="text-sm">🐰</span>
                    <Clock className="h-3 w-3 text-amber-300" />
                  </div>
                  
                  {/* Practice Mode Indicator (The Mirror) */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-purple-500/30 rounded-full border border-purple-400/50">
                    <Ghost className="h-3 w-3 text-purple-300" />
                    <span className="text-xs text-purple-200">Practice</span>
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl text-white">{option.title}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {option.subtitle}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-gray-300 text-sm">
                    {option.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2">
                    {option.features.map((feature, i) => {
                      const FeatureIcon = feature.icon;
                      return (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                          <FeatureIcon className={cn("h-4 w-4", `text-${option.color}-400`)} />
                          {feature.text}
                        </div>
                      );
                    })}
                  </div>

                  {/* CTA Button */}
                  <Button 
                    className={cn(
                      "w-full mt-4",
                      `bg-${option.color}-600 hover:bg-${option.color}-500`
                    )}
                    style={{
                      backgroundColor: option.id === 'job' ? '#16a34a' : 
                                       option.id === 'business' ? '#2563eb' : '#d97706'
                    }}
                  >
                    {option.cta}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Help Section */}
        <div className="mt-12 max-w-3xl mx-auto space-y-4">
          <Alert className="bg-amber-950/50 border-amber-500/30">
            <div className="flex items-center gap-2">
              <span className="text-xl">🐰</span>
              <Clock className="h-5 w-5 text-amber-400" />
            </div>
            <AlertTitle className="text-amber-200">Follow the White Rabbit</AlertTitle>
            <AlertDescription className="text-amber-300/80">
              Each path has a <strong>guided journey</strong> with Ghost Credits. Click any card, then 
              choose "Follow the White Rabbit" for step-by-step guidance. Earn real rewards at 
              the end — but claim them quickly! <em>The White Rabbit waits for no one.</em>
            </AlertDescription>
          </Alert>
          
          <Alert className="bg-purple-950/50 border-purple-500/30">
            <Ghost className="h-5 w-5 text-purple-400" />
            <AlertTitle className="text-purple-200">Through the Looking Glass</AlertTitle>
            <AlertDescription className="text-purple-300/80">
              Prefer to explore freely? Each option also has <strong>Free Exploration</strong> mode — 
              practice at your own pace, collect Cards for your Bridge, and learn the ropes with 
              zero risk before committing real Credits.
            </AlertDescription>
          </Alert>
        </div>

        {/* Cephas Help Link */}
        <div className="mt-8 text-center">
          <Button 
            variant="ghost" 
            className="text-green-400 hover:text-green-300"
            onClick={() => navigate('/cephas')}
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Need help? Ask Cephas
          </Button>
        </div>
      </div>

      {/* Practice Mirror Modal */}
      {selectedOption && (
        <PracticeMirror
          isVisible={showMirror}
          onClose={() => handleContinueReal(selectedOption)}
          onEnterPractice={handleEnterPractice}
          onStartGuidedPath={() => handleStartGuidedPath(selectedOption)}
          optionType={selectedOption}
        />
      )}
    </PortalPageLayout>
  );
}
