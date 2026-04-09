import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_ITEMS = [
  {
    id: "q1",
    question: "Why is membership a single offer?",
    answer:
      "The page is built around one offer, one price, and one promise so members decide once and move directly into participation.",
  },
  {
    id: "q2",
    question: "What does founder terms aligned mean?",
    answer:
      "Members operate under the same structural rules as the Founder & General Manager: creator keeps 83.3% and platform economics follow Cost + 20%.",
  },
  {
    id: "q3",
    question: "Do I need to provide demographic details?",
    answer:
      "No. Participation is based on contribution and activity context, not demographic intake forms.",
  },
  {
    id: "q4",
    question: "Where can I review membership terms?",
    answer:
      "Use the membership terms preview action to review plain-language terms before joining.",
  },
];

export function MembershipFAQ() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Final CTA + FAQ</h2>
      <Accordion type="single" collapsible className="rounded-xl border bg-card px-4">
        {FAQ_ITEMS.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger className="text-left text-sm">{item.question}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
