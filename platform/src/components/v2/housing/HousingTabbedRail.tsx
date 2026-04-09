import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HousingTabKey } from "./types";

type HousingTabbedRailProps = {
  tab: HousingTabKey;
};

const TABS: Array<{ key: HousingTabKey; label: string }> = [
  { key: "properties", label: "Properties" },
  { key: "my-housing", label: "My Housing" },
  { key: "contribute", label: "Contribute" },
  { key: "housing-fund", label: "Housing Fund" },
  { key: "roommate", label: "Roommate" },
];

export function HousingTabbedRail({ tab }: HousingTabbedRailProps) {
  return (
    <section className="rounded-xl border bg-background/95 p-2 backdrop-blur" data-xray-id="housing-tabbed-rail">
      <TabsList className="grid h-auto w-full grid-cols-1 gap-2 bg-transparent p-0 md:grid-cols-5">
        {TABS.map((item) => (
          <TabsTrigger
            key={item.key}
            value={item.key}
            className="h-auto rounded-lg border px-3 py-2 text-sm data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <span className="text-left">{item.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      <p className="px-1 pt-2 text-xs text-muted-foreground">
        Chapter currently open: <span className="font-medium text-foreground">{TABS.find((item) => item.key === tab)?.label}</span>
      </p>
    </section>
  );
}
