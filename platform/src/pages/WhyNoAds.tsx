import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, Users, Heart, MessageSquare,
  Share2, Gift, Sparkles, Check, X,
  Volume2, VolumeX, DollarSign, TrendingUp,
  Flame, CreditCard, MapPin, Link2, Zap
} from 'lucide-react';

export default function WhyNoAds() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: '#0a1628' }}>
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          className="mb-6 text-slate-400 hover:text-white"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
            style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <VolumeX className="h-10 w-10 text-red-400" />
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#faf5eb' }}>Why No Outside Advertising?</h1>
          <p className="text-xl" style={{ color: 'rgba(250, 245, 235, 0.5)' }}>
            We grow through word-of-mouth, not ad spend.
          </p>
        </div>

        {/* The Ad-Funded Trap — red accent (10% color pop) */}
        <Card className="mb-8" style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <CardContent className="py-6">
            <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: '#faf5eb' }}>
              The Ad-Funded Trap
            </h2>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              {[
                { icon: X, title: 'You Become the Product', desc: 'Ad-funded platforms sell YOUR attention to advertisers' },
                { icon: X, title: 'Engagement Manipulation', desc: 'They optimize for addictive, not helpful' },
                { icon: X, title: 'Data Harvesting', desc: 'Every click tracked, profiled, sold' },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                  <item.icon className="h-8 w-8 mx-auto text-red-400 mb-2" />
                  <h3 className="font-semibold text-red-400">{item.title}</h3>
                  <p className="text-sm mt-1" style={{ color: 'rgba(250, 245, 235, 0.6)' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Our Alternative — green accent */}
        <Card className="mb-8" style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <Heart className="h-5 w-5" />
              Our Alternative: The Herald System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p style={{ color: 'rgba(250, 245, 235, 0.7)' }}>
              Instead of paying Facebook to show you ads, we pay <strong className="text-amber-400">our own members</strong> to
              invite people they actually know and trust.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg" style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.15)' }}>
                <Share2 className="h-6 w-6 text-green-400 mb-2" />
                <h3 className="font-semibold" style={{ color: '#faf5eb' }}>Heralds (Johnny Appleseeds)</h3>
                <p className="text-sm" style={{ color: 'rgba(250, 245, 235, 0.6)' }}>
                  Members who invite others earn <strong className="text-green-400">25 MARKS</strong> per successful referral.
                  That money would have gone to Google/Meta — now it goes to you.
                </p>
              </div>
              <div className="p-4 rounded-lg" style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.15)' }}>
                <Gift className="h-6 w-6 text-amber-400 mb-2" />
                <h3 className="font-semibold" style={{ color: '#faf5eb' }}>Quality Over Quantity</h3>
                <p className="text-sm" style={{ color: 'rgba(250, 245, 235, 0.6)' }}>
                  When you invite someone, you're vouching for them.
                  This creates a community of people who actually want to be here.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* The Engine — amber accent */}
        <Card className="mb-8" style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-400">
              <Flame className="h-5 w-5" />
              The Engine: How It Actually Works
            </CardTitle>
            <CardDescription style={{ color: 'rgba(250, 245, 235, 0.45)' }}>Three systems replace the entire ad industry</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg" style={{ background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="h-5 w-5 text-orange-400" />
                  <h3 className="font-semibold" style={{ color: '#faf5eb' }}>The Furnace</h3>
                </div>
                <p className="text-sm" style={{ color: 'rgba(250, 245, 235, 0.6)' }}>
                  Every Cue Card has a <strong className="text-orange-400">QR code linked to an immutable verification registry</strong>.
                  Scan it to verify authenticity, see the business's trust score, and confirm their charitable tier.
                </p>
                <button onClick={() => navigate('/the-furnace')} className="mt-2 text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1">
                  <Link2 className="h-3 w-3" /> Visit The Furnace →
                </button>
              </div>
              <div className="p-4 rounded-lg" style={{ background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-5 w-5 text-amber-400" />
                  <h3 className="font-semibold" style={{ color: '#faf5eb' }}>Viral Cue Card Deck</h3>
                </div>
                <p className="text-sm" style={{ color: 'rgba(250, 245, 235, 0.6)' }}>
                  <strong className="text-amber-400">$5/year</strong> gives you a complete deck of shareable cards — digital and printable.
                  Each card carries your unique referral code. Every card is both a benefit explainer AND a recruitment tool.
                </p>
              </div>
              <div className="p-4 rounded-lg" style={{ background: 'rgba(34, 197, 94, 0.06)', border: '1px solid rgba(34, 197, 94, 0.15)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-5 w-5 text-green-400" />
                  <h3 className="font-semibold" style={{ color: '#faf5eb' }}>The Cue Card Drop</h3>
                </div>
                <p className="text-sm" style={{ color: 'rgba(250, 245, 235, 0.6)' }}>
                  Our cold start viral loop. <strong className="text-green-400">6 steps</strong>: Get your deck → drop a card at a coffee shop, laundromat,
                  library, church → track your referral scans → seed 10 locations → earn Pioneer-tier Marks.
                </p>
              </div>
            </div>
            <div className="p-4 rounded-lg" style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(100, 116, 139, 0.2)' }}>
              <p className="text-center text-sm" style={{ color: 'rgba(250, 245, 235, 0.7)' }}>
                <Zap className="h-4 w-4 inline text-amber-400 mr-1" />
                This is the orbit: <strong style={{ color: '#faf5eb' }}>The Furnace</strong> verifies authenticity →
                <strong style={{ color: '#faf5eb' }}> Cue Card Deck</strong> arms every member with marketing materials →
                <strong style={{ color: '#faf5eb' }}> The Cue Card Drop</strong> tells them exactly where to put them.
                No ad agency. No algorithm. Just people who believe in what we're building.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Economics — side by side comparison */}
        <Card className="mb-8" style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(100, 116, 139, 0.3)' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#faf5eb' }}>
              <DollarSign className="h-5 w-5 text-amber-400" />
              The Economics of No-Ad Growth
            </CardTitle>
            <CardDescription style={{ color: 'rgba(250, 245, 235, 0.45)' }}>Where the money goes instead</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <h3 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Traditional Startup ($100K ad budget)
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span style={{ color: 'rgba(250, 245, 235, 0.5)' }}>Facebook/Instagram Ads</span><span className="text-red-400">$40,000</span></div>
                  <div className="flex justify-between"><span style={{ color: 'rgba(250, 245, 235, 0.5)' }}>Google Ads</span><span className="text-red-400">$30,000</span></div>
                  <div className="flex justify-between"><span style={{ color: 'rgba(250, 245, 235, 0.5)' }}>Influencer Marketing</span><span className="text-red-400">$20,000</span></div>
                  <div className="flex justify-between"><span style={{ color: 'rgba(250, 245, 235, 0.5)' }}>Agency Fees</span><span className="text-red-400">$10,000</span></div>
                  <hr style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }} />
                  <div className="flex justify-between font-semibold"><span style={{ color: 'rgba(250, 245, 235, 0.7)' }}>To Members</span><span className="text-red-400">$0</span></div>
                </div>
              </div>
              <div className="p-4 rounded-lg" style={{ background: 'rgba(34, 197, 94, 0.06)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                <h3 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                  <VolumeX className="h-5 w-5" />
                  Liana Banyan ($100K growth budget)
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span style={{ color: 'rgba(250, 245, 235, 0.5)' }}>Herald Referral Bonuses</span><span className="text-green-400">$50,000</span></div>
                  <div className="flex justify-between"><span style={{ color: 'rgba(250, 245, 235, 0.5)' }}>New Member Welcome Credits</span><span className="text-green-400">$20,000</span></div>
                  <div className="flex justify-between"><span style={{ color: 'rgba(250, 245, 235, 0.5)' }}>Gauntlet Challenge Prizes</span><span className="text-green-400">$15,000</span></div>
                  <div className="flex justify-between"><span style={{ color: 'rgba(250, 245, 235, 0.5)' }}>Community Events</span><span className="text-green-400">$15,000</span></div>
                  <hr style={{ borderColor: 'rgba(34, 197, 94, 0.2)' }} />
                  <div className="flex justify-between font-semibold"><span style={{ color: 'rgba(250, 245, 235, 0.7)' }}>To Members</span><span className="text-green-400">$100,000</span></div>
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 rounded-lg text-center" style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
              <p className="text-amber-400 font-semibold">
                Every dollar that would go to Big Tech goes to our community instead.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Viral vs Paid — stats */}
        <Card className="mb-8" style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(100, 116, 139, 0.3)' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#faf5eb' }}>
              <TrendingUp className="h-5 w-5 text-blue-400" />
              Viral vs. Paid Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg" style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(100, 116, 139, 0.2)' }}>
                <h3 className="font-semibold mb-2" style={{ color: '#faf5eb' }}>The Numbers</h3>
                <ul className="space-y-2 text-sm" style={{ color: 'rgba(250, 245, 235, 0.7)' }}>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400 flex-shrink-0" />Cost per customer via Facebook ads: <strong className="text-red-400">$25-100</strong></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400 flex-shrink-0" />Cost per customer via Herald referral: <strong className="text-green-400">$25</strong> (and it goes to a member!)</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400 flex-shrink-0" />Referral lifetime value: <strong className="text-green-400">3-5x higher</strong> than paid acquisition</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400 flex-shrink-0" />Referral churn rate: <strong className="text-green-400">37% lower</strong> than paid users</li>
                </ul>
              </div>
              <p className="text-center text-sm" style={{ color: 'rgba(250, 245, 235, 0.5)' }}>
                Word-of-mouth isn't just cheaper — it's <strong style={{ color: '#faf5eb' }}>better</strong>.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* What This Means For YOU */}
        <Card className="mb-8" style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(100, 116, 139, 0.3)' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#faf5eb' }}>
              <Users className="h-5 w-5 text-cyan-400" />
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
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(100, 116, 139, 0.15)' }}>
                  <Check className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold" style={{ color: '#faf5eb' }}>{item.title}</p>
                    <p className="text-sm" style={{ color: 'rgba(250, 245, 235, 0.6)' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                <Sparkles className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-400">The Vanguard Effect</p>
                  <p className="text-sm" style={{ color: 'rgba(250, 245, 235, 0.6)' }}>Our first members (The 300) are our marketing team. If we do right by them, they'll tell others. That's the whole strategy.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quote */}
        <Card className="mb-8" style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(100, 116, 139, 0.2)' }}>
          <CardContent className="py-6 text-center">
            <p className="text-amber-400 italic text-lg mb-2">"The best advertising is a satisfied customer."</p>
            <p className="text-sm" style={{ color: 'rgba(250, 245, 235, 0.4)' }}>— Philip Kotler</p>
          </CardContent>
        </Card>

        {/* CTAs */}
        <div className="text-center space-y-4 pb-8">
          <p style={{ color: 'rgba(250, 245, 235, 0.5)' }}>Join a platform that treats you as a member, not a product.</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/herald')} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold">Become a Herald</Button>
            <Button variant="outline" onClick={() => navigate('/why-no-vc')} style={{ borderColor: 'rgba(250, 245, 235, 0.2)', color: 'rgba(250, 245, 235, 0.7)' }}>Why No V.C.?</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
