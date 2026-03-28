import { RedCarpetShell } from './RedCarpetShell';
import { Card, CardContent } from '@/components/ui/card';
import { Handshake, Eye, Sparkles, BadgeDollarSign } from 'lucide-react';

interface Props {
  experience: Record<string, unknown>;
  sponsorName?: string;
  sponsorId?: string;
  activationCode?: string;
}

const PILLARS = [
  {
    icon: Handshake,
    color: 'text-emerald-400',
    title: 'Help Each Other Help Ourselves',
    desc: 'A cooperative where your success helps my success. 16 interconnected initiatives, 1 membership.',
  },
  {
    icon: BadgeDollarSign,
    color: 'text-amber-400',
    title: 'Cost + 20% — Forever',
    desc: 'Creator keeps 83.3%. Platform takes Cost + 20%. Constitutionally locked. No hidden margins.',
  },
  {
    icon: Eye,
    color: 'text-blue-400',
    title: 'Transparent Everything',
    desc: 'Every transaction is auditable. Harper Auditors can verify costs. Trust is built, not assumed.',
  },
  {
    icon: Sparkles,
    color: 'text-violet-400',
    title: '$5/year — Same Terms as the Founder',
    desc: 'No tiers. No premium plans. Everyone gets the same deal. The ant hill, not the country club.',
  },
];

export default function GenericWelcomeRedCarpet({ experience, sponsorName, activationCode }: Props) {
  const preloaded = experience.preloaded_amount as number || 0;

  return (
    <RedCarpetShell sponsorName={sponsorName} activationCode={activationCode} preloadedAmount={preloaded}>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Welcome to Liana Banyan</h1>
          <p className="text-white/60 text-sm max-w-md mx-auto">
            A cooperative platform where neighbors help each other eat, earn, and build — together.
          </p>
        </div>

        <div className="grid gap-3">
          {PILLARS.map((p) => (
            <Card key={p.title} className="bg-white/5 border-white/10">
              <CardContent className="p-4 flex gap-3">
                <p.icon className={`w-5 h-5 ${p.color} shrink-0 mt-0.5`} />
                <div>
                  <p className="text-white font-medium text-sm">{p.title}</p>
                  <p className="text-white/50 text-xs">{p.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </RedCarpetShell>
  );
}
