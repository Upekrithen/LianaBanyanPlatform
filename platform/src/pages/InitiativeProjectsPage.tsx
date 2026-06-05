import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowLeft, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PortalPageLayout } from '@/components/PortalPageLayout';

/**
 * The Sweet Sixteen Initiatives — Deck Card Edition
 *
 * Each initiative is a swivel Deck Card with 4 corner locks.
 * Priority initiatives (the ones we're doing first) are FREE to unlock.
 * Other initiatives cost 1 Mark per lock to unlock.
 *
 * Users get 30 Marks (non-persistent, session only) to experiment.
 *
 * Currency: MARKS (not Candles - Candles are for navigation)
 * Real Marks are earned by completing tasks. These are test Marks.
 */

// Sweet Sixteen — ordered by Six Steps (ratified BP071 Scope 1, 2026-06-02)
// Step 2 Feed Your Neighbors: #1-4 | Step 3 Employ the World: #5-8
// Step 4 Build Businesses & Make Things: #9-10 | Step 5 Power to the People: #11-13
// Step 6 Belong Together: #14-16
const SWEET_SIXTEEN = [
  // STEP 2 — Feed Your Neighbors
  {
    id: "lets-make-dinner",
    number: 1,
    name: "Let's Make Dinner",
    emoji: "🍽️",
    tagline: "Neighbors Paid to Feed Neighbors",
    description: "Home cooks earn 83.3% preparing meals for busy neighbors. Volume purchasing, shared kitchens, community connection.",
    route: "/initiatives/lets-make-dinner",
    priority: true,
    category: "food",
    step: "Feed Your Neighbors"
  },
  {
    id: "lets-get-groceries",
    number: 2,
    name: "Let's Get Groceries",
    emoji: "🛒",
    tagline: "Volume Discount Grocery Runs",
    description: "Aggregate neighborhood grocery orders for wholesale pricing. Delivery by members, savings for everyone.",
    route: "/initiatives/lets-get-groceries",
    priority: true,
    category: "food",
    step: "Feed Your Neighbors"
  },
  {
    id: "family-table",
    number: 3,
    name: "The Family Table",
    emoji: "👨‍👩‍👧‍👦",
    tagline: "Meal Planning & Connected Portfolios",
    description: "Shared schedules, gift lists, family portfolios. Keep your tribe connected.",
    route: "/initiatives/family-table",
    priority: false,
    category: "family",
    step: "Feed Your Neighbors"
  },
  {
    id: "lets-make-bread",
    number: 4,
    name: "Let's Make Bread",
    emoji: "🍞",
    tagline: "$5 Business Simulator → Real Business",
    description: "Start with a $5 simulation. Learn business fundamentals. Graduate to real operations when ready.",
    route: "/initiatives/lets-make-bread",
    priority: true,
    category: "business",
    step: "Feed Your Neighbors"
  },

  // STEP 3 — Employ the World
  {
    id: "lets-go-shopping",
    number: 5,
    name: "Let's Go Shopping",
    emoji: "🛍️",
    tagline: "Volume Discount Product Purchases",
    description: "Holiday specials, bulk buying, member discounts. Shopping together saves everyone money.",
    route: "/initiatives/lets-go-shopping",
    priority: false,
    category: "commerce",
    step: "Employ the World"
  },
  {
    id: "household-concierge",
    number: 6,
    name: "Household Concierge",
    emoji: "🏠",
    tagline: "Home Services by Vetted Members",
    description: "Maintenance, repairs, scheduling — all by trusted community members at Cost+20%.",
    route: "/initiatives/household-concierge",
    priority: false,
    category: "services",
    step: "Employ the World"
  },
  {
    id: "defense-klaus",
    number: 7,
    name: "Defense Klaus",
    emoji: "🛡️",
    tagline: "For Someone You Love",
    description: "$6 safety bracelet with pull-up palm claws + GPS broadcast monitoring. 100% of proceeds fund pooled legal defense for all members. Physical protection AND legal protection in one.",
    route: "/initiatives/defense-klaus",
    priority: true,
    category: "safety",
    step: "Employ the World"
  },
  {
    id: "rally-group",
    number: 8,
    name: "Rally Group",
    emoji: "📢",
    tagline: "Crisis Response & Community Mobilization",
    description: "When disaster strikes, Rally Group coordinates response. Neighbors helping neighbors, fast.",
    route: "/initiatives/rally-group",
    priority: false,
    category: "community",
    step: "Employ the World"
  },

  // STEP 4 — Build Businesses & Make Things
  {
    id: "vsl",
    number: 9,
    name: "VSL (Vouch Short Loans)",
    emoji: "💳",
    tagline: "Vouch Short Loans 0–5%",
    description: "No-collateral member-to-member loans. 0-5% interest. Because banks shouldn't own your future.",
    route: "/initiatives/vsl",
    priority: false,
    category: "finance",
    step: "Build Businesses & Make Things"
  },
  {
    id: "brass-tacks",
    number: 10,
    name: "Brass Tacks",
    emoji: "🔩",
    tagline: "Manufacturing & Makers",
    description: "Tooling, mechanics, physical products. The maker economy at Cost+20%.",
    route: "/initiatives/brass-tacks",
    priority: false,
    category: "manufacturing",
    step: "Build Businesses & Make Things"
  },

  // STEP 5 — Power to the People
  {
    id: "power-to-the-people",
    number: 11,
    name: "Power to the People",
    emoji: "⚡",
    tagline: "Not left or right. Simply effective.",
    description: "Congressional tracking. Cooperative energy purchasing. Per the Switzerland Protocol.",
    route: "/initiatives/power-to-the-people",
    priority: false,
    category: "advocacy",
    step: "Power to the People"
  },
  {
    id: "tatiana-schlossburg-health-accords",
    number: 12,
    name: "Tatiana Schlossberg Health Accords",
    emoji: "💊",
    tagline: "Cost+20% Prescriptions & Supplies",
    description: "Medications at cost plus 20%. No insurance games. No surprise bills.",
    route: "/initiatives/tatiana-schlossburg-health-accords",
    priority: false,
    category: "health",
    step: "Power to the People"
  },
  {
    id: "msa",
    number: 13,
    name: "MSA",
    emoji: "🏥",
    tagline: "Member Savings Accounts for Healthcare",
    description: "Pre-tax healthcare savings. Community-pooled for emergencies. Your health, your money.",
    route: "/initiatives/msa",
    priority: false,
    category: "health",
    step: "Power to the People"
  },

  // STEP 6 — Belong Together
  {
    id: "harper-guild",
    number: 14,
    name: "Harper Guild",
    emoji: "⚖️",
    tagline: "HR & Ethics for Small Businesses",
    description: "Fair employment practices. Skills training. Career development. Ethics support.",
    route: "/initiatives/harper-guild",
    priority: false,
    category: "business",
    step: "Belong Together"
  },
  {
    id: "jukebox",
    number: 15,
    name: "JukeBox",
    emoji: "🎵",
    tagline: "Artist-Controlled Royalties",
    description: "Cooperative music licensing. Artists keep 83.3%. Transparent royalty distribution.",
    route: "/initiatives/jukebox",
    priority: false,
    category: "creative",
    step: "Belong Together"
  },
  {
    id: "didasko",
    number: 16,
    name: "Didasko (Academic)",
    emoji: "🎓",
    tagline: "College of Hard Knocks",
    description: "K-12 curriculum. Skills training. Tutoring. Mentoring. Education as cooperative enterprise.",
    route: "/initiatives/didasko",
    priority: false,
    category: "education",
    step: "Belong Together"
  },
];

interface LockState {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

interface InitiativeCardState {
  locks: LockState;
  isFlipped: boolean;
  isCollected: boolean;
}

export default function InitiativeProjectsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Session-only Marks (non-persistent) for testing
  const [sessionMarks, setSessionMarks] = useState(30);

  // Card states for all initiatives
  const [cardStates, setCardStates] = useState<Record<string, InitiativeCardState>>(() => {
    const initial: Record<string, InitiativeCardState> = {};
    SWEET_SIXTEEN.forEach(init => {
      initial[init.id] = {
        locks: { top: true, right: true, bottom: true, left: true },
        isFlipped: false,
        isCollected: false,
      };
    });
    return initial;
  });

  // Welcome toast on first load
  useEffect(() => {
    toast({
      title: "🪙 30 Marks for This Session",
      description: "Unlock initiative cards by clicking their side locks. Priority initiatives are FREE!",
    });
  }, []);

  const handleLockClick = (initId: string, position: keyof LockState) => {
    const initiative = SWEET_SIXTEEN.find(i => i.id === initId);
    const state = cardStates[initId];

    if (!initiative || !state || state.isCollected || !state.locks[position]) return;

    // Priority initiatives are free, others cost 1 Mark per lock
    const costPerLock = initiative.priority ? 0 : 1;

    if (costPerLock > 0 && sessionMarks < costPerLock) {
      toast({
        title: "Not Enough Marks",
        description: `You need ${costPerLock} Mark to unlock this lock. You have ${sessionMarks}.`,
        variant: "destructive",
      });
      return;
    }

    // Deduct marks if not free
    if (costPerLock > 0) {
      setSessionMarks(prev => prev - costPerLock);
    }

    // Unlock the lock
    const newLocks = { ...state.locks, [position]: false };
    const allUnlocked = Object.values(newLocks).every(l => !l);

    setCardStates(prev => ({
      ...prev,
      [initId]: {
        ...prev[initId],
        locks: newLocks,
        isCollected: allUnlocked,
      }
    }));

    if (allUnlocked) {
      toast({
        title: `🎴 ${initiative.name} Unlocked!`,
        description: "Click to flip and explore this initiative.",
      });
    }
  };

  const handleCardClick = (initId: string) => {
    const state = cardStates[initId];
    if (!state?.isCollected) return;

    setCardStates(prev => ({
      ...prev,
      [initId]: {
        ...prev[initId],
        isFlipped: !prev[initId].isFlipped,
      }
    }));
  };

  const handleExplore = (route: string) => {
    navigate(route);
  };

  return (
    <PortalPageLayout variant="immersive" xrayId="initiative-projects">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/?view=initiatives')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Main</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-amber-500/20 px-3 py-1.5 rounded-full border border-amber-500/30">
              <Coins className="h-4 w-4 text-amber-400" />
              <span className="font-mono font-bold text-amber-300">{sessionMarks}</span>
              <span className="text-amber-400/70 text-sm">Marks</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-4xl font-bold">The Sweet Sixteen</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            16 charitable initiatives funded by the Cost+20% margin.
            Click the side locks to unlock each card. Priority initiatives are <span className="text-green-400 font-semibold">FREE</span>!
          </p>
        </div>

        {/* How It Works */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">How Initiatives Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Three commercial websites (LianaBanyan.com, .biz, .net) sustainably fund
              sixteen charitable initiatives through a baked-in 20% "Cost of Doing Good" margin.
              No donations required. Commerce funds community.
            </p>
            <p>
              <strong className="text-foreground">Creators and Workers keep 83.3%</strong> of every transaction. The remaining margin
              funds these initiatives — constitutionally locked by DNA Lock.
            </p>
          </CardContent>
        </Card>

        {/* Initiative Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SWEET_SIXTEEN.map((initiative) => {
            const state = cardStates[initiative.id];
            const lockedCount = Object.values(state.locks).filter(Boolean).length;
            const costPerLock = initiative.priority ? 0 : 1;

            return (
              <div
                key={initiative.id}
                className="perspective-1000"
                style={{ perspective: '1000px' }}
              >
                <div
                  className={`relative transition-transform duration-500 transform-style-3d ${
                    state.isFlipped ? 'rotate-y-180' : ''
                  }`}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: state.isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* FRONT of card */}
                  <div
                    className={`relative bg-gradient-to-br ${
                      initiative.priority
                        ? 'from-green-500/20 to-emerald-500/30 border-green-500/30'
                        : 'bg-card border-border'
                    } backdrop-blur-sm rounded-xl p-6 border-2 min-h-[220px] cursor-pointer transition-all hover:shadow-lg ${
                      state.isCollected ? 'hover:scale-[1.02]' : ''
                    }`}
                    style={{ backfaceVisibility: 'hidden' }}
                    onClick={() => handleCardClick(initiative.id)}
                  >
                    {/* Priority Badge */}
                    {initiative.priority && (
                      <div className="absolute top-2 left-2 bg-green-500/30 text-green-300 text-xs px-2 py-0.5 rounded-full border border-green-500/40">
                        FREE
                      </div>
                    )}

                    {/* 4 Corner Locks */}
                    <button
                      className={`absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all ${
                        state.locks.top
                          ? 'bg-muted hover:bg-muted/80 cursor-pointer'
                          : 'bg-green-600/50 cursor-default'
                      }`}
                      onClick={(e) => { e.stopPropagation(); handleLockClick(initiative.id, 'top'); }}
                      disabled={!state.locks.top}
                      title={state.locks.top ? (costPerLock === 0 ? 'Click to unlock (FREE)' : `Click to unlock (${costPerLock} Mark)`) : 'Unlocked'}
                    >
                      {state.locks.top ? '🔒' : '🔓'}
                    </button>
                    <button
                      className={`absolute top-1/2 -right-2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all ${
                        state.locks.right
                          ? 'bg-muted hover:bg-muted/80 cursor-pointer'
                          : 'bg-green-600/50 cursor-default'
                      }`}
                      onClick={(e) => { e.stopPropagation(); handleLockClick(initiative.id, 'right'); }}
                      disabled={!state.locks.right}
                    >
                      {state.locks.right ? '🔒' : '🔓'}
                    </button>
                    <button
                      className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all ${
                        state.locks.bottom
                          ? 'bg-muted hover:bg-muted/80 cursor-pointer'
                          : 'bg-green-600/50 cursor-default'
                      }`}
                      onClick={(e) => { e.stopPropagation(); handleLockClick(initiative.id, 'bottom'); }}
                      disabled={!state.locks.bottom}
                    >
                      {state.locks.bottom ? '🔒' : '🔓'}
                    </button>
                    <button
                      className={`absolute top-1/2 -left-2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all ${
                        state.locks.left
                          ? 'bg-muted hover:bg-muted/80 cursor-pointer'
                          : 'bg-green-600/50 cursor-default'
                      }`}
                      onClick={(e) => { e.stopPropagation(); handleLockClick(initiative.id, 'left'); }}
                      disabled={!state.locks.left}
                    >
                      {state.locks.left ? '🔒' : '🔓'}
                    </button>

                    {/* Card Content */}
                    <div className="text-center space-y-2 mt-4">
                      <div className="text-4xl">{initiative.emoji}</div>
                      <h3 className="text-lg font-bold text-foreground">{initiative.name}</h3>
                      <p className="text-sm text-muted-foreground">{initiative.tagline}</p>
                    </div>

                    {/* Lock Status */}
                    {lockedCount > 0 && (
                      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground/70 bg-background/30 px-2 py-0.5 rounded">
                        {lockedCount}/4 locked
                      </div>
                    )}

                    {/* Collected Badge */}
                    {state.isCollected && (
                      <div className="absolute top-2 right-2 bg-green-500/30 text-green-300 text-xs px-2 py-0.5 rounded-full border border-green-500/40">
                        ✓ Unlocked
                      </div>
                    )}

                    {/* Flip hint when collected */}
                    {state.isCollected && !state.isFlipped && (
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/70">
                        Click to flip →
                      </div>
                    )}
                  </div>

                  {/* BACK of card */}
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/30 backdrop-blur-sm rounded-xl p-6 border-2 border-purple-500/30 min-h-[220px]"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                    onClick={() => handleCardClick(initiative.id)}
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">{initiative.emoji}</span>
                        <h3 className="text-lg font-bold text-foreground">{initiative.name}</h3>
                      </div>

                      <p className="text-sm text-muted-foreground flex-1">
                        {initiative.description}
                      </p>

                      <Button
                        onClick={(e) => { e.stopPropagation(); handleExplore(initiative.route); }}
                        className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                      >
                        Explore as Ghost →
                      </Button>

                      <p className="text-xs text-muted-foreground/70 text-center mt-2">
                        Click to flip back
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardContent className="py-4 text-center text-sm text-amber-200/80">
            <Coins className="h-5 w-5 inline-block mr-2 text-amber-400" />
            You have <strong>{sessionMarks} Marks</strong> for this session.
            Priority initiatives are FREE. Others cost 1 Mark per lock (4 total to unlock).
            Real Marks are earned by completing tasks — these are test Marks.
          </CardContent>
        </Card>
      </div>
    </PortalPageLayout>
  );
}
