/**
 * FactoryNodePage — /factory-node on DSS portal
 * Innovation #1939: Decentralized Factory Node visualization.
 * Visual assembly line: DESIGN → SLA PROTOTYPE → VALIDATE → SLS MOLD → INJECTION MOLD → SHIP
 */
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PenTool, Printer, ClipboardCheck, Cog,
  Factory, Truck, ArrowRight, Users, DollarSign,
  Clock, Zap, ChevronRight
} from "lucide-react";

const ASSEMBLY_STAGES = [
  {
    id: "design",
    title: "DESIGN",
    subtitle: "CAD / STL Creation",
    icon: PenTool,
    machine: "Any CAD software (Fusion 360, Blender, OnShape)",
    operator: "Creator / Designer (remote)",
    costPerUnit: "Time only",
    timeEstimate: "1-40 hours per design",
    color: "from-violet-500/20 to-violet-500/5",
    borderColor: "border-violet-500/30",
    iconColor: "text-violet-400",
    detail: "The design phase happens anywhere. Upload your STL to the vault and it enters the pipeline.",
  },
  {
    id: "sla-prototype",
    title: "SLA PROTOTYPE",
    subtitle: "Resin 3D Print",
    icon: Printer,
    machine: "Formlabs Form 3+ (SLA)",
    operator: "Node Member (home-based)",
    costPerUnit: "$3-8 per part",
    timeEstimate: "2-6 hours per print",
    color: "from-cyan-500/20 to-cyan-500/5",
    borderColor: "border-cyan-500/30",
    iconColor: "text-cyan-400",
    detail: "High-resolution resin prints for validation. 6 printers per node give continuous throughput.",
  },
  {
    id: "validate",
    title: "VALIDATE",
    subtitle: "Test Pilot Quorum",
    icon: ClipboardCheck,
    machine: "Test Pilot Dashboard",
    operator: "3-5 Test Pilots (distributed)",
    costPerUnit: "XP + Crow Feathers",
    timeEstimate: "24-72 hours for quorum",
    color: "from-amber-500/20 to-amber-500/5",
    borderColor: "border-amber-500/30",
    iconColor: "text-amber-400",
    detail: "Multiple testers print and validate. 3/5 success quorum required before production tooling begins.",
  },
  {
    id: "sls-mold",
    title: "SLS MOLD",
    subtitle: "Nylon Mold Master",
    icon: Cog,
    machine: "Formlabs Fuse 1+ 30W (SLS)",
    operator: "Node Operator (home-based)",
    costPerUnit: "$15-40 per mold",
    timeEstimate: "4-12 hours per mold set",
    color: "from-orange-500/20 to-orange-500/5",
    borderColor: "border-orange-500/30",
    iconColor: "text-orange-400",
    detail: "SLS nylon molds are durable enough for short-run injection molding (500-5,000 parts per mold).",
  },
  {
    id: "injection-mold",
    title: "INJECTION MOLD",
    subtitle: "Desktop Injection",
    icon: Factory,
    machine: "Galomb Model-B100 (or equiv.)",
    operator: "Node Operator (home-based)",
    costPerUnit: "$0.30-1.50 per part",
    timeEstimate: "30-60 seconds per shot",
    color: "from-emerald-500/20 to-emerald-500/5",
    borderColor: "border-emerald-500/30",
    iconColor: "text-emerald-400",
    detail: "Desktop injection molding using SLS-printed molds. 3-5 machines per node. Massive unit cost reduction at volume.",
  },
  {
    id: "ship",
    title: "SHIP",
    subtitle: "Fulfillment & QC",
    icon: Truck,
    machine: "Packaging station + shipping labels",
    operator: "Node Operator or Driver",
    costPerUnit: "$2-5 per shipment",
    timeEstimate: "Same-day to next-day",
    color: "from-blue-500/20 to-blue-500/5",
    borderColor: "border-blue-500/30",
    iconColor: "text-blue-400",
    detail: "QC check, packaging, and handoff to shipping. The .net portal tracks manifests from here.",
  },
];

const NODE_SPECS = [
  { label: "SLA Printers", value: "6", detail: "Formlabs Form 3+" },
  { label: "SLS Printer", value: "2", detail: "Formlabs Fuse 1+ 30W" },
  { label: "Injection Molders", value: "3-5", detail: "Galomb B100" },
  { label: "Operators", value: "1-3", detail: "Home-based members" },
  { label: "Weekly Capacity", value: "2,000+", detail: "Units at scale" },
  { label: "Startup Cost", value: "~$25K", detail: "Full node" },
];

export default function FactoryNodePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-zinc-100">
      {/* Hero */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 mb-4">
            Innovation #1939
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            <span className="text-orange-400">Decentralized</span> Factory Node
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-2">
            A modular, home-based manufacturing assembly line. From design to doorstep
            without a traditional factory.
          </p>
          <p className="text-sm text-zinc-500 max-w-xl mx-auto">
            Each node is a complete production unit — SLA prototyping, SLS mold-making,
            desktop injection molding — operated by members from their homes.
          </p>
        </div>
      </section>

      {/* Assembly Line Flow */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">The Assembly Line</h2>
        <div className="space-y-4">
          {ASSEMBLY_STAGES.map((stage, i) => (
            <div key={stage.id} className="relative">
              {/* Connector */}
              {i < ASSEMBLY_STAGES.length - 1 && (
                <div className="absolute left-1/2 -bottom-4 transform -translate-x-1/2 z-10">
                  <ArrowRight className="w-6 h-6 text-zinc-600 rotate-90" />
                </div>
              )}
              <Card className={`bg-gradient-to-r ${stage.color} ${stage.borderColor} border overflow-hidden`}>
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Stage Number + Icon */}
                    <div className="md:w-20 flex items-center justify-center p-4 md:p-6 bg-black/20">
                      <div className="text-center">
                        <stage.icon className={`w-8 h-8 mx-auto ${stage.iconColor}`} />
                        <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 md:p-6">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div>
                          <h3 className="text-lg font-bold text-zinc-100">{stage.title}</h3>
                          <p className="text-sm text-zinc-400">{stage.subtitle}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-400 shrink-0">
                          {stage.machine}
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-400 mt-3">{stage.detail}</p>
                      <div className="flex flex-wrap gap-4 mt-4 text-xs">
                        <span className="flex items-center gap-1 text-zinc-400">
                          <Users className="w-3 h-3" /> {stage.operator}
                        </span>
                        <span className="flex items-center gap-1 text-zinc-400">
                          <DollarSign className="w-3 h-3" /> {stage.costPerUnit}
                        </span>
                        <span className="flex items-center gap-1 text-zinc-400">
                          <Clock className="w-3 h-3" /> {stage.timeEstimate}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Node Specifications */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Standard Node Configuration</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {NODE_SPECS.map((spec) => (
            <Card key={spec.label} className="bg-zinc-900/60 border-zinc-800">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-orange-400">{spec.value}</p>
                <p className="text-xs font-medium text-zinc-300 mt-1">{spec.label}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">{spec.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTAs */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/production-pathways">
            <Button size="lg" className="bg-orange-600 hover:bg-orange-500 text-white">
              <Zap className="w-5 h-5 mr-2" />
              Compare Production Pathways
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Link to="/register-maker">
            <Button size="lg" variant="outline" className="border-zinc-700 text-zinc-300">
              <Factory className="w-5 h-5 mr-2" />
              Start a Node
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
