import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Terminal, Bug, Code, ArrowRight, ShieldAlert } from "lucide-react";
import { useNavigate } from 'react-router-dom';

import { LarkWrapper } from '@/components/builder/LarkWrapper';
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function CodeBreakersHub() {
  const navigate = useNavigate();

  return (
    <PortalPageLayout>
      <div className="max-w-5xl mx-auto space-y-12">

        {/* Header */}
        <div className="space-y-6 border-b border-emerald-900/50 pb-12">
          <div className="flex items-center gap-3">
            <Terminal className="w-8 h-8" />
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              SYSTEM.STATUS = "TESTING"
            </Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-100">
            Code Breakers Bounty Board
          </h1>
          <p className="text-xl text-emerald-600/80 max-w-2xl">
            Welcome to the proving grounds. We need you to break this platform, find the exploits, and submit Larks to fix them.
          </p>
        </div>

        {/* The Mission */}
        <LarkWrapper componentId="code-breakers-mission" bountyCredits={250}>
          <Card className="bg-zinc-900 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
            <CardHeader>
              <CardTitle className="text-2xl text-zinc-100 flex items-center gap-2">
                <Bug className="w-6 h-6 text-emerald-500" />
                The Mission: Immediate Testing
              </CardTitle>
              <CardDescription className="text-emerald-600/70 text-base">
                This is a massive Yggdrasil architecture. It has bugs. We are paying you to find them.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-zinc-300">
              <p>
                Every component on this platform is wrapped in our <strong>Builder Mode</strong>. If you see something broken, or something that can be improved, turn on your X-Ray Goggles (bottom right of the screen).
              </p>
              <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-900/50">
                <h4 className="font-bold text-emerald-400 mb-2 flex items-center gap-2">
                  <Code className="w-4 h-4" /> How to Submit a Lark
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Click the Glasses icon in the bottom right to activate Builder Mode.</li>
                  <li>Hover over the broken or sub-optimal component.</li>
                  <li>Click "Submit Lark" on the badge that appears.</li>
                  <li>Provide your fix, code snippet, or UI improvement.</li>
                  <li>Earn Credits (backed by our IP) when your Lark is merged.</li>
                </ol>
              </div>
              <Button
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold"
                onClick={() => navigate('/salt-mines')}
              >
                View Active Bounties in the Salt Mines <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </LarkWrapper>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                Security Vulnerabilities
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-400 space-y-4">
              <p>Critical bounties are available for finding exploits in:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>The Three-Gear Currency System (Credits/Marks/Joules)</li>
                <li>The DNA Lock mechanism</li>
                <li>Stripe Identity Verification bypasses</li>
                <li>Row Level Security (RLS) leaks in Supabase</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100 flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-500" />
                UI/UX Improvements
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-400 space-y-4">
              <p>Standard bounties are available for:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Mobile responsiveness fixes</li>
                <li>Accessibility (a11y) improvements</li>
                <li>Performance optimizations</li>
                <li>Clarifying complex copy (Pudding-style expansions)</li>
              </ul>
            </CardContent>
          </Card>
        </div>

      </div>
    </PortalPageLayout>
  );
}
