import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Wrench, Calendar, Star, Anchor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const TOTAL_STEPS = 4;

const SERVICE_OPTIONS = [
  { value: 'plumbing', icon: '🔧', label: 'Plumbing / HVAC' },
  { value: 'electrical', icon: '⚡', label: 'Electrical' },
  { value: 'auto', icon: '🚗', label: 'Auto Repair / Maintenance' },
  { value: 'tutoring', icon: '📚', label: 'Tutoring / Education' },
  { value: 'cleaning', icon: '🧹', label: 'Cleaning (Home / Commercial)' },
  { value: 'pet', icon: '🐾', label: 'Pet Services (Grooming / Sitting / Walking)' },
  { value: 'fitness', icon: '💪', label: 'Personal Training / Fitness' },
  { value: 'photo', icon: '📷', label: 'Photography / Videography' },
  { value: 'other', icon: '✨', label: 'Other' },
] as const;

type ServiceType = typeof SERVICE_OPTIONS[number]['value'];

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
};

export default function ServiceNodeCueCard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [service, setService] = useState<ServiceType | null>(null);
  const [serviceArea, setServiceArea] = useState('');
  const [hours, setHours] = useState('');
  const [pricing, setPricing] = useState('');
  const [certs, setCerts] = useState('');

  const next = useCallback(() => { setDirection(1); setStep(s => Math.min(s + 1, TOTAL_STEPS)); }, []);
  const back = useCallback(() => { setDirection(-1); setStep(s => Math.max(s - 1, 1)); }, []);

  const handleService = useCallback((val: ServiceType) => {
    setService(val);
    setDirection(1);
    setStep(2);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
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
                    <Wrench className="h-5 w-5 text-blue-600" /> What Do You Do?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {SERVICE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleService(opt.value)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-gray-100 hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
                    >
                      <span className="text-xl">{opt.icon}</span>
                      <span className="text-sm font-medium text-gray-800 group-hover:text-blue-900">{opt.label}</span>
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
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" /> Set Your Availability
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="svc-area">Service Area (zip codes or radius)</Label>
                    <Input id="svc-area" value={serviceArea} onChange={e => setServiceArea(e.target.value)} placeholder="e.g., 83702, 83706 or 15-mile radius" />
                  </div>
                  <div>
                    <Label htmlFor="svc-hours">Hours Available</Label>
                    <Input id="svc-hours" value={hours} onChange={e => setHours(e.target.value)} placeholder="e.g., Mon–Fri 8am–5pm" />
                  </div>
                  <div>
                    <Label htmlFor="svc-pricing">Pricing (hourly or per-job)</Label>
                    <Input id="svc-pricing" value={pricing} onChange={e => setPricing(e.target.value)} placeholder="e.g., $45/hr or $150 flat rate" />
                  </div>
                  <div>
                    <Label htmlFor="svc-certs">Certifications / Licenses (optional)</Label>
                    <Input id="svc-certs" value={certs} onChange={e => setCerts(e.target.value)} placeholder="e.g., Licensed plumber, CPR cert" />
                  </div>
                  <Button onClick={next} disabled={!serviceArea.trim()} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Next: Get Clients <ArrowRight className="h-4 w-4 ml-1" />
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
                    <Star className="h-5 w-5 text-blue-600" /> Get Your First Clients
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">🎯</span>
                      <p className="text-sm text-gray-700">Platform matches you to local requests in your area</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">🔒</span>
                      <p className="text-sm text-gray-700">Stake <strong>50 Marks</strong> as reliability collateral (returned after 10 completed jobs)</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">📋</span>
                      <p className="text-sm text-gray-700">Accept your first <strong>10 bookings</strong></p>
                    </div>
                  </div>
                  <Button onClick={next} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Next: Build Reputation <ArrowRight className="h-4 w-4 ml-1" />
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
                    <Anchor className="h-5 w-5 text-blue-600" /> Build Reputation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4 space-y-3">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700">Complete service → client confirms → <strong>reputation boost</strong></p>
                      <p className="text-sm text-gray-700">ADAPT Score increases with each confirmed job</p>
                    </div>
                    <div className="border-t border-blue-200 pt-3">
                      <p className="text-sm font-semibold text-blue-800">Graduate:</p>
                      <div className="flex items-center gap-2 mt-1">
                        {['10', '50', '100'].map((n, i) => (
                          <span key={n} className="flex items-center gap-1">
                            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">{n}</span>
                            {i < 2 && <ArrowRight className="h-3 w-3 text-gray-400" />}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button onClick={() => navigate('/side-quests')} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Browse Service Requests
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
