/**
 * Trail Stops — Crow's Nest Trail Map progression data
 * =====================================================
 * Defines the vertical journey a member takes through the platform.
 * Each stop checks real platform activity from existing tables.
 */

export interface TrailStop {
  id: string;
  title: string;
  description: string;
  checkKey: string;
  ctaText?: string;
  ctaHref?: string;
}

export const TRAIL_STOPS: TrailStop[] = [
  {
    id: 'joined',
    title: 'Joined the Platform',
    description: 'Created your account and stepped through the door.',
    checkKey: 'has_account',
  },
  {
    id: 'explored-3',
    title: 'Explored 3 Pages',
    description: 'Browsed at least three different sections of the platform.',
    checkKey: 'explored_3_pages',
  },
  {
    id: 'first-beacon',
    title: 'Dropped First Beacon',
    description: 'Pinned a page with a colored beacon to find your way back.',
    checkKey: 'has_beacon',
    ctaText: 'Drop a Beacon',
    ctaHref: '/beacon-explainer',
  },
  {
    id: 'chose-trail-marker',
    title: 'Chose a Trail Marker',
    description: 'Picked a personal icon to mark your position on the trail.',
    checkKey: 'has_trail_marker',
  },
  {
    id: 'first-marks',
    title: 'Earned First Marks',
    description: 'Completed a task or activity that generated Marks.',
    checkKey: 'has_marks',
    ctaText: 'Find a Bounty',
    ctaHref: '/bounties',
  },
  {
    id: 'backed-project',
    title: 'Backed a Project',
    description: 'Pledged support for an innovation or product.',
    checkKey: 'has_pledge',
    ctaText: 'Plant a Seed',
    ctaHref: '/plant-seeds',
  },
  {
    id: 'gave-feedback',
    title: 'Gave Feedback',
    description: 'Submitted a tour note, improvement, or review.',
    checkKey: 'has_feedback',
    ctaText: 'Share Thoughts',
    ctaHref: '/tour',
  },
  {
    id: 'joined-guild',
    title: 'Joined a Guild',
    description: 'Became a member of a specialty guild.',
    checkKey: 'has_guild',
    ctaText: 'Browse Guilds',
    ctaHref: '/guilds',
  },
  {
    id: 'membership-active',
    title: 'Membership Active',
    description: 'Your $5/year membership is current and in good standing.',
    checkKey: 'has_membership',
    ctaText: 'Activate Membership',
    ctaHref: '/dashboard/membership',
  },
  {
    id: 'grand-tour',
    title: 'Completed a Tour Package',
    description: 'Finished at least one themed tour package and earned Marks.',
    checkKey: 'completed_tour',
    ctaText: 'Browse Tour Packages',
    ctaHref: '/tour/packages',
  },
  {
    id: 'first-hundred-marks',
    title: 'Reached 100 Marks',
    description: 'Accumulated 100 Marks through genuine participation.',
    checkKey: 'marks_100',
  },
  {
    id: 'horizon',
    title: 'The Horizon',
    description: 'The journey continues. New stops appear as the platform grows.',
    checkKey: 'horizon',
  },
];

export const TRAIL_MARKER_ICONS = [
  { slug: 'ghost', emoji: '👻', label: 'Ghost' },
  { slug: 'ant', emoji: '🐜', label: 'Ant' },
  { slug: 'hen', emoji: '🐔', label: 'Hen' },
  { slug: 'acorn', emoji: '🌰', label: 'Acorn' },
  { slug: 'compass', emoji: '🧭', label: 'Compass' },
  { slug: 'anchor', emoji: '⚓', label: 'Anchor' },
  { slug: 'lighthouse', emoji: '🏠', label: 'Lighthouse' },
  { slug: 'hammer', emoji: '🔨', label: 'Hammer' },
  { slug: 'sprout', emoji: '🌱', label: 'Sprout' },
  { slug: 'star', emoji: '⭐', label: 'Star' },
  { slug: 'key', emoji: '🔑', label: 'Key' },
  { slug: 'shield', emoji: '🛡️', label: 'Shield' },
] as const;

export type TrailMarkerSlug = typeof TRAIL_MARKER_ICONS[number]['slug'];

export function getTrailMarkerEmoji(slug: string): string {
  return TRAIL_MARKER_ICONS.find(m => m.slug === slug)?.emoji ?? '👻';
}
