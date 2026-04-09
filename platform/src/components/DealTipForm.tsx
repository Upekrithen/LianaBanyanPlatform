import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CheckCircle, Loader2, Anchor, Link2, Coins } from "lucide-react";
import { toast } from "sonner";

const DEAL_TYPES = [
  { value: "clearance", label: "Clearance Sale" },
  { value: "discount_day", label: "Discount Day" },
  { value: "stacking_combo", label: "Stacking Combo" },
  { value: "veterans_military", label: "Veterans / Military" },
  { value: "senior", label: "Senior Discount" },
  { value: "teacher", label: "Teacher Discount" },
  { value: "bulk_deal", label: "Bulk Deal" },
  { value: "seasonal", label: "Seasonal" },
  { value: "other", label: "Other" },
] as const;

const CONFIDENCE_LEVELS = [
  { value: "verified", label: "Verified Personally", badge: "default" },
  { value: "heard", label: "Heard From Someone", badge: "secondary" },
  { value: "unverified", label: "Unverified / Rumor", badge: "outline" },
] as const;

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

interface DealTipFormProps {
  onSuccess?: () => void;
}

interface FormState {
  store_name: string;
  store_location: string;
  deal_type: string;
  description: string;
  schedule_recurring: boolean;
  schedule_days: string[];
  schedule_time_hint: string;
  stacking_info: string;
  confidence: string;
  social_url: string;
}

const INITIAL: FormState = {
  store_name: "",
  store_location: "",
  deal_type: "",
  description: "",
  schedule_recurring: false,
  schedule_days: [],
  schedule_time_hint: "",
  stacking_info: "",
  confidence: "verified",
  social_url: "",
};

export function DealTipForm({ onSuccess }: DealTipFormProps) {
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  function toggleDay(day: string) {
    setForm((prev) => ({
      ...prev,
      schedule_days: prev.schedule_days.includes(day)
        ? prev.schedule_days.filter((d) => d !== day)
        : [...prev.schedule_days, day],
    }));
  }

  const marksEstimate = 4 + (form.social_url ? 2 : 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to submit a deal tip.");
      return;
    }
    if (!form.store_name || !form.deal_type || !form.description) {
      toast.error("Store name, deal type, and description are required.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("resource_board_tips" as never)
        .insert({
          member_id: user.id,
          store_name: form.store_name,
          store_location: form.store_location || null,
          deal_type: form.deal_type,
          description: form.description,
          schedule_recurring: form.schedule_recurring,
          schedule_days: form.schedule_days.length
            ? form.schedule_days
            : null,
          schedule_time_hint: form.schedule_time_hint || null,
          stacking_info: form.stacking_info || null,
          confidence: form.confidence,
          social_url: form.social_url || null,
          marks_awarded: marksEstimate,
        } as never);

      if (error) throw error;

      setSubmitted(true);
      toast.success(
        `Deal tip logged! +${marksEstimate} Marks ${form.social_url ? "(Pearl Influencer bonus!)" : ""}`,
      );
      onSuccess?.();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to submit. Try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <Card className="border-teal-500/30 bg-teal-50/50 dark:bg-teal-950/20">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <CheckCircle className="w-12 h-12 mx-auto text-teal-600" />
          <h3 className="text-xl font-semibold">Tip Logged!</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your deal tip is live on the Resource Board. Other members can now
            upvote it, and you may earn bonus Marks as it gains traction.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge className="bg-amber-600/20 text-amber-600 border-amber-500/30 text-base px-3 py-1">
              <Coins className="w-4 h-4 mr-1" />+{marksEstimate} Marks
            </Badge>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSubmitted(false);
              setForm(INITIAL);
            }}
          >
            Log Another Deal
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Anchor className="w-5 h-5" />
          Log a Deal Tip
        </CardTitle>
        <CardDescription>
          Found a great deal at a local store? Share it with the cooperative so
          everyone saves money.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Store Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="store_name">Store Name *</Label>
              <Input
                id="store_name"
                placeholder="e.g., Target, Costco, H-E-B"
                value={form.store_name}
                onChange={update("store_name")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store_location">Store Location</Label>
              <Input
                id="store_location"
                placeholder="Address, city, or cross-streets"
                value={form.store_location}
                onChange={update("store_location")}
              />
            </div>
          </div>

          {/* Deal Type */}
          <div className="space-y-2">
            <Label>Deal Type *</Label>
            <Select
              value={form.deal_type}
              onValueChange={(v) =>
                setForm((prev) => ({ ...prev, deal_type: v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select deal type..." />
              </SelectTrigger>
              <SelectContent>
                {DEAL_TYPES.map((dt) => (
                  <SelectItem key={dt.value} value={dt.value}>
                    {dt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description * <span className="text-muted-foreground text-xs">(500 chars max)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the deal — what's on sale, how much off, any tricks to getting it..."
              rows={4}
              maxLength={500}
              value={form.description}
              onChange={update("description")}
              required
            />
            <p className="text-xs text-muted-foreground text-right">
              {form.description.length}/500
            </p>
          </div>

          {/* Schedule */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Switch
                checked={form.schedule_recurring}
                onCheckedChange={(c) =>
                  setForm((prev) => ({ ...prev, schedule_recurring: c }))
                }
              />
              <Label>Recurring deal?</Label>
            </div>

            {form.schedule_recurring && (
              <div className="space-y-3 pl-1">
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => (
                    <Button
                      key={day}
                      type="button"
                      size="sm"
                      variant={
                        form.schedule_days.includes(day) ? "default" : "outline"
                      }
                      onClick={() => toggleDay(day)}
                    >
                      {day.charAt(0).toUpperCase() + day.slice(0, 3)}
                    </Button>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time_hint">Time of Day</Label>
                  <Input
                    id="time_hint"
                    placeholder="e.g., mornings, after 3pm, all day"
                    value={form.schedule_time_hint}
                    onChange={update("schedule_time_hint")}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Stacking */}
          <div className="space-y-2">
            <Label htmlFor="stacking">Stacking Info</Label>
            <Input
              id="stacking"
              placeholder="Does this stack with coupons, military discount, etc.?"
              value={form.stacking_info}
              onChange={update("stacking_info")}
            />
          </div>

          {/* Confidence */}
          <div className="space-y-2">
            <Label>Confidence Level</Label>
            <div className="flex flex-wrap gap-2">
              {CONFIDENCE_LEVELS.map((cl) => (
                <Button
                  key={cl.value}
                  type="button"
                  size="sm"
                  variant={
                    form.confidence === cl.value ? "default" : "outline"
                  }
                  onClick={() =>
                    setForm((prev) => ({ ...prev, confidence: cl.value }))
                  }
                >
                  {cl.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Pearl Influencer */}
          <div className="space-y-2 p-4 rounded-lg border border-dashed border-teal-500/40 bg-teal-50/30 dark:bg-teal-950/20">
            <Label htmlFor="social_url" className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-teal-600" />
              Pearl Influencer — Social Media Link
              <Badge variant="secondary" className="text-xs">+2 bonus Marks</Badge>
            </Label>
            <Input
              id="social_url"
              placeholder="https://instagram.com/p/... or TikTok, X, Facebook link"
              value={form.social_url}
              onChange={update("social_url")}
            />
            <p className="text-xs text-muted-foreground">
              Already posted about this deal on social media? Paste the link to
              earn Pearl Influencer bonus Marks.
            </p>
          </div>

          {/* Marks estimate */}
          <div className="flex items-center gap-3 p-3 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <Coins className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium">
              Estimated reward: <strong>{marksEstimate} Marks</strong>
              {form.social_url && (
                <span className="text-teal-600 ml-1">(includes Pearl Influencer bonus)</span>
              )}
            </span>
          </div>

          <Button type="submit" disabled={submitting || !user} className="w-full sm:w-auto">
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Anchor className="w-4 h-4 mr-2" />
                Submit Tip
              </>
            )}
          </Button>
          {!user && (
            <p className="text-xs text-destructive">
              Sign in to submit deal tips.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

export default DealTipForm;
