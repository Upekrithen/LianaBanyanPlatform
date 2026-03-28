/**
 * ThemeGallery — Community theme browsing, voting, and application.
 * Route: /design/themes (ExplorerRoute)
 * Innovation #2012 — CSS Zen Garden-style full-page theme submissions
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Palette, Plus, ThumbsUp, ThumbsDown, Eye, Check, Award, Filter, Globe, FileText, Users, User } from 'lucide-react';
import {
  useThemeGallery,
  useDesignVote,
  useMyVotes,
  useSetThemePreference,
  useMyThemePreference,
  type PageTheme,
} from '@/hooks/useDesignDemocracy';
import { useAuth } from '@/contexts/AuthContext';

type ScopeFilter = 'all' | 'site' | 'page' | 'element';

const scopeFilterOptions: { value: ScopeFilter; label: string; icon: typeof Globe }[] = [
  { value: 'all', label: 'All', icon: Filter },
  { value: 'site', label: 'Site-wide', icon: Globe },
  { value: 'page', label: 'Per Page', icon: FileText },
  { value: 'element', label: 'Elements', icon: Users },
];

function ThemeCard({
  theme,
  myVote,
  isActive,
  onVote,
  onApply,
}: {
  theme: PageTheme;
  myVote?: number;
  isActive: boolean;
  onVote: (id: string, vote: -1 | 1) => void;
  onApply: (id: string) => void;
}) {
  return (
    <div
      className="group"
      style={{
        background: 'rgba(15, 23, 42, 0.6)',
        border: `1px solid ${isActive ? 'rgba(34, 197, 94, 0.5)' : theme.status === 'featured' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(100, 116, 139, 0.15)'}`,
        borderRadius: '0.75rem',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Preview image or placeholder */}
      <div
        style={{
          height: '140px',
          background: theme.preview_screenshot
            ? `url(${theme.preview_screenshot}) center/cover`
            : 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.08))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {!theme.preview_screenshot && (
          <Palette style={{ width: 32, height: 32, color: 'rgba(148, 163, 184, 0.3)' }} />
        )}
        {isActive && (
          <div
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'rgba(34, 197, 94, 0.9)',
              borderRadius: '9999px',
              padding: '0.15rem 0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <Check style={{ width: 10, height: 10, color: '#fff' }} />
            <span style={{ fontSize: '0.55rem', fontWeight: 700, color: '#fff' }}>Active</span>
          </div>
        )}
        {theme.status === 'featured' && (
          <div
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              background: 'rgba(245, 158, 11, 0.9)',
              borderRadius: '9999px',
              padding: '0.15rem 0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <Award style={{ width: 10, height: 10, color: '#fff' }} />
            <span style={{ fontSize: '0.55rem', fontWeight: 700, color: '#fff' }}>Featured</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
          <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>
            {theme.theme_name}
          </h3>
          <span
            style={{
              fontSize: '0.5rem',
              fontWeight: 600,
              color: theme.scope === 'site' ? '#a78bfa' : theme.scope === 'page' ? '#60a5fa' : '#94a3b8',
              background: theme.scope === 'site' ? 'rgba(167, 139, 250, 0.1)' : theme.scope === 'page' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(148, 163, 184, 0.1)',
              padding: '0.1rem 0.35rem',
              borderRadius: '9999px',
              textTransform: 'uppercase',
            }}
          >
            {theme.scope}
          </span>
        </div>

        {theme.page_path && (
          <p style={{ fontSize: '0.6rem', color: '#64748b', margin: '0 0 0.35rem 0' }}>
            Page: {theme.page_path}
          </p>
        )}

        {/* Vote + Apply row */}
        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
          <button
            onClick={() => onVote(theme.id, 1)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.2rem',
              padding: '0.2rem 0.4rem',
              background: myVote === 1 ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
              border: `1px solid ${myVote === 1 ? 'rgba(34, 197, 94, 0.4)' : 'rgba(100, 116, 139, 0.15)'}`,
              borderRadius: '0.25rem',
              color: myVote === 1 ? '#4ade80' : '#64748b',
              fontSize: '0.6rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            <ThumbsUp style={{ width: 10, height: 10 }} />
            {theme.upvotes}
          </button>
          <button
            onClick={() => onVote(theme.id, -1)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.2rem',
              padding: '0.2rem 0.4rem',
              background: myVote === -1 ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
              border: `1px solid ${myVote === -1 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(100, 116, 139, 0.15)'}`,
              borderRadius: '0.25rem',
              color: myVote === -1 ? '#f87171' : '#64748b',
              fontSize: '0.6rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            <ThumbsDown style={{ width: 10, height: 10 }} />
            {theme.downvotes}
          </button>

          <button
            onClick={() => onApply(theme.id)}
            style={{
              marginLeft: 'auto',
              padding: '0.2rem 0.5rem',
              background: isActive ? 'rgba(100, 116, 139, 0.1)' : 'rgba(34, 211, 238, 0.15)',
              border: `1px solid ${isActive ? 'rgba(100, 116, 139, 0.2)' : 'rgba(34, 211, 238, 0.3)'}`,
              borderRadius: '0.25rem',
              color: isActive ? '#64748b' : '#67e8f9',
              fontSize: '0.6rem', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.25rem',
            }}
          >
            {isActive ? (
              <><Check style={{ width: 10, height: 10 }} /> Applied</>
            ) : (
              <><Eye style={{ width: 10, height: 10 }} /> Apply</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ThemeGallery() {
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all');
  const { user } = useAuth();

  const filter = scopeFilter === 'all' ? undefined : { scope: scopeFilter };
  const { data: themes = [], isLoading } = useThemeGallery(filter);
  const voteMutation = useDesignVote();
  const setPreference = useSetThemePreference();
  const { data: myPref } = useMyThemePreference('personal');
  const ids = themes.map((t) => t.id);
  const { data: myVotes = {} } = useMyVotes('page_theme', ids);

  const handleVote = (themeId: string, vote: -1 | 1) => {
    voteMutation.mutate({ voteable_type: 'page_theme', voteable_id: themeId, vote });
  };

  const handleApply = (themeId: string) => {
    setPreference.mutate({ scope: 'personal', active_theme_id: themeId });
  };

  return (
    <div
      className="min-h-screen"
      data-xray-id="theme-gallery"
      style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)' }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Palette style={{ width: 28, height: 28, color: '#a78bfa' }} />
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#e2e8f0', margin: 0 }}>
                Design Democracy
              </h1>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, maxWidth: '500px' }}>
              Community-crafted themes for the platform. Vote for the designs you love,
              submit your own, and shape how Liana Banyan looks and feels.
            </p>
          </div>
          {user && (
            <Link
              to="/design/themes/create"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(168, 85, 247, 0.2))',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                borderRadius: '0.5rem',
                color: '#c4b5fd',
                fontSize: '0.8rem',
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <Plus style={{ width: 16, height: 16 }} />
              Submit Theme
            </Link>
          )}
        </div>

        {/* Scope filter */}
        <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.5rem' }}>
          {scopeFilterOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setScopeFilter(value)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                padding: '0.35rem 0.75rem',
                background: scopeFilter === value ? 'rgba(139, 92, 246, 0.2)' : 'rgba(30, 41, 59, 0.4)',
                border: `1px solid ${scopeFilter === value ? 'rgba(139, 92, 246, 0.4)' : 'rgba(100, 116, 139, 0.15)'}`,
                borderRadius: '0.375rem',
                color: scopeFilter === value ? '#c4b5fd' : '#94a3b8',
                fontSize: '0.7rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Icon style={{ width: 12, height: 12 }} />
              {label}
            </button>
          ))}
        </div>

        {/* Current theme indicator */}
        {myPref?.active_theme && (
          <div
            style={{
              marginBottom: '1.5rem',
              padding: '0.6rem 0.75rem',
              background: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <User style={{ width: 14, height: 14, color: '#4ade80' }} />
            <span style={{ fontSize: '0.7rem', color: '#4ade80', fontWeight: 600 }}>
              Active Theme: {myPref.active_theme.theme_name}
            </span>
            <button
              onClick={() => setPreference.mutate({ scope: 'personal', active_theme_id: null })}
              style={{
                marginLeft: 'auto',
                padding: '0.2rem 0.5rem',
                background: 'rgba(100, 116, 139, 0.1)',
                border: '1px solid rgba(100, 116, 139, 0.2)',
                borderRadius: '0.25rem',
                color: '#94a3b8',
                fontSize: '0.6rem',
                cursor: 'pointer',
              }}
            >
              Reset to Default
            </button>
          </div>
        )}

        {/* Theme grid */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Loading themes...
          </div>
        ) : themes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Palette style={{ width: 48, height: 48, color: 'rgba(148, 163, 184, 0.2)', margin: '0 auto 1rem' }} />
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
              No themes yet. Be the first to submit one!
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1rem',
            }}
          >
            {themes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                myVote={myVotes[theme.id]}
                isActive={myPref?.active_theme_id === theme.id}
                onVote={handleVote}
                onApply={handleApply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
