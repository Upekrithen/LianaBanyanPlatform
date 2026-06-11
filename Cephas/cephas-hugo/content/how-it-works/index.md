---
title: "How MnemosyneC Works"
slug: "how-it-works"
date: 2026-06-10
draft: false
class: "member-facing · how-to-hub · mnemosynec · bp079"
composing_hints: ["mnemosyne", "cai", "local-ai", "cooperative", "how-to"]
description: "Private local AI on your machine. No cloud. No API keys. Yours."
tldr: "MnemosyneC runs entirely on your hardware. No cloud, no API keys, no subscription required to start. A free local AI model, a private memory substrate, and cooperative economics that work for you."
---

<style>
.mn-hiw-page {
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  color: #faf5eb;
  line-height: 1.75;
  max-width: 760px;
  margin: 0 auto;
  padding: 0 1.2rem 4rem;
}
.mn-hiw-page h2 {
  color: #d69e2e;
  font-size: clamp(1.15rem, 3vw, 1.5rem);
  font-weight: 800;
  margin: 2.2rem 0 0.6rem;
  letter-spacing: -0.01em;
  border-bottom: 1px solid rgba(214,158,46,0.18);
  padding-bottom: 0.35rem;
}
.mn-hiw-page h3 {
  color: #faf5eb;
  font-size: 1rem;
  font-weight: 700;
  margin: 1.4rem 0 0.4rem;
}
.mn-hiw-page p {
  color: rgba(250,245,235,0.85);
  margin: 0.5rem 0 1rem;
}
.mn-hiw-page a {
  color: #d69e2e;
  text-decoration: none;
  border-bottom: 1px solid rgba(214,158,46,0.35);
}
.mn-hiw-page a:hover { border-bottom-color: #d69e2e; }
.mn-hiw-page strong { color: #faf5eb; }
.mn-hiw-page ol, .mn-hiw-page ul {
  padding-left: 1.5rem;
  color: rgba(250,245,235,0.82);
  margin: 0.4rem 0 1rem;
}
.mn-hiw-page li { margin-bottom: 0.4rem; }

.mn-hiw-hero {
  background: linear-gradient(135deg, rgba(10,22,40,0.97) 0%, rgba(5,14,30,0.99) 100%);
  border: 1px solid rgba(214,158,46,0.35);
  border-radius: 14px;
  padding: 2.4rem 2rem 2rem;
  margin: 1.6rem 0 2rem;
  box-shadow: 0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(214,158,46,0.12);
  position: relative;
  overflow: hidden;
}
.mn-hiw-hero::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, rgba(214,158,46,0.6), transparent);
}
.mn-hiw-hero h1 {
  color: #faf5eb;
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 800;
  line-height: 1.2;
  margin: 0 0 0.9rem;
  letter-spacing: -0.02em;
}
.mn-hiw-hero p {
  color: rgba(250,245,235,0.82);
  font-size: clamp(0.92rem, 2.2vw, 1.05rem);
  margin: 0;
  line-height: 1.75;
}
.mn-hiw-hero-tagline {
  margin-top: 1.2rem !important;
  font-size: 0.86rem !important;
  color: rgba(250,245,235,0.5) !important;
  letter-spacing: 0.03em;
}

.mn-hiw-card {
  background: rgba(5,11,20,0.7);
  border: 1px solid rgba(214,158,46,0.2);
  border-radius: 12px;
  padding: 1.6rem 1.8rem;
  margin: 1.6rem 0;
}
.mn-hiw-card h2 {
  margin-top: 0 !important;
  border-bottom: none !important;
  padding-bottom: 0 !important;
}

.mn-hiw-steps {
  counter-reset: steps;
  list-style: none;
  padding-left: 0 !important;
}
.mn-hiw-steps li {
  counter-increment: steps;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.8rem 0;
  border-bottom: 1px solid rgba(214,158,46,0.08);
}
.mn-hiw-steps li:last-child { border-bottom: none; }
.mn-hiw-steps li::before {
  content: counter(steps);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  min-width: 28px;
  background: rgba(214,158,46,0.15);
  border: 1px solid rgba(214,158,46,0.4);
  border-radius: 50%;
  color: #d69e2e;
  font-weight: 800;
  font-size: 0.82rem;
  margin-top: 0.1rem;
}

.mn-hiw-coop-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.9rem;
  margin: 1rem 0;
}
.mn-hiw-coop-item {
  background: rgba(10,22,40,0.85);
  border: 1px solid rgba(214,158,46,0.22);
  border-radius: 10px;
  padding: 1rem 1.2rem;
}
.mn-hiw-coop-item__label {
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #d69e2e;
  font-weight: 700;
  margin: 0 0 0.3rem;
}
.mn-hiw-coop-item__value {
  font-size: 1.1rem;
  font-weight: 800;
  color: #faf5eb;
  margin: 0 0 0.25rem;
}
.mn-hiw-coop-item__note {
  font-size: 0.8rem;
  color: rgba(250,245,235,0.58);
  margin: 0;
  line-height: 1.5;
}

.mn-hiw-cta-block {
  text-align: center;
  margin: 2.5rem 0 1rem;
}
.mn-hiw-dl-btn {
  display: inline-block;
  background: #38a169;
  color: #fff !important;
  border: 2px solid #38a169 !important;
  border-bottom: 2px solid #38a169 !important;
  border-radius: 12px;
  padding: 0.9rem 2.2rem;
  font-size: clamp(0.95rem, 2.5vw, 1.15rem);
  font-weight: 800;
  text-decoration: none !important;
  box-shadow: 0 6px 24px rgba(56,161,105,0.35);
  letter-spacing: 0.01em;
  transition: transform 0.15s ease, box-shadow 0.2s ease;
}
.mn-hiw-dl-btn:hover {
  background: #2f8a59 !important;
  border-color: #2f8a59 !important;
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(56,161,105,0.5);
}
.mn-hiw-footer-note {
  font-size: 0.78rem;
  color: rgba(250,245,235,0.4);
  margin-top: 0.7rem;
  font-style: italic;
}
</style>

<div class="mn-hiw-page">

<div class="mn-hiw-hero">
  <h1>How MnemosyneC Works</h1>
  <p>Private local AI on your machine. No cloud. No API keys. No subscription required to start. The AI runs on your hardware — your questions never leave your computer.</p>
  <p class="mn-hiw-hero-tagline">Free Forever &nbsp;&middot;&nbsp; No Ads &nbsp;&middot;&nbsp; No Cloud &nbsp;&middot;&nbsp; Your Data Stays on Your Machine</p>
</div>

<div class="mn-hiw-card">

## Install in minutes

Download the MnemosyneC installer from <a href="https://mnemosynec.ai">mnemosynec.ai</a> and run it (~456 MB). On first launch, MnemosyneC sets up a local AI engine — a free, open-source model running entirely via <a href="https://ollama.ai" target="_blank" rel="noopener">Ollama</a> (MIT-licensed). One-time setup. No API keys. No cloud account. No subscription required to get started.

Want the best local model? Upgrade to Google Gemma 4 12B inside the app — free, MIT-licensed, ~7 GB one-time download, pulled via Ollama.

</div>

<div class="mn-hiw-card">

## Your first session

<ol class="mn-hiw-steps">
  <li><strong>Cover screen</strong> &mdash; select &ldquo;Just use it&rdquo; for immediate access, or walk through the full setup to configure your workspace and cooperative membership.</li>
  <li><strong>Ask anything</strong> &mdash; MnemosyneC runs entirely on your hardware. Your questions never leave your machine. No internet required after installation.</li>
  <li><strong>Add your files</strong> &mdash; optionally point MnemosyneC to a folder you want to remember. Read-only: your original files are never modified or uploaded. Ever.</li>
  <li><strong>Connect to the mesh</strong> &mdash; optional but powerful. Your node joins a cooperative knowledge network. 20 nodes tested at <strong>16.6 ms p50</strong> (BP067, hash-verified). Only what you choose to share, shares.</li>
</ol>

</div>

<div class="mn-hiw-card">

## Local AI: how it actually works

MnemosyneC uses <a href="https://ollama.ai" target="_blank" rel="noopener">Ollama</a> (MIT-licensed, open-source, by Jeffrey Morgan and Michael Chiang / Y Combinator) to run AI models directly on your CPU or GPU. The model weights live on your disk. Inference runs locally. Zero tokens are sent to any external server.

The design philosophy is **&ldquo;interest-knowledge, not intelligence&rdquo;** — MnemosyneC is the substrate that remembers your context, your notes, and your workspace structure. The local AI provides the reasoning layer. Together, you get a personalized AI assistant that learns your world without ever handing that world to a cloud provider.

**The benchmark proof:** a free, local Ollama model goes from **6% to 78% accuracy** with the MnemosyneC substrate applied &mdash; a +72 percentage point gain (Cohen&rsquo;s κ 0.936, BP065, hash-verified). That&rsquo;s not marketing. You can <a href="/prove-it/">run the test yourself</a>.

</div>

<div class="mn-hiw-card">

## Cooperative class: built different

MnemosyneC is built on the Liana Banyan cooperative platform. These aren&rsquo;t marketing promises &mdash; they&rsquo;re structural commitments locked into the corporate bylaws.

<div class="mn-hiw-coop-row">
  <div class="mn-hiw-coop-item">
    <p class="mn-hiw-coop-item__label">Creator Revenue Share</p>
    <p class="mn-hiw-coop-item__value">83.3%</p>
    <p class="mn-hiw-coop-item__note">Workers, Builders, and Creators keep this — never rounded to 83%, never less.</p>
  </div>
  <div class="mn-hiw-coop-item">
    <p class="mn-hiw-coop-item__label">Platform Margin</p>
    <p class="mn-hiw-coop-item__value">Cost + 20%</p>
    <p class="mn-hiw-coop-item__note">Immutable. No extraction. No advertising.</p>
  </div>
  <div class="mn-hiw-coop-item">
    <p class="mn-hiw-coop-item__label">Membership</p>
    <p class="mn-hiw-coop-item__value">$5 / year</p>
    <p class="mn-hiw-coop-item__note">The cost of a cup of coffee. The stake of an owner.</p>
  </div>
  <div class="mn-hiw-coop-item">
    <p class="mn-hiw-coop-item__label">Sunset Clause</p>
    <p class="mn-hiw-coop-item__value">50 years</p>
    <p class="mn-hiw-coop-item__note">At year 50, the corporation dissolves. The cooperative commons inherits everything.</p>
  </div>
</div>

No advertising. No venture capital. No surveillance. Cooperative-AI is structural defense against hostile capture. When you use MnemosyneC, you&rsquo;re not a user — you&rsquo;re a member of a system designed to serve you, not harvest you.

</div>

<div class="mn-hiw-card">

## License: free forever

MnemosyneC ships under **SSPL v1** (Server Side Public License) + **Cooperative Defensive Patent Pledge #2260**. That means:

- **Run it.** No account, no subscription, no permission needed.
- **Modify it.** Source is auditable. Fork it for your community.
- **Self-host it.** Any cooperative can run their own.
- **The pledge is irrevocable.** No future board, acquirer, or successor can weaponize these patents against cooperative-class users.

21 USPTO provisional patent filings protect the commons &mdash; not to fence it, but to ensure no one else can.

</div>

## Prove it

Skeptical? Good.

- <a href="/prove-it/">Run the Prove It! test yourself &rarr;</a> &mdash; component-by-component verification, no LLM required
- <a href="/proofs/">View all empirical receipts &rarr;</a> &mdash; timestamped, hash-verified
- <a href="/run-your-own-cabinet/">K533 Reproducibility Pack &rarr;</a> &mdash; run the full benchmark on your machine
- Check the network traffic. It&rsquo;s empty. The proof is on your machine.

<div class="mn-hiw-cta-block">
  <a class="mn-hiw-dl-btn" href="https://mnemosynec.ai">&#8595;&nbsp; Download MnemosyneC Free &rarr;</a>
  <p class="mn-hiw-footer-note">Free Forever &nbsp;&middot;&nbsp; SSPL + Pledge #2260 &nbsp;&middot;&nbsp; No account required &nbsp;&middot;&nbsp; All data stays on your computer</p>
</div>

</div>

*Not charity. A way out. Everyone gets their shot.*

*SSPL Free Forever · Pledge #2260 · BP079 · MnemosyneC*
