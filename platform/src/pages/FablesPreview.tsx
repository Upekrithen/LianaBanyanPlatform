/**
 * FablesPreview -- Temporary Founder review surface.
 * Route: /fables-preview (public, no auth gate, no platform nav).
 * Renders all discovered Fable implementations side-by-side in tabs
 * so the Founder can pick the canonical one for the HEOHO card back face.
 *
 * Tab 1: FableFlipbook         -- 26 hand-drawn hen PNGs (/fabled/hen1-26.png)
 * Tab 2: WatchFable            -- 30 text+image slides (/fable/1-30.png)
 * Tab 3: LemonadeStandFlipbook -- 14 scenes (8 goat + 6 epilogue/stage)
 * Tab 4: OriginStoryFlipbook   -- 12 concept JPEGs (/origin-story/)
 * Tab 5: Planting Epilogue     -- 6 stage PNGs in isolation (standalone evaluation)
 *
 * READONLY: no existing Fable components were modified.
 */
import { useState } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { FableFlipbook } from '@/components/FableFlipbook';
import { LemonadeStandFlipbook } from '@/components/LemonadeStandFlipbook';
import { OriginStoryFlipbook } from '@/components/OriginStoryFlipbook';
import WatchFable from '@/pages/museum/WatchFable';

// ---------------------------------------------------------------------------
// Tab metadata -- shown above each fable renderer
// ---------------------------------------------------------------------------

interface TabMeta {
  label: string;
  componentName: string;
  componentFile: string;
  imageAssets: string;
  captionSource: 'inline' | 'fableArcData.ts';
  imageCount: number;
  note?: string;
}

const TAB_META: TabMeta[] = [
  {
    label: 'Tab 1: FableFlipbook',
    componentName: 'FableFlipbook',
    componentFile: 'platform/src/components/FableFlipbook.tsx',
    imageAssets: 'platform/public/fabled/hen1.png ... hen26.png (26 hand-drawn hen PNGs, son canonical art)',
    captionSource: 'inline',
    imageCount: 26,
    note: 'Currently wired to the HEOHO card back face.',
  },
  {
    label: 'Tab 2: WatchFable',
    componentName: 'WatchFable',
    componentFile: 'platform/src/pages/museum/WatchFable.tsx',
    imageAssets: 'platform/public/fable/1.png ... 30.png (30 slides)',
    captionSource: 'inline',
    imageCount: 30,
    note: 'Full-page component with MuseumShell + DeckCardShell. URL changes to /watch while this tab is active (window.history.replaceState -- harmless). MuseumShell FABs (LRH + Cephas) appear below.',
  },
  {
    label: 'Tab 3: LemonadeStandFlipbook',
    componentName: 'LemonadeStandFlipbook',
    componentFile: 'platform/src/components/LemonadeStandFlipbook.tsx',
    imageAssets:
      'platform/public/images/Lemonade Stand/goat (1).png ... goat (8).png + platform/public/images/stage1.png ... stage6.png (epilogue)',
    captionSource: 'inline',
    imageCount: 14,
    note: 'Scenes 9-14 are the planting epilogue (same stage1-6 images as Tab 5, but shown in sequence after the goat story).',
  },
  {
    label: 'Tab 4: OriginStoryFlipbook',
    componentName: 'OriginStoryFlipbook',
    componentFile: 'platform/src/components/OriginStoryFlipbook.tsx',
    imageAssets:
      'platform/public/origin-story/concept_01_idea.jpg ... concept_12_legacy.jpg (12 seed-grows-to-banyan JPEGs)',
    captionSource: 'inline',
    imageCount: 12,
    note: 'Mounted in Index.tsx. Story arc: idea -> planting -> growing -> banyan forest -> cycle begins again.',
  },
  {
    label: 'Tab 5: Planting Epilogue',
    componentName: '(none -- inline render)',
    componentFile: 'platform/public/images/stage1.png ... stage6.png (6 separate files, confirmed on disk)',
    imageAssets: 'platform/public/images/stage1.png ... stage6.png',
    captionSource: 'inline',
    imageCount: 6,
    note: 'No separate planting fable component found. Rendering stage1-6 in isolation with LemonadeStandFlipbook epilogue captions for standalone evaluation.',
  },
];

// Epilogue data for Tab 5 standalone render
const PLANTING_PANELS = [
  { img: '/images/stage1.png', caption: 'And so the seeds were planted.' },
  { img: '/images/stage2.png', caption: 'One by one, they grew.' },
  { img: '/images/stage3.png', caption: 'Each one reaching for light.' },
  { img: '/images/stage4.png', caption: 'The first trees sheltered the next.' },
  { img: '/images/stage5.png', caption: 'Roots became trunks. Trunks became forest.' },
  { img: '/images/stage6.png', caption: 'One seed. One forest. Everyone fed.' },
];

// ---------------------------------------------------------------------------
// Planting Epilogue strip (Tab 5 standalone)
// ---------------------------------------------------------------------------

function PlantingEpilogueStrip() {
  const [activePanel, setActivePanel] = useState(0);

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      {/* Main image */}
      <div
        style={{
          background: 'linear-gradient(to bottom, #d1fae5, #fef3c7)',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '6px solid #6b7280',
          aspectRatio: '4/3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <img
          src={PLANTING_PANELS[activePanel].img}
          alt={PLANTING_PANELS[activePanel].caption}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>

      {/* Caption */}
      <p
        style={{
          textAlign: 'center',
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
          fontSize: '1.1rem',
          color: '#d1fae5',
          marginTop: '16px',
          minHeight: '2rem',
        }}
      >
        {PLANTING_PANELS[activePanel].caption}
      </p>

      {/* Panel counter */}
      <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.8rem', marginTop: '4px' }}>
        {activePanel + 1} / {PLANTING_PANELS.length}
      </p>

      {/* Dot nav */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '12px' }}>
        {PLANTING_PANELS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActivePanel(i)}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              background: i === activePanel ? '#6ee7b7' : '#374151',
              transform: i === activePanel ? 'scale(1.25)' : 'scale(1)',
              transition: 'all 0.2s',
            }}
            title={`Panel ${i + 1}`}
          />
        ))}
      </div>

      {/* Prev / Next */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px' }}>
        <button
          onClick={() => setActivePanel((p) => Math.max(0, p - 1))}
          disabled={activePanel === 0}
          style={{
            padding: '8px 20px',
            borderRadius: '8px',
            border: '1px solid #374151',
            background: 'transparent',
            color: activePanel === 0 ? '#374151' : '#d1d5db',
            cursor: activePanel === 0 ? 'not-allowed' : 'pointer',
            fontSize: '0.85rem',
          }}
        >
          Prev
        </button>
        <button
          onClick={() => setActivePanel((p) => Math.min(PLANTING_PANELS.length - 1, p + 1))}
          disabled={activePanel === PLANTING_PANELS.length - 1}
          style={{
            padding: '8px 20px',
            borderRadius: '8px',
            border: '1px solid #374151',
            background: 'transparent',
            color: activePanel === PLANTING_PANELS.length - 1 ? '#374151' : '#d1d5db',
            cursor: activePanel === PLANTING_PANELS.length - 1 ? 'not-allowed' : 'pointer',
            fontSize: '0.85rem',
          }}
        >
          Next
        </button>
      </div>

      {/* All panels strip */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginTop: '24px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {PLANTING_PANELS.map((panel, i) => (
          <button
            key={i}
            onClick={() => setActivePanel(i)}
            style={{
              padding: 0,
              border: i === activePanel ? '3px solid #6ee7b7' : '3px solid #374151',
              borderRadius: '8px',
              overflow: 'hidden',
              cursor: 'pointer',
              background: '#1c2a1c',
              transition: 'border-color 0.2s',
            }}
            title={panel.caption}
          >
            <img
              src={panel.img}
              alt={`Stage ${i + 1}`}
              style={{ width: '90px', height: '68px', objectFit: 'contain', display: 'block' }}
            />
            <p
              style={{
                fontSize: '0.6rem',
                color: '#9ca3af',
                margin: '4px',
                textAlign: 'center',
                fontFamily: 'Georgia, serif',
              }}
            >
              stage{i + 1}.png
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Metadata card shown above each tab's renderer
// ---------------------------------------------------------------------------

function TabMetaCard({ meta }: { meta: TabMeta }) {
  return (
    <div
      style={{
        background: '#111827',
        border: '1px solid #374151',
        borderRadius: '8px',
        padding: '14px 18px',
        marginBottom: '24px',
        fontSize: '0.82rem',
        lineHeight: '1.7',
        color: '#d1d5db',
      }}
    >
      <div>
        <span style={{ color: '#9ca3af' }}>Component: </span>
        <span style={{ color: '#e5e7eb', fontFamily: 'monospace' }}>{meta.componentName}</span>
      </div>
      <div>
        <span style={{ color: '#9ca3af' }}>File: </span>
        <span style={{ color: '#93c5fd', fontFamily: 'monospace' }}>{meta.componentFile}</span>
      </div>
      <div>
        <span style={{ color: '#9ca3af' }}>Images: </span>
        <span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{meta.imageAssets}</span>
      </div>
      <div>
        <span style={{ color: '#9ca3af' }}>Caption source: </span>
        <span style={{ color: '#fde68a' }}>{meta.captionSource}</span>
      </div>
      <div>
        <span style={{ color: '#9ca3af' }}>Image count: </span>
        <span style={{ color: '#a7f3d0', fontWeight: 600 }}>{meta.imageCount}</span>
      </div>
      {meta.note && (
        <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #1f2937', color: '#6b7280', fontStyle: 'italic' }}>
          {meta.note}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function FablesPreview() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#f9fafb',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Page header */}
      <div
        style={{
          borderBottom: '1px solid #1f2937',
          padding: '20px 24px',
          background: '#111',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#f9fafb' }}>
          Fables Preview
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
          Founder review surface -- click through all five fable implementations and pick the canonical one for the HEOHO card back face.
          No auth gate. Temporary route at /fables-preview.
        </p>
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          padding: '12px 16px',
          background: '#111',
          borderBottom: '2px solid #1f2937',
          overflowX: 'auto',
          flexWrap: 'nowrap',
        }}
      >
        {TAB_META.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontSize: '0.82rem',
              fontWeight: activeTab === i ? 700 : 400,
              background: activeTab === i ? '#1d4ed8' : '#1f2937',
              color: activeTab === i ? '#ffffff' : '#9ca3af',
              transition: 'all 0.15s',
              outline: 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content area */}
      <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
        <TabMetaCard meta={TAB_META[activeTab]} />

        {/* Tab 1: FableFlipbook */}
        {activeTab === 0 && (
          <ErrorBoundary>
            <FableFlipbook autoPlay={false} showControls={true} />
          </ErrorBoundary>
        )}

        {/* Tab 2: WatchFable -- full-page component; mounts only when active */}
        {activeTab === 1 && (
          <ErrorBoundary>
            {/* WatchFable renders DeckCardShell -> MuseumShell internally.
                URL changes to /watch while this tab is active (window.history.replaceState).
                MuseumShell adds LRH + Cephas FABs to the page while mounted. */}
            <WatchFable />
          </ErrorBoundary>
        )}

        {/* Tab 3: LemonadeStandFlipbook */}
        {activeTab === 2 && (
          <ErrorBoundary>
            <LemonadeStandFlipbook autoPlay={false} showControls={true} />
          </ErrorBoundary>
        )}

        {/* Tab 4: OriginStoryFlipbook */}
        {activeTab === 3 && (
          <ErrorBoundary>
            <OriginStoryFlipbook autoPlay={false} showControls={true} />
          </ErrorBoundary>
        )}

        {/* Tab 5: Planting Epilogue -- standalone render, no component */}
        {activeTab === 4 && <PlantingEpilogueStrip />}
      </div>
    </div>
  );
}
