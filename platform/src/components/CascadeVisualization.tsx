/**
 * CascadeVisualization — $10M cap reseed cascade tree
 * Shows the user at center, overflow cascading outward to their network.
 * Radial layout with animated connections. Gold/dark platform palette.
 * K405 / Innovation #2241 (#1899 $10M cap with reseeding)
 */
import { useMemo } from "react";
import { useCascadeHistory, type CascadeEvent } from "@/hooks/useSaaLedger";
import { useAuth } from "@/contexts/AuthContext";
import { Zap, ArrowDownRight } from "lucide-react";

const CAP_AMOUNT = 10_000_000;

function formatSaa(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

function shortId(id: string): string {
  return id.slice(0, 6);
}

interface CascadeNode {
  userId: string;
  amount: number;
  children: CascadeNode[];
  depth: number;
}

function buildTree(events: CascadeEvent[], rootUserId: string): CascadeNode {
  const root: CascadeNode = { userId: rootUserId, amount: 0, children: [], depth: 0 };
  const byFrom = new Map<string, CascadeEvent[]>();
  for (const e of events) {
    const list = byFrom.get(e.from_user_id) ?? [];
    list.push(e);
    byFrom.set(e.from_user_id, list);
  }

  function expand(node: CascadeNode, visited: Set<string>) {
    const children = byFrom.get(node.userId) ?? [];
    for (const c of children) {
      if (visited.has(c.to_user_id)) continue;
      visited.add(c.to_user_id);
      const child: CascadeNode = {
        userId: c.to_user_id,
        amount: c.amount,
        children: [],
        depth: node.depth + 1,
      };
      node.children.push(child);
      if (child.depth < 5) expand(child, visited);
    }
  }

  const visited = new Set<string>([rootUserId]);
  expand(root, visited);
  root.amount = events
    .filter((e) => e.from_user_id === rootUserId)
    .reduce((sum, e) => sum + e.amount, 0);

  return root;
}

export default function CascadeVisualization() {
  const { user } = useAuth();
  const { outgoing, incoming, loading } = useCascadeHistory();

  const tree = useMemo(() => {
    if (!user || outgoing.length === 0) return null;
    return buildTree(outgoing, user.id);
  }, [user, outgoing]);

  if (loading) {
    return (
      <div className="h-64 rounded-xl animate-pulse" style={{ background: "#0a1628" }} />
    );
  }

  const hasOutgoing = tree && tree.children.length > 0;
  const totalCascaded = outgoing.reduce((s, e) => s + e.amount, 0);
  const totalReceived = incoming.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-xl p-4"
          style={{ background: "#0a1628", border: "1px solid rgba(245,158,11,0.15)" }}
        >
          <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
            Cascaded Out
          </div>
          <div className="text-lg font-bold" style={{ color: "#f59e0b", fontFamily: "'Crimson Pro', Georgia, serif" }}>
            {formatSaa(totalCascaded)}
          </div>
          <div className="text-[10px] text-slate-600 mt-1">
            to {new Set(outgoing.map((e) => e.to_user_id)).size} members
          </div>
        </div>
        <div
          className="rounded-xl p-4"
          style={{ background: "#0a1628", border: "1px solid rgba(34,197,94,0.15)" }}
        >
          <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
            Received
          </div>
          <div className="text-lg font-bold" style={{ color: "#22c55e", fontFamily: "'Crimson Pro', Georgia, serif" }}>
            {formatSaa(totalReceived)}
          </div>
          <div className="text-[10px] text-slate-600 mt-1">
            from {new Set(incoming.map((e) => e.from_user_id)).size} backers
          </div>
        </div>
      </div>

      {/* Visual tree */}
      {hasOutgoing ? (
        <div
          className="rounded-xl p-5 overflow-hidden"
          style={{ background: "#0a1628", border: "1px solid rgba(212,168,83,0.12)" }}
        >
          <h3
            className="text-xs font-semibold mb-4"
            style={{ color: "#d4a853", fontFamily: "'Crimson Pro', Georgia, serif" }}
          >
            Cascade Tree
          </h3>
          <div className="text-[10px] text-slate-500 mb-3">
            When your SAA reaches the {formatSaa(CAP_AMOUNT)} cap, overflow distributes to
            members you've previously engaged with — generational influence, not payout.
          </div>
          <CascadeTree node={tree} isRoot />
        </div>
      ) : (
        <div
          className="rounded-xl p-6 text-center"
          style={{ background: "#0a1628", border: "1px solid rgba(148,163,184,0.08)" }}
        >
          <Zap className="w-6 h-6 text-slate-700 mx-auto mb-2" />
          <p className="text-xs text-slate-500">
            No cascade events yet. Cascades begin when a member's SAA reaches the {formatSaa(CAP_AMOUNT)} cap.
          </p>
        </div>
      )}

      {/* Incoming cascade list */}
      {incoming.length > 0 && (
        <div>
          <h3 className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
            Received Cascades ({incoming.length})
          </h3>
          <div className="space-y-1.5">
            {incoming.map((e) => (
              <div
                key={e.cascade_event_id}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
                style={{ background: "rgba(10,22,40,0.6)", border: "1px solid rgba(34,197,94,0.08)" }}
              >
                <ArrowDownRight className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                <span className="text-slate-400">
                  From <code className="text-emerald-400">{shortId(e.from_user_id)}</code>
                </span>
                <span className="text-emerald-400 font-semibold ml-auto tabular-nums">
                  +{formatSaa(e.amount)}
                </span>
                <span className="text-[10px] text-slate-600 w-14 text-right">
                  {new Date(e.cascaded_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CascadeTree({ node, isRoot }: { node: CascadeNode; isRoot?: boolean }) {
  const depthColors = ["#d4a853", "#f59e0b", "#fb923c", "#ef4444", "#a855f7"];
  const color = depthColors[Math.min(node.depth, depthColors.length - 1)];

  return (
    <div className={isRoot ? "" : "ml-5 mt-1"}>
      <div className="flex items-center gap-2">
        {!isRoot && (
          <div className="w-4 h-px flex-shrink-0" style={{ background: `${color}40` }} />
        )}
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-1.5"
          style={{
            background: isRoot ? `${color}12` : `${color}08`,
            border: `1px solid ${color}${isRoot ? "30" : "18"}`,
          }}
        >
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{
              background: color,
              boxShadow: isRoot ? `0 0 8px ${color}60` : "none",
            }}
          />
          <span className="text-[10px] font-mono" style={{ color }}>
            {isRoot ? "You" : shortId(node.userId)}
          </span>
          {!isRoot && (
            <span className="text-[10px] font-semibold tabular-nums" style={{ color }}>
              {formatSaa(node.amount)}
            </span>
          )}
        </div>
      </div>
      {node.children.length > 0 && (
        <div className="border-l ml-1.5 pl-0" style={{ borderColor: `${color}20` }}>
          {node.children.map((child) => (
            <CascadeTree key={child.userId} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}
