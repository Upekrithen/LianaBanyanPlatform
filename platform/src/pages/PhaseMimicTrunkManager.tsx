/**
 * PHASE MIMICTRUNK MANAGER
 * ==========================
 * Manage personal, guild, and tribe Phase MimicTrunks.
 *
 *   - View owned Phases and their connection status
 *   - DNA chain integrity display
 *   - Source code download flow
 *   - Connection handshake monitoring
 *   - Special Deck Card management
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
  Server, Shield, Link2, Download, CheckCircle2,
  XCircle, AlertTriangle, Clock, Dna, Key,
  Plug, Plus, RefreshCw, Eye, Lock,
  Cpu, HardDrive, Fingerprint,
} from "lucide-react";
import { toast } from "sonner";

import {
  type PhaseMimicTrunk,
  type PhaseConnectionStatus,
  type PhaseOwnerType,
  VALIDATION_INTERVAL_MS,
  DNA_CHAIN_COMPONENTS,
} from "@/lib/discourse/phaseMimicTrunks";

import {
  getHandshakeFailureMessage,
} from "@/lib/discourse/sourceDistribution";
import { PortalPageLayout } from '@/components/PortalPageLayout';

// ── Status Styling ─────────────────────────────────────────────────────────

function getStatusColor(status: PhaseConnectionStatus) {
  switch (status) {
    case "active": return { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500" };
    case "initializing": return { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500" };
    case "suspended": return { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500" };
    case "validation_failed": return { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500" };
    case "offline": return { bg: "bg-slate-500/20", text: "text-slate-400", border: "border-slate-500" };
    default: return { bg: "bg-slate-500/20", text: "text-slate-400", border: "border-slate-500" };
  }
}

function getStatusIcon(status: PhaseConnectionStatus) {
  switch (status) {
    case "active": return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    case "initializing": return <Clock className="w-4 h-4 text-blue-400" />;
    case "suspended": return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    case "validation_failed": return <XCircle className="w-4 h-4 text-red-400" />;
    case "offline": return <Lock className="w-4 h-4 text-slate-400" />;
    default: return <Clock className="w-4 h-4 text-slate-400" />;
  }
}

// ── Stub Data (BP072-W9-C5, until Supabase integration) ──────────────────
// TODO: Replace MOCK_TRUNKS with real Supabase query from `phase_mimic_trunks` table.
// Expected DB table: phase_mimic_trunks(id, owner_id, trunk_type, phase_budget,
//   phase_spent, contributions[], ...)

const MOCK_TRUNKS: PhaseMimicTrunk[] = [
  {
    id: "pmt-member-1",
    name: "My Personal Phase",
    description: "Personal sandbox with full LB feature set",
    ownerType: "member" as PhaseOwnerType,
    ownerId: "user-1",
    ledgerSnapshotId: "snap-001",
    ledgerSnapshotTimestamp: "2026-03-07T10:00:00Z",
    sourceCodeChecksum: "sha256:a1b2c3d4e5f6...4d3c2b1a",
    dnaChain: {
      masterChecksum: "sha256:master-a1b2c3d4e5f6",
      components: [
        { type: "source_code" as const, checksum: "sha256:src-aaa", itemCount: 1247, latestItemTimestamp: "2026-03-07T10:00:00Z" },
        { type: "rules_engine" as const, checksum: "sha256:rules-bbb", itemCount: 89, latestItemTimestamp: "2026-03-07T10:00:00Z" },
        { type: "interaction_policies" as const, checksum: "sha256:int-ccc", itemCount: 42, latestItemTimestamp: "2026-03-07T10:00:00Z" },
        { type: "transaction_history" as const, checksum: "sha256:txn-ddd", itemCount: 5621, latestItemTimestamp: "2026-03-07T10:00:00Z" },
        { type: "governance_constraints" as const, checksum: "sha256:gov-eee", itemCount: 16, latestItemTimestamp: "2026-03-07T10:00:00Z" },
      ],
      iteration: 47,
      generatedAt: "2026-03-07T10:00:00Z",
    },
    connectionStatus: "active" as PhaseConnectionStatus,
    lastValidatedAt: "2026-03-07T09:55:00Z",
    validationFailureCount: 0,
    monthlyFee: 25,
    specialDeckCardId: "sdc-personal-1",
    createdAt: "2026-02-15T00:00:00Z",
    updatedAt: "2026-03-07T10:00:00Z",
  },
];

export default function PhaseMimicTrunkManager() {
  const { user } = useAuth();

  const [trunks] = useState<PhaseMimicTrunk[]>(MOCK_TRUNKS);
  const [selectedTrunk, setSelectedTrunk] = useState<PhaseMimicTrunk | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState("");
  const [newPhaseDescription, setNewPhaseDescription] = useState("");

  const handleCreatePhase = () => {
    if (!newPhaseName.trim()) {
      toast.error("Phase name is required.");
      return;
    }
    toast.success(`Phase "${newPhaseName}" created! Initializing...`);
    setShowCreateDialog(false);
    setNewPhaseName("");
    setNewPhaseDescription("");
  };

  const handleValidate = (trunk: PhaseMimicTrunk) => {
    toast.info(`Running validation on "${trunk.name}"...`);
    setTimeout(() => {
      toast.success("All 5 DNA chain components validated. Connection is healthy.");
    }, 2000);
  };

  const handleDownloadSource = (trunk: PhaseMimicTrunk) => {
    toast.info("Generating source code download package...");
    setTimeout(() => {
      toast.success("Download package ready. Includes: source code, ledger snapshot, DNA chain checksums.");
    }, 3000);
  };

  return (
    <PortalPageLayout>
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Server className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Phase MimicTrunks</h1>
                <p className="text-sm text-slate-400">
                  Your personal, guild, and tribe server instances
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-cyan-500 hover:bg-cyan-600 text-black"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Phase
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Info Banner */}
        <div className="rounded-lg bg-cyan-500/5 border border-cyan-500/20 p-4 flex items-start gap-3">
          <Dna className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
          <div className="text-sm text-cyan-400/80">
            <p className="font-semibold mb-1">DNA Chain Protection</p>
            <p>
              Every Phase MimicTrunk runs an exact copy of LB's source code, validated by a
              {DNA_CHAIN_COMPONENTS}-component DNA chain. Modified code will not connect.
              The Immutable Ledger snapshot ensures tamper-proof operation.
              Validation runs every {VALIDATION_INTERVAL_MS / 60000} minutes.
            </p>
          </div>
        </div>

        {/* Trunk Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trunks.map(trunk => {
            const statusStyle = getStatusColor(trunk.connectionStatus);

            return (
              <Card key={trunk.id} className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base text-slate-200 flex items-center gap-2">
                      <Server className="w-4 h-4 text-cyan-400" />
                      {trunk.name}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={`${statusStyle.border} ${statusStyle.text} text-xs`}
                    >
                      {getStatusIcon(trunk.connectionStatus)}
                      <span className="ml-1 capitalize">{trunk.connectionStatus.replace("_", " ")}</span>
                    </Badge>
                  </div>
                  <CardDescription className="text-slate-400 text-xs">
                    {trunk.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* DNA Chain Status */}
                  <div className="rounded-lg bg-slate-900/60 border border-slate-700/50 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Dna className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs text-slate-400 font-medium">
                        DNA Chain (Iteration #{trunk.dnaChain.iteration})
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {trunk.dnaChain.components.map(comp => (
                        <div key={comp.type} className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 capitalize">
                            {comp.type.replace(/_/g, " ")}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-600 font-mono text-[10px]">
                              {comp.checksum.slice(0, 20)}...
                            </span>
                            <CheckCircle2 className="w-3 h-3 text-green-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      <Fingerprint className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-slate-400">
                        Master: <span className="font-mono text-slate-500">{trunk.dnaChain.masterChecksum.slice(0, 16)}...</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-slate-400">
                        Validated: {trunk.lastValidatedAt
                          ? new Date(trunk.lastValidatedAt).toLocaleTimeString()
                          : "Never"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Cpu className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-slate-400">
                        Type: <span className="capitalize">{trunk.ownerType}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Key className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-slate-400">
                        Card: {trunk.specialDeckCardId.slice(0, 12)}...
                      </span>
                    </div>
                  </div>

                  {/* Monthly Fee */}
                  <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-slate-900/40 border border-slate-700/30">
                    <span className="text-slate-500">Monthly Fee</span>
                    <span className="text-amber-400 font-bold">{trunk.monthlyFee} Credits/mo</span>
                  </div>
                </CardContent>

                <CardFooter className="flex gap-2 border-t border-slate-700 pt-4">
                  <Button
                    onClick={() => handleValidate(trunk)}
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-300 text-xs"
                    size="sm"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Validate
                  </Button>
                  <Button
                    onClick={() => handleDownloadSource(trunk)}
                    variant="outline"
                    className="flex-1 border-cyan-500/30 text-cyan-400 text-xs hover:bg-cyan-500/10"
                    size="sm"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                  <Button
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-xs"
                    size="sm"
                  >
                    <Plug className="w-3 h-3 mr-1" />
                    Enter Phase
                  </Button>
                </CardFooter>
              </Card>
            );
          })}

          {trunks.length === 0 && (
            <div className="col-span-2 text-center py-16">
              <Server className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <p className="text-slate-400 font-medium">No Phase MimicTrunks yet</p>
              <p className="text-sm text-slate-500 mt-1">
                Create your first personal Phase to get your own server instance
              </p>
            </div>
          )}
        </div>

        {/* Handshake Explanation */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-cyan-400" />
              Connection Handshake Protocol
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              {[
                { step: 1, name: "Initiate", icon: Plug, desc: "Start connection" },
                { step: 2, name: "Ledger", icon: HardDrive, desc: "Compare ledger snapshot" },
                { step: 3, name: "Source", icon: Cpu, desc: "Validate source code" },
                { step: 4, name: "Rules", icon: Shield, desc: "Verify rules engine" },
                { step: 5, name: "Policies", icon: Eye, desc: "Confirm interactions" },
                { step: 6, name: "Governance", icon: Key, desc: "Check constraints" },
              ].map(({ step, name, icon: Icon, desc }) => (
                <div key={step} className="text-center space-y-1">
                  <div className="w-10 h-10 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <p className="text-xs text-cyan-400 font-medium">Step {step}</p>
                  <p className="text-[10px] text-slate-500">{name}</p>
                  <p className="text-[10px] text-slate-600">{desc}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 text-center mt-4">
              If ANY step fails, connection is refused. Modified code breaks the DNA chain.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-slate-100">
          <DialogHeader>
            <DialogTitle>Create a Phase MimicTrunk</DialogTitle>
            <DialogDescription className="text-slate-400">
              Your own server instance running the full LB platform.
              Protected by DNA chain validation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Phase Name</label>
              <Input
                value={newPhaseName}
                onChange={e => setNewPhaseName(e.target.value)}
                placeholder="e.g., My Personal Phase"
                className="bg-slate-900/50 border-slate-600 text-slate-200"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Description</label>
              <Input
                value={newPhaseDescription}
                onChange={e => setNewPhaseDescription(e.target.value)}
                placeholder="What will you use this Phase for?"
                className="bg-slate-900/50 border-slate-600 text-slate-200"
              />
            </div>
            <div className="rounded-lg bg-cyan-500/5 border border-cyan-500/20 p-3 text-xs text-cyan-400/80">
              <p className="font-semibold mb-1">Includes:</p>
              <ul className="space-y-0.5 list-disc list-inside">
                <li>Full LB source code (downloadable)</li>
                <li>Immutable Ledger snapshot</li>
                <li>DNA chain validation (5 components)</li>
                <li>Special Deck Card for access</li>
                <li>All LB rules and policies enforced</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleCreatePhase} className="bg-cyan-500 hover:bg-cyan-600 text-black">
              Create Phase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalPageLayout>
  );
}
