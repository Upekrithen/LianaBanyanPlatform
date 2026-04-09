import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PotStatus, type PotSlot } from "@/components/PotStatus";
import { SPICE_RACK, SPICE_TYPES, type SpiceType, getSpiceMeta } from "@/lib/spiceRack";
import { SpiceBadge } from "@/components/SpiceBadge";
import { toast } from "sonner";

type Pathway = "food" | "manufacturing" | "service" | "local_business" | "guild" | "tribe";

type RecipeRecord = {
  id: string;
  project_id: string;
  project_name: string;
  owner_id: string;
  cold_start_pathway: Pathway | null;
  created_at: string;
};

type SlotRecord = {
  id: string;
  recipe_id: string;
  spice: SpiceType;
  status: "open" | "filled" | "owner";
  filled_by: string | null;
  description: string | null;
};

const PATHWAY_OPTIONS: Pathway[] = ["food", "manufacturing", "service", "local_business", "guild", "tribe"];

export default function RecipePotPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [projectName, setProjectName] = useState("");
  const [pathway, setPathway] = useState<Pathway | "">("");
  const [ownerSpices, setOwnerSpices] = useState<SpiceType[]>([]);
  const [draftSlots, setDraftSlots] = useState<Array<{ spice: SpiceType; description: string }>>([]);
  const [browseSpice, setBrowseSpice] = useState<SpiceType>("garlic");
  const [newSlotByRecipe, setNewSlotByRecipe] = useState<Record<string, SpiceType>>({});
  const [descriptionBySlot, setDescriptionBySlot] = useState<Record<string, string>>({});

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ["recipe-pot-recipes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_recipes" as never)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as RecipeRecord[];
    },
  });

  const { data: slots = [] } = useQuery({
    queryKey: ["recipe-pot-slots"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipe_spice_slots" as never)
        .select("*");
      if (error) throw error;
      return (data ?? []) as unknown as SlotRecord[];
    },
  });

  const { data: browseMatches = [] } = useQuery({
    queryKey: ["browse-recipes", browseSpice],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("browse-recipes", {
        body: { spice: browseSpice, limit: 25 },
      });
      if (error) throw error;
      return (data?.recipes ?? []) as Array<{
        slot_id: string;
        recipe_id: string;
        spice: SpiceType;
        description: string | null;
        project: RecipeRecord;
      }>;
    },
  });

  const slotsByRecipe = useMemo(() => {
    const map = new Map<string, SlotRecord[]>();
    slots.forEach((slot) => {
      const list = map.get(slot.recipe_id) ?? [];
      list.push(slot);
      map.set(slot.recipe_id, list);
    });
    return map;
  }, [slots]);

  const createRecipeMutation = useMutation({
    mutationFn: async () => {
      if (!projectName.trim()) throw new Error("Project name is required.");
      const { data, error } = await supabase.functions.invoke("create-recipe", {
        body: {
          project_name: projectName.trim(),
          cold_start_pathway: pathway || undefined,
          owner_spices: ownerSpices,
          spice_slots: draftSlots,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Recipe created.");
      setProjectName("");
      setPathway("");
      setOwnerSpices([]);
      setDraftSlots([]);
      queryClient.invalidateQueries({ queryKey: ["recipe-pot-recipes"] });
      queryClient.invalidateQueries({ queryKey: ["recipe-pot-slots"] });
      queryClient.invalidateQueries({ queryKey: ["browse-recipes"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to create recipe"),
  });

  const offerSpiceMutation = useMutation({
    mutationFn: async (slot: SlotRecord) => {
      const { data, error } = await supabase.functions.invoke("join-pot", {
        body: {
          slot_id: slot.id,
          spice: slot.spice,
          proficiency: 1,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Spice offered. Slot filled.");
      queryClient.invalidateQueries({ queryKey: ["recipe-pot-slots"] });
      queryClient.invalidateQueries({ queryKey: ["browse-recipes"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not offer spice"),
  });

  const updateDescriptionMutation = useMutation({
    mutationFn: async ({ slotId, description }: { slotId: string; description: string }) => {
      const { error } = await supabase
        .from("recipe_spice_slots" as never)
        .update({ description } as never)
        .eq("id", slotId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Slot description updated.");
      queryClient.invalidateQueries({ queryKey: ["recipe-pot-slots"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not save description"),
  });

  const addSlotMutation = useMutation({
    mutationFn: async ({ recipeId, spice }: { recipeId: string; spice: SpiceType }) => {
      const { error } = await supabase
        .from("recipe_spice_slots" as never)
        .insert({
          recipe_id: recipeId,
          spice,
          status: "open",
        } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Spice slot added.");
      queryClient.invalidateQueries({ queryKey: ["recipe-pot-slots"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not add slot"),
  });

  const removeSlotMutation = useMutation({
    mutationFn: async (slotId: string) => {
      const { error } = await supabase
        .from("recipe_spice_slots" as never)
        .delete()
        .eq("id", slotId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Spice slot removed.");
      queryClient.invalidateQueries({ queryKey: ["recipe-pot-slots"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not remove slot"),
  });

  const toggleOwnerSpice = (spice: SpiceType) => {
    setOwnerSpices((previous) => (
      previous.includes(spice)
        ? previous.filter((value) => value !== spice)
        : [...previous, spice]
    ));
  };

  const upsertDraftSlot = (spice: SpiceType, description: string) => {
    setDraftSlots((previous) => {
      const map = new Map(previous.map((slot) => [slot.spice, slot]));
      map.set(spice, { spice, description });
      return Array.from(map.values());
    });
  };

  const removeDraftSlot = (spice: SpiceType) => {
    setDraftSlots((previous) => previous.filter((slot) => slot.spice !== spice));
  };

  return (
    <PortalPageLayout maxWidth="xl" xrayId="recipe-pot-page">
      <div className="space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Recipe Pot</h1>
          <p className="text-muted-foreground">
            Projects declare the spices they need. Members contribute by bringing their spice.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Create a Recipe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  placeholder="e.g. Family Table Pilot"
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pathway">Cold Start Pathway (optional)</Label>
                <select
                  id="pathway"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={pathway}
                  onChange={(event) => setPathway(event.target.value as Pathway | "")}
                >
                  <option value="">Custom</option>
                  {PATHWAY_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option.replace("_", " ")}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Owner Spices (auto-filled on create)</Label>
              <div className="flex flex-wrap gap-2">
                {SPICE_RACK.map((entry) => (
                  <Button
                    key={entry.spice}
                    type="button"
                    size="sm"
                    variant={ownerSpices.includes(entry.spice) ? "default" : "outline"}
                    onClick={() => toggleOwnerSpice(entry.spice)}
                  >
                    <span className="mr-1">{entry.emoji}</span>
                    {entry.displayName}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Custom Slot Notes (optional)</Label>
              <div className="grid gap-3 md:grid-cols-2">
                {SPICE_RACK.map((entry) => {
                  const existing = draftSlots.find((slot) => slot.spice === entry.spice);
                  return (
                    <div key={entry.spice} className="rounded-md border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <SpiceBadge spice={entry.spice} />
                        <Button
                          type="button"
                          size="sm"
                          variant={existing ? "destructive" : "outline"}
                          onClick={() => (existing ? removeDraftSlot(entry.spice) : upsertDraftSlot(entry.spice, ""))}
                        >
                          {existing ? "Remove" : "Add"}
                        </Button>
                      </div>
                      {existing && (
                        <Textarea
                          placeholder="What this spice means for this project..."
                          value={existing.description}
                          onChange={(event) => upsertDraftSlot(entry.spice, event.target.value)}
                          rows={2}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <Button
              onClick={() => createRecipeMutation.mutate()}
              disabled={createRecipeMutation.isPending}
            >
              {createRecipeMutation.isPending ? "Creating..." : "Create Recipe"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Browse Open Recipes by Spice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {SPICE_RACK.map((entry) => (
                <Button
                  key={entry.spice}
                  size="sm"
                  variant={browseSpice === entry.spice ? "default" : "outline"}
                  onClick={() => setBrowseSpice(entry.spice)}
                >
                  <span className="mr-1">{entry.emoji}</span>
                  {entry.displayName}
                </Button>
              ))}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {browseMatches.map((match) => (
                <div key={match.slot_id} className="rounded-md border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{match.project.project_name}</div>
                    <SpiceBadge spice={match.spice} />
                  </div>
                  <div className="text-sm text-muted-foreground">{match.description || "No note yet."}</div>
                </div>
              ))}
              {browseMatches.length === 0 && (
                <div className="text-sm text-muted-foreground">No open recipes currently need this spice.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Active Recipes</h2>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading recipes...</div>
          ) : recipes.length === 0 ? (
            <div className="text-sm text-muted-foreground">No recipes yet.</div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {recipes.map((recipe) => {
                const recipeSlots = slotsByRecipe.get(recipe.id) ?? [];
                const potSlots: PotSlot[] = recipeSlots.map((slot) => ({
                  id: slot.id,
                  spice: slot.spice,
                  status: slot.status,
                }));
                const isOwner = user?.id === recipe.owner_id;
                const openSlots = recipeSlots.filter((slot) => slot.status === "open");

                return (
                  <Card key={recipe.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-xl">{recipe.project_name}</CardTitle>
                        {recipe.cold_start_pathway && (
                          <Badge variant="secondary">{recipe.cold_start_pathway.replace("_", " ")}</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <PotStatus slots={potSlots} />

                      <div className="space-y-2">
                        {recipeSlots.map((slot) => (
                          <div key={slot.id} className="rounded-md border p-3 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <SpiceBadge spice={slot.spice} />
                                <Badge variant={slot.status === "open" ? "outline" : "default"}>{slot.status}</Badge>
                              </div>
                              {slot.status === "open" && (
                                <Button
                                  size="sm"
                                  onClick={() => offerSpiceMutation.mutate(slot)}
                                  disabled={offerSpiceMutation.isPending}
                                >
                                  Offer your Spice
                                </Button>
                              )}
                            </div>

                            <div className="text-sm text-muted-foreground">
                              {slot.description || "No slot description yet."}
                            </div>

                            {isOwner && (
                              <div className="space-y-2">
                                <Textarea
                                  rows={2}
                                  value={descriptionBySlot[slot.id] ?? slot.description ?? ""}
                                  onChange={(event) => setDescriptionBySlot((previous) => ({
                                    ...previous,
                                    [slot.id]: event.target.value,
                                  }))}
                                  placeholder="Update what this spice means for this project..."
                                />
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateDescriptionMutation.mutate({
                                      slotId: slot.id,
                                      description: descriptionBySlot[slot.id] ?? slot.description ?? "",
                                    })}
                                    disabled={updateDescriptionMutation.isPending}
                                  >
                                    Save description
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => removeSlotMutation.mutate(slot.id)}
                                    disabled={removeSlotMutation.isPending}
                                  >
                                    Remove slot
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {isOwner && (
                        <div className="rounded-md border p-3 space-y-2">
                          <Label>Add Spice Slot</Label>
                          <div className="flex gap-2">
                            <select
                              value={newSlotByRecipe[recipe.id] ?? SPICE_TYPES[0]}
                              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
                              onChange={(event) => setNewSlotByRecipe((previous) => ({
                                ...previous,
                                [recipe.id]: event.target.value as SpiceType,
                              }))}
                            >
                              {SPICE_RACK.map((entry) => (
                                <option key={entry.spice} value={entry.spice}>
                                  {entry.displayName}
                                </option>
                              ))}
                            </select>
                            <Button
                              onClick={() => {
                                const spiceToAdd = newSlotByRecipe[recipe.id] ?? SPICE_TYPES[0];
                                if (recipeSlots.some((slot) => slot.spice === spiceToAdd)) {
                                  const meta = getSpiceMeta(spiceToAdd);
                                  toast.error(`${meta?.displayName ?? spiceToAdd} is already in this recipe.`);
                                  return;
                                }
                                addSlotMutation.mutate({ recipeId: recipe.id, spice: spiceToAdd });
                              }}
                              disabled={addSlotMutation.isPending}
                            >
                              Add Slot
                            </Button>
                          </div>
                        </div>
                      )}

                      {openSlots.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          Seeking{" "}
                          {openSlots.map((slot, index) => {
                            const meta = getSpiceMeta(slot.spice);
                            const label = `${meta?.emoji ?? ""} ${meta?.displayName ?? slot.spice}`.trim();
                            return (
                              <span key={slot.id}>
                                {index > 0 ? index === openSlots.length - 1 ? " and " : ", " : ""}
                                {label}
                              </span>
                            );
                          })}
                          .
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </PortalPageLayout>
  );
}
