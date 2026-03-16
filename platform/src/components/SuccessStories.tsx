/**
 * SUCCESS STORIES — Opt-in shareable achievements
 * =================================================
 * Shows completed production runs, node launches, and member milestones.
 * Members choose whether to share their story publicly.
 */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Factory,
  Users,
  Star,
  ChefHat,
  ShoppingCart,
  Sparkles,
} from "lucide-react";

export interface SuccessStory {
  id: string;
  type: "production_run" | "node_launch" | "milestone";
  title: string;
  description: string;
  metric: string;
  metricValue: string;
  icon: string;
  makerHandle?: string;
  location?: string;
  dateCompleted: string;
  sharedByName?: string; // Only shown if member opts in
  isAnonymous: boolean;
}

// Sample success stories (would come from DB in production)
const SAMPLE_STORIES: SuccessStory[] = [
  {
    id: "ss-001",
    type: "production_run",
    title: "Monstera Coaster Set — 500 Units Shipped!",
    description: "ForgeCore Co's botanical coasters hit 500 pre-orders in 11 days. Every backer received their set within 3 weeks of production start.",
    metric: "Units shipped",
    metricValue: "500",
    icon: "🌿",
    makerHandle: "@forgecoreco",
    dateCompleted: "Coming soon",
    isAnonymous: false,
  },
  {
    id: "ss-002",
    type: "node_launch",
    title: "First Kitchen Node — Phoenix, AZ",
    description: "Started with Sunday meal prep for 5 families. Now serving 80+ meals/week from a church kitchen that was empty 5 days a week.",
    metric: "Meals/week",
    metricValue: "80+",
    icon: "🍳",
    location: "Phoenix, AZ",
    dateCompleted: "Coming soon",
    sharedByName: "Captain Maria",
    isAnonymous: false,
  },
  {
    id: "ss-003",
    type: "node_launch",
    title: "Grocery Run Hub — 15 Families Saving 25%",
    description: "One person offering to pick up groceries for a neighbor turned into a weekly bulk-buy operation serving the whole block.",
    metric: "Avg savings",
    metricValue: "25%",
    icon: "🛒",
    location: "Surprise, AZ",
    dateCompleted: "Coming soon",
    isAnonymous: true,
  },
  {
    id: "ss-004",
    type: "production_run",
    title: "Cyber Cat Headphone Stand — Funded in 8 Days",
    description: "KrakDrag 3D's cyberpunk headphone holder went from proposal to fully funded. 500 backers, 112 in the First 100 bonus tier.",
    metric: "Days to fund",
    metricValue: "8",
    icon: "🐱",
    makerHandle: "@krakdrag3d",
    dateCompleted: "Coming soon",
    isAnonymous: false,
  },
  {
    id: "ss-005",
    type: "milestone",
    title: "First Process Pioneer — Slip Casting",
    description: "Hammerly Ceramics established the first slip casting production path on the platform. Their process documentation helps every ceramicist who follows.",
    metric: "Followers trained",
    metricValue: "12",
    icon: "☕",
    makerHandle: "@hammerlyceramics",
    dateCompleted: "Coming soon",
    isAnonymous: false,
  },
];

const TYPE_ICONS = {
  production_run: Factory,
  node_launch: Users,
  milestone: Trophy,
};

const TYPE_COLORS = {
  production_run: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  node_launch: "bg-green-500/10 text-green-400 border-green-500/30",
  milestone: "bg-amber-500/10 text-amber-400 border-amber-500/30",
};

const TYPE_LABELS = {
  production_run: "Production Run",
  node_launch: "Node Launch",
  milestone: "Milestone",
};

interface SuccessStoriesProps {
  maxItems?: number;
  filter?: "all" | "production_run" | "node_launch" | "milestone";
  compact?: boolean;
}

export function SuccessStories({
  maxItems,
  filter = "all",
  compact = false,
}: SuccessStoriesProps) {
  const stories =
    filter === "all"
      ? SAMPLE_STORIES
      : SAMPLE_STORIES.filter((s) => s.type === filter);

  const displayStories = maxItems ? stories.slice(0, maxItems) : stories;

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            Success Stories
          </h3>
          <p className="text-muted-foreground mt-1">
            Real results from real members. Shared because they chose to.
          </p>
        </div>
      )}

      <div className={compact ? "space-y-3" : "grid gap-4 md:grid-cols-2 lg:grid-cols-3"}>
        {displayStories.map((story) => {
          const TypeIcon = TYPE_ICONS[story.type];

          return (
            <Card
              key={story.id}
              className="border-border hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Colored top strip */}
              <div
                className={`h-1 ${
                  story.type === "production_run"
                    ? "bg-blue-500"
                    : story.type === "node_launch"
                    ? "bg-green-500"
                    : "bg-amber-500"
                }`}
              />

              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{story.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={`text-xs ${TYPE_COLORS[story.type]}`}
                      >
                        <TypeIcon className="w-3 h-3 mr-1" />
                        {TYPE_LABELS[story.type]}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-sm mt-1.5">{story.title}</h4>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">{story.description}</p>

                {/* Key metric */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 border border-border">
                  <span className="text-xs text-muted-foreground">{story.metric}</span>
                  <span className="text-lg font-bold text-primary">{story.metricValue}</span>
                </div>

                {/* Attribution */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {story.isAnonymous
                      ? "Shared anonymously"
                      : story.sharedByName
                      ? `Shared by ${story.sharedByName}`
                      : story.makerHandle
                      ? `Maker: ${story.makerHandle}`
                      : ""}
                  </span>
                  {story.location && (
                    <span className="flex items-center gap-1">📍 {story.location}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
