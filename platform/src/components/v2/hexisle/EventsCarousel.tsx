import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EVENTS = [
  {
    title: "Island Gate Night",
    detail: "Open-table onboarding night with guided first-map walkthroughs.",
    date: "Every Thursday",
  },
  {
    title: "League Season Draft",
    detail: "Competitive roster setup and map-balance strategy briefing.",
    date: "First Saturday monthly",
  },
  {
    title: "Canister Terrain Lab",
    detail: "Physical terrain build sessions and board-state stress testing.",
    date: "Second Sunday monthly",
  },
  {
    title: "Co-op Encampment Session",
    detail: "Collaborative campaign runs with rotating roles and shared objectives.",
    date: "Bi-weekly",
  },
];

export function EventsCarousel() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Community events</h2>
      <div className="px-10 sm:px-12">
        <Carousel opts={{ align: "start" }} className="w-full">
          <CarouselContent>
            {EVENTS.map((event) => (
              <CarouselItem key={event.title} className="md:basis-1/2 lg:basis-1/3">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>{event.detail}</p>
                    <p className="text-xs uppercase tracking-wide">{event.date}</p>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-8" />
          <CarouselNext className="-right-8" />
        </Carousel>
      </div>
    </section>
  );
}
