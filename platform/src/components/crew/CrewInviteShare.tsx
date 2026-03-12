/**
 * CREW INVITE SHARE — Copy link + editable default invite text
 * Default: "I'm starting a Founding Crew on Liana Banyan in [city]. 12 of us each..."
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface CrewInviteShareProps {
  inviteUrl: string;
  crewName?: string;
  city?: string | null;
  remainingSpots: number;
  className?: string;
}

const DEFAULT_TEMPLATE = (
  city: string | undefined,
  remaining: number,
  link: string
) =>
  `I'm starting a Founding Crew on Liana Banyan${city ? ` in ${city}` : ""}. 12 of us each back one another's small offer for about $20. When we hit 12, everyone gets their first real customer. Want one of the ${remaining} spots?\n${link}`;

export function CrewInviteShare({
  inviteUrl,
  crewName,
  city,
  remainingSpots,
  className,
}: CrewInviteShareProps) {
  const [copied, setCopied] = useState(false);
  const [inviteText, setInviteText] = useState(
    () => DEFAULT_TEMPLATE(city ?? undefined, remainingSpots, inviteUrl)
  );

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("Invite link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(inviteText);
      toast.success("Invite text copied");
    } catch {
      toast.error("Could not copy text");
    }
  };

  return (
    <div className={cn("space-y-4", className)} data-xray-id="crew-invite-share">
      <p className="text-sm font-medium">Want this Crew to fill faster? Share the invite.</p>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleCopyLink}>
          {copied ? <Check className="w-4 h-4 mr-1 text-green-500" /> : <Copy className="w-4 h-4 mr-1" />}
          Copy link
        </Button>
        <span className="text-xs text-muted-foreground truncate max-w-[220px]">{inviteUrl}</span>
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Invite text (edit if you like)</label>
        <Textarea
          value={inviteText}
          onChange={(e) => setInviteText(e.target.value)}
          rows={5}
          className="resize-none text-sm"
        />
        <Button variant="secondary" size="sm" onClick={handleCopyText}>
          <Copy className="w-4 h-4 mr-1" /> Copy text
        </Button>
      </div>
    </div>
  );
}
