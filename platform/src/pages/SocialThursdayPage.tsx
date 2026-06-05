/**
 * SocialThursdayPage — Wave 6 Phase W
 * ======================================
 * Social Thursday set wiring (Thursday-gated).
 * Route: /outreach/social-thursday
 *
 * HELD - Thursday gate. Staged only, do not publish until authorized.
 */
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Lock, Calendar, Share2, Twitter, Linkedin } from "lucide-react";
import { PortalPageLayout } from "@/components/PortalPageLayout";

const SOCIAL_POSTS = [
  {
    id: "launch-1",
    platform: "Twitter/X",
    icon: Twitter,
    content:
      "LianaBanyan is live. 16 cooperative initiatives. 2,270 innovations. 228 Crown Jewels. $5/year membership - one price, no tiers, lifetime guarantee at signup price. [link]",
    gate: "Thursday gate",
    held: true,
  },
  {
    id: "launch-2",
    platform: "Twitter/X",
    icon: Twitter,
    content:
      "Every creator and worker on LianaBanyan keeps 83.3% of every transaction. Constitutionally locked - no board vote can change it. The cooperative way.",
    gate: "Thursday gate",
    held: true,
  },
  {
    id: "launch-3",
    platform: "LinkedIn",
    icon: Linkedin,
    content:
      "We built the cooperative economy we needed to see. 16 initiatives, 7 spinouts, a decentralized factory network, and a $5/year membership that is identical for every member. No tiers. No early-adopter pricing. The same deal for everyone, forever.",
    gate: "Thursday gate",
    held: true,
  },
];

export default function SocialThursdayPage() {
  const navigate = useNavigate();

  return (
    <PortalPageLayout variant="stage" xrayId="social-thursday">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Back */}
        <Button variant="ghost" size="sm" onClick={() => navigate("/outreach/crown-letters")} className="gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Crown Letters
        </Button>

        {/* Held Banner */}
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="py-3 flex items-center gap-2 text-sm text-red-300">
            <Lock className="h-4 w-4 shrink-0" />
            <span>
              <strong>HELD - Thursday gate.</strong> Social posts will not publish until the
              founder authorizes on Thursday. NYT + social are gated together.
            </span>
          </CardContent>
        </Card>

        {/* Title */}
        <div className="flex items-center gap-3">
          <Share2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Social Thursday Set</h1>
            <p className="text-muted-foreground">Staged social announcements - Thursday-gated</p>
          </div>
        </div>

        {/* Gate Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Thursday Gate Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-sm">
            <Badge variant="outline" className="border-red-500/40 text-red-400 bg-red-500/10">
              Held - Waiting for Thursday Authorization
            </Badge>
            <span className="text-muted-foreground">NYT + Social launch together on Thursday</span>
          </CardContent>
        </Card>

        {/* Post Queue */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Staged Posts</h2>
          <p className="text-sm text-muted-foreground">
            These posts are drafted and ready. They will not publish until the Thursday gate opens.
          </p>

          {SOCIAL_POSTS.map((post) => {
            const Icon = post.icon;
            return (
              <Card key={post.id} className="border border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-sm">{post.platform}</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs border-red-500/40 text-red-400">
                      {post.gate}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <blockquote className="text-sm text-muted-foreground border-l-2 border-border pl-3">
                    {post.content}
                  </blockquote>
                  <Button size="sm" variant="outline" disabled className="gap-2">
                    <Lock className="h-3 w-3" />
                    Gated - Thursday Only
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Social announcement set is staged and ready. Awaiting Thursday gate and founder authorization.
        </p>
      </div>
    </PortalPageLayout>
  );
}
