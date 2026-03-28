/**
 * OverlayEditor — Transparent submission layer positioned over the target element.
 * Supports text, image, and SVG overlay types with preview toggle.
 */
import { useState, useRef } from 'react';
import { X, Eye, EyeOff, Upload, Type, Code, Send, Image } from 'lucide-react';
import { useSubmitOverlay } from '@/hooks/useDesignDemocracy';
import { useLocation } from 'react-router-dom';

interface OverlayEditorProps {
  elementRef: string;
  rect: DOMRect;
  onClose: () => void;
}

type OverlayType = 'text' | 'image' | 'svg' | 'html';

export function OverlayEditor({ elementRef, rect, onClose }: OverlayEditorProps) {
  const [overlayType, setOverlayType] = useState<OverlayType>('text');
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const submitOverlay = useSubmitOverlay();
  const location = useLocation();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setContent(reader.result as string);
      if (file.type.startsWith('image/svg')) setOverlayType('svg');
      else setOverlayType('image');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    submitOverlay.mutate({
      element_ref: elementRef,
      page_path: location.pathname,
      overlay_type: overlayType,
      overlay_content: content,
    });
    onClose();
  };

  const typeOptions: { type: OverlayType; icon: typeof Type; label: string }[] = [
    { type: 'text', icon: Type, label: 'Text' },
    { type: 'image', icon: Image, label: 'Image' },
    { type: 'svg', icon: Code, label: 'SVG' },
    { type: 'html', icon: Code, label: 'HTML' },
  ];

  return (
    <div
      className="pointer-events-auto"
      style={{
        position: 'fixed',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        minHeight: rect.height,
        zIndex: 10006,
      }}
    >
      {/* Semi-transparent overlay on the target element */}
      {showPreview && content && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.9)',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {overlayType === 'text' && (
            <p style={{ color: '#e2e8f0', fontSize: '0.875rem', padding: '1rem', textAlign: 'center' }}>
              {content}
            </p>
          )}
          {overlayType === 'image' && (
            <img src={content} alt="Overlay preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          )}
          {(overlayType === 'svg' || overlayType === 'html') && (
            <div dangerouslySetInnerHTML={{ __html: content }} style={{ width: '100%', height: '100%' }} />
          )}
        </div>
      )}

      {/* Editor toolbar — docked below the element */}
      <div
        style={{
          position: 'absolute',
          top: rect.height + 8,
          left: 0,
          width: Math.max(rect.width, 340),
          background: 'rgba(15, 23, 42, 0.98)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '0.75rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(245, 158, 11, 0.15)',
          padding: '0.75rem',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(251, 191, 36, 0.95)' }}>
            Submit Overlay — {elementRef}
          </span>
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <button
              onClick={() => setShowPreview(!showPreview)}
              title={showPreview ? 'Hide preview' : 'Show preview'}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                color: showPreview ? 'rgba(34, 211, 238, 0.9)' : 'rgba(148, 163, 184, 0.6)',
              }}
            >
              {showPreview ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
            </button>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'rgba(148, 163, 184, 0.6)' }}
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>

        {/* Type selector */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
          {typeOptions.map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => setOverlayType(type)}
              style={{
                flex: 1,
                padding: '0.3rem',
                background: overlayType === type ? 'rgba(245, 158, 11, 0.2)' : 'rgba(30, 41, 59, 0.6)',
                border: `1px solid ${overlayType === type ? 'rgba(245, 158, 11, 0.5)' : 'rgba(100, 116, 139, 0.2)'}`,
                borderRadius: '0.375rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem',
                color: overlayType === type ? 'rgba(251, 191, 36, 0.9)' : 'rgba(148, 163, 184, 0.6)',
                fontSize: '0.6rem',
                fontWeight: 600,
              }}
            >
              <Icon style={{ width: 10, height: 10 }} />
              {label}
            </button>
          ))}
        </div>

        {/* Content input */}
        {overlayType === 'image' ? (
          <div style={{ marginBottom: '0.5rem' }}>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.svg"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(30, 41, 59, 0.8)',
                border: '2px dashed rgba(100, 116, 139, 0.3)',
                borderRadius: '0.5rem',
                color: 'rgba(148, 163, 184, 0.8)',
                fontSize: '0.7rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
              }}
            >
              <Upload style={{ width: 14, height: 14 }} />
              {content ? 'Change image' : 'Drop or click to upload image/SVG'}
            </button>
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              overlayType === 'text' ? 'Type your replacement text...'
                : overlayType === 'svg' ? '<svg>...</svg>'
                : '<div>Your HTML overlay...</div>'
            }
            rows={4}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(100, 116, 139, 0.3)',
              borderRadius: '0.375rem',
              color: '#e2e8f0',
              fontSize: '0.7rem',
              fontFamily: overlayType === 'text' ? 'inherit' : 'monospace',
              resize: 'vertical',
              outline: 'none',
              marginBottom: '0.5rem',
            }}
          />
        )}

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.6rem', color: 'rgba(52, 211, 153, 0.7)' }}>
            Earn Credits + Marks for approved overlays
          </span>
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || submitOverlay.isPending}
            style={{
              padding: '0.3rem 0.75rem',
              background: content.trim() ? 'rgba(245, 158, 11, 0.25)' : 'rgba(100, 116, 139, 0.1)',
              border: `1px solid ${content.trim() ? 'rgba(245, 158, 11, 0.5)' : 'rgba(100, 116, 139, 0.2)'}`,
              borderRadius: '0.375rem',
              color: content.trim() ? 'rgba(251, 191, 36, 0.95)' : 'rgba(100, 116, 139, 0.4)',
              fontSize: '0.65rem',
              fontWeight: 700,
              cursor: content.trim() ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <Send style={{ width: 10, height: 10 }} />
            {submitOverlay.isPending ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OverlayEditor;
