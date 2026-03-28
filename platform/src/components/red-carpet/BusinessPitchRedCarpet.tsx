import { RedCarpetShell } from './RedCarpetShell';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Shield, Users, DollarSign } from 'lucide-react';

interface Props {
  experience: Record<string, unknown>;
  sponsorName?: string;
  sponsorId?: string;
  activationCode?: string;
}

const TIER_DATA = [
  { tier: 'C+20', pct: '83.3%', desc: 'Constitutional Floor — you keep 83.3% of every dollar' },
  { tier: 'C+40', pct: '71.4%', desc: 'Standard — competitive with any marketplace' },
  { tier: 'C+60', pct: '62.5%', desc: 'Premium placement + marketing support' },
  { tier: 'C+90', pct: '52.6%', desc: 'Full managed service + lead generation' },
];

export default function BusinessPitchRedCarpet({ experience, sponsorName, activationCode }: Props) {
  const recipientName = experience.recipient_name as string || '';
  const businessName = experience.business_name as string || '';
  const customMessage = experience.custom_message as string || '';
  const showTieredChart = experience.show_tiered_chart !== false;
  const tierRecommendation = experience.tier_recommendation as string || 'C+40';
  const preloaded = experience.preloaded_amount as number || 0;

  return (
    <RedCarpetShell sponsorName={sponsorName} activationCode={activationCode} preloadedAmount={preloaded}>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">
            {recipientName ? `${recipientName}, ` : ''}Welcome
          </h1>
          {businessName && (
            <p className="text-xl text-amber-300 font-semibold">{businessName}</p>
          )}
          {customMessage && (
            <p className="text-white/70 text-sm italic max-w-md mx-auto">{customMessage}</p>
          )}
        </div>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Why Liana Banyan for Your Business
            </h3>
            <div className="grid gap-3">
              <div className="flex gap-3">
                <DollarSign className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium text-sm">Cost + 20% — Forever</p>
                  <p className="text-white/50 text-xs">The platform margin is constitutionally locked. No surprise fees. No rate hikes.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Users className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium text-sm">Pre-Orders at Volume Pricing</p>
                  <p className="text-white/50 text-xs">Members pre-order at cooperative discounts. You get guaranteed demand before you produce.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium text-sm">Transparent Ledger</p>
                  <p className="text-white/50 text-xs">Every transaction is auditable. Harper Auditors verify costs. Trust is the foundation.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {showTieredChart && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-5 space-y-3">
              <h3 className="text-white font-semibold text-sm mb-2">Pricing Tiers — You Choose</h3>
              {TIER_DATA.map((t) => (
                <div
                  key={t.tier}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    t.tier === tierRecommendation
                      ? 'bg-amber-900/30 border-amber-600/50'
                      : 'bg-white/[0.02] border-white/5'
                  }`}
                >
                  <div>
                    <span className="text-white font-mono font-bold text-sm">{t.tier}</span>
                    {t.tier === tierRecommendation && (
                      <span className="ml-2 text-[10px] bg-amber-600 text-white px-1.5 py-0.5 rounded">RECOMMENDED</span>
                    )}
                    <p className="text-white/40 text-xs mt-0.5">{t.desc}</p>
                  </div>
                  <span className="text-emerald-400 font-bold text-lg">{t.pct}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </RedCarpetShell>
  );
}
