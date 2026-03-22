/**
 * Treasure Map Guide — Step-by-step guide for each treasure map path.
 * Route: /treasure-maps/:mapId
 */

import { useParams, Link } from 'react-router-dom';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BeaconDropButton } from '@/components/BeaconDropButton';
import {
  ArrowLeft, CheckCircle, Map, Wrench, TrendingUp, Star, AlertTriangle,
} from 'lucide-react';
import { TREASURE_MAP_GUIDES } from '@/data/treasureMapGuides';

export default function TreasureMapGuide() {
  const { mapId } = useParams<{ mapId: string }>();
  const guide = mapId ? TREASURE_MAP_GUIDES[mapId] : null;

  if (!guide) {
    return (
      <PortalPageLayout variant="stage" maxWidth="lg" xrayId="treasure-map-guide">
        <Link to="/treasure-maps" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> All Treasure Maps
        </Link>
        <div className="text-center py-16">
          <Map className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-xl font-bold">Map not found</p>
          <p className="text-muted-foreground mt-2">This treasure map doesn't exist.</p>
        </div>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout variant="stage" maxWidth="lg" xrayId="treasure-map-guide">
      <Link to="/treasure-maps" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> All Treasure Maps
      </Link>

      {/* Hero */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">{guide.title}</h1>
          <BeaconDropButton compact />
        </div>
        <p className="text-lg text-muted-foreground">{guide.subtitle}</p>
      </div>

      {/* Who this is for */}
      <Card className="bg-amber-950/20 border-amber-800/30 mb-6">
        <CardContent className="py-4 px-6">
          <p className="text-sm">
            <span className="font-semibold text-amber-400">Who this is for:</span>{' '}
            <span className="text-muted-foreground">{guide.whoThisIsFor}</span>
          </p>
        </CardContent>
      </Card>

      {/* What you need */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-500" /> What You Need
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {guide.whatYouNeed.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Economics */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-500" /> Economics
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {guide.economics.map((row, i) => (
            <Card key={i} className="bg-card/50 border-border">
              <CardContent className="py-3 px-4">
                <p className="text-xs text-muted-foreground">{row.label}</p>
                <p className="text-sm font-semibold mt-0.5">{row.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Phases */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Map className="w-5 h-5 text-amber-500" /> The Path
        </h2>
        <Accordion type="multiple" defaultValue={['phase-0']}>
          {guide.phases.map((phase, pi) => (
            <AccordionItem key={pi} value={`phase-${pi}`}>
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] w-6 h-6 flex items-center justify-center rounded-full p-0">
                    {pi + 1}
                  </Badge>
                  {phase.name}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pl-8">
                  {phase.steps.map((step, si) => (
                    <div key={si}>
                      <p className="text-sm font-medium">{step.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{step.detail}</p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Level progression */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" /> Level Progression
        </h2>
        <div className="space-y-2">
          {guide.levelProgression.map((level, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-card/30 border border-border/50">
              <Badge className="bg-amber-600/20 text-amber-400 border-amber-500/30 text-[10px] w-8 h-8 flex items-center justify-center rounded-full p-0">
                L{i + 1}
              </Badge>
              <div>
                <p className="text-sm font-medium">{level.name}</p>
                <p className="text-xs text-muted-foreground">{level.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Allocation Authority */}
      <Card className="bg-emerald-950/20 border-emerald-800/30 mb-8">
        <CardContent className="py-4 px-6">
          <p className="text-sm font-semibold text-emerald-400 mb-1">Your Allocation Authority</p>
          <p className="text-xs text-muted-foreground">
            Every business you onboard generates Backed Marks — 3% of the platform's share becomes your governance influence.
            Your direct earnings (delivery fees, management fees) are separate and paid in real money.
            Backed Marks give you a voice in how the cooperative grows.
          </p>
        </CardContent>
      </Card>

      {/* Tool links */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-blue-500" /> Your Tools
        </h2>
        <div className="grid gap-2">
          {guide.toolLinks.map((tool, i) => (
            <Link key={i} to={tool.route}>
              <Card className="bg-card/50 border-border hover:border-amber-500/30 transition-colors cursor-pointer">
                <CardContent className="py-3 px-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{tool.name}</p>
                    <p className="text-xs text-muted-foreground">{tool.description}</p>
                  </div>
                  <span className="text-muted-foreground">→</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* SEC disclaimer */}
      <p className="text-[10px] text-muted-foreground/60 text-center">
        Earnings represent service compensation. Backed Marks represent cooperative governance authority, not investment returns.
        Actual results depend on effort, market conditions, and business participation. This is not an investment opportunity.
      </p>
    </PortalPageLayout>
  );
}
