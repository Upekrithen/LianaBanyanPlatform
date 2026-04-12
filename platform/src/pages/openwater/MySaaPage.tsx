/**
 * MySaaPage — /openwater/my-saa
 * ================================================
 * User's SAA ledger, $10M cap status, cascade visualization.
 * K405 (Ripple Mechanics) / B097. Innovation #2241.
 */
import { useState } from "react";
import { MuseumShell } from "@/components/museum/MuseumShell";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, Waves } from "lucide-react";
import SaaLedgerView from "@/components/SaaLedgerView";
import CascadeVisualization from "@/components/CascadeVisualization";

export default function MySaaPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"ledger" | "cascade">("ledger");

  return (
    <MuseumShell>
      <div className="min-h-screen px-4 py-8 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            <h1
              className="text-xl font-bold"
              style={{ color: "#faf5eb", fontFamily: "'Crimson Pro', Georgia, serif" }}
            >
              My SAA
            </h1>
          </div>
          <p className="text-xs text-slate-500 mb-6">
            Success-Aligned Allocation — proportional to the growth you help create.
          </p>

          {!user ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-sm">Sign in to view your SAA ledger.</p>
            </div>
          ) : (
            <>
              {/* Tab toggle */}
              <div className="flex gap-1 mb-6">
                <button
                  onClick={() => setTab("ledger")}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    tab === "ledger"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      : "text-slate-400 border border-transparent hover:text-slate-200"
                  }`}
                >
                  <TrendingUp className="w-3 h-3" />
                  Ledger & Cap
                </button>
                <button
                  onClick={() => setTab("cascade")}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    tab === "cascade"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      : "text-slate-400 border border-transparent hover:text-slate-200"
                  }`}
                >
                  <Waves className="w-3 h-3" />
                  Cascade
                </button>
              </div>

              {tab === "ledger" ? <SaaLedgerView /> : <CascadeVisualization />}
            </>
          )}
        </div>
      </div>
    </MuseumShell>
  );
}
