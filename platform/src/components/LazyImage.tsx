// Wave 17 — LazyImage: optimized image component.
// - loading="lazy" on all non-hero images (passes isHero=true to skip)
// - fetchpriority="high" on hero images for LCP
// - Forwards srcSet and sizes for responsive images (WebP/AVIF when provided)
// - Explicit width/height prevents CLS (layout shift)
// - decoding="async" avoids blocking the main thread

import { ImgHTMLAttributes } from "react";

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** True for above-the-fold hero images — skips lazy loading, uses high fetchpriority */
  isHero?: boolean;
  /** Alt text is REQUIRED (not optional) for accessibility */
  alt: string;
}

/**
 * LazyImage — use in place of <img> for all non-inline images.
 *
 * Hero example (LCP image, above fold):
 *   <LazyImage isHero src="/LianaBanyanLogo.png" alt="Liana Banyan logo" width={128} height={128} />
 *
 * Non-hero example (lazy loaded):
 *   <LazyImage src="/images/founder-mascot.png" alt="Founder mascot" width={200} height={200} />
 *
 * With WebP srcSet:
 *   <LazyImage
 *     src="/images/chess_stats.jpg"
 *     srcSet="/images/chess_stats.webp 1x, /images/chess_stats@2x.webp 2x"
 *     sizes="(max-width: 640px) 100vw, 50vw"
 *     alt="Chess statistics chart"
 *     width={800}
 *     height={600}
 *   />
 */
export function LazyImage({
  isHero = false,
  alt,
  className,
  ...props
}: LazyImageProps) {
  return (
    <img
      alt={alt}
      loading={isHero ? "eager" : "lazy"}
      decoding="async"
      // @ts-expect-error fetchpriority is valid HTML but not yet in React types
      fetchpriority={isHero ? "high" : "auto"}
      className={className}
      {...props}
    />
  );
}
