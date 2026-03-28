import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Factory, Package, TrendingUp, Anchor, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const TOTAL_STEPS = 5;

const CAPABILITY_OPTIONS = [
  { value: 'fdm', label: '3D Printing (FDM/SLA/SLS)' },
  { value: 'cnc', label: 'CNC / Laser Cutting' },
  { value: 'injection', label: 'Injection Molding' },
  { value: 'woodworking', label: 'Woodworking' },
  { value: 'metalworking', label: 'Metalworking' },
  { value: 'sewing', label: 'Sewing / Textiles' },
  { value: 'other', label: 'Other' },
] as const;

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
};

export default function ManufacturingNodeCueCard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [capabilities, setCapabilities] = useState<string[]>([]);
  const [machines, setMachines] = useState('');
  const [materials, setMaterials] = useState('');
  const [capacity, setCapacity] = useState('');
  const [location, setLocation] = useState('');

  const next = useCallback(() => { setDirection(1); setStep(s => Math.min(s + 1, TOTAL_STEPS)); }, []);
  const back = useCallback(() => { setDirection(-1); setStep(s => Math.max(s - 1, 1)); }, []);

  const toggleCap = useCallback((val: string) => {
    setCapabilities(prev => prev.includes(val) ? prev.filter(c => c !== val) : [...prev, val]);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-zinc-100 flex items-center justify-center p-4">
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
                    <Wrench className="h-5 w-5 text-slate-600" /> What Can You Make?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {CAPABILITY_OPTIONS.map(opt => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-100 hover:border-slate-400 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <Checkbox
                        checked={capabilities.includes(opt.value)}
                        onCheckedChange={() => toggleCap(opt.value)}
                      />
                      <span className="text-sm font-medium text-gray-800">{opt.label}</span>
                    </label>
                  ))}
                  <Button onClick={next} disabled={capabilities.length === 0} className="w-full mt-4 bg-slate-700 hover:bg-slate-800 text-white">
                    Next: List Your Setup <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Factory className="h-5 w-5 text-slate-600" /> List Your Capabilities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="machines">Machines You Have</Label>
                    <Input id="machines" value={machines} onChange={e => setMachines(e.target.value)} placeholder="e.g., Prusa MK4, Creality Ender 3" />
                  </div>
                  <div>
                    <Label htmlFor="materials">Materials You Work With</Label>
                    <Input id="materials" value={materials} onChange={e => setMaterials(e.target.value)} placeholder="e.g., PLA, PETG, resin, hardwood" />
                  </div>
                  <div>
                    <Label htmlFor="capacity">Capacity (units/week)</Label>
                    <Input id="capacity" value={capacity} onChange={e => setCapacity(e.target.value)} placeholder="e.g., 50 small parts, 10 large" />
                  </div>
                  <div>
                    <Label htmlFor="location">Location (City, State)</Label>
                    <Input id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., Austin, TX" />
                  </div>
                  <Button onClick={next} disabled={!machines.trim() || !location.trim()} className="w-full bg-slate-700 hover:bg-slate-800 text-white">
                    Next: Accept Orders <ArrowRight className="h-4 w-4 ml-1" />
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
                    <Package className="h-5 w-5 text-slate-600" /> Accept Your First Orders
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">📋</span>
                      <p className="text-sm text-gray-700">Browse open production requests from creators who need parts made</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">🔒</span>
                      <p className="text-sm text-gray-700">Stake <strong>100 Marks</strong> as Captain collateral (returned on fulfillment)</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">📦</span>
                      <p className="text-sm text-gray-700">Accept your first batch — <strong>start with 10 units</strong></p>
                    </div>
                  </div>
                  <Button onClick={next} className="w-full bg-slate-700 hover:bg-slate-800 text-white">
                    Next: Fulfill & Scale <ArrowRight className="h-4 w-4 ml-1" />
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
                    <TrendingUp className="h-5 w-5 text-slate-600" /> Fulfill & Scale
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">✅</span>
                      <p className="text-sm text-gray-700">Produce → ship → delivery confirmed by 1/3 of recipients</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">🔓</span>
                      <p className="text-sm text-gray-700">Marks returned + reputation boost</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">📈</span>
                      <p className="text-sm text-gray-700 font-semibold">Graduate: 10 → 50 → 100 → 1,000</p>
                    </div>
                  </div>
                  <Button onClick={next} className="w-full bg-slate-700 hover:bg-slate-800 text-white">
                    Next: Production Cascade <ArrowRight className="h-4 w-4 ml-1" />
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
                    <Anchor className="h-5 w-5 text-slate-600" /> Production Cascade
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-br from-slate-50 to-zinc-100 border border-slate-200 rounded-lg p-4 space-y-3">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700"><strong>At 50+ orders:</strong> Consider SLS mold masters</p>
                      <p className="text-sm text-gray-700"><strong>At 500+:</strong> Injection molding partnership (FormNow / Xometry)</p>
                      <p className="text-sm text-gray-600 italic">The Tiered Production Cascade (#1943) activates</p>
                    </div>
                    <div className="border-t border-slate-200 pt-3">
                      <p className="text-xs text-gray-500">
                        3D print the prototype. Mold the winner. Inject at scale.
                        Every step earns reputation. Every step builds your factory.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button onClick={() => navigate('/production-runs')} className="w-full bg-slate-700 hover:bg-slate-800 text-white">
                      Browse Production Requests
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
