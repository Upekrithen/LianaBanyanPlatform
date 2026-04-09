import { ColdStartPathway } from "./types";
import { PathwayCard } from "./PathwayCard";

type PathwayGridProps = {
  pathways: ColdStartPathway[];
};

export function PathwayGrid({ pathways }: PathwayGridProps) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {pathways.map((pathway) => (
        <PathwayCard key={pathway.id} pathway={pathway} />
      ))}
    </section>
  );
}

