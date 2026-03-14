/**
 * DeveloperPortal — Platform Extensibility & Developer Resources
 * ===============================================================
 * Public page for third-party developers, API consumers,
 * and community contributors.
 *
 * Phase 1: Information + links + contribution paths
 * Phase 2: API key self-service, sandbox, SDK docs
 */

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Code2,
  BookOpen,
  GitBranch,
  Wrench,
  Shield,
  Users,
  ExternalLink,
  Lightbulb,
  Terminal,
  Puzzle,
  Briefcase,
  Link as LinkIcon
} from "lucide-react";

const DEVELOPER_SECTIONS = [
  {
    icon: Code2,
    title: "XML Module API",
    description: "Embed HexIsle data, patent information, and platform content on any website via our public XML API endpoints.",
    status: "Live",
    statusColor: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    links: [
      { label: "API Documentation", route: "/sample-xml" },
    ],
  },
  {
    icon: Puzzle,
    title: "Platform Add-ons",
    description: "Build add-ons that integrate with the Liana Banyan ecosystem. Project templates, custom workflows, and data connectors.",
    status: "Coming Soon",
    statusColor: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    links: [],
  },
  {
    icon: Terminal,
    title: "SDK & Client Libraries",
    description: "TypeScript/JavaScript SDK for interacting with platform services. Authentication, project management, and bounty system APIs.",
    status: "Planned",
    statusColor: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    links: [],
  },
  {
    icon: GitBranch,
    title: "Open Source Components",
    description: "Core UI components, the HexIsle grammar system, and CAD tooling are available for community contribution and review.",
    status: "Partial",
    statusColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    links: [
      { label: "Hexel Piece Grammar", route: "/hexisle/encyclopedia" },
    ],
  },
];

const CONTRIBUTION_PATHS = [
  {
    icon: Wrench,
    title: "Bounty Contributors",
    description: "Pick up platform development bounties. Earn Marks (effort-debt currency) for completed work. No cash outlay required on either side.",
    route: "/help-wanted",
    cta: "Browse Bounties",
  },
  {
    icon: Users,
    title: "Helm Councils",
    description: "Each platform category (food, manufacturing, health, etc.) has elected Helmsmen who guide technical direction. Focus Groups propose, councils decide.",
    route: "/governance",
    cta: "Learn About Governance",
  },
  {
    icon: Shield,
    title: "Harper Guild",
    description: "Ethics checkers and truth-tellers. The Harper Guild reviews platform integrity, audits claims, and ensures the Switzerland Rule is upheld.",
    route: "/governance",
    cta: "Meet The 300",
  },
  {
    icon: Lightbulb,
    title: "Innovation Submissions",
    description: "Proposed innovations go through the THRESHING process for extraction and the Hall of Innovations for documentation. 1,639 and counting.",
    route: "/hall-of-innovations",
    cta: "Hall of Innovations",
  },
];

export default function DeveloperPortal() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-b from-primary/5 to-background border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-primary/10 rounded-full">
            <Code2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Developer Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Build on Liana Banyan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            The platform is designed to be extended. APIs, bounties, open components, and governance councils
            — everything you need to build, contribute, and shape the ecosystem.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link to="/help-wanted">Browse Bounties</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/sample-xml">API Docs</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Developer Resources */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-2xl font-bold mb-2">Developer Resources</h2>
        <p className="text-muted-foreground mb-8">
          APIs, SDKs, and tools for building on the platform.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {DEVELOPER_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.title} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${section.statusColor}`}>
                      {section.status}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                {section.links.length > 0 && (
                  <CardContent className="mt-auto pt-0">
                    <div className="flex flex-wrap gap-2">
                      {section.links.map((link) => (
                        <Button key={link.label} variant="outline" size="sm" asChild>
                          <Link to={link.route} className="gap-1.5">
                            <BookOpen className="h-3.5 w-3.5" />
                            {link.label}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Integration Ecosystem */}
        <div className="bg-muted/30 border-y py-16 mb-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-4">Developer Bounty Marketplace</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Innovation #1560: Connect external talent pools directly to Liana Banyan projects. Build plugins that sync our internal bounty system with external marketplaces.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: "Indeed Integration", status: "Bounty Open", reward: "500 Marks", icon: Briefcase },
                { name: "LinkedIn Jobs Sync", status: "Bounty Open", reward: "450 Marks", icon: LinkIcon },
                { name: "Fiverr Connect", status: "In Progress", reward: "Claimed", icon: Puzzle },
                { name: "Guru Bridge", status: "Bounty Open", reward: "300 Marks", icon: Briefcase },
              ].map((plugin) => (
                <Card key={plugin.name} className="flex flex-col items-center text-center p-6 hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <plugin.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{plugin.name}</h3>
                  <div className="mt-auto flex flex-col gap-2 w-full">
                    <span className="text-xs text-muted-foreground">{plugin.status}</span>
                    <Button variant={plugin.status === "Bounty Open" ? "default" : "secondary"} size="sm" className="w-full">
                      {plugin.reward}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Contribution Paths */}
        <h2 className="text-2xl font-bold mb-2">Ways to Contribute</h2>
        <p className="text-muted-foreground mb-8">
          You don't need to be a developer to make an impact.
          Bounties, governance, ethics review, and innovation are all open to the community.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {CONTRIBUTION_PATHS.map((path) => {
            const Icon = path.icon;
            return (
              <Card key={path.title} className="flex flex-col">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mb-2">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <CardTitle className="text-lg">{path.title}</CardTitle>
                  <CardDescription>{path.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-0">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={path.route}>{path.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTO / Focus Group note */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Technical Leadership</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Each platform category is guided by elected Helmsmen and Focus Groups.
                  They propose technical direction, review contributions, and ensure quality.
                  Think of it as distributed CTO responsibility — no single person controls everything.
                </p>
                <p className="text-sm text-muted-foreground">
                  Active councils: Manufacturing (HexIsle), Food Systems (Let's Make Dinner),
                  Health (LifeLine Medications), Governance (The 300), Education (Didasko).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
