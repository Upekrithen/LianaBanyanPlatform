import React from 'react';
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, FileText, TrendingUp, ShieldCheck, ArrowRight, PieChart, Users } from "lucide-react";

import { LarkWrapper } from '@/components/builder/LarkWrapper';
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function SponsorPortal() {
  const navigate = useNavigate();
  return (
    <PortalPageLayout maxWidth="xl" xrayId="sponsor-portal">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="space-y-4">
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            Professional Partner Portal
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Fund the Future. <span className="text-emerald-500">Own the Provenance.</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl">
            Welcome to the Liana Banyan Sponsor & IP Portal. We are seeking $5K sponsorships to ignite the 12 Cities Megalopolis and fund the 16 Core Initiatives.
          </p>
        </div>

        {/* The 60% Sponsor Incentive Breakdown */}
        <LarkWrapper componentId="sponsor-incentives-breakdown" bountyCredits={300}>
          <Card className="bg-zinc-900 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            <CardHeader className="border-b border-zinc-800 pb-6">
              <CardTitle className="text-2xl flex items-center gap-2 text-emerald-400">
                <PieChart className="h-6 w-6" />
                The 60% Sponsor Incentive Structure
              </CardTitle>
              <CardDescription className="text-zinc-400 text-base mt-2">
                We don't just ask for funding; we offer a mathematically sound, legally compliant "Balanced Bag" of fractional IP participation. 
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid md:grid-cols-3 gap-6">
              
              <div className="space-y-3">
                <div className="text-3xl font-bold text-emerald-500">20%</div>
                <h4 className="font-semibold text-zinc-200">Seed Funding (The Balanced Bag)</h4>
                <p className="text-sm text-zinc-400">
                  Split evenly: <strong>10%</strong> goes to the general Patent Portfolio (broad exposure), and <strong>10%</strong> goes to a specific Patent Bag of your choosing (targeted exposure).
                </p>
              </div>

              <div className="space-y-3">
                <div className="text-3xl font-bold text-blue-500">20%</div>
                <h4 className="font-semibold text-zinc-200">Bounty Backers</h4>
                <p className="text-sm text-zinc-400">
                  Directly funds the Code Breakers and Builders executing the work. You help others succeed, and you participate in that success.
                </p>
              </div>

              <div className="space-y-3">
                <div className="text-3xl font-bold text-purple-500">20%</div>
                <h4 className="font-semibold text-zinc-200">Same Deal as the Founder</h4>
                <p className="text-sm text-zinc-400">
                  The founder retains 20%. No special treatment, no preferred class. You get the exact same deal structure as the person who spent 9 years building it.
                </p>
              </div>

            </CardContent>
            <div className="bg-zinc-950 p-4 rounded-b-xl border-t border-zinc-800 flex items-center justify-between">
              <p className="text-sm text-zinc-500 flex items-center gap-2">
                <Users className="w-4 h-4" /> Want to see this in action? Take the WildFire Tour.
              </p>
              <Button variant="outline" className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-950" onClick={() => navigate('/beacon')}>
                Start WildFire Tour <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </LarkWrapper>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* The $5K Sponsor Path */}
          <LarkWrapper componentId="sponsor-path-card" bountyCredits={200}>
            <Card className="bg-zinc-900 border-zinc-800 hover:border-emerald-500/50 transition-colors h-full">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-emerald-500" />
                The $5K Sponsorship
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Directly fund the "Spark to Wildfire" deployment of initiatives like Let's Make Dinner and Defense Klaus.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3 text-sm text-zinc-300">
                <li className="flex items-start gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                  <span><strong>Cost + 20% Locked:</strong> We do not extract endless margin. 83.3% goes to the creators and local Dukes executing the work.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                  <span><strong>Joules Return:</strong> Your sponsorship is converted into Joules (Platform Service Vouchers) which you can use to hire talent, launch your own projects, or gift to others.</span>
                </li>
              </ul>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
                View Sponsorship Tiers <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
          </LarkWrapper>

          {/* The IP Purchaser Path */}
          <LarkWrapper componentId="ip-purchaser-card" bountyCredits={200}>
            <Card className="bg-zinc-900 border-zinc-800 hover:border-blue-500/50 transition-colors h-full">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-500" />
                Patent IP Purchasing
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Acquire fractional participation in the 1,244 documented innovations protected by our 7 Patent Applications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3 text-sm text-zinc-300">
                <li className="flex items-start gap-2">
                  <Briefcase className="h-5 w-5 text-blue-500 shrink-0" />
                  <span><strong>The Patent Bags:</strong> Innovations are grouped into logical "Bags" (e.g., The Care Unit System, The Yggdrasil Architecture).</span>
                </li>
                <li className="flex items-start gap-2">
                  <Briefcase className="h-5 w-5 text-blue-500 shrink-0" />
                  <span><strong>Immutable Provenance:</strong> Participation is recorded on our verified ledger. This is not a speculative token; it is a legally binding receipt of IP participation.</span>
                </li>
              </ul>
              <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                Review the IP Ledger <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
          </LarkWrapper>

        </div>
      </div>
    </PortalPageLayout>
  );
}
