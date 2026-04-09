import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AsYouWishConfirmation } from "@/components/v2/dispatch/AsYouWishConfirmation";
import type { GuildCardData } from "./GuildCard";

type GuildJoinStakingFlowProps = {
  guild: GuildCardData | null;
  onConfirm: (guild: GuildCardData) => Promise<void>;
  busy?: boolean;
};

export function GuildJoinStakingFlow({ guild, onConfirm, busy = false }: GuildJoinStakingFlowProps) {
  const [open, setOpen] = useState(false);

  if (!guild) return null;

  return (
    <Card id="guild-join-flow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Join pathway (staking flow)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">
          <strong>{guild.name}</strong> requires <strong>{guild.stakeMarks} staked Marks</strong>.
        </p>
        <p className="text-xs text-muted-foreground">
          Stake is non-refundable while member of guild.
        </p>
        <Button onClick={() => setOpen(true)} disabled={busy}>
          Begin staking confirmation
        </Button>
      </CardContent>
      <AsYouWishConfirmation
        open={open}
        onOpenChange={setOpen}
        loading={busy}
        onConfirm={async () => {
          await onConfirm(guild);
          setOpen(false);
        }}
      />
    </Card>
  );
}
