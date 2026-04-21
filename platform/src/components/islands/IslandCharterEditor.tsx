import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Building2, ScrollText, BookOpen } from "lucide-react";

interface IslandCharterEditorProps {
  islandId: string;
  charter: any;
  canEdit: boolean;
}

export default function IslandCharterEditor({ islandId, charter, canEdit }: IslandCharterEditorProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const [charterData, setCharterData] = useState({
    lb_base_rules: charter?.lb_base_rules || {},
    organization_rules: charter?.organization_rules || {},
    island_specific_rules: charter?.island_specific_rules || {
      entry_requirements: [],
      behavioral_codes: [],
      project_guidelines: [],
      commerce_rules: []
    },
    moderation_policy: charter?.moderation_policy || {
      village_elders: [],
      enforcer_role: "ai",
      enforcement_style: "laissez_faire_with_iron_hand",
      violation_consequences: {}
    }
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('island_charters')
        .update({
          ...charterData,
          last_updated_by: user.id,
          charter_version: (charter?.charter_version || 0) + 1
        })
        .eq('island_id', islandId);

      if (error) throw error;

      toast({
        title: "Charter Updated",
        description: "Island charter has been successfully updated",
      });
    } catch (error) {
      console.error("Charter update error:", error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Could not update charter",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addRule = (section: string, rule: string) => {
    if (!rule.trim()) return;

    setCharterData(prev => ({
      ...prev,
      island_specific_rules: {
        ...prev.island_specific_rules,
        [section]: [...(prev.island_specific_rules[section] || []), rule]
      }
    }));
  };

  const removeRule = (section: string, index: number) => {
    setCharterData(prev => ({
      ...prev,
      island_specific_rules: {
        ...prev.island_specific_rules,
        [section]: prev.island_specific_rules[section].filter((_: any, i: number) => i !== index)
      }
    }));
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold">Island Charter</h2>
            <p className="text-sm text-muted-foreground">
              Version {charter?.charter_version || 1} • Multi-Authority Governance
            </p>
          </div>
          {canEdit && (
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Charter"}
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="lb_rules">LB Standards</TabsTrigger>
            <TabsTrigger value="island_rules">Island Rules</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">LB Base Standards</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Universal rules set by Liana Banyan that apply to all islands
                </p>
                <div className="mt-2 space-y-1">
                  <Badge variant="outline">Common Currency</Badge>
                  <Badge variant="outline">IP Translation</Badge>
                  <Badge variant="outline">Privacy Protection</Badge>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Organization Rules</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Guild/Tribe specific rules for this island
                </p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ScrollText className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Island-Specific</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Custom rules set by the island owner
                </p>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="lb_rules" className="space-y-4 mt-4">
            <Card className="p-4 bg-muted/50">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5" />
                <h3 className="font-semibold">Liana Banyan Base Standards</h3>
                <Badge>Read-Only</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Common Currency System</span>
                  <Badge variant="outline">Enforced</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>IP Translation Rights</span>
                  <Badge variant="outline">Enforced</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Privacy Protection</span>
                  <Badge variant="outline">Enforced</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Safety Standards</span>
                  <Badge variant="outline">Enforced</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Content Policy</span>
                  <Badge variant="outline">Family Friendly</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                These standards are set by Liana Banyan and cannot be modified at the island level.
                They ensure safe operation and compatibility across all islands.
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="island_rules" className="space-y-4 mt-4">
            {canEdit ? (
              <>
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="h-5 w-5" />
                    <h3 className="font-semibold">Entry Requirements</h3>
                  </div>
                  <div className="space-y-2">
                    {charterData.island_specific_rules.entry_requirements.map((rule: string, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{rule}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRule('entry_requirements', index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Add entry requirement..."
                        rows={2}
                        id="new-entry-requirement"
                      />
                      <Button
                        onClick={() => {
                          const input = document.getElementById('new-entry-requirement') as HTMLTextAreaElement;
                          addRule('entry_requirements', input.value);
                          input.value = '';
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="h-5 w-5" />
                    <h3 className="font-semibold">Behavioral Codes</h3>
                  </div>
                  <div className="space-y-2">
                    {charterData.island_specific_rules.behavioral_codes.map((rule: string, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{rule}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRule('behavioral_codes', index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Add behavioral code..."
                        rows={2}
                        id="new-behavioral-code"
                      />
                      <Button
                        onClick={() => {
                          const input = document.getElementById('new-behavioral-code') as HTMLTextAreaElement;
                          addRule('behavioral_codes', input.value);
                          input.value = '';
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">
                  You don't have permission to edit island rules.
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="moderation" className="space-y-4 mt-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5" />
                <h3 className="font-semibold">Moderation Policy</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Enforcement Style</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge>{charterData.moderation_policy.enforcement_style}</Badge>
                    <p className="text-sm text-muted-foreground">
                      Laissez-faire approach with iron hand when needed
                    </p>
                  </div>
                </div>
                <div>
                  <Label>Enforcer Type</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">
                      {charterData.moderation_policy.enforcer_role === 'ai' ? '🤖 AI Enforcer' : '👤 Human Moderator'}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  The Enforcer walks with ultimate power but uses it sparingly.
                  Like a village elder who hands out cookies and makes flowers grow,
                  but can banish those who violate safety or privacy.
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
