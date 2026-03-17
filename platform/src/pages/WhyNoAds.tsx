import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Ban, Users, Heart, MessageSquare,
  Share2, Gift, Sparkles, Check, X,
  Volume2, VolumeX, DollarSign, TrendingUp
} from 'lucide-react';

export default function WhyNoAds() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950/20 to-slate-900">
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 mb-4">
            <VolumeX className="h-10 w-10 text-red-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Why No Outside Advertising?</h1>
          <p className="text-xl text-slate-400">
            We grow through word-of-mouth, not ad spend.
          </p>
        </div>

        <Card className="mb-8 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30">
          <CardContent className="py-6">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              The Ad-Funded Trap
            </h2>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-red-500/10 rounded-lg">
                <X className="h-8 w-8 mx-auto text-red-400 mb-2" />
                <h3 className="font-semibold text-red-300">You Become the Product</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Ad-funded platforms sell YOUR attention to advertisers
                </p>
              </div>
              <div className="p-4 bg-red-500/10 rounded-lg">
                <X className="h-8 w-8 mx-auto text-red-400 mb-2" />
                <h3 className="font-semibold text-red-300">Engagement Manipulation</h3>
                <p className="text-sm text-slate-400 mt-1">
                  They optimize for addictive, not helpful
                </p>
              </div>
              <div className="p-4 bg-red-500/10 rounded-lg">
                <X className="h-8 w-8 mx-auto text-red-400 mb-2" />
                <h3 className="font-semibold text-red-300">Data Harvesting</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Every click tracked, profiled, sold
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-300">
              <Heart className="h-5 w-5" />
              Our Alternative: The Herald System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300">
              Instead of paying Facebook to show you ads, we pay <strong className="text-amber-300">our own members</strong> to
              invite people they actually know and trust.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-500/10 rounded-lg">
                <Share2 className="h-6 w-6 text-green-400 mb-2" />
                <h3 className="font-semibold text-white">Heralds (Johnny Appleseeds)</h3>
                <p className="text-sm text-slate-400">
                  Members who invite others earn <strong>25 MARKS</strong> per successful referral.
                  That money would have gone to Google/Meta — now it goes to you.
                </p>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg">
                <Gift className="h-6 w-6 text-amber-400 mb-2" />
                <h3 className="font-semibold text-white">Quality Over Quantity</h3>
                <p className="text-sm text-slate-400">
                  When you invite someone, you're vouching for them.
                  This creates a community of people who actually want to be here.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-amber-400" />
              The Economics of No-Ad Growth
            </CardTitle>
            <CardDescription>Where the money goes instead</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <h3 className="font-semibold text-red-300 mb-3 flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Traditional Startup ($100K ad budget)
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Facebook/Instagram Ads</span><span className="text-red-400">$40,000</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Google Ads</span><span className="text-red-400">$30,000</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Influencer Marketing</span><span className="text-red-400">$20,000</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Agency Fees</span><span className="text-red-400">$10,000</span></div>
                  <hr className="border-red-500/30" />
                  <div className="flex justify-between font-semibold"><span className="text-slate-300">To Members</span><span className="text-red-400">$0</span></div>
                </div>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <h3 className="font-semibold text-green-300 mb-3 flex items-center gap-2">
                  <VolumeX className="h-5 w-5" />
                  Liana Banyan ($100K growth budget)
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Herald Referral Bonuses</span><span className="text-green-400">$50,000</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">New Member Welcome Credits</span><span className="text-green-400">$20,000</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Gauntlet Challenge Prizes</span><span className="text-green-400">$15,000</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Community Events</span><span className="text-green-400">$15,000</span></div>
                  <hr className="border-green-500/30" />
                  <div className="flex justify-between font-semibold"><span className="text-slate-300">To Members</span><span className="text-green-400">$100,000</span></div>
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-amber-500/10 rounded-lg border border-amber-500/30 text-center">
              <p className="text-amber-300 font-semibold">
                Every dollar that would go to Big Tech goes to our community instead.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              Viral vs. Paid Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <h3 className="font-semibold text-white mb-2">The Numbers</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" />Cost per customer via Facebook ads: <strong>$25-100</strong></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" />Cost per customer via Herald referral: <strong>$25</strong> (and it goes to a member!)</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" />Referral lifetime value: <strong>3-5x higher</strong> than paid acquisition</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" />Referral churn rate: <strong>37% lower</strong> than paid users</li>
                </ul>
              </div>
              <p className="text-center text-sm text-slate-400">
                Word-of-mouth isn't just cheaper — it's <strong className="text-white">better</strong>.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-300">
              <Users className="h-5 w-5" />
              What This Means For YOU
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-purple-500/10 rounded-lg">
                <Check className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">No Creepy Targeting</p>
                  <p className="text-sm text-slate-400">We're not tracking your every move to show you "personalized" ads. Your behavior is yours.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-purple-500/10 rounded-lg">
                <Check className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">You Can Earn by Sharing</p>
                  <p className="text-sm text-slate-400">Become a Herald and earn 25 MARKS every time someone you invite joins. That's our advertising budget going to you.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-purple-500/10 rounded-lg">
                <Check className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Better Community</p>
                  <p className="text-sm text-slate-400">People who join through friends are better members than people who clicked an ad. Higher trust, better interactions.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
                <Sparkles className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-300">The Vanguard Effect</p>
                  <p className="text-sm text-slate-400">Our first members (The 300) are our marketing team. If we do right by them, they'll tell others. That's the whole strategy.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-slate-800/30 border-slate-700">
          <CardContent className="py-6 text-center">
            <p className="text-amber-300 italic text-lg mb-2">"The best advertising is a satisfied customer."</p>
            <p className="text-slate-400 text-sm">— Philip Kotler</p>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <p className="text-slate-400">Join a platform that treats you as a member, not a product.</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/herald')} className="bg-amber-500 hover:bg-amber-600">Become a Herald</Button>
            <Button variant="outline" onClick={() => navigate('/why-no-vc')}>Why No V.C.?</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
