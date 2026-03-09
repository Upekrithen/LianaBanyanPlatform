/**
 * GUILD PHASE MANAGER -- Guild & Tribe Phase MimicTrunk Governance
 * ==================================================================
 * Manage the Phase MimicTrunk hierarchy:
 *   - Guild default Phase (every guild has one, they pay for it)
 *   - Tribe formation and sub-guild structures
 *   - Tribe optional Phases (additional cost)
 *   - Governance hierarchy: LB -> Guild -> Tribe -> Sub-tribe
 *   - Phase fee calculations
 *   - MMORPG hosting capability display
 */

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Shield, Users, Server, Crown, Swords,
  Plus, ChevronRight, Network, Building,
  Gamepad2, Layers, Settings, Coins,
  GitBranch, Users2, Flag,
} from "lucide-react";
import { toast } from "sonner";

import {
  type Guild,
  type Tribe,
  MIN_GUILD_MEMBERS,
  MIN_TRIBE_MEMBERS,
  MAX_TRIBES_PER_GUILD,
  MAX_TRIBE_NESTING_DEPTH,
  DEFAULT_GUILD_PHASE_FEE,
  DEFAULT_TRIBE_PHASE_FEE,
  calculateTotalPhaseFees,
} from "@/lib/discourse/guildTribePhases";

// ── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_GUILD: Guild = {
  id: "guild-001",
  name: "The Cooperative Forge",
  description: "A guild dedicated to building cooperative businesses and community-owned enterprises. Open to veterans, entrepreneurs, and community builders.",
  motto: "Build together, thrive together.",
  status: "active",
  leaderId: "founder-1",
  officerIds: ["officer-1", "officer-2"],
  memberIds: ["founder-1", "officer-1", "officer-2", "member-1", "member-2", "member-3", "member-4", "member-5"],
  memberCount: 8,
  tribeIds: ["tribe-001", "tribe-002"],
  phaseMimicTrunkId: "pmt-guild-001",
  monthlyPhaseFee: DEFAULT_GUILD_PHASE_FEE,
  keepIds: ["keep-1"],
  createdAt: "2026-02-01T00:00:00Z",
  updatedAt: "2026-03-07T00:00:00Z",
  ledgerSectionId: "ls-guild-001",
};

const MOCK_TRIBES: Tribe[] = [
  {
    id: "tribe-001",
    name: "Veterans Chapter",
    description: "Veteran entrepreneurs supporting each other through business launches.",
    guildId: "guild-001",
    status: "active",
    leaderId: "officer-1",
    memberIds: ["officer-1", "member-1", "member-2"],
    memberCount: 3,
    isChapter: true,
    childTribeIds: [],
    nestingDepth: 1,
    phaseMimicTrunkId: "pmt-tribe-001",
    monthlyPhaseFee: DEFAULT_TRIBE_PHASE_FEE,
    keepIds: [],
    createdAt: "2026-02-15T00:00:00Z",
    updatedAt: "2026-03-07T00:00:00Z",
    ledgerSectionId: "ls-tribe-001",
  },
  {
    id: "tribe-002",
    name: "Tech Builders",
    description: "Tech-focused members building platform tools and integrations.",
    guildId: "guild-001",
    status: "active",
    leaderId: "officer-2",
    memberIds: ["officer-2", "member-3", "member-4", "member-5"],
    memberCount: 4,
    isChapter: false,
    childTribeIds: [],
    nestingDepth: 1,
    keepIds: [],
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-03-07T00:00:00Z",
    ledgerSectionId: "ls-tribe-002",
  },
];

export default function GuildPhaseManager() {
  const { user } = useAuth();

  const [guild] = useState<Guild>(MOCK_GUILD);
  const [tribes] = useState<Tribe[]>(MOCK_TRIBES);
  const [showCreateTribeDialog, setShowCreateTribeDialog] = useState(false);
  const [newTribeName, setNewTribeName] = useState("");
  const [newTribeDescription, setNewTribeDescription] = useState("");

  const feeBreakdown = calculateTotalPhaseFees(guild, tribes);

  const handleCreateTribe = () => {
    if (!newTribeName.trim()) {
      toast.error("Tribe name is required.");
      return;
    }
    toast.success(`Tribe "${newTribeName}" created within ${guild.name}!`);
    setShowCreateTribeDialog(false);
    setNewTribeName("");
    setNewTribeDescription("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <Building className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Guild Phase Manager</h1>
                <p className="text-sm text-slate-400">
                  Manage Phases, Tribes, and governance hierarchy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Guild Overview */}
        <Card className="bg-gradient-to-br from-indigo-900/20 to-indigo-800/10 border-indigo-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-400" />
                  {guild.name}
                </CardTitle>
                <CardDescription className="text-slate-400 mt-1">
                  {guild.description}
                </CardDescription>
                {guild.motto && (
                  <p className="text-sm italic text-indigo-400/60 mt-1">"{guild.motto}"</p>
                )}
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center px-3 py-2 rounded-lg bg-slate-900/40">
                <Users className="w-5 h-5 mx-auto text-indigo-400 mb-1" />
                <p className="text-xl font-bold text-slate-200">{guild.memberCount}</p>
                <p className="text-xs text-slate-500">Members</p>
              </div>
              <div className="text-center px-3 py-2 rounded-lg bg-slate-900/40">
                <Network className="w-5 h-5 mx-auto text-indigo-400 mb-1" />
                <p className="text-xl font-bold text-slate-200">{tribes.length}</p>
                <p className="text-xs text-slate-500">Tribes</p>
              </div>
              <div className="text-center px-3 py-2 rounded-lg bg-slate-900/40">
                <Server className="w-5 h-5 mx-auto text-cyan-400 mb-1" />
                <p className="text-xl font-bold text-slate-200">1</p>
                <p className="text-xs text-slate-500">Guild Phase</p>
              </div>
              <div className="text-center px-3 py-2 rounded-lg bg-slate-900/40">
                <Gamepad2 className="w-5 h-5 mx-auto text-purple-400 mb-1" />
                <p className="text-xl font-bold text-slate-200">{guild.keepIds.length}</p>
                <p className="text-xs text-slate-500">Keeps</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Governance Hierarchy */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-indigo-400" />
              Governance Hierarchy
            </CardTitle>
            <CardDescription className="text-slate-500">
              LB rules apply at every level. Sub-organizations must comply with parent rules.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* LB Level */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-amber-400 font-medium">Liana Banyan Platform</span>
                <span className="text-xs text-amber-400/40 ml-auto">Root governance</span>
              </div>

              {/* Guild Level */}
              <div className="ml-6">
                <div className="flex items-center gap-2 mb-2">
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm text-indigo-400 font-medium">{guild.name}</span>
                  <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 text-xs ml-auto">
                    <Server className="w-3 h-3 mr-1" />
                    Default Phase
                  </Badge>
                </div>

                {/* Tribes */}
                {tribes.map(tribe => (
                  <div key={tribe.id} className="ml-6 mt-2">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/40 border border-slate-700/50">
                      <Users2 className="w-4 h-4 text-slate-400" />
                      <div className="flex-1">
                        <span className="text-sm text-slate-300">{tribe.name}</span>
                        {tribe.isChapter && (
                          <Badge variant="outline" className="border-indigo-500/20 text-indigo-400/60 text-[10px] ml-2">
                            Chapter
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Users className="w-3 h-3" />
                        {tribe.memberCount}
                        {tribe.phaseMimicTrunkId && (
                          <Badge variant="outline" className="border-cyan-500/20 text-cyan-400/60 text-[10px]">
                            <Server className="w-2.5 h-2.5 mr-0.5" />
                            Phase
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Tribe Button */}
                <div className="ml-6 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-dashed border-slate-700 text-slate-500 text-xs hover:border-indigo-500/50 hover:text-indigo-400"
                    onClick={() => setShowCreateTribeDialog(true)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Tribe ({tribes.length}/{MAX_TRIBES_PER_GUILD})
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phase Fees */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              Monthly Phase Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/40">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm text-slate-300">{guild.name} (Guild Phase)</span>
                </div>
                <span className="text-sm text-amber-400 font-bold">{feeBreakdown.guildFee} Credits/mo</span>
              </div>

              {feeBreakdown.tribeFees.map(tf => (
                <div key={tf.tribeId} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/40 ml-4">
                  <div className="flex items-center gap-2">
                    <Users2 className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-400">{tf.tribeName} (Tribe Phase)</span>
                  </div>
                  <span className="text-sm text-amber-400/80 font-bold">{tf.fee} Credits/mo</span>
                </div>
              ))}

              <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10 mt-3">
                <span className="text-sm text-amber-400 font-medium">Total Monthly</span>
                <span className="text-lg text-amber-400 font-bold">{feeBreakdown.totalMonthly} Credits/mo</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MMORPG Hosting Info */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-purple-400" />
              MMORPG Hosting Capability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-purple-500/5 border border-purple-500/20 p-4">
              <div className="flex items-start gap-3">
                <Swords className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
                <div className="text-sm text-purple-400/80">
                  <p className="font-semibold mb-1">Guild Phase = MMO Host</p>
                  <p>
                    Your Guild Phase MimicTrunk can host massive multiplayer games.
                    Think Warhammer 40K-scale battles and persistent worlds.
                    Each Tribe can have its own keeps and game lobbies within the Phase.
                    Tribes with their own Phase MimicTrunks can run independent game worlds
                    that connect back to the Guild's governance structure.
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-center">
                    <div className="px-2 py-1.5 rounded bg-slate-900/40">
                      <p className="text-purple-400">Max Nesting</p>
                      <p className="text-slate-300 font-bold">{MAX_TRIBE_NESTING_DEPTH} levels</p>
                    </div>
                    <div className="px-2 py-1.5 rounded bg-slate-900/40">
                      <p className="text-purple-400">Max Tribes</p>
                      <p className="text-slate-300 font-bold">{MAX_TRIBES_PER_GUILD}</p>
                    </div>
                    <div className="px-2 py-1.5 rounded bg-slate-900/40">
                      <p className="text-purple-400">Min Members</p>
                      <p className="text-slate-300 font-bold">{MIN_GUILD_MEMBERS} guild / {MIN_TRIBE_MEMBERS} tribe</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Governance Rules */}
        <div className="rounded-lg bg-indigo-500/5 border border-indigo-500/20 p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
          <div className="text-sm text-indigo-400/80">
            <p className="font-semibold mb-1">Governance Rules</p>
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              <li>All Guild rules must comply with LB platform rules</li>
              <li>All Tribe rules must comply with their Guild's rules</li>
              <li>Sub-tribe rules must comply with parent Tribe rules</li>
              <li>Governance changes are recorded on the Immutable Ledger</li>
              <li>Every Guild Phase runs under the same DNA chain protection</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Create Tribe Dialog */}
      <Dialog open={showCreateTribeDialog} onOpenChange={setShowCreateTribeDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-slate-100">
          <DialogHeader>
            <DialogTitle>Create a Tribe</DialogTitle>
            <DialogDescription className="text-slate-400">
              Form a chapter or sub-guild within {guild.name}.
              Requires at least {MIN_TRIBE_MEMBERS} members.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Tribe Name</label>
              <Input
                value={newTribeName}
                onChange={e => setNewTribeName(e.target.value)}
                placeholder="e.g., Veterans Chapter"
                className="bg-slate-900/50 border-slate-600 text-slate-200"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Description</label>
              <Input
                value={newTribeDescription}
                onChange={e => setNewTribeDescription(e.target.value)}
                placeholder="What is this Tribe's focus?"
                className="bg-slate-900/50 border-slate-600 text-slate-200"
              />
            </div>
            <div className="rounded-lg bg-indigo-500/5 border border-indigo-500/20 p-3 text-xs text-indigo-400/80">
              <p>
                This Tribe will be governed by {guild.name}'s rules.
                Optionally, the Tribe can get its own Phase MimicTrunk
                ({DEFAULT_TRIBE_PHASE_FEE} Credits/month).
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTribeDialog(false)} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleCreateTribe} className="bg-indigo-500 hover:bg-indigo-600">
              <Flag className="w-4 h-4 mr-2" />
              Create Tribe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
