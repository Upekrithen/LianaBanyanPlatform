/**
 * DISCOVERY GATE
 * ===============
 * "Do you want to Discover X?"
 *
 * Appears when a user visits a route that has a gate.
 * Yes = unlocks the category, stamps IP Ledger.
 * Not now = dismisses, can re-trigger later.
 */

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Gate {
  gate_slug: string;
  title: string;
  description: string;
  category_slug: string;
  trigger_route: string;
  icon: string;
  yes_label: string;
  no_label: string;
}

export function DiscoveryGateProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const [gates, setGates] = useState<Gate[]>([]);
  const [respondedGates, setRespondedGates] = useState<Set<string>>(new Set());
  const [activeGate, setActiveGate] = useState<Gate | null>(null);

  useEffect(() => {
    loadGates();
  }, [user]);

  useEffect(() => {
    checkForGate();
  }, [location.pathname, gates, respondedGates]);

  const loadGates = async () => {
    const { data } = await supabase
      .from("discovery_gates")
      .select("*")
      .eq("is_active", true);
    if (data) setGates(data as Gate[]);

    if (user) {
      const { data: responses } = await supabase
        .from("user_gate_responses")
        .select("gate_slug")
        .eq("user_id", user.id);
      if (responses) {
        setRespondedGates(new Set(responses.map((r) => r.gate_slug)));
      }
    }

    // Also check localStorage for ghost users
    const ghostResponses = localStorage.getItem("lb_gate_responses");
    if (ghostResponses) {
      try {
        const parsed = JSON.parse(ghostResponses) as string[];
        setRespondedGates((prev) => new Set([...prev, ...parsed]));
      } catch {}
    }
  };

  const checkForGate = () => {
    if (activeGate) return; // already showing one

    const matchingGate = gates.find(
      (g) =>
        location.pathname.startsWith(g.trigger_route) &&
        !respondedGates.has(g.gate_slug)
    );

    if (matchingGate) {
      setActiveGate(matchingGate);
    }
  };

  const respond = async (accepted: boolean) => {
    if (!activeGate) return;

    const response = accepted ? "accepted" : "dismissed";

    // Record response
    if (user) {
      // Create stamp
      const stampData = `${user.id}:gate_${response}:${activeGate.gate_slug}:${new Date().toISOString()}`;
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(stampData));
      const stampHash = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const { data: stamp } = await supabase
        .from("acknowledgment_stamps")
        .insert({
          user_id: user.id,
          action_type: "read_confirm",
          action_id: `gate_${response}_${activeGate.gate_slug}`,
          stamp_hash: stampHash,
          flagstone_text_shown: `${activeGate.title}: ${activeGate.description}`,
          metadata: { gate_slug: activeGate.gate_slug, response },
        })
        .select("id")
        .single();

      // Record gate response
      await supabase.from("user_gate_responses").insert({
        user_id: user.id,
        gate_slug: activeGate.gate_slug,
        response,
        stamp_id: stamp?.id || null,
      });

      // If accepted, discover the category
      if (accepted) {
        await supabase.from("user_discovery_state").insert({
          user_id: user.id,
          category_slug: activeGate.category_slug,
          card_slug: null,
        });
      }
    } else {
      // Ghost user — store in localStorage
      const existing = JSON.parse(localStorage.getItem("lb_gate_responses") || "[]");
      existing.push(activeGate.gate_slug);
      localStorage.setItem("lb_gate_responses", JSON.stringify(existing));
    }

    setRespondedGates((prev) => new Set([...prev, activeGate.gate_slug]));
    setActiveGate(null);
  };

  return (
    <>
      {children}

      <Dialog open={!!activeGate} onOpenChange={() => setActiveGate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <span className="text-2xl">{activeGate?.icon}</span>
              Do you want to discover {activeGate?.title}?
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              {activeGate?.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:gap-3">
            <Button variant="outline" onClick={() => respond(false)}>
              {activeGate?.no_label || "Not now"}
            </Button>
            <Button onClick={() => respond(true)} className="gap-2">
              {activeGate?.yes_label || "Yes, show me"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
