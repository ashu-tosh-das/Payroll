# Feature 25 — Cross-Cutting Platform Features

## Overview

These features are embedded across the entire platform and not specific to any single screen. They include the data persistence layer, toast and modal systems, the Atlas AI engine, multi-company support, theming, the Tweaks Panel, and the dual-portal architecture.

---

## 25.1 Data Persistence (Auto-Save)

**File:** [data.jsx](../../data.jsx)

All data changes are automatically persisted to `localStorage` under the `so_` key prefix.

```js
// Save any value to localStorage + update the global variable
window.persist(key, data)

// Load from localStorage on page load; falls back to seed data
window.loadStore(key, fallback)

// Clear ALL so_* keys and reload with original demo data
window.resetAll()
```

**Auto-save indicator:** Green dot + "Auto-saved" text in the topbar confirms persistence is active.

**Persisted stores include:**
- `so_employees` — employee records
- `so_leave_requests` — leave and WFH requests
- `so_tickets` — support tickets
- `so_notifications` — notification read/unread state
- `so_current_user_role` — active demo persona
- (and all other mutable app state)

---

## 25.2 Toast Notification System

**File:** [interactions.jsx](../../interactions.jsx) → `ToastHost`

```js
window.toast(text, { icon, tone, sub, duration })
```

| Tone | Colour | Typical use |
|---|---|---|
| `ok` | Green | Success confirmations |
| `warn` | Amber | Cautions and advisories |
| `danger` | Red | Errors and destructive actions |
| `info` | Blue | Informational messages |
| `ai` | Purple | Atlas AI actions |

- Toasts appear top-right and stack without overlapping
- Auto-dismiss after `duration` ms (default 3000)
- Manual dismiss button on each toast

---

## 25.3 Global Modal System

**File:** [interactions.jsx](../../interactions.jsx) → `ModalHost`

```js
window.openModal({ title, subtitle, confirmText, onConfirm })
```

- Rendered via `ReactDOM.createPortal` at `document.body`
- Uses `.drawer-mask` (z-index 100) + `.glass-strong` panel (z-index 101)
- Customisable confirm button text per call site
- Cancel button always present

---

## 25.4 Atlas AI Engine

Atlas powers AI features across the platform. Summary of all capabilities:

| Capability | Screen | Description |
|---|---|---|
| Anomaly detection | Anomalies | Scans every payroll run for statistical outliers |
| Pre-flight validation | Payroll Run | Integrity checks before approval |
| Compliance recommendations | Compliance Hub | Reviews calculations before filing |
| Document generation | Letters | Auto-populates HR letter templates |
| Support chatbot | Support Center | Tier 1 query resolution (71% deflection) |
| Conversational analytics | Copilot | Natural-language payroll queries |
| Anomaly explanation | Anomalies | Plain-English reasoning per anomaly |
| Template recommendation | Letters | Suggests template based on employee status |

---

## 25.5 Multi-Company Support

**File:** [data.jsx](../../data.jsx) — `COMPANIES` array

The platform supports multiple legal entities under a single login:

| Company | Employees | Status |
|---|---|---|
| Source One Technologies | 247 | Active |
| Source One Digital Labs | 23 | Active |
| Source One HR Services | 47 | Inactive |

- **Company Switcher** in topbar — instant context switch
- Each company has: ID, name, short name, code badge, PAN, employee count, active status
- Switching companies changes the active dataset context and shows a toast confirmation

---

## 25.6 Dark / Light Theme

- Full dark-mode and light-mode support across all screens
- Toggle via the moon/sun icon in the topbar
- Applied via `data-theme` attribute on `<html>` element
- CSS custom properties (design tokens) override for light mode
- Toast confirmation on each theme switch

**Design Tokens (dark defaults):**

| Token | Value | Purpose |
|---|---|---|
| `--bg` | `#0D1117` | Page background |
| `--bg-2` | `#161B22` | Card / sidebar surface |
| `--bg-3` | `#1E2431` | Input / table header |
| `--accent` | `#10B981` | Primary CTA, active nav |
| `--success` | `#22C55E` | Positive states, net pay |
| `--warn` | `#F59E0B` | Caution states |
| `--danger` | `#EF4444` | Errors, rejections |
| `--text` | `#E6EDF3` | Primary body text |
| `--text-mid` | `#8B949E` | Secondary text |
| `--text-muted` | `#484F58` | Placeholder, disabled |

---

## 25.7 Tweaks Panel

**File:** [tweaks-panel.jsx](../../tweaks-panel.jsx)

A development-mode side panel for rapid prototyping and demos:

| Control | Options |
|---|---|
| Sidebar style | Labeled (icon + text) / Icon-only |
| Density | Compact / Comfortable |
| Navigate | Quick buttons for all 22 admin screens |

Settings persisted to localStorage via `useTweaks` hook.

---

## 25.8 Dual-Portal Architecture

Single URL, two distinct experiences:

| Portal | Accent | Purpose |
|---|---|---|
| Admin Portal | Green (`#10B981`) | Full payroll management for HR, Finance, Payroll teams |
| Employee Portal | Blue (`#6366F1`) | Self-service for individual employees |

- Instant switch via portal toggle in the topbar
- No separate login required
- Each portal has its own `NAV` / `EMP_NAV` array, screen map, and branding accent
- `window.switchPortal('admin' | 'employee')` — global navigation helper

---

## 25.9 Global Click Fallback

**File:** [interactions.jsx](../../interactions.jsx) → `useGlobalClickFallback`

Called once in `App`. Intercepts clicks on any `.btn` or `.iconbtn` that does **not** have a React `onClick` prop, and maps button labels to contextual toasts via `inferAction(label)`.

Used as a safety net for prototype buttons; explicit `onClick` handlers take precedence.

---

## Related Features

- [01-navigation-shell.md](01-navigation-shell.md) — Shell components (sidebar, topbar, page head)
- [14-roles-access.md](14-roles-access.md) — Role persistence uses `window.persist()`
- All features — toast system and modal system used universally
