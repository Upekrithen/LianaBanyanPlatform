/**
 * GroupDinnerCoordinator — Wave 13 / BP073 W7 (real-data wired)
 * ==============================================================
 * Group dinner coordination mini-app for Let's Make Dinner.
 *
 * Securities-clean: Marks = participation credits, never financial return.
 * Supabase tables: dinner_groups, dinner_contributions, dinner_group_guests
 * Migration: 20260603100001_bp073_w7_lmd_dinner_groups.sql
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DinnerGroup, DinnerContribution, DinnerGroupGuest } from "@/integrations/supabase/initiative-types";
import { useAuth } from "@/contexts/AuthContext";
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  ChefHat,
  Plus,
  Check,
  Coins,
  Calendar,
  MapPin,
  Utensils,
  Star,
  AlertCircle,
} from "lucide-react";
import { format, addDays } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContributionSlot {
  id: string;
  label: string;
  category: "main" | "side" | "dessert" | "drinks" | "supplies";
  estimatedCost: number | null;
  claimedBy: string | null;
  claimedByName: string | null;
  notes: string | null;
}

interface GroupDinner {
  id: string;
  hostId: string;
  hostName: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  location: string;
  maxGuests: number;
  guestCount: number;
  marksForHost: number;
  marksPerContribution: number;
  slots: ContributionSlot[];
  status: "open" | "full" | "closed";
  costPlusPercent: number;
}

// ─── Supabase query hooks ─────────────────────────────────────────────────────

function useDinnerGroups() {
  return useQuery({
    queryKey: ["dinner_groups", "open"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("dinner_groups")
        .select(`
          *,
          dinner_contributions(*),
          dinner_group_guests(count)
        `)
        .eq("status", "open")
        .order("dinner_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as (DinnerGroup & {
        dinner_contributions: DinnerContribution[];
        dinner_group_guests: { count: number }[];
      })[];
    },
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: ContributionSlot["category"] }) {
  const map: Record<ContributionSlot["category"], { label: string; color: string }> = {
    main: { label: "Main", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
    side: { label: "Side", color: "bg-green-500/20 text-green-300 border-green-500/30" },
    dessert: { label: "Dessert", color: "bg-pink-500/20 text-pink-300 border-pink-500/30" },
    drinks: { label: "Drinks", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
    supplies: { label: "Supplies", color: "bg-gray-500/20 text-gray-300 border-gray-500/30" },
  };
  const { label, color } = map[category];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${color}`}>
      {label}
    </span>
  );
}

// ─── Create Dinner Dialog ─────────────────────────────────────────────────────

interface CreateDinnerDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}

function CreateDinnerDialog({ open, onOpenChange, onCreated }: CreateDinnerDialogProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("6:00 PM");
  const [location, setLocation] = useState("");
  const [maxGuests, setMaxGuests] = useState("12");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { error } = await (supabase as any).from("dinner_groups").insert({
        host_id: user.id,
        title,
        description: description || null,
        dinner_date: date,
        max_guests: parseInt(maxGuests, 10),
        location: location || null,
        status: "open",
        marks_for_host: 50,
      });
      if (error) throw error;
      toast({
        title: "Group dinner created!",
        description: "Your neighbors will see it and can join. You earn 50 Marks for hosting.",
      });
      onCreated();
      onOpenChange(false);
      setTitle("");
      setDescription("");
      setDate("");
      setLocation("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-orange-400" />
            Host a Group Dinner
          </DialogTitle>
          <DialogDescription>
            Open your table to neighbors. You earn 50 Marks (participation credits)
            for hosting. Contributors earn 15 Marks each.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label htmlFor="gd-title">Dinner Name *</Label>
            <Input
              id="gd-title"
              required
              placeholder="e.g., Sunday Pasta Night"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="gd-desc">Description</Label>
            <Input
              id="gd-desc"
              placeholder="What will you cook? What do you need neighbors to bring?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="gd-date">Date *</Label>
              <Input
                id="gd-date"
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={format(addDays(new Date(), 1), "yyyy-MM-dd")}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="gd-time">Time</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger id="gd-time">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["12:00 PM", "1:00 PM", "2:00 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM"].map(
                    (t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="gd-location">Location *</Label>
            <Input
              id="gd-location"
              required
              placeholder="Your address or a community space"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="gd-guests">Max Guests</Label>
            <Select value={maxGuests} onValueChange={setMaxGuests}>
              <SelectTrigger id="gd-guests">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["6", "8", "10", "12", "15", "20", "25", "30"].map((n) => (
                  <SelectItem key={n} value={n}>
                    Up to {n} people
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Securities-clean Marks notice */}
          <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-3">
            <p className="text-xs text-orange-200 flex items-start gap-2">
              <Coins className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                <strong>50 Marks</strong> awarded for hosting. Marks are participation
                credits - they unlock platform features and track your contribution to
                the cooperative. They are not financial instruments or equity.
              </span>
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700">
              {isSubmitting ? "Creating..." : "Create Group Dinner"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Dinner Card ──────────────────────────────────────────────────────────────

interface DinnerCardProps {
  dinner: GroupDinner;
  currentUserId: string | null;
  onClaimSlot: (dinnerId: string, slotId: string) => void;
  onJoin: (dinnerId: string) => void;
}

function DinnerCard({ dinner, currentUserId, onClaimSlot, onJoin }: DinnerCardProps) {
  const openSlots = dinner.slots.filter((s) => !s.claimedBy);
  const mySlots = dinner.slots.filter((s) => s.claimedBy === currentUserId);
  const spotsLeft = dinner.maxGuests - dinner.guestCount;

  return (
    <div
      className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4"
      style={{ background: "rgba(255,255,255,0.05)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg leading-tight">{dinner.title}</h3>
          <p className="text-sm opacity-60 mt-0.5">
            Hosted by <strong>{dinner.hostName}</strong>
          </p>
        </div>
        <Badge
          className={
            dinner.status === "open"
              ? "bg-green-500/20 text-green-300 border-green-500/30"
              : "bg-gray-500/20 text-gray-300 border-gray-500/30"
          }
        >
          {dinner.status === "open" ? `${spotsLeft} spots left` : "Full"}
        </Badge>
      </div>

      {dinner.description && (
        <p className="text-sm opacity-70 leading-relaxed">{dinner.description}</p>
      )}

      {/* Details row */}
      <div className="flex flex-wrap gap-3 text-sm opacity-60">
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {format(new Date(dinner.date + "T12:00"), "EEE, MMM d")} at {dinner.time}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {dinner.location}
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {dinner.guestCount}/{dinner.maxGuests} coming
        </span>
      </div>

      {/* Contribution slots */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">
            What's needed ({openSlots.length} open)
          </p>
          <span className="text-xs opacity-50 flex items-center gap-1">
            <Coins className="h-3 w-3" />
            {dinner.marksPerContribution} Marks/contribution
          </span>
        </div>
        <div className="space-y-2">
          {dinner.slots.map((slot) => {
            const isMine = slot.claimedBy === currentUserId;
            const isClaimed = !!slot.claimedBy;
            const costWithMarkup = slot.estimatedCost
              ? (slot.estimatedCost * 1.2).toFixed(2)
              : null;

            return (
              <div
                key={slot.id}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                  isMine
                    ? "bg-orange-500/15 border border-orange-500/30"
                    : isClaimed
                    ? "bg-white/5 opacity-50"
                    : "bg-white/5 border border-white/10"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={isClaimed ? "line-through opacity-60" : ""}>
                      {slot.label}
                    </span>
                    <CategoryBadge category={slot.category} />
                    {costWithMarkup && (
                      <span className="text-xs opacity-50">
                        ~${costWithMarkup} (Cost+20%)
                      </span>
                    )}
                  </div>
                  {slot.notes && (
                    <p className="text-xs opacity-50 mt-0.5">{slot.notes}</p>
                  )}
                </div>

                <div className="flex-shrink-0">
                  {isMine ? (
                    <span className="flex items-center gap-1 text-xs text-orange-300">
                      <Check className="h-3.5 w-3.5" />
                      Claimed
                    </span>
                  ) : isClaimed ? (
                    <span className="text-xs opacity-40">{slot.claimedByName}</span>
                  ) : currentUserId ? (
                    <button
                      onClick={() => onClaimSlot(dinner.id, slot.id)}
                      className="text-xs px-2 py-1 rounded border border-orange-500/40 text-orange-300 hover:bg-orange-500/20 transition-colors"
                    >
                      Claim
                    </button>
                  ) : (
                    <span className="text-xs opacity-30">Sign in</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* My contributions */}
      {mySlots.length > 0 && (
        <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 p-3">
          <p className="text-xs text-orange-200 flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5" />
            You're contributing {mySlots.length} item{mySlots.length > 1 ? "s" : ""}. You
            earn {dinner.marksPerContribution * mySlots.length} Marks (participation credits).
          </p>
        </div>
      )}

      {/* Join button */}
      {dinner.status === "open" && currentUserId && mySlots.length === 0 && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onJoin(dinner.id)}
          className="w-full border-orange-500/40 text-orange-300 hover:bg-orange-500/15"
        >
          <Users className="h-4 w-4 mr-2" />
          Join this dinner
        </Button>
      )}
    </div>
  );
}

// ─── Onboarding Hook Banner ───────────────────────────────────────────────────

function FirstTimeDinnerBanner({ onHost }: { onHost: () => void }) {
  return (
    <div
      className="rounded-xl border border-orange-500/30 p-5 mb-6"
      style={{ background: "rgba(249,115,22,0.08)" }}
    >
      <div className="flex items-start gap-3">
        <Utensils className="h-6 w-6 text-orange-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-orange-200 mb-1">First time? Here's how Group Dinners work.</p>
          <ol className="text-sm text-orange-100/70 space-y-1 list-decimal list-inside">
            <li>A neighbor hosts — they set the date, location, and what's covered.</li>
            <li>Others join and claim ingredient/task slots (Cost+20% reimbursed from the shared pool).</li>
            <li>The host earns 50 Marks. Each contributor earns 15 Marks.</li>
            <li>Marks are participation credits that unlock platform features.</li>
          </ol>
          <button
            onClick={onHost}
            className="mt-3 text-sm px-3 py-1.5 rounded border border-orange-500/40 text-orange-300 hover:bg-orange-500/20 transition-colors"
          >
            Host your first group dinner
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function GroupDinnerCoordinator() {
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  const { data: rawDinners = [], isLoading } = useDinnerGroups();

  // Map DB rows to the local GroupDinner shape for the cards
  const dinners: GroupDinner[] = rawDinners.map((row) => ({
    id: row.id,
    hostId: row.host_id,
    hostName: row.host_id.slice(0, 8),
    title: row.title,
    description: row.description,
    date: row.dinner_date,
    time: "6:00 PM",
    location: row.location ?? "Location TBD",
    maxGuests: row.max_guests,
    guestCount: row.dinner_group_guests?.[0]?.count ?? 0,
    marksForHost: row.marks_for_host,
    marksPerContribution: 15,
    costPlusPercent: 20,
    status: row.status as "open" | "full" | "closed",
    slots: (row.dinner_contributions ?? []).map((c) => ({
      id: c.id,
      label: `${c.slot_label}: ${c.ingredient}`,
      category: "side" as const,
      estimatedCost: null,
      claimedBy: c.contributor_id,
      claimedByName: c.contributor_id.slice(0, 8),
      notes: c.notes,
    })),
  }));

  const claimSlotMutation = useMutation({
    mutationFn: async ({ dinnerId, slotLabel }: { dinnerId: string; slotLabel: string }) => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) throw new Error("Not signed in");
      const { error } = await (supabase as any).from("dinner_contributions").insert({
        group_id: dinnerId,
        contributor_id: u.id,
        slot_label: slotLabel,
        ingredient: slotLabel,
        status: "pledged",
        marks_reward: 15,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dinner_groups", "open"] });
      toast({
        title: "Slot claimed!",
        description: "You've committed to this contribution. +15 Marks (participation credits) will be awarded at dinner time.",
      });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const joinMutation = useMutation({
    mutationFn: async (dinnerId: string) => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) throw new Error("Not signed in");
      const { error } = await (supabase as any).from("dinner_group_guests").insert({
        group_id: dinnerId,
        user_id: u.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dinner_groups", "open"] });
      toast({
        title: "You're in!",
        description: "RSVP confirmed. Claim a contribution slot to earn Marks.",
      });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleClaimSlot = (dinnerId: string, slotId: string) => {
    if (!user) {
      openOnboard({ reason: "join a group dinner", actionLabel: "Join", membershipIncluded: true });
      return;
    }
    claimSlotMutation.mutate({ dinnerId, slotLabel: slotId });
  };

  const handleJoin = (dinnerId: string) => {
    if (!user) {
      openOnboard({ reason: "join a group dinner", actionLabel: "Join", membershipIncluded: true });
      return;
    }
    joinMutation.mutate(dinnerId);
  };

  const handleCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["dinner_groups", "open"] });
  };

  const nodinners = !isLoading && dinners.length === 0;

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-xl font-semibold flex items-center gap-2"
            style={{ color: "#fed7aa" }}
          >
            <Users className="h-5 w-5" />
            Group Dinners
          </h2>
          <p className="text-sm opacity-60 mt-0.5">
            Open a meal to the neighborhood. Claim slots and earn Marks.
          </p>
        </div>
        <button
          onClick={() => {
            if (!user) {
              openOnboard({ reason: "host a group dinner", actionLabel: "Join", membershipIncluded: true });
              return;
            }
            setShowCreate(true);
          }}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-orange-500/40 text-orange-300 hover:bg-orange-500/15 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Host a Dinner
        </button>
      </div>

      {/* Onboarding banner (first visit) */}
      {!hasSeenOnboarding && !nodinners && (
        <FirstTimeDinnerBanner
          onHost={() => {
            setHasSeenOnboarding(true);
            if (!user) {
              openOnboard({ reason: "host a group dinner", actionLabel: "Join", membershipIncluded: true });
            } else {
              setShowCreate(true);
            }
          }}
        />
      )}

      {/* No dinners state */}
      {nodinners && (
        <div
          className="rounded-xl border border-dashed border-orange-500/30 p-8 text-center"
          style={{ background: "rgba(249,115,22,0.04)" }}
        >
          <ChefHat className="h-10 w-10 mx-auto mb-3 opacity-30 text-orange-400" />
          <p className="font-medium opacity-60 mb-1">No group dinners in your area yet.</p>
          <p className="text-sm opacity-40 mb-4">
            Be the first to host. Earn 50 Marks (participation credits) for starting the tradition.
          </p>
          <Button
            size="sm"
            onClick={() => setShowCreate(true)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <ChefHat className="h-4 w-4 mr-2" />
            Host the First Dinner
          </Button>
        </div>
      )}

      {/* Dinner cards */}
      <div className="space-y-4">
        {dinners.map((dinner) => (
          <DinnerCard
            key={dinner.id}
            dinner={dinner}
            currentUserId={user?.id ?? null}
            onClaimSlot={handleClaimSlot}
            onJoin={handleJoin}
          />
        ))}
      </div>

      {/* Securities-clean footer note */}
      <div className="flex items-start gap-2 text-xs opacity-40 pt-2 border-t border-white/10">
        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
        <span>
          Marks are cooperative participation credits. They track your contribution to the community
          and unlock platform features. They are not equity, shares, or a financial return.
        </span>
      </div>

      {/* Create dialog */}
      <CreateDinnerDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={handleCreated}
      />
    </div>
  );
}
