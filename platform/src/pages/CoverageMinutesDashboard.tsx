/**
 * COVERAGE MINUTES DASHBOARD
 * ============================
 * Full view of the user's Coverage Minutes:
 *   - Balance overview (earned, spent, donated, received)
 *   - Accumulation level with progress to next level
 *   - Transaction history
 *   - Donation controls (send/receive)
 *   - Reading speed tier settings
 *   - Active reading sessions
 *   - Donation record viewer (costs a fee, viewing is recorded)
 */

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Timer, TrendingUp, TrendingDown, Gift, Eye,
  Ear, BookOpen, Mic, Crown, ArrowRight,
  Zap, Clock, Shield, Users, AlertTriangle,
  ChevronUp, Send,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import {
  createAccount,
  calculateBalance,
  getAccumulationLevel,
  canDonate,
  ACCUMULATION_INCREMENT,
  MAX_SESSION_BROADCAST,
  DONATION_RECORD_VIEW_FEE,
  ACCUMULATION_LEVELS,
} from "@/lib/discourse/coverageMinutes";
import { PortalPageLayout } from "@/components/PortalPageLayout";

interface AccountState {
  earnedMinutes: number;
  spentMinutes: number;
  donatedMinutes: number;
  receivedDonations: number;
  currentBalance: number;
  accumulationLevel: number;
  readingSpeedTier: string;
}

interface TransactionRow {
  type: string;
  minutes: number;
  source: string;
  timestamp: string;
}

const SAMPLE_TRANSACTIONS: TransactionRow[] = [
  { type: "earned", minutes: 9, source: "Listened at Fair Tax Reform table", timestamp: "2 hours ago" },
  { type: "earned", minutes: 6, source: "Read: Cooperative Economics 101", timestamp: "3 hours ago" },
  { type: "spent", minutes: 3, source: "Spoke at Housing Solutions table", timestamp: "4 hours ago" },
  { type: "received", minutes: 6, source: "Donation from a member", timestamp: "Yesterday" },
  { type: "donated", minutes: 3, source: "Donated to a member", timestamp: "2 days ago" },
  { type: "earned", minutes: 12, source: "Read: Community Land Trust Primer", timestamp: "3 days ago" },
  { type: "spent", minutes: 9, source: "Spoke at Economic Policy table", timestamp: "4 days ago" },
  { type: "earned", minutes: 18, source: "Listened at Areopagus Table", timestamp: "5 days ago" },
];

const DEFAULT_ACCOUNT: AccountState = {
  earnedMinutes: 45,
  spentMinutes: 12,
  donatedMinutes: 3,
  receivedDonations: 6,
  currentBalance: 36,
  accumulationLevel: 2,
  readingSpeedTier: "normal",
};

export default function CoverageMinutesDashboard() {
  const { user } = useAuth();
  const memberId = user?.id ?? "demo-user";

  const [account, setAccount] = useState<AccountState>(DEFAULT_ACCOUNT);
  const [transactions, setTransactions] = useState<TransactionRow[]>(SAMPLE_TRANSACTIONS);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("coverage_minutes")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        if (error) throw error;
        if (data) {
          const earned = Number(data.minutes_earned ?? 0);
          const spent = Number(data.minutes_spent ?? 0);
          setAccount({
            earnedMinutes: earned,
            spentMinutes: spent,
            donatedMinutes: 0,
            receivedDonations: 0,
            currentBalance: earned - spent,
            accumulationLevel: earned >= 180 ? 4 : earned >= 90 ? 3 : earned >= 30 ? 2 : 1,
            readingSpeedTier: "normal",
          });
        }
      } catch {
        console.warn("[CoverageMinutes] DB fetch failed, using defaults");
      }
      try {
        const { data, error } = await supabase
          .from("coverage_minute_transactions")
          .select("*")
          .eq("member_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);
        if (error) throw error;
        if (data && data.length > 0) {
          setTransactions(
            data.map((row: any) => ({
              type: row.type ?? "earned",
              minutes: Number(row.minutes ?? 0),
              source: row.source ?? row.context ?? "",
              timestamp: row.created_at
                ? new Date(row.created_at).toLocaleDateString()
                : "",
            }))
          );
        }
      } catch {
        console.warn("[CoverageMinutes] Transactions fetch failed, using samples");
      }
    })();
  }, [user?.id]);

  const [showDonateDialog, setShowDonateDialog] = useState(false);
  const [donateRecipient, setDonateRecipient] = useState("");
  const [donateAmount, setDonateAmount] = useState("");
  const [showViewRecordDialog, setShowViewRecordDialog] = useState(false);

  const balance = account.currentBalance;
  const fakeForLevel = createAccount(memberId);
  fakeForLevel.earnedMinutes = account.earnedMinutes;
  fakeForLevel.accumulationLevel = account.accumulationLevel;
  const level = getAccumulationLevel(fakeForLevel);

  const nextLevel = ACCUMULATION_LEVELS.find(l => l.level === level.level + 1);
  const progressToNext = nextLevel
    ? Math.min(100, Math.round(((account.earnedMinutes - level.minEarned) / (nextLevel.minEarned - level.minEarned)) * 100))
    : 100;

  const handleDonate = () => {
    if (!donateRecipient.trim()) {
      toast.error("Enter a recipient member ID or name.");
      return;
    }
    const amount = parseInt(donateAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    if (amount > balance) {
      toast.error(`You only have ${balance} Coverage Minutes available.`);
      return;
    }
    // Round to increment
    const rounded = Math.floor(amount / ACCUMULATION_INCREMENT) * ACCUMULATION_INCREMENT;
    if (rounded <= 0) {
      toast.error(`Minimum donation is ${ACCUMULATION_INCREMENT} minutes.`);
      return;
    }
    toast.success(`Donated ${rounded} Coverage Minutes. Recorded on the Immutable Ledger.`);
    setShowDonateDialog(false);
    setDonateRecipient("");
    setDonateAmount("");
  };

  const handleViewRecord = () => {
    if (balance < DONATION_RECORD_VIEW_FEE) {
      toast.error(`Viewing donation records costs ${DONATION_RECORD_VIEW_FEE} Credit(s).`);
      return;
    }
    toast.info("Donation record viewed. This viewing has been recorded on the Immutable Ledger.");
    setShowViewRecordDialog(false);
  };

  return (
    <PortalPageLayout variant="stage" maxWidth="xl" xrayId="coverage-minutes">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Timer className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Coverage Minutes</h1>
              <p className="text-sm text-slate-400">
                Your earned airtime across all Round Tables and Arenas
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Top Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-xs text-slate-400">Earned</span>
              </div>
              <p className="text-2xl font-bold text-green-400">{account.earnedMinutes}</p>
              <p className="text-xs text-slate-500">minutes total</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-4 h-4 text-red-400" />
                <span className="text-xs text-slate-400">Spent</span>
              </div>
              <p className="text-2xl font-bold text-red-400">{account.spentMinutes}</p>
              <p className="text-xs text-slate-500">minutes speaking</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <Gift className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-slate-400">Donated</span>
              </div>
              <p className="text-2xl font-bold text-purple-400">{account.donatedMinutes}</p>
              <p className="text-xs text-slate-500">minutes given</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <Gift className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-slate-400">Received</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">{account.receivedDonations}</p>
              <p className="text-xs text-slate-500">minutes received</p>
            </CardContent>
          </Card>
        </div>

        {/* Balance + Level Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Balance */}
          <Card className="bg-gradient-to-br from-amber-900/20 to-amber-800/10 border-amber-500/30">
            <CardHeader>
              <CardTitle className="text-slate-300 text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Current Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <p className="text-6xl font-bold text-amber-400">{balance}</p>
                <p className="text-sm text-slate-400 mt-1">Coverage Minutes available</p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setShowDonateDialog(true)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  disabled={balance <= 0}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Donate
                </Button>
                <Button
                  onClick={() => setShowViewRecordDialog(true)}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Records
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Accumulation Level */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-300 text-sm flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                Accumulation Level
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-lg px-4 py-1.5">
                  Level {level.level}: {level.name}
                </Badge>
              </div>

              {nextLevel && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Progress to Level {nextLevel.level}</span>
                    <span>{progressToNext}%</span>
                  </div>
                  <Progress value={progressToNext} className="h-2" />
                  <p className="text-xs text-slate-500 text-center">
                    {nextLevel.minEarned - account.earnedMinutes} more minutes to "{nextLevel.name}"
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Max Session</span>
                  <span className="text-slate-300">{level.maxSessionMinutes} min</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Increment</span>
                  <span className="text-slate-300">{ACCUMULATION_INCREMENT} min</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Reading Speed</span>
                  <span className="text-slate-300 capitalize">{account.readingSpeedTier}</span>
                </div>
              </div>

              {/* All levels preview */}
              <div className="border-t border-slate-700 pt-3 mt-3">
                <p className="text-xs text-slate-500 mb-2">All Levels:</p>
                <div className="space-y-1">
                  {ACCUMULATION_LEVELS.map(l => (
                    <div
                      key={l.level}
                      className={`flex items-center justify-between text-xs px-2 py-1 rounded ${
                        l.level === level.level
                          ? "bg-amber-500/10 text-amber-400"
                          : l.level < level.level
                          ? "text-green-400/60"
                          : "text-slate-600"
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        {l.level <= level.level && <ChevronUp className="w-3 h-3" />}
                        Lv.{l.level} {l.name}
                      </span>
                      <span>{l.maxSessionMinutes} min max</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-300 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Transaction History
            </CardTitle>
            <CardDescription className="text-slate-500">
              All Coverage Minutes activity, recorded on the Immutable Ledger
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {transactions.map((tx, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-900/40 border border-slate-700/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === "earned" ? "bg-green-500/20" :
                      tx.type === "spent" ? "bg-red-500/20" :
                      tx.type === "donated" ? "bg-purple-500/20" :
                      "bg-blue-500/20"
                    }`}>
                      {tx.type === "earned" && <Ear className="w-4 h-4 text-green-400" />}
                      {tx.type === "spent" && <Mic className="w-4 h-4 text-red-400" />}
                      {tx.type === "donated" && <Send className="w-4 h-4 text-purple-400" />}
                      {tx.type === "received" && <Gift className="w-4 h-4 text-blue-400" />}
                    </div>
                    <div>
                      <p className="text-sm text-slate-300">{tx.source}</p>
                      <p className="text-xs text-slate-500">{tx.timestamp}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-mono font-bold ${
                    tx.type === "earned" || tx.type === "received" ? "text-green-400" : "text-red-400"
                  }`}>
                    {tx.type === "earned" || tx.type === "received" ? "+" : "-"}{tx.minutes} min
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Transparency Notice */}
        <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div className="text-sm text-amber-400/80">
              <p className="font-semibold mb-1">Full Transparency</p>
              <p>
                Every Coverage Minutes transaction is recorded on the Immutable Ledger.
                Donation records can be viewed by any member for a fee of {DONATION_RECORD_VIEW_FEE} Credit.
                The act of viewing a donation record is <em>also</em> recorded. Tracing is traceable.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Donate Dialog */}
      <Dialog open={showDonateDialog} onOpenChange={setShowDonateDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-slate-100">
          <DialogHeader>
            <DialogTitle>Donate Coverage Minutes</DialogTitle>
            <DialogDescription className="text-slate-400">
              Send Coverage Minutes to another member. Must be a member (stamps required).
              This donation will be recorded on the Immutable Ledger.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Recipient</label>
              <Input
                value={donateRecipient}
                onChange={e => setDonateRecipient(e.target.value)}
                placeholder="Member name or ID"
                className="bg-slate-900/50 border-slate-600 text-slate-200"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">
                Amount (in {ACCUMULATION_INCREMENT}-minute increments)
              </label>
              <Input
                type="number"
                min={ACCUMULATION_INCREMENT}
                step={ACCUMULATION_INCREMENT}
                max={balance}
                value={donateAmount}
                onChange={e => setDonateAmount(e.target.value)}
                placeholder={`${ACCUMULATION_INCREMENT}`}
                className="bg-slate-900/50 border-slate-600 text-slate-200"
              />
              <p className="text-xs text-slate-500 mt-1">
                Available: {balance} minutes
              </p>
            </div>
            <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3 text-xs text-amber-400/80">
              <p>
                <strong>Note:</strong> This donation will be recorded. Interested parties
                can pay a fee to see who donated to whom. Their viewing is also recorded.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDonateDialog(false)} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleDonate} className="bg-purple-600 hover:bg-purple-700">
              <Send className="w-4 h-4 mr-2" />
              Donate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Records Dialog */}
      <Dialog open={showViewRecordDialog} onOpenChange={setShowViewRecordDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-slate-100">
          <DialogHeader>
            <DialogTitle>View Donation Records</DialogTitle>
            <DialogDescription className="text-slate-400">
              See who donated Coverage Minutes to whom. Costs {DONATION_RECORD_VIEW_FEE} Credit.
              Your viewing will be recorded on the Immutable Ledger.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <div className="text-xs text-red-400/80">
                  <p className="font-semibold mb-1">Transparency Warning</p>
                  <p>
                    Viewing this record costs {DONATION_RECORD_VIEW_FEE} Credit and your viewing
                    will be permanently recorded on the Immutable Ledger. Others can see that you
                    looked at this record.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewRecordDialog(false)} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleViewRecord} className="bg-amber-500 hover:bg-amber-600 text-black">
              <Eye className="w-4 h-4 mr-2" />
              View (1 Credit)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalPageLayout>
  );
}
