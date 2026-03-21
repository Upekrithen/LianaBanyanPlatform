import React from 'react';
import { Shield, Image as ImageIcon, ArrowRight, Coins, Zap, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function IncumbentAdvantage() {
  return (
    <PortalPageLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-amber-600 border-amber-600">The Salt Mines & X-Ray Goggles</Badge>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            The Incumbent Advantage
          </h1>
          <p className="mt-4 text-xl text-slate-600 max-w-3xl mx-auto">
            Don't wait for perfection. Be the first to plant the flag. How our asset replacement bounties reward action over hesitation.
          </p>
        </div>

        {/* The Core Rule */}
        <Card className="mb-12 border-l-4 border-l-amber-500 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Shield className="h-6 w-6 text-amber-500" />
              The "First-to-Plant" Rule
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg text-slate-700 space-y-4">
            <p>
              In the Liana Banyan ecosystem, we value momentum. If a page needs an image, a logo, or a diagram, <strong>the first person to upload a "good enough" placeholder becomes the Incumbent.</strong>
            </p>
            <p>
              When a professional artist eventually comes along using <span className="font-semibold text-indigo-600">X-Ray Goggles</span> to find bounties and replaces your placeholder with a masterpiece, <strong>you get paid a Trailblazer Royalty</strong> for having held the line.
            </p>
          </CardContent>
        </Card>

        {/* How It Works Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Step 1 */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ImageIcon className="h-24 w-24" />
            </div>
            <CardHeader>
              <Badge className="w-fit mb-2 bg-slate-200 text-slate-700 hover:bg-slate-200">Step 1</Badge>
              <CardTitle>Plant the Flag</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                You notice a missing asset (like a logo or a diagram). You sketch something up, even if it's rough, and submit it. You are now the <strong>Incumbent</strong>.
              </p>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Eye className="h-24 w-24" />
            </div>
            <CardHeader>
              <Badge className="w-fit mb-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-100">Step 2</Badge>
              <CardTitle>The X-Ray Bounty</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Because it's a placeholder, the system automatically attaches an <strong>X-Ray Goggles Bounty</strong> to it. Any user hovering over it sees "You Can Do Better" and a Lark opens for submission.
              </p>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Coins className="h-24 w-24" />
            </div>
            <CardHeader>
              <Badge className="w-fit mb-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Step 3</Badge>
              <CardTitle>The Replacement Split</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                A pro artist submits a beautiful replacement. It gets approved. The artist gets the main bounty, but <strong>you get a 10-20% Trailblazer cut</strong> of that bounty just for being the incumbent!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Examples Section */}
        <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Real Platform Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <Card>
            <CardHeader>
              <CardTitle>The Founder Denken Sketch</CardTitle>
              <CardDescription>Currently Incumbent on Cephas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video bg-slate-100 rounded-md flex items-center justify-center overflow-hidden border border-slate-200">
                <img src="/images/founderDenken.png" alt="Founder Denken Sketch" className="object-contain h-full w-full opacity-80" />
              </div>
              <p className="text-sm text-slate-600">
                This hand-drawn sketch currently holds the Incumbent position for the Founder Avatar. If an illustrator creates a polished vector version that gets accepted, the original uploader (the Founder) retains the historical Trailblazer credit and any associated bounty splits.
              </p>
              <Button variant="outline" className="w-full" onClick={() => window.open('https://cephas.lianabanyan.com/founder-proof', '_blank', 'noopener,noreferrer')}>
                View Founder Proof on Cephas
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>The LRH Flipbook</CardTitle>
              <CardDescription>The Little Red Hen Onboarding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video bg-slate-100 rounded-md flex items-center justify-center border border-slate-200 p-4">
                <div className="text-center">
                  <Zap className="h-12 w-12 text-amber-400 mx-auto mb-2" />
                  <p className="font-medium text-slate-700">26 Placeholder Images</p>
                </div>
              </div>
              <p className="text-sm text-slate-600">
                The 26 images for the Little Red Hen story are currently placeholders. The first user to submit a cohesive, styled 26-image set claims the Incumbent role for the entire sequence, setting the bar for all future challengers.
              </p>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                Turn on X-Ray Goggles
              </Button>
            </CardContent>
          </Card>

        </div>

      </div>
    </PortalPageLayout>
  );
}
