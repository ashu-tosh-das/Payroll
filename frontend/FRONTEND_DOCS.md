# Payroll Suite — Technical Documentation

**Version:** 2.1  |  **Date:** June 2026  |  **Status:** Production Ready

---

## 1. Introduction

This document covers the complete frontend implementation of two interconnected products:

| Product | Folder | Purpose |
|---|---|---|
| **Source One Payroll Cloud** | `/` (root) | Full-featured dual-portal HR & payroll management system |
| **HRFlow** | `frontend/` | Standalone HR operations frontend (no build step) |

Both products share the same design language — dark-first theme, indigo accent (`#6366F1` / `#10B981` for payroll), Inter typeface, and a component library built from plain CSS + React 18 UMD. Neither requires a build toolchain; they run directly from a local HTTP server.

### How to Run

**Source One Payroll Cloud (main project)**
```
Open "Source One Payroll Cloud.html" directly in a browser, or serve the root folder:
python -m http.server 8080
```

**HRFlow standalone frontend**
```bash
cd "payroll helper/frontend"
python -m http.server 3000
# Open http://localhost:3000
```

### Technology Choices

| Concern | Choice | Rationale |
|---|---|---|
| View layer | React 18 UMD | Zero build setup; JSX via Babel Standalone |
| Icons (main) | Custom SVG sprite (22 named icons) | No CDN dependency; precise control |
| Icons (HRFlow) | Font Awesome 6 Free (CDN) | Comprehensive free icon set |
| Charts | Custom SVG (no library) | Eliminates 200 KB+ chart lib; fully themeable |
| Fonts | Inter via Google Fonts | Non-blocking load with `media="print"` swap trick |
| Styling | Plain CSS (token-based) | No Tailwind/CSS-in-JS; easy override |
| Data | In-memory JS objects | Simulates REST API; swap `fetch()` for real backend |

---

## 2. Source One Payroll Cloud — Component Architecture

The main project uses a modular monolith pattern: each `.jsx` file exports its components to `window` so later scripts can consume them without ES module imports.

### 2.1 Script Load Order

```
Source One Payroll Cloud.html
│
├── [inline] React 18 UMD + ReactDOM  → window.React, window.ReactDOM
├── [inline] Babel Standalone          → enables <script type="text/babel">
│
├── data.jsx                           → window.{ EMPLOYEES, CLIENTS, DEPARTMENTS,
│                                                 NOTIFICATIONS, PAYROLL_RUNS, ... }
│                                         window.{ fmtINR, initials, avatarHueFor, ... }
│
├── common.jsx                         → window.{ Icon, Avatar, StatusChip,
│                                                 MiniMetric, Sparkline, Donut, ... }
│
├── interactions.jsx                   → window.{ ToastHost, ModalHost,
│                                                 NotificationsPopover,
│                                                 useGlobalClickFallback }
│                                         window.toast(text, opts)
│                                         window.openModal(config)
│
├── tweaks-panel.jsx                   → window.{ TweaksPanel, useTweaks }
│
├── shell.jsx                          → window.{ Sidebar, Topbar, PageHead,
│                                                 NAV, EMP_NAV }
│
├── screens/dashboard.jsx              → window.{ Dashboard, CombinedReportOverlay }
├── screens/payroll.jsx                → window.{ Payroll }
├── screens/clients.jsx                → window.{ Clients, TimesheetUpload,
│                                                 ClientPayroll }
├── screens/employees.jsx              → window.{ Employees }
├── screens/reports.jsx                → window.{ Reports }
├── screens/admin-reimbursements.jsx   → window.{ AdminReimbursements }
├── screens/employee-portal.jsx        → window.{ EmployeeDashboard, MyPayslips,
│                                                 MyLeave, MyReimbursements, ... }
├── ... (other screens)
│
└── app.jsx                            → ReactDOM.createRoot('#root').render(<App/>)
```

### 2.2 App State (app.jsx)

| State | Type | Purpose |
|---|---|---|
| `active` | string | Current main screen ID (e.g. `"dashboard"`, `"payroll"`) |
| `subPage` | object \| null | Active sub-page overlay (e.g. `{ id: "client-payroll", clientId: "CLT-001" }`) |
| `portalMode` | `"admin"` \| `"employee"` | Controls which sidebar nav and screen map is active |

Navigation helpers exposed to all screens via `useEffect`:

```
window.appNav(id)       — navigate to a main screen
window.appSub(id, data) — open a sub-page overlay
window.switchPortal(mode)
```

### 2.3 Key Screens

| Screen | File | Key Features |
|---|---|---|
| **Dashboard** | `screens/dashboard.jsx` | KPI strip, payroll trend chart, department donut, approval workflow tracker, per-client payroll cards, combined report overlay |
| **Payroll Run** | `screens/payroll.jsx` | Multi-client payroll, 6-step approval flow, per-client breakdown table |
| **Clients** | `screens/clients.jsx` | Client list with employee drill-down, timesheet upload sub-page, client payroll sub-page |
| **Employees** | `screens/employees.jsx` | Employee table, filters, CRUD modals |
| **Reports** | `screens/reports.jsx` | Report catalog with category filters, download & schedule per report |
| **Admin Reimbursements** | `screens/admin-reimbursements.jsx` | View all requests, claim detail panel, approve/reject with audit trail |
| **Employee Portal** | `screens/employee-portal.jsx` | My payslips, leave, attendance, reimbursement submission with document upload |

### 2.4 Shell Components (shell.jsx)

**Sidebar** — renders `NAV` (admin) or `EMP_NAV` (employee) based on `portalMode`. Active item highlighted with left accent bar. Section labels group items.

**Topbar** — contains:
- Company switcher (S1 logo + name)
- Portal toggle (Admin Portal / Employee Portal)
- Breadcrumb trail
- Nov payroll progress chip
- Bell notification button with live unread count badge
- Globe (help), moon (theme toggle) buttons

> **UX-001 (Jun 2026):** Search bar removed from the Topbar to reduce visual clutter. The breadcrumb and payroll chip are now more prominent.

**Notification Bell** — shows a red numeric badge (`unreadCount`) tracking unread notifications. Count decrements as individual items are clicked or "Mark all read" is used.

### 2.5 Notification System (interactions.jsx)

The notification popover renders via **`ReactDOM.createPortal`** directly into `document.body`, escaping all parent stacking contexts.

```
Bell button clicked
      │
      ▼
Topbar.setNotifOpen(true)
      │
      ▼
NotificationsPopover renders via ReactDOM.createPortal(content, document.body)
      │
      ├── Backdrop div   z-index 9998  — rgba(0,0,0,0.45) dimming layer
      └── Panel div      z-index 9999  — solid #161B28, anchored to bell button rect
                │
                ├── markRead(id)   → decrements unreadCount in Topbar via onUnreadChange
                └── markAllRead()  → zeroes unreadCount, shows toast
```

**Why portal?** Any `position: fixed` element whose ancestor has a CSS `transform`, `will-change`, or `filter` is trapped in that ancestor's stacking context regardless of z-index. Rendering at `document.body` guarantees the panel is always on top.

**NOTIFICATIONS data** (`data.jsx`) — 8 entries covering anomaly alerts, PF deadlines, OT flags, ESI reminders, reconciliation confirms, and reimbursement notifications.

### 2.6 Global Click Fallback (interactions.jsx)

`useGlobalClickFallback()` (called once in `App`) intercepts clicks on any `.btn` or `.iconbtn` that does **not** have a React `onClick` prop. It maps button labels to contextual toasts via `inferAction(label)`.

> **EXPORT-001 (Jun 2026):** Export and Download buttons across Dashboard, Reports, and Combined Report overlay now have explicit `onClick` handlers that show named toasts with filename, format, and file size — no longer relying solely on the fallback.

| Button location | Handler |
|---|---|
| Dashboard → Export | Toast: `"Exporting {month} payroll summary… PDF ready"` |
| Combined Report → Download Excel | Toast: `"Combined Payroll {month}.xlsx"` |
| Combined Report → PDF | Toast: `"Combined Payroll {month}.pdf"` |
| Combined Report → Export Full Report | Toast: `"Consolidated_Payroll_{month}.xlsx"` |
| Reports library → Download (per report) | Toast with report name, type, size |
| Reports library → Schedule (per report) | Toast: `"Scheduled: {name} · Next run: Nov 30"` |

### 2.7 Client Payroll Navigation (screens/dashboard.jsx)

> **CLIENT-001 (Jun 2026):** The "View payroll →" button on each client card in the Dashboard previously navigated to the generic Payroll Run screen. It now calls `onSub("client-payroll", { clientId, clientName })`, opening the **ClientPayroll sub-page pre-filtered** to that specific client.

```
Dashboard client card — "View payroll →"
        │
        ▼
onSub("client-payroll", { clientId: "CLT-001", clientName: "Infosys BPO Ltd." })
        │
        ▼
App.openSub → setSubPage({ id: "client-payroll", clientId, clientName })
        │
        ▼
<ClientPayroll onBack={closeSub} clientId="CLT-001" clientName="Infosys BPO Ltd."/>
  — pre-selects correct client in the dropdown
  — shows employee list, generate payroll, download Excel
```

---

## 3. HRFlow Standalone Frontend — Component Architecture

The standalone frontend lives entirely in `frontend/`. All components export to `window`; `app.js` wires them together.

### 3.1 Data Layer — `data/mock-data.js`

Pure JavaScript (no JSX). Populates `window` with:

- **`EMPLOYEES`** — 15 records enriched with `gross`, `net`, `tax`, `initials`, `color`.
- **`DEPARTMENTS`** — 6 departments with headcount and chart color.
- **`PAYROLL_RUNS`** — 6 months of payroll history; each run has per-employee `lineItems`.
- **`PAYROLL_TREND`** / **`DEPT_COSTS`** — Pre-aggregated arrays for chart components.
- **`RECENT_ACTIVITIES`** — 6 activity feed entries for the Dashboard.
- **`REPORTS_CATALOG`** — Metadata for 6 pre-built reports.
- **`SETTINGS_DATA`** — Default values for all Settings form fields.
- **Utilities** — `fmtCurrency()`, `fmtDate()`, `getInitials()`, `avatarColor()`.

### 3.2 Shared UI — `components/ui.js`

| Component | Props | Purpose |
|---|---|---|
| `Icon` | `name, size, color` | Wraps Font Awesome classes; consistent sizing |
| `Avatar` | `name, size, status` | Deterministic colored initials circle with optional status dot |
| `StatusChip` | `status, label` | Semantic color-coded badge (active/inactive/leave/paid/pending…) |
| `MiniMetric` | `label, value, delta, deltaDir, icon` | KPI card used across Dashboard, Employees, Payroll |
| `Modal` | `open, onClose, title, size, footer` | Accessible overlay; Escape key + backdrop click close |
| `ToastHost` | _(none)_ | Listens to `CustomEvent('app:toast')`; auto-dismisses after 3.4 s |
| `Toggle` | `checked, onChange, id` | Controlled checkbox-backed toggle switch |
| `ProgressBar` | `value, max, color` | Animated fill bar |
| `StepIndicator` | `steps[], current` | Linear step progress for Payroll workflow |
| `EmptyState` | `icon, title, sub, action` | Centered placeholder for empty lists |
| `ConfirmDialog` | `open, title, message, danger, onConfirm, onCancel` | Destructive-action confirmation modal |

**Global toast API:** `window.showToast(msg, type, sub)` dispatches a `'app:toast'` DOM event. `ToastHost` picks it up without prop-drilling.

### 3.3 Charts — `components/charts.js`

All charts are **pure SVG** with no external dependencies.

| Component | Input | Output |
|---|---|---|
| `AreaChart` | `data[{label, value}], color, height, id` | Line + gradient area fill; auto-scaled Y axis |
| `BarChart` | `data[{label, value, color}], height` | Vertical bars with optional per-bar colors |
| `DonutChart` | `segments[{label, value, color}], size, thickness, centerLabel` | Animated arc segments with center text |
| `DonutLegend` | `segments[]` | Color dot + percentage legend |
| `SparkLine` | `data[], width, height, color` | Compact inline trend line |

### 3.4 Layout — `components/layout.js`

| Component | Key Behaviour |
|---|---|
| `Sidebar` | Renders `NAV_ITEMS`; highlights active page; collapses to icon-only at ≤ 900 px |
| `Topbar` | Global search bar with `⌘K`/`Ctrl+K` shortcut; `Escape` clears; propagates `onSearch` to parent |
| `PageHead` | Consistent title + subtitle + right-aligned actions slot |

### 3.5 Pages

| Page | File | Key State | Primary Features |
|---|---|---|---|
| **Dashboard** | `pages/dashboard.js` | None (read-only) | 4 KPI cards, payroll trend area chart, headcount donut, dept cost bar chart, activity feed |
| **Employees** | `pages/employees.js` | employees[], search, filters, selected, modals | CRUD table; multi-field search + filters; sortable columns; Add/Edit modal with validation; slide-in detail panel |
| **Payroll** | `pages/payroll.js` | runIndex, step (0–4), lineItems | 4-step workflow (Generate → Review → Approve → Transfer); per-run tab selector; payslip detail modal |
| **Reports** | `pages/reports.js` | activeReport, catFilter | 6-report catalog; live chart + table viewer; per-format export buttons |
| **Settings** | `pages/settings.js` | activeTab, form values | 4-tab panel (Company, Pay Schedule, Users/Roles, Notifications); invite user modal |

---

## 4. Connection Diagrams

### 4.1 Notification Panel — Portal Architecture

```
Bell click (Topbar, z-index 10 stacking context)
        │
        ▼
setNotifOpen(true)
        │
        ▼
NotificationsPopover renders:
  ReactDOM.createPortal(
    <>
      <div backdrop  z-index:9998 rgba(0,0,0,0.45)/>
      <div panel     z-index:9999 solid #161B28
           position:fixed  top: bell.bottom+8  right: viewport-bell.right />
    </>,
    document.body          ← outside all stacking contexts
  )

Click notification item → markRead(id) → onUnreadChange(newCount) → Topbar badge updates
Click backdrop          → onClose() → setNotifOpen(false)
"Mark all read"         → onUnreadChange(0) → toast("All marked read")
```

### 4.2 Client Card → Client Payroll Deep Link

```
Dashboard "View payroll →" button
        │  onClick: onSub("client-payroll", { clientId, clientName })
        ▼
App.openSub({ id: "client-payroll", clientId, clientName })
        │  setSubPage(...)
        ▼
<ClientPayroll
  clientId   = pre-selected in dropdown
  clientName = shown in PageHead
  onBack     = closeSub (returns to Dashboard)
/>
        │
        ├── Generate payroll → compute PF/TDS/PT per employee → show register table
        └── Download Excel → toast with filename confirmation
```

### 4.3 HRFlow Global Search Data Flow

```
User types in Topbar search
        │
        ▼
App.handleSearch(q)
        ├── setGlobalQuery(q)
        └── if not on searchable page → setPage('employees')
                │
                ▼
        <Employees searchQuery={q}/>
                │  (useEffect syncs prop → local search state)
                ▼
        filtered = EMPLOYEES
          .filter(name/email/role/dept contains q)
          .filter(statusFilter, deptFilter)
          .sort(sortKey, sortDir)
```

### 4.4 HRFlow Payroll Workflow State Machine

```
User selects month tab → runIndex → run = PAYROLL_RUNS[runIndex]

step 0 (idle)
  └─ [Generate Payroll] → 1.4 s async → setLineItems → step 1

step 1 (review)
  └─ [Approve Payroll]  → step 3

step 3 (approved)
  └─ [Initiate Transfer] → step 4 (complete)

Past runs (status "paid"): lineItems shown immediately, step = 4
```

### 4.5 Toast Event Bus (Both Products)

```
Source One Payroll Cloud:
  window.toast(text, { icon, tone, sub })
    └─ ToastBus.push(toast) → ToastHost listener → renders toast → auto-removes at duration ms

HRFlow standalone:
  window.showToast(msg, type, sub)
    └─ document.dispatchEvent(CustomEvent "app:toast") → ToastHost listener → renders → removes at 3400 ms
```

---

## 5. UI Design Guidelines

### 5.1 Design Tokens

All values are CSS custom properties in the respective stylesheet. Change once, apply everywhere.

| Token | Default (Dark) | Purpose |
|---|---|---|
| `--bg` | `#0D1117` | Page background |
| `--bg-2` | `#161B22` | Card / sidebar surface |
| `--bg-3` | `#1E2431` | Input background / table header |
| `--accent` | `#6366F1` (HRFlow) / `#10B981` (Payroll Cloud) | Primary CTA, active nav, focus rings |
| `--success` | `#22C55E` | Positive states, net pay, paid status |
| `--warn` | `#F59E0B` | Caution, on-leave status, deductions |
| `--danger` | `#EF4444` | Errors, destructive actions, rejections |
| `--text` | `#E6EDF3` | Primary body text |
| `--text-mid` | `#8B949E` | Secondary/supporting text |
| `--text-muted` | `#484F58` | Placeholder, disabled, captions |

Light mode: `document.documentElement.dataset.theme = "light"` overrides the same tokens.

### 5.2 Typography

- **Font family:** Inter (Google Fonts), system sans-serif fallback.
- **Scale:** 10 px (labels) → 12–13.5 px (body) → 15 px (subheadings) → 20 px (page titles).
- **Monospace:** Used for all currency values, IDs, and code snippets.

### 5.3 Spacing System

4 px base grid: `4 / 8 / 12 / 16 / 20 / 24` px — applied through `.gap-N`, `.mt-N`, `.mb-N`, `.p-N` utility classes.

### 5.4 Responsive Breakpoints (HRFlow standalone)

| Breakpoint | Width | Behaviour |
|---|---|---|
| Desktop | > 900 px | Full sidebar (228 px) + labeled nav |
| Tablet | ≤ 900 px | Icon-only sidebar (60 px); 4-col grids → 2-col |
| Mobile | ≤ 600 px | Sidebar hidden; all grids single-column; modals full-width |

### 5.5 Interaction Patterns

- **Buttons:** Four variants — `btn-primary` (CTA), `btn-secondary` (neutral), `btn-ghost` (low emphasis), `btn-danger` (destructive). All support `disabled` at 45% opacity.
- **Forms:** Indigo focus ring (`box-shadow: 0 0 0 3px var(--accent-dim)`). Errors show red border + helper text. Hints use `--text-muted`.
- **Tables:** Hover highlight on rows; `selected` class applies `--accent-dim` background. Sticky `<tfoot>` shows totals.
- **Modals/Popovers:** Always rendered via `ReactDOM.createPortal` at `document.body` to avoid stacking context traps. Backdrop click or Escape closes.
- **Animations:** Page transitions use `.anim-fade` (200 ms). Slide-in panels use `.anim-slide-r`. Popover entrance: `popIn` (opacity + translateY + scale).

### 5.6 Accessibility

- All `<button>` elements have `cursor: default` (platform-standard for app UIs).
- Decorative icons are `aria-hidden="true"`.
- Color is never the sole differentiator — status chips combine color with a text label.
- Loading screen has `role="status"` and `aria-label`.

---

## 6. Changelog

### v2.1 — June 2026 (Bug Fixes)

| Ticket | Type | File(s) | What Changed |
|---|---|---|---|
| **HOL-001** | Bug fix | `screens/holiday-calendar.jsx` | `HOLIDAYS_2025` entries were missing `id` fields — `key={h.id}` always `undefined` triggered React "unique key" warning in the Attendance component. Fixed by adding `id: "HOL-01"` through `"HOL-15"` to all 15 static entries. |
| **CTR-001** | Bug fix | `screens/contractors.jsx` | Contractors table (7 columns) was clipped by `overflow: hidden` card without a scroll wrapper. Fixed by wrapping `<table>` in `<div style={{ overflowX: "auto" }}>` — same pattern as `clients.jsx` and `employees.jsx`. |

### v2.0 — June 2026

| Ticket | Type | File(s) | What Changed |
|---|---|---|---|
| **UX-001** | Enhancement | `shell.jsx` | Removed search bar from Topbar — breadcrumb and payroll chip now have cleaner prominence |
| **NOTIF-001** | Bug fix + Enhancement | `data.jsx`, `shell.jsx`, `interactions.jsx` | Expanded NOTIFICATIONS from 3 → 8 entries; added live numeric unread badge on bell; `markRead` / `markAllRead` decrement badge in real-time |
| **NOTIF-002** | Bug fix | `interactions.jsx` | Notification panel was rendering behind dashboard cards — fixed by switching to `ReactDOM.createPortal(content, document.body)` with z-index 9998/9999 |
| **EXPORT-001** | Bug fix | `screens/dashboard.jsx`, `screens/reports.jsx` | All export/download buttons now have explicit `onClick` handlers with contextual toasts (filename, format, size) instead of relying solely on the global click fallback |
| **CLIENT-001** | Enhancement | `screens/dashboard.jsx` | "View payroll →" on each Dashboard client card now opens `ClientPayroll` sub-page pre-filtered to that client, instead of navigating to the generic Payroll Run screen |

### v1.0 — June 2025 (HRFlow standalone)

| Ticket | Type | Outcome |
|---|---|---|
| IMPL-001 | Critical Bug | Added `.mb-5`, `.mb-6` CSS classes to `base.css` |
| IMPL-002 | Bug | Added `button.nav-item` flex reset to `components.css` |
| IMPL-003 | Bug | Added `pointer-events: none` to `.toggle-thumb` |
| IMPL-004 | Bug | Wired `onSearch` prop from `App` → `Topbar` with full global search flow |
| IMPL-005 | Bug | Fixed FA6 icon name `circle-up` → `circle-arrow-up` in `payroll.js` |
| RESP-001 | Enhancement | Full responsive layout: tablet icon-sidebar + mobile hidden-sidebar |
| PROD-001 | Enhancement | Production `index.html`: loader, SEO, OG, favicon, no-JS fallback |
| PROD-002 | Enhancement | `⌘K`/`Ctrl+K` focus shortcut, `Escape` clear, cross-page search wiring |
| DOCS-001 | Documentation | Initial technical documentation (v1.0) |

---

## 7. Conclusion

The suite now comprises two fully functional products sharing a unified design system. The Source One Payroll Cloud serves as the primary operations platform with admin and employee dual-portal access, while HRFlow provides a standalone HR frontend deployable without a backend.

All 16 tracked tickets across both products are resolved. The notification system is architecturally sound (portal-rendered, stacking-context-safe). Client navigation deep-links correctly to per-client payroll pages. Export buttons produce named, contextual feedback throughout.

### Next Steps for Production

1. **Authentication** — The Sidebar footer and Topbar user widget are ready to accept real user context from a JWT/session provider. Both portals should enforce role-based route guards.
2. **API Integration** — Replace `data.jsx` / `mock-data.js` with `fetch()` calls to a REST or GraphQL API. Component prop interfaces already match expected data shapes.
3. **Build pipeline** — Replace Babel Standalone with Vite or esbuild to eliminate ~900 KB in-browser compilation overhead. All files are already modular.
4. **Real-time notifications** — Swap the static `NOTIFICATIONS` array for a WebSocket or Server-Sent Events feed. The `markRead` / `onUnreadChange` wiring in the Topbar is ready to accept live updates.
5. **End-to-end tests** — Add Playwright coverage for the Payroll workflow (Generate → Transfer), Employee CRUD, Client deep-link navigation, and notification read/unread state.

---

*Source One Payroll Suite — Documentation v2.1 — June 2026*
