/**
 * FeedbackCategoryDropdown — Dropdown for X-Ray Goggles feedback.
 * Uses inline styles since XRayOverlay renders via createPortal to document.body.
 */

const CATEGORIES = [
  { value: 'design', label: 'Design change' },
  { value: 'content', label: 'Content change' },
  { value: 'wording', label: 'Wording change' },
  { value: 'placement', label: 'Placement change' },
  { value: 'broken', label: 'Broken element' },
  { value: 'unexpected', label: 'Not what I expected' },
  { value: 'future', label: 'Future improvement' },
  { value: 'link', label: 'Link to another site' },
  { value: 'example', label: 'Use an example like this page' },
] as const;

interface FeedbackCategoryDropdownProps {
  selectedCategory: string | null;
  onSelect: (category: string) => void;
}

export function FeedbackCategoryDropdown({ selectedCategory, onSelect }: FeedbackCategoryDropdownProps) {
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <label
        style={{
          fontSize: '0.65rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'rgba(148, 163, 184, 0.8)',
          marginBottom: '0.25rem',
          display: 'block',
        }}
      >
        What kind of feedback?
      </label>
      <select
        value={selectedCategory || ''}
        onChange={(e) => onSelect(e.target.value)}
        style={{
          width: '100%',
          padding: '0.35rem 0.5rem',
          fontSize: '0.75rem',
          background: 'rgba(30, 41, 59, 0.9)',
          border: '1px solid rgba(100, 116, 139, 0.3)',
          borderRadius: '0.25rem',
          color: selectedCategory ? 'rgba(34, 211, 238, 0.9)' : 'rgba(148, 163, 184, 0.6)',
          outline: 'none',
          cursor: 'pointer',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.5)'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.3)'; }}
      >
        <option value="" disabled>Select a category...</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.value} value={cat.value} style={{ background: '#1e293b', color: '#e2e8f0' }}>
            {cat.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export { CATEGORIES as FEEDBACK_CATEGORIES };
export default FeedbackCategoryDropdown;
