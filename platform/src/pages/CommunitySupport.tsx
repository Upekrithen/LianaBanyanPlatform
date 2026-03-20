/**
 * COMMUNITY SUPPORT PAGE
 * ======================
 * Route: /support
 *
 * Following Imgur's model: community-driven support via Stack Overflow.
 * No private ticket system — everything is public, searchable, and
 * community-driven. Members help members. Engineers monitor the tag.
 *
 * Layout:
 *   - Hero section explaining the community-first support model
 *   - Stack Overflow feed widget (search + browse)
 *   - Quick links: Ask a question, browse by topic, Didasko learning
 *   - FAQ section pulling from tagged SO answers
 *   - Integration callouts (Harper Guild verification, Didasko tutorials)
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  HelpCircle,
  ExternalLink,
  BookOpen,
  Shield,
  Users,
  ArrowUpRight,
  MessageSquare,
  Lightbulb,
  GraduationCap,
  Scale,
  Rss,
} from "lucide-react";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { StackOverflowFeedWidget } from "@/components/StackOverflowFeedWidget";
import {
  SO_TAG_URL,
  generateAskUrl,
  FEATURE_TAG_MAP,
  LB_TAG,
} from "@/lib/stackOverflowService";

// ─── Topic Quick Links ────────────────────────────────────────────────────────

const SUPPORT_TOPICS = [
  {
    label: "Getting Started",
    icon: <Lightbulb className="h-4 w-4" />,
    tags: ["getting-started"],
    description: "Onboarding, first steps, account setup",
  },
  {
    label: "Portfolio & Deck Cards",
    icon: <BookOpen className="h-4 w-4" />,
    tags: ["portfolio", "deck-card"],
    description: "Building your portfolio, creating deck cards",
  },
  {
    label: "HexIsle",
    icon: <MessageSquare className="h-4 w-4" />,
    tags: ["hexagonal-grid", "game-development"],
    description: "Island creation, terrain system, quests",
  },
  {
    label: "Commerce & Currency",
    icon: <Scale className="h-4 w-4" />,
    tags: ["payment", "stripe"],
    description: "Credits, Marks, Joules, payment rails",
  },
  {
    label: "API & Integrations",
    icon: <Rss className="h-4 w-4" />,
    tags: ["supabase", "firebase"],
    description: "Supabase, Firebase, OAuth, social plugs",
  },
  {
    label: "Governance",
    icon: <Shield className="h-4 w-4" />,
    tags: ["voting", "governance"],
    description: "Proposals, voting, Harper Guild, DNA Lock",
  },
];

export default function CommunitySupport() {
  return (
    <PortalPageLayout maxWidth="lg" xrayId="community-support-page">
      {/* Hero Section */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-orange-500 rounded-full text-white">
          <HelpCircle className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground dark:text-white">
            Community Support
          </h1>
          <p className="text-lg text-muted-foreground dark:text-slate-400">
            Public Q&A powered by Stack Overflow. Members help members.
          </p>
        </div>
      </div>

      {/* Philosophy Banner */}
      <Card className="mb-8 border-orange-200 dark:border-orange-900 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Users className="h-6 w-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-orange-800 dark:text-orange-300 mb-1">
                Why Stack Overflow?
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-400">
                Every question you ask becomes permanent, searchable documentation. Every
                answer you give helps the next person with the same problem. Community
                voting surfaces the best answers. Engineers monitor the tag. This is
                support that scales — publicly, transparently, and for free.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline" className="border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-400">
                  Public & Searchable
                </Badge>
                <Badge variant="outline" className="border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-400">
                  Community Voting
                </Badge>
                <Badge variant="outline" className="border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-400">
                  Engineer Monitored
                </Badge>
                <Badge variant="outline" className="border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-400">
                  Zero Support Tickets
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Feed Widget (spans 2 cols) */}
        <div className="lg:col-span-2">
          <StackOverflowFeedWidget
            maxQuestions={15}
            showSearch={true}
            showAskButton={true}
            className="h-full"
          />
        </div>

        {/* Right Column: Quick Links & Topics */}
        <div className="space-y-6">
          {/* Ask a Question CTA */}
          <Card className="border-emerald-200 dark:border-emerald-900">
            <CardContent className="pt-6 text-center">
              <MessageSquare className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
              <h3 className="font-bold mb-1">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Ask a question on Stack Overflow with the [{LB_TAG}] tag.
                The community and our engineers will help.
              </p>
              <a
                href={generateAskUrl()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white group">
                  Ask a Question
                  <ArrowUpRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* Browse by Topic */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Browse by Topic</CardTitle>
              <CardDescription className="text-xs">
                Find answers by area
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                {SUPPORT_TOPICS.map((topic) => (
                  <a
                    key={topic.label}
                    href={`https://stackoverflow.com/questions/tagged/${[LB_TAG, ...topic.tags].join("+")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 py-2 px-2 rounded-md hover:bg-muted/40 transition-colors group"
                  >
                    <span className="text-muted-foreground group-hover:text-primary transition-colors">
                      {topic.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {topic.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {topic.description}
                      </p>
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Integration Callouts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Connected Systems</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="flex items-start gap-2">
                <GraduationCap className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Didasko</p>
                  <p className="text-xs text-muted-foreground">
                    Tutorial questions feed into learning paths
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-violet-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Harper Guild</p>
                  <p className="text-xs text-muted-foreground">
                    Verified answers from platform engineers
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Rss className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">RSS Feed</p>
                  <p className="text-xs text-muted-foreground">
                    Subscribe to new questions via RSS
                  </p>
                  <a
                    href={`https://stackoverflow.com/feeds/tag/${LB_TAG}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    Get RSS Feed →
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalPageLayout>
  );
}
