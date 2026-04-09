import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Eye } from "lucide-react";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Hero } from "@/components/v2/Hero";
import { StickyMobileCTA } from "@/components/v2/StickyMobileCTA";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CephasContentPicker } from "@/components/v2/treasure-maps/CephasContentPicker";
import { DifficultyRewardConfig } from "@/components/v2/treasure-maps/DifficultyRewardConfig";
import { FullPreviewMode } from "@/components/v2/treasure-maps/FullPreviewMode";
import { NodeQuizEditor } from "@/components/v2/treasure-maps/NodeQuizEditor";
import { PathSequenceBuilder } from "@/components/v2/treasure-maps/PathSequenceBuilder";
import { PublishChecklist, PublishChecklistItem } from "@/components/v2/treasure-maps/PublishChecklist";
import { TemplateOrBlankChooser } from "@/components/v2/treasure-maps/TemplateOrBlankChooser";
import {
  CephasLibraryItem,
  DifficultyTier,
  RewardConfig,
  SequenceNode,
  TemplatePreset,
} from "@/components/v2/treasure-maps/types";

const STEP_LABELS = [
  "Choose start",
  "Pick Cephas content",
  "Build sequence",
  "Edit quizzes",
  "Difficulty and rewards",
  "Preview walkthrough",
  "Publish checklist",
];

const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: "onboarding",
    title: "Onboarding Path",
    description: "A short intro journey for first-time learners.",
    suggestedDifficulty: "starter",
  },
  {
    id: "deep-dive",
    title: "Deep Dive",
    description: "A structured multi-node path for focused study.",
    suggestedDifficulty: "guided",
  },
  {
    id: "challenge",
    title: "Challenge Run",
    description: "A tougher route with advanced ordering and checks.",
    suggestedDifficulty: "challenging",
  },
];

const DEFAULT_CHECKLIST: PublishChecklistItem[] = [
  { id: "title", label: "Map has a clear title.", checked: false },
  { id: "content", label: "At least one Cephas node is selected.", checked: false },
  { id: "quiz", label: "Each node has a question prompt and answer key.", checked: false },
  { id: "preview", label: "Full preview walkthrough has been reviewed.", checked: false },
];

function getDifficultyLevel(tier: DifficultyTier) {
  if (tier === "starter") return 1;
  if (tier === "guided") return 2;
  return 3;
}

function createNodeFromContent(item: CephasLibraryItem): SequenceNode {
  return {
    id: crypto.randomUUID(),
    contentId: item.id,
    title: item.title,
    slug: item.slug,
    category: item.category,
    notes: "",
    questionType: "multiple_choice",
    prompt: "",
    options: ["", "", ""],
    correctAnswers: [],
    explanation: "",
  };
}

export default function TreasureMapBuilderV2() {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const [activeStep, setActiveStep] = useState(1);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [loadingLibrary, setLoadingLibrary] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);

  const [mapTitle, setMapTitle] = useState("My Treasure Map");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [libraryItems, setLibraryItems] = useState<CephasLibraryItem[]>([]);
  const [nodes, setNodes] = useState<SequenceNode[]>([]);
  const [difficulty, setDifficulty] = useState<DifficultyTier>("starter");
  const [rewards, setRewards] = useState<RewardConfig>({
    marks: 25,
    joules: 0,
    badge: "Cephas Path Completer",
  });
  const [checklist, setChecklist] = useState<PublishChecklistItem[]>(DEFAULT_CHECKLIST);

  useEffect(() => {
    let mounted = true;
    const loadLibrary = async () => {
      setLoadingLibrary(true);
      const { data, error } = await supabase
        .from("cephas_content_registry")
        .select("id, title, slug, category, updated_at")
        .order("updated_at", { ascending: false })
        .limit(300);

      if (!mounted) return;

      if (error || !data) {
        setLibraryItems([]);
        toast.error("Could not load Cephas library.");
      } else {
        setLibraryItems(
          (data as Record<string, any>[]).map((row) => ({
            id: row.id as string,
            title: row.title as string,
            slug: row.slug as string,
            category: (row.category as string) ?? "general",
            updated_at: (row.updated_at as string | null) ?? null,
          })),
        );
      }
      setLoadingLibrary(false);
    };

    loadLibrary();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    let mounted = true;

    const loadDraft = async () => {
      const { data, error } = await supabase
        .from("treasure_maps")
        .select("*")
        .eq("user_id", user.id)
        .eq("map_type", "cephas_learning_path")
        .eq("is_published", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!mounted || error || !data) return;

      const draft = data as Record<string, any>;
      const routeData = (draft.route_data ?? {}) as Record<string, any>;
      setDraftId((draft.id as string) ?? null);
      setMapTitle((draft.title as string) || (draft.name as string) || "My Treasure Map");
      setDifficulty((routeData.difficulty as DifficultyTier) ?? "starter");
      setRewards({
        marks: Number(routeData.rewards?.marks ?? draft.reward_marks ?? 25),
        joules: Number(routeData.rewards?.joules ?? draft.reward_credits ?? 0),
        badge: (routeData.rewards?.badge as string) ?? (draft.reward_badge as string) ?? "Cephas Path Completer",
      });
      setSelectedTemplateId((routeData.templateId as string) ?? null);
      setChecklist(
        Array.isArray(routeData.checklist)
          ? (routeData.checklist as PublishChecklistItem[])
          : DEFAULT_CHECKLIST,
      );
      if (Array.isArray(routeData.nodes)) {
        setNodes(routeData.nodes as SequenceNode[]);
      }
    };

    loadDraft();
    return () => {
      mounted = false;
    };
  }, [user]);

  const selectedContentIds = useMemo(() => nodes.map((node) => node.contentId), [nodes]);

  const allQuizReady = useMemo(() => {
    if (nodes.length === 0) return false;
    return nodes.every((node) => node.prompt.trim().length > 0 && node.correctAnswers.length > 0);
  }, [nodes]);

  const allChecklistChecked = useMemo(() => checklist.every((item) => item.checked), [checklist]);

  const canMoveForward = useMemo(() => {
    if (activeStep === 1) return true;
    if (activeStep === 2) return nodes.length > 0;
    if (activeStep === 3) return nodes.length > 0;
    if (activeStep === 4) return allQuizReady;
    if (activeStep === 5) return true;
    if (activeStep === 6) return true;
    if (activeStep === 7) return allChecklistChecked;
    return false;
  }, [activeStep, allChecklistChecked, allQuizReady, nodes.length]);

  const setChecklistItem = (id: string, next: boolean) => {
    setChecklist((prev) => prev.map((item) => (item.id === id ? { ...item, checked: next } : item)));
  };

  const toggleSelection = (item: CephasLibraryItem) => {
    setNodes((prev) => {
      const existing = prev.find((node) => node.contentId === item.id);
      if (existing) {
        return prev.filter((node) => node.contentId !== item.id);
      }
      return [...prev, createNodeFromContent(item)];
    });
  };

  const moveNode = (fromId: string, toId: string) => {
    setNodes((prev) => {
      const fromIndex = prev.findIndex((node) => node.id === fromId);
      const toIndex = prev.findIndex((node) => node.id === toId);
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const moveNodeByArrow = (id: string, direction: "up" | "down") => {
    setNodes((prev) => {
      const index = prev.findIndex((node) => node.id === id);
      if (index < 0) return prev;
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const updateNode = (id: string, patch: Partial<SequenceNode>) => {
    setNodes((prev) => prev.map((node) => (node.id === id ? { ...node, ...patch } : node)));
  };

  const applyTemplate = (templateId: string) => {
    const template = TEMPLATE_PRESETS.find((entry) => entry.id === templateId);
    setSelectedTemplateId(templateId);
    if (template) {
      setDifficulty(template.suggestedDifficulty);
      setMapTitle(`${template.title} Treasure Map`);
    }
  };

  const saveDraft = async (): Promise<string | null> => {
    if (!user) {
      toast.error("Please sign in to save your map.");
      return null;
    }

    setSavingDraft(true);
    try {
      const payload = {
        user_id: user.id,
        creator_id: user.id,
        name: mapTitle || "Untitled Treasure Map",
        title: mapTitle || "Untitled Treasure Map",
        description:
          "Treasure Maps combine Cephas content, quiz questions, sequence design, and completion rewards into a guided learning journey that feels creative rather than bureaucratic.",
        map_type: "cephas_learning_path",
        is_published: false,
        difficulty_level: getDifficultyLevel(difficulty),
        reward_marks: rewards.marks,
        reward_credits: rewards.joules,
        reward_badge: rewards.badge || null,
        visibility: "private",
        route_data: {
          templateId: selectedTemplateId,
          difficulty,
          rewards,
          nodes,
          checklist,
        },
      };

      let persistedId = draftId;
      if (draftId) {
        const { error } = await supabase.from("treasure_maps").update(payload as never).eq("id", draftId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("treasure_maps")
          .insert(payload as never)
          .select("id")
          .single();
        if (error || !data) throw error ?? new Error("Could not save draft.");
        persistedId = (data as Record<string, any>).id as string;
        setDraftId(persistedId);
      }

      toast.success("Draft saved.");
      return persistedId;
    } catch (error) {
      console.error(error);
      toast.error("Could not save draft.");
      return null;
    } finally {
      setSavingDraft(false);
    }
  };

  const publishMap = async () => {
    if (!allChecklistChecked) {
      toast.error("Complete the publish checklist first.");
      return;
    }
    if (!user) {
      toast.error("Please sign in to publish.");
      return;
    }

    setPublishing(true);
    try {
      const persistedDraftId = await saveDraft();
      if (!persistedDraftId) {
        toast.error("Draft ID missing; save again before publishing.");
        return;
      }

      const { error } = await supabase
        .from("treasure_maps")
        .update({ is_published: true, published_at: new Date().toISOString() } as never)
        .eq("id", persistedDraftId);

      if (error) throw error;
      toast.success("Map published.");
    } catch (error) {
      console.error(error);
      toast.error("Could not publish map.");
    } finally {
      setPublishing(false);
    }
  };

  const goNext = () => setActiveStep((prev) => Math.min(STEP_LABELS.length, prev + 1));
  const goBack = () => setActiveStep((prev) => Math.max(1, prev - 1));

  const renderSection = (step: number) => {
    if (step === 1) {
      return (
        <TemplateOrBlankChooser
          templates={TEMPLATE_PRESETS}
          selectedTemplateId={selectedTemplateId}
          onChooseTemplate={applyTemplate}
          onChooseBlank={() => setSelectedTemplateId(null)}
        />
      );
    }
    if (step === 2) {
      return (
        <CephasContentPicker
          libraryItems={libraryItems}
          selectedIds={selectedContentIds}
          onToggleSelection={toggleSelection}
          isLoading={loadingLibrary}
        />
      );
    }
    if (step === 3) {
      return (
        <PathSequenceBuilder
          nodes={nodes}
          onMoveNode={moveNode}
          onMoveByArrow={moveNodeByArrow}
          onRemoveNode={(id) => setNodes((prev) => prev.filter((node) => node.id !== id))}
        />
      );
    }
    if (step === 4) {
      return <NodeQuizEditor nodes={nodes} onUpdateNode={updateNode} />;
    }
    if (step === 5) {
      return (
        <DifficultyRewardConfig
          difficulty={difficulty}
          rewards={rewards}
          onDifficultyChange={setDifficulty}
          onRewardsChange={setRewards}
        />
      );
    }
    if (step === 6) {
      return <FullPreviewMode mapTitle={mapTitle} nodes={nodes} />;
    }
    return (
      <PublishChecklist
        items={checklist}
        publishDisabled={!allChecklistChecked}
        publishing={publishing}
        onToggle={setChecklistItem}
        onPublish={() => void publishMap()}
        onSaveDraft={() => void saveDraft()}
      />
    );
  };

  const mobilePrimaryLabel = activeStep < 7 ? (activeStep === 5 ? "Preview" : "Continue") : "Publish";

  return (
    <PortalPageLayout variant="stage" maxWidth="xl" xrayId="treasure-map-builder">
      <div data-tour-target="treasure-map-builder" />

      <div className="mb-6 flex items-center justify-between gap-3">
        <Link to="/treasure-maps" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to Treasure Maps
        </Link>
        <div className="flex items-center gap-2 md:hidden">
          <Button type="button" variant="outline" onClick={() => setMobilePreviewOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button type="button" variant="outline" onClick={() => void saveDraft()} disabled={savingDraft}>
            Save Draft
          </Button>
        </div>
      </div>

      <Hero
        variant="app"
        eyebrow="Treasure Map Builder"
        headline="Turn knowledge into a path people can follow"
        body="Treasure Maps combine Cephas content, quiz questions, sequence design, and completion rewards into a guided learning journey that feels creative rather than bureaucratic."
        primaryCTA={{ label: "Start a New Map", onClick: () => setActiveStep(1) }}
        secondaryCTA={{ label: "Preview an Example Map", onClick: () => setActiveStep(6) }}
        proofStrip={[
          "Cephas source library",
          "multiple question types",
          "difficulty settings",
          "completion rewards",
        ]}
      />

      <div className="mt-6 space-y-4">
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="grid gap-2 md:grid-cols-[1fr_auto]">
              <div className="space-y-2">
                <label className="text-sm font-medium">Map title</label>
                <Input value={mapTitle} onChange={(event) => setMapTitle(event.target.value)} />
              </div>
              <div className="flex items-end gap-2">
                <Button variant="outline" onClick={goBack} disabled={activeStep === 1}>
                  Back
                </Button>
                <Button onClick={goNext} disabled={activeStep === 7 || !canMoveForward}>
                  Continue
                </Button>
                <Button variant="outline" onClick={() => void saveDraft()} disabled={savingDraft}>
                  Save Draft
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Step {activeStep} of {STEP_LABELS.length}: {STEP_LABELS[activeStep - 1]}
            </p>
          </CardContent>
        </Card>

        {isMobile ? (
          <div className="space-y-4">{renderSection(activeStep)}</div>
        ) : (
          <div className="space-y-6">
            {STEP_LABELS.map((label, index) => (
              <section key={label} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Step {index + 1}: {label}
                </p>
                {renderSection(index + 1)}
              </section>
            ))}
          </div>
        )}
      </div>

      <Dialog open={mobilePreviewOpen} onOpenChange={setMobilePreviewOpen}>
        <DialogContent className="h-screen w-screen max-w-none rounded-none p-4" draggable={false}>
          <DialogHeader>
            <DialogTitle>Treasure Map Preview</DialogTitle>
          </DialogHeader>
          <FullPreviewMode mapTitle={mapTitle} nodes={nodes} />
        </DialogContent>
      </Dialog>

      {isMobile ? (
        <StickyMobileCTA
          primary={{
            label: mobilePrimaryLabel,
            onClick: () => {
              if (activeStep < 7) {
                if (!canMoveForward) return;
                goNext();
                return;
              }
              if (!allChecklistChecked) return;
              void publishMap();
            },
          }}
          secondary={{
            label: "Save Draft",
            onClick: () => void saveDraft(),
          }}
        />
      ) : null}
    </PortalPageLayout>
  );
}
