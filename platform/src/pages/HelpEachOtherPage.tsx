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
import { PortalPageLayout } from '@/components/PortalPageLayout';

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
      color: "text-purple-600",
      bg: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      icon: Users,
      title: "Share Your Gift Passes",
      description: "Each signup gets 2 gift passes. Share protection with people you care about.",
      action: "Share Now",
      route: "/initiatives/defense-klaus?tab=share",
      color: "text-pink-600",
      bg: "bg-pink-100 dark:bg-pink-900/30",
    },
    {
      icon: Coins,
      title: "Adopt Cost + 20%",
      description: "If you have a business, commit to transparent pricing. Earn C+20 purchasing power in return.",
      action: "Learn More",
      route: "/c20-certification",
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      icon: Gift,
      title: "Donate a Voucher",
      description: "Purchase a Defense Klaus voucher for someone who can't afford it.",
      action: "Donate",
      route: "/initiatives/defense-klaus?tab=cold-start",
      color: "text-amber-600",
      bg: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      icon: Handshake,
      title: "Join an Initiative",
      description: "16 initiatives working together. Find one that matches your skills and interests.",
      action: "Browse Initiatives",
      route: "/initiatives",
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      icon: Scale,
      title: "Attorneys Needed",
      description: "Join the Legal Defense Fund network. Competitive rates, meaningful work helping members.",
      action: "Learn More",
      route: "/initiatives/defense-klaus?tab=lawyers",
      color: "text-orange-600",
      bg: "bg-orange-100 dark:bg-orange-900/30",
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
    <PortalPageLayout>
      <div className="container mx-auto px-4 py-16 max-w-5xl space-y-16">
        
        {/* Hero Section */}
        <div className="text-center space-y-6 py-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Help Each Other <br className="hidden md:block" />
            <span className="text-primary">Help Ourselves</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The philosophy that powers everything we build. It's not just a slogan; it's the economic engine of the platform.
          </p>
        </div>

        {/* Audrey Hepburn Quote Card - Flippable Cue Card */}
        <div 
          className="relative mx-auto cursor-pointer perspective-1000"
          style={{ maxWidth: 600, height: 320 }}
          onClick={() => setQuoteFlipped(!quoteFlipped)}
        >
          <div 
            className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${quoteFlipped ? 'rotate-y-180' : ''}`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front - Audrey Hepburn Image with Quote */}
            <Card 
              className="absolute inset-0 bg-stone-100 dark:bg-stone-900 border-stone-200 dark:border-stone-800 backface-hidden overflow-hidden shadow-lg"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <CardContent className="h-full flex flex-col items-center justify-center p-8 text-center relative">
                <img 
                  src="/images/Audrey_Hepburn.avif" 
                  alt="Audrey Hepburn" 
                  className="absolute inset-0 w-full h-full object-cover opacity-10 dark:opacity-20 grayscale mix-blend-multiply"
                />
                <div className="relative z-10">
                  <Quote className="h-8 w-8 text-stone-400 mb-6 mx-auto" />
                  <blockquote className="text-xl md:text-2xl text-stone-800 dark:text-stone-200 italic font-serif leading-relaxed max-w-lg mx-auto">
                    "As you grow older, you will discover that you have two hands, one for helping yourself, the other for helping others."
                  </blockquote>
                  <p className="mt-6 text-stone-600 dark:text-stone-400 font-semibold tracking-wide uppercase text-sm">?" Audrey Hepburn</p>
                  <div className="mt-8 inline-flex items-center gap-2 text-xs font-medium text-stone-500 bg-stone-200/50 dark:bg-stone-800/50 px-3 py-1.5 rounded-full">
                    <Sparkles className="h-3 w-3" /> Click to flip
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Back - Source & Context */}
            <Card 
              className="absolute inset-0 bg-primary/5 border-primary/20 rotate-y-180 shadow-lg"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <CardContent className="h-full flex flex-col items-center justify-center p-8 text-center">
                <Heart className="h-10 w-10 text-primary mb-6" />
                <h3 className="text-2xl font-bold mb-4">The Two Hands Philosophy</h3>
                <p className="text-muted-foreground text-base leading-relaxed mb-6 max-w-md">
                  Audrey Hepburn lived this philosophy. After decades of film stardom, 
                  she dedicated her later years to UNICEF, helping children in need around the world.
                </p>
                <p className="text-primary text-lg font-semibold mb-8">
                  One hand builds. One hand gives. Both are needed.
                </p>
                <a 
                  href="https://economictimes.indiatimes.com/news/international/us/quote-of-the-day-february-24-quote-of-the-day-by-audrey-hepburn-as-you-grow-older-you-will-discover-that-you-have-two-hands-one-for-helping/articleshow/128747800.cms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-4 w-4" />
                  Source: Economic Times
                </a>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Philosophy Pillars */}
        <div className="space-y-8 pt-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">The Four Pillars</h2>
            <p className="text-muted-foreground text-lg">
              How we put "Help Each Other Help Ourselves" into practice
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {philosophyPillars.map((pillar, idx) => (
              <Card key={idx} className="border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-6 flex gap-4 items-start">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <pillar.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{pillar.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator className="my-12" />

        {/* Action Items Grid */}
        <div className="space-y-8 pb-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Take Action Now</h2>
            <p className="text-muted-foreground text-lg">
              The philosophy only works if we act on it. Choose your path.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {actionItems.map((item, i) => (
              <Card key={i} className="flex flex-col hover:shadow-md transition-all hover:-translate-y-1">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${item.bg}`}>
                    <item.icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-4">
                  <Button 
                    className="w-full gap-2" 
                    variant="outline"
                    onClick={() => navigate(item.route)}
                  >
                    {item.action} <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
      </div>
    </PortalPageLayout>
  );
}
