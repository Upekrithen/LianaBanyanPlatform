/**
 * PORTAL GATEWAY — Action-First Routing Hub
 * ================================================================
 * Session 27: Every card is a door, not a poster.
 * Verb-first CTAs. Explanations live in X-Ray Goggles only.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gamepad2, Printer, Rocket, Landmark, ArrowRight, Sprout,
  ShoppingBag, Users, Scroll, Building2, Heart, Search,
  CreditCard, Banknote, Check
} from 'lucide-react';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import './PortalGateway.css';

type PaymentChoice = 'lb-card' | 'existing-bank' | null;

export default function PortalGateway() {
  const navigate = useNavigate();
  const [earnFlipped, setEarnFlipped] = useState(false);
  const [paymentChoice, setPaymentChoice] = useState<PaymentChoice>(null);

  const handleEarnClick = () => {
    if (!earnFlipped) {
      setEarnFlipped(true);
    }
  };

  const handlePaymentSelect = (choice: PaymentChoice) => {
    setPaymentChoice(choice);
    // Store choice and navigate to treasure map questions (skip intro)
    if (choice) {
      localStorage.setItem('lb_payout_method', choice);
      // Small delay so the user sees the checkmark
      setTimeout(() => {
        navigate('/treasure-map?source=earn&skip=intro');
      }, 400);
    }
  };

  return (
    <PortalPageLayout variant="stage" maxWidth="xl" xrayId="portal-gateway">
      <div className="space-y-12">

        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            What do you want to do?
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Every door leads somewhere. Pick one.
          </p>
        </div>

        {/* Primary Actions — 2×2 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">

          {/* Earn Money — Flip Card */}
          <div
            className={`portal-earn-flip${earnFlipped ? ' portal-earn-flipped' : ''}`}
            onClick={!earnFlipped ? handleEarnClick : undefined}
            data-xray-id="portal-earn"
            style={{ perspective: '1000px' }}
          >
            <div className="portal-earn-flip-inner" style={{
              position: 'relative',
              transformStyle: 'preserve-3d',
              transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: earnFlipped ? 'rotateY(180deg)' : 'none',
              minHeight: earnFlipped ? '320px' : undefined,
            }}>
              {/* FRONT — Original Earn Money card */}
              <div
                className="group relative bg-card/50 border-2 border-border hover:border-green-500 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="bg-green-500/10 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                  <Gamepad2 className="w-7 h-7 text-green-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Earn Money</h3>
                <p className="text-sm text-muted-foreground mb-4">3 ways to start earning in 7–14 days.</p>
                <div className="flex items-center text-green-500 font-semibold text-sm">
                  Find My Path <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* BACK — Payment method selection */}
              <div
                className="absolute inset-0 bg-card border-2 border-green-500 rounded-2xl p-6 flex flex-col"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <h3 className="text-lg font-bold mb-1 text-center">How do you want to get paid?</h3>
                <p className="text-xs text-muted-foreground text-center mb-4">Pick one — you can change this later.</p>

                <div className="flex flex-col gap-3 flex-1">
                  {/* Option 1: LB Card */}
                  <button
                    type="button"
                    onClick={() => handlePaymentSelect('lb-card')}
                    className={`relative flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left cursor-pointer ${
                      paymentChoice === 'lb-card'
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-border hover:border-green-500/50 bg-card/50'
                    }`}
                  >
                    <div className="bg-green-500/10 w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                      <CreditCard className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">Get an LB Card</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        A virtual card funded by your earnings. Spend anywhere.
                      </div>
                    </div>
                    {paymentChoice === 'lb-card' && (
                      <Check className="w-5 h-5 text-green-500 shrink-0 mt-1" />
                    )}
                  </button>

                  {/* Option 2: Existing card/bank */}
                  <button
                    type="button"
                    onClick={() => handlePaymentSelect('existing-bank')}
                    className={`relative flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left cursor-pointer ${
                      paymentChoice === 'existing-bank'
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-border hover:border-green-500/50 bg-card/50'
                    }`}
                  >
                    <div className="bg-green-500/10 w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                      <Banknote className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">Use my existing card/bank</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        We'll send money directly to your existing debit card or bank account.
                      </div>
                    </div>
                    {paymentChoice === 'existing-bank' && (
                      <Check className="w-5 h-5 text-green-500 shrink-0 mt-1" />
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground mt-3 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEarnFlipped(false);
                    setPaymentChoice(null);
                  }}
                >
                  ← Back
                </button>
              </div>
            </div>
          </div>

          <div
            className="group relative bg-card/50 border-2 border-border hover:border-amber-500 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1"
            onClick={() => navigate('/build-a-business')}
            data-xray-id="portal-build"
          >
            <div className="bg-amber-500/10 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
              <Building2 className="w-7 h-7 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Build a Business</h3>
            <p className="text-sm text-muted-foreground mb-4">Launch a product with zero upfront cost.</p>
            <div className="flex items-center text-amber-500 font-semibold text-sm">
              Start Building <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            className="group relative bg-card/50 border-2 border-border hover:border-violet-500 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1"
            onClick={() => navigate('/plant-seeds')}
            data-xray-id="portal-plant"
          >
            <div className="bg-violet-500/10 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-colors">
              <Sprout className="w-7 h-7 text-violet-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Back a Project</h3>
            <p className="text-sm text-muted-foreground mb-4">Pre-order, earn Joules, watch it grow.</p>
            <div className="flex items-center text-violet-500 font-semibold text-sm">
              Plant a Seed <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            className="group relative bg-card/50 border-2 border-border hover:border-pink-500 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1"
            onClick={() => navigate('/sponsor')}
            data-xray-id="portal-sponsor"
          >
            <div className="bg-pink-500/10 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-500/20 transition-colors">
              <Heart className="w-7 h-7 text-pink-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Sponsor a Member</h3>
            <p className="text-sm text-muted-foreground mb-4">$5 gives someone a year of access.</p>
            <div className="flex items-center text-pink-500 font-semibold text-sm">
              Sponsor Now <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Secondary Actions — quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <button onClick={() => navigate('/projects')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card/30 border border-border hover:border-blue-500/50 hover:bg-card/50 transition-all text-muted-foreground hover:text-foreground">
            <Search className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-medium">Browse Projects</span>
          </button>
          <button onClick={() => navigate('/create')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card/30 border border-border hover:border-green-500/50 hover:bg-card/50 transition-all text-muted-foreground hover:text-foreground">
            <Rocket className="w-5 h-5 text-green-400" />
            <span className="text-xs font-medium">Create Project</span>
          </button>
          <button onClick={() => navigate('/guilds')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card/30 border border-border hover:border-amber-500/50 hover:bg-card/50 transition-all text-muted-foreground hover:text-foreground">
            <Users className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-medium">Join a Guild</span>
          </button>
          <button onClick={() => navigate('/bounties')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card/30 border border-border hover:border-purple-500/50 hover:bg-card/50 transition-all text-muted-foreground hover:text-foreground">
            <Scroll className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-medium">Bounty Board</span>
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground/70 mt-4">
          <button
            type="button"
            className="hover:underline hover:text-muted-foreground transition-colors"
            onClick={() => navigate("/treasure-map")}
          >
            Not sure? Join a Crew — find your path in 3 minutes →
          </button>
        </p>
      </div>
    </PortalPageLayout>
  );
}
