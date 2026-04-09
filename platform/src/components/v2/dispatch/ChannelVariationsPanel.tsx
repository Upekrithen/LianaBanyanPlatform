import { DispatchChannel } from "@/components/v2/dispatch/types";
import { ChannelVariationTile } from "@/components/v2/dispatch/ChannelVariationTile";

type ChannelVariationsPanelProps = {
  channels: DispatchChannel[];
  canonicalMessage: string;
};

export function ChannelVariationsPanel({ channels, canonicalMessage }: ChannelVariationsPanelProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold">Channel Variations</h2>
        <p className="text-xs text-muted-foreground">{channels.length} channels</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {channels.map((channel) => (
          <ChannelVariationTile key={channel.id} channel={channel} canonicalMessage={canonicalMessage} />
        ))}
      </div>
    </section>
  );
}
