import { Star, Coins, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RedCarpetBannerProps {
  wantCount: number;
  pledgeTotal: number;
  commentCount: number;
  creatorName?: string;
  onWantClick: () => void;
  onPledgeClick: () => void;
}

export function RedCarpetBanner({
  wantCount, pledgeTotal, commentCount, creatorName, onWantClick, onPledgeClick,
}: RedCarpetBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/40 dark:via-yellow-950/30 dark:to-orange-950/20 p-6 shadow-lg">
      <div className="absolute -top-6 -right-6 w-32 h-32 bg-amber-300/20 rounded-full blur-2xl" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-yellow-300/20 rounded-full blur-xl" />

      <div className="relative space-y-4">
        <div className="flex items-center gap-2">
          <Badge className="bg-amber-500 text-white hover:bg-amber-600 text-xs tracking-wider uppercase font-bold px-3 py-1">
            Red Carpet Showcase
          </Badge>
        </div>

        <div className="space-y-1">
          <p className="text-foreground font-medium">
            {creatorName ? `${creatorName} hasn't joined Liana Banyan yet.` : 'This creator hasn\'t joined Liana Banyan yet.'}
          </p>
          <p className="text-muted-foreground text-sm">
            Show them you want their product — every signal brings them closer.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2 bg-white/60 dark:bg-white/5 rounded-lg px-3 py-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <div>
              <div className="text-lg font-bold text-foreground">{wantCount.toLocaleString()}</div>
              <div className="text-[11px] text-muted-foreground">people want this</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/60 dark:bg-white/5 rounded-lg px-3 py-2">
            <Coins className="w-5 h-5 text-amber-600" />
            <div>
              <div className="text-lg font-bold text-foreground">{pledgeTotal.toLocaleString()}</div>
              <div className="text-[11px] text-muted-foreground">Credits pledged</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/60 dark:bg-white/5 rounded-lg px-3 py-2">
            <MessageCircle className="w-5 h-5 text-amber-500" />
            <div>
              <div className="text-lg font-bold text-foreground">{commentCount.toLocaleString()}</div>
              <div className="text-[11px] text-muted-foreground">comments</div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onWantClick}
            className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg py-3 px-4 transition-colors shadow-md shadow-amber-500/20"
          >
            <Star className="w-4 h-4" /> I Want This
          </button>
          <button
            onClick={onPledgeClick}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-lg py-3 px-4 transition-colors shadow-md shadow-orange-500/20"
          >
            <Coins className="w-4 h-4" /> Pledge Credits
          </button>
        </div>
      </div>
    </div>
  );
}
