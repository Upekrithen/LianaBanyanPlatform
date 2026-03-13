/**
 * AMBASSADOR MINI BUSINESS PLAN — CTA to Contingency Operators (V2).
 * Pre-loaded role templates can be wired later. data-xray-id: ambassador-business-plan
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface AmbassadorMiniBusinessPlanProps {
  role?: "ambassador" | "meal_maker" | "grocery_runner" | "general";
  className?: string;
}

export function AmbassadorMiniBusinessPlan({ role = "ambassador", className }: AmbassadorMiniBusinessPlanProps) {
  const navigate = useNavigate();
  const label = role === "ambassador" ? "what an Ambassador may earn" : role === "meal_maker" ? "meal maker numbers" : role === "grocery_runner" ? "grocery runner numbers" : "earn scenarios";

  return (
    <Card className={cn("border-2 border-border", className)} data-xray-id="ambassador-business-plan">
      <CardContent className="pt-4">
        <p className="text-sm font-semibold mb-2">My business model (powered by Contingency Operators)</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/pathway", { state: { role } })}
          data-xray-id="ambassador-co-cta"
        >
          See {label} →
        </Button>
      </CardContent>
    </Card>
  );
}
