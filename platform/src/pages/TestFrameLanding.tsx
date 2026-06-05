/**
 * LB TEST FRAME — Distribution Landing Page (Phase A.4, K502)
 * =============================================================
 * Lives at lb-test-frame.lianabanyan.com (or librarian.the2ndsecond.com/test-frame)
 *
 * One-line value prop: "Verify the Caithedral Effect on your own AI"
 * Downloads: Mac / Windows / Linux / Chrome Extension
 */

import React, { useState } from "react";

const DOWNLOAD_LINKS = {
  mac:       "https://releases.lianabanyan.com/test-frame/latest/LBTestFrame-mac.dmg",
  windows:   "https://releases.lianabanyan.com/test-frame/latest/LBTestFrame-windows.msi",
  linux_deb: "https://releases.lianabanyan.com/test-frame/latest/LBTestFrame.deb",
  linux_rpm: "https://releases.lianabanyan.com/test-frame/latest/LBTestFrame.rpm",
  chrome:    "https://chrome.google.com/webstore/detail/lb-test-frame/PENDING_REVIEW",
};

const FAQ = [
  { q: "Do I need an API key?", a: "No. The Casual and Member personas work entirely through your existing browser AI sessions. No API key, no terminal commands." },
  { q: "Does this cost anything?", a: "The extension and Casual mode are free. Developer mode uses your own API keys (your API costs apply). Membership is $5/year and unlocks the full Liana Banyan platform." },
  { q: "Will this access my AI conversations?", a: "No. LB Test Frame only reads the question you're about to send and offers to wrap it with LB context. Your AI chat history is never read, stored, or transmitted to LB." },
  { q: "Which AIs does it support?", a: "Claude (Anthropic), ChatGPT (OpenAI), Gemini (Google), Perplexity, and Copilot (Microsoft). The desktop version also supports API-key integration for the same vendors plus Mistral." },
  { q: "What is the Caithedral Effect?", a: "It's the measured improvement in AI accuracy when Liana Banyan's knowledge substrate (the 'cathedral') is pre-injected into AI sessions. Our research found a mean +86 percentage point lift. The Test Frame lets you verify this on your own AI session." },
  { q: "What happens to my verification results?", a: "You choose: private (stays on your machine), anonymous (aggregated to the community dashboard without any identifier), or public (with your name). Default is private." },
  { q: "What is substrate-savings telemetry?", a: "K506 adds automatic tracking of how much the LB substrate reduces your AI costs. Each query you run measures estimated token counts with- and without-substrate. You always see your own savings in the Test Frame popup — sharing with LB is opt-in only." },
  { q: "Can I delete my telemetry data?", a: "Yes, always. Go to Settings → Privacy & Telemetry → Delete all my data. LB complies within 24 hours and confirms in writing. No dark patterns, no retention games." },
];

function OSButton({ os, icon, label, href }: { os: string; icon: string; label: string; href: string }) {
  const [clicked, setClicked] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => setClicked(true)}
      className={`flex items-center gap-3 px-5 py-3 rounded-xl border font-medium text-sm transition-all ${
        clicked
          ? "border-green-500 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300"
          : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <div>
        <div className="font-semibold">{label}</div>
        <div className="text-xs text-slate-400">{clicked ? "Downloading…" : "Free download"}</div>
      </div>
    </a>
  );
}

export default function TestFrameLanding() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-700/30 rounded-full px-4 py-1.5 mb-8">
          <span className="text-blue-400 text-sm">Liana Banyan Platform</span>
        </div>

        <h1 className="text-5xl font-bold mb-4 leading-tight">
          LB Test Frame
        </h1>
        <p className="text-xl text-blue-300 font-medium mb-4">
          Verify the Caithedral Effect on your own AI
        </p>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
          Works with Claude, ChatGPT, Gemini, Perplexity, and Copilot —
          using your existing accounts. No API key. No terminal commands.
          Install in one click.
        </p>

        {/* Download buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto mb-16">
          <OSButton os="mac" icon="🍎" label="Download for Mac" href={DOWNLOAD_LINKS.mac} />
          <OSButton os="windows" icon="🪟" label="Download for Windows" href={DOWNLOAD_LINKS.windows} />
          <OSButton os="chrome" icon="🌐" label="Chrome Extension" href={DOWNLOAD_LINKS.chrome} />
          <OSButton os="linux_deb" icon="🐧" label="Linux .deb" href={DOWNLOAD_LINKS.linux_deb} />
          <OSButton os="linux_rpm" icon="🐧" label="Linux .rpm" href={DOWNLOAD_LINKS.linux_rpm} />
          <a
            href="https://librarian.the2ndsecond.com/community-empirical"
            className="flex items-center gap-3 px-5 py-3 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-400 hover:text-slate-300 font-medium text-sm transition-all"
          >
            <span className="text-2xl">📊</span>
            <div>
              <div className="font-semibold">Community results</div>
              <div className="text-xs">See what others found</div>
            </div>
          </a>
        </div>

        {/* Three-step how it works */}
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-20">
          {[
            { n: "1", title: "Install", desc: "One click. No developer mode, no terminal. Works with your existing browser AI sessions." },
            { n: "2", title: "Pick your AI", desc: "We detect which AI you're logged into. Select it as your primary — LB Test Frame works alongside it." },
            { n: "3", title: "Run the 25-question demo", desc: "We ask each question twice — once cold, once with LB context. You paste your AI's answers. We measure the lift." },
          ].map((step) => (
            <div key={step.n} className="text-left bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
              <div className="text-3xl font-bold text-blue-500 mb-3">{step.n}.</div>
              <div className="text-white font-semibold mb-2">{step.title}</div>
              <div className="text-slate-400 text-sm leading-relaxed">{step.desc}</div>
            </div>
          ))}
        </div>

        {/* Persona breakdown */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-2xl font-bold mb-6">One installer, three modes</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: "🌿", name: "Casual", price: "Free", desc: "Verify the Caithedral Effect and use LB-amplified browsing. No API keys, no setup." },
              { icon: "⚡", name: "Developer", price: "Your API costs", desc: "Full benchmark reproducibility harness. API key management. R13/R14 results export as JSONL." },
              { icon: "🏛", name: "Member", price: "$5/year", desc: "The whole Liana Banyan platform unlocks — Helm, Marks, Trust Match, Six Sparks, Furnace badges." },
            ].map((p) => (
              <div key={p.name} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
                <div className="text-3xl mb-3">{p.icon}</div>
                <div className="flex items-baseline gap-2 mb-2">
                  <div className="text-white font-semibold">{p.name}</div>
                  <div className="text-xs text-slate-500">{p.price}</div>
                </div>
                <div className="text-slate-400 text-sm leading-relaxed">{p.desc}</div>
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-sm mt-4">
            Switch between modes anytime in Settings. Same installer, same data — no re-installation needed.
          </p>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-16 text-left">
          <h2 className="text-2xl font-bold mb-6 text-center">FAQ</h2>
          {FAQ.map((item, i) => (
            <div key={i} className="border-b border-slate-800 last:border-0">
              <button
                className="w-full text-left py-4 flex items-center justify-between gap-4"
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
              >
                <span className="text-slate-200 font-medium">{item.q}</span>
                <span className="text-slate-500 flex-shrink-0">{faqOpen === i ? "▲" : "▼"}</span>
              </button>
              {faqOpen === i && (
                <p className="text-slate-400 text-sm pb-4 leading-relaxed">{item.a}</p>
              )}
            </div>
          ))}
        </div>

        {/* K506 Privacy & Telemetry panel */}
        <div className="max-w-2xl mx-auto mb-16 text-left bg-slate-800/30 border border-slate-700/40 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl">🔒</span>
            <h2 className="text-xl font-bold">Privacy &amp; Telemetry</h2>
          </div>

          <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  icon: "📍",
                  title: "Logged locally — always",
                  desc: "Every query you run logs estimated savings data on your own machine. No network required. You see your personal savings dashboard regardless of sharing preference.",
                },
                {
                  icon: "🔗",
                  title: "Shared with LB — opt-in only",
                  desc: "Your data reaches LB servers only if you flip the opt-in-share toggle in Settings. Default is OFF. You can flip it back at any time.",
                },
                {
                  icon: "🏷",
                  title: "Estimated vs. measured",
                  desc: "Token counts are estimated from query size unless your AI vendor API returns exact counts. Every record is labeled: estimated: true or measured: true. We never mix the two in aggregate stats.",
                },
                {
                  icon: "🗑",
                  title: "Right to deletion",
                  desc: "Settings → Privacy & Telemetry → Delete all my data. LB complies within 24 hours. Deletion covers both local and server records if you had opt-in-share enabled.",
                },
              ].map((item) => (
                <div key={item.title} className="bg-slate-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-semibold text-white text-sm">{item.title}</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-700/50 pt-4 text-xs text-slate-500">
              Telemetry schema: <code className="text-slate-400 bg-slate-900 px-1 rounded">query_input_tokens, query_output_tokens, substrate_injection_tokens, cold_baseline_estimated_tokens, member_friction_confirmations, savings_estimated</code>.
              Members who opt-in contribute to the public aggregate at{" "}
              <a href="https://librarian.the2ndsecond.com/community-empirical" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                librarian.the2ndsecond.com/community-empirical
              </a>.
              Population-scale empirical basis for the Caithedral Effect public-policy claim — as of K506.
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div>
          <p className="text-slate-500 text-sm mb-2">
            LB Test Frame is the member-facing entry point to the Liana Banyan platform.
          </p>
          <a href="https://lianabanyan.com" className="text-blue-400 text-sm hover:underline">
            Learn more about Liana Banyan →
          </a>
        </div>
      </div>
    </div>
  );
}
