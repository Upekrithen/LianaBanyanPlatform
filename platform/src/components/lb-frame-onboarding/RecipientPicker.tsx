/**
 * RecipientPicker — v1 dropdown + paste; v2 "click-anywhere" (future extension)
 * Per BRIDLE v11 + LB Frame Viral Onboarding Eblet v1/v2 split.
 * v1: email input + platform selector + personal message.
 * Anti-farming: reward vests ONLY when recipient completes LB Frame Handshake (Phase 5).
 * data-xray-id: recipient-picker
 */

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface RecipientPickerValue {
  recipientEmail: string;
  platform: "email" | "instagram" | "etsy" | "tiktok" | "discord" | "other";
  personalMessage: string;
}

interface RecipientPickerProps {
  value: RecipientPickerValue;
  onChange: (v: RecipientPickerValue) => void;
}

const PLATFORMS = [
  { value: "email",     label: "Email" },
  { value: "discord",   label: "Discord" },
  { value: "instagram", label: "Instagram" },
  { value: "etsy",      label: "Etsy" },
  { value: "tiktok",    label: "TikTok" },
  { value: "other",     label: "Other" },
] as const;

export function RecipientPicker({ value, onChange }: RecipientPickerProps) {
  const set = (patch: Partial<RecipientPickerValue>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="space-y-3" data-xray-id="recipient-picker">
      <div>
        <Label htmlFor="rp-email">Recipient email or handle</Label>
        <Input
          id="rp-email"
          placeholder="friend@example.com or @handle"
          value={value.recipientEmail}
          onChange={(e) => set({ recipientEmail: e.target.value })}
          className="mt-1"
          autoComplete="email"
        />
        <p className="text-xs text-muted-foreground mt-1">
          They'll receive an email with an LB Frame download link and your Cue Card.
        </p>
      </div>

      <div>
        <Label>Where did you find them?</Label>
        <Select
          value={value.platform}
          onValueChange={(v) =>
            set({ platform: v as RecipientPickerValue["platform"] })
          }
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PLATFORMS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="rp-message">Personal note (optional)</Label>
        <Textarea
          id="rp-message"
          placeholder="Hey — thought this would interest you…"
          value={value.personalMessage}
          onChange={(e) => set({ personalMessage: e.target.value })}
          className="mt-1"
          rows={2}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Added to the email alongside the canonical Cue Card.
        </p>
      </div>
    </div>
  );
}
