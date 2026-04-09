import { Card, CardContent } from "@/components/ui/card";
import { DesignRound } from "./types";

type LiveRoundCountdownBannerProps = {
  round: DesignRound | null;
};

function countdown(endsAt: string) {
  const target = new Date(endsAt).getTime();
  const now = Date.now();
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function LiveRoundCountdownBanner({ round }: LiveRoundCountdownBannerProps) {
  const active = round && ["active", "voting", "pending"].includes(round.status);
  return (
    <Card className="sticky top-[4.2rem] z-10 border-amber-200 bg-amber-50/80 backdrop-blur" data-xray-id="design-democracy-countdown-banner">
      <CardContent className="py-3 text-sm">
        {active && round ? (
          <p>
            <strong>Live round:</strong> {round.title} - <span className="text-muted-foreground">{countdown(round.endsAt)} remaining</span>
          </p>
        ) : (
          <p>
            <strong>Round status:</strong> <span className="text-muted-foreground">Next round opens soon.</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
