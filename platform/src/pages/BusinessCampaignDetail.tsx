import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import {
  useBusinessCampaign,
  useCampaignPledges,
  usePledgeCampaign,
  useClaimCaptain,
  getBusinessTypeLabel,
} from "@/hooks/useBusinessCampaigns";
import { useAuth } from "@/contexts/AuthContext";
import { useCaptain } from "@/hooks/useCaptain";
import { Loader2, MapPin, Users, Share2, Anchor, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function BusinessCampaignDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const { isCaptain } = useCaptain();
  const { data: campaign, isLoading } = useBusinessCampaign(slug);
  const { data: pledges } = useCampaignPledges(campaign?.id);
  const pledgeMutation = usePledgeCampaign();
  const claimMutation = useClaimCaptain();

  const [pledgeAmount, setPledgeAmount] = useState("15");
  const [pledgeNote, setPledgeNote] = useState("");

  if (isLoading) {
    return (
      <PortalPageLayout title="Loading..." maxWidth="2xl" xrayId="campaign-detail">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PortalPageLayout>
    );
  }

  if (!campaign) {
    return (
      <PortalPageLayout title="Campaign Not Found" maxWidth="2xl" xrayId="campaign-detail">
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">This campaign doesn't exist or has been removed.</p>
          <Button asChild variant="outline">
            <Link to="/campaigns">Back to Campaigns</Link>
          </Button>
        </div>
      </PortalPageLayout>
    );
  }

  const pct = campaign.pledge_threshold > 0
    ? Math.min(100, Math.round((campaign.pledge_count / campaign.pledge_threshold) * 100))
    : 0;

  const avgOrder = campaign.pledge_count > 0
    ? campaign.pledge_total_credits / campaign.pledge_count
    : 0;

  const userAlreadyPledged = pledges?.some((p) => p.user_id === user?.id);
  const isCampaignCaptain = campaign.captain_id === user?.id;
  const thresholdReached = campaign.pledge_count >= campaign.pledge_threshold;

  const handlePledge = async () => {
    const amount = parseFloat(pledgeAmount);
    if (!amount || amount <= 0) {
      toast({ title: "Enter a pledge amount", variant: "destructive" });
      return;
    }
    try {
      await pledgeMutation.mutateAsync({
        campaignId: campaign.id,
        creditAmount: amount,
        note: pledgeNote || undefined,
      });
      toast({ title: "Pledge recorded!", description: `You pledged $${amount.toFixed(2)} to ${campaign.business_name}.` });
      setPledgeNote("");
    } catch (e: any) {
      toast({ title: "Pledge failed", description: e.message, variant: "destructive" });
    }
  };

  const handleClaimCaptain = async () => {
    try {
      await claimMutation.mutateAsync({ campaignId: campaign.id });
      toast({ title: "You're the Captain!", description: `You've claimed ${campaign.business_name}. Generate your Pitch Packet when ready.` });
    } catch (e: any) {
      toast({ title: "Claim failed", description: e.message, variant: "destructive" });
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: `Help bring ${campaign.business_name} to Liana Banyan!`, url });
    } else {
      navigator.clipboard.writeText(url);
      toast({ title: "Link copied!" });
    }
  };

  return (
    <PortalPageLayout
      title={campaign.business_name}
      subtitle={`${getBusinessTypeLabel(campaign.business_type)} · ${campaign.business_city}${campaign.business_state ? `, ${campaign.business_state}` : ""}`}
      maxWidth="2xl"
      xrayId="campaign-detail"
    >
      <div className="space-y-6 pb-12">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/campaigns">
            <ArrowLeft className="h-4 w-4 mr-1" />
            All Campaigns
          </Link>
        </Button>

        {campaign.description && (
          <p className="text-muted-foreground">{campaign.description}</p>
        )}

        {campaign.business_address && (
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {campaign.business_address}
          </p>
        )}

        {/* Demand Signal Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Community Demand</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{campaign.pledge_count}</p>
                <p className="text-xs text-muted-foreground">Pledges</p>
              </div>
              <div>
                <p className="text-2xl font-bold">${Number(campaign.pledge_total_credits).toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Committed</p>
              </div>
              <div>
                <p className="text-2xl font-bold">${avgOrder.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Avg Order</p>
              </div>
            </div>

            <div className="space-y-1">
              <Progress value={pct} className="h-3" />
              <p className="text-sm text-muted-foreground text-center">
                {pct}% of {campaign.pledge_threshold} goal
              </p>
            </div>

            <div className="text-center">
              <Badge variant="secondary">
                Proposed deal: {campaign.proposed_discount_pct}% volume discount for LB Card members
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Pledge List */}
        {pledges && pledges.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Who's Pledging
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {pledges.map((p) => (
                  <li key={p.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                    <span className="text-muted-foreground">
                      {p.note || (p.pledge_type === "recurring" ? "Recurring customer" : "Advance order")}
                    </span>
                    <span className="font-medium">${Number(p.credit_amount).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Pledge Form */}
        {user && !userAlreadyPledged && campaign.status === "gathering" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pledge to Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    min="1"
                    step="0.01"
                    value={pledgeAmount}
                    onChange={(e) => setPledgeAmount(e.target.value)}
                    className="pl-7"
                    placeholder="15.00"
                  />
                </div>
              </div>
              <Textarea
                placeholder="What do you usually order? (optional)"
                value={pledgeNote}
                onChange={(e) => setPledgeNote(e.target.value)}
                rows={2}
              />
              <div className="flex gap-2">
                <Button onClick={handlePledge} disabled={pledgeMutation.isPending} className="flex-1">
                  {pledgeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Pledge to Order
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {userAlreadyPledged && (
          <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
            <CardContent className="py-4 text-center text-sm text-green-700 dark:text-green-300">
              You've pledged to this campaign. Share it to help it reach the threshold!
              <div className="mt-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-1" />
                  Share This Campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!user && (
          <Card>
            <CardContent className="py-6 text-center">
              <p className="text-muted-foreground mb-3">Log in to pledge your support for this business.</p>
              <Button asChild>
                <Link to="/auth">Log In / Sign Up</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Captain Section */}
        <div className="border-t pt-6 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Anchor className="h-4 w-4" />
            Captain's Corner
          </h3>

          {campaign.captain_id && !isCampaignCaptain && (
            <p className="text-sm text-muted-foreground">
              A Captain has claimed this campaign and will pitch when the threshold is met.
            </p>
          )}

          {isCampaignCaptain && thresholdReached && (
            <div className="space-y-2">
              <p className="text-sm">
                Threshold reached! Generate your Pitch Packet and go close this deal.
              </p>
              <Button asChild>
                <Link to={`/campaigns/${campaign.slug}/pitch-packet`}>
                  Generate Pitch Packet
                </Link>
              </Button>
            </div>
          )}

          {isCampaignCaptain && !thresholdReached && (
            <p className="text-sm text-muted-foreground">
              You've claimed this campaign. Share it to reach the {campaign.pledge_threshold}-pledge threshold,
              then you can generate your Pitch Packet.
            </p>
          )}

          {!campaign.captain_id && user && (isCaptain || true) && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Are you a Captain? When this hits {campaign.pledge_threshold} pledges,
                you can generate a Pitch Packet and close this deal.
              </p>
              <Button variant="outline" onClick={handleClaimCaptain} disabled={claimMutation.isPending}>
                {claimMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Anchor className="h-4 w-4 mr-1" />}
                I'll Be the Captain
              </Button>
            </div>
          )}
        </div>
      </div>
    </PortalPageLayout>
  );
}
