import { PioneerPerson } from "./types";
import { PioneerCard } from "./PioneerCard";

type PioneerGridProps = {
  people: PioneerPerson[];
  onOpenProfile: (person: PioneerPerson) => void;
};

export function PioneerGrid({ people, onOpenProfile }: PioneerGridProps) {
  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3" data-xray-id="pioneers-grid">
      {people.map((person) => (
        <PioneerCard key={person.id} person={person} onOpenProfile={onOpenProfile} />
      ))}
    </section>
  );
}
