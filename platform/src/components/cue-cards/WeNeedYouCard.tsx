/**
 * We Need You Card — "We Need You To Do What You're Already Good At"
 * Lists process modules with open Primary/Secondary slots. CTA → /crew-call.
 */

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, ChevronRight } from "lucide-react";

export function WeNeedYouCard() {
  const { data: modules } = useQuery({
    queryKey: ["manufacturing-process-modules-preview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("manufacturing_process_modules")
        .select("id, process_name, process_type")
        .eq("is_active", true)
        .limit(6);
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/10" data-xray-id="we-need-you-card">
      <CardContent className="py-6 px-6 space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Wrench className="w-5 h-5 text-amber-600" />
          We need you to do what you&apos;re already good at.
        </h3>
        {modules && modules.length > 0 && (
          <ul className="text-sm text-muted-foreground space-y-1">
            {modules.slice(0, 5).map((m: { id: string; process_name: string }) => (
              <li key={m.id}>• {m.process_name}</li>
            ))}
            {modules.length > 5 && <li>… and more</li>}
          </ul>
        )}
        <Button variant="outline" size="sm" asChild className="gap-2">
          <Link to="/crew-call">
            Join the Crew
            <ChevronRight className="w-4 h-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
