/**
 * Defense Klaus WildFire Tour Demo
 *
 * 30-second "walk around and interact" demo before being whooshed back.
 * Part of the progressive disclosure onboarding - EVERYONE sees this.
 *
 * Teaches:
 * - What Defense Klaus is
 * - How the lock system works
 * - How to sign up
 * - The daisy chain referral system
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  Clock,
  Lock,
  Unlock,
  Sparkles,
  Users,
  ArrowRight,
  Mail,
  Check,
  Zap,
} from "lucide-react";

interface WildFireDemoProps {
  onComplete?: (signedUp: boolean, email?: string) => void;
  onWhoosh?: () => void;
  demoSeconds?: number;
}

const DEFAULT_DEMO_SECONDS = 30;

export function DefenseKlausWildFireDemo({
  onComplete,
  onWhoosh,
  demoSeconds = DEFAULT_DEMO_SECONDS
}: WildFireDemoProps) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [timeRemaining, setTimeRemaining] = useState(demoSeconds);
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState("");
  const [hasSignedUp, setHasSignedUp] = useState(false);
  const [demoLocks, setDemoLocks] = useState([true, true, true, true]);
  const [practiceCredits, setPracticeCredits] = useState(12);
  const [isWhooshing, setIsWhooshing] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0 || hasSignedUp) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up - whoosh back
          handleWhoosh();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, hasSignedUp]);

  // Handle whoosh back
  const handleWhoosh = useCallback(() => {
    setIsWhooshing(true);
    toast({
      title: "⏰ Time's Up!",
      description: "Your 30-second demo has ended. Sign up to explore more!",
    });

    setTimeout(() => {
      if (onWhoosh) onWhoosh();
      if (onComplete) onComplete(hasSignedUp, hasSignedUp ? email : undefined);
    }, 1500);
  }, [hasSignedUp, email, onWhoosh, onComplete, toast]);

  // Handle lock click
  const handleLockClick = (index: number) => {
    if (!demoLocks[index]) return;

    if (practiceCredits < 3) {
      toast({
        title: "Not Enough Credits",
        description: "Sign up to get more practice credits!",
      });
      return;
    }

    setPracticeCredits(prev => prev - 3);
    setDemoLocks(prev => {
      const newLocks = [...prev];
      newLocks[index] = false;
      return newLocks;
    });

    toast({
      title: "🔓 Lock Opened!",
      description: `${practiceCredits - 3} practice credits remaining.`,
    });
  };

  // Handle signup
  const handleSignUp = () => {
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setHasSignedUp(true);
    toast({
      title: "🛡️ You're In!",
      description: "Welcome to Defense Klaus. You now have 2 gift passes to share!",
    });

    if (onComplete) {
      onComplete(true, email);
    }
  };

  // Skip to signup
  const skipToSignup = () => {
    setCurrentStep(3);
  };

  const steps = [
    {
      title: "What is Defense Klaus?",
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="h-12 w-12 text-purple-400" />
            <div>
              <h3 className="font-bold text-white">Physical + Legal Protection</h3>
              <p className="text-sm text-white/60">For Someone You Love</p>
            </div>
          </div>
          <ul className="text-sm text-white/70 space-y-2">
            <li className="flex items-start gap-2">
              <Zap className="h-4 w-4 text-purple-400 mt-0.5" />
              $6 safety bracelet with pull-up palm claws
            </li>
            <li className="flex items-start gap-2">
              <Zap className="h-4 w-4 text-purple-400 mt-0.5" />
              GPS broadcast monitoring until safe arrival
            </li>
            <li className="flex items-start gap-2">
              <Zap className="h-4 w-4 text-purple-400 mt-0.5" />
              100% of proceeds fund pooled legal defense
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: "Try the Lock System",
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">Practice Credits:</span>
            <Badge variant="outline" className="text-blue-400 border-blue-400/50">
              {practiceCredits}
            </Badge>
          </div>

          <div className="relative w-48 h-64 mx-auto">
            {/* Demo Card */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-600/60 to-pink-600/60 border border-white/20 flex items-center justify-center">
              <Shield className="h-16 w-16 text-white/50" />
            </div>

            {/* Side Locks */}
            {[
              { pos: "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2", idx: 0 },
              { pos: "top-1/2 right-0 translate-x-1/2 -translate-y-1/2", idx: 1 },
              { pos: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2", idx: 2 },
              { pos: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2", idx: 3 },
            ].map(({ pos, idx }) => (
              <button
                key={idx}
                className={`absolute ${pos} w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  demoLocks[idx]
                    ? "bg-blue-500 border-2 border-blue-300 cursor-pointer hover:scale-110"
                    : "bg-green-500/50 border-2 border-green-400"
                }`}
                onClick={() => handleLockClick(idx)}
              >
                {demoLocks[idx] ? (
                  <Lock className="h-3 w-3 text-white" />
                ) : (
                  <Unlock className="h-3 w-3 text-green-200" />
                )}
              </button>
            ))}
          </div>

          <p className="text-xs text-center text-white/50">
            Click the locks to open them (3 credits each)
          </p>
        </div>
      ),
    },
    {
      title: "The Daisy Chain",
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Users className="h-10 w-10 text-pink-400" />
            <div>
              <h3 className="font-bold text-white">Share Protection</h3>
              <p className="text-sm text-white/60">2 gift passes per signup</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4 text-sm text-white/70 space-y-2">
            <p>
              When you sign up, you get <strong className="text-pink-400">2 gift passes</strong> to
              share with people you care about.
            </p>
            <p>
              They get the same deal — and their own 2 passes to share.
            </p>
            <p className="text-pink-300/80 italic">
              When everyone has Defense Klaus, no one stands out.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Sign Up Now",
      content: (
        <div className="space-y-4">
          {!hasSignedUp ? (
            <>
              <div className="space-y-2">
                <label className="text-sm text-white/70 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Enter your email
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-white/20"
                />
              </div>

              <Button
                onClick={handleSignUp}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Shield className="h-4 w-4 mr-2" />
                Get My Protection
              </Button>

              <p className="text-xs text-center text-white/40">
                Email only. No names, no demographics.
              </p>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <Check className="h-8 w-8 text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-white">You're Protected!</h3>
                <p className="text-sm text-white/60">
                  You now have 2 gift passes to share.
                </p>
              </div>
              <Button
                onClick={() => navigate("/initiatives/defense-klaus")}
                className="bg-pink-600 hover:bg-pink-700"
              >
                <Users className="h-4 w-4 mr-2" />
                Share with Others
              </Button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <AnimatePresence>
      {isWhooshing ? (
        <motion.div
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 0, scale: 0.5, rotate: 360 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="fixed inset-0 flex items-center justify-center bg-black/80 z-50"
        >
          <div className="text-center">
            <Sparkles className="h-16 w-16 text-purple-400 mx-auto animate-spin" />
            <p className="text-white mt-4">Whooshing back...</p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <Card className="bg-gray-900/90 border-purple-500/30">
            <CardHeader className="pb-2">
              {/* Timer */}
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-amber-400 border-amber-400/50">
                  <Clock className="h-3 w-3 mr-1" />
                  {timeRemaining}s remaining
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipToSignup}
                  className="text-xs text-white/50 hover:text-white"
                >
                  Skip to signup
                </Button>
              </div>

              {/* Progress */}
              <Progress value={((currentStep + 1) / steps.length) * 100} className="h-1" />

              <CardTitle className="text-lg mt-3">
                {steps[currentStep].title}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Step Content */}
              <div className="min-h-[200px]">
                {steps[currentStep].content}
              </div>

              {/* Navigation */}
              {!hasSignedUp && (
                <div className="flex justify-between pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                    disabled={currentStep === 0}
                    className="text-white/50"
                  >
                    Back
                  </Button>

                  {currentStep < steps.length - 1 ? (
                    <Button
                      onClick={() => setCurrentStep(prev => prev + 1)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default DefenseKlausWildFireDemo;
