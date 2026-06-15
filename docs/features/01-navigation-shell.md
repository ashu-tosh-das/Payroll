# Feature 01 — Navigation & Application Shell

## Overview

The application shell is the persistent frame wrapping every screen. It provides the sidebar, topbar, page header, toast system, modal system, and portal switcher. All shell components live in [shell.jsx](../../shell.jsx) and are wired together in [app.jsx](../../app.jsx).

---

## Global State (app.jsx)

| State variable | Type | Purpose |
|---|---|---|
| `active` | `string` | Current screen ID (e.g. `"dashboard"`, `"payroll"`) |
| `subPage` | `object \| null` | Active sub-page overlay with its payload |
| `portalMode` | `"admin" \| "employee"` | Controls which nav and screen map is rendered |
| `currentUserRole` | `string` | Active demo persona (`super_admin`, `hr_manager`, `finance_manager`) |

### Global Navigation Helpers

Exposed to all screens via `window.*` so any component can navigate without prop-drilling:

```js
window.appNav(id)              // navigate to a main admin/employee screen
window.appSub(id, payload)     // open a sub-page overlay
window.switchPortal(mode)      // switch between "admin" and "employee" portals
window.setCurrentUserRole(role)// change the active demo persona
```

---

## 1.1 Sidebar

**File:** `shell.jsx` → `Sidebar` component

The sidebar adapts its nav array based on `portalMode`:
- Admin portal → renders the `NAV` array
- Employee portal → renders the `EMP_NAV` array

### Admin Portal Sections & Screens

| Section | Screen IDs |
|---|---|
| Operate | `dashboard`, `payroll`, `clients`, `contractors`, `expenses`, `reimbursements`, `fnf-settlement`, `salary-increment`, `bank-transfer`, `employees`, `attendance`, `payslips` |
| Compliance | `compliance`, `letters` |
| AI Studio | `copilot`, `anomalies` |
| Governance | `reports`, `payroll-variance`, `headcount-forecast`, `audit`, `support`, `settings` |

### Employee Portal Sections & Screens

| Section | Screen IDs |
|---|---|
| My Space | `emp-dashboard`, `wfh-booking`, `emp-profile`, `my-attendance`, `my-leave`, `biometric-sync` |
| Documents | `my-payslips`, `salary-calculator`, `it-declaration`, `my-reimbursements` |
| Help | `raise-ticket` |

### Live Badges

Nav items carry dynamic badge counts pulled from live data:
- **Payroll** → `"Nov"` (current payroll period label)
- **Expenses** → `"12"` (pending claim count)
- **Reimbursements** → `"5"` (pending claim count)
- **Anomalies** → `"3"` (unresolved anomaly count)
- **My Leave** → count of pending leave requests for `SO-1042`
- **Raise a Ticket** → count of open tickets for `SO-1042`

### Role Picker (Admin only)

The sidebar footer shows the current user's avatar, name, and role. Clicking opens a popover with three demo personas:

| Role key | Name | Title |
|---|---|---|
| `super_admin` | Priya Kapoor | Super Admin |
| `hr_manager` | Rahul Mehta | HR Manager |
| `finance_manager` | Raj Kumar | Finance Manager |

Switching persona calls `window.setCurrentUserRole(role)`, persists to `localStorage`, updates `window.currentUserRole` and `window.isSuperAdmin`, and shows a toast confirmation.

### Sidebar Display Modes

Controlled by the Tweaks Panel `sidebarStyle` setting:
- `"labeled"` (default) — icon + text label
- `"icon"` — icon only, labels shown as tooltips

---

## 1.2 Topbar

**File:** `shell.jsx` → `Topbar` component

| Element | Behaviour |
|---|---|
| **Company Switcher** | Active company code badge + name + employee count. Click to open entity dropdown. Switching shows a toast confirmation. |
| **Portal Toggle** | Admin Portal (green) / Employee Portal (blue) buttons — instant switch via `window.switchPortal()`. |
| **Breadcrumb** | `Portal Name → Screen Name` — always reflects current location. |
| **Live Payroll Chip** | Shows `"Nov payroll · 3 of 6"` — clicking navigates to the `payroll` screen. |
| **Notification Bell** | Red numeric badge shows unread count. Click opens `NotificationsPopover`. |
| **Help Button** | Opens the `help-center` sub-page. |
| **Theme Toggle** | Toggles `data-theme="light"/"dark"` on `<html>`. Shows a toast. |
| **Auto-Save Indicator** | Green dot + "Auto-saved" — confirms localStorage persistence is active. |

---

## 1.3 Notifications Popover

**File:** `interactions.jsx` → `NotificationsPopover`

Rendered via `ReactDOM.createPortal(content, document.body)` — escapes all stacking contexts.

```
Bell click
  └─ setNotifOpen(true)
        └─ ReactDOM.createPortal renders:
              ├── backdrop  z-index: 9998  (rgba(0,0,0,0.45))
              └── panel     z-index: 9999  (anchored to bell rect)
```

- **Mark single read** — decrements badge count via `onUnreadChange`
- **Mark All Read** — zeroes badge count, shows toast
- 8 default notifications covering anomaly alerts, PF deadlines, OT flags, ESI reminders

---

## 1.4 Page Header

**File:** `shell.jsx` → `PageHead` component

Consistent header used by every screen:
- `title` — page name
- `subtitle` — optional context (period, department, etc.)
- `children` — right-aligned action buttons (Export, Add, etc.)

---

## 1.5 Toast System

**File:** `interactions.jsx` → `ToastHost`

```js
window.toast(text, { icon, tone, sub, duration })
```

| Tone | Colour | Use case |
|---|---|---|
| `ok` | Green | Success confirmations |
| `warn` | Amber | Caution / advisory |
| `danger` | Red | Errors, destructive actions |
| `info` | Blue | Informational |
| `ai` | Purple | Atlas AI actions |

- Toasts stack in the top-right corner
- Auto-dismiss after `duration` ms (default 3000)
- Manual dismiss button on each toast

---

## 1.6 Modal System

**File:** `interactions.jsx` → `ModalHost`

```js
window.openModal({ title, subtitle, confirmText, onConfirm })
```

- Rendered via `ReactDOM.createPortal` at `document.body`
- Uses `.drawer-mask` (z-index 100) + `.glass-strong` panel (z-index 101)
- Cancel + Confirm buttons; `confirmText` is customisable per call

---

## 1.7 Sub-Pages

Sub-pages are full-screen overlays that replace the main content area. They receive `onBack` to return to the parent screen. Available sub-pages:

| Sub-page ID | Component | Trigger |
|---|---|---|
| `holiday-calendar` | `HolidayCalendar` | Attendance screen |
| `employee-holiday` | `EmployeeHolidayCalendar` | Employee portal |
| `faq-library` | `FaqLibrary` | Support screen |
| `bot-training` | `BotTraining` | Support screen |
| `scheduled-reports` | `ScheduledReports` | Reports screen |
| `report-builder` | `ReportBuilder` | Reports screen |
| `permission-audit` | `PermissionAudit` | Settings screen |
| `filing-register` | `FilingRegister` | Compliance screen |
| `help-center` | `HelpCenter` | Topbar help button |
| `timesheet-upload` | `TimesheetUpload` | Clients screen |
| `client-payroll` | `ClientPayroll` | Dashboard / Clients |

---

## Related Features

- [25-platform-features.md](25-platform-features.md) — Auto-save, Theme, Tweaks Panel
- [14-roles-access.md](14-roles-access.md) — RBAC and role definitions
- [24-employee-portal.md](24-employee-portal.md) — Employee portal screens
