/**
 * LB Test Frame — Onboarding flow controller
 * K502 / B124 — K518: Wing onboarding steps added (steps 4-6)
 *
 * Full flow: Persona → Pick AI → Verify Ready → Wing Welcome → Pick Augurs → Freshness
 */

const AI_VENDORS = {
  claude:     { name: 'Claude (Anthropic)', icon: '🟠', signupUrl: 'https://claude.ai/login' },
  chatgpt:    { name: 'ChatGPT (OpenAI)',   icon: '🟢', signupUrl: 'https://chat.openai.com' },
  gemini:     { name: 'Gemini (Google)',     icon: '🔵', signupUrl: 'https://gemini.google.com' },
  perplexity: { name: 'Perplexity',          icon: '⚫', signupUrl: 'https://perplexity.ai' },
  copilot:    { name: 'Copilot (Microsoft)', icon: '🔷', signupUrl: 'https://copilot.microsoft.com' },
};

let selectedPersona = null;
let selectedAI = null;
let detectedSessions = {};
let selectedAugurIds = new Set(['starter-cite-source', 'starter-no-medical', 'starter-financial-gate', 'starter-projects-enrich', 'starter-lb-facts']);
let selectedFreshnessSec = 3600;

// ── Step 1: Persona picker ────────────────────────────────────────────────────

function selectPersona(persona) {
  selectedPersona = persona;
  document.querySelectorAll('.persona-card').forEach((el) => {
    el.classList.toggle('selected', el.dataset.persona === persona);
  });
  document.getElementById('btn-persona-next').disabled = false;
}

function goToPickAI() {
  showStep('step-pick-ai');
  scanForAISessions();
}

// ── Step 2: Pick Your AI ──────────────────────────────────────────────────────

function scanForAISessions() {
  chrome.runtime.sendMessage({ type: 'DETECT_AI_SESSIONS' }, (detected) => {
    detectedSessions = detected || {};
    renderAIVendors(detectedSessions, false);
  });
}

function renderAIVendors(detected, showAll) {
  const list = document.getElementById('ai-vendor-list');
  const note = document.getElementById('detection-note');

  const hasDetected = Object.keys(detected).length > 0;
  if (hasDetected) {
    note.textContent = `Found ${Object.keys(detected).length} AI session${Object.keys(detected).length > 1 ? 's' : ''} in your browser. Select your primary AI.`;
  } else {
    note.textContent = 'No AI sessions detected in current tabs. Select your AI or open it in a new tab.';
  }

  const vendorsToShow = showAll ? AI_VENDORS : (hasDetected ? detected : AI_VENDORS);

  list.innerHTML = Object.entries(vendorsToShow).map(([vendorId, info]) => {
    const isDetected = !!detected[vendorId];
    const isLoggedIn = detected[vendorId]?.likelyLoggedIn;
    const badge = isDetected
      ? `<span style="font-size:11px;padding:2px 8px;border-radius:20px;background:#0f2a1c;color:#4ade80;margin-top:6px;display:inline-block;">${isLoggedIn ? '● Likely logged in' : '◌ Detected (login status unclear)'}</span>`
      : `<a href="${info.signupUrl}" target="_blank" style="font-size:11px;padding:2px 8px;border-radius:20px;background:#1a1a2e;color:#60a5fa;margin-top:6px;display:inline-block;text-decoration:none;">Get free account →</a>`;

    return `
      <div class="persona-card" data-vendor="${vendorId}" onclick="selectAI('${vendorId}')">
        <div class="persona-icon casual" style="font-size:24px;">${info.icon}</div>
        <div class="persona-info">
          <div class="persona-name">${info.name}</div>
          ${badge}
        </div>
        <div class="persona-radio"></div>
      </div>
    `;
  }).join('');
}

function showAllAIs() {
  renderAIVendors(detectedSessions, true);
}

function selectAI(vendor) {
  selectedAI = vendor;
  document.querySelectorAll('#ai-vendor-list .persona-card').forEach((el) => {
    el.classList.toggle('selected', el.dataset.vendor === vendor);
  });
  document.getElementById('btn-ai-next').disabled = false;
}

function goToVerifySetup() {
  showStep('step-verify-ready');
  const summary = document.getElementById('setup-summary');
  const vendorName = AI_VENDORS[selectedAI]?.name ?? selectedAI;
  summary.textContent = `Cathedral injection is active for ${vendorName}. Queries on ${vendorName} will be enriched with LB context.`;
}

// ── Step 3: Ready ─────────────────────────────────────────────────────────────

function finishOnboarding(runVerify) {
  // Save Cathedral/verification prefs, then proceed to Wing onboarding
  chrome.runtime.sendMessage({
    type: 'SET_PREFS',
    prefs: {
      persona: selectedPersona === 'all' ? 'casual' : selectedPersona,
      selectedAI,
      onboardingComplete: true,
    }
  }, () => {
    if (runVerify) {
      chrome.runtime.sendMessage({ type: 'OPEN_VERIFY_TAB' });
      goToWingWelcome();
    } else {
      goToWingWelcome();
    }
  });
}

// ── Step 4: Wing Welcome ──────────────────────────────────────────────────────

function goToWingWelcome() {
  showStep('step-wing-welcome');
}

// ── Step 5: Pick Starter Augurs ───────────────────────────────────────────────

const STARTER_AUGUR_META = [
  {
    id: 'starter-cite-source',
    name: 'Warn before unverified factual claims',
    desc: 'Fires when your query contains phrases like "research shows" or "studies say". Prompts a substrate check first.',
    action: 'warn',
  },
  {
    id: 'starter-no-medical',
    name: 'Block medical advice without substrate',
    desc: 'Blocks queries asking for medical advice unless your health substrate was consulted within 24 hours.',
    action: 'block',
  },
  {
    id: 'starter-financial-gate',
    name: 'Warn on financial/investment queries',
    desc: 'Warns when your query mentions investments, crypto, or financial advice.',
    action: 'warn',
  },
  {
    id: 'starter-projects-enrich',
    name: 'Auto-enrich queries about your projects',
    desc: 'When you ask about "my project" or "our system", automatically injects Cathedral context into the query.',
    action: 'enrich',
  },
  {
    id: 'starter-lb-facts',
    name: 'Enrich Liana Banyan queries with Cathedral',
    desc: 'Fires on LB-specific queries (platform, 83.3%, Cathedral Effect) and enriches them with canonical context.',
    action: 'enrich',
  },
];

function goToWingAugurs() {
  showStep('step-wing-augurs');
  renderAugurPicker();
}

function renderAugurPicker() {
  const list = document.getElementById('augur-pick-list');
  list.innerHTML = STARTER_AUGUR_META.map((a) => {
    const sel = selectedAugurIds.has(a.id);
    return `
      <div class="augur-card ${sel ? 'selected' : ''}" data-id="${a.id}" onclick="toggleAugur('${a.id}')">
        <div class="augur-check">${sel ? '✓' : ''}</div>
        <div class="augur-info">
          <div class="augur-name">${a.name}</div>
          <div class="augur-desc">${a.desc}</div>
        </div>
        <div class="action-badge ${a.action}">${a.action}</div>
      </div>
    `;
  }).join('');
}

function toggleAugur(id) {
  if (selectedAugurIds.has(id)) {
    selectedAugurIds.delete(id);
  } else {
    selectedAugurIds.add(id);
  }
  renderAugurPicker();
}

// ── Step 6: Freshness Windows ─────────────────────────────────────────────────

function goToWingFreshness() {
  showStep('step-wing-freshness');
}

function selectFreshness(sec) {
  selectedFreshnessSec = sec;
  document.querySelectorAll('.freshness-opt').forEach((el) => {
    el.classList.toggle('selected', parseInt(el.dataset.seconds) === sec);
  });
}

function finishWingSetup() {
  if (selectedAugurIds.size === 0) {
    // No augurs selected — skip wing install
    skipWing();
    return;
  }

  // Install selected starter augurs
  chrome.runtime.sendMessage({
    type: 'WING_INSTALL_STARTERS',
    starter_ids: Array.from(selectedAugurIds),
  }, () => {
    // Apply freshness override to installed rules
    chrome.runtime.sendMessage({ type: 'DISCIPLINE_GET_RULES' }, (resp) => {
      const rules = resp?.rules ?? [];
      const updated = rules.map((r) => {
        if (selectedAugurIds.has(r.id) && r.required_consult) {
          return {
            ...r,
            required_consult: { ...r.required_consult, freshness_seconds: selectedFreshnessSec },
          };
        }
        return r;
      });
      // Save updated freshness
      const saveAll = updated.map((r) =>
        new Promise((resolve) => chrome.runtime.sendMessage({ type: 'DISCIPLINE_SAVE_RULE', rule: r }, resolve))
      );
      Promise.all(saveAll).then(() => {
        _showWingDone();
      });
    });
  });
}

function skipWing() {
  // Mark prefs, close
  chrome.runtime.sendMessage({ type: 'SET_PREF', key: 'wingOnboardingSkipped', value: true }, () => {
    window.close();
  });
}

function _showWingDone() {
  // Brief done overlay then close
  document.getElementById('app').innerHTML = `
    <div style="text-align:center;padding:60px 40px;">
      <div style="font-size:48px;margin-bottom:20px;">⚖</div>
      <div style="font-size:22px;font-weight:700;color:#f1f5f9;margin-bottom:12px;">Your Wing is set up.</div>
      <div style="font-size:14px;color:#64748b;margin-bottom:28px;">${selectedAugurIds.size} Augur${selectedAugurIds.size !== 1 ? 's' : ''} installed. Wing is active. Use your AI as normal — your rules will enforce quietly.</div>
      <div style="font-size:13px;color:#3b82f6;cursor:pointer;" onclick="window.close()">Close this window →</div>
    </div>
  `;
  setTimeout(() => window.close(), 4000);
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function showStep(stepId) {
  ['step-persona', 'step-pick-ai', 'step-verify-ready',
   'step-wing-welcome', 'step-wing-augurs', 'step-wing-freshness'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = id === stepId ? '' : 'none';
  });
}

function goBack(stepId) {
  showStep(stepId);
}
