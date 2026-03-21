/**
 * COMPANY ISLAND — Business Landing on HexIsle
 * ==============================================
 * A landing page for businesses that want to establish their
 * presence in the HexIsle world. Like renting a storefront
 * in a virtual marketplace — digital real estate for your brand.
 *
 * Innovation #1547 — Company Island Page (Session 8A)
 */

import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2, Map, Store, Users, Hexagon, ArrowRight,
  Shield, Sparkles, Globe, Hammer,
} from "lucide-react";
import { GlobalBreadcrumbs } from "@/components/GlobalBreadcrumbs";
import { PortalPageLayout } from '@/components/PortalPageLayout';

const ISLAND_FEATURES = [
  {
    icon: Store,
    title: "Digital Storefronts",
    description:
      "Rent hex plots for your brand. Small (1 hex), medium (2-3 hex), or large (4+ hex) — pick the right size for your business.",
  },
  {
    icon: Map,
    title: "District Placement",
    description:
      "Choose your location: Market Square for foot traffic, Harbor for shipping, Canal Quarter for premium venues, or Artisan Lane for craft workshops.",
  },
  {
    icon: Users,
    title: "NPC Representatives",
    description:
      "Your brand gets an in-world NPC representative that interacts with visitors, showcases products, and directs customers to your services.",
  },
  {
    icon: Hexagon,
    title: "Cooperative Membership",
    description:
      "Every business on HexIsle operates under Cost+20%. Creators keep 83.3% of every transaction. Fair economics by design.",
  },
];

const GETTING_STARTED_STEPS = [
  {
    step: 1,
    title: "Browse Available Plots",
    description: "Explore the island map and find available hex plots in your preferred district.",
  },
  {
    step: 2,
    title: "Choose Your Plot Size",
    description: "Small storefronts, medium workshops, or large warehouses — pick what fits.",
  },
  {
    step: 3,
    title: "Set Up Your Presence",
    description: "Name your shop, customize your signage, and configure your NPC representative.",
  },
  {
    step: 4,
    title: "Start Serving",
    description: "Your business is live on HexIsle. Visitors can discover and interact with your brand.",
  },
];

export default function CompanyIsland() {
  const navigate = useNavigate();

  return (
    <PortalPageLayout maxWidth="xl" xrayId="company-island">
      <GlobalBreadcrumbs />
      <div className="space-y-8">
        {/* Hero */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="gap-1">
            <Hexagon className="w-3 h-3" />
            HexIsle Digital Real Estate
          </Badge>
          <h1 className="text-4xl font-bold">Company Island</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Establish your business presence in the HexIsle world.
            Rent digital storefronts, set up workshops, and serve
            customers in the cooperative marketplace.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {ISLAND_FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hammer className="w-5 h-5" />
              Getting Started
            </CardTitle>
            <CardDescription>
              Four steps to your HexIsle business presence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {GETTING_STARTED_STEPS.map((step) => (
                <div key={step.step} className="space-y-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-sm">{step.title}</h3>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Economics Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-primary shrink-0 mt-1" />
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">The Cost+20% Promise</h3>
                <p className="text-sm text-muted-foreground">
                  Every business on HexIsle operates under Liana Banyan's constitutional rule:
                  creators keep 83.3% of every transaction. The platform takes exactly Cost+20%
                  — no more, ever. No hidden fees, no surge pricing on platform cuts, no surprise
                  changes to the economics.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="secondary">83.3% to Creators</Badge>
                  <Badge variant="secondary">Cost+20% Cap</Badge>
                  <Badge variant="secondary">Three-Gear Currency</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button size="lg" className="gap-2" onClick={() => navigate("/hexisle/world-map")}>
            <Globe className="w-5 h-5" />
            Explore the World Map
          </Button>
          <Button size="lg" variant="outline" className="gap-2" onClick={() => navigate("/hexisle")}>
            <ArrowRight className="w-5 h-5" />
            HexIsle Dashboard
          </Button>
          <Button size="lg" variant="outline" className="gap-2" onClick={() => navigate("/build-a-business")}>
            <Building2 className="w-5 h-5" />
            Build a Business
          </Button>
        </div>
      </div>
    </PortalPageLayout>
  );
}
