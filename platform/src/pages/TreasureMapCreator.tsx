/**
 * TREASURE MAP CREATOR
 * ====================
 * Tool for creating custom treasure maps with waypoints/beacons.
 * Maps can be ordered (linear), unordered (any order), or branching (multiple paths).
 * 
 * Features:
 * - Add beacons with locations, tasks, and hints
 * - Set rewards (credits, MARKS, badges, deck cards)
 * - Configure visibility (private, friends, public, link-only)
 * - Add end questions (time-rotating answers)
 * - Preview and publish
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Map, Plus, Trash2, GripVertical, Eye, Save, Send,
  MapPin, HelpCircle, Gift, Lock, Globe, Users, Link2,
  ArrowRight, Check, X, Sparkles, Target, Navigation,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import type { User } from "@supabase/supabase-js";
import { PortalPageLayout } from '@/components/PortalPageLayout';

// ─── TYPES ───

interface Beacon {
  id: string;
  tempId: string; // For drag-drop before saving
  beacon_order: number;
  name: string;
  location_type: "page" | "coordinates" | "qr_code" | "beacon";
  location_path: string;
  task_description: string;
  task_type: "visit" | "answer" | "interact" | "time_spent";
  task_answer: string;
  hint: string;
  next_beacon_ids: string[];
}

interface EndQuestion {
  question: string;
  answers: string[];
  correct_index_by_hour: number[];
}

interface TreasureMapDraft {
  id?: string;
  name: string;
  description: string;
  map_type: "ordered" | "unordered" | "branching";
  visibility: "private" | "friends" | "public" | "link_only";
  reward_credits: number;
  reward_marks: number;
  reward_badge: string;
  reward_card_id: string | null;
  end_questions: EndQuestion[];
  beacons: Beacon[];
}

const VISIBILITY_OPTIONS = [
  { value: "private", label: "Private", icon: Lock, desc: "Only you can see and play" },
  { value: "friends", label: "Friends", icon: Users, desc: "Friends and referred members" },
  { value: "public", label: "Public", icon: Globe, desc: "Anyone can find and play" },
  { value: "link_only", label: "Link Only", icon: Link2, desc: "Only accessible via direct link" },
];

const MAP_TYPES = [
  { value: "ordered", label: "Linear", desc: "Players follow beacons in sequence" },
  { value: "unordered", label: "Free Roam", desc: "Players find beacons in any order" },
  { value: "branching", label: "Branching", desc: "Multiple paths with choices" },
];

const TASK_TYPES = [
  { value: "visit", label: "Visit Page", desc: "Simply visit the location" },
  { value: "answer", label: "Answer Question", desc: "Answer correctly to proceed" },
  { value: "interact", label: "Interact", desc: "Click a specific element" },
  { value: "time_spent", label: "Time Spent", desc: "Stay for a minimum duration" },
];

const LOCATION_TYPES = [
  { value: "page", label: "Page Route", placeholder: "/dashboard" },
  { value: "coordinates", label: "Real-World GPS", placeholder: "40.7128,-74.0060" },
  { value: "qr_code", label: "QR Code Scan", placeholder: "QR code identifier" },
  { value: "beacon", label: "Bluetooth Beacon", placeholder: "Beacon UUID" },
];

// ─── HELPERS ───

function createEmptyBeacon(order: number): Beacon {
  return {
    id: "",
    tempId: `temp-${Date.now()}-${order}`,
    beacon_order: order,
    name: "",
    location_type: "page",
    location_path: "",
    task_description: "",
    task_type: "visit",
    task_answer: "",
    hint: "",
    next_beacon_ids: [],
  };
}

function createEmptyQuestion(): EndQuestion {
  return {
    question: "",
    answers: Array(12).fill(""),
    correct_index_by_hour: Array(24).fill(0),
  };
}

// ─── COMPONENT ───

export default function TreasureMapCreator() {
  const navigate = useNavigate();
  const { openOnboard } = useSeamlessOnboard();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [draft, setDraft] = useState<TreasureMapDraft>({
    name: "",
    description: "",
    map_type: "ordered",
    visibility: "private",
    reward_credits: 0,
    reward_marks: 0,
    reward_badge: "",
    reward_card_id: null,
    end_questions: [],
    beacons: [createEmptyBeacon(1)],
  });
  
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deckCards, setDeckCards] = useState<Array<{ id: string; name: string }>>([]);
  const [beaconDialogOpen, setBeaconDialogOpen] = useState(false);
  const [editingBeaconIndex, setEditingBeaconIndex] = useState<number | null>(null);

  // Load user and deck cards
  useEffect(() => {
    async function loadInitialData() {
      // Get user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);
      setAuthLoading(false);
      
      // Load deck cards
      const { data } = await supabase
        .from("deck_cards")
        .select("id, name")
        .order("name");
      if (data) setDeckCards(data);
    }
    loadInitialData();
  }, []);

  const updateDraft = (updates: Partial<TreasureMapDraft>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  };

  const addBeacon = () => {
    const newOrder = draft.beacons.length + 1;
    setDraft((prev) => ({
      ...prev,
      beacons: [...prev.beacons, createEmptyBeacon(newOrder)],
    }));
  };

  const updateBeacon = (index: number, updates: Partial<Beacon>) => {
    setDraft((prev) => ({
      ...prev,
      beacons: prev.beacons.map((b, i) => (i === index ? { ...b, ...updates } : b)),
    }));
  };

  const removeBeacon = (index: number) => {
    if (draft.beacons.length <= 1) {
      toast.error("Map must have at least one beacon");
      return;
    }
    setDraft((prev) => ({
      ...prev,
      beacons: prev.beacons
        .filter((_, i) => i !== index)
        .map((b, i) => ({ ...b, beacon_order: i + 1 })),
    }));
  };

  const moveBeacon = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= draft.beacons.length) return;
    const newBeacons = [...draft.beacons];
    const [moved] = newBeacons.splice(fromIndex, 1);
    newBeacons.splice(toIndex, 0, moved);
    setDraft((prev) => ({
      ...prev,
      beacons: newBeacons.map((b, i) => ({ ...b, beacon_order: i + 1 })),
    }));
  };

  const addEndQuestion = () => {
    setDraft((prev) => ({
      ...prev,
      end_questions: [...prev.end_questions, createEmptyQuestion()],
    }));
  };

  const removeEndQuestion = (index: number) => {
    setDraft((prev) => ({
      ...prev,
      end_questions: prev.end_questions.filter((_, i) => i !== index),
    }));
  };

  const updateEndQuestion = (index: number, updates: Partial<EndQuestion>) => {
    setDraft((prev) => ({
      ...prev,
      end_questions: prev.end_questions.map((q, i) =>
        i === index ? { ...q, ...updates } : q
      ),
    }));
  };

  const validateDraft = (): string[] => {
    const errors: string[] = [];
    if (!draft.name.trim()) errors.push("Map name is required");
    if (draft.beacons.length === 0) errors.push("At least one beacon is required");
    draft.beacons.forEach((b, i) => {
      if (!b.name.trim()) errors.push(`Beacon ${i + 1}: Name is required`);
      if (!b.location_path.trim()) errors.push(`Beacon ${i + 1}: Location is required`);
    });
    return errors;
  };

  const saveDraft = async () => {
    const errors = validateDraft();
    if (errors.length > 0) {
      errors.forEach((e) => toast.error(e));
      return;
    }

    setSaving(true);
    try {
      // Upsert the map
      const mapData = {
        creator_id: user?.id,
        name: draft.name,
        description: draft.description,
        map_type: draft.map_type,
        visibility: draft.visibility,
        reward_credits: draft.reward_credits,
        reward_marks: draft.reward_marks,
        reward_badge: draft.reward_badge || null,
        reward_card_id: draft.reward_card_id || null,
        end_questions: draft.end_questions,
      };

      let mapId = draft.id;
      if (mapId) {
        const { error } = await supabase
          .from("treasure_maps")
          .update(mapData)
          .eq("id", mapId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("treasure_maps")
          .insert(mapData)
          .select("id")
          .single();
        if (error) throw error;
        mapId = data.id;
        updateDraft({ id: mapId });
      }

      // Delete existing beacons and re-insert
      await supabase.from("map_beacons").delete().eq("map_id", mapId);

      const beaconInserts = draft.beacons.map((b) => ({
        map_id: mapId,
        beacon_order: b.beacon_order,
        name: b.name,
        location_type: b.location_type,
        location_path: b.location_path,
        task_description: b.task_description,
        task_type: b.task_type,
        task_answer: b.task_answer || null,
        hint: b.hint || null,
        next_beacon_ids: b.next_beacon_ids.length > 0 ? b.next_beacon_ids : null,
      }));

      const { error: beaconError } = await supabase
        .from("map_beacons")
        .insert(beaconInserts);
      if (beaconError) throw beaconError;

      toast.success("Draft saved!");
    } catch (err: any) {
      toast.error(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const publishMap = async () => {
    const errors = validateDraft();
    if (errors.length > 0) {
      errors.forEach((e) => toast.error(e));
      return;
    }

    setPublishing(true);
    try {
      await saveDraft();
      
      const { error } = await supabase
        .from("treasure_maps")
        .update({ published_at: new Date().toISOString() })
        .eq("id", draft.id);
      
      if (error) throw error;
      
      toast.success("Treasure map published!");
      navigate(`/treasure-map/${draft.id}`);
    } catch (err: any) {
      toast.error(`Publish failed: ${err.message}`);
    } finally {
      setPublishing(false);
    }
  };

  if (authLoading) {
    return (
      <PortalPageLayout>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Map className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Create Treasure Map</h1>
            <p className="text-muted-foreground">
              Design a hunt for others to explore
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={saveDraft} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Draft"}
          </Button>
          <Button onClick={publishMap} disabled={publishing}>
            <Send className="w-4 h-4 mr-2" />
            {publishing ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basics">Basics</TabsTrigger>
          <TabsTrigger value="beacons">Beacons ({draft.beacons.length})</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="questions">End Questions</TabsTrigger>
        </TabsList>

        {/* BASICS TAB */}
        <TabsContent value="basics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Map Details</CardTitle>
              <CardDescription>Give your treasure map a name and description</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Map Name *</Label>
                <Input
                  id="name"
                  value={draft.name}
                  onChange={(e) => updateDraft({ name: e.target.value })}
                  placeholder="The Hidden Path to Knowledge"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={draft.description}
                  onChange={(e) => updateDraft({ description: e.target.value })}
                  placeholder="Describe what explorers will discover on this journey..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Map Type</CardTitle>
              <CardDescription>How should explorers navigate?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {MAP_TYPES.map((type) => (
                  <div
                    key={type.value}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      draft.map_type === type.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => updateDraft({ map_type: type.value as any })}
                  >
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-muted-foreground">{type.desc}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Visibility</CardTitle>
              <CardDescription>Who can discover and play this map?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {VISIBILITY_OPTIONS.map((vis) => {
                  const Icon = vis.icon;
                  return (
                    <div
                      key={vis.value}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex items-start gap-3 ${
                        draft.visibility === vis.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => updateDraft({ visibility: vis.value as any })}
                    >
                      <Icon className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <div className="font-medium">{vis.label}</div>
                        <div className="text-sm text-muted-foreground">{vis.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BEACONS TAB */}
        <TabsContent value="beacons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Waypoints / Beacons</span>
                <Button size="sm" onClick={addBeacon}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Beacon
                </Button>
              </CardTitle>
              <CardDescription>
                Add locations for explorers to visit. Drag to reorder.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {draft.beacons.map((beacon, index) => (
                <div
                  key={beacon.tempId}
                  className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30"
                >
                  <div className="flex flex-col items-center gap-1">
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                    <Badge variant="outline" className="text-xs">
                      {beacon.beacon_order}
                    </Badge>
                    <div className="flex flex-col gap-1 mt-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveBeacon(index, index - 1)}
                        disabled={index === 0}
                      >
                        ▲
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveBeacon(index, index + 1)}
                        disabled={index === draft.beacons.length - 1}
                      >
                        ▼
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Beacon Name *</Label>
                        <Input
                          value={beacon.name}
                          onChange={(e) => updateBeacon(index, { name: e.target.value })}
                          placeholder="The First Clue"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Location Type</Label>
                        <Select
                          value={beacon.location_type}
                          onValueChange={(v) => updateBeacon(index, { location_type: v as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LOCATION_TYPES.map((lt) => (
                              <SelectItem key={lt.value} value={lt.value}>
                                {lt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Location Path *</Label>
                      <Input
                        value={beacon.location_path}
                        onChange={(e) => updateBeacon(index, { location_path: e.target.value })}
                        placeholder={
                          LOCATION_TYPES.find((lt) => lt.value === beacon.location_type)?.placeholder
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Task Type</Label>
                        <Select
                          value={beacon.task_type}
                          onValueChange={(v) => updateBeacon(index, { task_type: v as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TASK_TYPES.map((tt) => (
                              <SelectItem key={tt.value} value={tt.value}>
                                {tt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {beacon.task_type === "answer" && (
                        <div className="space-y-1">
                          <Label className="text-xs">Correct Answer</Label>
                          <Input
                            value={beacon.task_answer}
                            onChange={(e) => updateBeacon(index, { task_answer: e.target.value })}
                            placeholder="The secret word"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Task Description</Label>
                      <Input
                        value={beacon.task_description}
                        onChange={(e) => updateBeacon(index, { task_description: e.target.value })}
                        placeholder="What should the explorer do here?"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Hint (optional)</Label>
                      <Input
                        value={beacon.hint}
                        onChange={(e) => updateBeacon(index, { hint: e.target.value })}
                        placeholder="A helpful clue if they get stuck"
                      />
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeBeacon(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              {draft.beacons.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No beacons yet. Add your first waypoint!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* REWARDS TAB */}
        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Completion Rewards
              </CardTitle>
              <CardDescription>
                What do explorers receive when they complete the map?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="credits">Credits</Label>
                  <Input
                    id="credits"
                    type="number"
                    min="0"
                    value={draft.reward_credits}
                    onChange={(e) => updateDraft({ reward_credits: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">Platform credits for services</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marks">MARKS</Label>
                  <Input
                    id="marks"
                    type="number"
                    min="0"
                    value={draft.reward_marks}
                    onChange={(e) => updateDraft({ reward_marks: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">Reputation points</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="badge">Badge Name (optional)</Label>
                <Input
                  id="badge"
                  value={draft.reward_badge}
                  onChange={(e) => updateDraft({ reward_badge: e.target.value })}
                  placeholder="Pathfinder"
                />
                <p className="text-xs text-muted-foreground">
                  A badge displayed on the explorer's profile
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="card">Reward Deck Card (optional)</Label>
                <Select
                  value={draft.reward_card_id || "none"}
                  onValueChange={(v) => updateDraft({ reward_card_id: v === "none" ? null : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a card..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No card reward</SelectItem>
                    {deckCards.map((card) => (
                      <SelectItem key={card.id} value={card.id}>
                        {card.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Award a collectible deck card upon completion
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* END QUESTIONS TAB */}
        <TabsContent value="questions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  End Questions (Time-Rotating)
                </span>
                <Button size="sm" onClick={addEndQuestion}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Question
                </Button>
              </CardTitle>
              <CardDescription>
                Optional final questions with answers that rotate by hour. 
                Add up to 12 answers; specify which is correct for each hour of the day.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {draft.end_questions.map((question, qIndex) => (
                <div key={qIndex} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <Label>Question {qIndex + 1}</Label>
                      <Input
                        value={question.question}
                        onChange={(e) =>
                          updateEndQuestion(qIndex, { question: e.target.value })
                        }
                        placeholder="What is the meaning of the Golden Key?"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => removeEndQuestion(qIndex)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Answers (up to 12)</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {question.answers.slice(0, 12).map((answer, aIndex) => (
                        <Input
                          key={aIndex}
                          value={answer}
                          onChange={(e) => {
                            const newAnswers = [...question.answers];
                            newAnswers[aIndex] = e.target.value;
                            updateEndQuestion(qIndex, { answers: newAnswers });
                          }}
                          placeholder={`Answer ${aIndex + 1}`}
                          className="text-sm"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <p>
                      Time-rotating: Configure which answer is correct for each hour (0-23) 
                      in advanced settings. Default: Answer 1 is always correct.
                    </p>
                  </div>
                </div>
              ))}

              {draft.end_questions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <HelpCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No end questions. Explorers complete immediately after the last beacon.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview / Validation */}
      <Card className="border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Beacons:</span>{" "}
                <span className="font-medium">{draft.beacons.length}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Rewards:</span>{" "}
                <span className="font-medium">
                  {draft.reward_credits > 0 && `${draft.reward_credits} credits`}
                  {draft.reward_credits > 0 && draft.reward_marks > 0 && ", "}
                  {draft.reward_marks > 0 && `${draft.reward_marks} MARKS`}
                  {!draft.reward_credits && !draft.reward_marks && "None"}
                </span>
              </div>
              <div>
                <Badge variant="outline">{draft.visibility}</Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => toast.info("Preview coming soon!")}>
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </Button>
          </div>
        </CardContent>
      </Card>
    </PortalPageLayout>
  );
}
