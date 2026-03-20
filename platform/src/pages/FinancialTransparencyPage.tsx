import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MultiLedgerView } from "@/components/MultiLedgerView";
import { ExpandableBlock, DataVizBar } from "@/components/pudding";
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
  Shield,
  Scale,
  FileText,
  Download,
  ExternalLink,
  CheckCircle,
  Lock,
  Eye,
  Coins,
  TrendingUp,
  Users,
  Heart,
  Building2,
} from "lucide-react";
import { PortalPageLayout } from "@/components/PortalPageLayout";

export function FinancialTransparencyPage() {
  const [activeTab, setActiveTab] = useState("ledgers");

  // Fetch DNA Lock parameters related to finances
  const { data: dnaParams } = useQuery({
    queryKey: ["dna-financial-params"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dna_lock")
        .select("*")
        .in("category", ["economics", "operations"])
        .order("parameter_key");

      if (error) throw error;
      return data;
    },
  });

  // Fetch platform stats
  const { data: platformStats } = useQuery({
    queryKey: ["platform-financial-stats"],
    queryFn: async () => {
      // Get member count
      const { count: memberCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Get Swoop stats
      const { data: swoopProjects } = await supabase
        .from("swoop_projects")
        .select("goal_amount, current_amount, status");

      const totalSwoopGoal = swoopProjects?.reduce((sum, p) => sum + (p.goal_amount || 0), 0) || 0;
      const totalSwoopRaised = swoopProjects?.reduce((sum, p) => sum + (p.current_amount || 0), 0) || 0;
      const activeProjects = swoopProjects?.filter(p => p.status === "active").length || 0;

      return {
        memberCount: memberCount || 0,
        totalSwoopGoal,
        totalSwoopRaised,
        activeProjects,
        platformFeePercent: 0,
        creatorRetention: 83.3,
      };
    },
  });

  const commitments = [
    {
      icon: Lock,
      title: "Immutable Parameters",
      description: "Core economic rules are locked in DNA Lock and cannot be changed without member vote",
    },
    {
      icon: Eye,
      title: "Full Visibility",
      description: "Every transaction is visible to members. No hidden fees, no surprises.",
    },
    {
      icon: Scale,
      title: "Separate Ledgers",
      description: "Platform operations, Swoop funds, and MSA accounts are never commingled.",
    },
    {
      icon: Shield,
      title: "Verified Projects",
      description: "All Swoop projects are verified before funds can be disbursed.",
    },
  ];

  return (
    <PortalPageLayout maxWidth="xl" xrayId="financial-transparency-page">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <Badge className="mb-4 bg-green-100 text-green-800">
          <Shield className="w-3 h-3 mr-1" />
          Full Financial Transparency
        </Badge>
        <h1 className="text-4xl font-bold mb-4">
          Every Dollar, Fully Transparent
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          At Liana Banyan, we believe you have the right to see exactly where every
          dollar goes. No hidden fees, no surprises, no commingled funds.
        </p>
      </div>

      {/* Key Stats with DataVizBar */}
      <DataVizBar
        title="Platform Economics at a Glance"
        subtitle="Core financial metrics"
        data={[
          { label: 'Creator Retention', value: platformStats?.creatorRetention || 83.3, color: '#22c55e', icon: '💰' },
          { label: 'Platform Margin', value: 16.7, color: '#f97316', icon: '🏛️' },
        ]}
        maxValue={100}
        showPercentages={true}
        height={28}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 mt-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-green-600">
              {platformStats?.creatorRetention}%
            </div>
            <p className="text-sm text-muted-foreground">Creator Retention</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-blue-600">
              {platformStats?.platformFeePercent}%
            </div>
            <p className="text-sm text-muted-foreground">Swoop Platform Fee</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-purple-600">
              {platformStats?.memberCount?.toLocaleString() || 0}
            </div>
            <p className="text-sm text-muted-foreground">Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-rose-600">
              {platformStats?.activeProjects || 0}
            </div>
            <p className="text-sm text-muted-foreground">Active Swoop Projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Commitments — Progressive Disclosure */}
      <div className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold text-center mb-4">Our Commitments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ExpandableBlock
            title="🔒 Immutable Parameters"
            subtitle="Core economic rules locked in DNA Lock"
            preview="Cannot be changed without member vote..."
            accentColor="#8b5cf6"
            defaultExpanded={false}
          >
            <div className="flex items-start gap-3">
              <Lock className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
              <p className="text-sm text-muted-foreground">
                Core economic rules are locked in DNA Lock and cannot be changed without member vote. 
                This includes the 83.3% creator/worker retention rate and the Cost + 20% platform margin.
              </p>
            </div>
          </ExpandableBlock>

          <ExpandableBlock
            title="👁️ Full Visibility"
            subtitle="Every transaction visible to members"
            preview="No hidden fees, no surprises..."
            accentColor="#22c55e"
            defaultExpanded={false}
          >
            <div className="flex items-start gap-3">
              <Eye className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <p className="text-sm text-muted-foreground">
                Every transaction is visible to members. No hidden fees, no surprises. 
                You can see exactly where every dollar goes through our multi-ledger system.
              </p>
            </div>
          </ExpandableBlock>

          <ExpandableBlock
            title="⚖️ Separate Ledgers"
            subtitle="Funds are never commingled"
            preview="Platform, Swoop, and MSA accounts separate..."
            accentColor="#3b82f6"
            defaultExpanded={false}
          >
            <div className="flex items-start gap-3">
              <Scale className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
              <p className="text-sm text-muted-foreground">
                Platform operations, Swoop funds, and MSA accounts are never commingled. 
                Each fund type has its own ledger with full audit trail.
              </p>
            </div>
          </ExpandableBlock>

          <ExpandableBlock
            title="🛡️ Verified Projects"
            subtitle="All Swoop projects verified before disbursement"
            preview="Funds protected until verification complete..."
            accentColor="#f59e0b"
            defaultExpanded={false}
          >
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
              <p className="text-sm text-muted-foreground">
                All Swoop projects are verified before funds can be disbursed. 
                This protects both donors and recipients from fraud.
              </p>
            </div>
          </ExpandableBlock>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="ledgers">
            <Coins className="w-4 h-4 mr-2" />
            Financial Ledgers
          </TabsTrigger>
          <TabsTrigger value="dna">
            <Lock className="w-4 h-4 mr-2" />
            DNA Lock Parameters
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="w-4 h-4 mr-2" />
            Reports & Audits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ledgers">
          <MultiLedgerView />
        </TabsContent>

        <TabsContent value="dna">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                DNA Lock: Immutable Economic Parameters
              </CardTitle>
              <CardDescription>
                These parameters are locked into the platform's constitution and cannot be
                changed without a formal member vote. They define the core economic rules
                that protect both creators and members.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dnaParams?.map((param) => (
                  <div
                    key={param.id}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                          {param.parameter_key}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {param.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {param.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {param.data_type === "numeric" && param.parameter_key.includes("percent")
                          ? `${param.parameter_value}%`
                          : param.parameter_value}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <Lock className="w-3 h-3" />
                        Locked
                      </div>
                    </div>
                  </div>
                ))}

                {(!dnaParams || dnaParams.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>DNA Lock parameters will appear here</p>
                  </div>
                )}

                {/* Hardcoded Critical Parameters */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-4">Core Constitutional Parameters</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Creator Retention</span>
                        <span className="text-2xl font-bold text-green-700">83.3%</span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        Creators and Workers keep 83.3% of every transaction
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Platform Margin</span>
                        <span className="text-2xl font-bold text-blue-700">Cost + 20%</span>
                      </div>
                      <p className="text-sm text-blue-600 mt-1">
                        Platform only charges cost plus 20% margin
                      </p>
                    </div>
                    <div className="p-4 bg-rose-50 rounded-lg border border-rose-200">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Swoop Platform Fee</span>
                        <span className="text-2xl font-bold text-rose-700">0%</span>
                      </div>
                      <p className="text-sm text-rose-600 mt-1">
                        100% of Swoop donations go to recipients
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Annual Membership</span>
                        <span className="text-2xl font-bold text-purple-700">$5</span>
                      </div>
                      <p className="text-sm text-purple-600 mt-1">
                        Full platform access for $5/year
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Financial Reports & Audits
              </CardTitle>
              <CardDescription>
                Regular financial reports and third-party audits to ensure accountability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Placeholder for future reports */}
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Reports Coming Soon</h3>
                  <p className="max-w-md mx-auto">
                    As the platform grows, we'll publish regular financial reports
                    and undergo third-party audits. All reports will be available
                    here for member review.
                  </p>
                </div>

                {/* What Will Be Included */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        <h4 className="font-medium">Quarterly Reports</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Revenue, expenses, and platform growth metrics
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="w-5 h-5 text-rose-500" />
                        <h4 className="font-medium">Swoop Impact Reports</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Families helped, funds disbursed, success stories
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-5 h-5 text-green-500" />
                        <h4 className="font-medium">Annual Audits</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Third-party verification of all financial claims
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom CTA */}
      <Card className="mt-8 bg-primary text-primary-foreground">
        <CardContent className="py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2">Questions About Our Finances?</h3>
              <p className="text-primary-foreground/70">
                We're committed to answering any questions about how funds are managed.
              </p>
            </div>
            <Button variant="secondary" size="lg">
              <ExternalLink className="w-4 h-4 mr-2" />
              Contact Us
            </Button>
          </div>
        </CardContent>
      </Card>
    </PortalPageLayout>
  );
}

export default FinancialTransparencyPage;
