/**
 * SPONSORSHIP PAGE — Full Sponsorship Cascade Dashboard
 * ======================================================
 * Complete view of the 60/10/20/10 sponsorship system with
 * cascade visualization, cloth pouches, and pool status.
 */

import { SponsorshipCascade } from "@/components/SponsorshipCascade";
import { ForexRatchetDisplay } from "@/components/ForexRatchetDisplay";
import { ExpandableBlock, DataVizBar } from "@/components/pudding";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TreePine, TrendingUp, Info, Users, ArrowDown, Sparkles } from "lucide-react";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function SponsorshipPage() {
  return (
    <PortalPageLayout maxWidth="lg" xrayId="sponsorship-page">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <TreePine className="h-10 w-10 text-emerald-500" />
          Sponsorship System
        </h1>
        <p className="text-muted-foreground mt-2">
          Plant seeds, watch them grow. Help others join the platform.
        </p>
      </div>

      <Tabs defaultValue="cascade" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cascade" className="gap-2">
            <TreePine className="h-4 w-4" />
            Cascade
          </TabsTrigger>
          <TabsTrigger value="ratchet" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Forex Ratchet
          </TabsTrigger>
          <TabsTrigger value="how" className="gap-2">
            <Info className="h-4 w-4" />
            How It Works
          </TabsTrigger>
        </TabsList>

        {/* Cascade Tab */}
        <TabsContent value="cascade">
          <SponsorshipCascade />
        </TabsContent>

        {/* Forex Ratchet Tab */}
        <TabsContent value="ratchet">
          <ForexRatchetDisplay />
        </TabsContent>

        {/* How It Works Tab */}
        <TabsContent value="how" className="space-y-6">
          {/* Revenue Allocation Visual */}
          <DataVizBar
            title="60/10/20/10 Patent Revenue Allocation"
            subtitle="How patent revenue is distributed"
            data={[
              { label: 'Platform & Sponsors', value: 60, color: '#22c55e', icon: '🌱' },
              { label: 'Patent Buckets', value: 10, color: '#3b82f6', icon: '📦' },
              { label: 'Founder Reserve', value: 20, color: '#f59e0b', icon: '👤' },
              { label: 'Prosecution Fund', value: 10, color: '#8b5cf6', icon: '⚖️' },
            ]}
            maxValue={100}
            showPercentages={true}
            height={28}
          />

          {/* Progressive Disclosure Sections */}
          <div className="space-y-3">
            <ExpandableBlock
              title="🌳 The Cascade Effect"
              subtitle="How sponsorships multiply through the community"
              preview="You sponsor Alice → Alice sponsors Bob & Carol → Community grows..."
              accentColor="#22c55e"
              defaultExpanded={true}
            >
              <div className="flex flex-col items-center gap-2 py-4">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                  <Users className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium">You sponsor Alice (25 Credits)</span>
                </div>
                <ArrowDown className="h-6 w-6 text-muted-foreground" />
                <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/20 border border-blue-500/30">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Alice sponsors Bob & Carol</span>
                </div>
                <ArrowDown className="h-6 w-6 text-muted-foreground" />
                <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-500/20 border border-purple-500/30">
                  <Users className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Bob & Carol sponsor 4 more...</span>
                </div>
                <ArrowDown className="h-6 w-6 text-muted-foreground" />
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/20 border border-amber-500/30">
                  <Sparkles className="h-5 w-5 text-amber-600" />
                  <span className="font-medium">Community grows exponentially</span>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-2">Minimum to Sponsor</h4>
                  <p className="text-3xl font-bold text-emerald-600">25 Credits</p>
                  <p className="text-sm text-muted-foreground mt-1">Low barrier to plant seeds</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-2">5K Community Seeder Badge</h4>
                  <p className="text-3xl font-bold text-amber-600">5,000 Credits</p>
                  <p className="text-sm text-muted-foreground mt-1">Sponsor 5K total to earn the badge</p>
                </div>
              </div>
            </ExpandableBlock>

            <ExpandableBlock
              title="💰 Allocation Breakdown"
              subtitle="Where each percentage goes"
              preview="60% Platform & Sponsors, 20% Founder, 10% Buckets, 10% Prosecution..."
              accentColor="#3b82f6"
              defaultExpanded={false}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-emerald-600">60%</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Platform & Sponsors</h4>
                    <p className="text-sm text-muted-foreground">
                      Shared between platform operations and community sponsors. $10M cap per cycle.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">10%</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Patent Buckets</h4>
                    <p className="text-sm text-muted-foreground">
                      Members can allocate up to 5,000 Credits per person to specific patent buckets.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-amber-600">20%</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Founder Reserve</h4>
                    <p className="text-sm text-muted-foreground">
                      Reserved for the founder who developed 2,007 innovations over 37 years.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-purple-600">10%</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Prosecution Fund</h4>
                    <p className="text-sm text-muted-foreground">
                      Funds patent prosecution, legal defense, and IP protection.
                    </p>
                  </div>
                </div>
              </div>
            </ExpandableBlock>

            <ExpandableBlock
              title="📬 Cloth Pouches (Forever Stamps)"
              subtitle="Lock in today's service rate for future use"
              preview="Prepay for service access at today's rate..."
              accentColor="#f59e0b"
              defaultExpanded={false}
            >
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📬</span>
                  <div>
                    <h4 className="font-medium">What it is</h4>
                    <p className="text-sm text-muted-foreground">
                      Like buying Forever Stamps — you prepay for service access at today's rate.
                      When you invoke the pouch later, you get the same service, not more service.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h4 className="font-medium">What it is NOT</h4>
                    <p className="text-sm text-muted-foreground">
                      Not an investment. Not an inflation hedge. Not tradeable.
                      This is prepaid service access, nothing more.
                    </p>
                  </div>
                </div>
              </div>
            </ExpandableBlock>
          </div>
        </TabsContent>
      </Tabs>
    </PortalPageLayout>
  );
}
