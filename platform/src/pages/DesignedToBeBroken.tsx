import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Hammer, ArrowRight, CheckCircle2, Shield, Users, Coins, Gift, Zap, Heart, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { PortalPageLayout } from "@/components/PortalPageLayout";

const MARKS_FACTS = [
  { q: "How do I earn Marks?", a: "Through participation — completing bounties, production work, quality verification (STAMP), backing successful projects, and any form of cooperative contribution. Marks emerge from differential: the gap between what you contribute and what you consume." },
  { q: "Do I ever have to pay to earn Marks?", a: "Never. Marks are free to earn, forever. Your $5 annual membership gives you access to the platform. Marks are earned purely through participation — no purchase required, no conversion necessary." },
  { q: "What can I spend Marks on?", a: "Essentials — food, medical supplies, household necessities. Marks are restricted to essential goods and services to ensure they serve their purpose as a safety net currency." },
  { q: "Do Marks expire?", a: "No. Marks you earn are yours. They don't expire, they don't degrade, and they can't be taken away. The only way Marks leave your account is when you spend them." },
  { q: "Can I convert Marks to Credits or cash?", a: "You don't have to. Marks are a complete currency on their own. You can spend them directly on essentials without converting to anything. If you want broader purchasing power, Credits are available — but Marks stand alone." },
  { q: "What are Backed Marks?", a: "A subtype backed by cooperative-held Joule collateral. Backed Marks are spendable ONLY on project sponsorship — not personal essentials. They preserve the 'Marks from differential only' rule while enabling project backing." },
  { q: "What are Pledged Marks?", a: "Your own earned Marks escrowed to a specific project. Compartmentalized per-project: released on success, absorbed on failure. Used by Stewards and for Pledged Mark Voting." },
];

export default function DesignedToBeBroken() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <PortalPageLayout variant="stage" maxWidth="xl" xrayId="designed-to-be-broken">
      <div className="space-y-8">
        {/* Hero */}
        <header className="text-center space-y-4 py-8">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-600/30 flex items-center justify-center">
              <Hammer className="w-10 h-10 text-amber-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black">
            Designed to Be <span className="text-amber-400">Broken</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Earn Marks you can spend through participation. Free of charge. Forever.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Badge className="bg-green-500/20 text-green-400 border-0 text-sm px-3 py-1">Free to Earn</Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border-0 text-sm px-3 py-1">No Conversion Required</Badge>
            <Badge className="bg-amber-500/20 text-amber-400 border-0 text-sm px-3 py-1">Spend on Essentials</Badge>
          </div>
        </header>

        {/* The Promise */}
        <Card className="bg-gradient-to-r from-amber-900/30 via-slate-900/60 to-amber-900/30 border-amber-700/40">
          <CardContent className="py-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-3">
                <Zap className="w-10 h-10 text-amber-400 mx-auto" />
                <h3 className="font-bold text-lg">Participate</h3>
                <p className="text-sm text-slate-400">
                  Complete bounties. Build products. Verify quality. Back projects.
                  Every act of participation earns Marks.
                </p>
              </div>
              <div className="text-center space-y-3">
                <Coins className="w-10 h-10 text-green-400 mx-auto" />
                <h3 className="font-bold text-lg">Earn</h3>
                <p className="text-sm text-slate-400">
                  Marks emerge from differential — the gap between contribution and consumption.
                  No purchase required. No conversion needed.
                </p>
              </div>
              <div className="text-center space-y-3">
                <Heart className="w-10 h-10 text-pink-400 mx-auto" />
                <h3 className="font-bold text-lg">Spend</h3>
                <p className="text-sm text-slate-400">
                  Use Marks directly on essentials: food, medical, household necessities.
                  Your participation becomes your safety net.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Why "Designed to Be Broken"? */}
        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader>
            <CardTitle className="text-xl">Why "Designed to Be Broken"?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300">
              Every other economic system is designed to <strong>accumulate</strong>. Marks are designed to <strong>circulate</strong>.
            </p>
            <p className="text-slate-400">
              When you earn Marks, the system wants you to spend them. When you spend them on essentials,
              the Marks flow to the producer — who earned them by making the things you need.
              The cycle continues. No hoarding. No extraction. No concentration.
            </p>
            <p className="text-slate-400">
              The system is "broken" on purpose: it cannot accumulate wealth because the currency
              is restricted to essentials and earned only through participation. The mechanism for
              extraction was removed before launch.
            </p>
            <div className="mt-4 p-4 rounded-lg bg-amber-900/20 border border-amber-800/30">
              <p className="text-sm text-amber-300 italic">
                "I gave away the mechanism for extraction before I launched. The proof is in the bylaws —
                83.3% to creators, makers, and workers on every transaction, locked permanently."
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Three Currency Visual */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Three Currencies, One Value</h2>
          <p className="text-sm text-slate-400">1 Credit = 1 Mark = 1 Joule — different acquisition, same value.</p>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-green-900/20 border-green-800/30">
              <CardContent className="py-5 text-center space-y-2">
                <p className="text-3xl font-black text-green-400">Credits</p>
                <p className="text-sm text-slate-400">Purchased with fiat ($1 = 1 Credit)</p>
                <p className="text-xs text-slate-500">Universal use. Closed-loop (no cash-out).</p>
              </CardContent>
            </Card>
            <Card className="bg-amber-900/20 border-amber-800/30">
              <CardContent className="py-5 text-center space-y-2">
                <p className="text-3xl font-black text-amber-400">Marks</p>
                <p className="text-sm text-slate-400">Earned through participation (free)</p>
                <p className="text-xs text-slate-500">Restricted to essentials. Effort-debt currency.</p>
                <Badge className="bg-amber-500/20 text-amber-400 border-0 mt-1">This is the one.</Badge>
              </CardContent>
            </Card>
            <Card className="bg-blue-900/20 border-blue-800/30">
              <CardContent className="py-5 text-center space-y-2">
                <p className="text-3xl font-black text-blue-400">Joules</p>
                <p className="text-sm text-slate-400">Surplus storage ("forever stamp")</p>
                <p className="text-xs text-slate-500">Locks exchange rate at purchase time.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="border-slate-800" />

        {/* How You Earn Marks */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">How You Earn Marks</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { action: "Complete a bounty", example: "Build a website for a guild member", icon: CheckCircle2 },
              { action: "Produce goods", example: "3D print parts in a production campaign", icon: Hammer },
              { action: "STAMP verification", example: "Quality-check another maker's output", icon: Shield },
              { action: "Back successful projects", example: "Your BandWagon picks succeed", icon: ArrowRight },
              { action: "Steward a campaign", example: "Manage a production run end-to-end", icon: Users },
              { action: "Refer new members", example: "Send a Cue Card, they sign up", icon: Gift },
            ].map((item, idx) => (
              <Card key={idx} className="bg-slate-900/60 border-slate-800">
                <CardContent className="py-3 flex items-start gap-3">
                  <item.icon className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{item.action}</p>
                    <p className="text-xs text-slate-400">{item.example}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="border-slate-800" />

        {/* FAQ Accordion */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {MARKS_FACTS.map((faq, idx) => (
              <div key={idx} className="border border-slate-800 rounded-lg overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-800/50 transition-colors"
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                >
                  <span className="font-medium text-sm">{faq.q}</span>
                  {expandedFaq === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {expandedFaq === idx && (
                  <div className="px-4 pb-3">
                    <p className="text-sm text-slate-400">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border-amber-700/40">
          <CardContent className="py-6 text-center space-y-4">
            <h2 className="text-2xl font-bold">Ready to Earn?</h2>
            <p className="text-slate-300">$5 annual membership. Unlimited participation. Marks earned forever.</p>
            <div className="flex justify-center gap-3">
              <Link to="/onboarding/trickle">
                <Button className="gap-2">
                  <ArrowRight className="w-4 h-4" /> Join the Cooperative
                </Button>
              </Link>
              <Link to="/c-plus-20">
                <Button variant="outline" className="gap-2">
                  <Coins className="w-4 h-4" /> See C+20 Pricing
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalPageLayout>
  );
}
