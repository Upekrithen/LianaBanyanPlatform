---
title: "MnemosyneC UI Demo — Visual Reference"
slug: "demo"
date: 2026-06-09
draft: false
class: "pawn-ux-reference · demo · v0.1.33 · SEG-Q-6-BP078"
tldr: "Non-interactive visual reference for MnemosyneC v0.1.33 UI shell. For Pawn UX evaluation. No real AI, no state, no data."
---

# MnemosyneC UI Demo
## Visual Reference for UX Evaluation · v0.1.33

**Non-interactive. No real AI. No state. No data.**
This page exists for Pawn (UX evaluator) to understand the full UI shell without running the Electron app.

---

<style>
.demo-shell {
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 10px;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  max-width: 680px;
  margin: 24px auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}
.demo-titlebar {
  background: #0a0f1a;
  padding: 8px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #1e293b;
}
.demo-titlebar .title-text {
  color: #64748b;
  font-size: 11px;
  flex: 1;
}
.demo-header {
  background: #0f172a;
  padding: 12px 16px 0;
  border-bottom: 1px solid #1e293b;
}
.demo-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.demo-app-name {
  font-size: 13px;
  font-weight: 700;
  color: #e2e8f0;
}
.demo-tagline {
  font-size: 9px;
  color: #475569;
}
.demo-header-pills {
  display: flex;
  gap: 6px;
  align-items: center;
}
.demo-pill {
  background: rgba(110,231,183,0.1);
  border: 1px solid rgba(110,231,183,0.25);
  border-radius: 20px;
  color: #6ee7b7;
  font-size: 9px;
  padding: 3px 8px;
  cursor: default;
}
.demo-pill.secondary {
  background: rgba(100,116,139,0.1);
  border-color: rgba(100,116,139,0.2);
  color: #94a3b8;
}
.demo-nav {
  display: flex;
  gap: 0;
  overflow-x: auto;
}
.demo-tab {
  padding: 8px 14px;
  font-size: 11px;
  color: #64748b;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  cursor: default;
}
.demo-tab.active {
  color: #6ee7b7;
  border-bottom-color: #6ee7b7;
}
.demo-body {
  padding: 16px;
  min-height: 200px;
}
.demo-section-header {
  font-size: 10px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 16px 0 8px;
}
.demo-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
}
.demo-label {
  font-size: 11px;
  font-weight: 600;
  color: #cbd5e1;
  margin-bottom: 2px;
}
.demo-value {
  font-size: 10px;
  color: #64748b;
}
.demo-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.demo-chip {
  background: rgba(100,116,139,0.08);
  border: 1px solid rgba(100,116,139,0.2);
  border-radius: 6px;
  color: #64748b;
  font-size: 10px;
  padding: 3px 8px;
  cursor: default;
}
.demo-chip.on {
  background: rgba(110,231,183,0.1);
  border-color: rgba(110,231,183,0.3);
  color: #6ee7b7;
}
.demo-note {
  font-size: 9px;
  color: #334155;
  margin-top: 24px;
  text-align: center;
  font-style: italic;
}
.tab-section { margin-bottom: 48px; }
.tab-label {
  font-size: 13px;
  font-weight: 700;
  color: #6ee7b7;
  border-bottom: 1px solid #1e293b;
  padding-bottom: 6px;
  margin-bottom: 16px;
}
.annotation {
  background: rgba(251,191,36,0.07);
  border: 1px solid rgba(251,191,36,0.2);
  border-radius: 6px;
  color: #fbbf24;
  font-size: 10px;
  padding: 6px 10px;
  margin: 8px 0;
}
</style>

---

## Tab 1 — Frame (Home)

<div class="tab-section">
<div class="annotation">Frame tab = the substrate / AI answer view. Primary interaction surface for asking questions.</div>
<div class="demo-shell">
  <div class="demo-titlebar">
    <span style="color:#334155;font-size:10px;">🐘</span>
    <span class="title-text">MnemosyneC v0.1.33</span>
    <span style="color:#334155;font-size:10px;">— ✕</span>
  </div>
  <div class="demo-header">
    <div class="demo-header-top">
      <div>
        <div class="demo-app-name">MnemosyneC</div>
        <div class="demo-tagline">Caithedral · Liana Banyan</div>
      </div>
      <div class="demo-header-pills">
        <span class="demo-pill">Get FULL AI Free</span>
        <span class="demo-pill secondary">Check for Updates</span>
        <span style="color:#334155;font-size:11px;cursor:default;">✕</span>
      </div>
    </div>
    <div class="demo-nav">
      <div class="demo-tab active">Frame</div>
      <div class="demo-tab">AI</div>
      <div class="demo-tab">FAQ</div>
      <div class="demo-tab">Kitchen Table</div>
      <div class="demo-tab">$ LB Account</div>
      <div class="demo-tab">More ▾</div>
      <div class="demo-tab" style="margin-left:auto">⚙</div>
    </div>
  </div>
  <div class="demo-body">
    <div class="demo-card" style="border-color:rgba(110,231,183,0.15)">
      <div style="font-size:10px;color:#94a3b8;margin-bottom:8px;">Ask anything. Substrate answers first, AI second.</div>
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:8px;color:#475569;font-size:10px;">Type your question here...</div>
    </div>
    <div class="demo-card">
      <div class="demo-label">Last answer</div>
      <div class="demo-value">No conversation yet. Ask something above.</div>
    </div>
    <div class="demo-note">Frame tab = substrate query + AI answer display. No data in this demo.</div>
  </div>
</div>
</div>

---

## Tab 2 — AI (Model Status)

<div class="tab-section">
<div class="annotation">AI tab = shows which model is running, tier status, and the upgrade path.</div>
<div class="demo-shell">
  <div class="demo-titlebar">
    <span style="color:#334155;font-size:10px;">🐘</span>
    <span class="title-text">MnemosyneC v0.1.33</span>
  </div>
  <div class="demo-header">
    <div class="demo-nav">
      <div class="demo-tab">Frame</div>
      <div class="demo-tab active">AI</div>
      <div class="demo-tab">FAQ</div>
      <div class="demo-tab">Kitchen Table</div>
      <div class="demo-tab">$ LB Account</div>
    </div>
  </div>
  <div class="demo-body">
    <div class="demo-section-header">Current AI</div>
    <div class="demo-card">
      <div class="demo-row">
        <div>
          <div class="demo-label">Active model</div>
          <div class="demo-value">qwen2.5:0.5b (NANO — bundled, always available)</div>
        </div>
        <span class="demo-chip on">Running</span>
      </div>
    </div>
    <div class="demo-section-header">Upgrade Path</div>
    <div class="demo-card">
      <div class="demo-label">Get FULL AI Free</div>
      <div class="demo-value" style="margin-bottom:8px;">Gemma 4 12B — ~8 GB download. Runs fully offline on your machine. Free forever.</div>
      <span class="demo-chip" style="color:#6ee7b7;border-color:rgba(110,231,183,0.3);">Download Gemma 4 12B</span>
    </div>
    <div class="demo-note">AI tab = model status + upgrade. No real model data in this demo.</div>
  </div>
</div>
</div>

---

## Tab 3 — FAQ

<div class="tab-section">
<div class="annotation">FAQ tab = answers common questions about what MnemosyneC is and how it works. Key orientation surface for new users.</div>
<div class="demo-shell">
  <div class="demo-titlebar">
    <span style="color:#334155;font-size:10px;">🐘</span>
    <span class="title-text">MnemosyneC v0.1.33</span>
  </div>
  <div class="demo-header">
    <div class="demo-nav">
      <div class="demo-tab">Frame</div>
      <div class="demo-tab">AI</div>
      <div class="demo-tab active">FAQ</div>
      <div class="demo-tab">Kitchen Table</div>
      <div class="demo-tab">$ LB Account</div>
    </div>
  </div>
  <div class="demo-body">
    <div class="demo-card" style="margin-bottom:6px;">
      <div class="demo-label">What is MnemosyneC?</div>
      <div class="demo-value">A local AI memory tool. Runs entirely on your machine. No cloud account required. Your data never leaves your computer.</div>
    </div>
    <div class="demo-card" style="margin-bottom:6px;">
      <div class="demo-label">Does it cost anything?</div>
      <div class="demo-value">The app is free forever (SSPL + Pledge #2260). Cooperative membership is $5/year and unlocks collaborative features.</div>
    </div>
    <div class="demo-card" style="margin-bottom:6px;">
      <div class="demo-label">What AI model does it use?</div>
      <div class="demo-value">Bundled NANO tier: qwen2.5:0.5b (always available, no download). Free FULL upgrade: Gemma 4 12B (~8 GB). Both run 100% offline.</div>
    </div>
    <div class="demo-card">
      <div class="demo-label">What is the Liana Banyan cooperative?</div>
      <div class="demo-value">A member-owned cooperative. 83.3% of all earnings go to creators and workers. $5/year membership. No profit motive over member outcomes.</div>
    </div>
  </div>
</div>
</div>

---

## Tab 4 — Kitchen Table

<div class="tab-section">
<div class="annotation">Kitchen Table = cooperative family coordination hub. Local network peer discovery, shared notes, family AI sessions.</div>
<div class="demo-shell">
  <div class="demo-titlebar">
    <span style="color:#334155;font-size:10px;">🐘</span>
    <span class="title-text">MnemosyneC v0.1.33</span>
  </div>
  <div class="demo-header">
    <div class="demo-nav">
      <div class="demo-tab">Frame</div>
      <div class="demo-tab">AI</div>
      <div class="demo-tab">FAQ</div>
      <div class="demo-tab active">Kitchen Table</div>
      <div class="demo-tab">$ LB Account</div>
    </div>
  </div>
  <div class="demo-body">
    <div class="demo-section-header">Your Network</div>
    <div class="demo-card">
      <div class="demo-value" style="color:#334155;font-style:italic;">No family members found on local network yet. Nodes on the same WiFi appear here automatically.</div>
    </div>
    <div class="demo-section-header">Shared Notes</div>
    <div class="demo-card">
      <div class="demo-value" style="color:#334155;font-style:italic;">No shared notes yet.</div>
    </div>
  </div>
</div>
</div>

---

## Tab 5 — $ LB Account

<div class="tab-section">
<div class="annotation">LB Account tab = cooperative membership status, Credits/Marks balance, and $5/year membership flow.</div>
<div class="demo-shell">
  <div class="demo-titlebar">
    <span style="color:#334155;font-size:10px;">🐘</span>
    <span class="title-text">MnemosyneC v0.1.33</span>
  </div>
  <div class="demo-header">
    <div class="demo-nav">
      <div class="demo-tab">Frame</div>
      <div class="demo-tab">AI</div>
      <div class="demo-tab">FAQ</div>
      <div class="demo-tab">Kitchen Table</div>
      <div class="demo-tab active">$ LB Account</div>
    </div>
  </div>
  <div class="demo-body">
    <div class="demo-section-header">Membership Status</div>
    <div class="demo-card">
      <div class="demo-row">
        <div>
          <div class="demo-label">Not yet a member</div>
          <div class="demo-value">$5/year unlocks cooperative features, shared substrate, and credential staking.</div>
        </div>
        <span class="demo-chip" style="color:#6ee7b7;border-color:rgba(110,231,183,0.3);">Join — $5/year</span>
      </div>
    </div>
    <div class="demo-section-header">Your Balance</div>
    <div class="demo-card">
      <div class="demo-value" style="color:#334155;font-style:italic;">Join the cooperative to see your Credits, Marks, and contribution history.</div>
    </div>
  </div>
</div>
</div>

---

## Settings — Key Sections

<div class="tab-section">
<div class="annotation">Settings is reachable via the ⚙ gear icon top-right. Has a search box for quick navigation. Key sections shown below.</div>

<div class="demo-shell">
  <div class="demo-titlebar">
    <span style="color:#334155;font-size:10px;">🐘</span>
    <span class="title-text">MnemosyneC v0.1.33 — Settings</span>
  </div>
  <div class="demo-body" style="padding:12px">

    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:6px;padding:8px;color:#475569;font-size:10px;margin-bottom:12px;">Search settings... (e.g. AI Tier, Gemma, retrieval)</div>

    <div class="demo-section-header">MnemosyneC Update</div>
    <div class="demo-card">
      <div class="demo-row">
        <div><div class="demo-label">Current strain</div><div class="demo-value">v0.1.33</div></div>
        <div style="display:flex;gap:6px;">
          <span class="demo-chip">Check for update</span>
          <span class="demo-chip on">Auto-install ON</span>
        </div>
      </div>
    </div>

    <div class="demo-section-header">Appearance</div>
    <div class="demo-card">
      <div class="demo-row">
        <div class="demo-label">Theme</div>
        <div style="display:flex;gap:4px;">
          <span class="demo-chip">Dark</span>
          <span class="demo-chip on">System</span>
          <span class="demo-chip">Light</span>
        </div>
      </div>
    </div>

    <div class="demo-section-header">AI Model Assignment</div>
    <div class="demo-card">
      <div class="demo-value" style="margin-bottom:6px;">Which AI agent handles which role. Ollama = local free. Anthropic = cloud (requires API key).</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
        <div class="demo-card" style="padding:6px;margin:0"><div class="demo-label" style="font-size:9px;">Bishop (reasoning)</div><span class="demo-chip" style="font-size:9px;">Ollama local</span></div>
        <div class="demo-card" style="padding:6px;margin:0"><div class="demo-label" style="font-size:9px;">Knight (code)</div><span class="demo-chip" style="font-size:9px;">Ollama local</span></div>
        <div class="demo-card" style="padding:6px;margin:0"><div class="demo-label" style="font-size:9px;">Pawn (review)</div><span class="demo-chip" style="font-size:9px;">Manual</span></div>
        <div class="demo-card" style="padding:6px;margin:0"><div class="demo-label" style="font-size:9px;">Rook (patents)</div><span class="demo-chip" style="font-size:9px;">Manual</span></div>
      </div>
    </div>

    <div class="demo-section-header">AI Tier</div>
    <div class="demo-card">
      <div class="demo-row" style="margin-bottom:8px;">
        <div class="demo-label">Current: NANO (qwen2.5:0.5b, bundled)</div>
        <span class="demo-chip" style="color:#6ee7b7;border-color:rgba(110,231,183,0.3);">Upgrade to FULL (free)</span>
      </div>
      <div class="demo-value">FULL = Gemma 4 12B. ~8 GB. Runs offline. No subscription.</div>
    </div>

    <div class="demo-section-header">Auto-Prepare FULL Upgrade</div>
    <div class="demo-card">
      <div class="demo-row">
        <div>
          <div class="demo-label">Download Gemma 4 12B in background</div>
          <div class="demo-value">When ON: silently pulls on launch + every 30 min idle. Notifies when ready. Never activates without your click.</div>
        </div>
        <span class="demo-chip">OFF</span>
      </div>
    </div>

    <div class="demo-section-header">For Techies</div>
    <div class="demo-card">
      <div class="demo-label">Developer Tools</div>
      <div class="demo-value" style="margin-bottom:6px;">Open the Chromium DevTools panel. Three paths: this button, right-click the title bar, or Ctrl+Shift+D.</div>
      <span class="demo-chip">Toggle DevTools</span>
    </div>

    <div class="demo-section-header">Developer Mode</div>
    <div class="demo-card">
      <div class="demo-row">
        <div>
          <div class="demo-label">Cooperative Defensive Patent Pledge #2260</div>
          <div class="demo-value">Requires membership + Pledge #2260 agreement</div>
        </div>
        <span class="demo-chip">OFF</span>
      </div>
    </div>

  </div>
</div>
</div>

---

## What Each Tab Does — Quick Reference

| Tab | Purpose | Primary user action |
|---|---|---|
| Frame | Ask questions, get AI + substrate answers | Type a question |
| AI | See model status, upgrade tier | Download Gemma 4 12B |
| FAQ | Learn what the app is | Read / browse |
| Kitchen Table | Connect to family on local network | Discover peers |
| $ LB Account | Cooperative membership + earnings | Join ($5/year) |
| Settings (⚙) | Configure app behavior | Toggle options |

---

## Off-the-Street Evaluation Notes

For Pawn's evaluation per `PAWN_UX_EVALUATION_V0132_BP078.md`:

**Does a stranger understand what MnemosyneC is within 30 seconds?**
The FAQ tab is the primary answer surface. The tagline "Caithedral · Liana Banyan" may not be self-explanatory to a cold user. Recommendation: a one-line subtitle on the Frame tab ("Your local AI memory — runs on your machine, no cloud required").

**Can they find the AI upgrade path?**
The "Get FULL AI Free" pill in the top nav is visible but may be overlooked. The AI tab is the explicit path. The Auto-Prepare toggle in Settings provides a passive path.

**Does anything appear to cost money?**
The "$ LB Account" tab label may suggest cost. The $5/year membership should be framed as optional cooperative membership, not a paywall.

**Bishop / Knight / Pawn / Rook labels in AI Model Assignment:**
Non-obvious to non-technical users. Short descriptors "(reasoning)" / "(code)" / "(review)" / "(patents)" added in v0.1.33 to each model assignment card.

---

*Static demo · MnemosyneC v0.1.33 · SEG-Q-6 BP078 · Knight (Cursor · Sonnet 4.6)*
*No real AI, no real data, no state. Visual reference only.*
