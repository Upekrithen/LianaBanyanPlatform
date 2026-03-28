import { RedCarpetShell } from './RedCarpetShell';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ShieldCheck, Utensils, Heart } from 'lucide-react';

interface Props {
  experience: Record<string, unknown>;
  sponsorName?: string;
  sponsorId?: string;
  activationCode?: string;
}

export default function FamilyInviteRedCarpet({ experience, sponsorName, activationCode }: Props) {
  const recipientName = experience.recipient_name as string || '';
  const customMessage = experience.custom_message as string || '';
  const preloaded = experience.preloaded_amount as number || 0;

  return (
    <RedCarpetShell sponsorName={sponsorName} activationCode={activationCode} preloadedAmount={preloaded}>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Home className="w-10 h-10 text-amber-400 mx-auto" />
          <h1 className="text-3xl font-bold text-white">
            {recipientName ? `Welcome home, ${recipientName}` : 'Welcome Home'}
          </h1>
          <p className="text-white/60 text-sm max-w-md mx-auto">
            Your family wants you to have this. It's a membership in a cooperative
            where neighbors help each other eat, earn, and build — together.
          </p>
          {customMessage && (
            <div className="bg-rose-900/20 border border-rose-700/30 rounded-lg p-3 mt-3">
              <p className="text-rose-200/80 text-sm italic">"{customMessage}"</p>
              {sponsorName && <p className="text-rose-300/50 text-xs mt-1">— {sponsorName}</p>}
            </div>
          )}
        </div>

        <div className="grid gap-3">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 flex gap-3">
              <Heart className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium text-sm">Given With Love</p>
                <p className="text-white/50 text-xs">
                  This card was created by someone who cares about you. They paid it forward so you could start here.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 flex gap-3">
              <Utensils className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium text-sm">Eat Together, Save Together</p>
                <p className="text-white/50 text-xs">
                  Family Table meal planning. Pre-order from local restaurants at cooperative prices.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 flex gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium text-sm">$5/year — That's It</p>
                <p className="text-white/50 text-xs">
                  Same terms as the Founder. No hidden costs. No upsells. Just membership in something real.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RedCarpetShell>
  );
}
