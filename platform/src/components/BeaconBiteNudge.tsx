/**
 * Beacon Bite 1 — Interactive first-encounter tutorial.
 * Multi-step animated flow:
 *  Step 0: Denken peeks with speech bubble "Want to save this for later? Drop a beacon."
 *  Step 1: User taps golden beacon → card slides right toward Denken → Denken glows gold
 *  Step 2: "Got it. Click me anytime." → "Now you try" prompt
 *  Step 3: User clicks Denken → card slides back → complete
 *  Final: [OK Let's Roll] / [Show Me Again]
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { X, MapPin } from 'lucide-react';

const BITE1_KEY = 'beacon_bite1_complete';

type BiteStep = 'peek' | 'dropped' | 'try-it' | 'retrieved' | 'done';

export function BeaconBiteNudge() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<BiteStep>('peek');

  useEffect(() => {
    if (!user) return;
    if (localStorage.getItem(BITE1_KEY) === 'true') return;

    const timer = setTimeout(async () => {
      const { count } = await supabase
        .from('beacons')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .then(r => ({ count: r.count || 0 }));

      if (count === 0) setVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [user]);

  const complete = useCallback(() => {
    localStorage.setItem(BITE1_KEY, 'true');
    setVisible(false);
  }, []);

  const handleDropBeacon = useCallback(() => {
    setStep('dropped');
    setTimeout(() => setStep('try-it'), 1800);
  }, []);

  const handleDenkenClick = useCallback(() => {
    if (step === 'try-it') {
      setStep('retrieved');
      setTimeout(() => setStep('done'), 1200);
    }
  }, [step]);

  const handleReplay = useCallback(() => {
    setStep('peek');
  }, []);

  if (!visible) return null;

  const isSlid = step === 'dropped' || step === 'try-it';
  const denkenGlow = step === 'dropped' || step === 'try-it';

  return (
    <>
      {/* Denken clickable overlay during "try-it" step */}
      {step === 'try-it' && (
        <button
          onClick={handleDenkenClick}
          className="fixed bottom-6 right-6 z-[60] w-16 h-16 rounded-full"
          aria-label="Click Denken to retrieve your beacon"
          style={{ background: 'transparent' }}
        />
      )}

      {/* Denken glow ring during beacon interaction */}
      {denkenGlow && (
        <div
          className="fixed bottom-4 right-4 z-[55] w-20 h-20 rounded-full pointer-events-none"
          style={{
            boxShadow: '0 0 20px rgba(245,158,11,0.6), 0 0 40px rgba(245,158,11,0.3)',
            animation: 'beaconGlow 1.5s ease-in-out infinite alternate',
          }}
        />
      )}

      {/* Main bite card */}
      <div
        className="fixed bottom-28 right-6 z-50 w-72 transition-all duration-700 ease-in-out"
        style={{
          transform: isSlid ? 'translateX(60px) scale(0.92)' : 'translateX(0) scale(1)',
          opacity: isSlid ? 0.7 : 1,
        }}
      >
        <div className="relative bg-card border border-amber-500/30 rounded-xl p-4 shadow-xl shadow-amber-900/10">
          <div className="absolute -bottom-2 right-8 w-4 h-4 bg-card border-r border-b border-amber-500/30 rotate-45" />

          <button onClick={complete} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>

          {step === 'peek' && (
            <div className="flex gap-3">
              <div className="shrink-0 w-10 h-10 rounded-full bg-amber-600/20 flex items-center justify-center">
                <img src="/images/founderDenken.png" alt="Denken" className="w-10 h-10 rounded-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Want to save this for later?</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Drop a beacon — it's like a bookmark with meaning. Tap the golden circle below to try it.
                </p>
                <Button
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-400 text-black text-xs h-8 gap-1.5"
                  onClick={handleDropBeacon}
                >
                  <MapPin className="w-3.5 h-3.5" /> Drop a Beacon
                </Button>
              </div>
            </div>
          )}

          {(step === 'dropped') && (
            <div className="flex gap-3 items-center">
              <div className="shrink-0 w-10 h-10 rounded-full bg-amber-500/30 flex items-center justify-center animate-pulse">
                <MapPin className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-400">Got it!</p>
                <p className="text-xs text-muted-foreground">
                  Sliding over to Denken for safekeeping...
                </p>
              </div>
            </div>
          )}

          {step === 'try-it' && (
            <div className="flex gap-3 items-center">
              <div className="shrink-0 w-10 h-10 rounded-full bg-amber-600/20 flex items-center justify-center">
                <img src="/images/founderDenken.png" alt="Denken" className="w-10 h-10 rounded-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-400">Now you try!</p>
                <p className="text-xs text-muted-foreground">
                  Click Denken (bottom-right) to retrieve your beacon.
                </p>
              </div>
            </div>
          )}

          {step === 'retrieved' && (
            <div className="flex gap-3 items-center">
              <div className="shrink-0 w-10 h-10 rounded-full bg-emerald-600/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-400">Perfect!</p>
                <p className="text-xs text-muted-foreground">
                  You'll find your beacons in Denken's menu anytime.
                </p>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="flex gap-3">
              <div className="shrink-0 w-10 h-10 rounded-full bg-amber-600/20 flex items-center justify-center">
                <img src="/images/founderDenken.png" alt="Denken" className="w-10 h-10 rounded-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">You're all set!</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Drop beacons on any page to remember them. Click Denken anytime to see your saved spots.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-500 text-xs h-7" onClick={complete}>
                    OK, Let's Roll
                  </Button>
                  <Button size="sm" variant="ghost" className="text-xs h-7" onClick={handleReplay}>
                    Show Me Again
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes beaconGlow {
          0% { box-shadow: 0 0 15px rgba(245,158,11,0.4), 0 0 30px rgba(245,158,11,0.15); }
          100% { box-shadow: 0 0 25px rgba(245,158,11,0.7), 0 0 50px rgba(245,158,11,0.3); }
        }
      `}</style>
    </>
  );
}

export default BeaconBiteNudge;
