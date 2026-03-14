/**
 * HALL OF INNOVATIONS — Patent Registry & IP Load Balancing
 * ==========================================================
 * The patent voting and IP management center within The Hexagon.
 * 
 * Features:
 * - Bucket pedestals for patent voting
 * - IP Load Balancing explanation (60/20/20 model)
 * - Global Sponsor Pool vs Patent Buckets
 * - Sponsor benefits and stake mechanics
 * 
 * Innovation #1229: Patent Bucket Voting System
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Lightbulb, Vote, Coins, Users, TrendingUp, Shield,
  ArrowLeft, ChevronRight, Sparkles, Lock, Unlock,
  PieChart, Scale, Landmark, Crown, Gift, Target
} from "lucide-react";
import { PlaceholderGate } from "@/components/PlaceholderGate";
import { toast } from "sonner";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

interface PatentBucket {
  id: string;
  name: string;
  description: string;
  innovations: number[];
  totalVotes: number;
  fundingProgress: number;
  status: "open" | "funded" | "prosecuting" | "granted";
  category: string;
  icon: string;
}

interface IPAllocation {
  recipient: string;
  percentage: number;
  description: string;
  color: string;
}

const IP_ALLOCATION: IPAllocation[] = [
  {
    recipient: "Platform (Cooperative)",
    percentage: 60,
    description: "The cooperative holds the majority — this is shared infrastructure",
    color: "bg-blue-500",
  },
  {
    recipient: "Founder",
    percentage: 20,
    description: "Same share any creator can choose under Three-Tier framework",
    color: "bg-amber-500",
  },
  {
    recipient: "External Pool",
    percentage: 20,
    description: "Sponsors + Patent Bucket funders (split 10%/10%)",
    color: "bg-emerald-500",
  },
];

const EXTERNAL_SPLIT = [
  {
    name: "Global Sponsor Pool",
    percentage: 10,
    description: "Diversified: tiny slice of everything in the existing portfolio",
    icon: "🌐",
  },
  {
    name: "Patent Buckets",
    percentage: 10,
    description: "Concentrated: larger slice of curated patent groups you fund directly",
    icon: "🪣",
  },
];

// Showcase Pedestals - Featured collections that link to multiple buckets
interface ShowcasePedestal {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  innovations: { id: number; name: string; isCrownJewel: boolean }[];
  linkedBuckets: string[];
  estimatedValue: { year1: string; year5: string; year10: string };
  color: string;
}

const SHOWCASE_PEDESTALS: ShowcasePedestal[] = [
  {
    id: "nine-laws",
    name: "The Nine Economic Laws",
    tagline: "37 years in the making",
    description: "The mathematical foundation of Margin Economics and Interdependence — nine interlocking principles that govern how value flows through the cooperative ecosystem.",
    icon: "📜",
    innovations: [
      { id: 1, name: "Forex-Differential Absorption", isCrownJewel: false },
      { id: 2, name: "Ratchet Value Accumulation (HIVI)", isCrownJewel: true },
      { id: 3, name: "Quality-Volume Alignment (Cost+20%)", isCrownJewel: true },
      { id: 4, name: "One-Way Valve Decoupling", isCrownJewel: false },
      { id: 5, name: "Structural Gleaning (3.3%)", isCrownJewel: false },
      { id: 6, name: "Generosity for Potential (Boaz)", isCrownJewel: false },
      { id: 7, name: "Inception Principle", isCrownJewel: false },
      { id: 8, name: "Simultaneous Pricing Paradox", isCrownJewel: true },
      { id: 9, name: "Jeep of Theseus (Cold Start)", isCrownJewel: false },
    ],
    linkedBuckets: ["bucket-1", "bucket-3"],
    estimatedValue: { year1: "$765K", year5: "$5.4M", year10: "$42M" },
    color: "from-purple-600 to-indigo-600",
  },
  {
    id: "hexisle",
    name: "HexIsle Mechanical Systems",
    tagline: "Real hydraulics that DO something",
    description: "The ONLY modular game terrain with real hydraulic, pneumatic, and magnetic subsystems that actually affect gameplay.",
    icon: "🏝️",
    innovations: [
      { id: 55, name: "Golden Lotus Configuration", isCrownJewel: true },
      { id: 56, name: "AC Phase Unidirectional Rotation", isCrownJewel: true },
      { id: 57, name: "HoFund Reversible Valve", isCrownJewel: true },
      { id: 58, name: "469-Hexel System Validation", isCrownJewel: false },
      { id: 59, name: "Swan Neck Inverse Coupling", isCrownJewel: false },
      { id: 60, name: "WaterCap Universal Connector", isCrownJewel: false },
      { id: 248, name: "HollowLog Central Passage", isCrownJewel: false },
      { id: 249, name: "Rooster Teeth Mechanism", isCrownJewel: false },
      { id: 250, name: "36-Vane Rotor", isCrownJewel: false },
      { id: 251, name: "Ouralis Tidal Mechanism", isCrownJewel: false },
      { id: 252, name: "Petal Lock System", isCrownJewel: false },
      { id: 253, name: "Clamshell Sealed Chamber", isCrownJewel: false },
    ],
    linkedBuckets: ["bucket-4"],
    estimatedValue: { year1: "$580K", year5: "$4.2M", year10: "$35M" },
    color: "from-cyan-600 to-teal-600",
  },
];

const PATENT_BUCKETS: PatentBucket[] = [
  {
    id: "bucket-1",
    name: "Three-Gear Currency",
    description: "Credits, Marks, Joules — the economic foundation",
    innovations: [1, 2, 3, 4, 5, 54],
    totalVotes: 0,
    fundingProgress: 0,
    status: "open",
    category: "Economics",
    icon: "⚙️",
  },
  {
    id: "bucket-2",
    name: "Ghost World System",
    description: "Testing the Waters, Ghost Credits, practice mode",
    innovations: [121, 122, 123, 1144, 1242, 1243],
    totalVotes: 0,
    fundingProgress: 0,
    status: "open",
    category: "UX/Onboarding",
    icon: "👻",
  },
  {
    id: "bucket-3",
    name: "IP Load Balancing",
    description: "Bucket voting, stake caps, dynamic rebalancing",
    innovations: [1228, 1229, 1230, 1231, 1232, 1233],
    totalVotes: 0,
    fundingProgress: 0,
    status: "open",
    category: "IP/Economics",
    icon: "⚖️",
  },
  {
    id: "bucket-4",
    name: "HexIsle/Tereno",
    description: "Hydraulic game table, water-powered computing",
    innovations: [55, 56, 57, 58, 59, 60, 248, 249, 250],
    totalVotes: 0,
    fundingProgress: 0,
    status: "open",
    category: "Physical Computing",
    icon: "🏝️",
  },
  {
    id: "bucket-5",
    name: "Decentralized Manufacturing",
    description: "Factory nodes, bounty system, Design Battles",
    innovations: [1234, 1235, 1236, 1237, 1238],
    totalVotes: 0,
    fundingProgress: 0,
    status: "open",
    category: "Manufacturing",
    icon: "🏭",
  },
  {
    id: "bucket-6",
    name: "Governance & Senate",
    description: "Hexagon navigation, Tower of Peace, voting systems",
    innovations: [1037, 1038, 1039, 1240, 1057, 1058],
    totalVotes: 0,
    fundingProgress: 0,
    status: "open",
    category: "Governance",
    icon: "🏛️",
  },
];

const STATS = {
  totalInnovations: 1630,
  formalClaims: 1336,
  filedApplications: 7,
  crownJewels: 8,
  possibleMore: 9,
  queriesRun: 130,
  priorArtReviewed: 330,
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function HallOfInnovations() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();
  const [selectedBucket, setSelectedBucket] = useState<PatentBucket | null>(null);
  const [selectedShowcase, setSelectedShowcase] = useState<ShowcasePedestal | null>(null);
  const [showSponsorDialog, setShowSponsorDialog] = useState(false);

  const isGhost = !user;

  const handleVote = (bucket: PatentBucket) => {
    if (isGhost) {
      toast.info("Join for $5/year to vote on patents", {
        description: "Your votes fund prosecution and earn you stakes in the bucket.",
        action: {
          label: "Join Now",
          onClick: () => openOnboard({ reason: "participate in patent voting", actionLabel: "Join", membershipIncluded: true }),
        },
      });
      return;
    }
    setSelectedBucket(bucket);
  };

  const handleBecomeSponsor = () => {
    if (isGhost) {
      toast.info("Join first, then become a Sponsor", {
        description: "Sponsors get stakes in the Global Pool — a slice of everything.",
        action: {
          label: "Join $5/yr",
          onClick: () => openOnboard({ reason: "participate in patent voting", actionLabel: "Join", membershipIncluded: true }),
        },
      });
      return;
    }
    setShowSponsorDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800">
      {/* Entrance Gate - Placeholder for Artist Bounty */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-800 py-8">
        <PlaceholderGate 
          hallName="Hall of Innovations" 
          bountyId="gate-hall-of-innovations"
          color="#eab308"
        />
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            className="text-white/80 hover:text-white mb-4"
            onClick={() => navigate("/senate")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to The Hexagon
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-xl">
              <Lightbulb className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                Hall of Innovations
                {isGhost && <Badge variant="outline" className="bg-white/20">👻 Exploring</Badge>}
              </h1>
              <p className="text-white/80">Patent Registry & IP Load Balancing</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">
                {STATS.totalInnovations.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Innovations</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                {STATS.formalClaims}
              </div>
              <div className="text-sm text-muted-foreground">Formal Claims</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
                {STATS.filedApplications}
              </div>
              <div className="text-sm text-muted-foreground">Applications</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">
                {STATS.crownJewels}+{STATS.possibleMore}
              </div>
              <div className="text-sm text-muted-foreground">Crown Jewels</div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Showcases */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Featured Innovation Collections
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {SHOWCASE_PEDESTALS.map((showcase) => (
              <Card 
                key={showcase.id}
                className={`cursor-pointer transition-all hover:shadow-xl border-2 hover:border-purple-400 overflow-hidden`}
                onClick={() => setSelectedShowcase(showcase)}
              >
                <div className={`bg-gradient-to-r ${showcase.color} p-4 text-white`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{showcase.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold">{showcase.name}</h3>
                      <p className="text-sm text-white/80">{showcase.tagline}</p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm text-muted-foreground">{showcase.description}</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-muted rounded">
                      <div className="font-bold text-purple-600">{showcase.innovations.length}</div>
                      <div className="text-xs text-muted-foreground">Innovations</div>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <div className="font-bold text-amber-600">
                        {showcase.innovations.filter(i => i.isCrownJewel).length}
                      </div>
                      <div className="text-xs text-muted-foreground">Crown Jewels</div>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <div className="font-bold text-green-600">{showcase.estimatedValue.year10}</div>
                      <div className="text-xs text-muted-foreground">10-Year Est.</div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <ChevronRight className="w-4 h-4 mr-2" />
                    Explore & Vote
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="buckets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="buckets">🪣 Patent Buckets</TabsTrigger>
            <TabsTrigger value="allocation">📊 IP Allocation</TabsTrigger>
            <TabsTrigger value="sponsor">🌐 Become a Sponsor</TabsTrigger>
          </TabsList>

          {/* Patent Buckets Tab */}
          <TabsContent value="buckets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5" />
                  Patent Bucket Pedestals
                </CardTitle>
                <CardDescription>
                  Vote with Credits to fund prosecution. Your votes earn you stakes in that bucket's patents.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {PATENT_BUCKETS.map((bucket) => (
                    <Card 
                      key={bucket.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        bucket.status === "funded" ? "border-emerald-500" :
                        bucket.status === "prosecuting" ? "border-blue-500" :
                        bucket.status === "granted" ? "border-yellow-500" :
                        "border-gray-200"
                      }`}
                      onClick={() => handleVote(bucket)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{bucket.icon}</span>
                          <Badge variant={
                            bucket.status === "funded" ? "default" :
                            bucket.status === "prosecuting" ? "secondary" :
                            bucket.status === "granted" ? "outline" :
                            "outline"
                          }>
                            {bucket.status}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{bucket.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {bucket.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Innovations</span>
                          <span className="font-medium">{bucket.innovations.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Total Votes</span>
                          <span className="font-medium">{bucket.totalVotes.toLocaleString()}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>Funding Progress</span>
                            <span>{bucket.fundingProgress > 0 ? `${bucket.fundingProgress}%` : 'Not yet started'}</span>
                          </div>
                          {bucket.fundingProgress > 0 ? (
                            <Progress value={bucket.fundingProgress} className="h-2" />
                          ) : (
                            <div className="h-2 bg-slate-200 rounded-full" />
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full"
                          variant={bucket.status === "open" ? "default" : "secondary"}
                        >
                          <Vote className="w-4 h-4 mr-2" />
                          {bucket.status === "open" ? "Vote on This Bucket" : "View Details"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* IP Allocation Tab */}
          <TabsContent value="allocation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  The 60/20/20 Split
                </CardTitle>
                <CardDescription>
                  How revenue from existing portfolio patents is distributed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Visual Pie */}
                <div className="flex justify-center">
                  <div className="relative w-48 h-48">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      {/* Platform 60% */}
                      <circle
                        cx="50" cy="50" r="40"
                        fill="transparent"
                        stroke="rgb(59, 130, 246)"
                        strokeWidth="20"
                        strokeDasharray="150.8 251.3"
                        strokeDashoffset="0"
                      />
                      {/* Founder 20% */}
                      <circle
                        cx="50" cy="50" r="40"
                        fill="transparent"
                        stroke="rgb(245, 158, 11)"
                        strokeWidth="20"
                        strokeDasharray="50.3 251.3"
                        strokeDashoffset="-150.8"
                      />
                      {/* External 20% */}
                      <circle
                        cx="50" cy="50" r="40"
                        fill="transparent"
                        stroke="rgb(16, 185, 129)"
                        strokeWidth="20"
                        strokeDasharray="50.3 251.3"
                        strokeDashoffset="-201.1"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Landmark className="w-8 h-8 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-3">
                  {IP_ALLOCATION.map((item) => (
                    <div key={item.recipient} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className={`w-4 h-4 rounded ${item.color}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.recipient}</span>
                          <Badge variant="outline">{item.percentage}%</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* External Split Detail */}
                <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Gift className="w-5 h-5 text-emerald-600" />
                      The External 20% — Two Ways to Participate
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {EXTERNAL_SPLIT.map((item) => (
                      <div key={item.name} className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                        <span className="text-2xl">{item.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{item.name}</span>
                            <Badge variant="secondary">{item.percentage}%</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    ))}
                    <p className="text-sm text-center text-muted-foreground pt-2">
                      If you hold both, you get both checks.
                    </p>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            {/* Caps and Recycling */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Caps and Recycling
                </CardTitle>
                <CardDescription>
                  Fair returns, not feudalism
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">$10M Per-Stake Cap</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Every stake can earn up to $10 million in cumulative payouts. After that, it retires and the slot reopens for new participants.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Unlock className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Stake Splitting</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      When a stake's value exceeds 10-20× original price, it splits into smaller child stakes at $1-5K entry points. Accessibility preserved.
                    </p>
                  </div>
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  <strong>No feudalism.</strong> Early sponsors are rewarded well, but can't extract rent forever.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sponsor Tab */}
          <TabsContent value="sponsor" className="space-y-6">
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-emerald-600" />
                  Become a Global Sponsor
                </CardTitle>
                <CardDescription>
                  Fund Opening Gambit. Get a slice of everything.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50">
                  <h4 className="font-medium mb-2">What Sponsors Get</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-500 mt-0.5" />
                      <span>Fractional participation in the Global Sponsor Pool (10% of all existing patents)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-500 mt-0.5" />
                      <span>Your contribution helps new members join and get started</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-500 mt-0.5" />
                      <span>Diversified exposure — you get a tiny slice of every patent in the portfolio</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-500 mt-0.5" />
                      <span>$10M cap ensures fair returns without extraction</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-600" />
                    Opening Gambit: 20% Jumpstart
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    60% of patent revenue goes to the Platform. Of the Founder's 20%, half (10% of total) is dedicated to Opening Gambit — jumpstarting the platform with sponsor-funded member onboarding.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <strong>The breakdown:</strong> 60% Platform + 20% Sponsor Pool + 10% Founder + 10% Opening Gambit
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleBecomeSponsor}
                >
                  <Users className="w-5 h-5 mr-2" />
                  {isGhost ? "Join First ($5/yr)" : "Become a Sponsor"}
                </Button>
              </CardContent>
            </Card>

            {/* Three-Tier Framework Reference */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5" />
                  Three-Tier IP Control Framework
                </CardTitle>
                <CardDescription>
                  The Founder uses the same framework available to all creators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">Tier A</span>
                      <Badge>49% Creator / 51% Platform</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Ethical guardrails only. Maximum revenue, minimum control.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">Tier B</span>
                      <Badge variant="secondary">60% Creator / 40% Platform</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Up to 5 prohibited categories. Balanced control.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">Tier C</span>
                      <Badge variant="outline">75% Creator / 25% Platform</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Case-by-case approval. Maximum control, smaller pie.</p>
                  </div>
                </div>
                <p className="text-sm text-center text-muted-foreground mt-4">
                  <strong>More control = less money.</strong> The Founder chose Tier B (60/40) — same as everyone else.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Documentation Link */}
        <Card className="bg-muted/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">Full Documentation</p>
              <p className="text-sm text-muted-foreground">
                Deep dive into IP Load Balancing, patent economics, and the Three-Tier framework
              </p>
            </div>
            <Button variant="outline" onClick={() => window.open("https://cephas.lianabanyan.com/under-the-hood/patent-economics-one-pager/", "_blank")}>
              Read on Cephas
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bucket Detail Dialog */}
      <Dialog open={!!selectedBucket} onOpenChange={() => setSelectedBucket(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedBucket?.icon}</span>
              {selectedBucket?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedBucket?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted">
              <h4 className="font-medium mb-2">Innovations in this Bucket</h4>
              <div className="flex flex-wrap gap-2">
                {selectedBucket?.innovations.map((num) => (
                  <Badge key={num} variant="outline">#{num}</Badge>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div className="text-2xl font-bold text-blue-600">{selectedBucket?.totalVotes.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Votes</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                <div className="text-2xl font-bold text-emerald-600">{selectedBucket?.fundingProgress}%</div>
                <div className="text-sm text-muted-foreground">Funded</div>
              </div>
            </div>
            <Button className="w-full" disabled={selectedBucket?.status !== "open"}>
              <Vote className="w-4 h-4 mr-2" />
              {selectedBucket?.status === "open" ? "Cast Your Vote (10 Credits)" : "Voting Closed"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sponsor Dialog */}
      <Dialog open={showSponsorDialog} onOpenChange={setShowSponsorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Become a Global Sponsor</DialogTitle>
            <DialogDescription>
              Your contribution funds Opening Gambit and earns you a stake in the Global Sponsor Pool.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
              <p className="text-sm">
                Sponsor tiers coming soon. For now, contact <strong>Founder@LianaBanyan.com</strong> to discuss sponsorship opportunities.
              </p>
            </div>
            <Button className="w-full" onClick={() => setShowSponsorDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Showcase Detail Dialog */}
      <Dialog open={!!selectedShowcase} onOpenChange={() => setSelectedShowcase(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedShowcase?.icon}</span>
              {selectedShowcase?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedShowcase?.tagline}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{selectedShowcase?.description}</p>
            
            {/* Valuation Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="text-lg font-bold text-green-600">{selectedShowcase?.estimatedValue.year1}</div>
                <div className="text-xs text-muted-foreground">Year 1</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                <div className="text-lg font-bold text-amber-600">{selectedShowcase?.estimatedValue.year5}</div>
                <div className="text-xs text-muted-foreground">Year 5</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div className="text-lg font-bold text-blue-600">{selectedShowcase?.estimatedValue.year10}</div>
                <div className="text-xs text-muted-foreground">Year 10</div>
              </div>
            </div>
            
            {/* Innovations List */}
            <div className="p-4 rounded-lg bg-muted">
              <h4 className="font-medium mb-3">Innovations in this Collection</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedShowcase?.innovations.map((innov) => (
                  <div key={innov.id} className="flex items-center justify-between p-2 rounded bg-background">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">#{innov.id}</Badge>
                      <span className="text-sm">{innov.name}</span>
                    </div>
                    {innov.isCrownJewel && (
                      <Badge className="bg-amber-500">
                        <Crown className="w-3 h-3 mr-1" />
                        Crown Jewel
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Linked Buckets */}
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Vote className="w-4 h-4" />
                Vote on Related Buckets
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                These innovations are contained in the following patent buckets. Vote with Credits to fund prosecution and earn stakes.
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedShowcase?.linkedBuckets.map((bucketId) => {
                  const bucket = PATENT_BUCKETS.find(b => b.id === bucketId);
                  return bucket ? (
                    <Button 
                      key={bucketId}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedShowcase(null);
                        setSelectedBucket(bucket);
                      }}
                    >
                      {bucket.icon} {bucket.name}
                    </Button>
                  ) : null;
                })}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                className="flex-1"
                onClick={() => {
                  if (isGhost) {
                    toast.info("Join for $5/year to vote on patents", {
                      action: { label: "Join Now", onClick: () => openOnboard({ reason: "participate in patent voting", actionLabel: "Join", membershipIncluded: true }) },
                    });
                  } else {
                    toast.success("Opening voting interface...");
                  }
                }}
              >
                <Vote className="w-4 h-4 mr-2" />
                Vote on This Collection
              </Button>
              <Button variant="outline" onClick={() => setSelectedShowcase(null)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
