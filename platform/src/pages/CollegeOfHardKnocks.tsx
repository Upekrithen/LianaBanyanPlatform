import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Wrench,
  MessageSquare,
  Youtube,
  Award,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  Search,
  Flame,
  ShieldCheck,
  ExternalLink
} from "lucide-react";
import { PortalPageLayout } from "@/components/PortalPageLayout";

export default function CollegeOfHardKnocks() {
  const [searchQuery, setSearchQuery] = useState("");

  const consensusThreads = [
    {
      id: 1,
      title: "How to actually fix a leaky Tereno valve (without breaking the seal)",
      author: "PlumberJoe99",
      badges: ["Master Wrench", "Top Helper"],
      upvotes: 342,
      comments: 56,
      verified: true,
      platform: "Reddit Integration",
      preview: "I see a lot of people trying to force the seal. DON'T. You need to heat it slightly first..."
    },
    {
      id: 2,
      title: "Best settings for the 3D Rendition First Experience on low-end hardware?",
      author: "OptiMax",
      badges: ["Guide"],
      upvotes: 128,
      comments: 89,
      verified: false,
      platform: "Discord Sync",
      preview: "Turn off volumetric fog and drop shadow resolution to 512. Here is the config file..."
    },
    {
      id: 3,
      title: "Cost+20% Accounting: How to handle fluctuating material costs mid-project",
      author: "SarahBuilds",
      badges: ["Ledger Keeper", "Verified Pro"],
      upvotes: 512,
      comments: 112,
      verified: true,
      platform: "Native Forum",
      preview: "The key is the Escrow-Based Commitment. If materials spike, you trigger a re-eval node..."
    }
  ];

  const curatedTutorials = [
    {
      id: 1,
      title: "HexIsle Mechanics Explained in 5 Minutes",
      curator: "GameTheoryDan",
      views: "12.4k",
      helpfulScore: "98%",
      thumbnail: "bg-slate-800"
    },
    {
      id: 2,
      title: "Step-by-Step: Registering your first Service Node",
      curator: "NodeNinja",
      views: "8.1k",
      helpfulScore: "95%",
      thumbnail: "bg-slate-700"
    },
    {
      id: 3,
      title: "The Santa Ever After Protocol - A Visual Guide",
      curator: "LogisticsPro",
      views: "45.2k",
      helpfulScore: "99%",
      thumbnail: "bg-slate-800"
    }
  ];

  return (
    <PortalPageLayout maxWidth="xl" xrayId="college-hard-knocks-page">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-amber-600 rounded-xl text-white shadow-lg shadow-amber-900/20">
            <Wrench className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground dark:text-white tracking-tight">
              College of Hard Knocks
            </h1>
            <p className="text-lg text-muted-foreground dark:text-slate-400 mt-1">
              Real-world consensus, curated tutorials, and badges for those who help.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-muted dark:bg-slate-800 p-2 rounded-lg border border-border dark:border-slate-700">
          <Flame className="text-orange-500 w-5 h-5" />
          <span className="text-sm font-medium pr-2">1,402 Active Helpers Today</span>
        </div>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search for 'How to...', error codes, or verified solutions..."
          className="pl-12 h-14 text-lg bg-white dark:bg-slate-900 border-border dark:border-slate-700 shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="consensus" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 h-14 bg-muted dark:bg-slate-800/50">
          <TabsTrigger value="consensus" className="text-base data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
            <MessageSquare className="w-4 h-4 mr-2" />
            Consensus Threads
          </TabsTrigger>
          <TabsTrigger value="tutorials" className="text-base data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
            <Youtube className="w-4 h-4 mr-2" />
            Curated Tutorials
          </TabsTrigger>
          <TabsTrigger value="badges" className="text-base data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
            <Award className="w-4 h-4 mr-2" />
            Hall of Helpers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="consensus" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <MessageSquare className="text-blue-500" />
              Aggregated Discussions (Reddit/Discord/Native)
            </h2>
            <Button variant="outline" size="sm">Post a Question</Button>
          </div>

            {consensusThreads.map(thread => (
              <Card key={thread.id} className={`hover:border-blue-500/50 transition-colors ${thread.verified ? 'border-l-4 border-l-emerald-500' : ''}`}>
                <CardContent className="p-6">
                <div className="flex gap-6">
                  <div className="flex flex-col items-center gap-2 min-w-[60px]">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                      <ThumbsUp className="w-4 h-4" />
                    </Button>
                    <span className="font-bold text-lg">{thread.upvotes}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <ThumbsDown className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex-grow">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-foreground dark:text-white leading-tight">
                        {thread.title}
                      </h3>
                      {thread.verified && (
                        <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 flex items-center gap-1 ml-4 shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified Solution
                        </Badge>
                      )}
                    </div>

                    <p className="text-muted-foreground dark:text-slate-400 mb-4 line-clamp-2">
                      {thread.preview}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground dark:text-slate-400">
                      <span className="font-medium text-blue-600 dark:text-blue-400">@{thread.author}</span>
                      <div className="flex gap-1">
                        {thread.badges.map(badge => (
                          <Badge key={badge} variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                      <span className="flex items-center gap-1 ml-auto">
                        <MessageSquare className="w-4 h-4" />
                        {thread.comments} comments
                      </span>
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4" />
                        {thread.platform}
                      </span>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View Thread
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="tutorials" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Youtube className="text-red-500" />
              Member-Curated YouTube & Video Guides
            </h2>
            <Button variant="outline" size="sm">Submit a Tutorial</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {curatedTutorials.map(tutorial => (
                <Card key={tutorial.id} className="overflow-hidden hover:shadow-lg transition-all group cursor-pointer">
                  <div className={`h-48 ${tutorial.thumbnail} relative flex items-center justify-center group-hover:opacity-90 transition-opacity`}>
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Youtube className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {tutorial.helpfulScore} Helpful
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-500 transition-colors">
                    {tutorial.title}
                  </h3>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Curated by <span className="font-medium text-foreground">{tutorial.curator}</span></span>
                    <span>{tutorial.views} views</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="badges">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="text-amber-500" />
                The Honor Roll
              </CardTitle>
              <CardDescription>
                Earn badges by providing verified solutions, curating high-quality tutorials, and helping others navigate the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border border-border dark:border-slate-800 rounded-xl text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-bold">Verified Solver</h4>
                  <p className="text-xs text-muted-foreground mt-1">Provided 10+ solutions marked as verified by the community.</p>
                </div>
                <div className="p-4 border border-border dark:border-slate-800 rounded-xl text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-3">
                    <Wrench className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h4 className="font-bold">Master Wrench</h4>
                  <p className="text-xs text-muted-foreground mt-1">Top 5% contributor in technical and physical mechanics threads.</p>
                </div>
                <div className="p-4 border border-border dark:border-slate-800 rounded-xl text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-3">
                    <Youtube className="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>
                  <h4 className="font-bold">Curator</h4>
                  <p className="text-xs text-muted-foreground mt-1">Submitted 5+ tutorials that maintained a &gt;90% helpful rating.</p>
                </div>
                <div className="p-4 border border-border dark:border-slate-800 rounded-xl text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3">
                    <Award className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-bold">College Dean</h4>
                  <p className="text-xs text-muted-foreground mt-1">Maintained top helper status across multiple categories for 6 months.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PortalPageLayout>
  );
}
