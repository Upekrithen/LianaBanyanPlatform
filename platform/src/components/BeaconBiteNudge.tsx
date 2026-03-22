/**
 * Beacon Bite 1 — First-encounter nudge.
 * Shows a one-time speech-bubble prompt from Denken encouraging
 * the user to drop their first beacon. Triggers when user has zero
 * beacons and hasn't dismissed this nudge.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { X, Compass, MapPin } from 'lucide-react';

const BITE1_KEY = 'beacon_bite1_complete';

export function BeaconBiteNudge() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);

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

  const dismiss = () => {
    localStorage.setItem(BITE1_KEY, 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-28 right-6 z-50 w-72 animate-in slide-in-from-bottom-4 duration-300">
      <div className="relative bg-card border border-amber-500/30 rounded-xl p-4 shadow-xl shadow-amber-900/10">
        {/* Arrow pointing to Denken FAB below */}
        <div className="absolute -bottom-2 right-8 w-4 h-4 bg-card border-r border-b border-amber-500/30 rotate-45" />

        <button onClick={dismiss} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>

        <div className="flex gap-3">
          <div className="shrink-0 w-10 h-10 rounded-full bg-amber-600/20 flex items-center justify-center">
            <Compass className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Want to save this page for later?</p>
            <p className="text-xs text-muted-foreground mb-3">
              Drop a beacon — it's like a bookmark with meaning. Look for the <MapPin className="inline w-3 h-3" /> icon on any page.
            </p>
            <div className="flex gap-2">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-500 text-xs h-7" onClick={dismiss}>
                OK, Let's Roll
              </Button>
              <Button size="sm" variant="ghost" className="text-xs h-7" onClick={dismiss}>
                Later
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BeaconBiteNudge;
