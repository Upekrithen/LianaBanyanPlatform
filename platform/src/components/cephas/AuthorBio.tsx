import { useCanonicalStats } from "@/hooks/useCanonicalStats";
import { buildTemplateVars } from "@/lib/cephasTemplateEngine";
import { useMemo } from "react";

interface AuthorBioProps {
  compact?: boolean;
}

export function AuthorBio({ compact = false }: AuthorBioProps) {
  const stats = useCanonicalStats();
  const vars = useMemo(() => buildTemplateVars(stats), [stats]);

  if (compact) {
    return (
      <p className="text-sm text-muted-foreground font-['Source_Sans_3',sans-serif]">
        Jonathan Jones &middot; Founder &amp; General Manager &middot; Liana Banyan Corporation
      </p>
    );
  }

  return (
    <section className="space-y-4 pt-6 border-t">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground font-['Source_Sans_3',sans-serif] mb-2">
          About the Author
        </h3>
        <p className="text-sm leading-relaxed text-foreground/80 font-['Crimson_Pro',Georgia,serif]">
          Jonathan Jones is a U.S. Army National Guard veteran (enlisted at 16, Infantry 11B,
          OCS to IFR-rated Aviation 15A), father of eight, and the founder of Liana Banyan
          Corporation — a Wyoming C-Corp building the world's first worker-owned cooperative
          economic platform. The platform has {vars.innovationCount} documented innovations,{" "}
          {vars.patentApplications} provisional patent applications covering {vars.formalClaimsCount}{" "}
          formal claims, and {vars.productionSystems} live production systems.
        </p>
      </div>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground font-['Source_Sans_3',sans-serif] mb-2">
          About Liana Banyan
        </h3>
        <p className="text-sm text-muted-foreground font-['Source_Sans_3',sans-serif]">
          {vars.innovationCount} innovations &middot; {vars.patentApplications} patent
          applications &middot; $5/year &middot; 83.3% creator split
        </p>
      </div>
    </section>
  );
}
