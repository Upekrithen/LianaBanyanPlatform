/**
 * Clean academic numbered claim list (Session 19).
 */
import { ReactNode } from "react";

interface InnovationClaimListProps {
  claims: ReactNode[];
  className?: string;
}

export function InnovationClaimList({ claims, className = "" }: InnovationClaimListProps) {
  return (
    <ol className={`cephas-innovation-claim-list list-decimal list-inside space-y-2 ${className}`}>
      {claims.map((c, i) => (
        <li key={i} className="pl-2">{c}</li>
      ))}
    </ol>
  );
}
