/**
 * Cue card: Get Famous. Make Money. Do Good. — service units
 * Aspirational; SEC-safe (service units, not securities).
 * data-xray-id: get-famous-card
 */

import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function GetFamousCard() {
  return (
    <Card
      className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10"
      data-xray-id="get-famous-card"
    >
      <CardContent className="py-6 px-6 space-y-4">
        <p className="text-lg font-bold">
          Get Famous. Make Money. Do Good.
        </p>
        <p className="text-sm text-muted-foreground">
          Put your service units where your mouth is.
        </p>
        <Button variant="default" size="sm" asChild>
          <Link to="/guilds/hub?tab=bandwagon">Back projects</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
