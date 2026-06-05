// Bp067FirstRunSpine.tsx -- BP067 v0.1.25 one-spine first-run (WAVE-24 extended)
// Sequence: transparent install -> SaltFighter cover -> value ->
//           choose memory folder -> meet your AI -> try it now -> upgrades
// Canon: Asteroid-ProofVault/BP067_v0124_INSTALL_ONBOARDING_SPEC.md

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UPGRADE_MODELS } from '../../shared/floor-model';

export const LS_BP067_FIRST_RUN_COMPLETE = 'mnemosyne-bp067-first-run-complete';
export const LS_SALTFIGHTER_SKIP = 'mnemosyne-saltfighter-skip';

type SpinePhase =
  | 'install'
  | 'cover'
  | 'value'
  | 'folder'
  | 'meet-ai'
  | 'try-now'
  | 'upgrades';

interface EngineSetupProgress {
  step: string;
  message: string;
  detail?: string;
  percentComplete?: number;
}

interface ModelPullProgress {
  status: 'pulling' | 'verifying' | 'complete' | 'error';
  bytesDownloaded?: number;
  totalBytes?: number;
  percentComplete?: number;
  error?: string;
}

interface WatcherStats {
  foldersWatched: number;
  ebletsMinted: number;
  lastEventAt: string | null;
  errors: string[];
}

interface Bp067FirstRunSpineProps {
  onComplete: () => void;
}

const SALTFIGHTER_TEXT =
  'Greetings, SaltFighter!\n\n' +
  'Your AI remembers you.\n' +
  'Your questions stay on your computer.\n' +
  'Private. Free. Yours.\n\n' +
  'Free to use. Better to join. Share and Save.';

const SAMPLE_PROMPTS = [
  'What can you help me with?',
  'Write a short grocery list for tacos.',
  'Explain what makes this AI private.',
];

function fmtBytes(b: number): string {
  if (b >= 1_073_741_824) return `${(b / 1_073_741_824).toFixed(1)} GB`;
  if (b >= 1_048_576) return `${(b / 1_048_576).toFixed(0)} MB`;
  return `${(b / 1024).toFixed(0)} KB`;
}

export function Bp067FirstRunSpine({ onComplete }: Bp067FirstRunSpineProps) {
  const [phase, setPhase] = useState<SpinePhase>('install');

  // install phase
  const [installLines, setInstallLines] = useState<EngineSetupProgress[]>([]);
  const [installError, setInstallError] = useState<string | null>(null);
  const [installDone, setInstallDone] = useState(false);

  // cover phase
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);
  const crawlRef = useRef<HTMLDivElement | null>(null);
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doNotShowAgainRef = useRef(false);

  // folder phase
  const [folderPicked, setFolderPicked] = useState<string | null>(null);
  const [pickingFolder, setPickingFolder] = useState(false);
  const [watcherStats, setWatcherStats] = useState<WatcherStats | null>(null);

  // meet-ai phase
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelPull, setModelPull] = useState<ModelPullProgress | null>(null);
  const [modelPullName, setModelPullName] = useState<string | null>(null);

  // try-now phase
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);
  const askInputRef = useRef<HTMLInputElement | null>(null);

  // upgrades phase
  const [showUpgrades, setShowUpgrades] = useState(false);

  // ── Phase 0: transparent install ──────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'install') return;
    let cleanupProgress: (() => void) | undefined;
    const run = async () => {
      cleanupProgress = window.amplify?.onEngineSetupProgress?.((p: EngineSetupProgress) => {
        setInstallLines((prev) => {
          const last = prev[prev.length - 1];
          if (last?.message === p.message) return prev;
          return [...prev, p];
        });
        if (p.step === 'ready') setInstallDone(true);
        if (p.step === 'error') setInstallError(p.detail ?? p.message);
      });
      const result = await window.amplify?.setupPrivateAI?.();
      if (!result?.ok) {
        setInstallError(result?.error ?? 'Setup failed');
        return;
      }
      setInstallDone(true);
      setTimeout(() => setPhase('cover'), 600);
    };
    void run();
    return () => cleanupProgress?.();
  }, [phase]);

  // ── SaltFighter cover: scroll crawl ───────────────────────────────────────
  useEffect(() => {
    if (phase !== 'cover') return;
    try {
      const audio = new Audio('greetings_saltfighter.m4a');
      audio.volume = 0.7;
      audio.play().catch(() => {});
    } catch { /* audio optional */ }
    if (crawlRef.current) {
      const el = crawlRef.current;
      let frame = 0;
      const animate = () => {
        el.scrollTop += 0.4;
        frame = requestAnimationFrame(animate);
      };
      frame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(frame);
    }
    return undefined;
  }, [phase]);

  // ── SaltFighter cover: auto-advance 8s ────────────────────────────────────
  useEffect(() => {
    if (phase !== 'cover') return;
    autoAdvanceRef.current = setTimeout(() => {
      if (doNotShowAgainRef.current) {
        finishSpine();
      } else {
        setPhase('value');
      }
    }, 8000);
    return () => {
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ── meet-ai: load model list on entry ────────────────────────────────────
  useEffect(() => {
    if (phase !== 'meet-ai') return;
    setModelsLoading(true);
    void window.amplify?.listOllamaModels?.()
      .then((models: string[]) => {
        setAvailableModels(models ?? []);
        if (models && models.length > 0 && !selectedModel) {
          setSelectedModel(models[0]);
        }
      })
      .catch(() => {})
      .finally(() => setModelsLoading(false));
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── try-now: autofocus + refresh stats ────────────────────────────────────
  useEffect(() => {
    if (phase === 'try-now') {
      askInputRef.current?.focus();
      void window.amplify?.watcher?.getStats?.()
        .then((s) => setWatcherStats(s as WatcherStats | null))
        .catch(() => {});
    }
  }, [phase]);

  const finishSpine = useCallback(() => {
    try {
      localStorage.setItem(LS_BP067_FIRST_RUN_COMPLETE, 'true');
      if (doNotShowAgainRef.current) localStorage.setItem(LS_SALTFIGHTER_SKIP, 'true');
    } catch { /* ignore */ }
    void window.amplify?.markBp067FirstRunComplete?.();
    onComplete();
  }, [onComplete]);

  const handleSkipCover = () => {
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    if (doNotShowAgainRef.current) {
      finishSpine();
    } else {
      setPhase('value');
    }
  };

  const handlePickFolder = async () => {
    setPickingFolder(true);
    try {
      const result = await window.amplify?.watcher?.openFolderDialog?.();
      if (result && !result.canceled && result.filePaths.length > 0) {
        setFolderPicked(result.filePaths[0]);
        await window.amplify?.watcher?.addFolder?.(result.filePaths[0]).catch(() => {});
      }
    } catch { /* dialog unavailable */ }
    finally { setPickingFolder(false); }
  };

  const handlePullModel = async (modelName: string) => {
    setModelPullName(modelName);
    setModelPull({ status: 'pulling', percentComplete: 0 });
    const cleanup = window.amplify?.onOllamaPullProgress?.((p: ModelPullProgress) => {
      setModelPull(p);
      if (p.status === 'complete') {
        setAvailableModels((prev) =>
          prev.includes(modelName) ? prev : [...prev, modelName],
        );
        setSelectedModel(modelName);
      }
    });
    try {
      await window.amplify?.pullDefaultModel?.();
    } catch { /* handled by progress events */ }
    finally { cleanup?.(); }
  };

  const handleAsk = async () => {
    const q = question.trim();
    if (!q || asking) return;
    setAsking(true);
    setAskError(null);
    try {
      const result = await window.amplify?.askFloorModel?.(q);
      if (result?.ok && result.text) {
        setAnswer(result.text);
        setShowUpgrades(true);
        setPhase('upgrades');
      } else {
        setAskError(result?.error ?? 'Could not get an answer. Try again in a moment.');
      }
    } catch {
      setAskError('Something went wrong. Try again in a moment.');
    } finally {
      setAsking(false);
    }
  };

  const overlay: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 9600,
    background: '#0a0f1a',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    overflow: 'hidden',
  };

  // ── Install screen ───────────────────────────────────────────────────────
  if (phase === 'install') {
    return (
      <div style={overlay}>
        <div style={{ flex: 1, padding: '48px 56px', maxWidth: 560, margin: '0 auto', width: '100%' }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#e2e8f0', marginBottom: 8 }}>
            Setting up your private AI engine
          </h1>
          <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7, marginBottom: 28 }}>
            MnemosyneC runs on Ollama, a free, open-source AI engine that runs entirely on your computer.
            Your questions and files never leave your machine. Free, forever.
          </p>
          <div style={{ fontSize: 12, color: '#64748b', lineHeight: 2.2, fontFamily: 'monospace' }}>
            {installLines.map((line, i) => (
              <div
                key={i}
                style={{
                  color:
                    line.step === 'error'
                      ? '#f87171'
                      : line.step === 'ready'
                      ? '#4ade80'
                      : '#94a3b8',
                }}
              >
                {line.message}
              </div>
            ))}
            {!installDone && !installError && (
              <div style={{ color: '#475569' }}>Almost ready...</div>
            )}
          </div>
          {installError && (
            <div style={{ marginTop: 20, padding: 14, background: 'rgba(239,68,68,0.1)', borderRadius: 8, color: '#fca5a5', fontSize: 12 }}>
              {installError}
              <div style={{ marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => { setInstallError(null); setInstallLines([]); void window.amplify?.setupPrivateAI?.(); }}
                  style={{ padding: '6px 14px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, color: '#fca5a5', cursor: 'pointer' }}
                >
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── SaltFighter cover ────────────────────────────────────────────────────
  if (phase === 'cover') {
    return (
      <div style={{ ...overlay, background: '#000' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, rgba(30,60,120,0.5) 0%, #000 70%)' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px 60px', position: 'relative' }}>
          <div
            ref={crawlRef}
            style={{ width: '100%', maxWidth: 600, height: 320, overflow: 'hidden', maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)' }}
          >
            <p style={{ fontSize: 17, fontWeight: 500, color: '#6ee7b7', textAlign: 'center', lineHeight: 2, whiteSpace: 'pre-line', marginBottom: 200 }}>
              {SALTFIGHTER_TEXT}
            </p>
          </div>
        </div>
        <div style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(110,231,183,0.15)', background: 'rgba(0,0,0,0.8)' }}>
          <span style={{ fontSize: 10, color: '#334155' }}>Welcome -- MnemosyneC</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 11, color: '#475569' }}>
              <input
                type="checkbox"
                checked={doNotShowAgain}
                onChange={(e) => {
                  doNotShowAgainRef.current = e.target.checked;
                  setDoNotShowAgain(e.target.checked);
                }}
                style={{ accentColor: '#6ee7b7', width: 16, height: 16, cursor: 'pointer' }}
              />
              Don&apos;t show again
            </label>
            <button
              type="button"
              onClick={handleSkipCover}
              style={{ padding: '8px 20px', background: 'transparent', border: '1px solid rgba(100,116,139,0.3)', borderRadius: 6, color: '#94a3b8', fontSize: 12, cursor: 'pointer' }}
            >
              Skip -- open the app
            </button>
            <button
              type="button"
              onClick={() => { if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current); setPhase('value'); }}
              style={{ padding: '8px 24px', background: 'rgba(110,231,183,0.12)', border: '1px solid rgba(110,231,183,0.4)', borderRadius: 6, color: '#6ee7b7', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Value screen ─────────────────────────────────────────────────────────
  if (phase === 'value') {
    return (
      <div style={overlay}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
          <div style={{ maxWidth: 480, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#e2e8f0', lineHeight: 1.25, marginBottom: 16 }}>
              An AI that&apos;s yours.
            </div>
            <div style={{ fontSize: 18, color: '#94a3b8', lineHeight: 1.6, marginBottom: 32 }}>
              Private. Free. Remembers your stuff.
            </div>
            <button
              type="button"
              onClick={() => setPhase('folder')}
              style={{ padding: '14px 32px', background: 'rgba(110,231,183,0.15)', border: '1px solid rgba(110,231,183,0.4)', borderRadius: 8, color: '#6ee7b7', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
            >
              Get started
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Choose your memory folder ────────────────────────────────────────────
  if (phase === 'folder') {
    return (
      <div style={overlay}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
          <div style={{ maxWidth: 520, width: '100%' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#e2e8f0', marginBottom: 8 }}>
              Choose your memory folder
            </div>
            <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7, marginBottom: 8 }}>
              Point me at a folder and I&apos;ll remember everything in it -- recipes, notes, documents.
            </p>
            <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.6, marginBottom: 24 }}>
              Stays private on your computer. Optional -- you can always add folders later in Settings.
            </p>
            {folderPicked ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(6,78,59,0.15)', border: '1px solid rgba(110,231,183,0.3)', borderRadius: 6, fontSize: 12, color: '#6ee7b7', marginBottom: 16 }}>
                <span>+</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{folderPicked}</span>
                <span style={{ color: '#4ade80', fontSize: 10, flexShrink: 0 }}>watching</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => void handlePickFolder()}
                disabled={pickingFolder}
                style={{ width: '100%', padding: 14, marginBottom: 16, background: 'rgba(59,130,246,0.08)', border: '1px dashed rgba(59,130,246,0.35)', borderRadius: 8, color: '#60a5fa', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
              >
                {pickingFolder ? 'Opening...' : 'Choose a folder'}
              </button>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setPhase('meet-ai')}
                style={{ padding: '10px 18px', background: 'none', border: '1px solid rgba(100,116,139,0.25)', borderRadius: 6, color: '#64748b', cursor: 'pointer', fontSize: 13 }}
              >
                Not now
              </button>
              <button
                type="button"
                onClick={() => setPhase('meet-ai')}
                style={{ padding: '10px 24px', background: 'rgba(110,231,183,0.12)', border: '1px solid rgba(110,231,183,0.35)', borderRadius: 6, color: '#6ee7b7', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}
              >
                {folderPicked ? 'Next: Meet your AI' : 'Skip for now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Meet your AI ─────────────────────────────────────────────────────────
  if (phase === 'meet-ai') {
    const pullPct = modelPull?.percentComplete ?? 0;
    const isPulling = modelPull?.status === 'pulling' || modelPull?.status === 'verifying';

    return (
      <div style={overlay}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
          <div style={{ maxWidth: 520, width: '100%' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#e2e8f0', marginBottom: 8 }}>
              Meet your AI
            </div>
            <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7, marginBottom: 24 }}>
              Your AI runs entirely on your computer -- no cloud, no data sharing, no subscription fees.
            </p>

            {/* Cost display */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              <div style={{ flex: 1, padding: '12px 14px', background: 'rgba(6,78,59,0.15)', border: '1px solid rgba(110,231,183,0.2)', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#4ade80' }}>$0</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>compute cost</div>
              </div>
              <div style={{ flex: 1, padding: '12px 14px', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(100,116,139,0.2)', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#94a3b8' }}>local</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>runs on your machine</div>
              </div>
            </div>

            {/* Current model */}
            {modelsLoading ? (
              <div style={{ fontSize: 12, color: '#475569', marginBottom: 20 }}>Loading available models...</div>
            ) : availableModels.length > 0 ? (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Currently thinking with:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {availableModels.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedModel(m)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: selectedModel === m ? 700 : 400,
                        cursor: 'pointer',
                        background: selectedModel === m ? 'rgba(110,231,183,0.15)' : 'rgba(15,23,42,0.6)',
                        border: selectedModel === m ? '1px solid rgba(110,231,183,0.5)' : '1px solid rgba(100,116,139,0.25)',
                        color: selectedModel === m ? '#6ee7b7' : '#94a3b8',
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                {selectedModel && (
                  <div style={{ marginTop: 8, fontSize: 11, color: '#475569' }}>
                    Currently thinking with: <span style={{ color: '#6ee7b7', fontWeight: 600 }}>{selectedModel}</span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>No models downloaded yet.</div>
                {!isPulling && (
                  <button
                    type="button"
                    onClick={() => void handlePullModel('gemma2:2b')}
                    style={{ padding: '8px 16px', background: 'rgba(110,231,183,0.12)', border: '1px solid rgba(110,231,183,0.3)', borderRadius: 6, color: '#6ee7b7', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Download default AI (gemma2:2b, ~1.7 GB)
                  </button>
                )}
              </div>
            )}

            {/* Pull progress */}
            {isPulling && modelPullName && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>
                  Downloading {modelPullName}... {pullPct}%
                  {modelPull?.bytesDownloaded && modelPull?.totalBytes
                    ? ` (${fmtBytes(modelPull.bytesDownloaded)} / ${fmtBytes(modelPull.totalBytes)})`
                    : ''}
                </div>
                <div style={{ height: 6, background: 'rgba(100,116,139,0.2)', borderRadius: 3, overflow: 'hidden' }}>
                  <div
                    style={{ height: '100%', width: `${pullPct}%`, background: '#6ee7b7', borderRadius: 3, transition: 'width 0.3s ease' }}
                  />
                </div>
              </div>
            )}
            {modelPull?.status === 'error' && (
              <div style={{ marginBottom: 16, fontSize: 12, color: '#f87171' }}>
                Download failed: {modelPull.error}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setPhase('try-now')}
                disabled={isPulling}
                style={{ padding: '10px 24px', background: 'rgba(110,231,183,0.15)', border: '1px solid rgba(110,231,183,0.4)', borderRadius: 6, color: '#6ee7b7', fontWeight: 700, cursor: isPulling ? 'wait' : 'pointer', opacity: isPulling ? 0.6 : 1, fontSize: 13 }}
              >
                {availableModels.length > 0 ? 'Try it now' : 'Skip for now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Try it now (first inference with memory context) ─────────────────────
  if (phase === 'try-now') {
    return (
      <div style={overlay}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
          <div style={{ maxWidth: 520, width: '100%' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#e2e8f0', marginBottom: 8 }}>
              Try it now
            </div>

            {/* Memory indicator */}
            {watcherStats && watcherStats.ebletsMinted > 0 ? (
              <div style={{ marginBottom: 16, padding: '8px 12px', background: 'rgba(6,78,59,0.15)', border: '1px solid rgba(110,231,183,0.2)', borderRadius: 6, fontSize: 12, color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>+</span>
                Your memory: <strong>{watcherStats.ebletsMinted.toLocaleString()}</strong> file{watcherStats.ebletsMinted !== 1 ? 's' : ''} remembered
              </div>
            ) : folderPicked ? (
              <div style={{ marginBottom: 16, padding: '8px 12px', background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(100,116,139,0.2)', borderRadius: 6, fontSize: 12, color: '#475569', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>...</span>
                Indexing your memory folder
              </div>
            ) : (
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, marginBottom: 16 }}>
                Ask me anything -- no memory folder yet, but you can always add one in Settings.
              </p>
            )}

            {selectedModel && (
              <div style={{ marginBottom: 16, fontSize: 11, color: '#475569' }}>
                Thinking with: <span style={{ color: '#94a3b8' }}>{selectedModel}</span> -- $0 compute cost
              </div>
            )}

            <label htmlFor="bp067-ask" style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#e2e8f0', marginBottom: 10 }}>
              Ask me anything:
            </label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input
                id="bp067-ask"
                ref={askInputRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') void handleAsk(); }}
                placeholder="Try: What can you help me with?"
                disabled={asking}
                style={{ flex: 1, padding: '12px 14px', background: '#111827', border: '1px solid rgba(110,231,183,0.3)', borderRadius: 8, color: '#e2e8f0', fontSize: 14, outline: 'none' }}
              />
              <button
                type="button"
                onClick={() => void handleAsk()}
                disabled={asking || !question.trim()}
                style={{ padding: '12px 20px', background: 'rgba(110,231,183,0.15)', border: '1px solid rgba(110,231,183,0.4)', borderRadius: 8, color: '#6ee7b7', fontWeight: 700, cursor: asking ? 'wait' : 'pointer', opacity: asking || !question.trim() ? 0.6 : 1, whiteSpace: 'nowrap' }}
              >
                {asking ? '...' : 'Ask'}
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {SAMPLE_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setQuestion(p)}
                  style={{ fontSize: 10, padding: '4px 10px', background: 'rgba(100,116,139,0.15)', border: '1px solid rgba(100,116,139,0.25)', borderRadius: 12, color: '#94a3b8', cursor: 'pointer' }}
                >
                  {p}
                </button>
              ))}
            </div>
            {askError && <div style={{ fontSize: 12, color: '#f87171', marginTop: 8 }}>{askError}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                type="button"
                onClick={() => { setShowUpgrades(true); setPhase('upgrades'); }}
                style={{ padding: '8px 16px', background: 'none', border: 'none', color: '#475569', fontSize: 12, cursor: 'pointer' }}
              >
                Skip -- open the app
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Optional upgrades ────────────────────────────────────────────────────
  if (phase === 'upgrades' && showUpgrades) {
    return (
      <div style={overlay}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
          <div style={{ maxWidth: 480, textAlign: 'center' }}>
            {answer && (
              <div style={{ marginBottom: 24, padding: 16, background: 'rgba(6,78,59,0.15)', border: '1px solid rgba(110,231,183,0.25)', borderRadius: 8, fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, maxHeight: 120, overflow: 'auto', textAlign: 'left' }}>
                {answer.slice(0, 500)}{answer.length > 500 ? '...' : ''}
              </div>
            )}
            <div style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>
              {answer ? 'Now that you see it works -- want it even smarter?' : 'Want an even smarter AI?'}
            </div>
            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 24, lineHeight: 1.6 }}>
              Optional. Your current AI works great. Upgrade anytime in Settings.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
              <button
                type="button"
                style={{ padding: '10px 16px', background: 'rgba(100,116,139,0.1)', border: '1px solid rgba(100,116,139,0.25)', borderRadius: 8, color: '#94a3b8', fontSize: 12, cursor: 'default' }}
                title="Available in Settings -- AI"
              >
                {UPGRADE_MODELS.good.label}
              </button>
              <button
                type="button"
                style={{ padding: '10px 16px', background: 'rgba(100,116,139,0.1)', border: '1px solid rgba(100,116,139,0.25)', borderRadius: 8, color: '#94a3b8', fontSize: 12, cursor: 'default' }}
                title="Available in Settings -- AI"
              >
                {UPGRADE_MODELS.great.label}
              </button>
            </div>
            <button
              type="button"
              onClick={finishSpine}
              style={{ padding: '12px 28px', background: 'rgba(110,231,183,0.15)', border: '1px solid rgba(110,231,183,0.4)', borderRadius: 8, color: '#6ee7b7', fontWeight: 700, cursor: 'pointer' }}
            >
              Open MnemosyneC
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default Bp067FirstRunSpine;
