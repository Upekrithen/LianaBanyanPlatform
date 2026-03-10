/**
 * UNIVERSAL DISPATCH — Post to ANY Platform from Your Portfolio
 * ==============================================================
 * The "Universal Joint" concept: Your Portfolio is the hub.
 * From here, you can dispatch content to:
 *
 *   Social Media:  Twitter, LinkedIn, Bluesky, Threads, Instagram, Imgur, Discord, Facebook
 *   Publications:  Medium, Substack (via RSS cross-post notification)
 *   Direct:        Email (to person, institution, company, paper)
 *   Platform:      Cue Cards, Project Updates, Beacon Runs, Golden Keys
 *   Messaging:     SMS/Text (via Twilio), WhatsApp (via API)
 *
 * Workflow:
 *   1. Create or select content (text, images, links)
 *   2. Select dispatch targets (mix and match)
 *   3. Preview platform-specific formatting
 *   4. Schedule or dispatch immediately
 *   5. Track delivery status
 *
 * Works as a PWA — same experience on mobile and desktop.
 * Upload from either device since the Portfolio is synced.
 *
 * "Approve and forget until next week."
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Send, Image, FileText, Calendar, Clock, Eye, CheckCircle,
  Mail, MessageSquare, Share2, Rss, Globe, Smartphone,
  CreditCard, QrCode, Megaphone, ArrowRight, Plus
} from 'lucide-react';

// ============================================================================
// DISPATCH TARGET DEFINITIONS
// ============================================================================

export interface DispatchTarget {
  id: string;
  name: string;
  category: 'social' | 'publication' | 'direct' | 'platform' | 'messaging';
  icon: string;
  maxChars?: number;
  maxImages?: number;
  supportsScheduling: boolean;
  requiresAuth: boolean;
  description: string;
}

const DISPATCH_TARGETS: DispatchTarget[] = [
  // Social Media
  { id: 'twitter', name: 'Twitter/X', category: 'social', icon: '𝕏', maxChars: 280, maxImages: 4, supportsScheduling: true, requiresAuth: true, description: 'Post or thread' },
  { id: 'linkedin', name: 'LinkedIn', category: 'social', icon: '💼', maxChars: 3000, maxImages: 9, supportsScheduling: true, requiresAuth: true, description: 'Post or article' },
  { id: 'bluesky', name: 'Bluesky', category: 'social', icon: '🦋', maxChars: 300, maxImages: 4, supportsScheduling: true, requiresAuth: true, description: 'Skeet' },
  { id: 'threads', name: 'Threads', category: 'social', icon: '🧵', maxChars: 500, maxImages: 10, supportsScheduling: true, requiresAuth: true, description: 'Thread post' },
  { id: 'facebook', name: 'Facebook', category: 'social', icon: '📘', maxChars: 63206, maxImages: 10, supportsScheduling: true, requiresAuth: true, description: 'Page post' },
  { id: 'instagram', name: 'Instagram', category: 'social', icon: '📸', maxChars: 2200, maxImages: 10, supportsScheduling: true, requiresAuth: true, description: 'Feed post' },
  { id: 'imgur', name: 'Imgur', category: 'social', icon: '🖼️', maxChars: 10000, maxImages: 50, supportsScheduling: false, requiresAuth: true, description: 'Gallery post' },
  { id: 'discord', name: 'Discord', category: 'social', icon: '🎮', maxChars: 2000, maxImages: 10, supportsScheduling: true, requiresAuth: false, description: 'Webhook message' },

  // Publications
  { id: 'medium', name: 'Medium', category: 'publication', icon: '📝', supportsScheduling: true, requiresAuth: true, description: 'Full article' },
  { id: 'substack', name: 'Substack', category: 'publication', icon: '📰', supportsScheduling: false, requiresAuth: false, description: 'Newsletter (manual cross-post)' },

  // Direct
  { id: 'email', name: 'Email', category: 'direct', icon: '✉️', supportsScheduling: true, requiresAuth: false, description: 'To person, company, or institution' },

  // Platform-Native
  { id: 'cue-card', name: 'Cue Card', category: 'platform', icon: '🃏', supportsScheduling: false, requiresAuth: true, description: 'QR-linked digital card' },
  { id: 'project-update', name: 'Project Update', category: 'platform', icon: '📋', supportsScheduling: false, requiresAuth: true, description: 'Update on a backed project' },
  { id: 'beacon-run', name: 'Beacon Run', category: 'platform', icon: '🔔', supportsScheduling: true, requiresAuth: true, description: 'Targeted outreach campaign' },
  { id: 'golden-key', name: 'Golden Key', category: 'platform', icon: '🔑', supportsScheduling: false, requiresAuth: true, description: 'Referral invitation' },
];

const CATEGORIES = [
  { id: 'social', name: 'Social Media', icon: Share2 },
  { id: 'publication', name: 'Publications', icon: FileText },
  { id: 'direct', name: 'Direct', icon: Mail },
  { id: 'platform', name: 'Platform', icon: Globe },
] as const;

// ============================================================================
// DISPATCH ITEM
// ============================================================================

export interface DispatchItem {
  id: string;
  content: string;
  title?: string;
  imageUrls: string[];
  targets: string[];
  scheduledFor?: string;
  status: 'draft' | 'ready' | 'scheduled' | 'dispatched' | 'failed';
  createdAt: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

interface UniversalDispatchProps {
  /** Pre-fill content (e.g., from a Cue Card or Project Update) */
  initialContent?: string;
  /** Pre-fill title */
  initialTitle?: string;
  /** Pre-fill image URLs */
  initialImages?: string[];
  /** Pre-select dispatch targets */
  initialTargets?: string[];
  /** Callback when dispatched */
  onDispatch?: (item: DispatchItem) => void;
}

export function UniversalDispatch({
  initialContent = '',
  initialTitle = '',
  initialImages = [],
  initialTargets = [],
  onDispatch,
}: UniversalDispatchProps) {
  const [content, setContent] = useState(initialContent);
  const [title, setTitle] = useState(initialTitle);
  const [selectedTargets, setSelectedTargets] = useState<string[]>(initialTargets);
  const [scheduledFor, setScheduledFor] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const toggleTarget = (targetId: string) => {
    setSelectedTargets(prev =>
      prev.includes(targetId)
        ? prev.filter(t => t !== targetId)
        : [...prev, targetId]
    );
  };

  const selectedTargetDetails = DISPATCH_TARGETS.filter(t => selectedTargets.includes(t.id));

  // Character limit warnings
  const charWarnings = selectedTargetDetails
    .filter(t => t.maxChars && content.length > t.maxChars)
    .map(t => `${t.name}: ${content.length}/${t.maxChars} chars`);

  const handleDispatch = () => {
    const item: DispatchItem = {
      id: crypto.randomUUID(),
      content,
      title: title || undefined,
      imageUrls: initialImages,
      targets: selectedTargets,
      scheduledFor: scheduledFor || undefined,
      status: scheduledFor ? 'scheduled' : 'ready',
      createdAt: new Date().toISOString(),
    };
    onDispatch?.(item);
  };

  return (
    <div className="space-y-6">
      {/* Content Composer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-indigo-500" />
            Universal Dispatch
          </CardTitle>
          <CardDescription>
            Create once, dispatch everywhere. Select targets, preview formatting, schedule or send now.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="dispatch-title">Title (optional)</Label>
            <Input
              id="dispatch-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., article title, email subject, project name"
            />
          </div>

          <div>
            <Label htmlFor="dispatch-content">Content</Label>
            <textarea
              id="dispatch-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your content here. Platform-specific formatting will be applied automatically."
              className="w-full min-h-[150px] p-3 border rounded-lg bg-background text-sm resize-y"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{content.length} characters</span>
              {charWarnings.length > 0 && (
                <span className="text-amber-500">
                  ⚠️ Over limit: {charWarnings.join(', ')}
                </span>
              )}
            </div>
          </div>

          {/* Image Attachments */}
          {initialImages.length > 0 && (
            <div>
              <Label>Attached Images ({initialImages.length})</Label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {initialImages.map((url, i) => (
                  <img key={i} src={url} alt={`Attached image ${i + 1}`} className="w-16 h-16 rounded object-cover border" />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Target Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-indigo-500" />
            Dispatch Targets
          </CardTitle>
          <CardDescription>
            Select where to send this content. Mix and match freely.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {CATEGORIES.map(category => {
            const targets = DISPATCH_TARGETS.filter(t => t.category === category.id);
            const CategoryIcon = category.icon;
            return (
              <div key={category.id}>
                <div className="flex items-center gap-2 mb-3">
                  <CategoryIcon className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-sm font-semibold">{category.name}</Label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {targets.map(target => (
                    <div
                      key={target.id}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                        selectedTargets.includes(target.id)
                          ? 'bg-indigo-500/10 border-indigo-500'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => toggleTarget(target.id)}
                    >
                      <Checkbox
                        checked={selectedTargets.includes(target.id)}
                        onCheckedChange={() => toggleTarget(target.id)}
                      />
                      <span className="text-lg">{target.icon}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-medium truncate">{target.name}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{target.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Schedule & Actions */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="schedule-time" className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" />
                Schedule (optional)
              </Label>
              <Input
                id="schedule-time"
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              or dispatch immediately
            </div>
          </div>

          <Separator />

          {/* Summary */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Dispatch Summary</h4>
              <Badge variant="outline">{selectedTargets.length} targets</Badge>
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedTargetDetails.map(target => (
                <Badge key={target.id} variant="secondary" className="text-xs">
                  {target.icon} {target.name}
                </Badge>
              ))}
            </div>
            {scheduledFor && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Scheduled: {new Date(scheduledFor).toLocaleString()}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Hide Preview' : 'Preview'}
            </Button>
            <Button
              onClick={handleDispatch}
              disabled={!content.trim() || selectedTargets.length === 0}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {scheduledFor ? 'Schedule Dispatch' : 'Dispatch Now'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Platform-Specific Preview */}
      {showPreview && selectedTargetDetails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Platform Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedTargetDetails.map(target => {
              const truncated = target.maxChars && content.length > target.maxChars
                ? content.slice(0, target.maxChars - 3) + '...'
                : content;
              return (
                <div key={target.id} className="p-3 rounded-lg border bg-muted/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{target.icon}</span>
                    <span className="text-sm font-medium">{target.name}</span>
                    {target.maxChars && content.length > target.maxChars && (
                      <Badge variant="destructive" className="text-[10px]">TRUNCATED</Badge>
                    )}
                  </div>
                  {title && <div className="font-medium text-sm mb-1">{title}</div>}
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
                    {truncated}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default UniversalDispatch;
