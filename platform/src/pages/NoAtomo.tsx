import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Zap, Shield, Lock, ArrowRight, Ban, Scale } from "lucide-react";
import { Link } from "react-router-dom";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function NoAtomo() {
  return (
    <PortalPageLayout>
      <div className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <header className="text-center space-y-4 py-8">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500/30 to-orange-600/30 flex items-center justify-center">
              <Zap className="w-10 h-10 text-red-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black">
            No Atomo. <span className="text-red-400">Superman!</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            We don't break things down to extract. We build things up to endure.
          </p>
        </header>

        {/* The Reference */}
        <Card className="bg-gradient-to-r from-red-900/30 via-slate-900/60 to-orange-900/30 border-red-700/40">
          <CardContent className="py-8">
            <div className="max-w-3xl mx-auto space-y-6 text-center">
              <p className="text-lg text-slate-300">
                In <em>The Iron Giant</em>, the Giant has a choice: be the weapon he was built to be,
                or be something greater. He chooses. He says:
              </p>
              <p className="text-3xl font-black text-red-400 italic">
                "No Atomo. Superman!"
              </p>
              <p className="text-slate-400">
                Every platform today is built to extract. They're Atomo — atomic weapons designed to
                break markets into pieces and siphon the value. Liana Banyan was built to be Superman.
                We chose not to extract. We chose to give 83.3% back.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* What We Refuse */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Ban className="w-5 h-5 text-red-400" />
            What We Refuse to Do
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: "No Venture Capital", detail: "VCs demand 10x returns. That math requires extraction. We chose $5 memberships instead of $5M funding rounds." },
              { title: "No Algorithmic Manipulation", detail: "No engagement traps, no dark patterns, no infinite scroll. Your attention is yours." },
              { title: "No Hidden Fees", detail: "Cost+20%. That's it. The 20% split is public: 83.3% creator, 13.3% platform, 3.3% Gleaner's Corner." },
              { title: "No Data Harvesting", detail: "We don't sell your data. We don't profile you for advertisers. We don't track you across the web." },
              { title: "No Enshittification", detail: "The margin is locked in our operating agreement. No board can change it. No outside financier can override it." },
              { title: "No Concentration", detail: "Marks emerge from differential only. The currency itself prevents wealth concentration by design." },
            ].map((item, idx) => (
              <Card key={idx} className="bg-slate-900/60 border-red-900/20">
                <CardContent className="py-4">
                  <h3 className="font-bold text-sm text-red-400 mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-400">{item.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="border-slate-800" />

        {/* What We Build Instead */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            What We Build Instead
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: "Self-Funded Economics", detail: "Sustainable at 1,000 users. No runway burn. No growth-at-all-costs.", icon: Scale },
              { title: "Structural Giving", detail: "15 charitable initiatives funded by commerce, not donations. The giving is the business model.", icon: Shield },
              { title: "Permanent Fairness", detail: "The bylaws lock the margin. The code enforces the split. The mechanism for extraction was removed before launch.", icon: Lock },
            ].map((item, idx) => (
              <Card key={idx} className="bg-slate-900/60 border-blue-900/20">
                <CardContent className="py-5 text-center space-y-3">
                  <item.icon className="w-8 h-8 text-blue-400 mx-auto" />
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="text-sm text-slate-400">{item.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-red-900/20 to-blue-900/20 border-slate-700">
          <CardContent className="py-6 text-center space-y-4">
            <p className="text-2xl font-bold">We chose to be Superman.</p>
            <p className="text-slate-300">$5 membership. 83.3% to creators. No extraction. Forever.</p>
            <div className="flex justify-center gap-3">
              <Link to="/onboarding/trickle">
                <Button className="gap-2">
                  <ArrowRight className="w-4 h-4" /> Join the Cooperative
                </Button>
              </Link>
              <Link to="/designed-to-be-broken">
                <Button variant="outline" className="gap-2">
                  <Zap className="w-4 h-4" /> How Marks Work
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalPageLayout>
  );
}
