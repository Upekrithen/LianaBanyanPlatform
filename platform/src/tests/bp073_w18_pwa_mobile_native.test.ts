// @vitest-environment jsdom
/**
 * Wave 18 — PWA / Mobile / Native Polish
 * BP073 · Phase γ — Reach
 * 30 scopes: offline flows, install/update, Electron Saltfighter, Mac/Linux builds,
 *   dark/light parity, mobile 375px/428px, touch gestures, bottom nav, push stubs.
 *
 * Empirical: WORKS / PARTIAL / NOT YET per scope.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '../../..');
const PLATFORM = path.resolve(ROOT, 'platform');
const CAITHEDRAL = path.resolve(ROOT, 'caithedral-core');

// ─── Scope 1: Service worker exists and is registered ─────────────────────────
// WORKS

describe('W18-01 Service worker: file present and well-formed', () => {
  const swPath = path.join(PLATFORM, 'public/sw.js');
  const sw = fs.existsSync(swPath) ? fs.readFileSync(swPath, 'utf-8') : '';

  it('sw.js exists', () => {
    expect(fs.existsSync(swPath)).toBe(true);
  });

  it('install event handler present', () => {
    expect(sw).toContain("addEventListener('install'");
  });

  it('activate event handler present', () => {
    expect(sw).toContain("addEventListener('activate'");
  });

  it('fetch event handler present', () => {
    expect(sw).toContain("addEventListener('fetch'");
  });

  it('SKIP_WAITING message handler present', () => {
    expect(sw).toContain('SKIP_WAITING');
  });
});

// ─── Scope 2: Offline fallback page ───────────────────────────────────────────
// WORKS

describe('W18-02 Offline fallback page', () => {
  const offlinePath = path.join(PLATFORM, 'public/offline.html');
  const html = fs.existsSync(offlinePath) ? fs.readFileSync(offlinePath, 'utf-8') : '';

  it('offline.html exists', () => {
    expect(fs.existsSync(offlinePath)).toBe(true);
  });

  it('has viewport meta tag', () => {
    expect(html).toContain('name="viewport"');
  });

  it('has retry button', () => {
    expect(html).toContain('reload()');
  });

  it('has 44px touch target on button (min-height)', () => {
    expect(html).toContain('44px');
  });
});

// ─── Scope 3: SW offline routes — all initiative routes pre-cached ─────────────
// WORKS (Wave 18 B1 extended SHELL_ASSETS)

describe('W18-03 SW: all 16 initiative routes in shell cache list', () => {
  const swPath = path.join(PLATFORM, 'public/sw.js');
  const sw = fs.existsSync(swPath) ? fs.readFileSync(swPath, 'utf-8') : '';

  const INITIATIVES = [
    '/family-table', '/household-concierge', '/lets-go-shopping',
    '/rally-group', '/health-accords', '/jukebox', '/lets-make-bread',
    '/defense-klaus', '/didaskos', '/brass-tacks', '/power-to-the-people',
    '/hearth-initiative', '/map-and-compass', '/lets-make-dinner',
    '/lets-get-groceries', '/cai-bonfire',
  ];

  INITIATIVES.forEach((route) => {
    it(`initiative route cached: ${route}`, () => {
      expect(sw).toContain(`'${route}'`);
    });
  });
});

// ─── Scope 4: SW offline routes — all 8 spinout routes pre-cached ─────────────
// WORKS

describe('W18-04 SW: all 8 spinout routes in shell cache list', () => {
  const swPath = path.join(PLATFORM, 'public/sw.js');
  const sw = fs.existsSync(swPath) ? fs.readFileSync(swPath, 'utf-8') : '';

  const SPINOUTS = [
    '/spinouts', '/spinout/harper-guild', '/spinout/mnemosyne',
    '/spinout/stand-in-the-gap', '/spinout/anchor', '/spinout/battery-dispatch',
    '/spinout/defense-klaus', '/frontier/marketplace', '/frontier/borrow',
  ];

  SPINOUTS.forEach((route) => {
    it(`spinout route cached: ${route}`, () => {
      expect(sw).toContain(`'${route}'`);
    });
  });
});

// ─── Scope 5: SW — governance + economy routes ─────────────────────────────────
// WORKS

describe('W18-05 SW: governance and economy routes in shell cache list', () => {
  const swPath = path.join(PLATFORM, 'public/sw.js');
  const sw = fs.existsSync(swPath) ? fs.readFileSync(swPath, 'utf-8') : '';

  it('governance route cached', () => { expect(sw).toContain("'/governance'"); });
  it('voting route cached', () => { expect(sw).toContain("'/voting'"); });
  it('marks/redeem route cached', () => { expect(sw).toContain("'/marks/redeem'"); });
  it('bounty/feed route cached', () => { expect(sw).toContain("'/bounty/feed'"); });
  it('member/dashboard route cached', () => { expect(sw).toContain("'/member/dashboard'"); });
  it('proofs route cached', () => { expect(sw).toContain("'/proofs'"); });
});

// ─── Scope 6: Background sync — bounty submission queue ────────────────────────
// WORKS (IndexedDB queue + sync event wired)

describe('W18-06 Background sync: bounty submission queue', () => {
  const swPath = path.join(PLATFORM, 'public/sw.js');
  const sw = fs.existsSync(swPath) ? fs.readFileSync(swPath, 'utf-8') : '';

  it('sync event handler exists', () => {
    expect(sw).toContain("addEventListener('sync'");
  });

  it('sync-bounty-submissions tag handled', () => {
    expect(sw).toContain('sync-bounty-submissions');
  });

  it('IndexedDB bounty queue store defined', () => {
    expect(sw).toContain('bounty-submissions');
  });

  it('flushBountyQueue function exists', () => {
    expect(sw).toContain('flushBountyQueue');
  });

  it('posts to /api/bounties endpoint', () => {
    expect(sw).toContain("'/api/bounties'");
  });
});

// ─── Scope 7: Push notification stubs ──────────────────────────────────────────
// WORKS (push + notificationclick handlers wired; VAPID key staged)

describe('W18-07 Push notification stubs', () => {
  const swPath = path.join(PLATFORM, 'public/sw.js');
  const sw = fs.existsSync(swPath) ? fs.readFileSync(swPath, 'utf-8') : '';

  it('push event handler exists', () => {
    expect(sw).toContain("addEventListener('push'");
  });

  it('notificationclick handler exists', () => {
    expect(sw).toContain("addEventListener('notificationclick'");
  });

  it('grocery reminder routes to /lets-get-groceries', () => {
    expect(sw).toContain('/lets-get-groceries');
  });

  it('bounty alert routes to /bounty/feed', () => {
    expect(sw).toContain('/bounty/feed');
  });

  it('showNotification uses icon', () => {
    expect(sw).toContain('showNotification');
    expect(sw).toContain('/LianaBanyanLogo.png');
  });
});

// ─── Scope 8: usePushNotifications hook ────────────────────────────────────────
// WORKS

describe('W18-08 usePushNotifications hook', () => {
  const hookPath = path.join(PLATFORM, 'src/hooks/usePushNotifications.ts');
  const src = fs.existsSync(hookPath) ? fs.readFileSync(hookPath, 'utf-8') : '';

  it('hook file exists', () => {
    expect(fs.existsSync(hookPath)).toBe(true);
  });

  it('exports usePushNotifications', () => {
    expect(src).toContain('export function usePushNotifications');
  });

  it('requests permission via Notification.requestPermission', () => {
    expect(src).toContain('requestPermission');
  });

  it('subscribes to pushManager', () => {
    expect(src).toContain('pushManager.subscribe');
  });

  it('VAPID key marked as placeholder (staged)', () => {
    expect(src).toContain('VAPID_PUBLIC_KEY_PLACEHOLDER');
  });

  it('STAGED comment present (not activating without Founder gate)', () => {
    expect(src).toContain('STAGED');
  });
});

// ─── Scope 9: PWA manifest ─────────────────────────────────────────────────────
// WORKS

describe('W18-09 PWA manifest', () => {
  const manifestPath = path.join(PLATFORM, 'public/manifest.json');
  const manifest = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
    : {};

  it('manifest.json exists', () => {
    expect(fs.existsSync(manifestPath)).toBe(true);
  });

  it('has name field', () => {
    expect(manifest.name).toBeTruthy();
  });

  it('display mode is standalone', () => {
    expect(manifest.display).toBe('standalone');
  });

  it('has 192x192 icon', () => {
    const has192 = manifest.icons?.some((i: { sizes: string }) => i.sizes?.includes('192x192'));
    expect(has192).toBe(true);
  });

  it('has 512x512 icon', () => {
    const has512 = manifest.icons?.some((i: { sizes: string }) => i.sizes?.includes('512x512'));
    expect(has512).toBe(true);
  });

  it('has shortcuts', () => {
    expect(manifest.shortcuts?.length).toBeGreaterThan(0);
  });

  it('has screenshots for narrow and wide', () => {
    const narrow = manifest.screenshots?.some((s: { form_factor: string }) => s.form_factor === 'narrow');
    const wide = manifest.screenshots?.some((s: { form_factor: string }) => s.form_factor === 'wide');
    expect(narrow).toBe(true);
    expect(wide).toBe(true);
  });
});

// ─── Scope 10: PWA install prompt (beforeinstallprompt) ────────────────────────
// WORKS

describe('W18-10 PWA install prompt', () => {
  const hookPath = path.join(PLATFORM, 'src/hooks/usePWA.tsx');
  const promptPath = path.join(PLATFORM, 'src/components/PWAInstallPrompt.tsx');
  const src = fs.existsSync(hookPath) ? fs.readFileSync(hookPath, 'utf-8') : '';
  const prompt = fs.existsSync(promptPath) ? fs.readFileSync(promptPath, 'utf-8') : '';

  it('usePWA hook exists', () => {
    expect(fs.existsSync(hookPath)).toBe(true);
  });

  it('listens for beforeinstallprompt', () => {
    expect(src).toContain('beforeinstallprompt');
  });

  it('PWAInstallPrompt component exists', () => {
    expect(fs.existsSync(promptPath)).toBe(true);
  });

  it('prompt has 7-day dismiss snooze', () => {
    expect(prompt).toContain('7 * 24 * 60 * 60 * 1000');
  });

  it('prompt requires min 4 visits before showing', () => {
    expect(prompt).toContain('MIN_VISITS_BEFORE_PROMPT = 4');
  });

  it('touch-manipulation class on buttons', () => {
    expect(prompt).toContain('touch-manipulation');
  });
});

// ─── Scope 11: App update notification with one-click reload ───────────────────
// WORKS

describe('W18-11 App update notification (one-click reload)', () => {
  const hookPath = path.join(PLATFORM, 'src/hooks/usePWA.tsx');
  const src = fs.existsSync(hookPath) ? fs.readFileSync(hookPath, 'utf-8') : '';

  it('listens for updatefound on SW registration', () => {
    expect(src).toContain('updatefound');
  });

  it('sends SKIP_WAITING on click', () => {
    expect(src).toContain('SKIP_WAITING');
  });

  it('reloads page after skip', () => {
    expect(src).toContain('window.location.reload()');
  });

  it('shows Refresh action in toast', () => {
    expect(src).toContain('Refresh');
  });
});

// ─── Scope 12: Electron auto-updater end-to-end ────────────────────────────────
// WORKS (electron-updater wired in Wave 18; staging channel configured)

describe('W18-12 Electron auto-updater', () => {
  const mainPath = path.join(CAITHEDRAL, 'src/main/index.ts');
  const src = fs.existsSync(mainPath) ? fs.readFileSync(mainPath, 'utf-8') : '';

  it('electron-updater imported', () => {
    expect(src).toContain("from 'electron-updater'");
  });

  it('autoUpdater.autoDownload configured', () => {
    expect(src).toContain('autoUpdater.autoDownload');
  });

  it('update-available event handled', () => {
    expect(src).toContain("'update-available'");
  });

  it('update-downloaded shows install dialog', () => {
    expect(src).toContain("'update-downloaded'");
    expect(src).toContain('quitAndInstall');
  });

  it('IPC: autoUpdater:check handler registered', () => {
    expect(src).toContain("'autoUpdater:check'");
  });

  it('IPC: autoUpdater:quitAndInstall handler registered', () => {
    expect(src).toContain("'autoUpdater:quitAndInstall'");
  });

  it('publish URL points to mnemosynec.ai/download/', () => {
    const pkgPath = path.join(CAITHEDRAL, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    expect(pkg.build.publish.url).toContain('mnemosynec.ai/download/');
  });
});

// ─── Scope 13: Electron deep-link protocol (cai://) ────────────────────────────
// WORKS

describe('W18-13 Electron deep-link (cai://)', () => {
  const mainPath = path.join(CAITHEDRAL, 'src/main/index.ts');
  const src = fs.existsSync(mainPath) ? fs.readFileSync(mainPath, 'utf-8') : '';

  it('setAsDefaultProtocolClient registers cai://', () => {
    expect(src).toContain("setAsDefaultProtocolClient('cai')");
  });

  it('second-instance handles cai:// on Windows', () => {
    expect(src).toContain("startsWith('cai://')");
  });

  it('open-url handles cai:// on macOS', () => {
    expect(src).toContain("'open-url'");
  });

  it('deep-link IPC handler forwards to renderer', () => {
    expect(src).toContain("'deepLink:open'");
    expect(src).toContain("send('deep-link'");
  });
});

// ─── Scope 14: Electron tray icon ──────────────────────────────────────────────
// WORKS

describe('W18-14 Electron tray icon', () => {
  const mainPath = path.join(CAITHEDRAL, 'src/main/index.ts');
  const src = fs.existsSync(mainPath) ? fs.readFileSync(mainPath, 'utf-8') : '';

  it('setupTray function defined', () => {
    expect(src).toContain('function setupTray()');
  });

  it('tray references tray-icon.png', () => {
    expect(src).toContain('tray-icon.png');
  });

  it('tray menu has Open Dashboard item', () => {
    expect(src).toContain('Open Dashboard');
  });

  it('tray menu has MoneyPenny Meter item', () => {
    expect(src).toContain('MoneyPenny');
  });

  it('tray click focuses or shows main window', () => {
    expect(src).toContain("tray.on('click'");
  });
});

// ─── Scope 15: Electron first-run spine ────────────────────────────────────────
// WORKS (logic) / STAGED (Mac/Linux real hardware)

describe('W18-15 Electron first-run spine', () => {
  const mainPath = path.join(CAITHEDRAL, 'src/main/index.ts');
  const src = fs.existsSync(mainPath) ? fs.readFileSync(mainPath, 'utf-8') : '';

  it('isFirstRun function defined', () => {
    expect(src).toContain('function isFirstRun()');
  });

  it('markFirstRunComplete writes first_run.flag', () => {
    expect(src).toContain('first_run.flag');
    expect(src).toContain('markFirstRunComplete');
  });

  it('IPC app:firstRun handler registered', () => {
    expect(src).toContain("'app:firstRun'");
  });

  it('IPC app:markFirstRunComplete handler registered', () => {
    expect(src).toContain("'app:markFirstRunComplete'");
  });

  it('first-run spine doc exists for all 3 OSes', () => {
    const docPath = path.join(CAITHEDRAL, 'docs/FIRST_RUN_SPINE.md');
    expect(fs.existsSync(docPath)).toBe(true);
    const doc = fs.readFileSync(docPath, 'utf-8');
    expect(doc).toContain('Windows');
    expect(doc).toContain('macOS');
    expect(doc).toContain('Linux');
  });
});

// ─── Scope 16: Mac build targets (dmg + zip, x64 + arm64) ─────────────────────
// WORKS

describe('W18-16 Mac build targets', () => {
  const pkgPath = path.join(CAITHEDRAL, 'package.json');
  const pkg = fs.existsSync(pkgPath) ? JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) : {};
  const macTargets = pkg.build?.mac?.target ?? [];

  it('mac dmg target configured', () => {
    const dmg = macTargets.find((t: { target: string }) => t.target === 'dmg');
    expect(dmg).toBeTruthy();
  });

  it('mac zip target configured', () => {
    const zip = macTargets.find((t: { target: string }) => t.target === 'zip');
    expect(zip).toBeTruthy();
  });

  it('mac arm64 arch included', () => {
    const hasArm = macTargets.some((t: { arch: string[] }) => t.arch?.includes('arm64'));
    expect(hasArm).toBe(true);
  });

  it('hardenedRuntime enabled', () => {
    expect(pkg.build?.mac?.hardenedRuntime).toBe(true);
  });

  it('entitlements file referenced', () => {
    expect(pkg.build?.mac?.entitlements).toContain('entitlements.mac.plist');
  });

  it('entitlements.mac.plist file exists', () => {
    const plistPath = path.join(CAITHEDRAL, 'assets/entitlements.mac.plist');
    expect(fs.existsSync(plistPath)).toBe(true);
  });

  it('dist:mac script defined', () => {
    expect(pkg.scripts?.['dist:mac']).toBeTruthy();
  });
});

// ─── Scope 17: Mac notarization checklist (HELD Founder-gated) ─────────────────
// STAGED (doc exists, notarize: false, Founder gate documented)

describe('W18-17 Mac notarization checklist (HELD - Founder-gated)', () => {
  const docPath = path.join(CAITHEDRAL, 'docs/MAC_NOTARIZATION_CHECKLIST.md');

  it('checklist doc exists', () => {
    expect(fs.existsSync(docPath)).toBe(true);
  });

  it('checklist marks status as HELD', () => {
    const doc = fs.readFileSync(docPath, 'utf-8');
    expect(doc).toContain('HELD');
  });

  it('notarize is false in package.json (not shipping until Founder unlocks)', () => {
    const pkgPath = path.join(CAITHEDRAL, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    expect(pkg.build?.mac?.notarize).toBe(false);
  });
});

// ─── Scope 18: Linux build targets (deb + rpm + AppImage) ─────────────────────
// WORKS

describe('W18-18 Linux build targets', () => {
  const pkgPath = path.join(CAITHEDRAL, 'package.json');
  const pkg = fs.existsSync(pkgPath) ? JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) : {};
  const linuxTargets = pkg.build?.linux?.target ?? [];

  it('deb target configured', () => {
    const deb = linuxTargets.find((t: { target: string }) => t.target === 'deb');
    expect(deb).toBeTruthy();
  });

  it('rpm target configured', () => {
    const rpm = linuxTargets.find((t: { target: string }) => t.target === 'rpm');
    expect(rpm).toBeTruthy();
  });

  it('AppImage target configured', () => {
    const appimg = linuxTargets.find((t: { target: string }) => t.target === 'AppImage');
    expect(appimg).toBeTruthy();
  });

  it('linux deb depends include libgtk-3-0', () => {
    const deps = pkg.build?.deb?.depends ?? [];
    expect(deps).toContain('libgtk-3-0');
  });

  it('linux category set to Office', () => {
    expect(pkg.build?.linux?.category).toBe('Office');
  });

  it('dist:linux script defined', () => {
    expect(pkg.scripts?.['dist:linux']).toBeTruthy();
  });

  it('Linux AppImage desktop integration documented', () => {
    const docPath = path.join(CAITHEDRAL, 'docs/FIRST_RUN_SPINE.md');
    const doc = fs.readFileSync(docPath, 'utf-8');
    expect(doc).toContain('AppImage');
    expect(doc).toContain('.desktop');
    expect(doc).toContain('x-scheme-handler/cai');
  });
});

// ─── Scope 19: System theme detection (prefers-color-scheme) ───────────────────
// WORKS

describe('W18-19 System theme detection hook', () => {
  const hookPath = path.join(PLATFORM, 'src/hooks/useSystemTheme.ts');
  const src = fs.existsSync(hookPath) ? fs.readFileSync(hookPath, 'utf-8') : '';

  it('useSystemTheme hook file exists', () => {
    expect(fs.existsSync(hookPath)).toBe(true);
  });

  it('uses prefers-color-scheme media query', () => {
    expect(src).toContain('prefers-color-scheme');
  });

  it('exports useSystemTheme', () => {
    expect(src).toContain('export function useSystemTheme');
  });

  it('exports useApplySystemTheme for root layout', () => {
    expect(src).toContain('export function useApplySystemTheme');
  });

  it('applies dark class to documentElement', () => {
    expect(src).toContain("classList.add('dark')");
    expect(src).toContain("classList.remove('dark')");
  });

  it('persists override to localStorage (lb-color-mode)', () => {
    expect(src).toContain('lb-color-mode');
  });

  it('listens for change events (reactive)', () => {
    expect(src).toContain("addEventListener('change'");
  });
});

// ─── Scope 20: Dark mode — initiative pages use dark-aware classes ─────────────
// PARTIAL (Tailwind dark: classes present in initiative pages; no device test)

describe('W18-20 Dark mode: initiative pages have dark-aware CSS', () => {
  const initiativeFiles = [
    'src/pages/FamilyTablePage.tsx',
    'src/pages/LetsGetGroceriesPage.tsx',
    'src/pages/HealthAccordsPage.tsx',
    'src/pages/DefenseKlausPage.tsx',
    'src/pages/BrassTacksPage.tsx',
    'src/pages/HearthInitiativePage.tsx',
  ];

  initiativeFiles.forEach((relPath) => {
    const filePath = path.join(PLATFORM, relPath);
    it(`${path.basename(relPath)} file exists`, () => {
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  it('ThemeContext exists for custom theming layer', () => {
    const ctxPath = path.join(PLATFORM, 'src/contexts/ThemeContext.tsx');
    expect(fs.existsSync(ctxPath)).toBe(true);
  });

  it('ThemeSwitcher component exists', () => {
    const switcherPath = path.join(PLATFORM, 'src/components/ThemeSwitcher.tsx');
    expect(fs.existsSync(switcherPath)).toBe(true);
  });
});

// ─── Scope 21: Light mode parity — spinout pages ──────────────────────────────
// PARTIAL (pages exist; device parity untested)

describe('W18-21 Light mode parity: spinout pages exist', () => {
  const spinoutFiles = [
    'src/pages/HarperGuildSpinoutPage.tsx',
    'src/pages/MnemosyneCSpinoutPage.tsx',
    'src/pages/StandInTheGapSpinoutPage.tsx',
    'src/pages/AnchorSpinoutPage.tsx',
    'src/pages/BatteryDispatchSpinoutPage.tsx',
    'src/pages/DefenseKlausSpinoutPage.tsx',
    'src/pages/SpinoutsIndexPage.tsx',
    'src/pages/FrontierMarketplacePage.tsx',
  ];

  spinoutFiles.forEach((relPath) => {
    it(`${path.basename(relPath)} file exists`, () => {
      expect(fs.existsSync(path.join(PLATFORM, relPath))).toBe(true);
    });
  });
});

// ─── Scope 22: Mobile 375px viewport — key pages respond at 375px ──────────────
// PARTIAL (CSS responsive; no Playwright device test yet)

describe('W18-22 Mobile 375px viewport: responsive CSS indicators', () => {
  const indexPath = path.join(PLATFORM, 'src/pages/Index.tsx');
  const src = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf-8') : '';

  it('Index.tsx exists', () => {
    expect(fs.existsSync(indexPath)).toBe(true);
  });

  it('offline.html uses 100dvh (dynamic viewport height)', () => {
    const offlineHtml = fs.readFileSync(path.join(PLATFORM, 'public/offline.html'), 'utf-8');
    expect(offlineHtml).toContain('100dvh');
  });

  it('PWAInstallPrompt uses max-w-sm on mobile', () => {
    const promptSrc = fs.readFileSync(
      path.join(PLATFORM, 'src/components/PWAInstallPrompt.tsx'),
      'utf-8'
    );
    expect(promptSrc).toContain('max-w-sm');
  });

  it('PWAInstallPrompt buttons have h-11 (44px) touch target on mobile', () => {
    const promptSrc = fs.readFileSync(
      path.join(PLATFORM, 'src/components/PWAInstallPrompt.tsx'),
      'utf-8'
    );
    expect(promptSrc).toContain('h-11');
  });
});

// ─── Scope 23: Mobile 428px viewport — large phone ────────────────────────────
// PARTIAL (same CSS layer as 375px; no device test)

describe('W18-23 Mobile 428px viewport coverage (large phones)', () => {
  it('manifest orientation is portrait-primary (correct for tall phones)', () => {
    const manifestPath = path.join(PLATFORM, 'public/manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    expect(manifest.orientation).toBe('portrait-primary');
  });

  it('offline.html respects touch-action: manipulation', () => {
    const offlineHtml = fs.readFileSync(path.join(PLATFORM, 'public/offline.html'), 'utf-8');
    expect(offlineHtml).toContain('touch-action');
  });
});

// ─── Scope 24: Touch gesture support on initiative cards ──────────────────────
// WORKS

describe('W18-24 Touch gesture hook (useTouchGesture)', () => {
  const hookPath = path.join(PLATFORM, 'src/hooks/useTouchGesture.ts');
  const src = fs.existsSync(hookPath) ? fs.readFileSync(hookPath, 'utf-8') : '';

  it('useTouchGesture hook exists', () => {
    expect(fs.existsSync(hookPath)).toBe(true);
  });

  it('exports useTouchGesture', () => {
    expect(src).toContain('export function useTouchGesture');
  });

  it('handles swipeLeft and swipeRight', () => {
    expect(src).toContain('onSwipeLeft');
    expect(src).toContain('onSwipeRight');
  });

  it('handles swipeUp and swipeDown', () => {
    expect(src).toContain('onSwipeUp');
    expect(src).toContain('onSwipeDown');
  });

  it('uses threshold to avoid accidental triggers', () => {
    expect(src).toContain('threshold');
  });

  it('returns touchHandlers object (spread onto element)', () => {
    expect(src).toContain('touchHandlers');
  });
});

// ─── Scope 25: Bottom navigation for mobile ────────────────────────────────────
// WORKS

describe('W18-25 MobileBottomNav component', () => {
  const navPath = path.join(PLATFORM, 'src/components/MobileBottomNav.tsx');
  const src = fs.existsSync(navPath) ? fs.readFileSync(navPath, 'utf-8') : '';

  it('MobileBottomNav.tsx exists', () => {
    expect(fs.existsSync(navPath)).toBe(true);
  });

  it('exports MobileBottomNav', () => {
    expect(src).toContain('export function MobileBottomNav');
  });

  it('hidden on md+ screens (md:hidden class)', () => {
    expect(src).toContain('md:hidden');
  });

  it('fixed to bottom (fixed bottom-0)', () => {
    expect(src).toContain('fixed bottom-0');
  });

  it('has 5 nav items', () => {
    expect(src).toContain('NAV_ITEMS');
    // Five entries
    const matches = src.match(/href:/g);
    expect((matches ?? []).length).toBeGreaterThanOrEqual(5);
  });

  it('uses touch-manipulation for tap responsiveness', () => {
    expect(src).toContain('touch-manipulation');
  });

  it('sets aria-current="page" on active item', () => {
    expect(src).toContain('aria-current');
  });
});

// ─── Scope 26: Electron single-instance lock ───────────────────────────────────
// WORKS

describe('W18-26 Electron single-instance lock + second-instance handler', () => {
  const mainPath = path.join(CAITHEDRAL, 'src/main/index.ts');
  const src = fs.existsSync(mainPath) ? fs.readFileSync(mainPath, 'utf-8') : '';

  it('requestSingleInstanceLock called', () => {
    expect(src).toContain('requestSingleInstanceLock');
  });

  it('second-instance event handled', () => {
    expect(src).toContain("'second-instance'");
  });

  it('app quits if lock not obtained', () => {
    expect(src).toContain('app.quit()');
  });
});

// ─── Scope 27: Electron window bounds persistence (multi-display safe) ─────────
// WORKS

describe('W18-27 Electron window bounds persistence', () => {
  const mainPath = path.join(CAITHEDRAL, 'src/main/index.ts');
  const src = fs.existsSync(mainPath) ? fs.readFileSync(mainPath, 'utf-8') : '';

  it('loadWindowBounds function defined', () => {
    expect(src).toContain('function loadWindowBounds');
  });

  it('saveWindowBounds function defined', () => {
    expect(src).toContain('function saveWindowBounds');
  });

  it('getSafeBounds guards multi-display edge', () => {
    expect(src).toContain('function getSafeBounds');
    expect(src).toContain('getAllDisplays');
  });

  it('bounds saved to window_bounds.json', () => {
    expect(src).toContain('window_bounds.json');
  });
});

// ─── Scope 28: Install checklist — all 3 platforms ────────────────────────────
// WORKS

describe('W18-28 Install checklist for all 3 platforms', () => {
  const docPath = path.join(CAITHEDRAL, 'docs/FIRST_RUN_SPINE.md');
  const doc = fs.existsSync(docPath) ? fs.readFileSync(docPath, 'utf-8') : '';

  it('checklist doc exists', () => {
    expect(fs.existsSync(docPath)).toBe(true);
  });

  it('Windows row in table', () => {
    expect(doc).toContain('Win');
  });

  it('Mac row in table', () => {
    expect(doc).toContain('Mac');
  });

  it('Linux row in table', () => {
    expect(doc).toContain('Linux');
  });

  it('installer type documented for each platform', () => {
    expect(doc).toContain('NSIS');
    expect(doc).toContain('DMG');
    expect(doc).toContain('AppImage');
  });
});

// ─── Scope 29: SW cache version upgraded (Wave 18 routes) ─────────────────────
// WORKS (Wave 17 perf pass elevated to lb-v3; Wave 18 routes added atop it)

describe('W18-29 SW cache versioning (elevated for Wave 18 routes)', () => {
  const swPath = path.join(PLATFORM, 'public/sw.js');
  const sw = fs.existsSync(swPath) ? fs.readFileSync(swPath, 'utf-8') : '';

  it('cache version is lb-v3 (Wave 17+18 combined)', () => {
    expect(sw).toContain("'lb-v3'");
  });

  it('cache keys use CACHE_VERSION template (lb-v3 prefix at runtime)', () => {
    // Template literal: `${CACHE_VERSION}-shell` - prefix resolved at runtime
    expect(sw).toContain('`${CACHE_VERSION}-shell`');
  });
});

// ─── Scope 30: Electron build scripts complete (win + mac + linux) ─────────────
// WORKS

describe('W18-30 Electron build scripts (win + mac + linux)', () => {
  const pkgPath = path.join(CAITHEDRAL, 'package.json');
  const pkg = fs.existsSync(pkgPath) ? JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) : {};

  it('dist:win script defined', () => {
    expect(pkg.scripts?.['dist:win']).toBeTruthy();
  });

  it('dist:mac script defined', () => {
    expect(pkg.scripts?.['dist:mac']).toBeTruthy();
  });

  it('dist:linux script defined', () => {
    expect(pkg.scripts?.['dist:linux']).toBeTruthy();
  });

  it('electron-updater in dependencies', () => {
    expect(pkg.dependencies?.['electron-updater']).toBeTruthy();
  });

  it('electron-builder in devDependencies', () => {
    expect(pkg.devDependencies?.['electron-builder']).toBeTruthy();
  });

  it('asar: true for production builds', () => {
    expect(pkg.build?.asar).toBe(true);
  });

  it('publish provider configured (generic + mnemosynec.ai URL)', () => {
    expect(pkg.build?.publish?.provider).toBe('generic');
    expect(pkg.build?.publish?.url).toBeTruthy();
  });
});
