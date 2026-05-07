/**
 * Render-bound visibility: DOM mounted, composited, non-zero layout.
 */

export function isPaneVisuallyRenderable(element: Element | null): boolean {
  if (!element || !element.isConnected) return false;
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;
  const style = globalThis.getComputedStyle?.(element as Element);
  if (!style) return rect.width > 0 && rect.height > 0;
  if (style.display === "none" || style.visibility === "hidden") return false;
  if (Number(style.opacity) === 0) return false;
  return true;
}

/** Optional IntersectionObserver hook for compositor-visible fraction. */
export function observePaneVisibility(
  element: Element,
  onChange: (visible: boolean) => void,
  options: IntersectionObserverInit = { threshold: 0.01 },
): () => void {
  if (typeof IntersectionObserver === "undefined") {
    onChange(isPaneVisuallyRenderable(element));
    return () => { /* noop */ };
  }
  const obs = new IntersectionObserver((entries) => {
    const e = entries[0];
    if (e) onChange(e.isIntersecting && e.intersectionRatio > 0);
  }, options);
  obs.observe(element);
  return () => obs.disconnect();
}
