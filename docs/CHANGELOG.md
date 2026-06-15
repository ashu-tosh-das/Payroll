# Changelog

All notable changes to Source One Payroll Cloud are documented here.

---

## v2.1 — June 2026 (Bug Fixes)

### Bug Fixes

#### HOL-001 — React key prop warning in Attendance screen
**File:** `screens/holiday-calendar.jsx`  
**Symptom:** React console warning: *"Each child in a list should have a unique key prop"* on every render of the `Attendance` component. The warning stack trace pointed to `HolidayRow` inside `Attendance`.  
**Root cause:** `HOLIDAYS_2025` array had 15 entries but none had an `id` field. The `Attendance` screen renders `holidaysState.map(h => <HolidayRow key={h.id} .../>)` — with `h.id === undefined`, React treated every `key` as the same missing value.  
**Fix:** Added `id: "HOL-01"` through `id: "HOL-15"` to all 15 static holiday entries.  
**Note:** New holidays added via the `openAddHoliday` flow already used `id: "H" + Date.now()` — only the static seed data needed fixing.

#### CTR-001 — Contractors table horizontally clipped
**File:** `screens/contractors.jsx`  
**Symptom:** The contractors table (7 columns: Contractor, Type, Service, Rate, This Month, Channel, Status) was clipped at the card boundary on screens narrower than the table's natural width. No horizontal scrollbar appeared.  
**Root cause:** The `<table className="tbl">` was a direct child of `<div className="card" style={{ overflow: "hidden" }}>` without a scroll wrapper. The card's `overflow: hidden` clipped the table rather than enabling scroll.  
**Fix:** Wrapped the `<table>` in `<div style={{ overflowX: "auto" }}>` — the same pattern already used in `clients.jsx` and `employees.jsx`.

---

## v2.0 — June 2026

### Enhancements

#### UX-001 — Search bar removed from Topbar
**File:** `shell.jsx`  
**Change:** Removed search bar from the Topbar to reduce visual clutter. The breadcrumb and payroll chip are now more prominent.

#### NOTIF-001 — Expanded notification system
**Files:** `data.jsx`, `shell.jsx`, `interactions.jsx`  
**Change:** Expanded `NOTIFICATIONS` from 3 → 8 entries. Added live numeric unread badge on the bell icon. `markRead` / `markAllRead` decrement the badge in real-time.

#### EXPORT-001 — Named export toasts
**Files:** `screens/dashboard.jsx`, `screens/reports.jsx`  
**Change:** All export/download buttons now have explicit `onClick` handlers with contextual toasts showing filename, format, and file size. Previously relied on the global click fallback.

#### CLIENT-001 — Client card deep-link to per-client payroll
**File:** `screens/dashboard.jsx`  
**Change:** "View payroll →" on each Dashboard client card now opens the `ClientPayroll` sub-page pre-filtered to that client, instead of navigating to the generic Payroll Run screen.

### Bug Fixes

#### NOTIF-002 — Notification panel rendered behind dashboard cards
**File:** `interactions.jsx`  
**Fix:** Switched to `ReactDOM.createPortal(content, document.body)` with z-index 9998/9999 to escape ancestor stacking contexts.

---

## v1.0 — June 2025

Initial release of Source One Payroll Cloud with:
- 22 admin screens across 4 nav sections
- Employee self-service portal (11 screens)
- Atlas AI engine (anomaly detection, copilot, pre-flight checks)
- Dual-portal architecture (admin + employee, single URL)
- localStorage-based persistence
- Dark/light theme support

### HRFlow Standalone Frontend

| Ticket | Type | Change |
|---|---|---|
| IMPL-001 | Bug | Added `.mb-5`, `.mb-6` CSS classes to `base.css` |
| IMPL-002 | Bug | Added `button.nav-item` flex reset to `components.css` |
| IMPL-003 | Bug | Added `pointer-events: none` to `.toggle-thumb` |
| IMPL-004 | Bug | Wired `onSearch` prop from `App` → `Topbar` with full global search flow |
| IMPL-005 | Bug | Fixed FA6 icon name `circle-up` → `circle-arrow-up` |
| RESP-001 | Enhancement | Full responsive layout: tablet icon-sidebar + mobile hidden-sidebar |
| PROD-001 | Enhancement | Production `index.html`: loader, SEO, OG, favicon, no-JS fallback |
| PROD-002 | Enhancement | `⌘K`/`Ctrl+K` focus shortcut, `Escape` clear, cross-page search wiring |

---

## Browser Testing

A comprehensive Playwright test suite is available at [mcp-browser-test.js](../mcp-browser-test.js):

- **57 checks, 0 failures** as of v2.1
- Covers all 22 admin screens, 7 employee portal screens
- Tests: search, role switcher, Super Admin guard, drawers, toast, modal
- 28 screenshots saved to `test-screenshots/`

Run with:
```bash
node mcp-browser-test.js
```
(Requires Node.js with `@playwright/mcp` installed at the path in the script.)
