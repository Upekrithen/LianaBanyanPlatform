import { RedCarpetShell } from './RedCarpetShell';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ShoppingBag, Utensils, BookOpen, Shield } from 'lucide-react';

interface Props {
  experience: Record<string, unknown>;
  sponsorName?: string;
  sponsorId?: string;
  activationCode?: string;
}

const HIGHLIGHTS = [
  { icon: ShoppingBag, color: 'text-emerald-400', title: 'Shop at Cost + 20%', desc: 'Everything from groceries to services — cooperative pricing, locked forever.' },
  { icon: Utensils, color: 'text-amber-400', title: 'Family Table', desc: 'Plan meals, pre-order from local restaurants, save as a group.' },
  { icon: Shield, color: 'text-violet-400', title: 'Defense Klaus', desc: '$6 bracelet funds legal defense for you and your neighbors.' },
  { icon: BookOpen, color: 'text-blue-400', title: 'Learn & Earn', desc: 'Read papers, take quizzes, earn Marks and Golden Keys. Three reading levels.' },
];

export default function MemberInviteRedCarpet({ experience, sponsorName, activationCode }: Props) {
  const recipientName = experience.recipient_name as string || '';
  const customMessage = experience.custom_message as string || '';
  const showFamilyTable = experience.show_family_table as boolean;
  const showCookbook = experience.show_cookbook as boolean;
  const preloaded = experience.preloaded_amount as number || 0;

  return (
    <RedCarpetShell sponsorName={sponsorName} activationCode={activationCode} preloadedAmount={preloaded}>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Heart className="w-10 h-10 text-rose-400 mx-auto" />
          <h1 className="text-3xl font-bold text-white">
            {recipientName ? `${recipientName}, You're Invited` : "You're Invited"}
          </h1>
          <p className="text-white/60 text-sm max-w-md mx-auto">
            Help each other help ourselves. One membership, one community, everything at cost.
          </p>
          {customMessage && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 mt-3">
              <p className="text-white/70 text-sm italic">"{customMessage}"</p>
            </div>
          )}
        </div>

        <div className="grid gap-3">
          {HIGHLIGHTS.map((h) => (
            <Card key={h.title} className="bg-white/5 border-white/10">
              <CardContent className="p-4 flex gap-3">
                <h.icon className={`w-5 h-5 ${h.color} shrink-0 mt-0.5`} />
                <div>
                  <p className="text-white font-medium text-sm">{h.title}</p>
                  <p className="text-white/50 text-xs">{h.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {(showFamilyTable || showCookbook) && (
          <div className="text-center">
            <p className="text-amber-300/60 text-xs">
              {showFamilyTable && showCookbook
                ? 'Your invitation includes Family Table meal planning and the Cookbook.'
                : showFamilyTable
                  ? 'Your invitation highlights the Family Table — plan meals, save together.'
                  : 'Your invitation includes access to the Cookbook — local restaurants at cooperative pricing.'}
            </p>
          </div>
        )}
      </div>
    </RedCarpetShell>
  );
}
