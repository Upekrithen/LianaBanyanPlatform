import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ColdStartPathway } from "./types";

type PathwayDifferencesProps = {
  pathways: ColdStartPathway[];
};

export function PathwayDifferences({ pathways }: PathwayDifferencesProps) {
  return (
    <section className="rounded-lg border bg-card p-4 sm:p-5">
      <h2 className="text-lg font-semibold tracking-tight">How the pathways differ</h2>
      <Accordion type="single" collapsible className="mt-3">
        {pathways.map((pathway) => (
          <AccordionItem key={pathway.id} value={pathway.id}>
            <AccordionTrigger className="text-left">{pathway.name}</AccordionTrigger>
            <AccordionContent className="space-y-2 text-sm text-muted-foreground">
              <p>{pathway.purpose}</p>
              <p className="font-medium">{pathway.bestFor}</p>
              <ul className="space-y-1">
                {pathway.capabilities.map((capability) => (
                  <li key={`${pathway.id}-${capability}`} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" aria-hidden />
                    <span>{capability}</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

