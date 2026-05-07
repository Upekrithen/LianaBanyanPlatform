/**
 * Anchor mutation fan-out: host bumps canonical anchor; subscribers on other
 * surfaces self-heal (no shared framebuffer assumptions).
 */

export type AnchorBumpListener = (anchorUrn: string, version: number) => void;

export class CrossSurfaceCoherenceHub {
  private byAnchor = new Map<string, Set<AnchorBumpListener>>();
  private versions = new Map<string, number>();

  subscribe(anchorUrn: string, listener: AnchorBumpListener): () => void {
    let set = this.byAnchor.get(anchorUrn);
    if (!set) {
      set = new Set();
      this.byAnchor.set(anchorUrn, set);
    }
    set.add(listener);
    return () => {
      set!.delete(listener);
      if (set!.size === 0) this.byAnchor.delete(anchorUrn);
    };
  }

  /** Host surface: canonical anchor changed. */
  publishAnchorBump(anchorUrn: string): number {
    const next = (this.versions.get(anchorUrn) ?? 0) + 1;
    this.versions.set(anchorUrn, next);
    const set = this.byAnchor.get(anchorUrn);
    if (set) {
      for (const fn of set) fn(anchorUrn, next);
    }
    return next;
  }

  getVersion(anchorUrn: string): number {
    return this.versions.get(anchorUrn) ?? 0;
  }
}
