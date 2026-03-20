import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Hammer, Factory, Zap, ArrowRight, Star, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import '@/styles/landing.css';
import LaunchConditionOverlay from '@/components/LaunchConditionOverlay';
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function LetsMakeBreadPage() {
  const navigate = useNavigate();

  return (
    <LaunchConditionOverlay initiativeSlug="lets-make-bread" initiativeName="Let's Make Bread">
    <PortalPageLayout variant="immersive" className="landing-page" xrayId="lets-make-bread-page">
      <div className="landing-title">
        <span className="liana">Liana</span>
        <span className="banyan">Banyan</span>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-orange-600 border-orange-600">Initiative #11</Badge>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight sm:text-5xl flex items-center justify-center gap-3">
            <Wrench className="h-10 w-10 text-orange-600" />
            Let's Make Bread
          </h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
            The Business Incubator for Makers. Turn ideas into prototypes, prototypes into products, and products into sustainable cooperative businesses.
          </p>
        </div>

        {/* The Core Philosophy */}
        <Card className="mb-12 border-l-4 border-l-orange-500 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Factory className="h-6 w-6 text-orange-500" />
              The Business Incubator
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg text-muted-foreground space-y-4">
            <p>
              The first Industrial Revolution centralized manufacturing. Factories. Assembly lines. Scale at the cost of craft. The second one is supposed to decentralize it (3D printers, CNC machines, maker spaces), but so far, it's been a promise without infrastructure.
            </p>
            <p>
              <strong>Let's Make Bread</strong> is that infrastructure. We aren't building one factory—we're enabling thousands of tiny ones, each owned by the person running it.
            </p>
            <p>
              But it's not just for physical products. <strong>Service businesses and the Gig Economy</strong> are a huge part of this incubator. Whether you're making physical goods, running a restaurant, or starting a local service node, Let's Make Bread is the business incubator that helps you turn ideas into prototypes, products, services, and sustainable cooperative businesses.
            </p>
          </CardContent>
        </Card>

        {/* The HexIsle Proof of Concept */}
        <div className="bg-card rounded-2xl p-8 mb-16">
          <Badge className="bg-orange-500 text-white mb-4">The Proof of Concept</Badge>
          <h2 className="text-3xl font-bold mb-4">HexIsle & The Tereno Platform</h2>
          <p className="text-muted-foreground text-lg mb-6 max-w-3xl">
            HexIsle proves that a single person with an SLA 3D printer, molding materials, or desktop extruders can produce precision components at <strong>95% less cost</strong> than traditional manufacturing. 
          </p>
          <p className="text-muted-foreground text-lg mb-6 max-w-3xl">
            Modular design means the exact same product can be made in a garage in Texas or an apartment in Tokyo. But HexIsle is just one product. Let's Make Bread is the system that helps other makers do exactly what the Founder did.
          </p>
          <Button 
            className="bg-orange-600 hover:bg-orange-700 text-white"
            onClick={() => navigate('/initiatives/hexisle')}
          >
            View the HexIsle Blueprint
          </Button>
        </div>

        {/* The Crown Section */}
        <div className="bg-card rounded-2xl p-8 mb-16 border border-border shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Star className="h-48 w-48 text-orange-900" />
          </div>
          <div className="relative z-10">
            <Badge className="bg-muted text-foreground mb-4">The Crown: Industry Chancellor</Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4">Why We Wrote to Dale Dougherty</h2>
            <p className="text-muted-foreground text-lg mb-6 max-w-3xl">
              He coined the word "makers." He started Make: Magazine and Maker Faire. He gave the movement a name and a home.
            </p>
            <p className="text-muted-foreground text-lg mb-6 max-w-3xl">
              We asked him to be the Industry Chancellor because Let's Make Bread is the economic infrastructure that makes the Maker Movement sustainable. We don't just want to teach people to make things—we want to teach them to build enterprises that sustain themselves and their communities.
            </p>
          </div>
        </div>

        {/* College of Hard Knocks / Anecdotes */}
        <div className="bg-muted p-8 rounded-2xl border border-border">
          <div className="text-center mb-8">
            <Heart className="h-12 w-12 text-rose-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-4">Born from the College of Hard Knocks</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The Founder spent four decades designing systems—from floating cities in sixth grade to irrigation control systems in foxholes during military service. Let's Make Bread exists because makers shouldn't have to spend 40 years figuring out the business side of their inventions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-card p-6 rounded-xl border border-border shadow-sm">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-3">The Blueprints of Losing</h3>
              <p className="text-muted-foreground mb-4">
                The blueprints are more important than the anecdotes for business building. The College of Hard Knocks is about learning how to lose, and keeping going anyway.
              </p>
              <p className="text-muted-foreground mb-6">
                Look at the Founder's chess stats: a rating hovering in the 2080s (top 0.4% globally), maintained over years. But look closer: <strong>he loses more than half the time</strong>. 13,010 losses to 12,085 wins. You don't get to the top by never losing. You get there by losing, learning, and playing the next game. That is what Let's Make Bread teaches.
              </p>
              <Button variant="outline" onClick={() => window.open('https://cephas.lianabanyan.com/founder-proof', '_blank', 'noopener,noreferrer')}>
                Read the Founder's Writings on Losing
              </Button>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden border border-border shadow-inner">
                <div className="bg-card text-foreground text-xs font-bold px-3 py-1 text-center">Original Screenshot (Months Ago)</div>
                <img src="/images/chess_stats_old.png" alt="Founder's Original Chess Stats" className="w-full h-auto opacity-90" />
              </div>
              <div className="rounded-lg overflow-hidden border border-border shadow-inner">
                <div className="bg-emerald-700 text-white text-xs font-bold px-3 py-1 text-center">Updated Screenshot (March 2026)</div>
                <img src="/images/chess_stats.jpg" alt="Founder's Updated Chess Stats showing 2118 peak rating but more losses than wins" className="w-full h-auto" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </PortalPageLayout>
    </LaunchConditionOverlay>
  );
}
