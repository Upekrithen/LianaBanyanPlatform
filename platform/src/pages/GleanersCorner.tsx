import { useState, useEffect, useRef } from "react";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CurrencyAmount, CurrencyGlyph } from "@/components/CreditSymbol";
import {
  Wheat,
  Sprout,
  Heart,
  ShieldCheck,
  Users,
  UtensilsCrossed,
  Stethoscope,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Coins,
} from "lucide-react";
import {
  SPLIT,
  SPLIT_DISPLAY,
  CATEGORY_BREAKDOWN,
  PRESETS,
  SAMPLE_FUND_SUMMARY,
  SAMPLE_DISTRIBUTIONS,
  calculateSplit,
  monthlyGleanerProjection,
  type SplitBreakdown,
  type DistributionCategory,
} from "@/lib/gleanersCornerService";

// ============================================================================
// ANIMATED SPLIT BAR
// ============================================================================

function SplitBar() {
  const [animated, setAnimated] = useState(false);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (barRef.current) observer.observe(barRef.current);
    return () => observer.disconnect();
  }, []);

  const segments = [
    {
      key: "creator",
      pct: 83.3,
      label: "Creator",
      display: SPLIT_DISPLAY.CREATOR,
      color: "bg-amber-500",
      hoverColor: "bg-amber-400",
      textColor: "text-amber-400",
      description: "The maker keeps the lion's share. Your craft, your reward.",
    },
    {
      key: "platform",
      pct: 13.3,
      label: "Platform",
      display: SPLIT_DISPLAY.PLATFORM,
      color: "bg-blue-500",
      hoverColor: "bg-blue-400",
      textColor: "text-blue-400",
      description: "Operations, infrastructure, the machine that makes it work.",
    },
    {
      key: "gleaners",
      pct: 3.3,
      label: "Gleaner's Corner",
      display: SPLIT_DISPLAY.GLEANERS,
      color: "bg-emerald-500",
      hoverColor: "bg-emerald-400",
      textColor: "text-emerald-400",
      description: "For food, medical, essentials — nobody falls through.",
    },
  ];

  return (
    <div ref={barRef} className="space-y-4">
      {/* The bar */}
      <div className="relative h-16 rounded-xl overflow-hidden flex bg-muted border border-border">
        {segments.map((seg, i) => (
          <div
            key={seg.key}
            className={`relative flex items-center justify-center cursor-pointer transition-all duration-300 ${
              hoveredSegment === seg.key ? seg.hoverColor : seg.color
            } ${hoveredSegment && hoveredSegment !== seg.key ? "opacity-60" : "opacity-100"}`}
            style={{
              width: animated ? `${seg.pct}%` : "0%",
              transition: `width 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${i * 0.2}s, opacity 0.2s`,
            }}
            onMouseEnter={() => setHoveredSegment(seg.key)}
            onMouseLeave={() => setHoveredSegment(null)}
          >
            {animated && seg.pct > 10 && (
              <span className="text-sm font-bold text-white drop-shadow-lg">
                {seg.display}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Labels below */}
      <div className="grid grid-cols-3 gap-4">
        {segments.map((seg) => (
          <div
            key={seg.key}
            className={`text-center transition-all duration-200 ${
              hoveredSegment === seg.key ? "scale-105" : ""
            }`}
            onMouseEnter={() => setHoveredSegment(seg.key)}
            onMouseLeave={() => setHoveredSegment(null)}
          >
            <div className={`text-lg font-bold ${seg.textColor}`}>{seg.display}</div>
            <div className="text-sm font-medium text-foreground">{seg.label}</div>
            <div className="text-xs text-muted-foreground mt-1">{seg.description}</div>
          </div>
        ))}
      </div>

      {/* Expanded detail on hover */}
      {hoveredSegment && (
        <div className="bg-muted/60 border border-border rounded-lg p-4 animate-in fade-in duration-200">
          <p className="text-sm text-muted-foreground">
            {segments.find((s) => s.key === hoveredSegment)?.description}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// INTERACTIVE CALCULATOR
// ============================================================================

function SplitCalculator() {
  const [price, setPrice] = useState<number>(25);
  const [split, setSplit] = useState<SplitBreakdown>(calculateSplit(25));

  useEffect(() => {
    if (price > 0) {
      setSplit(calculateSplit(price));
    }
  }, [price]);

  const cards = [
    {
      label: "Creator Receives",
      amount: split.creator,
      icon: <Coins className="h-5 w-5 text-amber-400" />,
      color: "border-amber-500/30 bg-amber-500/5",
      textColor: "text-amber-400",
    },
    {
      label: "Platform Receives",
      amount: split.platform,
      icon: <ShieldCheck className="h-5 w-5 text-blue-400" />,
      color: "border-blue-500/30 bg-blue-500/5",
      textColor: "text-blue-400",
    },
    {
      label: "Gleaner's Corner",
      amount: split.gleaners,
      icon: <Sprout className="h-5 w-5 text-emerald-400" />,
      color: "border-emerald-500/30 bg-emerald-500/5",
      textColor: "text-emerald-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Price input */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-muted-foreground whitespace-nowrap">Product Price:</label>
        <div className="relative flex-1 max-w-xs">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <CurrencyGlyph currency="credit" size={20} />
          </div>
          <Input
            type="number"
            min={0}
            step={0.01}
            value={price}
            onChange={(e) => setPrice(Math.max(0, parseFloat(e.target.value) || 0))}
            className="pl-10 bg-muted border-border text-foreground"
          />
        </div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => setPrice(preset.price)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
              price === preset.price
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                : "border-border bg-muted text-muted-foreground hover:border-border hover:text-muted-foreground"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Split results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Card key={card.label} className={`border ${card.color}`}>
            <CardContent className="pt-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {card.icon}
                <span className="text-sm text-muted-foreground">{card.label}</span>
              </div>
              <div className={`text-2xl font-bold ${card.textColor}`}>
                <CurrencyAmount amount={card.amount} showDecimals />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// FUND DASHBOARD
// ============================================================================

function FundDashboard() {
  const fund = SAMPLE_FUND_SUMMARY;

  const categoryIcon = (cat: DistributionCategory) => {
    switch (cat) {
      case "food": return <UtensilsCrossed className="h-4 w-4 text-amber-400" />;
      case "medical": return <Stethoscope className="h-4 w-4 text-blue-400" />;
      case "emergency": return <AlertTriangle className="h-4 w-4 text-red-400" />;
    }
  };

  const categoryBadge = (cat: DistributionCategory) => {
    switch (cat) {
      case "food":
        return <Badge variant="outline" className="border-amber-500/50 text-amber-400">Food</Badge>;
      case "medical":
        return <Badge variant="outline" className="border-blue-500/50 text-blue-400">Medical</Badge>;
      case "emergency":
        return <Badge variant="outline" className="border-red-500/50 text-red-400">Emergency</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Total Collected</div>
            <div className="text-2xl font-bold text-emerald-400">
              <CurrencyAmount amount={fund.totalCollected} currency="mark" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Total Distributed</div>
            <div className="text-2xl font-bold text-blue-400">
              <CurrencyAmount amount={fund.totalDistributed} currency="mark" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-muted">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Reserve Balance</div>
            <div className="text-2xl font-bold text-muted-foreground">
              <CurrencyAmount amount={fund.reserveBalance} currency="mark" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category breakdown */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Distribution by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {CATEGORY_BREAKDOWN.map((cat) => (
              <div key={cat.category} className="flex items-center gap-3">
                {categoryIcon(cat.category)}
                <span className="text-sm text-muted-foreground w-36">{cat.label}</span>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                  />
                </div>
                <span className="text-sm font-medium text-muted-foreground w-10 text-right">
                  {cat.percentage}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Distribution history */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Recent Distributions</CardTitle>
          <CardDescription>Last 10 allocations from the Gleaner's Fund</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Date</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Category</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Description</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">Recipients</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_DISTRIBUTIONS.map((dist) => (
                  <tr key={dist.id} className="border-b border-border hover:bg-muted">
                    <td className="py-2.5 px-3 text-muted-foreground">
                      {new Date(dist.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-2.5 px-3">{categoryBadge(dist.category)}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{dist.description}</td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground">{dist.recipientCount}</td>
                    <td className="py-2.5 px-3 text-right">
                      <CurrencyAmount amount={dist.totalMarks} currency="mark" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// COMMUNITY IMPACT
// ============================================================================

function CommunityImpact() {
  const fund = SAMPLE_FUND_SUMMARY;

  const stats = [
    {
      value: fund.familiesSupported,
      label: "Families supported this month",
      icon: <Users className="h-8 w-8 text-emerald-400" />,
      color: "border-emerald-500/20 bg-emerald-500/5",
    },
    {
      value: fund.mealsFunded,
      label: "Meals funded",
      icon: <UtensilsCrossed className="h-8 w-8 text-amber-400" />,
      color: "border-amber-500/20 bg-amber-500/5",
    },
    {
      value: fund.medicalCovered,
      label: "Medical appointments covered",
      icon: <Stethoscope className="h-8 w-8 text-blue-400" />,
      color: "border-blue-500/20 bg-blue-500/5",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <Card key={stat.label} className={`border ${stat.color} text-center`}>
          <CardContent className="pt-8 pb-6">
            <div className="flex justify-center mb-4">{stat.icon}</div>
            <div className="text-4xl font-bold text-foreground mb-2">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================================================
// HOW IT WORKS ACCORDION
// ============================================================================

function HowItWorks() {
  return (
    <Accordion type="single" collapsible className="space-y-2">
      <AccordionItem value="automatic" className="border border-border rounded-lg px-4">
        <AccordionTrigger className="text-foreground hover:no-underline">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span>Every Transaction Contributes</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground">
          <p>
            The Gleaner's Corner is automatic and structural. There is no opt-in, no checkbox,
            no decision to make. Every single transaction on the platform allocates 3.3% to the
            community fund. Sellers see their full price. Buyers pay the listed price. The split
            happens behind the scenes, built into the architecture itself.
          </p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="where" className="border border-border rounded-lg px-4">
        <AccordionTrigger className="text-foreground hover:no-underline">
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 text-rose-400" />
            <span>Where Gleaner's Funds Go</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground">
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <UtensilsCrossed className="h-4 w-4 mt-0.5 text-amber-400 shrink-0" />
              <span><strong className="text-foreground">Food assistance</strong> — Mark-funded grocery essentials distributed to families in need</span>
            </li>
            <li className="flex items-start gap-2">
              <Stethoscope className="h-4 w-4 mt-0.5 text-blue-400 shrink-0" />
              <span><strong className="text-foreground">Medical Savings (MSA)</strong> — Dental, prescriptions, specialist visits</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 text-red-400 shrink-0" />
              <span><strong className="text-foreground">Emergency support</strong> — Urgent utilities, transportation, crisis assistance</span>
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="why" className="border border-border rounded-lg px-4">
        <AccordionTrigger className="text-foreground hover:no-underline">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            <span>Why 3.3%?</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground">
          <p className="mb-4">
            Small enough to be invisible to the seller. Large enough to matter at scale.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-muted rounded-lg p-3 border border-border">
              <div className="text-xs text-muted-foreground/70 mb-1">At $1M monthly volume</div>
              <div className="text-lg font-bold text-emerald-400">
                <CurrencyAmount amount={monthlyGleanerProjection(1_000_000)} currency="mark" />
                <span className="text-sm text-muted-foreground font-normal"> / month</span>
              </div>
            </div>
            <div className="bg-muted rounded-lg p-3 border border-border">
              <div className="text-xs text-muted-foreground/70 mb-1">At $10M monthly volume</div>
              <div className="text-lg font-bold text-emerald-400">
                <CurrencyAmount amount={monthlyGleanerProjection(10_000_000)} currency="mark" />
                <span className="text-sm text-muted-foreground font-normal"> / month</span>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="ruth" className="border border-border rounded-lg px-4">
        <AccordionTrigger className="text-foreground hover:no-underline">
          <div className="flex items-center gap-3">
            <Wheat className="h-5 w-5 text-amber-400" />
            <span>The Ruth Principle</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground">
          <p>
            In the ancient tradition, landowners left the edges of their fields unharvested so
            that those in need could glean what remained. It was not charity — it was structural.
            The field produced. The edges were left. Dignity was preserved. The Gleaner's Corner
            follows the same principle: leave the edges of every transaction for those who need them.
          </p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="marks" className="border border-border rounded-lg px-4">
        <AccordionTrigger className="text-foreground hover:no-underline">
          <div className="flex items-center gap-3">
            <CurrencyGlyph currency="mark" size={20} />
            <span>Marks, Not Dollars</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground">
          <p>
            Gleaner's funds distribute as Marks — the effort-debt currency restricted to essentials
            like food and medical care. This keeps the closed-loop economy intact. Marks cannot be
            cashed out, cannot be speculated on, and can only be spent on what people actually need.
            The system ensures funds go directly to their intended purpose.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function GleanersCorner() {
  useAuth();

  return (
    <PortalPageLayout maxWidth="xl" xrayId="gleaners-corner">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Wheat className="h-10 w-10 text-amber-400" />
            <h1 className="text-4xl font-bold tracking-tight">Gleaner's Corner</h1>
            <Sprout className="h-10 w-10 text-emerald-400" />
          </div>
          <p className="text-xl text-muted-foreground mb-3">
            The edges of every field, left for those who need them
          </p>
          <p className="text-sm italic text-muted-foreground/70 max-w-lg mx-auto">
            "Let her glean even among the sheaves, and do not reproach her." — Ruth 2:15
          </p>
        </div>

        {/* The Split — Main Visualization */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-emerald-400" />
            The Split
          </h2>
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <SplitBar />
            </CardContent>
          </Card>
        </section>

        {/* Interactive Calculator */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-400" />
            See How Any Transaction Splits
          </h2>
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <SplitCalculator />
            </CardContent>
          </Card>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-400" />
            How It Works
          </h2>
          <HowItWorks />
        </section>

        {/* Gleaner's Fund Dashboard */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Sprout className="h-5 w-5 text-emerald-400" />
            Gleaner's Fund Dashboard
          </h2>
          <FundDashboard />
        </section>

        {/* Community Impact */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-400" />
            Community Impact
          </h2>
          <p className="text-muted-foreground mb-6">
            Strength and dignity. Every number here represents a real person, a real family,
            standing on their own feet with a little structural support.
          </p>
          <CommunityImpact />
        </section>
    </PortalPageLayout>
  );
}
