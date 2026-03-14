/**
 * Cue card: Become a Steward — pledge Marks, manage campaigns, Pizza Oven.
 * SEC language: pledge Marks, operational surplus; no investment/return.
 * data-xray-id: become-a-steward-card
 */

import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function BecomeAStewardCard() {
  return (
    <Card
      className="border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/10"
      data-xray-id="become-a-steward-card"
    >
      <CardContent className="py-6 px-6 space-y-4">
        <h3 className="text-xl font-bold">Become a Steward</h3>
        <p className="text-sm text-muted-foreground space-y-1">
          Manage campaigns.
          <br />
          Pledge your Marks.
          <br />
          The oven&apos;s already hot — cook more pizzas.
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link to="/guilds/hub?tab=bandwagon">Learn more</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
