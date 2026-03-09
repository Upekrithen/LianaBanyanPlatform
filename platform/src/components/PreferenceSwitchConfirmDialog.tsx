/**
 * PREFERENCE SWITCH CONFIRMATION DIALOG
 * =======================================
 * Innovation #1551: Preference Switching UI (Session 8B)
 *
 * Shows "What You Keep vs. What You Lose" when switching:
 * - Marketplace track (product-only ↔ backer)
 * - Guild membership (leaving a guild)
 * - Tribe membership (leaving a tribe)
 *
 * Clear economic impact display with visual indicators.
 * SEC-safe language throughout.
 */

import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2, XCircle, AlertTriangle, ArrowRight, Shield,
  ShoppingBag, TrendingUp, Users, Building2,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export type SwitchType = "track-to-backer" | "track-to-product" | "leave-guild" | "leave-tribe";

interface KeepLoseItem {
  text: string;
  type: "keep" | "lose" | "gain" | "warning";
}

interface PreferenceSwitchConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  switchType: SwitchType;
  contextName?: string;  // guild name, tribe name, etc.
  onConfirm: () => void;
  isPending?: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// SWITCH DEFINITIONS
// ═══════════════════════════════════════════════════════════════════

const SWITCH_CONFIG: Record<SwitchType, {
  title: string;
  description: string;
  icon: any;
  confirmLabel: string;
  items: KeepLoseItem[];
}> = {
  "track-to-backer": {
    title: "Switch to Backer Track",
    description: "You're about to enable participation features in the marketplace.",
    icon: TrendingUp,
    confirmLabel: "Switch to Backer Track",
    items: [
      { text: "All existing product purchases and preorders", type: "keep" },
      { text: "Credit balance and transaction history", type: "keep" },
      { text: "Medallion collection and DaisyChain links", type: "keep" },
      { text: "Participation allocation on future backs", type: "gain" },
      { text: "Portfolio management tools and service credit tracking", type: "gain" },
      { text: "Contribution timeline and participation breakdowns", type: "gain" },
      { text: "You will see more complex marketplace options", type: "warning" },
    ],
  },
  "track-to-product": {
    title: "Switch to Product-Only",
    description: "You're about to simplify your marketplace experience.",
    icon: ShoppingBag,
    confirmLabel: "Switch to Product-Only",
    items: [
      { text: "All existing product purchases and preorders", type: "keep" },
      { text: "Credit balance and transaction history", type: "keep" },
      { text: "Medallion collection and DaisyChain links", type: "keep" },
      { text: "Participation allocation display on new backs", type: "lose" },
      { text: "Portfolio management tools (hidden, not deleted)", type: "lose" },
      { text: "Service credit tracking (data preserved, UI hidden)", type: "lose" },
      { text: "No data is deleted — switch back anytime to restore full view", type: "warning" },
    ],
  },
  "leave-guild": {
    title: "Leave Guild",
    description: "You're about to leave this professional guild.",
    icon: Building2,
    confirmLabel: "Leave Guild",
    items: [
      { text: "All earned Credits, Marks, and Joules", type: "keep" },
      { text: "Completed quest history and XP", type: "keep" },
      { text: "Personal reputation score", type: "keep" },
      { text: "Guild-specific role and title", type: "lose" },
      { text: "Access to guild-only channels and resources", type: "lose" },
      { text: "Guild voting power and governance participation", type: "lose" },
      { text: "Cooldown: 7 days before you can rejoin this guild", type: "warning" },
    ],
  },
  "leave-tribe": {
    title: "Leave Tribe",
    description: "You're about to leave your tribe (resource-sharing group).",
    icon: Users,
    confirmLabel: "Leave Tribe",
    items: [
      { text: "All personal Credits, Marks, and Joules", type: "keep" },
      { text: "Individual membership status", type: "keep" },
      { text: "Quest progress and completions", type: "keep" },
      { text: "Shared tribe resource pool access", type: "lose" },
      { text: "Tribe bulk purchasing discounts", type: "lose" },
      { text: "Tribe governance voting rights", type: "lose" },
      { text: "Other tribe members will be notified", type: "warning" },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════

export function PreferenceSwitchConfirmDialog({
  open,
  onOpenChange,
  switchType,
  contextName,
  onConfirm,
  isPending = false,
}: PreferenceSwitchConfirmDialogProps) {
  const config = SWITCH_CONFIG[switchType];
  const Icon = config.icon;

  const keepItems = config.items.filter((i) => i.type === "keep");
  const gainItems = config.items.filter((i) => i.type === "gain");
  const loseItems = config.items.filter((i) => i.type === "lose");
  const warningItems = config.items.filter((i) => i.type === "warning");

  const displayTitle = contextName
    ? `${config.title}: ${contextName}`
    : config.title;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5" />
            {displayTitle}
          </DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* What You Keep */}
          {keepItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle2 className="w-4 h-4" />
                What You Keep
              </h4>
              <ul className="space-y-1">
                {keepItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* What You Gain */}
          {gainItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <ArrowRight className="w-4 h-4" />
                What You Gain
              </h4>
              <ul className="space-y-1">
                {gainItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <ArrowRight className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* What You Lose */}
          {loseItems.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-red-700 dark:text-red-400">
                  <XCircle className="w-4 h-4" />
                  What Changes
                </h4>
                <ul className="space-y-1">
                  {loseItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Warnings */}
          {warningItems.length > 0 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg space-y-1">
              {warningItems.map((item, i) => (
                <p key={i} className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  {item.text}
                </p>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isPending}>
            {isPending ? "Switching..." : config.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
