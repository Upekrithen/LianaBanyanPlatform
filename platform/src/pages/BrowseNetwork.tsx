import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Network, Package, FileCode, TrendingUp, Truck, Factory } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import { useNavigate } from "react-router-dom";

const serviceCategories = [
  {
    title: "Manufacturing Services",
    description: "Production capacity and capabilities",
    icon: <Factory className="h-8 w-8" />,
    providers: 34,
    categories: ["3D Printing", "CNC Machining", "Assembly", "Packaging"]
  },
  {
    title: "Supply Chain Partners",
    description: "Logistics and fulfillment services",
    icon: <Truck className="h-8 w-8" />,
    providers: 28,
    categories: ["Shipping", "Warehousing", "Distribution", "Freight"]
  },
  {
    title: "Production Scheduling",
    description: "Capacity planning and coordination",
    icon: <TrendingUp className="h-8 w-8" />,
    providers: 15,
    categories: ["B2B Contracts", "Lead Time Tracking", "Volume Discounts"]
  },
  {
    title: "XML Lockbox API",
    description: "Blockchain-verified data exchange",
    icon: <FileCode className="h-8 w-8" />,
    providers: 12,
    categories: ["API Access", "Data Security", "Cost Attribution", "Usage Tracking"]
  },
  {
    title: "Industry Pricing",
    description: "Real-time market pricing data",
    icon: <Package className="h-8 w-8" />,
    providers: 42,
    categories: ["Market Rates", "Volume Discounts", "Production Runs"]
  },
  {
    title: "B2B Network",
    description: "Business partnerships and collaboration",
    icon: <Network className="h-8 w-8" />,
    providers: 56,
    categories: ["Partner Discovery", "Contract Management", "Joint Ventures"]
  }
];

export default function BrowseNetwork() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();

  const handleConnect = () => {
    if (!user) {
      openOnboard({ reason: "connect with network partners", actionLabel: "Connect", membershipIncluded: true });
      return;
    }
    navigate('/dashboard');
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Business Network Portal</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover B2B services, manufacturing capacity, and supply chain partners. Connect to unlock opportunities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviceCategories.map((category) => (
          <Card key={category.title} className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="p-3 rounded-lg bg-primary/10 w-fit">
                {category.icon}
              </div>
              <CardTitle className="text-xl mt-4">{category.title}</CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Active providers:</span>
                <Badge variant="secondary">{category.providers}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Service categories:</p>
                <div className="flex flex-wrap gap-1">
                  {category.categories.slice(0, 3).map((cat) => (
                    <Badge key={cat} variant="outline" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                  {category.categories.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{category.categories.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={handleConnect}>
                {user ? "View Providers" : "Connect to Explore"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-primary/5">
        <CardContent className="p-8 space-y-4">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-primary">187</p>
              <p className="text-sm text-muted-foreground">Network partners</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">$4.2M</p>
              <p className="text-sm text-muted-foreground">Monthly volume</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">24/7</p>
              <p className="text-sm text-muted-foreground">API access</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">98%</p>
              <p className="text-sm text-muted-foreground">Uptime SLA</p>
            </div>
          </div>
          <div className="text-center pt-4 space-y-2">
            <Button size="lg" onClick={handleConnect}>
              {user ? "Go to Network" : "Request Network Access"}
            </Button>
            <p className="text-sm text-muted-foreground">
              B2B partnerships require verification
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}