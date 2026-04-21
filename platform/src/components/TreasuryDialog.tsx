/**
 * TREASURY DIALOG — RPG-Style Currency Display
 * =============================================
 * Shows the user's currency holdings in both Ordinary World (real) and Ghost World (practice).
 *
 * Features:
 * - Chest colors by value tier (Wood → Diamond)
 * - Ordinary World vs Ghost World tabs
 * - Tool Chest panel for equipment/items
 * - Currency breakdown with icons
 * - Transaction history preview
 *
 * Chest Color Tiers:
 * - 0-100: Wood (Brown)
 * - 101-500: Iron (Gray)
 * - 501-1,000: Bronze (Bronze)
 * - 1,001-5,000: Silver (Silver)
 * - 5,001-25,000: Gold (Gold)
 * - 25,001-100,000: Platinum (Platinum)
 * - 100,001+: Diamond (Prismatic)
 */

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getMemberCurrency, getMarksHistory, getJoulesHistory, type MemberCurrency } from "@/lib/currencyService";
import { getGhostSession, type GhostSession } from "@/lib/ghostWorld";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Coins, Sparkles, Zap, Package, Ghost, Sun,
  TrendingUp, TrendingDown, History, ChevronRight,
  Crown, Star, Shield
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

type ChestTier = "wood" | "iron" | "bronze" | "silver" | "gold" | "platinum" | "diamond";

interface ChestConfig {
  tier: ChestTier;
  minValue: number;
  maxValue: number;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}

const CHEST_TIERS: ChestConfig[] = [
  { tier: "wood", minValue: 0, maxValue: 100, color: "text-amber-800", bgColor: "bg-amber-100", borderColor: "border-amber-300", icon: "🪵" },
  { tier: "iron", minValue: 101, maxValue: 500, color: "text-gray-600", bgColor: "bg-gray-100", borderColor: "border-gray-400", icon: "⚙️" },
  { tier: "bronze", minValue: 501, maxValue: 1000, color: "text-orange-700", bgColor: "bg-orange-100", borderColor: "border-orange-400", icon: "🥉" },
  { tier: "silver", minValue: 1001, maxValue: 5000, color: "text-gray-500", bgColor: "bg-gray-50", borderColor: "border-gray-300", icon: "🥈" },
  { tier: "gold", minValue: 5001, maxValue: 25000, color: "text-yellow-600", bgColor: "bg-yellow-50", borderColor: "border-yellow-400", icon: "🥇" },
  { tier: "platinum", minValue: 25001, maxValue: 100000, color: "text-slate-400", bgColor: "bg-slate-50", borderColor: "border-slate-300", icon: "💎" },
  { tier: "diamond", minValue: 100001, maxValue: Infinity, color: "text-purple-500", bgColor: "bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50", borderColor: "border-purple-400", icon: "✨" },
];

function getChestTier(value: number): ChestConfig {
  return CHEST_TIERS.find(t => value >= t.minValue && value <= t.maxValue) || CHEST_TIERS[0];
}

// ═══════════════════════════════════════════════════════════════════════════════
// CURRENCY CHEST COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface CurrencyChestProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  description?: string;
  trend?: "up" | "down" | "neutral";
  onClick?: () => void;
}

function CurrencyChest({ label, value, icon, description, trend, onClick }: CurrencyChestProps) {
  const tier = getChestTier(value);

  return (
    <Card
      className={`${tier.bgColor} ${tier.borderColor} border-2 cursor-pointer hover:shadow-md transition-all`}
      onClick={onClick}
    >
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-medium">{label}</span>
          </div>
          <span className="text-lg">{tier.icon}</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={`text-2xl font-bold ${tier.color}`}>
            {value.toLocaleString()}
          </span>
          {trend && trend !== "neutral" && (
            trend === "up"
              ? <TrendingUp className="h-4 w-4 text-green-500" />
              : <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        <Badge variant="outline" className="mt-2 text-xs capitalize">
          {tier.tier} Chest
        </Badge>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL CHEST COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface ToolChestProps {
  items: { name: string; count: number; icon: string }[];
}

function ToolChest({ items }: ToolChestProps) {
  if (items.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-4 text-center text-muted-foreground">
          <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Your tool chest is empty</p>
          <p className="text-xs">Complete bounties to earn tools</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Package className="h-4 w-4" />
          Tool Chest
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {items.map((item, i) => (
            <div key={i} className="text-center p-2 rounded bg-muted/50">
              <span className="text-xl">{item.icon}</span>
              <p className="text-xs font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">×{item.count}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSACTION HISTORY COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface TransactionPreviewProps {
  transactions: { amount: number; reason: string; date: string }[];
  onViewAll?: () => void;
}

function TransactionPreview({ transactions, onViewAll }: TransactionPreviewProps) {
  if (transactions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-4 text-center text-muted-foreground">
          <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No transactions yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <History className="h-4 w-4" />
            Recent Activity
          </CardTitle>
          {onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              View All <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-32">
          <div className="space-y-2">
            {transactions.slice(0, 5).map((tx, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground truncate max-w-[60%]">{tx.reason}</span>
                <span className={tx.amount >= 0 ? "text-green-600" : "text-red-600"}>
                  {tx.amount >= 0 ? "+" : ""}{tx.amount}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN TREASURY DIALOG
// ═══════════════════════════════════════════════════════════════════════════════

interface TreasuryDialogProps {
  trigger?: React.ReactNode;
  defaultTab?: "ordinary" | "ghost";
}

export function TreasuryDialog({ trigger, defaultTab = "ordinary" }: TreasuryDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [ghostSession, setGhostSession] = useState<GhostSession | null>(null);

  // Load ghost session
  useEffect(() => {
    const session = getGhostSession();
    setGhostSession(session);
  }, [open]);

  // Fetch real currency data
  const { data: currency } = useQuery({
    queryKey: ["member-currency"],
    queryFn: getMemberCurrency,
    enabled: !!user && open,
  });

  // Fetch transaction history
  const { data: marksHistory } = useQuery({
    queryKey: ["marks-history"],
    queryFn: () => getMarksHistory(10),
    enabled: !!user && open,
  });

  const { data: joulesHistory } = useQuery({
    queryKey: ["joules-history"],
    queryFn: () => getJoulesHistory(10),
    enabled: !!user && open,
  });

  // Mock tool chest items (would come from database)
  const toolChestItems = [
    { name: "Wrench", count: 3, icon: "🔧" },
    { name: "Blueprint", count: 1, icon: "📜" },
    { name: "Compass", count: 2, icon: "🧭" },
  ];

  // Format transactions for display
  const recentTransactions = [
    ...(marksHistory || []).map(t => ({ amount: t.amount, reason: t.reason, date: t.createdAt })),
    ...(joulesHistory || []).map(t => ({ amount: t.joulesAmount, reason: t.reason, date: t.createdAt })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Coins className="h-4 w-4" />
            Treasury
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Your Treasury
          </DialogTitle>
          <DialogDescription>
            Your currency holdings across both worlds
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ordinary" className="gap-2">
              <Sun className="h-4 w-4" />
              Ordinary World
            </TabsTrigger>
            <TabsTrigger value="ghost" className="gap-2">
              <Ghost className="h-4 w-4" />
              Ghost World
            </TabsTrigger>
          </TabsList>

          {/* Ordinary World (Real Currencies) */}
          <TabsContent value="ordinary" className="space-y-4">
            {!user ? (
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="font-medium">Sign in to view your treasury</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your real currencies are stored securely
                  </p>
                  <Button className="mt-4" onClick={() => setOpen(false)}>
                    Sign In
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Currency Chests */}
                <div className="grid grid-cols-2 gap-3">
                  <CurrencyChest
                    label="Credits"
                    value={currency?.credits || 0}
                    icon={<Coins className="h-4 w-4 text-yellow-600" />}
                    description="Spend on services"
                  />
                  <CurrencyChest
                    label="MARKS"
                    value={currency?.marks || 0}
                    icon={<Sparkles className="h-4 w-4 text-purple-600" />}
                    description="Reputation & unlocks"
                  />
                </div>

                <CurrencyChest
                  label="Joules"
                  value={currency?.joules || 0}
                  icon={<Zap className="h-4 w-4 text-blue-600" />}
                  description={`Locked value: $${currency?.joulesLockedValue?.toFixed(2) || "0.00"}`}
                />

                {/* Mark Level Badge */}
                {currency && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium capitalize">{currency.markLevel} Level</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span className="text-sm">{currency.votingMultiplier}x voting</span>
                    </div>
                  </div>
                )}

                {/* Tool Chest */}
                <ToolChest items={toolChestItems} />

                {/* Transaction History */}
                <TransactionPreview transactions={recentTransactions} />
              </>
            )}
          </TabsContent>

          {/* Ghost World (Practice Currencies) */}
          <TabsContent value="ghost" className="space-y-4">
            {!ghostSession ? (
              <Card className="border-dashed border-purple-200 bg-purple-50/50">
                <CardContent className="pt-6 text-center">
                  <Ghost className="h-12 w-12 mx-auto mb-4 text-purple-400" />
                  <p className="font-medium">No Ghost Session Active</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start exploring to enter Ghost World
                  </p>
                  <Button variant="outline" className="mt-4" onClick={() => setOpen(false)}>
                    Enter Ghost World
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Ghost Currency Chests */}
                <div className="grid grid-cols-2 gap-3">
                  <CurrencyChest
                    label="Ghost Credits"
                    value={ghostSession.candles || 0}
                    icon={<Ghost className="h-4 w-4 text-purple-500" />}
                    description="Practice currency"
                  />
                  <CurrencyChest
                    label="Candles"
                    value={ghostSession.candles || 0}
                    icon={<span className="text-lg">🕯️</span>}
                    description="Light your way"
                  />
                </div>

                {/* Ghost Stats */}
                <Card className="bg-purple-50/50 border-purple-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Ghost Session Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Areas Discovered</p>
                        <p className="font-bold">{ghostSession.areasDiscovered?.length || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Session Started</p>
                        <p className="font-bold">
                          {new Date(ghostSession.startedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Ghost World Notice */}
                <div className="p-3 rounded-lg bg-purple-100/50 border border-purple-200 text-sm">
                  <p className="font-medium text-purple-700">Ghost World Rules</p>
                  <ul className="mt-1 text-purple-600 space-y-1">
                    <li>• Practice freely — nothing is permanent</li>
                    <li>• Crow Feathers are the ONLY thing that persists</li>
                    <li>• Join the Real World to keep your progress</li>
                  </ul>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default TreasuryDialog;
