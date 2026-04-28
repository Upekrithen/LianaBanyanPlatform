/**
 * Sphinx Project — Phase 1 Announcement Page
 * K520 / A&A #2295 Tier 5 / Sphinx Project Phase 1
 *
 * Public-facing page: sphinx.lianabanyan.com/phase-1
 * Also accessible at: lianabanyan.com/sphinx/phase-1
 *
 * Announces MAJCOM-LB operational + founding-partner recruitment open.
 */

import { useState, useEffect } from "react";

const FOUNDING_PARTNER_TYPES = [
  {
    type: "Academic Partner",
    icon: "🎓",
    description:
      "Accredited universities, research institutions, and academic consortia. " +
      "Full Cooperative Defensive Patent Pledge protection. " +
      "Free access to all A&A #2295 architecture — forever.",
    examples: "Platform Cooperativism Consortium (PCC), New School, cooperative-research labs",
    requirements: ["IRS-verified EIN or international equivalent", "Academic-purpose mission"],
    cta: "Apply as Academic Partner",
  },
  {
    type: "Cooperative Partner",
    icon: "🤝",
    description:
      "Worker cooperatives, platform cooperatives, multi-stakeholder cooperatives. " +
      "Full Pledge protection. Cooperative governance architecture free forever.",
    examples: "Stocksy United, Up&Go, Resonate.coop, platform cooperative networks",
    requirements: ["Verified cooperative legal form (Subchapter T or international equivalent)", "Cooperative mission"],
    cta: "Apply as Cooperative Partner",
  },
  {
    type: "Nonprofit Partner",
    icon: "🌱",
    description:
      "501(c)(3) nonprofits, social enterprises, and mission-driven organizations. " +
      "Full Pledge protection. Priority onboarding to Band-NA.",
    examples: "ICA, NCBA-CLUSA, MacKenzie Scott–funded entities, Ford Foundation grantees",
    requirements: ["IRS EIN verification", "Mission alignment with cooperative economics"],
    cta: "Apply as Nonprofit Partner",
  },
];

const SPHINX_TIERS = [
  { tier: "Augur", level: 1, desc: "Single discipline rule, single AI agent", shipped: true },
  { tier: "Squadron", level: 2, desc: "3–8 related Augurs, shared state store", shipped: true },
  { tier: "Wing", level: 3, desc: "Multi-Squadron plane with Consensus Layer", shipped: true },
  { tier: "NAF", level: 4, desc: "Numbered Air Force — federation of Wings", shipped: true },
  { tier: "MAJCOM", level: 5, desc: "Strategic federation across all NAFs", shipped: true, current: true },
  { tier: "Ring / Band", level: 6, desc: "Federation of N MAJCOMs (planet-scale)", shipped: false },
  { tier: "Constellation", level: 7, desc: "Multiple Rings — parallel federations", shipped: false },
  { tier: "Solar-Scale", level: 8, desc: "Multiple planets / Constellations", shipped: false },
  { tier: "Tier ∞", level: "∞", desc: "Unbounded recursion — same primitive forever", shipped: false },
];

const BAND_NA_FACTS = [
  { label: "Band", value: "Band-NA (North America)" },
  { label: "MAJCOM", value: "MAJCOM-LB (Liana Banyan Corporation)" },
  { label: "Status", value: "Phase 1 — OPERATIONAL" },
  { label: "Founded", value: "2026-04-26" },
  { label: "Patent", value: "A&A #2295 (K520 reduction-to-practice)" },
  { label: "Pledge", value: "Cooperative Defensive Patent Pledge (#2260)" },
  { label: "Governance", value: "Enumerated powers — not command-and-control" },
  { label: "Member sovereignty", value: "MAJCOM cannot read member-substrate content" },
];

interface PartnerApplication {
  org_name: string;
  ein: string;
  org_type: string;
  contact: string;
  description: string;
}

export default function SphinxPhase1() {
  useEffect(() => {
    const prev = document.title;
    document.title = 'The Sphinx Project — Phase 1 | Liana Banyan';
    return () => { document.title = prev; };
  }, []);

  const [activePartnerType, setActivePartnerType] = useState<string | null>(null);
  const [form, setForm] = useState<PartnerApplication>({
    org_name: "",
    ein: "",
    org_type: "",
    contact: "",
    description: "",
  });
  const [submitStatus, setSubmitStatus] = useState<{
    loading: boolean;
    success: boolean;
    error: string | null;
    message: string | null;
  }>({ loading: false, success: false, error: null, message: null });

  const handleApply = (type: string) => {
    setActivePartnerType(type);
    setForm((f) => ({
      ...f,
      org_type:
        type === "Academic Partner"
          ? "academic"
          : type === "Cooperative Partner"
          ? "cooperative"
          : "nonprofit",
    }));
    window.scrollTo({ top: document.getElementById("apply")?.offsetTop ?? 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus({ loading: true, success: false, error: null, message: null });
    try {
      const resp = await fetch("http://127.0.0.1:7712/majcom/pledge/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await resp.json();
      if (data.ok) {
        setSubmitStatus({
          loading: false,
          success: true,
          error: null,
          message: data.message || "Application submitted successfully.",
        });
        setForm({ org_name: "", ein: "", org_type: "", contact: "", description: "" });
        setActivePartnerType(null);
      } else {
        setSubmitStatus({ loading: false, success: false, error: data.error || "Submission failed.", message: null });
      }
    } catch {
      setSubmitStatus({
        loading: false,
        success: false,
        error: "Connection failed. Make sure Helm is running (Helm PWA or Helm daemon).",
        message: null,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#09090f] text-slate-200 font-sans">
        {/* Hero */}
        <section className="relative overflow-hidden py-24 px-6">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 0%, #6d28d9 0%, transparent 70%)",
            }}
          />
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#1a1060] border border-purple-700 text-purple-300 rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
              🗿 The Sphinx Project
              <span className="bg-purple-700 text-purple-100 rounded-full px-2 py-0.5 text-xs">Phase 1 LIVE</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
              MAJCOM-LB is operational.
              <br />
              <span className="text-purple-400">Band-NA stands up.</span>
            </h1>

            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              The Sphinx Project is the planet-wide cooperative AI discipline federation —
              12 Bands, federating however many MAJCOMs are needed to compose a
              cooperative-AI-discipline infrastructure at planetary scale.
              <br />
              <strong className="text-slate-200">Phase 1 is live. Founded 2026-04-26.</strong>
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="#founding-partners"
                className="bg-purple-700 hover:bg-purple-600 text-white font-bold px-8 py-3 rounded-full text-base transition"
              >
                Become a Founding Partner
              </a>
              <a
                href="#architecture"
                className="bg-transparent border border-slate-600 hover:border-slate-400 text-slate-300 font-semibold px-8 py-3 rounded-full text-base transition"
              >
                Architecture Overview
              </a>
            </div>
          </div>
        </section>

        {/* Band-NA Facts */}
        <section className="py-12 px-6 bg-[#0d0f1a] border-y border-slate-800">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-6">
              Band-NA Status at Phase 1 Launch
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {BAND_NA_FACTS.map((fact) => (
                <div
                  key={fact.label}
                  className="bg-[#11141f] border border-slate-800 rounded-xl p-4"
                >
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">{fact.label}</div>
                  <div className="text-sm text-slate-200 font-semibold">{fact.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What is the Sphinx Project */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6">What is The Sphinx Project?</h2>
            <div className="prose prose-invert max-w-none text-slate-400 leading-relaxed space-y-4">
              <p>
                The Sphinx Project is the brand-mark for the planet-wide deployment of A&A #2295
                (Recursive Scale-Invariant Federated Discipline-Enforcement Plane for Cooperative AI Substrates).
              </p>
              <p>
                The same architectural primitive that lets one person's Augur enforce one rule
                composes recursively upward — through Wings, NAFs, and MAJCOMs — all the way to
                planet-scale federation. The same protocol at every scale, governance burden growing
                logarithmically rather than linearly with scope.
              </p>
              <p>
                <strong className="text-slate-200">
                  The TCP/IP-equivalent for cooperative AI discipline.
                </strong>{" "}
                TCP/IP doesn't know whether it's routing one packet in a room or 10^18 packets across
                the global Internet. The Sphinx architecture doesn't know whether it's enforcing one
                rule for one person or coordinating governance across 12 Bands and millions of members.
                Same primitive at every scale.
              </p>
              <p>
                The four-register fit of the Sphinx name: (1) Riddle-asker AND oracle — it audits
                and answers. (2) Composed-of-primitives — a hybrid (lion + human + bird) mirroring
                Augur + Wing + NAF + MAJCOM + Ring. (3) Guardian of sacred knowledge — guards member
                sovereignty and cooperative patent infrastructure. (4) Mysterious but verifiable —
                member substrate stays private while aggregate signals federate transparently.
              </p>
            </div>
          </div>
        </section>

        {/* Architecture Tiers */}
        <section id="architecture" className="py-16 px-6 bg-[#0d0f1a]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-3">The Eight Tiers (First Eight of ∞)</h2>
            <p className="text-slate-400 mb-10 text-sm">
              Non-limiting examples of the unbounded recursive composition primitive (A&A #2295 Claim 12).
              Phase 1 lands Tier 5.
            </p>
            <div className="space-y-2">
              {SPHINX_TIERS.map((t) => (
                <div
                  key={t.tier}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition ${
                    t.current
                      ? "bg-[#1a1060] border-purple-700"
                      : t.shipped
                      ? "bg-[#11141f] border-slate-700"
                      : "bg-[#0d0f1a] border-slate-800 opacity-60"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      t.current
                        ? "bg-purple-700 text-white"
                        : t.shipped
                        ? "bg-slate-700 text-slate-300"
                        : "bg-slate-800 text-slate-600"
                    }`}
                  >
                    {t.level}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{t.tier}</span>
                      {t.current && (
                        <span className="bg-purple-700 text-purple-100 rounded-full px-2 py-0.5 text-xs font-bold">
                          K520 Phase 1 ✓
                        </span>
                      )}
                      {t.shipped && !t.current && (
                        <span className="bg-green-900 text-green-300 rounded-full px-2 py-0.5 text-xs font-semibold">
                          LIVE
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-400">{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Governance: Enumerated Powers */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6">Governance: Enumerated Powers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#11141f] border border-slate-700 rounded-xl p-6">
                <h3 className="font-bold text-green-400 mb-3">✓ What MAJCOM CAN do</h3>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li>• Promote rules to MAJCOM-default status (opt-in by NAFs and Wings)</li>
                  <li>• Enforce Structural Bylaws (cooperative constitution)</li>
                  <li>• Emergency authority: SHUT IT DOWN when critical-class violations cascade</li>
                  <li>• Host Cooperative Defensive Patent Pledge (#2260) governance</li>
                  <li>• Aggregate signals across NAFs for platform-wide drift detection</li>
                </ul>
              </div>
              <div className="bg-[#11141f] border border-slate-700 rounded-xl p-6">
                <h3 className="font-bold text-red-400 mb-3">✗ What MAJCOM CANNOT do</h3>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li>• Read member substrate content (only aggregate signals)</li>
                  <li>• Modify NAF rules without NAF consent</li>
                  <li>• Force Wings to install MAJCOM-default rules</li>
                  <li>• Override member sovereignty at the Wing tier</li>
                  <li>• Access member identity from aggregate signals</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 bg-[#0a0d13] border border-slate-800 rounded-xl p-6 text-sm text-slate-400 leading-relaxed">
              <strong className="text-slate-200">Structural Bylaws (MAJCOM-LB, Phase 1):</strong>
              <ul className="mt-3 space-y-2">
                <li>• <strong className="text-slate-300">SB-001:</strong> Membership = $5/yr, identical for the first member and the five-millionth. Cannot be changed without constitutional amendment.</li>
                <li>• <strong className="text-slate-300">SB-002:</strong> Creator keep = 83.3% (never rounded to 83%). Platform margin = Cost+20%.</li>
                <li>• <strong className="text-slate-300">SB-003:</strong> One-level attribution only — no MLM structures.</li>
                <li>• <strong className="text-slate-300">SB-004:</strong> Cooperative Defensive Patent Pledge — all innovations free to nonprofits, cooperatives, academic institutions via EIN.</li>
                <li>• <strong className="text-slate-300">SB-005:</strong> MAJCOM cannot read member substrate content — only aggregate signals.</li>
                <li>• <strong className="text-slate-300">SB-006:</strong> MAJCOM cannot modify NAF rules without NAF consent.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Founding Partners */}
        <section id="founding-partners" className="py-16 px-6 bg-[#0d0f1a]">
          <div className="max-w-4xl mx-auto">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-white mb-3">Become a Founding Partner</h2>
              <p className="text-slate-400 max-w-2xl">
                Band-NA is recruiting founding partners — the first stewards of the Sphinx federation
                in North America. Founding partners receive free perpetual access to all A&A #2295
                architecture under the Cooperative Defensive Patent Pledge (#2260).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {FOUNDING_PARTNER_TYPES.map((pt) => (
                <div
                  key={pt.type}
                  className="bg-[#11141f] border border-slate-700 rounded-xl p-6 flex flex-col"
                >
                  <div className="text-3xl mb-3">{pt.icon}</div>
                  <h3 className="font-bold text-white text-lg mb-2">{pt.type}</h3>
                  <p className="text-slate-400 text-sm mb-4 flex-1">{pt.description}</p>
                  <div className="text-xs text-slate-500 mb-2">Examples: {pt.examples}</div>
                  <ul className="text-xs text-slate-500 mb-4 space-y-1">
                    {pt.requirements.map((r) => (
                      <li key={r}>✓ {r}</li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleApply(pt.type)}
                    className="w-full bg-purple-800 hover:bg-purple-700 text-purple-100 font-semibold py-2 rounded-lg text-sm transition"
                  >
                    {pt.cta}
                  </button>
                </div>
              ))}
            </div>

            {/* Application Form */}
            <div id="apply" className="bg-[#11141f] border border-purple-900 rounded-xl p-8">
              <h3 className="font-bold text-white text-xl mb-2">
                Apply — Cooperative Defensive Patent Pledge (#2260)
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                {activePartnerType
                  ? `Applying as: ${activePartnerType}`
                  : "Select a partner type above, or fill out directly."}
              </p>

              {submitStatus.success ? (
                <div className="bg-green-900/30 border border-green-700 rounded-xl p-6 text-center">
                  <div className="text-green-400 text-2xl mb-2">✓</div>
                  <div className="text-green-300 font-semibold mb-1">Application Submitted</div>
                  <div className="text-slate-400 text-sm">{submitStatus.message}</div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Organization Name *</label>
                      <input
                        type="text"
                        required
                        value={form.org_name}
                        onChange={(e) => setForm((f) => ({ ...f, org_name: e.target.value }))}
                        className="w-full bg-[#0d0f1a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-600"
                        placeholder="Platform Cooperativism Consortium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">EIN (or international equivalent) *</label>
                      <input
                        type="text"
                        required
                        value={form.ein}
                        onChange={(e) => setForm((f) => ({ ...f, ein: e.target.value }))}
                        className="w-full bg-[#0d0f1a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-600"
                        placeholder="XX-XXXXXXX"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Organization Type *</label>
                      <select
                        required
                        value={form.org_type}
                        onChange={(e) => setForm((f) => ({ ...f, org_type: e.target.value }))}
                        className="w-full bg-[#0d0f1a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-600"
                      >
                        <option value="">Select type...</option>
                        <option value="academic">Academic Institution</option>
                        <option value="cooperative">Cooperative</option>
                        <option value="nonprofit">Nonprofit</option>
                        <option value="research">Research Institution</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Contact Email</label>
                      <input
                        type="email"
                        value={form.contact}
                        onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                        className="w-full bg-[#0d0f1a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-600"
                        placeholder="contact@yourorg.org"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Why join Sphinx as a founding partner?
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      rows={4}
                      className="w-full bg-[#0d0f1a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-600 resize-none"
                      placeholder="Briefly describe your organization and why cooperative AI discipline architecture matters to your mission..."
                    />
                  </div>

                  {submitStatus.error && (
                    <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-red-300 text-sm">
                      {submitStatus.error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitStatus.loading}
                    className="w-full bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition"
                  >
                    {submitStatus.loading ? "Submitting..." : "Submit Pledge Application"}
                  </button>

                  <p className="text-xs text-slate-500 text-center">
                    Applications are reviewed by Founder. Verified partners receive free perpetual access
                    to A&A #2295 architecture and Sphinx Band-NA founding partner status.
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Patent / IP */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6">Patent & IP Posture</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#11141f] border border-slate-700 rounded-xl p-6">
                <h3 className="font-bold text-slate-200 mb-3 text-sm uppercase tracking-wide">Architecture Patented</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  A&A #2295 (Recursive Scale-Invariant Federated Discipline-Enforcement Plane for
                  Cooperative AI Substrates) is filed with priority date 2026-04-26. Covers the
                  scale-invariant recursive composition primitive at all tiers from Augur to Solar-Scale.
                </p>
              </div>
              <div className="bg-[#11141f] border border-slate-700 rounded-xl p-6">
                <h3 className="font-bold text-slate-200 mb-3 text-sm uppercase tracking-wide">Cooperative Pledge</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  A&A #2260 — Cooperative Defensive Patent Pledge. Every innovation is filed under
                  mutual protection. Nonprofits, cooperatives, and academic institutions get the
                  architecture <strong className="text-slate-200">free forever</strong> via EIN verification.
                  Commercial vendors: Tiered Vendor Adoption Framework (#2293).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-slate-800 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="text-2xl mb-2">🗿</div>
            <div className="text-slate-400 text-sm">
              The Sphinx Project — Phase 1 Operational — Band-NA — 2026-04-26
            </div>
            <div className="text-slate-600 text-xs mt-2">
              Liana Banyan Corporation · EIN 41-2797446 · Wyoming C-Corp ·{" "}
              <a href="https://lianabanyan.com" className="hover:text-slate-400 transition">
                lianabanyan.com
              </a>
            </div>
            <div className="mt-4 text-slate-600 text-xs italic">
              "The cooperative becomes the cooperative-AI federation. Long haul. Always."
            </div>
          </div>
        </footer>
    </div>
  );
}
