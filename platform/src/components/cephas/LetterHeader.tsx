/**
 * Crown letter recipient info with role badge (Session 19).
 */
import { Badge } from "@/components/ui/badge";

interface LetterHeaderProps {
  recipientName: string;
  role?: string;
  initiative?: string;
}

export function LetterHeader({ recipientName, role, initiative }: LetterHeaderProps) {
  return (
    <header className="cephas-letter-header mb-6">
      <h2 className="text-xl font-semibold">{recipientName}</h2>
      <div className="flex flex-wrap gap-2 mt-2">
        {role && <Badge variant="secondary">{role}</Badge>}
        {initiative && <Badge variant="outline">{initiative}</Badge>}
      </div>
    </header>
  );
}
