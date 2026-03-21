import { PortalPageLayout } from '@/components/PortalPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceValueCalculator } from "@/components/ServiceValueCalculator";
import { SponsorshipFlowDiagram } from "@/components/ConversionFlowDiagram";
import { ArrowRight, TrendingUp, Clock, DollarSign, Award, ShieldCheck } from "lucide-react";

const ContributionExplainer = () => {
  return (
    <PortalPageLayout maxWidth="xl" xrayId="contribution-explainer">
      <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Sponsorship Guide</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          How Kickstarter backers receive service credits and platform participation on Liana Banyan
        </p>
      </div>

      {/* Test-Net Disclaimer */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4">
          <p className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 flex-shrink-0" />
            <span>
              <strong>Test-Net by Design:</strong> Liana Banyan operates as a cooperative service platform.
              All participation units are platform service credits, not securities or financial instruments.
              No expectation of profit. No speculative value. Service access only.
            </span>
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="flow">How It Works</TabsTrigger>
          <TabsTrigger value="calculator">Service Calculator</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-6 w-6" />
                How Sponsorship Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                When you back a project on Kickstarter through Liana Banyan, your pledge converts into
                platform service credits. These credits give you access to cooperative services and
                participation in the projects you support.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <Card className="border-primary/20">
                  <CardHeader>
                    <Clock className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-lg">Time Commitment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Choose your service commitment period. Longer commitment unlocks more participation
                      in the cooperative and its projects.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-primary/20">
                  <CardHeader>
                    <TrendingUp className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-lg">Participation Ratio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Percentage allocated to cooperative membership participation. Ranges from 10% (short) to 90% (long commitment).
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-primary/20">
                  <CardHeader>
                    <DollarSign className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-lg">Credit Ratio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Remainder as product credits for use across the platform. Ranges from 90% (short) to 10% (long commitment).
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>The Cost+20% Promise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-6 rounded-lg text-sm">
                <div className="space-y-2">
                  <div className="font-semibold">Liana Banyan's economic DNA is locked by constitutional rule:</div>
                  <div className="ml-4">• Creators keep <strong>83.3%</strong> of every transaction</div>
                  <div className="ml-4">• Platform takes exactly <strong>Cost+20%</strong> — no more, ever</div>
                  <div className="ml-4">• Three-Gear Currency: Credits (1:1 USD), Marks (backed by Joules), Joules (forever stamps)</div>
                </div>
              </div>

              <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                <p className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Why Back Early?
                </p>
                <p className="text-sm text-muted-foreground">
                  Early backers help establish the cooperative's foundation. Your sponsorship directly funds
                  the creation of services that benefit all members. Early members shape governance and
                  help define how the cooperative operates from day one.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flow Tab */}
        <TabsContent value="flow" className="space-y-6">
          <SponsorshipFlowDiagram />
        </TabsContent>

        {/* Calculator Tab */}
        <TabsContent value="calculator" className="space-y-6">
          <ServiceValueCalculator />
        </TabsContent>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-6">
          <div className="grid gap-6">
            {/* Scenario 1: Long-term Backer */}
            <Card className="border-green-500/30">
              <CardHeader>
                <CardTitle className="text-green-600 dark:text-green-400">
                  Scenario 1: Founding Member
                </CardTitle>
                <CardDescription>180-day commitment (Maximum cooperative participation)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Initial Pledge</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Kickstarter pledge: $500</li>
                      <li>• Time commitment: 180 days</li>
                      <li>• Participation ratio: 90%</li>
                      <li>• Credit ratio: 10%</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">What You Receive</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• $450 → Cooperative membership participation</li>
                      <li>• $50 → Product credits (use across platform)</li>
                      <li>• Governance voice in project decisions</li>
                      <li>• Access to all cooperative services</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <ArrowRight className="h-5 w-5" />
                    What This Means
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p>• Full voting participation in cooperative governance</p>
                    <p>• Priority access to new projects and services</p>
                    <p>• Founding member recognition on the Transparent Ledger</p>
                    <p className="font-medium text-green-600 mt-2">You helped build the cooperative from the ground up.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scenario 2: Balanced Backer */}
            <Card className="border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-blue-600 dark:text-blue-400">
                  Scenario 2: Active Member
                </CardTitle>
                <CardDescription>90-day commitment (Balanced participation/credits)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Initial Pledge</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Kickstarter pledge: $500</li>
                      <li>• Time commitment: 90 days</li>
                      <li>• Participation ratio: 50%</li>
                      <li>• Credit ratio: 50%</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">What You Receive</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• $250 → Cooperative membership participation</li>
                      <li>• $250 → Product credits</li>
                      <li>• Standard voting participation</li>
                      <li>• Access to cooperative services</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <ArrowRight className="h-5 w-5" />
                    What This Means
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p>• Balanced mix of platform access and product credits</p>
                    <p>• Use credits to purchase from cooperative marketplace</p>
                    <p>• Participate in governance decisions affecting your projects</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scenario 3: Product-focused Backer */}
            <Card className="border-amber-500/30">
              <CardHeader>
                <CardTitle className="text-amber-600 dark:text-amber-400">
                  Scenario 3: Product Backer
                </CardTitle>
                <CardDescription>30-day commitment (Maximum product credits)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Initial Pledge</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Kickstarter pledge: $500</li>
                      <li>• Time commitment: 30 days</li>
                      <li>• Participation ratio: 10%</li>
                      <li>• Credit ratio: 90%</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">What You Receive</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• $50 → Cooperative membership participation</li>
                      <li>• $450 → Product credits</li>
                      <li>• Basic voting participation</li>
                      <li>• Immediate product access</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-amber-500/10 p-4 rounded-lg border border-amber-500/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <ArrowRight className="h-5 w-5" />
                    What This Means
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p>• Primarily focused on getting products and services</p>
                    <p>• $450 in credits to spend across the cooperative marketplace</p>
                    <p>• Minimal governance participation, maximum product value</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparison Summary */}
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle>Sponsorship Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Strategy</th>
                      <th className="text-right p-2">Pledge</th>
                      <th className="text-right p-2">Participation</th>
                      <th className="text-right p-2">Credits</th>
                      <th className="text-right p-2">Governance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 font-medium text-green-600">Founding Member</td>
                      <td className="text-right p-2">$500</td>
                      <td className="text-right p-2">$450</td>
                      <td className="text-right p-2">$50</td>
                      <td className="text-right p-2 font-bold text-green-600">Full</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium text-blue-600">Active Member</td>
                      <td className="text-right p-2">$500</td>
                      <td className="text-right p-2">$250</td>
                      <td className="text-right p-2">$250</td>
                      <td className="text-right p-2 font-bold text-blue-600">Standard</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium text-amber-600">Product Backer</td>
                      <td className="text-right p-2">$500</td>
                      <td className="text-right p-2">$50</td>
                      <td className="text-right p-2">$450</td>
                      <td className="text-right p-2 font-bold text-amber-600">Basic</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                All sponsorship tiers include cooperative membership. Credits never expire and maintain 1:1 USD value.
                Participation units are service access rights, not financial instruments.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </PortalPageLayout>
  );
};

export default ContributionExplainer;
