/**
 * LocalFulfillmentBountiesPage — Wave 6 Phase U
 * ================================================
 * The local-fulfillment bounty system for the decentralized factory.
 * Route: /factory/local-fulfillment
 *
 * Members earn Marks by fulfilling production and delivery tasks
 * within their geographic area.
 */
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Package, Truck, Wrench, CheckCircle, ArrowRight } from "lucide-react";
import { PortalPageLayout } from "@/components/PortalPageLayout";

interface BountyType {
  id: string;
  icon: React.ElementType;
  name: string;
  description: string;
  typicalEarning: string;
  requirements: string[];
  color: string;
}

const BOUNTY_TYPES: BountyType[] = [
  {
    id: "production",
    icon: Wrench,
    name: "Production Bounties",
    description:
      "Manufacture a specified quantity of a product at your factory node. The requester defines the spec, you produce to that spec, Marks and payment on delivery.",
    typicalEarning: "$50-$500 per run",
    requirements: [
      "Registered factory node with relevant equipment",
      "Anchor-certified for the product category",
      "Passed quality sample review",
    ],
    color: "from-slate-500/20 to-zinc-500/20 border-slate-500/30",
  },
  {
    id: "assembly",
    icon: Package,
    name: "Assembly Bounties",
    description:
      "Assemble pre-manufactured components into finished products at your location. Lower equipment requirements than full production. Good entry point for new nodes.",
    typicalEarning: "$20-$200 per session",
    requirements: [
      "Workspace sufficient for assembly",
      "Completed assembly training module",
      "Passed first article inspection",
    ],
    color: "from-amber-500/20 to-yellow-500/20 border-amber-500/30",
  },
  {
    id: "last-mile",
    icon: Truck,
    name: "Last-Mile Delivery",
    description:
      "Deliver finished goods from a production node to end customers in your neighborhood. Your local knowledge makes you the most efficient last-mile logistics option.",
    typicalEarning: "$15-$75 per route",
    requirements: [
      "Vehicle and valid license",
      "Cooperative member in good standing",
      "Available for committed delivery windows",
    ],
    color: "from-green-500/20 to-emerald-500/20 border-green-500/30",
  },
  {
    id: "quality",
    icon: CheckCircle,
    name: "Quality Inspection Bounties",
    description:
      "Inspect incoming goods or outgoing production runs against the product specification. Quality inspectors earn Marks per inspection and build reputation as trusted reviewers.",
    typicalEarning: "$25-$150 per inspection",
    requirements: [
      "Completed quality inspection certification",
      "3+ months cooperative membership",
      "No conflict of interest with inspected node",
    ],
    color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  },
];

export default function LocalFulfillmentBountiesPage() {
  const navigate = useNavigate();

  return (
    <PortalPageLayout variant="stage" xrayId="local-fulfillment">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Back */}
        <Button variant="ghost" size="sm" onClick={() => navigate("/factory")} className="gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Factory Hub
        </Button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <MapPin className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Local Fulfillment Bounties</h1>
            <p className="text-muted-foreground">Earn by producing and delivering in your neighborhood</p>
          </div>
        </div>

        {/* Concept */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-4 text-sm text-muted-foreground space-y-2">
            <p>
              The cooperative's decentralized factory network runs on local fulfillment bounties.
              Instead of shipping from a central warehouse, products are made and delivered by
              members in the same neighborhood where they are needed.
            </p>
            <p>
              Every bounty is priced at Cost+20%. Members who fulfill the bounty earn 83.3%
              of the bounty price. The platform retains 16.7% for coordination and the
              initiative charitable pool.
            </p>
          </CardContent>
        </Card>

        {/* How Bounties Work */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { step: "1", title: "Browse open bounties in your area", desc: "Filter by type, required skills, and earning range. Bounties are always hyper-local." },
            { step: "2", title: "Claim a bounty and fulfill it", desc: "Accept the bounty, complete the work to spec, submit for review. Simple and transparent." },
            { step: "3", title: "Earn 83.3% on completion", desc: "Payment and Marks release within 48 hours of quality review. Build your reputation with each fulfilled bounty." },
          ].map((item) => (
            <Card key={item.step} className="text-center">
              <CardContent className="py-6 space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center mx-auto text-lg">
                  {item.step}
                </div>
                <p className="font-semibold text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bounty Types */}
        <h2 className="text-xl font-semibold">Bounty Types</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {BOUNTY_TYPES.map((bt) => {
            const Icon = bt.icon;
            return (
              <Card key={bt.id} className={`border-2 bg-gradient-to-br ${bt.color}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Icon className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-base">{bt.name}</CardTitle>
                      <Badge variant="outline" className="text-xs mt-1">{bt.typicalEarning}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{bt.description}</p>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Requirements:</p>
                    <ul className="space-y-1">
                      {bt.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <div className="flex gap-3 flex-wrap">
          <Button onClick={() => navigate("/factory/nodes")} className="gap-2">
            Register Your Node
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => navigate("/factory/production-systems")}>
            View Production Levels
          </Button>
        </div>
      </div>
    </PortalPageLayout>
  );
}
