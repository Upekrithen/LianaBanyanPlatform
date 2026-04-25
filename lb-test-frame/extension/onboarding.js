/**
 * LB Test Frame — Onboarding flow controller
 * Three-step: Persona Picker → Pick Your AI → Ready to Verify
 * K502 / B124
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
  // Save state
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
    }
    window.close();
  });
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function showStep(stepId) {
  ['step-persona', 'step-pick-ai', 'step-verify-ready'].forEach((id) => {
    document.getElementById(id).style.display = id === stepId ? '' : 'none';
  });
}

function goBack(stepId) {
  showStep(stepId);
}
