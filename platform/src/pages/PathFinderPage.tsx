/**
 * PathFinder — Persistent career/skills discovery journal.
 * Members log work experiences, system detects patterns,
 * matches to Treasure Maps and Cold Start pathways.
 *
 * "I've had hundreds of jobs. Each one taught me something.
 *  PathFinder helps you learn faster." — The Founder
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Compass, Plus, Star, TrendingUp, Briefcase, Clock,
  ThumbsUp, ThumbsDown, ChevronRight, Sparkles, MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";

const CATEGORIES = [
  { value: "food", label: "Food & Restaurant" },
  { value: "delivery", label: "Delivery & Logistics" },
  { value: "service", label: "Service & Repair" },
  { value: "manufacturing", label: "Manufacturing & Production" },
  { value: "digital", label: "Digital & Technology" },
  { value: "education", label: "Education & Teaching" },
  { value: "healthcare", label: "Healthcare" },
  { value: "retail", label: "Retail & Sales" },
  { value: "trade", label: "Trade & Skilled Labor" },
  { value: "creative", label: "Creative & Design" },
  { value: "other", label: "Other" },
] as const;

const DURATIONS = [
  { value: "one_day", label: "A day" },
  { value: "one_week", label: "About a week" },
  { value: "one_month", label: "About a month" },
  { value: "several_months", label: "Several months" },
  { value: "years", label: "Years" },
] as const;

const ASPECT_TAGS = [
  "people", "movement", "autonomy", "creativity", "routine",
  "problem_solving", "outdoors", "teamwork", "learning", "leadership",
] as const;

type AspectTag = (typeof ASPECT_TAGS)[number];

interface JournalEntry {
  id: string;
  user_id: string;
  experience_title: string;
  experience_category: string | null;
  rating: number | null;
  liked_aspects: string[] | null;
  disliked_aspects: string[] | null;
  notes: string | null;
  duration: string | null;
  would_do_again: boolean | null;
  marks_earned: number;
  created_at: string;
}

function usePathfinderEntries() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["pathfinder-journal", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("pathfinder_journal" as never)
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false }) as { data: JournalEntry[] | null };
      return data || [];
    },
    enabled: !!user,
  });
}

function useCreateEntry() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (params: {
      experience_title: string;
      experience_category: string;
      rating: number;
      liked_aspects: string[];
      disliked_aspects: string[];
      notes: string;
      duration: string;
      would_do_again: boolean;
    }) => {
      const { data, error } = await supabase
        .from("pathfinder_journal" as never)
        .insert({
          user_id: user!.id,
          ...params,
        } as never)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as JournalEntry;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pathfinder-journal"] });
    },
  });
}

function PatternDetection({ entries }: { entries: JournalEntry[] }) {
  if (entries.length < 3) return null;

  const likeCounts: Record<string, number> = {};
  const dislikeCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  let highRated = 0;

  for (const e of entries) {
    if (e.liked_aspects) e.liked_aspects.forEach(a => { likeCounts[a] = (likeCounts[a] || 0) + 1; });
    if (e.disliked_aspects) e.disliked_aspects.forEach(a => { dislikeCounts[a] = (dislikeCounts[a] || 0) + 1; });
    if (e.experience_category) categoryCounts[e.experience_category] = (categoryCounts[e.experience_category] || 0) + 1;
    if (e.rating && e.rating >= 4) highRated++;
  }

  const topLiked = Object.entries(likeCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const topDisliked = Object.entries(dislikeCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Your Pattern Profile
        </CardTitle>
        <CardDescription>
          Based on {entries.length} logged experiences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {topLiked.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">You thrive with</p>
            <div className="flex flex-wrap gap-1">
              {topLiked.map(([tag, count]) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag.replace(/_/g, " ")} ({count}×)
                </Badge>
              ))}
            </div>
          </div>
        )}
        {topDisliked.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">You avoid</p>
            <div className="flex flex-wrap gap-1">
              {topDisliked.map(([tag, count]) => (
                <Badge key={tag} variant="outline" className="text-xs text-destructive">
                  {tag.replace(/_/g, " ")} ({count}×)
                </Badge>
              ))}
            </div>
          </div>
        )}
        {topCategory && (
          <p className="text-sm">
            Top category: <strong>{CATEGORIES.find(c => c.value === topCategory[0])?.label || topCategory[0]}</strong> ({topCategory[1]} entries)
          </p>
        )}
        {highRated > 0 && (
          <p className="text-sm text-muted-foreground">
            {highRated} of {entries.length} experiences rated 4+ stars
          </p>
        )}
        <Button variant="outline" size="sm" asChild className="w-full mt-2">
          <Link to="/treasure-maps">
            <MapPin className="w-4 h-4 mr-2" />
            Browse Matching Treasure Maps
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function AspectSelector({
  label,
  icon: Icon,
  selected,
  onChange,
}: {
  label: string;
  icon: typeof ThumbsUp;
  selected: AspectTag[];
  onChange: (tags: AspectTag[]) => void;
}) {
  const toggle = (tag: AspectTag) => {
    onChange(
      selected.includes(tag)
        ? selected.filter(t => t !== tag)
        : [...selected, tag]
    );
  };

  return (
    <div>
      <Label className="flex items-center gap-1 mb-2">
        <Icon className="w-4 h-4" /> {label}
      </Label>
      <div className="flex flex-wrap gap-2">
        {ASPECT_TAGS.map(tag => (
          <Badge
            key={tag}
            variant={selected.includes(tag) ? "default" : "outline"}
            className="cursor-pointer text-xs"
            onClick={() => toggle(tag)}
          >
            {tag.replace(/_/g, " ")}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="p-0.5 hover:scale-110 transition-transform"
        >
          <Star
            className={`w-6 h-6 ${n <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
          />
        </button>
      ))}
      <span className="text-sm text-muted-foreground ml-2">
        {value === 0 ? "" : value <= 2 ? "Not for me" : value === 3 ? "It was okay" : value === 4 ? "Enjoyed it" : "Loved it"}
      </span>
    </div>
  );
}

function NewEntryDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [rating, setRating] = useState(0);
  const [liked, setLiked] = useState<AspectTag[]>([]);
  const [disliked, setDisliked] = useState<AspectTag[]>([]);
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState("");
  const [wouldDoAgain, setWouldDoAgain] = useState<boolean | null>(null);

  const createEntry = useCreateEntry();

  const reset = () => {
    setTitle(""); setCategory(""); setRating(0);
    setLiked([]); setDisliked([]); setNotes("");
    setDuration(""); setWouldDoAgain(null);
  };

  const handleSubmit = () => {
    if (!title.trim() || !category || rating === 0) return;
    createEntry.mutate({
      experience_title: title.trim(),
      experience_category: category,
      rating,
      liked_aspects: liked,
      disliked_aspects: disliked,
      notes: notes.trim(),
      duration,
      would_do_again: wouldDoAgain ?? false,
    }, {
      onSuccess: () => { reset(); setOpen(false); },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Compass className="w-5 h-5" />
            Log an Experience
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label htmlFor="exp-title">What did you do?</Label>
            <Input
              id="exp-title"
              placeholder="e.g. Delivered groceries for a week"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Pick a category" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>How was it?</Label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          <AspectSelector label="What I liked" icon={ThumbsUp} selected={liked} onChange={setLiked} />
          <AspectSelector label="What I didn't like" icon={ThumbsDown} selected={disliked} onChange={setDisliked} />

          <div>
            <Label>How long?</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger><SelectValue placeholder="Duration" /></SelectTrigger>
              <SelectContent>
                {DURATIONS.map(d => (
                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Would you do it again?</Label>
            <div className="flex gap-2 mt-1">
              <Button
                type="button"
                variant={wouldDoAgain === true ? "default" : "outline"}
                size="sm"
                onClick={() => setWouldDoAgain(true)}
              >
                Yes
              </Button>
              <Button
                type="button"
                variant={wouldDoAgain === false ? "default" : "outline"}
                size="sm"
                onClick={() => setWouldDoAgain(false)}
              >
                No
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="exp-notes">Notes (optional)</Label>
            <Textarea
              id="exp-notes"
              placeholder="What did you learn? Any surprises?"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            className="w-full"
            disabled={!title.trim() || !category || rating === 0 || createEntry.isPending}
            onClick={handleSubmit}
          >
            {createEntry.isPending ? "Saving..." : "Log Experience (+1 Mark)"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EntryCard({ entry }: { entry: JournalEntry }) {
  const cat = CATEGORIES.find(c => c.value === entry.experience_category);
  const dur = DURATIONS.find(d => d.value === entry.duration);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-4 space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium">{entry.experience_title}</p>
            <div className="flex items-center gap-2 mt-1">
              {cat && <Badge variant="outline" className="text-xs">{cat.label}</Badge>}
              {dur && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {dur.label}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${i < (entry.rating || 0) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
              />
            ))}
          </div>
        </div>

        {(entry.liked_aspects?.length || entry.disliked_aspects?.length) && (
          <div className="flex flex-wrap gap-1">
            {entry.liked_aspects?.map(a => (
              <Badge key={`l-${a}`} className="text-[10px] bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                +{a.replace(/_/g, " ")}
              </Badge>
            ))}
            {entry.disliked_aspects?.map(a => (
              <Badge key={`d-${a}`} className="text-[10px] bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                −{a.replace(/_/g, " ")}
              </Badge>
            ))}
          </div>
        )}

        {entry.notes && <p className="text-xs text-muted-foreground line-clamp-2">{entry.notes}</p>}

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>{new Date(entry.created_at).toLocaleDateString()}</span>
          <span className="flex items-center gap-1">
            {entry.would_do_again ? "Would do again ✓" : "Wouldn't repeat"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PathFinderPage() {
  const { user } = useAuth();
  const { data: entries = [], isLoading } = usePathfinderEntries();

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center space-y-4" data-xray-id="pathfinder-guest">
        <Compass className="w-16 h-16 mx-auto text-primary" />
        <h1 className="text-3xl font-bold">PathFinder</h1>
        <p className="text-lg text-muted-foreground">
          Discover what you love doing — one experience at a time.
        </p>
        <p className="text-muted-foreground">
          Track what you try. See patterns emerge. Get matched to paths that fit YOU.
        </p>
        <blockquote className="border-l-4 border-primary pl-4 italic text-sm text-muted-foreground">
          "I've had hundreds of jobs. Each one taught me something. PathFinder helps you learn faster."
          <br />— The Founder
        </blockquote>
        <Button asChild size="lg">
          <Link to="/membership">Join for $5/year to start your journal</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6" data-xray-id="pathfinder-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Compass className="w-7 h-7 text-primary" />
            PathFinder
          </h1>
          <p className="text-muted-foreground">
            Log experiences. Discover patterns. Find your path.
          </p>
        </div>
        <NewEntryDialog>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Log Experience
          </Button>
        </NewEntryDialog>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <Briefcase className="w-5 h-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold">{entries.length}</p>
            <p className="text-xs text-muted-foreground">Experiences</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Star className="w-5 h-5 mx-auto text-amber-500 mb-1" />
            <p className="text-2xl font-bold">
              {entries.length > 0
                ? (entries.reduce((s, e) => s + (e.rating || 0), 0) / entries.length).toFixed(1)
                : "—"}
            </p>
            <p className="text-xs text-muted-foreground">Avg Rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <TrendingUp className="w-5 h-5 mx-auto text-green-500 mb-1" />
            <p className="text-2xl font-bold">
              {entries.filter(e => e.would_do_again).length}
            </p>
            <p className="text-xs text-muted-foreground">Would Repeat</p>
          </CardContent>
        </Card>
      </div>

      {/* Pattern detection */}
      <PatternDetection entries={entries} />

      {/* Journal entries */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading your journal...</div>
      ) : entries.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-8 pb-8 text-center space-y-3">
            <Compass className="w-12 h-12 mx-auto text-muted-foreground/50" />
            <h3 className="font-semibold text-lg">Your journal is empty</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Log your first experience — any job, gig, volunteer work, or side project.
              Platform or not. PathFinder learns from everything.
            </p>
            <NewEntryDialog>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Log Your First Experience
              </Button>
            </NewEntryDialog>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            Your Journal
            <Badge variant="secondary">{entries.length}</Badge>
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {entries.map(entry => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      )}

      {/* CTA to Treasure Maps */}
      <Card className="bg-muted/50">
        <CardContent className="pt-4 flex items-center justify-between">
          <div>
            <p className="font-medium">Ready for your next step?</p>
            <p className="text-sm text-muted-foreground">
              Treasure Maps are step-by-step guides written by people who've been there.
            </p>
          </div>
          <Button variant="outline" asChild className="shrink-0">
            <Link to="/treasure-maps" className="gap-2">
              Browse Maps <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
