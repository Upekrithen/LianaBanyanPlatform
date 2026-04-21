import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Coins,
  Users,
  TrendingUp,
  Shield,
  QrCode,
  Fingerprint,
  Lock,
  Unlock
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function MedallionFundingExplainer() {
  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/20">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">The Medallion: Your Foundation of Participation</CardTitle>
              <CardDescription className="text-base mt-1">
                The hexagonal medallion token is your proof of membership, contribution, and commitment to this project
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="mechanism" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="mechanism">Funding Mechanism</TabsTrigger>
          <TabsTrigger value="levels">Funding Levels</TabsTrigger>
          <TabsTrigger value="connection">Member Connection</TabsTrigger>
          <TabsTrigger value="qr">QR Code</TabsTrigger>
        </TabsList>

        {/* Funding Mechanism Tab */}
        <TabsContent value="mechanism" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                How Medallion Funding Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Foundation First</h4>
                    <p className="text-sm text-muted-foreground">
                      The Medallion must be funded before any other products in the project. This demonstrates
                      community interest and provides the initial resource pool for project operations.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Tiered Funding Structure</h4>
                    <p className="text-sm text-muted-foreground">
                      Four progressive funding levels allow gradual community building. Each level requires more
                      total votes but offers better per-unit pricing as the community grows.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Pool Contribution</h4>
                    <p className="text-sm text-muted-foreground">
                      33.33% of all Medallion pledges go into the LB Funding Pool, which funds:
                    </p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1 ml-4">
                      <li>EOI (Expression of Interest) credit conversions for early supporters</li>
                      <li>Gas fees for verified Medallion minting (~1% of pool)</li>
                      <li>Operational costs for project growth</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Participation Assignment</h4>
                    <p className="text-sm text-muted-foreground">
                      Your Medallion pledge converts to project participation based on your time commitment.
                      Longer commitments = higher participation ratio, shorter = more cash value. This aligns
                      incentives with long-term project success.
                    </p>
                  </div>
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Why the Medallion must be first:</strong> It proves there's real community interest
                  before manufacturing begins on any products. Without Medallion funding, the project cannot proceed.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Funding Levels Tab */}
        <TabsContent value="levels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Medallion Funding Levels
              </CardTitle>
              <CardDescription>
                Four tiers with increasing community size and better pricing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Level 1 - Seed Funding */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-base">Level 1</Badge>
                    <h4 className="font-bold text-lg">Seed Funding</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">$5.00</p>
                    <p className="text-xs text-muted-foreground">per unit</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Units Produced</p>
                    <p className="font-semibold">100</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Votes Needed</p>
                    <p className="font-semibold">$500</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  First 100 supporters who believe in the project vision. Highest per-unit cost
                  but earliest entry and maximum recognition as a founding member.
                </p>
              </div>

              {/* Level 2 - Early Supporter */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-base">Level 2</Badge>
                    <h4 className="font-bold text-lg">Early Supporter</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">$4.50</p>
                    <p className="text-xs text-muted-foreground">per unit</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Units Produced</p>
                    <p className="font-semibold">250</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Votes Needed</p>
                    <p className="font-semibold">$1,125</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Growing community of 250 members. 10% discount from Level 1 as the project
                  gains momentum and proves viability.
                </p>
              </div>

              {/* Level 3 - Community Builder */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-base">Level 3</Badge>
                    <h4 className="font-bold text-lg">Community Builder</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">$4.00</p>
                    <p className="text-xs text-muted-foreground">per unit</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Units Produced</p>
                    <p className="font-semibold">500</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Votes Needed</p>
                    <p className="font-semibold">$2,000</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Solid community of 500 members. 20% discount from Level 1, showing the value
                  of collective participation and shared membership.
                </p>
              </div>

              {/* Level 4 - Project Champion */}
              <div className="border rounded-lg p-4 space-y-3 border-primary/50 bg-primary/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className="text-base">Level 4</Badge>
                    <h4 className="font-bold text-lg">Project Champion</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">$3.50</p>
                    <p className="text-xs text-muted-foreground">per unit</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Units Produced</p>
                    <p className="font-semibold">1,000</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Votes Needed</p>
                    <p className="font-semibold">$3,500</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>Fully funded community of 1,000 champions!</strong> 30% discount from Level 1.
                  At this level, the project unlocks and can begin producing other products.
                </p>
              </div>

              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  <strong>Volume Benefits:</strong> Each level offers better pricing as more people join.
                  Everyone benefits from growing the community together!
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Member Connection Tab */}
        <TabsContent value="connection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                How Medallion Connects Members
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Fingerprint className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-2">Your Unique Identity</h4>
                    <p className="text-sm text-muted-foreground">
                      Each Medallion is tied to your authenticated account. It serves as your digital identity
                      within the project ecosystem, tracking your participation, voting power, and contribution history.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-2">Ledger Verification</h4>
                    <p className="text-sm text-muted-foreground">
                      Your Medallion is minted as an ERC-1155 token on Base L2, creating an immutable record of your
                      membership and contribution. The verified ledger ensures transparency and prevents tampering.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <TrendingUp className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-2">Collective Participation</h4>
                    <p className="text-sm text-muted-foreground">
                      Your Medallion represents fractional participation in the project. All Medallion holders collectively
                      participate in and govern the project through ranked-choice voting on production priorities.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Users className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-2">Community Network</h4>
                    <p className="text-sm text-muted-foreground">
                      Medallion holders form a committed community. You can see total member count, funding progress,
                      and growth milestones. Together, you make decisions about what products get produced and when.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-primary pl-4 py-2 bg-primary/5 rounded-r">
                <p className="text-sm font-semibold mb-1">Live Member Stats</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Your Participation Share</p>
                    <p className="font-bold">Updates in real-time with each vote</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Your Voting Power</p>
                    <p className="font-bold">Based on pledge amount & time commitment</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* QR Code Tab */}
        <TabsContent value="qr" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Code Functionality
              </CardTitle>
              <CardDescription>
                Understanding how the Medallion QR code works
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> The QR code is a generic link to this page. It does NOT contain
                  your private information or grant automatic access to your value.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <QrCode className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">What the QR Code Links To</h4>
                    <p className="text-sm text-muted-foreground">
                      The QR code simply links to this Medallion product page. Anyone can scan it to learn
                      about the project and see the funding levels.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Requires Your Credentials</h4>
                    <p className="text-sm text-muted-foreground">
                      To see YOUR specific value, participation, and voting power, you must log in with your account
                      credentials. The QR code alone grants no access to your personal data.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Share With Anyone</h4>
                    <p className="text-sm text-muted-foreground">
                      You can share the QR code (or page link) with friends, family, or potential backers.
                      They'll see the project details and can create their own account to participate.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Unlock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Only Applies Value to Registered Members</h4>
                    <p className="text-sm text-muted-foreground">
                      When someone scans your QR code and signs up, they create their own account and separate
                      Medallion. Your value is tied to YOUR authenticated identity, not the QR code itself.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-muted/50">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Security Note
                </h4>
                <p className="text-sm text-muted-foreground">
                  Your Medallion value is protected by:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1 ml-4">
                  <li>Account authentication (email/password or social login)</li>
                  <li>Wallet connection (for verified minting)</li>
                  <li>Database row-level security policies</li>
                  <li>Encrypted credential storage</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-3">
                  The QR code is merely a convenience link - your value requires proper authentication.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
