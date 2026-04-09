/**
 * Door 3: "I'm ready" — The Committed
 * Clean pitch: 6 checkmarks, $5, one button.
 * /join = pitch screen. /welcome = post-signup Helm first visit.
 */
import { useLocation, useNavigate } from "react-router-dom";
import { MuseumShell } from "@/components/museum/MuseumShell";
import { MascotBubble } from "@/components/v2/mascot/MascotBubble";
import { LRHCharacter } from "@/components/museum/LRHCharacter";
import { motion } from "framer-motion";
import { Check, LogIn } from "lucide-react";

const benefits = [
  "Own your storefront",
  "Keep 83.3% of everything",
  "Vote on how it runs",
  "Access 16 community programs",
  "Ghost World practice mode",
  "Your own Helm dashboard",
];

const Door3Join = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isWelcome = location.pathname === "/welcome";

  if (isWelcome) {
    return <HelmFirstVisit />;
  }

  return (
    <MuseumShell>
      <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-24 max-w-md mx-auto">
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* The price */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-1">$5 a year.</h1>
            <p className="text-slate-400 text-lg">That's it.</p>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-8">
            {benefits.map((b, i) => (
              <motion.div
                key={b}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-slate-200 text-sm">{b}</span>
              </motion.div>
            ))}
          </div>

          {/* Trust line */}
          <p className="text-slate-500 text-sm text-center mb-8">
            No ads. No data harvesting. No hidden fees. Ever.
          </p>

          {/* CTA */}
          <button
            onClick={() => {
              // In production: navigate to Supabase auth → Stripe $5 → /welcome
              // For now: go to welcome
              navigate("/welcome");
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base transition-colors active:scale-[0.98]"
          >
            Join for $5/year →
          </button>

          {/* Sign in */}
          <button
            className="w-full mt-3 py-2.5 px-4 flex items-center justify-center gap-2 text-slate-400 hover:text-slate-200 text-sm transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Already a member? Sign in
          </button>
        </motion.div>
      </div>
    </MuseumShell>
  );
};

function HelmFirstVisit() {
  const navigate = useNavigate();

  return (
    <MuseumShell>
      <div className="min-h-screen flex flex-col px-4 py-6 pb-24 max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-xl font-bold text-white mb-4">Your Helm</h1>

          {/* LRH welcome */}
          <div className="flex items-start gap-3 mb-6">
            <LRHCharacter size={36} />
            <MascotBubble
              title="Welcome home."
              message="I set up a few things based on what you explored. Credits are dollars. Marks are what you earn by working. Joules store your surplus forever."
              maxWidth={300}
            />
          </div>

          {/* Pathway card */}
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-slate-900/60 mb-3">
            <div className="text-emerald-400 text-xs font-medium mb-1">Your Pathway</div>
            <div className="text-white font-semibold">Food 🍳</div>
            <div className="text-slate-400 text-xs mt-1">3 open bounties</div>
            <button className="text-emerald-400 text-xs mt-2 hover:text-emerald-300">See them →</button>
          </div>

          {/* First cue card */}
          <div className="p-4 rounded-xl border border-cyan-500/20 bg-slate-900/60 mb-3">
            <div className="text-cyan-400 text-xs font-medium mb-1">Your First Cue Card</div>
            <div className="text-white text-sm">Share this → earn 10 Marks</div>
            <button className="text-cyan-400 text-xs mt-2 hover:text-cyan-300">Get your card →</button>
          </div>

          {/* Find your people */}
          <div className="p-4 rounded-xl border border-purple-500/20 bg-slate-900/60 mb-3">
            <div className="text-purple-400 text-xs font-medium mb-1">Find Your People</div>
            <div className="text-white text-sm">Join a Guild or Tribe</div>
            <button className="text-purple-400 text-xs mt-2 hover:text-purple-300">Browse →</button>
          </div>

          {/* Currency display */}
          <div className="mt-6 p-4 rounded-xl bg-slate-900/60 border border-slate-700/40">
            <div className="flex justify-between">
              <CurrencyPill label="Credits" value="5" color="#06b6d4" />
              <CurrencyPill label="Marks" value="0" color="#8b5cf6" />
              <CurrencyPill label="Joules" value="0" color="#eab308" />
            </div>
          </div>
        </motion.div>
      </div>
    </MuseumShell>
  );
}

function CurrencyPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center">
      <div className="text-lg font-bold tabular-nums" style={{ color }}>{value}</div>
      <div className="text-[10px] text-slate-400">{label}</div>
    </div>
  );
}

export default Door3Join;
