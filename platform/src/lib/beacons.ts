/**
 * BEACON System - Personal bookmarks with notes
 *
 * Beacons allow users to drop personal markers on any section,
 * assign meaning, and either email themselves or save to tasks.
 *
 * Ghost users: Beacons are stored in localStorage with Half-Life decay
 * Members: Beacons are persisted to Supabase and never decay
 */

import { supabase } from '@/integrations/supabase/client';

export interface Beacon {
  id: string;
  sectionId: string;
  pageUrl: string;
  note: string;
  createdAt: string;
  expiresAt?: string; // Only for ghost users
  userId?: string;
}

const GHOST_BEACONS_KEY = 'lb_ghost_beacons';
const GHOST_BEACON_HALF_LIFE_HOURS = 72; // 3 days

export function generateBeaconId(): string {
  return `beacon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getGhostBeacons(): Beacon[] {
  try {
    const stored = localStorage.getItem(GHOST_BEACONS_KEY);
    if (!stored) return [];

    const beacons: Beacon[] = JSON.parse(stored);
    const now = new Date();

    // Filter out expired beacons
    const activeBeacons = beacons.filter(b => {
      if (!b.expiresAt) return true;
      return new Date(b.expiresAt) > now;
    });

    // Save back filtered list
    if (activeBeacons.length !== beacons.length) {
      localStorage.setItem(GHOST_BEACONS_KEY, JSON.stringify(activeBeacons));
    }

    return activeBeacons;
  } catch {
    return [];
  }
}

export function saveGhostBeacon(beacon: Omit<Beacon, 'id' | 'createdAt' | 'expiresAt'>): Beacon {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + GHOST_BEACON_HALF_LIFE_HOURS * 60 * 60 * 1000);

  const newBeacon: Beacon = {
    ...beacon,
    id: generateBeaconId(),
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  const beacons = getGhostBeacons();
  beacons.push(newBeacon);
  localStorage.setItem(GHOST_BEACONS_KEY, JSON.stringify(beacons));

  return newBeacon;
}

export function removeGhostBeacon(beaconId: string): void {
  const beacons = getGhostBeacons();
  const filtered = beacons.filter(b => b.id !== beaconId);
  localStorage.setItem(GHOST_BEACONS_KEY, JSON.stringify(filtered));
}

export async function saveMemberBeacon(
  userId: string,
  beacon: Omit<Beacon, 'id' | 'createdAt' | 'userId'>
): Promise<Beacon | null> {
  try {
    const newBeacon: Beacon = {
      ...beacon,
      id: generateBeaconId(),
      createdAt: new Date().toISOString(),
      userId,
    };

    // Save to member_tasks table as a beacon-type task
    const { error } = await supabase.from('member_tasks').insert({
      user_id: userId,
      title: `Beacon: ${beacon.sectionId}`,
      description: beacon.note,
      status: 'pending',
      priority: 'low',
      metadata: {
        type: 'beacon',
        sectionId: beacon.sectionId,
        pageUrl: beacon.pageUrl,
        beaconId: newBeacon.id,
      },
    });

    if (error) throw error;
    return newBeacon;
  } catch (err) {
    console.error('Failed to save member beacon:', err);
    return null;
  }
}

export async function getMemberBeacons(userId: string): Promise<Beacon[]> {
  try {
    const { data, error } = await supabase
      .from('member_tasks')
      .select('*')
      .eq('user_id', userId)
      .contains('metadata', { type: 'beacon' });

    if (error) throw error;

    return (data || []).map(task => ({
      id: task.metadata?.beaconId || task.id,
      sectionId: task.metadata?.sectionId || '',
      pageUrl: task.metadata?.pageUrl || '',
      note: task.description || '',
      createdAt: task.created_at,
      userId: task.user_id,
    }));
  } catch (err) {
    console.error('Failed to get member beacons:', err);
    return [];
  }
}

export async function convertGhostBeaconsToMember(userId: string): Promise<number> {
  const ghostBeacons = getGhostBeacons();
  let converted = 0;

  for (const beacon of ghostBeacons) {
    const result = await saveMemberBeacon(userId, {
      sectionId: beacon.sectionId,
      pageUrl: beacon.pageUrl,
      note: beacon.note,
    });

    if (result) {
      converted++;
      removeGhostBeacon(beacon.id);
    }
  }

  return converted;
}

export function emailBeacon(beacon: Beacon, email: string): void {
  const subject = encodeURIComponent(`Liana Banyan Beacon: ${beacon.sectionId}`);
  const body = encodeURIComponent(
    `You dropped a beacon on Liana Banyan!\n\n` +
    `Section: ${beacon.sectionId}\n` +
    `Page: ${beacon.pageUrl}\n\n` +
    `Your Note:\n${beacon.note}\n\n` +
    `Return to this spot: ${beacon.pageUrl}#${beacon.sectionId}\n\n` +
    `---\n` +
    `Help Each Other Help Ourselves\n` +
    `https://lianabanyan.com`
  );

  window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
}

export function getBeaconTimeRemaining(beacon: Beacon): string | null {
  if (!beacon.expiresAt) return null;

  const now = new Date();
  const expires = new Date(beacon.expiresAt);
  const diff = expires.getTime() - now.getTime();

  if (diff <= 0) return 'Expired';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h remaining`;
  }

  return `${hours}h ${minutes}m remaining`;
}
