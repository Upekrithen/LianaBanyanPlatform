import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import {
  useBusinessCampaign,
  usePitchPacket,
  useGeneratePitchPacket,
} from "@/hooks/useBusinessCampaigns";
import { useAuth } from "@/contexts/AuthContext";
import { useCanonicalStats } from "@/hooks/useCanonicalStats";
import { useSavedScenarios } from "@/hooks/useSavedScenarios";
import { Loader2, Printer, ArrowLeft, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PitchContingencyOperator } from "@/components/pitch/PitchContingencyOperator";
import { SavedScenariosPanel } from "@/components/pitch/SavedScenariosPanel";
import type { PitchCOScenario, PitchCOResults } from "@/components/pitch/PitchContingencyOperator";

export default function PitchPacketPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const stats = useCanonicalStats();
  const { data: campaign, isLoading: campaignLoading } = useBusinessCampaign(slug);
  const { data: packet, isLoading: packetLoading } = usePitchPacket(campaign?.id);
  const generateMutation = useGeneratePitchPacket();
  const { scenarios, save: saveScenario, remove: removeScenario } = useSavedScenarios(campaign?.id);
  const [scenarioNameInput, setScenarioNameInput] = useState("");
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [pendingScenario, setPendingScenario] = useState<(PitchCOScenario & PitchCOResults) | null>(null);

  const isLoading = campaignLoading || packetLoading;

  if (isLoading) {
    return (
      <PortalPageLayout title="Loading..." maxWidth="xl" xrayId="pitch-packet">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PortalPageLayout>
    );
  }

  if (!campaign) {
    return (
      <PortalPageLayout title="Not Found" maxWidth="xl" xrayId="pitch-packet">
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">Campaign not found.</p>
          <Button asChild variant="outline"><Link to="/campaigns">Back to Campaigns</Link></Button>
        </div>
      </PortalPageLayout>
    );
  }

  const handleGenerate = async () => {
    try {
      await generateMutation.mutateAsync({ campaignId: campaign.id, campaign });
      toast({ title: "Pitch Packet generated!" });
    } catch (e: any) {
      toast({ title: "Generation failed", description: e.message, variant: "destructive" });
    }
  };

  const avgOrder = packet
    ? packet.avg_order_value ?? 0
    : campaign.pledge_count > 0
    ? campaign.pledge_total_credits / campaign.pledge_count
    : 0;

  const displayPacket = packet ?? {
    pledge_count: campaign.pledge_count,
    total_pledged: campaign.pledge_total_credits,
    avg_order_value: avgOrder,
    proposed_discount: `${campaign.proposed_discount_pct}% volume discount`,
    qr_code_url: `${window.location.origin}/campaigns/${campaign.slug}`,
    generated_at: new Date().toISOString(),
  };

  return (
    <PortalPageLayout
      title="Captain's Pitch Packet"
      subtitle={campaign.business_name}
      maxWidth="xl"
      xrayId="pitch-packet"
    >
      <div className="space-y-6 pb-12">
        <div className="flex items-center justify-between print:hidden">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/campaigns/${campaign.slug}`}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Campaign
            </Link>
          </Button>

          <div className="flex gap-2">
            {!packet && (
              <Button onClick={handleGenerate} disabled={generateMutation.isPending}>
                {generateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Generate Packet
              </Button>
            )}
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
          </div>
        </div>

        {/* Printable Pitch Packet */}
        <Card className="print:shadow-none print:border-2 print:border-black">
          <CardContent className="p-8 space-y-6">
            {/* Header */}
            <div className="text-center border-b pb-4">
              <h1 className="text-2xl font-bold tracking-tight">LIANA BANYAN</h1>
              <p className="text-lg text-muted-foreground">Captain's Pitch Packet</p>
            </div>

            {/* Business Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Business</p>
                <p className="font-semibold text-lg">{campaign.business_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Captain</p>
                <p className="font-semibold">{user?.email?.split("@")[0] ?? "Captain"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Generated</p>
                <p className="font-medium">
                  {new Date(displayPacket.generated_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Location</p>
                <p className="font-medium">
                  {campaign.business_city}
                  {campaign.business_state ? `, ${campaign.business_state}` : ""}
                </p>
              </div>
            </div>

            {/* Demand Signal */}
            <div className="bg-muted/50 rounded-lg p-6 space-y-3">
              <h2 className="font-bold text-lg">YOUR CUSTOMERS ARE WAITING:</h2>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-muted-foreground">├─</span>
                  <span><strong>{displayPacket.pledge_count}</strong> members have pledged advance orders</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-muted-foreground">├─</span>
                  <span><strong>${Number(displayPacket.total_pledged).toFixed(0)}</strong> in pre-committed spending</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-muted-foreground">└─</span>
                  <span>Average order value: <strong>${Number(displayPacket.avg_order_value ?? 0).toFixed(2)}</strong></span>
                </li>
              </ul>
            </div>

            {/* The Deal */}
            <div className="border-2 border-primary/20 rounded-lg p-6 text-center space-y-2">
              <h2 className="font-bold text-lg">THE DEAL</h2>
              <p className="text-muted-foreground">
                Accept the LB Card → Give {campaign.proposed_discount_pct}% volume discount →
                We send you {displayPacket.pledge_count}+ customers THIS WEEK
              </p>
            </div>

            {/* QR Code */}
            <div className="flex items-center gap-6 py-4">
              <div className="flex-shrink-0 w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center">
                <QrCode className="h-16 w-16 text-muted-foreground/60" />
              </div>
              <div className="text-sm">
                <p className="font-medium">Scan to see your live campaign page</p>
                <p className="text-muted-foreground">with real pledges and real people</p>
                <p className="text-xs text-muted-foreground mt-1 break-all">
                  {displayPacket.qr_code_url}
                </p>
              </div>
            </div>

            {/* Quote */}
            <blockquote className="border-l-4 border-primary/40 pl-4 italic text-muted-foreground">
              "A ship in harbor is safe, but that is not what ships are BUILT for."
              <span className="block text-xs mt-1 not-italic">— John A. Shedd</span>
            </blockquote>

            {/* Footer */}
            <div className="border-t pt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>lianabanyan.com | $5/year | {stats.innovationCount.toLocaleString()} innovations</span>
              <span>"You build the Features — We're building the Board."</span>
            </div>
          </CardContent>
        </Card>

        {/* ── Pitch Contingency Operator ── */}
        <div className="print:hidden space-y-4">
          <PitchContingencyOperator
            campaign={campaign}
            pledgeCount={campaign.pledge_count}
            isMember={!!user}
            onSaveScenario={(s) => {
              if (!user) {
                toast({
                  title: "Sign in to save",
                  description: "Create a free account or sign in to save scenarios.",
                });
                return;
              }
              setPendingScenario(s);
              setShowNamePrompt(true);
            }}
          />

          {/* Saved Scenarios */}
          <SavedScenariosPanel
            scenarios={scenarios}
            onDelete={(id) => removeScenario(id)}
          />
        </div>

        {/* Name prompt dialog */}
        {showNamePrompt && pendingScenario && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 print:hidden">
            <Card className="max-w-sm w-full">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-bold">Name Your Scenario</h3>
                <input
                  type="text"
                  value={scenarioNameInput}
                  onChange={(e) => setScenarioNameInput(e.target.value)}
                  placeholder="e.g. Best Case Friday Rush"
                  className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowNamePrompt(false);
                      setPendingScenario(null);
                      setScenarioNameInput("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={async () => {
                      try {
                        await saveScenario({
                          scenario: pendingScenario,
                          campaignId: campaign.id,
                          businessType: campaign.business_type,
                          name: scenarioNameInput || "Untitled Scenario",
                          isMember: true,
                        });
                        toast({ title: "Scenario saved!" });
                      } catch (e: any) {
                        toast({ title: "Save failed", description: e.message, variant: "destructive" });
                      }
                      setShowNamePrompt(false);
                      setPendingScenario(null);
                      setScenarioNameInput("");
                    }}
                  >
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Print CSS */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:shadow-none, .print\\:shadow-none * { visibility: visible; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </PortalPageLayout>
  );
}
