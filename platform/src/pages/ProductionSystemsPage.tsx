/**
 * ProductionSystemsPage — Wave 6 Phase U
 * =========================================
 * The Six Production Systems of the decentralized factory network.
 * Route: /factory/production-systems
 *
 * These are the six levels from prototype to mass production.
 * All pricing follows Cost+20%. Factory nodes earn 83.3%.
 */
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Factory, ArrowRight, TrendingUp } from "lucide-react";
import { PortalPageLayout } from "@/components/PortalPageLayout";

interface ProductionSystem {
  level: number;
  name: string;
  description: string;
  typicalBatchSize: string;
  unitCostMultiplier: string;
  turnaround: string;
  who: string;
  color: string;
}

const SIX_PRODUCTION_SYSTEMS: ProductionSystem[] = [
  {
    level: 1,
    name: "Prototype",
    description:
      "Design-and-test runs for first-time products. High per-unit cost, maximum flexibility. The stage where products are refined before committing to larger production.",
    typicalBatchSize: "1-10 units",
    unitCostMultiplier: "3-5x mass cost",
    turnaround: "1-4 weeks",
    who: "Inventors, designers, first-time makers",
    color: "from-slate-500/20 to-zinc-500/20 border-slate-500/30",
  },
  {
    level: 2,
    name: "Pilot",
    description:
      "First real production run. Used to validate the production process, train the factory node team, and generate initial product for early customers. Feedback loop is tight.",
    typicalBatchSize: "10-100 units",
    unitCostMultiplier: "2-3x mass cost",
    turnaround: "2-6 weeks",
    who: "Validated designers ready for first customers",
    color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  },
  {
    level: 3,
    name: "Small Batch",
    description:
      "Established product with a proven design and initial customer base. Small-batch production is where most Brass Tacks members operate long-term for artisan or specialty goods.",
    typicalBatchSize: "100-500 units",
    unitCostMultiplier: "1.5-2x mass cost",
    turnaround: "2-8 weeks",
    who: "Artisan producers, specialty goods makers",
    color: "from-green-500/20 to-emerald-500/20 border-green-500/30",
  },
  {
    level: 4,
    name: "Medium Run",
    description:
      "Coordinated production across 2-5 factory nodes for consistent supply. This level requires production scheduling, inventory management, and a quality protocol across nodes.",
    typicalBatchSize: "500-5,000 units",
    unitCostMultiplier: "1.2-1.5x mass cost",
    turnaround: "4-12 weeks",
    who: "Growing businesses with established demand",
    color: "from-amber-500/20 to-yellow-500/20 border-amber-500/30",
  },
  {
    level: 5,
    name: "Large Run",
    description:
      "Network-wide production coordination. Multiple nodes running in parallel. Full supply-chain management through the Anchor compatibility layer. Volume discounts from suppliers at this level.",
    typicalBatchSize: "5,000-50,000 units",
    unitCostMultiplier: "1.05-1.2x mass cost",
    turnaround: "6-16 weeks",
    who: "Established cooperative businesses with proven products",
    color: "from-orange-500/20 to-red-500/20 border-orange-500/30",
  },
  {
    level: 6,
    name: "Mass Production",
    description:
      "Full cooperative manufacturing scale. Reserved for products with validated demand at scale. Lowest per-unit cost. Requires Anchor certification and full production protocol documentation.",
    typicalBatchSize: "50,000+ units",
    unitCostMultiplier: "Baseline (1x)",
    turnaround: "8-24 weeks",
    who: "Cooperative products with platform-wide demand",
    color: "from-violet-500/20 to-purple-500/20 border-violet-500/30",
  },
];

export default function ProductionSystemsPage() {
  const navigate = useNavigate();

  return (
    <PortalPageLayout variant="stage" xrayId="production-systems">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Back */}
        <Button variant="ghost" size="sm" onClick={() => navigate("/factory")} className="gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Factory Hub
        </Button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <Factory className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Six Production Systems</h1>
            <p className="text-muted-foreground">The decentralized factory network at every scale</p>
          </div>
        </div>

        {/* Overview */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-4 text-sm text-muted-foreground space-y-2">
            <p>
              The cooperative factory network supports six production levels from single prototypes
              to mass production. Every level uses Cost+20% pricing. Factory nodes earn 83.3% of
              every production run at every level.
            </p>
            <p>
              Products move up levels as demand validates scale. There is no pressure to scale beyond
              what makes sense for your product and customers.
            </p>
          </CardContent>
        </Card>

        {/* Volume trend bar */}
        <div className="flex items-center gap-2 py-2">
          <span className="text-xs text-muted-foreground">Per-unit cost decreases as level increases</span>
          <TrendingUp className="h-4 w-4 text-green-400" />
        </div>

        {/* Systems Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SIX_PRODUCTION_SYSTEMS.map((system) => (
            <Card
              key={system.level}
              className={`border-2 bg-gradient-to-br ${system.color}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-2xl text-muted-foreground/50">
                    L{system.level}
                  </span>
                  <CardTitle className="text-lg">{system.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {system.description}
                </p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground/70">Batch size</span>
                    <span className="font-medium">{system.typicalBatchSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground/70">Unit cost</span>
                    <span className="font-medium">{system.unitCostMultiplier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground/70">Turnaround</span>
                    <span className="font-medium">{system.turnaround}</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground/70 italic">
                  {system.who}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="flex gap-3 flex-wrap">
          <Button onClick={() => navigate("/factory/nodes")} className="gap-2">
            Register a Factory Node
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => navigate("/factory/volume-discount")}>
            View Volume Discount Model
          </Button>
          <Button variant="outline" onClick={() => navigate("/factory/local-fulfillment")}>
            Local Fulfillment Bounties
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          All production follows Cost+20% pricing. Factory nodes keep 83.3% of every run.
          2,270 innovations, 228 Crown Jewels backing this production system.
        </p>
      </div>
    </PortalPageLayout>
  );
}
