/**
 * AMBASSADOR CHAIN TREE — Public read-only view: who onboarded whom (Session 5 V1).
 * Nested list by generation. data-xray-id: ambassador-chain-tree
 */

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface AmbassadorNode {
  id: string;
  display_name: string;
  ambassador_number: number | null;
  generation: number;
  slots_filled: number;
  parent_ambassador_id: string | null;
}

export function AmbassadorChainTree({ className }: { className?: string }) {
  const [nodes, setNodes] = useState<AmbassadorNode[]>([]);

  useEffect(() => {
    supabase
      .from("ambassadors")
      .select("id, display_name, ambassador_number, generation, slots_filled, parent_ambassador_id")
      .order("generation")
      .order("ambassador_number")
      .then(({ data }) => setNodes(data ?? []));
  }, []);

  const byParent = new Map<string | null, AmbassadorNode[]>();
  for (const n of nodes) {
    const key = n.parent_ambassador_id;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(n);
  }

  const renderLevel = (parentId: string | null, depth: number): React.ReactNode => {
    const children = byParent.get(parentId) ?? [];
    if (children.length === 0) return null;
    return (
      <ul className={cn(depth > 0 && "ml-4 border-l-2 border-border pl-3")}>
        {children.map((n, i) => (
          <li key={n.id} className="py-1">
            <span className="text-sm font-medium">
              #{n.ambassador_number ?? "—"} {n.display_name}
            </span>
            <span className="text-xs text-muted-foreground ml-2">
              Gen {n.generation} · {n.slots_filled} of 10
            </span>
            {renderLevel(n.id, depth + 1)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className={cn("space-y-2", className)} data-xray-id="ambassador-chain-tree">
      <h2 className="text-lg font-semibold">Ambassador chain</h2>
      <p className="text-sm text-muted-foreground">Who onboarded whom</p>
      {nodes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No Ambassadors yet.</p>
      ) : (
        renderLevel(null, 0)
      )}
    </div>
  );
}
