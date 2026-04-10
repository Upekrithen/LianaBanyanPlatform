/**
 * Door 1: "What is this?" — The Curious Visitor
 * LRH appears with an offer to guide. 5-stop tour, user-paced.
 * Exits to Ghost World, Door 2, or Door 3.
 *
 * K393: Beacon system, info pills, financial breakdown, governance detail,
 *       end-of-tour beacon summary.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MuseumShell } from "@/components/museum/MuseumShell";
import { MascotBubble } from "@/components/v2/mascot/MascotBubble";
import { CreatorGauge } from "@/components/museum/CreatorGauge";
import { LRHCharacter } from "@/components/museum/LRHCharacter";
import { useXRay } from "@/components/museum/XRayContext";
import { TrustBadges } from "@/components/museum/TrustBadges";
import { motion, AnimatePresence } from "framer-motion";

interface TourStop {
  title: string;
  message: string;
  content: React.ReactNode;
}

interface TourBeacon {
  id: string;
  label: string;
  color: "green" | "blue";
  route?: string;
}

const INITIATIVES = [
  "\u{1F373} Food", "\u{1F3E5} Health", "\u2696\uFE0F Legal", "\u{1F4DA} Education",
  "\u{1F3E0} Housing", "\u{1F697} Transport", "\u{1F3ED} Making", "\u{1F3A8} Design",
  "\u{1F4BC} Business", "\u{1F527} Service", "\u{1F3D5}\uFE0F Community", "\u{1F6E1}\uFE0F Defense",
  "\u{1F4E1} Network", "\u{1F5F3}\uFE0F Governance", "\u{1F3AD} Culture", "\u{1F30D} Expansion",
];

const GOVERNANCE_ROLES = [
  {
    id: "crowns",
    icon: "\u{1F3C6}",
    label: "Crowns",
    detail:
      "Invited leaders. Industry experts. Each Crown holds a specific domain \u2014 food, healthcare, education, defense. They set the vision.",
  },
  {
    id: "board",
    icon: "\u{1F4CB}",
    label: "Board",
    detail:
      "Elected by members. They represent the community's voice. When you join, you vote for Board seats.",
  },
  {
    id: "captains",
    icon: "\u2693",
    label: "Captains",
    detail:
      "Earned through contribution. They run initiatives on the ground. Build enough, contribute enough, and a Captain's seat opens.",
  },
];

/* ─── Sub-components ──────────────────────────────────────────── */

function Stop1Content({
  setTourPrice,
  dropBeacon,
  hasBeacon,
}: {
  setTourPrice: (p: number) => void;
  dropBeacon: (b: TourBeacon) => void;
  hasBeacon: (id: string) => boolean;
}) {
  const [expandedPill, setExpandedPill] = useState<string | null>(null);

  const pills = [
    {
      id: "no-ads",
      icon: "\u{1F6AB}",
      label: "No Ads",
      detail: "No tracking. No data selling. No algorithmic manipulation. Your attention isn't the product.",
      cephasRoute: "/why-no-ads",
    },
    {
      id: "no-vc",
      icon: "\u{1F4B0}",
      label: "No V.C.",
      detail: "No venture capital. No investors to answer to. The platform answers to members.",
      cephasRoute: "/why-no-vc",
    },
    {
      id: "cost-plus-20",
      icon: "\u{1F4D0}",
      label: "Cost+20%",
      detail: "The platform takes exactly Cost + 20%. Not 30%. Not 50%. A structural cap written into the bylaws.",
      cephasRoute: "/library/wading",
    },
    {
      id: "five-dollar",
      icon: "\u{1F3AB}",
      label: "$5/year",
      detail: "Full membership. No tiers. No premium upsell. Five dollars, everything included.",
      cephasRoute: "/library/stones",
    },
  ];

  return (
    <div className="space-y-4">
      <CreatorGauge onPriceChange={setTourPrice} />

      <div className="max-w-sm mx-auto space-y-2">
        {pills.map((pill) => {
          const isExpanded = expandedPill === pill.id;
          const isBeaconed = hasBeacon(`blue-${pill.id}`);

          return (
            <div key={pill.id} className="overflow-hidden">
              <button
                onClick={() => setExpandedPill(isExpanded ? null : pill.id)}
                className={`w-full text-left px-3 py-2 rounded-lg border transition-colors text-sm flex items-center gap-2 ${
                  isExpanded
                    ? "bg-slate-800/80 border-slate-600"
                    : "bg-slate-900/60 border-slate-700/40 hover:bg-slate-800/60"
                }`}
              >
                <span>{pill.icon}</span>
                <span className="text-slate-200 font-medium">{pill.label}</span>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 py-2 text-xs text-slate-400 leading-relaxed">
                      {pill.detail}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dropBeacon({
                            id: `blue-${pill.id}`,
                            label: pill.label,
                            color: "blue",
                            route: pill.cephasRoute,
                          });
                        }}
                        className={`mt-2 flex items-center gap-1 text-xs font-medium transition-colors ${
                          isBeaconed
                            ? "text-blue-400 border-blue-500"
                            : "text-blue-500 hover:text-blue-400"
                        }`}
                      >
                        <span className={`inline-block w-2 h-2 rounded-full ${isBeaconed ? "bg-blue-400" : "bg-blue-500"}`} />
                        {isBeaconed ? "Saved to reading list" : "Read more on Cephas \u2192"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stop2Content({
  tourPrice,
  dropBeacon,
  hasBeacon,
}: {
  tourPrice: number;
  dropBeacon: (b: TourBeacon) => void;
  hasBeacon: (id: string) => boolean;
}) {
  const [transactions, setTransactions] = useState(10);

  const platformRevenue = tourPrice * (1 / 6) * transactions;
  const perInitiative = platformRevenue / 16;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
        {INITIATIVES.map((item) => {
          const emoji = item.split(" ")[0];
          const label = item.split(" ")[1];
          const beaconId = `green-initiative-${label.toLowerCase()}`;
          const isBeaconed = hasBeacon(beaconId);

          return (
            <button
              key={item}
              onClick={() =>
                dropBeacon({
                  id: beaconId,
                  label: `${label} Initiative`,
                  color: "green",
                })
              }
              className={`text-center p-2 rounded-lg bg-slate-800/50 border transition-colors active:scale-[0.95] ${
                isBeaconed
                  ? "border-green-500 bg-green-500/10"
                  : "border-slate-700/40 hover:border-slate-600"
              }`}
            >
              <div className="text-sm">{emoji}</div>
              <div className="text-[9px] text-slate-400 mt-0.5">{label}</div>
            </button>
          );
        })}
      </div>

      <div className="max-w-sm mx-auto p-4 rounded-xl border border-slate-700/50 bg-slate-900/60 space-y-3">
        <div className="text-xs text-emerald-400/60 tracking-[0.1em] uppercase">
          Financial Breakdown
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Sale price</span>
          <span className="text-white font-medium">${tourPrice.toLocaleString()}</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400">Transactions</span>
          <select
            value={transactions}
            onChange={(e) => setTransactions(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {[1, 10, 50, 100, 500].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-between text-sm border-t border-slate-700/50 pt-2">
          <span className="text-slate-400">Platform receives (16.7%)</span>
          <span className="text-amber-400 font-medium">
            ${Math.round(platformRevenue).toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Per initiative (\u00F716)</span>
          <span className="text-emerald-400 font-medium">
            ${Math.round(perInitiative).toLocaleString()}
          </span>
        </div>

        <div className="space-y-1 pt-1">
          {INITIATIVES.map((item) => {
            const label = item.split(" ")[1];
            const emoji = item.split(" ")[0];
            const barWidth = Math.max(4, (perInitiative / platformRevenue) * 100);
            return (
              <div key={item} className="flex items-center gap-2 text-[10px]">
                <span className="w-4 text-center">{emoji}</span>
                <span className="w-16 text-slate-500 truncate">{label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500/60 transition-all duration-300"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <span className="text-slate-500 w-12 text-right tabular-nums">
                  ${Math.round(perInitiative).toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stop3Content({
  dropBeacon,
  hasBeacon,
}: {
  dropBeacon: (b: TourBeacon) => void;
  hasBeacon: (id: string) => boolean;
}) {
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  return (
    <div className="max-w-sm mx-auto space-y-4">
      <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-900/60">
        <div className="text-xs text-slate-400 mb-3">The 300 \u2014 Governance Seats</div>
        <div className="w-full h-4 rounded-full bg-slate-800 overflow-hidden mb-2">
          <div className="h-full rounded-full bg-amber-500/80" style={{ width: "4%" }} />
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>12 of 300 seats filled</span>
          <span>4%</span>
        </div>
      </div>

      <div className="space-y-2">
        {GOVERNANCE_ROLES.map((role) => {
          const isExpanded = expandedRole === role.id;
          const beaconId = `green-gov-${role.id}`;
          const isBeaconed = hasBeacon(beaconId);

          return (
            <div key={role.id}>
              <button
                onClick={() => {
                  setExpandedRole(isExpanded ? null : role.id);
                  dropBeacon({
                    id: beaconId,
                    label: `${role.label} governance`,
                    color: "green",
                  });
                }}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-colors flex items-center gap-3 ${
                  isBeaconed
                    ? "border-green-500 bg-green-500/10"
                    : "border-slate-700/40 bg-slate-800/50 hover:bg-slate-800/80"
                }`}
              >
                <span className="text-lg">{role.icon}</span>
                <span className="text-sm text-slate-200 font-medium">{role.label}</span>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 py-2 text-xs text-slate-400 leading-relaxed">
                      {role.detail}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stop5Content({
  beacons,
  showBeaconSummary,
  setShowBeaconSummary,
  navigate,
}: {
  beacons: TourBeacon[];
  showBeaconSummary: boolean;
  setShowBeaconSummary: (v: boolean) => void;
  navigate: (path: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 max-w-sm mx-auto">
        <TourExitButton
          icon="\u{1F50D}"
          label="Let me browse first"
          sublabel="Free exploration, no signup"
          onClick={() => navigate("/browse")}
        />
        <TourExitButton
          icon="\u{1F528}"
          label="I want to build something"
          sublabel="See 6 pathways"
          onClick={() => navigate("/build")}
        />
        <TourExitButton
          icon="\u{1F91D}"
          label="I'm in \u2014 let me join"
          sublabel="$5/year, full access"
          onClick={() => navigate("/join")}
        />
      </div>

      {showBeaconSummary && beacons.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-xl border border-emerald-500/30 bg-slate-900/90 max-w-sm mx-auto"
        >
          <div className="text-sm text-white font-medium mb-2">
            You dropped {beacons.length} beacon{beacons.length !== 1 ? "s" : ""} during the tour!
          </div>
          <div className="text-xs text-slate-400 mb-1">
            {beacons.filter(b => b.color === "green").length > 0 && (
              <span className="inline-flex items-center gap-1 mr-3">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {beacons.filter(b => b.color === "green").length} to revisit
              </span>
            )}
            {beacons.filter(b => b.color === "blue").length > 0 && (
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                {beacons.filter(b => b.color === "blue").length} to read
              </span>
            )}
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => navigate("/browse")}
              className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
            >
              Show me my beacons
            </button>
            <button
              onClick={() => setShowBeaconSummary(false)}
              className="flex-1 py-2 px-3 rounded-lg border border-slate-600 text-slate-400 hover:text-slate-200 text-xs transition-colors"
            >
              Maybe later
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function TourExitButton({ icon, label, sublabel, onClick }: { icon: string; label: string; sublabel: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-xl border border-slate-700/60 bg-slate-900/80 hover:bg-slate-800/80 transition-colors active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <div>
          <div className="text-white text-sm font-medium">{label}</div>
          <div className="text-slate-400 text-xs">{sublabel}</div>
        </div>
      </div>
    </button>
  );
}

/* ─── Main Component ──────────────────────────────────────────── */

const Door1Tour = () => {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [stop, setStop] = useState(0);
  const [lrhHovered, setLrhHovered] = useState(false);
  const { xrayOn } = useXRay();

  const [tourPrice, setTourPrice] = useState(500);
  const [beacons, setBeacons] = useState<TourBeacon[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showBeaconSummary, setShowBeaconSummary] = useState(false);

  const dropBeacon = (beacon: TourBeacon) => {
    setBeacons(prev => {
      if (prev.some(b => b.id === beacon.id)) return prev;
      return [...prev, beacon];
    });
    setToastMessage("Beacon dropped \u2014 revisit after the tour");
    setTimeout(() => setToastMessage(null), 2000);
  };

  const hasBeacon = (id: string) => beacons.some(b => b.id === id);

  const stops: TourStop[] = [
    {
      title: "Stop 1: The Deal",
      message: "When you sell something here, you keep 83.3%. Every time. The platform takes Cost + 20% \u2014 that's it. Slide the price to see what you'd keep.",
      content: (
        <Stop1Content
          setTourPrice={setTourPrice}
          dropBeacon={dropBeacon}
          hasBeacon={hasBeacon}
        />
      ),
    },
    {
      title: "Stop 2: Where the 20% Goes",
      message: "That 20%? It doesn't go to investors. It funds 16 programs \u2014 food, healthcare, legal protection, education. Real initiatives with real progress bars. Tap any to drop a beacon.",
      content: (
        <Stop2Content
          tourPrice={tourPrice}
          dropBeacon={dropBeacon}
          hasBeacon={hasBeacon}
        />
      ),
    },
    {
      title: "Stop 3: Who Decides",
      message: "This isn't run by a CEO. 300 people govern it \u2014 Crowns, Board, Captains. Real names. Real accountability. Why only 12 so far? We're pre-launch. The first seats go to Crown holders \u2014 leaders invited for who they are, not what they paid. As the community grows, seats fill through merit and election.",
      content: (
        <Stop3Content dropBeacon={dropBeacon} hasBeacon={hasBeacon} />
      ),
    },
    {
      title: "Stop 4: No Tricks",
      message: "No ads. No data collection. No venture capital. The price cap can never increase. This is structural \u2014 it's in the bylaws, not a marketing promise.",
      content: <TrustBadges />,
    },
    {
      title: "Stop 5: Your Turn",
      message: "That's the 90-second version. What do you want to do?",
      content: (
        <Stop5Content
          beacons={beacons}
          showBeaconSummary={showBeaconSummary}
          setShowBeaconSummary={setShowBeaconSummary}
          navigate={navigate}
        />
      ),
    },
  ];

  useEffect(() => {
    if (stop === 4 && beacons.length > 0) {
      setShowBeaconSummary(true);
    }
  }, [stop, beacons.length]);

  if (!started) {
    return (
      <MuseumShell hideFabs>
        <div className="min-h-screen flex flex-col items-center justify-center px-6 max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-6 flex justify-center"
              onMouseEnter={() => setLrhHovered(true)}
              onMouseLeave={() => setLrhHovered(false)}
            >
              <LRHCharacter size={80} />
            </div>
            <MascotBubble
              title={lrhHovered && !xrayOn ? "Put Your GOGGLES On!!" : "Hey! I'm the Little Red Hen."}
              message={lrhHovered && !xrayOn
                ? "Click me to activate X-Ray Goggles and see what's hidden."
                : xrayOn
                  ? "X-Ray Goggles are ON. You can see the hidden details. Click me again to turn them off."
                  : "The value is in the services and products provided through Liana Banyan. Let me show you what we built. It takes 90 seconds. Click me for Xray Mode."
              }
              maxWidth={320}
              borderColor={xrayOn ? undefined : "rgba(212, 168, 83, 0.35)"}
              titleColor={xrayOn ? undefined : "#d4a853"}
            >
              <div className="flex flex-col gap-2 mt-3">
                <button
                  onClick={() => setStarted(true)}
                  className="w-full py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors"
                >
                  Show me \u2192
                </button>
                <button
                  onClick={() => navigate("/browse")}
                  className="w-full py-2 px-4 rounded-lg border border-slate-600 text-slate-400 hover:text-slate-200 text-sm transition-colors"
                >
                  I'll explore on my own
                </button>
              </div>
            </MascotBubble>
          </motion.div>
        </div>
      </MuseumShell>
    );
  }

  const current = stops[stop];
  const isLast = stop === stops.length - 1;

  const TOUR_BORDER = "rgba(212, 168, 83, 0.35)";

  return (
    <MuseumShell hideFabs>
      <div className="min-h-screen flex flex-col px-4 py-6 pb-4 max-w-md mx-auto">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {stops.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === stop ? "bg-amber-400" : i < stop ? "bg-amber-700" : "bg-slate-700"
              }`}
            />
          ))}
        </div>

        {/* LRH speech bubble */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stop}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <div className="flex items-start gap-3">
              <LRHCharacter size={36} />
              <MascotBubble
                title={current.title}
                message={<span style={{ lineHeight: 1.7 }}>{current.message}</span>}
                maxWidth={340}
                showIcon={false}
                borderColor={TOUR_BORDER}
                titleColor="#d4a853"
              />
            </div>

            {/* Gold separator */}
            <div className="my-4" style={{ borderTop: "1px solid rgba(212, 168, 83, 0.15)" }} />

            {/* Interactive content */}
            <div
              className="flex-1"
              style={{ minHeight: "50vh", boxShadow: "inset 0 0 30px rgba(212, 168, 83, 0.03)" }}
            >
              {current.content}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Sticky navigation */}
        {!isLast && (
          <div className="sticky bottom-4 flex justify-between items-center pt-4 z-20">
            <button
              onClick={() => setStop(Math.max(0, stop - 1))}
              className={`text-sm text-slate-500 hover:text-slate-300 transition-colors ${stop === 0 ? "invisible" : ""}`}
            >
              \u2190 Back
            </button>
            <button
              onClick={() => setStop(stop + 1)}
              className="py-2.5 px-6 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors"
            >
              Next \u2192
            </button>
          </div>
        )}
      </div>

      {/* Beacon toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-amber-600/90 text-white text-sm shadow-lg z-50"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </MuseumShell>
  );
};

export default Door1Tour;
