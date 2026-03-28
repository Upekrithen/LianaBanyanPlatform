/**
 * ThemeEditor — CSS theme creation + live preview in sandboxed iframe.
 * Route: /design/themes/create (ProtectedRoute)
 * Innovation #2012 — CSS Zen Garden-style full-page theme submissions
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, Eye, EyeOff, Send, ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';
import { useSubmitTheme, type PageTheme } from '@/hooks/useDesignDemocracy';

type ThemeScope = PageTheme['scope'];

const CSS_CLASS_REFERENCE = [
  { group: 'Layout', classes: ['.min-h-screen', '.max-w-\\[1200px\\]', '.container'] },
  { group: 'Navigation', classes: ['.sidebar', '.nav-link', '.nav-active'] },
  { group: 'Cards', classes: ['.card', '.card-header', '.card-content', '.card-footer'] },
  { group: 'Typography', classes: ['h1, h2, h3', '.text-primary', '.text-muted'] },
  { group: 'Buttons', classes: ['.btn', '.btn-primary', '.btn-secondary', '.btn-outline'] },
  { group: 'Colors', classes: ['--primary', '--secondary', '--accent', '--background', '--foreground'] },
];

function checkWCAGContrast(css: string): { pass: boolean; warnings: string[] } {
  const warnings: string[] = [];
  const colorPairs = css.match(/color\s*:\s*[^;]+/gi) ?? [];
  const bgPairs = css.match(/background(?:-color)?\s*:\s*[^;]+/gi) ?? [];

  if (colorPairs.length > 0 && bgPairs.length === 0) {
    warnings.push('Setting text color without background color may cause contrast issues.');
  }
  if (css.includes('font-size') && /font-size\s*:\s*(\d+)/i.test(css)) {
    const match = css.match(/font-size\s*:\s*(\d+)/i);
    if (match && parseInt(match[1]) < 12) {
      warnings.push('Font sizes below 12px may fail WCAG AA readability requirements.');
    }
  }
  if (css.includes('display: none') || css.includes('visibility: hidden')) {
    warnings.push('Hiding elements may impact accessibility. Ensure screen readers can still access content.');
  }

  return { pass: warnings.length === 0, warnings };
}

export default function ThemeEditor() {
  const [themeName, setThemeName] = useState('');
  const [cssContent, setCssContent] = useState('/* Your custom CSS theme */\n\n');
  const [scope, setScope] = useState<ThemeScope>('page');
  const [pagePath, setPagePath] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [showReference, setShowReference] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const submitTheme = useSubmitTheme();
  const navigate = useNavigate();

  const contrastCheck = checkWCAGContrast(cssContent);

  const updatePreview = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;

    const doc = iframe.contentDocument;
    let styleEl = doc.getElementById('theme-preview-style');
    if (!styleEl) {
      styleEl = doc.createElement('style');
      styleEl.id = 'theme-preview-style';
      doc.head.appendChild(styleEl);
    }
    styleEl.textContent = cssContent;
  }, [cssContent]);

  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  const handleSubmit = () => {
    if (!themeName.trim() || !cssContent.trim()) return;
    submitTheme.mutate(
      {
        theme_name: themeName,
        css_content: cssContent,
        scope,
        page_path: scope === 'site' ? undefined : pagePath || undefined,
      },
      { onSuccess: () => navigate('/design/themes') }
    );
  };

  return (
    <div
      className="min-h-screen"
      data-xray-id="theme-editor"
      style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)' }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => navigate('/design/themes')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
                padding: '0.25rem',
              }}
            >
              <ArrowLeft style={{ width: 20, height: 20 }} />
            </button>
            <Palette style={{ width: 24, height: 24, color: '#a78bfa' }} />
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#e2e8f0', margin: 0 }}>
              Create Theme
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => setShowReference(!showReference)}
              style={{
                padding: '0.4rem 0.75rem',
                background: showReference ? 'rgba(139, 92, 246, 0.2)' : 'rgba(30, 41, 59, 0.4)',
                border: `1px solid ${showReference ? 'rgba(139, 92, 246, 0.4)' : 'rgba(100, 116, 139, 0.15)'}`,
                borderRadius: '0.375rem',
                color: showReference ? '#c4b5fd' : '#94a3b8',
                fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              CSS Reference
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              style={{
                padding: '0.4rem 0.75rem',
                background: showPreview ? 'rgba(34, 211, 238, 0.15)' : 'rgba(30, 41, 59, 0.4)',
                border: `1px solid ${showPreview ? 'rgba(34, 211, 238, 0.3)' : 'rgba(100, 116, 139, 0.15)'}`,
                borderRadius: '0.375rem',
                color: showPreview ? '#67e8f9' : '#94a3b8',
                fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.25rem',
              }}
            >
              {showPreview ? <EyeOff style={{ width: 12, height: 12 }} /> : <Eye style={{ width: 12, height: 12 }} />}
              Preview
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: showPreview ? '1fr 1fr' : '1fr', gap: '1rem' }}>
          {/* Left: Editor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Theme name + metadata */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                placeholder="Theme name..."
                style={{
                  flex: 1,
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(100, 116, 139, 0.2)',
                  borderRadius: '0.5rem',
                  color: '#e2e8f0',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as ThemeScope)}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(100, 116, 139, 0.2)',
                  borderRadius: '0.5rem',
                  color: '#e2e8f0',
                  fontSize: '0.75rem',
                  outline: 'none',
                }}
              >
                <option value="element">Element</option>
                <option value="page">Page</option>
                <option value="site">Site-wide</option>
              </select>
            </div>

            {scope !== 'site' && (
              <input
                value={pagePath}
                onChange={(e) => setPagePath(e.target.value)}
                placeholder="Page path (e.g. /dashboard)..."
                style={{
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(100, 116, 139, 0.2)',
                  borderRadius: '0.5rem',
                  color: '#e2e8f0',
                  fontSize: '0.75rem',
                  outline: 'none',
                }}
              />
            )}

            {/* CSS Reference panel */}
            {showReference && (
              <div
                style={{
                  background: 'rgba(30, 41, 59, 0.4)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  borderRadius: '0.5rem',
                  padding: '0.6rem',
                  maxHeight: '200px',
                  overflowY: 'auto',
                }}
              >
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Available CSS Classes
                </span>
                {CSS_CLASS_REFERENCE.map((group) => (
                  <div key={group.group} style={{ marginTop: '0.35rem' }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#94a3b8' }}>{group.group}</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.15rem' }}>
                      {group.classes.map((cls) => (
                        <code
                          key={cls}
                          style={{
                            fontSize: '0.55rem',
                            padding: '0.1rem 0.3rem',
                            background: 'rgba(139, 92, 246, 0.1)',
                            border: '1px solid rgba(139, 92, 246, 0.15)',
                            borderRadius: '0.2rem',
                            color: '#c4b5fd',
                            cursor: 'pointer',
                          }}
                          onClick={() => setCssContent((prev) => prev + `\n${cls} {\n  \n}\n`)}
                        >
                          {cls}
                        </code>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CSS textarea */}
            <textarea
              value={cssContent}
              onChange={(e) => setCssContent(e.target.value)}
              spellCheck={false}
              style={{
                flex: 1,
                minHeight: '400px',
                padding: '0.75rem',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(100, 116, 139, 0.2)',
                borderRadius: '0.5rem',
                color: '#a5f3fc',
                fontSize: '0.75rem',
                fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", monospace',
                lineHeight: 1.6,
                resize: 'vertical',
                outline: 'none',
                tabSize: 2,
              }}
            />

            {/* WCAG warnings */}
            {!contrastCheck.pass && (
              <div
                style={{
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                  <AlertTriangle style={{ width: 12, height: 12, color: '#fbbf24' }} />
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#fbbf24' }}>
                    Accessibility Warnings
                  </span>
                </div>
                {contrastCheck.warnings.map((w, i) => (
                  <p key={i} style={{ fontSize: '0.6rem', color: '#d97706', margin: '0.1rem 0' }}>
                    • {w}
                  </p>
                ))}
              </div>
            )}

            {contrastCheck.pass && cssContent.length > 30 && (
              <div
                style={{
                  padding: '0.4rem 0.75rem',
                  background: 'rgba(34, 197, 94, 0.06)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  borderRadius: '0.5rem',
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                }}
              >
                <CheckCircle style={{ width: 12, height: 12, color: '#4ade80' }} />
                <span style={{ fontSize: '0.6rem', color: '#4ade80', fontWeight: 600 }}>
                  Passes basic accessibility checks
                </span>
              </div>
            )}

            {/* Submit */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.6rem', color: '#64748b' }}>
                Themes are reviewed before going live. Earn Marks for featured themes.
              </span>
              <button
                onClick={handleSubmit}
                disabled={!themeName.trim() || !cssContent.trim() || submitTheme.isPending}
                style={{
                  padding: '0.5rem 1.25rem',
                  background: themeName.trim() && cssContent.trim()
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(168, 85, 247, 0.2))'
                    : 'rgba(100, 116, 139, 0.1)',
                  border: `1px solid ${themeName.trim() && cssContent.trim() ? 'rgba(139, 92, 246, 0.5)' : 'rgba(100, 116, 139, 0.2)'}`,
                  borderRadius: '0.5rem',
                  color: themeName.trim() && cssContent.trim() ? '#c4b5fd' : '#475569',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: themeName.trim() && cssContent.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                }}
              >
                <Send style={{ width: 14, height: 14 }} />
                {submitTheme.isPending ? 'Submitting...' : 'Submit for Review'}
              </button>
            </div>
          </div>

          {/* Right: Live preview iframe */}
          {showPreview && (
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid rgba(100, 116, 139, 0.15)',
                borderRadius: '0.75rem',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '0.4rem 0.75rem',
                  background: 'rgba(30, 41, 59, 0.6)',
                  borderBottom: '1px solid rgba(100, 116, 139, 0.1)',
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                }}
              >
                <Eye style={{ width: 12, height: 12, color: '#64748b' }} />
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8' }}>
                  Live Preview (sandboxed)
                </span>
              </div>
              <iframe
                ref={iframeRef}
                title="Theme Preview"
                sandbox="allow-same-origin"
                srcDoc={`<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; padding: 1.5rem; margin: 0; }
    h1 { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem; }
    h2 { font-size: 1rem; font-weight: 700; color: #94a3b8; margin-bottom: 1rem; }
    .card { background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(100, 116, 139, 0.15); border-radius: 0.75rem; padding: 1rem; margin-bottom: 1rem; }
    .card-header { font-weight: 700; font-size: 0.85rem; margin-bottom: 0.5rem; }
    .card-content { font-size: 0.8rem; color: #94a3b8; }
    .btn { padding: 0.4rem 0.8rem; border-radius: 0.375rem; font-size: 0.75rem; font-weight: 600; cursor: pointer; border: none; }
    .btn-primary { background: rgba(139, 92, 246, 0.3); color: #c4b5fd; }
    .btn-secondary { background: rgba(34, 211, 238, 0.15); color: #67e8f9; }
    .btn-outline { background: transparent; border: 1px solid rgba(100, 116, 139, 0.3); color: #94a3b8; }
    .text-primary { color: #a78bfa; }
    .text-muted { color: #64748b; }
    .nav-link { display: inline-block; padding: 0.3rem 0.6rem; color: #94a3b8; text-decoration: none; font-size: 0.75rem; }
    .nav-active { color: #a78bfa; border-bottom: 2px solid #a78bfa; }
    .badge { display: inline-block; padding: 0.15rem 0.4rem; border-radius: 9999px; font-size: 0.6rem; font-weight: 600; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  </style>
  <style id="theme-preview-style"></style>
</head>
<body>
  <h1>Theme Preview</h1>
  <h2>How your CSS will look on the platform</h2>
  <nav style="margin-bottom: 1rem; border-bottom: 1px solid rgba(100,116,139,0.15); padding-bottom: 0.5rem;">
    <a class="nav-link nav-active" href="#">Dashboard</a>
    <a class="nav-link" href="#">Projects</a>
    <a class="nav-link" href="#">Settings</a>
  </nav>
  <div class="grid">
    <div class="card">
      <div class="card-header">Sample Card</div>
      <div class="card-content">This represents a typical platform card component with content inside.</div>
      <div style="margin-top: 0.75rem; display: flex; gap: 0.5rem;">
        <button class="btn btn-primary">Primary</button>
        <button class="btn btn-secondary">Secondary</button>
        <button class="btn btn-outline">Outline</button>
      </div>
    </div>
    <div class="card">
      <div class="card-header">Statistics</div>
      <div class="card-content">
        <span class="text-primary" style="font-size: 1.5rem; font-weight: 800;">42</span>
        <span class="text-muted" style="font-size: 0.75rem;"> total items</span>
      </div>
      <div style="margin-top: 0.5rem;">
        <span class="badge" style="background: rgba(34, 197, 94, 0.15); color: #4ade80;">Active</span>
        <span class="badge" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; margin-left: 0.25rem;">Pending</span>
      </div>
    </div>
  </div>
  <div class="card" style="margin-top: 0.75rem;">
    <div class="card-header">Typography</div>
    <div class="card-content">
      <p class="text-primary" style="margin: 0.25rem 0;">Primary colored text</p>
      <p class="text-muted" style="margin: 0.25rem 0;">Muted secondary text</p>
      <p style="margin: 0.25rem 0;">Regular body text with standard contrast</p>
    </div>
  </div>
</body>
</html>`}
                style={{ width: '100%', height: '600px', border: 'none' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
