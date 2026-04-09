import { DispatchChannel } from "@/components/v2/dispatch/types";

type ChannelVariationTileProps = {
  channel: DispatchChannel;
  canonicalMessage: string;
};

function edgeVariation(channel: DispatchChannel, canonicalMessage: string) {
  const clipped = canonicalMessage.slice(0, channel.maxChars);
  const clippedWithEllipsis = canonicalMessage.length > channel.maxChars ? `${clipped}...` : clipped;
  const cta = channel.ctaStyle === "short" ? "Read more" : "Open full message";
  return { clippedWithEllipsis, cta };
}

export function ChannelVariationTile({ channel, canonicalMessage }: ChannelVariationTileProps) {
  const { clippedWithEllipsis, cta } = edgeVariation(channel, canonicalMessage);

  return (
    <article className="rounded-lg border bg-card/40 p-3">
      <p className="font-medium">{channel.name}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Edge delta: clip to {channel.maxChars} chars and apply {channel.ctaStyle} CTA.
      </p>
      <p className="mt-2 line-clamp-3 text-sm">{clippedWithEllipsis || "No canonical message yet."}</p>
      <p className="mt-2 text-xs text-muted-foreground">CTA edge: {cta}</p>
    </article>
  );
}
