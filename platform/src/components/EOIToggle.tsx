import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import { toast } from "sonner";

export function EOIToggle() {
  const { user } = useAuth();
  const [showEOI, setShowEOI] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadPreferences = async () => {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("show_eoi_data")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error loading preferences:", error);
      } else if (data) {
        setShowEOI(data.show_eoi_data);
      }
      setLoading(false);
    };

    loadPreferences();
  }, [user]);

  const handleToggle = async (checked: boolean) => {
    if (!user) return;

    setShowEOI(checked);

    const { error } = await supabase
      .from("user_preferences")
      .upsert({
        user_id: user.id,
        show_eoi_data: checked,
      });

    if (error) {
      console.error("Error updating preferences:", error);
      toast.error("Failed to update EOI display preference");
      setShowEOI(!checked);
    } else {
      toast.success(checked ? "EOI data visible" : "EOI data hidden");
      // Trigger a page refresh to update all components
      window.dispatchEvent(new CustomEvent('eoi-toggle-changed', { detail: { showEOI: checked } }));
    }
  };

  if (loading) return null;

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Label htmlFor="eoi-toggle">Expression of Interest (EOI) Mode</Label>
            <Info className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            View "what-if" scenarios with ghost credits alongside real data
          </p>
        </div>
        <Switch
          id="eoi-toggle"
          checked={showEOI}
          onCheckedChange={handleToggle}
        />
      </div>
    </Card>
  );
}
