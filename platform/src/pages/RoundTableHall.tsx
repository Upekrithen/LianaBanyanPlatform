/**
 * ROUND TABLE HALL — Muffled Rule Political Discourse
 * =====================================================
 * The physical manifestation of the Muffled Rule:
 *   - One mic per table, one table per topic
 *   - You speak only as long as you've listened
 *   - Coverage Minutes = your earned airtime
 *   - No shouting, no interrupting — organically enforced civility
 *
 * Layout:
 *   - Left panel: Active tables list + create new
 *   - Center: Active table view with speaker/queue/participants
 *   - Right panel: Coverage Minutes balance + accumulation level
 */

import { useState } from "react";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Mic, MicOff, Users, Clock, MessageSquare,
  Plus, Play, Pause, Square, Volume2, VolumeX,
  Timer, ChevronRight, ArrowUp, Shield, BookOpen,
  Ear, Hand, Crown, Coffee,
} from "lucide-react";
import { RoundTableChat } from "@/components/RoundTableChat";
import { toast } from "sonner";

import {
  type RoundTable,
  type MicRequest,
  MAX_TABLE_PARTICIPANTS,
  MIC_COOLDOWN_SECONDS,
} from "@/lib/discourse/roundTables";

import {
  type CoverageMinuteAccount,
  ACCUMULATION_INCREMENT,
  MAX_SESSION_BROADCAST,
  getAccumulationLevel,
  createAccount,
  calculateBalance,
  canSpeak,
} from "@/lib/discourse/coverageMinutes";

// ── Mock Data (until Supabase integration) ─────────────────────────────────

const MOCK_TABLES: RoundTable[] = [
  {
    id: "rt-1",
    topicId: "topic-tax-reform",
    topicName: "Fair Tax Reform",
    topicDescription: "Discussion on progressive vs flat tax proposals",
    status: "active",
    moderatorId: "mod-1",
    activeSpeakerId: null,
    activeSpeakerStartedAt: null,
    participantIds: ["user-1", "user-2", "user-3", "user-4"],
    micRequestQueue: [],
    maxParticipants: MAX_TABLE_PARTICIPANTS,
    coverageConsumed: {},
    coverageEarned: {},
    sessionStartedAt: new Date().toISOString(),
    sessionEndedAt: null,
    createdAt: new Date().toISOString(),
    ledgerSessionId: "ls-1",
  },
  {
    id: "rt-2",
    topicId: "topic-housing",
    topicName: "Affordable Housing Solutions",
    topicDescription: "Exploring community-driven housing cooperatives",
    status: "waiting",
    moderatorId: "mod-2",
    activeSpeakerId: null,
    activeSpeakerStartedAt: null,
    participantIds: ["user-5", "user-6"],
    micRequestQueue: [],
    maxParticipants: MAX_TABLE_PARTICIPANTS,
    coverageConsumed: {},
    coverageEarned: {},
    sessionStartedAt: new Date().toISOString(),
    sessionEndedAt: null,
    createdAt: new Date().toISOString(),
    ledgerSessionId: "ls-2",
  },
];

// ── Component ──────────────────────────────────────────────────────────────

export default function RoundTableHall() {
  const { user } = useAuth();
  const memberId = user?.id ?? "";

  // State
  const [tables] = useState<RoundTable[]>(MOCK_TABLES);
  const [selectedTable, setSelectedTable] = useState<RoundTable | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicDescription, setNewTopicDescription] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [listenSeconds, setListenSeconds] = useState(0);

  // Mock account
  const [account] = useState<CoverageMinuteAccount>(
    createAccount(memberId || "demo-user"),
  );
  const balance = calculateBalance(account);
  const level = getAccumulationLevel(account);

  // ── Handlers ──

  const handleCreateTable = () => {
    if (!newTopicName.trim()) {
      toast.error("Topic name is required.");
      return;
    }
    toast.success(`Round Table "${newTopicName}" created!`);
    setShowCreateDialog(false);
    setNewTopicName("");
    setNewTopicDescription("");
  };

  const handleJoinTable = (table: RoundTable) => {
    setSelectedTable(table);
    setIsListening(true);
    toast.success(`Joined "${table.topicName}". Listening to earn Coverage Minutes.`);
  };

  const handleRequestMic = () => {
    if (balance <= 0) {
      toast.error("You need Coverage Minutes to speak. Keep listening!");
      return;
    }
    toast.success("Mic requested! You're in the queue.");
  };

  const handleReleaseMic = () => {
    toast.info("Mic released. Next speaker will be called.");
  };

  const handleLeaveTable = () => {
    setSelectedTable(null);
    setIsListening(false);
    setListenSeconds(0);
    toast.info("Left the Round Table.");
  };

  // ── Render ──

  return (
    <PortalPageLayout maxWidth="full" xrayId="round-table-hall">
      {/* Header */}
      <div className="border-b border-border bg-card backdrop-blur-sm -mx-4 sm:-mx-6 px-4 sm:px-6 -mt-8 sm:-mt-12 mb-6">
        <div className="max-w-7xl mx-auto py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Round Table Hall</h1>
                <p className="text-sm text-muted-foreground">
                  Muffled Rule: Earn the right to speak by listening first
                </p>
              </div>
            </div>

            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Table
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Tables List */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Active Tables
            </h2>

            {tables.map(table => (
              <Card
                key={table.id}
                className={`bg-card border-border cursor-pointer transition-all hover:border-amber-500/50 ${
                  selectedTable?.id === table.id ? "border-amber-500 ring-1 ring-amber-500/30" : ""
                }`}
                onClick={() => setSelectedTable(table)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-foreground">
                      {table.topicName}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={
                        table.status === "active"
                          ? "border-green-500 text-green-400 text-xs"
                          : "border-border text-muted-foreground text-xs"
                      }
                    >
                      {table.status === "active" ? "Live" : "Waiting"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {table.participantIds.length}/{table.maxParticipants}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mic className="w-3 h-3" />
                      {table.micRequestQueue.filter(r => r.status === "queued").length} in queue
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}

            {tables.length === 0 && (
              <div className="text-center py-8 text-muted-foreground/70">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No active tables</p>
                <p className="text-xs mt-1">Create one to start a discussion</p>
              </div>
            )}
          </div>

          {/* Center Panel: Active Table View */}
          <div className="lg:col-span-6">
            {selectedTable ? (
              <Card className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-foreground">
                        {selectedTable.topicName}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {selectedTable.topicDescription}
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        selectedTable.status === "active"
                          ? "border-green-500 text-green-400"
                          : "border-yellow-500 text-yellow-400"
                      }
                    >
                      {selectedTable.status === "active" ? "Session Live" : "Waiting to Start"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Active Speaker Zone */}
                  <div className="rounded-xl bg-card border border-border p-6 text-center">
                    {selectedTable.activeSpeakerId ? (
                      <div className="space-y-3">
                        <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto animate-pulse">
                          <Mic className="w-8 h-8 text-green-400" />
                        </div>
                        <p className="text-green-400 font-semibold">Speaking Now</p>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <Timer className="w-4 h-4" />
                          <span>Coverage Minutes remaining: {balance}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-16 h-16 rounded-full bg-muted border-2 border-border flex items-center justify-center mx-auto">
                          <MicOff className="w-8 h-8 text-muted-foreground/70" />
                        </div>
                        <p className="text-muted-foreground/70 font-medium">No Active Speaker</p>
                        <p className="text-xs text-muted-foreground/70">
                          Request the mic to speak. You'll be added to the queue.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Mic Queue */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                      <Hand className="w-4 h-4" />
                      Mic Queue
                    </h3>
                    {selectedTable.micRequestQueue.filter(r => r.status === "queued").length > 0 ? (
                      <div className="space-y-2">
                        {selectedTable.micRequestQueue
                          .filter(r => r.status === "queued")
                          .map((req, idx) => (
                            <div
                              key={req.id}
                              className="flex items-center justify-between px-3 py-2 rounded-lg bg-card border border-border"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
                                  {idx + 1}
                                </span>
                                <span className="text-sm text-muted-foreground">{req.memberName}</span>
                              </div>
                              {req.estimatedDuration && (
                                <span className="text-xs text-muted-foreground/70">
                                  ~{req.estimatedDuration} min
                                </span>
                              )}
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground/70 text-center py-3">
                        Queue is empty. Request the mic to be first!
                      </p>
                    )}
                  </div>

                  {/* Participants */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Participants ({selectedTable.participantIds.length}/{selectedTable.maxParticipants})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTable.participantIds.map((pid, idx) => (
                        <div
                          key={pid}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-card border border-border"
                        >
                          <Ear className="w-3 h-3 text-blue-400" />
                          <span className="text-xs text-muted-foreground">
                            Listener {idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Muffled Rule Reminder */}
                  <div className="rounded-lg bg-amber-500/5 border border-primary/20 p-3">
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div className="text-xs text-primary/80">
                        <p className="font-semibold mb-1">Muffled Rule Active</p>
                        <p>
                          Your microphone broadcasts only for as long as you have Coverage Minutes.
                          Earn minutes by listening at tables and reading content.
                          One mic at a time. No interrupting. Civility is organically enforced.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex gap-2 border-t border-border pt-4">
                  {!isListening ? (
                    <Button
                      onClick={() => handleJoinTable(selectedTable)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Ear className="w-4 h-4 mr-2" />
                      Join & Listen
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleRequestMic}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={balance <= 0}
                      >
                        <Mic className="w-4 h-4 mr-2" />
                        Request Mic
                      </Button>
                      <Button
                        onClick={handleLeaveTable}
                        variant="outline"
                        className="border-border text-muted-foreground"
                      >
                        Leave
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-96 text-muted-foreground/70">
                <div className="text-center">
                  <Coffee className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Select a Round Table</p>
                  <p className="text-sm mt-1">or create a new one to start a discussion</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Coverage Minutes */}
          <div className="lg:col-span-3 space-y-4">
            {/* Balance Card */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Timer className="w-4 h-4" />
                  Coverage Minutes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary">
                    {balance}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">minutes available</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground/70">Max Session</span>
                    <span className="text-muted-foreground">{MAX_SESSION_BROADCAST} min</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground/70">Increment</span>
                    <span className="text-muted-foreground">{ACCUMULATION_INCREMENT} min</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Accumulation Level */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  Accumulation Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-3">
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-sm px-3 py-1">
                    Level {level.level}: {level.name}
                  </Badge>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground/70">
                  <div className="flex justify-between">
                    <span>Min Earned</span>
                    <span>{level.minEarned} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Session</span>
                    <span>{level.maxSessionMinutes} min</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs text-blue-400 font-bold">1</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-muted-foreground">Listen</strong> at Round Tables to earn Coverage Minutes (1:1 ratio)
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs text-green-400 font-bold">2</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-muted-foreground">Read</strong> articles and publications to earn more minutes
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs text-primary font-bold">3</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-muted-foreground">Speak</strong> when your turn comes. Mic auto-mutes when minutes run out.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs text-purple-400 font-bold">4</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-muted-foreground">Donate</strong> minutes to others (recorded on the Immutable Ledger)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Listening Status */}
            {isListening && (
              <Card className="bg-blue-900/20 border-blue-500/30">
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    <span className="text-sm text-blue-400 font-medium">Listening</span>
                  </div>
                  <p className="text-xs text-blue-400/60">
                    Earning Coverage Minutes as you listen. Stay engaged!
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Text Chat Panel */}
            {selectedTable && (
              <RoundTableChat tableId={selectedTable.id} />
            )}
          </div>
        </div>
      </div>

      {/* Create Table Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Create a Round Table</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Start a new discussion. One table per topic. You'll be the moderator.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Topic Name</label>
              <Input
                value={newTopicName}
                onChange={e => setNewTopicName(e.target.value)}
                placeholder="e.g., Fair Tax Reform"
                className="bg-card border-border text-foreground"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Description</label>
              <Textarea
                value={newTopicDescription}
                onChange={e => setNewTopicDescription(e.target.value)}
                placeholder="What should participants discuss?"
                className="bg-card border-border text-foreground"
                rows={3}
              />
            </div>

            <div className="rounded-lg bg-amber-500/5 border border-primary/20 p-3">
              <p className="text-xs text-primary/80">
                <strong>Muffled Rule:</strong> As moderator, you manage the mic queue.
                Speakers are auto-muted when their Coverage Minutes run out.
                Maximum {MAX_TABLE_PARTICIPANTS} participants per table.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              className="border-border text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTable}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Create Table
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalPageLayout>
  );
}
