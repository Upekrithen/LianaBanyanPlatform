// Layer2UseIt.tsx -- SEG-S-7 BP078 v0.1.35
// Layer 2 surface for "Just Use It" doorway.
// 4 AI mode choices; choice 4 shows Ollama model dropdown + cloud provider entries.
// Advances to Stage C on selection; Stage C full experience deferred to v0.1.36.

import React, { useState, useEffect, useCallback } from 'react';
import { WelcomeCueCard } from './WelcomeCueCard';
import { useLifecycleStage } from '../hooks/useLifecycleStage';

export interface Layer2UseItProps {
  onBack: () => void;
}

type ScreenMode = 'picking' | 'confirming';

const CLOUD_PROVIDERS = ['Anthropic', 'OpenAI', 'Google', 'Mistral'];

// Shared style tokens matching WelcomeView dark theme
const S = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 9600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0d1117',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    width: '100%',
    maxWidth: 480,
    padding: '36px 32px',
    background: '#111827',
    border: '1px solid rgba(100, 116, 139, 0.2)',
    borderRadius: 12,
    margin: '0 16px',
  },
  brandLine: {
    fontSize: 11,
    fontWeight: 700 as const,
    color: '#60a5fa',
    letterSpacing: '0.10em',
    textTransform: 'uppercase' as const,
    marginBottom: 20,
  },
  heading: {
    fontSize: 16,
    fontWeight: 800 as const,
    color: '#e2e8f0',
    lineHeight: 1.3,
    margin: '0 0 20px',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#475569',
    fontSize: 11,
    cursor: 'pointer',
    padding: '0 0 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  cardStack: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  },
  placeholderBox: {
    padding: '18px 20px',
    background: 'rgba(30, 64, 175, 0.08)',
    border: '1px solid rgba(96, 165, 250, 0.25)',
    borderRadius: 10,
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 1.6,
    marginBottom: 16,
  },
  backLink: {
    background: 'none',
    border: 'none',
    color: '#475569',
    fontSize: 12,
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: 0,
  },
  dropdownWrap: {
    marginTop: 10,
    padding: '14px 16px',
    background: 'rgba(15, 23, 42, 0.7)',
    border: '1px solid rgba(96, 165, 250, 0.2)',
    borderRadius: 10,
  },
  select: {
    width: '100%',
    padding: '8px 10px',
    background: '#1e293b',
    border: '1px solid rgba(100, 116, 139, 0.35)',
    borderRadius: 7,
    color: '#e2e8f0',
    fontSize: 13,
    cursor: 'pointer',
  },
  selectLabel: {
    fontSize: 11,
    color: '#475569',
    fontWeight: 600 as const,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    marginBottom: 8,
  },
  confirmBtn: {
    marginTop: 12,
    width: '100%',
    padding: '10px 0',
    background: 'rgba(30, 64, 175, 0.25)',
    border: '1px solid rgba(96, 165, 250, 0.40)',
    borderRadius: 8,
    color: '#60a5fa',
    fontSize: 13,
    fontWeight: 600 as const,
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
};

export function Layer2UseIt({ onBack }: Layer2UseItProps): React.ReactElement {
  const { advanceTo } = useLifecycleStage();
  const [screenMode, setScreenMode] = useState<ScreenMode>('picking');
  const [choice4Open, setChoice4Open] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('');

  // Fetch Ollama models when choice 4 is expanded
  useEffect(() => {
    if (!choice4Open) return;
    setModelsLoading(true);
    window.amplify.listOllamaModels()
      .then((list) => setModels(list))
      .catch(() => setModels([]))
      .finally(() => setModelsLoading(false));
  }, [choice4Open]);

  const handleSimpleChoice = useCallback((): void => {
    advanceTo('C');
    setScreenMode('confirming');
  }, [advanceTo]);

  const handleChoice4Click = useCallback((): void => {
    setChoice4Open((prev) => !prev);
  }, []);

  const handleModelConfirm = useCallback((): void => {
    if (!selectedModel) return;
    advanceTo('C');
    setScreenMode('confirming');
  }, [advanceTo, selectedModel]);

  const handleBackFromPlaceholder = useCallback((): void => {
    setScreenMode('picking');
    setChoice4Open(false);
  }, []);

  // Build dropdown options: local Ollama models + cloud providers
  const allOptions: string[] = [
    ...(models.length > 0 ? models.map((m) => `Ollama: ${m}`) : []),
    ...CLOUD_PROVIDERS.map((p) => `${p} (API key required)`),
  ];

  // ── Confirming placeholder ──────────────────────────────────────────────────
  if (screenMode === 'confirming') {
    return (
      <div style={S.overlay}>
        <div style={S.card}>
          <div style={S.brandLine}>Just Use It</div>
          <div style={S.placeholderBox}>
            Your AI is being set up. Full chat experience coming in the next update.
          </div>
          <button type="button" style={S.backLink} onClick={handleBackFromPlaceholder}>
            {'< back to choices'}
          </button>
        </div>
      </div>
    );
  }

  // ── Picking: 4 choice cards ─────────────────────────────────────────────────
  return (
    <div style={S.overlay}>
      <div style={S.card}>
        <button type="button" style={S.backBtn} onClick={onBack}>
          {'< back'}
        </button>

        <div style={S.brandLine}>Just Use It</div>
        <h2 style={S.heading}>How do you want to use AI?</h2>

        <div style={S.cardStack}>
          {/* Choice 1 */}
          <WelcomeCueCard
            label="No AI, search and organize with your own computer only."
            size="choice"
            variant="neutral"
            onClick={handleSimpleChoice}
          />

          {/* Choice 2 */}
          <WelcomeCueCard
            label="Free lightweight AI, fast local helper using Ollama plus Mistral."
            size="choice"
            variant="blue"
            onClick={handleSimpleChoice}
          />

          {/* Choice 3 */}
          <WelcomeCueCard
            label="Free heavy-duty AI, stronger local model using Gemma 4 12B."
            size="choice"
            variant="blue"
            onClick={handleSimpleChoice}
          />

          {/* Choice 4 */}
          <WelcomeCueCard
            label="Use another AI already on this machine or add a new one."
            size="choice"
            variant="blue"
            onClick={handleChoice4Click}
          />

          {/* Dropdown panel -- shown when choice 4 is toggled */}
          {choice4Open && (
            <div style={S.dropdownWrap}>
              <div style={S.selectLabel}>
                {modelsLoading ? 'Detecting models...' : 'Select a model or provider'}
              </div>
              <select
                style={S.select}
                value={selectedModel}
                onChange={(e): void => setSelectedModel(e.target.value)}
                disabled={modelsLoading}
              >
                <option value="">-- choose one --</option>
                {allOptions.length === 0 && !modelsLoading && (
                  // No local Ollama models found; cloud providers still listed below
                  <option value="" disabled>No local Ollama models detected</option>
                )}
                {allOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <button
                type="button"
                style={{
                  ...S.confirmBtn,
                  opacity: selectedModel ? 1 : 0.45,
                  cursor: selectedModel ? 'pointer' : 'default',
                }}
                onClick={handleModelConfirm}
                disabled={!selectedModel}
              >
                Use this model
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Layer2UseIt;
