/**
 * usePageSEO -- BP072 Wave 29 (Phase delta-2)
 *
 * Sets document.title and updates or creates <meta> tags for description,
 * og:title, og:description, and canonical <link> for a given page.
 *
 * This is a lightweight in-SPA solution that runs on mount/update. For
 * production SSR/prerender, these values should also be baked into the
 * served HTML at the edge.
 *
 * Usage:
 *   usePageSEO({
 *     title: "Let's Make Dinner | Liana Banyan",
 *     description: "Find home-cooked meals in your neighborhood...",
 *     canonical: "https://lianabanyan.com/initiatives/lets-make-dinner",
 *   });
 */

import { useEffect } from "react";

interface PageSEOOptions {
  title: string;
  description: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
}

function setMeta(name: string, content: string, property = false) {
  const attr = property ? "property" : "name";
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function usePageSEO({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
}: PageSEOOptions): void {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    setMeta("description", description);
    setMeta("og:title", ogTitle ?? title, true);
    setMeta("og:description", ogDescription ?? description, true);
    setMeta("twitter:title", ogTitle ?? title, true);
    setMeta("twitter:description", ogDescription ?? description, true);

    if (canonical) {
      setCanonical(canonical);
    }

    return () => {
      document.title = prevTitle;
    };
  }, [title, description, canonical, ogTitle, ogDescription]);
}
