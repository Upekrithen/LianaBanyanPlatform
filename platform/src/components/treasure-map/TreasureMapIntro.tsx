/**
 * TREASURE MAP INTRO — Landing screen before the 7 questions
 */

import { Button } from "@/components/ui/button";

interface TreasureMapIntroProps {
  onStart: () => void;
}

export function TreasureMapIntro({ onStart }: TreasureMapIntroProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 md:p-12">
      <div className="max-w-xl mx-auto text-center space-y-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Treasure Map
        </h1>
        <h2 className="text-xl md:text-2xl text-muted-foreground font-medium">
          Find Your First Offer in About 3 Minutes
        </h2>
        <p className="text-lg text-muted-foreground">
          We'll ask a few quick questions and show you 3 ways you could start
          earning this week.
        </p>
        <Button
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-6"
          onClick={onStart}
        >
          Start the Map
        </Button>
      </div>
    </div>
  );
}
