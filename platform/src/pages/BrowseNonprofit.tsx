import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, DollarSign, Trophy, TrendingUp, Gift, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import { useNavigate } from "react-router-dom";
import { PortalPageLayout } from '@/components/PortalPageLayout';

const benefitCategories = [
  {
    title: "Membership Tiers",
    description: "Medallion-based benefits and perks",
    icon: <Trophy className="h-8 w-8" />,
    details: ["Bronze: Basic benefits", "Silver: Enhanced access", "Gold: Premium perks"]
  },
  {
    title: "Loan Programs",
    description: "Low-interest community loans",
    icon: <DollarSign className="h-8 w-8" />,
    details: ["Personal loans: 2-5%", "Business loans: 3-7%", "Emergency funds available"]
  },
  {
    title: "EOI Vesting",
    description: "Expression of Interest conversion to participation",
    icon: <TrendingUp className="h-8 w-8" />,
    details: ["1% daily conversion", "Customizable schedules", "Project-based participation"]
  },
  {
    title: "Medallion Rewards",
    description: "Verified membership records",
    icon: <Shield className="h-8 w-8" />,
    details: ["NFT medallions", "Voting power", "Exclusive access"]
  },
  {
    title: "Gas Subsidies",
    description: "Transaction costs covered by funding pool",
    icon: <Gift className="h-8 w-8" />,
    details: ["Minting covered", "Transaction fees waived", "Pool-funded operations"]
  },
  {
    title: "LB Funding Pool",
    description: "33% of medallion sales fund member benefits",
    icon: <Heart className="h-8 w-8" />,
    details: ["Community owned", "Democratically managed", "Sustainable funding"]
  }
];

export default function BrowseNonprofit() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();

  const handleJoin = () => {
    if (!user) {
      openOnboard({ reason: "access member benefits", actionLabel: "Join", membershipIncluded: true });
      return;
    }
    navigate('/dashboard');
  };

  return (
    <PortalPageLayout maxWidth="xl" xrayId="browse-nonprofit">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Non-Profit Portal - Member Benefits</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Explore community benefits, loan programs, and medallion rewards. Join to unlock full access.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefitCategories.map((category) => (
          <Card key={category.title} className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="p-3 rounded-lg bg-primary/10 w-fit">
                {category.icon}
              </div>
              <CardTitle className="text-xl mt-4">{category.title}</CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {category.details.map((detail, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="text-xs">✓</Badge>
                  <span className="text-muted-foreground">{detail}</span>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4" onClick={handleJoin}>
                {user ? "View Benefits" : "Join for Full Access"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-primary/5">
        <CardContent className="p-8 space-y-4">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-primary">$2.4M</p>
              <p className="text-sm text-muted-foreground">Total pool funding</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">1,247</p>
              <p className="text-sm text-muted-foreground">Active members</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">2-7%</p>
              <p className="text-sm text-muted-foreground">Loan rates</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">33%</p>
              <p className="text-sm text-muted-foreground">Pool contribution</p>
            </div>
          </div>
          <div className="text-center pt-4">
            <Button size="lg" onClick={handleJoin}>
              {user ? "Go to Dashboard" : "Join for $5/year"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </PortalPageLayout>
  );
}