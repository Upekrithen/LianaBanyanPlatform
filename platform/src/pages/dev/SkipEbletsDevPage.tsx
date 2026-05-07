import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  SkipEbletChainManager,
  deserializeAnchorFromYoke,
  serializeAnchorForYoke,
  CrossSurfaceCoherenceHub,
} from "@/lib/skip-eblets";

const ANCHOR = "urn:anchor:dev-skip-eblets";
const TAG_A = "2026-05-06T12:00:00.000Z#omega16.1";
const TAG_B = "2026-05-06T12:00:01.000Z#omega16.2";

/** Dev-only 3-pane Skip-Eblet chain demo (BP028). */
export default function SkipEbletsDevPage() {
  const p0 = useRef<HTMLDivElement>(null);
  const p1 = useRef<HTMLDivElement>(null);
  const p2 = useRef<HTMLDivElement>(null);
  const [log, setLog] = useState<string[]>([]);
  const [tagMid, setTagMid] = useState(TAG_A);

  const mgr = useMemo(() => new SkipEbletChainManager(), []);
  const hub = useMemo(() => new CrossSurfaceCoherenceHub(), []);

  const push = useCallback((line: string) => {
    setLog((prev) => [line, ...prev].slice(0, 40));
  }, []);

  useEffect(() => {
    return mgr.subscribe((e) => {
      if (e.type === "self_heal") push(`event: self_heal pane=${e.paneId}`);
      if (e.type === "borrow_stamped") push(`event: borrow_stamped pane=${e.downstreamId}`);
    });
  }, [mgr, push]);

  const initChain = useCallback(() => {
    mgr.unregisterPane("p0");
    mgr.unregisterPane("p1");
    mgr.unregisterPane("p2");
    mgr.registerPane({
      id: "p0",
      upstreamId: null,
      chronosTag: TAG_A,
      anchorUrn: ANCHOR,
      element: p0.current,
      holdUntil: { kind: "until_explicit_release" },
      paneIndex: 0,
    });
    mgr.registerPane({
      id: "p1",
      upstreamId: "p0",
      chronosTag: tagMid,
      anchorUrn: ANCHOR,
      element: p1.current,
      holdUntil: { kind: "next_borrow" },
      paneIndex: 1,
    });
    mgr.registerPane({
      id: "p2",
      upstreamId: "p1",
      chronosTag: tagMid,
      anchorUrn: ANCHOR,
      element: p2.current,
      holdUntil: { kind: "next_borrow" },
      paneIndex: 2,
    });
    push("chain: registered p0→p1→p2");
  }, [mgr, push, tagMid]);

  const runBorrow = useCallback(async () => {
    const ok1 = await mgr.requestBorrow("p1");
    const ok2 = await mgr.requestBorrow("p2");
    push(`borrow: p1=${ok1} p2=${ok2}`);
  }, [mgr, push]);

  const selfHealDemo = useCallback(() => {
    setTagMid(TAG_B);
    mgr.setChronosTag("p1", TAG_B);
    mgr.setChronosTag("p2", TAG_B);
    push("self-heal prep: mid+leaf tags bumped to TAG_B (upstream still TAG_A)");
  }, [mgr, push]);

  const tryBorrowAfterMismatch = useCallback(async () => {
    const ok = await mgr.requestBorrow("p1");
    push(`borrow p1 after tag change: ${ok} (expect false + self_heal event)`);
  }, [mgr, push]);

  const yokeDemo = useCallback(() => {
    const wire = serializeAnchorForYoke(ANCHOR);
    const { anchorUrn } = deserializeAnchorFromYoke(wire);
    push(`yoke round-trip anchor: ${anchorUrn.slice(-24)}`);
  }, [push]);

  const coherenceDemo = useCallback(() => {
    const off = hub.subscribe(ANCHOR, (u, v) => push(`coherence: ${u} → v${v}`));
    const v = hub.publishAnchorBump(ANCHOR);
    push(`coherence publish: version ${v}`);
    off();
  }, [hub, push]);

  return (
    <div className="min-h-screen bg-background text-foreground p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Skip-Eblets dev (BP028)</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Three render-bound panes; borrow propagates p1 then p2. Self-heal demo desynchronizes mid tags
          from upstream.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm"
          onClick={initChain}
        >
          Init chain
        </button>
        <button
          type="button"
          className="px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-sm"
          onClick={runBorrow}
        >
          Run borrow wave
        </button>
        <button
          type="button"
          className="px-3 py-1.5 rounded-md bg-orange-600 text-white text-sm"
          onClick={selfHealDemo}
        >
          Bump mid+leaf tags
        </button>
        <button
          type="button"
          className="px-3 py-1.5 rounded-md border border-border text-sm"
          onClick={tryBorrowAfterMismatch}
        >
          Borrow after mismatch
        </button>
        <button type="button" className="px-3 py-1.5 rounded-md border text-sm" onClick={yokeDemo}>
          Yoke serialize
        </button>
        <button
          type="button"
          className="px-3 py-1.5 rounded-md border text-sm"
          onClick={coherenceDemo}
        >
          Coherence hub
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div
          ref={p0}
          tabIndex={0}
          className="border border-green-600/50 rounded-lg p-4 min-h-[100px] outline-none focus:ring-2 focus:ring-green-500"
        >
          <div className="text-xs font-medium text-green-600">p0 upstream · tag T0</div>
          <div className="text-xs text-muted-foreground mt-2 break-all">{TAG_A}</div>
        </div>
        <div
          ref={p1}
          tabIndex={0}
          className="border border-amber-600/50 rounded-lg p-4 min-h-[100px] outline-none focus:ring-2 focus:ring-amber-500"
        >
          <div className="text-xs font-medium text-amber-600">p1 mid · tag sync</div>
          <div className="text-xs text-muted-foreground mt-2 break-all">{tagMid}</div>
        </div>
        <div
          ref={p2}
          tabIndex={0}
          className="border border-sky-600/50 rounded-lg p-4 min-h-[100px] outline-none focus:ring-2 focus:ring-sky-500"
        >
          <div className="text-xs font-medium text-sky-600">p2 leaf</div>
          <div className="text-xs text-muted-foreground mt-2 break-all">{tagMid}</div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium mb-2">Event log</h2>
        <pre className="text-xs bg-muted/40 rounded-md p-3 max-h-64 overflow-auto whitespace-pre-wrap">
          {log.length ? log.join("\n") : "…"}
        </pre>
      </div>
    </div>
  );
}
