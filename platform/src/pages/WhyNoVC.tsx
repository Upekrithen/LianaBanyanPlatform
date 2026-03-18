import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Ban, TrendingUp, Shield, Users,
  Crown, Lightbulb, DollarSign, Check, X,
  Sprout, TreePine, Mountain
} from 'lucide-react';

export default function WhyNoVC() {
  const navigate = useNavigate();

  const projections = [
    { year: 'Year 1', members: '300', revenue: '$45K', ownership: '100%', vcOwnership: '60%' },
    { year: 'Year 2', members: '3,000', revenue: '$450K', ownership: '100%', vcOwnership: '45%' },
    { year: 'Year 3', members: '30,000', revenue: '$4.5M', ownership: '100%', vcOwnership: '30%' },
    { year: 'Year 5', members: '300,000', revenue: '$45M', ownership: '100%', vcOwnership: '15%' },
    { year: 'Year 10', members: '3,000,000', revenue: '$450M', ownership: '100%', vcOwnership: '5%' },
  ];

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
            <Ban className="h-10 w-10 text-red-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Why No V.C.?</h1>
          <p className="text-xl text-slate-400">
            We're funded by patents and grit, not promises to investors.
          </p>
        </div>

        <Card className="mb-8 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30">
          <CardContent className="py-6">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              V.C. Money Comes With Strings
            </h2>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-red-500/10 rounded-lg">
                <X className="h-8 w-8 mx-auto text-red-400 mb-2" />
                <h3 className="font-semibold text-red-300">Growth at All Costs</h3>
                <p className="text-sm text-slate-400 mt-1">VCs demand 10x returns, forcing unsustainable growth</p>
              </div>
              <div className="p-4 bg-red-500/10 rounded-lg">
                <X className="h-8 w-8 mx-auto text-red-400 mb-2" />
                <h3 className="font-semibold text-red-300">Exit Pressure</h3>
                <p className="text-sm text-slate-400 mt-1">They need to sell you to the highest bidder in 5-7 years</p>
              </div>
              <div className="p-4 bg-red-500/10 rounded-lg">
                <X className="h-8 w-8 mx-auto text-red-400 mb-2" />
                <h3 className="font-semibold text-red-300">Dilution</h3>
                <p className="text-sm text-slate-400 mt-1">Each round takes more ownership from founders and members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-300">
              <Shield className="h-5 w-5" />
              Our Alternative: Patent-Backed Bootstrap
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-500/10 rounded-lg">
                <Crown className="h-6 w-6 text-amber-400 mb-2" />
                <h3 className="font-semibold text-white">Patent Portfolio</h3>
                <p className="text-sm text-slate-400">
                  <strong className="text-amber-300">7 provisional applications</strong> with 1,748 documented innovations.
                  This is our "runway."
                </p>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-400 mb-2" />
                <h3 className="font-semibold text-white">$1K to Start</h3>
                <p className="text-sm text-slate-400">
                  We literally started with $1,000. No massive burn rate.
                  No pressure to "grow or die."
                </p>
              </div>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg text-center">
              <p className="text-amber-300 font-semibold text-lg">
                "We'd rather grow slowly and own 100% than grow fast and own nothing."
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              Organic Growth Projections
            </CardTitle>
            <CardDescription>Our path vs. the VC treadmill</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-2 text-slate-400">Timeline</th>
                    <th className="text-right py-3 px-2 text-slate-400">Members</th>
                    <th className="text-right py-3 px-2 text-slate-400">Revenue</th>
                    <th className="text-right py-3 px-2 text-green-400">Our Ownership</th>
                    <th className="text-right py-3 px-2 text-red-400">If We'd Taken VC</th>
                  </tr>
                </thead>
                <tbody>
                  {projections.map((row) => (
                    <tr key={row.year} className="border-b border-slate-800">
                      <td className="py-3 px-2 text-white font-medium">{row.year}</td>
                      <td className="py-3 px-2 text-right text-slate-300">{row.members}</td>
                      <td className="py-3 px-2 text-right text-slate-300">{row.revenue}</td>
                      <td className="py-3 px-2 text-right text-green-400 font-bold">{row.ownership}</td>
                      <td className="py-3 px-2 text-right text-red-400">{row.vcOwnership}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
              <p className="text-sm text-amber-200">
                <strong>The Math:</strong> At Year 10, if we're worth $500M with VC money, we'd own ~$25M.
                Growing organically, even at half that valuation ($250M), we own <strong>all of it</strong>.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-gradient-to-r from-amber-500/10 to-green-500/10 border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-amber-300">The Organic Growth Path</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4 overflow-x-auto py-4">
              <div className="text-center min-w-[100px]">
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center mb-2">
                  <Sprout className="h-6 w-6 text-amber-400" />
                </div>
                <p className="text-sm font-semibold text-white">Seed</p>
                <p className="text-xs text-slate-400">First 10</p>
              </div>
              <div className="flex-1 h-1 bg-gradient-to-r from-amber-500/50 to-green-500/50 rounded" />
              <div className="text-center min-w-[100px]">
                <div className="w-12 h-12 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                  <TreePine className="h-6 w-6 text-green-400" />
                </div>
                <p className="text-sm font-semibold text-white">Sapling</p>
                <p className="text-xs text-slate-400">The 300</p>
              </div>
              <div className="flex-1 h-1 bg-gradient-to-r from-green-500/50 to-emerald-500/50 rounded" />
              <div className="text-center min-w-[100px]">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
                  <TreePine className="h-6 w-6 text-emerald-400" />
                </div>
                <p className="text-sm font-semibold text-white">Tree</p>
                <p className="text-xs text-slate-400">3,000</p>
              </div>
              <div className="flex-1 h-1 bg-gradient-to-r from-emerald-500/50 to-blue-500/50 rounded" />
              <div className="text-center min-w-[100px]">
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                  <Mountain className="h-6 w-6 text-blue-400" />
                </div>
                <p className="text-sm font-semibold text-white">Forest</p>
                <p className="text-xs text-slate-400">30,000+</p>
              </div>
            </div>
            <p className="text-center text-sm text-slate-400 mt-4">
              Each stage funds the next. No outside money needed.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-300">
              <Users className="h-5 w-5" />
              What This Means For YOU
            </CardTitle>
            <CardDescription>Why being an early adopter matters more without VC</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-purple-500/10 rounded-lg">
                <Check className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">No Pivot Whiplash</p>
                  <p className="text-sm text-slate-400">VC-backed startups constantly pivot to chase metrics. We're building for the long haul.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-purple-500/10 rounded-lg">
                <Check className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">You're the Asset, Not the Product</p>
                  <p className="text-sm text-slate-400">VC-backed companies sell your data. We don't need to — we're not trying to hit arbitrary growth targets.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-purple-500/10 rounded-lg">
                <Check className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Your Early Contribution Matters Forever</p>
                  <p className="text-sm text-slate-400">Ghost Attribution (#1126) means your contributions are remembered even if you leave. Your early support = permanent credit.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
                <Lightbulb className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-300">The 300 Are Getting Joules</p>
                  <p className="text-sm text-slate-400">Our first 300 members get equity-like Joules — shares in our patent portfolio. No VC means no dilution of YOUR stake.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <p className="text-slate-400">We're betting on ourselves. And we're betting on you.</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/the-300')} className="bg-amber-500 hover:bg-amber-600">Join The 300</Button>
            <Button variant="outline" onClick={() => navigate('/fly-on-the-wall')}>Watch Us Build</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
