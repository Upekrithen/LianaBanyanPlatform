/**
 * BP028 — Skip-Eblet lattice pane types (Phase 1 + 2).
 */

import type { ChronosTag } from "./chronos-schema.js";

export type PanePhase = "resting" | "between" | "borrowing";

/** Deterministic termination only — no forever. */
export type HoldUntil =
  | { kind: "next_borrow" }
  | { kind: "frame_count"; remaining: number }
  | { kind: "until_anchor_version_change"; anchorId: string }
  | { kind: "until_user_focus_change"; paneId: string }
  | { kind: "until_explicit_release" };

export interface SkipEblet {
  urn: string;
  chronosTag: ChronosTag;
  etchingHash: string;
  holdUntil: HoldUntil;
  createdAt: number;
  anchorUrn: string;
}

export interface PaneConfig {
  id: string;
  upstreamId: string | null;
  chronosTag: ChronosTag;
  /** Canonical anchor this pane etches against (URN string). */
  anchorUrn: string;
  element: HTMLElement | null;
  holdUntil: HoldUntil;
  /** Index for Skip URN segment in this chain position. */
  paneIndex: number;
}

export interface PaneRuntime extends PaneConfig {
  phase: PanePhase;
  etchingHash?: string;
  skip?: SkipEblet;
  releaseHold?: () => void;
}

export type BorrowEvent =
  | { type: "borrow_started"; downstreamId: string; upstreamId: string }
  | { type: "borrow_stamped"; downstreamId: string; frame: number }
  | { type: "self_heal"; paneId: string; reason: "chronos_mismatch" }
  | { type: "hold_released"; paneId: string; hold: HoldUntil["kind"] }
  /** Phase 4: wire to AutoBaton MAD emitters. */
  | { type: "mad_hook_borrow"; paneId: string; detail: Record<string, unknown> };

export interface ChainManager {
  registerPane(config: PaneConfig): void;
  unregisterPane(id: string): void;
  setChronosTag(paneId: string, tag: ChronosTag): void;
  getPane(id: string): PaneRuntime | undefined;
  requestBorrow(downstreamId: string): Promise<boolean>;
  releaseHold(paneId: string): void;
  subscribe(listener: (e: BorrowEvent) => void): () => void;
  /** Anchor spine version — bumps trigger until_anchor_version_change releases + Phase 2 coherence. */
  bumpAnchorVersion(anchorUrn: string): void;
  getAnchorVersion(anchorUrn: string): number;
}
