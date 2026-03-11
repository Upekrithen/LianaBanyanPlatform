/**
 * Help Each Other Help Ourselves - Philosophy & Action Page
 * 
 * Linked from "Help Each Other Help Ourselves" text throughout the site.
 * Describes all the ways we implement this philosophy and what YOU can do NOW.
 * 
 * Features the Audrey Hepburn quote as a Cue Card.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExpandableBlock, DataVizBar, RevealBlock } from "@/components/pudding";
import LearningPathway from "@/components/LearningPathway";
import {
  Heart,
  Users,
  Handshake,
  Shield,
  Coins,
  Scale,
  Gift,
  Sparkles,
  ArrowRight,
  Quote,
  ExternalLink,
  Share2,
  BookOpen,
  Lightbulb,
  Target,
  Zap,
} from "lucide-react";

export default function HelpEachOtherPage() {
  const navigate = useNavigate();
  const [quoteFlipped, setQuoteFlipped] = useState(false);

  const actionItems = [
    {
      icon: Shield,
      title: "Get Defense Klaus",
      description: "Protect yourself AND fund legal defense for all members. $6 bracelet, 100% to the fund.",
      action: "Get Protected",
      route: "/initiatives/defense-klaus",
      color: "purple",
    },
    {
      icon: Users,
      title: "Share Your Gift Passes",
      description: "Each signup gets 2 gift passes. Share protection with people you care about.",
      action: "Share Now",
      route: "/initiatives/defense-klaus?tab=share",
      color: "pink",
    },
    {
      icon: Coins,
      title: "Adopt Cost + 20%",
      description: "If you have a business, commit to transparent pricing. Earn C+20 purchasing power in return.",
      action: "Learn More",
      route: "/c20-certification",
      color: "green",
    },
    {
      icon: Gift,
      title: "Donate a Voucher",
      description: "Purchase a Defense Klaus voucher for someone who can't afford it.",
      action: "Donate",
      route: "/initiatives/defense-klaus?tab=cold-start",
      color: "amber",
    },
    {
      icon: Handshake,
      title: "Join an Initiative",
      description: "16 initiatives working together. Find one that matches your skills and interests.",
      action: "Browse Initiatives",
      route: "/initiatives",
      color: "blue",
    },
    {
      icon: Scale,
      title: "Attorneys Needed",
      description: "Join the Legal Defense Fund network. Competitive rates, meaningful work helping members.",
      action: "Learn More",
      route: "/initiatives/defense-klaus?tab=lawyers",
      color: "orange",
    },
  ];

  const philosophyPillars = [
    {
      title: "Interdependence Over Independence",
      description: "We're stronger together. Your success helps my success. My contribution enables yours.",
      icon: Users,
    },
    {
      title: "Transparency Over Opacity",
      description: "Cost + 20% means everyone knows the real price. No hidden margins, no exploitation.",
      icon: Lightbulb,
    },
    {
      title: "Access Over Exclusion",
      description: "20% of cold start slots are free. Non-members can explore. The ladder, not the gate.",
      icon: Target,
    },
    {
      title: "Earned Over Given",
      description: "The most valuable things require effort. Harrows unlock rare cards. Commitment unlocks trust.",
      icon: Zap,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900/10 to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="text-white">Help Each Other</span>
            <br />
            <span className="text-green-400">Help Ourselves</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            The philosophy that powers everything we build.
          </p>
        </div>

        {/* Audrey Hepburn Quote Card - Flippable Cue Card */}
        <div 
          className="relative mx-auto cursor-pointer perspective-1000"
          style={{ maxWidth: 500, height: 280 }}
          onClick={() => setQuoteFlipped(!quoteFlipped)}
        >
          <div 
            className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${quoteFlipped ? 'rotate-y-180' : ''}`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front - Audrey Hepburn Image with Quote */}
            <Card 
              className="absolute inset-0 bg-gradient-to-br from-amber-900/40 to-amber-800/20 border-amber-500/30 backface-hidden overflow-hidden"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <CardContent className="h-full flex flex-col items-center justify-center p-4 text-center relative">
                <img 
                  src="/images/Audrey_Hepburn.avif" 
                  alt="Audrey Hepburn" 
                  className="absolute inset-0 w-full h-full object-cover opacity-30"
                />
                <div className="relative z-10">
                  <Quote className="h-6 w-6 text-amber-400 mb-2 mx-auto" />
                  <blockquote className="text-base md:text-lg text-white italic font-serif leading-relaxed max-w-md">
                    "As you grow older, you will discover that you have two hands, one for helping yourself, the other for helping others."
                  </blockquote>
                  <p className="mt-3 text-amber-400 font-semibold">— Audrey Hepburn</p>
                  <p className="text-xs text-white/40 mt-2">Click to flip</p>
                </div>
              </CardContent>
            </Card>

            {/* Back - Source & Context */}
            <Card 
              className="absolute inset-0 bg-gradient-to-br from-green-900/40 to-green-800/20 border-green-500/30 rotate-y-180"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <CardContent className="h-full flex flex-col items-center justify-center p-8 text-center">
                <Heart className="h-8 w-8 text-green-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">The Two Hands Philosophy</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-4">
                  Audrey Hepburn lived this philosophy. After decades of film stardom, 
                  she dedicated her later years to UNICEF, helping children in need around the world.
                </p>
                <p className="text-green-400 text-sm font-semibold mb-4">
                  One hand builds. One hand gives. Both are needed.
                </p>
                <a 
                  href="https://economictimes.indiatimes.com/news/international/us/quote-of-the-day-february-24-quote-of-the-day-by-audrey-hepburn-as-you-grow-older-you-will-discover-that-you-have-two-hands-one-for-helping/articleshow/128747800.cms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-white/50 hover:text-white/70 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3" />
                  Source: Economic Times
                </a>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Philosophy Pillars - Progressive Disclosure */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-green-400" />
            <h2 className="text-xl font-bold text-white">The Four Pillars</h2>
          </div>
          <p className="text-white/60 text-sm mb-4">
            How we put "Help Each Other Help Ourselves" into practice
          </p>
          
          {philosophyPillars.map((pillar, i) => {
            const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6'];
            return (
              <ExpandableBlock
                key={i}
                title={pillar.title}
                subtitle="Click to learn more"
                preview={pillar.description}
                accentColor={colors[i]}
                defaultExpanded={i === 0}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: colors[i] + '20' }}
                    >
                      <pillar.icon className="h-5 w-5" style={{ color: colors[i] }} />
                    </div>
                    <p className="text-white/70">{pillar.description}</p>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-white/50">
                      <strong className="text-white/70">In practice:</strong>{' '}
                      {i === 0 && "Every initiative is designed to create mutual benefit. Your participation strengthens the whole network."}
                      {i === 1 && "Cost + 20% pricing is published on every listing. No hidden fees, no surprise markups."}
                      {i === 2 && "20% of cold start slots are reserved for those who can't afford membership. Ghost mode lets anyone explore."}
                      {i === 3 && "Harrows, medallions, and rare cards are earned through contribution, not purchased."}
                    </p>
                  </div>
                </div>
              </ExpandableBlock>
            );
          })}
        </div>

        {/* What YOU Can Do NOW */}
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">What YOU Can Do NOW</h2>
            <p className="text-white/60">Concrete actions to help each other help ourselves</p>
          </div>

          <div className="space-y-3">
            {actionItems.map((item, i) => {
              const colorMap: Record<string, string> = {
                purple: '#8b5cf6',
                pink: '#ec4899',
                green: '#22c55e',
                amber: '#f59e0b',
                blue: '#3b82f6',
                orange: '#f97316',
              };
              const accentColor = colorMap[item.color] || '#22c55e';
              
              return (
                <ExpandableBlock
                  key={i}
                  title={item.title}
                  subtitle={item.description}
                  preview={`${item.action} →`}
                  accentColor={accentColor}
                  defaultExpanded={i === 0}
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: accentColor + '20' }}
                      >
                        <item.icon className="h-6 w-6" style={{ color: accentColor }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-white/70 mb-3">{item.description}</p>
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(item.route);
                          }}
                          className="gap-2"
                          style={{ backgroundColor: accentColor }}
                        >
                          {item.action}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </ExpandableBlock>
              );
            })}
          </div>
        </div>

        <Separator className="bg-white/10" />

        {/* The Economics */}
        <ExpandableBlock
          title="💰 The Economics of Helping"
          subtitle="How mutual aid creates sustainable value"
          preview="Creator/Worker keeps 83.3% on every transaction. $5/year membership. 20% cold start slots free..."
          accentColor="#22c55e"
          defaultExpanded={true}
        >
          {/* Visual Data Bar */}
          <DataVizBar
            title="Revenue Distribution"
            subtitle="On every transaction — locked forever"
            data={[
              { label: 'Creator keeps', value: 83.3, color: '#22c55e', icon: '💰' },
              { label: 'Platform (C+20%)', value: 16.7, color: '#f97316', icon: '🏛️' }
            ]}
            maxValue={100}
            showPercentages={true}
            height={28}
          />
          
          <div className="mt-6 grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="text-3xl font-bold text-green-400">83.3%</div>
              <div className="text-sm text-white/60">Creator keeps on every transaction</div>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="text-3xl font-bold text-amber-400">$5/year</div>
              <div className="text-sm text-white/60">Membership cost</div>
            </div>
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="text-3xl font-bold text-purple-400">20%</div>
              <div className="text-sm text-white/60">Cold start slots donated free</div>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-sm text-white/70">
              <strong className="text-green-400">The C+20 Reciprocity Law:</strong> For every dollar of margin 
              you give up by adopting Cost + 20% pricing, you earn one dollar of C+20 purchasing power 
              inside the ecosystem. Help others → help yourself. It's not charity; it's mutual credit.
            </p>
          </div>
        </ExpandableBlock>

        {/* Share This Page */}
        <Card className="border-white/10 bg-white/5">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-white">Share This Philosophy</h3>
                <p className="text-sm text-white/60">Help others discover what we're building</p>
              </div>
              <Button 
                variant="outline" 
                className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: "Help Each Other Help Ourselves",
                      text: "As you grow older, you will discover that you have two hands, one for helping yourself, the other for helping others. — Audrey Hepburn",
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Learn & Earn Pathway */}
        <Separator className="bg-white/10 my-6" />
        <LearningPathway compact={false} />

        {/* Footer Quote */}
        <div className="text-center py-8">
          <p className="text-lg text-green-400 font-semibold">
            Help Each Other Help Ourselves
          </p>
          <p className="text-xs text-white/30 mt-1">
            Interdependence
          </p>
          <p className="text-sm text-white/40 mt-2">
            The Golden Key
          </p>
        </div>
      </div>
    </div>
  );
}
