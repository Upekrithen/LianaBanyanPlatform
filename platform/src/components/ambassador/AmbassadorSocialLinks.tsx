/**
 * AMBASSADOR SOCIAL LINKS — Connected platforms for portfolio (V2).
 * data-xray-id: ambassador-social-links
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const PLATFORM_ICONS: Record<string, string> = {
  youtube: "📺",
  instagram: "📷",
  tiktok: "🎵",
  twitter: "𝕏",
  facebook: "📘",
  linkedin: "💼",
  other: "🔗",
};

export interface SocialLinkRow {
  platform: string;
  handle: string;
  url: string | null;
  follower_count: number | null;
}

export interface AmbassadorSocialLinksProps {
  links: SocialLinkRow[];
  className?: string;
}

export function AmbassadorSocialLinks({ links, className }: AmbassadorSocialLinksProps) {
  if (links.length === 0) return null;

  return (
    <Card className={cn("border-2 border-border", className)} data-xray-id="ambassador-social-links">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Connected</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {links.map((link) => {
          const icon = PLATFORM_ICONS[link.platform] ?? "🔗";
          const label = link.follower_count != null
            ? `${icon} ${link.platform} (${link.follower_count >= 1000 ? (link.follower_count / 1000).toFixed(1) + "K" : link.follower_count})`
            : `${icon} ${link.platform}`;
          return (
            <p key={link.platform} className="text-sm">
              {link.url ? (
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  {label}
                </a>
              ) : (
                label
              )}
            </p>
          );
        })}
      </CardContent>
    </Card>
  );
}
