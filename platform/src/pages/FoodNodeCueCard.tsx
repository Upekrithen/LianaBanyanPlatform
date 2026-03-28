import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, UtensilsCrossed, Users, Target, Anchor, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const TOTAL_STEPS = 5;

const PLAY_OPTIONS = [
  { value: 'nominate', icon: '🍕', label: 'Nominate a restaurant I love', description: 'Rally your neighborhood behind a favorite local spot.' },
  { value: 'food-truck', icon: '🚚', label: 'I have a food truck / catering business', description: 'List your business and accept group orders.' },
  { value: 'ghost-kitchen', icon: '🍳', label: 'I want to cook from a commercial kitchen', description: 'Start a ghost kitchen operation through the platform.' },
  { value: 'captain', icon: '⚓', label: 'I want to coordinate food deliveries', description: 'Become a Captain — manage routes and group orders.' },
] as const;

type PlayType = typeof PLAY_OPTIONS[number]['value'];

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
};

export default function FoodNodeCueCard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [play, setPlay] = useState<PlayType | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [city, setCity] = useState('');
  const [reason, setReason] = useState('');

  const next = useCallback(() => { setDirection(1); setStep(s => Math.min(s + 1, TOTAL_STEPS)); }, []);
  const back = useCallback(() => { setDirection(-1); setStep(s => Math.max(s - 1, 1)); }, []);

  const handlePlay = useCallback((val: PlayType) => {
    setPlay(val);
    if (val === 'captain') {
      navigate('/captain/become');
      return;
    }
    if (val === 'food-truck' || val === 'ghost-kitchen') {
      navigate('/initiatives/lets-make-dinner/start-node');
      return;
    }
    setDirection(1);
    setStep(2);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="mb-4 flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => step === 1 ? navigate('/start/cold-start') : back()} className="text-muted-foreground">
            <ArrowLeft className="h-4 w-4 mr-1" /> {step === 1 ? 'All Paths' : 'Back'}
          </Button>
          <span className="text-xs text-gray-400 ml-auto">Step {step} of {TOTAL_STEPS}</span>
        </div>
        <Progress value={(step / TOTAL_STEPS) * 100} className="mb-6 h-2" />

        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <motion.div key="s1" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UtensilsCrossed className="h-5 w-5 text-orange-600" /> Pick Your Play
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {PLAY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handlePlay(opt.value)}
                      className="w-full flex items-start gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-orange-400 hover:bg-orange-50 transition-all text-left group"
                    >
                      <span className="text-2xl mt-0.5">{opt.icon}</span>
                      <div>
                        <span className="text-base font-medium text-gray-800 group-hover:text-orange-900 block">{opt.label}</span>
                        <span className="text-xs text-gray-500">{opt.description}</span>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Set Up Your Campaign</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="biz-name">Business Name</Label>
                    <Input id="biz-name" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g., Maria's Tacos" />
                  </div>
                  <div>
                    <Label htmlFor="biz-type">Business Type</Label>
                    <Input id="biz-type" value={businessType} onChange={e => setBusinessType(e.target.value)} placeholder="e.g., Mexican restaurant, food truck" />
                  </div>
                  <div>
                    <Label htmlFor="biz-city">City</Label>
                    <Input id="biz-city" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g., Boise, ID" />
                  </div>
                  <div>
                    <Label htmlFor="biz-reason">Why you love this place</Label>
                    <Textarea id="biz-reason" value={reason} onChange={e => setReason(e.target.value)} placeholder="Best street tacos in town..." rows={3} />
                  </div>
                  <Button onClick={next} disabled={!businessName.trim() || !city.trim()} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                    Next: Rally Your Crew <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-orange-600" /> Rally Your Crew
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium text-orange-800">Share your campaign link with neighbors:</p>
                    <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                      <li>Post in local Facebook groups and Nextdoor</li>
                      <li>Text friends who love this spot</li>
                      <li>Ask neighbors to pledge Credits</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4 bg-white">
                    <p className="text-xs text-gray-500 mb-1">Campaign progress</p>
                    <Progress value={35} className="h-3 mb-1" />
                    <p className="text-xs text-gray-500">Watch the demand bar grow as pledges come in</p>
                  </div>
                  <Button onClick={next} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                    Next: Close the Deal <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-600" /> Close the Deal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-700">At threshold: generate your <strong>Pitch Packet</strong></p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-700">Walk in with your <strong>LB Card</strong> + printed Pitch Packet</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-700">Tell them: <em>"This many people want to buy from you."</em></p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-700">Record the outcome — accepted or declined</p>
                    </div>
                  </div>
                  <Button onClick={next} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                    Next: Become a Captain <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="s5" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Anchor className="h-5 w-5 text-orange-600" /> Become a Food Captain
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">⚓</span>
                      <span className="font-semibold text-orange-800">Captain of 10</span>
                    </div>
                    <p className="text-sm text-gray-700">First successful onboarding → Captain of 10</p>
                    <p className="text-sm text-gray-700">Manage first 10 group orders</p>
                    <p className="text-sm text-gray-700">Confirm deliveries → reputation boost</p>
                    <div className="border-t border-orange-200 pt-3">
                      <p className="text-sm font-semibold text-orange-800">Then scale:</p>
                      <p className="text-sm text-gray-600">10 → 50 → 100 → 1,000</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button onClick={() => navigate('/campaigns/nominate', { state: { businessName, businessType, city, reason } })} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                      Launch My Campaign
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/captain/become')}>
                      Learn More About Captain
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
