import { ReactNode, useEffect } from "react";
import { cn } from "@/lib/utils";

export type SEOMeta = {
  title?: string;
  description?: string;
  noIndex?: boolean;
  canonicalUrl?: string;
};

type FocusShellProps = {
  children: ReactNode;
  hero?: ReactNode;
  seo?: SEOMeta;
  className?: string;
  xrayBase?: string;
};

export function FocusShell({ children, hero, seo, className, xrayBase }: FocusShellProps) {
  useEffect(() => {
    if (!seo) return;
    if (seo.title) document.title = seo.title;

    if (seo.description) {
      let descriptionTag = document.querySelector('meta[name="description"]');
      if (!descriptionTag) {
        descriptionTag = document.createElement("meta");
        descriptionTag.setAttribute("name", "description");
        document.head.appendChild(descriptionTag);
      }
      descriptionTag.setAttribute("content", seo.description);
    }

    if (seo.noIndex !== undefined) {
      let robotsTag = document.querySelector('meta[name="robots"]');
      if (!robotsTag) {
        robotsTag = document.createElement("meta");
        robotsTag.setAttribute("name", "robots");
        document.head.appendChild(robotsTag);
      }
      robotsTag.setAttribute("content", seo.noIndex ? "noindex, nofollow" : "index, follow");
    }

    if (seo.canonicalUrl) {
      let canonicalTag = document.querySelector('link[rel="canonical"]');
      if (!canonicalTag) {
        canonicalTag = document.createElement("link");
        canonicalTag.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalTag);
      }
      canonicalTag.setAttribute("href", seo.canonicalUrl);
    }
  }, [seo]);

  return (
    <div
      className={cn("min-h-screen bg-background text-foreground", className)}
      data-xray-id={xrayBase ? `${xrayBase}-shell` : undefined}
    >
      {hero ? (
        <section className="w-full" data-xray-id={xrayBase ? `${xrayBase}-hero` : undefined}>
          {hero}
        </section>
      ) : null}
      <main
        className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8"
        data-xray-id={xrayBase ? `${xrayBase}-main` : undefined}
      >
        {children}
      </main>
    </div>
  );
}
