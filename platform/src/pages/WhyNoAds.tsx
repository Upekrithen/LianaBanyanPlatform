import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import {
  Users, Heart, Share2, Gift, Sparkles, Check, X,
  Volume2, VolumeX, DollarSign, TrendingUp,
  Flame, CreditCard, MapPin, Link2, Zap
} from 'lucide-react';

export default function WhyNoAds() {
  const navigate = useNavigate();

  return (
    <PortalPageLayout backButton xrayId="why-no-ads-page">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 bg-destructive/10 border border-destructive/30">
          <VolumeX className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-4xl font-bold mb-2 text-foreground">Why No Outside Advertising?</h1>
        <p className="text-xl text-muted-foreground">
          We grow through word-of-mouth, not ad spend.
        </p>
      </div>

      {/* The Ad-Funded Trap */}
      <Card className="mb-8 border-destructive/30">
        <CardContent className="py-6">
          <h2 className="text-2xl font-bold mb-4 text-center text-foreground">
            The Ad-Funded Trap
          </h2>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            {[
              { icon: X, title: 'You Become the Product', desc: 'Ad-funded platforms sell YOUR attention to advertisers' },
              { icon: X, title: 'Engagement Manipulation', desc: 'They optimize for addictive, not helpful' },
              { icon: X, title: 'Data Harvesting', desc: 'Every click tracked, profiled, sold' },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-lg bg-destructive/5 border border-destructive/15">
                <item.icon className="h-8 w-8 mx-auto text-destructive mb-2" />
                <h3 className="font-semibold text-destructive">{item.title}</h3>
                <p className="text-sm mt-1 text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Our Alternative — The Herald System */}
      <Card className="mb-8 border-green-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <Heart className="h-5 w-5" />
            Our Alternative: The Herald System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Instead of paying Facebook to show you ads, we pay <strong className="text-primary font-semibold">our own members</strong> to
            invite people they actually know and trust.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/15">
              <Share2 className="h-6 w-6 text-green-600 dark:text-green-400 mb-2" />
              <h3 className="font-semibold text-foreground">Heralds (Johnny Appleseeds)</h3>
              <p className="text-sm text-muted-foreground">
                Members who invite others earn <strong className="text-green-600 dark:text-green-400">25 MARKS</strong> per successful referral.
                That money would have gone to Google/Meta — now it goes to you.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/15">
              <Gift className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-semibold text-foreground">Quality Over Quantity</h3>
              <p className="text-sm text-muted-foreground">
                When you invite someone, you're vouching for them.
                This creates a community of people who actually want to be here.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* The Engine — How It Works */}
      <Card className="mb-8 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Flame className="h-5 w-5" />
            The Engine: How It Actually Works
          </CardTitle>
          <CardDescription>Three systems replace the entire ad industry</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/15">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">The Furnace</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Every Cue Card has a <strong className="text-primary">QR code linked to an immutable verification registry</strong>.
                Scan it to verify authenticity, see the business's trust score, and confirm their charitable tier.
              </p>
              <button onClick={() => navigate('/the-furnace')} className="mt-2 text-xs text-primary hover:text-primary/80 flex items-center gap-1 bg-transparent border-none cursor-pointer p-0">
                <Link2 className="h-3 w-3" /> Visit The Furnace →
              </button>
            </div>
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/15">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Viral Cue Card Deck</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong className="text-primary">$5/year</strong> gives you a complete deck of shareable cards — digital and printable.
                Each card carries your unique referral code. Every card is both a benefit explainer AND a recruitment tool.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/15">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h3 className="font-semibold text-foreground">The Cue Card Drop</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Our cold start viral loop. <strong className="text-green-600 dark:text-green-400">6 steps</strong>: Get your deck → drop a card at a coffee shop, laundromat,
                library, church → track your referral scans → seed 10 locations → earn Pioneer-tier Marks.
              </p>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-muted border border-border text-center">
            <p className="text-sm text-muted-foreground">
              <Zap className="h-4 w-4 inline text-primary mr-1" />
              This is the orbit: <strong className="text-foreground">The Furnace</strong> verifies authenticity →
              <strong className="text-foreground"> Cue Card Deck</strong> arms every member with marketing materials →
              <strong className="text-foreground"> The Cue Card Drop</strong> tells them exactly where to put them.
              No ad agency. No algorithm. Just people who believe in what we're building.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Economics — side by side comparison */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <DollarSign className="h-5 w-5 text-primary" />
            The Economics of No-Ad Growth
          </CardTitle>
          <CardDescription>Where the money goes instead</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
              <h3 className="font-semibold text-destructive mb-3 flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Traditional Startup ($100K ad budget)
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Facebook/Instagram Ads</span><span className="text-destructive">$40,000</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Google Ads</span><span className="text-destructive">$30,000</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Influencer Marketing</span><span className="text-destructive">$20,000</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Agency Fees</span><span className="text-destructive">$10,000</span></div>
                <hr className="border-destructive/20" />
                <div className="flex justify-between font-semibold"><span className="text-foreground/70">To Members</span><span className="text-destructive">$0</span></div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
              <h3 className="font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                <VolumeX className="h-5 w-5" />
                Liana Banyan ($100K growth budget)
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Herald Referral Bonuses</span><span className="text-green-600 dark:text-green-400">$50,000</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">New Member Welcome Credits</span><span className="text-green-600 dark:text-green-400">$20,000</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Gauntlet Challenge Prizes</span><span className="text-green-600 dark:text-green-400">$15,000</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Community Events</span><span className="text-green-600 dark:text-green-400">$15,000</span></div>
                <hr className="border-green-500/20" />
                <div className="flex justify-between font-semibold"><span className="text-foreground/70">To Members</span><span className="text-green-600 dark:text-green-400">$100,000</span></div>
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 rounded-lg text-center bg-primary/8 border border-primary/25">
            <p className="text-primary font-semibold">
              Every dollar that would go to Big Tech goes to our community instead.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Viral vs Paid Growth */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Viral vs. Paid Growth
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted border border-border">
              <h3 className="font-semibold mb-2 text-foreground">The Numbers</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" />Cost per customer via Facebook ads: <strong className="text-destructive">$25-100</strong></li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" />Cost per customer via Herald referral: <strong className="text-green-600 dark:text-green-400">$25</strong> (and it goes to a member!)</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" />Referral lifetime value: <strong className="text-green-600 dark:text-green-400">3-5x higher</strong> than paid acquisition</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" />Referral churn rate: <strong className="text-green-600 dark:text-green-400">37% lower</strong> than paid users</li>
              </ul>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Word-of-mouth isn't just cheaper — it's <strong className="text-foreground">better</strong>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* What This Means For YOU */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Users className="h-5 w-5 text-blue-500" />
            What This Means For YOU
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { title: 'No Creepy Targeting', desc: "We're not tracking your every move to show you \"personalized\" ads. Your behavior is yours." },
              { title: 'You Can Earn by Sharing', desc: 'Become a Herald and earn 25 MARKS every time someone you invite joins. That\'s our advertising budget going to you.' },
              { title: 'Better Community', desc: 'People who join through friends are better members than people who clicked an ad. Higher trust, better interactions.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/25">
              <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-primary">The Vanguard Effect</p>
                <p className="text-sm text-muted-foreground">Our first members (The 300) are our marketing team. If we do right by them, they'll tell others. That's the whole strategy.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quote */}
      <Card className="mb-8 bg-muted/50">
        <CardContent className="py-6 text-center">
          <p className="text-primary italic text-lg mb-2">"The best advertising is a satisfied customer."</p>
          <p className="text-sm text-muted-foreground/60">— Philip Kotler</p>
        </CardContent>
      </Card>

      {/* CTAs */}
      <div className="text-center space-y-4 pb-8">
        <p className="text-muted-foreground">Join a platform that treats you as a member, not a product.</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate('/herald')}>Become a Herald</Button>
          <Button variant="outline" onClick={() => navigate('/why-no-vc')}>Why No V.C.?</Button>
        </div>
      </div>
    </PortalPageLayout>
  );
}
