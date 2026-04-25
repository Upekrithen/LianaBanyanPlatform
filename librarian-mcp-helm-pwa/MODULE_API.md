# Helm Module API — V0 Spec

**K484 · B123 · Liana Banyan Corporation**

This document specifies the Helm module registration API. Any future module targeting the Helm shell implements this interface.

---

## What is a Helm module?

A Helm module is an opt-in capability unit. Modules:

- Declare their identity (id, name, description, category)
- Are **disabled by default** (`enabledByDefault: false`)
- Render a React component when enabled
- Have no side effects when disabled
- Do not run background processes in V0 (background-process modules are K486+ scope)

---

## Module interface

```typescript
interface HelmModule {
  /**
   * Stable unique identifier. Snake-case, e.g. 'member-cathedral-preview'.
   * Never changes after a module is released; used as the settings key.
   */
  id: string

  /** Display name shown in the Modules panel and sidebar navigation. */
  name: string

  /** Short description (1-2 sentences) shown in the Modules panel list. */
  description: string

  /**
   * If true, module appears in the sidebar by default without user opt-in.
   * MUST be false for all external modules. Only core built-ins may set true.
   */
  enabledByDefault: boolean

  /**
   * Category for grouping in the Modules panel.
   * 'cathedral' | 'tools' | 'community' | 'labs'
   */
  category: 'cathedral' | 'tools' | 'community' | 'labs'

  /** React component rendered in the main content area when module is active. */
  component: React.ComponentType

  /** Semantic version string, e.g. '1.0.0'. */
  version: string
}
```

---

## Registering a module

Import `registerModule` from the module registry and call it before the React tree renders:

```typescript
// src/renderer/src/modules/my-module/index.ts
import { registerModule } from '../registry'
import { MyModuleComponent } from './MyModuleComponent'

registerModule({
  id: 'my-module',
  name: 'My Module',
  description: 'Does something useful.',
  enabledByDefault: false,
  category: 'tools',
  component: MyModuleComponent,
  version: '1.0.0',
})
```

Add the import to `src/renderer/src/App.tsx` (or a module-loader entry point) so registration runs at startup.

---

## User enable/disable flow

1. User opens **Modules** panel in Helm sidebar
2. Each registered module appears as a toggle card
3. Toggle on → module id added to `settings.modules[id] = true`; nav item appears in sidebar
4. Toggle off → removed from nav; component unmounts; `settings.modules[id] = false`
5. Settings persist to `%APPDATA%/helm-pwa/helm-settings.json`

---

## Module categories

| Category | Use |
|----------|-----|
| `cathedral` | Cathedral-specific views (Member Cathedral, bedrock browser, Sculptor feeds) |
| `tools` | Utilities (Miner runner, query inspector, provenance viewer) |
| `community` | Social/cooperative features (Pledge tools, Assignments Bank, initiative panels) |
| `labs` | Experimental features, disabled pending stabilization |

---

## Constraints (V0)

- Modules render React components only. Background processes are K486+ scope.
- No module-to-module IPC in V0. Each module is independent.
- No module marketplace or external module loading in V0. All modules are compiled into the renderer bundle.
- Module components receive no props in V0. They use `window.helm.*` directly for Electron APIs.

---

## Built-in modules (V0)

| id | Category | Default | Status |
|----|----------|---------|--------|
| `member-cathedral-preview` | cathedral | disabled | Placeholder — K486+ |

---

## Future module API (K486+ planned extensions)

- **Background tasks**: modules that need a scheduler or file-watcher will declare a `backgroundEntrypoint` (Node.js file run in main process)
- **IPC surface**: modules with background tasks will declare an `ipcChannel` namespace
- **Module manifest**: external `.helm-module.json` for dynamic loading without recompile
- **Permissions model**: modules declare what `window.helm.*` APIs they need; shell prompts user to grant

---

*V0 module API is intentionally minimal. The constraint is the scaffold.*
