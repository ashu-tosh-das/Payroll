# Source One Payroll Cloud — Complete Product Report

> **Version 2.1 | June 2026 | Source One Technologies Pvt. Ltd.**
> Prepared by: Claude Sonnet 4.6 | Based on full codebase audit + browser testing (57/57 checks passed)

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Tech Stack](#2-tech-stack)
3. [Application Architecture](#3-application-architecture)
4. [Data Layer](#4-data-layer)
5. [Design System](#5-design-system)
6. [Admin Portal — All 22 Screens](#6-admin-portal--all-22-screens)
7. [Employee Self-Service Portal — All 11 Screens](#7-employee-self-service-portal--all-11-screens)
8. [Cross-Cutting Platform Features](#8-cross-cutting-platform-features)
9. [Atlas AI Engine](#9-atlas-ai-engine)
10. [Bug Fixes & Changelog](#10-bug-fixes--changelog)
11. [Test Coverage](#11-test-coverage)
12. [Production Readiness](#12-production-readiness)
13. [Glossary](#13-glossary)

---

## 1. Product Overview

**Source One Payroll Cloud** is a full-stack, AI-powered payroll and HR management platform built for Indian enterprises. It runs as a **zero-build, single-page application** served by a Python HTTP server — no compilation, no bundler, no backend required.

### Core Value Proposition

| Pillar | Description |
|---|---|
| End-to-end payroll | From attendance import → pre-flight checks → approval → bank disbursement |
| Statutory compliance | TDS, PF, ESI, PT, LWF — auto-calculated, filed, and tracked |
| AI-first operations | Atlas AI embedded in every workflow — anomaly detection, pre-flight checks, document generation, chatbot |
| Employee self-service | Full employee portal — payslips, leave, IT declaration, reimbursements, support tickets |
| Multi-company support | Manage multiple legal entities under a single login |

### Portal Architecture

| Portal | Accent Colour | Audience | Screens |
|---|---|---|---|
| Admin Portal | Green `#10B981` | HR, Finance, Payroll teams | 22 screens |
| Employee Portal | Blue `#6366F1` | Individual employees | 11 screens |

Single URL, instant switch via topbar toggle — no separate login.

---

## 2. Tech Stack

| Concern | Choice | Why |
|---|---|---|
| **View layer** | React 18 UMD | Zero build setup; JSX compiled in-browser via Babel Standalone |
| **In-browser compiler** | Babel Standalone | Enables JSX without a build pipeline |
| **Icons** | Custom SVG sprite (22 icons) | No CDN dependency; pixel-precise control |
| **Charts** | Custom SVG (no library) | Eliminates 200 KB+ chart library; fully themeable |
| **Fonts** | Inter (Google Fonts) | Non-blocking load via `media="print"` swap trick |
| **Styling** | Plain CSS + CSS custom properties | No Tailwind/CSS-in-JS; token-based theming |
| **Data** | In-memory JS objects (`data.jsx`) | Simulates REST API; props already match real API shapes |
| **Persistence** | `localStorage` (`so_*` prefix) | Zero backend; auto-save for all mutable state |
| **HTTP server** | `python -m http.server 3000` | Single command to run; no Node.js required for the app |

### How to Run

```bash
cd "payroll helper"
python -m http.server 3000
# Open: http://localhost:3000/Source%20One%20Payroll%20Cloud.html
```

### Script Load Order

All `.jsx` files export their components to `window` — no ES module imports. Babel processes them in document order:

```
React 18 UMD + Babel Standalone  →  runtime
data.jsx          →  window.EMPLOYEES, CLIENTS, COMPANIES, fmtINR, persist, loadStore
common.jsx        →  window.Icon, Avatar, MiniMetric, Sparkline, Donut
interactions.jsx  →  window.toast(), openModal(), ToastHost, ModalHost
tweaks-panel.jsx  →  window.TweaksPanel, useTweaks
shell.jsx         →  window.Sidebar, Topbar, PageHead, NAV, EMP_NAV
screens/*.jsx     →  window.Dashboard, Payroll, Employees, ... (22 admin + employee portal)
app.jsx           →  ReactDOM.createRoot('#root').render(<App/>)
```

---

## 3. Application Architecture

### Global State (app.jsx)

```
App
├── active          — current screen ID (e.g. "dashboard")
├── subPage         — active sub-page overlay + its payload
├── portalMode      — "admin" | "employee"
└── currentUserRole — "super_admin" | "hr_manager" | "finance_manager"
```

### Global Navigation Helpers (exposed on `window`)

```js
window.appNav('screen-id')          // navigate to any screen
window.appSub('sub-page-id', data)  // open a sub-page overlay
window.switchPortal('admin')        // switch portal
window.setCurrentUserRole('super_admin')  // switch demo persona
window.toast(text, { tone, sub })   // trigger toast notification
window.openModal({ title, confirmText, onConfirm })  // confirm modal
```

### Z-Index Stack

```
ToastHost              z-index: 10000  (portal → document.body)
NotificationsPopover   z-index: 9998/9999  (portal → document.body)
ModalHost (.drawer-mask / .glass-strong)  z-index: 100/101
Sidebar + Topbar       z-index: 10
Canvas (.page)         z-index: auto
```

All popovers and modals use `ReactDOM.createPortal(content, document.body)` to escape ancestor stacking contexts.

### Sub-Pages (Full-Screen Overlays)

Sub-pages replace the main content area and receive `onBack` to return to the parent screen:

| Sub-page ID | Trigger |
|---|---|
| `holiday-calendar` | Attendance screen |
| `timesheet-upload` | Clients screen |
| `client-payroll` | Dashboard / Clients |
| `filing-register` | Compliance Hub |
| `permission-audit` | Settings |
| `scheduled-reports` | Reports |
| `report-builder` | Reports |
| `faq-library` | Support Center |
| `bot-training` | Support Center |
| `help-center` | Topbar help button |
| `employee-holiday` | Employee portal |

---

## 4. Data Layer

All data lives in `data.jsx` as plain JS arrays exposed on `window`.

### Core Data Globals

| Global | Contents |
|---|---|
| `window.EMPLOYEES` | All employee records (id, name, dept, CTC, PAN, bank, status…) |
| `window.CLIENTS` | Client organisations Source One serves |
| `window.COMPANIES` | 3 Source One legal entities |
| `window.DEPARTMENTS` | Department definitions with colours |
| `window.NOTIFICATIONS` | 8 system notification entries |
| `window.PAYROLL_RUNS` | Monthly payroll run history |
| `window.LEAVE_REQUESTS` | Leave + WFH requests (mutable) |
| `window.TICKETS` | Support ticket records (mutable) |
| `window.ANOMALIES` | Atlas-detected payroll anomalies |

### Persistence API

```js
window.persist('employees', data)     // save to localStorage + update window global
window.loadStore('employees', seed)   // read from localStorage, fallback to seed
window.resetAll()                     // clear all so_* keys + page reload
```

All mutable stores saved under `localStorage["so_" + key]`.

### Demo Companies

| Entity | Employees | Status |
|---|---|---|
| Source One Technologies | 247 | Active |
| Source One Digital Labs | 23 | Active |
| Source One HR Services | 47 | Inactive |

### Demo Personas (for role-switching in sidebar footer)

| Role key | Name | Title |
|---|---|---|
| `super_admin` | Priya Kapoor | Super Admin |
| `hr_manager` | Rahul Mehta | HR Manager |
| `finance_manager` | Raj Kumar | Finance Manager |

---

## 5. Design System

### CSS Architecture

Single stylesheet: `styles.css` — token-based, dark-first.

### Design Tokens (dark mode defaults)

| Token | Value | Purpose |
|---|---|---|
| `--bg` | `#0D1117` | Page background |
| `--bg-2` | `#161B22` | Card / sidebar surface |
| `--bg-3` | `#1E2431` | Input / table header |
| `--accent` | `#10B981` | Primary CTA, active nav (admin) |
| `--success` | `#22C55E` | Positive states, net pay |
| `--warn` | `#F59E0B` | Caution states, deductions |
| `--danger` | `#EF4444` | Errors, rejections |
| `--text` | `#E6EDF3` | Primary text |
| `--text-mid` | `#8B949E` | Secondary text |
| `--text-muted` | `#484F58` | Placeholder, disabled |

Light mode: `[data-theme="light"]` overrides all tokens. Toggle via moon/sun icon in topbar.

### Key Layout Classes

| Class | Purpose |
|---|---|
| `.app-shell` | CSS Grid: sidebar + topbar + canvas |
| `.canvas` | Main area (`overflow: hidden`) |
| `.page` | Screen root (`overflow-y: auto`) |
| `.card` | Surface card with border + padding |
| `.grid .g-cols-N` | CSS Grid with N columns |
| `.row` | Flexbox row |
| `.tbl` | Table base styles |
| `.glass-strong` | Frosted glass popover/modal card |
| `.chip` | Small inline label |

### Typography

- Family: Inter (Google Fonts), system sans-serif fallback
- Scale: 10 px (labels) → 12–13.5 px (body) → 15 px (subheadings) → 20 px (page titles)
- Monospace used for all currency values, IDs, code

---

## 6. Admin Portal — All 22 Screens

### Screen 1 — Dashboard (`dashboard`)
Executive entry point. Provides real-time payroll health snapshot, AI insights, and linked navigation.

| Section | Content |
|---|---|
| KPI Cards (×4) | Monthly Payroll Cost (₹ Cr + sparkline), Headcount, AI Anomalies, Compliance Score |
| Payroll Cost Trend | Line chart with 7M/12M/FY toggle + anomaly stacked bars overlay |
| Dept Cost Donut | Payroll cost share by department with legend |
| Approval Tracker | 6-stage pipeline: Payroll Prepared → Finance → Anomaly Check → HR → CFO → Bank |
| Atlas Insights | AI narrative + 3 recommended actions with tone badges |
| Quick Stats | Avg CTC, Median Tenure, Attrition Rate, Pay Equity Ratio |
| Client Payroll Grid | Per-client summary cards — "View Payroll" opens `ClientPayroll` sub-page for that client |
| Activity Feed | Recent audit trail events (actor, action, target, IP, risk) |
| Compliance Calendar | Upcoming TDS/PF/ESI/PT obligations in next 30 days |

---

### Screen 2 — Payroll Run (`payroll`)
Central workspace for monthly salary processing.

| Section | Content |
|---|---|
| Run Selector | Scrollable period cards (status, ₹ Cr, employee count, anomaly count) |
| Pre-Flight Check | 6 Atlas validations (Pass/Warning/Fail) — blocks Approve if any Fail |
| Client Tabs | All Clients + individual client tabs with generation status |
| IT Declarations | Approve/Reject employee tax declarations; updates TDS computation |
| Cost Breakdown | Earnings (Basic/HRA/SA/LTA/Telephone/PF) + Deductions (PF/PT/TDS) + LOP + Reimbursements + Net Payable |
| Run Health Card | Attendance imported, TDS recomputed, anomalies scanned, bank accounts verified |
| Variance Analysis | Month-on-month change per component with reasons |
| Payslip Register | Paginated table (30/page), filter by dept/pay-type, Export CSV |
| Approval Workflow | 6-stage pipeline with approver names, timestamps, and Approve button |

---

### Screen 3 — Employees (`employees`)
Master employee directory with profile management.

| Section | Content |
|---|---|
| KPI Cards | Active employees, on leave today, in notice, open positions, avg CTC |
| Search & Filters | Full-text search, department, status (Active/Leave/Notice), sort options |
| Employee Table | 11 columns including avatar, ID, dept, designation, CTC, tenure, bank (masked), status |
| Add Employee | Button visible only to `super_admin` role (`window.isSuperAdmin` guard) |
| Profile Drawer | 6 tabs: Overview (PAN/bank/docs), Compensation (CTC history), Attendance, Documents, Activity, Biometric |

---

### Screen 4 — Attendance & Leave (`attendance`)
Workforce presence and leave management.

| Section | Content |
|---|---|
| Live Status Cards | Present, On Leave, WFH, Absent/Unmarked |
| Attendance Heatmap | Monthly calendar — colour-coded by attendance rate (dark green ≥95% → red <80%) |
| Leave Balance | Per-type org-wide summary (PL/SL/CL/WFH) with progress bars |
| Leave Requests | Approve/Decline per row; Bulk Approve All pending |
| Workforce Donut | In Office / WFH / On Leave / Absent split |
| Holiday Admin | Edit/Delete/Add holidays; Publish Changes |
| WFH Requests | Approve/Reject WFH booking requests |
| → Sub-page | `holiday-calendar` — full 2025 holiday calendar with filter by type |

---

### Screen 5 — Anomalies (`anomalies`)  *(nav badge: "3")*
AI-powered payroll integrity detection.

| Section | Content |
|---|---|
| Severity KPIs | High (red), Medium (amber), Low (blue), Detection Rate |
| Trend Chart | 6-month stacked bar chart by severity |
| Anomaly List | Cards with severity badge, confidence %, employee, category (OT/Reimbursement/Variable/Bank), variance ₹ |
| Detail Panel | Atlas Reasoning (AI narrative + suggested action), Evidence Chart (6M bar), Statistical Signals (σ deviation), Decision Timeline |
| Alert Email | Formatted email preview for manager notification |
| Actions | Preview Alert Email, Escalate to Payroll, Dismiss, Hold & Review |

---

### Screen 6 — AI Copilot (`copilot`)
Conversational interface to Atlas AI.

| Section | Content |
|---|---|
| Chat Interface | User bubbles (right) + Atlas cards (left, green gradient) with model label, token count, response time |
| Rich Blocks | Callout cards (warning/error/info), summary cards, inline data tables |
| Suggested Prompts | 4 pre-built quick prompts (variance, anomaly, compliance, employee query) |
| Input Controls | Text, Voice, Tools, Send |
| Persistence | Full thread in `sessionStorage`; restore banner on return; New Chat / History buttons |

---

### Screen 7 — Payslips (`payslips`)
Payslip generation and distribution.

| Section | Content |
|---|---|
| Distribution KPIs | Generated %, E-Delivered %, Opened %, Disputes count |
| Employee Selector | Left panel — search + period dropdown + scrollable employee list |
| Payslip Document | Company header, employee grid, Earnings table, Deductions table, Net Pay box (₹ amount + words), footer with hash |
| Actions | Preview PDF, Download, Email |

---

### Screen 8 — Compliance Hub (`compliance`)
Statutory filing management.

| Tab | Content |
|---|---|
| Upcoming Filings | Obligation list (TDS·192, PF/EPFO, ESI/ESIC, PT, LWF, Form 24Q) + detail panel with calculation breakdown + Atlas compliance check + Generate & File |
| Filing History | Table by period × statutory type — amount, status, timestamp, Download |
| Form 16 Batch | Bulk manage annual Form 16: Generate, Digitally Sign, E-Deliver, Bulk Download ZIP |
| → Sub-page | `filing-register` — full historical filing register |

---

### Screen 9 — Letters & Documents (`letters`)
HR letter generation and delivery.

| Section | Content |
|---|---|
| Activity Metrics | 186 letters/month, 76% Atlas auto-generated, 84 e-signed, 42 min avg turnaround |
| 8 Templates | Salary Certificate, Offer Letter, Experience Letter, Increment Letter, Appointment Letter, Relieving Letter, Promotion Letter, Warning Letter |
| Employee Selector | Atlas recommends template based on employee status |
| Variable Editor | `{{variable}}` fields with auto-fill indicators (green ✓) |
| Delivery Channels | PDF Download, Email, Self-Service Portal, WhatsApp link, DocuSign E-Sign |
| Document Preview | Real-time letterhead preview with resolved variables |
| Recent Letters Log | Letter ID, template, employee, channel, status, download |

---

### Screen 10 — Reports & Analytics (`reports`)
Report library and interactive analytics.

| Section | Content |
|---|---|
| Summary Stats | 42 reports, 186 downloads/month, 4 scheduled, 100% compliance-ready |
| Featured Analytics | Salary Distribution Histogram, Department Cost Share, Location Distribution |
| Category Tabs | All / Finance / Tax / Statutory / Analytics / Audit |
| Report Cards | File type icon, name, period, size, Preview / Download / Schedule buttons |
| Key Reports | Monthly Payroll Register, Form 16 ZIP, PF/ESI Challan, TDS 24Q, Dept Cost Allocation, HC & Attrition, Bank Advice, Variable Pay Audit, Leave Liability |
| → Sub-pages | `scheduled-reports`, `report-builder` |

---

### Screen 11 — Audit Log (`audit`)
Immutable tamper-evident event log.

| Section | Content |
|---|---|
| Real-Time Metrics | Events/24h, High-risk events, Active sessions, Integrity hash status (VALID ✓) |
| Search & Filter | Free-text, action type, actor type (Human/System/AI), risk tabs (All/High/Medium/Low) |
| Event Table | Event ID, Actor (avatar/gear/sparkle), Action (colour chip), Target, Source IP, Risk, Timestamp |
| Integrity Card | SHA-256 chain head hash anchored to AWS QLDB |
| Risk Distribution | Critical/High/Medium/Low proportional bars |
| Compliance Status | SOC 2 Type II, ISO 27001, GDPR/DPDP, Data Residency (India), AES-256 encryption |

---

### Screen 12 — Support Center (`support`)
AI-first helpdesk with 71% bot deflection.

| Section | Content |
|---|---|
| Metrics | Open, In Progress, Resolved/7d, Bot Deflection Rate (71%) |
| Ticket List | Filter tabs: All/Open/Mine/Bot; columns: ID, subject, employee, category, channel, priority, assignee, status |
| Ticket Detail | Conversation thread (employee bubble, Atlas green card with action chips, agent replies) |
| Reply Box | Text input, Suggest (Atlas-generated), Attach, Send, Quick actions (Assign/KB/Resolve) |
| Category Chart | Horizontal bars: Payroll query, Reimbursement, Leave, IT Declaration, Bank change, Other |
| → Sub-pages | `faq-library`, `bot-training` |

---

### Screen 13 — Roles & Access (`settings`)
RBAC administration and security policy.

| Section | Content |
|---|---|
| Overview Metrics | 6 active roles, 302 users, 98% 2FA enrolled |
| Create New Role | Name, description, colour, inherit permissions from existing role |
| Roles List | System roles (Super Admin, Payroll Manager, Finance, HR Business Partner, People Manager, Employee) + custom roles |
| Permissions Matrix | 8 toggles per role: view payslips, edit compensation, run payroll, approve payroll, export PII, edit bank details, view audit log, manage roles |
| Security Policy | 2FA (Required/Optional), Session timeout (30 min), IP Allowlist, Privileged MFA |
| Members Preview | Up to 6 employees per role with remove option |
| Developer Tools | Reset to Demo Data (`window.resetAll()`), View Persisted Stores |
| → Sub-page | `permission-audit` |

---

### Screen 14 — Payroll Variance (`payroll-variance`)
Month-on-month payroll comparison.

Components analysed: Gross Salary, Variable Pay & Bonus, Overtime, Reimbursements, TDS, Net Pay.
Each row: previous month → current month → ₹ change → % change → reason (New joiners / Appraisal cycle / LOP / One-time bonus).
Visual: green bars (cost decrease) / red bars (cost increase).

---

### Screen 15 — F&F Settlement (`fnf-settlement`)
Full financial close-out for exiting employees.

Auto-calculates: outstanding salary (pro-rated), leave encashment (unused PL × daily rate), gratuity (service ≥ 5 years), bonus (proportionate), notice period recovery, loan recovery, TDS on F&F.
Auto-generates: Experience Letter, Relieving Letter, Settlement Breakup PDF, Form 16 Part-A.
Approval chain: Manager → HR → Finance → Bank disbursement.

---

### Screen 16 — Salary Revision (`salary-increment`)
Appraisal cycle and increment management.

Inline-editable proposed CTC + reason per employee. Policy validation (e.g., max 30% for standard increment). Bulk CSV import. Department-wide flat %. Auto-generates Increment Letters for all approved revisions.

---

### Screen 17 — Headcount Forecast (`headcount-forecast`)
Workforce growth and cost projections.

Per-month table: projected headcount, expected hires, projected exits, net change, projected payroll cost, confidence intervals (optimistic/base/conservative). Department-level breakdown. Interactive scenario planning — adjust growth/attrition assumptions and see real-time projection updates.

---

### Screen 18 — Bank Transfer (`bank-transfer`)
Salary disbursement file generator.

Generates HDFC NEFT/RTGS transfer file or NACH bulk file. Per-employee table: bank, IFSC, masked account, net pay, status (Validated/Pending/Error). Penny test (₹1 test transaction). Reconciliation via bank confirmation file upload.

---

### Screen 19 — Clients (`clients`)
Client organisation management.

Client directory with code, name, industry, location, contact, status. Per-client payroll status. Timesheet upload sub-page (`timesheet-upload`) for importing attendance CSV. "View Payroll" → `client-payroll` sub-page.

---

### Screen 20 — Contractors (`contractors`)
Contract worker invoicing and payment pipeline.

5-stage visual funnel: Submitted → Validated → Approved → TDS Applied → Paid. 7-column table (horizontally scrollable) per contractor. Per-contractor detail panel with YTD amount, invoice list, and Add Invoice form.

---

### Screen 21 — Expenses (`expenses`)  *(nav badge: "12")*
Corporate expense management with AI policy validation.

Multi-channel submission tracking (WhatsApp/Slack/Mobile/Email). Per-claim detail panel: receipt preview, Atlas risk score, policy check result, Approve/Reject/Hold. Inline policy rule management with per-category limits and toggles.

---

### Screen 22 — Reimbursements Admin (`reimbursements`)  *(nav badge: "5")*
Admin view of employee reimbursement claims.

Queue with Approve/Reject/Flag per claim. Atlas-flagged claims highlighted (duplicate/policy breach). Approved claims automatically included in next payroll run reimbursement line item.

---

## 7. Employee Self-Service Portal — All 11 Screens

| Screen ID | Screen | Key Features |
|---|---|---|
| `emp-dashboard` | Employee Dashboard | Next salary date, leave balances, recent docs, quick action links |
| `my-payslips` | My Payslips | Period selector, payslip archive, Preview / Download / Email per payslip |
| `my-attendance` | My Attendance | Personal heatmap, daily punch times, leave balance bars, WFH usage |
| `my-leave` | My Leave | Leave application form, policy display, leave history, cancel pending |
| `wfh-booking` | WFH Booking | Calendar-based WFH request interface, policy reminder |
| `emp-profile` | My Profile | Edit personal details, document upload, bank change request |
| `it-declaration` | IT Declaration | 80C / HRA / 80D / NPS real-time TDS recalculation; Submit for HR approval |
| `salary-calculator` | Salary Calculator | Gross CTC input → live breakdown of take-home pay |
| `my-reimbursements` | My Reimbursements | Submit claim (category/amount/proof upload); claims history |
| `raise-ticket` | Raise a Ticket | New ticket form; full conversation thread history; reply to existing tickets |
| `biometric-sync` | Biometric Sync | Enrolment status, last 5 punch records, Request Re-enrolment |

---

## 8. Cross-Cutting Platform Features

### Auto-Save (localStorage)

All mutable data persisted automatically under `so_*` keys. The topbar shows a green "Auto-saved" dot at all times. `window.resetAll()` clears everything and reloads with original seed data.

### Toast Notifications

```js
window.toast(text, { tone: 'ok'|'warn'|'danger'|'info'|'ai', sub, duration })
```
Stacks in top-right corner, auto-dismisses after 3 s (default). Five tones: green/amber/red/blue/purple.

### Confirmation Modal

```js
window.openModal({ title, subtitle, confirmText, onConfirm })
```
Portal-rendered at `document.body` — always above everything. Uses `.drawer-mask` (z-100) + `.glass-strong` panel (z-101).

### Multi-Company Switcher

Company Switcher in topbar — switch between 3 legal entities instantly. Each entity has its own dataset context. Toast confirms the switch.

### Dark / Light Theme

Full dark-first + light mode. Toggle via moon/sun icon in topbar. Applied via `data-theme` attribute on `<html>`. Toast confirmation on switch.

### Tweaks Panel

Dev-mode side panel: sidebar style (labeled/icon), density (compact/comfortable), direct navigation buttons for all 22 admin screens.

### Super Admin Role Guard

`window.isSuperAdmin` is `true` only when `super_admin` persona is active. Used to gate the Add Employee button in the Employees screen (and can gate any feature).

### Global Click Fallback

`useGlobalClickFallback()` intercepts `.btn` clicks with no React `onClick` handler and maps button labels to contextual toasts — safety net for prototype/demo buttons.

---

## 9. Atlas AI Engine

Atlas is the unified AI engine embedded across the platform. It operates in both **autonomous** (background scan) and **conversational** (Copilot chat) modes.

| Capability | Screen | Description |
|---|---|---|
| **Anomaly detection** | Anomalies | Statistical scan of every payroll run; surfaces outliers with confidence score and σ deviation |
| **Pre-flight validation** | Payroll Run | 6 integrity checks before a run can be approved; blocks on Fail |
| **Compliance recommendations** | Compliance Hub | Reviews calculations before challan submission; checks PAN-Aadhaar link, auto-filing eligibility |
| **Document generation** | Letters | Auto-populates all HR letter variables from the HR database; recommends template based on employee status |
| **Support chatbot (Tier 1)** | Support Center | Handles common queries autonomously; **71% deflection rate**; generates suggested replies for agents |
| **Conversational analytics** | Copilot | Natural-language payroll query interface; cites data source per response |
| **Anomaly explanation** | Anomalies | Plain-English reasoning card per anomaly with evidence chart and suggested corrective action |
| **Pre-fill & recommendation** | Dashboard | Plain-English narrative and 3 recommended actions on the AI Insights card |

---

## 10. Bug Fixes & Changelog

### v2.1 — June 2026

| ID | Severity | File | Bug | Fix |
|---|---|---|---|---|
| **HOL-001** | Medium | `screens/holiday-calendar.jsx` | `HOLIDAYS_2025` array had no `id` fields → `key={h.id}` always `undefined` → React "Each child in a list should have a unique key prop" warning on every Attendance render | Added `id: "HOL-01"` through `"HOL-15"` to all 15 static holiday entries |
| **CTR-001** | Medium | `screens/contractors.jsx` | Contractors table (7 columns) clipped at card boundary — card had `overflow: hidden` but no horizontal scroll wrapper | Wrapped `<table>` in `<div style={{ overflowX: "auto" }}>` (same pattern as clients.jsx and employees.jsx) |

### v2.0 — June 2026

| ID | Type | Change |
|---|---|---|
| **UX-001** | Enhancement | Removed search bar from Topbar — breadcrumb and payroll chip more prominent |
| **NOTIF-001** | Fix + Enhancement | NOTIFICATIONS expanded 3 → 8 entries; live numeric unread badge; `markRead`/`markAllRead` decrement badge in real-time |
| **NOTIF-002** | Bug fix | Notification panel rendering behind dashboard cards → fixed with `ReactDOM.createPortal` at `document.body` (z-index 9998/9999) |
| **EXPORT-001** | Bug fix | All export/download buttons now have explicit `onClick` handlers with named toasts |
| **CLIENT-001** | Enhancement | Dashboard client card "View Payroll →" now opens `ClientPayroll` sub-page pre-filtered to that client |

---

## 11. Test Coverage

Comprehensive Playwright test suite: **[mcp-browser-test.js](../mcp-browser-test.js)**

| Category | Count |
|---|---|
| Admin screens verified | 22 |
| Employee portal screens verified | 7 |
| Interactive feature checks | 28 |
| **Total checks** | **57** |
| **Failures** | **0** |
| Screenshots captured | 28 |

**Features tested beyond screen render:**
- Full-text employee search (filter + table update)
- Sidebar role switcher (persona change + toast)
- Super Admin guard (Add Employee button visibility)
- Add Employee drawer open/close
- Employee profile drawer tabs
- Attendance heatmap presence
- Payslip ₹ symbol rendering
- Settings role names
- Contractors table horizontal scroll
- Anomalies list and detail panel
- Toast notification trigger and visibility
- Modal open via `window.openModal()`
- Zero JS console errors end-to-end

Run:
```bash
node mcp-browser-test.js
```

---

## 12. Production Readiness

The application is fully functional as a demo/prototype. For production deployment:

| Item | Current state | What to do |
|---|---|---|
| **Authentication** | Sidebar footer and Topbar user widget ready | Wire JWT/session provider; add role-based route guards |
| **API integration** | `data.jsx` in-memory arrays | Replace with `fetch()` calls; prop interfaces already match API shapes |
| **Build pipeline** | Babel Standalone (~900 KB in-browser) | Replace with Vite or esbuild; all files are already modular |
| **Real-time notifications** | Static `NOTIFICATIONS` array | Swap for WebSocket or Server-Sent Events feed; `markRead`/`onUnreadChange` wiring ready |
| **E2E tests** | `mcp-browser-test.js` (57 checks) | Extend to cover Payroll workflow, Employee CRUD, Client deep-links |
| **Responsive** | Designed for desktop 1440×900 | Add breakpoints for tablet/mobile if needed |

---

## 13. Glossary

| Term | Definition |
|---|---|
| **Atlas** | The AI engine powering anomaly detection, pre-flight checks, compliance recommendations, document generation, support chatbot, and the Copilot chat interface |
| **CTC** | Cost to Company — total annual compensation inclusive of all components and employer contributions |
| **TDS** | Tax Deducted at Source — monthly income tax deducted from salaries and remitted to the Income Tax Department |
| **PF / EPF** | Provident Fund — mandatory retirement savings at 12% of basic salary (employee + employer), managed by EPFO |
| **ESI** | Employees' State Insurance — statutory health/social security for employees earning ≤ ₹21,000/month |
| **PT** | Professional Tax — state-level employment tax (Karnataka rate used in this platform) |
| **LWF** | Labour Welfare Fund — state-mandated contribution for employee welfare activities |
| **LOP** | Loss of Pay — salary deduction for unauthorised absences or excess leave taken |
| **F&F Settlement** | Full and Final Settlement — complete financial close-out for an exiting employee |
| **HRA** | House Rent Allowance — salary component for rental accommodation; partially tax-exempt |
| **UAN** | Universal Account Number — permanent 12-digit EPF member ID portable across employers |
| **Form 16** | Annual TDS certificate issued by employer to employee; used for income tax filing |
| **24Q** | Quarterly TDS return filed by employers detailing TDS deducted on salaries |
| **RBAC** | Role-Based Access Control — access governed by assigned roles, not individual grants |
| **NACH** | National Automated Clearing House — bulk payment system by NPCI for salary disbursement |
| **QLDB** | AWS Quantum Ledger Database — immutable, cryptographically verifiable ledger anchoring the Audit Log hash chain |
| **Pre-flight Check** | Atlas's automated validation suite that runs before a payroll run can be approved |
| **Anomaly** | A statistical outlier detected by Atlas — e.g., OT spike >3σ, duplicate expense, unexplained salary variance |
| **Sub-page** | A full-screen overlay that replaces the main canvas and receives `onBack` to return to the parent screen |
| **Portal** | One of two distinct app experiences — Admin Portal (green) for HR/Finance, Employee Portal (blue) for individual employees |

---

*Source One Payroll Cloud — Product Report v2.1 — June 2026*  
*Authored by Claude Sonnet 4.6 | Source One Technologies Pvt. Ltd.*
