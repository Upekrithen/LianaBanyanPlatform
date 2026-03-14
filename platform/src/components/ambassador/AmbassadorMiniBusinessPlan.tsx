/**
 * AMBASSADOR MINI BUSINESS PLAN — CTA to Contingency Operators (V2).
 * "Play with these numbers" opens ContingencyOperatorDialog; "See ..." goes to full pathway.
 * data-xray-id: ambassador-business-plan
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ContingencyOperatorDialog } from "./ContingencyOperatorDialog";

export interface AmbassadorMiniBusinessPlanProps {
  role?: "ambassador" | "meal_maker" | "grocery_runner" | "general";
  className?: string;
}

export function AmbassadorMiniBusinessPlan({ role = "ambassador", className }: AmbassadorMiniBusinessPlanProps) {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const label = role === "ambassador" ? "what an Ambassador may earn" : role === "meal_maker" ? "meal maker numbers" : role === "grocery_runner" ? "grocery runner numbers" : "earn scenarios";
  const defaultRole = role === "general" ? "ambassador" : role;

  return (
    <>
      <Card className={cn("border-2 border-border", className)} data-xray-id="ambassador-business-plan">
        <CardContent className="pt-4">
          <p className="text-sm font-semibold mb-2">My business model (powered by Contingency Operators)</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(true)}
              data-xray-id="ambassador-co-play-numbers"
            >
              Play with these numbers
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/pathway", { state: { role } })}
              data-xray-id="ambassador-co-cta"
            >
              See {label} →
            </Button>
          </div>
        </CardContent>
      </Card>
      <ContingencyOperatorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultRole={defaultRole}
      />
    </>
  );
}
