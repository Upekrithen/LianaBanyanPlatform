import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type CTAAction = {
  label: string;
  href?: string;
  onClick?: () => void;
};

type StickyMobileCTAProps = {
  primary: CTAAction;
  secondary?: CTAAction;
};

function ActionButton({ action, variant = "default" }: { action: CTAAction; variant?: "default" | "outline" }) {
  if (action.href) {
    return (
      <Button asChild className="w-full" variant={variant}>
        <a href={action.href}>{action.label}</a>
      </Button>
    );
  }

  return (
    <Button className="w-full" variant={variant} onClick={action.onClick}>
      {action.label}
    </Button>
  );
}

export function StickyMobileCTA({ primary, secondary }: StickyMobileCTAProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="h-1 w-full" aria-hidden />
      {isVisible ? (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 p-3 backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-3xl gap-2">
            <ActionButton action={primary} />
            {secondary ? <ActionButton action={secondary} variant="outline" /> : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
