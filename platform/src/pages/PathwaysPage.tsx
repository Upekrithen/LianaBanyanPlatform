import React, { useEffect, useState } from "react";

// M20: /pathways/ — direct-door post-payment landing
// Detects ?just_joined=1, sets lb_member cookie, shows welcome overlay

export default function PathwaysPage() {
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("just_joined") === "1") {
      localStorage.setItem("lb_member", "1");
      setShowOverlay(true);
      window.history.replaceState({}, "", "/pathways/");
      const timer = setTimeout(() => setShowOverlay(false), 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Welcome overlay — appears on ?just_joined=1 return from Stripe */}
      {showOverlay && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            bottom: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--color-accent, #1a56db)",
            color: "white",
            padding: "1rem 2rem",
            borderRadius: "0.5rem",
            fontSize: "1.1rem",
            zIndex: 9999,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            transition: "opacity 0.3s ease",
          }}
        >
          Welcome to the cooperative.
        </div>
      )}

      {/* Page body */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-4">Your Pathways</h1>
        <p className="text-muted-foreground mb-8">
          You&rsquo;re now a cooperative member. Explore everything available to you.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <PathwayCard
            title="Let's Make Dinner"
            description="Cooperative meal-planning and home-chef coordination."
            href="/initiatives/lets-make-dinner"
          />
          <PathwayCard
            title="Let's Go Shopping"
            description="Group purchasing power and community commerce."
            href="/initiatives/lets-go-shopping"
          />
          <PathwayCard
            title="VSL — Very Short Loans"
            description="Cooperative microfinance and peer-lending."
            href="/initiatives/vsl"
          />
          <PathwayCard
            title="Didasko"
            description="Cooperative education marketplace."
            href="/initiatives/didasko"
          />
          <PathwayCard
            title="JukeBox"
            description="Cooperative music and entertainment platform."
            href="/initiatives/jukebox"
          />
          <PathwayCard
            title="Harper Guild"
            description="Cooperative creative guild for writers and artists."
            href="/initiatives/harper-guild"
          />
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            83.3% of every dollar you earn stays with you. No ads. No extraction.
          </p>
        </div>
      </div>
    </div>
  );
}

function PathwayCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="block rounded-lg border border-border p-5 hover:bg-accent/50 transition-colors"
    >
      <h2 className="font-semibold mb-1">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </a>
  );
}
