import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight, Coins, ShieldCheck, Handshake, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { PortalPageLayout } from "@/components/PortalPageLayout";

export default function AsYouWishCard() {
  return (
    <PortalPageLayout variant="stage" maxWidth="xl" xrayId="as-you-wish-card">
      <div className="space-y-8">
        {/* Hero */}
        <header className="text-center space-y-4 py-8">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500/30 to-rose-600/30 flex items-center justify-center">
              <Heart className="w-10 h-10 text-pink-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black">
            As You <span className="text-pink-400">Wish</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            The universal phrase that confirms every transaction on Liana Banyan.
            Not "submit." Not "confirm." Not "pay."
          </p>
          <p className="text-lg text-pink-400 italic">As You Wish.</p>
        </header>

        {/* What It Means */}
        <Card className="bg-gradient-to-r from-pink-900/30 via-slate-900/60 to-pink-900/30 border-pink-700/40">
          <CardContent className="py-8 space-y-6">
            <h2 className="text-2xl font-bold text-center">Every Transaction Is an Act of Trust</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <Coins className="w-10 h-10 text-amber-400 mx-auto" />
                <h3 className="font-bold">You Set the Price</h3>
                <p className="text-sm text-slate-400">
                  Sellers choose their prices. The platform adds Cost+20% for transparent economics.
                  No hidden fees. No algorithmic manipulation.
                </p>
              </div>
              <div className="text-center space-y-3">
                <ShieldCheck className="w-10 h-10 text-green-400 mx-auto" />
                <h3 className="font-bold">You Know the Split</h3>
                <p className="text-sm text-slate-400">
                  83.3% to the creator. 13.3% to the platform. 3.3% to the Gleaner's Corner.
                  Every penny accounted for, every time.
                </p>
              </div>
              <div className="text-center space-y-3">
                <Handshake className="w-10 h-10 text-blue-400 mx-auto" />
                <h3 className="font-bold">You Confirm with Respect</h3>
                <p className="text-sm text-slate-400">
                  "As You Wish" means: I understand this transaction. I trust this person.
                  I'm choosing to participate in this economy.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* The Reference */}
        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader>
            <CardTitle>Why "As You Wish"?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300">
              In <em>The Princess Bride</em>, Westley says "As you wish" to Buttercup — and what he means is
              "I love you." Every time he says it, he's putting her needs before his own.
            </p>
            <p className="text-slate-400">
              On Liana Banyan, when you click "As You Wish" to confirm a transaction, you're saying:
              I trust this creator. I value their work. I choose to participate in an economy where
              83.3% goes to the person who made the thing.
            </p>
            <p className="text-slate-400">
              It's not a button. It's a declaration.
            </p>
          </CardContent>
        </Card>

        <Separator className="border-slate-800" />

        {/* Where You'll See It */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Where You'll See It</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { context: "Purchasing a product", detail: "Confirm your Cost+20% transparent purchase" },
              { context: "Backing a BandWagon project", detail: "Pledge your Backed Marks to a project you believe in" },
              { context: "Accepting a bounty", detail: "Commit to delivering work for the cooperative" },
              { context: "Sending a gift (Santa Ever After)", detail: "Confirm your gift delivery assignment" },
              { context: "Casting a Chain Vote", detail: "Lock in your governance decision with Pledged Marks" },
              { context: "Joining a Crew Call", detail: "Sign up for a manufacturing production role" },
            ].map((item, idx) => (
              <Card key={idx} className="bg-slate-900/60 border-slate-800">
                <CardContent className="py-3 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-pink-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{item.context}</p>
                    <p className="text-xs text-slate-400">{item.detail}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-pink-900/30 to-rose-900/30 border-pink-700/40">
          <CardContent className="py-6 text-center space-y-4">
            <h2 className="text-2xl font-bold">Ready?</h2>
            <p className="text-slate-300 text-lg italic">As You Wish.</p>
            <div className="flex justify-center gap-3">
              <Link to="/onboarding/trickle">
                <Button className="gap-2">
                  <ArrowRight className="w-4 h-4" /> Join the Cooperative
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button variant="outline" className="gap-2">
                  <Coins className="w-4 h-4" /> Browse Marketplace
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalPageLayout>
  );
}
