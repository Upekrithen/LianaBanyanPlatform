/**
 * PEDESTAL BROWSER -- Community-Funded Public Content Feeds
 * ===========================================================
 * Browse, fund, and subscribe to Pedestals.
 *
 * Key rules:
 *   - Max 5,000 Credits from any one person
 *   - 20,000 Credits total to go Public
 *   - All funding on the Immutable Ledger
 *   - Private subscriptions in Portfolio
 *   - Public Pedestals visible to all
 */

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Newspaper, Globe, Lock, Users, TrendingUp,
  Plus, Coins, Eye, BookOpen, Rss,
  Shield, ExternalLink, Search, Star,
} from "lucide-react";
import { toast } from "sonner";

import {
  MAX_CONTRIBUTION_PER_PERSON,
  PUBLIC_THRESHOLD,
  type Pedestal,
  type PedestalStatus,
  type SubscriptionSource,
  createPedestal,
  checkPublicEligibility,
  getFundingSummary,
} from "@/lib/discourse/pedestals";
import { PortalPageLayout } from '@/components/PortalPageLayout';

// ── Stub Data (BP072-W9-C5, until Supabase integration) ──────────────────
// TODO: Replace MOCK_PEDESTALS with real Supabase query from `pedestals` table.
// Expected DB table: pedestals(id, name, description, curator_member_id, status,
//   total_funding, funder_count, subscription_feeds[])

const MOCK_PEDESTALS: Pedestal[] = [
  {
    id: "ped-1",
    name: "Community Economics Weekly",
    description: "Curated articles on cooperative economics, credit unions, and community development finance.",
    curatorMemberId: "curator-1",
    status: "public" as PedestalStatus,
    isPublic: true,
    totalFunding: 22500,
    funderCount: 8,
    subscriptionFeeds: [
      { id: "f1", pedestalId: "ped-1", source: "newsletter" as SubscriptionSource, sourceName: "Cooperative Economy Digest", isActive: true, addedAt: "", addedByMemberId: "curator-1", contentCount: 142 },
      { id: "f2", pedestalId: "ped-1", source: "newspaper" as SubscriptionSource, sourceName: "The Community Times", isActive: true, addedAt: "", addedByMemberId: "curator-1", contentCount: 89 },
      { id: "f3", pedestalId: "ped-1", source: "external_rss" as SubscriptionSource, sourceName: "Credit Union National Assoc.", isActive: true, addedAt: "", addedByMemberId: "curator-1", contentCount: 234 },
    ],
    ledgerSectionId: "ls-ped-1",
    createdAt: "2026-02-15T00:00:00Z",
    updatedAt: "2026-03-07T00:00:00Z",
    publicSince: "2026-03-01T00:00:00Z",
  },
  {
    id: "ped-2",
    name: "Veteran Entrepreneurship Digest",
    description: "Resources, stories, and opportunities for veteran business owners and aspiring entrepreneurs.",
    curatorMemberId: "curator-2",
    status: "private" as PedestalStatus,
    isPublic: false,
    totalFunding: 14200,
    funderCount: 5,
    subscriptionFeeds: [
      { id: "f4", pedestalId: "ped-2", source: "newsletter" as SubscriptionSource, sourceName: "Bunker Labs Newsletter", isActive: true, addedAt: "", addedByMemberId: "curator-2", contentCount: 67 },
      { id: "f5", pedestalId: "ped-2", source: "external_rss" as SubscriptionSource, sourceName: "VetBiz.gov Updates", isActive: true, addedAt: "", addedByMemberId: "curator-2", contentCount: 45 },
    ],
    ledgerSectionId: "ls-ped-2",
    createdAt: "2026-02-20T00:00:00Z",
    updatedAt: "2026-03-07T00:00:00Z",
  },
  {
    id: "ped-3",
    name: "Food Sovereignty Now",
    description: "Local farming, food co-ops, and community-supported agriculture news and guides.",
    curatorMemberId: "curator-3",
    status: "private" as PedestalStatus,
    isPublic: false,
    totalFunding: 3800,
    funderCount: 3,
    subscriptionFeeds: [
      { id: "f6", pedestalId: "ped-3", source: "newsletter" as SubscriptionSource, sourceName: "Local Harvest Weekly", isActive: true, addedAt: "", addedByMemberId: "curator-3", contentCount: 33 },
    ],
    ledgerSectionId: "ls-ped-3",
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-03-07T00:00:00Z",
  },
];

export default function PedestalBrowser() {
  const { user } = useAuth();

  const [pedestals] = useState<Pedestal[]>(MOCK_PEDESTALS);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFundDialog, setShowFundDialog] = useState(false);
  const [selectedPedestal, setSelectedPedestal] = useState<Pedestal | null>(null);
  const [fundAmount, setFundAmount] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPedestalName, setNewPedestalName] = useState("");
  const [newPedestalDescription, setNewPedestalDescription] = useState("");

  const filteredPedestals = pedestals.filter(
    p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         p.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleFund = () => {
    const amount = parseInt(fundAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid contribution amount.");
      return;
    }
    if (amount > MAX_CONTRIBUTION_PER_PERSON) {
      toast.error(`Maximum contribution per person is ${MAX_CONTRIBUTION_PER_PERSON.toLocaleString()} Credits.`);
      return;
    }
    toast.success(`Contributed ${amount.toLocaleString()} Credits. Recorded on the Immutable Ledger.`);
    setShowFundDialog(false);
    setFundAmount("");
  };

  const handleCreatePedestal = () => {
    if (!newPedestalName.trim()) {
      toast.error("Pedestal name is required.");
      return;
    }
    toast.success(`Pedestal "${newPedestalName}" created!`);
    setShowCreateDialog(false);
    setNewPedestalName("");
    setNewPedestalDescription("");
  };

  const openFundDialog = (pedestal: Pedestal) => {
    setSelectedPedestal(pedestal);
    setShowFundDialog(true);
  };

  return (
    <PortalPageLayout>
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Newspaper className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Pedestals</h1>
                <p className="text-sm text-slate-400">
                  Community-funded public content feeds
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-black"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Pedestal
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Info Banner */}
        <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
          <div className="text-sm text-emerald-400/80">
            <p className="font-semibold mb-1">How Pedestals Work</p>
            <p>
              A Pedestal is a publicly available Deck Card display feed of curated content.
              Anyone can contribute up to <strong>{MAX_CONTRIBUTION_PER_PERSON.toLocaleString()} Credits</strong>.
              When total funding reaches <strong>{PUBLIC_THRESHOLD.toLocaleString()} Credits</strong>,
              the Pedestal goes Public. All transactions are recorded on the Immutable Ledger.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search Pedestals..."
            className="bg-slate-800/50 border-slate-700 text-slate-200 pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="all" className="data-[state=active]:bg-slate-700">All</TabsTrigger>
            <TabsTrigger value="public" className="data-[state=active]:bg-slate-700">Public</TabsTrigger>
            <TabsTrigger value="funding" className="data-[state=active]:bg-slate-700">Needs Funding</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPedestals.map(ped => (
                <PedestalCard key={ped.id} pedestal={ped} onFund={openFundDialog} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="public" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPedestals.filter(p => p.isPublic).map(ped => (
                <PedestalCard key={ped.id} pedestal={ped} onFund={openFundDialog} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="funding" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPedestals.filter(p => !p.isPublic).map(ped => (
                <PedestalCard key={ped.id} pedestal={ped} onFund={openFundDialog} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Fund Dialog */}
      <Dialog open={showFundDialog} onOpenChange={setShowFundDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-slate-100">
          <DialogHeader>
            <DialogTitle>Fund "{selectedPedestal?.name}"</DialogTitle>
            <DialogDescription className="text-slate-400">
              Contribute Credits to help this Pedestal reach Public status.
              Maximum {MAX_CONTRIBUTION_PER_PERSON.toLocaleString()} Credits per person.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedPedestal && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Current Funding</span>
                  <span className="text-slate-200">
                    {selectedPedestal.totalFunding.toLocaleString()} / {PUBLIC_THRESHOLD.toLocaleString()}
                  </span>
                </div>
                <Progress
                  value={Math.min(100, (selectedPedestal.totalFunding / PUBLIC_THRESHOLD) * 100)}
                  className="h-2"
                />
                <p className="text-xs text-slate-500 text-center">
                  {Math.max(0, PUBLIC_THRESHOLD - selectedPedestal.totalFunding).toLocaleString()} Credits to go Public
                </p>
              </div>
            )}
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Contribution Amount (Credits)</label>
              <Input
                type="number"
                min={1}
                max={MAX_CONTRIBUTION_PER_PERSON}
                value={fundAmount}
                onChange={e => setFundAmount(e.target.value)}
                placeholder="100"
                className="bg-slate-900/50 border-slate-600 text-slate-200"
              />
            </div>
            <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3 text-xs text-amber-400/80">
              This transaction will be permanently recorded on the Immutable Ledger.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFundDialog(false)} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleFund} className="bg-emerald-500 hover:bg-emerald-600 text-black">
              <Coins className="w-4 h-4 mr-2" />
              Contribute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-slate-100">
          <DialogHeader>
            <DialogTitle>Create a Pedestal</DialogTitle>
            <DialogDescription className="text-slate-400">
              Curate a public content feed. It starts Private until funding reaches {PUBLIC_THRESHOLD.toLocaleString()} Credits.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Pedestal Name</label>
              <Input
                value={newPedestalName}
                onChange={e => setNewPedestalName(e.target.value)}
                placeholder="e.g., Community Economics Weekly"
                className="bg-slate-900/50 border-slate-600 text-slate-200"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Description</label>
              <Input
                value={newPedestalDescription}
                onChange={e => setNewPedestalDescription(e.target.value)}
                placeholder="What content will this Pedestal feature?"
                className="bg-slate-900/50 border-slate-600 text-slate-200"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleCreatePedestal} className="bg-emerald-500 hover:bg-emerald-600 text-black">
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalPageLayout>
  );
}

// ── Pedestal Card Component ────────────────────────────────────────────────

function PedestalCard({
  pedestal,
  onFund,
}: {
  pedestal: Pedestal;
  onFund: (pedestal: Pedestal) => void;
}) {
  const summary = getFundingSummary(pedestal);

  return (
    <Card className="bg-slate-800/50 border-slate-700 hover:border-emerald-500/30 transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-200">
            {pedestal.name}
          </CardTitle>
          <Badge
            variant="outline"
            className={
              pedestal.isPublic
                ? "border-emerald-500 text-emerald-400 text-xs"
                : "border-slate-600 text-slate-400 text-xs"
            }
          >
            {pedestal.isPublic ? (
              <><Globe className="w-3 h-3 mr-1" /> Public</>
            ) : (
              <><Lock className="w-3 h-3 mr-1" /> Private</>
            )}
          </Badge>
        </div>
        <CardDescription className="text-slate-400 text-xs">
          {pedestal.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 pb-2">
        {/* Funding Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Funding</span>
            <span className="text-slate-300">
              {summary.totalFunding.toLocaleString()} / {PUBLIC_THRESHOLD.toLocaleString()}
            </span>
          </div>
          <Progress value={summary.percentToPublic} className="h-1.5" />
          <div className="flex justify-between text-xs text-slate-500">
            <span>{summary.percentToPublic}%</span>
            <span>{summary.funderCount} funders</span>
          </div>
        </div>

        {/* Feeds */}
        <div className="space-y-1">
          {pedestal.subscriptionFeeds.slice(0, 3).map(feed => (
            <div key={feed.id} className="flex items-center gap-2 text-xs">
              <Rss className="w-3 h-3 text-emerald-400/60" />
              <span className="text-slate-400 truncate">{feed.sourceName}</span>
              <span className="text-slate-600 ml-auto">{feed.contentCount}</span>
            </div>
          ))}
          {pedestal.subscriptionFeeds.length > 3 && (
            <p className="text-xs text-slate-600">
              +{pedestal.subscriptionFeeds.length - 3} more feeds
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t border-slate-700/50">
        {!pedestal.isPublic ? (
          <Button
            onClick={() => onFund(pedestal)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-sm"
            size="sm"
          >
            <Coins className="w-3 h-3 mr-1" />
            Fund This Pedestal
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full border-emerald-500/30 text-emerald-400 text-sm hover:bg-emerald-500/10"
            size="sm"
          >
            <BookOpen className="w-3 h-3 mr-1" />
            Browse Content
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
