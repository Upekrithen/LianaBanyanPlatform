/**
 * PAYMENT PLUGS BADGE
 * ===================
 * Display component showing available payment rails on profiles,
 * Swoop pages, bounty listings, and anywhere a member accepts
 * peer-to-peer payments.
 *
 * Shows icons for each active payment rail with clickable links.
 * Used by: Profile cards, Swoop donation pages, Rally Group, LMD chef profiles
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PLATFORM_META: Record<string, {
  icon: string;
  displayName: string;
  urlPrefix: string;
  color: string;
}> = {
  paypal: { icon: "💳", displayName: "PayPal", urlPrefix: "https://paypal.me/", color: "hover:bg-blue-600/10" },
  kofi: { icon: "☕", displayName: "Ko-fi", urlPrefix: "https://ko-fi.com/", color: "hover:bg-sky-400/10" },
  venmo: { icon: "💙", displayName: "Venmo", urlPrefix: "https://venmo.com/", color: "hover:bg-blue-500/10" },
  cashapp: { icon: "💚", displayName: "Cash App", urlPrefix: "https://cash.app/", color: "hover:bg-green-500/10" },
  zelle: { icon: "💜", displayName: "Zelle", urlPrefix: "", color: "hover:bg-purple-600/10" },
};

interface PaymentPlug {
  id: string;
  platform: string;
  handle_or_url: string;
  display_name: string | null;
  is_active: boolean;
  is_primary: boolean;
}

interface PaymentPlugsBadgeProps {
  userId: string;
  variant?: "icons" | "buttons" | "compact";
  className?: string;
}

export function PaymentPlugsBadge({ userId, variant = "icons", className = "" }: PaymentPlugsBadgeProps) {
  const [plugs, setPlugs] = useState<PaymentPlug[]>([]);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("member_payment_plugs")
        .select("id, platform, handle_or_url, display_name, is_active, is_primary")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("is_primary", { ascending: false });

      if (data) setPlugs(data as PaymentPlug[]);
    }
    if (userId) fetch();
  }, [userId]);

  if (plugs.length === 0) return null;

  function getUrl(plug: PaymentPlug): string {
    const meta = PLATFORM_META[plug.platform];
    if (!meta?.urlPrefix) return plug.handle_or_url;
    const handle = plug.handle_or_url.replace(/^[@$]/, "");
    return `${meta.urlPrefix}${handle}`;
  }

  if (variant === "compact") {
    return (
      <TooltipProvider>
        <div className={`flex items-center gap-1 ${className}`}>
          {plugs.map((plug) => {
            const meta = PLATFORM_META[plug.platform];
            if (!meta) return null;
            return (
              <Tooltip key={plug.id}>
                <TooltipTrigger asChild>
                  <a
                    href={getUrl(plug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm ${meta.color} rounded p-0.5 transition-colors`}
                  >
                    {meta.icon}
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{meta.displayName}: {plug.display_name || plug.handle_or_url}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    );
  }

  if (variant === "buttons") {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {plugs.map((plug) => {
          const meta = PLATFORM_META[plug.platform];
          if (!meta) return null;
          return (
            <Button
              key={plug.id}
              variant="outline"
              size="sm"
              asChild
              className="gap-1"
            >
              <a href={getUrl(plug)} target="_blank" rel="noopener noreferrer">
                <span>{meta.icon}</span>
                {plug.display_name || meta.displayName}
              </a>
            </Button>
          );
        })}
      </div>
    );
  }

  // Default: icons variant
  return (
    <TooltipProvider>
      <div className={`flex items-center gap-2 ${className}`}>
        {plugs.map((plug) => {
          const meta = PLATFORM_META[plug.platform];
          if (!meta) return null;
          return (
            <Tooltip key={plug.id}>
              <TooltipTrigger asChild>
                <a
                  href={getUrl(plug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-xl ${meta.color} rounded-full p-1 transition-colors`}
                >
                  {meta.icon}
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>Support via {meta.displayName}</p>
                <p className="text-xs text-muted-foreground">
                  {plug.display_name || plug.handle_or_url}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

export default PaymentPlugsBadge;
