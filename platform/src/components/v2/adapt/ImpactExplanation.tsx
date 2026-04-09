import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ImpactExplanation() {
  return (
    <Card data-xray-id="adapt-impact-explanation">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">How ADAPT affects access</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Why these pillars matter</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              ADAPT reflects contribution quality across operational reliability, aligned participation, and knowledge handoff. It helps route members to work where they can contribute with confidence.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>How it influences opportunities</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              As ADAPT standing improves, more responsibility pathways and collaboration requests become easier to match. The system is forward-looking and refreshed by real participation.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
