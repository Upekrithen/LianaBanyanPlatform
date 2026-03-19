import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Anchor, Factory, Target, CheckCircle, AlertTriangle, BarChart3, Package, ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import {
  type NodeCaptainProfile, type ProductionCampaign, type ProductionStamp, type CampaignStatus,
  SAMPLE_CAPTAINS, SAMPLE_CAMPAIGNS, SAMPLE_STAMPS,
  fetchNodeCaptains, fetchProductionCampaigns, fetchStamps,
} from "@/lib/nodeCaptainService";

const CAMPAIGN_STYLES: Record<CampaignStatus, { bg: string; text: string; label: string }> = {
  planning: { bg: "bg-slate-500/20", text: "text-slate-400", label: "Planning" },
  funded: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Funded" },
  in_production: { bg: "bg-purple-500/20", text: "text-purple-400", label: "In Production" },
  quality_check: { bg: "bg-amber-500/20", text: "text-amber-400", label: "Quality Check" },
  completed: { bg: "bg-green-500/20", text: "text-green-400", label: "Completed" },
  cancelled: { bg: "bg-red-500/20", text: "text-red-400", label: "Cancelled" },
};

export default function NodeCaptain() {
  const { user } = useAuth();
  const [captains, setCaptains] = useState<NodeCaptainProfile[]>(SAMPLE_CAPTAINS);
  const [campaigns, setCampaigns] = useState<ProductionCampaign[]>(SAMPLE_CAMPAIGNS);

  useEffect(() => {
    fetchNodeCaptains().then(setCaptains);
    fetchProductionCampaigns().then(setCampaigns);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <Card className="bg-slate-900/80 border-slate-800 max-w-md"><CardContent className="py-8 text-center"><p className="text-slate-400 mb-4">Sign in to access Node Captain.</p><Button asChild><Link to="/auth">Sign in</Link></Button></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white" data-xray-id="node-captain">
      <div className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Anchor className="w-8 h-8 text-blue-400" />
            Node Captain — Pick Up The Tab
          </h1>
          <p className="text-slate-400">Fund production. Manage campaigns. Build the local economy.</p>
        </header>

        {/* How a Captain Funds Production */}
        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader><CardTitle className="text-lg">How a Captain Funds Production</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {["Joules (collateral)", "→", "Backed Marks", "→", "Fund Campaign", "→", "Produce at C+20", "→", "STAMP Verify", "→", "XP Awarded"].map((step, i) => (
                <span key={i} className={step === "→" ? "text-primary" : "bg-slate-800 px-3 py-1.5 rounded-full"}>{step}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Production Runs */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Factory className="w-5 h-5 text-amber-500" />
            Active Production Runs
          </h2>
          <div className="space-y-3">
            {campaigns.map(campaign => {
              const progress = campaign.unitsTarget > 0 ? (campaign.unitsCompleted / campaign.unitsTarget) * 100 : 0;
              const marginPerUnit = campaign.pricePerUnit - campaign.costPerUnit;
              const s = CAMPAIGN_STYLES[campaign.status];
              return (
                <Card key={campaign.id} className="bg-slate-900/60 border-slate-800">
                  <CardContent className="py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-semibold">{campaign.productName}</p>
                        <p className="text-sm text-slate-400">{campaign.productDescription}</p>
                      </div>
                      <Badge className={`${s.bg} ${s.text} border-0`}>{s.label}</Badge>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>{campaign.unitsCompleted} / {campaign.unitsTarget} units</span>
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div><span className="text-slate-400">Cost:</span> Ↄ‖ {campaign.costPerUnit.toFixed(2)}/unit</div>
                      <div><span className="text-slate-400">C+20:</span> Ↄ‖ {campaign.pricePerUnit.toFixed(2)}/unit</div>
                      <div><span className="text-slate-400">Margin:</span> Ↄ‖ {marginPerUnit.toFixed(2)}/unit</div>
                      <div><span className="text-slate-400">Backed:</span> Ↄ‖ {campaign.backedMarksAllocated}</div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <Separator className="border-slate-800" />

        {/* STAMP Verification */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            STAMP Verification
          </h2>
          <Card className="bg-slate-900/60 border-slate-800">
            <CardContent className="py-4">
              <p className="text-sm text-slate-400 mb-3">Quality verification for completed production batches. You cannot STAMP your own production runs.</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Campaign</label>
                  <select className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white">
                    <option value="">Select a campaign...</option>
                    {campaigns.filter(c => c.status === "quality_check").map(c => (
                      <option key={c.id} value={c.id}>{c.productName} ({c.unitsCompleted} units)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Quality Score (1-5)</label>
                  <input type="range" min="1" max="5" step="0.1" defaultValue="4" className="w-full" />
                </div>
              </div>
              <Button className="mt-3" size="sm">Apply STAMP</Button>
            </CardContent>
          </Card>
        </section>

        <Separator className="border-slate-800" />

        {/* Node Captains Directory */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Anchor className="w-5 h-5 text-blue-400" />
            Node Captains Directory
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {captains.map(cap => (
              <Card key={cap.id} className="bg-slate-900/60 border-slate-800">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{cap.nodeName}</span>
                    <Badge className={cap.status === "active" ? "bg-green-500/20 text-green-400 border-0" : cap.status === "probation" ? "bg-amber-500/20 text-amber-400 border-0" : "bg-slate-500/20 text-slate-400 border-0"}>{cap.status}</Badge>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{cap.nodeLocation}</p>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span>Campaigns: {cap.campaignsCompleted}</span>
                    <span>Units: {cap.totalUnitsProduced}</span>
                    <span>Quality: {cap.averageQualityScore > 0 ? cap.averageQualityScore.toFixed(1) : "N/A"}</span>
                    <span>Marks Used: {cap.totalBackedMarksUsed}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
