import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Store, Heart, BarChart3, FileText, Anchor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const TOTAL_STEPS = 5;

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
};

export default function LocalBusinessNodeCueCard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [location, setLocation] = useState('');
  const [reason, setReason] = useState('');

  const next = useCallback(() => { setDirection(1); setStep(s => Math.min(s + 1, TOTAL_STEPS)); }, []);
  const back = useCallback(() => { setDirection(-1); setStep(s => Math.max(s - 1, 1)); }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center p-4">
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
                    <Heart className="h-5 w-5 text-emerald-600" /> Pick a Business You Love
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="lb-name">Business Name</Label>
                    <Input id="lb-name" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g., Joe's Coffee House" />
                  </div>
                  <div>
                    <Label htmlFor="lb-type">Business Type</Label>
                    <Input id="lb-type" value={businessType} onChange={e => setBusinessType(e.target.value)} placeholder="e.g., Coffee shop, bookstore, bakery" />
                  </div>
                  <div>
                    <Label htmlFor="lb-loc">Location</Label>
                    <Input id="lb-loc" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., 123 Main St, Boise, ID" />
                  </div>
                  <div>
                    <Label htmlFor="lb-why">Why You Love Them</Label>
                    <Textarea id="lb-why" value={reason} onChange={e => setReason(e.target.value)} placeholder="Best pour-over in town..." rows={3} />
                  </div>
                  <Button onClick={next} disabled={!businessName.trim() || !location.trim()} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                    Next: Seed the Campaign <ArrowRight className="h-4 w-4 ml-1" />
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
                    <Store className="h-5 w-5 text-emerald-600" /> Seed the Campaign
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">💰</span>
                      <div>
                        <p className="text-sm font-medium text-emerald-800">Pledge your own Credits</p>
                        <p className="text-xs text-gray-600">Skin in the game — you believe in this place</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">🔒</span>
                      <div>
                        <p className="text-sm font-medium text-emerald-800">Optionally stake Marks</p>
                        <p className="text-xs text-gray-600">Captain pre-seed — shows you're serious</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">📤</span>
                      <div>
                        <p className="text-sm font-medium text-emerald-800">Share with your network</p>
                        <p className="text-xs text-gray-600">The more people who pledge, the stronger the signal</p>
                      </div>
                    </div>
                  </div>
                  <Button onClick={next} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                    Next: Watch Demand Grow <ArrowRight className="h-4 w-4 ml-1" />
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
                    <BarChart3 className="h-5 w-5 text-emerald-600" /> Watch Demand Grow
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg p-4 bg-white space-y-3">
                    <p className="text-sm font-medium text-gray-700">Campaign: {businessName || 'Your Business'}</p>
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Community pledges</span>
                        <span>42 / 100 people</span>
                      </div>
                      <Progress value={42} className="h-3" />
                    </div>
                    <p className="text-xs text-gray-500 italic">
                      Campaign page shows live pledge count. Community rallies around businesses they want.
                    </p>
                  </div>
                  <Button onClick={next} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                    Next: Generate Pitch Packet <ArrowRight className="h-4 w-4 ml-1" />
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
                    <FileText className="h-5 w-5 text-emerald-600" /> Generate the Pitch Packet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-3">
                    <p className="text-sm text-gray-700">When your campaign hits threshold:</p>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">📄</span>
                      <p className="text-sm text-gray-700">Download or print your <strong>Pitch Packet</strong></p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">📱</span>
                      <p className="text-sm text-gray-700">QR code on the packet links to your live campaign page</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">📊</span>
                      <p className="text-sm text-gray-700">Shows the business exactly how many people want to buy from them</p>
                    </div>
                  </div>
                  <Button onClick={next} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                    Next: Walk In and Close <ArrowRight className="h-4 w-4 ml-1" />
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
                    <Anchor className="h-5 w-5 text-emerald-600" /> Walk In and Close
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-4 space-y-3">
                    <p className="text-sm text-gray-700">Bring your <strong>LB Card</strong> + <strong>Pitch Packet</strong></p>
                    <blockquote className="border-l-4 border-emerald-400 pl-3 italic text-sm text-gray-700">
                      "This many people want to buy from you. Accept this card. Let's go."
                    </blockquote>
                    <p className="text-sm text-gray-700">Record the outcome:</p>
                    <div className="flex gap-2">
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded">Accepted</span>
                      <span className="text-xs text-gray-400 self-center">→ Business onboarded → you're a Captain</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => navigate('/campaigns/nominate', { state: { businessName, businessType, location, reason } })}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Start My Campaign
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
