import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

interface RedCarpetShellProps {
  children: ReactNode;
  sponsorName?: string;
  activationCode?: string;
  preloadedAmount?: number;
}

export function RedCarpetShell({ children, sponsorName, activationCode, preloadedAmount }: RedCarpetShellProps) {
  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 30%, #0a0a0a 60%, #0a0a1a 100%)',
      }}
    >
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Sponsor attribution */}
        {sponsorName && (
          <div className="text-center">
            <p className="text-amber-400/70 text-sm">
              Invited by <span className="font-semibold text-amber-300">{sponsorName}</span>
            </p>
          </div>
        )}

        {/* Pre-funded badge */}
        {preloadedAmount && preloadedAmount > 0 && (
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-900/40 border border-emerald-600/30 text-emerald-300 text-sm font-medium">
              This card carries ${preloadedAmount.toFixed(2)} — yours after signup
            </span>
          </div>
        )}

        {children}

        {/* Universal CTA */}
        <div className="border-t border-white/10 pt-6 space-y-3">
          <Link to={`/auth?ref=red-carpet${activationCode ? `&code=${activationCode}` : ''}`}>
            <Button className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white text-lg font-bold">
              <UserPlus className="w-5 h-5 mr-2" />
              Join — $5/year
            </Button>
          </Link>
          <p className="text-center text-white/30 text-xs">
            Same terms as the Founder. Creator keeps 83.3%. Cost + 20%. No hidden fees.
          </p>
        </div>

        <p className="text-center text-white/15 text-[10px]">
          &copy; 2026 Liana Banyan Corporation
        </p>
      </div>
    </div>
  );
}
