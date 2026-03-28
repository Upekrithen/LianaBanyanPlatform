/**
 * MedallionScanRedCarpet — Shown when someone scans a physical medallion's QR code.
 * Animated medallion flip → reveal welcome text → two CTAs.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Rocket, BookOpen } from 'lucide-react';
import { ShipMedallion } from '@/components/ShipMedallion';

interface Props {
  experience: Record<string, unknown>;
  sponsorName?: string;
  sponsorId?: string;
  activationCode?: string;
}

export default function MedallionScanRedCarpet({ sponsorName }: Props) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a00 30%, #0a0a0a 60%, #0a0a1a 100%)',
      }}
    >
      <div className="max-w-md w-full text-center space-y-6">
        {sponsorName && (
          <p className="text-amber-400/60 text-sm">
            Shared by <span className="font-semibold text-amber-300">{sponsorName}</span>
          </p>
        )}

        <div className="flex justify-center">
          <ShipMedallion size="hero" earned autoFlip />
        </div>

        <div
          className={`transition-all duration-1000 ${
            revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <h1 className="text-3xl font-black text-white mb-2">
            Welcome to The 2nd Second Industrial Revolution
          </h1>
          <p className="text-amber-200/70 text-lg italic mb-8">
            The Grand Experiment to Save the World
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/production">
              <Button
                size="lg"
                className="bg-amber-600 hover:bg-amber-500 text-white gap-2 w-full sm:w-auto"
              >
                <Rocket className="w-5 h-5" /> Start Building
              </Button>
            </Link>
            <Link to="/2nd-second">
              <Button
                size="lg"
                variant="outline"
                className="border-amber-700/40 text-amber-300 hover:bg-amber-900/30 gap-2 w-full sm:w-auto"
              >
                <BookOpen className="w-5 h-5" /> Learn More
              </Button>
            </Link>
          </div>
        </div>

        <p className="text-white/15 text-[10px] mt-12">
          &copy; 2026 Liana Banyan Corporation
        </p>
      </div>
    </div>
  );
}
