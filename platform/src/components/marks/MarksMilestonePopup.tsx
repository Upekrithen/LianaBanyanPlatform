import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { OarSlots } from './OarSlots';
import { getCategoryEmoji, type CategoryBreakdown } from '@/hooks/useMarksMilestone';
import { getBestTemplateForCategory, getMemberOarIndex } from '@/data/shipTemplates';

interface MarksMilestonePopupProps {
  open: boolean;
  milestone: number;
  totalMarks: number;
  categories: CategoryBreakdown[];
  primaryCategory: string;
  isPrizePanel: boolean;
  isGhost?: boolean;
  onDismiss: () => void;
}

export function MarksMilestonePopup({
  open,
  milestone,
  totalMarks,
  categories,
  primaryCategory,
  isPrizePanel,
  isGhost,
  onDismiss,
}: MarksMilestonePopupProps) {
  if (isPrizePanel) {
    return (
      <Dialog open={open} onOpenChange={v => { if (!v) onDismiss(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" draggable={false}>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              🏆 {milestone} MARKS — YOU UNLOCKED THE PRIZE PANEL!
            </DialogTitle>
            <DialogDescription className="text-center sr-only">
              Prize Panel at {milestone} Marks
            </DialogDescription>
          </DialogHeader>
          <PrizePanel
            totalMarks={totalMarks}
            categories={categories}
            primaryCategory={primaryCategory}
            isGhost={isGhost}
            onDismiss={onDismiss}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onDismiss(); }}>
      <DialogContent className="max-w-md" draggable={false}>
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {milestone === 1 ? '🎉 CONGRATULATIONS!' : `⭐ ${milestone} MARKS!`}
          </DialogTitle>
          <DialogDescription className="text-center sr-only">
            Marks milestone reached
          </DialogDescription>
        </DialogHeader>
        <EarlyMilestone
          milestone={milestone}
          totalMarks={totalMarks}
          categories={categories}
          isGhost={isGhost}
          onDismiss={onDismiss}
        />
      </DialogContent>
    </Dialog>
  );
}

/* ─── Early Milestones (1–75) ─── */

function EarlyMilestone({
  milestone,
  totalMarks,
  categories,
  isGhost,
  onDismiss,
}: {
  milestone: number;
  totalMarks: number;
  categories: CategoryBreakdown[];
  isGhost?: boolean;
  onDismiss: () => void;
}) {
  const pct = Math.min(Math.round((totalMarks / 100) * 100), 100);

  return (
    <div className="space-y-5 text-center">
      {milestone === 1 ? (
        <>
          <p className="text-lg font-medium">You earned your first Mark!</p>
          <div className="space-y-1">
            <Progress value={pct} className="h-3" />
            <p className="text-xs text-muted-foreground">{totalMarks} / 100</p>
          </div>
          <div className="text-sm text-muted-foreground space-y-1 text-left px-2">
            <p>Marks are your effort. They don't expire. They build credentials. They unlock doors.</p>
            <p className="font-medium text-foreground">
              At 100 Marks, you unlock the Prize Panel — and you'll see exactly how to launch YOUR business. Today.
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-1">
            <Progress value={pct} className="h-3" />
            <p className="text-xs text-muted-foreground">{totalMarks} / 100 — {pct}% to your Prize Panel</p>
          </div>
          {categories.length > 0 && (
            <div className="text-left px-2 space-y-1">
              <p className="text-sm font-medium">Here's what you've built:</p>
              {categories.slice(0, 5).map(c => (
                <p key={c.category} className="text-sm text-muted-foreground">
                  {getCategoryEmoji(c.category)} {formatCategory(c.category)}: <span className="text-foreground font-medium">{c.total} Marks</span>
                </p>
              ))}
            </div>
          )}
        </>
      )}

      {isGhost && (
        <p className="text-xs text-amber-400 bg-amber-400/10 rounded-lg px-3 py-2">
          Join to claim your Marks and unlock the Prize Panel!
        </p>
      )}

      <Button onClick={onDismiss} className="w-full">
        {milestone >= 75 ? 'Almost There — Keep Going →' : 'Keep Earning →'}
      </Button>
    </div>
  );
}

/* ─── Prize Panel (100+) ─── */

interface PrizePanelCard {
  icon: string;
  title: string;
  description: string;
  route: string;
  templateId?: string;
  memberRole?: string;
}

const TAB_GET: PrizePanelCard[] = [
  { icon: '🍽️', title: 'PreOrder a Meal', description: 'Fund a meal from a local restaurant through Mission ONE.', route: '/projects' },
  { icon: '🔩', title: 'PreOrder a Slotted Top', description: 'Back the Canister System — first manufacturing run.', route: '/manufacturing' },
  { icon: '🛠️', title: 'PreOrder a Service', description: 'Book a service from a member near you.', route: '/marketplace' },
  { icon: '🎨', title: 'Get Your Logo Made', description: 'Commission a logo through the Brand Bounty system — a real designer makes YOUR brand.', route: '/brand-bounties' },
  { icon: '📦', title: 'Get Your Brand Package', description: 'Logo + color palette + business card template — the full starter kit.', route: '/brand-bounties' },
];

const TAB_DO: PrizePanelCard[] = [
  { icon: '💳', title: 'Accept Payments Today', description: 'Set up your member payment profile. Start accepting Credits from other members immediately.', route: '/dashboard' },
  { icon: '🔄', title: 'Set Up Subscriptions', description: 'Create a subscription to your work — monthly recipes, photos, tutoring, services.', route: '/dashboard' },
  { icon: '🏠', title: 'Work From Home', description: 'Browse the services board. Teach, cook, photograph, scout deals, write — all from home.', route: '/marketplace' },
  { icon: '📢', title: 'Launch a Campaign', description: 'Create a business campaign to announce what you offer. Gets featured in the marketplace.', route: '/campaigns' },
  { icon: '🤝', title: 'Join a Guild', description: 'Connect with other professionals in your field. Photography Guild, Cooking Guild, Teaching Guild.', route: '/guilds' },
];

const TAB_MONEY: PrizePanelCard[] = [
  { icon: '📸', title: 'Photograph Businesses', description: 'Bounty Photography — photograph local businesses, earn Marks per verified photo.', route: '/bounty-photography', templateId: 'bounty-photo', memberRole: 'photography' },
  { icon: '🐚', title: 'Scout Deals', description: 'Pearl Diver — log deals, discounts, and price comparisons. Earn Marks when members use your intel.', route: '/pearl-diver', templateId: 'lmd', memberRole: 'pearl_diver' },
  { icon: '👩‍🏫', title: 'Teach From Home', description: 'Cooperative Classroom — teach anything via Zoom. Spanish, math, cooking, guitar.', route: '/classroom', templateId: 'classroom', memberRole: 'teaching' },
  { icon: '🍳', title: 'Prep & Sell Meals', description: 'Freezer Node — batch cook, store, distribute. Earn from Family Table orders.', route: '/freezer-node', templateId: 'freezer-node', memberRole: 'cooking' },
  { icon: '🏗️', title: 'Back Projects Early', description: 'Plant Seeds — back projects at Pre-Mint level for 5× Joules.', route: '/projects' },
  { icon: '✍️', title: 'Give Feedback', description: 'Every piece of feedback earns Marks. Press N anywhere. Your voice shapes the platform AND earns.', route: '/dashboard' },
];

function PrizePanel({
  totalMarks,
  categories,
  primaryCategory,
  isGhost,
  onDismiss,
}: {
  totalMarks: number;
  categories: CategoryBreakdown[];
  primaryCategory: string;
  isGhost?: boolean;
  onDismiss: () => void;
}) {
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState<PrizePanelCard | null>(null);

  const bestTemplate = getBestTemplateForCategory(primaryCategory);

  function handleCardClick(card: PrizePanelCard) {
    if (card.templateId) {
      setSelectedCard(selectedCard?.title === card.title ? null : card);
    } else {
      onDismiss();
      navigate(card.route);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1 text-center">
        <Progress value={100} className="h-3" />
        <p className="text-xs text-muted-foreground">{totalMarks} / 100 ✓</p>
      </div>

      <p className="text-center text-sm font-semibold italic text-primary">
        "Don't Wait for Your Ship to Come In —<br />
        Launch Your Ship Yourself TODAY."
      </p>

      {isGhost && (
        <p className="text-xs text-amber-400 bg-amber-400/10 rounded-lg px-3 py-2 text-center">
          Join to claim your Marks and start your business!
        </p>
      )}

      <Tabs defaultValue="get" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="get" className="text-xs">What Can I Get</TabsTrigger>
          <TabsTrigger value="do" className="text-xs">What Can I Do</TabsTrigger>
          <TabsTrigger value="money" className="text-xs">How Can I Make Money</TabsTrigger>
        </TabsList>

        <TabsContent value="get">
          <CardGrid cards={TAB_GET} onCardClick={handleCardClick} selectedCard={selectedCard} />
        </TabsContent>

        <TabsContent value="do">
          <CardGrid cards={TAB_DO} onCardClick={handleCardClick} selectedCard={selectedCard} />
        </TabsContent>

        <TabsContent value="money">
          <CardGrid cards={TAB_MONEY} onCardClick={handleCardClick} selectedCard={selectedCard} />
          {selectedCard?.templateId && (
            <OarSlots
              templateId={selectedCard.templateId}
              memberRole={selectedCard.memberRole || primaryCategory}
              filledOars={1}
              onInvite={() => {
                onDismiss();
                navigate('/cue-cards');
              }}
              onFillAnother={() => {
                onDismiss();
                navigate('/dashboard');
              }}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ─── Card Grid ─── */

function CardGrid({
  cards,
  onCardClick,
  selectedCard,
}: {
  cards: PrizePanelCard[];
  onCardClick: (c: PrizePanelCard) => void;
  selectedCard: PrizePanelCard | null;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
      {cards.map(card => (
        <button
          key={card.title}
          onClick={() => onCardClick(card)}
          className={`text-left rounded-lg px-4 py-3 transition-all duration-150 hover:scale-[1.02] border ${
            selectedCard?.title === card.title
              ? 'bg-primary/10 border-primary/50'
              : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-primary/50'
          }`}
        >
          <span className="text-2xl block mb-1">{card.icon}</span>
          <span className="text-sm font-medium block">{card.title}</span>
          <span className="text-xs text-muted-foreground block mt-0.5">{card.description}</span>
          <span className="text-[10px] text-primary mt-2 inline-block">
            {card.templateId ? (selectedCard?.title === card.title ? 'Hide crew slots ↑' : 'See crew slots →') : 'GO →'}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ─── Helpers ─── */

function formatCategory(cat: string): string {
  return cat
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}
