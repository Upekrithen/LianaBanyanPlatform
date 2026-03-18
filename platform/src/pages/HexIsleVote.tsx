/**
 * PLEDGED MARK VOTING — HexIsle Product Prioritization
 * =====================================================
 * Members vote on the next HexIsle product using Pledged Marks.
 * Pledged Marks are escrowed per-project (compartmentalized, not pooled).
 * Released on success (product launches), absorbed on failure (product cancelled).
 *
 * Route: /hexisle/vote
 * Innovation: #1630 (Pledged Mark Voting — Pawn Batch 07)
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Vote, Trophy, Users, Clock, Hexagon,
  ChevronDown, ChevronUp, Lock, Unlock, TrendingUp, Info
} from 'lucide-react';

// ─── Candidate Products ─────────────────────────────────────────────────────

interface VoteCandidate {
  id: string;
  name: string;
  description: string;
  campaign: number;
  type: 'component' | 'character' | 'creature' | 'assembly';
  pledgedMarks: number;
  voterCount: number;
  status: 'open' | 'leading' | 'funded';
}

const CANDIDATES: VoteCandidate[] = [
  {
    id: 'slotted-top',
    name: 'SlottedTop',
    description: 'Universal hex tile adapter with compliant mechanism snap-locks. The first piece of the 27-piece Hexel system.',
    campaign: 1,
    type: 'component',
    pledgedMarks: 847,
    voterCount: 63,
    status: 'leading',
  },
  {
    id: 'peasant',
    name: 'Peasant (Base Body)',
    description: 'The base body that becomes every character. Same body for Peasant, Farmer, Warrior, King — layers snap on top.',
    campaign: 2,
    type: 'character',
    pledgedMarks: 612,
    voterCount: 48,
    status: 'open',
  },
  {
    id: 'merchant',
    name: 'Merchant (Base Body + Cloak)',
    description: 'Same base body + snap-on Merchant Cloak. Remove the cloak and the Assassin is underneath.',
    campaign: 3,
    type: 'character',
    pledgedMarks: 534,
    voterCount: 41,
    status: 'open',
  },
  {
    id: 'golden-lotus',
    name: 'Golden Lotus',
    description: 'Tesla Valve flow-to-rotation converter. Six cups, bidirectional input, unidirectional output. The heart of every Hexel.',
    campaign: 4,
    type: 'component',
    pledgedMarks: 723,
    voterCount: 55,
    status: 'open',
  },
  {
    id: 'farmer-warrior',
    name: 'Farmer / Warrior',
    description: 'Peasant body + tool belt + cart (Farmer) or + ScaleMail + Terrain Armor (Warrior). Ships complete body with all layers.',
    campaign: 5,
    type: 'character',
    pledgedMarks: 489,
    voterCount: 37,
    status: 'open',
  },
  {
    id: 'character-base',
    name: 'Character Base (Hitbase Counter)',
    description: 'Patented mechanical boots base: coin-loaded Pez-style HP, 3-position sliding tab (HP/Mana/Both), level overlays with weapon slots, dice-face terrain lock. Push to hit — physics tracks damage.',
    campaign: 6,
    type: 'component',
    pledgedMarks: 412,
    voterCount: 32,
    status: 'open',
  },
  {
    id: 'sawtooth-coral',
    name: 'Sawtooth Coral + Timing Belt',
    description: 'The ocean floor piece. Six asymmetric slant angles create trade winds and currents. Hidden Timing Belt counts trap revolutions.',
    campaign: 7,
    type: 'component',
    pledgedMarks: 356,
    voterCount: 28,
    status: 'open',
  },
  {
    id: 'healer-assassin',
    name: 'Healer / Assassin',
    description: 'Crown Path layers: Healer adds herbs + staff over cloak. Assassin = cloak removed (subtraction reveals what was always there).',
    campaign: 8,
    type: 'character',
    pledgedMarks: 445,
    voterCount: 34,
    status: 'open',
  },
  {
    id: 'war-horse',
    name: 'War Horse',
    description: 'Same horse body: WildHorse → FarmHorse (bridle+yoke+cart) → WarHorse (remove cart, add armor). Layer system for creatures.',
    campaign: 9,
    type: 'creature',
    pledgedMarks: 578,
    voterCount: 44,
    status: 'open',
  },
  {
    id: 'king',
    name: 'King (Sword Path Capstone)',
    description: 'Same body wearing ALL layers: tunic + ScaleMail + Terrain Armor + Boots + Crown. Ships with 4-body evolution display.',
    campaign: 10,
    type: 'character',
    pledgedMarks: 667,
    voterCount: 51,
    status: 'open',
  },
  {
    id: 'pneumatic-palm',
    name: 'Pneumatic Palm Tree',
    description: 'Telescoping mechanism powered by pneumatic system. Plants a seed, grows during play. Trunk is harvestable for ship masts.',
    campaign: 11,
    type: 'component',
    pledgedMarks: 401,
    voterCount: 31,
    status: 'open',
  },
  {
    id: 'queen',
    name: 'Queen (Crown Path Capstone)',
    description: 'Same body + cloak + herbs + Orbs of Wisdom + Fiery Wings + Crown Helmet. Ships with 4-body evolution display.',
    campaign: 12,
    type: 'character',
    pledgedMarks: 523,
    voterCount: 40,
    status: 'open',
  },
  {
    id: 'hexel-assembly',
    name: 'Hexel Assembly',
    description: 'All 12 internal pieces assembled into a single working Hexel unit. Community-refined from earlier campaign improvements.',
    campaign: 13,
    type: 'assembly',
    pledgedMarks: 890,
    voterCount: 67,
    status: 'open',
  },
  {
    id: 'tereno-water-table',
    name: 'Tereno Water Table',
    description: '420 Hexels, gravity-powered hydraulic surface. No batteries. No motors. 9 years of engineering. The crown jewel.',
    campaign: 14,
    type: 'assembly',
    pledgedMarks: 1234,
    voterCount: 89,
    status: 'funded',
  },
];

// ─── Voting Period ──────────────────────────────────────────────────────────

const VOTING_PERIOD = {
  start: new Date('2026-03-15T00:00:00Z'),
  end: new Date('2026-04-15T00:00:00Z'),
  label: 'Spring 2026 Priority Vote',
};

function getTimeRemaining(): string {
  const now = new Date();
  const diff = VOTING_PERIOD.end.getTime() - now.getTime();
  if (diff <= 0) return 'Voting closed';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return `${days}d ${hours}h remaining`;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function HexIsleVote() {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<'marks' | 'voters' | 'campaign'>('marks');
  const [filterType, setFilterType] = useState<string>('all');
  const [pledgeAmounts, setPledgeAmounts] = useState<Record<string, number>>({});
  const [userMarksAvailable] = useState(50); // Mock — would come from auth/Supabase

  const totalPledged = useMemo(
    () => CANDIDATES.reduce((sum, c) => sum + c.pledgedMarks, 0),
    []
  );
  const totalVoters = useMemo(
    () => new Set(CANDIDATES.flatMap(() => ['placeholder'])).size, // Mock unique count
    []
  );

  const sorted = useMemo(() => {
    let filtered = filterType === 'all'
      ? [...CANDIDATES]
      : CANDIDATES.filter(c => c.type === filterType);

    switch (sortBy) {
      case 'marks': return filtered.sort((a, b) => b.pledgedMarks - a.pledgedMarks);
      case 'voters': return filtered.sort((a, b) => b.voterCount - a.voterCount);
      case 'campaign': return filtered.sort((a, b) => a.campaign - b.campaign);
      default: return filtered;
    }
  }, [sortBy, filterType]);

  const maxMarks = Math.max(...CANDIDATES.map(c => c.pledgedMarks));

  const handlePledge = (candidateId: string) => {
    const amount = pledgeAmounts[candidateId] || 0;
    if (amount <= 0 || amount > userMarksAvailable) return;
    // Mock — would call Supabase to escrow marks
    console.log(`Pledging ${amount} Marks to ${candidateId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back */}
        <Button
          variant="ghost"
          className="mb-6 text-slate-400 hover:text-white"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-500/20 mb-4">
            <Vote className="h-10 w-10 text-purple-400" />
          </div>
          <h1
            className="text-4xl font-bold text-white mb-2"
            style={{ fontFamily: "'Source Sans 3', system-ui, sans-serif" }}
          >
            HexIsle — Pledged Mark Voting
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Vote on the next HexIsle product by pledging your earned Marks.
            Your Marks are escrowed per-project — released on success, absorbed on failure.
          </p>
          <Badge className="mt-3 bg-amber-500/20 text-amber-400 border-amber-500/30">
            {VOTING_PERIOD.label} — {getTimeRemaining()}
          </Badge>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/40 border-slate-700">
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{totalPledged.toLocaleString()}</div>
              <div className="text-xs text-slate-500">Total Marks Pledged</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/40 border-slate-700">
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-emerald-400">{CANDIDATES.length}</div>
              <div className="text-xs text-slate-500">Candidates</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/40 border-slate-700">
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-amber-400">{userMarksAvailable}</div>
              <div className="text-xs text-slate-500">Your Available Marks</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/40 border-slate-700">
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-sky-400">
                <Clock className="h-5 w-5 inline mr-1" />
                {getTimeRemaining().split(' ')[0]}
              </div>
              <div className="text-xs text-slate-500">Time Left</div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="text-xs text-slate-500 uppercase tracking-wider">Sort:</span>
          {(['marks', 'voters', 'campaign'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                sortBy === s
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'bg-slate-800/60 text-slate-400 border border-slate-700 hover:border-slate-600'
              }`}
              style={{ cursor: 'pointer' }}
            >
              {s === 'marks' ? 'Most Marks' : s === 'voters' ? 'Most Voters' : 'Campaign Order'}
            </button>
          ))}

          <div className="w-px h-6 bg-slate-700 mx-1" />

          <span className="text-xs text-slate-500 uppercase tracking-wider">Filter:</span>
          {['all', 'component', 'character', 'creature', 'assembly'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                filterType === t
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800/60 text-slate-400 border border-slate-700 hover:border-slate-600'
              }`}
              style={{ cursor: 'pointer' }}
            >
              {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1) + 's'}
            </button>
          ))}
        </div>

        {/* Candidate List */}
        <div className="space-y-3">
          {sorted.map((candidate, idx) => {
            const barWidth = Math.max(5, (candidate.pledgedMarks / maxMarks) * 100);
            const isLeading = idx === 0 && sortBy === 'marks';

            return (
              <Card
                key={candidate.id}
                className={`bg-slate-800/30 border transition-all ${
                  candidate.status === 'funded'
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : isLeading
                    ? 'border-purple-500/40 bg-purple-500/5'
                    : 'border-slate-700/50 hover:border-slate-600/50'
                }`}
              >
                <CardContent className="py-4 px-5">
                  <div className="flex items-start gap-4">
                    {/* Rank */}
                    <div className="text-2xl font-bold text-slate-600 w-8 text-right shrink-0">
                      {sortBy === 'campaign' ? `#${candidate.campaign}` : `${idx + 1}`}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Name + badges */}
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-white text-lg">{candidate.name}</h3>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            candidate.type === 'character' ? 'text-amber-400 border-amber-700/40' :
                            candidate.type === 'component' ? 'text-sky-400 border-sky-700/40' :
                            candidate.type === 'creature' ? 'text-emerald-400 border-emerald-700/40' :
                            'text-purple-400 border-purple-700/40'
                          }`}
                        >
                          {candidate.type} — Campaign {candidate.campaign}
                        </Badge>
                        {candidate.status === 'funded' && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                            Funded
                          </Badge>
                        )}
                        {isLeading && candidate.status !== 'funded' && (
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px]">
                            <Trophy className="h-3 w-3 mr-1" /> Leading
                          </Badge>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-sm text-slate-400 mb-3">{candidate.description}</p>

                      {/* Progress bar */}
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex-1 h-3 bg-slate-700/50 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              candidate.status === 'funded'
                                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                                : isLeading
                                ? 'bg-gradient-to-r from-purple-500 to-purple-400'
                                : 'bg-gradient-to-r from-slate-500 to-slate-400'
                            }`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <div className="text-right shrink-0 w-24">
                          <span className="text-sm font-bold text-white">
                            {candidate.pledgedMarks.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-500 ml-1">Marks</span>
                        </div>
                      </div>

                      {/* Stats + pledge action */}
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {candidate.voterCount} voters
                        </span>
                        <span className="flex items-center gap-1">
                          {candidate.status === 'funded' ? (
                            <><Lock className="h-3 w-3 text-emerald-400" /> Escrowed</>
                          ) : (
                            <><Unlock className="h-3 w-3" /> Open for pledges</>
                          )}
                        </span>

                        {candidate.status !== 'funded' && (
                          <div className="ml-auto flex items-center gap-2">
                            <input
                              type="number"
                              min={1}
                              max={userMarksAvailable}
                              placeholder="Marks"
                              value={pledgeAmounts[candidate.id] || ''}
                              onChange={(e) => setPledgeAmounts(prev => ({
                                ...prev,
                                [candidate.id]: parseInt(e.target.value) || 0,
                              }))}
                              className="w-20 px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-white text-xs focus:outline-none focus:border-purple-500/50"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 border-purple-500/40 text-purple-300 hover:bg-purple-500/10"
                              onClick={() => handlePledge(candidate.id)}
                              disabled={!pledgeAmounts[candidate.id] || pledgeAmounts[candidate.id]! > userMarksAvailable}
                            >
                              Pledge
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Explainer */}
        <Card className="mt-10 bg-slate-800/30 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Info className="h-5 w-5 text-purple-400" />
              How Pledged Mark Voting Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-400">
            <p>
              <strong className="text-slate-300">Pledge your earned Marks</strong> to the products you want built next.
              Your Marks are escrowed per-project — compartmentalized, not pooled. This is commitment-weighted influence:
              the more Marks you pledge, the stronger your signal.
            </p>
            <p>
              <strong className="text-slate-300">Released on success:</strong> When a product launches, your pledged Marks
              are released back to you. You voted with conviction and the product exists.
            </p>
            <p>
              <strong className="text-slate-300">Absorbed on failure:</strong> If a product is cancelled, pledged Marks are
              absorbed by the cooperative. This isn't a penalty — it's the cost of signal. Real commitment means real stakes.
            </p>
            <p>
              <strong className="text-slate-300">Leap Frog ordering:</strong> Voting results feed directly into the campaign
              cadence. The most-pledged products move up in the queue. Character campaigns alternate with component campaigns
              as safety valves — if one needs more time, the other leapfrogs forward.
            </p>
            <p className="text-xs text-slate-500 border-t border-slate-700 pt-3">
              Innovation #1630 — Pledged Mark Voting. Part of the Steward system.
              Marks emerge from differential only — never granted as gifts.
            </p>
          </CardContent>
        </Card>

        {/* SEC Disclosure */}
        <p className="text-[10px] text-slate-600 text-center mt-6 max-w-lg mx-auto">
          Pledged Marks are not securities, equity, or investment instruments. They represent
          commitment-weighted preference signaling within the cooperative. No financial return
          is promised or implied. This is earned authority to allocate cooperative resources
          based on demonstrated judgment.
        </p>
      </main>
    </div>
  );
}
