# Architecture — Component Architecture

## Overview

Source One Payroll Cloud uses a **modular monolith pattern** — no ES module imports. Each `.jsx` file exports its components to `window`, forming a de-facto registry that any subsequent script can consume.

---

## Core Components (common.jsx)

Shared UI primitives used across all screens.

| Component | Props | Purpose |
|---|---|---|
| `Icon` | `name, size, style` | Renders one of 22 named SVG icons |
| `Avatar` | `name, size, hue` | Deterministic colour-coded initials circle |
| `StatusChip` | `label, tone` | Semantic colour-coded badge |
| `MiniMetric` | `icon, label, value, delta, tone` | KPI card used in screen dashboards |
| `Sparkline` | `data[], color, width, height` | Compact inline trend SVG line |
| `Donut` | `segments[], size, thickness` | SVG donut chart |
| `PageHead` | `title, subtitle, children` | Consistent screen page header |

---

## Shell Components (shell.jsx)

| Component | Export | Purpose |
|---|---|---|
| `Sidebar` | `window.Sidebar` | Left navigation — admin and employee nav arrays |
| `Topbar` | `window.Topbar` | Top bar — company switcher, portal toggle, notifications |
| `PageHead` | `window.PageHead` | Screen title + actions slot (re-exported) |
| `NAV` | `window.NAV` | Admin portal navigation items array |
| `EMP_NAV` | `window.EMP_NAV` | Employee portal navigation items array |

---

## Interaction Components (interactions.jsx)

| Component / Function | Export | Purpose |
|---|---|---|
| `ToastHost` | `window.ToastHost` | Renders the toast stack; driven by `window.toast()` |
| `ModalHost` | `window.ModalHost` | Renders the confirmation modal; driven by `window.openModal()` |
| `NotificationsPopover` | (used by Topbar) | Portal-rendered notification panel |
| `useGlobalClickFallback` | (hook, used by App) | Intercepts unhandled button clicks → toasts |
| `window.toast(text, opts)` | global function | Triggers a toast notification |
| `window.openModal(config)` | global function | Opens the confirmation modal |

---

## App State (app.jsx)

The single root component `App` holds all global navigation state.

```
App
├── state: active, subPage, portalMode, currentUserRole
├── globals: window.appNav, window.appSub, window.switchPortal, window.setCurrentUserRole
├── <Sidebar>     — navigation, portal mode, role switcher
├── <Topbar>      — company switcher, portal toggle, notifications
├── <main.canvas> — renders AdminScreen, EmpScreen, or SubScreen
├── <ToastHost>   — global toast overlay
├── <ModalHost>   — global modal overlay
└── <TweaksPanel> — dev panel
```

---

## Screen Component Map

### Admin Screens

| Key | Component | File |
|---|---|---|
| `dashboard` | `Dashboard` | screens/dashboard.jsx |
| `payroll` | `Payroll` | screens/payroll.jsx |
| `clients` | `Clients` | screens/clients.jsx |
| `contractors` | `Contractors` | screens/contractors.jsx |
| `expenses` | `Expenses` | screens/expenses.jsx |
| `reimbursements` | `AdminReimbursements` | screens/admin-reimbursements.jsx |
| `fnf-settlement` | `FnfSettlement` | screens/fnf-settlement.jsx |
| `salary-increment` | `SalaryIncrement` | screens/salary-increment.jsx |
| `bank-transfer` | `BankTransfer` | screens/bank-transfer.jsx |
| `employees` | `Employees` | screens/employees.jsx |
| `attendance` | `Attendance` | screens/attendance.jsx |
| `payslips` | `Payslips` | screens/payslips.jsx |
| `compliance` | `Compliance` | screens/compliance.jsx |
| `letters` | `Letters` | screens/letters.jsx |
| `copilot` | `Copilot` | screens/copilot.jsx |
| `anomalies` | `Anomalies` | screens/anomalies.jsx |
| `reports` | `Reports` | screens/reports.jsx |
| `payroll-variance` | `PayrollVariance` | screens/payroll-variance.jsx |
| `headcount-forecast` | `HeadcountForecast` | screens/headcount-forecast.jsx |
| `audit` | `Audit` | screens/audit.jsx |
| `support` | `Support` | screens/support.jsx |
| `settings` | `Settings` | screens/settings.jsx |

### Employee Screens

| Key | Component | File |
|---|---|---|
| `emp-dashboard` | `EmployeeDashboard` | screens/employee-portal.jsx |
| `my-payslips` | `MyPayslips` | screens/employee-portal.jsx |
| `my-attendance` | `MyAttendance` | screens/employee-portal.jsx |
| `my-leave` | `MyLeave` | screens/employee-portal.jsx |
| `it-declaration` | `ITDeclaration` | screens/employee-portal.jsx |
| `salary-calculator` | `SalaryCalculator` | screens/employee-portal.jsx |
| `my-reimbursements` | `MyReimbursements` | screens/employee-portal.jsx |
| `raise-ticket` | `RaiseTicket` | screens/employee-portal.jsx |
| `wfh-booking` | `WFHBooking` | screens/sub-pages.jsx |
| `emp-profile` | `EmployeeProfile` | screens/sub-pages.jsx |
| `biometric-sync` | `BiometricSync` | screens/sub-pages.jsx |

### Sub-Pages (overlays)

| Key | Component | File |
|---|---|---|
| `holiday-calendar` | `HolidayCalendar` | screens/holiday-calendar.jsx |
| `employee-holiday` | `EmployeeHolidayCalendar` | screens/sub-pages.jsx |
| `faq-library` | `FaqLibrary` | screens/sub-pages.jsx |
| `bot-training` | `BotTraining` | screens/sub-pages.jsx |
| `scheduled-reports` | `ScheduledReports` | screens/sub-pages.jsx |
| `report-builder` | `ReportBuilder` | screens/sub-pages.jsx |
| `permission-audit` | `PermissionAudit` | screens/sub-pages.jsx |
| `filing-register` | `FilingRegister` | screens/sub-pages.jsx |
| `help-center` | `HelpCenter` | screens/sub-pages.jsx |
| `timesheet-upload` | `TimesheetUpload` | screens/clients.jsx |
| `client-payroll` | `ClientPayroll` | screens/clients.jsx |

---

## Portal Architecture (z-index stack)

```
document.body
├── .app-shell (z-index: auto)
│   ├── .sidebar           z-index: 10
│   ├── .topbar            z-index: 10
│   └── .canvas            z-index: auto
│       └── .page          z-index: auto
│
├── .drawer-mask           z-index: 100   ← modal backdrop / drawer overlay
├── .glass-strong (modal)  z-index: 101   ← modal panel
│
├── NotificationsPopover   z-index: 9998/9999  (portal — document.body)
└── ToastHost              z-index: 10000 (portal — document.body)
```

All popovers and modals rendered via `ReactDOM.createPortal(content, document.body)` to escape ancestor stacking contexts.
