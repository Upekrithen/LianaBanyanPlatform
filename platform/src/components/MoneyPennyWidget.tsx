import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function MoneyPennyWidget() {
  const navigate = useNavigate();

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Bot className="h-24 w-24" />
      </div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Bot className="h-6 w-6 text-primary" />
          MoneyPenny Briefing
        </CardTitle>
        <CardDescription>Your virtual administrative assistant</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 relative z-10">
        <p className="text-sm text-muted-foreground">
          MoneyPenny will track your invitations, cue cards, publications, and tasks as activity begins.
        </p>

        <div className="pt-4 flex gap-3 border-t border-border/50">
          <Button variant="outline" className="w-full gap-2" onClick={() => navigate("/moneypenny")}>
            View Full Briefing <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
