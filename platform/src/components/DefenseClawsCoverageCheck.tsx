import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DefenseClawsCoverageCheck() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [coverage, setCoverage] = useState<{ covered: boolean; count: number } | null>(null);

  const checkCoverage = async () => {
    const { data, error } = await supabase
      .from("defense_claws_preorders")
      .select("*")
      .eq("recipient_email", email)
      .eq("status", "active");

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    setCoverage({
      covered: data.length > 0,
      count: data.length,
    });
  };

  return (
    <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-purple-500" />
          <CardTitle>Check Defense Klaus™ Coverage</CardTitle>
        </div>
        <CardDescription>
          Verify if an email address has active legal defense coverage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Email Address</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="check@example.com"
          />
        </div>

        <Button onClick={checkCoverage} className="w-full" disabled={!email}>
          Check Coverage
        </Button>

        {coverage && (
          <div className={`p-4 rounded-md border ${
            coverage.covered
              ? "bg-green-500/10 border-green-500/20"
              : "bg-red-500/10 border-red-500/20"
          }`}>
            {coverage.covered ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-semibold">Coverage Active</p>
                  <p className="text-sm text-muted-foreground">
                    {coverage.count} active Defense Klaus™ {coverage.count === 1 ? "preorder" : "preorders"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-semibold">No Coverage Found</p>
                  <p className="text-sm text-muted-foreground">
                    This email address does not have active coverage
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pt-4 border-t text-xs text-muted-foreground">
          <p className="font-semibold">For Legal Assistance:</p>
          <p className="mt-1">File a report through the LB portal or call our volunteer line.
          We will check coverage and connect you with legal services immediately if covered.</p>
        </div>
      </CardContent>
    </Card>
  );
}
