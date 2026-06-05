/**
 * Social Announcement Set -- BP072 Wave 3 / Scope 6
 * ==================================================
 * Thursday-gated (NYT exclusivity window).
 * No comment replies. Substack list is home base.
 * Ends with bare reference: Proverbs 26:4,5
 *
 * HELD until NYT Guest Essay exclusivity window clears (Thursday gate).
 * FOUNDER: review and approve each post before scheduling.
 *
 * Route: /staff/social-announcement-set (staff only)
 *
 * These are the TEMPLATES. Actual scheduling happens through the
 * social media dispatch system (MoneyPenny / UniversalDispatch).
 */
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCanonicalStats } from "@/hooks/useCanonicalStats";
import { Lock, Clock, Copy, Check } from "lucide-react";
import { useState } from "react";

interface Post {
  id: string;
  platform: string;
  charLimit?: number;
  body: string;
  note: string;
  gate: "thursday" | "immediate";
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="ghost" size="sm" onClick={copy} className="gap-1">
      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

export default function SocialAnnouncementSet() {
  const stats = useCanonicalStats();

  const posts: Post[] = [
    {
      id: "twitter-1",
      platform: "X (Twitter)",
      charLimit: 280,
      note: "Lead post. Goes live after NYT exclusivity window (Thursday).",
      gate: "thursday",
      body:
        `${stats.innovationCount.toLocaleString()} innovations. ` +
        `${stats.crownJewels} Crown Jewels. ` +
        `${stats.patentApplications} provisional patents. ` +
        `$${stats.membershipCost}/year.\n\n` +
        `One cooperative that cannot enshittify. Built by a veteran and father of eight.\n\n` +
        `No ads. No VC. No extraction.\n\n` +
        `lianabanyan.com`,
    },
    {
      id: "twitter-2",
      platform: "X (Twitter) -- Thread post 2",
      charLimit: 280,
      note: "Follow-on thread post. How the economics work.",
      gate: "thursday",
      body:
        `The math: 83.3% of platform revenue goes to creators. Locked into the architecture, not policy.\n\n` +
        `Cost+20% is not a promise. It is a constitutional constraint. Future leadership cannot change it.\n\n` +
        `That is what structural protection looks like.`,
    },
    {
      id: "twitter-3",
      platform: "X (Twitter) -- Thread post 3",
      charLimit: 280,
      note: "Closing thread post. Substack as home. Proverbs reference (bare -- no explanation).",
      gate: "thursday",
      body:
        `No comment replies here.\n\n` +
        `The Substack newsletter is home base for long-form updates. ` +
        `Membership is $5/year.\n\n` +
        `Proverbs 26:4,5`,
    },
    {
      id: "linkedin-1",
      platform: "LinkedIn",
      note: "Professional announcement. Guild Masters audience. No comment reply dependency.",
      gate: "thursday",
      body:
        `I built a cooperative platform over 37 years -- 1989 to 2026.\n\n` +
        `It has ${stats.innovationCount.toLocaleString()} documented innovations, ` +
        `${stats.crownJewels} Crown Jewels, ` +
        `and ${stats.patentApplications} provisional patent applications covering ` +
        `approximately 2,473 formal claims.\n\n` +
        `The core economics: creators keep 83.3% of what they earn. ` +
        `Cost+20% is baked into the architecture. It cannot be extracted away by ` +
        `future investors because there are no investors to answer to.\n\n` +
        `Membership is $5/year. The first hire happened via the cooperative Marks system. ` +
        `The platform is live.\n\n` +
        `For long-form context: the Substack newsletter at lianabanyan.substack.com ` +
        `is the home base. I do not reply to DMs or comments -- the newsletter is where ` +
        `the updates live.\n\n` +
        `lianabanyan.com\n\n` +
        `Proverbs 26:4,5`,
    },
    {
      id: "substack-note-1",
      platform: "Substack Notes",
      note: "First Substack Note. Brief -- points to the main newsletter. Publish Thursday.",
      gate: "thursday",
      body:
        `The cooperative is live.\n\n` +
        `${stats.innovationCount.toLocaleString()} innovations. ` +
        `${stats.crownJewels} Crown Jewels. ` +
        `$${stats.membershipCost}/year.\n\n` +
        `The Substack list is home base for updates. No comment replies anywhere. ` +
        `Everything substantive goes to subscribers first.\n\n` +
        `More in the newsletter.`,
    },
    {
      id: "mastodon-1",
      platform: "Mastodon / Fediverse",
      charLimit: 500,
      note: "Fediverse-native announcement. Open standards framing resonates here.",
      gate: "thursday",
      body:
        `A cooperative platform built on open standards, user sovereignty, and 37 years of persistent effort.\n\n` +
        `${stats.innovationCount.toLocaleString()} innovations. ` +
        `${stats.crownJewels} Crown Jewels. ` +
        `$${stats.membershipCost}/year. ` +
        `83.3% of revenue to creators.\n\n` +
        `No ads. No VC. No extraction. No comment replies from this account.\n\n` +
        `Newsletter: lianabanyan.substack.com\n` +
        `Platform: lianabanyan.com\n\n` +
        `Proverbs 26:4,5`,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-3xl mx-auto px-4 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <Badge className="bg-amber-100 text-amber-800 gap-1">
            <Lock className="w-3 h-3" /> Thursday Gate -- NYT Exclusivity
          </Badge>
          <Badge className="bg-slate-100 text-slate-700 gap-1">
            <Clock className="w-3 h-3" /> Staff Only
          </Badge>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Social Announcement Set
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          These posts go live after the NYT Guest Essay exclusivity window clears (Thursday).
          No comment replies. No DM dependency. Substack list is home base.
          Each post ends with Proverbs 26:4,5 -- bare reference, no explanation.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 space-y-4 pb-20">
        {posts.map((post) => (
          <Card key={post.id} className={post.gate === "thursday" ? "border-amber-200" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{post.platform}</CardTitle>
                <div className="flex items-center gap-2">
                  {post.charLimit && (
                    <span className="text-xs text-slate-400">
                      {post.body.length}/{post.charLimit} chars
                    </span>
                  )}
                  <CopyButton text={post.body} />
                </div>
              </div>
              <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
                {post.note}
              </p>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm text-slate-700 bg-slate-50 rounded-lg p-4 font-sans leading-relaxed border border-slate-200">
                {post.body}
              </pre>
            </CardContent>
          </Card>
        ))}

        {/* Doctrine reminder */}
        <div className="text-xs text-slate-400 text-center leading-relaxed p-4 border border-dashed border-slate-200 rounded-lg">
          <strong>Doctrine:</strong> No comment replies from any platform account. {" "}
          Substack newsletter is the home base for substantive updates. {" "}
          Proverbs 26:4,5 closes the set -- bare reference, no explanation, no commentary.
          FOUNDER reviews and schedules each post individually.
        </div>
      </div>
    </div>
  );
}
