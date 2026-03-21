import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import {
  Ban, TrendingUp, Shield, Users,
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
    <PortalPageLayout backButton xrayId="why-no-vc-page">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/20 mb-4">
          <Ban className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Why No V.C.?</h1>
        <p className="text-xl text-muted-foreground">
          We're funded by patents and grit, not promises to investors.
        </p>
      </div>

      <Card className="mb-8 bg-destructive/5 border-destructive/30">
        <CardContent className="py-6">
          <h2 className="text-2xl font-bold text-foreground mb-4 text-center">
            V.C. Money Comes With Strings
          </h2>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-destructive/10 rounded-lg">
              <X className="h-8 w-8 mx-auto text-destructive mb-2" />
              <h3 className="font-semibold text-destructive">Growth at All Costs</h3>
              <p className="text-sm text-muted-foreground mt-1">VCs demand 10x returns, forcing unsustainable growth</p>
            </div>
            <div className="p-4 bg-destructive/10 rounded-lg">
              <X className="h-8 w-8 mx-auto text-destructive mb-2" />
              <h3 className="font-semibold text-destructive">Exit Pressure</h3>
              <p className="text-sm text-muted-foreground mt-1">They need to sell you to the highest bidder in 5-7 years</p>
            </div>
            <div className="p-4 bg-destructive/10 rounded-lg">
              <X className="h-8 w-8 mx-auto text-destructive mb-2" />
              <h3 className="font-semibold text-destructive">Dilution</h3>
              <p className="text-sm text-muted-foreground mt-1">Each round takes more ownership from founders and members</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8 bg-green-500/5 border-green-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <Shield className="h-5 w-5" />
            Our Alternative: Patent-Backed Bootstrap
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-500/10 rounded-lg">
              <Crown className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-semibold text-foreground">Patent Portfolio</h3>
              <p className="text-sm text-muted-foreground">
                <strong className="text-primary">8 provisional applications</strong> with 1,754 documented innovations.
                This is our "runway."
              </p>
            </div>
            <div className="p-4 bg-green-500/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400 mb-2" />
              <h3 className="font-semibold text-foreground">$1K to Start</h3>
              <p className="text-sm text-muted-foreground">
                We literally started with $1,000. No massive burn rate.
                No pressure to "grow or die."
              </p>
            </div>
          </div>
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-primary font-semibold text-lg">
              "We'd rather grow slowly and own 100% than grow fast and own nothing."
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Organic Growth Projections
          </CardTitle>
          <CardDescription>Our path vs. the VC treadmill</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-muted-foreground">Timeline</th>
                  <th className="text-right py-3 px-2 text-muted-foreground">Members</th>
                  <th className="text-right py-3 px-2 text-muted-foreground">Revenue</th>
                  <th className="text-right py-3 px-2 text-green-600 dark:text-green-400">Our Ownership</th>
                  <th className="text-right py-3 px-2 text-destructive">If We'd Taken VC</th>
                </tr>
              </thead>
              <tbody>
                {projections.map((row) => (
                  <tr key={row.year} className="border-b border-border">
                    <td className="py-3 px-2 text-foreground font-medium">{row.year}</td>
                    <td className="py-3 px-2 text-right text-muted-foreground">{row.members}</td>
                    <td className="py-3 px-2 text-right text-muted-foreground">{row.revenue}</td>
                    <td className="py-3 px-2 text-right text-green-600 dark:text-green-400 font-bold">{row.ownership}</td>
                    <td className="py-3 px-2 text-right text-destructive">{row.vcOwnership}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/30">
            <p className="text-sm text-primary">
              <strong>The Math:</strong> At Year 10, if we're worth $500M with VC money, we'd own ~$25M.
              Growing organically, even at half that valuation ($250M), we own <strong>all of it</strong>.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8 bg-primary/5 border-primary/30">
        <CardHeader>
          <CardTitle className="text-primary">The Organic Growth Path</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 overflow-x-auto py-4">
            <div className="text-center min-w-[100px]">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-2">
                <Sprout className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">Seed</p>
              <p className="text-xs text-muted-foreground">First 10</p>
            </div>
            <div className="flex-1 h-1 bg-gradient-to-r from-primary/50 to-green-500/50 rounded" />
            <div className="text-center min-w-[100px]">
              <div className="w-12 h-12 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                <TreePine className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm font-semibold text-foreground">Sapling</p>
              <p className="text-xs text-muted-foreground">The 300</p>
            </div>
            <div className="flex-1 h-1 bg-gradient-to-r from-green-500/50 to-emerald-500/50 rounded" />
            <div className="text-center min-w-[100px]">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
                <TreePine className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm font-semibold text-foreground">Tree</p>
              <p className="text-xs text-muted-foreground">3,000</p>
            </div>
            <div className="flex-1 h-1 bg-gradient-to-r from-emerald-500/50 to-blue-500/50 rounded" />
            <div className="text-center min-w-[100px]">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                <Mountain className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-sm font-semibold text-foreground">Forest</p>
              <p className="text-xs text-muted-foreground">30,000+</p>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Each stage funds the next. No outside money needed.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8 bg-purple-500/5 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <Users className="h-5 w-5" />
            What This Means For YOU
          </CardTitle>
          <CardDescription>Why being an early adopter matters more without VC</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-purple-500/10 rounded-lg">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">No Pivot Whiplash</p>
                <p className="text-sm text-muted-foreground">VC-backed startups constantly pivot to chase metrics. We're building for the long haul.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-500/10 rounded-lg">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">You're the Asset, Not the Product</p>
                <p className="text-sm text-muted-foreground">VC-backed companies sell your data. We don't need to — we're not trying to hit arbitrary growth targets.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-500/10 rounded-lg">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Your Early Contribution Matters Forever</p>
                <p className="text-sm text-muted-foreground">Ghost Attribution (#1126) means your contributions are remembered even if you leave. Your early support = permanent credit.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg border border-primary/30">
              <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-primary">The 300 Are Getting Joules</p>
                <p className="text-sm text-muted-foreground">Our first 300 members get participation Joules — a stake in our patent portfolio. No VC means no dilution of YOUR contribution.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center space-y-4">
        <p className="text-muted-foreground">We're betting on ourselves. And we're betting on you.</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate('/the-300')}>Join The 300</Button>
          <Button variant="outline" onClick={() => navigate('/fly-on-the-wall')}>Watch Us Build</Button>
        </div>
      </div>
    </PortalPageLayout>
  );
}
