"use strict";
// AMPLIFY Computer — Electron Preload
// B37 Phase 1-3 — Exposes safe IPC bridge to renderer via contextBridge
// Phase 3 additions: substrate query/write, federation status, force-mode
Object.defineProperty(exports, "__esModule", { value: true });
// Main-process watchdog (Bushel 58) — respond even if renderer React tree is wedged
ipcRenderer.on('watchdog-ping', () => {
    ipcRenderer.send('watchdog-pong');
});
// ─── Bridge ───────────────────────────────────────────────────────────────────
contextBridge.exposeInMainWorld('amplify', {
    // ── Mode ──────────────────────────────────────────────────────────────────
    getFrameMode: () => ipcRenderer.invoke('get-frame-mode'),
    setFrameMode: (mode) => ipcRenderer.send('set-frame-mode', { mode }),
    forceFrameMode: (mode) => ipcRenderer.invoke('force-frame-mode', { mode }),
    onFrameModeChanged: (cb) => {
        const handler = (_event, payload) => cb(payload);
        ipcRenderer.on('frame-mode-changed', handler);
        return () => ipcRenderer.removeListener('frame-mode-changed', handler);
    },
    // ── Overlay ───────────────────────────────────────────────────────────────
    setClickthrough: (enabled) => ipcRenderer.send('set-clickthrough', { enabled }),
    // ── Ollama ────────────────────────────────────────────────────────────────
    getOllamaStatus: () => ipcRenderer.invoke('get-ollama-status'),
    // KniPr012 — check if Ollama binary is installed (not just daemon running)
    checkOllama: () => ipcRenderer.invoke('check-ollama'),
    pullDefaultModel: () => ipcRenderer.invoke('pull-default-model'),
    listOllamaModels: () => ipcRenderer.invoke('list-ollama-models'),
    checkDiskSpace: () => ipcRenderer.invoke('check-disk-space'),
    onOllamaPullProgress: (cb) => {
        const handler = (_event, progress) => cb(progress);
        ipcRenderer.on('ollama-pull-progress', handler);
        return () => ipcRenderer.removeListener('ollama-pull-progress', handler);
    },
    // SEG-U-6: pull a specific named model with streaming progress events
    pullNamedModel: (modelName) => ipcRenderer.invoke('pull-named-model', { modelName }),
    // SEG-V-1: live 3-branch pre-flight -- reachable? + model present? (reused by SEG-V-4)
    checkOllamaAndModel: (modelName) => ipcRenderer.invoke('check-ollama-and-model', { modelName }),
    // BP067 v0.1.24 — transparent install + floor model
    setupPrivateAI: () => ipcRenderer.invoke('setup-private-ai'),
    markBp067FirstRunComplete: () => ipcRenderer.invoke('mark-bp067-first-run-complete'),
    askFloorModel: (prompt) => ipcRenderer.invoke('ask-floor-model', { prompt }),
    onEngineSetupProgress: (cb) => {
        const handler = (_event, progress) => cb(progress);
        ipcRenderer.on('engine-setup-progress', handler);
        return () => ipcRenderer.removeListener('engine-setup-progress', handler);
    },
    // ── Substrate (Phase 3) ───────────────────────────────────────────────────
    /** Route a query through the three-mode substrate router (AI Burst / Normal / Fallback) */
    substrateQuery: (query, model) => ipcRenderer.invoke('substrate-query', { query, model }),
    /** Write a new record to the local substrate index + queue federation sync */
    substrateWrite: (text, source, keywords) => ipcRenderer.invoke('substrate-write', { text, source, keywords }),
    // ── Federation (Phase 3) ──────────────────────────────────────────────────
    getFederationStatus: () => ipcRenderer.invoke('get-federation-status'),
    setMemberToken: (token) => ipcRenderer.invoke('set-member-token', { token }),
    // ── AMPLIFY Telemetry ─────────────────────────────────────────────────────
    getAMPLIFYSnapshot: () => ipcRenderer.invoke('get-amplify-snapshot'),
    /** Full historical summary — today / week / month / daily breakdown / all-time */
    getAMPLIFYSummary: () => ipcRenderer.invoke('get-amplify-summary'),
    // ── App Version (MV-VERSION-DISPLAY BP044) ───────────────────────────────
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    // ── Auto-Update ───────────────────────────────────────────────────────────
    getUpdateState: () => ipcRenderer.invoke('get-update-state'),
    checkForUpdates: () => ipcRenderer.send('check-for-updates'),
    installUpdate: () => ipcRenderer.send('install-update'),
    // BP067 Phase 1D — user-triggered download (safe tier: no auto-download on unsigned binary)
    downloadUpdate: () => ipcRenderer.send('download-update'),
    // 1D-FIX — opt-out toggle for autoInstallOnAppQuit (persisted in renderer localStorage)
    setAutoInstallOnQuit: (enabled) => ipcRenderer.send('set-auto-install-on-quit', enabled),
    onUpdateStateChanged: (cb) => {
        const handler = (_event, state) => cb(state);
        ipcRenderer.on('update-state-changed', handler);
        return () => ipcRenderer.removeListener('update-state-changed', handler);
    },
    // ── MV-CN Peer Mesh (SAGA 3 BP045 W1) ───────────────────────────────────
    getMeshState: () => ipcRenderer.invoke('get-mesh-state'),
    // ── MESH-6: Federation invite/accept/leave + SID fetch ───────────────────
    federationGenerateInvite: () => ipcRenderer.invoke('federation:generate-invite'),
    federationAcceptInvite: (token) => ipcRenderer.invoke('federation:accept-invite', token),
    federationLeavePeer: (peerId) => ipcRenderer.invoke('federation:leave-peer', peerId),
    federationFetchSid: (dag_id, peerId) => ipcRenderer.invoke('federation:fetch-sid', dag_id, peerId),
    onRelayStateChanged: (cb) => {
        const handler = (_event, state) => cb(state);
        ipcRenderer.on('relay-state-changed', handler);
        return () => ipcRenderer.removeListener('relay-state-changed', handler);
    },
    onMeshStateChanged: (cb) => {
        const handler = (_event, state) => cb(state);
        ipcRenderer.on('mesh-state-changed', handler);
        return () => ipcRenderer.removeListener('mesh-state-changed', handler);
    },
    // ── MoneyPenny Mobile ─────────────────────────────────────────────────────
    getMoneyPennyUrl: () => ipcRenderer.invoke('get-moneypenny-url'),
    // ── Auth (Phase 7) ────────────────────────────────────────────────────────
    getAuthState: () => ipcRenderer.invoke('get-auth-state'),
    authSignIn: () => ipcRenderer.send('auth-sign-in'),
    authSignOut: () => ipcRenderer.send('auth-sign-out'),
    authStartTrial: () => ipcRenderer.send('auth-start-trial'),
    authOpenJoin: () => ipcRenderer.send('auth-open-join'),
    onAuthStateChanged: (cb) => {
        const handler = (_event, state) => cb(state);
        ipcRenderer.on('auth-state-changed', handler);
        return () => ipcRenderer.removeListener('auth-state-changed', handler);
    },
    // ── Dashboard ─────────────────────────────────────────────────────────────
    openDashboard: () => ipcRenderer.send('open-dashboard'),
    // ── Hearth App Builder (B69) ──────────────────────────────────────────────
    hearthBuild: (request, memberId) => ipcRenderer.invoke('hearth-build', { request, memberId }),
    hearthInstall: (opts) => ipcRenderer.invoke('hearth-install', opts),
    hearthLibraryQuery: (memberId) => ipcRenderer.invoke('hearth-library-query', { memberId }),
    hearthUninstall: (uuid) => ipcRenderer.invoke('hearth-uninstall', { uuid }),
    hearthHealthz: () => ipcRenderer.invoke('hearth-healthz'),
    hearthSpecExtractSmoke: () => ipcRenderer.invoke('hearth-spec-extract-smoke'),
    onHearthBuildProgress: (cb) => {
        const handler = (_event, progress) => cb(progress);
        ipcRenderer.on('hearth-app-build-progress', handler);
        return () => ipcRenderer.removeListener('hearth-app-build-progress', handler);
    },
    onHearthBuildComplete: (cb) => {
        const handler = (_event, result) => cb(result);
        ipcRenderer.on('hearth-app-build-complete', handler);
        return () => ipcRenderer.removeListener('hearth-app-build-complete', handler);
    },
    onHearthBuildError: (cb) => {
        const handler = (_event, err) => cb(err);
        ipcRenderer.on('hearth-app-build-error', handler);
        return () => ipcRenderer.removeListener('hearth-app-build-error', handler);
    },
    // ── Hearth Conjunction Window (B83) ──────────────────────────────────────
    openHearthConjunction: () => ipcRenderer.send('open-hearth-conjunction'),
    // BP041 SAGA 3 — Watch View toggle
    // hideToWatchView: hides the full window; frame border + OverlayTag remain visible.
    // showHearthConjunction (alias): restores window from Watch View.
    hideToWatchView: () => ipcRenderer.invoke('hide-to-watch-view'),
    showHearthConjunction: () => ipcRenderer.invoke('show-hearth-conjunction'),
    conjunctionGetState: () => ipcRenderer.invoke('conjunction-get-state'),
    conjunctionGetAvailability: () => ipcRenderer.invoke('conjunction-get-availability'),
    conjunctionSelect: (mode) => ipcRenderer.invoke('conjunction-select', { mode }),
    conjunctionSetOverride: (mode) => ipcRenderer.invoke('conjunction-set-override', { mode }),
    conjunctionDispatch: (prompt, mode_override) => ipcRenderer.invoke('conjunction-dispatch', { prompt, mode_override }),
    conjunctionGetSubstrateContext: () => ipcRenderer.invoke('conjunction-get-substrate-context'),
    // ── Drekaskip Status (B83c) ───────────────────────────────────────────────
    drekaskipQuery: () => ipcRenderer.invoke('drekaskip-query'),
    // ── Adaptive Concurrency Carrier — Layer 4 hot-tune (BP041) ──────────────
    concurrencyGetCap: () => ipcRenderer.invoke('concurrency-get-cap'),
    concurrencyProbeNow: () => ipcRenderer.invoke('concurrency-probe-now'),
    concurrencySetOverride: (n) => ipcRenderer.invoke('concurrency-set-override', { n }),
    // ── Watchdog Status (B83d) ────────────────────────────────────────────────
    watchdogStatus: () => ipcRenderer.invoke('watchdog-status'),
    watchdogHistory: (subject, window_hours) => ipcRenderer.invoke('watchdog-history', { subject, window_hours }),
    // ── Webview preload path (B83b) ───────────────────────────────────────────
    getWebviewPreloadPath: () => ipcRenderer.sendSync('get-webview-preload-path'),
    // ── On-Deck Master-of-Ceremonies (BP037) ──────────────────────────────────
    onDeckList: () => ipcRenderer.invoke('on-deck-list'),
    // ── Pantheon — Pixie Dust Mining (BP041 SAGA 1) ───────────────────────────
    /** Open Electron native folder-picker dialog; returns selected folder path or null */
    pantheonPickFolder: () => ipcRenderer.invoke('pantheon-pick-folder'),
    /** Load per-folder dual-checkbox preferences for a member */
    pantheonGetPrefs: (memberId) => ipcRenderer.invoke('pantheon-get-prefs', { memberId }),
    /** Save per-folder dual-checkbox preference */
    pantheonSetPref: (memberId, folderPath, pixelated, federationShared, subfolderOverrides) => ipcRenderer.invoke('pantheon-set-pref', { memberId, folderPath, pixelated, federationShared, subfolderOverrides }),
    /** Remove a folder from the substrate scope */
    pantheonRemovePref: (memberId, folderPath) => ipcRenderer.invoke('pantheon-remove-pref', { memberId, folderPath }),
    /** Dispatch the Pantheon on a specific folder (all 6 personas) */
    pantheonDispatch: (memberId, folderPath, sharingScope) => ipcRenderer.invoke('pantheon-dispatch', { memberId, folderPath, sharingScope }),
    /** Subscribe to Pantheon progress events */
    onPantheonProgress: (cb) => {
        const handler = (_event, evt) => cb(evt);
        ipcRenderer.on('pantheon-progress', handler);
        return () => ipcRenderer.removeListener('pantheon-progress', handler);
    },
    /** List all tablets for a member */
    pantheonListTablets: (memberId, grade, persona) => ipcRenderer.invoke('pantheon-list-tablets', { memberId, grade, persona }),
    /** Count tablets for a member */
    pantheonCountTablets: (memberId) => ipcRenderer.invoke('pantheon-count-tablets', { memberId }),
    /** Wipe all tablets for a member (sovereignty right) */
    pantheonWipe: (memberId) => ipcRenderer.invoke('pantheon-wipe', { memberId }),
    /** Get active Pantheon sessions */
    pantheonActiveSessions: () => ipcRenderer.invoke('pantheon-active-sessions'),
    // ── Scribe Monitor — BP041 SAGA 2 ────────────────────────────────────────
    /** Toggle per-scribe metric monitoring ON/OFF */
    scribeToggleMonitor: (scribeId, on) => ipcRenderer.invoke('scribe-toggle-monitor', { scribeId, on }),
    /**
     * Get aggregated metric summaries for given scribe IDs.
     * Pass an empty array to get initial enabled-state hydration for all known scribes.
     */
    scribeGetMetrics: (scribeIds) => ipcRenderer.invoke('scribe-get-metrics', { scribeIds }),
    // ── In Conjunction Agent Panel — SAGA 4 BP041 ────────────────────────────
    /**
     * Run static + live probe for an agent.
     * Returns AgentProbeResult — status only, never key values (R16 compliant).
     */
    agentProbe: (agentId, opts) => ipcRenderer.invoke('agent-probe', { agentId, ...opts }),
    /**
     * Set API key for an agent.
     * Key value flows INTO main process; is never returned back (R16 / NO-API-KEY-EXPOSURE).
     * Returns { ok, error? } only — key value is never echoed.
     */
    agentSetApiKey: (agentId, keyValue) => ipcRenderer.invoke('agent-set-api-key', { agentId, keyValue }),
    /**
     * Get API key presence status for all agents.
     * Returns Record<agentId, isSet> — values are boolean only (R16 compliant).
     */
    agentGetApiKeyStatus: () => ipcRenderer.invoke('agent-get-api-key-status'),
    /**
     * Get tier choices persisted at ~/.lb_substrate/in_conjunction_tiers.json.
     */
    agentGetTierChoices: () => ipcRenderer.invoke('agent-get-tier-choices'),
    /**
     * Persist tier choice for an agent.
     */
    agentSetTierChoice: (agentId, tierId) => ipcRenderer.invoke('agent-set-tier-choice', { agentId, tierId }),
    /**
     * Get loaded plugin agents (from ~/.lb_substrate/plugins/agents/*.json).
     */
    agentGetPlugins: () => ipcRenderer.invoke('agent-get-plugins'),
    /**
     * Get plugin registry metadata (id, filename, ipLedgerRef, authorHandle, loadedAt).
     */
    agentGetPluginRegistry: () => ipcRenderer.invoke('agent-get-plugin-registry'),
    // ── Kitchen Table™ + Recipes™ + Atlas™ (BP052 v0.1.8) ────────────────────
    kitchenTable: {
        listSessions: () => ipcRenderer.invoke('kitchen-table:list-sessions'),
        getSession: (id) => ipcRenderer.invoke('kitchen-table:get-session', { id }),
        createSession: (data) => ipcRenderer.invoke('kitchen-table:create-session', data),
        updateSession: (id, data) => ipcRenderer.invoke('kitchen-table:update-session', { id, data }),
        deleteSession: (id) => ipcRenderer.invoke('kitchen-table:delete-session', { id }),
        listRecipes: () => ipcRenderer.invoke('kitchen-table:list-recipes'),
        getRecipe: (id) => ipcRenderer.invoke('kitchen-table:get-recipe', { id }),
        createRecipe: (data) => ipcRenderer.invoke('kitchen-table:create-recipe', data),
        updateRecipe: (id, data) => ipcRenderer.invoke('kitchen-table:update-recipe', { id, data }),
        deleteRecipe: (id) => ipcRenderer.invoke('kitchen-table:delete-recipe', { id }),
        listAtlasEvents: () => ipcRenderer.invoke('kitchen-table:list-atlas-events'),
        getAtlasEvent: (id) => ipcRenderer.invoke('kitchen-table:get-atlas-event', { id }),
        createAtlasEvent: (data) => ipcRenderer.invoke('kitchen-table:create-atlas-event', data),
        updateAtlasEvent: (id, data) => ipcRenderer.invoke('kitchen-table:update-atlas-event', { id, data }),
        deleteAtlasEvent: (id) => ipcRenderer.invoke('kitchen-table:delete-atlas-event', { id }),
        openPhotoDialog: () => ipcRenderer.invoke('kitchen-table:open-photo-dialog'),
        p2pStart: (peerId, displayName) => ipcRenderer.invoke('kitchen-table:p2p-start', { peerId, displayName }),
        p2pStop: () => ipcRenderer.invoke('kitchen-table:p2p-stop'),
        p2pPeers: () => ipcRenderer.invoke('kitchen-table:p2p-peers'),
    },
    // ── SubstratedFolderWatcher™ (SAGA-γ v0.1.10) ────────────────────────────
    watcher: {
        addFolder: (folderPath) => ipcRenderer.invoke('watcher:add-folder', folderPath),
        removeFolder: (folderId) => ipcRenderer.invoke('watcher:remove-folder', folderId),
        listFolders: () => ipcRenderer.invoke('watcher:list-folders'),
        getStats: () => ipcRenderer.invoke('watcher:get-stats'),
        openFolderDialog: () => ipcRenderer.invoke('watcher:open-folder-dialog'),
        onEbletMinted: (callback) => {
            ipcRenderer.on('watcher:eblet-minted', (_event, eblet) => callback(eblet));
        },
        onFolderError: (callback) => {
            ipcRenderer.on('watcher:folder-error', (_event, payload) => callback(payload));
        },
    },
    // ── BP067 Phase 3B — mnemo://focus/<tab_id> deep-link focus-tab event ──────
    onNavigateFocusTab: (cb) => {
        const handler = (_event, payload) => cb(payload.tabId);
        ipcRenderer.on('navigate:focus-tab', handler);
        return () => ipcRenderer.removeListener('navigate:focus-tab', handler);
    },
    // ── SAGA 13 BP046B — 5-Marks first-install bonus ─────────────────────────
    /** Credit 5 marks on first install + first Stage 1 Gauntlet completion. One-per-account. */
    creditFirstInstallMarks: () => ipcRenderer.send('credit-first-install-marks'),
    // ── Trail Eblet Reader (KniPr035) ────────────────────────────────────────
    trailEblet: {
        list: () => ipcRenderer.invoke('trail-eblet:list'),
        read: (args) => ipcRenderer.invoke('trail-eblet:read', args),
        listScreenshots: (args) => ipcRenderer.invoke('trail-eblet:list-screenshots', args),
        readScreenshot: (args) => ipcRenderer.invoke('trail-eblet:read-screenshot', args),
    },
    // ── Utility (SAGA 07 BP046B) ─────────────────────────────────────────────
    /** Open a URL in the system default browser */
    openExternal: (url) => ipcRenderer.send('open-external', { url }),
    /** Hide the transparent overlay window */
    hideOverlay: () => ipcRenderer.send('hide-overlay'),
    /** Show the transparent overlay window */
    showOverlay: () => ipcRenderer.send('show-overlay'),
    // ── Chronos Research Consent (KniPr038) ──────────────────────────────────
    /** Write a sha256-signed consent Eblet to ~/.amplify/consent/ */
    writeChronosConsent: (consentPayload) => ipcRenderer.invoke('write-chronos-consent', consentPayload),
    /** Write a sha256-signed revocation Eblet to ~/.amplify/consent/ */
    revokeChronosConsent: (payload) => ipcRenderer.invoke('revoke-chronos-consent', payload),
    // ── Phoebe™ Idea Storage (C.17 · BP055) ─────────────────────────────────
    /** Save an idea to the in-memory Phoebe store */
    saveIdea: (idea) => ipcRenderer.invoke('save-idea', idea),
    /** Retrieve all saved ideas (most recent first) */
    getIdeas: () => ipcRenderer.invoke('get-ideas'),
    // ── Pearl-decode IPC (Tier G · v0.1.16 · BP057 W5c) ─────────────────────
    /** Decode a Pearl by pearl_id or canonical_ref — returns eblet content from CANON substrate */
    decodePearl: (pearlId) => ipcRenderer.invoke('decode-pearl', pearlId),
    // ── Bridge (BP060 Application 002 Steps 3+4 · UI-7 live Yoke wire) ──────
    bridge: {
        checkMessages: (count) => ipcRenderer.invoke('bridge:check-messages', count),
        sendMessage: (args) => ipcRenderer.invoke('bridge:send-message', args),
    },
    // ── AI Dispatch (BP060 Application 002 Steps 3+4 · UI-8 backend) ─────────
    aiDispatch: {
        query: (args) => ipcRenderer.invoke('ai-dispatch:query', args),
        listLocalModels: () => ipcRenderer.invoke('ai-dispatch:list-local-models'),
        testConnection: () => ipcRenderer.invoke('ai-dispatch:test-connection'),
        getSettings: () => ipcRenderer.invoke('ai-dispatch:get-settings'),
        saveSettings: (settings) => ipcRenderer.invoke('ai-dispatch:save-settings', settings),
    },
    // ── LB Account (BP065 Part A · SEG-C2a) ─────────────────────────────────
    lbStartAuth: (email) => ipcRenderer.invoke('lb:start-auth', { email }),
    lbGetSession: () => ipcRenderer.invoke('lb:get-session'),
    lbLinkDevice: (access_token, refresh_token, email) => ipcRenderer.invoke('lb:link-device', { access_token, refresh_token, email }),
    lbRevokeDevice: () => ipcRenderer.invoke('lb:revoke-device'),
    onLbAuthComplete: (cb) => {
        const handler = (_event, session) => cb(session);
        ipcRenderer.on('lb:auth-complete', handler);
        return () => ipcRenderer.removeListener('lb:auth-complete', handler);
    },
    // ── Frontier Node (BP065 Part B · SEG-B2b) ───────────────────────────────
    lbRegisterFrontierNode: () => ipcRenderer.invoke('lb:register-frontier-node'),
    lbWithdrawFrontierNode: () => ipcRenderer.invoke('lb:withdraw-frontier-node'),
    lbGetFrontierStatus: () => ipcRenderer.invoke('lb:get-frontier-status'),
    // ── Frontier Borrow (WAVE-24) ─────────────────────────────────────────────
    lbGetBorrowStatus: () => ipcRenderer.invoke('lb:get-borrow-status'),
    lbSetBorrowOptIn: (enabled) => ipcRenderer.invoke('lb:set-borrow-opt-in', { enabled }),
    lbRequestFrontierBorrow: () => ipcRenderer.invoke('lb:request-frontier-borrow'),
    // ── Opt-In Strike Tracker IPC (BP065 3-strikes · SEG-C from renderer) ────
    lbOptInGetState: () => ipcRenderer.invoke('lb:opt-in-get-state'),
    lbOptInRecordStrike: () => ipcRenderer.invoke('lb:opt-in-record-strike'),
    lbOptInSetDecision: (decision) => ipcRenderer.invoke('lb:opt-in-set-decision', { decision }),
    // ── Onboarding Prefs (BP065 v0.1.23) ─────────────────────────────────────
    /** Apply first-run setup preferences: desktop shortcut, startup item, optional API key. */
    applyOnboardingPrefs: (prefs) => ipcRenderer.invoke('onboarding:apply-prefs', prefs),
    // ── BP067 Phase 1A — $5 Membership Checkout ───────────────────────────────
    membership: {
        createCheckout: (autoRenew) => ipcRenderer.invoke('membership:create-checkout', autoRenew),
        verifyStatus: () => ipcRenderer.invoke('membership-verify-status'),
    },
    // ── runMeshTest (BP078 Scope 1) ──────────────────────────────────────────────
    runMeshTest: (payload) => ipcRenderer.invoke('run-mesh-test', payload),
    // ── Caithedral Tools (BP060 Application 002 Step 1) ─────────────────────
    caithedralTools: {
        soccerball_emit: (pearls, bindings) => ipcRenderer.invoke('caithedral:soccerball_emit', pearls, bindings),
        soccerball_decode: (sid) => ipcRenderer.invoke('caithedral:soccerball_decode', sid),
        soccerball_lookup: (sid) => ipcRenderer.invoke('caithedral:soccerball_lookup', sid),
        speckle_nibble: (sid, position) => ipcRenderer.invoke('caithedral:speckle_nibble', sid, position),
        eblit_emit: (pearl_id, source_cathedral, ts) => ipcRenderer.invoke('caithedral:eblit_emit', pearl_id, source_cathedral, ts),
        substrace_weave: (eblit_null_lines, weaver, weave_ts) => ipcRenderer.invoke('caithedral:substrace_weave', eblit_null_lines, weaver, weave_ts),
        quilt_compose: (substrace_ids, narrative_tag, weaver, ts) => ipcRenderer.invoke('caithedral:quilt_compose', substrace_ids, narrative_tag, weaver, ts),
        substrate_address_emit: (seed, ts) => ipcRenderer.invoke('caithedral:substrate_address_emit', seed, ts),
        substrate_address_validate: (address) => ipcRenderer.invoke('caithedral:substrate_address_validate', address),
        ten_pearl_roundtrip: () => ipcRenderer.invoke('caithedral:ten_pearl_roundtrip'),
        areopagus_query: (query) => ipcRenderer.invoke('caithedral:areopagus_query', query),
    },
    // ─── SKU (BP078 Scope 6.5) ───────────────────────────────────────────────────
    sku: {
        checkModel: (modelName) => ipcRenderer.invoke('sku-check-model', modelName),
        upgradeTo: (tier) => ipcRenderer.invoke('sku-upgrade-to', tier),
        cancelUpgrade: () => ipcRenderer.invoke('sku-cancel-upgrade'),
        currentTier: () => ipcRenderer.invoke('sku-current-tier'),
        onPullProgress: (cb) => {
            ipcRenderer.on('sku-pull-progress', (_event, data) => cb(data));
            return () => ipcRenderer.removeAllListeners('sku-pull-progress');
        },
        onPullComplete: (cb) => {
            ipcRenderer.on('sku-pull-complete', () => cb());
            return () => ipcRenderer.removeAllListeners('sku-pull-complete');
        },
        onPullError: (cb) => {
            ipcRenderer.on('sku-pull-error', (_event, err) => cb(err));
            return () => ipcRenderer.removeAllListeners('sku-pull-error');
        },
    },
    // ── Black Crow Feather earn (BP078) ───────────────────────────────────────
    earnBlackCrowFeather: (payload) => ipcRenderer.invoke('feather:earn-black', payload),
    // ── SEG-Q-3 BP078: DevTools toggle (fallback path for Ctrl+Shift+D conflicts) ──
    toggleDevTools: () => ipcRenderer.send('devtools:toggle'),
    // ── SEG-Q-4 BP078: Auto-prepare FULL upgrade ──────────────────────────────
    getAutoPrepare: () => ipcRenderer.invoke('auto-prepare:get'),
    setAutoPrepare: (enabled) => ipcRenderer.send('auto-prepare:set', enabled),
    onAutoPrepareReady: (cb) => {
        const handler = () => cb();
        ipcRenderer.on('auto-prepare:model-ready', handler);
        return () => ipcRenderer.removeListener('auto-prepare:model-ready', handler);
    },
    // SEG-Q-13 BP078: Run Diagnostic
    runDiagnostic: () => ipcRenderer.invoke('diagnostic:run'),
    // SEG-R-13: Open the folder containing a diagnostic log file
    openDiagFolder: (folderPath) => ipcRenderer.invoke('diagnostic:open-folder', folderPath),
    // SEG-U-7 BP078: mesh-test-complete -- fired when a results file is detected on disk
    onMeshTestComplete: (cb) => {
        const handler = (_event, metrics) => cb(metrics);
        ipcRenderer.on('mesh-test-complete', handler);
        return () => ipcRenderer.removeListener('mesh-test-complete', handler);
    },
});
//# sourceMappingURL=preload.js.map
