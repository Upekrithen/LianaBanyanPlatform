import { chronosTagsEqual } from "./chronos-schema.js";
import { hashEtching } from "./provenance.js";
import { buildSkipUrn } from "./urn.js";
import type {
  BorrowEvent,
  ChainManager as ChainManagerIface,
  HoldUntil,
  PaneConfig,
  PaneRuntime,
} from "./types.js";

export class SkipEbletChainManager implements ChainManagerIface {
  private panes = new Map<string, PaneRuntime>();
  private listeners = new Set<(e: BorrowEvent) => void>();
  private anchorVersions = new Map<string, number>();
  private rafLocks = new Map<string, number>();
  private frameLoops = new Map<string, number>();

  private emit(e: BorrowEvent): void {
    for (const fn of this.listeners) fn(e);
  }

  subscribe(listener: (e: BorrowEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  registerPane(config: PaneConfig): void {
    this.panes.set(config.id, {
      ...config,
      phase: "resting",
    });
    this.attachHoldBehavior(config.id, config.holdUntil, config.element);
  }

  unregisterPane(id: string): void {
    const p = this.panes.get(id);
    if (p?.releaseHold) p.releaseHold();
    this.panes.delete(id);
    this.rafLocks.delete(id);
    const fid = this.frameLoops.get(id);
    if (fid !== undefined) cancelAnimationFrame(fid);
    this.frameLoops.delete(id);
  }

  setChronosTag(paneId: string, tag: string): void {
    const p = this.panes.get(paneId);
    if (p) p.chronosTag = tag;
  }

  getPane(id: string): PaneRuntime | undefined {
    return this.panes.get(id);
  }

  bumpAnchorVersion(anchorUrn: string): void {
    const v = (this.anchorVersions.get(anchorUrn) ?? 0) + 1;
    this.anchorVersions.set(anchorUrn, v);
    for (const p of this.panes.values()) {
      if (
        p.holdUntil.kind === "until_anchor_version_change" &&
        p.holdUntil.anchorId === anchorUrn
      ) {
        this.emit({ type: "hold_released", paneId: p.id, hold: p.holdUntil.kind });
        this.clearHold(p.id);
      }
    }
  }

  getAnchorVersion(anchorUrn: string): number {
    return this.anchorVersions.get(anchorUrn) ?? 0;
  }

  releaseHold(paneId: string): void {
    const p = this.panes.get(paneId);
    if (!p) return;
    this.emit({ type: "hold_released", paneId, hold: p.holdUntil.kind });
    this.clearHold(paneId);
  }

  private clearHold(paneId: string): void {
    const fid = this.frameLoops.get(paneId);
    if (fid !== undefined) cancelAnimationFrame(fid);
    this.frameLoops.delete(paneId);
    const p = this.panes.get(paneId);
    if (!p) return;
    if (p.releaseHold) p.releaseHold();
    p.releaseHold = undefined;
    p.skip = undefined;
  }

  private attachHoldBehavior(id: string, hold: HoldUntil, el: HTMLElement | null): void {
    const pane = this.panes.get(id);
    if (!pane) return;

    if (hold.kind === "until_user_focus_change" && el) {
      const onF = () => this.releaseHold(id);
      el.addEventListener("focusin", onF);
      el.addEventListener("blur", onF);
      pane.releaseHold = () => {
        el.removeEventListener("focusin", onF);
        el.removeEventListener("blur", onF);
      };
    }

    if (hold.kind === "frame_count") {
      let remaining = hold.remaining;
      const tick = (): void => {
        if (!this.panes.has(id)) return;
        remaining -= 1;
        if (remaining <= 0) {
          this.emit({ type: "hold_released", paneId: id, hold: "frame_count" });
          this.clearHold(id);
          this.frameLoops.delete(id);
          return;
        }
        const next = requestAnimationFrame(tick);
        this.frameLoops.set(id, next);
      };
      const h = requestAnimationFrame(tick);
      this.frameLoops.set(id, h);
    }
  }

  async requestBorrow(downstreamId: string): Promise<boolean> {
    const down = this.panes.get(downstreamId);
    if (!down?.upstreamId) return false;
    const up = this.panes.get(down.upstreamId);
    if (!up) return false;

    if (this.rafLocks.get(downstreamId)) {
      return false;
    }

    this.emit({
      type: "mad_hook_borrow",
      paneId: downstreamId,
      detail: { phase: "pre_validate" },
    });

    if (!chronosTagsEqual(up.chronosTag, down.chronosTag)) {
      this.emit({ type: "self_heal", paneId: downstreamId, reason: "chronos_mismatch" });
      return false;
    }

    down.phase = "between";
    this.emit({ type: "borrow_started", downstreamId, upstreamId: up.id });

    const frame = await new Promise<number>((resolveFrame) => {
      const lockToken = requestAnimationFrame((t) => {
        resolveFrame(t);
      });
      this.rafLocks.set(downstreamId, lockToken);
    });

    try {
      const etchingPayload = `borrow:${downstreamId}:${up.id}:${frame}`;
      const h = await hashEtching(down.anchorUrn, etchingPayload, down.chronosTag, down.paneIndex);
      down.etchingHash = h;
      down.phase = "resting";
      down.skip = {
        urn: buildSkipUrn(down.chronosTag, down.paneIndex),
        chronosTag: down.chronosTag,
        etchingHash: h,
        holdUntil: down.holdUntil,
        createdAt: Date.now(),
        anchorUrn: down.anchorUrn,
      };
      this.emit({ type: "borrow_stamped", downstreamId, frame });
      this.emit({
        type: "mad_hook_borrow",
        paneId: downstreamId,
        detail: { phase: "post_stamp", frame },
      });
      if (down.holdUntil.kind === "next_borrow") {
        this.emit({ type: "hold_released", paneId: downstreamId, hold: "next_borrow" });
        this.clearHold(downstreamId);
      }
      return true;
    } finally {
      this.rafLocks.delete(downstreamId);
    }
  }
}

/** Sequential borrow across upstream→mid→down for tests / perf. */
export async function propagateBorrowChain(
  mgr: SkipEbletChainManager,
  order: string[],
): Promise<boolean> {
  for (let i = 1; i < order.length; i++) {
    const ok = await mgr.requestBorrow(order[i]);
    if (!ok) return false;
  }
  return true;
}
