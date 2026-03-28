/**
 * MissionOnePage — /mission-one on .org
 * The full Mission ONE page: charitable food program with Les Mis framing.
 */
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  UtensilsCrossed, Heart, QrCode, Truck,
  Users, ShieldCheck, ArrowRight, ChevronRight
} from "lucide-react";

const HOW_IT_WORKS = [
  {
    icon: QrCode,
    title: "Charity Medallion QR Cards",
    desc: "Members in need receive a QR-coded Charity Medallion. Walk into any participating restaurant and scan — same menu, same food, same dignity.",
  },
  {
    icon: UtensilsCrossed,
    title: "Same Menu, No Stigma",
    desc: "There is no 'charity menu.' You order from the same menu as everyone else. The restaurant is reimbursed at Cost+20%. The creator keeps 83.3%.",
  },
  {
    icon: Truck,
    title: "Let's Make Dinner",
    desc: "Our first initiative deploys through local restaurants. Drivers deliver meals funded by earmarked credits and charitable subscriptions.",
  },
  {
    icon: ShieldCheck,
    title: "Funded by the Network",
    desc: "3.3% of every transaction flows into Gleaner's Corner. Plus direct earmarks and monthly subscriptions from members who choose to give.",
  },
];

const CONTRIBUTE_OPTIONS = [
  { title: "Earmark Credits", desc: "Direct your credits to Mission ONE in your city.", href: "/earmark", icon: Heart },
  { title: "Monthly Subscription", desc: "Fund 1, 5, or 10 meal subscriptions per month.", href: "/subscribe-to-feed", icon: Users },
  { title: "Gleaner's Corner", desc: "See how the 3.3% fund is growing.", href: "/gleaners-corner", icon: ShieldCheck },
];

export default function MissionOnePage() {
  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      {/* Hero */}
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
          <span className="text-emerald-400">MISSION ONE:</span>{" "}
          Everyone Eats Tonight
        </h1>
        <p className="text-lg text-amber-300/70 font-serif italic max-w-xl mx-auto">
          "For it rains on the Just and the Unjust alike."
        </p>
      </section>

      {/* Bishop Myriel Frame */}
      <Card className="bg-zinc-900/60 border-emerald-500/20">
        <CardContent className="p-8">
          <blockquote className="text-zinc-300 font-serif text-lg leading-relaxed border-l-4 border-emerald-500/40 pl-6">
            In Victor Hugo's <em>Les Misérables</em>, Bishop Myriel set a place at his table
            for anyone who came to his door — no questions asked. He didn't create a
            separate dining room for the poor. He simply set another place.
          </blockquote>
          <p className="mt-6 text-zinc-400">
            Mission ONE follows that principle. When you walk into a participating restaurant
            with a Charity Medallion, you sit at the same table, read the same menu, and eat
            the same food. There is no "charity line." The network absorbs the cost through
            Gleaner's Corner and member subscriptions. The restaurant earns its margin. The
            member eats with dignity.
          </p>
        </CardContent>
      </Card>

      {/* How It Works */}
      <section>
        <h2 className="text-2xl font-bold mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {HOW_IT_WORKS.map((step) => (
            <Card key={step.title} className="bg-zinc-900/40 border-zinc-800">
              <CardContent className="p-6 flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-200 mb-1">{step.title}</h3>
                  <p className="text-sm text-zinc-500">{step.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How to Contribute */}
      <section>
        <h2 className="text-2xl font-bold mb-6">How to Contribute</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CONTRIBUTE_OPTIONS.map((opt) => (
            <Link key={opt.href} to={opt.href} className="group">
              <Card className="bg-zinc-900/40 border-zinc-800 hover:border-emerald-500/40 transition-all h-full">
                <CardContent className="p-6 text-center">
                  <opt.icon className="w-8 h-8 mx-auto text-emerald-400 mb-3" />
                  <h3 className="font-semibold text-zinc-200 mb-1">{opt.title}</h3>
                  <p className="text-sm text-zinc-500 mb-3">{opt.desc}</p>
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Go <ChevronRight className="w-3 h-3" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-6">
        <Link to="/subscribe-to-feed">
          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white">
            <Heart className="w-5 h-5 mr-2" />
            Fund a Meal Subscription
          </Button>
        </Link>
        <p className="text-xs text-zinc-500 mt-3">
          Your subscriptions fund 28 meals per person per month from local restaurants.
        </p>
      </section>
    </div>
  );
}
