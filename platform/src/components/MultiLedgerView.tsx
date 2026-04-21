import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wallet,
  Heart,
  Shield,
  Scale,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Download,
  Filter,
  TrendingUp,
  Building2,
  Users,
  Landmark,
  FlaskConical,
} from "lucide-react";
import { FOUNDING_TRANSACTIONS, FOUNDING_LEDGER_SUMMARY, type FoundingTransaction } from "@/data/foundingTransactions";

type LedgerType = "platform" | "swoop" | "msa" | "escrow" | "treasury" | "rd";

interface LedgerSummary {
  type: LedgerType;
  name: string;
  description: string;
  icon: React.ElementType;
  balance: number;
  totalIn: number;
  totalOut: number;
  transactionCount: number;
  color: string;
}

interface Transaction {
  id: string;
  ledger: LedgerType;
  type: "credit" | "debit" | "transfer";
  amount: number;
  description: string;
  reference_id?: string;
  reference_type?: string;
  created_at: string;
  counterparty?: string;
}

const LEDGER_CONFIG: Record<LedgerType, Omit<LedgerSummary, "balance" | "totalIn" | "totalOut" | "transactionCount">> = {
  platform: {
    type: "platform",
    name: "Platform Operations",
    description: "Core platform revenue and operational expenses",
    icon: Building2,
    color: "blue",
  },
  swoop: {
    type: "swoop",
    name: "Swoop Master Fund",
    description: "Pooled donations for crisis support projects",
    icon: Heart,
    color: "rose",
  },
  msa: {
    type: "msa",
    name: "MSA Pool",
    description: "Medical Savings Account contributions and matches",
    icon: Shield,
    color: "green",
  },
  escrow: {
    type: "escrow",
    name: "Escrow Holdings",
    description: "Funds held pending verification or release",
    icon: Scale,
    color: "amber",
  },
  treasury: {
    type: "treasury",
    name: "Treasury Reserve",
    description: "Platform reserves and emergency fund",
    icon: Landmark,
    color: "purple",
  },
  rd: {
    type: "rd",
    name: "R&D (Founding Period)",
    description: "Research & Development expenditures 2017-2026",
    icon: FlaskConical,
    color: "indigo",
  },
};

export function MultiLedgerView() {
  const [selectedLedger, setSelectedLedger] = useState<LedgerType | "all">("all");
  const [transactionFilter, setTransactionFilter] = useState<"all" | "credit" | "debit" | "transfer">("all");
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">("30d");

  // Fetch ledger summaries
  const { data: ledgerSummaries, isLoading: summariesLoading } = useQuery({
    queryKey: ["ledger-summaries"],
    queryFn: async () => {
      // In production, this would aggregate from actual ledger tables
      // For now, return mock data structure
      const summaries: LedgerSummary[] = Object.entries(LEDGER_CONFIG).map(([type, config]) => ({
        ...config,
        type: type as LedgerType,
        balance: 0,
        totalIn: 0,
        totalOut: 0,
        transactionCount: 0,
      }));

      // Add founding period data
      const treasurySummary = summaries.find(s => s.type === "treasury");
      if (treasurySummary) {
        treasurySummary.totalIn = FOUNDING_LEDGER_SUMMARY.totalFundingReceived;
        treasurySummary.totalOut = FOUNDING_LEDGER_SUMMARY.totalFundingReceived; // Transferred to R&D
        treasurySummary.balance = 0; // All deployed
        treasurySummary.transactionCount = 1;
      }

      const rdSummary = summaries.find(s => s.type === "rd");
      if (rdSummary) {
        rdSummary.totalIn = FOUNDING_LEDGER_SUMMARY.totalFundingReceived;
        rdSummary.totalOut = FOUNDING_LEDGER_SUMMARY.totalRDExpended;
        rdSummary.balance = 0; // All spent on R&D
        rdSummary.transactionCount = 2;
      }

      // Try to get Swoop master fund balance
      const { data: swoopFund } = await supabase
        .from("swoop_master_fund")
        .select("current_balance, total_received, total_disbursed")
        .single();

      if (swoopFund) {
        const swoopSummary = summaries.find(s => s.type === "swoop");
        if (swoopSummary) {
          swoopSummary.balance = swoopFund.current_balance || 0;
          swoopSummary.totalIn = swoopFund.total_received || 0;
          swoopSummary.totalOut = swoopFund.total_disbursed || 0;
        }
      }

      return summaries;
    },
  });

  // Fetch transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["ledger-transactions", selectedLedger, transactionFilter, dateRange],
    queryFn: async () => {
      // Start with founding transactions
      const txns: Transaction[] = FOUNDING_TRANSACTIONS.map(ft => ({
        id: ft.id,
        ledger: ft.ledger as LedgerType,
        type: ft.type,
        amount: ft.amount,
        description: ft.description + (ft.isAggregated ? ` (${ft.aggregatedCount?.toLocaleString()} aggregated)` : ''),
        reference_id: ft.reference,
        reference_type: ft.category,
        created_at: ft.date,
        counterparty: ft.counterparty,
      }));

      // Try to get Swoop transactions
      const { data: swoopTxns } = await supabase
        .from("swoop_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (swoopTxns) {
        txns.push(...swoopTxns.map(t => ({
          id: t.id,
          ledger: "swoop" as LedgerType,
          type: t.transaction_type === "donation" ? "credit" : "debit" as "credit" | "debit" | "transfer",
          amount: t.amount,
          description: t.description || t.transaction_type,
          reference_id: t.project_id,
          reference_type: "swoop_project",
          created_at: t.created_at,
          counterparty: t.donor_name,
        })));
      }

      // Sort by date descending
      txns.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return txns;
    },
  });

  const totalBalance = ledgerSummaries?.reduce((sum, l) => sum + l.balance, 0) || 0;

  const getColorClasses = (color: string) => ({
    bg: `bg-${color}-100`,
    text: `text-${color}-700`,
    border: `border-${color}-200`,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financial Ledgers</h2>
          <p className="text-muted-foreground">
            Complete transparency into all platform financial flows
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Total Balance Card */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm">Total Platform Holdings</p>
              <p className="text-4xl font-bold mt-1">{formatCurrency(totalBalance)}</p>
              <p className="text-slate-400 text-sm mt-2">
                Across {ledgerSummaries?.length || 0} separate ledgers
              </p>
            </div>
            <div className="text-right">
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                <TrendingUp className="w-3 h-3 mr-1" />
                Fully Transparent
              </Badge>
              <p className="text-slate-400 text-xs mt-2">
                Every dollar tracked & auditable
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ledger Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ledgerSummaries?.map((ledger) => {
          const Icon = ledger.icon;
          const colors = getColorClasses(ledger.color);

          return (
            <Card
              key={ledger.type}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedLedger === ledger.type ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedLedger(ledger.type)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${colors.bg}`}>
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {ledger.transactionCount} txns
                  </Badge>
                </div>
                <CardTitle className="text-lg">{ledger.name}</CardTitle>
                <CardDescription className="text-xs">
                  {ledger.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Balance</span>
                    <span className="text-xl font-bold">{formatCurrency(ledger.balance)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center text-green-600">
                      <ArrowDownLeft className="w-3 h-3 mr-1" />
                      In: {formatCurrency(ledger.totalIn)}
                    </span>
                    <span className="flex items-center text-red-600">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      Out: {formatCurrency(ledger.totalOut)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                {selectedLedger === "all"
                  ? "All ledger transactions"
                  : `${LEDGER_CONFIG[selectedLedger]?.name} transactions`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={transactionFilter} onValueChange={(v: any) => setTransactionFilter(v)}>
                <SelectTrigger className="w-32">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="credit">Credits</SelectItem>
                  <SelectItem value="debit">Debits</SelectItem>
                  <SelectItem value="transfer">Transfers</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : transactions && transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Ledger</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Counterparty</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="text-sm">
                      {formatDate(txn.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {LEDGER_CONFIG[txn.ledger]?.name || txn.ledger}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {txn.type === "credit" && (
                        <Badge className="bg-green-100 text-green-700">
                          <ArrowDownLeft className="w-3 h-3 mr-1" />
                          Credit
                        </Badge>
                      )}
                      {txn.type === "debit" && (
                        <Badge className="bg-red-100 text-red-700">
                          <ArrowUpRight className="w-3 h-3 mr-1" />
                          Debit
                        </Badge>
                      )}
                      {txn.type === "transfer" && (
                        <Badge className="bg-blue-100 text-blue-700">
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Transfer
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {txn.description}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {txn.counterparty || "—"}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${
                      txn.type === "credit" ? "text-green-600" :
                      txn.type === "debit" ? "text-red-600" : ""
                    }`}>
                      {txn.type === "credit" ? "+" : txn.type === "debit" ? "-" : ""}
                      {formatCurrency(txn.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Coins className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No transactions yet</p>
              <p className="text-sm">Transactions will appear here as the platform grows</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transparency Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Full Financial Transparency</p>
              <p className="mt-1">
                Every dollar that flows through Liana Banyan is tracked in separate,
                purpose-specific ledgers. Platform operations, Swoop donations, MSA funds,
                and escrow holdings are never commingled. All transactions are auditable
                and visible to members.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default MultiLedgerView;
