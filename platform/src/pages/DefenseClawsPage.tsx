import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Zap, Radio, Map, Scale, Compass, Users } from "lucide-react";
import { ExpandableBlock, DataVizBar } from "@/components/pudding";
import DefenseClawsPreorder from "@/components/DefenseClawsPreorder";
import DefenseClawsCoverageCheck from "@/components/DefenseClawsCoverageCheck";
import DefenseKlausColdStart from "@/components/DefenseKlausColdStart";
import DefenseKlausLawyerBounty from "@/components/DefenseKlausLawyerBounty";
import DefenseKlausTreasureMap from "@/components/DefenseKlausTreasureMap";
import DefenseKlausDaisyChain from "@/components/DefenseKlausDaisyChain";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function DefenseClawsPage() {
  return (
    <PortalPageLayout maxWidth="xl" xrayId="defense-claws">
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-purple-500" />
        <div>
          <h1 className="text-3xl font-bold">Defense Klaus™</h1>
          <p className="text-muted-foreground">
            Personal safety device + Legal Defense Fund for Members
          </p>
        </div>
      </div>

      {/* Fund Allocation Visual */}
      <DataVizBar
        title="Where Your $6 Goes"
        subtitle="100% to Legal Defense Fund — no platform cut"
        data={[
          { label: 'Legal Defense Fund', value: 100, color: '#8b5cf6', icon: '⚖️' },
        ]}
        maxValue={100}
        showPercentages={true}
        height={28}
      />

      {/* Progressive Disclosure for Features */}
      <div className="space-y-3">
        <ExpandableBlock
          title="🛡️ What is Defense Klaus™?"
          subtitle="$6 safety bracelet + Legal Defense Fund membership"
          preview="Physical protection AND legal defense for all members..."
          accentColor="#8b5cf6"
          defaultExpanded={true}
        >
          <p className="text-sm text-muted-foreground mb-4">
            Defense Klaus™ is a $6 personal safety bracelet that provides physical protection AND
            funds legal defense services for LianaBanyan members. 100% of proceeds go directly to
            the Legal Defense Fund.
          </p>
          <p className="text-sm text-purple-400 font-medium">
            "For Someone You Love" — Give protection to anyone with just an email.
          </p>
        </ExpandableBlock>

        <ExpandableBlock
          title="⚡ Product Features"
          subtitle="Physical safety device with multiple protection layers"
          preview="Bracelet pulls up to become palm claws..."
          accentColor="#ec4899"
          defaultExpanded={false}
        >
          <div className="flex items-start gap-3">
            <Zap className="h-6 w-6 text-pink-500 flex-shrink-0 mt-1" />
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Bracelet pulls up to become palm claws</li>
              <li>Plastic blades around wrist prevent grasping</li>
              <li>Dull studded edges cut and mark attacker for DNA</li>
              <li>Future: Broadcast monitoring until safe arrival</li>
            </ul>
          </div>
        </ExpandableBlock>

        <ExpandableBlock
          title="📻 Legal Defense Coverage"
          subtitle="Immediate legal services for covered members"
          preview="Sign up anyone with an email, coverage activated immediately..."
          accentColor="#22c55e"
          defaultExpanded={false}
        >
          <div className="flex items-start gap-3">
            <Radio className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Sign up anyone with an email (no confirmation sent)</li>
              <li>Coverage activated immediately upon preorder</li>
              <li>Check coverage through LB portal or volunteer line</li>
              <li>Immediate legal services if covered</li>
            </ul>
          </div>
        </ExpandableBlock>
      </div>

      <Tabs defaultValue="cold-start" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="cold-start" className="flex items-center gap-1">
            <Map className="h-3 w-3" />
            <span className="hidden sm:inline">Start</span>
          </TabsTrigger>
          <TabsTrigger value="share" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span className="hidden sm:inline">Share</span>
          </TabsTrigger>
          <TabsTrigger value="treasure" className="flex items-center gap-1">
            <Compass className="h-3 w-3" />
            <span className="hidden sm:inline">Demo</span>
          </TabsTrigger>
          <TabsTrigger value="preorder">Buy</TabsTrigger>
          <TabsTrigger value="check">Check</TabsTrigger>
          <TabsTrigger value="fund">Fund</TabsTrigger>
          <TabsTrigger value="lawyers" className="flex items-center gap-1">
            <Scale className="h-3 w-3" />
            <span className="hidden sm:inline">Legal</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cold-start" className="space-y-4">
          <DefenseKlausColdStart />
        </TabsContent>

        <TabsContent value="share" className="space-y-4">
          <DefenseKlausDaisyChain />
        </TabsContent>

        <TabsContent value="treasure" className="space-y-4">
          <DefenseKlausTreasureMap />
        </TabsContent>

        <TabsContent value="preorder" className="space-y-4">
          <DefenseClawsPreorder />
        </TabsContent>

        <TabsContent value="check" className="space-y-4">
          <DefenseClawsCoverageCheck />
        </TabsContent>

        <TabsContent value="fund" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Legal Defense Fund Status</CardTitle>
              <CardDescription>Fund supporting legal services for covered members</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Legal Defense Fund statistics and case information will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lawyers" className="space-y-4">
          <DefenseKlausLawyerBounty />
        </TabsContent>
      </Tabs>
      </div>
    </PortalPageLayout>
  );
}
