import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, TrendingUp, Users, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import { useNavigate } from "react-router-dom";
import { PortalPageLayout } from "@/components/PortalPageLayout";

const categories = [
  {
    title: "Sustainable Products",
    description: "Eco-friendly goods and services",
    icon: <ShoppingBag className="h-8 w-8" />,
    count: 24,
    trending: true
  },
  {
    title: "Community Projects",
    description: "Local initiatives and developments",
    icon: <Users className="h-8 w-8" />,
    count: 12,
    trending: false
  },
  {
    title: "Sponsorship Opportunities",
    description: "Back projects with participation potential",
    icon: <TrendingUp className="h-8 w-8" />,
    count: 18,
    trending: true
  },
  {
    title: "Featured Products",
    description: "Top-rated community offerings",
    icon: <Star className="h-8 w-8" />,
    count: 8,
    trending: false
  }
];

export default function BrowseMarketplace() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();

  const handleExplore = () => {
    if (!user) {
      openOnboard({ reason: "explore the marketplace", actionLabel: "Start Exploring", membershipIncluded: true });
      return;
    }
    navigate('/dashboard');
  };

  return (
    <PortalPageLayout title="Marketplace Discovery" maxWidth="xl" xrayId="browse-marketplace-page">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl font-bold text-foreground">Marketplace Discovery</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Browse community projects and products. Sign in to sponsor and participate.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category) => (
          <Card key={category.title} className="hover:shadow-lg transition-all cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-lg bg-primary/10">
                  {category.icon}
                </div>
                {category.trending && (
                  <Badge variant="secondary" className="bg-green-500 text-white">
                    Trending
                  </Badge>
                )}
              </div>
              <CardTitle className="text-2xl mt-4">{category.title}</CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {category.count} active {category.count === 1 ? 'project' : 'projects'}
                </p>
                <Button variant="outline" onClick={handleExplore}>
                  {user ? "Explore" : "Join to Explore"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-primary/5">
        <CardContent className="p-8 text-center space-y-4">
          <h3 className="text-2xl font-semibold">Ready to participate?</h3>
          <p className="text-muted-foreground">
            Create an account to back projects, earn participation, and join the community
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={handleExplore}>
              {user ? "Go to Marketplace" : "Join for $5/year"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </PortalPageLayout>
  );
}