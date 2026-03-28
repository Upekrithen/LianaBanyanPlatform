import { RedCarpetShell } from './RedCarpetShell';
import { Card, CardContent } from '@/components/ui/card';
import { Car, DollarSign, Clock, Route } from 'lucide-react';

interface Props {
  experience: Record<string, unknown>;
  sponsorName?: string;
  sponsorId?: string;
  activationCode?: string;
}

export default function DriverRecruitRedCarpet({ experience, sponsorName, activationCode }: Props) {
  const preloaded = experience.preloaded_amount as number || 0;

  return (
    <RedCarpetShell sponsorName={sponsorName} activationCode={activationCode} preloadedAmount={preloaded}>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Car className="w-10 h-10 text-blue-400 mx-auto" />
          <h1 className="text-3xl font-bold text-white">Drive for Your Neighbors</h1>
          <p className="text-white/60 text-sm max-w-md mx-auto">
            Local routes. Fair pay. You keep 83.3% of every delivery.
            No surge pricing games. No algorithmic punishment.
          </p>
        </div>

        <div className="grid gap-3">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 flex gap-3">
              <DollarSign className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium text-sm">83.3% Goes to You</p>
                <p className="text-white/50 text-xs">
                  Platform margin is Cost + 20%, constitutionally locked. On a $500 week, you keep $416.67.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 flex gap-3">
              <Route className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium text-sm">Pre-Planned Routes</p>
                <p className="text-white/50 text-xs">
                  Members pre-order by midnight. Routes are known by morning. No guessing, no wasted gas.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 flex gap-3">
              <Clock className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium text-sm">Your Schedule, Your Territory</p>
                <p className="text-white/50 text-xs">
                  Pick your delivery windows. Build your route. Serve your neighborhood.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4 text-center">
          <p className="text-blue-200 text-sm font-medium">Already driving for another platform?</p>
          <p className="text-blue-300/60 text-xs mt-1">
            Compare: you keep 83.3% here vs. whatever they tell you. We publish the math.
          </p>
        </div>
      </div>
    </RedCarpetShell>
  );
}
