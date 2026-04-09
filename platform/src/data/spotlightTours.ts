/**
 * SPOTLIGHT TOUR DEFINITIONS (B088)
 * ==================================
 * SpotlightStop format for the LRH-guided tooltip tour system.
 * Each tour maps to a beacon run slug for cross-compatibility.
 *
 * Selectors use data-xray-id attributes where available,
 * falling back to semantic selectors.
 */

import { SpotlightStop } from '@/components/SpotlightOverlay';

export const GET_A_JOB_SPOTLIGHT: SpotlightStop[] = [
  {
    route: '/get-a-job',
    selector: '[data-xray-id="salt-mines-hero"], h1',
    title: 'Welcome to the Salt Mines',
    description:
      "This is where people find work. Every position here pays in Credits, Marks, or both — and creators keep 83.3% of everything they earn.",
    tooltipPosition: 'bottom',
  },
  {
    route: '/help-wanted',
    selector: '[data-xray-id="bounty-categories"], [data-xray-id="help-wanted-grid"], main h1',
    title: 'Bounty Board',
    description:
      "Each card is a real role or bounty across Design, Development, Writing, and more. Pick one that matches your skills.",
    tooltipPosition: 'bottom',
  },
  {
    route: '/help-each-other',
    selector: '[data-xray-id="member-benefits"], main h1',
    title: 'Your Benefits',
    description:
      "As a member, you get access to all 16 initiatives — from groceries to healthcare to legal services. $5/year covers everything.",
    tooltipPosition: 'bottom',
  },
  {
    route: '/economics',
    selector: '[data-xray-id="three-gear-currency"], [data-xray-id="economics-hero"], main h1',
    title: 'How Credits Work',
    description:
      "Three currencies — Credits (spend now), Marks (earned through service), and Joules (grow over time). The 20% margin funds all 16 initiatives.",
    tooltipPosition: 'bottom',
  },
  {
    route: '/initiatives/harper-guild',
    selector: '[data-xray-id="harper-guild-hero"], main h1',
    title: 'Building Reputation',
    description:
      "The Harper Guild verifies your skills and builds your reputation score. Higher reputation = better bounties and trust in the cooperative.",
    tooltipPosition: 'bottom',
  },
  {
    route: '/RedCarpet',
    selector: '[data-xray-id="red-carpet-begin"], main h1, [role="main"] h1',
    title: 'Join the Platform',
    description:
      "Ready to start? $5/year membership gives you full access. The Red Carpet is your personal walkthrough to get started.",
    tooltipPosition: 'bottom',
  },
];

export const SPOTLIGHT_TOURS: Record<string, { name: string; stops: SpotlightStop[] }> = {
  'get-a-job': { name: 'Get a Job', stops: GET_A_JOB_SPOTLIGHT },
};

export function getSpotlightTour(slug: string) {
  return SPOTLIGHT_TOURS[slug] ?? null;
}
