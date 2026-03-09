import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Download, Printer, FileText, Lightbulb, Video, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { GoogleDocImporter } from "@/components/GoogleDocImporter";
import { HexisleCampaignManager } from "@/components/HexisleCampaignManager";
import { HexelViewer3D } from "@/components/HexelViewer3D";
import hexisleHarvestConcept from "@/assets/hexisle-harvest-concept.png";

export default function CampaignProduction() {
  const { workstationId } = useParams();
  const [activeTab, setActiveTab] = useState("hexisle");

  // Fetch workstation details
  const { data: workstation } = useQuery({
    queryKey: ['workstation', workstationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workstations')
        .select('*, projects(*)')
        .eq('id', workstationId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!workstationId,
  });

  // Fetch project features
  const { data: features } = useQuery({
    queryKey: ['project-features', workstation?.project_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_features')
        .select('*')
        .eq('project_id', workstation?.project_id);

      if (error) throw error;
      return data;
    },
    enabled: !!workstation?.project_id,
  });

  // Fetch existing assets (video scripts, business plans, etc.)
  const { data: assets } = useQuery({
    queryKey: ['workstation-assets', workstationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_submissions')
        .select('*')
        .eq('workstation_id', workstationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!workstationId,
  });

  const businessPlanEnabled = features?.find(f => f.feature_name === 'business_plan_generator')?.is_enabled;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  const videoScriptTabs = [
    { id: "hexisle", title: "HexIsle: Chapter 1", icon: Video },
    { id: "system-analysis", title: "System Analysis", icon: FileText },
    { id: "strategic-insights", title: "Strategic Insights", icon: Sparkles },
    { id: "liana-banyan-fable", title: "Liana Banyan Fable", icon: Video },
    { id: "credit-system", title: "How Credits Work", icon: FileText },
    { id: "guild-progression", title: "Guild Progression", icon: Lightbulb },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6 overflow-x-hidden max-w-full">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{workstation?.workstation_name}</h1>
          <p className="text-muted-foreground">{workstation?.projects?.name} - Campaign Production</p>
        </div>
      </div>

      {workstation?.project_id && (
        <GoogleDocImporter 
          projectId={workstation.project_id}
          workstationId={workstationId}
          onImportComplete={() => {
            toast.success("Asset imported and locked successfully");
          }}
        />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap w-full h-auto gap-2 p-2">
          {videoScriptTabs.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex-shrink-0">
              <tab.icon className="mr-2 h-4 w-4" />
              {tab.title}
            </TabsTrigger>
          ))}
          {businessPlanEnabled && (
            <TabsTrigger value="business-plan" className="flex-shrink-0">
              <FileText className="mr-2 h-4 w-4" />
              Business Plan
            </TabsTrigger>
          )}
        </TabsList>

        {videoScriptTabs.map(tab => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-4">
            {tab.id === "system-analysis" ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>LB System Analysis: Wave Pricing, HexIsle & IP Participation</CardTitle>
                      <CardDescription>Comprehensive analysis of the integrated platform architecture</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownload(document.getElementById('system-analysis-content')?.innerText || '', 'LB-System-Analysis.md')}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent id="system-analysis-content" className="prose dark:prose-invert max-w-none space-y-6">
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Wave-Based Pricing System (Grade: A-)</h2>
                    
                    <h3 className="text-xl font-semibold">For Consumers</h3>
                    <div className="space-y-2">
                      <p><strong>Pros:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li><strong>Transparent Choice:</strong> Price vs. time tradeoff is clear and upfront</li>
                        <li><strong>Premium Option:</strong> Those who value speed can pay for early delivery</li>
                        <li><strong>Value Option:</strong> Patient customers get better prices in later waves</li>
                        <li><strong>Fair Protection:</strong> 1/3 FCFS slots at base price protect early supporters from surge</li>
                      </ul>
                      <p><strong>Cons:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li><strong>Perception Risk:</strong> Surge pricing can feel exploitative if not framed as "funding expansion"</li>
                        <li><strong>Complexity:</strong> Multiple pricing tiers require more decision-making</li>
                      </ul>
                    </div>

                    <h3 className="text-xl font-semibold">For Members & Production Nodes</h3>
                    <div className="space-y-2">
                      <p><strong>Pros:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li><strong>Predictable Work:</strong> Wave system creates stable production schedule</li>
                        <li><strong>Funded Expansion:</strong> Premium from early waves directly finances new nodes</li>
                        <li><strong>Sustainable Capacity:</strong> Growth is capital-efficient and self-funded</li>
                        <li><strong>Quality Focus:</strong> No pressure to rush - each wave has set timeline</li>
                      </ul>
                      <p><strong>Cons:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li><strong>Coordination Complexity:</strong> Managing multiple waves requires sophisticated logistics</li>
                      </ul>
                    </div>

                    <h3 className="text-xl font-semibold">For Liana Banyan (LB)</h3>
                    <div className="space-y-2">
                      <p><strong>Pros:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li><strong>Non-Dilutive Funding:</strong> "Impatience tax" funds growth without selling participation</li>
                        <li><strong>Market Efficiency:</strong> Prices signal and manage demand automatically</li>
                        <li><strong>Network Effects:</strong> More nodes → more capacity → faster delivery → more demand</li>
                        <li><strong>Risk Management:</strong> Graduated pricing tests market before full commitment</li>
                      </ul>
                      <p><strong>Cons:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li><strong>Brand Risk:</strong> Must carefully message surge pricing to avoid backlash</li>
                        <li><strong>Operational Overhead:</strong> Complex system to build and maintain</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4 border-t pt-6">
                    <h2 className="text-2xl font-bold">HexIsle Integration (Grade: A)</h2>
                    
                    <h3 className="text-xl font-semibold">Genius Elements</h3>
                    <div className="space-y-2">
                      <p><strong>Team-Based Skill Development:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>No single person needs ALL skills - just like real companies</li>
                        <li>Guild/Clan system naturally encourages collaboration</li>
                        <li>Makes abstract experience visible and gamified</li>
                      </ul>
                      <p><strong>Dual Mode System:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li><strong>Casual Mode:</strong> Pure game enjoyment, no pressure</li>
                        <li><strong>Real Stakes Mode:</strong> Projects map to islands, verified XP</li>
                        <li><strong>Hybrid Option:</strong> Test skills casually before real stakes</li>
                      </ul>
                      <p><strong>Natural Recruitment Tool:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Need a Navigator expert? Search guild members with Lvl 5+ Navigate</li>
                        <li>Team formation based on complementary skills</li>
                        <li>Achievement-driven profile becomes resume</li>
                      </ul>
                    </div>

                    <h3 className="text-xl font-semibold">Risks & Mitigations</h3>
                    <div className="space-y-2">
                      <p><strong>Risks:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li><strong>Complexity:</strong> 7 islands × 2 modes × team dynamics = steep learning curve</li>
                        <li><strong>Grinding:</strong> If progression feels like work, defeats the purpose</li>
                        <li><strong>Verification Burden:</strong> Real stakes requires proof of skill development</li>
                      </ul>
                      <p><strong>Mitigations:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Start with casual mode only, add real stakes later</li>
                        <li>Focus on skill marketplace first - let players find teammates</li>
                        <li>Use project outcomes as verification proxy (delivered = XP earned)</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4 border-t pt-6">
                    <h2 className="text-2xl font-bold">IP Participation + Common Currency (Grade: B+)</h2>
                    
                    <h3 className="text-xl font-semibold">Brilliant Aspects</h3>
                    <div className="space-y-2">
                      <p><strong>Universal Unit:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Credits work for purchases, contracts, wages, and participation</li>
                        <li>Reduces friction in multi-party transactions</li>
                        <li>Creates internal economy with real value backing</li>
                      </ul>
                      <p><strong>Contribution-Based Participation:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>IP service units distributed via credits earned on projects</li>
                        <li>Aligns incentives - work quality = participation allocation</li>
                        <li>Transparent, auditable contribution tracking</li>
                      </ul>
                    </div>

                    <h3 className="text-xl font-semibold">Significant Challenges</h3>
                    <div className="space-y-2">
                      <p><strong>Cognitive Load:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Project Credits vs. Medallion Credits vs. LB Credits - confusing</li>
                        <li>Need crystal-clear documentation and UX</li>
                      </ul>
                      <p><strong>Liquidity:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>How do members cash out? Especially medallion credits?</li>
                        <li>Need withdrawal mechanisms or marketplace</li>
                      </ul>
                      <p><strong>Tax Complexity:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Are credits income when earned? When converted? When withdrawn?</li>
                        <li>IP participation creates phantom income on paper gains</li>
                        <li><strong>CRITICAL:</strong> Needs legal review before launch</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4 border-t pt-6">
                    <h2 className="text-2xl font-bold">Synthesis: The Virtuous Cycle</h2>
                    <div className="space-y-3">
                      <p className="text-lg">When all three systems work together:</p>
                      <ol className="list-decimal list-inside space-y-2 ml-4">
                        <li><strong>Wave Pricing:</strong> Early buyers fund node expansion via "impatience tax"</li>
                        <li><strong>Node Expansion:</strong> More capacity = more work opportunities for members</li>
                        <li><strong>HexIsle Skills:</strong> Workers gain verified skills through real project work</li>
                        <li><strong>Guild Formation:</strong> Skilled teams form to take on bigger projects</li>
                        <li><strong>Project Success:</strong> Quality work earns credits + IP participation</li>
                        <li><strong>Credit Economy:</strong> Members reinvest credits in platform, creating demand</li>
                        <li><strong>More Production:</strong> Higher demand → more waves → more nodes → repeat</li>
                      </ol>
                      <p className="text-lg font-semibold mt-4">Result: Self-sustaining, fair, transparent, skill-based economy</p>
                    </div>
                  </div>

                  <div className="space-y-4 border-t pt-6">
                    <h2 className="text-2xl font-bold">Critical Success Factors</h2>
                    <div className="space-y-2">
                      <p><strong>Must Have:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li><strong>Simplicity in Onboarding:</strong> Start users with ONE clear path</li>
                        <li><strong>Transparent Accounting:</strong> Members must see exactly where value flows</li>
                        <li><strong>Legal Soundness:</strong> Credits + participation structure must survive regulatory scrutiny</li>
                        <li><strong>Community Trust:</strong> Early adopters become evangelists if treated fairly</li>
                      </ul>
                      <p><strong>Phase Implementation:</strong></p>
                      <ol className="list-decimal list-inside space-y-1 ml-4">
                        <li><strong>Phase 1:</strong> Launch wave system only - prove pricing model</li>
                        <li><strong>Phase 2:</strong> Add HexIsle casual mode - build engagement</li>
                        <li><strong>Phase 3:</strong> Connect HexIsle to projects - verify real stakes</li>
                        <li><strong>Phase 4:</strong> Full IP participation integration - mature economy</li>
                      </ol>
                    </div>
                  </div>

                  <div className="space-y-4 border-t pt-6 bg-primary/5 p-4 rounded-lg">
                    <h2 className="text-2xl font-bold">Bottom Line</h2>
                    <p className="text-lg">
                      This is an <strong>ambitious, potentially revolutionary system</strong> that could genuinely create 
                      a fairer alternative to traditional venture-backed startups. The integration of pricing mechanism, 
                      skill development, and participation distribution is theoretically sound.
                    </p>
                    <p className="text-lg">
                      <strong>However</strong>, the complexity is the biggest enemy. Success requires ruthless simplification, 
                      phased rollout, and unwavering transparency. If executed well, this could be the operating system 
                      for the next generation of worker-owned cooperatives and project-based organizations.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : tab.id === "strategic-insights" ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Strategic Insights Summary</CardTitle>
                      <CardDescription>Economic principles & efficiency wins in Liana Banyan architecture</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownload(document.getElementById('strategic-insights-content')?.innerText || '', 'Strategic-Insights-Summary.md')}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent id="strategic-insights-content" className="prose dark:prose-invert max-w-none space-y-6">
                  <div className="space-y-4">
                    <div className="bg-primary/10 p-4 rounded-lg">
                      <p><strong>Purpose:</strong> This document catalogs strategic design decisions that leverage economic principles, game theory, and system efficiency gains.</p>
                      <p className="text-sm text-muted-foreground mt-2">Document Version: 2.0 | Last Updated: 2025-10-17</p>
                    </div>

                    <h2 className="text-2xl font-bold border-b pb-2">Part I: Foundational Strategic Wins</h2>
                    
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">1. Self-Funding Guild Contribution Model</h3>
                      <p className="text-sm font-medium text-primary">Economic Principle: Reverse Risk Pool</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Guild stake payments ($500 → $67,500 progressive) create perpetually solvent fund</li>
                        <li>Stakes are non-refundable but grant voting participation in LB governance</li>
                        <li><strong>Zero external debt required</strong> - no VC dilution, no interest payments</li>
                        <li>Members literally committed (skin in the game) creating accountability</li>
                      </ul>
                      <p className="text-sm italic text-muted-foreground mt-2">Competitive Moat: Traditional platforms extract 20% fees forever. LB members pay once, own forever.</p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">2. Wave-Based Pricing Eliminates Capital Risk</h3>
                      <p className="text-sm font-medium text-primary">Economic Principle: Price Discrimination + Dutch Auction Hybrid</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>"Impatience tax" from Wave 1 buyers funds Wave 2-7 production capacity</li>
                        <li>No all-or-nothing cliff risk (unlike Kickstarter)</li>
                        <li>Each wave self-funds the next without diluting participation</li>
                        <li>Surge pricing optimizes capacity utilization</li>
                        <li>Buyers self-select into willingness-to-pay tiers</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">3. Reputation as Collateral (Start at 100)</h3>
                      <p className="text-sm font-medium text-primary">Economic Principle: Signaling Theory + Trust as Capital</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Everyone starts at top score (100) with provisional status</li>
                        <li>"Innocent until proven guilty" creates psychological ownership</li>
                        <li>Members have everything to lose, nothing to gain from cheating</li>
                        <li>Decay over time ensures inactive members lose standing</li>
                        <li>Multi-factor scoring (10 dimensions) prevents gaming</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">4. Four-Portal Architecture</h3>
                      <p className="text-sm font-medium text-primary">Economic Principle: Information Asymmetry Reduction + Tiered Access</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li><strong>Marketplace (.com):</strong> Public browsing, no login (maximum reach)</li>
                        <li><strong>Business (.biz):</strong> Internal operations, $5 membership gate</li>
                        <li><strong>Network (.net):</strong> B2B/API access, $5 + validation</li>
                        <li><strong>Non-Profit (.org):</strong> Fund transparency, $5 stake</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">5. HexIsle Gamified Skill Verification</h3>
                      <p className="text-sm font-medium text-primary">Economic Principle: Preference Revelation Mechanism</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Dual-mode: Game Mode (sandbox) + Real Stakes (actual projects)</li>
                        <li>7 islands map to universal competencies</li>
                        <li>Self-funded through influencer challenges</li>
                        <li>LinkedIn endorsements are free (worthless), HexIsle XP costs time/money (credible)</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">6. Three-Tier IP Control Framework</h3>
                      <p className="text-sm font-medium text-primary">Economic Principle: Bundling & Unbundling Strategy</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li><strong>Tier A (49% creator):</strong> Maximum LB freedom, maximum revenue sharing</li>
                        <li><strong>Tier B (60% creator):</strong> Balanced control, modest LB cut</li>
                        <li><strong>Tier C (75% creator):</strong> Near-total control, minimal LB involvement</li>
                        <li>Veto rights at all tiers for ethical guardrails</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">7. Credit Economy as Universal Currency</h3>
                      <p className="text-sm font-medium text-primary">Economic Principle: Medium of Exchange + Unit of Account + Store of Value</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Credits serve as wages, participation, and marketplace tender simultaneously</li>
                        <li>EOI (Expression of Interest) vesting converts future participation into immediate liquidity</li>
                        <li>Withdrawal fees (5-15%) encourage reinvestment</li>
                        <li>Volume discount integration ties credits to production pricing</li>
                      </ul>
                    </div>

                    <h2 className="text-2xl font-bold border-b pb-2 mt-8">Part II: Implementation-Phase Strategic Wins</h2>

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Backup Position System</h3>
                      <p className="text-sm font-medium text-primary">Economic Principle: Insurance Premium Model + Mutual Aid</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Primary/Secondary/Backup structure distributes risk</li>
                        <li>Standby income as % of production run = transparent pricing</li>
                        <li>Equipment utilization maximized (Backup uses idle time)</li>
                        <li><strong>SLAs:</strong> 24hr response, 48hr activation, 6hr max delay</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Guild Mentor Co-signing</h3>
                      <p className="text-sm font-medium text-primary">Economic Principle: Co-signer Liability Model</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Sponsor's reputation at risk (5-35% penalty if mentee fails)</li>
                        <li>Access fee: 5-15% of contract value</li>
                        <li>Sliding scale: Closer levels = higher risk</li>
                        <li>Creates natural mentorship incentive</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Clan vs. Guild Benefit Separation</h3>
                      <p className="text-sm font-medium text-primary">Economic Principle: Specialization & Comparative Advantage</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li><strong>Guilds:</strong> Skill progression, contract access, bonus pools</li>
                        <li><strong>Clans:</strong> Social networks, resource vouching, cross-project support</li>
                        <li>Equipment loan discount: 25% off market rate for clan members</li>
                        <li>Clan projects have 20-25% lower overhead</li>
                      </ul>
                    </div>

                    <h2 className="text-2xl font-bold border-b pb-2 mt-8">Part IV: External Platform Coexistence</h2>

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Complementary Integration Model</h3>
                      <p className="text-sm font-medium text-primary">LB as Production Engine, External Platforms as Retail Channels</p>
                      
                      <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                        <h4 className="font-semibold">Model 1: Etsy Shop Integration</h4>
                        <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                          <li><strong>Member maintains</strong> Etsy storefront for existing audience</li>
                          <li><strong>LB handles</strong> production runs, IP tracking, medallion creation</li>
                          <li><strong>Badge implementation:</strong> "Powered by Liana Banyan" with QR code</li>
                          <li><strong>Referral tracking:</strong> Scans tracked for participation sharing</li>
                        </ul>

                        <h4 className="font-semibold mt-4">Model 2: Manufacturing Service Integration</h4>
                        <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                          <li><strong>Slant3D, Formlabs:</strong> Production fulfillment partners</li>
                          <li><strong>LB provides:</strong> Design validation, IP protection, quality standards</li>
                          <li><strong>Revenue share:</strong> Based on click-throughs and conversions</li>
                          <li><strong>Not competitors:</strong> They fulfill orders, we manage ecosystem</li>
                        </ul>

                        <h4 className="font-semibold mt-4">Model 3: Content Creator Pipeline</h4>
                        <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                          <li><strong>CNC Kitchen, TeachingTech:</strong> Educational content creators</li>
                          <li><strong>Lead generation:</strong> Tutorial viewers → LB project creators</li>
                          <li><strong>Affiliate structure:</strong> Participation-based vs. discount codes</li>
                          <li><strong>Metric tracking:</strong> Click-throughs, signups, project launches</li>
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Why This Works</h3>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li><strong>Network expansion:</strong> External platforms become acquisition channels</li>
                        <li><strong>Risk distribution:</strong> Members not locked into single platform</li>
                        <li><strong>IP protection:</strong> LB medallions provide provenance regardless of sales channel</li>
                        <li><strong>Participation alignment:</strong> Partners earn based on actual conversions</li>
                      </ul>
                    </div>

                    <div className="space-y-4 border-t pt-6 bg-primary/5 p-4 rounded-lg">
                      <h2 className="text-2xl font-bold">Bottom Line</h2>
                      <p className="text-lg">
                        Liana Banyan is designed to <strong>coexist with</strong> rather than compete against existing platforms. 
                        External services become complementary channels that expand our reach while maintaining our core value 
                        propositions: IP tracking, production coordination, and member participation.
                      </p>
                      <p className="text-lg mt-2">
                        <strong>Key insight:</strong> We don't need to own the entire value chain. We own the IP ledger, 
                        quality standards, and community coordination—letting external partners handle fulfillment creates 
                        a more resilient and scalable ecosystem.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : tab.id === "hexisle" ? (
              <div className="space-y-6">
                <HexisleCampaignManager />
                <HexelViewer3D />
                
                {/* Brainstorm: HexIsle as Life Improvement Game */}
                <Collapsible>
                  <Card>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="h-5 w-5" />
                          Brainstorm: HexIsle as a Life Improvement Game
                        </CardTitle>
                        <CardDescription>
                          Exploring the metaphor of progression through skill development and team cooperation
                        </CardDescription>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-6 pt-6">
                        {/* Core Metaphor */}
                        <div className="space-y-3">
                          <h3 className="text-lg font-semibold">The Journey: From Island to Destination</h3>
                          <div className="pl-4 border-l-4 border-primary/50 space-y-2">
                            <p className="text-muted-foreground italic">
                              You've been placed on an Island and you want to be Somewhere Else.
                            </p>
                            <ol className="space-y-1 list-decimal list-inside">
                              <li>At first you fight the tide.</li>
                              <li>Then you learn to USE the tide, and swim.</li>
                              <li>Then you work on a boat.</li>
                              <li>Then you build your own boat.</li>
                              <li>Then you hire a crew.</li>
                              <li>Then you join a guild (joining with others who have boats).</li>
                              <li>Then you start a flotilla (leading multiple boats together).</li>
                            </ol>
                          </div>
                          <div className="text-xs text-muted-foreground mt-2 pl-4">
                            <p><em>Progression maps:</em> Individual → Team Member → Team Leader → Organization Member → Organization Leader</p>
                          </div>
                        </div>

                        {/* HexIsle Narrative Concept Art */}
                        <div className="space-y-3">
                          <h3 className="text-lg font-semibold">HexIsle Narrative: Visual Concept</h3>
                          <div className="bg-muted/30 p-4 rounded-lg">
                            <img 
                              src={hexisleHarvestConcept} 
                              alt="HexIsle Harvest Island Concept - Floating island with monument, tree, water channels, and surrounding ocean"
                              className="w-full h-auto rounded-lg shadow-lg"
                            />
                            <p className="text-sm text-muted-foreground mt-3 text-center italic">
                              Primitive concept art: The Harvest Island — your starting point in the HexIsle universe
                            </p>
                          </div>
                          <div className="text-xs text-muted-foreground pl-4">
                            <p>
                              <strong>Visual Elements:</strong> Monument/tower (landmark), green tree (resource), water channels (navigation), 
                              dome structure (base/settlement), red markers (objectives), surrounding waters with threats (sharks), 
                              floating island terrain representing isolation and the journey ahead.
                            </p>
                          </div>
                        </div>

                        {/* Concept Overview */}
                        <div className="space-y-3">
                          <h3 className="text-lg font-semibold">System Architecture Concept</h3>
                          <div className="space-y-2 text-sm">
                            <p>
                              <strong>Core Idea:</strong> HexIsle as a Life Improvement Game where metaphors to real life are strong. 
                              Tasks require skill development, gaining knowledge, cooperating, and competing. Each project needs a team.
                            </p>
                            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                              <p><strong>Node Structure:</strong></p>
                              <ul className="list-disc list-inside space-y-1 ml-4">
                                <li>Nodes owned and operated by LB (equipment, IP, processes)</li>
                                <li>Project Owners receive service units in Nodes</li>
                                <li>Value retained in equipment, process, IP, and contracts</li>
                              </ul>
                              <p><strong>Position Framework:</strong></p>
                              <ul className="list-disc list-inside space-y-1 ml-4">
                                <li>7 CFO-equivalent positions (not C-suite until success criteria met)</li>
                                <li>7 COO-equivalent positions</li>
                                <li>7 CTO-equivalent positions</li>
                                <li>Provides real experience at small scale before advancement</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* AI Analysis */}
                        <div className="space-y-3">
                          <h3 className="text-lg font-semibold">Analysis & Observations</h3>
                          <div className="space-y-3 text-sm">
                            <div className="bg-primary/5 p-4 rounded-lg">
                              <p className="font-medium mb-2">Strengths of This Model:</p>
                              <ul className="list-disc list-inside space-y-1 ml-4">
                                <li><strong>Skill Progression:</strong> The tide metaphor perfectly maps to skill development stages - resistance, adaptation, participation, creation</li>
                                <li><strong>Real Stakes, Safe Environment:</strong> Players gain genuine leadership experience without the catastrophic risk of real-world failure</li>
                                <li><strong>Asset-Based Value:</strong> Anchoring contribution in tangible IP/equipment rather than abstract participation creates more stable value</li>
                                <li><strong>Scalable Training:</strong> 7 positions per role creates natural cohorts for peer learning and healthy competition</li>
                                <li><strong>Team Necessity:</strong> The "Island to Somewhere Else" premise inherently requires collaboration - you can't build a boat alone</li>
                              </ul>
                            </div>

                            <div className="bg-secondary/5 p-4 rounded-lg">
                              <p className="font-medium mb-2">Key Design Considerations:</p>
                              <ul className="list-disc list-inside space-y-1 ml-4">
                                <li><strong>Success Criteria:</strong> What specific metrics determine when someone graduates from "equivalent" to actual C-suite? (Projects completed? Revenue generated? Team satisfaction scores?)</li>
                                <li><strong>Node Allocation:</strong> How do Project Owners earn/purchase Node service units? Is it merit-based, contribution-based, or hybrid?</li>
                                <li><strong>Failure Modes:</strong> What happens when someone "fights the tide" too long? Is there a graceful off-ramp or support system?</li>
                                <li><strong>Cross-Node Learning:</strong> Can CFO-equivalents across different Nodes share insights? This could accelerate the collective learning curve</li>
                                <li><strong>Progression Pacing:</strong> How long should each "tide stage" typically last? Too fast = shallow learning, too slow = frustration</li>
                              </ul>
                            </div>

                            <div className="bg-accent/5 p-4 rounded-lg">
                              <p className="font-medium mb-2">Connection to HexIsle Campaign:</p>
                              <p className="mb-2">
                                The seven campaign stages (Harvest, Navigate, Engineer, Battle, Seek, Magic, Train) could directly map to the Node structure:
                              </p>
                              <ul className="list-disc list-inside space-y-1 ml-4">
                                <li><strong>Harvest:</strong> Learning resource management (CFO skills)</li>
                                <li><strong>Navigate:</strong> Strategic planning and logistics (COO skills)</li>
                                <li><strong>Engineer:</strong> Building systems and infrastructure (CTO skills)</li>
                                <li><strong>Battle:</strong> Competitive strategy and resilience</li>
                                <li><strong>Seek:</strong> Vision-setting and opportunity identification</li>
                                <li><strong>Magic:</strong> Innovation and creative problem-solving</li>
                                <li><strong>Train:</strong> Mentorship and knowledge transfer</li>
                              </ul>
                            </div>

                            <div className="border-l-4 border-primary p-4">
                              <p className="font-medium mb-2">Bottom Line:</p>
                              <p>
                                This is a sophisticated gamification of organizational development that could genuinely bridge the gap between 
                                education and experience. The key is ensuring the "game" challenges are isomorphic to real business challenges - 
                                not simplified analogies, but actual scaled versions of the problems CFOs/COOs/CTOs face. If you can nail that 
                                authenticity while maintaining the engagement of a game, you've created something truly valuable.
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{tab.title}</CardTitle>
                      <CardDescription>Video production script and drafts</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor={`ai-draft-${tab.id}`}>AI Generated Draft</Label>
                    <Textarea
                      id={`ai-draft-${tab.id}`}
                      placeholder="AI-generated script will appear here..."
                      className="min-h-[300px] font-mono"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor={`my-draft-${tab.id}`}>My Draft</Label>
                    <Textarea
                      id={`my-draft-${tab.id}`}
                      placeholder="Enter your script draft here..."
                      className="min-h-[300px] font-mono"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}

        {businessPlanEnabled && (
          <TabsContent value="business-plan" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Business Plan</CardTitle>
                    <CardDescription>View and download your comprehensive business plan</CardDescription>
                  </div>
                  <Link to="/business-plan" target="_blank">
                    <Button>
                      <FileText className="mr-2 h-4 w-4" />
                      View Complete Business Plan
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-6 rounded-lg text-center space-y-4">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Liana Banyan Business Plan</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      A comprehensive business plan including financial projections, market analysis, and operational strategy
                    </p>
                    <Link to="/business-plan" target="_blank">
                      <Button size="lg">
                        <FileText className="mr-2 h-5 w-5" />
                        Open Business Plan
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
