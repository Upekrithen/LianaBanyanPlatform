/**
 * ChalkOutlineOnboarding — "Fill in the chalk outline" project creation overlay
 *
 * UX Pattern:
 * - Displays a translucent overlay on top of the actual project detail page
 * - Each field/section has a white chalk-style dashed border
 * - As the user fills in a field, that section:
 *   1. "Solidifies" — becomes opaque with their content
 *   2. Shows the actual page section beneath, now populated
 *   3. Chalk border changes from white dashed to colored solid
 * - Undo lock at top of each completed section reverts it to editable
 * - Save state persists to localStorage (resume later)
 * - "Launch" button with confirmation dialog
 *
 * Think: coloring book where the lines are already drawn and you fill them in
 */

import { useState, useCallback, useEffect } from 'react';
import { Lock, Unlock, Save, Rocket, Check, AlertTriangle, X, Eye, EyeOff } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface ChalkField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'image' | 'price' | 'select' | 'tags' | 'rich-text';
  placeholder: string;
  required: boolean;
  section: string; // Groups fields visually
  hint?: string;
  options?: string[]; // For select type
  maxLength?: number;
}

interface ChalkFieldState {
  value: string;
  completed: boolean;
  locked: boolean;
}

interface ChalkOutlineOnboardingProps {
  projectId: string; // Unique ID for save state
  fields: ChalkField[];
  onSave: (data: Record<string, string>) => void;
  onLaunch: (data: Record<string, string>) => void;
  onClose: () => void;
  previewComponent?: React.ReactNode; // The actual page shown underneath
  title?: string;
  subtitle?: string;
}

// ═══════════════════════════════════════════════════════════════════
// SECTION COLORS — each section gets a unique color when completed
// ═══════════════════════════════════════════════════════════════════
const SECTION_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  'basics': { border: '#38a169', bg: 'rgba(56, 161, 105, 0.95)', text: '#faf5eb' },
  'details': { border: '#3182ce', bg: 'rgba(49, 130, 206, 0.95)', text: '#faf5eb' },
  'media': { border: '#d69e2e', bg: 'rgba(214, 158, 46, 0.95)', text: '#0a1628' },
  'pricing': { border: '#805ad5', bg: 'rgba(128, 90, 213, 0.95)', text: '#faf5eb' },
  'shipping': { border: '#dd6b20', bg: 'rgba(221, 107, 32, 0.95)', text: '#faf5eb' },
  'tags': { border: '#e53e3e', bg: 'rgba(229, 62, 62, 0.95)', text: '#faf5eb' },
  'default': { border: '#718096', bg: 'rgba(113, 128, 150, 0.95)', text: '#faf5eb' },
};

const getSectionColor = (section: string) => SECTION_COLORS[section] || SECTION_COLORS['default'];

// ═══════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════

export function ChalkOutlineOnboarding({
  projectId,
  fields,
  onSave,
  onLaunch,
  onClose,
  previewComponent,
  title = 'Create Your Project',
  subtitle = 'Fill in the chalk outlines to bring your project to life',
}: ChalkOutlineOnboardingProps) {
  // ═════════ STATE ═════════
  const [fieldStates, setFieldStates] = useState<Record<string, ChalkFieldState>>(() => {
    // Load saved state from localStorage
    const saved = localStorage.getItem(`chalk-onboard-${projectId}`);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    // Initialize all fields as empty
    const initial: Record<string, ChalkFieldState> = {};
    fields.forEach(f => {
      initial[f.id] = { value: '', completed: false, locked: false };
    });
    return initial;
  });

  const [showLaunchConfirm, setShowLaunchConfirm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // ═════════ PERSISTENCE ═════════
  useEffect(() => {
    localStorage.setItem(`chalk-onboard-${projectId}`, JSON.stringify(fieldStates));
  }, [fieldStates, projectId]);

  // ═════════ FIELD ACTIONS ═════════
  const updateField = useCallback((fieldId: string, value: string) => {
    setFieldStates(prev => ({
      ...prev,
      [fieldId]: { ...prev[fieldId], value, completed: value.trim().length > 0 },
    }));
  }, []);

  const lockField = useCallback((fieldId: string) => {
    setFieldStates(prev => ({
      ...prev,
      [fieldId]: { ...prev[fieldId], locked: true },
    }));
  }, []);

  const unlockField = useCallback((fieldId: string) => {
    setFieldStates(prev => ({
      ...prev,
      [fieldId]: { ...prev[fieldId], locked: false },
    }));
  }, []);

  const handleSave = useCallback(() => {
    const data: Record<string, string> = {};
    Object.entries(fieldStates).forEach(([key, state]) => {
      data[key] = state.value;
    });
    onSave(data);
    setLastSaved(new Date().toLocaleTimeString());
  }, [fieldStates, onSave]);

  const handleLaunch = useCallback(() => {
    const data: Record<string, string> = {};
    Object.entries(fieldStates).forEach(([key, state]) => {
      data[key] = state.value;
    });
    onLaunch(data);
    setShowLaunchConfirm(false);
  }, [fieldStates, onLaunch]);

  // ═════════ COMPUTED ═════════
  const completedCount = Object.values(fieldStates).filter(s => s.completed).length;
  const requiredFields = fields.filter(f => f.required);
  const requiredComplete = requiredFields.filter(f => fieldStates[f.id]?.completed).length;
  const allRequiredDone = requiredComplete === requiredFields.length;
  const progressPercent = fields.length > 0 ? Math.round((completedCount / fields.length) * 100) : 0;

  // Group fields by section
  const sections = fields.reduce<Record<string, ChalkField[]>>((acc, field) => {
    if (!acc[field.section]) acc[field.section] = [];
    acc[field.section].push(field);
    return acc;
  }, {});

  // ═════════ RENDER ═════════
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(10, 22, 40, 0.85)',
        backdropFilter: 'blur(4px)',
        overflow: 'auto',
      }}
    >
      {/* ═══ TOP BAR ═══ */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1.5rem',
        background: 'rgba(10, 22, 40, 0.95)',
        borderBottom: '1px solid rgba(250, 245, 235, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div>
          <h2 style={{ color: '#faf5eb', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{title}</h2>
          <p style={{ color: 'rgba(250, 245, 235, 0.5)', fontSize: '0.75rem', margin: 0 }}>{subtitle}</p>
        </div>

        {/* Progress bar */}
        <div style={{ flex: 1, maxWidth: '300px', margin: '0 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'rgba(250,245,235,0.6)', marginBottom: '0.25rem' }}>
            <span>{completedCount}/{fields.length} fields</span>
            <span>{progressPercent}%</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(250,245,235,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: allRequiredDone ? '#38a169' : '#d69e2e',
              borderRadius: '3px',
              transition: 'width 0.5s ease, background 0.3s ease',
            }} />
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => setShowPreview(!showPreview)}
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.75rem',
              background: 'transparent',
              border: '1px solid rgba(250,245,235,0.3)',
              borderRadius: '0.25rem',
              color: '#faf5eb',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            {showPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {showPreview ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.75rem',
              background: 'rgba(49, 130, 206, 0.3)',
              border: '1px solid #3182ce',
              borderRadius: '0.25rem',
              color: '#faf5eb',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <Save className="w-3 h-3" /> Save
          </button>
          <button
            onClick={() => allRequiredDone ? setShowLaunchConfirm(true) : null}
            disabled={!allRequiredDone}
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.75rem',
              background: allRequiredDone ? '#38a169' : 'rgba(113,128,150,0.3)',
              border: `1px solid ${allRequiredDone ? '#38a169' : '#718096'}`,
              borderRadius: '0.25rem',
              color: '#faf5eb',
              cursor: allRequiredDone ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              opacity: allRequiredDone ? 1 : 0.5,
            }}
          >
            <Rocket className="w-3 h-3" /> Launch
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '0.4rem',
              background: 'transparent',
              border: 'none',
              color: 'rgba(250,245,235,0.5)',
              cursor: 'pointer',
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {lastSaved && <span style={{ position: 'absolute', right: '1.5rem', bottom: '-1rem', fontSize: '0.6rem', color: 'rgba(250,245,235,0.3)' }}>Last saved {lastSaved}</span>}
      </div>

      {/* ═══ CHALK OUTLINE FIELDS ═══ */}
      <div style={{ flex: 1, padding: '2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        {Object.entries(sections).map(([sectionName, sectionFields]) => {
          const color = getSectionColor(sectionName);
          const sectionComplete = sectionFields.every(f => fieldStates[f.id]?.completed);

          return (
            <div key={sectionName} style={{ marginBottom: '2rem' }}>
              {/* Section header */}
              <h3 style={{
                color: sectionComplete ? color.border : 'rgba(250,245,235,0.4)',
                fontSize: '0.85rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                {sectionComplete && <Check className="w-4 h-4" />}
                {sectionName}
              </h3>

              {sectionFields.map((field) => {
                const state = fieldStates[field.id] || { value: '', completed: false, locked: false };
                const isActive = activeField === field.id;

                return (
                  <div
                    key={field.id}
                    style={{
                      position: 'relative',
                      marginBottom: '1rem',
                      borderRadius: '0.5rem',
                      transition: 'all 0.4s ease',
                      // CHALK OUTLINE EFFECT:
                      // Empty = translucent with white dashed border (chalk lines)
                      // Completed = opaque with colored solid border
                      border: state.completed
                        ? `2px solid ${color.border}`
                        : '2px dashed rgba(250, 245, 235, 0.3)',
                      background: state.completed
                        ? color.bg
                        : 'rgba(10, 22, 40, 0.3)',
                      padding: '1rem',
                    }}
                    onClick={() => !state.locked && setActiveField(field.id)}
                  >
                    {/* Lock/Unlock toggle for completed fields */}
                    {state.completed && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          state.locked ? unlockField(field.id) : lockField(field.id);
                        }}
                        style={{
                          position: 'absolute',
                          top: '0.5rem',
                          right: '0.5rem',
                          background: 'rgba(0,0,0,0.3)',
                          border: 'none',
                          borderRadius: '0.25rem',
                          padding: '0.25rem',
                          cursor: 'pointer',
                          color: state.locked ? '#d69e2e' : 'rgba(250,245,235,0.5)',
                          transition: 'color 0.2s ease',
                        }}
                        title={state.locked ? 'Click to unlock and edit' : 'Click to lock'}
                      >
                        {state.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                    )}

                    {/* Field label */}
                    <label style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: state.completed ? color.text : 'rgba(250, 245, 235, 0.6)',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}>
                      {field.label}
                      {field.required && <span style={{ color: '#e53e3e', marginLeft: '0.25rem' }}>*</span>}
                    </label>

                    {/* Field input */}
                    {state.locked ? (
                      // LOCKED: Show value as static text
                      <div style={{
                        color: color.text,
                        fontSize: '0.9rem',
                        lineHeight: 1.5,
                        whiteSpace: 'pre-wrap',
                      }}>
                        {state.value || <span style={{ opacity: 0.5 }}>Empty</span>}
                      </div>
                    ) : (
                      // EDITABLE: Show input
                      <>
                        {(field.type === 'text' || field.type === 'price') && (
                          <input
                            type={field.type === 'price' ? 'number' : 'text'}
                            value={state.value}
                            onChange={(e) => updateField(field.id, e.target.value)}
                            placeholder={field.placeholder}
                            maxLength={field.maxLength}
                            style={{
                              width: '100%',
                              background: 'rgba(0,0,0,0.2)',
                              border: `1px solid ${isActive ? color.border : 'rgba(250,245,235,0.15)'}`,
                              borderRadius: '0.25rem',
                              padding: '0.5rem 0.75rem',
                              color: '#faf5eb',
                              fontSize: '0.9rem',
                              outline: 'none',
                              transition: 'border-color 0.2s ease',
                            }}
                            onFocus={() => setActiveField(field.id)}
                          />
                        )}
                        {(field.type === 'textarea' || field.type === 'rich-text') && (
                          <textarea
                            value={state.value}
                            onChange={(e) => updateField(field.id, e.target.value)}
                            placeholder={field.placeholder}
                            maxLength={field.maxLength}
                            rows={4}
                            style={{
                              width: '100%',
                              background: 'rgba(0,0,0,0.2)',
                              border: `1px solid ${isActive ? color.border : 'rgba(250,245,235,0.15)'}`,
                              borderRadius: '0.25rem',
                              padding: '0.5rem 0.75rem',
                              color: '#faf5eb',
                              fontSize: '0.9rem',
                              outline: 'none',
                              resize: 'vertical',
                              transition: 'border-color 0.2s ease',
                            }}
                            onFocus={() => setActiveField(field.id)}
                          />
                        )}
                        {field.type === 'select' && (
                          <select
                            value={state.value}
                            onChange={(e) => updateField(field.id, e.target.value)}
                            style={{
                              width: '100%',
                              background: 'rgba(0,0,0,0.2)',
                              border: `1px solid ${isActive ? color.border : 'rgba(250,245,235,0.15)'}`,
                              borderRadius: '0.25rem',
                              padding: '0.5rem 0.75rem',
                              color: '#faf5eb',
                              fontSize: '0.9rem',
                              outline: 'none',
                            }}
                            onFocus={() => setActiveField(field.id)}
                          >
                            <option value="">{field.placeholder}</option>
                            {field.options?.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        )}
                        {field.type === 'image' && (
                          <div style={{
                            border: `2px dashed ${isActive ? color.border : 'rgba(250,245,235,0.15)'}`,
                            borderRadius: '0.25rem',
                            padding: '2rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            color: 'rgba(250,245,235,0.4)',
                            fontSize: '0.8rem',
                          }}>
                            {state.value ? (
                              <img src={state.value} alt="Upload preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '0.25rem' }} />
                            ) : (
                              <>📷 Drop image or click to browse</>
                            )}
                          </div>
                        )}
                        {field.hint && (
                          <p style={{ fontSize: '0.65rem', color: 'rgba(250,245,235,0.35)', marginTop: '0.25rem', fontStyle: 'italic' }}>
                            {field.hint}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* ═══ LAUNCH CONFIRMATION DIALOG ═══ */}
      {showLaunchConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.7)',
        }}>
          <div style={{
            background: '#0a1628',
            border: '2px solid #d69e2e',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '400px',
            textAlign: 'center',
          }}>
            <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: '#d69e2e' }} />
            <h3 style={{ color: '#faf5eb', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Ready to Launch?
            </h3>
            <p style={{ color: 'rgba(250,245,235,0.6)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Your project will be visible to all members. You can edit details after launch, but the project page will be live.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => setShowLaunchConfirm(false)}
                style={{
                  padding: '0.5rem 1.5rem',
                  background: 'transparent',
                  border: '1px solid rgba(250,245,235,0.3)',
                  borderRadius: '0.5rem',
                  color: '#faf5eb',
                  cursor: 'pointer',
                }}
              >
                Not Yet
              </button>
              <button
                onClick={handleLaunch}
                style={{
                  padding: '0.5rem 1.5rem',
                  background: '#38a169',
                  border: '1px solid #38a169',
                  borderRadius: '0.5rem',
                  color: '#faf5eb',
                  cursor: 'pointer',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Rocket className="w-4 h-4" /> Launch! 🚀
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PRESET FIELD TEMPLATES — for different project types
// ═══════════════════════════════════════════════════════════════════

export const PRODUCT_PROJECT_FIELDS: ChalkField[] = [
  { id: 'name', label: 'Project Name', type: 'text', placeholder: 'What are you making?', required: true, section: 'basics', maxLength: 100 },
  { id: 'tagline', label: 'Tagline', type: 'text', placeholder: 'One sentence that hooks people', required: true, section: 'basics', maxLength: 150, hint: 'Think elevator pitch — 10 words or less is best' },
  { id: 'category', label: 'Category', type: 'select', placeholder: 'Choose a category', required: true, section: 'basics', options: ['3D Printed', 'Handmade', 'Food & Beverage', 'Art & Design', 'Tools & Hardware', 'Clothing', 'Electronics', 'Agriculture', 'Education', 'Services', 'Other'] },
  { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Tell the story of your project. What problem does it solve? Why does it matter?', required: true, section: 'details' },
  { id: 'how_its_made', label: 'How It\'s Made', type: 'textarea', placeholder: 'Describe your process, materials, and what makes your approach unique', required: false, section: 'details', hint: 'Members love knowing the craft behind the product' },
  { id: 'hero_image', label: 'Hero Image', type: 'image', placeholder: 'Main product photo', required: true, section: 'media' },
  { id: 'gallery', label: 'Gallery Images', type: 'image', placeholder: 'Additional photos (up to 6)', required: false, section: 'media' },
  { id: 'price', label: 'Price (Credits)', type: 'price', placeholder: 'Set your price — remember Cost+20% floor', required: true, section: 'pricing', hint: 'You keep 83.3%. Platform takes 13.3%. Gleaner\'s Corner gets 3.3%.' },
  { id: 'preorder_goal', label: 'Preorder Goal', type: 'text', placeholder: 'How many preorders before you start production?', required: true, section: 'pricing', hint: 'Preorder-funded means zero risk manufacturing' },
  { id: 'shipping_info', label: 'Shipping Details', type: 'textarea', placeholder: 'Where do you ship? Estimated delivery time? Flat rate or calculated?', required: false, section: 'shipping' },
  { id: 'tags', label: 'Tags', type: 'tags', placeholder: 'Add tags separated by commas (e.g., handmade, sustainable, kitchen)', required: false, section: 'tags' },
];

export const CREATOR_INVITE_FIELDS: ChalkField[] = [
  { id: 'creator_name', label: 'Your Name / Brand', type: 'text', placeholder: 'How should members know you?', required: true, section: 'basics' },
  { id: 'instagram', label: 'Instagram Handle', type: 'text', placeholder: '@yourhandle', required: false, section: 'basics', hint: 'So we can link to your existing work' },
  { id: 'what_you_make', label: 'What Do You Make?', type: 'textarea', placeholder: 'Describe what you create — materials, style, specialty', required: true, section: 'details' },
  { id: 'why_join', label: 'Why Liana Banyan?', type: 'textarea', placeholder: 'What interests you about cooperative commerce?', required: false, section: 'details' },
  { id: 'portfolio_image', label: 'Best Work Photo', type: 'image', placeholder: 'Show us your favorite piece', required: true, section: 'media' },
  { id: 'process', label: 'Your Process', type: 'select', placeholder: 'Primary manufacturing method', required: true, section: 'details', options: ['3D Printing (FDM)', '3D Printing (SLA/SLS)', 'CNC Machining', 'Laser Cutting', 'Woodworking', 'Metalwork', 'Ceramics/Pottery', 'Textile/Sewing', 'Food Production', 'Digital Design', 'Mixed Media', 'Other'] },
  { id: 'capacity', label: 'Production Capacity', type: 'select', placeholder: 'How much can you make?', required: false, section: 'pricing', options: ['Just me, a few per week', 'Small team, dozens per week', 'Workshop, hundreds per week', 'I need the cooperative\'s help to scale'] },
];
