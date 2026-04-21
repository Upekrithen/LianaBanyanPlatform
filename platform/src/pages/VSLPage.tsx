import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, HandHeart, Users, ShieldCheck, ArrowRight, Star, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LaunchConditionOverlay from '@/components/LaunchConditionOverlay';
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function VSLPage() {
  const navigate = useNavigate();

  return (
    <LaunchConditionOverlay initiativeSlug="vsl" initiativeName="VSL (Voucher Short Loans)">
    <PortalPageLayout maxWidth="xl" xrayId="vsl-page">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-emerald-600 border-emerald-600">Initiative #10</Badge>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight sm:text-5xl flex items-center justify-center gap-3">
            <Building2 className="h-10 w-10 text-emerald-600" />
            VSL (Vouched Short Loans)
          </h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
            Social trust replaces credit scores. Small loans starting at $50 backed by the people who know you, not by collateral you don't have.
          </p>
        </div>

        {/* The USAA Principle */}
        <Card className="mb-12 border-l-4 border-l-emerald-500 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <HandHeart className="h-6 w-6 text-emerald-500" />
              The USAA Principle
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg text-foreground space-y-4">
            <p className="italic text-muted-foreground border-l-2 border-border pl-4 py-2">
              "I thank God, truthfully and with respect, for USAA, because when I had at least one dollar in my checking account, I could go to the gas pump and fill up in order to drive and pick up the kids from school, and USAA would pay it, and charge my account no fee if I paid it back within a day... A little generosity, just a tiny little bit, made ALL the difference in my life, and my wife and children's lives."
            </p>
            <p>
              That is the core of VSL. The difference between "structurally undercapitalized" and "thriving" is often absurdly small—if someone would just trust you with it.
            </p>
            <p>
              VSL scales the <strong>USAA Principle</strong> through community accountability instead of institutional generosity. It is not a bank. It is not "village savings." It is <em>Vouched</em>.
            </p>
          </CardContent>
        </Card>

        {/* How It Works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-emerald-50 border-none">
            <CardHeader>
              <Users className="h-8 w-8 text-emerald-600 mb-2" />
              <CardTitle>1. Your Circle Vouches</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-emerald-900">
              No credit checks. No collateral requirements. Your loan is backed by the social trust of the people in your network who vouch for you.
            </CardContent>
          </Card>

          <Card className="bg-emerald-50 border-none">
            <CardHeader>
              <ShieldCheck className="h-8 w-8 text-emerald-600 mb-2" />
              <CardTitle>2. Micro-Capital</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-emerald-900">
              Loans start as small as $50. Just enough to buy ingredients for Let's Make Dinner, or materials for Let's Make Bread.
            </CardContent>
          </Card>

          <Card className="bg-emerald-50 border-none">
            <CardHeader>
              <Building2 className="h-8 w-8 text-emerald-600 mb-2" />
              <CardTitle>3. Systemic Support</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-emerald-900">
              The loan helps you start, but the platform infrastructure (Cost + 20%) ensures you keep 83.3% of what you earn so you can easily pay it back and thrive.
            </CardContent>
          </Card>
        </div>

        {/* The Crown Section */}
        <div className="bg-slate-900 rounded-2xl p-8 mb-16 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Star className="h-48 w-48" />
          </div>
          <div className="relative z-10">
            <Badge className="bg-emerald-500 text-white mb-4">The Crown: Lender Mentor</Badge>
            <h2 className="text-3xl font-bold mb-4">Why We Wrote to Jessica Jackley</h2>
            <p className="text-muted-foreground text-lg mb-6 max-w-3xl">
              As the co-founder of Kiva, she proved that person-to-person micro-lending could scale globally. She saw in East Africa what the Founder saw in the States: the hardest-working people are often the most structurally undercapitalized.
            </p>
            <p className="text-muted-foreground text-lg mb-6 max-w-3xl">
              Where Kiva helped route capital to specific entrepreneurs, Liana Banyan re-wires the market those entrepreneurs operate in. We asked her to lead VSL because she understands that microfinance isn't about money—it's about dignity, trust, and connection.
            </p>
          </div>
        </div>

        {/* College of Hard Knocks / Anecdotes */}
        <div className="text-center bg-muted p-8 rounded-2xl border border-border">
          <Heart className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">Born from the College of Hard Knocks</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Every humanitarian feature in this platform exists because the Founder or someone he knew needed it and it didn't exist—or because someone like USAA showed what it looked like when it did. VSL is built from the lived reality of needing $50 just to get to work.
          </p>
          <Button variant="outline" onClick={() => navigate('/cephas/founder-proof')}>
            Read the Founder's Anecdotes
          </Button>
        </div>

    </PortalPageLayout>
    </LaunchConditionOverlay>
  );
}
