import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export type PushPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

/**
 * Push notification stub — Wave 18.
 * Handles permission request and subscription lifecycle.
 * The VAPID public key is intentionally placeholder (HELD — Founder-gated for
 * production push credential activation). The subscription API path is also
 * a stub; wire to /api/push/subscribe when live credentials land.
 *
 * Works:  permission request flow, subscription object, notificationclick routing.
 * Staged: VAPID key, server registration, grocery/bounty send triggers.
 */

// Placeholder VAPID public key — replace with real key before activating push.
const VAPID_PUBLIC_KEY_PLACEHOLDER =
  'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<PushPermissionState>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission as PushPermissionState);
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error('Push notifications are not supported in this browser.');
      setPermission('unsupported');
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result as PushPermissionState);

    if (result !== 'granted') {
      toast.info('Notifications not enabled. You can turn them on in browser settings.');
      return;
    }

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY_PLACEHOLDER),
      });
      setSubscription(sub);
      // STAGED: POST sub to /api/push/subscribe when VAPID credentials are live.
      toast.success('Notifications enabled. We\'ll remind you about groceries and bounties.');
    } catch (err) {
      console.error('[Push] Subscription failed:', err);
      toast.error('Could not set up push notifications — try again later.');
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    if (!subscription) return;
    await subscription.unsubscribe();
    setSubscription(null);
    setPermission('default');
    toast.info('Notifications disabled.');
  }, [subscription]);

  return { permission, subscription, requestPermission, unsubscribe };
}
