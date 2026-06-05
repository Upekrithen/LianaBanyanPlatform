/**
 * Progress Report 1 -- BP072 Wave 3 / Scope 5
 * ============================================
 * Marks the first major cooperative milestone.
 * Contains two placeholders pending Founder action:
 *   1. Mikey-hire announcement (bounty filled / first hire)
 *   2. "Learning to Fly" one-take-wonder video embed
 *
 * This page lives at /progress/1 and is linkable from the
 * Anthology banner and member announcements.
 */
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCanonicalStats } from "@/hooks/useCanonicalStats";
import { Link } from "react-router-dom";
import { FileVideo, Users, ArrowRight, Clock } from "lucide-react";
import { VideoPlaceholderStub } from "@/components/VideoPlaceholderStub";

export default function ProgressReport1Page() {
  const { t } = useTranslation();
  const stats = useCanonicalStats();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="max-w-3xl mx-auto px-4 pt-16 pb-8">
        <Badge variant="outline" className="mb-4 text-sm px-4 py-1">Progress Report No. 1</Badge>
        <h1 className="text-4xl font-bold text-slate-900 mb-3">
          First Things First
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          {stats.innovationCount.toLocaleString()} innovations.
          {" "}{stats.crownJewels} Crown Jewels.
          {" "}{stats.patentApplications} provisional patent applications.
          One founder. Four AI agents. And now -- the first hire.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 space-y-8 pb-20">

        {/* Mikey Hire Placeholder */}
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-emerald-100">
                <Users className="w-5 h-5 text-emerald-700" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-semibold text-emerald-900">
                    First Hire: Mikey
                  </h2>
                  {/* FOUNDER: Replace this badge when the bounty is filled */}
                  <Badge className="bg-amber-100 text-amber-800 text-xs">
                    FOUNDER: Update when bounty fills
                  </Badge>
                </div>
                <p className="text-emerald-800 leading-relaxed mb-4">
                  {/*
                    FOUNDER: Replace the paragraph below with the actual Mikey hire
                    announcement once the bounty is filled. Include:
                    - What Mikey does / role
                    - How the bounty worked
                    - Marks earned for first work
                    - Quote from Mikey (optional)
                  */}
                  [FOUNDER: Mikey hire announcement -- fill when bounty is completed.
                  Describe role, first contribution, and Marks earned. This is the
                  cooperative's first real hire powered by the Marks system.]
                </p>
                <div className="text-sm text-emerald-700 bg-emerald-100/80 rounded-md p-3">
                  <strong>How it worked:</strong> The Mikey Bounty (Scope 11) posted a
                  specific task with Marks as compensation. Completing the task
                  earned Mikey cooperative Marks -- participation in the platform,
                  not equity or guaranteed payout. The Business Plan template
                  (Scope 12) provides a reusable model for future bounty-to-hire paths.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning to Fly Video Placeholder */}
        <Card className="border-violet-200 bg-violet-50/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-violet-100">
                <FileVideo className="w-5 h-5 text-violet-700" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-semibold text-violet-900">
                    "Learning to Fly" -- One-Take Wonder
                  </h2>
                  {/* FOUNDER: Replace this badge when the video is filmed */}
                  <Badge className="bg-amber-100 text-amber-800 text-xs">
                    FOUNDER: Add video embed
                  </Badge>
                </div>
                <p className="text-violet-800 leading-relaxed mb-4">
                  {/*
                    FOUNDER: Replace this block with:
                    - The actual video embed (YouTube, Vimeo, or self-hosted)
                    - Or an iframe: <iframe src="..." ... />
                    - Or a link: <a href="video-url">Watch the one-take video</a>
                    One take. No editing. Raw cooperative truth.
                  */}
                  [FOUNDER: Embed the "Learning to Fly" one-take video here.
                  Raw, unedited, one-take. This is the kind of transparency
                  that makes the cooperative real.]
                </p>
                <VideoPlaceholderStub
                  title="Learning to Fly — One-Take Wonder cooperative video"
                  transcriptStub="[FOUNDER: embed the one-take video here. Transcript stub: The Founder records a raw, unedited one-take video about the cooperative journey — no scripting, no editing, transparent cooperative truth. A full transcript will accompany the published video.]"
                  className="border border-violet-200 rounded-lg overflow-hidden"
                >
                  <div className="text-center text-violet-500">
                    <FileVideo className="w-12 h-12 mx-auto mb-2 opacity-50" aria-hidden="true" />
                    <p className="text-sm">Video placeholder -- FOUNDER: embed when ready</p>
                  </div>
                </VideoPlaceholderStub>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What This Moment Means */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900">
              What This Moment Represents
            </h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700 leading-relaxed mb-4">
                Progress Report 1 is not a press release. It is a receipt. The cooperative
                exists. The Marks system works. The bounty flow -- from posted task to
                completed work to earned Marks -- has been tested against a real person
                doing real work.
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                {stats.innovationCount.toLocaleString()} innovations span food, manufacturing,
                services, local business, guilds, tribes, healthcare, and education.
                {" "}{stats.crownJewels} Crown Jewels represent the architecture nobody else
                built. {stats.patentApplications} provisional applications protect the
                innovations that cannot be replicated. And 83.3% of platform economics
                flows to creators -- locked into the architecture, not policy.
              </p>
              <p className="text-slate-700 leading-relaxed">
                The first hire is the proof that the economics work for people, not just
                for the ledger. Mikey is the first. There will be more.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild>
            <Link to="/join">
              Join the Cooperative -- $5/year
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/anthology">
              Anthology of Persistent Effort
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/press">
              Press Room
            </Link>
          </Button>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="w-3 h-3" />
          <span>Progress Report 1 -- Published June 2026</span>
        </div>
      </div>
    </div>
  );
}
