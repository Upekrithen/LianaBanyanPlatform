/**
 * ProductionPathways — /production-pathways on DSS portal
 * D2: Dual Pathway Selector — FormNow Direct vs Decentralized Factory Node
 */
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Zap, Factory, ExternalLink, ArrowRight,
  CheckCircle2, Clock, DollarSign, Package,
  Users, Layers, ChevronRight, Calculator
} from "lucide-react";

const PATHWAY_A = {
  title: "FormNow Direct",
  subtitle: "Professional Production, Instant Quotes",
  icon: Zap,
  color: "from-blue-600/20 to-blue-600/5",
  border: "border-blue-500/40",
  badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  cta: {
    label: "Get Instant Quote",
    href: "https://now.formlabs.com",
    external: true,
  },
  flow: [
    "Upload STL file",
    "Receive instant quote",
    "Professional production by Formlabs",
    "Ship direct to you or your customer",
  ],
  specs: [
    { label: "Per-Part Cost", value: "~$15-25", detail: "Hex tile size" },
    { label: "Delivery", value: "2-5 days", detail: "Professional logistics" },
    { label: "Min Order", value: "1 part", detail: "No minimums" },
    { label: "Max Volume", value: "Unlimited", detail: "Formlabs capacity" },
  ],
  bestFor: [
    "Prototypes and validation prints",
    "Small batches (1-50 units)",
    "Surge capacity during demand spikes",
    "Parts needing professional finish",
    "Getting to market before your node is built",
  ],
  pros: ["Zero startup cost", "Instant quotes", "Professional quality", "No equipment needed"],
  cons: ["Higher per-unit cost at scale", "No local control", "Shipping from central facility"],
};

const PATHWAY_B = {
  title: "Decentralized Factory Node",
  subtitle: "Member-Operated, Lower Cost at Scale",
  icon: Factory,
  color: "from-orange-600/20 to-orange-600/5",
  border: "border-orange-500/40",
  badge: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  cta: {
    label: "Start a Node",
    href: "/register-maker",
    external: false,
  },
  flow: [
    "Set up node equipment at home",
    "SLA prototype from STL Vault",
    "SLS mold creation",
    "Desktop injection molding at volume",
  ],
  specs: [
    { label: "Per-Part Cost", value: "$0.30-1.50", detail: "At injection scale" },
    { label: "Delivery", value: "Same-day", detail: "Local node" },
    { label: "Break-Even", value: "~200 units", detail: "vs FormNow" },
    { label: "Capacity", value: "2,000+/week", detail: "Full node" },
  ],
  bestFor: [
    "Production runs of 500+ units",
    "Ongoing product lines with repeat orders",
    "Local fulfillment and same-day delivery",
    "Building a home-based manufacturing business",
    "Long-term cost optimization",
  ],
  pros: ["Dramatically lower unit cost", "Local control", "Home-based operation", "Build ownership in equipment"],
  cons: ["~$25K startup for full node", "Learning curve", "Requires physical space"],
};

function PathwayCard({ pathway }: { pathway: typeof PATHWAY_A }) {
  const Icon = pathway.icon;
  return (
    <Card className={`bg-gradient-to-b ${pathway.color} ${pathway.border} border h-full flex flex-col`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${pathway.badge.split(" ").slice(0, 1).join(" ")}`}>
            <Icon className={`w-6 h-6 ${pathway.badge.split(" ")[1]}`} />
          </div>
          <div>
            <CardTitle className="text-xl">{pathway.title}</CardTitle>
            <p className="text-sm text-zinc-400">{pathway.subtitle}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-5">
        {/* Flow */}
        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Process Flow</p>
          <div className="space-y-1.5">
            {pathway.flow.map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-mono text-zinc-500 shrink-0">
                  {i + 1}
                </span>
                {step}
              </div>
            ))}
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-2">
          {pathway.specs.map((s) => (
            <div key={s.label} className="bg-black/20 rounded-lg p-3 text-center">
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-[10px] text-zinc-500">{s.label}</p>
              <p className="text-[9px] text-zinc-600">{s.detail}</p>
            </div>
          ))}
        </div>

        {/* Best For */}
        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Best For</p>
          <ul className="space-y-1">
            {pathway.bestFor.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-zinc-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="pt-2">
          {pathway.cta.external ? (
            <a href={pathway.cta.href} target="_blank" rel="noopener noreferrer" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                {pathway.cta.label}
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
          ) : (
            <Link to={pathway.cta.href}>
              <Button className="w-full bg-orange-600 hover:bg-orange-500 text-white">
                {pathway.cta.label}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProductionPathways() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-zinc-100">
      {/* Header */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Choose Your <span className="text-orange-400">Production Pathway</span>
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Two paths to production. Use FormNow for instant professional prints, or build a
            Decentralized Factory Node for massive cost savings at volume. Most creators start
            with FormNow and graduate to a Node.
          </p>
        </div>
      </section>

      {/* Dual Cards */}
      <section className="max-w-5xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PathwayCard pathway={PATHWAY_A} />
          <PathwayCard pathway={PATHWAY_B} />
        </div>
      </section>

      {/* Comparison Table */}
      <section className="max-w-3xl mx-auto px-6 pb-8">
        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base text-center">Side-by-Side Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="py-2 text-left text-zinc-500 font-normal">Metric</th>
                  <th className="py-2 text-center text-blue-400 font-medium">FormNow</th>
                  <th className="py-2 text-center text-orange-400 font-medium">Factory Node</th>
                </tr>
              </thead>
              <tbody className="text-zinc-400">
                <tr className="border-b border-zinc-800/50">
                  <td className="py-2">Startup Cost</td>
                  <td className="py-2 text-center font-medium text-zinc-200">$0</td>
                  <td className="py-2 text-center font-medium text-zinc-200">~$25,000</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="py-2">Cost per Part (hex tile)</td>
                  <td className="py-2 text-center font-medium text-zinc-200">$15-25</td>
                  <td className="py-2 text-center font-medium text-zinc-200">$0.30-1.50</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="py-2">Break-Even Volume</td>
                  <td className="py-2 text-center text-zinc-500">N/A</td>
                  <td className="py-2 text-center font-medium text-zinc-200">~200 units</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="py-2">Delivery Speed</td>
                  <td className="py-2 text-center font-medium text-zinc-200">2-5 days</td>
                  <td className="py-2 text-center font-medium text-zinc-200">Same day</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="py-2">Weekly Capacity</td>
                  <td className="py-2 text-center font-medium text-zinc-200">Unlimited</td>
                  <td className="py-2 text-center font-medium text-zinc-200">2,000+</td>
                </tr>
                <tr>
                  <td className="py-2">Operator Required</td>
                  <td className="py-2 text-center text-zinc-200">No</td>
                  <td className="py-2 text-center text-zinc-200">Yes (home-based)</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      {/* Cold Start Calculator CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-16 text-center">
        <Link to="/cold-start-calculator">
          <Button size="lg" variant="outline" className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10">
            <Calculator className="w-5 h-5 mr-2" />
            Open the Cold Start Calculator
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
        <p className="text-xs text-zinc-500 mt-2">
          Model your exact configuration — see startup costs, per-unit economics, and break-even vs FormNow.
        </p>
      </section>

      {/* Back to Factory Node */}
      <section className="max-w-5xl mx-auto px-6 pb-16 text-center">
        <Link to="/factory-node" className="text-sm text-zinc-500 hover:text-orange-400 transition-colors">
          &larr; Back to Factory Node Overview
        </Link>
      </section>
    </div>
  );
}
