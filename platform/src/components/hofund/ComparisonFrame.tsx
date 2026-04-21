/**
 * COMPARISON FRAME COMPONENT
 * ==========================
 * 6-slot drag-and-drop frame for comparing Cue Card templates.
 *
 * Features:
 * - Drag templates from gallery into slots
 * - Side-by-side comparison of performance
 * - Copy/model after successful templates
 * - Attribution tracking for template creators
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Layers, X, Plus, Copy, TrendingUp, Eye,
  MousePointer2, Target, Clock, Sparkles,
  GripVertical, ChevronDown, ChevronUp, Award
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface CueCardTemplate {
  id: string;
  title: string;
  subtitle: string | null;
  body_text: string;
  hashtags: string[];
  card_style: string;
  template_type: string;
  initiative_slug: string | null;
  background_type: string;
  background_value: string;
  creator_id?: string;
  creator_name?: string;
}

interface TemplatePerformance {
  template_id: string;
  campaign_count: number;
  total_clicks: number;
  total_conversions: number;
  avg_conversion_rate: number;
  avg_expiration_hours: number;
}

interface ComparisonSlot {
  slot_number: number;
  template: CueCardTemplate | null;
  performance: TemplatePerformance | null;
  user_notes: string;
}

interface ComparisonFrameProps {
  onSelectTemplate: (template: CueCardTemplate) => void;
  onCopyTemplate: (template: CueCardTemplate) => void;
  availableTemplates: CueCardTemplate[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPARISON FRAME COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function ComparisonFrame({
  onSelectTemplate,
  onCopyTemplate,
  availableTemplates
}: ComparisonFrameProps) {
  const { user } = useAuth();

  // State
  const [slots, setSlots] = useState<ComparisonSlot[]>([
    { slot_number: 1, template: null, performance: null, user_notes: '' },
    { slot_number: 2, template: null, performance: null, user_notes: '' },
    { slot_number: 3, template: null, performance: null, user_notes: '' },
    { slot_number: 4, template: null, performance: null, user_notes: '' },
    { slot_number: 5, template: null, performance: null, user_notes: '' },
    { slot_number: 6, template: null, performance: null, user_notes: '' },
  ]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPerformance, setShowPerformance] = useState(true);

  // ─── Load saved slots ───
  useEffect(() => {
    if (!user) return;
    loadSavedSlots();
  }, [user]);

  const loadSavedSlots = async () => {
    if (!user) return;

    try {
      const { data: savedSlots, error } = await supabase
        .from('comparison_frame_slots')
        .select('*')
        .eq('user_id', user.id)
        .order('slot_number');

      if (error) throw error;

      if (savedSlots && savedSlots.length > 0) {
        // Load templates for saved slots
        const templateIds = savedSlots
          .filter(s => s.template_id)
          .map(s => s.template_id);

        if (templateIds.length > 0) {
          const { data: templates } = await supabase
            .from('cue_card_templates')
            .select('*')
            .in('id', templateIds);

          // Load performance data
          const { data: performance } = await supabase
            .from('research_pool_aggregates')
            .select('*');

          // Merge data into slots
          const newSlots = slots.map(slot => {
            const saved = savedSlots.find(s => s.slot_number === slot.slot_number);
            if (!saved?.template_id) return slot;

            const template = templates?.find(t => t.id === saved.template_id);
            const perf = performance?.find(p =>
              p.template_type === template?.template_type &&
              p.initiative_slug === template?.initiative_slug
            );

            return {
              ...slot,
              template: template || null,
              performance: perf ? {
                template_id: template?.id || '',
                campaign_count: perf.campaign_count,
                total_clicks: perf.total_clicks,
                total_conversions: perf.total_conversions,
                avg_conversion_rate: perf.avg_conversion_rate,
                avg_expiration_hours: perf.expiration_hours
              } : null,
              user_notes: saved.user_notes || ''
            };
          });

          setSlots(newSlots);
        }
      }
    } catch (err) {
      console.error('Error loading comparison slots:', err);
    }
  };

  // ─── Save slot to database ───
  const saveSlot = async (slotNumber: number, templateId: string | null, notes: string) => {
    if (!user) return;

    try {
      await supabase
        .from('comparison_frame_slots')
        .upsert({
          user_id: user.id,
          slot_number: slotNumber,
          template_id: templateId,
          user_notes: notes,
          added_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,slot_number'
        });
    } catch (err) {
      console.error('Error saving slot:', err);
    }
  };

  // ─── Handle drop ───
  const handleDrop = useCallback(async (slotNumber: number, template: CueCardTemplate) => {
    setDragOverSlot(null);

    // Check if already in a slot
    const existingSlot = slots.find(s => s.template?.id === template.id);
    if (existingSlot) {
      toast.info('Template already in comparison frame');
      return;
    }

    // Load performance data for this template
    let performance: TemplatePerformance | null = null;
    try {
      const { data } = await supabase
        .from('research_pool_aggregates')
        .select('*')
        .eq('template_type', template.template_type)
        .eq('initiative_slug', template.initiative_slug || '')
        .limit(1);

      if (data && data.length > 0) {
        performance = {
          template_id: template.id,
          campaign_count: data[0].campaign_count,
          total_clicks: data[0].total_clicks,
          total_conversions: data[0].total_conversions,
          avg_conversion_rate: data[0].avg_conversion_rate,
          avg_expiration_hours: data[0].expiration_hours
        };
      }
    } catch (err) {
      console.error('Error loading performance:', err);
    }

    // Update slot
    const newSlots = slots.map(slot =>
      slot.slot_number === slotNumber
        ? { ...slot, template, performance }
        : slot
    );
    setSlots(newSlots);

    // Save to database
    await saveSlot(slotNumber, template.id, '');

    // Create attribution record
    if (user && template.creator_id) {
      try {
        await supabase
          .from('template_attribution')
          .insert({
            template_id: template.id,
            creator_id: template.creator_id,
            user_id: user.id,
            marks_for_selection: 1
          });
      } catch (err) {
        console.error('Error creating attribution:', err);
      }
    }

    toast.success(`Added "${template.title}" to slot ${slotNumber}`);
  }, [slots, user]);

  // ─── Remove from slot ───
  const handleRemove = async (slotNumber: number) => {
    const newSlots = slots.map(slot =>
      slot.slot_number === slotNumber
        ? { ...slot, template: null, performance: null, user_notes: '' }
        : slot
    );
    setSlots(newSlots);
    await saveSlot(slotNumber, null, '');
  };

  // ─── Use template ───
  const handleUseTemplate = (template: CueCardTemplate) => {
    onSelectTemplate(template);
    toast.success(`Selected "${template.title}" for your campaign`);
  };

  // ─── Copy template (derivative) ───
  const handleCopyTemplate = async (template: CueCardTemplate) => {
    onCopyTemplate(template);

    // Award derivative marks to creator
    if (user && template.creator_id) {
      try {
        await supabase
          .from('template_attribution')
          .insert({
            template_id: template.id,
            creator_id: template.creator_id,
            user_id: user.id,
            is_derivative: true,
            marks_for_derivative: 5
          });

        toast.success(`Copied "${template.title}" - creator awarded 5 Marks!`);
      } catch (err) {
        console.error('Error creating derivative attribution:', err);
        toast.success(`Copied "${template.title}"`);
      }
    } else {
      toast.success(`Copied "${template.title}"`);
    }
  };

  // ─── Count filled slots ───
  const filledSlots = slots.filter(s => s.template !== null).length;

  // ─── Render ───
  return (
    <div className="space-y-4">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-white">Comparison Frame</h3>
            <p className="text-sm text-white/60">
              {filledSlots}/6 slots filled
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {filledSlots > 0 && (
            <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs">
              {filledSlots} templates
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-white/40" />
          ) : (
            <ChevronDown className="w-5 h-5 text-white/40" />
          )}
        </div>
      </button>

      {/* Expanded Frame */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {/* Performance Toggle */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-white/60">Show performance data</span>
              <button
                onClick={() => setShowPerformance(!showPerformance)}
                className={`relative w-10 h-5 rounded-full transition-all ${
                  showPerformance ? 'bg-primary' : 'bg-white/20'
                }`}
              >
                <motion.div
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white"
                  animate={{ left: showPerformance ? '22px' : '2px' }}
                />
              </button>
            </div>

            {/* Slots Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {slots.map((slot) => (
                <motion.div
                  key={slot.slot_number}
                  className={`relative aspect-[4/5] rounded-xl border-2 border-dashed transition-all ${
                    dragOverSlot === slot.slot_number
                      ? 'border-primary bg-primary/10'
                      : slot.template
                        ? 'border-white/20 bg-white/5'
                        : 'border-white/10 bg-white/[0.02]'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverSlot(slot.slot_number);
                  }}
                  onDragLeave={() => setDragOverSlot(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    const templateData = e.dataTransfer.getData('template');
                    if (templateData) {
                      const template = JSON.parse(templateData);
                      handleDrop(slot.slot_number, template);
                    }
                  }}
                  layout
                >
                  {slot.template ? (
                    // Filled Slot
                    <div className="absolute inset-0 p-3 flex flex-col">
                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(slot.slot_number)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-white/10 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors z-10"
                      >
                        <X className="w-3 h-3" />
                      </button>

                      {/* Slot Number */}
                      <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/40">
                        {slot.slot_number}
                      </div>

                      {/* Template Preview */}
                      <div
                        className="flex-1 rounded-lg overflow-hidden mb-2"
                        style={{
                          background: slot.template.background_type === 'gradient'
                            ? slot.template.background_value
                            : slot.template.background_value
                        }}
                      >
                        <div className="p-2 h-full flex flex-col justify-center">
                          <h4 className="text-xs font-bold text-white line-clamp-2 mb-1">
                            {slot.template.title}
                          </h4>
                          {slot.template.subtitle && (
                            <p className="text-[10px] text-white/70 line-clamp-1">
                              {slot.template.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Performance Stats */}
                      {showPerformance && slot.performance && (
                        <div className="grid grid-cols-2 gap-1 mb-2">
                          <div className="p-1 rounded bg-white/5 text-center">
                            <div className="text-xs font-bold text-emerald-400">
                              {(slot.performance.avg_conversion_rate * 100).toFixed(1)}%
                            </div>
                            <div className="text-[8px] text-white/40">Conv</div>
                          </div>
                          <div className="p-1 rounded bg-white/5 text-center">
                            <div className="text-xs font-bold text-primary">
                              {slot.performance.total_clicks}
                            </div>
                            <div className="text-[8px] text-white/40">Clicks</div>
                          </div>
                        </div>
                      )}

                      {/* Creator Attribution */}
                      {slot.template.creator_name && (
                        <div className="flex items-center gap-1 mb-2 text-[10px] text-white/40">
                          <Award className="w-3 h-3" />
                          <span>by {slot.template.creator_name}</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleUseTemplate(slot.template!)}
                          className="flex-1 py-1 rounded bg-primary/20 hover:bg-primary/30 text-primary text-xs font-medium transition-colors"
                        >
                          Use
                        </button>
                        <button
                          onClick={() => handleCopyTemplate(slot.template!)}
                          className="p-1 rounded bg-white/10 hover:bg-white/20 text-white/60 transition-colors"
                          title="Copy as derivative"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Empty Slot
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mb-2">
                        <Plus className="w-4 h-4" />
                      </div>
                      <span className="text-xs">Slot {slot.slot_number}</span>
                      <span className="text-[10px] mt-1">Drag template here</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Comparison Summary */}
            {filledSlots >= 2 && showPerformance && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20"
              >
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Comparison Summary
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-emerald-400">
                      {(slots
                        .filter(s => s.performance)
                        .reduce((sum, s) => sum + (s.performance?.avg_conversion_rate || 0), 0)
                        / filledSlots * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-white/50">Avg Conversion</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-primary">
                      {slots
                        .filter(s => s.performance)
                        .reduce((sum, s) => sum + (s.performance?.total_clicks || 0), 0)}
                    </div>
                    <div className="text-xs text-white/50">Total Clicks</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-amber-400">
                      {Math.round(slots
                        .filter(s => s.performance)
                        .reduce((sum, s) => sum + (s.performance?.avg_expiration_hours || 0), 0)
                        / filledSlots)}h
                    </div>
                    <div className="text-xs text-white/50">Avg Expiration</div>
                  </div>
                </div>

                {/* Best Performer */}
                {(() => {
                  const best = slots
                    .filter(s => s.performance)
                    .sort((a, b) =>
                      (b.performance?.avg_conversion_rate || 0) - (a.performance?.avg_conversion_rate || 0)
                    )[0];

                  if (!best?.template) return null;

                  return (
                    <div className="mt-3 p-2 rounded-lg bg-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="text-sm text-white">
                          Best: <strong>{best.template.title}</strong>
                        </span>
                      </div>
                      <button
                        onClick={() => handleUseTemplate(best.template!)}
                        className="px-3 py-1 rounded bg-primary text-white text-xs font-medium"
                      >
                        Use This
                      </button>
                    </div>
                  );
                })()}
              </motion.div>
            )}

            {/* Instructions */}
            <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-white/50">
                <strong className="text-white/70">How to use:</strong> Drag templates from the gallery
                into slots above. Compare performance metrics and use the best one for your campaign.
                Copying a template awards 5 Marks to its creator.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DRAGGABLE TEMPLATE CARD (for gallery)
// ═══════════════════════════════════════════════════════════════════════════════

interface DraggableTemplateProps {
  template: CueCardTemplate;
  onSelect: () => void;
}

export function DraggableTemplate({ template, onSelect }: DraggableTemplateProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('template', JSON.stringify(template));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <motion.div
      draggable
      onDragStart={handleDragStart}
      onClick={onSelect}
      className="relative aspect-[4/5] rounded-xl overflow-hidden cursor-grab active:cursor-grabbing border border-white/10 hover:border-white/30 transition-all group"
      style={{
        background: template.background_type === 'gradient'
          ? template.background_value
          : template.background_value
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Drag Handle */}
      <div className="absolute top-2 right-2 p-1 rounded bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="w-3 h-3 text-white/60" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 p-3 flex flex-col justify-end">
        <h4 className="text-sm font-bold text-white line-clamp-2 mb-1">
          {template.title}
        </h4>
        {template.subtitle && (
          <p className="text-xs text-white/70 line-clamp-1">
            {template.subtitle}
          </p>
        )}
      </div>

      {/* Drag Hint */}
      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <span className="px-2 py-1 rounded bg-black/50 text-white text-xs">
          Drag to compare
        </span>
      </div>
    </motion.div>
  );
}

export default ComparisonFrame;
