import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Plus, Trash2, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface ProjectPreference {
  id: string;
  project_category: string;
  ranking: number;
  default_eoi_conversion_days: number;
  project_tags: string[] | null;
}

export function ProjectPreferenceRanking() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<ProjectPreference[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("user_project_preferences")
      .select("*")
      .eq("user_id", user.id)
      .order("ranking", { ascending: false });

    if (error) {
      console.error("Error loading preferences:", error);
      toast.error("Failed to load preferences");
    } else {
      setPreferences(data || []);
    }
  };

  const addCategory = async () => {
    if (!user || !newCategory.trim()) return;
    setLoading(true);

    const maxRanking = preferences.reduce((max, p) => Math.max(max, p.ranking), 0);

    const { error } = await supabase
      .from("user_project_preferences")
      .insert({
        user_id: user.id,
        project_category: newCategory.trim(),
        ranking: maxRanking + 1,
        default_eoi_conversion_days: 100,
      });

    if (error) {
      toast.error("Failed to add category");
      console.error(error);
    } else {
      toast.success("Category added");
      setNewCategory("");
      loadPreferences();
    }
    setLoading(false);
  };

  const updateRanking = async (id: string, newRanking: number) => {
    const { error } = await supabase
      .from("user_project_preferences")
      .update({ ranking: newRanking })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update ranking");
    } else {
      loadPreferences();
    }
  };

  const updateConversionDays = async (id: string, days: number) => {
    const { error } = await supabase
      .from("user_project_preferences")
      .update({ default_eoi_conversion_days: days })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update conversion days");
    } else {
      loadPreferences();
    }
  };

  const deletePreference = async (id: string) => {
    const { error } = await supabase
      .from("user_project_preferences")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete preference");
    } else {
      toast.success("Preference deleted");
      loadPreferences();
    }
  };

  const getConversionBenefit = (ranking: number, days: number) => {
    const baseParticipation = 0.5;
    const timePenalty = Math.max(0, (days - 100) * 0.0005);
    const rankingBonus = (ranking / 10.0) * 0.5;
    const participationRatio = Math.min(0.9, Math.max(0.1, baseParticipation + rankingBonus - timePenalty));
    return (participationRatio * 100).toFixed(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Project Preference Rankings
        </CardTitle>
        <CardDescription>
          Rank your preferred project types. Higher rankings vest EOI credits faster with better participation ratios.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Category */}
        <div className="flex gap-2">
          <Input
            placeholder="e.g., Hardware, Software, Agriculture"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCategory()}
          />
          <Button onClick={addCategory} disabled={loading || !newCategory.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>

        {/* Preferences List */}
        <div className="space-y-4">
          {preferences.map((pref) => (
            <Card key={pref.id} className="border-2">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-lg font-mono">
                      #{pref.ranking}
                    </Badge>
                    <h3 className="font-semibold text-lg">{pref.project_category}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateRanking(pref.id, pref.ranking + 1)}
                      disabled={pref.ranking >= 10}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateRanking(pref.id, Math.max(1, pref.ranking - 1))}
                      disabled={pref.ranking <= 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deletePreference(pref.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <Label>EOI Conversion Period: {pref.default_eoi_conversion_days} days</Label>
                    <Badge variant="secondary">
                      {getConversionBenefit(pref.ranking, pref.default_eoi_conversion_days)}% Participation
                    </Badge>
                  </div>
                  <Slider
                    value={[pref.default_eoi_conversion_days]}
                    min={30}
                    max={365}
                    step={10}
                    onValueChange={([value]) => updateConversionDays(pref.id, value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Shorter periods = faster conversion, longer periods = lower participation ratio
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}

          {preferences.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No preferences set yet. Add your first project category above.</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-2">
          <p className="font-medium">How Rankings Work:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Rank 10: Up to 90% participation conversion (best)</li>
            <li>• Rank 5: ~50% participation conversion (balanced)</li>
            <li>• Rank 1: ~10% participation conversion (minimal)</li>
            <li>• Longer conversion periods reduce participation percentage</li>
            <li>• Each day, a portion of your EOI converts based on these settings</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
