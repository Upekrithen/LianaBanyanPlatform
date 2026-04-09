import { SPICE_RACK } from "@/lib/spiceRack";

type EpisodeLike = {
  primary_spice: string | null;
};

type SpiceDistributionBarProps = {
  episodes: EpisodeLike[];
};

export function SpiceDistributionBar({ episodes }: SpiceDistributionBarProps) {
  const totalTagged = episodes.filter((episode) => !!episode.primary_spice).length;
  const counts = new Map<string, number>();

  for (const spice of SPICE_RACK) {
    counts.set(spice.spice, 0);
  }
  for (const episode of episodes) {
    if (!episode.primary_spice) continue;
    counts.set(episode.primary_spice, (counts.get(episode.primary_spice) ?? 0) + 1);
  }

  return (
    <div className="space-y-2">
      <div className="h-3 w-full rounded-full overflow-hidden bg-muted flex">
        {SPICE_RACK.map((spice) => {
          const count = counts.get(spice.spice) ?? 0;
          if (!totalTagged || !count) return null;
          const width = (count / totalTagged) * 100;
          return (
            <div
              key={spice.spice}
              style={{ width: `${width}%` }}
              className="h-full border-r border-background/60 last:border-r-0 bg-primary/50"
              title={`${spice.displayName}: ${count}`}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        {SPICE_RACK.map((spice) => (
          <span
            key={spice.spice}
            className="text-xs rounded border px-2 py-1 bg-background"
          >
            {spice.emoji} {spice.displayName}: {counts.get(spice.spice) ?? 0}
          </span>
        ))}
      </div>
    </div>
  );
}
