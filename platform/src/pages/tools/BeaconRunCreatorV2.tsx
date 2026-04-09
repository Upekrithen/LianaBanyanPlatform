import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Eye } from "lucide-react";
import { toast } from "sonner";
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
import { ChallengeTypeSelector } from "@/components/v2/beacons/ChallengeTypeSelector";
import { MapDesigner } from "@/components/v2/beacons/MapDesigner";
import { PacingDifficultyPanel } from "@/components/v2/beacons/PacingDifficultyPanel";
import { PublishCheck, PublishControls } from "@/components/v2/beacons/PublishControls";
import { RewardsConfig } from "@/components/v2/beacons/RewardsConfig";
import { RunGoalCapture } from "@/components/v2/beacons/RunGoalCapture";
import { RunPreview } from "@/components/v2/beacons/RunPreview";
import {
  BeaconOption,
  DifficultyTier,
  NarrativeCheckpoint,
  NarrativeVerb,
  RunRewards,
} from "@/components/v2/beacons/types";

const STEPS = [
  "Run goal capture",
  "Map designer",
  "Challenge types",
  "Pacing and difficulty",
  "Rewards",
  "Preview",
  "Publish",
];

const DEFAULT_CHECKS: PublishCheck[] = [
  { id: "story", label: "Run goal and one-sentence story are complete.", checked: false },
  { id: "verbs", label: "All checkpoints use narrative verb labels.", checked: false },
  { id: "preview", label: "Participant preview walkthrough is reviewed.", checked: false },
];

function newCheckpoint(verb: NarrativeVerb): NarrativeCheckpoint {
  return {
    id: crypto.randomUUID(),
    verb,
    title: "",
    challengeType: "trivia",
    notes: "",
    beaconId: null,
  };
}

export default function BeaconRunCreatorV2() {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const [activeStep, setActiveStep] = useState(1);
  const [runTitle, setRunTitle] = useState("My Beacon Run");
  const [runGoal, setRunGoal] = useState("");
  const [oneSentenceStory, setOneSentenceStory] = useState("");
  const [beacons, setBeacons] = useState<BeaconOption[]>([]);
  const [checkpoints, setCheckpoints] = useState<NarrativeCheckpoint[]>([]);
  const [beatCount, setBeatCount] = useState(6);
  const [difficulty, setDifficulty] = useState<DifficultyTier>("steady");
  const [estimatedDuration, setEstimatedDuration] = useState(30);
  const [rewards, setRewards] = useState<RunRewards>({ marks: 20, joules: 0, badge: "Beacon Run Completer" });
  const [checks, setChecks] = useState<PublishCheck[]>(DEFAULT_CHECKS);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const storyReady = runGoal.trim().length > 0 && oneSentenceStory.trim().length > 0;

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    const loadBeacons = async () => {
      const { data, error } = await supabase
        .from("beacons")
        .select("id, name, location_path")
        .eq("deposited_by", user.id)
        .eq("is_archived", false)
        .order("created_at", { ascending: false })
        .limit(150);
      if (!mounted) return;
      if (error || !data) {
        setBeacons([]);
        return;
      }
      setBeacons((data as Record<string, any>[]).map((row) => ({
        id: row.id as string,
        name: (row.name as string) || "Beacon",
        location_path: (row.location_path as string) || "",
      })));
    };
    loadBeacons();
    return () => {
      mounted = false;
    };
  }, [user]);

  const attachedBeaconIds = useMemo(
    () => checkpoints.map((item) => item.beaconId).filter(Boolean) as string[],
    [checkpoints],
  );

  const allChecksDone = useMemo(() => checks.every((item) => item.checked), [checks]);

  const saveDraft = async (): Promise<string | null> => {
    if (!user) {
      toast.error("Please sign in to save your run.");
      return null;
    }

    const payload = {
      creator_id: user.id,
      user_id: user.id,
      name: runTitle || "Untitled Beacon Run",
      description: `${runGoal}\n\n${oneSentenceStory}\n\nCheckpoints: ${checkpoints.map((c) => `${c.verb}: ${c.title || "untitled"}`).join(" | ")}`,
      beacon_ids: attachedBeaconIds,
      total_beacons: attachedBeaconIds.length,
      estimated_minutes: estimatedDuration,
      difficulty,
      ante_credits: rewards.marks,
      prize_pool_credits: rewards.joules,
      requires_ghost_mode: false,
      is_published: false,
    };

    try {
      let persistedId = draftId;
      if (draftId) {
        const { error } = await supabase.from("beacon_runs").update(payload as never).eq("id", draftId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("beacon_runs").insert(payload as never).select("id").single();
        if (error || !data) throw error ?? new Error("Draft save failed.");
        persistedId = (data as Record<string, any>).id as string;
        setDraftId(persistedId);
      }
      toast.success("Beacon run draft saved.");
      return persistedId;
    } catch (error) {
      console.error(error);
      toast.error("Could not save beacon run draft.");
      return null;
    }
  };

  const publish = async () => {
    if (!storyReady) {
      toast.error("Complete run goal and one-sentence story first.");
      return;
    }
    if (!allChecksDone) {
      toast.error("Complete publish checks first.");
      return;
    }
    setPublishing(true);
    try {
      const persistedId = await saveDraft();
      if (!persistedId) return;
      const { error } = await supabase
        .from("beacon_runs")
        .update({ is_published: true, published_at: new Date().toISOString() } as never)
        .eq("id", persistedId);
      if (error) throw error;
      toast.success("Beacon run published.");
    } catch (error) {
      console.error(error);
      toast.error("Could not publish beacon run.");
    } finally {
      setPublishing(false);
    }
  };

  const updateCheckpoint = (id: string, patch: Partial<NarrativeCheckpoint>) => {
    setCheckpoints((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const moveCheckpoint = (id: string, direction: "up" | "down") => {
    setCheckpoints((prev) => {
      const index = prev.findIndex((item) => item.id === id);
      if (index < 0) return prev;
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const setCheck = (id: string, checked: boolean) => {
    setChecks((prev) => prev.map((item) => (item.id === id ? { ...item, checked } : item)));
  };

  const sectionBlocked = !storyReady;
  const mobilePrimaryLabel = activeStep < STEPS.length ? (activeStep === 5 ? "Preview" : "Continue") : "Publish";

  return (
    <PortalPageLayout variant="stage" maxWidth="xl" xrayId="beacon-run-creator">
      <div data-tour-target="beacon-run-creator" />

      <div className="mb-6 flex items-center justify-between gap-3">
        <Link to="/beacons" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to Beacons
        </Link>
        <div className="flex items-center gap-2 md:hidden">
          <Button variant="outline" onClick={() => setPreviewOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button variant="outline" onClick={() => void saveDraft()}>
            Save Draft
          </Button>
        </div>
      </div>

      <Hero
        variant="app"
        eyebrow="Tell a story people walk through"
        headline="Sketch a Beacon Run like you'd plan a day with a friend."
        body="The Creator asks for your story first, then helps you lay down beacons, challenges, and rewards that serve that arc."
        primaryCTA={{ label: "Start my run story", onClick: () => setActiveStep(1) }}
        secondaryCTA={{ label: "Browse example runs", href: "/beacon-runs" }}
        proofStrip={["Story-first", "Narrative checkpoints", "Design heuristics built in"]}
      />

      <div className="mt-6 space-y-4">
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="grid gap-2 md:grid-cols-[1fr_auto]">
              <div className="space-y-2">
                <label className="text-sm font-medium">Run title</label>
                <Input value={runTitle} onChange={(event) => setRunTitle(event.target.value)} />
              </div>
              <div className="flex items-end gap-2">
                <Button variant="outline" onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))} disabled={activeStep === 1}>
                  Back
                </Button>
                <Button
                  onClick={() => setActiveStep((prev) => Math.min(STEPS.length, prev + 1))}
                  disabled={activeStep >= STEPS.length || (activeStep === 1 && !storyReady)}
                >
                  Continue
                </Button>
                <Button variant="outline" onClick={() => void saveDraft()}>
                  Save Draft
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Step {activeStep} of {STEPS.length}: {STEPS[activeStep - 1]}
            </p>
          </CardContent>
        </Card>

        {isMobile ? (
          <>
            {activeStep === 1 ? (
              <RunGoalCapture
                runGoal={runGoal}
                oneSentenceStory={oneSentenceStory}
                onRunGoalChange={setRunGoal}
                onStoryChange={setOneSentenceStory}
                fullScreenMobile
              />
            ) : null}
            {activeStep === 2 && storyReady ? (
              <MapDesigner
                checkpoints={checkpoints}
                beaconOptions={beacons}
                onAddCheckpoint={(verb) => setCheckpoints((prev) => [...prev, newCheckpoint(verb)])}
                onUpdateCheckpoint={updateCheckpoint}
                onMoveCheckpoint={moveCheckpoint}
                onRemoveCheckpoint={(id) => setCheckpoints((prev) => prev.filter((item) => item.id !== id))}
              />
            ) : null}
            {activeStep === 3 && storyReady ? (
              <ChallengeTypeSelector
                checkpoints={checkpoints}
                onChangeType={(id, type) => updateCheckpoint(id, { challengeType: type })}
              />
            ) : null}
            {activeStep === 4 && storyReady ? (
              <PacingDifficultyPanel
                beatCount={beatCount}
                difficulty={difficulty}
                estimatedDuration={estimatedDuration}
                onBeatCountChange={setBeatCount}
                onDifficultyChange={setDifficulty}
                onEstimatedDurationChange={setEstimatedDuration}
              />
            ) : null}
            {activeStep === 5 && storyReady ? (
              <RewardsConfig rewards={rewards} onChange={setRewards} />
            ) : null}
            {activeStep === 6 && storyReady ? (
              <RunPreview runTitle={runTitle} oneSentenceStory={oneSentenceStory} checkpoints={checkpoints} />
            ) : null}
            {activeStep === 7 && storyReady ? (
              <PublishControls
                checks={checks}
                publishDisabled={!allChecksDone}
                publishing={publishing}
                onToggleCheck={setCheck}
                onSaveDraft={() => void saveDraft()}
                onPublish={() => void publish()}
              />
            ) : null}
          </>
        ) : (
          <div className="space-y-6">
            <section>
              <RunGoalCapture
                runGoal={runGoal}
                oneSentenceStory={oneSentenceStory}
                onRunGoalChange={setRunGoal}
                onStoryChange={setOneSentenceStory}
              />
            </section>

            {sectionBlocked ? (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                  Complete run goal and one-sentence story to unlock map design, challenge types, pacing, rewards, preview, and publishing.
                </CardContent>
              </Card>
            ) : (
              <>
                <MapDesigner
                  checkpoints={checkpoints}
                  beaconOptions={beacons}
                  onAddCheckpoint={(verb) => setCheckpoints((prev) => [...prev, newCheckpoint(verb)])}
                  onUpdateCheckpoint={updateCheckpoint}
                  onMoveCheckpoint={moveCheckpoint}
                  onRemoveCheckpoint={(id) => setCheckpoints((prev) => prev.filter((item) => item.id !== id))}
                />
                <ChallengeTypeSelector
                  checkpoints={checkpoints}
                  onChangeType={(id, type) => updateCheckpoint(id, { challengeType: type })}
                />
                <PacingDifficultyPanel
                  beatCount={beatCount}
                  difficulty={difficulty}
                  estimatedDuration={estimatedDuration}
                  onBeatCountChange={setBeatCount}
                  onDifficultyChange={setDifficulty}
                  onEstimatedDurationChange={setEstimatedDuration}
                />
                <RewardsConfig rewards={rewards} onChange={setRewards} />
                <RunPreview runTitle={runTitle} oneSentenceStory={oneSentenceStory} checkpoints={checkpoints} />
                <PublishControls
                  checks={checks}
                  publishDisabled={!allChecksDone}
                  publishing={publishing}
                  onToggleCheck={setCheck}
                  onSaveDraft={() => void saveDraft()}
                  onPublish={() => void publish()}
                />
              </>
            )}
          </div>
        )}
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="h-screen w-screen max-w-none rounded-none p-4" draggable={false}>
          <DialogHeader>
            <DialogTitle>Beacon Run Preview</DialogTitle>
          </DialogHeader>
          <RunPreview runTitle={runTitle} oneSentenceStory={oneSentenceStory} checkpoints={checkpoints} />
        </DialogContent>
      </Dialog>

      {isMobile ? (
        <StickyMobileCTA
          primary={{
            label: mobilePrimaryLabel,
            onClick: () => {
              if (activeStep < STEPS.length) {
                if (activeStep === 1 && !storyReady) return;
                setActiveStep((prev) => Math.min(STEPS.length, prev + 1));
                return;
              }
              if (!allChecksDone) return;
              void publish();
            },
          }}
          secondary={{ label: "Save Draft", onClick: () => void saveDraft() }}
        />
      ) : null}
    </PortalPageLayout>
  );
}
